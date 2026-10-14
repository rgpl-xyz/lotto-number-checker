import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, Signal, WritableSignal, provideZonelessChangeDetection } from '@angular/core';
import { of, Observable } from 'rxjs';
import { vi, describe, it, beforeEach, expect } from 'vitest';

import { SearchResultsComponent } from './search-results.component';
import { LottoService } from '../../services/lotto.service';
import { LottoResult } from '../../models/lotto.model';
import { Draw, toDraw } from '../../lotto/draw';

const RESULT: LottoResult = {
  game: 'Ultra Lotto 6/58',
  combinations: '05-12-23-34-45-56',
  draw: toDraw([5, 12, 23, 34, 45, 56]),
  drawDate: new Date('10/12/2026'),
  jackpot: '49,500,000.00',
  winners: '0',
};

type MockLottoService = {
  getLottoResults: ReturnType<typeof vi.fn>;
  refreshResults: ReturnType<typeof vi.fn>;
  cachedResults: Signal<LottoResult[]>;
  isLoading: Signal<boolean>;
  error: Signal<string>;
  cacheTimestamp: Signal<number>;
  hasCachedData: Signal<boolean>;
};

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;
  let mockLottoService: MockLottoService;

  beforeEach(async () => {
    mockLottoService = {
      getLottoResults: vi.fn().mockReturnValue(of([])),
      refreshResults: vi.fn().mockReturnValue(of([])),
      cachedResults: signal<LottoResult[]>([]),
      isLoading: signal(false),
      error: signal(''),
      cacheTimestamp: signal(0),
      hasCachedData: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [SearchResultsComponent],
      providers: [
        { provide: LottoService, useValue: mockLottoService },
        provideZonelessChangeDetection()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the fetch error with a retry button instead of results', async () => {
    (mockLottoService.error as WritableSignal<string>).set(
      'Unable to fetch lottery results at this time. Please try again later.'
    );
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.error')?.textContent).toContain(
      'Unable to fetch lottery results'
    );
    expect(element.querySelector('.results-table')).toBeNull();

    element.querySelector<HTMLButtonElement>('.retry-btn')?.click();

    expect(mockLottoService.refreshResults).toHaveBeenCalled();
  });

  it("sets a result's draw as the winning numbers", async () => {
    (mockLottoService.cachedResults as WritableSignal<LottoResult[]>).set([RESULT]);
    await fixture.whenStable();
    const setDraws: Draw[] = [];
    component.winningNumbersSet.subscribe((draw) => setDraws.push(draw));

    fixture.nativeElement.querySelector('.set-button').click();

    expect(setDraws).toEqual([[5, 12, 23, 34, 45, 56]]);
  });

  it('cannot use a result whose numbers are not a draw', async () => {
    (mockLottoService.cachedResults as WritableSignal<LottoResult[]>).set([
      { ...RESULT, combinations: '05-12-23-34-45', draw: null },
    ]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.set-button').disabled).toBe(true);
  });
});
