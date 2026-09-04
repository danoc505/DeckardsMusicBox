# The arrangement as a story: what happens to the parts

Research first, then the tables. Everything below is a named source or a
measurement of this program; anything neither is marked `[chosen]`.

The question this document answers is the owner's:

> A song is just like a story. If the song is starting with drums that is the
> focal of the WHOLE song. What you start with is your main character. It
> better well mean those drums are going to be there going forward — and the
> drums might drop out sure, but not for long.

The claim turns out to be right, to have a literature behind it, and to name a
defect this program has in **both** directions at once — not the one the
question guessed at.

---

## 1. What this program does now, measured

Twenty seeds a genre at 240 seconds, so every record has a full form. Every
number is read out of that record's own MIDI file (`tools/measure.ts --json`),
so nothing here can see a variable inside the builders.

**What becomes of the part a record opens with:**

| | lofi | dungeon synth |
|---|---|---|
| the opener's share of the record | **91%** | 80% |
| the opener is the most-present part | 45% | 70% |
| the opener's mean rank by presence | 2.0 of 5 | 2.1 of 5 |
| its longest single absence | **3% (3 bars)** | 12% (10 bars) |
| it is playing in the last bar | 75% | **55%** |
| records where it is gone for over a third | **0%** | **25%** |

**Whether the hierarchy ever changes:**

| | lofi | dungeon synth |
|---|---|---|
| most-present part differs, first half vs second | 20% | 30% |
| a part first heard after halfway | **0%** | 35% |
| a part spent — gone for good before the last quarter | 15% | 25% |
| distinct combinations of parts per record | 8.3 of 31 | 7.5 of 31 |

**Read those together, because they are two opposite failures of one missing
idea.** In lofi the opener plays nine bars in ten and is never gone longer
than three: it is not a character, it is furniture, and nothing whatever
happens to it. In dungeon synth one record in four abandons its opener for
more than a third of its length, and nearly half of them end without it. And
in **seven or eight records out of ten, in both genres, whatever dominates the
first half also dominates the second.**

Neither outcome is a decision. There is no rule about the opener anywhere in
the arrangement stage — what happens to it is a side effect of a fixed list
(§6). The program is not making a bad choice here. It is not making one.

---

## 2. A narrative does not need words, and this is the strong claim

> "literature, drama, and music share a potential for meaningfully ordering
> events in time, but differ with respect to their degree of referential
> specificity"
> — Almén 2008, 14

> "all narratives… involve the transvaluation of changing hierarchical
> relationships and oppositions into culturally meaningful differences"
> — Almén 2008, 41

Almén's whole model is that a musical narrative is not a story *told about* by
music — it is the listener tracking a **change of rank between elements over
time**. Narrative is medium-independent; the lyric is not where it lives.

**What this constrains, and it is the sharpest rule in this document.** The
story of an arrangement *is* the change in which part is on top. A record in
which the same part dominates from bar one to the last bar does not have a
weak narrative — it has **none**, by this definition. That is measurable, and
§1 measures it: seven to eight records in ten have no transvaluation at all.

It also refines the owner's question in a way worth keeping. "What you start
with is your main character" is right; "so it should always be there" is not
what follows. What follows is that its **rank has to be able to move**, and
that the movement is the story.

## 3. The parts are what the story happens to

The reason a part can be a character at all, rather than a layer of texture,
is that the ear builds it into an entity and follows it:

> auditory streams, "which represent distinct environmental events and serve
> as **psychological entities** that bear the properties of these events"
> — Bregman 1990

**What this constrains.** A part is the unit a listener tracks, so a part is
the unit an arrangement can tell a story about. This is why the owner's
"main character" is literal rather than a metaphor, and it is why the
arrangement — not the melody alone — is where the story is.

## 4. The shape a story has, and the one this program half-knows

> a "three-part structure called the *dramatic arc* that is also commonly used
> in theater, film, and other narrative or dramatic media" —
> **exposition**, "the introduction of musical materials"; **rising action**,
> "the section when tension builds towards the climax"; **climax**, "the peak
> of dramatic tension in the work", often marked by "a sudden increase in
> textural density"; **falling action**, "a section of relaxing tension after
> the climax"; and **dénouement**, which may involve "a restatement of
> established musical materials" or "a gradual dissolution".
> — *Making Music: Creative Strategies for Electronic Music Producers*
> (Ableton), "Dramatic Arc"

The same source is honest that this is not universal — it notes "many types of
musical forms that bear no resemblance to the conventional dramatic arc", such
as dub or minimal techno.

**What this constrains.** Three of the five are already in this program: the
form declares a `peak`, and the arrangement makes the peak the one section
that has everybody, which is "a sudden increase in textural density" exactly.
What is missing is the **dénouement as a restatement of established
material** — the program has an outro, but nothing in it knows that an ending
is where the record is supposed to give back what it opened with. §1 measures
the cost: dungeon synth ends without its opener 45% of the time.

## 5. Entrances and exits are the events the story is made of

> "Five elements at one time — counting the drums as one — is generally the
> most you'll hear (sometimes six)… Sequencer users should be familiar with
> the idea of dropping out an instrument at a time until there's only one
> left. Alternatively, **lose instruments in stages and then build them up
> again to a big finish**."
> — Derek Johnson & Debbie Poyser, "Arranging Pop", *Sound On Sound*,
> April 2000

> the middle 8 is where "main elements of the track drop out, different
> instruments take over, chords and melodies might change, **all to give the
> listener a break before the chorus comes back in again**."
> — "Anatomy of an arrangement: your guide to song sections", *MusicRadar*,
> 16 March 2022

**What this constrains, and it is the owner's "drop out sure, but not for
long".** Both sources describe absence as a thing done **for** the return:
lose them in stages *and then build them up again*; drop them out *before the
chorus comes back in*. An exit with no return is not an arrangement device,
it is just a part that stopped. So an absence needs a ceiling — and a ceiling
is a constraint, not a schedule.

## 6. Where the program cannot tell a story, and exactly why

`src/stage/arrange.ts` contains **two decision systems that do not share a
principle.**

The **span** decision — who moves every two turns of the loop — is derived,
and its own comment says so: *"THE SCORE. Three terms, multiplied, no
coefficients: any one at zero kills the move, and there is nothing to tune."*
It consults how established a part is, what the ledger says it is owed
("a part is worth more where it is missing"), how worn the move is, and the
genre's `afford` — the shed order carried as a **weight**.

The **section** decision — who is in the section at all — is this:

```js
for (const r of A.shed) {
  if (heard.size <= playing) break;
  heard.delete(r);
}
```

A walk down a fixed list. It has no memory: same list, every seed, every
section, every record. And it is the **coarser and earlier** decision — it
sets the section's membership before a single span runs.

That is the source. A narrative in Almén's sense requires rank to change *as a
consequence of what has happened*, and a lookup table cannot be a consequence
of anything. This is why the defect appears in both directions: in lofi the
list keeps the opener in forever, in dungeon synth the list (`shed[0]` is
`drums`) throws it out first. Neither is about drums, and neither is a choice.

**Two comments in that file are now out of date, which is a defect by this
repository's own rule that the comment is the specification.**

1. The file header says *"WHICH ones is the entry order backwards: the last to
   arrive is the first to go"*. Line 316 says *"WHO GOES is the shed order,
   which is **not** the reverse of the entry order"*. They contradict, and the
   `afford` docstring points at the header for a sentence *"already written in
   this file's header"* that is no longer in it.
2. The header says *"nothing here enters for the first time halfway through a
   record"*. Measured, dungeon synth does exactly that in **35%** of records
   (§1). The sentence was true when written and is not now.

**And it revises §7 of `THE-INTRO.md`.** That section records a shed order
protecting the opening as built, measured over sixty seeds, and dead — for the
stated reason that *"a section here sheds ONE part at a time, and the first
name in the shed order is never an opener in either genre."* That premise is
false now: dungeon synth's first name is `drums`, and a rhythm intro opens on
drums. The idea did not fail. It was measured in the one mechanism
structurally incapable of showing it.

## 7. What goes into the program

| | rule | source |
|---|---|---|
| 1 | Who plays in a section is **derived from what the record has done**, not read off a fixed list — because a rank that cannot change as a consequence is not a narrative | Almén 2008, 41 |
| 2 | A part the record introduced has **standing**, and standing is what makes it expensive to drop. It is not a special case for the opener: the opener is simply the part with the most standing when a record is young | Almén 2008; falls out of rule 1 |
| 3 | An absence has a **ceiling**. A part gone longer than that is not absent, it is gone — and absence is done for the sake of the return | Johnson & Poyser 2000; MusicRadar 2022 |
| 4 | The ending **restates established material**, so what a record opened with is heard at the close | Ableton, "Dramatic Arc" (dénouement) |
| 5 | The genre's `afford` stays exactly as it is: its voice, as a **weight**, never as an order | this program's own span score |
| 6 | The peak keeps everyone — already true, and it is the documented climax | Ableton, "Dramatic Arc" (climax) |

Nothing above names a part, a genre, or a number. Rules 1 and 2 are the whole
of the owner's point and neither of them mentions drums.

## 8. What is still not done

**A part that arrives late.** Lofi does this in 0% of records. "Different
instruments take over" (MusicRadar) is a documented device the entry-order
model cannot express in one of the two genres, because parts arrive in a
fixed order and never for the first time after the middle.

**A part that is spent on purpose.** The header calls "plays once and is never
heard again" a thing the program cannot do; measured, dungeon synth does it in
25% of records — by accident, not as a device. Doing it deliberately, and
doing the opposite deliberately, are the same missing decision.

**The ceiling in rule 3 has no number yet.** Nothing published gives one, so
it will be `[chosen]` and it will have to be measured on and off before it is
allowed to exist at all.

## 9. What must be measured, on and off

By this repository's cardinal rule, every rule above is a knob until it is
shown to move something. The measurements in §1 are the before; the same two
sweeps are the after. The specific numbers that must move, or the work is
deleted and this document keeps the note:

- the opener's longest absence (lofi 3%, must be able to exceed it)
- most-present part differs first half vs second (20% / 30%, must rise)
- opener playing in the last bar (75% / 55%, must rise)
- records where the opener is gone over a third (0% / 25%, must fall)

And the piano roll is what says whether any of it is music.

## Sources

- Byron Almén, *A Theory of Musical Narrative*. Bloomington and Indianapolis: Indiana University Press, 2008. Pages 14, 31 and 41 as quoted in Matthew BaileyShea's review, *Music Theory Online* 19.3 (2013). https://mtosmt.org/issues/mto.13.19.3/mto.13.19.3.baileyshea.html
- Albert S. Bregman, *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press, 1990. https://webpages.mcgill.ca/staff/Group2/abregm1/web/downloadstoc.htm
- *Making Music: Creative Strategies for Electronic Music Producers* (Ableton), "Dramatic Arc". https://makingmusic.ableton.com/dramatic-arc
- Derek Johnson & Debbie Poyser, "Arranging Pop", *Sound On Sound*, April 2000. https://www.soundonsound.com/techniques/arranging-pop
- "Anatomy of an arrangement: your guide to song sections", *MusicRadar*, 16 March 2022. https://www.musicradar.com/how-to/song-sections-explained-intro-verse-chorus-middle8-outro-tag-bridge
