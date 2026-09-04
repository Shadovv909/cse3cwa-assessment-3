# Assessment 2 Technical Justification

**Jacob Fenollar, 22421357**

## Project continuity and design direction

Assessment 2 extends the Assessment 1 Phoneme Studio interface rather than replacing it. The existing Home, About, Wordle, Word Search and Settings pages remain, together with the responsive navigation, accessible phoneme controls, playable previews and standalone HTML generators. A new Data Library page adds the database workflow required for this stage. This continuity means teachers can keep using the familiar configure, preview and export pattern while gaining reliable storage and retrieval.

The central design decision was to treat the Next.js application as both the user interface and backend service. The App Router provides pages for teachers and Route Handlers for JSON requests. This keeps the application within one project, avoids duplicated domain models and allows the frontend and backend to share TypeScript types. The backend is divided into validation, database access, API response handling and export generation so that each concern can be understood and changed independently.

## Backend and API architecture

The backend routes are grouped by resource. `/api/word-lists` supports listing and creating collections. `/api/word-lists/[id]` supports reading, updating and deleting one list. Nested word creation is handled by `/api/word-lists/[id]/words`, while `/api/words/[id]` updates or deletes an individual word. The activity routes follow the same pattern. This resource-oriented structure gives each HTTP method a responsibility and makes the CRUD demonstration easy to follow.

Successful JSON responses use a consistent `{ data: ... }` structure. Errors contain a code, human-readable message and optional field-level details. Invalid JSON returns 400, validation failures return 422, missing records return 404, duplicate values and invalid relationships return 409, and unexpected failures return 500. The shared API helper prevents each route from inventing a different response format. `Cache-Control: no-store` is also applied because management screens should always display current database values.

## Relational database design

SQLite was selected because the assessment needs a real persistent database but not a separate database server. The application uses the database API included with modern Node.js, prepared statements and explicit transactions. The default database file is stored under `data/`, while the path can be changed with `DATABASE_PATH`. This allows local development, automated tests and Docker to use different locations without changing source code.

The schema separates four main concepts. `word_lists` stores reusable collection names and descriptions. `words` stores the English equivalent, optional hint and sort order, with a foreign key to its list. `phonemes` stores every complete phoneme symbol in a separate row with an integer position. This is important because a phoneme such as `tʃ`, `dʒ` or `æɪ` contains more than one Unicode character but must still occupy one activity cell. Storing the symbol as text and the order as data avoids incorrect character splitting. `activity_configurations` stores the activity type, difficulty, hint setting, theme, Wordle attempts or Word Search grid size, generation seed, output title, output file name, linked word list and optional Wordle target.

Foreign keys preserve the model relationships. Deleting a word list cascades to its words, phonemes and activity configurations. Deleting a word also removes its phoneme rows. Unique constraints prevent the same English word from appearing twice within one list, and indexes support common lookups by list and position. Created and updated timestamps provide useful record metadata. A lightweight migration table records the schema version, and first-run seed logic creates two lists and two saved activities so that the marker can test the system immediately.

## CRUD workflow and frontend integration

The Data Library demonstrates complete CRUD through the application interface. A teacher can create a list, read it from the selector, update its name or description and delete it. The selected list exposes its stored words. A word form uses the same accessible phoneme palette as the builders, then sends the English word, hint and ordered symbol array to the API. Existing words can be loaded into the form, edited and deleted individually.

Activity configurations have a separate CRUD editor. The teacher selects Wordle or Word Search, links a stored list and enters generation settings. Wordle requires a target that belongs to the selected list. Word Search requires between three and ten stored words. The interface retrieves saved configurations from the backend and can open them in the matching builder through an activity query parameter. The server page retrieves the record and passes the stored values into the client preview.

The strongest integration point is the stored export route. `/api/activities/[id]/export` reads the configuration and its related words from SQLite, converts the records into the existing Wordle or Word Search configuration type and returns one downloadable HTML file. The Word Search route also checks that every stored sequence was placed successfully before returning the file. This proves that output generation is driven by persisted backend data rather than only temporary React state.

## Validation and error handling

Validation occurs before a mutation reaches the database. Required text fields are trimmed and length limited. Word lists have a safe maximum size. Each word must contain one to eight phonemes, and every symbol is normalised and checked against the supplied HCE inventory. A typed `g` receives a specific message instructing the user to use IPA `ɡ`. Duplicate English words are rejected before insertion.

Activity validation restricts type, difficulty, theme, attempts, grid size and seed to supported values. Database-level relationship checks then confirm that the selected list exists, that a Wordle target belongs to that list and that a Word Search has an appropriate number of words. The frontend displays returned messages in a live status region instead of silently failing. Transactions protect multi-step list and phoneme updates so a partial write is rolled back when an error occurs.

## Docker, health and maintainability

The Dockerfile uses multiple stages. One stage installs locked dependencies, one builds the Next.js standalone output and a small runtime stage copies only the files needed to serve the application. The runtime uses a non-root account, exposes port 3000 and stores the database in `/app/data`. Docker Compose attaches a named volume so changes survive container restarts. The image health check calls `/health`, which tests SQLite with a simple query and returns 200 only when the backend and database are available.

Code quality is supported through reusable components, shared types, prepared data-access functions and automated checks. The test suite covers the 90 supplied corpus entries, phoneme inventory, Wordle scoring, deterministic Word Search generation, standalone exports, validation and full database CRUD. GitHub Actions runs linting, strict TypeScript checking, tests, a production build, a Docker build and a live container health request. Together, these decisions create a reliable foundation for later testing and deployment assessments while keeping the specialist Speech Pathology use case central.
