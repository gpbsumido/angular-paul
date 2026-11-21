import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson04Signals } from './lesson-04-signals';

expect.extend(axeMatchers);

describe('Lesson04Signals', () => {
  let fixture: ComponentFixture<Lesson04Signals>;
  let el: HTMLElement;

  const text = (selector: string) => el.querySelector(selector)?.textContent ?? '';
  const effectRuns = () => el.querySelectorAll('.effect-log li').length;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson04Signals] }).compileComponents();
    fixture = TestBed.createComponent(Lesson04Signals);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-04-signals']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('computed total follows its inputs', async () => {
    expect(text('#signal-total')).toContain('$12');
    el.querySelector<HTMLButtonElement>('#bump-one')!.click();
    await fixture.whenStable();
    expect(text('#signal-total')).toContain('$24');
  });

  it('three synchronous writes run the effect once, with the final value', async () => {
    const before = effectRuns();
    el.querySelector<HTMLButtonElement>('#bump-three')!.click();
    await fixture.whenStable();

    expect(effectRuns()).toBe(before + 1);
    expect(text('.effect-log li:last-child')).toContain('$48');
  });

  it('linkedSignal resets the shipping choice when the country changes, but stays writable', async () => {
    const choose = async (selector: string, value: string) => {
      const select = el.querySelector<HTMLSelectElement>(selector)!;
      select.value = value;
      select.dispatchEvent(new Event('change'));
      await fixture.whenStable();
    };

    await choose('#shipping', 'Express');
    expect(text('#shipping-choice')).toContain('Express');

    await choose('#country', 'US');
    expect(text('#shipping-choice')).toContain('Ground');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
