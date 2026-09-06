<script>
  import { onMount } from "svelte";
  import ProjectMedia from "$lib/ProjectMedia.svelte";
  import { projects } from "$lib/projects.js";

  // the projects as a grid: every project sits on an identical 16:9 plate,
  // so portrait recordings (mixbridge, nap) and odd-ratio screenshots tile
  // into one even grid. two columns and eight projects come out square.
  let expanded = $state(null); // click-to-expand lightbox

  onMount(() => {
    // #expand=<name> pins one open; used to screenshot the site itself
    const pin = location.hash.match(/^#expand=([\w-]+)$/);
    if (pin) expanded = projects.find((p) => p.media.includes(pin[1])) ?? null;
  });
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && (expanded = null)} />

<div class="grid">
  {#each projects as p, i}
    <div class="cell" style="--i: {i}">
      <button class="plate" onclick={() => (expanded = p)} tabindex="-1" aria-hidden="true">
        <span class="stage">
          <ProjectMedia media={p.media} width={p.width} height={p.height} phone={p.phone} thumb />
        </span>
      </button>
      <div class="info">
        <a href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a>
        <p>{p.desc}</p>
        {#if p.desc2}
          <p>{p.desc2}</p>
        {/if}
        {#if p.note}
          <p class="note">({p.note})</p>
        {/if}
      </div>
    </div>
  {/each}
</div>

{#if expanded}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="lightbox" onclick={() => (expanded = null)} aria-hidden="true">
    <ProjectMedia
      media={expanded.media}
      width={expanded.width}
      height={expanded.height}
      phone={expanded.phone}
    />
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem 1.5rem;
  }
  .cell {
    min-width: 0;
    animation: row-in 0.8s ease both;
    animation-delay: calc(var(--i, 0) * 90ms);
  }
  @media (prefers-reduced-motion: reduce) {
    .cell {
      animation: none;
    }
  }

  /* the plate: a fixed 16:9 box in the site's quiet panel fill (same as code
     blocks). media is centered and contained inside it at its own ratio */
  .plate {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 2px;
    background: color-mix(in srgb, var(--fg) 7%, transparent);
    cursor: zoom-in;
  }
  .stage {
    position: absolute;
    inset: 8%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .stage :global(:is(img, video)) {
    display: block;
    position: relative;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    border-radius: 2px;
    transition: opacity 0.3s ease;
  }
  .stage :global(.pending) {
    opacity: 0;
  }
  /* iphone recordings show the screen's own rounded corners; match them */
  .stage :global(.phone) {
    border-radius: 14% / 6.46%;
  }
  .stage :global(.skeleton) {
    display: none;
  }

  .info {
    margin-top: 0.75rem;
  }
  .info a {
    color: var(--fg);
  }
  .info p {
    margin: 0.25rem 0 0;
  }
  .info .note {
    margin-top: 0.1rem;
    font-size: 0.85em;
    color: color-mix(in srgb, var(--muted) 75%, transparent);
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
      gap: 1.5rem;
    }
  }
</style>
