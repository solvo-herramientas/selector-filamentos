# Design

## Context

See `proposal.md` for motivation and scope. The current `index.html` contains one global stylesheet, static markup, 15 material records, presets, scoring rules, generated HTML, and DOM event handlers. There is no package manifest, build system, or committed workflow. GitHub Pages currently publishes `main:/` using legacy branch publishing at the existing project URL, with no custom domain.

Appearance depends on global selectors, nested element structure, inline values, native controls, `[hidden]`, root theme attributes, Google Fonts, and an SVG radar. Browser storage uses `selfil-db-v4`, a `selfil-db-v3` fallback, and `selfil-curador`. The startup fragment `#curador` enables curator access but does not automatically select the curator tab.

## Goals / Non-Goals

**Goals:**

- Make React own rendering and state while isolating typed calculations from browser effects.
- Make source-level CSS identity and visual parity explicit acceptance criteria.
- Keep the current public origin and path so existing links and saved browser data continue to work.
- Provide one reproducible local and CI toolchain and a deployable static artifact.

**Non-Goals:**

- Redesign, changes to wording or material values, scoring improvements, routing, a backend, or additional product features.
- A component library, CSS framework, charting library, global state library, or a new persistence format.
- A service worker or a replacement for directly opening the original HTML from disk.
- Publishing or changing remote repository settings as part of creating these planning artifacts.

## Decisions

### 1. Use React components backed by typed domain functions

Create `src/main.tsx` and `src/App.tsx`, with feature components for the selector form, results, comparison, explorer, curator table, and shared segmented controls. Keep component boundaries aligned with existing markup so fragments can avoid unnecessary wrapper elements. Keep all tabs mounted and toggle `hidden`, preserving form values, search state, scroll containers, and native details state across tab changes.

Place material data, presets, constants, condition derivation, scoring, manufacturing recommendations, exploration, and quotation generation under `src/domain/`. Define explicit types for chemical keys, material records, raw answers, derived conditions, evaluation results, tabs, and comparison selections. Preserve all numeric values, formulas, thresholds, ordering, stable tie handling, keyword precedence, and strings. Empty numeric inputs retain their editable raw value; conversion follows the original zero fallback when deriving conditions.

Alternative considered: mount the old HTML and imperative script inside React. It reduces initial translation but leaves competing DOM ownership and does not provide a maintainable React application. React should render JSX and handle events directly, including the existing SVG rather than introducing a chart dependency.

### 2. Preserve the stylesheet and rendered structure

Extract the entire current style block into `src/styles.css` without altering declarations, order, media queries, selectors, or custom properties. Import it once. Keep the existing font URL, metadata, `lang="es"`, viewport settings, and document title in the Vite HTML entry. Import the existing logo as an asset so Vite resolves its production URL.

Keep classes, IDs, accessible labels, native element types, inline dynamic styles, and inline text spacing. Audit JSX conversion of `for`, `class`, SVG attributes, `aria-selected`, boolean attributes, radio groups, and `details` behavior. Do not add Vite starter styles, resets, layout wrappers, or root sizing rules. Preserve native keyboard and focus behavior and current light/dark, reduced-motion, safe-area, responsive, and print rules.

Alternative considered: restyle the interface with scoped styles or a UI library. That would broaden the change and threaten exact parity.

### 3. Keep state explicit and browser effects narrow

Use React state for raw answers, initial-example visibility, material edits, active tab, explorer query/order/view, selected comparison IDs, and curator access. Derive conditions, rankings, counts, exclusions, limiting conditions, quotations, and comparisons from that state. Preserve preset reset behavior and the distinction between the startup example and user input. Keep comparison selections until explicitly cleared, limit selection to three, and retain the two-material minimum for showing the comparison.

Use guarded storage initialization and effectful persistence with the original keys, fallback order, numeric-field overlay by material ID, original reset semantics, and failure tolerance. Preserve the current numeric edit commit semantics in the curator table; edits recompute both selector and explorer immediately after commit. Retain edited-cell highlighting and JSON export formatting.

Use refs and effects for copying fallback selection, result scrolling, intersection observation, print availability when framed, and transient feedback timers. Clean up timers and observers, including during development remounts. No calculation should depend on reading the rendered DOM.

Alternative considered: a global state dependency. Local state and pure derived functions cover this application's scope with fewer moving parts.

### 4. Use a pinned package manager and checked production builds

Assume pnpm for this new project because no package manager is currently established. Declare an exact version in `packageManager`, commit `pnpm-lock.yaml`, and invoke it through `corepack pnpm` locally and in CI. Select mutually compatible supported React, Vite, TypeScript, plugin, package-manager, and Node versions during implementation; use the same declared Node release locally and in CI. Do not replace an existing workspace install to match a bundled pnpm version.

Provide `dev`, `typecheck`, `build`, and `preview` scripts. `build` runs TypeScript checking before Vite emits `dist/`. Use strict TypeScript settings and include the Vite configuration in checking. Ignore dependencies and generated build outputs. Document the development server and served production build in README.

Alternative considered: npm. It would also work; pnpm with an explicit version and lockfile is a routine toolchain choice and follows the repository's Corepack convention.

### 5. Publish the built artifact through GitHub Pages

See `specs/pages-publishing/spec.md` for the publishing contract. Configure Vite with `base: '/selector-filamentos/'`. Keep tabs as local state and preserve `#curador`; no client router or Pages fallback is needed.

Create `.github/workflows/pages.yml` with a build job triggered by pull requests to `main`, pushes to `main`, and `workflow_dispatch`. Set up the declared Node and pnpm versions, install with the frozen lockfile, and run the checked build. Cache the pnpm store using the lockfile. Use official checkout, Node setup, Pages setup, artifact upload, and deployment actions; resolve supported versions and pin action revisions during implementation.

The deployment job depends on the successful build from the same run, accepts only push or manual runs on `refs/heads/main`, uses the `github-pages` environment, and exposes its deployment URL. Scope `pages: write` and `id-token: write` to deployment; build needs read access only. Upload `dist/` as the Pages artifact for publishing runs. Serialize production deployments with a dedicated concurrency group, with pull-request build groups separate so PR runs cannot cancel a production deployment. Require Pages to use the GitHub Actions publishing source at rollout.

Alternative considered: commit built output to a `gh-pages` branch. Official artifact deployment avoids generated commits and fits the requested build-and-publish workflow.

### 6. Validate parity against the original source

Record the pre-migration Git revision as the reference. Compare the extracted CSS byte for byte with its original style block, and compare all material records and constants. Run meaningful domain checks against original calculations for all presets and boundary conditions: thermal margins and peaks, chemicals, equipment restrictions, near matches, ranking ties, comparison values, search precedence, and quotation text. Exercise storage loading for current data, legacy fallback, malformed or unavailable storage, and reset behavior. Run strict type checking and the production build, then inspect asset references and HTTP availability beneath `/selector-filamentos/` without browser automation.

Manual acceptance covers initial appearance, each tab, preset changes, progressive fields, comparison, explorer cards/matrix, curator edits and persistence, clipboard behavior, printing, and mobile jump behavior. The appearance matrix includes light and dark modes, print output, desktop, and narrow viewports around the 440/560/640/700/900 px breakpoints.

Browser inspection or browser automation requires the user's explicit request under repository instructions. Until authorized or the user supplies manual confirmation, report exact visual parity as unverified; source equality and a successful build alone do not establish pixel parity. Keep any deferred visual review visible in the handoff.

## Risks / Trade-offs

- JSX can change whitespace, nesting, or native control behavior → preserve markup deliberately and use the original revision as the reference for parity review.
- Controlled inputs can reset selections or make empty numeric values hard to edit → separate raw input state from derived values and preserve hidden mounted panels.
- Persistence initialization can overwrite existing saved edits → load before writing, preserve the old merge rules and keys, and validate recovery and reset cases.
- A root-relative asset can fail only in production → configure the project base and inspect the built artifact while serving the project path.
- Legacy branch publishing can expose unbuilt source after migration → coordinate the Pages source transition with the deployment-ready change and verify the first Actions run.
- Exact visual comparison depends on browser authorization or user review → document pending evidence explicitly and do not claim visual verification from source checks.
- The built app needs HTTP serving and external fonts still require connectivity → update the README without promising offline or direct-file execution.

## Migration Plan

1. Record the original revision and existing Pages source; prepare the complete migration and workflow locally.
2. Complete source, domain, type, build, and project-path checks. Provide the concrete change for review and list any pending visual checks.
3. Once rollout is authorized, switch Pages publishing to GitHub Actions in coordination with merging the reviewed migration to `main`. Do not leave the migrated root HTML published through the legacy source.
4. Follow the first build/deploy run, confirm its revision and artifact, and confirm the existing URL and `#curador` entry point. Browser-based checks still require explicit authorization.
5. If the first rollout fails, fix and redeploy the reviewed workflow/build or restore the prior application revision together with legacy `main:/` publishing. Once Actions publishing is established, ordinary rollback is a revert to a known working Vite revision and a successful redeployment. Keep the same URL and storage keys throughout.
