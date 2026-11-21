import { Routes } from '@angular/router';

export interface RouteMatch {
  path: string;
  params: Record<string, string>;
}

/**
 * [ng-07 routing] A deliberately small model of how the router picks a route,
 * for lesson 07's playground: walk the array in order, take the first route
 * whose segments fit, capture `:params` on the way. `**` fits anything.
 *
 * The real matcher also handles child routes, prefix matching, redirects,
 * canMatch guards and custom matchers. This covers the flat, full-match
 * routes this site actually has, which is enough to show first-match-wins.
 */
export function firstMatch(routes: Routes, segments: string[]): RouteMatch | null {
  for (const route of routes) {
    const path = route.path ?? '';
    if (path === '**') return { path, params: {} };

    const parts = path.split('/').filter(Boolean);
    if (parts.length !== segments.length) continue;

    const params: Record<string, string> = {};
    const fits = parts.every((part, index) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = segments[index];
        return true;
      }
      return part === segments[index];
    });
    if (fits) return { path, params };
  }
  return null;
}
