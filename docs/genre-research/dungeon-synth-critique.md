# Dungeon synth, critically: what is missing, what is wrong, what would be 10x

*Researched and measured 2026-08-15. The owner: "Do some research on Dungeon
Synth — what are we missing, what are we doing wrong? What could we improve
10x? Critically evaluate our dungeon synth genre and give me a plan." This
sheet is the sixth on the genre and the first written AGAINST our own output:
the earlier five say what the genre is; this one says where our records fall
short of it. Every number below was measured today over 20 seeds of the
current build (`2026-08-15m`).*

## 1. The critical standard, from the genre's own critics

**Simple is not simplistic.** The sharpest sentence found anywhere on the
genre, from a critic explaining why most DS bores him and what would fix it:

> "It's important to note the difference between simple music and simplistic
> music. A lot of black metal is dirt simple, but **through effective
> manipulation of texture and arrangements something complex can grow from
> it. I'm yet to hear DS that quite manages this**... I enjoy Fief and
> Sequestered Keep and some others, but it feels like there's a lot of lost
> potential in what they're doing — the music is fine but **it could be so
> much more**." [Hate Meditations, "Dungeon synth might in fact be good",
> author's reply]

The acts he names as pointing past the genre's ceiling — Khand, Wongraven,
Summoning's Lost Tales, Burzum's ambient work, early Lord Wind — are all
**melody-forward**: one tune, carried, with the complexity in what happens
AROUND it, not in more notes.

**The hallmark is the simple repeated melody.** "Some hallmarks of the genre
are the heavy or exclusive use of synths and **simple, repeated melodies**"
[The Camo Pulpit, "Dungeon Synth: An Analysis"]. The same essay places the
genre nearer Terry Riley's minimalism than black metal — repetition as the
form, not as a failure of invention.

**The album is a place, not a set of songs.** The Camo Pulpit's case study of
Jashlykk: field recordings of water "anchor the sound, forming the lowest
level" and the album "feels **less like a series of discreet songs and more
of a wending path through the woods**". The scene layer is structural, not
decoration.

**Decay is a compositional device, not a finish.** The second case study,
Til Det Bergens Skyggene: "the recordings sound like they were committed to
**warped tape**... where other dungeon synth groups create a past imaginary,
TDBS **instantiates itself as past**. Sites and moments of breakage and
interruptions of normal service are topoi of interest."

**What the community itself calls bad DS**: "setting a low bar for musical
ability and content (the familiar muzak charge)", "content saturation",
records that are texture with nothing to remember. What it praises: transport
("its ability to transport the listener to a different world"), charm in the
unpolished ("the dropped notes not always being quite on-time"), and
storytelling ("creating specific sceneries... rather than relying on
repetitive formulas"). [search synthesis; RYM genre page, The Camo Pulpit]

## 2. Our records, measured against that standard (20 seeds, 2026-08-15m)

| fact | measured | the standard says |
|---|---|---|
| tune's share of pitched notes | **7–20%, median ~10%** | the simple repeated MELODY is the hallmark |
| figure (ostinato) notes per record | **555** — 3.2× the tune's 171 | the busiest part of our records is one no source names |
| accompaniment notes per record | 847 | — |
| instruments carrying the tune per record | **2.5** | the classic track keeps ONE voice telling the story |
| tune's span | 9 semitones | fine — the narrow modal melody is right |
| tune's interval diet | 38% repeated pitch, 41% steps, few leaps | fine in shape |
| drums coverage | 27–54% of each record | fine — the genre is often drumless |
| record length | ~11 min | fine |
| scene sounds (water, wind, fire, storm) | **none exist** | Jashlykk's lowest layer; "the wending path" |
| a tolling bell | **none exists** | genre furniture since Mortiis |
| decay across a record | fixed tape depth, no arc | TDBS: decay IS the composition |
| both chord parts on one instrument | bassoon on keys AND keys2 (seed 3), VP-330 on both (seed 5) | two parts, one colour — the desk audit found it as "doubled faders" |

**The verdict in one sentence: we built the accompaniment of a dungeon synth
record and made the melody a guest in it.** Our variation machinery adds and
redistributes NOTES (a 555-note figure) where the genre's best practice
varies TEXTURE around few notes — which is precisely the "simplistic, not
simple" failure the critics name, from the opposite direction.

## 3. What we are doing RIGHT, so the plan does not break it

Tempo 52–78 against the funeral-march reading; modal shuttles; the recorded
instrumentarium (harp, flutes, strings, war drums, taiko, contrabassoon,
hurdy-gurdy, brass, carnyx-as-signal); the drone ground; tape and room; the
war-drums-in-front balance the owner asked for; parts written in separated
registers. None of this is wrong. It is the *hierarchy* that is wrong — and
two whole layers (place, decay-as-arc) that are missing.

## 4. THE PLAN — five phases, each independently shippable

**Phase 1 — THE TUNE BECOMES THE PROTAGONIST.** The 10x lever, and the
cheapest. One lead voice per record (the ladder may still swap for ONE
contrast section — the classic B-section colour change — not 2.5 times);
the tune present in more sections and restated LITERALLY (the naive repeat
is the genre); the figure demoted from 555 notes to an accompaniment
(sparser pattern, quieter, resting more); development by texture, not by
new notes. Absorbs open tasks #46 (interval budget) and #47 (restatement at
a new pitch level — the one legal development). Blast radius: every DS
record, deliberately — this IS the re-hierarchy.

**Phase 2 — THE PLACE.** A scene layer under the record: wind, water, rain,
fire, a distant storm — synthesized honestly (filtered noise is what wind
IS) or CC0 field recordings, drawn per record like every other element, low
in the mix, entering at section boundaries the way Jashlykk anchors tracks.
The record opens ON the place before the first note and closes back into it.

**Phase 3 — DECAY AS A DEVICE.** The tape stops being a fixed finish: a
drawn arc from cleaner to more decayed across the record (or the reverse —
emerging from the past), wow/flutter/dropout deepening by section; an
occasional section boundary that BREAKS (a dropout, a splice) instead of
crossfading. TDBS as a vocabulary, bounded by draws.

**Phase 4 — THE MISSING FURNITURE.** A tolling bell (none exists in the
program — find a CC0/free recorded bell: VCSL and VSCO's miscellania are the
first shelves to check); the VCSL Renaissance shelf already found and
documented (recorder consort, Renaissance organ, psaltery) — the actual
instrumentarium the genre imitates; and the audit's finding closed: the
second chord part refuses the instrument the first already drew, so two
parts are never one colour.

**Phase 5 — TEXTURE-NOT-NOTES VARIATION.** The Hate Meditations criterion
built as machinery: section variation by re-registration (same notes, new
octave/instrument doubling), by filter and space (the arrangement sheet's P2:
"we have options with FX"), by dropout (a part sitting out a repeat), instead
of by rewriting patterns. This is what makes literal repetition listenable —
and it is what our variation engine does not yet know how to do.

Order matters: Phase 1 changes what the records ARE; 2 and 3 change what
they feel like; 4 and 5 deepen both. Each phase re-deals dungeon synth only,
each states its blast radius, and nothing here is judged done until the
owner has listened.

## Sources

- [Hate Meditations — Dungeon synth might in fact be good (2022), incl. the author's reply naming the simple-vs-simplistic criterion](https://hatemeditations.com/2022/04/02/dungeon-synth-might-in-fact-be-good/)
- [The Camo Pulpit — Dungeon Synth: An Analysis (2019): the Jashlykk and Til Det Bergens Skyggene case studies](https://thecamopulpit.home.blog/2019/05/26/dungeon-synth-an-analysis/)
- [Rate Your Music — Dungeon Synth genre page](https://rateyourmusic.com/genre/dungeon-synth/)
- [Grammy.com — Inside Dungeon Synth scene report (Mortiis et al.)](https://www.grammy.com/news/dungeon-synth-scene-report-mortiis-fen-walker-siege-malfet-black-metal/)
- Measurements: 20 seeds of `2026-08-15m`, this repo, scripts in the session scratchpad.
