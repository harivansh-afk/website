<script>
  import { onMount } from "svelte";
  import ProjectMedia from "$lib/ProjectMedia.svelte";
  import { projects, host, slug } from "$lib/projects.js";

  // brutalist grid: every project sits on an identical 16:9 plate, so
  // portrait recordings (mixbridge, nap) and odd-ratio screenshots all tile
  // into one symmetrical grid. cell 1 is the index: a table of contents that
  // hovers/links into the tiles, and it makes 3x3 come out even.
  const pad = (i) => String(i + 1).padStart(2, "0");

  let hot = $state(null); // slug of the tile being pointed at (from index or tile)
  let expanded = $state(null); // click-to-expand lightbox

  onMount(() => {
    const pin = location.hash.match(/^#expand=([\w-]+)$/);
    if (pin) expanded = projects.find((p) => p.media.includes(pin[1])) ?? null;
  });
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && (expanded = null)} />

<section class="grid" aria-label="projects">
  <div class="tile index" style="--i: 0">
    <div class="index-head">
      <span class="label">index</span>
      <span class="count">{pad(projects.length - 1)}</span>
    </div>
    <ol>
      {#each projects as p, i}
        <li class:hot={hot === slug(p.name)}>
          <a
            href="#{slug(p.name)}"
            onpointerenter={() => (hot = slug(p.name))}
            onpointerleave={() => (hot = null)}
          >
            <span class="no">{pad(i)}</span>
            <span class="name">{p.name}</span>
            <span class="host">{host(p.href)}</span>
          </a>
        </li>
      {/each}
    </ol>
    <p class="hint">click a plate to expand, esc closes</p>
  </div>

  {#each projects as p, i}
    <article
      class="tile"
      class:hot={hot === slug(p.name)}
      id={slug(p.name)}
      style="--i: {i + 1}"
      onpointerenter={() => (hot = slug(p.name))}
      onpointerleave={() => (hot = null)}
    >
      <button class="plate" onclick={() => (expanded = p)} aria-label="expand {p.name}">
        <span class="corner">{pad(i)}</span>
        <span class="stage">
          <ProjectMedia media={p.media} width={p.width} height={p.height} phone={p.phone} thumb />
        </span>
      </button>
      <div class="cap">
        <div class="row">
          <span class="no">{pad(i)}</span>
          <a class="name" href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a>
          <span class="host">{host(p.href)}</span>
        </div>
        <p class="desc">{p.desc}{#if p.desc2}<br />{p.desc2}{/if}</p>
        {#if p.note}
          <p class="note">{p.note}</p>
        {/if}
      </div>
    </article>
  {/each}
</section>

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
  /* one hard hairline shared by every cell: the grid's background shows
     through 1px gaps, so lines never double up */
  .grid {
    --line: color-mix(in srgb, var(--fg) 22%, transparent);
    --plate: color-mix(in srgb, var(--fg) 4.5%, transparent);
    --plate-hot: color-mix(in srgb, var(--fg) 9%, transparent);
    --dot: color-mix(in srgb, var(--fg) 13%, transparent);
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    background: var(--line);
    border-block: 1px solid var(--line);
  }
  .tile {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--bg);
    animation: tile-in 0.6s ease both;
    animation-delay: calc(var(--i, 0) * 70ms);
  }
  @keyframes tile-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .tile {
      animation: none;
    }
  }

  /* the plate: a fixed 16:9 stage on graph paper. media is centered and
     contained inside it at its own ratio, with a hairline window edge */
  .plate {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin: 0;
    padding: 0;
    border: 0;
    border-bottom: 1px solid var(--line);
    background-color: var(--plate);
    background-image: radial-gradient(var(--dot) 0.6px, transparent 0.9px);
    background-size: 14px 14px;
    background-position: 7px 7px;
    color: inherit;
    font: inherit;
    cursor: zoom-in;
    transition: background-color 0.2s ease;
  }
  .tile.hot .plate {
    background-color: var(--plate-hot);
  }
  .corner {
    position: absolute;
    top: 0.6rem;
    left: 0.75rem;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    color: var(--muted);
    opacity: 0.7;
  }
  .stage {
    position: absolute;
    inset: 7% 8%;
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
    border: 1px solid var(--line);
    box-sizing: border-box;
    transition: opacity 0.3s ease;
  }
  .stage :global(.pending) {
    opacity: 0;
  }
  /* iphone recordings keep the screen's own corners; the border reads as a bezel */
  .stage :global(.phone),
  .lightbox :global(.phone) {
    border-radius: 14% / 6.46%;
  }
  .stage :global(.skeleton) {
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--fg) 6%, transparent);
  }

  /* caption: number, name, destination on one line; description under */
  .cap {
    padding: 0.85rem 1rem 1rem;
    line-height: 1.45;
  }
  .row {
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
    min-width: 0;
  }
  .no {
    color: var(--muted);
    font-size: 0.8rem;
    letter-spacing: 0.05em;
  }
  .row .name {
    color: var(--fg);
    white-space: nowrap;
  }
  .host {
    margin-left: auto;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .desc {
    margin: 0.35rem 0 0;
    font-size: 0.9rem;
    color: var(--muted);
  }
  .note {
    margin: 0.2rem 0 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: color-mix(in srgb, var(--muted) 70%, transparent);
  }

  /* cell 1: table of contents */
  .index {
    padding: 1rem 1rem 1.25rem;
  }
  .index-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--line);
  }
  .label {
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-size: 0.75rem;
    color: var(--muted);
  }
  .count {
    color: var(--fg);
    font-size: 2rem;
    line-height: 1;
  }
  .index ol {
    list-style: none;
    margin: 0.75rem 0 0;
    padding: 0;
    flex: 1;
  }
  .index li a {
    display: flex;
    gap: 0.75rem;
    align-items: baseline;
    padding: 0.28rem 0;
    background-image: none;
    color: var(--muted);
    border-bottom: 1px dashed color-mix(in srgb, var(--fg) 10%, transparent);
  }
  .index li:last-child a {
    border-bottom: 0;
  }
  .index li a .name {
    color: var(--fg);
  }
  .index li.hot a {
    color: var(--fg);
  }
  .index li.hot a .host {
    color: var(--fg);
  }
  .hint {
    margin: auto 0 0;
    padding-top: 1rem;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    color: color-mix(in srgb, var(--muted) 70%, transparent);
  }

  /* the lightbox (.lightbox lengths and background come from style.css) */

  @media (max-width: 1400px) {
    .grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .index {
      grid-column: 1 / -1;
    }
    .index ol {
      columns: 2;
      column-gap: 2rem;
    }
    .index li a {
      break-inside: avoid;
    }
  }
  @media (max-width: 700px) {
    .grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .index ol {
      columns: 1;
    }
    .hint {
      display: none;
    }
  }
</style>
