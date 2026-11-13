<script>
  // every thought sits in this grid, after benja.dev's articles: the page's
  // own <main> (date and views in its gutter, prose beside them) takes nine
  // twelfths, and "on this page" takes the last three, sticky, with the
  // section being read in full colour. it
  // also wires what the prerendered markup can't do alone: the copy buttons
  // on code blocks, and figures that zoom to fill the window when clicked
  import { afterNavigate } from "$app/navigation";
  import Zoom from "#lib/Zoom.svelte";

  let { children } = $props();

  let grid;
  let toc = $state([]);
  let active = $state(null);
  let headings = [];

  // the reading line sits a quarter of the way down the window
  const LINE = 0.25;
  const docTop = (el) => el.getBoundingClientRect().top + scrollY;

  function spy() {
    if (!headings.length) return;
    const line = scrollY + innerHeight * LINE;
    let i = 0;
    while (i + 1 < headings.length && docTop(headings[i + 1]) <= line) i++;
    active = headings[i].id;
  }

  // scroll and resize fire faster than frames; measure once per frame
  let frame = 0;
  const schedule = () => (frame ||= requestAnimationFrame(() => ((frame = 0), spy())));

  afterNavigate(() => {
    zoomer?.finish();
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

  let zoomer;
  const zoom = (img) => zoomer.zoom(img, { src: img.currentSrc || img.src, alt: img.alt });

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
        <div>
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

<Zoom bind:this={zoomer} />
