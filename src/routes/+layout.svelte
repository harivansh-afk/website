<script>
  import "../style.css";
  import { onMount } from "svelte";
  import { afterNavigate, onNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import CodeDefs from "#lib/CodeDefs.svelte";
  import Dots from "#lib/Dots.svelte";
  import Who from "#lib/Who.svelte";
  import { mountInteractionSounds } from "#lib/interactionSounds.js";
  import { DEV, CAFE } from "#lib/site.js";

  let { children } = $props();

  onMount(mountInteractionSounds);

  // the view beacon: Caddy answers it and writes it to a log that
  // tools/views.mjs sums into views.json. `e` marks a page load (the layout
  // mounts once per entry); every client-side nav after it reports its path
  // too, so a thought read by clicking through from the index still counts
  function hit(entry) {
    const url = `/counter/hit?p=${encodeURIComponent(location.pathname)}${entry ? "&e=1" : ""}`;
    if (navigator.sendBeacon?.(url)) return;
    fetch(url, { method: "POST", credentials: "same-origin", keepalive: true }).catch(() => {});
  }
  onMount(() => {
    if (document.readyState === "complete") hit(true);
    else addEventListener("load", () => hit(true), { once: true });
  });
  afterNavigate(({ type }) => {
    if (type !== "enter") hit(false);
  });

  // moving between pages. the page itself swaps at once and its blocks rise
  // in one after another (`html.entering`, style.css); on top of that, a view
  // transition carries what both pages share from where it was to where it
  // lands: a thought's title between its row on /writing/ and its heading,
  // and the current section's brackets along the nav. a thing is only carried
  // when it is on screen on both sides, so nothing flies in from off the
  // page. browsers without view transitions get the rise alone
  const onScreen = (el) => {
    const r = el?.getBoundingClientRect();
    return r && r.bottom > 0 && r.top < innerHeight && r.width > 0;
  };
  // asked before the swap, these find the old page's elements; after it, the new one's
  const titleOf = (path) => (path.startsWith("/thoughts/") ? document.querySelector("main.thought h1") : null);
  const rowOf = (path) => document.querySelector(`.rows a[href="${path}"] .name`);
  const brackets = () => [...document.querySelectorAll(".top nav a[aria-current] > .dots")];

  // the pair of elements to carry: [on the page we leave, on the page we reach]
  const shared = (from, to) => [
    { name: "title", old: () => rowOf(to) ?? titleOf(from), new: () => titleOf(to) ?? rowOf(from) },
    { name: "bracket-l", old: () => brackets()[0], new: () => brackets()[0] },
    { name: "bracket-r", old: () => brackets()[1], new: () => brackets()[1] },
  ];

  // while a transition plays the browser sends every press to the page root,
  // so the site would go dead for its length. a press ends it on the spot and
  // goes to the link under the pointer, as if nothing had been moving
  let running = null;
  function cutIn(e) {
    if (!running || e.button !== 0) return;
    running.skipTransition();
    running = null;
    const link = document.elementFromPoint(e.clientX, e.clientY)?.closest("a[href]");
    if (!link) return;
    e.preventDefault();
    link.click();
  }
  onMount(() => {
    addEventListener("pointerdown", cutIn, true);
    return () => removeEventListener("pointerdown", cutIn, true);
  });

  let settle;
  onNavigate((navigation) => {
    const from = navigation.from?.url.pathname;
    const to = navigation.to?.url.pathname;
    if (!from || !to || from === to) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    // the brackets jump rather than fade while the nav swaps under the transition
    root.classList.add("navigating");
    const done = () => root.classList.remove("navigating");
    // sveltekit's jump to the top must land before the new page is captured,
    // not glide there underneath it
    root.style.scrollBehavior = "auto";
    const enter = () => {
      clearTimeout(settle);
      root.classList.remove("entering");
      void root.offsetWidth; // restart the rise if a nav lands mid-rise
      root.classList.add("entering");
      // carrying-title goes with the rise, not with the transition: the
      // transition ends first, and dropping it then would start the h1's rise
      settle = setTimeout(() => root.classList.remove("entering", "carrying-title"), 600);
    };
    navigation.complete.then(() => (root.style.scrollBehavior = ""), () => (root.style.scrollBehavior = ""));

    if (!document.startViewTransition) {
      navigation.complete.then(enter, () => {}).finally(done);
      return;
    }

    const pairs = shared(from, to);
    const named = [];
    const mark = (el, name) => {
      el.style.viewTransitionName = name;
      named.push(el);
    };
    const olds = pairs.map((p) => {
      const el = p.old();
      return onScreen(el) ? el : null;
    });
    olds.forEach((el, i) => el && mark(el, pairs[i].name));

    return new Promise((resolve) => {
      const transition = document.startViewTransition(async () => {
        named.forEach((el) => (el.style.viewTransitionName = ""));
        resolve();
        await navigation.complete;
        pairs.forEach((p, i) => {
          const el = p.new();
          // carried only if it was on screen before and is now
          if (olds[i] && onScreen(el)) mark(el, p.name);
        });
        root.classList.toggle("carrying-title", !!titleOf(to) && named.includes(titleOf(to)));
        enter();
      });
      running = transition;
      transition.finished.finally(() => {
        if (running === transition) running = null;
        done();
        named.forEach((el) => (el.style.viewTransitionName = ""));
      });
    });
  });

  const sections = [
    // each section's colour is its labels' marker colour (style.css)
    { name: "writing", href: "/writing/", match: /^\/(writing|thoughts)\//, color: "var(--blue)" },
    { name: "software", href: "/software/", match: /^\/software\//, color: "var(--amber)" },
  ];

  // the developer screen is its own world (palette, chrome, domain), so the
  // layout steps aside for it. matched by route, not path: on harivan.sh it
  // is the root
  const developer = $derived(page.route.id === "/developer");

  // hovering a link to the other domain prefetches its page, so the jump
  // lands on a document the browser already has (chrome; others just go)
  const speculation = `<script type="speculationrules">${JSON.stringify({
    prefetch: [{ where: { href_matches: [`${DEV}/*`, `${CAFE}/*`] }, eagerness: "moderate" }],
  })}</` + "script>";
</script>

<svelte:head>{@html speculation}</svelte:head>

{#if developer}
  {@render children()}
{:else}
  <div class="site">
    <header class="top">
      <Who />
      <nav aria-label="site">
        {#each sections as section}
          <a
            class="bare"
            href={section.href}
            aria-current={section.match.test(page.url.pathname) ? "page" : undefined}
            style:--c={section.color}
            ><Dots glyph="lb" />{#if section.name === "writing" && page.url.pathname.startsWith("/thoughts/")}<span
                class="back"><Dots glyph="back" label="back to" /></span
              >{/if}{section.name}<Dots glyph="rb" /></a
          >
        {/each}
      </nav>
    </header>

    {@render children()}

    <!-- benja.dev's last row: elsewhere on the left, the colophon on the right -->
    <footer class="blk foot" style:--off="16.667%" style:--w="66.667%">
      <nav class="elsewhere" aria-label="elsewhere">
        <a href="https://github.com/harivansh-afk" target="_blank" rel="noopener noreferrer">github</a>
        <a href="https://linkedin.com/in/harivansh-rathi" target="_blank" rel="noopener noreferrer">linkedin</a>
        <a href="https://x.com/HarivanshRathi" target="_blank" rel="noopener noreferrer">x</a>
      </nav>
      <p class="colophon">© 2026 hari</p>
    </footer>
  </div>
{/if}

<CodeDefs />
