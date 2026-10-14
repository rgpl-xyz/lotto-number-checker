import {
  Component,
  computed,
  signal,
  input,
  inject,
  DOCUMENT,
  ChangeDetectionStrategy,
  ElementRef,
  Injector,
  afterNextRender,
  viewChild,
  viewChildren
} from '@angular/core';
import { NumberBallComponent } from '../number-ball/number-ball.component';
import {
  HIGHEST_NUMBER,
  LOWEST_NUMBER,
  NUMBERS_PER_DRAW,
  isLottoNumber,
  rangeMessage,
} from '../../lotto/games';
import { DigitsOnlyDirective } from '../digits-only.directive';
import { Draw } from '../../lotto/draw';
import {
  EMPTY_TICKET,
  Ticket,
  addNumber,
  checkTicket,
  deleteRow,
  replaceNumber,
  rowHolding,
  rowLabel,
} from '../../lotto/ticket';

/** The player's ticket: an entry field, the rows checked against the draw, and row editing. */
@Component({
  selector: 'app-number-display',
  imports: [NumberBallComponent, DigitsOnlyDirective],
  templateUrl: './number-display.component.html',
  styleUrl: './number-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberDisplayComponent {
  readonly winningNumbers = input<Draw | null>(null);

  protected readonly lowest = LOWEST_NUMBER;
  protected readonly highest = HIGHEST_NUMBER;

  protected readonly inputNumber = signal<number | undefined>(undefined);
  protected readonly ticket = signal<Ticket>(EMPTY_TICKET);
  /** The row whose numbers can be changed, if any. */
  protected readonly editingRow = signal<number | null>(null);

  protected readonly checked = computed(() => checkTicket(this.ticket(), this.winningNumbers()));

  /** For each row, the places still empty, drawn as empty balls. */
  protected readonly emptySlots = computed(() =>
    this.checked().rows.map((row) =>
      Array.from({ length: NUMBERS_PER_DRAW - row.numbers.length }, (_, slot) => slot)
    )
  );

  /** Names the best row, as "Best row: B, with 4 matches.", or every row in a tie. */
  protected readonly bestSummary = computed(() => {
    const { rows, bestMatches } = this.checked();
    const labels = rows.filter((row) => row.best).map((row) => row.label);
    if (labels.length === 0) return '';
    const matches = `${bestMatches} ${bestMatches === 1 ? 'match' : 'matches'}`;
    if (labels.length === 1) return `Best row: ${labels[0]}, with ${matches}.`;
    const names = `${labels.slice(0, -1).join(', ')} and ${labels.at(-1)}`;
    return `Best rows: ${names}, with ${matches} each.`;
  });
  protected readonly isInputValid = computed(() => isLottoNumber(this.inputNumber()));

  /** The entry field's text, and whether it has been left since it was typed in. */
  private readonly entryText = signal('');
  protected readonly entryLeft = signal(false);
  /** Set when the number typed is already in the row it would go into. */
  private readonly repeatMessage = signal<string | null>(null);

  /**
   * What is wrong with the number in the entry field. Out of range counts once it has two
   * digits or the field is left, so the 0 on the way to "05" isn't flagged.
   */
  protected readonly entryMessage = computed(() => {
    const repeat = this.repeatMessage();
    if (repeat) return repeat;
    const value = this.inputNumber();
    if (value === undefined || isLottoNumber(value)) return '';
    return this.entryLeft() || this.entryText().length >= 2 ? rangeMessage(value) : '';
  });

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly numberInput = viewChild<ElementRef<HTMLInputElement>>('numberInput');
  private readonly pencils = viewChildren<ElementRef<HTMLButtonElement>>('pencil');
  private readonly editButtons = viewChildren<ElementRef<HTMLButtonElement>>('editButton');

  /**
   * Takes the entry field's text. A number with as many digits as the highest one
   * can't grow any further, so it is added as soon as it is typed.
   */
  protected setNumberInput(value: string): void {
    this.inputNumber.set(value === '' ? undefined : Number(value));
    this.entryText.set(value);
    this.entryLeft.set(false);
    this.repeatMessage.set(null);

    if (this.isInputValid() && value.length >= String(HIGHEST_NUMBER).length) {
      this.addNumber();
    }
  }

  protected addNumber(): void {
    const value = this.inputNumber();
    if (!isLottoNumber(value)) return;

    // A repeat isn't added; it stays in the field, with the reason said below it.
    const holding = rowHolding(this.ticket(), value);
    if (holding !== null) {
      this.repeatMessage.set(`${value} is already in row ${rowLabel(holding)}.`);
      return;
    }

    this.ticket.update((ticket) => addNumber(ticket, value));
    this.inputNumber.set(undefined);
    this.entryText.set('');
    // [value] only writes to the field when its value changes between checks. A number pasted in one go goes
    // undefined -> 17 -> undefined within one event, so the binding never sees a change: clear the field here.
    const field = this.numberInput()?.nativeElement;
    if (field) field.value = '';
  }

  protected clearNumbers(): void {
    this.ticket.set(EMPTY_TICKET);
    this.repeatMessage.set(null);
    this.editingRow.set(null);
  }

  protected editRow(rowIndex: number): void {
    this.editingRow.set(rowIndex);
    // Edit gives way to the pencils, so focus moves to the first of them.
    afterNextRender(() => this.pencils()[0]?.nativeElement.focus(), { injector: this.injector });
  }

  protected finishEditing(): void {
    const rowIndex = this.editingRow();
    this.editingRow.set(null);
    if (rowIndex !== null) {
      // Done gives way to Edit again, so focus goes back to that row's Edit.
      afterNextRender(() => this.editButtons()[rowIndex]?.nativeElement.focus(), {
        injector: this.injector,
      });
    }
  }

  protected deleteRow(rowIndex: number): void {
    this.ticket.update((ticket) => deleteRow(ticket, rowIndex));
    // Keep editing the same row: it moves up when a row above it goes.
    const editing = this.editingRow();
    if (editing === rowIndex) {
      this.editingRow.set(null);
    } else if (editing !== null && editing > rowIndex) {
      this.editingRow.set(editing - 1);
    }
  }

  protected editNumber(rowIndex: number, position: number): void {
    const view = this.document.defaultView;
    const current = this.ticket()[rowIndex][position];
    const answer = view?.prompt('Edit number:', String(current));
    if (!answer) return; // cancelled

    const result = replaceNumber(this.ticket(), rowIndex, position, Number(answer));
    if ('problem' in result) {
      view?.alert(
        result.problem === 'duplicate'
          ? 'This number already exists in the current row'
          : `Please enter a valid number between ${LOWEST_NUMBER} and ${HIGHEST_NUMBER}`
      );
      return;
    }
    this.ticket.set(result.ticket);
  }
}
