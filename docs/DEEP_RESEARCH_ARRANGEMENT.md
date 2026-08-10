# Deep research: arrangement, and getting from a loop to a song

A second, deeper research pass, following `LOOP_TO_SONG.md` (which distilled the ten
transcripts in the repo). This one goes past the transcripts into production literature,
music-cognition research, and the academic work on algorithmic arrangement, looking for
things that are **stated the same way by independent sources** — because those are the
ones worth building an engine on.

Context for why this matters: the engine was measured at 4.9 pitched voices sounding at
once, the chord voice audible 97% of the song, every voice pair hitting together more
than chance. Nothing in the research below describes music made that way.

---

## 0. The one law everything else hangs off

Six independent sources — three practitioner transcripts, two production schools, and
one AI-music-structure paper — describe the same method in almost the same words:

> **Take the loop at its FULLEST state, copy it across the whole timeline, and then mute
> your way backwards.** Sections are made by removing, not by writing.

| Source | Wording |
|---|---|
| Hyperbits | "Start with your 8-bar loop at full instrumentation (**your final chorus**). Copy it across the arrangement, then **mute as many tracks as you can get away with**... It's easier to take away what's already there than trying to add what isn't." |
| Ableton, *Making Music* | "Beginning with a solid block of raw material and then gradually chipping away at it, **creating space where there used to be stuff**, rather than filling space that used to be empty." |
| `008` (house producer) | Duplicates the loop across the full 5:20 timeline, then works entirely by **disabling clips — never deleting** |
| `007 (8bar)` | Duplicate ×3; strip the middle; the third is the moment |
| `009` (Andrew Huang) | Chord loop runs **unchanged for the whole 4-minute song**; sections are subsets |
| Libretto (arXiv 2606.22708) | "**Variation through parameters**: control instruments, dynamics and effects per section **rather than regenerating entire sections**" |

That last one matters because it is the same conclusion reached from the algorithmic
side: an AI arranger works better when sections are *parameterisations of shared
material* than when each section is generated afresh.

**Ableton also gives the reason it works**, which is a claim about the producer, not the
music: *"It's often easier to hear when something is bad than it is to imagine something
good."* Subtraction converts composition into evaluation. That translates directly to a
generative engine: **choosing what to silence is a far better-posed problem than
choosing what to invent.**

---

## 1. Repetition is the mechanism, not the failure mode

This is the finding that most contradicts how our test suite is written.

Elizabeth Margulis (*On Repeat*, OUP) opens with the question *"why is it that we accept,
even enjoy, degrees of repetition in music that would be repugnant in almost any other
domain?"* The mechanisms she documents:

- **Attentional shift from local to global.** Repeated playing triggers *"an
  attentional shift from more local to more global levels of musical organization"* —
  you stop hearing notes and start hearing structure. A section cannot be *heard as* a
  section until its material has repeated.
- **Repetition surfaces detail.** It acts as *"a kind of engine"* driving *"attention to
  otherwise perceptually inaccessible qualities of the sonic surface"* — background
  elements move to the foreground purely through iteration. **This is why subtractive
  arrangement works at all**: the thing you keep becomes audible *because* the rest was
  removed and the loop repeated.
- **Repetition increases perceived artistry.** Adding repetition to a piece raises
  *"people's enjoyment, interest, and judgements of artistry."*
- **Repetition creates inhabitation, not information.** The pleasure *"might stem less
  from increasing knowledge about the piece than from a growing sense of inhabiting the
  music: a transportive, even transcendent kind of experience."*

Set against the **rule of three** (`006`): once = intriguing, twice = memorable, three
identical times = the brain tunes out. These are not in conflict. The rule of three is
about *literal identity with no change*; Margulis is about *return*. The synthesis:

> Material must **recur** constantly — that is what makes it music. What must not recur
> is the **exact same total texture** three times running. Change one thing and the same
> material is welcome indefinitely.

### Engine consequence
Our suite has tests rewarding *variety* (distinct rhythms per song, loops not identical)
and a history of me adding generators to satisfy them. That is backwards. The correct
invariant is: **the loop repeats; the arrangement around it must not be identical three
times.** We already have "no 3 consecutive identical full textures" — that is the right
law and it should be the *only* anti-repetition law.

---

## 2. The energy map

EDMProd gives the most concrete quantification found:

- Energy is rated on a **1–9 scale** per section.
- The energy map is drawn **as an automation clip before production begins** — the shape
  of the song is decided before the content.
- **Adjacent sections should differ by 2–3 levels.** Less is monotony; much more is
  jarring. *"Overly consistent energy levels lead to a bland and boring track"* — and
  amateurs consistently choose too little contrast.
- **Macro-tension** (across sections): risers, filter automation, adding/removing
  instruments, snare builds — best applied in **three layers** (subtle evolving base →
  more obvious second → most dramatic third).
- **Micro-tension** (within bars): reverse crash, kick removal, 1–2 bar fills, reverse
  reverb, an unexpected chord.
- Concrete numbers: snare rolls **4–8 bars**, **leaving one final bar silent before the
  drop**; crashes every 8/16/32 bars; changes land on 4/8/16/32-bar boundaries;
  high-pass sweeps 30 Hz → 175 Hz+ on the master.

Note that *"leaving one final bar silent before the drop"* is the **empty** from `004`,
arrived at independently. Two sources, one device — that is a strong signal it belongs
in the engine.

---

## 3. The change cadence

How often must something change? The sources cluster tightly:

| Source | Rule |
|---|---|
| `005` (2-Loop Rule) | The arrangement must change **every two loops of the chords**, "because our a verdict on it naturally expect songs to change every two loops of the main instruments" |
| `001` | Something changes **every 8 bars** — "every eight bars of the grid is like a page in a book" |
| eMastered / Abstrakt | "Every new 8-bar loop needs to have a change" |
| Deviant Noise | "Change something up **every 4 bars** across the entire arrangement, even if it's subtle" |

And the **four legal moves** (`005`) — this is a closed set, which is exactly what an
engine wants:

1. Add an instrument
2. Add expression to an existing instrument
3. Remove an instrument
4. Reduce expression of an existing instrument

Two further constraints from `001`, both about **preserving headroom**:

- *"Avoid bringing instruments in for as long as possible — this way I have something to
  build to."*
- *"Any time you drop an element, **start small** — leave yourself enough material to
  build with."* (When the drums arrive, they arrive without hats and clap, so the hats
  and clap are still available as later escalations.)

That second one is a genuine insight we do not implement: an instrument's *first*
entrance should be a **reduced** version of itself, so its full version is still an
unspent card.

---

## 4. Transitions

`002` (analysing *Final Fantasy Tactics Advance*) is the most precise source in the
entire set. A passage is heard as a transition rather than a section because of three
things:

1. **No melody** — a repeating figure or one-bar fragments of earlier melodic material,
   never a singable theme. Reusing fragments of the melody is explicitly called *"a very
   common move in classical-era transitions."*
2. **No harmonic stability** — sus chords, unresolved, drifting from home. *"Dominant sus
   chords feel inherently floaty."*
3. **Odd phrasing** — the established 4/8-bar grid is violated. In the analysed example
   the **last bar of the repeat is chopped off** and the transition starts there;
   elsewhere phrases run 4+1+3 and 5+2.

> *"A transition should make you feel like you're getting scooped up and thrown into the
> air with no idea where or when you're going to land."*

`005` adds that every transition has **two sides** — an **exit** (the bar leaving) and an
**entry** (the bar arriving) — and both want separate treatment: the exit often gets
silence or a fill, the entry gets an impact or effect.

Devices, pooled across sources: risers (tonal and noise), snare rolls, **reverse reverb**
(any sound + enormous reverb + freeze + reverse — fills the whole spectrum and creates
contrast at the seam), reverse crash, drum fill on the entry, total silence on the exit,
and the **empty**.

Also from `002` and `003`: **writing in sequence** — take a short figure and repeat it
moving up or down a step through the progression, often drifting chromatically away from
home. *"You won't hear a Mozart piece that doesn't move a melody around in sequence at
least once."*

---

## 5. Variation without new material

The practical question for a loop-based engine: how do you keep a fixed loop alive?
Nothing in the literature says "generate a second take." What it says:

**Coprime loop lengths (the strongest idea found).** `008` layers 5-bar and 6-bar
ornament loops against an 8/16-bar grid so they *"forever rotate on top of each other...
off enough that you won't be able to catch it."* Formalised: polymeter combines loops of
different lengths so they *"slip relative to each other, the way oscillators with
different frequencies shift phase,"* and is *"more interesting when the loop lengths
being combined are relatively prime... producing intricate patterns of interference"* —
intricate enough to yield *"variations similar to the embellishments of a live
performer."* Eno's *Music for Airports* is built on exactly this.

`004` draws the distinction properly: **polymeter** = same beat, different bar lengths
(downbeats drift apart); **polyrhythm** = same bar, different subdivisions (downbeats
align, grids don't) — and warns polyrhythm *"should be approached carefully by a novice
as to not make their composition sound messy."* Polymeter is the safe, generative one.

**Timbral and filter modulation.** Sound on Sound: *"tonal modification is a fast way of
generating loop variations"* — and specifically, mixing **positive and negative**
modulation sources produces more variation than all-positive. Multiple LFOs at different
rates (one tempo-synced, one free) create *"tonal change that is not obviously
periodic."* Tonal variation is called *"the greatest indicator of dynamic performance."*

**Muting individual hits.** Clip envelopes to drop single notes out of a loop on some
passes.

**Small transposition.** ±1 semitone in a drum map lands on a neighbouring, usually
compatible sound.

All four of these change **nothing about the composition** — they cannot introduce a
wrong note, because no new pitches are created. For a generative engine bound by
harmonic law, this is the cheapest possible variation budget.

---

## 6. How voices relate: lead, space, and answering

Converging across `009`, `003` and the arrangement literature:

- **The lead does not play continuously.** *"A lead part doesn't usually go constantly
  throughout the whole song, so in the spaces it leaves you often want to add a little
  something else to maintain the interest"* — a fill, an effect, a melody on another
  instrument. *"These are the things that elevate a song from being solid to being
  magical."*
- **The inner voice answers into the lead's held notes.** `003` on the Zelda theme:
  *"lots of held notes that leave space for the inner voice to move. Just about every
  single bar features some echoing of melodic fragments in this inner voice."* The
  answering material is **fragments of the melody itself**.
- **Support withdraws at the climax.** *"We can tell it's important because it's not
  being obscured by inner counterline movement like the rest of the melody was."*
  Accompaniment density is not constant — it drops to zero exactly where the tune matters
  most.
- **Arpeggios are the middle ground.** *"Halfway between chord and melody... a broken
  chord, but they support the lead in a more interesting way than just holding down a
  chord — but they're still repetitive and in the background so they still stay out of
  the way."*
- **Foreshadow the hook with its own pitches on another instrument.** `009`: the
  collaborator *"took the main notes from my chorus melody and played them on different
  synths during the intro and in the background of the verses."*

That last device is the literal, concrete form of the thing this project has been trying
to build for weeks — *"lay down one track and use its notes to make the next."* It is
not harmonisation, mirroring, or counterpoint generation. It is: **take the hook's
pitches, reduce them, put them on a different voice, in a different section.**

And the three questions to ask of every element added (`009`): *how does this create
dynamics; how does this create transitions; how does this support the lead — and where
does it need to get out of the way?*

---

## 7. Density and register

- A typical pop chorus runs about **seven simultaneous layers**, each in a *different
  frequency range and musical role*. The stated golden rule: **each layer must bring
  something different**; "the best arrangements use just enough layers to fill the space
  without overcrowding it."
- **In the sub, only one element at a time** — one kick, one bass, one FX.
- The mid-range is where clashes happen because *"so many elements occupy this range,"*
  so selectivity there matters most.
- Hyperbits, quoting Saint-Exupéry as an arrangement rule: *"Perfection is achieved, not
  when there is nothing more to add, but when there is nothing left to take away."*

Our measured 4.9 simultaneous *pitched* voices is not far off "seven layers" in raw
count — but seven layers assumes **role and frequency separation**, and ours were four
mid-register melodic voices plus a permanent chord pad. The count was never the problem;
the **absence of distinct roles and registers** was.

---

## 8. Structural grammar

From `007 (structure)`, with bar counts from the EDM sources:

| Form | Shape | Notes |
|---|---|---|
| Strophic | AAA | Hymns, anthems, folk |
| Binary | ABAB | Verse/chorus |
| Verse–pre–chorus | ABC | Pre-chorus as third section |
| 32-bar | AABA | 8 bars each; B = the "middle eight" |
| ABAC | ABAC | One A, two different answers |
| Through-composed | ABCDE | Never returns (*Bohemian Rhapsody*) |
| Front-loaded chorus | BABA | Opens on the hook — common in rap |

Section types: pre-chorus, **post-chorus**, bridge (last third, tonally elsewhere), coda
(new material at the very end), refrain (a short hook tagged to each verse, not a full
section).

Lengths: intros **8, 16 or 32 bars**; phrase changes on **4/8/16/32**; two breakdowns
typical (a shorter early one, a longer mid-track one); **8-bar phrases** as the default
unit.

The **bridge key change** is singled out as the strongest contrast device available
because it pays **"two for one"** — a shift going in and another coming back out
(*Summer of '69* D→F, *Clocks* E♭→D♭, *Say It Ain't So* E♭→B♭).

And the definition of a chorus worth pinning: *"the section that is the main pinnacle,
the main focus point of the song — usually the dynamic peak — and typically a section
where the lyrics are kept the same on every repetition, unlike the verse."* The
**melodic content recurs**; the arrangement around it need not.

---

## 9. What this means for our engine

Ranked by expected audible gain per unit of risk. Items 1–3 are mostly **deletions**.

1. **Make subtraction the only arrangement verb.** The loop is composed once at full
   strength (that *is* the peak); sections are subsets. Delete the material-generating
   section passes (section-distinct melody transposition, section-distinct harmony hold).
   Six independent sources; no dissent.
2. **Stop testing for variety; test for recurrence + non-identical texture.** Margulis
   says repetition is the mechanism of musical pleasure. Keep exactly one anti-repetition
   law: no three consecutive identical full textures.
3. **Give the lead rests, and answer into them.** The lead currently sounds 92% of the
   song. It should phrase-rest, and the answering material should be **fragments of its
   own line** on another voice — then fall silent at the peak.
4. **Draw the energy map first.** A 1–9 value per section, adjacent sections differing by
   2–3, decided before any note-level arrangement. Then derive layer count from it.
5. **Intro = the loop minus the melody** (a vamp). One rule; two independent sources.
6. **Add the "empty."** One bar with the rhythm section removed before every big arrival.
   Two independent sources call it essential; techno is described as getting an entire
   genre out of it.
7. **First entrances are reduced.** When a part enters, it enters without its top layer,
   so the full version remains available as a later escalation.
8. **Coprime ornament loops** (5 or 6 against 8) for perpetual variation at zero
   compositional risk.
9. **Transitions need all three ingredients** — no melody, unstable harmony, odd phrasing
   (chop the last bar) — plus separate exit and entry treatment.
10. **Foreshadow the hook's pitches on another voice** in the intro and under the verses.

---

## Sources

**In-repo transcripts:** `001`, `002` (transitions, FF Tactics Advance), `003` (Zelda
theme analysis), `004` (rhythm fundamentals, Red Means Recording), `005` (2-Loop Rule),
`006` (Rule of 3), `007 (8bar)` (Underdog), `007 (structure)` (song form taxonomy),
`008` (1-hour loop-to-track), `009` (Andrew Huang, loop to song).

**Music cognition**
- Margulis, *On Repeat: How Music Plays the Mind*, Oxford University Press — https://global.oup.com/academic/product/on-repeat-9780199990825
- Notes/summary of *On Repeat* — https://brettworks.com/2014/08/14/notes-on-elizabeth-marguliss-on-repeat-how-music-plays-the-mind/
- *Music Theory Online* 20.4, review of *On Repeat* — https://www.mtosmt.org/issues/mto.14.20.4/mto.14.20.4.albrecht.html

**Arrangement method**
- Ableton, *Making Music* — "Arranging as a Subtractive Process" — https://makingmusic.ableton.com/arranging-as-a-subtractive-process
- Hyperbits, "Song Arrangement: How an 8-Bar Idea Becomes a Record" — https://hyperbits.com/blog/song-arrangement/
- Hyperbits, "EDM Song Structure" — https://hyperbits.com/blog/edm-song-structure/
- EDMProd, "The Advanced Guide to Tension and Energy in Electronic Music" — https://www.edmprod.com/tension/
- EDMProd, "How to Arrange Your Song with Subtractive Music Production" — https://www.edmprod.com/subtractive-music-production/
- The REAPER Blog, "Subtractive Song Arrangement" — https://reaper.blog/2016/08/subtractive-song-arrangement-building-a-song-with-loops-and-mutes/
- Mastering.com, "Subtractive Production: The Power of Muting" — https://mastering.com/subtractive-production-the-power-of-muting-for-a-professional-sound/
- Point Blank, "Creating Tension and Release in Electronic Dance Music" — https://www.pointblankmusicschool.com/blog/creating-tension-and-release-in-electronic-dance-music/
- MusicRadar, "11 tips and tactics for better song arrangements" — https://www.musicradar.com/how-to/song-arrangement-tips
- Deviant Noise, "How to Arrange Music, Songs and Beats" — https://deviantnoise.net/education/music-production/arrangement/
- eMastered, "8 Bar Loops" — https://emastered.com/blog/8-bar-loop

**Variation / polymeter**
- Sound On Sound, "Unlooping The Loop" — https://www.soundonsound.com/techniques/unlooping-loop
- Icon Collective, "Ableton Live: How to Add Variation to Loops" — https://www.iconcollective.edu/ableton-live-loop-variation-tips
- Polymeter — concepts, relatively-prime loop lengths and phase interference — https://polymeter.sourceforge.io/Help/Concepts/Polymeter.htm
- "An Efficient Algorithm For Composing Polyrhythmic Sequences" — https://www.researchgate.net/publication/332950760_An_Efficient_Algorithm_For_Composing_Polyrhythmic_Sequences

**Density / layering**
- Waves, "The Ultimate Guide to Clarity & Separation in your Mix" — https://www.waves.com/ultimate-guide-to-clarity-and-separation-in-your-mix
- Major Mixing, "Music production secrets (Arrangement)" — https://majormixing.com/music-production-secrets-arrangement/
- Visible, "Layering in Music Production" — https://www.visible.edu/blog/layering-in-music-production-10-essential-elements

**Algorithmic arrangement**
- "Libretto: Giving LLM Agents a Sense of Musical Structure", arXiv 2606.22708 — https://arxiv.org/pdf/2606.22708
- "AccoMontage2: A Complete Harmonization and Accompaniment Arrangement System", arXiv 2209.00353 — https://arxiv.org/pdf/2209.00353
