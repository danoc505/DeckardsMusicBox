# THE COMP DOES NOT LAND ON ONE — anticipations and delayed attacks

*Researched 2026-08-20. Handoff item 1, the top of the standing list: "the keys
land on beat one, every time."*

> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Same standing caveat as every sheet
> in this folder. The numbers say what the machine does. They do not say what
> it sounds like.

---

## 0. THE MEASUREMENT, RE-TAKEN

The handoff states 100% and names one evaluation. I re-measured it before
touching anything, because the habit at the foot of that file is the one that
matters here — *a measurement that agrees with you is the more dangerous one.*

Four seeds, every genre in the program, reading the **performance** (not the
materials) through the clock, the way `mk2_score` does. For every bar that has
a keys event at all, which step is that bar's **first** keys onset:

| genre | bars measured | first onset on step 0 |
|---|---|---|
| lofi | 225 | **100.0%** |
| synthwave | 420 | **100.0%** |
| dungeonsynth | 383 | **100.0%** |
| fantasysynth | 937 | **100.0%** |

**1,965 bars, four genres, and the distribution has exactly one entry in it:
`0: 100.0%`.** Not a lean. The comp has never once entered anywhere but the
downbeat, in any genre, in the life of the program.

The handoff's number is right, and it undersells the finding: this was
described as a fantasy/dungeon fault and it is **every genre**, including the
two whose whole idiom is jazz comping.

### Why, in one line

`buildKeys` builds its arrival from `strikes = pocket.slice()`, and **every
pocket in the file begins with `0`** — the four genre pools at lines 20421,
21888, 23037 and 26438 all lead with a downbeat, correctly, because that is
what a pocket is. The comp then inherits the drummer's downbeat as its own
entry and there is no vocabulary anywhere in the builder for entering
otherwise. The sustained path is even more direct: `strikes = [opts.at || 0]`.

This is the dead-config class one more time, in its purest form: *nothing in
any table says the comp should always land on one.* It simply had no way to
say anything else.

---

## 1. THE MECHANISM HAS A NAME, AND IT HAS TWO HALVES

The handoff proposes "anticipations (an eighth early) and delayed entries". Both
are named, defined terms with stated magnitudes in Berklee's own core glossary,
and the pair is exactly the pair the handoff guessed at:

> **Anticipation** — "A technique of melodic or rhythmic alteration which
> changes a note that occurs on-the-beat to be played early resulting in
> syncopation. The most common anticipations occur **one-half beat early (an
> 8th note anticipation)**, a quarter-of-a-beat early (a 16th note
> anticipation), or one-third of a beat early (a triplet anticipation)."
> [corpus:berklee/glossary]

> **Delayed attack** — "A technique of melodic or rhythmic alteration which
> changes a note that occurs on-the-beat to be played **one-half beat late (an
> 8th note delayed attack or hesitation)**, a quarter-of-a-beat late (a 16th
> note delayed attack), one-third of a beat late (a triplet delayed attack), or
> **one full beat late**. The opposite of an anticipation."
> [corpus:berklee/glossary]

> Anticipations "are sometimes also called **'pushed notes' or 'pushes.'**"
> [corpus:berklee/glossary]

**This is the whole design, handed over pre-quantised.** A beat is four steps
on this program's sixteen-step bar, so the glossary's magnitudes are already
the table:

| Berklee's term | in beats | **in steps** |
|---|---|---|
| 8th note anticipation | ½ early | **−2** |
| 16th note anticipation | ¼ early | **−1** |
| on the beat | — | **0** |
| 16th note delayed attack | ¼ late | **+1** |
| 8th note delayed attack ("hesitation") | ½ late | **+2** |
| delayed attack, one full beat | 1 late | **+4** |

No number in the pool below was chosen by me. Every one of them is a row of
that glossary entry converted at four steps to the beat.

### And the harmony genuinely moves with it

An anticipation is not a decoration on the old chord, it is the **new** one
arriving early — which is what makes it worth building rather than faking with
an extra hit:

> "It is basically **a note of the second chord played early**."
> [corpus:wikipedia/Anticipation (music)]

> "An unaccented non-chord note which is **an early sounding of the following
> chord note**, which is then repeated within its own chord."
> [corpus:mymusictheory]

So bar *b*'s voicing sounds in bar *b−1*. That is the mechanism, and §4 is
where it collides with this program's grid.

---

## 2. WHY THE COMP IS THE RIGHT LANE TO TAKE THE DOWNBEAT OFF

The strongest source is not "syncopation is nice", it is a statement about
**division of labour in a rhythm section** — which is precisely what this
program has and precisely what it was not using:

> "He counted on **the rest of the rhythm section to handle the downbeats**
> (unless playing solo), which allowed him to focus on the off-beat
> swung-eighth notes." — on Red Garland [corpus:jazz-library/comping]

> "Red Garland's left hand could really swing. His comping emphasized **the 'and
> of two' as well as the 'and of four.'**" [corpus:jazz-library/comping]

That is an argument this file can act on directly. The kick already owns
`pocket`, the bass already reads the same object, and both of them land on one
in every genre. The downbeat is **covered twice over before the comp plays a
note** — so the comp doubling it a third time is the redundancy Garland is
described as deliberately avoiding.

And the practical instruction is stated as method rather than as taste:

> "**Use syncopation to anticipate upcoming chords. You don't have to wait
> strictly until the exact beat the chord is notated to change.**"
> [corpus:jazz-library/comping]

> "By playing the chords **slightly ahead of the downbeat**, you can help lead
> into the change. This is typically done by switching on the **'and of 4'**
> ahead of the beat." [corpus:jazz-library/comping]

"The and of 4" is step **14** — which is step 0 minus 2, the 8th-note
anticipation, arrived at from a second direction. Two independent sources, the
same number.

A third, from a different tradition entirely, says the same thing about the
harmony arriving before the bar line:

> "**anticipated bass**" — a bass tone occurring "syncopated shortly before the
> downbeat", falling on the 2+ and 4 of 4/4 and "anticipating the third and
> first beats". [corpus:wikipedia/Syncopation]

---

## 3. WHICH GENRES MAY DO IT — and one that may not

Law 4 says no code below stage 1 names a genre, so the mechanism is built
general and each genre declares whether it has this vocabulary. That
declaration needs its own source per genre, and the answer is **not** the same
for all four.

### lofi — yes, and it is overdue

Its comp is a Rhodes/wurly jazz comp; `modal-jazz.md`, `lofi-comp-and-lead.md`
and `the-rhodes.md` are already in this folder. The Garland material above is
about this exact instrument doing this exact job. Heaviest syncopation weights
in the file.

### dungeonsynth and fantasysynth — NO, and I had this wrong

**I declared pools on both, measured, and the pools never reached a note.**
Recording the sequence rather than the conclusion, because the mistake is the
useful part.

The theory ground is real and it is worth keeping. The jazz sources do not
reach these genres and were not leaned on; this stood on its own footing:

> "syncopation has been important in European composition **since at least the
> Middle Ages**" — and "many **14th-century** Italian and French compositions
> use syncopation"; the 15th-century English *Agincourt Carol* exhibits "lively
> syncopation". [corpus:wikipedia/Syncopation]

One source also pushed back usefully when asked directly, and narrowed the
claim rather than confirming it — pronounced syncopation belongs to the
*ars subtilior* at the **end** of the period, not across it
[corpus:newworldencyclopedia/Medieval Music]. I went looking for "medieval
music is syncopated" and did not get it that broadly.

**None of that turned out to matter, because these genres have no comping hand
at all.** `dungeonsynth` declares `keysStyle: "hold"` (and `fantasysynth`
inherits it), which makes `buildKeys` run its **sustained** path: the first
keyboard is a pad that presses once a bar. The entry treatment is gated
`!opts.sustain`, so the declaration sat in the table doing nothing.

That gate is not an accident to be widened. Every source behind §1 and §2 is
about *a hand comping on a keyboard*, and this genre's own pad decision has two
primary sources under it — a pad on "just a one and five" held, and a choir
holding one note for a whole measure
[docs/genre-research/dungeon-synth-technique.md]. Syncopating a part whose whole
declared job is to hold would be reaching past the evidence.

So the declarations came out. **Leaving them in would have been dead config of
exactly the class the handoff logs six times** — a table that says the thing
while the music never does it — and it would have been *my own* contribution to
that list, which is the reason this section is written out in full.

**This corrects the handoff's framing of item 1.** It presents "the keys land on
beat one" as one fault with one repair. It is two different facts wearing one
number:

| genre | 100% on beat 1 | what it is |
|---|---|---|
| lofi | yes | **a real comping defect** — fixed here |
| synthwave | yes | its chords are a backdrop by design — declines, §3 |
| dungeonsynth | yes | **a pad pressing once a bar, as declared and sourced** |
| fantasysynth | yes | same, inherited |

Three of the four are not the fault the item describes. Whether a *held* chord
may enter off the beat is a genuine open question, but it belongs to
`the-second-keyboard-rhythm.md`, which owns how a pad presses — not here.

### synthwave — NO, and this is a decision, not an omission

Its chord layer is described everywhere as a **static backdrop that gets out of
the way**, with the rhythmic work done by a different part:

> "The **arpeggio is the melodic engine** of synthwave... running continuously
> as the harmonic backdrop of the entire track."
> [corpus:babyaudio/how-to-make-synthwave]

> chord progressions of "just two or three chords, **looping in a way that makes
> space for arpeggios**, leads, vocals, or sound design to shine."
> [corpus:emastered/synthwave]

The genre's identity is a grid-locked machine holding chords while the
arpeggiator moves. Syncopating that comp would not be a fix, it would be a
different genre. **Synthwave declares no pool and is byte-identical after this
change** — and that is the point of building it as a declaration.

`ostinato` is where synthwave's motion already lives, and item 7 is where that
lane's rhythm gets looked at.

---

## 4. WHERE THE MECHANISM MEETS THIS PROGRAM'S GRID

Three constraints, all found by reading rather than by running into them.

**1. A step may not be negative.** The stage-6 grid check throws on
`n.step < 0 || n.step > 15` (and, since the NaN repair, on non-finite values
first). So an 8th-note anticipation cannot be written as `bar b, step −2`. It
is written as **`bar b−1, step 14`**, which is also what it literally is.

**2. Bar 0 cannot anticipate.** There is no bar before it, and a material's
first chord arriving early would have to reach into the previous *section*,
which stage 3 does not own. Declined at `b === 0` — the record's first chord
lands on one, which is correct anyway.

**3. `noteFits` did NOT already permit it, and I was wrong about that.** I read
the validator, saw that it passes anything `inKey(key, mode, pitch)` before it
ever asks about the bar's chord, and concluded that an anticipation is diatonic
by construction and therefore safe. Then it threw on the first run:

```
out of key, not in the chord, and does not resolve into the next one,
in A: keys 51 bar 2
```

The general `inKey` pass carries an anticipation only while every anticipated
chord happens to be diatonic, and lofi's harmony has extensions and borrowed
chords in it. My reasoning worked for the common case and I had presented it as
a proof.

The repair is not to loosen the check — it is to **ask it the right question.**
An anticipation is a non-chord tone *in the bar it is written in*; that is the
definition, per both theory sources in §1. So a note the builder marks `ant` is
validated against **the chord it anticipates**, `chSet[bar + 1]`. It still has
to be a real tone of a real chord in the material. Nothing that did not opt in
is judged by a different rule, because nothing else in the file sets `ant`.

It failing loudly on bar 2 was the good outcome. Had lofi's bar 2 been a plain
triad, this would have shipped and thrown on somebody's seed months later.

And one thing declined deliberately: **a pad does not do this.** The whole
treatment is gated `!opts.sustain`. The sources here are about a comping hand;
`the-second-keyboard-rhythm.md` is the sheet that owns how a pad presses, and it
says pads "typically comprise sustained legato chords". Anticipating a pad
would be reaching past the evidence into a part that was just given its own
researched rhythm.

**The push is a stab, not a roll.** An arrival at step 14 has one step of room
before the bar line, so the roll width computes to 0 and every voice speaks
together. That is not a workaround — a push *is* a block hit, and the existing
`room` arithmetic produces it without being told.

**A clash still falls back to beat one.** If the anticipated voicing would land
on a pitch another part already owns, the bar takes the plain articulation it
has always had, decided before a note is emitted. So the measured percentage
will not be the pool's weights exactly, and the gap between them is the seam
check doing its job rather than a bug.

---

## 5. THE POOL

One genre declares one, for the reasons in §3. Weights are **[EAR]** — nobody
has heard them; **every step offset is Berklee's table from §1.**

```
lofi          0: 5,  -2: 4,  +2: 3,  -1: 2,  +1: 2      the comping hand
synthwave     — declares nothing, by decision, §3 —
dungeonsynth  — cannot: its keys lane is a held pad, §3 —
fantasysynth  — same, inherited —
```

The downbeat stays the single heaviest entry and is still outweighed 11:5 by
everything that is not it, which is the Garland reading in §2: the rhythm
section already has the downbeat twice over.

## 6. WHAT IT ACTUALLY DID

Same probe, same four seeds, after the change:

| genre | before | after |
|---|---|---|
| lofi | 100.0% on step 0 | **58.5%** — and steps 1, 2, 3, 6, 7, 8 all now appear |
| synthwave | 100.0% | 100.0% — unchanged |
| dungeonsynth | 100.0% | 100.0% — unchanged |
| fantasysynth | 100.0% | 100.0% — unchanged |

lofi's first-onset distribution went from a single entry to seven:
`0: 58.5%  1: 17.0%  2: 14.3%  3: 3.1%  6: 5.8%  7: 0.9%  8: 0.4%`.

And the three genres that declare nothing are **byte-identical**: the full
`mk2_score` printout was diffed before and after, per genre, and lofi is the
only one with a changed line. [Law 7]

### The gap between the pool and the measurement, which is large

The pool asks for the downbeat 31% of the time. It measured 58.5%. That gap is
**declines, and they are worth stating rather than tuning away**:

| | of 80 drawn anticipations |
|---|---|
| declined — bar 0 of the material | 18 (23%) |
| declined — this part already sounds on that step | 34 (43%) |
| **placed** | **28 (35%)** |

Delayed attacks fared better: 48 of 48 placed, none declined for room.

The bar-0 decline is **structural, not a bug**: materials here are short, so a
material's first bar is a large fraction of its bars, and a first chord cannot
reach back into a section stage 3 does not own. The busy-step decline is the
inner-voice figure — `CELL_POOL` contains 14 and 15, and lofi's own pocket
contains 14 — already occupying the step the push wants.

So **the honest ceiling on this mechanism as built is around a third of what the
table asks for.** That is a real limitation of doing this at stage 3, it is not
hidden in the number, and if the comp needs to push harder than this the answer
is to let a material's first bar anticipate at *performance* time, which is a
different owner and a different change.

### One thing that moved that I did not expect

lofi's **lead** changed too. That is legitimate and traceable: `resA` reserves
the theme against `keysAx`, so when the comp's onsets move, the pitches the tune
is avoiding move with them. It is not stream contamination — the new draw is on
its own `compEntry:` substream and the three undeclared genres came out
byte-identical, which is the proof.

## SOURCES

- Berklee College of Music, Core Glossary — *anticipation*, *delayed attack*,
  *pushed notes*. https://college.berklee.edu/core/glossary.html
- Jazz Library, *Jazz Comping — A Complete Beginners Guide* — anticipating the
  change, the "and of 4", Red Garland and the downbeats.
  https://jazz-library.com/articles/comping/
- Wikipedia, *Anticipation (music)* — a note of the second chord played early.
  https://en.wikipedia.org/wiki/Anticipation_(music)
- My Music Theory, *Anticipations* — early sounding of the following chord note.
  https://mymusictheory.com/harmony/anticipations/
- Wikipedia, *Syncopation* — syncopation since the Middle Ages, 14th-century
  Italian and French use, the Agincourt Carol, the anticipated bass.
  https://en.wikipedia.org/wiki/Syncopation
- New World Encyclopedia, *Medieval Music* — ars subtilior and extreme
  syncopation. https://www.newworldencyclopedia.org/entry/Medieval_Music
- Baby Audio, *How to Make Synthwave* — the arpeggio as the melodic engine.
  https://babyaud.io/blog/how-to-make-synthwave
- eMastered, *Synthwave Chord Progressions* — two or three chords looping to
  make space. https://emastered.com/blog/synthwave-chord-progressions
