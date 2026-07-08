import { NgComponentOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Desktop } from './desktop/desktop';
import { Dock } from './dock/dock';
import { MenuBar } from './menu-bar/menu-bar';
import { AppLauncherService } from './shared/app-launcher.service';
import { DockService } from './shared/dock.service';
import { Window } from './window-manager/window';
import { WindowManagerService } from './window-manager/window-manager.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Desktop, MenuBar, Dock, Window, NgComponentOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly launcher = inject(AppLauncherService);
  protected readonly windowManager = inject(WindowManagerService);
  private readonly dockService = inject(DockService);

  onWindowClosed(windowId: string, appId: string): void {
    this.launcher.closeLaunchedWindow(windowId);
    this.dockService.closeApp(appId);
  }

  onWindowMinimized(windowId: string, appId: string): void {
    this.windowManager.minimizeWindow(windowId);
    const running = this.dockService.runningApps();
    if (running.has(appId)) {
      const map = new Map(running);
      map.set(appId, 'minimized');
      this.dockService.runningApps.set(map);
    }
  }

  onWindowMaximized(windowId: string): void {
    this.windowManager.maximizeWindow(windowId);
  }

  onWindowFocused(windowId: string, appId: string): void {
    this.windowManager.focusWindow(windowId);
    this.dockService.focusApp(appId);
  }
}
