import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, viewChild } from '@angular/core';
import { ContextMenuComponent, DEFAULT_DESKTOP_MENU_ITEMS } from './context-menu';
import { DesktopIconsComponent } from '../desktop-icons/desktop-icons';

@Component({
  selector: 'app-test-host',
  imports: [ContextMenuComponent, DesktopIconsComponent],
  template: `
    <div class="desktop-surface" (contextmenu)="onContextMenu($event)">
      <app-desktop-icons />
    </div>
    <app-context-menu [items]="menuItems" />
  `,
  styles: `
    .desktop-surface {
      width: 100vw;
      height: 100vh;
    }
  `,
})
class TestHostComponent {
  readonly menuItems = DEFAULT_DESKTOP_MENU_ITEMS;
  readonly contextMenu = viewChild.required(ContextMenuComponent);

  onContextMenu(event: MouseEvent) {
    // Only show if the click target is the desktop surface itself (not icons)
    const target = event.target as HTMLElement;
    if (target.closest('app-desktop-icon')) {
      return;
    }
    event.preventDefault();
    this.contextMenu().open(event.clientX, event.clientY);
  }
}

describe('Desktop context menu integration', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    hostEl = fixture.nativeElement as HTMLElement;
  });

  it('should show the context menu on right-click of the desktop surface', () => {
    const surface = hostEl.querySelector('.desktop-surface') as HTMLElement;
    surface.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: 300, clientY: 400, bubbles: true }),
    );
    fixture.detectChanges();

    const menu = hostEl.querySelector('.context-menu') as HTMLElement;
    expect(menu).toBeTruthy();
    expect(menu.style.left).toBe('300px');
    expect(menu.style.top).toBe('400px');
  });

  it('should not show the context menu on right-click over a desktop icon', () => {
    const icon = hostEl.querySelector('.desktop-icon') as HTMLElement;
    icon.dispatchEvent(new MouseEvent('contextmenu', { clientX: 50, clientY: 50, bubbles: true }));
    fixture.detectChanges();

    const menu = hostEl.querySelector('.context-menu');
    expect(menu).toBeFalsy();
  });

  it('should close the menu when clicking outside', () => {
    const surface = hostEl.querySelector('.desktop-surface') as HTMLElement;
    surface.dispatchEvent(
      new MouseEvent('contextmenu', { clientX: 100, clientY: 100, bubbles: true }),
    );
    fixture.detectChanges();
    expect(hostEl.querySelector('.context-menu')).toBeTruthy();

    // Click outside (on the surface)
    document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.detectChanges();

    expect(hostEl.querySelector('.context-menu')).toBeFalsy();
  });
});
