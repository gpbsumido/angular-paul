import { Directive, ElementRef, inject } from '@angular/core';
import { ScrollSpy } from './scroll-spy';

/**
 * [ng-10 directives] A directive whose selector is a plain element, `h2`.
 * Every h2 in a template that imports this gets it, with no attribute to
 * remember. Angular's own NgForm does the same with `form`. The selector only
 * applies in templates that import the directive, so it can't leak site-wide.
 *
 * The id comes from the heading's text, so it's stable between the server
 * render and the browser, and readable in a URL.
 */
@Directive({
  selector: 'h2',
  host: { '[id]': 'id', tabindex: '-1' },
})
export class LessonSection {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Getters, not fields: a directive is created when its element opens,
  // before the heading's text node exists, so the constructor sees ''.
  // Host bindings and the lesson nav read these later, once it does.
  get label(): string {
    return this.host.nativeElement.textContent?.trim() ?? '';
  }

  get id(): string {
    return this.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  constructor() {
    // Element injectors follow the template, so a heading projected into
    // <app-lesson> finds the ScrollSpy on that host. Optional: an h2 outside a
    // lesson still gets its id.
    inject(ScrollSpy, { optional: true })?.register(this.host.nativeElement);
  }

  scrollIntoView(): void {
    // Browsers don't apply prefers-reduced-motion to smooth scrolling for us.
    const reduceMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    this.host.nativeElement.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    this.host.nativeElement.focus({ preventScroll: true });
  }
}
