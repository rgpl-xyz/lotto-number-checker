import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';

export interface FeatureFlags {
  /** Show the "Use Search Results" toggle that fetches live PCSO results. */
  readonly liveResults: boolean;
}

export const FEATURE_FLAGS = new InjectionToken<FeatureFlags>('FEATURE_FLAGS', {
  providedIn: 'root',
  factory: () => environment,
});
