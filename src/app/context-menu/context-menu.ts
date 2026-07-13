import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';

export interface ContextMenuItem {
  id: string;
  label?: string;
  type?: 'separator';
  disabled?: boolean;
}

export const DEFAULT_DESKTOP_MENU_ITEMS: ContextMenuItem[] = [
  { id: 'new-folder', label: 'New Folder', disabled: true },
  { id: 'separator-1', type: 'separator' },
  { id: 'get-info', label: 'Get Info' },
  { id: 'change-bg', label: 'Change Desktop Background...' },
  { id: 'separator-2', type: 'separator' },
  { id: 'view-thoughts', label: 'View Thoughts' },
  { id: 'about', label: 'About This Mac' },
];

@Component({
  selector: 'app-context-menu',
  template: `
    @if (visible()) {
      <div class="context-menu" [style.left.px]="x()" [style.top.px]="y()">
        @for (item of items(); track item.id) {
          @if (item.type === 'separator') {
            <div class="context-menu-separator"></div>
          } @else {
            <div
              class="context-menu-item"
              [class.disabled]="item.disabled"
              (click)="onItemClick(item)"
            >
              {{ item.label }}
            </div>
          }
        }
      </div>
    }
  `,
  styles: `
    .context-menu {
      position: fixed;
      min-width: 220px;
      padding: 4px 0;
      background: rgba(40, 40, 40, 0.85);
      backdrop-filter: blur(20px) saturate(180%);
      border-radius: 6px;
      border: 0.5px solid rgba(255, 255, 255, 0.15);
      box-shadow:
        0 10px 30px rgba(0, 0, 0, 0.4),
        0 0 1px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 13px;
      color: white;
    }

    .context-menu-item {
      padding: 4px 12px;
      cursor: default;
      border-radius: 4px;
      margin: 0 4px;
    }

    .context-menu-item:not(.disabled):hover {
      background: rgba(59, 130, 246, 0.8);
    }

    .context-menu-item.disabled {
      color: rgba(255, 255, 255, 0.35);
    }

    .context-menu-separator {
      height: 1px;
      margin: 4px 12px;
      background: rgba(255, 255, 255, 0.12);
    }
  `,
})
export class ContextMenuComponent {
  readonly items = input<ContextMenuItem[]>([]);
  readonly action = output<string>();

  readonly visible = signal(false);
  readonly x = signal(0);
  readonly y = signal(0);

  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private outsideListener: (() => void) | null = null;

  open(clientX: number, clientY: number) {
    this.x.set(clientX);
    this.y.set(clientY);
    this.visible.set(true);
    this.listenForOutsideClick();
  }

  close() {
    this.visible.set(false);
    this.removeOutsideListener();
  }

  onItemClick(item: ContextMenuItem) {
    if (item.disabled) return;
    this.action.emit(item.id);
    this.close();
  }

  private listenForOutsideClick() {
    this.removeOutsideListener();
    const handler = () => this.close();
    this.document.addEventListener('mousedown', handler);
    this.outsideListener = () => this.document.removeEventListener('mousedown', handler);
    this.destroyRef.onDestroy(() => this.removeOutsideListener());
  }

  private removeOutsideListener() {
    this.outsideListener?.();
    this.outsideListener = null;
  }
}
