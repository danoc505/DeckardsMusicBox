# Handoff

`README.md` says what the program is. This says how it is worked on and where
it has got to. Read it before touching anything.

## What we are doing

The program makes records, and the whole difficulty is that a record can only
be judged by ear. Nothing here asserts one — the suite can be entirely green on
a program that writes confetti. So the work is always the same shape: find
something the program does badly, find a published account of how music
actually does it, build the smallest rule that follows, and measure whether it
changed anything.

## Where it stands

Two genres, `lofi` and `dungeonsynth`, both playable end to end. Five pure
stages — chart → form → arrangement → materials → performance — plus `sound/`,
each frozen on the way out. A record is a pure function of genre and seed, and
renders byte-identical at any block size.

**A part and what it plays are two different things, and the ceiling is in
ELEMENTS.** `ROLES` is six, and each pitched seat draws a JOB per material from
its genre's weights — foundation, pad, rhythm, lead or fills, Owsinski's five —
and a TEXTURE for it: line, arp, sustain, sparse. The keys can arpeggiate, the
counter can take the rhythm, and two seats arpeggiating at once is a draw and
not a rule. `MOST_ELEMENTS` in `arrange.ts` caps how many DISTINCT jobs sound
(four; five at a peak), in the unit both arranging sources and Huron's
numerosity figures actually use. The number of parts is not capped anywhere —
several parts on one job are one thing to an ear — so density emerges from what
the parts happen to be doing. `docs/genre-research/PARTS-ELEMENTS-AND-STREAMS.md`
is the research; `#element` lines in the dump and the line under each section
name on the roll say what each seat is doing. A drawn job that has nowhere to
stand gives way to the seat's own, and `Material.served` records which
happened — read that, not the draw.

**The suite has been run END TO END on this tree: 311 tests, 308 pass, three
fail, and all three fail identically on the commit before this work began.**
`npm test` in one go takes **12 minutes 40 seconds** — the "eight minutes" this
file used to claim was out of date, and `treat.test.ts` alone is most of it.
It was 307 tests before this session; the four added are laws it could state
for the first time — a board is one part's own, no board is wired to nothing,
a pedal keeps its own clock while the knob beside it moves, and an fx in line
is heard at the end of the board it is clipped to.

TWO MORE WENT RED DURING THE SESSION AND NEITHER WAS A BUG IN THE PROGRAM.
Both were laws written when an effect could only be a return, asked of a
program where it can also stand in a part's line; both were verified against
the behaviour BEFORE being touched, and what moved was the question, never the
code. `motion.test.ts`'s section-reset law was reading a per-part path
literally and comparing NaN with NaN, which is how it used to pass. See the
`pathOf` commit — the substitution now lives in one place instead of three.

THERE ARE THREE STANDING FAILURES AND THIS FILE ONCE LISTED TWO; the third was
found by an end-to-end run, not by the change that prompted it:

- ~~`arrange.test.ts` "the break goes below the floor mid-record"~~ **FIXED.**
  It failed because a break needed a bridge to land in; the break is available
  at span scale now and the test counts either scale. See item 6, which this
  closes.
- `material/index.test.ts` "a returning idea plays its statement's own figure"
  — **60** variants against a threshold of 90, from 69 before this work.
  Deliberate, and worse for a stated reason: see "what was just done".
- ~~`sound/tr1000.test.ts` is KILLED~~ **FIXED, and it was the test.** It
  spread a 1.1M-sample buffer into a plain array and handed two of them to
  `assert.deepEqual`, which on a difference builds a diff of the whole array —
  that was the SIGKILL, on both trees. Underneath, one assertion really was
  failing: a strip declared at its own defaults was NOT the same record as one
  not declared, because a render-time desk override is HELD over the whole
  record and a held kick strip stops the record's own `slacken` at bar 38.
  The law is about the machine, so it is now asked with the timeline emptied,
  the way `treat.test.ts` already does. 11/11 in eight seconds.
- `material/index.test.ts` "keys voice every tone of the chord, in register,
  led smoothly" — **not deliberate, undiagnosed, and older than this
  session.** It is not in any earlier tally, so it landed with the elements
  work, the counter, `LEGAL_TEXTURES` or the amen figure and nobody saw it,
  because the suite has not run end to end since before those. Somebody has
  to read it: it is the keys against a voicing law, which is the kind of
  thing the registers table above breaks from a distance.

**Anything else red is yours.** Item 1 below is making the suite runnable.
`src/stage/` is where the coupled laws live.

The registers each genre works in, since three of the last four changes were
here and they are easy to get wrong:

| | bass | keys | lead | counter | drone |
|---|---|---|---|---|---|
| lofi | 36–50 | 43–76 | 64–84 *(default)* | 50–66 | 46–60 |
| dungeon synth | 31–45 | 45–71 | 67–82 | 48–64 | 43–57 |

The counter's band is not free: `resolve.ts` refuses a genre whose counter and
lead sit closer than `counter.apart` at their centres, so moving the lead moves
this too.

They are a system, not four independent numbers. A part may not take a pitch
another part is already holding, so a band that reaches into another band takes
that part's seats — and the symptom shows up somewhere else entirely. Both
times this has gone wrong, the keys crowded the lead and the *lead's* tests
failed. Move a register and re-run the whole suite.

## How you test, and which test for what

**Anything that changes notes, or who plays when — the piano roll.**

    npm run roll <genre> <seed>     the record as a picture, about a second
    npm run shot <genre> <seed>     the same record through the built page

Roll the thing you are about to change, then roll it again after. It is the
only way to see whether a section is a return, whether a part ever rests,
whether the tune went anywhere. Look at the PNG before you say anything about
it. `docs/THE-PIANO-ROLL.md` is how to read one.

**Anything that changes the desk — the WAV, played.** Treatments move effects,
not notes, so a record with and without them draws the SAME roll. The roll
cannot see the desk and will tell you nothing changed when something did.

    node src/cli.ts <genre> <seed> --wav out.wav

**Counting — `tools/measure.ts`.** How a line moves, who plays which bar, the
same over twenty seeds. That is how the research below was measured and no
picture can do it. The character grid it draws is not a piano roll.

**A treatment — `tools/treatments.ts`.** The one thing neither the roll nor
`measure.ts` can see: a treatment moves the desk and not one note, so the MIDI
is the same MIDI and the picture is the same picture. This renders the record
with its desk emptied and again held under each treatment, and reports how far
the record moved, in dB. It is how a dead knob is caught, and it does not tell
you whether anything sounds good.

    node tools/treatments.ts                     every genre, seed 2
    node tools/treatments.ts lofi 2,7 --sr 44100

`npm test` and `npm run check` are preconditions, not proof: green means no
stated law was broken, not that the result is music.

## The research

Every rule in this program comes from a document, and each has the same shape:
the research, then what went into the program, then what it came to when
measured. Write the next one that way.

| `docs/` | what it settles |
|---|---|
| `THE-PIANO-ROLL.md` | how to read a roll, and what to look for in what order |
| `TALLY.md` | what is done, what is open, and what closes each open item |
| `BUILDING-THE-ALTERATIONS.md` | the six-phase plan for the full catalogue. Read before growing the treatment pool — Phase 1 is a hard blocker |
| `genre-research/MELODY-AND-THE-HOOK.md` | the tune: a figure that comes back, the contour it walks, the one wide leap |
| `genre-research/THE-INTRO.md` | how a record opens — three ways in — and the break. §7 is the worked example of a rule deleted for doing nothing |
| `genre-research/THE-ARRANGEMENT-AS-STORY.md` | who plays when, and why that is a narrative rather than a texture |
| `genre-research/THE-ALTERATIONS.md` | every way to restate something without rewriting it |
| `genre-research/DUNGEON-SYNTH-ARRANGEMENT.md` | what the genre says about its own middle |
| `genre-research/PARTS-ELEMENTS-AND-STREAMS.md` | a part and its job are two things — Owsinski's five elements, verbatim, with the instruments left open — and the ceiling every source states is in elements, not parts. §3a is what shipped and what it measured; §5 is why no stream constraint is built yet: the first measure of it measured its own parameter |
| `genre-research/EFFECTS-IN-TIME.md` | what a DAW does with a send over a song — the same move at different amounts, the build, the build that is dropped to land something, the effect saved for one place — and why this program can do none of them. The blocker is `specOf`'s signature, not the absoluteness rule |
| `genre-research/LOFI-LINEAGE.md` | what lofi descends from — the aesthetic, boom bap, jazz rap, trip hop — and the four places the genre file is running on a tutorial rather than on its own ancestry. Nothing applied |
| `genre-research/THE-STALENESS-CLOCK.md` | when a move must fire, counted per part. **STALE — it describes two designs that were built, measured and taken back out. Read it for the research and the failed attempts, not for what the code does.** |
| `genre-research/DOOM-AND-DUNGEON-SYNTH-BY-THE-FILE.md` | the first document here measured off RECORDS rather than prose: 30 Sleep and Electric Wizard transcriptions, 9 Burzum synth pieces, 17 Summoning, 8 Burzum metal, and 15 Mortiis tracks off their audio. §7 is the table of what it contradicts in `dungeonsynth.ts` — the arpeggio ban, the snare, phrygian's weight — and nothing is applied |

## What was just done

**AND THERE IS A POOL OF THINGS THAT BREAK THE ORDER NOW — `material/block.ts`.**
The owner's framing, which is the right one and worth keeping in these words:
"we have basic rules for music to be generated algorithmically correct? Well
music is not made like that normally, you need emergence of things to happen.
So we need pools of special things that break the order of things."

`treat.ts` was already exactly that pool FOR THE MIX — special things, each
refused where it would do nothing, none of them scheduled. What was missing was
its twin for what is PLAYED.

THE FIRST GO WAS FOUR BLOCKS OFF AN OFFHAND LIST — `tomroll`, `snarebuild`,
`stop`, `double` — chosen because they were the four named in conversation.
"For example" was read as a specification. `docs/genre-research/THE-BLOCKS.md`
is the catalogue that should have come first: twenty-six blocks in six layers,
grouped by the SHAPE of the interruption rather than by who plays it, which is
how the drum literature groups its own fills. §5 judges the four; §6 is the
build order and what has since been built off it.

**THE POOL IS NINE NOW AND IT REACHES EVERY SEAT.** The second finding was
worse than the first: measured over 120 records, every one of the 240 blocks
that fired, fired on the DRUMS — because `drawDrums` was the only call site and
the genre's pool was a field called `drums.events`. A tom roll could not happen
on the keys; nothing at all could happen to the bass.

The sources say a fill is a JOB and name the instruments that do it —
"electric lead guitar, bass guitar, organ, drums, strings, horns, voice … and
turntable scratching" (en.wikipedia.org/wiki/Fill_(music)) — and the taxonomy
the catalogue is built on is by FUNCTION: "all drum fills can be grouped into
three types: variation, tension, and notification" (hackmusictheory.com). A tom
roll and a keyboard run are the same notification on different instruments.

So a block declares HOW IT IS PLAYED ON A KIT and HOW IT IS PLAYED ON A LINE,
and either may be absent — an absence is a refusal in the same sense a socket
is. `tomroll` has no pitched half because a roll down the toms is a kit
gesture; `pickup` has no drum half because a grace note is a pitch. The genre's
pool moved out of `drums` to the top level as `blocks`.

| | |
|---|---|
| NOTIFY | `tomroll` (a drawn 1–4 beats now, not the whole bar), `empty` — the anti-fill |
| TENSE | `snarebuild` |
| VARY | `accent`, `drop`, `pickup` — the doom vocabulary, and `pickup` is the first thing here that can ADD a note |
| SUBTRACT | `cut` (was `stop`; it is the catalogue's row 15 and the name was the fault) |
| LURCH | `double`, `half` — half time is doom's own move and the program had only its opposite |

Each has a socket — the seat, the section's energy, whether this is the seam
out of a section, how many times the material has been heard, which lanes the
kit strikes, and the ladder of pitches the seat may write — and each OVERWRITES
a bar the figure, the phrase letter, the third-statement alteration and the
manner pass had already finished with.

THREE THINGS ABOUT IT THAT ARE THE DESIGN AND NOT DETAILS:

- **It is applied per TIME ROUND, not per treatment.** The beat is cached by
  treatment, so an event fired inside `drawDrums` would come back identically
  every time that treatment came round — which is another pattern, and a
  pattern is what an interruption is not. Addressed by the round, the same beat
  is interrupted on its fourth hearing and not its second.
- **Every socket requires the material to have been heard at least once.** An
  interruption on a first hearing is not one; there is no pattern yet to break.
  That is also the link to the rule of three — an event is one more way a third
  hearing can differ, and the only one that costs notes without costing a new
  idea.
- **Events belong to no genre.** A genre names which it allows and nothing
  else; how often one lands is the pool's own and the same everywhere, because
  a genre that could tune the rate would tune it into a pattern. Both genres
  take the default, which is all four.

THREE MORE THINGS THAT ARE THE DESIGN:

- **The VARY layer refuses a seam, and that is its definition.** "The function
  of a VARIATION drum fill is to spice up a section, for example halfway
  through a 16-bar verse" — halfway through, not at the end, because a gesture
  at a seam is read as a notification whatever it is made of. Measured with all
  nine fitting everywhere: `tomroll` fell from 12 firings in 60 records to 4,
  because at a seam the roll was one draw in nine instead of one in three. The
  layers have to refuse each other's ground or the commonest one eats the pool.
- **The seat's own laws decide, not the pool.** A block hands back a line and
  the CALLER judges it — register, scale, and nothing another part is sounding
  — so the laws stay where they already live. `drone.ts` now exports `isDrone`
  for the same reason: three blocks write lines that are correct on any other
  seat and are not a drone.
- **A stroke, not a note.** An accent leans on every note struck at that
  instant and a dropped hit takes all of them. A chord is one stroke, which
  `perform.test.ts` has held all along, and an accent on one note of a four-note
  voicing broke it on lofi seed 2 at bar 44.

Measured over sixty records a genre, with neither genre stating anything —
`node tools/blocks.ts`:

| part-rounds carrying a block | dungeon synth | lofi |
|---|---|---|
| all seats | 13% of 5873 | 13% of 3395 |
| drums | 22% | 18% |
| keys | 20% | 20% |
| bass | 17% | 14% |
| lead | 11% | 11% |
| drone | 5% | 3% |
| counter | 3% | 4% |
| which | half 166 · accent 162 · empty 115 · cut 99 · drop 79 · double 69 · pickup 57 · tomroll 5 · snarebuild 2 | half 130 · empty 91 · drop 61 · accent 54 · cut 36 · double 34 · pickup 21 · snarebuild 11 |

The pool still selects itself per genre without either genre saying a word:
lofi fires no tom rolls because it has no toms, and dungeon synth almost no
snare builds because its snare is now mostly empty. The counter and the drone
are low because their own laws refuse most of what is offered, which is the
laws winning.

**`REACHES` (0.28) is the number to point an ear at, and it now applies to six
seats instead of one.** It decides whether this is emergence or a new kind of
order, it is `[chosen]`, and no count can settle it — the honest version is the
rate above which a listener starts EXPECTING the next one. A record's TOTAL
interruption rate is six times what it was, and THE-BLOCKS.md §2 has a source
saying doom and sludge want blocks rarer and shorter than the pop default,
which the pool has no way for a genre to say. Deliberately: "a genre that could
tune the rate would tune it into a pattern." Whether that principle survives an
ear is the open question.

**And the pool picks flat among whatever fits**, so a block that fits almost
everywhere fires most. `accent` and `half` are half of all firings between
them. Nothing published ranks them, so nothing here does either — but `accent`
only moves a weight, so it is the one firing that the roll cannot draw.

**What is NOT built**: the SPOTLIGHT layer — the tacet, stop-time, the break.
Those are the bass solo and the drum break properly named, they change WHO is
playing, and that is `arrange.ts`'s to decide rather than the material stage's.
`block.ts` is deliberately only the half that rewrites bars a seat already
owns. THE-BLOCKS.md §3 layer 5 has the definitions.

**FOUR FAULTS THE OWNER'S EAR NAMED, ALL FOUR TRACED TO A LINE AND FIXED.**
The complaint was: the chords are too few a kind, every seed opens on chords
or a drone alone, the third repetition should alter the motif rather than
only the desk, and the bass "is an on or off, doesn't sound bass like".
Every one turned out to be a line nobody chose rather than a law, and two of
them were fields that could not do what their own comments claimed.

**The bass was a second drone, and `tones` was config nothing read.**
`drawBass` consults `tones` only for a strike that is NOT the downbeat, and
this genre's pocket was `[0]` at weight 3 against `[0, 2]` at 1 — so three
materials in four were one root note a bar and the whole tone pool was
unreachable. 1.17 notes per playing bar, 3.75 distinct pitches a record. A
one-note-a-bar low layer IS in these records, but it is the held one
(`DOOM-AND-DUNGEON-SYNTH-BY-THE-FILE.md` §4.6) and this program plays that on
the drone seat. Now 1.94 and 4.83, with `approach` in the pool and
`turnaround` stated. NO THIRD, deliberately: a third of these chords are
voiced as bare fifths to leave exactly that room.

**The `intro` pool cannot decide how this genre opens, and never could.**
`canIntroduce` leaves `hook` legal only where the character is the lead and
`rhythm` only where it is the drums or bass, so for a genre with no bass in
its protagonist pool every character admits exactly one way in but the drums.
MEASURED: `hook` at 400 against 2 gives byte-identical openers to `hook` at 1.
The weights are inert in twelve records of thirteen. They stay — the drums
character draws from them and they are not this genre's alone — but the note
is in the file now. `introParts: 2` was tried, on an argument the arithmetic
refutes, and it bought a second SUSTAINING part: openings on one part 83% → 0%
and `keys×7` → `keys+drone×9`. Reverted with the measurement kept. The lever
is `protagonist.lead`, 2 → 4: the opener carries the tune in 33% of records
against 17%.

**A chord could be extended or hollowed out, never RESOLVED into.** Every
quality `HarmonySpec` offered stacked more thirds (`sevenths`, `ninths` — both
lofi's, and `ninths` cites a lo-fi source in its own comment) or dropped the
third (`fifths`). A genre wanting neither had one chord. `harmony.suspended`
is the third replaced by the fourth, which is the colour this genre's sources
name and could not build — `chordName` has named sus2 and sus4 since it was
written and both branches were unreachable. Dungeon synth states 0.2 and now
has four chord qualities where it had two. Default 0, and lofi renders
byte-identical MIDI across seven seeds.

**AND A VARIANT DEVELOPS ITS KEYS NOW INSTEAD OF ROLLING THEM AGAIN — this is
the one to read.** The material stage already stopped INHERITING the keys, for
a good reason written at that line. But a redraw is a different line over the
same chords: it owes the statement nothing, so the third hearing arrived as
new music where the law asked for the same music changed. `varyLine` — thin,
augment, invert, retrograde, sequence, octave, every one of them documented —
had exactly ONE caller in this program, the lead, in a genre where the tune is
absent for the first third of the record and the keys are what the record IS.
The statement's own turn goes through the same operations in the same
try-each-from-the-drawn-one order, judged by the SEAT's laws (its band, and
nothing the bass or drone holds or rubs against) rather than the tune's. It
takes in 90% of dungeon synth variants and 96% of lofi's; what it cannot make
lawful falls back to the redraw, never to inheriting.

  statement onsets the variant also plays   dungeon synth 36% → **81%**
                                            lofi          64% → **93%**

`vary.ts`'s header said the variant keeps the keys note for note and had said
so since before the redraw landed — a comment saying the opposite of its code,
which is the one thing a comment here may not do. Rewritten.

**What is still unapplied from `DOOM-AND-DUNGEON-SYNTH-BY-THE-FILE.md` §7**:
the snare (row 2 — four of six kit files have none, and 60 of our records
carry 2,509 snare strikes against 292 cymbals), phrygian's weight (row 3 —
the corpus is phrygian 5 dorian 3 minor 0, the file is minor 4 dorian 3
phrygian 1, and `DRONE_STRINGS` in `spec.ts` cannot hold a flat second at
all), and rows 4–8.

---

### Before that

**THE GENRES HAVE BEEN READ OFF RECORDS FOR THE FIRST TIME, AND NOT ONE
NUMBER IS APPLIED.** `docs/genre-research/DOOM-AND-DUNGEON-SYNTH-BY-THE-FILE.md`
is the document; `tools/corpus.ts` is the tool, and `tools/smf.ts` is the
MIDI reader lifted out of `measure.ts` so both can share it (`measure.ts` and
the roll are byte-identical before and after on dungeonsynth 2, dungeonsynth
7 and lofi 42). The corpora are not in the repository — they are other
people's transcriptions of other people's records — and the document says
where each of the 87 came from and how the Songsterr ones were converted.

Four things in it are findings against lines in `dungeonsynth.ts`, and the
first is now APPLIED: **the Burzum synth pieces are full of broken-chord
accompaniment at one note a beat, 75–86% leaps, under a held layer** — and the
genre file pinned the keys to pad/sustain on the ground that the guide "does
not mention arpeggios at all", with `arrange.test.ts` asserting it. A prose
source's silence against a measured presence is the case the README says the
document settles first.

**AND THE FIX IS A CONSTRAINT, NOT A WEIGHT — THIS IS THE PART TO READ.** The
first pass wrote `pad 3 : rhythm 2` into the genre, which is a dial with a
measurement painted on it: nothing in those records says 60/40, and a genre
that states how often a thing happens has decided the outcome instead of the
conditions for it. What the records show is a RELATIONSHIP — one voice holds,
the others move, and which is which depends on how much room there is — and
**this program already had the sentence for it**, in `arrange.ts`'s own
ceiling: "several parts serving one element are one thing to an ear." Three
rules follow from that sentence and none of them was being applied:

- **`jobOf` — a seat takes the job nobody is doing, while the room has space
  for another job.** Once the room is at its element ceiling, the same
  sentence says the opposite and a seat with a choice doubles instead. Seats
  are asked most-constrained-first, so a part that can only be the pad keeps
  it and a part that can be either goes elsewhere. A genre states a
  capability; the arrangement states the outcome; neither states a number.
- **`shedTo` — a section loses a spare voice before it loses a job.** Losing
  one of two parts on the same job costs the ear nothing it can count; losing
  the only part doing a job takes a whole element out. They were priced by the
  same number, a position in a list of names. This is what lets a record keep
  its tune: the lead element has one carrier by law, so a tune is never spare.
- **`enter` is derived — a part bringing a job nobody else can bring does not
  queue behind one bringing a job the record already has.** The sourced law
  about entry is the PACE, one at a time (Johnston); the ORDER was a list, and
  a list cannot know what the record already sounds like. Dungeon synth named
  its lead FIFTH of six, so no record could have a melody in its first two
  sections — that read like a decision about the music and was the arithmetic
  of a list.

Measured over twenty seeds a genre: **the tune sounds in 48% → 51% of dungeon
synth's bars and 58% → 75% of lofi's**, and is in the last section of 20% →
35% and 35% → 45% of records; the opening is heard alone again 97.5% → 100%
and 38% → 54%; the keys take the broken chord in **48%** of dungeon synth
materials and **40%** of lofi's, which are not weights but what the constraint
came to — and lofi's file was not touched at all. **Two costs, reported as
costs:** the bass and the drums both serve the foundation, so one of them is
the spare voice in any busy room, and lofi's bass fell 84% → 66% of bars
(drums 79% → 68%); and the record's most-present part changes between halves
in 30% of dungeon synth records against 10%, which is the entry derivation
rather than the shed rule (with only the first two rules in it was 15%).
`arrange.test.ts` is 24/24; `all.test.ts` and `material/index.test.ts` are
29/31, the two failures being the two standing ones below.

**AND `Arrangement.intro` EXISTS NOW**, because two tests were reconstructing
which way in a record took from who was playing, and that guess stops being
right the moment a second part may arrive behind the opener. The arrangement
knows; it says so. The law did not move.

**WHAT DID NOT MOVE:** seed 2's tune still waits until bar 48 of 104. The
remaining gate is the walk-in PACE — one new part per section — and six seats
against six sections is a band bigger than the record has room to introduce.
That is the next line to look at, and it is sourced, so it wants an argument
rather than a number. The other three findings are not applied: four
of six kit files have no snare where
the genre states one always; phrygian is 5 of 9 pieces and 6 of 15 Mortiis
tracks against a weight of 1 in 8; and Mortiis's records carry a pulse four to
ten times stronger than this program's seed 2 (0.47 against 0.06 on the same
measure), so "primarily beatless" is not what the founding records are.

The doom side is groundwork for a genre that does not exist here: a band
playing 2–4-bar power-chord riffs at ~1.8 root changes a bar, three of four
parts sounding in every bar, the kit in 90%+ of bars from bar 4–10, a fifth to
an octave below this program's lowest note, at a crawl of 48–70 or a drive of
120–140. The design question before the numbers is §7's last row: the
arrangement stage is additive and a doom record is not.

**THE CHARACTER SHEETS ARE BUILT, AS FAR AS THE SOURCES REACH.** Five
commits after the protagonist field landed, each measured on and off over 200
records a genre:

- **The character is the same character in every scene.** Its job and
  texture are drawn once per record at their own address; every other seat
  still draws per material. lofi's character changed what it was doing
  between materials in **30%** of records; now **0%**.
- **The character is never held back.** `hush` is never aimed at it: **39%**
  of lofi's hushes and **41%** of dungeon synth's were. The yield around a
  protagonist runs one way.
- **Newcomers walk in one per two-turn boundary**, however many there are —
  the single walk-in generalised to a queue, with the overflow at the last
  boundary. Seed 42 went from two parts to six at bar 8; it builds now. What
  is left of "two or more arriving at once" (**25%** of lofi openings, 23% of
  dungeon synth's) is the PEAK, which has everyone by definition, and the
  tune, counter and kit, which are written per round and cannot walk in. Only
  34 lofi openings in 200 records involve two looping parts, all at a peak.
- **The keys pay to double inside another part's band** — `COST.mask` in
  `keys.ts`, on the foundation's band and the character's. Doublings only:
  priced on every voice the hand slid up into the tune's band (50% → 56% of
  keys notes above the lead's floor). lofi's keys in the bass band **16% →
  12%**, the tune on top **80% → 82%**, the hand 2.34 → 2.25 voices a strike.
  Dungeon synth unmoved. Chosen by sweep (0, 4, 6, 8, 12; whole voices and
  doublings) against the lead's floor.
- **A boxed-in tune re-enters.** The sweep found it: at every mask value one
  plain tune in 513 came out under the lead's floor, a different seed each
  time. lofi seed 94's line was pulled to the bottom of its register under a
  keys block holding every chord tone within a fifth, rested for want of a
  note, and `prev` stood where it stopped — five notes in bar 0, nothing for
  three bars, eleven semitones of free register above. A phrase that has
  stopped has ended; its next note is a new entry, a chord tone anywhere in
  the register, not the pitch it stopped on. **0 of 513, 0 of 356.** This was
  a builder that could be boxed in, and the mask only moved the box.
- **The bass loop adds one on its second turn.** `bass.turnaround`, a genre
  number, default 0: the tiled line gains an approach into the next turn's
  downbeat on the last off-beat of every even turn, drawn by the `approach`
  rule, shortening the strike before it, never where the pocket already
  strikes. lofi states 1. Second turn differs from the first **0% → 95%** of
  375 lofi bass materials (the 5% is the pocket already striking there);
  distinct bass bars per material **2.00 → 2.95**; one note more per
  material. Dungeon synth, which states nothing, is byte-identical.

**What the sheets still do not have** is in item 16: activity yield (the
others sustaining while the character speaks, which `counter.ts` does for the
lead alone), the foundation's section marker (the displaced snare), and the
archetype, which is the owner's to weight.

**A RECORD HAS A MAIN CHARACTER NOW, AND IT NEED NOT BE THE TUNE.**
`arrangement.protagonist` is a weighted pool over the six seats, drawn once
per record and held. The research is `THE-ARRANGEMENT-AS-STORY.md` §9-§13,
written from the sources this session: the hook is defined with no instrument
in it and "often incorporates the main motif" (Wikipedia, "Hook"), Burns's
typology has a whole class of RHYTHM hooks, a riff "often begins the song, and
is repeated throughout it, giving the song its distinctive voice" (BBC Radio 2),
and the records bear it out — Billie Jean and Seven Nation Army are bass
records, Be My Baby is a drum record, Blue Monday's vocal arrives after two
minutes.

**TWO ORDERS ARE DERIVED FROM IT AND NOTHING ELSE HAD TO CHANGE SHAPE.** The
record's `enter` is the genre's with the character moved to the FRONT — it is
introduced first, "allowing each to breathe and establish themselves before the
next enters the scene" (Johnston) — and its `shed` is the genre's with the
character moved to the END, because the character is the fixed point: an
ostinato "persistently repeats in the same musical voice" while "the upper
parts proceed normally with variation" (Wikipedia, "Ostinato"). The foundation
guard already refuses to drop the last name in `shed` while anything else is
standing, so the record's foundation IS its main character and no new rule was
needed for it. A genre whose character is already first comes out
byte-identical. `Arrangement.protagonist`, `.enter` and `.shed` are on the
frozen object; the dump says `#about`, `#enter`, `#shed` and the roll says it
in words.

Measured over 200 records a genre: the intro carries the character **100%**,
the break carries it **100%**, the ending carries it **100%**, and it is heard
with room round it mid-record in **65%** of lofi records and **98%** of dungeon
synth's, against 53% and 53% for "the opening heard alone again" before. lofi
draws keys 41%, drums 25%, bass 15%, lead 13%, counter 7%; dungeon synth draws
drone 42%, keys 38%, lead 14%, drums 7%. **Both genres state their own pool**
from what their own files already said about themselves — lofi's entry order
opens on the keys and its shed order ends on them; dungeon synth's guide
describes the pad character sheet almost word for word.

**THE INTRO AND THE BREAK BOTH HAD TO LEARN WHAT "SOUNDS" MEANS.** `loops()`
answers "may a part walk in mid-section" and the break needed a different
question: does this part sound on EVERY round? The tune's plan rests rounds and
the counter answers the tune, so a break carrying only one of those is a bar of
silence — `all.test.ts` caught it twice, dungeon synth seed 1 bar 72 and then
seed 34 bar 5, where a genre that opens on one part drew its tune as the
character and spent eight bars on nothing. `sounds()` is the predicate, the
break carries only parts that pass it, and an intro is guaranteed one — which
is what "the tune from bar one OVER whatever foundation the intro carries"
already said.

**AND THE FOUR THINGS THE ARRANGEMENT DIAGNOSIS ASKED FOR, before that.**
`docs/arrangement-diagnosis` was a reading of lofi seed 42 that named seven
faults. Four are fixed and measured over 200 records a genre:

- **The chorus is earned.** `chorus-is-earned` in `form.ts` refuses a chorus
  before a verse or an instrumental has been heard; the record's first section
  is exempt, because a cold open on the hook is documented. A chorus before any
  verse: **16% → 0%** (the 2-3% left is the cold open, which is the exemption
  working). Seed 42 was intro chorus chorus verse outro and is now intro verse
  instrumental chorus chorus outro.
- **The dead middle is gone.** The fast clock was switched off in the run-up
  and at the climax, so a chorus on a four-bar loop had one boundary in
  sixteen and every desk move landed in the verse and the outro. It runs
  everywhere now, and what is refused instead is the thing that was actually
  wrong — at a bar point in the run-up or the peak, expression may only go UP.
  Treated spans per 100 bars, lofi: run-up **4.2 → 28.7**, peak **2.9 → 25.0**,
  everywhere else unchanged. Peak spans holding back two things: **3% → 4%**,
  against a 10% law.
- **The break may be a SPAN.** It needed a bridge to land in, so 13% of lofi
  records had one and in the rest the opening was never heard alone again. The
  sources describe the same gesture at both scales and never distinguish them
  (`THE-INTRO.md` §5 now says so). A record has one break at whichever scale
  its form gave it room for, placed by the break's own rule — never in the
  run-up, which was measured: offered there it took the last boundaries of the
  build and 11 of 183 dungeon synth run-ups ended quieter than they began.
  The opening heard alone again: **53% → 70%** (lofi), **53% → 89%** (dungeon
  synth).
- **A rhythm intro keeps its hat.** The section refused `thin` for it — "an
  intro whose whole subject is the drums cannot introduce them with the drums
  taken apart" — and the span pool did not, so **29 of 31** rhythm intros lost
  the hat at bar two. Now **0**.

Three of the seven are not done and are item 15 below: the intro that builds
by nested variation, the keys voiced off the bass's band, and the verse thinned
to three attention-holders.

**AND ONE NUMBER WENT THE WRONG WAY.** `material/index.test.ts`'s "a returning
idea plays its statement's own figure" was 69 variants against a threshold of
90 on the commit before this work and is **60** now: the form law changed which
sections repeat an idea, so fewer variants exist to be counted. It was a
standing failure before and it is a standing failure now, deeper. The other
standing failure, "keys voice every tone of the chord", fails byte-identically
("A bar 0 voices 1 of 4") on both trees.


Recent work, newest first. One paragraph each; the reasoning is in the code
comments beside each number, and the measurements are in the commits.

**THE PAGE HAD A HALF OF ITSELF THAT WAS NEVER COMMITTED, AND IT WAS ALMOST
LOST.** The drive — the record as a city you look down while it plays — and
with it the "now desk" readout, the analyser tap and the fine-detail toggle,
were written straight into the published artifact in a session that never put
them in `tools/page.html`. `git log --all -S "drive-crt"` finds nothing, and
nor do the same searches for `nowdesk`, `analyser` or `setFine`. So the build
could not produce any of it, and republishing the build replaced the lot; it
survives only because the published page was read back first. It is merged in
now, three ways against the last page both sides shared, and the rescued copy
is kept in `docs/recovered/` until somebody is satisfied nothing else is
missing from it. **Read the artifact before you publish over it**, and if you
find yourself doing page work, it belongs in `tools/page.html` or it does not
exist. This is the README's "a second mechanism beside the first" with the
bill attached.

**THREE TREATMENTS WERE OFFERED AND SILENT, from one half-finished change of
mine.** When both genres came off their returns, `reach.ts` was taught that an
effect IN LINE counts as that effect being heard — and only three of the moves
were taught to write it. `waver` priced at −223 dB on dungeon synth and
`echoed` at −222 on lofi: not small changes, silence, and neither was refused,
so both genres kept drawing them. `brighten` was the same defect not quite
fatal: gated on a pole it never touched, doing only what the tape's lowpass
could. Fixed at the gesture with `fxWavier`, `fxEchoed` and `fxPole` beside the
`fxWet` and `fxLonger` that already did it right. **Reach and gesture have to
be taught in the same edit** — teaching one alone is worse than teaching
neither, because a refused move is honest and a dead one is a lie about what
the record did. `waver` −223.1 → −16.3 dB, `echoed` −222.2 → −20.7,
`darken` −10.4 → −6.4 with its centre shift more than doubled, and none of
them bought it with level.

**The rack's effects can be pedals on one part's line, at either end of its
board.** A rack unit is the record's, not a player's: the wet five are RETURNS
everybody sends to, and the inserts sit on the SUM after the mix. So there was
no way to put a spring on the bass and not on the flute, and no way at all to
ask whether the filter comes BEFORE the fuzz — the answer was always "after
everything". `sound.fx` is the same nine circuits wired the other way: one set
per part, each with its own knobs, its own mix, and an `at` of `first` or
`last` saying which end of that part's board it clips onto. Mono, because a
part's line is mono until the world places it; `master` is not among them and
cannot be, because it is the output ceiling and a per-part one is just the
part's level.

`at` IS THE POINT OF THEM, and it is tested as such. `rack.test.ts` renders
lofi's lead with a filter at each end: through the board — which carries an
overdrive, so it clips — the two differ, and with the board out of circuit
they are byte-identical, which proves the difference is ORDER and not noise.
LAST is the default on all nine, because the end of the line is where a rack
has always effectively been.

**AND BOTH GENRES ARE NOW ON IT.** The returns are retired: lofi's echo and
room and dungeon synth's pole, ensemble, spring and room all come back at 0,
and each part carries its own. What stays on the sum is the mastering chain —
the tape and the dust — because those are what the record was played back ON
rather than something one player has: six tape saturations is not one tube amp
working hard, and six independent crackles is six pressings rather than one
worn one.

Three things had to be carried across by hand and are worth knowing about.

**A WET EFFECT IN LINE ADDS, IT DOES NOT CROSSFADE**, which is `FX_ADD` in
`render.ts` and the same law `PEDALS_ADD` states for the octave pedals: the wet
is a second thing beside the note, and crossfading it takes away the note it
was made from. Six of the nine add — echo, spring, room, ensemble, flange and
the vinyl dust. The three that do not — the pole, the tape and the gramophone —
replace what they are given by nature, and a dry/wet on those is what the knob
means. THIS WAS GOT WRONG ONCE AND MEASURED: with all nine crossfading, the
sends were converted by `w / (1 + w)`, the wet's share of a crossfade, and
dungeon synth — six parts each with a room around 0.5 — came out **7.5 dB
quieter**, −13.5 to −21.0 dBFS. With the adders adding, a send carries across
as ITSELF: the mix is the send times the return, and nothing else.

**DISTANCE WAS NEVER IN THE SENDS** — a part's room feed was
`sends.room + world.depth * dist * 0.5`, so the far parts were in the room for
free, which is what made distance read as distance. Take the return away and
that cue goes with it unless it is carried. It is why lofi's drums and bass now
have a room at all: they never stated one and were always in it.

**AND AN IN-LINE ROOM STANDS WHERE ITS PART STANDS.** `Rig` runs before the
world, so a part's distance quietens and darkens its own reverb along with its
dry; a return came back at the master, at full, however far off the part that
fed it was. Which is arguably the more honest room — but it is not free. Lofi
is level either way (−17.51 → −17.51 and −16.86 → −16.78 dBFS, seeds 2 and 42),
because its world is 0.5 deep and its parts are close. Dungeon synth, 0.8 deep
with its parts at 0.5 to 0.8, is **1.2 to 2.2 dB quieter** (−13.47 → −14.69 and
−12.81 → −14.98) even with every send carried across exactly — partly that, and
partly because its room return was 1.45 and a mix only reaches 1, so its drums,
lead and drone wanted 1.00, 1.04 and 1.19 and are clipped at 1. **The levels
have NOT been raised to cover it.** Dividing a mix by `dGain` would be a fudge
factor bolted beside the world rather than a genre saying what it wants; the
darker, further church is the thing to listen to and judge first.

**THE BILL WAS THE TREATMENTS, NOT THE SOUND.** Retiring the returns killed
six of dungeon synth's moves and three of lofi's in one edit — `drench` and
`dry` scale the parts' SENDS and the sends are zero, `brighten` asked whether
the sum's pole was in circuit, `waver` asked for the ensemble RETURN. Those are
that genre's second and sixth most-used moves. The fix was in the question
rather than the moves: `reach.ts` gained `wetHeard`, which asks which wet units
are heard WHEREVER THEY STAND, and `treat.ts`'s `drench`, `dry` and `linger`
now write the parts' fx as well as the sends. Both genres are back to every
weight readable — 22 of 22 and 21 of 21, nothing refused.

**Two moves stayed dead and both genres dropped them.** `repatch` is returns
feeding returns and there are no returns; `soak` puts one drum LANE in the room
while the kit stays dry, which needs the machine's per-lane sends and a bus for
them to arrive on, and an in-line effect sits on the whole part and cannot tell
a snare from a kick. Both are the move losing its reason rather than its
plumbing. **The patch matrix is now unreachable from either genre** and is
still in the program; if no genre ever patches again it is a mechanism nothing
uses, and that is a question for whoever reads this.

**And `resolve.ts` had never let a genre state a per-part cycle.** It validated
a motion path literally and never substituted `at` for the `*`, the way
`motionAt` does at read time — so `fx.*.pole.hz` was refused as "not a knob".
The feature is documented in `motion.ts` and was unreachable from the day it
was written; nobody noticed because no genre had wanted a per-part cycle until
the filter moved onto the parts. Fixed where the defect is.

**Turning a pedal's knob is an ALTERATION, and now it is one.** The catalogue
had a row for how much of a board a part walks (`push`/`ease`) and a row for
which box on it is lit (`stomp`), and no row at all for the knobs on the box.
Twelve pedals carry about forty of them and one treatment reached two, the
tremolo's and the phaser's depth. Four moves fill it, in two pairs because
these are two gestures: **`grind`/`clean`** turn the gain knob of every
clipping pedal a part carries, and **`starve`/`revive`** turn the supply's
droop, the battery and the Fuzz Face's bias — the rig failing rather than
working. Scaled from the genre's own numbers like everything else here, so a
pedal a genre left clean stays comparatively clean; a pedal not on the board is
skipped; and `reaches` refuses the pair a genre has no box for.

Measured with `tools/treatments.ts`, which is what it is for. `grind` is
**−16.0 dB** on dungeon synth and **−25.9 dB** on lofi, `clean` −16.2 and
−27.4. **On lofi they are the loudest moves that board has**, ahead of `stomp`
(−26.5), `ease` (−30.4), `waver` (−31.0) and `push` (−31.3) — every other
board move works on the feed or on which box is lit, and turning the box's own
knob turns out to be the louder lever. `starve` is −29.5 on dungeon synth,
which is the faintest thing that genre would carry, so it is weighted like
`sweep` at −28.1: stated, and rare. lofi refuses both supply moves at −222 dB
because its board has no sag and no Fuzz Face, which is the refusal working.

**And `revive` was measured and not stated**, which is the fourth move and the
one to read if you are adding a fifth. At −38.9 dB it is the faintest offered
move in either genre's table, and the reason belongs to the genre: dungeon
synth ships `sag.idle` at 1, a fresh battery, so the only half of the move left
is lowering the droop. **Nothing forced it out** — `treat.test.ts` passes with
it weighted and its floor sits below −38.9 — so this is a judgement that a
boundary is worth more than the quietest thing the desk can do, recorded here
so somebody who disagrees can reverse it in one line. It stays in `TREATMENTS`
unstated, the way `recircuit` does.

ON THE POOL BLOCKER, because the next person will hit it. `BUILDING-THE-
ALTERATIONS.md` §2 says do not grow the pool until three things are fixed.
Blocker 0 is already fixed and `TALLY.md` records it; blocker 2 is about going
from two layers to eleven. These four are more moves in a layer already
represented — §8, the desk — exactly like `stomp`, `waver`, `linger` and
`medium`, which all went in the same way. That is why they were added and why
the blocker still stands for Phases 2 to 5.

**A board is TUNED now, not rebuilt, which is what makes a pedal
automatable.** `pedals.ts` had no `set` on anything: every pedal took its
numbers in the constructor and kept them `readonly`, so the only way to change
one was to build a new one — and `Channel.tune` did exactly that whenever any
number on the board differed, while `retune()` runs every `RAMP_STEP` samples
for as long as anything on the desk is moving. So automating one knob rebuilt
twelve units 21 times a second, and a rebuilt pedal has lost everything it
knew: the tremolo's clock, the wah's and the phaser's sweep, the compressor's
1.5-second release, the divider's flip-flops, the sag's rail part way through
collapsing. **Measured on lofi's lead: automating a knob BESIDE the tremolo
cost the tremolo 82% of its wobble, 0.0894 down to 0.0161.** It was an
accident and not a law — nothing in `docs/` forbids retuning a pedal, and
`Channel`'s own header claims the opposite ("the units are held rather than
rebuilt … `Biquad.set` keeps its history"), which was true of the world and
false of the board the same class owns. Twelve `set` methods later, a `Board`
is REBUILT only when a pedal goes on or off it — which is what a board IS,
since mix 0 means off it — and TUNED for every other number. The three sweeps
carry a phase offset so a moved RATE does not jump, arranged so that a rate
which never moves leaves the offset at zero and `rate * t + 0` is bit-for-bit
`rate * t`. Every pedal knob is now in `CONTINUOUS` too, so `stomp`'s mix
change drifts instead of stepping. Records come out byte-identical EXCEPT
where a board treatment actually lands: lofi 42 and both dungeon synth seeds
are identical, and lofi 2 differs by −42.9 dB because it fires `waver`, the
one treatment that touches a board. `rack.test.ts` holds the law and bites —
reverted to the old rebuild it fails with 0.0161 against 0.0894. `treat.test.ts`
is the one that matters most here and passes 13/13: it renders every treatment
of every genre, `waver` and `stomp` among them, which are the two that touch a
board and the two this change alters.

**And no genre states a pedal cycle, because both were measured and neither
earned it.** This is the knob that was built, measured and deleted, and the
note is kept so nobody spends the day again. lofi: `EFFECTS-IN-TIME.md` §1B
quotes soundonsound almost as an instruction — "draw in a tremolo that gets
steadily deeper and faster as each chord decays" — and lofi's lead has exactly
that tremolo, so a one-bar ramp on `pedals.lead.tremolo.depth` and `.rateHz`
was written, a bar being a chord in this genre's two-bar loops. It moves the
LEAD by −21 to −24 dB and **the record by −34.6 to −39.9 dB**, and this
program REFUSES `brighten` on lofi at −37.7 dB as doing nothing. Depth is not
the lever: 0.5 → 1.0 buys 2.4 dB. The cause is structural and already written
down — lofi puts one part on the board and feeds it 0.35 (`TALLY.md` §2) — and
widening lofi's board to rescue the number is tuning a measurement, which item
14 below says not to do. Dungeon synth's board IS walked hard (bass 0.85, keys
0.7, drone 0.55) and the same move on the Muff's cab corner measures −27.9 to
−29.5 dB, inside that genre's shipped range. It is still not built, for a
different reason: the only source for it is musicradar's "open a low-pass
filter by a few percent each time the loop repeats", and this genre ALREADY
spends that sentence on `rack.pole.hz`. A second gradual brightening beside
the first is a knob that does what the knob beside it does. If a source turns
up for a moving pedal in either genre, the mechanism is waiting and the
numbers above say what to expect.

**And dungeon synth's two false comments are true now.** The mechanism below
was landed byte-identical on purpose, so this is the commit where the record
changes, and it changes for a reason already written in the genre file. The
divider comes off the PAD — "it tracks single notes and not chords, so it is
the bass and the drone that get it, and the pad must not clock it" — and the
FLUTE loses its board entirely, because the mix's own comment calls it "the
one voice in the room that is not coming out of an amp" and it was going
through a Big Muff at 0.15 of the feed. Its feed goes to 0 with it: a feed
into an empty board is a knob wired to nothing, and `reachesPart` would have
credited `push` with reaching a part that cannot hear it. Nothing else moves —
the drums, the bass and the drone keep the whole rig, because no comment and
no source says otherwise. Measured: **not one note moved.**
`measure.ts --sweep dungeonsynth 1 20` is byte-identical on `--map` and
`--parts`, so who plays which bar, who opens, thinnest, fullest and the peak
are all exactly as they were; the roll of seed 2 is byte-identical as a PNG,
spans and treatment strip included; and the offered vocabulary is 21 before
and after — the only difference is that `waver` and `stomp` no longer claim
to reach the lead. The RECORD moved **−20.7, −19.4 and −19.4 dB** against itself
on seeds 2, 42 and 7, and 0.2–0.3 dB louder; on this genre's own scale in
`THE-ALTERATIONS.md` that sits between `push` (−19.1) and `widen` (−22.0),
above `darken` at −13.0. Priced per part on the part alone: the flute moves
**−20.7 to −23.1 dB** and comes back 0.6 dB LOUDER without the Muff eating it,
and the pad moves **−11.3 to −12.7 dB**. `all.test.ts` gained the law that
would have caught the feed: no genre may light a board it feeds nothing, nor
walk a part into a board with nothing on it. Neither half could be asked
before a board belonged to a part.

**A pedal board belongs to a player, and there are six of them.** `SoundSpec`
had one `pedals: PedalsSpec` under the whole band and `render.ts` built every
part's chain out of it, so a genre could not say "the Muff is the bass's". It
was an ACCIDENT and not a law — no document in `docs/` states it, the README
said the opposite, and the line was `board(S.pedals, sr)` — and it had already
made two of this program's own comments false: dungeon synth's divider says
"it is the bass and the drone that get it, and the pad must not clock it" and
the pad was clocking it at 0.7 of the feed, and the same genre calls its flute
"the one voice in the room that is not coming out of an amp" and then ran it
through the Muff. `sound.pedals` is now six boards keyed by part; `mix[role].
pedals` still says how much of a part walks its own board. `boardWalked` asks
both halves of the same part (it could not before — it asked "is anyone fed"
and "is any pedal up" of different parts), `stomp` swaps the first and last
box on each player's own board, `waver` deepens the wobble on each board that
has one, and `reachesPart` reads the parts a board move names instead of
crediting everyone who happens to be plugged in. Motion reaches a board by
path as before, now `pedals.bass.muff.mix`, and `pedals.*.tremolo.depth` with
`at` makes a per-part move sayable. Both genres were migrated to the boards
they already had — lofi's overdrive and tremolo are the lead's, which is what
its comment always said, and dungeon synth hands the one rig to every part —
and **six records over both genres came out byte-identical**, which is the
migration and the test. The next commit is what to do with it.

**And every pedal wears a bank of switches, one per part.** `tools/page.html`
had one board and one set of knobs; there are six boards now and still one set
of knobs, so each pedal carries a DIP bank of the record's parts and only ever
one is thrown. The face under it — the knobs, the lamp, the footswitch — is
whoever is thrown, and the others are held in the overlay untouched, so each
part keeps its own settings for the same pedal. Each pedal chooses on its own:
the bass's Muff can be on screen beside the keys' phaser. A part the matrix
sends nothing to is greyed rather than hidden, because its board is real and
only its feed is zero, and moving that feed in the matrix re-marks the
switches.

**The drums may play the amen, chopped.** `FIGURES.amen` in `spec.ts` is a
two-bar transcription of the break (kick, snare, crash, in beats); a genre
weights it against its own pockets in `drums.figure`, and `drawFigure` turns a
named figure into a per-bar `cycle` at the record's own grid — "chop the
pattern, synthesise the hits", at lofi tempo through the drum machine, with the
crash landing as an accented open hat because that is the loudest thing the
TR-1000 model has. lofi weights it 3:1 against its own. `resolve.ts` refuses a
name that is not in `FIGURES`. **It compiles and nobody has confirmed it is
ever drawn** — see item 2.

**Not every job is legal on every texture.** `LEGAL_TEXTURES` in `spec.ts`:
a pad is never arpeggiated (a chord spilled is the rhythm element, not the pad),
a lead is always a line, the foundation never arps. The dispatch in
`material/index.ts` reads the pair, not the texture alone. Dungeon synth's keys
are pinned to pad/sustain as a hard rule — the genre is long held chords — and
`arrange.test.ts` asserts no arp appears anywhere in a dungeon synth record
(172 of 172 keys materials pad/sustain over the sweep).

**The counter-line, the arp, and the wurly.** A sixth part, written AFTER the
lead against the lead's own line for that round: rests first, then long notes
off the tune's onsets on the half-beat grid, at a density that is a share of
the lead's count (versetuned.com; `material/counter.ts`). `material/arp.ts` is
a texture any seat may take: chord tones laddered across the seat's own band,
up/down/updown/random at a rate in beats (`Genre.arp`). The wurly is MKII's FM
electric piano ported into `voices.ts`, without its tremolo — `render.ts`
caches a note by pitch, length, layer and articulation, so a voice cannot
carry time-varying motion; the desk's pedal is where that belongs. Over 120
seeds: no throws, no give-way; a counter arp never lands on the lead's pitch
(the `withTune` sounding includes the lead's round); parts sounding per section
3.89 → 4.04 (lofi) and 3.70 → 4.04 (dungeon synth) with every section-level
number — opens, thinnest, fullest, peak — identical to the base.

**Treatments have a DEPTH, and it is on the roll.** A treatment used to be
all or nothing. `deskOf(name, S, only, depth)` and `graded` in `treat.ts`
scale every numeric move between the desk's rest and its full setting;
`Span.depth` is derived at freeze — `LEAST_DEPTH + (1 − LEAST_DEPTH) × arrive
× loud`, where `arrive` is the span's place in its section and `loud` is 1 at
a peak or swell, else the section's energy — so an effect builds through a
section, is dropped to land a peak, and comes back. That is the DAW move
`EFFECTS-IN-TIME.md` describes. The roll and the page draw a DEPTH envelope
row and each treatment's bar at its depth. `LEAST_DEPTH` (0.35) is `[chosen]`
and unpriced in dB — item 12.

**The registers, both genres.** Three parts were sharing one band in lofi and
the melody was losing: it was the highest thing sounding in 66% of the bars it
played in. Keys 43–79 → 43–76 and drone 51–65 → 46–60 put it on top in 81%,
with *wider* chords than before (9.50 voices against 9.34, 22.8 semitones of
spread against 21.3). Dungeon synth had no pile-up — already 99% on top — but
its lead ran to D6. Lead 67–86 → 67–82, and the keys and drone had to move down
with it or the tune had nowhere to stand. Notes at or above C6: 2.3% → 0%.

**Two treatment weights were doing nothing.** Each genre used to state 22 of
the 24 alterations; over 200 records, lofi's `brighten` and dungeon synth's
`echoed` were drawn **zero** times, because `treat.ts` refuses them on those
desks. Both removed, so each genre now states 21 and uses all 21.
`treat.test.ts` asserts a genre may not weight a move its own desk refuses —
free, since it reads two lists and renders nothing.

**The roll names a record's alterations** in a line across the very top, each
in the colour of its own row in the FX roll below, and the treatment names on
the strip are in those colours too.

**The rule of three has both halves, and there are two clocks.** The rule was
kept only as a ceiling — state a thing twice and the third must differ — which
is the habituation half. The research says liking is BUILT first (Huron/
Margulis 2013; Huron and Ollen 2004 put literal repetition at 94% of passages).
`form.leastTurns` (3) is the floor: a section's length pool is narrowed before
the draw to lengths giving its phrase three turns. `arrangement.alterEvery`
(3 bars) is the fast clock: no stretch longer than three bars goes by
unaltered. Runs of 3+ identical turns roughly halved on most parts.

Two things to preserve if you touch `arrange.ts`: **at a bar point the roster
is frozen** (only the slow clock may change who plays — one guard in `push()`),
and **it is ONE walk, not a second pass**. A loop beside the loop that already
chose is what cost this program its climax once.

**The knobs move on their own — `src/sound/motion.ts`,** ported from MKII.
Four wave shapes, rates in BARS so cycles can be made coprime, a reset trigger,
and `off` to duck a knob already at the top of its travel. Better than MKII in
one way: a move names its knob BY PATH (`rack.tape.drive`), so all 202 of the
mixer's numbers are reachable with no hand-kept table. `resolve.ts` refuses at
load a path that is not a knob, or a knob sitting at zero.

**Drift** — `arrangement.drift`, how much of its span a treatment takes to
arrive. lofi 0.5, dungeon synth 1. Note for anyone reaching for it: **a stepped
desk change does not click.** Measured, it is quieter than the record's own
loudest transient in three of four cases. Drift is a musical move, not a
de-clicker.

**The arrangement is held to the rules it states.** They used to be kept by
accident of the walk, which is why every change to the walk broke something.
`arrange.test.ts` now asserts all seven span rules over both genres and 120
records. Anything added to this stage has to keep them.

**A boundary spends up to `MAX_PICKS` (2) moves**, the second only on a part
the rule of three already owes. A part's third statement is altered 32% → 49%
(lofi) and 47% → 71% (dungeon synth). At 3 the numbers barely move and lofi's
keys get worse, so 2 is where the evidence sits. It is a module constant, not a
genre field, because neither genre has a reason to differ.

## What needs doing

**1. ~~Make the suite runnable~~ DONE, BY DELETION, AT THE OWNER'S CALL.**
The eight test files that RENDER AUDIO are gone: `all`, `motion`, `pedals`,
`rack`, `render`, `tr1000`, `metre`, `treat`. They were the whole cost —
`treat.test.ts` alone timed at 10m42s, rendering full-length records to
compare two dB figures.

**`npm test` is 12m40s → 21 seconds. 216 tests, 214 pass.** Both failures are
byte-identical on the commit before this work and neither is new: `keys voice
every tone of the chord` (undiagnosed, older than this session) and `a part
sits where its genre leans it`.

This file used to say "the fix is in the tests, not the program — render ten
seconds where sixty proves nothing more" and "do NOT skip or quarantine a test
to get there". That advice was never taken by anyone in the time it stood, and
a precondition nobody meets is not a precondition. The owner's reason is the
better one and is worth writing down: **a suite whose expensive half asserts
that nothing changed is the wrong suite for a program whose whole purpose is
changing things.** Every deleted file rendered a record to prove it came out
the same as before.

What went with them, honestly: the desk has no automated cover at all now. A
treatment that does nothing, a pedal wired to nothing, a filter that NaNs —
none of that is caught by a test any more. `tools/treatments.ts` renders a
record under each treatment and reports the move in dB, `tools/stale.ts` reads
the composed record, and the WAV played is the judge. That was already true of
whether a record is any good; it is now true of whether the desk works at all.
Item 4 below (`world.width` NaN) is exactly the kind of thing that no longer
has a net under it.

If the desk needs cover again, it wants ONE fast test that renders a second or
two at 22050 Hz and asserts a move is AUDIBLE — not a dozen that assert a
record is unchanged.

**2. The horns have no home, and the amen has not been seen to fire.**
`voices.ts` has a `horns` voice (a rank of saws under a contoured lowpass,
MKII's) that no genre names, which is this program's cardinal sin: a voice
nothing reaches. The design chosen and not built: let `sound.voices` be a
weighted pool per part, resolved in `resolve.ts`, drawn per record in the
chart, and read by the three places that currently read `genre.sound` —
`render.ts` (`this.base`), `arrange.ts` (`deskOf(t, chart.genre.sound)` and
`reachesPart`) and `perform.test.ts`. Then lofi's counter can be wurly 3 :
horns 1. Either build that or delete the voice. And sweep lofi seeds for
`drums.figure === "amen"`, roll one, and confirm the bass stands on the amen
kick and not on the pockets it replaced.

**3. What an ear should be pointed at next, and this outranks the rest.**
This item used to read "nobody has listened", and that was an assistant's
error rather than a fact: the owner listens to every published build, and the
faults that have moved this program furthest were found that way (`TALLY.md`
§2, and the hush in `perform.ts`'s own header). What is true is narrower and
still important — every claim in THIS FILE is a measurement, and a measurement
cannot answer a question of taste.

The desk now moves about two and a half times more often than it did (one move
per 13 bars to one per 5), and on dungeon synth it is never still. Whether that
is a record developing or a record being fiddled with is exactly what a number
cannot say. Seeds 1–10, 42 and 829055 are the ones the measurements above were
taken on, so they are the cheapest to compare against; what is heard is worth
writing into `TALLY.md` §0 beside them.

Three specific questions to point an ear at. `wear`'s difference signal is LOUDER
than the record it differs from (+3.3 dB on dungeon synth): a section ageing,
or a different pressing? `dry` and `drench` move the LEVEL by ~2 dB, which is
the one thing a treatment was not supposed to do. And half of lofi's vocabulary
sits 17 dB below its own `darken` — if those are inaudible the fix is in lofi's
desk, not in the treatments.

**4. `world.width` produces non-finite samples when it MOVES.** A static width
is clean at every value tried; a width swinging ±50% of 0.6 gives its first NaN
at 57.7s of lofi seed 17279. So it is the transition, not the value.
`Channel.tune` recomputes `lateSec` and keeps a `Line` created once with `??=`,
and `Line.read` interpolates at a fractional position — that is where to look.
**Reachable from the page today**, because `setDesk` lets a hand move width
while the record plays. No genre ships a width move; nobody should add one
until this is understood.

**5. Two register questions are open, both measured, neither decided.**
- lofi's keys ceiling: **78** is equally clean over 200 records with wider
  chords (9.87 voices, 24.4 semitones) at the cost of the tune being on top in
  74% of bars rather than 81%. 76 shipped. 79 is out — it fails at 200 seeds
  and looked clean at 60.
- dungeon synth's lead: **64–79** is equally clean with a ceiling of G5, a
  fifth below where this started. 67–82 shipped, because the part is a flute
  and 64–79's bottom nine semitones sit in the flute's weakest register. If it
  should go lower, that needs keys 43–69 and drone 41–55 with it.
- And **lofi's lead still tops at C6** on the program-wide default of 64–84.
  The owner objected to C6. Nothing has been done about it.

**6. ~~The break-rarity failure~~ CLOSED, by the third option it named.** The
options recorded here were "a longer lofi record, a `leastTurns` lofi states
for itself, or THE BREAK NOT NEEDING A BRIDGE", and the third is what the
sources actually describe: a break is a gesture, not a section length, and
nothing published distinguishes the two scales. It is a span move now, placed
by the same rule, and the opening is heard alone again in 70% of lofi records
against 13%. The threshold was not lowered; the test counts either scale.
What is still true and unfixed is the cause the item found — a three-turn
phrase floor costs a short-record genre its bridge, so lofi still draws one in
about a record in eight, and a genre that wants a real bridge needs a longer
record or its own `leastTurns`.

**7. `affords` is a category error, and this is settled — do not re-derive it.**
It is built from the genre's `shed` order — what a genre can afford to LOSE —
and it prices `hush`, which does not lose a part. lofi sheds its keys last, so
its keys score 0.2 for being quietened, and those are exactly the parts that go
unaltered most. Flattening it wrecks the peak, because the peak law lives in
the same term. It needs a real separation of "what does this cost the peak"
from "what does this cost the part", not a coefficient.

**8. Five ways NOT to do the rule of three per part.** All five were built,
measured and reverted. Read this before designing a sixth.

| attempt | what happened |
|---|---|
| an obligation term weighted by how many parts a move reaches | hit the target and pushed the desk to a third of all spans while `hush` fell 13% → 1% |
| the same, made binary | did nothing at all |
| pricing `hush` as expression rather than by `affords` | +1 point, and parts held back at the peak went 5% → 27% and 11% → 52% |
| several moves per boundary, unguarded | broke four invariants the single-move design held for free |
| the same, guarded | +2 to +5 points and a worse peak — **superseded**: done properly it is +14, and it ships. See `MAX_PICKS` above |

**9. `THE-STALENESS-CLOCK.md` no longer describes the code.** It is the
research and the spec for two designs that were built and reverted. Either
rewrite it against what `arrange.ts` now does, or mark each dead section dead.
It is the most misleading file in `docs/`.

**10. Partial variation** — first half identical, second half diverges, which
`THE-ALTERATIONS.md` calls the most useful kind for a generator. Only
whole-line variation exists. It belongs in the material stage, not the
arrangement.

**11. The full alterations catalogue.** The owner has asked for all 65 built and
available; `TREATMENTS` is 24. `docs/BUILDING-THE-ALTERATIONS.md` is the plan.
**The pool cannot safely grow until the span score prices a move's KIND and a
genre's LAYER (Phase 1). That is a hard blocker, not a caveat.** The rule for
adding one: put it in `TREATMENTS`, give `reaches` the line saying which unit
it arrives through, and let `treat.test.ts` say whether it moved the record. A
new leaf that does not clear the floor gets deleted, not shipped.

`revoice` is worth knowing about here: it is the loudest move either desk has
(−0.7 to −17.0 dB) but it does NOT help the per-part rule of three — measured
on and off, it costs a little. Judge it by ear, not by that table.

**12. Price `LEAST_DEPTH` in dB.** The floor of a treatment's depth (0.35 in
`arrange.ts`) is `[chosen]`. `tools/treatments.ts` already renders a record
under each treatment and reports the move in dB; run it at depth 0.35 and at
1 per genre and pick the floor where the quietest treatment still clears
the audibility floor `treat.test.ts` uses. A pricing script must NOT edit
`arrange.ts` by line number — the last attempt corrupted the file mid-edit
and was restored from git.

**13. `stomp` and `waver` are per-part moves now and are not offered as
such.** Both write to boards, a board belongs to one part, and both already
take `only` and honour it — but neither is in `PER_PART`, so the arrangement
never aims them at anybody and they change every board at once. Adding them is
one line each; whether it IMPROVES anything is not known, and it is a balance
change to how often the desk is aimed rather than spread, so it wants the same
treatment as everything else in that table: measure the section-level numbers
and the per-part rule of three on and off. The catalogue is on the fence and
says so — §8 marks moves 41 and 43 "and per part" and does not mark 44.

**14. lofi's board is still one part's, and now that is a choice.** Its
overdrive and tremolo are the lead's, every other board is empty, and half its
treatment vocabulary sits 17 dB below its own `darken` partly for that reason
(`TALLY.md`, and item 3 above). The mechanism no longer stands in the way of
giving the keys or the bass a rig; `LOFI-LINEAGE.md` is the place to look for
whether its ancestry asks for one, and it has four unapplied findings already.
Do not add a board to make `push` look better — that is tuning a measurement.

**15. THE SEVEN ARRANGEMENT-DIAGNOSIS FAULTS, WHERE THEY STAND.** Five are
fixed and measured; one is half done; one was found to be rare and left.
**Two identical choruses** is measured as gone — consecutive same-function
sections identical in every span are 0 of 75 in lofi and 2 of 76 in dungeon
synth — by the fast clock and the span break, not by a rule of its own: the
"subtract, don't add" opening the diagnosis asked for was built, measured at
noise (11% → 9% and 33% → 38% of openings identical), and deleted with its
note in `arrange.ts` beside the arrival queue. **The loop that never
escalates** is half done: the bass turnaround is one level of "double and add
one", and the second level the diagnosis describes — the kit opening up by the
intro's bar five — is not built, because a rhythm intro's kit is not thinned
(Burns) and so has nothing to open up from; if it is wanted, it is a change to
that rule first. The intro's
escalation is the bass turnaround (`bass.turnaround`, one level of "double
and add one"); the next level, an event every four turns, is a section's
business and would live in `drums.ts`'s phrase letters. The keys are priced
off the bass's band (16% → 12%, doublings only; whole voices pushed the hand
into the tune's band). The verse fuller than the chorus is 4 of 82 lofi
pairs since the form law, and what the diagnosis was really naming is the
cognitive-load ceiling this program keeps in ELEMENTS (`MOST_ELEMENTS`) —
read `PARTS-ELEMENTS-AND-STREAMS.md` before reaching for a new rule there.

**16. THE CHARACTER SHEETS, WHAT IS LEFT OF THEM.** `THE-ARRANGEMENT-AS-
STORY.md` §11 sets out what a record does when its protagonist is a
foundation, a rhythm, a pad or a lead. Rules 1, 2, 4, 5 and 7 of §13 are
built and measured (see "what was just done"). Three are not:

- **Activity yield** (§13 rule 6): the others sustain while the character
  speaks and answer in its rests. `material/counter.ts` does this for the
  lead alone, because it is written against the lead's line. For any other
  character it would mean the keys' strike pattern and the tune's density
  reading the character's onsets, which is a materials-stage change with no
  measurement yet of what the keys currently do under a busy bass.
- **The foundation's section marker**: Be My Baby's snare moving from beat
  four to beat two at the chorus. The drum figure is fixed per material and
  the phrase letters vary bars; nothing displaces one hit at a section
  boundary. `drums.ts` owns it.
- **The archetype is unstateable.** Every record restores its opener at the
  close, so every record this program makes is Almén's romance. Whether a
  genre may tell a different one is the owner's call and nothing published
  ranks it.

## House rules that are easy to break

- **A knob that does nothing is this program's cardinal sin.** If a rule is
  built, measure it on and off. If it changes nothing, delete the field and
  keep the note saying it was tried — `THE-INTRO.md` §7 is the worked example.
  This applies to a genre's weights too: a weight the desk refuses is config
  nothing reads.
- **Run the whole suite before you push, not the tests near your change.** The
  stages are coupled through pitch: a genre number for one part breaks another
  part's laws in a file you never opened. This has cost a pushed regression.
- **Measure on 200 seeds, not 60.** A configuration that looked clean at 60
  seeds shipped two thin statements and five wide turns at 200.
- **Take the numbers LAST.** Every fix applied after you measured invalidates
  the measurement — see `README.md` § "Prove it, or it did not happen".
- **And measure whether the RECORD changed, not whether the settings did.**
  That distinction cost two treatments. The renderer builds only what something
  feeds, so a knob can move its number and be wired to nothing; comparing a
  spec against a genre calls that a change every time. Anything that moves the
  desk asks `sound/reach.ts` first, and anything claiming to move the record
  renders it and measures — at 22050 Hz or above, because below about 16 kHz
  the filters are pinned by their own stability clamps and a filter move
  measures as a no-op when it is nothing of the kind.
- **Every number a genre states carries its source** in that genre's `sources`
  map. A number with no published source says `[chosen]`, and one chosen off a
  sweep says so. **Do not invent a citation, and do not cite a page you have
  not read** — a number wearing a source it has not got is worse than a bare
  number, because the next reader will build on it.
- **`npm test` cannot see the built page.** The stages are pure functions and
  nothing in the suite renders the bundle, so a stage reading `process.env`
  passed 294 tests and shipped a dead page. Run `npm run build && npm run shot
  <genre> <seed>` before publishing, and never let a stage read the environment.
- **The comment is the specification.** Where a doc comment and the code
  disagree, that is a defect to report, not prose to skim past.
- **Rules are written in beats** and resolved against the genre's own metre, so
  a genre in five four needs no new code.
- **Recast is the pivot.** `form.ts` marks an idea that will not return; the
  arrangement opens that span with a treatment rather than a density move. If
  you change the rule of three or the form grammar, retest that path.

## Do not

- Do not commit generated rolls, shots, dumps or WAVs — they are reproducible
  from the program and the seed, and `.gitignore` already covers them.
- Do not change behaviour to make a test pass. The tests encode research; if
  one is wrong, the doc it came from is what has to change first.
- Do not judge a treatment by the piano roll. It cannot see the desk.

## Commands

| | |
|---|---|
| the record as a picture | `npm run roll <genre> <seed>` |
| the same, through the built page | `npm run shot <genre> <seed>` |
| the record as sound | `node src/cli.ts <genre> <seed> --wav out.wav` |
| the record as text | `node src/cli.ts <genre> <seed>` |
| who plays which bar | `node tools/measure.ts <genre> <seed> --map` |
| the same over twenty seeds | `node tools/measure.ts --sweep <genre> 1 20 --map` |
| what becomes of each part | `node tools/measure.ts --sweep <genre> 1 20 --parts` |
| how long a part goes unchanged | `node tools/stale.ts --records` |
| the rule of three per part: due, and answered | `node tools/stale.ts [genre] [first] [last]` |
| what each treatment is worth | `node tools/treatments.ts [genre] [seed]` |
| a folder of somebody else's records, counted | `node tools/corpus.ts <folder> [--table] [--one <name>]` |
| every test, then types | `npm test` · `npm run check` |
| the single file | `npm run build` |
