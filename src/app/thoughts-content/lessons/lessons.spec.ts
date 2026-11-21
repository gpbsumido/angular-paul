import { TestBed } from '@angular/core/testing';
import { LESSON_PAGES } from './lessons';

describe('every lesson page', () => {
  it.each(Object.keys(LESSON_PAGES))('%s has an "On this page" nav over its five sections', async (slug) => {
    const page = await LESSON_PAGES[slug]();
    const fixture = TestBed.createComponent(page);
    await fixture.whenStable();

    const entries = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('nav[aria-label="On this page"] button'),
    ].map((button) => button.textContent?.trim());
    expect(entries).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });
});
