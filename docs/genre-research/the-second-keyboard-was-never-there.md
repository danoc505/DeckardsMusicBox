# The second keyboard was never there — a rack that refused its own machines

*Researched and measured 2026-08-28 for Phase 4 of
`docs/NEXT-BUILD-THE-PART-YOU-REMEMBER.md`.*

> **The owner:** *"I think we are missing the hook, a second keyboard. I think
> we might have to think of the keyboards as the guitars."*

> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Standing caveat.

Prior sheets on this part: `the-second-keyboard.md` (it shadows the first, and
the fix for that) and `the-second-keyboard-rhythm.md` (what a pad does, and the
`pad: {hold, press}` field). **Neither asked whether the part exists at all.**
This one does, and the answer was no, in a third of records, for a reason that
had nothing to do with music.

---

## 1. ⚠ MY OWN PUBLISHED DIAGNOSIS WAS WRONG, TWICE, IN WRITING

Recorded first because this project's most expensive habit is a confident wrong
answer, and this is one.

**Phase 1 reported, in a commit message and in a code comment:** the second
keyboard is absent because `tryPad` degrades to nothing when no register band
clears the parts already placed — the file's own documented behaviour, quoted
approvingly. **The register never came into it.** Not once.

**The real chain, traced end to end:**

```
  resolvePicks:   out[slot] = fits(want) ? want : (fits(drawn) ? drawn : "auto")
                  fits = m => m !== "auto" && canFill(slot, m)

  canFill:        const kind = SLOT_ACCEPTS[slot] || slot;
                  if(M.slot === kind) return true;      <-- the fault

  buildKeys site: const k2raw = (k2m && k2m !== "auto") ? allocKeysBand(R) : null;
                  const tryPad = fn => { if(!k2band) return []; … }
```

A draw that lands on a machine `canFill` refuses **falls silently through to
`"auto"`** — and for this one slot `"auto"` does not mean "the rig's default
box", it means **`k2raw` is null and the pad is never built at all.**

**And `canFill` was refusing machines whose own declaration names that rack.**
`SLOT_ACCEPTS = { keys2: "keys" }` means "the second keyboard also takes
first-keyboard boxes", but `kind` **replaced** the slot instead of extending it,
so `M.slot === kind` was false for every box declaring `slot: "keys2"`.

**The measurement said so all along and I read past it.** The pool's dead
weight — `erStringsMid(4) + erKeyMid(2) + erPluck(2) = 8 of 23 = 34.8%` —
against **7 of 20 records observed with no second keyboard.** Those two numbers
are the same number, and I had both of them in front of me when I wrote the
register explanation.

---

## 2. THE AUDIT — 11.1% OF EVERY MACHINE POOL IN THE FILE WAS UNREACHABLE

Once the shape was clear, the same question was asked of every pool:

```
  dungeonsynth.keys      dead  3/24   13%   erPluck(3)
  dungeonsynth.lead      dead  1/14    7%   erLeadLow(1)
  dungeonsynth.keys2     dead  8/23   35%   erStringsMid(4) erKeyMid(2) erPluck(2)
  fantasysynth.keys2     dead  8/23   35%   erStringsMid(4) erKeyMid(2) erPluck(2)
  ds2.keys               dead  3/24   13%   erPluck(3)
  ds2.lead               dead  1/17    6%   erLeadLow(1)
  ds2.keys2              dead  8/23   35%   erStringsMid(4) erKeyMid(2) erPluck(2)

  TOTAL: 32 of 287 = 11.1% of all pool weight named a box that cannot be racked
```

**Three sampled instruments could fill NO rack at all** — `erStringsMid`,
`erKeyMid` (both `slot: "keys2"`, refused by the rule above) and `erPad`
(`slot: "drone"`, which is not a rack). The highest-weighted entry in the
second-keyboard pool was one of them.

**And two of the faults were the table's, not the engine's.** Checked against
the Erang bank index rather than against the names:

| box | declares | the bank says | verdict |
|---|---|---|---|
| `erPluck` | `slot: "ostinato"` | Plucked, 261.8 Hz | **the declaration is right** — it is the figure instrument, and it was sitting in the `keys` and `keys2` pools |
| `erLeadLow` | `slot: "bass"` | Lead, **32.7 Hz — C1** | **the declaration is right** — it is the low Erang lead and it is a bass instrument, and it was sitting in the `lead` pool |

So the engine bug was fixed in the engine and the table errors in the table,
rather than one bodge covering both.

---

## 3. WHAT IT DID

```
  records with a second keyboard, 20 seeds
                     before    after canFill    after the pools too
    ds2               13/20        15/20             20/20
    dungeonsynth      13/20          —               20/20
    fantasysynth      13/20          —               20/20

  dead pool weight across the whole file:  32/287  ->  0/273
```

**And the change is surgical, which is the evidence that it was a fault rather
than a taste.** Comparing printouts before and after:

```
  lofi-1, lofi-7, synthwave-1, synthwave-7      BYTE-IDENTICAL
  fantasysynth-1                                4 of 3085 lines differ  (0.1%)
  dungeonsynth-1 / ds2-1                       14 of ~1400 lines        (1%)
  dungeonsynth-7 / ds2-7                      163-166 of ~1500 lines    (11%)
```

lofi and synthwave carry no Erang boxes in their pools and did not move at all.
The records that were already fine barely moved. **Seed 7 — which had ZERO bars
of second keyboard in every measurement taken this session — now has 52 to 67.**

---

## 4. "THE KEYBOARDS AS THE GUITARS" — WHAT THE SOURCES SAY, AND WHAT IS BLOCKED

The owner's framing has a direct source and it is a good one:

> **"Keyboard players in metal can function as rhythm guitarists who play chords
> and fill in the spaces."** [corpus:gearspace, playing synth in a metal band]

And for the symphonic-black-metal lineage DS2 sits beside, the method is
**layering to a wall** rather than substitution: bands use "a fairly limited set
of pads... combined with chorus and reverb", creating "atmospheric 'wall of
sound' effects through keyboard layering rather than replacing guitars
entirely"; in Emperor "keyboards and synths add a symphonic epicness".
[corpus:kvraudio, corpus:wikipedia/Black_metal]

**So the rhythm-guitar role is a HELD WALL, not a riff — and that is what this
part now does in DS2's climax**: a sustained pad (`pad.hold: 0.75`, inherited)
through the Big Muff at `meat.amt 0.66`, trading with the tune, under a
sixteenth double kick. The Phase 1 duel `{duel: ["lead", "keys2"]}` fires for
real now that the part exists.

**The band sources agree the second keyboard should stay the smaller part:**

> the second keyboard is the **auxiliary** part, and "the aux keyboard player
> needs to play **less** than the primary keyboard"; when playing pads, "take
> minimal fingers and find common tones that work through chords."
> [corpus:worshipartistry, corpus:mi.edu]

### ⚠ AND THE PLAN'S ITEM H IS BLOCKED BY ARCHITECTURE, NOT DECLINED BY TASTE

The plan said the second keyboard should *"carry the fixed figure through DS2's
climax"* — a rhythmic part where the fuzz and the double kick are. The mechanism
for that exists (`pad.press`, a weighted list of extra sixteenths) and
`the-second-keyboard-rhythm.md` §3 licenses it **only** for the case DS2's
climax actually is:

> *"Not all pad sounds need to be sustained... **In upbeat productions**, a
> simple rhythmic repetition of synth chords can help reinforce the track's
> groove and increase clarity."* [corpus:soundonsound]

**It cannot be scoped there.** `const PAD = (opts.sustain && G.pad) || {}` is
read at **material build time**, and a material is built once and then played in
several legs — so `pad.press` is a property of the material, not of the section.
Declaring it on ds2 would make the pad rhythmic in the quiet legs too, which the
same source explicitly does not license.

**What would close it:** either a per-leg material, or moving the pad's press
decision out of `buildKeys` and into the arrangement, where the movement is
known. Both are engine work with their own before-and-after, and neither belongs
in a phase whose other half is a one-line bug fix. **Named, not built.**

---

## SOURCES

- [Playing Synth in a Metal Band — Gearspace](https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/1243231-playing-synth-metal-band.html) — the keyboard as rhythm guitarist
- [Black metal — Wikipedia](https://en.wikipedia.org/wiki/Black_metal) · [Black metal synth — KVR Audio](https://www.kvraudio.com/forum/viewtopic.php?t=378848) — limited pads, chorus and reverb, layering to a wall rather than replacing guitars
- [How to Play Auxiliary Keys — Worship Artistry](https://worshipartistry.com/greenroom/musicianship/skill-building/how-to-play-auxiliary-keys) — the aux keyboard plays less than the primary; minimal fingers, common tones
- [Keyboard Player's Role in a Band — MI](https://www.mi.edu/in-the-know/keyboard-players-role-band-collaboration-performance/) · [Two keyboard players in a band — Keyboard Corner](https://forums.musicplayer.com/topic/123061-two-keyboard-players-in-a-band/)
- `docs/genre-research/the-second-keyboard-rhythm.md` §3 and §5 — the pad's sustained default, the "upbeat productions" exception, and the `pad: {hold, press}` field
- `docs/genre-research/the-second-keyboard.md` — the shadowing defect and its fix
- The Erang bank index in the program itself (`ERANG_INDEX`) — the measured root pitch of every sample, which is what settled `erPluck` and `erLeadLow`
