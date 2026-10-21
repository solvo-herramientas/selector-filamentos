# Migration validation

Reviewed 2026-10-16 in the working tree based on reference revision `b5b7c559dc83b5a5ed6553639c72ec83bb7a4663`. The implementation is not committed yet.

## Automated checks

| Check | Result |
| --- | --- |
| `corepack pnpm install --frozen-lockfile` | Passed during toolchain setup. |
| `corepack pnpm typecheck` | Passed. |
| `corepack pnpm run verify:domain` | Passed: 16 data constants, 10 presets, 32 condition cases, 480 material evaluations, recommendations, radar/comparison values, 15 explorer queries, and quotation strings matched the original reference. |
| `corepack pnpm run verify:persistence` | Passed: current/legacy records, numeric overlays, malformed/unavailable storage, curator access and initial tab, shared selector/explorer edits, reset, and no startup database writes. |
| `corepack pnpm build` | Passed with Vite 8.3.4; emitted the production HTML, JavaScript, CSS, and logo. |
| `corepack pnpm run verify:pages-build` | Passed: project-path asset URLs and metadata were checked, and the output was served over HTTP at `/selector-filamentos/` with all emitted assets returning successfully. No browser was opened. |
| `corepack pnpm run verify:pages-workflow` | Passed: triggers, toolchain, commands, five full-SHA action pins, artifact, deployment guard, permissions, environment URL, and concurrency were checked. |
| Ruby YAML parse of `.github/workflows/pages.yml` | Passed. |
| Stylesheet SHA-256 | Passed: `src/styles.css` is `6ff55b5d9f395934b76e75567053e27b28d5c855a43820d0a1d277c0b7c3e7bf`, matching the captured original style block. |

No final acceptance check failed. An early workflow-check script expected the long `pnpm run build` spelling in README; README documents the equivalent `pnpm build` shorthand, and the check now accepts that form.

## Source audit

- The unchanged stylesheet retains the dark theme, `data-theme` override, 440/560/640/700/900 px responsive rules, reduced-motion rule, and print rules.
- Selector, explorer, methodology, and curator sections remain mounted and use the native `hidden` attribute to switch views. Explorer search and view state therefore remain available when another tab is selected.
- The radar retains its `0 0 360 310` viewBox, accessible image label, SVG elements, geometry, axis labels, and series styling; its generated geometry and values were compared with the original.
- The selector and curator continue to use native radio, checkbox, range, number, search, and select controls. JSX labels and content hierarchy were checked against the source reference.
- Print visibility keeps the original CSS behavior; the print button is hidden in a framed window. The jump action respects reduced-motion preferences, and the intersection observer disconnects on effect cleanup.
- Source-level parity is confirmed. Browser-rendered spacing, wrapping, and visual appearance remain unverified.

## Manual review matrix

Every cell below remains **pending visual review**. The entries identify what to inspect at each viewport width; they do not claim a browser check.

| Tab | 440 px | 560 px | 640 px | 700 px | 900 px |
| --- | --- | --- | --- | --- | --- |
| Elegir filamento | Chemical controls stack without clipping. | Compact site bar hides the back link and shortens the cafecito link. | Comparison chart and table stack; table scrolls horizontally if needed. | Form controls and result cards wrap without horizontal overflow. | Form/results become one column; fixed results button and reduced-motion scroll behave correctly. |
| Explorar materiales | Cards and the 900 px-wide chemical matrix remain reachable without page overflow. | Compact site bar remains aligned. | Cards reflow while preserving labels and badges. | Search, sort, and view controls stack. | Cards reflow and matrix remains horizontally scrollable. |
| Cómo decide | Text wraps within the page gutters. | Compact site bar remains aligned. | Documentation text remains readable with no clipping. | Documentation column keeps its 72ch maximum. | Documentation remains aligned to the page width. |
| Base de materiales | The 1700 px table scrolls horizontally; the material column stays readable. | Compact site bar remains aligned. | Sticky group headers and first column remain usable while scrolling. | Numeric inputs remain legible inside the scroller. | Curator table scrolls without widening the page; tabs and controls remain visible. |

Exact visual parity stays unverified until this matrix receives a manual browser review.
