<script>
  // soft sounds on interaction: a click under every press of something
  // interactive, and a quicker, quieter one as the mouse comes onto a link.
  // react-sounds' ui/button_soft, bundled locally (see sounds/LICENSE).
  // the clip is decoded once, off an offline context, while the page is
  // idle; the real context only exists after the first press, the one gesture
  // that may start audio, so nothing waits on (or warns about) a context
  // that can't play. hovers before that stay silent. buffer sources, not
  // <audio>: restarting a media element on every hover stalls webkit's
  // rendering
  import { onMount } from "svelte";
  import clickSound from "#lib/sounds/click.mp3";

  let buffer = null;
  let context = null;
  let playing = null;

  onMount(() => {
    const request = new AbortController();
    const load = () =>
      fetch(clickSound, { signal: request.signal })
        .then((response) => (response.ok ? response.arrayBuffer() : Promise.reject()))
        .then((bytes) => new OfflineAudioContext(1, 1, 44100).decodeAudioData(bytes))
        .then((decoded) => (buffer = decoded))
        .catch(() => {});
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1));
    idle(load);
    return () => {
      request.abort();
      playing?.stop();
      context?.close().catch(() => {});
    };
  });

  function play(hover) {
    if (!buffer || !context || context.state !== "running") return;
    playing?.stop();
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = hover ? 1.6 : 1;
    gain.gain.value = hover ? 0.12 : 0.35;
    source.connect(gain).connect(context.destination);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      if (playing === source) playing = null;
    };
    playing = source;
    source.start();
  }

  const INTERACTIVE = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"]';

  // capture: runs before handlers remove overlays or navigate away
  function onclickcapture(e) {
    const target = e.target instanceof Element ? e.target.closest(INTERACTIVE) : null;
    if (!target || target.matches(':disabled, [aria-disabled="true"]')) return;
    context ??= new AudioContext();
    if (context.state === "suspended") context.resume().then(() => play(false), () => {});
    else play(false);
  }

  function onpointerovercapture(e) {
    if (e.pointerType !== "mouse") return;
    const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
    // moving between children of the same link is still the same hover
    if (!link || (e.relatedTarget instanceof Node && link.contains(e.relatedTarget))) return;
    if (!link.matches('[aria-disabled="true"]')) play(true);
  }
</script>

<svelte:document {onclickcapture} {onpointerovercapture} />
