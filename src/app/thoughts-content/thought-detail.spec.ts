import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { ThoughtDetailComponent } from './thought-detail';
import { ThoughtsListComponent } from './thoughts-list';

describe('ThoughtDetailComponent', () => {
  let fixture: ComponentFixture<ThoughtDetailComponent>;
  let nativeEl: HTMLElement;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtDetailComponent],
      providers: [
        provideRouter([
          { path: 'thoughts', component: ThoughtsListComponent },
          { path: 'thoughts/:slug', component: ThoughtDetailComponent },
        ]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (key: string) => (key === 'slug' ? 'signals' : null) } },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ThoughtDetailComponent);
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render the full thought content for the given route param', () => {
    const title = nativeEl.querySelector('.thought-detail-title');
    const content = nativeEl.querySelector('.thought-detail-content');

    expect(title?.textContent?.trim()).toBe('Why Angular Signals Changed Everything');
    expect(content?.textContent).toContain('fine-grained reactivity');
  });

  it('should show a back button that navigates to the list', async () => {
    const backBtn = nativeEl.querySelector('.thought-detail-back') as HTMLElement;
    expect(backBtn).toBeTruthy();

    backBtn.click();
    await fixture.whenStable();

    expect(router.url).toBe('/thoughts');
  });

  it('should render Angular feature tags as pills/badges', () => {
    const tags = nativeEl.querySelectorAll('.thought-tag');
    expect(tags.length).toBeGreaterThan(0);

    const tagTexts = Array.from(tags).map((t) => t.textContent?.trim());
    expect(tagTexts).toContain('signals');
    expect(tagTexts).toContain('angular');
  });

  it('formats the date in UTC, so a YYYY-MM-DD never slips to the day before', () => {
    // 'signals' is dated 2026-06-15. JS parses that as UTC midnight, so without
    // the 'UTC' argument any timezone west of UTC renders June 14.
    expect(nativeEl.querySelector('.thought-detail-date')?.textContent).toContain('Jun 15, 2026');
  });

  it('shows a reading time for a prose thought', () => {
    expect(nativeEl.querySelector('.thought-detail-date')?.textContent).toContain('min read');
  });

  it('should set SEO metadata for the thought', () => {
    expect(document.title).toContain('Why Angular Signals Changed Everything');
  });
});

describe('ThoughtDetailComponent with an interactive lesson page', () => {
  it('renders the lazily loaded lesson page under the prose', async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'slug' ? 'angular-01-project-structure' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ThoughtDetailComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.thought-detail-title')?.textContent).toContain('Project structure');
    expect(el.querySelector('app-lesson-01-structure')).toBeTruthy();
  });

  it('renders no lesson page for a prose-only thought', async () => {
    await TestBed.configureTestingModule({
      imports: [ThoughtDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'signals' } } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ThoughtDetailComponent);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('[class^="lesson"]')).toBeNull();
  });
});
