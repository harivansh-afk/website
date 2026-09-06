<script module>
  // the top-level pages that share the sidebar shell, in nav order
  export const sections = [
    ["about", "/"],
    ["projects", "/projects/"],
    ["work", "/work/"],
    ["thoughts", "/thoughts/"],
    ["research", "/research/"],
  ];
</script>

<script>
  import { page } from "$app/state";

  // the projects mockup lives at /mockup2/ but is the projects page
  const active = (href) =>
    page.url.pathname === href || (href === "/projects/" && page.url.pathname === "/mockup2/");
</script>

<nav class="side" aria-label="site">
  {#each sections as [name, href]}
    <a
      {href}
      class:active={active(href)}
      aria-current={active(href) ? "page" : undefined}>{name}</a
    >
  {/each}
</nav>
