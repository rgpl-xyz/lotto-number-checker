import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { WinningNumberComponent } from './winning-number.component';
import { WinningInputComponent } from '../winning-input/winning-input.component';
import { NumberDisplayComponent } from '../number-display/number-display.component';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { LottoService } from '../../services/lotto.service';
import { FEATURE_FLAGS, FeatureFlags } from '../../feature-flags';

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

describe('WinningNumberComponent live results flag', () => {
  async function render(flags: FeatureFlags) {
    const lottoService = {
      getLottoResults: vi.fn().mockReturnValue(of([])),
      refreshResults: vi.fn().mockReturnValue(of([])),
      cachedResults: signal([]),
      isLoading: signal(false),
      error: signal(''),
      cacheTimestamp: signal(0),
      hasCachedData: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [WinningNumberComponent],
      providers: [
        { provide: LottoService, useValue: lottoService },
        { provide: FEATURE_FLAGS, useValue: flags },
        provideZonelessChangeDetection()
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(WinningNumberComponent);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    return { fixture, element, lottoService };
  }

  it('hides the search toggle and never fetches when live results are off', async () => {
    const { fixture, element, lottoService } = await render({ liveResults: false });

    fixture.componentInstance.useSearch.set(true);
    await fixture.whenStable();

    expect(element.querySelector('#use-search')).toBeNull();
    expect(element.querySelector('app-search-results')).toBeNull();
    expect(element.querySelector('app-winning-input')).not.toBeNull();
    expect(lottoService.getLottoResults).not.toHaveBeenCalled();
  });

  it('shows the search toggle, unchecked, when live results are on', async () => {
    const { element, lottoService } = await render({ liveResults: true });

    const toggle = element.querySelector<HTMLInputElement>('#use-search');
    expect(toggle).not.toBeNull();
    expect(toggle?.checked).toBe(false);
    expect(element.querySelector('app-search-results')).toBeNull();
    expect(lottoService.getLottoResults).not.toHaveBeenCalled();
  });

  it('loads search results once the toggle is checked', async () => {
    const { fixture, element, lottoService } = await render({ liveResults: true });

    element.querySelector<HTMLInputElement>('#use-search')?.click();
    await fixture.whenStable();

    expect(element.querySelector('app-search-results')).not.toBeNull();
    expect(element.querySelector('app-winning-input')).not.toBeNull();
    expect(lottoService.getLottoResults).toHaveBeenCalled();
  });
});
