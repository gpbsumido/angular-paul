import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { Lesson } from './lesson';
import { LessonDemo } from './lesson-demo';
import { LessonSection } from './lesson-section';

// [ng-10 directives] A structural directive: it decides whether its template
// exists at all. The * in *appDemoUnless is sugar for wrapping the element in
// an <ng-template>, which is what TemplateRef points at.
@Directive({ selector: '[appDemoUnless]' })
export class DemoUnless {
  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  readonly appDemoUnless = input.required<boolean>();

  constructor() {
    effect(() => {
      this.container.clear();
      if (!this.appDemoUnless()) this.container.createEmbeddedView(this.template);
    });
  }
}

// [ng-10 directives] An attribute directive: no template, just behaviour on
// its host. The `host` metadata replaces @HostBinding and @HostListener.
@Directive({
  selector: '[appDemoHighlight]',
  host: { '[style.background-color]': 'appDemoHighlight()' },
})
export class DemoHighlight {
  readonly appDemoHighlight = input('');
}

// [ng-10 directives] The same directive composed into a component. The
// directive's input is exposed under a friendlier name; inputs a host
// directive doesn't list stay private to the component.
@Component({
  selector: 'app-demo-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: DemoHighlight, inputs: ['appDemoHighlight: color'] }],
  template: `<ng-content />`,
  styles: `
    :host {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      background: #e8e8ed;
      color: #111;
    }
  `,
})
export class DemoChip {}

@Component({
  selector: 'app-lesson-10-directives',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Lesson,
    LessonSection,
    LessonDemo,
    CodeBlock,
    Callout,
    InterviewQuestions,
    DemoUnless,
    DemoChip,
  ],
  template: `
    <app-lesson part="10">
      <h2>Simple</h2>
      <p>
        A <strong>directive</strong> adds behaviour to an element that already exists. A component
        is a directive that also brings a template. There are two other kinds:
      </p>
      <ul>
        <li>
          <strong>Attribute directives</strong> change how an element looks or behaves. Built-in
          examples are <code>NgClass</code> and <code>RouterLink</code>.
        </li>
        <li>
          <strong>Structural directives</strong> add and remove elements. <code>*ngIf</code> and
          <code>*ngFor</code> were the famous ones, and the built-in <code>&#64;if</code> and
          <code>&#64;for</code> blocks have mostly replaced them.
        </li>
      </ul>
      <p>
        The nav at the top of this page comes from two directives I wrote for this lesson.
        <code>LessonSection</code> gives every heading an id and registers it.
        <code>ScrollSpy</code> watches the registered headings with an
        <code>IntersectionObserver</code> and highlights the section you're reading. Scroll, and
        watch the nav follow.
      </p>
      <app-code-block label="lesson-section.ts" [code]="snippets.section" />

      <h2>Intermediate</h2>
      <p>
        <strong>Structural directives</strong> inject a <code>TemplateRef</code> (what to render)
        and a <code>ViewContainerRef</code> (where to render it). The <code>*</code> is sugar:
        <code>*appDemoUnless="hidden()"</code> wraps the element in an
        <code>&lt;ng-template&gt;</code> and binds the expression to an input named after the
        selector.
      </p>
      <app-lesson-demo heading="Try it: a structural directive">
        <div class="demo-row">
          <button
            id="demo-unless-toggle"
            type="button"
            [attr.aria-pressed]="hidden()"
            (click)="hidden.set(!hidden())"
          >
            Hide the paragraph
          </button>
        </div>
        <p id="demo-unless-content" *appDemoUnless="hidden()">
          I exist only while the condition is false. When it's true, I'm not hidden with CSS; I'm
          gone from the DOM.
        </p>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.unless" />

      <h2>Expert</h2>
      <p>
        <strong>Composition with hostDirectives.</strong> A component can take on a directive's
        behaviour without anyone writing its attribute, and without inheritance. The lesson
        component on this page does exactly that with <code>ScrollSpy</code>. You choose which of
        the directive's inputs and outputs to expose, and you can rename them.
      </p>
      <app-lesson-demo heading="Try it: a host directive with an aliased input">
        <div class="demo-row">
          <label for="demo-chip-color">Chip colour</label>
          <select id="demo-chip-color" #color (change)="chipColor.set(color.value)">
            <option value="">none</option>
            <option value="gold">gold</option>
            <option value="lightgreen">lightgreen</option>
            <option value="lightblue">lightblue</option>
          </select>
          <app-demo-chip id="demo-chip" [color]="chipColor()">angular</app-demo-chip>
        </div>
      </app-lesson-demo>
      <app-code-block label="this demo" [code]="snippets.hostDirectives" />
      <p>
        <strong>Directives talking through DI.</strong> Each heading finds the
        <code>ScrollSpy</code> by injecting it. Element injectors follow the template, so a heading
        projected into <code>&lt;app-lesson&gt;</code> resolves the one on that host.
        <code>NgModel</code> finds its <code>NgForm</code> and <code>RouterLinkActive</code> finds
        its links the same way. It beats the parent querying the DOM: the child knows what it is,
        and the parent stays generic.
      </p>
      <app-code-block label="scroll-spy.ts" [code]="snippets.spy" />
      <app-callout kind="expert">
        <p>
          <code>LessonSection</code>'s selector is just <code>h2</code>. Every h2 in a template that
          imports it gets the directive, no attribute needed. <code>NgForm</code> does the same with
          <code>form</code>, which is why a plain form in a template-driven app is already an
          <code>NgForm</code>. It's powerful, and it only applies where the directive is imported,
          but it's easy to surprise someone with.
        </p>
      </app-callout>

      <h2>Pitfalls</h2>
      <app-callout kind="pitfall">
        <p>
          <strong>Reading the DOM in a constructor.</strong> A directive is created when its element
          opens, before its children exist. My first draft of <code>LessonSection</code> read the
          heading's text in a field initialiser, which runs before the text node exists, so every id
          would have come out empty. Read it later: in a getter that a binding calls, or in
          <code>afterNextRender</code>.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Browser APIs during SSR.</strong> <code>IntersectionObserver</code>,
          <code>window</code> and <code>matchMedia</code> don't exist on the server. Code that needs
          them belongs in <code>afterNextRender</code>, which never runs there.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>Observers and listeners that outlive the element.</strong> Disconnect them in
          <code>DestroyRef.onDestroy</code>. Otherwise every visit to a page leaks one more
          observer.
        </p>
      </app-callout>
      <app-callout kind="pitfall">
        <p>
          <strong>One structural directive per element.</strong> <code>*ngIf</code> and
          <code>*ngFor</code> on the same element is an error. Wrap one in an
          <code>&lt;ng-container&gt;</code>, or use <code>&#64;if</code> and <code>&#64;for</code>.
        </p>
      </app-callout>

      <h2>Interview questions</h2>
      <app-interview-questions [questions]="interview" />
    </app-lesson>
  `,
})
export class Lesson10Directives {
  protected readonly hidden = signal(false);
  protected readonly chipColor = signal('');

  protected readonly snippets = {
    section: `@Directive({
  selector: 'h2',                                  // every h2 where this is imported
  host: { '[id]': 'id', tabindex: '-1' },
})
export class LessonSection {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  get label() { return this.host.nativeElement.textContent?.trim() ?? ''; }
  get id() { return this.label.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }

  constructor() {
    inject(ScrollSpy, { optional: true })?.register(this.host.nativeElement);
  }
}`,
    unless: `@Directive({ selector: '[appDemoUnless]' })
export class DemoUnless {
  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);
  readonly appDemoUnless = input.required<boolean>();

  constructor() {
    effect(() => {
      this.container.clear();
      if (!this.appDemoUnless()) this.container.createEmbeddedView(this.template);
    });
  }
}

<p *appDemoUnless="hidden()">…</p>
<!-- is sugar for -->
<ng-template [appDemoUnless]="hidden()"><p>…</p></ng-template>`,
    hostDirectives: `@Directive({
  selector: '[appDemoHighlight]',
  host: { '[style.background-color]': 'appDemoHighlight()' },
})
export class DemoHighlight {
  readonly appDemoHighlight = input('');
}

@Component({
  selector: 'app-demo-chip',
  hostDirectives: [{ directive: DemoHighlight, inputs: ['appDemoHighlight: color'] }],
  template: '<ng-content />',
})
export class DemoChip {}

<app-demo-chip [color]="chipColor()">angular</app-demo-chip>`,
    spy: `@Directive({ selector: '[appScrollSpy]', exportAs: 'scrollSpy' })
export class ScrollSpy {
  private readonly active = signal<string | null>(null);
  readonly activeId = this.active.asReadonly();
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {                  // browser only
      this.observer = new IntersectionObserver(
        (entries) => this.update(entries),
        { rootMargin: '0px 0px -70% 0px' },  // top 30% of the viewport
      );
      for (const element of this.elements) this.observer.observe(element);
    });
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }
}

@Component({ selector: 'app-lesson', hostDirectives: [ScrollSpy], ... })`,
  };

  protected readonly interview = [
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
  ];
}
