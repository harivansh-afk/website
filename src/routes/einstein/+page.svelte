<script>
  import { onMount } from "svelte";
  import { software } from "#lib/software.js";

  const articleUrl = software.find((s) => s.name === "einstein").href;

  onMount(() => {
    window.location.replace(articleUrl);
  });
</script>

<svelte:head>
  <title>Einstein — Harivansh Rathi</title>
  <meta name="robots" content="noindex" />
  <meta http-equiv="refresh" content={`0;url=${articleUrl}`} />
</svelte:head>
