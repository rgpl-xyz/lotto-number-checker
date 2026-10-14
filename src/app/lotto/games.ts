/** A PCSO six-number lotto game, named as PCSO's results page names it. */
export interface LottoGame {
  readonly name: string;
  /** Each draw is six different numbers from 1 to this. */
  readonly highestNumber: number;
}

export const LOTTO_GAMES: readonly LottoGame[] = [
  { name: 'Ultra Lotto 6/58', highestNumber: 58 },
  { name: 'Grand Lotto 6/55', highestNumber: 55 },
  { name: 'Superlotto 6/49', highestNumber: 49 },
  { name: 'Megalotto 6/45', highestNumber: 45 },
  { name: 'Lotto 6/42', highestNumber: 42 },
];

/** Every game draws six numbers, so a ticket row holds six too. */
export const NUMBERS_PER_DRAW = 6;

export const LOWEST_NUMBER = 1;

/**
 * The highest number any game draws. The app doesn't ask which game a ticket is
 * for, so every number is checked against this.
 */
export const HIGHEST_NUMBER = Math.max(...LOTTO_GAMES.map((game) => game.highestNumber));

/** Whether some game can draw this number. */
export function isLottoNumber(value: number | null | undefined): value is number {
  return (
    value != null &&
    Number.isInteger(value) &&
    value >= LOWEST_NUMBER &&
    value <= HIGHEST_NUMBER
  );
}

export function gameNamed(name: string): LottoGame | undefined {
  return LOTTO_GAMES.find((game) => game.name === name);
}
