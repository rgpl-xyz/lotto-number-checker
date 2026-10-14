import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { WinningInputComponent } from './winning-input.component';
import { Draw, toDraw } from '../../lotto/draw';

describe('WinningInputComponent', () => {
  let fixture: ComponentFixture<WinningInputComponent>;
  let element: HTMLElement;
  let setDraws: Draw[];

  const field = (index: number) =>
    element.querySelector<HTMLInputElement>(`#number-input-${index}`)!;
  const setButton = () => element.querySelector<HTMLButtonElement>('.submit-button')!;
  const fieldValues = () => [0, 1, 2, 3, 4, 5].map((index) => field(index).value);

  async function type(index: number, value: string): Promise<void> {
    field(index).value = value;
    field(index).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  async function typeAll(values: readonly (number | string)[]): Promise<void> {
    for (const [index, value] of values.entries()) {
      await type(index, String(value));
    }
  }

  async function paste(index: number, text: string): Promise<Event> {
    const event = new Event('paste', { cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    field(index).dispatchEvent(event);
    await fixture.whenStable();
    return event;
  }

  async function pressEnter(index: number): Promise<void> {
    field(index).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinningInputComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(WinningInputComponent);
    element = fixture.nativeElement;
    setDraws = [];
    fixture.componentInstance.winningNumbersSet.subscribe((draw) => setDraws.push(draw));
    await fixture.whenStable();
  });

  const problem = () => element.querySelector('#winning-problem')?.textContent?.trim();
  const invalid = () => [0, 1, 2, 3, 4, 5].filter((index) => field(index).getAttribute('aria-invalid') === 'true');

  it('says which number is out of range, and marks its field', async () => {
    await type(2, '59');

    expect(problem()).toBe('59 is too high: numbers go from 1 to 58.');
    expect(invalid()).toEqual([2]);
    expect(field(2).getAttribute('aria-describedby')).toBe('winning-problem');
  });

  it('waits until a single digit is left before calling it too low', async () => {
    await type(0, '0');
    expect(problem()).toBe('');

    field(0).dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(problem()).toBe('0 is too low: numbers go from 1 to 58.');
  });

  it('notices a field left after another one was', async () => {
    await type(0, '4');
    field(0).dispatchEvent(new Event('blur'));
    await type(1, '4');
    field(1).dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(problem()).toBe('4 is entered twice.');
  });

  it('says which number is entered twice, and marks both fields', async () => {
    await type(0, '16');
    await type(3, '16');

    expect(problem()).toBe('16 is entered twice.');
    expect(invalid()).toEqual([0, 3]);
  });

  it('starts with six empty fields and the button disabled', () => {
    expect(fieldValues()).toEqual(['', '', '', '', '', '']);
    expect(setButton().disabled).toBe(true);
  });

  it('sets six different numbers as the winning numbers', async () => {
    await typeAll([4, 8, 15, 16, 23, 42]);

    expect(setButton().disabled).toBe(false);
    setButton().click();

    expect(setDraws).toEqual([[4, 8, 15, 16, 23, 42]]);
  });

  it('keeps the button disabled until all six are filled', async () => {
    await typeAll([4, 8, 15, 16, 23]);

    expect(setButton().disabled).toBe(true);
  });

  it('does not accept a number no game draws', async () => {
    await typeAll([4, 8, 15, 16, 23, 59]);
    expect(setButton().disabled).toBe(true);

    await type(5, '0');
    expect(setButton().disabled).toBe(true);

    await type(5, '1.5');
    expect(setButton().disabled).toBe(true);
  });

  it('does not accept the same number twice', async () => {
    await typeAll([4, 8, 15, 16, 23, 4]);

    expect(setButton().disabled).toBe(true);
  });

  it('moves to the next field on Enter, and sets the numbers from the last one', async () => {
    field(2).focus();
    await pressEnter(2);
    expect(document.activeElement).toBe(field(3));

    await typeAll([4, 8, 15, 16, 23, 42]);
    await pressEnter(5);

    expect(setDraws).toEqual([[4, 8, 15, 16, 23, 42]]);
  });

  it('does not set numbers from the last field on Enter while they are not a draw', async () => {
    await typeAll([4, 8, 15, 16, 23, 23]);
    await pressEnter(5);

    expect(setDraws).toEqual([]);
  });

  it('fills the fields in order from pasted numbers and sets them, whichever field gets the paste', async () => {
    const event = await paste(3, '09-15-39-01-42-27');

    expect(event.defaultPrevented).toBe(true);
    expect(fieldValues()).toEqual(['9', '15', '39', '1', '42', '27']);
    expect(setDraws).toEqual([[9, 15, 39, 1, 42, 27]]);
  });

  it('skips pasted numbers no game draws and waits for the rest', async () => {
    await paste(0, '10,20,30,40,50,60');

    expect(fieldValues()).toEqual(['10', '20', '30', '40', '50', '']);
    expect(setDraws).toEqual([]);
  });

  it('ignores pasted text without numbers', async () => {
    await paste(0, 'abc');

    expect(fieldValues()).toEqual(['', '', '', '', '', '']);
    expect(setDraws).toEqual([]);
  });

  it('starts from a draw it is given to edit', async () => {
    fixture.componentRef.setInput('numbersToEdit', toDraw([5, 10, 15, 20, 25, 30]));
    await fixture.whenStable();

    expect(fieldValues()).toEqual(['5', '10', '15', '20', '25', '30']);
    expect(setButton().disabled).toBe(false);
  });
});
