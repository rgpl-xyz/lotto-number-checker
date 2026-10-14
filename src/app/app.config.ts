import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ResultsSource } from './results/results-source';
import { PcsoResultsSource } from './results/pcso-results-source';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    { provide: ResultsSource, useClass: PcsoResultsSource },
  ],
};
