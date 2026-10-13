<script>
  // every thought sits in this grid, after benja.dev's articles: the page's
  // own <main> (date and views in its gutter, prose beside them) takes nine
  // twelfths, and "on this page" takes the last three, sticky: a rail whose
  // marker follows the reading and can be dragged to scrub the article. it
  // also wires what the prerendered markup can't do alone: the copy buttons
  // on code blocks, and figures that zoom to fill the window when clicked
  import { afterNavigate } from "$app/navigation";
  import { prefersReducedMotion } from "svelte/motion";

  let { children } = $props();

  let grid;
  let list = $state();
  let toc = $state([]);
  let active = $state(null);
  let markTop = $state(null);
  let dragging = $state(false);
  let headings = [];

  // the reading line sits a quarter of the way down the window
  const LINE = 0.25;
  const docTop = (el) => el.getBoundingClientRect().top + scrollY;

  // where each section's link sits on the rail: its first line, in the
  // list's own px
  function stops() {
    return [...list.querySelectorAll("ol a")].map((a) => {
      const cs = getComputedStyle(a);
      return a.offsetTop + parseFloat(cs.paddingTop) + parseFloat(cs.lineHeight) / 2;
    });
  }

  // the marker moves continuously: between two headings it sits the same
  // share of the way between their links
  function spy() {
    if (!headings.length || !list) return;
    const line = scrollY + innerHeight * LINE;
    const tops = headings.map(docTop);
    const ys = stops();
    let i = 0;
    while (i + 1 < tops.length && tops[i + 1] <= line) i++;
    const t = i + 1 < tops.length ? Math.min(1, Math.max(0, (line - tops[i]) / (tops[i + 1] - tops[i]))) : 0;
    active = line < tops[0] ? headings[0].id : headings[i].id;
    markTop = line < tops[0] ? ys[0] : ys[i] + t * ((ys[i + 1] ?? ys[i]) - ys[i]);
  }

  // scroll and resize fire faster than frames; measure once per frame
  let frame = 0;
  const schedule = () => (frame ||= requestAnimationFrame(() => ((frame = 0), spy())));

  // dragging the marker (or pressing the rail) scrubs the article: the
  // inverse of spy, scrolling instantly so the page follows the pointer
  function scrub(e) {
    const y = e.clientY - list.getBoundingClientRect().top;
    const tops = headings.map(docTop);
    const ys = stops();
    let i = 0;
    while (i + 1 < ys.length && ys[i + 1] <= y) i++;
    const t = i + 1 < ys.length ? Math.min(1, Math.max(0, (y - ys[i]) / (ys[i + 1] - ys[i]))) : 0;
    const line = y < ys[0] ? tops[0] : tops[i] + t * ((tops[i + 1] ?? tops[i]) - tops[i]);
    scrollTo({ top: line - innerHeight * LINE, behavior: "instant" });
  }
  function grab(e) {
    e.preventDefault();
    dragging = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrub(e);
  }
  const drag = (e) => dragging && scrub(e);
  const drop = () => (dragging = false);

  afterNavigate(() => {
    finish();
    headings = [...grid.querySelectorAll("article h2[id]")];
    toc = headings.map((h) => ({ id: h.id, text: h.textContent.trim() }));
    schedule();
  });

  async function copy(button) {
    const pre = button.closest(".code")?.querySelector("pre");
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.innerText.replace(/\n$/, ""));
      button.textContent = "copied";
    } catch {
      button.textContent = "failed";
    }
    setTimeout(() => (button.textContent = "copy"), 1400);
  }

  // the zoom, flip-style, in a modal dialog over the window (so it sits
  // above everything, takes escape, and leaves the page inert; a scroll
  // closes it rather than moving the page under it): a copy of
  // the image is laid out where it ends up, starts transformed back onto
  // the original, and is released. closing runs it back and then drops the
  // dialog, by its transition's end or a timer, whichever comes first, so
  // nothing can be left over the page
  let shot = $state(null); // { src, alt, box, back, img }
  let open = $state(false);
  let settle = 0;

  function zoom(img) {
    if (shot) return close();
    const r = img.getBoundingClientRect();
    const pad = innerWidth < 640 ? 12 : 40;
    const w = Math.min(innerWidth - 2 * pad, ((innerHeight - 2 * pad) * r.width) / r.height);
    const h = (w * r.height) / r.width;
    const x = (innerWidth - w) / 2;
    const y = (innerHeight - h) / 2;
    shot = {
      src: img.currentSrc || img.src,
      alt: img.alt,
      box: { x, y, w, h },
      back: `translate(${r.left - x}px, ${r.top - y}px) scale(${r.width / w})`,
      img,
    };
    img.style.visibility = "hidden";
  }

  // mounts the dialog, then lets the image go on the frame after its start
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

  function finish() {
    clearTimeout(settle);
    if (shot) shot.img.style.visibility = "";
    shot = null;
    open = false;
  }

  function onclick(e) {
    const button = e.target.closest("[data-copy]");
    if (button) return copy(button);
    const img = e.target.closest("article figure img");
    if (img) zoom(img);
  }
  function onkeydown(e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches?.(".diagram-scroll")) {
      const img = e.target.querySelector("img");
      if (img) {
        e.preventDefault();
        zoom(img);
      }
    }
  }
</script>

<svelte:window onscroll={schedule} onresize={schedule} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="thought-grid" bind:this={grid} {onclick} {onkeydown}>
  {@render children()}
  {#if toc.length}
    <nav class="toc" aria-label="on this page">
      <div class="toc-in">
        <p class="toc-label">on this page</p>
        <div class="toc-list" class:dragging bind:this={list}>
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <span class="toc-rail" aria-hidden="true" onpointerdown={grab} onpointermove={drag} onpointerup={drop} onpointercancel={drop}
          ></span>
          {#if markTop !== null}<!-- svelte-ignore a11y_no_static_element_interactions --><span
              class="toc-mark"
              style:top="{markTop}px"
              aria-hidden="true"
              onpointerdown={grab}
              onpointermove={drag}
              onpointerup={drop}
              onpointercancel={drop}
            ></span>{/if}
          <ol>
            {#each toc as h (h.id)}
              <li>
                <a class="bare" class:on={active === h.id} aria-current={active === h.id ? "location" : undefined} href="#{h.id}"
                  >{h.text}</a
                >
              </li>
            {/each}
          </ol>
        </div>
      </div>
    </nav>
  {/if}
</div>

{#if shot}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
  <dialog
    class="zoom"
    class:on={open}
    aria-label={shot.alt}
    {@attach show}
    onclick={close}
    oncancel={(e) => (e.preventDefault(), close())}
    onwheel={(e) => (e.preventDefault(), close())}
    ontouchmove={close}
  >
    <img
      src={shot.src}
      alt={shot.alt}
      style:left="{shot.box.x}px"
      style:top="{shot.box.y}px"
      style:width="{shot.box.w}px"
      style:height="{shot.box.h}px"
      style:transform={open ? "none" : shot.back}
      ontransitionend={(e) => e.propertyName === "transform" && !open && finish()}
    />
  </dialog>
{/if}
