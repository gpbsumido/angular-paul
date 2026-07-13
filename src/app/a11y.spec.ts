import { ComponentFixture, TestBed } from '@angular/core/testing';
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../test/a11y';
import { Dock } from './dock/dock';
import { MenuBar } from './menu-bar/menu-bar';
import { Spotlight } from './spotlight/spotlight';
import { Window } from './window-manager/window';
import { DesktopIconComponent } from './desktop-icons/desktop-icon';
import { ContextMenuComponent } from './context-menu/context-menu';

expect.extend(axeMatchers);

describe('Accessibility (WCAG 2.1 AA)', () => {
  describe('Dock', () => {
    let fixture: ComponentFixture<Dock>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [Dock] }).compileComponents();
      fixture = TestBed.createComponent(Dock);
      fixture.detectChanges();
    });

    it('should have no axe violations', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('MenuBar', () => {
    let fixture: ComponentFixture<MenuBar>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [MenuBar] }).compileComponents();
      fixture = TestBed.createComponent(MenuBar);
      fixture.detectChanges();
    });

    it('should have no axe violations', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Spotlight', () => {
    let fixture: ComponentFixture<Spotlight>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [Spotlight] }).compileComponents();
      fixture = TestBed.createComponent(Spotlight);
      fixture.componentInstance.open();
      fixture.detectChanges();
    });

    it('should have no axe violations when open', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });

    it('should have no axe violations with search results', async () => {
      const input = fixture.nativeElement.querySelector('.spotlight-input') as HTMLInputElement;
      input.value = 'about';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Window', () => {
    let fixture: ComponentFixture<Window>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({ imports: [Window] }).compileComponents();
      fixture = TestBed.createComponent(Window);
      fixture.detectChanges();
    });

    it('should have no axe violations', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('DesktopIcon', () => {
    let fixture: ComponentFixture<DesktopIconComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [DesktopIconComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(DesktopIconComponent);
      fixture.componentRef.setInput('id', 'readme');
      fixture.componentRef.setInput('icon', '📄');
      fixture.componentRef.setInput('label', 'README.md');
      fixture.detectChanges();
    });

    it('should have no axe violations', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });

  describe('ContextMenu', () => {
    let fixture: ComponentFixture<ContextMenuComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [ContextMenuComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(ContextMenuComponent);
      fixture.componentInstance.open(100, 100);
      fixture.detectChanges();
    });

    it('should have no axe violations when open', async () => {
      const results = await axe(fixture.nativeElement);
      expect(results).toHaveNoViolations();
    });
  });
});
