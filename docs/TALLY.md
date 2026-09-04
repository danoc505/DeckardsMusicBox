# THE TALLY — what this branch has done, and what is open

*Collected at the owner's request: "we need a doc that tallies what we are
working on and what has been done." It covers the branch
`claude/dungeon-synth-seeds-research-y3om6g`, which began as a request for
three seeded dungeon synth records and turned into the arrangement stage
learning a fourth way to change a record.*

**HOW TO READ THIS.** Same rule as `docs/BACKLOG.md` on `main`: every open item
says WHY it is open and WHAT would close it, and nothing here is a wish — each
one was found by measurement or named by a source. Everything under "done"
carries the number that says it worked, because a change with no measurement
behind it is an opinion.

---

## 0. THE ONE THAT OUTRANKS EVERYTHING

**NONE OF THIS HAS BEEN HEARD.** Every claim below is a measurement or a test.
Twelve treatments now move the desk across a record and not one of them has
been listened to by a person — the rolls were read, the numbers were checked,
the bytes were compared, and nobody played the record.

This project's own precedent is explicit about what that is worth: the sax had
every metric green and the ear refused it. Measurements prove a thing EXISTS
and never that it sounds good. In particular, three things below are
unfalsifiable from a spreadsheet:

- whether `darken` at a section boundary reads as an arrangement move or as a
  fault in the file,
- whether the change lands as a musical event or as an audible click, since a
  filter cutoff moving in one sample is a step and not a sweep (§2),
- whether 33% of spans on a treated desk is right, half as much as it should
  be, or twice.

**Nothing should be built on top of this until it has been played.**

**And that warning has now been cashed once, by measurement rather than by
ear.** Two of the twelve were doing nothing — one of them bit-for-bit — and
nothing in the program could have said so, because the only thing holding the
treatments to their purpose was a single assertion that the record with its
whole desk timeline differs from the record with none. That passes while eleven
of the twelve are dead. See §1 and §2. The ranked table in
`genre-research/THE-ALTERATIONS.md` — what each treatment is worth, in dB —
says which end of the list to start listening at, and `node tools/treatments.ts`
prints it fresh.

---

## 1. WHAT WAS DONE, and the number behind each

Four commits, `189d726` → `f7a2f06`. 275 tests pass; `npm run check` is clean;
the shipped single-file page is rebuilt and carries all of it.

| what | why it was done | what says it worked |
|---|---|---|
| **Read dungeon synth's own literature on arrangement** (`DUNGEON-SYNTH-ARRANGEMENT.md`) | Every rule in `arrange.ts` came from pop-arranging sources applied to every genre alike, and this genre's own guide says outright its structure is "not based on the typical pop song progression... but rather on carefully sustaining a single mood" | Three of six sourced rules already held, including the two the genre states in its own table. Two did not, and both were the genre inheriting a default written for other music |
| **Catalogued every note-preserving alteration** (`THE-ALTERATIONS.md`) | `FORM-RESEARCH.md` named six treatments; six is what one paragraph happened to list, not the size of the space | 65 moves in 11 layers. **36 were already built** — the whole desk, room and drum machine — and none could vary across a record, because `render.ts` did not contain the word "section" |
| **The form no longer varies an idea's last hearing** (`form.ts`) | The rule of three fired on the third hearing without checking whether a fourth was coming, so it manufactured material there was nothing to tune out of | variants heard once: **33% → 0%**. Materials heard once 31% → 21%. Record time on never-restated material 17% → 11% |
| **`recast`: the demand travels when notes may not pay it** (`form.ts` → `arrange.ts`) | `FORM-RESEARCH.md` Part 2: "the change may be delivered at a different level than the repetition that demanded it" | 24 recast sections across 60 dungeon synth seeds, **all 24** open on a treated desk. A test asserts every one is met |
| **Twelve treatments** (`stage/treat.ts`, `TREATMENTS` in `spec.ts`) | The two-loop rule names four ways to change an arrangement; this stage did three and read "expression" as the drums' hat | All 12 used across 60 seeds; 33% of spans treated; every record uses at least one; `stuck` stays 0 |
| **The desk moves with the record** (`Span` → `perform.ts` → `render.ts`) | The genre's desk was one frozen object for the length of a record | Byte-identical output at block sizes 577 and 4096 **on a record that moves its desk mid-way**, and a max sample difference of 0.043 against the same record with the timeline emptied |
| **Dungeon synth states its own treatment weights** (`dungeonsynth.ts`) | Its guide gives development exactly one instruction and it is a desk move: "deepen the shadows of the sound through changes in reverb and filters" | The distribution follows the source: `darken` 111, `drench` 70, `wear` 54, `far` 33, with `brighten` kept light at 7 |

### The foundation pass, and the two dead moves it found

Nothing new was added here. The question asked was the one the build never
asked: of the twelve treatments already shipped, which ones actually change the
record?

| what | why it was done | what says it worked |
|---|---|---|
| **`sound/reach.ts`: the renderer's own liveness rule, stated once** | `render.ts` builds only what something feeds — a return nothing sends to, a pole at `mix` 0 and a board no part walks are never built — and it knew that in a private method. Any stage that moves a knob had no way to ask, so `treat.ts` compared the treatment's numbers against the genre's numbers and called that "does it do anything" | `deskOf` now refuses a move whose path this genre does not patch in. Dungeon synth stopped being offered `echoed`; lofi stopped being offered `brighten` |
| **`echoed` on dungeon synth was BIT-IDENTICAL** | Every part of that genre sends 0 to the echo and no return feeds it through the patch matrix, so the unit was never built. The treatment moved two numbers in a struct | **−225 dB** — not a small change, no change. It held 0.3% of the genre's treated time across 40 seeds, and every span of it promised a change and delivered silence |
| **`brighten` on lofi was −37.7 dB** | Its pole sits at `mix` 0, out of the sum. What was left of the move was a tape lowpass raised from 10 to 13.5 kHz over voices with nothing up there | 18.3% of lofi's treated time, and **6.3% of every lofi record**, was under it. In six of the first eight seeds it was the record's SECOND treated span. Those spans now carry `drench` at −12.8 dB: the same boundary, the same notes, a change that happens |
| **The desk tests ran at the one rate the desk cannot move at** | `Pole` clamps its cutoff at `sampleRate / 6` and `Biquad` at `sampleRate * 0.49` to stay stable. At the 8 kHz `render.test.ts` used, dungeon synth's pole is pinned at 1333 Hz and its tape at 3920 — so `darken`, the move this genre's own literature names and 39% of its treated time, was **exactly a no-op** in the test that was supposed to prove the desk is heard | Both desk tests moved to 22050 Hz on a record whose first move is `darken`. They now fail if that move stops working |
| **`stage/treat.test.ts`: every treatment of every genre, rendered and measured** | The test that should have existed the day the treatments were built. It is the cheapest test in the program to have written | Nine tests. Every offered treatment must move the record; every refusal must name a unit the genre has not got AND be quieter than everything the genre kept; `reach.ts` must never call dead a return the renderer patches in |
| **`tools/treatments.ts`** | A treatment is invisible to `measure.ts` by construction — it moves the desk and not one note, so the MIDI is the same MIDI — and invisible to the piano roll. There was no instrument that could see one at all | The ranked table in `THE-ALTERATIONS.md`, reproducible in one command |

**And not one note moved.** Over 40 seeds a genre, every event time, pitch,
gain and roster is byte-identical to before the change: the fix is confined to
the desk, which is where a treatment lives. The piano roll is unchanged and
could not have shown any of this.

### And one thing that was got wrong and corrected

A treatment was first scored on its own shape alone, reaching 1 where a density
move's score can never exceed one part of five. It outbid them roughly
fivefold, and a record came out with **fifteen desk moves against two of
everything else** — a section changing colour every eight bars and never losing
a player, which is the oscillating texture again in better clothes. A treatment
is now priced at what `fullness` already prices the drums' expression at: half
a part. Recorded here because the failure is more instructive than the fix.

---

## 2. DEFECTS AND GAPS FOUND BY MEASUREMENT

| what | why it is open | what closes it |
|---|---|---|
| **A treatment changes the desk in ONE SAMPLE** | `reachDesk` applies a change and retunes at the exact sample the arrangement put it on. That is what makes the record block-size independent, and it also means a cutoff moving 3600 → 1620 Hz is a step. `tune()` keeps each unit's tail so this is not a reset, but a filter's coefficients change instantly. **Not heard yet, so it is not known whether this clicks.** | Listening first. If it clicks: a short ramp across the boundary, which must be derived from the sample index rather than from wall time or the block-size guarantee dies with it |
| **The peak is still built on material heard once in 47% of records** | Fixed for variants (33% → 0%), untouched for PLAIN statements. Seed 829055's peak plays idea `B`, which the form's grammar gave exactly one section. No rule about variants can reach it — it is a form-level fault | The form knowing that the section it marks `peak` should carry an idea it states more than once. Not attempted; it changes the grammar, not the arrangement |
| **The rule of three still applies to move NAMES, not move KINDS** | `keyOf` returns `${name}:${role}` for density moves, so a record may play the same *shape* repeatedly by rotating which part it happens to. This was 829055's original fault. It is *masked* now — treatments compete for those boundaries — but the hole is still there | A second freshness term on the move's kind. Deliberately not added yet: it would have suppressed density moves at exactly the moment treatments were already winning too much (§1), and two balance changes at once cannot be told apart |
| **`desk` is 64% of all span boundaries** | Higher than expected. Every section-level number is unchanged — who opens, thinnest, fullest, energy spread — so density was not crowded out at the section grain. But 64% of the *within-section* boundaries being desk moves is a taste question a measurement cannot settle | Listening. If it is too much, the lever is the `asPart` price, and it should move for a stated reason rather than to taste |
| **`arrangement.treat` defaults to an even pool** | No source ranks these against each other, so an even default is honest — but it means lofi's weights are a placeholder, not a decision. lofi is the genre with the least thought behind its treatments | lofi stating its own, from its own sources, the way dungeon synth does |
| **`wear` is not a treatment, it is a different pressing** | Its difference signal is LOUDER than the record it differs from — **+3.3 dB** on dungeon synth, +2.1 on lofi — and it takes the level up 2.5–3.3 dB with it. Crackle doubled with a floor of 0.05 and tape drive at 1.5× is not the medium ageing across a section. It is 18% of dungeon synth's treated time, so a fifth of that genre's treated spans are this | Listening, then smaller numbers with a reason stated. It is a taste change to how every dungeon synth record sounds, so it is the owner's call, not a refactor |
| **Two treatments move the LEVEL, which is the one thing they were not supposed to do** | `dry` −1.9 dB and `drench` +2.1 dB on dungeon synth. Moving the sound and not the level is exactly what lets a treatment answer the rule of three without the arrangement getting quieter each time it does; these are density moves in a desk's clothes | Either a level-compensating term on the returns, or the admission that these two are density moves and should be priced as such. Not attempted: one balance change at a time, and nothing has been heard |
| **Half of lofi's vocabulary barely moves the record** | `push` −30.0, `ease` −29.1, `echoed` −27.4, `widen` −24.2, `far` −23.4 dB, against `darken` at −12.5. lofi's desk is thin: one part on the board, a shallow world, no pole in the sum. Nothing here says any of it is inaudible — that is §0's question — but a treatment 17 dB below the genre's own headline move is not obviously spending a boundary well | Listening to the bottom of the table first. If they are inaudible the honest fix is in lofi's DESK, not in the treatments: a genre that gives one part a pedal board cannot be pushed | 
| **lofi does not choose its treatment, it rotates through a list** | Its pool is evenly weighted, so the arrangement's freshness term alone decides, and the result is the declared order every time: span 1 `darken`, span 2 `drench`, span 3 `dry`, span 4 `push` — the same sequence in six of the first eight seeds. This is the same failure the shed order had before the arrangement got a memory: a list has no memory, so nothing that happens in a record can affect it | lofi stating real weights (above), or the treatment score reading something the record has actually done rather than only how often the name has been used |
| **The intro ceiling is still inert for dungeon synth** | `introSec: 12` comes from 303 pop singles. At 60–80 bpm a bar is 3.05–3.97 s, so nothing in this genre's intro table fits, the shortest is taken every time, and the `[[16, 2]]` in its own table **can never be drawn** — a knob that does nothing | The genre stating `introSec: 64`, which makes both lengths live and admits exactly what note.com names (8–16 bars). Proposed in `DUNGEON-SYNTH-ARRANGEMENT.md` §8, deliberately not applied: it changes how every dungeon synth record opens and that is the owner's call |
| **The record never ends the way this music ends** | note.com: "gradually reduce the elements until only the initial drone remains, ending quietly" — the only place any source describes a dungeon synth ending. It happens **0%** of the time, because `arrangement.fewest` is 3 by inherited default | A second exception to `fewest` at the last section, alongside the break. Also proposed and not applied, same reason |

---

## 3. THE ALTERATIONS NOT BUILT

Of the 65 catalogued, **12 are now drivable per span**. The rest split three ways.

### Machinery that exists and still nothing drives (10 of the 21 in §7–9)

| layer | still static | why it is open |
|---|---|---|
| the room | **azimuth** — a part crossing the room mid-record | Nothing refuses it; it was simply not in the first twelve |
| the desk | **pedal swap** (a different stompbox lit), **patch** (a return fed into another), **medium** (gramophone/radio over a section), **modulation** (tremolo, phaser, ensemble depth) | Each is a `SoundSpec` leaf like the twelve. Cheap to add — the plumbing is done |
| the machine | **kit swap**, **circuit swap**, **lane tune/decay**, **lane level**, **per-lane send** — the entire drum machine | Cheap in the same way, but a genre should probably never swap a drum circuit mid-record, so this wants a genre weight before it wants code |

### Needs work in `perform` or `material`, not in the desk (§3, §5, §10, §11 — 19 moves)

The clock (half-time, double-time, metric displacement, truncation, extension,
anacrusis), register (octave, voicing spread, voicing inversion), the four
answering moves (inner-voice echo, support withdrawing at the climax,
foreshadowing the hook, coprime ornament loops), and the seam (riser, reverse
reverb, silence on the exit, elision). **None of these touch the desk**, so
none of this branch's plumbing helps them. Every one needs a stage that writes
notes to know something it currently does not.

### The one the sources call most useful, and it is not built

**Partial variation** — first half identical, second half diverges.
`FORM-RESEARCH.md` calls it "the most useful one for a generator" and
`vary.ts` transforms whole lines only. It is the highest-value single item on
this list and it belongs to the material stage.

---

## 4. STALE CLAIMS TO FIX

| where | what it said | state |
|---|---|---|
| `DUNGEON-SYNTH-ARRANGEMENT.md` §9 | "A section that gets darker without losing anything is the move this genre's sources describe most often **and this program cannot make**" | **Fixed in this commit.** It can, as of `f7a2f06` |
| `THE-ALTERATIONS.md` §2 | Marks `empty-before` and `fill-into` as ○ | Still correct — but worth re-reading now that `Span` can carry a treatment, because both are closer than they were |
| `THE-ALTERATIONS.md` legend | ● means "the machinery exists in MKIII **and is honoured by the renderer**" | **It was not true of every ●.** Move 46, the echo, is ● — and dungeon synth's echo is fed by nothing, so the renderer never built it. The legend describes the CODE, and whether a given genre can hear a given piece of it is a second question the document never asked. Corrected in place: the refusal paragraph now says what the test actually tested, and the measured table says what each move is worth per genre |
| `THE-ALTERATIONS.md` | "each is **refused where it would do nothing** — lofi is never offered `sweep`" | **Was true of `sweep` and of nothing else.** The test compared the treatment's numbers against the genre's numbers, which cannot see a knob wired to nothing. Fixed, and the correction is written into the document beside the original claim |

**And one thing that was NOT stale, checked rather than assumed.** The
sixty-seed table in `DUNGEON-SYNTH-ARRANGEMENT.md` §1 was suspected of
predating the form fix. Re-measured, every number in it is identical — parts in
bar one 1.2, last section 3.0, thinnest 1.2, fullest 5.0, energy 0.26 → 0.96.
That is the point of §1 of this document: treatments compete only for the
boundaries *inside* a section, so nothing at the section grain moved. The
"materials heard once" figures that did change were never in that table.

---

## 5. WHAT WAS DELIBERATELY NOT DONE

Named so none of it is mistaken for an oversight.

- **The two genre proposals** — `introSec: 64` and a floor of one at the outro.
  Both are one-line changes with sources behind them, and both change how every
  dungeon synth record sounds. That is the owner's call, not a refactor.
- **A third theme-length proposal** (`DUNGEON-SYNTH-ARRANGEMENT.md` §8 rule 3):
  note.com says a theme section is 16–24 bars and 21% of this genre's run to 32.
  Left alone because two sources genuinely conflict — "repeated extensively"
  argues for the long loops — and nothing measured it.
- **The kind-freshness fix**, for the reason in §2: one balance change at a time.
- **Anything in §3's second group.** Scoped out on purpose: this branch did the
  desk, because 36 of 65 moves were already built there and needed only
  plumbing. The note-level moves need new builders and are a separate piece of
  work.

---

## 6. THE ORDER I WOULD TAKE THEM IN

1. **Play the records.** §0. Everything below is worthless if the desk moves
   audibly click, and that is one listen away from being known.
2. **Fix the stale claims** (§4), so the next measurement has a true baseline.
3. **The two genre proposals** (§2), if the owner wants them — they are the
   best-sourced open items on the list and the cheapest to apply.
4. **The remaining desk and machine treatments** (§3, first group) — the
   plumbing is done and these are leaves.
5. **Partial variation** (§3, third group) — the highest-value item, and the
   first one that needs real new work.

---

## Sources for the open items

- `docs/BACKLOG.md` and `docs/FORM-RESEARCH.md` on the `main` branch — the
  format of this document, and the rule-of-three ladder the treatments answer
- `docs/genre-research/THE-ALTERATIONS.md` — the 65, and which are built
- `docs/genre-research/DUNGEON-SYNTH-ARRANGEMENT.md` — the genre's own
  literature, and the two unapplied proposals
- `docs/genre-research/THE-INTRO.md` §8 and
  `docs/genre-research/MELODY-AND-THE-HOOK.md` — open items older than this
  branch and untouched by it: an intro that writes its own melody, and a break
  that is a real solo
