import { computed, Injectable, signal } from '@angular/core';

export interface DockItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  pinned: boolean;
}

export type AppState = 'running' | 'focused' | 'minimized';

/**
 * [ng-04 signals] A signal store: private writable signals, public read-only
 * views, and methods that are the only way to change state.
 *
 * runningApps used to be a public WritableSignal, and both app.ts and
 * menu-bar.service.ts had grown their own copy of "minimize this app" that
 * wrote the Map directly. asReadonly() makes that a compile error, and
 * minimizeApp() is now the one place the rule lives.
 */
@Injectable({ providedIn: 'root' })
export class DockService {
  readonly pinnedApps = signal<DockItem[]>([
    { id: 'finder', label: 'Finder', icon: '🗂', color: '#2196F3', pinned: true },
    { id: 'about', label: 'About', icon: '👤', color: '#9C27B0', pinned: true },
    { id: 'projects', label: 'Projects', icon: '📁', color: '#4CAF50', pinned: true },
    { id: 'terminal', label: 'Terminal', icon: '⬛', color: '#1a1a1a', pinned: true },
    { id: 'thoughts', label: 'Thoughts', icon: '💭', color: '#FF9800', pinned: true },
    { id: 'settings', label: 'Settings', icon: '⚙️', color: '#607D8B', pinned: true },
    { id: 'contact', label: 'Contact', icon: '✉️', color: '#03A9F4', pinned: true },
  ]).asReadonly();

  private readonly runningAppsState = signal<Map<string, AppState>>(new Map([['finder', 'focused']]));
  /** Map of app id → current state */
  readonly runningApps = this.runningAppsState.asReadonly();

  private readonly transientAppsState = signal<DockItem[]>([]);
  /** Apps running but not pinned — shown after the separator */
  readonly transientApps = this.transientAppsState.asReadonly();

  readonly focusedAppId = computed(() => {
    for (const [id, state] of this.runningApps()) {
      if (state === 'focused') return id;
    }
    return null;
  });

  /** Derive indicator state for a given app id */
  readonly appIndicators = computed(() => {
    const running = this.runningApps();
    const result = new Map<string, 'active' | 'inactive'>();
    for (const [id, state] of running) {
      result.set(id, state === 'focused' ? 'active' : 'inactive');
    }
    return result;
  });

  isRunning(appId: string): boolean {
    return this.runningApps().has(appId);
  }

  getState(appId: string): AppState | undefined {
    return this.runningApps().get(appId);
  }

  /** Handle dock icon click with macOS-style behavior */
  handleDockClick(app: DockItem): void {
    const running = new Map(this.runningApps());
    const currentState = running.get(app.id);

    if (!currentState) {
      // Not running — launch it
      this.launchApp(app, running);
    } else if (currentState === 'focused') {
      // Already focused — minimize all windows of this app
      running.set(app.id, 'minimized');
      this.runningAppsState.set(running);
    } else {
      // Running but not focused (minimized or background) — focus it
      this.focusApp(app.id, running);
    }
  }

  launchApp(app: DockItem, running?: Map<string, AppState>): void {
    const map = running ?? new Map(this.runningApps());

    // Unfocus everything else
    for (const [id, state] of map) {
      if (state === 'focused') {
        map.set(id, 'running');
      }
    }

    map.set(app.id, 'focused');
    this.runningAppsState.set(map);

    // If app is not pinned and not already transient, add it
    if (!app.pinned && !this.transientApps().some((a) => a.id === app.id)) {
      this.transientAppsState.update((apps) => [...apps, app]);
    }
  }

  focusApp(appId: string, running?: Map<string, AppState>): void {
    const map = running ?? new Map(this.runningApps());

    for (const [id, state] of map) {
      if (state === 'focused') {
        map.set(id, 'running');
      }
    }

    map.set(appId, 'focused');
    this.runningAppsState.set(map);
  }

  /** Mark a running app minimized. An app that isn't running stays not running. */
  minimizeApp(appId: string): void {
    if (!this.runningApps().has(appId)) return;
    // A new Map, not running.set() on the current one: a signal compares by
    // reference, so mutating in place would notify nobody.
    const running = new Map(this.runningApps());
    running.set(appId, 'minimized');
    this.runningAppsState.set(running);
  }

  closeApp(appId: string): void {
    const running = new Map(this.runningApps());
    running.delete(appId);
    this.runningAppsState.set(running);

    // Remove from transient if present
    this.transientAppsState.update((apps) => apps.filter((a) => a.id !== appId));
  }
}
