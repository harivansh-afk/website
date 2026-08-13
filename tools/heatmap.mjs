// bake a monotone text heatmap of the last 52 weeks of commits
// (forgejo heatmap API + github contributions page) to stdout.
const USER = "harivansh-afk";
const FORGEJO = "https://git.harivan.sh";
const SHADES = ["·", "░", "▒", "▓", "█"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

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

// grid: columns are weeks (sunday-start), ending on today's week
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const start = new Date(today);
start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());
const weeks = [];
let total = 0;
let max = 0;
for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
  if (d.getUTCDay() === 0) weeks.push(new Array(7).fill(null));
  const n = counts.get(key(d)) || 0;
  weeks[weeks.length - 1][d.getUTCDay()] = n;
  total += n;
  max = Math.max(max, n);
}

const shade = (n) => {
  if (n === null) return " ";
  if (n === 0) return SHADES[0];
  const q = Math.ceil((n / max) * 4);
  return SHADES[Math.max(1, Math.min(4, q))];
};

// month labels above the first full week of each month
let header = "";
for (let w = 0; w < weeks.length; w++) {
  const d = new Date(start);
  d.setUTCDate(d.getUTCDate() + w * 7);
  const label = d.getUTCDate() <= 7 ? MONTHS[d.getUTCMonth()] : null;
  if (label && header.length <= w && w + label.length <= weeks.length) header = header.padEnd(w) + label;
}
header = header.padEnd(weeks.length);

const rowLabel = ["   ", "mon", "   ", "wed", "   ", "fri", "   "];
const lines = ["    " + header];
for (let day = 0; day < 7; day++) {
  lines.push(rowLabel[day] + " " + weeks.map((w) => shade(w[day])).join(""));
}
lines.push("");
lines.push(`${total} commits in the last year`);
console.log(lines.join("\n"));
