<script>
  // every thought sits in this grid, after benja.dev's articles: the page's
  // own <main> (date and views in its gutter, prose beside them) takes nine
  // twelfths, and "on this page" takes the last three, sticky, marking the
  // section being read. it also wires what the prerendered markup can't do
  // alone: the copy buttons on code blocks, and figures that zoom to fill
  // the window when clicked
  import { afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";

  let { children } = $props();

  let grid;
  let toc = $state([]);
  let active = $state(null);
  let headings = [];

  // a section is current once its heading passes a quarter of the way down
  function spy() {
    let at = headings[0]?.id ?? null;
    for (const h of headings) if (h.getBoundingClientRect().top <= innerHeight * 0.25) at = h.id;
    active = at;
  }

  afterNavigate(() => {
    headings = [...grid.querySelectorAll("article h2[id]")];
    toc = headings.map((h) => ({ id: h.id, text: h.textContent.trim() }));
    spy();
  });

  onMount(() => {
    addEventListener("scroll", spy, { passive: true });
    return () => removeEventListener("scroll", spy);
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
        <p class="toc-label">on this page</p>
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
    </nav>
  {/if}
</div>
