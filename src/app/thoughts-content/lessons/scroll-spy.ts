import { afterNextRender, DestroyRef, Directive, inject, signal } from '@angular/core';

/**
 * [ng-10 directives] An attribute directive: behaviour with no template of
 * its own. It tracks which of a set of elements is in view and exposes that
 * element's id as a signal.
 *
 * Elements register themselves (see LessonSection) instead of this directive
 * querying the DOM for them. That keeps it ignorant of what a "section" is,
 * the same way NgForm doesn't search for inputs: each NgModel registers with
 * the form it finds through DI.
 */
@Directive({
  selector: '[appScrollSpy]',
  exportAs: 'scrollSpy',
})
export class ScrollSpy {
  private readonly active = signal<string | null>(null);
  readonly activeId = this.active.asReadonly();

  private readonly elements: HTMLElement[] = [];
  private readonly intersecting = new Set<Element>();
  private observer?: IntersectionObserver;

  constructor() {
    // afterNextRender never runs on the server, where there's no viewport to
    // observe. Creating the observer in the constructor would crash prerender.
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') return;
      // The trigger line is the top 30% of the viewport: a section becomes
      // current once its heading scrolls up into that band.
      this.observer = new IntersectionObserver((entries) => this.update(entries), {
        rootMargin: '0px 0px -70% 0px',
      });
      for (const element of this.elements) this.observer.observe(element);
    });
    inject(DestroyRef).onDestroy(() => this.observer?.disconnect());
  }

  register(element: HTMLElement): void {
    this.elements.push(element);
    this.observer?.observe(element);
  }

  private update(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.isIntersecting) this.intersecting.add(entry.target);
      else this.intersecting.delete(entry.target);
    }
    // Between headings nothing intersects; keep the last one rather than
    // clearing, because the reader is still inside that section.
    const first = this.elements.find((element) => this.intersecting.has(element));
    if (first) this.active.set(first.id);
  }
}
