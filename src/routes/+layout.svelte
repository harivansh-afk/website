<script>
  import "../style.css";
  import { onMount } from "svelte";
  import { afterNavigate, onNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import CodeDefs from "#lib/CodeDefs.svelte";
  import Dots from "#lib/Dots.svelte";
  import { mountInteractionSounds } from "#lib/interactionSounds.js";

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
    { name: "writing", href: "/writing/", match: /^\/(writing|thoughts)\// },
    { name: "software", href: "/software/", match: /^\/software\// },
    { name: "harivan.sh", href: "/developer/", match: /^\/developer\// },
  ];

  // /developer is its own world (its own palette and chrome), so the layout
  // steps aside for it, and crossing into or out of it powers the screen on
  // like a crt, via a view transition
  const developer = $derived(page.url.pathname.startsWith("/developer"));
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    const crossing = [navigation.from, navigation.to].filter((end) => end?.url.pathname.startsWith("/developer"));
    if (crossing.length !== 1) return;
    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

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
            ><Dots glyph="lb" />{section.name}<Dots glyph="rb" /></a
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
      <p class="colophon">© 2026 harivansh rathi</p>
    </footer>
  </div>
{/if}

<CodeDefs />
