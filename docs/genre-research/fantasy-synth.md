# FANTASY SYNTH — the brief, the research, and what the program can already do

*2026-08-19. Owner: "copy dungeon synth as a new genre… Fantasy Synth… more
lively, builds up to a larger conclusion, tells a more exciting story, a band
of heroes explores then fights the monster. 20 mins, 5 min sections, 15 mins in
is the big fight, last 5 mins the journey home. Lean on modal jazz. More
drones. Tell a story with the instruments each having a part."*

---

## 1. THE NAME IS NOT INVENTED

**"Fantasy synth" is a named subgenre, and Erang is credited as its pioneer** —
"blends Dungeon Synth with heroic and adventurous themes, building entire
mythologies around his albums." Erang's sample packs are already the backbone
of this program's dungeon synth, so the palette is in the building.

### The neighbouring subgenres, for what this one is NOT

| subgenre | what it is |
|---|---|
| old school / classic | 1990s, black-metal adjacent: "fantasy, atmospheric, epic, dark, cold, medieval, minimal repetitive" |
| comfy synth | "peaceful, melancholic, calm, mellow, pastoral, soothing" — the tavern-and-meadow wing |
| winter synth | "cold, sombre, lonely, ethereal" — more open, more minimal, more drone, overlapping dark ambient |
| forest synth | field recordings and folk instruments; pagan and druidic |
| chip synth | "lo-fi, dark, epic, CRPG, nostalgic" — 80s/90s tabletop and computer RPG |
| **fantasy / adventure synth** | **heroic and adventurous themes, mythology-building** |

**Nobody documents fantasy synth technically.** There is no melodigging-style
table of tempo, harmony and instrumentation for it as there is for dungeon
synth. So this genre's numbers will be `[CHOSEN]` far more often than sourced,
and that is marked here rather than hidden.

---

## 2. THE BRIEF, AS ANSWERED

| decision | answer |
|---|---|
| tempo | **an arc**: ~72 setting out → ~130 at the fight → ~88 coming home |
| modes | **a mode per movement, AND a key shift for the fight** |
| story | **hero theme + monster theme, both returning transformed** |
| the fight | drums forward and fast · dissonance allowed · everything at once · **the monster's theme on its OWN instrument, duelling the hero's lead** |
| the duel | **escalating** — trade phrases, then the turns shorten and overlap |
| drones | **two or three stacked at once**, and **the whole rack on them** |
| palette | **add horns and brass** to the existing pack |
| ending | **triumphant but thinned — something was lost** |

---

## 3. WHAT THE PROGRAM CAN ALREADY DO — measured, not assumed

### 3.1 The four movements already exist as a mechanism ✅

Dungeon synth's `form.plan` is a **named movement list** with its own section
pool and bar range per movement:

```
descend → halls → deeper → return
```

Fantasy synth's four movements are the same object with different names,
proportions and pools. **No new mechanism.**

### 3.2 `form.tempoArc` is built and NO GENRE HAS EVER DECLARED IT ✅

```
by:   { <section function>: [multiplier at its first bar, at its last] }
ease: "cos" (default) or "lin"
```

**It redistributes time, it does not add any** — the map is normalised so the
mean seconds-per-bar still matches the drawn tempo. So "20 minutes" stays 20
minutes and the arc can be as steep as the table likes. A faster movement
simply covers more bars in its five minutes.

### 3.3 The horns are already built ✅

`horns`, `brass` (keys slot), `carnyx`, `bassOboe`, `corAnglais` (lead slot) —
all present instruments. "Add horns and brass" is a machine-pool entry, not a
new voice. The repo also has `brass-arranging.md` and `carnyx-usage.md`.

### 3.4 The key shift for the fight is nearly free ✅

`keyShift` moves the tonic and — at `change` probability — the mode too, and it
fires on **material C, the bridge**. If the fight movement is built on material
C, the fight gets its key and mode change from a mechanism that already exists
and is already blend-registered.

### 3.5 ⚠ A DISTINCT MODE FOR ALL FOUR MOVEMENTS IS **NOT** SUPPORTED

This is the one answer the program cannot honour as asked. Modes are drawn
**per record**, and chord sets are built **per material (A/B/C)**, not per
movement — and movements reuse materials. So what is reachable today is:

- one mode for the record, **plus** a second mode for whichever movement is
  built on material C (the fight) — **two modes, not four.**

Four would need chord sets derived per movement, which is real surgery on
`makeMaterials`. It is a genuine build, not a table line.

### 3.6 The drone stack is a small build

`drone: { unit, hold, pedal, octave, continuous }` emits **one** note. "Two or
three stacked" needs a `stack: [0, 7, 12]`-style field so the lane emits
several intervals at once. Small and contained.

### 3.7 The duel is the big build

Two leads with their own material, alternating and then overlapping, is the
largest new mechanism in the brief. The `counter` role and
`call-and-response.md` are the nearest existing machinery.

---

## 4. WHAT 20 MINUTES COSTS

Dungeon synth: `form.target: [96, 5, 16]` → 96–160 bars → **10.7–12.8 min** at
52–78 BPM. Twenty minutes at a mean of ~95 BPM is roughly **340 bars**, so the
target roughly triples. Four movements of five minutes each, with the fight
faster, means the fight covers **more bars** than the others.

## 5. BUILD ORDER

1. The genre table — a copy of dungeon synth, retuned: tempo band, target bars,
   `form.plan` renamed to the four movements, brass in the machine pools,
   `roleGain` rebalanced, `voicing`/`parallels`/`landini` carried over.
2. `form.tempoArc` declared — the first genre ever to use it.
3. The drone stack.
4. The fight: dissonance allowed, tutti, drums forward, keyShift on material C.
5. The hero and monster themes, returning transformed.
6. The duel.

1–4 are table work and one small mechanism. 5 and 6 are real builds.
