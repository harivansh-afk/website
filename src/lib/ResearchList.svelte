<ul>
  <li>
    <span>
      <a href="https://harivansh-afk.github.io/cas/" target="_blank" rel="noopener noreferrer"
        >cas</a
      >
    </span>
    <span class="date">[fall 2026]</span>
  </li>
  <li>
    <span>
      <a href="https://harivansh-afk.github.io/llt" target="_blank" rel="noopener noreferrer"
        >llt</a
      >
    </span>
    <span class="date">[fall 2026]</span>
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
