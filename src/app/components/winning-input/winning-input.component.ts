import {
  Component,
  output,
  signal,
  input,
  effect,
  model,
  inject,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-winning-input',
  standalone: true,
  imports: [],
  templateUrl: './winning-input.component.html',
  styleUrl: './winning-input.component.scss',
})
export class WinningInputComponent {
  winningNumbersSet = output<number[]>();

  // Use model for two-way binding instead of input
  numbersToEdit = model<number[]>([]);

  // Use a single writable signal for the input values
  numberInputs = signal<(number | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);

  isValid = signal<boolean>(false);
  hasDuplicates = signal<boolean>(false);

  private document = inject(DOCUMENT);

  constructor() {
    // Create an effect to watch for changes to numbersToEdit
    effect(() => {
      const numbers = this.numbersToEdit();
      if (numbers && numbers.length === 6) {
        this.numberInputs.set([...numbers]);
        this.validateInputs();
      }
    });
  }

  updateNumber(index: number, value: string | number): void {
    const inputs = this.numberInputs();
    inputs[index] = value !== '' ? Number(value) : undefined;
    this.numberInputs.set(inputs);
    this.validateInputs();
  }

  parseInputString(event: ClipboardEvent): void {
    event.preventDefault();

    const paste = event.clipboardData?.getData('text');

    if (!paste) return;

    const numbers = paste
      .split(/[-,;\s]+/) // Support more delimiters: dash, comma, semicolon, whitespace
      .filter((s) => s.length > 0)
      .map((s) => parseInt(s, 10))
      .filter((num) => !isNaN(num) && num >= 1 && num <= 59)
      .slice(0, 6); // Limit to first 6 valid numbers

    if (numbers.length > 0) {
      // Get the input index from the event target
      const target = event.target as HTMLInputElement;
      const index = Array.from(target.parentElement?.children || []).indexOf(
        target
      );

      const newInputs = [...this.numberInputs()];
      for (let i = 0; i < numbers.length; i++) {
        const fillIndex = (index + i) % 6; // Start from the input where paste occurred
        newInputs[fillIndex] = numbers[i];
      }
      this.numberInputs.set(newInputs);
      this.validateInputs();

      this.submitWinningNumbers();
    }
  }

  validateInputs(): void {
    const inputs = this.numberInputs();

    if (inputs.includes(undefined)) {
      this.isValid.set(false);
      return;
    }

    const allInRange = inputs.every(
      (input) => Number(input) >= 1 && Number(input) <= 59
    );

    const uniqueValues = new Set(inputs);
    const hasDuplicates = uniqueValues.size < inputs.length;
    this.hasDuplicates.set(hasDuplicates);

    this.isValid.set(allInRange && !hasDuplicates);
  }

  submitWinningNumbers(): void {
    if (this.isValid()) {
      const numbers = this.numberInputs().map((num) => Number(num)) as number[];
      this.winningNumbersSet.emit(numbers);
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    if (index < 5) {
      // Move to next input
      const nextInput = this.document.getElementById(
        `number-input-${index + 1}`
      );
      nextInput?.focus();
    } else {
      // Last input, submit if valid
      if (this.isValid()) {
        this.submitWinningNumbers();
      }
    }
  }
}
