import type {
  ActivityDifficulty,
  ThemePreference,
} from "@/types/activities";

export type StoredActivityType = "WORDLE" | "WORD_SEARCH";

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiErrorPayload = {
  error: {
    code: string;
    message: string;
    fields?: ApiFieldError[];
  };
};

export type StoredWord = {
  id: string;
  wordListId: string;
  english: string;
  hint: string;
  sortOrder: number;
  phonemes: string[];
  createdAt: string;
  updatedAt: string;
};

export type StoredWordListSummary = {
  id: string;
  name: string;
  description: string;
  wordCount: number;
  activityCount: number;
  createdAt: string;
  updatedAt: string;
};

export type StoredWordList = StoredWordListSummary & {
  words: StoredWord[];
};

export type StoredActivity = {
  id: string;
  name: string;
  activityType: StoredActivityType;
  difficulty: ActivityDifficulty;
  showHints: boolean;
  theme: ThemePreference;
  maxAttempts: number | null;
  gridSize: number | null;
  seed: number;
  outputTitle: string;
  outputFileName: string;
  wordListId: string;
  targetWordId: string | null;
  wordList: StoredWordList;
  createdAt: string;
  updatedAt: string;
};

export type WordInput = {
  id?: string;
  english: string;
  hint?: string;
  phonemes: string[];
  sortOrder?: number;
};

export type WordListInput = {
  name: string;
  description?: string;
  words?: WordInput[];
};

export type ActivityInput = {
  name: string;
  activityType: StoredActivityType;
  difficulty: ActivityDifficulty;
  showHints: boolean;
  theme: ThemePreference;
  maxAttempts?: number | null;
  gridSize?: number | null;
  seed?: number;
  outputTitle: string;
  outputFileName: string;
  wordListId: string;
  targetWordId?: string | null;
};

export type HealthPayload = {
  status: "ok" | "error";
  service: string;
  database: "connected" | "unavailable";
  timestamp: string;
  responseTimeMs: number;
};
