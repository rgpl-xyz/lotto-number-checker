import {
  Component,
  output,
  effect,
  model,
  inject,
  ChangeDetectionStrategy,
  DOCUMENT,
} from '@angular/core';
import {
  FormBuilder,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { noDuplicateNumbersValidator } from './winning-input.validator';

const MIN_NUMBER = 1;
const MAX_NUMBER = 59;
const NUM_COUNT = 6;

@Component({
  selector: 'app-winning-input',
  imports: [ReactiveFormsModule],
  templateUrl: './winning-input.component.html',
  styleUrl: './winning-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinningInputComponent {
  readonly winningNumbersSet = output<number[]>();

  readonly numbersToEdit = model<number[]>([]);

  private readonly fb = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);

  readonly form = this.fb.group({
    numbers: this.fb.array(
      Array.from(
        { length: NUM_COUNT },
        () =>
          new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(MIN_NUMBER),
            Validators.max(MAX_NUMBER),
          ])
      ),
      { validators: [noDuplicateNumbersValidator] }
    ),
  });

  get numbers(): FormArray<FormControl<number | null>> {
    return this.form.get('numbers') as FormArray<FormControl<number | null>>;
  }

  readonly controlIndices = [0, 1, 2, 3, 4, 5] as const;

  constructor() {
    effect(() => {
      const numbers = this.numbersToEdit();
      if (numbers?.length === NUM_COUNT) {
        this.numbers.patchValue([...numbers]);
      }
    });
  }

  parseInputString(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text');
    if (!paste) return;

    const parsed = paste
      .split(/[-,;\s]+/)
      .filter((s) => s.length > 0)
      .map((s) => parseInt(s, 10))
      .filter((num) => !isNaN(num) && num >= MIN_NUMBER && num <= MAX_NUMBER)
      .slice(0, NUM_COUNT);

    if (parsed.length > 0) {
      const values: (number | null)[] = [...parsed];
      while (values.length < NUM_COUNT) {
        values.push(null);
      }
      this.numbers.patchValue(values);
      if (parsed.length === NUM_COUNT && this.form.valid) {
        this.submitWinningNumbers();
      }
    }
  }

  submitWinningNumbers(): void {
    if (this.form.valid) {
      const values = this.numbers.value;
      const numbers = values.filter(
        (v): v is number => v != null && !isNaN(v)
      ) as number[];
      if (numbers.length === NUM_COUNT) {
        this.winningNumbersSet.emit(numbers);
      }
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (index < NUM_COUNT - 1) {
      const nextInput = this.document.getElementById(
        `number-input-${index + 1}`
      );
      nextInput?.focus();
    } else if (this.form.valid) {
      this.submitWinningNumbers();
    }
  }
}
