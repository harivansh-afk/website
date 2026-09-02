<ul>
  <li>
    <span>
      <a href="https://harivansh-afk.github.io/cas/" target="_blank" rel="noopener noreferrer"
        >Content-addressed Deduplication</a
      >
    </span>
    <span class="date">[fall 2026]</span>
  </li>
  </ul>

<style>
  /* title column flexes, dates sit flush with the content column's right
     edge - the same x on every page regardless of the longest title */
  ul {
    display: grid;
    grid-template-columns: minmax(0, 1fr) max-content;
    column-gap: 3rem;
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
