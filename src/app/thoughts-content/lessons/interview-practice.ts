import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import type { InterviewQuestion } from './interview-questions';

export interface PracticeCard extends InterviewQuestion {
  topic: string;
}

const ALL_TOPICS = '';

/**
 * [ng-13 interview] A flashcard deck over interview questions: read the
 * question, answer it out loud, then check. "Got it" takes the card out;
 * "Ask again" puts it at the back.
 *
 * The deck is a linkedSignal of the filtered cards: changing the topic or the
 * cards resets it, and in between it's ordinary writable state (lesson 04).
 * All three buttons are always rendered, so the one you just pressed keeps
 * focus when the next card comes up.
 */
@Component({
  selector: 'app-interview-practice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="practice-controls">
      <label for="practice-filter">Topic</label>
      <select id="practice-filter" #filter (change)="topic.set(filter.value)">
        <option [value]="allTopics">All topics</option>
        @for (name of topics(); track name) {
          <option [value]="name">{{ name }}</option>
        }
      </select>
      <p id="practice-progress" role="status">{{ deck().length }} left, {{ known() }} known</p>
    </div>

    @if (current(); as card) {
      <article class="practice-card" aria-labelledby="practice-question">
        <p id="practice-topic" class="practice-topic">{{ card.topic }}</p>
        <p id="practice-question" class="practice-question">{{ card.q }}</p>
        <p id="practice-answer" class="practice-answer" [hidden]="!revealed()">{{ card.a }}</p>
        <div class="practice-actions">
          <button
            id="practice-reveal"
            type="button"
            aria-controls="practice-answer"
            [attr.aria-expanded]="revealed()"
            (click)="revealed.set(!revealed())"
          >
            {{ revealed() ? 'Hide answer' : 'Show answer' }}
          </button>
          <button id="practice-known" type="button" (click)="markKnown()">Got it</button>
          <button id="practice-again" type="button" (click)="askAgain()">Ask again</button>
        </div>
      </article>
    } @else {
      <p class="practice-done">That's the whole deck.</p>
      <button id="practice-restart" type="button" (click)="restart()">Start over</button>
    }
  `,
  styles: `
    .practice-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    #practice-progress {
      margin: 0 0 0 auto;
      font-variant-numeric: tabular-nums;
    }
    .practice-card {
      margin-top: 12px;
      padding: 12px 16px;
      border: 1px solid var(--border-primary, rgba(255, 255, 255, 0.1));
      border-radius: 8px;
    }
    .practice-topic {
      margin: 0;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .practice-question {
      font-weight: 600;
    }
    .practice-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
})
export class InterviewPractice {
  readonly cards = input.required<readonly PracticeCard[]>();

  protected readonly allTopics = ALL_TOPICS;
  protected readonly topic = signal(ALL_TOPICS);
  protected readonly topics = computed(() => [...new Set(this.cards().map((card) => card.topic))]);

  private readonly filtered = computed(() => {
    const topic = this.topic();
    return topic === ALL_TOPICS
      ? this.cards()
      : this.cards().filter((card) => card.topic === topic);
  });

  protected readonly deck = linkedSignal<readonly PracticeCard[]>(() => this.filtered());
  protected readonly known = linkedSignal({ source: this.filtered, computation: () => 0 });
  protected readonly revealed = signal(false);
  protected readonly current = computed(() => this.deck()[0]);

  protected markKnown(): void {
    this.deck.update(([, ...rest]) => rest);
    this.known.update((count) => count + 1);
    this.revealed.set(false);
  }

  protected askAgain(): void {
    this.deck.update(([first, ...rest]) => [...rest, first]);
    this.revealed.set(false);
  }

  protected restart(): void {
    this.deck.set(this.filtered());
    this.known.set(0);
    this.revealed.set(false);
  }
}
