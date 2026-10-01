import { randomUUID } from "node:crypto";
import { getDatabase } from "@/server/database";
import type { StoredActivityType } from "@/types/database";

export type MetricSource = "observed" | "simulated";
type Generation = { activityId: string | null; activityType: StoredActivityType | null; success: boolean; durationMs: number; code: string };

export function recordGeneration(event: Generation) {
  getDatabase().prepare(`INSERT INTO generation_events
    (id, activity_id, activity_type, success, duration_ms, code, source, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 'observed', ?)`)
    .run(randomUUID(), event.activityId, event.activityType, event.success ? 1 : 0,
      Math.max(0, event.durationMs), event.code, new Date().toISOString());
}

export function recordVisit(visit: { id: string; page: string; durationMs: number }) {
  getDatabase().prepare(`INSERT OR IGNORE INTO page_visits (id, page, duration_ms, source, created_at)
    VALUES (?, ?, ?, 'observed', ?)`)
    .run(visit.id, visit.page, visit.durationMs, new Date().toISOString());
}

export function seedSimulation() {
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = db.prepare("INSERT OR IGNORE INTO simulation_batches (id, created_at) VALUES ('assessment-3-v1', ?)").run(new Date().toISOString());
    if (result.changes) {
      const event = db.prepare(`INSERT INTO generation_events
        (id, activity_id, activity_type, success, duration_ms, code, source, created_at)
        VALUES (?, NULL, ?, ?, ?, ?, 'simulated', ?)`);
      const visit = db.prepare("INSERT INTO page_visits (id, page, duration_ms, source, created_at) VALUES (?, ?, ?, 'simulated', ?)");
      for (let i = 0; i < 12; i++) {
        const type = i % 3 === 0 ? "WORD_SEARCH" : "WORDLE";
        const success = i !== 4 && i !== 9;
        const timestamp = new Date(Date.now() - (i % 7) * 86400000).toISOString();
        event.run(`sim-generation-${i}`, type, success ? 1 : 0, 8 + i * 3, success ? "OK" : "SIMULATED_INVALID_INPUT", timestamp);
        visit.run(`sim-visit-${i}`, type === "WORDLE" ? "/wordle" : "/word-search", 15000 + i * 5000, timestamp);
      }
    }
    db.exec("COMMIT");
    return { inserted: result.changes > 0 };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getMetrics(source: MetricSource) {
  const db = getDatabase();
  const totals = db.prepare(`SELECT COUNT(*) AS attempts, COALESCE(SUM(success), 0) AS successes,
    COALESCE(SUM(1-success), 0) AS failures, AVG(duration_ms) AS average_generation_ms
    FROM generation_events WHERE source = ?`).get(source)!;
  const visits = db.prepare("SELECT COUNT(*) AS visits, AVG(duration_ms)/1000.0 AS average_seconds FROM page_visits WHERE source = ?").get(source)!;
  const usage = db.prepare(`SELECT activity_type AS type, COUNT(*) AS attempts, SUM(success) AS successes,
    SUM(1-success) AS failures FROM generation_events WHERE source = ? AND activity_type IS NOT NULL
    GROUP BY activity_type ORDER BY attempts DESC, activity_type`).all(source);
  const counts = db.prepare(`SELECT
    (SELECT COUNT(*) FROM word_lists) AS lists,
    (SELECT COUNT(*) FROM words) AS words,
    (SELECT COUNT(*) FROM phonemes) AS phonemes,
    (SELECT COUNT(*) FROM activity_configurations WHERE activity_type = 'WORDLE') AS wordle,
    (SELECT COUNT(*) FROM activity_configurations WHERE activity_type = 'WORD_SEARCH') AS word_search,
    (SELECT COUNT(*) FROM word_lists w WHERE NOT EXISTS (SELECT 1 FROM words WHERE word_list_id = w.id)) AS empty_lists`).get()!;
  const daily = db.prepare(`SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS attempts,
    SUM(success) AS successes, SUM(1-success) AS failures FROM generation_events WHERE source = ?
    GROUP BY day ORDER BY day DESC LIMIT 14`).all(source);
  const recent = db.prepare(`SELECT id, activity_type AS type, success, code, duration_ms, created_at
    FROM generation_events WHERE source = ? ORDER BY created_at DESC, id DESC LIMIT 20`).all(source);
  const pages = db.prepare(`SELECT page, COUNT(*) AS visits, AVG(duration_ms)/1000.0 AS average_seconds
    FROM page_visits WHERE source = ? GROUP BY page ORDER BY visits DESC, page`).all(source);
  const top = usage.filter(row => row.attempts === usage[0]?.attempts).map(row => String(row.type));
  return {
    source, generatedAt: new Date().toISOString(),
    attempts: Number(totals.attempts), successes: Number(totals.successes), failures: Number(totals.failures),
    averageGenerationMs: totals.average_generation_ms === null ? null : Number(totals.average_generation_ms),
    visits: Number(visits.visits), averageTimeSeconds: visits.average_seconds === null ? null : Number(visits.average_seconds),
    mostUsed: top.length ? top.join(" / ") : null,
    counts: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, Number(value)])),
    usage, daily, recent, pages,
  };
}
