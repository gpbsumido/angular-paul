import { inject, Injectable, signal, Type } from '@angular/core';
import { THOUGHTS } from '../thoughts-content/thoughts-data';
import { WindowManagerService } from '../window-manager/window-manager.service';

export interface AppRegistration {
  appId: string;
  title: string;
  icon: string;
  component?: Type<unknown>;
  loader?: () => Promise<unknown>;
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
  private componentCache = new Map<string, Type<unknown>>();
  private readonly _launchedWindows = signal<LaunchedWindow[]>([]);

  readonly launchedWindows = this._launchedWindows.asReadonly();

  register(registration: AppRegistration): void {
    this.registry.set(registration.appId, registration);
    if (registration.component) {
      this.componentCache.set(registration.appId, registration.component);
    }
  }

  registerLazy(config: {
    appId: string;
    title: string;
    icon: string;
    loader?: () => Promise<unknown>;
    defaultWidth?: number;
    defaultHeight?: number;
  }): void {
    this.registry.set(config.appId, {
      appId: config.appId,
      title: config.title,
      icon: config.icon,
      loader: config.loader,
      defaultWidth: config.defaultWidth,
      defaultHeight: config.defaultHeight,
    });
  }

  getRegistration(appId: string): AppRegistration | undefined {
    return this.registry.get(appId);
  }

  private async resolveComponent(appId: string): Promise<Type<unknown> | null> {
    const cached = this.componentCache.get(appId);
    if (cached) return cached;

    const reg = this.registry.get(appId);
    if (!reg) return null;

    if (reg.component) {
      this.componentCache.set(appId, reg.component);
      return reg.component;
    }

    if (reg.loader) {
      const component = (await reg.loader()) as Type<unknown>;
      this.componentCache.set(appId, component);
      return component;
    }

    return null;
  }

  async launch(appId: string): Promise<string | null> {
    const registration = this.registry.get(appId);
    if (!registration) return null;

    const component = await this.resolveComponent(appId);
    if (!component) return null;

    const windowId = this.windowManager.openWindow({
      appId: registration.appId,
      title: registration.title,
      width: registration.defaultWidth,
      height: registration.defaultHeight,
    });

    this._launchedWindows.update((windows) => [
      ...windows,
      { windowId, appId: registration.appId, component },
    ]);

    return windowId;
  }

  async openThought(slug: string): Promise<string | null> {
    const entry = THOUGHTS.find((t) => t.slug === slug);
    if (!entry) return null;

    const component = await this.resolveComponent('thoughts');
    if (!component) return null;

    const windowId = this.windowManager.openWindow({
      appId: 'thoughts',
      title: entry.title,
    });

    this._launchedWindows.update((windows) => [
      ...windows,
      { windowId, appId: 'thoughts', component },
    ]);

    return windowId;
  }

  closeLaunchedWindow(windowId: string): void {
    this.windowManager.closeWindow(windowId);
    this._launchedWindows.update((windows) => windows.filter((w) => w.windowId !== windowId));
  }
}
