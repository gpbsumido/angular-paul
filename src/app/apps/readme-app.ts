import { Component } from '@angular/core';

@Component({
  selector: 'app-readme',
  template: `
    <div class="readme">
      <h1>README.md</h1>
      <p class="readme-intro">
        Welcome to my desktop — a macOS-style portfolio built with Angular 21.
      </p>

      <h2>What's here</h2>
      <ul>
        <li><strong>About</strong> — who I am, skills, and experience</li>
        <li><strong>Projects</strong> — live GitHub repos, filterable</li>
        <li><strong>Thoughts</strong> — short-form technical writing</li>
        <li><strong>Terminal</strong> — a command-line interface to everything</li>
        <li><strong>Finder</strong> — browse the virtual file system</li>
        <li><strong>Settings</strong> — theme, accent color, dock size</li>
        <li><strong>Contact</strong> — get in touch</li>
      </ul>

      <h2>Built with</h2>
      <ul>
        <li>Angular 21 — standalone components, signals, zoneless change detection</li>
        <li>TypeScript 5.9</li>
        <li>TDD with Vitest</li>
        <li>SSR via &#64;angular/ssr</li>
      </ul>

      <h2>Testing</h2>
      <ul>
        <li>229+ unit tests with Vitest (TDD red-green cycle)</li>
        <li>
          WCAG 2.1 AA accessibility scans via vitest-axe (unit) and &#64;axe-core/playwright (E2E)
        </li>
        <li>ESLint with angular-eslint template accessibility rules</li>
        <li>Playwright E2E smoke tests and landmark checks</li>
        <li>CI via GitHub Actions — lint, typecheck, unit tests, E2E + axe on every PR</li>
      </ul>

      <h2>Shortcuts</h2>
      <ul>
        <li><kbd>⌘</kbd> + <kbd>Space</kbd> — Spotlight search</li>
        <li><kbd>⌘</kbd> + <kbd>W</kbd> — Close window</li>
        <li><kbd>⌘</kbd> + <kbd>Q</kbd> — Quit app</li>
        <li><kbd>⌘</kbd> + <kbd>H</kbd> — Minimize window</li>
        <li><kbd>⌘</kbd> + <kbd>Tab</kbd> — Cycle focus</li>
        <li>Double-click desktop icons to open apps</li>
        <li>Right-click the desktop for context menu</li>
      </ul>
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
      color: var(--text-primary, #e0e0e0);
      background: var(--window-bg, rgba(30, 30, 30, 0.95));
    }

    .readme {
      padding: 24px 32px;
      max-width: 560px;
      line-height: 1.6;
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 8px;
    }

    h2 {
      font-size: 15px;
      font-weight: 600;
      margin: 20px 0 8px;
      color: var(--accent-color, #007aff);
    }

    .readme-intro {
      font-size: 14px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.65));
      margin: 0 0 16px;
    }

    ul {
      margin: 0;
      padding-left: 20px;
    }

    li {
      font-size: 13px;
      margin-bottom: 6px;
    }

    kbd {
      display: inline-block;
      padding: 1px 6px;
      font-size: 11px;
      font-family: 'SF Mono', Menlo, monospace;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 4px;
    }
  `,
})
export class ReadmeApp {}
