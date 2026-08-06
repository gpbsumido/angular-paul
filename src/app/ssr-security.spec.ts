import { readFileSync } from 'node:fs';

// Guards the production SSR server config that lets it run behind Railway's proxy.
// Angular 21's SSR server rejects unlisted hosts (400) and ignores untrusted
// proxy headers, so losing either of these silently breaks the live deploy.
describe('SSR production security config', () => {
  it('allows the deployed hostnames in angular.json security.allowedHosts', () => {
    const angularJson = JSON.parse(readFileSync('angular.json', 'utf-8'));
    const allowedHosts: string[] =
      angularJson.projects['angular-paul'].architect.build.options.security.allowedHosts;

    // *.paulsumido.com covers both develop.angular.* and angular.* (endsWith match).
    expect(allowedHosts).toContain('*.paulsumido.com');
    expect(allowedHosts).toContain('*.up.railway.app');
  });

  it('trusts proxy headers in the server entry', () => {
    const server = readFileSync('src/server.ts', 'utf-8');
    expect(server).toMatch(/trustProxyHeaders:\s*true/);
  });
});
