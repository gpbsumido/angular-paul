import { Component, input } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  template: `
    <div class="placeholder">
      <span class="placeholder-icon">{{ icon() }}</span>
      <h2>{{ appId() }}</h2>
      <p>This app is coming soon.</p>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-secondary);
      font-family: var(--font-system);
    }

    .placeholder {
      text-align: center;
      padding: 40px;
    }

    .placeholder-icon {
      font-size: 48px;
      display: block;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 18px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    p {
      font-size: 13px;
    }
  `,
})
export class PlaceholderApp {
  readonly appId = input('');
  readonly icon = input('📦');
}
