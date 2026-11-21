import type { InterviewQuestion } from './interview-questions';

/**
 * Every lesson's interview questions, keyed by the lesson's slug.
 *
 * They used to live inside each lesson component. Lesson 13's practice deck
 * needs all of them, and importing every lesson component to get at its
 * questions would pull all twelve pages into one chunk, so the data lives here
 * and each lesson reads its own entry.
 */
export const INTERVIEW_BANK: Record<string, readonly InterviewQuestion[]> = {
  'angular-01-project-structure': [
    {
      q: 'How would you structure a large Angular app?',
      a: 'By feature, with three layers: a thin shell, shared building blocks, and lazy-loaded feature folders. Dependencies point one way: features and shell depend on shared, never on each other. I enforce that with a lint rule or a fitness test, because a convention nobody checks decays.',
    },
    {
      q: 'What replaced AppModule?',
      a: 'bootstrapApplication(RootComponent, appConfig). appConfig holds the providers an AppModule used to import, as provideRouter, provideHttpClient and so on. Components declare their own dependencies in imports: [] instead of a module doing it for them.',
    },
    {
      q: "What's the difference between providers in app.config.ts and in a route?",
      a: "app.config.ts providers live in the root environment injector: one instance for the whole app. A route's providers array creates a child environment injector, so the service exists only for that route subtree and can be lazy loaded with it.",
    },
    {
      q: 'Why are barrel files risky in Angular?',
      a: 'They hide the real dependency graph. Circular imports appear easily, and importing one symbol from a barrel can drag in the whole folder, including a feature you meant to lazy load, which defeats code splitting.',
    },
    {
      q: 'Which tsconfig and compiler flags would you insist on?',
      a: 'strict for TypeScript, and strictTemplates in angularCompilerOptions so bindings are type-checked in templates. Turning them off hides real bugs, such as passing a possibly-undefined value to an input.',
    },
  ],
  'angular-02-components': [
    {
      q: 'What makes a component standalone, and why did Angular move to it?',
      a: 'It declares its own dependencies in imports: [] instead of belonging to an NgModule. The dependency graph is explicit per component, lazy loading works at component granularity, and there is one fewer concept to learn. Standalone has been the default since v19.',
    },
    {
      q: 'input() vs @Input()?',
      a: 'input() returns a read-only signal, so you derive from it with computed() and there is no need for ngOnChanges. It supports required inputs and transforms, and the compiler type-checks it. @Input() is a decorated mutable field and still everywhere in older code.',
    },
    {
      q: 'How does two-way binding work?',
      a: 'It is sugar. [(x)]="v" expands to [x]="v" (xChange)="v = $event". model() declares both halves at once. With a signal you pass the signal itself, [(count)]="count", and Angular writes to it.',
    },
    {
      q: 'What is content projection and when would you use multi-slot?',
      a: 'Passing markup from parent into a child through <ng-content>. Multi-slot uses select with a CSS selector to route parts, for example a card with header, body and footer slots. The parent still owns the projected content: it is created and change-detected as part of the parent.',
    },
    {
      q: 'How do you create a component dynamically?',
      a: 'Declaratively with NgComponentOutlet (inputs via ngComponentOutletInputs), or imperatively with ViewContainerRef.createComponent(). Combine either with a dynamic import() so the component is its own lazy chunk. This site loads every lesson page that way.',
    },
    {
      q: 'What are the view encapsulation modes?',
      a: 'Emulated (default) rewrites selectors with generated attributes so styles stay scoped. None makes them global. ShadowDom uses native shadow roots. Use None sparingly and scope selectors by hand. ::ng-deep is deprecated.',
    },
  ],
  'angular-03-templates': [
    {
      q: "What's the difference between property binding and attribute binding?",
      a: '[x] sets the DOM property, the live value. [attr.x] sets the HTML attribute, the initial value. They diverge for things like an input value after typing. Use attr only when there is no property, such as aria-*, colspan or SVG attributes.',
    },
    {
      q: 'Why does @for require track, and what should you track by?',
      a: 'track lets Angular map items to DOM rows across changes, so it can move or keep rows instead of recreating them. Track a stable unique id. $index is only safe for static lists that never reorder or delete.',
    },
    {
      q: 'Pure vs impure pipes?',
      a: 'A pure pipe re-runs only when its input reference changes, so it is effectively memoised per binding. An impure pipe runs on every change detection pass. Most custom pipes should be pure. AsyncPipe is the classic impure one, because it has to check for new emissions.',
    },
    {
      q: 'Built-in control flow vs *ngIf / *ngFor?',
      a: "@if, @for and @switch are part of the template language. They need no imports, @if narrows types, @for makes tracking mandatory and has @empty, and they're faster. The structural directives desugar to ng-template plus a directive and are still common in older code. There's an automatic migration: ng generate @angular/core:control-flow.",
    },
    {
      q: 'How do you listen to a global event like keydown on document?',
      a: "host: { '(document:keydown)': 'onKey($event)' } in the component metadata, or @HostListener in older code. Both clean themselves up when the component is destroyed. Never add a raw addEventListener without removing it in DestroyRef.",
    },
    {
      q: 'How does Angular protect against XSS in templates?',
      a: 'Interpolation is always text-escaped, and values bound into innerHTML, URLs and styles are sanitized by context. bypassSecurityTrust* disables that for one value, so it should only ever see trusted input.',
    },
  ],
  'angular-04-signals': [
    {
      q: 'What problem do signals solve compared to Zone.js change detection?',
      a: 'Zone.js patched every async API and re-checked the whole component tree after any event, because Angular could not know what changed. Signals record exactly which views read which values, so Angular can refresh only what depends on a change. That enables zoneless apps: smaller bundles, cleaner stack traces, less wasted work.',
    },
    {
      q: 'signal vs computed vs effect vs linkedSignal?',
      a: 'signal holds writable state. computed derives read-only state, lazily and memoised. linkedSignal derives state that can also be written locally and resets when its source changes. effect runs side effects outside the signal graph, such as the DOM, storage or logging, and should not be used to sync signals.',
    },
    {
      q: 'Why does updating an array inside a signal sometimes not re-render?',
      a: 'Signals use Object.is equality by default. Mutating the existing array keeps the same reference, so nothing is notified. Replace it instead, with update(list => [...list, item]), or supply a custom equal function if you really need one.',
    },
    {
      q: 'When would you still use RxJS?',
      a: 'For events over time: debouncing input, cancelling in-flight requests with switchMap, websockets, retries and polling. Signals are for current state. toSignal and toObservable bridge the two at the edges.',
    },
    {
      q: 'How do you expose state from a service safely?',
      a: 'Keep writable signals private and expose asReadonly() views plus methods that encode the allowed transitions. Consumers then get reactivity without being able to bypass the rules. Components get computed() views where they need derived data.',
    },
    {
      q: 'What is resource() and when is it better than subscribing?',
      a: 'A signal-based async primitive. You give it reactive params and a loader, and it exposes value, status, error and isLoading as signals. It cancels stale loads when params change and registers as a pending task, so SSR waits for it. It replaces the subscribe-and-set-loading-flags boilerplate in most read-only data fetching.',
    },
  ],
  'angular-05-dependency-injection': [
    {
      q: 'What is dependency injection, and why does Angular use it?',
      a: 'A class declares what it needs and the framework supplies it, instead of the class constructing its own dependencies. That decouples code from concrete implementations, so you can swap them per environment (browser vs server) or per test, and it lets Angular control lifetimes: one app-wide instance, or one per component subtree.',
    },
    {
      q: "What does providedIn: 'root' do, and how is it different from listing a service in providers?",
      a: "providedIn: 'root' registers the service with the root environment injector: one instance for the app, created lazily, and dropped from the bundle if nothing injects it. Listing it in a component's providers creates a new instance for that component and its children. Doing both gives you two instances, a classic source of state that silently stops syncing.",
    },
    {
      q: 'When do you need an InjectionToken?',
      a: 'When the thing you inject is not a class: an interface, a config object, a string or a browser global. Interfaces are erased at runtime, so they cannot be lookup keys. In this project BROWSER_STORAGE is a token for Storage, with a factory that returns localStorage in the browser and null on the server.',
    },
    {
      q: 'How does Angular resolve a dependency?',
      a: 'It walks the element injector tree first, starting at the requesting element and going up through ancestor components. Then it walks the environment injectors: lazy route injectors, root, then platform. The first provider found wins. If none is found it throws NG0201, unless the request was optional. Modifiers like self, skipSelf and host change where the walk starts or stops.',
    },
    {
      q: 'inject() or constructor injection?',
      a: 'They resolve the same way. inject() is the modern default: it works in field initialisers and functions (guards, interceptors, factories), plays well with inheritance because subclasses do not have to pass dependencies to super(), and does not depend on TypeScript decorator metadata. It must be called in an injection context.',
    },
    {
      q: 'How do you test a service that touches localStorage or the network?',
      a: 'Put the dependency behind DI and override it in TestBed. Use { provide: TOKEN, useValue: fake } for a token, or provideHttpClientTesting() for HttpClient. The service code never changes between tests and production, and the tests never touch real global state.',
    },
  ],
  'angular-06-rxjs': [
    {
      q: 'switchMap, mergeMap, concatMap, exhaustMap: when do you use each?',
      a: 'All four map a value to an inner Observable. switchMap cancels the previous inner stream, so use it when only the latest matters: search, route params. mergeMap runs them in parallel, for independent work. concatMap queues them in order, for writes that must not interleave. exhaustMap ignores new values while one is running, for a submit button double-click or a login request.',
    },
    {
      q: 'What is the difference between a hot and a cold Observable?',
      a: 'A cold Observable starts its work separately for each subscriber: every subscribe to an HttpClient call sends a request. A hot one shares a single source that runs regardless, like DOM events or a Subject. You make a cold one shared with share() or shareReplay().',
    },
    {
      q: 'How do you avoid memory leaks with subscriptions in Angular?',
      a: "Mostly by not subscribing manually: toSignal() and the async pipe unsubscribe when the component is destroyed. For a manual subscribe, use takeUntilDestroyed(), which takes a DestroyRef from the injection context. Streams that complete on their own, like a single HTTP call, don't leak, but they aren't cancelled either unless you unsubscribe.",
    },
    {
      q: 'Subject, BehaviorSubject, ReplaySubject?',
      a: 'A Subject is both an Observable and an Observer: you push values in with next() and subscribers get them from then on. BehaviorSubject requires an initial value and gives new subscribers the current one immediately, which made it the service-store pattern before signals. ReplaySubject replays the last N values to late subscribers.',
    },
    {
      q: 'What is an HTTP interceptor, and what have you used one for?',
      a: 'A function in the HttpClient pipeline that sees every request and its response Observable. Typical uses: adding auth headers, retrying, logging, turning errors into user messages, and caching. On my site one retries GETs that fail with a network error or 5xx, with exponential backoff, and never retries POSTs, because those are not safe to repeat.',
    },
    {
      q: 'Signals or RxJS?',
      a: 'Both, at different jobs. Signals hold state that the UI reads synchronously. RxJS models events over time: debouncing, cancellation, retries, combining streams. A common shape is signal input, then toObservable, then the operators, then toSignal back out for the template.',
    },
  ],
  'angular-07-routing': [
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
  ],
  'angular-08-forms': [
    {
      q: 'Reactive or template-driven forms?',
      a: 'Template-driven forms build the model from ngModel in the template: quick for simple cases, but the logic is spread through HTML and hard to unit test. Reactive forms define the model in TypeScript, which makes them strongly typed, testable without a DOM, and better for dynamic fields, cross-field validation and complex flows. I default to reactive. In Angular 21, Signal Forms are an experimental third option built on signals.',
    },
    {
      q: 'How do you write a custom validator, and a cross-field one?',
      a: 'A ValidatorFn takes a control and returns null when valid or an errors object like { blank: true }. For rules involving several fields, such as password confirmation or a date range, put the validator on the FormGroup so it sees every value and re-runs when any of them changes. Read it with group.hasError().',
    },
    {
      q: 'What does a ControlValueAccessor do?',
      a: 'It is the bridge between a form control and a component or element. writeValue pushes the model into the view, registerOnChange and registerOnTouched give the component callbacks to report changes back, and setDisabledState handles disabling. Provide it with NG_VALUE_ACCESSOR as a multi provider, and formControlName and ngModel work on your component.',
    },
    {
      q: 'How do async validators work?',
      a: 'They return an Observable or Promise of errors or null, and run only after the sync validators pass. While they run, the control status is PENDING. To avoid a request per keystroke, use updateOn: blur or debounce inside the validator with timer() and switchMap, since the validator is resubscribed on each value change.',
    },
    {
      q: 'How do you make a form accessible?',
      a: 'Every input has a real label. Errors show once the field is touched, and are linked with aria-invalid and aria-describedby. The submit button stays enabled, and an invalid submit marks everything touched and focuses the first invalid field. Results go into a live region that already exists in the DOM. Use autocomplete attributes for personal data.',
    },
    {
      q: 'What changed with typed forms?',
      a: 'Since Angular 14, FormControl, FormGroup and FormArray are generic and infer their types from initial values, so form.value.email is typed and typos are compile errors. nonNullable controls reset to their initial value instead of null, which removes string | null everywhere. UntypedFormGroup exists for migrating old code.',
    },
  ],
  'angular-09-change-detection': [
    {
      q: 'How does change detection work in Angular?',
      a: 'Angular walks the component tree and re-evaluates template bindings, patching the DOM where values changed. With Zone.js, a pass ran after any async event because Angular could not know what changed. In a zoneless app, a pass is scheduled by signal changes, template events, markForCheck or setInput. OnPush and signals then narrow which components are actually checked.',
    },
    {
      q: 'When is an OnPush component checked?',
      a: 'When one of its inputs receives a new reference, when an event fires in its template or a child, when a signal read in its template changes, or when markForCheck is called on it or a descendant (the async pipe does that). Mutating an object input in place triggers none of these.',
    },
    {
      q: 'What causes ExpressionChangedAfterItHasBeenChecked, and how do you fix it?',
      a: 'In development mode Angular runs a second verification pass and throws if a binding changed after it was checked. That means state was changed during change detection itself: in ngAfterViewInit, by a child updating a parent, or by a getter returning a new object each time. Fix the data flow, for example by deriving the value with computed or setting it earlier. Wrapping it in setTimeout hides the bug and costs an extra render.',
    },
    {
      q: 'markForCheck vs detectChanges?',
      a: 'markForCheck marks the view and its ancestors dirty so the next scheduled pass checks them. It is cheap and the usual choice. detectChanges synchronously runs change detection on that view and its children immediately, which is useful in tests or for detached views but easy to overuse.',
    },
    {
      q: 'How do signals change the picture?',
      a: 'A signal knows exactly which views read it, so a change marks only those views for refresh, and Angular can skip OnPush ancestors. That is what makes zoneless practical: no global check after every event, and OnPush costs almost nothing to adopt when state is in signals.',
    },
    {
      q: 'How would you move a large app to OnPush?',
      a: 'Component by component, leaves first, since they have the fewest dependencies. Look for plain fields mutated asynchronously, inputs mutated in place, and tests that rely on detectChanges after setting a field. Convert that state to signals or immutable updates. Then enforce it with the ESLint rule or a fitness test so new components start as OnPush. I did exactly that on my site and enforced it with a spec.',
    },
  ],
  'angular-10-directives': [
    {
      q: 'What kinds of directives are there?',
      a: 'Components, which are directives with a template; attribute directives, which change the appearance or behaviour of their host element; and structural directives, which add or remove DOM by rendering a TemplateRef into a ViewContainerRef. Since Angular 17 the built-in @if, @for and @switch blocks cover most structural needs without a directive.',
    },
    {
      q: 'What does the * in *ngIf do?',
      a: 'It is shorthand. The element is wrapped in an <ng-template>, and the expression is bound to an input named after the directive selector. Microsyntax like "let item of items; trackBy: f" maps to more inputs, such as ngForOf and ngForTrackBy, and to template context variables.',
    },
    {
      q: 'What are host directives and why use them?',
      a: 'hostDirectives on a component or directive applies other standalone directives to its host element, as if their attributes were written there. You pick which inputs and outputs to expose and can alias them. It is composition instead of inheritance: behaviour like focus handling, tooltips or scroll tracking can be shared without base classes, and consumers cannot forget to add it.',
    },
    {
      q: 'How do parent and child directives communicate?',
      a: 'Through DI. A child injects the parent directive, optionally, from its element injector and registers itself, the way NgModel registers with NgForm or my headings register with ScrollSpy. The parent can also use contentChildren to query children. Registration keeps the parent generic, and queries are good when the parent needs an ordered list of children to render.',
    },
    {
      q: '@HostBinding and @HostListener vs the host property?',
      a: 'Both do the same job. The Angular style guide now prefers the host property in the decorator metadata, because all host bindings sit in one place and work cleanly with signals. The decorators still work, and plenty of existing code uses them.',
    },
    {
      q: 'Where should DOM work in a directive happen?',
      a: 'Not in the constructor, because children do not exist yet and on the server there is no browser DOM. Use afterNextRender or afterEveryRender for browser-only work like measuring or observers, and DestroyRef to clean up. Bindings in the host metadata are the safe way to write to the host element, since Angular applies them on the server too.',
    },
  ],
  'angular-11-testing': [
    {
      q: 'What do you test in an Angular component?',
      a: 'Its behaviour through its public surface: what renders for given inputs, what happens on clicks and typing, which outputs it emits, and what it asks its services to do. Not private methods or internal fields, because those tests break on refactors that change nothing a user can see. I also run axe in component specs so accessibility regressions fail like any other bug.',
    },
    {
      q: 'How do you test a component that makes HTTP calls?',
      a: 'Provide provideHttpClient() and provideHttpClientTesting(), then inject HttpTestingController. Trigger the behaviour, use expectOne to assert the request, flush a response or an error, and assert on the rendered result. verify() in afterEach fails the test if any request was left unanswered. For retries and debouncing, add fake timers so the test controls time.',
    },
    {
      q: 'Unit, integration or e2e?',
      a: 'Mostly fast unit and component tests, because they pin behaviour cheaply and run on every save. Integration-style specs use the real config, for example routing tested against appConfig. A few e2e tests cover what needs a real browser: layout, scrolling, IntersectionObserver, and the critical user journeys. E2e tests are slow and more prone to flakiness, so each one should earn its place.',
    },
    {
      q: 'How do you test RxJS code?',
      a: 'With marble tests on the RxJS TestScheduler. Inside scheduler.run(), every timer uses virtual time, so delays, debounces and races are deterministic and instant. You describe input streams as marble strings and assert the output against an expected one. For simple cases, subscribing and asserting after fake timers is fine too.',
    },
    {
      q: 'Karma and Jasmine vs Jest vs Vitest?',
      a: 'Karma with Jasmine was the Angular default for years and ran tests in a real browser. New Angular 21 projects default to Vitest through the @angular/build:unit-test builder, which runs in jsdom with an optional browser mode. Jest was a common community choice in between. The TestBed API is the same in all of them, so most specs move between runners with little change.',
    },
    {
      q: 'Tell me about a test that caught something.',
      a: 'On my site, a fitness test that reads the CI workflow showed that its typecheck step checked zero files. The root tsconfig only has project references, so plain tsc compiles nothing. CI had been green the whole time. The spec now requires the real tsconfigs, a production build, and a timeout on every job.',
    },
  ],
  'angular-12-ssr': [
    {
      q: 'What is the difference between CSR, SSR and SSG?',
      a: 'CSR renders in the browser: fast to serve, but nothing shows until the JavaScript runs, and crawlers see an empty shell. SSR renders on the server per request, so the HTML is complete and can depend on the request, at the cost of server time. SSG, or prerendering, renders once at build time and serves static files, which is the cheapest and fastest when content only changes on deploy. Angular 21 chooses per route with RenderMode.Client, Server and Prerender in the server routes.',
    },
    {
      q: 'What is hydration, and what breaks it?',
      a: "Hydration is the browser adopting the server's DOM instead of re-creating it, so there's no flicker or lost scroll position. It needs the first client render to match the server's. It breaks when the two renders differ, for example a time, a random value or a locale, or when code changes the DOM outside Angular. Angular reports NG0500 for structural mismatches. ngSkipHydration opts a subtree out, but that's a workaround, not a fix.",
    },
    {
      q: 'How do you run code that needs the browser?',
      a: 'afterNextRender for one-time setup and afterEveryRender for work after every render. Both only run in the browser, after the DOM exists. Inject DOCUMENT rather than touching the global, and provide browser APIs like localStorage through a token with a server fallback. isPlatformBrowser still exists, but render hooks are usually the better fit.',
    },
    {
      q: 'How do you avoid fetching data twice with SSR?',
      a: "With hydration on, HttpClient's transfer cache stores GET and HEAD responses made on the server in TransferState, and the browser reuses them during hydration. For data that doesn't come through HttpClient, write it to TransferState yourself with makeStateKey on the server and read it in the browser.",
    },
    {
      q: 'What is incremental hydration?',
      a: 'A @defer block with a hydrate trigger, such as hydrate on viewport, interaction or idle, renders fully on the server but stays dehydrated in the browser until the trigger fires, and its code is only downloaded then. Users see the content immediately while less JavaScript runs on load. hydrate never keeps static content static. It needs withIncrementalHydration() in provideClientHydration.',
    },
    {
      q: 'Tell me about an SSR bug you fixed.',
      a: 'My site prerenders its blog pages, and every one of them shipped the menu bar clock as it was at build time. The bar was also marked ngSkipHydration, so the browser threw the server DOM away and rebuilt it. I made the clock render empty on the server, started it in afterNextRender, and removed ngSkipHydration so the bar hydrates. A spec renders the bar through the real server platform and asserts both.',
    },
  ],
  'angular-13-interview': [
    {
      q: 'What has changed in Angular over the last few major versions?',
      a: 'Standalone components arrived in 14 and became the default in 19. Signals came in 16, built-in control flow and @defer in 17. Zoneless change detection went stable in 20 and is the default for new apps in 21, which also made Vitest the default test runner and introduced experimental Signal Forms. The direction is the same throughout: less framework magic, finer-grained reactivity, and smaller bundles.',
    },
    {
      q: 'How would you migrate an NgModule app to standalone and the new syntax?',
      a: 'Upgrade one major version at a time with ng update until I am on a current version. Then run the standalone schematic, which works in passes: convert declarations, remove the NgModules that are now empty, then switch to bootstrapApplication. After that the control-flow, inject, signal input and output migrations. One schematic per change, with the tests green between each, so a regression points at one step.',
    },
    {
      q: 'When would you reach for NgRx?',
      a: 'When a lot of state is shared across features, many parts of the app react to the same events, and the team wants one enforced pattern with devtools and action logs. For most apps, services that expose signals are enough, and that is what my own site uses. NgRx SignalStore is a middle ground: structured, but without actions and reducers.',
    },
    {
      q: 'Walk me through the NgRx data flow.',
      a: 'A component dispatches an action, which describes something that happened. A reducer, a pure function, takes the current state and the action and returns new state. Selectors derive memoised slices of that state, which components read, as signals with selectSignal or as Observables. Effects listen for actions to run side effects such as HTTP calls, and dispatch new actions with the results.',
    },
    {
      q: 'What is the difference between AngularJS and Angular?',
      a: 'AngularJS is version 1.x: JavaScript, controllers and $scope, digest-cycle dirty checking. Angular, from version 2 on, is a complete rewrite in TypeScript built on components, dependency injection and an ahead-of-time compiler. They share a name and little else. AngularJS support ended in 2021.',
    },
    {
      q: "What's the hardest Angular bug you've debugged?",
      a: 'After moving every component on my site to OnPush, ng test and ng build finished their work and then never exited. I bisected the change in a separate worktree and dumped the handles keeping Node alive: an esbuild service process. The trigger was two components with byte-identical inline styles. I made the styles distinct, wrote it up, and added a timeout to every CI job so a hang fails in minutes instead of holding a runner for six hours.',
    },
    {
      q: 'Walk me through an Angular project you have built.',
      a: 'My portfolio is a macOS-style desktop in Angular 21. The desktop shell is client-rendered, and the writing is prerendered per route for speed and SEO. State lives in services that expose signals; the menu bar, for example, is a computed signal derived from window and dock state. Windows are dynamic components. Every component is OnPush, a fitness test keeps it that way, and CI runs lint, both typechecks, unit tests with axe, a production build and e2e accessibility checks.',
    },
  ],
};
