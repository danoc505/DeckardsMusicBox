# SECTION LENGTHS — the one that ran past its ending, `2026-08-17`

---

## 1. THE MEASUREMENT

40 records a genre, every section, by function:

| genre | finding |
|---|---|
| lofi | intro 4, verse 8, chorus 8, bridge 8, instrumental 8, outro 4 — **one length each** |
| synthwave | 8 or 4, per function — **one length each** |
| vgm | **every section is 8 bars.** sd = 0.00 |
| dungeonsynth | intro 4, everything else 16 — **one length each** |
| boxcarsynth | intro 8, verse 16, chorus 8, bridge 16, instrumental 16, outro 8 — **one length each** |

**Across five genres and roughly two thousand sections there was not one
exception.** A boxcar verse was 16 bars 220 times out of 220. Its chorus was 8
bars 119 times out of 119. Nothing breathed.

---

## 2. WHAT REAL MUSIC DOES — and it is not "random lengths"

The term for the device is a **cadential extension**:

> *"the addition of musical material beyond the point at which a cadence is
> expected"* [corpus:Kallstrom, *Phrase and Period Structure*]

and the shape it produces is an **asymmetrical period**:

> *"a period in which the phrases differ in length"* — against **symmetrical**,
> *"a period in which the phrases are the same length"* [same]

### 2a. THE PROPORTION IS SOURCED, NOT PICKED

That sheet catalogues about two dozen periods from real repertoire and marks
their symmetry. **Three are asymmetrical:**

| location | bars | annotation |
|---|---|---|
| p.175 | m.1–10 | asymm, contrasting |
| p.223 | m.1–14 | asymm, parallel, modulating |
| p.243 | m.1–17 | **"repeated consequent and cadential extension"**, asymm |

**Three in about twenty-four — roughly one in seven or eight.** And all three
are 8+2, 8+6 and 16+1: **extensions, not odd lengths.** Symmetry is the rule;
the exception adds to the end.

That is where `chance: 0.14` comes from. It is the repertoire's own proportion,
not a number chosen to feel right.

---

## 3. WHY IT MUST ADD AND NEVER CUT — a constraint specific to this program

A material here is **eight bars**, and since phase 3 the hook lives in bars 0–3
with its development at 4–7.

**Shortening a section to 12 bars would stop the tune in the middle of its own
development** — it would break precisely what the previous phase built.

An extension runs *past* the end, so the extra bars wrap round to the material's
opening: **the hook said once more as a tag.** That is what a cadential
extension sounds like, and it is why the device is the right one here rather
than merely a convenient one.

---

## 4. WHAT IT DOES

`extend: { chance: 0.14, bars: [2, 4], fn: ["verse", "chorus", "instrumental"] }`
on boxcar synth alone.

Two or four bars — a quarter or a half of a material: long enough to hear as an
extra breath, short enough to read as *the section refusing to end* rather than
as a new section.

**Never on the last section** (a record whose final bars are a tag has no
cadence left to extend past), and never on the intro, outro or bridge — the
first two are already the record's bookends and the bridge is the one departure,
where a longer departure is just a longer departure.

### After, 40 records:

| function | lengths that occur |
|---|---|
| verse | 16 bars ×193, **18 ×15, 20 ×12** |
| chorus | 8 bars ×99, **10 ×14, 12 ×6** |
| instrumental | 16 bars ×104, **18 ×8, 20 ×8** |
| bridge / intro / outro | one length — deliberately |

About **12% of eligible sections** run past their ending, against the 14% the
repertoire survey gives.

Guards re-run: `probe_form` (no twins), `probe_journey` 11/11, `probe_arc`.

---

## 5. WHAT THIS DOES *NOT* FIX

Said plainly, because "section lengths vary now" would overclaim:

- The **other four genres are untouched** and still have exactly one length per
  function. That is deliberate — Law 4 — but it is not a general fix.
- **Elision** — *"the cadence point of one phrase becomes the beginning of the
  next phrase (overlap or dovetail)"* [same source] — is not built. Sections
  still abut cleanly.
- The extension currently **repeats the material's opening**. A real cadential
  extension often repeats the *consequent* (as p.243 does). Repeating the tail
  rather than the head is the better version and is not built.

---

## SOURCES

- [Phrase and Period Structure — Michael Kallstrom, WKU](https://people.wku.edu/michael.kallstrom/PHRASE.pdf) — the definitions of asymmetrical period, cadential extension and elision, and the repertoire survey the 1-in-7 proportion comes from
- [Irregular Meters and Phrases — Popgrammar](https://popgrammar.com/irregular-meters-and-phrases/)
- [The Structure of Popular Songs — Sessionville](https://www.sessionville.com/articles/the-structure-of-popular-songs-part1-parts-and-phrases) — *"Simple song structure consists of 4 and 8 bar phrases, 8 or 16 bar sections"*, i.e. regularity is the baseline the exception departs from
- `docs/genre-research/modal-jazz.md` §10 — *"prioritise asymmetry — break the monotony by introducing surprise and unpredictability"* [corpus:learnjazzstandards]

Which functions may extend is [CHOSEN]; the device, its direction and its
frequency are sourced.
