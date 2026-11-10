// This thought is written in post.md, by hand. At build time the markdown
// becomes the same markup the hand-written thoughts use: `##` heads get an
// id and a self-link (the layout's "on this page" reads them), fenced code
// goes through the shared code renderer, and an image alone on its line
// becomes a zoomable figure whose title is its caption, with `?rev=` set
// from the file so the CDN never serves a stale diagram.
//
// ==text== is the yellow marker the other thoughts use (<mark>).
// [term]{definition} underlines a term in the prose and shows the definition on
// hover or tap, through the same popover as names in code blocks (CodeDefs).
// Fenced blocks marked `tab` that sit next to each other share one frame,
// with their names as tabs in its bar (no-JS: radio buttons and CSS). The
// first tab is selected unless another block is marked `selected`.
//
// HTML comments are drafting notes. `vite dev` shows the ones that start
// with TODO, VISUAL, RAW, NOTE or @claude as callouts; a build drops every
// comment. A paragraph with an @claude note in it is a note too: shown in dev,
// never published.
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { dev } from "$app/environment";
import { Marked } from "marked";
import { createCodeRenderer } from "#lib/highlight.server.js";
import source from "./post.md?raw";

const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// a diagram's intrinsic size and cache key, from the file under static/
function diagram(href) {
  if (!href.startsWith("/diagrams/")) return { src: href, size: "" };
  const file = readFileSync(join(process.cwd(), "static", href));
  const rev = createHash("sha256").update(file).digest("hex").slice(0, 12);
  // svg: its viewBox; png: width and height from the IHDR header
  const box = href.endsWith(".png")
    ? [null, file.readUInt32BE(16), file.readUInt32BE(20)]
    : file.toString("utf8").match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return { src: `${href}?rev=${rev}`, size: box ? ` width="${box[1]}" height="${box[2]}"` : "" };
}

function figure({ href, title, text }) {
  const { src, size } = diagram(href);
  const alt = escapeHtml(text);
  return (
    `<figure><div class="diagram-scroll" tabindex="0" role="region" aria-label="${alt}">` +
    `<img src="${src}"${size} alt="${alt}" /></div>` +
    (title ? `<figcaption>${title}</figcaption>` : "") +
    `</figure>`
  );
}

const NOTE = /^<!--\s*(TODO|VISUAL|RAW|SPINE|NOTE|@claude)([\s\S]*?)-->\s*$/;
const AT_CLAUDE = /@\s?claude/i;
const callout = (label, text) =>
  `<aside class="callout draft"><p class="callout-label">${label}</p><p>${escapeHtml(text.trim())}</p></aside>`;

export async function load() {
  const code = await createCodeRenderer();
  let terms = 0;
  const marked = new Marked({
    extensions: [
      {
        name: "term",
        level: "inline",
        start: (src) => src.indexOf("["),
        tokenizer(src) {
          const m = /^\[([^\]\n]+)\]\{([^}\n]+)\}/.exec(src);
          if (m) return { type: "term", raw: m[0], def: m[2].trim(), tokens: this.lexer.inlineTokens(m[1]) };
        },
        renderer(token) {
          const key = `term:${terms++}`;
          return (
            `<span class="term" data-def="${key}" tabindex="0">${this.parser.parseInline(token.tokens)}</span>` +
            `<template data-def-key="${key}"><div class="def-doc"><p>${escapeHtml(token.def)}</p></div></template>`
          );
        },
      },
      {
        name: "mark",
        level: "inline",
        start: (src) => src.indexOf("=="),
        tokenizer(src) {
          const m = /^==(?=\S)([\s\S]*?\S)==/.exec(src);
          if (m) return { type: "mark", raw: m[0], tokens: this.lexer.inlineTokens(m[1]) };
        },
        renderer(token) {
          return `<mark>${this.parser.parseInline(token.tokens)}</mark>`;
        },
      },
    ],
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        if (depth !== 2) return `<h${depth}>${html}</h${depth}>`;
        const id = slug(html);
        return `<h2 id="${id}"><a class="bare" href="#${id}">${html}</a></h2>`;
      },
      // ```lang name [open]: `name` labels the block's bar; `open` never folds
      code({ text, lang = "" }) {
        const [kind = "text", name, ...flags] = lang.trim().split(/\s+/);
        const html = code(text, { lang: kind, name: name ?? kind, open: flags.includes("open") });
        return flags.includes("tab") ? `<!--tab:${escapeHtml(name ?? kind)}${flags.includes("selected") ? "|selected" : ""}-->${html}<!--/tab-->` : html;
      },
      paragraph({ tokens }) {
        const only = tokens.filter((t) => !(t.type === "text" && !t.text.trim()));
        if (only.length === 1 && only[0].type === "image") return figure(only[0]);
        if (only.some((t) => AT_CLAUDE.test(t.raw ?? ""))) return dev ? callout("@claude", only.map((t) => t.raw).join("")) : "";
        return `<p>${this.parser.parseInline(tokens)}</p>`;
      },
      html({ text }) {
        const note = text.trim().match(NOTE);
        if (note && dev && note[1] !== "SPINE")
          return callout(note[1], note[2]);
        return text.trim().startsWith("<!--") ? "" : text;
      },
    },
  });

  const title = source.match(/^# (.+)$/m)?.[1] ?? "baml to rust";
  // neighbouring tab blocks become one frame
  let groups = 0;
  const body = marked
    .parse(source.replace(/^# .+$/m, ""))
    .replace(/(?:<!--tab:[^>]*?-->[\s\S]*?<!--\/tab-->\s*){2,}/g, (run) => {
      const g = `tabs-${groups++}`;
      const tabs = [...run.matchAll(/<!--tab:([^>|]*?)(\|selected)?-->([\s\S]*?)<!--\/tab-->/g)];
      const pick = Math.max(0, tabs.findIndex((t) => t[2]));
      return (
        `<div class="code-tabs">` +
        tabs.map((_, i) => `<input type="radio" class="tab-input" name="${g}" id="${g}-${i}"${i === pick ? " checked" : ""} />`).join("") +
        `<nav class="tab-labels">` + tabs.map(([, name], i) => `<label for="${g}-${i}">${name}</label>`).join("") + `</nav>` +
        tabs.map(([, , , html]) => `<div class="tab-panel">${html}</div>`).join("") +
        `</div>`
      );
    })
    .replace(/<!--\/?tab(:[^>]*)?-->/g, "");
  return { title, body };
}
