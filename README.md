# CSE3CWA Assessment 2

**Student:** Jacob Fenollar  
**Student number:** 22421357  
**Repository:** https://github.com/Shadovv909/CSE3CWA-Assessments

Phoneme Studio is a Next.js application for Speech Pathology teachers. It continues the App Router project originally created with `npx create-next-app .` for Assessment 1, then adds a backend, SQLite database, JSON API, persistent activity generation, validation, automated tests, a health endpoint and Docker execution.

## Requirements

- Node.js 22.13 or newer
- npm
- Docker Desktop for the container demonstration

## Run locally

Open a terminal in the folder that contains `package.json` and run:

```powershell
npm ci
npm run check
npm run dev
```

Open:

```text
http://localhost:3000
```

The local SQLite database is created automatically at:

```text
data/phoneme-studio.db
```

The first connection seeds two example word lists and two saved activity configurations. To remove the local database and return to the seeded starting state, stop the server and run:

```powershell
npm run db:reset
npm run dev
```

## Backend health

Open the health endpoint in a browser:

```text
http://localhost:3000/health
```

A working service returns HTTP `200 OK` and JSON similar to:

```json
{
  "status": "ok",
  "service": "phoneme-studio-backend",
  "database": "connected",
  "wordLists": 2,
  "activities": 2
}
```

## Data Library and CRUD

Open `http://localhost:3000/library` to demonstrate:

- creating, reading, updating and deleting word lists;
- creating, reading, updating and deleting individual words;
- storing complete phoneme symbols such as `tʃ`, `dʒ` and `æɪ` in ordered positions;
- creating, reading, updating and deleting Wordle and Word Search configurations;
- downloading standalone HTML generated from stored database data;
- opening a stored configuration in its matching builder.

## API routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Database and service health |
| GET, POST | `/api/word-lists` | List or create word lists |
| GET, PUT, DELETE | `/api/word-lists/:id` | Read, update or delete a list |
| POST | `/api/word-lists/:id/words` | Create a word in a list |
| GET, PUT, DELETE | `/api/words/:id` | Read, update or delete one word |
| GET, POST | `/api/activities` | List or create configurations |
| GET, PUT, DELETE | `/api/activities/:id` | Read, update or delete a configuration |
| GET | `/api/activities/:id/export` | Generate stored Wordle or Word Search HTML |

All JSON mutation routes validate input and return structured errors with appropriate HTTP status codes.

## Database design

The application uses the Node.js `node:sqlite` database API with prepared SQL statements and transactions. This avoids an external database service while providing genuine relational persistence suitable for the assessment.

The schema contains:

- `word_lists` for reusable named collections;
- `words` for English equivalents, hints and display order;
- `phonemes` for one complete symbol per ordered position;
- `activity_configurations` for type, difficulty, hints, theme, output settings and linked data;
- `schema_migrations` for schema version tracking.

The readable schema is also provided in `database/schema.sql`. The runtime migration and seed logic is in `src/server/database.ts`.

## Docker

Build and run with Docker Compose:

```powershell
docker compose up --build
```

Then open:

```text
http://localhost:3000
http://localhost:3000/health
```

Stop the container with:

```powershell
docker compose down
```

The named `phoneme_data` volume preserves the SQLite database between container restarts. To delete the stored Docker data as well:

```powershell
docker compose down --volumes
```

The multi-stage Dockerfile builds the Next.js standalone output, runs as a non-root user, exposes port 3000 and includes a container health check.

## Quality checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run check
```

The 12 automated tests cover the supplied HCE inventory, all 90 corpus entries, Wordle scoring, Word Search generation, standalone exports, validation, database persistence, CRUD Route Handlers and the 200 health response.

## Project structure

```text
src/app/api/                    Next.js API Route Handlers
src/app/health/                 Health endpoint
src/app/library/                Database management page
src/components/database/       Frontend CRUD interface
src/server/database.ts          SQLite schema, seed and data access
src/server/validation.ts        Request validation and normalisation
src/server/api.ts               Shared JSON response and error handling
src/lib/export-html.ts          Standalone activity generation
src/data/                       Supplied HCE phoneme data
database/schema.sql             Readable relational schema
tests/                          Frontend utility and backend CRUD tests
Dockerfile                      Production container build
docker-compose.yml              Local container and persistent volume
```

## Submission contents

The submission ZIP excludes `node_modules`, `.next`, generated database files and Git internals. It includes the source code, lock file, tests, documentation, Docker files and GitHub workflow needed to reproduce the application.
