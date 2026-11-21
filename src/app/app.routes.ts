import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    children: [],
  },
  {
    path: 'thoughts',
    loadComponent: () =>
      import('./thoughts-content/thoughts-list').then((m) => m.ThoughtsListComponent),
  },
  // [ng-07 routing] Same component as /thoughts; withComponentInputBinding()
  // hands it :tag as its `tag` input. A path param rather than ?tag= so every
  // tag page can be prerendered to its own static HTML file.
  {
    path: 'thoughts/tag/:tag',
    loadComponent: () =>
      import('./thoughts-content/thoughts-list').then((m) => m.ThoughtsListComponent),
  },
  {
    path: 'thoughts/:slug',
    loadComponent: () =>
      import('./thoughts-content/thought-detail').then((m) => m.ThoughtDetailComponent),
  },
  // [ng-07 routing] The wildcard goes last: the router takes the first route
  // that matches, in array order, and ** matches everything. Without it, a
  // mistyped URL failed the initial navigation with NG04002.
  { path: '**', redirectTo: '' },
];
