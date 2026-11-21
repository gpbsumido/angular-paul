import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { KeyboardShortcutService } from './shared/keyboard-shortcut.service';

@Component({ template: '' })
class StubThought {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', pathMatch: 'full', children: [] },
          { path: 'thoughts', component: StubThought },
          { path: 'thoughts/:slug', component: StubThought },
        ]),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  describe('related thoughts', () => {
    // The template calls this for every open window on every change detection
    // pass. A new array each time would be a new input value each time.
    it('hands a window the same array on every call', () => {
      const app = TestBed.createComponent(App).componentInstance;

      expect(app.getRelatedThoughts('projects')).toBe(app.getRelatedThoughts('projects'));
      expect(app.getRelatedThoughts('no-such-app')).toBe(app.getRelatedThoughts('no-such-app'));
    });

    it('still lists the thoughts tied to an app, and none for an unknown one', () => {
      const app = TestBed.createComponent(App).componentInstance;

      expect(app.getRelatedThoughts('projects').length).toBeGreaterThan(0);
      expect(app.getRelatedThoughts('no-such-app')).toEqual([]);
    });
  });

  describe('thoughts reader overlay', () => {
    let fixture: ComponentFixture<App>;
    let router: Router;

    beforeEach(() => {
      router = TestBed.inject(Router);
      fixture = TestBed.createComponent(App);
      fixture.detectChanges();
    });

    it('keeps the reader closed on the desktop route', () => {
      const reader = fixture.nativeElement.querySelector('.thoughts-reader');
      expect(reader).toBeTruthy();
      expect(reader.classList.contains('thoughts-reader--open')).toBe(false);
    });

    it('opens the reader when navigated to a thoughts route', async () => {
      await router.navigate(['/thoughts', 'signals']);
      await fixture.whenStable();
      fixture.detectChanges();

      const reader = fixture.nativeElement.querySelector('.thoughts-reader');
      expect(reader.classList.contains('thoughts-reader--open')).toBe(true);
    });

    it('closes back to the desktop route', async () => {
      await router.navigate(['/thoughts']);
      await fixture.whenStable();
      fixture.detectChanges();

      fixture.componentInstance.closeThoughts();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(router.url).toBe('/');
      const reader = fixture.nativeElement.querySelector('.thoughts-reader');
      expect(reader.classList.contains('thoughts-reader--open')).toBe(false);
    });
  });

  describe('global keyboard shortcuts', () => {
    const press = (init: KeyboardEventInit) => {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
      document.dispatchEvent(event);
      return event;
    };

    it('opens Spotlight on one ⌃⌥Space (each keydown is handled exactly once)', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      const shortcuts = TestBed.inject(KeyboardShortcutService);

      press({ code: 'Space', key: ' ', ctrlKey: true, altKey: true });

      expect(shortcuts.spotlightOpen()).toBe(true);
    });

    it('leaves ⌘Space to the browser and macOS', () => {
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      const event = press({ code: 'Space', key: ' ', metaKey: true });

      expect(event.defaultPrevented).toBe(false);
    });
  });
});
