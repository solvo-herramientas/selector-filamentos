# Migration reference

Captured before implementation on 2026-10-16.

- Original Git revision: `b5b7c559dc83b5a5ed6553639c72ec83bb7a4663` (`main` at capture time).
- Original source: [`original-index.html`](./original-index.html), copied with `git show <revision>:index.html`; it remains readable independently of later working-tree edits.
- SHA-256 of the complete original HTML: `19b0af9bc9509aa7f19ae0047a6847074fa8a302becf0af0b92a67610a31e148`.
- Original inline style block: 19,943 bytes; SHA-256 `6ff55b5d9f395934b76e75567053e27b28d5c855a43820d0a1d277c0b7c3e7bf` (hash covers the bytes between `<style>\n` and `\n</style>`).
- Original material records, order, text, numeric values, chemical resistance maps, and equipment data: `BASE` array in the captured source. The 15 IDs are `PLA`, `PETG`, `PETG-GF`, `PETG-CF`, `ABS`, `ABS-GF`, `ASA`, `PC`, `PA6`, `PA12`, `PA12-CF`, `PA6-CF`, `TPU 95A`, `PP`, `POM`.
- Original defaults, presets, labels, and equipment constants: `APPS`, `CHEM`, `CHA`, `CHS`, `SOLVO_EQ`, `LOADS`, `REFS`, and related constants in the captured source. Startup selects preset `ext` (pieza exterior al sol): 40 °C work, 55 °C peak, −5 °C minimum, direct sun on a dark part, outdoor exposure, water splash, static load, and a rigid part. The initial fabrication choice is `solvo`, and priority is `eq`.
- Document metadata and font loading are at the top of the captured source: Spanish language, viewport-fit viewport, title, description, Open Graph fields, canonical URL, and the existing Google Fonts URL.
- GitHub Pages source at capture time: `https://api.github.com/repos/solvo-herramientas/selector-filamentos/pages` returned `build_type: legacy`, `source.branch: main`, `source.path: /`, `public: true`, and URL `https://solvo-herramientas.github.io/selector-filamentos/`.

The complete source snapshot is the authoritative reference for exact text, markup, styles, defaults, data, formulas, and browser behavior. To re-read the baseline without relying on the modified checkout, use `git show b5b7c559dc83b5a5ed6553639c72ec83bb7a4663:index.html`.
