# Jungle's harmony — the genre that measures worst, and the sheet that already said so

*Researched 2026-08-04. Jungle is the weakest genre in this program by every
counterpoint measurement taken, and `BACKLOG.md` §6.5 and §6.8 both say its
harmony has never been researched. That turns out to be half wrong — `jungle.md`
researched it in July and the shipped table does not match what it found. This
sheet checks that against fresh sources and measures the result.*

---

## 1. WHERE JUNGLE SITS IN OUR OWN MEASUREMENTS — last, on everything

```
  genre        pairs  steps   contrary oblique similar parallel  PAR.PERF (chance)
  jungle          20    374    42.2%   26.7%    9.4%    21.7%     21.7%     1.0%
  every other genre                                              0.5-6.0%

  the harmonic interval census, every instant two parts sound together:
  jungle        perfect 65.4%   imperfect 34.6%   DISSONANT 0.0%
  every other genre                               dissonant 23.9-49.7%
```

Three things at once, and they are one thing:

- **21.7% parallel fifths and octaves** — against Bach's 0.127% and against
  every other genre here. **170× the measured standard.**
- **0.0% dissonant intervals.** Not low. None. Across 20 songs.
- **374 pitched moments across 20 songs**, where lofi has 5693. There is
  almost nothing here to be in relation to anything else.

**And the cause is in the table, in three lines.** `sevenths: false` (plain
three-note chords), `counter: null` (no second melody — a deliberate and
defended choice), and a progression table that draws **one chord for four
bars, 8 times out of 11**. A static triad under a root-only bass can only
produce fifths and octaves; there is no seventh to be dissonant with anything.

---

## 2. THE REPO ALREADY RESEARCHED THIS AND THE TABLE DOES NOT MATCH IT

`jungle.md`, July 2026, states the harmony plainly and correctly:

> "Jungle has two harmonic worlds and no third:
> **(a) THE DRONE** — ragga jungle, darkside, Photek. One root, held, forever…
> percussion and bass pressure, not chords [corpus:timeout].
> **(b) THE JAZZ-MINOR VAMP** — Good Looking / Moving Shadow. '**Airy pads,
> jazz-inflected chords**', Bukem trained classical then jazz fusion
> [corpus:tracksandtales]. **Two chords, four bars, over a pedal.**"

And it names the instrument: "**Rhodes, heavily. Bukem's and Roni Size's
jazz-inflected chords are electric piano.**"

**What shipped instead:**

| `jungle.md` recommended | what the table says |
|---|---|
| drone weight 6 of 13, with three real vamps beside it | drone weight **8 of 11**, and the two alternatives barely move |
| dorian: drone 5, "**THE Bukem vamp**" i–IV at 4 | dorian: drone 8, one alternative at 2 |
| "jazz-inflected chords", Rhodes, electric piano | `sevenths: false` — **plain triads**, and `keysChar` marked "dead draw" |

The word "jazz-inflected" appears twice in the sheet and nothing in the table
can express it. **This is not a research gap, it is a table that did not
receive its research.**

---

## 3. FRESH SOURCES, BECAUSE ONE SHEET IS A CLAIM

Checked independently rather than taken from the repo:

> Melodic layering in jungle uses "**lush minor chords, jazz extensions
> (9ths/11ths/13ths), or ominous drones**." And: "Harmony is sparse and often
> minor, **with dissonant intervals** or horror/industrial atmospheres."
> [corpus:melodigging Jungle]

> LTJ Bukem's label Good Looking Records "specializes in **jazz-influenced and
> atmospheric** intelligent drum & bass" [corpus:wikipedia Good Looking
> Records]; Bukem "was trained as a classical pianist and discovered **jazz
> fusion**… his fascination with **Herbie Hancock and Lonnie Liston Smith**
> gave him a verdict for **chords that glide rather than jab**"
> [corpus:tracksandtales].

**Two independent sources for extensions, and one of them says "dissonant
intervals" outright** — against a program measuring 0.0%. The drone half is
equally well attested and is not in dispute; nothing here argues jungle should
stop droning.

---

## 4. WHAT TO CHANGE, AND WHAT NOT TO

**Change: the chords may be four and five notes.** Two sources name jazz
extensions; the repo's own sheet names them twice. `sevenths: false` is the
single line that makes the genre's atmospheric half inexpressible.

**Change: the vamp weights, toward `jungle.md`'s own recommendation.** The
shipped drone at 8-of-11 is heavier than the sheet that researched it asked
for, and dorian's i–IV — which that sheet calls "**THE** Bukem vamp" — is
absent from the shipped dorian row entirely.

**Do NOT change: `counter: null`.** Written and defended: "a jungle second
voice is a stab or a dub echo, not a harmony part." Two pitched parts is
correct for this genre and the low moment-count follows from it honestly.

**Do NOT change: the drone's primacy.** It stays the heaviest single draw. The
sources are unanimous that most of this genre is one root held.

**Do NOT reach for the chord-quality table.** `CHORD_QUALITY` is measured on
major and minor keys only, and jungle draws minor, phrygian and dorian. Minor
would take it; the other two would get nothing, which would make the genre's
harmony depend on which mode it drew. That is a worse inconsistency than the
one being fixed. Extensions are mode-safe — they stack thirds inside whatever
scale the song is in — and that is the right tool here.

---

## 4b. WHAT WAS BUILT, AND WHAT IT MEASURES — `2026-08-04g`

Extensions declared `[[3, 5], [4, 4], [5, 2]]` — the triad keeps the largest
single share, and four- and five-note chords are now reachable — and the vamp
weights are `jungle.md`'s own, including the dorian i–IV it called "THE Bukem
vamp" and which the shipped table did not contain.

```
                        before    after
  pitched moments          374      801        more than doubled
  DISSONANT intervals     0.0%    13.5%
  perfect intervals      65.4%    55.3%
  parallel fifths/8ves   21.7%    19.2%
  contrary motion        42.2%    30.2%
```

**Read off the notes**, seed 1:

```
  before   CHORDS  C#m  C#m  C#m  A     bridge: C#m  C#m  A  A
  after    CHORDS  C#m  F#m7 C#m7 F#m   bridge: C#m  C#m7 A7 A
```

Three identical triads and one change, into a i–iv vamp with sevenths. That is
the "jazz-minor vamp… two chords, four bars" the July sheet described, and the
genre could not play it before today.

**It is still the most consonant genre of the seven** — 55.3% perfect against
lofi's 25.5% — which is right. A genre built on a drone and a sub-bass should
be, and this has not turned it into lofi.

**AND IT DID NOT FIX THE PARALLEL FIFTHS. 21.7% → 19.2%, still 150× Bach.**
Saying so plainly. The cause is the one this project already found and fixed
for lofi: **jungle's bass is 100% root, one note a bar**, so bass and chords
still move together at every chord change and any interval between them
survives. The fix that worked on lofi — giving the bass somewhere else to be —
is not applied here because §5 says the sources do not support it, and I am not
going to guess a bassline for a genre whose bass nobody has researched. That
row stays open in `BACKLOG.md` §6.8.

**No law moved:** jungle still measures 0.0% out of key, 0.0% chord-below-bass,
0.0% unisons. Six genres byte-identical, 300 songs each, printed notes checked
side by side.

---

## 5. WHAT THE SOURCES DO NOT SETTLE

- **How often a jungle track extends its chords.** "Lush minor chords, jazz
  extensions" describes the atmospheric strand, and no source gives a
  proportion for the genre as a whole. The weights are `[CHOSEN]`.
- **Whether the dissonance the source names is harmonic or textural.**
  "Dissonant intervals or horror/industrial atmospheres" reads as much like
  sound design as like chord spelling. Extensions raise measured dissonance as
  a side effect; that is not the same as the source's claim being about
  sevenths, and it should not be reported as if it were.
- **Nothing on jungle's BASS note choice** beyond "roots, octaves,
  fourths/fifths" and "pentatonic" [corpus:mixedinkey]. Its bass stays at
  100% root, one note a bar, and that row in `BACKLOG.md` §6.8 stays open —
  the sources here do not support changing it and I am not going to guess.

---

## Sources

- [Jungle — Melodigging](https://www.melodigging.com/genre/jungle)
- [Good Looking Records — Wikipedia](https://en.wikipedia.org/wiki/Good_Looking_Records)
- [Logical Progression — LTJ Bukem's Classic Drum & Bass Mix Explained — Tracks and Tales](https://www.tracksandtales.co/blogs/playing-bar-albums/logical-progression-ltj-bukem-1996)
- [How LTJ Bukem's 'Logical Progression' expressed his unique vision — DJ Mag](https://djmag.com/features/how-ltj-bukems-logical-progression-expressed-his-unique-vision-drum-bass)
- [How to Make Drum and Bass: The Complete Guide — Mixed In Key](https://mixedinkey.com/captain-plugins/wiki/how-to-make-drum-and-bass-the-complete-guide/)
- `docs/genre-research/jungle.md` — the July sheet whose harmony section this confirms
