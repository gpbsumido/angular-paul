import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThoughtsService } from './thoughts.service';

@Component({
  selector: 'app-thoughts-list',
  template: `
    <div class="thoughts-list">
      <h2 class="thoughts-list-heading">Thoughts</h2>
      @for (thought of thoughts; track thought.slug) {
        <div
          class="thought-card"
          role="button"
          tabindex="0"
          (click)="navigate(thought.slug)"
          (keydown.enter)="navigate(thought.slug)"
        >
          <div class="thought-card-title">{{ thought.title }}</div>
          <div class="thought-card-date">{{ thought.date }}</div>
          <div class="thought-card-tags">
            @for (tag of thought.tags; track tag) {
              <span class="thought-tag">{{ tag }}</span>
            }
          </div>
          <div class="thought-card-preview">{{ thought.summary }}</div>
        </div>
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

    .thought-card {
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

    .thought-card-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .thought-card-date {
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
  private readonly router = inject(Router);

  readonly thoughts = this.service.getAll();

  navigate(slug: string) {
    this.router.navigate(['/thoughts', slug]);
  }
}
