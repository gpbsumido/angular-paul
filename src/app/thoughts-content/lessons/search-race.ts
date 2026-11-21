import { mergeMap, Observable, OperatorFunction, switchMap } from 'rxjs';

export type SearchStrategy = 'mergeMap' | 'switchMap';

/**
 * [ng-06 rxjs] The operator behind lesson 06's race demo. Both strategies map
 * each query to an inner search Observable. They differ in what happens to a
 * search still in flight when the next query arrives:
 *
 * - mergeMap keeps it running, so responses arrive in whatever order the
 *   server finishes them, and a slow stale one can land last.
 * - switchMap unsubscribes from it. For HttpClient, unsubscribing aborts the
 *   request, so the stale response never arrives at all.
 */
export function searchAsYouType<T>(
  strategy: SearchStrategy,
  search: (query: string) => Observable<T>,
): OperatorFunction<string, T> {
  return strategy === 'switchMap' ? switchMap(search) : mergeMap(search);
}
