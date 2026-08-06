import { RenderMode, ServerRoute } from '@angular/ssr';
import { THOUGHTS } from './thoughts-content/thoughts-data';

export const serverRoutes: ServerRoute[] = [
  // Content routes are prerendered (SSG): full HTML with SEO metadata at build time.
  {
    path: 'thoughts',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'thoughts/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => THOUGHTS.map((thought) => ({ slug: thought.slug })),
  },
  // The interactive desktop shell is client-rendered — hybrid rendering by route.
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
