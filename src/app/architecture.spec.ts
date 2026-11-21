import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';

/**
 * [ng-01 structure] Architecture fitness tests.
 *
 * Folder conventions only hold while someone enforces them. In a team, "we put
 * shared state in shared/" lives in a wiki nobody reads, and six months later a
 * feature folder is quietly a dependency of the whole app. These tests make the
 * convention executable: break the rule and CI goes red with the file name.
 *
 * The layering this repo uses (lesson 01, /thoughts/angular-01-project-structure):
 *
 *   shell      app.ts, menu-bar/, dock/, desktop/, window-manager/, ...
 *   shared/    services and building blocks anyone may use
 *   apps/      feature folders — one per desktop "app", lazy loaded
 *
 * Arrows only point down: shell → shared, apps → shared. Nothing outside
 * apps/ may *statically* import from apps/. A static import drags the feature
 * into the initial bundle and couples the shell to its internals. Dynamic
 * `import()` is allowed — that IS the lazy-loading seam.
 */
const APP_ROOT = resolve(process.cwd(), 'src/app');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return full.endsWith('.ts') && !full.endsWith('.spec.ts') ? [full] : [];
  });
}

/** Static `import … from './x'` / `export … from './x'` specifiers, never `import('./x')`. */
function staticRelativeImports(file: string): string[] {
  const source = readFileSync(file, 'utf-8');
  const specifiers = [...source.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+'(\.[^']+)'/gm)];
  return specifiers.map((match) => resolve(dirname(file), match[1]));
}

const isInside = (file: string, folder: string) =>
  relative(join(APP_ROOT, folder), file).split(sep)[0] !== '..';

describe('[ng-01] architecture', () => {
  const files = sourceFiles(APP_ROOT);

  it('finds the source tree (guards against the walker silently matching nothing)', () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it('the parser sees static imports and ignores dynamic import()', () => {
    const app = join(APP_ROOT, 'app.routes.ts');
    // app.routes.ts only has lazy `import()` calls into features plus one package import.
    expect(staticRelativeImports(app)).toEqual([]);
  });

  it('nothing outside apps/ statically imports from apps/', () => {
    const violations = files
      .filter((file) => !isInside(file, 'apps'))
      .flatMap((file) =>
        staticRelativeImports(file)
          .filter((target) => isInside(target, 'apps'))
          .map((target) => `${relative(APP_ROOT, file)} → ${relative(APP_ROOT, target)}`),
      );
    expect(violations).toEqual([]);
  });

  it('has no NgModules — every component, directive and pipe is standalone', () => {
    const withNgModule = files
      .filter((file) => /@NgModule\s*\(/.test(readFileSync(file, 'utf-8')))
      .map((file) => relative(APP_ROOT, file));
    expect(withNgModule).toEqual([]);
  });

  // [ng-09 change detection] OnPush everywhere, unless a component says
  // otherwise out loud. The check is per decorator, not per file, because a
  // file can declare several components. Eager (the new name for Default) is
  // allowed only when written explicitly, so it is always a visible decision
  // rather than a forgotten line.
  it('every component sets OnPush, or opts into Eager explicitly', () => {
    const decorators = files.flatMap((file) =>
      readFileSync(file, 'utf-8')
        .split('@Component(')
        .slice(1)
        .map((rest) => ({ file, decorator: rest.slice(0, rest.indexOf('export class')) })),
    );
    const missing = decorators
      .filter(({ decorator }) => !/changeDetection:\s*ChangeDetectionStrategy\.(OnPush|Eager)\b/.test(decorator))
      .map(({ file, decorator }) => `${relative(APP_ROOT, file)} (${/selector:\s*'([^']+)'/.exec(decorator)?.[1]})`);

    expect(decorators.length).toBeGreaterThan(30);
    expect(missing).toEqual([]);
  });
});
