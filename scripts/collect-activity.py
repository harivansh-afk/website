#!/usr/bin/env python3
"""Collect the last 7 days of commit activity from git.harivan.sh and GitHub.

Writes data/activity.json for the /open-source/ page:
  - public repos: ranked rows with per-repo commit counts and sources
  - private repos: aggregate counts only (names never leave this box)

Mirrored repos (same basename on both forges) are merged; commits are
deduplicated by sha so a mirror never double-counts.

Tokens (both optional, read-only use):
  - FORGEJO_TOKEN env, else parsed from ~/.config/tea/config.yml
    (without it, only public Forgejo repos are visible)
  - GITHUB_TOKEN env, else `gh auth token`
    (without it, GitHub search skips private repos and rate-limits hard)

Caveat: GitHub commit search indexes the default branch only, so GitHub
counts miss unmerged branch work. Forgejo counts walk the default branch
commit log and stop at the window edge (its commits API ignores `since`
and caps `limit` at 50, so the window is enforced client-side).

Stdlib only. Run: uv run scripts/collect-activity.py
"""

import datetime
import json
import os
import pathlib
import re
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request

FORGEJO_URL = "https://git.harivan.sh"
FORGEJO_USER = "harivansh-afk"
GITHUB_USER = "harivansh-afk"
# commit author identities that count as "me"
IDENTITIES = {
    "harivansh-afk",
    "hari@ix.dev",
    "rathiharivansh@gmail.com",
    "harivansh rathi",
}
DAYS = 7
OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "activity.json"


def _ssl_context():
    # uv-managed pythons miss the system CA bundle on NixOS; point at it
    if not os.environ.get("SSL_CERT_FILE"):
        for path in (
            "/etc/ssl/certs/ca-certificates.crt",
            "/etc/ssl/certs/ca-bundle.crt",
        ):
            if os.path.exists(path):
                os.environ["SSL_CERT_FILE"] = path
                break
    return ssl.create_default_context()


CTX = _ssl_context()


def get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    # cloudflare fronts git.harivan.sh and 403s the default Python-urllib UA
    req.add_header("User-Agent", "harivan.sh-activity-collector (+https://harivan.sh)")
    with urllib.request.urlopen(req, timeout=30, context=CTX) as resp:
        return json.load(resp)


def forgejo_token():
    if os.environ.get("FORGEJO_TOKEN"):
        return os.environ["FORGEJO_TOKEN"]
    cfg = pathlib.Path.home() / ".config" / "tea" / "config.yml"
    if not cfg.exists():
        return None
    # naive yaml walk: find the login block for FORGEJO_URL, grab its token
    token, in_block = None, False
    for line in cfg.read_text().splitlines():
        if re.match(r"\s*url:", line):
            in_block = FORGEJO_URL in line
        m = re.match(r"\s*token:\s*(\S+)", line)
        if in_block and m:
            token = m.group(1)
    return token


def github_token():
    if os.environ.get("GITHUB_TOKEN"):
        return os.environ["GITHUB_TOKEN"]
    try:
        out = subprocess.run(
            ["gh", "auth", "token"], capture_output=True, text=True, timeout=10
        )
        return out.stdout.strip() or None
    except (OSError, subprocess.TimeoutExpired):
        return None


def is_me(commit):
    """Forgejo/Gitea commit object -> did I author it."""
    author = commit.get("author") or {}
    if (author.get("login") or "").lower() in IDENTITIES:
        return True
    inner = (commit.get("commit") or {}).get("author") or {}
    return (
        (inner.get("email") or "").lower() in IDENTITIES
        or (inner.get("name") or "").lower() in IDENTITIES
    )


def parse_dt(stamp):
    return datetime.datetime.fromisoformat(stamp.replace("Z", "+00:00"))


def forgejo_activity(since_dt, token):
    headers = {"Authorization": f"token {token}"} if token else {}
    repos, page = [], 1
    path = "/api/v1/user/repos" if token else f"/api/v1/users/{FORGEJO_USER}/repos"
    while True:
        batch = get(f"{FORGEJO_URL}{path}?limit=50&page={page}", headers)
        repos += batch
        if len(batch) < 50:
            break
        page += 1

    out = []
    for repo in repos:
        if repo.get("empty") or parse_dt(repo["updated_at"]) < since_dt:
            continue
        # walk the commit log newest-first; the API ignores `since` and caps
        # `limit` at 50, so filter by date and stop once we pass the window
        shas, page, past_window = set(), 1, False
        while not past_window:
            q = urllib.parse.urlencode(
                {"limit": 50, "page": page,
                 "stat": "false", "verification": "false", "files": "false"}
            )
            try:
                batch = get(
                    f"{FORGEJO_URL}/api/v1/repos/{repo['full_name']}/commits?{q}",
                    headers,
                )
            except urllib.error.HTTPError as err:
                if err.code == 409:  # repo has no commits
                    break
                raise
            if not batch:
                break
            for commit in batch:
                when = parse_dt(commit["commit"]["committer"]["date"])
                if when < since_dt:
                    past_window = True
                elif is_me(commit):
                    shas.add(commit["sha"])
            page += 1
        if shas:
            out.append({
                "name": repo["name"],
                "url": repo["html_url"],
                "private": repo["private"],
                "source": "git.harivan.sh",
                "shas": shas,
            })
    return out


def github_activity(since_dt, token):
    if not token:
        print("warn: no github token, skipping github", file=sys.stderr)
        return []
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
    }
    day = since_dt.strftime("%Y-%m-%d")
    by_repo, page = {}, 1
    while True:
        q = urllib.parse.urlencode(
            {"q": f"author:{GITHUB_USER} author-date:>={day}",
             "per_page": 100, "page": page}
        )
        data = get(f"https://api.github.com/search/commits?{q}", headers)
        for item in data.get("items", []):
            repo = item["repository"]
            row = by_repo.setdefault(
                repo["full_name"],
                {
                    "name": repo["name"],
                    "url": repo["html_url"],
                    "private": repo["private"],
                    "source": "github",
                    "shas": set(),
                },
            )
            row["shas"].add(item["sha"])
        if page * 100 >= min(data.get("total_count", 0), 1000):
            break
        page += 1
    return list(by_repo.values())


def merge(rows):
    """Merge by repo basename across forges, dedup commits by sha."""
    merged = {}
    for row in rows:
        key = row["name"].lower()
        slot = merged.setdefault(
            key, {"name": row["name"], "url": None, "private": row["private"],
                  "sources": set(), "shas": set()}
        )
        slot["shas"] |= row["shas"]
        slot["sources"].add(row["source"])
        # a repo public anywhere is public
        slot["private"] = slot["private"] and row["private"]
        # prefer the personal forge link
        if slot["url"] is None or row["source"] == "git.harivan.sh":
            slot["url"] = row["url"]
    return merged.values()


def main():
    now = datetime.datetime.now(datetime.timezone.utc)
    start = now - datetime.timedelta(days=DAYS)

    rows = forgejo_activity(start, forgejo_token()) + github_activity(
        start, github_token()
    )

    public, closed_commits, closed_repos = [], 0, 0
    for slot in merge(rows):
        if slot["private"]:
            closed_commits += len(slot["shas"])
            closed_repos += 1
        else:
            public.append({
                "name": slot["name"],
                "url": slot["url"],
                "commits": len(slot["shas"]),
                "sources": sorted(slot["sources"]),
            })
    public.sort(key=lambda r: (-r["commits"], r["name"]))

    week = f"{start.strftime('%b %d').lower()} - {now.strftime('%b %d').lower()}"
    week = re.sub(r" 0(\d)", r" \1", week)
    result = {
        "generated": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "week": week,
        "public": public,
        "closed": {"commits": closed_commits, "repos": closed_repos},
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, indent=2) + "\n")
    print(
        f"{sum(r['commits'] for r in public)} public commits in "
        f"{len(public)} repos, {closed_commits} closed in {closed_repos}; "
        f"wrote {OUT}",
        file=sys.stderr,
    )


if __name__ == "__main__":
    main()
