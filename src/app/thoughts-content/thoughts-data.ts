export interface ThoughtEntry {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  content: string;
  relatedApp?: string;
}

export const THOUGHTS: ThoughtEntry[] = [
  {
    slug: 'signals',
    title: 'Why Angular Signals Changed Everything',
    date: '2026-06-15',
    summary:
      'Signals replaced Zone.js change detection with fine-grained reactivity, making Angular apps faster and easier to reason about.',
    tags: ['signals', 'reactivity', 'angular'],
    content:
      'Angular Signals represent a fundamental shift in how Angular handles state and change detection. Instead of relying on Zone.js to monkey-patch every async API and trigger global change detection, signals provide fine-grained reactivity that only updates the parts of the DOM that actually changed.\n\nThis means fewer unnecessary re-renders, simpler mental models, and code that is easier to debug. Computed signals derive state declaratively, and effects handle side effects in a controlled way.\n\nThe migration path from Zone.js to signals is gradual — you can adopt signals incrementally while Zone.js continues to work alongside them.',
    relatedApp: 'about',
  },
  {
    slug: 'httpresource',
    title: 'httpResource: Async Without the Boilerplate',
    date: '2026-06-20',
    summary:
      'Angular 19 introduced httpResource as a declarative way to fetch data — no more manual subscribe/unsubscribe.',
    tags: ['httpResource', 'async', 'angular'],
    content:
      'Before httpResource, fetching data in Angular meant injecting HttpClient, subscribing to observables, handling loading and error states manually, and remembering to unsubscribe. httpResource wraps all of this into a single declarative primitive.\n\nYou declare what URL to fetch (which can be reactive via signals), and httpResource gives you signals for the value, status, error, and headers. It automatically cancels in-flight requests when the URL changes and cleans up on destroy.\n\nThis is a perfect example of Angular embracing signals as the foundation for async state management.',
    relatedApp: 'projects',
  },
  {
    slug: 'tdd-angular',
    title: 'TDD in Angular: Writing Tests That Matter',
    date: '2026-07-01',
    summary:
      'Test-driven development forces you to think about the API before the implementation. Here is how I apply it in Angular.',
    tags: ['testing', 'tdd', 'angular'],
    content:
      'TDD in Angular starts with writing a failing test that describes the behavior you want. This forces you to think about the component API — what inputs does it take, what outputs does it emit, what does it render?\n\nThe key insight is testing behavior, not implementation. Check that clicking a button emits the right event, not that a specific method was called internally. Use TestBed for component tests, but keep services as plain unit tests when possible.\n\nThe red-green-refactor cycle keeps you focused: write the minimum test, write the minimum code to pass, then clean up.',
    relatedApp: 'terminal',
  },
];
