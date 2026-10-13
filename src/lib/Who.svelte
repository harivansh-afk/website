<script>
  // the name in the header. the letters swell as the cursor passes
  // over them, so a sweep across the header rolls a bulge through the
  // name. Suisse isn't variable, so the weight is a text stroke growing from
  // REST (style.css draws the same at rest) by up to PEAK, with a slight scale.
  // the i is drawn twice from its own glyph, cut through the gap between dot
  // and stem: as it swells, its dot drifts up off it instead of the stroke
  // closing the gap. at rest, on touch, or with reduced motion it's just the
  // name.
  //
  // a frame never reads layout: where each letter sits at rest is measured
  // once (and again on resize), and a frame works out where the swell has
  // pushed it from the margins it gave the letters before it
  import { onMount } from "svelte";
  import { MediaQuery } from "svelte/reactivity";

  const REST = 0.015; // em of stroke at rest, as style.css has it
  const PEAK = 0.04; // em of stroke added at the bulge's centre
  const GROW = 0.3; // how much bigger a letter gets at the bulge's centre
  const LIFT = 0.2; // em the i's dot drifts up at the bulge's centre
  const REACH = 1.2; // the bulge's half-width, in em
  const EASE = 0.22; // how far each frame closes on the target
  const BAND = 80; // px above or below the name inside which it reacts
  // em of margin each side of a letter at full swell: room for the stroke,
  // which grows outward, and for the letter, which grows from its baseline
  const ROOM = PEAK / 2 + GROW * 0.26;
  // the middle of the gap between the i's dot and stem, in em above the
  // baseline: Suisse Light's stem tops out at 0.538, its dot starts at 0.626
  const GAP = 0.582;

  const motion = new MediaQuery("(hover: hover) and (prefers-reduced-motion: no-preference)");

  let link, dot, base;
  const letters = [..."hari"];
  const spans = [];
  const k = letters.map(() => 0); // each letter's swell, 0 to 1

  // at rest: each letter's centre (client x) and the name's middle (page y)
  let rest = null;
  let cursor = null;
  let raf = 0;

  // where the baseline sits in the i's line box is the engine's choice (it
  // reads different metrics per platform), so the cut is placed from a
  // marker on the baseline. ratios of rects, so a swell's scale doesn't
  // skew it
  function cut() {
    const i = spans[spans.length - 1];
    const r = i.getBoundingClientRect();
    const fromTop = (base.getBoundingClientRect().bottom - r.top) / r.height - GAP;
    i.style.setProperty("--cut", `${fromTop}em`);
  }

  function measure() {
    cut();
    const box = link.getBoundingClientRect();
    const em = parseFloat(getComputedStyle(link).fontSize);
    let shift = 0;
    rest = {
      em,
      y: box.top + scrollY + box.height / 2,
      reach: REACH * box.height,
      x: spans.map((s, n) => {
        const r = s.getBoundingClientRect();
        const m = ROOM * k[n] * em;
        const x = r.left + r.width / 2 - shift - m;
        shift += 2 * m;
        return x;
      }),
    };
  }

  function frame() {
    raf = 0;
    if (!rest) return;
    const near = cursor && Math.abs(cursor.y - (rest.y - scrollY)) < BAND;
    let shift = 0;
    let moving = false;
    for (let n = 0; n < spans.length; n++) {
      const m = ROOM * k[n] * rest.em;
      const x = rest.x[n] + shift + m;
      shift += 2 * m;
      const target = near ? Math.exp(-(((cursor.x - x) / rest.reach) ** 2)) : 0;
      if (Math.abs(target - k[n]) < 0.001) k[n] = target;
      else {
        k[n] += (target - k[n]) * EASE;
        moving = true;
      }
    }
    spans.forEach((s, n) => {
      const e = k[n];
      s.style.webkitTextStrokeWidth = e ? `${REST + PEAK * e}em` : "";
      s.style.scale = e ? `${1 + GROW * e}` : "";
      s.style.marginInline = e ? `${ROOM * e}em` : "";
    });
    const e = k[spans.length - 1];
    dot.style.translate = e ? `0 ${-LIFT * e}em` : "";
    if (moving) raf = requestAnimationFrame(frame);
  }
  const wake = () => (raf ||= requestAnimationFrame(frame));

  function onpointermove(e) {
    if (!motion.current || e.pointerType !== "mouse") return;
    cursor = { x: e.clientX, y: e.clientY };
    wake();
  }
  // the pointer left the window
  function onpointerout(e) {
    if (e.relatedTarget || !cursor) return;
    cursor = null;
    wake();
  }

  onMount(() => {
    document.fonts.ready.then(measure);
    return () => cancelAnimationFrame(raf);
  });
</script>

<svelte:window {onpointermove} {onpointerout} onresize={measure} />

<a class="who bare" href="/" aria-label="hari" bind:this={link}
  >{#each letters as l, n}{#if l === "i"}<span class="l i" bind:this={spans[n]}
        ><span class="stem">i</span><span class="dot" bind:this={dot} aria-hidden="true">i</span><span
          class="base"
          bind:this={base}
        ></span></span
      >{:else}<span class="l" bind:this={spans[n]}>{l}</span>{/if}{/each}</a
>

<style>
  .l {
    position: relative;
    display: inline-block;
    line-height: 1;
    transform-origin: 50% 78%;
  }
  /* the i, twice: the stem below the cut, the dot above it. --cut is
     measured on mount (cut() above); this is its usual value, close enough
     to land in the gap anywhere until then */
  .i {
    --cut: 0.174em;
  }
  .stem {
    display: inline-block;
    clip-path: inset(var(--cut) -0.2em -0.2em -0.2em);
  }
  .dot {
    position: absolute;
    left: 0;
    top: 0;
    clip-path: inset(-0.2em -0.2em calc(100% - var(--cut)) -0.2em);
  }
  /* a point on the baseline, for placing the cut */
  .base {
    display: inline-block;
    width: 0;
    height: 0;
  }
</style>
