import { Injectable } from '@angular/core';
import { THOUGHT_BODIES } from './thoughts-bodies';
import { THOUGHTS, ThoughtEntry } from './thoughts-data';

/** A thought with its prose joined back on, which is what the reader actually renders. */
export type ThoughtWithContent = ThoughtEntry & { content: string };

const withBody = (entry: ThoughtEntry): ThoughtWithContent => ({
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

  getByTag(tag: string): ThoughtWithContent[] {
    return THOUGHTS.filter((t) => t.tags.includes(tag)).map(withBody);
  }
}
