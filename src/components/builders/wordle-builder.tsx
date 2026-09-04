"use client";

import { useMemo, useState } from "react";
import { WordlePreview } from "@/components/games/wordle-preview";
import { useSettings } from "@/components/settings/settings-provider";
import { PhonemePalette } from "@/components/ui/phoneme-palette";
import { getHceCorpusEntry, hceCorpusByLength } from "@/data/hce-corpus";
import { formatPhoneme, getPhonemeHint } from "@/data/phonemes";
import { downloadHtmlFile, slugifyFileName } from "@/lib/download";
import { buildWordleHtml } from "@/lib/export-html";
import type { ActivityDifficulty, WordleConfig } from "@/types/activities";
import type { StoredActivity } from "@/types/database";

const difficultyOptions: Array<{
  value: ActivityDifficulty;
  label: string;
  description: string;
}> = [
  {
    value: "guided",
    label: "Guided",
    description: "A smaller keyboard with clear spelling hints.",
  },
  {
    value: "standard",
    label: "Standard",
    description: "More distractor phonemes for classroom practice.",
  },
  {
    value: "challenge",
    label: "Challenge",
    description: "The full phoneme keyboard for confident learners.",
  },
];

const defaultConfig = {
  title: "Find the word: ship",
  englishWord: "ship",
  target: ["ʃ", "ɪ", "p"],
  maxAttempts: 6,
  difficulty: "guided" as ActivityDifficulty,
  showHints: true,
};

export function WordleBuilder({
  initialActivity,
}: {
  initialActivity?: StoredActivity | null;
}) {
  const { theme } = useSettings();
  const initialTarget = initialActivity?.wordList.words.find(
    (word) => word.id === initialActivity.targetWordId,
  );
  const [draft, setDraft] = useState(() =>
    initialActivity && initialTarget
      ? {
          title: initialActivity.outputTitle,
          englishWord: initialTarget.english,
          target: [...initialTarget.phonemes],
          maxAttempts: initialActivity.maxAttempts || 6,
          difficulty: initialActivity.difficulty,
          showHints: initialActivity.showHints,
        }
      : defaultConfig,
  );
  const [notice, setNotice] = useState(
    initialActivity
      ? `Loaded '${initialActivity.name}' from the SQLite database.`
      : "Configure the activity, test it in the preview, then download one HTML file.",
  );

  const errors = useMemo(() => {
    const next: string[] = [];
    if (!draft.title.trim()) next.push("Add an activity title.");
    if (!draft.englishWord.trim()) next.push("Add the English answer.");
    if (draft.target.length < 2)
      next.push("Use at least two phonemes in the target sequence.");
    if (draft.target.length > 8)
      next.push("Use no more than eight phonemes.");
    return next;
  }, [draft]);

  const config: WordleConfig = {
    ...draft,
    title: draft.title.trim() || "Untitled phoneme Wordle",
    englishWord: draft.englishWord.trim() || "answer",
    theme: initialActivity?.theme || theme,
  };

  const addPhoneme = (symbol: string) => {
    if (draft.target.length >= 8) {
      setNotice("The builder supports a maximum of eight phonemes per word.");
      return;
    }
    setDraft((current) => ({
      ...current,
      target: [...current.target, symbol],
    }));
    setNotice(`${getPhonemeHint(symbol)} added to the target sequence.`);
  };

  const removePhoneme = (index: number) => {
    setDraft((current) => ({
      ...current,
      target: current.target.filter((_, itemIndex) => itemIndex !== index),
    }));
    setNotice("Phoneme removed from the target sequence.");
  };

  const loadCorpusExample = (english: string) => {
    const example = getHceCorpusEntry(english);
    if (!example) return;
    setDraft((current) => ({
      ...current,
      title: `Find the word: ${example.english}`,
      englishWord: example.english,
      target: [...example.phonemes],
    }));
    setNotice(
      `Loaded '${example.english}' from the supplied broad HCE phoneme corpus.`,
    );
  };

  const download = () => {
    if (errors.length) {
      setNotice("Resolve the validation messages before downloading.");
      return;
    }
    const fileName = `${slugifyFileName(config.title)}.html`;
    downloadHtmlFile(buildWordleHtml(config), fileName);
    setNotice(`${fileName} was generated as a standalone classroom activity.`);
  };

  const previewKey = [
    config.title,
    config.englishWord,
    config.target.join("|"),
    config.maxAttempts,
    config.difficulty,
    config.showHints,
  ].join("::");

  return (
    <div className="builder-grid">
      <section className="builder-panel" aria-labelledby="wordle-builder-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Builder controls</p>
            <h2 id="wordle-builder-title">Configure Wordle</h2>
          </div>
          <span className="step-badge">1 of 2 tools</span>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <span className="section-number" aria-hidden="true">
              1
            </span>
            <div>
              <h3>Activity details</h3>
              <p>Use teacher-facing labels that will make sense later.</p>
            </div>
          </div>

          <div className="form-grid form-grid--two">
            <label className="form-field">
              <span>Activity title</span>
              <input
                className="text-input"
                type="text"
                value={draft.title}
                maxLength={70}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
              <small>{draft.title.length}/70 characters</small>
            </label>

            <label className="form-field">
              <span>English answer</span>
              <input
                className="text-input"
                type="text"
                value={draft.englishWord}
                maxLength={30}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    englishWord: event.target.value,
                  }))
                }
              />
              <small>Shown after a correct answer or final attempt.</small>
            </label>
          </div>

          <div className="form-grid form-grid--two">
            <label className="form-field">
              <span>Number of attempts</span>
              <select
                className="select-input"
                value={draft.maxAttempts}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    maxAttempts: Number(event.target.value),
                  }))
                }
              >
                {[4, 5, 6, 7, 8].map((attempts) => (
                  <option key={attempts} value={attempts}>
                    {attempts} attempts
                  </option>
                ))}
              </select>
            </label>

            <label className="switch-row">
              <span>
                <strong>Visible spelling labels</strong>
                <small>
                  Show labels under each key; mouse-over hints remain available.
                </small>
              </span>
              <input
                type="checkbox"
                checked={draft.showHints}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    showHints: event.target.checked,
                  }))
                }
              />
            </label>
          </div>

          <label className="form-field form-field--spaced">
            <span>Load a supplied HCE corpus example</span>
            <select
              className="select-input"
              value=""
              onChange={(event) => loadCorpusExample(event.target.value)}
            >
              <option value="">Choose an optional example...</option>
              {([3, 4, 5] as const).map((length) => (
                <optgroup key={length} label={`${length} phonemes`}>
                  {hceCorpusByLength[length].map((entry) => (
                    <option key={entry.english} value={entry.english}>
                      {entry.english}: {entry.phonemes.map(formatPhoneme).join(" ")}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <small>
              Use the Data Library to save custom words and reusable activity
              settings in the database.
            </small>
          </label>
        </div>

        <div className="form-section">
          <div className="form-section__heading">
            <span className="section-number" aria-hidden="true">
              2
            </span>
            <div>
              <h3>Difficulty</h3>
              <p>Difficulty changes the size of the playable keyboard.</p>
            </div>
          </div>
          <fieldset className="radio-card-grid">
            <legend className="sr-only">Wordle difficulty</legend>
            {difficultyOptions.map((option) => (
              <label className="radio-card" key={option.value}>
                <input
                  type="radio"
                  name="wordle-difficulty"
                  value={option.value}
                  checked={draft.difficulty === option.value}
                  onChange={() =>
                    setDraft((current) => ({
                      ...current,
                      difficulty: option.value,
                    }))
                  }
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
          <div className="form-section__heading">
            <span className="section-number" aria-hidden="true">
              3
            </span>
            <div>
              <h3 id="target-sequence-title">Target phoneme sequence</h3>
              <p>Choose sounds rather than entering standard spelling.</p>
            </div>
          </div>

          <div className="sequence-editor" aria-labelledby="target-sequence-title">
            <div className="sequence-editor__topline">
              <strong>{draft.target.length} phonemes selected</strong>
              <button
                className="text-button"
                type="button"
                onClick={() =>
                  setDraft((current) => ({ ...current, target: [] }))
                }
              >
                Clear sequence
              </button>
            </div>
            <div className="sequence-list" role="list" aria-label="Target sequence">
              {draft.target.length ? (
                draft.target.map((phoneme, index) => (
                  <button
                    className="sequence-chip"
                    type="button"
                    role="listitem"
                    key={`${phoneme}-${index}`}
                    title={`Remove ${getPhonemeHint(phoneme)}`}
                    aria-label={`Remove ${formatPhoneme(phoneme)} from position ${index + 1}`}
                    onClick={() => removePhoneme(index)}
                  >
                    <span>{formatPhoneme(phoneme)}</span>
                    <small aria-hidden="true">×</small>
                  </button>
                ))
              ) : (
                <p className="empty-state">Choose phonemes from the palette below.</p>
              )}
            </div>
          </div>

          <PhonemePalette
            labelledBy="target-sequence-title"
            disabled={draft.target.length >= 8}
            onSelect={addPhoneme}
          />
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
              <strong>Ready to export.</strong> The generated file contains its
              own styles and JavaScript, so it runs without Next.js.
            </p>
          </div>
        )}

        <div className="builder-footer">
          <p className="builder-notice" role="status" aria-live="polite">
            {notice}
          </p>
          <div className="builder-footer__actions">
            {initialActivity ? (
              <a
                className="button button--secondary"
                href={`/api/activities/${initialActivity.id}/export`}
              >
                Download stored HTML
              </a>
            ) : null}
            <button
              className="button button--primary"
              type="button"
              disabled={errors.length > 0}
              onClick={download}
            >
              Generate current HTML
            </button>
          </div>
        </div>
      </section>

      <aside className="preview-panel" aria-label="Wordle output preview">
        <WordlePreview key={previewKey} config={config} />
      </aside>
    </div>
  );
}
