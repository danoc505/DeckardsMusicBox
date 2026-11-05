-- Your own work: data/user.sqlite.
--
-- Kept in a separate file from the imported library so that rebuilding
-- workshop.sqlite never touches it. Rows point into the library by CTS URN,
-- Stephanus reference and word number within the section, and keep the Greek
-- words themselves, never the library's internal row ids, which change on
-- every rebuild.
--
-- Nothing you write is ever overwritten or erased by the Workshop:
--   * every version of every text is kept in `revision`, the first one included;
--   * an edit adds a revision, and is refused if the text changed since you
--     opened it (two tabs), so the other version is never lost;
--   * "delete" only sets deleted_at; the text and its history stay and can be
--     restored;
--   * an upgrade of this schema copies the file to data/backups/ first and only
--     adds columns (tools/mywork.py, migrate()).
--
-- Schema version 2 (milestone 4). Version 1 had the same three tables without
-- the anchor-to-words, format, rev, label and deleted_at columns on
-- translation; tools/mywork.py adds them in place.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS meta (
    key         TEXT PRIMARY KEY,
    value       TEXT
);

-- Where a piece of your work is anchored (both tables below):
--   work_urn    'urn:cts:greekLit:tlg0059.tlg031'
--   start_ref   first Stephanus section, '29e'
--   end_ref     last Stephanus section (the same, for a span inside one section)
--   word_start  token.seq of the first word, within start_ref; NULL = the whole of start_ref
--   word_end    token.seq of the last word, within end_ref;    NULL = the whole of end_ref
--   words       the Greek words of the span as printed, so the anchor can be
--               checked (and found again) after a re-import of the text

-- A translation of a span of Greek: any run of words, or whole sections.
-- Several translations of the same span are alternative renderings; `label`
-- tells them apart ('literal', 'after Taylor' ...).
CREATE TABLE IF NOT EXISTS translation (
    id          INTEGER PRIMARY KEY,
    work_urn    TEXT NOT NULL,
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    word_start  INTEGER,
    word_end    INTEGER,
    words       TEXT,
    label       TEXT,                      -- optional name for this rendering
    format      TEXT NOT NULL DEFAULT 'markdown',  -- markdown | plain: how body is displayed and exported
    body        TEXT NOT NULL,
    rev         INTEGER NOT NULL DEFAULT 1, -- the current revision number; every save adds one
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    deleted_at  TEXT                       -- set by "delete"; the row and its history stay
);

-- A note on a span: footnote, interpretation, or alternative rendering of the words.
CREATE TABLE IF NOT EXISTS user_note (
    id          INTEGER PRIMARY KEY,
    work_urn    TEXT NOT NULL,
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    word_start  INTEGER,
    word_end    INTEGER,
    words       TEXT,
    kind        TEXT NOT NULL DEFAULT 'note',  -- footnote | note | alternative
    label       TEXT,
    format      TEXT NOT NULL DEFAULT 'markdown',
    body        TEXT NOT NULL,
    rev         INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    deleted_at  TEXT
);
CREATE INDEX IF NOT EXISTS user_note_anchor ON user_note(work_urn, start_ref);

-- Every version of a translation or note, the first one included, in order.
-- Rows are only ever added.
CREATE TABLE IF NOT EXISTS revision (
    id          INTEGER PRIMARY KEY,
    table_name  TEXT NOT NULL,             -- translation | user_note
    row_id      INTEGER NOT NULL,
    rev         INTEGER,                   -- 1, 2, 3 ... per row
    event       TEXT,                      -- create | edit | delete | restore
    label       TEXT,
    kind        TEXT,
    body        TEXT NOT NULL,
    saved_at    TEXT NOT NULL
);

INSERT OR IGNORE INTO meta(key, value) VALUES ('schema_version', '2');
