# SAX MATERIAL — what lines a horn player writes, from the scores

*2026-08-02. The user's standing rule, recorded the day it was given: "you
use what we have and you find more — always." So this measures TWO
independent corpora — the Weimar Jazz Database performances we already
used, and the Charlie Parker Omnibook scores found fresh — plus the
pedagogy. Where they agree, the number is a target; where only one
speaks, it is marked. This is the specification for the stage-3
sax-aware theme work: the LAST layer of "still sounds like a keyboard",
because the notes themselves are keyboard lines.*

## Sources

1. Weimar Jazz Database, 272 sax solos, performance-time with beat-level
   chords — measured by `corpus/analyze_sax_lines.py`
   (https://jazzomat.hfm-weimar.de)
2. Charlie Parker Omnibook, 50 scores in MusicXML (themes + solos, with
   harmony) — https://homepages.loria.fr/evincent/omnibook/ — measured
   directly from the XML (music21 not needed); downloaded to
   `corpus/sax/omnibook/`, gitignored, statistics only per LICENSING.md
3. Pedagogy, converging independently: target notes are "a Chord Tone
   (especially a Guide Tone), an Available Tension or a Melody Note",
   placed on "the 1st and 3rd beats of the measure"
   [thejazzpianosite.com/passing-notes; jazzetudes.net; jazzguitar.be —
   approach tones]; phrases breathe [jenslarsen.nl/jazz-phrasing]

## The numbers, cross-validated

| property | WJazzD (272 solos) | Omnibook (50 scores) | target |
|---|---|---|---|
| notes per phrase (q25/med/q75) | 8 / 14 / 24 | 11 / 19 / 31 | **8-24, median ~15** |
| phrase length | 1.45/2.66/4.31 s | 5.5/9.5/15.5 beats | **~6-16 beats** |
| breath between phrases | 0.43-0.97 s | 1-2 beats | **1-2 beats** |
| held notes (≥2 beats) stable | 85.8% | — | **≥85%** |
| strong-beat (1,3) stability | — | 84.1% (55.6 ct + 28.5 tens) | **≥84%** |
| phrase-FINAL note stable | — | **90.9%** (69.4 ct + 21.5 tens) | **≥90%, prefer ct** |
| phrases opening as pickups | — | 26.3% | **~1 in 4** |
| stepwise intervals | 57.4% | — | **~57%** |

Our current lofi sax material against these targets: **under 5 notes per
phrase** (3-4× short), no pickups as a concept, phrase-final stability
unenforced (the NCT law narrows the next note, but a phrase may end on a
tension-in-motion), and long notes not CHOSEN stable — only leaned-into
selectively since `2026-08-02l`.

## The design (stage 3, not yet built)

The sanctioned door already exists: the sax's RANGE is an input to stage
3 ("A RANGE IS AN INPUT TO STAGE 3, NOT A CORRECTION IN STAGE 6"), read
from whatever machine holds the lane. The same door carries a
`lines` declaration on the instrument: when the resolved lead is a horn,
the theme builder writes horn lines —

1. **Phrases join.** Neighbouring cells chain into 6-16-beat phrases with
   1-2-beat breaths between them, instead of one-bar puffs. The rule of
   three still governs what repeats.
2. **Pickups.** ~1 phrase in 4 begins up to a beat before its barline,
   landing its first strong note ON the barline [Omnibook 26.3%].
3. **Targets.** Strong-beat notes prefer chord tones/tensions (≥84%); the
   PHRASE-FINAL note is stable ≥90%, chord tone preferred — as a
   CONSTRAINT on the draw (zero weights, never a correcting pass), the
   same shape as the non-chord-tone law.
4. **Long notes are chosen stable** at composition time — the engine's
   lean-only-into-stable rule then has stable notes to lean into instead
   of politely declining foreign ones.

All of it derived from the tables above; nothing in stages 2-5 names the
sax — it reads the instrument's declaration, exactly like the range.

## What was NOT taken

- Parker's tempo/virtuosity (16th-note density) — the registers here are
  ballad/lofi/cue leads; the PHRASE ARCHITECTURE transfers, the note
  rate does not. Density stays the genre's.
- The Omnibook's actual lines — statistics only, nothing reproduced.
- SaxTranscriptionPipeline's 32 aligned scores (aim-qmul) — noted as a
  third source for a future pass; access is research-gated.

---

## CORRECTION 2026-08-02, before building — the user's question answered

*"When you say studied sax solos do you mean the part of a song that the
sax solos on or just the sax part? Because a sax solos while important is
only part of the whole of a sax playing."*

Honest answer: **the data is solo-biased.** WJazzD is literally 272
improvised solo choruses. The Omnibook files contain themes AND solos but
carry no structural markers to split them, and solos dominate by length.
And the roles literature confirms the user's framing: a saxophone's part
is *"melodic leads, counter melodies, fills that add motion without
dominating, backgrounds"* — *"a more active role during an entire song,
as opposed to just waiting around for their solo"*
[supremetracks.com/how-to-arrange-horns; tamingthesaxophone.com/jazz-backings;
brainvoyage.blog/horn-section-instruments].

**Our lead role is a MELODY, not a solo.** So the targets split:

TRANSFERS to melody playing (and mostly gets STRONGER there):
- phrase-final stability ≥90% — a composed melody ends phrases stable
  even more reliably than a solo does
- strong-beat stability ≥84%
- long notes chosen stable
- pickups ~1 in 4 — a classic melody gesture
- breaths of 1-2 beats between phrases
- phrase ARCHITECTURE of ~6-16 beats

DOES NOT TRANSFER (solo behavior, refused for the melody role):
- 19-31 notes per phrase — that is bebop solo density. A ballad melody
  phrase runs sparser; the genre's own `theme.count` keeps owning density.
  The fix for our sub-5-note puffs is JOINING cells into longer musical
  sentences, not multiplying notes.

FUTURE, separate roles (noted, not built): fills in the windows between
melody phrases (solo vocabulary in one-bar doses), and background pads —
both are arrangement-level roles, not theme-builder changes.
