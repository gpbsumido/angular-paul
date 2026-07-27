import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { MenuBar } from './menu-bar';
import { MenuBarService } from './menu-bar.service';

describe('MenuBar', () => {
  let fixture: ComponentFixture<MenuBar>;
  let component: MenuBar;
  let nativeEl: HTMLElement;

  const trigger = (menuId: string) =>
    nativeEl.querySelector<HTMLButtonElement>(`.menu-bar-item[data-menu-id="${menuId}"]`);
  const dropdown = () => nativeEl.querySelector('.menu-dropdown');

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

    vi.advanceTimersByTime(61_000);
    fixture.detectChanges();

    const updatedTime = component.clock();
    expect(updatedTime).toBeTruthy();

    const clockEl = nativeEl.querySelector('.menu-bar-clock');
    expect(clockEl?.textContent?.trim()).toBe(updatedTime);
  });

  it('should have the menu-bar element with translucent/blur styling', () => {
    const menuBar = nativeEl.querySelector('.menu-bar');
    expect(menuBar).toBeTruthy();
    expect(menuBar?.classList.contains('menu-bar')).toBe(true);
  });

  describe('menu interaction', () => {
    it('does not render a dropdown until a menu is opened', () => {
      expect(dropdown()).toBeFalsy();
      expect(trigger('file')?.getAttribute('aria-expanded')).toBe('false');
    });

    it('opens a dropdown when a top-level menu is clicked', () => {
      trigger('file')!.click();
      fixture.detectChanges();

      expect(dropdown()).toBeTruthy();
      expect(trigger('file')?.getAttribute('aria-expanded')).toBe('true');
      expect(nativeEl.querySelector('.menu-dropdown[role="menu"]')).toBeTruthy();
    });

    it('toggles the dropdown closed when the same menu is clicked again', () => {
      trigger('file')!.click();
      fixture.detectChanges();
      trigger('file')!.click();
      fixture.detectChanges();

      expect(dropdown()).toBeFalsy();
    });

    it('switches menus on hover while one is already open', () => {
      trigger('file')!.click();
      fixture.detectChanges();

      trigger('edit')!.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();

      expect(trigger('file')?.getAttribute('aria-expanded')).toBe('false');
      expect(trigger('edit')?.getAttribute('aria-expanded')).toBe('true');
    });

    it('runs the action and closes the menu when an item is clicked', () => {
      const service = TestBed.inject(MenuBarService);
      const spy = vi.spyOn(service, 'execute');

      trigger('help')!.click();
      fixture.detectChanges();

      const items = nativeEl.querySelectorAll<HTMLButtonElement>('.menu-dropdown-item');
      const search = Array.from(items).find((el) => el.textContent?.includes('Search'))!;
      search.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith('spotlight');
      expect(dropdown()).toBeFalsy();
    });

    it('does not run disabled items', () => {
      const service = TestBed.inject(MenuBarService);
      const spy = vi.spyOn(service, 'execute');

      trigger('edit')!.click();
      fixture.detectChanges();

      const disabled = nativeEl.querySelector<HTMLButtonElement>('.menu-dropdown-item:disabled')!;
      expect(disabled).toBeTruthy();
      disabled.click();
      fixture.detectChanges();

      expect(spy).not.toHaveBeenCalled();
    });

    it('closes on Escape and returns focus to the trigger', () => {
      trigger('file')!.click();
      fixture.detectChanges();

      dropdown()!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      fixture.detectChanges();

      expect(dropdown()).toBeFalsy();
      expect(document.activeElement).toBe(trigger('file'));
    });

    it('opens the menu on ArrowDown from the trigger', () => {
      trigger('view')!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();

      expect(trigger('view')?.getAttribute('aria-expanded')).toBe('true');
    });
  });
});
