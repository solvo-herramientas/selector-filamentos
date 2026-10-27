# Tasks

## 1. Build and theme foundation

- [x] 1.1 Inventory shared controls, theme selectors, global CSS rules, and verification-script DOM assumptions; verify the inventory covers all files in `src/components` and the methodology dialog without opening a browser.
- [x] 1.2 Check root `packageManager`, add compatible Tailwind v4/Vite and required shadcn dependencies through `corepack pnpm`, and configure Vite/TypeScript aliases and `components.json`; verify dependency resolution, alias agreement, and a successful production build with the existing base path.
- [x] 1.3 Add semantic theme mappings, fonts, radii, and explicit CSS layers while omitting Preflight initially; verify existing light/dark selectors and `[hidden]` enforcement remain present and compiled CSS contains utilities without conflicting legacy class names.
- [x] 1.4 Document the build integration, source-owned components, token mapping, and intentional retained CSS in the project documentation; verify documented file paths and commands match the configuration.

## 2. Shared primitives and wizard controls

- [x] 2.1 Generate local Button, Input, Label, Checkbox, and RadioGroup primitives plus `cn`, customize them for current compact styles, and verify typecheck and production build pass with compatible props and ref support.
- [x] 2.2 Adapt `SegmentedControl` to RadioGroup while preserving its public props, controlled values, IDs, accessible descriptions, invalid states, and small/full variants; verify callers typecheck and review generated keyboard semantics and checked-state classes against the original source.
- [x] 2.3 Migrate wizard action buttons, numeric fields, labels, and appropriate checkbox/radio controls; verify boolean/value event adapters, min/max/disabled attributes, selection-card styling, focus handlers, and sticky action-bar refs through source review and existing `verify:wizard` and `verify:domain` checks. Adjust implementation-specific assertions only if needed while retaining behavioral coverage.
- [x] 2.4 Remove obsolete wizard control selectors and document the `SegmentedControl` adapter contract alongside shared component conventions; verify no migrated caller relies on deleted selectors and examples match actual props.

## 3. Supporting panels and style cleanup

- [x] 3.1 Adopt shared buttons, numeric inputs, and applicable checkboxes in results, comparison, explorer, curator, and app-level actions; verify typecheck, curator commit handlers, comparison selection, and existing `verify:persistence` checks without changing domain or storage formats.
- [x] 3.2 Replace straightforward migrated styling with utilities and remove unused rules while retaining specialized cards, tables, native select/range controls, dialog, print, responsive, safe-area, and motion CSS; verify source references, CSS layer precedence, and preserved reduced-motion/theme rules.
- [x] 3.3 Update project documentation with retained native controls and component-extension guidance; verify each documented customization points to an existing implementation file.

## 4. Integration verification

- [x] 4.1 Inspect verification scripts for browser launches, then run authorized non-browser checks using `corepack pnpm`: typecheck, build, verify:wizard, verify:domain, verify:persistence, verify:pages-build, and verify:pages-workflow; verify all applicable checks pass and the production asset base remains `/selector-filamentos/`.
- [x] 4.2 Review the complete diff for preserved Spanish copy, ranking behavior, storage formats, focus/validation wiring, mobile layout rules, and theme handling; deliver a verification summary that explicitly states visual parity was not browser-tested and records any small expected control differences.

## 5. Complete utility migration (expanded user scope)

- [x] 5.1 Extend the design for a complete Tailwind migration, add shared Card, Badge, and Table primitives, and move wizard/selection control layout and states into component utilities.
- [x] 5.2 Migrate app chrome, results, explorer, comparison, curator, native controls, dialog, responsive rules, print, and motion to Tailwind utilities; retain only theme definitions and minimal global base rules in CSS.
- [x] 5.3 Update verification assertions to inspect utility styling and compiled output while preserving behavioral checks; run typecheck, build, wizard, domain, persistence, Pages build, and Pages workflow checks without a browser.
- [x] 5.4 Update documentation, review the complete migration for cascade and interaction preservation, and report the scope and visual-verification limitation.

## 6. Methodology Drawer

- [x] 6.1 Add the current shadcn Base UI Drawer source primitive and `@base-ui/react` dependency; add the required positioned body base rule using Tailwind.
- [x] 6.2 Replace the native methodology dialog with the controlled Drawer while preserving its external trigger, content, bottom-sheet dimensions, scrolling, modal dismissal, and reduced-motion behavior.
- [x] 6.3 Update documentation and verify typecheck and production build; review the resulting component and event wiring without browser automation.

## 7. Standardize selectable options

- [x] 7.1 Add shared selectable radio-card and checkbox-card primitives plus a reusable full-width radio-card grid with per-instance desktop and mobile column controls.
- [x] 7.2 Migrate work-temperature presets, application cards, segmented controls, mechanical load options, and the standalone mechanical checkbox to the shared card treatment while preserving their selection semantics and accessibility wiring.
- [x] 7.3 Remove obsolete size/full variants, update the component documentation, and review all app option controls plus the non-browser typecheck and production build.

## 8. Shadcn-style temperature slider

- [x] 8.1 Add a local shadcn Slider primitive using the existing Base UI dependency, with themed track, fill, thumb, focus, disabled, and accessible label styles.
- [x] 8.2 Replace the working-temperature input control with the shared Slider and read-only value output, preserving its -20 to 160 °C bounds, 1 °C step, validation, and accessible description.
- [x] 8.3 Update component documentation and review the source plus a non-browser production build.

## 9. Selectable-card state indicators

- [x] 9.1 Add Tabler Icons React and extend the shared radio-card and checkbox-card primitives with an empty circle and checked circle indicator, preserving control semantics and accessibility.
- [x] 9.2 Document the indicator and review the shared source, typecheck, and production build without browser automation.

## 10. Reuse the temperature slider

- [x] 10.1 Share the label/value layout across working, occasional-peak, and minimum temperatures; replace the remaining number inputs with 1 °C sliders, preserve their validation and accessible descriptions, and document the shared control.

## 11. Keep small selector groups on one row

- [x] 11.1 Make every `SegmentedControl` with three or fewer options use one row across breakpoints by default, retain per-instance overrides and larger-group behavior, and document the layout convention.

## 12. Keep wizard navigation visible at every width

- [x] 12.1 Fix the wizard action bar to the viewport bottom across breakpoints, align desktop buttons with the centered page content, preserve mobile sizing and safe-area behavior, reserve content space, and document the layout.

## 13. Differentiate wizard section titles

- [x] 13.1 Give shared wizard subsection titles a distinct display typeface and intermediate size while keeping control labels compact, then document the hierarchy.

## 14. Repair printer capability layout

- [x] 14.1 Replace the auto-fit printer-capability columns with full-width fields and selectors arranged for desktop and narrow screens, and document the layout.

## 15. Use sliders for printer temperature capacities

- [x] 15.1 Replace nozzle and bed capacity number fields with shared temperature sliders, retaining 1 °C precision, accessible labels/errors, positive-value validation, and broad ranges.

## 16. Contain wizard transition motion

- [x] 16.1 Prevent horizontal panel transitions from overflowing the viewport, remove the incomplete outgoing summary layer, and preserve reduced-motion behavior.

## 17. Distinguish conditional follow-ups

- [x] 17.1 Style conditional follow-up sections as inset wells across the wizard, preserve the existing option and validation behavior, and document which answer-dependent sections use the nested treatment.

## 18. Remove transition content flashes

- [x] 18.1 Animate only the incoming wizard panel, remove outgoing-screen state that produced an incomplete duplicate view, and preserve pointer/keyboard behavior plus reduced-motion handling.

## 19. Remove borders from selected option cards

- [x] 19.1 Make the shared selected-card border transparent at rest across radio and checkbox options while revealing it on hover and preserving border sizing, selected fill and indicator, plus keyboard focus outlines.

## 20. Use the full methodology Drawer width

- [x] 20.1 Remove the methodology copy's maximum-width constraint while preserving its horizontal padding, independent scrolling, and existing Drawer layout.

## 21. Move result ranks beside material names

- [x] 21.1 Remove numeric rank rails from qualifying material cards and place each rank as a bold yellow `#N` before its material name while retaining the near-match marker.

## 22. Refine result card metadata

- [x] 22.1 Move the qualifying rank to the right side of the material heading, immediately before the score.
- [x] 22.2 Remove the score gauge from result cards.
- [x] 22.3 Remove the dashed separator above the technical badges.

## 23. Compact lower-ranked result cards

- [x] 23.1 Keep the top qualifying match expanded, collapse details for other qualifying matches behind a full-width accessible disclosure control, and animate expansion with reduced-motion support while keeping near-match cards expanded.

## 24. Move inquiry and restart actions to the results footer

- [x] 24.1 Remove the results contact card, put the quotation's WhatsApp link in the fixed footer as “Enviar consulta”, and change the other results action to restart the selector.

## 25. Put comparison toggles inside result details

- [x] 25.1 Remove comparison controls from card headers and add an accessible pressed-state toggle to expanded card details.

## 26. Replace the title rule with wizard progress

- [x] 26.1 Replace the header's bottom border with an accessible full-width progress bar driven by the active wizard step, and animate its fill with reduced-motion support.

## 27. Place comparison toggles at the bottom of result cards

- [x] 27.1 Move each comparison toggle to the bottom of its expanded details and make it full width.

## 28. Open material comparison in a floating Drawer

- [x] 28.1 Replace the inline comparison panel with a floating trigger above the results footer, animate its entrance from below, and show the comparison chart and table in a scrollable Drawer.

## 29. Keep the comparison trigger visible while scrolling

- [x] 29.1 Render the floating comparison trigger from the viewport-fixed footer outside the animated wizard panel so it remains visible while scrolling.
