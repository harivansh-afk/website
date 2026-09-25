<script>
  import Seo from "$lib/Seo.svelte";
  import NetworkTiming from "$lib/NetworkTiming.svelte";

  let { data } = $props();
</script>

<Seo
  title={data.title}
  description="Separating request logic from network work so the same messages and time inputs can reproduce a failure."
/>

<main class="thought sans-io">
  <nav><a href="/thoughts/" class="back-link" aria-label="Back to thoughts">..</a></nav>
  <article>
    <header>
      <h1>{data.title}</h1>
      <p class="meta">September 2026</p>
    </header>

    {#each data.blocks as block}
      {#if block.type === "network-timing"}
        <NetworkTiming caption={block.caption} />
      {:else}
        {@html block.html}
      {/if}
    {/each}
  </article>
</main>

<style>
  h1 { text-wrap: balance; }
  .sans-io :global(.code-example) { font-size: 0.8em; }
  .sans-io :global(.code-example pre) { width: 100%; }
</style>
