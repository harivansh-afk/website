<script module>
  // bump when regenerating shots: static/ assets are CDN-cached immutably
  const IMG_V = "10";
  const imgSrc = (name) => `/previews/${name}.webp?v=${IMG_V}`;
</script>

<script>
  // link previews: hover a curated a[data-preview] link, get an instant
  // popover. desktop only; degrades to plain links everywhere else.
  import { onMount, tick } from "svelte";

  const LINGER_MS = 100;

  let pop = $state(); // the popover element
  let anchor = null; // the link the popover belongs to
  let current = $state(null); // preview name being shown
  let visible = $state(false);
  let enabled = $state(false);
  let pinned = $state(false);
  let heatmap = null; // null: not fetched, false: failed, object: data
  let calendar = $state(null); // heatmap laid out into weeks + labels
  let lingerTimer = 0;

  // a regular github-style contribution calendar: 10px squares, 3px gap,
  // month + weekday labels, github green palette (via .hm-N classes)
  const CELL = 10;
  const STEP = 13;
  const TOP = 15;
  const LEFT = 30;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const WEEKDAYS = [
    ["Mon", 1],
    ["Wed", 3],
    ["Fri", 5],
  ];

  function layout(data) {
    const weeks = [];
    for (const [date, , level] of data.days) {
      const day = new Date(date + "T00:00:00Z").getUTCDay();
      if (day === 0 || weeks.length === 0) weeks.push([]);
      weeks[weeks.length - 1].push({ date, level, day });
    }
    const months = [];
    let lastMonth = -1;
    weeks.forEach((week, w) => {
      const first = new Date(week[0].date + "T00:00:00Z");
      const month = first.getUTCMonth();
      if (month !== lastMonth && first.getUTCDate() <= 7) {
        if (w < weeks.length - 2) months.push({ x: LEFT + w * STEP, name: MONTHS[month] });
        lastMonth = month;
      }
    });
    return { weeks, months, total: data.total };
  }

  async function loadHeatmap() {
    if (heatmap === null) {
      try {
        const url = "/previews/heatmap.json?d=1-" + new Date().toISOString().slice(0, 10);
        const res = await fetch(url);
        heatmap = res.ok ? await res.json() : false;
      } catch {
        heatmap = false;
      }
      if (heatmap) calendar = layout(heatmap);
    }
    return heatmap;
  }

  function hide() {
    clearTimeout(lingerTimer);
    anchor = null;
    visible = false;
  }

  // body carries `zoom`; fixed-position coordinates are interpreted in the
  // zoomed space, so translate viewport px back through the effective zoom
  function place(a) {
    const p = pop.getBoundingClientRect();
    const z = pop.offsetWidth ? p.width / pop.offsetWidth : 1;
    const r = a.getBoundingClientRect();
    const left = Math.max(12, Math.min(r.left, innerWidth - p.width - 12));
    let top = r.bottom + 10;
    if (top + p.height > innerHeight - 12) top = r.top - p.height - 10;
    top = Math.max(12, top);
    pop.style.left = left / z + "px";
    pop.style.top = top / z + "px";
  }

  async function show(a) {
    anchor = a;
    const name = a.dataset.preview;
    if (name === "heatmap" && !(await loadHeatmap())) return;
    if (anchor !== a) return;
    current = name;
    visible = true;
    await tick();
    place(a);
  }

  function over(e) {
    const a = e.target.closest?.("a[data-preview]");
    if (!a) return;
    clearTimeout(lingerTimer);
    if (a === anchor) return;
    show(a);
  }

  function out(e) {
    const a = e.target.closest?.("a[data-preview]");
    if (!a) return;
    if (e.relatedTarget && a.contains(e.relatedTarget)) return;
    clearTimeout(lingerTimer);
    lingerTimer = setTimeout(hide, LINGER_MS);
  }

  onMount(() => {
    const pin = location.hash.match(/^#preview=([\w-]+)$/);
    pinned = !!pin;
    if (!pin && !matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    enabled = true;

    // warm every preview after load so the first hover is instant
    const warm = () => {
      for (const a of document.querySelectorAll("a[data-preview]")) {
        if (a.dataset.preview === "heatmap") loadHeatmap();
        else new Image().src = imgSrc(a.dataset.preview);
      }
    };
    if (document.readyState === "complete") warm();
    else addEventListener("load", warm, { once: true });

    // #preview=<name> pins a popover open; used to screenshot the site itself
    if (pin) {
      const a = document.querySelector(`a[data-preview="${pin[1]}"]`);
      if (a) {
        a.scrollIntoView({ block: "center" });
        show(a);
      }
    }
  });
</script>

<svelte:document onmouseover={enabled ? over : undefined} onmouseout={enabled ? out : undefined} />
<svelte:window onscroll={enabled && !pinned ? hide : undefined} />

{#if enabled}
  <div
    class="preview-pop"
    class:on={visible}
    class:heatmap={current === "heatmap"}
    aria-hidden="true"
    bind:this={pop}
  >
    {#key current}
      {#if current === "heatmap"}
        {#if calendar}
          <div>
            <svg
              class="preview-hm"
              width={LEFT + calendar.weeks.length * STEP}
              height={TOP + 7 * STEP}
            >
              {#each calendar.months as m}
                <text class="hm-label" x={m.x} y="10">{m.name}</text>
              {/each}
              {#each calendar.weeks as week, w}
                {#each week as d}
                  <rect
                    class="hm-{d.level}"
                    x={LEFT + w * STEP}
                    y={TOP + d.day * STEP}
                    width={CELL}
                    height={CELL}
                  />
                {/each}
              {/each}
              {#each WEEKDAYS as [name, day]}
                <text class="hm-label" x="0" y={TOP + day * STEP + CELL - 1}>{name}</text>
              {/each}
            </svg>
            <div class="hm-total">
              {calendar.total.toLocaleString("en-US")} contributions in the last year
            </div>
          </div>
        {/if}
      {:else if current}
        <img
          src={imgSrc(current)}
          alt=""
          decoding="sync"
          onload={() => anchor && place(anchor)}
          onerror={hide}
        />
      {/if}
    {/key}
  </div>
{/if}
