import { Pipe, PipeTransform } from '@angular/core';

// Built once at module load; constructing an Intl formatter per call is the slow part.
const MEDIUM_UTC = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

/**
 * [ng-03 templates] `{{ thought.date | utcDate }}` → "Jun 15, 2026".
 *
 * Why not `| date: 'mediumDate' : 'UTC'`? That was the first version, and the
 * production build said no: initial bundle +13 kB. @angular/common ships as
 * one module that this app already loads eagerly, so using DatePipe anywhere,
 * even in a lazy route, pulls its locale formatting into the initial chunk.
 * The platform's Intl API does the same job in a few lines for free.
 *
 * The 'UTC' timezone is the bit that matters either way: '2026-06-15' parses as
 * UTC midnight, so formatting in local time shows the 14th west of Greenwich,
 * and a server in another zone would render a different day than the browser.
 */
@Pipe({ name: 'utcDate' })
export class UtcDatePipe implements PipeTransform {
  transform(isoDate: string): string {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`utcDate: cannot parse "${isoDate}" as a date`);
    }
    return MEDIUM_UTC.format(parsed);
  }
}
