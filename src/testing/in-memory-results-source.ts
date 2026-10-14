import { Observable, Subscriber } from 'rxjs';
import { toDraw } from '../app/lotto/draw';
import { LottoResult } from '../app/results/lotto-result';
import { ResultsSource } from '../app/results/results-source';

/** One request to the in-memory source, answered when the test says so. */
export class PendingResults {
  private subscriber?: Subscriber<readonly LottoResult[]>;
  private answered = false;
  /** Whether the app stopped waiting before the request was answered. */
  cancelled = false;

  readonly results = new Observable<readonly LottoResult[]>((subscriber) => {
    this.subscriber = subscriber;
    return () => {
      if (!this.answered) {
        this.cancelled = true;
      }
    };
  });

  succeed(results: readonly LottoResult[]): void {
    this.answered = true;
    this.subscriber?.next(results);
    this.subscriber?.complete();
  }

  /** Ends the request without any results, which a source shouldn't do. */
  completeEmpty(): void {
    this.answered = true;
    this.subscriber?.complete();
  }

  /** Fails the request, as when PCSO can't be reached. */
  fail(): void {
    this.answered = true;
    this.subscriber?.error(new Error('PCSO could not be reached'));
  }
}

/** A ResultsSource for tests: each request waits until the test answers it. */
export class InMemoryResultsSource implements ResultsSource {
  private readonly calls: PendingResults[] = [];

  /** How many times results were asked for. */
  get requests(): number {
    return this.calls.length;
  }

  latest(): Observable<readonly LottoResult[]> {
    const call = new PendingResults();
    this.calls.push(call);
    return call.results;
  }

  /** A request by number, from 0 for the first. */
  request(index: number): PendingResults {
    const call = this.calls[index];
    if (!call) {
      throw new Error(`Results were requested ${this.calls.length} times, not ${index + 1}`);
    }
    return call;
  }

  /** Answers the latest request with these results. */
  succeed(results: readonly LottoResult[]): void {
    this.request(this.calls.length - 1).succeed(results);
  }

  /** Fails the latest request. */
  fail(): void {
    this.request(this.calls.length - 1).fail();
  }
}

export const ULTRA_LOTTO_RESULT: LottoResult = {
  game: 'Ultra Lotto 6/58',
  combinations: '05-12-23-34-45-56',
  draw: toDraw([5, 12, 23, 34, 45, 56]),
  drawDate: new Date('10/12/2026'),
  jackpot: '49,500,000.00',
  winners: '0',
};

export const MEGALOTTO_RESULT: LottoResult = {
  game: 'Megalotto 6/45',
  combinations: '03-09-17-28-33-41',
  draw: toDraw([3, 9, 17, 28, 33, 41]),
  drawDate: new Date('10/12/2026'),
  jackpot: '8,910,000.00',
  winners: '1',
};
