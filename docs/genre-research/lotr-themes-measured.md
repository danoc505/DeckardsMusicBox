# THE LORD OF THE RINGS THEMES, READ OFF THE NOTATION

*2026-08-10. The owner, after three genres had been built without this:
"were you able to read LOTR scores or not?" — No. Then: "I feel like you need to
study those scores and score writing in general because if you had done this we
would not be here."*

*Both correct. The earlier score study died on a session limit with
`themesWithContent: 0` — all nine theme-reader agents failed and only the source
hunters survived. Those hunters found ABC-notation transcriptions, which are
PLAIN TEXT WITH NOTE LETTERS IN THEM, and I never opened the files. This sheet is
what was in them.*

---

## §0 WHAT THIS SHEET IS AND IS NOT

**Is:** four Howard Shore themes as actual pitches, meters, tempos and keys,
transcribed into ABC by hobbyists and mirrored at `trillian.mit.edu`.

**Is not:** the published score. These are TRANSCRIPTIONS — a good one is
faithful to pitch and meter and is not authoritative about orchestration,
voicing or the inner parts. Every degree below is my arithmetic on the
transcription's own note letters, which is checkable; nothing here is my ear.

Sources, all fetched:
- `trillian.mit.edu/~jc/music/abc/demo/Tunes/Shire.abc`
- `trillian.mit.edu/~jc/music/abc/demo/Tunes/Rohan.abc`
- `.../mirror/community.codemasters.com/forum/ConcerningHobbitsFullVersion.abc`
- `.../mirror/community.codemasters.com/forum/RingGoesSouth.abc`

---

## §1 THE SHIRE THEME — and it is MAJOR, and it is in THREE

> **⚠ THIS SECTION IS WRONG. 2026-08-11.** `Shire.abc` is a bad transcription,
> and the research that found it said so in the same breath — *"I could NOT
> reconcile this melody with the four other independent Concerning Hobbits/Shire
> transcriptions I extracted (which all agree on 1-2-3-5-3-2-1). Treat this
> file's accuracy as doubtful despite its Howard Shore credit line."* I read the
> ABC and not the caveat next to it.
>
> Four sources agree against it, three of them official: the theme is **D major,
> 4/4, ♩=90–105, degrees 1 2 3 3 5 5 3 3 2 1, MAJOR PENTATONIC (no 4th, no 7th),
> over a relative-minor bass (Bm–D–G–Em)**. See `score-craft.md` §1 for the
> table and the sources. §2–§4 below are unaffected.



```
M:3/4   L:1/4   Q:1/4=90   K:Cmaj
E F G | A G A | B2 B | B2 c | d2 d | c2 B | A2 A | G F E |
```

**Scale degrees in C** (octave marked where it passes the tonic):

| bar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| notes | E F G | A G A | B – B | B – c | d – d | c – B | A – A | G F E |
| degrees | **3 4 5** | **6 5 6** | **7 7** | **7 1̂** | **2̂ 2̂** | **1̂ 7** | **6 6** | **5 4 3** |

Four facts a genre table can use, and three of them contradict what I built:

1. **IT IS IONIAN.** C major, no accidentals in the whole strain. Hobbit synth
   was written dorian-led with minor behind it. The most on-brief theme in the
   trilogy for a genre called *hobbit* has no minor in it at all.
2. **IT IS IN 3/4.** Not 4/4. The whole program assumes a sixteen-step bar.
3. **90 BPM**, against the 102–124 I drew from walking-cadence research.
4. **IT MOVES BY STEP.** Every interval in the strain is a second or a third —
   the largest leap is E→G and A→c, both thirds. The contour is a single ARCH:
   starts on 3, climbs to 2̂ (the ninth) at bar 5, and walks back down to 3.
   It begins and ends on the SAME NOTE, and that note is not the tonic.

The second strain is a rising sequence, and it is the same shape transposed:

```
G3 | G3 | A3 | A3 | B2c | B2c | A2B | c3 |
d3 | d3 | e3 | e3 | f2g | f2g | e2f | g3 |
```
Bars 9–16 are 5 5 6 6 7-1̂ 7-1̂ 6-7 1̂; bars 17–24 are **the identical figure a
fifth higher** (2̂ 2̂ 3 3 4-5 4-5 3-4 5). A sequence, exactly repeated at a new
pitch level — the cheapest and most effective development there is, and the
program has no mechanism for it.

## §2 CONCERNING HOBBITS — the same theme, dressed

```
M:4/4   L:1/8   Q:1/4=118   K:G
d/e/(f f)(a a) f3/2 e/ f/e/ | d4 z f2 a | b3 c' c'3 a | f3 g/f/ e3 d/e/ |
```

**4/4 at 118**, G major. Note what the notated version carries that the simple
one does not: `^c` (a raised fourth), `^f`, `^g`, `^a`, `=a` — chromatic
inflections against a diatonic tune. The melody is diatonic; the COLOUR is not.

**And it contains its own accompaniment, written out.** Bars 26–33:

```
DA, FA, FA DA | CA, EA, EA EA | DB, FB, FF DF | B,G, DG, CA, EC |
```

That is a two-note alternating figure — a low note and a note above it, over and
over, changing on the harmony. This is Adams' "Hobbit Skip Beat" / "Two-Step
Figure" as actual pitches rather than as a name. **It is the walking
accompaniment**, and it is the thing an overworld genre most needs and this
program generates nothing like: a fixed two-element rhythmic cell whose PITCHES
track the chord while its SHAPE does not change.

## §3 ROHAN — 6/8, and it is a JIG

```
R:jig   M:6/8   L:1/8   K:Amaj
A E c | B E B | B c c | A c e | c d d | e c A | E2 d | d c B |
```

**A major. Compound meter.** The travelling meter the overworld research
suspected and could not source is sourced here.

And its intervals are the OPPOSITE of the Shire's: `A E c` is down a fourth then
up a sixth; `A c e` is a triad outlined. Rohan LEAPS where the Shire STEPS. Two
themes, one register, one key family, told apart by interval size alone — which
is a rule a generator can hold.

## §4 THE RING GOES SOUTH — the travelling cue

```
M:4/4   L:1/8   Q:1/4=118   K:C
E/B/e/g/ ^f4 | B,2 d4 | e6 | A6 | E/B/e/g/ ^f4 | ^C2 G4 | A2 G2 A2 | _B2 G4 |
```

**118 BPM.** Very long notes — `e6`, `A6`, `f4` — against fast four-note pickups.
`^f`, `^C`, `_B` are chromatic against K:C. This is the cue where the Fellowship
walks, and its melodic rhythm is **slow notes with quick approaches**, not an
even stream.

Then, from bar 17, the walking engine:

```
A2A,2 E2A,A | G2G,2 C2G,G | A2A,2 E2A,2 | z2 A,2 E2 de |
```

`A2 A,2` is the note and the same note an octave below, alternating. **An octave
oscillation on the beat, under the tune, changing with the harmony.** Same device
as §2, one interval wider.

---

## §5 WHAT THIS SAYS ABOUT THE PROGRAM

Written as findings, not as a plan, because the plan is the owner's call.

1. **~~Hobbit synth is in the wrong mode. The source material is Ionian.~~**
   **CORRECTED BY THE OWNER, IMMEDIATELY AND RIGHTLY:** *"dont be that stupid to
   think we want ONE scale. That is not only insane it goes against the programs
   rules. Constraints NOT baked in values."*

   Four themes is a sample, not a setting. What §1–§4 actually establish is that
   **Shore uses a MODE PALETTE and assigns it by culture** — the Shire and Rohan
   are diatonic-major-family, and the same score carries Adams' "Rohan-esque
   Dorian modes", Mordor's chromatic writing, Moria's bare rising fifths and
   Lothlórien's "adapted Maqam Hijaz". A score that had one scale would be the
   thing nobody wants.

   So the finding is about **WEIGHTS AND SPREAD, not a value**: the corpus says
   the bright end of the palette is REAL and reachable, where hobbit synth's
   table currently makes it nearly unreachable (dorian 6, minor 5, mixolydian 3,
   phrygian 1 — and no ionian at all). The correction is to open the draw, not to
   pin it somewhere else. Whether the mode should also be able to differ BY
   SECTION, the way Shore differs it by culture, is a mechanism question this
   program has not answered and is the more interesting half.

   **AND IT IS THE SAME MISTAKE AS THE DRONE.** Cohen's "slow harmonic pace"
   became one chord; "virtuosity is not density" became one note; now one
   transcription in C major nearly became one scale. Three times, one habit:
   reading a measurement as an instruction.
2. **Two of the four are not in 4/4.** The Shire is 3/4 and Rohan is 6/8. The
   program's grid is sixteen steps to a bar — a four-beat assumption baked so
   deep that "the meter is 3" is not currently expressible.
3. **The accompaniment figure is a real, writable object** — two alternating
   pitches, fixed shape, harmony-tracking — and appears in both §2 and §4 at
   different intervals. The program's `ostinato` is close but draws a cell of
   scale degrees rather than a shape plus an interval.
4. **Development is by SEQUENCE.** The Shire's second strain is its first
   transposed a fifth, note for note. Nothing in this program transposes a
   phrase and restates it.
5. **Melody type is an interval budget.** Shire = steps and thirds. Rohan =
   fourths, fifths, sixths, outlined triads. That is one number per theme.

## §6 WHAT IS STILL NOT READ

The published orchestral score. These transcriptions carry pitch, meter, key and
tempo, and carry NOTHING about who plays what — which is the half of the brief
about an epic-sized orchestra. Doug Adams' Annotated Scores describe the
orchestration in prose (already in `raw/`); the notated inner parts are in the
rental library and the Alfred folios, neither of which has been opened.
