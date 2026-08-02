# LOFI HIP HOP — THE FORM, researched

*2026-08-02. Internet research per the rule in HANDOFF-MK2 §0: the model has
no ears; published data is the only signal. Every claim below carries its
source. What is taste is marked. This document precedes the `form.plan` in
the GENRE table and is the evidence for it.*

## Sources

1. Richard Pryn, "How to Structure Lofi Music" —
   https://richardpryn.com/lofi-music-structure/ (the most structurally
   specific source found; analyses three real tracks)
2. Native Instruments Blog, "Making lo-fi hip hop beats: the essential
   guide" — https://blog.native-instruments.com/lo-fi-hip-hop-beats/
3. Lunacy Audio, "How to Make Lofi Music: The Complete Guide" —
   https://lunacy.audio/news/how-to-make-lofi-music/ (section-length table
   as surfaced in search results; page not fetched directly)
4. Hiphopmakers, "How to Make Lofi Hip Hop Beats in 7 Steps" —
   https://hiphopmakers.com/how-to-make-lo-fi-beats-lofi-music (as surfaced
   in search results)
5. EDMProd, "How To Make LoFi Hip Hop" — https://www.edmprod.com/lofi-hip-hop/
6. On the beat-tape pole: Wikipedia, "Donuts (album)" —
   https://en.wikipedia.org/wiki/Donuts_(album) ; The Ringer, "Dollars to
   Donuts" — https://www.theringer.com/2022/02/01/music/40-best-j-dilla-beats-common-jay-dee-de-la-soul-tribe-donuts

## What the sources agree on

**The track IS a loop.** Pryn: *"Write a decent 4-8 bar loop and you have
the foundations of an entire lofi track."* EDMProd sketches everything over
~4 bars and swaps pattern varieties "throughout the structure." This the
program already honors — stage 3 builds a material family from one loop.

**The shape is two-part alternation, not verse-chorus pop form.** Pryn's
base pattern, from analyzed tracks: *"Loop, Loop with beat, Loop without
beat (and a slight change), Loop with beat, Fade out"* — which he names
*"an ABABB structure, or even sometimes an A1A2A1A2A2 structure"*; his three
examples read ABABB, AB-AB-ABC, ABBABBA. The two parts differ by
**instrumentation, not by new material**: *"the same loop is played on a
different instrument in the break"*, and *"the use of a melody in the chorus
gives the track a natural two-part structure."*

**Development is subtractive/additive, not progressive.** Native
Instruments: *"Structurally, lo-fi hip hop is simple and repetitive, and
that's exactly the point. It's meant to loop smoothly and create a vibe
rather than a progression-heavy song"* ... *"bring in one element at a time
for four or eight bar phrases, remove things when they feel too repetitive,
and bring them back in when it feels appropriate."*

**There is sometimes — not always — a breakdown where the drums leave.**
Native Instruments: *"sometimes a breakdown where elements drop out before
returning to the core groove."* Pryn's "loop without beat" is the same
section. Hiphopmakers on the chorus question: *"Lofi Hip Hop music in its
most calm form doesn't have a chorus"* — an uplifting track may fit one.

**Tracks are short.** Pryn: sections run *"20-30 seconds"*, *"about 4-6
sections to make a complete track"*, tracks *"between 1:00 and 2:30, with
around two minutes being the most common track length."* Native
Instruments: *"around 1 to 3 minutes."* Lunacy's section table (via search
summary): intro 8-16 bars, main groove 16-32, breakdown 8, variation 16,
outro 8-16. At the extreme beat-tape pole, Donuts is 31 tracks in 43:24
(mean ~84 s) and *"only one song is longer than two minutes"* (The Ringer).

**And one source warns against over-planning.** Native Instruments: *"there
are no hard rules — lo-fi has more of a sound palette than a general
structure."* The plan below is therefore loose — pools and budgets, not a
fixed sequence.

## What this means against the current table

The current lofi form is a pop grammar: verse->chorus weighted 8, a bridge
unlocked after choruses, target 40-64 bars. Measured (probe_form baseline),
it produced 24/25 distinct pop-shaped walks — I V C V C N C^ O and kin.
The sources describe something simpler and shorter: establish the loop,
alternate its two dressings, maybe drop the drums once, come back, end on
the full statement.

Mapping to the program's section vocabulary (which stays as-is):

| research term | program section | why |
|---|---|---|
| loop with beat | `verse` | material A, full kit |
| melody statement / "chorus" | `chorus` | material B carries the tune+counter — Pryn's "natural two-part structure" |
| loop without beat | `bridge` | lofi's bridge roles already exclude drums |
| groove alone | `instrumental` | drums+bass+keys, no lead |

## The plan (as landed in `GENRE.lofi.form.plan`)

    establish: pool [verse, instrumental], 8-12 bars   — the loop states itself
    twopart:   pool [verse, chorus, instrumental], 16-24 bars — the alternation
    answer:    pool [bridge, verse, chorus], 8-16 bars, ends on chorus
               — the sometimes-breakdown and the return; the record ends on
                 its fullest statement

MEASURED after landing (probe_form, 25 seeds): totals run **44-64 bars**
(a phase may overshoot its budget by one section, so totals sit above the
raw budget sums), median 56 bars ≈ **1:55 to 3:27 across the 74-92 bpm
band, ~2:42 at the median** — against sources saying 1:00-2:30 (Pryn) to
1-3 min (NI) with ~2:00 typical. The genre leans to the long edge of its
sources. Tightening further collides with the arc's minimum room to rise
and fall, and the budgets are already [EAR]; **the user's ears decide
whether these records feel long.** Shapes: 19/25 distinct (was 24/25 —
a family now exists, with repeats), 6-9 sections, every record ending on
its fullest statement; the most common shape is I V C V C V C^ O, which
is Pryn's ABABB inside the intro/outro frame.

## Marked taste, and what was refused

- Exact budget steps (8/4, 16/8, 8/8) are **[EAR]** — the sources give
  ranges in seconds and bars, not steps.
- Keeping the name `chorus` for the B-statement is a mapping choice, not a
  source claim; the sources are explicit that calm lofi has no chorus in
  the pop sense. What the program calls chorus here is "the loop wearing
  its melody," which is what Pryn's tracks do.
- **Refused:** a compulsory breakdown (sources say *sometimes*; the answer
  phase's pool makes it likely, the genre's own transition weights decide);
  a fixed ABABB template (Pryn's own three examples differ; the plan is
  pools, the dice still order them); Donuts-length 84-second tracks (that
  is the beat-tape pole, not the stream genre this table names — noted so
  a future `beattape` genre can claim it).
