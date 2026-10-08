<script>
  // one thought as an index row: title left, view count right
  import Views from "#lib/Views.svelte";

  let { thought } = $props();

  const external = $derived(thought.href.startsWith("http"));
</script>

<a
  class="row bare"
  href={thought.href}
  target={external ? "_blank" : undefined}
  rel={external ? "noopener noreferrer" : undefined}
  ><span class="name">{thought.title}</span><span class="fig"><Views href={thought.href} /></span></a
>

