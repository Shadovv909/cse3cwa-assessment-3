import { apiData, apiError, handleApiError, readJson } from "@/server/api";
import { createActivity, listActivities } from "@/server/database";
import { validateActivityInput } from "@/server/validation";
import type { StoredActivityType } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  if (type && type !== "WORDLE" && type !== "WORD_SEARCH") {
    return apiError(400, "INVALID_TYPE", "Type must be WORDLE or WORD_SEARCH.");
  }
  try {
    return apiData(listActivities((type || undefined) as StoredActivityType | undefined));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body.success) return body.response;
  const validation = validateActivityInput(body.data);
  if (!validation.success) {
    return apiError(
      422,
      "VALIDATION_ERROR",
      "Check the activity settings and try again.",
      validation.errors,
    );
  }
  try {
    return apiData(createActivity(validation.data), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
