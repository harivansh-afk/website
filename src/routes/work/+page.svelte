<script>
  import Seo from "$lib/Seo.svelte";
</script>

<Seo title="work" description="experiences" />

<main>
  <section>
    <ul>
      <li>
        <span>
          founding engineer,
          <a
            href="https://github.com/indexable-inc/"
            target="_blank"
            rel="noopener noreferrer"
            data-preview="indexable">indexable</a
          >
        </span>
        <span class="date">[summer 2026 - present]</span>
      </li>
      <li>
        <span>
          founding engineer,
          <a
            href="https://companion.ai"
            target="_blank"
            rel="noopener noreferrer"
            data-preview="companion">companion</a
          >
        </span>
        <span class="date">[spring 2026]</span>
      </li>
      <li>
        <span>
          software engineer,
          <a
            href="https://www.linkedin.com/company/phia-co/"
            target="_blank"
            rel="noopener noreferrer"
            data-preview="phia">phia</a
          >
        </span>
        <span class="date">[summer & fall 2025]</span>
      </li>
      <li>
        <span>
          web developer,
          <a href="https://unikove.com/" target="_blank" rel="noopener noreferrer">unikove</a>
        </span>
        <span class="date">[summer 2024]</span>
      </li>
      <li>
        <span>
          backend engineer,
          <a href="https://www.moglix.com/" target="_blank" rel="noopener noreferrer">moglix</a>
        </span>
        <span class="date">[summer 2023]</span>
      </li>
    </ul>
  </section>
</main>

<style>
  ul {
    display: grid;
    grid-template-columns: max-content max-content;
    column-gap: 3rem;
    width: fit-content;
  }

  li {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    align-items: baseline;
  }

  .date {
    color: color-mix(in srgb, var(--muted) 72%, transparent);
    font-size: 0.85em;
    text-align: right;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    ul {
      grid-template-columns: minmax(0, 1fr) max-content;
      column-gap: 1rem;
      width: 100%;
    }
  }
</style>
