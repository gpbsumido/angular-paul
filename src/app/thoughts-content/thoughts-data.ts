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
  {
    slug: 'lazy-loading-defer',
    title: 'Lazy Loading with @defer',
    date: '2026-07-11',
    summary:
      "Angular's @defer blocks bring component-level lazy loading with fine-grained triggers — a different beast from route-level code splitting.",
    tags: ['defer', 'lazy-loading', 'performance'],
    content: `Route-level lazy loading has been an Angular staple since the early days. You split your app at route boundaries, and the router loads each chunk on navigation. It works well, but it is coarse-grained. What about the heavy chart library that only renders when the user scrolls down? Or the rich text editor that should not load until someone clicks "Edit"?

@defer solves this at the component level. You wrap any piece of template in @defer, and Angular splits it into a separate chunk at build time. The chunk only loads when a trigger condition is met. No manual dynamic imports, no ViewContainerRef gymnastics, no service to manage loading state. The framework handles all of it.

The triggers are where it gets interesting. @defer (on viewport) loads when the placeholder scrolls into view — perfect for below-the-fold content. @defer (on interaction) waits for a click, focus, or keypress on the placeholder or a specific element — ideal for tools that activate on demand, like a terminal or editor. @defer (on idle) uses requestIdleCallback to load when the browser has spare cycles, which is great for preloading non-critical UI after the initial render settles. @defer (on hover) loads when the user hovers, giving you a head start before they click. @defer (on timer(500ms)) loads after a fixed delay, useful for staggering chunk downloads.

You can combine triggers: @defer (on viewport; on timer(5s)) loads whichever happens first. And every @defer block supports three companion blocks. @placeholder shows content before loading starts. @loading shows content during the fetch, with optional minimum and after parameters to prevent flash-of-loading-state. @error shows fallback content if the chunk fails to load.

The bundle size impact is measurable. In this portfolio app, wrapping the terminal component in @defer (on interaction) moved about 15KB out of the initial bundle. That is not transformative for a small app, but in a large enterprise application with dozens of feature components, deferring non-critical UI can cut initial load time significantly. The key insight is that @defer is cheap to add — the compiler does the code splitting automatically, so there is no architectural refactoring required.

One nuance: @defer is not a replacement for route-level lazy loading. Routes split at navigation boundaries, @defer splits within a single view. Use routes for page-level chunks and @defer for component-level chunks within those pages. They compose naturally.`,
    relatedApp: 'terminal',
  },
  {
    slug: 'httpresource-reactive',
    title: 'httpResource: Reactive Data Fetching',
    date: '2026-07-12',
    summary:
      'httpResource replaces the subscribe-in-ngOnInit pattern with a declarative, signal-based approach to async data.',
    tags: ['httpResource', 'resource', 'signals'],
    content: `The old Angular pattern for fetching data was remarkably verbose. Inject HttpClient. Create a subject or signal for loading state. Create another for error state. Subscribe in ngOnInit. Pipe through takeUntilDestroyed. Set loading to true, then false on completion. Handle errors in the catchError operator. Repeat for every data source in every component.

httpResource collapses all of that into a single declaration. You pass it a URL (or a function that returns a URL), and it gives you a resource object with signals for value, status, error, headers, and statusCode. The status signal is a union type — idle, loading, reloading, resolved, error, local — so you can drive your template with a single @switch instead of juggling multiple boolean flags.

The reactive URL is the key feature. When you pass a function, httpResource tracks any signals read inside it. Change a signal, and the resource automatically cancels the in-flight request and fetches the new URL. This is how the Projects app in this portfolio works: the service has a search signal, and the httpResource re-fetches whenever it changes. No manual subscription management, no switchMap, no race condition bugs.

If you have used React Query or SWR, the mental model is similar: declare what data you need as a function of your current state, and let the framework handle the fetching lifecycle. But Angular's version is more tightly integrated — httpResource is built on the same resource() primitive that underlies all async signals, and it works with Angular's dependency injection for HttpClient interceptors, testing, and SSR.

For testing, httpResource works with HttpClientTesting just like regular HttpClient calls. You provide provideHttpClientTesting(), flush the expected request, and assert against the resource's value signal. The only gotcha in zoneless apps is that you need to flush effects or await fixture.whenStable() before the resource sends its first request, because there is no Zone.js to trigger the initial effect automatically.

The pattern I have settled on is: httpResource in a service for the data layer, computed signals in the component for filtering and transformation, and @if / @switch in the template for rendering states. Each layer does one thing. The service owns the fetch. The component owns the view logic. The template owns the rendering. Clean separation, zero boilerplate.

One thing httpResource does not do is caching or deduplication across components. If two components create httpResources pointing at the same URL, you get two requests. For shared data, put the resource in a service and inject it. This is a deliberate design choice — implicit caching creates subtle bugs, and Angular prefers explicit over magic.`,
    relatedApp: 'projects',
  },
  {
    slug: 'angular-forms',
    title: 'Forms in Angular: Still the Best',
    date: '2026-07-13',
    summary:
      "Angular's reactive forms remain a genuine competitive advantage — and model() makes simple cases even simpler.",
    tags: ['forms', 'model', 'two-way-binding'],
    content: `Every framework handles forms. Most handle them poorly. Angular's reactive forms are, genuinely, one of the best form systems in any frontend framework — and they have only gotten better with recent additions like typed forms and the model() signal.

Reactive forms give you a FormGroup as a programmatic object. You can validate, transform, watch, and test it without touching the DOM. The form is a data structure, not a side effect of template bindings. This matters enormously for complex forms — multi-step wizards, dynamic field arrays, conditional validation, cross-field validators. Try building a form where field B's validation depends on field A's value in a framework without reactive forms, and you will appreciate what Angular gives you for free.

Typed forms, introduced in Angular 14, made this even better. FormBuilder.nonNullable.group() gives you compile-time type safety on form values. Access form.controls.email and TypeScript knows the type. Call form.value and the shape is inferred. No more casting, no more runtime surprises.

But reactive forms are heavy machinery for simple cases. A settings toggle, a search input, a single-field filter — wiring up a FormControl for these feels like overkill. This is where model() comes in. It creates a two-way bindable signal: the parent passes a value in, the child can update it, and the change flows back automatically. In the template, you bind with [(value)]="signal", and it just works. No Output + Input boilerplate, no event emitter, no ngModelChange handler.

The mental model I use: if the form is the feature (a contact form, a registration page, an admin editor), use reactive forms. If the form control is incidental to the feature (a filter, a toggle, a slider in a settings pane), use model() or plain signals with event bindings.

Template-driven forms still exist, and they are fine for prototyping. But I would not use them in production code. They hide too much — validation state lives in the template, testing requires DOM queries, and complex logic becomes template soup. Reactive forms keep logic in TypeScript where it belongs.

One underrated feature: reactive forms compose. You can nest FormGroups, build FormArrays dynamically, and create reusable form fragments as components that accept a FormGroup input. The parent owns the form structure, child components own the UI for their section. This pattern scales to arbitrarily complex forms without becoming unmaintainable.

The contact form in this portfolio is a simple example — three fields, required and email validators, submission state managed by a signal. But the same patterns scale to enterprise forms with hundreds of fields. That is the point: Angular forms do not force you to choose between simple and powerful.`,
    relatedApp: 'contact',
  },
  {
    slug: 'dependency-injection',
    title: 'Dependency Injection Done Right',
    date: '2026-07-06',
    summary:
      "Angular's DI system is one of its strongest differentiators — and the inject() function made it even better.",
    tags: ['dependency-injection', 'architecture'],
    content: `React developers prop-drill or reach for context. Vue developers use provide/inject with limited typing. Angular developers just ask for what they need, and the framework hands it over.

Angular's dependency injection is a hierarchical injector system baked into the framework from day one. Every component, directive, and service can declare its dependencies, and Angular resolves them automatically through the injector tree. This is not a library bolted on top — it is a first-class architectural feature that shapes how you design applications.

The inject() function, introduced as a replacement for constructor-based injection, is where things got cleaner. Instead of a constructor with six parameters — constructor(private http: HttpClient, private router: Router, private store: Store, ...) — you write inject(HttpClient) at the field level. It is more readable, works in functions outside of classes, and enables patterns that were awkward with constructor injection, like injecting into factory functions or utility composables.

The providedIn: 'root' pattern is the default for services, and it is the right default. A root-provided service is a singleton, tree-shaken if unused, and requires zero configuration in any module or component. You write @Injectable({ providedIn: 'root' }) and the service exists everywhere. This eliminated an entire category of bugs where developers forgot to add a service to a module's providers array.

But component-level providing is where DI gets powerful. Provide a service at the component level and each instance of that component gets its own service instance. This is how you build isolated, reusable feature components. A data table component with its own sorting service. A form wizard with its own step-tracking service. Each instance is independent, with no shared state leaking between them.

The injector hierarchy also enables elegant overriding. Need a mock logger in tests? Provide it at the test module level. Need a different HTTP interceptor in one feature area? Provide it at that component's level. The child injector shadows the parent, and the consuming code never knows the difference.

One pattern I use frequently is injection tokens with factory providers. You define an InjectionToken<Config>, provide it with a useFactory that reads from environment or computes at runtime, and inject it wherever needed. This decouples configuration from implementation cleanly — the component asks for Config, not for "the thing that reads environment variables."

Compare this to React, where sharing a service-like object means either prop drilling, wrapping in a context provider, or reaching for a third-party state management library. Angular's DI is built-in, typed, hierarchical, and testable. It is one of those features that you do not appreciate until you work without it.`,
    relatedApp: 'about',
  },
  {
    slug: 'standalone-everything',
    title: 'Standalone Everything',
    date: '2026-07-03',
    summary:
      "NgModules are Angular's past. Standalone components, directives, and pipes are its future — and the mental model is dramatically simpler.",
    tags: ['standalone', 'architecture', 'modules'],
    content: `NgModules were Angular's answer to organizing code. They grouped components, declared dependencies, and configured providers. They also confused nearly every developer who ever touched Angular for the first time.

The problem was not that modules were bad in theory. The problem was that they created an indirection layer between "I wrote a component" and "I can use this component." You had to declare the component in a module, export it from that module, import that module into another module, and only then could you use the component in a template. Forget any step, and you got an unhelpful error. Circular module dependencies were common. Shared modules became dumping grounds. Feature modules accumulated providers that leaked into the global injector.

Standalone components eliminated all of this. A standalone component declares its own dependencies in its imports array. It does not need a module. It does not need to be declared anywhere. You import the component directly where you use it. The dependency graph is explicit and local — you can look at a single file and know exactly what it depends on.

This is how every component in this portfolio works. The Dock component imports nothing except the services it injects. The Window component is self-contained. The AboutApp, TerminalApp, ContactApp — each one is a standalone component that declares exactly what it needs. No shared module, no feature module, no core module. Just components.

The migration from NgModules to standalone was surprisingly smooth. Angular provides a schematic that converts module-based components to standalone automatically. It moves declarations to imports, removes the module file, and updates references. For most apps, the mechanical conversion takes minutes. The harder part is untangling shared modules that accumulated unrelated components — but that is a design problem, not a migration problem.

Standalone also changed how lazy loading works. Instead of loadChildren pointing to a module, you use loadComponent pointing directly to a component. The router does not need a module as an entry point anymore. This reduced the boilerplate for adding a new lazy route from "create a component, create a module, configure the module's routes, reference the module in the parent router" to "create a component, add a loadComponent route." One step instead of four.

Pipes and directives are standalone too. A standalone pipe can be imported directly into a component's imports array. No more declaring it in a shared module just so three components can use it. The dependency is explicit, local, and tree-shakeable.

The mental model shift is the real win. With modules, you thought in terms of "which module owns this?" With standalone, you think in terms of "what does this component need?" The second question is simpler, more local, and produces better-organized code.`,
    relatedApp: 'settings',
  },
  {
    slug: 'dynamic-components',
    title: 'Dynamic Components in Angular 21',
    date: '2026-07-09',
    summary:
      "Angular's createComponent API and NgComponentOutlet make dynamic rendering clean — this entire OS window system is built on it.",
    tags: ['createComponent', 'dynamic-components'],
    content: `Most Angular apps render components statically — you write <app-header> in a template and Angular creates the component at that spot. But some use cases need to render components determined at runtime. A plugin system. A dashboard with configurable widgets. Or, in this case, a desktop OS where clicking a dock icon opens a window containing an arbitrary app component.

Angular offers two main approaches for dynamic components. NgComponentOutlet is the template-driven option: you pass it a component class, and it renders that component inline. This is what the window manager in this portfolio uses. The root template iterates over launched windows with @for, and each window contains <ng-container *ngComponentOutlet="launched.component" />. The component class comes from the AppLauncherService registry — when you click "Terminal" in the dock, the service looks up TerminalApp and passes it to NgComponentOutlet.

The programmatic alternative is createComponent(), available through ViewContainerRef or the environment injector. You call viewContainerRef.createComponent(SomeComponent), and Angular instantiates it, runs its lifecycle, and inserts it into the DOM. This gives you more control — you can set inputs programmatically, subscribe to outputs, and destroy the component explicitly. It is the right choice when you need fine-grained lifecycle management.

Angular 21 made both approaches cleaner. Input binding on dynamically created components now works through the setInput() method on ComponentRef, which triggers the same signal-based input flow as static template bindings. You can set inputs after creation, and the component reacts exactly as if the input changed in a parent template. Before this improvement, passing data to dynamic components required injectors or services — now it is a single method call.

The architecture of this portfolio's window system shows the pattern in practice. The AppLauncherService maintains a registry mapping app IDs to component types. When an app is launched, it creates a LaunchedWindow record with the component class and a window ID. The root component iterates over these records, rendering each one inside an <app-window> wrapper with NgComponentOutlet. The window provides chrome — title bar, resize handles, close button — while the dynamic component provides content.

This separation works because Angular's DI hierarchy makes the dynamic component a natural child of the window. The dynamic component can inject services, respond to signals, and participate in change detection exactly like a static component. There is no special lifecycle, no manual bootstrapping, no loss of framework features.

One gotcha: NgComponentOutlet destroys and recreates the component when the class reference changes. If you swap the component type, the old instance is destroyed and a new one is created — state is not preserved. For this window system, that is fine because each window has a stable component class. But if you are building a tab system where tabs swap components, you may want to cache instances manually.

The broader lesson is that Angular treats dynamic components as first-class citizens. They are not an escape hatch or an advanced pattern reserved for library authors. They are a normal tool for normal problems, and the framework supports them with the same DI, change detection, and lifecycle guarantees as static components.`,
    relatedApp: 'finder',
  },
  {
    slug: 'view-transitions-angular',
    title: 'View Transitions API in Angular',
    date: '2026-07-13',
    summary:
      'The View Transitions API gives browsers a native way to animate between DOM states — and Angular is finally making it practical to use.',
    tags: ['view-transitions', 'animations', 'performance'],
    content: `The View Transitions API lets you tell the browser "I am about to change the DOM — please animate smoothly between the old state and the new one." You call document.startViewTransition(), update the DOM inside the callback, and the browser captures before/after snapshots and crossfades them. No JavaScript animation library, no manually tracking element positions, no requestAnimationFrame loops.

For Angular, this is a big deal. Traditional Angular animations (@angular/animations) work by declaring state machines in component metadata — enter, leave, transition triggers. They are powerful but verbose, tightly coupled to component lifecycle, and add bundle weight. The View Transitions API replaces most of that with a single browser primitive.

The practical pattern in Angular is straightforward. When you open a window, you wrap the DOM mutation (adding the component, updating signals) inside document.startViewTransition(). The browser snapshots the before state (no window), you add the window, it snapshots the after state, and it crossfades. For closing, same thing in reverse. For minimize, you can set view-transition-name on the window element and the dock icon, and the browser will morph between them automatically.

The catch is feature detection. Safari shipped View Transitions in 18.2, Chrome in 111, but Firefox is still behind a flag as of mid-2026. So you need a fallback. The cleanest approach is a service that checks document.startViewTransition existence once and returns either real animation configs or no-op configs. The rest of your code does not branch on browser support — it always asks the service for configs, and the service handles the fallback transparently.

There are a few gotchas worth knowing. View Transitions capture the visual state as a bitmap, so they do not animate internal component changes — only the transition between two stable states. You need to make sure the DOM update is synchronous inside the callback, which works naturally with Angular signals (set the signal, change detection runs, DOM updates). Also, view-transition-name must be unique across the entire document — two elements with the same name will break the transition.

The performance story is excellent. Because the browser handles the compositing, transitions run on the GPU compositor thread. They do not block the main thread, they do not cause layout thrashing, and they do not require JavaScript to run every frame. This is the same pipeline the browser uses for CSS transitions, so it is as fast as animations can get.

The migration path from @angular/animations is gradual. You can keep existing Angular animations for complex multi-step sequences (staggered lists, keyframe chains) and use View Transitions for simple state changes (open, close, navigate). Over time, as browser support solidifies, you can replace more Angular animations with View Transitions and shrink your bundle.`,
    relatedApp: 'settings',
  },
  {
    slug: 'incremental-hydration',
    title: 'Incremental Hydration vs Full Hydration',
    date: '2026-07-13',
    summary:
      'Full hydration replays your entire app on the client. Incremental hydration lets you hydrate only what the user actually interacts with — and the UX difference is real.',
    tags: ['ssr', 'hydration', 'performance'],
    content: `Traditional SSR hydration works by rendering your app on the server, sending the HTML to the client, then re-executing the entire application on the client to make it interactive. The user sees content quickly (good), but nothing is clickable until the full JavaScript bundle downloads, parses, and re-renders every component (bad). For a complex app like a desktop environment with multiple potential windows, this is wasteful — why hydrate the Terminal component if the user never opens Terminal?

Incremental hydration solves this by letting you mark parts of the app as "hydrate later." Angular's withIncrementalHydration() provider combined with @defer blocks gives you fine-grained control. The server renders everything into HTML, but the client only hydrates components when their defer trigger fires — on idle, on interaction, on viewport entry, or on timer.

For a desktop OS app, the strategy is layered. The shell — menu bar, dock, desktop icons — hydrates immediately because the user interacts with it right away. App windows hydrate on demand because they only exist when launched. The Spotlight search index loads on idle because the user might hit Cmd+Space at any time, but it is not critical for initial render.

The UX tradeoff is subtle but important. Full hydration gives you a single "everything works" moment — there is a brief period where nothing is interactive, then everything is. Incremental hydration gives you a gradual ramp-up — the shell is interactive immediately, but if you open an app in the first 100ms, there might be a brief delay while that specific component hydrates. In practice, users do not open apps in the first 100ms, so incremental hydration feels faster for real usage even though the total hydration work is the same.

The implementation is straightforward. You add withIncrementalHydration() to your provideClientHydration() call, then wrap deferred content in @defer blocks with appropriate triggers. Angular's SSR engine renders the deferred content on the server (so it appears in the initial HTML), but the client skips hydrating it until the trigger fires. The server-rendered HTML stays visible and styled — it just is not interactive until hydration completes.

One gotcha: event replay. If a user clicks a button inside a deferred block before it hydrates, Angular needs to capture that event and replay it after hydration. The withEventReplay() feature handles this — it records events on server-rendered elements and replays them once the component is live. Without it, early clicks are silently lost.

The bundle size impact is real. With full hydration, the browser must download and parse every component upfront. With incremental hydration, lazy-loaded components stay in separate chunks that only download when needed. For this portfolio, that means the Terminal, Settings, and Finder chunks never load unless the user opens those apps.`,
    relatedApp: 'terminal',
  },
  {
    slug: 'three-layer-a11y-testing',
    title: 'Three-Layer Accessibility Testing',
    date: '2026-07-13',
    summary:
      'Lint catches the easy stuff. Unit axe scans catch rendered violations. E2E axe scans catch integration-level failures. You need all three.',
    tags: ['accessibility', 'testing', 'wcag'],
    content: `Accessibility testing that only runs one tool at one stage catches maybe 30% of issues. The approach that actually works uses three layers, each catching different classes of problems, gated on every pull request.

Layer one is lint-time static analysis. For Angular, angular-eslint's template-accessibility config catches the obvious mistakes — click handlers without keyboard events, images without alt text, labels not associated with controls, empty buttons. These rules run instantly, surface in the editor, and block CI. They catch the low-hanging fruit that developers introduce by habit: a div with (click) that should be a button, a form label without a for attribute.

Layer two is unit-level axe scanning with vitest-axe. You render a component in the test environment and run axe-core against the resulting DOM. This catches violations that only appear after Angular's template engine runs — conditional rendering, dynamic attributes, computed ARIA states. The key insight is configuring axe to WCAG 2.1 AA standards specifically (wcag2a, wcag2aa, wcag21a, wcag21aa tags), not running every rule. Running every rule produces false positives that erode trust in the tool.

Layer three is E2E axe scanning with @axe-core/playwright. This runs axe against the real application in a real browser with real CSS applied. It catches violations that only manifest at integration level — z-index stacking that hides focusable elements, CSS that makes text unreadable, viewport-dependent layout issues, dynamic content loaded after user interaction. The E2E layer also tests semantic structure: landmarks, skip links, focus management.

The three layers are complementary, not redundant. Lint catches patterns, unit axe catches rendered output, E2E axe catches the assembled application. A label-has-associated-control lint rule catches a missing for attribute. A unit axe scan catches a dynamic [attr.aria-label] that evaluates to empty string. An E2E axe scan catches a dialog that traps focus because the close button is behind an overlay.

The CI gate is non-negotiable. If any layer fails, the PR cannot merge. This prevents accessibility regressions from sneaking in through well-intentioned feature work. The developer fixes the violation before review, not after. Retrofitting accessibility is ten times harder than building it in.`,
    relatedApp: 'about',
  },
  {
    slug: 'building-an-os-to-learn',
    title: 'Building an OS to Learn a Framework',
    date: '2026-07-13',
    summary:
      'Why building a complex, self-contained project is the fastest way to learn a framework — and what Angular 21 gets right.',
    tags: ['angular', 'learning', 'architecture', 'meta'],
    content: `The best way to learn a framework is to build something too complex for a tutorial. Tutorials teach syntax. Complex projects teach judgment — when to reach for a signal vs a computed, when lazy loading matters, when an abstraction earns its cost.

Building a desktop OS in Angular forced decisions that no todo app ever would. A window manager needs z-index state shared across components. A dock needs to track which apps are running, focused, or minimized. Spotlight search needs to query across apps, files, and thought entries with a unified interface. A keyboard shortcut service needs to intercept global events without conflicting with text inputs. Each of these problems maps to a different Angular feature, and each feature reveals its design philosophy only under real pressure.

Signals are the clearest example. In a simple component, signal() looks like a verbose version of a class property. In a window manager tracking focus across a dozen windows, computed() and effect() become essential — derived state stays consistent without manual synchronization, and side effects happen in controlled boundaries. The mental model shifts from "update everything on change" to "declare relationships and let the framework figure it out." You only internalize that shift by needing it.

Zoneless change detection is another feature that only proves itself at scale. Removing Zone.js from a counter app saves a few kilobytes. Removing it from a desktop with windows, dock magnification, drag-and-resize, and context menus eliminates an entire category of debugging: no more "why did the whole tree re-render when I moved a window?" The 0 ms total blocking time in Lighthouse is not an accident — it is the direct result of fine-grained reactivity replacing global change detection.

What Angular 21 gets right: standalone components killed NgModules without breaking anything. The new template syntax (@if, @for, @defer) reads like a template language rather than a DSL fighting HTML. Dependency injection with providedIn: 'root' makes shared state trivial. Incremental hydration means SSR does not have to be all-or-nothing. The signal-based input/output API is cleaner than decorators. The framework opinion on structure — services for state, components for views, clear separation — scales in ways that "freedom to choose" frameworks do not.

What could be better: @defer is powerful but the prefetch API is limited — you cannot prefetch based on route proximity or viewport intersection of a trigger element. Dynamic component rendering via NgComponentOutlet works but lacks a first-class lazy variant that integrates with @defer. The testing story improved with vitest support, but configuring vitest-axe and Playwright axe requires manual wiring that could be built in. Error messages are excellent for template errors but still cryptic for dependency injection failures.

The meta-lesson is that building something real — something with enough moving parts to break your assumptions — teaches framework thinking, not just framework syntax. Every feature I used in this project, I understood because I needed it, not because I read about it. That is the difference between knowing a framework and knowing how to use one.`,
    relatedApp: 'about',
  },
];
