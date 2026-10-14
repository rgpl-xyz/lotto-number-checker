import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription, defer, finalize } from 'rxjs';
import { LottoResult } from './lotto-result';
import { ResultsSource } from './results-source';

/** Results fetched less than this long ago are shown again without fetching. */
const FRESH_FOR_MS = 5 * 60 * 1000;

export const RESULTS_UNAVAILABLE =
  'Unable to fetch lottery results at this time. Please try again later.';

interface Fetched {
  readonly results: readonly LottoResult[];
  readonly at: number;
}

/**
 * Recent results for the search panel: fetched on first use, reused for five
 * minutes, and fetched again on request. A failed fetch keeps the results already
 * fetched and sets `error`; nothing throws.
 */
@Injectable({ providedIn: 'root' })
export class RecentResults {
  private readonly source = inject(ResultsSource);
  private readonly fetched = signal<Fetched | null>(null);
  private readonly fetching = signal(false);
  private readonly failure = signal('');
  private inFlight?: Subscription;

  readonly results = computed(() => this.fetched()?.results ?? []);
  readonly fetchedAt = computed(() => {
    const fetched = this.fetched();
    return fetched ? new Date(fetched.at) : null;
  });
  readonly loading = this.fetching.asReadonly();
  readonly error = this.failure.asReadonly();

  /** Shows results, fetching them unless they are under five minutes old or on the way. */
  load(): void {
    const fetched = this.fetched();
    const fresh = fetched !== null && Date.now() - fetched.at < FRESH_FOR_MS;
    if (!fresh && !this.fetching()) {
      this.fetch();
    }
  }

  /** Fetches the results again, however recent they are. */
  refresh(): void {
    this.fetch();
  }

  private fetch(): void {
    // A newer fetch replaces one still on the way; the older answer is ignored.
    this.inFlight?.unsubscribe();
    this.fetching.set(true);
    this.failure.set('');
    // defer: a source that throws instead of returning an observable fails like any other.
    this.inFlight = defer(() => this.source.latest())
      .pipe(finalize(() => this.fetching.set(false)))
      .subscribe({
        next: (results) => this.fetched.set({ results, at: Date.now() }),
        error: (error: unknown) => {
          console.error('Error fetching lotto results:', error);
          this.failure.set(RESULTS_UNAVAILABLE);
        },
      });
  }
}
