import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SystemPreferencesApp } from './system-preferences';
import { SettingsService } from './settings.service';

describe('SystemPreferencesApp', () => {
  let fixture: ComponentFixture<SystemPreferencesApp>;
  let component: SystemPreferencesApp;
  let nativeEl: HTMLElement;
  let settings: SettingsService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SystemPreferencesApp],
    }).compileComponents();

    settings = TestBed.inject(SettingsService);
    fixture = TestBed.createComponent(SystemPreferencesApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => localStorage.clear());

  it('should render sidebar with Appearance, Desktop & Dock, General panes', () => {
    const items = nativeEl.querySelectorAll('.settings-sidebar-item');
    const labels = Array.from(items).map((el) => el.textContent?.trim());

    expect(labels).toContain('Appearance');
    expect(labels).toContain('Desktop & Dock');
    expect(labels).toContain('General');
  });

  it('should default to showing the Appearance pane', () => {
    const activeItem = nativeEl.querySelector('.settings-sidebar-item.active');
    expect(activeItem?.textContent?.trim()).toBe('Appearance');

    const pane = nativeEl.querySelector('.settings-pane-appearance');
    expect(pane).toBeTruthy();
  });

  it('should switch to Desktop & Dock pane when clicked', () => {
    const items = nativeEl.querySelectorAll('.settings-sidebar-item') as NodeListOf<HTMLElement>;
    const dockItem = Array.from(items).find((el) => el.textContent?.trim() === 'Desktop & Dock')!;
    dockItem.click();
    fixture.detectChanges();

    expect(dockItem.classList.contains('active')).toBe(true);
    const pane = nativeEl.querySelector('.settings-pane-dock');
    expect(pane).toBeTruthy();
  });

  it('should call setTheme when the theme toggle is changed', () => {
    const spy = vi.spyOn(settings, 'setTheme');
    const lightBtn = nativeEl.querySelector('.theme-option-light') as HTMLElement;
    lightBtn.click();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith('light');
  });

  it('should update dock size via the slider', () => {
    // Switch to Desktop & Dock pane
    const items = nativeEl.querySelectorAll('.settings-sidebar-item') as NodeListOf<HTMLElement>;
    Array.from(items)
      .find((el) => el.textContent?.trim() === 'Desktop & Dock')!
      .click();
    fixture.detectChanges();

    const slider = nativeEl.querySelector('.dock-size-slider') as HTMLInputElement;
    expect(slider).toBeTruthy();

    slider.value = '72';
    slider.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(settings.dockSize()).toBe(72);
  });

  it('should reflect the current accent color from the service', () => {
    const swatch = nativeEl.querySelector('.accent-color-current') as HTMLElement;
    expect(swatch).toBeTruthy();
    expect(swatch.style.backgroundColor || swatch.style.background).toBeTruthy();
  });
});
