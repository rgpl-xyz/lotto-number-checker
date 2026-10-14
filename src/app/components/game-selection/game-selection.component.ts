import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { LOTTO_GAMES, LottoGame, gameNamed } from '../../lotto/games';

@Component({
  selector: 'app-game-selection',
  imports: [],
  templateUrl: './game-selection.component.html',
  styleUrl: './game-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSelectionComponent {
  readonly games = LOTTO_GAMES;

  /** The chosen game, or null for all games. */
  readonly selectedGame = model<LottoGame | null>(null);

  onGameChange($event: Event) {
    const target = $event.target as HTMLSelectElement;
    this.selectedGame.set(gameNamed(target.value) ?? null);
  }
}
