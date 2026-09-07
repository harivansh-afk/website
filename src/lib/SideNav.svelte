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
  import { onMount } from "svelte";
  import clickSound from "$lib/sounds/click.mp3";

  let clickAudio;

  onMount(() => {
    // react-sounds' ui/button_soft, bundled locally (see sounds/LICENSE).
    clickAudio = new Audio(clickSound);
    clickAudio.volume = 0.35;
    clickAudio.preload = "auto";

    return () => clickAudio.pause();
  });

  function playClick() {
    if (!clickAudio) return;
    clickAudio.currentTime = 0;
    // Audio failure must never interfere with navigation.
    void clickAudio.play().catch(() => {});
  }
</script>

<nav class="side" aria-label="site">
  {#each sections as [name, href]}
    <a
      {href}
      onclick={playClick}
      class:active={page.url.pathname === href}
      aria-current={page.url.pathname === href ? "page" : undefined}>{name}</a
    >
  {/each}
</nav>
