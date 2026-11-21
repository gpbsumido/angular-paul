import { inject, Injectable, signal } from '@angular/core';
import { BROWSER_STORAGE } from '../shared/browser-storage';

const STORAGE_KEY = 'reading-progress';

/**
 * Which lessons the reader has marked complete, saved across visits.
 *
 * [ng-05 di] providedIn: 'root' makes this one shared instance for the whole
 * app, so the reader's toggle and the list's badges see the same state
 * without either knowing about the other. It depends on BROWSER_STORAGE, not
 * on localStorage, so it runs unchanged on the server and in specs.
 */
@Injectable({ providedIn: 'root' })
export class ReadingProgressService {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly completedState = signal<ReadonlySet<string>>(this.load());

  readonly completedSlugs = this.completedState.asReadonly();

  isComplete(slug: string): boolean {
    return this.completedSlugs().has(slug);
  }

  toggleComplete(slug: string): void {
    const completed = new Set(this.completedSlugs());
    if (!completed.delete(slug)) completed.add(slug);
    this.completedState.set(completed);
    this.storage?.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }

  private load(): ReadonlySet<string> {
    const raw = this.storage?.getItem(STORAGE_KEY);
    if (raw == null) return new Set();
    let saved: unknown;
    try {
      saved = JSON.parse(raw);
    } catch (cause) {
      throw new Error(`Saved ${STORAGE_KEY} is not valid JSON: ${raw}`, { cause });
    }
    if (!Array.isArray(saved) || !saved.every((slug) => typeof slug === 'string')) {
      throw new Error(`Saved ${STORAGE_KEY} should be a list of slugs, got: ${raw}`);
    }
    return new Set(saved);
  }
}
