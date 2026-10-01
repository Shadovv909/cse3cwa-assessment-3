import { apiData, apiError, handleApiError, readJson } from "@/server/api";
import { recordVisit } from "@/server/observability";

export const runtime = "nodejs";
const pages = new Set(["/", "/library", "/wordle", "/word-search", "/dashboard", "/reports", "/about", "/settings"]);

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body.success) return body.response;
  const value = body.data;
  if (!value || typeof value !== "object" || typeof value.id !== "string" ||
      !/^[a-zA-Z0-9-]{12,80}$/.test(value.id) || !pages.has(value.page) ||
      !Number.isInteger(value.durationMs) || value.durationMs < 0 || value.durationMs > 86400000) {
    return apiError(422, "INVALID_VISIT", "Provide a valid visit ID, known page and duration from 0 to 86400000 milliseconds.");
  }
  try {
    recordVisit(value);
    return apiData({ recorded: true });
  } catch (error) { return handleApiError(error); }
}
