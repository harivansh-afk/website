<script module>
  // the top-level pages that share the sidebar shell, in nav order
  export const sections = [
    ["work", "/work/"],
    ["software", "/software/"],
    ["projects", "/projects/"],
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
  <a
    class="social-start"
    href="https://github.com/harivansh-afk"
    target="_blank"
    rel="noopener noreferrer"
    data-preview="heatmap"><span class="link-label">github</span></a
  >
  <a href="https://linkedin.com/in/harivansh-rathi" target="_blank" rel="noopener noreferrer"
    ><span class="link-label">linkedin</span></a
  >
  <a href="https://x.com/HarivanshRathi" target="_blank" rel="noopener noreferrer"
    ><span class="link-label">x.com</span></a
  >
</nav>
