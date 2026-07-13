import { TestBed } from '@angular/core/testing';
import { ThoughtsService } from './thoughts.service';

describe('ThoughtsService', () => {
  let service: ThoughtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThoughtsService);
  });

  it('returns all thought entries sorted by date newest first', () => {
    const thoughts = service.getAll();

    expect(thoughts.length).toBeGreaterThan(0);

    for (let i = 1; i < thoughts.length; i++) {
      const prev = new Date(thoughts[i - 1].date).getTime();
      const curr = new Date(thoughts[i].date).getTime();
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('getBySlug returns the matching thought', () => {
    const thought = service.getBySlug('signals');

    expect(thought).toBeDefined();
    expect(thought?.slug).toBe('signals');
    expect(thought?.title).toBe('Why Angular Signals Changed Everything');
  });

  it('getBySlug returns undefined for a non-existent slug', () => {
    const thought = service.getBySlug('does-not-exist');

    expect(thought).toBeUndefined();
  });

  it('getByTag returns all thoughts with that tag', () => {
    const thoughts = service.getByTag('angular');

    expect(thoughts.length).toBeGreaterThan(0);
    for (const thought of thoughts) {
      expect(thought.tags).toContain('angular');
    }
  });

  it('getByTag returns empty array for unknown tag', () => {
    const thoughts = service.getByTag('nonexistent-tag-xyz');

    expect(thoughts).toEqual([]);
  });
});
