import { Component, computed, effect, linkedSignal, signal, untracked } from '@angular/core';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';

const UNIT_PRICE = 12;

type Country = 'CA' | 'US';
const SHIPPING: Record<Country, string[]> = {
  CA: ['Standard', 'Express'],
  US: ['Ground', 'Express', 'Overnight'],
};

@Component({
  selector: 'app-lesson-04-signals',
  imports: [Lesson, LessonDemo, CodeBlock, Callout, InterviewQuestions],
  template: `
    <app-lesson part="04">
      <h2>Simple</h2>
      <p>
        A signal is a value that tells Angular when it changes. Create one with
        <code>signal(initial)</code>, read it by calling it, and change it with
        <code>.set()</code> or <code>.update()</code>. Any template that reads a signal re-renders
        when it changes. That's how this app runs without Zone.js: Angular knows exactly which
        views read what.
      </p>
      <p>
        <code>computed()</code> derives a value from other signals. It's lazy and memoised: it
        recalculates only when a signal it read has changed, and only when someone reads it.
      </p>

      <app-lesson-demo heading="Try it: signal, computed, effect">
        <div class="demo-row">
          <span>Quantity: {{ quantity() }} × \${{ unitPrice }}</span>
          <button id="bump-one" type="button" (click)="bumpOne()">+1</button>
          <button id="bump-three" type="button" (click)="bumpThree()">+1 three times, synchronously</button>
        </div>
        <p id="signal-total">computed total: <strong>\${{ total() }}</strong></p>
        <p>Effect runs (newest last):</p>
        <ol class="effect-log" aria-live="polite">
          @for (entry of effectLog(); track $index) {
            <li>{{ entry }}</li>
          }
        </ol>
        <p class="demo-note">
          Press the second button: three writes, one effect run. Effects are scheduled, not
          synchronous, so they see the settled value.
        </p>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.basics" />

      <h2>Intermediate</h2>
      <p>
        <strong>Signals compare by reference.</strong> <code>set()</code> with the same object
        notifies nobody, so state must be replaced, not mutated. This site's
        <code>DockService</code> builds a new <code>Map</code> on every change for that reason.
        This lesson also made the service a proper <em>store</em>: private writable signals,
        public <code>asReadonly()</code> views, and methods as the only way in. Before that, two
        other files had their own copy of the "minimize" logic and wrote its Map directly.
      </p>
      <app-code-block label="src/app/shared/dock.service.ts" [code]="snippets.store" />
      <p>
        <code>linkedSignal()</code> is a writable signal that resets whenever its source changes.
        It's the answer to "derived, but the user can override it":
      </p>

      <app-lesson-demo heading="Try it: linkedSignal">
        <div class="demo-row">
          <label for="country">Country</label>
          <select id="country" (change)="country.set(valueOf($event))">
            <option value="CA" [selected]="country() === 'CA'">Canada</option>
            <option value="US" [selected]="country() === 'US'">United States</option>
          </select>
          <label for="shipping">Shipping</label>
          <select id="shipping" (change)="shipping.set(valueOf($event))">
            @for (option of shippingOptions(); track option) {
              <option [value]="option" [selected]="shipping() === option">{{ option }}</option>
            }
          </select>
        </div>
        <p id="shipping-choice" role="status">Selected: {{ shipping() }}</p>
        <p class="demo-note">Pick Express, then change country: the choice resets to that country's default.</p>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.linked" />

      <p>
        <strong>Interop.</strong> <code>toSignal()</code> turns an Observable into a signal and
        <code>toObservable()</code> goes the other way. The thought reader you're in uses it. It
        used to read <code>route.snapshot</code> once, and since the router reuses the component
        when only <code>:slug</code> changes, the series links (Part N of M, below) would have
        shown the old lesson. Now the slug is a signal and everything derives from it.
      </p>
      <app-code-block label="src/app/thoughts-content/thought-detail.ts" [code]="snippets.reader" />

      <h2>Expert</h2>
      <p>
        <strong><code>resource()</code></strong> is async state as signals: <code>params</code>
        (reactive input), <code>loader</code> (returns a promise and gets an
        <code>abortSignal</code>), and <code>value()</code>, <code>status()</code>,
        <code>error()</code>, <code>isLoading()</code> out. When params change it aborts the old
        load. It also registers a pending task, which is why SSR waits for the lesson chunk before
        serialising this page. <code>httpResource()</code> is the same shape over HttpClient.
      </p>
      <p>
        <strong>Effect timing.</strong> Component effects run during change detection, before
        the view that owns them is checked. Root effects run as their own task. Neither runs
        synchronously on <code>set()</code>, which is what batches the demo above. For DOM work
        after render, use <code>afterRenderEffect()</code> or <code>afterNextRender()</code>.
      </p>
      <app-callout kind="expert">
        <p>
          Signals are glitch-free: a computed never observes a half-updated graph. Writes mark
          dependents dirty (push), and values are recomputed only when read (pull). That's why
          reading <code>total()</code> ten times costs one multiplication.
        </p>
      </app-callout>
      <p>
        Signals don't replace RxJS. They hold <em>state</em>; Observables model
        <em>events over time</em>: debouncing, cancellation, websockets, retries. Lesson 06 is that
        boundary. At scale, NgRx SignalStore formalises the store pattern above.
      </p>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>Mutating the value inside a signal.</strong>
          <code>items().push(x)</code> changes the array and notifies nothing. Use
          <code>items.update((list) =&gt; [...list, x])</code>.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Using effect() to copy one signal into another.</strong> That's a
          <code>computed()</code>, or a <code>linkedSignal()</code> if it must stay writable.
          Effects are for leaving the signal world: DOM, storage, logging, analytics.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Reading a signal inside <code>setTimeout</code> or a promise callback</strong>
          in an effect doesn't track it. Only synchronous reads during the effect body count.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong><code>toSignal()</code>, <code>effect()</code> and <code>inject()</code> need an
          injection context.</strong> Call them in a field initialiser or constructor, not in
          <code>ngOnInit</code> or a click handler, or pass an <code>injector</code> explicitly.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .effect-log {
      margin: 4px 0 8px;
      font-size: 13px;
    }
    .demo-note {
      font-size: 12px;
    }
  `,
})
export class Lesson04Signals {
  protected readonly unitPrice = UNIT_PRICE;
  protected readonly quantity = signal(1);
  protected readonly total = computed(() => this.quantity() * UNIT_PRICE);
  protected readonly effectLog = signal<string[]>([]);

  protected readonly country = signal<Country>('CA');
  protected readonly shippingOptions = computed(() => SHIPPING[this.country()]);
  // Resets to the first option whenever shippingOptions changes; set() still works in between.
  protected readonly shipping = linkedSignal(() => this.shippingOptions()[0]);

  constructor() {
    effect(() => {
      const total = this.total();
      // untracked: this effect depends on total only. Without it, reading the
      // log while updating it would make the effect depend on its own output.
      untracked(() => this.effectLog.update((log) => [...log, `effect ran: total is $${total}`]));
    });
  }

  protected bumpOne(): void {
    this.quantity.update((n) => n + 1);
  }

  protected bumpThree(): void {
    this.quantity.update((n) => n + 1);
    this.quantity.update((n) => n + 1);
    this.quantity.update((n) => n + 1);
  }

  protected valueOf<T extends string>(event: Event): T {
    return (event.target as HTMLSelectElement).value as T;
  }

  protected readonly snippets = {
    basics: `quantity = signal(1);
total = computed(() => this.quantity() * 12);

constructor() {
  effect(() => {
    const total = this.total();               // tracked: re-runs when total changes
    untracked(() => this.log.update((log) => [...log, \`total is $\${total}\`]));
  });
}

bumpThree() {
  this.quantity.update((n) => n + 1);         // three writes...
  this.quantity.update((n) => n + 1);
  this.quantity.update((n) => n + 1);         // ...one effect run, seeing 4
}`,
    store: `private readonly runningAppsState = signal<Map<string, AppState>>(new Map());
readonly runningApps = this.runningAppsState.asReadonly();   // no .set() outside

minimizeApp(appId: string): void {
  if (!this.runningApps().has(appId)) return;
  const running = new Map(this.runningApps());               // replace, never mutate
  running.set(appId, 'minimized');
  this.runningAppsState.set(running);
}`,
    linked: `country = signal<'CA' | 'US'>('CA');
shippingOptions = computed(() => SHIPPING[this.country()]);
shipping = linkedSignal(() => this.shippingOptions()[0]);

// shipping.set('Express') works; changing country resets it to the new first option`,
    reader: `private readonly slug = toSignal(
  this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
  { requireSync: true },
);

readonly thought = computed(() => this.service.getBySlug(this.slug()));
readonly series = computed(() => this.service.getSeriesPosition(this.slug(), 'angular-guide'));
readonly lessonPage = resource({
  params: () => this.slug(),
  loader: ({ params: slug }) => LESSON_PAGES[slug]?.() ?? Promise.resolve(undefined),
});`,
  };

  protected readonly interview = [
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
  ];
}
