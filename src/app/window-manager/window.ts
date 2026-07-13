import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  output,
} from '@angular/core';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

type ResizeDirection = 'e' | 's' | 'se' | 'sw' | 'n' | 'w' | 'ne' | 'nw';

@Component({
  selector: 'app-window',
  templateUrl: './window.html',
  styleUrl: './window.scss',
})
export class Window {
  readonly title = input('Untitled');
  readonly icon = input('');
  readonly width = input(640);
  readonly height = input(480);
  readonly x = input(100);
  readonly y = input(100);
  readonly isActive = input(false);
  readonly relatedThoughts = input<string[]>([]);

  readonly closed = output<void>();
  readonly minimized = output<void>();
  readonly maximized = output<void>();
  readonly thoughtRequested = output<string>();

  readonly hasRelatedThoughts = computed(() => this.relatedThoughts().length > 0);

  private elRef = inject(ElementRef);

  // Mutable state derived from inputs via linkedSignal
  readonly posX = linkedSignal(() => this.x());
  readonly posY = linkedSignal(() => this.y());
  readonly w = linkedSignal(() => this.width());
  readonly h = linkedSignal(() => this.height());

  readonly transform = linkedSignal(() => `translate(${this.posX()}px, ${this.posY()}px)`);

  // Drag state
  private dragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

  // Resize state
  private resizing = false;
  private resizeDir: ResizeDirection = 'se';
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartW = 0;
  private resizeStartH = 0;
  private resizeStartPosX = 0;
  private resizeStartPosY = 0;

  private boundOnPointerMove = this.onPointerMove.bind(this);
  private boundOnPointerUp = this.onPointerUp.bind(this);

  onThoughtsClick(): void {
    const slugs = this.relatedThoughts();
    if (slugs.length > 0) {
      this.thoughtRequested.emit(slugs[0]);
    }
  }

  onTitlebarPointerDown(event: PointerEvent): void {
    // Don't start drag if clicking on traffic lights or other interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('.traffic-lights') || target.closest('.window-thoughts-btn')) {
      return;
    }

    this.dragging = true;
    this.dragOffsetX = event.clientX - this.posX();
    this.dragOffsetY = event.clientY - this.posY();

    document.addEventListener('pointermove', this.boundOnPointerMove);
    document.addEventListener('pointerup', this.boundOnPointerUp);
    event.preventDefault();
  }

  onResizePointerDown(event: PointerEvent, direction: ResizeDirection): void {
    this.resizing = true;
    this.resizeDir = direction;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartW = this.w();
    this.resizeStartH = this.h();
    this.resizeStartPosX = this.posX();
    this.resizeStartPosY = this.posY();

    document.addEventListener('pointermove', this.boundOnPointerMove);
    document.addEventListener('pointerup', this.boundOnPointerUp);
    event.preventDefault();
    event.stopPropagation();
  }

  private onPointerMove(event: PointerEvent): void {
    if (this.dragging) {
      this.handleDrag(event);
    } else if (this.resizing) {
      this.handleResize(event);
    }
  }

  private onPointerUp(): void {
    this.dragging = false;
    this.resizing = false;
    document.removeEventListener('pointermove', this.boundOnPointerMove);
    document.removeEventListener('pointerup', this.boundOnPointerUp);
  }

  private handleDrag(event: PointerEvent): void {
    let newX = event.clientX - this.dragOffsetX;
    let newY = event.clientY - this.dragOffsetY;

    // Clamp to viewport bounds
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);

    const vw = globalThis.innerWidth ?? 10000;
    const vh = globalThis.innerHeight ?? 10000;
    newX = Math.min(newX, vw - this.w());
    newY = Math.min(newY, vh - this.h());

    this.posX.set(newX);
    this.posY.set(newY);
  }

  private handleResize(event: PointerEvent): void {
    const dx = event.clientX - this.resizeStartX;
    const dy = event.clientY - this.resizeStartY;
    const dir = this.resizeDir;

    let newW = this.resizeStartW;
    let newH = this.resizeStartH;
    let newX = this.resizeStartPosX;
    let newY = this.resizeStartPosY;

    if (dir.includes('e')) {
      newW = this.resizeStartW + dx;
    }
    if (dir.includes('w')) {
      newW = this.resizeStartW - dx;
      newX = this.resizeStartPosX + dx;
    }
    if (dir.includes('s')) {
      newH = this.resizeStartH + dy;
    }
    if (dir.includes('n')) {
      newH = this.resizeStartH - dy;
      newY = this.resizeStartPosY + dy;
    }

    // Enforce minimums
    if (newW < MIN_WIDTH) {
      if (dir.includes('w')) {
        newX = this.resizeStartPosX + this.resizeStartW - MIN_WIDTH;
      }
      newW = MIN_WIDTH;
    }
    if (newH < MIN_HEIGHT) {
      if (dir.includes('n')) {
        newY = this.resizeStartPosY + this.resizeStartH - MIN_HEIGHT;
      }
      newH = MIN_HEIGHT;
    }

    this.w.set(newW);
    this.h.set(newH);
    this.posX.set(newX);
    this.posY.set(newY);
  }
}
