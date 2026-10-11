import { defineConfig, devices } from "@playwright/test";

const webPort = Number(process.env.PLAYWRIGHT_WEB_PORT || 3100);
const apiPort = Number(process.env.PLAYWRIGHT_API_PORT || 4100);
const webUrl = `http://localhost:${webPort}`;
const apiUrl = `http://localhost:${apiPort}`;

// Keep E2E on isolated mock servers; its in-memory fixture is shared, so run serially.
export default defineConfig({
  testDir: "./e2e", timeout: 45_000, workers: 1, retries: process.env.CI ? 1 : 0, reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: webUrl, trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: [
    { command: "node dev/mock-server.mjs", url: `${apiUrl}/api/v1/public/testimonials`, reuseExistingServer: false,
      env: { PORT: String(apiPort), ORIGIN: webUrl } },
    { command: `npm run dev -- --port ${webPort}`, url: webUrl, reuseExistingServer: false, timeout: 120_000,
      env: { NEXT_PUBLIC_API_URL: `${apiUrl}/api/v1`, NEXT_PUBLIC_SITE_URL: webUrl, NEXT_DIST_DIR: ".next-playwright" } },
  ],
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "laptop", use: { viewport: { width: 1280, height: 720 } } },
    { name: "tablet", use: { ...devices["iPad (gen 7)"] } },
    { name: "android", use: { ...devices["Pixel 7"] } },
    { name: "iphone", use: { ...devices["iPhone 14"] } },
  ],
});
