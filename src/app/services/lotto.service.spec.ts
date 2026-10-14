import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { vi, describe, it, beforeEach, afterEach, expect } from 'vitest';
import { LottoService } from './lotto.service';

const RESULTS_URL = '/api/SearchLottoResult.aspx';
const FETCH_ERROR =
  'Unable to fetch lottery results at this time. Please try again later.';

const PCSO_RESULTS_PAGE = `
  <table id="cphContainer_cpContent_GridView1">
    <tr><th>LOTTO GAME</th><th>COMBINATIONS</th><th>DRAW DATE</th><th>JACKPOT (PHP)</th><th>WINNERS</th></tr>
    <tr><td>Ultra Lotto 6/58</td><td>05-12-23-34-45-56</td><td>10/12/2026</td><td>49,500,000.00</td><td>0</td></tr>
    <tr><td>4D Lotto</td><td>1-2-3-4</td><td>10/12/2026</td><td>10,000.00</td><td>3</td></tr>
  </table>`;

describe('LottoService', () => {
  let service: LottoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(LottoService);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    // Restore first: the unit-test builder runs specs in one context, so a
    // failing verify() must not leave console.error mocked for later files.
    vi.restoreAllMocks();
    http.verify();
  });

  it('parses supported games from the PCSO results table', () => {
    const next = vi.fn();
    service.getLottoResults().subscribe(next);

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
    expect(service.isLoading()).toBe(false);
    expect(service.hasCachedData()).toBe(true);
  });

  it('gives no draw for a result whose numbers are not one', () => {
    const next = vi.fn();
    service.getLottoResults().subscribe(next);

    http
      .expectOne(RESULTS_URL)
      .flush(PCSO_RESULTS_PAGE.replace('05-12-23-34-45-56', '05-12-23-34-45-59'));

    expect(next.mock.calls[0][0][0].draw).toBeNull();
  });

  it('checks the numbers against the game they were drawn in', () => {
    const next = vi.fn();
    service.getLottoResults().subscribe(next);

    http
      .expectOne(RESULTS_URL)
      .flush(PCSO_RESULTS_PAGE.replace('Ultra Lotto 6/58', 'Megalotto 6/45'));

    expect(next.mock.calls[0][0][0].draw).toBeNull();
  });

  it('sends a plain request without browser-impersonation headers', () => {
    service.getLottoResults().subscribe();

    const testRequest = http.expectOne(RESULTS_URL);

    expect(testRequest.request.headers.keys()).toEqual([]);
    expect(testRequest.request.withCredentials).toBe(false);
    testRequest.flush(PCSO_RESULTS_PAGE);
  });

  it('reports an error without throwing when PCSO refuses the request', () => {
    const observer = { next: vi.fn(), error: vi.fn(), complete: vi.fn() };
    service.getLottoResults().subscribe(observer);

    http
      .expectOne(RESULTS_URL)
      .flush('Access Denied', { status: 403, statusText: 'Forbidden' });

    expect(observer.error).not.toHaveBeenCalled();
    expect(observer.next).not.toHaveBeenCalled();
    expect(observer.complete).toHaveBeenCalled();
    expect(service.error()).toBe(FETCH_ERROR);
    expect(service.isLoading()).toBe(false);
    expect(service.hasCachedData()).toBe(false);
  });

  it('clears the loading state when the caller unsubscribes mid-request', () => {
    const subscription = service.getLottoResults().subscribe();
    const testRequest = http.expectOne(RESULTS_URL);
    expect(service.isLoading()).toBe(true);

    subscription.unsubscribe();

    expect(testRequest.cancelled).toBe(true);
    expect(service.isLoading()).toBe(false);
  });

  it('treats an ASP.NET error page as a failed fetch', () => {
    const observer = { next: vi.fn(), error: vi.fn(), complete: vi.fn() };
    service.getLottoResults().subscribe(observer);

    http
      .expectOne(RESULTS_URL)
      .flush('<html><body>Server Error in / Application.</body></html>');

    expect(observer.error).not.toHaveBeenCalled();
    expect(service.error()).toBe(FETCH_ERROR);
    expect(service.hasCachedData()).toBe(false);
  });
});
