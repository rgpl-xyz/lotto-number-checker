import { Directive } from '@angular/core';

/**
 * Lets only digits be typed or pasted into a number field. On its own a number field
 * takes "e", "+", "-" and "." in Chrome and any letter in Firefox, then quietly reads as
 * empty. Phones show their number pad for it.
 */
@Directive({
  selector: 'input[appDigitsOnly]',
  host: {
    inputmode: 'numeric',
    '(beforeinput)': 'onBeforeInput($event)',
  },
})
export class DigitsOnlyDirective {
  protected onBeforeInput(event: InputEvent): void {
    if (event.data && /\D/.test(event.data)) {
      event.preventDefault();
    }
  }
}
