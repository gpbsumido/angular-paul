import { isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  makeStateKey,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';
import { LessonSection } from './lesson-section';

/** [ng-12 ssr] When the server rendered this page, as an ISO string. */
export const RENDERED_AT = makeStateKey<string>('lesson-12-rendered-at');

// Intl, not DatePipe: DatePipe's locale code lands in the initial bundle (lesson 03).
const UTC_DATE_TIME = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'medium',
  timeZone: 'UTC',
});

@Component({
  selector: 'app-lesson-12-ssr',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Lesson, LessonSection, LessonDemo, CodeBlock, Callout, InterviewQuestions],
  template: `
    <app-lesson part="12">
      <h2>Simple</h2>
      <p>
        By default an Angular app is rendered in the browser (CSR): the server sends an empty
        <code>&lt;app-root&gt;</code>, and nothing shows until the JavaScript has loaded and run.
        <strong>Server-side rendering</strong> (SSR) runs the same components on the server and
        sends finished HTML. <strong>Prerendering</strong> (SSG) does that once at build time and
        saves the HTML as static files.
      </p>
      <p>
        Angular 21 picks the mode per route. On this site, the Thoughts pages are prerendered so
        they load fast and search engines can read them. The desktop is client-rendered, because
        it's interactive and has nothing worth indexing.
      </p>
      <app-code-block label="src/app/app.routes.server.ts (excerpt)" [code]="snippets.routes" />
      <p>
        Then the browser has to take over. <strong>Hydration</strong> means Angular adopts the DOM
        the server sent, attaching listeners and state to it, instead of throwing it away and
        rendering again. For that to work, the browser's first render has to match the server's.
      </p>
      <app-lesson-demo heading="Try it: where was this page rendered?">
        <p id="demo-render-origin" class="demo-render-origin">
          @if (renderedAt) {
            Prerendered on the server at {{ renderedAt }} UTC, then hydrated in your browser.
          } @else {
            Rendered in your browser. You got here by navigating inside the app, so no server HTML
            was involved. Reload the page to get the prerendered version.
          }
        </p>
      </app-lesson-demo>
      <p>
        The time above is the build's, not yours. The server wrote it into
        <code>TransferState</code>, a JSON blob embedded in the page. The browser reads it back
        instead of computing its own, so both renders produce the same text.
      </p>
      <app-code-block label="lessons/lesson-12-ssr.ts" [code]="snippets.transferState" />

      <h2>Intermediate</h2>
      <p>
        <strong>Code that only works in a browser.</strong> Your components run in Node during SSR.
        There is no <code>window</code>, <code>localStorage</code> or layout, and nothing should
        keep a timer running. <code>afterNextRender</code> and <code>afterEveryRender</code> only
        run in the browser, after the DOM exists. Put DOM measurement, third-party widgets and
        timers there.
      </p>
      <p>
        This site's menu bar clock got this wrong. It started its interval inside an
        <code>effect</code> behind an <code>isPlatformBrowser</code> check, rendered the time on the
        server, and skipped hydration for the whole bar to hide the mismatch. Every prerendered page
        showed the build time until the browser re-created the bar.
      </p>
      <app-code-block label="menu-bar/menu-bar.ts" [code]="snippets.clock" />
      <p>
        <strong>HTTP during SSR.</strong> With hydration on, <code>HttpClient</code> caches GET and
        HEAD responses made on the server in TransferState. The browser reuses them during hydration
        instead of fetching the same data again. <code>withHttpTransferCacheOptions()</code> tunes
        what gets cached.
      </p>
      <p>
        <strong>Event replay.</strong> <code>withEventReplay()</code> records clicks that land
        before hydration finishes and replays them afterwards. The prerendered HTML carries the
        markers for it. This is the "Run tests" button from lesson 11, as the build wrote it:
      </p>
      <app-code-block
        label="dist/…/thoughts/angular-11-testing/index.html (trimmed)"
        [code]="snippets.jsaction"
      />

      <h2>Expert</h2>
      <p>
        <strong>Incremental hydration.</strong> <code>withIncrementalHydration()</code> lets a
        <code>&#64;defer</code> block render on the server but stay dehydrated in the browser until
        a trigger fires. Its JavaScript isn't even downloaded until then. The HTML is visible
        immediately; it just isn't interactive yet. <code>hydrate never</code> keeps a static block
        static forever.
      </p>
      <app-code-block label="example" [code]="snippets.incremental" />
      <p>
        <strong>How the server knows it's done.</strong> It serialises the page when the app is
        stable, which means no pending tasks. <code>HttpClient</code> and
        <code>resource()</code> register pending tasks, so this lesson, loaded by a
        <code>resource()</code> in the Thoughts reader, is in the prerendered HTML. Async work
        Angular can't see, like a bare <code>fetch()</code> or <code>setTimeout</code>, needs
        <code>PendingTasks</code>, or the server sends the page without it.
      </p>
      <app-callout kind="expert">
        <p>
          <code>ngSkipHydration</code> on a host element makes Angular destroy that subtree's server
          DOM and render it from scratch. It's an escape hatch for components that touch the DOM
          directly. It doesn't fix a mismatch, it just stops reporting it, and you pay for rendering
          twice.
        </p>
      </app-callout>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>A prerendered value is a build-time value.</strong> Clocks, "posted 3 minutes
          ago", random ids and greetings by time of day are frozen into the HTML. A visitor can see
          that HTML days later. Render them only in the browser, or transfer them.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Server and browser disagree on time zones and locales.</strong> A build server
          runs in UTC; your visitor doesn't. The demo above formats in UTC on purpose, so both sides
          print the same string. It uses <code>Intl.DateTimeFormat</code> rather than
          <code>DatePipe</code>: my first version used the pipe and the initial bundle grew 12 kB,
          the same trap as lesson 03.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Effects run on the server too.</strong> An <code>effect</code> is for syncing
          state, not for browser setup. Starting a timer in one needs a platform guard, and
          forgetting it leaves an interval running in the server process after the page has been
          sent.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Editing the DOM behind Angular's back.</strong> <code>innerHTML</code>, direct
          <code>appendChild</code> or a jQuery plugin changes the structure hydration expects.
          That's error NG0500, a hydration mismatch. Use template bindings, or
          <code>afterNextRender</code> for DOM-only libraries.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .demo-render-origin {
      margin: 0;
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class Lesson12Ssr {
  private readonly transferState = inject(TransferState);

  private readonly renderedAtIso = this.readRenderedAt();
  protected readonly renderedAt = this.renderedAtIso
    ? UTC_DATE_TIME.format(new Date(this.renderedAtIso))
    : null;

  private readRenderedAt(): string | null {
    // [ng-12 ssr] One of the few places PLATFORM_ID is still right: there is no
    // server-only lifecycle hook to put this in.
    if (isPlatformServer(inject(PLATFORM_ID))) {
      const now = new Date().toISOString();
      this.transferState.set(RENDERED_AT, now);
      return now;
    }
    const fromServer = this.transferState.get(RENDERED_AT, null);
    // Remove it once read, so coming back later by navigation doesn't claim
    // this view came from the server.
    this.transferState.remove(RENDERED_AT);
    return fromServer;
  }

  protected readonly snippets = {
    routes: `{
  path: 'thoughts/:slug',
  renderMode: RenderMode.Prerender,
  getPrerenderParams: async () => THOUGHTS.map((thought) => ({ slug: thought.slug })),
},
// The interactive desktop shell is client-rendered — hybrid rendering by route.
{
  path: '**',
  renderMode: RenderMode.Client,
},`,
    transferState: `export const RENDERED_AT = makeStateKey<string>('lesson-12-rendered-at');

private readRenderedAt(): string | null {
  if (isPlatformServer(inject(PLATFORM_ID))) {
    const now = new Date().toISOString();
    this.transferState.set(RENDERED_AT, now);
    return now;
  }
  const fromServer = this.transferState.get(RENDERED_AT, null);
  this.transferState.remove(RENDERED_AT);
  return fromServer;
}`,
    clock: `// Before: the server rendered a time, so the bar couldn't hydrate.
host: { ngSkipHydration: 'true' },
private readonly now = signal(new Date());
effect(() => {
  if (!isPlatformBrowser(this.platformId)) return;
  this.intervalId = setInterval(() => this.now.set(new Date()), 1000);
});

// After: the server renders no time, and the browser starts the clock.
private readonly now = signal<Date | null>(null);
readonly clock = computed(() => {
  const now = this.now();
  return now ? this.formatTime(now) : '';
});
afterNextRender(() => {
  this.now.set(new Date());
  this.intervalId = setInterval(() => this.now.set(new Date()), 1000);
});`,
    jsaction: `<button id="demo-run-tests" type="button" jsaction="click:;">Run tests</button>`,
    incremental: `@defer (hydrate on viewport) {
  <app-comments [postId]="id()" />
} @placeholder {
  <p>Comments</p>
}

@defer (hydrate never) {
  <app-static-footer />
}`,
  };

  protected readonly interview = [
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
  ];
}
