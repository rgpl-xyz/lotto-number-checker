import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { DigitsOnlyDirective } from './digits-only.directive';

@Component({
  imports: [DigitsOnlyDirective],
  template: `<input type="number" appDigitsOnly />`,
})
class FieldHost {}

describe('DigitsOnlyDirective', () => {
  let field: HTMLInputElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    const fixture = TestBed.createComponent(FieldHost);
    await fixture.whenStable();
    field = (fixture.nativeElement as HTMLElement).querySelector('input')!;
  });

  function typed(data: string): boolean {
    const event = new InputEvent('beforeinput', { data, inputType: 'insertText', cancelable: true });
    field.dispatchEvent(event);
    return !event.defaultPrevented;
  }

  it('lets digits in', () => {
    expect(typed('5')).toBe(true);
    expect(typed('42')).toBe(true);
  });

  it('keeps out letters and the signs a number field would take', () => {
    expect(['a', 'e', '+', '-', '.', '1e3', '4,5'].map(typed)).toEqual([
      false, false, false, false, false, false, false,
    ]);
  });

  it('asks phones for their number pad', () => {
    expect(field.getAttribute('inputmode')).toBe('numeric');
  });
});
