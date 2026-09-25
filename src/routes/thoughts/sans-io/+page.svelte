<script>
  import Seo from "$lib/Seo.svelte";

  let { data } = $props();
</script>

<Seo
  title={data.title}
  description="Moving I/O out of state machines, with a Rust retry example, controlled event orderings, and reproducible failures."
/>

<main class="thought sans-io">
  <nav><a href="/thoughts/" class="back-link" aria-label="Back to thoughts">..</a></nav>
  <article>
    <header>
      <h1>{data.title}</h1>
      <p class="meta">September 2026</p>
    </header>
    {@html data.html}
  </article>
</main>

<style>
  h1 { text-wrap: balance; }
  article :global(h2) { margin-top: 2.5em; }
  article :global(pre) { width: 100%; font-size: 0.78em; }
  article :global(figure picture) { display: block; }
  article :global(figure img) { min-width: 0; }
  article :global(figcaption) { max-width: 65ch; }
  article :global(a code) { color: inherit; }

  @media (prefers-color-scheme: light) {
    article :global(pre) { background: #fff; }
  }

  @media (max-width: 640px) {
    main.sans-io { font-size: 1rem; padding-inline: 1rem; }
    article :global(pre) { font-size: 0.82em; padding: 0.75rem; }
  }
</style>
