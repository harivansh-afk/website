<script>
  import Seo from "$lib/Seo.svelte";
</script>

<Seo title="thoughts" description="writing on systems, agents and computers" />

<main>
  <section>
    <ul>
      <li>
        <span><a href="/thoughts/the-self-cleaning-codebase/">the self-cleaning codebase</a></span>
        <span class="date">[June 2026]</span>
      </li>
      <li>
        <span><a href="/thoughts/throw-out-your-macbook/">throw out your macbook</a></span>
        <span class="date">[April 2026]</span>
      </li>
      <li>
        <span>
          <a href="/thoughts/reflections-on-the-agent-environment/"
            >reflections on the agent environment</a
          >
        </span>
        <span class="date">[March 2026]</span>
      </li>
      <li>
        <span>
          <a href="/thoughts/isolated-long-running-agents-with-kubernetes/">the agent environment</a>
        </span>
        <span class="date">[February 2026]</span>
      </li>
      <li>
        <span>
          <a href="/thoughts/the-asymmetry-of-verification/">the asymmetry of verification</a>
        </span>
        <span class="date">[January 2026]</span>
      </li>
      <li>
        <span><a href="/thoughts/the-growth-team-is-dead/">the growth team</a></span>
        <span class="date">[December 2025]</span>
      </li>
      <li>
        <span><a href="/thoughts/my-core-principles/">core principles</a></span>
        <span class="date">[May 2025]</span>
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
