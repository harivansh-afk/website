<script module>
  // media lives in static/previews (shared with the hover previews); bump
  // when regenerating clips: static/ assets are CDN-cached immutably
  const V = "17";
</script>

<script>
  import { fade } from "svelte/transition";

  // width/height are the media's intrinsic pixels: the browser derives the
  // aspect ratio from them and reserves the box before anything loads, so
  // rows never shift. a quiet skeleton sits UNDER a thumb's media - painted
  // media covers it, so it only ever shows while pixels are missing (slow
  // network or a failed load) and a cached thumb never flashes it. media
  // that arrives late fades in; media that is ready at hydration renders
  // instantly. the lightbox downloads the full clip before playing, unless
  // the viewer chooses to stream it immediately.
  // lazy thumbs (the index's mobile-only sections) defer everything to the
  // viewport: display:none on desktop means they never intersect, so the
  // hidden rows cost zero bytes there
  let { media, width, height, phone = false, thumb = false, lazy = false } = $props();

  const video = $derived(media.endsWith(".mp4"));
  const src = $derived(`/previews/${media}?v=${V}`);
  // svelte-ignore state_referenced_locally -- deliberate: lightbox media starts loaded
  let loaded = $state(!thumb);
  let pending = $state(false); // client-only, so no-js visitors still see media
  let waiting = $state(true);
  let play = $state(() => {});

  function preload(node) {
    const controller = new AbortController();
    let objectURL;
    play = () => {
      controller.abort();
      waiting = false;
      node.play().catch(() => (waiting = true));
    };
    // preload="auto" is only a hint; a complete blob guarantees the full clip.
    (async () => {
      try {
        const response = await fetch(node.src, { signal: controller.signal });
        if (!response.ok) throw new Error("Video download failed");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        node.src = objectURL = URL.createObjectURL(blob);
        play();
      } catch {
        // The play button still allows streaming if preloading fails.
      }
    })();
    return { destroy() {
      controller.abort();
      if (objectURL) URL.revokeObjectURL(objectURL);
    } };
  }

  function watch(node) {
    const ready = video ? node.readyState >= 2 : node.complete && node.naturalWidth > 0;
    if (ready) loaded = true;
    else pending = true;
  }

  function done() {
    pending = false;
    loaded = true;
  }

  // videos ship preload="metadata" (first frame only, ~a few hundred KB for
  // the whole page instead of 18MB); this action streams and plays each one
  // as it approaches the viewport, and pauses it on the way out
  function lazyplay(node) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) node.play();
        else node.pause();
      },
      { rootMargin: "300px" },
    );
    io.observe(node);
    return { destroy: () => io.disconnect() };
  }
</script>

{#if !loaded}
  <span class="skeleton" class:phone out:fade={{ duration: 250 }} aria-hidden="true"></span>
{/if}

{#if video && thumb}
  <video
    {src}
    {width}
    {height}
    class:phone
    class:pending
    preload={lazy ? "none" : "metadata"}
    use:watch
    use:lazyplay
    onloadeddata={done}
    muted
    loop
    playsinline
  ></video>
{:else if video}
  <video {src} {width} {height} class:phone preload="metadata" use:preload muted loop playsinline></video>
  {#if waiting}
    <button
      class="video-play"
      aria-label="Play video"
      onclick={(event) => { event.stopPropagation(); play(); }}
    >▶︎</button>
  {/if}
{:else if thumb}
  <img
    {src}
    {width}
    {height}
    class:phone
    class:pending
    loading={lazy ? "lazy" : "eager"}
    alt=""
    use:watch
    onload={done}
  />
{:else}
  <img {src} {width} {height} class:phone alt="" />
{/if}

<style>
  .video-play {
    position: absolute;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0 0 0 0.1em;
    border: 0;
    border-radius: 50%;
    background: var(--bg);
    color: var(--fg);
    font-size: 1.25rem;
    cursor: pointer;
  }
</style>
