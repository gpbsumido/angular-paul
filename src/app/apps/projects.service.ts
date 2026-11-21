import { Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { GitHubRepo } from './projects-app';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  readonly repos = httpResource<GitHubRepo[]>(
    () => 'https://api.github.com/users/gpbsumido/repos?sort=updated&per_page=30',
  );
}
