<script module>
  // dot-matrix punctuation, after stallboerger.com's dotted glyphs: each mark
  // is a small bitmap drawn as svg dots in currentColor. `#` is a dot; rows run
  // top to bottom. `lift` raises the mark off the baseline, in em
  const GLYPHS = {
    lb: { rows: ["###", "#..", "#..", "#..", "#..", "#..", "#..", "###"], lift: -0.12 },
    rb: { rows: ["###", "..#", "..#", "..#", "..#", "..#", "..#", "###"], lift: -0.12 },
    lq: { rows: [".#..#", "#..#.", "##.##", "##.##"], lift: 0.36 },
    rq: { rows: ["##.##", "##.##", ".#..#", "#..#."], lift: 0.36 },
    // the open end of a date range: four dotted slashes
    ongoing: {
      rows: ["...#...#...#...#", "..#...#...#...#.", ".#...#...#...#..", "#...#...#...#..."],
      lift: 0,
      pitch: 0.14,
    },
  };
  const PITCH = 0.115; // em between dot centres

  const DOTS = Object.fromEntries(
    Object.entries(GLYPHS).map(([name, { rows }]) => [
      name,
      rows.flatMap((row, y) => [...row].flatMap((c, x) => (c === "#" ? [[x + 0.5, y + 0.5]] : []))),
    ]),
  );
</script>

<script>
  // `label` is read out in place of the mark; without one the mark is decoration
  let { glyph, label } = $props();

  const g = $derived(GLYPHS[glyph]);
  const pitch = $derived(g.pitch ?? PITCH);
  const w = $derived(g.rows[0].length);
  const h = $derived(g.rows.length);
</script>

<span class="dots" style:vertical-align="{g.lift}em"
  ><svg
    viewBox="0 0 {w} {h}"
    style:width="{w * pitch}em"
    style:height="{h * pitch}em"
    aria-hidden="true">{#each DOTS[glyph] as [cx, cy]}<circle {cx} {cy} r="0.36" />{/each}</svg
  >{#if label}<span class="sr">{label}</span>{/if}</span
>

<style>
  .dots {
    display: inline-block;
    line-height: 0;
  }
  svg {
    display: inline-block;
    fill: currentColor;
    overflow: visible;
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
</style>
