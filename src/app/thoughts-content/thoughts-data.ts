export interface ThoughtEntry {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  relatedApp?: string;
}

export const THOUGHTS: ThoughtEntry[] = [
  {
    slug: 'signals',
    title: 'Why Angular Signals Changed Everything',
    date: '2026-06-15',
    summary:
      'Signals replaced Zone.js change detection with fine-grained reactivity, making Angular apps faster and easier to reason about.',
    tags: ['signals', 'reactivity', 'angular'],
    relatedApp: 'about',
  },
  {
    slug: 'httpresource',
    title: 'httpResource: Async Without the Boilerplate',
    date: '2026-06-20',
    summary:
      'Angular 19 introduced httpResource as a declarative way to fetch data — no more manual subscribe/unsubscribe.',
    tags: ['httpResource', 'async', 'angular'],
    relatedApp: 'projects',
  },
  {
    slug: 'tdd-angular',
    title: 'TDD in Angular: Writing Tests That Matter',
    date: '2026-07-01',
    summary:
      'Test-driven development forces you to think about the API before the implementation. Here is how I apply it in Angular.',
    tags: ['testing', 'tdd', 'angular'],
    relatedApp: 'terminal',
  },
  {
    slug: 'signals-over-rxjs',
    title: 'Why Signals Over RxJS',
    date: '2026-07-05',
    summary:
      'Signals replaced RxJS for UI state management in Angular — but RxJS is far from dead. Here is where each one shines.',
    tags: ['signals', 'computed', 'effect'],
    relatedApp: 'about',
  },
  {
    slug: 'going-zoneless',
    title: 'Going Zoneless',
    date: '2026-07-08',
    summary:
      'Zone.js served Angular well for a decade, but zoneless change detection is faster, simpler, and finally production-ready.',
    tags: ['zoneless', 'signals', 'performance'],
    relatedApp: 'settings',
  },
  {
    slug: 'new-template-syntax',
    title: 'The New Template Syntax',
    date: '2026-07-10',
    summary:
      'Angular replaced *ngIf, *ngFor, and ngSwitch with @if, @for, and @switch — and the upgrade is more than cosmetic.',
    tags: ['control-flow', 'templates'],
    relatedApp: 'terminal',
  },
  {
    slug: 'lazy-loading-defer',
    title: 'Lazy Loading with @defer',
    date: '2026-07-11',
    summary:
      "Angular's @defer blocks bring component-level lazy loading with fine-grained triggers — a different beast from route-level code splitting.",
    tags: ['defer', 'lazy-loading', 'performance'],
    relatedApp: 'terminal',
  },
  {
    slug: 'httpresource-reactive',
    title: 'httpResource: Reactive Data Fetching',
    date: '2026-07-12',
    summary:
      'httpResource replaces the subscribe-in-ngOnInit pattern with a declarative, signal-based approach to async data.',
    tags: ['httpResource', 'resource', 'signals'],
    relatedApp: 'projects',
  },
  {
    slug: 'angular-forms',
    title: 'Forms in Angular: Still the Best',
    date: '2026-07-13',
    summary:
      "Angular's reactive forms remain a genuine competitive advantage — and model() makes simple cases even simpler.",
    tags: ['forms', 'model', 'two-way-binding'],
    relatedApp: 'contact',
  },
  {
    slug: 'dependency-injection',
    title: 'Dependency Injection Done Right',
    date: '2026-07-06',
    summary:
      "Angular's DI system is one of its strongest differentiators — and the inject() function made it even better.",
    tags: ['dependency-injection', 'architecture'],
    relatedApp: 'about',
  },
  {
    slug: 'standalone-everything',
    title: 'Standalone Everything',
    date: '2026-07-03',
    summary:
      "NgModules are Angular's past. Standalone components, directives, and pipes are its future — and the mental model is dramatically simpler.",
    tags: ['standalone', 'architecture', 'modules'],
    relatedApp: 'settings',
  },
  {
    slug: 'dynamic-components',
    title: 'Dynamic Components in Angular 21',
    date: '2026-07-09',
    summary:
      "Angular's createComponent API and NgComponentOutlet make dynamic rendering clean — this entire OS window system is built on it.",
    tags: ['createComponent', 'dynamic-components'],
    relatedApp: 'finder',
  },
  {
    slug: 'view-transitions-angular',
    title: 'View Transitions API in Angular',
    date: '2026-07-13',
    summary:
      'The View Transitions API gives browsers a native way to animate between DOM states — and Angular is finally making it practical to use.',
    tags: ['view-transitions', 'animations', 'performance'],
    relatedApp: 'settings',
  },
  {
    slug: 'incremental-hydration',
    title: 'Incremental Hydration vs Full Hydration',
    date: '2026-07-13',
    summary:
      'Full hydration replays your entire app on the client. Incremental hydration lets you hydrate only what the user actually interacts with — and the UX difference is real.',
    tags: ['ssr', 'hydration', 'performance'],
    relatedApp: 'terminal',
  },
  {
    slug: 'three-layer-a11y-testing',
    title: 'Three-Layer Accessibility Testing',
    date: '2026-07-13',
    summary:
      'Lint catches the easy stuff. Unit axe scans catch rendered violations. E2E axe scans catch integration-level failures. You need all three.',
    tags: ['accessibility', 'testing', 'wcag'],
    relatedApp: 'about',
  },
  {
    slug: 'building-an-os-to-learn',
    title: 'Building an OS to Learn a Framework',
    date: '2026-07-13',
    summary:
      'Why building a complex, self-contained project is the fastest way to learn a framework — and what Angular 21 gets right.',
    tags: ['angular', 'learning', 'architecture', 'meta'],
    relatedApp: 'about',
  },
  {
    slug: 'shared-design-system',
    title: 'Shared Design System: Token Bridging',
    date: '2026-07-13',
    summary:
      'How a shared design system feeds tokens into a macOS desktop simulator without replacing its visual identity.',
    tags: ['tokens', 'design-system', 'scss', 'architecture'],
    relatedApp: 'about',
  },
  {
    slug: 'mac-menu-bar',
    title: 'The macOS Menu Bar as Derived State',
    date: '2026-07-16',
    summary:
      'Building an interactive macOS menu bar where the entire menu model is a computed signal derived from window and dock state — not hand-maintained UI.',
    tags: ['signals', 'computed', 'state', 'architecture'],
    relatedApp: 'about',
  },
  {
    slug: 'hybrid-rendering',
    title: 'Hybrid Rendering: SSG the Content, CSR the App',
    date: '2026-08-05',
    summary:
      'One Angular app, two rendering strategies chosen per route: prerender the SEO-critical Thoughts pages to static HTML, keep the interactive desktop client-rendered.',
    tags: ['ssr', 'prerender', 'seo', 'hydration'],
    relatedApp: 'readme',
  },
  {
    slug: 'deploying-ssr',
    title: 'Shipping Angular SSR to Production',
    date: '2026-08-06',
    summary:
      'Building SSR is one thing; standing it up behind a CDN on a real domain is where the decisions live. The log of getting the prerendered Thoughts pages onto production — platform choice, Angular 21 security, the Cloudflare TLS gotcha, and the tradeoffs I made.',
    tags: ['ssr', 'deployment', 'railway', 'cloudflare'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-01-project-structure',
    title: 'Angular 01: Project structure',
    date: '2026-11-21',
    summary:
      'The first lesson in my Angular guide: how an app boots, how to lay out folders by feature, and how I enforce the layering with a test instead of a wiki page. Includes a live import checker.',
    tags: ['angular-guide', 'architecture', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-02-components',
    title: 'Angular 02: Components',
    date: '2026-11-21',
    summary:
      'Standalone components, input(), output(), model() and content projection, with a live demo of data crossing a component boundary. Built while extracting the reusable blocks every lesson page now uses.',
    tags: ['angular-guide', 'components', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-03-templates',
    title: 'Angular 03: Templates and binding',
    date: '2026-11-21',
    summary:
      'Property vs attribute binding, built-in control flow, pipes and host event bindings. Writing it turned up a keyboard handler that ran twice per keypress, and dates that would have shown the day before for half the world.',
    tags: ['angular-guide', 'templates', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-04-signals',
    title: 'Angular 04: Signals',
    date: '2026-11-21',
    summary:
      'signal, computed, effect, linkedSignal and resource, with demos of effect batching and a resettable selection. Built while making the reader follow its route and adding the previous/next links at the bottom of every lesson.',
    tags: ['angular-guide', 'signals', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-05-dependency-injection',
    title: 'Angular 05: Dependency injection',
    date: '2026-11-21',
    summary:
      'inject(), providers, InjectionTokens and the injector tree, with a live demo of shared vs per-component instances. Built while adding saved reading progress to this guide.',
    tags: ['angular-guide', 'dependency-injection', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-06-rxjs',
    title: 'Angular 06: RxJS and HTTP',
    date: '2026-11-21',
    summary:
      'Observables, the four higher-order mapping operators, interceptors and marble tests, with a live switchMap vs mergeMap race. Built while making the site retry requests that fail for a moment.',
    tags: ['angular-guide', 'rxjs', 'angular'],
    relatedApp: 'projects',
  },
  {
    slug: 'angular-07-routing',
    title: 'Angular 07: Routing',
    date: '2026-11-21',
    summary:
      'Route order, params as inputs, path vs query params, guards and server routes, with a playground that matches URLs against this site\'s real route table. Built while turning every tag into its own prerendered page.',
    tags: ['angular-guide', 'routing', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-08-forms',
    title: 'Angular 08: Forms',
    date: '2026-11-21',
    summary:
      'Reactive forms, custom and cross-field validators, FormArray, accessible errors, ControlValueAccessor and the new Signal Forms. Built while fixing a contact form that accepted blank messages and never said what was wrong.',
    tags: ['angular-guide', 'forms', 'angular'],
    relatedApp: 'contact',
  },
  {
    slug: 'angular-09-change-detection',
    title: 'Angular 09: Change detection',
    date: '2026-11-21',
    summary:
      'How zoneless change detection decides what to re-render, why OnPush skips mutated inputs, what signals change, and NG0100. Built while moving every component on this site to OnPush and adding a test that keeps it there.',
    tags: ['angular-guide', 'change-detection', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-10-directives',
    title: 'Angular 10: Directives',
    date: '2026-11-21',
    summary:
      'Attribute and structural directives, element selectors, host directives, and directives that find each other through DI. Built while adding an "On this page" nav that follows you down every lesson.',
    tags: ['angular-guide', 'directives', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-11-testing',
    title: 'Angular 11: Testing',
    date: '2026-11-21',
    summary:
      'Component specs with TestBed and axe, HttpTestingController with fake timers, marble tests, fitness tests and where e2e earns its place. Built while finding out my CI typecheck had been checking zero files.',
    tags: ['angular-guide', 'testing', 'angular'],
    relatedApp: 'contact',
  },
  {
    slug: 'angular-12-ssr',
    title: 'Angular 12: SSR and hydration',
    date: '2026-11-21',
    summary:
      'Render modes per route, hydration, TransferState, browser-only code, event replay and incremental hydration. Built while stopping every prerendered page from showing the time the site was built.',
    tags: ['angular-guide', 'ssr', 'angular'],
    relatedApp: 'readme',
  },
  {
    slug: 'angular-13-interview',
    title: 'Angular 13: Interview prep',
    date: '2026-11-21',
    summary:
      'The older Angular you will meet at work, how to migrate it, NgRx, and how to talk about what you have built. Ends with a practice deck of every interview question in the guide.',
    tags: ['angular-guide', 'interview', 'angular'],
    relatedApp: 'readme',
  },
];
