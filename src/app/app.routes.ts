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
  {
    path: 'thoughts/:slug',
    loadComponent: () =>
      import('./thoughts-content/thought-detail').then((m) => m.ThoughtDetailComponent),
  },
];
