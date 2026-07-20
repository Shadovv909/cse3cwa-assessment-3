# CSE3CWA Assessment Task 1 — Phoneme Studio

**Student:** Jacob Fenollar  
**Student number:** 22421357  
**Repository:** <https://github.com/Shadovv909/cse3cwa-assessment-1>

Phoneme Studio is a responsive teacher-facing frontend for creating phoneme-based classroom activities. It provides separate Wordle and Word Search builders, immediate playable previews, and browser-generated standalone HTML files. The project is intentionally frontend-only: no account, database, API, or server-side word-list service is required for Assessment 1.

## Assessment alignment

The application directly implements the five required pages and the highest-band rubric features:

- **Home** introduces the project and links to both builders.
- **About** explains the purpose, current frontend scope, deferred features, component architecture, and accessibility approach.
- **Wordle** creates one playable phoneme target and places the phoneme keyboard beside the game board on wider screens.
- **Word Search** creates a grid from a small editable list of approximately five phoneme-based words.
- **Settings** provides light/dark themes and comfortable/compact layouts, persisted in first-party cookies.

Both Generate buttons create one complete `.html` file containing the selected data, responsive CSS, and plain JavaScript. The output has no external script or stylesheet dependency and can be opened directly in a normal browser.

## Supplied HCE corpus integration

The project incorporates the supplied broad HCE corpus rather than inventing a separate sound inventory:

- all **43 supplied phoneme symbols** are available in the authoring palette;
- all **90 supplied word examples** are included: 30 three-phoneme, 30 four-phoneme, and 30 five-phoneme entries;
- the Wordle builder can load any supplied word from grouped presets;
- the Word Search builder includes three five-word preset sets for three-, four-, and five-phoneme practice;
- each phoneme occupies its own activity cell, including multi-character symbols such as `/tʃ/`, `/dʒ/`, and `/æɪ/`;
- hover titles and accessible names use forms such as `/θ/ — TH (as in “thin”)`.

The source data is in `src/data/hce-corpus.ts` and `src/data/phonemes.ts` so a future assessment can replace the static corpus with database-backed content without changing the game components.

## Main functionality

### Phoneme Wordle

The teacher can load a supplied HCE example or construct a sequence manually, enter the English answer, choose four to eight attempts, select Guided, Standard, or Challenge mode, and show or hide visible spelling labels. The live preview supports adding and deleting phonemes, submitting guesses, resetting, duplicate-aware scoring, and a clear success/final-attempt outcome. Feedback combines colour with `✓`, `↔`, and `×` symbols so colour is never the only cue.

### Phoneme Word Search

The teacher can load an HCE five-word set, edit English equivalents and phoneme sequences, add or remove words within the prototype limits, choose grid size, choose difficulty, show or hide English hints, and shuffle the deterministic layout. The generator uses bounded backtracking, favours compatible overlaps, and records the intended placement for every target. Students choose the first and last tile of a straight line; the preview checks intended placements in either direction and marks found words with text, colour, and a tick.

### Preferences and responsive interface

Theme and density choices are stored locally in first-party cookies and restored before the page is displayed. Desktop navigation changes to a labelled kebab menu on compact screens. Builder controls and previews sit side by side where space permits and stack at smaller widths. Grids use local horizontal containment rather than forcing the entire page to overflow.

## Accessibility

The interface uses a skip link, semantic headings and landmarks, visible labels, fieldsets and legends, descriptive button names, live status regions, keyboard-operable controls, visible focus indicators, reduced-motion support, and minimum touch-friendly controls. Word Search supports Escape to cancel a starting tile. Each grid tile announces its row, column, phoneme hint, and found state. Native hover titles remain available even when visible spelling labels are disabled.

Automated axe-core checks found no WCAG 2.0/2.1 A or AA violations on all five desktop routes, the main mobile routes, and both standalone activity examples. Browser interaction checks also confirmed mobile navigation, cookie persistence, successful game completion, self-contained output, and no console errors. Reports are included in `docs/evidence/`.

## Created with create-next-app

The project was bootstrapped with the required command:

```bash
npx create-next-app@latest cse3cwa-assessment-1 \
  --ts --eslint --app --src-dir --use-npm \
  --import-alias "@/*" --no-tailwind --yes
```

## Run and verify

Use Node.js 20.9 or newer. Node.js 22 is used by the included GitHub Actions workflow.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`.

Run the full verification pipeline with:

```bash
npm run check
```

This command runs ESLint, TypeScript checking, six Node unit tests, and an optimized Next.js production build. The unit tests verify the exact HCE inventory, all 90 corpus entries, duplicate Wordle scoring, deterministic target placement, intended-placement matching, and self-contained HTML generation.

## Project structure

```text
src/
├── app/                    # App Router pages and global responsive CSS
├── components/
│   ├── builders/           # Teacher authoring interfaces
│   ├── games/              # Interactive student previews
│   ├── layout/             # Header, footer, navigation and app shell
│   ├── settings/           # Cookie-backed preferences
│   └── ui/                 # Shared page heading and phoneme palette
├── config/                 # Site, student and repository details
├── data/                   # Supplied broad HCE corpus and phoneme hints
├── lib/                    # Scoring, placement, keyboard and export logic
└── types/                  # Shared activity models

tests/                      # Core Node tests
scripts/                    # TypeScript test loader and GitHub publish helper
.github/workflows/          # Continuous integration
examples/                   # Verified standalone HTML examples
docs/                       # Justification, rubric map and submission evidence
```

## GitHub publishing

The project is configured for `Shadovv909/cse3cwa-assessment-1`, includes a clean local Git history, and has a GitHub Actions workflow that runs `npm ci` and `npm run check` on pushes and pull requests. Creating or pushing to the remote account still requires Jacob’s one-time authenticated GitHub session.

After extracting the submission ZIP and opening a terminal in the project folder, run:

```bash
./scripts/publish-to-github.sh
```

The script uses GitHub CLI browser authentication, creates the public repository when it does not already exist, configures `origin`, and pushes `main`. Never place a GitHub password or personal access token in source files or chat messages.

## Assessment documentation

- `docs/ASSESSMENT_JUSTIFICATION.md` — approximately 900-word verbal justification.
- `docs/RUBRIC_ALIGNMENT.md` — criterion-by-criterion implementation evidence.
- `docs/TESTING_CHECKLIST.md` — completed automated and browser checks.
- `docs/VIDEO_WALKTHROUGH_SCRIPT.md` — a concise demonstration plan covering the mandatory student ID, face, voice, and application features.
- `docs/SUBMISSION_CHECKLIST.md` — final ZIP, GitHub, and video steps.
