# corpus — growing the database with public-domain music

The engine recombines **relative** material — scale degrees, intervals, durations,
never absolute pitch — so anything ingested transposes into any song and cannot land
out of key. Corpora are embedded in the shipped HTML as `globalThis.X = {…}` literals;
these scripts regenerate those literals in place.

## What feeds what

- `FOLK_CORPUS.melodicShapes` `{r,v,m}` → the **chop** path (a real phrase, rearranged).
- `IMPROV_DIMENSIONS.rhythms {r,role,c}` + `.contours {v,role,c}` → the **across**
  recombination (a rhythm from one source carrying a contour from another). **This is the
  pool the novel method draws on — growing it is the highest-value work.**
- `BACH_CORPUS.voiceLines/.sopranoShapes/.progressions` → melody/bass material + the
  across pool's 4-voice (S/A/T/B) contours.

## Ingested so far

- **`ingest_bach.py`** — J.S. Bach chorales (382, public domain; source
  czhuang/JSB-Chorales-dataset). Detects each chorale's key (Krumhansl-Schmuckler),
  converts every voice to relative `{r,v,m,role}`, and expands both `BACH_CORPUS` and the
  across pool, evenly sampled so Bach enriches without swamping the other sources.
  Validation: the ingested voice-lines measure **76.0% stepwise** vs Bach's known 77.3% —
  proof the key-detection + degree-mapping are right. Idempotent (dedupes on re-run).

      python3 corpus/ingest_bach.py --dry   # measure only
      python3 corpus/ingest_bach.py         # inject into the HTML
      # then: python3 harness/build_engine.py && (cd harness/run && node tests.js)

- **`ingest_jazz.py`** — Jazz Harmony Treebank (1170 standards; EPFL DCMLab). Windows each
  tune's real changes into short progressions, converts to relative `{m,c:[{d,q}],n,ch}`,
  frequency-weights by recurrence, and expands `JAZZ_CORPUS` (600->1361 progressions). Only
  chord PROGRESSIONS are taken (not copyrightable; melodies are protected and were not
  touched); our own relative encoding is stored, not the source file. Validation: 93%
  seventh-chord share, top change = iii-VI-ii-V (a jazz turnaround).

      python3 corpus/ingest_jazz.py --dry / python3 corpus/ingest_jazz.py

- **`ingest_wjazz.py`** — Weimar Jazz Database (456 real recorded solos; SQLite). Takes
  ONLY the beat-wise chord CHANGES (non-copyrightable), not the solo melodies (those are
  transcriptions of copyrighted performances). JAZZ_CORPUS 1361->1674; the top recorded
  change is the blues (I7-IV7), a flavor lead sheets under-represent. See `../docs/LICENSING.md`.

- **`ingest_wjazz_solos.py`** — jazz-solo PHRASING as ABSTRACT dimensions from WJazzD.
  Splits each real jazz phrase into a rhythm and a contour and stores them in SEPARATE
  pools (s="wjazz", role="lead"), so recombination pairs a jazz rhythm with some other
  source's shape and no solo is ever reproduced (the `LICENSING.md` rationale, made literal).
  across pool: rhythms 1300->2308, contours 2200->3647.

- **`ingest_ragtime.py`** — pre-1930 PD ragtime/early-jazz (Joplin d.1917 etc.), the
  syncopated root of jazz. Self-contained MIDI parser (stdlib only) → melody top-line →
  key-detect → de-identified rhythm/contour dims (s="ragtime"). Proven on synthetic MIDI
  (`--selftest`). **Not yet fed:** this sandbox can't reach a bulk PD ragtime source
  (github API gated, codeload proxy-blocked, kern.humdrum.org unreachable, ragtime sites
  HTML-only). Point it at a local folder of PD `.mid` files: `python3 corpus/ingest_ragtime.py <folder>`.

- **`ingest_session.py`** — thesession.org traditional folk (54,878 settings, ODbL; PD
  compositions, our own relative encoding stored). Self-contained ABC parser -> relative
  contours/rhythms + FOLK melodicShapes (s="session"). Widened the CONTOUR pool 3,647 ->
  4,972 (now 5 sources). Validated: 56% stepwise, matching existing folk/bach/wjazz (53-58%).

- **`build_grammar.py`** — the plunderphonics move done cleanly, across ALL THREE dimensions:
  learns an order-2 Markov grammar (with back-off) over every ingested contour, rhythm, and
  chord-progression, and GENERATES new material from the aggregate — no source phrase retained;
  each generated sequence is rejected if it's even a contiguous sub-sequence of any source.
  Adds ~900 contours + ~500 rhythms + ~500 progressions (s="grammar"/_grammar). Deterministic
  and IDEMPOTENT (strips prior grammar and regenerates). The recombination/harmony draw uses
  them like any other entry.

- **`build_structure.py`** — harvests real song FORMS from the 1,170 Jazz Treebank
  standards by detecting which 8-bar sections repeat (AABA, ABAC, AB, AAB-blues...) --
  read off the chord structure like a musician reads a lead sheet. Stores 19 recombinant
  forms (with repetition) as IMPROV_FORMS; the conductor draws one (frequency-weighted,
  ~50%) and repeats the head to full length, so songs get REAL macro structure, not just a
  loop tiled. Only progressions used (non-copyrightable). Idempotent.

## Next (see ../docs/CORPUS_SOURCES.md)

Folk melodic shapes from thesession.org / more ABC trad (pre-1930 PD) → `FOLK_CORPUS`
+ across contours. Then Groove MIDI (CC-BY) for the missing real-drum corpus. Every
source is pre-1930 public domain or an explicit open license; keep a provenance note per
source for attribution.
