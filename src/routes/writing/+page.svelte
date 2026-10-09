<script>
  import Seo from "#lib/Seo.svelte";
  import ThoughtRow from "#lib/ThoughtRow.svelte";
  import { thoughts } from "#lib/thoughts.js";

  // newest year first; the year sits in the gutter beside its first row
  const years = [...new Set(thoughts.map((t) => t.year))].map((year) => ({
    year,
    items: thoughts.filter((t) => t.year === year),
  }));
</script>

<Seo title="writing" description="on systems, LLMs and life." />

<main>
  <header class="blk first" style:--off="16.667%" style:--w="41.667%" style:--gap="6rem">
    <h1 class="label blue title">writing</h1>
    <p class="intro">on systems, agents and life.</p>
  </header>

  <section class="blk" style:--off="8.333%" style:--w="75%" aria-label="index">
    {#each years as group}
      <section class="year" aria-label={String(group.year)}>
        <h2 class="fig">{group.year}</h2>
        <ul class="rows">
          {#each group.items as thought}
            <li><ThoughtRow {thought} /></li>
          {/each}
        </ul>
      </section>
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
  .year {
    display: grid;
    gap: 0.25rem 1.25rem;
  }
  .year + .year {
    margin-top: 1.5rem;
  }
  .year h2 {
    padding-block: 0.6rem;
  }
  .year :global(.name) {
    font-size: 0.9375rem;
  }
  @media (min-width: 640px) {
    .year {
      grid-template-columns: 6rem minmax(0, 1fr);
    }
  }
  @media (max-width: 639px) {
    .year h2 {
      padding-block: 0 0.15rem;
    }
  }
</style>
