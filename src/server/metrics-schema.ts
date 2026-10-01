export const metricsSchema = `
CREATE TABLE IF NOT EXISTS generation_events (
  id TEXT PRIMARY KEY,
  activity_id TEXT,
  activity_type TEXT CHECK (activity_type IN ('WORDLE', 'WORD_SEARCH')),
  success INTEGER NOT NULL CHECK (success IN (0, 1)),
  duration_ms REAL NOT NULL CHECK (duration_ms >= 0),
  code TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('observed', 'simulated')),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS page_visits (
  id TEXT PRIMARY KEY,
  page TEXT NOT NULL,
  duration_ms INTEGER NOT NULL CHECK (duration_ms BETWEEN 0 AND 86400000),
  source TEXT NOT NULL CHECK (source IN ('observed', 'simulated')),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS simulation_batches (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_generation_source_time ON generation_events(source, created_at);
CREATE INDEX IF NOT EXISTS idx_visits_source_time ON page_visits(source, created_at);
INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
`;
