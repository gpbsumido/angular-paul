import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactApp } from './contact-app';

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

  it('should disable the submit button when the form is invalid', () => {
    const btn = nativeEl.querySelector('.contact-submit') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
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

  it('should enable the submit button when the form is valid', () => {
    component.form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      message: 'Hello!',
    });
    fixture.detectChanges();

    const btn = nativeEl.querySelector('.contact-submit') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
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
