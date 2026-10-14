import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY, of, map, catchError, finalize, tap } from 'rxjs';
import { signal, computed } from '@angular/core';
import { LottoResult } from '../models/lotto.model';
import { gameNamed } from '../lotto/games';

@Injectable({
  providedIn: 'root',
})
export class LottoService {
  private readonly baseUrl = '/api/SearchLottoResult.aspx';

  private readonly _cachedResults = signal<LottoResult[]>([]);
  private readonly _cacheTimestamp = signal<number>(0);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');

  readonly cachedResults = this._cachedResults.asReadonly();
  readonly cacheTimestamp = this._cacheTimestamp.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasCachedData = computed(() => this._cachedResults().length > 0);

  private http = inject(HttpClient);

  /**
   * Gets lotto results with caching. Returns cached data if available and fresh,
   * otherwise fetches from API.
   */
  getLottoResults(forceRefresh: boolean = false): Observable<LottoResult[]> {
    // Check if we have cached data and it's less than 5 minutes old
    const now = Date.now();
    const cacheAge = now - this._cacheTimestamp();
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes

    if (!forceRefresh && this._cachedResults().length > 0 && cacheValid) {
      return of(this._cachedResults());
    }

    return this.fetchLottoResults();
  }

  refreshResults(): Observable<LottoResult[]> {
    this.clearCache();
    return this.fetchLottoResults();
  }

  clearCache(): void {
    this._cachedResults.set([]);
    this._cacheTimestamp.set(0);
    this._error.set('');
  }

  private fetchLottoResults(): Observable<LottoResult[]> {
    this._isLoading.set(true);
    this._error.set('');

    return this.http
      .get(this.baseUrl, { responseType: 'text' })
      .pipe(
        map((html) => {
          if (html.includes('Runtime Error') || html.includes('Server Error')) {
            console.error('Server returned error page:', html);
            throw new Error(
              'Unable to fetch lottery results at this time. Please try again later.'
            );
          }

          return this.parseResults(html);
        }),
        tap((results) => {
          // Cache the results
          this._cachedResults.set(results);
          this._cacheTimestamp.set(Date.now());
        }),
        catchError((error) => {
          // The failure reaches the UI through the error signal, so callers
          // don't need an error handler of their own.
          console.error('Error fetching lotto results:', error);
          this._error.set(
            'Unable to fetch lottery results at this time. Please try again later.'
          );
          return EMPTY;
        }),
        // Also runs when the caller unsubscribes mid-request (e.g. the search panel closes).
        finalize(() => this._isLoading.set(false))
      );
  }

  private parseResults(html: string): LottoResult[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const rows = doc.querySelectorAll(
      '#cphContainer_cpContent_GridView1 tr:not(:first-child)'
    );
    return Array.from(rows)
      .filter((row) => gameNamed(row.firstElementChild?.textContent?.trim() || ''))
      .map((row) => {
        const cells = row.querySelectorAll('td');
        const game = cells[0].textContent?.trim() || '';
        const combinations = cells[1].textContent || '';
        const drawDate = new Date(cells[2].textContent?.trim() || '');
        const jackpot = cells[3].textContent || '0';
        const winners = cells[4].textContent?.trim() || '0';

        return {
          game,
          combinations,
          drawDate,
          jackpot,
          winners,
        };
      });
  }
}
