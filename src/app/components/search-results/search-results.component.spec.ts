import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, Signal, provideZonelessChangeDetection } from '@angular/core';
import { of, Observable } from 'rxjs';
import { vi, describe, it, beforeEach, expect } from 'vitest';

import { SearchResultsComponent } from './search-results.component';
import { LottoService } from '../../services/lotto.service';
import { LottoResult } from '../../models/lotto.model';

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
      cachedResults: signal([]),
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
});
