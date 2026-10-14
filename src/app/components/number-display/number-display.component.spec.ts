import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, describe, it, beforeEach, expect, vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { NumberDisplayComponent } from './number-display.component';
import { toDraw } from '../../lotto/draw';

describe('NumberDisplayComponent', () => {
  let fixture: ComponentFixture<NumberDisplayComponent>;
  let element: HTMLElement;

  const field = () => element.querySelector<HTMLInputElement>('#number-input')!;
  const addButton = () => element.querySelector<HTMLButtonElement>('.add-button')!;
  const rows = () => Array.from(element.querySelectorAll<HTMLElement>('.data-row'));
  const rowNumbers = () =>
    rows().map((row) =>
      Array.from(row.querySelectorAll('app-number-ball')).map((ball) =>
        Number(ball.firstChild?.textContent?.trim())
      )
    );
  const button = (row: HTMLElement, name: string) =>
    Array.from(row.querySelectorAll<HTMLButtonElement>('button')).find(
      (candidate) => candidate.textContent?.trim() === name
    )!;

  async function type(value: string): Promise<void> {
    field().value = value;
    field().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }

  /** Adds numbers the way a player does: two digits add themselves, one digit needs Enter. */
  async function addNumbers(...numbers: number[]): Promise<void> {
    for (const number of numbers) {
      await type(String(number));
      if (number < 10) {
        field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await fixture.whenStable();
      }
    }
  }

  async function click(target: HTMLElement): Promise<void> {
    target.click();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberDisplayComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumberDisplayComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('asks for the winning numbers until there is a draw', async () => {
    expect(element.querySelector('.info-message')?.textContent).toContain(
      'Enter winning numbers first'
    );

    fixture.componentRef.setInput('winningNumbers', toDraw([1, 2, 3, 4, 5, 6]));
    await fixture.whenStable();

    expect(element.querySelector('.info-message')).toBeNull();
  });

  it('adds numbers in rows of six labelled A, B and on', async () => {
    await addNumbers(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

    expect(rowNumbers()).toEqual([
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10],
    ]);
    expect(rows().map((row) => row.querySelector('.row-label')?.textContent)).toEqual(['A', 'B']);
  });

  it('clears the entry field after a two-digit number pasted in one go is added', async () => {
    await type('17');

    expect(rowNumbers()).toEqual([[17]]);
    expect(field().value).toBe('');
  });

  it('clears the entry field after a number is added with Enter', async () => {
    await addNumbers(5);

    expect(rowNumbers()).toEqual([[5]]);
    expect(field().value).toBe('');
  });

  it('does not add a number no game draws', async () => {
    await type('59');

    expect(addButton().disabled).toBe(true);
    field().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();
    expect(rows()).toHaveLength(0);
  });

  it('highlights matching numbers and the rows with the most matches', async () => {
    fixture.componentRef.setInput('winningNumbers', toDraw([1, 2, 3, 4, 5, 6]));
    await addNumbers(1, 2, 3, 10, 11, 12, 21, 22, 23, 24, 25, 26, 1, 2, 3, 4, 5, 30);

    const matching = rows().map((row) =>
      Array.from(row.querySelectorAll('app-number-ball.matching')).map((ball) =>
        Number(ball.firstChild?.textContent?.trim())
      )
    );
    expect(matching).toEqual([[1, 2, 3], [], [1, 2, 3, 4, 5]]);
    expect(rows().map((row) => row.classList.contains('matches-info'))).toEqual([false, false, true]);
    expect(element.textContent).toContain('Your highest matching row has 5 matching numbers!');
  });

  it('shows no match summary when nothing matches', async () => {
    fixture.componentRef.setInput('winningNumbers', toDraw([1, 2, 3, 4, 5, 6]));
    await addNumbers(10, 11, 12, 13, 14, 15);

    expect(element.textContent).not.toContain('Your highest matching row');
  });

  it('marks the row being edited, with focus on its first pencil, and back on Edit after Done', async () => {
    await addNumbers(1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16);
    const editing = () => rows().map((row) => row.querySelector('.number-row.editing') !== null);

    await click(button(rows()[1], 'Edit'));
    expect(editing()).toEqual([false, true]);
    expect(document.activeElement).toBe(rows()[1].querySelector('.edit-number'));

    await click(button(rows()[1], 'Done'));
    expect(editing()).toEqual([false, false]);
    expect(document.activeElement).toBe(button(rows()[1], 'Edit'));
  });

  it('changes a number in the row being edited', async () => {
    await addNumbers(1, 2, 3, 4, 5, 6);
    vi.spyOn(window, 'prompt').mockReturnValue('42');

    await click(button(rows()[0], 'Edit'));
    await click(rows()[0].querySelectorAll<HTMLButtonElement>('.edit-number')[2]);

    expect(window.prompt).toHaveBeenCalledWith('Edit number:', '3');
    expect(rowNumbers()).toEqual([[1, 2, 42, 4, 5, 6]]);
  });

  it('refuses a change to a number already in the row, or one no game draws', async () => {
    await addNumbers(1, 2, 3, 4, 5, 6);
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined);
    const prompt = vi.spyOn(window, 'prompt');
    await click(button(rows()[0], 'Edit'));

    prompt.mockReturnValue('6');
    await click(rows()[0].querySelectorAll<HTMLButtonElement>('.edit-number')[0]);
    expect(alert).toHaveBeenLastCalledWith('This number already exists in the current row');

    prompt.mockReturnValue('59');
    await click(rows()[0].querySelectorAll<HTMLButtonElement>('.edit-number')[0]);
    expect(alert).toHaveBeenLastCalledWith('Please enter a valid number between 1 and 58');

    prompt.mockReturnValue('2.5');
    await click(rows()[0].querySelectorAll<HTMLButtonElement>('.edit-number')[0]);
    expect(alert).toHaveBeenCalledTimes(3);

    expect(rowNumbers()).toEqual([[1, 2, 3, 4, 5, 6]]);
  });

  it('keeps editing the same row when a row above it is deleted', async () => {
    await addNumbers(1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 26);

    await click(button(rows()[2], 'Edit'));
    await click(button(rows()[0], 'Delete'));

    expect(rowNumbers()).toEqual([
      [11, 12, 13, 14, 15, 16],
      [21, 22, 23, 24, 25, 26],
    ]);
    expect(rows().map((row) => row.querySelector('.done-button') !== null)).toEqual([false, true]);
  });

  it('empties the ticket with Clear All', async () => {
    await addNumbers(1, 2, 3, 4, 5, 6, 7);
    await click(button(rows()[0], 'Edit'));

    await click(element.querySelector<HTMLButtonElement>('.clear-button')!);
    await addNumbers(8);

    expect(rowNumbers()).toEqual([[8]]);
    expect(element.querySelector('.done-button')).toBeNull();
  });
});
