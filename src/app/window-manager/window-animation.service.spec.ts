import { TestBed } from '@angular/core/testing';
import { WindowAnimationService, AnimationConfig } from './window-animation.service';
import { WindowManagerService } from './window-manager.service';

describe('WindowAnimationService', () => {
  let service: WindowAnimationService;
  let windowManager: WindowManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WindowAnimationService);
    windowManager = TestBed.inject(WindowManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOpenAnimation', () => {
    it('should return a scale-up animation config when a window opens', () => {
      const windowId = windowManager.openWindow({
        appId: 'about',
        title: 'About',
      });

      const config = service.getOpenAnimation(windowId, true);
      expect(config).toBeTruthy();
      expect(config.type).toBe('open');
      expect(config.transform).toContain('scale');
      expect(config.opacity).toBeDefined();
      expect(config.duration).toBeGreaterThan(0);
    });
  });

  describe('getCloseAnimation', () => {
    it('should return a fade/scale-out animation config', () => {
      const windowId = windowManager.openWindow({
        appId: 'about',
        title: 'About',
      });

      const config = service.getCloseAnimation(windowId, true);
      expect(config).toBeTruthy();
      expect(config.type).toBe('close');
      expect(config.transform).toContain('scale');
      expect(config.opacity).toBe(0);
      expect(config.duration).toBeGreaterThan(0);
    });
  });

  describe('getMinimizeAnimation', () => {
    it('should return a shrink-to-dock config with a target position', () => {
      const windowId = windowManager.openWindow({
        appId: 'about',
        title: 'About',
      });

      const config = service.getMinimizeAnimation(windowId, { x: 300, y: 700 }, true);
      expect(config).toBeTruthy();
      expect(config.type).toBe('minimize');
      expect(config.transform).toContain('scale');
      expect(config.targetX).toBe(300);
      expect(config.targetY).toBe(700);
      expect(config.duration).toBeGreaterThan(0);
    });
  });

  describe('graceful fallback', () => {
    it('should return a no-op config when View Transitions API is not supported', () => {
      const windowId = windowManager.openWindow({
        appId: 'about',
        title: 'About',
      });

      // Simulate no View Transitions support
      const config = service.getOpenAnimation(windowId, false);
      expect(config).toBeTruthy();
      expect(config.type).toBe('none');
      expect(config.duration).toBe(0);
    });

    it('should return a no-op close config when View Transitions API is not supported', () => {
      const windowId = windowManager.openWindow({
        appId: 'about',
        title: 'About',
      });

      const config = service.getCloseAnimation(windowId, false);
      expect(config.type).toBe('none');
      expect(config.duration).toBe(0);
    });

    it('should return a no-op minimize config when View Transitions API is not supported', () => {
      const windowId = windowManager.openWindow({
        appId: 'about',
        title: 'About',
      });

      const config = service.getMinimizeAnimation(windowId, { x: 300, y: 700 }, false);
      expect(config.type).toBe('none');
      expect(config.duration).toBe(0);
    });
  });
});
