# THE COMP'S REGISTER — the decision this project parked twice

*Written 2026-08-04, on the branch at `4a28828`, before the code. HANDOFF §9.1
and BACKLOG §6.2 both end at the same sentence: "a comp spread across three
octaves is one instrument covering the whole range, and it would overlap the
bands the bass and the lead are guaranteed. That is a decision about what this
program is, and it has not been made." This sheet makes it, with the reasoning
on the record and the sources named. The user's standing instruction is that
decisions about laws are the coder's to make and write down, not to hand back.*

---

## 0. The question, precisely

`buildKeys` folds every chord tone into the genre's `keys` band before anything
else happens, so the band is a hard ceiling. lofi's `[52, 74]` is 22 semitones.
The measured comp span (sounding at each sixteenth, 30 seeds) is **14.0**
semitones; the sourced target is **24 or more** (two sources, independent:
[corpus:orphiq] "spread voicings where the notes span TWO OCTAVES OR MORE", and
the user's reference photograph, one bar framed B3/B4/D5/C6/F6 = 30 semitones).
Four mechanisms shipped against this gap — drop-2, drop-2-and-4, rootless
candidates, a continuous spread bonus — and together they bought about a
semitone and a half, because none of them can move a wall.

So: **may the comp leave its band, and in which directions, and what stops it?**

## 1. What the fresh research says (2026-08-04 searches)

Three findings, two of them new to this repo's sheets:

1. **The supporting-comp register in jazz practice is narrow and middle.** The
   commonly taught comping range is roughly **D3 to F5** ("about D below middle
   C to F an octave above middle C" — Dan Davey's jazz piano handout via
   bandworld.org, corroborated by pianogroove's comping material), and the top
   note of a rootless voicing is advised to sit **between C4 and C5**
   [corpus:thejazzpianosite rootless-voicings]. That is, when a piano is
   *accompanying a soloist*, its home register is almost exactly what this
   program already declares — lofi's `[52, 74]` is D3–F5 to within two
   semitones. **The current band is not a mistake. It is the correct answer to
   a different question.**

2. **The top boundary is relational, not territorial.** "Stay out of the range
   of the soloist. If the soloist is playing up high, you'll want to pull down
   into the middle range of the piano. Likewise, for a more baritone
   instrument, you'll want to comp up higher" [corpus:jazz-library.com/comping].
   No source gives the comp a fixed ceiling; every source gives it a
   *relationship* — under the melody while the melody speaks.

3. **The spread voicing that spans two octaves is a different texture with a
   different job.** Every description of the two-octave spread puts the ROOT at
   the bottom of it: "play the root note of the chord with the left hand in the
   lower registers... play the melody with the right hand, and voice the 3rd
   and 7th in between" [corpus:thejazzpianosite open-voicings; corpus:
   pianogroove spread-voicings]. The orphiq lofi instruction is the same shape:
   "play the root in the left hand and the 3rd, 7th and any extensions in the
   right hand with space between them." **The two-octave span the lofi sources
   describe is the whole piano — a solo-piano texture where the piano IS the
   record**, which is what a lofi beat's keys are: much of the genre has no
   lead at all, and the chords are the music (`lofi-production.md` — the
   texture is "dense in PARTS", the keys hold 1.5–2.5 s notes).

The prior sheets already hold the rest: the low interval limit as the floor
(`lofi-harmony.md` §5 — minor 3rd muddy below C3, top note of any interval
besides 5ths/octaves no lower than E3), and that sheet's own recommendation:
"a voicing should be allowed to span two octaves or more, **with the low
interval limit as the floor rather than a fixed register band as the
ceiling**" (§7.2).

## 2. THE DECISION

**The comp may spread to three octaves of ROOM. Downward, the walls stand.
Upward, the wall becomes a declared allowance.** In four laws:

1. **The bass keeps the bottom, absolutely — the floor law stands unchanged.**
   The comp's lowest voice may never come within 2 semitones of the bass
   band's ceiling (`R.bass[1] + 2`, the existing `openFloor`). This is theory,
   not territory: the lowest sounding pitch defines the inversion the ear
   hears, and this program's bass IS the root (the whole rationale for the
   rootless candidates). A comp voice under the bass would re-root every
   chord. The sources are unanimous downward, and the low interval limit
   (physics, already built) stands with it.

2. **Upward, the band ceiling becomes the HOME, not the wall.** A genre may
   declare `registers.keysUp` — how many semitones an *open* voicing's top may
   rise above the keys band. The room it grants is symmetric with what the
   floor law already grants downward (a dropped voice may fall up to 12 below
   the band, bass permitting), and it is a table field, so each genre keeps
   its own answer [Law 4] and six genres declaring nothing are byte-identical.

3. **Only an OPEN voicing may use it.** The program's own law — "sustained
   pads stay close: an open pad is a hole, not a bed" — already gates
   `openVoicing` off for every pad and bridge texture, and the reach rides on
   that gate. A close-voiced material never leaves its band. This also scopes
   the change to the main comp: `keys2` and the bridge pads are sustain
   textures by construction.

4. **The tune keeps its prominence by RESERVATION and by EAR, not by acreage.**
   The tune is built after the comp and narrows into what the comp left
   (the reservation set; the same door the sax's range uses). Overlapping
   bands with collision-avoidance is this program's established practice —
   the counter's band sits INSIDE the keys band by declaration, and dkc's
   comment says its bands "OVERLAP on purpose... because buildKeys works
   around what the [other parts strike]". What reservation cannot guarantee
   is the *topline* — the ear follows the highest moving line, and a comp
   whose top voice sings over the tune has become the melody. **That is left
   to the listening session, measured and flagged, not legislated** — because
   the genre this is for is one where the comp often IS the topline (§1.3),
   and a law against it would forbid the very texture the sources describe.
   The measurement to watch: share of sounding moments where the comp's top
   sits above the tune's pitch while the tune sounds.

## 3. Why not the alternatives

- **"Just widen the band"** moves the fold target: every close voicing drifts
  upward too, the supporting-register finding (§1.1) is thrown away, and the
  genre loses its home position. The band means something — keep it meaning
  "where the comp lives", add "how far an open voicing may reach".
- **"Cap the comp under the theme band"** (a hard topline law) forbids the
  reference photograph itself — its frame tops at C6/F6, above lofi's
  `themeB` ceiling. A law that outlaws the specification it was written to
  meet is the wrong law.
- **"Let every genre spread"** ignores that the two-octave target is sourced
  for LOFI. Acid's stabs (7.7 semitones, the narrowest measured) are close
  voicings because acid house stabs ARE close-position; giving jungle's
  two-part harmony a three-octave comp would be a guess against its own
  research. Each genre asks or it does not.

## 4. What lofi declares, and the provenance

`registers.keysUp: 12` `[corpus:orphiq "two octaves or more"; the reference
photograph B3..F6]`. With the existing floor at 47 (`bass[1]=45 + 2`), the
open-voicing room becomes 47..86 — 39 semitones, enough for the sourced
24–30-semitone voicings *plus their own inner movement*, which the old 27
(47..74) could not hold. The exact number 12 is the symmetric octave and is
`[EAR]`-adjustable; the photo's top frame (F6 = 89) would need 15, and if the
listening session wants more air on top, 15 is the number to try.

## 4a. WHAT BUILDING IT MEASURED — three configurations, two refused

*Added the same day, after implementation. The decision above stands; what
follows is what its numbers turned out to be, and it corrects §9.1's premise.*

**The premise was half wrong: the ceiling was never the binder.** With the
reach granted (ceiling 74 → 86) the candidate generator produced ZERO
candidates above 74 — the fold puts every tone in the band's bottom octave, so
no inversion tops out above that octave plus twelve. Offering octave-lifted
shapes fixed the offering; then an A/B against the commit before showed
open-material voicings had ALREADY spanned 19.3 mean / 23 max under the old
ceiling. The four shipped mechanisms had reached the wall of a different law:
**a four-voice chord's close span is ~10 semitones and every drop or lift
displaces by exactly 12, so no octave rearrangement of four distinct tones
passes 23.** "Two octaves or more" for the comp alone needs a fifth voice.

**Configuration A — comp relocated upward (anchor at the room's centre,
66.5):** voicing spans 21.6 mean / 26 p90 / 31 max, 24% at two octaves+ —
the target hit — and **the comp's top sat above the tune in 49.8% of the
moments both sounded, against 14.6% before.** A tripling of the one
relationship every comping source warns about (§1.2). REFUSED — the sax
precedent: a mechanism whose own measurement contradicts its sources does not
ship as the default. It remains the named dial if the ear wants the tall comp.

**Configuration B — shipped: home anchor (60), reach as headroom, and the
LEFT HAND'S OCTAVE.** Each shape is also offered with its lowest voice doubled
an octave below (the reference photo's own bottom is B3 AND B4 — a doubled
voice; "the left hand usually covers a 5th, octave and sometimes a 10th"
[corpus:practical-chords-and-harmony]), with a duplicate-pitch guard because a
re-inverted double can land on the voice it doubles. Result: spans 19.6 mean /
23 max, above-tune 17.1% (near the 14.6% before), tops ≤75, bottoms to 47.
**Modest by construction:** with the topline protected, the room under the
tune (~26 semitones above the bass wall) admits 24+ only from five-tone
chords, and lofi's extended-chord rate is the harmony's dial (`2026-08-04a`),
not the register's — raising it inside a register commit would stack another
unheard harmony change on the 04-stack, which §0 forbids.

**And the target re-read: the ensemble already satisfies the sources.** Every
source's two-octave spread voicing includes the ROOT at its bottom, and in
this architecture the root is the bass's (the rootless rationale, already in
the file). Measured, bass + comp sounding together, 30 seeds: **span 26.5
mean, p50 28, p90 35 — at or past two octaves in 73% of moments.** The
two-hands texture the sources describe exists across the two parts that are
this program's two hands. §9.1's 14.0 was measuring one hand of it.

**The three roads from here, each a decision with its number attached:**
1. **Extension rate** (harmony): five-tone chords make 26-span voicings
   reachable under the tune. One genre number, after the 04-stack is heard.
2. **The tall comp** (Configuration A): +12 anchor relocation, 24%+ at two
   octaves, costs 49.8% comp-over-tune. The ear's call, never the default.
3. **Accept the ensemble reading** — the numbers above say it is already
   true. This is the reading this sheet recommends.

## 5. Honest gaps, kept honest

- **No source says where a lofi comp sits absolutely** (`lofi-harmony.md` §6
  already records this). The reach number is taste inside a sourced span.
- **The topline question is unlegislated by choice** (§2.4). If the ear says
  the comp is stealing the tune, the remedy is a cost on top-voice excursions
  above the band ceiling while the tune's material is dense — a real
  mechanism, deliberately not built ahead of the ear's verdict.
- **The full per-interval low-interval-limit table is still unsourced as
  text** (image-only on both known pages); the two sourced figures are what
  the code enforces.
- **Nothing here was listened to.** The measurement plan: comp span before and
  after (probe_density, 30 seeds), the voicing-top distribution (does the comp
  live pinned at its new ceiling — the roomEcho-governor failure shape), the
  comp-above-tune share, and the rolls read side by side. The ear rules last.

## Sources

- [jazz-library.com/articles/comping](https://jazz-library.com/articles/comping/) — "stay out of the range of the soloist... pull down into the middle range"
- Dan Davey, *Jazz Piano Basics* handout (bandworld.org) — comping range ~D3 to F5; middle register
- [thejazzpianosite.com — rootless voicings](https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-voicings/rootless-voicings/) — top note between C4 and C5
- [thejazzpianosite.com — open voicings](https://www.thejazzpianosite.com/jazz-piano-lessons/jazz-chord-voicings/open-voicings/) — spread = root low, upper structure high, span over an octave
- [pianogroove.com — spread voicings](https://www.pianogroove.com/blues-piano-lessons/how-to-play-spread-voicings/) — root LH low, 3rd+7th between the hands
- Berklee Online, *Basic Piano Voicing Techniques* — tensions above the F on the fourth line of the bass clef
- Prior sheets built on: `lofi-harmony.md` §5/§7 (orphiq two-octaves+, low interval limit, rootless), `NOTES-FROM-THE-USER.md` (the reference photographs), `lofi-production.md` (the texture is parts, not onsets)
