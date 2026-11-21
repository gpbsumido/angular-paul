import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { AppearanceService } from './appearance.service';
import { SettingsService } from './settings.service';

describe('AppearanceService', () => {
  let settings: SettingsService;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // instantiating the service wires the effect
    TestBed.inject(AppearanceService);
    settings = TestBed.inject(SettingsService);
    root = (TestBed.inject(DOCUMENT).documentElement as HTMLElement);
  });

  it('applies the accent color as a CSS custom property', () => {
    settings.setAccentColor('#ff2d55');
    TestBed.tick();

    expect(root.style.getPropertyValue('--accent-color').trim()).toBe('#ff2d55');
    expect(root.style.getPropertyValue('--accent').trim()).toBe('#ff2d55');
  });

  it('applies the dock size as --dock-icon-size', () => {
    settings.setDockSize(72);
    TestBed.tick();

    expect(root.style.getPropertyValue('--dock-icon-size').trim()).toBe('72px');
  });

  it('reflects the theme on the document root', () => {
    settings.setTheme('light');
    TestBed.tick();
    expect(root.getAttribute('data-theme')).toBe('light');

    settings.setTheme('dark');
    TestBed.tick();
    expect(root.getAttribute('data-theme')).toBe('dark');
  });
});
