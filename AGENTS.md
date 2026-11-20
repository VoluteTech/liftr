# AGENTS.md

## Project

Liftr is a personal, offline-first PWA for logging gym lifts and **ranking** them
(Iron → Bronze → Silver → Gold → Platinum → Diamond…) based on strength standards.
Single user, no backend, no accounts. Primary target: iPhone 11, Safari, installed
to the Home Screen. Development machine: Omarchy (Arch Linux).

Ranking is the core feature. Keep scope tight: no social features, no workout
programming, no calorie tracking.

## Stack

- Vite + React + TypeScript (strict mode)
- Tailwind CSS (via `@tailwindcss/vite`)
- Dexie (IndexedDB) for all persistence
- `vite-plugin-pwa` for manifest + service worker
- Recharts for charts
- Vitest for tests, Oxlint for linting, Oxfmt for formatting
- Hosting: Cloudflare Pages

## Commands

## Commands
- `npm run dev` – dev server (use `-- --host` to test on phone over LAN)
- `npm run build` – typecheck + production build
- `npm run test` – Vitest
- `npm run lint` – Oxlint (`lint:fix` to autofix)
- `npm run format` – Oxfmt, formats files in place
- `npm run format:check` – Oxfmt check only, no writes

Before finishing any task, run:
`npm run format && npm run lint && npm run test && npm run build`

## Structure

```
src/
  engine/     # pure TS: e1RM, standards table, tier logic (NO React, NO Dexie)
  db/         # Dexie schema, queries, JSON export/import
  features/   # screens grouped by feature (log, rankings, exercise, history, onboarding)
  components/ # shared UI
  lib/        # small utilities
```

## Rules

- **Ranking logic lives only in `src/engine/`.** It must be pure functions with
  unit tests. Never put rank calculations inside components or DB code.
- Estimated 1RM uses Epley: `weight × (1 + reps / 30)`. Ranks use e1RM divided
  by bodyweight, compared against per-exercise, per-sex thresholds.
- All data access goes through `src/db/`. Components never import Dexie directly;
  use the exported hooks/queries.
- Changing the Dexie schema requires a new `db.version(n)` with a migration.
  Never edit a released version in place.
- Store weights in **kg** internally; convert only at the UI layer.
- Store dates as epoch milliseconds (UTC).
- Don't add dependencies without asking. Prefer the platform and existing stack.
- No `localStorage` for app data; Dexie only (small UI prefs excepted).
- No `any`. Prefer small, typed functions over classes.
- Formatting is handled only by Oxfmt (`.oxfmtrc.json`). Don't hand-format code
  or add Prettier/ESLint; run `npm run format` instead.
- Linting is handled only by Oxlint (`.oxlintrc.json`). Fix warnings and errors
  rather than disabling rules. Don't add `// oxlint-disable` comments without
  a stated reason.
- Don't change `.oxlintrc.json` or `.oxfmtrc.json` unless asked.

## PWA / iOS constraints

- Service workers need HTTPS. Test PWA behavior on the deployed URL, not LAN HTTP.
- iOS keeps Safari-tab storage separate from the installed app. Test with the
  installed Home Screen version.
- Call `navigator.storage.persist()` on first launch.
- No Vibration API on iOS Safari; don't rely on it. Avoid features needing push.
- Layout must handle the notch/home indicator (`env(safe-area-inset-*)`) and work
  at 375–390px wide.
- Keep JSON export/import working whenever the schema changes. It's the only backup.

## UI conventions

- Mobile-first, dark theme by default, large tap targets (≥44px).
- Logging a set should take as few taps as possible. Fast input beats fancy UI.

## Don't

- Don't commit `dist/`, `node_modules/`, or `.env*`.
- Don't rewrite the strength-standards table without being asked; it's data, and
  changes affect every user's ranks.
- Don't commit unformatted code. `npm run format:check` must pass.
