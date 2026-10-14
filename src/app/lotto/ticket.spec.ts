import { describe, expect, it } from 'vitest';
import { toDraw } from './draw';
import {
  EMPTY_TICKET,
  Ticket,
  addNumber,
  checkTicket,
  deleteRow,
  rowHolding,
  replaceNumber,
  rowLabel,
} from './ticket';

const DRAW = toDraw([1, 2, 3, 4, 5, 6]);

function ticketOf(...numbers: number[]): Ticket {
  return numbers.reduce(addNumber, EMPTY_TICKET);
}

describe('addNumber', () => {
  it('fills rows of six in the order the numbers come', () => {
    expect(ticketOf(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)).toEqual([
      [1, 2, 3, 4, 5, 6],
      [7, 8, 9, 10],
    ]);
  });

  it('ignores a number already in the row being filled', () => {
    expect(ticketOf(10, 20, 30, 40, 50, 10)).toEqual([[10, 20, 30, 40, 50]]);
  });

  it('takes a number again in a new row', () => {
    expect(ticketOf(10, 20, 30, 40, 50, 58, 10)).toEqual([[10, 20, 30, 40, 50, 58], [10]]);
  });

  it('ignores numbers no game draws', () => {
    expect(ticketOf(0, 59, 1.5, Number.NaN, 7)).toEqual([[7]]);
  });

  it('leaves the ticket it is given unchanged', () => {
    const ticket = ticketOf(1, 2, 3);

    addNumber(ticket, 4);

    expect(ticket).toEqual([[1, 2, 3]]);
  });
});

describe('replaceNumber', () => {
  const ticket = ticketOf(1, 2, 3, 4, 5, 6, 7, 8, 9);

  it('puts the new number in place of the old one', () => {
    expect(replaceNumber(ticket, 1, 2, 42)).toEqual({
      ticket: [
        [1, 2, 3, 4, 5, 6],
        [7, 8, 42],
      ],
    });
  });

  it('refuses a number no game draws', () => {
    expect(replaceNumber(ticket, 0, 0, 59)).toEqual({ problem: 'out-of-range' });
    expect(replaceNumber(ticket, 0, 0, Number.NaN)).toEqual({ problem: 'out-of-range' });
  });

  it('refuses a number already elsewhere in the same row', () => {
    expect(replaceNumber(ticket, 0, 0, 6)).toEqual({ problem: 'duplicate' });
  });

  it('throws for a row or position the ticket does not have', () => {
    expect(() => replaceNumber(ticket, 5, 0, 1)).toThrow(RangeError);
    expect(() => replaceNumber(ticket, 1, 3, 1)).toThrow(RangeError);
    expect(() => replaceNumber(ticket, 0, 1.5, 1)).toThrow(RangeError);
    expect(() => replaceNumber(ticket, 0, -1, 1)).toThrow(RangeError);
  });

  it('takes a number that is only in another row, or the number already there', () => {
    expect(replaceNumber(ticket, 1, 0, 1)).toEqual({
      ticket: [
        [1, 2, 3, 4, 5, 6],
        [1, 8, 9],
      ],
    });
    expect(replaceNumber(ticket, 1, 0, 7)).toEqual({ ticket });
  });
});

describe('deleteRow', () => {
  it('removes the row and moves the later rows up', () => {
    const ticket = ticketOf(1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 16, 21, 22);

    expect(deleteRow(ticket, 0)).toEqual([
      [11, 12, 13, 14, 15, 16],
      [21, 22],
    ]);
    expect(deleteRow(ticket, 2)).toEqual([
      [1, 2, 3, 4, 5, 6],
      [11, 12, 13, 14, 15, 16],
    ]);
  });

  it('starts a new row after the last full one once a short row is deleted', () => {
    const ticket = deleteRow(ticketOf(1, 2, 3, 4, 5, 6, 11, 12), 1);

    expect(addNumber(ticket, 1)).toEqual([[1, 2, 3, 4, 5, 6], [1]]);
  });
});

describe('rowLabel', () => {
  it('names rows A to Z, then A1 to Z1, A2 and on', () => {
    expect([0, 1, 25, 26, 51, 52].map(rowLabel)).toEqual(['A', 'B', 'Z', 'A1', 'Z1', 'A2']);
  });
});

describe('checkTicket', () => {
  it('marks the matching numbers in every row', () => {
    const checked = checkTicket(ticketOf(1, 2, 10, 11, 12, 13, 3), DRAW);

    expect(checked.rows.map((row) => row.numbers.filter((n) => n.matching).map((n) => n.value)))
      .toEqual([[1, 2], [3]]);
    expect(checked.rows.map((row) => row.matches)).toEqual([2, 1]);
    expect(checked.rows.map((row) => row.label)).toEqual(['A', 'B']);
  });

  it('picks every row with the most matches as best', () => {
    const checked = checkTicket(
      ticketOf(1, 2, 10, 11, 12, 13, 1, 2, 3, 4, 20, 21, 10, 11, 12, 13, 14, 15, 1, 2, 3, 4, 30, 31),
      DRAW
    );

    expect(checked.rows.map((row) => row.best)).toEqual([false, true, false, true]);
    expect(checked.bestMatches).toBe(4);
  });

  it('has no best row when nothing matches', () => {
    const checked = checkTicket(ticketOf(10, 11, 12, 13, 14, 15), DRAW);

    expect(checked.rows.map((row) => row.best)).toEqual([false]);
    expect(checked.bestMatches).toBe(0);
  });

  it('matches nothing before there is a draw', () => {
    const checked = checkTicket(ticketOf(1, 2, 3), null);

    expect(checked.rows[0].numbers.every((n) => !n.matching)).toBe(true);
    expect(checked.bestMatches).toBe(0);
  });

  it('checks an empty ticket', () => {
    expect(checkTicket(EMPTY_TICKET, DRAW)).toEqual({ rows: [], bestMatches: 0 });
  });
});

describe('rowHolding', () => {
  it('finds the row being filled when it already has the number', () => {
    const ticket: Ticket = [[1, 2, 3, 4, 5, 6], [7, 8]];

    expect(rowHolding(ticket, 8)).toBe(1);
    expect(rowHolding(ticket, 9)).toBeNull();
  });

  it('has nothing to say when a new number would start a new row', () => {
    expect(rowHolding([[1, 2, 3, 4, 5, 6]], 3)).toBeNull();
    expect(rowHolding(EMPTY_TICKET, 3)).toBeNull();
  });
});
