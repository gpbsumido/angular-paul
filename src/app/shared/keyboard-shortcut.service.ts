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
    // ⌘ chords are reserved by macOS/the browser (⌘W closes the real tab,
    // ⌘Space is real Spotlight) and mostly aren't preventable, so the desktop
    // listens on ⌃⌥ instead — the VM convention for guest-OS chords.
    if (!event.ctrlKey || !event.altKey || event.metaKey) return;

    const activeElement = target ?? document.activeElement;
    if (activeElement && INPUT_TAGS.has(activeElement.tagName)) {
      return;
    }

    switch (event.code) {
      case 'KeyW':
        event.preventDefault();
        this.closeActiveWindow();
        break;
      case 'KeyQ':
        event.preventDefault();
        this.quitActiveApp();
        break;
      case 'KeyH':
        event.preventDefault();
        this.minimizeActiveWindow();
        break;
      case 'Space':
        event.preventDefault();
        this.spotlightOpen.update((open) => !open);
        break;
      case 'Tab':
        event.preventDefault();
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
