# TELLING A STORY WITH INSTRUMENTS — the four devices fantasy synth needs

*2026-08-19. Owner: "we need more web based research on the music theorys we
will be using like call and response and counter point and telling a story with
music."*

The repo already holds `counterpoint.md`, `counterpoint-measured.md`,
`call-and-response.md`, `melodic-math.md`, `development.md` and
`STORY_AND_MATERIAL.md`. **This sheet does not repeat them.** It covers the
four things fantasy synth needs that none of them answer.

---

## 1. THEMATIC TRANSFORMATION — the named operations

A theme that "returns transformed" is not a vague instruction. The technique has
a name, a history (Liszt and Berlioz developed it) and a closed list of
operations:

| operation | what it does | what it MEANS |
|---|---|---|
| **transposition / modulation** | the theme moves to another pitch or key | new ground, same character |
| **inversion** | "the direction of intervals is reversed: an ascent becomes a descent" | contrast, or surprise |
| **retrograde** | the order of notes is reversed | disorientation |
| **augmentation** | the theme is lengthened | "a sense of **grandeur or drama**" |
| **diminution** | the theme is shortened | "a sense of **urgency or excitement**" |
| **fragmentation** | only part of it is played | "**by not completing the leitmotif, you communicate something about how that character is developing or responding to events**" |

And three that are not alterations of the notes at all: a motif may **pass from
one voice to another**, appear in **a different register**, or receive **new
harmonic support**.

### Which one goes where in this record

This maps onto the brief almost without interpretation:

| movement | the hero's theme | the monster's theme |
|---|---|---|
| setting out | **stated whole**, its own instrument | **a fragment**, buried, wrong register — foreshadowing |
| into the deep | **fragmented** — the character is struggling, and fragmentation is how you say so | **augmented** underneath, growing |
| the fight | **diminished** — urgency — and passed between voices | **stated whole**, its own lead |
| the long way home | **augmented** — grandeur — whole for the first time since the opening | **a fragment**, if anything |

Fragmentation is the load-bearing device and it is the one the sources are
clearest about: *an incomplete theme is a statement about the character*. The
repo's own `STORY_AND_MATERIAL.md` §2 already says the same thing from the
other side — "why a motif should arrive incomplete".

---

## 2. THE DUEL HAS A NAME, AND AN ESCALATION

> "Two different instrumental soloists can trade 4s with each other, such as
> the trumpet and the sax. **This is called a chase.**"

So the fight is a **chase**, and the exchange length is the escalation:

- **trading fours** — four-bar phrases, the standard unit, "a friendly duel"
- **trading twos** — "forces each player to come up with **succinct** musical
  phrases and invites each player to **respond** to his/her partner"
- **trading ones**, and then overlap

The shortening IS the intensification, and it needs no change in tempo, volume
or density to work. That is the whole structure of the duel the owner chose:
**fours → twos → ones → both at once.**

Antiphony is the classical name for the same thing, and the **concerto grosso**
is its formal version: a small solo group answered by the full band, where "the
core is the rapid exchange of musical ideas" and the drama comes from
**terraced dynamics** — a quiet intricate figure answered by a loud robust one.

---

## 3. BATTLE MUSIC — what the sources actually prescribe

> "Battle music is all about action, intensity and power, and will almost
> always be **heavily focused on strong and powerful percussion**. Rhythmic
> parts like **ostinatos, stabs**… should complement the percussion mix.
> Additionally, **brass** instruments seem to go hand in hand with battle
> music, with **stabs, rips, effects, and bold epic melodies on horns**."

Three prescriptions, all of which this program can already do: percussion in
front (the owner has already ruled the drums forward), a rhythmic **ostinato**
as the anchor, and **brass**, which is already built.

### And the growth does not come from speed

> "Rather than relying solely on rhythmic acceleration, the sense of continual
> growth comes from the **gradual increase in dynamics, the addition of
> instruments, the changing orchestration, and the increasing density of the
> sound**" — the *Boléro* method, where "musical form can emerge through
> orchestration… even when the basic material remains almost unchanged."

That is a direct instruction for how to reach a climax at fifteen minutes: **add
instruments and density on a fixed ostinato**, and let the tempo arc be one
contributor rather than the whole mechanism. It is also the same finding as
`STORY_AND_MATERIAL.md` §3B — the frame changes, not the loop.

---

## 4. LONG FORM — and the reassuring finding

The worry with four modes across twenty minutes is that the record stops being
one piece. Holst answers it:

> Holst "sustained attention for **seven movements spanning almost an hour**
> with no content other than the personalities and moods represented by each
> planet, **with no story line, no overarching form… nothing but mood and the
> richness of the melodic subjects and rhythmic figures**."

Seven movements, an hour, **no unifying formal scheme at all** — held together
by each movement having a strong and specific character. And Holst's own
unifying language is modal: *Jupiter* runs pentatonic ostinati, Mixolydian and
Dorian runs.

**So a mode per movement is not a threat to coherence. It is the mechanism that
produces it.** What holds a long record together is that each movement is
unmistakably itself — and, here, two themes that walk through all four.

---

## 5. WHAT THIS SHEET ASKS THE BUILD TO DO

1. **Four chord sets, one per movement, each in its own mode.** The seam
   already exists: `mkChords(degrees, key, mode)` takes both, and
   `bridgeChords` already uses it to put the bridge in another mode via
   `keyShift`. Three of the four movements already have a chord-set slot
   (`chords`, `chorusChords`, `bridgeChords`); this is a fourth plus a
   per-movement mode declaration, not a new idea.
2. **Two themes with the six transformation operations available**, and a
   declared schedule of which operation each movement applies.
3. **The chase**: exchange length shortening 4 → 2 → 1 → overlap.
4. **Density as the climb**: instruments entering over a fixed ostinato, with
   the tempo arc as one voice in that and not the whole of it.

## Sources

- Thematic transformation — Wikipedia; Study.com; *Mastering Leitmotif in
  Composition*; AP Music Theory 6.5 Motivic Transformation
- The chase and trading — *Rapp on Jazz*; *Trading Twos*; MTO, "Rethinking
  Interaction in Jazz Improvisation"; concerto grosso sources
- Battle music — *How to Compose Battle Music*, Professional Composers;
  Evenant on cinematic ostinati; *Boléro* orchestration analysis
- Long form — Holst *The Planets* programme notes and analyses; "What Is
  Specifically Holstian About *The Planets*?"
