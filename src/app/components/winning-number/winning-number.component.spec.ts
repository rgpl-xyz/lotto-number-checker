import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect } from 'vitest';
import { WinningNumberComponent } from './winning-number.component';
import { FEATURE_FLAGS, FeatureFlags } from '../../feature-flags';
import { ResultsSource } from '../../results/results-source';
import {
  InMemoryResultsSource,
  ULTRA_LOTTO_RESULT,
} from '../../../testing/in-memory-results-source';

async function render(flags: FeatureFlags = { liveResults: false }) {
  const source = new InMemoryResultsSource();

  await TestBed.configureTestingModule({
    imports: [WinningNumberComponent],
    providers: [
      { provide: ResultsSource, useValue: source },
      { provide: FEATURE_FLAGS, useValue: flags },
      provideZonelessChangeDetection()
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(WinningNumberComponent);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  return { fixture, element, source };
}

const winningField = (element: HTMLElement, index: number) =>
  element.querySelector<HTMLInputElement>(`#number-input-${index}`)!;

const shownWinningNumbers = (element: HTMLElement) =>
  Array.from(element.querySelectorAll('.winning-numbers-display app-number-ball')).map(
    (ball) => ball.textContent?.trim()
  );

describe('WinningNumberComponent', () => {
  it('enables its fields once it is drawn in the browser', async () => {
    const { element } = await render();

    expect(element.querySelector<HTMLFieldSetElement>('fieldset.ready-gate')?.disabled).toBe(false);
    expect(winningField(element, 1).matches(':disabled')).toBe(false);
  });

  it('asks for the winning numbers first', async () => {
    const { element } = await render();

    expect(element.querySelector('h1')?.textContent).toBe('Lotto Number Checker');
    expect(element.querySelector('app-winning-input')).not.toBeNull();
    expect(element.querySelector('.info-message')?.textContent).toContain(
      'Enter winning numbers first'
    );
  });

  it('shows the winning numbers once they are set, and the form with them on Edit', async () => {
    const { fixture, element } = await render();

    for (const [index, value] of [4, 8, 15, 16, 23, 42].entries()) {
      winningField(element, index).value = String(value);
      winningField(element, index).dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.submit-button')!.click();
    await fixture.whenStable();

    expect(shownWinningNumbers(element)).toEqual(['4', '8', '15', '16', '23', '42']);
    expect(element.querySelector('app-winning-input')).toBeNull();
    expect(element.querySelector('.info-message')).toBeNull();

    element.querySelector<HTMLButtonElement>('.winning-numbers-display .edit-button')!.click();
    await fixture.whenStable();

    expect([0, 1, 2, 3, 4, 5].map((index) => winningField(element, index).value)).toEqual([
      '4', '8', '15', '16', '23', '42',
    ]);
  });
});

describe('WinningNumberComponent live results flag', () => {
  it('hides the search toggle and never fetches when live results are off', async () => {
    const { fixture, element, source } = await render({ liveResults: false });

    fixture.componentInstance.useSearch.set(true);
    await fixture.whenStable();

    expect(element.querySelector('#use-search')).toBeNull();
    expect(element.querySelector('app-search-results')).toBeNull();
    expect(element.querySelector('app-winning-input')).not.toBeNull();
    expect(source.requests).toBe(0);
  });

  it('shows the search toggle, unchecked, when live results are on', async () => {
    const { element, source } = await render({ liveResults: true });

    const toggle = element.querySelector<HTMLInputElement>('#use-search');
    expect(toggle).not.toBeNull();
    expect(toggle?.checked).toBe(false);
    expect(element.querySelector('app-search-results')).toBeNull();
    expect(source.requests).toBe(0);
  });

  it('loads search results once the toggle is checked', async () => {
    const { fixture, element, source } = await render({ liveResults: true });

    element.querySelector<HTMLInputElement>('#use-search')?.click();
    await fixture.whenStable();

    expect(element.querySelector('app-search-results')).not.toBeNull();
    expect(element.querySelector('app-winning-input')).not.toBeNull();
    expect(source.requests).toBe(1);
  });

  it('uses a search result as the winning numbers', async () => {
    const { fixture, element, source } = await render({ liveResults: true });

    element.querySelector<HTMLInputElement>('#use-search')?.click();
    await fixture.whenStable();
    source.succeed([ULTRA_LOTTO_RESULT]);
    await fixture.whenStable();
    element.querySelector<HTMLButtonElement>('.set-button')!.click();
    await fixture.whenStable();

    expect(shownWinningNumbers(element)).toEqual(['5', '12', '23', '34', '45', '56']);
    expect(element.querySelector('app-search-results')).toBeNull();
  });
});
