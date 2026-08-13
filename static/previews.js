// link previews: hover a curated link, get a quiet monotone popover.
// desktop only; degrades to plain links everywhere else.
(() => {
  // #preview=<name> pins a popover open (bypasses the desktop gate;
  // used to screenshot the site itself)
  const pinned = location.hash.match(/^#preview=([\w-]+)$/);
  if (!pinned && !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const pop = document.createElement("div");
  pop.className = "preview-pop";
  pop.setAttribute("aria-hidden", "true");
  if (pinned) pop.style.transition = "none";
  document.body.appendChild(pop);

  let timer = null;
  let anchor = null;
  let heatmap = null;

  function domain(href) {
    try {
      return new URL(href).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  function hide() {
    anchor = null;
    clearTimeout(timer);
    pop.classList.remove("on");
  }

  // body carries `zoom`; fixed-position coordinates are interpreted in the
  // zoomed space, so translate viewport px back through the effective zoom.
  function place(a) {
    const p = pop.getBoundingClientRect();
    const z = pop.offsetWidth ? p.width / pop.offsetWidth : 1;
    const r = a.getBoundingClientRect();
    let left = Math.max(12, Math.min(r.left, innerWidth - p.width - 12));
    let top = r.bottom + 10;
    if (top + p.height > innerHeight - 12) top = r.top - p.height - 10;
    pop.style.left = left / z + "px";
    pop.style.top = top / z + "px";
  }

  async function fill(a) {
    const name = a.dataset.preview;
    const label = a.dataset.previewLabel || domain(a.href);
    pop.innerHTML = "";
    if (name === "heatmap") {
      if (heatmap === null) {
        try {
          // daily cache-buster: the CDN caches assets hard, the heatmap moves daily
          const res = await fetch("/previews/heatmap.txt?d=2-" + new Date().toISOString().slice(0, 10));
          heatmap = res.ok ? await res.text() : "";
        } catch {
          heatmap = "";
        }
      }
      if (!heatmap) return false;
      const pre = document.createElement("pre");
      pre.className = "preview-heatmap";
      pre.textContent = heatmap.replace(/\n+$/, "");
      pop.appendChild(pre);
    } else {
      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.onerror = hide;
      // bump when regenerating shots: the CDN caches assets immutably
      img.src = "/previews/" + name + ".webp?v=2";
      pop.appendChild(img);
    }
    const cap = document.createElement("div");
    cap.className = "preview-caption";
    cap.textContent = label;
    pop.appendChild(cap);
    return true;
  }

  async function show(a) {
    anchor = a;
    if (!(await fill(a))) return;
    if (anchor !== a) return;
    pop.classList.add("on");
    place(a);
    const img = pop.querySelector("img");
    if (img && !img.complete)
      img.addEventListener(
        "load",
        () => {
          if (anchor === a) place(a);
        },
        { once: true },
      );
  }

  document.addEventListener("mouseover", (e) => {
    const a = e.target.closest && e.target.closest("a[data-preview]");
    if (!a) return;
    clearTimeout(timer);
    timer = setTimeout(() => show(a), 150);
  });

  document.addEventListener("mouseout", (e) => {
    const a = e.target.closest && e.target.closest("a[data-preview]");
    if (!a) return;
    if (e.relatedTarget && a.contains(e.relatedTarget)) return;
    hide();
  });

  if (!pinned) addEventListener("scroll", hide, { passive: true });

  if (pinned) {
    const a = document.querySelector('a[data-preview="' + pinned[1] + '"]');
    if (a) {
      a.scrollIntoView({ block: "center" });
      show(a);
    }
  }
})();
