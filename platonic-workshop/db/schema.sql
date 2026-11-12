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
--   commentary  commentary, note
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
    imported    INTEGER NOT NULL DEFAULT 0, -- 1 if its text is in this database
    abbr        TEXT,                      -- LSJ's abbreviation, 'Ti.' (build_db.WORK_ABBR)
    slug        TEXT UNIQUE,               -- for the reader's address bar, 'timaeus'
    tetralogy   INTEGER,                   -- Thrasyllus' tetralogy, 1 to 9 (Perseus order: four works each)
    first_token INTEGER,                   -- token ids of the work's Greek run from first_token to last_token
    last_token  INTEGER,
    n_tokens    INTEGER,
    corpus      TEXT NOT NULL DEFAULT 'plato' -- plato | nt (milestone 23: the Greek New Testament, tools/nt.py) | aristotle (tools/aristotle.py)
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

-- One printed text of a work: Burnet's Greek, Bury's English, Jowett's, Taylor's.
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
    proof_status TEXT NOT NULL,            -- see note.proof_status
    -- Milestone 6: the historical translations.
    translator_note TEXT,                  -- who made the English, and the evidence for it
    align_method TEXT                      -- how its Stephanus sections were found (see chunk.align_method)
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
    -- Milestone 6. For the Greek and the Loeb English these are empty: their
    -- sections are printed in the Perseus TEI. For Jowett and Taylor:
    end_ref     TEXT,                      -- the section the chunk ends in, when it runs on
    align_method TEXT,                     -- printed | printed page, section computed | computed (tools/align.py)
    translator  TEXT,                      -- who made this English (the Banquet is Sydenham's and Taylor's)
    raw         TEXT,                      -- the OCR as received, for text cleaned by rule
    printed_at  TEXT,                      -- volume and page of the printed book, or the ebook
    FOREIGN KEY (work_id, section_ref) REFERENCES section(work_id, ref)
);
CREATE INDEX chunk_section ON chunk(work_id, section_ref, edition_id);
CREATE INDEX chunk_seq ON chunk(edition_id, seq);

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
CREATE INDEX token_form ON token(form);

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
CREATE INDEX tag_lemma ON tag(lemma, token_id);

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

-- Milestone 15: each Greek form shown outside Burnet's text (notes, ancient texts,
-- Taylor), with the Morpheus key it matched, for the meaning of a tapped word (tools/gloss.py).
CREATE TABLE gloss_form (
    form        TEXT PRIMARY KEY,          -- as printed (NFC), without elision mark
    morph_key   TEXT,                      -- the Morpheus key it matched, if any (see morph)
    method      TEXT                       -- same-form | letters-only (printed without accents: shown with a warning)
);

-- ------------------------------------------------------------- structure

-- Divisions of a work: pages, speeches, and (from milestone 9) the parts of
-- the argument with the commentator who drew each one.
CREATE TABLE division (
    id          INTEGER PRIMARY KEY,
    work_id     TEXT NOT NULL REFERENCES work(id),
    kind        TEXT NOT NULL,             -- page | speech | part | skopos | chapter | sidenote | book | letter | ar-chapter (Aristotle's chapters)
    label       TEXT NOT NULL,
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    parent_id   INTEGER REFERENCES division(id),
    source_id   TEXT NOT NULL REFERENCES source(id),
    basis       TEXT NOT NULL,             -- how it was derived, or who said so
    -- Milestone 9 (tools/structure.py): divisions printed by a commentator or translator.
    detail      TEXT,                      -- the summary printed with it (Archer-Hind's chapters)
    printed_at  TEXT,                      -- where it is printed: the OCR or ebook line
    seq         INTEGER,                   -- order among the divisions of its kind and author
    precision   TEXT,                      -- section | page: how closely the printed book places it
    author      TEXT                       -- 'Archer-Hind (1888)', 'Jowett'
);
CREATE INDEX division_work ON division(work_id, kind);

-- ------------------------------------------------------------ commentary

-- Milestone 7. One printed commentary (or introduction) on a work, as read
-- by tools/commentary.py into texts/commentary/<work>/<id>.json.
CREATE TABLE commentary (
    id          TEXT PRIMARY KEY,          -- 'archerhind1888'
    source_id   TEXT NOT NULL REFERENCES source(id),
    work_id     TEXT NOT NULL REFERENCES work(id),
    author      TEXT NOT NULL,
    label       TEXT NOT NULL,             -- 'Archer-Hind (1888)', also note.commentator
    title       TEXT NOT NULL,
    printed     TEXT NOT NULL,             -- the printed book
    kind        TEXT NOT NULL,             -- notes | commentary | introduction
    lang        TEXT NOT NULL,
    proof_status TEXT NOT NULL,
    anchoring   TEXT NOT NULL,             -- how its notes are placed, in a paragraph
    file        TEXT NOT NULL,             -- the JSON it was read from
    stats       TEXT,                      -- JSON: what the reading found
    n_notes     INTEGER
);

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
    -- Milestone 7: the commentaries (tools/commentary_db.py). Empty for the
    -- translators' footnotes of milestones 2 and 6.
    commentary_id TEXT REFERENCES commentary(id),
    note_key    TEXT,                      -- stable id from the commentary's JSON, 'archerhind1888.0042'; your proofreading points here
    kind        TEXT,                      -- note | footnote | introduction (on the whole dialogue)
    seq         INTEGER,                   -- order in the printed commentary
    word_start  INTEGER,                   -- the Greek words the note is on: token.seq in start_ref ...
    word_end_ref TEXT,                     -- ... to token.seq word_end in word_end_ref
    word_end    INTEGER,
    word_method TEXT,                      -- how the words were found
    computed    INTEGER NOT NULL DEFAULT 0, -- 1 if the place is computed rather than printed (shown ≈)
    anchor_detail TEXT,                    -- the evidence for the place, in a sentence
    raw         TEXT,                      -- the OCR as received
    parent_id   INTEGER REFERENCES note(id), -- a footnote's note
    FOREIGN KEY (work_id, start_ref) REFERENCES section(work_id, ref)
);
CREATE INDEX note_anchor ON note(work_id, start_ref);
CREATE UNIQUE INDEX note_key ON note(note_key) WHERE note_key IS NOT NULL;
CREATE INDEX note_commentary ON note(commentary_id, seq);

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
    method      TEXT NOT NULL,             -- pattern (Loeb TEI titles) | pattern, plain text (milestone 8) | by hand
    -- Milestone 8, the citation web (tools/citations.py).
    rule        TEXT,                      -- which reading rule: title and page | page in this dialogue | title read through OCR
    certainty   TEXT NOT NULL DEFAULT 'certain', -- certain | uncertain | unresolved (no such page: kept, not followable)
    doubt       TEXT                       -- why it is not certain, in words
);
CREATE INDEX link_from ON link(from_work, from_ref);
CREATE INDEX link_to ON link(to_work, to_ref);
CREATE INDEX link_note ON link(note_id);

-- ---------------------------------------------------------------- search
--
-- Milestone 5. How often each lemma and each printed form occurs in each
-- work, counted from token and tag at the end of the build, so the word
-- search can give counts for all of Plato at once. `plain` is the same word
-- without accents, breathings or capitals (greek.strip_accents), for searches
-- that ignore them.

CREATE TABLE lemma_count (
    lemma       TEXT NOT NULL,             -- GLAUx's lemma, as tagged
    plain       TEXT NOT NULL,
    work_id     TEXT NOT NULL REFERENCES work(id),
    n           INTEGER NOT NULL,          -- words tagged with this lemma (a split word counts once)
    PRIMARY KEY (lemma, work_id)
);
CREATE INDEX lemma_count_plain ON lemma_count(plain);

CREATE TABLE form_count (
    form        TEXT NOT NULL,             -- token.form
    plain       TEXT NOT NULL,             -- token.plain
    work_id     TEXT NOT NULL REFERENCES work(id),
    n           INTEGER NOT NULL,
    PRIMARY KEY (form, work_id)
);
CREATE INDEX form_count_plain ON form_count(plain);

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


-- ------------------------------------------------------------ milestone 9
-- Each dialogue as a whole, and the corpus as a whole (tools/structure.py).
-- Every row says where it comes from; every quotation is looked for in the
-- text it names and marked found or not (reports/structure.md).

-- The ancient introductions to reading Plato (texts/ancient/, tools/ancient.py).
CREATE TABLE ancient_text (
    id          TEXT PRIMARY KEY,          -- 'dl3-burges'
    title       TEXT NOT NULL,
    author      TEXT NOT NULL,             -- Diogenes Laertius | Albinus | Anonymous
    translator  TEXT,                      -- empty for the Greek
    lang        TEXT NOT NULL,
    printed     TEXT NOT NULL,
    cite        TEXT NOT NULL,             -- 'DL III', 'Anon. Prol.'
    numbering   TEXT NOT NULL,             -- sections | chapters | pages
    source_id   TEXT NOT NULL REFERENCES source(id),
    file        TEXT NOT NULL,
    proof_status TEXT NOT NULL
);
CREATE TABLE ancient_section (
    text_id     TEXT NOT NULL REFERENCES ancient_text(id),
    seq         INTEGER NOT NULL,
    n           TEXT NOT NULL,             -- the section, chapter or page as printed
    pages       TEXT,                      -- the printed page (or pages)
    line        INTEGER,                   -- line in the OCR file
    text        TEXT NOT NULL,
    raw         TEXT,                      -- as received
    number_read TEXT,                      -- the OCR's garbled number, where it was read as the next due
    PRIMARY KEY (text_id, seq)
);

-- A quotation offered as evidence for a claim, and whether it was found.
CREATE TABLE evidence (
    id          INTEGER PRIMARY KEY,
    owner       TEXT NOT NULL,             -- 'order:thrasyllus:0', 'sequence:trial-and-death:2', 'theme:cave:0'
    source_text TEXT NOT NULL,             -- an ancient_text id, or 'plato' (Burnet's Greek)
    work_id     TEXT,                      -- for 'plato'
    at          TEXT,                      -- where it was found: section, chapter, page or Stephanus ref
    quote       TEXT NOT NULL,
    found       INTEGER,                   -- 1 if the words are in that text; empty if that work is not in this build. Found: whitespace, quotes, accents, hyphens normalised
    cited_as    TEXT NOT NULL,             -- 'DL III 56 (Burges, p. 207)'
    note_id     INTEGER REFERENCES note(id) -- source 'note' (milestone 10): the note the words are in
);
CREATE INDEX evidence_owner ON evidence(owner);

-- What someone said of a dialogue as a whole: its persons, scene, frame, skopos.
CREATE TABLE claim (
    id          INTEGER PRIMARY KEY,
    kind        TEXT NOT NULL,             -- persons | scene | frame | skopos
    work_id     TEXT NOT NULL,
    value       TEXT,                      -- persons, scene, frame: as printed
    stance      TEXT,                      -- skopos: accepted | rejected (in the Prolegomena) | stated
    source_id   TEXT NOT NULL REFERENCES source(id),
    cited_as    TEXT NOT NULL,
    quote       TEXT NOT NULL,             -- the words it rests on
    found       INTEGER NOT NULL,
    method      TEXT NOT NULL,             -- as printed | chosen by hand | found by rule: ...
    text_id     TEXT,                      -- an ancient_text, when it is from one
    at          TEXT,                      -- where in it
    note_id     INTEGER REFERENCES note(id) -- the note it is from, when it is from one
);
CREATE INDEX claim_work ON claim(work_id, kind);

-- The ancient orders of reading and classes (sources/structure/orders.json).
CREATE TABLE reading_order (
    id          TEXT PRIMARY KEY,          -- 'thrasyllus'
    label       TEXT NOT NULL,
    by          TEXT NOT NULL,
    cited       TEXT NOT NULL,
    kind        TEXT NOT NULL,             -- groups | sequence | set | classes
    about       TEXT,
    seq         INTEGER NOT NULL
);
CREATE TABLE reading_order_item (
    order_id    TEXT NOT NULL REFERENCES reading_order(id),
    n           INTEGER NOT NULL,
    pos         INTEGER,                   -- place in the order; empty for a set
    grp         TEXT,                      -- 'Tetralogy 1', 'Physics'
    work_id     TEXT,                      -- empty where the source names no one dialogue
    name        TEXT,                      -- as the source names it
    subtitle    TEXT,
    character   TEXT,                      -- Thrasyllus' character of the dialogue
    doubt       TEXT,
    PRIMARY KEY (order_id, n)
);

-- Dramatic sequences: dialogues that continue one another (sources/structure/sequences.json).
CREATE TABLE sequence (
    id          TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    works       TEXT NOT NULL,             -- JSON list of work ids
    seq         INTEGER NOT NULL
);
CREATE TABLE sequence_step (
    sequence_id TEXT NOT NULL REFERENCES sequence(id),
    n           INTEGER NOT NULL,
    work_id     TEXT NOT NULL,
    ref         TEXT NOT NULL,             -- where the dialogue says it
    says        TEXT NOT NULL,             -- what it says, in the Workshop's words; the Greek is in evidence
    PRIMARY KEY (sequence_id, n)
);

-- Recurring myths and images (sources/structure/themes.json).
CREATE TABLE theme_group (
    id          TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    about       TEXT
);
CREATE TABLE theme (
    id          TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    kind        TEXT NOT NULL,             -- myth | image
    group_id    TEXT REFERENCES theme_group(id),
    keywords    TEXT NOT NULL,             -- JSON: the words a note names it by
    seq         INTEGER NOT NULL
);
CREATE TABLE theme_passage (
    theme_id    TEXT NOT NULL REFERENCES theme(id),
    n           INTEGER NOT NULL,
    work_id     TEXT NOT NULL,
    start_ref   TEXT NOT NULL,             -- where it begins: the quotation of Burnet's Greek is there
    end_ref     TEXT NOT NULL,             -- where it ends: chosen by hand
    quote       TEXT NOT NULL,
    found       INTEGER,                   -- empty if the work is not in this build
    PRIMARY KEY (theme_id, n)
);
-- Notes placed inside a passage that name its theme by one of the keywords.
CREATE TABLE theme_named (
    theme_id    TEXT NOT NULL,
    n           INTEGER NOT NULL,          -- theme_passage.n
    note_id     INTEGER NOT NULL REFERENCES note(id),
    word        TEXT NOT NULL              -- the word that names it
);
-- Links of the citation web (milestone 8) from one passage of a theme, or group, to another.
CREATE TABLE theme_link (
    theme_a     TEXT NOT NULL,
    n_a         INTEGER NOT NULL,
    theme_b     TEXT NOT NULL,
    n_b         INTEGER NOT NULL,
    link_id     INTEGER NOT NULL REFERENCES link(id)
);

-- Milestone 10: the concept index (sources/concepts/concepts.json, tools/concepts.py).
-- Every quotation is in evidence, owner 'concept:<id>:<part>:<n>'.
CREATE TABLE concept (
    id          TEXT PRIMARY KEY,          -- 'the-good'
    label       TEXT NOT NULL,
    greek       TEXT NOT NULL,
    layer       TEXT NOT NULL,             -- plato | plato-later | later
    note        TEXT NOT NULL,             -- the index's own sentence on what is gathered here
    keywords    TEXT NOT NULL,             -- JSON {en: [...], grc: [...]}: the words a note names it by
    seq         INTEGER NOT NULL,
    origin      TEXT NOT NULL,             -- JSON: where it was gathered from: index (concepts.json), Definitions, Taylor's terms, later Platonists
    untagged    TEXT                       -- JSON: its Greek words that GLAUx does not tag in Plato (later words)
);
-- The kinds of relation between concepts: the build prompt's seven and those the sources show.
CREATE TABLE concept_category (
    name        TEXT PRIMARY KEY,
    about       TEXT NOT NULL,
    seq         INTEGER NOT NULL
);
-- The GLAUx lemmas a concept is indexed under: lexical evidence, not links.
CREATE TABLE concept_term (
    concept_id  TEXT NOT NULL REFERENCES concept(id),
    n           INTEGER NOT NULL,
    lemma       TEXT NOT NULL,
    note        TEXT,
    broad       INTEGER NOT NULL,          -- 1: most occurrences are the ordinary word
    occurrences INTEGER NOT NULL,          -- words tagged with it in this build
    works       INTEGER NOT NULL,
    PRIMARY KEY (concept_id, n)
);
CREATE INDEX concept_term_lemma ON concept_term(lemma);
-- Definitions and later readings: a quotation (in evidence) and what it says.
CREATE TABLE concept_cite (
    concept_id  TEXT NOT NULL REFERENCES concept(id),
    kind        TEXT NOT NULL,             -- definition | later
    n           INTEGER NOT NULL,
    source_text TEXT NOT NULL,             -- an ancient_text id, 'taylor-terms', 'note'
    says        TEXT NOT NULL,             -- in the index's words
    owner       TEXT NOT NULL,             -- evidence.owner
    note_id     INTEGER REFERENCES note(id)
);
CREATE TABLE concept_passage (
    concept_id  TEXT NOT NULL REFERENCES concept(id),
    n           INTEGER NOT NULL,
    work_id     TEXT NOT NULL,
    start_ref   TEXT NOT NULL,             -- the quotation of Burnet's Greek is here
    end_ref     TEXT NOT NULL,
    quote       TEXT NOT NULL,
    found       INTEGER,
    why         TEXT NOT NULL,
    read_by     INTEGER NOT NULL,          -- 1: a later reading; the note that reads it so is in evidence
    PRIMARY KEY (concept_id, n)
);
CREATE INDEX concept_passage_work ON concept_passage(work_id);
CREATE TABLE concept_relation (
    concept_id  TEXT NOT NULL REFERENCES concept(id),
    n           INTEGER NOT NULL,
    other_id    TEXT NOT NULL REFERENCES concept(id),
    kind        TEXT NOT NULL,             -- 'cause of', 'contrasted with', ...
    why         TEXT NOT NULL,
    owner       TEXT NOT NULL,             -- evidence.owner
    category    TEXT NOT NULL REFERENCES concept_category(name)
);
-- Notes placed on a concept's passage that name it by a keyword (found by rule).
CREATE TABLE concept_named (
    concept_id  TEXT NOT NULL,
    n           INTEGER NOT NULL,          -- concept_passage.n
    note_id     INTEGER NOT NULL REFERENCES note(id),
    word        TEXT NOT NULL
);
-- LSJ's citations of Plato under the concept index's words, read from the LSJ entries of the lexicon
-- tables, with whether LSJ's Greek quotation is in Burnet's text at the place cited (NULL: no quotation).
CREATE TABLE lsj_plato (
    lemma       TEXT NOT NULL,
    n           INTEGER NOT NULL,
    sense       TEXT NOT NULL,             -- LSJ's sense number, as printed ('A', 'II', '2')
    gloss       TEXT NOT NULL,             -- LSJ's English for that sense, as printed
    work_id     TEXT NOT NULL,
    ref         TEXT NOT NULL,
    quote       TEXT,
    found       INTEGER
);
CREATE INDEX lsj_plato_lemma ON lsj_plato(lemma);
-- Words whose renderings are compared across the translators, passage by passage.
CREATE TABLE compared_word (
    lemma       TEXT PRIMARY KEY,
    named       INTEGER NOT NULL,          -- 1: one of the six the build prompt names
    seq         INTEGER NOT NULL
);

-- @reconcile ------------------------------------------- reconciliation
--
-- Milestone 12 (tools/reconcile.py), from sources/reconcile/. Every quotation
-- is a row of `evidence`: owner 'method:<id>' for a method's grounds,
-- 'reconcile:<tension>:documented' for who documents the tension,
-- 'reconcile:<tension>:passage:<n>' for Burnet's Greek and the English of a
-- passage, 'reconcile:<tension>:reading:<n>' for what a reading rests on.

-- An interpretive method: allegorical reading, ontological distinction ...
CREATE TABLE reconcile_method (
    id          TEXT PRIMARY KEY,          -- 'allegorical'
    name        TEXT NOT NULL,
    plain       TEXT NOT NULL,             -- what it is, in plain English (written for the Workshop)
    named       INTEGER NOT NULL,          -- 1: one of the eight the build prompt names
    greek       TEXT,                      -- the Greek term, where the sources have one
    owner       TEXT NOT NULL,             -- evidence.owner of its grounds
    seq         INTEGER NOT NULL
);
-- The concepts a method belongs with: how the worksheet retrieves the methods for a passage.
CREATE TABLE reconcile_method_concept (
    method_id   TEXT NOT NULL REFERENCES reconcile_method(id),
    concept_id  TEXT NOT NULL REFERENCES concept(id),
    PRIMARY KEY (method_id, concept_id)
);
-- A documented tension between passages of Plato.
CREATE TABLE reconcile_tension (
    id          TEXT PRIMARY KEY,          -- 'soul-simple-or-in-parts'
    title       TEXT NOT NULL,
    category    TEXT NOT NULL REFERENCES concept_category(name),
    question    TEXT NOT NULL,             -- the question, in plain English
    nature      TEXT NOT NULL,             -- the nature of the apparent contradiction (editorial)
    owner       TEXT NOT NULL,             -- evidence.owner of the quotations documenting it
    seq         INTEGER NOT NULL
);
CREATE TABLE reconcile_passage (
    tension_id  TEXT NOT NULL REFERENCES reconcile_tension(id),
    n           INTEGER NOT NULL,          -- 0 = side a, 1 = side b, 2... further passages
    side        TEXT NOT NULL,             -- a | b | more
    work_id     TEXT NOT NULL,
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    says        TEXT NOT NULL,             -- what the passage says (editorial summary)
    owner       TEXT NOT NULL,             -- evidence.owner of its Greek and English quotations
    PRIMARY KEY (tension_id, n),
    FOREIGN KEY (work_id, start_ref) REFERENCES section(work_id, ref),
    FOREIGN KEY (work_id, end_ref) REFERENCES section(work_id, ref)
);
-- The Greek words at issue in a passage: dictionary evidence, each tagged there.
CREATE TABLE reconcile_word (
    tension_id  TEXT NOT NULL,
    n           INTEGER NOT NULL,          -- reconcile_passage.n
    lemma       TEXT NOT NULL,
    why         TEXT NOT NULL,
    tagged      INTEGER NOT NULL           -- how many words of the passage GLAUx tags with this lemma
);
CREATE TABLE reconcile_concept (
    tension_id  TEXT NOT NULL REFERENCES reconcile_tension(id),
    concept_id  TEXT NOT NULL REFERENCES concept(id),
    PRIMARY KEY (tension_id, concept_id)
);
-- A way of reconciling a tension, with its method and who holds it.
CREATE TABLE reconcile_reading (
    tension_id  TEXT NOT NULL REFERENCES reconcile_tension(id),
    n           INTEGER NOT NULL,
    method_id   TEXT NOT NULL REFERENCES reconcile_method(id),
    status      TEXT NOT NULL,             -- established (quoted from its holder) | proposed (the Workshop's suggestion)
    by          TEXT NOT NULL,             -- who holds it: 'Proclus', 'Plato himself (Rep. 611b)', 'the Workshop'
    summary     TEXT NOT NULL,
    owner       TEXT NOT NULL,             -- evidence.owner of the words it rests on
    PRIMARY KEY (tension_id, n)
);
-- Notes on one passage of a tension that cite another passage of it (from the citation web, by rule).
CREATE TABLE reconcile_cites (
    tension_id  TEXT NOT NULL,
    from_n      INTEGER NOT NULL,
    to_n        INTEGER NOT NULL,
    note_id     INTEGER NOT NULL REFERENCES note(id),
    PRIMARY KEY (tension_id, from_n, to_n, note_id)
);
-- @end reconcile
-- Passage dossiers (sources/dossiers/*.json, tools/dossiers.py). Each dossier's hand-written
-- claims are kept whole in `data`, each quotation annotated with whether it was found; every
-- quotation is also in evidence, owner 'dossier:<id>:<part>:<n>'. What the reader gathers for the
-- span (the Greek, the translations, the notes, the citation web) is read from the other tables.
CREATE TABLE dossier (
    id          TEXT PRIMARY KEY,          -- 'divided-line'
    label       TEXT NOT NULL,
    greek       TEXT,
    kind        TEXT NOT NULL,             -- image | myth | argument | scene | method | doctrine | saying
    work_id     TEXT NOT NULL REFERENCES work(id),
    start_ref   TEXT NOT NULL,
    end_ref     TEXT NOT NULL,
    grp         TEXT,                      -- a group of dossiers ('the central images of the Republic')
    seq         INTEGER NOT NULL,
    data        TEXT NOT NULL              -- JSON: the dossier as written, with what the build found
);
CREATE INDEX dossier_work ON dossier(work_id);
-- Notes anywhere in the library naming a dossier by one of its keywords (found by rule).
CREATE TABLE dossier_named (
    dossier_id  TEXT NOT NULL REFERENCES dossier(id),
    note_id     INTEGER NOT NULL REFERENCES note(id),
    word        TEXT NOT NULL,
    placed      TEXT NOT NULL              -- on (a note placed on the passage) | elsewhere
);
-- The passage's vocabulary: lemmas found only here in Plato, and lemmas far more frequent here.
CREATE TABLE dossier_vocab (
    dossier_id  TEXT NOT NULL REFERENCES dossier(id),
    lemma       TEXT NOT NULL,
    here        INTEGER NOT NULL,          -- words tagged with it in the passage
    plato       INTEGER NOT NULL,          -- in all of Plato
    works       INTEGER NOT NULL,          -- in how many works
    kind        TEXT NOT NULL              -- 'only here', or how many times its rate in Plato ('35x')
);

-- ------------------------------------------------------------------ milestone 17: key terms in the text
-- Every concept of the index as a term, with sources/terms/terms.json's additions (tools/terms.py).
CREATE TABLE term (
    id          TEXT PRIMARY KEY,          -- the concept's id ('the-good'), or terms.json's ('the-one')
    label       TEXT NOT NULL,
    greek       TEXT NOT NULL,
    concept_id  TEXT REFERENCES concept(id),
    key         INTEGER NOT NULL,          -- 1: underlined in the reader
    plain       TEXT,                      -- a one-line plain meaning, the Workshop's own words
    origin      TEXT NOT NULL,             -- JSON: where it was gathered from (the concept's origins, Neoplatonic vocabulary)
    glossary    TEXT NOT NULL,             -- JSON: the segments of Taylor's Platonic terms that explain it
    related     TEXT NOT NULL,             -- JSON: other terms terms.json names beside it
    extra       TEXT NOT NULL,             -- JSON: terms.json's passages and later readings, each with whether its quotation was found
    seq         INTEGER NOT NULL
);
-- The GLAUx lemmas a term is marked by, and the rule: all | with-article (neuter with the article: τὸ ἕν) | none.
CREATE TABLE term_lemma (
    term_id     TEXT NOT NULL REFERENCES term(id),
    n           INTEGER NOT NULL,
    lemma       TEXT NOT NULL,
    rule        TEXT NOT NULL,
    why         TEXT,
    PRIMARY KEY (term_id, n)
);
CREATE INDEX term_lemma_lemma ON term_lemma(lemma);
-- Taylor's English forms (marked only where the Greek beneath has the term) and fixed phrases (marked
-- anywhere, as printed), each with the quotation that shows the form used.
CREATE TABLE term_form (
    term_id     TEXT NOT NULL REFERENCES term(id),
    kind        TEXT NOT NULL,             -- english | phrase
    n           INTEGER NOT NULL,
    form        TEXT NOT NULL,
    source_text TEXT NOT NULL,             -- taylor-terms, taylor-introduction, a book, translation, plato, note
    quote       TEXT NOT NULL,
    found       INTEGER,                   -- 1: the quotation is in the source, with the form in it; NULL: not checked
    cited_as    TEXT,
    auto        INTEGER NOT NULL,          -- 1: the term's own name, read from the definition the index quotes
    PRIMARY KEY (term_id, kind, n)
);
-- Every word of Plato marked as a term.
CREATE TABLE term_hit (
    term_id     TEXT NOT NULL REFERENCES term(id),
    token_id    INTEGER NOT NULL REFERENCES token(id),
    work_id     TEXT NOT NULL,
    section_ref TEXT NOT NULL,
    form        TEXT NOT NULL,
    PRIMARY KEY (term_id, token_id)
);
CREATE INDEX term_hit_section ON term_hit(work_id, section_ref);
CREATE INDEX term_hit_work ON term_hit(term_id, work_id);

-- ------------------------------------------------------- milestone 23
--
-- The Greek New Testament (tools/nt.py): its 27 books are works of corpus 'nt',
-- in section, edition, chunk, token and tag like Plato's. Its counts and key-term
-- marks are kept here, apart from Plato's, so that every count of Plato stays Plato's.

CREATE TABLE nt_lemma_count (
    lemma       TEXT NOT NULL,             -- MorphGNT's lemma
    plain       TEXT NOT NULL,
    work_id     TEXT NOT NULL REFERENCES work(id),
    n           INTEGER NOT NULL,
    PRIMARY KEY (lemma, work_id)
);
CREATE INDEX nt_lemma_count_plain ON nt_lemma_count(plain);

CREATE TABLE nt_form_count (
    form        TEXT NOT NULL,
    plain       TEXT NOT NULL,
    work_id     TEXT NOT NULL REFERENCES work(id),
    n           INTEGER NOT NULL,
    PRIMARY KEY (form, work_id)
);
CREATE INDEX nt_form_count_plain ON nt_form_count(plain);

CREATE TABLE nt_term_hit (
    term_id     TEXT NOT NULL REFERENCES term(id),
    token_id    INTEGER NOT NULL REFERENCES token(id),
    work_id     TEXT NOT NULL,
    section_ref TEXT NOT NULL,
    form        TEXT NOT NULL,
    PRIMARY KEY (term_id, token_id)
);
CREATE INDEX nt_term_hit_section ON nt_term_hit(work_id, section_ref);
CREATE INDEX nt_term_hit_work ON nt_term_hit(term_id, work_id);

-- ------------------------------------------------------------- Aristotle, milestone A1
-- Aristotle (tools/aristotle.py): works of corpus 'aristotle', in section, edition, chunk, token and tag
-- like Plato's, a Bekker column (980a) for a Stephanus section. Its key-term marks are kept here, apart
-- from Plato's term_hit, so that every count of Plato stays Plato's.
CREATE TABLE ar_term_hit (
    term_id     TEXT NOT NULL REFERENCES term(id),
    token_id    INTEGER NOT NULL REFERENCES token(id),
    work_id     TEXT NOT NULL,
    section_ref TEXT NOT NULL,
    form        TEXT NOT NULL,
    PRIMARY KEY (term_id, token_id)
);
CREATE INDEX ar_term_hit_section ON ar_term_hit(work_id, section_ref);
CREATE INDEX ar_term_hit_work ON ar_term_hit(term_id, work_id);

-- ------------------------------------------------------------- milestone 25
-- The rest of the Neoplatonists in Greek (tools/neoplatonists.py), read whole with their
-- contents: First1KGreek's TEI, and Internet Archive scans shown as the OCR gives them.
-- Kept apart from Plato's tables: nothing built from Plato reads them.

CREATE TABLE neo_text (
    id          TEXT PRIMARY KEY,          -- 'plotinus-enneads'
    seq         INTEGER NOT NULL,          -- the shelf's order
    grp         TEXT NOT NULL,             -- the Library's heading: Plotinus | Proclus | ...
    author      TEXT NOT NULL,
    title       TEXT NOT NULL,
    greek       TEXT,                      -- the title in Greek
    cite        TEXT NOT NULL,             -- 'Enn.', 'in Alc.'
    kind        TEXT NOT NULL,             -- tei | ocr
    source_ids  TEXT NOT NULL,             -- JSON list of manifest ids
    edition     TEXT NOT NULL,             -- the printed edition
    editor      TEXT,
    year        INTEGER,
    licence     TEXT,                      -- as the manifest quotes it
    about       TEXT NOT NULL,             -- the Workshop's one paragraph on the text
    unit_name   TEXT NOT NULL,             -- chapter | section | page
    n_parts     INTEGER NOT NULL,
    n_units     INTEGER NOT NULL,
    words       INTEGER NOT NULL,
    latin_units INTEGER NOT NULL,          -- scanned pages mostly in Latin (folded away)
    proof_status TEXT NOT NULL,
    shelf       TEXT NOT NULL DEFAULT 'neo', -- neo | commentators (Aristotle milestone A5: the Greek commentators on Aristotle)
    on_work     TEXT                       -- a commentary: the work commented on (work.id, or 'isagoge'), where the Workshop has it
);

CREATE TABLE neo_part (                    -- the contents: a treatise, an essay, a book, or ten pages of a scan
    text_id     TEXT NOT NULL REFERENCES neo_text(id),
    seq         INTEGER NOT NULL,
    label       TEXT NOT NULL,
    first_unit  INTEGER NOT NULL,          -- neo_unit.seq
    last_unit   INTEGER NOT NULL,
    n_units     INTEGER NOT NULL,
    words       INTEGER NOT NULL,
    PRIMARY KEY (text_id, seq)
);

CREATE TABLE neo_unit (                    -- a citable unit (TEI) or a scanned page (OCR)
    text_id     TEXT NOT NULL REFERENCES neo_text(id),
    seq         INTEGER NOT NULL,
    part_seq    INTEGER NOT NULL,
    n           TEXT NOT NULL,             -- its address: 'I.6.9' (as cited), or '<source id>:<leaf>' for a scan
    label       TEXT NOT NULL,             -- as shown: 'I.6.9', 'II p. 45', 'image 117'
    page        INTEGER,                   -- a scan's printed page number, where found
    page_how    TEXT,                      -- read | counted | NULL (named by its image)
    lang        TEXT NOT NULL,             -- grc | lat (a scanned page mostly in Latin)
    source_id   TEXT NOT NULL REFERENCES source(id),
    leaf        INTEGER,                   -- a scan's page image, counted from 1
    text        TEXT NOT NULL,             -- as received (a scan: its lines, specks hidden)
    corrected   TEXT,                      -- with the corrections of neo_correction, where any apply
    raw         TEXT,                      -- JSON [[line index, line]]: a scan's lines hidden as specks, so the page as received can be put back
    hidden      INTEGER NOT NULL DEFAULT 0,-- lines hidden as specks
    notes       TEXT,                      -- JSON: the edition's footnotes (apparatus), TEI only
    margin      TEXT,                      -- JSON: marginal notes (folios, older pages), TEI only
    words       INTEGER NOT NULL,
    PRIMARY KEY (text_id, seq)
);

-- Aristotle milestone A5: each page of a commentary linked to the columns of Aristotle it comments on
-- (tools/aristotle_commentators.py link()).
CREATE TABLE ar_comment (
    work_id     TEXT NOT NULL,             -- work.id, or 'isagoge' (Porphyry's Introduction, by Busse's pages)
    col         TEXT NOT NULL,             -- Bekker's page and column, '980a' (the Introduction: neo_unit.n of its page, '1.5')
    text_id     TEXT NOT NULL REFERENCES neo_text(id),
    unit_seq    INTEGER NOT NULL,          -- neo_unit.seq: the page of the commentary
    how         TEXT NOT NULL,             -- printed (the editor's margin) | quoted (runs of its words, ≈)
    what        TEXT NOT NULL,             -- the reference as printed, or how many runs of words
    PRIMARY KEY (work_id, col, text_id, unit_seq)
);
CREATE INDEX ar_comment_unit ON ar_comment (text_id, unit_seq);

CREATE TABLE neo_correction (              -- sources/neoplatonists/corrections.json
    text_id     TEXT NOT NULL REFERENCES neo_text(id),
    unit_n      TEXT,                      -- one unit, or NULL for every unit of the text
    ocr         TEXT NOT NULL,             -- as the OCR prints it
    read        TEXT NOT NULL,             -- as the Workshop reads it
    why         TEXT NOT NULL,
    by          TEXT NOT NULL,
    applied     INTEGER NOT NULL           -- words it changes in the corrected reading
);

-- Milestone 26: Taylor's English of three Neoplatonist texts, each chapter matched to the Greek of milestone 25
-- (tools/taylor_greek.py).
CREATE TABLE taylor_work (
    id          TEXT PRIMARY KEY,          -- 'taylor-plotinus'
    seq         INTEGER NOT NULL,
    author      TEXT NOT NULL,
    title       TEXT NOT NULL,
    edition     TEXT NOT NULL,             -- Taylor's printed edition
    year        INTEGER,
    source_id   TEXT NOT NULL REFERENCES source(id),
    text_how    TEXT NOT NULL,             -- where the English comes from: the OCR of a scan, or a transcription
    greek_text  TEXT NOT NULL REFERENCES neo_text(id),
    unit_name   TEXT NOT NULL,             -- chapter | proposition
    about       TEXT NOT NULL,
    n_parts     INTEGER NOT NULL,
    n_chapters  INTEGER NOT NULL,
    n_matched   INTEGER NOT NULL,          -- chapters with their Greek
    n_paras     INTEGER NOT NULL,
    words       INTEGER NOT NULL
);

CREATE TABLE taylor_part (                 -- a treatise of Plotinus, a section of Iamblichus, ten propositions
    work_id     TEXT NOT NULL REFERENCES taylor_work(id),
    seq         INTEGER NOT NULL,
    label       TEXT NOT NULL,
    greek_label TEXT,                      -- the Greek edition's heading of the same part
    evidence    TEXT,                      -- JSON: Taylor's heading, his list's words, the Greek heading, a note
    first_chapter INTEGER NOT NULL,
    last_chapter  INTEGER NOT NULL,
    PRIMARY KEY (work_id, seq)
);

CREATE TABLE taylor_chapter (              -- one of Taylor's chapters (a proposition of the Elements)
    work_id     TEXT NOT NULL REFERENCES taylor_work(id),
    seq         INTEGER NOT NULL,
    part_seq    INTEGER NOT NULL,
    n           TEXT NOT NULL,             -- the Greek address(es) it translates, comma-separated: '1.2.3', '3.12', or the proposition's number
    label       TEXT NOT NULL,             -- 'I.2.3', '3.12', 'Prop. 30'
    printed     TEXT,                      -- the number as the OCR prints it
    page        INTEGER,                   -- Taylor's page, where read
    text        TEXT NOT NULL,             -- Taylor's paragraphs, blank-line separated
    notes       TEXT,                      -- JSON: Taylor's footnotes
    greek_units TEXT NOT NULL,             -- JSON: neo_unit.seq of the Greek matched (empty: none)
    greek_span  TEXT,                      -- JSON, the Elements: {"from": [unit, line], "to": [unit, line] | null, "placed": bool}
    match_how   TEXT NOT NULL,             -- chapter number | found | machine-matched | not placed | no Greek
    match_note  TEXT,
    checks      TEXT,                      -- JSON: Taylor's Greek quotations in his notes, and where they were found
    words       INTEGER NOT NULL,
    PRIMARY KEY (work_id, seq)
);

-- ------------------------------------------------------------- Aristotle milestone A7
-- Plato and Aristotle together (tools/aristotle_plato.py): the concordance across Aristotle, and the citation web
-- from Aristotle to Plato.
CREATE TABLE ar_lemma_count (              -- as lemma_count, for Aristotle's Greek
    lemma       TEXT NOT NULL,
    plain       TEXT NOT NULL,
    work_id     TEXT NOT NULL REFERENCES work(id),
    n           INTEGER NOT NULL,
    PRIMARY KEY (lemma, work_id)
);
CREATE INDEX ar_lemma_count_plain ON ar_lemma_count(plain);

CREATE TABLE ar_form_count (               -- as form_count, for Aristotle's Greek
    form        TEXT NOT NULL,
    plain       TEXT NOT NULL,
    work_id     TEXT NOT NULL REFERENCES work(id),
    n           INTEGER NOT NULL,
    PRIMARY KEY (form, work_id)
);
CREATE INDEX ar_form_count_plain ON ar_form_count(plain);

CREATE TABLE ar_plato (                    -- a place in Aristotle that names or cites Plato
    from_work   TEXT NOT NULL,             -- an Aristotle work.id
    from_ref    TEXT NOT NULL,             -- its Bekker column
    to_work     TEXT NOT NULL,             -- a dialogue's work.id, or 'plato' (Plato named, no dialogue)
    to_ref      TEXT NOT NULL,             -- a Stephanus section or page, or '' (the dialogue as a whole)
    how         TEXT NOT NULL,             -- named (in Aristotle's Greek) | note (a translator's note on the column)
    raw         TEXT NOT NULL,             -- the words read
    note_id     INTEGER REFERENCES note(id),
    who         TEXT,                      -- the note's translator
    certainty   TEXT NOT NULL,             -- certain | uncertain (tools/citations.py)
    doubt       TEXT
);
CREATE INDEX ar_plato_from ON ar_plato (from_work, from_ref);
CREATE INDEX ar_plato_to ON ar_plato (to_work, to_ref);
