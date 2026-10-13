/**
 * Build-time flags for `ng build` (production). `ng serve` builds the development
 * configuration, which swaps in environment.development.ts (see fileReplacements
 * in angular.json).
 */
export const environment = {
  /** Live PCSO results go through the dev-server proxy, which only exists under `ng serve`. */
  liveResults: false,
};
