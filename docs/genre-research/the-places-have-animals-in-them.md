# The places have animals in them

`2026-08-20`, build `i`. The owner:

> "Bullfrogs, crickets, loons, owls these are the kinds of samples we want as
> atmosphere. Thunder, river also."

## Why this is a second bank and not more `sfx`

The Erang pack's `sfx` shelf holds three environments — wind, catacomb air, a
heavy drone. They are ROOM TONES: one texture, no events in them. Everything
named above is the other kind of atmosphere, the kind with animals in it, and
no synthesis in this program is going to fake a loon.

So it is recorded sound, and it is a separate bank because it has a separate
provenance and a separate licence position, which should never be blurred into
the pack's.

## Where it came from, and what was tried first

`docs/LICENSING.md` says: *prefer clean sources — US public domain, CC0 / CC-BY.*
So those were tried first, and none of them worked from here:

- **Wikimedia Commons** returned HTTP 429 to every request from this host,
  through both `urllib` and `curl`, with a descriptive User-Agent.
- **xeno-canto** — the obvious source for a loon and an owl — retired its v2
  API and v3 requires an account key.
- **archive.org** has CC-licensed audio for all six search terms, and it is
  podcasts *about* frogs rather than recordings *of* them.

That leaves the **BBC Sound Effects archive**, which is the source this repo
already has a documented position on — the deleted rail bank came from it. The
RemArc licence permits personal, educational and research use and excludes
commercial use. This program is personal and not distributed, so the use fits,
and it is stated plainly as **weaker than CC0** rather than waved through. The
ledger row is in `docs/LICENSING.md`.

## Eight recordings

| name | what | archive id |
|---|---|---|
| sceneFrogs | bullfrog chorus, close croaks — Blackwater Refuge, Maryland, rec. Nigel Tucker | NHU05079032 |
| sceneCrickets | night, many crickets and insects — Kakamega Forest, Kenya | NHU05035029 |
| sceneNight | night, tree crickets calling, wind in trees — Ashleim Pool, Israel | NHU05068084 |
| sceneLoon | great northern diver, song, others in the distance — Thingvallavatn, Iceland | NHU05027098 |
| sceneOwl | tawny owl, hunting calls, over a chorus of dark bush-crickets | 07042032 |
| sceneRiver | fast shallow stream over rock, mountain meltwater — Rocky Mts NP, Colorado | NHU05072102 |
| sceneStream | mid-distance fast-flowing river — Chilkoot River, Alaska | NHU05061152 |
| sceneThunder | distant thunder over mountains — Rocky Mts NP, Colorado | NHU05072099 |

2.41 MiB of base64. The file went 8.06 → 10.48 MiB, against a 16 MiB ceiling.

## Three measurements that changed the code

### 1. "Steadiest stretch" finds the birds, not the frogs

The window rule inherited from the deleted `rail_bank.py` is: a bed takes the
steadiest stretch of tape, a one-shot takes the loudest. On a bullfrog that is
exactly backwards — **a chorus of calls is intermittent by definition, so the
steadiest twenty-four seconds is the stretch with the fewest croaks in it.**

Measured on the window it picked: 4.3% of its energy in the frog's own band and
41.4% between 3 and 8 kHz. The picker had faithfully found the insects.

Two fields fix it, both declared per recording rather than guessed. `pick` says
whether a sound is *steady* (a river, a field of crickets) or *dense* (frogs, a
loon, an owl, a thunderclap) — a fact about the animal, written next to the
animal. And `band` says where the subject lives, with the scoring done on a copy
filtered to that band. The second is not decoration: **the tawny owl is buried
under a wall of bush-crickets an octave and a half above it and would never win
an unfiltered vote.** Scored in 300–900 Hz it lands on the best window in the
tape (rank 2 of 200); the frogs land in the top 7% at twice the file's mean
band energy.

### 2. Eighty percent of the owl was DC

`07042032` arrives with a DC offset of **+0.0249** — 80.5% of its measured
energy sits in the 0 Hz bin. Encoded as-is that offset eats ADPCM range and
predictor headroom for something nobody can hear. Every file is de-meaned and
high-passed at 25 Hz with a linear-phase FIR: nothing in an atmosphere bed lives
below that, and the low end of this program belongs to the drone.

### 3. Seventeen decibels of level spread

Peak-normalising is right for an instrument, where the peak is the note. It is
wrong for a bed. Peak-normalised, the loop-region RMS of this bank ran from
−13.4 dB (tree crickets, continuous) to −30.5 dB (bullfrogs, thirteen croaks in
twenty-four seconds). These are dealt one per movement, so a record would change
air and change volume at the same moment — and the volume is what you would
hear.

The Erang pack's three places span seven decibels, so that is the target to sit
inside. Beds are matched to −16 dBFS RMS with a 6 dB limiting budget, soft-kneed
via `tanh` so a croak that pokes through gets rounded rather than squared off.
Result: five of seven inside 1 dB of target, the two sparse ones 3–9 dB under,
and the one-shot keeps peak normalisation because on a thunderclap the peak *is*
the event.

**And the first version of that got it wrong too**, in a way worth writing down:
it measured the boost from the *raw* recording, so a quietly-recorded tape spent
its whole allowance just getting back to where a loudly-recorded one began. The
cap bound on four files of eight and the spread came out **wider** — 11.5 dB —
than the problem it was fixing. Peak-normalise first, *then* match; the cap then
means what it says, which is "how much this bed may be compressed".

## Three things found switched off

The pattern of this repo, again.

**The world bus.** `roleOfBed` matches `/^scene/` and returns the `scene` role,
which `MIX_ROLE_BUS` puts on the **world** mixer row — built on 2026-08-16 for
exactly this reason ("a river is not a record surface"), given its own reverb and
echo sends, and left with nothing routing into it when boxcar synth was deleted.
It arrives closed in every column and a genre has to name it; none did. Fantasy
synth opens it at 0.22 in the room (a place is heard *through* a record, not
beside it) and dungeon synth at 0.35, the same as its war drum, because running
water in stone is half of what a cavern is.

**The `place` trim.** `WORLD.place` was 0.20 — 8.3 dB under `signal` — and the
table says why: boxcar synth's landscape had to sit beneath a steam engine going
past, and the figure was measured *there*. Boxcar synth was deleted and took
every consumer of that number with it. Measured at 0.20, six bars of fantasy
synth's atmosphere rendered alone came out at −50.4 dB against a band at −14:
thirty-six decibels down, which is not background, it is absent. A place is
trimmed like anything else recorded now, at `signal`.

**The seam picker's family list.** The transition one-shots read
`family("sfx", "Noise")` — the *default* shelves — so a genre that declared its
own `fams` got its places from the shelves it asked for and its seams from two
shelves it might not use. Invisible while every genre took the default; the
scene bank is what made it wrong, and it would have been a silent wrong, because
the seam still fires, just with the other pack's thunder.

## And thunder is weather wherever it is filed

`roleOfBed` asked the family before the name, so `sceneThunder` — a thunderclap,
filed with the wood it was recorded in — came back as a *place*: the world bus
at the place trim instead of the weather bus at the weather trim, unable to
reach the `weather` machine's own distance knobs. The name is the more specific
question, so it is asked first now. Measured across the whole bank this moves
exactly one row.

## Where they end up

Fantasy synth takes all four shelves — its form *is* a journey overland and every
one of them is somewhere you could walk through. Eight places in the pool now
against three, on a record that deals four, so two seeds no longer walk through
the same country. Seed 1 is crickets → a stream → an owl wood → a river; seed 2
is wind → a river → a frog pond → wind.

Dungeon synth takes `sceneWater` and leaves the wood. There are no bullfrogs in
a dungeon and an owl needs sky.

Measured on the finished record: the atmosphere sits **29.4 dB under the band**
where the band is playing and **26.4 dB under** in the thin last leg, with peaks
at −26.7 dB — the calls are events you hear, not a texture you infer. The full
mix moved 0.06 dB and the loudest peak in the record is −0.96 dBFS.
