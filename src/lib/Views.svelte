<script>
  // "1,204 views" for a thought's href, or for the current page when none is
  // given. renders nothing until views.json answers
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import { viewsOf, formatCount } from "#lib/views.svelte.js";

  let { href } = $props();

  let mounted = $state(false);
  onMount(() => (mounted = true));

  const n = $derived(mounted ? viewsOf(href ?? page.url.pathname) : undefined);
</script>

{#if n !== undefined}<span class="views">{formatCount(n)} {n === 1 ? "view" : "views"}</span>{/if}
