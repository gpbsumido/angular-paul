import { ComponentFixture, TestBed } from '@angular/core/testing';
import * as axeMatchers from 'vitest-axe/matchers';
import { axe } from '../../../test/a11y';
import { LESSON_PAGES } from './lessons';
import { Lesson03Templates } from './lesson-03-templates';

expect.extend(axeMatchers);

describe('Lesson03Templates', () => {
  let fixture: ComponentFixture<Lesson03Templates>;
  let el: HTMLElement;

  const click = async (selector: string) => {
    el.querySelector<HTMLButtonElement>(selector)!.click();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Lesson03Templates] }).compileComponents();
    fixture = TestBed.createComponent(Lesson03Templates);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('is registered as the lesson page for its thought', () => {
    expect(LESSON_PAGES['angular-03-templates']).toBeDefined();
  });

  it('teaches at three levels, then pitfalls and interview questions', () => {
    const headings = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
    expect(headings).toEqual(
      expect.arrayContaining(['Simple', 'Intermediate', 'Expert', 'Pitfalls', 'Interview questions']),
    );
  });

  describe('property vs attribute demo', () => {
    let probe: HTMLInputElement;

    beforeEach(() => {
      probe = el.querySelector<HTMLInputElement>('#binding-probe')!;
      probe.value = 'typed by hand';
      probe.dispatchEvent(new Event('input'));
    });

    it('[attr.value] changes the attribute but not what the box shows once typed in', async () => {
      await click('#set-attribute');
      expect(probe.getAttribute('value')).toContain('attribute');
      expect(probe.value).toBe('typed by hand');
    });

    it('[value] changes what the box shows', async () => {
      await click('#set-property');
      expect(probe.value).toContain('property');
    });
  });

  describe('control flow demo', () => {
    it('removes a tag and switches the summary as the count changes', async () => {
      const summary = () => el.querySelector('#tag-summary')?.textContent ?? '';
      expect(summary()).toContain('3 tags');

      await click('.tag-remove');
      await click('.tag-remove');
      expect(summary()).toContain('One tag');

      await click('.tag-remove');
      expect(summary()).toContain('No tags');
      expect(el.querySelector('.tag-list')?.textContent).toContain('All gone');
    });
  });

  it('has no axe violations', async () => {
    expect(await axe(el)).toHaveNoViolations();
  });
});
