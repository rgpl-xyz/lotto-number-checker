import { expect, test } from './fixtures';
import { addNumbers, ballNumbers, setWinningNumbers, ticketRow } from './checker';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await setWinningNumbers(page, [4, 8, 15, 16, 23, 42]);
});

test('numbers fill rows of six and the row with the most matches stands out', async ({ page }) => {
  await addNumbers(page, [4, 8, 15, 1, 2, 3, 4, 8, 15, 16, 2, 3, 5]);

  await expect.poll(() => ballNumbers(ticketRow(page, 'A'))).toEqual([4, 8, 15, 1, 2, 3]);
  await expect.poll(() => ballNumbers(ticketRow(page, 'B'))).toEqual([4, 8, 15, 16, 2, 3]);
  await expect.poll(() => ballNumbers(ticketRow(page, 'C'))).toEqual([5]);
  await expect(ticketRow(page, 'A').getByText('(match)')).toHaveCount(3);
  await expect(ticketRow(page, 'B').getByText('(match)')).toHaveCount(4);
  await expect(ticketRow(page, 'C').getByText('(match)')).toHaveCount(0);

  await expect(page.getByText('Best row: B, with 4 matches.')).toBeVisible();
  await expect(ticketRow(page, 'B')).toHaveClass(/matches-info/);
  await expect(ticketRow(page, 'A')).not.toHaveClass(/matches-info/);
});

test('the entry takes whole numbers from 1 to 58 only', async ({ page }) => {
  const field = page.getByLabel('Enter your numbers');
  const add = page.getByRole('button', { name: 'Add Number' });
  await expect(field).toHaveAttribute('placeholder', 'Enter a number (1-58)');

  for (const refused of ['59', '0', '1.5']) {
    await field.fill(refused);
    await expect(add, refused).toBeDisabled();
  }

  await field.fill('58');
  await expect(field).toHaveValue('');
  await expect.poll(() => ballNumbers(ticketRow(page, 'A'))).toEqual([58]);
});

test('a row not yet full shows its empty places', async ({ page }) => {
  await addNumbers(page, [4, 8]);

  await expect(ticketRow(page, 'A').locator('.empty-slot')).toHaveCount(4);
});

test('a number already in the row being filled is not added again', async ({ page }) => {
  await addNumbers(page, [7, 7, 21]);

  await expect.poll(() => ballNumbers(ticketRow(page, 'A'))).toEqual([7, 21]);
});

test('Clear All empties the ticket', async ({ page }) => {
  await addNumbers(page, [4, 8, 15, 1, 2, 3, 9]);

  await page.getByRole('button', { name: 'Clear All' }).click();

  await expect(page.getByText(/^Best row/)).toBeHidden();
  await expect(page.locator('.data-row')).toHaveCount(0);
});

test('a number out of range is named under the entry', async ({ page }) => {
  const field = page.getByLabel('Enter your numbers');
  await field.fill('59');

  await expect(page.getByText('59 is too high: numbers go from 1 to 58.')).toBeVisible();
  await expect(field).toHaveAttribute('aria-invalid', 'true');
});

test('a number already in the row is named and stays in the entry', async ({ page }) => {
  await addNumbers(page, [7]);
  const field = page.getByLabel('Enter your numbers');
  await field.fill('7');
  await field.press('Enter');

  await expect(page.getByText('7 is already in row A.')).toBeVisible();
  await expect(field).toHaveValue('7');
  await expect.poll(() => ballNumbers(ticketRow(page, 'A'))).toEqual([7]);
});

test('only digits can be typed into the entry', async ({ page }) => {
  const field = page.getByLabel('Enter your numbers');
  await field.pressSequentially('e4');

  await expect(field).toHaveValue('4');
});
