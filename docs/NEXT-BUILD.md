# DIRECTIONS TO THE NEXT CODER — the train is the drone

*Written 2026-08-15 by the coder who built boxcar synth phases 0–5, at the
owner's request, after the owner listened to build `2026-08-15u` and told me
what was wrong. Read this before you touch anything. The branch is
**`claude/code-review-6jd9cz`** — all work goes there, nowhere else.*

---

## 1. Start here, in this order

1. `docs/START-HERE.md` — the standing rules. RULE ZERO (plain English) and
   RESEARCH EVERY TIME are not optional and I have watched both get skipped.
2. `docs/genre-research/boxcar-synth.md` — the genre's founding sheet, with
   every source. §3, §4 and §8a are the ones this build rewrites.
3. This file.

Then: `git fetch origin claude/code-review-6jd9cz && git checkout
claude/code-review-6jd9cz`. Confirm you are NOT on `main` — main is a
snapshot from 2026-08-03 and looks deceptively clean.

## 2. What the owner said, and why it is the whole job

> *"Its boxcar synth how can it be that if the train sound is not the backbone
> of the whole song? Its the drone for the genre... The breaks come before the
> stop and the train sound stops people get on the conductor makes a call
> before and after the train starts again."*

> *"It needs to be automated just like a drone would be with lfo and fx... at
> times it should be louder at other times it should fade to the backbeat and
> be the heart beat that keeps the track moving."*

And when I framed the design as a trade-off — the train OR a synth drone:

> *"If a drone itself is needed then make it happen, your acting like there is
> some limit when thats not how music works is it."*

**He was right and I was wrong.** Do not repeat my mistake: layers are a
decision per record, never a budget. If a record wants the train AND a held
drone AND a pad, it has all three.

## 3. My mistake, stated plainly so you do not rebuild it

I built the train as **weather**: one bed drawn per record, playing quietly
and continuously under everything, with the brakes and the whistle as
isolated punctuation at section boundaries.

That is wrong in the one way that matters. **The bed never stops.** The drums
stop in a town — that part works, and `probe_journey.js` proves it — but the
running sound keeps going, so *nothing ever actually arrives.* The genre's
single structural fact is that a town is the moment the running stops, and my
build cannot express it because one event spans the whole record.

Do not try to fix this with levels. I did, in `15u`, and it made the record
louder without making it a journey.

## 4. What to build

### (a) The train becomes the drone MACHINE

The program already has the right object and I did not use it. The `drone`
role is a continuous ground with its own machine, its own knobs, its own
automation lanes and its own strip on the mixer. Make the train that machine.

- New machine `trainbox` ("the train"), `slot: "drone"`. Model its
  declaration on `dronebox` (search `dronebox: {` in INSTRUMENTS) — that is
  the drone rack and it is the pattern the owner means by "just like a drone".
- Controls, all `gesture` or `bus` kind so the genre's motion may ride them
  (if you declare one `voicing` and then automate it, the battery WILL catch
  you — it caught me twice): `level`, `window` (a lowpass: how open the
  carriage window is), `rumble` (a low shelf: the bogie's weight), `air`,
  `drift` (playback-rate wobble — the engine's effort), `pan`, `panHz`.
- `V.train(g, ev, t)`: play a running loop (`railRun0` / `railRun1`, already
  in the bank) for the event's duration, looped on its measured loop points,
  through that chain. Copy the shape of `V.atmos` — it already does
  `ERANG.meta` / `erangBuffer` / `chanIn`. Let the event's pitch nudge
  `playbackRate` a few percent: that is the train working a grade, and it is
  the one honest use of a pitch on an unpitched sound.
- Genre: `machines.drone: [["trainbox", 1]]`.

**Everything then follows for free**, which is why this is the right shape:
the train stops in towns because `form.roles.chorus` does not name `drone`;
it gets a fader because the drone strip already exists; it can be automated
because drone machines are.

### (b) The record still gets a drone if it wants one

The owner's correction. The bass already holds a pedal
(`bassStyle: "drone"`, `bassPedal`), the choir already sits on `keys2`, and
where a record wants a held synth drone as well, put it there too. Nothing is
surrendered to make room for the train.

### (c) The level tells the story

`motion.trainbox.level`, in the owner's own words: forward where the record is
about the going (the night run, the instrumental), back to a **heartbeat**
under the verses where the tune is speaking, lifting again toward the apex.
Add `window` / `air` / `pan` on slow LFOs and a sample-and-hold — copy
ambient's `motion.dronebox` block, which is the best automation table in the
file — plus matrix sends so the train breathes with the room.

### (d) The stop is a SCRIPT, in this order, at EVERY town

Currently in the journey block (search `THE JOURNEY: THE TRAIN ARRIVES,
WAITS, AND LEAVES`, stage 5, beside the atmos emitter). It has step 1 and
step 5 only. The full sequence:

**Arriving:** one long whistle (approaching) → the brakes → **the running
sound stops** (free, once the drone role ends at the town) → the standing bed
begins (`railTown` station + `railValve` safety valve) → `railDoors` → the
crowd (`railCrowd`).

**Leaving:** `railCall` — the conductor's announcement, *all aboard* → the
doors → `railGuard`, the guard's whistle → `railDepart`, the engine answers →
**the run starts again** with the next section → `railCbell`, the conductor's
bell, once the train is already moving. That last one is the owner's
"and after the train starts again".

**Every stop gets the call.** I had it at once per record; that was wrong.
A conductor calls at every station.

### (e) Two or three short stops

`form.plan` already alternates travel and town. Shorten the town phases'
bar budgets so the record is mostly moving and the payoff count lands at two
or three.

## 5. Things that will bite you, learned the expensive way

- **`chart.space` does not exist.** Use `soundNow()` for the space object in
  any probe that renders. I wrote several probes passing `song.chart.space`,
  which is `undefined`, so the room was silently absent from every render.
- **A genre's declaration must ride the `space` object to reach `setSpace`.**
  I gave the medium its own channel; it measured byte-identical to no medium
  at all. The file had already written that lesson down for the tape.
- **Boundaries are exclusive at both ends.** My first journey probe counted
  hits landing on the *next* section's downbeat and invented 541 defects.
  Use an epsilon, and skip sections whose bars are not numbers.
- **The battery is your friend and it is smarter than you.** It caught: a
  dial declared `voicing` and then automated; sends automated upward from
  crossings already fully open ("keeps 0%, base 1"); knobs that reach nothing.
  When it fails, fix the cause, never the check.
- **Registers must not overlap between the chords and the figure.** Mine did,
  and three blend pairs could not voice a chord at all.

## 6. How you know it worked

In this order. Do not claim any of it without running it.

1. `node harness/probe_journey.js` — extend it with the two claims this build
   adds: **"the running sound stops in every town"** and **"every stop runs
   the whole script in order"** (call before whistle, whistle before engine,
   engine before the run resumes). Then **break the genre on purpose** and
   watch them fail — a guard nobody has broken is a guard nobody has tested.
2. Render A/Bs: the train measured against the band in a travelling section
   and in a town. Present while moving, ABSENT when stopped, in dB.
3. `node harness/mk2_test.js` — expect 185+ passed / 2 failed. The two knowns
   are the stamp (until you bump it) and the ruled blend item (task #61, which
   is permanently off — do not chase it).
4. `node harness/mk2_snapshot.js` against a snapshot of the HEAD build —
   boxcar synth moves, **every other genre byte-identical**.
5. Bump the stamp in the HTML, `node harness/mk2_stamp.js write`, commit,
   push, and republish the SAME artifact URL. The owner plays the artifact,
   not the repo; a build that is not republished did not happen.

## 7. The one thing I could not do

**None of this has been judged by ear.** Not one boxcar record, not the
corrected dungeon synth. The program cannot hear itself and neither can you —
the owner is the only judge, and every number in this file is only evidence
that the machine does what it says, never that it sounds good. Say so plainly
when you report, and never let a green battery stand in for a verdict.

Also still open: `harness/rail_bank.py` picks each recording's window by
measurement, but the PASSING sounds still peak about 20 dB under the band
because the approach/pass/recede envelope assumes the loudest moment sits at
the middle of the sample. Measure each pass sample's own peak position, store
it as a column, and align the envelope to it. That is task #95.
