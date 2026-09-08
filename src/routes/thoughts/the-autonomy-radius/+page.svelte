<script>
  import Seo from "$lib/Seo.svelte";

  export let data;
</script>

<Seo title={data.title} description="How we build the feedback that lets a team of three hand more of the software development lifecycle to agents." />

<main class="thought autonomy">
  <nav><a href="/thoughts/" class="back-link">..</a></nav>
  <article>
    <header>
      <h1>{data.title}</h1>
      <p class="meta">September 2026</p>
    </header>
    {@html data.html}
  </article>
</main>
