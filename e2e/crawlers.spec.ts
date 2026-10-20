import { expect, test } from './fixtures';

test('robots.txt lets crawlers in and names the sitemap', async ({ page }) => {
  const robots = await page.request.get('/robots.txt');

  expect(robots.ok()).toBe(true);
  expect(robots.headers()['content-type']).toMatch(/^text\/plain/);
  const text = await robots.text();
  expect(text).toContain('Allow: /');
  expect(text).toContain('Sitemap: https://lotto.app.rgpl.xyz/sitemap.xml');
});

test('the sitemap lists the checker', async ({ page }) => {
  const sitemap = await page.request.get('/sitemap.xml');

  expect(sitemap.ok()).toBe(true);
  expect(sitemap.headers()['content-type']).toMatch(/xml/);
  expect(await sitemap.text()).toContain('<loc>https://lotto.app.rgpl.xyz/</loc>');
});

test('the page describes itself for search results', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /^Check rows of lotto numbers against a draw's winning numbers/,
  );
});
