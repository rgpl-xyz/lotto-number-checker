import { Observable } from 'rxjs';
import { LottoResult } from './lotto-result';

/**
 * Where recent lotto results come from: PcsoResultsSource in the app (see
 * app.config.ts), an in-memory source in tests. `latest()` emits the results once
 * and completes, or errors when they can't be fetched or read. Unsubscribing
 * cancels.
 */
export abstract class ResultsSource {
  abstract latest(): Observable<readonly LottoResult[]>;
}
