// [ng-01 structure] Why this lives in shared/ and not apps/settings/:
// the dock (icon size), the menu bar (clock format) and the root shell (theme)
// all read it. State that the whole app depends on is not a feature's private
// business. It sat in apps/settings/ until architecture.spec.ts flagged three
// shell files importing it. The *screen* that edits it (system-preferences.ts)
// stays in the feature folder. The *state* moved down a layer.
import { effect, Injectable, inject, signal } from '@angular/core';
import { BROWSER_STORAGE } from '../browser-storage';

export type Theme = 'dark' | 'light';
export type ClockFormat = '12h' | '24h';

interface SettingsData {
  theme: Theme;
  clockFormat: ClockFormat;
  wallpaper: string;
  dockSize: number;
  accentColor: string;
}

const STORAGE_KEY = 'settings';

const DEFAULTS: SettingsData = {
  theme: 'dark',
  clockFormat: '12h',
  wallpaper:
    'linear-gradient(145deg, #1c1c1e 0%, #232336 30%, #2c2c2e 55%, #1a1a2e 80%, #141420 100%)',
  dockSize: 56,
  accentColor: '#007aff',
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  // [ng-05 di] This used to inject PLATFORM_ID and reach for the global
  // localStorage behind an isPlatformBrowser() check, twice. Depending on the
  // token instead means the platform decision lives in one factory, and a
  // spec can hand in its own Storage instead of clearing the real one.
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly initial = this.loadFromStorage();

  readonly theme = signal<Theme>(this.initial.theme);
  readonly clockFormat = signal<ClockFormat>(this.initial.clockFormat);
  readonly wallpaper = signal(this.initial.wallpaper);
  readonly dockSize = signal(this.initial.dockSize);
  readonly accentColor = signal(this.initial.accentColor);

  constructor() {
    effect(() => {
      const data: SettingsData = {
        theme: this.theme(),
        clockFormat: this.clockFormat(),
        wallpaper: this.wallpaper(),
        dockSize: this.dockSize(),
        accentColor: this.accentColor(),
      };
      this.saveToStorage(data);
    });
  }

  setTheme(theme: Theme) {
    this.theme.set(theme);
  }

  setClockFormat(format: ClockFormat) {
    this.clockFormat.set(format);
  }

  setWallpaper(wallpaper: string) {
    this.wallpaper.set(wallpaper);
  }

  setDockSize(size: number) {
    this.dockSize.set(size);
  }

  setAccentColor(color: string) {
    this.accentColor.set(color);
  }

  private loadFromStorage(): SettingsData {
    if (!this.storage) return { ...DEFAULTS };
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private saveToStorage(data: SettingsData) {
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
