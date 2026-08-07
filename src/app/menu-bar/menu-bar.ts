import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  output,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { SettingsService } from '../apps/settings/settings.service';
import { MenuBarItem, MenuBarService } from './menu-bar.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.html',
  styleUrl: './menu-bar.scss',
  // The live clock differs between server render and client bootstrap; skip
  // hydration for this subtree so it re-renders cleanly in the browser.
  host: { ngSkipHydration: 'true' },
})
export class MenuBar {
  private readonly menuBarService = inject(MenuBarService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly settings = inject(SettingsService);

  readonly menus = this.menuBarService.menus;
  readonly activeAppName = this.menuBarService.activeAppName;
  private readonly now = signal(new Date());
  readonly clock = computed(() => this.formatTime(this.now()));
  readonly openMenuId = signal<string | null>(null);
  readonly spotlightRequested = output<void>();

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private outsideListener: (() => void) | null = null;

  constructor() {
    effect(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      this.intervalId = setInterval(() => {
        this.now.set(new Date());
      }, 1000);
    });

    this.destroyRef.onDestroy(() => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
      this.removeOutsideListener();
    });
  }

  toggleMenu(id: string): void {
    if (this.openMenuId() === id) {
      this.closeMenu();
    } else {
      this.openMenu(id);
    }
  }

  openMenu(id: string): void {
    this.openMenuId.set(id);
    this.listenForOutsideClick();
  }

  closeMenu(returnFocusToTrigger = false): void {
    const current = this.openMenuId();
    this.openMenuId.set(null);
    this.removeOutsideListener();
    if (returnFocusToTrigger && current) {
      this.triggerButton(current)?.focus();
    }
  }

  /** When a menu is already open, hovering another top-level opens it (macOS feel). */
  onMenuHover(id: string): void {
    if (this.openMenuId() !== null && this.openMenuId() !== id) {
      this.openMenu(id);
    }
  }

  onTriggerKeydown(event: KeyboardEvent, id: string): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.openMenu(id);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.moveTrigger(id, -1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.moveTrigger(id, 1);
        break;
      case 'Escape':
        this.closeMenu();
        break;
    }
  }

  onItemClick(item: MenuBarItem): void {
    if (item.disabled || item.type === 'separator') return;
    this.menuBarService.execute(item.id);
    this.closeMenu(true);
  }

  onDropdownKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.closeMenu(true);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveItemFocus(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveItemFocus(-1);
        break;
    }
  }

  private moveTrigger(currentId: string, dir: 1 | -1): void {
    const ids = this.menus().map((m) => m.id);
    const idx = ids.indexOf(currentId);
    const nextId = ids[(idx + dir + ids.length) % ids.length];
    if (this.openMenuId() !== null) {
      this.openMenu(nextId);
    }
    this.triggerButton(nextId)?.focus();
  }

  private moveItemFocus(dir: 1 | -1): void {
    const items = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLButtonElement>(
        '.menu-dropdown .menu-dropdown-item:not([disabled])',
      ),
    );
    if (items.length === 0) return;
    const active = this.document.activeElement;
    const idx = items.findIndex((el) => el === active);
    const next = idx === -1 ? 0 : (idx + dir + items.length) % items.length;
    items[next].focus();
  }

  private triggerButton(menuId: string): HTMLButtonElement | null {
    return this.host.nativeElement.querySelector<HTMLButtonElement>(
      `.menu-bar-item[data-menu-id="${menuId}"]`,
    );
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: this.settings.clockFormat() === '12h',
    });
  }

  private listenForOutsideClick(): void {
    this.removeOutsideListener();
    const handler = (event: MouseEvent) => {
      if (!this.host.nativeElement.contains(event.target as Node)) {
        this.closeMenu();
      }
    };
    this.document.addEventListener('mousedown', handler);
    this.outsideListener = () => this.document.removeEventListener('mousedown', handler);
  }

  private removeOutsideListener(): void {
    this.outsideListener?.();
    this.outsideListener = null;
  }
}
