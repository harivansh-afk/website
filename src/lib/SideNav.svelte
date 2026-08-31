<script>
  let { current } = $props();
  const items = [
    ["about", "/"],
    ["projects", "/projects/"],
    ["work", "/work/"],
    ["thoughts", "/thoughts/"],
  ];
</script>

<nav class="side" aria-label="site">
  {#each items as [name, href]}
    <a {href} class:active={current === name} aria-current={current === name ? "page" : undefined}
      >{name}</a
    >
  {/each}
</nav>
