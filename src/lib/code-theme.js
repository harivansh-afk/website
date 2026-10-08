// Shiki themes for code blocks: cozybox, the Neovim colorscheme
// (git.harivan.sh/harivansh-afk/cozybox.nvim), dark and light. Colors are the
// plugin's resolved palette; scope roles follow its treesitter links for Rust
// (nvim-treesitter's rust highlights.scm). TextMate scopes cannot tell some of
// those captures apart, so `cozyboxTransformer` repaints them from context.

const PALETTES = {
  dark: {
    bg: "#101010",
    fg1: "#ebdbb2",
    fg3: "#bdae93",
    gray: "#928374",
    red: "#ea6962",
    green: "#a9b665",
    yellow: "#d8a657",
    blue: "#5b84de",
    purple: "#d3869b",
    aqua: "#8ec07c",
    orange: "#fe8019",
  },
  light: {
    bg: "#e7e7e7",
    fg1: "#3c3836",
    fg3: "#665c54",
    gray: "#928374",
    red: "#c5524a",
    green: "#427b58",
    yellow: "#b57614",
    blue: "#4261a5",
    purple: "#8f3f71",
    aqua: "#3c7678",
    orange: "#af3a03",
  },
};

// role -> [palette color, font style]; the nvim group each one stands for is
// noted where it isn't obvious
const ROLES = {
  plain: ["fg1"], // @variable, @variable.parameter, @module, Operator
  punct: ["fg3"], // Delimiter
  comment: ["gray", "italic"],
  string: ["green", "italic"],
  keyword: ["red"],
  import: ["aqua"], // @keyword.import (use, mod)
  macro: ["aqua"], // Macro, PreProc (attributes, lifetimes)
  func: ["green", "bold"], // Function
  type: ["yellow"],
  constant: ["purple"], // Constant, Number, Boolean, Character
  special: ["orange"], // Special: self, Some/None/Ok/Err, escapes, `_`
  member: ["blue"], // @variable.member, @property
};

const SCOPES = [
  ["comment", "comment, punctuation.definition.comment"],
  ["string", "string, punctuation.definition.string, meta.interpolation, punctuation.definition.interpolation"],
  ["constant", "string.quoted.single.char, string.quoted.single.char punctuation.definition.char"],
  ["special", "constant.character.escape"],
  ["constant", "constant.numeric, constant.language, constant.other.caps, punctuation.separator.dot.decimal"],
  ["keyword", "keyword, storage, storage.type, storage.modifier, punctuation.definition.lifetime"],
  ["import", "meta.use keyword.other"],
  ["plain", "keyword.operator, variable, variable.other"],
  ["punct", "punctuation, keyword.operator.namespace, keyword.operator.access.dot, keyword.operator.key-value, keyword.operator.arrow"],
  ["func", "entity.name.function"],
  ["macro", "entity.name.function.macro, meta.attribute, entity.name.type.lifetime"],
  ["type", "entity.name.type, support.type, meta.attribute entity.name.type"],
  ["special", "entity.name.type.option, entity.name.type.result, variable.language.self"],
  ["plain", "entity.name.namespace, entity.name.module, keyword.other.crate, variable.language.super, meta.use variable.language.self"],
];

function theme(mode) {
  const p = PALETTES[mode];
  return {
    name: `cozybox-${mode}`,
    type: mode,
    colors: { "editor.background": p.bg, "editor.foreground": p.fg1 },
    tokenColors: [
      { settings: { foreground: p.fg1, background: p.bg } },
      ...SCOPES.map(([role, scope]) => ({
        scope: scope.split(", "),
        settings: { foreground: p[ROLES[role][0]], fontStyle: ROLES[role][1] ?? "" },
      })),
    ],
  };
}

export const cozyboxDark = theme("dark");
export const cozyboxLight = theme("light");

// The htmlStyle Shiki gives a token of `role` with themes { light, dark } and
// `defaultColor: false` (Shiki writes the hex upper case; compare lower).
function style(role) {
  const [color, font] = ROLES[role];
  const out = {};
  for (const mode of ["light", "dark"]) {
    out[`--shiki-${mode}`] = PALETTES[mode][color];
    if (font === "italic") out[`--shiki-${mode}-font-style`] = "italic";
    if (font === "bold") out[`--shiki-${mode}-font-weight`] = "bold";
  }
  return out;
}

const signature = (s) =>
  [s["--shiki-dark"]?.toLowerCase(), s["--shiki-dark-font-style"] ?? "", s["--shiki-dark-font-weight"] ?? ""].join("|");
const ROLE_OF = new Map(Object.keys(ROLES).map((role) => [signature(style(role)), role]));

// Words treesitter captures differently from the TextMate scopes they get.
const WORDS = { mod: "import", move: "keyword", await: "keyword", Self: "type", _: "special" };
// `Name {` opens a struct body, literal or pattern only after these
const LITERAL_BEFORE = new Set([undefined, "struct", "union", "let", "return", "(", "[", "]", "{", "}", ",", ";", ":", "=", "=>", "|"]);
const upper = (w) => /^[A-Z]/.test(w);
const ident = (w) => /^[A-Za-z_]\w*$/.test(w ?? "");

/**
 * Repaints Rust tokens after the TextMate pass, the way nvim-treesitter
 * captures them: fields (`x.field`, `Struct { field: .. }`) as members, enum
 * variants (`Enum::Variant`, variants in an `enum` body) as constants, type
 * paths (`Type::f`) as types, `{ .. }` rest patterns as special, and the
 * keyword-ish words in WORDS.
 */
export function cozyboxTransformer() {
  return {
    name: "cozybox",
    tokens(lines) {
      if (this.options.lang !== "rust") return;
      const tokens = lines.flat();
      const roleAt = (off) => {
        let lo = 0;
        let hi = tokens.length - 1;
        while (lo < hi) {
          const mid = (lo + hi + 1) >> 1;
          if (tokens[mid].offset <= off) lo = mid;
          else hi = mid - 1;
        }
        const t = tokens[lo];
        return t?.htmlStyle ? ROLE_OF.get(signature(t.htmlStyle)) : undefined;
      };

      // significant words of the source, outside comments and strings
      const words = [];
      for (const m of this.source.matchAll(/[A-Za-z_]\w*|::|\.\.=?|->|=>|\S/g)) {
        const role = roleAt(m.index);
        if (role !== "comment" && role !== "string") words.push({ text: m[0], start: m.index, role });
      }

      const paints = new Map(); // start offset -> [end, role]
      const paint = (w, role, from) => from.includes(w.role) && paints.set(w.start, [w.start + w.text.length, role]);
      const stack = []; // kind of each open bracket: "enum", "fields" or null
      words.forEach((w, i) => {
        const prev = words[i - 1]?.text;
        const next = words[i + 1]?.text;
        if (w.role === "punct" && "([{".includes(w.text)) {
          let kind = null;
          if (w.text === "{" && ident(prev) && upper(prev)) {
            if (words[i - 2]?.text === "enum") kind = "enum";
            else {
              let head = i - 1;
              while (words[head - 1]?.text === "::" && ident(words[head - 2]?.text)) head -= 2;
              if (LITERAL_BEFORE.has(words[head - 1]?.text)) kind = "fields";
            }
          }
          stack.push(kind);
          return;
        }
        if (w.role === "punct" && ")]}".includes(w.text)) return stack.pop();
        const inside = stack[stack.length - 1];
        if (w.text === ".." && next === "}" && inside === "fields") return paint(w, "special", ["plain"]);
        if (!ident(w.text)) return;

        if (WORDS[w.text]) paint(w, WORDS[w.text], ["plain", "keyword", "special"]);
        else if (prev === "." && !["(", "::", "!"].includes(next)) paint(w, "member", ["plain"]);
        else if (upper(w.text) && prev === "::" && upper(words[i - 2]?.text ?? "")) paint(w, "constant", ["type", "func", "plain"]);
        else if (upper(w.text) && next === "::") paint(w, "type", ["plain"]);
        else if (upper(w.text) && inside === "enum" && ["{", ",", "]"].includes(prev)) paint(w, "constant", ["type", "func"]);
        else if (!upper(w.text) && inside === "fields" && ["{", ",", "pub", ")"].includes(prev) && [":", ",", "}"].includes(next))
          paint(w, "member", ["plain"]);
      });
      if (!paints.size) return;

      return lines.map((line) =>
        line.flatMap((t) => {
          const out = [];
          let at = 0;
          for (let p = 0; p < t.content.length; p++) {
            const hit = paints.get(t.offset + p);
            if (!hit) continue;
            const end = Math.min(hit[0] - t.offset, t.content.length);
            if (p > at) out.push({ ...t, content: t.content.slice(at, p), offset: t.offset + at });
            out.push({ ...t, content: t.content.slice(p, end), offset: t.offset + p, htmlStyle: style(hit[1]) });
            at = p = end;
            p--;
          }
          if (!out.length) return [t];
          if (at < t.content.length) out.push({ ...t, content: t.content.slice(at), offset: t.offset + at });
          return out;
        }),
      );
    },
  };
}
