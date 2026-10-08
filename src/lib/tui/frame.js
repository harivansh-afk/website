// frames drawn the way a terminal draws them: box-drawing characters in a
// buffer of cells. the screen paints the buffer as one block of text; titles
// and counters are cut into a frame's top edge, `┌─ TITLE ──── 001/012 ─┐`
import { fit } from "./text.js";

export const blank = (cols, rows) => Array.from({ length: rows }, () => Array(cols).fill(" "));

function put(buf, x, y, text) {
  const row = buf[y];
  if (!row) return;
  for (let i = 0; i < text.length && x + i < row.length; i++) if (x + i >= 0) row[x + i] = text[i];
}

// where the title sits on the top edge, so the screen can lay its focus
// highlight over exactly those cells
export const titleSpan = (rect, title) => {
  const text = ` ${fit(title.toUpperCase(), rect.w - 6)} `;
  return { x: rect.x + 2, y: rect.y, w: text.length, text };
};

export function box(buf, rect, { title = "", count = "" } = {}) {
  const { x, y, w, h } = rect;
  if (w < 2 || h < 2) return;
  put(buf, x, y, "┌" + "─".repeat(w - 2) + "┐");
  for (let i = 1; i < h - 1; i++) {
    put(buf, x, y + i, "│");
    put(buf, x + w - 1, y + i, "│");
  }
  put(buf, x, y + h - 1, "└" + "─".repeat(w - 2) + "┘");
  const name = fit(title.toUpperCase(), w - 6);
  if (name) put(buf, x + 2, y, ` ${name} `);
  // the counter, when it fits between the title and the corner
  if (count && name.length + count.length + 8 < w) put(buf, x + w - count.length - 4, y, ` ${count} `);
}

export const paint = (buf) => buf.map((row) => row.join("")).join("\n");
