# THE PARAMETER LOCK — a knob with a different value on every step

*Researched 2026-08-08, on the user's instruction: "More P locks. More
research." The mechanism has existed in this program since the motion system
landed and three documents have called it rare for weeks without anybody
sourcing what it is FOR. This sheet is that, and then what was built from it.*

---

## 0. THE STATE BEFORE ANY OF THIS — measured, not remembered

Censused off the compiled motion plan over 20 seeds a genre:

```
  genre        control          live steps   peak move   % of its dial   machine plays
  lofi         tr1000.hDecay      2.6/16       0.144           5.2%           100%
  lofi         tr1000.chdecay     2.8/16       0.013           9.7%           100%
  lofi         tb303.decay        2.4/16       0.052           4.5%           100%
  synthwave    tb303.cutoff       3.4/16    1116 Hz           18.9%           100%
  synthwave    tb303.decay        2.8/16       0.093           8.1%           100%
  synthwave    tr1000.snappy      2.1/16       0.128          12.8%           100%
  dkc          tr1000.kDecay      1.6/16       0.076           2.7%           100%
  acid         tb303.cutoff       3.7/16    1339 Hz           22.6%           100%
  acid         tb303.decay        3.1/16       0.121          10.5%           100%
  acid         tr1000.snappy      2.1/16       0.116          11.6%           100%
  plastikman   tb303.cutoff       1.7/16     524 Hz            8.9%           100%
  jungle       amen.tune          1.6/16       1.13 st         4.7%           100%
```

**Twelve lanes — 1.5% of the 806 motion lanes in the file**, and 6.9% of the
175 controls that are read fresh at every note (which is what a p-lock needs;
see §3). Every one of them FIRES, and every one sits on a machine that plays
in 100% of that genre's songs — so this was a live mechanism nobody had leaned
on, not a dead one.

---

## 1. WHAT IT IS — the word is Elektron's, and so is the definition

> **"A parameter lock is a parameter locked to a certain value for a specific
> step."**
> — [Elektron, *Machinedrum SPS-1 User Manual*, p.55](https://www.manualsdir.com/manuals/657170/elektron-machinedrum.html?page=55)

> **"Parameter locks makes it possible to set every trig to have its own unique
> parameter values."**
> — [Elektron, *Digitakt User Manual*, p.33](https://www.manualslib.com/manual/1275776/Elektron-Digitakt.html?page=33)

Two details from the Digitakt manual that matter to how ours should behave:

> "Up to 72 different parameters can be locked in a pattern. **A parameter
> counts as one (1) locked parameter no matter how many trigs that lock it.**"
> — [ibid]

> "**Lock trigs containing the locks will be placed on the sequencer steps not
> containing note trigs.**" — [ibid]

So a lock is **per step, not per note**: the lock belongs to the position in
the bar, and it applies to whatever sounds there. That is exactly what this
program's `plock` does — `motionAt` rounds the event's time to a sixteenth and
reads `amt[step]` — so the mechanism was already the right shape. What was
missing was the tables.

## 2. WHAT IT IS FOR — variation without a second part

The Machinedrum review and the manuals agree on the purpose: a pattern that
repeats stops sounding like a repeat when the same hit is not quite the same
hit twice.

> Parameter locks allow "any Machine, effects and routing parameters within a
> kit to be locked to a fixed value at any step in a pattern", and the result
> is "an extremely fluid and creative drum machine."
> — [Elektron Machinedrum documentation, via search summary — *see §7, not
> individually fetched*]

And the repo already holds the genre-level statement of the same idea, from
its own minimal-techno research:

> minimal techno "evolves through **micro-variation** (filtering, panning, tiny
> automation), **not through adding new parts**", and "the most powerful
> arrangement move is not adding a new element"
> — [corpus:beatkey, already recorded in `NOTES-FROM-THE-USER.md`]

**That pair is the whole argument for this build.** A p-lock is the smallest
unit of micro-variation there is: it changes one knob on one sixteenth and
leaves the part, the arrangement and every note exactly where they were.

## 3. WHY IT MUST BE A `gesture` CONTROL, AND NOT A `bus` ONE

This is ours, not a source's, and it is why the census in §0 only ever finds
p-locks on one kind of control.

A `gesture` control is read afresh by `P()` **at the moment each note sounds**,
so a per-step value arrives per step by construction. A `bus` control is
written as an automation CURVE onto an AudioParam before the song starts, on a
grid — so a per-step rectangle on a bus is a shape the curve writer has to be
able to resolve, and the honest thing is not to ask it to. Every one of the
twelve existing p-locks is on a `gesture` control, and the three added below
are too. **A p-lock on a `switch` or a `voicing` is forbidden outright** by the
conductor's contract and by a seam check.

## 4. WHERE THE SOURCES PUT THEM — genre by genre

### 4a. JUNGLE — the strongest case in the file, and it is structural

A chopped break is *already* a per-slice instrument. Slicing a break in any
sampler produces one independent voice per slice:

> "The 'Built-in' slicing preset creates a **Drum Rack with chains holding a
> Simpler for each slice**."
> — [Sound On Sound, *Ableton: Live Clip Slicing*](https://www.soundonsound.com/techniques/ableton-live-clip-slicing)

which means each slice has its own transposition, filter and envelope by
construction. The jungle-specific statement of the same thing:

> "Each slice has its own pitch, envelope and filter controls" — and "you can
> **pitch individual slices**, adjusting the velocity for each slice."
> — [KAN Samples, *How to Chop the Amen Break*](https://kansamples.com/blogs/learn/how-to-chop-amen-break)
> — ⚠ **from a search summary; the page returned HTTP 429 on two fetch
> attempts, so this quote is NOT verified against the live page.** The SOS
> quote above carries the same claim and IS verified. See §7.

**Our break machine already declares exactly that trio** — `amen.tune`
(pitch), `amen.tail` (envelope), `amen.tone` + `amen.hp` (filter) — and jungle
p-locked only the pitch. So the sourced set was three-quarters unbuilt.

### 4b. PLASTIKMAN — micro-variation is the genre's own definition

Covered by the beatkey quote in §2, which is already this repo's source for
this genre. Its one p-lock is on the 303's cutoff; the classic p-lock target on
a drum machine is the **hat**, which is the voice that plays most often and
therefore the one where "the same hit twice" is most audible. General
hi-hat-variation practice supports the target if not a number:

> "A real drummer rarely hits every snare or hi-hat at the same intensity."
> — [search summary across humanisation guides — *not individually fetched*, §7]

### 4c. WHERE THEY DO **NOT** BELONG — and this is a result, not an omission

- **bladerunner** and **dungeon synth** have zero p-locks and keep zero. A
  per-step mechanical tick is the opposite of what a film cue and a slow modal
  drone are; the file's own table comment for one of them already says "no
  plocks and no gestures: this music has no fills". Recorded so nobody
  "completes the set" later.
- **dkc** has one, at 2.7% of its dial — the smallest in the file. Chip
  arpeggios are per-step by nature, so there is probably a case here, but **no
  source was found for it** and a guess dressed as research is the most
  expensive thing this project produces. Left alone, named as open.
- **lofi**, **acid**, **synthwave** already carry three each. Whether theirs
  should move FURTHER is a taste question with no source behind it — §6.

## 5. WHAT WAS BUILT

Three lanes, all appended at the END of their control's existing spec list so
no existing draw index shifts (Law 3 — a named substream is keyed by control
and index, and inserting would move every later lane's stream).

| genre | control | why | size |
|---|---|---|---|
| jungle | `amen.tone` | the FILTER of the sourced per-slice trio | `[-5500, 1200]` Hz, density `[0.10, 0.24]` |
| jungle | `amen.tail` | the ENVELOPE of the same trio — a choked slice | `[-0.018, 0.055]` s, density `[0.10, 0.22]` |
| plastikman | `tr1000.chdecay` | the closed hat; micro-variation on the busiest voice | `[-0.015, 0.030]` s, density `[0.10, 0.24]` |

**Every number in that last column is `[EAR]`.** The SHAPE is sourced — which
control, on which genre, and why — and no source anywhere gives a depth or a
density. The densities match the band the eleven existing lanes already sit in
(2–4 live steps of 16), which is a consistency argument and not a measurement.

## 5b. MEASURED AFTER — the census, and then the samples

**The census, same instrument as §0.** Three lanes added, 12 → 15, all firing,
all on machines that play in 100% of their genre's songs:

```
  plastikman   tr1000.chdecay     2.7/16       0.019 s        14.3%           100%
  jungle       amen.tone          2.8/16    3379 Hz           22.8%           100%
  jungle       amen.tail          3.0/16       0.034 s         8.6%           100%
```

**And then the only instrument that can actually see a motion change.** The
notes cannot — motion reaches the sound through `P()` and never touches an
event — so the roll is byte-identical and the snapshot is IDENTICAL, both
correctly. A render A/B is what is left. 16-second windows, same seed, same
genre, **with a same-build control first**, because an A/B without one measures
its own noise and this repo has been caught by that twice:

| | the music | control (same build twice) | with the p-locks vs without | verdict |
|---|---|---|---|---|
| **jungle**, the break, 90–106 s | −14.4 dB | **−90.6 dB** | **−45.5 dB** | **45.1 dB above the floor**, 31.1 dB under the music — unmistakably real |
| **plastikman**, 120–136 s, broadband | −16.5 dB | −81.4 dB | −73.1 dB | 8.3 dB above the floor — real, but the broadband number is the wrong ruler |
| …the same, in the hat's own band (5–12 kHz) | −34.7 dB | −107.9 dB | −74.4 dB | **33.5 dB above the floor**, 39.7 dB under that band — real, and small |
| **lofi**, 60–76 s — a genre NOT touched | −15.5 dB | −112.2 dB | −112.0 dB | **0.2 dB — inside the noise. Unchanged.** |

Two things worth keeping from that table:

1. **The broadband reading understated the hat by 25 dB.** Measured across the
   whole spectrum the plastikman change looks marginal (8.3 dB over the floor);
   measured in the band a closed hat actually occupies it is 33.5 dB over. That
   is this file's own standing lesson — *anchor the window to the thing you are
   measuring* — and reporting only the first number would have been a wrong
   finding in the safe direction.
2. **The plastikman lane is genuinely SMALL** — about 40 dB under its own band.
   In the control's own units it is not small at all (the hat's decay swings
   roughly 23–68 ms against a 38 ms base, a 3× range), so this is a mix-balance
   fact rather than a wiring one: the closed hat is one quiet voice among many.
   That is what "micro-variation" is supposed to mean, and whether it is *enough*
   is an EAR question this sheet cannot answer.

## 6. WHAT THIS DOES NOT DO, said plainly

- **It does not make p-locks common.** 12 → 15 lanes, 1.5% → 1.9% of the
  file's motion. The mechanism is still the least-used of the eight kinds by a
  wide margin, and the tables still lean on `lfo` (474 lanes) and `section`
  (187).
- **It does not touch the existing twelve.** Several move under 5% of their
  dial and may be inaudible; making them bigger is taste with no source and is
  the obvious next thing for an EAR to rule on, not for me to guess.
- **Nobody has heard any of it.** Motion reaches the sound and never the notes,
  so there is no roll to read for this and no snapshot to move: the only
  instruments that can see it are a render A/B and a listener.

## 7. SOURCING HONESTY — what was verified and what was not

**Fetched and quoted from the page itself:** the Elektron Digitakt manual
(p.33), the Elektron Machinedrum manual (p.55), and Sound On Sound's *Ableton:
Live Clip Slicing*.

**NOT fetched — quoted from a search summary and marked as such in the text
above:** the KAN Samples per-slice lines (HTTP 429, twice), the Machinedrum
"extremely fluid and creative" line, and the hi-hat humanisation line. The
beatkey micro-variation quote is not re-verified here either — it is carried
over from this repo's own earlier research where it is already recorded.

Every load-bearing claim in §4a has a verified source (SOS) as well as an
unverified one (KAN). The claim in §4b rests on a quote this repo already
held. **Nothing in §5 rests on an unverified quote alone.**
