# Changelog

All notable changes to this project will be documented in this file.

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
