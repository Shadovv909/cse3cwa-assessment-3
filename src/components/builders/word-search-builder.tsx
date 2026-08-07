"use client";

import { useMemo, useRef, useState } from "react";
import { WordSearchPreview } from "@/components/games/word-search-preview";
import { useSettings } from "@/components/settings/settings-provider";
import { PhonemePalette } from "@/components/ui/phoneme-palette";
import { getHceCorpusEntry, hceWordSearchSets } from "@/data/hce-corpus";
import { formatPhoneme, getPhonemeHint } from "@/data/phonemes";
import { downloadHtmlFile, slugifyFileName } from "@/lib/download";
import { buildWordSearchHtml } from "@/lib/export-html";
import { generatePhonemeGrid } from "@/lib/word-search";
import type {
  ActivityDifficulty,
  PhonemeWord,
  WordSearchConfig,
} from "@/types/activities";

function buildCorpusWords(englishWords: readonly string[]): PhonemeWord[] {
  return englishWords.map((english, index) => {
    const entry = getHceCorpusEntry(english);
    if (!entry) throw new Error(`Missing HCE corpus entry: ${english}`);
    return {
      id: `${entry.english}-${index}`,
      english: entry.english,
      phonemes: [...entry.phonemes],
    };
  });
}

const defaultWords = buildCorpusWords(hceWordSearchSets[0].words);

const difficultyOptions: Array<{
  value: ActivityDifficulty;
  label: string;
  description: string;
}> = [
  {
    value: "guided",
    label: "Guided",
    description: "Horizontal and vertical sequences only.",
  },
  {
    value: "standard",
    label: "Standard",
    description: "Adds diagonal sequences.",
  },
  {
    value: "challenge",
    label: "Challenge",
    description: "Adds reverse directions for extra scanning practice.",
  },
];

export function WordSearchBuilder() {
  const { theme } = useSettings();
  const wordCounter = useRef(0);
  const [title, setTitle] = useState("Sound search: familiar words");
  const [words, setWords] = useState(defaultWords);
  const [activeWordId, setActiveWordId] = useState(defaultWords[0].id);
  const [gridSize, setGridSize] = useState(9);
  const [difficulty, setDifficulty] =
    useState<ActivityDifficulty>("standard");
  const [showEnglishHints, setShowEnglishHints] = useState(true);
  const [seed, setSeed] = useState(0);
  const [notice, setNotice] = useState(
    "Edit the target list, preview the generated grid, then download one HTML file.",
  );

  const config: WordSearchConfig = {
    title: title.trim() || "Untitled phoneme Word Search",
    words,
    gridSize,
    difficulty,
    showEnglishHints,
    theme,
    seed,
  };

  const grid = useMemo(
    () => generatePhonemeGrid(words, gridSize, difficulty, seed),
    [difficulty, gridSize, seed, words],
  );

  const errors = useMemo(() => {
    const next: string[] = [];
    if (!title.trim()) next.push("Add an activity title.");
    if (words.length < 3) next.push("Include at least three target words.");
    if (words.length > 6) next.push("Use no more than six words in this prototype.");
    words.forEach((word, index) => {
      if (!word.english.trim())
        next.push(`Word ${index + 1} needs an English equivalent.`);
      if (word.phonemes.length < 2)
        next.push(`Word ${index + 1} needs at least two phonemes.`);
      if (word.phonemes.length > 6)
        next.push(`Word ${index + 1} has more than six phonemes.`);
    });
    if (grid.placements.length !== words.length)
      next.push("Increase the grid size or shorten a word so every sequence fits.");
    return next;
  }, [grid.placements.length, title, words]);

  const activeWord = words.find((word) => word.id === activeWordId) ?? words[0];

  const updateWord = (id: string, changes: Partial<PhonemeWord>) => {
    setWords((current) =>
      current.map((word) => (word.id === id ? { ...word, ...changes } : word)),
    );
  };

  const addWord = () => {
    if (words.length >= 6) {
      setNotice("The prototype supports a maximum of six target words.");
      return;
    }
    wordCounter.current += 1;
    const id = `new-word-${Date.now()}-${wordCounter.current}`;
    const word: PhonemeWord = {
      id,
      english: "bed",
      phonemes: ["b", "e", "d"],
    };
    setWords((current) => [...current, word]);
    setActiveWordId(id);
    setSeed((current) => current + 1);
    setNotice("A new word was added and selected for phoneme editing.");
  };

  const removeWord = (id: string) => {
    if (words.length <= 3) {
      setNotice("Keep at least three words in the activity.");
      return;
    }
    const nextWords = words.filter((word) => word.id !== id);
    setWords(nextWords);
    if (activeWordId === id) setActiveWordId(nextWords[0].id);
    setSeed((current) => current + 1);
    setNotice("Word removed from the target list.");
  };

  const loadCorpusSet = (setIndex: number) => {
    const selectedSet = hceWordSearchSets[setIndex];
    if (!selectedSet) return;
    const nextWords = buildCorpusWords(selectedSet.words);
    setWords(nextWords);
    setActiveWordId(nextWords[0].id);
    setTitle(`HCE sound search: ${selectedSet.label}`);
    setSeed((current) => current + 1);
    setNotice(`Loaded '${selectedSet.label}' from the supplied HCE corpus.`);
  };

  const addPhoneme = (symbol: string) => {
    if (!activeWord) return;
    if (activeWord.phonemes.length >= 6) {
      setNotice("Each prototype word supports a maximum of six phonemes.");
      return;
    }
    updateWord(activeWord.id, {
      phonemes: [...activeWord.phonemes, symbol],
    });
    setSeed((current) => current + 1);
    setNotice(`${getPhonemeHint(symbol)} added to '${activeWord.english}'.`);
  };

  const removePhoneme = (wordId: string, index: number) => {
    const word = words.find((item) => item.id === wordId);
    if (!word) return;
    updateWord(wordId, {
      phonemes: word.phonemes.filter((_, itemIndex) => itemIndex !== index),
    });
    setSeed((current) => current + 1);
    setNotice("Phoneme removed from the selected word.");
  };

  const download = () => {
    if (errors.length) {
      setNotice("Resolve the validation messages before downloading.");
      return;
    }
    const fileName = `${slugifyFileName(config.title)}.html`;
    downloadHtmlFile(buildWordSearchHtml(config, grid), fileName);
    setNotice(`${fileName} was generated as a standalone classroom activity.`);
  };

  const previewKey = [
    seed,
    gridSize,
    difficulty,
    words.map((word) => `${word.id}:${word.phonemes.join(".")}`).join("|"),
  ].join("::");

  return (
    <div className="builder-grid">
      <section
        className="builder-panel"
        aria-labelledby="word-search-builder-title"
      >
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Builder controls</p>
            <h2 id="word-search-builder-title">Configure Word Search</h2>
          </div>
          <span className="step-badge">2 of 2 tools</span>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <span className="section-number" aria-hidden="true">
              1
            </span>
            <div>
              <h3>Activity details</h3>
              <p>Set the title, grid size and scaffolding level.</p>
            </div>
          </div>

          <label className="form-field">
            <span>Activity title</span>
            <input
              className="text-input"
              type="text"
              value={title}
              maxLength={70}
              onChange={(event) => setTitle(event.target.value)}
            />
            <small>{title.length}/70 characters</small>
          </label>

          <label className="form-field form-field--spaced">
            <span>Load a supplied HCE word set</span>
            <select
              className="select-input"
              value=""
              onChange={(event) => loadCorpusSet(Number(event.target.value))}
            >
              <option value="">Choose an optional five-word set...</option>
              {hceWordSearchSets.map((set, index) => (
                <option key={set.label} value={index}>
                  {set.label}: {set.words.join(", ")}
                </option>
              ))}
            </select>
            <small>
              The supplied examples remain editable and are held only in React
              state.
            </small>
          </label>

          <div className="form-grid form-grid--two">
            <label className="form-field">
              <span>Grid size</span>
              <select
                className="select-input"
                value={gridSize}
                onChange={(event) => {
                  setGridSize(Number(event.target.value));
                  setSeed((current) => current + 1);
                }}
              >
                {[8, 9, 10, 11].map((size) => (
                  <option key={size} value={size}>
                    {size} × {size}
                  </option>
                ))}
              </select>
            </label>

            <label className="switch-row">
              <span>
                <strong>English hints</strong>
                <small>Show the English equivalent beside each sequence.</small>
              </span>
              <input
                type="checkbox"
                checked={showEnglishHints}
                onChange={(event) => setShowEnglishHints(event.target.checked)}
              />
            </label>
          </div>

          <fieldset className="radio-card-grid radio-card-grid--spaced">
            <legend className="fieldset-label">Difficulty</legend>
            {difficultyOptions.map((option) => (
              <label className="radio-card" key={option.value}>
                <input
                  type="radio"
                  name="word-search-difficulty"
                  value={option.value}
                  checked={difficulty === option.value}
                  onChange={() => {
                    setDifficulty(option.value);
                    setSeed((current) => current + 1);
                  }}
                />
                <span>
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <div className="form-section">
          <div className="form-section__heading form-section__heading--actions">
            <span className="section-number" aria-hidden="true">
              2
            </span>
            <div>
              <h3>Target word list</h3>
              <p>Keep the list small and edit each item as a phoneme sequence.</p>
            </div>
            <button
              className="button button--secondary button--small"
              type="button"
              disabled={words.length >= 6}
              onClick={addWord}
            >
              Add word
            </button>
          </div>

          <div className="word-editor-list">
            {words.map((word, index) => {
              const selected = word.id === activeWordId;
              return (
                <article
                  className="word-editor-card"
                  data-selected={selected}
                  key={word.id}
                >
                  <div className="word-editor-card__heading">
                    <span>Word {index + 1}</span>
                    <button
                      className="text-button text-button--danger"
                      type="button"
                      disabled={words.length <= 3}
                      onClick={() => removeWord(word.id)}
                    >
                      Remove
                    </button>
                  </div>
                  <label className="form-field form-field--compact">
                    <span>English equivalent</span>
                    <input
                      className="text-input"
                      type="text"
                      value={word.english}
                      maxLength={30}
                      onFocus={() => setActiveWordId(word.id)}
                      onChange={(event) =>
                        updateWord(word.id, { english: event.target.value })
                      }
                    />
                  </label>
                  <div className="sequence-list sequence-list--compact">
                    {word.phonemes.map((phoneme, phonemeIndex) => (
                      <button
                        className="sequence-chip"
                        type="button"
                        key={`${phoneme}-${phonemeIndex}`}
                        title={`Remove ${getPhonemeHint(phoneme)}`}
                        aria-label={`Remove ${formatPhoneme(phoneme)} from ${word.english}`}
                        onClick={() => removePhoneme(word.id, phonemeIndex)}
                      >
                        <span>{formatPhoneme(phoneme)}</span>
                        <small aria-hidden="true">×</small>
                      </button>
                    ))}
                  </div>
                  <button
                    className={
                      selected
                        ? "button button--primary button--small"
                        : "button button--ghost button--small"
                    }
                    type="button"
                    onClick={() => setActiveWordId(word.id)}
                  >
                    {selected ? "Editing this sequence" : "Edit phonemes"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <span className="section-number" aria-hidden="true">
              3
            </span>
            <div>
              <h3 id="word-search-palette-title">
                Phoneme palette for &apos;{activeWord?.english || "selected word"}&apos;
              </h3>
              <p>Select a word above, then add sounds from this palette.</p>
            </div>
          </div>
          <PhonemePalette
            labelledBy="word-search-palette-title"
            disabled={!activeWord || activeWord.phonemes.length >= 6}
            onSelect={addPhoneme}
          />
        </div>

        <div className="grid-tools">
          <div>
            <strong>Generated layout</strong>
            <p>
              {grid.placements.length} of {words.length} sequences placed in the
              grid.
            </p>
          </div>
          <button
            className="button button--secondary button--small"
            type="button"
            onClick={() => {
              setSeed((current) => current + 1);
              setNotice("The grid layout was shuffled.");
            }}
          >
            Shuffle grid
          </button>
        </div>

        {errors.length ? (
          <div className="validation-box" role="alert">
            <strong>Before downloading:</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="ready-box">
            <span aria-hidden="true">✓</span>
            <p>
              <strong>Ready to export.</strong> The grid, styles and interaction
              logic will be embedded in one HTML file.
            </p>
          </div>
        )}

        <div className="builder-footer">
          <p className="builder-notice" role="status" aria-live="polite">
            {notice}
          </p>
          <button
            className="button button--primary"
            type="button"
            disabled={errors.length > 0}
            onClick={download}
          >
            Generate standalone HTML
          </button>
        </div>
      </section>

      <aside className="preview-panel" aria-label="Word Search output preview">
        <WordSearchPreview key={previewKey} config={config} grid={grid} />
      </aside>
    </div>
  );
}
