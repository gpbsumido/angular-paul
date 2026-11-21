import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { notBlank } from '../../shared/validators';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';
import { LessonSection } from './lesson-section';

type Validator = (control: AbstractControl<string>) => ValidationErrors | null;

// The bug lesson 08 fixed: Validators.required only rejects ''.
const notBlankBeforeLesson08: Validator = (control) =>
  control.value === '' ? { blank: true } : null;

const NOT_BLANK_CASES = [
  { name: 'rejects an empty message', value: '', blank: true },
  { name: 'rejects a message of only spaces', value: '   ', blank: true },
  { name: 'accepts real text', value: 'hello', blank: false },
];

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

@Component({
  selector: 'app-lesson-11-testing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Lesson, LessonSection, LessonDemo, CodeBlock, Callout, InterviewQuestions],
  template: `
    <app-lesson part="11">
      <h2>Simple</h2>
      <p>
        A good component test acts like a user and checks what a user would see. It sets inputs,
        clicks things, types, and then reads the DOM. It doesn't call private methods or inspect
        fields, because those can change without anything visible changing.
      </p>
      <p>
        Angular 21 runs unit tests on <strong>Vitest</strong> through <code>ng test</code>.
        <code>TestBed</code> builds a small Angular environment for each test.
        <code>fixture.whenStable()</code> waits for the zoneless scheduler to render. Every
        component spec on this site ends with an axe scan, so accessibility regressions fail the
        build like any other bug.
      </p>
      <app-code-block label="apps/contact-app.spec.ts (excerpt)" [code]="snippets.component" />
      <p>
        The smallest tests are for plain functions. Below, the real <code>notBlank</code>
        validator from lesson 08 runs its tests in this page. Flip the switch to put back the bug
        that lesson fixed, and see which test catches it.
      </p>
      <app-lesson-demo heading="Try it: run the validator's tests">
        <div class="demo-row">
          <input
            id="demo-break"
            type="checkbox"
            [checked]="broken()"
            (change)="broken.set(!broken())"
          />
          <label for="demo-break">Put the lesson 08 bug back</label>
          <button id="demo-run-tests" type="button" (click)="run()">Run tests</button>
        </div>
        <ul class="demo-test-results">
          @for (result of results(); track result.name) {
            <li class="demo-test-result" [class.demo-test-result--fail]="!result.passed">
              {{ result.passed ? '✓ PASS' : '✗ FAIL' }} {{ result.name }}
              @if (result.detail) {
                <span class="demo-test-detail">{{ result.detail }}</span>
              }
            </li>
          }
        </ul>
        <p id="demo-test-summary" role="status">{{ summary() }}</p>
      </app-lesson-demo>
      <app-code-block label="shared/validators.spec.ts" [code]="snippets.validator" />

      <h2>Intermediate</h2>
      <p>
        <strong>Replace what you don't own.</strong> Give the TestBed different providers and read
        them back with <code>TestBed.inject</code>. For HTTP,
        <code>provideHttpClientTesting()</code> swaps the backend for
        <code>HttpTestingController</code>. You assert on each request and decide what comes back.
        Combine it with fake timers and a retry with backoff becomes a test that runs in
        milliseconds.
      </p>
      <app-code-block
        label="shared/retry-transient-errors.interceptor.spec.ts"
        [code]="snippets.http"
      />
      <p>
        <strong>Routing.</strong> <code>RouterTestingHarness</code> navigates a real router
        configuration and hands back the routed component. This site's spec uses the actual
        <code>appConfig</code>, so it tests the wiring that ships, not a copy.
        <strong>Inputs.</strong> Set them with <code>fixture.componentRef.setInput()</code>, which
        goes through the same path as a parent template and works with OnPush.
      </p>

      <h2>Expert</h2>
      <p>
        <strong>Marble tests.</strong> RxJS's <code>TestScheduler</code> runs observables in virtual
        time. A 100ms delay costs nothing, and the order of arrivals is exact. Lesson 06's race
        between <code>switchMap</code> and <code>mergeMap</code> is proven this way.
      </p>
      <app-code-block label="lessons/search-race.spec.ts" [code]="snippets.marbles" />
      <p>
        <strong>Fitness tests.</strong> Some rules span the whole codebase: features stay lazy,
        every component is OnPush. A spec that reads the source tree turns those rules into failures
        with file names. The same idea caught three gaps in this site's CI config. The typecheck ran
        <code>tsc</code> against a root tsconfig with no files, so it checked nothing. The
        production build never ran. And no job had a time limit.
      </p>
      <app-code-block label="src/app/ci-workflow.spec.ts" [code]="snippets.fitness" />
      <p>
        <strong>When to go end to end.</strong> jsdom has no layout and no
        <code>IntersectionObserver</code>. The lesson nav's unit tests use a fake observer, so they
        prove the wiring and nothing more. A Playwright test in <code>e2e/</code> scrolls a real
        page in Chromium. Keep e2e tests few and focused on what only a browser can show: they're
        slow, and a flaky one teaches people to ignore red.
      </p>
      <app-callout kind="expert">
        <p>
          Angular CDK's <strong>component harnesses</strong> wrap a component's DOM in a small API
          (<code>await select.open()</code>). That keeps specs stable when the markup changes, and
          the same harness works in unit and e2e tests. This site has no CDK components, so it
          doesn't use them, but in a Material codebase you'd reach for them first.
        </p>
      </app-callout>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>A green summary is not an exit code.</strong> Once, this site's test run printed
          "426 passed" and then never exited. The cause was an esbuild context left open by two
          components with identical inline styles. CI only knows the exit code. Check it, and give
          jobs a timeout.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>A test you've never seen fail proves nothing.</strong> Write it first, watch it
          fail for the right reason, then make it pass. My first CI spec split the YAML wrong. It
          was failing on the <code>on:</code> block, not on the jobs it claimed to check.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Believing a comment over a test.</strong> In lesson 09 I wrote that the contact
          form's <code>reset()</code> only re-rendered because a signal write happened next to it. A
          spec in this lesson resets the form with no other change and no
          <code>detectChanges()</code>, and the errors still clear. Reactive form controls keep
          touched and status in signals, and <code>NgControlStatus</code> (the directive that adds
          <code>ng-touched</code>) reads them in its host bindings. The comment is corrected now,
          and the test keeps it honest.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Fake timers and <code>whenStable()</code>.</strong> With
          <code>vi.useFakeTimers()</code>, the zoneless scheduler waits on a timer that never fires,
          so <code>whenStable()</code> hangs. Drive it with
          <code>vi.advanceTimersByTimeAsync()</code> instead.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Setting a field, then <code>detectChanges()</code>.</strong> Under OnPush the view
          isn't dirty, so nothing renders. Use <code>setInput</code>, DOM events or signals (lesson
          09).
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .demo-test-results {
      margin: 8px 0;
      padding-left: 0;
      list-style: none;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 12px;
    }
    .demo-test-result--fail {
      font-weight: 600;
    }
    .demo-test-detail {
      display: block;
      padding-left: 2ch;
      font-weight: normal;
    }
  `,
})
export class Lesson11Testing {
  protected readonly broken = signal(false);
  protected readonly results = signal<TestResult[]>([]);
  protected readonly summary = signal('');

  protected run(): void {
    const validator: Validator = this.broken() ? notBlankBeforeLesson08 : notBlank;
    const results = NOT_BLANK_CASES.map(({ name, value, blank }) => {
      const errors = validator({ value } as AbstractControl<string>);
      const passed = (errors?.['blank'] === true) === blank;
      const expected = blank ? '{ blank: true }' : 'null';
      return {
        name,
        passed,
        detail: passed ? '' : `expected ${expected}, got ${JSON.stringify(errors)}`,
      };
    });
    const failed = results.filter((result) => !result.passed).length;
    const passed = results.length - failed;
    this.results.set(results);
    this.summary.set(failed ? `${failed} failed, ${passed} passed` : `${passed} passed`);
  }

  protected readonly snippets = {
    component: `it('submitting an invalid form shows every error, focuses the first bad field, and sends nothing', async () => {
  component.form.controls.name.setValue('Paul');
  (nativeEl.querySelector('.contact-submit') as HTMLButtonElement).click();
  await fixture.whenStable();

  expect(nativeEl.querySelector('.contact-error-email')).toBeTruthy();
  expect(nativeEl.querySelector('.contact-error-message')).toBeTruthy();
  expect(nativeEl.querySelector('.contact-error-name')).toBeNull();
  expect(document.activeElement?.id).toBe('contact-email');
  expect(component.submissionStatus()).toBe('idle');
});

it('has no axe violations while errors are showing', async () => {
  component.form.markAllAsTouched();
  fixture.detectChanges();
  await fixture.whenStable();
  expect(await axe(nativeEl)).toHaveNoViolations();
});`,
    validator: `it('rejects a message of only spaces', () => {
  expect(notBlank(new FormControl('   ', { nonNullable: true }))).toEqual({ blank: true });
});`,
    http: `beforeEach(() => {
  vi.useFakeTimers();
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([retryTransientErrors])),
      provideHttpClientTesting(),
    ],
  });
  http = TestBed.inject(HttpClient);
  backend = TestBed.inject(HttpTestingController);
});

afterEach(() => backend.verify());   // fails on any request nobody answered

it('retries a GET that hit a 5xx, after a backoff delay', () => {
  get();
  backend.expectOne('/repos').flush('down', { status: 503, statusText: 'Service Unavailable' });

  backend.expectNone('/repos');          // not yet: it's waiting
  vi.advanceTimersByTime(500);
  backend.expectOne('/repos').flush(['angular-paul']);

  expect(result).toEqual(['angular-paul']);
});`,
    marbles: `it('with switchMap, a new query cancels the one in flight', () => {
  scheduler.run(({ hot, expectObservable }) => {
    const typed = hot('a 9ms b', { a: 'a', b: 'ab' });
    expectObservable(typed.pipe(searchAsYouType('switchMap', search))).toBe('30ms x', {
      x: 'results for ab',
    });
  });
});`,
    fitness: `const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/ci.yml'), 'utf-8');

it('typechecks the app and the specs through their own tsconfigs', () => {
  expect(workflow).toMatch(/tsc --noEmit -p tsconfig\\.app\\.json/);
  expect(workflow).toMatch(/tsc --noEmit -p tsconfig\\.spec\\.json/);
});

it('runs the production build', () => {
  expect(workflow).toMatch(/run: npm run build/);
});`,
  };

  protected readonly interview = [
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
  ];
}
