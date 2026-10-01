"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { formatPhoneme, getPhonemeHint } from "@/data/phonemes";
import { getPhonemeKeyboard } from "@/lib/phoneme-keyboard";
import { scorePhonemeGuess } from "@/lib/scoring";
import type { ScoredPhoneme, WordleConfig } from "@/types/activities";

const statusIcon = {
  correct: "✓",
  present: "↔",
  absent: "×",
} as const;

export function WordlePreview({ config }: { config: WordleConfig }) {
  const [guesses, setGuesses] = useState<ScoredPhoneme[][]>([]);
  const [current, setCurrent] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<"won" | "lost" | null>(null);
  const [message, setMessage] = useState(
    `Choose ${config.target.length} phonemes to begin.`,
  );
  const keyboard = useMemo(
    () => getPhonemeKeyboard(config.target, config.difficulty),
    [config.difficulty, config.target],
  );
  const finished = outcome !== null;
  const boardStyle = {
    "--tile-count": config.target.length,
  } as CSSProperties;

  const addPhoneme = (phoneme: string) => {
    if (finished || current.length >= config.target.length) return;
    const next = [...current, phoneme];
    setCurrent(next);
    setMessage(
      next.length === config.target.length
        ? "Row complete. Submit your guess."
        : `Choose ${config.target.length - next.length} more phoneme(s).`,
    );
  };

  const deletePhoneme = () => {
    if (finished) return;
    const next = current.slice(0, -1);
    setCurrent(next);
    setMessage(
      next.length
        ? `Current row contains ${next.length} phoneme(s).`
        : `Choose ${config.target.length} phonemes to begin.`,
    );
  };

  const submitGuess = () => {
    if (finished) return;
    if (current.length !== config.target.length) {
      setMessage(
        `Complete all ${config.target.length} tiles before submitting.`,
      );
      return;
    }

    const scored = scorePhonemeGuess(current, config.target);
    const nextGuesses = [...guesses, scored];
    const won = scored.every((item) => item.status === "correct");
    setGuesses(nextGuesses);
    setCurrent([]);

    if (won) {
      setOutcome("won");
      setMessage(`Correct. The English word is '${config.englishWord}'.`);
    } else if (nextGuesses.length >= config.maxAttempts) {
      setOutcome("lost");
      setMessage(
        `Activity complete. The English answer was '${config.englishWord}'.`,
      );
    } else {
      setMessage("Good try. Use the symbols to refine the next sequence.");
    }
  };

  const reset = () => {
    setGuesses([]);
    setCurrent([]);
    setOutcome(null);
    setMessage(`Choose ${config.target.length} phonemes to begin.`);
  };

  return (
    <div className="game-preview" aria-label="Interactive Wordle preview">
      <div className="preview-title-row">
        <div>
          <p className="eyebrow">Live preview</p>
          <h2>{config.title || "Untitled phoneme Wordle"}</h2>
        </div>
        <span className="status-pill">{config.difficulty}</span>
      </div>

      <p className="preview-instructions" id="wordle-preview-instructions">
        Build a phoneme sequence. A tick marks the correct position and a
        double arrow marks a phoneme that belongs elsewhere.
      </p>

      <div className="wordle-play-layout">
        <div className="wordle-board-column">
          <div
            className="wordle-board"
            style={boardStyle}
            role="grid"
            aria-label="Phoneme Wordle board"
            aria-describedby="wordle-preview-instructions wordle-preview-status"
            aria-rowcount={config.maxAttempts}
            aria-colcount={config.target.length}
          >
            {Array.from({ length: config.maxAttempts }, (_, rowIndex) => {
              const submitted = guesses[rowIndex];
              const isCurrent = rowIndex === guesses.length && !finished;
              return (
                <div className="wordle-row" role="row" key={rowIndex}>
                  {Array.from({ length: config.target.length }, (_, columnIndex) => {
                    const scored = submitted?.[columnIndex];
                    const draft = isCurrent ? current[columnIndex] : undefined;
                    return (
                      <div
                        className="wordle-tile"
                        data-status={scored?.status}
                        role="gridcell"
                        aria-rowindex={rowIndex + 1}
                        aria-colindex={columnIndex + 1}
                        aria-label={
                          scored
                            ? `${formatPhoneme(scored.phoneme)}, ${scored.status}`
                            : draft
                              ? `${formatPhoneme(draft)}, not submitted`
                              : "Empty phoneme tile"
                        }
                        key={columnIndex}
                      >
                        {scored ? formatPhoneme(scored.phoneme) : null}
                        {!scored && draft ? formatPhoneme(draft) : null}
                        {scored ? (
                          <span className="tile-status-icon" aria-hidden="true">
                            {statusIcon[scored.status]}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="status-legend" aria-label="Wordle result legend">
            <span>
              <b>✓</b> correct place
            </span>
            <span>
              <b>↔</b> different place
            </span>
            <span>
              <b>×</b> not in answer
            </span>
          </div>

          <p
            className="game-message"
            id="wordle-preview-status"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        </div>

        <section className="wordle-keyboard-column" aria-labelledby="wordle-keyboard-title">
          <h3 id="wordle-keyboard-title">Phoneme keyboard</h3>
          <p>Choose symbols to build the current row.</p>
          <div className="phoneme-keyboard">
            {keyboard.map((option) => (
              <button
                className="phoneme-key"
                type="button"
                key={option.symbol}
                disabled={finished}
                title={getPhonemeHint(option.symbol)}
                data-hint={getPhonemeHint(option.symbol)}
                  onClick={() => addPhoneme(option.symbol)}
              >
                  <span>{formatPhoneme(option.symbol)}</span>
                  <span className="sr-only">Choose {getPhonemeHint(option.symbol)}</span>
                {config.showHints ? <small>{option.label}</small> : null}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="preview-actions">
        <button
          className="button button--secondary button--small"
          type="button"
          disabled={finished || current.length === 0}
          onClick={deletePhoneme}
        >
          Delete last
        </button>
        <button
          className="button button--primary button--small"
          type="button"
          disabled={finished}
          onClick={submitGuess}
        >
          Submit guess
        </button>
        <button
          className="button button--ghost button--small"
          type="button"
          onClick={reset}
        >
          Reset preview
        </button>
      </div>
    </div>
  );
}
