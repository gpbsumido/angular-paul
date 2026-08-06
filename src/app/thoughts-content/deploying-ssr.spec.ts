import { TestBed } from '@angular/core/testing';
import { ThoughtsService } from './thoughts.service';

describe('deploying-ssr thought entry', () => {
  let service: ThoughtsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThoughtsService);
  });

  it('is registered and resolvable by slug', () => {
    const thought = service.getBySlug('deploying-ssr');

    expect(thought).toBeDefined();
    expect(thought?.slug).toBe('deploying-ssr');
    expect(thought?.title).toBe('Shipping Angular SSR to Production');
    expect(thought?.relatedApp).toBe('readme');
  });

  it('is tagged for the deployment topic', () => {
    const thought = service.getBySlug('deploying-ssr');

    expect(thought?.tags).toContain('ssr');
    expect(thought?.tags).toContain('deployment');
  });

  it('surfaces via getByTag alongside the other SSR write-ups', () => {
    const slugs = service.getByTag('ssr').map((t) => t.slug);

    expect(slugs).toContain('deploying-ssr');
    expect(slugs).toContain('hybrid-rendering');
  });

  it('documents the real deployment decisions and fixes', () => {
    const content = service.getBySlug('deploying-ssr')?.content ?? '';

    expect(content).toContain('Railway');
    expect(content).toContain('Cloudflare');
    expect(content).toContain('allowedHosts');
    expect(content).toContain('trustProxyHeaders');
  });
});
