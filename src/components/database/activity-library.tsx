"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PhonemePalette } from "@/components/ui/phoneme-palette";
import { formatPhoneme, getPhonemeHint } from "@/data/phonemes";
import { apiRequest } from "@/lib/api-client";
import type {
  ActivityInput,
  HealthPayload,
  StoredActivity,
  StoredActivityType,
  StoredWord,
  StoredWordList,
  WordInput,
} from "@/types/database";

type HealthWithCounts = HealthPayload & {
  wordLists?: number;
  activities?: number;
};

type WordDraft = {
  id: string | null;
  english: string;
  hint: string;
  phonemes: string[];
};

type ActionResult = {
  message: string;
  listId?: string | null;
  activityId?: string | null;
};

const emptyWord: WordDraft = {
  id: null,
  english: "",
  hint: "",
  phonemes: [],
};

const defaultActivity = (wordList?: StoredWordList): ActivityInput => ({
  name: "New stored activity",
  activityType: "WORDLE",
  difficulty: "guided",
  showHints: true,
  theme: "light",
  maxAttempts: 6,
  gridSize: null,
  seed: 22421357,
  outputTitle: "Stored phoneme activity",
  outputFileName: "stored-phoneme-activity.html",
  wordListId: wordList?.id || "",
  targetWordId: wordList?.words[0]?.id || null,
});

function activityToInput(activity: StoredActivity): ActivityInput {
  return {
    name: activity.name,
    activityType: activity.activityType,
    difficulty: activity.difficulty,
    showHints: activity.showHints,
    theme: activity.theme,
    maxAttempts: activity.maxAttempts,
    gridSize: activity.gridSize,
    seed: activity.seed,
    outputTitle: activity.outputTitle,
    outputFileName: activity.outputFileName,
    wordListId: activity.wordListId,
    targetWordId: activity.targetWordId,
  };
}

function wordToDraft(word: StoredWord): WordDraft {
  return {
    id: word.id,
    english: word.english,
    hint: word.hint,
    phonemes: [...word.phonemes],
  };
}

function wordPayload(draft: WordDraft): WordInput {
  return {
    english: draft.english,
    hint: draft.hint,
    phonemes: draft.phonemes,
  };
}

export function ActivityLibrary() {
  const [wordLists, setWordLists] = useState<StoredWordList[]>([]);
  const [activities, setActivities] = useState<StoredActivity[]>([]);
  const [health, setHealth] = useState<HealthWithCounts | null>(null);
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [wordDraft, setWordDraft] = useState<WordDraft>(emptyWord);
  const [activityDraft, setActivityDraft] = useState<ActivityInput>(
    defaultActivity(),
  );
  const [notice, setNotice] = useState("Connecting to the backend...");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const selectedList = useMemo(
    () => wordLists.find((list) => list.id === selectedListId) || null,
    [selectedListId, wordLists],
  );
  const selectedActivity = useMemo(
    () => activities.find((activity) => activity.id === selectedActivityId) || null,
    [activities, selectedActivityId],
  );
  const activityWordList = useMemo(
    () => wordLists.find((list) => list.id === activityDraft.wordListId) || null,
    [activityDraft.wordListId, wordLists],
  );

  const selectListRecord = useCallback((list: StoredWordList | null) => {
    setSelectedListId(list?.id || "");
    setListName(list?.name || "New phoneme word list");
    setListDescription(list?.description || "");
    setWordDraft(emptyWord);
  }, []);

  const selectActivityRecord = useCallback(
    (activity: StoredActivity | null, lists: StoredWordList[]) => {
      setSelectedActivityId(activity?.id || "");
      setActivityDraft(
        activity ? activityToInput(activity) : defaultActivity(lists[0]),
      );
    },
    [],
  );

  const refresh = useCallback(async () => {
    const [nextHealth, nextLists, nextActivities] = await Promise.all([
      apiRequest<HealthWithCounts>("/health"),
      apiRequest<StoredWordList[]>("/api/word-lists"),
      apiRequest<StoredActivity[]>("/api/activities"),
    ]);
    setHealth(nextHealth);
    setWordLists(nextLists);
    setActivities(nextActivities);
    return { lists: nextLists, activities: nextActivities };
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const result = await refresh();
        selectListRecord(result.lists[0] || null);
        selectActivityRecord(null, result.lists);
        setNotice(
          `Backend connected. Loaded ${result.lists.length} word lists and ${result.activities.length} activities.`,
        );
      } catch (error) {
        setNotice(
          error instanceof Error
            ? error.message
            : "The backend could not be loaded.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh, selectActivityRecord, selectListRecord]);

  const runAction = async (action: () => Promise<ActionResult>) => {
    setBusy(true);
    try {
      const result = await action();
      const refreshed = await refresh();
      const requestedListId =
        result.listId === undefined ? selectedListId : result.listId;
      const nextList =
        requestedListId === null
          ? refreshed.lists[0] || null
          : refreshed.lists.find((list) => list.id === requestedListId) ||
            refreshed.lists[0] ||
            null;
      selectListRecord(nextList);

      const requestedActivityId =
        result.activityId === undefined
          ? selectedActivityId
          : result.activityId;
      const nextActivity =
        requestedActivityId === null
          ? null
          : refreshed.activities.find(
              (activity) => activity.id === requestedActivityId,
            ) || null;
      selectActivityRecord(nextActivity, refreshed.lists);
      setNotice(result.message);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "The request could not be completed.",
      );
    } finally {
      setBusy(false);
    }
  };

  const createList = () =>
    runAction(async () => {
      const created = await apiRequest<StoredWordList>("/api/word-lists", {
        method: "POST",
        body: JSON.stringify({
          name: listName || "New phoneme word list",
          description: listDescription,
          words: [],
        }),
      });
      return {
        message: `Created '${created.name}' in the database.`,
        listId: created.id,
      };
    });

  const updateList = () => {
    if (!selectedList) return;
    void runAction(
      async () => {
        const updated = await apiRequest<StoredWordList>(
          `/api/word-lists/${selectedList.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              name: listName,
              description: listDescription,
              words: selectedList.words.map((word) => ({
                id: word.id,
                english: word.english,
                hint: word.hint,
                phonemes: word.phonemes,
              })),
            }),
          },
        );
        return {
          message: `Updated the '${updated.name}' list.`,
          listId: updated.id,
        };
      },
    );
  };

  const deleteList = () => {
    if (!selectedList) return;
    if (!window.confirm(`Delete '${selectedList.name}' and its linked activities?`)) return;
    void runAction(async () => {
      await apiRequest<void>(`/api/word-lists/${selectedList.id}`, { method: "DELETE" });
      return {
        message: "Deleted the word list and its linked activity configurations.",
        listId: null,
        activityId: null,
      };
    });
  };

  const saveWord = () => {
    if (!selectedList) return;
    const endpoint = wordDraft.id
      ? `/api/words/${wordDraft.id}`
      : `/api/word-lists/${selectedList.id}/words`;
    const method = wordDraft.id ? "PUT" : "POST";
    void runAction(
      async () => {
        const saved = await apiRequest<StoredWord>(endpoint, {
          method,
          body: JSON.stringify(wordPayload(wordDraft)),
        });
        return {
          message: `${wordDraft.id ? "Updated" : "Created"} '${saved.english}' with ${saved.phonemes.length} stored phonemes.`,
          listId: selectedList.id,
        };
      },
    );
  };

  const deleteWord = (word: StoredWord) => {
    if (!window.confirm(`Delete '${word.english}' from this list?`)) return;
    void runAction(
      async () => {
        await apiRequest<void>(`/api/words/${word.id}`, { method: "DELETE" });
        return {
          message: `Deleted '${word.english}' from the database.`,
          listId: selectedList?.id || null,
        };
      },
    );
  };

  const setActivityType = (activityType: StoredActivityType) => {
    setActivityDraft((current) => ({
      ...current,
      activityType,
      maxAttempts: activityType === "WORDLE" ? current.maxAttempts || 6 : null,
      gridSize: activityType === "WORD_SEARCH" ? current.gridSize || 10 : null,
      targetWordId:
        activityType === "WORDLE"
          ? current.targetWordId || activityWordList?.words[0]?.id || null
          : null,
    }));
  };

  const saveActivity = () => {
    const endpoint = selectedActivity
      ? `/api/activities/${selectedActivity.id}`
      : "/api/activities";
    const method = selectedActivity ? "PUT" : "POST";
    void runAction(async () => {
      const saved = await apiRequest<StoredActivity>(endpoint, {
        method,
        body: JSON.stringify(activityDraft),
      });
      return {
        message: `${selectedActivity ? "Updated" : "Created"} the '${saved.name}' activity configuration.`,
        listId: activityDraft.wordListId,
        activityId: saved.id,
      };
    });
  };

  const deleteActivity = () => {
    if (!selectedActivity) return;
    if (!window.confirm(`Delete the '${selectedActivity.name}' activity?`)) return;
    void runAction(async () => {
      await apiRequest<void>(`/api/activities/${selectedActivity.id}`, {
        method: "DELETE",
      });
      return {
        message: "Deleted the activity configuration.",
        activityId: null,
      };
    });
  };

  if (loading) {
    return <p className="loading-panel" role="status">Loading the database library...</p>;
  }

  return (
    <div className="library-stack">
      <section className="backend-status" aria-labelledby="backend-status-title">
        <div>
          <p className="eyebrow">Live backend</p>
          <h2 id="backend-status-title">Database connection</h2>
          <p>{health?.database === "connected" ? "SQLite is connected and responding." : "The database is unavailable."}</p>
        </div>
        <dl>
          <div><dt>HTTP</dt><dd>{health?.status === "ok" ? "200 OK" : "Unavailable"}</dd></div>
          <div><dt>Word lists</dt><dd>{health?.wordLists ?? wordLists.length}</dd></div>
          <div><dt>Activities</dt><dd>{health?.activities ?? activities.length}</dd></div>
          <div><dt>Response</dt><dd>{health?.responseTimeMs ?? 0} ms</dd></div>
        </dl>
        <Link className="button button--secondary button--small" href="/health" target="_blank">Open /health JSON</Link>
      </section>

      <section className="library-panel" aria-labelledby="word-lists-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Database CRUD</p>
            <h2 id="word-lists-title">Word lists and phonemes</h2>
          </div>
          <span className="step-badge">{wordLists.length} stored lists</span>
        </div>

        <div className="library-split">
          <aside className="record-selector" aria-label="Stored word lists">
            {wordLists.map((list) => (
              <button
                type="button"
                key={list.id}
                data-active={list.id === selectedListId}
                onClick={() => selectListRecord(list)}
              >
                <strong>{list.name}</strong>
                <span>{list.wordCount} words, {list.activityCount} activities</span>
              </button>
            ))}
            <button
              className="record-selector__new"
              type="button"
              data-active={!selectedListId}
              onClick={() => selectListRecord(null)}
            >
              <strong>+ Create a new list</strong>
              <span>Start an empty reusable data set</span>
            </button>
          </aside>

          <div className="record-editor">
            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>List name</span>
                <input className="text-input" value={listName} maxLength={80} onChange={(event) => setListName(event.target.value)} />
              </label>
              <label className="form-field">
                <span>Database record</span>
                <input className="text-input" value={selectedList?.id || "New record"} readOnly />
              </label>
            </div>
            <label className="form-field form-field--spaced">
              <span>Description</span>
              <textarea className="text-area" value={listDescription} maxLength={400} onChange={(event) => setListDescription(event.target.value)} />
            </label>
            <div className="inline-actions">
              {selectedList ? (
                <>
                  <button className="button button--primary button--small" type="button" disabled={busy} onClick={updateList}>Update list</button>
                  <button className="button button--danger button--small" type="button" disabled={busy} onClick={deleteList}>Delete list</button>
                </>
              ) : (
                <button className="button button--primary button--small" type="button" disabled={busy} onClick={createList}>Create list</button>
              )}
            </div>

            {selectedList ? (
              <div className="word-crud-area">
                <div className="subsection-heading">
                  <div>
                    <h3>Words in {selectedList.name}</h3>
                    <p>Each phoneme is stored as a separate ordered database row.</p>
                  </div>
                  <button className="button button--ghost button--small" type="button" onClick={() => setWordDraft(emptyWord)}>New word</button>
                </div>

                <div className="stored-word-table" role="list" aria-label="Stored words">
                  {selectedList.words.length ? selectedList.words.map((word) => (
                    <article key={word.id} role="listitem">
                      <div>
                        <strong>{word.english}</strong>
                        <span>{word.phonemes.map(formatPhoneme).join(" ")}</span>
                        {word.hint ? <small>{word.hint}</small> : null}
                      </div>
                      <div className="inline-actions">
                        <button className="text-button" type="button" onClick={() => setWordDraft(wordToDraft(word))}>Edit</button>
                        <button className="text-button text-button--danger" type="button" onClick={() => deleteWord(word)}>Delete</button>
                      </div>
                    </article>
                  )) : <p className="empty-state">No words are stored yet. Create one below.</p>}
                </div>

                <div className="word-form-card">
                  <div className="subsection-heading">
                    <div>
                      <h3>{wordDraft.id ? `Edit ${wordDraft.english}` : "Create a word"}</h3>
                      <p>Use the supplied broad HCE symbol palette, including multi-character phonemes.</p>
                    </div>
                    {wordDraft.id ? <button className="text-button" type="button" onClick={() => setWordDraft(emptyWord)}>Cancel edit</button> : null}
                  </div>
                  <div className="form-grid form-grid--two">
                    <label className="form-field">
                      <span>English word</span>
                      <input className="text-input" value={wordDraft.english} maxLength={40} onChange={(event) => setWordDraft((current) => ({ ...current, english: event.target.value }))} />
                    </label>
                    <label className="form-field">
                      <span>Optional hint</span>
                      <input className="text-input" value={wordDraft.hint} maxLength={160} onChange={(event) => setWordDraft((current) => ({ ...current, hint: event.target.value }))} />
                    </label>
                  </div>
                  <div className="sequence-list form-field--spaced" aria-label="Selected phoneme sequence">
                    {wordDraft.phonemes.length ? wordDraft.phonemes.map((phoneme, index) => (
                      <button
                        className="sequence-chip"
                        type="button"
                        key={`${phoneme}-${index}`}
                        title={`Remove ${getPhonemeHint(phoneme)}`}
                        onClick={() => setWordDraft((current) => ({ ...current, phonemes: current.phonemes.filter((_, itemIndex) => itemIndex !== index) }))}
                      >
                        <span>{formatPhoneme(phoneme)}</span><small aria-hidden="true">×</small>
                      </button>
                    )) : <span className="sequence-placeholder">Choose at least one phoneme below.</span>}
                  </div>
                  <PhonemePalette
                    onSelect={(symbol) => setWordDraft((current) => current.phonemes.length >= 8 ? current : ({ ...current, phonemes: [...current.phonemes, symbol] }))}
                    disabled={wordDraft.phonemes.length >= 8}
                  />
                  <div className="inline-actions form-field--spaced">
                    <button className="button button--primary button--small" type="button" disabled={busy} onClick={saveWord}>{wordDraft.id ? "Update word" : "Create word"}</button>
                    <button className="button button--ghost button--small" type="button" onClick={() => setWordDraft((current) => ({ ...current, phonemes: [] }))}>Clear phonemes</button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="library-panel" aria-labelledby="activities-title">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Stored configuration CRUD</p>
            <h2 id="activities-title">Wordle and Word Search activities</h2>
          </div>
          <span className="step-badge">{activities.length} stored activities</span>
        </div>

        <div className="library-split">
          <aside className="record-selector" aria-label="Stored activities">
            {activities.map((activity) => (
              <button
                type="button"
                key={activity.id}
                data-active={activity.id === selectedActivityId}
                onClick={() => selectActivityRecord(activity, wordLists)}
              >
                <strong>{activity.name}</strong>
                <span>{activity.activityType === "WORDLE" ? "Wordle" : "Word Search"} using {activity.wordList.name}</span>
              </button>
            ))}
            <button
              className="record-selector__new"
              type="button"
              data-active={!selectedActivityId}
              onClick={() => selectActivityRecord(null, wordLists)}
            >
              <strong>+ Create an activity</strong>
              <span>Save reusable output settings</span>
            </button>
          </aside>

          <div className="record-editor">
            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>Configuration name</span>
                <input className="text-input" value={activityDraft.name} maxLength={80} onChange={(event) => setActivityDraft((current) => ({ ...current, name: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Activity type</span>
                <select className="select-input" value={activityDraft.activityType} onChange={(event) => setActivityType(event.target.value as StoredActivityType)}>
                  <option value="WORDLE">Phoneme Wordle</option>
                  <option value="WORD_SEARCH">Phoneme Word Search</option>
                </select>
              </label>
            </div>

            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>Stored word list</span>
                <select
                  className="select-input"
                  value={activityDraft.wordListId}
                  onChange={(event) => {
                    const list = wordLists.find((item) => item.id === event.target.value);
                    setActivityDraft((current) => ({
                      ...current,
                      wordListId: event.target.value,
                      targetWordId: current.activityType === "WORDLE" ? list?.words[0]?.id || null : null,
                    }));
                  }}
                >
                  <option value="">Choose a list...</option>
                  {wordLists.map((list) => <option key={list.id} value={list.id}>{list.name} ({list.words.length} words)</option>)}
                </select>
              </label>
              {activityDraft.activityType === "WORDLE" ? (
                <label className="form-field">
                  <span>Target word</span>
                  <select className="select-input" value={activityDraft.targetWordId || ""} onChange={(event) => setActivityDraft((current) => ({ ...current, targetWordId: event.target.value || null }))}>
                    <option value="">Choose a target...</option>
                    {activityWordList?.words.map((word) => <option key={word.id} value={word.id}>{word.english}: {word.phonemes.map(formatPhoneme).join(" ")}</option>)}
                  </select>
                </label>
              ) : (
                <label className="form-field">
                  <span>Grid size</span>
                  <select className="select-input" value={activityDraft.gridSize || 10} onChange={(event) => setActivityDraft((current) => ({ ...current, gridSize: Number(event.target.value) }))}>
                    {[8, 9, 10, 11, 12, 13, 14].map((size) => <option key={size} value={size}>{size} x {size}</option>)}
                  </select>
                </label>
              )}
            </div>

            <div className="form-grid form-grid--three">
              <label className="form-field">
                <span>Difficulty</span>
                <select className="select-input" value={activityDraft.difficulty} onChange={(event) => setActivityDraft((current) => ({ ...current, difficulty: event.target.value as ActivityInput["difficulty"] }))}>
                  <option value="guided">Guided</option>
                  <option value="standard">Standard</option>
                  <option value="challenge">Challenge</option>
                </select>
              </label>
              <label className="form-field">
                <span>Output theme</span>
                <select className="select-input" value={activityDraft.theme} onChange={(event) => setActivityDraft((current) => ({ ...current, theme: event.target.value as ActivityInput["theme"] }))}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
              {activityDraft.activityType === "WORDLE" ? (
                <label className="form-field">
                  <span>Attempts</span>
                  <select className="select-input" value={activityDraft.maxAttempts || 6} onChange={(event) => setActivityDraft((current) => ({ ...current, maxAttempts: Number(event.target.value) }))}>
                    {[4, 5, 6, 7, 8].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              ) : (
                <label className="form-field">
                  <span>Generation seed</span>
                  <input className="text-input" type="number" min={1} max={2147483647} value={activityDraft.seed || 2026} onChange={(event) => setActivityDraft((current) => ({ ...current, seed: Number(event.target.value) }))} />
                </label>
              )}
            </div>

            <label className="switch-row form-field--spaced">
              <span><strong>Show English or spelling hints</strong><small>Store the hint preference with this configuration.</small></span>
              <input type="checkbox" checked={activityDraft.showHints} onChange={(event) => setActivityDraft((current) => ({ ...current, showHints: event.target.checked }))} />
            </label>

            <div className="form-grid form-grid--two form-field--spaced">
              <label className="form-field">
                <span>Output title</span>
                <input className="text-input" value={activityDraft.outputTitle} maxLength={80} onChange={(event) => setActivityDraft((current) => ({ ...current, outputTitle: event.target.value }))} />
              </label>
              <label className="form-field">
                <span>Output file name</span>
                <input className="text-input" value={activityDraft.outputFileName} maxLength={80} onChange={(event) => setActivityDraft((current) => ({ ...current, outputFileName: event.target.value }))} />
              </label>
            </div>

            <div className="inline-actions form-field--spaced">
              <button className="button button--primary button--small" type="button" disabled={busy || !wordLists.length} onClick={saveActivity}>{selectedActivity ? "Update activity" : "Create activity"}</button>
              {selectedActivity ? <button className="button button--danger button--small" type="button" disabled={busy} onClick={deleteActivity}>Delete activity</button> : null}
              {selectedActivity ? <a className="button button--secondary button--small" href={`/api/activities/${selectedActivity.id}/export`}>Download stored HTML</a> : null}
              {selectedActivity ? <Link className="button button--ghost button--small" href={`${selectedActivity.activityType === "WORDLE" ? "/wordle" : "/word-search"}?activity=${selectedActivity.id}`}>Open stored data in builder</Link> : null}
            </div>
          </div>
        </div>
      </section>

      <p className="builder-notice library-notice" role="status" aria-live="polite">{notice}</p>
    </div>
  );
}
