import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchService);
  });

  it('search("") should return an empty results array', () => {
    const results = service.search('');
    expect(results).toEqual([]);
  });

  it('search("about") should return the About app in the Applications category', () => {
    const results = service.search('about');
    const appsGroup = results.find((g) => g.category === 'Applications');
    expect(appsGroup).toBeTruthy();
    expect(appsGroup!.items.some((item) => item.label === 'About')).toBe(true);
  });

  it('search("signals") should return thought entries tagged with "signals" in the Thoughts category', () => {
    const results = service.search('signals');
    const thoughtsGroup = results.find((g) => g.category === 'Thoughts');
    expect(thoughtsGroup).toBeTruthy();
    expect(thoughtsGroup!.items.length).toBeGreaterThan(0);
  });

  it('search("readme") should return README.md in the Files category', () => {
    const results = service.search('readme');
    const filesGroup = results.find((g) => g.category === 'Files');
    expect(filesGroup).toBeTruthy();
    expect(filesGroup!.items.some((item) => item.label === 'README.md')).toBe(true);
  });

  it('should group results by category (Applications, Thoughts, Files)', () => {
    const results = service.search('a');
    const categories = results.map((g) => g.category);
    // Each category should appear at most once
    expect(new Set(categories).size).toBe(categories.length);
    // Categories should only be known ones
    for (const cat of categories) {
      expect(['Applications', 'Thoughts', 'Files']).toContain(cat);
    }
  });

  it('should be case-insensitive', () => {
    const lower = service.search('about');
    const upper = service.search('ABOUT');
    expect(lower).toEqual(upper);
  });

  it('should support partial matches (e.g. "term" matches "Terminal")', () => {
    const results = service.search('term');
    const appsGroup = results.find((g) => g.category === 'Applications');
    expect(appsGroup).toBeTruthy();
    expect(appsGroup!.items.some((item) => item.label === 'Terminal')).toBe(true);
  });
});
