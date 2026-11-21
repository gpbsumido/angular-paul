import { delay, Observable, of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { searchAsYouType } from './search-race';

/**
 * Marble tests: virtual time, so a 100ms delay costs nothing and the order of
 * arrivals is exact. Inside run(), every rxjs timer uses the test scheduler.
 *
 * The fake search answers a one-letter query slowly (100ms) and a longer one
 * quickly (20ms), like a real backend where broad queries cost more.
 */
const search = (query: string): Observable<string> =>
  of(`results for ${query}`).pipe(delay(query.length === 1 ? 100 : 20));

describe('searchAsYouType', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('with mergeMap, the slow stale response lands last and wins', () => {
    scheduler.run(({ hot, expectObservable }) => {
      const typed = hot('a 9ms b', { a: 'a', b: 'ab' });
      expectObservable(typed.pipe(searchAsYouType('mergeMap', search))).toBe('30ms x 69ms y', {
        x: 'results for ab',
        y: 'results for a',
      });
    });
  });

  it('with switchMap, a new query cancels the one in flight', () => {
    scheduler.run(({ hot, expectObservable }) => {
      const typed = hot('a 9ms b', { a: 'a', b: 'ab' });
      expectObservable(typed.pipe(searchAsYouType('switchMap', search))).toBe('30ms x', {
        x: 'results for ab',
      });
    });
  });
});
