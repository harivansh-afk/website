// text on a character grid: every string is measured in cells, never pixels

// cut to n cells, ending in an ellipsis when something was cut
export function fit(text, n) {
  if (n <= 0) return "";
  return text.length <= n ? text : text.slice(0, Math.max(0, n - 1)) + "…";
}

// fit, then fill with spaces to exactly n cells
export const pad = (text, n) => fit(text, n).padEnd(Math.max(0, n));

// greedy word wrap to lines of at most n cells
export function wrap(text, n) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    if (!line) line = word;
    else if (line.length + 1 + word.length <= n) line += " " + word;
    else {
      lines.push(line);
      line = word;
    }
    while (line.length > n) {
      lines.push(line.slice(0, n));
      line = line.slice(n);
    }
  }
  if (line) lines.push(line);
  return lines;
}

// "003/012", the position counter cut into a frame's top edge
export const counter = (i, n) => `${String(i).padStart(3, "0")}/${String(n).padStart(3, "0")}`;

// a url as it reads in a cell: no scheme, no trailing slash
export const bareUrl = (href) => href.replace(/^https?:\/\//, "").replace(/\/$/, "");
