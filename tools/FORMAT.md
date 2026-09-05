# `deckard-events` v1 — the note dump format

One file per song. Tab-separated. Header lines start with `#`; everything after
the column header row is a note event.

MKIII emits this format itself, out of its performance stage, as a first-class
output — not a debug helper bolted on later. `tools/dump.mjs` produces the same
thing from an Orchestrator HTML by driving it in a browser.

The format is **text, deterministic, and sorted**, so the same seed dumped twice
is byte-identical and `diff` shows music rather than ordering.

---

## Why notes and not audio

A record is judged by ear. Nothing else about it is:

- 82% leaps / 13% steps / 5% repeats — how a bass moves
- 118 of 134 bars distinct — whether a record is a loop
- 1492 of 2812 notes were one part — whether a texture is balanced
- a declared part with zero events — whether anything plays it at all

None of that can be read off a `.wav`, and all of it is arithmetic. Write `.mid`
alongside (`--mid`) when somebody wants to listen; read the `.tsv` when
something needs to be *counted*.

---

## Header

Order is stable. Unknown `#` keys must be ignored by readers, so a later version
can add lines without breaking one.

```
#format           deckard-events  1
#program          Deckard's Orchestrator MK2      document title / file identity
#genre            dungeonsynth
#label            dungeon synth                   the genre's own display name
#seed             7
#rig              draw    citadel                 asked for, then what was drawn
#key              F                               tonic, as a pitch class name
#mode             minor
#tempo            53.00                           bpm; the record's base tempo
#bars             162
#steps_per_bar    16
#seconds          761.77
#tempo_varies     no                              yes when the form drew a tempo map
#voice            keys    rhodes                  which instrument plays each pitched part
#kit              analog  909                     which kit the drum machine is loaded
                                                  with, and which analogue circuit
#events           2734
#asked_seconds    600                             only when a length was requested
#chords_<key>     Fm  Db  Fm  Ab                  one line per material built:
                                                  A, B, C, and A/1 for a variant
```

MKII's dumper writes two more, `#rig` and `#refused`, which have no meaning
in MKIII: it draws no rig and declines no doubling. Readers ignore what they
do not know, which is why they are safe to leave in a file.

### Form

```
#section_cols   i  fn  startBar  endBar  material  energy  occ  flags
#section        0  intro  0  4  A@0  0.20  1  fill,mv:establish,arc:1
```

`flags` is a comma list, `.` when empty. What MKIII writes:

| flag | meaning |
|---|---|
| `peak` | the form marked this the record's biggest moment |
| `vary` | the third consecutive statement of an idea: this one differs |
| `recast` | the third statement of an idea that will not return: the change is on the desk, not in the notes |
| `swell` | the section before the climax, and it builds into it — its weight rises across the section |
| `manner:<name>` | a plain restatement played in a different manner — `tongued`, `sung`, `arched` or `level` |
| `thin` | the drums lose their hat here — a breath, not a stop |
| `without:<part>+<part>` | parts the arrangement does not hear in this section |

(The MKII dumper writes that program's own flags — `fill`, `empty:*`, `strip`,
`mv:*`, `arc:*`, `duel`, `chase:*` — and readers should ignore any they do
not know.)

### Spans

```
#span_cols      section  span  startBar  parts                  flags
#span           1        2     16        drums+bass+keys        hush:keys,desk:darken
```

A span is two turns of the loop, and the arrangement changes on that clock —
the two-loop rule — so the section line is the wrong grain to read the
arrangement at. `parts` is who sounds, `+`-joined, `.` for nobody. `flags`
is everything else the span decides, because a reader that cannot see a
change cannot judge whether it was the right one:

| flag | meaning |
|---|---|
| `thin` | the kit without its hat |
| `half` | the kit in half time: every hit at twice its step, the backbeat on three |
| `hush:<part>` | that part held back to the arc's own quietest — a gain, not a note dropped |
| `desk:<treatment>` | the desk this span is heard on — see `genre-research/THE-ALTERATIONS.md` |
| `desk:<treatment>@<part>` | the same, aimed at one part rather than the whole band |

A span with no flags is `.`. A treatment held across several spans is
written on each of them, because each span IS on that desk; the renderer
rebuilds nothing where nothing changed.

### Per-role rollups

```
#role            lead        87            events by role
#bars_distinct   drums       35   70       distinct bars / bars containing this role
#motion          lead        87   0.500  0.500  0.000     n, leap, step, same
#refused         <text>                   a doubling the program declined, verbatim
```

**`#bars_distinct` is quantised to the written step, not the played one.** Two
bars that play the same notes with different micro-timing are the *same bar*.
The first version of this measure keyed on the fractional position and reported
70 of 70 drum bars distinct — it was counting seeded jitter, not music.

**`#motion`** is `leap` (> 2 semitones), `step` (1–2), `same` (0) as fractions of
that role's onset-to-onset transitions, read on the top voice where a part
strikes several pitches at once. A part reading `1.000 0.000 0.000` never
moves by step; a part with a high `same` is repeating one note.

---

## Events

```
tSec      bar  step   role  lane  voice  pitch  note  durSec   gain   flags
0.0018    0    0.01   lead  lead  lead   71     B4    1.5385   0.740  breath,vib,timbre:wurly
1.5389    0    8.00   lead  lead  lead   66     F#4   0.7692   0.610  portato,tied
0.7275    0    3.78   drums snare s808   .      .     0.1923   0.836  .
```

| column | |
|---|---|
| `tSec` | seconds from the top of the record, 4 dp. **May be negative** — micro-timing can push a hit a few ms before bar 0, and that is real, not an artifact |
| `bar` | grid bar, from the song's own clock (so it survives a tempo map) |
| `step` | fractional position in the bar, 2 dp. `8.00` is exactly on the step; `8.13` is late by the lean, the swing and the jitter |
| `role` | `drums bass keys keys2 lead counter ostinato drone tape scene weather` |
| `lane` | the drum lane (`kick snare hat ride tom2 …`), or the role for a pitched part |
| `voice` | the instrument that actually plays it: the genre's voice for a pitched part (`rhodes`, `sub`, `pluck`, `organ`, `pad`, `flute`), and for a drum whatever the machine's kit has on that lane — `kick snare hat openhat` on the acoustic kit, `k808 s808 h808 oh808` on the analog one |
| `pitch` | MIDI note number, or `.` for an unpitched hit |
| `note` | the same pitch as a name, for reading. `.` when unpitched |
| `durSec` | sounding length in seconds |
| `gain` | 0–1.25, after the one gain formula |
| `flags` | comma list, `.` when empty |

Event flags. **MKIII writes one: the manner the note is played in.** An
unmarked note carries `.`, as it does on paper. The manner is chosen by the
part that wrote the note, from what its instrument can physically produce,
and it decides how long the note sounds, what it weighs against its
neighbours, and how it is struck:

| flag | meaning |
|---|---|
| `.` | plain — the unmarked note, sounding 80% of its written length |
| `tenuto` | held: 95% of the written length, and a shade heavier |
| `staccato` | shortened and separated: 50% |
| `marcato` | struck hard and short: 33% |
| `accent` | leant on. Only on a beat |
| `ghost` | struck with little or no sound, and damped with it. Only off a beat |
| `slur` | hammered on or pulled off: no fresh attack, and no silence before the next note |
| `slide` | arrived at from a whole tone below |
| `bend` | bent a whole tone up during the note, and held there |
| `tremolo` | re-struck four times across its length |

MKII writes its own flags, which a reader of both should know:

| flag | meaning |
|---|---|
| `breath` `portato` `legato` `staccato` | articulation chosen from the line's own contour |
| `tied` | played without a fresh attack — continues the note before |
| `from:<midi>` | a slur glides out of this pitch |
| `vib` | long enough to take terminal vibrato |
| `tail:taper` \| `tail:fall` | how the note ends |
| `hold:<sec>` | how far it is to this part's next note |
| `stack` | a doubling, not an original |
| `halt` | a continuous ground slowing into a stop |
| `timbre:<name>` | which character the voice was asked for |
| `slice:<n>` `rev` | a chopped break: which sixteenth of the source, played backwards |
| `kind:<n>` | the medium's kind |

### Sort order

`tSec`, then `role`, then `lane`, then `pitch`, then `voice`. Fixed so that two
runs produce identical bytes and a diff is about the music.

---

## `summary.tsv`

One row per song at the root of the dump, so a whole sweep can be read without
opening a file: genre, seed, key, mode, tempo, bars, seconds, sections, events,
then `n_<role>` counts, `uniqbars_<role>` as `distinct/total`, and the leap/step/
same ratios for `lead` and `bass`.

This is the table to sort when asking whether a change helped.

---

## Reading it

```bash
# every note the lead plays
awk -F'\t' '$4=="lead"' dumps/.../seed-0007.tsv

# is the bass a line or a pedal?
grep '^#motion' dumps/.../seed-0007.tsv

# which parts never sounded on any seed
awk -F'\t' 'NR>1{for(i=10;i<=20;i++) if($i==0) print $1, $2, i}' dumps/.../summary.tsv

# what changed between two versions of the same seed
diff dumps/mk2/lofi/seed-0001.tsv dumps/mk3/lofi/seed-0001.tsv
```
