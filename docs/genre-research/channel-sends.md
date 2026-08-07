# THE CHANNEL STRIP'S EFFECT SENDS — what a desk actually has

*Researched 2026-08-07, on the user's instruction, before putting quick FX knobs
on the mixer: "What are the most common fx knobs, what about reverb, delay,
echo? Do some reaearch".*

---

## 1. HOW MANY SENDS A CHANNEL HAS

> **"Boards typically have between two and six effect sends, often arranged in
> their own AUX section."**
> [[cmtext, *Studio Gear Chapter Two: Mixing Consoles 2*](https://cmtext.com/studio/chapter2_mixers2.php)]

Two to six. **Our desk has five units** — echo, room, flange, DP/4 and the
barberpole — so putting all five on every strip is inside the range and putting
two is also inside it. The range does not decide it; §2 does.

## 2. WHICH EFFECTS A SEND FEEDS — and which it does not

> The aux send signal "is often routed through outboard audio processing effects
> units (e.g., **reverb, digital delay**, compression, etc.)" — and
> **"compressors and other dynamic processors would normally be on an insert,
> instead."**
> [[Wikipedia, *Aux-send*](https://en.wikipedia.org/wiki/Aux-send)]

That is the whole answer to the user's question. **The two effects a channel
strip sends to are REVERB and DELAY.** Time-based effects go on sends because
several parts share one; anything that changes a signal's dynamics goes on an
insert, on that channel alone.

Mapped onto this program:

| the desk says | our unit | why it is the one |
|---|---|---|
| **REVERB** | `room` | the space. Every genre declares `feeds` for it. |
| **DELAY**  | `echo` | the delay line. Every genre declares `echoFeeds`. |
| — | `flange`, `dp4`, `barber` | real units, but not what a strip sends to. They stay on the matrix panel, which is where a desk keeps its less-used routing. |

## 3. WHY A SEND EXISTS AT ALL — and why this needs no new effect

> "A benefit of using an aux-send is that it enables the signals from multiple
> channels on a mixing console to be **simultaneously routed to a single
> outboard device**. For instance, audio signals from all the channels of a
> sixteen-channel mixing console can be routed to a single outboard reverb unit
> so that all channels are heard with reverb."
> [ibid]

This is exactly what `MATRIX` already is: rows of sources, columns of units, a
gain at every crossing. **So the quick FX knobs are not a new effect and not a
new bus** — they are the crossings this program already has, shown on the strip
that owns them. One owner, two ways to reach it, the same as the KAOSS pad
reaching the echo's tone and the drum loaders reaching a lane's voice.

## 4. PRE-FADER OR POST-FADER — THE SOURCES DISAGREE, AND WE HAVE A MEASUREMENT

The definitions are not in dispute:

> **Pre-fader**: "the signal is sent out at a strength determined only by the
> effects send pot and not affected by the channel fader."
> **Post-fader**: "both the effect send pot and the channel fader affect the
> overall strength of signal sent to the device."
> [[cmtext](https://cmtext.com/studio/chapter2_mixers2.php)]

The recommendation is:

- **For post-fader**: the dry and wet stay in proportion however you ride the
  fader — "after you dial in an initial amount of reverb on the send, no matter
  how much you ride the volume level of a part while mixing, the dry and wet
  signals will always be in proportion to one another"
  [[Sweetwater, *Pre-Fader, or Post-Fader?*](https://www.sweetwater.com/insync/pre-fader-post-fader/)].
- **For pre-fader**: independence — "you are free to raise or lower the fader
  without influencing the level that is being sent to the auxiliary track", and
  the article states plainly that "in the context of mixing, using a pre fader
  sent is preferred over post fader"
  [[ProducerHive, *Pre Fader vs Post Fader*](https://producerhive.com/ask-the-hive/pre-fader-vs-post-fader-examples/)].

**They contradict each other and it would be dishonest to quote only the one
that agrees with me.** So the tiebreaker is this repo's own measurement, which
is not an opinion:

> The drum kit's echo, reverb and gate sends were **pre-fader** while its dry
> path was post-fader. Reported and confirmed: pulling the kit down made it
> **wetter relative to itself**. `BACKLOG` §0b.1, fixed at `2026-08-07` —
> `applyMixer` now drives `g.dSendEcho` / `dSendVerb` / `dSendGate` from the
> same channel gain as the dry path.

**POST-FADER**, therefore, and the reason is measured rather than argued: this
program's fader is a BALANCE control, reached when something is drowning
something else, and a balance control that changes the wet/dry ratio is doing
two things at once. ProducerHive's case for pre-fader is a *tracking* case —
headphone cues and parallel compression — and this program has no tracking
stage, no cue mix and no performer to feed.

## 5. WHAT THIS DECIDES

1. **Two knobs per strip: REVERB and DELAY.** [§2]
2. **Post-fader**, driven by the same channel gain as the dry path. [§4]
3. **No new effect and no new bus** — the strip shows the matrix crossing that
   already exists. [§3]
4. **One send per PART, not per bus.** Not from the sources — from the user:
   three strips share one send today and two more share another, so an echo
   knob on `chords 2` would wet `chords` and `figure` as well. A send that moves
   three parts is not the control its label promises.
