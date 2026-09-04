# The alterations: every way to restate something without rewriting it

The rule of three says the third hearing must differ. It does **not** say the
third hearing must be different music. "The change may be delivered at a
different level than the repetition that demanded it. A third chorus does not
need new chorus *notes* — it can be answered by an arrangement change"
(`docs/FORM-RESEARCH.md`, Part 2, on `origin/main`).

This program has only ever answered it one way. `src/stage/material/vary.ts`
offers five operations — thin, augment, invert, retrograde, sequence — and
every one of them removes notes or moves pitches. So satisfying the rule always
costs new material, and the measurement says what that costs: over sixty seeds,
**31% of materials are heard exactly once**, 33% of variants are heard once, and
in **60% of records the peak is built on material the listener never hears
again**. An idea has to be stated twice before anyone can hold on to it; this
program keeps spending them on the second.

The fix is not a better variation operator. It is a pool of changes that leave
the notes alone, so an idea can come back a fourth and fifth time and still
arrive different. `FORM-RESEARCH.md` Part 3 names six — strip, double,
half-time, fill-into, empty-before, re-orchestrate — and six is what one
paragraph happened to list, not the size of the space.

Below is the space. Sixty-five moves in eleven layers, every one of which keeps
the pitches exactly as written.

**Legend.** ● the machinery exists in MKIII and is honoured by the renderer —
it simply cannot vary across a record. ◐ partly there. ○ needs building.

---

## 1. Who plays it — orchestration

The notes do not change; the thing making them does.

| | move | |
|---|---|---|
| 1 | **Re-orchestrate** — the line moves to another voice (the flute's phrase given to the organ) | ● `sound.voices` maps role → voice, one map per record |
| 2 | **Octave double** — a second voice on the same line, ±12 | ○ |
| 3 | **Unison double** — two voices, the same pitches, thicker | ○ |
| 4 | **Hand-off** — voice A takes the first half of the phrase, voice B the second | ○ |
| 5 | **Carrier swap** — the tune's usual part drops out and another part plays those notes | ○ |
| 6 | **Expose** — everything else out underneath it for its length | ◐ `strip` reaches the floor, never below |
| 7 | **Voice substitution** — the same role on a different synthesised voice | ● six voices exist |

## 2. How many play — density

The pool `arrange.ts` already has, plus the two the research named and nobody built.

| | move | |
|---|---|---|
| 8 | **part-out** | ● |
| 9 | **part-back** | ● |
| 10 | **all-back** — everyone at one moment | ● |
| 11 | **strip** — down to the genre's floor | ● |
| 12 | **empty-before** — everything out for the bar before the change, so the next downbeat arrives from nothing | ○ exists as a one-beat drum device (`drums.ts:110`), never at the seam |
| 13 | **fill-into** — the drums lead into the return | ○ same: a bar-level letter, not an arrangement move |

## 3. The clock — every note kept, in order

| | move | |
|---|---|---|
| 14 | **Half-time** — the same material over twice the bars | ○ |
| 15 | **Double-time** | ○ |
| 16 | **Half-time feel** — the drums halve, everything else holds | ○ |
| 17 | **Metric displacement** — the figure enters a beat later, or earlier | ○ |
| 18 | **Truncation** — the last bar of the repeat is chopped and the next thing begins there | ○ note 002's odd phrasing, the transition ingredient |
| 19 | **Extension** — a bar added, the closing note held across it | ○ |
| 20 | **Anacrusis** — the phrase arrives early, before the downbeat | ○ |

## 4. The hand — manner and weight

Nothing here touches a pitch. All of it is `articulation.ts` and `feel`, which
already exist per genre and are drawn per material.

| | move | |
|---|---|---|
| 21 | **Articulation swap** — a slurred wind line played tongued, or tenuto | ◐ per material, not per return |
| 22 | **Ghosting** — the line at greatly reduced weight | ● `ghost` |
| 23 | **Accent shift** — which notes are leaned on | ● |
| 24 | **Dynamic terrace** — the part a step quieter, or louder, for this hearing | ● **and it moves**: `Span.hush` holds one part back by `ARC_DEPTH`, what the arc itself takes off at its quietest. It is a GAIN and nothing else, which is what makes it legal per span — see below |
| 25 | **Crescendo** across the section rather than a flat level | ○ |
| 26 | **Lean** — the part plays further behind or ahead of the beat | ● `feel.lean` |
| 27 | **Phrase shape** — more or less arch across the loop | ● `F.phrase` |

## 5. Register — pitch classes kept

| | move | |
|---|---|---|
| 28 | **Octave transposition** of the whole part | ○ registers are per genre |
| 29 | **Voicing spread** — the same chord tones opened out | ○ |
| 30 | **Voicing inversion** — same notes, a different one in the bass | ○ |

## 6. What is underneath — the tune untouched

| | move | |
|---|---|---|
| 31 | **Reharmonise** — the same melody, new chords under it | ○ |
| 32 | **Bare fifths** instead of triads | ● `harmony.fifths` |
| 33 | **Pedal point** — the bass holds one note under a progression that used to move | ○ |
| 34 | **Drone tone** — tonic ↔ fifth | ● `drone.tone`, drawn per material |
| 35 | **Bass tone** — root ↔ fifth ↔ octave | ● `bass.tones` |

## 7. The room — MKIII's world

Every one of these exists, is drawn on the radar scope, and never moves.

| | move | |
|---|---|---|
| 36 | **Azimuth** — the flute crosses the room | ● **and it moves**: `orbit`, which reflects a part across the centre line, so a part dead centre is refused for having nowhere to cross to |
| 37 | **Distance** — a part steps closer, or further off | ● **and per part**, as written here: `far` is offered aimed at one part as well as at the band |
| 38 | **Width** | ● |
| 39 | **Depth** | ● |
| 40 | **Sweep depth** — the slow drift left and right | ● |

## 8. The desk — the sound stage

This is the largest untapped layer by far, and it is the one dungeon synth's own
literature asks for by name: the *development* section is where you "deepen the
shadows of the sound through changes in reverb and filters" (note.com/soundwitches).
A desk move, not a note move — and the one move this program cannot make.

| | move | |
|---|---|---|
| 41 | **Sends** — five returns, per part | ● **and per part**: `drench`/`dry` are offered aimed at one part as well as at the band |
| 42 | **Filter** — the pole's cutoff down for a darker hearing | ● |
| 43 | **Pedal feed** — a part walks more or less of the board | ● **and per part**: `push`/`ease` likewise |
| 44 | **Pedal swap** — a different stompbox lit for this section | ● **and it moves**: `stomp`. Lit from COLD is the one thing it cannot mean — a pedal at mix 0 is off the board, and `treat.ts` already refuses to overrule a genre that way — so the swap happens inside the board the genre carries: first box in cable order down, last one up |
| 45 | **Patch** — a return fed into another return | ● **and it moves**: `repatch` feeds the busiest return this record actually uses into the next busiest |
| 46 | **Echo** — time in beats, feedback | ● |
| 47 | **Reverb decay** — a longer room for the peak | ● **and it moves**: `linger`. `drench` sends MORE to the room; this makes the room BIGGER. The reverbs' `sec` was the one leaf of the rack nothing pointed at while `ret` had two moves aimed at it, and it was missed because the row was already marked ● |
| 48 | **Tape** — drive, wow depth | ● |
| 49 | **Medium** — gramophone or radio across a section | ● **and it moves**: `medium`. Both genres carried this at mix 0 — built, wired, never once turned up |
| 50 | **Vinyl** — dust | ● |
| 51 | **Modulation** — tremolo, phaser, ensemble depth | ● **and it moves**: `waver`, all three together, scaled from what the genre set so a genre running none of them is refused |

## 9. The machine — drums, notes unchanged

| | move | |
|---|---|---|
| 52 | **Kit swap** — acoustic ↔ analog | ● **and it moves**: `rekit`. lofi weights it lowest of its machine moves; dungeon synth does not state it at all, per this file's own warning below |
| 53 | **Circuit swap** — 808 ↔ 909 | ● **built and correctly unreachable**: `recircuit` refuses unless the analogue kit is loaded, and both genres play the acoustic one. Treatments are absolute, so `rekit` cannot chain into it either. It comes alive for a genre that loads the analogue kit |
| 54 | **Lane tune / decay** offsets | ● **and it moves**: `slacken`, the kit tuned down and left to ring |
| 55 | **Lane level**, or a lane out | ● **and it moves**: `spotlight`, the snare up and the rest down, so the kit leans on its backbeat |
| 56 | **Per-lane send** — one drum into a return the rest of the kit does not feed | ● **and it moves**: `soak`, the snare into the busiest return this record actually uses |

## 10. What answers it — new sound, no new pitches

These four come from the transcripts and use material the record already has.

| | move | |
|---|---|---|
| 57 | **Inner voice echo** — the accompaniment answers in the melody's gaps, using the melody's own fragments (note 003) | ○ |
| 58 | **Support withdraws at the climax** — the counter-line stops so the tune is unobscured (note 003) | ○ |
| 59 | **Foreshadow** — the hook's pitches, reduced, on another voice in an earlier section (note 009) | ○ |
| 60 | **Coprime ornament loop** — a 5- or 6-bar figure against the 8-bar grid, drifting and realigning (note 008) | ○ |

## 11. The seam — how the repeat is entered and left

Note 005: every transition has two sides, an exit and an entry, and both want treatment.

| | move | |
|---|---|---|
| 61 | **Partial variation** — the first half identical, the second half diverges. `FORM-RESEARCH.md` calls this "the most useful one for a generator" | ○ `vary.ts` transforms whole lines only |
| 62 | **Riser** into the return | ○ |
| 63 | **Reverse reverb** into it | ○ |
| 64 | **Silence** on the exit side | ○ |
| 65 | **Elision** — one section's cadence *is* the next one's downbeat, so energy never drops | ○ |

---

## What the tally says

| | moves | already built |
|---|---|---|
| the desk, the room, the machine (§7–9) | 21 | **21, and all 21 now MOVE** |
| the hand and what is underneath (§4, §6) | 12 | 9 |
| density (§2) | 6 | 4 |
| orchestration (§1) | 7 | 2 |
| the clock, register, answers, seams (§3, §5, §10, §11) | 19 | 0 |
| **total** | **65** | **36** |

Thirty-six of sixty-five are already implemented, tested, and rendered — and not
one of them can vary across a record, because `src/sound/render.ts` never sees a
section. The desk is one frozen object for the length of the piece.

So the cheapest large win in this program is not writing new operators. It is
letting the arrangement stage move the machinery that already exists.

## What was built

Twelve of them, from §7–8 and one from §4 — the layers that needed only the
plumbing, not new material operators. `stage/treat.ts` holds what each does to
a desk; `TREATMENTS` in `genre/spec.ts` is the vocabulary a genre states
weights over.

    darken   brighten     the filter, which is the move this genre's own guide names
    drench   dry          the returns, and every part's send with them
    push     ease         how much of the pedal board a part walks
    widen    close        the world's width, and the band's distance in it
    far      sweep        further off; the slow drift left and right
    wear     echoed       the tape and the dust; the echo's return and feedback

Three rules hold for all of them. Each is a **pure function of the genre's own
desk** and absolute rather than relative, so treatments cannot compound or
depend on the order they were applied in. Each is **bounded by the knob's own
range**, because `settle` is a merge and not a validator and nothing downstream
re-checks a value laid over a genre. And each is **refused where it would do
nothing** — lofi is never offered `sweep`, because its `sweepDepth` is zero for
every part and three times zero is zero. A move that changes nothing is worse
than a knob that does nothing: the two-loop rule spends a boundary on it and
the ear hears the section repeat at exactly the moment it was promised a change.

**How they reach the record.** `Span` carries a treatment beside its roster.
`perform.ts` turns the arrangement's spans into a timeline of moments in
seconds — one entry per *change*, not per span. `render.ts` holds that
timeline and splits its own block at the sample a change falls on, so
`block(L, R, n)` still fills `n` and no caller learns that this happens. That
last part is the whole reason it is done at a sample and not a block boundary:
the record is the same bytes whether it was made in blocks of 8192 or of 577,
which is what the tests hold it to and what makes what you hear and what you
save the same record.

**What it cost, measured.** Sixty seeds a genre:

| | |
|---|---|
| spans on a treated desk | 33% dungeon synth, 36% lofi |
| records using at least one | 60/60 and 54/60 |
| distinct treatments used | all 12, and 10 |
| boundaries: desk / part-out / hold-back / let-out / part-back | 64% / 17% / 14% / 4% / 2% |
| boundaries with no move available (`stuck`) | 0 |
| parts in bar one, thinnest section, fullest, energy spread | **unchanged** |

The last row is the one to check. Treatments compete only for the span
boundaries *inside* a section, where the debt is ambivalent and a density move
is not clearly indicated; every section-level number — who opens, how thin the
thinnest section gets, how full the fullest — is identical to what it was.
The arrangement did not stop moving its parts; it stopped being unable to do
anything else.

**And what the first attempt got wrong**, because it is the trap this whole
document warns about. A treatment was first scored on its own shape alone,
reaching 1 where a density move's score can never exceed one part of five. It
outbid them about five times over, and a record came out with fifteen desk
moves against two of everything else — a section changing colour every eight
bars and never losing a player, which is the oscillating texture again in
better clothes. A treatment is now priced at what this file already prices the
drums' expression at: half a part.

## What the repetition law allows, and what it does not

§3, §4 and §5 are performance moves, and there is one law they have to get
past. `perform.ts` addresses the hand by the material and the position inside
it so that a figure played again is played the same way — Huron and Ollen put
literal repetition at about 94% of passages across five continents and five
centuries — and `perform.test.ts` holds the groove to it. Measured, **76% of
lofi's repetition pairs and 44% of dungeon synth's straddle a span boundary**,
so a per-span change to how the groove is played breaks that law on most of
what it checks.

But look at what the law actually compares: `role`, `lane`, `step`, `pitch`,
`art`, `playedStep`. **Gain is not in it**, and never was — the arc already
moves a note's weight bar by bar under the same law. So:

| a move that changes | grain it may work at |
|---|---|
| the weight of a note | any — per span is fine |
| the articulation, the timing, the pitch, the step | the SECTION, or the two turns of a pair differ |

That is why `hush` is a span move and an articulation swap cannot be, and it is
why §4's own rows say "for this **hearing**" and "across the **section**". A
hearing is a section. `thin` was never the general case — it is safe only
because it drops HATS, and the law's comparison covers `bass`, `keys` and
`drone` by name.

## And what the machine needed that the rack did not

`deskOf` refuses a treatment that would not change the DESK. That is the right
question for §7 and §8 and the wrong one for §9: swapping a kit changes the
machine whether or not anybody is playing it, so a machine move passes that
test and is still inaudible where the drums are silent. A boundary spent on a
move nobody can hear is worse than a knob that does nothing — the two-loop rule
paid for it and the ear gets the section repeated instead. The arrangement
therefore asks whether the drums are sounding before offering one, and a test
holds it to that.

## What "per part" turned out to be worth

Moves 37, 41 and 43 say *a part* — and this program applied all of them to the
whole band, which is a move this catalogue does not list. Making them what they
say fixed something else entirely, and that is the useful part of the story.

A treatment's `Move` carried a hardcoded role of `"drums"`, because the type
wanted a role and a whole-band move has none. `worth` reads `standing` and
`established` OF ITS ROLE, so with a fictional role every treatment scored the
constant 1; `serve` is also constant across treatments; and the only thing left
to order them by was `fresh × afford`, which knows nothing about the record in
front of it. Measured over 300 seeds, **every record in a genre played its
treatments in the same order**, differing only in how far down the list it got.

Giving the per-part moves a real part fixed that without adding a term:
distinct treatment sequences went **17 → 28** in lofi and **29 → 89** in
dungeon synth, and every section-level number is unchanged.

The first attempt claimed 52 and 137, and those numbers were bought by
breaking a law rather than by working: keying a per-part treatment's freshness
as `treat:drench:drone` gave each of its six candidates a key of its own, so a
name could be chosen six times before any of them staled. That is the opposite
of what this file's own rule says — the desk getting wetter is the desk getting
wetter whichever part it happened to. It took dungeon synth from twelve
distinct treatments to five and gave `drench` 896 uses of 1557. The key is the
NAME; the part is only what the score chooses between.

## The plan for the rest of them

`docs/BUILDING-THE-ALTERATIONS.md` — six phases, ordered, each with the number
that says it worked. The section below is its hardest constraint, and Phase 1
of that plan exists to satisfy it before the pool is allowed to grow.

## What must not happen

**The pool must not simply be drawn from.** Sixty-five moves fired at random is
not an arrangement, it is a light show — the same failure as the texture that
oscillates every two loops, at greater volume. Each move needs what the current
six have: a cost the genre states (`afford`), a freshness term so a move wears
out, and a score against what the record has already done. A genre says which
layers it will move at all — dungeon synth's development is reverb and filters,
and it should probably never swap a drum circuit mid-record.

**And the rule of three now applies to the moves themselves**, not only to their
names. The current `fresh` term keys on `move:role`, so a record can play the
same *kind* of move seven times running as long as it rotates which part it
happens to — which is exactly what dungeonsynth 829055 does across its
thirty-two-bar verse: `-lead +lead -bass +bass -keys +keys -lead`. Every
boundary changed something. Nothing accumulated.

## Sources

- `docs/FORM-RESEARCH.md` (on `origin/main`) — Part 2's ladder of what counts as "the change", and Part 3's six treatments
- `docs/LOOP_TO_SONG.md` (on `origin/main`) — the research pass over the ten transcripts; §6 the rule of three, and the ranked list where "add the empty" is 5th
- Transcripts `001`–`009` (on `origin/main`): `002` transitions and odd phrasing, `003` motivic development and the inner voice, `004` fills and the empty, `005` the two-loop rule and the two sides of a transition, `006` the rule of three, `007 (8bar)` the moment, `008` coprime loops, `009` supporting and getting out of the way of the lead
- note.com/soundwitches, "What is Dungeon Synth?" — the development section as reverb and filter movement. https://note.com/soundwitches/n/n4c2493bab15e?hl=en
- omnionsound.com, "The Rule Of Three In Music Composition" — already cited in `form.ts` and `spec.ts`
- tobyrush.com, "Motivic Development" — already cited in `vary.ts` for the note-changing operations this document is the complement of
