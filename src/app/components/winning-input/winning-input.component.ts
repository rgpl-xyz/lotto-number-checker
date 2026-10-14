import {
  Component,
  output,
  effect,
  input,
  inject,
  ChangeDetectionStrategy,
  DOCUMENT,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import {
  FormBuilder,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { differentNumbers, lottoNumber } from './winning-input.validator';
import { Draw, entryProblem, numbersIn, toDraw } from '../../lotto/draw';
import { DigitsOnlyDirective } from '../digits-only.directive';
import {
  HIGHEST_NUMBER,
  LOWEST_NUMBER,
  NUMBERS_PER_DRAW,
  isLottoNumber,
} from '../../lotto/games';

@Component({
  selector: 'app-winning-input',
  imports: [ReactiveFormsModule, DigitsOnlyDirective],
  templateUrl: './winning-input.component.html',
  styleUrl: './winning-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinningInputComponent {
  readonly winningNumbersSet = output<Draw>();

  /** A draw to start from, such as the one being edited. */
  readonly numbersToEdit = input<Draw | null>(null);

  private readonly fb = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);

  readonly form = this.fb.group({
    numbers: this.fb.array(
      Array.from(
        { length: NUMBERS_PER_DRAW },
        () => new FormControl<number | null>(null, [Validators.required, lottoNumber])
      ),
      { validators: [differentNumbers] }
    ),
  });

  get numbers(): FormArray<FormControl<number | null>> {
    return this.form.get('numbers') as FormArray<FormControl<number | null>>;
  }

  readonly controlIndices = Array.from({ length: NUMBERS_PER_DRAW }, (_, i) => i);

  /**
   * Every change to each field, values and touched alike, for the problem below. The
   * fields' own events: the form reports touched only the first time any field is left.
   */
  private readonly fieldEvents = toSignal(merge(...this.numbers.controls.map((field) => field.events)));

  /**
   * What to tell the person typing, naming the number at fault. A number counts once its
   * field has two digits or has been left, so the 0 on the way to "05" isn't flagged.
   */
  protected readonly problem = computed(() => {
    this.fieldEvents();
    const settled = this.numbers.controls.map((field) =>
      field.value != null && (field.touched || String(field.value).length >= 2) ? field.value : null
    );
    return entryProblem(settled);
  });

  protected isFaulty(index: number): boolean {
    return this.problem()?.positions.includes(index) ?? false;
  }
  protected readonly lowest = LOWEST_NUMBER;
  protected readonly highest = HIGHEST_NUMBER;

  constructor() {
    effect(() => {
      const draw = this.numbersToEdit();
      if (draw) {
        this.numbers.patchValue([...draw]);
      }
    });
  }

  parseInputString(event: ClipboardEvent): void {
    event.preventDefault();
    const paste = event.clipboardData?.getData('text');
    if (!paste) return;

    // The first six numbers some game draws; anything else in the text is skipped.
    const parsed = numbersIn(paste).filter(isLottoNumber).slice(0, NUMBERS_PER_DRAW);

    if (parsed.length > 0) {
      const values: (number | null)[] = [...parsed];
      while (values.length < NUMBERS_PER_DRAW) {
        values.push(null);
      }
      this.numbers.patchValue(values);
      this.submitWinningNumbers();
    }
  }

  /** Sets the numbers as the winning numbers if they make a draw. */
  submitWinningNumbers(): void {
    const draw = toDraw(this.numbers.value);
    if (draw) {
      this.winningNumbersSet.emit(draw);
    }
  }

  handleKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (index < NUMBERS_PER_DRAW - 1) {
      this.document.getElementById(`number-input-${index + 1}`)?.focus();
    } else {
      this.submitWinningNumbers();
    }
  }
}
