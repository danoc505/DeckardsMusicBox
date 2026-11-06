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
-- Schema version 6 (milestone 24) adds marks on the modern English versions. Version 5 (milestone 12) added reconciliation worksheets. Version 4 (milestone 7) added proofreading. Version 3 (milestone 5) added word_study. Version 2 (milestone 4) had
-- the other tables as they are. Version 1 had them without the
-- anchor-to-words, format, rev, label and deleted_at columns on translation;
-- tools/mywork.py adds them in place.

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

-- A saved word study (milestone 5): a search of all Plato kept with your
-- name for it and your notes on what it shows. The search itself (query, by,
-- works) is kept as you ran it; the counts are worked out again from the
-- library each time it is opened, so they follow a rebuild. The title and the
-- note keep every version in `revision`, like your other texts.
CREATE TABLE IF NOT EXISTS word_study (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    query       TEXT NOT NULL,             -- as typed: 'λόγος', 'lo/gos', 'λογ*'
    by          TEXT NOT NULL,             -- lemma | form | plain (tools/search.py)
    terms       TEXT,                      -- JSON list: only these of the matched lemmas or forms; NULL = all
    works       TEXT,                      -- JSON list of work ids to search in; NULL = all of Plato
    format      TEXT NOT NULL DEFAULT 'markdown',
    body        TEXT NOT NULL DEFAULT '',  -- your note on the study
    rev         INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    deleted_at  TEXT
);

-- Every version of a translation, note or word study, the first one included, in order.
-- Rows are only ever added.
CREATE TABLE IF NOT EXISTS revision (
    id          INTEGER PRIMARY KEY,
    table_name  TEXT NOT NULL,             -- translation | user_note | word_study | reconciliation | user_method
    row_id      INTEGER NOT NULL,
    rev         INTEGER,                   -- 1, 2, 3 ... per row
    event       TEXT,                      -- create | edit | delete | restore
    label       TEXT,
    kind        TEXT,
    body        TEXT NOT NULL,
    saved_at    TEXT NOT NULL
);

-- Your proofreading of the imported commentaries (milestone 7). One row per
-- mark you make, only ever added: the newest row for a note is its status.
-- The imported text in the library is never changed; a correction is kept
-- here and shown in its place, with the text as imported one click away.
CREATE TABLE IF NOT EXISTS proofreading (
    id          INTEGER PRIMARY KEY,
    note_key    TEXT NOT NULL,             -- note.note_key in the library, 'archerhind1888.0042'
    status      TEXT NOT NULL,             -- checked | needs correction
    corrected   TEXT,                      -- your corrected text of the note, if you gave one
    comment     TEXT,
    imported_sha TEXT,                     -- sha256 of the note's text as imported when you marked it
    saved_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS proofreading_key ON proofreading(note_key, id);

-- A reconciliation worksheet (milestone 12): your working-through of passages
-- that seem to disagree, on one of the Workshop's recorded tensions or on any
-- passages you choose. `body` is JSON: passages [{work, start_ref, end_ref}],
-- methods [method id], and the texts contradiction, dictionary, commentary,
-- interpretation, rendering (your reconciled translation), references, and
-- status (working | proposal). Several worksheets on one tension are several
-- readings, to be compared; none is "the" answer. Every version is kept in
-- `revision`, like your other texts.
CREATE TABLE IF NOT EXISTS reconciliation (
    id          INTEGER PRIMARY KEY,
    tension_id  TEXT,                      -- reconcile_tension.id in the library, or NULL for your own
    title       TEXT NOT NULL,
    format      TEXT NOT NULL DEFAULT 'markdown',
    body        TEXT NOT NULL,             -- JSON, as above
    rev         INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    deleted_at  TEXT
);

-- Your own interpretive methods (milestone 12), beside the library's methods
-- database (sources/reconcile/methods.json). `body` is JSON: plain (what the
-- method is), citation (who uses or describes it, and where: required), and
-- concepts [concept id] (the concepts it retrieves for, like the library's).
-- A worksheet names one as 'mine:<id>'.
CREATE TABLE IF NOT EXISTS user_method (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    format      TEXT NOT NULL DEFAULT 'markdown',
    body        TEXT NOT NULL,
    rev         INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    deleted_at  TEXT
);

-- Your marks on the Workshop's modern English versions (milestone 24): a
-- sentence that reads badly or seems wrong, kept for revision. One row per
-- mark you make, only ever added: the newest row for a sentence is its mark,
-- and 'withdrawn' takes a mark back. The sentence is kept as it read when you
-- marked it, so a mark still makes sense after the version is revised.
CREATE TABLE IF NOT EXISTS modern_mark (
    id          INTEGER PRIMARY KEY,
    text_id     TEXT NOT NULL,             -- 'general-introduction', 'olympiodorus-life'
    para        TEXT NOT NULL,             -- Taylor's paragraph: 'taylor1804.general-introduction.text.p0042'
    sentence    TEXT NOT NULL,             -- the sentence, as it read when you marked it
    kind        TEXT NOT NULL,             -- reads badly | seems wrong | withdrawn
    comment     TEXT,
    saved_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS modern_mark_text ON modern_mark(text_id, para, id);

INSERT OR IGNORE INTO meta(key, value) VALUES ('schema_version', '6');
