<script>
  import { onMount } from "svelte";
  import ProjectMedia from "$lib/ProjectMedia.svelte";

  // lazy: the index's mobile sections render these rows in DOM that is
  // display:none on desktop; lazy media fetches nothing until it can intersect
  let { lazy = false } = $props();

  // width/height are each file's intrinsic pixels (measured with ffprobe);
  // they reserve every row's box before the media loads
  const projects = [
    {
      name: "mixbridge",
      href: "https://mixbridge.app/",
      media: "mixbridge.mp4",
      width: 590,
      height: 1280,
      phone: true, // raw iphone screen recording: media carries the screen's rounded corners
      desc: "a beautiful listening experience on iOS that mixes music on the go",
    },
    {
      name: "einstein ai",
      href: "https://www.cnet.com/tech/services-and-software/companion-einstein-ai-tool/",
      media: "einstein.webp",
      width: 640,
      height: 400,
      desc: "ai agent that does your canvas assignments autonomously",
      note: "cease and desisted",
    },
    {
      name: "mux",
      href: "https://git.harivan.sh/harivansh-afk/mux",
      media: "mux.mp4",
      width: 1280,
      height: 830,
      desc: "a stateless, host-agnostic, macos-native terminal multiplexing client for ghostty",
    },
    {
      name: "pierrejo",
      href: "https://git.harivan.sh/harivansh-afk/pierrejo",
      media: "pierrejo.mp4",
      width: 1280,
      height: 894,
      desc: "beautiful and instantaneous diff viewing for forgejo",
    },
    {
      name: "agentcomputer",
      href: "https://github.com/AgentComputerAI",
      media: "agentcomputer.mp4",
      width: 1280,
      height: 782,
      desc: "isolated cloud computers for ai agents",
      note: "no longer maintained",
    },
    {
      name: "nap",
      href: "https://git.harivan.sh/harivansh-afk/nap",
      media: "nap.mp4",
      width: 360,
      height: 640,
      desc: "Not Airplay™",
      desc2: "turn a linux-owned monitor into an extended display for your mac",
    },
    {
      name: "deskctl",
      href: "https://deskctl.dev",
      media: "deskctl.mp4",
      width: 640,
      height: 336,
      desc: "non-interactive x11 desktop control for ai agents",
      note: "no longer maintained",
    },
    {
      name: "betterNAS",
      href: "https://betternas.com",
      media: "betternas.webp",
      width: 640,
      height: 400,
      desc: "macos native filesystem admin over http",
      note: "no longer maintained",
    },
  ];

  // click-to-expand lightbox; click anywhere or esc closes
  let expanded = $state(null);

  onMount(() => {
    // #expand=<name> pins one open; used to screenshot the site itself
    const pin = location.hash.match(/^#expand=([\w-]+)$/);
    if (pin) expanded = projects.find((p) => p.media.includes(pin[1])) ?? null;
  });
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && (expanded = null)} />

{#each projects as p, i}
  <div class="project" style="--i: {i}">
    <button class="thumb" onclick={() => (expanded = p)} tabindex="-1" aria-hidden="true">
      <ProjectMedia media={p.media} width={p.width} height={p.height} phone={p.phone} thumb {lazy} />
    </button>
    <div class="info">
      <a href={p.href} target="_blank" rel="noopener noreferrer">{p.name}</a>
      {#if p.desc}
        <p>{p.desc}</p>
      {/if}
      {#if p.desc2}
        <p>{p.desc2}</p>
      {/if}
      {#if p.note}
        <p class="note">({p.note})</p>
      {/if}
    </div>
  </div>
{/each}

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
