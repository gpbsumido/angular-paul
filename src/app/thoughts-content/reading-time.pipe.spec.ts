import { ReadingTimePipe } from './reading-time.pipe';

describe('ReadingTimePipe', () => {
  const pipe = new ReadingTimePipe();
  const words = (count: number) => Array.from({ length: count }, () => 'word').join(' ');

  it('rounds up at 200 words a minute', () => {
    expect(pipe.transform(words(200))).toBe('1 min read');
    expect(pipe.transform(words(201))).toBe('2 min read');
  });

  it('never reports zero, and ignores extra whitespace', () => {
    expect(pipe.transform('')).toBe('1 min read');
    expect(pipe.transform('  one \n\n two   ')).toBe('1 min read');
  });
});
