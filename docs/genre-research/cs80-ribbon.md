# THE CS-80 RIBBON — what it actually is, researched

*2026-08-02. The user's report, which started this: the bladerunner genre
"really only does one thing — pitch bends — and this is wrong and sounds
bad; it's meant to emulate a ribbon controller used for sweeps and other
sounds that did not sound just like a pitch bend." The research below says
the user is right, in detail. This document precedes any reimplementation.*

## Sources

1. Reverb Machine, "Exploring The Yamaha CS-80" —
   https://reverbmachine.com/blog/exploring-the-yamaha-cs-80/
2. Reverb Machine, "Vangelis' Blade Runner Synth Sounds" —
   https://reverbmachine.com/blog/vangelis-blade-runner-synth-sounds/
3. Sound On Sound, "Yamaha CS80" (retrospective) —
   https://www.soundonsound.com/reviews/yamaha-cs80 (via search summary)
4. The Vinyl Factory, "An introduction to the Yamaha CS-80" —
   https://www.thevinylfactory.com/features/yamaha-cs-80-in-10-records (via search)
5. Wikipedia, "Yamaha CS-80" / "Ribbon controller" (via search)

## How the ribbon actually behaves — five facts, all currently missing

1. **It is RELATIVE, with no center.** *"Wherever it is first touched
   becomes the initial point from which the parameter is changed; unusually
   there is no 'middle position'"* [Reverb Machine]. The gesture starts at
   whatever pitch is sounding and moves from there.

2. **Its range is ASYMMETRIC and enormous downward.** *"About +1 octave but
   goes down in pitch all the way to zero"* — moving right gives up to an
   octave; moving left goes *"from the keyboard's highest pitch right down
   to a sub-audio frequency"* [SOS]. The current implementation's
   few-semitone symmetric bend cannot make the signature downward plunge.

3. **It SNAPS BACK instantly on release.** *"When you release your finger,
   the pitch of the sound reverts immediately to the unaffected pitch...
   this makes it possible to play trills"* [SOS]. The current bend ramps
   out and ramps back; a real ribbon gesture ENDS with a cut, and the trill
   — tap away, snap home, tap away — is a documented performance figure.

4. **It can control the FILTER instead of pitch.** *"The ribbon can be set
   to control either the pitch or the filter"* [Reverb Machine]. This is
   the user's "other sounds that did not sound just like a pitch bend": a
   ribbon sweep on the Blade Runner records is sometimes a BRIGHTNESS
   gesture, not a pitch one.

5. **It works on the whole held chord, or on top of it.** Sustain modes:
   *"In sustain I mode, the ribbon only changes pitch of keys held down; in
   sustain II mode, the ribbon changes pitch of all notes sustained"* —
   enabling *"holding a chord with the sustain pedal and then playing
   ribbon melodies without affecting the sustained chord"* [Reverb
   Machine]. The polyphonic glissando — the whole chord diving together —
   is a different gesture from a melody-note scoop, and the program
   currently has only the scoop.

## How Vangelis actually used it

- The Main Titles opening: *"a graceful melody with a spine-tingling
  DOWNWARD glissando on the ribbon controller"* [Vinyl Factory].
- Phrase ends: *"descending pitch slides towards the end of songs"* —
  Tears in Rain [Reverb Machine].
- Memories of Green: gliding effects [Reverb Machine].
- And the expressive core is not the ribbon alone: *"the brass sound subtly
  changing in brightness and intensity from note to note, giving the
  performance an almost orchestral quality"* — velocity + aftertouch via
  the Initial/After faders [Reverb Machine]. A ribbon gesture on the
  records rides OVER that constantly-moving brightness; a bend on a static
  timbre is why the current one reads as "just a pitch bend."

## What this means for the program — the design, not yet implemented

The current state: `initBend` scoops EVERY note identically (a mannerism,
not a performance), and `ev.ribbon` is a single symmetric bend-to-target.
Both are pitch-only, neither snaps back, nothing touches the filter, and
nothing dives.

The reimplementation this research supports, each item traceable above:

- A ribbon event becomes a GESTURE with a vocabulary, not a bend amount:
  **dive** (downward glissando, up to octaves, fact 2), **scoop** (short
  rise into a note, bounded ~+1 octave), **trill** (tap-and-snap-back
  figures, fact 3), **fall** (phrase-end descending slide, Vangelis's
  documented habit), and **sweep** (the same gestures routed to the FILTER
  instead of pitch, fact 4).
- Gesture endings snap, never ramp home (fact 3) — unless the gesture is
  a slide INTO a landing pitch, which is the one case that holds.
- The whole-chord dive (fact 5) belongs to the pad/comp, the melody scoop
  to the lead — two different owners, as on the instrument.
- `initBend` stops firing on every note. Selective, phrase-aware — the
  scoop is a phrase-opening gesture (the articulation model built for the
  sax already knows where phrases start; the CS-80 can read the same
  fields).
- Every gesture rides over the existing aftertouch brightness so it sits
  in a moving timbre, which is what the records do.

Genre split [EAR until measured]: bladerunner gets dives, falls and filter
sweeps prominently; synthwave gets restrained scoops and occasional filter
sweeps — Perturbator's CS-80 lineage is atmosphere, not lead mannerism.
