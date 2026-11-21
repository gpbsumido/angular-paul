import { AbstractControl, ValidationErrors } from '@angular/forms';

// [ng-08 forms] A validator is a plain function: control in, errors or null
// out. Validators.required only rejects '' (and null), so "   " passes it.
// That's how a contact message of nothing but spaces got through.
//
// Return a small object keyed by the error name. Templates check it with
// control.hasError('blank'), so the key is part of the API: name it for what
// is wrong, not for the validator.
export function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() === '' ? { blank: true } : null;
}
