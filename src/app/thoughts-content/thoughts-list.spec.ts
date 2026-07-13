import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
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
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ThoughtsListComponent);
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
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
});
