import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_PATH = ":memory:";
process.env.DATABASE_SEED = "0";

const wordListCollection = await import("../src/app/api/word-lists/route.ts");
const wordListItem = await import("../src/app/api/word-lists/[id]/route.ts");
const wordCollection = await import("../src/app/api/word-lists/[id]/words/route.ts");
const wordItem = await import("../src/app/api/words/[id]/route.ts");
const activityCollection = await import("../src/app/api/activities/route.ts");
const activityItem = await import("../src/app/api/activities/[id]/route.ts");
const activityExport = await import("../src/app/api/activities/[id]/export/route.ts");
const healthRoute = await import("../src/app/health/route.ts");
const database = await import("../src/server/database.ts");

function jsonRequest(url, method, body) {
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function responseData(response) {
  const payload = await response.json();
  return payload.data;
}

test("serves validated CRUD routes, stored exports and a 200 health response", async () => {
  const invalidResponse = await wordListCollection.POST(
    jsonRequest("http://localhost/api/word-lists", "POST", { name: "" }),
  );
  assert.equal(invalidResponse.status, 422);

  const createListResponse = await wordListCollection.POST(
    jsonRequest("http://localhost/api/word-lists", "POST", {
      name: "API demonstration list",
      description: "A list created through a Route Handler test.",
      words: [
        { english: "ship", phonemes: ["ʃ", "ɪ", "p"] },
        { english: "thin", phonemes: ["θ", "ɪ", "n"] },
        { english: "bad", phonemes: ["b", "æ", "d"] },
      ],
    }),
  );
  assert.equal(createListResponse.status, 201);
  const list = await responseData(createListResponse);
  assert.equal(list.words.length, 3);

  const readListResponse = await wordListItem.GET(
    new Request(`http://localhost/api/word-lists/${list.id}`),
    { params: Promise.resolve({ id: list.id }) },
  );
  assert.equal(readListResponse.status, 200);

  const createWordResponse = await wordCollection.POST(
    jsonRequest(`http://localhost/api/word-lists/${list.id}/words`, "POST", {
      english: "chin",
      hint: "Below the mouth",
      phonemes: ["tʃ", "ɪ", "n"],
    }),
    { params: Promise.resolve({ id: list.id }) },
  );
  assert.equal(createWordResponse.status, 201);
  const createdWord = await responseData(createWordResponse);

  const readWordResponse = await wordItem.GET(
    new Request(`http://localhost/api/words/${createdWord.id}`),
    { params: Promise.resolve({ id: createdWord.id }) },
  );
  assert.equal(readWordResponse.status, 200);
  assert.deepEqual((await responseData(readWordResponse)).phonemes, ["tʃ", "ɪ", "n"]);

  const updateWordResponse = await wordItem.PUT(
    jsonRequest(`http://localhost/api/words/${createdWord.id}`, "PUT", {
      english: "chin",
      hint: "The part below the lower lip",
      phonemes: ["tʃ", "ɪ", "n"],
    }),
    { params: Promise.resolve({ id: createdWord.id }) },
  );
  assert.equal(updateWordResponse.status, 200);
  assert.equal((await responseData(updateWordResponse)).hint, "The part below the lower lip");

  const createActivityResponse = await activityCollection.POST(
    jsonRequest("http://localhost/api/activities", "POST", {
      name: "API stored Wordle",
      activityType: "WORDLE",
      difficulty: "guided",
      showHints: true,
      theme: "light",
      maxAttempts: 6,
      gridSize: null,
      seed: 22421357,
      outputTitle: "Stored ship Wordle",
      outputFileName: "stored-ship-wordle.html",
      wordListId: list.id,
      targetWordId: list.words[0].id,
    }),
  );
  assert.equal(createActivityResponse.status, 201);
  const activity = await responseData(createActivityResponse);

  const exportResponse = await activityExport.GET(
    new Request(`http://localhost/api/activities/${activity.id}/export`),
    { params: Promise.resolve({ id: activity.id }) },
  );
  assert.equal(exportResponse.status, 200);
  assert.match(exportResponse.headers.get("content-type") || "", /text\/html/);
  assert.match(await exportResponse.text(), /Stored ship Wordle/);

  const healthResponse = await healthRoute.GET();
  assert.equal(healthResponse.status, 200);
  const health = await healthResponse.json();
  assert.equal(health.database, "connected");

  const deleteWordResponse = await wordItem.DELETE(
    new Request(`http://localhost/api/words/${createdWord.id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id: createdWord.id }) },
  );
  assert.equal(deleteWordResponse.status, 204);

  const deleteActivityResponse = await activityItem.DELETE(
    new Request(`http://localhost/api/activities/${activity.id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id: activity.id }) },
  );
  assert.equal(deleteActivityResponse.status, 204);

  const deleteListResponse = await wordListItem.DELETE(
    new Request(`http://localhost/api/word-lists/${list.id}`, { method: "DELETE" }),
    { params: Promise.resolve({ id: list.id }) },
  );
  assert.equal(deleteListResponse.status, 204);
  database.closeDatabase();
});
