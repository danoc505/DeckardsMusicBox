# THE MIXING DESK — what a classic one does that ours does not

*Researched 2026-08-07, before touching the mixer, because the user asked two
questions at once: "is there a classic mixer we could clone to make ours
better?" and "the mixer needs to be the master for all volume". The second is
the real one. The first is how it gets answered.*

**The complaint, in the user's words:** *"The Mixer does not seem to be hooked
into the program as well as it should be. A big problem is volume not being
where it should be, things being too loud drowning out others. The mixer bay
was meant to fix that but it doesn't seem to work that well."*

---

## 0. WHICH DESK, AND WHY

**The SSL 4000 E.** Not because it is the most beautiful console — a Neve 8078
is — but because it is the one that answers all three parts of the complaint at
once, and because it is *the* desk of records rather than of tracking.

- Released **1979**, and its E Series put a **dynamics section on every
  channel** plus the **stereo bus compressor** on the master, which is the part
  people mean when they say a record sounds "glued"
  [[Vintage King](https://vintageking.com/blog/best-channel-strips/)].
- Its EQ is **colour-coded by band, and the colour is information rather than
  decoration** — see §3, which is the direct answer to the user's second
  request.
- Its master section is a real destination, not a summing point you cannot
  reach. That is §2.

The Neve 1073's three-band inductor EQ is the other candidate and is the better
*sound* reference; it is not a better *desk* reference, because a 1073 is a
channel strip and the question here is about mastering the whole balance
[[Vintage King](https://vintageking.com/neve-1073spx-d-channel-strip-and-usb-adat-audio-interface)].

---

## 1. WHY THINGS DROWN EACH OTHER — AND IT IS ARITHMETIC, NOT TASTE

This is the finding that matters most, and it is a number:

> **"Every time you double the number of faders set to unity gain, feeding the
> same mix bus, their summed signal level increases by 3 dB. If you set 16
> faders to unity gain and route them all to the stereo output bus, the summed
> signal will be 12 dB higher than the signal of one channel alone."**
> [[ProSoundWeb](https://www.prosoundweb.com/setting-sound-system-and-mixing-console-gain-staging/)]

**Applied to this program:** the mixer has **eight** role strips. Eight is three
doublings from one, so a song in which every part is playing sums about **9 dB
hotter than a single part** — and, crucially, *the number of parts playing
changes section by section*. An arrangement that drops from six parts to three
is not just thinner, it is roughly **3 dB quieter at the bus** for reasons that
have nothing to do with the music. And a chorus that adds a second keyboard and
an answer line gets **louder than the fader positions say it should be**.

That is precisely "volume not being where it should be". The faders are telling
the truth about each part and the sum is not.

**The desk's own answer** is a master fader you watch while you build the
balance:

> *"Keep your eye on the master fader levels and as you bring up each fader try
> to make sure the signal doesn't reach over -10 to -12 dBFS; if it starts to
> get hot just pull back the faders (not the master)."*
> [[modernmixing](https://modernmixing.com/blog/2011/01/11/gain-staging/)]

> *"For your master bus, aim for peaks around -6 to -3 dB."*
> [[Output](https://output.com/blog/gain-staging-101-how-to-supercharge-your-mix)]

**We have no master fader and no master meter.** `BACKLOG.md` §0b.6 already
said so: *"Seven channels and no master fader, no mute, no solo."* So the one
instrument the sources say you use to catch this exact problem is the one
instrument the panel does not have.

### And why faders should sit near unity

> *"Faders should be set close to unity gain (design center), including master
> faders. Keeping channel faders near unity gain ensures maximum control and
> resolution."*
> [[ProSoundWeb](https://www.prosoundweb.com/setting-sound-system-and-mixing-console-gain-staging/)]

Ours open at the genre's own `roleGain` in dB, which is the right idea — the
fader shows where the part IS. What is missing is the reference: a **unity mark**
on the fader travel, so "where the genre put it" and "where a desk would call
zero" are distinguishable at a glance.

---

## 2. WHAT A MASTER SECTION IS FOR, AND WHAT WE ARE MISSING

From the console literature, the parts of a master section and what each is for
[[Sound On Sound](https://www.soundonsound.com/sound-advice/q-what-do-solo-pfl-and-afl-do);
[Indiana University CMText](https://cmtext.indiana.edu/studio/chapter2_mixers4.php);
[Lenard Audio](https://education.lenardaudio.com/en/09_mix_2.html)]:

| control | what it does | do we have it |
|---|---|---|
| **Main / master fader** | *"Main faders control the desk's main mix (Left and Right output)."* | **NO** |
| **Meter bridge** | a row of meters above the strips; on a Trident 78 it is the whole top of the desk [[Funky Junk](https://shop.funky-junk.com/shop/recording/mixers/consoles/trident-audio-series-78-16-ch-analogue-console-with-vu-meter-bridge/)] | per-channel yes, **master no** |
| **MUTE** | *"silences the channel… the switch on each channel sometimes at the top of the channel strip, but more commonly at the bottom"* | **NO** |
| **SOLO / PFL** | *"Pre-Fade Listen… monitor the channel's signal level immediately prior to the channel fader, and will therefore include any EQ… The pre-fade listen, or solo switch is beside the main fader."* | **NO** in audio. The roll's legend does a *visual* solo only |
| **Bus compressor** | the E Series' *"classic stereo bus compressor, helping engineers create clean, punchy and cohesive mixes"* [[Vintage King](https://vintageking.com/blog/best-channel-strips/)] | there is a master soft-clipper and a limiter, which is **not** the same thing |

**The important distinction the sources draw, which we should keep:** PFL is
*pre-fade* — it lets you hear a channel including its EQ but **before** its
fader, which is how you check a part that you have faded down. AFL/solo is
after. Ours should be **solo-in-place** (mute everything else) rather than PFL,
because there is one output and no separate monitor bus; that is a stated
departure, not an oversight.

---

## 3. COLOUR IS INFORMATION ON A REAL DESK — the precedent for matching the roll

The user: *"We need the mixer to be color coded matching with the midi
visualizer so the instruments are matching what they are in the visualizer."*

**That is exactly what the SSL 4000 E does**, and it is worth quoting because it
shows colour carrying a *fact* rather than a decoration:

> The E Channel EQ is divided into four bands: **High Frequency (HF, red
> knobs), High Midrange (HMF, green), Low Midrange (LMF, blue), and Low
> Frequency (LF, brown or black)**
> [[Universal Audio](https://help.uaudio.com/hc/en-us/articles/30847477384212-SSL-4000-E-Channel-Strip-Manual)].

And the LF colour is not a style choice at all — it **identifies the circuit**:

> *"Historically the type of EQ fitted in an individual console was
> distinguished by the colours used on the LF knob caps so the two flavours have
> become known as the 'Brown' and 'Black' EQs."* The EQ Type button *"chooses
> between the two types… The knob colour of the LF band controls changes to
> reflect the current setting."*
> [[SSL](https://support.solidstatelogic.com/hc/en-gb/articles/14959276554525-SSL-4K-E-Channel-Strip-Plug-in-User-Guide)]

So on the desk this program is cloning, **the colour of a control tells you what
it is**, and the colour changes when the thing changes. That is the standard the
mixer's colours should meet: not "pick eight nice colours", but **read the same
declaration the roll reads**, so the two displays cannot disagree.

**How that lands here.** The roll already assigns one hue per part in
`rollHues()`, stepped 15°→280° across `Object.keys(MIDI_TRACK)`, and the
comment above it records that the first two attempts failed *because the eye
cannot separate greens* — 70..200 put the bass and the comp at the same colour,
and 20..250 still left the comp and the tune 38° apart. So the hue table is
already an ear-and-eye-tested artefact, and the mixer must **call that
function**, never copy its numbers. Anything else is the derive-never-list
defect with a paint job.

**One honest edge:** `MIDI_TRACK` has **seven** entries and the mixer has
**eight** strips. `tape` — the record surface — is not notes and has no MIDI
track, so it has no roll colour and must not be given an invented one. It gets
a neutral, and the reason is written on it.

---

## 4. WHAT THIS PROGRAM HAS THAT A DESK DOES NOT, AND SHOULD KEEP

Recorded so nobody "clones" these away:

- **A strip per ROLE, in front of the bus.** There are five buses and eight
  parts, so a fader on a bus could never separate the second keyboard from the
  comp. This is already right and is better than a literal console clone.
- **The automation dot.** Every knob here shows two indicators — where the hand
  has it and where the song has it right now. No analogue desk does that, and it
  is the single most informative thing on the panel.
- **The matrix.** A Doepfer A-138m is not console furniture; it stays.

---

## 5. WHAT THE SOURCES DO **NOT** GIVE, and must not be guessed

- **No source gives a target balance between a lo-fi comp and its drums.** The
  -10..-12 dBFS bus guidance is about headroom, not about taste. Any per-part
  number remains `[EAR]`.
- **The bus compressor's ratio/attack/release for this material** is not
  researched here. The E Series' own 2:1/4:1/10:1 with auto-release is
  documented, but whether this program wants one at all is an ear question and
  building it is not part of this pass.
- **Whether `tape` should be on the master at all** — a record-surface layer is
  arguably not "a part". Left on, marked.

---

## 6. WHAT WAS BUILT FROM THIS

See the commit and `BACKLOG.md`. In order of how directly each answers the
complaint:

1. **A MASTER STRIP** — master fader, master meter with peak-hold, and the
   -10..-12 dBFS working range and 0 dBFS marked on the meter, because §1 says
   the master meter is the instrument you diagnose "too loud" with.
2. **MUTE and SOLO on every channel**, mute at the foot of the strip and solo
   beside the fader, per §2's placement. Solo-in-place, for the stated reason.
3. **COLOUR FROM `rollHues()`**, one function serving the roll and the desk, so
   a part is the same colour in both. `tape` neutral, with its reason.
4. **A UNITY MARK** on the fader travel.

**Not built, and named:** the bus compressor (§5), PFL as distinct from solo
(§2), and any change to the per-part balance numbers (§5).
