# Changelog

All notable changes to this project will be documented in this file.

## 2026-07-13 - version 0.2.15

- 3 new thought entries (300–420 words each, conversational + technical):
  - "Why Signals Over RxJS" — signals vs RxJS tradeoffs, computed() vs combineLatest, when RxJS still wins for streams/retries/debouncing, the 80/20 migration rule. Tags: signals, computed, effect
  - "Going Zoneless" — Zone.js monkey-patching costs (100KB, wasted CD, broken async/await), zoneless O(k) vs O(n) performance, gotchas with third-party libs and testing. Tags: zoneless, signals, performance
  - "The New Template Syntax" — @if type narrowing, @for mandatory inline track + @empty, @switch exhaustive checking, automated migration schematic, compiled performance over directive overhead. Tags: control-flow, templates

## 2026-07-13 - version 0.2.14

- Wired all real app components to dock launcher — clicking dock icons now opens the actual apps instead of PlaceholderApp
- App component mapping: Finder → `FinderApp`, About → `AboutApp`, Projects → `ProjectsApp`, Terminal → `TerminalApp`, Settings → `SystemPreferencesApp`, Contact → `ContactApp`; Thoughts remains `PlaceholderApp` pending dedicated app
- `PlaceholderApp` retained as fallback for any unregistered app IDs
- Updated dock-launcher integration test to assert component registration without coupling to a specific component type

## 2026-07-13 - version 0.2.13

- `ContactApp` component (standalone) styled like macOS Mail compose — toolbar header, labeled fields, accent-colored send button
- Reactive form via `FormBuilder.nonNullable.group()` with `Validators.required` and `Validators.email`
- Validation errors shown per-field when touched: name required, valid email required, message required
- Submit button disabled when form invalid or submission pending
- `submissionStatus` signal cycling `idle → pending → success` with simulated async submission (500ms)
- Loading indicator, success message, and error state rendered via `@if` on status signal
- Form auto-resets after successful submission
- 10 TDD tests: field rendering, disabled submit, 3 validation errors (name/email/message), enabled submit, submission trigger, loading state, success message, form reset

## 2026-07-13 - version 0.2.12

- `FileSystemService` (providedIn root) — virtual file tree backed by `Map<string, FileEntry[]>` with `getChildren(path)` API
- Root entries: `/Applications/`, `/Thoughts/`, `/Projects/`, `/Preferences/` (all folders)
- `/Applications/` populated from all 7 dock apps; `/Thoughts/` populated dynamically from `THOUGHTS` data; `/Projects/` and `/Preferences/` with launcher shortcuts
- Each `FileEntry` has name, type (file/folder), icon, path, and action metadata (e.g. `launch:terminal`, `thought:signals`)
- `FinderApp` component (standalone) styled like macOS Finder — sidebar with Favorites, dual-column view, toolbar with back/forward navigation
- Signal-based navigation history for back/forward; `computed` breadcrumb trail from current path
- Sidebar click navigates to directory; folder click renders children in adjacent column; file click emits `openFile` output with action string
- `@for` with `track` for entries and sidebar items; `@if` for conditional child column
- 13 TDD tests: 6 service (root entries, folder type, app children, thought files, entry metadata, empty path), 7 component (sidebar, column rendering, navigation, folder expansion, breadcrumb, file event, toolbar buttons)

## 2026-07-13 - version 0.2.11

- `SettingsService` (providedIn root) with signal-based state for theme, clockFormat, wallpaper, dockSize, accentColor
- localStorage persistence via `effect()` — saves on any signal change, restores on initialization; SSR-safe with `isPlatformBrowser` guard
- Setter methods: `setTheme()`, `setClockFormat()`, `setWallpaper()`, `setDockSize()`, `setAccentColor()`
- `SystemPreferencesApp` component (standalone) styled like macOS System Settings — sidebar navigation with 3 panes
- Appearance pane: theme toggle (light/dark), accent color picker with 6 swatches + current indicator
- Desktop & Dock pane: dock size range slider with live value display, wallpaper preview
- General pane: clock format toggle (12h/24h)
- `@switch` for pane routing, `@for` for sidebar items and color swatches
- 14 TDD tests: 8 service (defaults, setters, localStorage persist/restore), 6 component (sidebar rendering, default pane, pane switching, theme toggle, dock slider, accent color)

## 2026-07-13 - version 0.2.10

- Fixed "Cannot GET /" error by adding empty-path root route (`path: '', pathMatch: 'full'`) to `app.routes.ts`
- Changed `**` catch-all server route from `RenderMode.Prerender` to `RenderMode.Client` so the SSR engine serves the app shell for unmatched routes
- `ThoughtsService` (providedIn root) with `getAll()` (sorted newest first), `getBySlug()`, `getByTag()` methods
- Expanded `ThoughtEntry` interface with `tags`, `content`, and `relatedApp` fields; 3 full thought entries (signals, httpResource, TDD)
- `ThoughtsListComponent` (standalone) rendering thought cards via `@for` with `track` — each card shows title, date, tag pills, and summary preview
- Card click navigates to `/thoughts/:slug` via `Router`
- `ThoughtDetailComponent` (standalone) rendering full thought content from route param, back button, tag pill badges, `@if` not-found state
- Lazy-loaded routes in `app.routes.ts`: `/thoughts` (list), `/thoughts/:slug` (detail) via `loadComponent`
- Server route config: parameterized `/thoughts/:slug` set to `RenderMode.Client` to avoid prerender param errors
- 11 TDD tests: 5 service (sort order, slug lookup, unknown slug, tag filter, unknown tag), 3 list (card count, card content, navigation), 3 detail (content rendering, back navigation, tag badges)

## 2026-07-12 - version 0.2.9

- `CommandParserService` (providedIn root) — pure-logic command parser with `parse()` returning `ParseResult` (output + optional clear flag)
- Commands: `help` (lists all commands), `about` (developer info), `clear` (clear signal), `echo <text>`, `thoughts [slug]` (list or view entries), `ls` (directory listing), unknown command fallback
- `ThoughtEntry` interface and `THOUGHTS` data in `thoughts-content/thoughts-data.ts` — 3 entries: signals, httpResource, TDD with slug/title/date/summary
- `TerminalApp` component (standalone) styled like macOS Terminal.app — dark background (#1a1a1a), SF Mono/Menlo monospace font, green `$` prompt, signal-driven history
- Command input with Enter submission, history rendered via `@for` (newest at bottom), `submitCommand()` public API
- `clear` command resets history signal to empty array
- 13 TDD tests: 9 for command parser (help/about/clear/echo/thoughts list/thoughts lookup/thoughts not found/ls/unknown), 4 for terminal (input rendering, Enter submission, history order, component structure)

## 2026-07-12 - version 0.2.8

- `ProjectsApp` component (standalone) showcasing Angular 21's `httpResource()` reactive async primitive
- `ProjectsService` with `httpResource` fetching GitHub repos via reactive URL driven by `search` signal
- Loading, error, and empty states rendered via `@if` status checks on resource signals
- Project cards rendered via `@for` with `track`, each showing name, description, star count, and language
- Client-side search/filter input with local signal — filters fetched repos by name/description without re-fetching
- `thoughtRequested` output for cross-app navigation
- `provideHttpClient(withFetch())` added to `app.config.ts` for runtime HTTP support
- 9 TDD tests: search input rendering, loading state, card rendering with mock data, card content (name/description/stars/language), error state, empty filter state, thoughts button event, service httpResource construction, service reactive search re-fetch

## 2026-07-12 - version 0.2.7

- `AboutApp` component (standalone) styled like macOS "About This Mac" — centered layout, large avatar icon, name/title, tabbed content area
- Profile: Paul Sumido, Software Engineer, with GitHub and LinkedIn links
- Three tabs (Overview, Skills, Experience) switched via `@switch` on `activeTab` signal
- Overview: intro text + "thoughts" link emitting `thoughtRequested` output
- Skills: TypeScript/JavaScript, Angular/React, Node.js/Python, Cloud (AWS/GCP), System Design
- Experience: placeholder entry for web application work
- `view-transition-name` on tab content area for View Transitions API support
- 9 TDD tests: name/title rendering, avatar, tab labels, default tab, tab switching (Skills/Experience), @switch exclusivity, thoughtRequested event, social link hrefs

## 2026-07-12 - version 0.2.6

- `ContextMenuComponent` (standalone) with macOS-style translucent vibrancy panel, backdrop blur, rounded corners, subtle separators
- Signal-driven visibility and position (`open(x, y)` / `close()` API), `@if` toggle, `@for` item rendering
- Menu items: New Folder (disabled), Get Info, Change Desktop Background..., View Thoughts, About This Mac — with separator groups
- Disabled items rendered with muted style but don't emit click events
- `action` output emits item ID on click, auto-closes after selection
- Click-outside-to-dismiss via document `mousedown` listener with proper cleanup on destroy
- `DEFAULT_DESKTOP_MENU_ITEMS` exported constant for reuse
- Integration: right-click on `<app-desktop>` opens context menu at cursor; suppressed over desktop icons
- "View Thoughts" and "About This Mac" actions wired to launch respective apps via `DockService.handleDockClick`
- 10 TDD tests: visibility toggle, cursor positioning, item rendering via @for, action emission, close on click, close on outside click, disabled item behavior, desktop surface integration, icon exclusion, click-outside dismissal

## 2026-07-12 - version 0.2.5

- `DesktopIconComponent` (standalone) with signal inputs (`id`, `icon`, `label`), renders emoji icon + white text label with drop shadow
- Single-click selection with rounded-rect highlight (`selected` CSS class), managed via `viewChildren` for mutual exclusivity
- Double-click emits `launched` output with app ID
- `DesktopIconsComponent` container rendering 3 icons (README.md, Projects, Thoughts) via `@for` with `track`
- Icons arranged in a column-flex grid aligned top-right (macOS desktop file layout)
- Wired into app shell between `<app-desktop>` and `<app-menu-bar>`
- 7 TDD tests: icon/label rendering from inputs, single-click selection, deselection of previous, double-click launch event, @for rendering, grid layout assertion, icon content verification

## 2026-07-08 - version 0.2.4

- `PlaceholderApp` component with signal inputs (`appId`, `icon`), renders "coming soon" message
- All 7 pinned dock apps auto-registered in `AppLauncherService` with `PlaceholderApp` as default component
- Dock `onIconClick` wired to `AppLauncherService.launch()` + `DockService` state management (launch/focus/minimize cycle)
- End-to-end integration: dock click → app launcher → window manager → dock indicator updates
- 7 integration tests: dock click calls launcher with correct app ID, creates window in WindowManagerService, window title matches dock label, close removes from window manager, close updates dock running indicator, PlaceholderApp renders correctly, all apps registered
- Window rendering layer in root `App` component — the first "it works end-to-end" moment
- `@for` loop over `launcher.launchedWindows()` rendering `<app-window>` per launched app
- Each window bound to `WindowManagerService` state: position, size, title, z-index, isActive
- `NgComponentOutlet` inside each `<app-window>` dynamically renders the app component (PlaceholderApp)
- `(closed)` / `(minimized)` / `(maximized)` outputs wired back to both `WindowManagerService` and `DockService`
- `(pointerdown)` on window triggers focus via `WindowManagerService.focusWindow()` + `DockService.focusApp()`
- Minimized windows hidden via `display: none` (not destroyed — preserves component state)
- z-index from `WindowManagerService` applied via `[style.z-index]` for proper window stacking

## 2026-07-08 - version 0.2.3

- `AppLauncherService` (providedIn root) mapping app IDs to component types and metadata
- `register()` adds app registrations (appId, title, icon, component type, optional default size)
- `getRegistration()` retrieves registration metadata by app ID
- `launch()` creates a window via `WindowManagerService`, tracks launched component type, returns window ID
- Launching same app twice creates separate window instances with unique IDs
- `launch()` returns null gracefully for unknown app IDs without creating windows
- `launchedWindows` read-only signal tracking active windows with their component types
- `closeLaunchedWindow()` removes from both `WindowManagerService` and launched tracking
- 11 TDD tests: registry storage, metadata, launch/close lifecycle, duplicate instances, unknown app handling, component type tracking

## 2026-07-08 - version 0.2.2

- `WindowManagerService` (providedIn root) managing window lifecycle and z-index ordering
- `_windows` private signal array of `WindowState` (id, appId, title, x, y, width, height, minimized, maximized, zIndex)
- `windows` computed for read-only external access (no `.set`/`.update` exposed)
- `focusedWindowId` computed signal tracking the currently focused window
- `openWindow()` creates window state with auto-incremented id and z-index, auto-focuses
- `closeWindow()` removes window and focuses topmost remaining
- `focusWindow()` assigns highest z-index and sets focused id
- `minimizeWindow()` sets minimized flag and focuses next visible window
- `maximizeWindow()` toggles maximized flag
- `getWindow()` and `updateWindow()` for state lookup and partial updates
- 16 TDD tests covering open/close/focus/minimize/maximize, z-index ordering, unique ids, read-only signal, and edge cases

## 2026-07-08 - version 0.2.1

- Window drag behavior via pointer events on the title bar, with viewport bounds clamping
- Drag excluded from traffic-light buttons and thoughts button (via `closest()` check)
- Window resize from all 8 edges/corners (e, w, n, s, se, sw, ne, nw) with dedicated resize handles
- Minimum window size enforcement (200x150) during resize
- `linkedSignal` for mutable position (`posX`, `posY`) and size (`w`, `h`) derived from inputs
- `transform` linkedSignal deriving CSS `translate()` string from position signals
- Resize handle cursor styles (ew-resize, ns-resize, nwse-resize, nesw-resize)
- Grab/grabbing cursor on title bar during drag
- 9 TDD tests: drag updates position, drag ignores traffic lights, viewport bounds clamping, resize from right/bottom/corner edges, minimum size enforcement, linkedSignal transform derivation and updates

## 2026-07-08 - version 0.2.0

- `WindowComponent` (standalone) built test-first with 10 tests written before implementation
- Signal inputs: `title`, `icon`, `width`, `height`, `x`, `y`, `isActive`
- Outputs via `output()`: `closed`, `minimized`, `maximized` events
- macOS-style window chrome: traffic-light buttons (red close, yellow minimize, green maximize) with symbols on hover, centered title, thoughts button (ⓘ)
- `<ng-content>` projection for window body content
- `.active` class toggling: focused shadow, full opacity; inactive windows get dimmed with gray traffic lights
- Rounded corners (10px), dark translucent titlebar, backdrop blur, subtle shadow

## 2026-07-08 - version 0.1.6

- Retroactive tests for `MenuBarComponent` (7 tests): renders, Apple logo, active app name, menu items, clock rendering, clock signal updates via Vitest fake timers, translucent/blur styling class
- Retroactive tests for `DockService` (9 tests): initial state, launch/close/focus, `isRunning`, `focusedAppId` computed, no duplicates on re-launch, transient apps for non-pinned apps
- Retroactive tests for `DockComponent` (8 tests): renders all 7 items, icon emoji + tooltip, click delegates to service, running app dot indicator, focused app active indicator, unfocused inactive indicator, non-pinned apps after separator, cleanup on close

## 2026-07-08 - version 0.1.5

- Retroactive characterization tests for `DesktopComponent` (5 tests): renders, position fixed/inset 0, display block, default wallpaper signal value, wallpaper signal updates rendered background
- Fixed broken `App` spec that referenced removed `<p>` element

## 2026-07-08 - version 0.1.4

- `DockService` (providedIn root) managing shared app state across components via signals
- `runningApps` signal (Map of app id to state: `running` | `focused` | `minimized`) with Finder running by default
- `appIndicators` computed signal deriving indicator state (`active`/`inactive`) from running apps
- `focusedAppId` computed signal for the currently focused app
- `transientApps` signal for non-pinned running apps shown after the dock separator
- macOS-style dock click behavior: launch if not running, focus if backgrounded/minimized, minimize if already focused
- `launchApp`, `focusApp`, `closeApp` methods with automatic focus management (unfocuses previous app)
- Dock component refactored to consume `DockService`, indicators conditionally rendered with active/inactive styling
- Active indicator glows with `box-shadow`, inactive shows dimmed dot

## 2026-07-08 - version 0.1.3

- `DockComponent` (standalone) floating at the bottom center with translucent background, backdrop blur, and rounded corners
- 7 app icons (Finder, About, Projects, Terminal, Thoughts, Settings, Contact) rendered via `@for` with rounded-rect tiles, glossy overlay, and emoji icons
- Signal-driven magnification effect: `mouseX` signal tracks cursor position, `computed()` derives per-icon scale using cosine falloff for smooth neighbor scaling
- Tooltip labels on hover, dot indicators for running apps
- Vertical separator before a "recent apps" section (Notes)
- Reflective surface hint via gradient pseudo-element, icon shadows, and glossy tile overlays
- `launchApp()` method wired to icon clicks

## 2026-07-08 - version 0.1.2

- `MenuBarComponent` (standalone) fixed to the top of the screen with translucent dark background and backdrop blur vibrancy
- Apple logo SVG icon, active app name (bold), and menu items (File, Edit, View, Window, Help) on the left
- Live clock on the right using a signal updated every second via `effect()` and `setInterval`, with proper cleanup via `DestroyRef`
- macOS-style hover/active states on menu items
- Tabular-nums font variant for non-jumping clock digits

## 2026-07-07 - version 0.1.1

- `DesktopComponent` (standalone) filling the entire viewport as the base layer (`position: fixed; inset: 0`)
- Default wallpaper as a dark gradient with subtle blue-purple tones, held in a signal for runtime swapping
- Integrated desktop into the app shell

## 2026-07-07 - version 0.1.0

- Desktop OS folder structure: `desktop/`, `menu-bar/`, `dock/`, `window-manager/`, `apps/`, `shared/`, `thoughts-content/`
- macOS dark mode theme (`desktop-theme.scss`) with CSS custom properties for menu bar, dock, window chrome, desktop background, text, borders, accent colors, surfaces, scrollbars, and transitions
- Global reset in `styles.scss` with theme import, scrollbar styling, and base element resets
- Switched project from CSS to SCSS
