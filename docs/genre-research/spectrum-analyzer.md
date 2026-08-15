# The spectrum analyzer — what an RTA is, and how a desk uses one to equalize

*Researched 2026-08-15. The owner: "Can we get a spectrometer and use it for
equalizing?" This sheet is what a real-time analyzer conventionally shows and
how engineers actually read one while EQing, so the display built from it is a
tool and not a decoration.*

## 1. What the instrument is

A real-time analyzer (RTA) displays the audio spectrum continuously, grouped
into octave or fractional-octave bands rather than raw FFT bins. "An RTA groups
these bins into standardized octave or fractional-octave bands, smoothing the
display and making it easier to identify broad trends. RTA is preferred for
live system tuning because the band-averaged view is more stable and easier to
interpret quickly." [SonaVyx glossary, sonavyx.com/en/glossary/rta]

- **1/1-octave mode**: ten bands, centers "31.5, 63, 125, 250, 500, 1000,
  2000, 4000, 8000, and 16000 Hz". [SonaVyx]
- **1/3-octave mode**: "25 Hz through 20 kHz" — thirty bands, "each 1/3 octave
  band has a bandwidth factor of 2^(1/3) ≈ 1.26, providing three bands per
  octave". [SonaVyx; Faber Acoustical SignalScope octave tool,
  faberacoustical.com]

The 1/3-octave grid is the professional default (Studio Six Digital's RTA
module, the hardware DEQ-style units); it is also roughly the ear's critical
bandwidth above 500 Hz, which is why it *looks* like what you hear.

## 2. The axes

- **Frequency is logarithmic.** The standardized band centers are themselves a
  geometric series; an octave takes the same width everywhere on the glass.
- **Amplitude is logarithmic (dB).** "Logarithmic amplitude display,
  70 dB/band-width" is a typical span [toon-llc RTA support]. For a program
  whose signal is dBFS, a window of **−60..0 dBFS** covers everything audible
  in a mix without wasting glass on the noise floor. `[CHOSEN within the
  70 dB convention]`

## 3. Ballistics — why the display doesn't flicker

- **Averaging**: RTAs offer real-time, running-average and peak-hold modes
  [Studio Six Digital RTA; toon-llc]. The common live-use setting is an
  exponential (RC) average so the bars breathe with the music but do not
  strobe. The Web Audio `AnalyserNode` implements exactly this smoothing
  (`smoothingTimeConstant`); ~0.8 is its own default and sits in the
  conventional "fast-but-readable" zone. `[CHOSEN]`
- **Peak hold**: "displays the results of holding the past maximum values
  (peak values) of the amplitude spectrum" [toon-llc] — drawn as a thin cap
  above the live bar, decaying slowly. This is the half of the display that
  catches a resonance that only speaks on the downbeat.
- Update rate: "20 to 60 frames per second using overlapped FFT processing"
  [SonaVyx] — i.e. every animation frame is normal, not excessive.

## 4. Pink noise, and what "flat" means

"Because pink noise has equal energy per octave, it appears as a flat line on
a correctly calibrated RTA display" [SonaVyx]. Consequence for reading MUSIC:
a mix that looks flat on a per-octave RTA has a pink-ish tilt in raw FFT
terms — so the *band* view, not the raw-bin view, is the one where "tilted
down gently to the right" reads as normal and a spike reads as a problem.

## 5. How an engineer uses it to equalize

"Engineers monitor the RTA to ensure bass levels are controlled, midrange
clarity is maintained, and high frequencies are not excessively bright or
dull" [SonaVyx]. In practice the moves are:

1. **Find the pile-up**: a band standing proud of its neighbours across whole
   sections is masking territory — cut there. This program's own mixing sheet
   already carries the doctrine: EQ is for CUTS, "shelves of a few dB" rather
   than drastic ones [docs/genre-research, dungeon-synth mixing thread].
2. **See what a knob did**: move an EQ band, watch the spectrum move where the
   band actually is. The display makes the desk's `lowF/midF/highF` corner
   frequencies *visible facts* instead of numbers.
3. **Solo a part** and its spectrum is alone on the glass — which register a
   part actually occupies is the first question of arranging and of EQ alike.

## 6. What this program builds from the sheet

- A **1/3-octave bar display, 25 Hz–16 kHz** (the top band is bounded by the
  render rate's Nyquist — at a 44.1/48 kHz live context all thirty bands fit;
  the offline 22.05 kHz render tops at 11 kHz and the display is live-only
  anyway).
- **−60..0 dBFS**, log axes, exponential averaging via the analyser's own
  smoothing, **peak-hold caps** with slow decay.
- **The desk's three EQ bands marked on the glass** at their actual
  `lowF/midF/highF`, with the current gain of each band drawn — so the
  spectrometer and the equalizer are one instrument, which is what the owner
  asked for.
- Fed from a **master tap** (an analyser passes audio through untouched; the
  signal path is identical whether or not anyone is looking — the same
  contract every meter in this file already keeps). Solo on any strip leaves
  only that part on the master, so the same glass answers per-part questions.

Sources: [SonaVyx RTA glossary](https://sonavyx.com/en/glossary/rta) ·
[Faber Acoustical SignalScope octave analyzer](https://www.faberacoustical.com/help_x/signalscope_x/help_x/tools/octave.html) ·
[Studio Six Digital RTA](https://studiosixdigital.com/audiotools-modules-2/acoustic-analysis-modules/rta/) ·
[toon-llc RTA support notes](http://m.toon-llc.com/support/fokannonlite_en.html)
