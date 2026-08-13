# THE METRE IS NOT ALWAYS FOUR — 3/4, 6/8, 9/8 and 12/8, sourced

*Researched 2026-08-13, for the decision to make steps-per-bar a genre
declaration. `lotr-themes-measured.md` §5.2 has carried the row since
2026-08-11:*

> *"**Two of the four are not in 4/4.** The Shire is 3/4 and Rohan is 6/8. The
> program's grid is sixteen steps to a bar — a four-beat assumption baked so deep
> that 'the meter is 3' is not currently expressible."*

*This sheet is the theory that has to be right BEFORE any number is picked. It
does not propose a build and it does not pick any genre's metre. It establishes
four things: what the metrical hierarchy of each metre actually is, in the array
form `METRE_DEPTH` already uses; why 6/8 is two beats and not six and not three;
how many steps a bar of each metre holds; and what a tempo number is counting
when the metre stops being 4/4.*

---

## §0 HOW THIS SHEET WAS MADE AND HOW MUCH TO TRUST IT

**Fresh research. Nothing in it is from memory.** Every claim below is either a
quotation from a named source or is marked as derived, with the premises it is
derived from named and quoted.

**The hierarchy tables in §2 are DERIVED, not quoted.** No source I could reach
prints a depth-per-step array for 3/4, 6/8, 9/8 or 12/8 — that exact object
appears to be a programmer's format, not a theorist's. What the sources *do*
give is (a) the rule that generates the levels, (b) the beat count of each
metre, and (c) **the finished array for 4/4** — which the derivation reproduces
byte for byte from the same rule. That reproduction is the only reason the
compound tables are offered as anything better than a guess, and §2.3 shows it
explicitly rather than asserting it.

**Standing of the sources, honestly graded**, because they are not equal:

- **Peer-reviewed / published**: Fitch & Rosenfeld 2007 (*Music Perception*),
  Palmer & Krumhansl 1990 (*JEP:HPP*), Vuust & Witek 2014 (*Frontiers in
  Psychology*), Murphy 2016 (*Music Theory Online*) quoting Lerdahl & Jackendoff
  1983 with a page number. These carry §1 and §2.
- **University-published pedagogy**: Open Music Theory (Anatone/Gotham et al.),
  Butterfield's *Inquiry-Based Music Theory*. These carry the compound/triple
  distinction and beaming.
- **Trade and enthusiast**: Human Kinetics' textbook excerpt, Wikipedia, an
  Ableton forum thread, an Irish-dance tempo compendium hosted at U. Helsinki.
  These are used **only** for repertoire facts and conventions, never for
  theory, and are tagged so you can see which is which. One of them
  (Human Kinetics) **states the 6/8 fact wrongly** and is reported in §1.4 as a
  worked example of the failure this build is most likely to make.

**What I did not reach**: Lerdahl & Jackendoff's *GTTM* itself, London's
*Hearing in Time* beyond its introduction, Cooper & Meyer, Gould's *Behind
Bars*, and Longuet-Higgins & Lee 1984 in the original. §7 says what each of
those absences costs.

---

## §1 COMPOUND IS NOT TRIPLE, AND THIS IS THE WHOLE BUILD

If one paragraph of this sheet survives, make it this one.

### 1.1 The definition, from three independent sources

> **"Compound meters are meters in which the beat divides into three and then
> further subdivides into six."**
> [corpus:openmusictheory *Compound Meter and Time Signatures*]

> **"Compound meter is a regular meter in which the beat is divided into three
> equal parts."**
> [corpus:butterfield *Inquiry-Based Music Theory*, Lesson 4b]

> "compound meters like **6/8 in which the duple tactus is divided into three at
> the eighth note level**"
> [corpus:vuust-witek *Frontiers in Psychology* 5:1111]

Note what all three define: the **beat**, and what it divides into. Not the bar,
and not the number of eighth notes.

### 1.2 So 6/8 has TWO beats — stated as arithmetic, not as a feel

> **"In this time signature, each measure has two beats (6÷3=2), indicating duple
> meter."**
> [corpus:openmusictheory *Compound Meter and Time Signatures*]

> "Just as with simple meters, **compound duple meters have only two beats,
> compound triple meters have three beats, and compound quadruple meters have
> four beats**."
> [corpus:openmusictheory, ibid.]

> "**To find the number of beats in a compound time signature, divide the top
> number by 3.** [...] duple has 2 strong beats with 3 eighth notes per beat.
> ex: 6/8 — triple has 3 strong beats with 3 eighth notes per beat. ex: 9/8 —
> quadruple has 4 strong beats with 3 eighth notes per beat. ex: 12/8"
> [corpus:butterfield, ibid.]

And the beat unit:

> "Because beats in compound meter divide into three, they are always dotted.
> [...] **If 8 is the bottom number, the beat is a dotted quarter note**
> (equivalent to three eighth notes)."
> [corpus:openmusictheory, ibid.]

### 1.3 And 3/4 is the other thing entirely

> "**Simple meters** are meters in which the beat divides into two, and then
> further subdivides into four. [...] In simple meters, the top number of a time
> signature represents the **number of beats** in each measure, while the bottom
> number represents the **beat unit**. [...] the top number is always 2, 3, or 4,
> corresponding to duple, triple, or quadruple beat patterns."
> [corpus:openmusictheory *Simple Meter and Time Signatures*]

3/4 is therefore **three quarter-note beats, each dividing into two**. 6/8 is
**two dotted-quarter beats, each dividing into three**. The two metres hold the
same number of eighth notes and agree about **nothing else**.

The division-level accent is stated as a contrast, in one sentence, by the same
source:

> "**In simple meters, the beat divides into two parts, the first accented and
> the second non-accented. In compound meters, the beat divides into three parts,
> the first accented and the second and third non-accented.**"
> [corpus:openmusictheory *Compound Meter and Time Signatures*]

### 1.4 A PUBLISHED SOURCE GETS THIS WRONG, AND IT IS WORTH SEEING

A textbook excerpt from Human Kinetics, a real publisher, says:

> ⚠ "6/8 is a compound duple meter. **There are six beats per measure.** It is
> counted 1, 2, 3, 4, 5, 6. Yet in faster tempos the first three counts can be
> counted as 1 and the second three counts can be counted as 2. [...] **However,
> 6/8 time can also be felt as a triple meter and is used in waltzes.**"
> [corpus:humankinetics *Learn four types of time signatures*]

The first sentence contradicts its own second sentence — "compound duple" and
"six beats per measure" cannot both hold — and the last sentence is the exact
error this build must not make: 6/8 is not a waltz metre, a waltz is 3/4 (§5.3).
**This is what getting it wrong looks like in print.** It is quoted here so that
if the program ever emits a 6/8 that groups 2+2+2, there is a named example of
the same mistake to recognise it by.

### 1.5 AND THE DISTINCTION HAS BEEN MEASURED, NOT ONLY ASSERTED

This is the strongest single item in the sheet, because it is empirical rather
than definitional. Palmer & Krumhansl counted where notes actually fall in
twenty bars each of Bach, Mozart, Brahms and Shostakovich, in four metres, and
ran a Fourier analysis over the resulting distributions:

> "For the **3/4** meter, the periodicities of **every two (72%) and four (11%)**
> subdivisions (corresponding to each eighth note and quarter note) were
> strongest. [...] Finally, for **6/8** meter, the periodicities of **every two
> (88%) and six (6%)** subdivisions (corresponding to **each eighth note and
> dotted quarter note**) were strongest."
> [corpus:palmer-krumhansl 1990, *JEP:HPP* 16(4), p. 731]

Both metres are measured on a **twelve-sixteenth grid** (§4). In 3/4 the strong
periodicity above the eighth is **4 steps** — the quarter-note beat, three per
bar. In 6/8 it is **6 steps** — the dotted quarter, two per bar. **The 4-step
periodicity does not appear in the 6/8 data at all.** Composers do not put a beat
there, and listeners do not hear one there.

That is 3-against-2 stated as a measurement, and it is the number that says
"a jig is not three in a bar" without appealing to anyone's ear.

---

## §2 THE HIERARCHY TABLES — the load-bearing item

### 2.1 The rule that generates the levels, sourced

> "Fred Lerdahl and Ray Jackendoff's MWFR (Metric Well-Formedness Rule) 4 states
> "**[a]t each metrical level, strong beats are spaced two or three beats
> apart**" (1983, 69). David Temperley's MWFR 2 is essentially the same,
> requiring that "[e]xactly one or two beats at a given level must elapse between
> each pair of beats at the next level up" (2001, 37). Hasty (1997, 131–32)
> writes "[p]resented with a series of 'objectively' homogenous pulses (at a
> moderate tempo), we will spontaneously create groups of two or three (or
> multiples of two or three) and not groups of five or seven.""
> [corpus:murphy *MTO* 22.3, note 4 — quoting Lerdahl & Jackendoff 1983 p. 69,
> Temperley 2001 p. 37, and Hasty 1997] **`[three sources, one footnote]`**

And the recursive-subdivision framing, from a peer-reviewed paper:

> "**Hierarchical meters are organized by the recursive subdivision of each
> metric level, both above and below the main pulse (or tactus).** [...] In 4/4,
> the metric hierarchy is duple. Each level – from the whole-note level to the
> level of 16th notes – is recursively subdivided into two equal parts. The ways
> of subdividing each metrical level vary in other time signatures, such as
> compound meters like 6/8 in which the duple tactus is divided into three at the
> eighth note level"
> [corpus:vuust-witek *Frontiers in Psychology* 5:1111]

And the depth-per-position idea, which is what `METRE_DEPTH` is:

> "Each note is then assigned a perceptual "weight" based on its metrical unit. A
> note or rest that initiates the highest metrical unit receives a weight of zero.
> In any 4/4 measure, this is the whole-note unit, initiated by the first note or
> rest of the measure. **The weight decreases by one for each metrical subunit.**"
> [corpus:fitch-rosenfeld *Music Perception* 25(1), p. 44, presenting
> Longuet-Higgins & Lee 1984]

### 2.2 THE 4/4 TABLE IS PUBLISHED, AND IT IS ALREADY THE PROGRAM'S

Fitch & Rosenfeld's Figure 1 prints the Longuet-Higgins & Lee weight row for a
4/4 bar at eighth-note resolution, with the sixteenth level stated in the
caption:

> "**0 –3 –2 –3 –1 –3 –2 –3**"
> — and, in the caption: "the greatest weight (0) is assigned to the first event.
> The next strongest (−1) is on the "three," the "two" and "four" are assigned
> weights of −2, and each of the "ands" (the off-beat eighth notes) are given a
> weight of −3. **Sixteenth notes receive weight −4**, and so on."
> [corpus:fitch-rosenfeld, ibid., Figure 1]

Interleave the sixteenths, drop the minus signs, and that is:

```
[0, 4, 3, 4, 2, 4, 3, 4, 1, 4, 3, 4, 2, 4, 3, 4]
```

which is `METRE_DEPTH` **exactly as it already stands in the program**. The
table that was written into `Deckards Orchestrator MK2.html` as "the oldest fact
in rhythm" turns out to be the Longuet-Higgins & Lee metrical weight tree, and it
is right. That is worth knowing for its own sake: the 4/4 case does not need
revisiting, and the derivation below is not a new method, it is the published
method run on four more metres.

### 2.3 THE TABLES — `[DERIVED]`, by one rule, applied identically

**The rule, in full:** list the metre's levels from the bar downwards, each level
a division of the one above it by 2 or 3 as MWFR 4 permits; a step's depth is the
index of the **largest** level it begins. Position 0 begins the bar, so it is 0.
A level of four beats is impossible under MWFR 4 without an intervening level of
two, so quadruple metres (4/4, 12/8) carry a half-bar level and the others do not.

**Grid unit is one sixteenth throughout**, so a step means the same duration it
means today (§4).

```
  4/4   16 steps   bar / half / quarter / eighth / sixteenth        max depth 4
        [0,4,3,4,2,4,3,4,1,4,3,4,2,4,3,4]            <- PUBLISHED, §2.2

  2/4    8 steps   bar / quarter / eighth / sixteenth               max depth 3
        [0,3,2,3,1,3,2,3]

  3/4   12 steps   bar / quarter / eighth / sixteenth               max depth 3
        [0,3,2,3,1,3,2,3,1,3,2,3]

  6/8   12 steps   bar / dotted-quarter / eighth / sixteenth        max depth 3
        [0,3,2,3,2,3,1,3,2,3,2,3]

  9/8   18 steps   bar / dotted-quarter / eighth / sixteenth        max depth 3
        [0,3,2,3,2,3,1,3,2,3,2,3,1,3,2,3,2,3]

  12/8  24 steps   bar / half / dotted-quarter / eighth / sixteenth max depth 4
        [0,4,3,4,3,4,2,4,3,4,3,4,1,4,3,4,3,4,2,4,3,4,3,4]
```

**Read the 3/4 and 6/8 rows against each other. They are the same length and
they differ in exactly three places, and those three places are the metre:**

```
  step      0  1  2  3  4  5  6  7  8  9 10 11
  3/4       0  3  2  3 [1] 3  2  3 [1] 3  2  3     beats at 0, 4, 8
  6/8       0  3  2  3 [2] 3 [1] 3 [2] 3  2  3     beats at 0, 6
                        ^^    ^^    ^^
```

If a 6/8 table ever reads `1` at steps 4 and 8, the program is playing a waltz
and calling it a jig. **That is the single check worth writing a test around.**

### 2.4 Where each level comes from, per metre, so nothing is hand-waved

| metre | bar splits into | because | intermediate level? |
|---|---|---|---|
| 4/4 | 2 halves, then 2 beats each | MWFR 4 forbids a 4-spacing | **yes**, the half-bar |
| 2/4 | 2 beats | 2 is permitted directly | no |
| 3/4 | 3 beats | 3 is permitted directly | no |
| 6/8 | 2 beats (compound duple) | §1.2, 6÷3=2 | no |
| 9/8 | 3 beats (compound triple) | §1.2, 9÷3=3 | no |
| 12/8 | 2 halves, then 2 beats each | compound quadruple; MWFR 4 as for 4/4 | **yes**, the half-bar |

Then in every simple metre the beat splits 2 (into eighths) and 2 again (into
sixteenths) [§1.3]; in every compound metre the beat splits **3** (into eighths)
and each eighth splits 2 (into sixteenths) [§1.1]. Nothing else is chosen.

The 12/8 half-bar level is corroborated from the accent side by a second,
independent source, which gives 4/4's secondary accent in the same words:

> "In each quadruple time signature's four beats, **the first beat receives an
> accent and the third beat receives a secondary accent**."
> [corpus:humankinetics *Learn four types of time signatures*] — *the same
> source §1.4 catches getting 6/8 wrong; used here only because it agrees with
> MWFR 4, not as the reason for it*

### 2.5 IF YOU WANT AN EIGHTH-NOTE GRID INSTEAD — `[DERIVED]`, same rule

Given for completeness because §4 shows the choice is genuinely open:

```
  3/4    6 steps    [0,2,1,2,1,2]              max depth 2
  6/8    6 steps    [0,2,2,1,2,2]              max depth 2
  9/8    9 steps    [0,2,2,1,2,2,1,2,2]        max depth 2
  12/8  12 steps    [0,3,3,2,3,3,1,3,3,2,3,3]  max depth 3
```

### 2.6 A CONSEQUENCE FOR `METRE(bite)` THAT IS NOT OPTIONAL — `[DERIVED]`

`METRE(bite)` currently computes `1 - bite * (d / 4)`. The **4** is the maximum
depth of the 4/4 table. Four of the six tables above top out at 3, and the
eighth-note tables at 2. Left as it is, `bite: 1` would floor a 4/4 sixteenth at
0.0 and a 3/4 sixteenth at 0.25 — **the same declared number would mean a
different amount of accent in a different metre**, silently. The denominator has
to be the metre's own maximum depth, not the literal 4.

This is arithmetic, not taste, and it is the kind of thing that would otherwise
be found six weeks later as "the jigs sound flat".

---

## §3 HEMIOLA — the 3-against-2 that folk repertoire actually walks across

### 3.1 The definition

> "In music, **hemiola** (also hemiolia) is the **ratio 3:2**. The equivalent
> Latin term is sesquialtera. In rhythm, hemiola refers to **three beats of equal
> value in the time normally occupied by two beats**."
> [corpus:wikipedia *Hemiola*]

> "**In compound time (6/8 or 6/4), where a regular pattern of two beats to a
> measure is established at the start of a phrase, this changes to a pattern of
> three beats at the end of the phrase.**"
> [corpus:wikipedia *Hemiola*] **`[enthusiast-grade; corroborated below]`**

### 3.2 And a music-theory source names the notation and the tune

> "Occasionally a compound meter will create **hemiola – a feel of two against
> three – by having three consecutive groups of two divisions over two compound
> beats**. The most common notation of this occurs in **6/8 when three quarter
> notes are placed in a row**. If written using quarter notes rather than tying
> two eighth notes together, **this will obscure the second beat**. The tune
> "America" from West Side Story highlights this rhythm as its primary melodic
> motif."
> [corpus:butterfield *Inquiry-Based Music Theory*, Lesson 4b]

That is the mechanism stated precisely enough to build: **the bar is unchanged
at twelve sixteenth-steps; only the grouping of them moves.** A 6/8 bar becomes
a 3/4 bar by onsets landing on steps 0, 4 and 8 instead of 0 and 6 — which is,
step for step, the difference between the two rows printed in §2.3.

**So hemiola costs the program nothing structurally.** It does not need a metre
change, a bar-length change or a second grid. It needs a rhythm that puts
onsets at the *other* metre's beat positions while the depth table stays put —
and the depth table will then, correctly, mark those onsets as syncopated,
because they are.

### 3.3 And it is often not notated at all

> "For the Hispanic and African cultures, hemiola is such an integral part of the
> music that composers assume performers can feel or hear when the meter changes
> and therefore it is not necessary to notate it — they will notate the entire
> piece in 6/8 or in 3/4 and let the performer change the meter as needed."
> [corpus:pas Percussive Arts Society, *Drumming with Hemiolas*]
> **`[trade-grade]`**

Worth recording because it means **the metre declaration and the rhythm are
separate objects** even in the source repertoire. A genre declaring 6/8 has not
thereby declared that every bar groups in two.

---

## §4 HOW MANY STEPS A BAR HOLDS, AND WHAT THE GRID SHOULD BE

### 4.1 A sixteenth-note grid, sourced from notation

> "In compound meters, **beams still connect notes together by beat**; beaming
> therefore changes in different time signatures. In the first measure of Example
> 7, **sixteenth notes are grouped into sets of six, because six sixteenth notes
> in a 6/8 time signature are equivalent to one beat.**"
> [corpus:openmusictheory *Compound Meter and Time Signatures*]

Six sixteenths to the beat × two beats = **twelve sixteenths to a 6/8 bar**.

### 4.2 And corroborated from the analysis side, independently

> "For the excerpts chosen, there were **16 temporal locations within each bar**
> for the pieces in 2/4 (each location = one 32nd note) and 4/4 (each location =
> one 16th note) meters, and **12 locations within each bar for the 3/4 and 6/8
> meters (each location = one 16th note)**."
> [corpus:palmer-krumhansl 1990, *JEP:HPP* 16(4), p. 730]

That is the answer to the question as asked. **For 6/8 the right grid is 12, and
the unit stays the sixteenth.** The alternative — 6 steps at the eighth — is a
different claim, that the eighth is the smallest thing a 6/8 part will ever play,
and jig repertoire falsifies it (a double jig's ornaments and a slip jig's
quarter-plus-eighth pairs both live below the eighth, §5).

Extending 4.1's arithmetic to the rest, and marked as arithmetic:

```
  metre   beats/bar   beat unit        sixteenths/bar   [DERIVED from §1.2, §4.1]
  2/4         2       quarter                 8
  3/4         3       quarter                12
  4/4         4       quarter                16
  6/8         2       dotted quarter         12
  9/8         3       dotted quarter         18
  12/8        4       dotted quarter         24
```

### 4.3 What the sequencer convention actually is, and it is not flattering

A step sequencer's grid and a DAW's tempo clock are both **quarter-note-based**,
and neither knows what a compound metre is. The strongest statement of this is
in the file format itself:

> "The MIDI file format's Tempo Meta-Event expresses tempo as "the amount of time
> (ie, microseconds) **per quarter note**". [...] When musicians refer to a "beat"
> in terms of tempo, they are referring to a quarter note (ie, **a quarter note is
> always 1 beat when talking about tempo, regardless of the time signature.** Yes,
> it's a bit confusing to non-musicians that the time signature's "beat" may not
> be the same thing as the tempo's "beat""
> [corpus:teragonaudio *MIDI File Format: Tempo and Timebase*]

> "The MIDI set tempo meta message sets the tempo of a MIDI sequence in terms of
> **microseconds per quarter note**."
> [corpus:recordingblogs *MIDI Set Tempo meta message*]

And the consequence, from users of a DAW that follows the convention literally:

> "when you already have the meter set to a compound meter like 6/8 and tap the
> tempo **Live interprets your tapping to be the eighth note instead of the dotted
> quarter note**, which is the standard beat duration for compound meters. It's
> because **Live simply takes the tap as being the denominator of the meter and
> makes no distinction between simple and compound meters.** And yeah, it's a
> problem." [...] "**To get the desired tempo and tempo scale I want, I have to set
> it to x/4 and "pretend" the reference beat is the desired note value.**"
> [corpus:ableton-forum, thread 162158] **`[forum-grade; used as evidence of a
> convention's consequences, not as theory]`**

**So the convention this program would inherit by default is the wrong one.** The
DAW convention is not a considered position about compound metre; it is what
falls out of storing tempo as microseconds-per-quarter-note. §6 says what to do
about it.

---

## §5 WHERE THE ACCENT FALLS IN THE DANCE FORMS

Repertoire facts. Sources here are trade- and enthusiast-grade and are labelled;
none of them is load-bearing for §2.

### 5.1 Jig — 6/8, beats at the first and fourth eighth

> "They are counted as **2 beats per bar**, 3 eight notes making up one beat. **The
> first note in the pattern of three notes making up one beat is played stronger
> than the other 2 notes**, so that even though there can be six eight notes per
> bar, **only two (first and fourth beat) are usually significant and used for
> counting**."
> [corpus:palohesuo *Music Used for Irish Dance*, hosted U. Helsinki]

In sixteenth steps that is **steps 0 and 6** — the same two positions the derived
6/8 table marks 0 and 1. The repertoire and the hierarchy agree, which is the
check worth having.

The double jig's surface rhythm, which is what fills between them:

> "The double jig is also in 6/8 time [...] **The main rhythm used is two sets of
> three quavers.**"
> [corpus:studyclix *Irish Dance Music*]

> "the pattern for the **double jig is three eighth notes twice per 6/8 bar**",
> whereas "the **single jig** tends to follow the pattern of **a quarter note
> followed by an eighth note (twice per 6/8 bar)**"
> [corpus:wikipedia *Jig*]

### 5.2 Slip jig — 9/8, three beats, and a long-short surface

> "The slip jig is in 9/8 time, traditionally with **accents on 5 of the 9 beats —
> two pairs of crotchet/quaver (quarter note/eighth note) followed by a dotted
> crotchet note**."
> [corpus:wikipedia *Slip jig*] — *note this describes a surface RHYTHM
> (long-short, long-short, long), not the metrical hierarchy; the two are
> different objects and the article conflates them*

> "**Slip jig is counted as 3 beats per bar, 3 eight notes making up one beat.**"
> [corpus:palohesuo, ibid.]

Three beats: sixteenth steps **0, 6 and 12**, matching the derived 9/8 table. The
quarter-plus-eighth figure lands an onset at the *second* eighth of a beat
(step 4 within a 6-step beat), which the table marks depth 2 — a division, not
a beat. That is the source of the form's characteristic lilt and the table
already describes it correctly.

### 5.3 Waltz and mazurka — both 3/4, and they differ by where the accent moves

> "The waltz [...] is a ballroom and folk dance, **in triple (3/4) time**"
> [corpus:wikipedia *Waltz*]

> "The Mazurka [...] is a Polish musical form based on stylised folk dances **in
> triple metre**, usually at a lively tempo, with character defined mostly by the
> prominent mazur's "**strong accents unsystematically placed on the second or
> third beat**"."
> [corpus:wikipedia *Mazurka*, quoting its ref. 2]

**This is the most program-relevant item in §5.** The mazurka is 3/4 with the
accent moved off the downbeat, *unsystematically* — i.e. it is a **rhythmic
gesture over an unchanged metre**, exactly like the hemiola of §3.2. Two dances,
one metre, one depth table, told apart by where their onsets and accents land.
Which is the same finding `lotr-themes-measured.md` §5 item 5 reached about
melody ("melody type is an interval budget"), one parameter over.

### 5.4 March — 2/4, 4/4 or 6/8, at about 120

> "Marches can be written in any time signature, but the most common time
> signatures are **4/4, 2/2** (alla breve [...]), **or 6/8**. However, some modern
> marches are being written in 1/2 or 2/4 time. **The modern march tempo is
> typically around 120 beats per minute.** Many funeral marches conform to the
> Roman standard of 60 beats per minute. The tempo matches the pace of soldiers
> walking in step. **Both tempos achieve the standard rate of 120 steps per
> minute.**"
> [corpus:wikipedia *March (music)*] — *the Characteristics section of this
> article is flagged by Wikipedia itself as citing no sources*

The 6/8 march is the interesting case and it is exactly the §6 problem.
`[DERIVED]` from the two sourced facts in that quotation — the tempo is 120 and
it "matches the pace of soldiers walking in step" at "120 steps per minute" —
a 6/8 march at "120" is 120 **steps**, one per compound beat, i.e. 120 dotted
quarters, i.e. **60 bars a minute**. Not 120 eighths and not 120 bars. The unit
is the dancer's foot, not the notehead. *(The source does not say which note
value the foot falls on; that it falls on the beat, and that 6/8 has two beats,
are §1.2's and §5.1's, not this paragraph's.)*

---

## §6 TEMPO — WHAT IS THE NUMBER COUNTING?

### 6.1 The two conventions are in flat contradiction and both are real

- **Notation and pedagogy**: the metre's beat is the beat, and in compound metre
  that beat is dotted. "If 8 is the bottom number, the beat is a dotted quarter
  note (equivalent to three eighth notes)" [corpus:openmusictheory].
- **MIDI and the DAWs built on it**: "a quarter note is always 1 beat when
  talking about tempo, **regardless of the time signature**"
  [corpus:teragonaudio].

**A tempo field that does not say which one it means is ambiguous by exactly a
factor of 1.5**, and the ambiguity only appears the day the metre changes —
which is the day this build happens.

### 6.2 The repertoire conventions do not agree with either, and say so out loud

Irish dance publishes tempi that count neither the notated denominator nor the
quarter note, and the compendium is explicit that this trips people up:

> "The tempo of a piece of music is in Irish dance stated as bmp – beats per
> minute. This would seem straight forward enough, but **unfortunately it does
> not hold up as such for some of the dances.** [...] This is due to the
> convention that **only the significant beats are counted** when writing the
> speed of reel and hornpipe – 1 and 3 are considered to be significant in these
> dances, thus **only 2 beats per bar**, this will yield 113 as the tempo."
> [corpus:palohesuo *Music Used for Irish Dance*]

> "**Double Jig is played at a slow tempo** for most purposes in dance, **usually
> less than 100 bpm**, and under 80 for advanced dancers." — and, in the survey
> table, Light Jig 112–121, Single Jig 112–124, Slip Jig 112–130, Treble Jig
> 72–96, across four dance organisations.
> [corpus:palohesuo, ibid.] — *these count the compound BEAT, not the eighth*

Ballroom publishes a **second number entirely** to escape the problem:

> "the waltz is actually the English or slow waltz, danced at approximately **90
> beats per minute with 3 beats to the bar (the international standard of 30
> measures per minute)**, while the Viennese waltz is danced at about **180 beats
> (58–60 measures) per minute**."
> [corpus:wikipedia *Viennese waltz*]

> "Music – Waltz 3/4. Tempo – **52 measures of 3 beats per minute – 156 beats per
> minute**."
> [corpus:ice-dance ISU pattern-dance reference, *Viennese Waltz*]

**Three repertoires, three different fixes, and every one of them names the
unit.** None of them ships a bare number.

### 6.3 What that costs this program, as arithmetic — `[DERIVED]`

`GENRE.tempo` is today a bare `[lo, hi]` pair with no unit written next to it.
Take a genre declaring `[102, 124]` and switching from 4/4 to 6/8. Three readings
of the same declaration, at 120:

```
  reading                       bar length   felt beats/min   sixteenth step rate
  4/4 today (quarter = 120)        2.00 s         120              8.0 /s
  6/8, "120" = quarter             1.50 s          80              8.0 /s
  6/8, "120" = eighth              3.00 s          40              4.0 /s
  6/8, "120" = dotted quarter      1.00 s         120             12.0 /s
```

Only the **dotted-quarter** reading keeps the number meaning what a listener
would call the pulse. The quarter-note reading — the one the program will do by
accident, because it is what "sixteen steps at rate R" generalises to — drops the
felt pulse by a third while leaving the tempo field untouched. **The genre would
be re-tempoed by a metre change that never mentioned tempo.**

`[CHOSEN]` — and this is a recommendation, not a finding, so it is marked:
**declare the unit alongside the number, and make the unit the metre's own beat.**
That is the notation convention, it is the convention all three repertoires in
§6.2 land on after their detours, and it is the only one under which a genre's
tempo band survives a metre change unchanged. The DAW convention is available
and is rejected on the grounds §4.3 gives: it is an artefact of a file format,
not a position about metre.

---

## §7 WHAT NOBODY GIVES — searched for, not found

Listed so the next person does not spend the same hours.

- **NO SOURCE PRINTS A DEPTH-PER-STEP ARRAY FOR ANY COMPOUND METRE.** Searched
  Lerdahl & Jackendoff's grids, London, Longuet-Higgins & Lee, Temperley, MTO,
  and the music-cognition literature on syncopation. The 4/4 array exists in
  print (Fitch & Rosenfeld's Figure 1, §2.2) and is the *only* one I found. Every
  compound table in §2.3 is derived. **This is the single largest thing this
  sheet asserts on its own authority**, and §2.3 gives the rule in full so the
  derivation can be checked rather than trusted.
- **GTTM itself was not reached.** MWFR 4 is quoted at second hand through
  Murphy's *MTO* footnote, which gives the page (1983, 69). The other three
  MWFRs and all of the metrical *preference* rules are unsourced here. The Yale
  rhythm-cognition-lab glossary that lists them all no longer resolves.
- **London's *Hearing in Time* beyond the introduction.** The intro PDF was
  fetched and read; it carries the rhythm/metre distinction and nothing about
  compound grids. His non-isochronous-metre chapter is paywalled at Oxford
  Academic. **This matters for what is NOT in this sheet**: 5/8, 7/8 and the
  additive metres are untouched, and London is who would have covered them.
- **Cooper & Meyer's *The Rhythmic Structure of Music* — not reached at all.**
  It survives here only as a citation inside Palmer & Krumhansl.
- **Gould's *Behind Bars* — not reached.** So the notation rule "the metronome
  mark in compound metre takes the dotted value" is carried in §6 by pedagogy
  sources rather than by the notation authority. The claim is not in doubt; its
  best citation is missing.
- **Longuet-Higgins & Lee 1984 in the original — not reached** (the Edinburgh
  PDF is truncated). The weight tree is therefore sourced through Fitch &
  Rosenfeld's reproduction of it, **for 4/4 only**. Whether LHL themselves
  printed a compound-metre tree is unknown to this sheet.
- **No empirical hierarchy for 9/8 or 12/8.** Palmer & Krumhansl measured 2/4,
  3/4, 4/4 and 6/8 and stopped there. The 9/8 and 12/8 tables in §2.3 rest on the
  generating rule alone, with no frequency or goodness-of-fit data behind them.
- **No source on step-sequencer grid resolution for compound metres** beyond
  forum reports (§4.3). I searched for a hardware or DAW manual stating a
  compound-metre step convention and found none; the machines mostly do not have
  one, which is itself the finding.
- **Nothing on how a metre should be CHOSEN**, per genre or per section. Out of
  scope by instruction and genuinely open — the owner's correction at
  `lotr-themes-measured.md` §5 item 1 ("Constraints NOT baked in values")
  applies here with full force,
  and a metre pinned per genre would be the same mistake in a new place.
- **Nothing measured about this program.** Every number in this sheet is from a
  source or is arithmetic. There is no probe behind it, and per `BACKLOG.md` §0
  no verdict is claimed on how any of it would sound.

---

## Sources

**Peer-reviewed and published**

- Fitch, W. T. & Rosenfeld, A. J. (2007), "Perception and Production of
  Syncopated Rhythms", *Music Perception* 25(1), 43–58 — Figure 1, the
  Longuet-Higgins & Lee weight tree for 4/4. [PDF](https://web.uvic.ca/~aschloss/course_mat/MUS%20511/ARTICLES%20AND%20REFS%20FOR%20320/FitchRosenfeld20071.pdf)
- Palmer, C. & Krumhansl, C. L. (1990), "Mental Representations for Musical
  Meter", *Journal of Experimental Psychology: Human Perception and Performance*
  16(4), 728–741 — the measured periodicities per metre and the 12-location bar.
  [PDF](http://www.brainmusic.org/EducationalActivities/Palmer_meter1990.pdf)
- Vuust, P. & Witek, M. A. G. (2014), "Rhythmic complexity and predictive coding",
  *Frontiers in Psychology* 5:1111 — recursive subdivision; 6/8 as a divided-in-
  three duple tactus. [link](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.01111/full)
- Murphy, S. (2016), *Music Theory Online* 22.3, note 4 — MWFR 4 quoted from
  Lerdahl & Jackendoff 1983 p. 69, with Temperley 2001 and Hasty 1997 alongside.
  [PDF](https://mtosmt.org/issues/mto.16.22.3/mto.16.22.3.murphy.pdf)
- London, J. (2004), *Hearing in Time*, Introduction — rhythm vs metre.
  [PDF](https://musikwissenschaft.univie.ac.at/fileadmin/user_upload/i_musikwissenschaft/Forschung/Vortragsreihen/J_London_Hearing_in_Time_Intro.pdf)

**University-published pedagogy**

- *Open Music Theory* (Anatone et al.), "Compound Meter and Time Signatures" —
  the compound definition, 6÷3=2, the accent contrast, beaming by beat.
  [link](https://human.libretexts.org/Courses/Prince_Georges_Community_College/PGCC_Open_Music_Theory-Fundamentals/02:_Basics_of_Rhtythm/2.03:_Compound_Meter_and_Time_Signatures)
- *Open Music Theory*, "Simple Meter and Time Signatures" — simple metre, 3/4.
  [link](https://human.libretexts.org/Courses/Prince_Georges_Community_College/PGCC_Open_Music_Theory-Fundamentals/02:_Basics_of_Rhtythm/2.02:_Simple_Meter_and_Time_Signatures)
- Butterfield, S. M., *Inquiry-Based Music Theory*, Lesson 4b — Compound Meters
  — the divide-by-3 rule, duple/triple/quadruple, and the 6/8 hemiola notation.
  [link](https://smbutterfield.github.io/ibmt17-18/04-intro-rhythm/b3-tx-compoundmeter.html)

**Format specification**

- *MIDI File Format: Tempo and Timebase* — tempo as microseconds per quarter
  note; "a quarter note is always 1 beat [...] regardless of the time signature".
  [link](http://midi.teragonaudio.com/tech/midifile/ppqn.htm)
- RecordingBlogs, *MIDI Set Tempo meta message*.
  [link](https://www.recordingblogs.com/wiki/midi-set-tempo-meta-message)

**Trade and enthusiast — repertoire and convention only**

- Palohesuo, M., *Music Used for Irish Dance*, hosted at U. Helsinki — jig/slip
  jig counting, the "significant beats" tempo convention, the four-organisation
  tempo survey. [link](https://www.cs.helsinki.fi/u/mkpalohe/)
- *Irish Dance Music*, study notes PDF — double vs single jig surface rhythm.
  [PDF](https://blob-static.studyclix.ie/static/content/file/attachments/e/e43f62c4-cdbc-431e-b80d-72fc96478dc8.pdf)
- Wikipedia: [Jig](https://en.wikipedia.org/wiki/Jig),
  [Slip jig](https://en.wikipedia.org/wiki/Slip_jig),
  [Waltz](https://en.wikipedia.org/wiki/Waltz),
  [Mazurka](https://en.wikipedia.org/wiki/Mazurka),
  [Hemiola](https://en.wikipedia.org/wiki/Hemiola),
  [March (music)](https://en.wikipedia.org/wiki/March_(music)),
  [Viennese waltz](https://en.wikipedia.org/wiki/Viennese_waltz)
- Ice-dance.com, ISU pattern-dance reference, *Viennese Waltz* — measures-per-
  minute alongside beats-per-minute.
  [link](https://www.ice-dance.com/site/reference/viennese-waltz/)
- Percussive Arts Society, *Drumming with Hemiolas* — hemiola left unnotated.
  [link](https://pas.org/pas-blog/drumming-with-hemiolas/)
- Ableton forum thread 162158 — a DAW's compound-metre tap tempo, and the
  workaround its users adopt.
  [link](https://forum.ableton.com/viewtopic.php?t=162158)
- Human Kinetics, *Learn four types of time signatures* — quoted in §1.4 as an
  example of the error, and in §2.4 for the quadruple secondary accent only.
  [link](https://us.humankinetics.com/blogs/excerpt/learn-four-types-of-time-signatures)

**In this repo**

- `docs/genre-research/lotr-themes-measured.md` §5.2 — the row that opened this.
- `Deckards Orchestrator MK2.html`, `METRE_DEPTH` / `METRE(bite)` — the 4/4 table
  §2.2 identifies, and the normalisation §2.6 flags.
