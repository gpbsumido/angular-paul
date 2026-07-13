import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppLauncherService, AppRegistration } from './app-launcher.service';
import { WindowManagerService } from '../window-manager/window-manager.service';

@Component({ selector: 'app-mock-terminal', template: 'terminal' })
class MockTerminalComponent {}

@Component({ selector: 'app-mock-about', template: 'about' })
class MockAboutComponent {}

describe('AppLauncherService', () => {
  let service: AppLauncherService;
  let windowManager: WindowManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppLauncherService);
    windowManager = TestBed.inject(WindowManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('registry', () => {
    it('should have a registry mapping app IDs to component types', () => {
      service.register({
        appId: 'terminal',
        title: 'Terminal',
        icon: '⬛',
        component: MockTerminalComponent,
      });

      const registration = service.getRegistration('terminal');
      expect(registration).toBeTruthy();
      expect(registration!.component).toBe(MockTerminalComponent);
    });

    it('should store metadata (title, icon) in the registration', () => {
      service.register({
        appId: 'terminal',
        title: 'Terminal',
        icon: '⬛',
        component: MockTerminalComponent,
      });

      const reg = service.getRegistration('terminal');
      expect(reg!.title).toBe('Terminal');
      expect(reg!.icon).toBe('⬛');
    });
  });

  describe('launch', () => {
    beforeEach(() => {
      service.register({
        appId: 'terminal',
        title: 'Terminal',
        icon: '⬛',
        component: MockTerminalComponent,
      });
      service.register({
        appId: 'about',
        title: 'About',
        icon: '👤',
        component: MockAboutComponent,
      });
    });

    it('should create a new window via WindowManagerService and return the window ID', async () => {
      const windowId = await service.launch('terminal');
      expect(windowId).toBeTruthy();

      const win = windowManager.getWindow(windowId!);
      expect(win).toBeTruthy();
      expect(win!.appId).toBe('terminal');
    });

    it('should pass the correct title from app metadata to the window', async () => {
      const windowId = await service.launch('terminal');
      const win = windowManager.getWindow(windowId!);
      expect(win!.title).toBe('Terminal');
    });

    it('should launch the same app twice creating two separate window instances', async () => {
      const id1 = await service.launch('terminal');
      const id2 = await service.launch('terminal');

      expect(id1).not.toBe(id2);
      expect(windowManager.windows().length).toBe(2);
      expect(windowManager.windows().every((w) => w.appId === 'terminal')).toBe(true);
    });

    it('should pass the correct component type for the given app ID', async () => {
      await service.launch('terminal');
      await service.launch('about');

      const launchedApps = service.launchedWindows();
      const terminalEntry = launchedApps.find((l) => l.appId === 'terminal');
      const aboutEntry = launchedApps.find((l) => l.appId === 'about');

      expect(terminalEntry!.component).toBe(MockTerminalComponent);
      expect(aboutEntry!.component).toBe(MockAboutComponent);
    });

    it('should return null when launching an unknown app ID', async () => {
      const result = await service.launch('nonexistent');
      expect(result).toBeNull();
    });

    it('should not create a window when launching an unknown app ID', async () => {
      await service.launch('nonexistent');
      expect(windowManager.windows().length).toBe(0);
    });

    it('should track launched windows with their component types', async () => {
      expect(service.launchedWindows().length).toBe(0);

      await service.launch('terminal');
      expect(service.launchedWindows().length).toBe(1);
      expect(service.launchedWindows()[0].appId).toBe('terminal');
    });

    it('should remove from launched windows when the window is closed', async () => {
      const windowId = (await service.launch('terminal'))!;
      expect(service.launchedWindows().length).toBe(1);

      service.closeLaunchedWindow(windowId);
      expect(service.launchedWindows().length).toBe(0);
    });
  });

  describe('openThought', () => {
    beforeEach(() => {
      service.register({
        appId: 'thoughts',
        title: 'Thoughts',
        icon: '💭',
        component: MockTerminalComponent,
      });
    });

    it('should launch a thoughts window navigated to the given slug', async () => {
      const windowId = await service.openThought('signals');
      expect(windowId).toBeTruthy();

      const win = windowManager.getWindow(windowId!);
      expect(win).toBeTruthy();
      expect(win!.appId).toBe('thoughts');
    });

    it('should set the window title to the thought entry title', async () => {
      const windowId = await service.openThought('signals');
      const win = windowManager.getWindow(windowId!);
      expect(win!.title).toContain('Signals');
    });

    it('should return null for an unknown slug', async () => {
      const result = await service.openThought('nonexistent-slug');
      expect(result).toBeNull();
    });
  });
});
