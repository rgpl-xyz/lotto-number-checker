
import {
  Component,
  computed,
  signal,
  input,
  inject,
  DOCUMENT,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild
} from '@angular/core';
import { HIGHEST_NUMBER, LOWEST_NUMBER, isLottoNumber } from '../../lotto/games';
import { Draw } from '../../lotto/draw';

@Component({
  selector: 'app-number-display',
  imports: [],
  templateUrl: './number-display.component.html',
  styleUrl: './number-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberDisplayComponent {
  readonly winningNumbers = input<Draw | null>(null);
  readonly inputNumber = signal<number | undefined>(undefined);
  readonly userNumbers = signal<number[]>([]);
  readonly editingRowIndex = signal<number | null>(null);

  private readonly document = inject(DOCUMENT);
  private readonly numberInput = viewChild<ElementRef<HTMLInputElement>>('numberInput');

  matchingNumbers = computed(() => {
    if (!this.winningNumbers()?.length) return [];

    return this.userNumbers().filter((num) => this.isMatching(num));
  });

  userNumberRows = computed(() => {
    const numbers = this.userNumbers();
    const rows: number[][] = [];

    for (let i = 0; i < numbers.length; i += 6) {
      rows.push(numbers.slice(i, i + 6));
    }

    return rows;
  });

  readonly rowLabels = computed(() => {
    const rows = this.userNumberRows();
    return rows.map((_, index) => this.generateRowLabel(index));
  });

  readonly matchesPerRow = computed(() => {
    if (!this.winningNumbers()?.length) return [];

    return this.userNumberRows().map(
      (row) => row.filter((num) => this.isMatching(num)).length
    );
  });

  readonly highestMatchCount = computed(() => {
    const matches = this.matchesPerRow();
    return matches.length > 0 ? Math.max(...matches) : 0;
  });

  readonly rowsWithHighestMatches = computed(() => {
    const highest = this.highestMatchCount();
    return this.matchesPerRow().map((count) => count === highest && count > 0);
  });

  protected readonly lowest = LOWEST_NUMBER;
  protected readonly highest = HIGHEST_NUMBER;

  readonly isInputValid = computed(() => isLottoNumber(this.inputNumber()));

  /** Takes the entry field's text; an empty field means no number. */
  setNumberInput(value: string): void {
    this.inputNumber.set(value === '' ? undefined : Number(value));

    if (this.isInputValid() && `${value}`.length > 1) {
      this.addNumber();
    }
  }

  addNumber(): void {
    const num = this.inputNumber();

    if (isLottoNumber(num)) {
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
        this.userNumbers.update((nums) => [...nums, numValue]);
      }

      this.inputNumber.set(undefined);
      // [value] only writes to the field when its value changes between checks. A number pasted in one go goes
      // undefined -> 17 -> undefined within one event, so the binding never sees a change: clear the field here.
      const field = this.numberInput()?.nativeElement;
      if (field) field.value = '';
    }
  }

  clearNumbers(): void {
    this.userNumbers.set([]);
  }

  isMatching(num: number): boolean {
    return this.winningNumbers()?.includes(num) ?? false;
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

    this.userNumbers.update((numbers) => {
      const newNumbers = [...numbers];
      newNumbers.splice(
        startIndex,
        Math.min(rowsPerPage, newNumbers.length - startIndex)
      );
      return newNumbers;
    });
  }

  deleteNumber(rowIndex: number, numberIndex: number): void {
    const actualIndex = rowIndex * 6 + numberIndex;
    this.userNumbers.update((numbers) => {
      const newNumbers = [...numbers];
      newNumbers.splice(actualIndex, 1);
      return newNumbers;
    });
  }

  isEditingRow(rowIndex: number): boolean {
    return this.editingRowIndex() === rowIndex;
  }

  editNumber(rowIndex: number, numberIndex: number): void {
    const actualIndex = rowIndex * 6 + numberIndex;
    const currentValue = this.userNumbers()[actualIndex];

    // Use prompt dialog for editing
    const newValueStr = this.document.defaultView?.prompt(
      'Edit number:',
      currentValue.toString()
    );
    if (!newValueStr) return; // User cancelled

    const newValue = parseInt(newValueStr, 10);

    // Validate input
    if (!isLottoNumber(newValue)) {
      alert(`Please enter a valid number between ${LOWEST_NUMBER} and ${HIGHEST_NUMBER}`);
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
      this.document.defaultView?.alert(
        'This number already exists in the current row'
      );
      return;
    }

    // Update the number
    this.userNumbers.update((numbers) => {
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
