import { Component, DestroyRef, effect, inject, output, signal } from '@angular/core';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.html',
  styleUrl: './menu-bar.scss',
})
export class MenuBar {
  readonly clock = signal(this.formatTime());
  readonly activeApp = signal('Finder');
  readonly menuItems = signal(['File', 'Edit', 'View', 'Window', 'Help']);
  readonly spotlightRequested = output<void>();

  private intervalId: ReturnType<typeof setInterval> | null = null;
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.intervalId = setInterval(() => {
        this.clock.set(this.formatTime());
      }, 1000);
    });

    this.destroyRef.onDestroy(() => {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    });
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}
