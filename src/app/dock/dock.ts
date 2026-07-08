import { Component, computed, signal } from '@angular/core';

export interface DockItem {
  id: string;
  label: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dock',
  templateUrl: './dock.html',
  styleUrl: './dock.scss',
})
export class Dock {
  readonly apps = signal<DockItem[]>([
    { id: 'finder', label: 'Finder', icon: '🗂', color: '#2196F3' },
    { id: 'about', label: 'About', icon: '👤', color: '#9C27B0' },
    { id: 'projects', label: 'Projects', icon: '📁', color: '#4CAF50' },
    { id: 'terminal', label: 'Terminal', icon: '⬛', color: '#1a1a1a' },
    { id: 'thoughts', label: 'Thoughts', icon: '💭', color: '#FF9800' },
    { id: 'settings', label: 'Settings', icon: '⚙️', color: '#607D8B' },
    { id: 'contact', label: 'Contact', icon: '✉️', color: '#03A9F4' },
  ]);

  readonly recentApps = signal<DockItem[]>([
    { id: 'notes', label: 'Notes', icon: '📝', color: '#FFC107' },
  ]);

  readonly mouseX = signal(-1);
  readonly hovering = signal(false);

  readonly iconScales = computed(() => {
    const items = this.apps();
    const mx = this.mouseX();
    const isHovering = this.hovering();

    if (!isHovering || mx < 0) {
      return items.map(() => 1);
    }

    const iconFullSize = 56; // icon size + gap approximation
    return items.map((_, i) => {
      const iconCenter = i * iconFullSize + iconFullSize / 2;
      const distance = Math.abs(mx - iconCenter);
      const maxDistance = iconFullSize * 2.5;

      if (distance > maxDistance) return 1;

      const scale = 1 + 0.5 * Math.cos((distance / maxDistance) * (Math.PI / 2));
      return Math.round(scale * 100) / 100;
    });
  });

  onDockMouseMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.mouseX.set(event.clientX - rect.left);
    this.hovering.set(true);
  }

  onDockMouseLeave(): void {
    this.mouseX.set(-1);
    this.hovering.set(false);
  }

  launchApp(app: DockItem): void {
    console.log(`Launching ${app.label}...`);
  }
}
