# Loop → Song: what the sources actually say

Research pass over the ten transcripts added to the repo (`001`–`009`, with two `007`s),
plus web research on the topics they raise. Written after the engine was measured and
found to be "five people playing but nobody playing together": 4.9 pitched voices
sounding at once, the chord voice audible 97% of the song, every pair of voices hitting
together more than chance.

**The headline finding, and it contradicts most of what the engine currently does:**

> A song is not made by generating different material for each section.
> It is made by taking ONE loop, spreading it across the whole timeline, and then
> SUBTRACTING — plus placing ONE moment that everything is arranged around.

Every practitioner source says this independently. The engine has been doing the
opposite: generating a second bass take, stamping hooks, transposing melodies per
section — manufacturing new material where the craft calls for removal.

---

## 1. The core method: spread, then subtract

| Source | What they do |
|---|---|
| `008` (house producer, 1-hour track) | Duplicates the loop across the **entire 5:20 timeline first**, then works by **disabling (muting) clips, never deleting** — so when a section is duplicated the mute pattern travels with it |
| `007 (8bar)` (Underdog) | Duplicate the loop **three times**. In the middle copy, **remove everything low-end / bass** → tension. The third is **the moment** |
| `009` (Andrew Huang) | The chord progression **loops for the entire 4-minute song**. Structure came from copy-pasting parts and making "sections with just the drums and bass alternating with parts that also had the synth pad" |
| `001` | Start with the chords alone, filtered in; add one thing per 8 bars |
| `005` (2-Loop Rule) | The **only** ways to change an arrangement: *add an instrument, add expression, remove an instrument, reduce expression* |

Ableton's own *Making Music* book frames it as the difference between painting and
sculpting: "beginning with a solid block of raw material and then gradually chipping
away at it, creating space where there used to be stuff, rather than filling space that
used to be empty." The stated benefit is that it "allows you to get the fundamentals out
of the way first" — and that "it's often easier to hear when something is bad than it is
to imagine something good."

**Andrew Huang's warning is aimed directly at what we built:**

> "It's so natural and easy to just keep layering — you can add all kinds of interesting
> stuff on top of your loop, which makes for a cool loop sometimes, but doesn't actually
> move you forward into a finished song. So I try to get into structure as early as
> possible."

And his fallback if you're already stuck: *"peel it back and maybe even take some parts
of your loop to make one section and other parts of the loop to make a second section."*
Verse and chorus are **different subsets of the same loop**, not different music.

### Engine implication
`activeRoles` per section is already the right mechanism — it is the *whole* job, not a
supporting trick. The material-generating passes (section-distinct melody transposition,
section-distinct harmony hold, the retired second bass take and hook stamp) are working
against the grain. Subtraction should be the primary arrangement verb.

---

## 2. The moment

`007 (8bar)` states the peak-first idea more cleanly than anything we had:

> "You're no longer creating a loop, you are creating a **moment**. You want that drop
> to be the maximum tension and release possible... Take away elements in advance and
> then give them all back on this moment. Then all you have to do is create a long intro
> to build up to that moment and a long outro to break down from that moment."

So the peak is not a section with more notes — it is **the loop, whole, arriving after
having been withheld**. Everything before it is defined by what is missing.

This also reframes what the engine's "peel" was trying to do. Peeling *notes* out of a
part by hash is not it; the practitioners remove **whole instruments**, and the thing
that returns at the moment is the complete, unmodified loop.

---

## 3. Intros are the loop minus the tune

Two independent sources give the same definition, and it is much simpler than the
seeded-subset rule currently in the engine.

`007 (structure)`:
> "Most typically the intro will effectively just be **the verse but without the verse
> melody having begun yet**... it kind of sets the song up so when the verse melody
> arrives it feels like it belongs there. We could describe this type of intro as a
> **vamp**."

`002` (analysing *Final Fantasy Tactics Advance*), on a two-bar setup before a melody:
> "**The lack of melody was literally the only difference** between the setup and the
> section that followed... diving right into this A-section after the intro would be a
> hectic presentation of a very calm and well-mannered melody."

Other intro types exist and are worth having as occasional variants: a **distinct riff**
that appears only there (*Sweet Child o' Mine*), an intro **unrelated to the verse**
(*Under the Bridge* — intro in F, verse in E), and the **re-intro**, where the opening
figure returns to close the song (*In My Life*).

### Engine implication
Default intro = the loop with the melodic voice held out. That is one line of logic and
it is what most records do. Our current weighted-random opener is more complicated *and*
less correct.

---

## 4. Transitions have three ingredients

`002` is the most analytically precise source in the set. A passage reads as a
transition rather than a section because of:

1. **Lack of melody** — no theme to latch onto; instead a repeating figure or
   single-bar fragments of earlier melodic material (a common classical-era move)
2. **Lack of harmonic stability** — sus chords, no resolution, drifting from home key
   ("dominant sus chords feel inherently floaty")
3. **Odd phrasing** — the established 4/8-bar expectation is broken. In the example the
   *last bar of the repeat is chopped off* and the transition begins there; elsewhere
   sections break into 4+1+3 and 5+2 bar chunks

> "A transition should make you feel like you're getting scooped up and thrown into the
> air with no idea where or when you're going to land."

Related device — **writing in sequence**: take a short idea and repeat it moving up or
down a step through the progression, often drifting chromatically away from home. Both
`002` and `003` single this out ("you won't hear a Mozart piece that doesn't move a
melody around in sequence at least once").

Practical transition tools from the EDM sources: risers (tonal and white-noise), snare
rolls, **reverse reverb** (`007 8bar` — put a huge reverb on any sound, freeze, reverse:
it fills the spectrum and creates contrast at the moment of transition), a drum fill on
the entry side, and total silence on the exit side. `005` notes every transition has
**two sides** — an exit and an entry — and both want treatment.

---

## 5. Drums: phrasing and the "empty"

`004` gives a bar-level grammar that our drum engine already partly implements
(`ABACAAD`):

- **A** = the core rhythm
- **B** = one small change (addition, subtraction, or substitution)
- **A** = return
- **C** = a slightly bigger variation (need not include B's change)
- **A A**
- **D** = **a fill *or* an empty**

> "The larger the change in the next section, the more anticipation we can create for it."

The **empty** is the part we do not have, and it is cheap and powerful:

> "The opposite of the fill is the empty... it must include the subtraction of most if
> not all of the main rhythmic elements before the next downbeat. This creates... a
> decoupling of the rhythmic elements between large musical sections. The most basic
> form is dropping the kick out on the last measure of an eight-bar phrase, which
> destabilises the low end and creates a vacuum that the listener will anticipate coming
> back. Listening to a lot of techno... taking the kick out and putting it back in is
> almost everything the genre does for song structure."

Also useful: **ghost notes** (a quieter version of the same drum on weak 16ths), and the
principle that the **spine** (kick/snare/hat on strong beats) and the **weak-beat
material** should use *different* instruments — with a mix of low and high frequency
content on the weak beats being best.

---

## 6. The rule of three

`006` gives the repetition threshold precisely:

- Once = intriguing, but not yet memorable
- Twice = reinforced; the listener can now sing it back
- **Three times = the brain begins to tune it out**

So on the third pass you must do one of two things:

1. **Go somewhere different** — new melody over the same chords, or a new progression
2. **Start the same, then diverge** partway through ("oh yeah I've heard this before —
   but you haven't, because we're going to go somewhere different")

Option 2 is exactly what `003` finds in the Zelda theme's B section: *"The first two
bars are identical to the first time around, which puts us in a false sense of security.
But then bar three... it's at this point that we realise we've been duped."* It is also
the classical **ABAC** form from `007 (structure)`: one A answered by two different
responses.

---

## 7. Motivic development (how a melody earns its length)

`003`'s Zelda analysis is the best model in the set for how one small idea becomes a
whole tune:

> "Each phrase takes the last piece of the melody and adds something to it or twists it
> in a new way... each bar building on the last **without ever repeating an idea or
> figure exactly**."

The chain: motif (leap down root→fifth) → same interval *inverted* upward with the gap
filled by a scale run → same shape but in the **parallel minor** and in **triplets**
instead of 16ths → same again but with a turn that **delays the resolution from beat 1
to beat 2**. On that last one:

> "Small melodic surprises like this are the kind of thing that separates good melodies
> from legendary ones."

Two things here matter enormously for our engine and we have neither:

**Held notes make room for an inner voice.** *"The melody is smartly arranged... with
lots of held notes that leave space for the inner voice to move. Just about every single
bar features some echoing of melodic fragments in this inner voice."* The accompaniment
answers **in the melody's gaps**, using **the melody's own fragments**.

**When the melody matters most, the inner voice stops.** *"We can tell it's important
because it's not being obscured by inner counterline movement like the rest of the
melody was."* Support is not a constant level — it withdraws at the climax.

---

## 8. Support the lead — and get out of its way

`009` gives the three production questions to ask of every added element:

1. How do we create **dynamics** (high- and low-energy parts)?
2. How do we create **transitions** between them satisfyingly?
3. How do we **support the lead** — elevate and accentuate it, *and where do we need to
   get out of its way?*

Concrete techniques from the same source:

- **Five bass synths** all playing the same looped progression, entering at different
  times and sometimes layered — dynamics from one part, by arrangement alone
- **Arpeggios are "halfway between chord and melody"** — a broken chord supports the
  lead more interestingly than a held chord, "but they're still repetitive and in the
  background so they still stay out of the way"
- **The lead does not play constantly.** "A lead part doesn't usually go constantly
  throughout the whole song, so in the spaces it leaves you often want to add a little
  something else to maintain the interest" — a drum fill, a sound effect, a melody on a
  different instrument. "These are the things that elevate a song from being solid to
  being magical."
- **Foreshadow the hook with the hook's own notes on another instrument**: the
  collaborator "took the main notes from my chorus melody and played them on different
  synths during the intro and in the background of the verses."

That last one is the literal form of the thing this project has been chasing — *"lay
down one track then use its notes to create the next track."* It is not harmonisation or
mirroring; it is **the hook's pitches, reduced, on a different voice, in a different
section.**

---

## 9. Perpetual variation for free: coprime loop lengths

`008` does something we have never tried and it is the cheapest possible source of
long-form variation:

> "I took six and looped six... now we have this weird five-six thing kind of just
> forever rotating on top of itself... it's off enough that you won't be able to catch
> it because everything else is moving on eight bars and sixteen bars, and then there's
> just this thing."

Web research confirms this is a formalised technique. Polymeter — combining loops of
different lengths so they "slip relative to each other, the way oscillators with
different frequencies shift phase" — is *"more interesting when the loop lengths being
combined are relatively prime, as such loop combinations gradually drift apart and then
drift back together in a predictable way, producing intricate patterns of interference."*
The resulting interference is described as intricate enough to generate *"variations
similar to the embellishments of a live performer."* Eno's *Music for Airports* is built
on exactly this — tape loops of differing lengths.

`004` distinguishes it from polyrhythm properly: **polymeter** = same beat length,
different bar lengths (downbeats misalign); **polyrhythm** = same bar length, different
subdivisions (downbeats align, grids don't). It also warns that polyrhythm "should be
approached carefully by a novice as to not make their composition sound messy."

### Engine implication
A 5- or 6-bar ornament loop running against the 8-bar grid gives us endless
non-repeating variation **with no new material and no risk of harmonic clash** (the
notes are already validated). This is a far better answer to "the loop repeats too much"
than generating second takes.

---

## 10. Form vocabulary (from `007 (structure)`)

Worth having as an explicit table rather than the ad-hoc FORM strings we use now:

| Form | Shape | Notes |
|---|---|---|
| Strophic | AAA | One section repeating. Hymns, anthems, folk |
| Binary | ABAB | Verse/chorus. *Hotel California*, *Foxy Lady* |
| Verse–pre–chorus | ABCABC | The pre-chorus is the third section |
| 32-bar | AABA | Each section 8 bars; the B is the **middle eight** |
| ABAC | ABAC | One A, answered two different ways. *White Christmas* |
| Through-composed | ABCDE | Never returns. *Bohemian Rhapsody* |
| Front-loaded chorus | BABA | Opens with the chorus — common in rap, *Eleanor Rigby* |

Plus section types: **pre-chorus**, **post-chorus** (*Smells Like Teen Spirit*),
**bridge** (last third, tonally elsewhere), **coda** (new material at the very end —
*Hey Jude*, *Layla*), **refrain** (a short hook tagged to the end of each verse, not a
full section — *Blowin' in the Wind*).

On the **bridge**, the strongest device is a **key change** — *Summer of '69* (D→F),
*Clocks* (E♭→D♭), *Say It Ain't So* (E♭→B♭) — and the reason given is that you get
**"two for one"**: a shift going in, and another coming back out.

And a definition worth pinning: the chorus is *"the section that is the main pinnacle,
the main focus point of the song — usually the dynamic peak — and it will typically also
be a section where the lyrics are kept the same on every repetition, unlike the verse."*
The **melodic** content recurs; the arrangement around it need not.

---

## What this means for the engine (ranked)

1. **Arrangement is subtraction.** Make `activeRoles` the primary compositional verb and
   delete the material-generating section passes. Verse and chorus are subsets of one
   loop.
2. **Give the lead rests.** It currently sounds ~92% of the song; sources are unanimous
   that the lead leaves gaps and that something else answers *in* those gaps.
3. **The inner voice echoes the lead's fragments in its gaps, and withdraws at the
   climax.** This is the concrete, note-level form of "use one track's notes to write the
   next."
4. **Intro = the loop minus the melody** (a vamp). One rule, replaces the current
   weighted-random opener.
5. **Add the "empty."** Drop the kick (or everything) for the last bar before a big
   change. Techno gets a whole genre out of this.
6. **Coprime ornament loops** (5 or 6 against 8) for perpetual variation with zero new
   material.
7. **Transitions need all three ingredients** — no melody, unstable harmony, odd
   phrasing — not just a riser.
8. **Rule of three**: never a third identical pass; either depart, or start-same-then-
   diverge.
9. **Foreshadow the hook** by playing its reduced pitch set on a different voice in the
   intro and under the verses.

---

## Sources

Transcripts in the repo: `001`, `002` (transitions / FF Tactics Advance), `003` (Zelda
theme analysis), `004` (rhythm fundamentals — Red Means Recording), `005` (the 2-Loop
Rule), `006` (the Rule of 3), `007 (8bar)` (Underdog — loop to moment), `007
(structure)` (song form taxonomy), `008` (1-hour loop-to-track, house), `009` (Andrew
Huang — loop to song).

Web research:

- Ableton, *Making Music* — "Arranging as a Subtractive Process" — https://makingmusic.ableton.com/arranging-as-a-subtractive-process
- The REAPER Blog, "Subtractive Song Arrangement — Building a song with Loops and Mutes" — https://reaper.blog/2016/08/subtractive-song-arrangement-building-a-song-with-loops-and-mutes/
- EDMProd, "How to Arrange Your Song with Subtractive Music Production" — https://www.edmprod.com/subtractive-music-production/
- Mastering.com, "Subtractive Production: The Power of Muting" — https://mastering.com/subtractive-production-the-power-of-muting-for-a-professional-sound/
- EDMProd, "The Advanced Guide to Tension and Energy in Electronic Music" — https://www.edmprod.com/tension/
- Point Blank, "Creating Tension and Release in Electronic Dance Music" — https://www.pointblankmusicschool.com/blog/creating-tension-and-release-in-electronic-dance-music/
- Polymeter (Victim of Leisure) — concepts: relatively-prime loop lengths and phase interference — https://polymeter.sourceforge.io/Help/Concepts/Polymeter.htm
- "An Efficient Algorithm For Composing Polyrhythmic Sequences" — https://www.researchgate.net/publication/332950760_An_Efficient_Algorithm_For_Composing_Polyrhythmic_Sequences
- MusicRadar, "11 tips and tactics for better song arrangements" — https://www.musicradar.com/how-to/song-arrangement-tips
