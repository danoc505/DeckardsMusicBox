# THE TAPE AND THE MEDIUM — off the master chain, onto the grid

*Built 2026-08-19, build `2026-08-19m`.*

> "Add the tape to the matrix, open the boxcar.html and rip out the
> gramophone/radio rack, add it to MKII and put it onto the matrix also."

---

## 1. THE GRAMOPHONE WAS ALREADY HERE

Nothing to rip out. MKII's `medium` rack is the same machine as Boxcar Synth's,
control for control — POWER, GRAMOPHONE/RADIO, NARROW, WORN, WOBBLE, DRIFT —
ported at some earlier point.

What was actually wrong is what the second half of the sentence says: **it was
not on the matrix.** Both it and the tape were wired as **inserts on the finished
mix**:

```
  desk → compressor → tape → medium → limiter → master
```

The whole record went through them or none of it did. "The drums are on tape and
the voice is not" — the most ordinary thing anyone does with a tape machine —
was not expressible.

**And the sharper half:** measured across all four genres, **no genre turns the
tape on at all.** Not lofi, which this file's own comments describe as *"a
sampler through a tape machine"* and *"a genre whose entire identity is degraded
tape"*. Not dungeon synth, whose sources name *"tape-like hiss"* and *"tape
wow/flutter"* in the same sentence as the bit reduction built two days ago.

Its knobs were not dead because nobody automated them. **They were dead because
the machine was switched off**, and it was switched off because switching it on
meant the whole record at one setting.

---

## 2. THE ROW THE GRID HAD ALWAYS BEEN MISSING

The first attempt fed the medium from the instrument **buses** and it failed a
measurement immediately:

```
  boxcar seed 1, gramophone from the buses vs the old insert
    RMS     -21.8   against   -16.5      (five decibels quieter)
    null    +7.7 dB above the signal     (nothing like itself)
```

Not a bug — the topology being honest. **A bus send is taken before the desk and
the compressor**, and the medium's whole job is to be the last thing the record
passes through. Feeding it from the buses is not "the record through a
gramophone", it is "the raw stems through a gramophone", which is a different
sound.

So the **master** became a matrix row: the mix the desk and the compressor made,
as a source like any other.

```js
mediumFeeds: ["master"]          // the whole record on shellac — the insert
mediumFeeds: [["rail", 1.0]]     // just the locomotive — no insert can say this
```

One owner, both sentences. And the three late rows — master, tape, medium — land
on the **limiter's** door rather than on `post`, because sending the finished
record back through the desk and the compressor a second time is not what any of
them is.

### Verified rather than argued

```
  boxcar, gramophone as a matrix cell vs as a soldered insert:
    -91.2   -91.7   -90.9   -91.1  dB below signal
    RMS and peak identical to the decimal
```

**−91 dB is the renderer's own noise floor.** The insert became a matrix cell
with no change to the sound at all.

---

## 3. AND THE DRY COLUMN HAD TO BECOME A KNOB

Every non-room row returned a hard `1` in the MIX column — the one column of the
grid a genre could not touch. Survivable while the tape and the medium were
inserts; not survivable once they were columns, because *"the whole record is cut
to tape"* is every row into `Tape` at 1.0 **and its dry at 0**. Without a dry
level you get the taped record played on top of the untaped one, which is not an
insert, it is a doubling.

`space.dry` is that, in the same `[name, level]` shape every other feeds list
uses. **This is the last cell of the matrix to become a knob.**

---

## 4. THE TAPE, SWITCHED ON FOR THE FIRST TIME

Lofi puts it where a beat tape actually puts it — **the rhythm section and the
chords, not the lead.** The sampler is what got taped; the melody on top is what
got played over it. That distinction is the entire genre and it was unsayable
while the tape was an insert.

Dungeon synth takes the other half of its own sourced sentence: the ground and
the chords go through it, the tune stays off it, so the melody its critique put
above everything is not the thing that wobbles.

**Parallel, not insert** — the dry stays open, so the wobble sits *under* the
straight sound. That is the sourced position: *"tape saturation adds warmth and
grit"* is an addition, and this genre's own word for its effects is patina.

### The measurement that corrected the first numbers

```
  lofi, first send levels     peak -1.5 dBFS   against -3.4 before   (+1.9 dB)
  halved                      peak -2.6 dBFS   RMS within 0.3 dB
  the tape is still plainly there:   -14 to -17 dB below signal
```

A parallel path is **correlated with the dry it sits beside**, so it adds level
as well as character. At the first values the record came back 2 dB hotter — a
build that sounds "better" because it is louder, which is the oldest false result
there is. Halved and re-measured. One section still lands 1.3 dB hotter than
before; the rest are within 0.9.

---

## 5. THE THREE KNOBS THAT *COULD NOT* MOVE

`tape.wow`, `tape.flutter` and `medium.wobble` were `.value = …` — set once when
the graph was configured and never touched again. Unlike the sixteen knobs that
only wanted a table line, **these could not move**: nothing rode the node, so a
genre could declare a lane and the plan would carry a movement that reached
nothing.

They are ridden now, with `rideBus`'s `scale` argument carrying the
seconds-to-node conversion so the genre's table still names WOW rather than a
number nobody can read. Their `kind` flips from `voicing` to `bus`, the same way
the spring column did the day a genre earned it.

**A tape machine whose wow does not change is not a tape machine, it is an EQ
curve with a delay in it.** The reason wow and flutter are two words is that they
are two rates, and both drift — so they get their own primes, 23 and 31, and
never line up. The gramophone's wobble deepens across the record on an arc, which
is what a shellac disc does over four minutes on a heavy tonearm.

---

## 6. TWO MORE STALE COPIES, ONE LOUD AND ONE SILENT

**The column map.** `MATRIX.none`'s fill kept a hand-written
`{ Echo: "echo", Room: "room", … }` of six columns. Two more arrived and it went
stale instantly: **twelve crossings were blind-plated that the order plainly
allows** — the reverb into the tape, the echo into the gramophone — with a
generated reason string claiming a cycle that does not exist. Derived from
`MATRIX.retOf` now, with the room as the single stated exception.

**And a temporal dead zone, which threw loudly this time.** The tape block runs
above where `t0` is declared; `rideBus(…, t0, …)` threw *"Cannot access 't0'
before initialization"* on 47 of 47 renders. That is the good version of a trap
whose silent version cost material B its second keyboard on every genre two
builds ago.

---

## 7. WHAT IT MEASURED

```
  grid                  14 × 7 = 98   →   17 × 9 = 153
  real crossings                 62   →   95
  fx knobs never moved           37   →   32
  tape switched on in            0 genres  →  2

  boxcar's gramophone, moved:    -91 dB — the noise floor
  lofi's tape, switched on:      -14 to -17 dB below signal
  blends                         6 of 432, unchanged, collisions still 0
  plain genres, 96 records       0 throws
```

---

## 8. WHAT IS NOT BUILT

- **`tape.speed` and `medium.drift`** are still `voicing` — set once, ridden by
  nothing. Speed is a structural rate and arguably should stay one; drift has no
  such excuse.
- **The 7 remaining `bus` knobs** (the flanger's rate and feedback, the DP/4's
  C and D blocks) still have no genre motion line.
- **The 14 forward fx-to-fx crossings** are still opened by zero genres.
- **Nobody has heard any of it.**

---

## Sources

- [Dungeon Synth — Melodigging](https://www.melodigging.com/genre/dungeon-synth) *("tape-like hiss"; "tape wow/flutter"; "a worn, archival feel")*
- [Essential Production Techniques for Lo-Fi Hip Hop — Plugin Boutique](https://www.pluginboutique.com/articles/1788-Essential-Production-Techniques-for-Lo-Fi-Hip-Hop) *(tape saturation as an addition)*
- `Boxcar Synth.html` — the medium rack, compared control for control and found already ported
- `docs/genre-research/a-crossing-is-a-knob.md` — the levels this build's routing is written in
- `docs/genre-research/boxcar-synth.md` §8 — the gramophone's own sourced band limits
