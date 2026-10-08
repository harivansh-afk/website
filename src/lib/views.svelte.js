// view counts, baked into /views.json by tools/views.mjs (on every build, and
// every few minutes by a timer on spark). fetched once per page entry, on
// first use; until it answers (or when it can't, as under `vite dev`) every
// count is undefined and nothing is shown
const state = $state({ views: {} });
let requested = false;

function request() {
  if (requested || typeof window === "undefined") return;
  requested = true;
  fetch("/views.json", { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((data) => {
      state.views = data.views ?? {};
    })
    .catch(() => {});
}

// keyed by a thought's href (see thoughts.js)
export function viewsOf(href) {
  request();
  return state.views[href];
}

export const formatCount = (n) => n.toLocaleString("en-US");
