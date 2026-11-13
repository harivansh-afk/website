<script>
  // a picture or clip zoomed to fill the window, flip-style, in a modal
  // dialog over the window (so it sits above everything, takes escape, and
  // leaves the page inert; a scroll closes it rather than moving the page
  // under it): a copy is laid out where it ends up, starts transformed back
  // onto the original, and is released. closing runs it back and then drops
  // the dialog, by its transition's end or a timer, whichever comes first,
  // so nothing can be left over the page.
  //
  // `zoom(el, media)` opens it from `el`, whose box it flies from. media is
  // { src, alt } for a picture, or adds `video` (a clip, muted and looping
  // over `src` as its poster), `sound` (the clip is a film: the browser's
  // player, playing), and `radius` (the frame's corners). `solid` hides the
  // page under it entirely; `finish()` drops it at once
  import { prefersReducedMotion } from "svelte/motion";

  let { solid = false } = $props();

  let shot = $state(null); // media plus { box, back, el }
  let open = $state(false);
  let settle = 0;

  export function zoom(el, media) {
    if (shot) return close();
    const r = el.getBoundingClientRect();
    const pad = innerWidth < 640 ? 12 : 40;
    const w = Math.min(innerWidth - 2 * pad, ((innerHeight - 2 * pad) * r.width) / r.height);
    const h = (w * r.height) / r.width;
    const x = (innerWidth - w) / 2;
    const y = (innerHeight - h) / 2;
    shot = {
      ...media,
      box: { x, y, w, h },
      back: `translate(${r.left - x}px, ${r.top - y}px) scale(${r.width / w})`,
      el,
    };
    el.style.visibility = "hidden";
  }

  export function finish() {
    clearTimeout(settle);
    if (shot) shot.el.style.visibility = "";
    shot = null;
    open = false;
  }

  // mounts the dialog, then lets the copy go on the frame after its start
  // is painted
  function show(dialog) {
    dialog.showModal();
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => (open = true)));
    return () => cancelAnimationFrame(raf);
  }

  function close() {
    if (!shot || !open) return finish();
    open = false;
    clearTimeout(settle);
    settle = setTimeout(finish, prefersReducedMotion.current ? 0 : 400);
  }

  const done = (e) => e.propertyName === "transform" && !open && finish();
</script>

{#if shot}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <dialog
    class="zoom"
    class:solid
    class:on={open}
    aria-label={shot.alt}
    {@attach show}
    onclick={close}
    oncancel={(e) => (e.preventDefault(), close())}
    onwheel={(e) => (e.preventDefault(), close())}
    ontouchmove={close}
  >
    {#if shot.video}
      <!-- svelte-ignore a11y_media_has_caption, a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
      <video
        src={shot.video}
        poster={shot.src}
        aria-label={shot.alt}
        style:left="{shot.box.x}px"
        style:top="{shot.box.y}px"
        style:width="{shot.box.w}px"
        style:height="{shot.box.h}px"
        style:border-radius={shot.radius}
        style:transform={open ? "none" : shot.back}
        muted={!shot.sound}
        loop={!shot.sound}
        controls={shot.sound}
        playsinline
        autoplay
        {@attach (v) => void v.play().catch(() => {})}
        onclick={(e) => shot.sound && e.stopPropagation()}
        ontransitionend={done}
      ></video>
    {:else}
      <img
        src={shot.src}
        alt={shot.alt}
        style:left="{shot.box.x}px"
        style:top="{shot.box.y}px"
        style:width="{shot.box.w}px"
        style:height="{shot.box.h}px"
        style:border-radius={shot.radius}
        style:transform={open ? "none" : shot.back}
        ontransitionend={done}
      />
    {/if}
  </dialog>
{/if}

<style>
  .zoom {
    position: fixed;
    inset: 0;
    width: auto;
    height: auto;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    overflow: hidden;
    cursor: zoom-out;
    background: color-mix(in srgb, var(--bg) 0%, transparent);
    transition: background-color 0.3s var(--ease);
  }
  .zoom::backdrop {
    background: none;
  }
  .zoom.on {
    background: color-mix(in srgb, var(--bg) 94%, transparent);
  }
  .zoom.solid.on {
    background: var(--bg);
  }
  img,
  video {
    position: fixed;
    display: block;
    max-width: none;
    object-fit: cover;
    transform-origin: 0 0;
    transition: transform 0.35s var(--ease);
  }
  video[controls] {
    cursor: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    .zoom,
    img,
    video {
      transition: none;
    }
  }
</style>
