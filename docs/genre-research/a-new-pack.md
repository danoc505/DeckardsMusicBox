# The Erang pack was replaced, and what that changed

`2026-08-20`, build `h`. The owner replaced the sample pack:

> "Ive updated the erang files I want you to delete all the erang samples. And
> use the WAV files ive added to the branch you are working in now. Each file is
> its own instrument that should be used as such the instruments have 12 second
> lengths, this means a note can last 12 seconds. The percussion is mostly toms
> which is what we want. We should bring them all in have 8 of them with two
> that are rim shots or the takio stick clash so we can get a high note in
> there"

and then:

> "We need to utilze the SFX for background noise and transitions"

and then, correcting the first pass at naming:

> "All instruments are inthe default C, i think thats C4? The home key. The
> number is part of the filing and not related to the note"

## What arrived

25 WAV files, 35 MB. One of them — `Erang - Bard and Troubadour Sample Pack -
29 BARD_WIND_04.wav` — is an exact md5 duplicate of `BARD_WIND_04.wav` under
the full pack name, and is skipped rather than encoded twice. So 24 samples.

Twelve pitched instruments, six drums, four sfx, two noise loops.

## Every root was measured, and the filing numbers mean nothing

The owner is right that the numbers are filing. They are also not correlated
with register, and on one pair they are backwards: `strings_04` is a C4 and
`strings_10` is a C1.

Measured, two independent readers agreeing within 3%, every octave confirmed by
an odd-harmonic test:

| register | files |
|---|---|
| C1 | erStringsLow, erLeadLow |
| C2 | erPad |
| C3 | erStringsMid, erLeadMid |
| C4 | erStringsHi, erKeyMid, erLeadHi, erPluck |
| C5 | erKeyLong, erKeyHi |

**One file is not a C at all.** `BARD_WIND_04` is a D#5, +24 cents. Both readers
agree within three cents and the octave test confirms it. It plays correctly
because the root is read out of the audio; a bank stored as "all C4" would have
played it a tritone out and the C1 recordings three octaves sharp.

`strings_10` is the one place the reader is wrong and is corrected by hand: it
returns 65.42 Hz for a recording whose fundamental is 32.70. Settled by the odd
harmonics, which cannot be argued with — 98 Hz sits at −10 dB and 164 Hz at
−14 dB of the loudest partial, and neither is a harmonic of C2.

## Nothing is trimmed, and the held things loop AFTER they have played in full

The old encoder's biggest saving was `keep`: take 3.6 s of a 12 s render and
crossfade a loop into it. That is exactly the cap the owner asked to remove, so
it is gone. 199 seconds of audio at mono 22.05 kHz IMA-ADPCM is 2.09 MiB, or
2.79 MiB as base64 — against 4.49 MiB for the bank it replaces. **The file got
smaller while every note got longer.**

But one lane holds a note for twenty minutes. Measured on fantasy synth seed 1:
three drone events, 1204.5 seconds each. Handed an unlooped eleven-second pad,
the drone played for eleven seconds and the record had no floor under it for the
rest. So the three sustaining families — strings, Lead, Pad — get a crossfaded
loop starting at 60% of the file. The first seven seconds play once, in full,
before any wrap can happen; a note shorter than the recording never reaches the
loop and is bit-identical to the one-shot. The only samples lost are the
fraction of one period between the last whole period and the end of the file.
The struck families do not loop: a decayed tail looped is a note that holds at a
whisper and then swells again.

## The drums are eight, and which one lands where is measured

Six of the pack's recordings are toms. Ranked by the strongest partial between
40 and 600 Hz — what an ear reads as "which tom" — tie-broken by spectral
centroid where the fundamentals match:

| file | fundamental | centroid | name |
|---|---|---|---|
| percussion_06 | 64.9 Hz | 251 | erTom1, the floor |
| percussion_01 | 64.3 Hz | 423 | erTom2 |
| percussion_04 | 64.1 Hz | 472 | erTom3 |
| percussion_03 | 71.4 Hz | 479 | erTom4 |
| percussion_02 | 91.2 Hz | 673 | erTom5 |
| percussion_07 | 131.3 Hz | 408 | erTom6, the highest head |

Three share a fundamental within a third of a hertz, so the centroid is doing
the work there and the encoder says so rather than implying it.

The pack has **no** high percussion, so the two high sounds are borrowed from
the taiko bank, which is the pair the owner named: `tkKa` (the rim tick) and
`tkStick` (the stick knock). That is the eight.

`ERANG_KIT_LANES` used to be twelve lanes against ten recordings, and the index
wrapped — two lanes quietly shared a drum and which two depended on the SET
knob. It is six lanes against six recordings now and the wrap cannot happen.
The order is the measurement, not the alphabet: measured over four seeds a
genre, only `kick`/`snare`/`hat`/`tom1`/`tom2`/`tom3` carry any notes at all in
these genres, so those get erTom1/erTom3/erTom5/erTom6 — floor, low-mid, high,
brightest — and a tom run down the kit is a real descent. `ghost` and `clap`
take the two in between and are reached through the SET switch, which is drawn
per song and rotates the whole kit through all six.

The kettles moved to the arrival lanes, which is a kettle's job in a
procession, and the war drum keeps the kick. Nothing was orphaned.

The silkscreen was rewritten with it. It read SHAKER / RATTLE / BLOCK / SLAP /
BELL / CHIME against a pack that had those. A panel naming a sound the machine
cannot make is the same lie as an override nothing reads, one layer out.

## The sfx are places, seams, and a surface

Three things, and only the first existed.

**Places.** The loopable sfx are environments and the arrangement already deals
them across the record. It dealt them by section FUNCTION, which on a four-leg
record with two functions in each leg is eight keys against a pool of four — the
air changed twice per leg. It deals by MOVEMENT now, which is what its own
comment said it did.

**Seams.** A record on this plan is four legs and the listener was told where
one ended only by the music thinning out. A one-shot lands a quarter-second
ahead of each new movement's downbeat — ahead, not on it, because an impact's
transient IS the sound and landing it with the first chord buries it. Three per
record. Gain is drawn per seam and sits under the peak accent's: a seam is a
door, the peak is the thing behind it.

**A surface.** The bank files `sfx` and `Noise` apart and the deal treated them
as one list, so a leg could be handed the crackle as its environment. Measured,
energy under 120 Hz: wind 34.9%, catacomb 31.7%, drone 27.7% — record pops
0.4%, gramophone pops 1.4%. A place has a bottom; a surface does not. The
surface is drawn separately now and laid under the whole record, which is what a
record surface is, and it means both noise files are heard on every song instead
of one of them displacing a place.

## And the pack's floor is the lead, not the pad

The loudest single thing the swap changed, and it took four wrong guesses to
find.

The drone is one note held for the whole record, so whatever plays it is the
floor under twenty minutes of music. The old pack's drone drew `Pad_04`, whose
energy is 63.1% between 60 and 120 Hz; pitched down for a C#1 stack that lands
at 32–64 Hz and IS the record's bottom. The new pack has ONE pad and it is a
bright one: 78.9% between 250 and 1000 Hz, 3.4% at 60–120.

Rendered alone, the same three drone events went from 52.9% of their energy at
20–60 Hz to **1.3%**, and the quiet legs of the record went with them — the walk
home from 5–19% under 120 Hz to 0.1–0.7%, the outro from 66% to 3.8%.

Nothing was broken to do that. It is a different recording. But a drone with no
bottom is not a drone, so the pack's own low voice takes the lane: `erLeadLow`
carries 28.0% at 60–120 Hz against the strings' 10.8% and the pad's 3.4%, and
`erStringsLow` is a true C1. With the pool fixed the drone reads 35.3% at
20–60 Hz, and the record's mean energy under 120 Hz is back within five points
of the old pack in both genres.

## Four wrong guesses, written down

Because the pattern is the point.

1. **"The walk home lost its low end because I pinned the string to C4."** No.
   Two renders had been written into one folder with the same `mix_s1_*` names,
   so half the baseline was a different genre's sections and the comparison was
   misaligned from section 16 on. *A measurement that surprises you: suspect
   the measurement first.*
2. **"So it should be the C3 string."** Also no. The C4 and C3 recordings give
   byte-different audio and identical band energy to a tenth of a percent — a
   sampler tunes both to the same written note. The root sets the playback rate;
   it is not a register once the sampler has finished with it. (C4 is still the
   right choice, on transposition distance: against a part written in [G#3, F#4]
   the C3 recording is eight to eighteen semitones up, which drags twelve
   seconds down to four and takes every formant with it.)
3. **"It is the atmosphere beds."** No — splitting the surfaces out moved the
   mean by 0.06 dB.
4. **"It is the unlooped pad dying after eleven seconds."** No — looping it
   moved the mean by 0.06 dB too. The loop is still right, and is kept for the
   reason it is right rather than the reason it was found.

The answer was the fifth thing tried, and it was found by rendering the drone
ALONE rather than by reasoning about the mix. Four arguments cost more than one
solo render would have.
