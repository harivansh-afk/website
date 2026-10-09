import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: process.env.CHROMIUM });
const p = await b.newPage({ viewport: { width: 1100, height: 1000 }, colorScheme: "dark" });
const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("file:///tmp/wordmark/wordmark-concepts-3.html");
await p.waitForTimeout(3000);
// overlay real "hari" in red over each face to check the dot
await p.evaluate(() => document.querySelectorAll("#faces .nm, [data-k] .nm").forEach((nm) => {
  nm.style.position = "relative";
  const g = document.createElement("span"); g.textContent = "hari"; g.className = "ghost";
  g.style.cssText = "position:absolute;left:0;top:0;color:rgb(255 60 60 / .6);pointer-events:none"; nm.append(g);
}));
await p.waitForTimeout(200);
await p.locator("#faces").screenshot({ path: "/tmp/wordmark/f-faces.png" });
await p.evaluate(() => document.querySelectorAll(".ghost").forEach((g) => g.remove()));
// B1: drag dot down and release
const cd = await p.locator('[data-k="cord"] .dot').boundingBox();
await p.mouse.move(cd.x + 1, cd.y + 1, { steps: 5 }); await p.waitForTimeout(200);
await p.mouse.down(); await p.mouse.move(cd.x + 4, cd.y + 50, { steps: 10 }); await p.waitForTimeout(100);
await p.locator('[data-k="cord"]').screenshot({ path: "/tmp/wordmark/f-cord1.png" });
await p.mouse.up(); await p.waitForTimeout(500);
console.log("theme after pull:", await p.evaluate(() => document.documentElement.dataset.theme));
await p.locator('[data-k="cord"]').screenshot({ path: "/tmp/wordmark/f-cord2.png" });
// B2: scroll
await p.locator('[data-k="read"] .rd-scroll').evaluate((s) => (s.scrollTop = 300)); await p.waitForTimeout(900);
await p.locator('[data-k="read"]').screenshot({ path: "/tmp/wordmark/f-read.png" });
// B5 tilt
const ph = await p.locator(".phone").boundingBox();
await p.mouse.move(ph.x + ph.width / 2, ph.y + ph.height / 2); await p.mouse.move(ph.x + ph.width + 60, ph.y + ph.height + 30, { steps: 10 }); await p.waitForTimeout(700);
await p.locator('[data-k="tilt"]').screenshot({ path: "/tmp/wordmark/f-tilt.png" });
// B3/B4/B6
await p.locator('[data-k="beat"]').click(); await p.waitForTimeout(150); await p.locator('[data-k="beat"]').screenshot({ path: "/tmp/wordmark/f-beat.png" });
await p.locator('[data-k="others"]').hover(); await p.waitForTimeout(300); await p.locator('[data-k="others"]').screenshot({ path: "/tmp/wordmark/f-others.png" });
await p.locator("#away").click(); await p.waitForTimeout(600); await p.locator('[data-k="tab"]').screenshot({ path: "/tmp/wordmark/f-tab.png" });
console.log("errors", JSON.stringify(errs));
await b.close();
