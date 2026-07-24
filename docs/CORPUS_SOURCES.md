# More music for the corpora — copyright-free sources (licensing-aware)

> **Status:** Bach chorales (382, PD) ingested — see `corpus/ingest_bach.py`. Bach
> voice-lines 700→2200 and across-pool contours 700→2200; validated at 76.0% stepwise
> vs Bach's 77.3%. **Jazz Harmony Treebank** (1170 standards) ingested via
> `corpus/ingest_jazz.py` — progressions 600->1361, cadences 120->238, 93% seventh-chord
> share (chord progressions are non-copyrightable; melodies were NOT taken).
> **Weimar Jazz DB** (456 recorded solos) changes ingested via `corpus/ingest_wjazz.py`
> — JAZZ_CORPUS 1361→1674; top recorded change is the blues (I7-IV7). See `LICENSING.md`
> for why jazz harmony is clean (progressions aren't copyrightable). Next: folk (ABC) + drums.

The engine stores only **relative** material (scale degrees, steps, durations, drum lanes),
so the bar is: (a) can we get *symbolic* data, and (b) is the license clean for a
**shippable** product. Public-domain *compositions* are safe even inside a packaged
dataset; the trap is datasets that are CC-BY *as a file collection* but whose contents are
copyrighted transcriptions of modern songs. Those are flagged **HAZARD** below.

## Do these first (ranked)

| # | Source | License | Feeds | Why first |
|---|---|---|---|---|
| 1 | **Groove MIDI (GMD)** — magenta.tensorflow.org/datasets/groove | **CC-BY 4.0** | **drums / grooves** | Fills the explicit drum gap; 1,150 human takes, 13.6 h, ~3 MiB MIDI, GM lanes + genre/tempo tags. The exact source the handoff names. |
| 2 | **OpenEWLD** — github.com/00sapo/OpenEWLD | **MIT + PD scores** | jazz progressions + melody | Clean PD lead-sheet subset (~500 pre-1920s standards); the safe **Wikifonia replacement**. MusicXML. |
| 3 | **Nottingham (Jukedeck)** — github.com/jukedeck/nottingham-dataset | trad/PD (pkg GPLv3) | folk phrases **+ progressions** | ~1k folk tunes in ABC **with chord annotations** — rare; feeds two corpora in one parse. Store your own relative encoding to avoid redistributing GPL files. |
| 4 | **JSB Chorales / music21 Bach corpus** — github.com/czhuang/JSB-Chorales-dataset, web.mit.edu/music21 | **PD (Bach)** | bach voice-lines | ~380 four-voice chorales → **~10× the current 39**. Biggest lift for the under-fed voice-leading corpus (relevant to the 52%-vs-77% stepwise gap). |
| 5 | **E-GMD** — magenta.withgoogle.com/datasets/e-gmd | **CC-BY 4.0** | drums | Scale drums to 444 h / 43 kits once the GMD pipeline works. |

Runner-up for folk contour variety with a clean license: **Meertens MTC-FS** (Zenodo
3551003, **CC-BY 4.0**, 4,120 songs in kern) — prefer over the license-ambiguous Essen
collection.

## Also good (Tier 2)

- **thesession.org dumps** — github.com/adactio/TheSession-data — **ODbL** (attribution +
  share-alike *on the database*; extracting relative features into our own corpus is fine).
  Tens of thousands of trad settings, huge contour variety.
- **Mutopia** — mutopiaproject.org — **per-item PD / CC-BY / CC-BY-SA** (check each;
  SA carries share-alike). 2,124 pieces, editable LilyPond + MIDI.
- **CPDL / ChoralWiki** — cpdl.org — **per-page** CPDL/CC; filter to PD/CC0/CC-BY editions,
  skip NC / "editor reserves rights". 51k+ choral works, MusicXML/MIDI.

## HAZARD — do NOT ship (research-only / copyrighted underlying content)

- **Wikifonia** archive — shut down in 2013 *because it couldn't license the songs*; the
  floating 34 MB archive is copyrighted. Use OpenEWLD instead.
- **Lakh MIDI (LMD)** — CC-BY as a *collection* but files are user transcriptions of
  copyrighted songs; the author warns individual-file copyright can't be established.
- **POP909** — CC-BY label, but piano arrangements of copyrighted Chinese pop.
- **MAESTRO** — **CC-BY-NC-SA** (non-commercial) and raw performances (no relative-material
  advantage). Skip.
- **EWLD (full)** — access-gated behind a non-commercial statement. Use the OpenEWLD subset.
- **IMSLP / Musopen** — mostly PDF page scans (low symbolic yield) with per-file licenses.
  Only worth OCR/transcription of specific PD works. Deprioritize.
- **abcnotation.com** aggregator — no single license; filter to clearly-PD/trad only.

## Ingestion notes (fits the existing architecture)

- New corpora build the same way as today's: harvest → store **relative** → rebuild with a
  `build_*.js` script, then `build_dimensions.js`. Set `IMPROV_HARVEST` while harvesting so
  the engines don't feed on the corpus and narrow it.
- Drums are the highest-value add and the cleanest license (GMD/E-GMD, CC-BY): slice each
  take to relative drum-lane patterns per bar, keep genre + tempo as tags, characterize by
  properties (syncopation, density, swing) so genre can select grooves on feel — which also
  closes the handoff's "grooves aren't characterized like progressions" gap.
- Keep a **provenance record** per ingested item (source + license + attribution) — needed
  both for CC-BY/ODbL attribution obligations and for the sampling-provenance layer in
  `CODE_REVIEW.md`'s 10× list.

*(Full source list with URLs is in the commit that added this file.)*
