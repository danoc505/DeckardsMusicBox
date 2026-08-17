# THE BOW — the fourth playing discipline, `2026-08-17`

*The owner: "A fiddle is something we should get in here, i bet we can find a
free open source version just like the other instruments we have found."*

They were right, and it took one fetch. This sheet records where the recordings
came from, why a bow needed a discipline of its own, and what a fiddle is that a
violin is not.

---

## 1. WHERE THE RECORDINGS CAME FROM

**Philharmonia Orchestra sound samples**, `arco-normal` violin — the plain bowed
note, no vibrato-off, no pizzicato, no col legno.
[philharmonia.co.uk/resources/sound-samples]

Licence: free to use in your own work; the samples may not be resold *as
samples*. This is the same position already recorded for the contrabassoon, the
brass and the banjo, and it is the same orchestra — so nothing new was accepted
here that this project had not already accepted three times.

The percussion pack from the same source gave three **washboard scrapes**,
encoded in the same bank.

### 1a. AND I GAVE UP TOO EARLY THE FIRST TIME — recorded because it matters

The first attempt guessed two sample URLs, got 404s, declared the samples
unreachable, and started **synthesising a washboard**. The owner stopped it:

> *"Before you fake it try harder to find open source free samples. Try the
> philharmonic again. Dont give up so easy"*

The correct method was one step: **fetch the page and read it.** The real URLs
were sitting in the HTML —
`philharmonia-assets.s3-eu-west-1.amazonaws.com/uploads/2020/02/12112005/Strings.zip`
and the matching `Percussion.zip`.

The rule this cost is worth stating plainly: **a 404 on a guessed URL is
evidence about the guess, not about the archive.** Read the page before
concluding a thing does not exist.

---

## 2. WHY THIS ONE IS RECORDED AND THE JUG IS NOT

Everything else this genre needed was either sampled or cheap to model honestly.
A jug is a Helmholtz resonator — one strong low mode and a lot of breath — and a
model of that IS the instrument. A diddley bow is one wire; §7b already settled
that "synthesized and saying so" is honest there.

**A bow is neither.** The tone is a *stick-slip oscillation*: the string is
dragged by the rosin, snaps back, is caught again, hundreds of times a second.
Its spectrum depends on bow speed, bow pressure and where between bridge and
fingerboard the hair sits — three continuous variables interacting — and a
synthesised one announces itself in about a second. So the fiddle is recorded.

---

## 3. WHAT THE BANK HOLDS, AND HOW THE ROOTS WERE DECIDED

72 notes, **MIDI 55 to 91** — the violin's open G (G3) to three octaves above —
at **three dynamics** (`P` piano, `M` mezzo-forte, `F` forte).

**Roots are measured, not read off the filename.** The bank rule since the
erang: the filename fixes the pitch class, autocorrelation on the audio decides
the frequency, and anything more than **60 cents** from its name is dropped and
said so. `harness/fiddle_bank.py` prints the drops.

Each note is head-trimmed to the bow's own start and carries **measured loop
points** across its steadiest middle, so a held note does not run out of
recording.

**The dynamic picks the recording, not a volume knob.** A loud bowed note is a
different *sound* — more upper partials, a harder catch — not a louder one. Same
rule the banjo's forte/piano sets already follow.

---

## 4. A FIDDLE IS A VIOLIN PLAYED DIFFERENTLY

That is the whole of the difference and it is a **playing** difference, not an
instrument one. There is no separate object to record. So the samples are a
concert violinist's, and the fiddle lives in how the program writes for it and
in two controls:

| control | what it is | why it exists |
|---|---|---|
| `DIG` | bow pressure | a fiddler leans on the string where an orchestral player will not; the recordings already hold that brightness at forte, so this rides the filter rather than inventing an edge |
| `ROSIN` | the scratch in front of the note | a concert attack is clean; a porch attack is not |

**No vibrato control.** The recordings have the player's own. Adding a second
one on top is two hands on one string.

---

## 5. THE BOWED DISCIPLINE — the fourth in the file

`PLAY_FAMILY` had three disciplines before this:

| family | the limit | what happens at the limit |
|---|---|---|
| plucked / struck | the string stops ringing | the note is **capped** at its ring time |
| wind | the player runs out of air | the note is **cut** and a **0.20 s breath gap** is left |
| **bowed** | **the arm runs out of bow** | the note is **split** and the halves **touch** |

**The bow change is the whole point and it is not a breath.** A wind player who
runs out of air leaves a hole; a bowed player reverses the bow and the sound is
continuous — a tiny change of colour, no silence. Modelling a bow as a wind
would put a gap in a held note where a real player puts none.

### 5a. HOW LONG A BOW LASTS — by dynamic

A loud note eats bow faster, because loud means more hair speed. Sourced
figures, in seconds of usable stroke:

| dynamic | stroke |
|---|---|
| pp | 10–15 s |
| p | 8–12 s |
| mp | 6–9 s |
| mf | 4–8 s |
| f | 2–5 s |
| ff | 1–3 s |

[ovationpressbooks — bow distribution and stroke length]

The program takes the conservative end of each band and interpolates from the
event's own dynamic: `bow = 13.0 - 11.0 * gain`, so a soft note gets 13 seconds
and a loud one gets 2. A note longer than its budget is split into equal parts
that abut exactly; every part after the first is marked `bowChange: true` so a
voice can colour the seam.

**MEASURED, 60 records:** 4,407 fiddle events, 6 bow changes, **0 gaps**. The
splits are rare because this genre writes short notes — the discipline is a
ceiling, not a shaper, and a ceiling that is rarely touched is still the
difference between a physical instrument and a sampler.

### 5b. AND IT IS THE ONLY BOWED THING IN THE FILE

Checked rather than assumed, because "bowed" is a tempting label:

- the **hurdy-gurdy** has a wheel, and a wheel never reverses — it is a
  continuous rosined surface, so it has no bow change at all;
- **`erangStrings`** and the **VP-330** are machines. A tape choir holds until
  the key is released; there is no arm.

One instrument, one discipline. That is why it is declared on the instrument
rather than inferred from a family name.

---

## 6. WHERE IT PLAYS

Boxcar synth only, on **the tune and the answer both** — `lead` weight 4 (just
under the harmonica's 5, because the harp is still this genre's voice) and
`counter` weight 4 (level with the slide).

No other genre draws it. That is deliberate: a fiddle in dungeon synth is a
different record.

### 6a. AND DECLARING THE SECOND LANE IS WHAT REMOVED IT

Worth recording because it is a trap the file sets quietly. The first draft
declared `lanes: { lead: "fiddle", counter: "fiddle" }` — the honest reading of
"it plays both" — and **measured zero counter draws in 60 records** while the
diddley, the harp and the gurdy shared that chair.

`canFill` is why:

```js
return !!(PITCHED_SLOT[kind] && PITCHED_SLOT[M.slot] && Object.keys(M.lanes).length === 1);
```

A pitched box is lent to another pitched lane **only when it declares exactly
one lane**, and the doubling engine reads `Object.keys(lanes)[0]` in two more
places on the same assumption. So the idiom is: declare one lane and the second
chair comes for free. Every other multi-role instrument in the file already does
this; the two-lane declaration was the deviation.

---

## 7. WHAT MOVED, MEASURED

Baseline, all 1,500 songs:

- **209 songs changed, every one of them boxcar synth.** No other genre moved a
  byte.
- **Tempo moved in 0. Key moved in 0. The written-music hashes are identical in
  every changed song.**
- 77 changed their rendered event count — and only their event count — because
  the fiddle's own discipline (two notes at once where the slide plays one; a
  long note split at the bow) plays the same written music differently.

That is exactly the shape an arrangement change should have: **the same music,
different players.**

---

## SOURCES

- philharmonia.co.uk/resources/sound-samples — the recordings and the licence
- ovationpressbooks — bow distribution, stroke length by dynamic
- the file's own `canFill`, `PLAY_FAMILY` and `harness/fiddle_bank.py`
