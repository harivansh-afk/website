<script>
  import "../style.css";
  import { page } from "$app/state";
  import SideNav from "$lib/SideNav.svelte";
  let { children } = $props();

  // top-level pages share the sidebar shell; thought pages and 404 render bare
  const sections = {
    "/": "about",
    "/work/": "work",
    "/projects/": "projects",
    "/thoughts/": "thoughts",
  };
  const current = $derived(sections[page.url.pathname]);
</script>

{#if current}
  <div class="page">
    <SideNav {current} />
    {@render children()}
  </div>
{:else}
  {@render children()}
{/if}
