# Rubric Alignment Review

This review maps the final implementation to the five published 4% criteria. It identifies evidence for the highest performance band, but the assessor determines the final mark.

## 1. Frontend structure, pages, and overall interface design — 4%

**Highest-band requirement:** clear Home, About, Wordle, Word Search, and Settings pages; logical navigation; polished layout.

**Implementation evidence**

- All five routes exist under `src/app/` and have focused page headings and metadata.
- `SiteHeader` provides full desktop navigation, active-page state, and a labelled compact kebab menu.
- Compact navigation closes by link selection, outside click, or Escape.
- A shared `AppShell` keeps the skip link, header, main landmark, and footer consistent.
- Builders use a matched configure–preview–export structure rather than unrelated page layouts.
- Responsive breakpoints stack panels, remove sticky behaviour where unsuitable, and contain wide grids locally.
- Browser checks confirmed all required routes and no 360 px document overflow.

**Likely band when demonstrated accurately:** A-range evidence.

## 2. Themes and persistent preferences — 4%

**Highest-band requirement:** visually consistent light/dark themes with reliable persistence.

**Implementation evidence**

- `SettingsProvider` applies light or dark theme and comfortable or compact density through root data attributes.
- CSS custom properties define coherent colours, borders, text, focus, status, and surface values for both themes.
- First-party cookies persist only `phoneme-theme` and `phoneme-density` for one year.
- The small initialisation script reads cookies before React paints, reducing a flash of the wrong theme.
- Reset removes stored preferences and returns to defaults/system theme.
- Browser automation selected dark/compact, reloaded, and confirmed both data attributes and cookies remained unchanged.
- The chosen theme is embedded in generated classroom activities.

**Likely band when demonstrated accurately:** A-range evidence.

## 3. Wordle and Word Search behaviour and HTML output — 4%

**Highest-band requirement:** playable phoneme Wordle, Word Search generated from a small word list, and a Generate button that downloads one working HTML file.

**Implementation evidence**

- Wordle uses phonemes as units and includes all 90 supplied broad HCE examples as optional presets.
- Its keyboard is beside the board on wide screens and changes from Guided to the full HCE palette in Challenge mode.
- Duplicate-aware scoring prevents repeated symbols from receiving incorrect present states.
- Word Search defaults to five supplied words and supports 3–6 editable targets.
- The deterministic generator uses bounded recursive backtracking, overlap preference, difficulty-specific directions, and recorded target placements.
- Selection matches an intended placement forward or backward, avoiding accidental filler-sequence success.
- Both builders validate content before enabling the Generate button.
- `buildWordleHtml` and `buildWordSearchHtml` create complete single-file documents with embedded data, CSS, and JavaScript.
- Unit tests confirm the files have no external script or stylesheet references.
- Direct-browser checks solved both generated examples successfully.

**Likely band when demonstrated accurately:** A-range evidence.

## 4. Usability, accessibility, and responsive design — 4%

**Highest-band requirement:** highly usable, accessible, responsive; clear navigation; readable typography; keyboard support; mouse-over hints such as `/θ/` and `TH (as in thin)`.

**Implementation evidence**

- Every form control has a visible label; related radio choices use fieldsets and legends.
- Buttons and links have visible focus states, sufficient target size, and clear action wording.
- A skip link and semantic navigation/main/footer landmarks support keyboard and assistive-technology users.
- Status messages use polite live regions, and validation summaries use alert semantics.
- Native hover titles and accessible names expose `/θ/ — TH (as in “thin”)` and equivalent hints for the whole HCE inventory.
- Wordle states combine colour with `✓`, `↔`, and `×` and provide a text legend.
- Word Search exposes row/column data, phoneme hints, pressed state, found state, and Escape cancellation.
- Buttons work with keyboard, mouse, and touch-generated click events.
- Reduced-motion CSS removes non-essential transitions.
- Axe-core returned no WCAG 2.0/2.1 A or AA violations on the audited app routes and standalone files.

**Likely band when demonstrated accurately:** A-range evidence.

## 5. Code quality, modularity, GitHub, and written justification — 4%

**Highest-band requirement:** reusable modular architecture, clear separation of concerns, professional GitHub practice, and a strong supported justification.

**Implementation evidence**

- Next.js App Router pages, shared UI, layout, builders, previews, settings, data, utilities, and types are separated by responsibility.
- Activity configuration and game state are not mixed with scoring, grid generation, or export algorithms.
- TypeScript models provide explicit contracts for activities, words, coordinates, placements, and results.
- Six unit tests cover the supplied inventory/corpus and the most failure-prone game/export algorithms.
- `npm run check` combines linting, type checking, unit tests, and production build.
- `.github/workflows/ci.yml` repeats the locked install and complete check on pushes and pull requests.
- The project includes a clean `.gitignore`, repository metadata, a configured `origin`, and a browser-authenticated publish script.
- `ASSESSMENT_JUSTIFICATION.md` explains design decisions, accessibility, component structure, algorithms, export safety, scope, and trade-offs in approximately 900 words.

**Remaining student-owned step:** authenticate with GitHub, create/push the public remote, and confirm the Actions run. A username alone does not provide permission to perform this account operation.

**Likely band after the remote is published and demonstrated accurately:** A-range evidence.

## Mandatory submission note

The video walkthrough is a required submission item. It must show Jacob’s student ID, face, and voice as well as the application’s key frontend features. Use `VIDEO_WALKTHROUGH_SCRIPT.md`; missing this video may make an otherwise strong technical submission incomplete.
