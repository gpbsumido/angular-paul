import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../test/a11y';
import { ContactApp } from './contact-app';

expect.extend(axeMatchers);

describe('ContactApp', () => {
  let fixture: ComponentFixture<ContactApp>;
  let component: ContactApp;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactApp],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render name, email, and message fields', () => {
    expect(nativeEl.querySelector('input[formControlName="name"]')).toBeTruthy();
    expect(nativeEl.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(nativeEl.querySelector('textarea[formControlName="message"]')).toBeTruthy();
  });

  // [ng-08 forms] Send used to be disabled until the form was valid. A
  // disabled button can't be focused, explains nothing, and leaves someone
  // who can't see the inline errors with no idea what's wrong. Now it's always
  // enabled, and pressing it on an invalid form shows every error.
  it('keeps Send enabled, so pressing it can explain what is missing', () => {
    const btn = nativeEl.querySelector('.contact-submit') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('submitting an invalid form shows every error, focuses the first bad field, and sends nothing', async () => {
    component.form.controls.name.setValue('Paul');
    (nativeEl.querySelector('.contact-submit') as HTMLButtonElement).click();
    await fixture.whenStable();

    expect(nativeEl.querySelector('.contact-error-email')).toBeTruthy();
    expect(nativeEl.querySelector('.contact-error-message')).toBeTruthy();
    expect(nativeEl.querySelector('.contact-error-name')).toBeNull();
    expect(document.activeElement?.id).toBe('contact-email');
    expect(component.submissionStatus()).toBe('idle');
  });

  it('rejects a name or message that is only whitespace', () => {
    component.form.setValue({ name: '   ', email: 'test@example.com', message: '\n\t ' });

    expect(component.form.controls.name.hasError('blank')).toBe(true);
    expect(component.form.controls.message.hasError('blank')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('ties each shown error to its field with aria-invalid and aria-describedby', async () => {
    component.form.controls.email.setValue('not-an-email');
    component.form.controls.email.markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();

    const email = nativeEl.querySelector('#contact-email')!;
    const describedBy = email.getAttribute('aria-describedby');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(describedBy).toBeTruthy();
    expect(nativeEl.querySelector(`#${describedBy}`)?.textContent).toContain('Valid email');

    const name = nativeEl.querySelector('#contact-name')!;
    expect(name.getAttribute('aria-invalid')).toBeNull();
    expect(name.getAttribute('aria-describedby')).toBeNull();
  });

  it('has no axe violations while errors are showing', async () => {
    component.form.markAllAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(await axe(nativeEl)).toHaveNoViolations();
  });

  it('should show a validation error when name is empty and touched', () => {
    const nameInput = nativeEl.querySelector('input[formControlName="name"]') as HTMLInputElement;
    nameInput.dispatchEvent(new Event('focus'));
    nameInput.dispatchEvent(new Event('blur'));
    component.form.controls.name.markAsTouched();
    fixture.detectChanges();

    const error = nativeEl.querySelector('.contact-error-name');
    expect(error).toBeTruthy();
  });

  it('should show a validation error when email is invalid and touched', () => {
    const ctrl = component.form.controls.email;
    ctrl.setValue('not-an-email');
    ctrl.markAsTouched();
    fixture.detectChanges();

    const error = nativeEl.querySelector('.contact-error-email');
    expect(error).toBeTruthy();
  });

  it('should show a validation error when message is empty and touched', () => {
    component.form.controls.message.markAsTouched();
    fixture.detectChanges();

    const error = nativeEl.querySelector('.contact-error-message');
    expect(error).toBeTruthy();
  });

  it('should call the submission handler when a valid form is submitted', () => {
    component.form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello!',
    });
    fixture.detectChanges();

    component.onSubmit();
    fixture.detectChanges();

    // Submission should have been triggered (status moves from idle)
    expect(component.submissionStatus()).not.toBe('idle');
  });

  it('should show a loading indicator while the submission is pending', () => {
    component.form.setValue({
      name: 'Test',
      email: 'test@test.com',
      message: 'Hi',
    });
    component.onSubmit();
    fixture.detectChanges();

    const loading = nativeEl.querySelector('.contact-loading');
    expect(loading).toBeTruthy();
  });

  it('should show a success message when submission completes', async () => {
    component.form.setValue({
      name: 'Test',
      email: 'test@test.com',
      message: 'Hi',
    });
    component.onSubmit();

    // Wait for the simulated async submission
    await new Promise((r) => setTimeout(r, 600));
    fixture.detectChanges();

    const success = nativeEl.querySelector('.contact-success');
    expect(success).toBeTruthy();
    // Announced, not just painted: it's inside a live region that was
    // already in the DOM, so screen readers hear the change.
    expect(success?.closest('[role="status"]')).toBeTruthy();
  });

  it('should reset the form after successful submission', async () => {
    component.form.setValue({
      name: 'Test',
      email: 'test@test.com',
      message: 'Hi',
    });
    component.onSubmit();

    await new Promise((r) => setTimeout(r, 600));
    fixture.detectChanges();

    expect(component.form.value.name).toBeFalsy();
    expect(component.form.value.email).toBeFalsy();
    expect(component.form.value.message).toBeFalsy();
  });
});
