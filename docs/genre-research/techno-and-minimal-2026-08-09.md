# TECHNO AND MINIMAL TECHNO — fresh research, 2026-08-09

*The owner: "I want you to do research on techno and minimal techno. I think
weve got the fx for the drums right but everything else is wrong."*

*Fresh sources per the rule; the earlier passes (`minimal.md` 2026-07-28,
`plastikman-minimal.md` 2026-08-03) do not count as research and are only cited
where this pass CONTRADICTS them. Everything measured here is measured against
build `2026-08-09e`, and the command that produced each number is beside it.*

---

## Sources fetched this session

1. **MusicRadar**, "Keep it simple, stupid: 7 stripped-back minimal house and
   techno production tips" — fetched in full
   `musicradar.com/how-to/keep-it-simple-stupid-7-stripped-back-minimal-house-and-techno-production-tips`
2. **EDMProd**, "How To Make Techno: 11 Need-To-Know Techniques" — fetched in full
   `edmprod.com/how-to-make-techno/`
3. **TrackSensei**, "How to Make Techno (Step by Step)" — fetched in full, and the
   most numerically specific source here
   `tracksensei.com/blog/how-to-make-techno`
4. **Melodigging**, genre sheet: Minimal Techno — fetched in full
   `melodigging.com/genre/minimal-techno`
5. **Myloops**, "How to Build a Techno Groove That Doesn't Sound Repetitive" —
   fetched in full `myloops.net/how-to-build-a-techno-groove-that-does-not-sound-repetitive`
6. **Attack Magazine**, "Sculpting Warehouse-Style Rolling Techno Basslines" and
   "Low-End Theory: Exploring Eight Common Bassline Styles" — both fetched
   `attackmagazine.com/technique/tutorials/warehouse-rolling-techno-bass/`
   `attackmagazine.com/technique/tutorials/low-end-theory-exploring-eight-common-bassline-styles/`
7. **Red Bull Music Academy Daily**, "The Making of Minimal Nation, Robert Hood's
   Techno Masterpiece" (track by track, Hood quoted)
   `daily.redbullmusicacademy.com/2019/05/robert-hood-minimal-nation-track-by-track/`
8. **artist.tools**, "A Guide to the 8 Core Techno Music Types" — fetched
9. Search-level only, not fetched in full, and marked as such wherever used:
   DJ Mag and The Quietus on Robert Hood; techno-music.com on repetition
   (403 on fetch, so its numbers are NOT used below)

---

## §1 WHAT THE SOURCES AGREE ON, and it is one sentence

**The genre's subject is not the notes. It is time.**

> "Minimal has been characterised by rhythm far more than melody, harmony or
> anything else." [musicradar]

> "The best tracks in the genre often run on four or five elements total."
> [tracksensei]

> "Limit harmonic content to one or two tonal centers or a single pedal tone."
> [melodigging]

Hood, on how to play his own record: **"Take your time, and get into a groove,
and get into a rhythm, and stick to it."** [rbma, on "The Pace"] And on what
minimalism was for him: *"rhythms inside of rhythms inside of rhythms — sort of
hidden rhythms."* [rbma]

---

## §2 THE NUMBERS, collected from the sources that give them

| | what the sources say | source |
|---|---|---|
| tempo, minimal | 122–128 BPM | [melodigging] |
| tempo, minimal | 120–130 BPM | [artist.tools] |
| tempo, club techno | 128–135, peak-time 130–134 | [tracksensei] |
| tempo, techno by style | raw/deep 130–140, peak-time 120–135 | [edmprod] |
| elements at once | "four or five elements total" | [tracksensei] |
| elements at once | "a kick drum, a sub-bass line, and one or two percussive or textural elements" | [artist.tools] |
| phrasing | "16 and 32 bar blocks, because DJs count in phrases and a 24-bar section throws off every mix" | [tracksensei] |
| track length | "six minutes … roughly 195 bars, which is six blocks of 32" at 130 | [tracksensei] |
| opening | "32 to 64 bars of drums and percussion only" | [tracksensei] |
| sections | "16-32 Bars" per section | [edmprod] |
| rate of change | **"Every 4 to 8 bars, move one thing"** | [tracksensei] |
| rate of change | "Each 32 bar block adds or subtracts one element" | [tracksensei] |
| rate of change | "Add subtle bits of variation every 8 bars" | [edmprod] |
| method of change | **"Changes happen through modulation, not composition"** | [tracksensei] |
| the kick | "Kick and sub remain static (boringly consistent on purpose)" | [myloops] |
| the kick | 4-on-the-floor kept "for the majority of your track, besides in the breakdown" | [edmprod] |
| the bass | "One low-frequency idea owns that space at a time" | [tracksensei] |
| the bass | "Leaving the first 16th-note of every beat empty is important to prevent clashing with the kick" | [attack, warehouse] |
| the bass | stays "within the C2 octave range" — one octave, mostly one pitch | [attack, warehouse] |
| the bass | in minimal, "carried by the kicks … rather than having separate synth elements in the low frequencies" | [musicradar] |
| harmony | "muted chord stabs, airy pads … used as texture rather than focal hooks" | [musicradar, search] |
| harmony | "one or two tonal centers or a single pedal tone" | [melodigging] |
| swing | "Nudge the offbeat hats and the percussion 5 to 15 percent late" | [tracksensei] |
| micro-timing | offbeat hats "5–15 ms" behind the grid | [myloops] |
| hat variation | ghost-note probability "40–70%", spine notes "100%", velocity "±15–20" | [myloops] |
| polyrhythm | "set its clip length to 3 bars, 5 bars, or 7 beats" | [myloops] |
| filter movement | "sine LFO, rate around 0.05–0.08 Hz (roughly 12–20 seconds per cycle), unsynced, routed to a low-pass cutoff" | [myloops] |
| macro automation | "automate it deliberately over 32 or 64 bars" | [myloops] |

---

## §3 WHAT THE PROGRAM ACTUALLY DOES — measured, `2026-08-09e`

`node harness/probe_static.js plastikman 6`, plus a per-part and per-lane bar
census over seeds 1–20.

### What is already RIGHT, and should not be touched

| | measured | the source it matches |
|---|---|---|
| tempo | 127 | 122–128 [melodigging] |
| section lengths | **only 16 and 32 bars** — 153 of 183 sections are 32, the rest 16, and nothing else occurs | "16 and 32 bar blocks" [tracksensei] |
| length | 269 bars ≈ 8.5 min | 195 bars ≈ 6 min is the reference; longer is normal for minimal |
| parts sounding at once | **3.02 mean**, 90th percentile 4.0 | "four or five elements total" [tracksensei] |
| bass pitch content | **2.7 distinct pitches in a whole song** (min 1, max 5) | "one low-frequency idea", root-and-fifth |
| the rim and the clap | declared polymetric, 7 steps and 5 steps against a 16-step bar | **"set its clip length to 3 bars, 5 bars, or 7 beats"** [myloops] — and Hood's "rhythms inside of rhythms" [rbma] |
| the swing | `swing 0.06`, lane lean on hat/ghost in the 3–6 ms region | "5 to 15 percent late" [tracksensei], "5–15 ms" [myloops] |

**The polymetric rim and clap are the single most correct thing in this genre**
and they are the reason the drums feel right. They are also the thing most
likely to be mistaken for a fault by a bar-census, which §5 covers.

### What is WRONG

**1. THE RECORD NEVER REPEATS ITSELF, AND THIS GENRE IS ABOUT REPEATING.**

```
LONGEST UNCHANGING RUN   1.0 bars
HOW MANY DIFFERENT BARS  100.7 distinct pictures in 293 bars
```

Every bar of a Plastikman record is different from the bar before it. The
sources put the rate of change at **"every 4 to 8 bars, move one thing"**
[tracksensei] and **"each 32 bar block adds or subtracts one element"**
[tracksensei]. The program is moving something every bar, roughly eight to
thirty times too often, and it is the one genre in the file whose identity is
patience.

This is not the polymeter. Per lane, over seed 1 (208 bars):

| lane | different bar-patterns | longest identical run | verdict |
|---|---|---|---|
| rim | 66 | 1 | **correct** — declared 7-step polymeter |
| clap | 48 | 1 | **correct** — declared 5-step polymeter |
| kick | 21 | 7 | **wrong** — "boringly consistent on purpose" [myloops] |
| hat | 35 | 4 | questionable |
| openhat | 10 | 7 | fine |
| ghost | 15 | 1 | declared by `kit.answer`, see §5 |

**2. THE CHORD KEYBOARD IS PLAYING A DIFFERENT PART IN EVERY SINGLE BAR.**

`keys` emits **835 events a song** across **49–64 distinct bar-patterns**, with a
**longest identical run of 1 bar** — in all three seeds inspected. The genre
declares `comp: 1`, the full comping keyboard.

Against: harmony should be "muted chord stabs … used as texture rather than
focal hooks" [musicradar], "one or two tonal centers or a single pedal tone"
[melodigging], "brief motifs and stabs that evolve subtly rather than develop
into full themes" [melodigging]. A part that plays a new voicing every bar for
eight minutes is a comping pianist, and it is the loudest wrong thing in the
genre.

**3. THE KICK MOVES.** 21 different kick patterns in one record. Every source
that mentions it says the opposite: "kick and sub remain static (boringly
consistent on purpose)" [myloops], four-on-the-floor held "for the majority of
your track, besides in the breakdown" [edmprod].

**4. CHANGE IS COMPOSED, NOT MODULATED — and the sources are explicit that it
should be the other way round.** *"Changes happen through modulation, not
composition"* [tracksensei]. The way this genre is supposed to stay interesting
across eight minutes is **a free-running filter LFO at 0.05–0.08 Hz, unsynced to
tempo, so "every time you hear that element, it's in a slightly different tonal
state"** [myloops] — plus sends and drive automated over 32–64 bars. The program
answers the same problem by drawing new notes. It has the machinery for the
other way (the motion system, p-locks, the matrix, the sends) and this genre
should be leaning on it almost exclusively.

---

## §4 TECHNO IS NOT MINIMAL TECHNO, and the program has neither

The file has `acid` (acid house) and `plastikman` (minimal techno). It has **no
techno**. The sources separate them cleanly:

| | minimal techno | club/warehouse techno |
|---|---|---|
| tempo | 122–128 [melodigging] | 128–135, peak 130–134 [tracksensei] |
| elements | kick, sub, "one or two percussive or textural elements" [artist.tools] | four or five [tracksensei] |
| bass | "carried by the kicks", little or no separate synth bass [musicradar] | a rolling 16th sub, "leaving the first 16th-note of every beat empty" [attack] |
| harmony | one pedal tone [melodigging] | sparse stabs; still essentially static |
| structure | long-form, "tension and release over big drops" [melodigging] | DJ intro / breakdown / drop, 16–32 bars each [edmprod]; **the kick drop, "pulling the kick out for 8 to 16 bars before the peak"** [tracksensei] |

**The kick drop is the one mechanism techno has that this program has nothing
like** — it is named as "the single most powerful move in the genre"
[tracksensei], and it is the opposite of the drum arc's rule that the kick holds
every strong beat. It is a hard law being broken on purpose, which is exactly
what `breaking-the-rule.md` §3 says a break should be.

**Whether to add a `techno` genre is the owner's call and is NOT assumed here.**
The case for: it is a different tempo, a different bass, and it owns a mechanism
nothing else does. The case against: nine genres is a lot, and minimal techno
fixed properly may be most of what was wanted.

---

## §5 TWO FINDINGS I NEARLY WROTE DOWN AND BOTH WERE WRONG

Recorded because the near-misses are the useful part, and because both came from
asking the wrong object.

**"Minimal techno declares no snare and plays 25 a song."** It plays 25 a song in
20 of 20 songs, and `kit.snare` is `[]`. But `variants.lift` declares
`snare: [12]` — one added hit for a lift, sourced to Hawtin. **Declared, not
leaked.** I read `snare: []` off a *composed chart* and treated it as the genre's
whole declaration; a chart has a variant already applied to it.

**"It declares `ghostChance: 0` and plays 219 ghosts a song."** Also true, also
not a defect: the ghosts come from `kit.answer` —
`{ lane: "ghost", watch: ["rim","clap"], every: 3, notOn: ["kick"], vel: 0.38 }`
— the mechanism that answers the polymetric lanes. `ghostChance` is a different
road to the same lane and it is correctly zero.

**The general lesson, and this file has it three times now:** ask the thing, and
be sure which thing you are asking. A genre has a base table, variants, an arc
and a taste table, and any one of them read alone will contradict the record.

---

## §6 WHAT WOULD CLOSE THIS

In the order the measurements justify, all of it for `plastikman` unless said:

1. **Make the record hold still.** The target from the sources is one change
   every 4–8 bars and one element per 32-bar block, against a measured one
   change per bar. This is the big one and it touches how variation is drawn
   for a `vary: false`-shaped genre.
2. **Take the comping keyboard out of minimal techno**, or reduce it to stabs.
   835 events a song of freshly-voiced chords is a pianist, not a pad.
3. **Freeze the kick.** 21 patterns → 1, with the breakdown as the only exception.
4. **Move the change from the notes to the filter.** A free-running, un-synced
   LFO at 0.05–0.08 Hz on a lowpass, plus sends and drive automated over 32–64
   bars. The program has the motion system; this genre should be its heaviest
   user and currently is not.
5. **Decide whether `techno` becomes a ninth genre**, and if so it brings the
   kick drop with it.

**Nothing in this file has been built. It is research and a measurement, and
items 1–3 in particular change what the genre sounds like, which is a taste call
the owner should make before anyone writes a line.**
