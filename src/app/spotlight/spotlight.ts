import { Component, inject, output, signal } from '@angular/core';
import { SearchService, SearchResultGroup } from '../shared/search.service';

@Component({
  selector: 'app-spotlight',
  templateUrl: './spotlight.html',
  styleUrl: './spotlight.scss',
})
export class Spotlight {
  private searchService = inject(SearchService);

  readonly query = signal('');
  readonly results = signal<SearchResultGroup[]>([]);
  readonly isOpen = signal(false);
  readonly resultSelected = output<string>();

  open(): void {
    this.isOpen.set(true);
    this.query.set('');
    this.results.set([]);
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
    this.results.set([]);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.results.set(this.searchService.search(value));
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('spotlight-overlay')) {
      this.close();
    }
  }

  onResultClick(action: string): void {
    this.resultSelected.emit(action);
    this.close();
  }
}
