import { ChangeDetectionStrategy, Component } from '@angular/core';
import { THOUGHTS } from '../thoughts-data';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { INTERVIEW_BANK } from './interview-bank';
import { InterviewPractice, PracticeCard } from './interview-practice';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';
import { LessonSection } from './lesson-section';

/** "Angular 04: Signals" → "Signals". */
function topicOf(slug: string): string {
  const thought = THOUGHTS.find((entry) => entry.slug === slug);
  if (!thought) throw new Error(`No thought for lesson "${slug}"`);
  return thought.title.replace(/^Angular \d+: /, '');
}

@Component({
  selector: 'app-lesson-13-interview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Lesson,
    LessonSection,
    LessonDemo,
    CodeBlock,
    Callout,
    InterviewQuestions,
    InterviewPractice,
  ],
  template: `
    <app-lesson part="13">
      <h2>Simple</h2>
      <p>
        Most Angular codebases you'll join were started before standalone components and signals.
        You need to read the older style fluently, and know how to move it forward. Here is one
        component written the way it would have been in 2020.
      </p>
      <app-code-block label="example: NgModule era" [code]="snippets.legacy" />
      <p>And the same component the way this site writes it:</p>
      <app-code-block label="example: Angular 21" [code]="snippets.modern" />
      <p>
        Every change is one you've seen in this guide. <code>declarations</code> became
        <code>imports</code> on the component (lesson 02). <code>*ngIf</code> and
        <code>*ngFor</code> became <code>&#64;if</code> and <code>&#64;for</code> (lesson 03).
        <code>&#64;Input</code> became <code>input()</code>, the subscription became a
        <code>resource</code> (lesson 04), and the constructor parameter became
        <code>inject()</code> (lesson 05).
      </p>
      <app-callout kind="tip">
        <p>
          Angular 19 flipped the default: components are standalone unless they say
          <code>standalone: false</code>. In an older codebase, a component declared in an NgModule
          has that flag set, and a new component you add to a module needs it too.
        </p>
      </app-callout>

      <h2>Intermediate</h2>
      <p>
        <strong>Migrating.</strong> Angular ships schematics that do most of the mechanical work.
        Run them one at a time, with the tests green between each, and upgrade one major version at
        a time with <code>ng update</code>.
      </p>
      <app-code-block label="terminal" [code]="snippets.migrations" />
      <p>
        <strong>NgRx.</strong> Many teams manage state with NgRx, so expect questions on it even
        though this site doesn't use it. In the classic Store, components dispatch <em>actions</em>,
        a pure <em>reducer</em> turns each action into new state, <em>selectors</em> read memoised
        slices, and <em>effects</em> run side effects like HTTP and dispatch the results.
      </p>
      <app-code-block label="example: @ngrx/store" [code]="snippets.ngrxStore" />
      <p>
        The newer <strong>SignalStore</strong> drops actions and reducers for a signal-based service
        builder. It sits between a hand-written service with signals, which is what this site uses,
        and the full Store.
      </p>
      <app-code-block label="example: @ngrx/signals" [code]="snippets.signalStore" />

      <h2>Expert</h2>
      <p>
        <strong>Talk about what you built and what broke.</strong> An interviewer can't check how
        long you've used Angular, but they can tell within a few questions whether you've shipped
        it. Specific stories with numbers do that better than any list of features. These all
        happened while writing this guide:
      </p>
      <ul>
        <li>
          CI's typecheck had been checking zero files, because <code>tsc</code> ran against a root
          tsconfig that only holds project references. A fitness test over the workflow found it
          (lesson 11).
        </li>
        <li>
          After moving every component to OnPush, <code>ng test</code> printed all green and never
          exited. I bisected it to two components with identical inline styles keeping an esbuild
          process alive, and added a timeout to every CI job (lessons 09 and 11).
        </li>
        <li>
          Using <code>DatePipe</code> in a lazy page grew the initial bundle by 13 kB, because
          <code>&#64;angular/common</code> was already loaded eagerly. I replaced it with
          <code>Intl.DateTimeFormat</code>, and made the same mistake again in lesson 12 (lessons 03
          and 12).
        </li>
        <li>
          Every prerendered page showed the time the site was built, and the menu bar skipped
          hydration to hide it. A spec on the real server platform now pins the fix (lesson 12).
        </li>
      </ul>
      <p>
        For each one, be ready to say how you found it, what you changed, and what stops it coming
        back. The last part is what separates "I fixed a bug" from "I own this codebase".
      </p>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>Mixing up AngularJS and Angular.</strong> AngularJS (1.x) is a different
          framework, built on controllers and <code>$scope</code>, and its support ended in 2021.
          "Angular" means the TypeScript rewrite, from version 2 on.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Only knowing the new syntax.</strong> If <code>*ngIf</code>,
          <code>&#64;Input()</code> or an NgModule throws you, it shows. Read both styles, and know
          which migration gets from one to the other.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>NgRx by default.</strong> Saying you'd add a store to every app is a red flag. Say
          what it costs (boilerplate, indirection) and when it pays: lots of shared state, many
          features reacting to the same events, a team that wants one pattern.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Claiming more than you can explain.</strong> Every line on your CV is a question
          you might get. If you can't explain how something works, or tell a story about when it
          went wrong, leave it off.
        </p>
      </app-callout>

      <h2>Practice</h2>
      <p>
        Every interview question in this guide, one at a time. Answer out loud before you show the
        answer; "Ask again" puts the card at the back of the deck.
      </p>
      <app-lesson-demo heading="Practice: every question in the guide">
        <app-interview-practice [cards]="cards" />
      </app-lesson-demo>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
})
export class Lesson13Interview {
  protected readonly cards: PracticeCard[] = Object.entries(INTERVIEW_BANK).flatMap(
    ([slug, questions]) => questions.map((question) => ({ ...question, topic: topicOf(slug) })),
  );

  protected readonly snippets = {
    legacy: `@NgModule({
  declarations: [ProfileCardComponent],
  imports: [CommonModule],
  exports: [ProfileCardComponent],
})
export class ProfileModule {}

@Component({
  selector: 'app-profile-card',
  standalone: false,
  template: \`
    <div *ngIf="user; else loading">
      <span *ngFor="let tag of user.tags; trackBy: trackByTag">{{ tag }}</span>
    </div>
    <ng-template #loading>Loading…</ng-template>
  \`,
})
export class ProfileCardComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  user?: User;
  private destroy$ = new Subject<void>();

  constructor(private users: UserService) {}

  ngOnInit() {
    this.users
      .get(this.userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => (this.user = user));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByTag(_index: number, tag: string) {
    return tag;
  }
}`,
    modern: `@Component({
  selector: 'app-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    @if (user.value(); as user) {
      @for (tag of user.tags; track tag) {
        <span>{{ tag }}</span>
      }
    } @else {
      Loading…
    }
  \`,
})
export class ProfileCard {
  private readonly users = inject(UserService);
  readonly userId = input.required<string>();
  readonly user = resource({
    params: () => this.userId(),
    loader: ({ params: id }) => this.users.getOnce(id),
  });
}`,
    migrations: `ng update @angular/core@20 @angular/cli@20     # one major at a time
ng generate @angular/core:standalone           # NgModules to standalone, in three passes
ng generate @angular/core:control-flow         # *ngIf / *ngFor to @if / @for
ng generate @angular/core:inject               # constructor parameters to inject()
ng generate @angular/core:signal-input-migration
ng generate @angular/core:output-migration`,
    ngrxStore: `export const loadRepos = createAction('[Projects Page] Load Repos');
export const reposLoaded = createAction('[Projects API] Repos Loaded', props<{ repos: Repo[] }>());

export const projectsReducer = createReducer(
  initialState,
  on(loadRepos, (state) => ({ ...state, loading: true })),
  on(reposLoaded, (state, { repos }) => ({ ...state, loading: false, repos })),
);

export const selectRepos = createSelector(selectProjects, (state) => state.repos);

export const loadRepos$ = createEffect(
  (actions$ = inject(Actions), api = inject(GithubApi)) =>
    actions$.pipe(
      ofType(loadRepos),
      exhaustMap(() => api.repos().pipe(map((repos) => reposLoaded({ repos })))),
    ),
  { functional: true },
);

// In a component:
readonly repos = inject(Store).selectSignal(selectRepos);`,
    signalStore: `export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState({ repos: [] as Repo[], loading: false }),
  withComputed(({ repos }) => ({ count: computed(() => repos().length) })),
  withMethods((store, api = inject(GithubApi)) => ({
    async load() {
      patchState(store, { loading: true });
      patchState(store, { repos: await api.reposOnce(), loading: false });
    },
  })),
);`,
  };

  protected readonly interview = INTERVIEW_BANK['angular-13-interview'];
}
