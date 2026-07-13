import { Component, inject, signal } from '@angular/core';
import { SettingsService } from './settings.service';

type Pane = 'appearance' | 'dock' | 'general';

interface SidebarItem {
  id: Pane;
  label: string;
}

@Component({
  selector: 'app-system-preferences',
  template: `
    <div class="settings">
      <nav class="settings-sidebar">
        @for (item of panes; track item.id) {
          <button
            class="settings-sidebar-item"
            [class.active]="activePane() === item.id"
            (click)="activePane.set(item.id)"
          >
            {{ item.label }}
          </button>
        }
      </nav>

      <div class="settings-content">
        @switch (activePane()) {
          @case ('appearance') {
            <div class="settings-pane-appearance">
              <h3>Appearance</h3>

              <div class="settings-row">
                <span class="settings-label">Theme</span>
                <div class="theme-options">
                  <button
                    class="theme-option theme-option-light"
                    [class.active]="settings.theme() === 'light'"
                    (click)="settings.setTheme('light')"
                  >
                    Light
                  </button>
                  <button
                    class="theme-option theme-option-dark"
                    [class.active]="settings.theme() === 'dark'"
                    (click)="settings.setTheme('dark')"
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div class="settings-row">
                <span class="settings-label">Accent Color</span>
                <div class="accent-colors">
                  <span
                    class="accent-color-current"
                    [style.background]="settings.accentColor()"
                  ></span>
                  @for (color of accentColors; track color) {
                    <button
                      class="accent-color-swatch"
                      [style.background]="color"
                      [attr.aria-label]="'Set accent color to ' + color"
                      (click)="settings.setAccentColor(color)"
                    ></button>
                  }
                </div>
              </div>
            </div>
          }
          @case ('dock') {
            <div class="settings-pane-dock">
              <h3>Desktop & Dock</h3>

              <div class="settings-row">
                <span class="settings-label">Dock Size</span>
                <input
                  type="range"
                  class="dock-size-slider"
                  min="36"
                  max="96"
                  [value]="settings.dockSize()"
                  (input)="onDockSizeChange($event)"
                />
                <span class="settings-value">{{ settings.dockSize() }}px</span>
              </div>

              <div class="settings-row">
                <span class="settings-label">Wallpaper</span>
                <div class="wallpaper-preview" [style.background]="settings.wallpaper()"></div>
              </div>
            </div>
          }
          @case ('general') {
            <div class="settings-pane-general">
              <h3>General</h3>

              <div class="settings-row">
                <span class="settings-label">Clock Format</span>
                <div class="theme-options">
                  <button
                    class="theme-option"
                    [class.active]="settings.clockFormat() === '12h'"
                    (click)="settings.setClockFormat('12h')"
                  >
                    12-hour
                  </button>
                  <button
                    class="theme-option"
                    [class.active]="settings.clockFormat() === '24h'"
                    (click)="settings.setClockFormat('24h')"
                  >
                    24-hour
                  </button>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-primary, #fff);
    }

    .settings {
      display: flex;
      height: 100%;
    }

    .settings-sidebar {
      width: 180px;
      padding: 12px 8px;
      background: rgba(255, 255, 255, 0.03);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .settings-sidebar-item {
      display: block;
      width: 100%;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      background: none;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      font-size: 13px;
      text-align: left;
      cursor: pointer;
    }

    .settings-sidebar-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .settings-sidebar-item.active {
      background: rgba(0, 122, 255, 0.2);
      color: var(--text-primary, #fff);
    }

    .settings-content {
      flex: 1;
      padding: 20px 24px;
      overflow-y: auto;
    }

    .settings-content h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .settings-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .settings-label {
      font-size: 13px;
      min-width: 100px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    }

    .settings-value {
      font-size: 12px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
      min-width: 40px;
    }

    .theme-options {
      display: flex;
      gap: 8px;
    }

    .theme-option {
      padding: 6px 16px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      font-size: 12px;
      cursor: pointer;
    }

    .theme-option.active {
      border-color: var(--accent-color, #007aff);
      color: var(--text-primary, #fff);
      background: rgba(0, 122, 255, 0.15);
    }

    .accent-colors {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .accent-color-current {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .accent-color-swatch {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.15);
      cursor: pointer;
      padding: 0;
    }

    .accent-color-swatch:hover {
      transform: scale(1.2);
    }

    .dock-size-slider {
      flex: 1;
      accent-color: var(--accent-color, #007aff);
    }

    .wallpaper-preview {
      width: 120px;
      height: 75px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
  `,
})
export class SystemPreferencesApp {
  protected readonly settings = inject(SettingsService);

  readonly activePane = signal<Pane>('appearance');

  readonly panes: SidebarItem[] = [
    { id: 'appearance', label: 'Appearance' },
    { id: 'dock', label: 'Desktop & Dock' },
    { id: 'general', label: 'General' },
  ];

  readonly accentColors = ['#007aff', '#ff3b30', '#ff9500', '#34c759', '#af52de', '#ff2d55'];

  onDockSizeChange(event: Event) {
    const value = +(event.target as HTMLInputElement).value;
    this.settings.setDockSize(value);
  }
}
