# HOW A BANJO IS ACTUALLY PLAYED — and why ours was not

> *"The arrangement of banjo notes is shit! And i think for the same reason the
> washtub arrangement sounds like shit also! There is no rythem its just pluck
> space pluck space pluck! That is not how these instruments are played... Its
> like if someone took a gutare and just lazily played one string at a time with
> a gap inbetween each pluck, or a violn where they bowed one string only one and
> then paused before moving to another its all trash. Maybe the word is
> polyphany?"* — the owner, 2026-08-18

**The word is polyphony, and he is right.** Two faults, both measured, both now
fixed. One of them I introduced the previous day while claiming to fix the
instrument.

---

## 0. The two faults, stated first

| | fault | what it sounded like |
|---|---|---|
| **1** | the roll's strings stopped ringing into each other | pluck · space · pluck |
| **2** | the accent fell on beats 1-2-3-4 | no rhythm — a metronome |

Fault 1 was a regression I caused in build `2026-08-18m`. Fault 2 had been in
the file since the ostinato was written.

---

## 1. A ROLL IS AN ARPEGGIO OF A HELD CHORD — the strings overlap

This is the fact that matters most and it is the one the program got wrong.

> *"Each 'standard' roll pattern is a right hand fingering pattern, consisting of
> eight (eighth) notes, which can be played while holding any chord position with
> the left hand."* — [Banjo roll, Wikipedia](https://en.wikipedia.org/wiki/Banjo_roll)

> *"Rolls break chords into individual notes played in rapid succession. Instead
> of strumming all the strings at once, you pick them one at a time in a set
> order. This produces a stream of arpeggios (broken chords)."*
> — [Deering Banjos](https://blog.deeringbanjos.com/the-four-essential-5-string-banjo-rolls)

The consequence nobody wrote down, and the one that was missed: **the left hand
holds the shape and nothing damps the strings.** String 2 is still ringing when
string 1 is picked, and both are ringing when the thumb hits the fifth. Three or
four strings sound at once, continuously, for as long as the roll runs.

That overlap **is** the banjo. Remove it and you have a sequence of unrelated
plucks, which is exactly the owner's guitar analogy.

### 1a. What we had done to it

Build `2026-08-18m` capped the banjo's ring at 0.90 s falling to 0.35 s, from the
Acta Acustica measurement of banjo string-mode decay (100–200 ms). At this
genre's 57–97 bpm an eighth note is 0.31–0.53 s. **Every note therefore died
exactly as the next one arrived.**

Measured, four records, share of each part's sounding time with only ONE of its
notes ringing:

| part | 18l (before) | 18m (the regression) | 18n (now) |
|---|---|---|---|
| `keys/banjo` | 11% alone | **49% alone** | 18% alone |
| `bass/washtub` | 37% alone | **75% alone** | 50% alone |
| `ostinato/banjo` | 19% alone | 20% alone | 19% alone |

and share of consecutive notes that overlap at all:

| part | 18l | 18m | 18n |
|---|---|---|---|
| `keys/banjo` | 85% | **66%** | 82% |
| `bass/washtub` | 73% | **43%** | 70% |

The banjo's *chord* part spent half its life as one lonely note. That is the
sound he rejected, and it did not exist two builds earlier.

### 1b. Why the physics number was the wrong number

The paper's 100–200 ms is a **mode's** decay rate — how fast energy leaves one
resonance — not when a note stops being audible. The comment in the file said
exactly that, called it *"the gap no source bridges"*, and then closed the gap in
the wrong direction anyway.

**The ceiling has to be set by the part, not by the physics alone.** A roll needs
its ring to cover at least three of its own notes, because three strings ringing
*is* the roll. At 57–97 bpm three eighths is 0.9–1.6 s.

```
banjo    ring: [1.60, 1.05]      (low end of range → high end)
washtub  ring: [1.40, 0.80]
```

Both still make a 3.3-second held banjo note impossible, which was the original
complaint and was also real.

---

## 2. THE THUMB IS A FINGER, NOT A BEAT — where the accent goes

The second fault: *"there is no rythem."*

The code read:

```js
const strong = at % 4 === 0;             // the quarter-note pulse
```

Beats one, two, three, four. **The one accent pattern a banjo roll never has.**

Measured on seed 1, mean gain by step across 1,561 roll notes:

```
step:  0     1    2     3    4     5    6     7    8     9   10    11   12
gain: 0.46   .   0.27  .13  0.47  .13  0.27  .12  0.47  .10 0.27  .08  0.46
```

Loud–soft–loud–soft on the quarters, forever. A drum machine.

### 2a. Where the thumb actually falls

Deering's four essential rolls, by string number (string 1 is the highest full
string, string 5 is the short high g drone):

| roll | strings | right hand | thumb lands on |
|---|---|---|---|
| forward | 2-1-5-2-1-5-2-1 | I M T I M T I M | notes 3, 6 → **3+3+2** |
| backward | 1-2-5-1-2-5-1-2 | M I T M I T M I | notes 3, 6 → **3+3+2** |
| forward-reverse | 3-2-1-5-1-2-3-1 | T I M T M I T M | notes 1, 4, 7 → **3+3+2** |
| alternating | 3-2-5-1-4-2-5-1 | T I T M T I T M | **every other note** |

> *"The thumb plays every other note."* — Deering, on the alternating roll

**Three plus three plus two.** That is the syncopation the roll *is*, and it is
why eight even eighth notes do not sound even. Accenting 1-2-3-4 over the top of
it cancels it exactly.

### 2b. Our cells ARE these rolls, which is checkable

The genre's ostinato cells are scale degrees. Through the string map in
`banjo-and-harmonica-notation.md` §1b (open G, gDGBD, degrees from the 3rd
string): **0 = 3rd, 2 = 2nd, 4 = 1st, 7 = 5th, −3 = 4th.**

| declared cell | reads as | is |
|---|---|---|
| `[2,4,7,2,4,7,2,4]` | 2-1-5-2-1-5-2-1 | **forward roll** ✓ |
| `[0,2,4,7,4,2,0,4]` | 3-2-1-5-1-2-3-1 | **forward-reverse** ✓ |
| `[0,2,7,4,-3,2,7,4]` | 3-2-5-1-4-2-5-1 | **alternating** ✓ |
| `[4,2,7,4,2,7,2,4]` | 1-2-5-1-2-5-2-1 | **backward**, first six exact |

**The pitches were already right.** Only the accent was wrong.

### 2c. The fix is derived, not listed

The thumb plays the bass strings and the fifth — degrees `0`, `-3`, `7`. The
genre declares that once:

```js
thumbOn: [0, -3, 7],
```

and the accent asks the cell which note this is, rather than asking the bar what
beat it is. A genre that declares nothing keeps the old pulse, so nothing else in
the file moves.

**The check that says the map is read right and not guessed:** the alternating
cell's thumb lands on every other note — exactly as Deering describes that roll,
and unlike the other three. If the map were wrong, that would not fall out.

### 2d. What it did to the notes

Seed 1, bar 26, the same seven notes both times:

```
BEFORE   ·C#5  **E5   ·C#6  **E5   ·C#5  **E5   ·C#6
         0.29  0.46  0.29  0.46  0.29  0.46  0.29     — alternating, on the quarters

AFTER    ·C#5   ·E5  **C#6   ·E5   ·C#5   ·E5  **C#6
         0.29  0.29  0.46  0.29  0.29  0.29  0.46     — the thumb, on 3 and 7
```

---

## 3. THE WASHTUB — "short" is not "isolated"

Same class of fault, and the sources say so directly:

> *"A percussive rhythm can be added by slapping the string against the pole with
> the plucking hand, creating a sharp, rhythmic thump."*
> — [Audiolover, How To Play Washtub Bass](https://audiolover.com/instruments/bass/how-to-play-washtub-bass/)

The instrument is **rhythmic and percussive**, which is not the same thing as
sparse. Capping it at 0.70 s took it from 37% to 75% of its time sounding alone
and left a hole under every bar. Its own sheet says the player *stops* the note —
a rope player damps when the next note is coming, not the instant this one has
spoken.

**Still open, and named here rather than guessed at:** the slap against the pole
is a *percussive event between the pitched notes*, and this program has no such
event. `THUMP` is a timbre knob on the pitched note, not a stroke of its own.
That is a real remaining gap and it is the rest of the answer to "there is no
rhythm" on the bass.

---

## 4. THE GUARD, and why the previous one was useless

`probe_ring.js` first carried the claim *"no banjo note is longer than a
second"*. **That claim passed on the build the owner rejected on hearing**,
because every note was individually short — which was the entire problem.

A ceiling cannot see a texture. The claim is now about the overlap:

> an instrument declaring `poly > 1` and playing an arpeggio may not spend more
> than 40% of its sounding time on ONE note

Verified both ways: **red on `2026-08-18m`** (`keys/banjo 49% alone`), green on
`2026-08-18n` (`keys/banjo 18% alone · ostinato/banjo 19% alone`). The length
ceiling stays alongside it, because the 3.3-second held note was also real. A
plucked instrument has to be short **and** overlapping, and only holding it to
both catches both.

---

## 5. What is still not a banjo

Honest list, not fixed here:

1. **No pinches.** Two or three strings plucked *simultaneously* — named in the
   Wikipedia article's examples, absent from this program. Every banjo note we
   write is a single string.
2. **No brush / clawhammer.** The sheet names clawhammer for slow songs; this
   genre is 60–85 bpm and has none.
3. **The banjo plays three chairs** — ostinato, keys *and* lead (task #173). A
   banjo in the melody chair plays a stepwise sung line with no roll and no
   drone: every finding in this document switched off.
4. **The washtub has no slap** — §3 above.
5. **19.3 dB between the loudest and quietest roll note.** The 16ths sit at 0.08
   against accents at 0.47, which makes half the roll inaudible rather than
   quiet. Not yet judged against a source.

---

## Sources

- [Banjo roll — Wikipedia](https://en.wikipedia.org/wiki/Banjo_roll)
- [The Four Essential 5-String Banjo Rolls — Deering Banjos](https://blog.deeringbanjos.com/the-four-essential-5-string-banjo-rolls)
- [Roll Patterns on the Banjo — dummies.com](https://www.dummies.com/article/academics-the-arts/music/instruments/banjo/roll-patterns-on-the-banjo-155951/)
- [How to Use Basic Roll Patterns to Play Backup Bluegrass Banjo — dummies.com](https://www.dummies.com/article/academics-the-arts/music/instruments/banjo/how-to-use-basic-roll-patterns-to-play-backup-bluegrass-banjo-143045/)
- [Acoustics of the banjo: measurements and sound synthesis — Acta Acustica 5:16 (2021)](https://acta-acustica.edpsciences.org/articles/aacus/full_html/2021/01/aacus200055/aacus200055.html)
- [How To Play Washtub Bass — Audiolover](https://audiolover.com/instruments/bass/how-to-play-washtub-bass/)
- `docs/genre-research/banjo-and-harmonica-notation.md` — the string map, the roll table, the fifth-string drone
- `docs/genre-research/washtub-bass.md` — the hand damping, the range, `poly: 1`
