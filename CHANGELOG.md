# Changelog

All notable changes to this project will be documented in this file.

## 2026-07-08 - version 0.2.1

### Added (TDD)

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
