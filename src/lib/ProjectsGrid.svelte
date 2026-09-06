<script>
  import { onMount } from "svelte";
  import ProjectMedia from "$lib/ProjectMedia.svelte";
  import { projects } from "$lib/projects.js";

  // the projects as a grid of identical 16:9 tiles. shots that are near
  // enough 16:9 fill their tile edge to edge (the lightbox shows the whole
  // frame); the ones that can't (the phones, deskctl's wide pair of windows)
  // fit inside on a background of their own. two columns and eight projects
  // come out even.
  let expanded = $state(null); // click-to-expand lightbox

  // one description per project; the status note rides on the name line
  const blurb = (p) => (p.desc2 ? `${p.desc}: ${p.desc2}` : p.desc);

  onMount(() => {
    // #expand=<name> pins one open; used to screenshot the site itself
    const pin = location.hash.match(/^#expand=([\w-]+)$/);
    if (pin) expanded = projects.find((p) => p.media.includes(pin[1])) ?? null;
  });
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && (expanded = null)} />

<div class="grid">
  {#each projects as p}
    <div class="cell">
      <button
        class="tile"
        class:fit={!!p.bg}
        style={p.bg ? `background: ${p.bg}` : undefined}
        onclick={() => (expanded = p)}
        tabindex="-1"
        aria-hidden="true"
      >
        <ProjectMedia media={p.media} width={p.width} height={p.height} phone={p.phone} thumb />
      </button>
      <div class="info">
        <div class="row">
          <a href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a>
          {#if p.note}
            <span class="note">{p.note}</span>
          {/if}
        </div>
        <p>{blurb(p)}</p>
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
    --gap: 1.5rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gap);
  }
  .cell {
    min-width: 0;
  }

  /* the tile: a fixed 16:9 box. by default the media covers it (the frame
     shown is the middle of the shot, the click shows all of it) */
  .tile {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 2px;
    overflow: hidden;
    background: none;
    cursor: zoom-in;
  }
  .tile :global(:is(img, video)) {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.3s ease;
  }
  .tile :global(.pending) {
    opacity: 0;
  }
  .tile :global(.skeleton) {
    display: none;
  }
  /* tiles with a background: media is centered and contained, never cropped */
  .tile.fit :global(:is(img, video)) {
    position: static;
    width: auto;
    height: auto;
    max-width: 90%;
    max-height: 88%;
    object-fit: contain;
  }
  /* iphone recordings show the screen's own rounded corners; match them */
  .tile :global(.phone) {
    border-radius: 14% / 6.46%;
  }

  /* caption: name and status on one line, one description under it. the
     description reserves two lines so every row ends level */
  .info {
    margin-top: 0.6rem;
  }
  .row {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }
  .row a {
    color: var(--fg);
  }
  .note {
    font-size: 0.85em;
    color: color-mix(in srgb, var(--muted) 75%, transparent);
  }
  .info p {
    margin: 0.2rem 0 0;
    min-height: 2lh;
  }

  @media (max-width: 640px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .info p {
      min-height: 0;
    }
  }
</style>
