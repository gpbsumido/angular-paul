import { TestBed } from '@angular/core/testing';
import { createMemoryStorage } from '../../test/memory-storage';
import { BROWSER_STORAGE } from '../shared/browser-storage';
import { ReadingProgressService } from './reading-progress.service';

const KEY = 'reading-progress';

function createService(storage: Storage | null) {
  TestBed.configureTestingModule({ providers: [{ provide: BROWSER_STORAGE, useValue: storage }] });
  return TestBed.inject(ReadingProgressService);
}

describe('ReadingProgressService', () => {
  it('starts with nothing complete', () => {
    const progress = createService(createMemoryStorage());
    expect(progress.isComplete('angular-01-project-structure')).toBe(false);
    expect(progress.completedSlugs().size).toBe(0);
  });

  it('toggles a slug complete and back', () => {
    const progress = createService(createMemoryStorage());

    progress.toggleComplete('angular-01-project-structure');
    expect(progress.isComplete('angular-01-project-structure')).toBe(true);

    progress.toggleComplete('angular-01-project-structure');
    expect(progress.isComplete('angular-01-project-structure')).toBe(false);
  });

  it('saves through the injected storage, not the global localStorage', () => {
    const storage = createMemoryStorage();
    const progress = createService(storage);

    progress.toggleComplete('angular-02-components');

    expect(JSON.parse(storage.getItem(KEY)!)).toEqual(['angular-02-components']);
  });

  it('restores what was saved', () => {
    const progress = createService(
      createMemoryStorage({ [KEY]: JSON.stringify(['angular-03-templates']) }),
    );
    expect(progress.isComplete('angular-03-templates')).toBe(true);
  });

  it('works without storage (on the server), keeping progress in memory', () => {
    const progress = createService(null);
    progress.toggleComplete('angular-04-signals');
    expect(progress.isComplete('angular-04-signals')).toBe(true);
  });

  it('throws on a saved value that is not a list of slugs, rather than silently resetting', () => {
    expect(() => createService(createMemoryStorage({ [KEY]: '{"oops":true}' }))).toThrow(
      /reading-progress/,
    );
  });
});
