import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { InterviewQuestions } from './interview-questions';
import { LessonDemo } from './lesson-demo';

expect.extend(axeMatchers);

@Component({
  imports: [Callout, LessonDemo, InterviewQuestions, CodeBlock],
  template: `
    <app-callout kind="pitfall"><p>Mutating an input array</p></app-callout>
    <app-callout kind="tip"><p>Prefer input()</p></app-callout>
    <app-lesson-demo heading="Try it"><button type="button">poke</button></app-lesson-demo>
    <app-interview-questions [questions]="questions" />
    <app-code-block label="x.ts" code="const answer = 42;" (copied)="copiedCount = copiedCount + 1" />
  `,
})
class Host {
  questions = [
    { q: 'What is a standalone component?', a: 'One that declares its own imports.' },
    { q: 'input() vs @Input()?', a: 'input() returns a signal.' },
  ];
  copiedCount = 0;
}

describe('lesson building blocks', () => {
  let fixture: ComponentFixture<Host>;
  let el: HTMLElement;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('Callout projects its content and labels the kind in text, not only colour', () => {
    const [pitfall, tip] = [...el.querySelectorAll('app-callout')];
    expect(pitfall.getAttribute('role')).toBe('note');
    expect(pitfall.classList).toContain('callout--pitfall');
    expect(pitfall.textContent).toContain('Pitfall');
    expect(pitfall.textContent).toContain('Mutating an input array');
    expect(tip.textContent).toContain('Tip');
  });

  it('LessonDemo wraps projected controls in a labelled region', () => {
    const demo = el.querySelector('app-lesson-demo section')!;
    const headingId = demo.getAttribute('aria-labelledby')!;
    expect(el.querySelector(`#${headingId}`)?.textContent).toContain('Try it');
    expect(demo.querySelector('button')?.textContent).toContain('poke');
  });

  it('InterviewQuestions renders one disclosure per question', () => {
    const details = el.querySelectorAll('app-interview-questions details');
    expect(details.length).toBe(2);
    expect(details[1].querySelector('summary')?.textContent).toContain('input() vs @Input()?');
  });

  it('CodeBlock copies its code, announces it, and emits copied', async () => {
    el.querySelector<HTMLButtonElement>('app-code-block button')!.click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith('const answer = 42;');
    expect(el.querySelector('app-code-block [role="status"]')?.textContent).toContain('Copied');
    expect(fixture.componentInstance.copiedCount).toBe(1);
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
