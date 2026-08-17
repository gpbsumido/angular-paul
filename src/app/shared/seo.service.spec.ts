import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ThoughtEntry } from '../thoughts-content/thoughts-data';
import { SITE_NAME, SeoService } from './seo.service';

const THOUGHT: ThoughtEntry = {
  slug: 'signals',
  title: 'Why Angular Signals Changed Everything',
  date: '2026-06-15',
  summary: 'Signals replaced Zone.js change detection with fine-grained reactivity.',
  tags: ['signals', 'reactivity', 'angular'],
};

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);

    doc.querySelectorAll('script[type="application/ld+json"]').forEach((n) => n.remove());
    doc.querySelectorAll('link[rel="canonical"]').forEach((n) => n.remove());
  });

  describe('setThoughtMeta', () => {
    beforeEach(() => service.setThoughtMeta(THOUGHT));

    it('sets a page title with the thought name and the site name', () => {
      expect(title.getTitle()).toContain(THOUGHT.title);
      expect(title.getTitle()).toContain(SITE_NAME);
    });

    it('sets description and keywords meta from the thought', () => {
      expect(meta.getTag('name="description"')?.content).toBe(THOUGHT.summary);
      expect(meta.getTag('name="keywords"')?.content).toContain('signals');
    });

    it('sets Open Graph article tags and a canonical URL for the slug', () => {
      expect(meta.getTag('property="og:type"')?.content).toBe('article');
      expect(meta.getTag('property="og:title"')?.content).toContain(THOUGHT.title);
      expect(meta.getTag('property="og:url"')?.content).toContain('/thoughts/signals');

      const canonical = doc.querySelector('link[rel="canonical"]');
      expect(canonical?.getAttribute('href')).toContain('/thoughts/signals');
    });

    it('injects BlogPosting JSON-LD structured data', () => {
      const script = doc.querySelector('script[type="application/ld+json"]');
      expect(script).toBeTruthy();

      const data = JSON.parse(script!.textContent ?? '{}');
      expect(data['@type']).toBe('BlogPosting');
      expect(data.headline).toBe(THOUGHT.title);
      expect(data.datePublished).toBe(THOUGHT.date);
    });
  });

  describe('setListMeta', () => {
    it('sets the list title and removes any stale JSON-LD', () => {
      service.setThoughtMeta(THOUGHT);
      service.setListMeta();

      expect(title.getTitle()).toContain('Thoughts');
      expect(title.getTitle()).toContain(SITE_NAME);
      expect(doc.querySelector('script[type="application/ld+json"]')).toBeNull();
    });
  });
});
