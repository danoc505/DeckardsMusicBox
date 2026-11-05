-- The Workshop's imported library: data/workshop.sqlite.
--
-- Rebuilt from the sources by tools/build_db.py; never edited by hand, and
-- never holds your own work (that is data/user.sqlite, see user_schema.sql).
--
-- Five layers, all anchored the same way: a work and a Stephanus section
-- (17a ... 92c), written as a CTS URN urn:cts:greekLit:tlg0059.tlg031:29e.
--   text        edition, chunk, token
--   (tagging)   tag, morph              word-level evidence on the text layer
--   structure   division
--   commentary  note
--   links       link
-- Every row of every layer names the source it came from (source.id), and
-- every derived row says how it was derived (a *_method column).

PRAGMA foreign_keys = ON;

-- Provenance: one row per entry in sources/manifest.json, plus the commit
-- actually checked out (from data/raw/<id>/.fetched.json).
CREATE TABLE source (
    id          TEXT PRIMARY KEY,          -- manifest id, e.g. 'glaux-plato'
    title       TEXT NOT NULL,
    kind        TEXT NOT NULL,             -- git | local
    repo        TEXT,
    commit_sha  TEXT,                      -- pinned commit in the manifest
    fetched_sha TEXT,                      -- commit actually on disk at build time
    path        TEXT,                      -- for local sources
    layer       TEXT,
    language    TEXT,
    licence     TEXT,
    provenance  TEXT NOT NULL,
    status      TEXT
);

CREATE TABLE work (
    id          TEXT PRIMARY KEY,          -- Perseus work id, 'tlg031'
    urn         TEXT NOT NULL UNIQUE,      -- 'urn:cts:greekLit:tlg0059.tlg031'
    title       TEXT NOT NULL,             -- 'Timaeus'
    imported    INTEGER NOT NULL DEFAULT 0 -- 1 if its text is in this database
);

-- Every Stephanus section of an imported work, in reading order.
CREATE TABLE section (
    work_id     TEXT NOT NULL REFERENCES work(id),
    ref         TEXT NOT NULL,             -- '29e'
    page        INTEGER NOT NULL,          -- 29
    letter      TEXT NOT NULL,             -- 'e'
    seq         INTEGER NOT NULL,          -- 0, 1, 2 ... reading order
    urn         TEXT NOT NULL UNIQUE,
    PRIMARY KEY (work_id, ref)
);

-- ------------------------------------------------------------------ text

-- One printed text of a work: Burnet's Greek, Bury's English, later Taylor's.
CREATE TABLE edition (
    id          TEXT PRIMARY KEY,          -- 'tlg031.perseus-grc2'
    work_id     TEXT NOT NULL REFERENCES work(id),
    source_id   TEXT NOT NULL REFERENCES source(id),
    lang        TEXT NOT NULL,             -- grc | eng
    role        TEXT NOT NULL,             -- text | translation
    label       TEXT NOT NULL,             -- 'Burnet (Oxford, 1902)'
    responsible TEXT,                      -- editor or translator
    printed     TEXT,                      -- the printed book it reproduces
    file        TEXT,                      -- file inside the source
    proof_status TEXT NOT NULL             -- see note.proof_status
);

-- A run of text inside one paragraph and one Stephanus section. A paragraph
-- that crosses a section boundary is split into two chunks with the same para.
CREATE TABLE chunk (
    id          INTEGER PRIMARY KEY,
    edition_id  TEXT NOT NULL REFERENCES edition(id),
    work_id     TEXT NOT NULL,
    section_ref TEXT NOT NULL,
    seq         INTEGER NOT NULL,          -- reading order within the edition
    para        INTEGER NOT NULL,          -- paragraph number within the edition
    speaker     TEXT,                      -- from TEI <said who>
    label       TEXT,                      -- printed speaker label, 'ΣΩ.'
    text        TEXT NOT NULL,
    FOREIGN KEY (work_id, section_ref) REFERENCES section(work_id, ref)
);
CREATE INDEX chunk_section ON chunk(work_id, section_ref, edition_id);

-- Greek words in reading order, by character offset into their chunk.
-- Address: <section urn>@<form>[<n>] in CTS subreference style.
CREATE TABLE token (
    id          INTEGER PRIMARY KEY,
    chunk_id    INTEGER NOT NULL REFERENCES chunk(id),
    edition_id  TEXT NOT NULL,
    section_ref TEXT NOT NULL,
    seq         INTEGER NOT NULL,          -- word number within the section, from 1
    start       INTEGER NOT NULL,          -- offset into chunk.text
    end         INTEGER NOT NULL,
    form        TEXT NOT NULL,             -- as printed (NFC)
    plain       TEXT NOT NULL,             -- accentless lower case, for search
    morph_key   TEXT                       -- the Morpheus key it matched, if any (see morph)
);
CREATE INDEX token_section ON token(edition_id, section_ref);
CREATE INDEX token_plain ON token(plain);

-- Tagged evidence for one token. GLAUx's single choice of lemma and parse,
-- assigned by statistical taggers. Always shown labelled as tagged.
CREATE TABLE tag (
    token_id    INTEGER NOT NULL REFERENCES token(id),
    source_id   TEXT NOT NULL REFERENCES source(id),
    part        INTEGER NOT NULL DEFAULT 0,  -- 0, or 0, 1 ... when the source splits the word (οὐ + δέ)
    lemma       TEXT,
    postag      TEXT,                      -- 9-character AGDT tag, 'n-s---fn-'
    relation    TEXT,                      -- dependency relation
    analysis    TEXT,                      -- GLAUx sentence analysis: auto | manual
    source_word_id TEXT,                   -- GLAUx word id
    source_form TEXT,                      -- the form as GLAUx has it
    align_method TEXT NOT NULL,            -- same-form | same-position | split-word (see build_db.py)
    PRIMARY KEY (token_id, source_id, part)
);

-- Every possible parse of a form, from the rule-based Morpheus table.
-- Only forms that occur in the imported texts are copied in.
CREATE TABLE morph (
    beta_key    TEXT NOT NULL,             -- the Morpheus form key that matched
    n           INTEGER NOT NULL,          -- order in the Morpheus line
    lemma_beta  TEXT NOT NULL,
    lemma       TEXT NOT NULL,             -- the same in Greek letters
    gloss       TEXT,                      -- Morpheus's short gloss
    parse       TEXT NOT NULL,             -- 'fem dat sg (attic epic ionic)'
    source_id   TEXT NOT NULL REFERENCES source(id),
    PRIMARY KEY (beta_key, n)
);

-- ------------------------------------------------------------- structure

-- Divisions of a work: pages, speeches, and (from milestone 9) the parts of
-- the argument with the commentator who drew each one.
CREATE TABLE division (
    id          INTEGER PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES work(id),
    kind        TEXT NOT NULL,             -- page | speech | part | skopos
    label       TEXT NOT NULL,
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    parent_id   INTEGER REFERENCES division(id),
    source_id   TEXT NOT NULL REFERENCES source(id),
    basis       TEXT NOT NULL              -- how it was derived, or who said so
);
CREATE INDEX division_work ON division(work_id, kind);

-- ------------------------------------------------------------ commentary

-- One note of one commentator, anchored to a passage and optionally a word.
CREATE TABLE note (
    id          INTEGER PRIMARY KEY,
    source_id   TEXT NOT NULL REFERENCES source(id),
    commentator TEXT NOT NULL,             -- 'Bury (Loeb, 1929)'
    work_id     TEXT NOT NULL,
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    edition_id  TEXT REFERENCES edition(id),  -- the text the note is printed in, if any
    chunk_id    INTEGER REFERENCES chunk(id), -- where its marker stands in that text
    offset      INTEGER,
    lemma_text  TEXT,                      -- words the note quotes, if any
    body        TEXT NOT NULL,             -- plain text
    body_html   TEXT,                      -- with Greek and titles marked up
    printed_at  TEXT,                      -- volume and page in the printed edition
    anchor_method TEXT NOT NULL,           -- containing section | printed reference | alignment | by hand
    proof_status  TEXT NOT NULL,           -- clean source text | OCR as received | cleaned by rule | checked by Daniel
    FOREIGN KEY (work_id, start_ref) REFERENCES section(work_id, ref)
);
CREATE INDEX note_anchor ON note(work_id, start_ref);

-- ----------------------------------------------------------------- links

-- A reference from one passage to another, with the note it was found in.
CREATE TABLE link (
    id          INTEGER PRIMARY KEY,
    from_work   TEXT NOT NULL,
    from_ref    TEXT NOT NULL,
    to_work     TEXT NOT NULL,             -- Perseus work id, may not be imported yet
    to_ref      TEXT NOT NULL,             -- Stephanus '509b', or a page '369'
    kind        TEXT NOT NULL,             -- cf
    note_id     INTEGER REFERENCES note(id),
    source_id   TEXT NOT NULL REFERENCES source(id),
    raw         TEXT NOT NULL,             -- the words in the note it was read from
    method      TEXT NOT NULL              -- pattern | by hand
);
CREATE INDEX link_from ON link(from_work, from_ref);
CREATE INDEX link_to ON link(to_work, to_ref);

-- Build record.
CREATE TABLE build (
    key         TEXT PRIMARY KEY,
    value       TEXT
);
