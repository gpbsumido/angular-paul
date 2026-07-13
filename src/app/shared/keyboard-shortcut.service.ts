import { inject, Injectable, signal } from '@angular/core';
import { WindowManagerService } from '../window-manager/window-manager.service';
import { AppLauncherService } from './app-launcher.service';

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutService {
  private windowManager = inject(WindowManagerService);
  private launcher = inject(AppLauncherService);

  readonly spotlightOpen = signal(false);

  handleKeydown(event: KeyboardEvent, target?: Element): void {
    if (!event.metaKey) return;

    const activeElement = target ?? document.activeElement;
    if (activeElement && INPUT_TAGS.has(activeElement.tagName)) {
      return;
    }

    switch (event.code) {
      case 'KeyW':
        this.closeActiveWindow();
        break;
      case 'KeyQ':
        this.quitActiveApp();
        break;
      case 'KeyH':
        this.minimizeActiveWindow();
        break;
      case 'Space':
        this.spotlightOpen.update((open) => !open);
        break;
      case 'Tab':
        this.cycleFocus();
        break;
    }
  }

  private closeActiveWindow(): void {
    const focusedId = this.windowManager.focusedWindowId();
    if (!focusedId) return;
    this.windowManager.closeWindow(focusedId);
    this.launcher.closeLaunchedWindow(focusedId);
  }

  private quitActiveApp(): void {
    const focusedId = this.windowManager.focusedWindowId();
    if (!focusedId) return;

    const win = this.windowManager.getWindow(focusedId);
    if (!win) return;

    const appId = win.appId;
    const toClose = this.launcher
      .launchedWindows()
      .filter((w) => w.appId === appId)
      .map((w) => w.windowId);

    for (const id of toClose) {
      this.launcher.closeLaunchedWindow(id);
    }
  }

  private minimizeActiveWindow(): void {
    const focusedId = this.windowManager.focusedWindowId();
    if (!focusedId) return;
    this.windowManager.minimizeWindow(focusedId);
  }

  private cycleFocus(): void {
    const windows = this.windowManager.windows();
    if (windows.length < 2) return;

    const focusedId = this.windowManager.focusedWindowId();
    const currentIndex = windows.findIndex((w) => w.id === focusedId);
    const nextIndex = (currentIndex + 1) % windows.length;
    this.windowManager.focusWindow(windows[nextIndex].id);
  }
}
