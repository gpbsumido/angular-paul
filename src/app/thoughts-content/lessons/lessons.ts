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
};
