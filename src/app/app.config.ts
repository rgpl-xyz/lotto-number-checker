import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { ResultsSource } from './results/results-source';
import { PcsoResultsSource } from './results/pcso-results-source';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    { provide: ResultsSource, useClass: PcsoResultsSource },
    // Takes over the page the build rendered instead of drawing it again. Without incremental
    // hydration, which this app doesn't use: it puts an inline script in the page, and the
    // site's CSP allows scripts only from its own files.
    provideClientHydration(withNoIncrementalHydration()),
  ],
};
