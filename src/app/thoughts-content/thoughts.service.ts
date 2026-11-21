import { Injectable } from '@angular/core';
import { THOUGHT_BODIES } from './thoughts-bodies';
import { THOUGHTS, ThoughtEntry } from './thoughts-data';

/** A thought with its prose joined back on, which is what the reader actually renders. */
export type ThoughtWithContent = ThoughtEntry & { content: string };

export interface SeriesPosition {
  index: number;
  total: number;
  /** Every slug in the series, in order, so callers can count progress across it. */
  slugs: string[];
  previous?: ThoughtEntry;
  next?: ThoughtEntry;
}

const withBody =(entry: ThoughtEntry): ThoughtWithContent => ({
  ...entry,
  content: THOUGHT_BODIES[entry.slug] ?? '',
});

@Injectable({ providedIn: 'root' })
export class ThoughtsService {
  getAll(): ThoughtWithContent[] {
    return [...THOUGHTS]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map(withBody);
  }

  getBySlug(slug: string): ThoughtWithContent | undefined {
    const entry = THOUGHTS.find((t) => t.slug === slug);
    return entry && withBody(entry);
  }

  /** Where a thought sits in a tagged series. THOUGHTS order is publication order. */
  getSeriesPosition(slug: string, seriesTag: string): SeriesPosition | undefined {
    const series = THOUGHTS.filter((t) => t.tags.includes(seriesTag));
    const index = series.findIndex((t) => t.slug === slug);
    if (index === -1) return undefined;
    return {
      index,
      total: series.length,
      slugs: series.map((t) => t.slug),
      previous: series[index - 1],
      next: series[index + 1],
    };
  }

  getByTag(tag: string): ThoughtWithContent[] {
    return THOUGHTS.filter((t) => t.tags.includes(tag)).map(withBody);
  }
}
