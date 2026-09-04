import { apiData, apiError, handleApiError, readJson } from "@/server/api";
import {
  deleteActivity,
  getActivity,
  updateActivity,
} from "@/server/database";
import { validateActivityInput } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const activity = getActivity(id);
    if (!activity) return apiError(404, "NOT_FOUND", "Activity not found.");
    return apiData(activity);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
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
  const { id } = await context.params;
  try {
    return apiData(updateActivity(id, validation.data));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    if (!deleteActivity(id)) {
      return apiError(404, "NOT_FOUND", "Activity not found.");
    }
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
