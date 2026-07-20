# Video Walkthrough Script (approximately 5 minutes)

The video must be recorded by Jacob Fenollar because the rubric requires the student’s ID, face, and voice. Keep the face camera visible at least during the identity introduction and conclusion, and make all text large enough for the marker to read.

## 0:00–0:30 — identity and purpose

Show your face and student ID card. Say:

> My name is Jacob Fenollar, student number 22421357. This is my CSE3CWA Assessment Task 1, Phoneme Studio. It is a frontend-only Next.js builder for teachers to create and export phoneme Wordle and Word Search activities.

Do not expose unrelated personal information on the ID; cover it where permitted while keeping your name/number verifiable.

## 0:30–1:10 — structure and navigation

Share the browser. On Home, point out the purpose, two activity links, and configure–preview–download workflow. Open About and briefly identify the current frontend scope, deferred database features, component architecture, and accessibility section. Narrow the browser to show the kebab menu, open it, then press Escape. State that all five required pages remain available.

## 1:10–1:40 — Settings persistence

Open Settings. Switch to Dark theme and Compact spacing. Reload the page and show that both remain selected. Explain that only these preferences are stored in first-party cookies; activity data stays in React state. Return to Light/Comfortable if this makes the remaining recording easier to see.

## 1:40–2:45 — Phoneme Wordle

Open Wordle. Use the supplied corpus selector to load one example, then return to or load “ship”. Point out that each phoneme occupies one cell and that the keyboard is beside the board. Change the difficulty to Challenge to show the complete HCE inventory. Hover `/θ/` so the marker can see `/θ/ — TH (as in “thin”)`. Enter `/ʃ/ /ɪ/ /p/` and submit. Explain the tick, double-arrow, and cross legend and that the implementation uses duplicate-aware scoring.

Click **Generate standalone HTML**. Open the downloaded file and solve it briefly or show that it opens without the Next.js server. State that CSS, activity data, and JavaScript are embedded in one file.

## 2:45–3:50 — Phoneme Word Search

Open Word Search. Load a supplied five-word HCE set. Show that English equivalents and phoneme sequences are editable, then point out grid size, difficulty, hint, and shuffle controls. Explain that the generator records intended placements and accepts selections in either direction. Select the first and final tile of “chin” and show the tick, found target, and live message.

Click **Generate standalone HTML**, open the file directly, and find one sequence. Mention that standard buttons support keyboard, mouse, and touch interaction and that Escape cancels a selected starting tile.

## 3:50–4:35 — code quality and testing

Switch to the editor. Show the main folders:

- `components/builders` and `components/games`;
- `data/hce-corpus.ts` and `data/phonemes.ts`;
- `lib/scoring.ts`, `lib/word-search.ts`, and `lib/export-html.ts`;
- `tests/core.test.mjs`;
- `.github/workflows/ci.yml`.

Open a terminal and run or show the completed result of:

```bash
npm run check
```

State that linting, TypeScript, six unit tests, and the production build pass. Briefly show `docs/evidence/axe-report.json` and explain that the audited routes and standalone examples returned no WCAG A/AA violations.

## 4:35–5:00 — GitHub and conclusion

Open the public repository at:

```text
https://github.com/Shadovv909/cse3cwa-assessment-1
```

Show the commit history and successful Actions check. Finish on camera:

> The project meets the Assessment 1 frontend scope, uses the supplied broad HCE corpus, produces two playable single-file outputs, and provides an accessible reusable foundation for later database features.

Before uploading, verify that your face, voice, student ID, both generated files, the repository, and the successful check are all clearly visible in the recording.
