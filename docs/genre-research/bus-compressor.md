# THE BUS COMPRESSOR — a needle you can watch, on the whole record

*Researched 2026-08-08, before building it, on the user's instruction: "A
proper one, on the master, with a needle that shows how hard it's squeezing —
so 'it's too loud and it's fighting itself' becomes something you can watch
and turn."*

---

## 1. WHY IT IS AN INSERT ON THE MASTER, AND NOT A SEND

Already decided by this project's own research, one build ago:

> The aux send signal "is often routed through outboard audio processing
> effects units (e.g., reverb, digital delay, compression, etc.)" — and
> "**compressors and other dynamic processors would normally be on an insert,
> instead.**"
> [`channel-sends.md` §2, quoting Wikipedia *Aux-send*]

A compressor at 50% wet is parallel compression — a technique, not a master
compressor. The whole record goes through it or none of it does, which is the
tape's own argument (§6 of the same sheet), one unit earlier in the chain.

**Where in the chain: after the desk, before the tape.** A bus compressor is a
MIXDOWN device — it glues the balance the desk made. The tape is the MEDIUM
the finished mix is cut to (its own research says "an end-of-line effect on
the whole record"). Squeezing the record after it was already on tape would
be mastering the tape machine's wow, which nobody's signal path does.

## 2. THE SETTINGS THAT MEAN "GLUE" — all sourced

> "Slow attack / fast release is kind of the standard starting point, it
> almost always works for 'glue' with **0.5–2 dB of gain reduction**."
> "The ratio should be **between 2:1 and 4:1, with 2:1 as a good starting
> point**."
> [[Gearspace, *Master Bus/Stereo Bus Compression Settings*](https://gearspace.com/threads/master-bus-stereo-bus-compression-settings.1041004/); same numbers at [Music Guy Mixing](https://www.musicguymixing.com/bus-compression/)]

> "You'll want a **slow attack time that lets the transients through** …
> The attack is slow enough to let the initial transient of a drum hit poke
> through before the compression kicks in, preserving the punch. The release
> is timed to 'breathe' back up before the next major hit … **the meter
> should be returning to 0 dB between kick/snare hits**."
> [[Music Guy Mixing](https://www.musicguymixing.com/bus-compression/); [Produce Like A Pro](https://producelikeapro.com/blog/mix-bus-compression-tips-for-better-mixes-today/)]

So the defaults this unit ships with, each traceable to a line above:

| control | default | from |
|---|---|---|
| THRESHOLD | −14 dB | set so the four declaring genres measure inside the 0.5–2 dB band — **measured, then written, below** |
| RATIO | 2:1 | "2:1 as a good starting point" |
| ATTACK | 30 ms | "slow attack that lets the transients through" — 30 ms is the classic bus-compressor slowest-attack idiom |
| RELEASE | 250 ms | "breathe back up before the next major hit" — a beat at 120–130 bpm is ~460–500 ms |
| MAKEUP | 0 dB | a compressor that quietly makes the record louder is the loudness-war move; the hand can add it |

The KNEE is fixed inside the unit (6 dB, soft-ish): the console bus
compressors this copies have no knee control on the panel, and a knob nobody's
reference has is a knob that invites a setting nobody can name.

## 3. THE NEEDLE — what it shows and how it moves

> The gain reduction meter "moves … as the gain reduction increases", showing
> how much the compressor is pulling the level down; "if it's hovering around
> −5 dB it'll mean the amount of compression is 5 dB."
> [[Joey Sturgis Tones, *Finding the Sweet Spot*](https://joeysturgistones.com/blogs/learn/finding-the-sweet-spot-for-compression)]

> One of the most popular settings for SSL-style bus compression is to get it
> to "**just barely move the needle**".
> [[Audio Masterclass, *the gain reduction meter*](https://www.audiomasterclass.com/blog/how-to-use-the-gain-reduction-meter-in-a-compressor-like-the-warm-audio-wa-2a-opto-compressor)]

**The needle reads the NODE, not the knobs.** Web Audio's compressor exposes
`reduction` — the decibels it is taking off right now, read-only, computed by
the audio engine itself. The needle is driven from that number and nothing
else, so the picture cannot lie about the squeeze: knobs set intent,
`reduction` reports fact. This is the same rule as the tape deck reading the
graph and the crusher screen reading the unit that is actually in circuit.

At rest the needle sits at 0 (right-hand end of the arc, as GR meters do) and
swings left as the unit squeezes. A needle that never moves over a playing
record means the unit is out of circuit or the threshold is above the
programme — both of which are true states the face should show.

## 4. WHO TURNS IT ON

Three-way POWER — the genre decides / off / on — the tape machine's own rule,
for the tape machine's own reason: "If I turn a knob it should always work
for me no matter what the genre is."

**Which genres declare it.** Bus glue is a dance-music and mix-room idiom;
the sources above are electronic-production threads almost to a one. The four
genres whose records live on a dance floor or a club system declare it:
**acid, plastikman, jungle, synthwave** (`comp: 1` in the table). The
score-like and lo-fi genres — bladerunner, dungeon synth, dkc, lofi — do not:
a film cue breathing 20 dB is the point of a film cue, and lofi's glue is
already its tape. Each declaration is a taste call on top of a sourced idiom,
marked as such, and one listen can overturn any of them.

**Measured after building** (offline render, 12 s, seed 1, defaults, after
§6's compensation): acid's record comes out **−1.54 dB rms** with the unit in
— the squeeze and nothing else, inside the sourced 0.5–2 dB band. The needle
"just barely moves", which is the sentence the setting came from.

## 5. WHAT THIS DOES NOT DO

- **No sidechain pump.** The ducker this program already has is the pump —
  one owner. This unit is the glue, the other thing a bus compressor is for.
- **No lookahead, no multiband** — the node has neither and the unit does not
  pretend to.
- **The limiter stays**, fixed and invisible, after everything: it is the
  safety net, not a control, and making it reachable would put two hands on
  one dynamics property.

---

## 6. POSTSCRIPT — THE ENGINE'S OWN HIDDEN MAKEUP, found by the A/B

*Added the same day, before shipping.*

The first measurement of the built unit read **+2.05 dB rms on acid with every
knob at its default and MAKEUP at 0** — a compressor making the record louder,
which §2 of this very sheet forbids. The cause is the engine underneath:
Web Audio's compressor node applies its own automatic makeup gain, the spec's
`(1 / compressed(1.0))^0.6`, silently, always.

On this unit's travel (threshold never above −6, knee fixed at 6) the node's
full-scale point sits above the knee, so the hidden gain is exactly
`−0.6 × (threshold − threshold/ratio)` dB — computable, and now divided back
out in `setSpace`. At MAKEUP 0 the unit is level-neutral by construction and
the MAKEUP knob is the only thing that adds level, which is what its cap
claimed all along. The corrected A/B is in the build's commit.

The lesson, third time in this repo: **a stage whose job is dynamics must be
proven level-neutral by measurement, because the defect is precisely the one
your ear will mistake for "better".**

---

## 7. WHERE IT LIVES ON THE DESK — the centre section

*Researched 2026-08-08, on the user's instruction: "the Master Mixer should
have the compressor located under it or on it." The unit already existed; this
sheet's earlier sections argued what it DOES. This section is about WHERE it
goes, which turned out to be the better-sourced question of the two.*

### 7.1 On the desk this program clones, the compressor IS the master fader

The primary source is SSL's own manual for the console the whole idea comes
from, and it is more specific than "a compressor on the mix bus". Its Section
4 is titled **"The Centre Section"**, and the compressor is inside it:

> **"Quad Compressor** — This compressor uses the same VCAs that are used by
> the main output fader and the Autofade circuit on the Quad bus. Hence
> switching the compressor IN introduces no additional audio circuitry to the
> Quad Outputs."
> — [SSL, *SL 4000 G Series Console Operator's Manual*, p.4-11](https://archive.org/stream/SSL_4000G_Series_owners_manual/SSL_4000G_Series_owners_manual_djvu.txt)

So on a 4000 G the bus compressor is not *near* the master fader — **it is the
master fader's own gain stage.** The same page gives the meter:

> "The gain MAKE-UP simply acts as a level control to compensate for the
> lowered level which is a consequence of compressing the signal… **The meter
> reads Gain Reduction.**" — [ibid]

And the warning, which is the best evidence of how close to hand it sits:

> "Note of warning: Be careful when mixing with the compressor switched in, as
> you may end up pushing the faders up too far if you forget that it is in
> circuit." — [ibid]

SSL say the same about the whole lineage in their own marketing voice, which is
worth quoting because it is a claim about *placement* rather than about sound:

> "From the very first commercially released SSL 4000B console in 1976 and
> through many generations of SSL consoles that have followed, **the Bus
> Compressor has always been the stalwart of the console centre section.**"
> — [Solid State Logic, *THE BUS+*](https://solidstatelogic.com/products/the-bus-plus)

> "**The centre section compressor** from SSL's 1980's G Series analogue console
> is an audio production legend."
> — [Solid State Logic, *SSL Native Bus Compressor 2*](https://store.solidstatelogic.com/plug-ins/ssl-native-bus-compressor-2)

> "a high-quality stereo mix compressor derived from that first seen in **the
> centre section of the G-series consoles**"
> — [Sound On Sound, *SSL XLogic G-Series Compressor*](https://www.soundonsound.com/reviews/ssl-xlogic-g-series-compressor)

> "The SL4000 console was the first mixing desk to incorporate dynamics
> processing into every channel, as well as **a master bus compressor in the
> console's center section.**"
> — [Waves, *SSL G-Master Bus Compressor* user manual PDF](https://assets.wavescdn.com/pdf/plugins/ssl-g-master-buss-compressor.pdf)

### 7.2 What a centre section contains

SSL's own current manual enumerates it, and the list is the argument for
putting our master strip and our compressor in one place:

> "Bus Trim Masters and Routing · Talkback and Listen Mic · **Bus Compressor** ·
> Oscillator · Misc Section · Solo Master Section · Meters Section · CUE and AUX
> Masters · Stereo Returns · Monitor Level Controls · Monitor Source Selector"
> — [SSL, *ORIGIN User Guide V1.1*, p.20](https://www.solidstatelogic.com/assets/uploads/downloads/origin/SSL_Origin_User_Guide_V1-1_screen.pdf)

and orders the mix bus as **"MIX BUS Fader / MIX BUS Insert / MIX BUS
COMPRESSOR / MIX Bus Meter"** [ibid]. Wikipedia gives the generic shape:

> "Subgroup and main output fader controls are often found together on the
> right-hand side of the mixer or, on larger consoles, **in a center section
> flanked by banks of input channels.**"
> — [Wikipedia, *Mixing console*](https://en.wikipedia.org/wiki/Mixing_console)

### 7.3 It is post-summing, which is where ours already was

> "The signal passes on via the VCA monitor fader and out of the module onto the
> Quad bus. **The Quad bus is fed into summing amps in the centre section (SL
> 651G) and then passes via the main Quad VCAs** out to the monitor amps and
> ATRs." — [SSL 4000 G manual, *Basic Routing and Signal Flow*]

> "ORIGIN's Mix Bus has a dedicated, fully balanced Insert Send and Return…
> switched into the Mix Bus circuit using the INSERT switch **located next to
> the Mix Bus fader**." — [SSL ORIGIN User Guide]

Ours is an insert between the desk and the tape, which is the same position in
the flow. **§1 of this sheet is unchanged by any of the above** — nothing here
moves a wire.

### 7.4 IS IT ONLY SSL? — surveyed, and the answer is "mostly"

Worth writing down because it would have been easy to overstate:

| desk | a bus compressor in the centre section? |
|---|---|
| **SSL 4000 G / ORIGIN** | **YES**, and hard-wired into the master fader's VCAs |
| **API The Box 2** | **YES** — "Like the original console, The Box 2 features **two API 527 compressors in the centre section**… primarily intended for mix-bus compression" [[Sound On Sound](https://www.soundonsound.com/reviews/api-box-2)] |
| **AMS Neve 8424** | **NO dedicated one.** The centre carries "Two VPR alliance specification 500 series slots… can be added as **mix bus inserts**" and "built-in master bus EQ and stereo width enhancement" [[AMS Neve](https://www.ams-neve.com/consoles/small-format-consoles/neve-8424/)] — you fit one and route it there |
| **Amek 9098i** | **NO** — the centre has "the usual selection of master control facilities" and "Dynamics are available on all 6 master buses", but explicitly "**there's no 5- or 6-channel master compressor**" [[Mix](https://www.mixonline.com/recording/amek-9098i-large-format-line-mixing-console-373370)] |
| **Trident 88** | **NO** — nothing in the master spec; you strap outboard across the 2 main inserts [[Trident](https://tridentaudiodevelopments.com/product/trident-88-console/)] |

So "the bus compressor lives in the centre section" is **an SSL/API habit that
became the idiom**, not a law of consoles. It is still the right answer here for
a reason that is ours rather than borrowed: this program has exactly one output
and one master fader, the compressor is an insert on that one path, and the
needle exists to be watched *while a hand is on the threshold*. Putting them
two racks apart made the needle harder to use than it needed to be.

### 7.5 WHAT WAS BUILT

`panel.host: "mixer"` — the desk EQ's own key, carried one machine further. The
compressor is drawn **in the mixer's strip row, immediately after the master
fader**, in a case of its own with its own nameplate and its VU. Its controls
keep their keys, their kinds, the genre door (`comp: 1` on four genres), the
hand's TRIM and the double-click release; **only where they are drawn changed.**

Two things were derived rather than named, because a list of one pretending to
be a rule is this repo's most repeated defect:

- `mixMaster` read `INSTRUMENTS.desk` by hand. It asks now: a hosted machine
  with **no** picture is a strip's worth of knobs and goes on the MASTER STRIP;
  one that **draws a picture** is a unit and gets the centre section.
- `mk2_ui`'s picture check queried `.machine[data-machine="…"]`. A hosted
  machine wears no outer rack class, so that selector found nothing and the
  loop's `continue` would have **silently retired the only check that can see
  whether the VU draws.** It asks `[data-machine]` now.

**MEASURED after the move:** one compressor element on the page and no second
copy of any knob; all six declared controls drawn; the VU 278×138 and found by
the picture check; forced ON over lofi with the threshold at −26, the node's own
reduction reads **−11.3 dB** and the needle sits at −26.5°, so the unit still
works from its new house. `mk2_ui` 66/0, `probe_desk` 10/0, `probe_deskgraph`
7/0, `probe_mixer` 4/0, snapshot IDENTICAL.

**STILL OPEN, and unchanged by this:** everything in §5 above, plus the two
rows in `BACKLOG` §5.1b — the four genre declarations are a sourced idiom that
nobody has listened to, and no genre rides the compressor's knobs.
