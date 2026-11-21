import { Type } from '@angular/core';

/**
 * Thoughts that come with an interactive lesson page, keyed by slug.
 *
 * Each page is a loader, not a component reference, so every lesson becomes
 * its own lazy chunk. This file is only imported by the thought reader, which
 * is itself lazy, so none of it reaches the initial bundle.
 */
export const LESSON_PAGES: Record<string, () => Promise<Type<unknown>>> = {
  'angular-01-project-structure': () =>
    import('./lesson-01-structure').then((m) => m.Lesson01Structure),
  'angular-02-components': () =>
    import('./lesson-02-components').then((m) => m.Lesson02Components),
  'angular-03-templates': () =>
    import('./lesson-03-templates').then((m) => m.Lesson03Templates),
  'angular-04-signals': () => import('./lesson-04-signals').then((m) => m.Lesson04Signals),
  'angular-05-dependency-injection': () => import('./lesson-05-di').then((m) => m.Lesson05Di),
  'angular-06-rxjs': () => import('./lesson-06-rxjs').then((m) => m.Lesson06Rxjs),
  'angular-07-routing': () => import('./lesson-07-routing').then((m) => m.Lesson07Routing),
  'angular-08-forms': () => import('./lesson-08-forms').then((m) => m.Lesson08Forms),
  'angular-09-change-detection': () =>
    import('./lesson-09-change-detection').then((m) => m.Lesson09ChangeDetection),
  'angular-10-directives': () => import('./lesson-10-directives').then((m) => m.Lesson10Directives),
  'angular-11-testing': () => import('./lesson-11-testing').then((m) => m.Lesson11Testing),
  'angular-12-ssr': () => import('./lesson-12-ssr').then((m) => m.Lesson12Ssr),
  'angular-13-interview': () =>
    import('./lesson-13-interview').then((m) => m.Lesson13Interview),
};
