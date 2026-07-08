import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Desktop } from './desktop';

describe('Desktop', () => {
  let fixture: ComponentFixture<Desktop>;
  let component: Desktop;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Desktop],
    }).compileComponents();

    fixture = TestBed.createComponent(Desktop);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render without errors', () => {
    expect(component).toBeTruthy();
  });

  it('should have position fixed with inset 0 on the host element', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const styles = getComputedStyle(hostEl);
    expect(styles.position).toBe('fixed');
    expect(styles.inset).toBe('0px');
  });

  it('should fill the full viewport (display block on host)', () => {
    const hostEl = fixture.nativeElement as HTMLElement;
    const styles = getComputedStyle(hostEl);
    expect(styles.display).toBe('block');
  });

  it('should hold the default wallpaper gradient value', () => {
    expect(component.wallpaper()).toBe(
      'linear-gradient(145deg, #1c1c1e 0%, #232336 30%, #2c2c2e 55%, #1a1a2e 80%, #141420 100%)',
    );
  });

  it('should update the rendered background when the wallpaper signal changes', () => {
    const wallpaperDiv = (fixture.nativeElement as HTMLElement).querySelector(
      '.desktop-wallpaper',
    ) as HTMLElement;

    // Verify initial binding is applied
    expect(wallpaperDiv.style.background).toContain('linear-gradient');

    // Change the wallpaper signal
    const newWallpaper = 'linear-gradient(to right, #000000, #333333)';
    component.wallpaper.set(newWallpaper);
    fixture.detectChanges();

    // Browser normalizes hex to rgb()
    expect(wallpaperDiv.style.background).toContain('rgb(0, 0, 0)');
    expect(wallpaperDiv.style.background).toContain('rgb(51, 51, 51)');
  });
});
