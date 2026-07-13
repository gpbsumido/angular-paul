import { Injectable } from '@angular/core';
import { THOUGHTS } from '../thoughts-content/thoughts-data';

export interface SearchResult {
  label: string;
  icon: string;
  action: string;
}

export interface SearchResultGroup {
  category: string;
  items: SearchResult[];
}

const APPS: SearchResult[] = [
  { label: 'Finder', icon: '🗂', action: 'launch:finder' },
  { label: 'About', icon: '👤', action: 'launch:about' },
  { label: 'Projects', icon: '📁', action: 'launch:projects' },
  { label: 'Terminal', icon: '⬛', action: 'launch:terminal' },
  { label: 'Thoughts', icon: '💭', action: 'launch:thoughts' },
  { label: 'Settings', icon: '⚙️', action: 'launch:settings' },
  { label: 'Contact', icon: '✉️', action: 'launch:contact' },
];

const FILES: SearchResult[] = [
  { label: 'README.md', icon: '📄', action: 'file:readme' },
  { label: 'Projects', icon: '📁', action: 'file:projects' },
  { label: 'Thoughts', icon: '📁', action: 'file:thoughts' },
];

@Injectable({ providedIn: 'root' })
export class SearchService {
  search(query: string): SearchResultGroup[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const groups: SearchResultGroup[] = [];

    const matchedApps = APPS.filter((app) => app.label.toLowerCase().includes(q));
    if (matchedApps.length > 0) {
      groups.push({ category: 'Applications', items: matchedApps });
    }

    const matchedThoughts = THOUGHTS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) || t.tags.some((tag) => tag.toLowerCase().includes(q)),
    ).map((t) => ({
      label: t.title,
      icon: '📝',
      action: `openThought:${t.slug}`,
    }));
    if (matchedThoughts.length > 0) {
      groups.push({ category: 'Thoughts', items: matchedThoughts });
    }

    const matchedFiles = FILES.filter((f) => f.label.toLowerCase().includes(q));
    if (matchedFiles.length > 0) {
      groups.push({ category: 'Files', items: matchedFiles });
    }

    return groups;
  }
}
