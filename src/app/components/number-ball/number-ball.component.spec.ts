import { ChangeDetectionStrategy, Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { NumberBallComponent } from './number-ball.component';

@Component({
  imports: [NumberBallComponent],
  template: `
    <app-number-ball [value]="7" />
    <app-number-ball [value]="23" look="winning" />
    <app-number-ball [value]="42" look="matching"><button>edit</button></app-number-ball>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class BallsHost {}

describe('NumberBallComponent', () => {
  async function render(): Promise<HTMLElement[]> {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(BallsHost);
    await fixture.whenStable();
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('app-number-ball'));
  }

  it('shows its number', async () => {
    const balls = await render();

    expect(balls.map((ball) => ball.firstChild?.textContent)).toEqual(['7', '23', '42']);
  });

  it('is plain unless it is a winning or matching number', async () => {
    const [plain, winning, matching] = await render();

    expect(plain.className).toBe('');
    expect(winning.className).toBe('winning');
    expect(matching.className).toBe('matching');
  });

  it('says in words that a matching number matches', async () => {
    const [plain, winning, matching] = await render();

    expect(matching.querySelector('.visually-hidden')?.textContent).toBe(' (match)');
    expect(plain.querySelector('.visually-hidden')).toBeNull();
    expect(winning.querySelector('.visually-hidden')).toBeNull();
  });

  it('shows content placed inside it after the number', async () => {
    const [, , withButton] = await render();

    expect(withButton.textContent).toBe('42 (match)edit');
    expect(withButton.lastElementChild?.tagName).toBe('BUTTON');
  });
});
