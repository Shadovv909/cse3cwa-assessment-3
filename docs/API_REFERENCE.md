# API Reference

All management responses use JSON. Successful resource routes return `{ "data": ... }`. Error responses return an `error` object with a code, message and optional field errors.

## Health

### GET `/health`

Checks the web service and SQLite connection. Returns 200 when the database responds, otherwise 503.

## Word lists

### GET `/api/word-lists`

Returns all lists with their words, phoneme sequences, word count and linked activity count.

### POST `/api/word-lists`

```json
{
  "name": "Three-phoneme practice",
  "description": "A custom classroom list",
  "words": [
    {
      "english": "ship",
      "hint": "A vessel",
      "phonemes": ["ʃ", "ɪ", "p"]
    }
  ]
}
```

### GET `/api/word-lists/:id`

Returns one list and its ordered words.

### PUT `/api/word-lists/:id`

Updates list metadata and optionally synchronises the complete word array. Existing words retain their `id` values.

### DELETE `/api/word-lists/:id`

Deletes the list, its words, phonemes and linked configurations.

## Words

### POST `/api/word-lists/:id/words`

Creates one word in the selected list.

### GET `/api/words/:id`

Returns one stored word and its ordered phoneme sequence.

### PUT `/api/words/:id`

Updates the English word, hint and complete ordered phoneme sequence.

### DELETE `/api/words/:id`

Deletes one word and its phoneme rows.

## Activity configurations

### GET `/api/activities`

Returns all saved configurations. Add `?type=WORDLE` or `?type=WORD_SEARCH` to filter.

### POST `/api/activities`

Wordle example:

```json
{
  "name": "Stored ship Wordle",
  "activityType": "WORDLE",
  "difficulty": "guided",
  "showHints": true,
  "theme": "light",
  "maxAttempts": 6,
  "gridSize": null,
  "seed": 22421357,
  "outputTitle": "Find the word: ship",
  "outputFileName": "stored-ship-wordle.html",
  "wordListId": "WORD_LIST_ID",
  "targetWordId": "WORD_ID"
}
```

### GET, PUT, DELETE `/api/activities/:id`

Reads, replaces or deletes one saved configuration.

### GET `/api/activities/:id/export`

Reads the saved configuration and related words, then returns a downloadable standalone HTML activity.

## Status codes

| Status | Meaning |
|---|---|
| 200 | Successful read, update, export or health check |
| 201 | Resource created |
| 204 | Resource deleted |
| 400 | Invalid JSON or query value |
| 404 | Record not found |
| 409 | Duplicate value or invalid record relationship |
| 422 | Field validation failed |
| 500 | Unexpected server failure |
| 503 | Database health check failed |
