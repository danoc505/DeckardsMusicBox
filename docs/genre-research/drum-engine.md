# THE DRUM ENGINE, AND THE TR-1000'S PANEL

*Written 2026-08-04 (build `2026-08-04m`) from the user's report: "Can we
correct the ui for the TR 1000. It is not a clone of the actual… In addition we
need to look at the sound engine because the snare used in Synthwave is
horrible, it over rides the bass drum, and the bass drum has [no] oomph, it is
bearly there. It is even more obvious in the Acid House where the bass drum
might be the most important instrument on the track."*

*Two subjects, kept apart: what the PANEL should look like, and what the VOICES
should sound like. Both were researched fresh; the panel also had a photograph
of the real machine to work from.*

---

## 1. THE PANEL — what the machine actually is

The user's photograph plus the reviews agree, and the reviews put numbers on it:

> "The instrument editing controls feature ten faders — one less than on the
> TR-8S — each accompanied by a selection knob… **channels 1-4 are double width
> with six knobs.**" — [corpus:soundonsound TR-1000 review]

> "Above the faders are **three rows of rotary knobs** for editing (Tune, Decay,
> Mix…), **two columns of which are reserved for the first four instruments.**"
> — [corpus:soundonsound]

> "Roland delivered with **62 knobs, 63 buttons, 10 channel faders**, and a
> fader for the Morph control." — [corpus:audiofanzine TR-1000 test]

So the geometry is not decorative: **BD, SD, LT and HT are double-width strips
with two knob columns; RS, HC, CH, OH, CC and RC are single-width with one.**
Ten faders, one per voice, each under its own strip, each over a lit trigger
key. The top strip runs ACCENT / REVERB / DELAY / MASTER FX / ANALOG FX with the
LCD at the right-hand end, and every knob in it sits on one line.

### What was wrong here, point by point

| the user's words | what was true | what it is now |
|---|---|---|
| "the last 3 settings not having two faders" | all ten strips were drawn identically, six knobs each, so the machine's own 4-wide / 6-narrow split did not exist | four wide strips with two knob columns; six narrow ones with a stacked pair and a compact CTRL row |
| "instead of CTR on the knobs we should have them labeled" | the caps read `CTRL 1`, `CTRL 2`, `CTRL 3` | they read **REVERB**, **DELAY**, **FILTER** — see §1a |
| "The top row knobs are not in line with each other" | the row was bottom-aligned with each section's legend UNDERNEATH, so a wrapped label pushed its own knobs up; measured, the dials sat at three different heights | the legend moved above with a rule under it, groups top-aligned, one fixed cap height — measured, **all top dials on one line** |
| "The whole thing can be 10x better" | **seven controls were declared, loaded from every genre and ridden by the conductor, and never drawn on any panel** — 68 of 75 reached the glass | 75 of 75. See §1b |

### 1a. Why labelling the CTRLs is the FAITHFUL choice, not a departure

On the real machine CTRL 1/2/3 are **assignable** — there is a KNOB ASSGN key
beside the screen, and the screen tells you which parameter the knob is on. In
this program they are permanently wired to the reverb send, the delay send and
the filter. Printing "CTRL 1" copies the ink and throws away the information the
machine itself gives you. So the cap is the assignment and the CTRL number rides
in the tooltip for anyone matching the panel against a photograph.

### 1b. THE SEVEN KNOBS THAT WERE NEVER DRAWN

`tune`, `decay`, `tone`, `snappy`, `sdtone`, `chdecay`, `ohdecay` — the bass
drum's tune, decay and tone, the snare's snappy and tone, and both hat decays.
The four knobs anyone reaches for first on this machine. They were declared,
they were in every genre's table, the conductor rode them, and **no panel drew
them**. This is the same defect this repo already recorded for the amen panel:
*"declared and automated and never drawn… the exact mirror of a knob that does
nothing, and just as much a lie."*

They now sit on the strip of the drum they belong to, which is where the
machine's own INST EDIT puts them. **Checked by deriving, not by eye**: the
count of declared controls against the count the panel draws is 75/75.

### One departure, named

The machine's third left-hand row is MIX and it *also* has a fader. In this
engine a channel's level is one control, so drawing a MIX knob as well would be
the same number twice on one strip — the wide channels therefore carry five
knobs where the machine carries six. Nothing is hidden: the narrow strips keep
all three CTRLs as one compact row rather than putting two behind an assign key,
because a control a panel declares and never draws is the sin above.

---

## 2. THE VOICES — both halves of the report measured

`harness/probe_kickpunch.js` is new. It renders each genre's kick and snare one
at a time, through their own real chains, at the genre's own panel, with the
genre's own motion plan — and it compares the two voices **to each other**
rather than each to its own baseline, which is this repo's oldest lesson.

```
  BEFORE            kick pk  snare pk  snare-kick  SUB<100Hz  BODY 100-250  kick len
    lofi              0.514     0.276     -5.4 dB      64.5%         10.5%    199 ms
    synthwave         0.533     0.554     +0.3 dB      65.9%         10.1%    270 ms
    acid              0.468     0.313     -3.5 dB      63.5%         10.4%    231 ms
    dkc               0.452     0.346     -2.3 dB      52.1%         14.3%    136 ms
```

**Both complaints are true, and they are different faults.**

### 2a. The snare — a room with a snare in it

Synthwave's snare peaked **above** its kick, its RMS was five times every other
genre's, and it rang 130 ms where lofi's and acid's stop in 53–57. The cause was
a gated-reverb send at 0.95 with nothing balancing wet against dry. The
technique sheets are explicit that balancing is the step, and give no number:

> "You'll want to tweak the Hold setting on the gate and then **use the volume
> fader on an auxiliary bus to balance the volume of the effect with the
> original track**." [corpus:ledgernote gated-reverb]

> "To preserve the volume balance, adjust the snare's volume using a bus that
> controls **both the original snare and the gated reverb together**."
> [corpus:emastered gated-reverb]

Gate send 0.95 → 0.55 and the snare's own reverb send 0.52 → 0.34. **HOLD and
FALL untouched** — 150 ms then off in 15 ms is the desk setting the effect was
discovered on [corpus:sweetwater, Padgham at the Townhouse; corpus:musicradar],
and it is what makes it a gate rather than a reverb. So the character stays and
only the amount moves. **Measured after: the snare sits 2.8 dB UNDER the kick,
RMS 0.0858 → 0.0565.** The amount is `[CHOSEN]`.

### 2b. The kick — it was not quiet, it was under the speaker

Two thirds of every 808 kick's energy sat below 100 Hz, with a tenth in the
100–250 Hz band. Its fundamental settles at 45–60 Hz, which a laptop speaker, a
phone and most headphones do not reproduce at all. That is what "barely there"
is, and it is why it is worst in acid house, where the kick carries the record.

The sources describe a kick as layers:

> "The **Body/Thump layer** gives the kick its weight and fundamental tone,
> think of the **'oomph'** of the kick… content around **110Hz–140Hz**."
> [corpus:unison.audio layering-drums]

> "A bright clicky layer up top around **5kHz–8kHz** to help it cut through the
> mix." [corpus:unison.audio; corpus:transmissionsamples kick-drum-production]

> On why a 909 punches harder than an 808: "the difference between that initial
> attack and the lower, fundamental sustain **is where the punch lies**."
> [corpus:LANDR what-is-a-909]

`V.k808` had one sine and an 8 ms click. **The acoustic kick `V.kick` has had
the missing layer all along**, and its own comment says why: *"it is what lets
the note survive a speaker with no bottom."* So the 808 kick now carries a body
harmonic on the same pitch envelope, on a `punch` voicing control, and its click
is tilted toward the sourced 5–8 kHz.

**THE SECOND HARMONIC WAS TRIED FIRST AND MEASURED AS DOING NOTHING.** The
octave of a kick tuned 45–52 Hz is 90–104 Hz — still under the corner, still
under the speaker. The 100–250 share read 14.2 / 13.8 / 13.9% before the layer
and 14.2 / 13.8 / 13.9% after it, identical to the decimal. The **third**
harmonic puts the same tuning at 135–156 Hz, inside the sourced band, and it is
the harmonic the hardware really leans on: a bridged-T resonator driven through
a clipping transistor stage makes predominantly **odd** harmonics
[corpus:KVR TR-808 bridged-T modelling; corpus:n8synth DIY 808 kick].

**Measured after: peak +0.8 to +1.0 dB, sub share down 2–3 points.**

**HONEST LIMIT, and it is the interesting part: it does NOT move the 100–250
share.** The sub's long decay dominates the energy ratio, and the drum bus
already runs a `tanh` saturator at 3.6× which fills that band with its own odd
harmonics. The layer adds attack weight; it does not rebalance the spectrum.
Rebalancing would mean attenuating the sub, which changes what an 808 *is* —
that is a decision for the owner, not a fix to slip in beside this one.

---

## 3. FOUR WAYS A PROBE LIED, ALL IN ONE FILE

Recorded because this repo's rule — *when a measurement says something
surprising, the first suspect is the measurement* — earned its keep four times
in one afternoon, and the shape was identical every time: **the probe was not
handing the program what the program hands itself.**

1. **It never loaded the genre's panel.** `PARAMS` is one global table filled by
   `applyRack` when a song is composed. Skipping that renders factory defaults,
   so lofi (tune 45), synthwave (52) and acid (47) all came out as one sound —
   byte-identical peaks of **0.4969**, which is exactly the "three probes
   measuring one kick" defect HANDOFF §0 records.
2. **It assumed the onset was where the note was written.** `renderWav` carries
   a lead-in, so a note at tSec 0.02 arrives at ~0.082. The attack window sat
   entirely inside the silence and every punch figure read **−Infinity dB**.
3. **It measured the wrong band.** "Sub under 100 Hz" cannot see a layer that
   lands at 94 Hz. A metric that cannot see the thing you are changing reports
   every version of it as identical — which it did.
4. **It passed no motion plan.** `g.drumMachine` comes from the plan and falls
   back to `"kit"`, so every TR-1000 knob resolved against the acoustic kit's
   panel. `punch` does not exist there, so the voice used its default and the
   control measured as dead at 0, at 0.55 and at 1.0. **Live playback was
   correct throughout; only the probe was blind.**

**The tell that caught the last one was a null result that was too clean to be
true** — three identical readings across a control's whole travel.

---

## 4. AND THE BATTERY'S OWN LIST WENT STALE, for the fifth time

`mk2_test.js` kept the seven control keys the `DM(g)` voices read in a literal
array, because its scanner could only see a literal machine name. Adding
`punch` went straight through the hole. The scanner now reads a **call** as well
as a name, so those reads are derived from the shipped source, and which
machines own a hat-decay pair is derived from the declarations. The list is
gone. *Anything that lists what the program contains will go stale; derive it.*

---

## 6. "WHY ARE WE TALKING ABOUT AN 808?" — the correction that reframes §2

*Added the same day. The user, on reading §2: "The hand clap might be the thing
i hate. I hope your not just changing the drums for the genre I mentioned as an
example. Why are we talking about an 808 when we stopped using that many moons
ago?" Three hits, and the third is the one that matters.*

### 6a. The machine has TWO analogue circuits and this engine only built one

The panel says TR-1000. The voices were called `k808` and `s808`, every genre
played an 808, and §2 above went looking for punch by bolting a harmonic onto
one. The machine is not an 808:

> "**16 analog voice circuits lifted straight from the previous TR-808 and 909
> designs** and rebuilt with modern components."
> [corpus:musicradar TR-1000 announcement; corpus:musictech; corpus:djtechtools]

**And the 909 is the answer to the kick complaint, which makes this a defect
and not a naming tidy-up.** An 808 kick is a long sub boom with no punch *by
design*; the 909's is the punchy one:

> "On the 909, the introduction of pitch modulation means you can get a super
> punchy kick because you're effectively raising the pitch of that attack
> envelope, and the difference between that initial attack and the lower,
> fundamental sustain **is where the punch lies**… the 808 sustain is huge and
> you also just don't really have a punchy envelope to play with."
> [corpus:LANDR what-is-a-909]

Asking an 808 for oomph is asking the wrong circuit. §2's body layer was a
workaround for playing the wrong machine.

**BUILT:** `tr1000.circuit`, a **switch** (two circuits are two instruments, so
the conductor never rides it). The 909 branch drops further and faster — 7× over
12 ms against the 808's 4.2× over 30 ms — rings about half as long, and its
beater is the ATTACK the 909 has and the 808 does not.

**MEASURED, punch (attack against body):**

| genre | circuit | before all this work | after |
|---|---|---|---|
| acid | **909** | +5.3 dB | **+8.1 dB** |
| synthwave | **909** | +2.0 dB | **+4.7 dB** |
| lofi | 808 | +3.0 dB | +2.3 dB *(unchanged by design)* |
| dkc | 808 (chip kit) | +6.4 dB | +6.4 dB *(untouched)* |

Kick length tightened with it: acid 231 → 126 ms, synthwave 270 → 151 ms.

### 6b. Which genre plays which circuit, and why — all seven, not two

The user's other hit: synthwave and acid were named as **examples** of an engine
they think is bad overall, and §2 changed a gate on one genre. This repo has
made that mistake before and wrote it down: *"Taking an example as the request…
it went on a roadmap as a feature while the general point went unanswered."*

| genre | circuit | reason |
|---|---|---|
| **lofi** | 808 | the long sub boom IS the boom-bap kick; this genre's lineage is the sampler and the 808 |
| **synthwave** | 909 | the 1983–89 record, which is the 909's own window; and the circuit whose kick survives a gated snare on top of it |
| **acid** | 909 | "a steady four-on-the-floor kick drum usually from TR-808/TR-909 style sound sources… delivering a propulsive pulse" [corpus:grokipedia acid-house] — both named, one punches |
| **plastikman** | 909 | photographed: the live rig is "a TR-909 above two TB-303s, next to a TR-808" [corpus:gearnews] |
| **dkc** | 808 | plays the chip kit; declared so the table has one shape |
| **bladerunner, jungle** | default 808 | barely a kit / the break carries the record |

**The snare fix in §2a stayed on synthwave alone, and that is correct rather
than lazy: synthwave is the only genre that declares a gate at all** (every
other `gate:` is null or ~0.1). The clap and kick fixes are engine-wide.

### 6c. The clap — the user's actual worst offender

Measured across every genre that has one (only three do), and two real faults:

- **The tail was more than twice the circuit's.** "The reverb-like effect is
  actually an envelope with a smooth, relatively long (**100 ms**) decay"
  [corpus:KVR emulating-the-909-808-clap]. Ours ran **240 ms** — every clap
  trailed a quarter-second of band-passed noise, which under a gate is a wash
  rather than a clap. Now 100 ms on the 909, 130 on the softer 808.
- **The bands were one machine's.** 808 is "tuned to 1,000 Hz"; 909 is "around
  1140 Hz with a Q of 1.95" [corpus:KVR]. Both are built now, and the sources
  are explicit that this is where the two differ: "the 'clap' part is pretty
  much identical between the two machines, while the 'reverb' is somewhat
  different."
- The three retriggers also decay across the burst now — a burst of applause
  falls away, it does not repeat at one level.

**MEASURED, clap to −30 dB: acid 64 → 20 ms, plastikman 96 → 20 ms.**
Synthwave's stays ~139 ms because that genre gates its drums, which is its
declared signature and not the clap's doing.

## 5. WHAT IS NOT DONE, honestly

- **The owner has judged none of it.** Every number here says the kick has more
  attack weight and the snare no longer sits on top of it. None of them says it
  sounds good. the backlog.
- **The kick's spectrum is still sub-dominant** (60–64% under 100 Hz). Fixing
  that means attenuating the sub or raising the tunings, both of which change
  the genres' character and both of which are verdict decisions.
- **`punch` is `[CHOSEN]` on every genre** — it ships at the control's default 0.55
  and no genre declares its own yet.
- **The narrow strips' three CTRL knobs are small.** They are secondary controls
  and the screen reads their values, but at 1.16rem they are fiddly on a phone.
- **The right-hand side of the real panel is still not drawn** — C1–C6 macros,
  MORPH, LAYER A/B, the transport and the pattern keys. That is unchanged and
  deliberate, for the reason the panel declaration already gives: they are
  sequencer controls and this program composes rather than sequences.

## Sources

- [Sound On Sound — Roland TR-1000 review](https://www.soundonsound.com/reviews/roland-tr-1000) — double-width channels 1–4, six knobs, three knob rows, ten faders
- [Audiofanzine — TR-1000 test](https://en.audiofanzine.com/drum-machine/roland/tr-1000/editorial/reviews/roland-tr-1000-review.html) — 62 knobs, 63 buttons, 10 channel faders, Morph fader
- [Roland TR-1000 press release](https://www.roland.com/RolandComSite/media/global/release/pdf/2025/20251001_1_TR-1000.pdf)
- [unison.audio — Layering Drums 101](https://unison.audio/layering-drums/) — click / body-thump / sub, 110–140 Hz, 5–8 kHz
- [Transmission Samples — kick drum production](https://www.transmissionsamples.com/kick-drum-production)
- [LANDR — What is a 909](https://blog.landr.com/what-is-a-909/) — pitch modulation is where the punch lies
- [KVR — modelling the TR-808 bridged-T](https://www.kvraudio.com/forum/viewtopic.php?t=418439), [N8 Synthesizers — DIY 808 kick](https://www.n8synth.co.uk/diy-eurorack/eurorack-808-kick/) — self-oscillating, self-damping, odd harmonics
- [LedgerNote — gated reverb](https://ledgernote.com/columns/mixing-mastering/gated-reverb/), [eMastered — gated reverb](https://emastered.com/blog/gated-reverb), [Sweetwater — dissecting the Phil Collins drum sound](https://www.sweetwater.com/insync/dissecting-the-phil-collins-drum-sound/) — balance the return against the dry; hold and release figures
- Prior sheets used: `NOTES-FROM-THE-USER.md` §6 (the TR-1000, per-voice character, the cymbal and ride rebuilds)
