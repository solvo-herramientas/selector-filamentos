# Design

## Expanded scope: complete utility migration

The user requested the remaining custom application styles migrate to Tailwind/shadcn after the original implementation. This supersedes the initial decision to retain specialized component CSS below. Move all application layout, cards, tables, control states, drawer, motion, responsive, safe-area, and print declarations into Tailwind classes in their owning components. Add source-owned Card, Badge, Table, Drawer, and Slider primitives for repeated or interactive structures. Retain theme custom properties, Tailwind configuration, and a minimal global base using `@apply` in `src/styles.css`. Native select and details controls can remain with Tailwind styling; use the Base UI Slider for the temperature range while preserving its numeric input contract. Replace the native methodology dialog with the current shadcn Drawer backed by Base UI, preserving its controlled state, modal dismissal, content, and bottom-sheet layout. Inline style values remain only for data-derived geometry, colors, widths, and measured viewport offsets. Browser inspection remains unauthorized.

## Context

See proposal.md for motivation and scope. The application uses React, TypeScript, Vite, and a single custom stylesheet imported by `src/main.tsx`. Controls are mostly native elements; `SegmentedControl` centralizes radio markup. Existing CSS defines light and dark colors, three font families, compact controls, custom cards, responsive tables, a methodology overlay, and wizard transitions. The build uses a production base of `/selector-filamentos/`.

The repository declares pnpm 12.14.0. Dependency operations must use `corepack pnpm` after checking the root `packageManager`; preserve the existing workspace install. No browser testing or inspection is authorized.

## Goals / Non-Goals

**Goals:**
- Make Tailwind and locally owned shadcn/ui components usable throughout the existing application.
- Preserve styling through token reuse and explicit cascade ownership rather than accumulating override rules.
- Keep component events, refs, labels, invalid states, and keyboard behavior compatible with current callers.
- Use a locally owned shadcn Drawer backed by Base UI for the methodology panel.
- Give mutually exclusive choices one shared selectable-card style throughout the app.

**Non-Goals:**
- Redesigning screens, replacing the ranking model, changing storage, or introducing new navigation.
- Replacing domain-specific visualizations or every native element merely for library coverage.
- Changing methodology copy or its bottom-anchored, scrollable layout.

## Decisions

### Integrate Tailwind through Vite

Use Tailwind CSS v4 and its official Vite plugin, selecting compatible package versions during implementation. Keep the existing React plugin and production base. Configure a shared `@/` alias in Vite and TypeScript, and a `components.json` pointing at the actual stylesheet, local UI directory, and utility module.

Alternative: PostCSS integration. The Vite plugin avoids an additional build configuration in this Vite-only project.

### Own and customize shadcn primitives

Use shadcn-generated component sources under `src/components/ui`, with `cn` under `src/lib/utils.ts`. Generate only the primitives needed: Button, Input, Label, Checkbox, and RadioGroup. Choose one supported primitive backend consistently and retain its generated accessibility behavior. Adapt variants and classes to the existing design; do not apply a stock shadcn palette over the app.

Migrate ordinary action buttons across the wizard and supporting panels, numeric inputs including curator cells, field labels, and standalone checkboxes. Preserve native select, table, and details elements where replacements would add interaction changes. Replace the working-temperature range with a source-owned shadcn Slider using the existing Base UI dependency. Replace the methodology dialog with Drawer. Use one shared card primitive for application presets, work-temperature choices, and all other single-choice options while preserving radio semantics and accessible names. Keep multi-select actions as checkboxes.

Alternative: only installing dependencies or adding unused examples. Actual use of shared primitives provides consistency and makes this a substantive migration.

### Reuse theme values and control cascade ordering

Keep current CSS custom properties as the source of truth. Expose semantic shadcn colors and Tailwind theme values through aliases: background to `--bg`, foreground to `--ink`, card to `--panel`, primary to `--hot`, primary foreground to `--on-hot`, muted background to `--soft`, muted foreground to the existing `--muted`, border/input to `--line`, and ring to `--hot-ink`. Avoid redefining `--muted` as a background, since the application already uses it for text. Preserve Archivo, Poppins, and IBM Plex Mono and the existing 3–4px control radii.

Keep the current `prefers-color-scheme` and `data-theme` behavior, including explicit light override. Shared components should use semantic variables rather than require a new theme provider or a `.dark` class.

Use explicit Tailwind layers: theme, base, components, utilities. Retain the minimal existing reset and initially omit Tailwind Preflight to avoid changing native headings, lists, tables, and inputs across untouched screens. Place retained application styles in the components layer so utilities can override them deliberately. Remove migrated global control rules or narrow their scope; do not leave `input[type=number]`, generic button, or label selectors fighting the new primitives. Preserve `[hidden]` enforcement. Audit existing class names such as `hidden`, `print`, `progress`, and `border` for generated utility collisions.

Alternative: importing all default Tailwind styles and leaving custom CSS unlayered. That risks reset regressions and makes unlayered legacy styles override utility classes unexpectedly.

### Standardize mutually exclusive choices as cards

Add a shared selectable-card primitive backed by shadcn RadioGroupItem, and use the same border, spacing, text hierarchy, selected state, and focus treatment for application presets, temperature choices, effort types, and every `SegmentedControl` option across the wizard and Explorer. Wrap radio-card groups with `SelectableCardGrid`, which fills its available width by default, uses two columns that collapse to one below 700px, and accepts per-instance `columns`, `mobileColumns`, and `className` props. Keep `SegmentedControl` as the typed adapter, preserving its controlled value, callback, option IDs, name, accessible labels/descriptions, invalid state, and data attributes while passing through grid layout options. Groups with one to three options automatically use that many columns on desktop and mobile unless an instance explicitly overrides the layout; larger groups retain the default two-column desktop, one-column mobile layout. Remove `size` and `full` styling variants so callers cannot create a second visual treatment. Preserve checkbox semantics for multi-selection and standalone boolean fields while allowing the standalone `roce` choice to use the shared card treatment.

Selected cards keep their fill and indicator but have a transparent border at rest; hovering any option reveals its border. Preserve the separate `focus-visible` outline for keyboard navigation.

Keep the wizard action bar fixed to the viewport bottom at every width. Use a full-width surface with its controls aligned to a centered inner container matching the page content; keep buttons right-aligned on desktop and fluid on smaller screens. Reserve page padding from the bar's measured height and preserve safe-area and visual-viewport handling.

Replace the title header's bottom rule with a full-width wizard progress bar. Show progress for the current step out of seven, expose it as an accessible progressbar, and animate only the fill with a short linear transform transition that shortens for reduced-motion preferences.

### Distinguish subsection headings from control labels

Style the shared wizard `Subsection` headings with the display typeface, an intermediate 16px size, and stronger weight. Keep field and group labels at their compact 13px treatment so the visual hierarchy remains clear across wizard steps.

Lay out printer capabilities with two equal-width temperature fields, a full-row enclosure selector, and two equal-width equipment selectors. Keep each selector group full-width within its grid cell and stack the layout below 560px; avoid auto-fit columns that can compress the option cards on desktop.

Use a bordered, inset `bg-card` well for each conditional follow-up revealed by an earlier answer. Apply it to manual working temperature, sun-exposed part color, outdoor conditions, chemical contact levels, mechanical load details, and printer capabilities. Keep ordinary subsections on the page surface so only drill-down content gains the nested treatment.

Keep wizard panel transitions clipped to their content viewport and animate only the incoming panel. Do not render a reduced outgoing summary: it briefly showed a second, incomplete version of the previous step during the transition. Use a small fixed horizontal translation rather than a percentage of panel width so motion cannot create page-level horizontal overflow.

Alternative: keep segmented strips beside option cards. Shared cards make choices visually consistent and keep the radio keyboard model.

### Use shadcn Slider for temperature fields

Create a source-owned `Slider` primitive from `@base-ui/react/slider`, matching the shadcn controlled array-value API and styling its track, fill, thumb, focus, and disabled states with Tailwind semantic tokens. Use it for working, occasional peak, and minimum temperatures. Keep the working-temperature slider at -20 to 160 °C; use -40 to 200 °C for the peak and minimum sliders, all with a 1 °C step. Show each current value in a read-only output beside its label and clamp only the thumb position when a stored value falls outside its slider range. Keep validation and accessible descriptions on each control.

Use the same shared control for printer nozzle and bed maximum temperatures, with 1 °C steps and broad 0–500 °C and 0–200 °C ranges respectively. Retain their positive-value validation and accessible error descriptions.

Alternative: keep browser-native range or number controls. The user requested the shadcn Slider treatment and a label-only value display for all temperature fields.

### Show selection state in shared option cards

Use Tabler Icons React for a decorative empty circle at the right of each shared selectable card and a larger filled check-circle in its place while selected. Read the checked state from the existing radio or checkbox primitive so both control types stay in sync without adding state. Keep the icons hidden from assistive technology; the radio and checkbox continue to expose their native accessible selection semantics.

Alternative: rely only on the card border and background. The user requested a visible indicator for empty and selected choices.

### Use shadcn Drawer for methodology

Replace the native `<dialog>` implementation with a source-owned shadcn Drawer using the current Base UI backend (`@base-ui/react`), not the legacy Vaul version. Keep the existing help button as an external controlled trigger, retain the current bottom-anchored maximum width and height, and render the header separately from a flexible, scrollable content region. Let Base UI own modal focus, Escape, and outside-press dismissal; the app's existing `open` state remains the source of truth. Set `body` to `position: relative` through the minimal Tailwind base because the current shadcn Drawer overlay needs it on scrolled iOS Safari pages.

Let the methodology copy fill the Drawer content width instead of constraining it to a centered text column. Keep the existing horizontal padding as the content gutter.

On qualifying result cards, show the rank as a bold yellow `#N` immediately before the score at the right side of the material heading, and remove the numeric rank rail. Keep the separate vertical “casi” marker for near-match cards. Result cards do not show a score gauge. Technical settings use badges without a dashed separator above them. Keep the top qualifying match expanded; show the remaining qualifying cards compactly with the material heading and thermal criteria visible inside a full-width accessible disclosure control, and let it expand the remaining details with a brief reduced-motion-aware transition. Put each card’s full-width comparison toggle at the bottom of its details area so compact cards show it only after expansion. Near-match cards stay expanded.

When at least two materials are selected for comparison, show a floating “Ver comparación” trigger above the fixed results footer. Render the trigger from the viewport-fixed footer surface outside the animated wizard panel so it stays visible while scrolling. Animate its entrance from slightly below with a short transform-and-opacity transition and reduced-motion support. Open the existing radar and comparison table in a bottom Drawer with its own scrollable content, and reserve enough results space so the floating trigger does not cover the last card.

Do not add a separate contact card after the results. Put “Enviar consulta” with a WhatsApp icon in the fixed results footer, using the current quotation text, and make the left “Empezar de nuevo” action restart the selector.

Alternative: keep the native dialog. The user explicitly chose shadcn Drawer so the methodology surface uses the same source-owned primitive model as the rest of the UI.

## Risks / Trade-offs

- [Global CSS/reset regressions] → Omit Preflight initially, layer retained CSS, and remove obsolete control selectors as each primitive migrates.
- [Event and DOM shape changes] → Audit `currentTarget.value`, checkbox booleans versus indeterminate values, refs, focus targeting, IDs, and selectors in verification scripts. Preserve behavior rather than retaining obsolete implementation-specific selectors.
- [Visual drift] → Preserve exact existing token values, compact control dimensions, breakpoints, safe-area padding, tables, custom cards, and drawer dimensions. Accept only small control-level differences, such as radio indicators. Without authorized browser inspection, visual parity remains unverified and must be reported explicitly.
- [Backend dependency cost] → Add only dependencies required by adopted components and use a single backend.
- [Mobile or motion regressions] → Preserve wizard focus/scroll handlers, sticky action-bar measurements, reduced-motion styles, and the bottom Drawer layout, scroll behavior, and transitions.
- [Longer option forms] → Keep descriptions readable inside cards, use the same responsive two-column grid, and retain single-column layout on narrow screens.

## Migration Plan

1. Record affected controls and CSS selectors from source; keep domain and persistence modules untouched.
2. Add the build integration, aliases, theme mappings, and component-generation configuration.
3. Add and customize primitives, then migrate callers in small groups while preserving contracts.
4. Remove unused control styles and use Tailwind utilities for migrated controls and straightforward layout rules. Retain specialized CSS for tables, graphics, motion, print, and responsive behavior.
5. Run typecheck, production build, and the existing wizard, domain, persistence, Pages build, and Pages workflow checks through `corepack pnpm`. Review source and built assets for integration and base-path correctness. Do not run scripts that launch browsers without explicit authorization.
6. Document the new component/theme conventions and disclose the lack of browser visual validation. Deploy through the existing workflow only when separately requested. Roll back by reverting configuration, dependencies/lockfile, and UI changes together; no stored-data migration is needed.
