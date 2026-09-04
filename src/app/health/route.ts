import { databaseHealth } from "@/server/database";
import type { HealthPayload } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const started = performance.now();
  try {
    const database = databaseHealth();
    const payload: HealthPayload & {
      wordLists: number;
      activities: number;
    } = {
      status: database.ok ? "ok" : "error",
      service: "phoneme-studio-backend",
      database: database.ok ? "connected" : "unavailable",
      timestamp: new Date().toISOString(),
      responseTimeMs: Number((performance.now() - started).toFixed(2)),
      wordLists: database.wordLists,
      activities: database.activities,
    };
    return Response.json(payload, {
      status: database.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    const payload: HealthPayload = {
      status: "error",
      service: "phoneme-studio-backend",
      database: "unavailable",
      timestamp: new Date().toISOString(),
      responseTimeMs: Number((performance.now() - started).toFixed(2)),
    };
    return Response.json(payload, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
