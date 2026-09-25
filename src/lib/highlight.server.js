// Build-time code blocks: Shiki highlighting plus editor-style hover
// definitions. Rust sources are scanned for their items (structs, enums,
// variants, fields, fns, methods, traits, consts, type aliases) and every
// identifier in the displayed code that names one of them, or an entry in the
// glossary, becomes `<span data-def="key">`. Each block carries hidden
// `<template data-def-key="key">` elements with the popover content, which
// CodeDefs.svelte clones on hover. With JS off the block renders as plain
// highlighted code.
//
// A source can show only part of itself; the rest is hidden context whose
// definitions still feed hovers:
//   `// #region name` ... `// #endregion`  show one named region
//   `// ---cut---`                          show everything below the line
// Marker lines are never shown and the shown lines are dedented.
import { createHighlighter } from "shiki";
import { glossary } from "./code-glossary.js";

const THEMES = { light: "github-light", dark: "github-dark" };
const LANGS = ["rust"];
const highlighter = createHighlighter({ themes: Object.values(THEMES), langs: LANGS });

const KEYWORDS = new Set(
  (
    "as async await break const continue crate dyn else enum extern false fn for if impl in " +
    "let loop match mod move mut pub ref return self static struct super trait true type " +
    "union unsafe use where while yield"
  ).split(" "),
);

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

// ---------------------------------------------------------------- lexing

// Rust tokens with source offsets. Whitespace and plain comments are dropped;
// `///` doc comments are kept (they attach to the next item).
function lex(src) {
  const out = [];
  let i = 0;
  const n = src.length;
  const push = (type, start, end) => out.push({ type, text: src.slice(start, end), start, end });
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
    } else if (src.startsWith("//", i)) {
      let e = src.indexOf("\n", i);
      if (e < 0) e = n;
      if (src.startsWith("///", i) && !src.startsWith("////", i)) push("doc", i, e);
      i = e;
    } else if (src.startsWith("/*", i)) {
      let depth = 0;
      do {
        if (src.startsWith("/*", i)) (depth++, (i += 2));
        else if (src.startsWith("*/", i)) (depth--, (i += 2));
        else i++;
      } while (depth > 0 && i < n);
    } else if (/^(?:b?r#*"|b")/.test(src.slice(i, i + 12))) {
      // raw / byte strings: r"..", r#".."#, b"..", br#".."#
      const [open, prefix, hashes] = src.slice(i).match(/^(b?r?)(#*)"/);
      const start = i;
      i += open.length;
      if (prefix.includes("r")) {
        const end = src.indexOf('"' + hashes, i);
        i = end < 0 ? n : end + 1 + hashes.length;
      } else i = stringEnd(src, i);
      push("string", start, i);
    } else if (c === '"') {
      const start = i;
      i = stringEnd(src, i + 1);
      push("string", start, i);
    } else if (c === "'") {
      // char literal or lifetime
      const m = src.slice(i).match(/^'(?:\\(?:x[0-9a-fA-F]{2}|u\{[0-9a-fA-F]+\}|.)|[^\\'])'/);
      if (m) {
        push("char", i, i + m[0].length);
        i += m[0].length;
      } else {
        const start = i++;
        while (i < n && /\w/.test(src[i])) i++;
        push("lifetime", start, i);
      }
    } else if (/[A-Za-z_]/.test(c)) {
      const start = i;
      while (i < n && /\w/.test(src[i])) i++;
      push("ident", start, i);
    } else if (/[0-9]/.test(c)) {
      const start = i;
      while (i < n && /[\w.]/.test(src[i]) && !(src[i] === "." && !/[0-9]/.test(src[i + 1] ?? ""))) i++;
      push("number", start, i);
    } else {
      const two = src.slice(i, i + 2);
      const len = ["::", "->", "=>", "..", "==", "!=", "<=", ">=", "&&", "||"].includes(two) ? 2 : 1;
      push("punct", i, i + len);
      i += len;
    }
  }
  return out;
}

function stringEnd(src, i) {
  while (i < src.length && src[i] !== '"') i += src[i] === "\\" ? 2 : 1;
  return i + 1;
}

// ---------------------------------------------------------------- items

// Scan the items of a Rust source. Returns
//   defs:  Map key -> { name, owner, kind, code, doc }
//          keys: `Request`, `Request.retry_at`, `Request::tick`,
//                `Action::Send`, `Action::Send.request_id`
//   sites: Map token index -> key, for the name token of each definition
//   bodies: Map `{` token index -> owner, for impl/trait bodies (Self type)
function scanItems(src, toks) {
  const defs = new Map();
  const sites = new Map();
  const bodies = new Map();
  const close = matchBrackets(toks);
  const is = (i, text) => toks[i]?.text === text && toks[i].type !== "string";
  const dedentBlock = (text, col) =>
    text
      .split("\n")
      .map((l, k) => (k === 0 ? l : l.replace(new RegExp(`^ {0,${col}}`), "")))
      .join("\n");
  const colOf = (off) => off - (src.lastIndexOf("\n", off - 1) + 1);
  const docText = (docs) => docs.map((d) => d.text.replace(/^\/\/\/ ?/, "")).join("\n");
  const slice = (a, b) => dedentBlock(src.slice(toks[a].start, toks[b].end), colOf(toks[a].start));
  const define = (key, i, def) => {
    if (!defs.has(key)) defs.set(key, def);
    sites.set(i, key);
  };

  // Skip to the end of a type/expression: stops before `stop` tokens at depth 0.
  function skipTo(i, end, stops) {
    let angle = 0;
    while (i < end) {
      const t = toks[i];
      if (t.type === "punct") {
        if (stops.includes(t.text) && (angle === 0 || t.text === ";")) return i;
        if (close.has(i)) {
          i = close.get(i) + 1;
          continue;
        }
        if (t.text === "<") angle++;
        else if (t.text === ">" && angle > 0) angle--;
      }
      i++;
    }
    return i;
  }

  // Named fields between `{` at `open` and its match.
  function fields(open, owner) {
    const end = close.get(open);
    let i = open + 1;
    while (i < end) {
      const docs = [];
      while (toks[i]?.type === "doc") docs.push(toks[i++]);
      while (is(i, "#")) i = (close.get(i + 1) ?? i + 1) + 1;
      if (is(i, "pub")) i += is(i + 1, "(") ? 2 + (close.get(i + 1) - i - 1) : 1;
      if (toks[i]?.type === "ident" && is(i + 1, ":")) {
        const e = skipTo(i + 2, end, [","]);
        define(`${owner}.${toks[i].text}`, i, {
          name: toks[i].text,
          owner,
          kind: "field",
          code: src.slice(toks[i].start, toks[e - 1].end).replace(/\s+/g, " "),
          doc: docText(docs),
        });
        i = e + 1;
      } else i = skipTo(i, end, [","]) + 1;
    }
  }

  function items(i, end, owner) {
    while (i < end) {
      const docs = [];
      while (toks[i]?.type === "doc") docs.push(toks[i++]);
      while (is(i, "#")) i = (close.get(is(i + 1, "!") ? i + 2 : i + 1) ?? i) + 1;
      if (i >= end) break;
      const start = i;
      if (is(i, "pub")) i += is(i + 1, "(") ? close.get(i + 1) - i + 1 : 1;
      while (["async", "unsafe", "default", "extern"].includes(toks[i]?.text) || (is(i, "const") && ["fn", "unsafe", "async"].includes(toks[i + 1]?.text)) || toks[i]?.type === "string")
        i++;
      const kw = toks[i]?.text;
      const nameAt = i + 1;
      const name = toks[nameAt]?.type === "ident" ? toks[nameAt].text : null;
      const key = owner && name ? `${owner}::${name}` : name;
      const doc = docText(docs);

      if ((kw === "struct" || kw === "union") && name) {
        const j = skipTo(nameAt + 1, end, ["{", ";", "("]);
        if (is(j, "{")) {
          const e = close.get(j);
          define(key, nameAt, { name, owner, kind: "struct", code: slice(start, e), doc });
          fields(j, name);
          i = e + 1;
        } else {
          const e = skipTo(j, end, [";"]);
          define(key, nameAt, { name, owner, kind: "struct", code: slice(start, e), doc });
          i = e + 1;
        }
      } else if (kw === "enum" && name) {
        const j = skipTo(nameAt + 1, end, ["{"]);
        const e = close.get(j) ?? end;
        define(key, nameAt, { name, owner, kind: "enum", code: slice(start, e), doc });
        let v = j + 1;
        while (v < e) {
          const vdocs = [];
          while (toks[v]?.type === "doc") vdocs.push(toks[v++]);
          while (is(v, "#")) v = (close.get(v + 1) ?? v + 1) + 1;
          if (toks[v]?.type !== "ident") {
            v++;
            continue;
          }
          const vEnd = skipTo(v + 1, e, [","]);
          define(`${name}::${toks[v].text}`, v, {
            name: toks[v].text,
            owner: name,
            kind: "variant",
            code: slice(v, vEnd - 1),
            doc: docText(vdocs),
          });
          if (is(v + 1, "{")) fields(v + 1, `${name}::${toks[v].text}`);
          v = vEnd + 1;
        }
        i = e + 1;
      } else if (kw === "fn" && name) {
        const j = skipTo(nameAt + 1, end, ["{", ";"]);
        define(key, nameAt, {
          name,
          owner,
          kind: owner ? "method" : "fn",
          code: slice(start, j - 1),
          doc,
        });
        i = is(j, "{") ? close.get(j) + 1 : j + 1;
      } else if (kw === "trait" && name) {
        const j = skipTo(nameAt + 1, end, ["{"]);
        const e = close.get(j) ?? end;
        define(key, nameAt, { name, owner, kind: "trait", code: slice(start, e), doc });
        bodies.set(j, name);
        items(j + 1, e, name);
        i = e + 1;
      } else if (kw === "impl") {
        const j = skipTo(i + 1, end, ["{"]);
        // `impl<T> Trait for Type<T>`: the self type is the last path segment
        // after `for`, or of the whole header when there is no `for`.
        let from = i + 1;
        if (is(from, "<")) from = skipTo(from + 1, j, [">"]) + 1;
        for (let k = from; k < j; k++) if (is(k, "for")) from = k + 1;
        let self = null;
        for (let k = from; k < j; k++) {
          if (is(k, "<") || is(k, "where")) break;
          if (toks[k].type === "ident" && toks[k].text !== "dyn") self = toks[k].text;
        }
        bodies.set(j, self);
        if (self) items(j + 1, close.get(j) ?? end, self);
        i = (close.get(j) ?? end) + 1;
      } else if ((kw === "type" || kw === "const" || kw === "static") && (name || toks[nameAt]?.text === "mut")) {
        const at = toks[nameAt].text === "mut" ? nameAt + 1 : nameAt;
        const nm = toks[at].text;
        const e = skipTo(at + 1, end, [";"]);
        const eq = skipTo(at + 1, e, ["="]);
        const shown = kw === "type" ? e - 1 : eq - 1;
        define(owner ? `${owner}::${nm}` : nm, at, { name: nm, owner, kind: kw, code: slice(start, shown), doc });
        i = e + 1;
      } else if (kw === "mod" && name && is(nameAt + 1, "{")) {
        items(nameAt + 2, close.get(nameAt + 1), owner);
        i = close.get(nameAt + 1) + 1;
      } else {
        // use, macro_rules!, anything else: skip one statement or block
        const j = skipTo(i, end, [";", "{"]);
        i = is(j, "{") ? close.get(j) + 1 : j + 1;
      }
    }
  }

  items(0, toks.length, null);
  return { defs, sites, bodies, close };
}

function matchBrackets(toks) {
  const close = new Map();
  const stack = [];
  const pairs = { ")": "(", "]": "[", "}": "{" };
  toks.forEach((t, i) => {
    if (t.type !== "punct") return;
    if ("([{".includes(t.text)) stack.push(i);
    else if (pairs[t.text]) {
      while (stack.length && toks[stack[stack.length - 1]].text !== pairs[t.text]) stack.pop();
      if (stack.length) close.set(stack.pop(), i);
    }
  });
  return close;
}

// ---------------------------------------------------------------- references

// Resolve every identifier in the source to a definition key (local, or
// `g:<glossary name>`). Returns Map source offset -> { key, len }.
function resolve(src) {
  const toks = lex(src);
  const { defs, sites, bodies, close } = scanItems(src, toks);
  const refs = new Map();

  const fieldsNamed = new Map(); // struct field name -> keys
  const methodsNamed = new Map();
  for (const [key, d] of defs) {
    const bucket = d.kind === "field" && !d.owner.includes("::") ? fieldsNamed : d.kind === "method" ? methodsNamed : null;
    if (bucket) bucket.set(d.name, [...(bucket.get(d.name) ?? []), key]);
  }
  const unique = (m, name) => (m.get(name)?.length === 1 ? m.get(name)[0] : null);
  const topLevel = (name) => (defs.has(name) && !defs.get(name).owner ? name : null);
  const gloss = (name, uses) => (glossary[name] && uses.includes(glossary[name].use) ? `g:${name}` : null);

  // brace frames: { self: impl owner, literal: struct/variant key }
  const frames = [];
  const closers = new Map([...close].filter(([o]) => toks[o].text === "{").map(([o, c]) => [c, o]));
  const selfType = () => [...frames].reverse().find((f) => f.self)?.self ?? null;
  const at = (i) => (toks[i]?.type === "punct" ? toks[i].text : null);

  // the path ending at ident i, as a local key (`Action::Send`, `Request`, `Self`)
  function pathKey(i) {
    if (toks[i]?.type !== "ident" || at(i - 1) === ".") return null;
    const name = toks[i].text === "Self" ? selfType() : toks[i].text;
    if (at(i - 1) === "::" && toks[i - 2]?.type === "ident") {
      const owner = toks[i - 2].text === "Self" ? selfType() : toks[i - 2].text;
      return defs.has(`${owner}::${name}`) ? `${owner}::${name}` : null;
    }
    return name && topLevel(name);
  }

  toks.forEach((t, i) => {
    if (t.type === "punct" && t.text === "{") {
      const literal = pathKey(i - 1);
      const kind = literal && defs.get(literal).kind;
      frames.push({
        self: bodies.get(i) ?? null,
        literal: !bodies.has(i) && (kind === "struct" || kind === "variant") ? literal : null,
      });
      return;
    }
    if (t.type === "punct" && t.text === "}" && closers.has(i)) {
      frames.pop();
      return;
    }
    if (t.type !== "ident") return;

    const name = t.text;
    const prev = at(i - 1);
    const next = at(i + 1);
    let key = sites.get(i) ?? null;

    if (!key && name === "await" && prev === ".") key = gloss("await", ["method"]);
    if (!key && name === "Self") key = selfType();
    if (key || KEYWORDS.has(name) || name === "Self" || next === "!") {
      if (key) refs.set(t.start, { key, len: name.length });
      return;
    }

    if (prev === "::") {
      const p = toks[i - 2]?.type === "ident" ? toks[i - 2].text : null;
      const owner = p === "Self" ? selfType() : p;
      key =
        (owner && defs.has(`${owner}::${name}`) ? `${owner}::${name}` : null) ??
        (owner && glossary[`${owner}::${name}`] ? `g:${owner}::${name}` : null) ??
        (owner && defs.has(owner) ? null : topLevel(name) ?? gloss(name, ["type", "assoc", "variant"]));
    } else if (prev === ".") {
      const call = next === "(" || next === "::";
      const recvSelf = toks[i - 2]?.text === "self" && toks[i - 3]?.text !== ".";
      const owner = recvSelf ? selfType() : null;
      if (call) {
        key =
          (owner && defs.has(`${owner}::${name}`) ? `${owner}::${name}` : null) ??
          unique(methodsNamed, name) ??
          gloss(name, ["method"]);
      } else {
        key = (owner && defs.has(`${owner}.${name}`) ? `${owner}.${name}` : null) ?? unique(fieldsNamed, name);
      }
    } else {
      // `Path { name: .. }` / `Path { name, .. }`: a field of that struct or variant
      const frame = frames[frames.length - 1];
      if (frame?.literal && (prev === "{" || prev === ",") && (next === ":" || next === "," || next === "}")) {
        key = defs.has(`${frame.literal}.${name}`) ? `${frame.literal}.${name}` : null;
      } else {
        key = topLevel(name) ?? gloss(name, ["type", "variant"]);
      }
    }
    if (key) refs.set(t.start, { key, len: name.length });
  });

  return { defs, refs };
}

// ---------------------------------------------------------------- display

const REGION = /^\s*\/\/\s*#(region|endregion)\b\s*(\S*)/;
const CUT = /^\s*\/\/\s*---cut---\s*$/;

// Which source lines are shown: indices into src.split("\n").
function shownLines(lines, region) {
  let picked;
  const cut = lines.findIndex((l) => CUT.test(l));
  if (region) {
    const open = lines.findIndex((l) => REGION.exec(l)?.[1] === "region" && REGION.exec(l)[2] === region);
    if (open < 0) throw new Error(`code region "${region}" not found`);
    picked = [];
    for (let depth = 1, k = open + 1; k < lines.length; k++) {
      const m = REGION.exec(lines[k]);
      if (m) depth += m[1] === "region" ? 1 : -1;
      if (depth === 0) break;
      picked.push(k);
    }
  } else {
    picked = lines.map((_, k) => k).filter((k) => k > cut);
  }
  picked = picked.filter((k) => !REGION.test(lines[k]) && !CUT.test(lines[k]));
  while (picked.length && !lines[picked[0]].trim()) picked.shift();
  while (picked.length && !lines[picked[picked.length - 1]].trim()) picked.pop();
  return picked;
}

function markdownDoc(doc) {
  return doc
    .trim()
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p.replace(/\s*\n\s*/g, " ")).replace(/`([^`]+)`/g, "<code>$1</code>")}</p>`)
    .join("");
}

// A page's code renderer. Templates are emitted once per page, so create one
// renderer per `load` and render every block of the page through it.
export async function createCodeRenderer() {
  const syntax = await highlighter;
  const emitted = new Set();
  const highlight = (code, lang, transformers = []) =>
    syntax.codeToHtml(code, {
      lang: LANGS.includes(lang) ? lang : "text",
      themes: THEMES,
      defaultColor: false,
      transformers,
    });

  function template(domKey, key, def, lang) {
    const g = key.startsWith("g:") ? glossary[key.slice(2)] : null;
    const owner = g ? g.owner : def.kind === "field" || def.kind === "variant" || def.kind === "method" ? def.owner : null;
    // inner `///` lines are dropped: each field or variant shows its own doc on hover
    const code = g ? g.code : def.code.replace(/^[ \t]*\/\/\/.*\n/gm, "");
    const doc = g ? g.doc : def.doc;
    return (
      `<template data-def-key="${escapeHtml(domKey)}">` +
      (owner ? `<div class="def-owner">${escapeHtml(owner)}</div>` : "") +
      highlight(code, lang).replace(' tabindex="0"', "") +
      (doc ? `<div class="def-doc">${markdownDoc(doc)}</div>` : "") +
      (g?.url ? `<a class="def-link" href="${escapeHtml(g.url)}">docs</a>` : "") +
      `</template>`
    );
  }

  /**
   * Render a code block. `region` shows one `// #region` of the source;
   * without it, a source shows whole, or below its `// ---cut---` line.
   */
  return function render(source, { lang = "rust", region } = {}) {
    const src = source.replace(/\r\n/g, "\n");
    const lines = src.split("\n");
    const picked = shownLines(lines, region);
    const nonEmpty = picked.filter((k) => lines[k].trim());
    const indent = Math.min(...nonEmpty.map((k) => lines[k].match(/^ */)[0].length), Infinity);
    const dedent = Number.isFinite(indent) ? indent : 0;
    const shown = picked.map((k) => lines[k].slice(dedent)).join("\n");

    const rust = lang === "rust" || lang === "rs";
    if (!rust) return highlight(shown, lang);

    // map resolved source offsets onto the shown text
    const { defs, refs } = resolve(src);
    const lineStart = [];
    for (let k = 0, o = 0; k < lines.length; o += lines[k].length + 1, k++) lineStart.push(o);
    const shownRefs = new Map();
    let at = 0;
    for (const k of picked) {
      for (let c = dedent; c < lines[k].length; c++) {
        const ref = refs.get(lineStart[k] + c);
        if (ref) shownRefs.set(at + c - dedent, ref);
      }
      at += Math.max(0, lines[k].length - dedent) + 1;
    }

    const tag = hash(src);
    const domKey = (key) => (key.startsWith("g:") ? key : `${tag}:${key}`);
    const used = new Map();
    const focusable = new Set();

    const html = highlight(shown, "rust", [
      {
        // split tokens around resolved names so each gets its own span;
        // everything else keeps Shiki's token boundaries
        tokens(lines) {
          return lines.map((line) =>
            line.flatMap((t) => {
              const cuts = new Set();
              for (let p = t.offset; p < t.offset + t.content.length; p++) {
                const ref = shownRefs.get(p);
                if (ref) cuts.add(p - t.offset).add(p - t.offset + ref.len);
              }
              if (!cuts.size) return [t];
              const edges = [0, ...[...cuts].filter((c) => c > 0 && c < t.content.length).sort((a, b) => a - b), t.content.length];
              return edges.slice(1).map((e, k) => ({ ...t, content: t.content.slice(edges[k], e), offset: t.offset + edges[k] }));
            }),
          );
        },
        span(node, _line, _col, _lineEl, token) {
          const ref = shownRefs.get(token.offset);
          if (!ref || ref.len !== token.content.length) return;
          const key = domKey(ref.key);
          used.set(key, ref.key);
          node.properties["data-def"] = key;
          // one tab stop per definition per block
          if (!focusable.has(key)) {
            focusable.add(key);
            node.properties.tabindex = "0";
          }
        },
      },
    ]);

    let templates = "";
    for (const [key, ref] of used) {
      if (emitted.has(key)) continue;
      emitted.add(key);
      templates += template(key, ref, defs.get(ref), "rust");
    }
    return html + templates;
  };
}
