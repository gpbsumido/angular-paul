// [ng-01 structure] Application-wide providers. This file replaces what an
// AppModule's `imports: [...]` and `providers: [...]` used to do.
//
// Simple: every `provideX()` registers a feature for the whole app.
// Intermediate: the order mostly doesn't matter, but each provider is
//   app-scoped (root injector). Anything you add here is created once and
//   shared — put per-feature providers on routes or components instead.
// Expert: `provideX(withY(), withZ())` is the "feature function" pattern.
//   The with* functions are tree-shakable options: if you never call
//   withIncrementalHydration(), that code never ships. Prefer this shape when
//   you design your own library's providers too.
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { retryTransientErrors } from './shared/retry-transient-errors.interceptor';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    // Routes uncaught errors and unhandled rejections to Angular's ErrorHandler.
    provideBrowserGlobalErrorListeners(),
    // No Zone.js: change detection runs off signals and template events.
    // Covered properly in lesson 09.
    provideZonelessChangeDetection(),
    // HttpClient backed by fetch() instead of XHR — required for good SSR.
    // [ng-06 rxjs] Interceptors run in array order on the way out and reverse
    // order on the way back. withInterceptors() takes plain functions; the
    // class-based HTTP_INTERCEPTORS multi-provider is the legacy form.
    provideHttpClient(withFetch(), withInterceptors([retryTransientErrors])),
    // [ng-07 routing] withComponentInputBinding(): route params, query params
    // and route data arrive as component inputs, so a routed component can
    // declare `slug = input.required<string>()` instead of injecting
    // ActivatedRoute and bridging an Observable.
    provideRouter(routes, withComponentInputBinding()),
    // SSR hydration: reuse server-rendered DOM instead of re-creating it.
    // Lesson 12.
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
  ],
};
