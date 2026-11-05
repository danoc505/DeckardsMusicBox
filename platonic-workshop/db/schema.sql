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

-- ---------------------------------------------------------- dictionaries
--
-- Milestone 3. Entries of Middle Liddell and LSJ for every lemma in the
-- imported texts (GLAUx's tagged lemma and every lemma Morpheus offers), and
-- for the words those entries cross-refer to. The entry is the dictionary's
-- own text; build_db.py only turns Beta Code into Greek letters, marks
-- citations, and wraps each abbreviation in <abbr data-x="expansion"> with
-- the expansion LSJ's own front matter gives (see lexicon.py).

CREATE TABLE lexicon (
    id          TEXT PRIMARY KEY,          -- 'middle-liddell' | 'lsj'
    source_id   TEXT NOT NULL REFERENCES source(id),
    label       TEXT NOT NULL,             -- 'Middle Liddell (1889)'
    printed     TEXT NOT NULL,             -- the printed book
    abbr_note   TEXT NOT NULL              -- how its abbreviations are expanded
);

CREATE TABLE lex_entry (
    id          INTEGER PRIMARY KEY,
    lexicon_id  TEXT NOT NULL REFERENCES lexicon(id),
    src_id      TEXT,                      -- the entry's id in the Perseus file, 'n24394'
    key         TEXT NOT NULL,             -- its key as the file has it, Beta Code 'dhmiourgo/s'
    headword    TEXT NOT NULL,             -- the key in Greek letters, 'δημιουργός'
    match_key   TEXT NOT NULL,             -- key without homonym digits or vowel-length marks
    unaccented_key TEXT NOT NULL,          -- accents dropped, for 'accent-differs' matches
    plain_key   TEXT NOT NULL,             -- letters only, for 'letters-only' matches
    html        TEXT NOT NULL,             -- the entry, as safe HTML
    n_abbr      INTEGER NOT NULL           -- abbreviations marked with an expansion
);
CREATE INDEX lex_entry_match ON lex_entry(match_key);
CREATE INDEX lex_entry_unaccented ON lex_entry(unaccented_key);
CREATE INDEX lex_entry_plain ON lex_entry(plain_key);

-- Which entries belong to which lemma, and how the match was made:
--   same-spelling   the lemma and the headword are the same letters, breathings and accents
--   capital-lowered the same once a capital is lower-cased (LSJ keys some names in lower case)
--   accent-differs  the same letters and breathing, a different accent: shown with a warning
--   letters-only    only the bare letters agree (breathing differs too): shown with a warning
CREATE TABLE lemma_entry (
    lemma       TEXT NOT NULL,             -- as GLAUx or Morpheus spells it
    lexicon_id  TEXT NOT NULL REFERENCES lexicon(id),
    entry_id    INTEGER NOT NULL REFERENCES lex_entry(id),
    method      TEXT NOT NULL,
    PRIMARY KEY (lemma, lexicon_id, entry_id)
);

-- LSJ's own lists of abbreviations, as printed in its front matter.
CREATE TABLE abbreviation (
    id          INTEGER PRIMARY KEY,
    source_id   TEXT NOT NULL REFERENCES source(id),
    list        TEXT NOT NULL,             -- 'I author' | 'I work' | 'II publication' (also III, IV) | 'V general'
    abbr        TEXT NOT NULL,             -- 'Pl.', 'Ti.', 'metaph.'
    author_abbr TEXT,                      -- for works: the author they are listed under
    expansion   TEXT NOT NULL,             -- 'Plato', 'Timaeus', 'metaphorically, metaphorical'
    detail      TEXT,                      -- for authors: epithet and date as printed
    basis       TEXT NOT NULL              -- 'as printed' | 'one word of a printed phrase'
);
CREATE INDEX abbreviation_abbr ON abbreviation(abbr);

-- ------------------------------------------------------------- grammar

-- The section of Smyth's grammar quoted for one grammatical category of a parse.
CREATE TABLE grammar_note (
    category    TEXT NOT NULL,             -- 'tense', as decode_postag names it
    value       TEXT NOT NULL,             -- 'aorist'
    n           INTEGER NOT NULL,          -- order, when there is more than one section
    section     TEXT NOT NULL,             -- Smyth section number, '1923'
    heading     TEXT,                      -- the heading it stands under in Smyth
    rule_html   TEXT NOT NULL,             -- the section up to its first lettered note
    full_html   TEXT NOT NULL,             -- the whole section
    url         TEXT NOT NULL,             -- the section on the Perseus website
    reason      TEXT NOT NULL,             -- why this section (sources/grammar/smyth-sections.json)
    source_id   TEXT NOT NULL REFERENCES source(id),
    PRIMARY KEY (category, value, n)
);

-- Sentence-role labels of the treebank guidelines GLAUx follows.
CREATE TABLE relation_label (
    code        TEXT PRIMARY KEY,          -- 'SBJ', 'AuxY', '_CO'
    name        TEXT,                      -- 'subject', where the guidelines give one
    definition_html TEXT NOT NULL,         -- the guidelines' definition, Smyth references linked
    source_id   TEXT NOT NULL REFERENCES source(id)
);
