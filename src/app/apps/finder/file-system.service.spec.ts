import { TestBed } from '@angular/core/testing';
import { FileSystemService } from './file-system.service';

describe('FileSystemService', () => {
  let service: FileSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSystemService);
  });

  it('should return root-level entries', () => {
    const root = service.getChildren('/');
    const names = root.map((e) => e.name);

    expect(names).toContain('Applications');
    expect(names).toContain('Thoughts');
    expect(names).toContain('Projects');
    expect(names).toContain('Preferences');
  });

  it('should return root entries as folders', () => {
    const root = service.getChildren('/');
    for (const entry of root) {
      expect(entry.type).toBe('folder');
    }
  });

  it('getChildren("/Applications/") should return app entries', () => {
    const apps = service.getChildren('/Applications/');
    expect(apps.length).toBeGreaterThan(0);

    const names = apps.map((e) => e.name);
    expect(names).toContain('About');
    expect(names).toContain('Terminal');
    expect(names).toContain('Settings');
  });

  it('getChildren("/Thoughts/") should return thought entries as files', () => {
    const thoughts = service.getChildren('/Thoughts/');
    expect(thoughts.length).toBeGreaterThan(0);

    for (const entry of thoughts) {
      expect(entry.type).toBe('file');
    }
  });

  it('each entry should have name, type, icon, and action metadata', () => {
    const apps = service.getChildren('/Applications/');
    for (const entry of apps) {
      expect(entry.name).toBeTruthy();
      expect(['file', 'folder']).toContain(entry.type);
      expect(entry.icon).toBeTruthy();
      expect(entry.action).toBeTruthy();
    }
  });

  it('getChildren("/nonexistent/") should return an empty array', () => {
    expect(service.getChildren('/nonexistent/')).toEqual([]);
  });

  it('/Thoughts/ entries should have thought: action metadata that triggers thought opening', () => {
    const thoughts = service.getChildren('/Thoughts/');
    for (const entry of thoughts) {
      expect(entry.action).toBeTruthy();
      expect(entry.action).toMatch(/^thought:/);
    }
  });
});
