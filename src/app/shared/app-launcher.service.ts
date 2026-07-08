import { inject, Injectable, signal, Type } from '@angular/core';
import { WindowManagerService } from '../window-manager/window-manager.service';

export interface AppRegistration {
  appId: string;
  title: string;
  icon: string;
  component: Type<unknown>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface LaunchedWindow {
  windowId: string;
  appId: string;
  component: Type<unknown>;
}

@Injectable({ providedIn: 'root' })
export class AppLauncherService {
  private windowManager = inject(WindowManagerService);
  private registry = new Map<string, AppRegistration>();
  private readonly _launchedWindows = signal<LaunchedWindow[]>([]);

  readonly launchedWindows = this._launchedWindows.asReadonly();

  register(registration: AppRegistration): void {
    this.registry.set(registration.appId, registration);
  }

  getRegistration(appId: string): AppRegistration | undefined {
    return this.registry.get(appId);
  }

  launch(appId: string): string | null {
    const registration = this.registry.get(appId);
    if (!registration) {
      return null;
    }

    const windowId = this.windowManager.openWindow({
      appId: registration.appId,
      title: registration.title,
      width: registration.defaultWidth,
      height: registration.defaultHeight,
    });

    this._launchedWindows.update((windows) => [
      ...windows,
      {
        windowId,
        appId: registration.appId,
        component: registration.component,
      },
    ]);

    return windowId;
  }

  closeLaunchedWindow(windowId: string): void {
    this.windowManager.closeWindow(windowId);
    this._launchedWindows.update((windows) => windows.filter((w) => w.windowId !== windowId));
  }
}
