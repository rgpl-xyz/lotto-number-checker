import { HIGHEST_NUMBER, LottoGame, NUMBERS_PER_DRAW, isLottoNumber, rangeMessage } from './games';

declare const checked: unique symbol;

/**
 * The winning numbers of one draw: six different numbers some game can draw.
 * Only `toDraw` makes one, so every Draw has been checked.
 */
export type Draw = readonly number[] & { readonly [checked]: true };

/** What keeps a set of numbers from being a draw. */
export type DrawProblem = 'duplicate' | 'out-of-range' | 'wrong-count';

/**
 * What keeps these numbers from being a draw, or null when they are one. Empty
 * entries count as missing numbers. Given a game, numbers above its highest are
 * out of range as well.
 */
export function drawProblem(
  numbers: readonly (number | null | undefined)[],
  game?: LottoGame
): DrawProblem | null {
  const present = numbers.filter((value) => value != null);
  if (new Set(present).size < present.length) {
    return 'duplicate';
  }
  const highest = game?.highestNumber ?? HIGHEST_NUMBER;
  if (!present.every((value) => isLottoNumber(value) && value <= highest)) {
    return 'out-of-range';
  }
  return present.length === NUMBERS_PER_DRAW ? null : 'wrong-count';
}

/** These numbers, empty entries left out, as a draw; or null if they aren't one. */
export function toDraw(
  numbers: readonly (number | null | undefined)[],
  game?: LottoGame
): Draw | null {
  if (drawProblem(numbers, game) !== null) {
    return null;
  }
  const present = numbers.filter((value): value is number => value != null);
  return Object.freeze(present) as unknown as Draw;
}

/**
 * The whole numbers in text such as "09-15-39-01-42-27" or "9, 15; 39", in order.
 * Numbers are separated by dashes, commas, semicolons or white space. Any other
 * piece, such as "6/58" or "1.5", is skipped rather than read in part.
 */
export function numbersIn(text: string): number[] {
  return text
    .split(/[-,;\s]+/)
    .filter((part) => /^\d+$/.test(part))
    .map(Number);
}

/** What is wrong with numbers being typed in as a draw, and which of them is at fault. */
export interface EntryProblem {
  readonly message: string;
  readonly positions: readonly number[];
}

/**
 * The first thing wrong with numbers typed so far: one that no game draws, then one
 * typed more than once. Empty entries are fine; there are just fewer numbers yet.
 */
export function entryProblem(numbers: readonly (number | null | undefined)[]): EntryProblem | null {
  const outOfRange = numbers.findIndex((value) => value != null && !isLottoNumber(value));
  if (outOfRange >= 0) {
    return { message: rangeMessage(numbers[outOfRange]!), positions: [outOfRange] };
  }
  for (const value of numbers) {
    if (value == null) continue;
    const positions = numbers.flatMap((other, at) => (other === value ? [at] : []));
    if (positions.length > 1) {
      const times = positions.length === 2 ? 'twice' : `${positions.length} times`;
      return { message: `${value} is entered ${times}.`, positions };
    }
  }
  return null;
}
