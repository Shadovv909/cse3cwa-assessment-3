import type { ScoredPhoneme, TileStatus } from "@/types/activities";

export function scorePhonemeGuess(
  guess: string[],
  target: string[],
): ScoredPhoneme[] {
  const statuses: TileStatus[] = guess.map(() => "absent");
  const remaining = new Map<string, number>();

  target.forEach((phoneme, index) => {
    if (guess[index] === phoneme) {
      statuses[index] = "correct";
      return;
    }
    remaining.set(phoneme, (remaining.get(phoneme) ?? 0) + 1);
  });

  guess.forEach((phoneme, index) => {
    if (statuses[index] === "correct") return;
    const count = remaining.get(phoneme) ?? 0;
    if (count > 0) {
      statuses[index] = "present";
      remaining.set(phoneme, count - 1);
    }
  });

  return guess.map((phoneme, index) => ({
    phoneme,
    status: statuses[index],
  }));
}
