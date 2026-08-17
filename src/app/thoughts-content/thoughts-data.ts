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
];
