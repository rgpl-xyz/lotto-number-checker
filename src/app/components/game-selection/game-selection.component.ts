import { ChangeDetectionStrategy, Component, linkedSignal, model, signal } from '@angular/core';
import {
  GAME_SELECTION_OPTIONS,
  GameSelectionOption,
} from '../../models/lotto.model';

@Component({
  selector: 'app-game-selection',
  imports: [],
  templateUrl: './game-selection.component.html',
  styleUrl: './game-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameSelectionComponent {
  gameOptions = signal<GameSelectionOption[]>(GAME_SELECTION_OPTIONS);

  selectedGame = model.required<GameSelectionOption>();

  onGameChange($event: Event) {
    const target = $event.target as HTMLSelectElement;
    const selectedValue = target.value;
    const selectedOption = this.gameOptions().find(
      (option) => option.value === Number(selectedValue)
    );
    if (selectedOption) {
      this.selectedGame.set(selectedOption);
    }
  }
}
