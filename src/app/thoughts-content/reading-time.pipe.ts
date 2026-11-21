import { Pipe, PipeTransform } from '@angular/core';

const WORDS_PER_MINUTE = 200;

/**
 * [ng-03 templates] A custom pipe: `{{ thought.content | readingTime }}`.
 *
 * Pipes are pure by default, so Angular only re-runs transform() when the
 * input reference changes. That makes a pipe the right place for a derivation
 * that's called from a template. A method call like `{{ readingTime(text) }}`
 * re-runs on every change detection pass that touches this view.
 */
@Pipe({ name: 'readingTime' })
export class ReadingTimePipe implements PipeTransform {
  transform(text: string): string {
    const words = text.split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} min read`;
  }
}
