import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Whatever version package.json is on has to be written down.
 *
 * The shortcut remap in #26 shipped with no changelog entry at all, and nothing
 * failed. It was only noticed while writing the 1.3.6 release note from commits
 * instead of from the changelog, which is the wrong direction to read it in.
 *
 * This is deliberately the weakest useful check. It cannot tell whether an entry
 * is any good, only that the version bump and the note about it happen together
 * rather than the second one being left for later, which is where it was lost.
 * It does not catch a change that bumps nothing at all -- see the note on the
 * first test.
 */
const ROOT = process.cwd();

const read = (name: string): string =>
  readFileSync(join(ROOT, name), 'utf-8');

const changelog = (): string => read('CHANGELOG.md');

const packageVersion = (): string =>
  (JSON.parse(read('package.json')) as { version: string }).version;

type Entry = { readonly date: string; readonly version: string };

/** Entries the changelog documents, in the order it lists them. */
const documented = (source: string): readonly Entry[] =>
  [...source.matchAll(/^## (\d{4}-\d{2}-\d{2}) - version (\d+\.\d+\.\d+)\s*$/gm)].map(
    (m) => ({ date: m[1], version: m[2] }),
  );

/** Every second-level heading, well formed or not, so a malformed one shows up. */
const headings = (source: string): readonly string[] =>
  source.split('\n').filter((line) => line.startsWith('## '));

const bulletsUnder = (source: string, version: string): readonly string[] => {
  const start = source.indexOf(`version ${version}`);
  const next = source.indexOf('\n## ', start);
  const body = source.slice(start, next === -1 ? undefined : next);
  return body.split('\n').filter((line) => line.trim().startsWith('- '));
};

const order = (a: string, b: string): number => {
  const left = a.split('.').map(Number);
  const right = b.split('.').map(Number);
  const differs = left.findIndex((n, i) => n !== right[i]);
  return differs === -1 ? 0 : left[differs] - right[differs];
};

describe('changelog', () => {
  /**
   * The top entry, not just any entry. A release that bumps package.json and
   * leaves the note for later lands the new version above nothing, and this is
   * what fails.
   *
   * Worth being honest about the hole: a change that bumps neither the version
   * nor the changelog leaves the two agreeing with each other, and this passes.
   * That is exactly what #26 did. Catching that one needs the PR diff, not a
   * unit test.
   */
  it('leads with the version package.json is on', () => {
    expect(documented(changelog())[0].version).toBe(packageVersion());
  });

  it('gives that entry something to say', () => {
    // A heading with nothing under it satisfies the check above while
    // documenting nothing, which is the obvious way to game it.
    expect(bulletsUnder(changelog(), packageVersion()).length).toBeGreaterThan(0);
  });

  it('gives every version exactly one heading', () => {
    const versions = documented(changelog()).map((e) => e.version);
    const repeated = versions.filter((v, i) => versions.indexOf(v) !== i);

    expect(repeated).toEqual([]);
  });

  /**
   * Reading the log top to bottom should walk backwards through releases. An
   * entry inserted in the wrong place still documents itself, but it stops the
   * file answering "what shipped most recently", which is the only question
   * anyone opens it to ask.
   */
  it('lists versions newest first', () => {
    const versions = documented(changelog()).map((e) => e.version);
    const misplaced = versions.filter((v, i) => i > 0 && order(v, versions[i - 1]) >= 0);

    expect(misplaced).toEqual([]);
  });

  it('lists dates newest first', () => {
    const entries = documented(changelog());
    const misplaced = entries.filter((e, i) => i > 0 && e.date > entries[i - 1].date);

    expect(misplaced).toEqual([]);
  });

  /**
   * Every heading has to parse. Without this a heading that loses its date, or
   * gains a stray bracket, silently drops out of every check above rather than
   * failing one of them.
   */
  it('writes every heading in the one format', () => {
    expect(headings(changelog()).length).toBe(documented(changelog()).length);
  });

  it('actually reads entries out, so a rotted regex fails rather than passes', () => {
    expect(documented('## 2026-08-14 - version 4.5.6\n\n- a note\n')).toEqual([
      { date: '2026-08-14', version: '4.5.6' },
    ]);
    expect(documented('## not a version heading\n')).toEqual([]);
    expect(documented('## 4.5.6\n')).toEqual([]);
  });
});
