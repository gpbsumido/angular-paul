import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../test/a11y';
import { provideRouter, Router } from '@angular/router';
import { createMemoryStorage } from '../../test/memory-storage';
import { BROWSER_STORAGE } from '../shared/browser-storage';
import { ReadingProgressService } from './reading-progress.service';
import { ThoughtsListComponent } from './thoughts-list';
import { ThoughtsService } from './thoughts.service';

expect.extend(axeMatchers);

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

  it('links each card title to its thought, as a real href', async () => {
    const titleLink = nativeEl.querySelector<HTMLAnchorElement>('.thought-card-title a')!;
    expect(titleLink.getAttribute('href')).toMatch(/^\/thoughts\/[a-z0-9-]+$/);

    titleLink.click();
    await fixture.whenStable();
    expect(router.url).toBe(titleLink.getAttribute('href'));
  });

  it('links each tag pill to its tag page', () => {
    const tagLink = nativeEl.querySelector<HTMLAnchorElement>('.thought-card a.thought-tag')!;
    expect(tagLink.getAttribute('href')).toBe(`/thoughts/tag/${tagLink.textContent?.trim()}`);
  });

  it('filters to one tag when given one, with a way back to everything', async () => {
    fixture.componentRef.setInput('tag', 'angular-guide');
    await fixture.whenStable();

    const cards = [...nativeEl.querySelectorAll('.thought-card')];
    expect(cards.length).toBe(
      TestBed.inject(ThoughtsService).getAll().filter((t) => t.tags.includes('angular-guide')).length,
    );
    expect(nativeEl.querySelector('h2')?.textContent).toContain('angular-guide');
    expect(nativeEl.querySelector('a.thoughts-list-all')?.getAttribute('href')).toBe('/thoughts');
  });

  it('has no axe violations, including no links nested in a button', async () => {
    expect(await axe(nativeEl)).toHaveNoViolations();
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
