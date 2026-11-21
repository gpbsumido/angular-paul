import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../shared/seo.service';
import { ReadingProgressService } from './reading-progress.service';
import { ThoughtsService } from './thoughts.service';
import { UtcDatePipe } from './utc-date.pipe';

@Component({
  selector: 'app-thoughts-list',
  imports: [RouterLink, UtcDatePipe],
  template: `
    <div class="thoughts-list">
      @if (tag(); as tag) {
        <h2 class="thoughts-list-heading">Thoughts tagged “{{ tag }}”</h2>
        <a class="thoughts-list-all" routerLink="/thoughts">← All thoughts</a>
      } @else {
        <h2 class="thoughts-list-heading">Thoughts</h2>
      }
      @for (thought of thoughts(); track thought.slug) {
        <!-- [ng-07 routing] The card used to be a div with role="button" and a
             click handler calling router.navigate(). Now the title is a real
             link: it prerenders as an href, works with middle-click and
             ⌘-click, and lets the tag pills be links too (a link can't sit
             inside a button). The ::after on the title link still makes the
             whole card clickable. -->
        <article class="thought-card">
          <h3 class="thought-card-title">
            <a [routerLink]="['/thoughts', thought.slug]">{{ thought.title }}</a>
          </h3>
          <time class="thought-card-date" [attr.datetime]="thought.date">{{
            thought.date | utcDate
          }}</time>
          @if (progress.completedSlugs().has(thought.slug)) {
            <span class="thought-card-complete">✓ Completed</span>
          }
          <div class="thought-card-tags">
            @for (tag of thought.tags; track tag) {
              <a class="thought-tag" [routerLink]="['/thoughts/tag', tag]">{{ tag }}</a>
            }
          </div>
          <div class="thought-card-preview">{{ thought.summary }}</div>
        </article>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-primary, #fff);
    }

    .thoughts-list {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .thoughts-list-heading {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .thoughts-list-all {
      display: inline-block;
      margin-bottom: 16px;
      font-size: 13px;
      color: var(--accent-color, #007aff);
    }

    .thought-card {
      position: relative;
      padding: 16px;
      margin-bottom: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .thought-card:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .thought-card-title a {
      color: inherit;
      text-decoration: none;
    }

    .thought-card-title a::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    .thought-card-title a:focus-visible {
      outline: 2px solid var(--accent-color, #007aff);
      outline-offset: 2px;
    }

    .thought-card-title {
      margin: 0;
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .thought-card-complete {
      display: inline-block;
      font-size: 11px;
      font-weight: 600;
      color: var(--accent-color, #007aff);
      margin-bottom: 8px;
    }

    .thought-card-date {
      display: block;
      font-size: 11px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
      margin-bottom: 8px;
    }

    .thought-card-tags {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }

    .thought-tag {
      position: relative;
      z-index: 1;
      text-decoration: none;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(0, 122, 255, 0.15);
      color: var(--accent-color, #007aff);
    }

    .thought-card-preview {
      font-size: 12px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      line-height: 1.4;
    }
  `,
})
export class ThoughtsListComponent {
  private readonly service = inject(ThoughtsService);
  private readonly seo = inject(SeoService);
  protected readonly progress = inject(ReadingProgressService);

  /** From the :tag route param on /thoughts/tag/:tag; absent on /thoughts. */
  readonly tag = input<string>();

  readonly thoughts = computed(() => {
    const tag = this.tag();
    const all = this.service.getAll();
    return tag ? all.filter((thought) => thought.tags.includes(tag)) : all;
  });

  constructor() {
    // An effect, not a one-off call: moving between two tag pages reuses
    // this component and only changes the input.
    effect(() => this.seo.setListMeta(this.tag()));
  }
}
