import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => localStorage.clear());

  it('should default theme to dark', () => {
    expect(service.theme()).toBe('dark');
  });

  it('setTheme("light") should update the theme signal', () => {
    service.setTheme('light');
    expect(service.theme()).toBe('light');
  });

  it('should default clock format to 12h', () => {
    expect(service.clockFormat()).toBe('12h');
  });

  it('setClockFormat("24h") should update the clock format signal', () => {
    service.setClockFormat('24h');
    expect(service.clockFormat()).toBe('24h');
  });

  it('setWallpaper should update the wallpaper signal', () => {
    const url = 'linear-gradient(to right, red, blue)';
    service.setWallpaper(url);
    expect(service.wallpaper()).toBe(url);
  });

  it('setDockSize should update the dock size signal', () => {
    service.setDockSize(64);
    expect(service.dockSize()).toBe(64);
  });

  it('should persist settings to localStorage when changed', () => {
    service.setTheme('light');
    service.setClockFormat('24h');
    service.setDockSize(72);
    TestBed.flushEffects();

    const stored = JSON.parse(localStorage.getItem('settings')!);
    expect(stored.theme).toBe('light');
    expect(stored.clockFormat).toBe('24h');
    expect(stored.dockSize).toBe(72);
  });

  it('should restore settings from localStorage on initialization', () => {
    localStorage.setItem(
      'settings',
      JSON.stringify({
        theme: 'light',
        clockFormat: '24h',
        wallpaper: 'solid-red',
        dockSize: 80,
        accentColor: '#ff0000',
      }),
    );

    // Re-create to trigger restore
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(SettingsService);

    expect(restored.theme()).toBe('light');
    expect(restored.clockFormat()).toBe('24h');
    expect(restored.wallpaper()).toBe('solid-red');
    expect(restored.dockSize()).toBe(80);
    expect(restored.accentColor()).toBe('#ff0000');
  });
});
