# FORM RESEARCH — the section taxonomy and the rule of three

*Research for MK2's R1 (stage 2 FORM and stage 3's material family). Sources at the
foot. Everything here is either sourced or measured; where I am extrapolating to code
I say so.*

---

## PART 1 — THE SECTION POOL

MK2 currently knows four: intro, verse, chorus, outro. The Harmonix annotation set —
which is one dataset's constrained label vocabulary, not the real taxonomy — already
shows those four cover only **63.3%** of 428 real sections. The actual pool, gathered
from the sources below, is about thirty, and they group by *function*, which is what
matters for generating them: several names are the same structural job in different
genre dialects.

### A. OPENING — establish key, tempo, feel; make space for the entrance

| section | what it is | notes |
|---|---|---|
| **Intro** | opening music; sets key, tempo, rhythmic feel, attitude | typically appears **once** |
| **Vamp intro** | the verse's groove *before the tune has entered* | the most common pop intro |
| **Riff intro** | a distinct figure heard only here | *Sweet Child o' Mine* |
| **Cold open** | no intro; starts on the hook or the downbeat | a choice, not an absence |

### B. STATEMENT — the narrative body

| section | what it is | notes |
|---|---|---|
| **Verse** | music repeats, content changes; carries the story | repeats multiple times |
| **Refrain** | a repeated *line* ending each verse — not a full chorus | the AABA-form payoff |
| **Head** | in jazz/simple forms: the whole tune, stated | solos follow, then head out |
| **A section** | the statement in AABA terms | |

### C. APPROACH — build tension toward a payoff

| section | what it is | notes |
|---|---|---|
| **Pre-chorus** (rise, climb, lift) | transition that raises anticipation into the chorus | **88%** go straight to a chorus (measured, Harmonix) |
| **Build-up / riser** | EDM: tension without the kick, filters opening | the drop's runway |
| **Turnaround** | 1–2 bars that *reset* energy between sections | jazz/blues origin; also the post-chorus energy dump |

### D. PAYOFF — the point of the song

| section | what it is | notes |
|---|---|---|
| **Chorus** | the invariant; the message, reduced and repeated | the thing that RETURNS |
| **Hook** | the memorable phrase itself; in modern pop often its own section | |
| **Drop** | EDM's chorus-equivalent: peak energy, main hook, full low end | |
| **Shout chorus** | big-band: the arranged climax after the solos | |

### E. TAIL — what follows the payoff

| section | what it is | notes |
|---|---|---|
| **Post-chorus** | follows the chorus; same character, distinguishable material | often the catchiest part of a modern record; **53%** go to a verse (measured) |
| **Outro-chorus** | the chorus repeated to close | |
| **Tag** | a short phrase repeated to end a section or the song | |

### F. DEPARTURE — the sanctioned break from repetition

| section | what it is | notes |
|---|---|---|
| **Bridge / middle eight** | a genuine left turn: new progression, new melody, often new key | usually appears **once**, after the 2nd chorus; **57%** return to a chorus (measured) |
| **Breakdown** | strips the arrangement; a deliberate anti-climax or mood change | EDM's palate cleanser; also a rock device |
| **Interlude** | a short connective passage between parts | |
| **Solo** | an instrumental feature over existing changes | |
| **Instrumental** | a section with the lead simply absent | this is the "lead sits out" section MK2 already has |
| **Collision** | two sections overlapping | |
| **Elision** | one section's cadence *is* the next one's downbeat | energy never drops |

### G. CLOSING

| section | what it is | notes |
|---|---|---|
| **Outro / coda** | the ending proper | typically **once** |
| **Vamp** | a repeated progression to fade or close over | |
| **Ad-lib** | improvised line over the outro, varying established material | |
| **False ending** | stops, then returns | |
| **Fade-out** | the arrangement continues, the level doesn't | |
| **Reprise** | an earlier section returns, usually altered | |

### Structural DEVICES — arrangement events, not sections
Fill (into a change) · Empty / drop-out (the bar before an arrival) · Riser · Impact ·
Half-time or double-time treatment of an existing section.

*These are not sections and must not be modelled as sections — in MK2 they belong to
stage 4's closed treatment set, applied to a copy.*

### Measured behavior (Harmonix, 428 sections, 40 songs)
```
chorus 29.7% · verse 20.3% · end/outro 13.5% · intro 9.1% · bridge 6.5%
prechorus 5.6% · postchorus 4.4% · instrumental/solo/break ~4%

verse      -> chorus 64%  prechorus 18%
prechorus  -> chorus 88%
bridge     -> chorus 57%
postchorus -> verse  53%
intro      -> verse  46%  chorus 36%

66% of all sections RETURN later in the same song
```

**The design consequence:** a section is not a label, it is a *function with a
transition profile*. The grammar is a Markov chain over functions, and each function
carries what it needs from the material family (a prechorus needs the chorus's
material to ramp *into*; a bridge needs permission to leave the progression).

---

## PART 2 — THE RULE OF THREE

### What the sources actually say

> "The rule of 3 applies usually to repeating a motif, section or device three times
> before changing to something else (as opposed to the more usual 2 or 4 times)."

> "When an idea is presented once, it piques our interest. When it is repeated, the
> concept is reinforced. However, if it is repeated a third time, our brains may begin
> to tune it out."

> "Whenever a musical pattern, idea or motif is going to be repeated for a third time,
> it's best to change it in some way, or present a new idea."

So the operative rule: **state, repeat, and on the third occurrence something must
change.** Two identical hearings establish an idea; the third identical hearing is
where attention is lost.

### What counts as "the change" — the sources give a ladder, weakest to strongest

1. **Subtle**: instrumentation, dynamics, or rhythm alters while the material stays.
2. **Partial variation** — *the most useful one for a generator*: "start the concept
   the same way for the third repetition, but then take it in a different direction
   halfway through." Same opening, different ending. The listener is rewarded for
   recognising it *and* surprised.
3. **Full variation**: "introduce a new melody while retaining the same chords, or
   explore a different progression alongside a fresh melody."
4. **New idea entirely**: the departure — this is what a bridge *is*.

### The part the sources do not say, and the reason this matters for code

The rule applies **at every structural level at once**, and each level has its own
counter:

| level | "the idea" | third occurrence falls at |
|---|---|---|
| motif | a figure inside a bar | its 3rd statement within the phrase |
| bar | a bar inside the loop | the 3rd identical bar |
| loop | the 4-bar cell inside a section | the 3rd pass through the section |
| section | verse / chorus as a whole | the 3rd verse, the 3rd chorus |

And critically: **the change may be delivered at a different level than the repetition
that demanded it.** A third chorus does not need new chorus *notes* — it can be
answered by an arrangement change (a stripped first half, a doubled lead, a new
counter-line). That is exactly what "arrangement is development" means, and it is why
the rule belongs in MK2 as a *constraint published between stages*, not as a pass that
edits notes after the fact:

```
stage 2 (form)   counts section repeats  -> demands variation of stage 3/4
stage 3 (loop)   counts bar/motif repeats -> varies its own material at write time
stage 4 (arr.)   counts loop passes      -> owns the treatment that answers the demand
```

Nothing corrects anything. Each stage is *told* "this is the third time" and satisfies
it with the property it owns. That fits Law 3 exactly.

### The trap to avoid
"Change on the third" does **not** mean "never repeat three times." The chorus is the
song's invariant and is *supposed* to come back recognisable — the measured data says
66% of sections return. The rule governs *identical, unbroken* repetition. A chorus
returning after a verse has had its repetition broken by the verse; its counter starts
over. Only consecutive, unvaried statements count.

---

## PART 3 — WHAT THIS MAKES R1

1. **Stage 2 draws from a pool, via a grammar.** Section functions from the taxonomy
   above, weighted per genre (lofi does not need a shout chorus), sequenced by the
   measured Markov transitions, with a repeat-counter enforcing the rule of three on
   consecutive identical sections.
2. **Stage 3 produces a material FAMILY, not one loop.** A (verse), B derived from A
   (chorus), and a departure derived by the one operation permitted to leave the
   progression (bridge). Derivations are named functions — `sameChordsNewTune`,
   `reharmonise`, `answerOf`, `depart` — each one testable, each one *being* the
   relationship rather than checking it afterward.
3. **Stage 4 owns the treatments** that answer a rule-of-three demand it receives:
   strip, double, half-time, fill-into, empty-before, re-orchestrate.

---

## Sources

- [Song structure — Wikipedia](https://en.wikipedia.org/wiki/Song_structure)
- [Post-chorus — Wikipedia](https://en.wikipedia.org/wiki/Post-chorus)
- [Turnaround (music) — Wikipedia](https://en.wikipedia.org/wiki/Turnaround_(music))
- [Coda (music) — Wikipedia](https://en.wikipedia.org/wiki/Coda_(music))
- [The Rule of Three in Music Composition — OmnionSound](https://www.omnionsound.com/the-rule-of-three-in-music-composition/)
- [Rule of 3? — Gearspace discussion](https://gearspace.com/board/songwriting/919688-rule-3-a.html)
- [The Rule of Threes — Music Production Chips](https://music-chips.com/chips/the-rule-of-threes.html)
- [Melody and The Power of Three — SongTown](https://songtown.com/on-songwriting/melody-and-the-power-of-three/)
- [Parts of a Song — Fender Play](https://www.fender.com/articles/techniques/parts-of-a-song-keep-it-straight)
- [Parts of a Song: Every Section Explained — Antares/AutoTune](https://www.antarestech.com/blog/what-are-the-parts-of-a-song)
- [Song Structure Explained — Song Cage](https://songcage.com/blog/song-structure/)
- [Essential Guide to EDM Song Structure — Hyperbits](https://hyperbits.com/blog/edm-song-structure/)
- [EDM Song Structure 101 — Unison](https://unison.audio/edm-song-structure/)
- [Song Sections and Forms — Chordal](https://www.learnchordal.com/how-to-read-charts)
- [14 Parts of a Song Explained — Guitar Lobby](https://www.guitarlobby.com/parts-of-a-song/)
- Measured: `corpus/.harmonix` via `corpus/harvest_structure.py` (Harmonix Set, CC BY-NC-SA 4.0)
