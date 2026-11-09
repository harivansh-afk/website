<script>
  import Seo from "#lib/Seo.svelte";
  import Views from "#lib/Views.svelte";

  let { data } = $props();
</script>

<!-- a draft: reachable by its address, unlisted in thoughts.js, kept out of search -->
<Seo title={data.title} type="article" description="Compiling BAML to Rust." />
<svelte:head><meta name="robots" content="noindex" /></svelte:head>

<main class="thought baml-rust">
  <article>
    <header>
      <h1>{data.title}</h1>
      <p class="meta"><span>draft</span><Views /></p>
    </header>
    {@html data.body}
  </article>
</main>

<style>
  h1 { text-wrap: balance; }
  article :global(pre) { width: 100%; font-size: 0.78em; }
  article :global(figure picture) { display: block; }
  article :global(figcaption) { max-width: 65ch; }
  article :global(a code) { color: inherit; }
  article :global(.draft) { white-space: pre-line; opacity: 0.75; }

  @media (prefers-color-scheme: light) {
    article :global(.code) { background: #fff; }
  }

  @media (max-width: 640px) {
    article :global(pre) { font-size: 0.82em; padding: 0.75rem; }
  }
</style>
