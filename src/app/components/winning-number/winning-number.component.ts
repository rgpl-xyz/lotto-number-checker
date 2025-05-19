import { Component, signal, model } from '@angular/core';
import { WinningInputComponent } from "../winning-input/winning-input.component";
import { NumberDisplayComponent } from "../number-display/number-display.component";

@Component({
  selector: 'app-winning-number',
  imports: [WinningInputComponent, NumberDisplayComponent],
  templateUrl: './winning-number.component.html',
  styleUrl: './winning-number.component.scss'
})
export class WinningNumberComponent {
  title = signal<string>('Lotto Number Matcher');
  winningNumbers = model<number[]>([]);
  isEditMode = signal<boolean>(true);

  setWinningNumbers(numbers: number[]): void {
    this.winningNumbers.set([...numbers]);
    this.isEditMode.set(false);
  }

  editWinningNumbers(): void {
    this.isEditMode.set(true);
  }
}
