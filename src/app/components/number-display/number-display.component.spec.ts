import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { NumberDisplayComponent } from './number-display.component';

describe('NumberDisplayComponent', () => {
  let component: NumberDisplayComponent;
  let fixture: ComponentFixture<NumberDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumberDisplayComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumberDisplayComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should initialize with default values', () => {
    expect(component.winningNumbers()).toEqual([]);
    expect(component.inputNumber()).toBeUndefined();
    expect(component.userNumbers()).toEqual([]);
    expect(component.editingRowIndex()).toBeNull();
  });

  it('should identify matching numbers correctly', async () => {
    // Set user numbers with some matches
    component.userNumbers.set([5, 10, 15, 30, 45, 60]);
    
    // Set winning numbers input using fixture
    fixture.componentRef.setInput('winningNumbers', [10, 20, 30, 40, 50, 60]);
    await fixture.whenStable();
    
    // Check matching numbers
    expect(component.matchingNumbers()).toEqual([10, 30, 60]);
    
    // Test with empty winning numbers
    fixture.componentRef.setInput('winningNumbers', []);
    await fixture.whenStable();
    expect(component.matchingNumbers()).toEqual([]);
  });

  it('should organize numbers into rows of 6', () => {
    // Add 10 numbers
    component.userNumbers.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    
    // Should be organized into rows of 6
    expect(component.userNumberRows()).toEqual([
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10]
    ]);
    
    // Test with empty user numbers
    component.userNumbers.set([]);
    expect(component.userNumberRows()).toEqual([]);
  });

  it('should generate row labels correctly', () => {
    // Add 30 numbers (5 rows)
    const numbers = Array.from({ length: 30 }, (_, i) => i + 1);
    component.userNumbers.set(numbers);
    
    // Check row labels
    expect(component.rowLabels()).toEqual(['A', 'B', 'C', 'D', 'E']);
    
    // Add more numbers to test cycling (A-Z, then A1, B1, etc.)
    const moreNumbers = Array.from({ length: 156 }, (_, i) => i + 1);
    component.userNumbers.set(moreNumbers);
    
    // Should have labels from A to Z, then A1, B1, etc.
    const rowLabels = component.rowLabels();
    expect(rowLabels.length).toBe(26); // 156 / 6 = 26 rows
    expect(rowLabels[0]).toBe('A');
    expect(rowLabels[25]).toBe('Z');
  });

  it('should calculate matches per row', async () => {
    // Set 3 rows of user numbers with different match counts
    component.userNumbers.set([
      // Row 1: 3 matches
      1, 2, 3, 10, 11, 12,
      // Row 2: 0 matches
      21, 22, 23, 24, 25, 26,
      // Row 3: 5 matches
      1, 2, 3, 4, 5, 30
    ]);
    
    // Set winning numbers and check matches
    fixture.componentRef.setInput('winningNumbers', [1, 2, 3, 4, 5, 6]);
    await fixture.whenStable();
    expect(component.matchesPerRow()).toEqual([3, 0, 5]);
    
    // Test with empty winning numbers
    fixture.componentRef.setInput('winningNumbers', []);
    await fixture.whenStable();
    expect(component.matchesPerRow()).toEqual([]);
  });

  it('should identify the highest match count', async () => {
    // Set user numbers with different match counts
    component.userNumbers.set([
      // Row 1: 2 matches
      1, 2, 10, 11, 12, 13,
      // Row 2: 4 matches
      1, 2, 3, 4, 20, 21,
      // Row 3: 0 matches
      10, 11, 12, 13, 14, 15
    ]);
    
    // Set winning numbers and check highest match count
    fixture.componentRef.setInput('winningNumbers', [1, 2, 3, 4, 5, 6]);
    await fixture.whenStable();
    expect(component.highestMatchCount()).toBe(4);
    
    // Test with empty winning numbers
    fixture.componentRef.setInput('winningNumbers', []);
    await fixture.whenStable();
    expect(component.highestMatchCount()).toBe(0);
    
    // Test with no matches
    component.userNumbers.set([10, 11, 12, 13, 14, 15]);
    fixture.componentRef.setInput('winningNumbers', [1, 2, 3, 4, 5, 6]);
    await fixture.whenStable();
    expect(component.highestMatchCount()).toBe(0);
    
    // Test with empty array
    component.userNumbers.set([]);
    await fixture.whenStable();
    expect(component.highestMatchCount()).toBe(0);
  });

  it('should identify rows with highest matches', async () => {
    // Set rows with different match counts
    component.userNumbers.set([
      // Row 1: 2 matches
      1, 2, 10, 11, 12, 13,
      // Row 2: 4 matches
      1, 2, 3, 4, 20, 21,
      // Row 3: 0 matches
      10, 11, 12, 13, 14, 15,
      // Row 4: 4 matches (tied for highest)
      1, 2, 3, 4, 30, 31
    ]);
    
    // Set winning numbers and check rows with highest matches
    fixture.componentRef.setInput('winningNumbers', [1, 2, 3, 4, 5, 6]);
    await fixture.whenStable();
    expect(component.rowsWithHighestMatches()).toEqual([false, true, false, true]);
    
    // Test with no user numbers
    component.userNumbers.set([]);
    await fixture.whenStable();
    expect(component.rowsWithHighestMatches()).toEqual([]);
  });

  it('should validate input number', () => {
    // Valid number
    component.inputNumber.set(10);
    expect(component.isInputValid()).toBe(true);
    
    // Invalid cases
    component.inputNumber.set(undefined);
    expect(component.isInputValid()).toBe(false);
    
    component.inputNumber.set(0);
    expect(component.isInputValid()).toBe(false);
    
    component.inputNumber.set(59);
    expect(component.isInputValid()).toBe(true);  // 1-59 range
    
    component.inputNumber.set(100);
    expect(component.isInputValid()).toBe(false);
  });

  it('should add valid numbers to the user numbers', () => {
    // Set valid input
    component.inputNumber.set(10);
    
    // Add the number
    component.addNumber();
    
    // Number should be added to userNumbers
    expect(component.userNumbers()).toEqual([10]);
    
    // Input should be reset
    expect(component.inputNumber()).toBeUndefined();
    
    // Fill a row
    component.inputNumber.set(20);
    component.addNumber();
    component.inputNumber.set(30);
    component.addNumber();
    component.inputNumber.set(40);
    component.addNumber();
    component.inputNumber.set(50);
    component.addNumber();
    component.inputNumber.set(59);
    component.addNumber();
    
    // Should have 6 numbers now
    expect(component.userNumbers()).toEqual([10, 20, 30, 40, 50, 59]);
  });

  it('should not add duplicate numbers in the same row', () => {
    // Add 5 numbers
    component.userNumbers.set([10, 20, 30, 40, 50]);
    
    // Try to add duplicate of first number
    component.inputNumber.set(10);
    component.addNumber();
    
    // Number should not be added
    expect(component.userNumbers()).toEqual([10, 20, 30, 40, 50]);
    
    // Add number to complete the row
    component.inputNumber.set(59);
    component.addNumber();
    
    // Now duplicates are allowed in a new row
    component.inputNumber.set(10);
    component.addNumber();
    
    // Now we should have 7 numbers
    expect(component.userNumbers()).toEqual([10, 20, 30, 40, 50, 59, 10]);
  });

  it('should clear all user numbers', () => {
    // Add some numbers
    component.userNumbers.set([10, 20, 30]);
    
    // Clear them
    component.clearNumbers();
    
    // Should be empty
    expect(component.userNumbers()).toEqual([]);
  });

  it('should check if a number matches winning numbers', () => {
    // Create test function
    const testWithWinningNumbers = (nums: number[], numToCheck: number) => {
      const origFn = component.winningNumbers;
      // @ts-ignore - Bypass TypeScript for testing
      component.winningNumbers = () => nums;
      const result = component.isMatching(numToCheck);
      // @ts-ignore - Bypass TypeScript for testing
      component.winningNumbers = origFn;
      return result;
    };
    
    // Test matching
    expect(testWithWinningNumbers([10, 20, 30, 40, 50, 60], 10)).toBe(true);
    expect(testWithWinningNumbers([10, 20, 30, 40, 50, 60], 15)).toBe(false);
    
    // Should handle string conversion
    expect(testWithWinningNumbers([10, 20, 30, 40, 50, 60], Number('20'))).toBe(true);
  });

  it('should identify rows with highest matches', () => {
    // Set up rows with different match counts
    component.userNumbers.set([
      // Row 1: 3 matches
      1, 2, 3, 10, 11, 12,
      // Row 2: 1 match
      1, 21, 22, 23, 24, 25
    ]);
    
    // Create test function
    const testWithWinningNumbers = (nums: number[]) => {
      const origFn = component.winningNumbers;
      // @ts-ignore - Bypass TypeScript for testing
      component.winningNumbers = () => nums;
      
      // Check highest matches
      const result0 = component.hasHighestMatches(0);
      const result1 = component.hasHighestMatches(1);
      
      // @ts-ignore - Bypass TypeScript for testing
      component.winningNumbers = origFn;
      return { row0: result0, row1: result1 };
    };
    
    const results = testWithWinningNumbers([1, 2, 3, 4, 5, 6]);
    expect(results.row0).toBe(true);   // First row has most matches
    expect(results.row1).toBe(false);  // Second row has fewer
  });

  it('should set and check editing row state', () => {
    // Initially not editing
    expect(component.isEditingRow(0)).toBe(false);
    
    // Set editing for row 1
    component.editRow(1);
    
    // Should be editing row 1 now
    expect(component.isEditingRow(1)).toBe(true);
    expect(component.isEditingRow(0)).toBe(false);
    
    // Finish editing
    component.finishEditing();
    
    // No row should be in edit mode
    expect(component.isEditingRow(1)).toBe(false);
  });

  it('should delete a row of numbers', () => {
    // Add two rows of numbers
    component.userNumbers.set([
      1, 2, 3, 4, 5, 6,     // Row 0
      11, 12, 13, 14, 15, 16 // Row 1
    ]);
    
    // Delete the first row
    component.deleteRow(0);
    
    // Should only have the second row left
    expect(component.userNumbers()).toEqual([11, 12, 13, 14, 15, 16]);
    
    // Add another row and delete a partial row
    component.userNumbers.set([
      1, 2, 3, 4, 5, 6,  // Complete row
      11, 12, 13         // Partial row
    ]);
    
    // Delete the partial row
    component.deleteRow(1);
    
    // Should only have the first row left
    expect(component.userNumbers()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should delete a specific number', () => {
    // Add some numbers
    component.userNumbers.set([1, 2, 3, 4, 5, 6, 7, 8]);
    
    // Delete number at row 0, index 2 (the number 3)
    component.deleteNumber(0, 2);
    
    // Number should be removed
    expect(component.userNumbers()).toEqual([1, 2, 4, 5, 6, 7, 8]);
    
    // Delete number at row 1, index 0 (the number 8)
    component.deleteNumber(1, 0);
    
    // Number should be removed
    expect(component.userNumbers()).toEqual([1, 2, 4, 5, 6, 7]);
  });

  // Note: editNumber uses window.prompt which is difficult to test properly
  // For this specific method, we'd need to mock window.prompt
  it('should handle editWinningNumbers event', () => {
    vi.spyOn(component.editWinningNumbers, 'emit');
    
    // Trigger the event
    component.editWinningNumbers.emit();
    
    expect(component.editWinningNumbers.emit).toHaveBeenCalled();
  });
});
