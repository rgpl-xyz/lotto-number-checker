import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { numbersIn, toDraw } from '../lotto/draw';
import { gameNamed } from '../lotto/games';
import { LottoResult } from './lotto-result';
import { ResultsSource } from './results-source';

/**
 * Reads PCSO's results page through the dev-server proxy in proxy.conf.json.
 * Only the six-number games in the catalog are kept, and each result's numbers
 * are checked against its own game. Errors when the page can't be fetched or PCSO
 * serves its ASP.NET error page instead.
 */
@Injectable()
export class PcsoResultsSource implements ResultsSource {
  private readonly http = inject(HttpClient);

  latest(): Observable<readonly LottoResult[]> {
    return this.http.get('/api/SearchLottoResult.aspx', { responseType: 'text' }).pipe(
      map((html) => {
        if (html.includes('Runtime Error') || html.includes('Server Error')) {
          throw new Error('PCSO served its error page');
        }
        return parseResults(html);
      })
    );
  }
}

function parseResults(html: string): LottoResult[] {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rows = doc.querySelectorAll('#cphContainer_cpContent_GridView1 tr:not(:first-child)');

  return Array.from(rows).flatMap((row) => {
    const cells = row.querySelectorAll('td');
    const game = gameNamed(cells[0]?.textContent?.trim() || '');
    if (!game) {
      return [];
    }
    const combinations = cells[1].textContent || '';
    return [
      {
        game: game.name,
        combinations,
        draw: toDraw(numbersIn(combinations), game),
        drawDate: new Date(cells[2].textContent?.trim() || ''),
        jackpot: cells[3].textContent || '0',
        winners: cells[4].textContent?.trim() || '0',
      },
    ];
  });
}
