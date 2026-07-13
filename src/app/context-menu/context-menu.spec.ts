import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextMenuComponent, ContextMenuItem } from './context-menu';

describe('ContextMenuComponent', () => {
  let fixture: ComponentFixture<ContextMenuComponent>;
  let component: ContextMenuComponent;
  let nativeEl: HTMLElement;

  const testItems: ContextMenuItem[] = [
    { id: 'new-folder', label: 'New Folder', disabled: true },
    { id: 'separator-1', type: 'separator' },
    { id: 'get-info', label: 'Get Info' },
    { id: 'change-bg', label: 'Change Desktop Background...' },
    { id: 'separator-2', type: 'separator' },
    { id: 'view-thoughts', label: 'View Thoughts' },
    { id: 'about', label: 'About This Mac' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenuComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', testItems);
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should not be visible by default', () => {
    const menu = nativeEl.querySelector('.context-menu');
    expect(menu).toBeFalsy();
  });

  it('should show at cursor coordinates when opened', () => {
    component.open(150, 200);
    fixture.detectChanges();

    const menu = nativeEl.querySelector('.context-menu') as HTMLElement;
    expect(menu).toBeTruthy();
    expect(menu.style.left).toBe('150px');
    expect(menu.style.top).toBe('200px');
  });

  it('should render all provided items via @for', () => {
    component.open(0, 0);
    fixture.detectChanges();

    const items = nativeEl.querySelectorAll('.context-menu-item');
    const separators = nativeEl.querySelectorAll('.context-menu-separator');

    // 5 regular items + 2 separators = 7 total entries
    expect(items.length).toBe(5);
    expect(separators.length).toBe(2);
  });

  it('should emit an action event with the item action ID when clicked', () => {
    component.open(0, 0);
    fixture.detectChanges();

    let emittedId: string | undefined;
    component.action.subscribe((id: string) => (emittedId = id));

    const getInfoItem = nativeEl.querySelectorAll('.context-menu-item')[1] as HTMLElement;
    getInfoItem.click();
    fixture.detectChanges();

    expect(emittedId).toBe('get-info');
  });

  it('should close after a menu item is clicked', () => {
    component.open(0, 0);
    fixture.detectChanges();

    const getInfoItem = nativeEl.querySelectorAll('.context-menu-item')[1] as HTMLElement;
    getInfoItem.click();
    fixture.detectChanges();

    const menu = nativeEl.querySelector('.context-menu');
    expect(menu).toBeFalsy();
  });

  it('should close when close() is called', () => {
    component.open(100, 100);
    fixture.detectChanges();
    expect(nativeEl.querySelector('.context-menu')).toBeTruthy();

    component.close();
    fixture.detectChanges();
    expect(nativeEl.querySelector('.context-menu')).toBeFalsy();
  });

  it('should render disabled items but not emit events when clicked', () => {
    component.open(0, 0);
    fixture.detectChanges();

    let emittedId: string | undefined;
    component.action.subscribe((id: string) => (emittedId = id));

    const disabledItem = nativeEl.querySelector('.context-menu-item.disabled') as HTMLElement;
    expect(disabledItem).toBeTruthy();
    expect(disabledItem.textContent?.trim()).toBe('New Folder');

    disabledItem.click();
    fixture.detectChanges();

    expect(emittedId).toBeUndefined();
  });
});
