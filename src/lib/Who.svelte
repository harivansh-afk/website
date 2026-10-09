<script>
  // the name in the header. the letters swell as the cursor passes
  // over them, so a sweep across the header rolls a bulge through the
  // name. Suisse isn't variable, so the weight is a text stroke growing from
  // REST (style.css draws the same at rest) by up to PEAK, with a slight scale.
  // the i is drawn twice from its own glyph, cut through the gap between dot
  // and stem: as it swells, its dot drifts up off it instead of the stroke
  // closing the gap. the cut is measured off the font where it renders, so it
  // holds whatever metrics the platform reads. at rest, on touch, or with
  // reduced motion it's just the name
  import { onMount } from "svelte";

  const REST = 0.015; // em of stroke at rest, as style.css has it
  const PEAK = 0.04; // em of stroke added at the bulge's centre
  const GROW = 0.3; // how much bigger a letter gets at the bulge's centre
  const LIFT = 0.2; // em the i's dot drifts up at the bulge's centre
  const REACH = 1.2; // the bulge's half-width, in em
  const EASE = 0.22; // how far each frame closes on the target
  const BAND = 80; // px above or below the name inside which it reacts

  let link, i, dot, base;
  const letters = [..."har"];
  const spans = [];

  // where the gap between the i's dot and stem sits above the baseline, in em
  function gapAbove(font) {
    const S = 240, c = document.createElement("canvas");
    c.width = c.height = S;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.font = font.replace(/[\d.]+px/, "160px");
    x.fillText("i", 40, 200);
    const d = x.getImageData(0, 0, S, S).data;
    const ink = (j) => {
      for (let col = 0; col < S; col++) if (d[(j * S + col) * 4 + 3] > 127) return true;
      return false;
    };
    let j = 0;
    while (j < S && !ink(j)) j++; // the dot's top
    while (j < S && ink(j)) j++; // its bottom
    const top = j;
    while (j < S && !ink(j)) j++; // the stem's top
    return j < S ? (200 - (top + j) / 2) / 160 : null;
  }

  function cut() {
    const cs = getComputedStyle(i);
    const above = gapAbove(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`);
    if (above == null) return;
    const r = i.getBoundingClientRect(); // an em tall: line-height 1
    const fromTop = (base.getBoundingClientRect().bottom - r.top) / r.height - above;
    i.style.setProperty("--cut", `${fromTop}em`);
  }

  onMount(() => {
    document.fonts.ready.then(cut);
    if (!matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;

    const all = [...spans, i];
    const k = all.map(() => 0);
    let cursor = null, raf = 0;

    function frame() {
      raf = 0;
      const box = link.getBoundingClientRect();
      const reach = REACH * box.height;
      const near = cursor && Math.abs(cursor.y - (box.top + box.height / 2)) < BAND;
      let moving = false;
      all.forEach((s, n) => {
        const r = s.getBoundingClientRect();
        const target = near ? Math.exp(-(((cursor.x - (r.left + r.width / 2)) / reach) ** 2)) : 0;
        if (Math.abs(target - k[n]) < 0.001) k[n] = target;
        else {
          k[n] += (target - k[n]) * EASE;
          moving = true;
        }
        const e = k[n];
        // the stroke grows outward and the letter from its baseline, so each
        // is given that much room
        s.style.webkitTextStrokeWidth = e ? `${REST + PEAK * e}em` : "";
        s.style.scale = e ? `${1 + GROW * e}` : "";
        s.style.marginInline = e ? `${(PEAK / 2 + GROW * 0.26) * e}em` : "";
      });
      const e = k[all.length - 1];
      dot.style.translate = e ? `0 ${-LIFT * e}em` : "";
      if (moving) raf = requestAnimationFrame(frame);
    }
    const wake = () => (raf ||= requestAnimationFrame(frame));

    const move = (e) => {
      cursor = { x: e.clientX, y: e.clientY };
      wake();
    };
    const leave = () => {
      cursor = null;
      wake();
    };
    const resize = () => document.fonts.ready.then(cut);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("resize", resize);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("resize", resize);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  });
</script>

<a class="who bare" href="/" aria-label="hari" bind:this={link}
  >{#each letters as l, n}<span class="l" bind:this={spans[n]}>{l}</span>{/each}<span
    class="l i"
    bind:this={i}
    ><span class="stem">i</span><span class="dot" bind:this={dot} aria-hidden="true">i</span><span
      class="base"
      bind:this={base}
    ></span></span
  ></a
>

<style>
  .l {
    position: relative;
    display: inline-block;
    line-height: 1;
    transform-origin: 50% 78%;
  }
  /* the i, twice: the stem below the cut, the dot above it. --cut is measured
     on mount; this is Suisse Light's on linux, close enough to land in the
     gap anywhere */
  .i {
    --cut: 0.2em;
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
  /* a point on the baseline, for measuring the cut */
  .base {
    display: inline-block;
    width: 0;
    height: 0;
  }
</style>
