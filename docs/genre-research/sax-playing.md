# How a saxophone is actually played — 2026-07-31

*Asked: "research how to synthesize the sax sounds, the current ones are bad… you also
need to study the way a sax is played." This is the second half of that — the first
half, where the samples are, is in `sax-sources.md` and is revisited at the bottom.*

---

## The finding that reorganised the instrument

The old voice was not bad because of its oscillator. It was bad because **it played
every note as if it were the first note of a phrase**: a scoop up into the pitch, a
burst of breath noise, and a full attack, on every single note, forever. No player has
ever done that.

The measurement that makes this the priority rather than an opinion:

> Listeners asked to name the articulation of a recorded saxophone confuse **legato with
> portato about 25% of the time** — saxophonists themselves 18%, non-musicians 32% — and
> confuse **staccato with either of them less than 1% of the time**.
> — [Production and perception of legato, portato and staccato articulation in saxophone
> playing](https://pmc.ncbi.nlm.nih.gov/articles/PMC4097958/) (PMC4097958)

Read backwards, that is a specification. The ear is not identifying a saxophone from the
spectrum of one note — it cannot even reliably tell two of the three articulations apart
that way. It is identifying it from **what happens between notes**, and the one thing it
never gets wrong is whether there is a gap. So articulation outranks timbre, and an
engine that gets articulation wrong cannot be rescued by a better oscillator or by a
sample library.

## The numbers, and which are proportions and which are gestures

| | what it is | measured |
|---|---|---|
| **portato** | tongue touches the reed, note restarts | **25.5 ms** contact (SD 4.1) — **does not vary with tempo** |
| **staccato** | note released early | silence is **25–29% of the inter-onset interval** (0.29 slow / 0.27 medium / 0.25 fast) |
| **legato** | no tongue contact at all | the airstream **never stops**; only the fingers move |

The split between those two rows is the useful part, and the program is built on it:

- 25.5 ms is a **physical gesture**. It is a constant in the voice.
- 25–29% is a **musical proportion**. It scales with tempo, so it lives on `artic` in
  stage 5 next to the bass's, where a note's length is turned into seconds.

Getting that backwards gives you a staccato that vanishes at fast tempi or a tongue that
gets slower as the music does.

Timing precision, for reference: coefficient of variation **0.11** overall.

## The other three things a player does that a synthesiser does not

**Slur stepwise, tongue after a leap.** The embouchure has to be re-seated across an
interval and does not across a second. This is why articulation in the program is read
off the melodic contour rather than sprinkled from a distribution — the line decides.

**"90 per cent air attack and 10 per cent tongue."**
([tamingthesaxophone](https://tamingthesaxophone.com/lessons/tone-sound/articulation-tonguing),
[getyoursaxtogether](https://www.getyoursaxtogether.com/blog/articulation1)) The air
attack is the start of *the air*, and inside a phrase the air is already going. A player
breathes once per phrase, not once per note.

**Vibrato is late, and it goes downward.** Two separate points, and the second is the one
every synthesiser gets wrong:

- Jazz vibrato is *terminal*: "the note starts without vibrato and then it's added in",
  where a classical player's "should begin immediately and continue for the duration of
  the note". ([dansr](https://www.dansr.com/resources/saxophone-vibrato-exercises-and-insights-for-jazz-and-classical-performers))
- It is made with the **jaw**: "the jaw is lowered and raised similar to chewing, which
  reduces embouchure pressure allowing the tone to go slightly **flat**, and when the jaw
  returns to normal position, the pitch returns in tune."
  ([tamingthesaxophone](https://tamingthesaxophone.com/lessons/tone-sound/saxophone-vibrato))

So the pitch swings between the written note and something *under* it. An LFO on `detune`
straddles the note symmetrically, which is an organ, not a horn. The program biases the
oscillator up by half the depth and swings a full depth about that, so the top of the
swing is the written pitch.

## What was built

Stage 3 gained `articulate()`, which runs on every theme the way `acidize()` runs on
every bass — an articulation is a relation between a note and the one before it, so it
cannot be decided until the line exists. It writes `art` (`breath` / `legato` / `portato`
/ `staccato`), `from` (the pitch a slur glides out of), and `vib`.

`V.sax` then branches on all four, and gained: delayed downward jaw vibrato,
register-dependent brightness (the bottom of the horn is fat, the top is thin — subtone
is a real thing and it is where the breath becomes audible *in* the tone), and breath
noise that is full at a phrase start, a third of that on a tongued note, and **absent on
a slur**.

Measured after, 30 seeds × 7 genres, 58,712 lead notes:

```
  38.3% start a phrase · 46.9% slurred · 7.1% tongued · 7.7% detached
  19.1% carry vibrato · 46.9% glide from a named predecessor
```

Before: 0% slurred, because there was no articulation model at all.

## The samples question, revisited honestly

The user's instruction was: *"I think there is free ones out there, this is a personal
program no distribution."* Both halves are right, and the licence objection in
`sax-sources.md` is answered by the second half. Permissively-licensed sax samples do
exist:

| source | licence | notes |
|---|---|---|
| **University of Iowa MIS** | free, no restrictions | 3 real dynamic layers × vib/novib. Filenames carry the pitch. |
| **VCSL / FreePats** | **CC0** | confirmed to contain saxophone; FreePats' bank is derived from it |
| **Weresax (Karoryfer)** | free | 256 samples, 2 velocity layers + 2 round robins |

**Why the program is still synthesised, stated as a cost rather than a principle.** The
HTML is 2.14 MB, of which 1.07 MB is already base64 audio (the Gretsch kit — one hit per
lane). A pitched multisample is a different order of payload: 33 semitones × 3 dynamics,
even at 22 kHz mono, is roughly **8 MB of base64**, which roughly quadruples a single
file that has to load over mobile data on a phone. That is the trade, and it is a real
one, not a licence excuse.

And the finding at the top says it would not fix the complaint on its own. A sampled sax
with no articulation model re-triggers a recorded attack on every note, which is the
*same defect* this pass just removed, with a more expensive waveform. The phrasing had to
be built either way; it is built now, and if the samples go in later they inherit it.

**If the payload is acceptable, Iowa is the one to take** — three genuine dynamic layers
is the thing a model approximates least well, since a saxophone's dynamic is timbral
rather than a fader.
