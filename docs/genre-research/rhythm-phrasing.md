# Rhythm, phrasing and fills — what a drum part does over eight bars

Source: **Jeremy / Red Means Recording, "The Fundamentals of Rhythm"**
(transcript supplied by the user, 2026-08-07). One source, one practitioner,
twenty minutes. It is an EXAMPLE of how a working producer phrases drums, not a
specification — the same rule this project has broken before. What it
legitimately does is name a structure the engine did not have at all.

Everything below is quoted or closely paraphrased from that transcript. Where a
number is mine rather than his, it says [EAR].

---

## §1 The claim that matters most: a drum part is phrased in eight bars

> "I generally define my rhythms with an A B A C A A D structure with each
> letter representing one bar of music."

Unpacked, in his own words:

| bar | letter | what it is |
|-----|--------|------------|
| 1 | **A** | "the core rhythm, the main structure that we will use to build variation around" |
| 2 | **B** | "one small change — an **addition**, **subtraction** or **substitution**" |
| 3 | A | "we return to the A section for bar three" |
| 4 | **C** | "a slightly bigger variation from bar B, but it doesn't need to incorporate B's changes, though it can" |
| 5–7 | A | the core again |
| 8 | **D** | "where we might introduce a **fill** or an **empty**, depending on the vibe" |

The letter count in the auto-transcript ("A B A C A A D") is seven for an
eight-bar phrase, so one letter is dropped in transcription. His spoken
description places A at 1 and 3, C at 4, D at 8, and "the A section" through
the middle. The engine treats the shape as a TABLE, drawn per genre, rather
than settling that ambiguity by decree.

**Three named kinds of change for B**, and this is the useful part — it says
what a variation IS rather than "make it different":

- **addition** — a hit that was not there
- **subtraction** — a hit that was there is gone
- **substitution** — a hit becomes a different drum

## §2 The fill and its opposite, the empty

> "A fill usually incorporates extra syncopation, extra snare hits on weaker
> beats, a couple extra kick drums on the eighth notes, and may also
> incorporate toms… we want to increase the energy in anticipation of the next
> phrase's downbeat."

> "The opposite of the fill is the **empty**… it must include the subtraction of
> most if not all of the main rhythmic elements before the next downbeat. This
> creates a different form of anticipation — a decoupling of the rhythmic
> elements between large musical sections."

> "The most basic form of this is dropping the kick drum out on the last measure
> of an eight-bar phrase on four-on-the-floor music, which destabilises the low
> end of the track and creates a vacuum that the listener will anticipate coming
> back."

And on how much: **"the larger the change in the next section, the more
anticipation we can create for it."** So the size of D should track the size of
what follows it.

## §3 Which beats take which sounds

The strength ordering, strongest first:

1. **the downbeat** — beat 1, "the strongest beat that we have access to perceptually"
2. **the other quarters** — 2, 3, 4. "Putting hits on these beats will create a very rooted steady pulse"
3. **the backbeat** — 2 and 4 specifically, "usually where we're going to put our snares and our claps"
4. **the offbeat eighths** (the "ands") — "bridges the gap and creates a simple but effective energetic gel that keeps the beats propelling forward"
5. **the sixteenths** (the "e" and the "a") — "generally the weakest beats that you will address"

And then the rule this project did not have:

> "If we put strong sounds with strong fundamental low frequencies like snares
> and kicks and low toms on these beats we're going to make a beat that feels
> off, one that loses coherence. If we're smart about using sounds on those
> parts of the rhythm we'll create a groove and interest."

> "In a house or techno beat you might not address the sixteenth notes with the
> same instruments you're using for your main beat or **spine beat** as I call
> it… then you'll address the weaker beats with things like percussion, toms,
> synthetic sounds or even vocal hits."

He demonstrates three versions and states a preference: all-low on the weak
beats, all-high on the weak beats, and **"a mix of both, which I believe is the
best way to go for these types of beats."**

## §4 The spine beat, as an exercise he gives

> "Try making a spine beat of kicks on 1 2 3 4, a snare or clap on 2 and 4, and
> a closed hi-hat on the ands, the offbeat eighths. Then try adding some hits
> around these on the e's and the a's."

## §5 Ghost notes

> "One very common thing for drummers to do is place what they call ghost notes
> here. These are generally a **quieter version of the same drum** played on
> stronger beats, and one of the most common drums to do this with is the
> snare."

## §6 What sets the phrase length

> "You have a core structure of repetition like a four-on-the-floor kick drum on
> its own — since this repeats the same way every beat it has no real concept of
> phrasing. However if we were to add a second kick on the last eighth note or
> upbeat of bar four, the phrase of the kick and subsequently the drums just
> jumped to four bars, **because that's the point at which the listener will
> recognise repetition**."

This is the mechanism behind §1: a phrase is however long it takes for the
pattern to come round, and one added hit in one bar is enough to set it.

## §7 Swing, for the record

> "House music commonly uses a sixteenth-note swing or shuffle which elongates
> the first and third sixteenth note while shortening the second and fourth."

The engine already warps time this way (`groove.swingUnit` 1 = sixteenths,
2 = eighths), so this corroborates rather than adds.

---

## What the engine had, and what it did not

**Had.** Swing as a time warp. Ghost notes as a per-bar coin. Tom shapes. A
fill at the end of a SECTION (16 bars). An "empty last bar" at a section end.
Accent maps from a corpus of 1,150 human performances.

**Did not have, and this is the gap the user calls "stale":**

- Any notion of a phrase between the bar and the section. The drum material is
  four bars, each one the pocket plus a couple of independent per-bar coins, so
  there is no A / B / A / C shape and nothing that comes round on eight.
- A named vocabulary for what a variation IS. `variants: {main, lift, depart}`
  changes a genre's whole kit table for a section; it cannot say "bar two is bar
  one with one hit added".
- Any rule keeping heavy drums off the weakest sixteenths (§3). `pocket` is free
  to put a kick on the last sixteenth, and several genre tables do.
- The **empty** anywhere except a section's final bar.

---

# §8 The correction: this applies to EVERY genre

The first implementation let a genre opt out through `form.varyAsBefore`,
exempting acid, minimal techno and jungle on the argument that hypnotic music's
interest comes from modulation rather than arrangement. **That was a guess, and
it was wrong.** The user's correction: *"the drum rules apply to every genre, it
is a rule of music. If the drum hits don't change, the FX does."*

Web research, August 2026. Every source agrees, including the one already quoted
above.

## The eight-bar phrase is not a producer's habit, it is hypermeter

> "The great majority of symmetrical periods have phrases of either four or
> eight measures, and indeed **the most common phrase length in Western tonal
> music is some multiple of four measures**: 4, 8, 12, etc. Many listeners hear
> hypermeter, a metrical organization that is larger than the notated measure."
> — [Carnegie Mellon University, *Hypermeter*](https://www.andrew.cmu.edu/user/johnito/music_theory/Form/Form1PhrPer/Hypermeter.pdf)

> "The square phrases are the easiest to grasp as they're the most practiced,
> especially those of four, eight, and sixteen measures."
> — [*Phrases, Period, and Form*, Old Music Theory](https://oldmusictheory.com/harmony-2/harmony/8-phrases-period-and-form/)

And in dance music specifically:

> "Electronic music's structure is built on 8-bar phrases… Professional
> producers typically structure their arrangements using 8, 16, and 32-bar
> sections."
> — [mastrng.com, *Techno Song Structure*](https://www.mastrng.com/song-structure-arrangement/)

> "A drum fill is a short phrase dropped into the main groove of a drum track
> **every eight or 16 bars** in order to energise the transition between
> sections of a song."
> — [*Drum Fills*, Computer Music](https://www.pressreader.com/australia/computer-music/20160518/281526520271381)

> "In bar 8 we're going to add a small fill or crash. But this fill has to be
> different from bar 16… 16 bars before you hear a pattern repeat gives your
> mind more space to breathe."
> — [*8 Bars and a Fill*, The Pro Audio Files](https://theproaudiofiles.com/phrasing/)

## The hypnotic genres change every 4–8 bars too — the MEDIUM differs

> "Minimal evolves through micro-variation (filtering, panning, tiny
> automation), not through adding new parts. **Every 4 to 8 bars, one thing is
> moved**: opening the hi-hat filter, **dropping the clap for a bar**, or
> automating decay on the shaker."
> — [beatkey.app, *How to Make Minimal Techno*](https://beatkey.app/how-to-make-minimal-techno-music)

> "Filter cutoffs, pan positions and volume can be automated by tiny amounts
> (1–3 dB, 100–300 Hz) **every 4–8 bars**."
> — [samplesound.com, *Minimal Deep Tech*](https://www.samplesoundmusic.com/blogs/news/minimal-deep-tech-the-ultimate-guide-to-producing-stripped-back-grooves)
> and [studiotronnic.com, *Minimal Tech House*](https://studiotronnic.com/blogs/news/minimal-tech-house-what-it-is-how-to-produce)

> "Lock the kick, sub and one static percussion element. Let everything else
> drift… **Bars 15–16: mute the offbeat hat** and drop a short reverb throw…
> Bars 17–24: hat returns… **Bar 31: mute the kick.**"
> — [myloops.net, *How to Build a Techno Groove That Doesn't Sound Repetitive*](https://www.myloops.net/how-to-build-a-techno-groove-that-does-not-sound-repetitive)

> "Minimal techno arrangements avoid static loops by constantly introducing
> small sonic changes every 8–16 bars."
> — [stealifysounds.com](https://stealifysounds.com/blogs/news/8-best-tips-how-to-produce-minimal-techno)

**Note what two of those moves are.** "Dropping the clap for a bar" is a
SUBTRACTION. "Mute the kick" is an EMPTY. Both are note changes, in the genres
I had declared incapable of them.

## And the original source said it outright

> "Listening to a lot of techno, especially the harder genres like schranz or
> banging techno, **taking the kick out and putting it back in is almost
> everything the genre does for song structure**."
> — Red Means Recording, the same transcript §1–§2 came from

The exemption contradicted its own source.

## What the engine does now

The letters are **universal**. `kit.phraseBy` says which medium carries them:

| value | B and C | D |
|-------|---------|---|
| `"notes"` (default) | the hits change | fill or empty |
| `"fx"` | a knob moves — the `phrase` motion kind | fill or empty, still |

`"fx"` still gets its D, because every source above puts a mute or a kick drop
at the phrase end in exactly the music that is supposed not to change its notes.
Acid and minimal techno declare `"fx"`; their hat filter opens on the B bar and
further on the C bar, and their clap dips where a note-phrased genre would drop
a hit — sized at the 100–300 Hz and 1–3 dB the sources give.

## Two seam checks had to be rewritten, not loosened

- **The polymetre check** inferred a period per lane and asserted minimal techno
  has odd ones and acid has none. Phrasing destroys that inference — a lane with
  one added hit has no single period. It now reads `kit.poly`, the genre's own
  declaration, and checks that those lengths do not line up with the bar and
  that the lanes sound.
- **The union-syncopation check** holds the kit to a kick on every strong beat.
  A D bar is exempt BY NAME, from `materials.drumPhrase`, because dropping that
  kick is the documented device rather than a fault.
