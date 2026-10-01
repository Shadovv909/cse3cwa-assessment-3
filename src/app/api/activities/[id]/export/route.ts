import { buildWordSearchHtml, buildWordleHtml } from "@/lib/export-html";
import { generatePhonemeGrid } from "@/lib/word-search";
import { apiError, handleApiError } from "@/server/api";
import { getActivity } from "@/server/database";
import { recordGeneration } from "@/server/observability";
import type { WordSearchConfig, WordleConfig } from "@/types/activities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function attachmentHeaders(fileName: string) {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Disposition": `attachment; filename="${fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}"`,
    "Cache-Control": "no-store",
  };
}

async function generate(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const activity = getActivity(id);
    if (!activity) return apiError(404, "NOT_FOUND", "Activity not found.");

    if (activity.activityType === "WORDLE") {
      const target = activity.wordList.words.find(
        (word) => word.id === activity.targetWordId,
      );
      if (!target) {
        return apiError(
          409,
          "MISSING_TARGET",
          "The stored Wordle activity does not have a valid target word.",
        );
      }
      const config: WordleConfig = {
        title: activity.outputTitle,
        englishWord: target.english,
        target: target.phonemes,
        maxAttempts: activity.maxAttempts || 6,
        difficulty: activity.difficulty,
        showHints: activity.showHints,
        theme: activity.theme,
      };
      return new Response(buildWordleHtml(config), {
        status: 200,
        headers: attachmentHeaders(activity.outputFileName),
      });
    }

    if (activity.wordList.words.length < 3) {
      return apiError(
        409,
        "INSUFFICIENT_WORDS",
        "The stored Word Search requires at least three words.",
      );
    }
    if (activity.wordList.words.length > 10) {
      return apiError(
        409,
        "TOO_MANY_WORDS",
        "The stored Word Search supports no more than ten words.",
      );
    }
    const config: WordSearchConfig = {
      title: activity.outputTitle,
      words: activity.wordList.words.map((word) => ({
        id: word.id,
        english: word.english,
        phonemes: word.phonemes,
      })),
      gridSize: activity.gridSize || 10,
      difficulty: activity.difficulty,
      showEnglishHints: activity.showHints,
      theme: activity.theme,
      seed: activity.seed,
    };
    const grid = generatePhonemeGrid(
      config.words,
      config.gridSize,
      config.difficulty,
      config.seed,
    );
    if (grid.placements.length !== config.words.length) {
      return apiError(
        409,
        "GRID_GENERATION_FAILED",
        "The stored words do not all fit. Increase the grid size or shorten the list.",
      );
    }
    return new Response(buildWordSearchHtml(config, grid), {
      status: 200,
      headers: attachmentHeaders(activity.outputFileName),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: Request, context: RouteContext) {
  const started = performance.now();
  const { id } = await context.params;
  const response = await generate(request, context);
  try {
    const activity = getActivity(id);
    const code = response.ok ? "OK" : (await response.clone().json()).error.code;
    recordGeneration({ activityId: id, activityType: activity?.activityType ?? null,
      success: response.ok, durationMs: performance.now() - started, code });
  } catch (error) {
    console.error("Generation monitoring write failed", error);
  }
  return response;
}
