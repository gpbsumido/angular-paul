import { Component, input } from '@angular/core';

export type CalloutKind = 'tip' | 'pitfall' | 'expert';

const LABELS: Record<CalloutKind, string> = {
  tip: 'Tip',
  pitfall: 'Pitfall',
  expert: 'Expert note',
};

/**
 * [ng-02 components] A presentational component: data in through inputs,
 * markup in through content projection, no services, no side effects.
 *
 *   <app-callout kind="pitfall"><p>…</p></app-callout>
 *
 * `host` metadata binds attributes and classes onto <app-callout> itself, so
 * there's no extra wrapper div. It's the modern replacement for @HostBinding.
 */
@Component({
  selector: 'app-callout',
  host: {
    role: 'note',
    '[class]': '"callout callout--" + kind()',
  },
  template: `
    <!-- The kind is spelled out in text so colour is never the only signal. -->
    <strong class="callout-label">{{ labels[kind()] }}</strong>
    <ng-content />
  `,
  styles: `
    :host {
      display: block;
      margin: 12px 0;
      padding: 10px 14px;
      border-radius: 8px;
      border-left: 4px solid var(--callout-colour);
      background: var(--surface-secondary, rgba(255, 255, 255, 0.04));
    }
    :host(.callout--tip) {
      --callout-colour: #34c759;
    }
    :host(.callout--pitfall) {
      --callout-colour: #ff6b6b;
    }
    :host(.callout--expert) {
      --callout-colour: #bf5af2;
    }
    .callout-label {
      display: block;
      font-size: 12px;
      color: var(--text-primary, #fff);
    }
  `,
})
export class Callout {
  readonly kind = input.required<CalloutKind>();
  protected readonly labels = LABELS;
}
