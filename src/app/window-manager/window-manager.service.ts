import { computed, Injectable, signal } from '@angular/core';

export interface WindowState {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

export interface OpenWindowOptions {
  appId: string;
  title: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

let nextWindowId = 0;
let nextZIndex = 100;

@Injectable({ providedIn: 'root' })
export class WindowManagerService {
  private readonly _windows = signal<WindowState[]>([]);
  private readonly _focusedWindowId = signal<string | null>(null);

  readonly windows = computed(() => this._windows());
  readonly focusedWindowId = computed(() => this._focusedWindowId());

  openWindow(options: OpenWindowOptions): string {
    const id = `win-${++nextWindowId}`;
    const zIndex = ++nextZIndex;

    const windowState: WindowState = {
      id,
      appId: options.appId,
      title: options.title,
      x: options.x ?? 100 + (nextWindowId % 10) * 30,
      y: options.y ?? 100 + (nextWindowId % 10) * 30,
      width: options.width ?? 640,
      height: options.height ?? 480,
      minimized: false,
      maximized: false,
      zIndex,
    };

    this._windows.update((wins) => [...wins, windowState]);
    this._focusedWindowId.set(id);

    return id;
  }

  closeWindow(id: string): void {
    this._windows.update((wins) => wins.filter((w) => w.id !== id));

    if (this._focusedWindowId() === id) {
      // Focus the topmost remaining window
      const remaining = this._windows();
      if (remaining.length > 0) {
        const topmost = remaining.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
        this._focusedWindowId.set(topmost.id);
      } else {
        this._focusedWindowId.set(null);
      }
    }
  }

  focusWindow(id: string): void {
    const zIndex = ++nextZIndex;

    this._windows.update((wins) => wins.map((w) => (w.id === id ? { ...w, zIndex } : w)));
    this._focusedWindowId.set(id);
  }

  minimizeWindow(id: string): void {
    this._windows.update((wins) => wins.map((w) => (w.id === id ? { ...w, minimized: true } : w)));

    if (this._focusedWindowId() === id) {
      // Focus the topmost non-minimized window
      const visible = this._windows().filter((w) => !w.minimized);
      if (visible.length > 0) {
        const topmost = visible.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
        this._focusedWindowId.set(topmost.id);
      } else {
        this._focusedWindowId.set(null);
      }
    }
  }

  maximizeWindow(id: string): void {
    this._windows.update((wins) =>
      wins.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)),
    );
  }

  getWindow(id: string): WindowState | undefined {
    return this._windows().find((w) => w.id === id);
  }

  updateWindow(id: string, updates: Partial<WindowState>): void {
    this._windows.update((wins) => wins.map((w) => (w.id === id ? { ...w, ...updates } : w)));
  }
}
