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


---

## 6. POSTSCRIPT — THE TAPE IS NOT A SEND

*Added 2026-08-08, when the tape machine was built.*

A tape is not on an aux. **The whole record goes through it or none of it
does** — which is the same argument §2 makes about compressors, one step
further along: a send exists so several parts can share one unit, and there is
nothing to share when the unit is the medium the record was cut to.

So the tape is an **insert on the master path**, after the desk and before the
limiter, with a three-way POWER switch (the genre decides / off / on) rather
than a wet-dry blend. A pitch effect at 50% wet is two copies of the record a
few cents apart, which is a chorus, not a tape.

---

## 7. THE SEND MASTER, AND THE KNOB THAT SAT AT THE TOP OF ITS TRAVEL

*Researched 2026-08-08, from the user's report: "All the instrument [strips']
FX reverb and the other at the highest setting on all songs at all times,
moving the knob does nothing at all." Both halves were true. This section is
the sources on why, and it is the section that says the resting position was
wrong.*

### 7.1 WHAT WE HAD, MEASURED FIRST

A part's send knob was its **share** of a per-bus send master, and a share
opens at full — so:

- every send knob on every strip of every genre read **1.00**, on the glass,
  which means the knob could never say anything about the record;
- and the master is **0** on any bus the genre does not feed. A share
  multiplying into a zero cannot change the sound in either direction.
  **MEASURED: 56 of the 82 part/send knobs across the eight genres**, including
  every drum and bass REVERB on most of them;
- worse, the record surface's row into both effect columns is a pair of BLIND
  PLATES, so its two knobs were connected to **nothing whatsoever**.

### 7.2 A CHANNEL SEND RESTS AT MINIMUM. EVERY MANUAL SAYS SO.

This is the finding that decided the fix, and it is unanimous across every
console manual read:

> "These four knobs tap a portion of each channel's signal… **They are off when
> turned fully down**, deliver unity gain at the center detent, and can provide
> up to 15 dB of gain turned fully up."
> — [Mackie, *1642VLZ4 Owner's Manual* §35](https://mackie.com/img/file_resources/1642VLZ4_OM.pdf)

> "**Zero the controls.** Fully turn down all the knobs and faders to minimum,
> except for the channel EQ and pan controls, which should be centered."
> — [ibid, *Getting Started*] — the carve-out is EQ and pan; sends are not in it.

> "**AUX SENDS** These rotary controls adjust how much channel signal is mixed
> to the aux outputs… **They adjust from fully off to +6dB boost. Unity gain
> 0dB is marked at 3 o'clock position.**"
> — [Allen & Heath, *MixWizard WZ3 14:4:2 User Guide*](https://allen-heath.com/content/uploads/2023/07/W3UG_1442_AP5332_3.pdf)

> "Turn the TRIM, **AUX send** and fader controls **fully down**."
> — [Mackie, *CR1604-VLZ Owner's Manual*, Level-Setting Procedure](https://www.evl.uic.edu/xevious/av/manual/MACKIE_CR1604VLZmanual.pdf)

**No source anywhere describes a channel send whose resting position is
maximum.** A knob pinned at the top of its travel on every song was a departure
from the idiom, and nobody had noticed because it looked like a full-open
default rather than like a control with nothing to say.

### 7.3 THE SEND MASTER, AND THE CLASSIC GOTCHA — which is exactly our bug

> "The aux send master section controls the total amount of signal being sent
> out to each of six aux devices, **combining all the channel aux send amounts**
> mentioned above for each individual aux send bus… The process begins with the
> input channel strip aux send pots, which next go through the aux send master
> pot and into the effects box."
> — [cmtext, *Studio Gear: Mixing Consoles 5*, Jeffrey Hass, Indiana University](https://cmtext.com/studio/chapter2_mixers5.php)

and, on the same page, the failure mode in one sentence:

> "**Novice users often forget to turn up the aux send masters and consequently
> no signal is sent to the aux device.**" — [ibid]

That is our defect, stated by a source that has never seen this program: two
level controls in series, and the downstream one at zero. Confirmed
structurally by the manuals:

> "Aux sends 1 and 2 levels are controlled **not only by the channel's aux
> knobs, but also by the aux send master knobs**." — [Mackie 1642VLZ4 §35]

> "The AUX out is taken from **after** the AUX MIX master level control…
> Adjusts the level **from off (fully attenuated)** to +6dB gain."
> — [Allen & Heath, *ZED-10 User Guide*](https://www.allen-heath.com/content/uploads/2023/06/AP7880_1ZED10_UserGuide_A5.pdf)

### 7.4 AND WHY PER-PART AMOUNTS ARE THE POINT

> "It's important to realize that the channels on a mixer share aux sends…
> **Even though all the channels share the bus, you use the aux send knobs to
> independently control the amount of effect for each individual channel.**"
> — [Yamaha, *Aux Sends and Returns*, Steve La Cerra](https://hub.yamaha.com/proaudio/livesound/aux-sends-and-returns/)

> "**You've got 20 audio tracks, and they all need reverb in differing
> amounts.**"
> — [Sound On Sound, *Using Aux Sends & Returns*, Robin Bigwood](https://www.soundonsound.com/techniques/using-aux-sends-returns)

> "**Use the aux sends on the input channels to send as much or as little
> signal as desired from each to the reverb master. Then use the reverb master
> channel level to control the overall level of reverb.**" — [cmtext, ibid]

That last line is the division of labour this program now has, and it is the
one §4 of this sheet already argued for from the user's side.

### 7.5 WHAT WAS BUILT

**The knob is the send itself, not a share of an invisible master.** It opens
at what this song sends that part's bus — 0 where the genre sends nothing,
which is an honest reading of "nothing happens here" — and it can be turned up.

**Turning it up opens the bus master exactly as far as that one part asks**
(`mixSendLift`), and every other part on that bus is then held precisely where
it was by its own share (`applyMixer` divides). The arithmetic:

```
    mb        what the SONG sends this part's bus (the knob's base)
    want_p    clamp(0..1, mb + this part's hand)
    M         clamp(0..1, mb + the largest UPWARD hand on any part of the bus)
    share_p   M > 0 ? want_p / M : 1
```

Nobody's hand on anything → `want = mb = M` → every share is exactly **1**,
which is the wire it replaced, bit for bit.

This is the user's standing ruling one layer down from where `routeBaseFor`
already carried it: *"If I turn a knob it should always work for me no matter
what the genre is. The user is the end of the line."*

**And a strip draws NO knob where the desk has no wire** — derived from
`MATRIX` rather than listed, with the blind plate's own written reason as the
tooltip on the blank.

### 7.6 MEASURED, on the glass, lofi, playing

| | |
|---|---|
| untouched, every part's share | **exactly 1.00** — the old wire |
| an untouched record, this build vs `4605df3` | **−118.5 dB**, against this build's own same-build floor of **−118.6 dB** |
| drums REVERB dragged up | the `drumsRoom` crossing **0 → 0.44**; every other part's effective send unchanged to three decimals |
| keys2 DELAY dragged up | the pad reaches the delay at **0.620** while `keys` and `ostinato` — on the same bus — sit at **0.000** |

That last row is `BACKLOG` §5.2's open item — *"three strips share the keys bus,
so a genre wanting the pad wet and the figure dry cannot say it"* — answered
**from the hand's side**. The GENRE still cannot say it; that row stays open.

### 7.7 WHAT THIS DOES NOT DO, said plainly

- **The genre still has no per-part send.** Only the hand does. `BACKLOG` §5.2
  is narrowed, not closed, and its research pass has not been done.
- **There is no headroom above the song's own send.** The matrix crossing's max
  is 1, so a part the genre already sends at full can only be turned DOWN. The
  sources give real boost above unity (Mackie +15 dB, A&H +6 dB); we do not.
  `[EAR]` whether that is ever wanted.
- **The matrix panel's own knob does not show the lift.** A hand on a strip
  opens the crossing without moving that crossing's knob, exactly as the
  existing hand-on-a-return-unit rule already does. Consistent, and still a
  place where two displays of one path disagree by a hand's worth.
- **Nobody has listened to any of it.** Every number above says the control
  exists and reaches the graph. None says the record sounds better.
