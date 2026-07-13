import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type SubmissionStatus = 'idle' | 'pending' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  template: `
    <div class="contact">
      <div class="contact-toolbar">
        <h3>New Message</h3>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="contact-form">
        <div class="contact-field">
          <label for="contact-name">Name</label>
          <input id="contact-name" formControlName="name" placeholder="Your name" />
          @if (form.controls.name.touched && form.controls.name.invalid) {
            <span class="contact-error contact-error-name">Name is required</span>
          }
        </div>

        <div class="contact-field">
          <label for="contact-email">Email</label>
          <input id="contact-email" formControlName="email" placeholder="your@email.com" />
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <span class="contact-error contact-error-email">Valid email is required</span>
          }
        </div>

        <div class="contact-field contact-field-message">
          <label for="contact-message">Message</label>
          <textarea
            id="contact-message"
            formControlName="message"
            placeholder="Your message..."
            rows="6"
          ></textarea>
          @if (form.controls.message.touched && form.controls.message.invalid) {
            <span class="contact-error contact-error-message">Message is required</span>
          }
        </div>

        <div class="contact-actions">
          <button
            type="submit"
            class="contact-submit"
            [disabled]="form.invalid || submissionStatus() === 'pending'"
          >
            Send
          </button>
        </div>

        @if (submissionStatus() === 'pending') {
          <div class="contact-loading">Sending message...</div>
        }
        @if (submissionStatus() === 'success') {
          <div class="contact-success">Message sent successfully!</div>
        }
        @if (submissionStatus() === 'error') {
          <div class="contact-error-state">Failed to send message. Please try again.</div>
        }
      </form>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-primary, #fff);
    }

    .contact {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .contact-toolbar {
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .contact-toolbar h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }

    .contact-form {
      flex: 1;
      padding: 16px;
      display: flex;
      flex-direction: column;
    }

    .contact-field {
      margin-bottom: 12px;
    }

    .contact-field label {
      display: block;
      font-size: 11px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
      margin-bottom: 4px;
    }

    .contact-field input,
    .contact-field textarea {
      width: 100%;
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary, #fff);
      font-family: inherit;
      font-size: 13px;
      outline: none;
      box-sizing: border-box;
    }

    .contact-field input:focus,
    .contact-field textarea:focus {
      border-color: var(--accent-color, #007aff);
    }

    .contact-field-message {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .contact-field-message textarea {
      flex: 1;
      resize: none;
    }

    .contact-error {
      font-size: 11px;
      color: #ff6b6b;
      margin-top: 4px;
      display: block;
    }

    .contact-actions {
      margin-top: 12px;
    }

    .contact-submit {
      padding: 8px 24px;
      border-radius: 6px;
      border: none;
      background: var(--accent-color, #007aff);
      color: white;
      font-size: 13px;
      cursor: pointer;
    }

    .contact-submit:disabled {
      opacity: 0.4;
      cursor: default;
    }

    .contact-loading,
    .contact-success,
    .contact-error-state {
      margin-top: 12px;
      font-size: 12px;
      padding: 8px 12px;
      border-radius: 6px;
    }

    .contact-loading {
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      background: rgba(255, 255, 255, 0.05);
    }

    .contact-success {
      color: #34c759;
      background: rgba(52, 199, 89, 0.1);
    }

    .contact-error-state {
      color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
    }
  `,
})
export class ContactApp {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  readonly submissionStatus = signal<SubmissionStatus>('idle');

  onSubmit() {
    if (this.form.invalid) return;

    this.submissionStatus.set('pending');

    // Simulate async submission
    setTimeout(() => {
      this.submissionStatus.set('success');
      this.form.reset();
    }, 500);
  }
}
