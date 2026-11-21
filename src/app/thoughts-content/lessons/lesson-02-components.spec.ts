import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson02Components } from './lesson-02-components';

expect.extend(axeMatchers);

describe('Lesson02Components', () => {
  let fixture: ComponentFixture<Lesson02Components>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson02Components] }).compileComponents();
    fixture = TestBed.createComponent(Lesson02Components);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-02-components']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('demo: typing a label flows into the child through input()', async () => {
    const label = el.querySelector<HTMLInputElement>('#badge-label')!;
    label.value = 'Shipped';
    label.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(el.querySelector('app-demo-badge')?.textContent).toContain('Shipped');
  });

  it('demo: the child increments a model() and the parent sees it', async () => {
    el.querySelector<HTMLButtonElement>('app-demo-badge .demo-badge-bump')!.click();
    await fixture.whenStable();

    expect(el.querySelector('#badge-count-readout')?.textContent).toContain('1');
  });

  it('demo: the child emits through output() and the parent logs it', async () => {
    el.querySelector<HTMLButtonElement>('app-demo-badge .demo-badge-dismiss')!.click();
    await fixture.whenStable();

    expect(el.querySelector('.demo-log')?.textContent).toContain('dismissed');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
