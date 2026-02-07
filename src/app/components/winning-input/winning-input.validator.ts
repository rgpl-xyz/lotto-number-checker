import {
  AbstractControl,
  FormArray,
  FormControl,
  ValidationErrors,
} from '@angular/forms';

export function noDuplicateNumbersValidator(
  control: AbstractControl
): ValidationErrors | null {
  const array = control as FormArray<FormControl<number | null>>;
  const values = array.controls
    .map((c) => c.value)
    .filter((v): v is number => v != null && !isNaN(v));
  const unique = new Set(values);
  return unique.size < values.length ? { duplicate: true } : null;
}
