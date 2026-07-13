import { Injectable } from '@angular/core';
import { THOUGHTS } from '../../thoughts-content/thoughts-data';

export interface FileEntry {
  name: string;
  type: 'file' | 'folder';
  icon: string;
  path: string;
  action?: string;
}

@Injectable({ providedIn: 'root' })
export class FileSystemService {
  private readonly tree: Map<string, FileEntry[]>;

  constructor() {
    this.tree = new Map<string, FileEntry[]>();

    this.tree.set('/', [
      { name: 'Applications', type: 'folder', icon: '📂', path: '/Applications/' },
      { name: 'Thoughts', type: 'folder', icon: '💭', path: '/Thoughts/' },
      { name: 'Projects', type: 'folder', icon: '📁', path: '/Projects/' },
      { name: 'Preferences', type: 'folder', icon: '⚙️', path: '/Preferences/' },
    ]);

    this.tree.set('/Applications/', [
      {
        name: 'Finder',
        type: 'file',
        icon: '🗂',
        path: '/Applications/Finder',
        action: 'launch:finder',
      },
      {
        name: 'About',
        type: 'file',
        icon: '👤',
        path: '/Applications/About',
        action: 'launch:about',
      },
      {
        name: 'Projects',
        type: 'file',
        icon: '📁',
        path: '/Applications/Projects',
        action: 'launch:projects',
      },
      {
        name: 'Terminal',
        type: 'file',
        icon: '⬛',
        path: '/Applications/Terminal',
        action: 'launch:terminal',
      },
      {
        name: 'Thoughts',
        type: 'file',
        icon: '💭',
        path: '/Applications/Thoughts',
        action: 'launch:thoughts',
      },
      {
        name: 'Settings',
        type: 'file',
        icon: '⚙️',
        path: '/Applications/Settings',
        action: 'launch:settings',
      },
      {
        name: 'Contact',
        type: 'file',
        icon: '✉️',
        path: '/Applications/Contact',
        action: 'launch:contact',
      },
    ]);

    this.tree.set(
      '/Thoughts/',
      THOUGHTS.map((t) => ({
        name: t.title,
        type: 'file' as const,
        icon: '📝',
        path: `/Thoughts/${t.slug}`,
        action: `thought:${t.slug}`,
      })),
    );

    this.tree.set('/Projects/', [
      {
        name: 'View Projects',
        type: 'file',
        icon: '📊',
        path: '/Projects/view',
        action: 'launch:projects',
      },
    ]);

    this.tree.set('/Preferences/', [
      {
        name: 'System Preferences',
        type: 'file',
        icon: '⚙️',
        path: '/Preferences/system',
        action: 'launch:settings',
      },
    ]);
  }

  getChildren(path: string): FileEntry[] {
    return this.tree.get(path) ?? [];
  }
}
