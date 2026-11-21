import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { LessonSection } from './lesson-section';
import { ScrollSpy } from './scroll-spy';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // [ng-10 directives] Composition instead of inheritance: the lesson gets
  // ScrollSpy's behaviour without extending a class or anyone writing
  // appScrollSpy on <app-lesson>. The headings inside find it through DI.
  hostDirectives: [ScrollSpy],
  template: `
    <article class="lesson">
      <p class="lesson-kicker">Angular guide · Part {{ part() }}</p>
      @if (sections().length) {
        <nav class="lesson-toc" aria-label="On this page">
          <ul>
            @for (section of sections(); track section) {
              <li>
                <button
                  type="button"
                  [attr.aria-current]="spy.activeId() === section.id ? 'location' : null"
                  (click)="section.scrollIntoView()"
                >
                  {{ section.label }}
                </button>
              </li>
            }
          </ul>
        </nav>
      }
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
    .lesson .lesson-toc {
      position: sticky;
      top: 0;
      z-index: 1;
      padding: 6px 0;
      background: var(--window-bg, rgba(30, 30, 30, 0.95));
    }
    .lesson .lesson-toc ul {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .lesson .lesson-toc button {
      font: inherit;
      font-size: 12px;
      padding: 2px 10px;
      border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
      border-radius: 12px;
      background: none;
      color: var(--text-primary, #fff);
      cursor: pointer;
    }
    .lesson .lesson-toc button[aria-current='location'] {
      border-color: var(--accent-color, #007aff);
      background: var(--accent-color, #007aff);
      color: #fff;
    }
    .lesson .lesson-toc button:focus-visible,
    .lesson h2:focus-visible {
      outline: 2px solid var(--accent-color, #007aff);
      outline-offset: 2px;
    }
    .lesson h2 {
      margin: 28px 0 8px;
      font-size: 17px;
      color: var(--text-primary, #fff);
      /* Leaves room for the sticky nav when a section is jumped to. */
      scroll-margin-top: 48px;
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

  protected readonly spy = inject(ScrollSpy);
  // descendants: true, because a lesson may wrap a heading in another element.
  protected readonly sections = contentChildren(LessonSection, { descendants: true });
}
