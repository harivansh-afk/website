<script>
  import "../style.css";
  import { onMount } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import CodeDefs from "#lib/CodeDefs.svelte";
  import Dots from "#lib/Dots.svelte";
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

  // back from the other domain via bfcache: the page is still switched off
  onMount(() => {
    const on = () => document.documentElement.classList.remove("crt-off");
    addEventListener("pageshow", on);
    return () => removeEventListener("pageshow", on);
  });
</script>

<svelte:head>{@html speculation}</svelte:head>

{#if developer}
  {@render children()}
{:else}
  <div class="site">
    <header class="top">
      <a class="who bare" href="/">hari</a>
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
