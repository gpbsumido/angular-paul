import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ThoughtEntry } from '../thoughts-content/thoughts-data';

export const SITE_NAME = 'Paul Sumido';

/** Production origin used for canonical + Open Graph URLs. Set to the deployed domain. */
export const SITE_ORIGIN = 'https://angular.paulsumido.com';

const JSON_LD_ID = 'thought-jsonld';
const LIST_DESCRIPTION =
  'Essays on Angular — signals, zoneless change detection, SSR, and testing — by Paul Sumido.';

/**
 * Sets per-page SEO metadata (title, description, Open Graph, Twitter, canonical)
 * and JSON-LD structured data. Written to the injected DOCUMENT so it lands in the
 * server-rendered HTML for prerendered content routes.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  setThoughtMeta(thought: ThoughtEntry): void {
    const url = `${SITE_ORIGIN}/thoughts/${thought.slug}`;
    const pageTitle = `${thought.title} — ${SITE_NAME}`;

    this.title.setTitle(pageTitle);
    this.setName('description', thought.summary);
    this.setName('keywords', thought.tags.join(', '));

    this.setProperty('og:type', 'article');
    this.setProperty('og:title', pageTitle);
    this.setProperty('og:description', thought.summary);
    this.setProperty('og:url', url);

    this.setName('twitter:card', 'summary');
    this.setName('twitter:title', pageTitle);
    this.setName('twitter:description', thought.summary);

    this.setCanonical(url);

    this.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: thought.title,
      description: thought.summary,
      datePublished: thought.date,
      dateModified: thought.date,
      keywords: thought.tags.join(', '),
      url,
      author: { '@type': 'Person', name: SITE_NAME },
    });
  }

  setListMeta(): void {
    const url = `${SITE_ORIGIN}/thoughts`;
    const pageTitle = `Thoughts — ${SITE_NAME}`;

    this.title.setTitle(pageTitle);
    this.setName('description', LIST_DESCRIPTION);

    this.setProperty('og:type', 'website');
    this.setProperty('og:title', pageTitle);
    this.setProperty('og:description', LIST_DESCRIPTION);
    this.setProperty('og:url', url);

    this.setCanonical(url);
    this.removeJsonLd();
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setJsonLd(data: Record<string, unknown>): void {
    this.removeJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSON_LD_ID;
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  private removeJsonLd(): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
  }
}
