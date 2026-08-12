import { defineConfig, devices } from "@playwright/test";

/* QA-Stufe 1 (Standard Business Site): Lighthouse plus der Pflicht-Check der
   KI-Kennzeichnung. Der Webserver wird von Playwright selbst gestartet, damit
   `npm run qa` ohne Vorbereitung läuft. */
export default defineConfig({
  testDir: "./qa-tests",
  fullyParallel: true,
  reporter: [["list"]],
  outputDir: "./qa-reports/playwright",
  use: {
    baseURL: process.env.QA_BASE_URL ?? "http://localhost:3100",
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.QA_BASE_URL
    ? undefined
    : {
        command: "npm run start -- --port 3100",
        url: "http://localhost:3100",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
