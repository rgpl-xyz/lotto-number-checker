import { Component, computed, signal, input, output } from '@angular/core';

@Component({
  selector: 'app-number-display',
  standalone: true,
  imports: [],
  templateUrl: './number-display.component.html',
  styleUrl: './number-display.component.scss'
})
export class NumberDisplayComponent {
  winningNumbers = input<number[]>([]);
  editWinningNumbers = output<void>();
  inputNumber = signal<number | undefined>(undefined);
  userNumbers = signal<number[]>([]);
  editingRowIndex = signal<number | null>(null);

  matchingNumbers = computed(() => {
    if (!this.winningNumbers().length) return [];

    return this.userNumbers().filter(num =>
      this.winningNumbers().some(winNum => Number(winNum) === Number(num))
    );
  });

  userNumberRows = computed(() => {
    const numbers = this.userNumbers();
    const rows: number[][] = [];
    
    for (let i = 0; i < numbers.length; i += 6) {
      rows.push(numbers.slice(i, i + 6));
    }
    
    return rows;
  });
  
  rowLabels = computed(() => {
    const rows = this.userNumberRows();
    return rows.map((_, index) => this.generateRowLabel(index));
  });

  matchesPerRow = computed(() => {
    if (!this.winningNumbers().length) return [];
    
    return this.userNumberRows().map(row => 
      row.filter(num => this.isMatching(num)).length
    );
  });

  highestMatchCount = computed(() => {
    const matches = this.matchesPerRow();
    return matches.length > 0 ? Math.max(...matches) : 0;
  });

  rowsWithHighestMatches = computed(() => {
    const highest = this.highestMatchCount();
    return this.matchesPerRow().map((count) => count === highest && count > 0);
  });

  isInputValid = computed(() => {
    const value = this.inputNumber();
    if (!value) return false;

    const num = value;
    return !isNaN(num) && num >= 1 && num <= 59;
  });

  addNumber(): void {
    const num = this.inputNumber();
    if (!num) return;

    if (!isNaN(num) && num >= 1 && num <= 59) {
      const numValue = Number(num);
      const numbers = this.userNumbers();
      
      // Get the current row's numbers (last row or partial row)
      const rowSize = 6;
      const lastRowStartIndex = Math.floor(numbers.length / rowSize) * rowSize;
      const currentRowNumbers = numbers.slice(lastRowStartIndex);

      // Only check duplicates within the current row
      const isDuplicateInCurrentRow = currentRowNumbers.includes(numValue);
      
      // Add number only if it's not a duplicate in current row
      // Or if the current row is full (start a new row)
      if (!isDuplicateInCurrentRow || currentRowNumbers.length >= rowSize) {
        this.userNumbers.update(nums => [...nums, numValue]);
      }
      
      this.inputNumber.set(undefined);
    }
  }

  clearNumbers(): void {
    this.userNumbers.set([]);
  }

  isMatching(num: number): boolean {
    return this.winningNumbers().some(winNum => Number(winNum) === Number(num));
  }

  hasHighestMatches(rowIndex: number): boolean {
    return this.rowsWithHighestMatches()[rowIndex] || false;
  }

  editRow(rowIndex: number): void {
    this.editingRowIndex.set(rowIndex);
  }

  deleteRow(rowIndex: number): void {
    const rowsPerPage = 6;
    const startIndex = rowIndex * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    this.userNumbers.update(numbers => {
      const newNumbers = [...numbers];
      newNumbers.splice(startIndex, Math.min(rowsPerPage, newNumbers.length - startIndex));
      return newNumbers;
    });
  }

  deleteNumber(rowIndex: number, numberIndex: number): void {
    const actualIndex = rowIndex * 6 + numberIndex;
    this.userNumbers.update(numbers => {
      const newNumbers = [...numbers];
      newNumbers.splice(actualIndex, 1);
      return newNumbers;
    });
  }

  isEditingRow(rowIndex: number): boolean {
    return this.editingRowIndex() === rowIndex;
  }

  editNumber(rowIndex: number, numberIndex: number): void {
    console.log('Editing number at row:', rowIndex, 'number index:', numberIndex);
    
    const actualIndex = rowIndex * 6 + numberIndex;
    console.log('Calculated actual index:', actualIndex);
    console.log('Current numbers array:', this.userNumbers());
    
    const currentValue = this.userNumbers()[actualIndex];
    console.log('Current value:', currentValue);
    
    // Use prompt dialog for editing
    const newValueStr = prompt('Edit number:', currentValue.toString());
    if (newValueStr === null) return; // User cancelled
    
    const newValue = parseInt(newValueStr, 10);
    
    // Validate input
    if (isNaN(newValue) || newValue < 1 || newValue > 59) {
      alert('Please enter a valid number between 1 and 59');
      return;
    }
    
    // Check for duplicates in the same row
    const rowStartIndex = rowIndex * 6;
    const rowEndIndex = Math.min(rowStartIndex + 6, this.userNumbers().length);
    const rowNumbers = this.userNumbers().slice(rowStartIndex, rowEndIndex);
    
    // Check if this would create a duplicate in the row
    const wouldCreateDuplicate = rowNumbers.some((n, i) => {
      // Skip comparing with the number we're editing
      if (rowStartIndex + i === actualIndex) return false;
      return n === newValue;
    });
    
    if (wouldCreateDuplicate) {
      alert('This number already exists in the current row');
      return;
    }
    
    // Update the number
    this.userNumbers.update(numbers => {
      const newNumbers = [...numbers];
      newNumbers[actualIndex] = newValue;
      return newNumbers;
    });
  }

  finishEditing(): void {
    this.editingRowIndex.set(null);
  }

  // Generate a row label (A-Z, then A1-Z1, A2-Z2, etc.)
  private generateRowLabel(index: number): string {
    const letterCount = 26; // A-Z
    const baseCharCode = 'A'.charCodeAt(0);
    
    const cycleNumber = Math.floor(index / letterCount);
    const letterIndex = index % letterCount;
    const letter = String.fromCharCode(baseCharCode + letterIndex);
    
    return cycleNumber === 0 ? letter : `${letter}${cycleNumber}`;
  }
}
