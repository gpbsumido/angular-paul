import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Dock } from './dock';
import { DockService } from '../shared/dock.service';

describe('Dock', () => {
  let fixture: ComponentFixture<Dock>;
  let component: Dock;
  let nativeEl: HTMLElement;
  let dockService: DockService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dock],
    }).compileComponents();

    dockService = TestBed.inject(DockService);
    fixture = TestBed.createComponent(Dock);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render without errors', () => {
    expect(component).toBeTruthy();
  });

  it('should render all permanent dock items via @for', () => {
    const icons = nativeEl.querySelectorAll('.dock-items:first-child .dock-icon');
    expect(icons.length).toBe(7);
  });

  it('should render an icon emoji and tooltip label for each dock item', () => {
    const firstIcon = nativeEl.querySelector('.dock-icon');
    const emoji = firstIcon?.querySelector('.dock-icon-emoji');
    const label = firstIcon?.querySelector('.dock-icon-label');

    expect(emoji?.textContent?.trim()).toBeTruthy();
    expect(label?.textContent?.trim()).toBe('Finder');
  });

  it('should call dockService.handleDockClick when a dock item is clicked', () => {
    const spy = vi.spyOn(dockService, 'handleDockClick');
    const firstIcon = nativeEl.querySelector('.dock-icon') as HTMLElement;
    firstIcon.click();

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'finder' }));
  });

  it('should show a dot indicator for running apps', () => {
    // Finder is running by default
    const icons = nativeEl.querySelectorAll('.dock-items:first-child .dock-icon');
    const finderIcon = icons[0];
    const indicator = finderIcon.querySelector('.dock-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should show a distinct active indicator for the focused app', () => {
    // Finder is focused by default
    const icons = nativeEl.querySelectorAll('.dock-items:first-child .dock-icon');
    const finderIcon = icons[0];
    const indicator = finderIcon.querySelector('.dock-indicator');
    expect(indicator?.classList.contains('dock-indicator-active')).toBe(true);
  });

  it('should show inactive indicator for running but unfocused apps', () => {
    // Launch terminal so finder becomes unfocused
    const terminal = dockService.pinnedApps().find((a) => a.id === 'terminal')!;
    dockService.launchApp(terminal);
    fixture.detectChanges();

    const icons = nativeEl.querySelectorAll('.dock-items:first-child .dock-icon');
    // Finder is index 0, should now be inactive
    const finderIndicator = icons[0].querySelector('.dock-indicator');
    expect(finderIndicator).toBeTruthy();
    expect(finderIndicator?.classList.contains('dock-indicator-active')).toBe(false);

    // Terminal is index 3, should be active
    const terminalIndicator = icons[3].querySelector('.dock-indicator');
    expect(terminalIndicator?.classList.contains('dock-indicator-active')).toBe(true);
  });

  it('should show non-pinned running apps after the separator', () => {
    // No transient apps initially, no separator
    let separator = nativeEl.querySelector('.dock-separator');
    expect(separator).toBeFalsy();

    // Launch a non-pinned app
    const unpinnedApp = {
      id: 'calculator',
      label: 'Calculator',
      icon: '🧮',
      color: '#999',
      pinned: false,
    };
    dockService.launchApp(unpinnedApp);
    fixture.detectChanges();

    separator = nativeEl.querySelector('.dock-separator');
    expect(separator).toBeTruthy();

    const recentIcons = nativeEl.querySelectorAll('.dock-recent .dock-icon');
    expect(recentIcons.length).toBe(1);
    expect(recentIcons[0].querySelector('.dock-icon-label')?.textContent?.trim()).toBe(
      'Calculator',
    );
  });

  it('should not show non-pinned apps after they are closed', () => {
    const unpinnedApp = {
      id: 'calculator',
      label: 'Calculator',
      icon: '🧮',
      color: '#999',
      pinned: false,
    };
    dockService.launchApp(unpinnedApp);
    fixture.detectChanges();
    expect(nativeEl.querySelector('.dock-separator')).toBeTruthy();

    dockService.closeApp('calculator');
    fixture.detectChanges();
    expect(nativeEl.querySelector('.dock-separator')).toBeFalsy();
  });
});
