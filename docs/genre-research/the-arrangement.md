# THE ARRANGEMENT — is it more than doubling? `2026-08-17`

*The owner: "how will we arrange our orchestra? We have all the families now
correct? Do you have data on orchestration? Its more than judt doubling?"*

**Yes, and here are the two rules the program had sourced and never built.**
Both are arrangement decisions, not mixing ones — no fader fixes either.

---

## 1. THE FAMILIES — and the seam that did not exist

`score-craft.md` §7 quotes Rimsky-Korsakov prescriptively:

> *"the harmonic basis should differ from the melody not only in fullness and
> intensity of tone, but **also in colour**. If the fanfare figure is allotted to
> the brass (trumpets or horns) the harmony should be given to the wood-wind; if
> the phrase is given to the wood-wind (oboes and clarinets) the harmony should
> be entrusted to the horns."*

And then the sheet's own note, which is the important half:

> *"**This program has no seam for it.** No voice in the program knows whether it
> is a wind or a brass, so 'melody family ≠ harmony family' is not currently a
> question that can be asked, let alone enforced."*

So the answer to *"we have all the families now correct?"* was **no** — the
instruments existed, the concept did not. Every pitched machine now declares
`family`, alongside `slot`, `range` and `play`:

| family | who |
|---|---|
| **strings** | fiddle, hurdy-gurdy |
| **plucked** | banjo, diddley bow, washtub, Erang harp, bard pluck |
| **reed** | harmonica, contrabassoon, bard wind, bard flute, sax, bassoon, bass oboe, cor anglais, bari sax |
| **brass** | horns, carnyx, steam whistle |
| **keys** | Wurlitzer, Rhodes |
| **tape** | VP-330, Erang strings, Mellotron |

Twenty-five machines. `PLAY_FAMILY` stays separate and answers a different
question — how a note *ends* (plucked / struck / wind / bowed). A harmonica and
a contrabassoon are both "wind" for breathing and are nothing alike in colour.
Two tables because they are two facts.

### 1a. THE FAULT IS SMALL AND THE NUMBER IS HONEST

Measured on boxcar synth, 120 records, counting only songs where **both** the
tune and the comp drew a named box rather than "auto":

- **64** such records
- **6** where the two came out the same colour — always the slide (plucked) on
  the tune under the harp or the bard's plucked patch

So this fixes **6 records in 120**. Worth building because it is a rule with a
source and a mechanism that did not exist — not because it is loud.

### 1b. AND APPLYING IT EVERYWHERE WAS WRONG

The first draft enforced §7 on every genre. The snapshot caught it: **56 dungeon
synth records moved, and they moved badly.** Its lead is a bard flute or bard
wind — reeds — and its comp draws the bassoon, bass oboe and bari sax, which are
reeds too. The rule fired across most of the record and (worse, because the
first version took the first eligible box instead of drawing one) resolved
**every single clash to the same Mellotron**. One rule turned a hand-built wind
consort into a monoculture.

Two corrections. The redraw is a **draw**, weighted like every other draw in
that function. And §7 is a **genre declaration** — `colour: true`, on boxcar
alone — because a wind consort playing wind harmony is not a defect, it is what
dungeon synth *is*. Rimsky is describing an orchestra with four families
available, not a band that owns one. **Law 4: the genre is the only thing
entitled to say what its music does.**

---

## 2. THE RE-ENTRY — the bigger find

`score-craft.md` §8, and he extends it himself:

> *"After a long rest the re-entry of the horns, trombones and tuba should
> coincide with some characteristic intensity of tone, **either pp or ff**; piano
> and forte re-entries are less successful, while re-introducing these
> instruments **mezzo-forte or mezzo-piano produces a colourless and
> common-place effect**. **This remark is capable of wider application.** For the
> same reasons it is not good to commence or finish any piece of music either mf
> or mp."*

### 2a. MEASURED — and boxcar synth was the worst in the file

30 records a genre; a rest is four bars or more:

| genre | re-entries | of which **mezzo** | begins mezzo | ends mezzo |
|---|---|---|---|---|
| lofi | 74 | 3 (4%) | 12/30 | 30/30 |
| synthwave | 208 | 52 (25%) | 7/30 | 26/30 |
| dungeonsynth | 190 | 26 (14%) | 0/30 | 7/30 |
| vgm | 204 | 172 (84%) | 27/30 | 0/30 |
| **boxcarsynth** | **472** | **438 (93%)** | **30/30** | **30/30** |

**93% of re-entries landed in exactly the range Rimsky calls colourless, and
every record began mezzo *and* ended mezzo** — the one thing the passage names
twice.

That is not a mixing fault. The arc decides a section's energy and a part
re-enters at whatever the arc happens to be doing — which is *whatever is going
on* rather than a decision about the entry. `form.rest` takes parts **out** and
nothing was ever asked about how they come back **in**.

### 2b. WHICH DIRECTION, AND WHY IT IS NOT A RANDOM ACCENT

**Away from the middle, along the way the record is already leaning.** A part
returning while its own line is rising comes back **loud**; one returning as it
falls comes back **soft**. That makes the entry an intensification of the shape
rather than an argument with it — which is the difference between arrangement
and a random accent.

The first and last note of the record get the same treatment, for the same
sentence: a record arrives out of silence, so it opens soft; the last note is
pushed to whichever extreme it is already nearer, because an ending can be a
fade or a slam and the arc has already chosen.

### 2c. AFTER

| | before | after |
|---|---|---|
| re-entries at mezzo | 438 / 472 (93%) | **0 / 472** |
| records beginning mezzo | 30/30 | **0/30** |
| records ending mezzo | 30/30 | **0/30** |

Declared as `entry` on boxcar synth alone. Containment: **300 songs differ, all
boxcar synth; no note, tempo or key moved** — this pass changes only how loudly
an existing note is played, which is what an arrangement decision looks like in
the snapshot.

### 2d. AND THE BOOKENDS ARE PER PART, WHICH THE BATTERY DECIDED

The first draft took the record's globally first and last pitched event. The
check *"a rack set to none plays nothing, **and moves nothing else**"* went red
on `boxcarsynth/keys`: muting one rack changes **which note is first**, so the
bookend rule landed on a different role — a silenced box editing a part it does
not play.

That law is right, and the fix is not a weakening of Rimsky. **A part's first
note is an entry after an infinite rest** — the same sentence as the re-entry
rule itself — so applying the bookends per part is more consistent, not less,
and it decouples the roles completely. The record's own first and last note are
still covered, because they belong to a part.

---

## 3. WHAT IS STILL NOT BUILT, FROM THE SAME TWO SECTIONS

Stated so the next session does not have to re-derive it:

- **§8, the crescendo by accumulation.** *"The intermediate intervals are filled
  up by the introduction of fresh parts as the distance widens."* One state
  variable — the span between the outermost voices — spawning a doubling when a
  gap exceeds budget, and on the way down killing them in reverse while pinning
  one stationary middle voice. `build.enter` adds whole **parts**, which is
  blunter by an order of magnitude.
- **§8, two slopes.** The second group enters pp and crescendos faster; *"the
  crossing of the curves is the perceived growth"*. The ladder's stagger is
  built; the two-ramp shape is not.
- **§8, short vs long.** A build shorter than about eight bars should move gain
  only; anything longer must add voices. Nothing distinguishes them today.

---

## 4. THE GUARD — `harness/probe_arrange.js`

Asserts, for a genre that declares the rule:

1. no part comes back from a long rest at mezzo
2. no record begins mezzo
3. no record ends mezzo
4. the tune and the chords are never the same colour

Reports for every other genre. **It has been watched failing** — against a build
that keeps both declarations and breaks both mechanisms: 438/472, 30/30, 30/30,
2/16, exit 1.

---

## SOURCES

- `docs/genre-research/score-craft.md` §7 and §8 — Rimsky-Korsakov,
  *Principles of Orchestration*, quoted verbatim there with its own provenance
  notes on what is doctrine and what is a scoped observation
- every number above is measured from this build or the one before it; the four
  velocity levels in `entry` and the `restBars: 4` threshold are [CHOSEN]
