import { Component, input, ViewEncapsulation } from '@angular/core';

/**
 * [ng-02 components] The shared typography for every lesson page.
 *
 * Expert: this is the one component in the app with ViewEncapsulation.None.
 * Emulated encapsulation (the default) rewrites selectors so styles only hit
 * this component's own template. The <h2>s and <code>s here, though, live in
 * each *lesson's* template and are projected in. Encapsulated styles can't
 * reach projected content without the deprecated ::ng-deep, so this component
 * opts out of encapsulation and scopes itself by hand under `.lesson`.
 * Without that prefix, `h2 {}` would restyle every h2 on the site.
 */
@Component({
  selector: 'app-lesson',
  encapsulation: ViewEncapsulation.None,
  template: `
    <article class="lesson">
      <p class="lesson-kicker">Angular guide · Part {{ part() }}</p>
      <ng-content />
    </article>
  `,
  styles: `
    .lesson {
      margin-top: 24px;
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary, rgba(255, 255, 255, 0.8));
    }
    .lesson .lesson-kicker {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--accent-color, #007aff);
    }
    .lesson h2 {
      margin: 28px 0 8px;
      font-size: 17px;
      color: var(--text-primary, #fff);
    }
    .lesson code {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 0.92em;
    }
    .lesson .demo-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }
    .lesson select,
    .lesson input[type='text'] {
      font: inherit;
      padding: 4px 6px;
      border-radius: 6px;
    }
  `,
})
export class Lesson {
  /** Two-digit part number, e.g. "02". */
  readonly part = input.required<string>();
}
