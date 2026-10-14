import { expect, test } from './fixtures';
import { addNumbers, ballNumbers, setWinningNumbers, ticketRow } from './checker';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await setWinningNumbers(page, [4, 8, 15, 16, 23, 42]);
});

test('a pencil changes one number, and focus follows Edit and Done', async ({ page }) => {
  await addNumbers(page, [4, 8, 15, 1, 2, 3]);
  const row = ticketRow(page, 'A');

  await row.getByRole('button', { name: 'Edit' }).click();
  await expect(row.getByRole('button', { name: 'Change 4 in row A' })).toBeFocused();

  page.once('dialog', (dialog) => dialog.accept('16'));
  await row.getByRole('button', { name: 'Change 1 in row A', exact: true }).click();
  await expect.poll(() => ballNumbers(row)).toEqual([4, 8, 15, 16, 2, 3]);
  await expect(page.getByText('Your highest matching row has 4 matching numbers!')).toBeVisible();

  await row.getByRole('button', { name: 'Done' }).click();
  await expect(row.getByRole('button', { name: 'Edit' })).toBeFocused();
  await expect(row.getByRole('button', { name: /^Change / })).toHaveCount(0);
});

test('a change to a number the row has, or one above 58, is refused', async ({ page }) => {
  await addNumbers(page, [4, 8, 15, 1, 2, 3]);
  const row = ticketRow(page, 'A');
  const answers = ['8', '59'];
  const alerts: string[] = [];
  page.on('dialog', async (dialog) => {
    if (dialog.type() === 'prompt') {
      await dialog.accept(answers.shift());
    } else {
      alerts.push(dialog.message());
      await dialog.accept();
    }
  });
  await row.getByRole('button', { name: 'Edit' }).click();

  await row.getByRole('button', { name: 'Change 4 in row A' }).click();
  await row.getByRole('button', { name: 'Change 4 in row A' }).click();

  await expect
    .poll(() => alerts)
    .toEqual([
      'This number already exists in the current row',
      'Please enter a valid number between 1 and 58',
    ]);
  await expect.poll(() => ballNumbers(row)).toEqual([4, 8, 15, 1, 2, 3]);
});

test('the row being edited is outlined without changing size', async ({ page }) => {
  await addNumbers(page, [4, 8, 15, 1, 2, 3]);
  const numbers = ticketRow(page, 'A').locator('.number-row');
  await expect(numbers.locator('app-number-ball')).toHaveCount(6);
  const before = await numbers.boundingBox();

  await ticketRow(page, 'A').getByRole('button', { name: 'Edit' }).click();

  await expect(numbers).toHaveCSS('border-top-style', 'dashed');
  expect(await numbers.boundingBox()).toEqual(before);
});

test('deleting a row above the one being edited keeps editing that row', async ({ page }) => {
  await addNumbers(page, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
  await ticketRow(page, 'C').getByRole('button', { name: 'Edit' }).click();

  await ticketRow(page, 'A').getByRole('button', { name: 'Delete' }).click();

  // The row being edited moved up to B.
  const edited = ticketRow(page, 'B');
  await expect.poll(() => ballNumbers(edited)).toEqual([13, 14, 15, 16, 17, 18]);
  await expect(edited.getByRole('button', { name: 'Done' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Done' })).toHaveCount(1);
});
