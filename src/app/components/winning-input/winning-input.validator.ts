import {
  AbstractControl,
  FormArray,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { drawProblem } from '../../lotto/draw';
import { isLottoNumber } from '../../lotto/games';

/** One winning number field: empty, or a number some game draws. */
export const lottoNumber: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null =>
  control.value == null || isLottoNumber(control.value) ? null : { lottoNumber: true };

/** All the winning number fields together: no number entered twice. */
export const differentNumbers: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const values = (control as FormArray).controls.map(
    (field) => field.value as number | null
  );
  return drawProblem(values) === 'duplicate' ? { duplicate: true } : null;
};
