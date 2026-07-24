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

## Next (see ../docs/CORPUS_SOURCES.md)

Folk melodic shapes from thesession.org / more ABC trad (pre-1930 PD) → `FOLK_CORPUS`
+ across contours. Then Groove MIDI (CC-BY) for the missing real-drum corpus. Every
source is pre-1930 public domain or an explicit open license; keep a provenance note per
source for attribution.
