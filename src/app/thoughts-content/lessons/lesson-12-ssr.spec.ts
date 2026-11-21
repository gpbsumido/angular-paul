import { PLATFORM_ID, TransferState } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson12Ssr, RENDERED_AT } from './lesson-12-ssr';

expect.extend(axeMatchers);

describe('Lesson12Ssr', () => {
  const origin = (fixture: ComponentFixture<Lesson12Ssr>) =>
    (fixture.nativeElement as HTMLElement).querySelector('#demo-render-origin')?.textContent?.trim();

  async function render(): Promise<ComponentFixture<Lesson12Ssr>> {
    const fixture = TestBed.createComponent(Lesson12Ssr);
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson12Ssr] }).compileComponents();
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-12-ssr']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', async () => {
    const fixture = await render();
    const headings = [...(fixture.nativeElement as HTMLElement).querySelectorAll('h2')].map((h) =>
      h.textContent?.trim(),
    );
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  it('stamps the render time into TransferState when it renders on the server', async () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    await render();

    expect(TestBed.inject(TransferState).get(RENDERED_AT, null)).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('reads the server stamp back in the browser instead of recomputing it', async () => {
    TestBed.inject(TransferState).set(RENDERED_AT, '2026-11-21T09:05:00.000Z');
    const fixture = await render();

    expect(origin(fixture)).toContain('Prerendered on the server');
    expect(origin(fixture)).toContain('Nov 21, 2026, 9:05:00 AM UTC');
  });

  it('says so when there was no server render, as after a client-side navigation', async () => {
    const fixture = await render();

    expect(origin(fixture)).toContain('Rendered in your browser');
  });

  it('has no axe violations', async () => {
    const fixture = await render();
    expect(await axe(fixture.nativeElement)).toHaveNoViolations();
  });
});
