# Assessment 3 API additions

All APIs use Node.js and the inherited SQLite connection. Existing CRUD routes remain unchanged.

| Endpoint | Method | Result |
| --- | --- | --- |
| /health | GET | Database probe, HTTP 200 when connected or 503 on failure |
| /api/metrics?source=observed | GET | SQL-backed observed counters, current inventory, recent events, daily and page summaries |
| /api/metrics?source=simulated | GET | Same structure for sample events; inventory remains current shared inventory |
| /api/metrics?source=observed&format=csv | GET | Daily generation report download |
| /api/visits | POST | Validates and persists a completed visible page segment |
| /api/simulation | POST | Adds the single Assessment 3 sample batch, or reports that it already exists |
| /api/activities/{id}/export | GET | Existing HTML export, now records successful and failed generation attempts |

Visit payload: `{ "id": "unique-visit-id-0001", "page": "/wordle", "durationMs": 15000 }`.
IDs allow 12 to 80 ASCII letters, numbers or hyphens. Duration must be an integer from zero to 86400000 milliseconds. Only known application page paths are accepted. Duplicate IDs do not add another record. The browser submits segments of at least one second.

Metrics source defaults to observed. An unknown source returns HTTP 400. Invalid visits return HTTP 422; malformed JSON returns HTTP 400. Metric and health responses use no-store caching. Current inventory is independent of the event-source filter.

Schema version 2 adds generation_events, page_visits and simulation_batches without dropping or rewriting the five Assessment 2 content tables. Generation events intentionally do not have a foreign key to deletable activities. Indexed source and timestamp columns support event reports. The SQL reference is in database/schema.sql.
