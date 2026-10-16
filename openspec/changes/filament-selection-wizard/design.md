# Design

## Context

See proposal.md and specs/filament-selection/spec.md for the motivation and behavior contract. App owns answers, ranking, tab state, and comparison selection. SelectorForm currently renders all seven original sections at once. ResultsPanel renders recommendations continuously; a floating jump button uses an IntersectionObserver. The domain modules already isolate presets, condition derivation, ranking, and quotation generation. CSS has a 900px layout breakpoint and safe-area support.

This change merits a design because navigation, application state, result visibility, layout, and accessibility change together.

## Goals / Non-Goals

**Goals:** Keep the seven original sections in a deterministic wizard; separate completed navigation from suggested values; reuse the existing domain contract; keep mobile actions reachable and transitions interruptible.

**Non-Goals:** Changing material scores or conservative assumptions, introducing URLs for individual steps, persisting incomplete answers across reloads, changing other tabs, or adding an animation library.

## Decisions

### 1. Keep seven fixed steps and group related fields

Use stable IDs for the seven original sections. The route always contains all seven IDs; answers control conditional fields inside a step, not how many steps the user visits. Store the active step and completed-step acknowledgements separately from RawAnswers. Use explicit Continuar everywhere; selecting or changing an answer only changes its value.

| Step | Section | Conditional details shown in the same step |
| --- | --- | --- |
| 1 | Tipo de pieza | Starts unanswered; selecting a preset loads editable suggestions |
| 2 | Temperaturas y calor | Piece color appears for direct solar heat |
| 3 | Exterior | Sun, humidity, and abrasion appear when exposure is Sí |
| 4 | Líquidos y químicos | All nine substances show no contact, splash, or immersion when liquid contact is Sí |
| 5 | Esfuerzos mecánicos | Load and friction appear when mechanical stress is Sí; rigidity stays visible |
| 6 | Requisitos especiales | Food contact and flame resistance stay grouped |
| 7 | Fabricación | Printer capabilities appear when the user prints; priority stays visible |

Progress always shows the current step out of seven. No sé retains the existing conservative assumptions without adding screens. Preset values remain editable and do not mark later steps complete.

Alternative: separate screens for each field increase navigation and break the seven original groups the wizard is meant to present.

### 2. Keep answers and navigation across view changes

Keep wizard state at the app/selector-session boundary so tab changes and results editing preserve it. Initialize a neutral internal answer object, but leave application choice explicitly unset so a preset does not appear selected by default. Choose a preset only on an actual type selection. Reselecting the same application or revisiting the step does not reapply it. Selecting a different application reapplies its application-specific defaults and clears completed-step acknowledgements.

When conditional details become irrelevant, retain their values for backtracking but exclude them through existing condition derivation. The liquid step stores each substance's no-contact, splash, or immersion level directly in RawAnswers.ch; at least one substance must be nonzero when liquid contact is Sí.

Editing results returns to step one with answers intact and hides results until final submission. Restart resets answers, step acknowledgements, and comparison selection. Curated material data remains intact. No new persistent storage keys are needed.

### 3. Gate results presentation rather than changing evaluation

Use a questions/results phase. Remove the current two-column form/results composition, example banner in selector flow, results jump control, and its observer. Render the existing results experience only in the results phase and add an accessible results heading. Clear comparison selection on restart and when submitting changed answers so comparisons do not carry stale choices into a new recommendation. Preserve result sharing, copying, exclusions, near misses, printing, and comparison behavior.

Alternative: visually covering live results can leave shortcuts or assistive-technology access to unfinished recommendations.

### 4. Validate each step before moving forward

Add field-aware validation before domain conversion, since missing numeric strings otherwise become zero. Require finite numeric values, enforce the existing working-temperature scope, reject a minimum above effective working temperature, and require at least one substance at splash or immersion level for affirmative liquid contact. Printer maximum temperatures must be finite and positive. A peak below effective working temperature keeps existing clamping semantics and shows an advisory warning.

Working temperature uses the existing preset-plus-10 conservative value when unknown. Validate all seven steps again before completion; if an upstream change leaves an invalid value, return to that step with an explanation. Back navigation remains available despite invalid input. Associate errors with fields and announce failed continuation.

Alternative: blocking all existing temperature messages would unintentionally turn documented peak normalization into an error.

### 5. One stationary navigation footer

Render a shared action component outside animated content. At 900px and below, fix it to the visible viewport bottom with safe-area padding and at least 44px action targets. Show disabled Atrás on step one; question actions are Atrás and Continuar/Ver resultados. Results actions are Editar respuestas and Empezar de nuevo. On desktop, place the same actions in normal flow below content.

Measure footer height with ResizeObserver and reserve that height plus spacing beneath selector content. Scope the reservation and footer to the active selector tab. Keep the footer outside transformed ancestors. Hide navigation in print styles and preserve the result report.

For browsers where the keyboard shrinks only the visual viewport, observe VisualViewport resize/scroll and apply an unanimated bottom offset. Use ordinary fixed positioning as fallback, include cleanup, and avoid double-counting when the layout viewport already resizes. Set scroll padding so focused inputs and errors can be revealed above the footer. Device behavior requires a later explicit mobile inspection.

Alternative: sticky navigation can disappear behind long content or the software keyboard; fixed-height clearance fails when labels wrap.

### 6. Motion follows the animate skill

Animate only the changing step panel and entry into results. The footer remains stationary and material data receives no decorative movement.

Use CSS transitions for transform and opacity, 200ms, with a shared ease-out curve of cubic-bezier(0.23, 1, 0.32, 1). Use a subtle 3% horizontal displacement; forward sends the outgoing panel left and brings the incoming panel from the right, while backward reverses the path. Reduced motion uses opacity only. Keyboard activation bypasses transition duration entirely.

A small transition controller uses generations to ignore stale completion callbacks and retargets on rapid navigation. Keep at most the active panel plus one inert, aria-hidden outgoing panel; outgoing controls must be unfocusable. Restore focus to the incoming heading without waiting for the transition. Avoid layout-property animation, keyframes that restart on every click, and a motion dependency.

Alternative: a full carousel or animation library adds unnecessary layout and state complexity.

## Risks / Trade-offs

- Seven steps can contain several related fields → preserve the original grouping, use clear subsections, and place conditional details beside their parent choice.
- Retained hidden values can affect outcomes → preserve domain normalization and verify hidden outdoor, chemical, load, and equipment values do not alter results.
- Mobile keyboards and safe areas differ between browsers → use visual viewport handling with fallbacks; keep device inspection on the checklist for when browser inspection is authorized.
- Animated outgoing panels can duplicate focus targets → use inert/aria-hidden presentation and keep only the active step exposed.
- Existing baseline work is uncommitted → preserve unrelated migration and hosting edits.

## Migration Plan

Implement as a selector presentation change with no storage or data migration. Run focused flow/validation checks, existing domain and persistence checks, typecheck, and production build using the repository-declared pnpm through Corepack. Browser testing and browser automation require the user's explicit request; record mobile keyboard, runtime focus, printing appearance, and transition feel as unverified until then. Deploy only when deployment is authorized. Roll back the wizard components, state, and styles together to restore the prior form while keeping domain and curated data intact.

## Animation Feel Checklist

When browser inspection is authorized, check forward/backward direction, a stationary footer, rapid interruption, reduced-motion fade without translation, and instant keyboard navigation. Review on a real mobile device as well as desktop; code review alone cannot verify perceived pace or continuity.
