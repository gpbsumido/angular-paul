import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { delay, filter, Observable, of } from 'rxjs';
import { THOUGHTS } from '../thoughts-data';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonSection } from './lesson-section';
import { LessonDemo } from './lesson-demo';
import { searchAsYouType, SearchStrategy } from './search-race';

interface SearchResult {
  query: string;
  titles: string[];
}

/**
 * A pretend server: searches the real thought titles, but a one-letter query
 * takes 1.2s and a three-letter one 0.25s. Broad queries being slower is
 * realistic, and it's what makes the race visible when typing at normal speed.
 */
function slowSearch(query: string): Observable<SearchResult> {
  const latencyMs = query.length === 1 ? 1200 : query.length === 2 ? 700 : 250;
  const titles = THOUGHTS.map((t) => t.title).filter((title) =>
    title.toLowerCase().includes(query.toLowerCase()),
  );
  return of({ query, titles }).pipe(delay(latencyMs));
}

@Component({
  selector: 'app-lesson-06-rxjs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Lesson,LessonSection, LessonDemo, CodeBlock, Callout, InterviewQuestions],
  template: `
    <app-lesson part="06">
      <h2>Simple</h2>
      <p>
        A signal is a value <em>now</em>. An Observable is values <em>over time</em>: keystrokes,
        HTTP responses, websocket messages, timers. You <code>subscribe()</code> to get them, and
        an Observable does nothing until someone does.
      </p>
      <p>
        <code>HttpClient</code> returns Observables. They're <em>cold</em>: each subscribe sends a
        new request, and one that never gets subscribed never sends anything. In a component,
        don't subscribe by hand. Turn the stream into a signal with <code>toSignal()</code> (or
        the <code>async</code> pipe in older code), and Angular unsubscribes for you when the
        component is destroyed.
      </p>
      <app-code-block label="the two ways to consume one" [code]="snippets.consume" />

      <h2>Intermediate</h2>
      <p>
        <strong>Operators</strong> are functions you <code>pipe()</code> a stream through:
        <code>map</code>, <code>filter</code>, <code>debounceTime</code>,
        <code>distinctUntilChanged</code>, <code>catchError</code>. The ones that matter most in
        interviews are the four that map each value to <em>another</em> Observable. They differ only
        in what happens to the inner stream still running when the next value arrives:
      </p>
      <table class="lesson-table">
        <caption>
          Higher-order mapping operators
        </caption>
        <thead>
          <tr>
            <th scope="col">Operator</th>
            <th scope="col">When a new value arrives mid-flight</th>
            <th scope="col">Use it for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>switchMap</code></td>
            <td>cancels the old inner stream</td>
            <td>search, route params: only the latest matters</td>
          </tr>
          <tr>
            <td><code>mergeMap</code></td>
            <td>runs both, in parallel</td>
            <td>independent work, like deleting several items</td>
          </tr>
          <tr>
            <td><code>concatMap</code></td>
            <td>queues the new one until the old finishes</td>
            <td>writes that must stay in order</td>
          </tr>
          <tr>
            <td><code>exhaustMap</code></td>
            <td>ignores the new value</td>
            <td>a submit button pressed twice</td>
          </tr>
        </tbody>
      </table>

      <app-lesson-demo heading="Try it: switchMap vs mergeMap">
        <div class="demo-row">
          <label for="race-query">Search thought titles</label>
          <input id="race-query" type="search" autocomplete="off" (input)="query.set(valueOf($event))" />
        </div>
        <p class="demo-note">
          Type "sig" at normal speed. One letter takes 1.2s to answer, three letters 0.25s, so the
          answers come back in reverse order.
        </p>
        <div class="race-results">
          <div id="race-merge" class="race-result" role="status">
            <strong>mergeMap</strong>
            @if (mergeResult(); as result) {
              <span>showing "{{ result.query }}": {{ result.titles.length }} matches</span>
            } @else {
              <span>waiting for a search</span>
            }
          </div>
          <div id="race-switch" class="race-result" role="status">
            <strong>switchMap</strong>
            @if (switchResult(); as result) {
              <span>showing "{{ result.query }}": {{ result.titles.length }} matches</span>
            } @else {
              <span>waiting for a search</span>
            }
          </div>
        </div>
        <p class="demo-note">
          mergeMap ends on "s", the stale answer that arrived last. switchMap shows what you typed.
        </p>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.race" />
      <p>
        In a real search box you'd add <code>debounceTime(300)</code> before the
        <code>switchMap</code>, so most keystrokes never send a request at all. Then
        <code>distinctUntilChanged()</code> skips a request when the text didn't really change.
        Debouncing reduces the race; only switchMap removes it.
      </p>

      <h2>Expert</h2>
      <p>
        <strong>Interceptors.</strong> Every request this site makes goes through
        <code>retryTransientErrors</code>, a functional interceptor. A GET that fails with a
        network error or a 5xx gets two more tries, 400ms and then 800ms later. Before this, one
        blip showed the Projects app's error state.
      </p>
      <app-code-block label="src/app/shared/retry-transient-errors.interceptor.ts" [code]="snippets.interceptor" />
      <app-callout kind="expert">
        <p>
          <code>retry()</code> works by resubscribing, and resubscribing to a cold HTTP Observable
          sends the request again. That's also why the interceptor skips anything that isn't a
          GET: a retried POST is a second order, a second payment, a second email.
        </p>
      </app-callout>
      <p>
        <strong>Hot vs cold.</strong> Cold Observables start fresh work per subscriber (HTTP,
        <code>timer</code>). Hot ones share one source (DOM events, a <code>Subject</code>).
        <code>BehaviorSubject</code> holds a current value and was the store pattern before
        signals. <code>shareReplay(&#123; bufferSize: 1, refCount: true &#125;)</code> makes a cold
        stream shared and cached. Leave out <code>refCount</code> and it never unsubscribes from
        the source.
      </p>
      <p>
        <strong>Testing streams.</strong> The demo's operator is covered by marble tests.
        <code>TestScheduler</code> runs every RxJS timer in virtual time and asserts exactly when
        each value arrives. The interceptor uses <code>HttpTestingController</code> with fake
        timers instead.
      </p>
      <app-code-block label="search-race.spec.ts" [code]="snippets.marbles" />

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>Nested subscribes.</strong> A subscribe inside a subscribe can't be cancelled
          and can't be composed. Use a higher-order operator instead.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong><code>catchError</code> on the outer stream kills it.</strong> After one failed
          search, the box stops searching forever. Catch inside the <code>switchMap</code>, on
          the inner request, and return a fallback.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Forgetting to unsubscribe from long-lived streams</strong> (intervals, router
          events, websockets) leaks memory and runs callbacks on destroyed components. Use
          <code>toSignal()</code>, or <code>takeUntilDestroyed()</code> for a manual subscribe.
          HTTP calls complete on their own, but they aren't cancelled unless you unsubscribe.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Subscribing twice to an HttpClient call</strong> sends two requests. In a
          template that's two <code>async</code> pipes on the same Observable.
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
    .race-results {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 8px;
    }
    .race-result {
      display: flex;
      flex-direction: column;
      padding: 8px;
      border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
      border-radius: 8px;
    }
    .lesson-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 13px;
    }
    .lesson-table caption {
      text-align: left;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .lesson-table th,
    .lesson-table td {
      text-align: left;
      padding: 6px 8px;
      border-bottom: 1px solid var(--border-primary, rgba(255, 255, 255, 0.15));
      vertical-align: top;
    }
  `,
})
export class Lesson06Rxjs {
  protected readonly query = signal('');

  // toObservable turns the signal into a stream, the operators do the
  // over-time work, and toSignal turns it back into something the template
  // can read. The subscription ends when the component does.
  private readonly queries = toObservable(this.query).pipe(filter((query) => query.length > 0));
  protected readonly mergeResult = this.race('mergeMap');
  protected readonly switchResult = this.race('switchMap');

  private race(strategy: SearchStrategy) {
    return toSignal(this.queries.pipe(searchAsYouType(strategy, slowSearch)), { initialValue: null });
  }

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected readonly snippets = {
    consume: `// Preferred: a signal, unsubscribed automatically on destroy
readonly repos = toSignal(this.http.get<Repo[]>('/api/repos'), { initialValue: [] });

// Older templates: the async pipe, also unsubscribes for you
repos$ = this.http.get<Repo[]>('/api/repos');
@for (repo of repos$ | async; track repo.id) { ... }`,
    race: `export function searchAsYouType<T>(
  strategy: 'mergeMap' | 'switchMap',
  search: (query: string) => Observable<T>,
): OperatorFunction<string, T> {
  return strategy === 'switchMap' ? switchMap(search) : mergeMap(search);
}

// in the component
private readonly queries = toObservable(this.query).pipe(filter((q) => q.length > 0));
protected readonly switchResult = toSignal(
  this.queries.pipe(searchAsYouType('switchMap', slowSearch)),
  { initialValue: null },
);`,
    interceptor: `export const retryTransientErrors: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);          // only retry what's safe to repeat

  return next(req).pipe(
    retry({
      count: 2,
      delay: (error, retryCount) =>
        isTransient(error)                              // status 0 or 5xx
          ? timer(400 * 2 ** (retryCount - 1))          // 400ms, then 800ms
          : throwError(() => error),                    // a 404 fails straight away
    }),
  );
};

// app.config.ts
provideHttpClient(withFetch(), withInterceptors([retryTransientErrors])),`,
    marbles: `scheduler.run(({ hot, expectObservable }) => {
  const typed = hot('a 9ms b', { a: 'a', b: 'ab' });   // 'a' at 0ms, 'ab' at 10ms

  // 'ab' answers at 30ms; the 100ms answer for 'a' still lands after it
  expectObservable(typed.pipe(searchAsYouType('mergeMap', search)))
    .toBe('30ms x 69ms y', { x: 'results for ab', y: 'results for a' });

  // switchMap cancelled 'a' the moment 'ab' arrived
  expectObservable(typed.pipe(searchAsYouType('switchMap', search)))
    .toBe('30ms x', { x: 'results for ab' });
});`,
  };

  protected readonly interview = [
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
  ];
}
