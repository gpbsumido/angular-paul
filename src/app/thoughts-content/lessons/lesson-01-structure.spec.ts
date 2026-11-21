import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { checkImport, Lesson01Structure } from './lesson-01-structure';

expect.extend(axeMatchers);

describe('checkImport — the layering rules the lesson demonstrates', () => {
  it('lets the shell and features depend on shared/', () => {
    expect(checkImport('shell', 'shared', false).allowed).toBe(true);
    expect(checkImport('feature', 'shared', false).allowed).toBe(true);
  });

  it('forbids shared/ reaching up into the shell or a feature', () => {
    expect(checkImport('shared', 'shell', false).allowed).toBe(false);
    expect(checkImport('shared', 'feature', false).allowed).toBe(false);
  });

  it('forbids the shell statically importing a feature, but allows lazy import()', () => {
    expect(checkImport('shell', 'feature', false).allowed).toBe(false);
    expect(checkImport('shell', 'feature', true).allowed).toBe(true);
  });

  it('forbids one feature importing another', () => {
    expect(checkImport('feature', 'other-feature', false).allowed).toBe(false);
  });
});

describe('Lesson01Structure', () => {
  let fixture: ComponentFixture<Lesson01Structure>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson01Structure] }).compileComponents();
    fixture = TestBed.createComponent(Lesson01Structure);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('shows real code in code blocks', () => {
    expect(el.querySelector('app-code-block pre code')?.textContent).toContain('bootstrapApplication');
  });

  it('updates the verdict live when the import checker changes', async () => {
    const from = el.querySelector<HTMLSelectElement>('#import-from')!;
    const to = el.querySelector<HTMLSelectElement>('#import-to')!;
    from.value = 'shared';
    from.dispatchEvent(new Event('change'));
    to.value = 'feature';
    to.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(el.querySelector('[role="status"]')?.textContent).toContain('Not allowed');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
