# Proposal

## Why

The application currently keeps its interface, styles, material database, and scoring logic in one HTML file, making typed changes and component reuse difficult. Move it to Vite, React, and TypeScript while preserving its exact appearance and behavior, and build the published site automatically with GitHub Actions.

## What Changes

- Introduce a Vite React application with TypeScript, typed domain modules, React components, and explicit application state.
- Extract the current CSS unchanged and preserve the existing element structure, classes, IDs, text, fonts, assets, responsive layouts, dark mode, print styling, and interactions.
- Preserve material values, scoring and ranking, comparison, exploration, quotations, curator editing, existing local storage formats, and the `#curador` entry point.
- Add reproducible development, type-checking, build, and preview commands with a committed lockfile and declared package manager version.
- Add GitHub Actions to build pull requests and build and publish `main` to the existing GitHub Pages URL using the `/selector-filamentos/` asset base.
- Include the Pages publishing-source transition from legacy branch publishing to GitHub Actions in the rollout instructions.
- **BREAKING**: Running the source by opening `index.html` directly from disk is replaced by the development server or a served production build. Update the README accordingly.

## Capabilities

### New Capabilities

- `pages-publishing`: Reproducible production artifacts, pull-request build checks, and automated publishing to the existing GitHub Pages project URL.

### Modified Capabilities

None. There are no existing capability specifications. Application behavior is preserved through explicit migration acceptance criteria in the design and tasks; this change introduces the publishing capability.

## Impact

- Replace the application implementation in `index.html` with a Vite HTML entry and modules under `src/`; retain the logo and document metadata.
- Add React, React DOM, Vite, TypeScript, the React Vite plugin, associated types, package metadata, a lockfile, TypeScript configuration, and ignored build/install outputs.
- Add `.github/workflows/pages.yml` and update `README.md` for development, build, publishing, and the loss of direct-file execution.
- Transition GitHub Pages from `main:/` legacy publishing to Actions during rollout. Keep `https://solvo-herramientas.github.io/selector-filamentos/` and browser storage compatibility.
- No backend or data service is required. External fonts and existing external links remain part of the current application behavior.
