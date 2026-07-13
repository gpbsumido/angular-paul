import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThoughtsService } from './thoughts.service';

@Component({
  selector: 'app-thought-detail',
  template: `
    @if (thought) {
      <div class="thought-detail">
        <button class="thought-detail-back" (click)="goBack()">← Back</button>
        <h1 class="thought-detail-title">{{ thought.title }}</h1>
        <div class="thought-detail-date">{{ thought.date }}</div>
        <div class="thought-detail-tags">
          @for (tag of thought.tags; track tag) {
            <span class="thought-tag">{{ tag }}</span>
          }
        </div>
        <div class="thought-detail-content">{{ thought.content }}</div>
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

    .thought-detail-not-found {
      padding: 32px;
      text-align: center;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
    }
  `,
})
export class ThoughtDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ThoughtsService);

  readonly thought = this.service.getBySlug(this.route.snapshot.paramMap.get('slug') ?? '');

  goBack() {
    this.router.navigate(['/thoughts']);
  }
}
