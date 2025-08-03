import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { WinningNumberComponent } from './winning-number.component';
import { WinningInputComponent } from '../winning-input/winning-input.component';
import { NumberDisplayComponent } from '../number-display/number-display.component';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { LottoService } from '../../services/lotto.service';

describe('WinningNumberComponent', () => {
  let component: WinningNumberComponent;
  let fixture: ComponentFixture<WinningNumberComponent>;

  beforeEach(async () => {
    const mockLottoService = {
      getLottoResults: vi.fn().mockReturnValue(of([])),
      refreshResults: vi.fn().mockReturnValue(of([])),
      cachedResults: signal([]),
      isLoading: signal(false),
      error: signal(''),
      cacheTimestamp: signal(0),
      hasCachedData: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [
        WinningNumberComponent,
        WinningInputComponent,
        NumberDisplayComponent,
        SearchResultsComponent,
      ],
      providers: [
        { provide: LottoService, useValue: mockLottoService },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WinningNumberComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.title()).toBe('Lotto Number Matcher');
    expect(component.winningNumbers()).toEqual([]);
    expect(component.isEditMode()).toBe(true);
  });

  it('should set winning numbers and toggle edit mode', () => {
    const testNumbers = [1, 2, 3, 4, 5, 6];

    component.setWinningNumbers(testNumbers);

    expect(component.winningNumbers()).toEqual(testNumbers);
    expect(component.isEditMode()).toBe(false);
  });

  it('should enable edit mode when editWinningNumbers is called', () => {
    // First set edit mode to false
    component.isEditMode.set(false);
    expect(component.isEditMode()).toBe(false);

    // Call the editWinningNumbers method
    component.editWinningNumbers();

    // Expect edit mode to be true now
    expect(component.isEditMode()).toBe(true);
  });

  it('should have useSearch default to false', () => {
    expect(component.useSearch()).toBe(false);
  });

  it('should toggle useSearch when checkbox is changed', () => {
    component.useSearch.set(true);
    expect(component.useSearch()).toBe(true);

    component.useSearch.set(false);
    expect(component.useSearch()).toBe(false);
  });
});
