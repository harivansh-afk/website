import { test, expect } from "@playwright/test";

// the site's own regressions: the header going dead, the name not swelling,
// a figure's zoom left over the page, and css zoom geometry
test.beforeEach(async ({ page }) => {
  await page.route("**/counter/hit**", (route) => route.fulfill({ status: 204 }));
});

// every header link is what a press at its centre lands on
async function headerAlive(page) {
  const dead = await page.evaluate(() =>
    [...document.querySelectorAll(".top a")]
      .filter((a) => {
        const r = a.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return !(hit && a.contains(hit));
      })
      .map((a) => a.textContent),
  );
  expect(dead).toEqual([]);
}

test("the header answers every press, however fast", async ({ page }) => {
  await page.goto("/");
  const nav = (name) => page.locator(".top nav a", { hasText: name });
  for (let i = 0; i < 12; i++) {
    await nav("writing").click({ noWaitAfter: true });
    await nav("software").click();
    await expect(page).toHaveURL(/\/software\/$/);
    await page.locator(".top .who").click();
    await expect(page).toHaveURL(/127\.0\.0\.1:\d+\/$/);
    await headerAlive(page);
  }
});

test("a hovered section gets its brackets right after a navigation", async ({ page }) => {
  await page.goto("/");
  await page.locator(".top nav a", { hasText: "writing" }).click();
  const software = page.locator(".top nav a", { hasText: "software" });
  await software.hover();
  await expect(software.locator(".dots").first()).toHaveCSS("opacity", "1");
});

test("the name swells at the letter under the cursor, and settles", async ({ page }) => {
  await page.goto("/writing/");
  const letters = page.locator(".who .l");
  for (const n of [0, 3]) {
    const box = await letters.nth(n).boundingBox();
    await page.mouse.move(box.x + box.width / 2 - 30, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await page.waitForTimeout(500);
    const k = await letters.evaluateAll((els) => els.map((e) => parseFloat(e.style.webkitTextStrokeWidth) || 0));
    expect(k.indexOf(Math.max(...k))).toBe(n);
  }
  await page.mouse.move(700, 700, { steps: 3 });
  await expect
    .poll(() => letters.evaluateAll((els) => els.map((e) => e.style.webkitTextStrokeWidth).join("")))
    .toBe("");
});

test("a zoomed figure always goes away", async ({ page }) => {
  await page.goto("/writing/");
  await page.locator('.rows a[href="/thoughts/the-autonomy-radius/"]').click();
  const img = page.locator("article figure img").first();
  await img.scrollIntoViewIfNeeded();
  const b = await img.boundingBox();
  const at = [b.x + b.width / 2, b.y + b.height / 2];
  // open then close at once, before the opening has painted
  await page.mouse.click(...at);
  await page.mouse.click(...at);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  // escape, and leaving the page while it's open
  await page.mouse.click(...at);
  await expect(page.locator("dialog.zoom.on")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.mouse.click(...at);
  await page.goBack();
  await expect(page).toHaveURL(/\/writing\/$/);
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await headerAlive(page);
});

test("no css zoom: desktop scales by the root size", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveCSS("zoom", "1");
  await expect(html).toHaveCSS("font-size", "19.2px");
});

test("the developer screen fits the window at every size", async ({ page }) => {
  await page.goto("/developer/");
  await page.locator(".screen.ready").waitFor();
  for (const [width, height] of [[1400, 900], [800, 700], [390, 844]]) {
    await page.setViewportSize({ width, height });
    const over = () =>
      page.evaluate(() => {
        const s = document.querySelector(".screen");
        const right = Math.max(...[...s.querySelectorAll(".pane, .line")].map((e) => e.getBoundingClientRect().right));
        return right - innerWidth;
      });
    await expect.poll(over).toBeLessThanOrEqual(0.5);
  }
});
