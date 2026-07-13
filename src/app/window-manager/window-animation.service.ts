import { inject, Injectable } from '@angular/core';
import { WindowManagerService } from './window-manager.service';

export interface AnimationConfig {
  type: 'open' | 'close' | 'minimize' | 'none';
  transform: string;
  opacity: number;
  duration: number;
  targetX?: number;
  targetY?: number;
}

const NOOP_CONFIG: AnimationConfig = {
  type: 'none',
  transform: 'none',
  opacity: 1,
  duration: 0,
};

@Injectable({ providedIn: 'root' })
export class WindowAnimationService {
  private windowManager = inject(WindowManagerService);

  supportsViewTransitions(): boolean {
    return typeof document !== 'undefined' && 'startViewTransition' in document;
  }

  getOpenAnimation(windowId: string, supported = this.supportsViewTransitions()): AnimationConfig {
    if (!supported) return { ...NOOP_CONFIG };

    const win = this.windowManager.getWindow(windowId);
    if (!win) return { ...NOOP_CONFIG };

    return {
      type: 'open',
      transform: 'scale(0.8)',
      opacity: 0,
      duration: 250,
    };
  }

  getCloseAnimation(windowId: string, supported = this.supportsViewTransitions()): AnimationConfig {
    if (!supported) return { ...NOOP_CONFIG };

    const win = this.windowManager.getWindow(windowId);
    if (!win) return { ...NOOP_CONFIG };

    return {
      type: 'close',
      transform: 'scale(0.9)',
      opacity: 0,
      duration: 200,
    };
  }

  getMinimizeAnimation(
    windowId: string,
    dockIconPosition: { x: number; y: number },
    supported = this.supportsViewTransitions(),
  ): AnimationConfig {
    if (!supported) return { ...NOOP_CONFIG };

    const win = this.windowManager.getWindow(windowId);
    if (!win) return { ...NOOP_CONFIG };

    return {
      type: 'minimize',
      transform: 'scale(0.1)',
      opacity: 0,
      duration: 350,
      targetX: dockIconPosition.x,
      targetY: dockIconPosition.y,
    };
  }
}
