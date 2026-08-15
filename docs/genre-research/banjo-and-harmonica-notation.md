# THE BANJO AND THE HARMONICA — how they are actually written

*Researched 2026-08-15 at the owner's request: "You need to look up some music
scores written for banjo and harmonica, we are not using them correctly. I
think we need more notes at the least."*

**He is right, and the sources say so in numbers.** Every pattern below is
quoted from a named source; anything I chose is marked `[CHOSEN]`.

> **WHAT THESE SOURCES ARE, said before they are used.** They are REFERENCE AND
> INSTRUCTIONAL material — an encyclopedia layout table, a technique article, a
> teaching page that prints the roll patterns string by string. They are not
> transcriptions of actual tunes. The patterns in them are exact, which is why
> the cells built from them are trustworthy; what they do NOT contain is a
> whole piece of music.
>
> **So this sheet has the vocabulary and not the deployment**, and the
> difference is real: it can say what a roll IS and cannot say where a player
> changes roll inside a tune, how a break is shaped from first bar to last, or
> how often the melody note is displaced off the beat. The program currently
> picks one roll per material and repeats it. That is defensible from these
> sources and is certainly cruder than a player. Closing it needs a real
> transcription — that is the next piece of research on this instrument, and it
> is written down here rather than left as an impression that the job is done.

---

## 1. THE BANJO — a roll is eight notes to the bar, and it never stops

The single most important fact, and the program did not have it:

> "each roll pattern is a *right hand* fingering pattern, consisting of eight
> (eighth) notes" — a "repeating eighth-note arpeggio"
> [Wikipedia, *Banjo roll*]

A bluegrass banjo player is not playing a figure that decorates a chord. The
roll **is** the part: a continuous stream of eighth notes, one pattern per bar,
running for as long as the tune does. Earl Scruggs's playing is this and
almost nothing else.

### 1a. The rolls, with their actual string numbers

Eight named patterns, each eight notes, from *Banjo For Dummies* [dummies.com,
"Roll Patterns on the Banjo"]. **T** = thumb, **I** = index, **M** = middle;
the numbers are the STRINGS.

| roll | fingers | strings |
|---|---|---|
| alternating thumb | T-I-T-M-T-I-T-M | 3-2-5-1-4-2-5-1 |
| forward-reverse | T-I-M-T-M-I-T-M | 3-2-1-5-1-2-3-1 |
| forward | T-M-T-I-M-T-I-M | 2-1-5-2-1-5-2-1 |
| the "lick" | T-M-T-I-M-I-T-M | 3-1-5-3-1-3-5-1 |
| Foggy Mountain | I-M-T-M-T-I-M-T | 2-1-2-1-5-2-1-5 |
| backward | M-I-T-M-I-T-M-I | 1-2-5-1-2-5-2-1 |
| middle-leading (Osborne) | M-I-M-T-M-I-M-T | 1-2-1-5-1-2-1-5 |
| index-leading | I-T-I-M-I-T-I-M | 2-3-2-1-2-3-2-1 |

And the rule that shapes every one of them:

> "you use a different right-hand finger to strike a different string for each
> consecutive note ... you don't want to use the same right-hand finger or hit
> the same string twice in a row" [dummies.com]

**That is a testable law**, not a style note: no roll cell may repeat a string
on consecutive notes. Every one of the eight above obeys it.

### 1b. And the fifth string is a HIGH drone — this is the whole sound

Open G tuning is **gDGBD**: the 5th string is a short string tuned to **g
above** the 3rd string's G, not below it. So in semitones from the chord root
(the 3rd string):

| string | 4 | 3 | 2 | 1 | 5 |
|---|---|---|---|---|---|
| note | D | G | B | D | **g** |
| semitones from the root | −5 | 0 | +4 | +7 | **+12** |
| **SCALE DEGREE** | **−3** | **0** | **2** | **4** | **7** |

**Use the DEGREE row when writing cells.** `buildOstinato` hands a cell's
numbers to `degMidi`, so a 4 is the fifth and a 7 is the octave. I wrote the
semitone row into the genre table on the first pass and the engine read 4, 7
and 12 as the sixth, the octave and the sixteenth: the roll spanned two
octaves and the fifth string came out as the LOWEST note of the figure, which
is the exact inverse of the instrument. Both rows are printed here so the
mistake is one line of reading away from being avoided.

Every roll in the table above hits string 5 two or three times a bar, so a
banjo roll is **an arpeggio with a high drone punched through it**. A figure
built from 0/4/7/12 in ascending order is an arpeggio; a figure that keeps
landing back on +12 between other notes is a banjo. The program's cells were
the former — invented, plausible, and not the instrument.

### 1c. What this means for the program

- the roll's rate is **eighth notes**, continuous, one pattern a bar
- the cells are the eight above, translated by the string map
- the roll is not a decoration for one section: it is the rhythm part
- no cell may hit the same string (same offset) twice in a row

---

## 1d. A REAL BREAK, COUNTED — *Foggy Mountain Breakdown*

*Added 2026-08-15 at the owner's request to close the deployment gap. This is
an actual tablature, read note by note: Tom Adams, "Foggy Mountain Breakdown",
based on the Flatt & Scruggs 1949 recording (adamscountybanjo.com, © 2012).
Its own header is honest and so is this: **"this is a template for a
down-the-neck break. This is not a transcription of any one break."** So it is
how the vocabulary is DEPLOYED over sixteen bars by a player who knows the
record, which is exactly what was missing — not a note-for-note copy of one
performance.*

Counted off the tab itself:

| measured | value |
|---|---|
| bars in the break | **16** |
| picked notes (a T, I or M in the tab) | **106** |
| notes sounded by the LEFT hand — hammer-ons and pull-offs | **19** (17 H, 2 Po) |
| **total sounding notes** | **125**, against 16 × 8 = 128 eighth-note slots |
| thumb / middle / index | **43 / 34 / 29** |

**Three things follow, and the program had none of them.**

1. **The stream really is unbroken.** 125 of 128 slots sound. The claim in §1
   that "the roll is the part" is not a figure of speech — a break is a
   continuous eighth-note stream with three rests in sixteen bars.
2. **One note in seven is NOT PICKED.** 19 of 125 — 15% — are hammer-ons and
   pull-offs: the left hand sounding a note between picked ones. They are
   quieter, they have no pick attack, and they are most of what makes a break
   sound like playing rather than like a pattern generator. The program picks
   every note.
3. **The thumb leads and it is the beat.** 43 of 106 picked notes are the
   thumb, and in every roll in §1a the thumb falls on the strong positions.
   That is where a break's dynamic accent lives — and the program's measured
   dynamic range across the whole roll was **1 dB**, which is no accent at all.

And the form, printed in the tab's own chord chart:

    | 1  1  1  1 | 6m 6m 6m 1 | 6m 6m 6m 1 | 5  5  1  1 |
    | G  G  G  G | Em Em Em G | Em Em Em G | D  D  G  G |

Sixteen bars, and the harmonic event is the **relative minor** — three bars of
it, twice, before the V. Not a i-VI-VII shuttle and not a blues.

**What is still not closed:** the tab is a template rather than one recorded
break, so it cannot say how a player varies between his FIRST and SECOND
break, or what he does behind a singer as opposed to in a solo. That needs two
transcriptions of the same tune from the same player, and it is the next thing
to look for.

---

## 2. THE HARMONICA — the layout decides what it can play

A 10-hole Richter diatonic in C [Wikipedia, *Richter-tuned harmonica*]:

| hole | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| **blow** | C | E | G | C | E | G | C | E | G | C |
| **draw** | D | G | B | D | F | A | B | D | F | A |

### 2a. It CAN hold a chord — and only two of them

This settles the owner's earlier question ("I'm not sure that's possible on a
harmonica"). It is possible, and the instrument is *built* for it:

> "The notes most important in the key (the tonic triad C–E–G) play during the
> blow, and the secondary notes (B–D–F–A) are on the draw."

Cover three or four low holes at once and blow, and you get the **tonic
triad**; draw, and you get the **dominant-seventh cluster**. A harmonica can
therefore hold a chord on the I and on the V, **and on nothing else**. Any
other chord has to be a single line. That is a real constraint with a real
sound, and it is a better rule than "no chords".

### 2b. The bottom octave is missing two degrees

> "Although there is a three-octave distance between 1 and 10 'blow', there is
> only one full major scale available on the harmonica, using holes 4 through
> 7."

Holes 1–3 give C D E G B — **no 4th and no 6th**. So a low harmonica line
cannot play those degrees at all without a bend. The middle octave (4–7) is
the only place a complete scale exists, which is exactly why blues players
live there.

### 2c. The two ornaments that are the instrument

- **Throat vibrato**, produced at the vocal folds: "a light coughing motion
  (around seven per second)" — **≈ 7 Hz** [bluesharmonica.com, David Barrett,
  *Different Types of Tremolo and Vibrato — Throat Tremolo*]
- **The warble / shake**: "rapidly alternate between two notes in neighbouring
  holes — usually on the draw notes", at a speed "somewhere between that of a
  triplet and sixteenth-note triplet" [learntheharmonica.com;
  bluesharmonica.com]
- **Bending**: "the pitch falls downward", giving "the glissando characteristic
  of much blues harp and country harmonica playing" and "the famous 'wail' of
  the blues harp" [Wikipedia, *Harmonica techniques*]

A warble is **two adjacent scale notes alternated**, not a pitch wobble on one
note — the program has vibrato and had no warble at all.

---

## 3. WHAT THE PROGRAM WAS DOING WRONG — measured

| the source says | the program did |
|---|---|
| a roll is eight notes a bar, continuously, and it is the rhythm part | the banjo's roll lane (`ostinato`) was named in **one** of six section functions |
| the eight rolls above, each hitting the high 5th string 2–3 times a bar | four **invented** cells, none of them a named roll |
| no string twice in a row | the invented cells repeat an offset back to back |
| a harmonica holds only the I and the V | held chords were not modelled at all |
| the bottom octave has no 4th and no 6th | the whole range was treated as chromatic |

And the level, measured across 8 records (peak gain each voice hands its
channel, before the shared master chain):

| voice | notes | median | quietest | loudest |
|---|---|---|---|---|
| **banjo, the roll** | 4618 | **−38.4 dB** | −41.9 | −35.4 |
| banjo, the chords | 1824 | −29.2 dB | −37.1 | −26.3 |
| harmonica, the tune | 1482 | −27.1 dB | −35.3 | −19.0 |
| bass | 1309 | −18.5 dB | −20.8 | −15.8 |
| kick | 952 | −4.7 dB | −18.1 | −2.9 |

The owner: *"The Banjo is playing back to quite and even when i turn up the
volume its still to low."* **Measured and exactly true.** The roll — the
genre's signature part — sits **20 dB under the bass** and 34 under the kick.
A fader that travels +12 dB cannot rescue that, which is precisely what he
reports.

**Why**, and it is three things compounding:

1. **The dynamic is counted twice.** The bank has two recorded layers, and
   `banjoP` was recorded quiet (its takes peak at 0.12–0.34 against the forte
   set's 0.34–0.79). The voice picks the quiet LAYER when the note is soft
   *and then multiplies by the note's gain as well*. A sampler normalises its
   layers and lets velocity pick the timbre; this applied the dynamic twice.
2. **The takes are not normalised to each other.** Within the forte layer
   alone the peaks run 0.34 → 0.79, so a scale up the neck jumps **7 dB**
   between adjacent notes for no musical reason. The harmonica's are worse:
   0.085 → 0.44, a **14 dB** spread.
3. The banjo rides the `keys` bus, whose `LEVEL` is 0.15 — the lowest in the
   table — and the roll takes a further cut from `roleGain.ostinato`.

---

## Sources

- Wikipedia, *Banjo roll* — https://en.wikipedia.org/wiki/Banjo_roll
- *Banjo For Dummies*, "Roll Patterns on the Banjo" —
  https://www.dummies.com/article/academics-the-arts/music/instruments/banjo/roll-patterns-on-the-banjo-155951/
- Wikipedia, *Richter-tuned harmonica* —
  https://en.wikipedia.org/wiki/Richter-tuned_harmonica
- Wikipedia, *Harmonica techniques* —
  https://en.wikipedia.org/wiki/Harmonica_techniques
- David Barrett, bluesharmonica.com, *Different Types of Tremolo and Vibrato —
  Part 4, Throat Tremolo* —
  https://www.bluesharmonica.com/different_types_tremolo_and_vibrato_part_4_throat_tremolo
- learntheharmonica.com, *Easy Warbles — Beginner Blues Harmonica Trills* —
  https://www.learntheharmonica.com/post/how-to-warble-licks-beginner-blues-harmonica-lesson-tab
