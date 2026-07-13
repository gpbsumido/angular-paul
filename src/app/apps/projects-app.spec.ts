import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectsApp, GitHubRepo } from './projects-app';
import { ProjectsService } from './projects.service';

const MOCK_REPOS: GitHubRepo[] = [
  {
    id: 1,
    name: 'angular-paul',
    description: 'Personal portfolio site built with Angular',
    stargazers_count: 12,
    language: 'TypeScript',
    html_url: 'https://github.com/gpbsumido/angular-paul',
  },
  {
    id: 2,
    name: 'cool-project',
    description: 'A cool side project',
    stargazers_count: 5,
    language: 'Rust',
    html_url: 'https://github.com/gpbsumido/cool-project',
  },
];

describe('ProjectsApp', () => {
  let fixture: ComponentFixture<ProjectsApp>;
  let component: ProjectsApp;
  let nativeEl: HTMLElement;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsApp],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProjectsApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.flushEffects();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render a search/filter input field', () => {
    const input = nativeEl.querySelector('.projects-search input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.type).toBe('text');
  });

  it('should show a loading indicator when the resource is in loading state', () => {
    const loading = nativeEl.querySelector('.projects-loading');
    expect(loading).toBeTruthy();
  });

  it('should render project cards when data is available', async () => {
    const req = httpTesting.expectOne((r) => r.url.includes('github.com'));
    req.flush(MOCK_REPOS);
    await fixture.whenStable();
    fixture.detectChanges();

    const cards = nativeEl.querySelectorAll('.project-card');
    expect(cards.length).toBe(2);
  });

  it('should show name, description, star count, and language on each card', async () => {
    const req = httpTesting.expectOne((r) => r.url.includes('github.com'));
    req.flush(MOCK_REPOS);
    await fixture.whenStable();
    fixture.detectChanges();

    const firstCard = nativeEl.querySelector('.project-card') as HTMLElement;
    expect(firstCard.querySelector('.project-name')?.textContent?.trim()).toBe('angular-paul');
    expect(firstCard.querySelector('.project-description')?.textContent?.trim()).toContain(
      'Personal portfolio site',
    );
    expect(firstCard.querySelector('.project-stars')?.textContent).toContain('12');
    expect(firstCard.querySelector('.project-language')?.textContent?.trim()).toBe('TypeScript');
  });

  it('should show an error message when the resource is in error state', async () => {
    const req = httpTesting.expectOne((r) => r.url.includes('github.com'));
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    fixture.detectChanges();

    const error = nativeEl.querySelector('.projects-error');
    expect(error).toBeTruthy();
  });

  it('should show an empty state when no projects match the filter', async () => {
    const req = httpTesting.expectOne((r) => r.url.includes('github.com'));
    req.flush(MOCK_REPOS);
    await fixture.whenStable();
    fixture.detectChanges();

    component.searchQuery.set('zzzznonexistent');
    fixture.detectChanges();

    const empty = nativeEl.querySelector('.projects-empty');
    expect(empty).toBeTruthy();
  });

  it('should render a thoughts button that emits a thoughtRequested event', () => {
    const btn = nativeEl.querySelector('.projects-thoughts-link') as HTMLElement;
    expect(btn).toBeTruthy();

    let emitted = false;
    component.thoughtRequested.subscribe(() => (emitted = true));
    btn.click();
    fixture.detectChanges();

    expect(emitted).toBe(true);
  });
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let httpTesting: HttpTestingController;
  let fixture: ComponentFixture<ProjectsApp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsApp],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    service = TestBed.inject(ProjectsService);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProjectsApp);
    fixture.detectChanges();
  });

  it('should construct an httpResource that fetches GitHub repos', async () => {
    const req = httpTesting.expectOne((r) =>
      r.url.includes('api.github.com/users/gpbsumido/repos'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_REPOS);
    await fixture.whenStable();

    expect(service.repos.value()).toEqual(MOCK_REPOS);
  });

  it('should react to search signal changes by re-fetching', async () => {
    const req1 = httpTesting.expectOne((r) => r.url.includes('github.com'));
    req1.flush(MOCK_REPOS);
    await fixture.whenStable();

    service.search.set('angular');
    fixture.detectChanges();

    const req2 = httpTesting.expectOne((r) => r.url.includes('github.com'));
    expect(req2.request.url).toContain('angular');
    req2.flush([MOCK_REPOS[0]]);
    await fixture.whenStable();

    expect(service.repos.value()).toEqual([MOCK_REPOS[0]]);
  });
});
