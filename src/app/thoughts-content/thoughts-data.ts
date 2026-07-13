export interface ThoughtEntry {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  content: string;
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
    content:
      'Angular Signals represent a fundamental shift in how Angular handles state and change detection. Instead of relying on Zone.js to monkey-patch every async API and trigger global change detection, signals provide fine-grained reactivity that only updates the parts of the DOM that actually changed.\n\nThis means fewer unnecessary re-renders, simpler mental models, and code that is easier to debug. Computed signals derive state declaratively, and effects handle side effects in a controlled way.\n\nThe migration path from Zone.js to signals is gradual — you can adopt signals incrementally while Zone.js continues to work alongside them.',
    relatedApp: 'about',
  },
  {
    slug: 'httpresource',
    title: 'httpResource: Async Without the Boilerplate',
    date: '2026-06-20',
    summary:
      'Angular 19 introduced httpResource as a declarative way to fetch data — no more manual subscribe/unsubscribe.',
    tags: ['httpResource', 'async', 'angular'],
    content:
      'Before httpResource, fetching data in Angular meant injecting HttpClient, subscribing to observables, handling loading and error states manually, and remembering to unsubscribe. httpResource wraps all of this into a single declarative primitive.\n\nYou declare what URL to fetch (which can be reactive via signals), and httpResource gives you signals for the value, status, error, and headers. It automatically cancels in-flight requests when the URL changes and cleans up on destroy.\n\nThis is a perfect example of Angular embracing signals as the foundation for async state management.',
    relatedApp: 'projects',
  },
  {
    slug: 'tdd-angular',
    title: 'TDD in Angular: Writing Tests That Matter',
    date: '2026-07-01',
    summary:
      'Test-driven development forces you to think about the API before the implementation. Here is how I apply it in Angular.',
    tags: ['testing', 'tdd', 'angular'],
    content:
      'TDD in Angular starts with writing a failing test that describes the behavior you want. This forces you to think about the component API — what inputs does it take, what outputs does it emit, what does it render?\n\nThe key insight is testing behavior, not implementation. Check that clicking a button emits the right event, not that a specific method was called internally. Use TestBed for component tests, but keep services as plain unit tests when possible.\n\nThe red-green-refactor cycle keeps you focused: write the minimum test, write the minimum code to pass, then clean up.',
    relatedApp: 'terminal',
  },
  {
    slug: 'signals-over-rxjs',
    title: 'Why Signals Over RxJS',
    date: '2026-07-05',
    summary:
      'Signals replaced RxJS for UI state management in Angular — but RxJS is far from dead. Here is where each one shines.',
    tags: ['signals', 'computed', 'effect'],
    content: `For years, the Angular way to manage state was RxJS. BehaviorSubjects, combineLatest, switchMap chains — it worked, but it came with a tax. Every piece of UI state required an observable, a subscription, and cleanup logic. Developers spent more time wiring plumbing than solving problems.

Signals changed the equation. A signal is a synchronous, glitch-free reactive primitive. You read it with a function call, you set it with .set() or .update(), and Angular knows exactly which part of the template depends on it. No subscriptions. No async pipes. No takeUntilDestroyed. Just a value that the framework tracks automatically.

The real power shows up with computed(). Instead of writing combineLatest([a$, b$]).pipe(map(([a, b]) => a + b)), you write computed(() => a() + b()). It is synchronous, it is lazy (only recalculates when read and a dependency changed), and it is automatically memoized. The dependency graph is implicit — you do not declare it, Angular infers it from which signals you read inside the function.

Effects fill the gap for side effects: logging, localStorage sync, analytics. They run after signals stabilize, so you never see intermediate states. But they are deliberately limited — you cannot write to signals inside an effect without opting in, because the framework wants to push you toward computed() for derived state instead.

So where does RxJS still win? Streams. If you are debouncing user input, retrying failed HTTP requests, racing WebSocket messages against timeouts, or coordinating complex async workflows — RxJS is still the right tool. Observables model event streams over time, and signals model synchronous snapshots of state. They solve different problems.

The practical migration path is straightforward: replace BehaviorSubjects that back template bindings with signals. Keep observables for anything that is genuinely asynchronous or stream-oriented. Use toSignal() and toObservable() at the boundary when the two worlds need to talk.

What I have found in practice is that about 80% of the RxJS in a typical Angular app was there because there was no simpler alternative. Signals are that simpler alternative. The remaining 20% — the genuinely complex async logic — is where RxJS continues to shine, and it shines brighter when it is not drowning in boilerplate that signals handle better.`,
    relatedApp: 'about',
  },
  {
    slug: 'going-zoneless',
    title: 'Going Zoneless',
    date: '2026-07-08',
    summary:
      'Zone.js served Angular well for a decade, but zoneless change detection is faster, simpler, and finally production-ready.',
    tags: ['zoneless', 'signals', 'performance'],
    content: `Zone.js was one of Angular's most clever and most cursed ideas. It monkey-patched every asynchronous browser API — setTimeout, Promise.then, addEventListener, fetch, XMLHttpRequest — so that Angular could detect when something might have changed and re-run change detection across the entire component tree. It was invisible magic that made things "just work."

Until it did not. Zone.js added roughly 100KB to your bundle. It broke native async/await (forcing downleveling for years). It triggered change detection far more often than necessary — a mousemove handler that updated zero state would still cause Angular to dirty-check every component. And debugging was a nightmare because your stack traces were wrapped in Zone frames.

Zoneless Angular, enabled with provideZonelessChangeDetection(), replaces all of that with explicit reactivity. The framework only re-renders a component when a signal it reads actually changes. No monkey-patching, no global change detection cycles, no wasted work.

The performance difference is real but nuanced. For small apps, you will not notice much. For apps with deep component trees, frequent events (scroll, mousemove, resize), or heavy computed state, zoneless can cut change detection work by 80% or more. The key insight is that Zone.js was O(n) on the component tree size for every async event, while signals are O(k) where k is the number of components that actually depend on the changed value.

The gotchas are worth knowing. Third-party libraries that relied on Zone.js to trigger change detection — things that mutated state inside setTimeout callbacks without markForCheck() — will not work automatically. You need to either wrap them in signals or call ChangeDetectorRef.markForCheck() manually. Testing also changes: you cannot rely on fixture.whenStable() waiting for Zone to drain, because there is no Zone. Instead, you use TestBed.flushEffects() or await the specific async operation you care about.

My recommendation: start new projects zoneless from day one. For existing apps, adopt signals incrementally, and flip the switch to zoneless once your critical paths no longer rely on Zone.js magic. The migration is gradual, not a cliff. And once you are fully zoneless, you will never want to go back — the debuggability alone is worth it.`,
    relatedApp: 'settings',
  },
  {
    slug: 'new-template-syntax',
    title: 'The New Template Syntax',
    date: '2026-07-10',
    summary:
      'Angular replaced *ngIf, *ngFor, and ngSwitch with @if, @for, and @switch — and the upgrade is more than cosmetic.',
    tags: ['control-flow', 'templates'],
    content: `Angular's structural directives — *ngIf, *ngFor, [ngSwitch] — worked fine for a decade. But they had real limitations that the new built-in control flow syntax fixes.

Start with @if. The old *ngIf="condition; else elseBlock" required a separate ng-template with a reference variable. The new syntax reads like actual code: @if (user(); as u) { <span>{{ u.name }}</span> } @else { <span>Guest</span> }. The as-binding narrows the type automatically, so u is non-nullable inside the block. No more defensive optional chaining on a value you already null-checked.

@for is the biggest improvement. *ngFor required trackBy to be a method reference on the component class, and most developers forgot it entirely, causing performance bugs. The new @for (item of items(); track item.id) makes tracking mandatory and inline. You cannot forget it, and you do not need a separate method. It also gives you @empty — a built-in way to render fallback content when the collection is empty, replacing the *ngIf="items.length > 0" / *ngIf="items.length === 0" pattern.

@switch brings exhaustive checking. With the old [ngSwitch], you had no compile-time guarantee that all cases were handled. The new @switch lets the compiler verify coverage when used with union types. Miss a case, and TypeScript tells you at build time, not at runtime when a user hits an unhandled state.

The migration itself is mechanical. Angular provides an automatic schematic (ng generate @angular/core:control-flow) that converts existing structural directives to the new syntax. It handles the straightforward cases well — *ngIf becomes @if, *ngFor becomes @for with a track expression inferred from any existing trackBy function. Edge cases around nested ng-templates sometimes need manual cleanup, but the 90% case is fully automated.

There is also a subtle performance benefit. The old structural directives were general-purpose — Angular had to instantiate a directive class, manage its lifecycle, and handle the template ref. The new control flow is compiled directly into the component's template function by the Angular compiler. There is no directive overhead at all. For components that render hundreds of @for iterations, this matters.

One thing I appreciate about the rollout: Angular did not deprecate the old syntax overnight. Both work side by side, so you can migrate incrementally. But once you have used @if and @for in a few components, the old *ngIf syntax feels clunky. The new syntax is just how templates should have always worked.`,
    relatedApp: 'terminal',
  },
];
