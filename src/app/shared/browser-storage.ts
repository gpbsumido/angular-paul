import { isPlatformBrowser } from '@angular/common';
import { inject, InjectionToken, PLATFORM_ID } from '@angular/core';

// [ng-05 di] An InjectionToken is how you inject something that isn't a class:
// an interface, a config object, a browser global. Storage is an interface, so
// it can't be its own token; this constant is the key the injector looks up.
//
// providedIn: 'root' + factory makes it tree-shakable and self-providing: no
// one has to remember to add it to app.config.ts, and it's dropped from the
// bundle if nothing injects it.
//
// The factory runs in an injection context, so it can inject() too. It
// decides once, in one place, what "storage" means on each platform. The
// server has no localStorage, so it gets null and every caller has to deal
// with that, which the type makes them do.
//
// Specs and SSR swap it with { provide: BROWSER_STORAGE, useValue: ... }.
// That's the point: services depend on the token, never on the global.
export const BROWSER_STORAGE = new InjectionToken<Storage | null>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null),
});
