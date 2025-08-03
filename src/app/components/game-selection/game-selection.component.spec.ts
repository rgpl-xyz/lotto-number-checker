import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, beforeEach, expect } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';

import { GameSelectionComponent } from './game-selection.component';

describe('GameSelectionComponent', () => {
  let component: GameSelectionComponent;
  let fixture: ComponentFixture<GameSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameSelectionComponent],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameSelectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
