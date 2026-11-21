import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';

/**
 * [ng-08 forms] A cross-field rule belongs on the group, not on either field:
 * "confirm must equal password" is about both, and a validator on confirm
 * alone wouldn't re-run when the password changes.
 */
const matchingPasswords: ValidatorFn = (group): ValidationErrors | null => {
  const { password, confirm } = group.value as { password: string; confirm: string };
  return confirm && password !== confirm ? { mismatch: true } : null;
};

@Component({
  selector: 'app-lesson-08-forms',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Lesson, LessonDemo, CodeBlock, Callout, InterviewQuestions, ReactiveFormsModule],
  template: `
    <app-lesson part="08">
      <h2>Simple</h2>
      <p>
        Angular has two form APIs. <strong>Template-driven</strong> forms put
        <code>ngModel</code> on inputs and let the template build the model. They're fine for a
        search box. <strong>Reactive</strong> forms build the model in TypeScript, as a tree of
        <code>FormGroup</code>, <code>FormControl</code> and <code>FormArray</code>, and bind
        inputs to it with <code>formControlName</code>. Most production apps use reactive forms:
        the logic is testable without a DOM, and the types follow the model.
      </p>
      <p>
        This site's contact form is a reactive form. Writing this lesson, I found three things
        wrong with it:
      </p>
      <ul>
        <li>a message of only spaces passed <code>Validators.required</code></li>
        <li>Send was disabled with no explanation</li>
        <li>its errors weren't connected to their fields for screen readers</li>
      </ul>
      <app-code-block label="src/app/apps/contact-app.ts" [code]="snippets.contact" />

      <h2>Intermediate</h2>
      <p>
        <strong>A validator is a function</strong> from a control to an errors object or
        <code>null</code>. <code>notBlank</code> is three lines and now guards the name and
        message. <strong>Cross-field rules go on the group.</strong> A
        <code>FormArray</code> holds a list whose length changes at runtime.
      </p>
      <app-lesson-demo heading="Try it: a group validator and a FormArray">
        <form [formGroup]="form" novalidate>
          <div class="demo-row">
            <label for="demo-password">Password (8+ characters)</label>
            <input id="demo-password" type="password" autocomplete="new-password" formControlName="password" />
          </div>
          <div class="demo-row">
            <label for="demo-confirm">Confirm password</label>
            <input
              id="demo-confirm"
              type="password"
              autocomplete="new-password"
              formControlName="confirm"
              [attr.aria-invalid]="showMismatch() || null"
              [attr.aria-describedby]="showMismatch() ? 'demo-mismatch' : null"
            />
          </div>
          @if (showMismatch()) {
            <p id="demo-mismatch" class="demo-error">Passwords don't match.</p>
          }
          <fieldset formArrayName="links" class="demo-links">
            <legend>Links (optional, https only)</legend>
            @for (link of form.controls.links.controls; track link; let index = $index) {
              <div class="demo-row demo-link-row">
                <label [for]="'demo-link-' + index">Link {{ index + 1 }}</label>
                <input [id]="'demo-link-' + index" type="url" [formControlName]="index" />
                <button
                  type="button"
                  class="demo-remove-link"
                  [attr.aria-label]="'Remove link ' + (index + 1)"
                  (click)="form.controls.links.removeAt(index)"
                >
                  Remove
                </button>
              </div>
            }
            <button id="demo-add-link" type="button" (click)="addLink()">Add link</button>
          </fieldset>
        </form>
        <p id="demo-form-state">
          status: <strong>{{ form.status }}</strong> · dirty: {{ form.dirty }} · touched:
          {{ form.touched }}
        </p>
        <pre class="demo-value">{{ formValue() }}</pre>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.demo" />

      <p>
        <strong>Typed forms.</strong> Since v14, the form's types are inferred from its initial
        values. <code>fb.nonNullable</code> makes <code>reset()</code> go back to the initial value
        instead of <code>null</code>, so <code>form.value.name</code> is <code>string</code>, not
        <code>string | null</code>.
      </p>
      <p>
        <strong>Accessible errors.</strong> Show an error once the field is touched, not while
        someone is still typing their first character. Tie it to the input with
        <code>aria-invalid</code> and <code>aria-describedby</code>. Keep the submit button
        enabled: on an invalid submit, <code>markAllAsTouched()</code> shows every error, then
        focus moves to the first one. Put the result message in a live region that's always in
        the DOM.
      </p>

      <h2>Expert</h2>
      <p>
        <strong>Async validators</strong> run after the sync ones pass and put the control in
        <code>PENDING</code> while they wait. They're the place for a "username taken" check. Pass
        them separately, and set <code>updateOn: 'blur'</code> or debounce inside them, or every
        keystroke is a request.
      </p>
      <app-code-block label="an async validator" [code]="snippets.async" />
      <p>
        <strong><code>ControlValueAccessor</code></strong> is how a custom component (a star
        rating, a date picker) becomes a form control. It implements four methods, and then
        <code>formControlName</code> works on it like on an input.
      </p>
      <app-code-block label="a custom control" [code]="snippets.cva" />
      <app-callout kind="expert">
        <p>
          <strong>Signal Forms</strong> ship in Angular 21 as experimental
          (<code>@angular/forms/signals</code>). The model is a plain signal you own,
          <code>form()</code> wraps it in a tree of fields, and validation is a schema function.
          Each field's value, validity and errors are signals, so no <code>valueChanges</code>
          bridging is needed. I'd use it on a greenfield form and know reactive forms for every
          existing codebase. Interviews will ask about both.
        </p>
      </app-callout>
      <app-code-block label="Signal Forms (experimental in 21)" [code]="snippets.signalForms" />

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong><code>Validators.required</code> accepts whitespace.</strong> Add a
          <code>notBlank</code> validator for text that has to say something.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Disabled controls are left out of <code>form.value</code>.</strong> Use
          <code>getRawValue()</code> when you need everything.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong><code>setValue</code> vs <code>patchValue</code>.</strong>
          <code>setValue</code> throws unless you pass every field. <code>patchValue</code> takes a
          subset, and silently ignores keys that don't exist, typos included.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Mixing <code>ngModel</code> with <code>formControlName</code></strong> on one
          input. It's deprecated and the two models fight. Pick one API per form.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .demo-error {
      margin: 0 0 8px;
      font-size: 13px;
      color: #ff6b6b;
    }
    .demo-links {
      margin: 8px 0;
      border: 1px dashed var(--border-primary, rgba(255, 255, 255, 0.3));
      border-radius: 8px;
    }
    .demo-value {
      margin: 8px 0 0;
      font-size: 12px;
      white-space: pre-wrap;
    }
  `,
})
export class Lesson08Forms {
  private readonly fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required],
      links: this.fb.nonNullable.array([this.link()]),
    },
    { validators: matchingPasswords },
  );

  protected showMismatch(): boolean {
    return this.form.hasError('mismatch') && this.form.controls.confirm.touched;
  }

  protected addLink(): void {
    this.form.controls.links.push(this.link());
  }

  protected formValue(): string {
    return JSON.stringify(this.form.getRawValue(), null, 2);
  }

  private link() {
    return this.fb.nonNullable.control('', Validators.pattern(/^(https:\/\/\S+)?$/));
  }

  protected readonly snippets = {
    contact: `readonly form = this.fb.nonNullable.group({
  name: ['', notBlank],
  email: ['', [Validators.required, Validators.email]],
  message: ['', notBlank],
});

onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();               // show every error at once
    // ...then focus the first invalid field
    return;
  }
  // send
}

<input id="contact-email" formControlName="email"
  [attr.aria-invalid]="showError('email') || null"
  [attr.aria-describedby]="showError('email') ? 'contact-email-error' : null" />`,
    demo: `const matchingPasswords: ValidatorFn = (group) => {
  const { password, confirm } = group.value;
  return confirm && password !== confirm ? { mismatch: true } : null;
};

form = this.fb.nonNullable.group(
  {
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
    links: this.fb.nonNullable.array([this.link()]),
  },
  { validators: matchingPasswords },               // on the group: it reads both fields
);

addLink() { this.form.controls.links.push(this.link()); }

<fieldset formArrayName="links">
  @for (link of form.controls.links.controls; track link; let i = $index) {
    <input [formControlName]="i" />
  }
</fieldset>`,
    async: `const usernameFree = (users: UserService): AsyncValidatorFn => (control) =>
  timer(300).pipe(                                 // debounce: resubscribed per value
    switchMap(() => users.exists(control.value)),
    map((taken) => (taken ? { taken: true } : null)),
  );

username = new FormControl('', {
  validators: [Validators.required],
  asyncValidators: [usernameFree(inject(UserService))],
  updateOn: 'blur',
});`,
    cva: `@Component({
  selector: 'app-star-rating',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: StarRating, multi: true }],
  ...
})
export class StarRating implements ControlValueAccessor {
  writeValue(value: number) { ... }                 // form → component
  registerOnChange(fn: (value: number) => void) { this.onChange = fn; }   // component → form
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(disabled: boolean) { ... }
}`,
    signalForms: `import { form, required, email, FormField } from '@angular/forms/signals';

readonly model = signal({ name: '', email: '' });
readonly contact = form(this.model, (path) => {
  required(path.name);
  email(path.email);
});

contact.email().valid();      // a signal
contact.email().errors();     // a signal

<input [formField]="contact.email" />`,
  };

  protected readonly interview = [
    {
      q: 'Reactive or template-driven forms?',
      a: 'Template-driven forms build the model from ngModel in the template: quick for simple cases, but the logic is spread through HTML and hard to unit test. Reactive forms define the model in TypeScript, which makes them strongly typed, testable without a DOM, and better for dynamic fields, cross-field validation and complex flows. I default to reactive. In Angular 21, Signal Forms are an experimental third option built on signals.',
    },
    {
      q: 'How do you write a custom validator, and a cross-field one?',
      a: 'A ValidatorFn takes a control and returns null when valid or an errors object like { blank: true }. For rules involving several fields, such as password confirmation or a date range, put the validator on the FormGroup so it sees every value and re-runs when any of them changes. Read it with group.hasError().',
    },
    {
      q: 'What does a ControlValueAccessor do?',
      a: 'It is the bridge between a form control and a component or element. writeValue pushes the model into the view, registerOnChange and registerOnTouched give the component callbacks to report changes back, and setDisabledState handles disabling. Provide it with NG_VALUE_ACCESSOR as a multi provider, and formControlName and ngModel work on your component.',
    },
    {
      q: 'How do async validators work?',
      a: 'They return an Observable or Promise of errors or null, and run only after the sync validators pass. While they run, the control status is PENDING. To avoid a request per keystroke, use updateOn: blur or debounce inside the validator with timer() and switchMap, since the validator is resubscribed on each value change.',
    },
    {
      q: 'How do you make a form accessible?',
      a: 'Every input has a real label. Errors show once the field is touched, and are linked with aria-invalid and aria-describedby. The submit button stays enabled, and an invalid submit marks everything touched and focuses the first invalid field. Results go into a live region that already exists in the DOM. Use autocomplete attributes for personal data.',
    },
    {
      q: 'What changed with typed forms?',
      a: 'Since Angular 14, FormControl, FormGroup and FormArray are generic and infer their types from initial values, so form.value.email is typed and typos are compile errors. nonNullable controls reset to their initial value instead of null, which removes string | null everywhere. UntypedFormGroup exists for migrating old code.',
    },
  ];
}
