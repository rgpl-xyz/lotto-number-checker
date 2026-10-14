import { type Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { ballNumbers, paste, setWinningNumbers, winningField } from './checker';

/** The winning numbers on show once they are set. */
function shownNumbers(page: Page): Promise<number[]> {
  return ballNumbers(page.locator('.winning-numbers-display'));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('six typed numbers become the winning numbers', async ({ page }) => {
  await expect(page).toHaveTitle('Lotto Number Checker | RGPL');
  await expect(page.getByText('Enter winning numbers first')).toBeVisible();

  await setWinningNumbers(page, [4, 8, 15, 16, 23, 42]);

  await expect(page.getByRole('heading', { name: 'Winning Numbers', exact: true })).toBeVisible();
  await expect.poll(() => shownNumbers(page)).toEqual([4, 8, 15, 16, 23, 42]);
  await expect(page.getByText('Enter winning numbers first')).toBeHidden();
});

test('the numbers are only set once they are six different numbers from 1 to 58', async ({ page }) => {
  const set = page.getByRole('button', { name: 'Set Winning Numbers' });
  await expect(page.getByText('Enter or paste 6 numbers between 1 and 58:')).toBeVisible();

  for (const [index, number] of [4, 8, 15, 16, 23].entries()) {
    await winningField(page, index).fill(String(number));
  }
  await expect(set).toBeDisabled();

  const last = winningField(page, 5);
  for (const refused of ['59', '0', '1.5', '4']) {
    await last.fill(refused);
    await expect(set, `${refused} as the sixth number`).toBeDisabled();
  }
  await last.fill('58');
  await expect(set).toBeEnabled();
});

test('a row pasted from the PCSO results table sets its six numbers', async ({ page }) => {
  // A row copied from pcso.gov.ph: game, combination, draw date, jackpot, winners.
  // The "6/58" in the game's name is not a number of the draw.
  await paste(winningField(page, 0), 'Ultra Lotto 6/58\t05-12-23-34-45-56\t10/13/2026\t49,500,000.00\t0');

  await expect.poll(() => shownNumbers(page)).toEqual([5, 12, 23, 34, 45, 56]);
});

test('Edit brings the winning numbers back to change them', async ({ page }) => {
  await setWinningNumbers(page, [4, 8, 15, 16, 23, 42]);

  await page.locator('.winning-numbers-display').getByRole('button', { name: 'Edit' }).click();
  await expect(winningField(page, 5)).toHaveValue('42');
  await winningField(page, 5).fill('43');
  await page.getByRole('button', { name: 'Set Winning Numbers' }).click();

  await expect.poll(() => shownNumbers(page)).toEqual([4, 8, 15, 16, 23, 43]);
});
