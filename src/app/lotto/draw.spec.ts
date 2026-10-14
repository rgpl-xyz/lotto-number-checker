import { describe, expect, it } from 'vitest';
import { drawProblem, numbersIn, toDraw } from './draw';
import { gameNamed } from './games';

describe('toDraw', () => {
  it('accepts six different numbers from 1 to 58, in the order given', () => {
    expect(toDraw([42, 4, 8, 15, 16, 23])).toEqual([42, 4, 8, 15, 16, 23]);
    expect(toDraw([1, 2, 3, 56, 57, 58])).toEqual([1, 2, 3, 56, 57, 58]);
  });

  it('gives a draw that cannot be changed afterwards', () => {
    const numbers = [4, 8, 15, 16, 23, 42];
    const draw = toDraw(numbers);

    numbers[0] = 5;

    expect(draw?.[0]).toBe(4);
    expect(Object.isFrozen(draw)).toBe(true);
  });

  it('rejects anything but six numbers', () => {
    expect(toDraw([4, 8, 15, 16, 23])).toBeNull();
    expect(toDraw([4, 8, 15, 16, 23, 42, 7])).toBeNull();
    expect(toDraw([4, 8, 15, 16, 23, null])).toBeNull();
    expect(toDraw([])).toBeNull();
  });

  it('leaves empty entries out of the draw', () => {
    expect(toDraw([4, null, 8, 15, 16, 23, 42])).toEqual([4, 8, 15, 16, 23, 42]);
  });

  it('rejects numbers no game draws', () => {
    expect(toDraw([4, 8, 15, 16, 23, 59])).toBeNull();
    expect(toDraw([0, 8, 15, 16, 23, 42])).toBeNull();
    expect(toDraw([4.5, 8, 15, 16, 23, 42])).toBeNull();
  });

  it('rejects a number drawn twice', () => {
    expect(toDraw([4, 8, 15, 16, 23, 4])).toBeNull();
  });

  it("checks against a game's own highest number when given the game", () => {
    const megalotto = gameNamed('Megalotto 6/45');

    expect(toDraw([1, 2, 3, 4, 5, 45], megalotto)).toEqual([1, 2, 3, 4, 5, 45]);
    expect(toDraw([1, 2, 3, 4, 5, 50], megalotto)).toBeNull();
    expect(toDraw([1, 2, 3, 4, 5, 50])).toEqual([1, 2, 3, 4, 5, 50]);
  });
});

describe('drawProblem', () => {
  it('names what is wrong, a repeat first', () => {
    expect(drawProblem([4, 8, 15, 16, 23, 42])).toBeNull();
    expect(drawProblem([4, 4, 99, null, null, null])).toBe('duplicate');
    expect(drawProblem([4, 8, 99, null, null, null])).toBe('out-of-range');
    expect(drawProblem([4, 8, 15, null, null, null])).toBe('wrong-count');
  });

  it('does not count empty entries as repeats', () => {
    expect(drawProblem([4, null, null, null, null, null])).toBe('wrong-count');
  });
});

describe('numbersIn', () => {
  it('reads PCSO-style combinations', () => {
    expect(numbersIn('09-15-39-01-42-27')).toEqual([9, 15, 39, 1, 42, 27]);
  });

  it('reads numbers separated by commas, semicolons or white space', () => {
    expect(numbersIn(' 9, 15;39\t1\n42  27 ')).toEqual([9, 15, 39, 1, 42, 27]);
  });

  it('skips parts that are not numbers', () => {
    expect(numbersIn('abc')).toEqual([]);
    expect(numbersIn('')).toEqual([]);
    expect(numbersIn('4, x, 8')).toEqual([4, 8]);
  });

  it('skips parts that only start with a number, such as a game name or a date', () => {
    expect(numbersIn('Ultra Lotto 6/58 05-12-23-34-45-56 10/12/2026')).toEqual([
      5, 12, 23, 34, 45, 56,
    ]);
    expect(numbersIn('1e5 3.7 12abc 7')).toEqual([7]);
  });
});
