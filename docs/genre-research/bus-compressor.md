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
