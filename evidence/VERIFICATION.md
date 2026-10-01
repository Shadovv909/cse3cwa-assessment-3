# Assessment 3 verification record

The results below were collected from this project on Windows using Node.js 24.14.0. The load tests ran on 28 September 2026. The final Lighthouse checks ran on 1 October 2026 after accessibility fixes. The test databases are excluded from the submission ZIP.

## Application and browser tests

`npm run check` passed: ESLint, TypeScript, 13 unit and API tests, and a Next.js production build. The build emitted an output tracing warning about the configurable database path but completed successfully. `npm run test:e2e` passed five of five Playwright browser cases on the final build. The cases verify stored-list CRUD after reload, a solved downloaded Wordle, Word Search grid interaction, alerts and CSV, and completed visible page time. The machine-readable result is `playwright/results.json`. The browsable report is `playwright/html/index.html`.

A live `/health` request returned HTTP 200 with `database: connected`, two starter lists and two starter activities. The captured response is `health.json`. Docker Compose YAML was parsed, and the build context, port, database path, persistent volume, non-root runtime and health probe were checked against the Dockerfile. The local Docker executable was unavailable. GitHub Actions run 36846688654 on the published main branch passed all three jobs: application checks, Docker image build and container /health probe, and Playwright browser tests. The completed run is https://github.com/Shadovv909/cse3cwa-assessment-3/actions/runs/36846688654 .

## JMeter results

JMeter 5.6.3 and Java 21 ran the parameterised CRUD and generation workflow against a local production server using a disposable SQLite database. Each journey contains ten HTTP requests. `jmeter-final/stage-*.jtl` are the raw samples; `jmeter-final/summary.json` is calculated from their timestamps and response times. All five stages completed with the planned sample counts and zero HTTP errors.

| Total journeys | Concurrent threads | Requests | Errors | Mean response ms | P95 response ms | Requests per second |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 1 | 10 | 0 | 813.80 | 8083 | 1.23 |
| 10 | 2 | 100 | 0 | 156.56 | 8 | 11.99 |
| 100 | 5 | 1,000 | 0 | 46.43 | 15 | 99.01 |
| 1,000 | 10 | 10,000 | 0 | 27.11 | 28 | 355.91 |
| 10,000 | 20 | 100,000 | 0 | 61.13 | 108 | 325.67 |

The first connection in every stage took about eight seconds, which especially inflates low-volume means. Other browser audits ran on the same computer during some early stages. The largest stage used twenty concurrent threads and completed in 307 seconds. This supports only the tested local setup and traffic pattern; it is not a measurement of 10,000 simultaneous users. The JMeter plan and a runner are under `tests/load/`.

## Lighthouse accessibility

Final Lighthouse accessibility results on the production app are below. Each `.report.json` and `.report.html` file in `lighthouse/` contains its exact run. Before reports show the findings that prompted fixes.

| Page | Before | Final | Final failed audits | Final load warning |
| --- | ---: | ---: | ---: | --- |
| Dashboard | 100 | 100 | 0 | Yes |
| Data Library | 100 | 100 | 0 | No |
| Reports | 100 | 100 | 0 | Yes |
| Wordle builder | 96 | 100 | 0 | No |
| Word Search builder | 96 | 100 | 0 | No |

The before Dashboard and Data Library reports identified label and accessible-name mismatches outside the numerical score. The two builders additionally failed color contrast on the selected difficulty card. The final controls use accessible names derived from their visible phonemes, and selected-card text uses a stronger color. The saved description field received an explicit label after browser testing exposed an unstable name on reload.

The final Dashboard and Reports files contain Lighthouse's warning, "The page loaded too slowly to finish within the time limit. Results may be incomplete." Their recorded scores are 100 with no failed audits, but those two results should be shown with the warning visible. The final Data Library, Wordle and Word Search reports have no load warning or failed audits. Lighthouse is automated evidence, not a manual assistive-technology assessment.

## Submission hygiene

The ZIP packaging audit checks for a single correctly named top-level folder, required source and evidence files, consistent package metadata and lockfile, no generated databases, build outputs, dependencies or caches, and no em dash in readable files. `ASSESSMENT_3_REPORT.docx` is an editable Word document; its OOXML structure, table and text were inspected. The local document renderer could not visually verify it because LibreOffice was not installed. The student must record the required video and confirm the similarity-system result.
