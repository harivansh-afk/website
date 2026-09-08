import clickSound from "$lib/sounds/click.mp3";

export function mountInteractionSounds() {
  // react-sounds' ui/button_soft, bundled locally (see sounds/LICENSE).
  // Decode once. Restarting an HTMLAudioElement on every hover stalls WebKit's
  // rendering; buffer sources keep short sounds off that media-player path.
  const context = new AudioContext();
  const request = new AbortController();
  let buffer = null;
  let playing = null;
  let disposed = false;

  fetch(clickSound, { signal: request.signal })
    .then((response) => response.ok ? response.arrayBuffer() : Promise.reject())
    .then((bytes) => context.decodeAudioData(bytes))
    .then((decoded) => { if (!disposed) buffer = decoded; })
    .catch(() => {});

  const interactive = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [data-sound-click]';
  const targetFor = (target) => target instanceof Element ? target.closest(interactive) : null;

  function play(hover) {
    // Only a click can unlock audio. Hovers before that stay silent.
    if (!hover && context.state === "suspended") void context.resume().catch(() => {});
    if (!buffer || disposed || (hover && context.state !== "running")) return;
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

  function click(event) {
    const target = targetFor(event.target);
    if (target && !target.matches(':disabled, [aria-disabled="true"]')) play(false);
  }

  function hover(event) {
    if (event.pointerType !== "mouse") return;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    // Moving between children of the same link is still the same hover.
    if (!link || (event.relatedTarget instanceof Node && link.contains(event.relatedTarget))) return;
    if (!link.matches('[aria-disabled="true"]')) play(true);
  }

  // Capture runs before handlers remove overlays or navigate; delegation also
  // covers links inserted by client-side navigation, without duplicate sounds.
  document.addEventListener("click", click, true);
  document.addEventListener("pointerover", hover, true);

  return () => {
    document.removeEventListener("click", click, true);
    document.removeEventListener("pointerover", hover, true);
    disposed = true;
    request.abort();
    playing?.stop();
    void context.close().catch(() => {});
  };
}
