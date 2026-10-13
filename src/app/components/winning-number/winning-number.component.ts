import { Component, signal, model, inject, ChangeDetectionStrategy } from '@angular/core';
import { WinningInputComponent } from '../winning-input/winning-input.component';
import { NumberDisplayComponent } from '../number-display/number-display.component';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { FEATURE_FLAGS } from '../../feature-flags';

@Component({
  selector: 'app-winning-number',
  imports: [WinningInputComponent, NumberDisplayComponent, SearchResultsComponent],
  templateUrl: './winning-number.component.html',
  styleUrl: './winning-number.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WinningNumberComponent {
  readonly title = signal<string>('Lotto Number Matcher');
  readonly liveResults = inject(FEATURE_FLAGS).liveResults;
  readonly useSearch = model<boolean>(false);
  readonly winningNumbers = model<number[]>([]);
  readonly isEditMode = signal<boolean>(true);

  setWinningNumbers(numbers: number[]): void {
    this.winningNumbers.set([...numbers]);
    this.isEditMode.set(false);
  }

  editWinningNumbers(): void {
    this.useSearch.set(false);
    this.isEditMode.set(true);
  }
}
