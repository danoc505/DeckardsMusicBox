# THE FIGURE, MEASURED AT LAST — and the sheet it refutes

*2026-08-08. The user, after playing it: "I don't know where we got the idea for
that. Bouncy thing — I can't even find anything like it in the DK64 OST. I
think we've done something wrong. Yes, in Aquatic Ambience there was something
that to me sounds like an arp of some kind. Do better research."*

**Every part of that was right.** This sheet is the research.

---

## 1. THE CLAIM, AND WHERE IT CAME FROM

`dkc.md` opens with the two things it says make this music unmistakable. The
first is the figure:

> "A CONTINUOUS SIXTEENTH/EIGHTH OSTINATO, ONE OCTAVE WIDE, THAT NEVER PLAYS
> THE ROOT — **AND DOES NOT FOLLOW THE CHORDS** … Aquatic Ambience (C aeolian):
> D-Eb-Bb-G, **that exact 4-note cell repeated four times per bar in straight
> 16ths, forever** … **The ostinato does not re-voice to the chord.** … the
> harmony is an emergent by-product of a fixed melodic cell over a moving bass
> pedal. **Nothing is being voice-led.**"
> — `dkc.md`, citing `[measured: DKC_Water-KM.mid ch0, bars 0-1 byte-identical]`

**Two things were wrong about how that was carried.**

1. **The sheet's own header says it was never checked**: *"Web research
   delivered 2026-07-28. NOT independently verified — the verification pass hit
   the session limit before it ran. Treat every number as the researcher's
   claim until checked."* Nobody ever checked it. The MIDI it cites by name
   **is not in this repository and never was**, so the citation could not be
   re-read by anyone who came after.
2. **And I made it worse on 2026-08-08j**, by writing into that file's new
   header that "everything measured below is unchanged and still true". I
   repeated its claim of being measured while its own first paragraph says it
   is not. That is the exact failure this project has a standing rule about,
   committed by the person adding the rule's newest example.

## 2. SO IT WAS MEASURED — two independent transcriptions, fetched and parsed

`DKC_Water-KM.mid` (the file the sheet names) and `DKC_-_Aquatic_Ambience.mid`,
both from vgmusic.com, parsed with a dependency-free SMF reader. Three separate
sixteenth-note figure tracks across the two files:

| | KM, track 8 | AA, track 5 | AA, track 1 |
|---|---|---|---|
| **when the bass root changes, does the figure change?** | **7 of 7** | **15 of 15** | **15 of 15** |
| | **100%** | **100%** | **100%** |
| bars repeating the opening figure | 22% | 29% | 27% |
| distinct bar-figures in the track | 4 | 4 | 7 |
| figure notes inside a triad on the bass root | 66% | 53% | 56% |
| **share of bars the figure plays at all** | **30%** | **47%** | **50%** |

The figure as it really is, bar by bar (KM, pitch classes in order):

```
  bar 16-18   D-D#-A#  D-D#-A#  D-D#-A#          <- three notes, not four
  bar 20-21   G#-G-A#-G-G#-G-C-D#                <- a different figure entirely
  bar 22-23   A#-A#-A#-A#-A#-A#-A#-A#            <- and a third
  bar 40-42   D-D#-A#  D-D#-A#  D-D#-A#          <- the first one, returning
```

## 3. WHAT THAT REFUTES, POINT BY POINT

- **"does not follow the chords" / "does not re-voice to the chord" / "nothing
  is being voice-led"** — **FALSE.** The figure changes every single time the
  bass root changes, in all three tracks, without exception. It is voice-led by
  the harmony. This is the load-bearing claim of the sheet and it is the one
  that is most clearly wrong.
- **"that exact 4-note cell … forever"** — **FALSE.** It is a three-note cell
  in the file cited, there are four distinct figures in that track, and the
  opening one accounts for 22% of its bars.
- **"D-Eb-Bb-G"** — the G is not there. The cell is D-Eb-Bb.
- **"continuous"** — **FALSE, and by a wide margin.** The figure plays in
  **30–50%** of bars. It stops for long stretches.
- **"never plays the root"** — not tested here and not relied on; the degree
  claim came from the same unverified pass and has been removed from the table
  rather than repeated.

**And the user's other half stands too: this is a DKC1 track.** The genre was
labelled with DK64 as well, and the figure was generalised across both from
one 1994 SNES cue. Nothing in this measurement says anything about DK64.

## 4. WHAT THE PROGRAM WAS DOING, AND WHAT IT DOES NOW

```
                              before      08k       now      the real files
  figure plays in ...          99%        64%       49%        30-50%
  a bar differs from the last   —          —        99%       100% on chord changes
  notes a semitone from a chord 28.5%     28.5%    22.6%          —
```

Two table changes, both of which the program already had the machinery for:

1. **`follow: true`** on the ostinato — *"degrees read against the current
   chord"*, the flag three other genres already use. The cells stay: a cell is
   a SHAPE, and `follow` decides what it is a shape **on**. This is the fix for
   the claim in §3.
2. **The figure stands down for the chorus, the bridge and the instrumental**,
   holding the intro, the verse and the outro — landing at 49%, inside the
   measured band rather than at a number I guessed. (`08k` had removed two
   sections on the strength of the arrangement research; the third came from
   this measurement.)

## 5. WHAT THIS DOES NOT SETTLE

- **The two files are transcriptions, not the game.** `DKC_Water-KM.mid` is
  plainly an ARRANGEMENT — it has echo duplicate tracks, congas, a soprano sax
  and an overdriven guitar that the SNES original does not. The second file is
  closer to a straight transcription. **Two sources agreeing is the standard
  this project uses, and they agree on every row of the table in §2** — but
  neither is the SPC700 data, and a rip of the actual sequence would outrank
  both.
- **DK64 is still unmeasured.** The user says the figure is not in that OST at
  all, and nothing here contradicts them. If it is not, the honest question is
  whether Kirkhope belongs in the same table as Wise at all — which is
  `chrono-trigger.md` §5's "if a fourth composer shares none of it" test,
  pointed at the composer who was already there.
- **The clash is down but not gone** (22.6%). Whether that is right is a taste call
  question, and the figure is now at least clashing *against a chord it is
  reading* rather than one it was ignoring.
