// the keyboard as a pure function: step(state, key, view) -> { state, effect }.
// no dom, no time, no io, so every keystroke sequence is reproducible and
// testable. the page owns the dom and performs the effect.
//
// state: { pane: "sections" | "rows", s, r, query, typing }
//   s, r   the selected section and row
//   query  null, or the search string filtering every row
//   typing whether keys go to the search prompt
// view:  { sections: n, rows: (state) => n, page: n }
//   how many sections, how many rows the state shows, rows per page
// effect: "open" (the selected row), "home" (leave for the site), or null
//
// keys, vim-shaped: j k (and arrows) move, g G jump to the ends, ctrl-d
// ctrl-u move half a page, l or enter go in, h or - go out (- from the
// sections goes home, like - at the root of a file tree), / searches, esc
// backs out one level at a time

export const initial = { pane: "sections", s: 0, r: 0, query: null, typing: false };

const clamp = (i, n) => Math.max(0, Math.min(n - 1, i));

function move(state, view, to) {
  if (state.pane === "sections") {
    const s = clamp(to(state.s), view.sections);
    return s === state.s ? state : { ...state, s, r: 0 };
  }
  const n = view.rows(state);
  return n ? { ...state, r: clamp(to(state.r), n) } : state;
}

function typing(state, key, view) {
  switch (key) {
    case "Escape":
      return { state: { ...state, query: null, typing: false, r: 0 }, effect: null };
    case "Enter":
      return { state: { ...state, typing: false, pane: "rows" }, effect: null };
    case "Backspace":
      if (!state.query) return { state: { ...state, query: null, typing: false, r: 0 }, effect: null };
      return { state: { ...state, query: state.query.slice(0, -1), r: 0 }, effect: null };
    case "ArrowDown":
    case "ctrl-n":
      return { state: move({ ...state, pane: "rows" }, view, (i) => i + 1), effect: null };
    case "ArrowUp":
    case "ctrl-p":
      return { state: move({ ...state, pane: "rows" }, view, (i) => i - 1), effect: null };
  }
  if (key.length === 1) return { state: { ...state, query: state.query + key, r: 0, pane: "rows" }, effect: null };
  return null;
}

export function step(state, key, view) {
  if (state.typing) return typing(state, key, view);
  const half = Math.max(1, Math.floor(view.page / 2));
  const to = {
    j: (i) => i + 1,
    ArrowDown: (i) => i + 1,
    k: (i) => i - 1,
    ArrowUp: (i) => i - 1,
    g: () => 0,
    Home: () => 0,
    G: () => Infinity,
    End: () => Infinity,
    "ctrl-d": (i) => i + half,
    "ctrl-u": (i) => i - half,
  }[key];
  if (to) return { state: move(state, view, to), effect: null };

  switch (key) {
    case "l":
    case "ArrowRight":
    case "Enter":
      if (state.pane === "sections") return { state: { ...state, pane: "rows" }, effect: null };
      return { state, effect: key === "ArrowRight" ? null : "open" };
    case "h":
    case "ArrowLeft":
    case "-":
      if (state.query !== null) return { state: { ...state, query: null, r: 0, pane: "sections" }, effect: null };
      if (state.pane === "rows") return { state: { ...state, pane: "sections" }, effect: null };
      return { state, effect: key === "-" ? "home" : null };
    case "/":
      return { state: { ...state, query: "", typing: true, r: 0, pane: "rows" }, effect: null };
    case "Escape":
      if (state.query !== null) return { state: { ...state, query: null, r: 0 }, effect: null };
      if (state.pane === "rows") return { state: { ...state, pane: "sections" }, effect: null };
      return { state, effect: "home" };
  }
  return null; // not ours: let the browser have it
}

// a KeyboardEvent as step() spells it
export function keyName(e) {
  if (e.metaKey || e.altKey) return null;
  if (e.ctrlKey) return ["d", "u", "n", "p"].includes(e.key) ? `ctrl-${e.key}` : null;
  return e.key;
}
