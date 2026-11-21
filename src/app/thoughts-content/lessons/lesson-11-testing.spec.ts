import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson11Testing } from './lesson-11-testing';

expect.extend(axeMatchers);

describe('Lesson11Testing', () => {
  let fixture: ComponentFixture<Lesson11Testing>;
  let el: HTMLElement;

  const summary = () => el.querySelector('#demo-test-summary')?.textContent?.trim();
  const click = async (selector: string) => {
    el.querySelector<HTMLElement>(selector)!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson11Testing] }).compileComponents();
    fixture = TestBed.createComponent(Lesson11Testing);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-11-testing']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it("runs the real notBlank validator's tests in the page, and they pass", async () => {
    await click('#demo-run-tests');
    expect(summary()).toBe('3 passed');
  });

  it('putting the lesson 08 bug back makes exactly the whitespace test fail', async () => {
    await click('#demo-break');
    await click('#demo-run-tests');

    expect(summary()).toBe('1 failed, 2 passed');
    const failures = [...el.querySelectorAll('.demo-test-result')].filter((li) =>
      li.textContent?.includes('FAIL'),
    );
    expect(failures.map((li) => li.textContent)).toEqual([expect.stringContaining('only spaces')]);
  });

  it('has no axe violations, with results showing', async () => {
    await click('#demo-break');
    await click('#demo-run-tests');
    expect(await axe(el)).toHaveNoViolations();
  });
});
