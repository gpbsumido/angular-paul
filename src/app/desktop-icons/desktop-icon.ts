import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-desktop-icon',
  template: `
    <div
      class="desktop-icon"
      role="button"
      tabindex="0"
      [class.selected]="selected()"
      (click)="select()"
      (dblclick)="launch()"
      (keydown.enter)="launch()"
    >
      <span class="desktop-icon-image">{{ icon() }}</span>
      <span class="desktop-icon-label">{{ label() }}</span>
    </div>
  `,
  styles: `
    .desktop-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 80px;
      padding: 8px 4px;
      border-radius: 8px;
      cursor: default;
      user-select: none;
    }

    .desktop-icon.selected {
      background: rgba(255, 255, 255, 0.15);
      outline: 1px solid rgba(255, 255, 255, 0.3);
    }

    .desktop-icon-image {
      font-size: 48px;
      line-height: 1;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
    }

    .desktop-icon-label {
      margin-top: 4px;
      font-size: 11px;
      color: white;
      text-align: center;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      word-break: break-word;
    }
  `,
})
export class DesktopIconComponent {
  readonly id = input.required<string>();
  readonly icon = input.required<string>();
  readonly label = input.required<string>();

  readonly selected = signal(false);
  readonly launched = output<string>();

  select() {
    this.selected.set(true);
  }

  deselect() {
    this.selected.set(false);
  }

  launch() {
    this.launched.emit(this.id());
  }
}
