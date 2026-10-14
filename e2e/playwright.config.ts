import { defineConfig, devices } from '@playwright/test';

// Not 4300: north-express's tests serve there, and reuseExistingServer would test that app.
const PORT = 4301;
const isCI = Boolean(process.env['CI']);
/** A running build to test instead of `ng serve`, such as CI's build under nginx or the live site. */
const BASE_URL = process.env['E2E_BASE_URL'] || undefined;

/**
 * End-to-end tests. They run against `ng serve` unless E2E_BASE_URL is set. Every test
 * also checks the page never contacts another site and logs no errors (see fixtures.ts).
 */
export default defineConfig({
  testDir: '.',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // A test that passes only on a retry still fails CI, and its report is kept.
  failOnFlakyTests: isCI,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: BASE_URL
    ? undefined
    : {
        command: `npx ng serve --port ${PORT}`,
        cwd: '..',
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
