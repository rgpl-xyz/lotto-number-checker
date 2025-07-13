import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GameSelectionComponent } from '../game-selection/game-selection.component';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { LottoService } from '../../services/lotto.service';
import {
  GAME_SELECTION_OPTIONS,
  GameSelectionOption,
} from '../../models/lotto.model';

@Component({
  selector: 'app-search-results',
  imports: [FormsModule, GameSelectionComponent, DatePipe],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent implements OnInit {
  readonly winningNumbersSet = output<number[]>();

  readonly selectedGame = signal<GameSelectionOption>(
    GAME_SELECTION_OPTIONS[0]
  );

  readonly lottoService = inject(LottoService);

  readonly lottoResults = this.lottoService.cachedResults;
  readonly isLoading = this.lottoService.isLoading;
  readonly errorMessage = this.lottoService.error;

  readonly lastUpdated = computed(() => {
    const timestamp = this.lottoService.cacheTimestamp();
    return timestamp ? new Date(timestamp) : null;
  });

  readonly hasCachedData = this.lottoService.hasCachedData;

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadResults();
  }

  searchResults(): void {
    const forceRefresh = this.hasCachedData();
    this.lottoService
      .getLottoResults(forceRefresh)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  loadResults(): void {
    this.lottoService
      .getLottoResults()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  refreshResults(): void {
    this.lottoService
      .refreshResults()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  setWinningNumbers(combinations: string) {
    this.winningNumbersSet.emit(combinations.split('-').map(Number));
  }
}
