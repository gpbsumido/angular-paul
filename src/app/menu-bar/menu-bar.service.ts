import { computed, inject, Injectable } from '@angular/core';
import { AppLauncherService } from '../shared/app-launcher.service';
import { DockService } from '../shared/dock.service';
import { KeyboardShortcutService } from '../shared/keyboard-shortcut.service';
import { WindowManagerService } from '../window-manager/window-manager.service';

export interface MenuBarItem {
  id: string;
  label?: string;
  type?: 'item' | 'separator';
  disabled?: boolean;
  shortcut?: string;
}

export interface MenuBarMenu {
  id: string;
  label: string;
  isApple?: boolean;
  items: MenuBarItem[];
}

const SEPARATOR = (id: string): MenuBarItem => ({ id, type: 'separator' });

@Injectable({ providedIn: 'root' })
export class MenuBarService {
  private readonly windowManager = inject(WindowManagerService);
  private readonly dock = inject(DockService);
  private readonly launcher = inject(AppLauncherService);
  private readonly shortcuts = inject(KeyboardShortcutService);

  /** Name shown in the menu bar — the frontmost app, falling back to Finder. */
  readonly activeAppName = computed(() => {
    const win = this.activeWindow();
    if (win) {
      const app = this.dock.pinnedApps().find((a) => a.id === win.appId);
      if (app) return app.label;
      return win.title;
    }
    return 'Finder';
  });

  /** The full macOS menu-bar model, derived from window and dock state. */
  readonly menus = computed<MenuBarMenu[]>(() => {
    const appName = this.activeAppName();
    const windows = this.windowManager.windows();
    const hasWindow = this.windowManager.focusedWindowId() !== null;

    const windowItems: MenuBarItem[] = [
      { id: 'minimize', label: 'Minimize', shortcut: '⌘H', disabled: !hasWindow },
      { id: 'zoom', label: 'Zoom', disabled: !hasWindow },
      { id: 'cycle', label: 'Cycle Through Windows', shortcut: '⌘Tab', disabled: windows.length < 2 },
    ];
    if (windows.length > 0) {
      windowItems.push(SEPARATOR('window-sep'));
      for (const w of windows) {
        windowItems.push({ id: `focus:${w.id}`, label: w.title });
      }
    }

    return [
      {
        id: 'apple',
        label: '',
        isApple: true,
        items: [
          { id: 'about-mac', label: 'About This Mac' },
          SEPARATOR('apple-sep-1'),
          { id: 'system-preferences', label: 'System Preferences…' },
          SEPARATOR('apple-sep-2'),
          { id: 'sleep', label: 'Sleep', disabled: true },
          { id: 'restart', label: 'Restart…', disabled: true },
          { id: 'shut-down', label: 'Shut Down…', disabled: true },
          SEPARATOR('apple-sep-3'),
          { id: 'lock-screen', label: 'Lock Screen', shortcut: '⌃⌘Q', disabled: true },
        ],
      },
      {
        id: 'app',
        label: appName,
        items: [
          { id: 'about-app', label: `About ${appName}` },
          SEPARATOR('app-sep-1'),
          { id: 'system-preferences', label: 'Preferences…', shortcut: '⌘,' },
          SEPARATOR('app-sep-2'),
          { id: 'minimize', label: `Hide ${appName}`, shortcut: '⌘H', disabled: !hasWindow },
          { id: 'quit', label: `Quit ${appName}`, shortcut: '⌘Q', disabled: !hasWindow },
        ],
      },
      {
        id: 'file',
        label: 'File',
        items: [
          { id: 'new-window', label: 'New Window', shortcut: '⌘N', disabled: !hasWindow },
          SEPARATOR('file-sep-1'),
          { id: 'close-window', label: 'Close Window', shortcut: '⌘W', disabled: !hasWindow },
        ],
      },
      {
        id: 'edit',
        label: 'Edit',
        items: [
          { id: 'undo', label: 'Undo', shortcut: '⌘Z', disabled: true },
          { id: 'redo', label: 'Redo', shortcut: '⇧⌘Z', disabled: true },
          SEPARATOR('edit-sep-1'),
          { id: 'cut', label: 'Cut', shortcut: '⌘X', disabled: true },
          { id: 'copy', label: 'Copy', shortcut: '⌘C', disabled: true },
          { id: 'paste', label: 'Paste', shortcut: '⌘V', disabled: true },
          SEPARATOR('edit-sep-2'),
          { id: 'select-all', label: 'Select All', shortcut: '⌘A', disabled: true },
        ],
      },
      {
        id: 'view',
        label: 'View',
        items: [
          { id: 'zoom', label: 'Enter Full Screen', shortcut: '⌃⌘F', disabled: !hasWindow },
        ],
      },
      {
        id: 'window',
        label: 'Window',
        items: windowItems,
      },
      {
        id: 'help',
        label: 'Help',
        items: [
          { id: 'spotlight', label: 'Search…', shortcut: '⌘Space' },
          SEPARATOR('help-sep-1'),
          { id: 'open-readme', label: 'angular-paul Help' },
        ],
      },
    ];
  });

  execute(id: string): void {
    if (id.startsWith('focus:')) {
      this.windowManager.focusWindow(id.slice('focus:'.length));
      return;
    }

    switch (id) {
      case 'about-mac':
      case 'about-app':
        this.openApp('about');
        break;
      case 'system-preferences':
        this.openApp('settings');
        break;
      case 'open-readme':
        this.openApp('readme');
        break;
      case 'spotlight':
        this.shortcuts.spotlightOpen.set(true);
        break;
      case 'new-window':
        this.newWindowForActiveApp();
        break;
      case 'close-window':
        this.closeActiveWindow();
        break;
      case 'minimize':
        this.minimizeActiveWindow();
        break;
      case 'zoom':
        this.zoomActiveWindow();
        break;
      case 'quit':
        this.quitActiveApp();
        break;
      case 'cycle':
        this.cycleWindows();
        break;
    }
  }

  private activeWindow() {
    const id = this.windowManager.focusedWindowId();
    return id ? this.windowManager.getWindow(id) : undefined;
  }

  private openApp(appId: string): void {
    this.launcher.launch(appId);
    const app = this.dock.pinnedApps().find((a) => a.id === appId);
    if (app) this.dock.launchApp(app);
  }

  private newWindowForActiveApp(): void {
    const win = this.activeWindow();
    if (win) this.launcher.launch(win.appId);
  }

  private closeActiveWindow(): void {
    const win = this.activeWindow();
    if (!win) return;
    const appId = win.appId;
    this.launcher.closeLaunchedWindow(win.id);
    if (!this.launcher.launchedWindows().some((w) => w.appId === appId)) {
      this.dock.closeApp(appId);
    }
  }

  private minimizeActiveWindow(): void {
    const win = this.activeWindow();
    if (!win) return;
    this.windowManager.minimizeWindow(win.id);
    const running = this.dock.runningApps();
    if (running.has(win.appId)) {
      const map = new Map(running);
      map.set(win.appId, 'minimized');
      this.dock.runningApps.set(map);
    }
  }

  private zoomActiveWindow(): void {
    const win = this.activeWindow();
    if (win) this.windowManager.maximizeWindow(win.id);
  }

  private quitActiveApp(): void {
    const win = this.activeWindow();
    if (!win) return;
    const appId = win.appId;
    const ids = this.launcher
      .launchedWindows()
      .filter((w) => w.appId === appId)
      .map((w) => w.windowId);
    for (const id of ids) {
      this.launcher.closeLaunchedWindow(id);
    }
    this.dock.closeApp(appId);
  }

  private cycleWindows(): void {
    const windows = this.windowManager.windows();
    if (windows.length < 2) return;
    const focusedId = this.windowManager.focusedWindowId();
    const idx = windows.findIndex((w) => w.id === focusedId);
    const next = (idx + 1) % windows.length;
    this.windowManager.focusWindow(windows[next].id);
  }
}
