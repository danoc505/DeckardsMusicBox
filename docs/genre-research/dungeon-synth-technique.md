# Dungeon synth, second pass: HOW IT IS PLAYED

*Researched 2026-08-06 at the user's request, after they said: "I think chords
are long very long and blocked not rolled, that does not mean we have no use
for the rolled chord style." 19 sources that are not in
`dungeon-synth.md`. That sheet is WHAT THE GENRE IS; this one is HOW THE NOTES
ARE STRUCK, which is a different question and turned out to have a much worse
evidence base.*

**The richest vein by a distance is the community's own forum,
`dungeonsynth.proboards.com`** — practitioners describing their own method to
each other, which is the closest thing to primary source this genre has outside
the Mortiis interview. Nearly every number below comes from there.

---

## 0. THE HEADLINE, AND IT IS AN ABSENCE

**Not one source anywhere describes rolled, strummed, or spread chords.** No
mention of notes offset from each other. No mention of arpeggiation as a chord
*voicing* (as opposed to a melodic figure). No mention of quantisation,
humanisation, timing feel, velocity, or attack simultaneity as an aesthetic
choice, by anybody, in any of the 19 sources.

An absence is not proof. But this is a community that argues in public about
compression ratios, EQ shelves and which Casio to buy, and **the question of
how to strike a chord never once comes up.** For a genre whose practitioners
are that granular about everything else, a technique that mattered would have
left a trace. The user's verdict got here first and the research does not
contradict it.

What the sources DO say about articulation, in full — this is all of it:

| | claim | source |
|---|---|---|
| **sustained** | "Use **long, sustained notes** to enhance the ethereal quality." | [dungeonsynth.neocities.org/howto](https://dungeonsynth.neocities.org/howto) |
| **pulsed** | "simple approach that's based around a certain scale and a **droning root and perfect fifth pulse under it**" — user *ranseur* | [proboards/351 music theory](https://dungeonsynth.proboards.com/thread/351/dungeon-synth-music-theory) |
| **arpeggio + staccato** | "**arpeggiated minor chord melancholy**" over "a **sluggish left hand approximating power chords**"; "the dependence upon **staccato and arpeggio**" | [deathmetal.org, Goatcraft review](https://www.deathmetal.org/review/goatcraft-yersinia-pestis-2016/) |

**Two cautions on that third row, and they matter.** It is a *hostile review* —
the same sentence calls the result "characteristic **stiffness** in execution
which blemishes through its brutishness." The writer is naming heavy
arpeggio dependence as a **defect**. And an arpeggio is a melodic figure played
one note at a time; it is not a rolled chord, which is one chord whose notes
are smeared by a few tens of milliseconds. They are different things and the
program already does the first (the inner-voice figure) correctly.

**Decision, and it is mine to make [ss4 of the first sheet's precedent]:** the
comp's rolled voicing is switched OFF for this genre. The evidence for it is
zero sources; the evidence against is one source saying "long sustained notes",
one describing a re-struck pulse, and the physical fact below.

**The physical fact, which outranks all of it:** the two machines this genre
plays are a **tape-replay keyboard** and a **string ensemble**. Press three
keys on a Mellotron and three tape heads start in the same instant — there is
no roll available on that instrument to make. The program was applying a
technique from a hand on an electric piano to a machine that has no hand in it.

### ...and where the roll DOES belong

**Harps and harpsichords are named by our two most specific sources**, and they
are exactly the instruments on which a rolled chord is not a stylistic choice
but a physical necessity — you cannot pluck three strings in the same instant.

> instrumentation: "choirs, strings, pipe/chapel organs, flutes/recorders,
> horns, **harps**, and celesta/bell tones"
> [corpus:melodigging] — **re-verified verbatim at the source 2026-08-06**

> "bass flutes, bass oboes, tenor voices, strings, **harpsichord** and timpani"
> [corpus:erichgrunewald]

The user's instinct that the rolled style still has a use lands exactly here.
And their own sample pack agrees: the Erang pack devotes **five files to a
"Plucked" family** — 0–10 ms attack, 2.0–3.7 s ring — and the program has no
instrument that can play them.

### ⚠ A SOURCE THIS SHEET REFUSES

`lyricassistant.com/how-to-write-dungeon-synth-songs/` supplies, on its own,
the most specific and most implementable numbers anywhere on the open web:
pad attack/release values, a harmonic rhythm in measures, a 4-step motif
recipe, and — temptingly — "60 BPM with a soft marching tom on **beats one and
three every other bar**." **None of it is corroborated anywhere, and the site
is a commercial AI lyric-generation service whose blog is near-certainly
programmatically generated.** Its byline claims a Grammy. It is *musically
plausible*, which is precisely what makes it dangerous — it reads like
expertise. **Nothing from it is used in this program.** Recorded here so the
next person who finds it (and it ranks well) knows it was found and refused.

---

## 1. HOW MANY PARTS AT ONCE — the best-evidenced thing here

[proboards/266 song writing & recording](https://dungeonsynth.proboards.com/thread/266/song-writing-recording-discussion-thread)

| artist | count |
|---|---|
| *DieuxDesCimetieres* | "anything between **three to ten tracks**... **not counting the percussion**" |
| *garvalf* | 3–10, citing chiptune's 3–4 channel limit as training in simplicity |
| *zerointerno* | 7–12 tracks, but "**Approximately only 4-6 of them sound simultaneously**" |
| *stormcrow* | four: "**1 for chords, 1 for main themes, 1 for bass lines, 1 for percussion**" |

**`[four sources]`, and they agree on a ceiling: about 4–6 things sounding at
once.** zerointerno's distinction is the useful one — how many parts you WRITE
is not how many SOUND.

**Checked against this program.** Dungeon synth's fullest section declares
seven roles (keys, keys2, bass, lead, counter, ostinato, drums). That is above
the ceiling every source names. The arc thins it in practice, but the
declaration is richer than the genre's own practitioners work at, and it is
recorded here as a live question rather than quietly corrected.

And the community's stated fix for a muddy mix is **not** EQ:

> "**a good arrangement will take you a long way**" — be mindful of how many
> instruments sound at once and of frequency overlap — *myrrys*,
> [proboards/1305 mixing](https://dungeonsynth.proboards.com/thread/1305/mixing-discussion)

---

## 2. HARMONY — the concrete finds

### Modal shuttles, named as the genre's device

> "Look into **modal shuttles**, for ex. the dorian shuttle, aeolian shuttle,
> etc. **These sort of modal sounds are extremely common in DS.**"
> — *lolth*, [proboards/1491 chords in dungeon synth](https://dungeonsynth.proboards.com/thread/1491/chords-dungeon-synth)
>
> - **aeolian shuttle**: i–♭VII–♭VI–♭VII — in A minor, **Am–G–F–G**
> - **dorian shuttle**: i–IV — in A minor, **Am–D**

*(lolth writes the second as "i-bIV"; the example Am–D is a major IV, which is
the actual Dorian signature. The label is sloppy, the example is right.)*

A shuttle is a **two-or-three-chord oscillation that does not resolve** — it
rocks between two poles instead of going somewhere. That is a different object
from a progression, and it is what "long pedal notes and drones"
[corpus:melodigging] sounds like when the harmony does move.

### A practitioner's literal loop

> "**DFA (D minor) DFA DFA CEG (C major) Repeat.**" — *madrayken*, same thread

**Three units of i, one of ♭VII.** The only explicit harmonic rhythm from a
practitioner found anywhere: a 4-unit cycle weighted 3:1, not 2:2.

### Modes

> "**phrygian mode, natural minor, harmonic minor, pentatonic minor**, and some
> variations including **tetratonic and hexatonic minor scales**"; uses the
> diminished fifth in the melody; **avoids major scales entirely** — *ranseur*
> [proboards/351](https://dungeonsynth.proboards.com/thread/351/dungeon-synth-music-theory)

> "The **Dorian mode** particularly suits medieval dungeon synth aesthetics"
> — *nahadoth*, [proboards/65](https://dungeonsynth.proboards.com/thread/65/started-dungeon-synth-musician?page=2)

Consistent with the first sheet's minor/dorian/phrygian draw. **No new
information that changes the table.**

### The academic reading, and it is the strongest statement of the organum point

Xyh Tamura, *"Dungeon Synth as Transcultural and Transtemporal Construction:
Synthetic Medievalisms"* (2026),
[researchgate.net/publication/401526519](https://www.researchgate.net/publication/401526519)
— **403 to the fetcher; this is search-index paraphrase, NOT verbatim, and is
marked as such.** Medieval affect is activated by "drones and open fifths
suggestive of **parallel organum**", modal inflection, folk-coded timbres
"such as **flute and harp**", and simple dance-derived rhythmic cells;
composers favoured modes that felt bardic **without requiring functional tonal
resolution**.

That last clause independently corroborates *ranseur*'s "I avoid traditional
harmonic progressions", and it is the strongest support yet for the
`parallels` dial shipped at `2026-08-06b`.

### And a flat contradiction, recorded rather than resolved

> "**No dissonances between voices ever.** If you have to do one - make sure no
> one notices." — *zerointerno*

> "**passing tones... can be very disorienting in a good way**" — *nahadoth*

Both in [proboards/266](https://dungeonsynth.proboards.com/thread/266/song-writing-recording-discussion-thread).
The program sits between them by construction — dissonance is a cost, not a
ban — so neither source forces a change.

---

## 3. MELODY

> "a low note and a high note **no more than about 12 notes apart**"; craft
> rises and falls where "**the high note should only be hit one time**".
> Forms: "**ABAB, ABAC, or ABCBC**".
> [dungeon-synth.neocities.org/music-making-guide](https://dungeon-synth.neocities.org/music-making-guide)

> "**Keep the melody simple**", relying on "**repetitive patterns** to build
> atmosphere" — [neocities/howto](https://dungeonsynth.neocities.org/howto)

> classic dungeon synth's "**repetitive melodies**" work as "**a meditative
> chant** used to transpose oneself to distant places"
> — [synthdigest.com/primers](https://www.synthdigest.com/primers/)

**AABA is named by nobody.** Do not assume it. **Phrase length in bars is
given by nobody.**

---

## 4. PERCUSSION — the community is openly bad at this, and that IS the finding

[proboards/250 percussion in dungeon synth](https://dungeonsynth.proboards.com/thread/250/percussion-dungeon-synth)

> "I find I prefer **more spacious/spare percussion** to full driving
> percussion." — *Nahadoth*

> "I've always had **a lot of difficulty with incorporating percussion... I can
> never quite mix it properly**." — *Tyrannus*

> "I find it **hard using percussion in DS and make it sound good**." — *Pilgrim's Shadow*

And one hard rule on function, worth keeping:

> "**Drums can play as drums** and short sounds meant for melodies can play as
> rhythm. **But drums can not play as melodies.**" — *Olofdigre*

**A dissent, and a real one:** *Nazgaldracul* puts "**old school drum
machines**" on tracks and finds "**Roland 808** drum machine sounds
surprisingly effective." An 808 is neither medieval nor martial. The genre's
percussion practice is genuinely not settled.

**Timpani is sought after by name** — practitioners shopping for libraries name
"Timpani on Fire", "Epic Battle", Soundiron's "Apocalypse Percussion Ensemble 2"
([kvraudio thread](https://www.kvraudio.com/forum/viewtopic.php?t=400852)) — and
that thread also wants samples **dry, with "reverb added manually"**, which is
exactly how this program is built: the drum is dry and the room is a send.

### The melodigging tempo line, re-verified at source

The researcher flagged "martial snare figures, hand drum ostinati, or timpani
rolls at 40–80 BPM" as possibly search-engine synthesis it could not attribute.
**I fetched melodigging directly on 2026-08-06 and the page carries that
sentence verbatim, together with "Often beatless or very sparse percussion".**
The tempo band in the shipped table is correctly sourced. Recorded because a
doubt raised and then resolved is worth more than a doubt never raised.

**"Hand drum ostinati" is new** and this program does not have it: a repeating
hand-drum figure is a third percussion character beside the war drum and the
kettles, and nothing here plays one. Open.

**NOT FOUND, by anybody, anywhere:** a specific marching or processional
pattern — no rudiment, no dotted figure, no stated bar position. Every marching
placement in this program is `[CHOSEN]` and must stay marked as such.

---

## 5. PRODUCTION

> "spend **99.9% of the time on getting the volume right**" — *Damage Cloud*;
> volume and panning are the primary tools, EQ is for **cuts**, and *myrrys*
> prefers **shelves of a few dB** to drastic ones.
> [proboards/1305](https://dungeonsynth.proboards.com/thread/1305/mixing-discussion)

> **Drums are the exception:** "**Compression is key for punchy drums**...
> compress the hell out of each individual drum track, and then compress all
> the individual drum tracks onto a drum bus as well"; every drum on its own
> channel — "A kick drum should not be mixed on the same channel as a snare".
> [proboards/1224](https://dungeonsynth.proboards.com/thread/1224/looking-advice-on-mixing-drums)

The two threads contradict each other on compression (*"you almost never need
compression if you aren't using a microphone"* vs the above) because they are
about different material. **The program already splits this the right way** —
the procession gives every drum lane its own chain, and the pitched machines
are uncompressed.

**Tape is method, not accident:** *Mausolei* records to **analog 4-track
cassette** because "tape compression creates authentic lo-fi textures
impossible to replicate digitally"; *Verminaard* uses a reel-to-reel emulator;
*Wøzard* bounces a MIDI file to audio and **replays it two semitones down so it
artifacts and distorts**. And Erang, the pack's author:

> "I'm using **completely outdated software, more than 15 years old**";
> "**There are no rules.**"
> [daily.bandcamp.com Erang interview](https://daily.bandcamp.com/features/erang-dungeon-synth-interview)

---

## 6. THE SUBGENRES, musically rather than thematically

[dungeon-synth.neocities.org/subgenres](https://dungeon-synth.neocities.org/subgenres) — thematically rich, musically thin.

- **comfy synth** — the one with a stated MUSICAL difference: "**the
  minor/major key is the main difference**"; "light, **major** tone", "minimal
  keys and easy melodies", against dungeon synth's "oppressive and closed-in
  feel". [stranger-aeons.com](https://www.stranger-aeons.com/comfy-synth-but-is-it-dungeon-synth/)
- **winter synth** — "more **open expansive** feel", "slightly more
  minimalistic", "more overlap with dark ambient and **drone**".
- **forest synth** — nature field recordings, more acoustic and folk-leaning.
- **chip synth** — chiptune's hard channel limits applied to the genre.

**NOT FOUND as a musical category: "chapel synth" / "monastic synth".** It was
not on the subgenre page and no source defines it. Do not build one on the
assumption it exists.

---

## 7. WHAT THIS SHEET CHANGED IN THE PROGRAM

Shipped at `2026-08-06c`.

**`touch.roll`, a new genre dial**, 1 = the hand (every genre that shipped
before this, and every genre that stays silent), 0 = the machine. It scales the
width the comp's voicing is rolled across in `buildKeys`. Dungeon synth
declares 0, and `touch.strum` went to 0 with it. MEASURED, gap between the
first and last note of one chord: **102 ms typical / 216 ms worst → 0 ms.**
The other seven genres are byte-identical over 2100 snapshot rows — lofi keeps
its 8 ms hand and bladerunner its 68 ms.

### ⚠ AND IT COST THE GENRE MOST OF ITS PARALLEL FIFTHS. That is a real trade.

The `parallels` dial shipped at `2026-08-06b` was reported here as producing
32.7% parallel-perfect motion between the two keyboards. **Both halves of that
number were wrong**, and the 2×2 that found out is worth keeping:

| dungeon synth, 12 seeds | shadow cost ON | cost OFF (`parallels: 1`) |
|---|---|---|
| chords **rolled** | 29.1% | 32.7% |
| chords **blocked** | 0.0% | **3.9%** |

1. **The check that produced 32.7% was measuring the interval the wrong way
   round** — `pcOf(a - b)` where the cost it guards uses `Math.abs(a - b) % 12`.
   Those differ whenever the comp is the LOWER voice, which in this genre it
   always is. Fixed in `mk2_test.js`; the honest rolled figure was 29.1%.
2. **The ROLL, not the dial, was making the parallels.** The dial moves the
   rate by about 4 points either way. Blocking the chords moved it by 25.
   The rolled voicing was manufacturing parallel motion as a side effect of
   staggering the voices, and reading that as the genre's medieval character
   was a coincidence being mistaken for a mechanism.

So the shipped build has the chords the user asked for and **almost none of the
open-fifth motion the sources call the genre's identifying feature.** Both
things are true and the second is now an open job: the fifths have to come from
where the sources actually put them — the VOICINGS being open fifths, and the
progressions — rather than as a by-product of how the chord is struck.
Recorded rather than quietly accepted.

### The seam check that guarded it was replaced, not re-tuned

The old check wanted the declaring genre above 15% and passed only on the
inflated reading. At 3.9% of 51 steps — two events — there is no threshold
anyone can honestly draw, and loosening one to fit today's build is the
"check that cannot fail" this project has already shipped twice. It is now an
**A/B**: turn the genre's own dial off, recompose, require the material to
change. **Driven to failure before it was believed** — disconnecting
`parallels` in the cost turns it red ("the dial changes nothing") and
reconnecting it turns it green.

### Still open, from this sheet

- **The voice count.** Sources agree on about 4–6 things sounding at once
  (§1); this genre's fullest section declares seven roles.
- **Hand drum ostinati**, named by melodigging, have no instrument here.
- **The harp / harpsichord**, named by melodigging and Grunewald, has no
  instrument here — and it is where the rolled chord belongs (§0). The user's
  own sample pack has five "Plucked" files and nothing can play them.
- **The pad restrikes every bar** while the harmony moves every two, so the
  most sustained part in the record re-attacks twice as often as the chords
  change. The bass already holds correctly; the pad does not.

---

## Sources — all new, none in `dungeon-synth.md`

- [proboards: chords in dungeon synth](https://dungeonsynth.proboards.com/thread/1491/chords-dungeon-synth) *(the modal shuttles and madrayken's loop)*
- [proboards: dungeon synth music theory](https://dungeonsynth.proboards.com/thread/351/dungeon-synth-music-theory)
- [proboards: song writing & recording](https://dungeonsynth.proboards.com/thread/266/song-writing-recording-discussion-thread) *(the voice counts)*
- [proboards: percussion in dungeon synth](https://dungeonsynth.proboards.com/thread/250/percussion-dungeon-synth)
- [proboards: mixing discussion](https://dungeonsynth.proboards.com/thread/1305/mixing-discussion)
- [proboards: advice on mixing drums](https://dungeonsynth.proboards.com/thread/1224/looking-advice-on-mixing-drums)
- [proboards: mixing, mastering etc](https://dungeonsynth.proboards.com/thread/386/mixing-mastering-etc)
- [proboards: regarding creating dungeon synth](https://dungeonsynth.proboards.com/thread/305/regarding-creating-dungeon-synth)
- [proboards: started dungeon synth musician](https://dungeonsynth.proboards.com/thread/65/started-dungeon-synth-musician)
- [dungeonsynth.neocities.org/howto](https://dungeonsynth.neocities.org/howto)
- [dungeon-synth.neocities.org/subgenres](https://dungeon-synth.neocities.org/subgenres)
- [deathmetal.org — Goatcraft, *Yersinia Pestis*](https://www.deathmetal.org/review/goatcraft-yersinia-pestis-2016/) *(the only articulation description found)*
- [synthdigest.com primers](https://www.synthdigest.com/primers/)
- [stranger-aeons.com — comfy synth](https://www.stranger-aeons.com/comfy-synth-but-is-it-dungeon-synth/)
- [kvraudio — dungeon synth percussion libraries](https://www.kvraudio.com/forum/viewtopic.php?t=400852)
- [Bandcamp Daily — Erang interview](https://daily.bandcamp.com/features/erang-dungeon-synth-interview)
- [The Dungeon in Deep Space — Guild of Lore interview](https://thedungeonindeepspace.com/2024/01/18/eyre-transmissions-xxvii-interview-with-dungeon-synth-maestro-guild-of-lore/)
- [The Dungeon in Deep Space — Arbadax interview](https://thedungeonindeepspace.com/2024/09/30/eyre-transmissions-xxxi-interview-with-fantasy-dungeon-synth-producer-arbadax/)
- [The Dungeon in Deep Space — Wøzard interview](https://thedungeonindeepspace.com/2024/05/25/eyre-transmissions-xxix-the-zany-magnificent-musical-world-of-wozard/)
- Tamura, *Synthetic Medievalisms* (2026) — [researchgate 401526519](https://www.researchgate.net/publication/401526519) *(403; index paraphrase only, marked in text)*
- **REFUSED:** `lyricassistant.com/how-to-write-dungeon-synth-songs/` — see §0

**Blocked and worth another route:** the Tamura paper (403 — likely the single
best harmony source if obtainable), Album of the Year's subgenre taxonomy
(403), RateYourMusic genre pages (403), and two YouTube tutorial playlists whose
transcripts could not be fetched — **that is where the articulation question
would most likely be answered**, and it remains the biggest hole in this sheet.

---

## 8. THE ERANG PACK BECAME AN INSTRUMENT — `2026-08-06d`

The user: *"We should have access to all the instruments in the Errang files
that is a must. The Errang sound pack is literally a dungeon synth sound pack
meant for making dungeon synth music, it is all the instruments one might need
to start."*

All 65 patches now play. The obstacle was arithmetic, not principle: the pack
is stereo 16-bit 44.1 kHz, 535 seconds, **94.4 MB**, against a program that is
one self-contained file. `harness/erang_bank.py` reduces it to **2.54 MB**
(3.39 MB as embedded text, a 37× reduction) — mono, halved to 22.05 kHz,
trimmed to an attack plus a crossfaded loop, IMA ADPCM at 4 bits a sample.
Round-trip **median 34.6 dB SNR**, worst 9.8 dB on a noise bed, which is a
predictive codec meeting unpredictable material.

**Four panels, because the pack measured as four things**, not because four
seemed tidy: every `strings`, `Pad` and `Lead` patch sustains and every `Key`
and `Plucked` patch decays to nothing. That is the held/struck division §0
argued for on entirely separate evidence, arriving from the audio itself —
`erangStrings`, `erangHarp`, `erangLead`, `erangPercussion`.

### ⚠ FIVE PATCHES OF FORTY-FIVE ARE STILL MISTUNED, and it is written down

`harness/probe_erang.js` renders every pitched patch at three notes and reads
the pitch back out of the audio, because **nothing else in this repository
could see this**: the note list is identical whether a sampler is in tune or an
octave out, the seam battery reads notes, the snapshot hashes notes, and
`probe_voices` only asks whether a sound happened.

It reports **7 bad readings across 5 patches** (`erangHarp` 0/6/8,
`erangStrings` 12/18), almost all exactly an octave. The count came down 36 →
21 → 15 → 13 → 7 through four separate defects, each measured rather than
guessed:

1. **Integer lag quantisation.** At 22.05 kHz one sample of lag is 12 cents at
   C4 and 24 at C5, so the root simply could not be expressed. Parabolic
   interpolation of the autocorrelation peak fixed the whole ±80-cent class.
2. **The `_C` prior used as a constraint instead of a check.** Refining within
   ±150 cents of the nearest C means a patch that is *not* a C can never be
   found — `Lead_06` and `Pad_03` both read ~88 Hz, which is an F, and were
   being forced 545 and 1719 cents wrong. Two independent measurements of the
   raw WAVs agreed on 88 and only this code disagreed.
3. **A fixed analysis window 25% into the sample.** Right for a held string,
   wrong for a struck one — a quarter of the way into a decaying `Key` patch
   there is more room tone than note. Reading the loudest second instead took
   13 bad readings to 7 with one rule and no per-family branching.
4. **My own probe had an octave bias too**, in the *opposite* direction to the
   encoder's, so for a while neither could referee the other. Tightened to
   require a genuine local maximum at 92%.

**A spectral octave decision was tried and REFUSED**: scoring harmonic combs
made it worse both times (15 → 21, then → 29), because a comb pitched an octave
low matches every even harmonic of the true root. It is recorded here so the
next person does not spend the same hour on it.

**What is left needs a verdict, not another algorithm.** Five patches, all in the
struck families where pitch tracking is hardest. They are named above, the
probe names them on every run, and choosing a different patch avoids them
entirely. Fixing them by hand-writing five roots would work and would also be
the "derive, never list" rule broken for convenience — so it has not been done.

### Still open after this

- **Atmosphere is embedded but not yet playable.** ~~All ten `sfx` and `Noise`
  beds are in the bank and none has a machine — the program has no role that
  holds one sound for a whole record, which is the shape they need. The
  `tape` role is the nearest existing mechanism.~~ **CLOSED `2026-08-10d`** —
  built on exactly that mechanism: one event on the tape role, the loopable
  eight as per-song beds and the two one-shots as a peak accent.
  `dungeon-synth-fx-and-balance.md` §1, §7.
- **The roll is a genre dial, and the harp wants it on while the strings want
  it off.** Both are in the same genre now, so one of them is wrong on any
  given song. The dial belongs on the MACHINE, not the genre.
