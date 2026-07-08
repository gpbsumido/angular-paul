import { TestBed } from '@angular/core/testing';
import { DockService } from './dock.service';

describe('DockService', () => {
  let service: DockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with Finder as focused in runningApps', () => {
    const running = service.runningApps();
    expect(running.has('finder')).toBe(true);
    expect(running.get('finder')).toBe('focused');
  });

  it('should launch an app and set it as focused', () => {
    const app = service.pinnedApps().find((a) => a.id === 'terminal')!;
    service.launchApp(app);

    const running = service.runningApps();
    expect(running.has('terminal')).toBe(true);
    expect(running.get('terminal')).toBe('focused');
  });

  it('should unfocus the previous app when launching a new one', () => {
    const terminal = service.pinnedApps().find((a) => a.id === 'terminal')!;
    service.launchApp(terminal);

    const running = service.runningApps();
    expect(running.get('finder')).toBe('running');
    expect(running.get('terminal')).toBe('focused');
  });

  it('should remove an app from runningApps via closeApp', () => {
    const terminal = service.pinnedApps().find((a) => a.id === 'terminal')!;
    service.launchApp(terminal);
    expect(service.runningApps().has('terminal')).toBe(true);

    service.closeApp('terminal');
    expect(service.runningApps().has('terminal')).toBe(false);
  });

  it('should report isRunning correctly', () => {
    expect(service.isRunning('finder')).toBe(true);
    expect(service.isRunning('terminal')).toBe(false);

    const terminal = service.pinnedApps().find((a) => a.id === 'terminal')!;
    service.launchApp(terminal);
    expect(service.isRunning('terminal')).toBe(true);
  });

  it('should track the focused app via focusedAppId', () => {
    expect(service.focusedAppId()).toBe('finder');

    const terminal = service.pinnedApps().find((a) => a.id === 'terminal')!;
    service.launchApp(terminal);
    expect(service.focusedAppId()).toBe('terminal');
  });

  it('should update the focused app via focusApp', () => {
    const terminal = service.pinnedApps().find((a) => a.id === 'terminal')!;
    service.launchApp(terminal);
    expect(service.focusedAppId()).toBe('terminal');

    service.focusApp('finder');
    expect(service.focusedAppId()).toBe('finder');
    expect(service.runningApps().get('terminal')).toBe('running');
  });

  it('should not duplicate an already running app when launched again', () => {
    // Finder is already running; launch it again via handleDockClick
    const finder = service.pinnedApps().find((a) => a.id === 'finder')!;
    // First click on focused app minimizes it
    service.handleDockClick(finder);
    expect(service.runningApps().get('finder')).toBe('minimized');

    // Second click restores focus
    service.handleDockClick(finder);
    expect(service.runningApps().get('finder')).toBe('focused');

    // Only one entry for finder
    const finderEntries = [...service.runningApps().entries()].filter(([id]) => id === 'finder');
    expect(finderEntries.length).toBe(1);
  });

  it('should add non-pinned apps to transientApps when launched', () => {
    const unpinnedApp = {
      id: 'calculator',
      label: 'Calculator',
      icon: '🧮',
      color: '#999',
      pinned: false,
    };
    service.launchApp(unpinnedApp);

    expect(service.transientApps().some((a) => a.id === 'calculator')).toBe(true);
    expect(service.runningApps().has('calculator')).toBe(true);
  });

  it('should remove transient apps when closed', () => {
    const unpinnedApp = {
      id: 'calculator',
      label: 'Calculator',
      icon: '🧮',
      color: '#999',
      pinned: false,
    };
    service.launchApp(unpinnedApp);
    expect(service.transientApps().length).toBe(1);

    service.closeApp('calculator');
    expect(service.transientApps().length).toBe(0);
  });
});
