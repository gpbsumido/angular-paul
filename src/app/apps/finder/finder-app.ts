import { Component, computed, inject, output, signal } from '@angular/core';
import { FileSystemService, FileEntry } from './file-system.service';

@Component({
  selector: 'app-finder',
  template: `
    <div class="finder">
      <div class="finder-toolbar">
        <button class="finder-toolbar-back" (click)="goBack()" [disabled]="!canGoBack()">←</button>
        <button class="finder-toolbar-forward" (click)="goForward()" [disabled]="!canGoForward()">
          →
        </button>
        <span class="finder-breadcrumb">{{ breadcrumb() }}</span>
      </div>

      <div class="finder-body">
        <nav class="finder-sidebar">
          <div class="finder-sidebar-section">Favorites</div>
          @for (fav of favorites; track fav.path) {
            <button
              class="finder-sidebar-item"
              [class.active]="currentPath() === fav.path"
              (click)="navigateTo(fav.path)"
            >
              {{ fav.icon }} {{ fav.name }}
            </button>
          }
        </nav>

        <div class="finder-columns">
          <div class="finder-column">
            @for (entry of currentEntries(); track entry.path) {
              <div
                class="finder-entry"
                [class.selected]="selectedPath() === entry.path"
                (click)="onEntryClick(entry)"
              >
                <span class="finder-entry-icon">{{ entry.icon }}</span>
                <span class="finder-entry-name">{{ entry.name }}</span>
                @if (entry.type === 'folder') {
                  <span class="finder-entry-chevron">›</span>
                }
              </div>
            }
          </div>

          @if (childEntries().length > 0) {
            <div class="finder-column">
              @for (entry of childEntries(); track entry.path) {
                <div class="finder-entry" (click)="onEntryClick(entry)">
                  <span class="finder-entry-icon">{{ entry.icon }}</span>
                  <span class="finder-entry-name">{{ entry.name }}</span>
                  @if (entry.type === 'folder') {
                    <span class="finder-entry-chevron">›</span>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-primary, #fff);
    }

    .finder {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .finder-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .finder-toolbar button {
      background: none;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      color: var(--text-primary, #fff);
      width: 28px;
      height: 24px;
      cursor: pointer;
      font-size: 14px;
    }

    .finder-toolbar button:disabled {
      opacity: 0.3;
      cursor: default;
    }

    .finder-breadcrumb {
      font-size: 12px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      margin-left: 8px;
    }

    .finder-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .finder-sidebar {
      width: 160px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.03);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      overflow-y: auto;
    }

    .finder-sidebar-section {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-secondary, rgba(255, 255, 255, 0.4));
      padding: 4px 8px;
      margin-bottom: 4px;
    }

    .finder-sidebar-item {
      display: block;
      width: 100%;
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      background: none;
      color: var(--text-primary, #fff);
      font-size: 12px;
      text-align: left;
      cursor: pointer;
    }

    .finder-sidebar-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .finder-sidebar-item.active {
      background: rgba(0, 122, 255, 0.2);
    }

    .finder-columns {
      display: flex;
      flex: 1;
      overflow-x: auto;
    }

    .finder-column {
      min-width: 220px;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      overflow-y: auto;
      padding: 4px 0;
    }

    .finder-entry {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      cursor: pointer;
      font-size: 12px;
    }

    .finder-entry:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .finder-entry.selected {
      background: rgba(0, 122, 255, 0.2);
    }

    .finder-entry-icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    .finder-entry-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .finder-entry-chevron {
      color: var(--text-secondary, rgba(255, 255, 255, 0.3));
      font-size: 14px;
    }
  `,
})
export class FinderApp {
  private readonly fs = inject(FileSystemService);
  readonly openFile = output<string>();

  readonly currentPath = signal('/');
  readonly selectedPath = signal<string | null>(null);

  private readonly history = signal<string[]>(['/']);
  private readonly historyIndex = signal(0);

  readonly favorites = [
    { name: 'Applications', icon: '📂', path: '/Applications/' },
    { name: 'Thoughts', icon: '💭', path: '/Thoughts/' },
    { name: 'Projects', icon: '📁', path: '/Projects/' },
  ];

  readonly currentEntries = computed(() => this.fs.getChildren(this.currentPath()));

  readonly childEntries = computed(() => {
    const selected = this.selectedPath();
    if (!selected) return [];
    const entry = this.currentEntries().find((e) => e.path === selected);
    if (!entry || entry.type !== 'folder') return [];
    return this.fs.getChildren(entry.path);
  });

  readonly breadcrumb = computed(() => {
    const path = this.currentPath();
    return path === '/' ? '/' : path.replace(/\/$/, '');
  });

  readonly canGoBack = computed(() => this.historyIndex() > 0);
  readonly canGoForward = computed(() => this.historyIndex() < this.history().length - 1);

  navigateTo(path: string) {
    this.currentPath.set(path);
    this.selectedPath.set(null);

    const idx = this.historyIndex();
    const hist = this.history().slice(0, idx + 1);
    hist.push(path);
    this.history.set(hist);
    this.historyIndex.set(hist.length - 1);
  }

  onEntryClick(entry: FileEntry) {
    if (entry.type === 'folder') {
      this.navigateTo(entry.path);
    } else {
      this.selectedPath.set(entry.path);
      if (entry.action) {
        this.openFile.emit(entry.action);
      }
    }
  }

  goBack() {
    if (!this.canGoBack()) return;
    const idx = this.historyIndex() - 1;
    this.historyIndex.set(idx);
    this.currentPath.set(this.history()[idx]);
    this.selectedPath.set(null);
  }

  goForward() {
    if (!this.canGoForward()) return;
    const idx = this.historyIndex() + 1;
    this.historyIndex.set(idx);
    this.currentPath.set(this.history()[idx]);
    this.selectedPath.set(null);
  }
}
