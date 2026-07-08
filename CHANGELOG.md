# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2026-07-07

- `DesktopComponent` (standalone) filling the entire viewport as the base layer (`position: fixed; inset: 0`)
- Default wallpaper as a dark gradient with subtle blue-purple tones, held in a signal for runtime swapping
- Integrated desktop into the app shell

## [0.1.0] - 2026-07-07

### Added

- Desktop OS folder structure: `desktop/`, `menu-bar/`, `dock/`, `window-manager/`, `apps/`, `shared/`, `thoughts-content/`
- macOS dark mode theme (`desktop-theme.scss`) with CSS custom properties for menu bar, dock, window chrome, desktop background, text, borders, accent colors, surfaces, scrollbars, and transitions
- Global reset in `styles.scss` with theme import, scrollbar styling, and base element resets
- Switched project from CSS to SCSS
