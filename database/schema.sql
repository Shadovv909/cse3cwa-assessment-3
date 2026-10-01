PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;

CREATE TABLE schema_migrations (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE word_lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE words (
  id TEXT PRIMARY KEY,
  word_list_id TEXT NOT NULL,
  english TEXT NOT NULL COLLATE NOCASE,
  hint TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 999),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (word_list_id) REFERENCES word_lists(id) ON DELETE CASCADE,
  UNIQUE (word_list_id, english)
);

CREATE TABLE phonemes (
  id TEXT PRIMARY KEY,
  word_id TEXT NOT NULL,
  symbol TEXT NOT NULL CHECK (length(symbol) > 0),
  position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 7),
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  UNIQUE (word_id, position)
);

CREATE TABLE activity_configurations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('WORDLE', 'WORD_SEARCH')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('guided', 'standard', 'challenge')),
  show_hints INTEGER NOT NULL DEFAULT 1 CHECK (show_hints IN (0, 1)),
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  max_attempts INTEGER,
  grid_size INTEGER,
  seed INTEGER NOT NULL DEFAULT 2026,
  output_title TEXT NOT NULL,
  output_file_name TEXT NOT NULL,
  word_list_id TEXT NOT NULL,
  target_word_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (word_list_id) REFERENCES word_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (target_word_id) REFERENCES words(id) ON DELETE SET NULL,
  CHECK (seed BETWEEN 1 AND 2147483647),
  CHECK (
    (activity_type = 'WORDLE' AND max_attempts BETWEEN 4 AND 8 AND grid_size IS NULL)
    OR
    (activity_type = 'WORD_SEARCH' AND max_attempts IS NULL AND grid_size BETWEEN 8 AND 14)
  )
);

CREATE INDEX idx_words_word_list ON words(word_list_id, sort_order);
CREATE INDEX idx_phonemes_word ON phonemes(word_id, position);
CREATE INDEX idx_activities_word_list ON activity_configurations(word_list_id);

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

\n