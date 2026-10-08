<script>
  import Seo from "#lib/Seo.svelte";
  import Piece from "#lib/Piece.svelte";
  import { software } from "#lib/software.js";

  // the canvas: every catalog entry with a placement, in catalog order
  const pieces = software.filter((entry) => entry.canvas);
</script>

<Seo title="software" description="creations of the past." />

<main>
  <header class="blk first" style:--off="16.667%" style:--w="41.667%" style:--gap="6rem">
    <h1 class="label title">software</h1>
    <p class="intro">creations of the past.</p>
  </header>

  <section class="blk canvas" aria-label="software">
    {#each pieces as piece}
      <Piece {piece} />
    {/each}
  </section>
</main>

<style>
  .title {
    font-family: var(--mono);
    font-size: 0.875rem;
    text-transform: none;
    letter-spacing: 0;
    color: var(--fg);
    margin-bottom: 0.75rem;
  }
  .intro {
    max-width: 44ch;
    font-size: 0.8125rem;
    line-height: 1.75;
  }

  .canvas {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    row-gap: 2.75rem;
    align-items: start;
  }
  @media (min-width: 640px) {
    .canvas {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 1.5rem;
    }
  }
  @media (min-width: 1152px) {
    .canvas {
      grid-template-columns: repeat(12, minmax(0, 1fr));
      column-gap: 1.25rem;
      row-gap: 4rem;
    }
  }
</style>
