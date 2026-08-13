// bake the last 52 weeks of commits (forgejo heatmap API + github
// contributions page) as JSON for the hover contribution chart: stdout.
const USER = "harivansh-afk";
const FORGEJO = "https://git.harivan.sh";

const counts = new Map(); // 'YYYY-MM-DD' -> contributions
const key = (d) => d.toISOString().slice(0, 10);

async function forgejo() {
  const res = await fetch(`${FORGEJO}/api/v1/users/${USER}/heatmap`);
  if (!res.ok) throw new Error(`forgejo ${res.status}`);
  for (const { timestamp, contributions } of await res.json()) {
    const k = key(new Date(timestamp * 1000));
    counts.set(k, (counts.get(k) || 0) + contributions);
  }
}

async function github() {
  const res = await fetch(`https://github.com/users/${USER}/contributions`, {
    headers: { "user-agent": "harivan.sh build (heatmap)" },
  });
  if (!res.ok) throw new Error(`github ${res.status}`);
  const html = await res.text();
  const cells = new Map(); // element id -> date
  for (const m of html.matchAll(/id="([^"]+)"[^>]*data-date="(\d{4}-\d\d-\d\d)"/g)) cells.set(m[1], m[2]);
  for (const m of html.matchAll(/data-date="(\d{4}-\d\d-\d\d)"[^>]*id="([^"]+)"/g)) cells.set(m[2], m[1]);
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)</g)) {
    const date = cells.get(m[1]);
    if (!date) continue;
    const n = /^no contributions/i.test(m[2].trim()) ? 0 : parseInt(m[2], 10);
    if (Number.isFinite(n) && n > 0) counts.set(date, (counts.get(date) || 0) + n);
  }
}

const results = await Promise.allSettled([forgejo(), github()]);
const failed = results.filter((r) => r.status === "rejected");
for (const f of failed) console.error(`heatmap: ${f.reason}`);
if (failed.length === results.length) {
  console.error("heatmap: no sources reachable");
  process.exit(1);
}

// grid: sunday-start weeks ending on today's week, like github's calendar
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const start = new Date(today);
start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());

let total = 0;
const nonzero = [];
const days = [];
for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
  const n = counts.get(key(d)) || 0;
  days.push([key(d), n]);
  total += n;
  if (n > 0) nonzero.push(n);
}

// percentile thresholds over active days: max-scaled levels flatten the
// whole year to one shade when a few peak days dominate
nonzero.sort((a, b) => a - b);
const pct = (p) => nonzero[Math.min(nonzero.length - 1, Math.floor(p * nonzero.length))] || 1;
const t = [pct(0.25), pct(0.5), pct(0.75)];
const level = (n) => (n === 0 ? 0 : n <= t[0] ? 1 : n <= t[1] ? 2 : n <= t[2] ? 3 : 4);

console.log(
  JSON.stringify({
    total,
    days: days.map(([date, n]) => [date, n, level(n)]),
  }),
);
