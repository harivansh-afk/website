<script>
  import Seo from "$lib/Seo.svelte";
  import ProjectsGrid from "$lib/ProjectsGrid.svelte";
  import { sections } from "$lib/SideNav.svelte";
  import { projects } from "$lib/projects.js";

  // mockup 2: the projects page as a full-width brutalist grid. the sidebar
  // shell is replaced by a top bar; everything else is the site's own
  // palette and type. the live /projects/ page is untouched.
  const n = String(projects.length).padStart(2, "0");
</script>

<Seo title="projects" description="things i've built" />
<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="brut">
  <header class="bar">
    <a href="/" class="brand">harivan.sh</a>
    <nav aria-label="site">
      {#each sections as [name, href]}
        <a {href} class:active={name === "projects"} aria-current={name === "projects" ? "page" : undefined}
          >{name}</a
        >
      {/each}
    </nav>
  </header>

  <section class="mast">
    <h1>projects</h1>
    <dl class="meta">
      <div><dt>entries</dt><dd>{n}</dd></div>
      <div><dt>format</dt><dd>16:9 plates, 3 x 3</dd></div>
      <div><dt>status</dt><dd>4 live, 3 archived, 1 c&amp;d</dd></div>
    </dl>
  </section>

  <ProjectsGrid />

  <footer class="bar foot">
    <span>{n} projects</span>
    <span class="muted">mockup 2 of the projects page. the live page is <a href="/projects/">/projects/</a></span>
  </footer>
</main>

<style>
  main.brut {
    --line: color-mix(in srgb, var(--fg) 22%, transparent);
    max-width: none;
    margin: 0;
    padding: 0;
    min-height: calc(100svh / 1.2);
    display: flex;
    flex-direction: column;
  }

  /* top and bottom bars: one line of uppercase, tracked labels */
  .bar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.8rem 1rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.75rem;
    border-bottom: 1px solid var(--line);
  }
  .bar a {
    background-image: none;
  }
  .brand {
    color: var(--fg);
  }
  nav {
    display: flex;
    gap: 1.5rem;
  }
  nav a.active {
    color: var(--fg);
    text-decoration: underline;
    text-underline-offset: 0.35em;
    text-decoration-thickness: 1px;
  }
  .foot {
    margin-top: auto;
    border-bottom: 0;
    color: var(--muted);
  }
  .foot .muted a {
    color: var(--fg);
  }

  /* masthead: the word, huge and regular weight, with a spec sheet beside it */
  .mast {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 2rem;
    padding: 2.5rem 1rem 1.5rem;
  }
  h1 {
    margin: 0;
    font-size: clamp(3rem, 9vw, 7.5rem);
    line-height: 0.9;
    letter-spacing: -0.04em;
    color: var(--fg);
  }
  .meta {
    margin: 0;
    display: grid;
    gap: 0.15rem;
    font-size: 0.8rem;
    line-height: 1.5;
  }
  .meta div {
    display: grid;
    grid-template-columns: 5rem auto;
    gap: 1rem;
  }
  .meta dt {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.7rem;
    color: var(--muted);
    align-self: baseline;
  }
  .meta dd {
    margin: 0;
    color: var(--fg);
  }

  @media (max-width: 700px) {
    .bar {
      gap: 1rem;
      flex-wrap: wrap;
    }
    nav {
      gap: 1rem;
      flex-wrap: wrap;
    }
    .mast {
      grid-template-columns: 1fr;
      align-items: start;
      padding: 1.75rem 1rem 1.25rem;
    }
    .foot {
      flex-direction: column;
      gap: 0.3rem;
    }
  }
</style>
