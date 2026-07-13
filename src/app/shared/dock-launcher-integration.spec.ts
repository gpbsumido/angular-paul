import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Dock } from '../dock/dock';
import { PlaceholderApp } from '../apps/placeholder-app';
import { AppLauncherService } from './app-launcher.service';
import { DockService } from './dock.service';
import { WindowManagerService } from '../window-manager/window-manager.service';

describe('Dock-Launcher Integration', () => {
  let fixture: ComponentFixture<Dock>;
  let nativeEl: HTMLElement;
  let launcher: AppLauncherService;
  let dockService: DockService;
  let windowManager: WindowManagerService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dock],
    }).compileComponents();

    launcher = TestBed.inject(AppLauncherService);
    dockService = TestBed.inject(DockService);
    windowManager = TestBed.inject(WindowManagerService);

    fixture = TestBed.createComponent(Dock);
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  describe('PlaceholderAppComponent', () => {
    it('should exist and render a coming soon message with the app name', () => {
      const placeholderFixture = TestBed.createComponent(PlaceholderApp);
      placeholderFixture.componentRef.setInput('appId', 'terminal');
      placeholderFixture.detectChanges();

      const text = (placeholderFixture.nativeElement as HTMLElement).textContent;
      expect(text).toContain('terminal');
      expect(text).toContain('coming soon');
    });
  });

  describe('app registration', () => {
    it('should have all dock items registered in AppLauncherService', () => {
      const pinnedApps = dockService.pinnedApps();
      for (const app of pinnedApps) {
        const reg = launcher.getRegistration(app.id);
        expect(reg).toBeTruthy();
        expect(reg!.component).toBeTruthy();
      }
    });
  });

  describe('dock click launches app', () => {
    it('should call AppLauncherService.launch() with the correct app ID when clicking a dock icon', () => {
      const spy = vi.spyOn(launcher, 'launch');
      const icons = nativeEl.querySelectorAll('.dock-items:first-child .dock-icon');
      // Click the "About" icon (index 1)
      (icons[1] as HTMLElement).click();

      expect(spy).toHaveBeenCalledWith('about');
    });

    it('should create a window in WindowManagerService when launching from dock', () => {
      const initialCount = windowManager.windows().length;
      const icons = nativeEl.querySelectorAll('.dock-items:first-child .dock-icon');
      (icons[1] as HTMLElement).click();
      fixture.detectChanges();

      expect(windowManager.windows().length).toBe(initialCount + 1);
    });

    it('should set the opened window title to match the dock item label', () => {
      const icons = nativeEl.querySelectorAll('.dock-items:first-child .dock-icon');
      // Click "About" (index 1)
      (icons[1] as HTMLElement).click();
      fixture.detectChanges();

      const windows = windowManager.windows();
      const aboutWindow = windows.find((w) => w.appId === 'about');
      expect(aboutWindow).toBeTruthy();
      expect(aboutWindow!.title).toBe('About');
    });
  });

  describe('close window integration', () => {
    it('should remove the window from WindowManagerService when closed', () => {
      // Launch an app
      const windowId = launcher.launch('about')!;
      expect(windowManager.getWindow(windowId)).toBeTruthy();

      // Close it
      launcher.closeLaunchedWindow(windowId);
      expect(windowManager.getWindow(windowId)).toBeUndefined();
    });

    it('should update DockService running indicator when window is closed', () => {
      // Launch about via the full flow (launcher + dock service)
      const aboutApp = dockService.pinnedApps().find((a) => a.id === 'about')!;
      const windowId = launcher.launch('about')!;
      dockService.launchApp(aboutApp);
      fixture.detectChanges();

      expect(dockService.isRunning('about')).toBe(true);

      // Close it via both services
      launcher.closeLaunchedWindow(windowId);
      dockService.closeApp('about');
      fixture.detectChanges();

      expect(dockService.isRunning('about')).toBe(false);
    });
  });
});
