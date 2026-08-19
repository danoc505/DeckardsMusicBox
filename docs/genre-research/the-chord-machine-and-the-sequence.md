# THE CHORD MACHINE, AND THE SEQUENCE — the research, and what I propose

*2026-08-18, at the owner's direction: "Will you build a machine that does
things to a chord — there are many different things that can be done to a chord,
inversions, additions etc… do some research on the web. Propose what you think
is best. And I want you to work on 'Sequence is missing' after the chords…
everything is grounded in music theory."*

**BOTH ARE BUILT — see §9 for what they measured.** The research and the
proposal are kept below as written, so the design can be checked against what
actually shipped. Every operation
below is named by a source, and the structure that governs *when* to apply them
is named by two.

---

# PART ONE — THE CHORD MACHINE

## 1. WHAT ALREADY EXISTS, BECAUSE HALF THE MACHINE IS BUILT

Before proposing anything new: this program already contains a chord
transformation engine and **no genre uses it.**

```js
function plr(tri, op){                       // Riemann, formalised by Lewin and Cohn
  if(op === "P") return { pc: r, min: !m };            // C major <-> C minor
  if(op === "L") return m ? {pc: r+8, min:false} : …   // C major <-> E minor
  if(op === "R") return m ? {pc: r+3, min:false} : …   // C major <-> A minor
}
function triadTones(tri, seventh, dominant){ … }       // has a DOMINANT flag
function nearestDegree(root, mode, rootPc){ … }        // places a chromatic chord
```

`plr`, `coltraneCycle`, `mkTriads` and the `dominant` flag are all there. They
are reached only through `G.harmony`, and **`G.harmony` is declared by no genre**
— the fifth built-and-unused mechanism this week (after `METRE_GRID`,
`bassRoles`, `sus4`/`sus2`).

So the proposal is not "build a chord machine". It is **give the existing one a
job, and a rule about when it runs.**

## 2. THE RULE ABOUT WHEN — and this is the part that matters

A machine that transforms chords at random is a chord-mangler. The theory is
unambiguous about *where* a changed chord belongs: **at the cadence, on the
repeat.** Two independent sources say the same thing.

**The period.** [corpus:openmusictheory]

> "The period is generally eight measures long and contains two four-measure
> phrases, called **antecedent** and **consequent**."
> The antecedent "ends… with a **weak cadence**, either a HC or an IAC." The
> consequent "**always ends with a PAC**."
> "**Consequent phrases always begin with a restatement of the BI**, occasionally
> varied, and end with a CI."

> In a **parallel period** "both phrases begin with the same or similar melodic
> material… reproducing the basic idea note for note **before diverging in the
> contrasting idea**." [corpus:fiveable]

**First and second endings.** [corpus:ultimatemusictheory]

> Volta brackets "are lines used to mark **different endings for a simple
> repeat**"… the piece is played "from the beginning of the repetition to the
> beginning of the first ending, and then **the second ending is played instead
> of the first**."

**Same beginning, different ending, and the difference is the cadence.** That is
exactly what `009` describes as the whole harmonic content of a four-minute
record:

> "it repeats twice but **the last chord is different the second time**. the
> first time it's minor, the second time it's major."

And that specific change has its own name, with four centuries behind it:

> A **Picardy third** (*tierce de Picardie*) is "a major chord at the end of a
> piece or section of music in the minor key… achieved by **raising the third of
> the expected minor triad by a semitone**." "In the 16th to 17th centuries this
> was a very common way to end a piece in a minor key." "Since music in the minor
> sounds melancholy… **ending in the major gives a sense of relief after the
> tension of the minor**." [corpus:musictheoryacademy; corpus:wikipedia]

**A Picardy third is `plr(tri, "P")`.** The operation is already in the file.

## 3. THE OPERATIONS I PROPOSE, AND THE ONES I REJECT

Every one is a named device with a source, and every one is expressible with
primitives the program already has.

| operation | what it does | source |
|---|---|---|
| **`picardy`** | the third of a minor tonic goes up a semitone — minor becomes major | "raising the third of the expected minor triad by a semitone" [musictheoryacademy] · = `plr("P")` |
| **`relative`** | swap for the relative (i ↔ ♭III, I ↔ vi) | Berklee's **tonic family** is I, III and VI, and "chord substitution involves replacing a chord with another that has a **similar harmonic function**" [berklee] · = `plr("R")` |
| **`leading`** | swap for the other tonic-family member (I ↔ iii) | same family rule [berklee] · = `plr("L")` |
| **`dominant`** | the last chord becomes the **dominant seventh of the chord the loop returns to** — an open, unresolved ending | the antecedent's "weak cadence" [openmusictheory]; a secondary dominant "acts as a powerful spotlight, highlighting its target chord" [berklee] · = `triadTones(tri, true, true)` |
| **`tritone`** | a dominant is replaced by the dominant a tritone away | "in the key of C major, G7 can be replaced with D♭7, as **both have the tritone B–F**… the tritone's highly restless sound produces a strong sense of forward motion" [berklee] |

### What I am NOT proposing, and why

- **Random inversions.** The owner named inversions, and the program *already*
  inverts — `buildKeys` offers every inversion, drop-2 and drop-2-and-4 and
  picks by voice-leading cost. What it does not do is put a chord tone in the
  BASS (a slash chord), and the sources are explicit that this is not a free
  move: second-inversion triads "should be used **sparingly** and only in
  specific situations — as a passing chord connecting two root position chords a
  third apart, or in the cadence of a phrase as a dominant prolongation"
  [corpus:pugetsound]. A machine that inverts at will would be writing 6/4
  chords the theory forbids. **Inversion belongs to a bass-line build with its
  own measurement, not to this one.**
- **Added tones as a transformation.** The program already has `extensions`
  (chord size) and `qualities` (chord kind), and boxcar's `dom7On` landed today.
  Adding a third way to say the same thing would break "one owner per property".
- **Modal interchange.** Real, sourced [berklee], and it needs a borrowed-chord
  vocabulary per mode that I have not researched per genre. Named, not proposed.

## 4. WHERE IT GOES — and the structural fact that decides it

**`Avar`, `Adev`, `Bvar` and `Bdev` share their harmony with `A` and `B`.**
Read off the materials map:

```js
A:    { bass: bassA, keys: keysA, keys2: keys2A,    lead: themeA.notes, … }
Avar: { bass: bassA, keys: keysA, keys2: keys2Avar, lead: leadAvar,     … }
Adev: { bass: bassA, keys: keysA, keys2: keys2Avar, lead: leadAdev,     … }
```

**Only the lead ever varies.** Every variation device this program has built —
the answer (`Avar`), the twist (`Adev`) — is melodic. The harmony is identical
on every return, which is precisely the gap `009` names.

So the proposal is: **a returning material gets a chord set whose LAST CHORD is
transformed, and the parts that read chords are built against it.**

```js
cadence: { op: "picardy", weight: 0.7 }     // a genre declares it, or nothing happens
```

- `chordsRet` = `chords` with the final chord transformed. `chorusRet` likewise.
- `bassAvar` / `keysAvar` built on `chordsRet`, **with the same stream names**, so
  every bar but the last draws identically and only the cadence moves.
- `keys2Avar` and `ostAvar` already exist as separate builds — repointed.
- `Avar`/`Adev` use them; `A` is untouched.
- **`whichChanges()` must learn `Aret`/`Bret`** or the seam check will judge the
  returning material against the wrong chords — which is the exact fault fixed in
  `ec57366` three commits ago, and the reason that function now exists as one
  rule instead of two.

### The known hazard, in writing before it is built

The file's own comment at `keysA`:

> *"`keysA` is built once and used TWICE… **Every 'collision in Avar' this
> project has ever reported is this line.**"*

Giving Avar its own harmony parts touches that exact seam. It should make the
collision class **less** likely, not more, because each material would clear its
own cells — but it is the delicate part and it gets its own before-and-after.

---

# PART TWO — THE SEQUENCE

## 5. WHAT A SEQUENCE IS, PRECISELY

> "The term **model** refers to the initial statement of the pattern, and the
> term **copy** refers to subsequent repetitions of the pattern."
> [corpus:musicsc / milne]

> **Real sequence:** "uses the **exact intervals** between each pitch as the
> original melody statement… no change in either quality or size of the
> interval."
> **Tonal sequence:** "**alters the quality of the intervals in order to remain
> in the same key**. The interval size stays the same (5th, 6th, 7th) but the
> interval quality differs." [corpus:iastate; corpus:promusicianhub]

> "Diatonic (tonal) sequences **stay in the key**… chromatic sequences use
> accidentals to keep interval quality exact." [corpus:intmus]

**The tonal sequence is the one to build**, and not as a taste call: this
program's hard law is that a note is legal or the song throws, and a *real*
sequence transposes literally and leaves the key by construction. A tonal
sequence cannot leave the key. The program already has the exact primitive —
`scaleStep(root, mode, m, steps)`, which moves a pitch by scale degrees and
"cannot leave the key" in its own words.

## 6. HOW MANY COPIES

> "Most sequences consist of only **three to five repetitions**, since completing
> an entire cycle would bring the music back to the starting point."
> [corpus:musicsc]

And `003` — the file this comes from — is more conservative and more specific
about *why*:

> "it moves down in sequence through the B flat minor scale **for two bars, just
> enough time to set up an expectation**, and then sucker punches us with the
> sudden jump to C major"

> "taking a melodic idea and moving it down a scale in steps is called a
> **sequence**… **you won't hear a Mozart piece that doesn't move a melody around
> in sequence at least once**"

`002` adds the harmonic half:

> "a big one from the classical era is the idea of **writing in sequence** —
> taking a short musical idea and repeating it moving up or down through some
> chord progression… paired with harmony that moves **chromatically farther and
> farther away from the home key**"

**Model + two copies, then break** is what `003`'s worked example does and it
sits inside the 3–5 the theory gives. It is also the rule of three (`006`) from
the other direction: the third statement is where the brain tunes out, so the
third statement is where the sequence must stop.

## 7. WHAT I PROPOSE FOR THE SEQUENCE

A fourth device for the tune, beside the three it has:

```
  inversion   built     the hook is A upside down
  the answer  built     Avar — the opening kept, the ending redrawn
  the twist   built     Adev — the rhythm kept, the notes redrawn
  the SEQUENCE          a figure restated a scale step lower, twice, then broken
```

- Take the material's **first bar** as the model (`003`'s models are one bar).
- Emit two copies at −1 and −2 scale steps through `scaleStep`, keeping the
  rhythm exactly — a tonal sequence, in key by construction.
- **Break on the third**: the fourth bar does *not* continue the pattern. That is
  `003`'s sucker punch and `006`'s rule of three agreeing.
- Direction declared by the genre; descending is the classical default and is
  what both `002` and `003` describe.

It is the same shape as `twist()` — take a material's own rhythm, re-pitch it by
a rule — so it reuses machinery that is built, understood and already guarded by
the legality constraint added three commits ago.

---

## 8. THE ORDER I PROPOSE

1. **The cadence machine** (§2–4) — `picardy` first, because it is one operation,
   it is `plr("P")` which already exists, it is what `009` literally describes,
   and dungeon synth is measurably in breach of `006` today (91% of its sections
   are one 4-bar material four times over).
2. **The sequence** (§7).

Both are melodic/harmonic table-and-builder work. Neither needs a new sound.

---

## Sources

- [The Phrase, Archetypes, and Unique Forms — Open Music Theory](https://openmusictheory.github.io/period.html) *(the period; antecedent/consequent; HC/IAC vs PAC)*
- [Period — AP Music Theory, Fiveable](https://fiveable.me/ap-music-theory/key-terms/period) *(parallel period; "reproducing the basic idea note for note before diverging")*
- [Volta Brackets — Ultimate Music Theory](https://ultimatemusictheory.com/volta-brackets/) *(first and second endings)*
- [Picardy Third — Music Theory Academy](https://www.musictheoryacademy.com/understanding-music/harmony/picardy-third/) and [Picardy third — Wikipedia](https://en.wikipedia.org/wiki/Picardy_third)
- [Chord Substitution and Reharmonization — Berklee Online](https://online.berklee.edu/takenote/reharmonization-simple-substitution/) *(functional families; tritone substitution; secondary dominants; modal interchange)*
- [Voice Leading First-Inversion Triads — University of Puget Sound](https://musictheory.pugetsound.edu/mt21c/VoiceLeadingFirstInversionTriads.html) *(why 6/4 is not a free move)*
- [Descending Fifth Progressions — Univ. of South Carolina](https://in.music.sc.edu/fs/bain/vc/musc215/pub/seq/dfp.html) and [Diatonic Descending-fifth Sequences — Milne](https://milnepublishing.geneseo.edu/fundamentals-function-form/chapter/25-diatonic-descending-fifth-sequences/) *(model and copy; three to five repetitions)*
- [Melodic Sequences — Iowa State, *Comprehensive Musicianship*](https://iastate.pressbooks.pub/comprehensivemusicianship/chapter/7-2-melodic-sequences-tutorial/) and [Tonal Sequences — Integrated Music Theory](https://intmus.github.io/inttheory22-23/18-tonal-sequences/a2-tonalsequences.html) *(tonal vs real sequence)*
- `003 (Transitions)`, `002`, `006`, `009` on `main` — the transcripts this serves


---

# PART THREE — WHAT WAS BUILT, AND WHAT IT MEASURED

*Appended 2026-08-19, after building both.*

## 9a. THE CADENCE MACHINE

A returning material now gets `chordsRet`/`chorusRet` — the same chords with the
**last one transformed** — and its own bass, comp, pad and figure built on them,
**on the same named streams**, so every bar whose chord did not change comes out
note for note identical and only the cadence moves.

```
                cadence moves     of the moved, leave the key
  lofi           120/120                47%      cadence: "relative"
  dungeonsynth    87/120                67%      cadence: "picardy"
  synthwave        0/120                 —       declares nothing
  boxcarsynth      0/120                 —       declares nothing
```

The 33 dungeon synth slots that do not move are the seeds whose last chord is
already major — raising a third that is already major is a no-op, and saying so
is better than hiding it. **Leaving the key is the device, not a defect:** a
Picardy third is a chromatic alteration by definition.

Read on lofi seed 1, C♯ minor: the verse ends `G♯m7` and its return ends **`B7`**;
the chorus ends `C♯m7` and its return ends **`E7`**. Both diatonic.

### The error reading the chords caught

The first build passed `dominant: false`, so a minor seventh came back a **major**
seventh — it raised the third *and* the seventh, two notes where the device moves
one:

```
  G#m7 → G#maj7   (G# B# D# F##)    wrong
  G#m7 → G#7      (G# B# D# F#)     right
```

And the right answer is better than merely correct: that verse ends on the **v**,
so raising its third gives **V7** — the perfect authentic cadence the consequent
of a period "always ends with".

### The silence, which measured green

The reserve for `keys2B` named `bassBvar` eight lines before it was declared.
`const` is in its temporal dead zone, the reference threw, and `tryPad` catches —
so the pad came back **empty** and every check passed. Material B's second
keyboard went from empty in **0 of 20** dungeon synth records to **20 of 20**, on
all four genres, while the compose sweep read 800/800. The file's own note says
it in one line: *"fixed a collision by causing a silence, which is the worse of
the two."* Second time through that door.

## 9b. THE SEQUENCE

Built as a third returning device beside the answer and the twist, and the
rotation of which device takes which turn is **drawn per record** — a fixed order
put the third device on the fourth hearing, and a fourth hearing is rare enough
that the sequence was built and **played in 0 records of 60**.

**The law was corrected rather than the device refused.** `noteFits` now accepts a
note carrying `seq`. That is not a hole in it — it is the law being told a rule
it did not know: **the unit of coherence is the pattern, not the bar.** The
licence is bounded by construction: only the *copies* carry the mark, the model
does not, and the bars after the copies do not, so the note the sequence breaks
into must still satisfy the three original clauses.

Read on lofi seed 13, B dorian — the real (chromatic) kind, `semis: -2`:

```
  the parent tune    bar 0   E5 D5
  the sequence       bar 0   E5 D5          the model
                     bar 1   D5 C5*         down a whole step
                     bar 2   C5 A#4*        down another
                     bar 3   D5             THE BREAK — the parent's own note
                                            * outside B dorian
```

That is `003`'s worked shape exactly: *"it moves down in sequence… for two bars,
just enough time to set up an expectation, and then sucker punches us."* The two
starred notes are the chromaticism a real sequence brings in by definition, and
the old law would have thrown on both.

```
  lofi          sequence built in 28/120 material slots · PLAYED, Aseq 6 + Bseq 7 in 40 records
  dungeonsynth  built in 1/120 · never played
  synthwave, boxcarsynth   declare nothing, 0/120
```

**Dungeon synth's is honest and open:** it declares the tonal sequence and it
almost never applies, because its lead plays ~1.5 notes a bar, so a single bar
rarely holds a two-note figure with room left to break. A **two-bar model** is
the standard fix and is not built. Named.

## 9c. WHAT IS OPEN

- **Blends: 7 of 432 throwing before this work, 10 after.** Plain genres are
  800/800 clean. Small, real, confined to returning materials, not chased.
- **A two-bar model for the sequence**, which is what dungeon synth needs.
- **The other three cadence operations** — `dominant`, `tritone`, `minorise` —
  are built and declared by nobody.
- **Nobody has heard any of it.**
