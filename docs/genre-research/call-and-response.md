# ONE PART ANSWERING ANOTHER

*Researched and built 2026-08-08. Item 2 of the five in
`static-harmony-and-evolution.md` §4.*

---

## 1. I OVERSTATED THE GAP, AND HERE IS THE CORRECTION

I wrote that "call and response is absent from the whole program". **That is not
true, and the code says so in the source's own vocabulary.** `buildTheme` ends:

```js
phrase(0, opts.dir, true, opts.moveBias);
const qDir = ...;
phrase(2, -qDir, true, null);          // the answer: contrary, resolving
```

with a comment above it about "a half cadence … the phrase arrives somewhere
stable and unfinished, and the consequent answers it". That is a textbook
antecedent and consequent, and it has been in the tune for weeks.

**What is genuinely absent is one part answering ANOTHER part** — and every
source treats that as the primary case, not a variant of it.

## 2. WHAT THE SOURCES SAY, AND THEY AGREE ON THREE THINGS

> "Call and response is a compositional technique, often a succession of two
> distinct phrases that works like a conversation in music" — one musician
> offers a phrase and **a second player answers**. "Responses often occupy the
> musical gaps created by the initial phrase."
> — [Wikipedia, *Call and response (music)*](https://en.wikipedia.org/wiki/Call_and_response_(music))

> "The melody of 'So What' is **a call in the bass followed by a response from
> the piano and horns**. … **Each bass riff is a call; each piano/horn riff is a
> response.** … The first four notes of the first bass riff are a call; the
> second four notes are a response."
> — [Ethan Hein, *So What*](https://www.ethanhein.com/wp/2020/so-what/) — a
> source this repo already trusts for the Amen break and the Dilla feel. He
> counts **seven** hierarchical levels of it in that one tune.

> In a parallel period the consequent "**reproduces the basic idea note for note
> before diverging** in the contrasting idea … the matching beginnings throw the
> differing endings into sharp relief."
> — [Open Music Theory / Milne, *Sentences and Periods*](https://milnepublishing.geneseo.edu/fundamentals-function-form/chapter/35-sentences-and-periods/)

Three families, three agreements:

  | | |
  |---|---|
  | **WHERE** | in the call's silence |
  | **WHAT** | the call's own shape — the answer restates it before diverging |
  | **SCALE** | a riff, not a note |

## 3. WHERE IT COULD GO, AND WHY MOST DOORS WERE SHUT

Measured first — how much silence does the tune leave, and who could answer?

```
  genre         free 16ths per bar   longest silence   second voice
  lofi                 5.9 of 16          5.3          NONE
  synthwave            5.5                4.9          double (octave)
  vgm                  5.2                4.6          line
  bladerunner          8.7                7.6          line
  acid                 5.0                4.4          NONE
  plastikman           9.4                7.9          NONE
  jungle               9.0                7.8          NONE
  dungeonsynth         8.7                7.7          line
```

**There is room everywhere. Four of eight genres have nobody to answer with.**

And the genres in call-and-response's own lineage are exactly those four. The
tradition "permeates jazz, soul, gospel, blues, rhythm and blues, funk, and hip
hop" [Wikipedia, as above] — so lofi hip hop and jungle are the sourced
candidates, and **both declare `counter: null` as a researched decision I am not
entitled to reverse.** lofi's table gives half a page of reasons: Moore's four
textural layers allow one melodic voice, the genre's sources say "not more than
3 or 4 elements" and "sparse and repeating", and the user's own report — *"Lofi
hip hop is relaxing and easy background music, are we following that?"* — is what
removed it. Adding a second melodic voice back to get a feature heard would be
the measurement fitting the claim.

**And I found no source for call and response in the game-music genres.** I
searched for it in David Wise's writing specifically and got nothing usable, so
vgm did not get it either. Not every genre has to have every device.

**Dungeon synth is the one that is sourced AND already has the part.** Its own
tradition is the same practice under an older name:

> **Antiphonal singing** is "two halves of the choir alternate singing … half
> lines of psalm verses". **Responsorial singing** is "soloist alternates with
> choir", producing the form **R V1 R V2 … R**.
> — [Britannica, *Antiphonal singing*](https://www.britannica.com/art/antiphonal-singing)
> and [*Responsory*](https://www.britannica.com/art/responsory);
> [Catholic Encyclopedia, *Plain Chant*](https://www.newadvent.org/cathen/12144a.htm)

This genre's modes were read off a dungeon synth composer's own score, and its
bass pedal is the mode's *finalis* and *tenor* out of medieval performance
practice. Alternation between two voices is the same body of practice — not an
import.

## 4. WHAT WAS BUILT, AND IT CHANGES ONE THING ONLY

`counter: { style: "answer" }`, a third style beside `line` and `double`.

**Every pitch is chosen by the same machinery as before** — the genre's interval
pool, contrary motion, the non-chord-tone law, every seat another part has
taken. The style changes **where the notes sound**: a `line` puts each note on
the tune's note (or a step or two behind it); an `answer` moves the whole bar's
worth into the tune's largest silence in that bar, keeping their spacing, so the
call's shape survives the move.

And `density` gates **the call, not the note**. Measured with the per-note gate
still in place: placement worked (silence 38% → 68%) and produced **one note per
bar**, which is not a phrase. An answer is decided once, for the whole call, and
is then as long as the call was.

```
  dungeon synth                     before      after
  counter notes in the tune's silence   38%       68%
  notes per answering bar               1.0       1.9
  counter notes per 60 seeds            264       262
  calls answered                          —        7%
```

**The same amount of second voice, differently placed.** That is the whole
change and it is the honest way to state it.

Every other genre: **0 of 300 seeds moved.** Dungeon synth: 220 of 300.

## 5. WHAT THIS DOES NOT SETTLE

- **Nothing has a verdict.**
- **It is rare.** The second voice answers 7% of the tune's bars. That is the
  genre's own declared density (0.10) minus what collisions eat, and the genre's
  sources want sparse — but a device that fires in one bar in fourteen is a long
  way from So What, where the answer is half the melody.
- **32% of its notes still land on a lead onset**, in bars where the call is one
  note or the bar leaves no room. Those fall back to `line` behaviour honestly
  rather than dropping the note.
- **The answer does not yet end on a resolution.** The sources are explicit that
  the call is inconclusive and the response resolves; here the answer's last
  note is scored by the non-chord-tone law like any other, not forced to land.
- **Four genres in this device's own lineage still have nobody to answer with,**
  and that is a decision for the user, not for me.
