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

Next is milestone 2: the Timaeus reader and its database.

## Running it

Python 3.10 or later, standard library only.

```sh
cd platonic-workshop
python3 tools/fetch_sources.py      # about 630 MB into data/ (not committed), 2 minutes
python3 tools/verify_sources.py     # writes reports/verification.md and .json, under a minute
python3 -m unittest discover -s tests -v
```

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

### About the lemma data

GLAUx's lemmas and parses were assigned by statistical taggers trained on
hand-checked treebanks (about 98.8% accurate for lemmas, 97.2% for parses).
Only Euthyphro, Apology, Crito and Clitophon are hand-checked; the Timaeus is
entirely machine-tagged. The Workshop will label this data as tagged, never
present it as established, and show Morpheus's rule-based list of every
possible parse beside it, so you can always see the alternatives.

### What this environment cannot reach

gutenberg.org, archive.org, wikisource.org, sacred-texts.com, hathitrust.org and
distantreader.org are blocked from the cloud environment, so sources there have
to be uploaded or their domains allowed in the project settings. GitHub works,
which covers Perseus, GLAUx, the lexica, First1KGreek and the GITenberg mirror
of older Project Gutenberg books.

## Layout

```
sources/          what we use and where it comes from (committed)
  manifest.json
  COMMENTARIES.md
  TIMAEUS_PILOT.md
  taylor-1804/    OCR text, kept exactly as received
tools/            fetch, verify, Greek helpers
tests/
reports/          output of verify_sources.py (committed so results are reviewable)
data/raw/         downloaded sources (git-ignored)
```
