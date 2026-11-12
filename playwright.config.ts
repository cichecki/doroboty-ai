import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The default (half the CPU cores) overloads many-core machines and pushes the long
  // application journeys past the 30 s test timeout; a small fixed pool stays reliable.
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3106",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run preview -- --port 3106",
    url: "http://127.0.0.1:3106",
    reuseExistingServer: false,
  },
});
