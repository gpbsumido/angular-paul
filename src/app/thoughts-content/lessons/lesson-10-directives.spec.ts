import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson10Directives } from './lesson-10-directives';

expect.extend(axeMatchers);

describe('Lesson10Directives', () => {
  let fixture: ComponentFixture<Lesson10Directives>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson10Directives] }).compileComponents();
    fixture = TestBed.createComponent(Lesson10Directives);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-10-directives']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('a custom structural directive adds and removes its template', async () => {
    expect(el.querySelector('#demo-unless-content')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('#demo-unless-toggle')!.click();
    await fixture.whenStable();
    expect(el.querySelector('#demo-unless-content')).toBeNull();

    el.querySelector<HTMLButtonElement>('#demo-unless-toggle')!.click();
    await fixture.whenStable();
    expect(el.querySelector('#demo-unless-content')).not.toBeNull();
  });

  it('a host directive styles the component it is composed into, through an aliased input', async () => {
    const select = el.querySelector<HTMLSelectElement>('#demo-chip-color')!;
    select.value = 'gold';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(el.querySelector<HTMLElement>('#demo-chip')!.style.backgroundColor).toBe('gold');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
