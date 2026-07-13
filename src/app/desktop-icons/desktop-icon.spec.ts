import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesktopIconComponent } from './desktop-icon';

describe('DesktopIconComponent', () => {
  let fixture: ComponentFixture<DesktopIconComponent>;
  let component: DesktopIconComponent;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesktopIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopIconComponent);
    component = fixture.componentInstance;
  });

  it('should render an icon image and label from signal inputs', () => {
    fixture.componentRef.setInput('id', 'readme');
    fixture.componentRef.setInput('icon', '📄');
    fixture.componentRef.setInput('label', 'README.md');
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;

    const icon = nativeEl.querySelector('.desktop-icon-image');
    const label = nativeEl.querySelector('.desktop-icon-label');

    expect(icon?.textContent?.trim()).toBe('📄');
    expect(label?.textContent?.trim()).toBe('README.md');
  });

  it('should add a selected CSS class when single-clicked', () => {
    fixture.componentRef.setInput('id', 'readme');
    fixture.componentRef.setInput('icon', '📄');
    fixture.componentRef.setInput('label', 'README.md');
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;

    const iconEl = nativeEl.querySelector('.desktop-icon') as HTMLElement;
    iconEl.click();
    fixture.detectChanges();

    expect(iconEl.classList.contains('selected')).toBe(true);
  });

  it('should emit a launched event with the app ID on double-click', () => {
    fixture.componentRef.setInput('id', 'readme');
    fixture.componentRef.setInput('icon', '📄');
    fixture.componentRef.setInput('label', 'README.md');
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;

    let launchedId: string | undefined;
    component.launched.subscribe((id: string) => (launchedId = id));

    const iconEl = nativeEl.querySelector('.desktop-icon') as HTMLElement;
    iconEl.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    fixture.detectChanges();

    expect(launchedId).toBe('readme');
  });
});
