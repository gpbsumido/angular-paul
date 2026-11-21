import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BROWSER_STORAGE } from './browser-storage';

describe('BROWSER_STORAGE', () => {
  it('is localStorage in the browser', () => {
    expect(TestBed.inject(BROWSER_STORAGE)).toBe(localStorage);
  });

  it('is null on the server, so callers must handle there being no storage', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    expect(TestBed.inject(BROWSER_STORAGE)).toBeNull();
  });
});
