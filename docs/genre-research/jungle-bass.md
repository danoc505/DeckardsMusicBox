# JUNGLE'S BASS — the research §9.4 asked for

*Written 2026-08-04 (build `2026-08-04k`), fresh searches, building on
`jungle-harmony.md` §5 (which had found only "roots, octaves, fourths/fifths"
and "pentatonic" and rightly said that was not enough to write a bassline
from). This sheet answers HANDOFF §9.4 / BACKLOG §6.8's jungle rows: the
sources DO support a change, and they say what shape it is. **No code moved
with this sheet** — BACKLOG §0 stands, the 04-stack is unheard, and the
mechanism this points at is a decision worth making awake, not a rider.*

## 0. What the program does today, measured

100% root, one note a bar, in every bar of every song (BACKLOG §6.8, 30
seeds). Nothing defends it: dkc's pedal and bladerunner's drone are declared,
sourced styles; jungle's is a default nobody chose. Its knock-on is measured
too: 19.2% parallel fifths bass-against-keys, because a bass that only states
the root moves in lockstep with every chord change.

## 1. Where jungle's bass comes from, and why that decides the shape

Every source agrees on the lineage: by 1994 jungle's low end was "deep,
sub-heavy, reggae- and dub-derived basslines" [Wikipedia drum-and-bass;
AllMusic jungle overview]. The genre's own research in this repo already
carries the two-layer finding (the Reese growl plus the S950 sine
undercurrent, `jungle.md`) — this sheet is about the NOTES the low layer
plays, and the notes are dub's.

**The dub bassline is a repeating RIFF, not a walk.** "Dub breaks feature the
vocal disappearing and the bass plays a **two bar motif**" [KVR dub-bassline
thread]. In reggae and dub "the bass is a **lead instrument** that creates the
rhythm and vibe of the track" — melodic, steady, and it "responds to the skank
and **leaves space**" [interruptor.ch dubboard, playing-and-learning-the-bass].
This is the deepest difference from lofi's `2026-08-04e` bass work: lofi's
sources describe per-bar tone CHOICE under a jazz-descended comp; jungle's
describe a fixed melodic cell that repeats — closer kin to this program's
ostinato machinery than to its walking-tones table.

## 2. The note choices, from practitioners

- "A lot of the original jungle had bass lines based around reggae and
  rocksteady, with **lots of roots and fifths — the rhythm was the most
  important thing**" [dogsonacid, writing-90s-jungle-basslines].
- "Play **root or 3rd or 5th on downbeats** for steadiness and then spice it
  up with **2nds or 4ths**" [dogsonacid, same thread].
- "**Pentatonic scales** would be your best bet for jungle" [dogsonacid] —
  named twice in independent replies.
- "Incorporate **fifths, octaves, and minor thirds**: adding these intervals
  can introduce melody while maintaining simplicity" [soundfingers
  reggae-dub-bass tutorial].
- And the corrective from the dub players themselves: reggae bass "**is not
  just root, fifth, root, fifth — great reggae basslines sing**"
  [interruptor.ch dubboard].

Convergence: **anchor tones root/3rd/5th on the strong positions, minor
pentatonic as the melodic pool, 2nd/4th as passing spice.** Consistent with
`jungle-harmony.md` §5 and strictly more specific than it.

## 3. The rhythm: space is constitutive, and the bass is slower than the drums

- Jungle is "**speeded-up breakbeats with a slower bassline**" [culture-wiki
  drum-and-bass; corroborates the genre's whole half-time feel]. The break
  chops at 160–176; the bass moves at dub tempo underneath it.
- "The notes you don't play are as important as the ones you do... employ
  **pauses in your bassline** to create tension and release" [soundfingers].
- The one-drop's emphasis falls on **beat 3** [Wikipedia one-drop-rhythm;
  soundfingers names one-drop / rockers / steppers as the pattern family].
- "Subtle pitch bends and **slides** can add realism. Most basslines will have
  gentle glides from one note to another, especially in reggae and dub"
  [soundfingers] — and this program's jungle already declares its echo as "a
  thrown thing"; the slide is the same idiom on the bass.

## 4. What this says to build — a decision, deliberately not made in this sheet

The sourced shape is: **a two-bar melodic riff, drawn once per song from
minor pentatonic with root/3rd/5th anchors, containing real rests, repeating
with the loop, with occasional slides.** Not one note a bar (today), and not
lofi's per-bar walking-tone table either — the riff's identity is that it
REPEATS. The nearest machinery in the file is the ostinato cell (drawn once,
repeats, `run`/`follow` switches), not `bassTones`.

Two honest cautions before anyone wires it:

1. **This moves every jungle song** and lands on top of `04g` (jungle's
   chords), which nobody has heard. BACKLOG §0: the sitting comes first.
2. **No source gives numbers** — notes per bar, riff length beyond "two bar
   motif", rest share. Whatever is chosen is `[EAR]` and must be marked so.
   The right first measurement after building: does the riff read as a riff
   (repetition detectable across bars) and does the parallel-fifths rate
   (19.2%) actually fall once the bass can be somewhere other than the root
   at a chord change.

## 5. What the sources do NOT give, so nobody re-searches

- No measured corpus of jungle basslines (the DOA thread is practitioner
  memory, not measurement; it returned 403 to direct fetch, quotes above are
  from search extracts).
- No tempo-relative note-length guidance beyond "slower than the breaks".
- Nothing on how the riff relates to the CHORDS when chords exist (dub is
  mostly one- or two-chord music; `04g` gave jungle a i–iv vamp — whether the
  riff transposes with the chord, the ostinato's `follow` question, is
  undecided by the sources).

## Sources

- [dogsonacid.com — Writing 90s jungle basslines](https://www.dogsonacid.com/threads/writing-90s-jungle-basslines.809086/) (via search extracts; direct fetch 403)
- [interruptor.ch dub board — Playing and learning the bass](http://www.interruptor.ch/php5/dubboard/viewtopic.php?t=351)
- [soundfingers — Authentic Reggae & Dub Bass tutorial](https://soundfingers.com/blog/reggae-dub-production/authentic-reggae-dub-bass-tutorial/) (fetched in full)
- [KVR — making dub basslines](https://www.kvraudio.com/forum/viewtopic.php?t=567145) (via search extracts)
- [Wikipedia — Drum and bass](https://en.wikipedia.org/wiki/Drum_and_bass), [One drop rhythm](https://en.wikipedia.org/wiki/One_drop_rhythm)
- AllMusic — Jungle/Drum'n'Bass subgenre overview
