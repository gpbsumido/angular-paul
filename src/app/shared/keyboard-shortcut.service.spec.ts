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

  function fireKeydown(key: string, code: string, meta = true): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key,
      code,
      metaKey: meta,
      bubbles: true,
    });
    return event;
  }

  describe('Cmd+W closes active window', () => {
    it('should call WindowManagerService.closeWindow() for the active window', () => {
      const windowId = launcher.launch('about')!;
      const spy = vi.spyOn(windowManager, 'closeWindow');

      const event = fireKeydown('w', 'KeyW');
      service.handleKeydown(event);

      expect(spy).toHaveBeenCalledWith(windowId);
    });
  });

  describe('Cmd+Q quits active app', () => {
    it('should close all windows for the active app', () => {
      launcher.launch('about');
      launcher.launch('about');
      expect(launcher.launchedWindows().length).toBe(2);

      const event = fireKeydown('q', 'KeyQ');
      service.handleKeydown(event);

      expect(launcher.launchedWindows().length).toBe(0);
    });
  });

  describe('Cmd+H minimizes active window', () => {
    it('should call WindowManagerService.minimizeWindow() for the active window', () => {
      const windowId = launcher.launch('about')!;
      const spy = vi.spyOn(windowManager, 'minimizeWindow');

      const event = fireKeydown('h', 'KeyH');
      service.handleKeydown(event);

      expect(spy).toHaveBeenCalledWith(windowId);
    });
  });

  describe('Cmd+Space toggles Spotlight', () => {
    it('should toggle the spotlight signal', () => {
      expect(service.spotlightOpen()).toBe(false);

      const event = fireKeydown(' ', 'Space');
      service.handleKeydown(event);

      expect(service.spotlightOpen()).toBe(true);

      service.handleKeydown(event);
      expect(service.spotlightOpen()).toBe(false);
    });
  });

  describe('Cmd+Tab cycles focus', () => {
    it('should cycle focus to the next running app', () => {
      launcher.register({
        appId: 'terminal',
        title: 'Terminal',
        icon: '⬛',
        component: MockComponent,
      });

      const win1 = launcher.launch('about')!;
      const win2 = launcher.launch('terminal')!;

      // about launched first, terminal second — terminal is focused
      expect(windowManager.focusedWindowId()).toBe(win2);

      const event = fireKeydown('Tab', 'Tab');
      service.handleKeydown(event);

      // Should cycle back to about
      expect(windowManager.focusedWindowId()).toBe(win1);
    });
  });

  describe('safety when no windows are open', () => {
    it('should not throw when Cmd+W is pressed with no windows', () => {
      const event = fireKeydown('w', 'KeyW');
      expect(() => service.handleKeydown(event)).not.toThrow();
    });

    it('should not throw when Cmd+Q is pressed with no windows', () => {
      const event = fireKeydown('q', 'KeyQ');
      expect(() => service.handleKeydown(event)).not.toThrow();
    });

    it('should not throw when Cmd+H is pressed with no windows', () => {
      const event = fireKeydown('h', 'KeyH');
      expect(() => service.handleKeydown(event)).not.toThrow();
    });
  });

  describe('input focus guard', () => {
    it('should not fire shortcuts when a text input is focused', () => {
      const windowId = launcher.launch('about')!;
      const spy = vi.spyOn(windowManager, 'closeWindow');

      const event = new KeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
        metaKey: true,
        bubbles: true,
      });

      // Simulate event coming from an input element
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      service.handleKeydown(event, input);

      expect(spy).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('should not fire shortcuts when a textarea is focused', () => {
      const windowId = launcher.launch('about')!;
      const spy = vi.spyOn(windowManager, 'closeWindow');

      const event = new KeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
        metaKey: true,
        bubbles: true,
      });

      const textarea = document.createElement('textarea');
      service.handleKeydown(event, textarea);

      expect(spy).not.toHaveBeenCalled();
    });
  });
});
