import { Draw } from '../lotto/draw';

/** One draw from PCSO's results page. */
export interface LottoResult {
  game: string;
  /** The winning numbers as PCSO's page shows them, such as "05-12-23-34-45-56". */
  combinations: string;
  /** The same numbers as a draw, or null if the page's numbers aren't one. */
  draw: Draw | null;
  drawDate: Date;
  jackpot: string;
  winners: string;
}
