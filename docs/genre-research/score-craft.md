# SCORE CRAFT — how an orchestra is written, and what of it this program can do

*2026-08-11. The synthesis step that three killed workflows never reached.*

The owner: *"I think you should do a quick research on how to program scores and
orchestra"* … *"were you able to read LOTR scores or not? Did you do more research
like i asked you to do?"* … *"am I to gather you told me that you were able to
save the research data from before and then you never bothered to read it?"*

**That last one was the finding.** The research WAS saved — 3037 lines of it, in
`raw/epic-orchestral-scale.md`, `raw/lotr-score-study.md` and
`raw/overworld-and-materials.md`. I wrote the salvage script, committed the
files, and then built a genre without opening them. This sheet is what was in
them, read end to end.

---

## §0 HOW THIS WAS MADE, AND HOW MUCH TO TRUST IT

Ten readers over the three files, one per block, extracting every finding with a
verbatim quote. **422 findings.** Then a verification pass over the 163
load-bearing ones — DOCTRINE or NOTATION with something encodable in them —
whose only job was to find extractions that read plausibly and are not in the
text. **131 came back CONFIRMED. 14 came back OVERSTATED.** Then a completeness
critic that read all three files again and listed what the readers had missed.

The 14 overstatements are the most useful output of the whole exercise and they
are kept below, in place, marked. **Two of them were already in the previous
draft of this sheet and are now corrected** — see §8 and §10.

Four kinds of statement appear here and they are not interchangeable:

- **[NOTATION]** — pitches somebody read off a staff or a MusicXML file.
- **[DOCTRINE]** — a rule from a public-domain treatise, quoted verbatim.
- **[MEASURED]** — a number somebody counted.
- **[PROSE]** — an analyst asserting something with no staff attached. Weakest.

---

# PART ONE — THE DOCTRINE

## §1 THE CENTRAL LAW: FOUR REAL PARTS AND A PILE OF DOUBLINGS

**[DOCTRINE]** Rimsky-Korsakov, *Principles of Orchestration*, Gutenberg #33900,
Ch. III:

> *"In the very large majority of cases harmony is written in four parts; this
> applies not only to single chords or a succession of them, but also to the
> formation of the harmonic basis. Harmony which at first sight appears to
> comprise 5, 6, 7 and 8 parts, is usually only four part harmony with extra
> parts added. These additions are nothing more than the duplication in the
> adjacent upper octave of one or more of the three upper parts forming the
> original harmony, the bass being doubled in the lower octave only."*

This is the highest-value finding in the corpus, because **"orchestral" is not a
composition problem.** The program already composes four real parts. Everything
above four is generated. A seven-part texture is four composed plus three
doublings; a twenty-voice texture is four composed plus sixteen. No new
composition logic is required to read as eight parts.

### The permission table

> *"In widely-spaced harmony only the soprano and alto parts may be doubled in
> octaves. Duplicating the tenor part is to be avoided, as close writing is
> thereby produced, and doubling the bass part creates an effect of heaviness.
> The bass part should never mix with the others."*

| voice | +12 | −12 | note |
|---|---|---|---|
| soprano (`lead`) | yes | no | |
| alto (`keys`, `keys2`, `ostinato`) | yes | no | |
| tenor (`counter`) | **no** | no | *"to be avoided"* — it collapses the spacing |
| bass | no | yes | *"the lower octave only"* |

Gate on voicing mode: `openVoicing ? {S,A} : {S,A,T}`.

> **VERIFIER'S CAVEAT, carried:** *"bass must not be doubled upward" is stronger
> than the quote alone supports — the quote only says doubling the bass "creates
> an effect of heaviness", a discouragement. The upward prohibition rests on §1's
> "the bass being doubled in the lower octave only". Read together the two carry
> it; it is not derivable from the second quote alone.*

**This table is already implemented** as `STACK_OK` (line 28903). What is not
implemented is anything that uses it without a hand on a button.

### Three voice-leading rules for a doubler

> *"Consecutive octaves between the upper parts are not permissible."*
> *"Consecutive fifths resulting from the duplication of the three upper parts
> moving in chords of sixths are of no importance."*
> *"The bass of an inversion of the dominant chord should never be doubled in any
> of the upper parts."*
> *"Notes in unison resulting from correct duplication need not be avoided, for
> although the tone in such cases is not absolutely uniform, the ear will be
> satisfied with the correct progression of parts."*

Two prohibitions and two permissions. **`probe_theory`'s 5% parallel-perfects
ceiling would fail correct writing** the day an auto-doubler ships, because
fifths arising *from a doubling* are explicitly legal and unisons from doubling
must not be de-duplicated.

---

## §2 UNISON OR OCTAVE — AND THE CORPUS CONTRADICTS ITSELF

This is the sharpest live disagreement in the whole corpus and **nothing in it
adjudicates.** Both sides are quoted verbatim.

**Berlioz says unison, and gives an exemplar:**

> *"It frequently happens that, in order to give a passage greater energy, the
> first violins are doubled by the second violins an octave lower; but, if the
> passage do not lie excessively high, it is better to double them in unison. The
> effect is thus incomparably finer and more forcible. The overwhelming effect of
> the peroration of the first movement in Beethoven's minor Symphony is
> attributable to the unison of the violins."*

And on the octave-below as actively harmful:

> *"this weak lower doubling, on account of the disproportionate upper part,
> produces a futile murmuring, by which the vibration of the high violin notes is
> rather obscured than assisted. It is preferable, if the viola part cannot be
> made prominent, to employ it in augmenting the sound of the violoncellos."*

**Belkin says octave, and calls unison the beginner's error:**

> *"As a rule, doubling at the unison adds much more volume ('thickness') than
> force. … Since overuse of unison doubling is the beginner's most common fault
> in orchestration, a good elementary rule of thumb is: Do not double at the
> unison, unless there is a definite need for more volume, or unless the
> particular color is exactly what is needed for character."*
> *"Doubling at the octave creates greater transparency of color, and also fills
> the musical space in more interesting and varied ways."*

**The reconciliation the corpus does not state, but which both texts support:**
they are answering different questions. Belkin (via Koechlin) separates
**loudness** from **volume/thickness** — unison buys thickness, octave buys
transparency. Berlioz's case is specifically a melody NOT in the extreme high
register, where the octave-below partner is *weaker* than the top voice. So the
rule that survives both is conditional:

- melody high → octave doubling
- melody mid or low, and the partner voice is weaker/darker → **unison**
- an octave-below doubling by a *weak dark* voice under a *strong bright* one is
  worse than nothing; give that voice to the bass at unison instead

### And this program cannot express the doubling Berlioz reaches for first

**MEASURED, 2026-08-11, hobbitsynth seed 1.** `picks.stack = [{of:"lead",
semis:0}]` produces 270 stacked notes at pitches 87 / 88 / 90 / 92 over a parent
of 75 / 76 / 78 / 80 — **byte-identical to `semis: 12`**, and `stackRefused` is
empty. The cause is one line at 28918:

```js
const semis = s.semis || 12;      // a zero is not a zero
```

So a unison request is silently converted into the octave, and there is no
permission column for the unison in `STACK_OK` — `semis === 0` satisfies neither
`semis > 0` nor `semis < 0` and falls through both gates. **The recommended
doubling cannot be asked for, and asking for it delivers the one Berlioz warns
against.**

---

## §3 THE LOUDNESS TABLE, AND WHY THE MIX IS WRONG

**[DOCTRINE]** Rimsky-Korsakov, Ch. I, exactly:

> *"In the most resonant group, the brass, the strongest instruments are the
> trumpets, trombones and tuba. In loud passages the horns are only one-half as
> strong, 1 Trumpet = 1 Trombone = 1 Tuba = 2 Horns. Wood-wind instruments, in
> forte passages, are twice as weak as the horns, 1 Horn = 2 Clarinets = 2 Oboes
> = 2 Flutes = 2 Bassoons; but, in piano passages, all wind-instruments, wood or
> brass are of fairly equal balance."*

| at forte | weight |
|---|---|
| trumpet / trombone / tuba | 1.0 |
| horn | 0.5 |
| flute / oboe / clarinet / bassoon | 0.25 |
| **at piano** | **all equal** |

To balance one trumpet you need two horns or four woodwinds. A single flute-type
patch against a brass patch is not a duet — it is a brass solo with a decoration.
**That is the arithmetic behind *"we have bad levels and not using frequences
well"*.**

> **A CONTRADICTION THE CORPUS NEVER RESOLVES**, found by the critic. The string
> rule is quoted as *"in piano passages, the whole of one department … is
> equivalent in strength to one wind instrument … and, in forte passages, to two
> wind instruments."* With woodwind at 0.25 that makes a string department 0.25
> at p and 0.5 at f — but the same block's consolidated step-list states *"one
> full string department = 0.5 at p, 1.0 at f."* **The two numbers differ by 2×
> and nothing reconciles them.** Do not encode either as fact; encode the RATIO
> (strings double their relative weight from p to f) which both agree on.

### The mechanism already exists at the call site

The one gain formula, line 28597:

```js
const arcE = form.arc ? form.arc[Math.min(form.arc.length - 1, bar)] : sec.energy;
const gain = Math.min(1.25, n.vel * accent * (0.72 + 0.28 * arcE) * (RGAIN[role] || 1));
```

`arcE` — the per-bar dynamic — **is already in scope where `RGAIN[role]` is
read.** So the collapse-toward-equality at piano is expressible today without a
new plumbing route: `RGAIN[role]` becomes a function of `arcE` that interpolates
between the forte ratios and 1.0. What is missing is not the wiring. It is that
`roleGain` is declared as one fixed number per role, which cannot say a ratio
that changes with dynamic.

### And the percussion cap has a count in it

> *"It must not be forgotten that the bass drum, cymbals, gong and a tremolo on
> the side drum, played fortissimo, is sufficient to overpower any orchestral
> tutti."*

**Four percussion voices at full level dominate everything else combined.** Read
against this program's `roleGain` — drums 1.4 against lead 0.57 in dungeon synth
— the escalation is inaudible exactly at its peak. It is also the cheapest way to
make a small ensemble sound enormous, which is the same fact pointed the other
way.

---

## §4 SPACING — AND WHY IT DOES NOT BELONG IN THE GENRE TABLE

**[DOCTRINE]**

> *"As a general rule a chord of greatly extended range and in several parts is
> distributed according to the order of the natural scale, with wide intervals
> (octaves and sixths), in the bass part, lesser intervals (fifths and fourths)
> in the middle, and close intervals (3rds or 2nds) in the upper register."*

| zone | adjacent-voice interval, semitones |
|---|---|
| bottom | 12 or 9 |
| middle | 7 or 5 |
| top | 4, 3 or 2 |

> *"The bass should rarely lie at a greater distance than an octave from the part
> directly above it (tenor harmony)."*

And the loudness gate on gaps: empty middles are forbidden at forte, tolerable at
piano.

**WHERE THIS DOES NOT GO.** I was about to write these into `registers:` in the
genre tables, and it would have been dead config — the same fault as the ladder's
unreachable bottom rung. The program's register bands **overlap by design**;
`allocKeysBand` (26850) says so in as many words: *"THE BANDS IN THIS PROGRAM
ALREADY OVERLAP, by design: lofi's comp is [52,74] and its verse tune is [64,80]
… Disjoint registers are not how parts are kept off each other here — the `avoid`
SET is, note by note."* Rimsky-Korsakov's budget is about **adjacent voices in a
sounding chord**, not about a part's permitted range. It belongs in `buildKeys`
(24998) at voicing time, or as a probe over sounding events. Not in a table.

### Timbre counts, which invert between close and open

> *"The use of four different timbres in close four-part harmony is to be
> avoided, as the respective registers will not correspond."*
> *"It is possible to lend four distinct timbres to a chord in widely-divided
> four-part harmony…"*
> *"In chords of four-part harmony, three instruments of the same timbre should
> be combined with a fourth instrument of another."*
> *"If one tone quality is to be enclosed, it must be between two different
> timbres."*

Close voicing → at most 2 distinct patches, canonical form 3×A + 1×B. Open
voicing → up to 4. And a patch sandwiched between two voices must not have the
same patch on both sides of it.

### Register extremes are cheap — the highest-leverage fact for a 7-part program

**[DOCTRINE]** Belkin:

> *"It is important to note that the number of instruments required at the
> extremes is considerably smaller than in the middle. For example, even in a big
> tutti, one piccolo will penetrate without difficulty in its highest register."*

**Perceived orchestra size comes from SPAN, not from middle mass.** Spend one
voice on the top octave and one or two on the bottom, and the remaining five in
the middle read as an orchestra. For a program with seven parts this is worth
more than any other single item in this sheet.

---

## §5 STACKING A MELODY — THE ORDER IS FIXED AND THE SETS ARE ENUMERATED

**[DOCTRINE]**

> *"Deviation from the natural order, such as placing the bassoon above the
> clarinet or oboe, the clarinet above the oboe or flute etc., creates an
> unnatural resonance occasioned by the confusion of registers, the instrument of
> lower compass playing in its high register and vice versa."*

Sort patches by natural centre frequency; highest-centred on top, descending.
Never a dark patch above a bright one.

**The legal stacks are enumerated, not merely ordered** — the critic caught this
missing. In three octaves: *"Fl./Ob./Cl., or Ob./Cl./Fag., or Fl./Cl./Fag., or
Fl./Ob./Fag."* In four: *"Fl./Ob./Cl./Fag."* Five octaves are *"extremely rare"*
and must include the strings.

And the octaves are **not equally weighted**: the *Spanish Capriccio* stack is
`Picc. / 2 Fl. / 2 Ob. + Cl. / Fag.` — four octaves, with the middle two carrying
two voices each.

### Divisi: split within, never across

**[DOCTRINE]** Berlioz:

> *"it will be always better … to divide the first violins into two sets, and the
> second violins also, causing these latter to double the two parts of the first
> violins, than to allow all the first violins to play one portion, and all the
> second violins another; for the distance of the two points of departure of the
> sounds will break the unity of the passage, rendering the join too apparent."*

And he generalises it beyond strings: *"this mode of procedure is applicable to
all the parts of the orchestra which possess in themselves analogies of quality
of tone or lightness."*

**The rule for this program:** a doubling meant to be heard as ONE thicker
instrument must share pan and patch. A doubling meant to be heard as TWO
instruments must differ in at least one of pan, patch or register.

### One doubling that is worthless — with its escape clause

**[DOCTRINE]** Strauss, annotating Berlioz, via Forsyth:

> *"In big tuttis one often finds important bass themes allotted to the trio of
> Trombones, reinforced also by Bassoons, Cellos, and Double-Basses. Such
> 'doubling' is perfectly useless. … one should rather let them rest during the
> marcatos of the Trombones unless one has the specific intention of softening
> the brilliance of these latter instruments."*

A tutti is not "everyone plays the bass line." The critic flagged that the
*unless* clause was being dropped: softening the brass IS a legitimate reason.

---

## §6 WHICH TIMBRES FUSE — **CORRECTED**

> ### ⚠ THE PREVIOUS DRAFT OF THIS SHEET WAS WRONG HERE
>
> It said: *"A two-element string+brass doubling **will not fuse**."* The
> verifier: *"The corpus says strings+brass 'can never yield SUCH A PERFECT blend
> AS that produced by the union of strings and wood-wind' — a comparative
> ranking, not a prohibition. … 'Never blends well' contradicts the very evidence
> quoted alongside it, which lists three string+brass pairings as the
> combinations 'with the greatest amount of success'. A program built on this
> claim would forbid pairings Rimsky-Korsakov recommends."*

The supportable form: **strings + brass blend less completely than strings +
wood-wind, and the wood-wind member fuses them.** The named successful pairings,
by register:

| tier | pairing |
|---|---|
| high | violin + oboe + trumpet |
| mid | viola / cello + clarinet + horn |
| low | cello / double-bass + trombone / tuba |

Double within a tier.

---

## §7 THE MELODY AND THE HARMONY MUST DIFFER IN COLOUR — **CORRECTED**

> ### ⚠ THE PREVIOUS DRAFT OVERSTATED THIS TOO
>
> It said the harmony **must** sit an octave from the melody. The verifier: *"the
> text reads 'in these two groups [wood-wind and brass], THEREFORE, the harmonic
> basis GENERALLY REMAINS an octave removed' — a scoped observation about wind
> and brass, which the claim promotes to a universal 'must'."*

What IS prescriptive, verbatim:

> *"the harmonic basis should differ from the melody not only in fullness and
> intensity of tone, but also in colour. If the fanfare figure is allotted to the
> brass (trumpets or horns) the harmony should be given to the wood-wind; if the
> phrase is given to the wood-wind (oboes and clarinets) the harmony should be
> entrusted to the horns."*

> *"The greater the dissimilarity in timbre between the harmonic basis on the one
> hand and the melodic design on the other, the less discordant the notes
> extraneous to the harmony will sound."*

So: **the harmony must differ from the melody in colour and be quieter** (both
"should"); it is *generally* an octave away, within wind and brass (an
observation, not a rule). And the timbre gap is what absorbs non-chord tones —
which means a program with a wide timbre gap can afford *more* dissonance in the
tune, not less.

**This program has no seam for it.** Its only `family` (line 2043) is the Erang
sample-bank family (`BARD_FLUTE`, `BARD_WIND`), not an orchestral one. **No voice
in the program knows whether it is a wind or a brass**, so "melody family ≠
harmony family" is not currently a question that can be asked, let alone
enforced.

### And why a plucked patch on chords is not automatically wrong

A plucked patch is a decay envelope: it can hold a chord only by re-striking it.
Which is exactly what the LOTR piano arrangements do — **[NOTATION]** *"THE LEFT
HAND GIVES YOU CHORDS DIRECTLY as broken arpeggios: m13 `D3 A3 D4 A3 F#4 A3 D4
A3` (=D), m14 `A2 E3 A3 E3 C#4 E3 A3 E3` (=A), m15 `B2 F#3 B3 F#3 D4 F#3 B3 F#3`
(=Bm)."* So `bardPluck` on `keys` is wrong only because `keys` writes sustained
block chords. Give the plucked patch a broken figure and it is correct.

---

## §8 THE CRESCENDO — ENTRY ORDER, TWO SLOPES, AND THE MECHANISM

**[DOCTRINE]** The order, verbatim:

> *"Prolonged orchestral crescendi are obtained by the gradual addition of other
> instruments in the following order: strings, wood-wind, brass. Diminuendo
> effects are accomplished by the elimination of the instruments in the reverse
> order (brass, wood-wind, strings)."*

Implemented 2026-08-11 as the ladder's stagger. Measured: 81% → 23% lockstep.

**Short and long crescendi are governed differently** — the critic caught this
one missing:

> *"Short crescendi and diminuendi are generally produced by natural dynamic
> means; when prolonged, they are obtained by this method combined with other
> orchestral devices."*

A build shorter than roughly eight bars should only move gain. Anything longer
must add voices.

### Two groups, two slopes

> *"While the first group effects the crescendo gradually, the second group
> enters piano or pianissimo, and attains its crescendo more rapidly. The whole
> process is thereby rendered more tense as the timbre changes."*

Two automation ramps, not one, finishing together. **The crossing of the curves
is the perceived growth**, and it works with as few as two voices.

### The doublings ARE the crescendo

> *"In the majority of cases, diverging and converging progressions simply
> consist in the gradual ascent of the three upper parts, with the bass
> descending. The distance separating the bass from the other parts is trifling
> at first, and grows by degrees… The intermediate intervals are filled up by the
> introduction of fresh parts as the distance widens, so that the upper parts
> become doubled or trebled. In converging progressions the tripled and doubled
> parts are simplified, as the duplicating instruments cease to play. Moreover…
> the group in the middle region which remains stationary is the group to be
> retained, or else the sustained note which guarantees unity in the operation."*

One state variable — the span between the outermost voices. Spawn a doubling
whenever an adjacent-voice gap exceeds its budget; on the way down kill them in
reverse order but **pin one stationary middle voice that never drops out**. This
program's `build.enter` adds whole PARTS, which is blunter by an order of
magnitude.

### Re-entry must be at an extreme

> *"After a long rest the re-entry of the horns, trombones and tuba should
> coincide with some characteristic intensity of tone, either pp or ff; piano and
> forte re-entries are less successful, while re-introducing these instruments
> mezzo-forte or mezzo-piano produces a colourless and common-place effect. This
> remark is capable of wider application. For the same reasons it is not good to
> commence or finish any piece of music either mf or mp."*

Any part whose rest exceeds N bars must re-enter in the top or bottom quintile of
velocity, never the middle. Same for the first and last event of the record.
`form.rest` currently returns parts at whatever level the arc happens to be at.

---

## §9 RE-ORCHESTRATION — RIMSKY-KORSAKOV'S FIVE OPERATIONS

**[DOCTRINE]** A variation API, enumerated by the source itself:

> *"The best means of orchestrating the same musical idea in various ways is by
> the adaptation of the musical matter. This can be done by the following
> operations: a) complete or partial transference into other octaves; b)
> repetition in a different key; c) extension of the whole range by the addition
> of octaves to the upper and lower parts; d) alteration of details (the most
> frequent method); e) variation of the general dynamic scheme, e.g. repeating a
> phrase piano, which has already been played forte."*

Five transforms; **(d) is named as the most frequent.** Cycling one theme through
these yields five distinct orchestrations with no new material — which is the
direct answer to *"isn't the whole thing of LOTR a motif that is developed and
played on different instruments different ways?"* The ladder built on 2026-08-11
is operation (a) and part of (c). **(b), (d) and (e) are not built.**

### The handoff and the echo

> *"In order to connect the phrases on each instrument in the best possible way,
> the last note of each part is made to coincide with the first note of the
> following one."*

> *"the second instrument should be weaker than the first, but the two should
> possess some sort of affinity… A wood-wind instrument cannot be used to echo
> the strings, or vice versa, on account of the dissimilarity in timbre.
> Imitation in octaves (with a decrease in resonance) creates an effect
> resembling an echo."*

> *"When a phrase is imitated in the upper register it should be given to an
> instrument of higher range and vice versa."*

Three one-line operations. The handoff overlaps by exactly one note — the last
note of voice A **is** the first note of voice B. The echo must be a
filtered/quieter version of a RELATED timbre, never a different family. An
imitation upward needs a higher-range voice.

Note the tension with the ladder: the ladder swaps instruments **at a section
boundary**, which is a cut. Rimsky-Korsakov's handoff is a one-note overlap, and
it is the difference between a splice and a pass.

---

## §10 TUTTI

**[DOCTRINE]** Belkin gives a threshold: at least three of the four families
present. And three methods of organising one:

> *"All families … Each musical element … The third method is simply to [double
> everything literally]"* — the third *"usually sounds heavy, and leads to a gray
> sound"*, though it is *"occasionally suitable for short, vigorous passages."*

> **VERIFIER'S CORRECTION:** the previous framing said *"three, and only three,
> with an explicit ranking."* Neither holds. The text names three methods without
> claiming exhaustiveness, and ranks nothing across all three — it calls the
> first *"the most common"* (frequency, not quality) and only the third is
> criticised. **This defect was inherited from the raw corpus, which uses the
> same overreach, and should be fixed in both places.**

And a permission that looks like a mistake and is not:

> *"(Sometimes winds and, more rarely, strings, are left empty in the middle
> register when a large brass section is very fully scored; they would not be
> audible in this register over the brass, in any case.)"*

**A hole in the middle of a tutti is legal when brass fills it.** Never put a big
brass block and a wind block in the same middle register.

---

## §11 ECONOMY — THE SCARCITY BUDGET

> *"Neither musical feeling nor the ear itself can stand, for long, the full
> resources of the orchestra combined together. The favourite group of
> instruments is the strings, then follow in order the wood-wind, brass,
> kettle-drums, harps, pizzicato effects, and lastly the percussion, also, in
> point of order, triangle, cymbals, big drum, side drum, tambourine, gong.
> Further removed stand the celesta, glockenspiel and xylophone, which
> instruments, though melodic, are too characteristic in timbre to be employed
> over frequently… the percussion is seldom employed, and practically never all
> together, but in single instruments or in two's and three's."*

A duty-cycle budget per family, in descending availability. **The item that
matters here: the bell / glockenspiel colour — dungeon synth's signature — is in
the "too characteristic to use often" bucket and must be rationed.**

---

# PART TWO — THE MEASURED BENCHMARKS

## §12 FOUR ESCALATIONS, WITH NUMBERS

**[MEASURED]** These are the corpus's most directly usable output: four real
crescendos with bar counts, entry orders and durations.

### Boléro — the canonical algorithm, every number published

340 bars, ~17 minutes, **18 successive re-orchestrations of one unchanging
theme**. Structure: *"4 measure intro, then each pass at the melody is a 2
measure bridge plus 16 measures of melody for a total of 18 measures between
rehearsal numbers."* A new orchestration every 18 bars ≈ every 54 seconds.

The melody-carrier table is a directly encodable preset list: m.5 flute; m.21
clarinet; m.39 bassoon; m.57 E♭ clarinet; m.75 oboe d'amore; m.93 flute +
muted trumpet; m.111 tenor sax; m.129 sopranino/soprano sax; m.147 horn + 2
piccolos + celesta; m.165 oboe + oboe d'amore + cor anglais + clarinets; m.183
trombone; m.201 all woodwind; **m.219 first violins arco**; m.237 + 2nd violins;
m.255 + violas; m.273 + cellos; m.291; m.309; **m.327 key change**; m.340 end.

One ostinato that never stops. One theme that never changes. **Strings withheld
from the melody until 64% in. One key change, 13 bars from the end.**

> **AN UNFLAGGED TENSION the corpus leaves standing**, found by the critic:
> Rimsky-Korsakov's ladder is strings → wind → brass, but Boléro — held up in the
> same corpus as the model escalation — opens on FLUTE and withholds strings
> until m.219. **The canonical worked example runs the ladder backwards for
> strings.** Neither block notices. Do not treat the ladder as universal.

### The FOTR Prologue — 62 bars, pp to fff

b.1 pp q=50 female chorus + strings; b.5 bassoon; b.10 q=55 violin; b.13 harp;
b.18 q=72 *"poco a poco cresc. e accel."*; b.20 q=76 timpani; b.23 q=90 violin f;
b.29 q=112 f; **b.30 sudden drop to p**; b.31–32 q=124 strings + snare + horns;
b.37 cut time, half=88, horns + percussion; b.41 ff full choir; b.45 violins;
**b.53 +Trumpets**; b.62 fff.

Three rules fall out. **(1) The brightest brass is held to the final 15%** —
trumpets at bar 53 of 62. **(2) The crescendo is also an accelerando** — 50 → 176
equivalent, a 3.5× speed-up. **(3) There is a mandatory hard reset to p
immediately before the final ascent.** The last rung, b.37 → b.62, is 25 bars =
**34.1 seconds**, computed from notated meter and tempo rather than estimated.

### The Great Eye — the small-end template, and the one that fits this program

43 bars, ~2:10–2:20, seven additive stages, **one new timbre every 5–7 bars**:
solo horn p → cor anglais → strings + timpani → more horns → choir *entering at
p inside an already-forte texture* → clarinet, violin, whistle → ff tutti with
cymbal. Tempo moves only 72 → 80, **+11%**, unlike the Prologue's 3.5×. And the
arrival is a cymbal crash **plus a ritardando** — the escalation ends by slowing
down.

### Pelennor — eight stages in 250 seconds ≈ 31 s per stage

> *Flagged by its own researcher: "The per-stage figure of ~31 s is arithmetic on
> Adams' stage count, not a published measurement — treat it as an order of
> magnitude, not gospel."*

**Taken together the four give a range: a stage is 30–55 seconds, and a whole
escalation is 2–17 minutes.** This program's sections are the right size for the
Great Eye template and nothing like the Boléro one.

## §13 THE CEILING ON "ADD MORE VOICES"

**[MEASURED]** Doubling incoherent sources gives **+3 dB**; about **10×** the
sources are needed for a perceived doubling of loudness. Derived in the corpus:
*"Going from 5 to 90 players is +12.6 dB, i.e. roughly 2.4× perceived loudness —
nothing like 18×"*, with the recommendation to *"set the level difference between
'small' and 'huge' at about 10-13 dB, no more."*

**So a 20-voice tutti is not four times a 5-voice one. It is about 2.4×.** Size
has to come from span, timbre count and register (§4), not from adding voices.

> **A CONTRADICTION, unresolved:** the corpus gives the unison-detune spread twice
> and incompatibly. One block: *"sigma ≈ 10-14 cents (NOT the 5-10 cents of a
> typical synth unison, and well under the 25-30 cents sometimes quoted)."*
> Another, citing Jers & Ternström: *"a spread of roughly 25 cents."* The second
> explicitly rejects the first's number. Measured f0 dispersion between real
> singers is reported at 25–30 cents; listener tolerance at ~14. **They may be
> measuring different things — production vs perception — but the corpus does not
> say so.** Tuning tolerance also widens with depth: mean absolute deviation rises
> from 16 cents at A2 to **41 cents at A0**.

---

# PART THREE — THE LORD OF THE RINGS, AS NOTATED

## §14 THE SHIRE THEME — AND THE CORRECTION THAT MATTERS

**`lotr-themes-measured.md` §1 is built on a bad transcription.** The research
that found `Shire.abc` flagged it in the same breath:

> *"CAVEAT: I could NOT reconcile this melody with the four other independent
> Concerning Hobbits/Shire transcriptions I extracted (which all agree on
> 1-2-3-5-3-2-1). Treat this file's accuracy as doubtful despite its Howard Shore
> credit line."*

**Five independent transcriptions agree against it.** **[NOTATION]**

| source | key | metre | tempo | melody |
|---|---|---|---|---|
| FOTR Complete Recordings transcription, p.8 | D major | 4/4 | ♩=90 | `D4 E4 F#4 F#4 A4 A4 F#4 F#4 E4 D4 D4` = **1 2 3 3 5 5 3 3 2 1** |
| flat.io full orchestral (16 parts) | D major | 4/4 | ♩=100 | `D5 E5 F#5 F#5 A5 A5 F#5 F#5 E5 F#5 E5` |
| flat.io piano (67 bars) | D major | 4/4 (one 2/4 bar) | ♩=105 | `D5 E5 F#5 A5 F#5 E5 F#5 E5` |
| engraved piano PDF | G major → A major at m13 | 4/4 | ♩=92→105 | modulates, 2/4 bar at m16 |
| tinwhistle tab | D major | — | — | independent confirmation |

Four facts, and every one contradicts what hobbit synth was built on:

1. **MAJOR PENTATONIC.** Pitch set D–E–F#–A(–B). *"no 4th, no 7th."* Corroborated
   independently: *"The melody follows a D major pentatonic scale, with the
   occasional major sixth"* functioning *"as a passing note."*
2. **Degrees `1 2 3 3 5 5 3 3 2 1`** — an arch to the fifth and back. Young's
   Schenkerian reduction says the same: *"a prolongation of tonic, featuring an
   arpeggio to scale-degree 5 and a concluding 2-1 neighbor motion."*
3. **4/4, not 3/4.**
4. **The bass is in the RELATIVE MINOR.** The 16-part score's contrabass, bar by
   bar: `B2 B2 D3 B2 G2 G2 E2 C#2→D2 E2 B2 B2 D3 B2 G2`. **A D-major tune over a
   Bm–D–G–Em bass.** The piano LH gives the chords outright: `D – A – Bm – G – A`
   = **I–V–vi–IV–V**.

That fourth item is the answer to *"Hobbit Synth shouldn't be as dark and moody
as the Dungeon Synth"*: **a bright tune with the shade underneath it, at the same
time.** No new mode required.

**And the caveat that must ride with all of it:** *"Everything here is a FAN
TRANSCRIPTION except the paywalled commercial editions. None is Shore's actual
manuscript."*

### The head motif, three sources, two of them official

> *"stepwise 1-2-3, then a leap to 5, over a static tonic triad, in major
> pentatonic with no 4th and no 7th"*

- The Shire, D major: `D–E–F#–(F#)–A` = 1-2-3-3-5
- Rivendell / "Many meetings", C major: `C–D–E–E–G` = 1-2-3-3-5
- **In Dreams, C major (OFFICIAL Alfred):** `C–D–E–…–G` = 1-2-3-5

The researcher singles this out as the one worth implementing. Note the honest
caveat: only *In Dreams* is official and it is quoted with an ellipsis.

**And the mask relaxes after the head:** the continuation *"breaks the mask: C#5
(degree 7) and G4 (degree 4) appear in the second phrase."* So it is a constraint
on the theme statement, not on the whole part.

## §15 THE OTHER THEMES

All **[NOTATION]** unless marked.

**Rohan** — flat.io full score, 31 bars, 4/4, ♩=76, 10 parts. Pitch set
{C,D,E,F#,G,A,B}: one sharp, **modal**. Flute melody m10-12: `C4 G4 F#4 | A4 A4
G4 A4 B4 E4 | B4 E4 B4 E5`. And the cello runs a **two-note ostinato**: `C3 D3 |
D3 C3 | C3 D3 | C3 D3 | D3 E3 | E3`.

> **VERIFIER:** an earlier summary said the ostinato *"then opens into fifths."*
> It does not — it opens by a STEP to E3, and no fifth appears in the quoted
> range. Plausibly a conflation with the MusicXML `fifths=0` field on the same
> line. Dropped.

The Rohan.abc file is separately a **6/8 jig in A major**: `AEc BEB|Bcc Ace|cdd
ecA|E2d dcB`. Rohan LEAPS where the Shire STEPS — fourths, fifths, sixths,
outlined triads. **That is one number per theme: an interval budget.**

**Isengard** — **5/4, explicitly, in the file attributes.** 25 bars, ♩=80. The
core cell doubled at the octave between brass and strings: `F E F / E D A`. It is
then **transposed**: `C4-B3 / C4 held, then B3-A3-E3`. Chromatic rise at m21-22:
`C–C#–C#–D`. Scored on metal: *"bell plates, anvils, bass drum, taiko, and chains
beaten on piano strings."*
> *Caveat from the file: internal duration inconsistencies — "trust the PITCHES
> and the 5/4 meter more than the exact printed durations."*

**Fellowship** — 52 bars, ♩=100, E major (fifths=4) modulating to fifths=0 at
m37. Violin: `(pickup F#5 G#5) A5 G#5 F#5 E5 F#5 G#5 | F#5 E5 D#5 | C#5 B4 B4 |
C#5 … F#5 G#5 | A5 G#5 A5 B5 A5 B5 | C#6` = degrees 4-3-2-1-2-3 | 2-1-7 | 6-5-5 |
6 … 2-3 | 4-3-4-5-4-5 | 6. Cello under it: `A3 E3 | F#3 E3 D#3 | C#3 B2 B2`. In
Alfred's published conductor score it is **3/4 at "Marcato ♩=168"**, concert C
major/A minor, with a 5/4 bar arriving at bar 16, timpani tuned F, A, C, E.

**Gondor** — Titus, treble, 4/4, no key signature, 8 bars. m1 `D4` then `A4` —
a rising perfect fifth. m3 `C5` whole. m4 `A4` whole. m5 restates D4–A4. **m8
ends on E4, not the tonic.** Mode: **D Dorian** — the sixth degree is absent from
the melody and the seventh is never raised. Six chords, one triad per downbeat:
**Dm, G, F, B♭, C, A** — *"with the exception of D minor, all the chords are
major."*
> The corpus flags a conflict — Reitter's prose says D major — and adjudicates for
> Titus, who has notation. It also offers a reconciliation the earlier draft
> dropped: *"Titus's A major and Young's A minor are different passages/settings
> of the theme, which is itself a usable fact: the chord on that scale degree is
> mutable."*

**The Ring** — Macksey EX.4, a full four-bar string score. Cello + bass divisi
`F3 + C4`; viola divisi `A♭3 + C4` in bars 1 and 3, `A♮3 + C4` in bars 2 and 4.
**Bar 1 is an F minor triad whose third flickers between A♭ and A♮.** Violins
doubled, melody across all four bars uses **three pitches only: A5, B5, C6.** A
minor pad, a raised fourth over it, a three-note cell oscillating on a semitone.
> *The bass motion `F3 → G#3 → F♮3` is flagged by its own reader as lower
> confidence than bar 1. The roman numerals in that article are the author's
> prose and were NOT verified against the staff.*

**Ring and Mordor both open with a rising semitone** — Ring `B4 C5 B4 A4`, Mordor
`C#5 D5 C#5 B♭4` (Trumpet in C, cut time). They diverge on the third interval:
Ring falls a whole step, Mordor a minor third. Confirmed three ways.

**Khazad-dûm** — 4/4, ♩=172, male choir. Opening ostinato `D2 + A2 + D3`: **a
bare open fifth doubled at the octave**, with F3 above. The dungeon-synth sound,
notated.

**Gollum's Song** — ♩=104, K:C, with explicit modal mixture: `_b` against `=b` in
adjacent notes, plus `^f` and `^g`. Printed chords **Gm – Bm – Gm – Bm – Cm**,
LH triads verified. **Gm↔Bm is a chromatic mediant.**

**Into the West** — **I–V–ii–vi**, cross-confirmed in two keys by two independent
official publications: C–G–Dm–Am (easy piano) and E♭–B♭–Fm–Cm (SATB octavo).

**The Prophecy** — official Alfred, A minor, 4/4, *"Slowly, darkly ♩=60"*. A slow
i↔iv oscillation extending to Dm7, then F, then an F-minor modal mixture. The
meter sequence alternates 4/4–3/4–2/4–3/4–4/4–3/4–4/4, and the tempo map is
anchored to bars: **bar 25 "Brightly ♩=168", bar 57 "Moderately slow ♩=60".** In
the fast section the solo line is *"written almost entirely in accented whole
notes and dotted halves"* — **the tempo rises but the melodic rhythm slows.**

**Prologue tempo map, in full:** ♩=50, 55, 72, 76, 90, 112, 124, 𝅗𝅥=88, then 72,
84, 112, 56, 114, 60.

**Tempo across the whole extracted corpus clusters ♩=70 to ♩=118** — pastoral at
the top, laments at the bottom.

## §16 CHROMATIC MEDIANTS — A LOOKUP TABLE

**[NOTATION]** Lee & Lee print a 16-bar harmonic reduction of *Gollum's Song*,
one triad per bar, every transformation labelled: RP, T1, PRM, RP, P, T1, PRM, N,
PL, LP, PL, T1, PRM, PRM, PRM. Named pairs with affect: **G#m→Bm** (RP,
"sadness/tragedy"), **D→B** (RP, "despair/anger/loss of hope"), **Gm→Bm** (PL,
"melancholy/uneasy/tense"), **Bm→Gm** (LP).

Their Table 1 is directly programmable:

| | major | minor |
|---|---|---|
| RP | I→VI | i→iii |
| LP | I→III | i→vi |
| PL | I→♭VI | i→♯iii |
| PR | I→♭III | i→♯vi |
| H (LPL) | I↔♭vi | i↔♯III |
| PRP | I↔♭iii | i↔♯VI |

**[PROSE]** The race/harmony mapping from Rone's abstract — *Hobbits =
major-minor diatonic, Men = modal diatonic, Elves = nondiatonic chromatic
mediants* — is all that is public. **No specific Rone chord pair is in the public
record.** The corpus is emphatic: *"Anyone quoting specific Rone chord
progressions without the PDF is inventing them… If a previous pass reported
specific Rone progressions, they were fabricated."*

---

# PART FOUR — THE OVERWORLD, AND THE GENRE ITSELF

## §17 WHAT ACTUALLY SEPARATES FANTASY SYNTH FROM DUNGEON SYNTH

**[MEASURED]** and this is the block's headline: **it is not tempo.**

| artist | mean BPM | median | mean duration |
|---|---|---|---|
| Hole Dweller | 98.1 | 92 | **2:47** |
| Fief | 101.2 | 98.5 | 3:24 |
| Erang | 106.7 | — | 3:37 |
| Mortiis | 102.0 | — | 5:03 |
| Thangorodrim | 101.6 | — | **10:00** |

Tempo is flat across all five. **Length is the discriminator, and the extremes do
not overlap at all** — Hole Dweller's longest track is 3:27, Thangorodrim's
shortest is 6:23.

At ~100 BPM in 4/4 that is roughly **75–110 bars for fantasy synth against
190–560 bars for dungeon synth.** The consequence for the materials stage is
direct: fantasy cycles through MORE distinct material per minute and then stops;
dungeon sustains one idea.

> **The sample is not random and its own researcher says so:** *"algorithmic —
> Spotify audio-feature estimates aggregated by SongBPM, not hand-tapped; sample
> is the ~10 tracks each artist page displays, apparently alphabetical, NOT
> random."* And exactly **one** confirmed per-track mode datum was obtained in the
> whole block — it reads MAJOR, on a track the same source calls *"somber."* One
> data point cannot support a generalisation and is recorded here only so nobody
> counts it twice.

Also flagged as the agent's own invention rather than sourced, and therefore not
to be encoded: a *"40-60% of tracks have frame-drum percussion"* figure, and a
*"54-58% swing ratio"* for comfy synth. The Erang gear details (Sound Canvas VA,
tape) came from a **403'd** interview via a search summary and must not be used.

## §18 THE OVERWORLD, MEASURED

**[MEASURED]** Tempo and metre across canonical overworld themes fall into three
bands — a lyrical band at 72–90 (FFIV 72, FFVI 80, CT "Yearnings" 84, FFVII 88/90),
a middle band at 108–130 (Dragon Quest V 108, Breath of Fire II 114, DQIII 120,
FFV 125–128, FF1 130), and a fast band at 140–154 (FF Adventure 140, Hyrule Field
144, SMB3 150, CT "Secret of the Forest" 150, Romancing SaGa 3 150, Zelda
Overworld 154).

**Metre: 4/4 dominates.** *"12 of 12 MIDI transcriptions I parsed carried a 4/4
time-signature meta event… 8 of 9 Hooktheory entries are 4/4."* Compound metre is
essentially absent as a NOTATED metre and appears instead as a triplet/shuffle
feel. The one documented genuine metre change is the Dragon Quest Overture: 6/8
intro at 76, then 4/4 at 120.

**Loop length:** SMB overworld = 90 s. Dragon Quest V overworld = 16 bars / 35.6
seconds. Skyrim exploration cues run 3:24 to 7:18, median ≈ 4:44 — *"roughly 3-6×
the length of a JRPG overworld loop."*
> *The corpus's own "3.5–7.5 minutes" summary is contradicted by its own data:
> "Awake 1:31" is in the same list.*

### The harmony, and it is not the one everybody says

**[MEASURED]** from Hooktheory chord-path encodings:

> The recurring "epic wandering" family is **NOT** vi–IV–I–V and only partly
> I–♭VII–IV. It is **(a) major-key borrowed ♭VI/♭VII, and (b) minor-key Aeolian
> descent i–♭VII–♭VI.**

| track | path | reading |
|---|---|---|
| FFVII Main Theme | `1.6.1.b67.b77` | I – vi – I – ♭VI7 – ♭VII7 – I |
| Zelda Overworld | `1.b6.b3.…b7` | I – ♭VI – ♭III – … – ♭VII |
| FF Adventure | `1.7.6.7` | i – ♭VII – ♭VI – ♭VII |
| Hyrule Field | `1.7.6.5.6` | i – ♭VII – ♭VI – V – ♭VI, cadencing IV–V–i |
| CT "Yearnings" | `1add9.6add9.5.7.3` | i(add9) – ♭VI(add9) – v – ♭VII – ♭III |
| SMB3 | `1.57` | I – V7 |

**♭VI and ♭VII borrowed chords are the genre marker, in both major and minor.**

> **AND THE SAME ANALYSIS IS RENDERED TWO INCOMPATIBLE WAYS INSIDE ONE FILE.**
> The overworld block reads Zelda's chord letters off Splice (*"bar 4 D♭ major…
> bar 5 C♭; bar 6 B♭m"*) and numbers only bars 1–3. The chiptune block, citing the
> same page, numbers all eight as `I – v6 – ♭VI – III – ♭VII – vi – V/V – V`. **The
> numerals do not correspond to the letters.** The key is also given twice and
> differently: Hooktheory says B♭ Mixolydian, Splice says B♭ major. Use the letters.

## §19 MODE AND AFFECT — AND THE RULE NOT TO ENCODE

**[MEASURED]** Temperley & Tan, 17 participants, six folk melodies × six modes on
a fixed tonic, forced-choice "which is happier". Proportion judged happier:

| Ionian | Mixolydian | Lydian | Dorian | Aeolian | Phrygian |
|---|---|---|---|---|---|
| .83 | .64 | .58 | **.40** | **.34** | .21 |

F(5,75) = 50.73, p < .001. **But:** *"the pairwise differences are significant for
all but three: Lydian/Mixolydian, Lydian/Dorian, and Dorian/Aeolian."*

> **THE DORIAN–AEOLIAN GAP IS 0.06 AND NOT SIGNIFICANT.** So *"Dorian = wistful,
> Aeolian = tragic"* is **not evidenced**, and if this repo wants a "moody but not
> sad" colour, **Dorian is not the lever.** Mixolydian is the evidenced
> bright-but-not-triumphant mode.

**[MEASURED]** And the budget of expressive control, as squared semi-partial
correlations, median across emotions:

| mode | tempo | register | dynamics | articulation | timbre |
|---|---|---|---|---|---|
| **0.29** | 0.14 | 0.08 | 0.04 | 0.02 | **0.01** |

**Mode outweighs tempo 2:1, and both outweigh timbre by an order of magnitude.**
Linear combinations of these six explained 77–89% of variance. Note tempo was
parameterised as **notes per second (1.2–6.0)**, not BPM — surface rate, not the
metronome. This is the honest ranking of where effort is worth spending, and it
says the instrument matters least.

## §20 THE WALKING TEMPO, SOURCED

**[MEASURED]** Human walking cadence clusters at **110–121 steps/min**, and
walkers pull their cadence to within about one beat of a musical stimulus
(r = 0.86, p < .001). Beat-to-step synchronisation works in a **106–130 BPM**
window; below ~114 tempo drives walking speed linearly, above ~118 it saturates.
Standard thresholds: 100 steps/min = moderate intensity, 130 = vigorous.

Schubert marks the archetypal walking song literally *"in walking motion"* —
*Gute Nacht*, 2/4, **D minor**, constant quaver tread in the piano, at 112–120
quavers/min, **which lands exactly inside the measured human band.**
> *That last coincidence is the researcher's own derivation, not a sourced claim.*

## §21 THE PASTORAL AND THE HUNT — TOPIC THEORY WITH HARD CONSTRAINTS

**[DOCTRINE/PROSE]** Monelle. Compound duple/triple metre signifies **the HORSE**,
not "journey" generally — 6/8 (Schumann's *Wilde Reiter*), 9/8 (Wagner's
Valkyries), 12/8 (Schubert's *Erlkönig*). It is an indexical convention with an
iconic root that outlived the hunting practice it came from.

The pastoral topic has exactly three named components: instruments (musette,
hurdy-gurdy/vielle, the *pifferari*'s zampogna and piffero), the siciliana
rhythm, and simplicity — and **the single most pervasive signifier is the drone
bass.** Concretely: 6/8, 9/8 or 12/8 at moderate tempo, melody in parallel thirds
over a drone.

**And a hard pitch constraint, stated as one:**

> *"pitch set = {1, 3, 5} of the major triad only, voiced in the natural horn's
> 3rd–6th partials. **Forbid scale steps 2, 4, 6, 7.** This is a hard pitch
> constraint, not a style hint."*

The horn-call topic is restricted to the natural horn's triadic shapes, not the
later elaborate diatonic horn writing.

**Pandiatonicism** is definable mechanically: lock the pitch set to one diatonic
collection, disable voice-leading and resolution rules, allow seconds in
voicings, **never resolve**, and *"treat scale degree 7 as a colour tone, not a
pull to 1."*

## §22 WRITTEN TO BE HEARD A THOUSAND TIMES

**[PROSE, and it bears on every looping genre here]** Sugiyama's stated design
constraint is that game music is heard hundreds to thousands of times and must
resist fatigue; **eccentric, attention-grabbing writing is therefore wrong.** He
wrote most of Dragon Quest 1 on **two** channels, reserving three for the opening
and ending, and states that three voices is enough for a professional. His stated
priority: **melody outranks timbre.**
> *Could not be verified verbatim — shmuplations returned an empty body and a
> Cloudflare 202. Treat as a search-snippet quotation.*

Koji Kondo's anti-fatigue device for Zelda field music is **audible counterpoint /
obbligato, not melodic variety** — and in Ocarina he abandoned the series
overworld theme entirely in favour of adaptive variation. His channel reality:
only three usable, **and sound effects stole them mid-song**, which yields a
composition rule — *"write parts that remain intelligible when any single
non-melody voice is muted."*

Uematsu's thickener, in his own words, is a melody doubled by a copy shifted
slightly in **both frequency and timing.**

---

# PART FIVE — THIS PROGRAM

## §23 THE SEAM MAP

Where each item lands, with line numbers, so nothing gets written into a table
that is not read.

| doctrine | seam | state |
|---|---|---|
| 4 parts + doublings (§1) | `STACK_OK` 28903 | table correct, **hand-only** — nothing doubles automatically |
| unison before octave (§2) | `const semis = s.semis \|\| 12` 28918 | **broken**, measured — swallows a zero |
| loudness table (§3) | the one gain formula 28597 | `arcE` is already at the call site; `roleGain` is one fixed number and cannot express a ratio that collapses with dynamic |
| percussion cap (§3) | `roleGain` per genre | drums 1.4 vs lead 0.57 in DS — the peak is where the escalation goes inaudible |
| spacing budget (§4) | **not** `registers:` — `buildKeys` 24998 | bands overlap by design; the budget is between adjacent voices in a sounding chord |
| register extremes are cheap (§4) | `registers:` / `allocKeysBand` 26850 | nothing spends voices on span deliberately |
| timbre counts (§4) | — | no seam: voices have no orchestral family |
| melody ≠ harmony colour (§7) | — | **no seam at all.** `family` (2043) is the Erang sample-bank family, not an orchestral one |
| crescendo entry order (§8) | the ladder, 28154 | built 2026-08-11 |
| short vs long crescendo (§8) | `form.arc` | no distinction — every build moves gain the same way |
| re-entry at an extreme (§8) | `form.rest` 27966 | parts return at whatever the arc happens to be |
| RK's five operations (§9) | `swap` / ladder | (a) and part of (c) exist; (b), (d), (e) do not |
| one-note handoff (§9) | the ladder | the ladder CUTS at a boundary; the doctrine overlaps by one note |
| length is the genre (§17) | `form.lengths` | worth checking against the 75–110 vs 190–560 bar finding |
| ♭VI/♭VII is the marker (§18) | `progressions` | checkable per genre |
| mode 0.29 > timbre 0.01 (§19) | — | the ranking argues against how much of this repo's effort goes into voices |

## §24 CONTRADICTIONS THE CORPUS NEVER RESOLVES

Listed so they are never quietly picked from.

1. **Unison vs octave doubling** — Berlioz vs Belkin, §2. Both quoted; neither
   block notices the other.
2. **The string/wind weight** — 0.25/0.5 vs 0.5/1.0 in the same block, §3.
3. **The detune spread** — 10–14 cents vs 25 cents, one explicitly rejecting the
   other's number, §13.
4. **The crescendo ladder vs Boléro** — strings-first doctrine against a
   strings-at-64% canonical example, §12.
5. **Zelda's numerals vs its letters**, §18.
6. **Two "Secret of the Forest" analyses called "in agreement" name different
   chords** — `iv9/v9 (E♭m9/Fm9)` against `G♭maj7/13 → Fm7/9`.
7. **Dragon Quest's channel budget** — one block calls the tiny budget "folklore…
   it had the same 5-channel 2A03"; the other quotes Sugiyama saying he used two.
   Both are true and they are about different things; neither block notices.
8. **Berlioz's festival orchestra disagrees with itself** — "40 Violas" in the
   list, "the 50 violas" two lines later; 467 players vs a popular 465.
9. **The Prologue is called both 13 minutes and 7:16.**
10. **Gondor: D major (Reitter, prose) vs D Dorian (Titus, notation).** Adjudicated
    for notation, with the reconciliation that they are different settings.

## §25 NOT FOUND — DO NOT FILL THESE IN FROM MEMORY

- **Rone, "Scoring the Familiar and Unfamiliar"** (Music and the Moving Image
  11/2, 2018). Blocked five ways: publisher 403, MUSE bot wall, Gale 410,
  ResearchGate 403, academia 403. Only the abstract's race/harmony mapping is
  public.
- **Heine, "Chromatic Mediants and Narrative Context in Film"** — Wiley paywall.
- **Lothlórien's pitches.** Titus prints the melody; the scan is too coarse and
  the researcher refused to guess. Certain from the image: 5/4 then 4/4, no key
  signature, ≥5 written flats, range ~D4–C5. Her claims: maqam hijaz with the
  microtones removed, mostly stepwise, **final interval an unresolved augmented
  second**, monophonic and unharmonised.
- **Doug Adams' free "Annotated Score" PDF contains NO NOTATION.** 48 embedded
  images, all film stills. The researcher checked the file and calls this an
  IMPORTANT NEGATIVE RESULT. Sibling volumes (_1, _3, TTT, ROTK) all 404. The
  notated themes are in the printed book (Alfred 2010, ISBN 9780739071571).
  Its only two musical statements: Shore *"tosses the hobbits' characteristic
  open fourth and fifth intervals… around the orchestra's strings and winds"*,
  and the Doors of Durin are revealed with *"a rising series of major triads."*
- **The published orchestral score** is rental-only (CAMI Music). The official
  instrumentation string is public:
  `3(2+afl,ney,bfl,3.picc+tin whistle).3(3.eng hn).3(3.bs cl).3(3.cbn) – 5.4.3(3.bs tbn).1 – timp,5perc,dulc – mus,gtr,hp,pno(+cel) – boy's chorus,SATB – str+irish fiddle,sarangi(16.14.12.10.8)`.
  Duration 3:45:00.
- Six ABC files 404'd: `ForthEorlingas`, `KingoftheGoldenHall`,
  `FoundationsofStone`, `EowynsTheme`, `BlackRider`, `IntoTheWest`.
  `FarOverTheMistyMountainsCold.abc` exists but is **malformed** — it writes
  `f2#` instead of the legal `^f2`, so most parsers reject it.
- **MuseScore is a hard dead end** — Cloudflare 403 on every route.
- Five flat.io scores were downloaded and never parsed: a 224-bar medley
  (♩=96, fifths=−2), a 104-bar string quartet (♩=90, fifths=2), Isengard
  Unleashed (12 bars), Fellowship Horn+Cello (8 bars — **transposing, not a
  drop-in concert source**), Shire cello (6 bars). *Only the quartet is confirmed
  to contain full note data; the others are "200 OK" plus header metadata.*

## §26 HOW TO GET THE NOTES — the two techniques that worked

1. **flat.io's `/api/v2/scores/<id>/revisions/last/json` is free** and returns
   complete score-partwise MusicXML — step, alter, octave, duration, per part.
   The `midi`, `mxl` and `abc` endpoints all return **HTTP 402
   FEATURE_NOT_IN_PLAN**; `json` returns 200. This is how the full orchestral
   Shire, Rohan, Isengard and Fellowship scores were read. **Use the concert-pitch
   parts** — horn parts are written transposing, and the corpus names this as a
   live corruption risk.
2. **abcnotation.com suppresses display for copyright tunes but still prints a
   direct link to the raw `.abc` file**, which serves the full notation. ~800,000
   tunes / 390,000 files.

Two further traps worth recording. **Engraved score PDFs cannot be
text-extracted** — the embedded text is a music font that yields garbage for
noteheads, so pages must be rendered and read geometrically. And **two letter-note
conventions in this corpus use uppercase to mean opposite things**: sharps on
pianoletternotes, lower octave in ABC. Conflating them corrupts every pitch.

Free PDFs with real engraved notation, all fetched: **Young** (OhioLINK, BGSU
2007, 84pp, ~58 notated examples — the richest single source, catalogued page by
page, though it is a Tagg-style affect study with almost no roman numerals);
**Titus** (UNI 2013, Gondor and Lothlórien); the **Macksey Journal** article (five
notated examples including a full four-bar string score); **Lee & Lee** (Rast
Musicology 2022, the neo-Riemannian table); Alfred's free
`content.alfred.com/catpages/<ITEM>.pdf` samples for every instrument in the
*Instrumental Solos* series — *and the red "Preview Only" watermark is a separate
overlay: extracting the base image gives a clean scan*; and a **169-page fan
transcription** of the complete FOTR recordings, Sibelius-engraved and fully
vector.

---

# PART SIX — SPACE, AND WHAT MOVES A SEND

*Added 2026-08-11 from four contained research agents, run to source hobbit
synth's automation rather than invent it. Same rules as the rest of the sheet:
[NOTATION] / [DOCTRINE] / [MEASURED] / [PROSE], and every inference marked.*

## §27 THE FINDING THAT CONTRADICTS EVERY GENRE IN THIS PROGRAM

Two agents, working independently on different questions, arrived at the same
place: **the effect send should not be ridden with the dynamic.**

The physics is sourced. Perceived distance is carried by the **direct-to-
reverberant ratio**, and that ratio is intensity-independent:

> *"In reverberant environments, there is also a systematic relation between the
> distance to the source and the reverberation amount relative to the level of
> the direct sound… leading to another relevant distance cue: the
> direct-to-reverberant energy ratio (DRR)."*
> — Frontiers in Psychology, 10.3389/fpsyg.2017.00969

A real hall gets louder along with the orchestra; the ratio does not move. A
post-fader send at fixed depth already models this correctly:

> *"You can control the different 'distances' of the sections simply by how much
> of the signal is fed into that reverb send."*
> *"the further back you are in the room, the balance between direct sound and
> reverberant sound is skewed towards the wet."*
> — macprovideo, mixing an orchestra

**So a room send ramped UP into a climax reads as the players retreating at the
exact moment they should arrive.** Both agents flagged the *"therefore do not"*
step as their inference from the sourced physics rather than a quoted claim, and
it is recorded that way here.

**MEASURED against this program:** dungeon synth's `drumsRoom` and prog-techno's
`leadRoom` both ramp wetness on the apex. Neither is changed — both genres have
been judged good and this is a finding, not a verdict — but hobbit synth was
built on the other principle and its table says why.

And one working orchestral mixer goes further, against the whole idea:

> *"do as little volume automation as possible with such music. In recordings of
> classical music automation should be avoided completely."* … *"raise the level
> of reverb (or even add specific reverb) on the spot mic in solo lines to give
> that solo a little bit more shine and 'drama'."*
> — Robin Hoffmann

Note the permission structure: automating **all mics together** to shape a tutti
crescendo is sanctioned; automating individual channels is not; and send
automation is sanctioned **only for solo spotlighting.**

## §28 WHAT DOES MOVE A SEND — three sourced drivers

**SECTION, as a quantised named distance.** Mahler does not write a distance
knob, he writes named states — *"In der Ferne"*, *"In weiter Entfernung"*, *"In
sehr weiter Entfernung"* — and then *"Die 3 Tromp. nehmen ihren Platz im
Orchester ein"*: the trumpets **walk in from offstage**, once, as a structural
event. Distance is a small ordered set traversed at a boundary, not a ride.

**DENSITY, not dynamic.** *"For faster tracks with more elements, shorter decay
times are often more effective as they prevent the mix from becoming
cluttered"*; the sparse end takes the long tail. So the thin sections are the wet
ones and the tutti is the dry one — the opposite of the arc-driven habit.

**THE BOUNDARY.** The only verbatim automation *shapes* anyone documents are
one or two bars long and anchored to a structural edge:

> *"On the main synth part, I've drawn an automation curve to ramp up the reverb
> send level in the two bars preceding the 'stop'."*
> *"on the first beat of the 'stop' itself, where a kick drum hits and everything
> else stops playing, I've used automation to apply a short (one-beat long) but
> very large dollop of reverb to my drum track."*
> *"I reversed the reverb send ramp trick, this time starting with lots of reverb
> and quickly returning back to almost none over the course of the one-bar roll."*
> — Sound On Sound, "Spot Reverb"

Three gestures, all terminating **on** the boundary. Note the second is gated on
an arrangement drop — it is audible only *because* the other parts muted.
*Caveat: a pop/electronic mixing article; the shapes are documented, their
applicability to an orchestral cue is the researcher's inference.*

## §29 DISTANCE IS A COUPLED BUNDLE, AND PRE-DELAY IS NOT SIZE

**[DOCTRINE]** Rimsky-Korsakov, flatly: *"Brass instruments, when muted, produce
an effect of distance."* Berlioz gives the clarinet the same faculty — *"the
precious faculty of producing distance, echo, an echo of echo, and a twilight
sound"* — and notes the stopped horn can repeat its own passage *"like a very
distant echo"*, which is the minimal unit of space-as-arrangement: **same notes,
second pass further away.** A program should prefer to change space on a
**repeat**, not on new material.

Distance therefore moves four things together, not one: level down, high end
down, send up, and the processor **blurrier** — *"choose a suitably diffuse
reverb type (in other words, one without too much detail), and also roll off some
high end."*

**And pre-delay is the opposite of what it is usually assumed to be.** The
researcher caught themselves about to report the inverse: the documented use of
long pre-delay (~90–110 ms) is to keep a source **foreground**, by separating the
direct sound from the tail. Early reflections carry room *size*; pre-delay
carries *position*. **No source reached gives a milliseconds-to-room-size
mapping. Do not invent one and call it sourced.**

## §30 THE FLOOR — dry is not neutral, it is dead

**[DOCTRINE]** Berlioz:

> *"This is why there is no such thing as music in the open air. The most enormous
> orchestra placed in the middle of an extensive garden open on all sides… would
> produce no effect."*
> *"An orchestra of a thousand wind instruments, with a chorus of two thousand
> voices, placed in a plain, would not have a twentieth part of the musical
> action that an ordinary orchestra of eighty players with a chorus of a hundred
> voices would have if well disposed in the concert-room."*

**A thousand players outdoors is worth less than eighty in a hall.** So a fully
dry passage is a strong, deliberate, short effect and never the resting state —
and **scale cannot be bought by stacking parts into a dead space.** If a build
adds voices, the room must come with them or the build will not read as bigger.

## §31 HOW THE LORD OF THE RINGS WAS ACTUALLY RECORDED — and the space does NOT change

This is the best-sourced item of the four agents, and it contradicts the
dungeon-synth instinct completely.

**The venues.** *"There were some sessions in Abbey Road, but the real heart of
the score was done in Watford Town Hall… most of the choral sessions were there,
and a little bit at AIR Lyndhurst, Henry Wood Hall."* The first sessions — the
**Moria** sequence, for Cannes 2001 — were Wellington Town Hall, and are still in
the film.

**And the room was held constant, on purpose, for three and a half years.**
John Kurlander, who recorded all three:

> *"On LOTR we needed to record in no fewer than four principal venues… in order
> to allow for extensive editing between performances, the sound had to be 100%
> consistent between takes from all venues and the edits had to sound like a
> single performance — actually a single performance that was recorded over a
> time span of 3.5 years."*

> *"We recorded The Lord of the Rings in four different rooms, over a period of
> three years, at four different locations, edited everything in-between, and it
> all matched."*

**The irony is exact: Moria, the most cavernous place in the story, is the one
sequence recorded in a different hall — and the entire engineering effort went
into making that difference vanish.** What varies by culture in that score is
**instrumentation and voice type**, never the room: the Shire's Celtic band,
Lothlórien's 50-string monochord and *"Eastern bell-like tones of droning strings
and winds"*, Moria's male chorus of Maori rugby players, Mordor's *"piercing,
intruding sounds"*, the Orcs' pianist *"violently strik[ing] the wires inside the
instrument with metal chains."*

**Two more corrections to the obvious assumption:**

1. **Watford Colosseum is not a cathedral.** *"The low volume, especially in the
   upper part of the room, explains why the Colosseum has one of the lowest
   reverberation times of the British concert halls."* Its virtue is early
   reflections off close, reflective sidewalls on a flat floor.
2. **The target sound was an OPERA PIT.** Kurlander *"visited the Metropolitan
   Opera in New York to see how they handled their pit orchestra; that was the
   sound they were trying to emulate."* Shore chose the LPO for the same reason:
   *"Being in a pit accompanying opera is so much like what I'm trying to do with
   film music, and they understand that well."*

**Therefore:** region-varying reverb in a fantasy-synth genre is **dungeon synth
practice, not Shore practice**, and must be labelled as such. The researcher put
it plainly: *"call it your hybrid, not a Shore technique, because the sources say
Shore's team spent three years making sure the room never changed."*

**The one architecture that IS sourced and is directly a matrix-mixer shape:**
three capture classes into **one shared room** — orchestra in the hall, choir
recorded in a different building and matched in, and the folk soloists dry in a
booth. Gillian Tingay, on the Celtic harp: *"I arrived at the studio expecting to
be playing with my usual session orchestra but instead was asked to take myself
and my little harp into a rather compact recording box."* Kurlander's own words
for the general case: *"we made both mixes somewhat shy of artificial reverb so
that in post-production there was some freedom to add a common ambiance to
both."* **Crossfading a dry intimate plane against a matched hall plane is a send
automation the sources support; switching rooms is not.**

**NEGATIVE, and worth recording:** grepping all three free Doug Adams *Annotated
Scores* for `synth`, `electronic`, `sampler`, `processed`, `reverb` and `effects`
returns **zero hits** for synthesizer, electronics, samplers or processing. A
search snippet claiming the orchestration included "keyboards such as
synthesizer" could not be verified against any primary source. **Do not use it.**

## §32 WHAT THE DUNGEON-SYNTH ARTISTS SAY, IN THEIR OWN WORDS

**Space is a LOCATION, and the artists design it as one.** Pale Castle, on why
his second tape sounds different from his first — this is the two-record
experiment on exactly this axis:

> *"On the first tape I created a cold and confined sound to illustrate the
> oubliette like atmosphere, in 'Sorrowful Mysteries' I wanted to convey the
> feeling of traveling and discovery. So yes, it was a very conscious decision to
> create a more cinematic sound. The listener should feel outdoors and upon a
> means travel."*

So the route to the dungeon end is to **shrink the room**, not to dry it out.
His technique, named: *"Plenty of analog reverb and tape delay was used to get
that tone. It was layered several times as well."*

**Reverb trades against polyphonic legibility.** Protector of Summoning, who
changed exactly this between two records and said why:

> *"We did not use so much reverb this time and took more care to create a sound
> where the listeners can distinguish better between the different melodies
> playing at the same time."*

> *"If the same song comes hidden behind a lot of reverb it offers more a feeling
> of far distance and therefore can be considered as more dark."*

**Darkness is what distance buys.** And his fix for the collision was in the
frequency domain, not the reverb: *"we completely rearranged the sound and put
everything much more into the deep frequency spectrum"* so the guitars
*"interfere less with the high keyboard melodies."*

**Nobody credits reverb for SCALE.** Every artist who addresses largeness
attributes it to layer count, register separation or repetition. Mortiis stacked
parts blind, writing each in a different coloured pen because he had no way to
overdub — *"on and on for layers and layers for 20-25 minutes."* Pale Castle takes
the opposite route: *"I prefer minimal arrangements… Powerful chords and melodies
can be repeated with benefit, similarly as a steady fire can warm one's bones."*

**And the assumption that the pastoral end is the clean one is FALSE.** Tim
Rowland runs both Bellkeeper (dungeon) and **Hole Dweller (the actual hobbit
flagship)**, and it is the hobbit project that is deliberately the dirtier:

> *"Hole Dweller was my attempt to do something more weathered and humble; down
> to earth. I wanted something gritty, yet soft. I needed to connect the sound
> itself with how simple a hobbit's world can be. I worked within very limited
> constraints: one synth, four crafted sounds total with added percussion."*

**One synth, four voices, plus percussion** — scarcity as the aesthetic, and the
grit is a chosen texture on a clean path, not the residue of bad gear.

**"Dungeon synth = lo-fi" is false as a blanket claim.** Erang rejects polish on
principle — *"I need amateurish, handcrafted and sincere sounds. Fuck the music
industry."* — while Grimrik both makes and masters records for the scene, and
Fief, the pastoral flagship, carries a commercial mastering credit. The
defensible position for a genre between them: **compose and voice like the naive
wing, master like the craft wing.**

**NEGATIVE, and it re-confirms an earlier trap:** the Erang gear attribution
(Roland Sound Canvas VA, tape) remains unverifiable — the likely source is behind
a Cloudflare check that defeated four independent routes. Across four Erang
interviews that DID load, he consistently refuses to discuss gear: *"I prefer not
to get into technical comment about Dungeon Synth."* **A specific hardware
attribution to Erang is out of character for every primary source anyone has
actually read.** Also excluded: several fluent, confident, unattributed lines from
AI-generated pages asserting things like *"Reverb is essential for creating the
cavernous and mystical feel of Dungeon Synth"* — those are not artist statements.
