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
import {
  HIGHEST_NUMBER,
  LOWEST_NUMBER,
  NUMBERS_PER_DRAW,
  isLottoNumber,
} from '../../lotto/games';

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
        { length: NUMBERS_PER_DRAW },
        () =>
          new FormControl<number | null>(null, [
            Validators.required,
            Validators.min(LOWEST_NUMBER),
            Validators.max(HIGHEST_NUMBER),
          ])
      ),
      { validators: [noDuplicateNumbersValidator] }
    ),
  });

  get numbers(): FormArray<FormControl<number | null>> {
    return this.form.get('numbers') as FormArray<FormControl<number | null>>;
  }

  readonly controlIndices = Array.from({ length: NUMBERS_PER_DRAW }, (_, i) => i);
  protected readonly lowest = LOWEST_NUMBER;
  protected readonly highest = HIGHEST_NUMBER;

  constructor() {
    effect(() => {
      const numbers = this.numbersToEdit();
      if (numbers?.length === NUMBERS_PER_DRAW) {
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
      .filter(isLottoNumber)
      .slice(0, NUMBERS_PER_DRAW);

    if (parsed.length > 0) {
      const values: (number | null)[] = [...parsed];
      while (values.length < NUMBERS_PER_DRAW) {
        values.push(null);
      }
      this.numbers.patchValue(values);
      if (parsed.length === NUMBERS_PER_DRAW && this.form.valid) {
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
      if (numbers.length === NUMBERS_PER_DRAW) {
        this.winningNumbersSet.emit(numbers);
      }
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (index < NUMBERS_PER_DRAW - 1) {
      const nextInput = this.document.getElementById(
        `number-input-${index + 1}`
      );
      nextInput?.focus();
    } else if (this.form.valid) {
      this.submitWinningNumbers();
    }
  }
}
