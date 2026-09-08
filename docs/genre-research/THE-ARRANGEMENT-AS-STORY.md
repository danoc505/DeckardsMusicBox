# The arrangement as a story

A song is a story. The parts are the characters. The story is what happens to
them — who is there, who leaves, who comes back, who ends up on top.

That is not a metaphor, and this document is the four sources that say so, the
measurement of how badly this program does it, and the rules that follow.

---

## 1. A part is a character, because the ear makes it one

The listener does not hear a texture. They hear separate things and follow
them: auditory streams, "which represent distinct environmental events and
serve as **psychological entities** that bear the properties of these events"
(Bregman 1990).

So a part is the unit a listener tracks. That is what makes it something a
story can happen to.

## 2. The story is a change of rank

> "all narratives… involve the transvaluation of changing hierarchical
> relationships and oppositions into culturally meaningful differences"
> — Almén 2008, 41

Almén's point is that a musical narrative is not a story music tells *about*
something. It is the listener tracking which part matters most, and that
changing. Narrative is medium-independent — it does not need a lyric.

**This gives a hard test.** If the same part is on top from bar one to the
last bar, the record does not have a weak story. It has none.

## 3. The shape is the dramatic arc

Exposition, rising action, climax, falling action, dénouement — "commonly used
in theater, film, and other narrative or dramatic media". The climax is often
"a sudden increase in textural density". The dénouement is "a restatement of
established musical materials" (Ableton, "Dramatic Arc").

This program already has the climax: the form declares a peak and the peak is
the one section with everybody. ~~It has no dénouement — nothing knows that an
ending should give back what the record opened with.~~

**It has three of the five now.** The dénouement was built as rule 4 below —
the ending gives back what the record opened with, and holds it to the last
SPAN rather than the last section. And RISING ACTION, which nothing here even
named until it was noticed missing from this list: `form.arc` interpolates
between section centres, so the section before the peak was a flat step on the
way up rather than a section that goes anywhere. `Placed.swell` makes it a
run-up — the weight climbs across it from the arc's own quietest to nothing
held back at all, so the section arrives at full and the climax lands on top of
it. Measured, 170 of 200 lofi records and 175 of 200 dungeon synth ones have
one, and the gain rises 43% and 23% across it.

Exposition and falling action are still nobody's: the first statement of an
idea is not marked as one, and nothing after the peak knows it is coming down.

## 4. Absence is for the return

> "lose instruments in stages and then build them up again to a big finish"
> — Johnson & Poyser, *Sound On Sound*, 2000

> the middle 8 is where "main elements of the track drop out… to give the
> listener a break before the chorus comes back in again"
> — *MusicRadar*, 2022

Both describe a part leaving **so that it can return**. A part that leaves and
never comes back is not a device. It is a part that stopped.

---

## 5. What this program does now

Twenty seeds a genre, full length, read out of each record's own MIDI:

| | lofi | dungeon synth |
|---|---|---|
| the opener's share of the record | **91%** | 80% |
| its longest single absence | **3 bars** | 10 bars |
| it is playing in the last bar | 75% | **55%** |
| the top part changes, first half to second | **20%** | **30%** |

Two opposite failures, one missing idea:

- **lofi's opener never leaves.** Nine bars in ten, never gone more than
  three. It is not a character, it is furniture. Nothing happens to it.
- **dungeon synth's opener often does not come back.** Nearly half its records
  end without the thing they opened with.
- **In seven or eight records out of ten, nothing changes rank.** By §2, most
  records here have no story at all.

## 6. Why — and it is one line of code

Who plays in a section is chosen like this:

```js
for (const r of A.shed) { if (heard.size <= playing) break; heard.delete(r); }
```

A walk down a list the genre wrote in advance. Same list, every seed, every
section. It has no memory, so nothing that happens in a record can affect it —
and a rank that cannot change as a consequence is not a narrative (§2).

Twenty lines away, the *span* decision already does this properly: a derived
score, "three terms, multiplied, no coefficients… nothing to tune". The
program has the right idea and applies it only to the smaller decision.

## 7. What goes into the program

| | rule | source |
|---|---|---|
| 1 | Who plays in a section is **derived from what the record has done**, not read off a fixed list | Almén 2008 |
| 2 | A part the record introduced has **standing**, which is what makes it expensive to drop — no special case for the opener, it simply has the most standing when a record is young | falls out of rule 1 |
| 3 | ~~An absence has a **ceiling**: past it, a part is not absent, it is gone~~ **MEASURED AND FALSE — see §8** | Johnson & Poyser; MusicRadar |
| 4 | The ending restates what the record opened with | Ableton, dénouement |
| 5 | The genre's `shed` order stays, as a **weight** and never as an order | this program's own span score |

No rule names a part, a genre, or a number.

## 8. What it came to, measured

Rules 1, 2 and 4 are built, and rule 5 now has a value in both genres. Same
two sweeps, before and after:

| | lofi | dungeon synth |
|---|---|---|
| a part spent — gone for good before the last quarter | 15% → **5%** | 25% → **5%** |
| the opener is playing in the last bar | 75% → **75%** | 55% → **70%** |
| the opener's longest absence | 3 → **8 bars** | 10 → 8 bars |
| the top part changes, first half to second | 20% → **15%** | 30% → **45%** |
| distinct combinations of parts | 8.3 → **9.4** | 7.5 → 7.7 |
| the opener's share of the record | 91% → **83%** | 80% → 85% |

**The one that carries this is the first row.** Parts stopped being abandoned:
a record that drops a part now brings it back, in both genres, five times out
of a hundred instead of fifteen and twenty-five. ~~That is the ceiling in rule 3
working without a number, out of the arithmetic alone.~~

**That attribution is wrong, and rule 3 does not exist.** Tested on and off at
last — `HANDOFF.md` item 5 asked for exactly this — over 500 seeds a genre,
2500 parts each. The absence distribution does not move at all:

| | median | p90 | p99 | max |
|---|---|---|---|---|
| lofi, all three ways | 8 | 20 | 32 | 36 bars |
| dungeon synth, all three ways | 16 | 40 | 56 | 88 bars |

Identical with `share / (1 + out)`, with `share` alone, and with `1/(1 + out)`
alone. **Nothing here bounds how long a part stays away.** Whatever produced the
15% → 5% and 25% → 5% above, it was not a ceiling, because there is no ceiling
to be had from this term — and a rule credited with a result it did not produce
is worse than a rule that was never built.

What the two terms do move is abandonment, and they pull against each other,
oppositely by genre:

| gone for good | both | `share` only | ceiling only |
|---|---|---|---|
| lofi | **2.56%** | 2.76% | 2.92% |
| dungeon synth | 2.64% | 3.20% | **1.96%** |

`share` carries lofi; the `1/(1+out)` term carries dungeon synth; the product is
worse than the better single term in both. It is kept as the product only
because it is the one combination that is not worst in some genre. **Which is
right is a listening question**, and it goes on the pile with everything else
`TALLY.md` §0 is waiting on.

**Rule 4 had to be built separately, and had to reach the last SPAN.** With
rules 1 and 2 alone the ending got worse, not better — 75% → 50% in lofi —
because absence became possible and nothing brought the opener home. Holding
it into the closing SECTION only got that to 55%: the span score was still
free to take it out four bars from the end. Holding it to the close itself is
what recovered 75% and lifted dungeon synth to 70%.

**And one number went the wrong way — SOLVED, and the reason given here was
wrong.** lofi's top part changes between halves fell, 20% → 15%, where dungeon
synth's rose 30% → 45%. This paragraph blamed the metric or rule 1, and said
lofi's "drums sit at the bottom of its OWN shed order". They did not. lofi
stated no shed order at all and inherited the pop default
`drone, keys, lead, bass, drums`, so the genre that ENTERS on its keys shed its
foundation second and its beat never: `affords()` gave its drums 0.2, the
minimum, everywhere a part can leave. Measured over forty seeds, the drums were
heard in 100% of bars of 40 records out of 40 and were never absent for a
single bar — the most-present part could not change because one part never
stopped playing.

lofi now states `shed: ["drone", "lead", "drums", "bass", "keys"]`. Rule 1
needed no rank term; rule 5 — "the genre's `shed` order stays, as a weight" —
was already carrying it, and lofi had never given it a value.

Measured over forty seeds, before and after, and note this is NOT the metric
the table above uses — that one was measured with the script §2 of `TALLY.md`
records as missing, so these are a fresh definition (most-present part counted
by bars, each half of the record) and only the two columns compare:

| | before | after |
|---|---|---|
| drums heard | 100% of bars | **78%** |
| the drums' longest absence | 0 bars | **10 bars** |
| records where the drums are never once absent | 40/40 | **4/40** |
| the top part changes, first half to second | 0/40 | **21/40** |

The lesson is worth more than the fix: the fault was never in the rule. It was
a genre inheriting a number written for other music, which is the third time
this program has been caught doing that.

**Measured, and the answer was that the soft one does nothing either.** The
question used to read: rule 3 has no explicit ceiling, the `1/(1+out)` term is a
soft one, and whether a hard number does anything the soft one does not has not
been tested. It has now, and the soft term is not a ceiling of any strength —
so a hard number is not a refinement of it, it would be the first ceiling this
program has ever had. Whether it needs one is open, and unlike before, it is now
open with a number behind the question.

## Sources

- Albert S. Bregman, *Auditory Scene Analysis: The Perceptual Organization of Sound*. MIT Press, 1990. https://webpages.mcgill.ca/staff/Group2/abregm1/web/downloadstoc.htm
- Byron Almén, *A Theory of Musical Narrative*. Indiana University Press, 2008 — page 41 as quoted in Matthew BaileyShea's review, *Music Theory Online* 19.3 (2013). https://mtosmt.org/issues/mto.13.19.3/mto.13.19.3.baileyshea.html
- *Making Music: Creative Strategies for Electronic Music Producers* (Ableton), "Dramatic Arc". https://makingmusic.ableton.com/dramatic-arc
- Derek Johnson & Debbie Poyser, "Arranging Pop", *Sound On Sound*, April 2000. https://www.soundonsound.com/techniques/arranging-pop
- "Anatomy of an arrangement: your guide to song sections", *MusicRadar*, 16 March 2022. https://www.musicradar.com/how-to/song-sections-explained-intro-verse-chorus-middle8-outro-tag-bridge

---

# The protagonist

*Added after the arrangement diagnosis of lofi seed 42 (September 2026). §1–§8
above establish that a part is a character and that a story is a change of
rank. They do not say what the story is ABOUT. This does.*

## 9. A record has a main character, and it need not be the tune

The owner's question was "why can't the song be bass heavy, or drums, or an
arp?" The sources' answer is that it can, that this is what most records
actually do, and that the choice is the first thing an arrangement decides.

The hook — the thing a record is identified by — is defined without reference
to any instrument. It is "a musical or lyrical phrase that stands out and is
easily remembered", and it "often incorporates the main motif for a piece of
music" (Wikipedia, "Hook (music)"). Burns's typology of hooks in popular
records has a whole class of RHYTHM hooks, and his purest cases carry no
melody at all. A riff is "the main hook of a song" that "often begins the
song, and is repeated throughout it, GIVING THE SONG ITS DISTINCTIVE VOICE"
(BBC Radio 2, quoted at Wikipedia, "Riff"), and Rooksby's riff is "often
pitched low on the guitar".

The records bear it out. Billie Jean and Seven Nation Army are bass records.
Be My Baby and When the Levee Breaks are drum records. Blue Monday and Sweet
Dreams are sequencer records where the vocal arrives after two minutes. The
lead vocal is one option among several, not the definition of a lead.

**So the protagonist is a JOB a record gives to one part, and any part may
have it.** That is already the unit this program thinks in: `PARTS-ELEMENTS-
AND-STREAMS.md` separates a seat from the element it serves, and the
behaviours below follow the ELEMENT rather than the instrument. A bass and a
drum kit behave the same way as protagonists because both serve the
foundation; an arp behaves as a rhythm element whichever seat plays it.

## 10. Two laws that hold whichever part it is

**THE PROTAGONIST IS THE FIXED POINT AND EVERYTHING ELSE IS WHAT VARIES.**
An ostinato is "a motif or phrase that persistently repeats in the same
musical voice, frequently in the same pitch", and a ground bass is "repeated
as the basis of a piece underneath variations", where "the upper parts proceed
normally with variation" (Wikipedia, "Ostinato"). Billie Jean's line is "a
steady eighth-note pattern" whose "rolling pattern helps the riff repeat
seamlessly" (American Songwriter). The character is what an ear holds on to;
the story happens around it.

**THE OTHERS YIELD, AND THE YIELD IS ONE-DIRECTIONAL.** Owsinski's second
arrangement rule is that "the arrangement will fit together better if every
instrument sits in its own frequency range", and where two clash the fix is to
"change octaves, or have them play at different times"
(bobbyowsinskiblog.com/2019/05/01/arrangement-rules). Around a lead the same
rule points one way: "none of them should be in the same space as the lead",
instruments "should play less busy parts when the vocal is singing", and
active passages are reserved "for moments when the singer isn't performing"
(izotope.com, "How to write better song arrangements around vocals"). Call and
response is the same law in time — "a single musical figure followed by a
complementary answering one which takes over from it, rather than the two
happening at once" (mastering.com, "Arrangement is mixing").

Two corollaries the sources state directly:

- **Characters arrive one at a time.** "There should never be too many new
  elements introduced at the same time" (Max Martin, quoted at Abbey Road
  Institute), and the film analogy that goes with it — you cannot present ten
  characters in the first scene. "Characters usually aren't all introduced at
  once, they're gradually introduced, allowing each to breathe and establish
  themselves before the next enters the scene" (Johnston, "Horizontal
  arrangement"). EDMProd names the failure: "drop-off", where "all elements
  enter simultaneously, leaving nothing for later introduction".
- **A familiar part steps back for a new one.** Once listeners know an
  element, "a sound that has played a prominent role early in the song could
  be slightly turned down to bring a newly introduced element into sharper
  focus" (Johnston).

## 11. The character sheets

What differs per protagonist is not whether these laws apply but HOW the
character itself behaves and where it is exposed. Four sheets, by element.

### Foundation — the bass or the kit

The figure is one ostinato and it does not develop; what changes is written
INTO it as a single small move. Be My Baby's snare strikes "on the fourth beat
of each bar until the chorus", then becomes "a pronounced backbeat" on the
second (Wikipedia, "Be My Baby") — the section change IS that one displaced
snare. Around it the arrangement is economical: Billie Jean is bass, a 2/4
backbeat and one keyboard, with instruments "introduced at the beginning of
new sections"; Seven Nation Army is "distorted vocals, a minimal drumbeat, and
a bass line", and its chorus adds weight over the riff rather than replacing
it (American Songwriter; Wikipedia, "Seven Nation Army").

Its exposure is the documented one this program already has a name for: the
break, "where all the elements of a song except for percussion disappear",
placed "two-thirds to three-quarters through a song", when "the song takes a
breather, drops down to some exciting percussion, and then comes storming back
again" (Wikipedia, "Break (music)").

### Rhythm — an arp or a sequence

It runs and does not stop. Blue Monday's sequencer carries "two main riffs" —
a "galloping melody line in the intro, breakdown and outro" against a "disco
octave" in the verses — and swapping between them is how the sequence marks a
section. Everything else is layers over it, entering one at a time across
minutes, and the vocal arrives last and is answered by the bass "replying with
a complementary melody after each vocal line" at a lower level; the end brings
"each melody introduced throughout" together (abhigginson.wordpress.com, "New
Order – Blue Monday: a case study").

Its exposure is the breakdown stripped to the sequence.

### Pad — a chord loop or a drone

The loop or the tone holds and development is TIMBRE. Drone practice is
explicit: a stable fundamental anchors the piece and change comes through
"filter sweeps, slow LFO on amplitude or timbre", with layers added slowly and
"thin textures before introducing new partials", transitions "measured in
minutes" (melodigging.com, "Drone ambient"). Dungeon synth's own guide already
says the same thing in one sentence — "deepen the shadows of the sound through
changes in reverb and filters" — which is why that genre's treatment weights
are the one place this program already honours a character sheet.

Its exposure is the opening and the ending: it alone, which is exactly what
note.com asks of a dungeon synth ending.

### Lead — the tune

The one protagonist that DEVELOPS rather than holds: stated, varied, returned.
Around it the others sustain while it plays and speak in its rests, which is
what `material/counter.ts` already builds, and fills are "an answer to the
Lead" (Owsinski). Its exposure is the break that drops everything else — "all
characters except the lead vocal leave the stage" (Johnston).

## 12. What this program does against the sheets, measured

Over 200 records a genre, before any of this was built:

| | lofi | dungeon synth |
|---|---|---|
| intros carrying the tune | 10% | 14% |
| intros carrying the keys | 78% | 50% |
| the tune first heard at, median | 22% of the record | 25% |
| keys notes at or below the bass's top | 16% | 1% |
| the opening heard alone again anywhere | 53% | 53% |

And read against the sheets:

- **No part is named.** The intro kind is drawn per record and the opening is
  the front of `enter`, so seed 42 opened on bass and drums because the entry
  order put them there, not because the record was about them. Nothing after
  bar 8 knew it had made a promise.
- **The character changes between scenes.** A seat's element and texture are
  drawn PER MATERIAL, so the counter that arpeggiates idea A may play a line
  in idea B. An ostinato that is only an ostinato inside one section is not
  one. §10's first law cannot hold until the draw is per record.
- **Nothing yields.** The only register rule is that two parts may not hold
  the same pitch at the same instant, so lofi's keys sit across the whole bass
  band 16% of the time. Owsinski's second rule is unrepresented.
- **Exposure reads the entry order, not the character.** The break carries
  "the first two parts of `enter`", which is the same set in every record.
- **Foundation development is half there.** The drum figure is fixed per
  material and the phrase letters vary bars, but no section-scale displaced
  snare exists.

## 13. What goes into the program

| | rule | source |
|---|---|---|
| 1 | A record draws a PROTAGONIST once, from weights the genre states over its seats, and holds it for the whole record | Burns; BBC/Rooksby on the riff; Wikipedia, "Hook" |
| 2 | The protagonist's element and texture are drawn once per RECORD, not per material: the character is the same character in every scene | Wikipedia, "Ostinato" |
| 3 | The intro introduces the protagonist, and the intro kind follows from which element it serves rather than being drawn beside it | Ewer's intro hook; Burns |
| 4 | The break and the drop carry the protagonist, not the front of the entry order | Wikipedia, "Break (music)"; Johnston |
| 5 | Other parts yield the protagonist's register, as a COST and never a filter — the voicing chooser already prices mud and rubs this way | Owsinski, rule 2; izotope |
| 6 | Other parts yield activity while the protagonist speaks, and answer in its rests | izotope; mastering.com; Owsinski's fills |
| 7 | A section that gains parts gains them one per two-turn boundary, never all at the door | Max Martin; Johnston; EDMProd's "drop-off" |
| 8 | The ending decides the archetype: the protagonist restored is romance, the protagonist displaced is comedy. A genre may say which it tells | Almén 2008 |

Rules 1 and 2 are the field itself. Rules 3, 4 and 7 are conditions on rules
this stage already has. Rule 5 is one more term in `keys.ts`'s cost table.
Rule 6 is `counter.ts` generalised. Rule 8 is the one nothing published ranks,
and it is the owner's to weight.

**None of it is a new mechanism.** Six places stop reading `enter` and start
reading one drawn field.

## Sources added for this section

- Wikipedia, "Hook (music)"; "Riff"; "Ostinato"; "Break (music)"; "Be My Baby"; "Seven Nation Army".
- Gary Burns, "A typology of 'hooks' in popular records", *Popular Music* 6/1 (1987) — already cited above for the rhythm intro.
- Bobby Owsinski, "The 2 arrangement rules that every producer and mixer should know". https://bobbyowsinskiblog.com/2019/05/01/arrangement-rules/
- iZotope, "How to write better song arrangements around vocals". https://www.izotope.com/en/learn/how-to-write-better-song-arrangements-around-vocals
- Mastering.com, "Arrangement is mixing: build space into your songs". https://mastering.com/arrangement-is-mixing-build-space-into-your-songs/
- Dave Johnston, "Horizontal arrangement: introducing the characters in your music". https://musicfactory.davejohnston.nz/p/horizontal-arrangement-introducing
- Max Martin's arrangement rule, quoted at Abbey Road Institute, "Max Martin — the personification of a hit machine". https://abbeyroadinstitute.nl/blog/max-martin-personification-hit-machine/
- EDMProd, "The advanced guide to tension and energy in electronic music". https://www.edmprod.com/tension/
- American Songwriter, "Under the hood — Billie Jean". https://americansongwriter.com/songwriter-u-under-the-hood-billie-jean/
- A. Higginson, "New Order – Blue Monday: a case study". https://abhigginson.wordpress.com/2017/08/21/new-order-blue-monday-a-case-study/
- Melodigging, "Drone ambient". https://www.melodigging.com/genre/drone-ambient
- Ableton, *Making Music*, "Dramatic Arc" — already cited above for the arc.
