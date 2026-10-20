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

test('the checker is in its HTML, for crawlers that run no scripts', async ({ page }) => {
  const checker = await page.request.get('/');

  expect(checker.ok()).toBe(true);
  const html = await checker.text();
  expect(html).toContain('Enter Winning Numbers');
  expect(html).toContain('Check Your Numbers');
  // Its fields come disabled, as the browser hasn't taken the page over yet.
  expect(html).toMatch(/<fieldset(?=[^>]*ready-gate)(?=[^>]*disabled)[^>]*>/);
});

test('the page is taken over as it is, not drawn again', async ({ page }) => {
  // Headings the browser removes: drawing the page again would throw the built ones away.
  await page.addInitScript(() => {
    const removed: string[] = [];
    (window as unknown as { removedHeadings: string[] }).removedHeadings = removed;
    new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (node instanceof Element && (node.matches('h1, h2') || node.querySelector('h1, h2'))) {
            removed.push(node.tagName);
          }
        }
      }
    }).observe(document, { childList: true, subtree: true });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Enter Winning Numbers' })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Number 1' })).toBeEnabled();

  const removed = await page.evaluate(
    () => (window as unknown as { removedHeadings: string[] }).removedHeadings
  );
  expect(removed).toEqual([]);
});
