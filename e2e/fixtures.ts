import { test as base, expect } from '@playwright/test';

export { expect };

/**
 * Playwright's test with two checks on every page. The app needs nothing but its own
 * files, so a request to another site is refused and fails the test. An error or
 * warning in the console fails it too; that is also how the browser reports a CSP
 * violation when the tests run against the nginx config.
 */
export const test = base.extend<{ pageChecks: void }>({
  pageChecks: [
    async ({ page, baseURL }, use) => {
      const origin = new URL(baseURL!).origin;
      const offSite: string[] = [];
      const logged: string[] = [];
      await page.route(
        (url) => url.origin !== origin,
        (route) => {
          offSite.push(route.request().url());
          return route.abort();
        },
      );
      page.on('console', (message) => {
        if (message.type() === 'error' || message.type() === 'warning') {
          logged.push(message.text());
        }
      });
      page.on('pageerror', (error) => logged.push(error.message));

      await use();

      expect(offSite, 'requests to other sites').toEqual([]);
      expect(logged, 'console errors and warnings').toEqual([]);
    },
    { auto: true },
  ],
});
