import { Component, computed, inject, signal } from '@angular/core';
import { PlaceholderApp } from '../apps/placeholder-app';
import { AppLauncherService } from '../shared/app-launcher.service';
import { DockItem, DockService } from '../shared/dock.service';

@Component({
  selector: 'app-dock',
  templateUrl: './dock.html',
  styleUrl: './dock.scss',
})
export class Dock {
  private dockService = inject(DockService);
  private launcher = inject(AppLauncherService);

  readonly apps = this.dockService.pinnedApps;
  readonly transientApps = this.dockService.transientApps;
  readonly indicators = this.dockService.appIndicators;

  readonly mouseX = signal(-1);
  readonly hovering = signal(false);

  readonly iconScales = computed(() => {
    const items = this.apps();
    const mx = this.mouseX();
    const isHovering = this.hovering();

    if (!isHovering || mx < 0) {
      return items.map(() => 1);
    }

    const iconFullSize = 56;
    return items.map((_, i) => {
      const iconCenter = i * iconFullSize + iconFullSize / 2;
      const distance = Math.abs(mx - iconCenter);
      const maxDistance = iconFullSize * 2.5;

      if (distance > maxDistance) return 1;

      const scale = 1 + 0.5 * Math.cos((distance / maxDistance) * (Math.PI / 2));
      return Math.round(scale * 100) / 100;
    });
  });

  constructor() {
    // Register all pinned apps with the launcher
    for (const app of this.dockService.pinnedApps()) {
      if (!this.launcher.getRegistration(app.id)) {
        this.launcher.register({
          appId: app.id,
          title: app.label,
          icon: app.icon,
          component: PlaceholderApp,
        });
      }
    }
  }

  getIndicator(appId: string): 'active' | 'inactive' | null {
    return this.indicators().get(appId) ?? null;
  }

  onDockMouseMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.mouseX.set(event.clientX - rect.left);
    this.hovering.set(true);
  }

  onDockMouseLeave(): void {
    this.mouseX.set(-1);
    this.hovering.set(false);
  }

  onIconClick(app: DockItem): void {
    const state = this.dockService.getState(app.id);

    if (!state) {
      // Not running — launch it
      this.launcher.launch(app.id);
      this.dockService.launchApp(app);
    } else if (state === 'focused') {
      // Already focused — minimize
      this.dockService.handleDockClick(app);
    } else {
      // Running but not focused — focus it
      this.dockService.focusApp(app.id);
    }
  }
}
