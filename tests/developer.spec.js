import { test, expect } from "@playwright/test";

// hari.cafe is another origin: answer it with a stub so a cross is observable
test.beforeEach(async ({ page }) => {
  await page.route("https://hari.cafe/**", (route) => route.fulfill({ contentType: "text/html", body: "<title>cafe</title>" }));
  await page.goto("/developer/#software");
  await page.locator(".screen.ready").waitFor();
  await page.waitForTimeout(400); // the crt power-on
});

// the focused pane is the one whose title is inverted; the status line names
// the selection
const focus = async (page) => (await page.locator(".screen > .line.inv").textContent()).trim();
const status = (page) => page.locator(".status").textContent();
const press = async (page, ...keys) => {
  for (const key of keys) {
    await page.keyboard.press(key);
    await page.waitForTimeout(80);
  }
};
const overRows = async (page) => {
  const box = await page.locator(".pane").nth(1).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + 60);
  await page.waitForTimeout(150);
};

test("a resting pointer over the rows doesn't take the focus from j", async ({ page }) => {
  await overRows(page);
  await press(page, "h", "j", "j");
  expect(await focus(page)).toBe("SECTIONS");
  await expect(page).toHaveURL(/#experiments$/);
});

test("moving the mouse hands the rows back to it", async ({ page }) => {
  await overRows(page);
  await press(page, "h");
  await page.mouse.move(700, 300);
  await overRows(page);
  expect(await focus(page)).toBe("SOFTWARE");
});

test("h and l cross between the panes with the pointer anywhere", async ({ page }) => {
  await overRows(page);
  await press(page, "h", "j", "l", "j", "h", "k");
  expect(await focus(page)).toBe("SECTIONS");
  await expect(page).toHaveURL(/#software$/);
});

for (const back of ["-", "Escape"]) {
  test(`a held ${back} backs out one level and stays`, async ({ page }) => {
    await press(page, "l");
    await page.keyboard.down(back);
    for (let i = 0; i < 5; i++) await page.keyboard.down(back); // auto-repeat
    await page.keyboard.up(back);
    await page.waitForTimeout(500);
    expect(page.url()).toContain("/developer/");
    expect(await focus(page)).toBe("SECTIONS");
  });

  test(`${back} from the sections goes to hari.cafe`, async ({ page }) => {
    await press(page, back);
    await page.waitForURL("https://hari.cafe/");
  });
}

test("keys after leaving change nothing", async ({ page }) => {
  // a slow hari.cafe keeps the screen up while the browser navigates
  await page.route("https://hari.cafe/**", async (route) => {
    await new Promise((done) => setTimeout(done, 1000));
    await route.fulfill({ contentType: "text/html", body: "<title>cafe</title>" });
  });
  // pressed and read inside one turn of the page, before the navigation
  // can commit and take the document with it
  const same = await page.evaluate(async () => {
    const status = () => document.querySelector(".status").textContent;
    const key = (k) => dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
    const before = status();
    key("-");
    key("j");
    await new Promise(requestAnimationFrame);
    return status() === before;
  });
  expect(same).toBe(true);
  await page.waitForURL("https://hari.cafe/");
});

test("back from hari.cafe lands on the same row and pane", async ({ page }) => {
  await press(page, "j", "l", "j", "j");
  const before = await status(page);
  await press(page, "h", "-");
  await page.waitForURL("https://hari.cafe/");
  await page.goBack({ waitUntil: "commit" });
  await page.locator(".screen.ready").waitFor();
  expect(await status(page)).toBe(before);
  expect(await focus(page)).toBe("SECTIONS");
  await press(page, "l", "j");
  expect(await focus(page)).not.toBe("SECTIONS");
});
