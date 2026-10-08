<script>
  // the developer screen, after unicodekit.com: a terminal ui on a grid of
  // character cells that always fills the viewport. layout.js places the
  // panes, frame.js draws their frames as text, keys.js turns keystrokes into
  // state; this file measures the cells, renders, and performs the effects.
  // until the cells are measured the screen stays hidden (no reflow flash);
  // the outline under it carries the same content for screen readers and
  // for browsers without scripts
  import { onMount } from "svelte";
  import Seo from "#lib/Seo.svelte";
  import { viewsOf, formatCount } from "#lib/views.svelte.js";
  import { icon } from "#lib/tui/icons.js";
  import { fit, pad, wrap, counter, bareUrl } from "#lib/tui/text.js";
  import { blank, box, paint, titleSpan } from "#lib/tui/frame.js";
  import { step, keyName, initial } from "#lib/tui/keys.js";
  import { layout } from "./layout.js";
  import { CAFE, DEV, crossTo } from "#lib/site.js";
  import { sections, everything } from "./content.js";

  const FONT = '16px "Iosevka Charon Mono"';
  const LINE = 20; // px per row; a cell is (measured advance) x LINE
  const PAD = { x: 16, y: 12 }; // least px around the grid; the rest centres it
  const SCROLLOFF = 2;

  let screen;
  let cw = $state(8);
  let cols = $state(140);
  let rows = $state(44);
  let ready = $state(false);
  let margin = $state({ x: PAD.x, y: PAD.y });
  let mounted = $state(false);

  let ui = $state({ ...initial });
  let offset = $state({ sections: 0, rows: 0 });

  const matches = (row, q) => `${row.key} ${row.value} ${row.section}`.toLowerCase().includes(q.toLowerCase());
  const list = $derived(ui.query === null ? sections[ui.s].rows : everything.filter((row) => matches(row, ui.query)));
  const row = $derived(list[ui.r]);
  const at = $derived(layout(cols, rows, sections.length));
  const view = $derived({
    sections: sections.length,
    rows: (state) =>
      (state.query === null ? sections[state.s].rows : everything.filter((x) => matches(x, state.query))).length,
    page: at.rows.h - 2,
  });

  // a pane's list scrolls to keep its selection SCROLLOFF rows from the edge
  function scrolled(off, sel, n, h) {
    const so = Math.min(SCROLLOFF, Math.floor((h - 1) / 2));
    if (sel < off + so) off = sel - so;
    if (sel > off + h - 1 - so) off = sel - h + 1 + so;
    return Math.max(0, Math.min(off, Math.max(0, n - h)));
  }
  $effect(() => {
    offset.sections = scrolled(offset.sections, ui.s, sections.length, at.sections.h - 2);
    offset.rows = scrolled(offset.rows, ui.r, list.length, at.rows.h - 2);
  });

  const valueOf = (x) => {
    if (x.views && mounted) {
      const n = viewsOf(x.views);
      if (n !== undefined) return `${formatCount(n)} views`;
    }
    return x.value;
  };

  // the frames, as one block of text
  const rowsTitle = $derived(ui.query === null ? sections[ui.s].name : "search");
  const chrome = $derived.by(() => {
    const buf = blank(cols, rows);
    box(buf, at.sections, { title: "sections", count: counter(ui.s + 1, sections.length) });
    box(buf, at.rows, { title: rowsTitle, count: list.length ? counter(ui.r + 1, list.length) : "000/000" });
    box(buf, at.detail, { title: "detail" });
    return paint(buf);
  });

  const focusTitle = $derived(
    ui.pane === "sections" && !ui.typing ? titleSpan(at.sections, "sections") : titleSpan(at.rows, rowsTitle),
  );

  // a list line: icon, name, then the rest, cut to the pane's inner width
  const inner = (rect) => rect.w - 4;
  const keyWidth = $derived(
    Math.min(24, Math.floor(inner(at.rows) * 0.42), Math.max(8, ...list.map((x) => x.key.length)) + 2),
  );

  const detail = $derived.by(() => {
    if (!row) return [];
    const w = inner(at.detail);
    const lines = [{ text: fit(row.key.toUpperCase(), w), cls: "fg" }];
    // the value line, unless the text below says the same
    if (valueOf(row) !== row.text) for (const line of wrap(valueOf(row), w)) lines.push({ text: line, cls: "muted" });
    lines.push({ text: "" });
    for (const line of wrap(row.text ?? "", w)) lines.push({ text: line, cls: "fg" });
    if (row.facts?.length) {
      lines.push({ text: "" });
      for (const [label, value] of row.facts) lines.push({ text: fit(value, w - 11), label: pad(label, 10), cls: "fg" });
    }
    // a machine report: every meter the same width, so they read as a column,
    // the reading after it; a narrow pane drops the meters. drawn in ━ and ─,
    // which the cell font carries (its subset has no block shades)
    if (row.report?.length) {
      lines.push({ text: "" });
      for (const [label, share, reading] of row.report) {
        const cells = share === null || w < 34 ? 0 : 10;
        const on = Math.round(share * cells);
        lines.push({ label: pad(label, 10), on, off: cells - on, text: fit(reading, Math.max(0, w - 11 - (cells ? cells + 1 : 0))) });
      }
    }
    if (row.href) {
      lines.push({ text: "" });
      lines.push({ text: fit(bareUrl(row.href), w - 4), href: row.href });
    }
    return lines.slice(0, at.detail.h - 2);
  });

  // the personal site opens in place, with the crt switching off; anything
  // else is someone else's site and gets a new tab
  const external = (href) => !href.startsWith(CAFE);
  function follow(href) {
    if (external(href)) window.open(href, "_blank", "noopener");
    else crossTo(href);
  }
  function perform(effect) {
    if (effect === "home") crossTo(`${CAFE}/`);
    if (effect === "open" && row?.href) follow(row.href);
  }
  // a plain click on a link to hari.cafe crosses like the keyboard does
  function crossClick(e, href) {
    if (external(href) || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    crossTo(href);
  }

  function onkeydown(e) {
    const key = keyName(e);
    if (!key) return;
    const out = step(ui, key, view);
    if (!out) return;
    e.preventDefault();
    ui = out.state;
    perform(out.effect);
  }

  // the wheel moves the selection of the pane under the pointer
  let wheel = 0;
  function onwheel(e, pane) {
    e.preventDefault();
    wheel += e.deltaY;
    const steps = Math.trunc(wheel / 40);
    if (!steps) return;
    wheel -= steps * 40;
    const out = step({ ...ui, typing: false, pane }, steps > 0 ? "j" : "k", view);
    for (let i = 1; i < Math.abs(steps); i++) out.state = step(out.state, steps > 0 ? "j" : "k", view).state;
    ui = { ...out.state, typing: ui.typing };
  }

  // a touch selects first and opens on the second tap; a mouse opens at once
  function tapRow(e, i) {
    const first = ui.r !== i || ui.pane !== "rows";
    ui = { ...ui, r: i, pane: "rows", typing: false };
    if (first && e.pointerType !== "mouse") e.preventDefault();
    else if (list[i]?.href) crossClick(e, list[i].href);
  }

  // the section is deep-linkable as #<id>
  $effect(() => {
    if (ready && ui.query === null) history.replaceState(history.state, "", `#${sections[ui.s].id}`);
  });

  onMount(() => {
    mounted = true;
    const at = sections.findIndex((x) => x.id === location.hash.slice(1));
    if (at >= 0) ui = { ...ui, s: at };

    // the screen is css-zoomed above phone width (the style below), so the
    // viewport in its own px is the window divided by the zoom
    const zoom = () => screen.currentCSSZoom ?? 1;
    const measure = () => {
      const w = innerWidth / zoom();
      const h = innerHeight / zoom();
      cols = Math.max(20, Math.floor((w - 2 * PAD.x) / cw));
      rows = Math.max(12, Math.floor((h - 2 * PAD.y) / LINE));
      // the cells never fill the viewport exactly: split what's left evenly,
      // so the margins match on both sides
      margin = { x: Math.round((w - cols * cw) / 2), y: Math.round((h - rows * LINE) / 2) };
    };
    let gone = false;
    Promise.all([document.fonts.load(FONT), document.fonts.load('16px "Nonicons"')])
      .catch(() => {})
      .then(() => {
        if (gone) return;
        cw = screen.querySelector(".probe").getBoundingClientRect().width / 100 / zoom();
        measure();
        ready = true;
      });
    addEventListener("resize", measure);
    return () => {
      gone = true;
      removeEventListener("resize", measure);
    };
  });

  const place = (x, y, w) => `left:${x * cw}px;top:${y * LINE}px;width:${w * cw}px`;
  const statusPath = $derived(
    ui.query === null ? `${sections[ui.s].name}${row ? " › " + row.key : ""}` : `search › ${list.length} found`,
  );
</script>

<svelte:window {onkeydown} />

<Seo
  url="{DEV}/"
  title="harivan.sh"
  description="software, tools, experiments and the machines they run on."
/>
<svelte:head>
  <meta name="theme-color" content="#1e2139" />
  <link rel="preload" href="/fonts/IosevkaCharonMono-Regular.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
  <link rel="preload" href="/fonts/nonicons.woff2?v=2" as="font" type="font/woff2" crossorigin="anonymous" />
  <noscript><style>.screen { display: none } .outline { position: static !important; clip-path: none !important; width: auto !important; height: auto !important; }</style></noscript>
</svelte:head>

<div class="dev">
  <div class="screen" class:ready bind:this={screen} style:--cw="{cw}px" style:inset="{margin.y}px {margin.x}px" aria-hidden="true">
    <span class="probe">{"0".repeat(100)}</span>

    <!-- title bar -->
    <div class="line" style={place(0, 0, cols)}>
      <span class="icon">{icon("terminal")}</span><span class="fg">HARIVAN.SH</span>
    </div>
    <a class="line link home" href="{CAFE}/" tabindex="-1" onclick={(e) => crossClick(e, `${CAFE}/`)} style={place(cols - 11, 0, 11)}><b>-</b>{" "}<span class="dest">hari.cafe</span></a>

    <pre class="chrome">{chrome}</pre>

    <!-- focused pane: its title inverted -->
    <div class="line inv" style={place(focusTitle.x, focusTitle.y, focusTitle.w)}>{focusTitle.text}</div>

    <!-- sections -->
    <div class="pane" onwheel={(e) => onwheel(e, "sections")} style={place(at.sections.x, at.sections.y, at.sections.w) + `;height:${at.sections.h * LINE}px`}>
      {#each sections.slice(offset.sections, offset.sections + at.sections.h - 2) as x, k}
        {@const i = offset.sections + k}
        {@const w = inner(at.sections)}
        <button
          class="line item"
          class:sel={i === ui.s && ui.query === null}
          class:focus={ui.pane === "sections" && !ui.typing}
          tabindex="-1"
          style={place(1, k + 1, at.sections.w - 2)}
          onclick={() => (ui = { ...ui, s: i, r: 0, pane: "rows", query: null, typing: false })}
          >{" "}<span class="icon">{icon(x.icon)}</span>{pad(x.name, w - 7)}<span class="muted">{String(x.rows.length).padStart(3)}</span></button
        >
      {/each}
    </div>

    <!-- rows -->
    <div class="pane" onwheel={(e) => onwheel(e, "rows")} style={place(at.rows.x, at.rows.y, at.rows.w) + `;height:${at.rows.h * LINE}px`}>
      {#each list.slice(offset.rows, offset.rows + at.rows.h - 2) as x, k (x.section + x.key)}
        {@const i = offset.rows + k}
        {@const w = inner(at.rows)}
        <a
          class="line item"
          class:sel={i === ui.r}
          class:focus={ui.pane === "rows"}
          href={x.href ?? null}
          target={x.href && external(x.href) ? "_blank" : null}
          rel={x.href && external(x.href) ? "noopener noreferrer" : null}
          tabindex="-1"
          style={place(1, k + 1, at.rows.w - 2)}
          onclick={(e) => tapRow(e, i)}
          onpointerenter={(e) => e.pointerType === "mouse" && !ui.typing && (ui = { ...ui, r: i, pane: "rows" })}
          >{" "}<span class="icon">{icon(x.icon)}</span>{pad(fit(x.key, keyWidth - 2), keyWidth)}<span class="muted">{fit(valueOf(x), w - keyWidth - 3)}</span></a
        >
      {:else}
        <div class="line muted" style={place(2, 1, at.rows.w - 4)}>nothing matches “{ui.query}”</div>
      {/each}
    </div>

    <!-- detail -->
    {#each detail as line, k}
      {#if line.href}
        <a
          class="line link"
          href={line.href}
          target={external(line.href) ? "_blank" : null}
          rel={external(line.href) ? "noopener noreferrer" : null}
          tabindex="-1"
          onclick={(e) => crossClick(e, line.href)}
          style={place(at.detail.x + 2, at.detail.y + 1 + k, line.text.length + 4)}
          ><span class="icon">{icon("link-external")}</span>{line.text}</a
        >
      {:else}
        <div class="line {line.cls ?? ''}" style={place(at.detail.x + 2, at.detail.y + 1 + k, inner(at.detail))}>
          {#if line.label}<span class="muted">{line.label}</span>{" "}{/if}{#if line.on || line.off}{"━".repeat(line.on)}<span class="dim">{"─".repeat(line.off)}</span>{" "}<span class="muted">{line.text}</span>{:else}{line.text}{/if}
        </div>
      {/if}
    {/each}

    <!-- status line -->
    <div class="line status" style={place(0, at.status, cols)}>
      {#if ui.typing}
        <span class="inv">{" SEARCH "}</span>{" "}<span class="fg">/{ui.query}</span><span class="cursor">{" "}</span>
      {:else}
        <span class="inv">{ui.query === null ? " NORMAL " : " FILTER "}</span>{" "}<span class="muted">{fit(statusPath, Math.max(0, cols - 60))}</span>
      {/if}
    </div>
    {#if cols >= 72}
      <div class="line muted hints" style={place(cols - 50, at.status, 50)}>
        <b>j k</b>{" move  "}<b>-</b>{" up  "}<b>enter</b>{" open  "}<b>/</b>{" find  "}<b>esc</b>{" back"}
      </div>
    {/if}
  </div>

  <!-- the same content as plain structure: for screen readers, and shown
       instead of the screen when scripts don't run -->
  <nav class="outline" aria-label="developer">
    <h1>harivan.sh, developer</h1>
    <p><a href="{CAFE}/">hari.cafe</a></p>
    {#each sections as x}
      <section>
        <h2>{x.name}</h2>
        <p>{x.note}</p>
        <ul>
          {#each x.rows as r}
            <li>
              {#if r.href}<a href={r.href}>{r.key}</a>{:else}{r.key}{/if}: {r.value}. {r.text ?? ""}
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </nav>
</div>

<style>
  /* unicodekit's palette, exactly: one navy, one white at three strengths */
  .dev {
    --uk-bg: #1e2139;
    --uk-fg: #e9e9ec;
    --uk-muted: #e9e9ec8c;
    --uk-line: #e9e9ec33;
    position: fixed;
    inset: 0;
    overflow: hidden;
    background: var(--uk-bg);
    color: var(--uk-fg);
    font: 16px/20px "Iosevka Charon Mono", ui-monospace, monospace;
    font-variant-ligatures: none;
    /* the crt: a faint glow and a hair of colour fringing on every glyph */
    text-shadow:
      0 0 1px color-mix(in srgb, currentColor 45%, transparent),
      0 0 6px color-mix(in srgb, currentColor 18%, transparent),
      0.5px 0 0 #ff46461f,
      -0.5px 0 0 #4696ff1f;
  }
  /* read at 150% above phone width, as if the browser were zoomed */
  @media (min-width: 641px) {
    .dev {
      zoom: 1.5;
    }
  }
  :global(html:has(.dev)),
  :global(body:has(.dev)) {
    background: #1e2139;
    overflow: hidden;
  }
  /* scanlines and a vignette over everything, never in the way */
  .dev::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      repeating-linear-gradient(#0000 0 2px, #00000024 2px 3px),
      radial-gradient(#0000 70%, #00000014 100%);
  }

  .screen {
    position: absolute;
    inset: 12px 16px;
    visibility: hidden;
  }
  /* it switches on like a crt the moment it can be drawn (style.css) */
  .screen.ready {
    visibility: visible;
    animation: 360ms cubic-bezier(0.2, 0.8, 0.2, 1) both crt-on;
  }
  @media (prefers-reduced-motion: reduce) {
    .screen.ready {
      animation: none;
    }
  }
  .probe {
    position: absolute;
    visibility: hidden;
    white-space: pre;
  }

  /* the frame buffer: reset everything the site's own pre rule sets */
  .chrome {
    position: absolute;
    inset: 0;
    width: auto;
    max-width: none;
    margin: 0;
    padding: 0;
    border-radius: 0;
    background: none;
    overflow: visible;
    font: inherit;
    color: var(--uk-muted);
    white-space: pre;
    pointer-events: none;
  }
  .line {
    position: absolute;
    height: 20px;
    overflow: hidden;
    white-space: pre;
  }
  .pane {
    position: absolute;
  }
  .item {
    display: block;
    padding: 0;
    border: 0;
    background: none;
    color: var(--uk-fg);
    font: inherit;
    text-align: left;
    text-shadow: inherit;
    text-decoration: none;
    cursor: pointer;
  }
  .fg {
    color: var(--uk-fg);
  }
  .muted {
    color: var(--uk-muted);
  }
  .dim {
    color: var(--uk-line);
  }
  /* an icon is a glyph wider than a cell, so it gets three: itself, its
     overhang and a space, like a file tree in the editor */
  .icon {
    display: inline-block;
    width: calc(3 * var(--cw));
    font-family: "Nonicons";
    font-size: 13px;
    vertical-align: top;
  }
  /* the selection: inverted where the focus is, a tint where it isn't */
  .item.sel {
    background: var(--uk-line);
  }
  .item.sel.focus,
  .inv {
    background: var(--uk-fg);
    color: var(--uk-bg);
    text-shadow: none;
  }
  .item.sel.focus .muted {
    color: color-mix(in srgb, var(--uk-bg) 72%, transparent);
  }
  .link {
    padding: 0;
    margin: 0;
    background: none;
    color: var(--uk-fg);
    text-decoration: underline dotted var(--uk-muted);
    text-underline-offset: 4px;
  }
  .link:hover {
    text-decoration-style: solid;
  }
  .home {
    text-align: right;
    text-decoration: none;
  }
  .home b {
    font-weight: 400;
  }
  .home .dest {
    color: var(--uk-muted);
    text-decoration: underline dotted var(--uk-muted);
    text-underline-offset: 4px;
    transition: color 0.12s;
  }
  .home:hover .dest {
    color: var(--uk-fg);
    text-decoration-style: solid;
  }
  /* a row under the pointer that isn't selected yet gets a breath of tint */
  @media (hover: hover) {
    .item:not(.sel):hover {
      background: color-mix(in srgb, var(--uk-fg) 7%, transparent);
    }
  }
  .hints {
    text-align: right;
  }
  .hints b {
    font-weight: 400;
    color: var(--uk-fg);
  }
  .cursor {
    background: var(--uk-fg);
    animation: blink 1s steps(1) infinite;
  }
  @keyframes blink {
    50% {
      background: transparent;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .cursor {
      animation: none;
    }
  }

  /* visually hidden, until scripts are off */
  .outline {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    padding: 1rem;
  }
  .outline a {
    color: var(--uk-fg);
  }
</style>
