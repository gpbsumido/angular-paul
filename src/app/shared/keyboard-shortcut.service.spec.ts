import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { KeyboardShortcutService } from './keyboard-shortcut.service';
import { WindowManagerService } from '../window-manager/window-manager.service';
import { AppLauncherService } from './app-launcher.service';
import { DockService } from './dock.service';
import { Component } from '@angular/core';

@Component({ selector: 'app-mock', template: 'mock' })
class MockComponent {}

describe('KeyboardShortcutService', () => {
  let service: KeyboardShortcutService;
  let windowManager: WindowManagerService;
  let launcher: AppLauncherService;
  let dockService: DockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KeyboardShortcutService);
    windowManager = TestBed.inject(WindowManagerService);
    launcher = TestBed.inject(AppLauncherService);
    dockService = TestBed.inject(DockService);

    // Register and launch an app so there's an active window
    launcher.register({
      appId: 'about',
      title: 'About',
      icon: '👤',
      component: MockComponent,
    });
  });

  /** Fire a ⌃⌥ chord — the modifier the desktop shortcuts listen for. */
  function fireChord(key: string, code: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key,
      code,
      ctrlKey: true,
      altKey: true,
      bubbles: true,
      cancelable: true,
    });
    return event;
  }

  /** Fire a ⌘ chord — reserved by macOS/the browser, must be left alone. */
  function fireMetaChord(key: string, code: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key,
      code,
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    return event;
  }

  describe('⌃⌥W closes active window', () => {
    it('should call WindowManagerService.closeWindow() for the active window', async () => {
      const windowId = (await launcher.launch('about'))!;
      const spy = vi.spyOn(windowManager, 'closeWindow');

      const event = fireChord('w', 'KeyW');
      service.handleKeydown(event);

      expect(spy).toHaveBeenCalledWith(windowId);
    });
  });

  describe('⌃⌥Q quits active app', () => {
    it('should close all windows for the active app', async () => {
      await launcher.launch('about');
      await launcher.launch('about');
      expect(launcher.launchedWindows().length).toBe(2);

      const event = fireChord('q', 'KeyQ');
      service.handleKeydown(event);

      expect(launcher.launchedWindows().length).toBe(0);
    });
  });

  describe('⌃⌥H minimizes active window', () => {
    it('should call WindowManagerService.minimizeWindow() for the active window', async () => {
      const windowId = (await launcher.launch('about'))!;
      const spy = vi.spyOn(windowManager, 'minimizeWindow');

      const event = fireChord('h', 'KeyH');
      service.handleKeydown(event);

      expect(spy).toHaveBeenCalledWith(windowId);
    });
  });

  describe('⌃⌥Space toggles Spotlight', () => {
    it('should toggle the spotlight signal', () => {
      expect(service.spotlightOpen()).toBe(false);

      const event = fireChord(' ', 'Space');
      service.handleKeydown(event);

      expect(service.spotlightOpen()).toBe(true);

      service.handleKeydown(fireChord(' ', 'Space'));
      expect(service.spotlightOpen()).toBe(false);
    });
  });

  describe('⌃⌥Tab cycles focus', () => {
    it('should cycle focus to the next running app', async () => {
      launcher.register({
        appId: 'terminal',
        title: 'Terminal',
        icon: '⬛',
        component: MockComponent,
      });

      const win1 = (await launcher.launch('about'))!;
      const win2 = (await launcher.launch('terminal'))!;

      // about launched first, terminal second — terminal is focused
      expect(windowManager.focusedWindowId()).toBe(win2);

      const event = fireChord('Tab', 'Tab');
      service.handleKeydown(event);

      // Should cycle back to about
      expect(windowManager.focusedWindowId()).toBe(win1);
    });
  });

  describe('reserved ⌘ chords are left to the OS/browser', () => {
    it('should ignore ⌘W — the browser owns it and would close the real tab', async () => {
      await launcher.launch('about');
      const spy = vi.spyOn(windowManager, 'closeWindow');

      service.handleKeydown(fireMetaChord('w', 'KeyW'));

      expect(spy).not.toHaveBeenCalled();
    });

    it('should ignore ⌘H and ⌘Space', async () => {
      await launcher.launch('about');
      const minimizeSpy = vi.spyOn(windowManager, 'minimizeWindow');

      service.handleKeydown(fireMetaChord('h', 'KeyH'));
      service.handleKeydown(fireMetaChord(' ', 'Space'));

      expect(minimizeSpy).not.toHaveBeenCalled();
      expect(service.spotlightOpen()).toBe(false);
    });

    it('should not preventDefault on ⌘ chords', async () => {
      await launcher.launch('about');
      const event = fireMetaChord('w', 'KeyW');

      service.handleKeydown(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('handled chords are consumed', () => {
    it('should preventDefault on ⌃⌥W', async () => {
      await launcher.launch('about');
      const event = fireChord('w', 'KeyW');

      service.handleKeydown(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('should preventDefault on ⌃⌥Space', () => {
      const event = fireChord(' ', 'Space');

      service.handleKeydown(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('should not preventDefault on an unhandled ⌃⌥ chord', () => {
      const event = fireChord('z', 'KeyZ');

      service.handleKeydown(event);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('safety when no windows are open', () => {
    it('should not throw when ⌃⌥W is pressed with no windows', () => {
      const event = fireChord('w', 'KeyW');
      expect(() => service.handleKeydown(event)).not.toThrow();
    });

    it('should not throw when ⌃⌥Q is pressed with no windows', () => {
      const event = fireChord('q', 'KeyQ');
      expect(() => service.handleKeydown(event)).not.toThrow();
    });

    it('should not throw when ⌃⌥H is pressed with no windows', () => {
      const event = fireChord('h', 'KeyH');
      expect(() => service.handleKeydown(event)).not.toThrow();
    });
  });

  describe('input focus guard', () => {
    it('should not fire shortcuts when a text input is focused', async () => {
      await launcher.launch('about');
      const spy = vi.spyOn(windowManager, 'closeWindow');

      const event = fireChord('w', 'KeyW');

      // Simulate event coming from an input element
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      service.handleKeydown(event, input);

      expect(spy).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('should not fire shortcuts when a textarea is focused', async () => {
      await launcher.launch('about');
      const spy = vi.spyOn(windowManager, 'closeWindow');

      const event = fireChord('w', 'KeyW');
      const textarea = document.createElement('textarea');
      service.handleKeydown(event, textarea);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
