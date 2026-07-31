# Autechre, and the polymeter Plastikman had only ever claimed — 2026-07-31

*Asked: "research Autechre, this is to make our minimal techno correct because it is not
correct currently." I first read that as a request for a separate genre and was told
plainly: **"I said that Autechre is meant to improve Plastikman, both are minimal
techno."** That is the right call, and the Plastikman table itself is the evidence.*

---

## The finding that made the correction obvious

The Plastikman entry has carried this note on its breakdown since the day it was written:

> "Now all you've got is this **polymeter** and because it doesn't line up with the one,
> people on the dance floor are going 'oh where was the one again'"
> — [corpus:underdog]

**And the engine could not produce a polymeter.** Every drum lane in this program was
written against the bar — a step list inside sixteen, or a division of sixteen — so the
rimshot on step 11 and the clap on step 7 landed on exactly the same sixteenth in every bar
of the record, forever.

**Measured before the change: 0.0% of Plastikman's drum lanes differed from one bar to the
next.** Nothing in the genre had ever failed to line up with the one. The quote described
something the code did not do, which makes it decoration — and the section built to sound
unmoored was the most locked thing in the genre.

So the Autechre research did not need a new genre to live in. It needed to go where a
table had already asked for it and been unable to say so.

## What Autechre gave the engine

> "Using polymetres in electronic music can be as simple as **changing the pattern length
> for only some parts while leaving most at the default bar-long 16 sixteenths**, and
> independent step sequencers with arbitrary pattern lengths make this especially easy to
> do without having to think about the maths involved."
> — [Zoe Blade's notebook](https://notebook.zoeblade.com/Polymetre_and_polyrhythm.html),
> whose worked example is **Autechre using a shorter pattern length on the MC-202 in
> "Windwind"**

> They use control voltages to skip steps and cascade sequencers with different timings,
> "to create complex polyrhythmic results that appear chaotic but **follow quantifiable
> rules**." — [Sound On Sound](https://www.soundonsound.com/people/autechre)

> "Rhythm is everything to us. A note is just a sound played for a different length at a
> different pitch." — Sean Booth, [MusicRadar](https://www.musicradar.com/news/autechre-classic-interview)

That is the same technique Hawtin is describing when he says the record is made by "getting
the machines running and then jamming out live" — two boxes whose patterns are not the same
number of steps long.

`kit.poly` gives a drum lane its **own length**, counted in absolute steps so it carries
across the bar line. It is a table entry, not a rule — it defaults to nothing, so no genre
that does not declare one moved by a sample — and it contains no random draws, so it cannot
displace any later draw on its stream.

## What Plastikman got

**The rimshot and the clap came off the grid.** They were fixed at steps 11 and 7; they are
sequencers now, at **7 and 5**, both coprime with sixteen, so they phase against the
four-on-the-floor and against each other and come home only when the four-bar loop does.
Hawtin: *"I always liked to have two different types of claps, and I was always into really
small rimshots"* — those are the two voices this genre is about, and now they move.

The kick and the hat stay on the grid **on purpose**. The one has to be there for the
polymeter to be heard pulling away from it.

**The variants use pattern length as their dynamic.** The lift shortens both sequencers (5
and 3) instead of adding a lane — *"how much you can do with the least amount"* applied to a
sequencer length rather than a step list. The breakdown drops the clap entirely and stretches
the rim to **11**, the longest pattern in the genre.

**The ostinato runs across the bar line.** The bridge role list is `["ostinato"]` and nothing
else — that section *is* "all you've got is this polymeter" — and with the cell index
restarting every downbeat it agreed with the bar perfectly: eight positions per bar, a
four-note cell stating itself twice, every bar identical. `run: true` carries the index
across bars, and two new cells of length **5 and 7** neither of which divides eight. The
four-note cells stay, because a 303 figure that states itself cleanly is still this music —
and with `run` on they are the ones that *do* line up, which is what makes the odd ones
audible as odd.

**A second rack.** Minimal techno is not one set of boxes. `plastik` (808 + 303) stays the
heavy favourite at 7:3; `ae` is the same genre with sequencers in the pitched slots instead
of a filtered saw — wave-sequencer on the ostinato, Reese on the bass. A rig changes *who
plays*, never *what is played*, so this widens the record without touching a note. Measured
over 200 seeds: plastik 135, ae 65.

## Measured after

Reconstructing each lane's true period from the notes — the smallest `p` that explains every
onset across the four-bar material:

```
  plastikman — the period actually written into each lane:
    clap     13 hits   period  5   <- never lines up with the bar
    hat      32 hits   period  2
    kick     16 hits   period  4
    openhat   4 hits   period 16   = the bar
    rim       9 hits   period  7   <- never lines up with the bar
```

Across 12 seeds and all four materials: **84 of 228 drum lanes run at a period that never
lines up with the bar** (rim at 5/7/11, clap at 3/5 — the main, lift and depart variants).
The control is acid — an 808 and a 303, same tempo range, built the ordinary way — at
**0 of 246**.

### One thing the check got wrong first

The first predicate was "period does not divide 16", and acid failed it with an `openhat` at
period **32**. That open hat plays on bars 1 and 3: it lines up with the bar perfectly well,
it just takes two of them to come round. A period that is a *multiple* of 16 is a multi-bar
pattern, not a polymeter. A lane fails to line up only when its period neither divides 16 nor
is divisible by it.

The blunter measure — "do bar 2 and bar 1 differ" — is not the test either, and the same
control shows why: a ghost drawn per bar, a crash on bar 0 and an open hat on two bars out of
four all make bars differ with no metre involved. Acid reads 15% on that measure and 0 on
this one.

## Two bugs this exposed, both pre-existing

**The blend's group ownership was a position, not a genre.** Fields that only mean something
together (`bassStyle` with `bassPulse`) are grouped so they come from one genre — but the
group stored an *index into a filtered list*, filtered per field since genres skip fields
they do not declare. Chosen against `bassStyle` (all genres have one) and read against
`bassPulse` (DKC has none), every genre after DKC shifted by one, the index ran off the end,
and the fallback returned lofi's `bassPulse: null` under someone else's `"pulse"`. Owners are
recorded as genres now. All-genres-at-once blend went 18/20 → 20/20.

**A `bassPulse.unit` that does not divide 16 lies about its own density.** At `unit: 3` the
builder writes six notes a bar (0, 3, 6, 9, 12, 15) while the density prediction reads
`16/3 = 5.33`.

## What is not claimed

The generative/reactive half — *"one fader determines how often a snare does a little roll or
skip, and another thing listens and says: if that snare plays that roll three times, then
I'll do this"* — is **not built**. Plastikman is polymetric now, which is the structural half;
it is not a system with feedback rules watching its own output. That would be a new kind of
builder rather than a table entry, and it is the honest next step.
