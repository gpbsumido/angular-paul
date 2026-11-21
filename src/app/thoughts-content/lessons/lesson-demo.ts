import { ChangeDetectionStrategy, Component, input } from '@angular/core';

let nextDemoId = 0;

/**
 * [ng-02 components] A frame for a lesson's live demo. It owns the chrome
 * (border, heading, landmark); the lesson projects whatever controls it needs.
 *
 * The id counter is per-module rather than random so the server and the
 * browser generate the same ids in the same order. A random id would differ
 * on hydration and break aria-labelledby.
 */
@Component({
  selector: 'app-lesson-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="lesson-demo" [attr.aria-labelledby]="headingId">
      <h3 [id]="headingId">{{ heading() }}</h3>
      <ng-content />
    </section>
  `,
  styles: `
    .lesson-demo {
      margin: 16px 0;
      padding: 16px;
      border: 1px solid var(--accent-color, #007aff);
      border-radius: 10px;
    }
    h3 {
      margin: 0 0 10px;
      font-size: 14px;
      color: var(--text-primary, #fff);
    }
  `,
})
export class LessonDemo {
  readonly heading = input.required<string>();
  protected readonly headingId = `lesson-demo-${nextDemoId++}`;
}
