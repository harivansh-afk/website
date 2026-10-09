// end-to-end tests against the built site (run ./build.sh first). the
// keyboard's logic is unit-tested in src/lib/tui; these cover what only a real
// browser shows: the mouse and the keyboard sharing the screen, held keys,
// leaving for hari.cafe and coming back
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  use: {
    baseURL: "http://127.0.0.1:47811",
    viewport: { width: 1400, height: 900 },
    // nixos has no playwright browsers; use the system chromium
    launchOptions: { executablePath: process.env.CHROMIUM || undefined },
  },
  webServer: {
    command: "python3 -m http.server 47811 --bind 127.0.0.1 --directory dist",
    url: "http://127.0.0.1:47811/developer/",
    reuseExistingServer: true,
  },
});
