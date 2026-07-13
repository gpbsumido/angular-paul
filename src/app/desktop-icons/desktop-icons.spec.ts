import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesktopIconsComponent } from './desktop-icons';

describe('DesktopIconsComponent', () => {
  let fixture: ComponentFixture<DesktopIconsComponent>;
  let component: DesktopIconsComponent;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesktopIconsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render all registered icons via @for with track', () => {
    const icons = nativeEl.querySelectorAll('app-desktop-icon');
    expect(icons.length).toBe(3);
  });

  it('should render icons for README.md, Projects, and Thoughts', () => {
    const labels = nativeEl.querySelectorAll('.desktop-icon-label');
    const labelTexts = Array.from(labels).map((el) => el.textContent?.trim());

    expect(labelTexts).toContain('README.md');
    expect(labelTexts).toContain('Projects');
    expect(labelTexts).toContain('Thoughts');
  });

  it('should deselect the previously selected icon when a different one is clicked', () => {
    const icons = nativeEl.querySelectorAll('.desktop-icon') as NodeListOf<HTMLElement>;
    // Click first icon
    icons[0].click();
    fixture.detectChanges();
    expect(icons[0].classList.contains('selected')).toBe(true);

    // Click second icon
    icons[1].click();
    fixture.detectChanges();
    expect(icons[0].classList.contains('selected')).toBe(false);
    expect(icons[1].classList.contains('selected')).toBe(true);
  });

  it('should arrange icons in a grid flowing top-right to bottom', () => {
    const container = nativeEl.querySelector('.desktop-icons-grid') as HTMLElement;
    const styles = getComputedStyle(container);

    expect(styles.display).toBe('flex');
    expect(styles.flexDirection).toBe('column');
    expect(styles.alignItems).toBe('flex-end');
  });
});
