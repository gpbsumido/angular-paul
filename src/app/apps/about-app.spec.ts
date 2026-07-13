import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutApp } from './about-app';

describe('AboutApp', () => {
  let fixture: ComponentFixture<AboutApp>;
  let component: AboutApp;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutApp],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutApp);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  it('should render the developer name and title', () => {
    const name = nativeEl.querySelector('.about-name');
    const title = nativeEl.querySelector('.about-title');

    expect(name?.textContent?.trim()).toBe('Paul Sumido');
    expect(title?.textContent?.trim()).toBe('Software Engineer');
  });

  it('should render a profile icon/avatar at the top', () => {
    const avatar = nativeEl.querySelector('.about-avatar');
    expect(avatar).toBeTruthy();
  });

  it('should show three tabs: Overview, Skills, Experience', () => {
    const tabs = nativeEl.querySelectorAll('.about-tab');
    const labels = Array.from(tabs).map((t) => t.textContent?.trim());

    expect(labels).toEqual(['Overview', 'Skills', 'Experience']);
  });

  it('should default to the Overview tab content', () => {
    const activeTab = nativeEl.querySelector('.about-tab.active');
    expect(activeTab?.textContent?.trim()).toBe('Overview');

    const content = nativeEl.querySelector('.about-tab-content');
    expect(content?.querySelector('.about-overview')).toBeTruthy();
  });

  it('should show skills list when Skills tab is clicked', () => {
    const tabs = nativeEl.querySelectorAll('.about-tab') as NodeListOf<HTMLElement>;
    tabs[1].click();
    fixture.detectChanges();

    const activeTab = nativeEl.querySelector('.about-tab.active');
    expect(activeTab?.textContent?.trim()).toBe('Skills');

    const content = nativeEl.querySelector('.about-tab-content');
    expect(content?.querySelector('.skills-list')).toBeTruthy();
  });

  it('should show experience content when Experience tab is clicked', () => {
    const tabs = nativeEl.querySelectorAll('.about-tab') as NodeListOf<HTMLElement>;
    tabs[2].click();
    fixture.detectChanges();

    const activeTab = nativeEl.querySelector('.about-tab.active');
    expect(activeTab?.textContent?.trim()).toBe('Experience');

    const content = nativeEl.querySelector('.about-tab-content');
    expect(content?.querySelector('.experience-list')).toBeTruthy();
  });

  it('should use @switch to render correct content for each active tab', () => {
    // Overview (default)
    expect(nativeEl.querySelector('.about-overview')).toBeTruthy();
    expect(nativeEl.querySelector('.skills-list')).toBeFalsy();
    expect(nativeEl.querySelector('.experience-list')).toBeFalsy();

    // Skills
    component.activeTab.set('skills');
    fixture.detectChanges();
    expect(nativeEl.querySelector('.about-overview')).toBeFalsy();
    expect(nativeEl.querySelector('.skills-list')).toBeTruthy();
    expect(nativeEl.querySelector('.experience-list')).toBeFalsy();

    // Experience
    component.activeTab.set('experience');
    fixture.detectChanges();
    expect(nativeEl.querySelector('.about-overview')).toBeFalsy();
    expect(nativeEl.querySelector('.skills-list')).toBeFalsy();
    expect(nativeEl.querySelector('.experience-list')).toBeTruthy();
  });

  it('should render a thoughts link that emits a thoughtRequested event', () => {
    const link = nativeEl.querySelector('.about-thoughts-link') as HTMLElement;
    expect(link).toBeTruthy();

    let emitted = false;
    component.thoughtRequested.subscribe(() => (emitted = true));
    link.click();
    fixture.detectChanges();

    expect(emitted).toBe(true);
  });

  it('should render GitHub and LinkedIn links with correct hrefs', () => {
    const github = nativeEl.querySelector('a[href*="github.com"]') as HTMLAnchorElement;
    const linkedin = nativeEl.querySelector('a[href*="linkedin.com"]') as HTMLAnchorElement;

    expect(github).toBeTruthy();
    expect(github.href).toContain('github.com/gpbsumido');
    expect(linkedin).toBeTruthy();
    expect(linkedin.href).toContain('linkedin.com/in/paulsumido');
  });
});
