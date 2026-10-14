import { Draw } from './draw';
import { NUMBERS_PER_DRAW, isLottoNumber } from './games';

/** One row of a ticket: up to six different numbers. Only the last row can be short. */
export type Row = readonly number[];

/** A player's numbers, in rows of six filled in order. */
export type Ticket = readonly Row[];

export const EMPTY_TICKET: Ticket = [];

/**
 * Adds a number to the row being filled, or starts a new row when that one is
 * full. A number no game draws, or one already in the row being filled, is
 * ignored.
 */
export function addNumber(ticket: Ticket, value: number): Ticket {
  if (!isLottoNumber(value)) {
    return ticket;
  }
  const last = ticket.at(-1);
  if (!last || last.length === NUMBERS_PER_DRAW) {
    return [...ticket, [value]];
  }
  if (last.includes(value)) {
    return ticket;
  }
  return [...ticket.slice(0, -1), [...last, value]];
}

/** Why a number can't replace another. */
export type ReplaceProblem = 'out-of-range' | 'duplicate';

/**
 * Puts `value` in place of the number at `position` in row `rowIndex`, unless no
 * game draws it or the row already has it somewhere else. Throws a RangeError for
 * a place the ticket doesn't have.
 */
export function replaceNumber(
  ticket: Ticket,
  rowIndex: number,
  position: number,
  value: number
): { ticket: Ticket } | { problem: ReplaceProblem } {
  const row = ticket[rowIndex];
  if (!row || !Number.isInteger(position) || position < 0 || position >= row.length) {
    throw new RangeError(`The ticket has no number at row ${rowIndex}, position ${position}`);
  }
  if (!isLottoNumber(value)) {
    return { problem: 'out-of-range' };
  }
  if (row.some((number, index) => index !== position && number === value)) {
    return { problem: 'duplicate' };
  }
  const changed = row.map((number, index) => (index === position ? value : number));
  return { ticket: ticket.map((other, index) => (index === rowIndex ? changed : other)) };
}

/** The ticket without row `rowIndex`; the rows after it move up. */
export function deleteRow(ticket: Ticket, rowIndex: number): Ticket {
  return ticket.filter((_, index) => index !== rowIndex);
}

/** Row names: A to Z, then A1 to Z1, A2 and so on. */
export function rowLabel(index: number): string {
  const letter = String.fromCharCode('A'.charCodeAt(0) + (index % 26));
  const round = Math.floor(index / 26);
  return round === 0 ? letter : `${letter}${round}`;
}

export interface CheckedNumber {
  readonly value: number;
  readonly matching: boolean;
}

export interface CheckedRow {
  readonly label: string;
  readonly numbers: readonly CheckedNumber[];
  readonly matches: number;
  /** One of the rows with the most matches, when that is more than none. */
  readonly best: boolean;
}

export interface CheckedTicket {
  readonly rows: readonly CheckedRow[];
  readonly bestMatches: number;
}

/** Checks every row against the draw. With no draw yet, nothing matches. */
export function checkTicket(ticket: Ticket, draw: Draw | null): CheckedTicket {
  const rows = ticket.map((row, index) => {
    const numbers = row.map((value) => ({ value, matching: draw?.includes(value) ?? false }));
    return {
      label: rowLabel(index),
      numbers,
      matches: numbers.filter((number) => number.matching).length,
    };
  });
  const bestMatches = Math.max(0, ...rows.map((row) => row.matches));
  return {
    rows: rows.map((row) => ({ ...row, best: bestMatches > 0 && row.matches === bestMatches })),
    bestMatches,
  };
}
