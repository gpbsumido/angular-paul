import { RenderMode } from '@angular/ssr';
import { serverRoutes } from './app.routes.server';
import { THOUGHTS } from './thoughts-content/thoughts-data';

describe('serverRoutes', () => {
  it('prerenders the thoughts list route', () => {
    const route = serverRoutes.find((r) => r.path === 'thoughts');
    expect(route?.renderMode).toBe(RenderMode.Prerender);
  });

  it('prerenders a page for every thought slug', async () => {
    const route = serverRoutes.find((r) => r.path === 'thoughts/:slug');
    expect(route?.renderMode).toBe(RenderMode.Prerender);
    expect(route && 'getPrerenderParams' in route).toBe(true);

    const params = await (
      route as unknown as { getPrerenderParams: () => Promise<{ slug: string }[]> }
    ).getPrerenderParams();
    const slugs = params.map((p) => p.slug).sort();
    const expected = THOUGHTS.map((t) => t.slug).sort();

    expect(slugs).toEqual(expected);
  });

  it('prerenders a page for every tag', async () => {
    const route = serverRoutes.find((r) => r.path === 'thoughts/tag/:tag');
    expect(route?.renderMode).toBe(RenderMode.Prerender);

    const params = await (
      route as unknown as { getPrerenderParams: () => Promise<{ tag: string }[]> }
    ).getPrerenderParams();
    const expected = [...new Set(THOUGHTS.flatMap((t) => t.tags))].sort();

    expect(params.map((p) => p.tag).sort()).toEqual(expected);
  });

  it('keeps the catch-all route client-rendered', () => {
    const route = serverRoutes.find((r) => r.path === '**');
    expect(route?.renderMode).toBe(RenderMode.Client);
  });
});
