<script>
  import "../style.css";
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import SideNav, { sections } from "$lib/SideNav.svelte";
  import LinkPreviews from "$lib/LinkPreviews.svelte";

  let { children } = $props();

  // top-level pages share the sidebar shell; thought pages and 404 render bare
  const shell = $derived(sections.some(([, href]) => href === page.url.pathname));

  // page-load beacon: the layout mounts once per page entry, so this counts
  // entries only, never client-side navigations
  onMount(() => {
    const hit = () => {
      if (navigator.sendBeacon?.("/counter/hit")) return;
      fetch("/counter/hit", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
      }).catch(() => {});
    };
    if (document.readyState === "complete") hit();
    else addEventListener("load", hit, { once: true });
  });
</script>

{#if shell}
  <div class="page">
    <SideNav />
    {@render children()}
  </div>
{:else}
  {@render children()}
{/if}

<LinkPreviews />
