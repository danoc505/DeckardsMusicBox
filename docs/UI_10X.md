# 10× the UI — inventory + plan

> ## ⚠ THIS DOCUMENT IS ABOUT MK1. DO NOT PLAN FROM IT.
>
> **Every line number in this file points at
> `Improv Machine playable_BETA 0.1.html`, which is frozen.** None of the seams
> it names — `conduct()` at L6257, `schedule()` at L6879, `drawRoll()` at L7478,
> `exportMidi()` at L7318 — exist in `Deckards Orchestrator MK2.html`.
>
> It is kept because the *research* is still good: the user is a hardware
> musician judging by taste, offline, and the reasoning about what would earn a
> "10×" for that person is sound. The **inventory** is worthless and the
> **plan is aimed at a program that no longer exists.**
>
> It also actively misled a session: asked to make the program 10×, a coder read
> this file, concluded the answer was Web MIDI, and built the MIDI port before
> asking what "10×" meant. The user's correction was blunt and correct — *"MIDI
> is a last step not something that will 10x the program this is a music making
> program therefore 10x would be making it make better more proper more
> interesting music."* **The 10× of this program is the music, not the UI.**
>
> Since built in MK2 anyway: **Web MIDI OUT and MIDI clock** (Tier 0 items 1 and
> 2 — see `harness/mk2_midi.js`). Not built and still worth wanting: the live
> roll, keyboard shortcuts, tap tempo, the waveform/onset view.
>
> For what to actually do next, read `docs/HANDOFF-MK2.md` §5 and §9.


*Grounded in the actual file (`Improv Machine playable_BETA 0.1.html`) and in who the user
is: a hardware musician (Organelle, BeatStep Pro, Kastle) judging by taste, offline, from a
USB stick. Single-file/offline is **not** a blocker for any Tier 0–2 item — Web MIDI is a
native browser API, the MIDI + time-stretch libs are already inlined, and every
visualization draws from data the engine already holds in memory.*

## What exists today (all honest, all wired to real data)

UI is small: CSS `L4–45`, HTML markup `L46–104`, wiring `L7535–7633`, render `L7392–7533`.

- Transport & song: play/pause, new song, **seed field** (seed IS the song), curated
  **library** grouped by genre, SEGA/YM2612 toggle.
- Export: **WAV** (real offline render) and **MIDI** (per-part named tracks, drums→GM ch.10,
  micro-timing preserved) — `exportMidi()` `L7318` is the exact note→MIDI mapping to reuse.
- Sampling: file/drop-zone, chop mode/pads/fit/flip/room/play-as, window nudge, "tune band
  to sample" / "band follows record" overrides, detected chord line — all re-cut real audio.
- **Loading screen** (`runLoadingScreen()` `L7419`): genuinely honest — real produced-part
  counts, what each engine actually *heard*, real entry bars, **real ghost correction
  counts**, and the roll building **part-by-part**.
- **Piano roll** (`drawRoll()` `L7478`): plots real notes per part with section bands; a 2px
  playhead scrolls.

**Honesty caveat worth fixing:** the loading *content* is real, but the *pacing* is a replay
— `composeSong` finishes synchronously, then lines drip on fixed `setTimeout` (`L7453`).
Given this user's scar tissue about fake progress UI, relabel it "replaying this session…"
or stream it for real.

**Not present:** no genre/key/tempo/form pickers (display-only; but `conduct(seed, overrides)`
`L6257` already accepts them and `generateBreak` already passes `{genre}`); no Web MIDI
anywhere; no waveform/onset view of the sample (onsets/beats are computed, shown only as a
count); roll is static during playback (notes don't light as they fire).

## The plan

### Tier 0 — quick wins (all use data that already exists)

1. **Web MIDI OUT (M) — the highest-value feature.** `schedule()` `L6879` already computes
   every note/drum at an absolute time; also send `noteon/noteoff` to a chosen `MIDIOutput`,
   drums→GM note on ch.10 (reuse `exportMidi` mapping `L7336`). Native `navigator.requestMIDIAccess()`,
   no library, works offline. **This is what earns the "10×"** — he plays his Organelle/BeatStep
   straight from the file, no export step.
2. **MIDI Clock + Start/Stop (M, depends on 1).** 24-ppqn clock + transport so his BeatStep Pro
   locks to `TEMPO` (single source of truth, `L6818`).
3. **Live roll during playback (S–M).** Light notes as they fire and part-chips as parts enter,
   using `curStep`, `SESSION.events`, `entries`, `arrangement` — all present; `drawRoll` already
   filters by entered/active.
4. **Keyboard shortcuts + bigger touch targets (S).** Space/N/←→/1–8/C/E; bump button sizes for a
   tray table.
5. **Tap tempo (S–M).** Feed averaged BPM to `conduct` overrides / the MIDI clock.
6. **Honest loading pacing (S–M).** At minimum relabel as replay; better, stream per engine step.

### Tier 1 — make sampling visible (his workflow, currently near-invisible)

7. **Waveform + onset/chop/beat overlay (M).** Draw `SAMPLE.mono` across the window; overlay
   `SAMPLE.slices[]` cut lines by kind, the beat grid, bold downbeats. Turns count-in-text into
   something he can see and trust. All data present.
8. **Clickable pads to audition chops (M).** Grid triggers `playSlice()` `L7192`; MIDI-map them so
   his BeatStep pads fire the chops (needs #1).
9. **Provenance panel (S).** Surface the already-computed detected key + confidence, chord
   progression, tempo/downbeat, "N/total cuts on a real note" as labeled fields, not a run-on line.

### Tier 2 — constraint pickers (currently seed-only)

10. **Genre/tempo/key/form dropdowns (S–M)** feeding `conduct(seed, overrides)` (`L6257`, the seam
    already exists end-to-end via `buildSession(seed, overrides)` `L6823`). Keep the seed field so
    "this genre, this seed" stays deterministic. (Meter is real engine work — `SPB_PLAY` is hard-4/4;
    leave out unless asked.)

### Tier 3 — big bets (after the core lands)

Performance/live mode (full-screen roll + pads + mute/solo, MIDI-mappable); live mute/solo mixer
(`schedule()` consults a live mute set before firing; `e.role`/`e.lane` on every event); MIDI IN
(keyboard transposes/seeds/triggers); real-time density/tension knobs.

### Recommended order

1) Web MIDI OUT → 2) clock — these two alone 10× the box for his gear. 3) live roll + shortcuts +
honest loading (cheap trust). 4) waveform/onsets + provenance. 5) pads, tap tempo, pickers. 6) big
bets last.

**Key seams to work from:** wiring `L7535–7633`; `schedule()` `L6879` (hook MIDI-out + live roll);
`drawRoll()` `L7478`; `runLoadingScreen()` `L7419`; `reslice()`/`SAMPLE` `L7026–7182` (waveform data);
`conduct()` `L6257` + `buildSession()` `L6823` (override seam); `exportMidi()` `L7318` (note→MIDI map).
