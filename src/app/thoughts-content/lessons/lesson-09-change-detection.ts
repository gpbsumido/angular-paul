import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injectable,
  input,
  signal,
} from '@angular/core';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonSection } from './lesson-section';
import { LessonDemo } from './lesson-demo';

interface Profile {
  name: string;
  visits: number;
}

/** Shared by both demo cards through DI, so neither gets it as an input. */
@Injectable()
export class DemoLikes {
  readonly count = signal(0);
}

// Both cards are styled from the lesson component rather than sharing a
// `styles` constant. Two components with byte-identical inline styles left an
// esbuild context open in @angular/build 21.2.18, so `ng build` and `ng test`
// finished their work and then never exited.
const PROFILE_CARD = `
  <strong>{{ strategy }}</strong>
  <div>{{ profile().name }}: <span class="cd-visits">{{ profile().visits }}</span> visits</div>
  <div>Likes (a signal): <span class="cd-likes">{{ likes.count() }}</span></div>
`;

// [ng-09 change detection] The only Eager component in the app, and it says
// so. It exists to be checked on every pass, so the demo can show the
// difference.
@Component({
  selector: 'app-cd-card-eager',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: PROFILE_CARD,
})
export class EagerProfileCard {
  readonly profile = input.required<Profile>();
  protected readonly likes = inject(DemoLikes);
  protected readonly strategy = 'Eager (was Default)';
}

@Component({
  selector: 'app-cd-card-onpush',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: PROFILE_CARD,
})
export class OnPushProfileCard {
  readonly profile = input.required<Profile>();
  protected readonly likes = inject(DemoLikes);
  protected readonly strategy = 'OnPush';
}

@Component({
  selector: 'app-lesson-09-change-detection',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Lesson,
    LessonSection,
    LessonDemo,
    CodeBlock,
    Callout,
    InterviewQuestions,
    EagerProfileCard,
    OnPushProfileCard,
  ],
  providers: [DemoLikes],
  template: `
    <app-lesson part="09">
      <h2>Simple</h2>
      <p>
        Change detection is how Angular keeps the DOM in step with your component's state. On each
        pass it re-evaluates template bindings and patches whatever changed.
      </p>
      <p>
        With Zone.js, Angular didn't know <em>what</em> had changed, only that
        <em>something</em> might have: a click, a timer, a response. So it checked the whole
        component tree after each one. This app is zoneless. A pass is scheduled when a signal a
        template reads changes, when a template event fires, or when something calls
        <code>markForCheck()</code>.
      </p>
      <p>
        <strong>OnPush</strong> narrows it further. An OnPush component is skipped unless one of its
        inputs got a <em>new reference</em>, an event fired inside it, a signal it reads changed, or
        it was marked for check. Every component on this site is OnPush as of this lesson. Before
        it, not one of them set a strategy.
      </p>
      <app-code-block label="every component" [code]="snippets.onPush" />

      <h2>Intermediate</h2>
      <p>
        <strong>The trap is mutation.</strong> OnPush compares inputs by reference. Change a field
        inside an object you already passed down, and the reference is the same, so the OnPush child
        never looks.
      </p>
      <app-lesson-demo heading="Try it: mutate vs replace">
        <div class="cd-cards">
          <app-cd-card-eager id="cd-eager" [profile]="profile" />
          <app-cd-card-onpush id="cd-onpush" [profile]="profile" />
        </div>
        <div class="demo-row">
          <button id="cd-mutate" type="button" (click)="mutate()">profile.visits++ (mutate)</button>
          <button id="cd-replace" type="button" (click)="replace()">new object (replace)</button>
          <button id="cd-signal" type="button" (click)="likes.count.update(addOne)">
            like (signal)
          </button>
        </div>
        <p class="demo-note">
          Mutate: only Eager updates, and OnPush shows a stale number. Replace: both catch up. Like:
          both update, because a signal marks exactly the views that read it, input or no input.
        </p>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.demo" />
      <p>
        <strong>Keeping it OnPush.</strong> A rule nobody enforces erodes, so a fitness test in
        <code>architecture.spec.ts</code> fails on any component that doesn't set a strategy (the
        same approach as lesson 01's layering test). The ESLint rule
        <code>&#64;angular-eslint/prefer-on-push-component-change-detection</code> does the same in
        the editor. The test also accepts <code>Eager</code> when it's written explicitly, because
        this demo needs one.
      </p>
      <app-code-block label="src/app/architecture.spec.ts" [code]="snippets.fitness" />

      <h2>Expert</h2>
      <p>
        <strong>Signals and local change detection.</strong> A signal change marks only the views
        that read it. Their ancestors are flagged as having a dirty descendant, but OnPush ancestors
        aren't re-checked themselves. With OnPush everywhere and state in signals, a pass touches
        only the components whose data actually changed.
      </p>
      <p>
        <strong>ExpressionChangedAfterItHasBeenChecked</strong> (NG0100) comes from a development
        mode safety net. After each pass, Angular re-reads every binding and throws if one moved.
        That means state was changed during the pass, typically in <code>ngAfterViewInit</code> or
        by a getter that returns a new value each time. Fix the data flow; don't silence it with
        <code>setTimeout</code>.
      </p>
      <app-callout kind="expert">
        <p>
          In Angular 21, <code>ChangeDetectionStrategy.Default</code> is deprecated and renamed
          <code>Eager</code>, which says what it does. OnPush-first is clearly where the framework
          is heading. Zoneless is the default for new apps, and signals make OnPush nearly free to
          adopt.
        </p>
      </app-callout>
      <p>
        <strong>Manual control.</strong> <code>ChangeDetectorRef.markForCheck()</code> marks this
        view and its ancestors for the next pass. That's what the <code>async</code> pipe does on
        each emission. <code>detectChanges()</code> runs a pass on this subtree right now.
        <code>detach()</code> takes a subtree out of change detection altogether, for something like
        a 60fps canvas. In new code you rarely need any of them: a signal does the marking for you.
      </p>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong
            >A plain field set in a <code>setTimeout</code>, a promise or a
            <code>subscribe</code></strong
          >
          doesn't re-render an OnPush component, and in a zoneless app nothing else will either.
          Make it a signal.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Mutating arrays and objects passed as inputs.</strong> Replace them. The same rule
          makes signals work, so it's one habit, not two.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Tests that set a field and call <code>fixture.detectChanges()</code></strong>
          pass with the default strategy and fail under OnPush, because the fixture doesn't mark the
          component dirty. Drive tests through inputs (<code>componentRef.setInput</code>), DOM
          events or signals. That's how the component is really used.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Expensive function calls in templates.</strong> They run on every check of that
          view. Move them into <code>computed()</code>, which only recalculates when its inputs
          change.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .cd-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 8px;
      margin-bottom: 8px;
    }
    .cd-cards > * {
      display: block;
      padding: 8px 12px;
      border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.2));
      border-radius: 8px;
    }
    .demo-note {
      font-size: 12px;
    }
  `,
})
export class Lesson09ChangeDetection {
  protected readonly likes = inject(DemoLikes);

  // Deliberately a plain object, not a signal: the demo is about what happens
  // when you mutate one.
  protected profile: Profile = { name: 'Ada', visits: 0 };

  protected mutate(): void {
    this.profile.visits++;
  }

  protected replace(): void {
    this.profile = { ...this.profile, visits: this.profile.visits + 1 };
  }

  protected readonly addOne = (count: number) => count + 1;

  protected readonly snippets = {
    onPush: `@Component({
  selector: 'app-dock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})`,
    demo: `profile: Profile = { name: 'Ada', visits: 0 };

mutate()  { this.profile.visits++; }                                  // same reference
replace() { this.profile = { ...this.profile, visits: this.profile.visits + 1 }; }   // new one

<app-cd-card-eager  [profile]="profile" />   <!-- checked on every pass: shows both -->
<app-cd-card-onpush [profile]="profile" />   <!-- checked when the reference changes -->`,
    fitness: `it('every component sets OnPush, or opts into Eager explicitly', () => {
  const missing = decorators
    .filter(({ decorator }) =>
      !/changeDetection:\\s*ChangeDetectionStrategy\\.(OnPush|Eager)\\b/.test(decorator))
    .map(({ file, decorator }) => \`\${file} (\${selectorOf(decorator)})\`);

  expect(missing).toEqual([]);   // fails with the list of offenders
});`,
  };

  protected readonly interview = [
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
  ];
}
