/**
 * jsdom has no IntersectionObserver. This stand-in records what it was asked
 * to observe and lets a spec decide what is "in view".
 */
export class FakeIntersectionObserver {
  private static instances: FakeIntersectionObserver[] = [];
  private static original: typeof IntersectionObserver | undefined;

  readonly observed: Element[] = [];
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options?: IntersectionObserverInit,
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  static install(): void {
    FakeIntersectionObserver.instances = [];
    FakeIntersectionObserver.original = globalThis.IntersectionObserver;
    globalThis.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver;
  }

  static uninstall(): void {
    globalThis.IntersectionObserver = FakeIntersectionObserver.original as typeof IntersectionObserver;
  }

  static latest(): FakeIntersectionObserver {
    const latest = FakeIntersectionObserver.instances.at(-1);
    if (!latest) throw new Error('No IntersectionObserver was created');
    return latest;
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true;
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  report(entries: { target: Element; isIntersecting: boolean }[]): void {
    this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver);
  }
}
