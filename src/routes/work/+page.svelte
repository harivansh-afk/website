<script>
  const title = "work";
  const description = "experiences";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Harivansh Rathi" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content="https://harivan.sh/work/" />
  <meta property="og:image" content="https://harivan.sh/og.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Harivansh Rathi - distributed systems and ai computers" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content="https://harivan.sh/og.png" />
  <script src="/previews.js?v=svelte-15" defer></script>
</svelte:head>

<main>
  <section>
    <ul>
      <li>
        founding engineer,
        <a
          href="https://github.com/indexable-inc/"
          target="_blank"
          rel="noopener noreferrer"
          data-preview="indexable">indexable</a
        >
      </li>
      <li>
        founding engineer,
        <a
          href="https://companion.ai"
          target="_blank"
          rel="noopener noreferrer"
          data-preview="companion">companion</a
        >
      </li>
      <li>
        software engineer,
        <a
          href="https://www.linkedin.com/company/phia-co/"
          target="_blank"
          rel="noopener noreferrer"
          data-preview="phia">phia</a
        >
      </li>
      <li>
        web developer,
        <a href="https://unikove.com/" target="_blank" rel="noopener noreferrer">unikove</a>
      </li>
      <li>
        backend engineer,
        <a href="https://www.moglix.com/" target="_blank" rel="noopener noreferrer">moglix</a>
      </li>
    </ul>
  </section>
</main>
