<script>
  // one piece of the software canvas (a catalog entry, see software.js): a
  // full-colour poster (the clip's first frame) that plays its clip while
  // hovered or focused. the clip fetches on hover only and is dropped when
  // the pointer leaves. the name links out; the poster zooms (`onzoom`,
  // see Zoom.svelte), playing the clip big. a `sound` clip is a film: a
  // play button on the poster, and the zoom plays it with the browser's
  // own player
  import { POSTER_V, clipSrc } from "#lib/media.js";

  let { piece, onzoom } = $props();

  const at = $derived(piece.canvas);
  const poster = $derived(`/software/${piece.name}.webp?v=${POSTER_V}`);

  let active = $state(false);
  let playing = $state(false);

  function start() {
    if (at.clip && !at.sound) active = true;
  }
  function stop() {
    active = false;
    playing = false;
  }
  function enlarge(e) {
    const frame = e.currentTarget;
    onzoom(frame, {
      src: poster,
      alt: piece.alt,
      video: at.clip ? clipSrc(piece.name) : undefined,
      sound: at.sound,
      radius: getComputedStyle(frame).borderRadius,
    });
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
  <button class="frame" type="button" aria-label="enlarge {piece.name}" onclick={enlarge}>
    <img src={poster} width={at.w} height={at.h} alt={piece.alt} loading="lazy" decoding="async" />
    {#if at.sound}
      <span class="play" aria-hidden="true"></span>
    {:else if active}
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
  </button>
  <figcaption>
    <a class="name" href={piece.href} target="_blank" rel="noopener noreferrer">{piece.name}</a>
    {#if piece.status}<span class="fig">{piece.status}</span>{/if}
    <span class="break"></span>
    <span class="note">{piece.note}</span>
  </figcaption>
</figure>

<style>
  /* only what's drawn takes the pointer: the poster and the caption's text.
     a piece's box spans its columns and can reach over a neighbour (a
     negative drop), and its empty parts mustn't steal that one's hover */
  .piece {
    margin: 0;
    min-width: 0;
    pointer-events: none;
  }
  .frame,
  figcaption > :is(a, span) {
    pointer-events: auto;
  }
  /* every piece is the same kind of window: one corner radius (phones get
     an iphone's), and a hairline inside the edge so dark posters keep their
     frame on the page */
  .frame {
    position: relative;
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    font: inherit;
    color: inherit;
    cursor: zoom-in;
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
  /* a phone recording is narrower (--fw, the frame's share of the piece)
     and gets an iphone's corners: the screen's radius as a share of its
     width and height. its caption steps in past the curve, so it sits under
     the screen's straight edge rather than its rounded corner */
  .phone {
    --fw: 62%;
  }
  .phone .frame {
    width: var(--fw);
    border-radius: 14% / 6.45%;
  }
  .phone figcaption {
    padding-left: calc(var(--fw) * 0.07);
  }
  /* a dark disc with a triangle cut from borders, on the poster's middle */
  .play {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    width: 3.5rem;
    height: 3.5rem;
    translate: -50% -50%;
    border: 0;
    border-radius: 50%;
    background: rgb(0 0 0 / 0.6);
  }
  .play::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 54%;
    translate: -50% -50%;
    border-style: solid;
    border-width: 0.6rem 0 0.6rem 1rem;
    border-color: transparent transparent transparent #fff;
  }
  .frame:hover .play {
    background: rgb(0 0 0 / 0.8);
  }
  img,
  video {
    display: block;
    width: 100%;
    height: auto;
  }
  .frame video {
    position: absolute;
    inset: 0;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .frame video.on {
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
  /* the note always starts its own line, at its own measure */
  .break {
    flex-basis: 100%;
    height: 0;
  }
  .note {
    max-width: 46ch;
    font-size: var(--text-small);
  }

  @media (min-width: 640px) {
    .piece.phone {
      grid-row: span 2;
    }
    .phone {
      --fw: 70%;
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
    .phone {
      --fw: 100%;
    }
  }
</style>
