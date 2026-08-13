# Travelling percussion — the frame drum, the walking pace, and the folk part that is not a loop

*Researched 2026-08-13. Opened because hobbit synth — "the moody music that plays
when the party is adventuring above ground from dungeon to town", 102–124 bpm —
plays a drum kit inherited whole from dungeon synth, a genre that runs 52–78 bpm
and whose own research asks for "one timpani hit on beat 1 of each bar" and
"dinosaurs steadily marching on"
[`docs/genre-research/raw/ds-research-2026-08-06.json`]. The kit is literally
named `kitNames.dungeon = "war drums and kettles"`. The genre's default rig is
labelled `shire: "the shire — flute, plucked strings, frame drum"` and **there is
no frame drum anywhere in the program.***

*This sheet is the answer to the gap `drum-sectional-arc.md` §5 named and refused
to fill:*

> *"No source gives a martial pattern with bar positions for THIS genre… The
> sources above are pop, rock and dance. Nothing here was found for
> medieval-style drone percussion or for chip music, and the drum arc for those
> two genres should not be inferred from a house tutorial."*

---

## §0 How this sheet was made, and how much to trust it

**Sixteen searches, twenty-two pages fetched, four PDFs downloaded and text- or
image-extracted.** Every quotation below comes from a page or a file **fetched in
this session**, per the rule `drum-sectional-arc.md` §7 imposed after that sheet's
audit found a 22% bad-quote rate: *"A quotation goes in only from a page that was
fetched in the same session it is written down."* Nothing here is quoted from a
search-result summary. Where a search summary was the only witness, the claim is
in §10 instead.

**Two of the strongest sources are PDFs whose content the fetcher could not
read**, and both were recovered locally rather than paraphrased:

- **Michael Ballard, *Bodhrán 101*** — the rhythm patterns are printed in
  **Wingdings 3 arrow glyphs**, which come out of text extraction as nothing at
  all. The page was rendered at 6× and read as an image, then the glyph codes
  were pulled out of the content stream and matched against the rendered
  legend, so every symbol below is confirmed twice. This is the only source
  found in the whole search that gives **stroke-by-stroke bodhrán patterns for
  every Irish tune type**. It is the spine of §3.
- **Doug Adams, *The Annotated Score* (Fellowship)** — 29 pages, extracted with
  `pypdf`. `raw/lotr-score-study.md` already logged this file as prose-only with
  no notation, and that finding stands. What that earlier pass did **not**
  extract is the instrument entry for the bodhrán and the sentence about what
  happens to the Celtic instruments once the hobbits leave the Shire, which is
  the single most on-brief sentence found anywhere in this research. §8.

**What this sheet is weak on, said up front.** There is no orchestral percussion
source here of the standing that Rimsky-Korsakov has elsewhere in this repo; the
processional material is military-band and pipe-band pedagogy plus one
peer-reviewed gait study, and the frame-drum material is instrument tutors. That
is the right register for the question — *what does the drum actually play* — but
it is tuition and reference, not scholarship, and §10 is long on purpose.

**Bar-position convention, used everywhere below.**

| meter | grid | slots |
|---|---|---|
| 4/4 | sixteenth-note steps | **0–15**, quarters at 0, 4, 8, 12 |
| 6/8 | eighths × 2 | **0–11**, the six eighths at 0, 2, 4, 6, 8, 10 |
| 9/8 | eighths × 2 (extension of the same rule) | **0–17**, the nine eighths at 0, 2, 4, 6, 8, 10, 12, 14, 16 |

The 9/8 row is an extension of the repo's 6/8 convention, not a source's
convention. `[CHOSEN]`

---

## §1 The frame drum — what actually makes the sound

The program promises one and does not have one, so this section is about
synthesis before it is about pattern. Four things make a bodhrán a bodhrán, and
none of them is the pattern.

### 1.1 The tipper is one stick that hits twice — down AND up

> "The drum is struck either with the bare hand or with a lathe-turned piece of
> wood called a *bone*, *tipper*, *beater*, *stick* or *cipín*."
> — [corpus:wikipedia-bodhran], fetched 2026-08-13

> "Move the beater by rotating your lower arm, so that the lower head describes
> an arc roughly perpendicular to the drumhead. You should hit the drum roughly
> at the center of that arc, **once on the way down and again on the way up**."
> — [corpus:ceolas-beginner], fetched 2026-08-13

That is the whole engine of the instrument: **one arm motion produces two
strokes**, and they are not the same stroke. It is why every pattern in §3 is
written as an alternation of downs and ups rather than as a list of hits, and it
is why a bodhrán part is naturally continuous where a timpani part is naturally
sparse.

The second head of the tipper is a further stroke on the same motion:

> "On your downstroke, you want to turn your hand a little further, so that the
> upper head comes over and strikes the drum." … "This technique is called
> *doubling the downstroke*."
> — [corpus:ceolas-beginner]

And the dominant regional style is built on the two ends having **different
jobs**:

> "The most common style of play is the **Kerry style**, with a two-headed stick
> played obliquely to the drumhead, **the main beat produced with the lower head
> and the upper head used for rolls and ornamentation**."
> — [corpus:ceolas-styles], fetched 2026-08-13

> "The most common is Kerry style, which uses a two-headed tipper; the West
> Limerick style uses only one end of the tipper."
> — [corpus:wikipedia-bodhran]

**For the program that reads: one voice, two articulations — a main stroke and a
lighter ornament stroke — not two drums.**

### 1.2 The other hand is on the skin, and it is a pitch control

This is the part with no analogue anywhere in the current kit. The kettles are
tuned once; a bodhrán is retuned continuously, during the bar, by the hand behind
the head.

> "The hand placed on the inside of the skin where it is able to control the
> tension (and therefore **the pitch and timbre**) by applying varying amounts of
> pressure and also the amount of surface area being played."
> — [corpus:wikipedia-bodhran]

> "A flat palm held against the skin will dampen the sound, producing a flatter,
> duller tone. The edge of your hand pressed into the skin will make it ring; by
> varying the pressure and position of your hand, **you can change the pitch by
> an octave or more**."
> — [corpus:ceolas-styles]

> Your non-dominant hand "should rest against the back of the skin, allowing you
> to muffle the ringing of the drum. You can control the tone of the drum by
> allowing it to ring more or less. You can change the pitch by pressing against
> the skin to tighten it."
> — [corpus:ceolas-beginner]

> "By pressing or moving your hand against the drumhead from inside the frame,
> you can change the pitch and resonance." — with "Flat hand against drumhead –
> deeper tone", "Light touch – more resonance", "Moving hand across surface –
> creates tonal variation"
> — [corpus:bodhran.ca], fetched 2026-08-13

And the same control across the wider frame-drum family:

> "the inside hand shapes pitch, dampens overtones, and can make the drum speak
> almost like a voice changing vowels"
> — [corpus:rareinstrument-framedrums], fetched 2026-08-13

**Three independent sources agree the range is pitch AND damping on the same
gesture, and one puts a number on it: an octave or more.** That octave is a
ceiling on the instrument's whole span, not the size of a stroke-to-stroke move
— see §10.

### 1.3 Rim versus centre is a contrast device, not a default

> "Occasional beats are played on the edge of the skin where it passes over the
> rim or on the very edge of the rim."
> — [corpus:ceolas-styles]

> "Brush-ended beaters, and a 'rim shot' (striking the rim) technique **for
> contrast**, were introduced by Johnny McDonagh."
> — [corpus:wikipedia-bodhran]

Note the two words that survive both quotes: **"occasional"** and **"for
contrast"**. The rim is not a second lane running underneath; it is a
substitution, in the exact sense `drum-sectional-arc.md` §1 uses the word.

### 1.4 The drum's job, stated by its own tutors

> "The bodhrán player must stick to this rhythm but is free to improvise within
> the structure: most simply, they may enunciate the first beat of four, making a
> sound like ONE two three four."
> — [corpus:wikipedia-bodhran]

> "To a dancer, **the single most important thing a percussionist can do is to
> clearly indicate beat one of every measure.** If you do no more than this but
> you do it accurately, the dancers will love you."
> — [corpus:ballard], *Bodhrán 101*, fetched and image-read 2026-08-13

> The bodhrán "shouldn't try to drive the beat like a rock drummer, and should
> rarely jump out front to solo. It should match the beat, ornament the rhythm,
> and follow the music."
> — [corpus:ceolas-beginner]

> "Percussion instruments should match the lead musician. Their purpose is to
> assist the other melody instruments in following the lead musician."
> — [corpus:spokanesessions], fetched 2026-08-13

**Consistent across four sources: mark beat one, stay under the tune, ornament
rather than lead.** That is a different instruction from the one the war drum is
following.

---

## §2 THE PATTERNS, in bar positions

All from [corpus:ballard], *Bodhrán 101* — the only source found that prints
complete stroke patterns for every tune type. His legend, read off the rendered
page:

| glyph | meaning |
|---|---|
| ▼ | **emphasised** down stroke |
| ▲ | **emphasised** up stroke |
| ↓ | down stroke |
| ↑ | up stroke |
| \* | rest |
| \| | bar line |

### 2.1 Jig — 6/8, steps 0–11

> "**Jigs:** (including Single Jigs, Double Jigs, Treble Jigs and Light Jigs but
> not including Slip Jigs) These tunes all have a 6/8 time signature."
> "The basic pattern is: **▼↑↓▲↓↑** Common variations include: **▼↑↓▲\*\***
> and: **▼\*\*▲\*\***"
> "A simple memory aid is 'Rashers and Sausages' or 'Pineapple Apricot'."
> — [corpus:ballard]

Six glyphs, six eighths, unambiguous:

| figure | step 0 | 2 | 4 | 6 | 8 | 10 |
|---|---|---|---|---|---|---|
| **jig basic** | ▼ accent-down | ↑ up | ↓ down | ▲ accent-up | ↓ down | ↑ up |
| **jig var 1** | ▼ accent-down | ↑ up | ↓ down | ▲ accent-up | — | — |
| **jig var 2** | ▼ accent-down | — | — | ▲ accent-up | — | — |

**Accents at steps 0 and 6, in all three.** And this is the best-corroborated
figure in the sheet — three independent sources, none citing another:

> "a jig … 'in 6/8 time' with 'a strongly emphasised **first and fourth beat, one
> downward and one upward**.'"
> — [corpus:boddrums], *Bodhrán Tutorial: Jig and Variation*, fetched 2026-08-13

> "1 2 3 4 5 6 / **strong light light strong light light**"
> — [corpus:soundbrenner], *Jig rhythm*, fetched 2026-08-13, giving the felt
> pulse as "ONE-la-li TWO-la-li"

> "The rhythm is often divided into two groups of three eighth notes, creating a
> 'ONE-two-three, TWO-two-three' pattern."
> — [corpus:musictheoryprofessor], fetched 2026-08-13

Boddrums independently confirms not just the accent positions but **their
direction** — first accent down, fourth accent up — which is exactly Ballard's
▼…▲. Two tutors who have never heard of each other wrote the same bar.

And boddrums gives a fourth figure, a subtraction:

> "stop and do nothing for the second beat. I tend to beat strongly on the third
> as well … to emphasise the re-entry to the music after the skipped beat."
> — [corpus:boddrums]

That is: hit at step 0, **nothing at step 2**, strong at step 4, accent at step 6.
A named, sourced, one-hit subtraction with a stated musical reason.

### 2.2 Reel and polka — 4/4, steps 0–15

> "**Reels and Polkas:** These are usually written in 4/4 and 2/4 respectively …
> The basic pattern is: **▼↑▼↑** or: **▼\*▲\*** or: **▼\*↑\***"
> "The memory aid I use for these tunes is: 'I Think I Can, I Think I Can'."
> — [corpus:ballard]

Four glyphs in a 4/4 bar. **Ballard prints no note values**, so the glyph-to-step
mapping is a reading, not a quotation — see §10. The reading taken here is **one
glyph per quarter**, because it is the one that agrees with every independent
account of where a reel's accents fall:

> "accent on the first and third beats of the bar"
> — [corpus:folkworks], *Guide to Irish Tune Types*, fetched 2026-08-13

> "a pattern that emphasizes the beat on the first and third counts" … the
> standard reel accent pattern is "**strong-weak-weak-strong**"
> — [corpus:musictheoryprofessor]

| figure | step 0 | 4 | 8 | 12 |
|---|---|---|---|---|
| **reel basic** | ▼ accent-down | ↑ up | ▼ accent-down | ↑ up |
| **reel var 1** | ▼ accent-down | — | ▲ accent-up | — |
| **reel var 2** | ▼ accent-down | — | ↑ up | — |

`[CHOSEN]` — the quarter-note reading. The alternative (one glyph per eighth,
covering half a bar) is not excluded by the source and is recorded in §10.

Ballard adds one thing a table can use directly:

> "An important note for reels and polkas is that the fiddle part is often
> written with a '**pickup note**' or '**grace note**' leading into the measure."
> — [corpus:ballard]

### 2.3 Slip jig — 9/8, steps 0–17, and it is a TWO-BAR figure

> "**Slip Jigs:** … Their time signature is 9/8 but the emphases in the melody
> line may break the nine into three threes or four-five or five-four and the
> pattern may change from one part to the next."
> "The basic pattern is: **▼↑↓▲↓↑▼↑↓ | ▲↓↑▼↑↓▲↓↑** Notice that **beat one is a
> down stroke in odd-numbered measures and an up stroke in even-numbered
> measures**."
> — [corpus:ballard]

| bar | 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 |
|---|---|---|---|---|---|---|---|---|---|
| **odd** | ▼ | ↑ | ↓ | ▲ | ↓ | ↑ | ▼ | ↑ | ↓ |
| **even** | ▲ | ↓ | ↑ | ▼ | ↑ | ↓ | ▲ | ↓ | ↑ |

**Accents at steps 0, 6 and 12 in both bars; the stroke direction inverts every
bar.** This is a genuinely two-bar figure — the tipper cannot get back to a down
stroke on the next bar-one without either an odd number of strokes or a rest, and
that arithmetic is *why* the figure is two bars long. The program has no
mechanism today that makes a drum figure alternate its own polarity every bar.

Corroboration of the accent count from a reference source:

> "The slip jig is in 9/8 time, traditionally **with accents on 5 of the 9
> beats** — two pairs of crotchet/quaver (quarter note/eighth note) followed by a
> dotted crotchet note."
> — [corpus:wikipedia-slipjig], fetched 2026-08-13

That is five accents where Ballard's bodhrán figure has three, and the two are
not in conflict — Wikipedia is describing the **melodic** rhythm, Ballard the
**drum**. Recorded as a difference rather than reconciled.

### 2.4 March — and the source deliberately gives no pattern

Ballard's entire march entry, quoted in full because the refusal is the content:

> "**Marches** can be written in 4/4, 6/8, 3/2 and sometimes other time
> signatures. The important thing to remember is that **people are marching. Give
> them a strong beat each time a foot hits the ground. You may choose to entirely
> ignore the other beats.**"
> — [corpus:ballard]

**A named authority on this instrument declines to give a march pattern and
substitutes a rule about feet.** What a foot-hit maps to comes from §4. The
military-band figure that fills the same slot is:

> "bass drum on beats 1 and 3, snare on 2 and 4" in 4/4; "bass drum on beat 1 and
> the snare on beat 2" in 2/4
> — [corpus:tunable], *March Pattern*, fetched 2026-08-13

| lane | steps (4/4) |
|---|---|
| bass / low stroke | **0, 8** |
| snare / high stroke | **4, 12** |

### 2.5 Hornpipe — feel only, no pattern

> "**Hornpipes** are written in 4/4 time (like reels) and usually have two
> distinct beats at the end of each phrase. Often the measure will contain two
> sets of dotted quarter followed by eighth giving it a feel of **DUM-da DUM-da**
> rather than the straight 'DA-da DA-da' of a reel."
> — [corpus:ballard]

Dotted-quarter-plus-eighth twice, in a 4/4 bar, is steps **0 and 6, 8 and 14**.
That is arithmetic from the stated note values, not a printed pattern.

### 2.6 And two tune types the sources tell you not to play

> "**Waltzes** are in 3/4 time … **Seriously consider not playing these.** If you
> do play, keep it quiet and simple."
> "**Airs** can be in any time signature or none at all. Usually they are quite
> slow. **Percussion rarely contributes anything of value to airs.**"
> — [corpus:ballard]

The genre has slow, unmetered, atmospheric material. A source that says *the drum
should be absent here* is worth as much as one that says what to play.

---

## §3 Tar, riq, daf — where the technique differs

The brief asked for these "where the technique differs", and it differs in one
structural way: **the tipper is replaced by fingers, so the two-articulation
scheme of §1.1 becomes a three-or-more articulation scheme keyed to WHERE on the
head the stroke lands.**

> "Finger strokes create crisp attacks on the head. Muting with the hand changes
> the sound from open and ringing to dry and controlled." … "Small wrist motions
> activate the cymbals."
> — [corpus:rareinstrument-riq], fetched 2026-08-13

> "In a traditional takht setting, it can act as the main percussion voice,
> shaping rhythmic cycles and responding to melodic phrasing."
> — [corpus:rareinstrument-riq]

> **Tar:** "Muffling from inside hand matters a lot."
> **General:** "Changing pitch, dampening sustain, darkening or opening the head
> in real time."
> **Bendir:** "the snare does not smear every note. It wakes up when the tension,
> angle, and touch are right."
> — [corpus:rareinstrument-framedrums]

The inside-hand principle of §1.2 is therefore **not Irish** — it is the shared
grammar of the whole frame-drum family, which is a stronger footing for building
it than one tradition would be. The dum/tek/ka stroke vocabulary itself is in
§10: it appeared in every search summary and **on none of the pages that
actually returned**, and this sheet does not write down what it could not fetch.

One family fact worth keeping, from the score itself:

> "The bodhrán … is just one of an ancient family of frame drums that consist of
> a stretched hide over a wooden shell. Bodhrán drums are believed to have
> originated in Ireland (or possibly emigrated there via the Roman Empire or
> Arabic trade routes), and derived their name from a Gaelic description of the
> sound, roughly translated as '**thundered**.'"
> — [corpus:adams], *The Annotated Score*, Fellowship, p. "Instruments —
> Hobbiton", extracted 2026-08-13

---

## §4 The walking pace — what a moving group actually sounds like

### 4.1 Cadence, in numbers, from the tradition that counts them

> "**Quick March:** This is an instruction to begin marching at the Quick March
> speed with the left foot. The standard pace is **120 beats per minute**."
> "**Slow March:** … The standard pace is **60 paces per minute**."
> "**Double March:** This is essentially a moderate jog at approximately **180
> paces per minute**."
> "British light infantry and rifle regiments … Quick March at **140** beats per
> minute."
> "**Highland Regiments, which march to bagpipe music, march at 112 paces per
> minute.**"
> "The usual speeds with military bands in attendance are **108** paces per
> minute and with a **pipe band 110** paces per minute."
> — [corpus:militarymusic], *Marching Speeds*, fetched 2026-08-13

And the concert-hall figures, for the same music not being walked to:

> "John Philip Sousa conducted his marches using around **120 beats per minute**.
> Most European march composers … conducted their marches in a slower style,
> using around **100 beats per minute**."
> — [corpus:wikipedia-americanmarch], fetched 2026-08-13

### 4.2 The step is the QUARTER, and the bar is two paces

> "Each beat corresponds to a footstep — **left foot on the downbeats, right foot
> on the upbeats**."
> — [corpus:tunable]

So in the repo's 4/4 grid: **left foot at steps 0 and 8, right foot at 4 and 12**;
one bar is two paces; the drum's low stroke lands under the left foot.

### 4.3 And the measured window — which is where this genre already sits

Not a tutor, a study:

> "The optimal walking tempo for synchronization with music was **120 bpm**"
> (citing Styns et al., 2007) … researchers observed "a good response to
> synchronization in a **region between 106 and 130** bmp"
> — [corpus:frontiers-psych], *Tempo and walking speed with music in the urban
> context*, fetched 2026-08-13

And the finding that stops this being a rule:

> "many subject did not spontaneously synchronize with the beat of the music at
> all, and some subjects synchronized only part of the time." … "music influences
> gait tempo and step size but does not necessarily lead to precise
> synchronization."
> — [corpus:frontiers-psych]

**Hobbit synth's declared 102–124 bpm overlaps the measured 106–130
synchronisation window almost exactly, and contains 110, 112, 120 — pipe band,
Highland regiment and quick time.** The genre's tempo was set from a walking
argument already recorded in its own comment block; this is an independent second
witness for it, from a different literature. Dungeon synth's 52–78 is outside the
window at both ends and closer to the 60-per-minute **slow march** — the funeral
pace. That is the numeric statement of why the inherited kit is wrong here.

### 4.4 What the drum is FOR when a group is moving

> "a drum cadence or street beat is a work played exclusively by the percussion
> section of a modern marching band or drum and bugle corps" … "a drumline piece
> played in a parading marching band **between or in place of full-band pieces**"
> … "Field shows are often preceded by the band marching to the beat of the
> cadence."
> — [corpus:wikipedia-drumcadence], fetched 2026-08-13

> The cadence "is stylistically descended from early military marches, and
> related to military cadences, as both are **a means of providing a beat while
> marching**."
> — [corpus:wikipedia-drumcadence]

**The drum-only stretch is a real form, not a fill.** "In place of full-band
pieces" is a percussion-alone section between two scored sections — which the
program has never built, in any genre.

### 4.5 The two-stick tradition, and why it matters to a one-voice kit

The Balkan procession drum splits the job across two beaters, hard:

> "The drummer plays the **accented beats with the dominant hand on the side of
> the drum with the thicker skin**, using a special stick known as … *tokmak*"
> "**Unaccented beats are played by the nondominant hand on the side … having the
> thin skin**, using a thin stick or switch called … *çubuk*"
> "Each hand is usually dedicated to playing one side of the drum exclusively,
> though this can vary by local style and tradition."
> — [corpus:wikipedia-davul], fetched 2026-08-13

That is the same accented/unaccented split as the bodhrán's down/up, realised as
**two different timbres rather than two directions** — and the davul is
specifically a procession instrument, used for "Levantine celebratory wedding
entrances and processional dances" [corpus:wikipedia-davul].

### 4.6 The pipe-band ornament, and where it falls

The dungeon synth sheet already put drags in this program's hands
(`dungeon-synth-score-and-drums.md` §4, `art: "drag"`). The 6/8 pipe-band
tradition places them, and in the meter this genre wants:

> "The first introductory 8th note should be played **exactly on the *third* note
> of the three-note 6/8 grouping**."
> — [corpus:pipebanddrummer], *Breaking Down the Massed Band 6/8*, fetched
> 2026-08-13

In the 6/8 grid that is a pickup at **step 4** (third eighth) into the next bar's
step 0.

> Drag rudiments in part 3: "a **drag tap**, followed by another **drag tap**,
> followed by a **double drag tap** into a **drag and stroke**."
> — [corpus:pipebanddrummer]

> "It's not a flam!" … "the stick stops dead on the head" … "I like to imagine
> that I'm **muting the head with the stick** rather than playing a dead grace
> note." … drags are "often at the front of a Double Stroke with the opposite
> hand."
> — [corpus:rhythmmonster], *Dave's Monster Pipe Band Drumming Blog*, fetched
> 2026-08-13

The last line matters for synthesis: the pipe-band drag is a **damped** grace
stroke, not a louder one. That is a different rendering from the two early grace
singles the dungeon kit currently plays, and closer to the bodhrán's own
hand-on-the-skin damping than to a snare flam.

---

## §5 What the Lord of the Rings score actually plays for the Shire

`raw/lotr-score-study.md` already established the hard negative — the free
Annotated Scores contain **no notation**, only volume 2 of Fellowship exists at
that path, and the printed book was not obtained. All of that still holds. What
follows is prose from that same PDF, extracted this session, that the earlier
pass did not record.

### 5.1 The bodhrán is in the score by name, with a timestamp

> "Here too, Shore begins to utilize his **Celtic assortment of instruments,
> including bodhrán, dulcimer, Celtic harp, musette, mandolin and guitar**."
> — [corpus:adams], on cue 2, "The Shire"

> "**BODHRÁN** — Listening Example: Disc One | Track Two | 1:34 [**Percussion
> Accompaniment**]"
> — [corpus:adams], Instruments / Hobbiton

Two bodhrán players are credited by name in the performer list:
"Robert White: Drones/Bodhrán, … **Alan Kelly: Bodhrán**" [corpus:adams].

### 5.2 The sentence this whole genre is about

> "The Hobbit/Shire theme's Rural Setting is most closely connected to these
> signature hobbit instruments. But **as the hobbits depart the Shire and
> adventure their way through Middle-earth, these Celtic sounds continually make
> their way into the edges of the orchestra as a reminder of what the Shire folk
> have left behind.**"
> — [corpus:adams], Instruments / Hobbiton

**That is the brief — "a party walking above ground from dungeon to town" —
written by the score's own annotator.** It is also an arrangement instruction and
not merely a colour note: the folk instruments do not stop when the journey
starts, they move to *the edges of the orchestra*. A frame drum in this genre is
not a Shire-only voice that departs when the record leaves home.

### 5.3 The rest of the Shire palette, since the rig label promises three things

> "**FIDDLE** — Listening Example: Disc One | Track Two | 1:18 [Melody Line]"
> "**WHISTLE** … The Irish whistle (also known as the penny whistle, vertical
> flute, flagolet, stáin or feadóg) may be the oldest instrument in Celtic music."
> "**DULCIMER** — Listening Example: Disc One | Track Two | 1:18 [**Steady
> Accompanying Figures Behind Melody**]"
> "**GUITAR** — … it enters in more sprightly passages, using a highstring
> tuning."
> — [corpus:adams], Instruments / Hobbiton

The rig is labelled "flute, plucked strings, frame drum". The score's own list is
whistle + fiddle + plucked things + **bodhrán**, and the dulcimer's role is named
as the **steady accompanying figure** — the job the program currently gives its
ostinato.

### 5.4 The figures Adams names — and they are rhythmic, not melodic

> "Also introduced are the **Two-Step Figure**, the **End Cap**, the **Hobbit
> Skip Beat** and a more developed statement of the Fellowship theme."
> — [corpus:adams], cue 2

> "Shore **drums obsessively** through building phrases of the Hobbit Skip Beat
> figure"
> — [corpus:adams], cue 3, on Bilbo losing the ring

> "The Outline and Two-Step figures **bumptiously usher Frodo and Gandalf about
> town**"
> — [corpus:adams], cue 3

> "Frodo, Sam, Merry and Pippin reach Bree, accompanied by caliginous variations
> on their **Skip Beat** figure."
> — [corpus:adams], cue 13, "Strider"

**The hobbits' travelling accompaniment is a named rhythmic figure that survives
into darker settings as "caliginous variations" of itself.** `lotr-themes-
measured.md` §103 already identifies the program's own two-chord alternation with
this. What Adams adds here is that the figure is what **travels**, and what gets
varied rather than replaced when the mood turns.

### 5.5 The one motif name that is NOT from the annotated score

> Shore is "equally noted for Shore's distinctive use of the bodhrán to create a
> **heartbeat-like sound**" … "**The Heartbeat of the Shire: played on Bodhrán**"
> — [corpus:wikipedia-concerninghobbits], fetched 2026-08-13

**This is second-hand and flagged as such.** The string "heartbeat" does not
appear anywhere in the 29-page Annotated Score PDF — searched this session,
zero hits. Wikipedia attributes the motif taxonomy to Adams' printed book, which
this repo has never obtained. Treat "Heartbeat of the Shire" as a real motif name
with a weak chain of custody, and do not build a figure on the word "heartbeat".

---

## §6 What makes a folk drum part a PART and not a loop

`rhythm-phrasing.md` §1 has the producer answer — the eight-bar A B A C A A D
sentence. This is the folk and processional equivalent, and it turns out to work
at a **different scale**: the folk unit of variation is not the bar, it is **the
strain and the time-through**.

### 6.1 The container: eight bars, two parts, and three times round

> "Most Irish tunes are composed of '**phrases**' or '**parts**' each consisting
> of **eight measures**. Most Irish tunes have two parts. The first part (eight
> measures) is called the 'A' part. The next part is called the 'B' part. … Often
> tunes are played with **each part repeated once** before going on to the next
> part (**A – A – B – B**)."
> — [corpus:ballard]

> "The most common exception to this pattern is **when you are playing for
> dancers**. Then it is common to play an **extra 'A' part** before going into
> the standard A-A-B-B. Sometimes the dancers will refer to this as '**eight for
> naught**'. This gives them a chance to get into position and prepare for the
> speed of the tune."
> — [corpus:ballard]

> "Anticipate the end of a tune in the set after two times around, although
> '**three times through**' is the norm."
> — [corpus:spokanesessions]

**AABB, three times through, with an extra unaccompanied A at the front when
people have to start moving.** That last one is remarkable — it is a sourced
*intro whose only job is to let the walking start*, which is precisely what a
travelling genre's first eight bars are for.

### 6.2 The variation lives in the ornament, and it changes every time round

> "If you do try to improvise, **listen to one repeat of the tune before joining
> in**, and try to figure out the large-scale structure of the tune." … "That's
> your template; **everything you do should fit that structure**."
> — [corpus:ceolas-beginner]

That is the folk statement of the rule this program already holds at bar scale:
the variation is drawn against a fixed template, not freely.

### 6.3 The processional answer: the strain, not the bar

Military march form is the same question answered by a tradition that writes its
variation down.

> **First Strain:** "is repeated once, **sometimes with added parts such as
> counter-melodies**."
> **Second Strain:** "is usually repeated once, sometimes twice; but some marches
> … omit this repeat."
> **Trio:** "the main melody of the march. It typically is played **legato style
> in a softer dynamic** and features **woodwinds more than brass**."
> **Breakstrain:** "**loud, intense, and marcato**" and "usually 16 bars long."
> **Grandioso:** "the grand finale, is played through **much more loudly than
> previous runs of the trio**. It sometimes **adds yet another counter-melody or
> obligato**."
> **Stinger:** "a I chord played in unison **on the downbeat after a quarter
> rest**."
> — [corpus:wikipedia-americanmarch]

**Read as a sectional arc this is: repeat-with-addition → contrast-by-softening →
one loud rough section → final statement louder with one more layer → a single
struck chord after a gap.** Every one of those is a device
`drum-sectional-arc.md` §1 already names — addition, subtraction, substitution —
but placed by a form rather than by a coin flip, and it answers the question that
sheet's §2 left open ("fullest or thinnest?") **for the processional case: the
last statement is the fullest, and it is fullest by ADDING A LAYER, not by
playing harder.**

And the strain forms themselves, from a Marine Band clinic handout:

> Short Trio: "Introduction / 1st str. / 2nd str. / 3rd str. / 4th str. — var. ||:
> 16 :|| ||: 16 :|| ||: 16 :|| ||: 16 :||"
> Long Trio: "Introduction / 1st str. / 2nd str. / 3rd str. / **Break** / 3rd str.
> — var. ||: 16 :|| ||: 16 :|| ||: 16 :|| ||: var. 16 :||"
> — [corpus:marineband-fettig-warfield], *Making the March King*, PDF extracted
> 2026-08-13

**Sixteen-bar strains, and the long-trio shape puts a Break between two
statements of the same strain** — the third statement of a strain is separated
from the second by a deliberately harsh interruption. That is the folk/orchestral
answer to "what changes on the third statement": *something is put in front of
it*.

### 6.4 The stinger is the End Cap

Adams names an "**End Cap**" figure in the Shire material [corpus:adams, cue 2].
The march tradition names a **stinger**, "a I chord played in unison on the
downbeat after a quarter rest" [corpus:wikipedia-americanmarch]. In a 4/4 bar
that is a rest at step 0 and a hit at **step 4** of the bar after the last —
a concrete, sourced, sectional-close figure the program does not have.
The identification of Adams' End Cap with the march stinger is mine. `[CHOSEN]`

---

## §7 What a table could take from this directly

Every row here is sourced above; nothing new is introduced.

| figure | meter | steps | accents |
|---|---|---|---|
| jig basic | 6/8 | 0 2 4 6 8 10 | 0, 6 |
| jig thinned (var 1) | 6/8 | 0 2 4 6 | 0, 6 |
| jig skeleton (var 2) | 6/8 | 0, 6 | 0, 6 |
| jig with skipped second (boddrums) | 6/8 | 0, 4, 6 | 0, 4, 6 |
| reel basic | 4/4 | 0 4 8 12 | 0, 8 |
| reel thinned | 4/4 | 0, 8 | 0, 8 |
| slip jig, odd bar | 9/8 | 0…16 by 2 | 0, 6, 12 |
| slip jig, even bar | 9/8 | 0…16 by 2 | 0, 6, 12, polarity inverted |
| march, two-lane | 4/4 | low 0, 8 / high 4, 12 | 0, 8 (the left foot) |
| hornpipe skeleton | 4/4 | 0, 6, 8, 14 | 0, 8 |
| 6/8 pickup | 6/8 | 4 → next bar 0 | — |
| stinger / end cap | 4/4 | 4 (after a rest at 0) | 4 |

Articulations the sources establish, for a frame-drum voice that does not exist
yet: **main stroke** (lower tipper head, centre), **ornament stroke** (upper head,
"rolls and ornamentation"), **rim** (occasional, for contrast), **damped**
(flat palm — flatter, duller), **open** (edge of hand — rings), and a **pitch
bend from the inside hand** whose stated full span is "an octave or more".

---

## §8 WHAT NOBODY GIVES

The searches that came back empty, and they are the reason this sheet stops where
it does.

- **No bodhrán march pattern exists in any source fetched.** The instrument's own
  tutor refuses to give one — "*Give them a strong beat each time a foot hits the
  ground. You may choose to entirely ignore the other beats*" — and no other page
  supplies it. The two-lane figure in §2.4 is a **military band** figure standing
  in for one. Searched: bodhrán march pattern, bodhrán 4/4 march, Irish march
  bodhrán rhythm.
- **Ballard's slip-jig 'cheat' as printed does not add up, and is not repaired
  here.** He gives `▼↑↓▲↓↑▼↑↓ | ▲**` — nine glyphs, bar line, then three — and
  glosses it "*(on 8 & 9, move the stick into position for the next down
  stroke)*", which implies rests at positions 8 and 9 of a nine-slot bar. The
  printed string and the gloss disagree. Both readings were rejected rather than
  picked. The glyph count was verified twice (rendered image, and per-glyph
  advance widths from the PDF content stream), so this is the source's
  inconsistency and not an extraction error.
- **No note values for the reel/polka glyph strings.** Ballard prints four glyphs
  for a 4/4 bar and never says whether they are quarters or eighths. The
  quarter reading in §2.2 is `[CHOSEN]`, taken because it agrees with two
  independent accent sources. The eighth reading — four glyphs covering half a
  bar, repeated — is not excluded, and would put unaccented ups on the offbeats
  instead of on beats 2 and 4.
- **The dum / tek / ka stroke vocabulary could not be fetched.** It appeared in
  every search summary with confident detail (dum = centre, low; tek/ka = edge,
  high; ring finger; 45-degree wrist rotation). **The two pages that carried it
  returned HTTP 503 twice and HTTP 404 once.** Per this repo's rule a search
  summary is not a source, so the riq/daf stroke names are **not** written down
  here as fact. This is the single largest hole in §3 and it is a fetch failure,
  not an absence.
- **No frame-drum source gives a pitch-bend amount per stroke.** "An octave or
  more" [corpus:ceolas-styles] is the instrument's whole span under maximum hand
  pressure. Nothing found says how far the pitch moves on an ordinary accented
  stroke, so any per-note bend depth the program uses will be `[CHOSEN]`.
- **No bodhrán FILL with bar positions.** Triplets and rolls are named as
  ornaments by several sources and by lesson indexes ("Jig Pattern No.3 using
  hemiola", "Triplets & Rolls Using Top Of Bodhran Tipper") — and **not one page
  fetched writes one into a bar.** The hemiola variation in particular is named
  in a lesson list and nowhere realised. Searched five ways.
- **No source says which bar of an eight-bar Irish part carries the lift or
  turnaround.** The eight-bar part, the AABB, and the three-times-through are all
  sourced; where inside the eight the drum does something extra is not. This is
  the exact gap `rhythm-phrasing.md` §1 fills for producer practice, and the folk
  literature fetched here does not fill it.
- **thesession.org returns 403 to this fetcher, every time, on every thread.**
  Three discussions that looked directly on point (slip jig bodhrán patterns,
  bodhrán session advice, jig and reel tempos) were unreadable. The single
  largest community corpus on this subject is out of reach and nothing from it is
  quoted here.
- **No LOTR percussion figure with bar positions, for any cue.** Adams names the
  instrument, the cue and the timestamp — "*Disc One | Track Two | 1:34
  [Percussion Accompaniment]*" — and gives no notation, because the free
  Annotated Score contains none. The Two Towers and Return of the King annotated
  scores 403'd (pdfcoffee) or were not reachable, confirming
  `raw/lotr-score-study.md`'s earlier finding that only Fellowship volume 2 exists
  at the elvish.org path. **The printed book remains the only place the figures
  live and this repo still does not have it.**
- **"Heartbeat of the Shire" is second-hand.** §5.5. Searched the whole
  Annotated Score for "heartbeat": zero hits.
- **No tempo for a bodhrán tune type from a governing body.** The BPM figures for
  jigs and reels that turned up are forum posts (thesession, mandolincafe,
  fiddlehangout), and the pipe-band 6/8 and 2/4 competition tempos likewise. They
  disagree with each other by 30% and **none of them is used in this sheet.** The
  cadence numbers in §4.1 are used because they come from a published account of
  drill standards and are internally consistent across four armies.
- **No percussion-specific scoring detail for Sousa's strains.** The march FORM is
  well sourced; what the drums specifically do differently in the second strain
  versus the grandioso is not, in anything fetched. The Library of Congress essay
  that appeared to carry it returned 403.
- **No ethnomusicological account of processional percussion as such.** The
  closest reachable analogues are the davul/tapan wedding procession
  [corpus:wikipedia-davul] and the marching-band street beat
  [corpus:wikipedia-drumcadence]. Neither is a study; both are reference entries.
- **Nothing here is a verdict.** No source in this sheet says a frame drum would
  make hobbit synth sound better. Every number above says only what the
  instrument and the traditions do.

---

## §9 Sources

Fetched and verified 2026-08-13, all of them.

**Frame drum technique**
- [Ceolas — Styles of Play for the Bodhrán](https://www.ceolas.org/instruments/bodhran/styles.shtml) *(Kerry style; flat palm vs edge of hand; octave of pitch; rim)*
- [Ceolas — A Beginners' Guide to the Bodhrán](https://www.ceolas.org/instruments/bodhran/beginner.shtml) *(the down-and-up arc; doubling the downstroke; listen to one repeat; the drum's role)*
- [Wikipedia — Bodhrán](https://en.wikipedia.org/wiki/Bodhr%C3%A1n) *(tipper/cipín; inside hand controls pitch and timbre; Kerry vs West Limerick; McDonagh's rim shot; ONE two three four)*
- [bodhran.ca — How to Play the Bodhran Drum](https://bodhran.ca/how-to-play-bodhran-drum-beginner-guide/) *(small wrist movements; hand pressure and tone)*
- [RareInstrument — Frame Drums](https://rareinstrument.com/percussion/frame-drums/) *(inside hand across the family; tar muffling; bendir snare)*
- [RareInstrument — Riq](https://rareinstrument.com/riq/) *(finger strokes, muting, jingles, role in the takht)*

**Patterns**
- **[Michael Ballard — *Bodhrán 101* (PDF)](https://www.mdb-services.com/app/download/2137966/Bodhr%C3%A1n+101.pdf)** *(the stroke patterns for jig, slip jig, reel/polka; hornpipe feel; march rule; tune structure; dancers and beat one)* — **rhythm glyphs are Wingdings 3 and required page rendering plus content-stream inspection to read**
- [Blackwell Original Drums — Bodhrán Tutorial: Jig and Variation](https://boddrums.co.uk/bodhran-tutorial-jig-and-variation/) *(first and fourth beat, one downward and one upward; the skipped-second variation)*
- [Soundbrenner — Jig rhythm](https://www.soundbrenner.com/blogs/articles/jig-rhythm) *("strong light light strong light light"; single/double/slip jig)*
- [The Music Theory Professor — Rhythmic Patterns in Irish Jigs and Reels](https://themusictheoryprofessor.com/analyzing-the-rhythmic-patterns-commonly-found-in-irish-jigs-and-reels/) *(reel accents on 1 and 3; strong-weak-weak-strong)*
- [FolkWorks — Guide to Irish Tune Types](https://folkworks.org/article/guide-to-irish-tune-types/) *(reel accent on first and third; march "crispness and the accent on the first beat"; polka off-beat accent)*
- [Wikipedia — Slip jig](https://en.wikipedia.org/wiki/Slip_jig) *(9/8, accents on 5 of the 9 beats)*

**Procession and march**
- [Altissimo!/militarymusic.com — Marching Speeds](https://militarymusic.com/blogs/military-music/13516233-marching-speeds) *(quick 120, slow 60, double 180, light infantry 140, Highland 112, pipe band 110, military band 108)*
- [Tunable — March Pattern](https://tunableapp.com/rhythm/march-pattern/) *(bass on 1 and 3, snare on 2 and 4; left foot on the downbeats)*
- [Wikipedia — Drum cadence](https://en.wikipedia.org/wiki/Drum_cadence) *(street beat; between or in place of full-band pieces; providing a beat while marching)*
- [Wikipedia — Davul](https://en.wikipedia.org/wiki/Davul) *(tokmak on accented beats, çubuk on unaccented; one hand per side; processions)*
- [Pipe Band Drummer — How Slow Can You Go?: Breaking Down the Massed Band 6/8](https://pipebanddrummer.com/blogs/pipe-band-drummer/posts/how-slow-can-you-go-breaking-down-the-massed-band-6-8) *(pickup on the third note of the 6/8 grouping; drag tap sequence)*
- [Rhythm Monster — Dave's Monster Pipe Band Drumming Blog 3: Dragging it out](https://www.rhythm-monster.com/blog/pipe-band-drumming-online-lessons-Daves-drumming-blog-3-pipe-band-drag-rudiments) *(it's not a flam; muting the head with the stick)*
- [Wikipedia — American march music](https://en.wikipedia.org/wiki/American_march_music) *(strains, trio, breakstrain, grandioso, stinger; Sousa 120 / European 100)*
- [Fettig & Warfield — *Making the March King*, Midwest Clinic handout (PDF)](https://www.marineband.marines.mil/Portals/175/Docs/sousa_march_clinic_handout.pdf) *(short-trio and long-trio strain diagrams, 16-bar strains, the Break between two statements of the third strain)*

**Session practice**
- [Spokane Sessions — Session Etiquette](https://spokanesessions.com/etiquette.php) *(three times through; percussion matches the lead musician; the "Hup")*

**Lord of the Rings**
- **[Doug Adams — *The Annotated Score*, The Fellowship of the Ring (PDF)](https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf)** *(bodhrán in the Shire assortment; the Hobbiton instrument entries; Celtic sounds at the edges of the orchestra as the hobbits depart; Two-Step, End Cap, Skip Beat, Outline; performer credits)* — **prose only, no notation, as `raw/lotr-score-study.md` already recorded**
- [Wikipedia — Concerning Hobbits](https://en.wikipedia.org/wiki/Concerning_Hobbits) *("The Heartbeat of the Shire: played on Bodhrán" — second-hand, see §5.5)*

**Walking**
- [Frontiers in Psychology — Tempo and walking speed with music in the urban context](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.01361/full) *(optimal 120 bpm; good synchronisation 106–130; spontaneous synchronisation unreliable)*

**Reached for and refused**
- thesession.org — 403 on every discussion thread attempted (three)
- middleeasterndance.net riq/daff rhythms — 503, twice, both URL forms
- majiddrums.com riqq guide — 404
- oaim.ie bodhrán basics — 403
- pdfcoffee.com, The Two Towers Annotated Score — 403
- loc.gov, "The Sousa March: A Personal View" — 403
