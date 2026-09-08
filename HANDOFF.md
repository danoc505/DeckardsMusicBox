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

**The suite has been run on this tree, file by file: 310 tests, 307 pass,
three fail, and all three fail identically on the commit before this work
began.** It was 307 tests before; the three added are laws this session could
state for the first time — a board is one part's own, no board is wired to
nothing, and a pedal keeps its own clock while the knob beside it moves. It is
still too slow to run in one go — see item 1 — so it was run as
`node --test src/<one>.test.ts` per file and the three failures were then
re-run in a worktree of the earlier commit to prove they were not this
session's. THERE ARE THREE STANDING FAILURES AND THIS FILE USED TO LIST TWO;
the third was found by that check, not by the change that prompted it:

- `arrange.test.ts` "the break goes below the floor mid-record" — 14% of
  records have a break against a threshold of 15%. Deliberate; see item 6.
- `material/index.test.ts` "a returning idea plays its statement's own figure"
  — 82 variants against a threshold of 90. Deliberate.
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

## What was just done

Recent work, newest first. One paragraph each; the reasoning is in the code
comments beside each number, and the measurements are in the commits.

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

**1. Make the suite runnable, then run it on this tree.** Eight minutes is
not a precondition anyone meets, and every run this session was killed. The
time is in rendering: `render.test.ts` renders sixty seconds a dozen times,
and `all.test.ts`, `pedals.test.ts` and `rack.test.ts` each render whole
records to read one number. **And the eight-minute figure is now out of date
and too kind. `treat.test.ts` alone timed at 10m42s** on its own (13 tests,
every treatment of every genre rendered), `all.test.ts` at 35 s, `pedals` and
`rack` at 24 s each. Start with `treat.test.ts`: it is more than half the
suite by itself and it renders full-length records to compare two dB figures. The fix is in the tests, not the program: render
ten seconds where sixty proves nothing more, share one render across the
assertions that read it, and drop the sample rate only where the filters'
stability clamps allow (see the house rule on 16 kHz). Do NOT skip or
quarantine a test to get there. Then run it on this tree: expect the two
deliberate failures above and nothing else, and anything else is this
session's — the amen figure and `LEGAL_TEXTURES` landed after the last
complete run, and the drums tests may assume a single-bar figure.

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

**3. Nobody has listened. This matters more than everything below it.**
Every claim in this file is a measurement. The desk now moves about two and a
half times more often than it did (one move per 13 bars to one per 5), and on
dungeon synth it is never still. Whether that is a record developing or a
record being fiddled with is exactly the question a measurement cannot answer.
Play seeds 1–10, 42 and 829055 and write what you hear into `TALLY.md` §0.

Three specific questions to listen for. `wear`'s difference signal is LOUDER
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

**6. The break-rarity failure needs an owner's decision.** A three-turn phrase
floor costs a short-record genre its bridge: lofi's bridge pool was 4 and 8
bars, and at a four-bar loop neither states its phrase three times. A 12-bar
bridge took it 11% → 14% against a threshold of 15%. Weight is not the lever —
at weight 3 it is still 14%, because a 12-bar bridge plus its keep-back needs
16 bars and a 44-bar lofi record rarely has them. The threshold encodes
research and has not been lowered. The options are a longer lofi record, a
`leastTurns` lofi states for itself, or the break not needing a bridge.

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
| every test, then types | `npm test` · `npm run check` |
| the single file | `npm run build` |
