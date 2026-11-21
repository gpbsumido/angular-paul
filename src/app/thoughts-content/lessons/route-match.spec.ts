import { Routes } from '@angular/router';
import { firstMatch } from './route-match';

const routes: Routes = [
  { path: '', pathMatch: 'full', children: [] },
  { path: 'thoughts' },
  { path: 'thoughts/tag/:tag' },
  { path: 'thoughts/:slug' },
  { path: '**', redirectTo: '' },
];

describe('firstMatch', () => {
  it('matches static segments exactly', () => {
    expect(firstMatch(routes, ['thoughts'])).toEqual({ path: 'thoughts', params: {} });
  });

  it('captures :params from the segments they sit on', () => {
    expect(firstMatch(routes, ['thoughts', 'tag', 'rxjs'])).toEqual({
      path: 'thoughts/tag/:tag',
      params: { tag: 'rxjs' },
    });
    expect(firstMatch(routes, ['thoughts', 'signals'])).toEqual({
      path: 'thoughts/:slug',
      params: { slug: 'signals' },
    });
  });

  it('matches the empty path only for the root URL', () => {
    expect(firstMatch(routes, [])).toEqual({ path: '', params: {} });
  });

  it('falls through to the wildcard when nothing else fits', () => {
    expect(firstMatch(routes, ['nope', 'at', 'all'])).toEqual({ path: '**', params: {} });
  });

  it('takes the first match in array order, so a wildcard listed first swallows everything', () => {
    const wildcardFirst = [routes[4], ...routes.slice(0, 4)];
    expect(firstMatch(wildcardFirst, ['thoughts'])).toEqual({ path: '**', params: {} });
  });
});
