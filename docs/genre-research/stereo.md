# STEREO — why the program was mono, and what the sources say to do

*2026-08-03. The user: "We need this all to be stereo... why are we not in
stereo?" The searches behind that build lived only in commit messages; this
is the reference copy.*

## THE MEASUREMENT THAT STARTED IT

There was **not one panner in the file** — no StereoPannerNode, no
PannerNode, no splitter or merger. Every voice was mono and landed dead
centre; the only stereo content anywhere leaked out of the ROOM's
decorrelated halves. Side-vs-mid energy, seed 11, before any change:

| genre | side vs mid |
|---|---|
| acid | **-58.5 dB** |
| jungle | -48.8 |
| lofi | -29.0 |
| synthwave | -23.5 |
| dkc | -20.4 |
| bladerunner | -14.3 |
| plastikman | -13.4 |

The two that read "narrow" were only there because they are drenched in
reverb. **Width was an accident, never a decision.**

## 1. THE RHODES SUITCASE'S "VIBRATO" IS AN AUTO-PAN

Sources: rhodesmusic.com V-Pan manual/plugin page; fenderrhodes.com
history/effects; forums.musicplayer.com.

> "There is no pitch modulation, just amplitude modulation which cancelled
> out in mono... The first version of the Vibrato was in mono, a tremolo
> that varied the amplitude in a square-wave pattern. **When the Suitcase
> amps went stereo in 1969, this pattern was translated into a panning
> effect.**"

So switching it on RESTORES the instrument rather than treating it. Built
as `panHz`/`panDep` on the machine (the instrument's own character), and it
is deliberately NOT owned by the stage — the stage places players, it does
not tell them how to play.

**The Wurlitzer is different and must not be faked**: its tremolo is
genuine mono amplitude modulation. What it gets is a PLACEMENT, which is
what a desk gives it, not what its electronics do.

**The Mellotron is mono** — one output, one tape head per key. Its width on
record came from what it was played through.

## 2. THE STRING-ENSEMBLE SWIRL IS THREE LINES AND TWO THREE-PHASE LFOs

Sources: github.com/jpcima/ensemble-chorus (a digital model of the
circuit); ARP/Eminent Solina material via search.

> "Two three-phase LFOs, where three-phase means three sinewave outputs each
> **120 degrees out of phase**... one phase from both LFOs controls one
> delay unit." Triple BBD chorus; the out-of-phase configuration is what
> makes it spacious rather than merely wobbly.

**The finding this produced in our own code**: the vp330's ensemble was
ALREADY three taps on two three-phase LFOs — the Solina architecture — and
then all three were summed into ONE mono node on the very next line. The
chorus was built and collapsed. Now L/C/R. The CS-80's two taps likewise
straddle its centred dry. **This is where record-width comes from; panning
a finished sound is placement, not width.**

## 3. MONO COMPATIBILITY IS A HARD CONSTRAINT HERE

Sources: sonible "Avoiding the Collapse"; waves.com "7 Tips for Mono
Compatibility"; adsrsounds "10 Tips"; numberanalytics.

> "When two signals that are out of phase are summed to mono, they can
> cancel each other out, resulting in a thin or hollow sound."
> "Keep drums, bass and lead vocals centered."
> "Pretty much all frequencies below 60–100 Hz should be mono."
> "Sound systems in clubs and pubs are often mono."

**Three of these seven genres are sound-system music.** So the whole build
uses AMPLITUDE panning only — no Haas, no phase tricks — because a
StereoPanner summed to mono costs level and never costs the note. Drums and
bass are not panned at all; the kit's IMAGE is per-channel with kick and
snare centred, which is the same rule applied one level down.

**What this rules out**: mid/side width tricks. A negative crossing on a
matrix (the A-138m's bipolar switch) is exactly an M/S tool — mid = L+R,
side = L−R — and it was refused in round one of the matrix research for the
wrong reason ("it's a CV feature"). The right reason is that our rows are
mono buses, not stereo pairs.
