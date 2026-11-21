import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 400;

// [ng-06 rxjs] A functional interceptor: a plain function that sees every
// request HttpClient makes. `next(req)` sends it on and returns the response
// as an Observable, so the interceptor can pipe operators onto it.
//
// Simple: one blip on the network used to show the Projects app's error
//   state. Now GETs get two more tries before anyone sees an error.
// Intermediate: retry() resubscribes to the source on error. HttpClient
//   Observables are cold, so resubscribing *sends the request again*. That's
//   what makes this work, and why it must stay away from POSTs.
// Expert: retry's `delay` returns an Observable. When it emits, retry tries
//   again; when it errors, the error goes downstream. So "don't retry a 404"
//   is just throwError() from the delay function, and the backoff is a
//   timer() that doubles: 400ms, then 800ms.
export const retryTransientErrors: HttpInterceptorFn = (req, next) => {
  // Only GETs are safe to send twice. A retried POST could submit twice.
  if (req.method !== 'GET') return next(req);

  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error, retryCount) =>
        isTransient(error) ? timer(BASE_DELAY_MS * 2 ** (retryCount - 1)) : throwError(() => error),
    }),
  );
};

/** Status 0 is a network failure (offline, DNS, CORS); 5xx is the server's problem. */
function isTransient(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
}
