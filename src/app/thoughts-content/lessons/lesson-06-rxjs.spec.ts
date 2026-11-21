import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson06Rxjs } from './lesson-06-rxjs';

expect.extend(axeMatchers);

describe('Lesson06Rxjs', () => {
  let fixture: ComponentFixture<Lesson06Rxjs>;
  let el: HTMLElement;

  const text = (selector: string) => el.querySelector(selector)?.textContent ?? '';
  // Under fake timers the zoneless scheduler's own timeouts are fake too, so
  // advancing the clock is what runs change detection, not whenStable().
  const type = async (value: string) => {
    const input = el.querySelector<HTMLInputElement>('#race-query')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await vi.advanceTimersByTimeAsync(20);
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson06Rxjs] }).compileComponents();
    fixture = TestBed.createComponent(Lesson06Rxjs);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => vi.useRealTimers());

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-06-rxjs']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('typing fast leaves mergeMap showing a stale query and switchMap the current one', async () => {
    vi.useFakeTimers();
    await type('s');
    await type('si');
    await type('sig');
    await vi.advanceTimersByTimeAsync(2000);

    expect(text('#race-merge')).toContain('"s"');
    expect(text('#race-switch')).toContain('"sig"');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
