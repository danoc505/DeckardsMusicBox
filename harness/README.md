# harness — the printout, and the few things that are not it

**There is one test now.** It prints the notes.

```sh
node harness/mk2_score.js
```

Every genre, twice — seed 1 and one drawn fresh each run — every instrument,
every bar, start to finish. It takes about three seconds and prints about ten
thousand lines. Nothing in it is a pass or a fail. You read it.

## Why this folder is now four files instead of ninety-three

The owner, 2026-08-18:

> "the tests they are a huge waste of time and the main test that needs to be
>  done is to print out the midi of seed 1 and a random seed all the instruments
>  and the whole song. This is the real test that should be being done its the
>  only way you can actually see your work is doing something correct."

So on that day, deleted: `mk2_test.js` (190 checks, 4,300 lines, twelve to
fifteen minutes a run, **zero notes printed**), all 87 probes, the snapshot and
its 147 KB baseline, the browser batteries, and the audio assertions.
23,059 lines.

**And there was a second reason, worse than slowness.** Every one of those
ninety-odd tools read `Boxcar Synth.html` — a one-genre side file — instead of
`Deckards Orchestrator MK2.html`, which is the program. It had been that way
since 2026-08-17, commit `49e3391`, and nothing said so anywhere you would see
it. `mk2_roll.js 1 --genre lofi` printed **boxcar synth** and exited 0. So the
whole folder was grading a file nobody was working on, and reporting green.

The printout names the file it read on its first line now. That is not a
courtesy — it is the thing that would have caught this in one glance.

## The printout

```sh
node harness/mk2_score.js                          every genre, seed 1 + a drawn one
node harness/mk2_score.js --genre lofi             one genre, seed 1 + a drawn one
node harness/mk2_score.js --genre lofi --seed 7    one genre, one seed
node harness/mk2_score.js --seeds 1,7,42           the seeds you name
node harness/mk2_score.js --from 0 --to 8          a window of bars
node harness/mk2_score.js --out score.txt          to a file instead of the screen
node harness/mk2_score.js --mid out/               ...and write real .mid files too
```

`--mid` writes one `.mid` per record and then **reads each one back** and counts
the notes it finds, so "the export works" is a fact on the screen rather than a
hope. Open them in anything.

And the hand on the program — everything the front panel can do, printable:

```sh
--blend lofi:50,dungeonsynth:50    the faders, as percentages
--trait kit=dungeonsynth,bass=lofi which genre each part of a blend comes from
--deal 3                           same sliders, a different hand
--rig band                         which set of players
--picks lead=sax,keys2=wurly       which machines are loaded in the rack
--len 2:00                         ask for a length
```

### How to read it

One line a part, sixteen sixteenths a bar. `*` is a strike, `-` is the note
still sounding, `.` is silence. The note names follow in the order they are
struck, and a number in brackets is how many milliseconds that note sits off its
step — the groove, printed rather than hidden. Drums get one line a lane, named.
Parts are in score order: the tune on top, the bass at the foot, drums under
that.

At every section boundary it prints the section, its bars, the tempo, the clock
time, which material each part is playing, and who is playing at all. At the end
it prints every part's note count, range and instruments, so the printout can be
checked against itself.

**It reads the PERFORMANCE, not the materials.** The materials are what was
written; the performance is what is played, after stage 4 chose which material
goes where and stage 5 picked the variants. Printing the materials would print
the paper and not the record — the exact mistake that once let "the lead is one
loop" survive a printout.

## Everything else in here

| file | what it is |
|---|---|
| `mk2_score.js` | **the test.** Above. |
| `mk2_stamp.js` | `check` / `write`. Is the published page this build? Not a music check — publish bookkeeping. `mk2_build.json` is its record. |
| `mk2_render.js`, `render_audio.js` | render a song to a WAV so it can be listened to. Not a check; the ear. |
| `*_bank.py` | build the embedded sample banks from sources. Not tests. |
| `make_sample.py` | turn a WAV or AIFF into a payload to paste into the HTML. Nothing from any sample library is committed to this repo. |

## Two rules that survived the cull, because they were paid for

1. **When a measurement surprises you, suspect the measurement first.** Three
   separate probes were found measuring a different program than the one that
   plays — a mixer probe passed 4/4 while every knob on the panel was dead,
   because it reached past the panel and called the function directly. A number
   from a tool you have not checked is not evidence.
2. **Anything that LISTS what the program contains will go stale.** It happened
   four times, three of them in one session. `MK2.genres()`, `MK2.MATRIX`,
   `MK2.racks()` and `MK2.INSTRUMENTS` are exported so nothing has to keep a
   copy — the printout derives its genre list from `MK2.genres()` and never
   writes one out.
