import { describe, expect, it } from 'vitest';
import { HIGHEST_NUMBER, LOTTO_GAMES, gameNamed, isLottoNumber, rangeMessage } from './games';

describe('LOTTO_GAMES', () => {
  it('lists the PCSO six-number games by the names PCSO publishes results under', () => {
    expect(LOTTO_GAMES.map((game) => game.name)).toEqual([
      'Ultra Lotto 6/58',
      'Grand Lotto 6/55',
      'Superlotto 6/49',
      'Megalotto 6/45',
      'Lotto 6/42',
    ]);
  });

  it('finds a game by its name and nothing else', () => {
    expect(gameNamed('Megalotto 6/45')?.highestNumber).toBe(45);
    expect(gameNamed('4D Lotto')).toBeUndefined();
    expect(gameNamed('All Games')).toBeUndefined();
  });
});

describe('isLottoNumber', () => {
  it('goes up to 58, the highest number any game draws', () => {
    expect(HIGHEST_NUMBER).toBe(58);
    expect(isLottoNumber(58)).toBe(true);
    expect(isLottoNumber(59)).toBe(false);
  });

  it('starts at 1', () => {
    expect(isLottoNumber(1)).toBe(true);
    expect(isLottoNumber(0)).toBe(false);
    expect(isLottoNumber(-3)).toBe(false);
  });

  it('only accepts whole numbers', () => {
    expect(isLottoNumber(1.5)).toBe(false);
    expect(isLottoNumber(Number.NaN)).toBe(false);
    expect(isLottoNumber(null)).toBe(false);
    expect(isLottoNumber(undefined)).toBe(false);
  });
});

describe('rangeMessage', () => {
  it('says whether a number is too high or too low, and what the range is', () => {
    expect(rangeMessage(59)).toBe('59 is too high: numbers go from 1 to 58.');
    expect(rangeMessage(0)).toBe('0 is too low: numbers go from 1 to 58.');
  });

  it('says a fraction is not a whole number', () => {
    expect(rangeMessage(1.5)).toBe('1.5 is not a whole number.');
  });
});
