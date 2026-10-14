import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
  OnInit,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { GameSelectionComponent } from '../game-selection/game-selection.component';
import { LottoResult } from '../../results/lotto-result';
import { LottoGame } from '../../lotto/games';
import { Draw } from '../../lotto/draw';
import { RecentResults } from '../../results/recent-results';

/** Recent PCSO results, filtered by game, any of which can become the winning numbers. */
@Component({
  selector: 'app-search-results',
  imports: [GameSelectionComponent, DatePipe],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnInit {
  readonly winningNumbersSet = output<Draw>();

  /** The game to list results for, or null for every game. */
  protected readonly selectedGame = signal<LottoGame | null>(null);

  private readonly recent = inject(RecentResults);

  protected readonly results = this.recent.results;
  protected readonly isLoading = this.recent.loading;
  protected readonly errorMessage = this.recent.error;
  protected readonly lastUpdated = this.recent.fetchedAt;

  protected readonly shownResults = computed(() => {
    const game = this.selectedGame();
    return game ? this.results().filter((result) => result.game === game.name) : this.results();
  });

  /** One short line for screen readers about what the panel shows. */
  protected readonly status = computed(() => {
    if (this.isLoading()) {
      return 'Loading results…';
    }
    const shown = this.shownResults().length;
    if (shown > 0) {
      return shown === 1 ? '1 result' : `${shown} results`;
    }
    if (this.results().length > 0) {
      return `No recent results for ${this.selectedGame()?.name}.`;
    }
    return this.errorMessage() ? '' : 'No results found.';
  });

  ngOnInit(): void {
    this.recent.load();
  }

  protected search(): void {
    this.recent.refresh();
  }

  protected setWinningNumbers(result: LottoResult): void {
    if (result.draw) {
      this.winningNumbersSet.emit(result.draw);
    }
  }
}
