import { TestBed } from '@angular/core/testing';
import { ThoughtsService } from './thoughts.service';

describe('mac-menu-bar thought entry', () => {
  let service: ThoughtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThoughtsService);
  });

  it('is registered and resolvable by slug', () => {
    const thought = service.getBySlug('mac-menu-bar');

    expect(thought).toBeDefined();
    expect(thought?.slug).toBe('mac-menu-bar');
    expect(thought?.title).toBe('The macOS Menu Bar as Derived State');
    expect(thought?.relatedApp).toBe('about');
  });

  it('is tagged so it surfaces under the signals/architecture topics', () => {
    const thought = service.getBySlug('mac-menu-bar');

    expect(thought?.tags).toContain('signals');
    expect(thought?.tags).toContain('architecture');
  });

  it('surfaces via getByTag alongside the other signals write-ups', () => {
    const slugs = service.getByTag('signals').map((t) => t.slug);

    expect(slugs).toContain('mac-menu-bar');
  });

  it('documents the derived-state design of the menu bar', () => {
    const content = service.getBySlug('mac-menu-bar')?.content ?? '';

    // The core thesis: the menu model is a computed projection, not hand-kept UI.
    expect(content).toContain('computed signal');
    expect(content).toContain('MenuBarService');
    expect(content).toContain('execute(id)');
    expect(content).toContain('Finder');
  });
});
