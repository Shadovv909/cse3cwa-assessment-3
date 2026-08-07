# CSE3CWA Assessment Task 1: Phoneme Studio

**Student:** Jacob Fenollar  
**Student number:** 22421357  
**GitHub:** <https://github.com/Shadovv909/cse3cwa-assessment-1>

Phoneme Studio is a frontend-only Next.js application for creating, previewing, and exporting phoneme-based Wordle and Word Search classroom activities. Each generated activity is downloaded as one standalone HTML file that can run in a normal browser.

## Included pages

- Home
- About
- Wordle
- Word Search
- Settings

The application includes the supplied broad HCE phoneme inventory and 90 example words grouped into three-, four-, and five-phoneme entries.

## Run locally

Install Node.js 20.9 or newer. Open a terminal in the folder containing `package.json`, then run:

```powershell
npm ci
npm run dev
```

Open <http://localhost:3000>. Do not use the VS Code Live Server extension for the main Next.js application.

## Check the project

```powershell
npm run check
```

This runs ESLint, TypeScript checking, the core tests, and a production build.

## Main structure

```text
.github/workflows/     GitHub Actions validation
src/app/               Pages and global styling
src/components/        Reusable builders, previews, layout, settings, and UI
src/config/            Student and repository details
src/data/              HCE corpus and phoneme descriptions
src/lib/               Scoring, puzzle generation, downloads, and HTML export
src/types/             Shared TypeScript models
tests/                 Core behaviour tests
scripts/               TypeScript loader used by the tests
docs/                  Assessment justification
```

## Assessment documentation

The design justification is located at:

```text
docs/ASSESSMENT_JUSTIFICATION.md
```
