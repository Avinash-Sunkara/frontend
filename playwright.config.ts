import { defineConfig, devices } from "@playwright/test";

// Runs the mock API + the Next dev server, then tests every viewport class you listed.
export default defineConfig({
  testDir: "./e2e", timeout: 45_000, retries: process.env.CI ? 1 : 0, reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: [
    { command: "node dev/mock-server.mjs", url: "http://localhost:4000/api/v1/public/testimonials", reuseExistingServer: true },
    { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true, timeout: 120_000,
      env: { NEXT_PUBLIC_API_URL: "http://localhost:4000/api/v1", NEXT_PUBLIC_SITE_URL: "http://localhost:3000" } },
  ],
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "laptop", use: { viewport: { width: 1280, height: 720 } } },
    { name: "tablet", use: { ...devices["iPad (gen 7)"] } },
    { name: "android", use: { ...devices["Pixel 7"] } },
    { name: "iphone", use: { ...devices["iPhone 14"] } },
  ],
});
