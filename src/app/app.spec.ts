import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';

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
});
