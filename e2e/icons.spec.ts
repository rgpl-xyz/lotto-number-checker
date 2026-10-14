import { expect, test } from './fixtures';

test('the page lists its icons, and each one is served as an image', async ({ page }) => {
  await page.goto('/');

  const icons = await page
    .locator('link[rel="icon"], link[rel="apple-touch-icon"]')
    .evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  expect(icons).toHaveLength(3);
  for (const icon of icons) {
    const response = await page.request.get(icon);
    expect(response.ok(), icon).toBe(true);
    expect(response.headers()['content-type'], icon).toMatch(/^image\//);
  }
});
