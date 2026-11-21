import { TestBed } from '@angular/core/testing';
import { INTERVIEW_BANK } from './interview-bank';
import { LESSON_PAGES } from './lessons';

describe('INTERVIEW_BANK', () => {
  it('has questions for exactly the lessons that exist', () => {
    expect(Object.keys(INTERVIEW_BANK).sort()).toEqual(Object.keys(LESSON_PAGES).sort());
  });

  it.each(Object.entries(INTERVIEW_BANK))('%s has at least five questions', (_slug, questions) => {
    expect(questions.length).toBeGreaterThanOrEqual(5);
  });

  it('never repeats a question, since the practice deck and the lists track by its text', () => {
    const all = Object.values(INTERVIEW_BANK).flatMap((questions) => questions.map(({ q }) => q));
    const repeated = all.filter((q, index) => all.indexOf(q) !== index);
    expect(repeated).toEqual([]);
  });

  it.each(Object.keys(LESSON_PAGES))('%s renders its questions from the bank', async (slug) => {
    const fixture = TestBed.createComponent(await LESSON_PAGES[slug]());
    await fixture.whenStable();

    const summaries = [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll('app-interview-questions summary'),
    ].map((summary) => summary.textContent?.trim());
    expect(summaries).toEqual(INTERVIEW_BANK[slug].map(({ q }) => q));
  });
});
