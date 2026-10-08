<script>
  // every thought sits in this grid, after benja.dev's articles: the page's
  // own <main> (date and views in its gutter, prose beside them) takes nine
  // twelfths, and "on this page" takes the last three, sticky: a rail whose
  // marker follows the reading and can be dragged to scrub the article, and
  // the share read beside its label. it also wires what the prerendered markup can't do
  // alone: the copy buttons on code blocks, and figures that zoom to fill
  // the window when clicked
  import { afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";
  import Dots from "#lib/Dots.svelte";

  let { children } = $props();

  let grid;
  let list = $state();
  let toc = $state([]);
  let active = $state(null);
  let markTop = $state(null);
  let read = $state(0);
  let dragging = $state(false);
  let headings = [];

  // the reading line sits a quarter of the way down the window. window px
  // throughout: rects and scrollY agree, whatever the page's css zoom
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
  // share of the way between their links. the share read is the whole
  // article's
  function spy() {
    if (!headings.length || !list) return;
    const line = scrollY + innerHeight * LINE;
    const tops = headings.map(docTop);
    const ys = stops();
    let i = 0;
    while (i + 1 < tops.length && tops[i + 1] <= line) i++;
    const t = i + 1 < tops.length ? Math.min(1, Math.max(0, (line - tops[i]) / (tops[i + 1] - tops[i]))) : 0;
    active = line < tops[0] ? headings[0].id : headings[i].id;
    markTop = (line < tops[0] ? ys[0] : ys[i] + t * ((ys[i + 1] ?? ys[i]) - ys[i])) - 3.75;
    const article = grid.querySelector("article");
    const start = docTop(article), span = Math.max(1, article.offsetHeight * (document.documentElement.currentCSSZoom ?? 1) - innerHeight * 0.75);
    read = Math.min(1, Math.max(0, (scrollY - start + innerHeight * LINE) / span));
  }

  // dragging the marker (or pressing the rail) scrubs the article: the
  // inverse of spy, scrolling instantly so the page follows the pointer
  function scrub(e) {
    const zoom = document.documentElement.currentCSSZoom ?? 1;
    const y = (e.clientY - list.getBoundingClientRect().top) / zoom;
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
    headings = [...grid.querySelectorAll("article h2[id]")];
    toc = headings.map((h) => ({ id: h.id, text: h.textContent.trim() }));
    requestAnimationFrame(spy);
  });

  onMount(() => {
    addEventListener("scroll", spy, { passive: true });
    addEventListener("resize", spy);
    return () => {
      removeEventListener("scroll", spy);
      removeEventListener("resize", spy);
    };
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

  // the zoom, flip-style: a copy of the image is laid out where it will end
  // up, then transformed back onto the original and released. the page is
  // css-zoomed (style.css), so rects in screen px are divided down to its px
  const motion = () => !matchMedia("(prefers-reduced-motion: reduce)").matches;
  let close = null;

  function zoom(img) {
    if (close) return close();
    const z = document.documentElement.currentCSSZoom ?? 1;
    const r = img.getBoundingClientRect();
    const from = { x: r.left / z, y: r.top / z, w: r.width / z, h: r.height / z };
    const vw = innerWidth / z;
    const vh = innerHeight / z;
    const pad = vw < 640 ? 12 : 40;
    const w = Math.min(vw - 2 * pad, ((vh - 2 * pad) * from.w) / from.h);
    const h = (w * from.h) / from.w;
    const to = { x: (vw - w) / 2, y: (vh - h) / 2 };
    const back = `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${from.w / w})`;

    const veil = document.createElement("div");
    veil.className = "zoom-veil";
    const copy = document.createElement("img");
    copy.className = "zoom-img";
    copy.src = img.currentSrc || img.src;
    copy.alt = img.alt;
    Object.assign(copy.style, { left: `${to.x}px`, top: `${to.y}px`, width: `${w}px`, height: `${h}px`, transform: back });
    veil.append(copy);
    document.body.append(veil);
    img.style.visibility = "hidden";

    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        veil.classList.add("on");
        copy.style.transform = "none";
      }),
    );

    const done = () => {
      veil.remove();
      img.style.visibility = "";
    };
    close = () => {
      close = null;
      removeEventListener("keydown", onkey);
      removeEventListener("scroll", onscroll);
      veil.classList.remove("on");
      copy.style.transform = back;
      if (motion()) copy.addEventListener("transitionend", done, { once: true });
      else done();
    };
    const onkey = (e) => e.key === "Escape" && close?.();
    const y = scrollY;
    const onscroll = () => Math.abs(scrollY - y) > 40 && close?.();
    veil.addEventListener("click", () => close?.());
    addEventListener("keydown", onkey);
    addEventListener("scroll", onscroll, { passive: true });
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

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="thought-grid" bind:this={grid} {onclick} {onkeydown}>
  {@render children()}
  {#if toc.length}
    <nav class="toc" aria-label="on this page">
      <div class="toc-in">
        <p class="toc-label"><span class="toc-read"><Dots glyph="lb" />{Math.round(read * 100)}%<Dots glyph="rb" /></span>on this page</p>
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
            {#each toc as h}
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
