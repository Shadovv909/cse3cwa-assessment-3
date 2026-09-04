import { apiData, apiError, handleApiError, readJson } from "@/server/api";
import { createWord } from "@/server/database";
import { validateWordInput } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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
    return apiData(createWord(id, validation.data), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
