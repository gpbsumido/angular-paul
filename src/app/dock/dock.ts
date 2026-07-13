import { Component, computed, inject, signal } from '@angular/core';
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

  private readonly appLoaders: Record<string, () => Promise<unknown>> = {
    finder: () => import('../apps/finder/finder-app').then((m) => m.FinderApp),
    about: () => import('../apps/about-app').then((m) => m.AboutApp),
    projects: () => import('../apps/projects-app').then((m) => m.ProjectsApp),
    terminal: () => import('../apps/terminal-app').then((m) => m.TerminalApp),
    thoughts: () =>
      import('../thoughts-content/thoughts-list').then((m) => m.ThoughtsListComponent),
    settings: () =>
      import('../apps/settings/system-preferences').then((m) => m.SystemPreferencesApp),
    contact: () => import('../apps/contact-app').then((m) => m.ContactApp),
    readme: () => import('../apps/readme-app').then((m) => m.ReadmeApp),
  };

  constructor() {
    for (const app of this.dockService.pinnedApps()) {
      if (!this.launcher.getRegistration(app.id)) {
        this.launcher.registerLazy({
          appId: app.id,
          title: app.label,
          icon: app.icon,
          loader: this.appLoaders[app.id],
        });
      }
    }

    // Register desktop-only apps not in the dock
    if (!this.launcher.getRegistration('readme')) {
      this.launcher.registerLazy({
        appId: 'readme',
        title: 'README.md',
        icon: '📄',
        loader: this.appLoaders['readme'],
      });
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
