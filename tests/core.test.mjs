import assert from "node:assert/strict";
import test from "node:test";
import { hceCorpus } from "../src/data/hce-corpus.ts";
import { phonemeOptions } from "../src/data/phonemes.ts";
import { buildWordSearchHtml, buildWordleHtml } from "../src/lib/export-html.ts";
import { scorePhonemeGuess } from "../src/lib/scoring.ts";
import {
  coordinateKey,
  generatePhonemeGrid,
  matchingPlacement,
} from "../src/lib/word-search.ts";

const expectedHceInventory = [
  "p", "t", "k", "b", "d", "ɡ", "n", "m", "ŋ", "f", "s", "θ", "ʃ",
  "v", "z", "ð", "ʒ", "l", "ɹ", "w", "j", "h", "tʃ", "dʒ", "iː",
  "ɪ", "e", "eː", "æ", "ɐ", "ɐː", "ɜː", "ʉː", "ɔ", "oː", "ʊ",
  "æɪ", "ɑe", "oɪ", "əʉ", "æɔ", "ɪə", "ə",
];

test("uses the supplied broad HCE phoneme inventory", () => {
  assert.deepEqual(
    phonemeOptions.map((option) => option.symbol),
    expectedHceInventory,
  );
});

test("loads all ninety supplied corpus examples", () => {
  assert.equal(hceCorpus.length, 90);
  assert.equal(hceCorpus.filter((entry) => entry.length === 3).length, 30);
  assert.equal(hceCorpus.filter((entry) => entry.length === 4).length, 30);
  assert.equal(hceCorpus.filter((entry) => entry.length === 5).length, 30);
  assert.deepEqual(
    hceCorpus.find((entry) => entry.english === "spring")?.phonemes,
    ["s", "p", "ɹ", "ɪ", "ŋ"],
  );
});

test("scores duplicate phonemes without over-counting", () => {
  assert.deepEqual(scorePhonemeGuess(["b", "b", "d"], ["b", "e", "b"]), [
    { phoneme: "b", status: "correct" },
    { phoneme: "b", status: "present" },
    { phoneme: "d", status: "absent" },
  ]);
});

test("generates a deterministic grid containing every target placement", () => {
  const words = [
    { id: "chin", english: "chin", phonemes: ["tʃ", "ɪ", "n"] },
    { id: "jam", english: "jam", phonemes: ["dʒ", "æ", "m"] },
    { id: "boot", english: "boot", phonemes: ["b", "ʉː", "t"] },
    { id: "spring", english: "spring", phonemes: ["s", "p", "ɹ", "ɪ", "ŋ"] },
    { id: "cloud", english: "cloud", phonemes: ["k", "l", "æɔ", "d"] },
  ];
  const first = generatePhonemeGrid(words, 9, "standard", 12);
  const second = generatePhonemeGrid(words, 9, "standard", 12);
  assert.deepEqual(first, second);
  assert.equal(first.placements.length, words.length);

  for (const placement of first.placements) {
    const word = words.find((item) => item.id === placement.wordId);
    assert.ok(word);
    assert.deepEqual(
      placement.cells.map((cell) => first.cells[cell.row][cell.col]),
      word.phonemes,
    );
  }
});

test("matches only an intended placement in either direction", () => {
  const placement = {
    wordId: "thin",
    cells: [
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      { row: 1, col: 3 },
    ],
  };
  assert.equal(
    matchingPlacement(placement.cells, [placement], new Set(["thin"]))?.wordId,
    "thin",
  );
  assert.equal(
    matchingPlacement([...placement.cells].reverse(), [placement])?.wordId,
    "thin",
  );
  assert.equal(
    matchingPlacement(
      [
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 2, col: 3 },
      ],
      [placement],
    ),
    undefined,
  );
  assert.deepEqual(new Set(placement.cells.map(coordinateKey)).size, 3);
});

test("exports self-contained Wordle and Word Search HTML documents", () => {
  const wordle = buildWordleHtml({
    title: "Find ship",
    englishWord: "ship",
    target: ["ʃ", "ɪ", "p"],
    maxAttempts: 6,
    difficulty: "challenge",
    showHints: true,
    theme: "light",
  });
  const words = [
    { id: "chin", english: "chin", phonemes: ["tʃ", "ɪ", "n"] },
    { id: "jam", english: "jam", phonemes: ["dʒ", "æ", "m"] },
    { id: "bad", english: "bad", phonemes: ["b", "æ", "d"] },
  ];
  const grid = generatePhonemeGrid(words, 8, "guided", 0);
  const search = buildWordSearchHtml(
    {
      title: "Sound search",
      words,
      gridSize: 8,
      difficulty: "guided",
      showEnglishHints: true,
      theme: "light",
      seed: 0,
    },
    grid,
  );

  for (const html of [wordle, search]) {
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<style>/);
    assert.match(html, /<script>/);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
    assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
  }
  assert.match(wordle, /button\.dataset\.symbol/);
  assert.match(wordle, /\/θ\/ — TH \(as in/);
  assert.match(search, /gridData\.placements/);
});
