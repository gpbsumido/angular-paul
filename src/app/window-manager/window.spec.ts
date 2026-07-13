import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Window } from './window';

@Component({
  selector: 'app-test-host',
  imports: [Window],
  template: `
    <app-window
      [title]="title()"
      [isActive]="isActive()"
      [relatedThoughts]="relatedThoughts()"
      (closed)="onClosed()"
      (minimized)="onMinimized()"
      (maximized)="onMaximized()"
      (thoughtRequested)="onThoughtRequested($event)"
    >
      <p class="test-content">Hello from projected content</p>
    </app-window>
  `,
})
class TestHost {
  title = signal('Test Window');
  isActive = signal(true);
  relatedThoughts = signal<string[]>([]);
  onClosed = vi.fn();
  onMinimized = vi.fn();
  onMaximized = vi.fn();
  onThoughtRequested = vi.fn();
}

describe('Window', () => {
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

  it('should render a title bar with the provided title', () => {
    const titleEl = nativeEl.querySelector('.window-title');
    expect(titleEl?.textContent?.trim()).toBe('Test Window');
  });

  it('should update the title bar when the title input changes', () => {
    host.title.set('Updated Title');
    fixture.detectChanges();
    const titleEl = nativeEl.querySelector('.window-title');
    expect(titleEl?.textContent?.trim()).toBe('Updated Title');
  });

  it('should show traffic-light buttons (close, minimize, maximize)', () => {
    const close = nativeEl.querySelector('.traffic-close');
    const minimize = nativeEl.querySelector('.traffic-minimize');
    const maximize = nativeEl.querySelector('.traffic-maximize');
    expect(close).toBeTruthy();
    expect(minimize).toBeTruthy();
    expect(maximize).toBeTruthy();
  });

  it('should emit closed event when close button is clicked', () => {
    const closeBtn = nativeEl.querySelector('.traffic-close') as HTMLElement;
    closeBtn.click();
    expect(host.onClosed).toHaveBeenCalled();
  });

  it('should emit minimized event when minimize button is clicked', () => {
    const minimizeBtn = nativeEl.querySelector('.traffic-minimize') as HTMLElement;
    minimizeBtn.click();
    expect(host.onMinimized).toHaveBeenCalled();
  });

  it('should emit maximized event when maximize button is clicked', () => {
    const maximizeBtn = nativeEl.querySelector('.traffic-maximize') as HTMLElement;
    maximizeBtn.click();
    expect(host.onMaximized).toHaveBeenCalled();
  });

  it('should render projected content inside the window body', () => {
    const content = nativeEl.querySelector('.window-body .test-content');
    expect(content?.textContent?.trim()).toBe('Hello from projected content');
  });

  it('should apply active CSS class when isActive is true', () => {
    const windowEl = nativeEl.querySelector('.window');
    expect(windowEl?.classList.contains('active')).toBe(true);
  });

  it('should not have active CSS class when isActive is false', () => {
    host.isActive.set(false);
    fixture.detectChanges();
    const windowEl = nativeEl.querySelector('.window');
    expect(windowEl?.classList.contains('active')).toBe(false);
  });

  it('should show the thoughts button in the title bar when relatedThoughts has entries', () => {
    host.relatedThoughts.set(['signals']);
    fixture.detectChanges();
    const thoughtsBtn = nativeEl.querySelector('.window-thoughts-btn');
    expect(thoughtsBtn).toBeTruthy();
    expect(thoughtsBtn?.textContent?.trim()).toContain('ⓘ');
  });

  describe('thought linking', () => {
    it('should accept a relatedThoughts input (array of slugs)', () => {
      host.relatedThoughts.set(['signals', 'httpresource']);
      fixture.detectChanges();
      const thoughtsBtn = nativeEl.querySelector('.window-thoughts-btn');
      expect(thoughtsBtn).toBeTruthy();
    });

    it('should hide the ⓘ button when relatedThoughts is empty', () => {
      host.relatedThoughts.set([]);
      fixture.detectChanges();
      const thoughtsBtn = nativeEl.querySelector('.window-thoughts-btn');
      expect(thoughtsBtn).toBeNull();
    });

    it('should show the ⓘ button when relatedThoughts has entries', () => {
      host.relatedThoughts.set(['signals']);
      fixture.detectChanges();
      const thoughtsBtn = nativeEl.querySelector('.window-thoughts-btn');
      expect(thoughtsBtn).toBeTruthy();
    });

    it('should emit thoughtRequested with the first related slug when ⓘ is clicked', () => {
      host.relatedThoughts.set(['signals', 'httpresource']);
      fixture.detectChanges();
      const thoughtsBtn = nativeEl.querySelector('.window-thoughts-btn') as HTMLElement;
      thoughtsBtn.click();
      expect(host.onThoughtRequested).toHaveBeenCalledWith('signals');
    });
  });
});
