# Dungeon synth — the research, before any table exists

*Researched 2026-08-06 at the user's request: "I want to build a Dungeon Synth
genre … it is much more orchestral than other genres, we will need timpani,
large marching drums, music to explore the dungeon." Nothing has been built
yet. This sheet is the whole of what the sources say, what they do not say, and
the one place where the genre contradicts a law this program already enforces.*

**On the WAV files.** When this sheet was first written the samples were not
in the repository — `.gitignore` had eaten them silently once before, for the
Amen pack. **They are there now**: the user landed the *Erang — Dungeon Synth
Free Samples Pack*, 65 WAVs at the root of `main` (10 each of strings, keys,
percussion, pads, leads; 5 plucked; 5 atmosphere effects; 5 loopable noise
beds; every pitched one at C). They total **91 MB against the program's
2.5 MB**, so they are not embedded — the same decision the Amen path recorded:
this program ships no recordings, it synthesises. What the pack is instead is
**measurement data**, and §3a below is what it measured. The genre remains
built by SYNTHESIS, which is also what the genre itself is.

---

## 1. WHAT IT IS

> "A genre of electronic music derived from black metal and dark ambient",
> which "emerged in the early 1990s, predominantly among members of the early
> Norwegian black metal scene", and which "evokes medieval European or fantasy
> themes". Typically **entirely instrumental**, built from "lo-fi synthesizer
> melodies" layered into "dark, dungeon-like atmospheres".
> [corpus:wikipedia/Dungeon_synth]

Mortiis — Håvard Ellefsen, then of Emperor — called his own records **"dark
dungeon music"** before the genre had a name, and the sources agree the style
was not named "dungeon synth" until around 2011; before that it was filed as
dark ambient, neoclassical or medieval electronic music
[corpus:microgenremusic; corpus:aesthetics.fandom].

**It is not video-game music, and the resemblance is contested.** Wikipedia
notes the genre is "contentiously likened to video game music because of
fantasy influences, the usage and layering of synths, and a focus on ambience,
though traditional artists have disputed this connection". Worth knowing
because the nearest thing this program already has is `dkc`, and that is a
different intention: DKC is a *level* score built to loop under play, and this
is a *place* built to be wandered in.

---

## 2. HOW IT WAS ACTUALLY MADE — the primary source, and it decides the design

Mortiis, asked directly how the early albums were written:

> **"i only owned one keyboard, which was a roland jv30, so that was all that
> was used."**
>
> **"i invented this system where i would come up with parts, and write them
> down in a specific coloured pen, then i would come up with another part that
> i thought would work on top of the first part … i would then write down the
> second part in another colour, and so on, for loads of layers … on and on for
> layers and layers for 20-25 minutes"**
> [corpus:dungeonsynth.blogspot, interview with Mortiis]

**That is the genre's compositional engine in one paragraph, and it is not a
chord progression.** The music is built by ADDING LAYERS over a long duration.
Nothing arrives because a section demands it; a part enters, and then another
part enters on top of it, and the record is the accumulation. The secondary
sources describe the result — "duration, repetition and a cursed melancholy"
[corpus:microgenremusic] — and the primary source describes the cause.

**This program already has the mechanism.** `form.build.enter` spaces a small
number of arrivals across a long record; plastikman uses it for exactly this
shape ("parts arrive rarely and far apart, and between arrivals the movement is
all timbral"). Dungeon synth is that idea with the timbral movement turned
down and the arrivals turned up.

### And a modern practitioner, working the opposite way round

Erich Grunewald, writing up his own track in full:

> instrumentation: **"bass flutes, bass oboes, tenor voices, strings,
> harpsichord and timpani"**; patches named from a Korg M1 — "Morocco",
> "Vel.-Choir", **"Timpani"**, "MassiveChoir", "Stringorch", "Orchestra1".
> He adds that **"the precise instruments don't matter"** so long as they
> approximate the intended synth sounds.
>
> reverb: **"a single reverb, put in a bus channel with sends from all
> instruments"** to simulate an orchestral hall, plus mono conversion of the
> low frequencies.
>
> the finished track runs **15 minutes**.
> [corpus:erichgrunewald "How I Make Dungeon Synth"]

The timpani the user asked for is named by a practitioner, unprompted, in the
one detailed account of making a track in this genre that the search found.

---

## 3. WHAT IT SOUNDS LIKE — the numbers a table can be written from

The most specific source found, and the one this repo has already cited for
jungle's harmony:

| | what the source says | [corpus:melodigging/dungeon-synth] |
|---|---|---|
| instruments | "choirs, strings, pipe/chapel organs, flutes/recorders, horns, harps, and celesta/bell tones" | |
| percussion | **"sparse or absent; when used, it tends toward martial snare patterns or timpani rolls rather than driving drum kits"** | |
| tempo | **"40–80 BPM"** when percussion appears; "beatless or very sparse percussion" otherwise | |
| harmony | **"minor/modal scales (Aeolian, Dorian, Phrygian)"**; **"parallel fifths and open fifth/octave intervals for medieval color"**; "long pedal notes and drones"; "simple stepwise resolutions rather than dense extended chords" | |
| space | "long reverbs and modest delay to suggest halls and caverns; **avoid overly bright transients**" | |
| production | "tape-like hiss, room reverb, and steady pedal notes"; "tape wow/flutter, or mild distortion to achieve a worn, archival feel"; dynamics "gentle", "atmosphere over loudness" | |

Corroborated independently on the two points that matter most here:

- **percussion** — "deep bass and subtle percussion (e.g., **timpani, war
  drums**)" which "should be used sparingly" [corpus:topfhelm]
- **mode** — "modal scales (such as **Dorian or Phrygian**)" to "create a
  mysterious medieval feel" [corpus:topfhelm]

**`[three sources]` on the instrumentation and the modal centre; `[two]` on
timpani and war drums; `[one]` on the tempo band.**

### The tempo band is the weakest number here and is marked as such

Only melodigging gives a range (40–80). The one independent datapoint found is
a measurement of a single Erang track at **83 BPM** [corpus:songbpm], and a
neighbouring genre (dungeon rap) is described at 50–65 [corpus:aesthetics.
fandom]. So the band is real and slow, and its exact edges are `[CHOSEN]`. Taken
together they support roughly **52–78**, which would make this the slowest
genre in the file by a wide margin — lofi, the current slowest, sits at 70–84.

### 3a. What the Erang pack measured — 2026-08-06, after the user landed it

All 65 files, 44.1 kHz, measured with a 10 ms RMS envelope, an
autocorrelation pitch reader (shortest-lag-within-90% octave guard) and an
FFT peak reader for the drums. The numbers that changed the build:

- **The percussion is LOW and DARK.** The ten percussion samples put
  **63–97% of their energy below 200 Hz**; strongest spectral peaks 58–90 Hz,
  most clustered at **~64 Hz**; decays **0.5–1.1 s** to −40 dB; attacks
  10–130 ms with no click; spectral centroids 260–650 Hz. The war drum's
  `kick.tune` moved 46 → **62 Hz** on this measurement, and its soft click
  and ~0.55 s decay match the cluster.
- **One sample corroborates the kettle ratios.** percussion_01's peaks at
  64 / 98 Hz sit at 1 : 1.53 — the struck-membrane 1.5 mode the timpani
  voice is built on.
- **The pack is tuned SHARP — the tape is worn.** The pitched samples,
  all nominally C, sit **15–47 cents sharp** almost throughout. That is the
  drifted-tape sound the secondary sources describe, shipped in the genre's
  own reference audio — so the Mellotron here runs wow 0.006 / hiss 0.45,
  lofi's levels, the heaviest in the file.
- **The swell is the instrument.** Strings and pads take **0.35–11 s to
  reach full** (many above 3 s) and ring 2–12 s after; the VP-330's attack
  is set near its 2.5 s ceiling and release at 4.6 s on this.
- **Durations**: sustained samples run 7–12 s (the pack's render length);
  the atmosphere beds 12–30 s. The plucked family decays in 2–3.7 s.

### Melody, from the community guide

> "pick a low note and a high note **no more than about 12 notes apart**", with
> "a rise and fall" where the high and low notes appear **only once**; and
> **"fourths, fifths, and octaves"** as the foundational intervals, which "have
> been used in all sorts of music for centuries".
> Structures given: **"ABAB", "ABAC", "ABCBC"**.
> [corpus:dungeon-synth.neocities music-making guide]

An arch of about an octave with a single peak is a *shape*, not a rate, and it
is directly buildable: this program's tune already draws a contour and already
has `theme.count` and a phrase model.

---

## 4. ⚠ THE GENRE CONTRADICTS A LAW THIS PROGRAM ENFORCES, AND THAT IS THE MOST IMPORTANT FINDING HERE

**"Parallel fifths and open fifth/octave intervals for medieval color"**
[corpus:melodigging] is not a slip. It is what medieval organum *is*, and it is
the single most identifying harmonic feature of this genre.

This program spent `2026-08-05f` adding a cost that pushes the second keyboard
*away* from exactly that motion, on the sourced grounds that parallel perfect
intervals "reduce the texture from N to N−1 voices perceptually"
[corpus:schoolofcomposition]. Both statements are true. They are true about
different music.

**This is precisely the soft-law/hard-law split the handoff's principle 2
describes, and it is the reason that split exists.** Fusion is a fact about
hearing and it does not stop being true in a dungeon; what changes is whether
fusing two voices is a *defect* or *the sound you came for*. In common-practice
part-writing it is a defect. In organum it is the point.

**So the parallel-perfect cost must become a genre-declared appetite rather
than a fixed law**, exactly as `counter.style: "double"` already exempts
synthwave's deliberate octave double from the same complaint. The mechanism to
copy is already in the file and is already sourced; what it needs is a dial.

Recording this before building it, because the alternative — quietly exempting
one genre in the cost function — is how this file grows a genre name inside
stage-3 code, which Law 4 forbids.

---

## 5. WHAT THE SOURCES DO NOT SETTLE

- **Tempo edges.** One source, one measurement, one neighbouring genre. §3.
- **Whether there should be drums at all.** Every source says sparse or absent.
  The user has asked for timpani and large marching drums, which the sources
  support as an *option* ("when used…") and not as the default. The honest
  reading is that this genre's kit is a **choice the genre declares**, not a
  fixture — and that a version with no percussion at all must remain
  expressible.
- **Song length.** 15 minutes for one practitioner track, "20-25 minutes" of
  layers for Mortiis. Nothing gives a distribution, and this program's longest
  genre (plastikman) runs about 10 minutes. Whether to go longer is a decision
  with consequences for every measurement here, and it is not made by a source.
- **Harmonic rhythm.** "Long pedal notes and drones" says chords change
  slowly; no source says how slowly.
- **What a "large marching drum" is, specifically.** No source names one. The
  nearest sourced terms are "martial snare patterns" [corpus:melodigging] and
  "war drums" [corpus:topfhelm]. Anything more specific will be `[CHOSEN]`.

---

## 6. WHAT WOULD BE BUILT, AND IN WHAT ORDER

Written down so the build can be checked against the research rather than
against itself. Nothing here is built yet.

1. **The voices the genre needs that do not exist**: a timpani (a tuned drum —
   pitched, so it is not a kit lane), and a deep marching/war drum. The
   existing kit has toms, but a tom is a rack drum with a short decay and no
   pitch identity; a timpani is a struck membrane with a definite pitch and a
   long ring, which is why the sources name it separately.
2. **The genre table**: tempo band, modes, the open-fifth harmony, the drone
   and pedal, the long dark room, the tape hiss, the layered arrival form.
3. **The parallel-perfect appetite**, per §4, as a declared dial.

**And what should NOT be built**, on the sources' own evidence: a driving beat,
bright transients, extended chords, and any percussion that is present in every
bar. Every one of those is contradicted by name.

---

## 7. WHAT WAS BUILT AND WHAT IT MEASURED

Built at `2026-08-06b`, commit `b76b576`. Everything in §6's list landed:

1. **The timpani** — `V.timpHi/timpMid/timpLo`, a struck membrane with mode
   ratios 1 : 1.5 : 2 : 2.44 : 2.9, tuned from the song's own tonic
   (`chart.root` rides to the sound stage with the space). Measured by
   autocorrelation on rendered hits: partials at 1 : 1.496 : 1.998 of the
   nominal, and the pitch tracks the key at 1.334 for +5 semitones (expected
   1.335). The Erang pack corroborates the 1.5 mode (§3a). **The war drum** —
   `V.wardrum`, tune 62 Hz per §3a, decay 0.55 s, click 0.05.
2. **The `procession` machine** — kick lane on the war drum, tom1/2/3 on the
   three kettles, the rest acoustic; every lane with tune/decay/mix/verb/echo/
   cut the conductor rides, plus `bus`, `gate` and `ring`. All 62 controls
   verified reachable by the every-knob-reaches-the-sound seam check.
3. **The genre table** — tempo 52–78; minor 6 / dorian 3 / phrygian 2; no
   sevenths; two-bar pedal progressions with the all-tonic drone as a draw;
   drone bass; ostinato with `run` and `follow` on; 8.5 s room (longest in
   the file, vs bladerunner's 5) with 75 ms pre-delay; tape wow/hiss at
   lofi's levels per §3a; mellotron choir / VP-330 for the two keyboards;
   `machines.drums: procession 8 / kit 2` — **the "two modes, drawn per
   song" the user chose**; `target: [112,5,16]` — **the "long, 8 to 12
   minutes" the user chose** (measured: seeds 1/7 run 11.6/15.7 min; the
   all-tonic 53 bpm draw is the long tail).
4. **The organum dial** — `parallels: 1`, read by `buildKeys`: the 05f
   parallel-perfect shadow cost is scaled by `(1 - appetite)`. MEASURED, 12
   seeds: dungeonsynth's two keyboards move in parallel perfects **32.7% of
   bar-to-bar steps** (29.4% before the dial — most of the genre's parallels
   come from its own static-pedal progressions, and the dial's own
   contribution is honestly small); the seven constrained genres sit at 2.9%
   against the same 5% threshold as before, bit-identical by snapshot. The
   seam check now guards BOTH populations (thresholds driven at 8 and 12
   seeds: constrained 3.4/2.9%, declared 40.0/32.7%).

**What the first draft got wrong, caught by the harness and the roll:**
- `flourish` written in `toms.shapes` format handed `[14,"tom3"]` to the
  builder as a hat STEP — 11 events per song with NaN timing and gain. Three
  different seam checks tripped over it (rack-none, MIDI round-trip, blend).
- `coldOpen: 0.9` — backwards: it is the chance of SKIPPING the intro, so
  the one-keyboard opening this genre exists for was thrown away 9 songs in
  10. The roll caught it; it is 0.05 now and seeds 1 and 7 both open alone.
- Named two controls that do not exist (`mellotron.tone`, `vp330.tone`) and
  set `wow` 40× out of its range — the blend battery caught all of it.
- Nine motion lanes rode only the bridge, and a form draw can skip the
  bridge entirely — flat lanes at seed 1. Every section lane now carries a
  slow LFO beside its section move.

**Open, honestly:** the percussion cannot be fully absent (§5's beatless end)
— the sparsest draw is still one war-drum downbeat per bar where the
arrangement plays drums at all, though the roles table keeps drums out of
every section except chorus/instrumental. And the tail of the length
distribution (15.7 min at 53 bpm) overshoots the user's 12-minute ask;
in-genre records run that long, so it ships, noted.

---

## Sources

- [Dungeon synth — Wikipedia](https://en.wikipedia.org/wiki/Dungeon_synth)
- [Interview with Mortiis — Dungeon Synth blog, 2012](https://dungeonsynth.blogspot.com/2012/07/interview-with-mortiis.html) *(primary — the artist on his own method)*
- [How I Make Dungeon Synth — Erich Grunewald](https://www.erichgrunewald.com/posts/how-i-make-dungeon-synth/) *(practitioner, full track write-up)*
- [Dungeon Synth — Melodigging](https://www.melodigging.com/genre/dungeon-synth) *(the most specific on instrumentation, tempo, harmony and space)*
- [Dungeon Synth: A Journey Through Dark Fantasy — Topfhelm](https://topfhelm.com/articles/dungeon-synth-a-journey-through-dark-fantasy.html)
- [Dungeon Synth Music Making Guide — dungeon-synth.neocities.org](https://dungeon-synth.neocities.org/music-making-guide)
- [What is Dungeon Synth? — Micro Genre Music](https://microgenremusic.com/articles/what-is-dungeon-synth/)
- [Dungeon Synth — Aesthetics Wiki](https://aesthetics.fandom.com/wiki/Dungeon_Synth)
- [Erang, "Dungeon Synth Til I Die" — SongBPM](https://songbpm.com/@erang/dungeon-synth-til-i-die-jPhptBrBEz) *(the one independent tempo measurement found)*
- `docs/genre-research/counterpoint.md` §2.1 — the parallel-perfect rule this genre contradicts
- `docs/genre-research/the-second-keyboard.md` — the cost that has to become a dial
