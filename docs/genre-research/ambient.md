# AMBIENT — what the genre actually is, before a table was written for it

*Researched 2026-08-14, in answer to: "I want you to then delete the progtechno
genre and replace it with an ambient genre. I dont believe that you have
actually built drones but if you have we have all the fx, instruments and drones
to make an amazing ambient genre built around drones."*

---

## 0. THE SCEPTICISM WAS CORRECT, AND HERE IS THE MEASUREMENT

Asked first, before any of the research below, because a genre "built around
drones" cannot be written until somebody has checked whether there are any.

Ten genres × six seeds, counting performance events that reach `V.drone` — the
only drone voice that existed in the file:

| genre | events on the drone voice | longest held note |
|---|---|---|
| bladerunner | 450 | **16.55 s** |
| lofi, synthwave, vgm, acid, plastikman, jungle, dungeonsynth, progtechno, hobbitsynth | **0** | — |

And the two genres that *say* they are drone genres:

| genre | declares | what actually plays the bass lane | longest held bass note |
|---|---|---|---|
| dungeonsynth | `bassStyle: "drone"` | `V.bass` | **4.80 s** |
| hobbitsynth | `bassStyle: "drone"` | `V.bass` | **2.54 s** |

`bassStyle: "drone"` is a rule about how the *notes are written* — hold the
root, do not re-strike when the chord has not changed. It says nothing about
what plays them. Both genres put `V.bass` on the lane, and `V.bass`'s own
comment in this file reads: *"V.bass's 25 ms 1.2 kHz attack click is a plucked
string, and a drone is not plucked."*

**So: one drone voice in the whole program — three sawtooth oscillators through
one lowpass — reachable from one rig, with no rack, no face and no controls of
its own beyond three knobs borrowed from the 303's chassis.** That is what "I
dont believe that you have actually built drones" was measuring, correctly,
from the outside.

`INSTRUMENTS.dronebox` and the `ambient` genre are the answer. This sheet is
what the genre was written from.

---

## 1. WHAT AMBIENT IS — the definition, from the man who named it

Eno's sleeve note for *Ambient 1: Music for Airports* (1978), the first record
released under the word:

> Ambient music **"must be able to accommodate many levels of listening
> attention without enforcing one in particular"** and **"must be as ignorable
> as it is interesting."**
> [corpus:wikipedia *Ambient 1: Music for Airports*]

And the distinction he draws from what already existed:

> "whereas conventional background music is produced by **stripping away all
> sense of doubt and uncertainty** (and thus all genuine interest) from the
> music, Ambient Music **retains these qualities**", and "is intended to induce
> calm and a space to think."
> [corpus:wikipedia, quoting the sleeve note]

**The decision-useful half of that is the second quote, not the first.** "As
ignorable as it is interesting" is the famous line and it is a *constraint*;
"retains doubt and uncertainty" is the *instruction*. A table written from the
first sentence alone produces wallpaper. The genre's own founding document says
the difference between ambient and wallpaper is that ambient keeps the
unresolved things in.

Which is why the `ambient` table's modes are mixolydian, lydian and dorian
first: the three whose characteristic degree does not pull anywhere. An
unresolved centre is doubt that never gets stripped away.

---

## 2. THE NUMBERS, AND HOW MUCH TO TRUST THEM

**Tempo.** The production guides converge and none of them is a strong source:

> "no strict BPM requirement, and many ambient tracks have no tempo at all…
> 60 to 90 BPM for dark ambient and meditation styles, 80 to 120 BPM for ambient
> electronic, and **40 to 70 BPM for drone and deep dark ambient**."
> [⚠ SEO tier — splice.com / unison.audio / beatkey production guides, search
> summaries only]

**Rated ⚠ and used anyway, with the reason stated:** three independent SEO
guides returning the same band is weak corroboration, but the *upper* half of
this program's own slowest genre (Blade Runner, 56–76) already sits in it, and
Wikipedia's independent statement that drone music is **"rhythmically still or
very slow"** [corpus:wikipedia *Drone music*] agrees on direction. The table
takes **50–64**, the drone end.

*(Written at 46–62 and lifted four beats after measurement. At the slower floor
the shortest record this genre can build broke the battery's rule that no genre
may be stuck above two minutes — a constraint about the length dial, not a
finding about the music, and recorded here so the number is not mistaken for
one.)*

**Envelopes.** The same tier, and the same treatment:

> "Pads need **2-8 second attack times**; fast attack makes them sound like
> synth leads, not ambient textures." [⚠ SEO tier]

MusicRadar's own drone-building walkthrough, a better source, is more extreme
still — **"attack 5 s / release 60 s"**, twenty voices, "set the Length to 10s"
— and is already recorded in `how-a-drone-evolves.md` §P.2. The drone rack ships
at swell 4 s / fall 12 s, which is the slow end of the first figure and well
short of the second.

**Reverb.** From the same MusicRadar walkthrough: **long reverb as a
compositional element, decay 10 s, 80% wet**. The table takes 9 s and 60% wet —
pulled back because in this program the room is shared and a 0.8 wet on a nine-
second tail buries the figure.

**Arrangement timescale.**

> "Ambient music arrangement operates on a much longer timescale than other
> genres — where a pop track might change **every 8–16 bars**, ambient changes
> can span **minutes**." [⚠ SEO tier]

The table's sections are **12 bars at ~56 bpm ≈ 51 seconds** — the longest in
the file, half again as long as Blade Runner's, which held the record before it.

*(Written at 16 bars and reduced for the same length-dial reason. Section length
is scaled down a ladder to 0.25× when a short record is asked for, and at 16
bars the bottom rung still could not reach two minutes.)*

**Sound On Sound, the one properly-edited production source found**, and it is
about texture rather than form. What it gives that is usable:

> "they don't follow a traditional verse/chorus/middle-eight structure"
> — reverb with **"a 6 or 12 dB/octave low-cut filter at 300-400 Hz, to stop the
> sound getting too muddy"**
> — bass "warm and simple, with a fair amount of repetition; they **underpin the
> track without demanding too much attention**"
> — **"Layering a long percussion loop an odd number of bars in length over a
> basic drum loop can also often maintain interest."**
> [corpus:soundonsound *Sound Design For Ambient Music*]

That last line is mechanism #2 from `how-a-drone-evolves.md` — periods that do
not divide — arrived at independently by a production magazine and stated as a
rule of thumb. It is the fourth independent tradition to name it.

---

## 3. HOW *MUSIC FOR AIRPORTS* IS ACTUALLY MADE — the only piece anybody has taken apart

A music professor's breakdown, track by track, and the pitch content is the part
nobody quotes:

> **1/1** is in **"D Mixolydian mode (D major but with C instead of C-sharp), a
> scale that evokes both medieval Europe and the blues."**
>
> **2/1** is restricted to **five different pitches: "A-flat, C, D-flat, E-flat,
> and F"**, creating **"floating tonal centers between Ab major and F minor."**
>
> **1/2** has "an arpeggiated chord mixed in among the single notes, the notes
> F, C and G. You could call it **F(add 9) (no 3rd)**."
>
> **2/2** uses "a note collection that suggests Bb major (B-flat, C, D, E-flat,
> F and G)."
>
> Instrumentation: piano (some **pitched down an octave via half-speed tape**),
> treated vocal loops, synthesiser. Eno "ditched" the guitar and bass from the
> original 1/1 improvisation.
> [corpus:musicradar, *A music professor breaks down Brian Eno's Ambient 1*]

**Three things follow directly and all three are in the table:**

1. **D Mixolydian is the lead mode**, at weight 5. Not a mood choice — the
   canonical ambient record's first track is in it.
2. **"Floating tonal centers between Ab major and F minor" is a
   neo-Riemannian R.** Ab major and F minor are relatives; R is the transform
   that swaps them. This program has `harmony.style: "plr"` and has had it since
   the Blade Runner work, and it is the one mechanism in the file that produces
   the effect the source describes. It is set to **0.30**, and that number is
   measured rather than chosen. It went in at 0.42 — the source gives no rate,
   only "floating" — and the blend battery failed: ambient x hobbit synth at
   50/50, seed 1, a **bass** note out of key and unresolved. **The cause is
   worth recording, because it is a general fact about this program and not
   about this table:** a PLR transform lands on a chord outside the key *by
   construction*, and a drone bass strikes the *root* of whatever chord is
   current — so a drone plus a high PLR rate is a bass sitting on a foreign
   root for a whole section. Clean at 0.30, still failing at 0.36.
3. **F(add9) no 3rd** — a chord with the third missing and the ninth present.
   `sevenths: true` is the nearest this program can express and it is not the
   same thing; the missing third is not currently sayable and is recorded as a
   gap in §6.

And the loop lengths, which are the mechanism and are already in
`how-a-drone-evolves.md` §4 — 23½, 25⅞, 29 15/16 seconds, **"not likely to come
back into sync again"**, with no parameter automated anywhere on the record.

---

## 4. DRONE MUSIC, AS A SEPARATE THING FROM AMBIENT

The owner's brief was "built around drones", and drone music is not a synonym
for ambient — it is older, narrower and better defined.

> **"a minimalist genre of music that emphasizes the use of sustained sounds,
> notes, or tone clusters called drones"**
>
> La Monte Young: **"the sustained tone branch of minimalism."**
>
> Characterised by **"lengthy compositions featuring relatively slight harmonic
> variations"**, and **"rhythmically still or very slow."**
>
> Mark Richardson, in Pitchfork: **"Timbre is reduced to either a single clear
> instrument or a sine wave, silence disappears completely"** and the focus
> becomes **"the base-level interaction between small clusters of 'pure' tone."**
>
> Young's *Trio for Strings* (1958) is **"the first work in the history of music
> that is completely composed of long sustained tones and silences."**
> [corpus:wikipedia *Drone music*]

**"The base-level interaction between small clusters of pure tone" is the
specification for the drone rack** and it is why the box is built the way it is
rather than as a filter with a knob on it. The subject is what happens *between*
tones — beating, coincident partials, the harmonic series locking or not — so
the controls are VOICES, STACK, SPREAD and DRIFT, and the face's centre panel is
a lamp that pulses at the actual beat rate rather than a number printing cents.

**Just intonation.** Drone practice, and Young's in particular, is built on
whole-number frequency ratios rather than equal temperament, because on a
*sustained* tone the tempered error is not a tuning nicety — it is an audible
extra beat. Equal temperament's major third is 14 cents sharp of 5:4 and its
minor seventh is 31 cents off 7:4. The rack's `PARTIALS` position stacks the
just harmonic series (1, 2, 3, 4, 5, 6, 7, 9) for that reason, and it is the
only place in this program where anything is tuned justly. *The specific set of
partials offered is `[CHOSEN]`; the principle is sourced.*

### 4a. HOW A DRONE RECORD IS PHYSICALLY MADE — added after the sheet had been used

*The first pass of this sheet asked what drone music **is** and skipped what its
practitioners **do**. That is the half that has numbers in it.*

**Phill Niblock.** The method, stated plainly:

> "a style of music built from **overlapping layers of sustained instrumental
> tones, usually multitracked recordings of the same instrument playing closely
> spaced pitches**." — "**The close, microtonal intervals create their own
> beats.**" — "There's **no melody, no change of dynamics and no pulse**."
> — *Early Winter* (1993) is "a typical specimen. Its **44 minutes** feature the
> Soldier String Quartet, two flutists and **38 channels of recorded sound**."
> [corpus:secondinversion, *Phill Niblock at 85*]

And the one hard number anybody gives for the detuning:

> layers "incorporated deliberate detuning, where pitches were intentionally
> offset from standard tuning (such as **55 Hz against 57 Hz**), producing
> acoustic 'beating' effects and complex harmonic interactions." [⚠ summary]

**55 against 57 Hz is a 2 Hz beat and the two tones are 62 cents apart.**

**Éliane Radigue**, who made her drone works on an ARP 2500 recorded live to
tape, uses beating as the subject rather than as a texture:

> beating tones are "a favorite technique that allows her use of **long tones to
> exist in an ambiguous place on the spectrum between pitch and rhythm**." [⚠ summary]

That sentence is the justification for the drone rack's centre panel being a
**lamp that pulses at the beat rate** rather than a number printing cents: the
quantity is on the boundary between pitch and rhythm, and a rhythm is something
you watch, not something you read.

**AND IT CAUGHT A DEFECT IN THE RACK, MEASURED.** SPREAD shipped with a range of
0–40 cents. At A1 with five tones on the harmonic series that whole travel
produces **0.07 to 0.63 beats per second** — and the only band anybody publishes
is **one to five** (`how-a-drone-evolves.md` #7), with Niblock's own offset
sitting at 62 cents and 2 Hz. The knob could not reach the practice it was
modelling, which is the same class of defect as a knob that does nothing. The
range is 0–120 cents now (DRIFT 0–60 with it); the **default is unchanged**,
because how much a record beats is a decision for the owner and the face prints
the consequence in hertz so it can be made by eye.

---

## 4b. GENERATIVE EURORACK, AND THE PATCH THIS PROGRAM CANNOT PLAY

*`modulation-and-the-eurorack.md` §5 covered this a day before the ambient table
was written, and I did not open it while writing the table. This is that section
spent, plus the Krell algorithm in detail, which it did not have.*

The generative brief, in the practitioners' own words:

> "Generative patches are created by connecting modules in such a way that they
> **basically play themselves with little or no interaction from the user**, yet
> the music evolves and changes **without repeating itself**."
> [corpus:macprovideo, via §5.5]

> generative ambient composition "focuses on **cycles, rates of change, and
> attenuating voltages** to influence a **slowly evolving but seemingly static
> form**." [⚠ summary]

The how-to sources agree on the same three moves, and all three are about
restraint rather than about modules:

> "**Modulate the tone as well as the pattern** to prevent things sounding
> stagnant" · use a "**slower rate of change**" with "subtlety, so **attenuate
> modulations**" · "play with different wave shapes for less predictable
> changes". Reverb "wet mix set to about **65%** and a long decay."
> [corpus:musicradar, *How to design an ambient drone with your Eurorack modular synth*]

> "using **modulation sources to control VCAs** allows you to set up a near
> limitless piece of music" · "logic modules, sequential switches, matrix mixers
> — control on tap" · "ambient music tends to run for longer and generally
> **doesn't remain static**."
> [corpus:musicradar, *How to use modular synths to create ambient music*]

The ambient table's 60% wet against that 65%, and its coprime LFO pairs against
"cycles, rates of change", are the parts already built. **What is not built is
the canonical patch itself.**

### THE KRELL PATCH, AS AN ALGORITHM

Todd Barton's, after the Barrons' *Forbidden Planet* score, released 2012 — the
patch every generative-ambient source names first. The mechanism, from a
textbook treatment rather than a forum post:

> "The heart of a Krell patch is a **voltage-controlled cycling envelope
> generator with an end pulse**, where the **rise and fall times are modified by
> random, periodically changing voltage**, and the envelope generator controls a
> VCA through which a VCO is heard, with **each end pulse triggering a sample
> and hold for a new pitch**." [⚠ summary]

> "the envelope **fires a trigger at the end of its decay stage**, and when it is
> in looping mode, that trigger is used to **fire the envelope again**." — "The
> SRV sends random voltages that the oscillator interprets as pitches, and
> because the SRV has the **correlation parameter, we can control how far each
> note is from the last note**." — sampling occurs "triggered by the
> end-of-cycle trigger from the main envelope."
> [corpus:olney.ai, *Computational Thinking through Modular Sound Synthesis*, ch. 14]

> the result is "**short trills of high notes and slow swelling bass notes**" —
> "a rhythm of slow, sustained notes interspersed with fast bursts of bleeps."
> [⚠ summary]

**Read that as a specification and every clause of it is unreachable here.** One
random source decides three things at once — *the pitch, how long the note
lasts, and when the next note happens* — and this program's four generative
kinds (`fm`, `sh`, `dejavu`, `bernoulli`) can touch **none** of them. Every one
of them modulates a **knob**. `modulation-and-the-eurorack.md` §6 item 4 said so
a day before this genre was written:

> "**Generative PITCH** — every one of the four kinds currently modulates a knob.
> **None of them can touch a note.**"

And the correlation parameter has an exact counterpart already in the file that
nothing generative feeds: `scaleStep`/`inKey` **is** a quantiser, and the
one-note-at-a-time constraint the alap sources describe (§5b of the drone sheet)
is the same idea as Marbles' correlation.

**So the honest position on this genre is:** the drone, the room, the coprime
modulation and the arrangement are built and sourced. The generative *voice* —
the thing that makes a eurorack ambient patch play itself — is not, it is named
here as the largest open item, and the ambient genre is the genre that most
wants it. It is backlog work, not a footnote.

---

## 5. WHAT THE TABLE DOES WITH ALL OF IT

The ranking in `how-a-drone-evolves.md` §4 is what the form is written against,
and the ordering is deliberately the opposite of instinct:

| rank | mechanism | where it is in the `ambient` table |
|---|---|---|
| **#1** | parts entering and leaving | **`form.roles`** — the drone alone, then a bed, a figure, a voice; and a **bridge where the drone itself leaves**. Nothing else in this file removes its own foundation. |
| **#2** | cycles whose periods do not divide | **every LFO pair on the table is coprime** — 23/29 = 667 bars, 31/47 = 1457, 17/23 = 391, against records of 48–112 bars. The drone rack's own two clocks are 23 and 29. |
| **#3** | discrete variation over an unchanged ground | the `sh`, `dejavu`, `bernoulli` and `occurrence` moves, which are step changes rather than curves |
| #9 | slow continuous automation | present, and understood as **texture, not form** — §6b of that sheet is the change-deafness result: half a room misses three semitones of continuous pitch change |

**The one thing that is genuinely new machinery** is that the drone's detune is
no longer static. `how-a-drone-evolves.md` §P.2 lists "unison detune driven by
an envelope, to make beating move" as **not built**, and "a second
high-resonance filter to amplify the meandering harmonic character" as **not
built**. Both are in the rack now: the detune is scheduled across each note by
the two free-running clocks, read off the *record's* time rather than the note's
so the phase belongs to the piece, and a high-Q bandpass sits in parallel with
the lowpass so a drifting partial swells as it passes through.

---

## 6. WHAT IS STILL NOT REACHABLE, STATED SO IT IS NOT MISTAKEN FOR A CHOICE

- **A chord with the third missing.** MfA 1/2's F(add9) no 3rd cannot be
  written: chord quality here is a table of triad and seventh shapes and there
  is no "omit" instruction.
- **A record with no tempo at all.** "Many ambient tracks have no tempo" —
  every note in this program is placed on a sixteenth grid, so the slowest
  possible thing is still a grid. `stepsPerBar` made the *count* declarable;
  nothing makes the grid optional.
- **Loops of incommensurable length.** The Eno mechanism is implemented as
  coprime *modulation* periods, which is the arithmetic equivalent for knobs.
  Two *parts* whose patterns are 15 and 16 bars long and drift against each
  other is still not expressible — it is gap 3 in
  `static-harmony-and-evolution.md` §4 and it is still open.
- **Accumulating sustained notes.** MusicRadar's "20 voices, attack 5 s, release
  60 s, notes pile up" needs note lengths that are not grid-derived.
- **A resonator.** The short-delay/near-unity-feedback unit named in
  `how-a-drone-evolves.md` §P.3 would be the most ambient-appropriate effect in
  the file and the echo cannot be made into one (`echo.div` is in sixteenths,
  `echo.fb` caps at 0.85). Backlog #62, still open.
- **Nothing here has been judged by ear.** Every claim in this sheet is about
  sources or about measurements of composed output. Whether the record sounds
  like ambient music is the owner's call and nobody else's.

---

## Sources

**Fetched and quoted from the page (second pass, 2026-08-14, added after "Did you
do research on ambient? On ambient drones? On ambient eurorack?"):**

- [MusicRadar — How to design an ambient drone with your Eurorack modular synth](https://www.musicradar.com/how-to/ambient-drone-modular) *(65% wet and a long decay; "modulate the tone as well as the pattern"; "attenuate modulations")*
- [MusicRadar — How to use modular synths to create ambient music](https://www.musicradar.com/news/how-to-use-modular-synths-ambient-music) *(modulation into VCAs; logic, sequential switches, matrix mixers)*
- [olney.ai — *Computational Thinking through Modular Sound Synthesis*, ch. 14 "Krell"](https://olney.ai/ct-modular-book/krell.html) *(the looping envelope, the end-of-cycle trigger, the sample-and-hold pitch, the correlation parameter)*
- [Second Inversion — Phill Niblock at 85](https://www.secondinversion.org/2018/10/02/phill-niblock-at-85-austere-unpopular-astounding-minimalism/) *(overlapping layers of closely spaced pitches; "no melody, no change of dynamics and no pulse"; Early Winter, 44 minutes, 38 channels)*

**Refused the fetcher and are therefore NOT quoted:** macprovideo *Making
Generative Music With Eurorack Synths* (403); Straebel, *Technological
implications of Phill Niblock's drone music* (503); james-saunders.com Niblock
interview (bot wall). The Niblock 55-vs-57 Hz figure and the Radigue
pitch/rhythm quote are ⚠ **search summary only** and are load-bearing — the
first one changed a knob's range — which is flagged rather than buried.

**Fetched and quoted from the page (first pass):**

- [MusicRadar — A music professor breaks down Brian Eno's *Ambient 1: Music For Airports*](https://www.musicradar.com/artists/the-album-was-played-in-laguardia-airport-for-a-brief-period-in-1980-but-travellers-said-it-induced-unease-and-sounded-like-funeral-music-a-music-professor-breaks-down-brian-enos-ambient-1-music-for-airports) *(D Mixolydian; the five pitches of 2/1; "floating tonal centers between Ab major and F minor"; F(add9) no 3rd)*
- [Sound On Sound — Sound Design For Ambient Music](https://www.soundonsound.com/techniques/sound-design-ambient-music) *(no verse/chorus; 300–400 Hz low-cut on the reverb send; the odd-bar-length loop)*
- [Wikipedia — Drone music](https://en.wikipedia.org/wiki/Drone_music) *(the definition; Young's "sustained tone branch of minimalism"; Richardson's "clusters of pure tone"; "rhythmically still or very slow")*

**Search summary only, marked `⚠` in the text:**

- [Wikipedia — Ambient 1: Music for Airports](https://en.wikipedia.org/wiki/Ambient_1:_Music_for_Airports) *(the sleeve note quotes; also fetched previously for `how-a-drone-evolves.md`)*
- splice.com *How to Make Ambient Music*, unison.audio, beatkey.app, musicproductionwiki.com — the tempo bands and the 2–8 second attack figure. **SEO tier, three independent restatements, treated as weak corroboration and labelled as such.**

**Already in this repo, load-bearing, not re-verified here:**

- `how-a-drone-evolves.md` — the ranking of long-form mechanisms; Eno's loop
  lengths; pibroch, alap, irama and ground bass; the change-deafness result;
  §P.2's list of what this program could not do, three items of which the drone
  rack now closes
- `static-harmony-and-evolution.md` §4 — gap 3, patterns of non-dividing length
- `bladerunner.md` — the neo-Riemannian work `harmony.style: "plr"` came from
