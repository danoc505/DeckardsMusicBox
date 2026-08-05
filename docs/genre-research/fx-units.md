# THE FX RACK — the units, researched one at a time

*2026-08-03. The user: "your web searches need to be their own research docs
for future reference." Correct — the searches behind the flanger, the DP/4
and the PCM90 were argued in commit messages and handoff entries, which is
where findings go to be forgotten. This is the reference copy.*

*The list itself comes from `plastikman-minimal.md`: the Sound On Sound
teardown of* Consumed *names five effects units against this program's two.*

---

## 1. Yamaha SPX90 (1985) — BUILT at `2026-08-03j`

**Sources**: vintagedigital.com.au "The Legendary Yamaha SPX90";
manualslib SPX90 Operating Manual specs; audiofanzine user reviews.
On the record: kept for its **"dirty, great flange"** [soundonsound].

**What the sources give**: reverb, delay, chorus, flanger, phaser, pitch
change. 31.25 kHz sampling, 16-bit linear conversion, and processed signal
**20 Hz – 12 kHz**. Users describe "a really thick and wide flange tone".

**What they do NOT give**: flanger parameter ranges. The manual has them;
the searches did not surface them. So the topology is the standard one and
every range is marked [EAR] — the honest split.

**The one characterful number is the BAND LIMIT.** 12 kHz on the processed
path is what makes it a 1985 box rather than a modern flanger, and it is
FIXED in our build because it is not adjustable on the real unit either.
It was first declared as a panel switch and the battery correctly refused
it: a `switch` is never automated and never read per song, so it reached
the sound through nothing any check could see. **The right answer was to
delete the knob, not to exempt it.**

---

## 2. Ensoniq DP/4 (1992) — BUILT at `2026-08-03k`

**Sources**: vintagedigital.com.au DP/4 and DP/4+; barryrudolph.com;
rapmag.com 1992 review; synthanatomy on the DEEP/4 emulation.

**The line that shaped the build**: the DP/4 is four independent processors,
4-in/4-out, 46 algorithms (43 single-unit stereo, 3 multi-unit) — **and "a
digital patch bay that allows you to route signals in either mono or stereo,
in series or parallel"**. *The DP/4 is a matrix with effects inside it.*
Half of it was already built here, because our grid IS that patch bay.

**Configurations it actually has**: 4 Source (four independent signals),
2 Source (two 2-unit presets), **1 Source (a single signal through one
4-unit preset)**. We clone the 1-source configuration — one matrix column
in, four units in parallel, one return row. The 4-source version would be
four more columns and thirty-two more crossings, and a crossing no genre
rides is a knob that does nothing.

**Algorithms chosen for what this program could not already do** (it has a
reverb, a delay and a flanger, so none of those repeat): PHASE (four swept
allpass stages — notches where a flanger is a comb), DRIVE (asymmetric
saturation as a *send*), ROTARY (a Leslie: level and pitch sweeping
together, opposite across the pair), CRUSH (rate reduction — the code says
plainly it is a gated chop, not a true sample-and-hold).

---

## 3. Lexicon PCM90 (1996) — PARTLY BUILT at `2026-08-03m`

**Sources**: lexiconpro.com "PCM Native Random Hall Reverb";
recordproduction.com review (George Shilling); soundonsound PCM90 review;
the PCM90 user guide PDF (freeverb3-vst mirror).

**Random Hall, the signature**: "similar to the Hall algorithm, but its
reverberators **change over time in controlled, random ways** to avoid the
buildup of tinny, grainy, metallic or other colorations... the
randomization of delay elements is particularly central". And: "one of its
charms is a bit of irregularity in the decay."

**Size / Spread / Shape**: "allow adjustment of the buildup and decay of the
INITIAL PART of the reverberation envelope". Early reflections are
separately adjustable in amplitude and delay.

**BUILT**: `spread` (the diffusers' coefficient) — measured -4.3 dB of real
change. `preDelay` — the room's own, finally declared by genres at
`2026-08-03m` after probe_wiring found it unused by everyone.

**NOT BUILT / SHIPPED OFF**: the randomization. It exists, it is seeded and
deterministic, and by the metric written for it (peak-to-median of a
time-averaged tail spectrum — the only measure that separates a smeared
comb from a moved one) it makes ringing **worse**, 25.3 → 31.3 dB.
`space.random` is 0 everywhere. **That is a verdict, not a default.**
Diagnosis on record but UNVERIFIED: the per-line decay gain is computed for
the nominal delay length, so a wandering tap detunes the decay balance and
turns a line into a resonance.

---

## 4. Roland SRV-330 "Dimensional Space" — NOT RESEARCHED

Named in the *Consumed* gear list. The "Dimensional" name is the same
lineage as the Dimension D (a stereo chorus/spatial box), so the guess is
that this is a reverb with a stereo widener in front — **but that is a
guess and no search has been run.** Do not build from this paragraph.

## 5. ART Multiverb — NOT RESEARCHED

On the record it supplied **"gated reverb" on claps**. This program already
has a gated verb (`g.gateSend`/`gateVerb`), built long before and never
compared against this unit. Whoever picks it up should research the ART
first and then ask whether ours needs changing at all.

---

## 6. Bode Barberpole Phaser (1981) — BUILT at `2026-08-03o`

**Not from Hawtin's rack** — it arrived by a different door, at the user's
request — but it belongs in this list because it is now one of the units in
the FX suite, and column F of the matrix.

Its research is **its own file**: `barberpole.md`. That file has the
sources (Bode's last completed instrument; the DAFx-15 paper's three
methods and why we built the first; the Shepard bell over the logarithmic
frequency axis), a table of what the sources gave against what we did, and
**three things the sources describe that we did NOT build**, each with the
reason.

The one worth doing next is Sinevibes Whirl's **stereo phase offset between
channels** — ours offsets between NOTCHES, not between the two ears, and
the program is stereo now. It is in `docs/BACKLOG.md` §5.

**Rebuilt 2026-08-05** — `barberpole.md` §7. The window was a bell in *time*
riding each notch's *Q*, where the sources say a raised cosine over *log
frequency* riding the *cut gain*, and the difference was not academic: Q
touching zero installs all-zero filter coefficients in Chrome, so the unit
was permanently silent from 6.5 s into every playback on both genres that
feed it. Six `peaking` filters and a WaveShaper reading the bell off the
sweep now. If you are looking at this unit, read §7 before anything else.
