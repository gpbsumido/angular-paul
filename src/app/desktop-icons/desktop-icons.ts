import { Component, inject, signal, viewChildren } from '@angular/core';
import { AppLauncherService } from '../shared/app-launcher.service';
import { DockService } from '../shared/dock.service';
import { DesktopIconComponent } from './desktop-icon';

export interface DesktopIconData {
  id: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-desktop-icons',
  imports: [DesktopIconComponent],
  template: `
    <div class="desktop-icons-grid">
      @for (item of icons(); track item.id) {
        <app-desktop-icon
          [id]="item.id"
          [icon]="item.icon"
          [label]="item.label"
          (launched)="onLaunched($event)"
          (click)="onIconClick(item.id)"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: fixed;
      inset: 28px 0 80px 0;
      z-index: 1;
      pointer-events: none;
    }

    .desktop-icons-grid {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 8px;
      padding: 16px;
      height: 100%;
      pointer-events: auto;
    }
  `,
})
export class DesktopIconsComponent {
  private readonly launcher = inject(AppLauncherService);
  private readonly dockService = inject(DockService);

  readonly icons = signal<DesktopIconData[]>([
    { id: 'readme', icon: '📄', label: 'README.md' },
    { id: 'projects', icon: '📁', label: 'Projects' },
    { id: 'thoughts', icon: '📁', label: 'Thoughts' },
  ]);

  private readonly iconToApp: Record<string, string> = {
    readme: 'readme',
    projects: 'projects',
    thoughts: 'thoughts',
  };

  private readonly iconComponents = viewChildren(DesktopIconComponent);

  onIconClick(clickedId: string) {
    for (const icon of this.iconComponents()) {
      if (icon.id() === clickedId) {
        icon.select();
      } else {
        icon.deselect();
      }
    }
  }

  onLaunched(iconId: string) {
    const appId = this.iconToApp[iconId];
    if (appId) {
      this.launcher.launch(appId);
      const app = this.dockService.pinnedApps().find((a) => a.id === appId);
      if (app) this.dockService.launchApp(app);
    }
  }
}
