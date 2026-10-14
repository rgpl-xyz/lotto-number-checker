import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { PcsoResultsSource } from './pcso-results-source';

const RESULTS_URL = '/api/SearchLottoResult.aspx';

const PCSO_RESULTS_PAGE = `
  <table id="cphContainer_cpContent_GridView1">
    <tr><th>LOTTO GAME</th><th>COMBINATIONS</th><th>DRAW DATE</th><th>JACKPOT (PHP)</th><th>WINNERS</th></tr>
    <tr><td>Ultra Lotto 6/58</td><td>05-12-23-34-45-56</td><td>10/12/2026</td><td>49,500,000.00</td><td>0</td></tr>
    <tr><td>4D Lotto</td><td>1-2-3-4</td><td>10/12/2026</td><td>10,000.00</td><td>3</td></tr>
  </table>`;

describe('PcsoResultsSource', () => {
  let source: PcsoResultsSource;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PcsoResultsSource,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    source = TestBed.inject(PcsoResultsSource);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('reads the six-number games from the PCSO results table', () => {
    const next = vi.fn();
    source.latest().subscribe(next);

    http.expectOne(RESULTS_URL).flush(PCSO_RESULTS_PAGE);

    expect(next).toHaveBeenCalledWith([
      {
        game: 'Ultra Lotto 6/58',
        combinations: '05-12-23-34-45-56',
        draw: [5, 12, 23, 34, 45, 56],
        drawDate: new Date('10/12/2026'),
        jackpot: '49,500,000.00',
        winners: '0',
      },
    ]);
  });

  it('gives no draw for a result whose numbers are not one', () => {
    const next = vi.fn();
    source.latest().subscribe(next);

    http
      .expectOne(RESULTS_URL)
      .flush(PCSO_RESULTS_PAGE.replace('05-12-23-34-45-56', '05-12-23-34-45-59'));

    expect(next.mock.calls[0][0][0].draw).toBeNull();
  });

  it('checks the numbers against the game they were drawn in', () => {
    const next = vi.fn();
    source.latest().subscribe(next);

    http
      .expectOne(RESULTS_URL)
      .flush(PCSO_RESULTS_PAGE.replace('Ultra Lotto 6/58', 'Megalotto 6/45'));

    expect(next.mock.calls[0][0][0].game).toBe('Megalotto 6/45');
    expect(next.mock.calls[0][0][0].draw).toBeNull();
  });

  it('sends a plain request without browser-impersonation headers', () => {
    source.latest().subscribe();

    const testRequest = http.expectOne(RESULTS_URL);

    expect(testRequest.request.headers.keys()).toEqual([]);
    expect(testRequest.request.withCredentials).toBe(false);
    testRequest.flush(PCSO_RESULTS_PAGE);
  });

  it('errors when PCSO refuses the request', () => {
    const observer = { next: vi.fn(), error: vi.fn() };
    source.latest().subscribe(observer);

    http
      .expectOne(RESULTS_URL)
      .flush('Access Denied', { status: 403, statusText: 'Forbidden' });

    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.error).toHaveBeenCalled();
  });

  it('errors when PCSO serves its ASP.NET error page', () => {
    const observer = { next: vi.fn(), error: vi.fn() };
    source.latest().subscribe(observer);

    http
      .expectOne(RESULTS_URL)
      .flush('<html><body>Server Error in / Application.</body></html>');

    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.error).toHaveBeenCalled();
  });

  it('cancels the request when unsubscribed', () => {
    const subscription = source.latest().subscribe();
    const testRequest = http.expectOne(RESULTS_URL);

    subscription.unsubscribe();

    expect(testRequest.cancelled).toBe(true);
  });
});
