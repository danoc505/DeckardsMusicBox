# Dealing a chord — who gets which note

*Researched 2026-08-13. `score-craft.md` §42 named the defect and §47 ranked it #2:
"**Chords dealt out across voices instead of struck as blocks** — plus §4's voicing
rules to decide who gets what." The measurement that justifies it: **53.5% of this
program's wind notes overlap a different pitch on the same wind voice — a single
flute holding up to SEVEN pitches at once.***

`score-craft.md` already has the principles. It does not have the **procedure**.
This sheet is only about the procedure: given a chord and a set of instruments,
which instrument plays which note. Everything below is either a verbatim rule from
a named source, a number, or a marked decision.

---

## §0 HOW THIS WAS MADE, AND HOW MUCH TO TRUST IT

Four sources carry almost all the weight, and they are not equally trustworthy:

- **[DOCTRINE]** Rimsky-Korsakov, *Principles of Orchestration*, Gutenberg #33900,
  **Chapter III "Harmony"** — the chapter `score-craft.md` quoted four sentences of
  and did not read. It is 700 lines long and it is, almost line for line, an
  assignment algorithm. It contains named methods, a priority order, an omission
  rule, and a "to be avoided" for each. This is the spine of the sheet. Public
  domain, clean text, quotes are byte-exact against `pg33900.txt`.
- **[DOCTRINE]** Adler, *The Study of Orchestration*, 3rd ed. — an OCR of the
  textbook already sitting in this session's scratchpad from earlier work. Modern,
  and it independently names the *same* four voicing shapes as Rimsky-Korsakov,
  which is the strongest corroboration in the sheet. OCR, so quotes are transcribed
  and lightly de-hyphenated; the wording is checked but the page numbers are not.
- **[MEASURED]** Le, Giraud, Levé & Maccarini, *A Corpus Describing Orchestral
  Texture…* (DLfM 2022), **7900 annotations across 24 Haydn/Mozart/Beethoven first
  movements**. The only source in the whole search that counts anything. Its numbers
  are about *roles and pairings*, not about individual chord tones — read §9 for
  exactly what it can and cannot settle.
- **[PROSE, but numeric]** the **low interval limits** chart (§6). This is the one
  place the sheet gives hard frequencies, and it rests on **a single orchestrator's
  engraved chart with no cited source**. The numbers were read off the engraving by
  measuring staff-line positions in pixels and mapping noteheads to diatonic steps,
  not by eye. They are transcribed accurately; whether they are *right* is a
  separate question and §6 says what corroborates them and what does not.

Statement kinds are marked as in `score-craft.md` §0: **[DOCTRINE]** a rule from a
treatise, quoted; **[MEASURED]** a number somebody counted; **[PROSE]** an assertion
with no staff and no count behind it. `[CHOSEN]` marks a decision this sheet makes
where the corpus does not decide.

**What was NOT obtained** is recorded in §14 rather than papered over.

---

## §1 THE TYPE ERROR, AND THE SENTENCE THAT STATES IT AS LAW

`score-craft.md` §42 asserts that a wind voice is a function from time to at most
one pitch. That is correct, and there is a source that says it as a *notational*
rule rather than a physical one:

> *"The term divisi should not be used in wind or brass parts, since it is a
> designation for string players only, who read two to a part. **Each wind player is
> given a separate part.**"*
> [corpus:adler *The Study of Orchestration*, ch. 6]

That is the whole type change in one sentence, and it cuts both ways:

- **A wind voice cannot be divided.** There is no notation for it because there is
  no player for it. A 3-note chord on `flute` is not a thin chord, it is a
  **notational impossibility** — three parts that were never written.
- **A string voice can be divided, and the default is the opposite of the winds'.**
  > *"If the word divisi does not appear in the parts, the player would be correct
  > in performing the chord as a double stop. Sometimes the indication `non div.`
  > appears to ensure that each player will perform double stops."*
  > [corpus:adler ch. 2]

  So on strings, an unmarked 2-note chord means **one player, two strings** — and
  the *engine* has to decide which reading it wants, because both are legal and they
  sound different (§12).

**The consequence for this program.** The 53.5% figure is not "bad voicing". It is a
part that does not correspond to any playable part. Every rule in this sheet is
downstream of one question the engine currently never asks: **how many independent
pitch-slots does this voice own?** For a wind it is 1 per player. For a string
section it is a decision. For a keyboard patch it is unbounded and none of this
applies.

---

## §2 THERE ARE EXACTLY THREE (FOUR) LEGAL SHAPES, AND TWO SOURCES NAME THE SAME ONES

This is the finding that makes the problem finite. **Rimsky-Korsakov, 1913:**

> *"**In pairs.** There are three ways of distribution: 1. **Superposition** or
> **overlaying** (strictly following the normal order of register), 2. **Crossing**,
> and 3. **Enclosure** of parts. The last two methods involve a certain disturbance
> of the natural order of register."*
> [corpus:rimsky-korsakov ch. III, *Four-part and three-part harmony*]

**Adler, 2002, on the same page of the same problem:**

> *"Chords for winds in pairs may be voiced in four ways: 1. **Juxtaposed or
> superimposed** … 2. **Interlocked** … 3. **Enclosed** … 4. **Overlapped**."*
> [corpus:adler ch. 8, ex. 8-18]

Ninety years apart, four sources of instruction apart, and the taxonomy is
identical. The mapping is exact:

| shape | R-K name | Adler name | what it is | Adler's caveat |
|---|---|---|---|---|
| A A / B B | superposition, **overlaying** | juxtaposed, superimposed | one pair wholly above the other; register order intact | *"probably the most frequently used voicing"* |
| A B / A B | **crossing** | **interlocked** | the pairs alternate down the chord | *"more imaginative… but it must be used carefully because the pitches in some registers on some instruments will predominate"* |
| A / B B / A | **enclosure** | **enclosed** | one timbre wrapped inside another | *"may present similar problems … namely, upsetting the timbral balance"* |
| A+B on one pitch | *(R-K's "duplication")* | **overlapped** | unison doubling, not a distribution at all | *"obscures the timbral characteristics of both sets of instruments"* |

**[CHOSEN] Model the assignment as a choice among these four shapes, not as a free
search over instrument↔note pairings.** Two independent treatises enumerating the
same four is as close to a closed set as orchestration doctrine ever gets, and it
turns an N!-sized search into a 4-way switch plus an ordering. Adler's fourth is not
a distribution and belongs to `STACK_OK` (`score-craft.md` §1), not here.

R-K's default, stated flatly, twice:

> *"**Overlaying of parts is the best course to adopt.**"* (three-part, in pairs)
> *"**Overlaying of parts is the best method to follow** in writing close four-part
> harmony."* (four-part, in three's)
> *"Overlaying of parts is the most satisfactory method in dealing with close
> three-part harmony. **Crossing of parts is not so favourable, as octaves will be
> produced contrary to the natural order of register.**"*
> [corpus:rimsky-korsakov ch. III]

---

## §3 THE PRIORITY ORDER — one sentence ranks the constraints, and it is not the one you would guess

This is the single most useful sentence found, because an assignment algorithm needs
a tie-break rule and every other source gives coequal principles:

> *"It is not always possible to secure proper balance in scoring for full
> wood-wind. For instance, in a succession of chords where the melodic position is
> constantly changing, **distribution is subordinate to correct progression of
> parts.**"*
> [corpus:rimsky-korsakov ch. III, *General observations* to the combined-group section]

**Voice-leading outranks distribution.** When a good hand-out conflicts with a good
line, the line wins and the hand-out gives way. And R-K says the damage is
self-limiting:

> *"any inequality of tone may be counterbalanced by the following acoustic
> phenomenon: **in every chord the parts in octaves strengthen one another**, the
> harmonic sounds in the lowest register coinciding with and supporting those in the
> highest."*

He also concedes the reverse case explicitly — that a *temporary* doubling is worth
a balance error if it buys a clean line:

> *"In many cases correct progression of parts demands that one of them should be
> temporarily doubled. In such cases **the ear is reconciled to the brief overthrow
> of balance for the sake of a single part, and is thankful for the logical accuracy
> of the progression**."*

And it is stated at the top of the chapter as the whole thesis of orchestration:

> *"unsatisfactory resonance is often solely the outcome of faulty handling of
> parts, and such a composition will continue to sound badly whatever choice of
> instruments is made. So, on the other hand, **it often happens that a passage in
> which the chords are properly distributed, and the progression of parts correctly
> handled, will sound equally well if played by strings, wood-wind or brass.**"*

**[CHOSEN] The assignment runs as a constrained optimisation with voice-leading as a
HARD constraint and everything else as soft cost.** Not as a scoring blend. This is
R-K's own ordering and it is the only place in the corpus where two orchestration
constraints are explicitly ranked against each other.

---

## §4 WHO GETS WHICH NOTE — the rules, in the order they bind

All four numbered rules below are R-K's own numbering, verbatim, from the opening of
*Wood-wind harmony*. They are the closest thing in the literature to a specification.

> **1.** *"Instruments forming chords must be used continuously in the same way
> during a given passage, that is to say **they must be doubled or not throughout**,
> except when one of the harmonic parts is to be made prominent."*
>
> **2.** *"**The normal order of register must be followed**, except in the case of
> crossing or enclosure of parts."*
>
> **3.** *"**Corresponding or adjacent registers should be made to coincide** except
> for certain colour effects."* — with the failure named: *"The second flute will
> sound too weak and the oboes too piercing."*
>
> **4.** *"**Concords (octaves, thirds and sixths) and not discords (fifths, fourths,
> seconds and sevenths), should be given to instruments of the same kind or
> colour**, except when discords are to be emphasised. This rule should be specially
> observed in writing for the oboe with its penetrating quality of tone."*
> [corpus:rimsky-korsakov ch. III, *Wood-wind harmony*]

Rule 4 is the sharpest and the least known. **Same-timbre pairs take consonances;
cross-timbre pairs take the clashes.** It is restated for brass with the same
polarity:

> *"**Discords of the seventh or second are preferably entrusted to instruments of
> different tone colour.**"*

and given a worked instance for the bassoon/horn quartet:

> *"crossing of parts is to be recommended for the purposes of blend, **the concords
> being given to the horns, the discords to the bassoons**."*

Three statements of one rule, in three different scorings. It is the best-evidenced
assignment rule in the whole corpus, and it is a *pure function of the chord* — no
listening required. It also inverts the naïve intuition, which is to hide a clash
inside one colour.

### The register veto, and it is checked per note, not per instrument

> *"the register of a particular isolated chord; **the soft and weak register of an
> instrument should not be coupled with the powerful and piercing range of
> another**"* — with the three failures named against the three shapes: *"Overlaying.
> Oboe too piercing. Crossing. Low notes of the flute too weak. Enclosure. Bassoon
> too prominent."*
> [corpus:rimsky-korsakov ch. III]

The same veto in Adler, applied to the *melody* note specifically:

> *"you must be sure that **the most prominent melody note is in a good register for
> the instrument to which it has been assigned**."*
> [corpus:adler ch. 8]

and as a general orchestration rule:

> *"**Assign pitches to the instruments within their best registral positions so that
> they can be sounded at the desired dynamic.**"* — Adler's rule 2 of 3 for
> orchestrating a chordal texture; rule 1 is *"Make the melody notes more prominent
> than the harmony notes"* and rule 3 is *"When doubling notes, find instruments that
> have an acoustic affinity for one another. This is especially important when
> doubling at pitch."*
> [corpus:adler ch. 15]

### Who takes the top and who takes the bottom

- **Top:** the natural order decides — highest-centred instrument on top
  (`score-craft.md` §5). **But** the extremes are the weak seats:
  > *"**the two extreme parts are the thinnest and weakest in tone, the intermediate
  > parts the fullest and strongest.**"* [corpus:rimsky-korsakov ch. III]

  So an undoubled top note is exposed. Adler's Brahms 3 example is exactly this
  failure — *"The flutes can easily overpower the chordal structure, since they are
  the only instruments playing the two highest notes and are not doubled."*
- **Bottom, on strings:** *"**the 'cello is rarely called upon to play chords on
  three or four strings, and is usually allotted the lowest note of the chord in
  company with the double bass.** Chords on the latter instrument are even more
  uncommon, but it may supply the octave on an uncovered string."*
  [corpus:rimsky-korsakov ch. III, *String harmony*]
- **Above brass:** *"**If trumpets and trombones take part in a chord, flutes, oboes
  and clarinets are better used to form the harmonic part above the trumpets.**"*
  [corpus:rimsky-korsakov ch. III]
- **A hole in the top is a defect, a hole in the middle is a worse one:**
  > *"**It is necessary to make sure that the harmonic notes are not lacking in the
  > upper parts.**"* … *"**Nothing is worse than writing chords, the upper and lower
  > parts of which are separated by wide, empty intervals**, especially in *forte*
  > passages; in *piano* passages such distribution may be possible."*

### Which note is omitted when there are fewer players than notes

The corpus is thinner here than on anything else, and the honest answer is in three
parts.

1. **R-K states that omission happens and does not say what to drop:**
   > *"**In seven, six, or five-part harmony certain instruments must be omitted.**"*
   > [corpus:rimsky-korsakov ch. III, *Harmony in the brass*] — followed by two music
   > examples, which are images in the Gutenberg text and therefore unreadable. **The
   > rule is in a picture.**
2. **The harmony teaching that everybody actually uses says: drop the fifth.**
   > *"The fifth (but not the third or seventh) may be omitted in a root-position
   > dominant seventh; if you omit it, double the root so the chord still has four
   > voices."* … *"Never omit chord tones in inverted seventh chords."*
   > [corpus:fiveable *Voice Leading with Seventh Chords*] — a teaching summary, not
   > a treatise. Weak provenance, universal agreement.
3. **The overtone series gives a doubling ratio with actual integers**, which is the
   same rule stated as a preference rather than a prohibition:
   > *"Of the ten triad tones appearing in the series, **there are five roots, three
   > fifths, and two thirds**."* … *"Added doublings and fillers sound best in this
   > preferred order: **octaves (unisons), fifths, and thirds**."*
   > [corpus:orchestrationresources ch. 5b]

   **root : fifth : third = 5 : 3 : 2.** That is a distribution to sample from, not a
   rule to obey, and it is the only numeric answer anyone gives to "double what?".
4. **Adler's one hard exception, and it is about first inversions:**
   > *"it is not common-practice style to double the bass (the third) except when the
   > chordal root is scale degree 1, 2, 4, or 5 … if there are more than four voices,
   > the third of the chord (its bass) would invariably be doubled somewhere to
   > strengthen it. In this case, **it is advisable to double it near the bottom of
   > the texture** to bring out the 'open' sound so characteristic of this inversion."*
   > [corpus:adler ch. 5]

**[CHOSEN] Omission order: fifth, then doubled root, then third. Never the third, and
never the seventh, of a seventh chord. In first inversion the bass note is the third,
and it may be doubled — but only downward.** Ranked by source strength this is the
weakest rule in the sheet and it is the one most likely to be wrong; it is written
down so it can be argued with rather than re-derived.

---

## §5 HOW MANY DIFFERENT TIMBRES MAY TOUCH ONE CHORD

`score-craft.md` §4 has the four-part rules. The **three-part** rule is stronger than
any of them and was missed:

> *"**Chords in three-part harmony are generally given to two instruments of one
> timbre and a third instrument of another, but never to three different
> timbres.**"* [corpus:rimsky-korsakov ch. III]

*Never.* An absolute, in a chapter that otherwise hedges everything. And three-part
is the common case, not the exception: *"writing in three-part harmony … is the most
customary form when it is a question of establishing a harmonic basis, the lowest
register of which is entrusted to another group of instruments."*

| parts | max distinct timbres | canonical form | source |
|---|---|---|---|
| 3 | **2** | 2×A + 1×B, overlaid | *"but never to three different timbres"* |
| 4 close | **2** | 3×A + 1×B, overlaid | *"The use of four different timbres in close four-part harmony is to be avoided"* |
| 4 open | **4**, but degrading | pairs, in register order | *"though such a chord will possess no uniformity in colour"* |
| any, enclosed | the enclosed one must differ from **both** neighbours | A / B B / A | *"If one tone quality is to be enclosed, it must be between two different timbres"* |

With the escape clause on open four-timbre chords, which is a *register* condition
and therefore checkable:

> *"the higher the registers of the different instruments are placed, **the less
> perceptible becomes the space which separates them**"* — R-K's caption reads
> *"Fairly good / Better / Still better"* over three rising versions of the same chord.

And Adler agrees, with the same escape:

> *"In most cases **it is best to avoid using chords in which each note has a
> different timbre**. Such chords are difficult to balance, and often are played out
> of tune. However, **they work better when scored for single winds in a small
> orchestra, particularly if the chord is widely spaced**, allowing each instrument to
> be placed in its most advantageous register."*
> [corpus:adler ch. 8]

**This is directly the case this program is in.** A seven-part texture with one patch
per part *is* "single winds in a small orchestra". Both sources say the same thing:
one-timbre-per-note is legal here **only if the chord is opened up**, and illegal if
it is close. R-K's own precedent: *"In* Mozart and Salieri*, which is only scored for
1 Fl., 1 Ob., 1 Cl. and 1 Fag., wood-wind chords in four-part harmony are of
necessity devoted to these four different timbres."*

Also a hard exclusion list — instruments that may not be handed inner harmony notes
at all. `score-craft.md` §42 quotes the prohibition but drops the qualifier that
makes it usable:

> *"It is nevertheless always written for, in the tutti parts, without paying
> attention to the expression of its timbre, **because there it is lost** … It is the
> same — let it be at once understood — with most other wind instruments. **The only
> exception lies where the sonority is excessive, or the quality of tone markedly
> distinctive.** It is impossible — without trampling under foot both Art and good
> sense — to employ such exceptional instruments as simple instruments of harmony.
> Among them may be ranked trombones, ophicleides, double-bassoons, and — in many
> instances — trumpets and cornets."*
> [corpus:berlioz *Treatise*, Clarke tr., archive.org OCR]

Read whole, Berlioz's rule is **conditional and the condition is a property of the
patch**: in a mass texture an instrument's character is lost and *anyone* may take an
inner note — *except* instruments that are too loud or too distinctive to disappear.
Those are barred. That is an encodable flag, and it is a much more useful rule than
the blanket prohibition §42 currently carries.

---

## §6 SPACING, WITH FREQUENCIES — where a third actually becomes mud

`score-craft.md` §4 gives R-K's zones (bottom 12 or 9 semitones, middle 7 or 5, top
4/3/2) with **no pitch attached to "bottom", "middle" or "top"**. Those words are the
whole problem: they are unimplementable. The **low interval limits** chart supplies
the missing axis — for each interval, the lowest pitch its *bottom note* may occupy.

The chart is engraved, not typeset. The numbers below were extracted by locating the
five staff lines of each system by pixel row, deriving the diatonic step size, and
mapping every notehead and accidental to a named pitch — not by reading it by eye.

| interval | semitones | lowest bottom note | MIDI | Hz |
|---|---|---|---|---|
| unison | 0 | *unlimited* | — | — |
| minor 2nd | 1 | **E3** | 52 | 164.8 |
| major 2nd | 2 | **E♭3** | 51 | 155.6 |
| minor 3rd | 3 | **C3** | 48 | 130.8 |
| major 3rd | 4 | **B♭2** | 46 | 116.5 |
| perfect 4th | 5 | **B♭2** | 46 | 116.5 |
| tritone (A4 / d5) | 6 | **B♭2** | 46 | 116.5 |
| **perfect 5th** | 7 | **B♭1** | **34** | **58.3** |
| minor 6th | 8 | **G2** | 43 | 98.0 |
| major 6th | 9 | **F2** | 41 | 87.3 |
| diminished 7th | 9 | **F♯2** | 42 | 92.5 |
| minor 7th | 10 | **F2** | 41 | 87.3 |
| major 7th | 11 | **F2** | 41 | 87.3 |
| octave | 12 | *unlimited* | — | — |
| minor 9th | 13 | **E2** | 40 | 82.4 |
| major 9th | 14 | **E♭2** | 39 | 77.8 |
| minor 10th | 15 | **C2** | 36 | 65.4 |
| major 10th | 16 | **B♭1** | 34 | 58.3 |

[corpus:robin-hoffmann *Low Interval Limits*, Daily Film Scoring Bits]

**The direct answer to "at what pitch does a third become muddy":** a major third
below **B♭2 / 116.5 Hz**, a minor third below **C3 / 130.8 Hz**. Not "in the low
register". Those are the numbers.

### Three things this table says that the adjectives do not

1. **The limit tracks CONSONANCE, not width, and the ordering is not monotonic.** A
   perfect fifth is safe **a full octave lower** than a perfect fourth (B♭1 vs B♭2)
   and lower than a minor sixth, a major sixth and both sevenths. So *"open it up"*
   is not a valid repair below B♭2 — widening a fourth to a sixth makes it worse. Any
   implementation must key on the actual interval, not on a width threshold.
2. **It contradicts `score-craft.md` §4's own table.** §4 groups *"fifths and
   fourths"* together as the middle-register intervals, on R-K's authority. The
   limits put them **twelve semitones apart**. Both cannot be encoded. **[CHOSEN] keep
   R-K's zones as the *shape* of the voicing and the interval limits as the *veto*.**
   The zones say what to aim for; the limits say what is forbidden. They disagree
   only about the fourth, and the limits are the more specific claim.
3. **It corroborates R-K's bass rule from an unrelated direction.** R-K: *"wide
   intervals (octaves and sixths) in the bass part"*. The limits: the octave is
   unlimited and the major sixth is safe to F2/87 Hz — those are precisely the two
   widest safe intervals down there. Two sources, no shared lineage, same answer.

### The caveats, from the same page, verbatim

> *"These are not definitive rules but a good guide to avoid muddiness."*
> *"**The amount of mud a voicing generates is highly depending on its dynamic and how
> many higher harmonics the sound contains. So soft low voicings on for instance
> strings are more forgiving than loud ones on brass.**"*
> [corpus:robin-hoffmann]

**Which is R-K's own loudness gate, restated in acoustic terms** — *"especially in
forte passages; in piano passages such distribution may be possible"*. The two
independent statements of a dynamic-conditional spacing rule are the strongest reason
to believe the table at all.

### The classical spacing rule, which is about ADJACENT VOICES and has one number

> *"keep the distance between soprano and alto as well as the distance between alto
> to tenor **within an octave** of each other."* … *"The distance from the bass to the
> tenor can be greater than an octave."* … *"Allowing a distance greater than an
> octave between soprano and alto (or between alto and tenor) **is considered spacing
> error**."*
> [corpus:musictheory.pugetsound *Rules of Spacing*]

**And this contradicts Rimsky-Korsakov on the one voice it names.** R-K: *"**The bass
should rarely lie at a greater distance than an octave from the part directly above
it** (tenor harmony)."* The chorale rule frees the bass; R-K binds it. **[CHOSEN] take
R-K's** — this is orchestration, not four-part vocal writing, and R-K's whole
argument in that paragraph is that the empty middle is the audible defect. Recorded
as a live disagreement, not a resolution.

Orchestral corroboration for the ≤ octave figure, from a working orchestrator:

> *"adjacent voices don't exceed an octave"*, with *"the bass function"* as the
> exception allowing larger gaps. [corpus:robin-hoffmann *Homogenous (String)
> Voicings*] — same rule, same exception, same disagreement with R-K about the bass.

### And the one rule about extensions with a named pitch

> *"**Keep chord extensions, downward from middle C, in open position**"* and
> *"**Arrange chord extensions, upward from middle C, in close position.**"*
> *"it is advisable to keep **thirds, sevenths, and ninths out of the bass range**
> when used as sustained harmony parts."*
> [corpus:orchestrationresources ch. 5b]

**Middle C (MIDI 60) is the hinge.** Below it, open; above it, close. That is the
overtone-series principle reduced to one comparison, and it is the cheapest possible
implementation of `score-craft.md` §4.

The one interval that gets its own prohibition regardless of register:

> *"The minor ninth is considered the '**last dissonant interval**', even more than a
> minor second. Therefore it should be handled with care in any chord voicing."* … it
> *"will often dominate the rest of the chord structure and weaken its transparency"*,
> **particularly in sustained orchestral chords** — with the exception that in
> **dominant** chords minor ninths *"can sound lovely"*.
> [corpus:robin-hoffmann *Minor Ninths*]

---

## §7 CROSSING — when it is allowed, and the one prohibition that is absolute

Crossing is legal. Random crossing is not, and R-K says so in as many words:

> *"**Crossing of parts must not be effected at random.** The arrangement of choral
> parts follows the natural order of register and **can only be altered for short
> spaces of time to give momentary prominence** to some melodic or declamatory
> phrase."*
> [corpus:rimsky-korsakov ch. VI]

> *"**Crossing of parts is rare and should only be done with the intention of
> emphasising the melody in the ascending voices above those adjacent in register**,
> e.g. the tenor part above contralto, the mezzo-soprano above the soprano, etc."*

So the permission has a **purpose test and a duration test**: crossing is licensed
only to lift a melodic part above its neighbour, and only briefly. Everything else
is the error already recorded in `score-craft.md` §5 — *"Deviation from the natural
order … creates an unnatural resonance occasioned by the confusion of registers, the
instrument of lower compass playing in its high register and vice versa."*

The mechanical reason crossing is worse than overlaying, which is a *checkable*
condition and not a matter of taste:

> *"**Crossing of parts is not so favourable, as octaves will be produced contrary to
> the natural order of register.**"*
> [corpus:rimsky-korsakov ch. III, wood-wind in three's]

When crossing IS the right answer, both times R-K recommends it, it is for **blend
across a family boundary**, and the note it moves is chosen by rule 4 of §4:

> *"crossing of parts is to be recommended for the purposes of blend, the concords
> being given to the horns, the discords to the bassoons"* — and the asymmetry that
> follows it: *"**Bassoons may also be written inside the horns, but the inverse
> process is not to be recommended.**"* … *"Clarinets, on account of their tone
> quality **should rarely be set inside the horns**."*

**Enclosure is directional.** B-inside-A does not imply A-inside-B. Which way round
is legal is a property of the pair, not of the chord.

**[CHOSEN] Crossing is permitted only when (a) the crossing voice carries the melody
or the moving part, and (b) it reverts within the phrase. Enclosure is permitted only
when the enclosed timbre differs from both neighbours and the direction is the
sanctioned one.** Both are gates on an *existing* overlaid assignment, never the
starting point.

---

## §8 THE STATIONARY / MOVING SPLIT — the full argument, and it is stated twice

`score-craft.md` §42 quotes one half. There are two statements, at different scopes,
and read together they are a complete rule.

**The general form**, from the wood-wind chapter, given as the *second* of the two
things you must consider when choosing among overlaying/crossing/enclosure:

> *"b) **In a succession of chords the general progression of parts must be
> considered; one tone quality should be devoted to the stationary and another to
> the moving parts.**"*
> [corpus:rimsky-korsakov ch. III, *Four-part and three-part harmony*]

**The specific form**, with the instruments named and the polarity fixed:

> *"**In a chain of consecutive chords it is advisable to entrust the stationary parts
> to the brass, the moving parts to the wood-wind.**"*
> [corpus:rimsky-korsakov ch. III, *Combination of wind and brass*]

Two things follow that the first quote alone does not give:

1. **The split is a property of a CHAIN of chords, not of one chord.** It cannot be
   computed from a single harmony. It requires looking at the next chord and
   partitioning the notes into those that hold and those that move — which is a pure
   function of the chord *sequence* the program already has, exactly as §42 claims.
2. **The polarity is not symmetric.** The *sustaining, blending* colour holds; the
   *articulate, mobile* colour moves. Brass holds, wind moves. Mapped onto this
   program's patch taxonomy, the pad-like patch takes the common tones and the
   agile patch takes the changing ones — never the reverse, or the moving line is
   smeared by the wrong envelope.

R-K's own worked examples of the technique are labelled in his index: *"harmonic
parts in motion, Fl. and Cl."* (*The Tsar's Bride* [166]), *"harmonic parts in
motion: Fl. and Cl."* (*The Golden Cockerel* [156]), *Legend of Kitesh* [136].
They are score references, not notation this sheet can read.

**Why this is the highest-leverage rule in the sheet for a 7-part program.** It halves
the problem. The stationary notes need no re-assignment between chords — they are
literally the same pitches on the same voice — so only the moving subset has to be
dealt out. And it removes the retrigger that `score-craft.md` §40 identifies as the
whole legato defect: a held note that is *not re-struck* is a held note, and the
program currently re-strikes everything on every chord change.

---

## §9 ALTERNATION BETWEEN GROUPS — the technique, and the only numbers anyone has

The sentence `score-craft.md` §42 quotes, in its full context:

> *"1. **The most usual practice is to employ chords on different groups of
> instruments alternately.** In dealing with chords in different registers **care
> should be taken that the progression of parts, though broken in passing from one
> group to another, remains as regular as if there were no leap from octave to
> octave**; this applies specially to chromatic passages in order to avoid false
> relation."*
> [corpus:rimsky-korsakov ch. IV, *Chords of different tone quality used alternately*]

**The constraint is on the LINE, not the group.** The parts must lead correctly
*through* the handover as if no handover had occurred — including across octave
displacement. That is a concrete check: take the two groups' notes as one virtual
part-set and test the voice-leading of the concatenation.

With a licensed exception, which is the interesting half:

> *"The rules regulating progression of parts **may sometimes be ignored, when extreme
> contrast of timbre between two adjacent chords is intended**."*

R-K's second method, and it is a *different* operation:

> *"2. Another excellent method consists in transferring **the same chord or its
> inversion** from one orchestral group to another. … **The first group strikes a
> chord of short value, the other group takes possession of it simultaneously in the
> same position and distribution, either in the same octave or in another. The
> dynamic gradations of tone need not necessarily be the same in both groups.**"*

So: **alternation** = different chords, different groups, one line. **Transfer** =
same chord, handed over, short-then-sustained, dynamics may differ. The second is a
one-line implementation and it is the cheapest sustain-without-breath trick in the
sheet.

### And here the corpus finally has counts

**[MEASURED]** 7900 annotations, 24 first movements, Haydn / Mozart / Beethoven:

| finding | number |
|---|---|
| bars carrying a **sustained-harmony** layer at all | **66%** |
| the harmony role sits on **woodwinds** | **46%** |
| the harmony role sits on **brass** | **24%** |
| of all layers containing the **horn**, share that are harmony | **47%** (vs 21% average for other instruments) |
| call-and-response schemes per movement | **15.3** |
| call-and-response that is **cross-family** | **> 70%** |
| — of which **strings ↔ woodwinds** | **48%** |
| **intra-family** call-and-response | **below 25%** |
| cellos + contrabasses in the same layer when both playing | **91%** |
| parts within a layer in **unison/octave doubling** | **29%** |
| parts within a layer in **homorhythm** | **24%** |
| parts within a layer in **parallel motion** (3rds/6ths) | **9%** |

[corpus:le-giraud-leve-maccarini DLfM 2022]

**Alternation is cross-family by a factor of three.** That is the number the question
"how is alternation actually done" was asking for: you do not alternate flute against
oboe, you alternate *winds against strings*. And 15.3 exchanges per first movement is
a rate: across a whole sonata-form first movement, **fifteen exchanges**. That is a
form-level device — a handful per section — not a bar-level one. The source gives the
count per movement and not per bar, so the per-bar rate is not derivable from it and
is not stated here.

The same source's own naming, showing that the modern taxonomy and R-K's are the
same object: *"Called 'transference of passages and phrases' by Rimsky-Korsakov, or
'antiphonal writing' by Adler."*

**And alternation pays for breath at no cost** — each group rests while the other
sounds (`score-craft.md` §41's budget refills). That claim is this repo's, not a
source's, and it is marked as such.

---

## §10 DIVISI — and the one case where it is forbidden

`score-craft.md` §5 has Berlioz's rule (split within a section, never across two
sections). Three additions, all of them procedural.

**1. Divide all or divide none. R-K's rule, and it has a mechanism attached:**

> *"**The method of dividing strings, which is sometimes adopted, should be avoided in
> such cases, as certain parts of the chord will be divided and others will not**;
> but, on the other hand, **if a passage in six and seven-part harmony be written
> entirely for strings divided in the same manner, the balance of tone will be
> completely satisfactory**"* — with the layout printed:
> `div. { Vns I / Vns I` · `div. { Vns II / Vns II` · `div. { Violas I / Violas II`
> [corpus:rimsky-korsakov ch. III, *String harmony*]

The reason is arithmetic: a divided section puts **half the players** on each note. A
chord where some parts are divided and others are not is a chord with a 2:1 loudness
error built into it. And the fix for the residue is a count, not a marking:

> *"If the harmony in the three upper parts, thus strengthened, is written for divided
> strings, the 'cellos and basses, playing *non divisi* will prove a trifle heavy;
> their tone must therefore be eased, **either by marking the parts down or reducing
> the number of players**."*

**2. Divisi weakens a line, and Adler names the line it weakens:**

> *"usually the second violins, violas, and cellos are divided while the violins are
> not, since **divisi would weaken the first violin line**."*
> [corpus:adler ch. 5, on Tchaikovsky]

**[CHOSEN] The melody-carrying voice never divides. Inner voices divide first, and
they divide together.**

**3. Divisi is the orchestral substitute for hard multiple stops, and this is why the
section/soloist flag matters:**

> *"most difficult double stopping is reserved for solo and possibly chamber music.
> In orchestral writing, only the most easily accessible double stops are usually
> used … Since a conventional symphony orchestra has at least sixteen first violins
> and fourteen second violins, **passages that would be quite difficult for one
> performer are quite simple when played divisi.**"*
> [corpus:adler ch. 3]

**Divisi ≠ doubling, and the difference is a count.** Doubling adds players to a note
and makes it louder. Divisi splits existing players across notes and makes each
quieter. `score-craft.md` §1's `STACK_OK` table is about doubling; nothing in this
program expresses the other operation, and the two must not share a code path.

---

## §11 WHAT A WIND SECTION CAN DO THAT A WIND PLAYER CANNOT

The wind equivalent of `score-craft.md` §49–§52's bow rules, stated as capabilities
rather than limits:

| capability | soloist | section | source |
|---|---|---|---|
| pitches at once | **1** | 1 per player | *"Each wind player is given a separate part"* [corpus:adler] |
| notation for splitting | **none** | **none** — you write more parts | *"The term divisi should not be used in wind or brass parts"* [corpus:adler] |
| unbroken sustain | no — breath | **yes**, by staggering | `score-craft.md` §41 |
| unison thickening | n/a | changes *kind*, not degree | below |
| chord across a family | n/a | **yes**, by alternation | §9 |

The one that is not in `score-craft.md` at all and matters for chord writing:

> *"there is a **qualitative change** when a line is assigned to two or more of the
> same instrument in unison, **more than a quantitative one: three oboes are not even
> twice as loud as one**, but the quality of sound becomes that of a little chorus,
> due to unavoidable differences in intonation. **A line whose character requires a
> solo sound will be less effective when doubled**, due to this difference in
> character."*
> [corpus:belkin *Artistic Orchestration*]

**Three oboes are less than twice one oboe, and they are a different instrument.**
That is the counterweight to `score-craft.md` §3's loudness table: doubling a wind to
match a brass does not work by arithmetic, it works by changing what the wind is.

And the reason massed winds are the hard case in the first place, which is a *timbre*
argument and therefore an argument about assignment:

> *"The main problem in writing for woodwind occurs when they are massed, due to
> their **disparity of timbres, both within individual instruments (in different
> registers) and between them**: This makes it hard to use them in blended harmonic
> blocks. A good policy is to consider **each woodwind as being three instruments in
> one: a high, a middle, and a low timbre.** Combinations that work well in one
> register can be quite odd in another."*
> *"generally **the oboe is the instrument most likely to hurt the overall blend.** It
> will definitively color any combination, for better or for worse."*
> [corpus:belkin *Artistic Orchestration*]

**Belkin's "three instruments in one" is the encodable form of R-K's rule 3**
(*"corresponding or adjacent registers should be made to coincide"*). A patch's
identity for blend purposes is (patch, register-band), not patch. This program's
`family` field cannot say that today.

---

## §12 STRING CHORDS — the numbers, and how they differ from winds

`score-craft.md` §49 has the load-bearing one (struck 4, held 2). What it does not
have:

| rule | number | source |
|---|---|---|
| triple stop, simultaneous attack | only at **f or mf**; at p it must be arpeggiated | [corpus:adler ch. 2] |
| quadruple stop | **always** arpeggiated, at every dynamic | [corpus:adler ch. 2] |
| best multiple stops | contain **one or two open strings** | [corpus:adler ch. 2] |
| cello double stops | **larger than a sixth are difficult** in low positions | [corpus:adler ch. 3] |
| double bass | **only double stops that include an open string are practical** | [corpus:adler ch. 2] |
| double bass, orchestral | avoid multiple stops entirely — *"the thick, muddy sound of close double stops (seconds, thirds) in any lower register"* | [corpus:adler ch. 6] |
| 3- and 4-note string chords | *"can only be executed rapidly"*; *"only sound well when played forte (sf), and when they can be supported by wind instruments"* | [corpus:rimsky-korsakov ch. III] |
| in short string chords, the priorities invert | *"balance, perfect distribution of tone, and correct progression of parts are of **minor importance**. What must be considered before everything is **the resonance of the chords themselves, and the degree of ease with which they can be played**"* | [corpus:rimsky-korsakov ch. III] |

That last row is the sharpest difference from the winds and it **reverses §3's
priority order**: for short struck string chords, playability outranks voice-leading,
which outranks nothing. R-K states the same inversion twice — *"In the case of
sustained chords or forte tremolando on two strings, **the progression of parts is
not always according to rule, the intervals chosen being those which are the easiest
to play**."*

**So the string/wind difference is not one rule, it is two different rule sets
selected by note length**:

- **short, struck** → resonance and ease dominate; multiple stops allowed; up to 4
  notes on one player; assignment barely matters.
- **sustained** → *"the resources are limited to double notes* unis*, or division of
  parts"*, balance dominates, and all of §3–§7 applies exactly as for winds.

Which is R-K's own division of the section: *"Both these cases will be studied
separately."*

---

## §13 THE COMPUTATIONAL LITERATURE — what it actually gives, which is less than it sounds

**There are two distinct fields and only one of them is about this problem.**

**Target-based computer-assisted orchestration (Orchidée → Orchidea, IRCAM/Berkeley).**
Formalised as *"a multi-objective 0/1 knapsack problem, with additional constraints
and a case-specific criteria formulation"*, solved by *"hybridiz[ing] genetic search
and local search"*; the modern system uses *"stochastic matching pursuit, long
short-term memory neural networks, and mono-objective evolutionary optimization,
with a specifically designed cost function"*.
[corpus:carpentier-assayag-saint-james *J. Heuristics* 16(5) 2010; corpus:cella et al.
*Orchidea*, JNMR 2022]

**This is the wrong problem for this program.** Its input is a *recorded target
sound* and its objective is spectral distance to that sound. There is no chord, no
voice-leading, no part. The one transferable idea is the framing — orchestration as
constrained combinatorial optimisation over a multiset of (instrument, pitch,
dynamic, technique) atoms — which is exactly §3's framing arrived at independently.

**Automated arrangement for monophonic instruments** is the right problem, and it is
a much smaller literature. The one paper that states it cleanly:

> *"For our discussion, **a monophonic instrument is one that can only play one pitch
> at a time, such as the flute, the oboe, or a voice.** Polyphonic instruments can
> play multiple notes simultaneously, such as the piano, guitar, or harp. **A
> polyphonic instrument can always play a monophonic part within its range.**"*
> [corpus:mccloskey-curcio-badineni-mcgrath-papamichail arXiv:2301.12084]

Their algorithm and its **objective function**, which is the only published
tie-break rule for instrument assignment found anywhere:

> *"Our recursive backtracking algorithm **exhaustively examines all feasible
> assignments of parts to available instruments** and all possible transpositions of
> the piece, including independent octave transpositions of individual parts."*
> *"the best arrangement is selected based on **how closely the average pitch of each
> part matches the median pitch of the instrument's range.**"*

**Minimise Σ |mean(part) − median(range)|.** That is a procedure, it is trivially
implementable, and it is the computational restatement of Adler's *"Assign pitches to
the instruments within their best registral positions"*. It is also the whole of
their musical knowledge — the paper states plainly: *"Our algorithm does not control
for instrument timbre that may be expected in any part of the music; similarly, the
thickness of the piece is not being necessarily maintained."*

**[CHOSEN] Use the register-centring cost as the assignment objective and the rules of
§4–§7 as hard constraints on top of it.** The literature supplies a cost function and
no constraints; the treatises supply constraints and no cost function. Neither half
is usable alone and they compose without conflict.

---

## §14 WHAT NOBODY GIVES

Recorded so nobody hunts for these again.

- **No source gives a rule for which chord tone to drop, in orchestration.**
  Rimsky-Korsakov says *"In seven, six, or five-part harmony certain instruments must
  be omitted"* and then prints two music examples — which are **images** in the
  Gutenberg text. **The one rule that would be most directly encodable is in a
  picture.** §4's omission order is assembled from a harmony teaching page and an
  overtone-series ratio, and is the weakest thing in this sheet.
- **No source gives a timing for alternation.** The measured corpus gives a *rate*
  (15.3 exchanges per first movement) and a *partner* (cross-family, 70%+), but
  nothing says how long a group holds before handing over. R-K's only temporal words
  are *"a chord of short value"* for the transfer case.
- **The low interval limits chart cites no source.** It is one orchestrator's chart.
  Its *shape* is corroborated by Rimsky-Korsakov's bass rule and by the
  middle-C-hinge rule; its *individual numbers* are corroborated by nobody. Nothing
  else found gives interval limits as pitches at all — every other source says
  "muddy", "thick", "low register".
- **No frequency-domain justification was found.** The limits look like a critical-band
  curve and are certainly related to one, but no source consulted derives them from
  anything. Do not write that connection into a comment as if it were sourced.
- **Kennan & Grantham, Blatter, Piston, and Casella & Mortari were not obtained.**
  Kennan's ch. 10 is titled *"Scoring Chords for Each Section and for Orchestra"* and
  is exactly this sheet's subject; it is in print, paywalled, and returned nothing
  quotable. Piston's *Orchestration* likewise — the only Piston material reached is
  second-hand through Belkin (*"horns are best treated in the general spirit of the
  natural instrument"*) and through the DLfM corpus's citations.
- **Open Music Theory's own orchestration and jazz-voicings chapters 403'd**, twice,
  on two different hosts — the same failure `score-craft.md` §47 already records.
- **No source distinguishes a solo wind from a wind section for CHORD purposes.**
  Everything found is about sustain (§11) or loudness. Whether a 2-player section
  should be handed two chord tones or one doubled tone is not answered anywhere.

---

## §15 THE PROCEDURE, ASSEMBLED

Everything above, in the order it would run. Rules are cited to the section that
justifies them; nothing here is new.

**Input:** a chord (pitch-classes + a bass), the previous chord, a set of voices each
with (patch, register-band, natural centre, polyphony ∈ {1, N, ∞}).

1. **Partition by motion** (§8). Split the chord's notes into *stationary* (held from
   the previous chord) and *moving*. Stationary notes keep their voice and **are not
   re-struck**. Only moving notes are dealt.
2. **Reduce to four real parts** (`score-craft.md` §1). Everything beyond four is a
   doubling and is decided later, by `STACK_OK`, not here.
3. **Fix the count of pitch-slots.** Winds: 1 per voice, no exceptions (§1). Strings:
   choose section-divided (all or none, §10) or multiple-stopped (§12) by note length.
4. **Sort by natural centre, descending** (§2, `score-craft.md` §5). This produces the
   overlaid assignment. It is the default and it is the answer unless something below
   overrides it.
5. **Apply the timbre-count cap** (§5): 3 parts → 2 timbres, never 3. 4 close → 2. 4
   open → up to 4, and only if the chord is genuinely open.
6. **Apply rule 4** (§4): same-timbre pairs take octaves/3rds/6ths; cross-timbre pairs
   take 5ths/4ths/2nds/7ths. If this requires a swap, that swap is a **crossing** and
   must pass §7.
7. **Veto on register** (§4): reject any assignment putting a voice's weak band
   against another's piercing band; reject any note outside a voice's band.
8. **Veto on spacing** (§6): reject any adjacent pair whose interval falls below its
   low interval limit. Reject an adjacent-upper-voice gap greater than an octave.
   Reject an empty middle at forte; permit it at piano.
9. **Break ties by register-centring** (§13): minimise Σ |assigned pitch − voice's
   band centre|.
10. **Check the line** (§3). If the resulting part motion is bad, **discard the
    distribution and take the worse one** — *"distribution is subordinate to correct
    progression of parts"*. This is the only step that can override any other.
11. **Hold the assignment constant for the passage** (§4 rule 1): *"they must be
    doubled or not throughout"*. Re-solving per chord is itself a defect.

**The three cheapest wins, in order**, for a program that currently strikes blocks:

1. **Step 1 alone.** The stationary/moving split needs only the chord sequence, and it
   removes both the impossible polyphony and the spurious retrigger at once.
2. **Step 8's interval-limit table.** 18 rows, a lookup keyed on (interval, bottom
   MIDI note), no state.
3. **§9's transfer** — *"the first group strikes a chord of short value, the other
   group takes possession of it"*. One line, and it buys the breath model in §41 for
   free.

---

## Sources

- [Rimsky-Korsakov, *Principles of Orchestration* — Project Gutenberg #33900](https://www.gutenberg.org/cache/epub/33900/pg33900.txt) — **Chapter III, "Harmony"** is the spine of this sheet: *Distribution of notes in chords*, *String harmony*, *Wood-wind harmony*, *Harmony in the brass*, *Harmony in combined groups*; and **Chapter IV**, *Chords of different tone quality used alternately*
- Adler, *The Study of Orchestration*, 3rd ed., W. W. Norton — chs. 2, 3, 5, 6, 8, 15 (OCR held in this session's scratchpad from earlier work; wording checked, pagination not)
- [Berlioz, *A Treatise upon Modern Instrumentation and Orchestration*, Clarke tr. — archive.org](https://archive.org/details/treatiseonmodern00berl) *(OCR, textually unreliable, flagged where used)*
- [Belkin, *Artistic Orchestration*](https://www.alanbelkinmusic.com/) — massed woodwind, unison doubling, planes of tone
- [Le, Giraud, Levé & Maccarini, *A Corpus Describing Orchestral Texture in First Movements of Classical and Early-Romantic Symphonies*, DLfM 2022 — HAL hal-03663112](https://hal.science/hal-03663112v1) — the only measured numbers in the sheet
- [McCloskey, Curcio, Badineni, McGrath & Papamichail, *Automated Arrangements of Multi-Part Music for Sets of Monophonic Instruments*, arXiv:2301.12084](https://arxiv.org/abs/2301.12084) — the register-centring objective
- [Cella et al., *Orchidea: a comprehensive framework for target-based computer-assisted dynamic orchestration*, JNMR 2022](https://www.orch-idea.org/) and [Carpentier, Assayag & Saint-James, *Solving the musical orchestration problem…*, J. Heuristics 16(5), 2010](https://hal.science/hal-01176408) — the knapsack framing, and why it is the wrong problem here
- [Robin Hoffmann, *Low Interval Limits* — Daily Film Scoring Bits](https://www.robin-hoffmann.com/dfsb/low-interval-limits/) — the chart in §6, read off the engraving; also [*Minor Ninths*](https://www.robin-hoffmann.com/dfsb/minor-ninths/) and [*Homogenous (String) Voicings*](https://www.robin-hoffmann.com/dfsb/homogenous-string-voicings/)
- [*Spacing and Balance* — Orchestration Resources ch. 5b](https://www.orchestrationresources.com/introduction-chapters/chapter-5b-spacing-and-balance) — the 5:3:2 overtone doubling ratio and the middle-C hinge
- [*Rules of Spacing* — Music Theory for the 21st-Century Classroom, Puget Sound](https://musictheory.pugetsound.edu/mt21c/RulesOfSpacing.html) — the ≤ octave adjacent-voice rule, and its disagreement with Rimsky-Korsakov about the bass
- [*Voice Leading with Seventh Chords* — Fiveable](https://fiveable.me/ap-music-theory/unit-4/voice-leading-with-seventh-chords/study-guide/XpRYmaLewSzb1mJjUNZX) — the omit-the-fifth rule; weakest provenance in the sheet, marked as such in §4
- `docs/genre-research/score-craft.md` §1, §2, §4, §5, §6, §7, §41, §42, §47, §48–§52 — the principles this sheet turns into a procedure
- `docs/genre-research/the-arrival-of-a-dissonance.md` — the house form followed here
