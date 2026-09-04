import { phonemeBySymbol } from "@/data/phonemes";
import type {
  ActivityInput,
  ApiFieldError,
  WordInput,
  WordListInput,
} from "@/types/database";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ApiFieldError[] };

const activityTypes = new Set(["WORDLE", "WORD_SEARCH"]);
const difficulties = new Set(["guided", "standard", "challenge"]);
const themes = new Set(["light", "dark"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function addRequiredText(
  errors: ApiFieldError[],
  field: string,
  value: unknown,
  minimum: number,
  maximum: number,
) {
  const text = cleanText(value);
  if (!text) {
    errors.push({ field, message: "This field is required." });
  } else if (text.length < minimum || text.length > maximum) {
    errors.push({
      field,
      message: `Use between ${minimum} and ${maximum} characters.`,
    });
  }
  return text;
}

function addOptionalText(
  errors: ApiFieldError[],
  field: string,
  value: unknown,
  maximum: number,
) {
  const text = cleanText(value);
  if (text.length > maximum) {
    errors.push({ field, message: `Use no more than ${maximum} characters.` });
  }
  return text;
}

function normaliseFileName(value: string) {
  const base = value
    .toLowerCase()
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${base || "phoneme-activity"}.html`;
}

export function validateWordInput(value: unknown): ValidationResult<WordInput> {
  const errors: ApiFieldError[] = [];
  if (!isRecord(value)) {
    return {
      success: false,
      errors: [{ field: "word", message: "Provide a valid word object." }],
    };
  }

  const id = cleanText(value.id) || undefined;
  const english = addRequiredText(errors, "english", value.english, 1, 40);
  const hint = addOptionalText(errors, "hint", value.hint, 160);
  const rawPhonemes = Array.isArray(value.phonemes) ? value.phonemes : [];

  if (rawPhonemes.length < 1 || rawPhonemes.length > 8) {
    errors.push({
      field: "phonemes",
      message: "Use between 1 and 8 phonemes.",
    });
  }

  const phonemes = rawPhonemes.map((item, index) => {
    const symbol = cleanText(item).normalize("NFC");
    if (!symbol) {
      errors.push({
        field: `phonemes.${index}`,
        message: "A phoneme cannot be empty.",
      });
    } else if (symbol === "g") {
      errors.push({
        field: `phonemes.${index}`,
        message: "Use the IPA symbol ɡ rather than the typed letter g.",
      });
    } else if (!phonemeBySymbol.has(symbol)) {
      errors.push({
        field: `phonemes.${index}`,
        message: `The phoneme '${symbol}' is not in the supplied HCE inventory.`,
      });
    }
    return symbol;
  });

  let sortOrder: number | undefined;
  if (value.sortOrder !== undefined) {
    const sortOrderValue = Number(value.sortOrder);
    if (
      !Number.isInteger(sortOrderValue) ||
      sortOrderValue < 0 ||
      sortOrderValue > 999
    ) {
      errors.push({
        field: "sortOrder",
        message: "Sort order must be an integer between 0 and 999.",
      });
    } else {
      sortOrder = sortOrderValue;
    }
  }

  if (errors.length) return { success: false, errors };
  return {
    success: true,
    data: {
      id,
      english,
      hint,
      phonemes,
      ...(sortOrder === undefined ? {} : { sortOrder }),
    },
  };
}

export function validateWordListInput(
  value: unknown,
): ValidationResult<WordListInput> {
  const errors: ApiFieldError[] = [];
  if (!isRecord(value)) {
    return {
      success: false,
      errors: [{ field: "wordList", message: "Provide a valid word list." }],
    };
  }

  const name = addRequiredText(errors, "name", value.name, 2, 80);
  const description = addOptionalText(
    errors,
    "description",
    value.description,
    400,
  );

  let words: WordInput[] | undefined;
  if (value.words !== undefined) {
    if (!Array.isArray(value.words)) {
      errors.push({ field: "words", message: "Words must be an array." });
    } else if (value.words.length > 40) {
      errors.push({
        field: "words",
        message: "A word list can contain no more than 40 words.",
      });
    } else {
      words = [];
      const englishSeen = new Set<string>();
      value.words.forEach((word, index) => {
        const result = validateWordInput(word);
        if (!result.success) {
          result.errors.forEach((error) =>
            errors.push({
              field: `words.${index}.${error.field}`,
              message: error.message,
            }),
          );
          return;
        }
        const key = result.data.english.toLocaleLowerCase("en-AU");
        if (englishSeen.has(key)) {
          errors.push({
            field: `words.${index}.english`,
            message: "English words must be unique within a list.",
          });
          return;
        }
        englishSeen.add(key);
        words?.push({ ...result.data, sortOrder: index });
      });
    }
  }

  if (errors.length) return { success: false, errors };
  return { success: true, data: { name, description, words } };
}

export function validateActivityInput(
  value: unknown,
): ValidationResult<ActivityInput> {
  const errors: ApiFieldError[] = [];
  if (!isRecord(value)) {
    return {
      success: false,
      errors: [{ field: "activity", message: "Provide a valid activity." }],
    };
  }

  const name = addRequiredText(errors, "name", value.name, 2, 80);
  const activityType = cleanText(value.activityType);
  const difficulty = cleanText(value.difficulty);
  const theme = cleanText(value.theme);
  const outputTitle = addRequiredText(
    errors,
    "outputTitle",
    value.outputTitle,
    2,
    80,
  );
  const outputFileNameText = addRequiredText(
    errors,
    "outputFileName",
    value.outputFileName,
    1,
    80,
  );
  const wordListId = addRequiredText(
    errors,
    "wordListId",
    value.wordListId,
    1,
    80,
  );

  if (!activityTypes.has(activityType)) {
    errors.push({
      field: "activityType",
      message: "Choose WORDLE or WORD_SEARCH.",
    });
  }
  if (!difficulties.has(difficulty)) {
    errors.push({
      field: "difficulty",
      message: "Choose guided, standard or challenge.",
    });
  }
  if (!themes.has(theme)) {
    errors.push({ field: "theme", message: "Choose light or dark." });
  }
  if (typeof value.showHints !== "boolean") {
    errors.push({
      field: "showHints",
      message: "Show hints must be true or false.",
    });
  }

  const maxAttemptsNumber = Number(value.maxAttempts ?? 6);
  const gridSizeNumber = Number(value.gridSize ?? 10);
  const seedNumber = Number(value.seed ?? 2026);
  const targetWordId = cleanText(value.targetWordId) || null;

  if (activityType === "WORDLE") {
    if (!Number.isInteger(maxAttemptsNumber) || maxAttemptsNumber < 4 || maxAttemptsNumber > 8) {
      errors.push({
        field: "maxAttempts",
        message: "Wordle attempts must be an integer from 4 to 8.",
      });
    }
    if (!targetWordId) {
      errors.push({
        field: "targetWordId",
        message: "Choose a target word for Wordle.",
      });
    }
  }

  if (activityType === "WORD_SEARCH") {
    if (!Number.isInteger(gridSizeNumber) || gridSizeNumber < 8 || gridSizeNumber > 14) {
      errors.push({
        field: "gridSize",
        message: "Word Search grid size must be an integer from 8 to 14.",
      });
    }
  }

  if (!Number.isInteger(seedNumber) || seedNumber < 1 || seedNumber > 2147483647) {
    errors.push({
      field: "seed",
      message: "Seed must be a positive 32-bit integer.",
    });
  }

  if (errors.length) return { success: false, errors };
  return {
    success: true,
    data: {
      name,
      activityType: activityType as ActivityInput["activityType"],
      difficulty: difficulty as ActivityInput["difficulty"],
      showHints: value.showHints as boolean,
      theme: theme as ActivityInput["theme"],
      maxAttempts: activityType === "WORDLE" ? maxAttemptsNumber : null,
      gridSize: activityType === "WORD_SEARCH" ? gridSizeNumber : null,
      seed: seedNumber,
      outputTitle,
      outputFileName: normaliseFileName(outputFileNameText),
      wordListId,
      targetWordId,
    },
  };
}
