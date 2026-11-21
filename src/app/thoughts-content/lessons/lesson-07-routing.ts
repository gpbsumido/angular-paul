import { Component, computed, inject, signal } from '@angular/core';
import { PRIMARY_OUTLET, UrlSerializer } from '@angular/router';
import { routes } from '../../app.routes';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';
import { firstMatch } from './route-match';

const entries = (record: Record<string, unknown>) =>
  Object.entries(record).map(([key, value]) => `${key} = ${value}`);

@Component({
  selector: 'app-lesson-07-routing',
  imports: [Lesson, LessonDemo, CodeBlock, Callout, InterviewQuestions],
  template: `
    <app-lesson part="07">
      <h2>Simple</h2>
      <p>
        A route maps a URL to a component. The router renders it into a
        <code>&lt;router-outlet&gt;</code>, and <code>routerLink</code> navigates without
        reloading the page. A segment starting with a colon, like <code>:slug</code>, is a
        parameter. Here is this site's whole route table:
      </p>
      <app-code-block label="src/app/app.routes.ts" [code]="snippets.routes" />
      <p>
        Every link in this reader is a real <code>&lt;a routerLink&gt;</code>: the tags above, the
        cards in the list, the previous and next links below. Real links prerender as
        <code>href</code>s, so search engines can follow them, and middle-click and ⌘-click open a
        new tab. A <code>div</code> with a click handler calling <code>router.navigate()</code>
        does none of that. The Thoughts list cards were exactly that until this lesson.
      </p>

      <h2>Intermediate</h2>
      <p>
        <strong>The router takes the first route that matches, in array order.</strong> Specific
        routes go before general ones, and the <code>**</code> wildcard goes last. This site didn't
        have one: a mistyped URL failed the first navigation with NG04002. Now it redirects to the
        desktop.
      </p>
      <app-lesson-demo heading="Try it: match a URL against this site's routes">
        <div class="demo-row">
          <label for="route-url">URL</label>
          <input id="route-url" type="text" autocomplete="off" [value]="url()" (input)="url.set(valueOf($event))" />
        </div>
        <div class="demo-row">
          <input id="wildcard-first" type="checkbox" (change)="wildcardFirst.set(checked($event))" />
          <label for="wildcard-first">Move the ** route to the front</label>
        </div>
        <div role="status">
          <dl class="route-parts">
            <dt>Matched route</dt>
            <dd id="route-matched">{{ match()?.path ?? 'no match' }}</dd>
            <dt>Route params</dt>
            <dd id="route-params">{{ params().join(', ') || 'none' }}</dd>
            <dt>Query params</dt>
            <dd id="route-query">{{ queryParams().join(', ') || 'none' }}</dd>
            <dt>Fragment</dt>
            <dd id="route-fragment">{{ parsed().fragment ?? 'none' }}</dd>
          </dl>
        </div>
        <p class="demo-note">
          The URL is split by Angular's own <code>UrlSerializer</code>. Try
          <code>/thoughts/tag/rxjs?ref=dock#top</code>, then tick the box.
        </p>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.demo" />

      <p>
        <strong>Route params as inputs.</strong> With <code>withComponentInputBinding()</code>, the
        router sets path params, query params and route data as component inputs. This reader used
        <code>toSignal(route.paramMap)</code> since lesson 04, and now declares an input instead.
      </p>
      <app-code-block label="src/app/thoughts-content/thought-detail.ts" [code]="snippets.inputBinding" />
      <p>
        <strong>Path params or query params?</strong> The tag pages are
        <code>/thoughts/tag/rxjs</code>, not <code>/thoughts?tag=rxjs</code>. Query params suit
        optional state like sorting, filters and paging. But prerendering writes one HTML file per
        <em>path</em>. A query-param page would be served the unfiltered list and then change
        under the reader during hydration. A path gives each tag its own static page and canonical
        URL.
      </p>
      <p>
        <strong>Lazy loading.</strong> <code>loadComponent</code> (and
        <code>loadChildren</code> for a group of routes) puts a page in its own chunk, fetched on
        first visit. <strong>Guards</strong> are functions: <code>canActivate</code> decides
        whether to enter, <code>canMatch</code> whether the route is considered at all, and
        <code>canDeactivate</code> whether you may leave. They return a boolean or a
        <code>UrlTree</code> to redirect.
      </p>
      <app-code-block label="a functional guard" [code]="snippets.guard" />

      <h2>Expert</h2>
      <p>
        <strong>Server routes.</strong> With SSR, a second table chooses how each path renders.
        This site prerenders every thought and tag page at build time and leaves the desktop
        client-rendered. <code>getPrerenderParams</code> lists which values of a param to build.
      </p>
      <app-code-block label="src/app/app.routes.server.ts" [code]="snippets.server" />
      <app-callout kind="expert">
        <p>
          <strong>Route reuse.</strong> By default the router reuses the component instance when
          only params change, as with lesson 01 → Next → lesson 02. Anything read once
          (<code>route.snapshot</code>, a constructor call) goes stale. Inputs and
          <code>paramMap</code> both update. A custom <code>RouteReuseStrategy</code> can change
          this, but making the component reactive is almost always the right fix.
        </p>
      </app-callout>
      <p>
        Also worth knowing:
        <code>withPreloading(PreloadAllModules)</code> fetches lazy chunks after first load.
        <code>withViewTransitions()</code> animates between routes. <code>providers</code> on a
        route create an injector for that subtree (lesson 05). The <code>title</code> property, or
        a custom <code>TitleStrategy</code>, sets the document title. For tests,
        <code>RouterTestingHarness</code> drives the real router. This site's route specs run the
        real table with the real <code>appConfig</code>.
      </p>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>Reading <code>route.snapshot</code> in a component the router reuses.</strong>
          The page keeps showing the old param. Use an input or <code>paramMap</code>.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>An empty-path redirect without <code>pathMatch: 'full'</code>.</strong> Every
          URL starts with an empty path, so the default prefix match redirects everything.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Navigating from click handlers instead of links.</strong> No href, no
          middle-click, nothing for crawlers or screen readers to follow. Save
          <code>router.navigate()</code> for navigation that follows logic, like after a save.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Relative links that are relative to the wrong thing.</strong> A
          <code>routerLink</code> resolves against the current route, but
          <code>router.navigate(['edit'])</code> resolves from the root unless you pass
          <code>relativeTo</code>.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .demo-note {
      font-size: 12px;
    }
    .route-parts {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 4px 12px;
      margin: 8px 0;
      font-size: 13px;
    }
    .route-parts dt {
      font-weight: 600;
    }
    .route-parts dd {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
  `,
})
export class Lesson07Routing {
  private readonly serializer = inject(UrlSerializer);

  protected readonly url = signal('/thoughts/tag/rxjs?ref=dock#top');
  protected readonly wildcardFirst = signal(false);

  protected readonly parsed = computed(() => this.serializer.parse(this.url()));
  protected readonly match = computed(() => {
    const segments =
      this.parsed().root.children[PRIMARY_OUTLET]?.segments.map((segment) => segment.path) ?? [];
    const table = this.wildcardFirst()
      ? [...routes.filter((r) => r.path === '**'), ...routes.filter((r) => r.path !== '**')]
      : routes;
    return firstMatch(table, segments);
  });
  protected readonly params = computed(() => entries(this.match()?.params ?? {}));
  protected readonly queryParams = computed(() => entries(this.parsed().queryParams));

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  protected readonly snippets = {
    routes: `export const routes: Routes = [
  { path: '', pathMatch: 'full', children: [] },          // the desktop
  { path: 'thoughts', loadComponent: () => import('./thoughts-list')... },
  { path: 'thoughts/tag/:tag', loadComponent: () => import('./thoughts-list')... },
  { path: 'thoughts/:slug', loadComponent: () => import('./thought-detail')... },
  { path: '**', redirectTo: '' },                         // last, always
];

<a [routerLink]="['/thoughts/tag', tag]">{{ tag }}</a>`,
    demo: `const tree = inject(UrlSerializer).parse('/thoughts/tag/rxjs?ref=dock#top');
tree.root.children[PRIMARY_OUTLET].segments.map((s) => s.path);  // ['thoughts', 'tag', 'rxjs']
tree.queryParams;                                                  // { ref: 'dock' }
tree.fragment;                                                     // 'top'

// then, like the router: first route in array order whose segments fit
firstMatch(routes, ['thoughts', 'tag', 'rxjs']);  // { path: 'thoughts/tag/:tag', params: { tag: 'rxjs' } }`,
    inputBinding: `// before (lesson 04)
private readonly route = inject(ActivatedRoute);
private readonly slug = toSignal(
  this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
  { requireSync: true },
);

// after: app.config.ts has provideRouter(routes, withComponentInputBinding())
readonly slug = input.required<string>();`,
    guard: `export const signedInGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isSignedIn() || inject(Router).parseUrl('/sign-in');   // redirect, don't just block
};

{ path: 'settings', canActivate: [signedInGuard], loadComponent: ... }`,
    server: `export const serverRoutes: ServerRoute[] = [
  { path: 'thoughts', renderMode: RenderMode.Prerender },
  {
    path: 'thoughts/tag/:tag',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      [...new Set(THOUGHTS.flatMap((thought) => thought.tags))].map((tag) => ({ tag })),
  },
  { path: '**', renderMode: RenderMode.Client },   // the desktop: browser only
];`,
  };

  protected readonly interview = [
    {
      q: 'How does the router decide which route matches?',
      a: 'It walks the route array in order and takes the first route whose path fits, depth-first through children. So specific routes go before general ones, and the ** wildcard goes last. An empty-path redirect needs pathMatch: full, or it matches every URL by prefix.',
    },
    {
      q: 'How do you read route parameters in a component?',
      a: 'Today, with withComponentInputBinding() enabled, declare an input with the param name and the router sets it, including on reuse. Without it, inject ActivatedRoute and use paramMap, an Observable, or toSignal(paramMap). Avoid route.snapshot in components the router may reuse, because it never updates.',
    },
    {
      q: 'What are guards and resolvers?',
      a: 'Guards are functions that run during navigation. canActivate decides entry, canMatch decides whether a route is considered at all (good for feature flags and lazy loading), canDeactivate guards leaving, for example with unsaved changes. They can return a UrlTree to redirect. Resolvers fetch data before activation. Many apps now load in the component with resource() instead, so the page can render a loading state rather than blocking navigation.',
    },
    {
      q: 'How does lazy loading work with standalone components?',
      a: 'loadComponent takes a function returning a dynamic import of a component, and loadChildren returns a routes array. The bundler splits each into its own chunk, fetched on first navigation. Preloading strategies, such as PreloadAllModules or a custom one, can fetch chunks in the background after startup.',
    },
    {
      q: 'Path params or query params?',
      a: 'Path params identify the resource: /thoughts/:slug. Query params carry optional view state: sorting, filters, paging. With SSR or prerendering, anything that should be its own page with its own HTML and canonical URL needs to be in the path. On my site that is why tag pages are /thoughts/tag/:tag.',
    },
    {
      q: 'How do you test routing?',
      a: 'With RouterTestingHarness: configure provideRouter with real routes, navigate by URL, and assert on the rendered component and router.url. It catches what mocked ActivatedRoute specs miss, such as component reuse on a param change. In my project a spec runs the real route table with the real app config, so a missing wildcard or router feature fails a test.',
    },
  ];
}
