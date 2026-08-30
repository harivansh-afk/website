// link previews: hover a curated link, get an instant popover.
// desktop only; degrades to plain links everywhere else.
(() => {
  const pinned = location.hash.match(/^#preview=([\w-]+)$/);
  if (!pinned && !matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  // bump when regenerating shots: the CDN caches assets immutably
  const IMG_V = "10";
  const imgSrc = (name) => "/previews/" + name + ".webp?v=" + IMG_V;
  const vidSrc = (name) => "/previews/" + name + ".mp4?v=" + IMG_V;
  const HEATMAP_URL = "/previews/heatmap.json?d=1-" + new Date().toISOString().slice(0, 10);

  const pop = document.createElement("div");
  pop.className = "preview-pop";
  pop.setAttribute("aria-hidden", "true");
  document.body.appendChild(pop);

  let anchor = null;
  let heatmap = null;
  let lingerTimer = 0;
  const LINGER_MS = 100;

  function hide() {
    clearTimeout(lingerTimer);
    anchor = null;
    pop.classList.remove("on");
  }

  async function loadHeatmap() {
    if (heatmap === null) {
      try {
        const res = await fetch(HEATMAP_URL);
        heatmap = res.ok ? await res.json() : false;
      } catch {
        heatmap = false;
      }
    }
    return heatmap;
  }

  // a regular github-style contribution calendar: 10px squares, 3px gap,
  // month + weekday labels, github green palette (via .hm-N classes)
  function calendar(data) {
    const CELL = 10;
    const STEP = 13;
    const TOP = 15;
    const LEFT = 30;
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const NS = "http://www.w3.org/2000/svg";

    const weeks = [];
    for (const [date, count, level] of data.days) {
      const day = new Date(date + "T00:00:00Z").getUTCDay();
      if (day === 0 || weeks.length === 0) weeks.push([]);
      weeks[weeks.length - 1].push({ date, count, level, day });
    }

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", LEFT + weeks.length * STEP);
    svg.setAttribute("height", TOP + 7 * STEP);
    svg.setAttribute("class", "preview-hm");

    let lastMonth = -1;
    weeks.forEach((week, w) => {
      const first = new Date(week[0].date + "T00:00:00Z");
      const month = first.getUTCMonth();
      if (month !== lastMonth && first.getUTCDate() <= 7) {
        if (w < weeks.length - 2) {
          const label = document.createElementNS(NS, "text");
          label.setAttribute("x", LEFT + w * STEP);
          label.setAttribute("y", 10);
          label.setAttribute("class", "hm-label");
          label.textContent = MONTHS[month];
          svg.appendChild(label);
        }
        lastMonth = month;
      }
      for (const d of week) {
        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", LEFT + w * STEP);
        rect.setAttribute("y", TOP + d.day * STEP);
        rect.setAttribute("width", CELL);
        rect.setAttribute("height", CELL);
        rect.setAttribute("class", "hm-" + d.level);
        svg.appendChild(rect);
      }
    });

    [["Mon", 1], ["Wed", 3], ["Fri", 5]].forEach(([name, day]) => {
      const label = document.createElementNS(NS, "text");
      label.setAttribute("x", 0);
      label.setAttribute("y", TOP + day * STEP + CELL - 1);
      label.setAttribute("class", "hm-label");
      label.textContent = name;
      svg.appendChild(label);
    });

    const wrap = document.createElement("div");
    wrap.appendChild(svg);
    const totalLine = document.createElement("div");
    totalLine.className = "hm-total";
    totalLine.textContent = data.total.toLocaleString("en-US") + " contributions in the last year";
    wrap.appendChild(totalLine);
    return wrap;
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
    top = Math.max(12, top);
    pop.style.left = left / z + "px";
    pop.style.top = top / z + "px";
  }

  async function fill(a) {
    const name = a.dataset.preview;
    pop.innerHTML = "";
    pop.classList.toggle("heatmap", name === "heatmap");
    if (name === "heatmap") {
      const data = await loadHeatmap();
      if (!data) return false;
      pop.appendChild(calendar(data));
    } else if (a.dataset.previewType === "video") {
      const video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.onerror = hide;
      video.src = vidSrc(name);
      pop.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.alt = "";
      img.decoding = "sync";
      img.onerror = hide;
      img.src = imgSrc(name);
      pop.appendChild(img);
    }
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
    const video = pop.querySelector("video");
    if (video)
      video.addEventListener(
        "loadeddata",
        () => {
          if (anchor === a) place(a);
        },
        { once: true },
      );
  }

  document.addEventListener("mouseover", (e) => {
    const a = e.target.closest && e.target.closest("a[data-preview]");
    if (!a) return;
    clearTimeout(lingerTimer);
    if (a === anchor) return;
    show(a);
  });

  document.addEventListener("mouseout", (e) => {
    const a = e.target.closest && e.target.closest("a[data-preview]");
    if (!a) return;
    if (e.relatedTarget && a.contains(e.relatedTarget)) return;
    clearTimeout(lingerTimer);
    lingerTimer = setTimeout(hide, LINGER_MS);
  });

  if (!pinned) addEventListener("scroll", hide, { passive: true });

  // warm every preview after load so the first hover is instant
  addEventListener(
    "load",
    () => {
      for (const a of document.querySelectorAll("a[data-preview]")) {
        const name = a.dataset.preview;
        if (name === "heatmap") loadHeatmap();
        else if (a.dataset.previewType === "video") {
          const v = document.createElement("video");
          v.preload = "auto";
          v.muted = true;
          v.src = vidSrc(name);
        } else new Image().src = imgSrc(name);
      }
    },
    { once: true },
  );

  // #preview=<name> pins a popover open; used to screenshot the site itself
  if (pinned) {
    const a = document.querySelector('a[data-preview="' + pinned[1] + '"]');
    if (a) {
      a.scrollIntoView({ block: "center" });
      show(a);
    }
  }
})();
