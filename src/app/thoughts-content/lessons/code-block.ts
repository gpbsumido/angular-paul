import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/**
 * A labelled, scrollable code sample for lesson pages.
 *
 * The code arrives as a string input rather than as template text on purpose:
 * Angular would try to compile `{{ }}`, `@if` and `<tags>` inside a template,
 * so a code sample has to be data, not markup. Interpolating a string is also
 * safe by default — Angular escapes it, so nothing in a sample can inject HTML.
 *
 * [ng-02 components] The whole public API is three members: two inputs and one
 * output. Keep a component's surface that small and it stays reusable.
 */
@Component({
  selector: 'app-code-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="code-block">
      <figcaption class="code-block-bar">
        <span>{{ label() }}</span>
        <!-- Live region exists from the start; screen readers only announce changes to one already in the DOM. -->
        <span role="status" class="code-block-status">{{ status() }}</span>
        <button type="button" (click)="copy()" [attr.aria-label]="'Copy ' + label()">Copy</button>
      </figcaption>
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
    .code-block-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 6px 4px 12px;
      font-size: 11px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
    }
    .code-block-status {
      margin-left: auto;
    }
    button {
      font: inherit;
      padding: 2px 8px;
      border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.15));
      border-radius: 5px;
      background: none;
      color: var(--text-primary, #fff);
      cursor: pointer;
    }
    button:focus-visible,
    pre:focus-visible {
      outline: 2px solid var(--focus-ring, #4da3ff);
      outline-offset: -2px;
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
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly label = input('TypeScript');
  /** Emits the copied text, so a parent can react without reaching into this component. */
  readonly copied = output<string>();

  protected readonly status = signal('');

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.status.set('Copied');
      this.copied.emit(this.code());
    } catch {
      // Clipboard access is denied on insecure origins and in some iframes.
      // Say so rather than pretending it worked.
      this.status.set('Copy failed. Select the code instead');
    }
  }
}
