import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonSection } from './lesson-section';
import { LessonDemo } from './lesson-demo';

const STARTING_TAGS = ['signals', 'pipes', 'control-flow'];

@Component({
  selector: 'app-lesson-03-templates',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Lesson,LessonSection, LessonDemo, CodeBlock, Callout, InterviewQuestions],
  template: `
    <app-lesson part="03">
      <h2>Simple</h2>
      <p>
        A template is HTML with four kinds of binding. <code>{{ literal.interpolation }}</code>
        interpolates text, <code>[prop]="expr"</code> sets a DOM property,
        <code>(event)="handler()"</code> listens, and <code>[(x)]="signal"</code> does both. Control
        flow is built in: <code>&#64;if</code>/<code>&#64;else</code>, <code>&#64;for</code> and
        <code>&#64;switch</code>. Pipes format values on the way out:
        <code>{{ literal.pipe }}</code>.
      </p>
      <app-code-block label="src/app/thoughts-content/thought-detail.ts" [code]="snippets.detail" />
      <p>
        <code>&#64;for</code> requires a <code>track</code> expression. It's how Angular knows which
        DOM row belongs to which item when the list changes, so it can move rows instead of
        rebuilding them.
      </p>

      <h2>Intermediate</h2>
      <p>
        <strong>Properties are not attributes.</strong> An attribute is the initial value written
        in the HTML; a property is the live value on the DOM object. <code>[value]</code> sets the
        property. <code>[attr.value]</code> sets the attribute, which an input ignores once someone
        has typed in it. Use <code>[attr.x]</code> only where no property exists:
        <code>aria-*</code>, <code>colspan</code>, SVG.
      </p>

      <app-lesson-demo heading="Try it: property binding vs attribute binding">
        <p>Type something in the box, then press each button.</p>
        <div class="demo-row">
          <label for="binding-probe">Probe</label>
          <input id="binding-probe" type="text" [value]="propertyValue()" [attr.value]="attributeValue()" />
        </div>
        <div class="demo-row">
          <button id="set-attribute" type="button" (click)="setAttribute()">Set via [attr.value]</button>
          <button id="set-property" type="button" (click)="setProperty()">Set via [value]</button>
        </div>
        <p role="status">{{ explanation() }}</p>
      </app-lesson-demo>

      <p>
        The rest of the everyday toolkit: <code>[class.active]="on"</code> and
        <code>[style.width.px]="w"</code> for single classes and styles;
        <code>#ref</code> template variables to grab an element or component;
        <code>&#64;let</code> to name a value once; key filters like
        <code>(keydown.enter)</code>; and <code>$index</code>, <code>$first</code>,
        <code>$last</code>, <code>$count</code> inside <code>&#64;for</code>.
      </p>

      <app-lesson-demo heading="Try it: @for, @empty, @let and @switch">
        <ul class="tag-list">
          @for (tag of tags(); track tag; let position = $index, isLast = $last) {
            <li>
              {{ position + 1 }}. {{ tag }}{{ isLast ? ' (last)' : '' }}
              <button type="button" class="tag-remove" (click)="remove(tag)" [attr.aria-label]="'Remove ' + tag">✕</button>
            </li>
          } @empty {
            <li>All gone. <button type="button" (click)="resetTags()">Put them back</button></li>
          }
        </ul>
        @let count = tags().length;
        <p id="tag-summary" role="status">
          @switch (count) {
            @case (0) { No tags left. }
            @case (1) { One tag left. }
            @default { {{ count }} tags left. }
          }
        </p>
      </app-lesson-demo>
      <app-code-block label="this demo's template" [code]="snippets.controlFlow" />

      <h2>Expert</h2>
      <p>
        <strong>Pipes are pure by default</strong>: <code>transform()</code> only re-runs when its
        input reference changes. A method call in a template, like
        <code>{{ literal.methodCall }}</code>, runs on every change detection pass that
        checks the view. This site's reading time is a pure pipe for that reason. Impure pipes
        (<code>pure: false</code>) run every pass; <code>async</code> is the famous one.
      </p>
      <app-code-block label="src/app/thoughts-content/reading-time.pipe.ts" [code]="snippets.pipe" />
      <app-callout kind="expert">
        <p>
          The dates on this site first used <code>| date: 'mediumDate' : 'UTC'</code>. The
          production build put the initial bundle up <strong>13 kB</strong>, even though both
          thought views are lazy. <code>&#64;angular/common</code> ships as one module that the app
          already loads eagerly, so <code>DatePipe</code>'s locale formatting landed in the initial
          chunk. A five-line <code>utcDate</code> pipe over <code>Intl.DateTimeFormat</code>
          prints the same "Jun 15, 2026" for free. Read the build output, not just the tests.
        </p>
      </app-callout>
      <p>
        <strong>Host event bindings.</strong> Listen on the component's own element, or on
        <code>window</code>/<code>document</code>, through <code>host</code> metadata. That's
        preferred over <code>&#64;HostListener</code>. Writing this lesson turned up a real bug in the
        desktop's handler: it called the shortcut service <em>twice</em> per keydown, so ⌃⌥Space
        opened Spotlight and immediately closed it again.
      </p>
      <app-code-block label="src/app/app.ts, before and after" [code]="snippets.hostListener" />
      <p>
        <strong>Under the sugar:</strong> the old <code>*ngIf</code>/<code>*ngFor</code> desugar to
        <code>&lt;ng-template&gt;</code> plus a directive. You'll meet them in every pre-v17
        codebase, along with <code>ngTemplateOutlet</code> for passing a reusable template and
        context into a child. The built-in control flow compiles to instructions directly, needs no
        import, and type-narrows inside <code>&#64;if</code>.
      </p>
      <app-callout kind="expert">
        <p>
          Angular sanitizes <code>[innerHTML]</code>, <code>[href]</code> and
          <code>[style]</code> values automatically. <code>DomSanitizer.bypassSecurityTrust*</code>
          turns that off, so every call to it deserves a code-review comment explaining why the
          input can be trusted.
        </p>
      </app-callout>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong><code>track $index</code> on a list that reorders or deletes.</strong> Rows get
          reused for the wrong items, so focus, input text and animations jump to the neighbour.
          Track a stable id.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Timezones in date formatting.</strong> <code>'2026-06-15'</code> parses as UTC
          midnight. Format it in local time (what <code>| date</code> does unless you pass
          <code>'UTC'</code>) and everyone west of Greenwich sees June 14, while an SSR server in
          another zone renders a different date than the browser hydrates.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>A <code>&lt;button&gt;</code> inside a <code>&lt;form&gt;</code></strong> defaults
          to <code>type="submit"</code>. Every non-submit button needs <code>type="button"</code>.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Expensive work in template expressions.</strong> Filtering or sorting in a method
          the template calls runs it on every check. Move it into a <code>computed()</code> or a pure
          pipe.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
  styles: `
    .tag-list {
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
    .tag-list li {
      margin-bottom: 6px;
    }
  `,
})
export class Lesson03Templates {
  // Literal template syntax shown in prose. Interpolated strings are never
  // re-parsed as template, so binding them is the safe way to print "{{".
  protected readonly literal = {
    interpolation: '{{ value }}',
    pipe: "{{ date | date: 'mediumDate' }}",
    methodCall: '{{ readingTime(text) }}',
  };

  protected readonly propertyValue = signal('');
  protected readonly attributeValue = signal('');
  protected readonly explanation = signal('Nothing set yet.');
  private presses = 0;

  protected setAttribute(): void {
    this.attributeValue.set(`attribute #${++this.presses}`);
    this.explanation.set(
      'The value attribute changed (check devtools), but once you have typed, the box keeps showing your text.',
    );
  }

  protected setProperty(): void {
    this.propertyValue.set(`property #${++this.presses}`);
    this.explanation.set('The value property changed, and the box shows it straight away.');
  }

  protected readonly tags = signal(STARTING_TAGS);

  protected remove(tag: string): void {
    this.tags.update((tags) => tags.filter((t) => t !== tag));
  }

  protected resetTags(): void {
    this.tags.set(STARTING_TAGS);
  }

  protected readonly snippets = {
    detail: `<h1 class="thought-detail-title">{{ thought.title }}</h1>
<time [attr.datetime]="thought.date">{{ thought.date | utcDate }}</time>
@if (!hasLessonPage) {
  · {{ thought.content | readingTime }}
}
@for (tag of thought.tags; track tag) {
  <span class="thought-tag">{{ tag }}</span>
}`,
    controlFlow: `@for (tag of tags(); track tag; let position = $index, isLast = $last) {
  <li>
    {{ position + 1 }}. {{ tag }}{{ isLast ? ' (last)' : '' }}
    <button type="button" (click)="remove(tag)" [attr.aria-label]="'Remove ' + tag">✕</button>
  </li>
} @empty {
  <li>All gone.</li>
}

@let count = tags().length;
@switch (count) {
  @case (0) { No tags left. }
  @case (1) { One tag left. }
  @default { {{ count }} tags left. }
}`,
    pipe: `@Pipe({ name: 'readingTime' })
export class ReadingTimePipe implements PipeTransform {
  transform(text: string): string {
    const words = text.split(/\\s+/).filter(Boolean).length;
    return \`\${Math.max(1, Math.ceil(words / 200))} min read\`;
  }
}`,
    hostListener: `// Before: every toggle fired twice, so ⌃⌥Space opened and closed Spotlight
@HostListener('document:keydown', ['$event'])
onKeydown(event: KeyboardEvent): void {
  this.shortcuts.handleKeydown(event);
  if (event.metaKey && event.code === 'Space') event.preventDefault();
  this.shortcuts.handleKeydown(event);
}

// After: binding declared as metadata, one call per event
@Component({ host: { '(document:keydown)': 'onKeydown($event)' } })
onKeydown(event: KeyboardEvent): void {
  this.shortcuts.handleKeydown(event);
}`,
  };

  protected readonly interview = [
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
      a: "A pure pipe re-runs only when its input reference changes, so it is effectively memoised per binding. An impure pipe runs on every change detection pass. Most custom pipes should be pure. AsyncPipe is the classic impure one, because it has to check for new emissions.",
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
  ];
}
