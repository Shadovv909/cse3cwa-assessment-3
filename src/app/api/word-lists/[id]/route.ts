import { apiData, apiError, handleApiError, readJson } from "@/server/api";
import {
  deleteWordList,
  getWordList,
  updateWordList,
} from "@/server/database";
import { validateWordListInput } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const wordList = getWordList(id);
    if (!wordList) return apiError(404, "NOT_FOUND", "Word list not found.");
    return apiData(wordList);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const body = await readJson(request);
  if (!body.success) return body.response;
  const validation = validateWordListInput(body.data);
  if (!validation.success) {
    return apiError(
      422,
      "VALIDATION_ERROR",
      "Check the word list details and try again.",
      validation.errors,
    );
  }
  const { id } = await context.params;
  try {
    return apiData(updateWordList(id, validation.data));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    if (!deleteWordList(id)) {
      return apiError(404, "NOT_FOUND", "Word list not found.");
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
