import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { provideServerRendering, renderApplication } from '@angular/platform-server';
import { MenuBar } from './menu-bar';

// [ng-12 ssr] A server render through the real platform-server, not TestBed.
// TestBed runs every browser-only hook, so it can't show what the server emits:
// this is the HTML a visitor receives before any JavaScript has run.
async function renderMenuBarOnServer(): Promise<string> {
  const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(
      MenuBar,
      { providers: [provideZonelessChangeDetection(), provideServerRendering()] },
      context,
    );
  return renderApplication(bootstrap, {
    document: '<html><head></head><body><app-menu-bar></app-menu-bar></body></html>',
    url: '/',
  });
}

describe('MenuBar server render', () => {
  it('emits no clock time, so a prerendered page never shows the build time', async () => {
    const html = await renderMenuBarOnServer();

    const clock = html.match(/<span[^>]*class="menu-bar-clock"[^>]*>([^<]*)<\/span>/);
    expect(clock).not.toBeNull();
    expect(clock![1].trim(), 'server-rendered clock text').toBe('');
  });

  it('lets the menu bar hydrate instead of being thrown away and re-rendered', async () => {
    const html = await renderMenuBarOnServer();

    const host = html.match(/<app-menu-bar[^>]*>/);
    expect(host).not.toBeNull();
    expect(host![0].toLowerCase()).not.toContain('ngskiphydration');
  });
});
