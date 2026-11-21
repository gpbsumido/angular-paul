import { FormControl } from '@angular/forms';
import { notBlank } from './validators';

describe('notBlank', () => {
  it.each(['', '   ', '\n\t '])('flags %j as blank', (value) => {
    expect(notBlank(new FormControl(value, { nonNullable: true }))).toEqual({ blank: true });
  });

  it('passes text with something in it, even with spaces around', () => {
    expect(notBlank(new FormControl('  hi  ', { nonNullable: true }))).toBeNull();
  });
});
