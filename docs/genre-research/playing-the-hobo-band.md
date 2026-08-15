# Playing the hobo band — how these instruments are actually played

*Researched 2026-08-15, after the owner stopped phase 3 with the right
correction: "We can't just shove new instruments into an old genre. These
new instruments need to be played like they should be played... If a
harmonica is being played long chords — I'm not sure that's possible on a
harmonica... what does the research say? Surely these new instruments can
be played in the slow manner we want."*

*The owner is right twice over. The parts are composed before the
instrument is drawn, so a banjo can be handed an eight-second held chord
when its strings ring for two, and a harmonica can be handed a line with no
breath in it. This sheet is what each instrument's playing actually IS —
and the slow manner the genre wants is exactly what these instruments are
good at, played their own way.*

## 1. The harmonica

**Chords are real, but there are only two of them.** A diatonic harmonica
is BUILT to play chords: "the first octave is tuned to allow the player to
play the C major chord blowing, and the G major chord drawing — the I and V
chords... the most important chords for playing folk music" [Wikipedia,
Richter-tuned harmonica]. So one player, one instrument, can hold the home
chord and the dominant — several reeds of ONE harp sounding together, no
second player needed. **Every other chord cannot be played**: "since the
number of actual chords is very limited, harmonica players usually play
chords as ARPEGGIOS... as substitutes for chords that are impossible"
[themusicstand.ca, Playing Chords With Your Harmonica].

**The breath is the bar line.** Long tones are a practiced skill with a
hard physical limit — a note lives inside one lungful, and playing
alternates blow and draw, so the instrument breathes BY CONSTRUCTION
[countryinstruments.com; jdrharmonica.com breath-control guide]. A written
line for the harmonica needs rests the way a singer's line does.

**The held note is not flat — it pulsates.** The slow manner is exactly
what the harmonica is for, and the technique on a held note is vibrato,
of which players have four kinds: throat, diaphragm ("bouncing your
diaphragm... a continuous sound that pulsates"), tongue, and HAND vibrato
— the cupped hands opening and closing [dummies.com; harmonica.com;
harpsurgery.com]. Our VCSL set has the recorded hand-vibrato takes; the
research says a held note should reach for them most of the time, not
occasionally.

**What this means for the program:** a harmonica chord event is legal ONLY
as the I or V of the harp's key (adjacent-reed tones — in practice: tones
inside one triad, voiced close); any other chord is dealt as an arpeggio or
dropped to its top note. Lines get breath: a note longer than a lungful
(~6 s soft, less loud) is shortened or split at a phrase point, and notes
longer than ~1 s want the vibrato take.

## 2. The banjo

**A banjo cannot hold a note — and banjo players solved this centuries
ago.** The ring of a picked string is a couple of seconds at best (our own
recordings, trimmed at 2.4 s, say the same). The instrument's sustain is
an ILLUSION made by the right hand:

- **Tremolo**: "playing a note fast and repeatedly so that it gives the
  impression of a single sustained note... moving the pick quickly back
  and forth" — and for chords, "play the chord across all the strings on
  the beat while continuously tremoloing the single melody note"
  [Deering Banjos blog, How To Play a Tremolo].
- **The roll**: bluegrass sustains by arpeggiating the chord continuously —
  which is what our ostinato lane already does with the banjo, correctly.
- **Clawhammer, for the slow songs**: "instead of always brushing across
  the strings, you can isolate individual notes within the bar chord and
  let them sustain, which gives the song its gentle, flowing character"
  [banjoskills.com, Silent Night clawhammer lesson; Peghead Nation].

**What this means for the program:** a banjo "held chord" longer than the
ring is a LIE we currently ship as silence — the sample dies and the note
plays nothing. The honest renderings, per the sources: strike and let ring
(for notes within the ring), re-strum on the harmonic rhythm (for longer
holds), tremolo (for a sustained single note), or the clawhammer thing —
break the chord and let picked notes overlap. The comp should re-strike;
never hold dead air.

## 3. The glass slide

The slide's continuous pitch was built right — but the STRING under the
slide still decays like any picked string. A slide player holds a long
note by re-picking or letting vibrato carry the tail; an infinite synth
sustain is the opposite lie from the banjo's silence. The voice should
decay like a string (seconds, not forever) and re-pick on long holds.

## 4. The winds and the reeds already in the file (the same law)

The program already carries one instance of this doctrine: the doubling
engine's AIR table (a per-instrument breath number) and the mellotron's
tape running out mid-note are both "the instrument reshapes the note it
cannot play". The harmonica joins that family; the contrabassoon and the
recorded bassoon are wind players too, and any note past a lungful has the
same problem on them. The audit of who else lies about held notes belongs
to the build, measured, not assumed here.

## 5. The correction, in one sentence

**An instrument declares how it is played — breath, ring, and what it does
with a note it cannot hold (breathe, re-strike, tremolo, arpeggiate) — and
the program honours the declaration at render, so the slow music the owner
wants comes out the way a real player would play it slowly.**

Sources:
[Wikipedia — Richter-tuned harmonica](https://en.wikipedia.org/wiki/Richter-tuned_harmonica) ·
[The Music Stand — Playing Chords With Your Harmonica](https://www.themusicstand.ca/blogs/htp-harmonica/chords) ·
[Country Instruments — How To Breathe While Playing Harmonica](https://countryinstruments.com/how-to-breathe-while-playing-harmonica/) ·
[JDR — The Definitive Guide to Breath Control](https://www.jdrharmonica.com/blogs/jdr-harmonica-10/the-definitive-guide-to-breath-control-for-crisp-expressive-playing) ·
[Dummies — Pulsate Notes with Vibrato](https://www.dummies.com/article/academics-the-arts/music/instruments/harmonica/how-to-pulsate-notes-on-the-harmonica-with-vibrato-146630/) ·
[Harp Surgery — Vibrato](https://www.harpsurgery.com/how-to-play/vibrato/) ·
[Deering Banjos — How To Play a Tremolo](https://blog.deeringbanjos.com/how-to-play-a-tremolo-on-4-string-banjo) ·
[Banjo Skills — Silent Night, clawhammer](https://banjoskills.com/banjo-lessons/silent-night/) ·
[Peghead Nation — Clawhammer Banjo](https://www.pegheadnation.com/string-school/courses/clawhammer-banjo)
