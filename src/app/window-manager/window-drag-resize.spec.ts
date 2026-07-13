import { Component, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Window } from './window';

@Component({
  selector: 'app-test-host',
  imports: [Window],
  template: `
    <app-window
      [title]="'Drag Test'"
      [isActive]="true"
      [x]="x()"
      [y]="y()"
      [width]="width()"
      [height]="height()"
    >
      <p>Content</p>
    </app-window>
  `,
})
class TestHost {
  x = signal(100);
  y = signal(100);
  width = signal(640);
  height = signal(480);
  window = viewChild.required(Window);
}

function pointerEvent(type: string, clientX: number, clientY: number): PointerEvent {
  return new PointerEvent(type, {
    clientX,
    clientY,
    bubbles: true,
    pointerId: 1,
  });
}

describe('Window drag and resize', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  describe('dragging', () => {
    it('should update x/y position when dragging the title bar', () => {
      const win = host.window();
      const titlebar = nativeEl.querySelector('.window-titlebar') as HTMLElement;

      titlebar.dispatchEvent(pointerEvent('pointerdown', 200, 110));
      document.dispatchEvent(pointerEvent('pointermove', 250, 160));
      document.dispatchEvent(pointerEvent('pointerup', 250, 160));
      fixture.detectChanges();

      expect(win.posX()).not.toBe(100);
      expect(win.posY()).not.toBe(100);
    });

    it('should not start drag when clicking on traffic-light buttons', () => {
      const win = host.window();
      const closeBtn = nativeEl.querySelector('.traffic-close') as HTMLElement;

      closeBtn.dispatchEvent(pointerEvent('pointerdown', 120, 110));
      document.dispatchEvent(pointerEvent('pointermove', 170, 160));
      document.dispatchEvent(pointerEvent('pointerup', 170, 160));
      fixture.detectChanges();

      // Position should remain unchanged
      expect(win.posX()).toBe(100);
      expect(win.posY()).toBe(100);
    });

    it('should keep window position within viewport bounds during drag', () => {
      const win = host.window();
      const titlebar = nativeEl.querySelector('.window-titlebar') as HTMLElement;

      titlebar.dispatchEvent(pointerEvent('pointerdown', 200, 110));
      // Drag far off-screen to the left/top
      document.dispatchEvent(pointerEvent('pointermove', -5000, -5000));
      document.dispatchEvent(pointerEvent('pointerup', -5000, -5000));
      fixture.detectChanges();

      expect(win.posX()).toBeGreaterThanOrEqual(0);
      expect(win.posY()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('resizing', () => {
    it('should update width when resizing from the right edge', () => {
      const win = host.window();
      const handle = nativeEl.querySelector('.resize-handle-e') as HTMLElement;

      handle.dispatchEvent(pointerEvent('pointerdown', 740, 300));
      document.dispatchEvent(pointerEvent('pointermove', 800, 300));
      document.dispatchEvent(pointerEvent('pointerup', 800, 300));
      fixture.detectChanges();

      expect(win.w()).toBe(700);
    });

    it('should update height when resizing from the bottom edge', () => {
      const win = host.window();
      const handle = nativeEl.querySelector('.resize-handle-s') as HTMLElement;

      handle.dispatchEvent(pointerEvent('pointerdown', 400, 580));
      document.dispatchEvent(pointerEvent('pointermove', 400, 630));
      document.dispatchEvent(pointerEvent('pointerup', 400, 630));
      fixture.detectChanges();

      expect(win.h()).toBe(530);
    });

    it('should update both width and height when resizing from a corner', () => {
      const win = host.window();
      const handle = nativeEl.querySelector('.resize-handle-se') as HTMLElement;

      handle.dispatchEvent(pointerEvent('pointerdown', 740, 580));
      document.dispatchEvent(pointerEvent('pointermove', 800, 630));
      document.dispatchEvent(pointerEvent('pointerup', 800, 630));
      fixture.detectChanges();

      expect(win.w()).toBe(700);
      expect(win.h()).toBe(530);
    });

    it('should not resize below minimum width/height (200x150)', () => {
      const win = host.window();
      const handle = nativeEl.querySelector('.resize-handle-se') as HTMLElement;

      handle.dispatchEvent(pointerEvent('pointerdown', 740, 580));
      // Drag far inward to try to shrink below minimum
      document.dispatchEvent(pointerEvent('pointermove', 50, 50));
      document.dispatchEvent(pointerEvent('pointerup', 50, 50));
      fixture.detectChanges();

      expect(win.w()).toBeGreaterThanOrEqual(200);
      expect(win.h()).toBeGreaterThanOrEqual(150);
    });
  });

  describe('linkedSignal transform', () => {
    it('should derive CSS transform string from position signals', () => {
      const win = host.window();
      const transform = win.transform();
      expect(transform).toBe('translate(100px, 100px)');
    });

    it('should update transform when position changes', () => {
      const win = host.window();
      const titlebar = nativeEl.querySelector('.window-titlebar') as HTMLElement;

      titlebar.dispatchEvent(pointerEvent('pointerdown', 200, 110));
      document.dispatchEvent(pointerEvent('pointermove', 230, 140));
      document.dispatchEvent(pointerEvent('pointerup', 230, 140));
      fixture.detectChanges();

      const transform = win.transform();
      expect(transform).toContain('translate(');
      expect(transform).not.toBe('translate(100px, 100px)');
    });
  });
});
