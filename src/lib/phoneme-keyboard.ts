import { phonemeOptions } from "@/data/phonemes";
import type { ActivityDifficulty } from "@/types/activities";

const additionalCounts: Record<Exclude<ActivityDifficulty, "challenge">, number> = {
  guided: 7,
  standard: 16,
};

export function getPhonemeKeyboard(
  target: string[],
  difficulty: ActivityDifficulty,
) {
  if (difficulty === "challenge") return phonemeOptions;

  const targetSet = new Set(target);
  const targetCategories = new Set(
    phonemeOptions
      .filter((option) => targetSet.has(option.symbol))
      .map((option) => option.category),
  );
  const preferred = phonemeOptions.filter(
    (option) =>
      !targetSet.has(option.symbol) && targetCategories.has(option.category),
  );
  const remaining = phonemeOptions.filter(
    (option) =>
      !targetSet.has(option.symbol) && !targetCategories.has(option.category),
  );
  const distractors = [...preferred, ...remaining].slice(
    0,
    additionalCounts[difficulty],
  );
  const included = new Set([
    ...target,
    ...distractors.map((option) => option.symbol),
  ]);

  return phonemeOptions.filter((option) => included.has(option.symbol));
}
