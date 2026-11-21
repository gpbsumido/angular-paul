import { Component, input } from '@angular/core';

/**
 * A labelled, scrollable code sample for lesson pages.
 *
 * The code arrives as a string input rather than as template text on purpose:
 * Angular would try to compile `{{ }}`, `@if` and `<tags>` inside a template,
 * so a code sample has to be data, not markup. Interpolating a string is also
 * safe by default — Angular escapes it, so nothing in a sample can inject HTML.
 */
@Component({
  selector: 'app-code-block',
  template: `
    <figure class="code-block">
      <figcaption class="code-block-label">{{ label() }}</figcaption>
      <!-- tabindex makes a horizontally scrollable region reachable by keyboard (axe: scrollable-region-focusable) -->
      <pre tabindex="0"><code>{{ code() }}</code></pre>
    </figure>
  `,
  styles: `
    .code-block {
      margin: 12px 0 16px;
      border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
      border-radius: 8px;
      overflow: hidden;
      background: var(--surface-secondary, rgba(0, 0, 0, 0.25));
    }
    .code-block-label {
      padding: 4px 12px;
      font-size: 11px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    }
    pre {
      margin: 0;
      padding: 12px;
      overflow-x: auto;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 12.5px;
      line-height: 1.55;
      color: var(--text-primary, #fff);
    }
    pre:focus-visible {
      outline: 2px solid var(--focus-ring, #4da3ff);
      outline-offset: -2px;
    }
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly label = input('TypeScript');
}
