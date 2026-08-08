# THE SPRING REVERB — the boingy one, with a tank you can kick

*Researched 2026-08-08, before building it, on the user's instruction: "A
different kind of room from the one we have, not more of the same — the boingy
one. Springs that shake, and a tank you can kick."*

---

## 1. WHAT A SPRING IS, AND WHY IT IS NOT THE ROOM

> Spring reverb "works by sending audio signal through a transducer attached
> to one end of a metal spring … the signal traveling through the spring as
> mechanical vibrations, bouncing back and forth, and captured by a pickup at
> the other end."
> [[Producer Hive, *How Does Spring Reverb Work?*](https://producerhive.com/ask-the-hive/how-does-spring-reverb-work/)]

> Spring reverbs sound "boingy" **because of dispersion in the spring —
> higher frequencies travel slower than low frequencies.**
> [[Spin Semiconductor forum, spring reverb thread](http://www.spinsemi.com/forum/viewtopic.php?t=598)]

That dispersion is the whole difference from the room this program already
has. A room's reflections arrive together; a spring SMEARS every impulse into
a chirp, over and over as it bounces, and the ear reads the pile of chirps as
"boing". It is a different instrument, not a longer tail — which is the
user's own sentence.

## 2. HOW TO SYNTHESISE ONE — the sourced recipe

The parametric model in the literature (Välimäki et al., *Parametric Spring
Reverberation Effect*):

> "A spectral delay filter consisting of a cascade of identical all-pass
> filters implements the **chirp-like initial response** … A feedback loop
> containing a … delay line produces **multiple echoes of the initial pulse,
> which are progressively blurred over time** to produce the reverberant tail."
> [[ResearchGate, *Parametric Spring Reverberation Effect*](https://www.researchgate.net/publication/230561075_Parametric_Spring_Reverberation_Effect); the same structure in [*Efficient Dispersion Generation Structures*](https://www.researchgate.net/publication/220057482_Efficient_Dispersion_Generation_Structures_for_Spring_Reverb_Emulation)]

This program does not run per-sample filter cascades — it renders through the
Web Audio graph, and its room already works as a synthesized IMPULSE RESPONSE
in a convolver, seeded and deterministic (`makeIr`, Law 7). So the spring is
built the same honest way, one shelf over: **a synthesized spring IR** — a
train of echoes at the spring's round-trip time, each echo a chirp (the
dispersion), each later echo longer and duller than the last (the progressive
blur), band-limited the way a real tank is. Deterministic from the same
seeded-noise hash as the room's IR, so a render repeats to the sample.

## 3. THE DUB FACTS — the kick, and where a spring belongs

> "In no genre is spring reverb more popular than in reggae and dub … used on
> the snare drum to create the signature 'dub' sound. Key figures in dub,
> like **King Tubby** and Lee 'Scratch' Perry, extensively used spring reverb."
> [[eMastered, *What is Spring Reverb*](https://emastered.com/blog/spring-reverb)]

> "The 'crash' sound when you bump a guitar amp is spring reverb being
> physically disturbed — the springs shake and create a burst of chaotic
> reverb, and some producers intentionally exploit this by **sending a loud
> transient into a spring reverb to create dramatic impact sounds.**"
> [[iZotope, *What is Spring Reverb?*](https://www.izotope.com/en/learn/what-is-spring-reverb)]

So the KICK button is not a joke control — it is a documented dub move: a
loud transient into the tank. Here it injects a short impulse into the
spring's own input on the live graph, and the springs on the panel shake
hard. It is a live-hand action, not an event: renders never contain it, so
determinism is untouched.

## 4. WHAT THIS DECIDES

1. **A new matrix column (SPRING) and a new return row** — the unit joins the
   grid the way every effect does, sitting after the room in `MATRIX.order`
   so the echo and the room may feed it and it may feed the flanger, the
   DP/4, the pole and the mix. The renderer stays a DAG.
2. **Its crossings are `voicing`+`live`, not `bus`** — deliberately unridden.
   No genre here is dub; giving one a spring send would be taste with no
   source. The crossings are the HAND's until a genre earns one by listening,
   and this is the honest reading of the must-be-ridden rule rather than an
   exemption from it: nothing is automated in vain because nothing is
   automated at all.
3. **The unit's own knobs**: DWELL (how long the springs ring), TENSION (how
   fast the chirps disperse — the boing's pitch), TONE (the tank's darkness),
   and a KICK button. All `voicing`+`live`; the IR rebuilds when a hand
   settles.
4. **Springs that shake** — three coils drawn on the panel, idling when the
   tank is fed, thrashing for a moment when kicked, still when nothing
   reaches it. The caption says which of those three states is true, read
   from the graph's own input level, never from the knobs.
