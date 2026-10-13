// a 1:1 editor for the /software canvas: the built page (its exact css and
// markup, scripts stripped, fonts inlined so it renders the same from a
// file) with its 24 columns drawn over it and every piece draggable. it
// prints each piece's `canvas` placement for src/lib/software.js.
//
//   ./build.sh && node tools/grid.mjs     writes grid.html (gitignored)
//
// drag a piece to move it: across snaps its start column, down sets its
// drop (rem). drag either edge to resize it by columns (the cursor turns); the
// other edge stays put. shift-drag across sets x (rem) instead. alt makes
// any drag free (no snapping).
// keys on the selected piece: ← → column, ↑ ↓ drop, shift+← → x,
// [ ] span. g toggles the columns, h the panel.
import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const html = await readFile(new URL("dist/software/index.html", root), "utf8");

const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)[1].replace(/<script[\s\S]*?<\/script>/g, "");

// fonts can't load cross-origin from a file, so the faces this page shows go
// in as data; the rest are dropped
const EMBED = ["SuisseIntl-Light.woff2", "SuisseIntl-Medium.woff2", "DepartureMono-Regular.woff2"];
const fonts = {};
for (const f of EMBED) fonts[f] = (await readFile(new URL(`static/fonts/${f}`, root))).toString("base64");
const pageCss = css.replace(/url\(\/fonts\/([^)?]+)[^)]*\)/g, (_, f) =>
  fonts[f] ? `url(data:font/woff2;base64,${fonts[f]})` : "url(about:blank)",
);
// images load fine cross-origin
const pageBody = body.replace(/(src|srcset)="\//g, '$1="https://hari.cafe/').replace(/ loading="lazy"/g, "");

const editor = /* html */ `
<style>
  .g-cols { position: absolute; pointer-events: none; z-index: 30; display: grid; grid-template-columns: repeat(24, minmax(0, 1fr)); }
  .g-cols div { border-inline: 1px solid rgb(255 70 70 / 0.5); }
  .g-cols div span { position: absolute; top: -1.4rem; font: 11px ui-monospace, monospace; color: rgb(255 120 120); }
  .g-off .g-cols { display: none }
  /* nothing drawn on the pieces: the page looks as it does live */
  .canvas > .piece { cursor: grab; position: relative }
  .g-edge { position: absolute; top: 0; bottom: 0; width: 14px; z-index: 32; cursor: ew-resize; }
  .g-edge.l { left: -7px } .g-edge.r { right: -7px }
  .g-panel { position: fixed; right: 12px; bottom: 12px; z-index: 40; width: 440px; max-height: 70vh; overflow: auto; padding: 12px; border: 1px solid #444; border-radius: 6px; background: #111e; color: #ddd; font: 12px/1.5 ui-monospace, monospace; -webkit-text-stroke: 0; letter-spacing: 0 }
  .g-panel b { color: #fff; font-weight: 600 }
  .g-panel .warn { color: #f88 }
  .g-panel pre { margin: 8px 0; padding: 8px; background: #000; border-radius: 4px; white-space: pre; overflow-x: auto; font: inherit; max-width: none; width: auto }
  .g-panel button { font: inherit; padding: 2px 8px; margin-right: 6px; background: #333; color: #eee; border: 1px solid #555; border-radius: 4px; cursor: pointer }
  .g-hide .g-panel { display: none }
</style>
<div class="g-panel">
  <div><b>software canvas</b> <span class="g-vw"></span></div>
  <div class="g-help">drag: across = column, down = drop · edges = resize · shift = x · alt = free<br>keys: ←→ col · ↑↓ drop · shift ←→ x · [ ] span · g grid · h panel</div>
  <div class="g-sel-info" style="margin-top:8px"></div>
  <pre class="g-out"></pre>
  <button class="g-copy">copy</button><button class="g-reset">reset</button>
</div>
<script>
(() => {
  const canvas = document.querySelector(".canvas");
  const pieces = [...canvas.querySelectorAll(":scope > .piece")];
  const rem = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  const read = (el) => {
    const s = el.style;
    const [, start, span] = s.getPropertyValue("--col").match(/(\\d+)\\s*\\/\\s*span\\s*(\\d+)/);
    return { start: +start, span: +span, drop: parseFloat(s.getPropertyValue("--drop")) || 0, x: parseFloat(s.getPropertyValue("--x")) || 0 };
  };
  const name = (el) => el.querySelector("figcaption .name").textContent;
  const state = new Map(pieces.map((el) => [el, read(el)]));
  const initial = new Map(pieces.map((el) => [el, { ...read(el) }]));
  const round = (v, step) => Math.round(v / step) * step;
  const fmt = (v) => +v.toFixed(3);

  // the columns, laid over the canvas with its own gap
  const cols = document.createElement("div");
  cols.className = "g-cols";
  for (let i = 1; i <= 24; i++) cols.insertAdjacentHTML("beforeend", '<div style="position:relative"><span>' + i + "</span></div>");
  document.body.append(cols);
  for (const el of pieces) el.insertAdjacentHTML("beforeend", '<span class="g-edge l"></span><span class="g-edge r"></span>');

  function geom() {
    const r = canvas.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(canvas).columnGap) || 0;
    return { r, gap, pitch: (r.width + gap) / 24 };
  }
  function layout() {
    const { r, gap } = geom();
    Object.assign(cols.style, { left: r.left + scrollX + "px", top: r.top + scrollY + "px", width: r.width + "px", height: r.height + "px", columnGap: gap + "px" });
    const vw = innerWidth;
    document.querySelector(".g-vw").innerHTML = vw + "px" + (vw < 1152 ? ' <span class="warn">(under 1152: desktop canvas off, widen the window)</span>' : "");
  }

  let sel = null;
  function apply(el) {
    const p = state.get(el);
    p.span = Math.max(1, Math.min(24, p.span));
    p.start = Math.max(1, Math.min(25 - p.span, p.start));
    el.style.setProperty("--col", p.start + " / span " + p.span);
    el.style.setProperty("--drop", fmt(p.drop) + "rem");
    el.style.setProperty("--x", fmt(p.x) + "rem");
  }
  function out() {
    const lines = pieces.map((el) => {
      const p = state.get(el), o = initial.get(el);
      const changed = p.start !== o.start || p.span !== o.span || fmt(p.drop) !== fmt(o.drop) || fmt(p.x) !== fmt(o.x);
      return (changed ? "* " : "  ") + name(el).padEnd(18) + 'col: "' + p.start + " / span " + p.span + '", drop: ' + fmt(p.drop) + (fmt(p.x) ? ", x: " + fmt(p.x) : "");
    });
    document.querySelector(".g-out").textContent = lines.join("\\n");
    const p = sel && state.get(sel);
    document.querySelector(".g-sel-info").innerHTML = p ? "selected <b>" + name(sel) + '</b>  col "' + p.start + " / span " + p.span + '", drop ' + fmt(p.drop) + (fmt(p.x) ? ", x " + fmt(p.x) : "") : "click a piece to select it";
    layout();
  }
  function select(el) { pieces.forEach((e) => e.classList.toggle("g-sel", e === el)); sel = el; out(); }
  pieces.forEach(apply);

  // links stay put
  canvas.addEventListener("click", (e) => e.target.closest("a") && e.preventDefault(), true);

  canvas.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".piece");
    if (!el || e.button !== 0) return;
    e.preventDefault();
    select(el);
    const edge = e.target.closest(".g-edge")?.classList.contains("l") ? "l" : e.target.closest(".g-edge") ? "r" : null;
    const from = { ...state.get(el) };
    const { pitch } = geom();
    el.setPointerCapture(e.pointerId);
    const move = (m) => {
      const dx = m.clientX - e.clientX, dy = m.clientY - e.clientY;
      const p = state.get(el);
      const free = m.altKey;
      if (edge === "r") p.span = Math.max(1, from.span + Math.round(dx / pitch));
      else if (edge === "l") {
        // the right edge stays where it is
        const d = Math.min(from.span - 1, Math.max(1 - from.start, Math.round(dx / pitch)));
        p.start = from.start + d;
        p.span = from.span - d;
      }
      else if (m.shiftKey) { p.x = from.x + (free ? dx / rem() : round(dx / rem(), 0.25)); p.start = from.start; }
      else {
        p.start = from.start + Math.round(dx / pitch);
        p.x = from.x;
        p.drop = from.drop + (free ? dy / rem() : round(dy / rem(), 0.25));
      }
      apply(el); out();
    };
    const up = () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  });

  addEventListener("keydown", (e) => {
    if (e.key === "g") return document.documentElement.classList.toggle("g-off");
    if (e.key === "h") return document.documentElement.classList.toggle("g-hide");
    if (!sel) return;
    const p = state.get(sel);
    const fine = e.altKey ? 0.05 : 0.25;
    const k = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (k && e.shiftKey) p.x += k * fine;
    else if (k) p.start += k;
    else if (e.key === "ArrowUp") p.drop -= e.shiftKey ? 1 : fine * 2;
    else if (e.key === "ArrowDown") p.drop += e.shiftKey ? 1 : fine * 2;
    else if (e.key === "[") p.span -= 1;
    else if (e.key === "]") p.span += 1;
    else return;
    e.preventDefault();
    apply(sel); out();
  });

  document.querySelector(".g-copy").onclick = () => navigator.clipboard.writeText(document.querySelector(".g-out").textContent);
  document.querySelector(".g-reset").onclick = () => { pieces.forEach((el) => { state.set(el, { ...initial.get(el) }); apply(el); }); out(); };
  addEventListener("resize", layout);
  document.fonts.ready.then(out);
  out();
})();
</script>`;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>software canvas editor</title>
<style>${pageCss}</style>
</head>
<body>
${pageBody}
${editor}
</body>
</html>
`;

const outFile = new URL("grid.html", root);
await writeFile(outFile, page);
console.log(`wrote ${outFile.pathname} (${(page.length / 1024).toFixed(0)} KB)`);
