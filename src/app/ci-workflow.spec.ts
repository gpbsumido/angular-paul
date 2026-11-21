import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * [ng-11 testing] CI is code too, and it can be green while checking nothing.
 * These pin the three gaps I found in .github/workflows/ci.yml: a typecheck
 * that covered no files, no production build, and no time limit on a job.
 */
const workflow = readFileSync(resolve(process.cwd(), '.github/workflows/ci.yml'), 'utf-8');

describe('[ng-11] CI workflow', () => {
  it('the root tsconfig only holds references, so a bare `tsc --noEmit` checks no files', () => {
    const root = readFileSync(resolve(process.cwd(), 'tsconfig.json'), 'utf-8');
    expect(root).toMatch(/"files":\s*\[\]/);
  });

  it('typechecks the app and the specs through their own tsconfigs', () => {
    expect(workflow).toMatch(/tsc --noEmit -p tsconfig\.app\.json/);
    expect(workflow).toMatch(/tsc --noEmit -p tsconfig\.spec\.json/);
  });

  it('runs the production build, which is the only step that prerenders and enforces budgets', () => {
    expect(workflow).toMatch(/run: npm run build/);
  });

  it('gives every job a time limit, so a hung builder fails in minutes rather than six hours', () => {
    const jobs = workflow
      .slice(workflow.indexOf('\njobs:\n'))
      .split(/\n {2}(?=[\w-]+:\n)/)
      .slice(1);
    expect(jobs.map((job) => job.slice(0, job.indexOf(':')))).toEqual(['quality', 'e2e-accessibility']);
    for (const job of jobs) expect(job).toMatch(/\n {4}timeout-minutes: \d+/);
  });
});
