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
import { HIGHEST_NUMBER, LOWEST_NUMBER, isLottoNumber } from '../../lotto/games';
import { Draw } from '../../lotto/draw';
import {
  EMPTY_TICKET,
  Ticket,
  addNumber,
  checkTicket,
  deleteRow,
  replaceNumber,
} from '../../lotto/ticket';

/** The player's ticket: an entry field, the rows checked against the draw, and row editing. */
@Component({
  selector: 'app-number-display',
  imports: [NumberBallComponent],
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
  protected readonly isInputValid = computed(() => isLottoNumber(this.inputNumber()));

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

    if (this.isInputValid() && value.length >= String(HIGHEST_NUMBER).length) {
      this.addNumber();
    }
  }

  protected addNumber(): void {
    const value = this.inputNumber();
    if (!isLottoNumber(value)) return;

    this.ticket.update((ticket) => addNumber(ticket, value));
    this.inputNumber.set(undefined);
    // [value] only writes to the field when its value changes between checks. A number pasted in one go goes
    // undefined -> 17 -> undefined within one event, so the binding never sees a change: clear the field here.
    const field = this.numberInput()?.nativeElement;
    if (field) field.value = '';
  }

  protected clearNumbers(): void {
    this.ticket.set(EMPTY_TICKET);
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
