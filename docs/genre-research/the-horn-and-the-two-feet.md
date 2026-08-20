# The horn calls once, and the fight grows a second foot

`2026-08-20`, build `j`. Two requests, unrelated except that both are about
restraint being the thing that makes a gesture land.

> "The bard wind is meant to be played full it has the sound of a war horn, it
> cant be used over and over again."

> "What about double kick pedal at the fight, that part of the song should be
> like hardcore music, where as the other parts are more like Sludge metal"

---

## Part one: a signal instrument

`erWind` was in both genres' **lead** pool — the melody. Measured on the seeds
where the ladder drew it: 87 to 140 notes a record, average length 0.6 s, on a
nine-and-a-half-second recording of a horn blast. A war horn playing a tune in
quavers.

**The program already knew what to do with one.** `signal: true` was written
for the carnyx a week ago — *"it calls and answers, one voice at a time; it does
not double the accompaniment"* — and the fix there was to move it off the lead
and onto the **counter**, the single answering line derived to speak in the
tune's gaps. Same instrument class, same answer. The Erang horn joins the carnyx
in that chair: weight 2 against 3 in dungeon synth, even money in fantasy synth,
which has a whole leg called "the fight".

`signal` alone only stops the doubling engine drawing it, so the rest is a new
declaration, `play.call`, and it is the owner's sentence turned into arithmetic:

| | |
|---|---|
| `gap: 22` | the least seconds between two blasts. *"It cant be used over and over again"* is a **minimum silence**, and it is the only thing that makes a call a call rather than a part. |
| `full: true` | play the recording out. A blast is one breath and the whole of it; the note's written length is a placement, not a duration. |
| `sit: [68, 80]` | the window a call sounds in, by whole octaves. |

**How long "full" is, asked of the bank.** The sampler plays at target/root, so
the recording lasts `n / rate × root / target` seconds — *longer* below the
sample's own pitch, shorter above. Written as arithmetic on the bank's measured
root rather than a number in the source, because a number there goes stale the
day the pack changes, which it did four hours earlier.

### And "full" made it worse before it made it better

First measurement after `play.call` landed: blasts of **12 to 20 seconds**. Not
a fuller blast — a slowed recording. The counter writes an octave under the
sample's D#5, so the sampler halved the playback rate and "play the recording
out" faithfully doubled its length and dropped every formant with the pitch.

`range` is the obvious field and it is the wrong one. `playable` takes the
**intersection** of every machine that could land on the lane, whether it does or
not, so declaring `[68, 80]` would have narrowed the counter band against the
carnyx's `[27, 77]` in every record ever made — including the four seeds in five
where the horn is not drawn. The comment beside that function warns about exactly
this move. Measured before believing it: **the declaration changed nothing at
all**, because the counter is not a laddered slot with a swap weight, so the
horn's range was never consulted. Two reasons to use a different lever, and the
second one is the honest one.

`sit` moves the note by whole octaves in stage 5, where the horn is known to be
playing. Pitch class never changes, so the harmony cannot move.

**Result**, 24 seeds a genre: the horn is drawn in 5 of 24 fantasy records and 2
of 24 dungeon records, and where it is drawn it plays **3 to 8 blasts in twenty
minutes**, each 7.6 to 14.3 s, never less than 22 s apart. Rendered alone, a
blast sounds for about 4.5 s and then decays for another 4 — which is what the
recording is: a blast and its room.

---

## Part two: two kinds of heavy

These are not two tempos. The record is one tempo arc and the story is
continuous. They are two ways of playing it, and the difference is entirely in
the drums.

### `kickPattern`, and why the pocket could not do it

`pocket` is the **record's** groove: one pool, drawn per material, and the bass
and the keys read the same object so the three lock together. That is right, and
it is why it cannot answer this. A double pedal is not a different groove — it is
the same groove with a second foot filling between its strikes. The bass still
walks; the kick does not.

So `kickPattern` overrides the **kick lane only**, and because it lives on the
kit it can be set by `arc.setAt`, which is keyed on the movement. One leg of the
record gets a foot pattern the others do not have, and nothing about the pocket,
the bass or the keys moves with it.

**The velocity rule was wrong first, and it was checkable.** The second foot is
lighter than the lead foot — a machine-flat run of sixteen identical kicks is
what makes programmed double bass sound programmed — so strokes *between* the
beats sit back at 0.66 against 0.9. The first version applied that to every
pattern and claimed no record moved. It would have moved all of them: the
walk-with-a-pickup `[0,4,8,12,14]`, lofi's `[0,10]` and the parent's `[0,7,10]`
all have strikes off the beat. Gated on a declared pattern now, and verified by
hashing every drum event of every genre at five seeds against the previous
commit: **identical**.

### And the fight was a wash

With the foot pattern in and nothing else changed, the fight's low-band envelope
had **11.9 dB** between its quietest and loudest tenth, against **41.1 dB** in
the sludge leg beside it. At three and a half strokes a second, a drum with a
one-and-a-half-second body never gets out of its own way. That is the difference
between a double pedal and a rumble, and no amount of writing more sixteenths
fixes it.

Two things fix it, and finding the first took a wrong turn worth recording:

**`kDecay` does not reach the taiko kit.** It is the kick channel's decay
multiplier and `V.wardrum` reads it, so the lane is correct for the dungeon kit —
but the kit this seed drew is the taiko, and `taikoVoice` reads `pRel`, the
sampler's release in *seconds*, not the channel's multiplier. The first lane
measured **identical to a tenth of a decibel**, which is what "declared and
unwired" looks like when you check. Both lanes ship, because both kits get drawn.

**And the room was filling the gaps.** Rendered dry against rendered wet, the
fight's drums gained 2.2 dB of envelope depth at 30–160 Hz, 4.3 dB at 160–600 and
6.8 dB at 1–4 kHz. Which sent me to the `drumsRoom` lane, where the comment reads
*"it climbs underground and at the end, **not at the fight**… a war drum in your
face is the fight"* — above a table giving the fight `[0.30, 0.52]` on a base of
0.30: **the second-wettest crossing in the record, and wetter than the cavern.**
The prose was right and the number was its opposite, which is worse than either
being wrong alone, because the prose is what the next hand reads.

### Where it landed

Envelope depth, 5 ms frames, p90/p10 — higher means the strokes land as strokes:

| | 30–160 Hz | 160–600 Hz | 1–4 kHz |
|---|---|---|---|
| the fight, as it was | 12.0 | 12.6 | 13.6 |
| the fight, tail + room fixed | **13.3** | **14.7** | **16.4** |
| the fight, fully dry (a floor) | 14.9 | 17.3 | 20.9 |
| setting out (sludge) | 17.5 | 28.9 | 23.9 |

Most of the way to the dry floor, with the room it should still have. The
remaining gap to the sludge leg is **density** — 153 drum events in six fight
bars against 28 in six sludge bars — and that difference is the point, not a
fault. A dense passage cannot have a sparse passage's envelope and asking for it
would be asking hardcore to sound like sludge.

In the finished mix, the fight sections went from 47–65% of their energy under
120 Hz to **33–50%**, and the record's mean crest rose from 11.38 to 11.83 dB.
The fight is 1–1.6 dB quieter by RMS and its peaks are unchanged: that is the
reverb leaving, not the drums.

### The sludge side

The walk stays, because a march is what the owner asked for three messages ago
and the walk is the march. What stops is the **ticking**. This genre keeps a
taiko stick on every eighth — the layer that makes a tempo felt, and also the
single most un-sludge thing a kit can do. `hatEvery: 8` puts it on the half-bar:
still there, no longer counting. The snare goes to the backbeats and the toll and
drops the broken sixteenths.

Measured over 8 seeds, hits per second: setting out 3.45, into the deep 2.97,
**the fight 7.36** — kick alone 1.03 / 0.88 / **2.76**.

### And a fourth pool was deleted

`SLUDGE_HOME` was written for the walk home and named from `setAt`, and it could
never have made a sound: over 24 seeds the walk home has drums in **0 of 118
sections**, because its `roles` entry does not list them — that leg is the motif
fading into the atmosphere. Deleted rather than left looking like it works. A
table entry that quietly does nothing is a defect this file has logged five
times, and writing one four hours after writing that sentence about the drone
override would be a poor way to have learned it.
