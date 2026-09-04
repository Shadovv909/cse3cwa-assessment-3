import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

process.env.DATABASE_PATH = ":memory:";
process.env.DATABASE_SEED = "0";

const database = await import("../src/server/database.ts");
const validation = await import("../src/server/validation.ts");

test("validates complete multi-character HCE phonemes", () => {
  const result = validation.validateWordInput({
    english: "chin",
    hint: "Below the mouth",
    phonemes: ["tʃ", "ɪ", "n"],
  });
  assert.equal(result.success, true);
  if (result.success) assert.deepEqual(result.data.phonemes, ["tʃ", "ɪ", "n"]);
});

test("rejects malformed or unsupported phoneme data", () => {
  const typedG = validation.validateWordInput({
    english: "gum",
    phonemes: ["g", "ɐ", "m"],
  });
  assert.equal(typedG.success, false);
  if (!typedG.success) {
    assert.match(typedG.errors[0].message, /IPA symbol ɡ/);
  }

  const unknown = validation.validateWordInput({
    english: "test",
    phonemes: ["not-a-phoneme"],
  });
  assert.equal(unknown.success, false);
});

test("performs database CRUD for word lists, words and activities", () => {
  const list = database.createWordList({
    name: "Integration test list",
    description: "Temporary records for automated backend verification.",
    words: [
      { english: "ship", hint: "A vessel", phonemes: ["ʃ", "ɪ", "p"] },
      { english: "thin", phonemes: ["θ", "ɪ", "n"] },
      { english: "bad", phonemes: ["b", "æ", "d"] },
    ],
  });

  assert.equal(list.words.length, 3);
  assert.deepEqual(list.words[0].phonemes, ["ʃ", "ɪ", "p"]);

  const createdWord = database.createWord(list.id, {
    english: "jam",
    hint: "Fruit spread",
    phonemes: ["dʒ", "æ", "m"],
  });
  assert.equal(createdWord.english, "jam");
  assert.equal(createdWord.sortOrder, 3);
  assert.equal(database.getWord(createdWord.id)?.english, "jam");

  const updatedWord = database.updateWord(createdWord.id, {
    english: "jam",
    hint: "A sweet fruit spread",
    phonemes: ["dʒ", "æ", "m"],
  });
  assert.equal(updatedWord.hint, "A sweet fruit spread");
  assert.equal(updatedWord.sortOrder, 3);

  const wordle = database.createActivity({
    name: "Integration Wordle",
    activityType: "WORDLE",
    difficulty: "guided",
    showHints: true,
    theme: "light",
    maxAttempts: 6,
    gridSize: null,
    seed: 22421357,
    outputTitle: "Stored ship Wordle",
    outputFileName: "stored-ship-wordle.html",
    wordListId: list.id,
    targetWordId: list.words[0].id,
  });
  assert.equal(wordle.activityType, "WORDLE");
  assert.equal(wordle.wordList.words.length, 4);

  const wordSearch = database.createActivity({
    name: "Integration Word Search",
    activityType: "WORD_SEARCH",
    difficulty: "standard",
    showHints: true,
    theme: "dark",
    maxAttempts: null,
    gridSize: 10,
    seed: 2026,
    outputTitle: "Stored sound search",
    outputFileName: "stored-sound-search.html",
    wordListId: list.id,
    targetWordId: null,
  });
  assert.equal(wordSearch.gridSize, 10);

  const updatedActivity = database.updateActivity(wordSearch.id, {
    name: "Updated Integration Word Search",
    activityType: "WORD_SEARCH",
    difficulty: "challenge",
    showHints: false,
    theme: "dark",
    maxAttempts: null,
    gridSize: 11,
    seed: 2027,
    outputTitle: "Updated stored sound search",
    outputFileName: "updated-sound-search.html",
    wordListId: list.id,
    targetWordId: null,
  });
  assert.equal(updatedActivity.difficulty, "challenge");
  assert.equal(updatedActivity.showHints, false);

  assert.equal(database.deleteWord(createdWord.id), true);
  assert.equal(database.getWordList(list.id)?.words.length, 3);
  assert.equal(database.deleteActivity(wordle.id), true);
  assert.equal(database.deleteActivity(wordSearch.id), true);
  assert.equal(database.deleteWordList(list.id), true);
  assert.equal(database.getWordList(list.id), null);
});

test("persists records after the database connection is reopened", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "phoneme-studio-test-"));
  const filePath = path.join(directory, "persistence.db");
  process.env.DATABASE_PATH = filePath;
  database.closeDatabase();

  const created = database.createWordList({
    name: "Persistent list",
    words: [
      { english: "chin", phonemes: ["tʃ", "ɪ", "n"] },
    ],
  });
  database.closeDatabase();

  const reopened = database.getWordList(created.id);
  assert.equal(reopened?.name, "Persistent list");
  assert.deepEqual(reopened?.words[0].phonemes, ["tʃ", "ɪ", "n"]);

  database.closeDatabase();
  rmSync(directory, { recursive: true, force: true });
  process.env.DATABASE_PATH = ":memory:";
});

test("reports an available database health state", () => {
  const health = database.databaseHealth();
  assert.equal(health.ok, true);
  assert.equal(typeof health.wordLists, "number");
  assert.equal(typeof health.activities, "number");
  database.closeDatabase();
});
