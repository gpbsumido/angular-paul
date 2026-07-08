import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-desktop',
  template: `<div class="desktop-wallpaper" [style.background]="wallpaper()"></div>`,
  styles: `
    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 0;
    }

    .desktop-wallpaper {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Desktop {
  readonly wallpaper = signal(
    'linear-gradient(145deg, #1c1c1e 0%, #232336 30%, #2c2c2e 55%, #1a1a2e 80%, #141420 100%)',
  );
}
