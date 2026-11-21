import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { createMemoryStorage } from '../../test/memory-storage';
import { BROWSER_STORAGE } from '../shared/browser-storage';
import { ReadingProgressService } from './reading-progress.service';
import { ThoughtsListComponent } from './thoughts-list';
import { ThoughtsService } from './thoughts.service';

describe('ThoughtsListComponent', () => {
  let fixture: ComponentFixture<ThoughtsListComponent>;
  let nativeEl: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtsListComponent],
      providers: [
        provideRouter([
          { path: 'thoughts', component: ThoughtsListComponent },
          { path: 'thoughts/:slug', component: ThoughtsListComponent },
        ]),
        { provide: BROWSER_STORAGE, useFactory: () => createMemoryStorage() },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ThoughtsListComponent);
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('formats card dates in UTC, like the reader does', () => {
    const dates = [...nativeEl.querySelectorAll('.thought-card-date')].map((d) => d.textContent);
    expect(dates).toContain('Jun 15, 2026');
  });

  it('should render a card for each thought entry', () => {
    const service = TestBed.inject(ThoughtsService);
    const cards = nativeEl.querySelectorAll('.thought-card');
    expect(cards.length).toBe(service.getAll().length);
  });

  it('should display title, date, tags, and preview on each card', () => {
    const firstCard = nativeEl.querySelector('.thought-card') as HTMLElement;
    expect(firstCard.querySelector('.thought-card-title')?.textContent?.trim()).toBeTruthy();
    expect(firstCard.querySelector('.thought-card-date')?.textContent?.trim()).toBeTruthy();
    expect(firstCard.querySelectorAll('.thought-tag').length).toBeGreaterThan(0);
    expect(firstCard.querySelector('.thought-card-preview')?.textContent?.trim()).toBeTruthy();
  });

  it('should navigate to /thoughts/:slug when a card is clicked', async () => {
    const firstCard = nativeEl.querySelector('.thought-card') as HTMLElement;
    firstCard.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toMatch(/\/thoughts\/.+/);
  });

  it('should set SEO metadata for the thoughts list', () => {
    expect(document.title).toContain('Thoughts');
  });

  it('badges the cards of completed lessons', async () => {
    TestBed.inject(ReadingProgressService).toggleComplete('angular-02-components');
    await fixture.whenStable();

    const badges = [...nativeEl.querySelectorAll('.thought-card-complete')];
    expect(badges.length).toBe(1);
    expect(badges[0].closest('.thought-card')?.textContent).toContain('Angular 02');
    expect(badges[0].textContent).toContain('Completed');
  });
});
