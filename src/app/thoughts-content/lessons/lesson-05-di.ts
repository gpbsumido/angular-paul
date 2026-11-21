import { ChangeDetectionStrategy, Component, inject, Injectable, input, signal } from '@angular/core';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';

/**
 * Hands out instance numbers for the demo. Provided on the lesson component,
 * so numbering starts at 1 on every render of the page. A module-level counter
 * would keep counting across requests on a long-running server, and the
 * numbers would disagree with the browser's after hydration (see the expert
 * callout below).
 */
@Injectable()
export class TallyNumbering {
  private last = 0;

  next(): number {
    return ++this.last;
  }
}

// [ng-05 di] No providedIn here on purpose. A service without it only exists
// where something lists it in a providers array, and every such list creates a
// new instance for that part of the tree. That's what the demo shows.
@Injectable()
export class Tally {
  readonly id = inject(TallyNumbering).next();
  readonly count = signal(0);

  increment(): void {
    this.count.update((n) => n + 1);
  }
}

/** Provides a Tally for everything inside it, including projected content. */
@Component({
  selector: 'app-tally-scope',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Tally],
  template: `<div class="tally-scope"><ng-content /></div>`,
  styles: `
    .tally-scope {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px;
      border: 1px dashed var(--border-primary, rgba(255, 255, 255, 0.3));
      border-radius: 8px;
    }
  `,
})
export class TallyScope {}

/** Asks for a Tally and gets whichever one the nearest scope above it provides. */
@Component({
  selector: 'app-tally-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="tally-button" [attr.data-name]="name()" (click)="tally.increment()">
      {{ name() }}: {{ tally.count() }} <span class="tally-instance">(instance #{{ tally.id }})</span>
    </button>
  `,
  styles: `
    .tally-instance {
      font-size: 11px;
      opacity: 0.75;
    }
  `,
})
export class TallyButton {
  readonly name = input.required<string>();
  protected readonly tally = inject(Tally);
}

@Component({
  selector: 'app-lesson-05-di',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Lesson, LessonDemo, CodeBlock, Callout, InterviewQuestions, TallyScope, TallyButton],
  providers: [TallyNumbering],
  template: `
    <app-lesson part="05">
      <h2>Simple</h2>
      <p>
        Dependency injection means a class asks for what it needs instead of building it. Call
        <code>inject(SomeService)</code> in a field initialiser and Angular hands you an instance.
        Mark the service <code>&#64;Injectable(&#123; providedIn: 'root' &#125;)</code> and there is exactly one
        instance for the whole app, created the first time something asks for it.
      </p>
      <p>
        The "Mark lesson complete" button at the bottom of this page is that pattern. The reader and
        the Thoughts list both inject <code>ReadingProgressService</code>. Neither knows the other
        exists, but they get the same instance, so marking a lesson here badges its card in the
        list.
      </p>
      <app-code-block label="src/app/thoughts-content/reading-progress.service.ts" [code]="snippets.root" />

      <h2>Intermediate</h2>
      <p>
        <strong>A provider is a recipe</strong> that tells an injector how to build the value for a
        token. <code>providedIn: 'root'</code> is one recipe. A <code>providers</code> array is the
        other place they go, and it has four shapes: <code>useClass</code>,
        <code>useValue</code>, <code>useFactory</code> and <code>useExisting</code> (an alias).
      </p>
      <app-code-block label="the four provider shapes" [code]="snippets.shapes" />
      <p>
        <strong>Tokens that aren't classes.</strong> Storage is an interface, and interfaces
        disappear at runtime, so they can't be looked up. An <code>InjectionToken</code> is a
        runtime key for those. This lesson added <code>BROWSER_STORAGE</code>: localStorage in the
        browser, <code>null</code> during prerendering. Both the reading progress and the system
        settings now read through it, so neither one checks the platform itself.
      </p>
      <app-code-block label="src/app/shared/browser-storage.ts" [code]="snippets.token" />
      <p>The payoff is in the specs. They swap the token instead of touching the real localStorage:</p>
      <app-code-block label="reading-progress.service.spec.ts" [code]="snippets.spec" />

      <p>
        <strong>Injectors form a tree.</strong> Every component can have its own
        <code>providers</code>. When something injects a token, Angular walks up from that element
        and uses the first provider it finds. So listing a service on a component gives that
        component, and everything under it, its own instance.
      </p>
      <app-lesson-demo heading="Try it: one provider, or one each">
        <p>A and B sit under one scope that provides <code>Tally</code>:</p>
        <app-tally-scope>
          <app-tally-button name="A" />
          <app-tally-button name="B" />
        </app-tally-scope>
        <p>C and D each sit under their own scope:</p>
        <div class="demo-row">
          <app-tally-scope><app-tally-button name="C" /></app-tally-scope>
          <app-tally-scope><app-tally-button name="D" /></app-tally-scope>
        </div>
        <p class="demo-note">
          Press A and B goes up too: same instance number, same count. Press C and D doesn't
          move: two scopes, two instances.
        </p>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.tree" />

      <h2>Expert</h2>
      <p>
        <strong>Two trees, searched in order.</strong> First the <em>element injectors</em>, from
        the component's own <code>providers</code> up through its ancestors in the DOM. Then the
        <em>environment injectors</em>: a lazy route's injector, then root, then platform. Past
        those is the NullInjector, which throws <code>NG0201: No provider for X</code>.
      </p>
      <p>
        <strong>Resolution modifiers</strong> change that walk. <code>optional: true</code>
        returns <code>null</code> instead of throwing. <code>self: true</code> only looks at this
        element, <code>skipSelf: true</code> starts at the parent (how a nested menu finds its
        parent menu), and <code>host: true</code> stops at the host component.
      </p>
      <app-code-block label="resolution modifiers" [code]="snippets.modifiers" />
      <p>
        <strong><code>providers</code> vs <code>viewProviders</code>.</strong> The demo's scope uses
        <code>providers</code>, which is why projected buttons can see it. With
        <code>viewProviders</code>, only the component's own template could, and the projected
        buttons would throw NG0201. Libraries use that to keep internals private.
      </p>
      <p>
        <strong>Route providers</strong> on a lazy route get their own environment injector, created
        when the route first loads. That's the modern replacement for a lazy NgModule's providers.
        <strong><code>multi: true</code></strong> lets many providers add to one token as an array.
        <code>provideAppInitializer()</code> and the old <code>HTTP_INTERCEPTORS</code> both work
        that way.
      </p>
      <app-callout kind="expert">
        <p>
          On the server, the root injector is created per request, so root services don't leak
          between users. Module-level variables do: a top-level <code>let cache</code> in a file is
          shared by every request the server handles. Put per-user state in a service, never in
          module scope.
        </p>
      </app-callout>
      <p>
        <strong>The injection context.</strong> <code>inject()</code> only works while Angular is
        constructing something: field initialisers, constructors, provider factories, route guards.
        Outside that, use <code>runInInjectionContext(injector, fn)</code>.
      </p>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>Listing a root service in a component's <code>providers</code>.</strong> It
          compiles and runs, and that component now has a second, private instance. State
          "randomly" stops syncing. A root service should appear in no providers array.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Calling <code>inject()</code> in <code>ngOnInit</code> or a click
          handler</strong> throws NG0203. Inject in a field and use it later.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Reaching for globals like <code>window</code>, <code>document</code> or
          localStorage directly.</strong> They don't exist during SSR and can't be swapped in
          tests. Put them behind a token, or use Angular's <code>DOCUMENT</code>.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Two services injecting each other</strong> fail with NG0200, a circular
          dependency. Usually one of them is doing two jobs. Split out the shared part.
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
  `,
})
export class Lesson05Di {
  protected readonly snippets = {
    root: `@Injectable({ providedIn: 'root' })        // one instance, app-wide, tree-shakable
export class ReadingProgressService {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly completedState = signal<ReadonlySet<string>>(this.load());
  readonly completedSlugs = this.completedState.asReadonly();

  toggleComplete(slug: string): void { /* ... */ }
}

// in the reader and the Thoughts list alike:
protected readonly progress = inject(ReadingProgressService);`,
    shapes: `providers: [
  Logger,                                              // shorthand for useClass: Logger
  { provide: Logger, useClass: ConsoleLogger },        // a different class for the same token
  { provide: API_URL, useValue: 'https://api.example.com' },
  { provide: Clock, useFactory: () => new Clock(inject(LOCALE_ID)) },
  { provide: OldLogger, useExisting: Logger },         // alias: same instance, two tokens
]`,
    token: `export const BROWSER_STORAGE = new InjectionToken<Storage | null>('BROWSER_STORAGE', {
  providedIn: 'root',
  factory: () => (isPlatformBrowser(inject(PLATFORM_ID)) ? localStorage : null),
});

// a consumer:
private readonly storage = inject(BROWSER_STORAGE);
this.storage?.setItem('reading-progress', JSON.stringify([...completed]));`,
    spec: `TestBed.configureTestingModule({
  providers: [{ provide: BROWSER_STORAGE, useValue: createMemoryStorage() }],
});
const progress = TestBed.inject(ReadingProgressService);

// and the server case is just:
providers: [{ provide: BROWSER_STORAGE, useValue: null }]`,
    tree: `@Injectable()                                   // no providedIn: only exists where provided
export class Tally { readonly count = signal(0); }

@Component({ selector: 'app-tally-scope', providers: [Tally], template: '<ng-content />' })
export class TallyScope {}

@Component({ selector: 'app-tally-button', /* ... */ })
export class TallyButton { protected readonly tally = inject(Tally); }   // nearest scope wins

<app-tally-scope> <app-tally-button name="A" /> <app-tally-button name="B" /> </app-tally-scope>
<app-tally-scope> <app-tally-button name="C" /> </app-tally-scope>
<app-tally-scope> <app-tally-button name="D" /> </app-tally-scope>`,
    modifiers: `// null instead of NG0201 when nothing provides it
private readonly analytics = inject(Analytics, { optional: true });

// a nested menu finding its parent menu, not itself
private readonly parentMenu = inject(Menu, { skipSelf: true, optional: true });`,
  };

  protected readonly interview = [
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
  ];
}
