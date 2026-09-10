<script>
  import { onMount } from "svelte";
  import ProjectMedia from "$lib/ProjectMedia.svelte";
  // Hidden homepage media stays lazy on desktop.
  let { lazy = false } = $props();

  const projects = [
    {
      name: "Mixbridge",
      href: "https://mixbridge.app/",
      media: "mixbridge.mp4",
      width: 590,
      height: 1280,
      phone: true, // raw iphone screen recording: media carries the screen's rounded corners
      contain: true,
      desc: "A beautiful listening experience for iOS that mixes music on the go",
    },
    {
      name: "TouchTips",
      href: "https://touchtips.app",
      media: "touchtips.mp4",
      width: 588,
      height: 1280,
      phone: true,
      contain: true,
      desc: "Remember when, where and who you met."
    },
    {
      name: "Einstein AI",
      href: "https://www.cnet.com/tech/services-and-software/companion-einstein-ai-tool/",
      media: "einstein.webp",
      width: 640,
      height: 400,
      desc: "AI agent that does your homework autonomously",
      note: "cease and desisted :(",
    },
    {
      name: "Mux",
      href: "https://git.harivan.sh/harivansh-afk/mux",
      media: "mux.mp4",
      width: 1184,
      height: 780,
      desc: "A stateless, host-agnostic, macos-native terminal multiplexing client for LibGhostty",
    },
    {
      name: "Pierrejo",
      href: "https://git.harivan.sh/harivansh-afk/pierrejo",
      media: "pierrejo.mp4",
      width: 1280,
      height: 894,
      desc: "Beautiful, instantaneous diff viewing for Forgejo",
    },
    {
      name: "AgentComputer",
      href: "https://github.com/AgentComputerAI",
      media: "agentcomputer.mp4",
      width: 1280,
      height: 782,
      desc: "Isolated cloud computers for AI-agents",
      note: "no longer maintained",
    },
    {
      name: "Roomcast",
      href: "https://git.harivan.sh/harivansh-afk/roomcast",
      media: "roomcast.mp4",
      width: 720,
      height: 1280,
      contain: true,
      desc: "Play any movie, TV-show or music video under the sun, one text away",
    },
    {
      name: "Nap",
      href: "https://git.harivan.sh/harivansh-afk/nap",
      media: "nap.mp4",
      width: 360,
      height: 640,
      contain: true,
      desc: "Not Airplay™, airplay from MacOS to Linux seamlessly",
    },
    {
      name: "Deskctl",
      href: "https://deskctl.dev",
      media: "deskctl.mp4",
      width: 640,
      height: 336,
      desc: "Non-interactive x11 control CLI",
      note: "no longer maintained",
    },
    {
      name: "BetterNAS",
      href: "https://betternas.com",
      media: "betternas.webp",
      width: 1280,
      height: 720,
      desc: "MacOS-native filesystem admin over HTTP",
      note: "no longer maintained",
    },
    {
      name: "Draw",
      href: "https://git.harivan.sh/harivansh-afk/draw",
      media: "draw.mp4",
      width: 1652,
      height: 692,
      desc: "Self-hosted Excalidraw with real-time collaboration and link sharing",
    },
  ];

  let expanded = $state(null);

  // one description per project; the status note rides on the name line
  const blurb = (p) => (p.desc2 ? `${p.desc}: ${p.desc2}` : p.desc);

  onMount(() => {
    // #expand=<name> pins one open; used to screenshot the site itself
    const pin = location.hash.match(/^#expand=([\w-]+)$/);
    if (pin) expanded = projects.find((p) => p.media?.includes(pin[1])) ?? null;
  });
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && (expanded = null)} />

<div class="grid">
  {#each projects as p}
    <div class="cell">
      {#if p.media}
        <button
          class="tile"
          class:contain={p.contain}
          style:--media-ratio={p.width / p.height}
          onclick={() => (expanded = p)}
          tabindex="-1"
          aria-hidden="true"
        >
          <ProjectMedia media={p.media} width={p.width} height={p.height} phone={p.phone} thumb {lazy} />
        </button>
      {:else}
        <div class="tile placeholder" aria-hidden="true">demo soon</div>
      {/if}
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
  <div class="lightbox" data-sound-click onclick={() => (expanded = null)} aria-hidden="true">
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
    gap: 1.5rem;
  }
  .cell {
    min-width: 0;
  }

  /* the tile is a bare button with one hairline border. landscape media
     fills it edge to edge (object-fit: cover, so a 3:2 or 2.4:1 recording is
     cropped to 16:9 rather than letterboxed against the page bg); portrait
     .contain rows sit centered inside it. no hover state: the cursor is the
     affordance */
  .tile {
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 16 / 9;
    margin: 0;
    padding: 0;
    border: 0.0625rem solid color-mix(in srgb, var(--muted) 45%, transparent);
    border-radius: 0.1875rem;
    overflow: hidden;
    background: none;
    cursor: zoom-in;
  }
  /* a row with no media yet: the same bordered box, empty but for a label */
  .tile.placeholder {
    cursor: default;
    font-size: 0.85em;
    color: color-mix(in srgb, var(--muted) 75%, transparent);
  }
  /* the bordered box is the placeholder; no skeleton inside tiles */
  .tile :global(.skeleton) {
    display: none;
  }
  .tile :global(:is(img, video)) {
    display: block;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    transition: opacity 0.3s ease;
  }
  .tile :global(.pending) {
    opacity: 0;
  }
  /* Resolve both dimensions against the tile, rather than asking a flex
     item's auto height to obey a percentage max-height (unreliable in Safari).
     Fit the intrinsic ratio inside 90% width / 88% height of a 16:9 tile.
     The element itself hugs the media so phone corner radii stay correct. */
  .tile.contain :global(:is(img, video)) {
    inset: 50% auto auto 50%;
    width: min(90%, calc(88% * 9 / 16 * var(--media-ratio)));
    height: min(88%, calc(90% * 16 / 9 / var(--media-ratio)));
    transform: translate(-50%, -50%);
  }
  /* iphone recordings show the screen's own rounded corners; match them */
  .tile :global(:is(img, video).phone) {
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
      gap: 1.25rem 0.75rem;
    }
    .row {
      flex-wrap: wrap;
      gap: 0.15rem 0.5rem;
    }
    .info p {
      min-height: 0;
    }
  }
</style>
