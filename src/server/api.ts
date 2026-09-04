import { NextResponse } from "next/server";
import {
  DatabaseConflictError,
  DatabaseNotFoundError,
} from "@/server/database";
import type { ApiFieldError } from "@/types/database";

export async function readJson(request: Request) {
  try {
    return { success: true as const, data: await request.json() };
  } catch {
    return {
      success: false as const,
      response: apiError(
        400,
        "INVALID_JSON",
        "The request body must contain valid JSON.",
      ),
    };
  }
}

export function apiError(
  status: number,
  code: string,
  message: string,
  fields?: ApiFieldError[],
) {
  return NextResponse.json(
    { error: { code, message, ...(fields?.length ? { fields } : {}) } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function apiData<T>(data: T, status = 200) {
  return NextResponse.json(
    { data },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof DatabaseNotFoundError) {
    return apiError(404, "NOT_FOUND", error.message);
  }
  if (error instanceof DatabaseConflictError) {
    return apiError(409, "CONFLICT", error.message);
  }
  if (error instanceof Error && /UNIQUE constraint failed/i.test(error.message)) {
    return apiError(
      409,
      "DUPLICATE_VALUE",
      "That value already exists in the selected word list.",
    );
  }
  console.error(error);
  return apiError(
    500,
    "INTERNAL_ERROR",
    "The server could not complete the request.",
  );
}
