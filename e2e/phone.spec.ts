import { expect, test } from './fixtures';
import { addNumbers, openChecker, setWinningNumbers, ticketRow } from './checker';

// The narrowest common phone width.
test.use({ viewport: { width: 360, height: 800 } });

test('at 360px the balls stay round, every pencil can be tapped and nothing scrolls sideways', async ({
  page,
}) => {
  await openChecker(page);
  await setWinningNumbers(page, [4, 8, 15, 16, 23, 42]);
  await addNumbers(page, [4, 8, 15, 1, 2, 3]);
  await ticketRow(page, 'A').getByRole('button', { name: 'Edit' }).click();
  const pencils = page.getByRole('button', { name: /^Change / });
  await expect(pencils).toHaveCount(6);

  for (const ball of await page.locator('app-number-ball').all()) {
    const { width, height } = (await ball.boundingBox())!;
    expect(Math.abs(width - height), `${await ball.textContent()} is ${width}x${height}`).toBeLessThan(1);
  }

  await ticketRow(page, 'A').scrollIntoViewIfNeeded();
  for (const pencil of await pencils.all()) {
    // All of it on screen, with nothing cut off by the row around it.
    await expect(pencil).toBeInViewport({ ratio: 1 });
    // A trial click checks nothing covers it.
    await pencil.click({ trial: true, timeout: 2_000 });
  }

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
