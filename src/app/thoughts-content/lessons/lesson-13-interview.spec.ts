import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { INTERVIEW_BANK } from './interview-bank';
import { LESSON_PAGES } from './lessons';
import { Lesson13Interview } from './lesson-13-interview';

expect.extend(axeMatchers);

describe('Lesson13Interview', () => {
  let fixture: ComponentFixture<Lesson13Interview>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson13Interview] }).compileComponents();
    fixture = TestBed.createComponent(Lesson13Interview);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-13-interview']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls, practice and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining([
        'Simple',
        'Intermediate',
        'Expert',
        'Pitfalls',
        'Practice',
        'Interview questions',
      ]),
    );
  });

  it('practises every question in the guide, starting with lesson 01', () => {
    const total = Object.values(INTERVIEW_BANK).flat().length;

    expect(el.querySelector('#practice-progress')?.textContent?.trim()).toBe(
      `${total} left, 0 known`,
    );
    expect(el.querySelector('#practice-topic')?.textContent?.trim()).toBe('Project structure');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
