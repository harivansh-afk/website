<script>
  // the name in the header, with a loose i-dot: it leans toward a nearby
  // cursor, sticks to it once touched (a thread back to the stem), and when
  // pulled past SNAP the thread breaks and it springs home with a wobble.
  // the dot rests exactly where Suisse draws its own, so without js, on touch,
  // or with reduced motion, it's just the name
  import { onMount } from "svelte";

  const LATCH = 12; // px from the dot that catches it
  const LEAN = 70; // px from home inside which it leans toward the cursor
  const SNAP = 120; // px from home at which the thread breaks

  let dot, thread;

  onMount(() => {
    if (!matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;

    // physics runs in viewport px; the page may be css-zoomed (style.css)
    const zoom = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const p = { x: 0, y: 0 }, v = { x: 0, y: 0 };
    let cursor = null, latched = false, raf = 0;

    const home = () => {
      const r = dot.getBoundingClientRect();
      return { x: r.left + r.width / 2 - p.x, y: r.top + r.height / 2 - p.y };
    };

    function frame() {
      raf = 0;
      let tx = 0, ty = 0, near = false;
      if (cursor) {
        const h = home(), mx = cursor.x - h.x, my = cursor.y - h.y;
        const fromHome = Math.hypot(mx, my);
        near = fromHome < SNAP + 40;
        if (!latched && Math.hypot(mx - p.x, my - p.y) < LATCH) latched = true;
        if (latched && fromHome > SNAP) latched = false;
        if (latched) [tx, ty] = [mx, my];
        else if (fromHome < LEAN) [tx, ty] = [mx * 0.12, my * 0.12];
      } else latched = false;

      const k = latched ? 0.3 : 0.1, damp = latched ? 0.55 : 0.8;
      v.x = (v.x + (tx - p.x) * k) * damp;
      v.y = (v.y + (ty - p.y) * k) * damp;
      p.x += v.x;
      p.y += v.y;

      const z = zoom(), x = p.x / z, y = p.y / z;
      dot.style.translate = `${x}px ${y}px`;
      if (latched) {
        const sag = Math.min(18, Math.hypot(x, y) * 0.18);
        thread.setAttribute("d", `M0 0Q${x / 2} ${y / 2 + sag} ${x} ${y}`);
      }
      thread.style.opacity = latched ? 1 : 0;

      const settled = !latched && Math.hypot(p.x - tx, p.y - ty) + Math.hypot(v.x, v.y) < 0.05;
      if (!settled || near) raf = requestAnimationFrame(frame);
      else if (!tx && !ty) {
        p.x = p.y = v.x = v.y = 0;
        dot.style.translate = "";
      }
    }
    const wake = () => (raf ||= requestAnimationFrame(frame));

    const move = (e) => {
      cursor = { x: e.clientX, y: e.clientY };
      const h = home();
      if (latched || Math.hypot(cursor.x - h.x, cursor.y - h.y) < SNAP + 40) wake();
    };
    const leave = () => {
      cursor = null;
      wake();
    };
    addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  });
</script>

<a class="who bare" href="/" aria-label="hari"
  >har<span class="i" aria-hidden="true"
    >ı<span class="dot" bind:this={dot}></span><svg class="thread"><path bind:this={thread} /></svg></span
  ></a
>

<style>
  .i {
    position: relative;
  }
  /* Suisse Intl Light's own i-dot, measured off the glyph: 0.06 x 0.10em,
     0.075em in from the left and 0.73em above the baseline (0.045em under
     the top of the line's ascent), widened by the body's hairline stroke */
  .dot {
    position: absolute;
    left: 0.066em;
    top: 0.036em;
    width: 0.078em;
    height: 0.118em;
    background: currentColor;
    pointer-events: none;
  }
  /* the thread hangs from the dot's home, its centre */
  .thread {
    position: absolute;
    left: 0.105em;
    top: 0.095em;
    width: 1px;
    height: 1px;
    overflow: visible;
    pointer-events: none;
  }
  .thread path {
    fill: none;
    stroke: var(--faint);
    stroke-width: 1;
    opacity: 0;
    transition: opacity 0.15s;
  }
</style>
