import { UtcDatePipe } from './utc-date.pipe';

describe('UtcDatePipe', () => {
  const pipe = new UtcDatePipe();

  it('formats a YYYY-MM-DD as a medium date without shifting the day', () => {
    expect(pipe.transform('2026-06-15')).toBe('Jun 15, 2026');
    expect(pipe.transform('2026-01-01')).toBe('Jan 1, 2026');
  });

  it('fails loudly on a date it cannot parse instead of printing "Invalid Date"', () => {
    expect(() => pipe.transform('not-a-date')).toThrow(/not-a-date/);
  });
});
