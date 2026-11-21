import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { FakeIntersectionObserver } from '../../../test/fake-intersection-observer';
import { Lesson } from './lesson';
import { LessonSection } from './lesson-section';

expect.extend(axeMatchers);

@Component({
  imports: [Lesson, LessonSection],
  template: `
    <app-lesson part="01">
      <h2>Simple</h2>
      <p>First section.</p>
      <h2>Interview questions</h2>
      <p>Last section.</p>
    </app-lesson>
  `,
})
class Host {}

describe('Lesson', () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;
  let scrollIntoView: ReturnType<typeof vi.fn>;

  const tocButtons = () => [...el.querySelectorAll<HTMLButtonElement>('nav[aria-label="On this page"] button')];

  beforeEach(async () => {
    FakeIntersectionObserver.install();
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  afterEach(() => FakeIntersectionObserver.uninstall());

  it('gives each section heading an id taken from its text', () => {
    expect([...el.querySelectorAll('h2')].map((h) => h.id)).toEqual(['simple', 'interview-questions']);
  });

  it('lists the sections in an "On this page" nav', () => {
    expect(tocButtons().map((b) => b.textContent?.trim())).toEqual(['Simple', 'Interview questions']);
  });

  it('jumping to a section scrolls it into view and moves focus to it', () => {
    tocButtons()[1].click();
    const heading = el.querySelector<HTMLElement>('#interview-questions')!;
    expect(scrollIntoView.mock.contexts[0]).toBe(heading);
    expect(document.activeElement).toBe(heading);
  });

  it('marks the section in view as the current location', async () => {
    FakeIntersectionObserver.latest().report([
      { target: el.querySelector('#interview-questions')!, isIntersecting: true },
    ]);
    await fixture.whenStable();

    expect(tocButtons().map((b) => b.getAttribute('aria-current'))).toEqual([null, 'location']);
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
