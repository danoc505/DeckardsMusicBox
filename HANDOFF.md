# Handoff: Treatments Implementation Complete

## What This Program Does

**Deckard's Orchestrator MKIII** generates seeded music records. Same genre + seed = same record, every time, as MIDI, WAV, or interactive page.

- **Two genres**: lofi hip hop, dungeon synth
- **Five parts**: drums, bass, keys, lead, drone (six synthesized voices)
- **Reproducible**: seeded randomness, five pure stages (chart, form, arrangement, materials, performance), then render to sound
- **Measurable**: every number has a source; the melody is constraint-based (Huron theory)

## What Was Just Completed (This Branch)

**Treatments: twelve desk-moving changes that preserve all pitches.**

When a record's melody repeats an idea for a third time, the old code *varied* the notes (added density moves). This made one-third of every record sound unique but unmemorable (heard once, never again).

New approach: **The rule-of-three demand travels to arrangement instead.** If an idea won't return, mark it `recast`. The arrangement then moves the *desk* (effects: darken, brighten, drench, dry, push, ease, widen, close, far, sweep, wear, echoed) instead of the notes.

### Measurement

- **Variants heard once**: 33% → 0% (fixed)
- **Materials heard once**: 31% → 21% (improved as side effect)
- **Record time on never-restated material**: 17% → 11%
- **All 12 treatments used** across 60 dungeon synth seeds
- **33% of arrangement spans get one treatment**
- **Desk changes land at exact sample boundaries**, making output byte-identical whether rendered in 577-sample or 4096-sample blocks
- **Treatments actually sound**: max amplitude difference 0.043 samples when rendering same record with/without desk moves

### Key Files Changed

| File | What | Why |
|------|------|-----|
| `src/stage/form.ts` | Added `recast` flag | Detects ideas that won't return; marks them for arrangement instead of varying |
| `src/stage/treat.ts` | NEW: twelve pure functions | Each treatment (darken, etc.) returns absolute desk state or null if it'd do nothing |
| `src/stage/arrange.ts` | Wired treatments into boundary pool | Scores them alongside density moves; marks recast sections for treatment opening |
| `src/genre/spec.ts` | Added TREATMENTS vocabulary | Type-safe treatment names and weighted pool per genre |
| `src/genre/dungeonsynth.ts` | Weighted treatment pool | darken 6, drench 5, wear 4, far 3, etc. — from the genre's own sources |
| `src/sound/perform.ts` | DeskChange timeline | Tracks exactly when each treatment starts |
| `src/sound/render.ts` | Block splitting at desk changes | Applies changes at exact sample, not block boundary; reachDesk() applies one, retune() merges genre+treatment+page override |
| `docs/TALLY.md` | NEW: full accounting | What's done (with numbers), what's open (with closure conditions), deliberately skipped work |
| `README.md` | Added pointer | Links to TALLY.md |

## How to Verify It Works

### Quick Test
```bash
npm test
```
275 tests pass. Key tests:
- `a treatment lands on its own sample, not on the caller's block boundary` (block-size independence)
- `the record's own desk is heard` (treatments actually sound different)

### See the Arrangement
```bash
node tools/roll.ts dungeonsynth 42 --map
```
Shows which parts play when, and the opening structure. **Note**: piano roll shows only notes (unchanged by treatments).

### Generate the WAV
```bash
node src/cli.ts dungeonsynth 42 --wav out.wav
```
The WAV **contains the treatments**. This is the ground truth test—play it and hear the desk moves.

### JSON with Numbers
```bash
node tools/roll.ts dungeonsynth 42 --json
```
Returns parsed notes and arrangement structure (no desk info yet; see "What Needs to Be Done").

## What Needs to Be Done (Recommended Order)

From `docs/TALLY.md` §6:

### 1. **Play the records** (CRITICAL)
Nothing has been heard by a human yet. All claims below are measurements, not listening. Three unfalsifiable questions:
- Does a filter cutoff moving 3600 → 1620 Hz in one sample *click*?
- Is 33% of spans on a treated desk right, or too much?
- Do treatment changes land as musical events or as faults?

**Action**: Listen to several seeded records (e.g., seeds 1–10, 42, 829055). Update `TALLY.md` §0 with findings.

### 2. **Fix stale claims** (`docs/TALLY.md` §4)
One was already fixed by this work; one remains:
- `DUNGEON-SYNTH-ARRANGEMENT.md` §9 now says the program CAN make darker sections (fixed)
- But verify the sixty-seed table in §1 still holds (already re-measured: all numbers identical)

### 3. **Apply genre proposals** (if owner wants)
Two one-line changes, both with sources, both change how every dungeon synth record opens/closes:
- `introSec: 64` (from dungeon synth's own table; currently stuck on shortest because pop's `12` doesn't fit)
- `fewest: 1` at outro (from note.com: "reduce elements until only drone remains")

See `DUNGEON-SYNTH-ARRANGEMENT.md` §8 and `TALLY.md` §2.

### 4. **Remaining desk/machine treatments** (cheap; machinery exists)
10 alterations still static: azimuth, pedal swap, patch, medium, modulation, kit swap, circuit swap, lane controls. Each is a `SoundSpec` leaf—the plumbing is done.

### 5. **Partial variation** (highest-value, needs new work)
`FORM-RESEARCH.md` calls it "most useful for a generator": first half identical, second half diverges. Currently only whole-line variation exists. This belongs in the material stage, not here.

## Critical Notes for Next Coder

### Tests Pass But Listening Matters Most
- The test suite only proves the code exists and is consistent
- `npm test` is **not** the test. The **WAV is the test**.
- Play seeds 1–20 to calibrate your ear. If it sounds wrong, it *is* wrong, regardless of test results.

### The MIDI Piano Roll is a Lie
- Treatments don't change notes, only desk (effects knobs)
- The MIDI piano roll will look identical for the same record with or without treatments
- **Never trust MIDI for checking if treatments work.** Generate the WAV, play it, listen.

### Block-Size Independence is Real
- A record rendered in 577-sample blocks = byte-identical to 4096-sample blocks (same desk change landing)
- This only works because desk changes land at exact samples, not block boundaries
- If you add new treatments, verify this still holds: test with `render(record, {blockSize: 577})` vs `blockSize: 4096`

### Recast is the Pivot
- When an idea won't return, `form.ts` marks it `recast: true`
- `arrange.ts` uses this to open the span with a treatment instead of falling back to density moves
- If you change the rule-of-three or form grammar, retest this flow

### Measurements Over Opinions
- Every decision in this branch has a number: parts heard once, desk move count, max amplitude
- Before proposing a change, measure the current state. After changing, measure again.
- See `TALLY.md` §1 for the pattern.

## How to Run Everything

| Task | Command |
|------|---------|
| Run all tests | `npm test` |
| Type check | `npm run check` |
| One seed as text | `node src/cli.ts dungeonsynth 42` |
| One seed as WAV | `node src/cli.ts dungeonsynth 42 --wav out.wav` |
| Arrangement + opening | `node tools/roll.ts dungeonsynth 42 --map` |
| Sweep 20 seeds | `node tools/roll.ts --sweep dungeonsynth 1 20 --map` |
| Build web page | `npm run build` → `Deckards Orchestrator MKIII.html` |
| Play records | Open the built HTML in a browser |

## Files to Read First

1. `README.md` — 5 min overview
2. `docs/TALLY.md` — what's done, what's open, why each matters
3. `docs/genre-research/DUNGEON-SYNTH-ARRANGEMENT.md` — the genre's own literature applied
4. `src/stage/treat.ts` — how the twelve treatments are built
5. `src/sound/render.ts` — how desk changes land at exact samples

## Questions to Ask Yourself

- Have you played a record yet? (If no: do this before any code change)
- What would close the open item you're working on? (Should be in `TALLY.md`)
- Does your measurement prove it worked, or did tests just pass?
- Would a person hear this change, or only a spreadsheet?

---

**Branch**: `claude/dungeon-synth-seeds-research-y3om6g`  
**Status**: Complete and pushed. Ready for listening and follow-up decisions.  
**Owner's Call**: Genre proposals (§2, §3) and whether the desk moves audibly click (§0).
