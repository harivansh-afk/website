// where everything sits on a screen of cols x rows cells. pure: the same size
// always gives the same layout. the screen is always the whole viewport: a
// title bar on the first row, a status line on the last, panes filling the
// rows between. wide screens put the three panes side by side; medium ones
// put the detail pane under the other two; narrow ones stack all three
const SECTIONS_W = 24;
const GAP = 1;

export function layout(cols, rows, sectionCount) {
  const top = 2; // title bar, then a blank row
  const bottom = rows - 1; // the status line
  const h = Math.max(4, bottom - top - 1);

  if (cols >= 100) {
    const detailW = Math.min(56, Math.max(38, Math.floor(cols * 0.3)));
    const rowsW = cols - SECTIONS_W - detailW - 2 * GAP;
    return {
      shape: "wide",
      sections: { x: 0, y: top, w: SECTIONS_W, h },
      rows: { x: SECTIONS_W + GAP, y: top, w: rowsW, h },
      detail: { x: cols - detailW, y: top, w: detailW, h },
      status: bottom,
    };
  }

  const detailH = Math.min(11, Math.max(7, Math.floor(h * 0.35)));
  if (cols >= 64) {
    const upperH = h - detailH - 1;
    return {
      shape: "medium",
      sections: { x: 0, y: top, w: SECTIONS_W, h: upperH },
      rows: { x: SECTIONS_W + GAP, y: top, w: cols - SECTIONS_W - GAP, h: upperH },
      detail: { x: 0, y: top + upperH + 1, w: cols, h: detailH },
      status: bottom,
    };
  }

  const sectionsH = Math.min(sectionCount + 2, Math.floor(h * 0.3));
  const rowsH = h - sectionsH - detailH - 2;
  return {
    shape: "narrow",
    sections: { x: 0, y: top, w: cols, h: sectionsH },
    rows: { x: 0, y: top + sectionsH + 1, w: cols, h: rowsH },
    detail: { x: 0, y: top + sectionsH + rowsH + 2, w: cols, h: detailH },
    status: bottom,
  };
}
