import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { WinningInputComponent } from './winning-input.component';

type MockClipboardEvent = {
  clipboardData: {
    getData: ReturnType<typeof vi.fn>;
  };
  preventDefault: ReturnType<typeof vi.fn>;
  target: HTMLInputElement;
};

describe('WinningInputComponent', () => {
  let component: WinningInputComponent;
  let fixture: ComponentFixture<WinningInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinningInputComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(WinningInputComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty inputs and invalid status', () => {
    expect(component.numbers.value).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(component.form.valid).toBe(false);
  });

  it('should update number inputs and validate', () => {
    component.numbers.at(0).setValue(10);
    expect(component.numbers.at(0).value).toBe(10);
    expect(component.form.valid).toBe(false); // Still invalid because not all numbers are filled

    component.numbers.at(0).setValue(null);
    expect(component.numbers.at(0).value).toBeNull();

    component.numbers.patchValue([1, 2, 3, 4, 5, 6]);
    expect(component.form.valid).toBe(true);
  });

  it('should detect duplicate numbers and mark as invalid', () => {
    component.numbers.patchValue([10, 20, 30, 40, 10, 50]); // Duplicate 10
    expect(component.numbers.errors?.['duplicate']).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('should mark as invalid if numbers out of range', () => {
    component.numbers.patchValue([10, 20, 30, 40, 60, 50]); // 60 above 59
    expect(component.form.valid).toBe(false);
  });

  it('should submit winning numbers when valid', () => {
    vi.spyOn(component.winningNumbersSet, 'emit');

    component.numbers.patchValue([10, 20, 30, 40, 50, 59]);
    expect(component.form.valid).toBe(true);

    component.submitWinningNumbers();

    expect(component.winningNumbersSet.emit).toHaveBeenCalledWith([
      10, 20, 30, 40, 50, 59,
    ]);
  });

  it('should not submit winning numbers when invalid', () => {
    vi.spyOn(component.winningNumbersSet, 'emit');

    component.numbers.patchValue([10, 20, null, null, null, null]);

    expect(component.form.valid).toBe(false);

    component.submitWinningNumbers();

    expect(component.winningNumbersSet.emit).not.toHaveBeenCalled();
  });

  it('should handle key down events', () => {
    // Create a mock element for the next input
    const mockElement = document.createElement('input');
    mockElement.id = 'number-input-3';
    vi.spyOn(mockElement, 'focus');

    // Mock document.getElementById to return our mock element
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    // Enter key on a non-last input should focus next input
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    vi.spyOn(enterEvent, 'preventDefault');

    component.handleKeyDown(enterEvent, 2); // Third input (index 2)

    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(document.getElementById).toHaveBeenCalledWith('number-input-3');
    expect(mockElement.focus).toHaveBeenCalled();

    // Restore the mock
    vi.restoreAllMocks();
  });

  it('should submit numbers when Enter pressed on last input and valid', () => {
    vi.spyOn(component, 'submitWinningNumbers');

    component.numbers.patchValue([10, 20, 30, 40, 50, 59]);

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    vi.spyOn(enterEvent, 'preventDefault');

    component.handleKeyDown(enterEvent, 5); // Last input (index 5)

    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(component.submitWinningNumbers).toHaveBeenCalled();
  });

  it('should handle paste event correctly', () => {
    const mockTarget = document.createElement('input');
    const mockParent = document.createElement('div');
    mockParent.appendChild(mockTarget);
    Object.defineProperty(mockTarget, 'parentElement', { value: mockParent });

    const pasteEvent: MockClipboardEvent = {
      clipboardData: {
        getData: vi.fn().mockReturnValue('10,20,30,40,50,60')
      },
      preventDefault: vi.fn(),
      target: mockTarget
    };

    component.parseInputString(pasteEvent as unknown as ClipboardEvent);

    expect(pasteEvent.preventDefault).toHaveBeenCalled();

    // 60 is out of range, so only 5 numbers are parsed and patched (last slot stays null)
    expect(component.numbers.value).toEqual([10, 20, 30, 40, 50, null]);
  });

  it('should reject paste with no valid numbers', () => {
    const pasteEvent: MockClipboardEvent = {
      clipboardData: {
        getData: vi.fn().mockReturnValue('abc')
      },
      preventDefault: vi.fn(),
      target: document.createElement('input')
    };

    const initialValues = [...component.numbers.value];
    component.parseInputString(pasteEvent as unknown as ClipboardEvent);

    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    expect(component.numbers.value).toEqual(initialValues);
  });

  it('should support initial numbers from model input', () => {
    const testNumbers = [5, 10, 15, 20, 25, 30];

    component.numbersToEdit.set(testNumbers);
    fixture.detectChanges();

    expect(component.numbers.value).toEqual(testNumbers);
    expect(component.form.valid).toBe(true);
  });

  it('should maintain correct order when pasting numbers regardless of which input field is targeted', () => {
    const pasteEvent: MockClipboardEvent = {
      clipboardData: {
        getData: vi.fn().mockReturnValue('09-15-39-01-42-27')
      },
      preventDefault: vi.fn(),
      target: document.createElement('input')
    };

    component.parseInputString(pasteEvent as unknown as ClipboardEvent);

    expect(pasteEvent.preventDefault).toHaveBeenCalled();

    const expectedNumbers = [9, 15, 39, 1, 42, 27];
    expect(component.numbers.value).toEqual(expectedNumbers);
    expect(component.form.valid).toBe(true);
  });
});
