import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import {
  InMemoryResultsSource,
  MEGALOTTO_RESULT,
  ULTRA_LOTTO_RESULT,
} from '../../testing/in-memory-results-source';
import { RESULTS_UNAVAILABLE, RecentResults } from './recent-results';
import { ResultsSource } from './results-source';

const NOW = new Date('2026-10-14T09:00:00Z');

describe('RecentResults', () => {
  let source: InMemoryResultsSource;
  let recent: RecentResults;

  beforeEach(() => {
    vi.useFakeTimers({ now: NOW });
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    source = new InMemoryResultsSource();
    TestBed.configureTestingModule({
      providers: [
        { provide: ResultsSource, useValue: source },
        provideZonelessChangeDetection(),
      ],
    });
    recent = TestBed.inject(RecentResults);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('fetches results on first load and shows when they were fetched', () => {
    recent.load();
    expect(recent.loading()).toBe(true);

    source.succeed([ULTRA_LOTTO_RESULT]);

    expect(recent.results()).toEqual([ULTRA_LOTTO_RESULT]);
    expect(recent.loading()).toBe(false);
    expect(recent.fetchedAt()).toEqual(NOW);
    expect(source.requests).toBe(1);
  });

  it('reuses results for five minutes, then fetches again', () => {
    recent.load();
    source.succeed([ULTRA_LOTTO_RESULT]);

    vi.advanceTimersByTime(5 * 60 * 1000 - 1);
    recent.load();
    expect(source.requests).toBe(1);

    vi.advanceTimersByTime(1);
    recent.load();
    expect(source.requests).toBe(2);
  });

  it('does not start a second fetch while one is on the way', () => {
    recent.load();
    recent.load();

    expect(source.requests).toBe(1);
  });

  it('fetches again on refresh, however recent the results are', () => {
    recent.load();
    source.succeed([ULTRA_LOTTO_RESULT]);

    recent.refresh();
    source.succeed([MEGALOTTO_RESULT]);

    expect(source.requests).toBe(2);
    expect(recent.results()).toEqual([MEGALOTTO_RESULT]);
  });

  it('keeps the results already fetched when a fetch fails, and says so', () => {
    recent.load();
    source.succeed([ULTRA_LOTTO_RESULT]);

    recent.refresh();
    expect(recent.results()).toEqual([ULTRA_LOTTO_RESULT]);
    source.fail();

    expect(recent.error()).toBe(RESULTS_UNAVAILABLE);
    expect(recent.results()).toEqual([ULTRA_LOTTO_RESULT]);
    expect(recent.loading()).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });

  it('clears the error when the next fetch starts', () => {
    recent.load();
    source.fail();

    recent.refresh();

    expect(recent.error()).toBe('');
    source.succeed([ULTRA_LOTTO_RESULT]);
    expect(recent.results()).toEqual([ULTRA_LOTTO_RESULT]);
  });

  it('drops a fetch that a refresh replaces, and ignores its late answer', () => {
    recent.load();
    recent.refresh();

    expect(recent.loading()).toBe(true);
    expect(source.request(0).cancelled).toBe(true);
    source.request(1).succeed([ULTRA_LOTTO_RESULT]);
    source.request(0).succeed([MEGALOTTO_RESULT]);

    expect(recent.results()).toEqual([ULTRA_LOTTO_RESULT]);
    expect(recent.loading()).toBe(false);
  });

  it('stops loading when a fetch ends without results', () => {
    recent.load();
    source.request(0).completeEmpty();

    expect(recent.loading()).toBe(false);
    expect(recent.error()).toBe('');
    expect(recent.results()).toEqual([]);
  });

  it('reports a source that throws at once, and fetches normally afterwards', () => {
    vi.spyOn(source, 'latest').mockImplementationOnce(() => {
      throw new Error('broken source');
    });

    recent.load();
    expect(recent.error()).toBe(RESULTS_UNAVAILABLE);
    expect(recent.loading()).toBe(false);

    recent.refresh();
    source.succeed([ULTRA_LOTTO_RESULT]);
    expect(recent.results()).toEqual([ULTRA_LOTTO_RESULT]);
  });
});
