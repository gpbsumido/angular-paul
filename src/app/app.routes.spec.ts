import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { ThoughtDetailComponent } from './thoughts-content/thought-detail';
import { ThoughtsListComponent } from './thoughts-content/thoughts-list';

/**
 * The real route table with the real router features from appConfig, so
 * these catch a route that's missing, in the wrong order, or relying on a
 * router feature that isn't switched on.
 */
async function navigate(url: string) {
  TestBed.configureTestingModule({ providers: appConfig.providers });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  await harness.fixture.whenStable();
  return { harness, router: TestBed.inject(Router) };
}

describe('app routes', () => {
  it('sends an unknown URL to the desktop instead of failing the navigation', async () => {
    const { router } = await navigate('/no-such-page');
    expect(router.url).toBe('/');
  });

  it('binds :slug straight to the reader input', async () => {
    const { harness } = await navigate('/thoughts/angular-02-components');
    const reader = harness.routeDebugElement?.componentInstance;

    expect(reader).toBeInstanceOf(ThoughtDetailComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Angular 02: Components');
  });

  it('serves a tag page that lists only that tag', async () => {
    const { harness } = await navigate('/thoughts/tag/angular-guide');
    const titles = [...harness.routeNativeElement!.querySelectorAll('.thought-card-title')].map(
      (title) => title.textContent ?? '',
    );

    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(ThoughtsListComponent);
    expect(titles.length).toBeGreaterThan(0);
    expect(titles.every((title) => /Angular \d{2}:/.test(title))).toBe(true);
  });
});
