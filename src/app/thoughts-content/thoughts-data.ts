export interface ThoughtEntry {
  slug: string;
  title: string;
  date: string;
  summary: string;
}

export const THOUGHTS: ThoughtEntry[] = [
  {
    slug: 'signals',
    title: 'Why Angular Signals Changed Everything',
    date: '2026-06-15',
    summary:
      'Signals replaced Zone.js change detection with fine-grained reactivity, making Angular apps faster and easier to reason about.',
  },
  {
    slug: 'httpresource',
    title: 'httpResource: Async Without the Boilerplate',
    date: '2026-06-20',
    summary:
      'Angular 19 introduced httpResource as a declarative way to fetch data — no more manual subscribe/unsubscribe.',
  },
  {
    slug: 'tdd-angular',
    title: 'TDD in Angular: Writing Tests That Matter',
    date: '2026-07-01',
    summary:
      'Test-driven development forces you to think about the API before the implementation. Here is how I apply it in Angular.',
  },
];
