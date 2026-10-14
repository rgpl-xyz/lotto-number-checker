import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { GameSelectionComponent } from './game-selection.component';
import { gameNamed } from '../../lotto/games';

describe('GameSelectionComponent', () => {
  let component: GameSelectionComponent;
  let fixture: ComponentFixture<GameSelectionComponent>;
  let select: HTMLSelectElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSelectionComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSelectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    select = fixture.nativeElement.querySelector('select');
  });

  it('offers All Games and every game in the catalog', () => {
    expect(Array.from(select.options).map((option) => option.text)).toEqual([
      'All Games',
      'Ultra Lotto 6/58',
      'Grand Lotto 6/55',
      'Superlotto 6/49',
      'Megalotto 6/45',
      'Lotto 6/42',
    ]);
    expect(select.value).toBe('');
  });

  it('sets the chosen game, and null for All Games', async () => {
    select.value = 'Lotto 6/42';
    select.dispatchEvent(new Event('change'));
    expect(component.selectedGame()).toBe(gameNamed('Lotto 6/42'));

    select.value = '';
    select.dispatchEvent(new Event('change'));
    expect(component.selectedGame()).toBeNull();
  });

  it('shows a game chosen elsewhere', async () => {
    fixture.componentRef.setInput('selectedGame', gameNamed('Megalotto 6/45'));
    await fixture.whenStable();

    expect(select.value).toBe('Megalotto 6/45');
  });
});
