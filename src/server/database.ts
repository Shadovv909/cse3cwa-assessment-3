import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { metricsSchema } from "./metrics-schema";
import type {
  ActivityInput,
  StoredActivity,
  StoredActivityType,
  StoredWord,
  StoredWordList,
  StoredWordListSummary,
  WordInput,
  WordListInput,
} from "@/types/database";

export class DatabaseNotFoundError extends Error {}
export class DatabaseConflictError extends Error {}

const globalDatabase = globalThis as unknown as {
  phonemeStudioDatabase?: DatabaseSync;
  phonemeStudioDatabasePath?: string;
};

function databasePath() {
  const configured = process.env.DATABASE_PATH?.trim();
  if (configured === ":memory:") return configured;
  return path.resolve(configured || path.join(process.cwd(), "data", "phoneme-studio.db"));
}

function now() {
  return new Date().toISOString();
}

function asString(row: Record<string, unknown>, key: string) {
  return String(row[key] ?? "");
}

function asNumber(row: Record<string, unknown>, key: string) {
  return Number(row[key] ?? 0);
}

function asBoolean(row: Record<string, unknown>, key: string) {
  return asNumber(row, key) === 1;
}

function runTransaction<T>(database: DatabaseSync, action: () => T) {
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = action();
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function migrate(database: DatabaseSync) {
  database.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS word_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS words (
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

    CREATE TABLE IF NOT EXISTS phonemes (
      id TEXT PRIMARY KEY,
      word_id TEXT NOT NULL,
      symbol TEXT NOT NULL CHECK (length(symbol) > 0),
      position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 7),
      FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
      UNIQUE (word_id, position)
    );

    CREATE TABLE IF NOT EXISTS activity_configurations (
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

    CREATE INDEX IF NOT EXISTS idx_words_word_list ON words(word_list_id, sort_order);
    CREATE INDEX IF NOT EXISTS idx_phonemes_word ON phonemes(word_id, position);
    CREATE INDEX IF NOT EXISTS idx_activities_word_list ON activity_configurations(word_list_id);
  `);

  const migration = database
    .prepare("SELECT version FROM schema_migrations WHERE version = 1")
    .get();
  if (!migration) {
    database
      .prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)")
      .run(1, now());
  }
}

function nextWordSortOrder(database: DatabaseSync, wordListId: string) {
  const row = database
    .prepare(
      "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM words WHERE word_list_id = ?",
    )
    .get(wordListId);
  return asNumber(row || {}, "next_order");
}

function insertWord(database: DatabaseSync, wordListId: string, input: WordInput) {
  const id = randomUUID();
  const timestamp = now();
  const sortOrder = input.sortOrder ?? nextWordSortOrder(database, wordListId);
  database
    .prepare(`
      INSERT INTO words (
        id, word_list_id, english, hint, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      wordListId,
      input.english,
      input.hint || "",
      sortOrder,
      timestamp,
      timestamp,
    );
  const phonemeStatement = database.prepare(
    "INSERT INTO phonemes (id, word_id, symbol, position) VALUES (?, ?, ?, ?)",
  );
  input.phonemes.forEach((symbol, position) => {
    phonemeStatement.run(randomUUID(), id, symbol, position);
  });
  return id;
}

function insertWordListWithWords(database: DatabaseSync, input: WordListInput) {
  const id = randomUUID();
  const timestamp = now();
  database
    .prepare(`
      INSERT INTO word_lists (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(id, input.name, input.description || "", timestamp, timestamp);
  (input.words || []).forEach((word, index) =>
    insertWord(database, id, { ...word, sortOrder: index }),
  );
  return id;
}

function seed(database: DatabaseSync) {
  if (process.env.DATABASE_SEED === "0") return;
  const count = database
    .prepare("SELECT COUNT(*) AS count FROM word_lists")
    .get();
  if (Number(count?.count ?? 0) > 0) return;

  runTransaction(database, () => {
    const starterListId = insertWordListWithWords(database, {
      name: "Starter three-phoneme words",
      description: "A five-word broad HCE set for demonstrating stored Wordle and Word Search activities.",
      words: [
        { english: "ship", hint: "A vessel", phonemes: ["ʃ", "ɪ", "p"] },
        { english: "thin", hint: "Not thick", phonemes: ["θ", "ɪ", "n"] },
        { english: "chin", hint: "Below the mouth", phonemes: ["tʃ", "ɪ", "n"] },
        { english: "jam", hint: "Fruit spread", phonemes: ["dʒ", "æ", "m"] },
        { english: "bad", hint: "Not good", phonemes: ["b", "æ", "d"] },
      ],
    });

    const fourListId = insertWordListWithWords(database, {
      name: "Four-phoneme classroom set",
      description: "A second stored list that demonstrates multiple reusable data sets.",
      words: [
        { english: "stop", phonemes: ["s", "t", "ɔ", "p"] },
        { english: "frog", phonemes: ["f", "ɹ", "ɔ", "ɡ"] },
        { english: "train", phonemes: ["t", "ɹ", "æɪ", "n"] },
        { english: "cloud", phonemes: ["k", "l", "æɔ", "d"] },
        { english: "jump", phonemes: ["dʒ", "ɐ", "m", "p"] },
      ],
    });

    const ship = database
      .prepare("SELECT id FROM words WHERE word_list_id = ? AND english = ?")
      .get(starterListId, "ship");
    const timestamp = now();
    database
      .prepare(`
        INSERT INTO activity_configurations (
          id, name, activity_type, difficulty, show_hints, theme,
          max_attempts, grid_size, seed, output_title, output_file_name,
          word_list_id, target_word_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        randomUUID(),
        "Stored ship Wordle",
        "WORDLE",
        "guided",
        1,
        "light",
        6,
        null,
        2026,
        "Find the word: ship",
        "stored-ship-wordle.html",
        starterListId,
        ship?.id ?? null,
        timestamp,
        timestamp,
      );
    database
      .prepare(`
        INSERT INTO activity_configurations (
          id, name, activity_type, difficulty, show_hints, theme,
          max_attempts, grid_size, seed, output_title, output_file_name,
          word_list_id, target_word_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        randomUUID(),
        "Stored four-phoneme search",
        "WORD_SEARCH",
        "standard",
        1,
        "light",
        null,
        10,
        22421357,
        "Four-phoneme Word Search",
        "stored-four-phoneme-search.html",
        fourListId,
        null,
        timestamp,
        timestamp,
      );
  });
}

export function getDatabase() {
  const location = databasePath();
  if (
    globalDatabase.phonemeStudioDatabase &&
    globalDatabase.phonemeStudioDatabasePath === location
  ) {
    return globalDatabase.phonemeStudioDatabase;
  }
  if (globalDatabase.phonemeStudioDatabase) {
    globalDatabase.phonemeStudioDatabase.close();
  }
  if (location !== ":memory:") mkdirSync(path.dirname(location), { recursive: true });
  const database = new DatabaseSync(location);
  migrate(database);
  database.exec(metricsSchema);
  seed(database);
  globalDatabase.phonemeStudioDatabase = database;
  globalDatabase.phonemeStudioDatabasePath = location;
  return database;
}

export function closeDatabase() {
  globalDatabase.phonemeStudioDatabase?.close();
  globalDatabase.phonemeStudioDatabase = undefined;
  globalDatabase.phonemeStudioDatabasePath = undefined;
}

function getWords(database: DatabaseSync, wordListId: string) {
  const rows = database
    .prepare(`
      SELECT
        w.id, w.word_list_id, w.english, w.hint, w.sort_order,
        w.created_at, w.updated_at, p.symbol, p.position
      FROM words w
      LEFT JOIN phonemes p ON p.word_id = w.id
      WHERE w.word_list_id = ?
      ORDER BY w.sort_order ASC, w.english COLLATE NOCASE ASC, p.position ASC
    `)
    .all(wordListId);

  const words = new Map<string, StoredWord>();
  rows.forEach((row) => {
    const id = asString(row, "id");
    let word = words.get(id);
    if (!word) {
      word = {
        id,
        wordListId: asString(row, "word_list_id"),
        english: asString(row, "english"),
        hint: asString(row, "hint"),
        sortOrder: asNumber(row, "sort_order"),
        phonemes: [],
        createdAt: asString(row, "created_at"),
        updatedAt: asString(row, "updated_at"),
      };
      words.set(id, word);
    }
    const symbol = row.symbol;
    if (typeof symbol === "string") word.phonemes.push(symbol);
  });
  return [...words.values()];
}

export function getWord(id: string): StoredWord | null {
  const database = getDatabase();
  const row = database
    .prepare("SELECT word_list_id FROM words WHERE id = ?")
    .get(id);
  if (!row) return null;
  return (
    getWords(database, asString(row, "word_list_id")).find(
      (word) => word.id === id,
    ) || null
  );
}

function wordListSummaryFromRow(row: Record<string, unknown>): StoredWordListSummary {
  return {
    id: asString(row, "id"),
    name: asString(row, "name"),
    description: asString(row, "description"),
    wordCount: asNumber(row, "word_count"),
    activityCount: asNumber(row, "activity_count"),
    createdAt: asString(row, "created_at"),
    updatedAt: asString(row, "updated_at"),
  };
}

export function listWordLists(): StoredWordList[] {
  const database = getDatabase();
  const rows = database
    .prepare(`
      SELECT
        wl.*,
        COUNT(DISTINCT w.id) AS word_count,
        COUNT(DISTINCT a.id) AS activity_count
      FROM word_lists wl
      LEFT JOIN words w ON w.word_list_id = wl.id
      LEFT JOIN activity_configurations a ON a.word_list_id = wl.id
      GROUP BY wl.id
      ORDER BY wl.updated_at DESC, wl.name COLLATE NOCASE ASC
    `)
    .all();
  return rows.map((row) => {
    const summary = wordListSummaryFromRow(row);
    return { ...summary, words: getWords(database, summary.id) };
  });
}

export function getWordList(id: string): StoredWordList | null {
  const database = getDatabase();
  const row = database
    .prepare(`
      SELECT
        wl.*,
        COUNT(DISTINCT w.id) AS word_count,
        COUNT(DISTINCT a.id) AS activity_count
      FROM word_lists wl
      LEFT JOIN words w ON w.word_list_id = wl.id
      LEFT JOIN activity_configurations a ON a.word_list_id = wl.id
      WHERE wl.id = ?
      GROUP BY wl.id
    `)
    .get(id);
  if (!row) return null;
  const summary = wordListSummaryFromRow(row);
  return { ...summary, words: getWords(database, summary.id) };
}

export function createWordList(input: WordListInput) {
  const database = getDatabase();
  const id = runTransaction(database, () => insertWordListWithWords(database, input));
  return getWordList(id) as StoredWordList;
}

function updateWordRecord(
  database: DatabaseSync,
  id: string,
  wordListId: string,
  input: WordInput,
) {
  const existing = database
    .prepare(
      "SELECT id, sort_order FROM words WHERE id = ? AND word_list_id = ?",
    )
    .get(id, wordListId);
  if (!existing) {
    throw new DatabaseConflictError("A supplied word ID does not belong to this word list.");
  }
  const sortOrder = input.sortOrder ?? asNumber(existing, "sort_order");
  database
    .prepare(`
      UPDATE words
      SET english = ?, hint = ?, sort_order = ?, updated_at = ?
      WHERE id = ?
    `)
    .run(input.english, input.hint || "", sortOrder, now(), id);
  database.prepare("DELETE FROM phonemes WHERE word_id = ?").run(id);
  const statement = database.prepare(
    "INSERT INTO phonemes (id, word_id, symbol, position) VALUES (?, ?, ?, ?)",
  );
  input.phonemes.forEach((symbol, position) =>
    statement.run(randomUUID(), id, symbol, position),
  );
}

function syncWords(database: DatabaseSync, wordListId: string, words: WordInput[]) {
  const existingRows = database
    .prepare("SELECT id FROM words WHERE word_list_id = ?")
    .all(wordListId);
  const existingIds = new Set(existingRows.map((row) => asString(row, "id")));
  const retainedIds = new Set<string>();

  words.forEach((word, index) => {
    const next = { ...word, sortOrder: index };
    if (word.id) {
      updateWordRecord(database, word.id, wordListId, next);
      retainedIds.add(word.id);
    } else {
      retainedIds.add(insertWord(database, wordListId, next));
    }
  });

  existingIds.forEach((id) => {
    if (!retainedIds.has(id)) database.prepare("DELETE FROM words WHERE id = ?").run(id);
  });
}

export function updateWordList(id: string, input: WordListInput) {
  const database = getDatabase();
  if (!getWordList(id)) throw new DatabaseNotFoundError("Word list not found.");
  runTransaction(database, () => {
    database
      .prepare(`
        UPDATE word_lists
        SET name = ?, description = ?, updated_at = ?
        WHERE id = ?
      `)
      .run(input.name, input.description || "", now(), id);
    if (input.words) syncWords(database, id, input.words);
  });
  return getWordList(id) as StoredWordList;
}

export function deleteWordList(id: string) {
  const result = getDatabase().prepare("DELETE FROM word_lists WHERE id = ?").run(id);
  return result.changes > 0;
}

export function createWord(wordListId: string, input: WordInput) {
  const database = getDatabase();
  const list = getWordList(wordListId);
  if (!list) throw new DatabaseNotFoundError("Word list not found.");
  const id = runTransaction(database, () => insertWord(database, wordListId, input));
  return getWords(database, wordListId).find((word) => word.id === id) as StoredWord;
}

export function updateWord(id: string, input: WordInput) {
  const database = getDatabase();
  const row = database.prepare("SELECT word_list_id FROM words WHERE id = ?").get(id);
  if (!row) throw new DatabaseNotFoundError("Word not found.");
  const wordListId = asString(row, "word_list_id");
  runTransaction(database, () => updateWordRecord(database, id, wordListId, input));
  return getWords(database, wordListId).find((word) => word.id === id) as StoredWord;
}

export function deleteWord(id: string) {
  const result = getDatabase().prepare("DELETE FROM words WHERE id = ?").run(id);
  return result.changes > 0;
}

function activityFromRow(row: Record<string, unknown>): StoredActivity | null {
  const wordList = getWordList(asString(row, "word_list_id"));
  if (!wordList) return null;
  return {
    id: asString(row, "id"),
    name: asString(row, "name"),
    activityType: asString(row, "activity_type") as StoredActivityType,
    difficulty: asString(row, "difficulty") as StoredActivity["difficulty"],
    showHints: asBoolean(row, "show_hints"),
    theme: asString(row, "theme") as StoredActivity["theme"],
    maxAttempts: row.max_attempts === null ? null : asNumber(row, "max_attempts"),
    gridSize: row.grid_size === null ? null : asNumber(row, "grid_size"),
    seed: asNumber(row, "seed"),
    outputTitle: asString(row, "output_title"),
    outputFileName: asString(row, "output_file_name"),
    wordListId: asString(row, "word_list_id"),
    targetWordId: row.target_word_id === null ? null : asString(row, "target_word_id"),
    wordList,
    createdAt: asString(row, "created_at"),
    updatedAt: asString(row, "updated_at"),
  };
}

export function listActivities(type?: StoredActivityType): StoredActivity[] {
  const database = getDatabase();
  const rows = type
    ? database
        .prepare(
          "SELECT * FROM activity_configurations WHERE activity_type = ? ORDER BY updated_at DESC, name COLLATE NOCASE ASC",
        )
        .all(type)
    : database
        .prepare(
          "SELECT * FROM activity_configurations ORDER BY updated_at DESC, name COLLATE NOCASE ASC",
        )
        .all();
  return rows
    .map(activityFromRow)
    .filter((activity): activity is StoredActivity => activity !== null);
}

export function getActivity(id: string): StoredActivity | null {
  const row = getDatabase()
    .prepare("SELECT * FROM activity_configurations WHERE id = ?")
    .get(id);
  return row ? activityFromRow(row) : null;
}

function assertActivityRelationships(input: ActivityInput) {
  const list = getWordList(input.wordListId);
  if (!list) throw new DatabaseConflictError("The selected word list does not exist.");
  if (input.activityType === "WORDLE") {
    const target = list.words.find((word) => word.id === input.targetWordId);
    if (!target) {
      throw new DatabaseConflictError("The Wordle target must belong to the selected word list.");
    }
  }
  if (input.activityType === "WORD_SEARCH" && list.words.length < 3) {
    throw new DatabaseConflictError("Word Search activities require at least three stored words.");
  }
  if (input.activityType === "WORD_SEARCH" && list.words.length > 10) {
    throw new DatabaseConflictError("Word Search activities support no more than ten stored words.");
  }
}

export function createActivity(input: ActivityInput) {
  assertActivityRelationships(input);
  const database = getDatabase();
  const id = randomUUID();
  const timestamp = now();
  database
    .prepare(`
      INSERT INTO activity_configurations (
        id, name, activity_type, difficulty, show_hints, theme,
        max_attempts, grid_size, seed, output_title, output_file_name,
        word_list_id, target_word_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      id,
      input.name,
      input.activityType,
      input.difficulty,
      input.showHints ? 1 : 0,
      input.theme,
      input.maxAttempts ?? null,
      input.gridSize ?? null,
      input.seed ?? 2026,
      input.outputTitle,
      input.outputFileName,
      input.wordListId,
      input.targetWordId ?? null,
      timestamp,
      timestamp,
    );
  return getActivity(id) as StoredActivity;
}

export function updateActivity(id: string, input: ActivityInput) {
  if (!getActivity(id)) throw new DatabaseNotFoundError("Activity not found.");
  assertActivityRelationships(input);
  getDatabase()
    .prepare(`
      UPDATE activity_configurations
      SET name = ?, activity_type = ?, difficulty = ?, show_hints = ?,
          theme = ?, max_attempts = ?, grid_size = ?, seed = ?,
          output_title = ?, output_file_name = ?, word_list_id = ?,
          target_word_id = ?, updated_at = ?
      WHERE id = ?
    `)
    .run(
      input.name,
      input.activityType,
      input.difficulty,
      input.showHints ? 1 : 0,
      input.theme,
      input.maxAttempts ?? null,
      input.gridSize ?? null,
      input.seed ?? 2026,
      input.outputTitle,
      input.outputFileName,
      input.wordListId,
      input.targetWordId ?? null,
      now(),
      id,
    );
  return getActivity(id) as StoredActivity;
}

export function deleteActivity(id: string) {
  const result = getDatabase()
    .prepare("DELETE FROM activity_configurations WHERE id = ?")
    .run(id);
  return result.changes > 0;
}

export function databaseHealth() {
  const database = getDatabase();
  const result = database.prepare("SELECT 1 AS ok").get();
  const wordLists = database.prepare("SELECT COUNT(*) AS count FROM word_lists").get();
  const activities = database
    .prepare("SELECT COUNT(*) AS count FROM activity_configurations")
    .get();
  return {
    ok: Number(result?.ok ?? 0) === 1,
    wordLists: Number(wordLists?.count ?? 0),
    activities: Number(activities?.count ?? 0),
  };
}
