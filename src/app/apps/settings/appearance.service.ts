import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable } from '@angular/core';
import { SettingsService } from './settings.service';

/**
 * Applies user settings to the document so preferences actually take effect:
 * theme (data-theme), accent color and dock size (CSS custom properties).
 * Instantiated once from the App shell.
 */
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly settings = inject(SettingsService);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      if (!root) return;

      root.setAttribute('data-theme', this.settings.theme());

      const accent = this.settings.accentColor();
      root.style.setProperty('--accent-color', accent);
      root.style.setProperty('--accent', accent);

      root.style.setProperty('--dock-icon-size', `${this.settings.dockSize()}px`);
    });
  }
}
