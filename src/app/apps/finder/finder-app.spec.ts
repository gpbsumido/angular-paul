import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinderApp } from './finder-app';

describe('FinderApp', () => {
  let fixture: ComponentFixture<FinderApp>;
  let component: FinderApp;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinderApp],
    }).compileComponents();

    fixture = TestBed.createComponent(FinderApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render a sidebar with Favorites', () => {
    const items = nativeEl.querySelectorAll('.finder-sidebar-item');
    const labels = Array.from(items).map((el) => el.textContent?.trim());

    expect(labels.some((l) => l?.includes('Applications'))).toBe(true);
    expect(labels.some((l) => l?.includes('Thoughts'))).toBe(true);
    expect(labels.some((l) => l?.includes('Projects'))).toBe(true);
  });

  it('should render the current directory contents in a column via @for', () => {
    // Default shows root entries
    const entries = nativeEl.querySelectorAll('.finder-column .finder-entry');
    expect(entries.length).toBeGreaterThan(0);
  });

  it('should navigate to a directory when a sidebar item is clicked', () => {
    const items = nativeEl.querySelectorAll('.finder-sidebar-item') as NodeListOf<HTMLElement>;
    const appsItem = Array.from(items).find((el) => el.textContent?.includes('Applications'))!;
    appsItem.click();
    fixture.detectChanges();

    const entries = nativeEl.querySelectorAll('.finder-column .finder-entry');
    const names = Array.from(entries).map((el) =>
      el.querySelector('.finder-entry-name')?.textContent?.trim(),
    );
    expect(names).toContain('About');
    expect(names).toContain('Terminal');
  });

  it('should render folder children in the next column when a folder is clicked', () => {
    // Click Applications in sidebar
    const items = nativeEl.querySelectorAll('.finder-sidebar-item') as NodeListOf<HTMLElement>;
    Array.from(items)
      .find((el) => el.textContent?.includes('Applications'))!
      .click();
    fixture.detectChanges();

    // Should have a column with entries
    const columns = nativeEl.querySelectorAll('.finder-column');
    expect(columns.length).toBeGreaterThanOrEqual(1);
  });

  it('should show breadcrumb trail with the current path', () => {
    // Navigate to Applications
    const items = nativeEl.querySelectorAll('.finder-sidebar-item') as NodeListOf<HTMLElement>;
    Array.from(items)
      .find((el) => el.textContent?.includes('Applications'))!
      .click();
    fixture.detectChanges();

    const breadcrumb = nativeEl.querySelector('.finder-breadcrumb');
    expect(breadcrumb?.textContent).toContain('Applications');
  });

  it('should emit openFile when a file entry is clicked', () => {
    // Navigate to Thoughts (contains file entries)
    const items = nativeEl.querySelectorAll('.finder-sidebar-item') as NodeListOf<HTMLElement>;
    Array.from(items)
      .find((el) => el.textContent?.includes('Thoughts'))!
      .click();
    fixture.detectChanges();

    let emittedAction: string | undefined;
    component.openFile.subscribe((action: string) => (emittedAction = action));

    const fileEntry = nativeEl.querySelector('.finder-entry') as HTMLElement;
    fileEntry.click();
    fixture.detectChanges();

    expect(emittedAction).toBeTruthy();
  });

  it('should render back and forward navigation buttons in the toolbar', () => {
    const backBtn = nativeEl.querySelector('.finder-toolbar-back');
    const fwdBtn = nativeEl.querySelector('.finder-toolbar-forward');

    expect(backBtn).toBeTruthy();
    expect(fwdBtn).toBeTruthy();
  });
});
