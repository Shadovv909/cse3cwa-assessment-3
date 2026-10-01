import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [["list"], ["json", { outputFile: "evidence/playwright/results.json" }], ["html", { outputFolder: "evidence/playwright/html", open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/health",
    reuseExistingServer: false,
    env: { DATABASE_PATH: "data/playwright.db", DATABASE_SEED: "1" },
    timeout: 60000,
  },
});
