# The frame drum as a synthesis problem, and the percussion section as a score

*Researched 2026-08-13, the same day as `travelling-percussion.md` and directly
downstream of it. That sheet established what a bodhrán PLAYS — patterns, in bar
positions, from a tutor who prints stroke-by-stroke figures. It could not say how
to BUILD one, and it had nothing on how a percussion section is written as
opposed to a drum kit programmed. Its own §0 said so:*

> *"There is no orchestral percussion source here of the standing that
> Rimsky-Korsakov has elsewhere in this repo; the processional material is
> military-band and pipe-band pedagogy plus one peer-reviewed gait study, and the
> frame-drum material is instrument tutors."*

*This sheet is the two halves that were missing. Part A is acoustics and
synthesis; Part B is Berlioz, Forsyth and Rimsky-Korsakov on the percussion
section. They are kept apart on purpose — one is about a voice, the other about a
score, and this repo has previously paid for letting those two arguments run into
each other.*

*The occasion is unchanged: `kitNames.dungeon = "war drums and kettles"` is what
hobbit synth plays, the rig is labelled `shire: "the shire — flute, plucked
strings, frame drum"`, and **there is still no frame drum voice in the
program.***

---

## §0 How this sheet was made, and how much to trust it

**Twenty-two searches, thirty-one pages or files fetched, six PDFs downloaded and
text- or image-extracted.** Every quotation below comes from a page or a file
**fetched in this session**, per the rule `drum-sectional-arc.md` §7 imposed:
*"A quotation goes in only from a page that was fetched in the same session it is
written down."* Nothing here is quoted from a search-result summary. Where a
search summary was the only witness, the claim is in §19 instead.

**Two of the strongest sources are figures inside PDFs, recovered as images.**
The UIUC Physics 406 lecture notes carry a measured frequency scan and a
data-vs-theory plot for a **12-inch single-headed tom** — the closest thing in
the physics literature to a frame drum — and both are pictures, invisible to text
extraction. The page was rendered at 300 and 600–700 dpi and read as an image.
**Every number taken off those plots is a reading off a graph and is marked as
such, with an uncertainty**, because that is what it is. The modal *table* in
§3.2 by contrast is printed text in a peer-reviewed paper and is exact.

**What this sheet is strong on.** The ideal-membrane mode ratios (exact,
three independent sources agreeing to four figures); what construction does to
them; where-you-hit-it, which is measured twice by two unrelated groups; and the
whole of Part B, which rests on three public-domain treatises fetched as clean
full text.

**What this sheet is weak on, said up front.** *No source anywhere gives a
measured spectrum of a bodhrán.* There is exactly one published frequency
figure for the instrument in anything reachable — 90 Hz — and it comes from a
manufacturer's page citing a university study whose data are not published.
Everything else about the bodhrán's own spectrum here is **inference from
measurements of other membranes, and is labelled as inference every time.** §19
is long, and the longest entry in it is decay time.

**Cross-sheet convention.** Bar positions, when they appear, follow
`travelling-percussion.md` §0: 4/4 on sixteenth steps 0–15, 6/8 on eighth×2 steps
0–11.

---

# PART A — THE FRAME DRUM AS A SYNTHESIS PROBLEM

## §1 The ideal circular membrane, and why it is the wrong starting point

The program's `timpVoice` already carries a modes table and a comment that says
an ideal membrane is inharmonic and the kettle fixes it. That comment is right,
and here are the numbers behind it, exact rather than remembered.

The modes are indexed `(m, n)` — m nodal diameters, n nodal circles — and their
frequencies are the zeros of the Bessel functions:

> "The modal frequencies of a circular membrane are f(m,n) = ω(m,n)/2π =
> v·k(m,n)/2π, but we also have the relation k(m,n) = x(m,n)/a where x(m,n) is
> the value of the nth non-trivial zero of the mth-order Bessel function… when
> x(0,n) = k(0,n)·a = **2.405, 5.520, 8.654, 11.793, 14.931, …** respectively."
> — [corpus:uiuc-p406], Lect. 4 Part 2 p.22, fetched and image-read 2026-08-13

> "The speed of propagation of transverse waves on a (perfectly-compliant)
> circular membrane clamped at its outer edge is **v = √(T_ℓ/σ)** where T_ℓ (N/m)
> is the surface tension (per unit length) of the membrane and σ (kg/m²) is the
> areal mass density" — giving **f(m,n) = (x(m,n)/2πa)·√(T_ℓ/σ) (Hz)**
> — [corpus:uiuc-p406]

**That second formula is the one the inside hand plays on. Keep it; §8 uses it.**

The ratios, from the Bessel zeros. Three sources, agreeing:

| mode | Bessel zero | ratio to (0,1) | Wikipedia | Penn State | Sound On Sound |
|---|---|---|---|---|---|
| (0,1) | 2.40483 | **1.000** | 1.000 | 1.0 | 1.00 |
| (1,1) | 3.83171 | **1.5933** | 1.593 | 1.593× | 1.59 |
| (2,1) | 5.13562 | **2.1355** | 2.135 | 2.135× | 2.14 |
| (0,2) | 5.52008 | **2.2954** | 2.295 | — | 2.30 |
| (3,1) | 6.38016 | **2.6531** | — | — | 2.65 |
| (1,2) | 7.01559 | **2.9173** | 2.917 | 2.917× | — |
| (2,2) | 8.41724 | **3.5001** | 3.500 | — | — |
| (0,3) | 8.65373 | **3.5985** | 3.596 | 3.598× | — |

[corpus:wikipedia-membrane], [corpus:psu-russell], [corpus:sos-percussion], all
fetched 2026-08-13. The middle column is the zero divided by 2.40483, computed
here; it agrees with all three to the last digit they print.

And the consequence, stated by a physics paper rather than a tutorial:

> "The eigenvalues of an uniform membrane… are determined by the zeros of Bessel
> functions. **The overtones are not integer multiples of the fundamental.
> Consequently, the vibrations do not have a strong sense of pitch** and,
> therefore, lack the musicality of string vibrations."
> — [corpus:sathej-adhikari], *The eigenspectra of Indian musical drums*, arXiv
> 0809.1320, extracted 2026-08-13

**So the ideal membrane is the wrong starting point for a bodhrán in exactly one
respect: it is not wrong enough.** A timpano is a membrane that has been
*rescued* into near-harmonicity by its kettle. A frame drum has no kettle and is
not rescued. The ratios above are much closer to what a bodhrán actually is than
the `1 : 1.5 : 2 : 2.44 : 2.9` set `timpVoice` uses — and using the kettle's set
for a frame drum would build a small timpano, which is precisely the mistake the
genre is already making with `V.timpHi`.

## §2 Three constructions, and the frame drum is the middle one

This is the single most load-bearing classification in the sheet, and two
independent sources give it in the same three parts:

> "Drums can be divided into three categories: those consisting of **a single
> membrane coupled to an enclosed air cavity** (e.g., kettledrums); those
> consisting of **a single membrane open to the air on both sides** (e.g., tom
> toms, congas); and those consisting of **two membranes coupled by an enclosed
> air cavity** (e.g., bass drums, snare drums)."
> — [corpus:jasa-drumheads], Rossing, *Vibrational modes of drumheads in various
> types of drums*, abstract as returned by search — **and this one is NOT quoted
> as a source, see §19; it is here because the same three-way split is given
> verbatim by a page that WAS fetched:**

> "Timpani: **single membrane and an air cavity enclosed by a rigid body.**
> Toms/congas: **single membrane with air at atmospheric pressure on both sides.**
> Bass drums/snares: **enclosed air trapped between two membranes.**"
> — [corpus:sos-percussion], *Synthesizing Percussion*, fetched 2026-08-13

**A bodhrán is the second kind. So is a tar, a bendir, a daf and a riq.** One
head, open back, no cavity, no second membrane. Everything that follows turns on
that:

- **There is no cavity to pull the modes harmonic.** The kettle is what makes a
  timpano sing a note:

  > "The Western tympani achieves this by coupling the vibrations of the membrane
  > with the large mass of air enclosed in the kettle below the drum head. For a
  > judicious choice of modes, the combined membrane-air system has harmonic
  > vibrations."
  > — [corpus:sathej-adhikari]

  > "The kettle drum's internal air volume creates resonances that interact with
  > membrane modes, **dragging them toward higher frequencies.**"
  > — [corpus:sos-percussion]

- **There is no second head to damp the fundamental.** §3.2's measured snare has
  its (0,1) mode damped five times harder than every other mode, and the paper
  says why: *"This mode is relatively highly damped (5.07%) **due to the coupling
  between the two heads.**"* [corpus:skrodzka]. A frame drum has no second head,
  so that particular damping mechanism is simply absent — which is the strongest
  physical reason to expect a frame drum's fundamental to ring longer relative to
  its overtones than a snare's does. **This is inference, not measurement**, and
  it is in §19 as such.

- **Air loading still applies, and it applies both sides.** Air loading is
  the one modification a frame drum does get:

  > "Air loading reduces all natural frequencies compared to simple theory…
  > kinetic energy in the air near the membrane **will increase the effective
  > mass per unit area of the membrane, and thus reduce all the natural
  > frequencies.** The effect differs across modes, altering frequency ratios
  > **without creating harmonic relationships** independently."
  > — [corpus:euphonics], *3.6 Tuned drums*, fetched 2026-08-13

  Note the last clause. Air loading moves the ratios; it does not make them
  harmonic on its own. Sound On Sound puts the direction the other way round for
  a shell-mounted head — *"the frequencies of the modes shift upwards, and…
  they become somewhat less enharmonic"* [corpus:sos-bassdrum] — and **the two
  disagree in sign.** Recorded as a disagreement in §19 rather than reconciled.
  What both agree on is the magnitude class: it perturbs the ratios, it does not
  rewrite them.

## §3 The two real membranes anybody published, measured

No one has published a bodhrán spectrum (§19). These are the two nearest
measured objects that were obtainable, and they bracket the case.

### 3.1 A 12-inch SINGLE-HEADED tom — the right construction, read off a plot

UIUC Physics 406 scanned a *"Phattie 12" single-head tom drum"* with a
*"modal vibrations PC-based data acquisition system"* and plotted measured
against ideal-membrane theory [corpus:uiuc-p406]. **The following are readings
off a printed chart at 600 dpi, ±0.05 in ratio and ±5 Hz in frequency**, not
tabulated values — the paper prints no table.

| mode | ideal ratio (§1) | MEASURED ratio | MEASURED f (Hz) |
|---|---|---|---|
| J01 (0,1) | 1.000 | **≈0.97–1.00** | **≈62** |
| J11 (1,1) | 1.593 | **≈1.84** | ≈116 |
| J21 (2,1) | 2.135 | **≈2.08** | ≈131 |
| J02 (0,2) | 2.295 | **≈2.27** | ≈143 |
| J31 (3,1) | 2.653 | **≈3.00** | ≈188 |
| J12 (1,2) | 2.917 | **≈3.22** | ≈203 |
| J41 (4,1) | 3.156 | **≈3.44** | ≈216 |
| J03 (0,3) | 3.598 | **≈3.15** | ≈198 |

And the reason for the mismatch is printed in words, so it is not a reading:

> "n.b. The clear mylar drum head on the Phattie 12" tom drum does have **finite
> stiffness**, i.e. it is **not perfectly compliant**, as for an ideal circular
> membrane… which affects/alters the resonance frequencies of modes of vibration
> of drum head…"
> — [corpus:uiuc-p406]

**The shape of the error is the useful part: the nodal-diameter modes (J11, J31,
J41) sit HIGH of ideal by 8–15%, while the axisymmetric modes (J21, J02, J03) sit
at or below it.** A real head is stiffer than a membrane, and stiffness costs
more to the modes with more nodal lines. Sound On Sound says the same thing
independently: *"The membrane has 'finite stiffness at its edges,' sharpening
partials at higher frequencies"* [corpus:sos-percussion].

### 3.2 A 36 cm snare batter head — the wrong construction, but exact numbers

Peer-reviewed, printed as a table, with **modal damping**, which is the only
damping figure found anywhere in this research:

| mode | f (Hz) | f_i/f_1 | modal damping (% of critical) |
|---|---|---|---|
| (0,1) | **224** | 1 | **5.07** |
| (1,1) | **322** | 1.44 | **1.10** |
| (2,1) | **457** | 2.24 | **1.07** |
| (0,2) | **566** | 2.32 | **1.16** |
| (3,2) | **616** | 2.75 | **1.24** |
| (3,1) | **734** | 3.28 | **0.77** |

— [corpus:skrodzka], Skrodzka, Hojan & Proksza, *Vibroacoustic investigation of a
batter head of a snare drum*, Archives of Acoustics 31(3) 289–297 (2006),
downloaded and text-extracted 2026-08-13. The paper prints Rossing's earlier
figures for the same modes in adjacent columns — 224, 280, 403, 445, 801, 512 Hz
— and notes that they disagree: *"the modal frequencies and the f_i/f_1 values are
different."* **Two published measurements of the same instrument class differ by
up to 15% in ratio. That is the honest spread on any of this.**

The paper's own summary of the ratios:

> "As can be seen in Table 1, **the modal frequencies are not harmonically
> related**… Nonharmonic relation between the sound spectrum maxima as well as
> those between modal frequencies **explain the well known fact of the indefinite
> pitch** of the snare drum sound."
> — [corpus:skrodzka]

## §4 Where you hit it — measured twice, by two groups who never met

This is the section with the most directly buildable finding in Part A, and it is
the one the sibling sheet's `rim / centre / edge` articulations need.

**Measurement 1, UIUC.** The frequency scan plots the same 12-inch single-head
tom driven at `r = 0` (dead centre) and at `r = a/2` (half-radius) on one axis
[corpus:uiuc-p406]. Read off the plot:

- At **r = 0**: a tall narrow peak at ≈90 Hz, a **deep notch at ≈160–175 Hz**,
  another peak at ≈235 Hz, and then very little — the trace stays low across
  250–1000 Hz with only small bumps.
- At **r = a/2**: peaks at ≈90, **≈160 (the tallest thing on the plot)**, ≈230,
  ≈295, ≈315, ≈355, ≈370, ≈445, ≈515, ≈625, ≈665, ≈695 Hz — a forest, with real
  energy out to 700 Hz.

*(The ≈90 Hz first peak here and the ≈62 Hz J01 in §3.1 are from scans dated
4/26/2007 and 11/6/2008 respectively; the drum was evidently retuned between
them. The ratios are the transferable part, not the absolute Hz.)*

**Measurement 2, Poznań.** The same experiment, anechoic chamber, condenser mic,
struck by hand with a stick at a central point and at two points *"approximately
the points usually excited by the drum stick by a player"*:

> "It has been shown that **the lowest mode (0, 1) is the strongest mode of
> radiation only for central excitation. For non-central excitation, the
> frequencies of spectral peaks differ significantly from the modal
> frequencies.**"
> — [corpus:skrodzka], abstract

> "the mode (0, 1) is a strongly radiated mode only in the case of central
> excitation. For a non-central excitation, this mode excited a relatively high
> maximum in the sound spectrum but **other significant spectral peaks, not
> related to any modal frequency, appeared too.**"
> — [corpus:skrodzka]

**Measurement 3, in words, from a third source:**

> "When struck at the center a tympani, or other large drum, produces a
> **'thump' which decays quickly and with no definite pitch.**"
> "When a tympani, or other large drum, is struck **somewhere between the center
> and outer edge, the sound has a definite pitch which lingers for several
> seconds.**"
> "The modes which most significantly determine the tone quality of a tympani
> drum are the **(1,1), (2,1), (3,1), (4,1), and (5,1) modes.**"
> — [corpus:psu-russell], fetched 2026-08-13

And the practitioner's version of the same fact, with a position:

> "A skilled timpanist will ensure that the sound of his instrument is as musical
> as possible by striking the membrane **almost precisely a quarter the way from
> the edge to the centre.** In doing so, the timpanist **suppresses the circular
> modes**, ensuring that the quasi-harmonic radial modes dominate the sound."
> — [corpus:sos-percussion]

And for the frame drum specifically, qualitatively, in the same direction:

> "A central stroke can produce a **lower and fuller tone**, while fingers
> striking near the edge create a **sharper response**."
> — [corpus:rareinstrument-bodhran], fetched 2026-08-13

**THE RULE, and it is a spectral rule rather than a level rule:** striking
position does not change the drum's modes, it changes *which of them get any
energy*. Centre excites the axisymmetric (0,n) family and almost nothing else —
few partials, low, short. Off-centre excites the (m,1) family — many partials,
higher, longer. **A centre hit and an edge hit on a frame drum are not two
volumes of one sound; they are two different subsets of the same mode set.** That
is a two-line change in a voice and it is the single biggest difference between a
synthesised frame drum that reads as an instrument and one that reads as a
sample played at two velocities.

## §5 Decay — the only damping numbers found, and what they give when derived

**No source gives a bodhrán decay time.** §19. What exists is §3.2's modal
damping column, and it can be converted.

**DERIVED, and here is the derivation so it can be checked.** Modal damping ζ
expressed as a fraction of critical gives an amplitude envelope e^(−ζω₀t). The
time to fall 60 dB (a factor of 1000 in amplitude) is
**T60 = ln(1000) / (ζ · 2πf) = 6.9078 / (ζ · 2πf)**. Applying that to
[corpus:skrodzka]'s table:

| mode | f (Hz) | ζ (%) | **T60, derived** |
|---|---|---|---|
| (0,1) | 224 | 5.07 | **97 ms** |
| (1,1) | 322 | 1.10 | **310 ms** |
| (2,1) | 457 | 1.07 | **225 ms** |
| (0,2) | 566 | 1.16 | **167 ms** |
| (3,2) | 616 | 1.24 | **144 ms** |
| (3,1) | 734 | 0.77 | **195 ms** |

**Two facts fall out, and the second is the surprising one.**

1. **A drum head's modes live in the 100–300 ms range**, not the seconds a
   kettle gets. The program's `V.wardrum` runs `decay = 0.95` s and `V.tom*` run
   0.42–0.68 s; both are longer than any mode measured here.
2. **The fundamental is the SHORTEST-lived mode, not the longest.** 97 ms against
   310 for the (1,1). Every drum voice in this program does the opposite —
   `timpVoice`'s modes table decays the upper modes fastest (`dk` runs 1 → 0.62 →
   0.42 → 0.3 → 0.22), and `V.tom` gives its octave shell half the fundamental's
   length. For a kettle that is right and sourced. **For a struck head it is
   backwards**, and Penn State says why in the same words as the physics:

   > The (0,1) mode "**quickly transfers its vibrational energy into radiated
   > sound energy and the vibration dies away**," while higher modes decay more
   > slowly due to less effective sound radiation.
   > — [corpus:psu-russell]

   The (0,1) mode is the whole head moving in phase — a monopole, an efficient
   radiator, therefore a fast loser of energy. The (1,1) mode is a dipole,
   radiates badly, and therefore rings.

**THE HONEST LIMIT, stated plainly: the 5.07% figure is a two-headed drum's, and
the paper attributes it specifically to inter-head coupling.** A frame drum has
no second head. So the *direction* of the finding — fundamental radiates fast,
nodal-diameter modes ring — is physics that applies to any membrane, but the
*number* 97 ms is a snare's and must not be transplanted. Anything the program
picks for a frame drum's fundamental decay is `[CHOSEN]`.

One further sourced statement, useful because it argues the opposite way and
therefore bounds the question:

> "Academic sources cited suggest that **the rate is constant across all the
> important partials**," allowing a single VCA and envelope generator to simulate
> overall decay behaviour.
> — [corpus:sos-bassdrum]

That is Sound On Sound's engineering simplification for a bass drum, and it is
flatly contradicted by [corpus:skrodzka]'s measured 0.77%–5.07% spread. **Both
are in this sheet. The measurement wins; the simplification is recorded because
it is what most synth drum voices, including this program's, actually do.**

## §6 What pitch is a bodhrán

**The only published figure for the instrument itself, and it is one number:**

> "a synthetic skin and a basic tone of **90 Hz**" — in studies conducted at the
> University of Munich
> — [corpus:bodhran-info], *The IsolatHED Technology*, fetched 2026-08-13

That page and its sibling also give the qualitative spectral picture, which is
all they give:

> "**The peaks are representing the partial tones, meaning the basic tone and the
> overtones. A defined tone has sharp and marked off peaks, whereas a noise has
> less to no peaks.**"
> — [corpus:bodhran-info], *The Compressor Tuning System*

Three other anchors, none of them a bodhrán, all fetched:

- **A 12" single-head tom, measured: J01 ≈ 62 Hz** [corpus:uiuc-p406] (§3.1).
- **A drum-tuning reference table** [corpus:drum-tuning], fetched 2026-08-13,
  giving fundamentals by size — 14″ low **80 Hz** / medium 95; 16″ low **65** /
  medium 80; 18″ low **55** / medium 70. **These are two-headed floor toms with a
  batter and a resonant head, so they are an analogue and not a transfer.**
- **Sizes.** Two sources, and they disagree: *"Bodhrans range from 3" to 6" deep,
  and **16" to 24" wide**"* [corpus:moderndrummer-bodhran], against a sample
  library that recorded six real instruments *"from **15½" × 6"** … to **12" ×
  4"**"* [corpus:impactsoundworks]. The tutor's range and the studio's range
  barely overlap. Recorded, not reconciled.

**DERIVED BAND, and marked as derived:** the sourced bodhrán figure (90 Hz) sits
between the 16″ and 14″ medium tunings of [corpus:drum-tuning] and above the 12″
single-head measurement of [corpus:uiuc-p406]. **A 14″–18″ frame drum's
fundamental is therefore in the region 60–100 Hz**, and 90 Hz is the only value
in that band that anyone has actually measured on the instrument in question.
Anything narrower than that band is `[CHOSEN]`.

**And a warning the program has already paid for once.** `V.wardrum`'s comment
records a drum built entirely below 320 Hz that measured −13.6 dB RMS and −39.9
dB A-weighted and *"contributed nothing audible."* A frame drum fundamental at
60–90 Hz is in exactly that trap. Per §4, the way out is not a level: it is that
**a real frame drum is normally struck off-centre**, which puts its energy in the
(m,1) modes at 1.6×–3.4× the fundamental — 100–300 Hz for a 90 Hz drum, plus the
tipper's contact noise. The instrument's own physics supplies the band that the
war drum had to have a knock bolted onto it to reach.

## §7 The tipper — one wrist, two ends, and where the triplet comes from

`travelling-percussion.md` §1.1 established the down-and-up motion. What it did
not have is the **division of labour between the two ends, with a number**:

> "The **lower head carries as much as ninety percent** of the playing load,
> striking **all significant beats and rhythms**. The upper head serves only
> **for filler notes between the strokes of the lower head** and **plays the
> middle notes of triplets.**"
> — [corpus:moderndrummer-bodhran], fetched 2026-08-13

**That is the mechanism of the ornament, and it is arithmetic.** One wrist
rotation gives a down and an up from the lower head. Rotating further on the way
down brings the upper head onto the skin between them. **A triplet is therefore
lower-head down · UPPER head · lower-head up** — three strokes, one motion, and
the middle one is played by a different end of the stick. It is not three of the
same stroke.

And the two ends are not the same weight of sound. The library that sampled them
lists five distinct beaters and the tutors describe the consequences:

> "**Wood tipper, Hotrod tipper, Loose Brush, Tight Brush, Fingers**"
> — [corpus:impactsoundworks]

> "**Heavy Power Tippers**: 'create a deeper, louder attack.' **Slim Speed
> Tippers**: 'allow rapid triplets and subtle ghost notes but **may lack low-end
> power**.'" … "**Heavier woods produce more pronounced attack and volume.
> Lighter woods emphasize speed and finesse.**"
> — [corpus:bodhran-ca-tippers], fetched 2026-08-13

> A clean tipper stroke "**allows the beater to rebound from the membrane instead
> of remaining in contact and choking the sound.**"
> — [corpus:rareinstrument-bodhran]

**For the program that reads: one voice, three stroke weights — main (lower head,
full), ornament (upper head, lighter and shorter, occurring only between main
strokes), and ghost — plus a rule that a stroke that does not rebound is a
different sound, not a quieter one.** The last is the same distinction
`drum-engine.md` §2 had to relearn for the 808 kick: a soft stroke is not the
loud one turned down.

## §8 The inside hand, and the tension arithmetic

`travelling-percussion.md` §1.2 has four sources agreeing that the inside hand
controls pitch AND damping, and one number: *"you can change the pitch by an
octave or more."* This session adds the **direction**, which nothing in that
sheet had, and the **arithmetic**, which nobody states:

> "A **full, flat hand** on the head produces a **short, staccato** sound."
> "**Pressing the heel of the hand** into the head allows the head to **ring, but
> in a controlled fashion**."
> "A sound midway between these two is achieved by **pressing the back of the
> knuckles**."
> "To vary the pitch, the hand slides between positions near the center of the
> head, to the rim, and even completely off the head. **The nearer the hand is to
> the rim, the lower the pitch.**"
> — [corpus:moderndrummer-bodhran]

> "By pressing, releasing, cupping, or sliding the hand, a player can move between
> **a low open bass note and tighter, higher-pitched sounds**."
> — [corpus:rareinstrument-bodhran]

**Note the two axes are separable and the sources separate them.** *Contact area*
sets damping (flat palm = staccato; heel/knuckle edge = rings). *Radial position*
sets pitch (toward centre = higher; toward rim = lower). A voice that ties them
into one knob loses the instrument's whole vocabulary — a damped high note and a
ringing low note are both playable and so are both crosses.

**DERIVED, from §1's sourced formula, and this is the only quantitative statement
about hand pressure anywhere in this research.** f ∝ √(T_ℓ/σ). Therefore:

- **An octave of pitch costs a factor of 4 in membrane tension.** A fifth costs
  ×2.25; a whole tone ×1.26.
- The sourced ceiling — *"an octave or more"* [corpus:ceolas-styles, via
  `travelling-percussion.md` §1.2] — is therefore a claim that a hand behind the
  skin can **quadruple the working tension** of the head. That is a large claim
  and it is why that figure should be read as the instrument's extreme span under
  maximum pressure and not as a per-stroke move.
- **A per-stroke bend of a whole tone needs only a 26% tension change**, which is
  a plausible ordinary gesture. `[CHOSEN]` if the program uses it — no source
  gives a per-stroke amount, which was already `travelling-percussion.md` §8's
  finding and is still true.

## §9 Strike intensity — already sourced in this program, and it applies here

`V.wardrum`'s comment block already carries the sourced physics with citations to
Fletcher & Rossing 18.9, Cahoon 1970, Rose 1978, Bork & Meyer 1983 and Kirby &
Sandler DAFx-20: tension rises with the square of displacement, frequency with
the square root of tension, **≈10% upward shift at a full blow, settling over
≈0.2 s, negligible at low strike velocity.** An independent source fetched this
session gives the same figure from the synthesis side:

> "the loudness and the pitch of the sound are both determined by the maximum
> instantaneous displacement of the membrane"… "whereas the VCA Gain will change
> by 100 percent from the start to the end of the sound, **the pitch should only
> shift by around 10 percent**"… "the pitch of a typical kick drum can shift by
> **a couple of semitones** from start to finish."
> — [corpus:sos-bassdrum]

**Nothing new is needed. The frame drum voice should reuse `V.wardrum`'s glide
law unchanged** — it is the same physics on a smaller head, and it is already
measured, sourced and in the file. What differs is that the inside hand can hold
the head at a raised tension *between* strokes, which the war drum cannot; that
is §8's control, not this one's.

## §10 How other instruments model a frame drum, where anyone documents it

Two documented models were obtainable, and they are the same model at two
budgets.

**A physical-modelling synth.** Chromaphone 3's resonator set includes a
membrane, and the manual names four controls that map one-to-one onto §§1–5:

> "The reference pitch of a resonator, or in other words **the frequency of its
> first partial**, is adjusted using the **Pitch** parameter."
> "The **decay time of the partials** of the object is determined by the **Decay**
> control."
> "The **Material** control allows one to **fix the decay time of partials as a
> function of frequency** with respect to that of the fundamental."
> "The **Tone** control is used to adjust **the amplitude of the partials as a
> function of frequency** with respect to that of the fundamental."
> "The **Hit Position** controls where the excitation signal is applied on a
> resonator… **it affects the relative amplitude of the different partials** of
> the resonator and therefore the spectrum of the sound."
> — [corpus:chromaphone], fetched 2026-08-13

**Four knobs: fundamental, overall decay, decay-vs-frequency, amplitude-vs-
frequency, and strike position — and strike position is defined exactly as §4
measures it, as a change in the relative amplitude of partials.** That is the
whole architecture this sheet argues for, shipped commercially, with the
parameter list as external corroboration that the axes are the right axes.

**A sample library**, which is the same model expressed as recordings:

> **Sampled zones:** "**Center, Mid, Edge, Rim, Shell**" (5 locations per drum)
> **Drums:** six, "15½" × 6" deep, light shell, medium goat skin" down to
> "12" × 4", medium birch shell, heavy goat skin"
> **Sticks:** "Wood tipper, Hotrod tipper, Loose Brush, Tight Brush, Fingers"
> **Variation:** "Up to **5 dynamic layers and 7 round robins per articulation**"
> **Ensemble:** "Create an ensemble of **up to three performers** playing
> simultaneously" with **auto-humanization**
> **Control:** "**Change pitch and dampen realistically on the fly**"
> — [corpus:impactsoundworks], *Traveler Series: Bodhráns & Bones*, fetched
> 2026-08-13; over 20,000 samples

**Five zones, not two.** The program's articulation vocabulary from
`travelling-percussion.md` §7 has main / ornament / rim / damped / open. This
library's zone axis is orthogonal to that: **Centre · Mid · Edge · Rim · Shell**
is *where*, and open/half-damped/fully-damped is *the hand*. A review of the same
library describes the mapping: *"open hits on one octave, damped hits on another,
and a bonus zone… with **fully open, half-damped and fully damped** center hits
only"*, and calls the pitch/damping engine a *"'Frankensampling' approach"*
providing *"realistic pitch and dampening control with **individual transients and
sustains**"* [corpus:rekkerd], fetched 2026-08-13.

**"Individual transients and sustains" is the buildable sentence in this whole
section.** The tipper's contact noise does not change when the hand presses; the
head's ring does. Splitting the voice into a fixed transient and a hand-governed
sustain is how a commercial product solves the same problem, and it is how a
Web Audio voice should be laid out: the noise burst is not scaled by the damping
control, the oscillator envelopes are.

## §11 What Part A gives the voice, in one table

Every row is sourced above; nothing new is introduced. `[CHOSEN]` marks what the
program must decide because nobody states it.

| quantity | value | status |
|---|---|---|
| mode ratios | 1 · **1.593** · **2.135** · **2.295** · **2.653** · 2.917 · 3.500 · 3.598 | sourced ×3, exact (§1) |
| stiffness correction | nodal-diameter modes read **+8…15%** high of ideal on a real single-head tom; axisymmetric modes at or below | read off a plot, ±0.05 (§3.1) |
| fundamental, 14–18″ | **60–100 Hz**; only measured bodhrán figure **90 Hz** | one source for 90; band derived (§6) |
| centre strike | excites **(0,n) only** — few partials, low, short, "no definite pitch" | measured ×2 (§4) |
| off-centre strike | excites **(m,1)** — many partials, out to ~700 Hz, "lingers" | measured ×2 (§4) |
| best off-centre point | **¼ of the way from edge to centre** | sourced (§4) |
| mode decay ordering | **fundamental shortest**, nodal-diameter modes longest | measured + explained (§5) |
| mode T60s | 97 / 310 / 225 / 167 / 144 / 195 ms | **derived** from measured ζ, snare (§5) |
| frame-drum T60s | — | **`[CHOSEN]`; §19** |
| pitch vs tension | f ∝ √T ⇒ **octave = ×4 tension**, whole tone = ×1.26 | derived from sourced formula (§8) |
| hand: contact area | flat palm = staccato; heel/knuckle = controlled ring | sourced (§8) |
| hand: radial position | **nearer the rim = lower pitch** | sourced (§8) |
| tipper split | **lower head ≈90% of strokes**; upper head = fillers and **middle of triplets** | sourced (§7) |
| strike-velocity glide | **+10% at a full blow**, settling ≈0.2 s, ~0 when soft | already in `V.wardrum`, re-corroborated (§9) |
| voice architecture | fixed transient + hand-governed sustain; strike position = partial amplitudes | sourced from two shipping products (§10) |

---

# PART B — HOW A PERCUSSION SECTION IS WRITTEN

## §12 The section is people, and the program's model is furniture

The program's model is a kit: one lane per sound, a pattern per lane, all lanes
able to fire at once forever. An orchestra has neither lanes nor a kit. It has a
number of humans, each holding a maximum of two sticks.

**How many.** One reachable reference gives the standing figure:

> "**1 kettledrum player, 3–4 percussionists** (of whom at least one must also
> play kettledrum)" — for a modern full-scale symphony orchestra
> — [corpus:idiomatic-orchestra], fetched 2026-08-13

**And the parts are written per PLAYER, not per instrument:**

> "Write **individual parts for each player** rather than separate staves per
> instrument." … "A percussion legend showing all non-pitched instrument
> locations is **mandatory** in both score and parts."
> — [corpus:actor-percussion], fetched 2026-08-13

> "percussionists **prefer to play music that incorporates few instruments**" due
> to logistical demands, recommending orchestrators **reconsider if only one or
> two notes are needed from an instrument**.
> — [corpus:actor-percussion]

Film practice is looser but organised the same way round:

> "In film scoring, the percussion section typically plays from a **'percussion
> score.'** This provides a lot of flexibility since **exact parts for each
> player don't need to be worked out in advance and the players can share things
> around.**" … "On a recording session in LA, once a cue is called, **the
> percussionists will huddle at the back to work out their plan.** They then move
> to their stations."
> — [corpus:debreved], Tim Davies, *Percussion: A Hit Job, Part I*, fetched
> 2026-08-13

**The load-bearing inversion for this program: a lane is an instrument, but a
part is a person.** A percussion "part" is a sequence of instruments one human
walks between, with rests long enough to make the walk. The program has no
concept that could be violated by asking two lanes to be played at once, because
it has no players — and §17 is the list of things that model lets it write which
nobody could perform.

## §13 The scarcity budget — the rest of Rimsky-Korsakov's argument

`score-craft.md` §11 already holds the famous sentence. Here is the paragraph it
comes out of, fetched whole, and the three clauses the repo did not have.

> "**Neither musical feeling nor the ear itself can stand, for long, the full
> resources of the orchestra combined together.** The favourite group of
> instruments is the strings, then follow in order the wood-wind, brass,
> kettle-drums, harps, pizzicato effects, and lastly the percussion, also, in
> point of order, triangle, cymbals, big drum, side drum, tambourine, gong…"
> "**A group of instruments which has been silent for some time gains fresh
> interest upon its reappearance.** The trombones, trumpets and tuba are
> occasionally tacet for long periods, **the percussion is seldom employed, and
> practically never all together, but in single instruments or in two's and
> three's.**"
> — [corpus:rimsky], *Principles of Orchestration*, Ch. IV, "Economy in
> orchestral colour", Gutenberg #33900, fetched 2026-08-13

**Clause 1 — the exemption, and it is this genre's exemption:**

> "**In national dances or music in ballad style, percussion instruments may be
> used more freely.**"
> — [corpus:rimsky]

**Clause 2 — the folk instruments are named, and one of them is a frame drum:**

> "A quantity of **national instruments** not included in the present work may be
> incorporated into the orchestra; such are the guitar, the domra, zither,
> mandoline, **the oriental tambourine, small tambourine** etc. These instruments
> are employed from time to time for **descriptive-aesthetic purposes.**"
> — [corpus:rimsky]

**Clause 3 — the re-entry rule, which is a dynamics rule and is exact:**

> "After a long rest the re-entry of the horns, trombones and tuba should coincide
> with **some characteristic intensity of tone, either pp or ff**; piano and forte
> re-entries are less successful, while re-introducing these instruments
> **mezzo-forte or mezzo-piano produces a colourless and common-place effect.
> This remark is capable of wider application.**"
> — [corpus:rimsky]

The last five words are the licence to apply it to the drum. **A percussion
re-entry after silence must be at an extreme of the dynamic range. The middle is
the one setting that wastes it.**

And Rimsky's register classification, which places the frame drum:

> "triangle, castanets, little bells, tambourine, switch or rod (Rute), side or
> military drum, cymbals, bass drum, and Chinese gong… **The first three may be
> considered as high, the four following as medium, and the last two as deep**
> instruments. **This may serve as a guide to their use with percussion
> instruments of determinate sounds, playing in corresponding registers.**"
> — [corpus:rimsky]

**The tambourine — a frame drum — is a MEDIUM-register percussion instrument,
and its partner is a definite-pitch percussion instrument in the same register.**
Which for this program means: a frame drum belongs with the mid kettle, not the
low one, and not with the war drum.

**And the sentence that describes hobbit synth's rig exactly, from 1913:**

> "**The combination of plucked strings with percussion alone, is excellent; the
> two blend perfectly, and the consequent increase in resonance yields an
> admirable effect.**"
> "Uniting plucked strings and percussion with bowed instruments **does not
> produce such a satisfactory blend, both qualities being heard independently.**"
> "wind instruments, wood and brass, **strengthen and clarify** pizzicato strings,
> harp, kettle-drums and percussion generally, **the latter lending a touch of
> relief to the tone of the wood-wind.**"
> — [corpus:rimsky]

The rig is `shire: "the shire — flute, plucked strings, frame drum"`. **Plucked
strings + percussion is Rimsky-Korsakov's named excellent blend; add the flute
and the wind clarifies the drum while the drum gives the wind relief; the one
combination he warns is unsatisfactory — bowed strings with plucked-and-percussion
— is the one the rig does not contain.** That is the strongest orchestration
argument for this genre's rig found in any sheet in this repo, and it was written
by someone who had never heard of it.

## §14 Where percussion enters, and where it leaves

Three treatises, three statements, all pointing the same way.

**The entry is the effect:**

> "Like almost all the other Percussion Instruments **its principal effect is its
> entry.**" … "the composer must remember that **when once he has 'shot his bolt'
> with it there is nothing left to be done.**"
> — [corpus:forsyth], *Orchestration* (1914), on the side drum, fetched
> 2026-08-13

**The entry comes onto an already-running rhythm, late in a build:**

> "It should… be introduced **in a full piece, in the midst of a large orchestra,
> merely to redouble little by little the force of a lofty rhythm already
> established, and gradually reinforced by the successive entrance of groups of
> the most sonorous instruments.** Its introduction then does wonders; the swing
> of the orchestra is reduced to measured potency; **the noise thus disciplined is
> transformed into music.**"
> — [corpus:berlioz], on the bass drum, *A Treatise upon Modern Instrumentation
> and Orchestration*, archive.org OCR, fetched 2026-08-13

**And percussion is coupled to rhythm wherever rhythm exists:**

> "**Whenever some portion of the orchestra executes a rhythmic figure, percussion
> instruments should always be employed concurrently.**"
> "An **insignificant and playful rhythm** is suitable to the **triangle,
> tambourine, castanets and side drum**; a vigorous and straightforward rhythm may
> be given to the bass drum, cymbals and gong."
> "**The strokes on these instruments should almost invariably correspond to the
> strong beats of the bar, highly-accented syncopated notes or disconnected
> sforzandi.**"
> "**The triangle, side drum and tambourine are capable of various rhythmic
> figures.**"
> "**Sometimes the percussion is used separately, independently of any other group
> of instruments.**"
> — [corpus:rimsky], "Use of percussion instruments for rhythm and colour"

Four things in that block are directly codeable and all four bear on a frame
drum. The tambourine is in the **playful-rhythm** class; it is one of the three
instruments **allowed to carry a figure** rather than only accents; its strokes
land on **strong beats, accented syncopations or sforzandi**; and a
**percussion-only stretch is a named legitimate texture** — which independently
corroborates `travelling-percussion.md` §4.4's drum-cadence finding from a
completely different literature.

Rimsky also names the pairings, and the frame drum's is with the top of the
orchestra:

> "**The triangle, side drum, and tambourine go best with harmony in the upper
> register**; cymbals, bass drum and gong with harmony in the lower."
> "tremolo on the **triangle and tambourine with trills in wood-wind and
> violins**"
> — [corpus:rimsky]

**A frame drum's partner is the flute, not the bass.** Which is the rig again.

## §15 The roll as an orchestral object

**Which instruments roll, and how each one does it.** Forsyth writes the general
rule at the side drum and says explicitly that it generalises — *"The above
remarks apply generally to all the instruments of the Drum family and will not be
repeated."* [corpus:forsyth].

**Notation, and the one accurate way:**

> "The **accurate way to indicate a 'roll' on any percussion instrument** is to
> write out the length of notes required, **slur them to each other** for as long
> as the roll continues, and add an **unbroken 'trill line'** to the whole."
> "If you do not wish a detached stroke at the end, **slur right on to the last
> note.** If you do wish it, omit the last slur and see that the [trill line]
> comes short of the last note."
> — [corpus:forsyth]

**Execution — and it is NOT what the timpani do:**

> "Side-Drum playing… differs from all other Percussion Instruments in that its
> technique is founded **not on a single stroke, but on double alternate strokes
> with each hand.** Thus, in the '**Long-roll**' or '**Daddy-Mammy**,' the player
> strikes the batter-head **not Left-Right—Left-Right, but LL-RR-LL-RR.** In each
> pair of strokes the latter becomes… **a sort of controlled rebound stroke.**"
> — [corpus:forsyth]

The program's `timpVoice` already implements the *other* kind, correctly and with
its own sources: single-stroke, because a kettle sustains. **Two different roll
engines exist and the sources name both.** A frame drum with a tipper is
structurally closer to the double-stroke case — the tipper's return stroke IS a
controlled rebound — which is a mechanism argument, not a source, and is flagged
in §19.

**The ending, which is a hard rule for one instrument and explicitly not for
another:**

> "in Side-Drum parts it is **practically always necessary to write a detached
> note on which to finish the roll. The sudden cessation of the roll, except in
> the faintest pianissimo, sounds untidy** and does not suit the genius of the
> instrument."
> — [corpus:forsyth]

> On the bass drum: "There is, however, **no necessity to end the roll with a
> detached stroke.**"
> — [corpus:forsyth]

**The crescendo roll into an arrival, with bar counts:**

> "in a long crescendo, there is a **limit to the powers of gradation** of even a
> Drummer. It is useless to begin with ppppp, go on to pppp, and scatter the rest
> of the expression-marks up to fff at mathematical distances… In practice,
> **about eight bars of moderato time at the end of the roll is the limit within
> which the effect of a crescendo or diminuendo can be made appreciable to the
> audience.**"
> "As a simple example, see the **25-bar roll on B♭** in the Allegro Vivace of
> Beethoven's 4th Symphony. **The first 14 bars are marked 'sempre pp,' then comes
> an 8-bar crescendo to 3 ff bars.**"
> — [corpus:forsyth]

> "the long-roll continued either for a few beats or for many bars is **equally
> effective p or f**, but… **its crescendo cannot be spread out over so many bars
> as that of the Kettle-Drums.**"
> — [corpus:forsyth]

> Kettle-drums "are capable of **every dynamic shade of tone, from thundering
> fortissimo to a barely perceptible pianissimo. In tremolando they can execute
> the most gradual crescendo, diminuendo, the sfp and morendo.**"
> — [corpus:rimsky]

**14 bars flat + 8 bars of crescendo + 3 bars of arrival is a published,
attributed shape for the roll into a section boundary, and eight bars is the
stated ceiling on how long a crescendo can usefully be.** `score-craft.md`
§1885 already records Forsyth's ~4-bar limit at pp for a different instrument;
these are the percussion figures.

**And a percussion tutti divides the work in half:**

> Of the peroration of Tchaikovsky's *Francesca da Rimini*: the percussion are
> kettle-drums, cymbals, bass drum and gong, and "of these **the first and third
> play a continuous tremolo, while the second and fourth are in rhythmical
> pattern with the rest of the orchestra.**"
> — [corpus:forsyth]

**Half the section rolls, half plays the rhythm.** Not all four doing the same
thing, which is what a kit does.

## §16 The folk drum inside an orchestra

Berlioz on the tambourine is the closest any treatise comes to writing about a
bodhrán, and every sentence earns its place.

> "This favorite instrument of the Italian peasantry… is of excellent effect,
> **employed in masses**, to strike, like cymbals, and with them, a rhythm in a
> scene of dance or orgy. **It is seldom introduced alone in the orchestra;
> unless in a case where the subject of the piece renders it illustrative of the
> manners of the people who habitually use the instrument** — such as wandering
> Bohemians, or gypsies; the Basque nation; the Roman peasants…"
> — [corpus:berlioz]

> "It produces **three kinds of very different noises**; when it is **simply
> struck with the hand, its sound has not much effect (unless employed in
> numbers); and the tambourine thus struck is not distinguishable unless left
> nearly alone by the other instruments**"
> — [corpus:berlioz]

**That last clause is the balance rule for putting a frame drum in an orchestra,
and it names both remedies: multiply the players, or thin the texture around
it.** It is also, read the other way, the reason the Lord of the Rings scores
credit **two** bodhrán players rather than one — a fact already sourced in
`travelling-percussion.md` §5.1 from Doug Adams' performer list ("Robert White:
Drones/Bodhrán, … Alan Kelly: Bodhrán").

Berlioz generalises it into a theory of unisons, on the drums proper:

> "Their effect is the better and the nobler, **in proportion as they are more
> numerous**; **a single drum — particularly when it figures in the midst of an
> ordinary orchestra — has always appeared to me mean and vulgar.**"
> "**Simple rhythms, without either melody, harmony, key, or anything that really
> constitutes music, solely serving to mark the march-step of soldiers, become
> attractive, when performed by a body of forty or fifty drums alone.**"
> "the singular as well as actual charm for the ear, which arises from **a
> multiplicity of unisons**"
> — [corpus:berlioz]

**A folk drum is made bigger by DUPLICATION, not by amplification.** The program
already does something adjacent in `V.wardrum` — a second head 18 ms late,
justified in that voice's own comment as *"two drums struck by two people are
never simultaneous"* — and Berlioz is the authority that idea was missing.

**And the one worked example of a folk drum written into a concert score, with
bar counts:**

> The Tabor: "In Provence the player generally **beats strokes of one time-value
> with his left hand while with his right he performs on a sort of primitive
> Flageolet called Galoubet**"… "**Bizet has introduced the Tabor into his second
> Suite L'Arlésienne.** In the Pastoral (Andantino) **it plays the simple rhythm
> for 62 bars on end**, while in the Farandole **it repeats the rhythm for 83 bars
> with a crescendo from pppp to fff** — a common French trick."
> — [corpus:forsyth]

**One rhythm, unvaried, for 62 and then 83 bars, the second time under a single
enormous crescendo.** That is what a folk drum does inside an orchestral movement
when a real composer writes one, and it is the exact opposite of a kit lane that
fills every eight bars. It also matches, from the concert-hall side, the folk
side's own answer in `travelling-percussion.md` §6 — the figure is fixed and the
*time through* is what changes.

*(The pipe-and-tabor is also the sourced ancestor of every one-player-plus-drum
folk texture; it is the Provençal case of the same one-human constraint §17
describes.)*

## §17 What a human cannot play

The brief asked what makes a percussion part sound like a player. The treatises
answer it as a list of impossibilities, which is more useful than a list of
tendencies because impossibilities can be asserted in code.

**1. One player cannot roll on two drums.**

> "**As both sticks are necessary to the making of a proper roll, simultaneous
> rolls on two notes can only be satisfactory when performed by two Drummers.**"
> — [corpus:forsyth]

The program has `timpHi`, `timpMid`, `timpLo` as three independent lanes, any
number of which may carry `art: "roll"` in the same bar. **Two simultaneous
timpani rolls require two timpanists; three require three, and an orchestra has
one.** [corpus:idiomatic-orchestra] gives 1 kettledrum player.

**2. A rubbed roll cannot be long, because the thumb runs out of drum.**

> "if it be played by **rubbing its parchment with the ends of the fingers**,
> there results a roll… **but this roll should be very short, because the finger
> which rubs the parchment of the instrument, soon attains, as it advances, the
> edge, which puts an end to its action. A roll like this, for instance, would be
> impossible.**"
> — [corpus:berlioz]

**A frame-drum thumb roll has a maximum duration set by the radius of the head.**
Berlioz prints the impossible example. No other percussion limit in any of these
books is stated so physically.

**3. An even number of strokes reverses the hand; an odd number does not.**

> "When a succession of rapid notes are grouped together on a beat… **it is
> better to use an odd number of strokes. This enables the player to perform the
> first and last notes of the series in the same direction, right to left. With
> an even number of strokes he has to reverse the direction for his accent.**"
> — [corpus:forsyth], on the triangle

**This is the same arithmetic as the bodhrán slip jig.**
`travelling-percussion.md` §2.3 found that Ballard's 9/8 figure inverts its
stroke polarity every bar and observed that *"the tipper cannot get back to a
down stroke on the next bar-one without either an odd number of strokes or a
rest, and that arithmetic is why the figure is two bars long."* Forsyth states
the general law, on a different instrument, in a different century. **Two
independent witnesses to one constraint: stroke count parity determines stroke
direction, and a figure whose parity does not close must either last two bars or
drop a stroke.**

**4. The sticking is chosen, and it is not the rhythm.**

> "**The Paradiddle is not really a rhythm**, as is often supposed, **but a method
> of arranging the strokes of a rhythm so as to secure an alternate left-handed
> and right-handed attack on successive principal beats.** Thus, if the following
> simple rhythm [8 quavers] occurred **in one single bar only**… the player would
> probably perform it **L-R-L-R-L-R-L-R**. But **if the eight-quaver rhythm were
> persistent through many bars** he would probably play it as a paradiddle, so
> that the attack of any two successive bars would read **L-R-L-L, R-L-R-R |
> L-R-L-L, R-L-R-R**… In this way he would keep his attention on the alternation
> of Left and Right, and so **secure a stronger rhythmic impulse.**"
> — [corpus:forsyth]

**The same written rhythm gets two different physical realisations depending on
whether it happens once or repeats — and therefore two different accent
patterns.** Nothing in the program can express that. It is the single clearest
statement in the whole corpus of why an identical note-list played identically is
not what a player does, and it is not about randomness: the change is
*systematic* and it is caused by the bar count.

**5. Ornaments are accents, not extra notes.**

> "**the drag and the flam are only technical ways of accenting effectively a
> single beat.**"
> — [corpus:forsyth]

This settles a question `travelling-percussion.md` §4.6 left half-open about the
pipe-band drag. A drag is not two grace notes plus a note; **it is one accented
note whose accent is made of strokes.** The program renders `art: "drag"` as
early grace singles, which reads it as the former.

**6. The instrument's tone is a consumable.**

> "**The tone of the instrument, however, soon becomes tiresome.**" — of the
> tambourine — "As a rule **the simpler the rhythms and… the fewer the bars
> played the more effective will the part be.**" — of the triangle
> "it is as well always to **bring its notes into direct relationship with the
> rhythmical pattern of the music. When this is not done the instrument often has
> the misfortune of sounding like a copyist's mistake.**"
> — [corpus:forsyth]

**7. And the one that inverts the expected advice:**

> "In writing Side-Drum parts, remember (1) That **you will always have a tendency
> to write too few, not too many notes.** (2) That **the genius of the instrument
> is totally opposed to single detached notes. In fact, they should never be
> written.**"
> — [corpus:forsyth]

A single isolated stroke is idiomatic on a kettle — Forsyth lists *"a single
interpolated note or phrase solo"* and *"the Drum's piano solo notes, the curious
feeling which they produce of apprehension or 'something to come'"* among the
kettle-drum's ten named effects [corpus:forsyth] — and un-idiomatic on a side
drum. **Which instrument may play one note alone is an instrument-by-instrument
fact, not a general one.** For the frame drum the folk sources already answered
it the same way Forsyth does for the side drum: the bodhrán's job is continuous
(`travelling-percussion.md` §1.1, one arm motion = two strokes).

## §18 What Part B gives the arranger, in one table

| rule | source | shape in code |
|---|---|---|
| **1–3 percussion instruments sounding, never the whole section** | [corpus:rimsky] | cap on simultaneous drum lanes = 3 |
| **…unless it is a national dance or ballad style, where percussion may be used more freely** | [corpus:rimsky] | the cap is genre-conditional, and hobbit synth is the exempt case |
| **a percussion re-entry after silence must be pp or ff; mf/mp wastes it** | [corpus:rimsky] | entry gain is drawn from the extremes, not the middle |
| **percussion enters onto a rhythm already established, late in a build** | [corpus:berlioz] | drum entry is gated on another part already playing a figure |
| **wherever the orchestra plays a rhythmic figure, percussion plays too** | [corpus:rimsky] | the converse coupling |
| **the entry is the effect** | [corpus:forsyth] | place drum entries at section boundaries; do not fade one in |
| **frame drum = medium register; pairs with upper-register harmony and with wind trills** | [corpus:rimsky] | frame drum sits with flute/mid, not with bass/low |
| **plucked strings + percussion alone is an excellent blend; add bowed strings and it is not** | [corpus:rimsky] | the shire rig is validated; do not add arco under it |
| **a frame drum struck by hand is inaudible unless multiplied or left nearly alone** | [corpus:berlioz] | either thin the texture at the drum's entry, or double the drum |
| **a folk drum is made bigger by duplication, not amplification** | [corpus:berlioz] | two offset strikes, as `V.wardrum` already does |
| **a folk drum repeats ONE figure for 62 / 83 bars, varied only by a long crescendo** | [corpus:forsyth] (Bizet) | folk-drum figures do not get per-phrase fills |
| **crescendo useful over ≈8 bars max; the model shape is 14 flat + 8 cresc + 3 arrival** | [corpus:forsyth] (Beethoven 4) | roll length and its gain ladder |
| **a side-drum roll must end on a detached stroke; a bass-drum roll need not** | [corpus:forsyth] | per-voice roll termination flag |
| **in a percussion tutti, half roll and half play the rhythm** | [corpus:forsyth] (Tchaikovsky) | never give every drum lane the same articulation |
| **one player cannot roll on two drums** | [corpus:forsyth] | at most one `art:"roll"` among the timpani lanes at a time |
| **a rubbed frame-drum roll has a maximum length set by the radius** | [corpus:berlioz] | cap the duration of a frame-drum roll |
| **odd stroke count preserves stroke direction; even reverses it** | [corpus:forsyth] + `travelling-percussion.md` §2.3 | the down/up polarity state machine, and why a slip-jig figure is two bars |
| **the sticking of a repeated bar differs from the sticking of a one-off bar** | [corpus:forsyth] | accent pattern depends on how many times the figure repeats |
| **a drag/flam is an accent, not extra notes** | [corpus:forsyth] | render `art:"drag"` as an accented single, damped |
| **percussion may play alone, as a texture** | [corpus:rimsky] + `travelling-percussion.md` §4.4 | the drum-only section this program has never built |
| **the tendency is to write too few notes, and single detached strokes are wrong on a drum whose idiom is continuous** | [corpus:forsyth] | a frame drum lane should be dense, not sparse |

---

## §19 WHAT NOBODY GIVES

The searches that came back empty, and the claims that are one source deep.

- **NO MEASURED SPECTRUM OF A BODHRÁN EXISTS IN ANYTHING REACHABLE.** This is the
  largest hole in Part A and everything downstream of it is inference.
  [corpus:bodhran-info] publishes three frequency-analysis *images* comparing
  tuning systems and prints **no axis values**; its text gives exactly one number,
  the 90 Hz basic tone, and attributes the study to the University of Munich
  without a citation. Searched nine ways: bodhrán modal analysis, bodhrán
  spectrum, frame drum acoustics, bodhrán frequency measurement, Irish frame drum
  acoustic study, plus the same for tar, bendir, daf, riq and tambourine.
  **Nothing peer-reviewed on any frame drum was found at all.**
- **NO FRAME-DRUM DECAY TIME, FROM ANY SOURCE.** Not a T60, not a "rings for N
  seconds", not a damping ratio. The T60s in §5 are **derived from a two-headed
  SNARE drum's modal damping**, and the paper explicitly attributes the
  fundamental's heavy damping to the second head, which a frame drum does not
  have. **Any decay time the program uses for a frame drum is `[CHOSEN]`.**
  Searched: bodhrán sustain, frame drum ring time, drum head decay measured
  seconds, drum muffling decay time experiment. The muffling searches returned
  only retail advice with no numbers.
- **NO MEASUREMENT OF WHAT THE INSIDE HAND DOES TO DECAY.** Sources agree it
  shortens it ("flat hand… short, staccato"), none quantifies it. The pitch side
  has one number — "an octave or more" — and that is a ceiling, not a gesture
  size. §8's tension arithmetic is derived from a formula, not measured on a
  drum.
- **NO ACOUSTIC MEASUREMENT OF THE DOWN VS UP STROKE.** The 90% / filler-notes
  split [corpus:moderndrummer-bodhran] is a description of *usage*, not of
  timbre. Nobody fetched says the up stroke is quieter by N dB or brighter or
  duller. The claim that they are different sounds rests on the two ends being
  differently shaped and on the tipper-material sources; **how** different is
  unsourced.
- **THE AIR-LOADING DIRECTION IS DISPUTED BETWEEN TWO FETCHED SOURCES.**
  [corpus:euphonics] says air loading *lowers* all natural frequencies (added
  mass); [corpus:sos-bassdrum] says suspending the membrane in air *shifts the
  modes upwards*. Both were fetched this session. **Not reconciled.** Note they
  may be describing different comparisons (free membrane vs. loaded, versus
  vacuum vs. shell-mounted), but neither says so, so the sheet does not assume it.
- **THE ROSSING THREE-CATEGORY ABSTRACT WAS NOT FETCHED.** pubs.aip.org returned
  **403** on both JASA articles attempted (*Vibrational modes of drumheads in
  various types of drums*; *The evolution of drum modes with strike intensity*).
  The three-way classification is in §2 **only because [corpus:sos-percussion]
  states it independently on a page that was fetched.** The JASA wording in §2 is
  shown as a search-result summary and marked so; it is not relied on.
- **NO SOURCE SAYS HOW A FRAME DRUM ROLLS.** The double-stroke vs single-stroke
  question in §15 is answered for the side drum and the kettle and **not for any
  frame drum**. The suggestion that a tipper roll resembles the controlled-rebound
  case is a mechanism argument from the tipper's known return stroke, **not a
  source**, and is `[CHOSEN]` if built.
- **BILL TROXLER'S BODHRÁN TRIPLETS PAGE RETURNED HTTP 400**, twice. It is the
  one page found that appeared to give the triplet stroke by stroke. The triplet
  mechanism in §7 is assembled from [corpus:moderndrummer-bodhran]'s "plays the
  middle notes of triplets" plus the down/up motion already sourced in
  `travelling-percussion.md` §1.1. **The assembly is mine.** `[CHOSEN]`
- **THE DUM / TEK / KA VOCABULARY IS STILL UNFETCHED**, one day after
  `travelling-percussion.md` §8 recorded the same failure. ethnicmusical.com
  **403**; rareinstrument's riq page was reachable but names no strokes;
  tapadum.com was fetched and explicitly *"does not provide specific stroke names
  (dum, tek, ka, or equivalents)"*. **Three more attempts, three more misses.**
  The riq/daf stroke names remain unwritten in this repo.
- **ADLER AND BLATTER ARE NOT IN THIS SHEET.** Both were named in the brief. Both
  are in copyright and neither has a fetchable authoritative text; the copies that
  surfaced are scraped PDF mirrors of unclear provenance. **Nothing is quoted from
  either.** Part B rests entirely on the three public-domain treatises
  (Rimsky-Korsakov, Forsyth, Berlioz) plus two modern practitioner pages. The
  consequence is a real gap: **modern percussion-section practice — setups,
  station design, how many instruments one player covers in a cue — is
  represented here by two web pages and not by a standard reference.**
- **NO PERCUSSION-SPECIFIC NOTATION OF ANY LOTR CUE.** Unchanged from
  `travelling-percussion.md` §8. Adams names the bodhrán, the cue and the
  timestamp and prints no notation. **The two-bodhrán-player fact used in §16 is
  from that sheet's extraction of the performer credits, not from anything fetched
  today.**
- **NO SOURCE CONNECTS THE FRAME DRUM'S ACOUSTICS TO ITS PATTERNS.** Part A and
  Part B of this sheet, and this sheet and its sibling, are joined by argument and
  not by any author. Nobody found writes about how a bodhrán's spectrum should
  inform how it is scored.
- **BERLIOZ IS OCR AND IT SHOWS.** `score-craft.md` already flags this — *"Berlioz
  (archive.org OCR — textually unreliable, flagged)"*. Every Berlioz quotation
  above was read in context and is coherent, but the scan mangles italics,
  accents and some numerals. **Treat the Berlioz wordings as substantively right
  and typographically approximate.**
- **NOTHING HERE IS A VERDICT.** No source says a frame drum would make hobbit
  synth better, and no number above has been heard. Part A says what the
  instrument is; Part B says what the tradition does. Whether either belongs in
  this program is the owner's call.

---

## §20 Sources

Fetched and verified 2026-08-13, all of them.

**Membrane acoustics and measurement**
- **[UIUC Physics 406 — *Vibrations of Ideal Circular Membranes and Circular Plates* (PDF)](https://courses.physics.illinois.edu/phys406/sp2017/Lecture_Notes/P406POM_Lecture_Notes/P406POM_Lect4_Part2.pdf)** *(Bessel zeros 2.405/5.520/8.654…; f = (x/2πa)√(T/σ); the Phattie 12″ **single-head** tom scans and data-vs-theory plots; the finite-stiffness note)* — **the two charts are images and were rendered at 300–600 dpi and read as pictures; all figures taken from them are readings, ±0.05 in ratio**
- **[Skrodzka, Hojan & Proksza — *Vibroacoustic investigation of a batter head of a snare drum*, Archives of Acoustics 31(3) 289–297 (2006) (PDF)](https://acoustics.ippt.pan.pl/index.php/aa/article/download/674/592)** *(measured modal table with frequencies, ratios and **modal damping percentages**; central vs non-central excitation; Rossing's differing figures in the same table)*
- [Wikipedia — Vibrations of a circular membrane](https://en.wikipedia.org/wiki/Vibrations_of_a_circular_membrane) *(Bessel zeros and ratios to five figures)*
- [Penn State / Dan Russell — Vibrational mode shapes of a circular membrane](https://www.acs.psu.edu/drussell/demos/membranecircle/circle.html) *(ratios; centre strike = thump with no definite pitch; off-centre = definite pitch lingering seconds; the (0,1) mode radiates efficiently and therefore dies fast)*
- [Euphonics — 3.6 Tuned drums](https://euphonics.org/3-6-tuned-drums/) *(air loading adds effective mass and lowers all natural frequencies, without producing harmonicity)*
- [Sathej & Adhikari — *The eigenspectra of Indian musical drums*, arXiv 0809.1320 (PDF)](https://arxiv.org/pdf/0809.1320) *(uniform membrane overtones are not integer multiples, hence no strong sense of pitch; the kettle as the Western solution)*

**Drum synthesis**
- [Sound On Sound — *Synthesizing Percussion*](https://www.soundonsound.com/techniques/synthesizing-percussion) *(the mode-ratio table 1.00/1.59/2.14/2.30/2.65; the three membranophone constructions; strike a quarter of the way from edge to centre; radial modes decay long, circular modes short)*
- [Sound On Sound — *Synthesizing Drums: The Bass Drum*](https://www.soundonsound.com/techniques/synthesizing-drums-bass-drum) *(vacuum → air → shell; the 10% pitch shift and single AR envelope; "the rate is constant across all the important partials")*
- [AAS Chromaphone 3 user manual](https://www.applied-acoustics.com/chromaphone-3/manual/) *(membrane resonator; Pitch = first partial, Decay, Material = decay vs frequency, Tone = amplitude vs frequency, **Hit Position = relative amplitude of partials**)*

**The bodhrán as an instrument**
- [Modern Drummer, *The Bodhrán*, via Ceolas](https://www.ceolas.org/instruments/bodhran/moderndrummer.shtml) *(lower tipper head carries ~90% of strokes; upper head for fillers and the middle of triplets; flat hand = staccato, heel = controlled ring, knuckles = between; nearer the rim = lower pitch; 16″–24″ wide, 3″–6″ deep)*
- [bodhran-info.de — The IsolatHED Technology](https://www.bodhran-info.de/en/info/isolathed) and [The Compressor Tuning System](https://www.bodhran-info.de/en/info/the-compressor-tuning-system) *(the **only** published bodhrán frequency figure found anywhere: a synthetic skin with a **basic tone of 90 Hz**, University of Munich; qualitative spectrum description; the frequency-analysis plots are images with no axis values)*
- [RareInstrument — Frame Drum (Bodhrán, Tar)](https://rareinstrument.com/frame-drum-bodhran/) *(rear hand moves between a low open bass note and tighter higher sounds; centre = lower and fuller, edge = sharper; a clean stroke lets the beater rebound instead of choking the sound)*
- [bodhran.ca — Bodhrán tippers: types, styles and how to use them](https://bodhran.ca/bodhran-tippers-types-styles-how-to-use/) *(five tipper types; heavy = deeper louder attack, slim = fast triplets and ghost notes without low end; wood density and attack)*
- [Impact Soundworks / Red Room Audio — *Traveler Series: Bodhráns & Bones*](https://impactsoundworks.com/product/traveler-bodhrans-bones/) *(six drums, 12″×4″ to 15½″×6″; **five zones — Center, Mid, Edge, Rim, Shell**; five beater types; up to 5 dynamic layers and 7 round robins; ensemble of up to three players with auto-humanization; pitch and damping on the fly)*
- [rekkerd — review of the same library](https://rekkerd.org/review-traveler-series-bodhrans-bones-by-red-room-audio/) *(open / half-damped / fully damped zones; "individual transients and sustains")*
- [drum-tuning.com — Drum tuning chart](https://drum-tuning.com/drum-tuning-chart/) *(fundamentals by size for **two-headed** toms: 14″ 80/95 Hz, 16″ 65/80 Hz, 18″ 55/70 Hz — used only as a size analogue)*

**Orchestration treatises (public domain, fetched as full text)**
- **[Rimsky-Korsakov — *Principles of Orchestration*, Project Gutenberg #33900](https://www.gutenberg.org/files/33900/33900-h/33900-h.htm)** *(the whole "Economy in orchestral colour" paragraph including the **national dances exemption** and the **pp-or-ff re-entry rule**; "Use of percussion instruments for rhythm and colour"; the high/medium/deep register classes placing the tambourine as medium; **plucked strings + percussion is an excellent blend**; kettle-drum tremolando dynamics; national instruments including the oriental and small tambourine)*
- **[Cecil Forsyth — *Orchestration* (1914), Internet Archive full text](https://archive.org/details/cu31924022381440)** *(roll notation and the detached finishing stroke; LL-RR long roll; the paradiddle as a sticking not a rhythm; **odd stroke counts preserve stroke direction**; drag and flam are accents; "its principal effect is its entry"; the ~8-bar crescendo limit and Beethoven's 14+8+3; **two drummers needed for two simultaneous rolls**; the Tabor and Bizet's 62 and 83 bars; the tambourine's three playing methods and its tone becoming tiresome; the Francesca da Rimini percussion tutti split)*
- **[Berlioz — *A Treatise upon Modern Instrumentation and Orchestration*, Internet Archive full text](https://archive.org/details/treatiseuponmode00berl)** *(the tambourine's **three kinds of noises**; struck by hand it is indistinguishable unless multiplied or left nearly alone; the **impossible thumb roll**; a single drum is "mean and vulgar" and drums improve in proportion as they are more numerous; forty or fifty drums alone; the multiplicity of unisons; the bass drum entering onto a rhythm already established; as many drummers as drums; eight pairs and ten drum-players in the Requiem)* — **OCR, textually approximate**

**Modern percussion-section practice**
- [ACTOR / Timbre and Orchestration Resource — Percussion: Scoring](https://timbreandorchestration.org/isfee/extreme-orchestration/percussion/scoring) *(individual parts per **player**, not per instrument; mandatory percussion legend; tremolo marks for unmeasured rolls; percussionists prefer few instruments — reconsider an instrument used for one or two notes)*
- [Tim Davies, deBreved — *Percussion: A Hit Job, Part I*](https://www.timusic.net/debreved/percussion-a-hit-job-part-i/) *(the film percussion score and why it is left flexible; the players huddle and divide the cue themselves)*
- [The Idiomatic Orchestra — 14. Orchestra size and setting](https://theidiomaticorchestra.net/14-orchestra-size-and-setting/) *(a modern full-scale symphony orchestra: **1 kettledrum player, 3–4 percussionists**, at least one of whom also plays kettledrum)*

**Reached for and refused**
- pubs.aip.org (JASA) — **403** on *Vibrational modes of drumheads in various types of drums* and on *The evolution of drum modes with strike intensity*
- billtroxler.com bodhrán triplets — **400**, twice
- ethnicmusical.com riq — **403**
- csmaccath.com basic bodhrán technique — **403**
- exploresound.org modes and directivity of percussion instruments — **503**
- snarescience.com drum head vibrations — **503**
- drumdojo.com micing a bodhrán — **503**
- redroomaudio.com — 301 to impactsoundworks.com (followed)
- slab.org Laird digital-waveguide drums thesis — downloaded 5.9 MB and **text-extracted to nothing legible**; not used
- Adler, *The Study of Orchestration*; Blatter, *Instrumentation and Orchestration* — in copyright, no authoritative fetchable text, **nothing quoted**

**Prior sheets used**
- `docs/genre-research/travelling-percussion.md` — the patterns, the tipper's two strokes, the inside hand's octave, the LOTR bodhrán credits, the slip-jig polarity arithmetic
- `docs/genre-research/score-craft.md` §11 — already holds Rimsky's scarcity paragraph; this sheet adds the clauses around it
- `docs/genre-research/drum-engine.md` — the house method for voice work, and the A-weighting lesson §6 depends on
- `Deckards Orchestrator MK2.html` — `V.wardrum`'s sourced strike-velocity glide, reused unchanged in §9
