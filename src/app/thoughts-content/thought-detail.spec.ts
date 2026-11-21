import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { createMemoryStorage } from '../../test/memory-storage';
import { BROWSER_STORAGE } from '../shared/browser-storage';
import { ThoughtDetailComponent } from './thought-detail';
import { ReadingProgressService } from './reading-progress.service';
import { ThoughtsListComponent } from './thoughts-list';

/**
 * Driven through the real router (RouterTestingHarness) rather than a mocked
 * ActivatedRoute. A snapshot mock can't express "the same component instance
 * receives a new :slug", which is exactly what prev/next navigation does.
 */
async function openThought(slug: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'thoughts', component: ThoughtsListComponent },
        { path: 'thoughts/:slug', component: ThoughtDetailComponent },
      ], withComponentInputBinding()),
      // A fresh store per test, so progress marked in one can't leak into the next.
      { provide: BROWSER_STORAGE, useFactory: () => createMemoryStorage() },
    ],
  });
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl(`/thoughts/${slug}`, ThoughtDetailComponent);
  await harness.fixture.whenStable();
  return { harness, component, el: harness.routeNativeElement as HTMLElement };
}

describe('ThoughtDetailComponent', () => {
  let el: HTMLElement;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    ({ el, harness } = await openThought('signals'));
  });

  it('should render the full thought content for the given route param', () => {
    expect(el.querySelector('.thought-detail-title')?.textContent?.trim()).toBe(
      'Why Angular Signals Changed Everything',
    );
    expect(el.querySelector('.thought-detail-content')?.textContent).toContain('fine-grained reactivity');
  });

  it('should show a back button that navigates to the list', async () => {
    el.querySelector<HTMLElement>('.thought-detail-back')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/thoughts');
  });

  it('should render Angular feature tags as pills/badges', () => {
    const tagTexts = [...el.querySelectorAll('.thought-tag')].map((t) => t.textContent?.trim());
    expect(tagTexts).toContain('signals');
    expect(tagTexts).toContain('angular');
  });

  it('links each tag to its tag page', () => {
    const hrefs = [...el.querySelectorAll('a.thought-tag')].map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/thoughts/tag/signals');
  });

  it('formats the date in UTC, so a YYYY-MM-DD never slips to the day before', () => {
    // 'signals' is dated 2026-06-15. JS parses that as UTC midnight, so without
    // UTC formatting any timezone west of UTC renders June 14.
    expect(el.querySelector('.thought-detail-date')?.textContent).toContain('Jun 15, 2026');
  });

  it('shows a reading time for a prose thought', () => {
    expect(el.querySelector('.thought-detail-date')?.textContent).toContain('min read');
  });

  it('should set SEO metadata for the thought', () => {
    expect(document.title).toContain('Why Angular Signals Changed Everything');
  });

  it('offers no complete toggle on a prose-only thought', () => {
    expect(el.querySelector('.lesson-complete')).toBeNull();
  });

  it('renders no lesson page or series nav for a prose-only thought', () => {
    expect(el.querySelector('[class^="lesson"]')).toBeNull();
    expect(el.querySelector('.series-nav')).toBeNull();
  });
});

describe('ThoughtDetailComponent with an interactive lesson page', () => {
  it('renders the lazily loaded lesson page under the prose', async () => {
    const { el } = await openThought('angular-01-project-structure');

    expect(el.querySelector('.thought-detail-title')?.textContent).toContain('Project structure');
    expect(el.querySelector('app-lesson-01-structure')).toBeTruthy();
  });

  it('links to the previous and next lessons in the series', async () => {
    const { el } = await openThought('angular-02-components');
    const nav = el.querySelector('nav.series-nav')!;

    expect(nav.getAttribute('aria-label')).toBe('Angular guide');
    const links = [...nav.querySelectorAll('a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/thoughts/angular-01-project-structure',
      '/thoughts/angular-03-templates',
    ]);
    expect(nav.textContent).toContain('Part 2 of');
  });

  it('has no previous link on the first lesson', async () => {
    const { el } = await openThought('angular-01-project-structure');
    const hrefs = [...el.querySelectorAll('nav.series-nav a')].map((a) => a.getAttribute('href'));

    expect(hrefs).toEqual(['/thoughts/angular-02-components']);
  });

  it('follows a param change on the same component instance (no stale snapshot)', async () => {
    const { harness, component, el } = await openThought('angular-01-project-structure');

    const reused = await harness.navigateByUrl('/thoughts/angular-02-components', ThoughtDetailComponent);
    await harness.fixture.whenStable();

    expect(reused).toBe(component);
    expect(el.querySelector('.thought-detail-title')?.textContent).toContain('Components');
    expect(el.querySelector('app-lesson-02-components')).toBeTruthy();
    expect(el.querySelector('app-lesson-01-structure')).toBeNull();
  });

  it('scrolls back to the top when the slug changes, since the component is reused', async () => {
    const { harness } = await openThought('angular-01-project-structure');
    const host = harness.routeNativeElement!.closest('app-thought-detail') as HTMLElement;
    host.scrollTop = 500;

    await harness.navigateByUrl('/thoughts/angular-02-components', ThoughtDetailComponent);
    await harness.fixture.whenStable();

    expect(host.scrollTop).toBe(0);
  });

  it('lets the reader mark a lesson complete, as a pressed toggle button', async () => {
    const { harness, el } = await openThought('angular-02-components');
    const toggle = el.querySelector<HTMLButtonElement>('button.lesson-complete')!;

    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(toggle.textContent).toContain('Mark lesson complete');

    toggle.click();
    await harness.fixture.whenStable();

    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.textContent).toContain('Completed');
    expect(TestBed.inject(ReadingProgressService).isComplete('angular-02-components')).toBe(true);
  });

  it('shows how much of the series is complete', async () => {
    const { harness, el } = await openThought('angular-01-project-structure');
    el.querySelector<HTMLButtonElement>('button.lesson-complete')!.click();
    await harness.fixture.whenStable();

    expect(el.querySelector('.series-nav-position')?.textContent).toMatch(/1 of \d+ complete/);
  });
});
