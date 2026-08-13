# HOW A DRONE EVOLVES — and whether the parameter lock is the thing that does it

*Researched 2026-08-13. The owner, on `b4699dc`: "How do you know what i said
about plocks is correct in regards the drones? Did you research it?" The answer
was **no**. I measured that the two drone genres declared zero parameter locks
while eight others declared one to four, wrote "MEASURED, AND EXACTLY RIGHT"
into the source, shipped six locks, and never once asked whether parameter
locking is how this music actually evolves. This sheet asks it.*

---

## 0. HOW THIS SHEET WAS MADE, AND HOW MUCH TO TRUST IT

**The conflict of interest, stated first.** I built the thing this sheet
assesses, six hours ago, and I wrote a commit message calling the owner's
diagnosis correct. A sheet written by that author has one obvious failure mode
and it is not "too harsh".

**Method.** Sixteen web searches and twenty-two page fetches across seven
traditions. Nothing from memory. Every quote below is tagged with whether the
page itself was read or only its search summary:

- **Fetched and quoted from the live page:** Elektron's own Syntakt and
  Digitakt II product pages; the Digitakt II manual's trig-conditions page;
  Robert Hood in *The Skinny*; Donato Dozzy in *Orb Mag*; Reverb Machine's
  transcription of Eno on the *Music for Airports* loops; the Piobaireachd
  Society; Wikipedia's *Irama* and *Ambient 1*; the EDMFormer paper; the
  dungeon synth neocities guide; cochlea.eu.
- **Search summary only, marked `⚠ summary` in the text:** the slow-change-
  deafness numbers (five separate paywalls/cookie-walls; the same numbers came
  back from two independent searches, which is corroboration, not verification);
  the pitch and loudness JNDs; the brightness-doubling ratio; the beat-frequency
  figures; the ground-bass and gamelan material beyond the *Irama* page; the
  dub-techno hand-automation lines; La Monte Young.
- **Refused the fetcher and are therefore NOT quoted:** hyperphysics (503 ×2),
  corymbus (403), Springer, PubMed, ResearchGate, phys.unsw, McGill, artistsindsp.

**What is mine and not any source's:** §2 — the period argument — and the
arithmetic in §6c. Both are marked.

---

## 1. THE VERDICT

**The owner's premise is partly right and mostly misattributed, and the half he
named first is the wrong half.** Parameter locking, as defined by the company
that coined the word, is a mechanism for **detail inside the bar** — and it
cannot be a mechanism for long-form evolution, not as a matter of taste or
degree but *by construction*, because a value stored against step 7 recurs on
step 7 of every bar for as long as the pattern runs. **A mechanism whose period
is exactly one bar cannot make bar 200 different from bar 4.** The second word
in his phrase, "automitization", is closer to right, and it still does not rank
first: continuous slow automation is the mechanism the psychoacoustic literature
is *least* kind to (§6b).

What the sources put the heavy lifting on, in order: **parts entering and
leaving**; **cycles whose periods do not divide each other**; and **discrete
variation events over an unchanged ground**. Those three are what every one of
the seven traditions surveyed here converges on, and this program has the first,
has never had the second, and has the third only at the record scale.

**And the locks I shipped are not useless — they are misnamed.** Their depth is
comfortably above threshold (§6c), so they do change what the bar sounds like.
They are a texture improvement wearing an evolution fix's name. The sentence to
withdraw is "MEASURED, AND EXACTLY RIGHT" in the source comment and in
`probe_drone.js`; the probe's *measurement* is fine and the probe itself is
scrupulous about calling its axis "within a bar" rather than "evolution". The
commit message was not.

---

## 2. THE ARGUMENT THAT SETTLES IT BEFORE ANY SOURCE IS OPENED

**This is mine, not a source's.** A parameter lock is a function of step index.
`motionAt` rounds the event's time to a sixteenth and reads `amt[step]` — so the
value it returns is periodic with period exactly one bar. A signal of period *P*
contains no information at any timescale longer than *P*. Evolution over a
9-minute record is a claim about a timescale of ~200 bars.

So the question "do parameter locks produce long-form evolution" is not an
empirical question about music. It is closed by the definition of the mechanism.
The only honest thing a p-lock can be sold as is **what happens inside one
repeat**, which is exactly how its inventor sells it.

---

## 3. WHAT ELEKTRON ITSELF SAYS — and what it sells for long form

The repo already holds the manual's definition (`parameter-locks.md` §1: "a
parameter locked to a certain value for a specific step"). What it does not hold
is Elektron's own *framing*, which is unambiguous:

> **"Simply holding any step and tweaking any parameter onto it is an
> ultra-fast and detailed way of sequencing"** — "Some call it Swedish
> sequencing. We call it parameter locking."
> [corpus:elektron.se *Syntakt*]

"Detailed way of **sequencing**". Not a way of developing. The Analog Rytm page
uses the same register — "ultra-fast and detailed sequencing" — and Digitakt II
mentions P-locking only as a consequence of having more steps.

**And when Elektron addresses the long form, it reaches for three other things,
none of which is a p-lock:**

> "**Song Mode** is a feature that gives you the possibility to create, edit,
> and play compositions made up of dozens of your patterns." — "**Extend beyond
> the limits of the 64-step sequencer.**" [corpus:elektron.se *Syntakt*]

> "128 steps per pattern and track" with "**Individual pattern length per
> track**" and "Individual time scale multiplier per track"
> [corpus:elektron.se *Digitakt II*]

> **"Trig conditions are a set of conditional rules that you can apply to any
> trig, using specific parameter locks called conditional locks."** — "A sets
> how many times the pattern plays before the trig condition is true. B sets how
> many times the pattern plays before the count is reset." With `2:4` "the trig
> plays the second time the pattern plays and then the sixth, the tenth, and so
> on"; with `4:7`, "the fourth time the pattern plays and then the eleventh, the
> eighteenth, and so on." [corpus:elektron *Digitakt II User Manual* p.48]

That third one is the whole distinction in one page of the same manual. **The
Elektron mechanism that makes this repeat differ from the last one is the trig
CONDITION, not the parameter value.** A conditional lock is technically a
p-lock — Elektron says so — but the thing that varies across repeats is the
*condition*, whose period is A:B bars, not the knob, whose period is one bar.
`4:7` has a period of seven bars. That is a different machine entirely.

Note also "individual pattern length per track": two tracks at 15 and 16 steps
realign every 240 steps. That is mechanism #2 below, sold by Elektron as a
sequencer feature, and this program has no equivalent — a hole
`static-harmony-and-evolution.md` §4 already listed as gap 3 five days ago and
which nobody connected to the drone question.

---

## 4. THE RANKING — mechanisms of long-form change, by weight of evidence

Ranked by how many independent traditions name the same mechanism, and whether
any of them describes it as *the* source of motion rather than as decoration.

| # | mechanism | traditions that name it | strength |
|---|---|---|---|
| **1** | **parts entering and leaving** | dungeon synth, ambient, minimal techno, ground bass, gamelan | **five, all primary** |
| **2** | **cycles whose periods do not divide** | Eno, generative/drone practice, Reich (repo), Elektron | **four, with numbers** |
| **3** | **discrete variation events over an unchanged ground** | pibroch, passacaglia/chaconne, gamelan, alap | **four, formalised** |
| **4** | **density change** (same material, more or fewer notes) | gamelan *irama*, pibroch doublings, diminution | three, with ratios |
| **5** | **register expansion / accretion** | alap *vistar*, variation form | two, formalised |
| **6** | **spectral/filter movement at the SECTION scale** | dub techno, Hawtin, MIR segmentation | three, one empirical |
| **7** | **beating and detuning between near-unison voices** | drone practice, La Monte Young, synth design | three — but see below |
| **8** | **per-step parameter locks** | Elektron only, and framed as *detail* | one, and it disclaims |
| **9** | **slow continuous parameter automation** | production tutorials | one, and §6b contradicts it |

**#7 is not evolution and belongs in a different column.** Beating makes a drone
*alive* rather than *dead* — two voices a few cents apart produce amplitude
modulation at the difference frequency, and synth practice puts the musically
useful band at "between one and five beats per second", with "a 5-cent error is
a 1.27 Hz beat at A4" [⚠ summary; patent + calculator sources, weakest citation
in this sheet]. One to five hertz is a *fast* motion. It is the drone's texture,
on the same shelf as the p-lock, not its arc.

**#1 is the strongest and the least glamorous.** Dungeon synth's own guide:
"Most dungeon synth consists of **a single loop repeated endlessly, with
instruments coming in and out** and mild variation here and there" [⚠ summary],
and the practitioner's own workflow, fetched: "Maybe song 3 will just be Part A,
but **stuff will slowly get layered in on top of it**" and "Once most of the
songs are feeling good I add all the extra stuff in: underlying drones,
background flourishes, little sound effects at impactful parts"
[corpus:dungeon-synth.neocities *Music Making Guide*]. Hawtin's own signature
move is the same mechanism run backwards — "I'd let all the effects play, and
then in one set **instantly turn off the effects**, and then eight bars later
turn them back on" (`plastikman-minimal.md` §3, this repo's own fetched source).
Dozzy: "you build **layers** that you play one on top of each other to create
the flow" [corpus:orbmag].

**#2 has the only hard numbers anyone gives.** Eno on *Music for Airports*,
which is the canonical answer to "goes on and on while evolving":

> Twenty-two loops, "very long tape loops, like fifty, sixty, seventy feet
> long", wrapped around aluminium chairs. One repeats **"every 23 1/2
> seconds"**, another **"every 25 7/8 seconds"**, a third **"every 29 15/16
> seconds"** — "they are **not likely to come back into sync again**." — "I just
> set all of these loops running and let them configure in whichever way they
> wanted to." [corpus:reverbmachine, transcribing Eno]

And Eno's own stated design rule for the vocal pieces: "**complicated rather
than simple relationships**" between loop durations [corpus:wikipedia *Ambient
1*]. Generative drone practice restates it independently: use "three separate
'clocks' that are not related to each other", and "because these values are not
simple multiples of each other, the resulting combination of modulation will
create a very long complex layer of change" [⚠ summary].

**No parameter was automated in Music for Airports.** The loops are fixed; the
change is entirely in which fixed things coincide. That is the single most
damaging fact in this sheet for the premise it was asked to test.

---

## 5. THE HISTORICAL AND NON-WESTERN ANSWERS — the deepest evidence, and nobody in the electronic sources cites them

These traditions solved "music that goes on and on while evolving" centuries
before a knob existed, which makes them a control condition: **whatever they do,
it is not parameter automation.**

### 5a. PIBROCH — an actual formal structure for variation over a drone

> "The variations are based on the ground (the theme), generally utilising the
> main melody notes. In other words they look at the melody of the tune from
> another aspect, **whilst still holding true to the theme**."
> — "Commonly there are **5–7 variations**, meaning that a piobaireachd can
> last for **10–15 minutes**." (*The Lament for the Union* has 19.)
> — "Doublings and treblings of variations can be played slightly faster than
> singlings, with the tempo being slowed on entering the singling of the next
> variation."
> — "The notes of each tune combine with the sound from **the drones** to
> produce harmonics which are not present when bands play."
> [corpus:piobaireachd.co.uk *What is Piobaireachd?*]

**Ten to fifteen minutes over an unchanging drone, and the structure is five to
seven DISCRETE events.** Not a curve. Each variation is a step change in
embellishment and density, announced, with the tempo *reset* on entering the
next one. The drone does not move at all; the drone is the reference against
which everything else is heard to move.

### 5b. ALAP — twenty minutes with no rhythm section, developed by a rule

> Many musicians perform alap "through **vistar**, where the notes of the raga
> are introduced one at a time, so that **phrases never travel further than one
> note above or below what has been covered before**", "beginning with just a
> few of the lower notes and gradually expanding your reach to include the
> entire octave", and "over a period of many phrases, the Raga is gradually
> progressed note by note towards Tara Sthayi (higher octave)". Then alap gives
> way to *jor* (pulse appears) and *jhala* (fast). [⚠ summary; raag-hindustani
> was fetched and confirms the register-expansion half but not the one-note
> rule, so the rule is marked as unverified]

**Register is the axis.** The evolving quantity is *how much of the scale has
been heard*, and it is monotonic and irreversible. This program has register
bands per role and draws a mode per song; nothing anywhere expands a range over
the length of a record.

### 5c. GAMELAN IRAMA — evolution as a density lattice

> Irama is "melodic tempo and relationships in **density**". Peking notes per
> balungan beat: **lancar 1, tanggung 2, dados 4, wilet 8, rangkep 16.** When
> irama becomes slower, "there is **more space to be filled**" and "elaborating
> instruments become more important". "Each Irama can be played in different
> tempi." [corpus:wikipedia *Irama*]

A five-rung ladder of **doubling**, formally separate from tempo. The same piece
"can assume different lengths and different degrees of embellishment" [⚠ summary]
by moving up and down it.

### 5d. GROUND BASS / PASSACAGLIA — the Western name for the same idea

Ostinato of 4–8 bars, fixed; "**dynamics, articulation, orchestration, and tempo
can all be changed and manipulated without changing the ostinato itself**", and
variation proceeds "from the unassuming to the complex in waves wherein climaxes
are offset by sudden drops in activity only to build to greater climaxes", using
diminution, augmentation and inversion [⚠ summary].

**"Waves… offset by sudden drops"** is not a curve either. It is #1 and #3
again: things leave, then more things come back.

### The convergence, stated plainly

Four traditions, no shared ancestry, spanning Java, Scotland, north India and
baroque Europe, all with an unchanging foundation and a 10–20 minute span. All
four evolve by **discrete, countable events** — a variation, an irama, a new
note admitted to the raga, a new figuration over the ground. **Not one of them
evolves by a quantity moving continuously.** Every one of them keeps the drone
or the ground *literally constant* and moves everything else.

---

## 6. THE PSYCHOACOUSTICS — the decision-useful part

### 6a. The JND numbers, such as they are

| quantity | threshold | conditions | source |
|---|---|---|---|
| loudness, isolated | **~1 dB** skilled; 2–3 dB unskilled | absolute level change | SOS/Robjohns (already in repo) |
| loudness, in a balance | **0.25 dB** | relative level of two sounds in a mix | ibid |
| intensity, lab | **0.4 dB** | "at higher intensities"; ~150 discriminable loudness levels | [corpus:cochlea.eu] |
| intensity, lab | **<1 dB** above 40 dB SPL / 100 Hz; **~0.25 dB** above 60 dB at 1–4 kHz | | ⚠ summary |
| pitch | **~3 cents (0.3% of an octave), ~0.5% of frequency** at 2 kHz above 30 dB | | ⚠ summary |
| brightness | centroid ratio to **double** perceived brightness ≈ **2.0** from a 500 Hz reference, falling to ~1.5 from 1380 Hz | Schubert & Wolfe | ⚠ summary |

**Nobody gives a JND for filter cutoff on a sustained musical tone.** Searched
directly; what comes back is speech-intelligibility work (the maximum audible
low-pass cutoff for speech is ~13 kHz; "nearly 80% of listeners found speech
low-pass filtered at 14 kHz indistinguishable from full-band" [⚠ summary]),
which answers a different question. The brightness-doubling ratio is the nearest
usable proxy and it is a *scaling* result, not a threshold.

### 6b. AND THE JND IS THE WRONG RULER — this is the finding that reorders §4

> **Slow change deafness.** Listeners heard continuous speech that changed
> **three semitones in pitch** over its duration; **nearly 50% failed to notice
> the change.** Experiments 2 and 3 replicated it, **demonstrated that the
> changes were well above threshold**, and showed that alerting listeners to the
> possibility of a change improved detection dramatically. — Neuhoff et al.,
> *Attention, Perception, & Psychophysics* 77, 1189–1199 (2015)
> [⚠ summary — five paywalls; the same numbers returned from two independent
> searches, which is corroboration and not verification. **Treated as
> load-bearing anyway, and flagged here because it is.**]

Three semitones is **300 cents against a 3-cent JND — a hundred times the
discrimination threshold — and half the room misses it** when it arrives slowly
and continuously. The general result is the same: "change deafness can occur for
gradually and continuously changing stimuli **without a masking or intervening
silent interval**" [⚠ summary].

**So a slow continuous automation curve is the single least reliable way to be
heard changing something.** The JND tells you what a listener can discriminate
when two things are *presented against each other*. It says nothing about what a
listener notices over ten minutes, and the change-deafness literature says the
answer there is: much less than you think, unless the change is **discrete,
segmented, or attended.**

This is the mechanism behind every result in §5. Pibroch does not fade into its
next variation; it lands on it. Hawtin does not ride the effects down; he
switches them off. Irama does not glide; it doubles. **Music that must be heard
to evolve evolves in steps.**

And the corroboration from the other end — MIR, measuring what actually marks a
boundary in machine-heard electronic music:

> EDM sections "are **not characterized by chords or vocals, but by spectral
> brightness, rhythmic density, and low-frequency energy changes**", unlike pop
> where "structure is mainly defined by harmonic repetition and lyrical
> phrasing". [corpus:arxiv *EDMFormer*, 2603.08759]

Brightness, density, low end. Two of the three are #1 and #4 in §4 — parts and
density. The third is #6, filter movement, **at the section scale**, which is
the only place any evidence puts it.

### 6c. SO IS THE 2.8% AUDIBLE? — the question as asked, and the question underneath

**First, "2.8%" is not a dial percentage and I should not have let it be read as
one.** `probe_drone.js` measures the *share of a record's total knob travel that
occurs inside a bar*. Hobbit synth went 1.1% → 2.8%. That is a statement about
the distribution of movement across timescales; it says nothing about size.

**The actual size, computed from the shipped spec.** `tone` maps exponentially,
`500 * (18000/500)^tone` — **5.17 octaves across the control**. The locks draw
per-step amounts in `[-0.09, +0.06]` (strings `[-0.05, +0.04]`, harp/pluck
`[-0.10, +0.08]`) at densities of 0.12–0.42, i.e. **2 to 7 locked steps of 16**.
So a locked step sits between **0.47 octaves below and 0.31 octaves above** the
unlocked value, and the widest step-to-step jump available inside one bar is
0.15 of the control = **0.78 octaves, a 1.71× cutoff ratio**. [This arithmetic
is mine.]

Against a brightness scale where **2.0×** the centroid is "twice as bright", a
1.2×–1.7× step-to-step ratio is a large fraction of a doubling and is not near
any threshold. **The locks are audible. Their depth was never the problem.**

**The question underneath is the one that matters, and its answer is no.** Those
locks make bar 4 sound *richer*. They make bar 200 sound **exactly like bar 4**,
because they are the same six numbers in the same six slots. Whatever the record
gained, it did not gain evolution, and the within-bar travel figure — which is
the number I acted on — is structurally incapable of measuring evolution. It
measures texture. The probe's own header says "within a bar"; the commit message
called it the thing a repeat needs, and then implied that was the same thing.

Robert Hood, who has the best sentence anyone has on what a p-lock is actually
*for*:

> "It's about **finding rhythm inside rhythms**. If you listen closely to some
> of those tracks… you sort of find **other hidden rhythms inside of the
> rhythm**." [corpus:theskinny, Hood speaking]

His interviewer, on what the *long form* does — a separate claim, and note it is
the journalist's and not Hood's: Hood "sculpts engrossingly repetitive tracks
which draw you in fully, **each miniscule development allowing you to
reconceptualise the last**" [corpus:theskinny, Ronan Martin]. A *development*
that lets you reconceptualise the *last* one is a discrete event with a before
and an after. It is not a knob at 2.8%.

---

## 7. WHAT NOBODY GIVES

Every one of these was searched for directly and did not come back. They are the
holes any future build has to fill with a `[CHOSEN]` and say so.

- **No JND for filter cutoff on a musical sustained tone.** Not in the
  psychoacoustics, not in production literature. The brightness-doubling ratio
  is a scaling law, not a threshold, and speech-intelligibility cutoffs answer a
  different question.
- **No rate.** Nothing anywhere says how fast a parameter must move to beat
  change deafness, or how slow it must be to hide. Neuhoff's result gives one
  data point in one modality with one stimulus.
- **No depth or density for a p-lock, from anybody, still.** This was already
  the finding in `parameter-locks.md` §5 — "no source anywhere gives a depth or
  a density" — and a second, independent pass over Elektron's own material and
  the artist forums did not change it. Every number in the shipped spec is
  `[CHOSEN]` and remains so.
- **No measurement of how much actually changes in a drone record.** MIR has
  novelty curves and self-similarity matrices and has applied them to EDM; the
  literature that came back does not apply them to ambient, drone or dungeon
  synth, and nobody reports "an ambient track's self-similarity at 10 minutes".
- **Nothing on habituation timescales for music.** How long a listener stays
  engaged with a fixed texture before it stops registering — the question the
  whole genre turns on — produced nothing citable.
- **No electronic-music source cites any of §5.** Not one dub techno, drone,
  ambient or dungeon synth source encountered here mentions pibroch, alap, irama
  or ground bass, though all four are older, more formalised, and better
  documented answers to the identical problem.

---

## 8. WHAT THIS SAYS ABOUT THE BUILD — no file touched, this is the specification

**Nothing here is built.** This sheet's brief was one question and the answer to
it is a research finding, not a commit. What it licenses:

- **`[CHOSEN]` — the six locks stay.** They are audible (§6c), they are on the
  only timbral control an erang sampler has, and #8 in the ranking is still a
  real mechanism with Elektron behind it. **What changes is the claim.** The
  comment above them and `probe_drone.js`'s header say the owner was "EXACTLY
  RIGHT" and should say what §1 says: this is within-bar detail, the genre had
  none, it has some now, and it is not why a drone evolves.
- **The ranked gaps, in the order the evidence puts them.** (1) Nothing in this
  program has *periods that do not divide* — every LFO is free-running and
  independent, already recorded as gap 3 in `static-harmony-and-evolution.md` §4
  and never connected to the drone question. Two lanes at 15 and 16 bars is
  arithmetic, not samples, and it is the Eno mechanism exactly. (2) Nothing
  admits or withdraws a *part* on a schedule the way §4 #1 describes — the
  `fill` gestures shipped in `dungeon-synth-fx-and-balance.md` §5 move sends at
  section seams, which is #6, the weakest of the three. (3) Nothing does #3:
  there is no ground-plus-variation form where the same material returns in a
  countably different dress.
- **And a cheap one that is not in the ranking but is in all four traditions:**
  every one of §5 keeps the drone *literally constant* and moves everything
  else. This program's bass drone is already inaudible
  (`dungeon-synth-fx-and-balance.md` §4). A constant foundation is only a
  reference if it can be heard.
- **The measurement instrument needs a second axis.** `probe_drone.js` splits
  travel into within-bar and bar-to-bar and has no axis for *across the record*.
  A genre could score perfectly on both existing columns and still be a nine-
  minute loop. Comparing early-record and late-record windows — self-similarity,
  the MIR instrument — is the missing column, and §7 says nobody has published
  a target for it, so it would be a measurement without a threshold. Worth
  having anyway.

---

## Sources

**Fetched and quoted from the page:**

- [Elektron — Syntakt](https://www.elektron.se/explore/syntakt) *(p-locks as "ultra-fast and detailed way of sequencing"; Song Mode as the long-form answer)*
- [Elektron — Digitakt II](https://www.elektron.se/explore/digitakt-ii) *(128 steps, individual pattern length per track, Song Mode)*
- [Elektron Digitakt II User Manual p.48 — Trig Conditions and Conditional Locks](https://www.manualslib.com/manual/3436437/Elektron-Digitakt-Ii.html?page=48) *(A:B, the 1:2 / 2:2 / 2:4 / 4:7 examples)*
- [The Skinny — Robert Hood interview (Ronan Martin)](https://www.theskinny.co.uk/clubs/interviews/rhythm-roots-and-spirituality-connecting-the-dots-with-robert-hood)
- [Orb Mag — Donato Dozzy: Decoding a musical language](https://www.orbmag.com/features/donato-dozzy-decoding-a-musical-language/)
- [Reverb Machine — How Brian Eno Created Ambient 1: Music For Airports](https://reverbmachine.com/blog/deconstructing-brian-eno-music-for-airports/) *(the 23½ / 25⅞ / 29 15/16 second loops)*
- [Wikipedia — Ambient 1: Music for Airports](https://en.wikipedia.org/wiki/Ambient_1:_Music_for_Airports) *("complicated rather than simple relationships")*
- [The Piobaireachd Society — What is Piobaireachd?](https://www.piobaireachd.co.uk/what-is-piobaireachd)
- [Wikipedia — Irama](https://en.wikipedia.org/wiki/Irama) *(the 1/2/4/8/16 density lattice)*
- [EDMFormer: Genre-Specific Self-Supervised Learning for Music Structure Segmentation, arXiv 2603.08759](https://arxiv.org/html/2603.08759v1)
- [Dungeon Synth Music Making Guide (neocities)](https://dungeon-synth.neocities.org/music-making-guide)
- [Cochlea.eu — Psychoacoustics](https://www.cochlea.eu/en/sound/psychoacoustics/) *(0.4 dB; ~150 loudness levels)*
- [Attack Magazine — Basic Channel-Style Dub Techno](https://www.attackmagazine.com/technique/beat-dissected/basic-channel-style-dub-techno/) — **a negative result, recorded because it is one:** the canonical dub-techno tutorial is entirely about building one 16-bar loop and says nothing at all about how a track develops over its length.

**Search summary only, marked `⚠ summary` in the text and not verified against the page:**

- [Neuhoff et al., *Slow change deafness*, Attention, Perception, & Psychophysics 77:1189–1199 (2015)](https://link.springer.com/article/10.3758/s13414-015-0871-z) *(Springer/PubMed/PsycNet/ResearchGate all refused; the three-semitone and ~50% figures returned identically from two independent searches)*
- [Schubert & Wolfe — Does Timbral Brightness Scale with Frequency and Spectral Centroid](https://www.phys.unsw.edu.au/jw/reprints/SchubertWolfe06.pdf) *(PDF unreadable to the fetcher)*
- [ScienceDirect — Just Noticeable Difference overview](https://www.sciencedirect.com/topics/engineering/just-noticeable-difference) *(pitch and loudness JNDs)*
- [Raag Hindustani — Improvisation](https://raag-hindustani.com/Improvisation.html) *(fetched; confirms register expansion, does NOT contain the one-note vistar rule, which is therefore marked unverified)*
- [Chandraveena — Raga Alapana](https://www.chandraveena.com/blog/raga-alapana/), [Wikipedia — Alap](https://en.wikipedia.org/wiki/Alap)
- [Open Music Theory — Ground Bass](https://viva.pressbooks.pub/openmusictheory/chapter/ground-bass/), [Wikipedia — Chaconne](https://en.wikipedia.org/wiki/Chaconne)
- [Artists in DSP — 7 Advanced Techniques for Evolving Drones](https://artistsindsp.com/ambient-sound-design-7-advanced-techniques-for-evolving-drones-and-textures/) *(403; the "three unrelated clocks" line)*
- [Monson & Caravello — The maximum audible low-pass cutoff frequency for speech, JASA 146(6)](https://pubs.aip.org/asa/jasa/article/146/6/EL496/955642/The-maximum-audible-low-pass-cutoff-frequency-for)
- [Erich Grunewald — How I Make Dungeon Synth](https://www.erichgrunewald.com/posts/how-i-make-dungeon-synth/) *(already in the repo; re-read for the loop/layering line)*
- [KVR — Dub Techno HOWTO](https://www.kvraudio.com/forum/viewtopic.php?t=310422) *(the hand-automation claim)*
- [RBMA Daily — A Conversation with La Monte Young, Marian Zazeela and Jung Hee Choi](https://daily.redbullmusicacademy.com/2018/07/la-monte-young-zazeela-choi-conversation/)

**Already in this repo, used as corroboration and not re-verified:**

- `parameter-locks.md` — the Elektron manual definitions, and the standing finding that no source gives a depth or a density
- `plastikman-minimal.md` §3 — Hawtin's hard-cut effects mute, fetched from Sound On Sound
- `static-harmony-and-evolution.md` §4 — "no phase relationship between two patterns", recorded 2026-08-08
- `dungeon-synth-fx-and-balance.md` §4, §5 — the inaudible drone; the `fill` gestures
- Sound On Sound / Hugh Robjohns — [Q. What's the smallest audible change in level?](https://www.soundonsound.com/sound-advice/q-whats-smallest-audible-change-level)
