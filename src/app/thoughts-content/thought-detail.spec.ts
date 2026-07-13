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
});
