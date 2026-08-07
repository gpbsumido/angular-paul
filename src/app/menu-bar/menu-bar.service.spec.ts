import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppLauncherService } from '../shared/app-launcher.service';
import { DockService } from '../shared/dock.service';
import { KeyboardShortcutService } from '../shared/keyboard-shortcut.service';
import { WindowManagerService } from '../window-manager/window-manager.service';
import { MenuBarService } from './menu-bar.service';

@Component({ selector: 'app-dummy', template: '' })
class DummyApp {}

/** Register an app and open a window for it, returning the window id. */
async function launchApp(
  launcher: AppLauncherService,
  appId: string,
  title = appId,
): Promise<string> {
  launcher.register({ appId, title, icon: '', component: DummyApp });
  const id = await launcher.launch(appId);
  return id!;
}

describe('MenuBarService', () => {
  let service: MenuBarService;
  let windowManager: WindowManagerService;
  let launcher: AppLauncherService;
  let dock: DockService;
  let shortcuts: KeyboardShortcutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuBarService);
    windowManager = TestBed.inject(WindowManagerService);
    launcher = TestBed.inject(AppLauncherService);
    dock = TestBed.inject(DockService);
    shortcuts = TestBed.inject(KeyboardShortcutService);
  });

  describe('activeAppName', () => {
    it('defaults to Finder when no window is focused', () => {
      expect(service.activeAppName()).toBe('Finder');
    });

    it('reflects the label of the focused window app', async () => {
      await launchApp(launcher, 'terminal');
      // The dock knows the label for pinned apps
      expect(service.activeAppName()).toBe('Terminal');
    });
  });

  describe('menus', () => {
    it('exposes the standard macOS top-level menus in order', () => {
      const ids = service.menus().map((m) => m.id);
      expect(ids).toEqual(['apple', 'app', 'file', 'edit', 'view', 'window', 'help']);
    });

    it('marks the apple menu and names the app menu after the active app', () => {
      const menus = service.menus();
      expect(menus[0].isApple).toBe(true);
      expect(menus[1].label).toBe('Finder');
    });

    it('includes About This Mac and System Preferences in the apple menu', () => {
      const apple = service.menus().find((m) => m.id === 'apple')!;
      const labels = apple.items.map((i) => i.label);
      expect(labels).toContain('About This Mac');
      expect(labels).toContain('System Preferences…');
    });

    it('disables window-scoped actions when no window is open', () => {
      const file = service.menus().find((m) => m.id === 'file')!;
      const close = file.items.find((i) => i.id === 'close-window')!;
      expect(close.disabled).toBe(true);
    });

    it('enables window-scoped actions and lists open windows once a window exists', async () => {
      await launchApp(launcher, 'terminal', 'Terminal');
      const file = service.menus().find((m) => m.id === 'file')!;
      expect(file.items.find((i) => i.id === 'close-window')!.disabled).toBeFalsy();

      const windowMenu = service.menus().find((m) => m.id === 'window')!;
      const titles = windowMenu.items.filter((i) => i.id.startsWith('focus:')).map((i) => i.label);
      expect(titles).toContain('Terminal');
    });
  });

  describe('execute', () => {
    it('closes the focused window', async () => {
      const id = await launchApp(launcher, 'terminal');
      expect(windowManager.getWindow(id)).toBeTruthy();

      service.execute('close-window');

      expect(windowManager.getWindow(id)).toBeUndefined();
      expect(launcher.launchedWindows().length).toBe(0);
    });

    it('minimizes the focused window and reflects it in the dock', async () => {
      const id = await launchApp(launcher, 'terminal');
      dock.launchApp(dock.pinnedApps().find((a) => a.id === 'terminal')!);

      service.execute('minimize');

      expect(windowManager.getWindow(id)!.minimized).toBe(true);
      expect(dock.getState('terminal')).toBe('minimized');
    });

    it('toggles maximize on zoom', async () => {
      const id = await launchApp(launcher, 'terminal');
      service.execute('zoom');
      expect(windowManager.getWindow(id)!.maximized).toBe(true);
    });

    it('focuses a specific window via focus:<id>', async () => {
      const first = await launchApp(launcher, 'terminal');
      const second = await launchApp(launcher, 'finder');
      expect(windowManager.focusedWindowId()).toBe(second);

      service.execute(`focus:${first}`);

      expect(windowManager.focusedWindowId()).toBe(first);
    });

    it('opens Spotlight from the search action', () => {
      expect(shortcuts.spotlightOpen()).toBe(false);
      service.execute('spotlight');
      expect(shortcuts.spotlightOpen()).toBe(true);
    });

    it('launches the About app for About This Mac', async () => {
      launcher.register({ appId: 'about', title: 'About', icon: '', component: DummyApp });
      service.execute('about-mac');
      await Promise.resolve();
      await Promise.resolve();
      expect(launcher.launchedWindows().some((w) => w.appId === 'about')).toBe(true);
    });

    it('ignores unknown and disabled actions without throwing', () => {
      expect(() => service.execute('does-not-exist')).not.toThrow();
      expect(() => service.execute('close-window')).not.toThrow();
    });
  });

  describe('advertised shortcuts', () => {
    it('shows ⌃⌥ hints for the five live shortcuts so the labels match the real bindings', () => {
      const items = service.menus().flatMap((m) => m.items);
      const byId = (id: string) => items.filter((i) => i.id === id && i.shortcut);

      for (const item of byId('minimize')) {
        expect(item.shortcut).toBe('⌃⌥H');
      }
      expect(byId('quit')[0].shortcut).toBe('⌃⌥Q');
      expect(byId('close-window')[0].shortcut).toBe('⌃⌥W');
      expect(byId('cycle')[0].shortcut).toBe('⌃⌥Tab');
      expect(byId('spotlight')[0].shortcut).toBe('⌃⌥Space');
    });

    it('keeps the decorative disabled items on their authentic ⌘ glyphs', () => {
      const items = service.menus().flatMap((m) => m.items);
      const shortcutOf = (id: string) => items.find((i) => i.id === id && i.shortcut)?.shortcut;

      expect(shortcutOf('copy')).toBe('⌘C');
      expect(shortcutOf('paste')).toBe('⌘V');
      expect(shortcutOf('new-window')).toBe('⌘N');
    });
  });
});
