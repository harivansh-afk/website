<script>
  const title = "thoughts";
  const description = "writing on systems, agents and computers";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Harivansh Rathi" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="https://harivan.sh/thoughts/" />
  <meta property="og:image" content="https://harivan.sh/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Harivansh Rathi - distributed systems and ai computers" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://harivan.sh/og.png" />
</svelte:head>

<main>
  <section>
    <ul>
      <li>
        June 2026, <a href="/thoughts/the-self-cleaning-codebase/">the self-cleaning codebase</a>
      </li>
      <li>April 2026, <a href="/thoughts/throw-out-your-macbook/">throw out your macbook</a></li>
      <li>
        March 2026,
        <a href="/thoughts/reflections-on-the-agent-environment/"
          >reflections on the agent environment</a
        >
      </li>
      <li>
        February 2026,
        <a href="/thoughts/isolated-long-running-agents-with-kubernetes/">the agent environment</a>
      </li>
      <li>
        January 2026,
        <a href="/thoughts/the-asymmetry-of-verification/">the asymmetry of verification</a>
      </li>
      <li>December 2025, <a href="/thoughts/the-growth-team-is-dead/">the growth team</a></li>
      <li>May 2025, <a href="/thoughts/my-core-principles/">core principles</a></li>
    </ul>
  </section>
</main>
