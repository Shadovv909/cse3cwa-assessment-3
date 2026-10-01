import { apiData, apiError, handleApiError } from "@/server/api";
import { seedSimulation } from "@/server/observability";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) return apiError(403, "ORIGIN", "Use the dashboard to add sample records.");
  try { return apiData(seedSimulation()); }
  catch (error) { return handleApiError(error); }
}
