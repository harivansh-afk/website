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

  /* mobile: the two columns don't fit, so stack each entry - title line,
     muted date beneath */
  @media (max-width: 640px) {
    ul {
      display: block;
      width: auto;
    }
    li {
      display: block;
      margin-block: 0.9rem;
    }
    li:first-child {
      margin-top: 0;
    }
    li > span {
      display: block;
    }
    .date {
      text-align: left;
    }
  }
</style>
