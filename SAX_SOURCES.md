# Saxophone sources — research note

Read against `HANDOFF.pdf` (the current MKII handoff) and the checked-in modules.
Every number below was **measured from this sandbox**, not quoted: every URL was
actually requested, the Weimar database was actually downloaded and queried. Where I
could not verify something, it says so.

---

## Where the sax currently is in the MKII

There is no sax sample path today. The sax is a two-oscillator subtractive voice:

- `synth.js:74` — `sax:["sawtooth","square"]`
- `synth.js:81` — lowpass at 3000 Hz (shared with `brass`)
- `synth.js:83-85` — 60 ms attack, 200 ms release, peak `vel * 0.26`
- `synth.js:87` — vibrato oscillator (sax, strings, flute only)

Two constraints from the handoff shape everything below:

1. **One HTML file, ~1 MB, no network requests.** Every corpus and library is embedded.
   A raw multisample cannot go in as-is.
2. **Corpora are stored relatively** — scale degrees, scale-steps, durations, drum lanes,
   never absolute pitch. That is what lets material from one key drop into another.

So "sax database" splits into two genuinely different answers, and the second one is the
one that fits the architecture.

---

## A. Audio multisamples (for a sampled sax voice)

### 1. University of Iowa MIS — best licence, verified downloadable

Anechoic chamber recordings, released with **no restrictions of any kind** (public domain
in practice). Reachability confirmed: a single note fetched at `200`, 1,137,664 bytes.

| Set | Files | Zip |
|---|---|---|
| Eb Alto, `vib.ff`, per-note stereo | 32 | 16,271,265 B |
| Eb Alto, `NoVib.ff`, per-note stereo | 32 | 13,203,510 B |
| Bb Soprano, `vib.ff`, per-note stereo | 32 | 14,891,367 B |
| Bb Soprano, `nonvib.ff`, per-note stereo | 32 | 15,153,615 B |

Plus the older chromatic-**scale** files, which do carry three dynamics — alto 18 files
(3× pp / 3× mf / 3× ff), soprano 25 files (4/4/4 + extras). Those are runs of notes in one
file and would have to be split on transients before use.

**The catch, stated plainly:** the per-note 2014 sets are **ff only**. The widely repeated
claim of "3 velocity layers, 375 samples" describes the older scale files, not the
per-note sets. A one-dynamic sax multisample sounds like one dynamic — on a reed
instrument that is the difference between a sax and a sax patch.

- Index: https://theremin.music.uiowa.edu/MIS.html
- Alto: https://theremin.music.uiowa.edu/MIS-Pitches-2012/MISEbAltoSaxophone2012.html
- Soprano: https://theremin.music.uiowa.edu/MIS-Pitches-2012/MISBbSopranoSaxophone2012.html

### 2. VCSL (Versilian Community Sample Library) — CC0, verified via git clone

`git clone --filter=blob:none` succeeded. **144 sax wavs**, velocity layer and round-robin
encoded in the filename (`_vl2_rr1`):

| Instrument | Non-Vibrato | Staccato | Vibrato |
|---|---|---|---|
| Tenor Saxophone | 46 | 40 | 19 |
| Saxello | 16 | 15 | 8 |

Tenor sampled range G#1–A#4 (whole-tone-ish spacing, ~27 distinct pitches). CC0 — no
attribution required, no share-alike. https://github.com/sgossner/VCSL

### 3. FreePats tenor sax — the same VCSL material, pre-built, and small

Already mapped to SFZ/SF2 with sustain loops. Sizes as published:

- full: SFZ+WAV 40 MiB · SFZ+FLAC 31 MiB · SF2 25 MiB
- **small: SFZ+WAV 6.5 MiB · SFZ+FLAC 4.7 MiB · SF2 6.5 MiB**

CC0. https://freepats.zenvoid.org/Reed/saxophone.html

The *small* set is the only ready-made option in the right order of magnitude for a file
that is currently ~1 MB, and it is the one I'd start from.

### 4. Karoryfer "Weresax" — the most playable, licence unverified

Alto, 32 notes Db2–Ab4, **2 velocity layers × 2 round robins = 256 samples**, 24-bit WAV,
SFZ, 189 MB, free. This is the only free sax I found with both velocity layers *and*
round robins — the two things that stop a sampled reed sounding like a machine gun.

**Unverified:** the product page now 302s to `shop.karoryfer.com`, so I could not read the
current licence text or confirm the download still exists. Karoryfer historically used
their own custom licence, not CC0. Check before shipping anything derived from it.

### 5. Philharmonia Orchestra — probably not available

Search results claim saxophone; the live page at
`philharmonia.co.uk/explore/sound_samples/saxophone` lists "all standard orchestral
instruments… guitar, mandolin, banjo, percussion" with **no saxophone**. Their licence
also forbids redistributing samples "as is", which an embedded sampler bank arguably is.
Treat as a dead end unless someone confirms otherwise.

### Sizing note (estimate, not a measurement)

12 sampled pitches × ~2 s × mono Opus at 48 kbps ≈ 144 KB, ≈ 192 KB base64-encoded.
That is embeddable. Raw WAV is not, at any useful note count. This is arithmetic, not a
tested render — it needs measuring before anyone plans around it.

Also worth remembering: `11_slicer.js` already accepts a dropped-in audio file. A sax
loaded that way costs the bundle nothing.

---

## B. The corpus-shaped answer: Weimar Jazz Database (WJazzD)

**This is the one that matches the architecture.** Downloaded (42,512,384 B sqlite3) and
queried directly. Measured:

| | |
|---|---|
| Solo transcriptions total | 456 |
| **Saxophone solos** | **272 (59.6%)** — ts 157, as 80, ss 23, bs 11, ts-c 1 |
| Note events in sax solos | 142,072 |
| PHRASE segments (sax) | 7,843 |
| IDEA segments (sax) | 10,746 |
| Beats carrying a chord symbol (sax) | 19,868 |
| Distinct chord symbols (sax) | 358 |
| Sax performers | 41 |
| Styles | POSTBOP 94, HARDBOP 45, COOL 41, SWING 36, BEBOP 31, FUSION 15, TRADITIONAL 5, FREE 5 |

Every note carries onset, pitch, duration, bar, beat, tatum and loudness; `beats` carries
chord changes and bass pitch; `sections` carries phrase, idea, chorus and form
segmentation. That is exactly the shape `07_conductor.js` and `06_melody_engine.js`
already consume, and it is *melody with its harmony attached* — which
`jazz_corpus.json` (chords only, no melodies) deliberately does not have.

- Overview: https://jazzomat.hfm-weimar.de/dbformat/dboverview.html
- `wjazzd.db`: https://jazzomat.hfm-weimar.de/download/downloads/wjazzd.db
- Unquantized MIDI: `downloads/RELEASE2.0_mid_unquant.zip`

### Licensing: not a constraint here

This program is not distributed. It is one person's instrument.

That settles both of the questions that would otherwise apply. ODbL's share-alike
obligation attaches to publicly distributing a derived database — a private corpus on
your own machine never triggers it. And the reason `jazz_corpus.json` is "chords only, no
melodies" while `folk_corpus.json` is public-domain tunes was a *distribution* stance;
it does not govern what a private tool reads. Harvest the melodies.

The only thing worth keeping in mind is downstream: if a song this machine writes ever
gets released, that's the moment the provenance of the material matters, not now. The
recombination architecture makes verbatim survival unlikely anyway — a phrase enters as
relative degrees, gets split into rhythm and contour by `13_flip.js`, and comes back out
carrying someone else's rhythm.

### What a direct harvest yields (measured)

| | |
|---|---|
| Sax PHRASE segments | 7,843 |
| Phrase length in notes | median 14, mean 18.1, p10 4, p90 38, max 137 |
| **Phrases 3–24 notes (corpus-usable)** | **5,717** |
| Melodic intervals inside those phrases | 134,229 |
| Stepwise (1–2 semitones) | 54.5% |
| Repeated note | 4.0% |
| Leap (3+ semitones) | 41.5% |
| All 272 sax solos carry chord changes | yes |

For scale: `folk_corpus.json` holds 900 melodic phrases. A sax harvest adds **5,717**, and
unlike the folk phrases every one arrives with its chord changes attached, so a phrase can
be stored against the harmony it was actually played over. Fed through `build_dimensions.js`
the rhythm × contour split multiplies that the same way it turned 1,217 harvested phrases
into 350,000 combinations.

Remember `IMPROV_HARVEST` — harvesting must forbid the engines drawing on the corpus, or
the library feeds on itself and narrows.

### One number worth arguing about

*Known unfinished* benchmarks voice leading at ~52% stepwise "against Bach's measured
77.3%". Real jazz sax phrases measure **54.5% stepwise**. Those are two different things —
Bach's 77.3% is inner-voice motion in four-part chorales, the 54.5% is a solo melodic line —
and conflating them would set the melody engine chasing a target that would make it sound
like a chorale alto part rather than a horn player. If the lead is a sax, 54.5% is its
number. The harmony voices are still Bach's problem.

---

## Recommendation

1. **Harvest WJazzD into a sax corpus** — `build_sax.js` alongside the existing builders.
   5,717 usable phrases, stored relatively like everything else, each against the chord
   changes it was played over. Then run `build_dimensions.js` so the rhythms and contours
   join the recombination pool.
2. **Characterise it too, not just harvest it** — phrase length, stepwise share, where
   phrases start against the beat, chord-tone landing rate, range per style. That is the
   listed gap ("melodies and grooves are not yet characterised the way progressions are"),
   and it is what lets a genre ask for sax phrasing on *properties* rather than by name.
3. **FreePats small tenor (CC0, 4.7 MiB FLAC) as the sampled voice**, thinned and
   re-encoded. Already mapped, already looped, right order of magnitude.
4. **Weresax is fine to use** for a private instrument, and it is the best-playing free sax
   here — 2 velocity layers × 2 round robins. 189 MB never goes in `player.html`; load it
   through the drop-in path or thin it down first.
5. **Iowa alto as a second colour** — but it is single-dynamic in the per-note sets.

The 1 MB single-file constraint is *not* a licensing artifact and does not relax. It exists
because the program has to open from a USB stick with no network. Sample bytes still have
to be earned.

Whatever gets built, the rule from the handoff stands: `node print_roll.js <seed> <bars>`
before and after, and `node tests.js` before shipping. A sax that measures well and reads
wrong on the roll is not fixed.

---

## Sources

- https://theremin.music.uiowa.edu/MIS.html
- https://theremin.music.uiowa.edu/MIS-Pitches-2012/MISEbAltoSaxophone2012.html
- https://theremin.music.uiowa.edu/MIS-Pitches-2012/MISBbSopranoSaxophone2012.html
- https://github.com/sgossner/VCSL
- https://versilian-studios.com/vsco-community/
- https://freepats.zenvoid.org/Reed/saxophone.html
- https://bedroomproducersblog.com/2015/11/13/weresax-saxophone-sfz/
- https://www.philharmonia.co.uk/explore/sound_samples/saxophone
- https://jazzomat.hfm-weimar.de/dbformat/dboverview.html
- https://jazzomat.hfm-weimar.de/download/download.html
