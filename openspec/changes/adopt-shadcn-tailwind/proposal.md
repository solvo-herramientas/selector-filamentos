# Proposal

## Why

The application uses a custom stylesheet and repeated native control markup. Adopting Tailwind CSS and locally owned shadcn/ui primitives will provide a consistent foundation for future UI work while retaining the current Solvo appearance and interactions.

## What Changes

- Integrate Tailwind CSS into the existing Vite build and configure shadcn/ui for React and TypeScript.
- Map the current colors, fonts, radii, and focus treatment into shared theme tokens, including existing automatic and explicit dark themes.
- Adopt customized shadcn/ui buttons, inputs, labels, checkboxes, and radio groups in the wizard and supporting panels; use Tailwind utilities for migrated styling.
- Preserve the yellow accent, compact technical presentation, responsive layouts, custom material cards and graphics, and existing motion. Small control-level visual deviations are acceptable.
- Migrate all specialized application CSS to Tailwind utilities, including tables, graphics, motion, print, and responsive behavior, following the user's expanded scope. Retain only theme definitions and a minimal global base in the stylesheet.
- Preserve selection logic, validation, keyboard navigation, persistence, Spanish copy, and GitHub Pages deployment behavior.

## Capabilities

### New Capabilities

None. This is a UI implementation refactor with no new product capability.

### Modified Capabilities

None. Existing product behavior remains the acceptance baseline. This change sets `skip_specs: true` because no spec-level behavior changes are intended.

## Impact

- Build configuration, TypeScript import aliases, package dependencies and lockfile, a new shadcn `components.json`, and local UI primitives/utilities.
- `src/styles.css`, `src/App.tsx`, and the wizard, results, explorer, comparison, and curator components as needed for shared controls.
- No domain algorithm, persisted data format, external API, or deployment-path changes.
- Validation uses existing typechecking, production build, domain/wizard/persistence checks, and Pages checks. Browser inspection or automation requires an explicit user request.
