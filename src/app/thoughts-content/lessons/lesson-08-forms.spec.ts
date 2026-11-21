import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson08Forms } from './lesson-08-forms';

expect.extend(axeMatchers);

describe('Lesson08Forms', () => {
  let fixture: ComponentFixture<Lesson08Forms>;
  let el: HTMLElement;

  const text = (selector: string) => el.querySelector(selector)?.textContent ?? '';
  const type = async (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
  };
  const click = async (selector: string) => {
    el.querySelector<HTMLButtonElement>(selector)!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson08Forms] }).compileComponents();
    fixture = TestBed.createComponent(Lesson08Forms);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-08-forms']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('flags mismatched passwords with a group-level validator, and clears it when they match', async () => {
    await type('#demo-password', 'correct horse');
    await type('#demo-confirm', 'correct house');
    expect(text('#demo-mismatch')).toContain("don't match");

    await type('#demo-confirm', 'correct horse');
    expect(el.querySelector('#demo-mismatch')).toBeNull();
    expect(text('#demo-form-state')).toContain('VALID');
  });

  it('adds and removes rows in a FormArray', async () => {
    const rows = () => el.querySelectorAll('.demo-link-row').length;
    expect(rows()).toBe(1);

    await click('#demo-add-link');
    expect(rows()).toBe(2);

    await click('.demo-link-row:last-of-type .demo-remove-link');
    expect(rows()).toBe(1);
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
