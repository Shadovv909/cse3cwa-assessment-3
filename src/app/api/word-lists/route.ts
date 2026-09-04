import { apiData, apiError, handleApiError, readJson } from "@/server/api";
import { createWordList, listWordLists } from "@/server/database";
import { validateWordListInput } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return apiData(listWordLists());
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
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
  try {
    return apiData(createWordList(validation.data), 201);
  } catch (error) {
    return handleApiError(error);
  }
}
