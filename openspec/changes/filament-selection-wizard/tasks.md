# Tasks

## 1. Wizard flow and answer lifecycle

- [x] 1.1 Use seven stable step identifiers in the original section order; verify fixed 1/7 through 7/7 progress, previous/next navigation, and grouped conditional fields.
- [x] 1.2 Preserve unanswered application choice, editable preset suggestions, back/forward answers, tab state, edit, restart, and completed-step invalidation; verify same-preset reselection retains edits and changing type reloads suggestions.
- [x] 1.3 Validate every applicable field in its section and all seven sections before completion; verify numeric boundaries, unknown-temperature assumptions, minimum temperature, liquid contact levels, equipment limits, and non-blocking peak clamping.

## 2. Wizard steps and final results

- [x] 2.1 Render the seven original sections as seven wizard screens; keep conditional color, outdoor, chemical, mechanical, and equipment details within their corresponding section, and ensure answers never auto-advance.
- [x] 2.2 Gate recommendations until successful submission of step seven, preserve state across tabs, and retain existing selector cleanup and other-tab behavior.
- [x] 2.3 Retain Editar respuestas and Empezar de nuevo while preserving comparison, near misses, exclusions, assumptions, quotation, copying, and printing; verify equivalent completed answers produce unchanged rankings and quotation.
- [x] 2.4 Keep labelled controls, focus management, accessible progress out of seven, associated errors, and inert outgoing panels; verify semantic markup and focused state checks, recording runtime behavior as unverified without authorized browser inspection.
- [x] 2.5 Update README selector usage to explain the seven grouped steps, conditional details, explicit continuation, final results, editing, and restart.

## 3. Responsive action footer

- [x] 3.1 Keep shared actions in normal desktop flow and fixed mobile positioning at 900px and below, including step one and results; verify disabled Atrás on the first step, final Ver resultados, results actions, and inactive-tab hiding.
- [x] 3.2 Keep safe-area padding, 44px minimum touch targets, measured footer clearance, focused-field scroll clearance, and VisualViewport keyboard handling with cleanup and fallback; verify calculations and review CSS for transformed ancestors.
- [x] 3.3 Keep print rules that omit wizard actions while retaining the report; verify wrapped footer labels, selector-only clearance, and print exclusion.

## 4. Step transition animations

- [x] 4.1 Keep shared 200ms/ease-out tokens and directional transform/opacity CSS transitions outside the stationary footer; verify curve, direction, composite-only properties, and no animation dependency.
- [x] 4.2 Preserve transition cancellation, stale-completion protection, unique IDs, and inert outgoing content with fixed step IDs; verify rapid forward/back/forward settles on the intended step.
- [x] 4.3 Keep reduced-motion fade and instant keyboard navigation; verify media queries and activation-source handling and retain the animation feel checklist for later authorized inspection.

## 5. Integration checks and handoff

- [x] 5.1 Inspect the root packageManager field and run focused wizard checks, existing domain/persistence checks, typecheck, production build, and Pages checks using the repository-declared pnpm through Corepack; record outcomes without reinstalling dependencies.
- [x] 5.2 Review the final diff against the seven-step spec, preserve unrelated migration/hosting work, and record browser-dependent behavior as unverified because browser inspection was not requested.

## Workflow follow-up

- Inspect mobile safe areas, keyboard-open numeric input, wrapped footer actions, scrolling to final content, results editing, reduced motion, keyboard focus, printing, and rapid transition reversal only if the user explicitly requests browser inspection. Do not open a browser or run browser automation without that request.

## Implementation Verification

Passed:

- corepack pnpm run verify:wizard
- corepack pnpm run verify:domain
- corepack pnpm run verify:persistence
- corepack pnpm typecheck
- corepack pnpm build
- corepack pnpm run verify:pages-build
- corepack pnpm run verify:pages-workflow

The root package declares pnpm 12.14.0; commands were run through Corepack without reinstalling dependencies.

Browser inspection was not performed. Mobile keyboard behavior, runtime focus behavior, printing appearance, and transition feel remain unverified. Their source-level behavior and viewport calculations are covered by focused checks.

The existing Explorer and curator components, domain calculations, persistence implementation, Vite entry document, and GitHub Pages workflow remain outside the selector flow changes.
