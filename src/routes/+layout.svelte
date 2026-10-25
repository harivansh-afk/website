<script>
  import "../style.css";
  import { onMount } from "svelte";
  import { afterNavigate, beforeNavigate, onNavigate } from "$app/navigation";
  import { page, updated } from "$app/state";
  import CodeDefs from "#lib/CodeDefs.svelte";
  import Dots from "#lib/Dots.svelte";
  import Who from "#lib/Who.svelte";
  import { DEV, CAFE } from "#lib/site.js";

  let { children } = $props();

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

  // moving between pages. the new page swaps in at once and its blocks rise
  // (style.css, once html.navigated is set). no view transition: while one
  // runs the browser sends every press to the page root and freezes hover,
  // which is exactly the dead nav it would cost. a new page also lands at
  // its top at once rather than gliding there under the smooth scroll that
  // in-page links use; afterNavigate runs once that scroll is done
  const root = () => document.documentElement;
  // a tab left open across a deploy loads the next page whole, from the
  // new build, rather than routing with the old one (sveltekit notices on
  // focus and hourly)
  beforeNavigate(({ willUnload, to }) => {
    if (updated.current && !willUnload && to?.url) location.href = to.url.href;
  });
  onNavigate(({ from, to }) => {
    root().classList.add("navigated");
    if (from?.url.pathname !== to?.url.pathname) root().style.scrollBehavior = "auto";
  });
  afterNavigate(({ type }) => {
    root().style.scrollBehavior = "";
    if (type !== "enter") hit(false);
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

<svelte:head>
  {@html speculation}
  <!-- the faces on every first paint of the site (style.css); the developer
       screen preloads its own -->
  {#if !developer}
    <link rel="preload" href="/fonts/SuisseIntl-Light.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
    <link rel="preload" href="/fonts/DepartureMono-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
  {/if}
</svelte:head>

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
        <a href="https://x.com/HarivanshRathi" target="_blank" rel="noopener noreferrer">x.com</a>
      </nav>
      <p class="colophon">© 2026 hari</p>
    </footer>
  </div>
{/if}

<CodeDefs />
