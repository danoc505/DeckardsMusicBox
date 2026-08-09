# The drum part across a whole record — what changes from one section to the next

*Opened 2026-08-09 for `BACKLOG.md` §6.0 A. The owner, 2026-08-08:*

> *"There is meant to be a sections type pattern with the last section having
> the most change, and other sections taking away something or adding or
> altering. But that is only one section — we never have fills or solos or drum
> rolls! It's often just one single drum loop the whole song."*

*The fill half of that was one broken condition and was fixed at `2026-08-08r`.
This file is the other half: not what happens at the END of a phrase, but what
makes the seventh section of a record a different place from the second.*

*`rhythm-phrasing.md` is the neighbouring sheet and covers the EIGHT-BAR
sentence — A B A C A A D, inside one four-bar material. Everything here sits a
level above that: the section, 8 to 32 bars, of which a record has six to
fifteen.*

---

## §0 First, the measurement — is the complaint true?

**It had never been measured.** The impression was in three documents and there
was no number attached to it, which is how this project has been wrong in both
directions before. So `harness/probe_drumarc.js` was written first. It reads the
PERFORMED events — not the genre tables, because the tables cannot see arrival,
resting, thinning or the fill — and compares the **first four bars of every
section**, so a long section cannot look "more varied" merely by containing more
bars. (The first version of the probe did compare whole sections and made
synthwave the most varied genre in the file, when what synthwave has is the most
varied section LENGTHS. That reading is thrown away.)

Build `2026-08-08s`, 20 seeds a genre:

```
  genre         sections  drum       most-played  same DRUMS  same HITS  closing drums
                w/ drums  materials  material     pair:pair   pair:pair  heard before
  lofi            6.5        4.0         2.3          53%        39%           65%
  synthwave      14.2        4.0         6.5          43%        25%          100%
  vgm             4.0        2.8         1.9          67%        57%           50%
  bladerunner     — this genre has no drums —
  acid            8.0        3.0         4.0          96%        68%          100%
  plastikman      8.3        2.9         4.1          99%        52%          100%
  jungle          6.2        4.0         2.6         100%        52%          100%
  dungeonsynth    6.0        3.8         3.1          73%        54%           15%
```

**The complaint is true, and it is truest where the owner said it was.** The
honest reading, column by column:

- **A record has six to fourteen drum-bearing sections and three or four drum
  parts.** Synthwave plays ONE of its four in six and a half sections of the
  same record. Acid plays one in four of eight. That is the single loop, said
  in numbers.
- **`same DRUMS` is the take-away axis** — does any section gain or lose a drum.
  Jungle is at **100%**: no section of a jungle record ever drops a drum or adds
  one. Plastikman 99%, acid 96%. Those three genres have no subtraction at all.
- **`closing drums heard before` is the arc.** In synthwave, acid, plastikman and
  jungle it is **100%**: the record's last section plays a drum part the listener
  has already heard. "The last section having the most change" is not merely
  weak there, it is structurally impossible.

**And what the numbers do NOT say.** lofi (53%) and vgm (67%) do differ section
to section, so "all genres are one loop" is too strong as stated. But that
difference is not an ARC — it comes from per-bar coin flips (a ghost note, a
tom), from parts arriving and resting, and from section length. Nothing in the
program makes a LATER section differ from an EARLIER one **because** it is
later. Verse seven and verse two get the same drums by construction.

### Why, in one paragraph

A song builds exactly **five** drum parts — `A`, `Avar`, `B`, `Bvar`, `C` — from
**three** kit settings the genre declares (`main`, `lift`, `depart`). Which one a
section plays is decided by **what kind of section it is** and **whether it is
the second or third time round**. Position in the record is not an input. The
one place position IS consulted is `form.thinTo`, which strips the final section
— and it removes whole PARTS (the bass, the keys), never a drum from the kit.

---

## §1 What the sources say a sectional drum change IS

Three named kinds, and they are the same three the eight-bar sheet already uses
at bar scale. That is the useful finding: **the vocabulary does not need
inventing, it needs raising a level.**

### Substitution — the cheapest and the most idiomatic

> "The drum patterns generally change for each part. It may be as simple as
> switching the hi-hat for a ride when moving from verse to chorus, or it may
> involve a completely different pattern."
> — [Sound On Sound, *Programming Realistic Drum Parts*](https://www.soundonsound.com/techniques/programming-realistic-drum-parts)

> "Often the difference between a verse and a chorus, or a chorus and a bridge,
> can be as simple as switching a hi-hat pattern for a ride pattern **while
> leaving all the other elements largely the same**."
> — same source

Corroborated independently:

> "The ride cymbal is traditionally used in choruses and middle eights, where the
> energy of the track needs to increase." … "Use closed hi-hats in verses for
> control and open hi-hats in choruses to heighten energy."
> — [MusicRadar, *How to program MIDI drums that sound like the real thing*](https://www.musicradar.com/tutorials/music-production-tutorials/midi-drums-program-drum-week)

**The emphasis matters as much as the device.** "Leaving all the other elements
largely the same" is the constraint — a section is not a new beat, it is the
same beat with one thing swapped. That is the same "least necessary change" rule
the roll editor was built on.

### Subtraction — and it is the DEFAULT method, not a garnish

> "The loop you've built will ultimately be your final chorus. Copy and paste it
> so you have 3, 4 minutes of material. Keep it at full blast for that last
> chorus, but for your other sections, **mute as many tracks as you can get away
> with**."
> — [Hyperbits, *Song Arrangement: How an 8-Bar Idea Becomes a Record*](https://hyperbits.com/blog/song-arrangement/)

> "Subtractive Arrangement is a mindset that will let you turn any idea into a
> song, and it requires working backwards from the idea you have by removing
> tracks until you have scaffolding on which to hang a buildup." … "It's easier
> to take away what's already there than trying to add what isn't."
> — same source

> "Often, the drums drop out completely, making room for a sparse arrangement of
> musical elements."
> — [MusicRadar, *Anatomy of an arrangement: your guide to song sections*](https://www.musicradar.com/how-to/song-sections-explained-intro-verse-chorus-middle8-outro-tag-bridge), on the middle 8 and on the club breakdown

And in the repetition-based genres specifically, already collected in
`rhythm-phrasing.md` §8 and re-confirmed here:

> "Every 4 to 8 bars, one thing is moved: opening the hi-hat filter, **dropping
> the clap for a bar**, or automating decay on the shaker."
> — [beatkey.app, *How to Make Minimal Techno*](https://beatkey.app/how-to-make-minimal-techno-music)

**This is the direction the program is weakest in.** Jungle, plastikman and acid
never take a drum away in any section of any record, and subtraction is what all
four of those sources reach for first.

### Addition — and it belongs late, not early

> "The usual method is to start with a simple arrangement and add to it as the
> song progresses." … "The final chorus is the culmination of the song and you
> can add more backing vocals, more percussion and additional lead lines."
> — [Born To Produce, *What Is Song Structure?*](https://www.borntoproduce.com/blogs/blog/what-is-song-structure-arrangement-guide)

> "Some intros open with drums and gradually add layers of instruments."
> — [Mixed In Key, *How to arrange a Dance Music track*](https://mixedinkey.com/captain-plugins/wiki/how-to-arrange-a-dance-music-track/)

The program already does the part-level version of this (`build.enter`, a role's
arrival point). What it has never done is the **within-the-kit** version: a
percussion voice, a second hat, a tom line that is absent for the first third of
a record and present for the last.

---

## §2 The last section — and the one place the sources disagree

The owner's phrase is *"the last section having the most change"*. The sources
split on what that means, and the split is real rather than a matter of one
source being wrong.

**The song reading — the last one is the FULLEST:**

> "Keep it at full blast for that last chorus."
> — [Hyperbits](https://hyperbits.com/blog/song-arrangement/)

> "If you're looking for your song to go out with a real bang, you can't just
> have your final chorus be an exact copy of the previous one."
> — [Joey Sturgis Tones, *"Keep It Interesting"*](https://joeysturgistones.com/blogs/learn/keep-it-interesting-nail-these-songwriting-basics)

And the named drum device for it, which is a SUBSTITUTION of the whole feel
rather than an addition:

> "Such as the last chorus of the song for four bars before slamming back into
> the normal groove, in a solo to give contrast or in a breakdown of a song."
> — [Authentic Drummer, *Half Time Groove*](https://www.authenticdrummer.com/article-half-time-groove/), on where a half-time feel is used

> "The basic difference that occurs when playing a half time feel is that whilst
> there are still eight hi-hats in a normal 4/4 bar, there is only half as many
> back beats, meaning that instead of the snare sitting on beats two and four,
> you end up with one big back beat on beat three alone."
> — same source

**The dance reading — the last one is the THINNEST:**

> "Where the Intro adds parts to build, an Outro gradually loses parts to fade
> the energy."
> — [Mixed In Key](https://mixedinkey.com/captain-plugins/wiki/how-to-arrange-a-dance-music-track/)

> "The drop or main groove should be 16 to 64 bars where the dance will live,
> giving the DJ enough time to mix out later."
> — [mastrng.com, *Techno Song Structure*](https://www.mastrng.com/song-structure-arrangement/)

**Both are "the most change" and they point opposite ways.** A pop record's last
chorus is the biggest thing in it; a club record's last stretch is deliberately
stripped so the next record can be mixed over it. This program already contains
the second answer — `form.thinTo` strips the closing section — and the genres it
holds are split roughly down the same line.

**This is not a question arithmetic can settle, and it is not one to settle by
decree.** It is written up here as the open question it is, for the owner.
`[EAR]`

---

## §3 What the eight-bar sheet already establishes, and what carries up

From `rhythm-phrasing.md`, all still standing and all re-confirmed by the sources
above:

- The three kinds of change are **addition, subtraction, substitution**. They
  work at section scale exactly as they work at bar scale.
- **`kit.phraseBy` already says which MEDIUM carries a change** — `"notes"` moves
  a hit, `"fx"` moves a knob. Acid and plastikman declare `"fx"`. Whatever a
  sectional arc does, it has to respect that declaration or it will contradict a
  decision the owner already ratified. *"If the drum hits don't change, the FX
  does."*
- **Every genre is in scope.** The owner overruled a `varyAsBefore` exemption
  once already: *"the drum rules apply to every genre, it is a rule of music."*
  A design that exempts the hypnotic genres has been tried and rejected here.
- **The strength ordering of beats** (downbeat > other quarters > backbeat >
  offbeat eighths > sixteenths) governs WHICH hit an addition or a subtraction
  should take. Taking the downbeat kick away is the documented big move; taking
  a sixteenth away is nearly nothing.

## §4 Where a sectional arc can land, mechanically

Stated as fact about the program, not as a proposal:

- A section already knows its **position** (`startBar` / `endBar` against the
  record), its **kind**, its **occurrence number**, and its **energy** — the arc
  value the form stage computes. None of these reach the drums.
- The genre already declares **three kit settings** (`main`, `lift`, `depart`)
  and the arrangement picks between them by section KIND only.
- **`2026-08-08s` added private per-section materials** (`A@3` — section three's
  own copy of A, made when the owner edits a note there). A section-scale arc
  needs exactly that facility: a section owning a drum part that is a small
  edit of its parent. The mechanism exists and currently only a mouse can reach
  it.
- **bladerunner has no drums at all**, so a drum arc cannot apply to it. Seven
  genres, not eight.

---

## §5 What is NOT sourced, and must not be guessed

- **How much change is right per section.** No source gives a number. Every
  quantity below section-vocabulary level is `[EAR]`.
- **Whether the closing section should be fullest or thinnest**, per genre — §2.
- **Whether an added percussion voice should be a NEW drum** (a voice the record
  has not used) **or a busier version of one already playing.** The sources
  describe both and rank neither.
- **dungeonsynth and vgm.** The sources above are pop, rock and dance. Nothing
  here was found for medieval-style drone percussion or for chip music, and the
  drum arc for those two genres should not be inferred from a house tutorial.
  `dkc.md` and `dungeon-synth-arrangement.md` are the sheets to extend, and
  neither has been re-searched for this.

---

# §6 WHAT WAS BUILT, `2026-08-09a`, and the two things measurement took back

## The rule, stated before any code existed

> A section's drums are the genre's kit plus a handful of MOVES, and how many
> moves it gets is decided by how far into the record it sits.

A move is a **kit override** and nothing else — the same shape as a `variant` —
so the drums are BUILT with it and never built and then corrected. The genre owns
every move in `kit.arc.moves`; the arrangement only counts how many to stack.
`chop.arc` is the same thing for jungle, whose kit is a recording.

**The owner's four decisions**, all taken before the build:

| question | their answer |
|---|---|
| what the last section does | the biggest change, **either direction** — a draw decides |
| which moves a section may make | take away, add, swap, change the feel, **heavy toms** |
| the shape | **pile up, with dips** |
| breakbeats in other genres | **held back** — hear this first |

## The numbers, same probe, 20 seeds a genre

```
                       BEFORE (2026-08-08s)          AFTER (2026-08-09a)
  genre         parts  most-played  closes on   parts  most-played  closes on
                       one part     a rerun            one part     a rerun
  lofi           4.0      2.3         65%        6.3      1.3          0%
  synthwave      4.0      6.5        100%        8.6      3.0          0%
  vgm            2.8      1.9         50%        3.3      1.5          0%
  bladerunner        — no drums, and therefore no arc, in either build —
  acid           3.0      4.0        100%        5.8      2.1          0%
  plastikman     2.9      4.1        100%        4.0      3.6          0%
  jungle         4.0      2.6        100%        5.6      1.6          0%
  dungeonsynth   3.8      3.1         15%        4.5      2.3          0%
```

**All seven genres with drums moved, 25 of 25 seeds each.** Bladerunner is the
one genre that did not move, and that is correct rather than a miss: it has no
drums in any section of any song, so there is nothing for an arc to act on.

## The two things built and then taken back out

**1. Per-section move draws made every section unique.** The first version drew
each section's moves on its own stream and measured 6.5 sections against 6.5
distinct drum parts — every section different from every other. That is "each
section just differs from the one before it", which is one of the three shapes
the owner was offered and **the one they turned down**. The ladder is now drawn
once per record and rung N is rung N−1 plus one more move, so two sections on
the same rung are byte-identical and the repetition that makes a record a record
survives.

**2. The closing rung was landing where no drums played.** Pinned to the last
section of the FORM, synthwave still closed on a rerun 85% of the time —
`form.thinTo` strips the final section and the drums are one of the parts it may
take away. "The last section" for this purpose means the last section that HAS
drums, and that cannot be known until the arrangement has decided who is playing.

## And a tom move refused, in two genres, against the owner's stated wish

The owner asked for heavy toms. Acid house and minimal techno were given one and
the seam battery caught acid: toms went from 16 of 60 songs to 28 of 60, through
a ceiling that exists so a genre declaring itself near-tomless cannot quietly
grow a drummer. The refusal for minimal techno was **already in the file, and
sourced** — *"a Plastikman bar that answers itself with a tom roll is the exact
gesture that music refuses"* [corpus:hawtin].

Toms went up where the kits declare them and down where they do not:

| | share of drum parts with a tom, before → after |
|---|---|
| lofi | 14.7% → 22.8% |
| synthwave | 32.3% → 40.9% |
| vgm | 26.3% → 29.8% |
| dungeonsynth | 96.5% → 90.4% |
| acid | 6.0% → 5.5% |
| plastikman | 3.7% → 2.2% |

This is `[EAR]` territory and the owner's to overrule — it is recorded here and in
`test/ears/LOG.md` rather than quietly dropped.

## The defect this work found on its way past

**Dungeon synth's chorus had no toms at all.** `lift: { toms: { use: 0.8 } }` —
meaning "the chorus leans on them slightly less" — replaced the whole tom block
one level deep, so `loop: 0.9` (the highest in the file) became undefined and the
per-bar draw compared against zero. Measured: verse 7.65 tom hits, bridge 7.52,
**chorus 0.00, in 60 songs of 60**. It read as a deliberately tom-free chorus for
as long as it existed. A nested block now merges onto its parent.

## One seam check rewritten, and why that is not the same as loosening it

The tom check asked whether a tom appears ANYWHERE in a song. That is
length-dependent, and a record now carries about 13 drum parts instead of 5, so
the odds rose on arithmetic alone. **The music had not moved**: acid measured
0.0130 → 0.0124 toms a bar and its share of drum parts containing a tom stayed at
6%. The check now asks the scale-free question, and the 10% line separates the
declared-high genres from the declared-low ones with a wide margin in BOTH
states — which is the test that a threshold was not picked to make today's build
pass.

## What this does NOT do, stated rather than left to be discovered

- **The step grid on the drum machine's panel shows the PATTERN, not the
  section.** In a section carrying arc moves, the lit step is the right step of
  the right bar while the hits drawn under it are the pattern's own. The playhead
  is honest about where the song is and not about what it is playing there.
  `BACKLOG.md`.
- **Nothing here has been heard.** Every number above says the arc exists, is
  the shape that was asked for, and reaches the events. Not one says it sounds
  good, and this file's own §2 records a source disagreement that only an ear can
  settle.
