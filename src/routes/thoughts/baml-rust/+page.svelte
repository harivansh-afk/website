<script>
  import Seo from "#lib/Seo.svelte";
  import Views from "#lib/Views.svelte";

  let { data } = $props();
</script>

<Seo
  title={data.title}
  type="article"
  description="We wrote a new backend for the BAML compiler that lets us compile all BAML code into Rust."
/>

<main class="thought baml-rust">
  <article>
    <header>
      <h1>{data.title}</h1>
      <p class="meta"><span>November 2026</span><span>~7 min read</span><Views /></p>
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

  /* benchmark tables: mono figures, hairline rows, labels in the pixel face */
  article :global(table) { width: 100%; margin-block: 1.75rem; border-collapse: collapse; font-size: 0.9em; }
  article :global(th) {
    padding: 0 0 0.6rem; border-bottom: 1px solid var(--line);
    font-family: var(--pixel); font-size: var(--pixel-size); font-weight: normal;
    text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted);
  }
  article :global(td) { padding: 0.55rem 0; border-bottom: 1px solid var(--line); }
  article :global(:is(th, td) + :is(th, td)) { padding-left: 1rem; }
  article :global(td[align="right"]) { font-family: var(--mono); font-size: 0.875em; font-variant-numeric: tabular-nums; white-space: nowrap; }
  article :global(td mark) { padding: 0.1em 0.35em; }

  /* hover terms in prose: a dotted underline, the code popover on hover */
  article :global(.term) { text-decoration: underline dotted color-mix(in srgb, currentColor 55%, transparent); text-underline-offset: 0.2em; cursor: help; outline: none; }
  article :global(.term:focus-visible) { outline: 1px solid var(--fg); outline-offset: 0.125rem; }

  /* code tabs: neighbouring blocks share a frame; their names are tabs in its bar */
  article :global(.code-tabs) { position: relative; margin-block: 1.5rem; }
  article :global(.code-tabs .tab-input) { position: absolute; opacity: 0; pointer-events: none; }
  article :global(.code-tabs .tab-panel) { display: none; }
  article :global(.code-tabs .tab-panel .code) { margin: 0; }
  article :global(.code-tabs .tab-panel .code-name) { visibility: hidden; }
  article :global(.code-tabs .tab-labels) {
    position: absolute; z-index: 1; top: 1px; left: 1rem;
    display: flex; gap: 1.25rem; padding-block: 0.5rem;
    font-family: var(--pixel); font-size: var(--pixel-size); line-height: 1.4;
  }
  article :global(.code-tabs .tab-labels label) { color: var(--code-muted); cursor: pointer; }
  article :global(.code-tabs .tab-labels label:hover) { color: var(--code-fg); }
  article :global(.code-tabs .tab-input:nth-of-type(1):checked ~ .tab-panel:nth-of-type(1)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(1):checked ~ .tab-labels label:nth-of-type(1)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(1):focus-visible ~ .tab-labels label:nth-of-type(1)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }
  article :global(.code-tabs .tab-input:nth-of-type(2):checked ~ .tab-panel:nth-of-type(2)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(2):checked ~ .tab-labels label:nth-of-type(2)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(2):focus-visible ~ .tab-labels label:nth-of-type(2)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }
  article :global(.code-tabs .tab-input:nth-of-type(3):checked ~ .tab-panel:nth-of-type(3)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(3):checked ~ .tab-labels label:nth-of-type(3)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(3):focus-visible ~ .tab-labels label:nth-of-type(3)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }
  article :global(.code-tabs .tab-input:nth-of-type(4):checked ~ .tab-panel:nth-of-type(4)) { display: block; }
  article :global(.code-tabs .tab-input:nth-of-type(4):checked ~ .tab-labels label:nth-of-type(4)) { color: var(--code-fg); text-decoration: underline; text-underline-offset: 0.35em; }
  article :global(.code-tabs .tab-input:nth-of-type(4):focus-visible ~ .tab-labels label:nth-of-type(4)) { outline: 1px solid var(--code-fg); outline-offset: 0.2rem; }


  @media (max-width: 640px) {
    article :global(pre) { font-size: 0.82em; padding: 0.75rem; }
  }
</style>
