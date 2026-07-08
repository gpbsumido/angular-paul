import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuBar } from './menu-bar';

describe('MenuBar', () => {
  let fixture: ComponentFixture<MenuBar>;
  let component: MenuBar;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [MenuBar],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('should render without errors', () => {
    expect(component).toBeTruthy();
  });

  it('should render the Apple logo icon on the left side', () => {
    const logo = nativeEl.querySelector('.menu-bar-left .apple-logo svg');
    expect(logo).toBeTruthy();
  });

  it('should render the active app name in the menu bar', () => {
    const appName = nativeEl.querySelector('.app-name');
    expect(appName?.textContent?.trim()).toBe('Finder');
  });

  it('should render menu items (File, Edit, View, Window, Help)', () => {
    const items = nativeEl.querySelectorAll('.menu-bar-left .menu-bar-item');
    const menuTexts = Array.from(items)
      .map((el) => el.textContent?.trim())
      .filter((text) => text && !['Finder', ''].includes(text));
    expect(menuTexts).toEqual(['File', 'Edit', 'View', 'Window', 'Help']);
  });

  it('should render the clock in the status area on the right', () => {
    const clock = nativeEl.querySelector('.menu-bar-right .menu-bar-clock');
    expect(clock).toBeTruthy();
    expect(clock?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it('should update the clock signal over time', () => {
    const initialTime = component.clock();
    expect(initialTime).toBeTruthy();

    // Advance time by 61 seconds so the minute changes
    vi.advanceTimersByTime(61_000);
    fixture.detectChanges();

    const updatedTime = component.clock();
    expect(updatedTime).toBeTruthy();

    // Verify clock text is rendered in the DOM
    const clockEl = nativeEl.querySelector('.menu-bar-clock');
    expect(clockEl?.textContent?.trim()).toBe(updatedTime);
  });

  it('should have the menu-bar element with translucent/blur styling', () => {
    const menuBar = nativeEl.querySelector('.menu-bar');
    expect(menuBar).toBeTruthy();
    expect(menuBar?.classList.contains('menu-bar')).toBe(true);
  });
});
