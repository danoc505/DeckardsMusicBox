# Effects in time: what a DAW does with a send that this program cannot

`THE-ALTERATIONS.md` catalogues WHICH moves exist. `BUILDING-THE-ALTERATIONS.md`
§1 says through which CHANNEL a move is delivered. Neither asks the third
question, which is the one the owner asked: **what shape does a move have in
time?**

This program's answer today is: none. A treatment is a state the desk is
switched to, held for a span, and switched away from. Every effect it has is
either off or at its one and only intensity.

---

## 1. What the literature actually describes

Four devices, and they are not four flavours of the same thing — they differ in
their shape in time.

**A · THE SAME EFFECT AT DIFFERENT AMOUNTS PER SECTION.** Not on or off:
*more*. "The chances are that the whispered vocal in the quiet intro won't need
exactly the same amount of reverb as the screaming in the last chorus"
(soundonsound.com, "Creative Mix Automation In Your DAW"). The effect is
present throughout; what changes is how much.

**B · THE EFFECT THAT BUILDS.** A directional ramp across bars or sections,
arriving somewhere. "Draw in a tremolo that gets steadily deeper and faster as
each chord decays" (the same); a filter "automate the cutoff frequency rising
from its lowest point over four or eight bars approaching the drop"; reverb
send "gradually increase it as you approach the chorus, creating a swelling
effect". The point is the DIRECTION, and that a listener can feel where it is
going.

**C · THE BUILD THAT IS THEN TAKEN AWAY TO LAND SOMETHING.** The one the owner
named, and the sources describe it as one gesture rather than two: "a
particular sound in the mix or the entire mix itself becomes more and more
effected with reverb or delay over time, building towards a drop moment,
whereby the entire effect is removed to slam everything back in". The
"snap the filter back to fully open at the moment of the drop — the contrast
makes the drop feel enormous". **The removal is only worth anything because
of the build before it.** A drop with no build is just a quieter bar.

**D · THE EFFECT HELD BACK FOR ONE PLACE.** "A send to a special effect is
activated for the last section only" (soundonsound.com). Scarcity as the
device: the ear registers it because it has not heard it.

And the throw, which is B and C at the scale of a phrase rather than a section:
producers "automate a reverb send to ramp up on certain words or at the end of
phrases", or send "certain words or syllables to a separate delay on a return
channel" (waves.com; splice.com, "5 Mix Automation Tips").

---

## 2. What this program does, and the line that stops it

**A treatment is a fixed multiplier on the genre's desk.** Not a range, not a
depth — a constant, written into `specOf` in `src/stage/treat.ts`:

    case "darken":
      pole: { hz: clamp(S.rack.pole.hz * 0.45, ...) },
      tape: { lowpassHz: clamp(S.rack.tape.lowpassHz * 0.7, ...) }

`darken` is `× 0.45` on the pole in every record, in every section, forever. So
is every other move: `widen` is `× 1.35`, `waver` is `× 1.7`. **There is one
darkness.** Device A is therefore impossible — the desk cannot be a little dark
in the verse and very dark in the last chorus, because "dark" is one number.
And B and C are impossible for the same reason: a build needs somewhere to
build TO, and a treatment has only its single state.

The program has two things that look adjacent and are not:

- **`drift`** (`arrangement.drift`, read in `perform.ts`) ramps a treatment's
  arrival across a share of its own span. That is a fade-in on one switch, not
  a build across a record: it always ends at the same fixed state, and it is
  gone by the next span.
- **`motion`** (`src/sound/motion.ts`) runs free cycles on knobs by path. It is
  continuous, which drift is not — but it is CYCLICAL. A sine on the tape drive
  returns to where it started by construction. It has no direction, so it can
  never arrive anywhere, and device B is entirely about arriving.

So the record's desk has exactly two temporal shapes available: a switch, and a
wobble. It has no ramp that goes somewhere and stays.

## 3. Is that a law or an accident?

`treat.ts`'s header states the rule that appears to forbid this:

> IT IS A PURE FUNCTION OF THE GENRE'S OWN DESK, and absolute rather than
> relative. Span seventeen's desk depends on the base and its treatment and on
> nothing that happened before it, so treatments cannot compound, drift, or
> depend on the order they were applied in. Run the record from the middle and
> it sounds the same as running it from the top.

**That rule is real and it is not the blocker.** Read it precisely: what it
forbids is HISTORY — accumulation, order-dependence, a desk whose state is the
sum of what came before. Those would break block-size independence and the
promise that a record can be rendered from the middle. All of that should
stand.

A depth that is a function of WHERE THE SPAN IS is none of those things. A
treatment applied at, say, 70% of its full travel because its section sits at
0.7 of the record's arc is:

- **absolute** — it depends on the base desk and an address, not on a running
  total;
- **order-independent** — computing span seventeen never requires span sixteen;
- **identical from the middle** — the address is known without playing anything
  before it.

So the thing that actually stops device A, B and C is the SIGNATURE:

    export function specOf(name: Treatment, S: SoundRules, only?: Role)

There is nowhere to say *how much*. That is an accident of how the first
version was written, exactly like `let best` was for `MAX_PICKS` and
`ROLES.length` was for the band's ceiling — the third of the same species found
in this repository, and the same tell each time: a limit with a good reason
written beside it, where the reason turns out to govern something adjacent.

## 4. What would have to change, smallest first

**A depth argument, and one caller that varies it.** `specOf` and `deskOf`
take a `depth` in 0..1; every leaf interpolates from the genre's own value
toward the move's full travel rather than jumping to it. At depth 1 every
record is bit-identical to today, which is the migration and the test.

That alone buys device A: the arrangement already knows each span's section
energy and its position in the arc, so the same move can be slight early and
full at the peak. **It buys nothing on its own for B and C**, and it should be
measured before either is attempted — this repository's own record says one
balance change at a time.

**Then B, as a shape on the span rather than a new mechanism.** A span already
carries its treatment and `drift` already ramps within it; a build is the same
ramp read across a run of spans that share a treatment, with the depth rising
toward the end of the run. It is a function of the span's index within that
run — still an address, still no history.

**Then C, which is the one worth the most and costs the least once B exists.**
The sources are explicit that the removal is the payoff of the build, and this
program already has the place to put it: the peak. A build through the section
before the peak, and the treatment absent at the peak's first span, is device C
exactly. Note that this program's peak law currently says the change at a peak
is expression only — dropping a desk move INTO the peak is a change of desk,
not of density, so it does not conflict, but it must be checked against
`arrange.ts`'s peak rules rather than assumed.

**D is nearly free and is not built either.** A treatment reserved for one
section is a freshness rule with the sign flipped: instead of wearing out with
use, a move is worth MORE where it has never been heard. `keyOf`/`fresh`
already counts uses; a "held back" move would read the same counter.

## 5. What this does not settle

Nothing here is measured, and none of it is built. In particular:

- **How much depth variation is audible** is unknown. Half of lofi's vocabulary
  already sits 17 dB below its own `darken` (`TALLY.md` §2); a move at 40% of a
  travel that is already inaudible is a knob that does nothing, with an extra
  parameter. **Depth must be measured in dB per genre before it is used as a
  musical device**, with `tools/treatments.ts`, which already renders a
  treatment on and off and reports the distance.
- **Whether a build reads as a build** cannot be measured at all. It is the
  §0 problem again: nobody has listened.

## Sources

- soundonsound.com, "Creative Mix Automation In Your DAW" — per-section
  amounts, the tremolo that deepens, the send activated for one section only,
  the dance-music filter sweep
- splice.com, "5 Mix Automation Tips" — delay and reverb automation across an
  arrangement, throws on a final phrase, reverb "for key moments like
  transitions"
- waves.com, "4 Famous Vocal Mixing Tricks Using Reverb and Delay" — the throw
  as a send ramped on particular words or the ends of phrases
- unison.audio, "Reverb Automation 101" — reverb send low in verses and pushed
  up in the chorus; automating decay and dry/wet so the space opens
