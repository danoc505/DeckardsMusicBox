# Dungeon synth, read off scores: where the tune is, and when everyone arrives

The owner asked for scores — "dungeon synth songs notes written out so you
can see how some songs are arranged" — because the records were "like a drone
and chord is the majority of all the songs" and the lead was "barely part of
the song". This document is those scores, measured the same way the program
is measured, and what the program was changed to as a result. Every number is
read off a MIDI file with one parser (`bars sounding` counts a bar in which a
track has a note on or a note held over it), so the scores and the program sit
in one table.

Sources first, then the measurements, then the change and its bill.

---

## 1. The scores

**Autumn Altair, *Echoes on Stone Walls* (Altair Audio Engineering, 2021,
AAE0002).** A dungeon synth album released on a floppy disk as twelve Standard
MIDI files composed on a Roland SC-55mkII — "this floppy disk isn't a 'copy'
or 'edition' of the album. This is the canonical version" (the disk's
NOTES.TXT). Archived at `archive.org/details/echoes-on-stone-walls`,
`FLOPPY/MIDI/01PRCSSN.MID` … `12RISESN.MID`. Track 7 is an arrangement of a
Yasunori Mitsuda piece and is counted with the rest because the arranging is
the author's. These are the genre's own notes, written out, by a practitioner,
and there is nothing else like them that this program could reach:
MuseScore's Summoning transcriptions (Morthond, scores/1201466) and the
Gloomy Erudite and Gilgareth MIDI collections sit behind walls the session
was not to defeat, and the owner can fetch those in a browser and drop them
in `docs/genre-research/scores/` if wanted.

**Burzum, "Dunkelheit" (*Filosofem*, 1996)**, the black metal parent this
genre's guide names, as a BitMidi transcription (`bitmidi.com`, upload 20613):
189 bars at 110 bpm, tracks Guitars, Bass, Drums, Keys.

**The genre's own guide**, already quoted in `DUNGEON-SYNTH-ARRANGEMENT.md`
§3 and in this repository the whole time:

> 1. Introduction (8–16 bars): a single melody or drone quietly emerges.
> 2. **Presentation of the Theme (16–24 bars): pad sounds layer in, and the
>    central theme melody appears.**
> — note.com/soundwitches

The theme is the second thing, in the section after the intro.

---

## 2. What the scores do

`node tools/scores/midimap.mjs <file>` — bars in which each track sounds, first and
last bar, notes per sounding bar, range. The tune is the track the author
named as one (Melody, Theme, Vox, Violin, Stab, Shanai) or the one carrying
the line (the harp and harpsichord tracks, the melodic ostinato of 09).

| score | bars · bpm | the tune | enters (bar, % in) | sounds (% of bars) | drums enter · sound | chords / pad |
|---|---|---|---|---|---|---|
| 01 PRCSSN | 57 · 90 | Harp(sichord) | 1 · 2% | 65% | Timpani 1 · 84% | strings from bar 1, 0.6–1.1 notes/bar, 95% |
| 02 JSTLMB | 42 · 115, 5/4 | Violin | 2 · 5% | 50% | 0 · 100% | ostinato + bass from 0 |
| 03 LIGHT | 23 · 90, 6/4 | Vox | 0 · 0% | 78% | 8 · 17% | organ from 0 |
| 04 TOXASS | 51 · 180, 5/4 | Stab | 3 · 6% | 84% | 7 · 76% | ostinato + bass from 1 |
| 05 GATTAR | 65 · 120 | — (no tune) | — | — | 2 · 66% | four strings from bar 1, ~5 bars a chord, 98% |
| 06 WATNIM | 57 · 80 | Shanai | 1 · 2% | 91% | none | strings + horn from 1 |
| 07 CORRTI | 109 · 112 | Melody | 9 · 8% | 48% | Tabla 9 · 66% | ostinato alone bars 1–8, strings 9 |
| 08 ESCTNT | 98 · 90, 3/4 | Harpsichord 1 | 1 · 1% | 99% | Kick 1 · 95% | harpsichord 2 + bass from 1 |
| 09 DUELAT | 159 · 105, 3/4 | Ostinato (A3–D#5) | 1 · 1% | 85% | none | ostinato alone 1–8, harpsichord 9 |
| 10 TRSLAM | 70 · 80 | Harp | 1 · 1% | 86% | 4 · 94% | strings 3, 0.8 notes/bar, 94% |
| 11 HLDDEF | 61 · 85 | Theme | 1 · 2% | 52% | 1 · 93% | "Half" from 1, 2 notes/bar, 93% |
| 12 RISESN | 57 · 140, 6/4 | Harp | 0 · 0% | 88% | 0 · 91% | one chord, A, the whole piece |
| Dunkelheit | 189 · 110 | Keys | 34 · 18% | 82% | 0 · 83% | guitars from 0, 100% |

Read down the columns:

- **The tune enters by bar 9 in eleven of the twelve pieces that have one**,
  median bar 2, and in the parent (Dunkelheit) at 18% — the one late entry,
  and still earlier than this program's median. Nine of the thirteen open
  WITH the tune among the first parts.
- **It then sounds in a median 82% of the bars** (48–99%). The pieces where
  it is under 55% (02, 07, 11) rest it in a closing section: 07's melody stops
  at bar 72 of 109 and the last third is bass, ostinato, tabla and choir; 11's
  theme stops at 53 of 61. The tune is shed before the end in about half —
  which is what this genre's `shed` order already does.
- **The drums are in by bar 8 in nine of the eleven pieces that have them**
  and sound in a median 84% of the bars. Two pieces have none. (This is the
  second time the scores have said what `DUNGEON-SYNTH-ARRANGEMENT.md` §11
  said: "primarily beatless" is one strand.)
- **Parts arrive every eight bars.** 12 RISESN is the textbook: harp, bass
  and drums at 0, second bass at 8, vox 16, second vox 24, timpani 32,
  bandoneon 47. 07: ostinato 1, everything else 9, choir 53. 06: 1, 9, 17. 03:
  0, 8, 11. 09: 1, 9, 39, 63. Solo openings are eight bars (07, 09) or two
  (10), fourteen to seventeen seconds; the other ten open on three to six
  parts.
- **No chord is held past about five bars.** 05's strings are the stillest
  at ~5.4 bars a chord; 01's change every bar or two; 11's are half notes.
  Two pieces are one chord throughout (12, and 05 nearly).

---

## 3. What the program did, measured the same way

`node tools/scores/leadmap.ts` — the same columns off the program's own events,
sixty seeds, each genre at its own length. "Enters" and "sounds" are the
score table's columns.

| | lead enters (mean / median % in) | lead sounds (% of bars) | drums enter | drums sound | keys enter | keys sound |
|---|---|---|---|---|---|---|
| **the scores** | **4% / 2%** | **76% / 82%** | 2% | 84% | bar 1 | ~95% |
| base, 465a620 | 34% / 35% | 46% / 42% | 32% | 51% | 7% | 82% |
| after the kettles and the held chords, 067147b | **39% / 45%** | **43% / 36%** | 23% | 68% | 28% | 71% |
| **now** | **15% / 17%** | **53% / 48%** | 20% | 65% | 21% | 69% |

The owner heard the middle row. What had happened, traced on seed 2 with
`tools/scores/trace.ts`:

```
seed 2  star keys  enter keys,drone,lead,drums,bass,counter    bars 120
   0 intro        16 bars  energy 0.25       heard keys
   1 verse        32 bars  energy 0.57       heard keys+drone
   2 chorus       32 bars  energy 0.95 PEAK  heard keys+drone+lead+drums+bass+counter
   3 instrumental 32 bars  energy 0.76       heard keys+drone+lead+drums+bass
   4 outro         8 bars  energy 0.34       heard keys+drums+counter
```

Forty-eight bars — 40% of the record — of a pad and a drone, then four parts
at once. Three lines made it, and none of them was the lead's own:

1. **`enter` put the lead fifth.** `["drone","drums","keys","bass","lead",
   "counter"]`, which the guide's second section contradicts and the scores
   contradict by bar number.
2. **Parts arrived one per SECTION** (`arrange.ts`, `arrived + 1`). Right for
   a nine-bar lofi section, wrong for a thirty-two-bar verse: six parts,
   four sections and an intro means the peak — "which has everyone by
   definition" — brings in whoever has not arrived, all at once. EDMProd's
   "drop-off", named in `THE-ARRANGEMENT-AS-STORY.md` §10 as the failure the
   walk-in queue exists to prevent, and the queue was preventing it INSIDE a
   section while the section count re-created it between them.
3. **The held chords had doubled the arrangement's clock, unmeasured.** The
   two-loop rule runs on `periodOf`, the harmonic period. `harmony.bars` went
   from 4 to 8 so an eight-bar chord had room; every section's period went
   from 4 to 8 (290 of 346 sections at 4 → 251 of 251 at 8) and the roster
   could only move every SIXTEEN bars — fifty-five seconds at 70 bpm, longer
   than any gap in the scores but 01's and Dunkelheit's. A sixteen-bar intro
   that had admitted its second part at bar 8 on 24 records of 24 did so on
   3. That change was measured for what it aimed at (chord length) and not
   for this, which is the README's third rule broken in the commit that
   quoted it.

---

## 4. What was changed, and where

Each at the line that owned it.

- **`dungeonsynth.ts` `enter`**: `["drone","lead","drums","keys","bass",
  "counter"]`. The tune second, the march third, the pad fourth — the pad is
  this genre's likeliest character and a character is first whatever the
  list says; otherwise it is the guide's "pad sounds layer in", under the
  theme.
- **`dungeonsynth.ts` `harmony.bars` 8 → 4, `chordBars` `[[2,3],[4,2]]`**.
  Two-bar chords the unmarked case (6–8 s at this tempo, the long end of the
  scores), four bars — the whole idea on one chord, a section that never
  moves — just under half the time. Measured over sixty seeds: 41% of
  sections sit on one chord throughout, against 56% with the weights the
  other way round and two of twelve scores that still. The period is 4 in
  346 sections of 346 again, and the sixteen-bar intro admits its second
  part on 16 records of 24 (the other eight would admit the lead, which does
  not loop and is refused by the intro's own rule).
- **`arrange.ts`, the arrival count**: `arrived` grows by the number of
  two-turn boundaries inside the section, at least one. The queue already
  walked newcomers in one per boundary; now the count keeps that promise.
  Except a record's FIRST section where it opens cold: the queue has no
  section before it to walk anyone in over, so every part named there takes
  the door — counted by boundaries, lofi seed 3 opened on five parts in bar
  one and its ending, floored by what it opened with, could not hold them
  (`arrange.test.ts`, "the record ends carrying what it opened with", 84%).
  A first section admits one, at the door, as it always did.
- **`arrange.ts`, the intro's newcomer**: read off `enter[arrived - 1]`, the
  intro's newest part was whatever `audible` had added under a resting tune
  to keep the opening from silence — so the queue withheld it to the first
  boundary and the silence came back (seed 48, bar 5, `all.test.ts`). It is
  now the part the long-intro rule admitted, or nothing. A latent bug: it
  needed a boundary inside the intro to fire, and the doubled clock had
  removed those.

---

## 5. What it did, on seeds nobody chose

The eight proof seeds (`8660 178 2741 5665 9423 9647 2514 218`), lead only,
before and after — `tools/scores/mapfull.ts`, at the genre's own length:

| seed | lead enters, 067147b → now | lead sounds, 067147b → now |
|---|---|---|
| 8660 | 45% → **7%** | 38% → **57%** |
| 178 | 40% → **13%** | 30% → **43%** |
| 2741 | 36% → **0%** | 50% → **88%** |
| 5665 | 44% → **22%** | 33% → **50%** |
| 9423 | 22% → **0%** | 44% → 40% |
| 9647 | 36% → **7%** | 41% → **45%** |
| 2514 | 43% → **21%** | 36% → **47%** |
| 218 | 38% → **8%** | 42% → **62%** |

(Unchanged by the cold-open rule above: none of the eight opens cold on a
section the rule touches.) Seed 9423 lost share: the tune opens the record, rests through a peak whose
rounds are rests in its plan, and is shed for the thirty-two-bar verse after
it. That is the `shed` order doing what the file says it does, and what 07
and 11 do; it is reported because it went the other way.

Where the rest of the lead's bars go, sixty seeds: once it has entered it
sounds in 61% of the remaining bars. 29% of the sections after its entry
leave it out — the shed order, second to go — and 20% of the bars inside a
section that has it are its plan's rests. The outro is without it in 33 of
60, which is the scores' "about half".

**Still short of the scores**, and why: they enter at 2%, the program at
15%, because `introParts: 1` and an eight-to-sixteen-bar intro is the
guide's own table and the lead does not loop, so it cannot be the part a
long intro admits. Nine of thirteen scores open WITH the tune; the program
opens with it only where it is the character (2 in 15). That is the next
number to argue about, and it is sourced both ways: "a single melody or
drone quietly emerges" against nine scores.

**And the peak still brings three or four at once** in 45 records of 60
(mean largest arrival 3.28 → 3.17). A sixteen-bar section with an eight-bar
turn has one boundary inside it, and "the peak has everyone" is the form's
law. The scores keep layering past their loudest point (12: to 82% of the
piece); this program's peak is an arrival of everybody, and that is a form
question, not an arrangement one.

---

## 6. The bill

- **lofi moved**, because the arrival count is not a genre's. Sixty seeds:
  the lead enters at 29% → 21% and sounds 56% → 61%; the drone 41% → 31%
  and 45% → 51%; the counter 38% → 32%. The largest number of parts
  arriving at one boundary fell 3.02 → 2.92 (3+ at once in 52 → 46
  records). lofi's suite is green; nobody has listened to it. Report it, do
  not hide it.
- **One test is red and is not this change's to fix, and it is not hidden
  either.** `render.test.ts` "the record's own desk is heard" holds that a
  treatment "moves the record without moving how loud it is" — under 0.02
  RMS — on ONE record, dungeon synth seed 2 at 60 s. The arrangement moved,
  that record's desk now carries `darken` at 47 s, and `darken` alone raises
  its level 0.201 → 0.232. Measured on the base commit, before any of this
  session's work, with the rig on and off: `wear` +0.035 to +0.046, `orbit`
  +0.038, `darken` +0.017 to +0.026, `dry` −0.033, on seeds 2, 5 and 9. The
  law has never held on this genre; the test held one seed and that seed
  happened to pass. `darken` is the sum's pole at 0.45× its frequency with
  its mix raised to at least 0.5 (`treat.ts`), and the pole is resonant
  (`rack.pole.resonance`): closing a resonant filter onto a bass-heavy sum
  is a level rise, not only a colour. That is the desk's to fix — at the
  treatment, level-matched — and it is in `HANDOFF.md` as the next thing
  the desk owes, with these numbers.
- **Dungeon synth's chords are shorter than the last commit's**: mean hold
  8.9 s against the 12–16 s and up to 32 s that commit promised. The scores
  say five bars is the ceiling and the owner asked for held, not static;
  measured against the base, they are still four times what they were.
- The `enter` note in `dungeonsynth.ts` that said "THE DRUMS ARE SECOND IN"
  was two commits old and is replaced, not appended to.

## Sources

- Autumn Altair, *Echoes on Stone Walls*, Altair Audio Engineering 2021,
  AAE0002 — `archive.org/details/echoes-on-stone-walls`, `FLOPPY/MIDI/*.MID`,
  `FLOPPY/NOTES.TXT`, `FLOPPY/README.TXT`
- Burzum, "Dunkelheit", MIDI transcription — `bitmidi.com/uploads/20613.mid`
- note.com/soundwitches, "What is Dungeon Synth? A Comprehensive Guide" — the
  four-part table, quoted in full in `DUNGEON-SYNTH-ARRANGEMENT.md` §3
- EDMProd, "drop-off"; Johnston, "Horizontal arrangement"; Max Martin at
  Abbey Road Institute — all as quoted in `THE-ARRANGEMENT-AS-STORY.md` §10
- musictech / musicradar, the two-loop rule — as quoted in `arrange.ts`
