# Tasks

## 1. Reference and toolchain

- [x] 1.1 Record the original Git revision, style block, material data, defaults, metadata, and Pages source as the migration reference; verify the recorded reference can be read independently of the modified working tree.
- [x] 1.2 Add Vite, React, TypeScript, strict application/config checking, and compatible declared Node and package manager versions; inspect `packageManager` before pnpm invocations, use `corepack pnpm`, commit the lockfile, and verify a frozen-lockfile installation succeeds.
- [x] 1.3 Add `dev`, `typecheck`, `build`, and `preview` scripts plus generated-output ignores; verify the initial React entry type-checks and builds, and document the toolchain and commands in README, including the replacement of direct-file execution.

## 2. Typed data, calculations, and persistence

- [x] 2.1 Extract typed materials, chemicals, presets, labels, and equipment constants into domain modules; verify all values, text, and source ordering match the original reference.
- [x] 2.2 Extract condition derivation, evaluation, rankings, near matches, limiting conditions, and manufacturing recommendations into pure typed functions; verify outputs against the original for every preset and meaningful thermal, chemical, equipment, tie, and empty-input boundary cases.
- [x] 2.3 Extract exploration rules, radar values, and quotation generation; verify name/keyword/temperature precedence, manual sorting, comparison calculations, and quotation strings against representative original outputs.
- [x] 2.4 Implement guarded persistence using the original keys, numeric overlay rules, curator flag, and reset behavior; verify current and legacy saved records, malformed values, unavailable storage, and restoration of defaults without premature overwrites.

## 3. React interface with preserved styles

- [x] 3.1 Copy the original stylesheet unchanged, preserve document metadata and font loading, and import the existing logo; verify byte-for-byte CSS identity and a source audit of metadata and asset preservation.
- [x] 3.2 Convert the site bar, header, tab navigation, methodology, and footer to JSX while preserving element structure, classes, IDs, labels, and whitespace; verify all panels remain mounted with `hidden` and type checking passes.
- [x] 3.3 Implement the selector form and shared segmented controls with React state, original presets/defaults, synchronized temperature inputs, raw numeric editing, progressive visibility, assumptions, and validation; verify state transitions and derived values against the reference cases without browser automation.
- [x] 3.4 Render summary, limiting condition, matching/near-matching/excluded materials, recommendations, and quotation from derived state; verify counts, result ordering, text, conditional sections, and inline style values against the reference cases.
- [x] 3.5 Implement comparison selection, its three-material limit and two-material display threshold, clearing, the existing SVG radar, and comparison table; verify selection transitions and generated values/attributes match the reference.
- [x] 3.6 Implement explorer cards, keyword search, sorting, and chemical matrix; verify source structure, labels, highlights, ordering, and results using the domain cases from task 2.3.
- [x] 3.7 Implement curator access, editing, immediate recalculation, edited-cell highlighting, JSON copy, and reset; verify `#curador` preserves the initial selector tab, stored access is restored, and committed edits update selector/explorer state and persistence.
- [x] 3.8 Implement clipboard copying and its existing fallbacks, transient feedback, framed print visibility, result scrolling, and intersection observation with effect cleanup; verify browser effects are isolated, cleanup is present, and source behavior retains reduced-motion and print rules.

## 4. Build and Pages workflow

- [x] 4.1 Configure Vite's `/selector-filamentos/` base and static asset handling; verify a production build references scripts, styles, and the logo at the project path and retains canonical/social metadata.
- [x] 4.2 Add `.github/workflows/pages.yml` with pull-request, `main` push, and manual triggers, declared toolchain setup, frozen dependency installation, store caching, and the checked build; verify workflow structure and command agreement with package metadata and README.
- [x] 4.3 Add official Pages artifact upload and dependent deployment, the `main`/event guard, scoped permissions, deployment environment URL, and concurrency that isolates PR runs; verify PRs and non-main manual runs cannot deploy and failed builds cannot reach deployment.
- [x] 4.4 Document the legacy-to-Actions Pages source transition, first-deployment checks, and rollback in README; verify instructions name the current project URL, branch, artifact, and coordinated source switch correctly.

## 5. Integrated acceptance and handoff

- [x] 5.1 Run the integrated domain/persistence checks, strict type checking, and production build; serve the built artifact under `/selector-filamentos/` and verify HTTP availability and asset paths without opening a browser. Record results and any failures for the reviewed revision.
- [x] 5.2 Audit the finished JSX and CSS against the original for responsive, theme, print, hidden-panel, SVG, native input, and whitespace parity; deliver a manual review matrix covering all tabs and the 440/560/640/700/900 px breakpoints. Perform browser inspection only after an explicit user request, or record user-supplied manual confirmation; otherwise state that exact visual parity remains unverified.
- [x] 5.3 Review the final diff for unrelated changes and generated files; provide the implementation summary, validation evidence, any pending visual acceptance, and the concrete deployment instructions for review.

## Workflow follow-up

- When rollout is authorized, coordinate the Pages publishing-source transition with merging the reviewed change, follow its first Actions deployment, and confirm the existing public URL and `#curador` entry point. Browser inspection still requires an explicit user request.
- Archive this change when implementation and the project's review requirements are satisfied; retain any pending visual acceptance visibly rather than claiming verification that did not occur.
