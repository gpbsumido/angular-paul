import { NgComponentOutlet } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, input, resource } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../shared/seo.service';
import { LESSON_PAGES } from './lessons/lessons';
import { ReadingProgressService } from './reading-progress.service';
import { ReadingTimePipe } from './reading-time.pipe';
import { UtcDatePipe } from './utc-date.pipe';
import { ThoughtsService } from './thoughts.service';

@Component({
  selector: 'app-thought-detail',
  imports: [NgComponentOutlet, RouterLink, UtcDatePipe, ReadingTimePipe],
  template: `
    @if (thought(); as thought) {
      <div class="thought-detail">
        <button class="thought-detail-back" (click)="goBack()">← Back</button>
        <h1 class="thought-detail-title">{{ thought.title }}</h1>
        <!-- [ng-03 templates] Formatted in UTC: see utc-date.pipe.ts for why
             that, and why not Angular's own DatePipe. -->
        <div class="thought-detail-date">
          <time [attr.datetime]="thought.date">{{ thought.date | utcDate }}</time>
          @if (!hasLessonPage()) {
            · {{ thought.content | readingTime }}
          }
        </div>
        <div class="thought-detail-tags">
          @for (tag of thought.tags; track tag) {
            <a class="thought-tag" [routerLink]="['/thoughts/tag', tag]">{{ tag }}</a>
          }
        </div>
        <div class="thought-detail-content">{{ thought.content }}</div>
        @if (lessonPage.value(); as page) {
          <ng-container *ngComponentOutlet="page" />
        }
        @if (series(); as series) {
          <nav class="series-nav" aria-label="Angular guide">
            <span class="series-nav-position"
              >Part {{ series.index + 1 }} of {{ series.total }} · {{ seriesCompleted() }} of
              {{ series.total }} complete</span
            >
            <!-- [ng-05 di] A toggle is a button with aria-pressed, not a checkbox
                 styled as one. The visible label changes too, so the state isn't
                 conveyed by colour alone. -->
            <button
              type="button"
              class="lesson-complete"
              [attr.aria-pressed]="isComplete()"
              (click)="progress.toggleComplete(thought.slug)"
            >
              {{ isComplete() ? 'Completed ✓' : 'Mark lesson complete' }}
            </button>
            @if (series.previous; as previous) {
              <a [routerLink]="['/thoughts', previous.slug]" rel="prev">← {{ previous.title }}</a>
            }
            @if (series.next; as next) {
              <a [routerLink]="['/thoughts', next.slug]" rel="next" class="series-nav-next">{{ next.title }} →</a>
            }
          </nav>
        }
      </div>
    } @else {
      <div class="thought-detail-not-found">Thought not found.</div>
    }
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-primary, #fff);
    }

    .thought-detail {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .thought-detail-back {
      background: none;
      border: none;
      color: var(--accent-color, #007aff);
      font-size: 13px;
      cursor: pointer;
      padding: 0;
      margin-bottom: 16px;
    }

    .thought-detail-back:hover {
      text-decoration: underline;
    }

    .thought-detail-title {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 6px;
    }

    .thought-detail-date {
      font-size: 12px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
      margin-bottom: 12px;
    }

    .thought-detail-tags {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .thought-tag {
      text-decoration: none;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 12px;
      background: rgba(0, 122, 255, 0.15);
      color: var(--accent-color, #007aff);
    }

    .thought-detail-content {
      font-size: 14px;
      line-height: 1.7;
      color: var(--text-secondary, rgba(255, 255, 255, 0.8));
      white-space: pre-wrap;
    }

    .series-nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
      font-size: 13px;
    }
    .series-nav-position {
      flex-basis: 100%;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
    }
    .series-nav a {
      color: var(--accent-color, #007aff);
    }
    .lesson-complete {
      flex-basis: 100%;
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid var(--accent-color, #007aff);
      background: none;
      color: var(--accent-color, #007aff);
      font: inherit;
      cursor: pointer;
    }
    .lesson-complete[aria-pressed='true'] {
      background: var(--accent-color, #007aff);
      color: #fff;
    }
    .lesson-complete:focus-visible {
      outline: 2px solid var(--accent-color, #007aff);
      outline-offset: 2px;
    }
    .series-nav-next {
      margin-left: auto;
    }

    .thought-detail-not-found {
      padding: 32px;
      text-align: center;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
    }
  `,
})
export class ThoughtDetailComponent {
  private readonly router = inject(Router);
  private readonly service = inject(ThoughtsService);
  private readonly seo = inject(SeoService);
  protected readonly progress = inject(ReadingProgressService);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // [ng-04 signals] The slug is a signal, and everything else derives from it.
  // It used to read route.snapshot once, and the router reuses this component
  // when only :slug changes, so the snapshot went stale.
  //
  // [ng-07 routing] Lesson 04 fixed that with toSignal(route.paramMap). With
  // withComponentInputBinding() in app.config.ts, the router now sets :slug
  // as this input directly, and updates it on reuse. No ActivatedRoute, no
  // Observable, and a spec can set it without a router at all.
  readonly slug = input.required<string>();

  // computed(): derived, memoised, recomputed only when slug() changes.
  readonly thought = computed(() => this.service.getBySlug(this.slug()));
  readonly series = computed(() => this.service.getSeriesPosition(this.slug(), 'angular-guide'));
  // [ng-05 di] Reads a signal from a root service, so these update the moment
  // the toggle (or anything else holding the same instance) changes progress.
  readonly isComplete = computed(() => this.progress.completedSlugs().has(this.slug()));
  readonly seriesCompleted = computed(
    () => this.series()?.slugs.filter((slug) => this.progress.isComplete(slug)).length ?? 0,
  );
  // Lesson pages are mostly interactive, so a word count of the intro would undersell them.
  readonly hasLessonPage = computed(() => this.slug() in LESSON_PAGES);

  // A resource rather than a bare promise: while it loads it holds a pending
  // task, so SSR prerendering waits for the lesson chunk and bakes the full
  // interactive page into the static HTML instead of an empty slot.
  // `params` makes it reactive: a new slug aborts the old load and starts a new one.
  readonly lessonPage = resource({
    params: () => this.slug(),
    loader: ({ params: slug }) => LESSON_PAGES[slug]?.() ?? Promise.resolve(undefined),
  });

  constructor() {
    // effect(): for side effects that leave the signal graph, here the
    // document head and the DOM scroll position. Never use one to copy a
    // signal into another signal; that's what computed() is for.
    effect(() => {
      const thought = this.thought();
      if (thought) this.seo.setThoughtMeta(thought);
    });
    effect(() => {
      this.slug();
      this.host.nativeElement.scrollTop = 0;
    });
  }

  goBack() {
    this.router.navigate(['/thoughts']);
  }
}
