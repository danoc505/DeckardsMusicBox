# BOXCAR SYNTH — the founding sheet of a new subgenre

*Researched 2026-08-15. The owner is founding a subgenre of dungeon synth,
inspired by comfy synth, dinosynth, and dungeon synth: the railroad, the
hobo, the journey. Decisions the owner has already made: the name is
**Boxcar Synth** (`boxcarsynth`); the mood center is the **bittersweet
journey** (comfy warmth AND lonesome dark in one record); the conductor
speaks in **whistle-and-bell language**, with a synthesized far-off
"all aboard" as a rare accent. The owner's design brief, verbatim intent:
steam, tracks, conductor calls, "the brakes every so often signal stopping
in a town and then the change in the song", birds and rivers as the train
passes, "a change in key and tone to show the change of time from dark to
light" — and rule 5: "our genre is marked by its movement, not its stale
repetition, but the texture varied is something we do want."*

## 1. The parents

**Dungeon synth** — the five sheets already in this folder. What boxcar
synth inherits: the imagined past rendered on synths, lo-fi as commitment,
modal writing, the record as a place.

**Comfy synth** [Dazed, "The inside story of comfy synth"; RYM genre page;
Invisible Oranges digest #9]: born 2019 with Grandma's Cottage's *Cottage*
EP. "Calm, peaceful, or soothing, **often times melancholic and
bittersweet**", "low fidelity and hazy recordings", "**minimalist, looping
synth patterns and gentle melodies**", "plinking pianos and hazy
synthesiser arrangements". Themes are the wholesome small ("picking beans,
sipping on glasses of milk, going fishing") and its nostalgia is "a mix of
actual memories as well as **borrowed ones from an imagined simpler
time**". Boxcar synth takes: the warmth, the smallness of the tunes, the
bittersweet center.

**Dinosynth** [Dungeon Synth Wiki; admindagency]: "an extreme consequence
of dungeon synth logic — **if the point of interest is the (imagined) past,
why stop at the Middle Ages?**" And its method: DIEGETIC sound as a genre
marker (stock animal roars, documentary narration laid into the music).
Boxcar synth takes: the founding move (our imagined past is the American
railroad, 1880s–1930s) and the method (the train's own sounds ARE genre
material, not decoration).

## 2. The one law: MOVEMENT

The owner's rule 5 is the genre's constitution. Dungeon synth stands still
in a place; **boxcar synth passes through places**. The materials repeat —
comfy synth's looping patterns — but the landscape around them changes:
scene sounds rotate, instruments hand off, the register and the room vary.
Variation lives in TEXTURE, never in note-churn (the same criterion the
dungeon synth critique sheet holds: "simple, not simplistic"). A boxcar
record has a geography: it departs, travels, stops in towns, and arrives.

## 3. The train is the drummer — and the tempo is the speed

Standard American jointed rail came in **39-foot lengths** (cut to fit
40-foot gondola cars) [Wikipedia, Rail profile/track]. A wheel passes one
joint per rail length, so the click rate IS the train's speed:

    clicks per minute = mph × 5280 / 39 / 60 = mph × 2.256

    25 mph  →  56 clicks/min          40 mph  →  90 clicks/min

So a cruising local sits at **56–90 joint-clicks a minute — exactly a slow
musical tempo band**, and boxcar synth's tempo IS its train's speed, one
click to the beat. The "clickety-clack" doubling comes from the truck
(bogie): two axles a few feet apart hit the same joint as a quick pair —
a flam, not two beats — so the kit writes *da-da . . da-da*, pairs of
soft clicks, not a metronome. [derivation; the 39-ft length sourced]

**In town the track rhythm STOPS.** A standing train has no clicks — the
drums' silence in town sections is structural, the single most legible
journey fact in the whole design. What sounds in town: steam hiss (the
standing engine), the station, the bell, voices of the place.

### 3a. AND THE RUNNING SOUND IS THE GROUND — corrected 2026-08-15

The owner, having listened to build `2026-08-15u`:

> *"Its boxcar synth how can it be that if the train sound is not the
> backbone of the whole song? Its the drone for the genre... It needs to be
> automated just like a drone would be with lfo and fx... at times it should
> be louder at other times it should fade to the backbeat and be the heart
> beat that keeps the track moving."*

He was right, and what was wrong was **architectural, not a level**. Phase 3
played the run as an ATMOSPHERE BED: one event drawn per record, playing
continuously and quietly under everything. It never stopped. The drums
stopped in a town and the train did not — so nothing on the record ever
actually **arrived**, and the fact §3 calls "the single most legible journey
fact in the whole design" was silently destroyed by the way the sound was
wired. No amount of gain would have fixed it; `15u` raised the levels and
made the record louder without making it a journey.

**The run is the `drone` role.** That role is this program's continuous
ground — its own lane, its own machine (`trainbox`), its own mixer channel
and fader, its own lanes in the genre's motion table. Boxcar synth's ground
is the train, so the train is that machine, and three things follow without
being written:

| what the genre needs | where it now comes from |
|---|---|
| the run stops in a town | the town's `form.roles` does not name `drone` |
| the run has a fader | the drone strip already exists |
| the run is automated | `motion.trainbox` is read by the drone's own reader |

Read the arrangement column downward and it is the record: **intro** the
yard (standing) · **verse** and **instrumental** rolling · **chorus** THE
TOWN, no drums and no train · **bridge** the night run · **outro** pulling
away.

The level is the story, in the owner's own terms: back to a **heartbeat**
under the verses where the tune is speaking, **forward** in the
instrumental and furthest forward in the night run where the train is
nearly all there is, **receding** in the outro — plus an apex lane so two
records with the same sections do not tell it at the same moment.

**And nothing was surrendered to make room for it** [owner: *"If a drone
itself is needed then make it happen, your acting like there is some limit
when thats not how music works is it"*]. The harmonic ground goes on beside
the train: the bass still holds its pedal (`bassStyle: "drone"`), the
second keyboard still carries the choir pad. A layer is a decision per
record, never a budget.

### 3b. AND HERE IS THE LEVEL, MEASURED

Rendered, seed 4, boxcar synth, the train's own events against everything
else in the record — three windows, one per thing the design claims:

| where | the band | the train | the train is |
|---|---|---|---|
| a VERSE (the heartbeat end of the automation) | −23.6 dB rms | −32.6 | **9.0 dB under** |
| an INSTRUMENTAL (the going) | −19.4 dB rms | −28.9 | **9.5 dB under** |
| **IN THE TOWN** | −15.3 dB rms | **−240** | **SILENT** |

Three things to read off it. The town line is the whole build in one number:
the run is not turned down there, it is **absent** — −240 dB is the floor of
the arithmetic, not a quiet sound. The train comes **3.7 dB forward in
absolute terms** from the verse to the instrumental, which is the owner's
"at times louder, at other times the heartbeat" happening. And it stays about
9 dB under the band at both ends of its own story: audible, never swamping.

The first pass measured **2.6 dB under** in a verse and was wrong for a
reason worth keeping — a verse is where the automation puts the train at its
QUIETEST, so 2.6 dB under *there* meant the night run would sit ABOVE the
band. A level has to be judged at the loud end of its own curve.

Two engine facts the machine is built on, both audible rather than
decorative: a working engine is **never metronomic** (the DRIFT knob wanders
the playback rate, which is the regulator being worked), and it **comes off
the regulator before the platform** — the last run event before a town
carries `halt`, and slows to 55% of its rate over its final three seconds.
A train that simply stops at a bar line is an edit; one that coasts in has
arrived.

## 4. The conductor's language (the owner's chosen voice)

From the **General Code of Operating Rules** whistle signals [Trains
Magazine, "Whistle signals"; GCOR]:

- **two long blasts** — brakes released, train about to move: THE DEPARTURE
- **one long** — approaching a station: THE ARRIVAL WARNING (with the brakes)
- **long–long–short–long** — approaching a public grade crossing (still law
  today): heard mid-journey as the train passes a road
- a **succession of short blasts** — alarm (held in reserve; a record that
  never uses it is normal)

Plus the station/crossing **bell**. These are real railroad speech — the
section boundaries of the journey form get announced in it.

### 4a. THE STOP IS A SCRIPT — corrected 2026-08-15

> *"The breaks come before the stop and the train sound stops people get on
> the conductor makes a call before and after the train starts again."*
> — the owner

Phase 3 had step one and step five of that and nothing between, so a stop
was two effects rather than an event. It is now the whole sequence, **in
that order, at every town**:

| # | ARRIVING | the recording |
|---|---|---|
| 1 | one long blast — a station ahead | `railWhistle` |
| 2 | the brakes, running into the downbeat | `railArrive` / `railBrake` |
| 3 | **THE RUNNING SOUND STOPS** | nothing — the arrangement |
| 4 | the station stands, the safety valve lifts | `railTown` + `railValve` |
| 5 | the doors | `railDoors` |
| 6 | the platform | `railCrowd` |

| # | LEAVING | the recording |
|---|---|---|
| 7 | the conductor: *all aboard* | `railCall` |
| 8 | the doors again | `railDoors` |
| 9 | the guard's whistle | `railGuard` |
| 10 | the engine answers | `railDepart` / `railPeep` |
| 11 | **THE RUN STARTS AGAIN** | nothing — the arrangement |
| 12 | the conductor's bell, once it is moving | `railCbell` |

Steps 3 and 11 are the two that are not written anywhere, and they are the
two the genre is made of.

**The call is at EVERY stop.** Phase 3 drew it once a record, on the
held-back-colour argument — but that argument is about a colour, and a
conductor calling the train out is not a colour, it is what a conductor
does. The reserve is kept elsewhere: the alarm signal (a succession of
short blasts) is still never used.

**The script is driven off the arrangement, not off a section's name**: a
town is a section that does not carry the `drone` role, because that role
is the train. The same fact decides the sound and the story, so they cannot
drift apart — and the record leaving the yard stopped being a special case
(`departAtStart` is deleted), because the intro carries no train either and
the first verse is a departure like every other.

A real American steam whistle is a **chord** — multi-note chime whistles
(3–6 pipes) are why the lonesome sound is a cluster, not a note [Trains
Magazine; steam whistle references]. The synthesized whistle voice is
therefore a small pipe-chord with breath, not a sine.

## 5. Dark to light — the key change is the clock

The owner: "a change in key and tone to show the change of time from dark
to light." The program already owns this machinery (`keyShift`, built from
the Miles Davis modulations — docs/genre-research/key-shift.md): a
**zero-semitone shift with a mode change is the parallel minor→major** —
same tonic, the light switched on — and the LIFT restates the record's own
material in the new mode across the middle third of the record. Night
becomes morning over the same landscape, which is THE genre gesture.
`bridgeProgressions` therefore must include **major** (and likely
mixolydian — the folk dominant) so the derived mode-set contains the
light. Weighted so most records travel toward light, some travel into
night: bittersweet, per the owner's chosen center.

## 6. The scene material — sourced, licence stated

**BBC Sound Effects archive** (sound-effects.bbcrewind.co.uk), the "Age of
Steam" collection and the natural history library. Licence: the archive's
RemArc/BBC content licence permits **personal, educational and research
use**; commercial use is excluded. This program is personal and not
distributed (standing rule, README): the use fits, and the position is
stated honestly here as WEAKER than CC0, like the Philharmonia recordings
already in the file. What ships is a measured, trimmed, ADPCM-encoded
excerpt bank, not the archive.

The journey vocabulary, chosen from the catalog by description and length
(IDs are the archive's own):

| family | id | what it is |
|---|---|---|
| railRun (bed, loop) | 07041063 | steam train interior, constant run — the clickety bed |
| railRun (bed, loop) | 00008117 | train interior, second colour |
| railSteam (bed, loop) | 07045052 | letting off steam — the STANDING engine, the town's hiss |
| railStation (bed, loop) | 07035168 | station atmosphere, steam era — the town |
| railArrive (one-shot) | 07045054 | arrives at station: squealing brakes and doors — INTO TOWN |
| railBrake (one-shot) | 07041052 | screech of brakes, 20 s — the short brake signal |
| railDepart (one-shot) | 07045057 | departs with whistle at the start — OUT OF TOWN |
| railWhistle (one-shot) | 07041116 | whistle, then the train departs (Ffestiniog) |
| railClank (one-shot) | 07006097 | coupling trucks in a goods yard |
| railBell (one-shot) | 07071133 | level-crossing bell, train crosses |
| railPass (one-shot) | 07045051 | passes through the station without stopping — THE PASSING |
| railPass (one-shot) | 07006086 | fast goods train passing |
| sceneRiver (bed, loop) | 07044100 | small stream |
| sceneBirds (bed, loop) | NHU05008110 | dawn chorus in a wet forest |
| sceneBirds (bed, loop) | NHU05073129 | riverside at midday, birds and insects |
| railCall (one-shot) | 07044010 | a station P.A. — a HUMAN VOICE, indiscernible through the horn: the conductor |
| railGuard (one-shot) | 07045055 | the guard's whistle — the departure signal itself |
| railWhistle (one-shot) | 07045046 | a clean Great Western engine whistle, one blast |
| railBell (one-shot) | 07039387 | a conductor's bell: rung once, twice, four times |
| railDoors (one-shot) | 07041100 | doors slamming as passengers alight — arriving |
| railStation (bed, loop) | 07061111 | a platform of passengers before departure |
| railSteam (bed, loop) | 07045062 | standing, safety valve blowing — the engine WAITING |

Encoded by `harness/rail_bank.py` in the erang bank's exact row format
(name, fam, off, n, root −1, loop points measured/trimmed, pk), a fourth
payload beside ERANG/TAIKO/GURDY. Loopable rows are BEDS, one-shots are
EVENTS — the same measured split the atmos system already reads.

## 7. The hobo band — sources found

- **Banjo, mandolin, guitar** — the Philharmonia Orchestra samples (the
  contrabassoon's own source, same licence position, same fetch pipeline).
- **Harmonica** — VCSL (CC0): Hohner Special 20 diatonic in C and F, and a
  Super 64 chromatic. The blues harp is the hobo instrument.
- **Train whistle (toy)**, **Brake Drum** (a literal struck brake drum —
  freight-yard percussion), **Anvil** (spike driving), claps, cowbells,
  Strumstick, two upright pianos (the mission-hall piano) — VCSL (CC0).
- **The glass slide** — no free recorded bottleneck-slide set found; the
  voice is SYNTHESIZED honestly: a continuous-pitch lead (portamento is
  what a slide IS) with a resonant body, the ribbon/sax engines as
  precedent. Recorded here so the omission of a recording is a decision.

## 8. The era's decay — novel devices, not dungeon synth's tape

The owner: "are there other interesting degradation techniques we could
use to get our own novel sound?" Dungeon synth owns warped TAPE (and the
critique sheet's TDBS case shows decay as composition). Boxcar synth
records to ITS era's machines instead:

- **The gramophone / 78 shellac**: horn-loaded playback is a bandpass
  (roughly 250 Hz–3 kHz before electrical recording), constant surface
  crackle, and once-per-revolution wow — at 78 rpm one revolution is
  **0.77 s**, a slow pitch wobble no tape has.
- **The AM radio**: static bed, hard band-limit, slow tuning drift that
  momentarily detunes the whole record into noise and back.
- **THE PASSING** (the genre's own, novel): sounds that approach, pass,
  and recede — gain, pan and low-pass shaped by distance, with the pitch
  dipping as it passes (the doppler everyone knows from a train). Not a
  degradation of the record but a rendering of motion; no other genre in
  the program has it, and it is rule 5 made audible.

## 8a. WHAT PHASE 3 BUILT — the journey you can hear

The form already alternated travel and town, and the drums already stopped in
a town because the train is standing. Phase 3 is the other half: you HEAR it
stop and start, in the railroad's own language rather than in sound effects
chosen for drama.

- **Into a town**: the brakes. The squeal lands BEFORE the downbeat and runs
  into the section it ends — a train stops and *then* the town is quiet.
  Sometimes doubled with the short screech (drawn, 45%).
- **Out of a town**: the guard's whistle or the conductor's bell first, then
  the engine answers, then the music starts — the signal sits ahead of the
  downbeat because that is the order it happens in.
- **The conductor's call**: a real recorded platform announcement, a human
  voice indiscernible through the horn speaker. ONCE a record at most (70%),
  and never in the first town — the record teaches you what a town sounds
  like before a voice calls in one. The held-back-colour rule the dungeon
  synth thunder keeps.
- **The passing** — the genre's own device: a sound that approaches, passes
  and recedes. Four things at once, all of them distance rather than taste:
  it swells (measured −78 → −55 dB), the top opens and closes again (900 Hz
  → 6.5 kHz → 900 Hz, because air eats the high end first), it crosses the
  stereo picture (measured: the recede is right-channel only, the left at
  digital silence), and the pitch dips 4% up to 4% down as it goes by — the
  doppler everyone knows from a train. A couple per travelling section,
  drawn; never in a town, because a standing train passes nothing.

Fifteen to twenty-seven scene events a record, measured over eight seeds.
The genre opts in with a `journey` table naming which sounds play at which
boundary; a name the bank does not carry is skipped rather than faked. No
other genre declares one, so no other genre gained an event — measured.

## 8b. WHAT PHASE 4 BUILT — THE MEDIUM, with its numbers

Dungeon synth owns warped tape. Boxcar synth's era had two other machines,
and both are band limits with a noise floor and one motion of their own.
Built as ONE machine with a switch, inserted on the master after the tape and
before the limiter — a switch, never a blend, because half a band limit is a
comb filter rather than an old machine. OFF is two unity gains, so every
other genre renders exactly what it always rendered (measured).

**THE GRAMOPHONE** — an acoustic gramophone runs "about 100 Hz to about
8000 Hz", and even the 1925 Western Electric cutter's "cutoff frequency could
not be extended above 5 kHz" [pspatialaudio; hifisystemcomponents]. Shellac
is loaded with slate and "particles of slate contribute to the harsh
surface-noise". Its motion is arithmetic: a 78 turns once every 60/78 =
**0.769 s**, so an off-centre hole wobbles the pitch at **1.30 Hz** — once
per revolution, the one wobble no tape has. A horn is a resonator, so the
band pair is joined by a peak that honks (placement [CHOSEN] inside the
sourced band).

**THE AM SET** — "most commercial AM stations restrict their audio to a range
of 5 kHz", the widest standard band being "20 Hz–10 kHz", and "in 5 kHz you
can reproduce a human voice" [Radio World; NRSC-G100-A]. Its noise is
electrical: "electrical storms, engines, power lines... cause crackling,
static, or fading". Its motion is the slow drift of a set that will not hold
a station.

MEASURED, A/B on the same eight seconds of one record:

| | 400 Hz | 2 kHz | 7 kHz | 9 kHz |
|---|---|---|---|---|
| medium OFF | −83.9 | −72.4 | −98.7 | −106.2 |
| **gramophone** | −82.7 | **−72.1** | −100.7 | **−124.0** |
| **AM set** | **−93.1** | −78.2 | **−112.5** | −108.6 |

The gramophone keeps its middle (the horn's honk) and loses 18 dB of top;
the AM set loses the bottom AND the top and leaves the voice band. Which is
what the sources say each machine does.

**AND THE DECAY IS AN ARC, NOT A FINISH** — the dungeon synth critique's own
finding, built here as the genre's: WORN rides across the record (drawn, so
a record may clear as it travels or age into it), and the towns come up out
of the murk a little, because arriving somewhere is the moment you hear it
plainly.

**One defect worth recording**, caught by the A/B and not by reading: the
first version read the genre's declaration from a channel `setSpace` never
receives, so the band limit, the wobble and the noise measured byte-identical
to no medium at all. The file had already written the lesson down for the
tape — "a second channel for one more number is how the two get out of step"
— and the fix was to make the medium ride the same one.

## 9. What is built, in phases (the plan of record)

Phase 0 this sheet + the rail payload · Phase 1 the hobo band
(banjo/harmonica/whistle/slide/kit lanes) · Phase 2 the genre table
(travel→town plan, town = payoff, keyShift dark→light, atmos on rail
beds) · Phase 3 the journey devices (brakes into town, two-longs out,
towns silence the track, the passing, the all-aboard) · Phase 4 the
gramophone/radio decay · Phase 5 guards and the battery. Blast radius of
a NEW genre: zero movement in existing genres (the ambient precedent,
measured), plus 300 new baseline rows.

## Sources

- [Dazed — The inside story of comfy synth](https://www.dazeddigital.com/music/article/58365/1/the-inside-story-of-comfy-synth-the-internets-snuggliest-microgenre)
- [RYM — Comfy Synth genre page](https://rateyourmusic.com/genre/comfy-synth/)
- [Invisible Oranges — Dungeon Synth Digest #9: Comfy Synth](https://www.invisibleoranges.com/dungeon-synth-digest-9)
- [Dungeon Synth Wiki — Dino Synth](https://dungeonsynthwiki.com/Dino_Synth)
- [admindagency — Dungeon Synth aesthetic: the Middle Ages, a grandma's hut, and dinosaurs](https://admindagency.com/dungeon-synth-aesthetic/)
- [Trains Magazine — Whistle signals (GCOR table)](https://www.trains.com/trn/train-basics/abcs-of-railroading/whistle-signals/)
- [Strasburg Rail Road — the language of the train whistle](https://strasburgrailroad.com/train-whistle-meanings/)
- [Wikipedia — Train whistle / Steam whistle (chime whistles)](https://en.wikipedia.org/wiki/Train_whistle)
- [BBC Sound Effects archive](https://sound-effects.bbcrewind.co.uk/) (RemArc licence — personal/educational use)
- [VCSL — Versilian Community Sample Library, CC0](https://github.com/sgossner/VCSL)
- [Philharmonia Orchestra sound samples](https://philharmonia.co.uk/resources/sound-samples/)
