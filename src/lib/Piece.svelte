<script>
  // one piece of the software canvas (a catalog entry, see software.js): a
  // full-colour poster (the clip's first frame) that plays its clip while
  // hovered or focused. the clip fetches on hover only and is dropped when
  // the pointer leaves
  import Dots from "#lib/Dots.svelte";
  import { POSTER_V, clipSrc } from "#lib/media.js";

  let { piece } = $props();

  const at = $derived(piece.canvas);

  let active = $state(false);
  let playing = $state(false);

  function start() {
    if (at.clip) active = true;
  }
  function stop() {
    active = false;
    playing = false;
  }
</script>

<figure
  class="piece"
  class:phone={at.phone}
  style:--col={at.col}
  style:--drop="{at.drop}rem"
  style:--x="{at.x ?? 0}rem"
  onpointerenter={(e) => e.pointerType === "mouse" && start()}
  onpointerleave={stop}
  onfocusin={start}
  onfocusout={stop}
>
  <a class="bare frame" href={piece.href} target="_blank" rel="noopener noreferrer">
    <img
      src="/software/{piece.name}.webp?v={POSTER_V}"
      width={at.w}
      height={at.h}
      alt={piece.alt}
      loading="lazy"
      decoding="async"
    />
    {#if active}
      <video
        src={clipSrc(piece.name)}
        class:on={playing}
        muted
        loop
        playsinline
        autoplay
        preload="auto"
        aria-hidden="true"
        onplaying={() => (playing = true)}
      ></video>
    {/if}
  </a>
  <figcaption>
    <span class="name">{piece.name}</span>
    <span class="fig"
      >{#if piece.status}{piece.status}{:else}<Dots glyph="ongoing" label="still running" />{/if}</span
    >
    <span class="break"></span>
    <span class="note">{piece.note}</span>
  </figcaption>
</figure>

<style>
  .piece {
    margin: 0;
    min-width: 0;
  }
  /* every piece is the same kind of window: one corner radius (phones get
     an iphone's), and a hairline inside the edge so dark posters keep their
     frame on the page */
  .frame {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: 0.375rem;
    background: var(--fill);
  }
  .frame::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: inherit;
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--fg) 12%, transparent);
    pointer-events: none;
  }
  /* a phone recording is narrower and gets an iphone's corners: the screen's
     radius as a share of its width and height */
  .phone .frame {
    width: 62%;
    border-radius: 14% / 6.45%;
  }
  img,
  video {
    display: block;
    width: 100%;
    height: auto;
  }
  video {
    position: absolute;
    inset: 0;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  video.on {
    opacity: 1;
  }
  /* name and status share a line while they fit; on a narrow piece the
     status wraps under the name instead of colliding with it */
  figcaption {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.15rem 1rem;
    margin-top: 0.75rem;
  }
  figcaption .fig {
    margin-left: auto;
  }
  .name {
    color: var(--fg);
  }
  /* the note always starts its own line, at its own measure */
  .break {
    flex-basis: 100%;
    height: 0;
  }
  .note {
    max-width: 46ch;
    font-size: 0.8125rem;
  }

  @media (min-width: 640px) {
    .piece.phone {
      grid-row: span 2;
    }
    .phone .frame {
      width: 70%;
    }
  }
  @media (min-width: 1152px) {
    .piece {
      grid-column: var(--col);
      margin-top: var(--drop);
      translate: var(--x) 0;
    }
    .piece.phone {
      grid-row: auto;
    }
    .phone .frame {
      width: 100%;
    }
  }
</style>
