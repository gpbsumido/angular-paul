import { Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { GitHubRepo } from './projects-app';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  readonly search = signal('');

  readonly repos = httpResource<GitHubRepo[]>(() => {
    const query = this.search();
    if (query) {
      return `https://api.github.com/users/gpbsumido/repos?q=${encodeURIComponent(query)}`;
    }
    return 'https://api.github.com/users/gpbsumido/repos?sort=updated&per_page=30';
  });
}
