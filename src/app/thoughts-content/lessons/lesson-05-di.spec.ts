import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson05Di } from './lesson-05-di';

expect.extend(axeMatchers);

describe('Lesson05Di', () => {
  let fixture: ComponentFixture<Lesson05Di>;
  let el: HTMLElement;

  const tally = (name: string) =>
    el.querySelector(`.tally-button[data-name="${name}"]`)?.textContent?.replace(/\s+/g, ' ') ?? '';
  const press = async (name: string) => {
    el.querySelector<HTMLButtonElement>(`.tally-button[data-name="${name}"]`)!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson05Di] }).compileComponents();
    fixture = TestBed.createComponent(Lesson05Di);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-05-dependency-injection']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('buttons under one provider share an instance', async () => {
    await press('A');
    expect(tally('A')).toContain('A: 1');
    expect(tally('B')).toContain('B: 1');
  });

  it('buttons under their own provider each get a fresh instance', async () => {
    await press('C');
    expect(tally('C')).toContain('C: 1');
    expect(tally('D')).toContain('D: 0');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
