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
| **lofi states its own shed order** (`lofi.ts`) | It stated none, and inherited the pop default `drone, keys, lead, bass, drums` — so the genre that ENTERS on its keys shed its foundation second and its beat never. `affords()` gave its drums 0.2, the minimum, in both places a part can leave; at span level the drums' hat is priced at 1 against the drums' absence at 0.2, so only the hat could ever go | drums **100% → 78%** of bars, longest absence **0 → 10** bars, never absent in **40/40 → 4/40** seeds, most-present part changes between the halves in **0/40 → 21/40**. The same fault dungeon synth found in the same default, with the parts swapped |
| **Dungeon synth states its own treatment weights** (`dungeonsynth.ts`) | Its guide gives development exactly one instruction and it is a desk move: "deepen the shadows of the sound through changes in reverb and filters" | The distribution follows the source: `darken` 111, `drench` 70, `wear` 54, `far` 33, with `brighten` kept light at 7 |

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
| **The inherited default is this program's recurring fault, and two more are still standing** | Three found so far, all the same shape — a genre silently inheriting a number written for other music: dungeon synth's `shed` (fixed), lofi's `shed` (fixed, §1), and `fewest: 3` and `introSec: 12` below. A field a genre does not state is invisible in that genre's file, so nothing about reading `lofi.ts` or `dungeonsynth.ts` shows you what it is running on | Not a rule — a habit. When a genre reads wrong, check what it INHERITS before reaching for a new term in the stage. `arrange.ts` needed no change for any of the three |
| **~~`arrangement.treat` defaults to an even pool~~ — DONE, and "an even default is honest" was FALSE** | lofi now states its own weights from its own sources. And the even default was never even: measured, the same weights in a REVERSED array reverse the distribution exactly (54·48·44·38·30·20·8·3·2·1, the identical sequence). `fit > bestFit` is strict, so ties fall to pool order, and pool order is the genre's `treat` array order. An even pool therefore shipped a hard 54-to-1 ranking taken from the order of a `const` in `spec.ts` that no author chose and no source supports | Done for lofi: `wear` 1 → 360 uses in 300 seeds and now the top move, which is the one the genre is named after. The tie-break itself is Phase 1 of `BUILDING-THE-ALTERATIONS.md` |
| **A TREATMENT IS CHOSEN BY A FORMULA THAT CANNOT READ THE RECORD** | Among treatments `serve` and `worth` are constant, so `fit` varies only by `fresh × afford` — neither of which knows anything about this record. Measured over 300 seeds: **every record in a genre plays its treatments in the SAME ORDER**, and records differ only in how far down the list they get. lofi is always `wear darken drench echoed wear push`; dungeon synth always `darken drench wear darken far dry`. The 17 and 29 "distinct sequences" are all prefixes of one sequence | A term in the treatment score that reads what the record has done — the same thing `arrange.ts` did for its section walk, and for the same reason: "a rank that cannot change as a consequence is not a story". This is now the central item of Phase 1, and it is a **blocker on Phases 2–5**: adding 53 moves to a selector that plays a fixed playlist gives 65 items on a fixed playlist |
| **A genre only ever hears its top four or five treatments** | Falls out of the row above. A record has 3.3 (lofi) to 4.4 (dungeon synth) treated spans, and `fresh = 1/(1+used)` walks the weight ladder from the top, so nothing below rank ~5 is ever reached. Over 300 seeds lofi never fires seven of the twelve it weights above zero; dungeon synth reaches its tail once in 300, which is not meaningfully different | The same fix. Recorded rather than deleted — these are not knobs that do nothing, they are knobs an unreachable selector never turns, and the diagnosis names what makes them live |
| **~~The intro ceiling is still inert for dungeon synth~~ DONE — and it was inert for lofi and for the DEFAULTS too** | `introSec: 12` comes from 303 pop singles. Measured: **100%** of dungeon synth records and **49%** of lofi's broke their own stated ceiling, through a silent fallback in `form.ts` that took the shortest length whenever nothing fitted — so the ceiling was a preference that gives up, while still killing every other length. lofi drew 4 bars in **100%** of 295 records and dungeon synth 8 bars in **100%** of 357; their second entries were drawn never. The defaults carried the same fault: `[[8, 2]]` at `tempo: [90, 120]` is 16 s under a 12 s ceiling | Made a constraint instead of a number. `resolve.ts` refuses at load any intro length that cannot fit at the genre's fastest tempo, with the arithmetic, and the fallback is gone. Each genre then states its own from its own literature: lofi 30 s (richardpryn.com's "20–30 seconds" sections; it is a beat tape, not a chart single), dungeon synth 64 s (note.com's 8–16 bars), default 20 s (Léveillé Gauvin's own mid-80s figure, which the default table can satisfy). Result: lofi 4 bars 71% · 8 bars 29%; dungeon synth 8 bars 53% · 16 bars 47%; ceiling broken **0%** in both |
| **~~The record never ends the way this music ends~~ DONE, as a constraint rather than a number** | note.com: "gradually reduce the elements until only the initial drone remains, ending quietly" — the only place any source describes a dungeon synth ending. It happened **0%** of the time, because `arrangement.fewest` is 3 by inherited default | Not a second `fewest` value: a floor is about a section that CARRIES ON, and the last one is not, so it is not floored by that number at all. What holds an ending up is the dénouement instead. Measured over 300 seeds: dungeon synth's drone-alone ending **0% → 10%**, final span 3-or-4 parts → 1 (10%) · 2 (82%) · 3 (8%); lofi 3-or-4 → 2 (7%) · 3 (72%) · 4 (21%); and "ends carrying what it opened with" is **unchanged**, 97% and 87% |

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
