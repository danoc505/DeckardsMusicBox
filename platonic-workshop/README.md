# The Platonic Translation Workshop

An interactive exegesis of Plato, for personal use: the Greek text, every word's
dictionary and grammar evidence, the historical translations, and the
commentary tradition, all keyed to Stephanus references so that wherever you
read, everything said about that passage is at hand. No AI: every lookup comes
from a dictionary, a morphological table or a dated edition.

This folder is separate from the music code in the rest of the repository and
shares nothing with it.

## Status

**Milestone 1, sources and setup: done.** The sources are chosen, pinned,
downloaded and checked. See:

- [`sources/manifest.json`](sources/manifest.json): every source, with its repository, pinned commit, licence and provenance.
- [`reports/verification.md`](reports/verification.md): what the checks found, with every figure computed from the files.
- [`sources/COMMENTARIES.md`](sources/COMMENTARIES.md): the commentary survey (clean text, OCR, scan only, or not yet checked).
- [`sources/TIMAEUS_PILOT.md`](sources/TIMAEUS_PILOT.md): the commentaries the pipeline will be proven on.
- [`sources/taylor-1804/`](sources/taylor-1804/): the OCR text of Taylor and Sydenham's 1804 Works of Plato.

**Milestone 2, the Timaeus reader and its database: done.** The Greek
Timaeus with Stephanus navigation, Bury's English beside it, his footnotes as
the first commentary, the references in those footnotes as links, and every
word clickable for its tagged lemma and parse with all the other possible
parses beside it. See [The reader](#the-reader) and [The database](#the-database) below.

**Milestone 3, word lookup: done.** Click a word for its tagged lemma and
parse, plain-English grammar notes quoted from Smyth's *Greek Grammar*, the
sentence role from the treebank guidelines, and its entries in Middle Liddell
and LSJ, with LSJ's abbreviations expanded from LSJ's own lists. See
[The word box](#the-word-box) below.

**Taylor's volume I, imported.** The corrected text of the 1804 Works of
Plato, vol. I, from theosophylib.com: the General Introduction, the
Explanation of Platonic Terms, Olympiodorus' Life of Plato, the First
Alcibiades and the Republic. Every translation segment carries its Stephanus
section, and every footnote and Additional Note (Proclus) is a separate,
linkable record placed at its section. See
[`sources/taylor-1804-vol1-theosophylib/`](sources/taylor-1804-vol1-theosophylib/README.md)
and [`reports/taylor_vol1.md`](reports/taylor_vol1.md).

**Milestone 4, your translations and notes: done.** Select any run of Greek
words, or a whole Stephanus section, and write your translation of it, a
footnote, a note or an alternative rendering, in Markdown. Every version is
kept, nothing is ever written over, and everything exports to Markdown, JSON or
a copy of the database. See [Your translations and notes](#your-translations-and-notes) below.

Next is milestone 5: all of Plato, and each word across the dialogues.

## Running it

Python 3.10 or later, standard library only. Nothing to install.

```sh
cd platonic-workshop
python3 tools/fetch_sources.py      # about 640 MB into data/ (not committed), 2 minutes
python3 tools/build_db.py           # builds data/workshop.sqlite, about 30 seconds
python3 tools/serve.py              # then open http://localhost:8800/
```

Taylor's volume I is already imported into `texts/`. To rebuild it from the saved pages,
run `python3 tools/import_taylor_vol1.py` (seconds). `tools/fetch_theosophylib.py`
downloads the theosophylib.com pages again; it is not needed for the import, which works
from the committed copies.

`tools/verify_sources.py` re-runs milestone 1's checks, and
`python3 -m unittest discover -s tests -v` runs all the tests.

## The reader

![The reader at Timaeus 29e, with a word selected](docs/reader-m2.png)

- **Navigation.** Type a reference (`29e`, or a page, `52`) in the box at the top, use ‹ ›
  or the arrow keys to turn Stephanus pages, or pick a page in the left column. The
  address bar follows you (`http://localhost:8800/#29e`), so a reference can be bookmarked.
- **Text.** Burnet's Greek on the left, Bury's Loeb English (1929) on the right, section
  by section. Words Burnet brackets as spurious keep his square brackets.
- **Words.** Click any Greek word. The green box is GLAUx's single tagged choice of lemma and
  parse, marked *machine*: it was assigned by a statistical tagger and nobody has checked it.
  Under it, every parse the rule-based Morpheus analyser allows for that spelling; the
  one that agrees with the tag is highlighted, so you can see at a glance what else the word
  could be. The word's CTS address is shown for citing. *Mark untagged words* underlines the
  few words GLAUx has no match for.
- **Commentary.** Bury's 192 footnotes, numbered in the English and printed under their section.
  Each says how it was anchored and its proofreading status.
- **Links.** *Points to* lists the passages a note cites; *Cited from* lists the notes elsewhere in
  the Timaeus that cite this passage. Links to other dialogues are shown but not yet followable:
  the rest of Plato arrives in milestone 5.
- **Who is speaking.** The left column lists the speeches, from the speaker markup in the Perseus text.
- **Your work.** Your translations and notes under each section, and the words they are on
  underlined in the Greek. See [below](#your-translations-and-notes).
- **Sources.** The *Sources* link lists every source in the library with its provenance, licence and commit.

Each layer can be switched off at the top; the choice is remembered in the browser.
The server listens on 127.0.0.1 only.

## The word box

![The word box at Timaeus 29a: δημιουργός with Smyth's note on the nominative and LSJ's entry](docs/reader-m3.png)

Click any Greek word. From the top:

- **Tagged** (green, *machine*): GLAUx's lemma and parse, as in milestone 2.
- **Grammar** (*quoted*): the parse said in a line (*verb: 3rd person singular aorist
  indicative passive*), then one line per category Smyth has something to say about. Open a
  line for the rule as Smyth states it (§1923: *The aorist expresses the mere occurrence of an
  action in the past…*), the whole section on request, and a link to it on Perseus. The sentence
  role (SBJ, ATR, AuxY…) opens to the definition in the treebank guidelines GLAUx follows.
  Which Smyth section goes with which category is listed, with the reason for each, in
  [`sources/grammar/smyth-sections.json`](sources/grammar/smyth-sections.json); change a
  line there and rebuild. The words of every note are Smyth's or the guidelines'.
- **Dictionary** (*printed*): Middle Liddell by default, LSJ one click away; the choice is
  remembered. If the chosen dictionary has no entry and the other has, the other is shown and
  the box says so. *Expand abbreviations* (on by default) swaps each abbreviation for LSJ's
  own expansion: *Pl.* → *Plato*, *Ti.* → *Timaeus*, *metaph.* → *metaphorically,
  metaphorical*, *c. gen.* → *cum genitive*. Hover any of them for the other form, and for an
  author LSJ's epithet and date. An abbreviation LSJ's list gives two meanings for (*Ep.*:
  Epic, or Epistula) is never swapped; hover shows both. LSJ's citations of the Timaeus are
  outlined and jump to the passage (1,486 of them in the entries loaded); a cross-reference
  (*v. ἔργον*) opens that entry. *Wide view* opens the entry in a large window.
- **Every possible parse**: as before, but each lemma with an entry is a link to it.

**How a lemma finds its entry.** The lemma and the dictionary key are compared in Beta Code
without homonym numbers or vowel-length marks. If nothing matches, the same letters and
breathing with a different accent are tried, then the bare letters; either is shown with a
warning to check it is the same word (Middle Liddell misprints εἷς as εἵς, for example).
Of the 2,534 lemmas tagged in the Timaeus, 2,470 have an LSJ entry and 2,263 a Middle Liddell
entry. The rest are mostly names and words the dictionaries file under another headword
(πρῶτος under πρότερος in Middle Liddell, ταύτῃ under οὗτος); the box says there is no entry
and links to Logeion. Nothing is guessed and no definition is written.

**How abbreviations are expanded.** LSJ's front matter is read from the Perseus TEI:
List I (1,025 authors, 683 works), Lists II to IV (298 inscription, papyrus and periodical
publications) and List V (506 general abbreviations). Inside a citation the author comes from
List I and the title from that author's works; in running text, the longest run of words
List V explains is marked. Eight single words are explained only inside a printed phrase
(List V has *c. gen. pers. = cum genitivo personae* but no *c.*); they are recorded as such in
the `abbreviation` table. Middle Liddell's own list of abbreviations is not digitised, so in its
entries only grammatical abbreviations and the authors LSJ abbreviates the same way (*Hdt.*,
*Ar.*) are expanded; *Plat.*, *Xen.* and the like are left as printed.

## Your translations and notes

![Writing a translation of Timaeus 29e 1–9, with a footnote on 29e 11–13](docs/reader-m4.png)

- **Choose the words.** Drag across Greek words (a partly selected word counts), or click
  one word and Shift-click the last; a bar offers *Translate*, *Footnote*, *Note* and
  *Alternative*. A span may run across sections. *Write on 29e* under a section takes the
  whole section, and the word box has the same four buttons for the word alone.
- **Write.** The editor opens in the right-hand column with the Greek you chose above it.
  Give the text a name if you like (*literal*, *after Taylor*): several translations of the
  same words are your alternative renderings, told apart by name. Text is Markdown:
  `*italic*`, `**bold**`, `> quotation`, lists, links, and footnotes inside a translation
  (`…the maker[^1] of…` with `[^1]: The note.` on its own line), numbered for you.
  *Preview* shows it as it will appear; Ctrl+Enter saves.
- **On the page.** Under each section, *Your work* lists what starts there, with its span
  (*29e 1–9*: section, then word numbers) and the opening and closing Greek words. Words
  under a translation are underlined; a footnote, note or alternative on words gets a
  letter (a, b, c) after its last word, so it is not confused with Bury's numbered notes.
  Hover an item to light up its words. The *Your work* switch at the top hides all of it.
- **History.** Every save is a new revision; *History* shows them all, and *Bring this
  version back* saves an old one as the newest, leaving the rest in place.
- **Delete** hides an item from the page. It stays, with its history, and *Export* lists
  deleted items with a *Restore* button.
- **Export** (top right): Markdown in Stephanus order, with the Greek of every span and your
  footnotes; JSON with every version and the deleted items; or a copy of `user.sqlite`.
  From the command line: `python3 tools/mywork.py md my-plato.md` (or `json`, `sqlite`).

**How your text is kept safe.**

- It is in `data/user.sqlite`, a separate file from the library. `build_db.py` only ever
  creates its tables if they are missing.
- Nothing is overwritten. Each save adds a row to `revision`; delete only marks the item.
- Two tabs cannot clobber each other: a save names the revision it was edited from, and if
  the text has changed since, the server refuses, shows you the saved version, and keeps
  yours in the editor. *Save mine as the newest version* then saves it on top, and the other
  stays in the history.
- Unsaved typing is kept in the browser as a draft and brought back if the page is closed or
  reloaded; leaving with unsaved text asks first.
- An upgrade of the file's layout (milestone 4 is the first) copies it to `data/backups/`
  first, then only adds columns.
- Anchors keep the Greek words as well as their numbers. If a re-import ever changes the
  text under an anchor, the item says so and shows the words you wrote it on; it is never
  moved or rewritten automatically.
- The server writes only for the reader it serves: it listens on 127.0.0.1, checks the
  Host and Origin of every write, and accepts only JSON, so no other web page can post to it.

**Two choices, each one line to change** in [`tools/mywork.py`](tools/mywork.py):
`SPAN_UNITS = "words"` (any run of words; `"sections"` widens every selection to whole
Stephanus sections) and `DEFAULT_FORMAT = "markdown"` (or `"plain"`). Each item records the
format it was written in, so changing the default leaves earlier work displayed as written.

## The database

Two SQLite files in `data/` (not committed):

| File | What | Written by |
|---|---|---|
| `workshop.sqlite` | The library: everything imported from the sources | `tools/build_db.py`, rebuilt from scratch every time |
| `user.sqlite` | Your translations, notes and every revision of them | You, through the reader (`tools/mywork.py`). A rebuild only creates missing tables |

Your rows point into the library by CTS URN, Stephanus reference and word number within
the section (`urn:cts:greekLit:tlg0059.tlg031`, `29e`, words 1 to 9) and keep the Greek
words themselves, never internal row numbers, so a rebuild cannot orphan them.

The library holds the five layers of the plan, each anchored to a work and a
Stephanus section, and every row names its source:

| Layer | Tables | Timaeus, milestone 2 |
|---|---|---|
| Provenance | `source` | One row per manifest entry, with the commit actually on disk |
| Text | `edition`, `chunk`, `token` | Burnet's Greek and Bury's English, 364 sections each; 23,677 Greek words, each addressed by character position |
| Word evidence | `tag`, `morph` | GLAUx lemma and parse for 23,670 words (99.97%), all machine-tagged; every Morpheus parse for 99.9% of words |
| Structure | `division` | 76 Stephanus pages and 41 speeches. Parts of the argument and skopos: milestone 9 |
| Commentary | `note` | Bury's 192 Loeb notes, anchored to the section they are printed in |
| Links | `link` | 163 references read from those notes by pattern (101 within the Timaeus) |
| Dictionaries | `lexicon`, `lex_entry`, `lemma_entry`, `abbreviation` | 4,000 LSJ and 3,209 Middle Liddell entries: every lemma GLAUx or Morpheus gives for a word of the text, and the entries those cross-refer to; LSJ's lists of abbreviations |
| Grammar | `grammar_note`, `relation_label` | 32 notes from 31 sections of Smyth; 22 sentence-role definitions |

The full schema, with a comment on every column, is [`db/schema.sql`](db/schema.sql)
and [`db/user_schema.sql`](db/user_schema.sql).

**How GLAUx's tags are matched to the words.** GLAUx tokenises the same Perseus text
slightly differently, so its words are lined up with ours section by section. A word is
tagged only when the match is certain: the same letters (`same-form`), or GLAUx writing it
as two words that spell it exactly, as with οὐδέ as οὐ + δέ (`split-word`, 124 words). The
7 words left untagged are the 6 Burnet brackets as spurious, which GLAUx leaves out, and
one οὐδέ at 17b where the two tokenisations do not line up.

**How links are read.** A `<title>` in a note naming a work of Plato, followed by Stephanus
numbers (`Rep. 369 E ff., 374 E ff.`), gives one link per number; a letter on its own carries
the page before it (`Laws 892 A, B`). A bare number and letter between 17 and 92 (`cf. 31 B`)
is a reference within the Timaeus. Titles after another author's name (`Eurip. Ion`) are
skipped. References are recorded as printed, mistakes included: Bury's "Phaedo 244 A" at
71e is surely the Phaedrus, and his misprint "Ref. 416 D" at 18b is not read at all.

## What milestone 1 found

| Layer | Source | Result |
|---|---|---|
| Greek text | Burnet's Oxford text, Perseus TEI | All 36 works of the tetralogies. Timaeus: 364 Stephanus sections, 17a to 92c, no gaps. Across the corpus the only breaks in the Stephanus sequence are the book divisions of the Republic and Laws. |
| English | Perseus (Loeb translators: Fowler, Lamb, Bury, Shorey) | All 36 works, with the same Stephanus sections as the Greek. Their footnotes (184 on the Timaeus) are a first, already-anchored commentary layer. |
| English | Jowett (1892) | Timaeus in hand, with his 40,000-word Introduction and Analysis. |
| English | Taylor and Sydenham (1804) | All five volumes in hand as unproofread OCR. About 9% of words need the long s restored. |
| Lemmas and grammar | GLAUx | Every word of Plato with a lemma, a parse and a Stephanus section. 99.5% of the Timaeus lines up word for word with the Perseus text. |
| Every possible parse | Perseus Morpheus table | Covers 99.6% of the distinct word forms in the Timaeus; about half of them have more than one possible parse. |
| Dictionaries | LSJ; Middle Liddell | Headwords found for 97.5% (LSJ) and 89.3% (Middle Liddell) of the Timaeus lemmas. Most misses are proper names and adverbs that the dictionaries list under another word. |
| Abbreviations (milestone 3) | LSJ front matter, Perseus | Not in the GitHub copy of LSJ; downloaded from Perseus and pinned by SHA-256. |
| Grammar (milestone 3) | Smyth (1920), Perseus; AGDT 2.0 guidelines | Smyth downloaded from Perseus and pinned by SHA-256; the guidelines from Perseus's treebank repository. |

### About the lemma data

GLAUx's lemmas and parses were assigned by statistical taggers trained on
hand-checked treebanks (about 98.8% accurate for lemmas, 97.2% for parses).
Only Euthyphro, Apology, Crito and Clitophon are hand-checked; the Timaeus is
entirely machine-tagged. The Workshop will label this data as tagged, never
present it as established, and show Morpheus's rule-based list of every
possible parse beside it, so you can always see the alternatives. Daniel
approved using GLAUx on 5 November 2026.

### What this environment cannot reach

gutenberg.org, archive.org, wikisource.org, sacred-texts.com, hathitrust.org and
distantreader.org were blocked from the cloud environment used for milestone 1,
so sources there had to be uploaded. The environment used on 5 November 2026
for Taylor's volume I reaches theosophylib.com, gutenberg.org, archive.org,
wikisource.org and sacred-texts.com (hathitrust.org still answers 403). GitHub works,
which covers Perseus, GLAUx, the lexica, First1KGreek and the GITenberg mirror
of older Project Gutenberg books. (Network access was widened for milestone 3, which is how
the Perseus website's downloads became reachable.)

## Layout

```
sources/          what we use and where it comes from (committed)
  manifest.json
  COMMENTARIES.md
  TIMAEUS_PILOT.md
  taylor-1804/    OCR text, kept exactly as received
  taylor-1804-vol1-theosophylib/  corrected HTML of vol. I, kept as received, with provenance
texts/            imported texts, one JSON file per work (committed)
  taylor-1804/vol1/
db/               schema of the library and of your own database
  grammar/        which Smyth section is quoted for which grammatical category
tools/            fetch, verify, import, build the database, serve the reader, Greek helpers,
                  lexicon.py (dictionary entries, LSJ's abbreviations), grammar.py (Smyth, treebank labels),
                  mywork.py (your translations and notes: the only code that writes user.sqlite)
reader/           the reader (HTML, CSS, JavaScript; no libraries); mywork.js is the editor
tests/
docs/             screenshots
reports/          output of verify_sources.py (committed so results are reviewable)
data/raw/         downloaded sources (git-ignored)
data/*.sqlite     the library and your work (git-ignored)
data/backups/     copies of user.sqlite made before an upgrade (git-ignored)
```
