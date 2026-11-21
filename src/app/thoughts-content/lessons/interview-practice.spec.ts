import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { InterviewPractice, PracticeCard } from './interview-practice';

expect.extend(axeMatchers);

const CARDS: PracticeCard[] = [
  { topic: 'Signals', q: 'What is a signal?', a: 'A reactive value.' },
  { topic: 'Signals', q: 'What is computed?', a: 'A derived signal.' },
  { topic: 'Routing', q: 'What is a guard?', a: 'A function that decides navigation.' },
];

describe('InterviewPractice', () => {
  let fixture: ComponentFixture<InterviewPractice>;
  let el: HTMLElement;

  const text = (selector: string) => el.querySelector(selector)?.textContent?.trim();
  const answer = () => el.querySelector<HTMLElement>('#practice-answer');
  const click = async (selector: string) => {
    el.querySelector<HTMLElement>(selector)!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InterviewPractice] }).compileComponents();
    fixture = TestBed.createComponent(InterviewPractice);
    fixture.componentRef.setInput('cards', CARDS);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('asks the first question with its answer hidden', () => {
    expect(text('#practice-question')).toBe('What is a signal?');
    expect(text('#practice-topic')).toBe('Signals');
    expect(answer()?.hidden).toBe(true);
    expect(text('#practice-progress')).toBe('3 left, 0 known');
  });

  it('reveals the answer on demand, and says so to assistive tech', async () => {
    await click('#practice-reveal');

    expect(answer()?.hidden).toBe(false);
    expect(text('#practice-answer')).toBe('A reactive value.');
    expect(el.querySelector('#practice-reveal')?.getAttribute('aria-expanded')).toBe('true');
  });

  it('"Got it" takes the card out of the deck and hides the next answer', async () => {
    await click('#practice-reveal');
    await click('#practice-known');

    expect(text('#practice-question')).toBe('What is computed?');
    expect(answer()?.hidden).toBe(true);
    expect(text('#practice-progress')).toBe('2 left, 1 known');
  });

  it('"Ask again" sends the card to the back of the deck', async () => {
    await click('#practice-again');
    expect(text('#practice-question')).toBe('What is computed?');
    expect(text('#practice-progress')).toBe('3 left, 0 known');

    await click('#practice-known');
    await click('#practice-known');
    expect(text('#practice-question')).toBe('What is a signal?');
  });

  it('says when the deck is done, and starts over', async () => {
    for (let i = 0; i < CARDS.length; i++) await click('#practice-known');

    expect(text('#practice-progress')).toBe('0 left, 3 known');
    expect(el.querySelector('#practice-question')).toBeNull();
    await click('#practice-restart');

    expect(text('#practice-question')).toBe('What is a signal?');
    expect(text('#practice-progress')).toBe('3 left, 0 known');
  });

  it('narrows the deck to one topic', async () => {
    const select = el.querySelector<HTMLSelectElement>('#practice-filter')!;
    select.value = 'Routing';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(text('#practice-question')).toBe('What is a guard?');
    expect(text('#practice-progress')).toBe('1 left, 0 known');
  });

  it('has no axe violations with an answer showing', async () => {
    await click('#practice-reveal');
    expect(await axe(el)).toHaveNoViolations();
  });
});
