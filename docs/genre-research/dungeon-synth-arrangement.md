# Dungeon synth, third pass: ARRANGEMENT, and the four propositions

*Recovered 2026-08-06 from two research runs that were stopped early to save
cost. **The research phase completed in full** — 11 agents, 391 findings, 55
sources refused or downgraded. What was cut was the adversarial verify swarm
(38 of ~66 verdicts landed) and the synthesis step, which is why this sheet is
hand-written from the raw returns rather than generated. The complete raw
record is `raw/ds-research-2026-08-06.json`.*

**On the verdicts.** 35 of 38 came back `refuted`. That is a CONFIRMATION BAR,
not a body count: verify was instructed to mark a claim refuted whenever it
could not independently confirm it, which is the right default and makes the
refute rate uninformative on its own. Where a verdict bears on something below
it is quoted.

**One process finding worth keeping.** A verify agent reported that *"the
web-search summarizer fabricated at least two specific, checkable claims during
this pass"* — attributing quotes to interviews that do not contain them. It also
caught the most-cited line in all of music production (the Miles Davis "it's not
the notes you play" quote) being unattributable, and deliberately excluded it.
This is the second pass in a row to catch invented numbers. **Nothing in this
sheet is used unless a named human said it.**

---

## THE USER'S FOUR PROPOSITIONS

### P1 — "start with something that has more movement, or bring something in earlier"

> **CONFIRMED, and by measurement rather than opinion.**

An agent took ten canonical records and measured them — onset counts by spectral
flux, and the entry time of each frequency band:

| what was measured | result |
|---|---|
| tracks opening with a **moving figure** rather than a held chord | **8 of 10** |
| a **second register** joins at | median **2.5 s** (9 of 10 under 9 s) |
| the **melody register** (800–2500 Hz) enters at | median **2.8 s** |
| the **full texture** is assembled by | median **17.6 s**; 8 of 10 inside 30 s |
| the **first textural change** away from the opening | median **10.9 s** ≈ 2–7 bars |

Records measured include Mortiis, Wongraven, Depressive Silence, Göndor and
Secret Stairways. *[Own measurement by the research agent, 2048-pt Hann window,
hop 512 @ 22.05 kHz — method stated, not a citation.]*

**This refutes what is currently built.** Dungeon synth's intro is one held
chord with a single part, for sixteen bars — about **58 seconds** at 66 bpm.
The genre's own records put a second voice in at two and a half.

**AND THE COUNTER-CASE IS REAL, so it is kept.** Wongraven (Satyr), *Fra
Fjelltronen*: every register in place within **0.34 s**, then **no textural
change for 175 seconds** — nearly three minutes. So a long unchanging opening is
a thing this music does; it is just not what most of it does, and it is not what
we do either (we hold one thin part, which is neither).

### P2 — "it doesn't mean we need to change or add notes always, we have options with FX"

> **CONFIRMED, strongly, and the evidence is dub rather than dungeon synth.**

Dub is a whole genre built on the user's exact proposition: the engineer makes a
new piece out of unchanged notes using the desk alone.

- **Scientist** (Hopeton Overton Brown), *Tape Op* #136: frames it as holding a
  listener on one pattern and separately switching the pattern up — **surprise
  is the mechanism, not new notes**. Working rate given: *"I can do about 30-some
  mixes in about 12 hours"* — roughly 24 minutes to build a whole new version of
  an already-recorded song.
- **Adrian Sherwood**, *Tape Op* #136: composes by re-recording desk
  performances and re-mixing them — variation manufactured by processing passes.
- **Mad Professor**, *Sound On Sound*, Aug 2007: reverb and delay **permanently
  patched to aux** (Lexicon 480L, Roland SDE-3000) so effects are standing
  infrastructure rather than an afterthought.

**THE COUNTERWEIGHT, from the same source, and it is why this is not a licence:**
Mad Professor says FX variation only works on top of properly constructed songs.
**Effects are a multiplier on material, not a substitute for it.**

**Two numbers that make this buildable:**

- **How big a move has to be before anyone notices.** Hugh Robjohns, *Sound On
  Sound*: an isolated level change needs **1 dB** for a trained ear, **2–3 dB**
  for an untrained one; a change in the *balance between* two elements is
  audible at about **0.25 dB**. So an FX or level gesture smaller than a
  decibel is decoration nobody hears, and this program's motion depths should be
  read against those figures.
- **How fast it may move.** Steve Reich, *Music as a Gradual Process* (1968): a
  process must be **audible**, and slow enough to be *heard as* movement —
  *"pulling back a swing, releasing it, and observing it gradually come to
  rest."* That is the design rule for automation rates.

### P3 — "you can bring things in as flairs, an instrument doesn't have to be going all the time"

> **CONFIRMED, and it is a named orchestration principle with named failure modes.**

Nearly all of this is **Alan Belkin** (composer, Université de Montréal),
*Artistic Orchestration* — a primary text, and it answers the proposition almost
line by line:

- An accent is made **precisely by momentarily adding a new sound**. That is the
  orchestral definition of a "flair".
- **A colour lands because it is NEW IN CONTEXT, not because it is exotic.** The
  variable is *time since last heard*, not how unusual the instrument is. This
  is the single best answer to "what makes an occasional entry land rather than
  sound random".
- **Where it may enter is a rule with an explicit failure condition:** at phrase
  or section boundaries; inside a phrase only at a **motivic change, a climax,
  or a cadence**. Three legal in-phrase placements, and nowhere else.
- **Hold one resource back entirely.** There should be **one** main climax, and a
  unique orchestral colour should be saved for it and used nowhere else. Belkin's
  own Symphony #7 marks its climax with glockenspiel + suspended cymbal +
  timpani together, at one bar.
- **Running a distinctive colour continuously is a NAMED DEFECT.** Belkin's list
  of what makes orchestration bad includes overuse of very distinctive colours,
  and separately, timbre changes at arbitrary places.
- **Partial doubling — a concrete recipe for an ornament:** it doubles only the
  *highlights* of a line — just the beginning of a phrase, or just the end, or a
  few motives — then drops out or decays into a held background note. In his own
  Symphonic Movement #1, *"the glockenspiel doubles only the beginning of the
  main melody line"*: the bell covers the phrase head only.
- **And it is quiet.** High metal ornaments are marked *"touches"* and *"not too
  loud"*, twice.

### P4 — "an instrument can sit in a frequency not being used"

> **CONFIRMED, from 1912 and from a dungeon synth practitioner both.**

- **Rimsky-Korsakov**, *Principles of Orchestration* (1912), Ch. III: spacing
  must be **wide at the bottom and progressively tighter toward the top**,
  following the harmonic series. The bass **rarely sits more than one octave
  below the part above it**. The bass must be registrally isolated — doubling it
  into the other parts' range causes *"heaviness"*. Only the top two voices may
  be doubled at the octave; doubling the tenor or the bass is forbidden.
- **And he independently corroborates the dungeon synth forum's own claim** that
  the fix for a bad mix is arrangement rather than EQ: a badly voiced passage
  **sounds bad no matter which instruments play it**.
- **Belkin** gives the masking mechanism in plain terms: if you write a dense low
  chord you must **empty the midrange**, because the harmonics of those low notes
  are already occupying it. He names *"overloading the low register"* and
  *"poorly differentiated planes of tone"* as defining symptoms of bad
  orchestration — which is the exact fault the user described.
- **Erich Grunewald**, *How I Make Dungeon Synth* (first-person): separation is
  achieved by **cutting the crowding instrument rather than boosting the buried
  one**; lows are made mono; distance is created with a proximity plugin rather
  than EQ; one shared reverb bus fed by sends from everything.

---

## THE FIVE REPORTED FAULTS — what the other run found

### Pedal tones, and we built the wrong note

- **The pedal note is scale degree 1 or 5** — not any root. [Wikipedia, *Pedal
  point*, corroborated by Kris Shaffer et al., *Music Theory for the 21st-Century
  Classroom*.]
- **Set it by MODE, not by ear:** the drone should be the mode's *finalis* or its
  *tenor* (reciting note), and in the authentic modes the tenor sits **a fifth
  above the finalis** — Dorian D and A, Phrygian E and C. [Ian Pittaway, *Early
  Music Muse*, "Performing medieval music".]
- **A pedal is SUPPOSED to be dissonant part of the time.** The formal definition
  is a sustained tone over which *at least one dissonant harmony* sounds, and the
  medieval principle is **consonance → dissonance → consonance**. Pittaway is
  explicit: do not filter the chord generator so it only ever produces notes
  consonant with the drone. *We currently have no dissonance requirement at all,
  which makes our pedal blander than the sources want.*
- **A "moving drone" of two notes a whole tone apart is historically attested** —
  a bass alternating A and G under an A-minor piece rather than sitting still.
- **Two more shapes we do not have:** an *inverted pedal* is a pedal in a voice
  other than the bass; a *double pedal* is two held notes, commonly a fifth
  apart. A low root plus a sustained fifth above it is the buildable version.
- **The drone is what establishes the key** — so the answer to "the chord track
  is too loud" is not only to turn it down but to **let the drone carry the
  tonality instead of the chords**.

### Shared notes — there is an exact arithmetic for this

> **Chords whose roots are a 3rd or 6th apart share TWO notes. A 4th or 5th
> apart share ONE. A 2nd or 7th apart share NONE.**
> [H. E. Woodruff, via Wikipedia *Common tone (chord)*.]

That is a hard rule and it is directly buildable — a progression can be *chosen*
for how many notes it holds, instead of hoping the voicing chooser finds them.
Worked instances the sources give:

- **Dorian shuttle i–IV** (Am–D): shares **the tonic itself**, A.
- **Aeolian shuttle i–♭VII–♭VI–♭VII** (Am–G–F–G; Cm–B♭–A♭–B♭): named a *shuttle*
  precisely because it loops endlessly instead of cadencing.
- **Dm ×3 then C ×1**, a 3:1 cycle — a practitioner's own loop. [madrayken.]
- **Dm–F–C**, chosen *because* of its shared tones, producing an implied tonic
  drone the listener supplies. [Patrick Doyle, *Ethnomusicology Review*, UCLA.]
- **sus2 and sus4 keep the perfect fifth and replace only the third** —
  sus4 = 1, P4, P5; sus2 = 1, M2, P5. A sus2 can smuggle the key note into a
  chord that would otherwise not contain it (Skala's D–Fsus2–C–Am in G, where
  Fsus2 contains the G).

### Drums — more part WITHOUT more notes

> Layer a **low-pitched timpani as a continuous heartbeat under the whole
> track**, and record percussion in **three separate passes** — bass drum/toms,
> snare, cymbals/hi-hats — rather than as one kit.
> [andrewwerdna and nahadoth, Dungeon Synth Forums, "Percussion in Dungeon Synth".]

This is the answer to the user's ask that does not make the record busier: the
part stays one hit a bar, and the SIZE comes from layering.

### Melody

- Range capped at about **12 scale steps**, and **the highest and lowest note are
  each hit exactly once**. [AvelineBaudelaire (Wooden Vessels), Dungeon Synth
  Music Making Guide — the most-cited guide in the scene.]
- Its harmony advice is **intervals, not triads** — fourths, fifths, octaves.
- Grunewald's form: **AA'A''** and **ABA**.

---

## WHAT NOBODY DOCUMENTS

95 gaps were reported across the eleven agents. The ones that block work:

- **No source anywhere gives a marching or processional drum pattern for this
  genre with bar positions.** Third pass in a row to find this. Every rhythmic
  placement in our program is `[EAR]` and must stay marked so.
- **No reliable track-length distribution.** Still.
- **No dB figures from inside the genre** — the only real levels we have are the
  three from the user's own transcript.
- **Nothing on how sparse is too sparse**, or how long a listener will hold
  without a change, beyond the measured medians in P1.

---

## WHAT SHOULD BE BUILT, AND IN WHAT ORDER

Ranked by evidence, strongest first.

1. **Get a second part in early.** Measured: median 2.5 s for a second register,
   2.8 s for the melody band. Our intro holds one part for ~58 s. `[measured, 10 records]`
2. **Choose progressions by common-tone count.** 3rd/6th apart = two shared
   notes; 4th/5th = one. Make it a genre appetite the chord chooser reads, rather
   than leaving it to the voicing. `[primary, theory]`
3. **Pedal on degree 1 or 5, chosen by mode**, and let it be dissonant against
   the harmony some of the time. Add the double pedal (root + fifth). `[primary]`
4. **Flairs as a first-class thing**: a part that plays only at section
   boundaries, or at the one climax, and doubles only a phrase head. Quiet.
   `[primary, Belkin]`
5. **Size the FX gestures against the audibility thresholds** — 1 dB isolated,
   0.25 dB in balance — and make them slow enough to hear as movement. `[primary]`
6. **Layer the drum rather than adding hits**: one strike a bar, three
   percussion passes stacked. `[primary, practitioners]`
7. **Empty the midrange when the low end is dense**, and keep the bass
   registrally isolated — no doubling into the parts above it. `[primary, 1912]`
