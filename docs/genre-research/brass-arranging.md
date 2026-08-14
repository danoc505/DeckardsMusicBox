# Brass — how a section is arranged, and the recorded source it is built from — 2026-08-15

*Task #19 ("Build the brass, and make a DS tutti actually orchestral") and the
owner's instruction of 2026-08-14: "Brass. Make sure to do research about how to
arrange brass. Make sure to look online for free brass open source that we can
use." This sheet is both halves: the arranging rules, sourced, and the search
for legally usable recorded brass, resolved. The standing rule from BACKLOG
§0a.7 governs everything here: **no brass is to be invented from a description**
— `V.horns` and the carnyx are synthesised; a section is not.*

*Brass doctrine that score-craft.md already carries is CITED here, not
re-quoted: the balance ratios (§its "1 Trumpet = 1 Trombone = 1 Tuba = 2
Horns"), muted-brass doctrine, the re-entry-after-rest rule, the
hole-in-the-middle-of-a-tutti rule, the brightest-brass-held-to-the-final-15%
rule, the trombone legato failure, and the double-tonguing list. This sheet adds
what that one does not have: the section as a WRITING problem, and the source
recordings.*

---

## 0. The answer first

1. **The source is VSCO-2 Community Edition** (Versilian Studios Chamber
   Orchestra 2 CE), on GitHub at `sgossner/VSCO-2-CE`, licence **CC0-1.0** —
   the same public-domain-equivalent grant as the Weresax, the cleanest licence
   this project recognises. It contains a complete brass quartet family,
   recorded per note with the pitch in the filename:

   | instrument | articulations | files used |
   |---|---|---|
   | F Horn | sustain, **mute**, staccato | 29 sus + 17 mute |
   | Trumpet | sustain, sustain-vibrato, **harmon mute**, **straight mute**, staccato | 20 sus + 16 + 16 |
   | Tenor Trombone | sustain, vibrato, staccato | 31 sus + 12 vib |
   | Tuba | sustain, staccato | 23 sus |

   Dynamic layers ride in the names as `v1/v2/v3` and round robins as `rr`.
   Every claimed pitch passes through the analyzer's 60-cent verification gate
   before it is believed — the Weresax rule (files named an octave off were
   caught by measurement, not by trust).

2. **University of Iowa MIS remains a verified fallback** — Horn, Bb Trumpet,
   Tenor + Bass Trombone, Tuba at pp/mf/ff, per-pitch pages since 2012, terms:
   *"Since 1997, these recordings have been freely available on this website and
   may be downloaded and used for any projects, without restrictions."* Not used
   in this build because VSCO covers the quartet with mutes under CC0 and one
   provenance line is stronger than two; recorded here so the next search does
   not start from zero. [corpus:uiowa-mis]

3. **The encoding path is the sax's, not the Erang pack's.** The
   dungeon-synth sheet's §6 named `erang_bank.py` (embedded PCM) as the path;
   since it was written, the sax shipped the better one for a *pitched wind*:
   `corpus/analyze_sax.py` reduces real recordings to per-pitch, per-dynamic
   harmonic tables (24 amps + rms + noise share + attack seconds) and the voice
   resynthesises on phase-locked oscillators, so a crescendo MORPHS between
   recorded dynamics — which is the one thing brass most needs (see §4). ~150
   KB of tables instead of megabytes of PCM, in an 8.5 MB file. The mute is not
   a filter guess either: VSCO's muted notes are recordings, so the mute
   becomes a measured spectrum set of its own.

---

## 1. The instruments, sounding pitch, and where each one speaks

Sounding (concert) ranges — the program thinks in concert MIDI, so transposition
is noted only as provenance:

- **Horn in F** — sounds a P5 below written. Sounding range: *"F immediately
  below the bass clef to F at the top of the treble clef"* — **F2 to F5**
  (MIDI 41–77), extremes beyond for good players. *"Played softly, the French
  horn has a smooth, mellow tone. Played loudly it can generate a brilliant and
  open sound."* The most-used brass voice in orchestral writing.
  [corpus:wagner-tuba.com, wikipedia/French_horn]
- **Trumpet in Bb** — sounds a M2 below written. Sounding ≈ **E3 to Bb5**
  (MIDI 52–82). *"It's best to steer clear of anything below middle C for
  trumpets unless you're specifically after dark and muddy sound."*
  [corpus:intmus, supremetracks]
- **Tenor trombone** — concert pitch, no transposition. **E2 to Bb4**
  (MIDI 40–70); *"the register from F3 to Bb4 is the showcase register for the
  tenor trombone, where its power, singing tone, and brilliant range of dynamic
  and articulation nuances can be best displayed."*
  [corpus:timbreandorchestration.org]
- **Tuba** — concert pitch. **F1 to Bb4** on paper; practical writing lives
  F1–F4 (MIDI 29–65). *"It has a rich warm sound and is quite versatile
  dynamically and surprisingly agile. It blends well with all other
  instruments."* [corpus:wikipedia/Tuba via search, tedslist]

The four together cover MIDI 29–82 — wider than any single family in the file,
which is why a section reads as big (score-craft: span, not middle mass).

## 2. The section as a harmonic unit — the voicing rules

- **Each subgroup is written as a complete harmonic unit, then the units are
  combined.** *"A common, idiomatic way of writing for brass is to have each
  subgroup (e.g. trombones, horns, trumpets) form a complete harmonic unit,
  which can then be freely combined."* [corpus:vi-control]
- **Where chords sit**, from a working orchestrator [corpus:evenant]:
  - horn chords: **F3 to A4 sounding** — *"Writing chords too low will make
    them sound hollow"*, *"too high... thin and weak"*, and *"the higher you go
    into the horns register, the harder it gets... to play soft, and the lower
    you go, the harder it is... to play loud."*
  - trombone chords: **C3 to E4**. *"Trombones up until and on a mf dynamic
    level blend perfectly with the rest of the orchestra – trombones playing f
    or above get a very rich upper harmonic brassy sound, that sticks out"* —
    which is a tool, not only a warning: the DS tutti's arrival WANTS the
    stick-out. Convention: *"the trombones are written one dynamic level lower
    than the other instruments."*
  - trumpets: *"Having the whole harmony be held by the trumpets is very
    uncommon, since the horns and the trombones do a much better job."* The
    trumpet is the TOP, not the block.
- **Three ways to combine the units** [corpus:evenant]: (1) unison doubling —
  the groups share the same three tones; (2) registral stacking — *"put each
  instrument group in their own respected and 'best' sounding register"* with
  *"larger intervals on the bottom and higher intervals on the top"* — the
  overtone-series spacing rule, the default here; (3) interlocking — *"somewhat
  of a blended sound, but it might not produce the best results."*
- **Standard blocks**: *"Trombones are usually used in 3-part harmony, and
  often combined with the horns"*; *"combine them with the tuba in either
  4-part harmony, or bass trombone doubled with tuba."*
  [corpus:soundtrack.academy]
- **No built-in octaves inside a chord voicing** — *"these become horribly
  muddy when you build up chords."* Octave DOUBLING of a whole unit is a
  different thing and standard. [corpus:soundonsound Top Brass]
- The stack order rule score-craft §5 already states holds inside the section:
  sorted by centre frequency — tuba, trombone, horn, trumpet, never a dark
  patch above a bright one.

## 3. Dynamics and balance — the numbers already in the house

score-craft.md carries the measured doctrine, all of it live for this build:
Rimsky's loudness table (**1 trumpet = 1 trombone = 1 tuba = 2 horns = 4
woodwind** in forte); crescendo added in the order strings → wind → brass and
withdrawn in reverse; *"the brightest brass held to the final 15%"* (the Boléro
measurement — trumpets at bar 53 of 62); the re-entry-after-long-rest rule; the
legal hole-in-the-middle when brass fills it. New here, from this pass:

- The trombone f/mf blend line above — the section's loudness is also a
  TIMBRE line, which is exactly what dynamic-layer morphing renders and a
  volume knob cannot.
- **Cuivré is real and lives in the ff layer**: the brassy blaze at forte is
  upper harmonics appearing, not level. That is why the bank must carry the
  soft AND loud recordings of the same pitch — the crescendo's endpoints are
  different spectra of the same pipe. (Same argument as the sax's centroid
  1.90→2.61 measurement; the brass analyzer must report its own numbers.)

## 4. Endurance, breath, and articulation

- *"Playing a brass instrument is physically very tiring, and plenty of rests
  are a good idea; when a brass player's lip goes, the first thing to suffer is
  the range, and high notes may crack."* [corpus:tamingthesaxophone/brass] —
  arranged brass RESTS; a pad that holds for a whole section is an organ, not a
  section. `form.rest` on the brass lane is a feature, not a defect.
- Trumpets/horns take fast linear figures better than trombones/tubas:
  *"Trombones and tubas have a harder time negotiating them due to the nature
  of their instruments."* [corpus:supremetracks]
- The trombone has *"in general no true legato"* (score-craft §, Forsyth) and
  double-tonguing belongs to *"flute, piccolo, trumpet, cornet only"*
  (score-craft) — so the trombone/tuba lines here are tongued, and only
  horn/trumpet get the slurred figure.
- A brass note ends fast: *"a real brass sound ends very rapidly once you stop
  blowing"* [corpus:soundonsound Synth Secrets 25, already quoted at V.horns].

## 5. The mutes — measured filter facts, and recordings instead of filters

From wikipedia/Mute_(music), with the numbers that make them checkable:

- **Straight mute** — *"acts as a high-pass filter"*, passing *"frequencies
  above about 1800 Hz, producing a shrill, piercing sound that can be
  penetrating at high volumes"*; the most common classical brass mute; can be
  played *"at a true forte."*
- **Harmon (wah-wah) mute**, stem out — *"a band-pass filter permitting
  frequencies between 1500 and 2000 Hz, making a subdued, distant sound"* —
  the Miles Davis sound, jazz territory.
- **Cup mute** — band-pass ~800–1200 Hz, *"more subdued and darker... than the
  straight mute."* (VSCO has no cup; not built, listed in §8.)
- **Stopped horn** — hand fully in the bell: *"a quiet and nasal sound"*, pitch
  compensated a semitone. Rimsky's doctrine on muted brass is already in
  score-craft.

Because VSCO records the horn mute and the trumpet's straight and harmon mutes
per pitch, **the mutes here are measured spectra, not the filter numbers
above** — the Hz figures become the verification that the measured tables are
sane (the straight-mute spectra should show the >1800 Hz tilt), not the
synthesis itself.

## 6. What the dungeon synth tutti asks of the section

From dungeon-synth-score-and-drums.md: heroism is *"strong brass and soaring
strings"* [taketones]; §6 names brass the missing voice, and the citadel rig has
been advertising *"brass in the second chair"* while `V.horns` (a Minimoog-patch
saw rank) sits in it. The tutti write-up per score-craft §10 (Belkin: three of
four families) plus the rules above gives the concrete DS picture:

- **The block**: tuba on the bass note (or doubling it an octave below the
  trombones, the soundtrack.academy pairing), trombones as the 3-part mid-low
  unit C3–E4, horns as the mid-high unit F3–A4 — overtone spacing, wide at the
  bottom.
- **The top is held back**: the trumpet enters late (the final-15% rule) or on
  the horn-call topic ({1,3,5} triadic shapes, lotr-themes-measured) — not as a
  fourth chord member from bar 1.
- **The swell is a timbre event**: the block enters mf (blend), arrives f/ff
  (the trombone stick-out + cuivré), which the dynamic-layer morph renders for
  free because the endpoints are recordings.
- **It rests** (§4): the brass lane keeps a real sit-out rate; the arrival is
  loud partly because the section was recently absent (re-entry rule).

## 7. Mapping to this program's mechanisms

- `corpus/analyze_brass.py` (new, sibling of analyze_sax.py): reads the VSCO
  per-note WAVs, name→pitch, 60-cent gate, emits `BRASS_WT[member][dyn][midi]`
  with the sax's exact fields (h/rms/noise/atk). Members: `horn`, `trumpet`,
  `trombone`, `tuba`; mute sets as separate members (`hornMute`,
  `trumpetStraight`, `trumpetHarmon`). VSCO's v-layers map to the dyn axis;
  where only two layers exist the middle is the per-pitch mean, marked derived
  (the Weresax precedent).
- `V.brass`: the sax's phrase machinery (phase-locked layer morph, measured
  attacks, breath arc, messa di voce) with brass discipline from §4: tongued
  re-articulation default, slur only on horn/trumpet members, fast release, the
  soft-note = darker-spectrum pull, and NO scoop/growl/subtone (those are reed
  moves).
- **The member is the register** (§2's stack order): a `member` control set to
  AUTO deals each note to tuba/trombone/horn/trumpet by its concert pitch, so
  one lane carrying a chord renders it as a section stacked in the doctrinal
  order; forcing the control gives a solo horn call or a trombone unit.
- The citadel rig's second chair (`counter: "horns"`) is where the section
  lands for DS.
- Ranges (§1) are declared per member the way the sax declares [49, 81] — an
  input to stage 3, not a clamp in stage 6.

## 8. Looked for, not available / deliberately not built

- **Cup mute** — not in VSCO CE; the 800–1200 Hz band-pass description stays
  here for a future recorded source. Not synthesised (the §0 rule).
- **Rips, falls, shakes** — VSCO's OldTrombone has falls, but it is a separate
  1950s instrument recorded as a test set; mixing its character into the
  quartet muddies provenance for one gesture. Recorded as available if wanted.
- **Bass trombone** — Iowa has it; VSCO CE does not. The tuba covers the
  register; the doubling pairing (§2) still works.
- **Flutter tongue, pedal tones, glissando** — no recorded source in either
  library; the trombone slide gliss in particular is famous and stays unbuilt
  rather than faked.
- §12's accelerando limitation (motion.spb is one scalar per record) is
  unchanged by this build and stays stated.

Sources: [VSCO-2-CE on GitHub](https://github.com/sgossner/VSCO-2-CE) ·
[Versilian VSCO-2 CE](https://versilian-studios.com/vsco-community/) ·
[Iowa MIS](https://theremin.music.uiowa.edu/mis.html) ·
[Evenant: Effective Ways to Orchestrate Brass](https://evenant.com/effective-ways-to-orchestrate-brass/) ·
[Wagner-tuba.com horn range](https://www.wagner-tuba.com/brass-section-overview/french-horn-introduction/french-horn-range/) ·
[Timbre & Orchestration Resource: trombone](https://timbreandorchestration.org/isfee/extreme-orchestration/brass/trombone) ·
[SoundOnSound Top Brass](https://www.soundonsound.com/techniques/top-brass-part-1) ·
[Supreme Tracks horn arranging](https://www.supremetracks.com/how-to-arrange-horns/) ·
[soundtrack.academy brass](https://soundtrack.academy/brass-instruments/) ·
[VI-Control: Orchestrating Trombones and Horns](https://vi-control.net/community/threads/orchestrating-trombones-and-horns.115185/) ·
[Wikipedia: Mute (music)](https://en.wikipedia.org/wiki/Mute_(music)) ·
[Taming the Saxophone: brass](https://tamingthesaxophone.com/theory/arranging/composition-brass) ·
[intmus transpositions](https://intmus.github.io/inttheory19-20/12-reading-scores/a1-insttransandrange.html)
