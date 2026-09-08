import clickSound from "$lib/sounds/click.mp3";

export function mountInteractionSounds() {
  // react-sounds' ui/button_soft, bundled locally (see sounds/LICENSE).
  // Reuse one player so a click cuts off hover and unlocks subsequent hovers.
  const audio = new Audio(clickSound);
  audio.preload = "auto";
  audio.preservesPitch = false;

  const interactive = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [data-sound-click]';
  const targetFor = (target) => target instanceof Element ? target.closest(interactive) : null;

  function play(hover) {
    audio.pause();
    audio.currentTime = 0;
    audio.volume = hover ? 0.12 : 0.35;
    audio.playbackRate = hover ? 1.6 : 1;
    // Autoplay restrictions and audio failures must never affect interaction.
    void audio.play().catch(() => {});
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
    audio.pause();
  };
}
