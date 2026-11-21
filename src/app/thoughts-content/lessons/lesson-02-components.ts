import { Component, input, model, output, signal } from '@angular/core';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';

type Tone = 'info' | 'warn';

/**
 * [ng-02 components] The demo child. Every way data crosses a component
 * boundary is here in one place:
 *   input()            parent → child, read-only signal
 *   model()            parent ⇄ child, two-way with [(count)]
 *   output()           child → parent, an event
 *   <ng-content>       parent's markup rendered inside the child
 */
@Component({
  selector: 'app-demo-badge',
  host: { '[class.demo-badge--warn]': 'tone() === "warn"' },
  template: `
    <ng-content select="[badgeIcon]" />
    <span class="demo-badge-label">{{ label() }}</span>
    <span class="demo-badge-count">{{ count() }}</span>
    <button type="button" class="demo-badge-bump" (click)="bump()" [attr.aria-label]="'Add one to ' + label()">
      +1
    </button>
    <button type="button" class="demo-badge-dismiss" (click)="dismissed.emit(label())" [attr.aria-label]="'Dismiss ' + label()">
      ✕
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 6px 4px 12px;
      border-radius: 999px;
      border: 2px solid #0a84ff;
      color: var(--text-primary, #fff);
    }
    :host(.demo-badge--warn) {
      border-color: #ff9f0a;
      border-style: dashed;
    }
    .demo-badge-count {
      font-variant-numeric: tabular-nums;
    }
    button {
      font: inherit;
      border: none;
      border-radius: 999px;
      padding: 0 8px;
      cursor: pointer;
    }
  `,
})
export class DemoBadge {
  readonly label = input.required<string>();
  readonly tone = input<Tone>('info');
  readonly count = model(0);
  readonly dismissed = output<string>();

  protected bump(): void {
    // Writing a model() updates the parent's signal through [(count)].
    // Writing an input() isn't possible at all: InputSignal has no set().
    this.count.update((n) => n + 1);
  }
}

@Component({
  selector: 'app-lesson-02-components',
  imports: [Lesson, LessonDemo, CodeBlock, Callout, InterviewQuestions, DemoBadge],
  template: `
    <app-lesson part="02">
      <h2>Simple</h2>
      <p>
        A component is a TypeScript class with a <code>&#64;Component</code> decorator: a
        <code>selector</code> (the tag you write), a template, and styles. In a standalone
        component, <code>imports</code> lists every component, directive and pipe its template
        uses. Forget one and the compiler tells you the tag is unknown.
      </p>
      <app-code-block label="src/app/thoughts-content/lessons/callout.ts" [code]="snippets.callout" />
      <p>
        Data goes in through <code>input()</code> and events come out through
        <code>output()</code>. Both are plain class fields. <code>input()</code> gives you a
        signal, so you read it by calling it: <code>kind()</code>.
      </p>

      <h2>Intermediate</h2>
      <p>
        Two-way binding is <code>model()</code>: the child can write it and the parent's signal
        updates through <code>[(count)]</code>. Content projection (<code>&lt;ng-content&gt;</code>)
        lets the parent pass <em>markup</em> rather than data, and <code>select</code> routes
        pieces into named slots. Every lesson on this site is built that way: the layout, the demo
        frame and the callouts are all projection.
      </p>

      <app-lesson-demo heading="Try it: data across a component boundary">
        <div class="demo-row">
          <label for="badge-label">Label (input)</label>
          <input id="badge-label" type="text" [value]="label()" (input)="label.set(valueOf($event))" />
        </div>
        <fieldset class="demo-row demo-tones">
          <legend>Tone (input)</legend>
          @for (option of tones; track option) {
            <label>
              <input type="radio" name="badge-tone" [value]="option" [checked]="tone() === option" (change)="tone.set(option)" />
              {{ option }}
            </label>
          }
        </fieldset>
        <div class="demo-row">
          <app-demo-badge [label]="label()" [tone]="tone()" [(count)]="count" (dismissed)="logEvent($event)">
            <span badgeIcon aria-hidden="true">⭐</span>
          </app-demo-badge>
        </div>
        <p id="badge-count-readout">Parent's signal, via [(count)]: {{ count() }}</p>
        <ol class="demo-log" aria-live="polite">
          @for (entry of log(); track $index) {
            <li>{{ entry }}</li>
          } @empty {
            <li>No events yet. Press ✕ on the badge.</li>
          }
        </ol>
      </app-lesson-demo>
      <app-code-block label="the parent's template" [code]="snippets.parent" />

      <p>
        Lifecycle: with signals you rarely need hooks. Derive with <code>computed()</code> instead
        of <code>ngOnChanges</code>, and clean up with <code>inject(DestroyRef).onDestroy()</code>
        instead of <code>ngOnDestroy</code>. The hooks still matter for reading existing code:
        <code>ngOnInit</code> is the first point where inputs are set, and
        <code>ngAfterViewInit</code> is the first point where view queries resolve.
      </p>

      <h2>Expert</h2>
      <p>
        <strong>Dynamic components.</strong> The page you are reading is one. The thought reader
        doesn't know this lesson exists at compile time: it looks up a loader by slug, awaits the
        <code>import()</code>, and hands the class to <code>NgComponentOutlet</code>. For
        imperative cases there's <code>ViewContainerRef.createComponent()</code>, which takes
        input bindings since v20.
      </p>
      <app-code-block label="src/app/thoughts-content/thought-detail.ts" [code]="snippets.dynamic" />
      <app-callout kind="expert">
        <p>
          <code>app-lesson</code> is the only component here with
          <code>ViewEncapsulation.None</code>. Emulated encapsulation can't style projected
          content, so it opts out and prefixes every selector with <code>.lesson</code> by hand.
          That's the honest alternative to <code>::ng-deep</code>, which is deprecated.
        </p>
      </app-callout>
      <p>
        Split <strong>container</strong> components (inject services, own state) from
        <strong>presentational</strong> ones (inputs in, outputs out). <code>Callout</code> and
        <code>CodeBlock</code> are presentational: no services, trivially reusable, trivially
        testable.
      </p>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>Mutating an input object.</strong> <code>this.user().name = 'x'</code> changes
          the parent's data behind its back, and OnPush/signals won't notice. Emit an output and
          let the owner change it.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Reading a required input in the constructor</strong> throws NG0950: inputs
          aren't set yet. Read them in templates, <code>computed()</code> or <code>effect()</code>.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Naming an output after a DOM event</strong> (<code>click</code>,
          <code>change</code>): the native event bubbles too, and the handler fires twice.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Wrapping <code>&lt;ng-content&gt;</code> in <code>&#64;if</code></strong> doesn't
          lazily create the content. The parent creates projected content whether it's shown or
          not. Use an <code>ng-template</code> input when content should be lazy.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .demo-tones {
      border: none;
      padding: 0;
      margin: 0 0 8px;
    }
    .demo-tones legend {
      float: left;
      margin-right: 8px;
    }
    .demo-log {
      font-size: 13px;
      margin: 8px 0 0;
    }
  `,
})
export class Lesson02Components {
  protected readonly tones: Tone[] = ['info', 'warn'];
  protected readonly label = signal('Angular');
  protected readonly tone = signal<Tone>('info');
  protected readonly count = signal(0);
  protected readonly log = signal<string[]>([]);

  protected valueOf(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected logEvent(label: string): void {
    // A new array, not push(): signals compare by reference, so mutating in
    // place would leave the list on screen stale.
    this.log.update((entries) => [...entries, `dismissed → "${label}"`]);
  }

  protected readonly snippets = {
    callout: `@Component({
  selector: 'app-callout',
  host: { role: 'note', '[class]': '"callout callout--" + kind()' },
  template: \`
    <strong class="callout-label">{{ labels[kind()] }}</strong>
    <ng-content />
  \`,
})
export class Callout {
  readonly kind = input.required<'tip' | 'pitfall' | 'expert'>();
}`,
    parent: `<!-- input(): one-way in. model(): two-way, so pass the signal itself.
     output(): $event is whatever the child emitted. -->
<app-demo-badge
  [label]="label()"
  [tone]="tone()"
  [(count)]="count"
  (dismissed)="logEvent($event)"
>
  <!-- projected into <ng-content select="[badgeIcon]" /> -->
  <span badgeIcon>⭐</span>
</app-demo-badge>`,
    dynamic: `readonly lessonPage = resource({
  loader: () => LESSON_PAGES[this.thought?.slug ?? '']?.() ?? Promise.resolve(undefined),
});

// template
@if (lessonPage.value(); as page) {
  <ng-container *ngComponentOutlet="page" />
}`,
  };

  protected readonly interview = [
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
  ];
}
