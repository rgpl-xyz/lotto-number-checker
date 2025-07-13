export interface LottoResult {
  game: string;
  combinations: string;
  drawDate: Date;
  jackpot: string;
  winners: string;
}

export interface GameSelectionOption {
  label: string;
  value: number;
}

export const GAME_SELECTION_OPTIONS = [
  {
    label: 'All Games',
    value: 0,
  },
  {
    label: 'Ultra Lotto 6/58',
    value: 18,
  },
  {
    label: 'Grand Lotto 6/55',
    value: 17,
  },
  {
    label: 'Superlotto 6/49',
    value: 1,
  },
  {
    label: 'Megalotto 6/45',
    value: 2,
  },
  {
    label: 'Lotto 6/42',
    value: 13,
  },
] satisfies GameSelectionOption[];
