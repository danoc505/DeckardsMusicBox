# The noise, the wobble and the duck — the rest of the lofi effects

*Researched 2026-08-04 at the user's direction: "Ok the rest of the lofi fx we
have left to do." Fresh; nothing carried over. The five open rows are in
`BACKLOG.md` §6b — the crackle's level and where it goes, the slow drift not
reaching the sustained keyboard, no fast wobble and no hiss outside one
instrument, no ducking anywhere, and no bit reduction anywhere.*

**Why this sheet is stronger than the last one.** `lofi-production.md` had to
lean on production blogs, which copy each other. Four of the five questions
here are about *equipment*, and equipment has published engineering figures —
what a record's noise floor actually measures, what a cassette's hiss actually
measures, where wow stops and flutter starts, what a 12-bit converter's own
noise actually is. Those are numbers with derivations behind them, not taste.

Companions: `lofi-production.md` (the effects list), `wurlitzer-tremolo.md`
(the same shape of question, answered the same way).

---

## 1. HOW LOUD IS A RECORD'S SURFACE NOISE — the number the crackle should hit

Every figure below is the noise measured **below the loudest thing the record
can play**.

| figure | what it is | source |
|---|---|---|
| **55–60 dB** | the signal-to-noise ratio of a vinyl disc | [corpus:hifiauditions] |
| **~50 dB** | what it measures in practice rather than on paper | [corpus:hifiauditions] |
| **55–70 dB** | usable dynamic range of a quality pressing — explicitly against the 80–120 dB sometimes advertised | [corpus:headphonesty] |
| **60–80 dB** | noise floor, "depending on the quality of the pressing and playback equipment" | [corpus:hifiauditions] |
| **−48 dB** | the quietest an actual unmodulated groove was measured at, **with everything below 100 Hz dominating the spectrum** | [corpus:diamondcut forum] |

**The overlap of all five is roughly 55–60 dB down, and that is the band to
build to.**

**And the last row is the one that changes what we build.** The measured noise
of a real groove is dominated by *rumble* — low-frequency energy under 100 Hz —
not by the fizzy crackle. This program's crackle is deliberately the fizzy part
only: `V.tape` runs its buffer through a bandpass at 3.4 kHz. So the crackle
alone should sit **somewhat below** the whole-record figure, because it is
modelling a fraction of what that figure covers.

Mixing practice agrees about the frequency and says nothing useful about the
level: "low-cut the signal to remove frequencies up to 2 kHz, leaving only the
fizzy pops and crackles" [corpus:musicradar]. On level, every source is
qualitative — "almost imperceptible" through to "turned up to make more of a
feature", with the explicit advice to "use volume automation to push up the
level of noise layers during sparser breakdown sections" [corpus:musicradar].

**HONEST GAP: no source anywhere gives a mix level for crackle in dB.** So the
level is derived from the equipment figures above and nothing else, and that
derivation is written out in §6.

---

## 2. HOW LOUD IS TAPE HISS

| figure | what it is | source |
|---|---|---|
| **60–65 dB** | the dynamic range "high fidelity audio requires"; the best cassettes reached it in the 1980s, "at least partially eliminating the need for noise reduction" | [corpus:handwiki cassette formulations] |
| **10 dB** | the most Dolby B can ever remove — "the maximum boost that Dolby B applies is 10 dB, so the very best improvement… is a drop of 10 dB in the level of hiss" | [corpus:soundonsound tape noise reduction] |
| — | entry-level ferric tape (Type I) is "pure, unmodified, coarse-grained ferric oxide… sold as 'low noise'", with **"high levels of hiss and relatively low sensitivity"** | [corpus:handwiki] |

So: a *good* cassette is 60–65 dB down; a cheap ferric one without Dolby is
worse than that, and the sources decline to say by how much. Since 10 dB is the
whole of what Dolby B could ever recover, that is a fair scale for "cheap tape
versus good tape" — putting a cheap ferric cassette somewhere around **50–55 dB
down**.

That lands hiss and vinyl crackle in the same neighbourhood, which is what you
would expect: both are the medium, and both are what "a little goes a long way"
was written about.

---

## 3. WOW AND FLUTTER — where one stops and the other starts

This is the cleanest-sourced part of the sheet, because it is a standards
question.

| | |
|---|---|
| **wow** | slow speed variation, **0.5 Hz to 6 Hz** — uneven capstan rotation, worn bearings, fluctuating reel tension |
| **flutter** | fast variation, **6 Hz to 100 Hz** — tape scraping across heads and guides |

[corpus:reflectiveobserver; corpus:wikipedia Wow and flutter measurement;
corpus:babyaudio] **`[two sources]`** — and the IEC defines the fluctuation
formally as unwanted frequency modulation, stated as a **percentage of the
centre frequency**.

**How much of it is audible, in percent:**

- **0.03%** weighted — a professional tape machine, "practically inaudible".
- **0.08%** weighted — "the best cassette decks struggle to manage" this, and
  it is "**still audible under some conditions**".

[corpus:lindos; corpus:recordplayerlab]

**So 0.08% is roughly the floor of audibility for this effect**, the way 1 dB
was the floor for the tremolo. Anything a lofi record is doing on purpose has
to be above it.

**A note on the two ways of stating it.** Those figures are *weighted RMS*; a
program that swings a pitch back and forth by ±X% is stating a *peak*. Peak is
about 1.4× the RMS of the same sine, and the weighting curve knocks off more,
so a peak figure is roughly 1.5–2× the equivalent spec number. Written down so
nobody compares the two directly.

**HONEST GAP: no wow or flutter measurement of a Mellotron exists in the public
record.** Searched for; not found. Every figure above is for tape machines and
turntables generally.

---

## 4. THE DUCK — and the sources still disagree about how hard

`lofi-production.md` §7 recorded the conflict and it has not resolved:
"a **more brutal** form of sidechain compression, as it's part of the
aesthetic" [corpus:edmprod] against "gentle compression and sidechain to glue
drums and samples **without pumping**" [corpus:melodigging].

What this round adds is that the hip-hop-specific advice is unambiguous, and it
sits on melodigging's side:

> **Heavy-handed pumping is generally undesirable in hip-hop.** A moderate
> ratio of **3:1 to 5:1**, a fast attack of **2–5 ms**, and a short release of
> **40–80 ms** on the bass, triggered by the kick, creates a **barely audible
> duck** that improves perceived punch and separation.
> [corpus:musicproductionwiki]

And the general starting points, for scale:

- **2–3 dB of gain reduction**, ratio 2:1, is the usual "start here"
  [corpus:mastering.com; corpus:edmprod] **`[two sources]`**.
- A gentler general-purpose setting: ratio ~2:1, attack ~20 ms, release
  ~200 ms [corpus:staimusic].

**2–3 dB is the target, and 3 dB is a factor of 0.71 on the level.** That is
the number to build to; the attack and release come from the hip-hop row above
because that is the genre.

**One more use of the same mechanism, which is not about the kick and the
bass:** the noise bed itself can be ducked against the drums [corpus:musicradar
on layering noise]. That matters here because the crackle is about to get
louder.

---

## 5. BIT REDUCTION — and why the obvious version of it does nothing

The instruction in the tutorials is specific: "reduce the bit depth to 12-bit
while bringing the sample rate down to around 22 kHz" [corpus:unison], to
imitate the machines the genre grew out of — the **E-mu SP-1200**, "12-bit
sampling resolution" at a **26.04 kHz** sampling rate, and the **Akai MPC60**,
also 12-bit [corpus:wikipedia SP-1200; corpus:attackmagazine].

**But the arithmetic says the bit depth is not what anyone is hearing.**

The signal-to-noise ratio of an ideal converter is **6.02n + 1.76 dB**, where n
is the number of bits — "each bit adds approximately 6.02 dB"
[corpus:analog.com MT-001; corpus:cmuse]. That gives:

```
  12-bit  ->  74 dB below full scale   (the figure Analog Devices states outright)
  10-bit  ->  62 dB
   8-bit  ->  50 dB
   6-bit  ->  38 dB
```

A 12-bit machine's own quantisation noise sits **74 dB down** — quieter than a
vinyl record's noise floor (§1), quieter than a cassette's hiss (§2), and, as
§6 measures, quieter than this program's own crackle even before the crackle is
raised. **You cannot hear it under music.**

So what IS the SP-1200 sound? Not the bit depth. It is the **sample rate** —
26.04 kHz, with what that does above its own ceiling — and the machine's
filters and pitch-shifting. The bit depth is the specification everybody quotes
and the least audible thing in the chain.

**One qualification, so this is not overstated:** the arithmetic above is for
noise that has been *dithered* — random noise the ear ignores. Undithered
truncation produces **correlated** distortion instead, and "the human ear can't
stand hearing structured distortion particularly on quiet parts of a mix"
[corpus:cmuse]. A crusher that truncates rather than dithers is therefore
audible at levels the 74 dB figure would say it is not. That is a real effect
and it is why crusher plugins sound like something. But it is a *distortion*
effect, not a noise-floor effect, and it needs saying that way rather than as
"12-bit adds noise".

**So it was measured rather than calculated** — §6c.

---

## 6. MEASURED AGAINST THE PROGRAM

*Build `2026-08-04b`, lofi seed 1, eight bars from bar 8, rendered at 44.1 kHz.
The crackle is rendered on its own and against the same passage of music.*

### 6a. The crackle is 17 dB too quiet, and the old estimate was wrong

```
  lofi seed 1 draws crackle gain 0.0081

  music rms                            0.17652
  music peak                           0.74695   (peak sits 12.5 dB over the rms)
  crackle rms                          0.000083

  crackle vs the music, rms to rms     -66.5 dB
  crackle vs full scale                -81.6 dB
  crackle vs the music's loudest peak  -79.0 dB
```

**`lofi-production.md` §8c and `BACKLOG.md` §6b both say "about 36 dB below the
band". That number is wrong and is corrected here.** It was arithmetic on the
event's `gain` field against a mean note gain — two numbers that never meet in
the signal path — rather than a render. The real figure is **79 dB below the
record's loudest moment**, which is 20–24 dB below the whole band in §1.

**The derivation of the new level, written out so it can be argued with:**

- §1's band is **55–60 dB below the record's peak**. This record's peak is
  −2.5 dBFS, so that band is **−57.5 to −62.5 dBFS**.
- §1's last row says the real measured groove noise is dominated by rumble
  under 100 Hz. This crackle is the fizzy part only. So it belongs **below**
  that band rather than inside it.
- Target: **about −65 dBFS**, which is **+16.6 dB** on where it sits now — a
  gain of about **6.8×**.
- Every source in §1 and §5 also says a little goes a long way, which is the
  argument for the quiet end rather than the middle.

**AFTER, measured the same way** — `crackle [0.006, 0.008]` → `[0.040, 0.055]`,
plus a tape hiss deliberately set under it, plus the section move that pulls
the surface back when the band is thick:

```
  lofi seed 1 draws  crackle 0.0541  hiss 0.00067

                     under full scale    under the loudest moment    under the music
  crackle               -68.0 dB              -65.5 dB                 -53.0 dB
  hiss                  -70.1 dB              -67.6 dB                 -55.1 dB
  both together         -65.9 dB              -63.3 dB                 -50.8 dB
```

Against −79.0 dB before: **the record surface is 15.7 dB louder.** It sits
63.3 dB under the loudest moment in a chorus and about 2.5 dB higher than that
in the intro, the bridge and the outro, so roughly **61–63 dB down** across the
record. §1's band is 55–60. **It is deliberately just under the band**, for the
two reasons in the derivation: this is the fizzy part of the noise and not the
rumble that dominates the real measurement, and every source says a little goes
a long way. If it wants to be louder it is one number.

**Blast radius, checked on the notes rather than on the audio.** The shipped
snapshot hashes every field an event carries, so it reported all 2100 songs
changed — the tape event gained a `hiss` field and every keyboard note gained a
`flutter` field. Re-hashed on the fields a PLAYER plays (when, how long, how
loud, what pitch, who, on what), across 300 seeds × 7 genres: **six genres
byte-identical, and in lofi exactly one line differs per song — the crackle's
loudness.** Not one note moved anywhere.

### 6b. Where the crackle goes — the reverb is a red herring, the fader is not

`BACKLOG.md` §6b says the crackle "rides the KEYS bus… and **is reverberated**".
The wiring is exactly that. **The sound is not:**

```
  keyboard alone   room off 0.054564   room 0.16 0.055144 (+0.09 dB)   room 0.9 0.060053 (+0.83 dB)
  crackle alone    room off 0.000083   room 0.16 0.000083 (+0.00 dB)   room 0.9 0.000084 (+0.06 dB)
```

At the level lofi actually declares, the room adds **0.00 dB** to the crackle.
So "the crackle is reverberated" is true of the diagram and worth **nothing** in
the sound — the same shape of finding as the deep low-pass, which was built,
measured at 0.13 dB and reverted.

**The real fault on that bus is a different one, and it is not a level at all:**

```
  crackle, keyboard channel open  0.000083
  crackle, keyboard channel shut  0.000000
  -> the record surface DISAPPEARS when you close the keyboard channel
```

**Close the keyboard and the record stops being a record.** That is wrong on
physical grounds, not taste: the crackle happens at the stylus, on the way out,
long after any decision about how loud the keyboard is. It is the one part of
the mix that belongs to the medium rather than to the band. It should therefore
be its own channel with its own fader — which is exactly what the matrix in this
file was built to allow, and its own comment says so: "add an input to
`MATRIX.ins` and a case to `matrixSource()`, and every knob, node, automation
lane and panel cell follows."

**And the sources do not settle the reverb question.** Asked directly, they say
both — background textures can take reverb "for a washed-out, dreamy sound",
and a dry separate bus "gives you more control and definition"
[corpus:waves/abbeyroad; corpus:landr]. Since the measurement says it is worth
0.00 dB either way, the physical argument decides it.

**WHAT WAS BUILT:** a `vinyl` row on the matrix, with a fader and **five blind
plates**. Not six crossings — five of them would have been knobs that move
nothing, which this file treats as a defect, and the reason is generated into
`MATRIX.none` beside the existing ones. The one live crossing is the fader,
and lofi rides it: the surface pulls back about 2.5 dB when the band is thick
and sits at full in the intro, the bridge and the outro. That is the one
concrete instruction any source gives about a noise layer [corpus:musicradar],
written the only way a control whose top is its default can express it.

---

### 6c. The wobble, after

`ev.wow` used to be set for `role === "keys"` and nothing else. It now reaches
the second keyboard as well, and `ev.flutter` goes with it. Over 30 lofi songs:

```
  which parts carry the tape drift now:
     keys     15249 notes
     keys2     1894 notes        (was zero)
```

And it is not decoration — a subtract-one-render-from-the-other test on eight
bars of the second keyboard, seed 1:

```
  turn the fast wobble off and the sound changes by         -31.4 dB
  turn BOTH the drift and the wobble off and it changes by   -4.5 dB
```

−4.5 dB against the part's own level is a plainly different sound; −31.4 dB is
small and present, which is what a setting sitting at the audibility floor
(§3) should measure.

### 6d. The duck, after

lofi declares 2.5 dB, 4 ms on, 65 ms off, triggered by the kick, on the bass,
the chords and the record surface. Measured over 24 bars of seed 1, with the
kick itself removed from the render so it cannot fill in its own hole — and
with two genres that declare no duck as the control:

```
                 kicks   measurable   typical drop   deepest   back within half a dB
  lofi            46         46        -2.37 dB    -2.75 dB   80 ms
  synthwave       37         37        -0.00 dB    -0.00 dB      --
  acid            90         57        -0.00 dB    -0.00 dB      --
```

Every kick, 2.37 dB, recovered in 80 ms. The sources asked for 2–3 dB, on in
2–5 ms, off again in 40–80 ms. Nothing moved in any genre that did not ask.

**AND A MEASUREMENT THAT WAS WRONG, ON THE RECORD.** The first version of that
table said the duck fired on 4 kicks out of 46, alternating and then dying out.
It was convincing enough that the mechanism was rewritten before the cause was
found. **The fault was the measuring script**: `renderWav` returns a STEREO
file, and the script read the interleaved samples as if they were mono, so its
clock ran at half speed and its search window landed in the gap between kicks
every other time. Three wrong theories were written down before the repo's own
law — *when a measurement surprises you, suspect the measurement first* — was
applied. The rewrite was kept anyway, because straight ramps hit the declared
depth exactly where chained exponentials reach about 95% of it, but it was kept
for that reason and not the one it was made for.

### 6e. Bit reduction: measured, and NOT built

§5 says the arithmetic makes a 12-bit machine's own noise inaudible. Rather
than ship that as arithmetic, the real render was quantised and the error
signal measured — undithered truncation, which is the harsher case.

```
  lofi seed 1, eight bars.
  the record's loudest moment      0.73633
  the noise it already has         0.000507   (-63.2 dB under that)

  bits    the noise a crusher adds   under full scale   against the record's own noise
    16          0.0000108              -99.3 dB          -33.5 dB   buried
    12          0.000141               -77.0 dB          -11.1 dB   buried
    10          0.000563               -65.0 dB           +0.9 dB   about level with it
     8          0.00223                -53.0 dB          +12.9 dB   above it, audible
     6          0.00882                -41.1 dB          +24.8 dB   above it, audible
```

**At the setting the sources give — 12-bit — a crusher would sit 11 dB under
the noise this record already makes.** It would be a control that does nothing,
which is the same verdict the deep low-pass got, reached the same way. **Not
built.**

Two things worth keeping from it. First, 12-bit is buried *partly because the
crackle went up 17 dB*; against the old crackle it would have been about 6 dB
under, still inaudible but less comfortably. Second, **8-bit is 12.9 dB above
the noise floor and would be plainly audible** — so if anyone ever wants that
sound, the number to reach for is 8, not 12, and it is a distortion decision
rather than a fidelity one. The tutorials quote the specification of the
machines; the specification is not the part you hear.

---

## 7. WHAT THE SOURCES DO NOT SETTLE

- **No mix level for crackle, in dB, anywhere.** §6a's target is derived from
  equipment specifications, not read off a source. Marked `[EAR]` in the table.
- **How hard to duck.** Still open from `lofi-production.md` §7 and still open
  now; the hip-hop-specific source (§4) breaks the tie toward "barely audible"
  but it is one source against one.
- **No Mellotron wow or flutter measurement exists** in the public record (§3).
- **Nothing on whether crackle should be reverberated** (§6b) — asked directly,
  the sources say both.
- **Nothing on how the noise bed should behave across a song.** The one
  concrete suggestion found is volume automation into sparse sections
  [corpus:musicradar], which is a hand's move and not a rule.

---

## Sources

- [Vinyl LP vs CD audio — Music & Hi-fi Appreciations](https://hifiauditions.wordpress.com/2024/11/19/vinyl-lp-vs-cd-audio/)
- [Vinyl Measurements Reveal How the Format Itself Inflates Dynamic Range — Headphonesty](https://www.headphonesty.com/2025/11/vinyl-measurements-reveal-format-inflates-dynamic-range/)
- [What is best Signal to Noise Ratio that I can expect from Vinyl — Diamond Cut User Forum](https://www.diamondcut.com/vforum/forum/general-discussion/general-audio/53643-what-is-best-signal-to-noise-ratio-that-i-can-expect-from-vinyl-before-processing)
- [Compact Cassette tape types and formulations — HandWiki](https://handwiki.org/wiki/Chemistry:Compact_Cassette_tape_types_and_formulations)
- [Tape Noise Reduction — Sound On Sound](https://www.soundonsound.com/techniques/tape-noise-reduction)
- [Wow & flutter: what is it, and how to measure it? — Reflective Observer](https://reflectiveobserver.medium.com/wow-flutter-explained-31cc9495d24)
- [Wow and flutter measurement — Wikipedia](https://en.wikipedia.org/wiki/Wow_and_flutter_measurement)
- [Wow and Flutter Measurement — Lindos Electronics](https://lindos.co.uk/articles/wow-and-flutter-measurement)
- [Wow and Flutter: How Tape Modulation Can Elevate Your Sound — Baby Audio](https://babyaud.io/blog/wow-and-flutter)
- [Wow and Flutter Explained — Record Player Lab](https://recordplayerlab.com/wow-flutter-turntable-speed-stability/)
- [Sidechain Compression: The Complete Guide — MusicProductionWiki](https://musicproductionwiki.com/articles/sidechain-compression-guide)
- [Sidechain Compression: 5 Tricks for a Better Mix — Mastering.com](https://mastering.com/sidechain-compression-guide/)
- [Sidechain Compression: 5 Simple Tips for Tighter Mixes — EDMProd](https://www.edmprod.com/sidechain-compression/)
- [Ultimate Guide to Sidechain Compression — Stai Music](https://www.staimusic.com/en/blog/ultimate-guide-to-sidechain-compression-explained_11631.html)
- [Bitcrushing and Downsampling 101 — Unison](https://unison.audio/bitcrushing-and-downsampling/)
- [E-mu SP-1200 — Wikipedia](https://en.wikipedia.org/wiki/E-mu_SP-1200)
- [Character & Crunch: Replicating The Sound Of Vintage Samplers — Attack Magazine](https://www.attackmagazine.com/technique/character-crunch-replicating-the-sound-of-vintage-samplers/2/)
- [MT-001: Taking the Mystery out of the Infamous Formula "SNR = 6.02N + 1.76dB" — Analog Devices](https://www.analog.com/media/en/training-seminars/tutorials/MT-001.pdf)
- [Quantization Noise Calculator — CMUSE](https://www.cmuse.org/quantization-noise-calculator)
- [How to use vinyl crackle and tape hiss to add feel and vibe — MusicRadar](https://www.musicradar.com/tuition/tech/how-to-use-vinyl-crackle-and-tape-hiss-to-add-feel-and-vibe-632491)
- [How to layer noise in your DAW for an instant lo-fi sound — MusicRadar](https://www.musicradar.com/how-to/how-to-layer-noise-in-your-daw-for-an-instant-lo-fi-sound)
- [Adding A Lo-Fi Vintage Vibe To Your Track — Waves / Abbey Road](https://www.abbeyroad.com/news/adding-a-lo-fi-vintage-vibe-to-your-track-waves-audio-productionhub-2951)
- [Lo-fi Mixing: 5 Mix Tips for Dusty Vintage Beats — LANDR](https://blog.landr.com/lo-fi-mixing/)
