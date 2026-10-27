# Proposal

## Why

“Elegir filamento” currently presents a long form alongside recommendations that change before the user has finished describing the piece. A seven-step wizard will let users complete one original section at a time and receive their recommendation after the final step.

## What Changes

- Replace the simultaneous form and results layout with a Spanish-language wizard of exactly seven fixed steps and a final results screen.
- Keep the original sections together: piece type; temperatures and heat; outdoor exposure; liquid and chemical contact; mechanical stress; special requirements; manufacturing and equipment.
- Start with an explicit choice of piece type; use application presets as editable suggestions for subsequent questions.
- Provide Atrás and Continuar on each step, Ver resultados on step seven, and editing/restart actions on results. Selecting an answer does not advance automatically.
- Show relevant conditional follow-ups inside their original step while preserving answers when navigating backward or switching tabs.
- Give every wizard screen, including results, a fixed mobile action footer with safe-area and keyboard accommodation and content clearance.
- Add brief, directional step transitions following the animate skill, with a stationary footer, interruption handling, reduced motion, and instant keyboard navigation.
- Preserve existing recommendation calculations, material comparison, quotation, printing, and curator data integration.

## Capabilities

### New Capabilities

- `filament-selection`: Seven-step wizard, conditional fields, final recommendation delivery, mobile controls, and accessible transitions.

### Modified Capabilities

None. The project has no published capability specs; the existing migration change remains historical context.

## Impact

- Affects `src/App.tsx`, `src/components/SelectorForm.tsx`, `src/components/ResultsPanel.tsx`, and `src/styles.css`; introduces a small, independently testable wizard flow model and navigation component as needed.
- Reuses `RawAnswers`, application presets, condition derivation, ranking, comparison, quotation, and material persistence.
- No new service, routing scheme, storage format, or animation dependency is required. Hosting configuration and the other app tabs are outside this change.
