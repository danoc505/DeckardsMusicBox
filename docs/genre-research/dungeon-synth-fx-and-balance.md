# Dungeon synth, fourth pass: THE FX BEDS, THE HELD NOTE, AND WHERE THE ENERGY SITS

*Researched 2026-08-10 at the user's request: "make sure we are using automation
properly... using legato where needed, the correct audio levels, the correct low
mid, highs... allowing for all the instruments in the Errang set on the main
branch to be available for the songs creation, we want to bring in more of the
FX sounds properly." Fresh sources below; the measurements are this build's own,
made with `harness/probe_stems.js` and two scratch band probes whose method is
stated inline.*

---

## 1. THE ATMOSPHERE BEDS — what the sources say about using them

The Erang pack ships **ten beds nothing can play**: five `sfx` (wind, catacomb,
drone, emptiness, thunder impact) and five loopable `Noise` files. They are in
the embedded bank — decoded, looped, unplayable — and the second research sheet
recorded that as open. What the sources say about how this material is used:

- **A practitioner, first person**: "I also add atmospheric sounds at various
  parts of the track. These are usually sampled recordings from fantasy video
  games." [erichgrunewald.com, "How I Make Dungeon Synth" — re-read 2026-08-10.]
  **At various parts** — not wall to wall.
- **The genre's own forum** has a thread asking for exactly this material:
  sound effects as "accents" to dungeon music — "rain and thunder, creaking
  doors, and wind through trees"
  [dungeonsynth.proboards.com/thread/252/sound-effects — the forum rate-limited
  the fetcher on this pass; the accent framing is from the thread's own
  opening as indexed. Marked accordingly.]
- **Dark ambient practice, the neighbouring genre**: ambiences are a
  "background layer that shapes the perceived environment", occupying "the
  perceptual background while allowing other elements to define the
  foreground"; layers develop by "subtle transformations" rather than
  events. [bluezone-corporation.com, "The sounds of dark ambient music"]
- **Reviews of real records** describe field recordings "joined by warm drones
  and synthwave-like keys and pads", and rain used both as a backdrop and as
  "brief interludes". [thedungeonindeepspace.com, several 2020–21 reviews]

**What no source gives: a level in dB.** The nearest hard numbers this repo
holds are the audibility floors already cited in the arrangement sheet (1 dB
isolated, 0.25 dB in balance — Hugh Robjohns, Sound On Sound) and the vinyl
precedent inside this program: a surface noise bed sits "55–60 dB under the
loudest thing it can play". A bed must be above the audibility floor and it
must stay behind every part with a name. The chosen resting level is `[CHOSEN]`
and says so where it is set.

**The build this argues for:** the beds join the record the way the record
surface does — a looped source at the mix, behind the music, drawn per song —
NOT as a note-playing instrument. A wind bed given notes would be a synthesiser
with extra steps; what the genre does with this material is *stand it behind
the music*. One bed per song, drawn from the ten, with the panel able to choose
and the POWER able to refuse — the tape machine's three-way rule.

## 2. LEGATO — the second keyboard and the tune do not hold, and the sources say hold

The sources this genre is already built on:

- "Use **long, sustained notes** to enhance the ethereal quality."
  [dungeonsynth.neocities.org/howto — already cited in the technique sheet]
- "Mono legato mode is frequently used on synth basslines and synth **leads**"
  [corpus:attackmagazine — the source synthwave's `legato: { lead: 1 }` shipped on]
- A slow-attack patch played detached never finishes opening
  [corpus:reverbmachine — the source bladerunner's legato shipped on]

MEASURED, seeds 1–3, medians per part (onset spacing / sounded duration /
silence between):

| part | next onset | duration | silence | holdSec available |
|---|---|---|---|---|
| lead | 2.72 s | **0.82 s** | **1.77 s** | 3.62 s |
| keys2 | 4.03 s | 3.18 s | 0.51 s | 3.64 s |
| keys / bass / ostinato | — | — | **0.00 s** | already contiguous |

The tune rings under a second and then leaves 1.8 seconds of nothing, **on a
machine whose attack is 0.55 s** (`erangLead`, set from the pack's own measured
swells) — the exact defect the reverbmachine source describes: the patch never
finishes opening. The second keyboard re-attacks with half a second of hole
between chords. Everything else already holds edge to edge, so `legato` on
those parts would change nothing — which is why they are not declared.

**Build: `legato: { lead: 1, keys2: 1 }`.** Same mechanism as bladerunner and
synthwave (`08e`), extend-never-shorten, hand outranks genre.

## 3. WHERE THE ENERGY SITS — measured against the pack itself

The user asked for "the correct low mid, highs". The reference this genre
carries with it is **the pack** — Erang's own patches are the genre's sound by
construction. Band shares (power spectrum, 8192-pt Welch), the loudest two
seconds of each source WAV on `main`, medians per family:

| family | centroid | low 60–200 | lowmid 200–500 | mid 500–2k | high 6k+ |
|---|---|---|---|---|---|
| strings | 469 Hz | 17.7% | 30.6% | 31.5% | 0.0% |
| Pad | 330 Hz | 25.1% | 37.2% | 13.4% | 0.0% |
| Key | 564 Hz | 0.0% | 30.2% | 56.3% | 0.0% |
| Plucked | 656 Hz | 0.0% | 38.2% | 61.2% | 0.0% |
| Lead | 455 Hz | 25.7% | 9.9% | 26.8% | 0.0% |

And the rendered record, full mix through the real graph, mid-record windows:

| | centroid | sub | low | lowmid | mid | himid | high |
|---|---|---|---|---|---|---|---|
| dungeonsynth seed 7 | **193 Hz** | 8.9% | **74.5%** | 12.2% | **2.1%** | 1.9% | 0.1% |
| dungeonsynth seed 1 | 157 Hz | 15.6% | 65.9% | 14.7% | 3.2% | 0.4% | 0.0% |
| bladerunner seed 7 | 441 Hz | 11.3% | 20.8% | 38.0% | 28.7% | 1.1% | 0.1% |

Two findings, opposite verdicts:

- **The near-zero highs are CORRECT.** The pack's own families carry ~0% above
  6 kHz; "avoid overly bright transients" [corpus:melodigging] is what the
  reference audio itself does. Nothing to fix.
- **Three quarters of the record in one octave band is not the pack's balance.**
  Rendered alone, each pitched part is spectrally right (keys centroid
  1901 Hz, keys2 805, ostinato 605 — sitting where the pack sits); the mass is
  the drums: **–14.1 dB RMS with 78% of their energy below 200 Hz, while every
  pitched part sits 17–21 dB below them.** In loudness (A-weighted) the drums
  are only 2.4 dB proud of the mix — the right "in front", the owner's own ask
  — but unweighted they are holding the master limiter down: remove them and
  the record gains **11.5 dB** of level and only **2.38 dB** of audible
  loudness. That difference is sub-200 Hz weight the ear barely registers,
  paid for by every other part's headroom. Belkin names it: "overloading the
  low register". The genre's own mixing thread names the tool: EQ is for
  **cuts**, "shelves of a few dB" [myrrys, proboards/1305].

**Build: the genre declares a desk low shelf cut of a few dB** (the desk's low
knee is at 200 Hz — exactly the band measured). Sized by A/B below. The drums
stay first in loudness order; what the shelf takes is the weight under them.

## 4. THE BASS IS A DECLARATION THE AUDIO DOES NOT CONTAIN

Seed 7, mid-record: bass alone **–55.5 dB A-weighted**, leave-one-out
**–0.01 dB** — removing the drone makes the record no quieter at all. "Long
pedal notes and drones" [corpus:melodigging] is the genre's named foundation
and the record does not audibly have one; a pedal nobody can hear is the stale
table entry in audio form. Part of this is register (41–98 Hz, where hearing
is 30–45 dB down) and is genre-correct; the first guess was that the rest was
the fader. **The fader was tried and the measurement refused it**:
`roleGain.bass` 0.22 → 0.30 (+2.7 dB) moved the leave-one-out from −0.01 dB
to… −0.01 dB, while the unweighted toll rose — more energy into exactly the
band §3 exists to relieve, for nothing hearing can collect. Reverted. The
drone's audibility is register-bound; the levers that would work are
register-shaped (the double pedal's fifth an octave up, or the drone an octave
up), and both are design questions for the owner, recorded as open rather than
slipped in.

## 5. AUTOMATION — the 2026-08-10a lesson, applied here

The 10a finding on prog-techno: gestures written on `peak`/`build` fire ONCE a
record; **`fill` recurs** (there, 9.8 a song) and nothing used it. Measured on
this genre, seeds 1–4: **7–10 `fillInto` sections a song, one `peak`** — and
dungeon synth's motion block declares **zero gestures of any kind**. Its
comment says a genre with no drops has weather instead of gestures, which
conflated two different sizes of event: a drop is once, a fill is a dozen
section seams a record, and the seam is exactly where this genre's own
research puts change — "at phrase or section boundaries" [Belkin, arrangement
sheet P3]. The room breathing wider across a section boundary IS this genre's
gesture; it is not a drop.

Also measured: every clamped lane keeps 100% of its written swing (the 10a
matrix fix reached this genre — `keysRoom`/`drumsRoom`/`leadRoom` start pulled
down and open). But the genre moves only **3 of the desk's 49 crossings**, the
same three in every record, and has no `matrixDraw` pool — the "same faders
every record is a preset" finding from 10c, unapplied here.

**Build:**
- gestures on `fill` for the sends a section-seam would move — the hall and
  the echo swelling into the next section, sized past the audibility floors
  (≥0.06 on a 0–1 send) and SLOW (the whole fill window, this genre's tempo),
  per Reich's "audible process" rule already cited in the arrangement sheet.
- a `matrixDraw` pool so each song moves its own further crossings of the
  desk, weights on the sends this genre actually feeds.

The 0.2%-of-dial tune drifts stay: they were sized deliberately small (the
"noticed on the third pass" comment) and they are voicing weather, not
gestures. Recorded rather than re-litigated.

## 6. THE ERANG SET — what is reachable and what is not

The machines cover the 55 playable patches: `erangStrings` (strings+Pad, 20),
`erangHarp` (Key+Plucked, 15), `erangLead` (Lead, 10), and the dungeon kit's
`pSet` (percussion, 10) — every patch switch takes its travel from the bank
(`erangPatches()`), and the patch is drawn per song evenly across the family
(`drawParam` "any"). Machine draws measured over 40 songs: erangStrings on 10
songs' keys + 9 keys2, erangHarp 10 + 9, erangLead 21, mellotron/vp330/auto
the rest — the pack and the synthesised machines trading songs as designed.
**The gap is the ten beds (§1), and closing it makes the whole 65 reachable.**

## Sources — new this pass

- [Erich Grunewald — How I Make Dungeon Synth](https://www.erichgrunewald.com/posts/how-i-make-dungeon-synth/) *(re-read for the atmosphere line: "at various parts of the track")*
- [Dungeon Synth forum — Sound Effects thread](https://dungeonsynth.proboards.com/thread/252/sound-effects) *(the accent framing; the forum 429'd the fetcher this pass — indexed text only, marked)*
- [Dungeon Synth forum — artists + field recordings](https://dungeonsynth.proboards.com/thread/464/dungeon-synth-ambient-artists-recordings) *(exists; unfetchable this pass)*
- [Bluezone — The sounds of dark ambient music](https://www.bluezone-corporation.com/blog/the-sounds-of-dark-ambient-music-understanding-their-roles) *(ambience as background layer; subtle transformation)*
- [This Is Darkness — Dark Ambient 101: Field Recordings](https://www.thisisdarkness.com/2018/04/07/dark-ambient-101-field-recordings/) *(500'd the fetcher; search-index summary only: layered recordings played as one instrument, level "the most important thing" — marked, not quoted further)*
- [The Dungeon in Deep Space — reviews](https://thedungeonindeepspace.com/) *(field recordings as backdrop and interlude in released records)*
- Erang — Dungeon Synth Free Samples Pack [(bandcamp)](https://erang.bandcamp.com/album/dungeon-synth-free-samples-pack) *(the pack's own folder structure: 5 sfx + 5 noises)*
- The general mud-fixing pages that came up (sageaudio, emastered, musicguymixing) are **not used**: none is about this genre, and the repo already holds the sourced versions of the same claims (Belkin, Rimsky-Korsakov, myrrys).

## 7. WHAT WAS BUILT — filled in as the slices land

**Legato (§2), shipped.** `legato: { lead: 1, keys2: 1 }`. Measured after,
seed 7 mid-record: lead RMS −31.5 → −28.0 (+3.5 dB of ring), its silent share
26% → 2%, leave-one-out 1.49 → 2.77 dB. keys2's half-second holes closed
(−39.1 → −38.5 A-wt). Roll byte-identical — stage 6 moves no note — and the
legato seam check names both parts.

**The desk shelf (§3), shipped at −3 dB.** Measured after (with the legato in):
seed 7 centroid 193 → 332 Hz, low band 74.5 → 65.4%, lowmid 12.2 → 16.8%, mid
2.1 → 3.5%; seed 1 centroid 157 → 293 Hz, low 65.9 → 57.3%, mid 3.2 → 9.0%.
The drums' headroom toll fell 11.5 → 8.4 dB while their crest *improved*
13.1 → 14.7 dB (the shelf leans on the wash, not the strike) and the march
remains the loudest part in the record by 11 dB RMS. In A-weighted
contribution the tune now leads (3.07 dB against the drums' 1.19) — which is
the practitioner's own ordering (melody at −6, the loudest), and is also a
change of ordering from the round the owner tuned drums-first, so it is
stated here for judgement rather than buried: the drum is still the biggest
thing in the record by power; what changed is that the sustained tune is now
audible over more of the bar.

**The bass fader (§4), tried and reverted.** The measurement above.

**Automation (§5), shipped.** Four `fill` gestures (the echo send, the two
kettle rooms, the march stepping into the hall) and a `matrixDraw` pool of
five crossings on the two units the sources name — the room and the echo, no
flanger and no barberpole in a crypt — with 1–2 drawn per song, directions per
the 10a law (routed lanes played down, unrouted climb). Measured after, max
over seeds 1–4: `drumsRoom` 45 → 60% of dial, `echo.send` 28 → 39%,
`tVerb` 17 → 22.5%, and the drawn crossings `keysEcho` 31%, `bassEcho` 38%,
`bassRoom` 20% — the last starting pulled off its routed wire after the first
measurement showed an on-wire LFO losing half its swing (50% kept → 73%).
The clamp seam check is green across 36 songs; all 684 declared lanes swing;
the roll is byte-identical (motion moves no note).

**The atmosphere bed (§1), shipped.** One event on the tape role — the same
rail as the record surface, so the `.mid`, the roll and the stem windows
exclude the weather without a line of new filtering. Which bed is asked of
the bank and split by what the audio measured: the eight loopable files are
BEDS (one drawn per song, looped on the bank's own loop points, under the
whole record), and the two one-shots (catacomb crash, thunder impact) are
ACCENTS — half of records draw one and spend it once, on the peak section's
downbeat, per Belkin's saved-colour rule. Levels were measured, not guessed:
the first bed level rendered at −45 dB against a −16 dB mix with a 0.004 dB
whole-mix delta — the "declared and absent" defect again — and was doubled to
land at **−38.9 dB**, under the quietest named part (keys2 −36) and above the
between-strikes floor; the accent at its first size added 0.15 dB against the
0.25 dB balance-audibility floor and was raised to **0.22 dB at a low draw**,
peaking −15.8 dBFS at the record's loudest bars. The medium (bed + crackle +
hiss) is ridden by a new `vinylMix` lane — pulled back for the bridge, per
the 10a routed-lanes-cut-only law; lofi's own vinylMix lane is the precedent.
Verified: 20 seeds draw 7 different beds and both accents; lofi carries zero
atmos events; the full battery is 173/1 with the one failure being the
not-yet-bumped stamp; the snapshot moved **600 of 5400 baseline lines, every
one dungeonsynth** (the two new events per song), with the note-only hash
unchanged; blend 20/20; MIDI 20/20; the other genres' rolls byte-identical.

With the beds and accents playable, **all 65 sounds in the Erang pack are now
reachable** — 45 pitched patches on the four samplers, 10 percussion in the
dungeon kit, 8 beds and 2 accents on the atmosphere rail (§6).
