import { Component, output, signal } from '@angular/core';

export type AboutTab = 'overview' | 'skills' | 'experience';

@Component({
  selector: 'app-about',
  template: `
    <div class="about">
      <div class="about-avatar">👤</div>
      <h1 class="about-name">Paul Sumido</h1>
      <p class="about-title">Lead Frontend Developer</p>

      <div class="about-social">
        <a href="https://github.com/gpbsumido" target="_blank" rel="noopener">GitHub</a>
        <a href="https://linkedin.com/in/paulsumido" target="_blank" rel="noopener">LinkedIn</a>
      </div>

      <nav class="about-tabs">
        <button
          class="about-tab"
          [class.active]="activeTab() === 'overview'"
          (click)="activeTab.set('overview')"
        >
          Overview
        </button>
        <button
          class="about-tab"
          [class.active]="activeTab() === 'skills'"
          (click)="activeTab.set('skills')"
        >
          Skills
        </button>
        <button
          class="about-tab"
          [class.active]="activeTab() === 'experience'"
          (click)="activeTab.set('experience')"
        >
          Experience
        </button>
      </nav>

      <div class="about-tab-content">
        @switch (activeTab()) {
          @case ('overview') {
            <div class="about-overview">
              <p>Full-stack software engineer building for the web.</p>
              <p>
                <span
                  class="about-thoughts-link"
                  role="button"
                  tabindex="0"
                  (click)="thoughtRequested.emit()"
                  (keydown.enter)="thoughtRequested.emit()"
                >
                  Read my thoughts →
                </span>
              </p>
            </div>
          }
          @case ('skills') {
            <ul class="skills-list">
              <li>TypeScript / JavaScript</li>
              <li>Angular / React</li>
              <li>Node.js / Python</li>
              <li>Cloud (AWS / GCP)</li>
              <li>System Design</li>
            </ul>
          }
          @case ('experience') {
            <ul class="experience-list">
              <li class="experience-item">
                <div class="experience-role">Senior Software Developer · Frontend Lead</div>
                <div class="experience-company">Helika · 2023–2026</div>
                <p class="experience-blurb">
                  Frontend lead on a Web3 gaming-analytics SaaS. Designed and shipped Helika AI, a
                  conversational analytics assistant rendering live charts and dashboards inline in
                  chat, and built the drag-and-drop dashboard designer and a 15-component charting
                  library serving studios including Nexon.
                </p>
              </li>
              <li class="experience-item">
                <div class="experience-role">Frontend Developer</div>
                <div class="experience-company">Refmint · 2022–2023</div>
                <p class="experience-blurb">
                  Built data-heavy React applications and a shared UI component library, cutting page
                  load times ~40% with lazy loading and caching.
                </p>
              </li>
              <li class="experience-item">
                <div class="experience-role">Front-End Developer, Analytics</div>
                <div class="experience-company">PeopleInsight · 2017–2022</div>
                <p class="experience-blurb">
                  Built interactive dashboards for enterprise HR analytics in React and
                  survey-driven data-collection workflows with validation and automated testing.
                </p>
              </li>
            </ul>

            <a class="about-resume" href="/paul-sumido-resume.pdf" target="_blank" rel="noopener">
              Résumé (PDF) ↗
            </a>
          }
        }
      </div>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      height: 100%;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-primary, #fff);
    }

    .about {
      text-align: center;
      padding: 32px 40px;
      max-width: 420px;
      width: 100%;
    }

    .about-avatar {
      font-size: 72px;
      margin-bottom: 12px;
    }

    .about-name {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 4px;
    }

    .about-title {
      font-size: 14px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      margin: 0 0 12px;
    }

    .about-social {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .about-social a {
      font-size: 12px;
      color: var(--link-color, #4da3ff);
      text-decoration: none;
    }

    .about-social a:hover {
      text-decoration: underline;
    }

    .about-tabs {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 16px;
    }

    .about-tab {
      flex: 1;
      padding: 8px 12px;
      background: none;
      border: none;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      font-size: 12px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition:
        color 0.2s,
        border-color 0.2s;
    }

    .about-tab.active {
      color: var(--text-primary, #fff);
      border-bottom-color: var(--accent-color, #007aff);
    }

    .about-tab-content {
      text-align: left;
      font-size: 13px;
      line-height: 1.6;
      color: var(--text-secondary, rgba(255, 255, 255, 0.7));
      view-transition-name: about-tab-content;
    }

    .about-overview p {
      margin: 0 0 8px;
    }

    .about-thoughts-link {
      color: var(--link-color, #4da3ff);
      cursor: pointer;
    }

    .about-thoughts-link:hover {
      text-decoration: underline;
    }

    .skills-list,
    .experience-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .skills-list li {
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .skills-list li:last-child {
      border-bottom: none;
    }

    .experience-item {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .experience-item:last-child {
      border-bottom: none;
    }

    .experience-role {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .experience-company {
      font-size: 11px;
      color: var(--text-tertiary, rgba(255, 255, 255, 0.5));
      margin-bottom: 4px;
    }

    .experience-blurb {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
    }

    .about-resume {
      display: inline-block;
      margin-top: 12px;
      padding: 6px 14px;
      border: 1px solid var(--accent-color, #4da3ff);
      border-radius: 6px;
      color: var(--accent-color, #4da3ff);
      font-size: 12px;
      text-decoration: none;
      transition:
        background 0.15s,
        color 0.15s;
    }

    .about-resume:hover,
    .about-resume:focus-visible {
      background: var(--accent-color, #4da3ff);
      color: #fff;
      outline: none;
    }
  `,
})
export class AboutApp {
  readonly activeTab = signal<AboutTab>('overview');
  readonly thoughtRequested = output();
}
