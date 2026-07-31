# The saxophone, and where the growl is not — 2026-07-31

*The handoff §9 left three options for the growl: synthesise it, find it elsewhere, or
ship without and say so. It also said "look before assuming", because the last three
assumptions about sample availability were all wrong. The user's instruction was
"search harder". This is that search, and its result is a negative one.*

---

## The answer, first

**No sample library I could verify, under a licence this program can use, contains a
saxophone growl.** The one library that documents having them is commercial.

| source | licence | growl / flutter / subtone? |
|---|---|---|
| **University of Iowa MIS** | free "without any restrictions on their use" | **No.** Six combinations only: `Vib`/`NoVib` × `pp`/`mf`/`ff`. The whole index was checked in an earlier pass. |
| **FreePats tenor saxophone** | **CC0 1.0** | **No.** Sustains with infinite sustain loops. No growl, flutter-tongue, subtone or multiphonic. Derived from the Versilian material. |
| **Philharmonia Orchestra** | CC BY-SA 3.0, **plus** "must not be sold or made available 'as is' (i.e. as samples or as a sampler instrument)" | **Unknown, and probably unusable anyway** — see below. |
| **VSCO-2 Community Edition** | CC0 | Saxophone presence **unconfirmed**; the published description lists strings, brass and woodwind families without naming the sax roster. |
| **Xsample Acoustic Instruments** | **commercial, paid** | **Yes** — documents alto saxophone flutter tongue, growling and multiphonics. Not usable here. |

## Why Philharmonia is not the answer even if it has one

Two independent problems, and the second is the fatal one:

1. **The download is stale.** The URL every mirror and GitHub repo still advertises —
   `philharmonia.co.uk/assets/audio/samples/saxophone/saxophone.zip` — returns **404**.
   The library moved to `mmsf.philharmonia.co.uk`. Anything citing that path is citing
   a dead link, which is worth knowing before someone else spends a pass on it.

2. **The licence is share-alike, and it forbids exactly what we would do.** CC BY-SA
   3.0 is a copyleft licence: `docs/LICENSING.md` already rules out JS80P and mda-lv2
   on precisely this ground, because vendoring copyleft material into a single-file
   program argues for relicensing the whole file. And the Philharmonia terms add an
   explicit restriction — samples may not be "made available 'as is' (i.e. as samples
   or as a sampler instrument)". Base64-embedding a note bank into an HTML file that
   plays it back on demand is difficult to describe as anything else.

   Note this is a *different* objection from the user's "personal use only, not sold
   or distributed". That answers the *commercial* half of a licence; it does not
   answer share-alike, and it does not answer a clause about redistributing samples as
   samples. The published artifact is a URL that serves the file.

## So the growl is one of two things

The handoff's option 2 is closed as far as this search can close it. That leaves:

1. **Synthesised over a clean sample.** Physically a growl is amplitude *and* frequency
   modulation at roughly 25–40 Hz with added noise — the player hums against the reed.
   That is reproducible with the machinery this program already has, and it would be
   marked `[EAR]`, **never** `[corpus]`, because no measurement of a real growl backs
   the numbers.
2. **Ship without it and say so.** Iowa's three real dynamic layers plus a vibrato
   switch is already an expressive instrument, and a sax that cannot growl is a
   limitation, not a lie.

**Recommendation: (1), marked `[EAR]`, with the scoop and the fall built first** — those
two are `playbackRate` ramps on the same machinery the 303 slide already uses, they are
as characteristic of a sax line as the growl, and neither needs a sample nobody has.

## What is still true from §9 and unchanged

- **Iowa's filenames carry the pitch**, which is what unblocked the sampler:
  `AltoSax.vib.ff.Db3.stereo.aif` — and Db3 *is* MIDI 49, which is what the detector
  returned at 0.96 confidence. Use the detector only where no filename can be read.
- **The dynamic layers matter more than they look.** A sax's dynamic is *timbral*: at
  `ff` the reed buzzes, at `pp` it is close to a sine with breath. One layer with its
  gain scaled is the fake-horn giveaway.
- **`harness/make_sample.py` reads WAV and AIFF**, trims, downsamples and preserves the
  original peak as `pk`. Nothing about the pipeline is blocked.

## Not yet done

The sax **voice itself is not built**. This document is the source question answered,
not the instrument. The remaining work is: fetch the Iowa notes, run them through
`make_sample.py`, register a machine in the `keys` (or a new `horns`) slot with a `kind`
on every control, and remember the seam check — *a gesture or bus control that no genre
rides fails the battery*.
