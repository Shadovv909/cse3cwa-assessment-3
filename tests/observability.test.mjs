import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const folder = mkdtempSync(path.join(tmpdir(), "phoneme-metrics-"));
process.env.DATABASE_PATH = path.join(folder, "test.db");
process.env.DATABASE_SEED = "0";
const db = await import("../src/server/database.ts");
const metrics = await import("../src/server/observability.ts");
const visits = await import("../src/app/api/visits/route.ts");
const exports = await import("../src/app/api/activities/[id]/export/route.ts");

test("observability persists, deduplicates visits and separates simulated evidence", async () => {
  try {
    assert.equal(metrics.getMetrics("observed").averageTimeSeconds, null);
    metrics.recordGeneration({ activityId: "deleted", activityType: "WORDLE", success: true, durationMs: 12, code: "OK" });
    metrics.recordVisit({ id: "test-visit-0001", page: "/wordle", durationMs: 20000 });
    metrics.recordVisit({ id: "test-visit-0001", page: "/wordle", durationMs: 20000 });
    metrics.seedSimulation();
    const first = metrics.getMetrics("simulated");
    metrics.seedSimulation();
    assert.equal(metrics.getMetrics("simulated").attempts, first.attempts);
    assert.equal(first.failures, 2);
    db.closeDatabase();
    const observed = metrics.getMetrics("observed");
    assert.equal(observed.successes, 1);
    assert.equal(observed.visits, 1);
    assert.equal(observed.averageTimeSeconds, 20);
    assert.equal(observed.mostUsed, "WORDLE");
    const missing = await exports.GET(new Request("http://localhost/api/activities/missing/export"), { params: Promise.resolve({ id: "missing" }) });
    assert.equal(missing.status, 404);
    assert.equal(metrics.getMetrics("observed").failures, 1);
    const bad = await visits.POST(new Request("http://localhost/api/visits", { method: "POST", body: JSON.stringify({ id: "bad", page: "/wordle", durationMs: -1 }) }));
    assert.equal(bad.status, 422);
    assert.equal(metrics.getMetrics("observed").visits, 1);
    const valid = await visits.POST(new Request("http://localhost/api/visits", { method: "POST", body: JSON.stringify({ id: "test-visit-valid2", page: "/library", durationMs: 10000, source: "simulated" }) }));
    assert.equal(valid.status, 200);
    assert.equal(metrics.getMetrics("observed").visits, 2);
    const list = db.createWordList({ name: "Temporary", words: [{ english: "ship", phonemes: ["ʃ", "ɪ", "p"] }] });
    const activity = db.createActivity({ name: "Temporary Wordle", activityType: "WORDLE", difficulty: "guided", showHints: true, theme: "light", maxAttempts: 6, gridSize: null, seed: 2026, outputTitle: "Test", outputFileName: "test.html", wordListId: list.id, targetWordId: list.words[0].id });
    db.deleteWord(list.words[0].id);
    const rejected = await exports.GET(new Request(`http://localhost/api/activities/${activity.id}/export`), { params: Promise.resolve({ id: activity.id }) });
    assert.equal(rejected.status, 409);
    assert.equal(metrics.getMetrics("observed").failures, 2);
    assert.equal(metrics.getMetrics("observed").counts.empty_lists, 1);
    db.deleteWordList(list.id);
    assert.equal(metrics.getMetrics("observed").failures, 2);
  } finally {
    db.closeDatabase();
    rmSync(folder, { recursive: true, force: true });
  }
});
