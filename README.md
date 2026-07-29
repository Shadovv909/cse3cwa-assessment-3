# CSE3CWA Assessment Task 1 — Phoneme Studio

**Student:** Jacob Fenollar  
**Student number:** 22421357  
**GitHub repository:** <https://github.com/Shadovv909/cse3cwa-assessment-1>

Phoneme Studio is a frontend-only Next.js application for teachers to create, preview, and export phoneme-based Wordle and Word Search classroom activities. Generated activities download as complete standalone HTML files that can be opened directly in a normal web browser.

## Included pages

- **Home** — project introduction and links to both activity builders.
- **About** — purpose, Assessment 1 scope, architecture, accessibility, and planned future expansion.
- **Wordle** — configurable phoneme Wordle builder with a playable preview.
- **Word Search** — configurable phoneme Word Search builder using a small editable word list.
- **Settings** — persistent light/dark theme and comfortable/compact spacing preferences.

The supplied broad HCE corpus is stored in `src/data/`. It includes the supplied phoneme inventory and 90 example words grouped into three-, four-, and five-phoneme entries.

## Run the project on Windows

This project has already been created with `create-next-app`. **Do not run `npx create-next-app` again inside this folder**, because that command creates a new project and refuses to overwrite the existing files.

Open PowerShell in the folder that contains `package.json`, then run:

```powershell
node --version
npm --version
npm ci
npm run dev
```

Open <http://localhost:3000> in a browser. Keep the terminal open while recording or testing. Stop the development server with `Ctrl+C`.

Use Node.js **20.9 or newer**. Node.js 22 is recommended. The VS Code Live Server extension is not required and should not be used to run this Next.js application.

If a previous failed install left partial generated folders, clean them and try again:

```powershell
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
npm ci
npm run dev
```

As a fallback, `npm install` can be used instead of `npm ci`.

## Verify before submission

```powershell
npm run check
```

The `check` script runs ESLint, TypeScript checking, the unit tests, and a production build. A successful run should finish without errors.

To test the production build locally:

```powershell
npm run build
npm run start
```

Then open <http://localhost:3000> again.

## Main project structure

```text
.github/workflows/     GitHub Actions checks
src/app/               Required pages and global styling
src/components/        Reusable builders, previews, layout, settings, and UI
src/config/            Student and repository details
src/data/              HCE corpus and phoneme descriptions
src/lib/               Scoring, grid generation, downloads, and HTML export
src/types/             Shared TypeScript models
tests/                 Core automated tests
scripts/               TypeScript loader used by the tests
docs/                  Assessment justification
```

## Important files

- `package.json` — dependencies and run/check commands.
- `package-lock.json` — reproducible public npm dependency versions.
- `src/config/site.ts` — student name, number, and repository URL.
- `docs/ASSESSMENT_JUSTIFICATION.md` — approximately 900-word design justification.
- `.github/workflows/ci.yml` — automatic GitHub validation on pushes and pull requests.

## GitHub

The repository should be published at:

```text
https://github.com/Shadovv909/cse3cwa-assessment-1
```

From this folder, after creating an empty public repository on GitHub, the standard commands are:

```powershell
git init -b main
git add .
git commit -m "Complete CSE3CWA Assessment Task 1"
git remote add origin https://github.com/Shadovv909/cse3cwa-assessment-1.git
git push -u origin main
```

GitHub will request authentication through the browser or Git Credential Manager. Do not place a password or personal access token in the project files.
