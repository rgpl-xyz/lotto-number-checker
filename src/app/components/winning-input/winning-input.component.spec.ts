import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinningInputComponent } from './winning-input.component';

describe('WinningInputComponent', () => {
  let component: WinningInputComponent;
  let fixture: ComponentFixture<WinningInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinningInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinningInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty inputs and invalid status', () => {
    expect(component.numberInputs()).toEqual([
      undefined, undefined, undefined, undefined, undefined, undefined
    ]);
    expect(component.isValid()).toBe(false);
  });

  it('should update number inputs and validate', () => {
    // Valid number
    component.updateNumber(0, 10);
    expect(component.numberInputs()[0]).toBe(10);
    expect(component.isValid()).toBe(false); // Still invalid because not all numbers are filled

    // Empty string should be converted to undefined
    component.updateNumber(0, '');
    expect(component.numberInputs()[0]).toBeUndefined();
    
    // Fill all inputs with valid numbers
    component.updateNumber(0, 1);
    component.updateNumber(1, 2);
    component.updateNumber(2, 3);
    component.updateNumber(3, 4);
    component.updateNumber(4, 5);
    component.updateNumber(5, 6);
    
    expect(component.isValid()).toBe(true);
  });

  it('should detect duplicate numbers and mark as invalid', () => {
    // Fill inputs with duplicates
    component.updateNumber(0, 10);
    component.updateNumber(1, 20);
    component.updateNumber(2, 30);
    component.updateNumber(3, 40);
    component.updateNumber(4, 10); // Duplicate of index 0
    component.updateNumber(5, 50);
    
    expect(component.hasDuplicates()).toBe(true);
    expect(component.isValid()).toBe(false);
  });

  it('should mark as invalid if numbers out of range', () => {
    // Fill inputs with one invalid number
    component.updateNumber(0, 10);
    component.updateNumber(1, 20);
    component.updateNumber(2, 30);
    component.updateNumber(3, 40);
    component.updateNumber(4, 60); // Above 59
    component.updateNumber(5, 50);
    
    expect(component.isValid()).toBe(false);
  });

  it('should submit winning numbers when valid', () => {
    spyOn(component.winningNumbersSet, 'emit');
    
    // Fill with valid numbers
    component.updateNumber(0, 10);
    component.updateNumber(1, 20);
    component.updateNumber(2, 30);
    component.updateNumber(3, 40);
    component.updateNumber(4, 50);
    component.updateNumber(5, 59);
    
    expect(component.isValid()).toBe(true);
    
    component.submitWinningNumbers();
    
    expect(component.winningNumbersSet.emit).toHaveBeenCalledWith([10, 20, 30, 40, 50, 59]);
  });

  it('should not submit winning numbers when invalid', () => {
    spyOn(component.winningNumbersSet, 'emit');
    
    // Not all numbers filled
    component.updateNumber(0, 10);
    component.updateNumber(1, 20);
    
    expect(component.isValid()).toBe(false);
    
    component.submitWinningNumbers();
    
    expect(component.winningNumbersSet.emit).not.toHaveBeenCalled();
  });

  it('should handle key down events', () => {
    const mockDocument = TestBed.inject(Document);
    const mockElement = document.createElement('input');
    spyOn(mockDocument, 'getElementById').and.returnValue(mockElement);
    spyOn(mockElement, 'focus');
    
    // Enter key on a non-last input should focus next input
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(enterEvent, 'preventDefault');
    
    component.handleKeyDown(enterEvent, 2); // Third input (index 2)
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(mockDocument.getElementById).toHaveBeenCalledWith('number-input-3');
    expect(mockElement.focus).toHaveBeenCalled();
  });

  it('should submit numbers when Enter pressed on last input and valid', () => {
    spyOn(component, 'submitWinningNumbers');
    
    // Fill with valid numbers
    component.updateNumber(0, 10);
    component.updateNumber(1, 20);
    component.updateNumber(2, 30);
    component.updateNumber(3, 40);
    component.updateNumber(4, 50);
    component.updateNumber(5, 59);
    
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(enterEvent, 'preventDefault');
    
    component.handleKeyDown(enterEvent, 5); // Last input (index 5)
    
    expect(enterEvent.preventDefault).toHaveBeenCalled();
    expect(component.submitWinningNumbers).toHaveBeenCalled();
  });

  it('should handle paste event correctly', () => {
    // Create mock clipboard event
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer()
    });
    
    // Set paste data
    Object.defineProperty(pasteEvent.clipboardData, 'getData', {
      value: () => '10,20,30,40,50,60'
    });

    spyOn(pasteEvent, 'preventDefault');
    
    // Mock the target element in the paste event
    const mockInput = document.createElement('input');
    Object.defineProperty(pasteEvent, 'target', { value: mockInput });
    
    // Mock the parent element lookup
    const mockParent = document.createElement('div');
    mockParent.appendChild(mockInput);
    Object.defineProperty(mockInput, 'parentElement', { value: mockParent });
    
    component.parseInputString(pasteEvent);
    
    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    
    // Should parse 5 of the 6 numbers (60 is out of range)
    const expectedNumbers = [10, 20, 30, 40, 50, undefined];
    expect(component.numberInputs().slice(0, 6)).toEqual(expectedNumbers);
  });
  
  it('should reject paste with no valid numbers', () => {
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer()
    });
    
    // Set paste data with no valid numbers
    Object.defineProperty(pasteEvent.clipboardData, 'getData', {
      value: () => 'abc'
    });

    spyOn(pasteEvent, 'preventDefault');
    
    const originalInputs = [...component.numberInputs()];
    component.parseInputString(pasteEvent);
    
    expect(pasteEvent.preventDefault).toHaveBeenCalled();
    // Inputs should remain unchanged
    expect(component.numberInputs()).toEqual(originalInputs);
  });

  it('should support initial numbers from model input', () => {
    const testNumbers = [5, 10, 15, 20, 25, 30];
    
    // Set the numbers via the model input
    component.numbersToEdit.set(testNumbers);
    
    // Let the effect run
    fixture.detectChanges();
    
    // Expect input fields to be populated
    expect(component.numberInputs()).toEqual(testNumbers);
    expect(component.isValid()).toBe(true);
  });
});
