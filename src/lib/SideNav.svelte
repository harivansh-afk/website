<script module>
  // the top-level pages that share the sidebar shell, in nav order
  export const sections = [
    ["about", "/"],
    ["software", "/software/"],
    ["projects", "/projects/"],
    ["work", "/work/"],
    ["thoughts", "/thoughts/"],
    ["research", "/research/"],
  ];
</script>

<script>
  import { page } from "$app/state";
</script>

<nav class="side" aria-label="site">
  {#each sections as [name, href]}
    <a
      {href}
      class:active={page.url.pathname === href}
      aria-current={page.url.pathname === href ? "page" : undefined}><span class="link-label">{name}</span></a
    >
  {/each}
</nav>
