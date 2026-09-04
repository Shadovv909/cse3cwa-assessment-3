import { apiData, apiError, handleApiError, readJson } from "@/server/api";
import { deleteWord, getWord, updateWord } from "@/server/database";
import { validateWordInput } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const word = getWord(id);
    if (!word) return apiError(404, "NOT_FOUND", "Word not found.");
    return apiData(word);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const body = await readJson(request);
  if (!body.success) return body.response;
  const validation = validateWordInput(body.data);
  if (!validation.success) {
    return apiError(
      422,
      "VALIDATION_ERROR",
      "Check the word and phoneme sequence.",
      validation.errors,
    );
  }
  const { id } = await context.params;
  try {
    return apiData(updateWord(id, validation.data));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    if (!deleteWord(id)) return apiError(404, "NOT_FOUND", "Word not found.");
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
