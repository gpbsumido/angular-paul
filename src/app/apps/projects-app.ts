import { Component, computed, inject, output, signal } from '@angular/core';
import { ProjectsService } from './projects.service';

export interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
}

@Component({
  selector: 'app-projects',
  template: `
    <div class="projects">
      <div class="projects-header">
        <h2>Projects</h2>
        <span class="projects-thoughts-link" (click)="thoughtRequested.emit()"> Thoughts → </span>
      </div>

      <div class="projects-search">
        <input
          type="text"
          placeholder="Filter projects..."
          [value]="searchQuery()"
          (input)="onSearch($event)"
        />
      </div>

      @if (isLoading()) {
        <div class="projects-loading">Loading projects...</div>
      } @else if (isError()) {
        <div class="projects-error">Failed to load projects. Please try again later.</div>
      } @else if (filteredRepos().length === 0) {
        <div class="projects-empty">No projects match your filter.</div>
      } @else {
        <div class="projects-grid">
          @for (repo of filteredRepos(); track repo.id) {
            <a class="project-card" [href]="repo.html_url" target="_blank" rel="noopener">
              <div class="project-name">{{ repo.name }}</div>
              <div class="project-description">{{ repo.description }}</div>
              <div class="project-meta">
                <span class="project-stars">⭐ {{ repo.stargazers_count }}</span>
                @if (repo.language) {
                  <span class="project-language">{{ repo.language }}</span>
                }
              </div>
            </a>
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-primary, #fff);
    }

    .projects {
      padding: 24px;
    }

    .projects-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .projects-header h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .projects-thoughts-link {
      font-size: 12px;
      color: var(--accent-color, #007aff);
      cursor: pointer;
    }

    .projects-thoughts-link:hover {
      text-decoration: underline;
    }

    .projects-search input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary, #fff);
      font-size: 13px;
      outline: none;
    }

    .projects-search input:focus {
      border-color: var(--accent-color, #007aff);
    }

    .projects-search {
      margin-bottom: 16px;
    }

    .projects-loading,
    .projects-error,
    .projects-empty {
      text-align: center;
      padding: 32px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      font-size: 13px;
    }

    .projects-error {
      color: #ff6b6b;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
    }

    .project-card {
      display: block;
      padding: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: background 0.15s;
    }

    .project-card:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .project-name {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: var(--accent-color, #007aff);
    }

    .project-description {
      font-size: 12px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.6));
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .project-meta {
      display: flex;
      gap: 12px;
      font-size: 11px;
      color: var(--text-secondary, rgba(255, 255, 255, 0.5));
    }

    .project-stars {
      display: flex;
      align-items: center;
      gap: 3px;
    }
  `,
})
export class ProjectsApp {
  private readonly projectsService = inject(ProjectsService);
  readonly thoughtRequested = output();

  readonly searchQuery = signal('');

  readonly isLoading = computed(
    () =>
      this.projectsService.repos.status() === 'loading' ||
      this.projectsService.repos.status() === 'reloading',
  );

  readonly isError = computed(() => this.projectsService.repos.status() === 'error');

  readonly filteredRepos = computed(() => {
    const repos = this.projectsService.repos.value() ?? [];
    const query = this.searchQuery().toLowerCase();
    if (!query) return repos;
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        (r.description?.toLowerCase().includes(query) ?? false),
    );
  });

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}
