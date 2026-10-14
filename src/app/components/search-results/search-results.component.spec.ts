import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';

import { SearchResultsComponent } from './search-results.component';
import { ResultsSource } from '../../results/results-source';
import { Draw } from '../../lotto/draw';
import {
  InMemoryResultsSource,
  MEGALOTTO_RESULT,
  ULTRA_LOTTO_RESULT,
} from '../../../testing/in-memory-results-source';

describe('SearchResultsComponent', () => {
  let fixture: ComponentFixture<SearchResultsComponent>;
  let element: HTMLElement;
  let source: InMemoryResultsSource;
  let setDraws: Draw[];

  const shownGames = () =>
    Array.from(element.querySelectorAll('.result-row .game-name')).map((cell) =>
      cell.textContent?.trim()
    );

  async function answer(act: () => void): Promise<void> {
    act();
    await fixture.whenStable();
  }

  async function chooseGame(name: string): Promise<void> {
    const select = element.querySelector<HTMLSelectElement>('select')!;
    select.value = name;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    source = new InMemoryResultsSource();
    await TestBed.configureTestingModule({
      imports: [SearchResultsComponent],
      providers: [
        { provide: ResultsSource, useValue: source },
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    element = fixture.nativeElement;
    setDraws = [];
    fixture.componentInstance.winningNumbersSet.subscribe((draw) => setDraws.push(draw));
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches recent results when opened and lists them', async () => {
    expect(source.requests).toBe(1);
    expect(element.textContent).toContain('Loading results...');

    await answer(() => source.succeed([ULTRA_LOTTO_RESULT, MEGALOTTO_RESULT]));

    expect(shownGames()).toEqual(['Ultra Lotto 6/58', 'Megalotto 6/45']);
    expect(element.querySelector('.search-btn')?.textContent).toContain('Search Again');
  });

  it("lists only the chosen game's results", async () => {
    await answer(() => source.succeed([ULTRA_LOTTO_RESULT, MEGALOTTO_RESULT]));

    await chooseGame('Megalotto 6/45');
    expect(shownGames()).toEqual(['Megalotto 6/45']);

    await chooseGame('Lotto 6/42');
    expect(shownGames()).toEqual([]);
    expect(element.textContent).toContain('No recent results for Lotto 6/42.');

    await chooseGame('');
    expect(shownGames()).toEqual(['Ultra Lotto 6/58', 'Megalotto 6/45']);
  });

  it('shows the fetch error with a retry button that fetches again', async () => {
    await answer(() => source.fail());

    expect(element.querySelector('.error')?.textContent).toContain(
      'Unable to fetch lottery results'
    );
    expect(element.querySelector('.results-table')).toBeNull();

    element.querySelector<HTMLButtonElement>('.retry-btn')!.click();
    await answer(() => source.succeed([ULTRA_LOTTO_RESULT]));

    expect(source.requests).toBe(2);
    expect(shownGames()).toEqual(['Ultra Lotto 6/58']);
  });

  it('fetches again on Search Again', async () => {
    await answer(() => source.succeed([ULTRA_LOTTO_RESULT]));

    element.querySelector<HTMLButtonElement>('.search-btn')!.click();

    expect(source.requests).toBe(2);
  });

  it("sets a result's draw as the winning numbers", async () => {
    await answer(() => source.succeed([ULTRA_LOTTO_RESULT]));

    element.querySelector<HTMLButtonElement>('.set-button')!.click();

    expect(setDraws).toEqual([[5, 12, 23, 34, 45, 56]]);
  });

  it("says when a result's numbers cannot be used", async () => {
    await answer(() =>
      source.succeed([{ ...ULTRA_LOTTO_RESULT, combinations: '05-12-23-34-45', draw: null }])
    );

    expect(element.querySelector('.set-button')).toBeNull();
    expect(element.querySelector('.action')?.textContent?.trim()).toBe('Numbers unreadable');
  });

  it('names the result each Use Numbers button is for', async () => {
    await answer(() => source.succeed([ULTRA_LOTTO_RESULT]));

    expect(element.querySelector('.set-button')?.getAttribute('aria-label')).toBe(
      'Use Numbers, Ultra Lotto 6/58, Oct 12, 2026'
    );
  });

  it('sums up what it shows in one status line for screen readers', async () => {
    const status = () => element.querySelector('[role="status"]')?.textContent;
    expect(status()).toBe('Loading results…');

    await answer(() => source.succeed([ULTRA_LOTTO_RESULT, MEGALOTTO_RESULT]));
    expect(status()).toBe('2 results');

    await chooseGame('Megalotto 6/45');
    expect(status()).toBe('1 result');

    await chooseGame('Lotto 6/42');
    expect(status()).toBe('No recent results for Lotto 6/42.');
    expect(element.querySelector('[aria-live]')).toBeNull();
  });

  it('keeps showing the earlier results under the error when a new fetch fails', async () => {
    await answer(() => source.succeed([ULTRA_LOTTO_RESULT]));

    element.querySelector<HTMLButtonElement>('.search-btn')!.click();
    await answer(() => source.fail());

    expect(element.querySelector('.error')?.getAttribute('role')).toBe('alert');
    expect(shownGames()).toEqual(['Ultra Lotto 6/58']);
  });
});
