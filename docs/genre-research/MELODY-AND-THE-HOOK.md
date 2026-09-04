# Melody and the hook

Research first, then the tables. Everything below is a named source or a
measurement of this program; anything neither is marked `[chosen]`.

The question this document answers: **what does music theory actually
constrain about a tune, so that the randomness under it produces a melody
rather than a legal walk?** MKIII's lead builder already obeys a set of hard
laws — scale, register, chord tones on beats, dissonance resolved by step,
nothing rubbing what is ringing. Those keep it from being *wrong*. None of
them makes it a *tune*, and the roll says so.

---

## 1. What the program did before this, measured

`node tools/measure.ts --sweep lofi 1 20` and the same for dungeon synth, read
back out of the MIDI file the program writes (means over twenty seeds each):

| | lofi | dungeon synth |
|---|---|---|
| notes in the lead | 67 | 38 |
| range | 11.2 semitones | 7.3 |
| leaps (≥3 semitones) | 38% of moves | 23% |
| longest figure stated twice anywhere | 8 notes | 7.4 |
| …covering | 37% of the line | 66% |
| **phrases restating a figure of their own** | **12.8%** | **10.0%** |
| phrases whose peak sounds once | 74% | 53% |
| phrases whose contour is an arch or a descent | 34% | 24% |
| **intervals wider than a fifth** | **2.1%** | **0.3%** |

Read the two lines in bold together and the diagnosis is one sentence: **the
tune repeats only because the loop repeats it, and it never does anything
striking.** The 8-note figure "stated twice" is the loop coming round, not
the melody saying something twice; inside a phrase, seven phrases in eight
never restate anything. And the widest interval in any record was a perfect
fifth, because the builder capped a move at seven semitones — so no interval
this program has ever written is distinctive.

None of that is a bug in the laws. It is the absence of a second kind of
law: the laws say what a note may *not* be, and nothing says what a tune
*is*.

---

## 2. A hook is a figure that comes back

> "That part of a song, sometimes the title or key lyric line, that keeps
> recurring."
> — Delson's Dictionary, quoted in Gary Burns, "A typology of 'hooks' in
> popular records", *Popular Music* 6/1 (1987), p. 1

> Hooks may involve repetition of "one note or a series of notes… [or of] a
> lyric phrase, full lines or an entire verse".
> — Kasha & Hirschhorn, quoted ibid.

> "A memorable 'catch' phrase or melody line which is **repeated** in a
> song."
> — *Songwriter's Market*, quoted ibid.

Burns's worked example is exactly the shape a builder can implement:

> In the Young Rascals' 'Groovin'' (1967), the lyric 'Groovin' on a Sunday
> afternoon' accompanies a melodic phrase that is **repeated immediately**
> to the lyric 'Really couldn't get away too soon'. The repeating melodic
> segment is **a hook within a verse**.
> — ibid., p. 8

and the variant of it:

> 'How Can I Be Sure' … begins with a marginally catchy melodic phrase
> behind the title lyric. **This phrase then repeats with a variation.**
> — ibid.

**What this constrains.** A tune is not a fresh choice at every onset. It
states a short figure and says it again — immediately, or transposed, or
changed a little. This program already believes this at the level of the
LOOP (the tune is written once and tiled) and at the level of the SECTION
(`shape: sentence`, the variant, the rule of three). It does not believe it
*inside a phrase*, which is where Burns's examples live and where the
measurement above says nothing is happening.

---

## 3. The distinctive interval, and only one of them

> An interval this large is unusual in pop song melody; in fact, **any
> interval larger than a perfect fifth seems distinctive**.
> — Burns 1987, p. 9 (on the minor seventh in *Bolero*, then the sixths and
> octaves in the Beatles, the Dave Clark Five, and Peter, Paul and Mary)

The empirical work agrees, and sharpens it into something better than "leap
more":

> INMI tunes were found to have **more common global melodic contours** and
> **less common average gradients between melodic turning points** than
> non-INMI tunes… INMI tunes also displayed faster average tempi.
> — Jakubowski, Finkel, Stewart & Müllensiefen, "Dissecting an Earworm:
> Melodic Features and Song Popularity Predict Involuntary Musical Imagery",
> *Psychology of Aesthetics, Creativity, and the Arts* 11(2), 2017, abstract

> The tunes with more common average contour gradients … appear to comprise
> mostly stepwise intervallic motion or repetitions of the same note,
> whereas the tunes with **less common average contour gradients tend to
> contain many melodic leaps … or unusually large melodic leaps**.
> — ibid., discussion

> If the melodic contour shape of a melody is highly congruent with
> established norms, then it is more likely for the tune to become INMI.
> — ibid.

**What this constrains.** Conventional *shape*, unconventional *interval*.
A tune should walk an ordinary contour and contain one move that does not
belong to it. One: a line full of sevenths is not distinctive, it is an
arpeggio with a wide grip. So the signature leap is a budget of one per
tune, not a probability per note.

---

## 4. The shape a phrase walks: the arch

> Huron (1996) found that in 40% of approximately 10,000 phrases (5–11 notes
> in length), an ascending–descending (convex) melodic pattern was present…
> **Descending arches are more common in the last phrase, while ascending
> arches predominantly occur in the first phrase.**
> — summarised in Goldstein et al., "Exploring Melodic Contour: A Clustering
> Approach", and in the ISMIR 2021 "Cosine Contours" paper, both citing
> David Huron, "The Melodic Arch in Western Folksongs", *Computing in
> Musicology* 10 (1996)

Huron's reduction is three numbers — first pitch, mean of the middle, last
pitch — and the ranking that falls out of it is **arch, then descending,
then ascending, then concave**. The earworm study above found the arch again
in the tunes people cannot get out of their heads.

**What this constrains.** A phrase has a shape, drawn once, and the note
choices lean along it: up to a peak and down again, or down, or up. Before
this, the program drew one direction per phrase and leaned that way
throughout, which cannot make an arch at all — the roll measured 34% arches
and descents only because the span and the register kept bending lines back.

---

## 5. One highest note, near the end

> **Many melodies have a single highest note, usually at or near the end of
> the record. The highest note usually marks a climax** and may occur just as
> other structural elements are also marking the climax.
> — Burns 1987, p. 9

Burns's examples run from a trumpet blare (Blood, Sweat and Tears, 'Hi-De-Ho')
to a falsetto on the last word of a phrase (David Ruffin) to the last note of
the record (Simon and Garfunkel, 'Bridge Over Troubled Water').

**What this constrains.** The top of the tune is an event, not a ceiling.
Measured per phrase — because a loop plays its tune again and again, and
counting the top note across a record counts the tiling rather than the tune
— the peak of a phrase sounded once in 74% of lofi phrases and 53% of dungeon
synth's before this rule, which is what happens when a register bound rather
than a decision is what stops a line going up.

---

## 6. A leap makes a promise: gap-fill

> Gap-fill was first proposed by Leonard B. Meyer… the basic principle
> stating that **large intervals in a melody imply smaller intervals in the
> opposite direction**.
> — as summarised in the implication-realization literature (Narmour's I-R
> model; en.wikipedia.org/wiki/Implication-Realization)

> "Any large melodic leap will be followed by a reversal of pitch direction
> approximately 70% of the time."
> — David Huron, *Sweet Anticipation*; Von Hippel & Huron, "Why Do Skips
> Precede Reversals?"

The program already applies the reversal at 0.7. It does not apply the
*fill*: one step back and the debt is considered paid. Measured on lofi seed
42, the reversal happens 60% of the time and, when it does, walks back 94%
of the gap — so the fill is mostly there by accident of the register. With a
signature leap of an octave in the line, accident will not be enough.

---

## 7. Everything else stays small

> In the pitch domain, the statistical universals include discrete pitches, a
> **limited pitch set (seven or fewer pitches)**, division of the octave into
> unequal intervals, and **small intervals**.
> — Savage, Brown, Sakai & Currie, "Statistical universals reveal the
> structures and functions of human music", *PNAS* 112(29), 2015, pp.
> 8987–8992, doi:10.1073/pnas.1414495112

**What this constrains.** A tune's range stays about an octave and its moves
stay small — which is what makes the one wide interval audible as an event.
The program already measures 8–10 semitones of range and 24–34% leaps, so
this is a floor to hold rather than a thing to fix.

---

## 8. What goes into the program

Each of these is a constraint on the next choice, never a pass that repairs a
finished line — the same shape as every law already in `lead.ts`.

| | rule | source |
|---|---|---|
| 1 | A phrase states a short FIGURE and restates it inside the phrase, transposed along the scale where the laws refuse the exact repeat | Burns 1987 (Groovin', How Can I Be Sure) |
| 2 | A phrase walks a SHAPE drawn from arch / descending / ascending / concave, weighted in that order; an answering phrase prefers to descend | Huron 1996; Jakubowski et al. 2017 |
| 3 | A tune has ONE SIGNATURE LEAP wider than a perfect fifth, and only one | Burns 1987 p. 9; Jakubowski et al. 2017 |
| 4 | A leap is FILLED: the line keeps walking back through the gap until it is paid off, not one step and done | Meyer's gap-fill; Narmour I-R |
| 5 | The tune's HIGHEST NOTE sounds once, and not before its last phrases | Burns 1987 p. 9 |
| 6 | Everything above is a preference applied *after* the existing laws, so none of them can produce a wrong note — only a plainer one | this program's own rule |

Weights and lengths are `[chosen]` inside the ranking the sources give: the
figure is three onsets long by default, a phrase restates it about two thirds
of the time, and half of tunes plant a signature leap. The sources rank the
contours and name the ingredients; they do not publish weights, and a number
that claims a source it does not have is worse than one that admits it.

## 9. How the claim is checked, and what it came to

`tools/measure.ts` reads the record back out of its own `.mid` file and prints
the roll and the numbers in §1. Every claim above is one of those numbers, so
"this made the melody better" is a diff of two tables and a piano roll anyone
can read, not an assertion.

Same command, same twenty seeds, after the rules landed:

| | lofi before → after | dungeon synth before → after |
|---|---|---|
| phrases restating a figure of their own | 12.8% → **14.6%** | 10.0% → **32.1%** |
| phrases whose contour is an arch or a descent | 34% → **47%** | 24% → **45%** |
| intervals wider than a fifth | 2.1% → **4.0%** | 0.3% → **2.6%** |
| phrases whose peak sounds once | 74% → **79%** | 53% → **46%** |
| leaps | 38% → 43% | 23% → 30% |
| range | 11.2 → 12.8 semitones | 7.3 → 9.1 |

**What went the wrong way, and why.** Dungeon synth's peak now sounds more
than once in more of its phrases (53% → 46%). That is the hook and the climax
pulling against each other: a figure that contains the phrase's highest note
takes that note again every time it comes back. The restatement is chosen at
an offset that avoids the tune's top wherever another offset will stand, which
recovered part of it — measured, lofi went 69% → 79% under that rule — and
where no other offset stands, the hook wins. It is the right way round: Burns's
own claim about the single highest note sits in the same paper as the claim
that a hook is a segment repeated, and a tune with a hook and a slightly worn
peak is the trade every pop record makes.

**And what the roll says is NOT there.** Meyer's gap-fill is only half
implemented, and the measurement says so rather than the comment claiming
otherwise: after a wide leap the line reverses 67% of the time (lofi) and 86%
(dungeon synth), which is Huron's number, but it recovers only about a third
of the gap within three notes. Traced: after a nine-semitone leap the whole
legal candidate list was one pitch — a landing note off its chord may only
move by a step and only into the chord under the next onset, and with the
phrase's span and the seats the other parts hold, that is often a single note.
The debt biases what there is to choose from; it cannot invent a candidate.

## Sources

- Gary Burns, "A typology of 'hooks' in popular records", *Popular Music* 6/1 (1987), 1–20. https://www.tagg.org/xpdfs/burns87.pdf
- Kelly Jakubowski, Sebastian Finkel, Lauren Stewart, Daniel Müllensiefen, "Dissecting an Earworm: Melodic Features and Song Popularity Predict Involuntary Musical Imagery", *Psychology of Aesthetics, Creativity, and the Arts* 11(2), 2017. https://www.apa.org/pubs/journals/releases/aca-aca0000090.pdf
- David Huron, "The Melodic Arch in Western Folksongs", *Computing in Musicology* 10 (1996). https://www.researchgate.net/publication/239063783_The_Melodic_Arch_in_Western_Folksongs
- David Huron, *Sweet Anticipation: Music and the Psychology of Expectation* (MIT Press, 2006); Paul von Hippel & David Huron, "Why Do Skips Precede Reversals? The Effect of Tessitura on Melodic Structure", *Music Perception* 18 (2000)
- Leonard B. Meyer, gap-fill; Eugene Narmour, the implication-realization model. https://en.wikipedia.org/wiki/Implication-Realization
- Patrick E. Savage, Steven Brown, Emi Sakai, Thomas E. Currie, "Statistical universals reveal the structures and functions of human music", *PNAS* 112(29) (2015), 8987–8992. https://doi.org/10.1073/pnas.1414495112
- Jan Van Balen, "Hooked: Audio Features and Musical Salience" (thesis chapter 7), on melodic conventionality as a predictor of long-term salience. https://jvbalen.github.io/pdf/thesis-CH7.pdf
