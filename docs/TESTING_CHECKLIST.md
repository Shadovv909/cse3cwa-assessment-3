# Testing Checklist and Recorded Evidence

The final rubric-aligned version was checked using the commands and browser workflows below. Machine-readable reports are in `docs/evidence/`.

## Automated project checks

- [x] `npm ci` installs the locked dependency tree.
- [x] `npm run lint` passes with no ESLint errors.
- [x] `npm run typecheck` passes with no TypeScript errors.
- [x] `npm test` passes all six core tests.
- [x] `npm run build` creates an optimized production build.
- [x] `npm run check` runs lint, type checking, tests, and build as one pipeline.
- [x] `npm audit --omit=dev` reports no known production dependency vulnerabilities.
- [x] Production output contains Home, About, Wordle, Word Search, and Settings routes.

## Supplied HCE material

- [x] The palette order and values match the supplied 43-symbol broad HCE inventory.
- [x] The corpus contains 90 entries: 30 each with three, four, and five phonemes.
- [x] Each supplied phoneme occupies one logical cell, including affricates and diphthongs.
- [x] Wordle presets load the matching English word and phoneme sequence.
- [x] Word Search presets load five corpus words and regenerate a valid grid.
- [x] Unit tests explicitly verify the inventory, corpus totals, and a five-phoneme example.

## Navigation, settings, and responsive behaviour

- [x] All five required pages render and desktop navigation identifies the current route.
- [x] At 360 px, the compact kebab control is visible and opens five page links.
- [x] Escape closes the compact menu.
- [x] The tested 360 px page has no document-level horizontal overflow.
- [x] Dark theme and compact density write first-party cookies.
- [x] Both preferences remain selected after a full page reload.
- [x] Builder columns and activity layouts reflow at tablet and mobile breakpoints.

## Wordle behaviour

- [x] Teacher can load any supplied HCE example or edit a 2–6 phoneme target.
- [x] Attempts, difficulty, and spelling-label settings change the activity.
- [x] Guided, Standard, and Challenge keyboards provide increasing distractor choice.
- [x] On a wide viewport, the keyboard is positioned beside the game board.
- [x] The `/θ/` key exposes `/θ/ — TH (as in “thin”)` as a hover/accessibility hint.
- [x] Duplicate phonemes use remaining-frequency scoring and are not over-counted.
- [x] Correct, present, and absent states combine colour with `✓`, `↔`, and `×`.
- [x] Entering `/ʃ/ /ɪ/ /p/` solves the default “ship” preview and marks three correct tiles.
- [x] Reset restores a fresh board.

## Word Search behaviour

- [x] Teacher can edit English equivalents and phoneme sequences.
- [x] The prototype accepts a small list of 3–6 words and defaults to five.
- [x] Grid size, difficulty, word changes, and shuffle seed regenerate placements.
- [x] Bounded backtracking places every valid target and permits compatible overlaps.
- [x] Selection accepts horizontal, vertical, and diagonal straight lines as configured.
- [x] Intended placements match in either reading direction; accidental filler matches are rejected.
- [x] Escape cancels a selected starting cell.
- [x] Selecting the default “chin” placement updates found cells, target list, and status message.

## Standalone HTML output

- [x] Each export begins as a complete HTML document and embeds its own CSS and JavaScript.
- [x] Generated examples contain zero external scripts and zero external stylesheets.
- [x] The standalone Wordle example can be solved and reports the English answer.
- [x] The standalone Word Search example recognises its intended “chin” placement.
- [x] Teacher-entered markup is escaped before insertion, and JSON is made safe for an inline script.
- [x] Browser-side Blob download code is connected to both Generate buttons.

## Accessibility verification

- [x] Forms use visible labels, semantic fieldsets, legends, and logical headings.
- [x] A skip link, main landmark, and labelled navigation regions are present.
- [x] Live status regions announce builder and game changes.
- [x] Focus indicators are visible in light and dark themes.
- [x] Wordle status never depends on colour alone.
- [x] Grid cells expose row, column, phoneme hint, pressed state, and found state.
- [x] Reduced-motion preferences disable non-essential transitions.
- [x] Axe-core found no WCAG 2.0/2.1 A or AA violations on all five desktop routes.
- [x] Axe-core found no WCAG 2.0/2.1 A or AA violations on representative 360 px routes.
- [x] Axe-core found no WCAG 2.0/2.1 A or AA violations in either standalone example.
- [x] The recorded browser interaction run produced no console or page errors.
