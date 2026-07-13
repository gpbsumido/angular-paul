# angular-paul

A macOS-style desktop OS portfolio built with Angular 21. Every window, dock icon, and keyboard shortcut mirrors the macOS experience — built entirely with standalone components, signals, and zoneless change detection.

**Live demo**: open the app locally or visit the deployed site to explore the desktop.

## What it is

A portfolio site disguised as an operating system. Click dock icons to launch apps, drag and resize windows, right-click for context menus, use Cmd+Space for Spotlight search. Each "app" is a standalone Angular component loaded lazily on first launch.

## Angular features showcase

| Feature | Where it's used |
|---|---|
| **Standalone components** | Every component — no NgModules anywhere in the project |
| **Signals** | All state management: `signal()`, `computed()`, `effect()` across services and components |
| **Zoneless change detection** | `provideZonelessChangeDetection()` in app config — no Zone.js in the bundle |
| **`@defer` blocks** | Spotlight and context menu lazy-rendered with `@defer (on idle)` |
| **Lazy routes** | `/thoughts` and `/thoughts/:slug` use `loadComponent` dynamic imports |
| **Lazy app components** | All 9 app components loaded via dynamic `import()` on first dock/icon click |
| **SSR + incremental hydration** | `provideClientHydration(withEventReplay(), withIncrementalHydration())` |
| **`@for` / `@if` / `@switch`** | Built-in control flow throughout all templates |
| **`input()` / `output()` signals** | Signal-based inputs and outputs on Window, DesktopIcon, Spotlight, etc. |
| **`viewChild()` / `viewChildren()`** | Spotlight reference in App, icon selection in DesktopIcons |
| **`NgComponentOutlet`** | Dynamic app rendering inside windows |
| **`computed()` derived state** | Dock icon magnification, search filtering, related thoughts |
| **`effect()` side effects** | Spotlight open/close sync with keyboard shortcut service |
| **`@HostListener`** | Global keyboard shortcuts delegated to KeyboardShortcutService |
| **View Transitions API** | Feature-detected animation configs with graceful fallback |
| **Dependency injection** | Tree-shakable `providedIn: 'root'` services for all shared state |

## Architecture

```
src/app/
├── app.ts / app.html          Root component — shell, keyboard shortcuts, window loop
├── desktop/                    Desktop wallpaper background
├── desktop-icons/              Desktop icon grid (README, Projects, Thoughts)
├── dock/                       macOS dock with icon magnification + lazy app registration
├── menu-bar/                   Top menu bar with clock and Spotlight trigger
├── window-manager/             Window component + WindowManagerService (focus, z-index, drag, resize)
├── spotlight/                  Spotlight search overlay (deferred)
├── context-menu/               Right-click desktop context menu (deferred)
├── shared/
│   ├── app-launcher.service    Lazy component resolution + window lifecycle
│   ├── dock.service            Dock state (pinned, running, focused, minimized)
│   ├── keyboard-shortcut.service  Cmd+W/Q/H/Space/Tab handlers
│   └── search.service          Unified search across apps, thoughts, and files
├── apps/
│   ├── about-app               Profile, skills, experience tabs
│   ├── contact-app             Contact form
│   ├── finder/                 Virtual file system browser
│   ├── projects-app            GitHub repos with tag filtering
│   ├── readme-app              Project overview (this README, in-app)
│   ├── settings/               System preferences (theme, accent color, dock size)
│   └── terminal-app            Command-line interface
└── thoughts-content/           Technical writing system (15 entries)
    ├── thoughts-data.ts        Thought entries with slug, tags, content
    ├── thoughts-list.ts        Filterable list view
    └── thought-detail.ts       Full thought reader
```

## Testing

Three-layer testing strategy gated on every PR:

- **ESLint** — `angular-eslint` with `templateAccessibility` for static a11y analysis
- **Unit tests** — 229+ tests with Vitest, including `vitest-axe` WCAG 2.1 AA scans
- **E2E tests** — Playwright smoke tests + `@axe-core/playwright` accessibility scans
- **CI** — GitHub Actions runs lint, typecheck, unit tests, then E2E + axe on every PR

## Development

```bash
npm install
npm start           # Dev server at http://localhost:4200
npm test            # Unit tests (Vitest via ng test)
npm run lint        # ESLint
npm run test:e2e    # Playwright E2E tests
```

## Build

```bash
npm run build                          # Production build with SSR
npm run serve:ssr:angular-paul         # Serve SSR build at http://localhost:4000
```

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| Cmd + Space | Toggle Spotlight search |
| Cmd + W | Close active window |
| Cmd + Q | Quit active app (close all windows) |
| Cmd + H | Minimize active window |
| Cmd + Tab | Cycle focus between windows |

## Bundle

Initial bundle: ~381 kB (108 kB transferred). All 9 app components are lazy chunks loaded on first use. No Zone.js. Lighthouse: Performance 86, Accessibility 100, Best Practices 100, SEO 100.

## Built with

- Angular 21 — standalone components, signals, zoneless, incremental hydration
- TypeScript 5.9 (strict mode)
- Vitest + vitest-axe
- Playwright + @axe-core/playwright
- SSR via @angular/ssr
