import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** A plain number, a winning number, or one of the player's numbers that matches. */
export type BallLook = 'plain' | 'winning' | 'matching';

/**
 * One lotto number shown as a ball. Content placed inside it follows the number.
 * A matching ball also says so in words, for readers who can't see its colour.
 */
@Component({
  selector: 'app-number-ball',
  template: `{{ value() }}@if (look() === 'matching') {<span class="visually-hidden"> (match)</span>}<ng-content />`,
  styleUrl: './number-ball.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.winning]': "look() === 'winning'",
    '[class.matching]': "look() === 'matching'",
  },
})
export class NumberBallComponent {
  readonly value = input.required<number>();
  readonly look = input<BallLook>('plain');
}
