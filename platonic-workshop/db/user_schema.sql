-- Your own work: data/user.sqlite.
--
-- Kept in a separate file from the imported library so that rebuilding
-- workshop.sqlite never touches it. Rows point into the library by CTS URN
-- and Stephanus reference only, never by the library's internal row ids,
-- which change on every rebuild. Milestone 4 adds the editor; the tables are
-- here from day one so the reader already shows this layer.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
    key         TEXT PRIMARY KEY,
    value       TEXT
);

-- A translation of a passage (one or more Stephanus sections).
CREATE TABLE IF NOT EXISTS translation (
    id          INTEGER PRIMARY KEY,
    work_urn    TEXT NOT NULL,             -- 'urn:cts:greekLit:tlg0059.tlg031'
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    body        TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- A note on a passage, or on words in it: footnote, interpretation, alternative rendering.
CREATE TABLE IF NOT EXISTS user_note (
    id          INTEGER PRIMARY KEY,
    work_urn    TEXT NOT NULL,
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    word_start  INTEGER,                   -- token.seq within start_ref, if on words
    word_end    INTEGER,
    words       TEXT,                      -- the Greek words, so the anchor survives a re-import
    kind        TEXT NOT NULL DEFAULT 'note',  -- note | footnote | alternative
    body        TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS user_note_anchor ON user_note(work_urn, start_ref);

-- Every earlier version of a translation or note.
CREATE TABLE IF NOT EXISTS revision (
    id          INTEGER PRIMARY KEY,
    table_name  TEXT NOT NULL,             -- translation | user_note
    row_id      INTEGER NOT NULL,
    body        TEXT NOT NULL,
    saved_at    TEXT NOT NULL
);

INSERT OR IGNORE INTO meta(key, value) VALUES ('schema_version', '1');
