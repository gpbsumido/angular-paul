import { NgComponentOutlet } from '@angular/common';
import { Component, HostListener, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContextMenuComponent, DEFAULT_DESKTOP_MENU_ITEMS } from './context-menu/context-menu';
import { Desktop } from './desktop/desktop';
import { DesktopIconsComponent } from './desktop-icons/desktop-icons';
import { Dock } from './dock/dock';
import { MenuBar } from './menu-bar/menu-bar';
import { AppLauncherService } from './shared/app-launcher.service';
import { DockService } from './shared/dock.service';
import { Spotlight } from './spotlight/spotlight';
import { THOUGHTS } from './thoughts-content/thoughts-data';
import { Window } from './window-manager/window';
import { WindowManagerService } from './window-manager/window-manager.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Desktop,
    DesktopIconsComponent,
    ContextMenuComponent,
    MenuBar,
    Dock,
    Window,
    NgComponentOutlet,
    Spotlight,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly launcher = inject(AppLauncherService);
  protected readonly windowManager = inject(WindowManagerService);
  private readonly dockService = inject(DockService);
  protected readonly contextMenu = viewChild(ContextMenuComponent);
  protected readonly spotlight = viewChild(Spotlight);
  protected readonly desktopMenuItems = DEFAULT_DESKTOP_MENU_ITEMS;

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.metaKey && event.code === 'Space') {
      event.preventDefault();
      this.toggleSpotlight();
    }
  }

  toggleSpotlight(): void {
    const sl = this.spotlight();
    if (sl) {
      if (sl.isOpen()) {
        sl.close();
      } else {
        sl.open();
      }
    }
  }

  onSpotlightResult(action: string): void {
    if (action.startsWith('launch:')) {
      const appId = action.replace('launch:', '');
      this.launcher.launch(appId);
      const app = this.dockService.pinnedApps().find((a) => a.id === appId);
      if (app) this.dockService.launchApp(app);
    } else if (action.startsWith('openThought:')) {
      const slug = action.replace('openThought:', '');
      this.launcher.openThought(slug);
    }
  }

  onDesktopContextMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('app-desktop-icon')) return;
    event.preventDefault();
    this.contextMenu()?.open(event.clientX, event.clientY);
  }

  onContextMenuAction(actionId: string) {
    if (actionId === 'view-thoughts') {
      this.dockService.handleDockClick(
        this.dockService.pinnedApps().find((a) => a.id === 'thoughts')!,
      );
    } else if (actionId === 'about') {
      this.dockService.handleDockClick(
        this.dockService.pinnedApps().find((a) => a.id === 'about')!,
      );
    }
  }

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

  getRelatedThoughts(appId: string): string[] {
    return THOUGHTS.filter((t) => t.relatedApp === appId).map((t) => t.slug);
  }

  onThoughtRequested(slug: string): void {
    this.launcher.openThought(slug);
  }
}
