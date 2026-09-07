# Parts, elements and streams: what the ceiling is actually counting

The owner's idea was that **X part can be Y part** — that a part and what it
plays are two different things, and any part can take any job. This document
checks that against the literature before any of it is built.

It holds. It is also not the whole idea, and the part that was missing turns
out to fix a defect in this program's own arithmetic: **the ceiling on how much
can sound at once is not a count of parts.** It is a count of what a listener
can hear as separate, and whether two parts are one thing or two is EMERGENT
from what they play rather than fixed by what they are.

---

## 1. The idea is published, and it is published as a definition

Arranging literature does not describe a band. It describes FUNCTIONS, and
says which instruments may serve them — which is the owner's idea from the
other side.

Bobby Owsinski's five arrangement elements
(bobbyowsinskiblog.com/song-arrangement-elements):

| element | the definition, verbatim |
|---|---|
| **Foundation** | "The Rhythm Section. The foundation is usually the bass and drums, **but can also include a rhythm guitar and/or keys if they're playing the same rhythmic figure as the rhythm section**." |
| **Pad** | "A Pad is a long sustaining note or chord… Synthesizers now provide the majority of pads **but a real string section or a guitar power chord can also suffice**." |
| **Rhythm** | "Rhythm is **any instrument** that plays counter to the Foundation element." |
| **Lead** | "A lead vocal, lead instrument or solo." |
| **Fills** | "Fills generally occur in the spaces between Lead lines, or can be a signature line. You can think of a Fill element as **an answer to the Lead**." |

Read those definitions for what they are made of. Not one of them names an
instrument as a requirement. "Rhythm is ANY INSTRUMENT that plays counter to
the Foundation" is the owner's sentence with the words in a different order:
the element is the job, and the instrument is whoever is doing it.

**This program has no concept of an element at all.** It has parts, and each
part's job is welded to its name in `material/index.ts` — `drawBass` for the
bass, `drawKeys` for the keys — returning an object shaped literally
`{ bass, keys, drone }`. So "the bass" means a register AND a voice AND a place
in the mix AND a way of writing notes, with no seam. Nothing chose that; it is
how the first version got written.

## 2. And the ceiling is counting the wrong thing

Here is the part that changes more than the assignment does.

`arrange.ts` cites Sound on Sound — "five elements at one time — counting the
drums as one — is generally the most you'll hear (sometimes six)" — and this
program implemented it as `MOST_AT_ONCE = 5`, a count of PARTS. Owsinski gives
the same rule and the same shape: "usually there should not be more than four
arrangement elements playing at the same time. Sometimes three elements can
work very well. Very rarely will five simultaneous elements work together."

Look at what both sources actually count. **"Counting the drums as one."** A
kit is four or five sounding things and the source counts it once. Owsinski
says the Foundation "can also include a rhythm guitar and/or keys IF THEY'RE
PLAYING THE SAME RHYTHMIC FIGURE" — four instruments, one element. Neither
source is counting parts. They are counting things a listener hears as
separate, and several parts collapse into one of them when they move together.

The perceptual research says the same thing and puts numbers on it. Huron's
numerosity work, as reported by Siedenburg et al.: "errors in both numerosity
judgments and the recognition of single-voice entries sharply increased from
around ten percent for three-voice mixtures to around 50 percent for
four-voice mixtures". Past three concurrent voices, listeners stop being able
to tell how many there are.

And what decides whether two lines are one voice or two is not their identity —
it is three properties of what they play. "Factors like timbre, rhythm and
register aid in the separation of concurrent lines, in what is termed auditory
scene analysis" (frontiersin.org, fnins.2021.588914, citing Wright & Bregman
1987 and Bregman 1990). Siedenburg et al. measured one of them: moving from
three to four voices, accuracy fell to 72% when the voices were timbrally
diverse and 56% when they were homogeneous — "timbrally heterogeneous mixtures
are easier to segregate compared to homogeneous mixtures".

So the three sources agree, from three directions:

- **a producer** counts elements and fuses anything sharing a rhythmic figure
- **a mix engineer** counts the drums as one
- **the perception literature** says listeners track about three streams, and
  that timbre, rhythm and register are what make a stream separate

## 3. What that means for this program

`MOST_AT_ONCE = 5` is a baked value standing where a constraint belongs, and
it is baked in the wrong unit. Two records with five parts sounding are not
equally dense: five parts moving in rhythmic unison in one register on one
instrument are close to ONE stream, and five parts with different onsets in
different bands on different instruments are five, which is past every figure
above.

The constraint that is actually supported is:

> **How many independent STREAMS sound at once**, where two parts belong to the
> same stream when they share onsets, register or timbre, and are separate when
> they do not.

That is a computed property of the notes, not a number in a file. And it is
what makes the roster free: **the box of parts can be as large as it likes**,
because what the ceiling limits is not how many are playing but how many
distinguishable things they add up to. A record can carry seven parts and be
legal if several of them move together; a record with four independent lines is
already at the edge.

This is also where the emergence the owner asked for comes from. Nothing has to
decide "this record has four parts". A record draws its parts and what they
play, the constraint refuses combinations that exceed what an ear can follow,
and the density that comes out is a CONSEQUENCE — different per seed, and
different for reasons that are audible rather than arithmetic.

## 4. What the elements do to the behaviours already written

`material/behaviour.ts` was started with an ad-hoc list — `arp`, `flourish` —
picked from the owner's examples rather than from a source. Against the five
elements it is clear which is which, and one of the two is not a peer of the
other:

- **`flourish` IS the Fills element.** "Fills generally occur in the spaces
  between Lead lines… an answer to the Lead." That is the same definition the
  counter-line was built to, which means Fills and the counter-line are one
  element served two ways, not two elements.
- **`arp` is not an element.** An arpeggio is a TEXTURE — "a type of chord in
  which the notes that compose a chord are individually sounded in a
  progressive rising or descending order" (en.wikipedia.org/wiki/Arpeggio). An
  arpeggiated part can serve the Pad (a sustaining harmony, spilled), the
  Rhythm ("any instrument that plays counter to the Foundation"), or the Lead.
  Which element it is depends on what else is playing, not on the arpeggio.

So the axes are three, not two: **the seat** (register, voice, mix), **the
element** (the job), and **the texture** (how the notes are laid out). An arp
part IS "a seat serving the Rhythm element with an arpeggiated texture", and
that sentence is the mix-and-match the owner described.

## 5. What is not settled

- **The fusion rule needs a threshold, none of these sources gives one, and a
  first attempt showed the answer is DOMINATED by that threshold.** Measured
  over 204 lofi sections with onset-sharing as the only cue — Owsinski's "the
  same rhythmic figure", the one cue a source names outright:

  | how two parts' onsets are compared | mean streams | sections over three |
  |---|---|---|
  | shared / smaller part's own count, at 0.6 | 1.31 | 0% |
  | shared / smaller part's own count, at 0.9 | 1.67 | 1% |
  | shared / union of both, at 0.6 | 3.76 | 50% |
  | shared / union of both, at 0.4 | 3.00 | 29% |

  The same records go from "almost every section is a single stream" to "half of
  them are past what a listener can track", on a choice of denominator that no
  source speaks to. **Neither number is evidence and neither is reported as
  one.** The two denominators are also asking different questions, which is
  itself the finding: dividing by the smaller part's own count asks "is this
  part SUBORDINATE — does it land only where that one lands", which is Owsinski's
  Foundation and is true of a bass written on the kick; dividing by the union
  asks "do these two have the SAME rhythm as each other", which is a different
  claim. A stream rule needs both, plus the register and timbre cues Bregman
  names, before its number means anything.

  The way to fix the threshold without inventing it: the literature says what
  the distribution should look like — Huron puts the difficulty past three, and
  Owsinski says four at once usually, three often, five very rarely. So the
  cues can be calibrated until records sit in that distribution, which is a
  number derived from a published shape rather than picked. `tools/streams.ts`
  is the instrument for that and it is why it takes its rule on the command
  line rather than carrying one.
- **Nothing here has been heard.** All of it is a rearrangement of what the
  program already generates, and whether a fused stream sounds fused is exactly
  the sort of claim `TALLY.md` §0 exists to distrust.

## Sources

Read in full:

- bobbyowsinskiblog.com/song-arrangement-elements — the five elements, their
  definitions, and the four-at-once ceiling
- en.wikipedia.org/wiki/Arpeggio — arpeggio as a texture, and the two-octave
  example
- frontiersin.org 10.3389/fnins.2021.588914 — "timbre, rhythm and register aid
  in the separation of concurrent lines", citing Wright & Bregman 1987 and
  Bregman 1990. Checked for Huron's density principle and it is NOT there
- pmc.ncbi.nlm.nih.gov PMC8079728 (Siedenburg et al.) — Huron's numerosity
  figures, 10% error at three voices to 50% at four; timbral heterogeneity
  measured at 72% against 56%
- soundonsound.com/techniques/arranging-pop — "five elements at one time,
  counting the drums as one", already cited in `arrange.ts`

Not read, and cited for nothing: Huron, *Voice Leading: The Science Behind a
Musical Art* (2016) itself — the limited density principle is quoted here only
as Siedenburg et al. report it.
