import { Injectable } from '@angular/core';
import { THOUGHTS, ThoughtEntry } from './thoughts-data';

@Injectable({ providedIn: 'root' })
export class ThoughtsService {
  getAll(): ThoughtEntry[] {
    return [...THOUGHTS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getBySlug(slug: string): ThoughtEntry | undefined {
    return THOUGHTS.find((t) => t.slug === slug);
  }

  getByTag(tag: string): ThoughtEntry[] {
    return THOUGHTS.filter((t) => t.tags.includes(tag));
  }
}
