# THE JOURNEY — a second form builder, `2026-08-17`

*The owner: "The train ride is the conductor, it is what sets the pace, it is
what tells the orchestra where it is, the orchestra waxes and wanes with the
ride, the 20 min song is broken into 4 pieces dissected by the train stops."*

And: *"This new genre IS NOT a copy of the old — corrected, it is built from the
ground up NEW! NEW code not the old!"*

So this is not a mode of the existing form walk, not a phase list fed into it,
and not a flag on it. It is **a second stage 2**.

---

## 1. WHAT THE WALK IS, AND WHY IT IS THE WRONG MACHINE HERE

`makeForm` builds a **song**: a grammar walk over section functions, with hard
laws about which function may follow which (a pre-chorus must reach a chorus; a
bridge must have something to depart from), a target length walked toward, and
an energy arc *drawn* and laid over the result.

Every one of those is right for verse-chorus-verse and beside the point for a
trip. A journey does not ask what may follow a verse. It asks **where the train
is**, and everything else is downstream of that answer.

`makeJourney` therefore reads none of it — not the transition weights, not the
laws of succession, not `apexAt`, not the plan phases, not the bisection search
the walk needs to hit a length. A genre declares `form.journey` or it does not,
and the two builders share an **interface**, not machinery.

---

## 2. WHAT A JOURNEY IS MADE OF

| | |
|---|---|
| **the leg** | a stretch of travelling, about five minutes of it: its own lead instrument, its own terrain, its own character, and a tempo that accelerates out of the platform behind, holds at cruise, and brakes into the one ahead |
| **the stop** | the ceremony between two legs, and a movement in its own right — **solo X → the dance → solo Y → pulling out** |
| **the ends** | a departure before the first leg, an arrival after the last |

### 2a. HOW MANY LEGS IS ARITHMETIC, NOT A DRAW

The owner's own sum: five minutes is one leg, twenty is four, forty is eight.
Measured, `probe_journey`:

```
5:00 → 1 leg    10:00 → 2 legs    20:00 → 4 legs    40:00 → 8 legs
```

That is also why this builder needs no bisection search. The walk is *walked
until it happens to reach* a length; a journey is **built to one**.

---

## 3. THE FIVE FIELDS A JOURNEY'S SECTION CARRIES

A section of a trip knows things a section of a song does not:

- **`leg`** — which leg, 0-based; null inside a stop
- **`legPos`** — how far through it
- **`atStop`** — which stop, 0-based; null while travelling
- **`terrain`** / **`character`** — what is under the train, and the hour
- **`hand`** — the machines this section's chairs are handed

And form hangs **`ride[]`** on itself: **where the train is, per bar** — 0 at the
platform behind, 1 at the platform ahead, −1 while standing. Derived from the
bar layout rather than from the section index, so a leg whose sections are
uneven still reads as one even stretch of track. It is the one owner of that
fact, and the tempo ramp reads it; the seating will too.

---

## 4. THE HANDOVER

> *"The instrument that held X and the instrument that will hold Y = solo X -
> Dance X,Y - solo Y - train begins movement again."*

One lead per leg, drawn from the genre's pool, **never the same twice running**
— and refused rather than re-drawn, because a re-draw would make the number of
dice rolls depend on the outcome [Law 7].

`sec.hand` reaches `sec.machines` as a **fourth source**, after the swap coin,
the ladder rung and `setMachines`, and it outranks all three: a handover is the
record's architecture, not a novelty. It still yields to a hand on the rack — if
you loaded an instrument deliberately, the train does not take it off you at the
next station.

### 4a. AND THE CHAIR HAS TO BE IN THE ROOM

**Measured the first time the handover ran:** the stop's solo sections were
handed the outgoing lead and played 2 to 4 instruments, *none of them it*.
`sec.hand` says which machine sits in a chair; `form.roles` says whether that
chair plays here — and the two disagreed, so the record announced a solo and the
soloist was not on the list.

This is the same defect the file already fixed for a hand-loaded machine ("load
a saxophone, hear silence") and it takes the same answer: a deliberate placement
is not a suggestion. Applied **after** every draw over the active set, exactly
like the ground, so no rest or thin draw shifts.

---

## 5. THE PACE

`journeyTempo` reads **`ride[]`**, not section names. Two sections with the same
name are at different speeds if one is pulling out and the other is braking, so
"what is this called" is the wrong question.

```
out → cruise → into      multipliers at the platform behind, mid-leg, and ahead
stop                     what it holds while standing
```

Cosine between them, so the change is a **ramp**: a train that changed speed on
a section boundary would be a gearbox.

Normalised by the same law as the V2-2 arc — the mean seconds per bar is the one
the drawn tempo gives, so the leg budget worked out in bars is the budget the
record actually spends.

---

## 6. THREE FAULTS FOUND BY BUILDING IT

### THE RULE OF THREE, ON THE FIRST RUN
Two legs meet and the record is refused before it is heard: the first leg's
cruise ends on a verse, the stop pulls out on a verse, the next leg opens on a
verse. `composeSong` throws on a triple, for every genre and every builder.
`put` now **substitutes** from the alternatives the caller would accept — a
substitution, not a re-draw, so it consumes no randomness and nothing about the
leg depends on the collision.

### THE STOPS WERE NOT BUDGETED — 27:40 FOR A TWENTY-MINUTE RECORD
The leg count was right and the legs were the right length, and then three stops
of forty-eight bars each were laid between them. **The same fault the cadential
extension had in phase 5, in a new place:** a length dial cannot be honoured by
counting only the part of the record you thought of first.

Fixed twice over — the fixed costs come out first, and each leg is measured
against **what is actually left at that point**, so an overshoot in leg one is
paid back by leg two. Plus the fill takes a section only while more than half of
it fits, which is rounding rather than flooring.

Result: **19:52 to 20:19** for twenty minutes, and within 4% at every length.

### A STOP THE RECORD CANNOT AFFORD IS A STOP IT DOES NOT MAKE
With a long ceremony at a slow tempo the train spent **64% of the journey
standing at a platform**, and every leg was squeezed below the length of its own
opening. The honest answer is fewer stations, not shorter legs: the leg count
gives way until every leg gets its minimum stretch of track. A five-minute
record with a two-minute ceremony is one leg and no stop — a real short journey
rather than a long one with the travelling cut out.

---

## 7. THE GUARD

`harness/probe_journey.js`, in the battery. **No genre declares a journey yet**,
so the probe declares one itself — built out of whichever section functions and
machines the genre already has, so it names none [Law 4] — composes at four
lengths, measures, and puts the table back.

Seven claims: **inert**, **count**, **length**, **stops**, **ceremony**,
**handover** (different instrument, *and* the soloist actually in the room),
**pace**.

**Watched failing against eight deliberately broken builds**, each caught by the
claim meant for it:

| broken | caught by |
|---|---|
| the leg count made a constant | COUNT |
| a stop laid after the last leg | STOPS (and LENGTH, and CEREMONY) |
| the ceremony put out of order | CEREMONY |
| the same instrument handed to itself | HANDOVER |
| the handed chair left out of the room | HANDOVER — the soloist is silent |
| the tempo flattened across a leg | PACE |
| the leg fill allowed to overshoot | LENGTH, 8% |
| a fixed share per leg, stops unbudgeted | LENGTH, **24%** |

**And a ninth break passed, which was the useful one.** Zeroing the fixed-cost
arithmetic changed nothing at all — because `legBars` was computed and never
read, superseded by the per-leg `share`. A deliberately broken build that
changes nothing is dead code saying so. Deleted.

---

## 8. WHAT THIS DOES NOT DO YET

- **The band does not yet wax and wane with the ride.** The energy arc follows
  the legs, but *who is seated* is still the song machinery — that is the next
  step, and `ride[]` is the seam it will read.
- **The theme does not grow across the legs.** One leg's key and one leg's
  material are still the record's, not the leg's.
- **A leg has no key of its own.** The existing key-lift machinery is the seam.
- **The stop is as long as its section functions are.** Making it "a full minute
  or more" rather than three is the table's job, and the table is written last.
