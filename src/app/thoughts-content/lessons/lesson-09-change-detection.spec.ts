import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson09ChangeDetection } from './lesson-09-change-detection';

expect.extend(axeMatchers);

describe('Lesson09ChangeDetection', () => {
  let fixture: ComponentFixture<Lesson09ChangeDetection>;
  let el: HTMLElement;

  const visits = (selector: string) => el.querySelector(`${selector} .cd-visits`)?.textContent?.trim();
  const click = async (selector: string) => {
    el.querySelector<HTMLButtonElement>(selector)!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson09ChangeDetection] }).compileComponents();
    fixture = TestBed.createComponent(Lesson09ChangeDetection);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-09-change-detection']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('mutating an input in place updates the Eager child but leaves the OnPush child stale', async () => {
    await click('#cd-mutate');
    expect(visits('#cd-eager')).toBe('1');
    expect(visits('#cd-onpush')).toBe('0');
  });

  it('replacing the input with a new object updates both', async () => {
    await click('#cd-mutate');
    await click('#cd-replace');
    expect(visits('#cd-eager')).toBe('2');
    expect(visits('#cd-onpush')).toBe('2');
  });

  it('a signal updates the OnPush child with no input change at all', async () => {
    await click('#cd-signal');
    expect(el.querySelector('#cd-onpush .cd-likes')?.textContent?.trim()).toBe('1');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
