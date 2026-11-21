import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { appConfig } from '../app.config';
import { retryTransientErrors } from './retry-transient-errors.interceptor';

const UNAVAILABLE = { status: 503, statusText: 'Service Unavailable' };

describe('retryTransientErrors', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let result: unknown;
  let failure: { status?: number } | undefined;

  const get = (url = '/repos') =>
    http.get(url).subscribe({ next: (body) => (result = body), error: (error) => (failure = error) });

  beforeEach(() => {
    vi.useFakeTimers();
    result = undefined;
    failure = undefined;
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([retryTransientErrors])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    vi.useRealTimers();
  });

  it('retries a GET that hit a 5xx, after a backoff delay', () => {
    get();
    backend.expectOne('/repos').flush('down', UNAVAILABLE);

    backend.expectNone('/repos');
    vi.advanceTimersByTime(500);
    backend.expectOne('/repos').flush(['angular-paul']);

    expect(result).toEqual(['angular-paul']);
    expect(failure).toBeUndefined();
  });

  it('treats a network failure (status 0) as transient too', () => {
    get();
    backend.expectOne('/repos').error(new ProgressEvent('error'));
    vi.advanceTimersByTime(500);
    backend.expectOne('/repos').flush([]);

    expect(result).toEqual([]);
  });

  it('backs off longer each time, then gives up after two retries with the last error', () => {
    get();
    backend.expectOne('/repos').flush('down', UNAVAILABLE);
    vi.advanceTimersByTime(500);
    backend.expectOne('/repos').flush('down', UNAVAILABLE);

    vi.advanceTimersByTime(500);
    backend.expectNone('/repos');
    vi.advanceTimersByTime(500);
    backend.expectOne('/repos').flush('still down', UNAVAILABLE);

    vi.advanceTimersByTime(10_000);
    backend.expectNone('/repos');
    expect(failure?.status).toBe(503);
  });

  it('does not retry a client error like 404', () => {
    get();
    backend.expectOne('/repos').flush('nope', { status: 404, statusText: 'Not Found' });

    vi.advanceTimersByTime(10_000);
    backend.expectNone('/repos');
    expect(failure?.status).toBe(404);
  });

  it('never retries a POST, which might not be safe to send twice', () => {
    http.post('/messages', { text: 'hi' }).subscribe({ error: (error) => (failure = error) });
    backend.expectOne('/messages').flush('down', UNAVAILABLE);

    vi.advanceTimersByTime(10_000);
    backend.expectNone('/messages');
    expect(failure?.status).toBe(503);
  });
});

describe('retryTransientErrors in the app config', () => {
  it('is registered on the app HttpClient', () => {
    TestBed.configureTestingModule({ providers: [...appConfig.providers, provideHttpClientTesting()] });
    vi.useFakeTimers();
    const backend = TestBed.inject(HttpTestingController);
    let result: unknown;

    TestBed.inject(HttpClient)
      .get('https://api.github.com/users/gpbsumido/repos')
      .subscribe((body) => (result = body));
    backend.expectOne(() => true).flush('down', UNAVAILABLE);
    vi.advanceTimersByTime(500);
    backend.expectOne(() => true).flush([]);

    expect(result).toEqual([]);
    vi.useRealTimers();
  });
});
