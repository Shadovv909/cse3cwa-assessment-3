"use client";

import { useState, type CSSProperties } from "react";
import { formatPhoneme, getPhonemeHint } from "@/data/phonemes";
import {
  coordinateKey,
  getLineBetween,
  matchingPlacement,
} from "@/lib/word-search";
import type {
  Coordinate,
  WordSearchConfig,
  WordSearchGrid,
} from "@/types/activities";

export function WordSearchPreview({
  config,
  grid,
}: {
  config: WordSearchConfig;
  grid: WordSearchGrid;
}) {
  const [start, setStart] = useState<Coordinate | null>(null);
  const [foundWordIds, setFoundWordIds] = useState<Set<string>>(new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState(
    "Choose the first tile of a target sequence.",
  );
  const gridStyle = {
    "--grid-size": config.gridSize,
  } as CSSProperties;

  const selectCell = (cell: Coordinate) => {
    if (!start) {
      setStart(cell);
      setMessage(
        "Starting tile selected. Now choose the final tile in a straight line.",
      );
      return;
    }

    const path = getLineBetween(start, cell);
    setStart(null);
    if (!path) {
      setMessage(
        "That selection is not horizontal, vertical or diagonal. Try again.",
      );
      return;
    }

    const remainingWordIds = new Set(
      config.words
        .filter((word) => !foundWordIds.has(word.id))
        .map((word) => word.id),
    );
    const placement = matchingPlacement(
      path,
      grid.placements,
      remainingWordIds,
    );
    const word = config.words.find((item) => item.id === placement?.wordId);
    if (!placement || !word) {
      setMessage("That line does not match an unfound target sequence.");
      return;
    }

    const nextWords = new Set(foundWordIds);
    nextWords.add(word.id);
    const nextCells = new Set(foundCells);
    placement.cells.forEach((coordinate) =>
      nextCells.add(coordinateKey(coordinate)),
    );
    setFoundWordIds(nextWords);
    setFoundCells(nextCells);
    setMessage(
      nextWords.size === config.words.length
        ? "Excellent — every target sequence has been found."
        : `Found “${word.english}”. ${config.words.length - nextWords.size} sequence(s) remain.`,
    );
  };

  const reset = () => {
    setStart(null);
    setFoundWordIds(new Set());
    setFoundCells(new Set());
    setMessage("Choose the first tile of a target sequence.");
  };

  return (
    <div className="game-preview" aria-label="Interactive Word Search preview">
      <div className="preview-title-row">
        <div>
          <p className="eyebrow">Live preview</p>
          <h2>{config.title || "Untitled phoneme Word Search"}</h2>
        </div>
        <span className="status-pill">{config.difficulty}</span>
      </div>

      <p className="preview-instructions" id="word-search-preview-instructions">
        Choose the first and last tile of a straight sequence. The selection
        may be read in either direction. Press Escape to cancel a starting tile.
      </p>

      <div className="word-search-preview-layout">
        <div className="word-search-grid-wrap">
          <div
            className="word-search-grid"
            style={gridStyle}
            role="group"
            aria-label={`${config.gridSize} by ${config.gridSize} phoneme grid`}
            aria-describedby="word-search-preview-instructions word-search-preview-status"
            onKeyDown={(event) => {
              if (event.key === "Escape" && start) {
                setStart(null);
                setMessage("Starting tile cleared. Choose a new first tile.");
              }
            }}
          >
            {grid.cells.map((row, rowIndex) =>
              row.map((phoneme, columnIndex) => {
                const cell = { row: rowIndex, col: columnIndex };
                const isStart =
                  start?.row === rowIndex && start.col === columnIndex;
                const isFound = foundCells.has(coordinateKey(cell));
                return (
                  <button
                    className="word-search-cell"
                    data-start={isStart}
                    data-found={isFound}
                    data-row={rowIndex}
                    data-col={columnIndex}
                    type="button"
                    key={`${rowIndex}-${columnIndex}`}
                    title={getPhonemeHint(phoneme)}
                    data-hint={getPhonemeHint(phoneme)}
                    aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}, ${getPhonemeHint(phoneme)}${isFound ? ", found" : ""}`}
                    aria-pressed={isStart}
                    onClick={() => selectCell(cell)}
                  >
                    {formatPhoneme(phoneme)}
                    {isFound ? (
                      <span className="cell-status-icon" aria-hidden="true">
                        ✓
                      </span>
                    ) : null}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <section className="target-word-panel" aria-labelledby="preview-targets">
          <h3 id="preview-targets">Target sequences</h3>
          <ul className="target-word-list">
            {config.words.map((word) => {
              const found = foundWordIds.has(word.id);
              return (
                <li data-found={found} key={word.id}>
                  <span>{word.phonemes.map(formatPhoneme).join(" ")}</span>
                  {config.showEnglishHints || found ? (
                    <small>{word.english}</small>
                  ) : (
                    <small>English hint hidden</small>
                  )}
                  {found ? <b aria-label="Found">✓</b> : null}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <p
        className="game-message"
        id="word-search-preview-status"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      <div className="preview-actions">
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
