import { effect, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

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
  private readonly platformId = inject(PLATFORM_ID);
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
    if (!isPlatformBrowser(this.platformId)) return { ...DEFAULTS };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  private saveToStorage(data: SettingsData) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}
