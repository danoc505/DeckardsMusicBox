# THE EMPTY — a permission, and then a size

*Built 2026-08-19, build `2026-08-19j`. Item 2 of the four this project listed
after reading transcripts `001`–`009`, and the last of them still open: `the-nine-files-read-again.md` §3 — "**built, and fires once a record**".*

The other three are done. The last chord different on the repeat became the
cadence machine; the transition became a section function, a `T` material and a
chord set that stands on the dominant; the sequence became a device for the tune.
This is the fourth.

---

## 1. WHAT WAS THERE

```js
emptyLastBar: !!(next && next.peak)
```

**Once per record, only into the peak.** And the line directly above it in the
same block said so on purpose: *"the empty still belongs to the peak"*.

That sentence was written in the build that WIDENED the empty's opposite. The
argument used for the fill was:

> "a fill goes at the end of a PHRASE, to increase the energy in anticipation of
> the next phrase's downbeat — and a section boundary is the strongest phrase
> boundary a record has. **Nothing about that is specific to what comes next
> being a chorus.**"

The empty is the fill's stated opposite and it was left gated in the same edit.

---

## 2. WHAT THE TRANSCRIPTS SAY

Two files make it a standing device.

> "at the end of our eight bar phrase we hit d — d is where we might introduce a
> fill **or empty** depending on the vibe of the piece… **the opposite of the
> fill is the empty**… it must include the subtraction of most if not all of the
> main rhythmic elements before the next downbeat. This creates a different form
> of anticipation, what I like to call a **decoupling** of the rhythmic elements
> between large musical sections." [`004`]

> "**you can use empties anywhere you want in your track**, even if it's just as
> simple as **taking the kick out for one beat** at the end of a bar" [`004`]

> "it'll be really really satisfying if we reduce energy and go back into just
> the chords… **which by the way is one of my all-time favourite transitions to
> make, which is going from high energy to nothing** — we take **all** the
> instruments and cut them out and leave them empty for that last bar" [`005`]

**Read together, those are two different things the program lacked.** Not only a
permission — a *size*. `004`'s smallest empty is one beat of one instrument;
`005`'s is every instrument for a whole bar. The program had exactly the middle
one and no way to say either edge.

---

## 3. WHAT WAS BUILT

A genre declares `empty: { chance, size, before? }`. Three sizes:

| | what it subtracts | whose sentence |
|---|---|---|
| `beat` | the last **beat** of the last bar, rhythm section | `004` — "the kick out for one beat" |
| `bar` | the whole last bar, rhythm section | what the program always did |
| `all` | the whole last bar, **every role** | `005` — high energy to nothing |

`all` does not silence a ringing note: what is already struck rings on, nothing
new is played. That is what "leave them empty" means on an instrument with a
tail — and on a genre with a 1.6-second reverb it is the point.

**`beat` is `STEPS / 4`, not `12`.** A beat is a different number of steps in a
different metre, and this file has been bitten four times by a hardcoded 16.

**Two draws per section, always, on a stream nothing else reads** [Law 3], so a
genre that declares nothing is bit-identical — measured, synthwave: **0 of 12
records changed**.

**The peak keeps its empty and gains a floor.** It fires there whatever the genre
says, and never smaller than a bar: letting a drawn `beat` shrink the one place
the device was already right would answer the letter of "anywhere you want" while
weakening it.

### Declared

```
  lofi          chance 0.28   beat 4 · bar 3 · all 1     patina; the small one
  dungeonsynth  chance 0.30   all 3 · bar 3 · beat 1     the cavern; the big one
  boxcarsynth   chance 0.25   bar 3 · beat 2 · all 2     the stop; both
  synthwave     — declares none, unchanged
```

Dungeon synth favours `all` for a reason that is about this genre and no other:
at 52–78 BPM a bar is three to four seconds, and cutting every instrument for it
does not leave silence, it leaves **the room**. "Going from high energy to
nothing" is a different sentence in a space like that — the nothing has a sound.

**`chance` is the one number here with no source behind it.** The transcripts say
what an empty *is* and where it belongs; none gives a rate. `[EAR]`, exactly as
the transition's is.

---

## 4. WHAT IT MEASURED

```
                empties per 20 records        sizes drawn
  lofi              20  →  63        bar 32 · beat 24 · all 6
  dungeonsynth      20  →  72        all 39 · bar 29 · beat 4
  boxcarsynth       20  →  79        bar 48 · beat 15 · all 16
  synthwave         20  →  20        unchanged, all at the peak
```

And how much each size actually takes out of its bar, against the section's own
average bar:

```
                beat      bar      all
  lofi          16%       42%      83%
  dungeonsynth  -5%       30%      56%
  boxcarsynth   15%       31%      59%
  (before)               39-46%            — one size, one place
```

The three sizes are properly graded, and the old single behaviour sits exactly
where `bar` now sits.

### The negative number, which is not a fault

Dungeon synth's `beat` removes **−5%** — the emptied bar has *more* notes than an
average one. n=4, so it is barely a measurement; but the cause is real and
documented: `fillInto` also fires on a section's last bar, and a fill is denser
than a loop. With a `beat` empty the fill survives and only the last beat is cut,
so the bar can come out fuller than average.

That is fill-then-hole, which is a good drum move and is the file's own stated
precedence — and the note beside it warns against re-fixing it: *"I 'fixed' this
once by suppressing fillInto under emptyLastBar; measured, that changed exactly
one hat per song from 0.34 to 0.53, i.e. it made the empty bar louder. Reverted."*
Recorded, not re-fixed.

### And it cost the blend engine nothing

```
  432 blends   7 before the empty   7 with it declared   7 with it registered
  collisions   0                    0                    0
```

The same seven, which are the two families the collision work left behind. The
empty adds no draw to the blend — `chance` is a number that averages and `size`
is a weighted table that merges — so registering it in `BLEND_DRAW` changes which
genre owns the pair, not how many draws are spent. It is registered anyway, for
`pad`'s reason: rate and weights are read together by one decision, and a record
that took one genre's rate with another's weights would have an empty neither
genre declared.

### Read it — dungeon synth seed 1, an `all` empty into the instrumental

```
  bar 34
    lead     |*--.............|  D#5
    ostinato |*---*---*---*---|  F#5 C#5 A4 C#5
    · snare  |x..xx...x..xx...|
    · kick   |x.............x.|

  bar 35   <- the empty
    keys     |*---------------|
    bass     |*---------------|
    ostinato |*---............|  F#5
    · kick   |x...............|
                                   lead: gone.  snare: gone.

  2:10  INSTRUMENTAL
  bar 36   full band
```

Lead gone, snare gone, ostinato down to its first note, kick to a single
downbeat, keys and bass struck once and ringing. That is `005`'s sentence, and
the program could not previously make it anywhere but once, before the peak.

---

## 5. WHAT IS NOT BUILT

- **`before`** is supported and no genre uses it. `004` says *anywhere*, so none
  needed it; a genre that wants its empties only into arrivals can say so.
- **The empty as a fill ALTERNATIVE.** `004` says d is where you introduce "a
  fill **or** empty" — they are choices. Here they can both fire, deliberately
  (see the negative number above), and nothing draws between them.
- **Nobody has heard it.**

---

## Sources

- `004 (Drums)` on `main` — the empty as the fill's opposite, the decoupling, "anywhere you want", "the kick out for one beat"
- `005 (loops)` on `main` — "going from high energy to nothing", all the instruments cut for the last bar
- `docs/genre-research/the-nine-files-read-again.md` §3 and §9 — the gap this closes, and its place in the list of four
- `docs/genre-research/rhythm-phrasing.md` §2 — the phrase-end argument that widened the fill and should have widened this
