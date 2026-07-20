export type ActivityDifficulty = "guided" | "standard" | "challenge";

export type ThemePreference = "light" | "dark";
export type DensityPreference = "comfortable" | "compact";

export type PhonemeWord = {
  id: string;
  english: string;
  phonemes: string[];
};

export type WordleConfig = {
  title: string;
  englishWord: string;
  target: string[];
  maxAttempts: number;
  difficulty: ActivityDifficulty;
  showHints: boolean;
  theme: ThemePreference;
};

export type WordSearchConfig = {
  title: string;
  words: PhonemeWord[];
  gridSize: number;
  difficulty: ActivityDifficulty;
  showEnglishHints: boolean;
  theme: ThemePreference;
  seed: number;
};

export type Coordinate = {
  row: number;
  col: number;
};

export type WordPlacement = {
  wordId: string;
  cells: Coordinate[];
};

export type WordSearchGrid = {
  cells: string[][];
  placements: WordPlacement[];
};

export type TileStatus = "correct" | "present" | "absent";

export type ScoredPhoneme = {
  phoneme: string;
  status: TileStatus;
};
