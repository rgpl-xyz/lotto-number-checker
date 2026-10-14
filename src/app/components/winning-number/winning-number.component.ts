import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { WinningInputComponent } from '../winning-input/winning-input.component';
import { NumberDisplayComponent } from '../number-display/number-display.component';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { NumberBallComponent } from '../number-ball/number-ball.component';
import { FEATURE_FLAGS } from '../../feature-flags';
import { Draw } from '../../lotto/draw';

@Component({
  selector: 'app-winning-number',
  imports: [WinningInputComponent, NumberDisplayComponent, SearchResultsComponent, NumberBallComponent],
  templateUrl: './winning-number.component.html',
  styleUrl: './winning-number.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinningNumberComponent {
  readonly title = signal<string>('Lotto Number Checker');
  readonly liveResults = inject(FEATURE_FLAGS).liveResults;
  readonly useSearch = signal(false);
  readonly winningNumbers = signal<Draw | null>(null);
  readonly isEditMode = signal<boolean>(true);

  setWinningNumbers(draw: Draw): void {
    this.winningNumbers.set(draw);
    this.isEditMode.set(false);
  }

  editWinningNumbers(): void {
    this.useSearch.set(false);
    this.isEditMode.set(true);
  }
}
