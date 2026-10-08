// bake view counts into dist/views.json: {views: {href: n}}. a thought's count
// is its site reads (the hit log) + its x post's views (`x` in thoughts.js,
// via the fxtwitter api) + its `seed`. the log also marks page loads (`e`),
// which nothing reads yet.
//
// the hit log is Caddy's: the page beacon (POST /counter/hit?p=<path>[&e=1])
// is answered with a 204 and written, without ip or headers, one JSON line per
// hit (see hosts/spark/services/website.nix in the nix repo). it is never
// rolled, so the counts can always be rebuilt from it. an unreadable log (a
// laptop build) counts as empty; a failed x lookup keeps the last baked value
import { readFile, writeFile, rename, access } from "node:fs/promises";
import { thoughts } from "../src/lib/thoughts.js";

const LOG = process.env.WEBSITE_HITS_LOG ?? "/var/log/caddy/harivan.sh-hits.log";
const OUT = new URL("../dist/views.json", import.meta.url);
const DIST = new URL("../dist/", import.meta.url);

async function hits() {
  let text = "";
  try {
    text = await readFile(LOG, "utf8");
  } catch (err) {
    console.error(`views: no hit log (${err.code}), counting none`);
  }
  const paths = new Map(); // path -> hits
  for (const line of text.split("\n")) {
    if (!line) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue; // a torn last line while caddy writes
    }
    if (entry.status !== 204) continue;
    const url = new URL(entry.request.uri, "https://harivan.sh");
    if (url.pathname !== "/counter/hit") continue;
    const path = url.searchParams.get("p");
    if (path) paths.set(path, (paths.get(path) ?? 0) + 1);
  }
  return paths;
}

async function xViews(id) {
  const res = await fetch(`https://api.fxtwitter.com/HarivanshRathi/status/${id}`, {
    headers: { "user-agent": "harivan.sh build (views)" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`fxtwitter ${res.status}`);
  const views = (await res.json()).tweet?.views;
  if (!Number.isInteger(views)) throw new Error("fxtwitter: no view count");
  return views;
}

async function previous() {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return { views: {}, x: {} };
  }
}

await access(DIST).catch(() => {
  console.error("views: no dist/, build first");
  process.exit(1);
});

const [paths, last] = await Promise.all([hits(), previous()]);

const x = {};
await Promise.all(
  thoughts
    .filter((t) => t.x)
    .map(async (t) => {
      try {
        x[t.x] = await xViews(t.x);
      } catch (err) {
        console.error(`views: ${t.title}: ${err.message}`);
        if (last.x?.[t.x] !== undefined) x[t.x] = last.x[t.x];
      }
    }),
);

const views = {};
for (const t of thoughts) {
  views[t.href] = (t.seed ?? 0) + (paths.get(t.href) ?? 0) + (x[t.x] ?? 0);
}

// written whole, then renamed over, so a fetch never sees half a file
const tmp = new URL("../dist/views.json.tmp", import.meta.url);
await writeFile(tmp, JSON.stringify({ views, x }) + "\n");
await rename(tmp, OUT);
