import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadmeApp } from './readme-app';

describe('ReadmeApp', () => {
  let fixture: ComponentFixture<ReadmeApp>;
  let nativeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadmeApp],
    }).compileComponents();

    fixture = TestBed.createComponent(ReadmeApp);
    fixture.detectChanges();
    nativeEl = fixture.nativeElement as HTMLElement;
  });

  describe('shortcuts help', () => {
    it('advertises the ⌃⌥ chords the desktop actually listens for', () => {
      const shortcutItems = Array.from(nativeEl.querySelectorAll('li'))
        .map((li) => li.textContent!.replace(/\s+/g, ' ').trim())
        .filter((text) => text.includes('⌃'));

      expect(shortcutItems).toEqual([
        '⌃ + ⌥ + Space — Spotlight search',
        '⌃ + ⌥ + W — Close window',
        '⌃ + ⌥ + Q — Quit app',
        '⌃ + ⌥ + H — Minimize window',
        '⌃ + ⌥ + Tab — Cycle focus',
      ]);
    });

    it('does not advertise reserved ⌘ chords the site never receives', () => {
      expect(nativeEl.textContent).not.toContain('⌘');
    });
  });
});
