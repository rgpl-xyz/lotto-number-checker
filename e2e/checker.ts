import { expect, type Locator, type Page } from '@playwright/test';

/** The winning number field for position `index`, from 0. */
export function winningField(page: Page, index: number): Locator {
  return page.getByLabel(`Number ${index + 1}`, { exact: true });
}

/**
 * Opens the checker, once the browser has taken over the page the build rendered: its
 * fields are disabled until then, as anyone typing sooner would find.
 */
export async function openChecker(page: Page): Promise<void> {
  await page.goto('/');
  await expect(winningField(page, 0)).toBeEnabled();
}

/** Types the six winning numbers and sets them. */
export async function setWinningNumbers(page: Page, numbers: readonly number[]): Promise<void> {
  for (const [index, number] of numbers.entries()) {
    await winningField(page, index).fill(String(number));
  }
  await page.getByRole('button', { name: 'Set Winning Numbers' }).click();
}

/** Pastes `text` into a field, as Ctrl+V would. */
export async function paste(field: Locator, text: string): Promise<void> {
  await field.evaluate((element, pasted) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData('text/plain', pasted);
    element.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }),
    );
  }, text);
}

/** Adds numbers to the ticket one at a time, as a player types them. */
export async function addNumbers(page: Page, numbers: readonly number[]): Promise<void> {
  const field = page.getByLabel('Enter your numbers');
  for (const number of numbers) {
    await field.fill(String(number));
    // A two-digit number is added as soon as it is typed; one digit waits for Enter.
    if (number < 10) {
      await field.press('Enter');
    }
  }
}

/** The ticket row named `label`, such as "A". */
export function ticketRow(page: Page, label: string): Locator {
  return page
    .locator('.data-row')
    .filter({ has: page.locator('.row-label', { hasText: new RegExp(`^${label}$`) }) });
}

/** The numbers on the balls inside `area`, in order. */
export async function ballNumbers(area: Locator): Promise<number[]> {
  const texts = await area.locator('app-number-ball').allTextContents();
  // A ball's text starts with its number; "(match)" or a pencil may follow.
  return texts.map((text) => Number.parseInt(text, 10));
}
