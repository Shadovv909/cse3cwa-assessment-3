import { phonemeOptions } from "@/data/phonemes";
import type {
  ActivityDifficulty,
  Coordinate,
  PhonemeWord,
  WordPlacement,
  WordSearchGrid,
} from "@/types/activities";

const directionSets: Record<ActivityDifficulty, Array<[number, number]>> = {
  guided: [
    [0, 1],
    [1, 0],
  ],
  standard: [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ],
  challenge: [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ],
};

function hashText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function randomItem<T>(items: readonly T[], random: () => number) {
  return items[Math.floor(random() * items.length)];
}

function placementCells(
  startRow: number,
  startCol: number,
  rowStep: number,
  colStep: number,
  length: number,
): Coordinate[] {
  return Array.from({ length }, (_, index) => ({
    row: startRow + rowStep * index,
    col: startCol + colStep * index,
  }));
}

type PlacementCandidate = {
  cells: Coordinate[];
  overlap: number;
  tieBreak: number;
};

function candidatesForWord(
  word: PhonemeWord,
  grid: Array<Array<string | null>>,
  directions: Array<[number, number]>,
  random: () => number,
): PlacementCandidate[] {
  const size = grid.length;
  const candidates: PlacementCandidate[] = [];

  directions.forEach(([rowStep, colStep]) => {
    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const cells = placementCells(
          row,
          col,
          rowStep,
          colStep,
          word.phonemes.length,
        );
        const inBounds = cells.every(
          (cell) =>
            cell.row >= 0 &&
            cell.row < size &&
            cell.col >= 0 &&
            cell.col < size,
        );
        if (!inBounds) continue;

        let overlap = 0;
        const compatible = cells.every((cell, index) => {
          const existing = grid[cell.row][cell.col];
          if (existing === word.phonemes[index]) overlap += 1;
          return existing === null || existing === word.phonemes[index];
        });
        if (compatible) candidates.push({ cells, overlap, tieBreak: random() });
      }
    }
  });

  return candidates.sort(
    (first, second) =>
      second.overlap - first.overlap || second.tieBreak - first.tieBreak,
  );
}

function fillerSymbols(
  words: PhonemeWord[],
  difficulty: ActivityDifficulty,
  random: () => number,
) {
  const targets = new Set(words.flatMap((word) => word.phonemes));
  const available = phonemeOptions
    .map((option) => option.symbol)
    .filter((symbol) => !targets.has(symbol))
    .map((symbol) => ({ symbol, order: random() }))
    .sort((a, b) => a.order - b.order)
    .map(({ symbol }) => symbol);
  const distractorCount =
    difficulty === "guided" ? 5 : difficulty === "standard" ? 12 : available.length;
  return [...targets, ...available.slice(0, distractorCount)];
}

export function generatePhonemeGrid(
  words: PhonemeWord[],
  gridSize: number,
  difficulty: ActivityDifficulty,
  seed = 0,
): WordSearchGrid {
  const normalisedSize = Math.max(6, Math.min(12, gridSize));
  const grid: Array<Array<string | null>> = Array.from(
    { length: normalisedSize },
    () => Array.from({ length: normalisedSize }, () => null),
  );
  const signature = JSON.stringify({ words, gridSize, difficulty, seed });
  const random = createRandom(hashText(signature));
  const directions = directionSets[difficulty];
  const orderedWords = [...words]
    .filter((word) => word.phonemes.length > 0)
    .sort(
      (first, second) =>
        second.phonemes.length - first.phonemes.length ||
        first.id.localeCompare(second.id),
    );
  const placements: WordPlacement[] = [];
  let searchNodes = 0;
  const maxSearchNodes = 8000;

  const placeFrom = (wordIndex: number): boolean => {
    if (wordIndex >= orderedWords.length) return true;
    if (searchNodes >= maxSearchNodes) return false;
    searchNodes += 1;

    const word = orderedWords[wordIndex];
    const candidates = candidatesForWord(word, grid, directions, random).slice(
      0,
      220,
    );

    for (const candidate of candidates) {
      const changed: Coordinate[] = [];
      candidate.cells.forEach((cell, index) => {
        if (grid[cell.row][cell.col] === null) {
          grid[cell.row][cell.col] = word.phonemes[index];
          changed.push(cell);
        }
      });
      placements.push({ wordId: word.id, cells: candidate.cells });

      if (placeFrom(wordIndex + 1)) return true;

      placements.pop();
      changed.forEach((cell) => {
        grid[cell.row][cell.col] = null;
      });
    }
    return false;
  };

  placeFrom(0);

  const filler = fillerSymbols(words, difficulty, random);
  const completed = grid.map((row) =>
    row.map((cell) => cell ?? randomItem(filler, random)),
  );

  return { cells: completed, placements };
}

export function getLineBetween(
  start: Coordinate,
  end: Coordinate,
): Coordinate[] | null {
  const rowDifference = end.row - start.row;
  const colDifference = end.col - start.col;
  const isStraight =
    rowDifference === 0 ||
    colDifference === 0 ||
    Math.abs(rowDifference) === Math.abs(colDifference);

  if (!isStraight) return null;

  const rowStep = Math.sign(rowDifference);
  const colStep = Math.sign(colDifference);
  const length = Math.max(Math.abs(rowDifference), Math.abs(colDifference));

  return Array.from({ length: length + 1 }, (_, index) => ({
    row: start.row + rowStep * index,
    col: start.col + colStep * index,
  }));
}

export function coordinateKey({ row, col }: Coordinate) {
  return `${row}:${col}`;
}

function coordinatePathsEqual(first: Coordinate[], second: Coordinate[]) {
  return (
    first.length === second.length &&
    first.every(
      (coordinate, index) =>
        coordinate.row === second[index].row &&
        coordinate.col === second[index].col,
    )
  );
}

export function matchingPlacement(
  path: Coordinate[],
  placements: WordPlacement[],
  allowedWordIds?: Set<string>,
) {
  const reversed = [...path].reverse();
  return placements.find(
    (placement) =>
      (!allowedWordIds || allowedWordIds.has(placement.wordId)) &&
      (coordinatePathsEqual(placement.cells, path) ||
        coordinatePathsEqual(placement.cells, reversed)),
  );
}
