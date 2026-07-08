import { TestBed } from '@angular/core/testing';
import { WindowManagerService, WindowState } from './window-manager.service';

describe('WindowManagerService', () => {
  let service: WindowManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('openWindow', () => {
    it('should add a window state to the tracked windows', () => {
      expect(service.windows().length).toBe(0);

      service.openWindow({ appId: 'terminal', title: 'Terminal' });

      expect(service.windows().length).toBe(1);
      expect(service.windows()[0].appId).toBe('terminal');
      expect(service.windows()[0].title).toBe('Terminal');
    });

    it('should assign a unique id to each window', () => {
      service.openWindow({ appId: 'terminal', title: 'Terminal' });
      service.openWindow({ appId: 'about', title: 'About' });

      const ids = service.windows().map((w) => w.id);
      expect(new Set(ids).size).toBe(2);
    });

    it('should give a second window a higher z-index than the first', () => {
      service.openWindow({ appId: 'terminal', title: 'Terminal' });
      service.openWindow({ appId: 'about', title: 'About' });

      const windows = service.windows();
      expect(windows[1].zIndex).toBeGreaterThan(windows[0].zIndex);
    });

    it('should focus the newly opened window', () => {
      const id = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      expect(service.focusedWindowId()).toBe(id);
    });
  });

  describe('closeWindow', () => {
    it('should remove the window from tracked windows', () => {
      const id = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      expect(service.windows().length).toBe(1);

      service.closeWindow(id);
      expect(service.windows().length).toBe(0);
    });

    it('should clear focusedWindowId if the closed window was focused', () => {
      const id = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      expect(service.focusedWindowId()).toBe(id);

      service.closeWindow(id);
      expect(service.focusedWindowId()).toBeNull();
    });
  });

  describe('focusWindow', () => {
    it('should set the focused window ID', () => {
      const id1 = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      const id2 = service.openWindow({ appId: 'about', title: 'About' });

      // id2 is focused after open
      expect(service.focusedWindowId()).toBe(id2);

      service.focusWindow(id1);
      expect(service.focusedWindowId()).toBe(id1);
    });

    it('should give the focused window the highest z-index', () => {
      const id1 = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      const id2 = service.openWindow({ appId: 'about', title: 'About' });

      // id2 should have highest z-index after opening
      service.focusWindow(id1);

      const win1 = service.getWindow(id1);
      const win2 = service.getWindow(id2);
      expect(win1!.zIndex).toBeGreaterThan(win2!.zIndex);
    });

    it('should reorder z-indices so the focused window is on top', () => {
      const id1 = service.openWindow({ appId: 'a', title: 'A' });
      const id2 = service.openWindow({ appId: 'b', title: 'B' });
      const id3 = service.openWindow({ appId: 'c', title: 'C' });

      // Focus the first window
      service.focusWindow(id1);

      const win1 = service.getWindow(id1)!;
      const win2 = service.getWindow(id2)!;
      const win3 = service.getWindow(id3)!;

      expect(win1.zIndex).toBeGreaterThan(win2.zIndex);
      expect(win1.zIndex).toBeGreaterThan(win3.zIndex);
    });
  });

  describe('minimizeWindow', () => {
    it('should set the minimized flag to true', () => {
      const id = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      expect(service.getWindow(id)!.minimized).toBe(false);

      service.minimizeWindow(id);
      expect(service.getWindow(id)!.minimized).toBe(true);
    });

    it('should clear focusedWindowId if the minimized window was focused', () => {
      const id = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      service.minimizeWindow(id);
      expect(service.focusedWindowId()).toBeNull();
    });
  });

  describe('maximizeWindow', () => {
    it('should toggle the maximized flag', () => {
      const id = service.openWindow({ appId: 'terminal', title: 'Terminal' });
      expect(service.getWindow(id)!.maximized).toBe(false);

      service.maximizeWindow(id);
      expect(service.getWindow(id)!.maximized).toBe(true);

      service.maximizeWindow(id);
      expect(service.getWindow(id)!.maximized).toBe(false);
    });
  });

  describe('getWindow', () => {
    it('should return the window state for a given ID', () => {
      const id = service.openWindow({ appId: 'terminal', title: 'Terminal', width: 800 });
      const win = service.getWindow(id);

      expect(win).toBeTruthy();
      expect(win!.appId).toBe('terminal');
      expect(win!.width).toBe(800);
    });

    it('should return undefined for a non-existent ID', () => {
      expect(service.getWindow('nonexistent')).toBeUndefined();
    });
  });

  describe('windows signal', () => {
    it('should be read-only externally (computed)', () => {
      const windows = service.windows;
      // Computed signals don't have a .set method
      expect((windows as any).set).toBeUndefined();
      expect((windows as any).update).toBeUndefined();
    });
  });
});
