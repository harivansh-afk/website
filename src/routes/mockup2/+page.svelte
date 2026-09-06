<script>
  import Seo from "$lib/Seo.svelte";
  import ProjectsGrid from "$lib/ProjectsGrid.svelte";

  // mockup 2: the projects page inside the normal sidebar shell, with the
  // rows replaced by a two-column grid of 16:9 plates. the content column
  // widens for this page only. the live /projects/ page is untouched.
</script>

<Seo title="projects" description="things i've built" />
<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="wide">
  <section>
    <ProjectsGrid />
  </section>
</main>

<style>
  /* the shell's content column is 42rem for prose; the grid gets 60rem */
  :global(.page:has(main.wide)) {
    grid-template-columns: 8rem minmax(0, 60rem);
  }
</style>
