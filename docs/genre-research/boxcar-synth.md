# BOXCAR SYNTH — the founding sheet of a new subgenre


> **THE BRANCH IS `claude/code-review-6jd9cz`.** All of this genre's work is
> there and nowhere else. `main` is a snapshot from 2026-08-03 and looks
> deceptively clean.
>
> **CURRENT BUILD: `2026-08-16a`**, published to the artifact at
> `https://claude.ai/code/artifact/b7004a11-15b7-4e76-be6e-dd39bb86ed06`.
> Battery 186/1 (the one red is the permanently ruled blend item, task #61).
> Guards: `harness/probe_journey.js` 11/11, `harness/probe_route.js` 6/6.
>
> **NOT ONE RECORD OF THIS GENRE HAS BEEN JUDGED BY EAR.** Every number below
> is evidence that the machine does what it says. None of it is evidence that
> it sounds good, and the owner is the only one who can say.
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

## 4c. THE TRIP PLANNER — the ride is planned, then the record is played

> *"I think we need to create a SFX route planner for the song that Simulating
> a train ride, this way the songs sfx is planned according to the trip."*
> — the owner, and this supersedes §4b below

**§4b drew a place per SECTION, and that is still backwards.** The landscape
changed only where the music changed — a train does not cross a river because
the verse ended. The planner turns it round: an **itinerary is laid out on the
clock first**, and the record is played against it.

The trip knows four things the song does not:

| | |
|---|---|
| **the stations** | the towns in order. The payoff sections are where this line has platforms, so the plan and the form agree by construction rather than by coincidence. |
| **the legs** | what is between them, filled end to end with terrain segments whose lengths are drawn **in seconds, not bars**. That is what frees the landscape from the bar line. |
| **the clock** | the ride starts at an hour and takes hours. Birds sing in daylight and not at night; the dawn chorus happens near dawn. A bird is not a texture, it is a fact about the time. |
| **the fronts** | weather is a system lying across a stretch of the LINE, so the train rides into it and out the other side. |

### The line, declared

| terrain | says | how often | length | a road crosses here |
|---|---|---|---|---|
| farm | the dawn chorus *(daylight)* | 45% | 35–65 s | 45% |
| open country | wind | **30%** | 45–90 s | 25% |
| woods | birds *(daylight)* | 80% | 30–60 s | 10% |
| a river | — it is **crossed**, not sat beside | 35% | 18–32 s | — |

`to` weights make it a real branch line: you leave the yard through farmland,
the country opens out, the woods come and go, and the river is somewhere you
go **over**.

### And the whistle signal finally has a place to be

§4 researched the General Code of Operating Rules signals and the program used
two of them. The third — **long–long–short–long, sounded on approach to a
public grade crossing, and still law** — had nowhere to live, because nothing
in the program knew where a road was. The planner does: a crossing is an event
on the line, the signal sounds at it, and the crossing bell answers as the
train goes over.

### Four defects the guards caught, each in one run

1. **The one-bed-per-record atmosphere came back**, because the gate named the
   old key and I renamed it — a river under the whole record again, underneath
   everything the plan had carefully placed. Twenty of twenty seeds.
2. **A leg resumed eight seconds after a station's downbeat**, which is eight
   seconds into a stop lasting half a minute: the countryside started up while
   the train was still at the platform. Thirteen stops with both a crowd and
   birds.
3. **A river segment could both sit by the water and cross it** — two rivers at
   once.
4. **A whistle was on the world channel.** A signal blown by the engine is not
   a place; it belongs with every other whistle in the record.

Guarded by `harness/probe_route.js`, which prints any record as prose and then
holds five claims over twenty records.

## 4d. AND THEN IT ALL DROWNED THE BAND — corrected 2026-08-16

> *"The world sounds are too lound they sre drowning out the whole thing"*
> — the owner, on build `2026-08-15y`

**Measured over 10 records, and he was right by a wide margin.** `V.atmos` and
`V.weather` write `ev.gain` straight onto a gain node, and the bank is
normalised, so the declared number IS the peak the event reaches:

| | was | now | for scale |
|---|---|---|---|
| rail one-shots — whistle, brakes, station, doors | **−7.3 dB** | −19.0 | the kick is −4.6 |
| a river crossing | **−5.9 dB** | −21.8 | the bass is −18.5 |
| terrain beds | −14.2 dB | −30.1 | the banjo is −23.4 |
| weather beds | −19.3 dB | −30.3 | |

478 rail events a record, every one at the kick's level, and a river louder
than the kick.

### The class of mistake, which is the part worth keeping

Build `15u` raised these because the owner could not hear the train. That was
TRUE AT THE TIME, and it was fixed properly afterwards by a different route —
the train became the drone with a level of its own [§3a]. The scene levels
were never re-measured, and the BAND then changed underneath them **twice**:
the train left the atmosphere, and the banjo and harmonica were normalised and
re-placed [banjo-and-harmonica-notation.md §3].

**A level set against a broken reference stays wrong when the reference is
fixed.** Every one of those changes was measured in isolation and was right on
its own; the RELATIONSHIP between them was measured by nobody, and there is no
guard in the harness that watches it. That gap is real and is not closed —
see §10.

The world is now four numbers — `WORLD.signal`, `.place`, `.pass`, `.weather`
— applied at the one door they all pass through, so it can be moved as a whole
without hunting six tables.

### 4d-ii. AND THE FIRST CORRECTION OVERSHOT — `2026-08-16b`

> *"Your correction broke the train and any other sfx associated with it."*
> — the owner, on `2026-08-16a`

Right, and **the mistake is visible in the name of the constant**: I trimmed
THE WORLD, and the whistle, the brakes, the station, the doors and the
conductor were caught by the same brush. They are not the world. They are the
STORY — the things that tell you the train is arriving, stopping, leaving —
and they belong forward of the countryside by a wide margin.

Rendered against the band's own rms, seeds 3 and 5, 120 s:

| | before `16a` | `16a` | **`16b`, shipped** |
|---|---|---|---|
| the train | −9 (designed) | −12.8, −13.2 | **−9.0, −9.4** |
| **its own sounds** | at the kick | −17.1, **−36.7** | **−11.2** |
| the landscape | −14.2 (drowning) | −27.2 | **−25.3** |

The **−36.7** is what proves it: on seed 5 the train's signals were 37 dB under
the band, which is not quiet, it is absent.

**And the train itself had drifted too, for the same reason as everything else
in this section.** Its constant was placed when the band was quieter, and the
band then GREW — the banjo roll went from one section function to 92% of the
record with twice the notes. It had slipped from its designed 9 dB under to
12.8. Raised 1.0 → 1.55 and re-measured.

**Three times in three builds, the same class of bug**: a level correct when it
was set, wrong later because something it was measured against moved. That is
now the top open item in §10.

## 4b. THE ROUTE — every section is somewhere, corrected 2026-08-15

> *"the enviromental sounds need a location and reason, is it rainy? Does it
> stop? Does it start again? Are we passing a river? Did this stop stop in the
> forest or a city? The SFX are part of the story of the song its not just all
> on at once"* — the owner

**Measured before the fix, and he is describing it exactly.** The scene was
ONE BED PER RECORD: a river that started at 0:00 and ran to the last bar,
under everything, whether the train was beside water or not. The weather was
the same — one bed for the whole record, so it could not start and could not
stop. And the thunder ran on its own clock: seed 3 had thunder at 0:00, 1:36
and 2:40 in a record whose rain does not begin until 8:00. Thunder out of a
clear sky, four times, before any weather at all.

That is the train-as-weather mistake one level up, and it is the same fix: a
sound needs a REASON, and the reason is where you are.

### The route is a walk

Each section gets a place, drawn as a walk rather than a shuffle — you do not
leave the woods and arrive back in the woods, and you do not cross two rivers
running. A place's bed sounds **for its section and stops**, so the river
approaches, you cross it, and it is behind you.

| place | what it says | how often it says anything |
|---|---|---|
| open country | wind | **35%** |
| the woods | birds | 85% |
| a river | water, birds by the water | always |

**The most important number in that table is the 35%.** A landscape that is
continuously making a noise is the "all on at once" being objected to; the
silence of open country is what makes the river mean something when it
arrives.

### A stop is somewhere too

A town is drawn a **city** or a **country halt**. The script is identical —
that is what a stop IS — but the place decides what you hear standing there: a
city has a crowd on the platform; a country halt has the birds carrying on,
because nothing has arrived there but you. Measured over 20 records: 37 city
stops, 23 country halts, and **never a crowd at a halt**.

### The weather is a spell

A record draws none, one or two spells, each two to four sections long, placed
on section boundaries with a dry stretch after. So a shower passes and the sky
clears, and a second one can come over later. **Thunder only lands inside a
spell** — no storm, no thunder.

### Read back, seed 3

    0:00  the yard      STOPPED   the conductor calls, the guard, the engine
    0:32  rolling                 birds by the water
    2:40  rolling                 wind over open country
    3:44  rolling                 a long whistle, the brakes
    4:48  A TOWN        STOPPED   the station, the valve, A CROWD — a city
    6:24  A TOWN        STOPPED   the station, the valve, BIRDS — a country halt
    8:00  rolling                 [rain begins] wind, thunder
   10:40  A TOWN        STOPPED   [rain] the station, the crowd, thunder
   11:12  pulling away            the conductor's bell

Guarded by `harness/probe_route.js`, which prints that table for any seed and
then holds five claims over twenty records.

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

## 8c. THE NIGHT — RESEARCHED AND SOURCED, **NOT BUILT**

> *"We need an owl for night time, Cicadias from japan like in neon genesis
> evangelion"* — the owner, 2026-08-16

The trip planner has a CLOCK [§4c] and night currently means only "no birds" —
silence. These are the two sounds that would make night a place rather than an
absence. **Found, licence-checked and downloaded; nothing is encoded and
nothing is wired.** Written down here so the next coder does not repeat the
search.

| what | recording | licence | why this one |
|---|---|---|---|
| the owl | **Barred owl** (*Strix varia*), Ixonia, Wisconsin, USA — iNaturalist obs 390921242, uncompressed wav | **CC-BY** | boxcar synth is an AMERICAN line. A tawny owl in Nebraska is wrong, and the barred owl's "who-cooks-for-you" is the sound of those woods at night. |
| the hot midday | **Minminzemi** (*Hyalessa maculaticollis*), Edacho, Yokohama, JP — obs 390985822 | **CC-BY** | the "miin-miin" that is shorthand for a hot summer day in Japanese manga |
| the evening | **Higurashi** (*Tanna japonensis*), Japan — obs 384278786 | **CC0** | the "kana-kana" dusk cicada; the melancholy end-of-summer sound, and the one cited as used in *Evangelion* |

**Two cicadas, not one, and that is the point:** minminzemi is NOON and
higurashi is DUSK. The planner already knows the hour, so they are two
different facts about the time rather than two textures.

**The BBC archive has no Japanese cicadas.** It is the source for every rail
sound [§6], and searching it returns Australia, Gambia, Mississippi, Tunisia,
Borneo and New Zealand; "higurashi" returns zero. Substituting an Australian
cicada would have been a lie about provenance, so the source moved to
iNaturalist, whose recordings are species-identified, located and licensed.

**What building it needs:** a fifth payload encoded by a script shaped like
`harness/rail_bank.py` (measured windows, 60 ms loop crossfade, ADPCM at
22050); a `night` terrain and a clock gate in the trip planner so the owl
calls after dusk and the cicadas by species-hour; attribution for the two
CC-BY recordings carried in the bank header and in §Sources; **and the level
measured against the band BEFORE the owner hears it**, which is the whole
lesson of §4d.

## 10. WHAT IS STILL OPEN — read this before starting

1. **NOT JUDGED BY EAR.** Every build listed here. This outranks everything.
2. **NOTHING WATCHES ONE LEVEL AGAINST ANOTHER, and it has now bitten three
   times in three builds** — §4d, §4d-ii, and the train's own drift. Every
   individual change was correct and separately measured; what is never
   measured is the RELATIONSHIP, so a level set against a reference stays put
   while the reference moves. **This is the most valuable unbuilt guard in the
   repo**: a probe that renders the band, the train, the train's own sounds and
   the landscape in one pass and holds each to a declared dB distance from the
   band would have caught all three the day they appeared. The measurement
   script already exists in scratch form — it only needs to become a probe with
   thresholds.
3. **The night is researched and not built** — §8c.
4. **The harmonica's sourced constraints are not enforced**: it can hold only
   the I and the V, and its bottom octave has no 4th and no 6th
   [banjo-and-harmonica-notation.md §2a, §2b]. Written down, not coded.
5. **The banjo deployment is from a TEMPLATE, not a performance.** The tab
   used is explicitly "not a transcription of any one break", so it cannot say
   how a player varies between his first and second break, or what he does
   behind a singer. That needs two transcriptions of the same tune.
6. **Task #95**: the passing envelope assumes the loudest moment sits at the
   middle of the sample; it should measure each pass sample's own peak
   position and align to it.

### FOUR FOUND 2026-08-16, AND ALL FOUR NOW BUILT — see `modal-jazz.md`

The owner, having listened: *"The songs can feel stale"* — and, asked what he
was hearing, he named all four of the harmony never moving, the same loop
returning, the record not building, and the town not feeling like an arrival.
Plus: *"Are we preplanning a route and using it to create the sfx and are we
using our fx racks to modulate the sfx."*

**Items 7–10 below were the findings. All four are now built** — phases 1–5 in
`docs/genre-research/modal-jazz.md` §7a–§7d, with the numbers. They are kept
here as the record of what was wrong, each with its outcome:

7. **THE TOWN HAS NO CHANGES OF ITS OWN, AND THE PARENT GENRE'S DOES.**
   Measured: `CHORUS HAS ITS OWN CHANGES` is **0/24 boxcar records against
   24/24 dungeon synth records**. `chorusProgressions` was built as the answer
   to "it's too static for far too long" and this genre, founded afterwards,
   never declared it — so the chorus falls through to `chords` at `:31450`.
   The chorus **is the town** here, so the arrival lands on the identical two
   chords as the countryside just crossed. Read off twelve seeds: **eleven of
   twelve records contain exactly TWO distinct chords**, over a mean 173 bars.
   *This is the cheapest real fix in the genre — one table entry, Law 3 draw,
   zero blast radius.*

8. **A STATED INVARIANT IS FALSE FOR THIS GENRE.** `:37092` skips the key lift
   when a record's middle is a chorus, "which is honest — the departure it
   already has is the chorus's own changes." True for dungeon synth, **false
   here** because of item 7: such a record gets neither. Five of twelve seeds
   showed no lift. Same class as §4d — a claim made false by something
   underneath it moving.

9. **THE KEY CHANGE FIRES ON THE BAR COUNT, NOT ON THE SUN.** §5 of this sheet
   says the key change IS the clock. The lift window is structural —
   `mid >= 0.40 * TOTAL && mid < 0.67 * TOTAL` (`:36787`), where `TOTAL` is
   bars — while the trip planner owns a real clock (`TRIP.hour0`, `hours`,
   `DAWN`, `DUSK`, `:37905`). **The two never meet**, so a record's dawn and
   its key change are unrelated events. §5 is, strictly, not built: the
   machinery exists and is aimed at the wrong thing. And the planner has **no
   musical authority at all** — `TRIP`/`ROUTE` are block-scoped and discarded
   at `:38168`, which is why `probe_route.js` re-derives the itinerary from
   the events.

10. **THE LANDSCAPE GETS NO EFFECTS, AND TWO SENDS GO NOWHERE.** A terrain bed
    is `BufferSource → one static Gain → channel → master`: no filter, no pan,
    no send, and **no `P()` call anywhere in `V.atmos`/`V.weather`**, so
    `motionAt` cannot reach them and no genre can automate them. Worse, the
    `scene` and `weather` channels' `sendRoom`/`sendEcho` nodes are built, are
    fed by `duck`, **and connect to nothing** — they sit on the `vinyl` bus,
    blind-plated out of all six FX columns (`:3266`) on a ruling made about
    *stylus crackle*; the two roles were added to that bus on 2026-08-15 and
    inherited it silently. Rivers and station crowds are recordings of places,
    and a place is what reverb is for. Meanwhile the train — the one rail sound
    promoted off that bus into an instrument — has six motion lanes and reaches
    the reverb. **The train has effects; the landscape it passes through does
    not.** The guard is "every send gain terminates somewhere", and
    `probe_deskgraph.js` / `probe_busedge.js` are its home.
    **BUILT** — the world has a `world` bus of its own with all seven
    crossings, and vinyl's six plates stay exactly as they were ruled. It is
    NOT opened flat: open country at speed has no room in it and a station shed
    does, so `motion.matrix.worldRoom` opens it in the town, which is also the
    one direction this genre's sends usually lack. Measured live at −49.1 dB by
    `probe_section_motion`. **The guard is still unwritten.**

### AND WHAT THE AUDIT OF 2026-08-16 LEFT OPEN

11. **`space.feeds: ["keys", "lead"]` IS A NO-OP, IN EVERY GENRE.**
    `routeBaseFor`'s Room case opens `keys` and `lead` **by name**, before it
    consults `feeds` at all. Eleven tables carry those two words as inherited
    decoration, so the declaration lies about what decides the routing.
    `probe_wiring`'s own lesson — "ask the question of the thing, not of the
    declaration" — records the symptom without naming this cause.
12. **THE SPRING COLUMN IS FED BY NOBODY.** `probe_wiring`: "Spring 0 <<<
    NOBODY USES THIS". A whole effect unit, built and reachable, that no genre
    has ever named.
13. **THE DECLARED PEAK AND THE DYNAMIC PEAK ARE DIFFERENT SECTIONS.**
    `form.energy.chorusPeak: 0.72` is the highest number in this table, but the
    chorus is the TOWN — no drums, no train — while `motion.trainbox.level`
    puts the train's own maximum in the **bridge** at `[0.18, 0.38]`. The table
    says the climax is the last town; the automation says it is the night run.
    Both are defensible, they are not the same claim, and nothing reconciles
    them. The comment beside `energy` half-concedes it: "arriving is a relief
    and not a climax".
14. **`trip.startHour` IS DEAD FOR THIS GENRE**, superseded by `chart.clock`.
    It survives only as the fallback for a caller with no clock; nothing in
    boxcar synth reads it any more.
15. **NO PROBE MEASURES WHETHER THE SAME NOTES ARRIVE SOUNDING DIFFERENT**,
    which is the entire claim of the stacked-cycle work.
    `probe_modulation`'s FREE column counts lanes whose autocorrelation never
    exceeds 0.60 — and it scores **plastikman, this file's own exemplar of the
    technique at 35 of 77 stacked lanes, at ZERO**. Boxcar reads 1 of 25. The
    device is demonstrably in (6 of 24 lanes carry two cycles, up from none)
    and the number that would confirm it works is measuring something else.

## 9. What is built, in phases (the plan of record)

Phase 0 this sheet + the rail payload · Phase 1 the hobo band
(banjo/harmonica/whistle/slide/kit lanes) · Phase 2 the genre table
(travel→town plan, town = payoff, keyShift dark→light, atmos on rail
beds) · Phase 3 the journey devices (brakes into town, two-longs out,
towns silence the track, the passing, the all-aboard) · Phase 4 the
gramophone/radio decay · Phase 5 guards and the battery. Blast radius of
a NEW genre: zero movement in existing genres (the ambient precedent,
measured), plus 300 new baseline rows.

**AND THEN SIX CORRECTIONS, ALL FROM LISTENING** — the owner heard each one
and every one was a real defect, not a taste call:

| build | what he said | what it was |
|---|---|---|
| `15v` | "how can it be [boxcar synth] if the train sound is not the backbone" | the train was WEATHER — one bed per record that never stopped, so nothing ever arrived. It became the `drone` role. |
| `15w` | "the Banjo is playing back to quite and even when i turn up the volume its still to low" | the roll handed its channel −38.4 dB against a bass at −18.5; a +12 dB fader cannot close 20. The dynamic was counted twice and the takes were never normalised. |
| `15w` | "we are not using them correctly ... we need more notes" | the four roll cells were INVENTED. Replaced with the eight named Scruggs rolls; the roll went from one section function to 92% of the record. |
| `15x` | "the train is fading in and out" | one drone note per material cycle, each with its own envelope — fourteen swells a minute. Abutting events now merge into one run. |
| `15x`/`15y` | "the SFX are part of the story ... its not just all on at once" | one scene bed per record. Now an itinerary is planned first and the record plays against it. |
| `16a` | "the world sounds are too lound they sre drowning out the whole thing" | the world sat 10–18 dB OVER the band [§4d]. |

Every one of those was invisible to a green battery. **The ear found all six.**

## Sources

**The night recordings [§8c], found 2026-08-16, downloaded and not yet built:**

- Barred owl (*Strix varia*), Ixonia, Wisconsin, USA — iNaturalist observation
  390921242, recordist `eric-schmitty`, **CC-BY**
- Minminzemi (*Hyalessa maculaticollis*), Edacho, Yokohama, Japan —
  iNaturalist observation 390985822, recordist `tokue`, **CC-BY**
- Higurashi (*Tanna japonensis*), Japan — iNaturalist observation 384278786,
  recordist `unipon`, **CC0**
- Searched and rejected: the BBC Sound Effects archive has no Japanese cicada
  recordings (hits are Australia, Gambia, Mississippi, Tunisia, Borneo, New
  Zealand; "higurashi" returns zero)
- On which cicada *Evangelion* uses: the series leans on cicadas throughout to
  hold summer all year (Second Impact shifted the axis), and higurashi is the
  species named in fan discussion of it — [TV Tropes, *Cicadian Rhythm*](https://tvtropes.org/pmwiki/pmwiki.php/Main/CicadianRhythm)

**The genre's own reading:**

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
