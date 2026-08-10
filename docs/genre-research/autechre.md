# Autechre and Plastikman — 2026-07-31

*Three rounds. I got the framing wrong twice and was corrected twice, and both
corrections were right. This is the record of what the sources actually say.*

---

## What I got wrong

**Round 1.** Asked to "research Autechre to make our minimal techno correct", I built a
separate genre and called it **"IDM (Autechre)"**, arguing they were a different music from
Plastikman.

**Round 2.** Told: *"Autechre is meant to improve Plastikman, both are minimal techno."* I
folded the polymetre in and removed the separate genre — but kept arguing the two were
different musics in the write-up.

**Round 3.** Told: *"Autechre is not IDM, that's a dumb name — this is what the band said
about that. They are techno and it is close to minimal… Both artists create stripped down
electronic music with a techno backbone, use tons of reverb echo and space."*

Every part of that is supported by the sources, including the part I had used as a genre
label without checking.

## The label

Sean Booth on "intelligent dance music": he calls it **"silly"**, and notes it is **a purely
American invention** — *"Brits would never self-promote that way — it's kind of obscene to
us."* On the "abstract and weird" framing that travels with it: *"is our music abstract and
weird? To us or our mates it's not!"*
([MusicRadar](https://www.musicradar.com/news/pioneers-autechre),
[The Quietus](https://thequietus.com/interviews/autechre-interview-oversteps/))

Using a name the artist has explicitly rejected, as a *genre label in the program*, was the
worst of the three errors — it is the one that would have shipped.

## The shared lineage is real

Booth grew up in Manchester's underground **electro** scene, collecting records from 1984.
He has spoken to the Detroit originators, and says many of them **"rate what we're doing…
because they were there as well."** When Autechre signed to Warp in 1993 their music **"wasn't
far removed from acid house and Detroit techno."**
([Nialler9](https://nialler9.com/autechre-conversation-music-art-funk-and-emotion-interview/),
[Wikipedia](https://en.wikipedia.org/wiki/Autechre))

Acid house and Detroit techno is *also* exactly where Richie Hawtin comes from. These are not
adjacent genres that happen to share the person playing it — they are two branches of one root, which is
why "artists like Plastikman" returns Autechre.

## The thing I skipped entirely: space

This was the substantive miss. Round 1's research was all rhythm; it never asked how either
artist treats space, which is the trait they most obviously share.

**Autechre.** Booth, on his own stream:

> *"Quite often I'll use other techniques that aren't reverb at all, so I'll have, like,
> **lots and lots of delay lines and all-passes** but not set up in a normal reverb topology."*
>
> *"I quite often use very simple reverb topology, but I have a hand in influencing **the
> tuning** of it."* — and he tunes it to the harmonic content of the track.
>
> *"Sometimes the most simple machines can give the most complex results."*
>
> He favours *"those shitty reverbs from the eighties, the MIDIVerb and the Quadraverb."*
> — [transcribed on Aesthetic Complexity](https://aestheticcomplexity.wordpress.com/2022/06/06/sean-on-autechres-reverb/)

**Plastikman.** *Consumed* is described as **"kick drums bathed in suffocating reverb"**, with
**"dubby splashes… unfurling through billowing clouds of blue-hued vapour."** Hawtin's own
description: **"an album of feedback — everything was cross-modulating everything else."** Cut
live to 2-track DAT through a BEL BD80 delay and an Ensoniq DP4.
([Crack](https://crackmagazine.net/article/long-reads/richie-hawtins-consumed-paved-new-roads-for-minimal-techno/),
[DJ Mag](https://djmag.com/features/plastikmans-consumed-remains-masterclass-dark-minimalist-techno),
[Sound On Sound](https://www.soundonsound.com/techniques/classic-tracks-plastikman-consumed))

### And the genre was not delivering it

Measured against the rest of the file:

| genre | wet | irSec | echo fb | echo send |
|---|---|---|---|---|
| bladerunner | 0.42 | 5.0 | 0.18 | 0.16 |
| **plastikman** | **0.34** | **3.2** | **0.28** | **0.20** |
| jungle | 0.22 | 2.2 | 0.30 | 0.22 |
| dkc | 0.34 | 2.4 | 0.34 | 0.20 |

The genre built on *"an album of feedback"* had **less delay feedback than jungle** and less
room than a film score. Its send highpass sat at 140 Hz, so the kick — the thing that is
supposed to be *bathed* — was mostly not in the reverb at all.

**Changed:** `wet 0.34 → 0.44`, `irSec 3.2 → 4.6`, `tailDark 0.42 → 0.5`, `sendHp 140 → 95`
(the kick now enters the room), `echo fb 0.28 → 0.46`, `send 0.20 → 0.32`, `verb 0.45 → 0.70`
(the repeats go into the room — *"delays on the reverbs"*).

**Measured after**, 17 rendered sections, plastikman on both rigs:

```
              peak     rms   side/mid   clip%    tail
  before     0.873  0.1760     0.2154   0.000   0.208
  after      0.935  0.1806     0.3466   0.000   0.341
```

Stereo reverb return **+61%**, decay tail **+64%**, RMS essentially flat (0.176 → 0.181) — so
it is more *space*, not more *level* — and still **zero clipped samples**.

## A negative result: the tuned room

Booth's "delay lines tuned to the harmonic content" is the most distinctive thing in any of
these sources, so I built it: a feedback comb whose delay is one period of the song's root, so
the room resonates on the tonic.

**It did not survive measurement.** A/B on plastikman seed 2 (root D, 61.74 Hz), five sections,
everything else identical:

| amount | tonic-band energy | comb nulls | RMS | peak |
|---|---|---|---|---|
| 0.16 | ×1.01 | ×1.00 | ×1.01 | unchanged |
| 0.90 | ×0.03–0.17 | — | ×2.3–4.1 | pinned at 1.000 |

At a usable level it does nothing. At an audible level it is not a tuned room at all — it is
broadband comb colouration loud enough to flood the limiter, which drags the tonic *down*. Fed
dense material a comb is a spectral shape, not a ringing pitch; it would need a sparse
impulsive feed to read as one, which is a different design than the quote supports.

**Removed, and left as a comment in `buildGraph` explaining why.** An effect nobody can measure
is not a feature, and "the render is the only truth" has to cut against ideas I like.

(One real bug found on the way: the first version fed the resonator *post* the send highpass,
so a comb tuned to 62 Hz was being fed a signal with everything under 95 Hz already removed.
Fixing that is what made the honest measurement possible.)

## What is still not claimed

The generative/reactive half — *"one fader determines how often a snare does a little roll or
skip, and another thing answers and says: if that snare plays that roll three times, then I'll
do this"* [[SOS](https://www.soundonsound.com/people/autechre)] — is **not built**. Plastikman
is polymetric and it is now genuinely spacious; it is not a system with feedback rules watching
its own output. That is a new kind of builder, not a table entry, and it is the honest next
step.
