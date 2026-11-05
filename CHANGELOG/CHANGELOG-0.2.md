# Changelog 0.2

## [0.2.2](https://github.com/project-cdim/mf-core/compare/v0.2.1...v0.2.2) - 2026-11-05

The changes from v0.2.1 are as follows:

### Features

- Add new "Warning Alerts" tile to the dashboard
- Add new "Undetected Resources" tile to the dashboard
- Add Alerta Web integration information display
  - Add an icon with a count badge to the header
  - Click icon to display a dialog showing the alert details
  - Click the information in the dialog to navigate to the Alerta Web UI

### Other Changes

- Migrate from Pages Router to App Router
- Change the design of dashboard tiles with icons
  - When the count is 0, display a white background and hide the icon
- Change access to each micro frontend to go through Kong
  - Change the connection URLs for each micro frontend set in `.env`

## [0.2.1](https://github.com/project-cdim/mf-core/compare/v0.2.0...v0.2.1) - 2026-03-26

The changes from v0.2.0 are as follows:

### Bug Fixes

- Fix build error

## [0.2.0](https://github.com/project-cdim/mf-core/compare/v0.1.1...v0.2.0) - 2026-03-24

The changes from v0.1.1 are as follows:

### Features

- Add new "Maintenance Resources" tile to the dashboard
- Add alert history viewing feature
  - Add new "Alerts" tile to the dashboard
  - Click tile to navigate to the Alerta Web UI

### Other Changes

- Unify line break settings and abbreviation displays across all tables
- Bump React Server Components version to address security vulnerability
