# How a dissonance is arrived at — writing the other half of the law

*Researched 2026-08-05. HANDOFF §9.5 has named this "the law this repo measured
and did not write" since 2026-08-04, and `BACKLOG.md` §6.3 carries the same row:
"a dissonance is constrained on the way out and not on the way in". The user:
"Music theory is the physics engine, held together by constraints. Decisions
about laws are yours to make and write down, not to hand back to me." This sheet
decides it.*

**Fresh research, not a re-reading of what was already here.** The repo's prior
work on this subject is one measured number — Bach's 96.8% — sitting in
`counterpoint-measured.md` §3 with no rule attached and no taxonomy behind it.
Everything in §2 and §3 below is new, from named sources, and §3 is a genuine
conflict between two of them that had to be decided rather than averaged.

---

## 1. THE LAW AS IT STANDS, AND THE HALF THAT IS MISSING

The program has a **departure** law, built 2026-07-30 and live in `buildTheme`
and `deriveCounter`: when the note just written is outside the chord sounding
under it, the next note's choices are narrowed to one scale step. It is a
constraint at the choice, never a repair, and **it works** — that is worth
saying plainly before proposing anything, because the temptation with a
half-built law is to report the built half as broken.

What has never existed is any rule about how a dissonance is **reached**. The
walk draws its move from `[[0,2],[dir,5],[dir*2,2],[-dir,2]]` — repeat, step,
third, step-back — and nothing has ever asked what the note it lands on is.

---

## 2. THE TAXONOMY SORTS EVERY FIGURE BY ITS APPROACH

Read the approach column; it is the whole finding.

| figure | approached by | left by |
|---|---|---|
| passing tone | **step** | step, same direction |
| neighbour tone | **step** | step, opposite direction |
| escape tone | **step** | leap, opposite direction |
| anticipation | **step** | same note |
| suspension | **same note** | step down |
| retardation | **same note** | step up |
| pedal point | **same note** | same note |
| **appoggiatura** | **leap** | step |

[corpus:musictheory.pugetsound Table 10.1.1 — *Introduction to Non-Chord
Tones*; corpus:openmusictheory *Embellishing tones*] **`[two sources]`**

**Eight figures. Seven are approached by step or by repetition. Exactly one is
approached by a leap, and it is the appoggiatura.**

That is the same shape of finding as `the-note-that-does-not-belong.md` §2,
which established that every figure is defined by its *motion* rather than by
the chord under it. This sheet is the other side of the same coin: that motion
has two halves, and the program only ever looked at one of them.

### And species counterpoint states it as a prohibition with named exceptions

> **"No leap to dissonance"** — listed as a primary rule, with exactly four
> exceptions: an unaccented leap to an **anticipation**; a leap **between
> essential tones** (both notes belong to the sounding harmony, so neither is a
> dissonance); the **cambiata**; and the **appoggiatura**, "an upward leap to an
> accented dissonance, followed by a downward stepwise resolution".
> [corpus:ars-nova *Dissonance handling — Species Counterpoint*]

Same answer from the other direction: the leap onto a clash is not forbidden,
it is *named*, and the name carries an obligation.

### What the sources do NOT give, said plainly

I searched for an equivalent rule in jazz and popular-music voice leading,
because this program writes lofi, synthwave, a game score and a film cue and
not one chorale. **The search did not produce one.** The pop and jazz sources
that came back discuss leaps as a melodic-shape question ("prepare a large leap
on at least one side", "avoid augmented intervals") and do not state a rule
about leaping onto a non-chord tone at all. So the prohibition in this sheet is
**common-practice in origin and is not corroborated outside it**, and §5 says
what that costs the law it justifies.

---

## 3. THE TWO SOURCES DISAGREE ABOUT THE APPOGGIATURA, AND IT MATTERS

This is the one place the research forked, and both sides are reputable:

> **"approached by leap (usually up), and followed by step (usually down, but
> ALWAYS IN THE OPPOSITE DIRECTION of the preceding leap)"**
> [corpus:openmusictheory *Embellishing tones*]

> **"The leap to and step away from any appoggiatura CAN BE FROM ANY
> DIRECTION"** — with a Mozart example that leaps up and resolves up.
> [corpus:musictheory.pugetsound *Appoggiatura*]

**DECIDED: take the loose reading — the step out is required, the direction is
not.** Two reasons, and the second is the stronger:

1. The loose statement is from the *same publication* as the approach table in
   §2. Taking that table and then rejecting its own companion page on the one
   point where it is inconvenient would be choosing the evidence to fit the
   rule.
2. **A law nobody can break is worth having; a habit dressed as a law just
   removes seeds** (HANDOFF §2, principle 2). Direction-of-resolution is
   contested between two sources of equal standing, so it is a habit. The step
   out is not contested by anyone, so it is the law.

Both numbers are measured and reported separately in `probe_arrival.js`, so
whoever wants to revisit this has the cost of the strict reading in front of
them rather than having to re-derive it.

---

## 4. WHAT THE PROGRAM ACTUALLY DOES — measured before deciding anything

`harness/probe_arrival.js`, new, 20 seeds a genre, lead and counter, 5386
dissonances. It reads the chord from what the comp is *sounding* at that
instant, exactly as `probe_theory` does, so the two probes agree about which
notes are dissonances and differ only in which side of them they look at.

```
  genre          dissonances   by step   by repeat   by leap   of the leaps:
                 (approached)                              step back  step on  LEAPT  (phr.end)
  lofi                  707      71.3%      12.9%     15.8%      29.5%   25.9%  16.1%   28.6%
  synthwave            3215      64.0%      17.2%     18.8%      23.7%   28.8%  18.0%   29.5%
  dkc                  1045      77.1%      12.4%     10.4%      15.6%   34.9%  14.7%   34.9%
  bladerunner           419      67.1%      18.4%     14.6%      16.4%   26.2%  19.7%   37.7%
  TOTAL                5386      67.7%      15.8%     16.5%      22.9%   29.0%  17.5%   30.6%
```

**83.5% of dissonances arrive by step or by repeat** — inside the taxonomy's
uncontested set. **16.5% arrive by leap, against Bach's ~3.2%**, so the program
leaps onto a clash about five times as often as the corpus this repo measured.

Of those leaps, under the reading decided in §3: **51.9% are appoggiaturas**
(they step out, either direction) and are real writing that should be left
alone. The remaining 48.1% — **7.9% of all dissonances** — are leaps onto a
clash that do not step out.

### Three genres read zero, and the zero is real

acid writes a lead but declares no comp, so there is no chord for a note to be
outside of. plastikman and jungle write neither a lead nor a counter — the law
has nothing to address in either. The probe derives and prints which of the two
it is, rather than showing a bare dash that reads like a broken measurement.

### TWO CORRECTIONS I MADE TO MY OWN MEASUREMENT BEFORE BELIEVING IT

Both are the documented failure mode — the probe measuring its own setup — and
both inflated the defect in my favour, which is why they are recorded.

- **The first version had no phrase-end column** and counted a dissonance
  followed by a rest as one that failed to step out. That is exactly the trap
  `probe_theory` documents in the other direction, where 81% of one genre's
  "unresolved" dissonances turned out to be phrase endings. It read 48.1% of
  leaps as never resolving; with the endings separated, the figure is 17.5%.
- **My first write-up of this said "12.7% of every dissonance is a figure with
  no name".** That used the strict reading of §3 and counted the endings as
  failures. Under the reading actually decided, and with the endings counted
  apart, the number is **7.9%**. The smaller number is the true one.

### And the residue is mostly a defect that is already on the books

Of the 155 leap-in/leap-out cases in 80 songs, **41 are the counter jumping two
octaves** — `octaves: [-12, 12]` taking whichever end fits the band, already
recorded in `BACKLOG.md` §6.5 as its own `[EAR]` row and not this law's
business. Another 64 are a dissonance followed by the *same pitch repeated*.
The genuinely arrival-shaped residue is about 50 cases in 80 songs, which is
under 1% of dissonances. **The leap-in-leap-out case is not the problem; the
leap-in-and-nothing case is.**

---

## 5. THE LAW, DECIDED

> **A note outside the chord sounding under it may be LEAPT onto only when
> something follows it closely enough to resolve it. Otherwise the leap narrows
> to a step.**

That is the taxonomy of §2 written as a rule. It admits the appoggiatura — the
one figure that leaps in — on the one condition every source attaches to it,
and it converts every other leap onto a clash into a step onto a clash, which
is a passing tone or a neighbour and which no source has ever objected to.

**"Closely enough"** is the same test the departure law's own measurement uses:
the next onset begins no later than one sixteenth after this note stops
sounding. A dissonance that has died away is not hanging — that is established
in this repo already — but it is also not *resolved*, and a leap onto one is
the arrival with no figure behind it.

### Why this is a narrowing and not a throw

The out-of-key law throws, because it is about **spelling**: a note either is
or is not in the harmony, and there is always another note. This is about
**motion**, and a motion constraint can be unsatisfiable — which this project's
own front door states as a rule: *"a constraint that can be unsatisfiable must
be a cost"* (`START-HERE.md`), a mistake made and fixed at least three times.

So the tune **narrows the move** — a leap becomes a step in the same direction,
which is always available in a seven-note scale and therefore can never fail —
and the counter, whose candidates are a short list drawn as intervals from the
lead, takes it as a **cost** in the list it already scores. Same law, two
shapes, for the reason the two sites differ: the tune chooses a *move*, the
counter chooses from a *list*, and a filter on a short list can empty.

### What it deliberately does NOT do

- **It does not impose Bach's 96.8% on genres that are not chorales.** §2's
  closing paragraph is honest that the prohibition is common-practice in origin
  and was not corroborated in jazz or popular sources. So the law removes the
  arrivals that *no* reading defends and leaves the appoggiatura rate to the
  music. If the ear later wants fewer leaps than that, it is a weight in the
  move draw, not this law.
- **It does not touch the direction of resolution** — see §3.
- **It does not chase the counter's octave flip.** That is a different defect
  with its own row in the backlog, and folding it in here would put two changes
  inside one measurement.

---

## 6. WHAT WAS BUILT AND WHAT IT MEASURED — build `2026-08-05e`

**Two sites, one law.** `buildTheme`'s `phrase()` narrows its move; the walk
draws from `[[0,2],[dir,5],[dir*2,2],[-dir,2]]` and a drawn `dir*2` onto a
dissonance becomes `dir`. `deriveCounter` takes it as a cost in the candidate
list it already scores, weighted **equal to** the contrary-motion term because
the two are habits of the same standing. `deriveCounter`'s own hang test now
calls the same expression instead of keeping a second copy of it — the
departure half and the arrival half must never be able to disagree about which
notes are dissonances.

### Asked at the bar's last onset, and that is not a compromise

Every other onset already has its resolution guaranteed: `plannedDur` **is** the
gap to the next note, so the note runs into its successor and the departure law
forces that successor to a step. A leap onto one of those is a genuine
appoggiatura and is left alone on purpose. The bar's last onset has no such
guarantee. Reaching past the bar for the next one would mean drawing that bar's
steps early, which reorders the stream and moves songs nobody touched [Law 3].

### AND NARROWING THE MOVE WAS NOT ENOUGH — I guessed, and the guess was wrong

I wrote "0.7%" into a code comment before measuring it. Measured, the narrowing
alone left the constrained population at **7.4%** against 9.5% unconstrained,
and the residue was **not drawn leaps at all**: `intoBand` folds a pitch back
inside the register by whole octaves and the seat-finding walk steps it
further, so a move of one scale step can land eleven semitones from where it
left. The law is now asked of **the interval that actually sounds**, after
every hand that can move the note has moved it, and the answer is to DROP —
the precedent `the-note-that-does-not-belong.md` §4b set at this same fold.

```
  bar-final lead onsets landing on a dissonance, 20 seeds x 7 genres,
  the share arrived at by LEAP:

    unconstrained                   9.5%
    narrowing the move only         7.4%     <- what I predicted would be ~0
    asked of the interval sounded   4.8%
```

### Overall, on the performance (`probe_arrival`, 20 seeds a genre)

```
                       before   after
  arrive by step       67.7%    70.0%
  arrive by repeat     15.8%    15.7%
  arrive by LEAP       16.5%    14.3%
  leaps that never step out, as a share of all dissonances
                        7.9%     6.7%
```

Cost: 6342 lead notes in the materials become 6315, **0.43% fewer**.

### THE SEAM CHECK, AND TWO VERSIONS OF IT THAT WERE WRONG

Recorded because both failed in ways this project already has rules about.

1. **A threshold on the whole population cannot work here.** The law fires only
   at bar-final onsets, so across every dissonance its effect is two points —
   and any line drawn through a two-point gap measures the seed draw.
2. **Comparing bar-final arrivals to mid-bar ones looked beautiful and was
   noise.** At 20 seeds the law appeared to *flip* which slot was riskier
   (9.5% vs 7.0% becoming 4.8% vs 6.8%). At the 8 seeds the check actually
   runs, the unconstrained build reads 7.1% vs 10.3% — the other way round.
   **The check passed with the law removed.** It was watched failing to fail,
   which is the only reason it is not in the file.

What shipped is structural rather than statistical: a bar-final onset landing
on a dissonance, whose in-bar predecessor was **consonant** (so the departure
law was not the one in charge), reached by more than a step. Driven to failure
both ways: **0.9% of 109 with the law, 9.7% of 113 without.**

### Blast radius

636 of 2100 seeds moved; **form and arrangement hashes identical on every
one**, which is the right shape for a melodic change. lofi 119, synthwave 93,
dkc 222, bladerunner 144, acid 58, **plastikman 0, jungle 0** — the last two
compose a lead their arrangement never plays, so their material moved and their
record did not. Re-baselined `c3abd9c25331528c`.

Per role, 30 seeds × 7 genres: 30 of 41 role/genre pairs byte-identical, and
every mover is `lead` or `counter` **except dkc's bass, keys and ostinato**.
That was checked rather than waved through: dkc is the only genre on the `sega`
rig, whose YM2612 has six FM channels and **refuses** notes when the budget is
full, so a changed lead reallocates the budget. Note *counts* move and not just
durations, which is what refusal looks like.

---

## 7. STILL OPEN, HONESTLY

- **THE EAR HAS NOT HEARD IT.** Every number above says the arrivals changed
  and none says the tunes sound better. `BACKLOG.md` §0 and the sax precedent.
- **The effect is small and the reason is structural.** Only the bar's last
  onset lacks a guaranteed resolution, so only it is constrained. Whether the
  genres should also leap onto clashes *less often in general* — Bach's 3.2%
  against this program's 14.3% — is a weight in the move draw and a taste
  question, not this law.
- **The first note of a phrase has no arrival at all.** `hang` and the previous
  pitch both reset per phrase, so the law cannot see across the join even
  though the ear can. Fixing it means carrying two values across phrases, which
  is a real change to `phrase()`'s contract and wants its own commit.
- **The counter's octave flip is untouched and is the larger arrival defect on
  that part** — 41 of the 155 leap-in/leap-out cases are `octaves: [-12, 12]`
  taking whichever end fits the band. `BACKLOG.md` §6.5 owns that row.
- **`acid` is measured as having no dissonances at all** because it declares no
  comp, so its lead is judged against the written chord only. That is honest
  but it means the law reaches acid through a weaker test than the other four.
- **The residue is 0.9%, not 0**, and it has not been chased. It is believed to
  be the derivation following its DNA and the phrase pickup, which is a belief
  and is marked as one.

---

## Sources

- [Introduction to Non-Chord Tones (Table 10.1.1) — Music Theory for the 21st-Century Classroom, Puget Sound](https://musictheory.pugetsound.edu/mt21c/NonChordTonesIntroduction.html)
- [Appoggiatura — Music Theory for the 21st-Century Classroom, Puget Sound](https://musictheory.pugetsound.edu/mt21c/Appoggiatura.html)
- [Embellishing tones — Open Music Theory](https://elliotthauser.com/openmusictheory/embellishingTones.html)
- [Dissonance handling — Species Counterpoint, Ars Nova](https://www.ars-nova.com/cpmanual/dissonancerules.htm)
- [Basic counterpoint — Fundamentals of Music Theory](https://fiveable.me/fundamentals-of-music-theory/unit-13/basic-counterpoint/study-guide/Eb0J3Eas0mR6dccG)
- [Melody Guidelines — The Donaldson Workshop](http://www.donaldsonworkshop.com/coriakin/melody.html) *(the pop/melodic search that did NOT produce a leap-to-dissonance rule; recorded because the absence is part of the finding)*
- `docs/genre-research/counterpoint-measured.md` §3 — this repo's own measurement of 382 Bach chorales
- `docs/genre-research/the-note-that-does-not-belong.md` — the companion law, decided the same way
