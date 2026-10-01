import { apiData, apiError, handleApiError } from "@/server/api";
import { getMetrics } from "@/server/observability";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const source = url.searchParams.get("source") || "observed";
  if (source !== "observed" && source !== "simulated") return apiError(400, "INVALID_SOURCE", "Source must be observed or simulated.");
  try {
    const metrics = getMetrics(source);
    if (url.searchParams.get("format") === "csv") {
      const rows = [["source", "day", "attempts", "successes", "failures"], ...metrics.daily.map(row => [source, row.day, row.attempts, row.successes, row.failures])];
      return new Response(rows.map(row => row.join(",")).join("\r\n"), { headers: {
        "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="generation-report.csv"', "Cache-Control": "no-store",
      } });
    }
    return apiData(metrics);
  } catch (error) { return handleApiError(error); }
}
