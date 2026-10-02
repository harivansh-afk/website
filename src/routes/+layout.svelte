<script>
  import "../style.css";
  import { onMount } from "svelte";
  import LinkPreviews from "#lib/LinkPreviews.svelte";
  import CodeDefs from "#lib/CodeDefs.svelte";
  import { mountInteractionSounds } from "#lib/interactionSounds.js";

  let { children } = $props();

  onMount(mountInteractionSounds);

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

{@render children()}

<LinkPreviews />
<CodeDefs />
