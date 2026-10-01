# Assessment 3 implementation and evidence guide

Jacob Fenollar, student number 22421357.

## Project continuity

This submission extends the recovered Assessment 2 project. Its original README states that Assessment 1 started with `npx create-next-app .`. The existing App Router, React builders, phoneme corpus, previews, HTML exports, validated CRUD routes, SQLite tables and Docker stages are retained. A fresh scaffolding command was not run over existing source. The inherited Assessment 2 technical justification remains in this folder as historical documentation.

## Data flow

The Data Library sends validated JSON to Next.js Route Handlers. SQLite stores word lists, words, ordered phonemes and activity configurations. The export endpoint reads those records and produces a standalone Wordle or Word Search HTML file. Assessment 3 records each server export attempt in `generation_events`, with its type, result, failure code, duration and timestamp. Events are retained when their original activity is deleted.

The page timer sends completed visible page segments to `/api/visits`. The API validates duration, path and event ID, and SQLite deduplicates IDs. `/api/metrics` calculates counts and averages from SQL queries. Dashboard and Reports refresh every 15 seconds. CSV reports contain the latest 14 active UTC dates.

## Metric definitions

- Wordle and Word Search counts are current stored configurations, including starter records. Deletion reduces these inventory counts.
- Successful and failed generations are cumulative server export attempts. Repeated downloads count again. A rejected unknown activity ID is a failed attempt with unknown type.
- Most-used activity type is the type with the most export attempts. Ties show both. Failed attempts with unknown type are excluded from that comparison.
- Average generation time includes both successful and rejected requests, measured before the monitoring insert.
- Average time on page is the mean visible segment of at least one second, submitted at navigation or when hidden. Resuming a hidden page starts another segment. It is not a unique-user or whole-session measure. Browser termination can lose an event.
- Offline activity interaction and browser-only preview downloads are not recorded as server generations. The app collects no identity or personal information.

## Simulation and warnings

Initial startup retains Assessment 2's two word lists, ten words and two configurations. The explicit Add simulated records action inserts twelve sample generation events and twelve sample visits. Two sample failures demonstrate warnings. The action is transactional and idempotent. Sample events have a separate source and never appear in observed totals. The dashboard also warns about real failed generation attempts and empty word lists.

## Testing and accessibility

See `../evidence/VERIFICATION.md` for the actual final checks, `../evidence/playwright/results.json` for browser test evidence, `../evidence/jmeter-final/` for measured load samples and `../evidence/lighthouse/` for actual accessibility reports. The JMeter plan is in `../tests/load/assessment-workflow.jmx`.

Playwright covers browser CRUD with reload persistence, a downloaded Wordle solved through phoneme keys, a downloaded Word Search grid interaction, dashboard warnings, simulation, CSV and page-time persistence. Unit and API tests retain the twelve inherited cases and add persistence, timing validation, deduplication and simulation separation checks.

Lighthouse's first dashboard audit scored 100 but identified a visible-label mismatch in the home link as an unscored audit. The redundant aria-label was removed so the accessible name derives from the visible brand text. The Data Library and both builders flagged phoneme buttons whose accessible names did not match the symbols shown. Those controls now derive their names from visible content plus visually hidden action hints. The builders also had low contrast on the active difficulty card in dark mode; its small text now uses the stronger text color. Browser testing identified an unstable description-field label after reloading saved content; the field now explicitly references its visible label. Automated accessibility scores do not establish complete accessibility; keyboard and assistive-technology testing remain important.

## Operational limits

This is a local classroom demonstration application, retaining Assessment 2's unauthenticated CRUD design. It is not a production multi-user service. The timing endpoint accepts anonymous client reports, so it cannot establish verified user counts. SQLite and synchronous access are suitable for this demonstration, but these load tests do not establish distributed-service capacity. Historical events currently have no automatic retention limit. Database failure can prevent monitoring writes; server logs report this while the export keeps its original response.

Docker support is preserved. Local Docker execution is unavailable in the preparation environment, so do not claim a successful container run unless independently demonstrated. The final verification records the structural checks and any standalone server smoke test separately.

## Reference material

- Playwright reporters: https://playwright.dev/docs/test-reporters
- Lighthouse accessibility scoring: https://developer.chrome.com/docs/lighthouse/accessibility/scoring
- Lighthouse CLI: https://github.com/GoogleChrome/lighthouse
- Apache JMeter: https://jmeter.apache.org/usermanual/get-started.html
- Required repository reference: https://github.com/Shadovv909/cse3cwa-assessment-3

Check the final handover for repository publication status. The video and the similarity-system upload must be completed by the student.
