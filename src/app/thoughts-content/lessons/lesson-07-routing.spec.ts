import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson07Routing } from './lesson-07-routing';

expect.extend(axeMatchers);

describe('Lesson07Routing', () => {
  let fixture: ComponentFixture<Lesson07Routing>;
  let el: HTMLElement;

  const text = (selector: string) => el.querySelector(selector)?.textContent ?? '';
  const enterUrl = async (url: string) => {
    const input = el.querySelector<HTMLInputElement>('#route-url')!;
    input.value = url;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson07Routing] }).compileComponents();
    fixture = TestBed.createComponent(Lesson07Routing);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-07-routing']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it("matches a URL against this site's real route table and splits it the way the router does", async () => {
    await enterUrl('/thoughts/tag/rxjs?ref=dock#top');

    expect(text('#route-matched')).toContain('thoughts/tag/:tag');
    expect(text('#route-params')).toContain('tag = rxjs');
    expect(text('#route-query')).toContain('ref = dock');
    expect(text('#route-fragment')).toContain('top');
  });

  it('shows first-match-wins when the wildcard is moved to the front', async () => {
    await enterUrl('/thoughts');
    el.querySelector<HTMLInputElement>('#wildcard-first')!.click();
    await fixture.whenStable();

    expect(text('#route-matched')).toContain('**');
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
