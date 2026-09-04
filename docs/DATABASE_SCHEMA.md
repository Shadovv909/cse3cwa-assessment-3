# Database Schema

## Relationship overview

```text
word_lists 1 ----- many words 1 ----- many phonemes
     |
     +----- many activity_configurations
                         |
                         +----- optional Wordle target word
```

## `word_lists`

Stores named reusable collections.

| Column | Type | Notes |
|---|---|---|
| id | TEXT | UUID primary key |
| name | TEXT | Required teacher-facing name |
| description | TEXT | Optional description stored as an empty string when absent |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

## `words`

Stores one English word and its list relationship.

| Column | Type | Notes |
|---|---|---|
| id | TEXT | UUID primary key |
| word_list_id | TEXT | Foreign key with cascade delete |
| english | TEXT | Case-insensitive within its list |
| hint | TEXT | Optional classroom hint |
| sort_order | INTEGER | Stable list order |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

The pair `(word_list_id, english)` is unique.

## `phonemes`

Stores one complete phoneme symbol per sequence position.

| Column | Type | Notes |
|---|---|---|
| id | TEXT | UUID primary key |
| word_id | TEXT | Foreign key with cascade delete |
| symbol | TEXT | Complete symbol, including multi-character values such as `tʃ` |
| position | INTEGER | Zero-based sequence position |

The pair `(word_id, position)` is unique.

## `activity_configurations`

Stores reusable Wordle and Word Search settings.

| Column | Type | Notes |
|---|---|---|
| id | TEXT | UUID primary key |
| name | TEXT | Teacher-facing configuration name |
| activity_type | TEXT | `WORDLE` or `WORD_SEARCH` |
| difficulty | TEXT | `guided`, `standard` or `challenge` |
| show_hints | INTEGER | Boolean represented by 0 or 1 |
| theme | TEXT | `light` or `dark` |
| max_attempts | INTEGER | Wordle setting, otherwise null |
| grid_size | INTEGER | Word Search setting, otherwise null |
| seed | INTEGER | Reproducible grid generation value |
| output_title | TEXT | Heading embedded in the standalone activity |
| output_file_name | TEXT | Normalised `.html` file name |
| word_list_id | TEXT | Required linked list |
| target_word_id | TEXT | Optional Wordle target |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

## Integrity choices

- Foreign keys are enabled for every connection.
- Word list deletion cascades through dependent data.
- Word deletion cascades to phonemes.
- A deleted Wordle target becomes null so the export route can return a clear conflict message.
- Prepared statements are used for values.
- Transactions protect multi-step list and phoneme writes.
- A migration table records schema version 1.
