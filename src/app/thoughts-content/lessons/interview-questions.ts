import { Component, input } from '@angular/core';

export interface InterviewQuestion {
  q: string;
  a: string;
}

/**
 * [ng-02 components] Native <details>/<summary> gives a keyboard-operable,
 * screen-reader-announced disclosure for free. No open/closed state to manage,
 * no ARIA to get wrong. Reach for the platform before writing a toggle.
 */
@Component({
  selector: 'app-interview-questions',
  template: `
    @for (item of questions(); track item.q) {
      <details class="qa">
        <summary>{{ item.q }}</summary>
        <p>{{ item.a }}</p>
      </details>
    }
  `,
  styles: `
    .qa {
      margin-bottom: 8px;
      padding: 8px 12px;
      border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
      border-radius: 8px;
    }
    summary {
      cursor: pointer;
      color: var(--text-primary, #fff);
    }
  `,
})
export class InterviewQuestions {
  readonly questions = input.required<readonly InterviewQuestion[]>();
}
