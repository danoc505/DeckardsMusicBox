# MUSIC OVER A HARMONY THAT DOES NOT MOVE

*Researched 2026-08-08. The user: "What can we learn from modal jazz in regard
to the evolution of a song? Our min techno is a failure, the bassline is trash
and we fail to capture the slow evolving nature of minimal techno — it should
be more like generative modular."*

Those are the same question. Modal jazz and minimal techno are the two musics
this program hosts that **remove functional harmony on purpose**, and both then
have to answer "so what moves?" This sheet is what the sources say, measured
against what we actually do.

---

## 1. THE MEASUREMENT FIRST — the bassline is trash, and here is how trash

40 seeds a genre, read off the performance:

```
  genre         notes   root   fifth   other   repeats own note   distinct/bar
  plastikman    29480  74.9%    0.7%   24.4%       64.4%             1.51
  acid          89075  56.2%    8.9%   34.8%       42.7%             3.08
  lofi           4710  20.3%   14.8%   64.8%       12.8%             2.20
  jungle        25119  18.0%   13.4%   68.6%       17.2%             2.28
```

**Plastikman is the most static bass in the file by a wide margin** — three
quarters of its notes are the root, it plays the note it just played almost two
times in three, and a bar contains 1.51 distinct pitches. It is *worse than the
acid house genre it borrows its generator from* on every column.

**And it is running `bassStyle: "acid"`** — it does not have a bass of its own
at all. `BACKLOG` §6.8 already recorded that acid, plastikman and jungle had
never had their basses researched; jungle's was done (`jungle-bass.md`, drone →
riff, bars holding one pitch **99.8% → 14.4%**) and plastikman's never was.
So the user is describing a known, measured, unfixed hole.

## 2. MODAL JAZZ — what replaces the chord changes

> "'So What' is set in the Dorian mode and consists of **16 bars of D Dorian,
> followed by eight bars of E♭ Dorian and another eight of D Dorian**."
> — [Wikipedia, *So What (Miles Davis composition)*](https://en.wikipedia.org/wiki/So_What_(Miles_Davis_composition))

Two things in that sentence, and this program has neither.

**(a) THE HARMONY DOES MOVE — rarely, and by a WHOLE MODE.** Not a chord
change: the entire scale shifts up a semitone for a third of the form and comes
back. That is the modal answer to "how does a piece with no changes go
anywhere". Our genres pick one mode in stage 1 and never leave it — a mode is
drawn per SONG, so a 9-minute plastikman record is one mode for nine minutes.

**(b) AND UNDER IT, THE BASS IS GIVEN THREE JOBS — not one.**

> "Bassists gain the freedom to **pedal a single note, play ostinatos (short
> repeated figures), or engage in melodic conversation with the soloists.**
> Paul Chambers's bass introduction on 'So What', a **two-note call-and-response
> motif** answered by Bill Evans's piano, is one of the most recognisable
> moments in jazz precisely because it announces a new kind of rhythmic
> relationship between instruments."
> — [The Sound Atlas, *Modal Jazz: Origins, Lineage, and Sound*](https://thesoundatlas.org/discover/modal-jazz)

**That is the whole diagnosis in one quote.** Static harmony offers the bass
three roles; ours does the first one, degenerately. It pedals — and pedalling
is a legitimate choice — but a pedal is supposed to be a *decision against* the
other two, and here it is the only thing the generator can produce. The third
option, **melodic conversation**, does not exist in this program at all: no part
answers another part. `deriveCounter` was taught to sit in the gaps after the
lead (a real improvement) but nothing anywhere is a *call and response*.

> "the modes allowed the solos to unfold **gradually**" — [ibid]

Gradual unfolding over static harmony is precisely what the user means by "slow
evolving", arrived at from the other end of the century.

## 3. MINIMAL TECHNO — the same answer in different clothes

The genre's own literature says the movement is timbral and that the mechanism
is **phase**:

> "typical processes include **phasing (two identical patterns drifting out of
> sync)**, which creates the non-repeating effect" — and the technique named
> for it is "multiple LFOs and modulation sources running at **slightly
> different rates** to create slow phase shifts that prevent exact repetition
> while maintaining the minimal aesthetic."
> — [modular/technique summary via search; ⚠ **forum material, not fetched**]

And the repo already holds the primary-source version of this, from its own
earlier research: minimal techno "evolves through micro-variation (filtering,
panning, tiny automation), **not through adding new parts**" [corpus:beatkey],
and Hawtin's own account of doing the arrangement by hand on the faders.

**WHAT WE HAVE AGAINST THAT, measured:** plastikman carries 131 motion lanes —
73 LFOs, 28 section moves, 13 arcs, 5 occurrence steps, 4 snaps, 2 throws, 2
gestures, 1 p-lock. That is a lot of movement and it is why the genre is not
*silent*. What it is not is **phased**: every LFO is independent and
free-running, so nothing is *two copies of one thing drifting apart*. The
program has no notion of two patterns at nearly the same rate.

## 4. SO: WHAT WE HAVE AND WHAT WE ARE MISSING

The existing audit is `BACKLOG` §6 and most of it still stands. Re-measured
today, the shape of the hole is:

**HAVE.** Modes (7), chord extensions to the 13th, measured chord quality from
1170 jazz tunes, neo-Riemannian P/L/R, a non-chord-tone law in both directions
(arrival and departure), a low-interval limit, register bands per role, voice
leading cost with a weighted top line, drop-2, and a per-genre bass-tone table.

**MISSING, and ranked by what the two questions above expose:**

1. **The mode never changes inside a song.** "So What" moves its whole scale
   twice in 32 bars. Nothing here can. This is the single largest structural
   gap for every genre that removes functional harmony, and it is *cheap* —
   stage 1 draws a mode, and a section could draw a different one.
2. **No part answers another part.** Call and response is absent from the whole
   program. The counter sits in the lead's gaps; that is spacing, not
   conversation.
3. **No phase relationship between two patterns.** Everything is independent
   and free-running. Two lanes at 15 and 16 bars would drift in and out over 4
   minutes, which is generative-modular's core trick and is arithmetic, not
   samples.
4. **The bass has one job per genre, forever.** `bassStyle` is a single string.
   Modal jazz says the bass under a static harmony has three available roles
   and chooses between them; ours cannot change role mid-record.
5. **And the older §6 rows are unchanged**: no counterpoint rules (oblique
   motion is 51.7% of Bach and is unmodelled), Bach's chorales are ingested
   nowhere, `coltraneCycle` is still drawn by nobody, and `harmMinor` is
   defined and used by nobody.

## 5. WHAT I HAVE NOT DONE

**I have not touched a table on the strength of this.** The user's verdict is
that a genre is a failure; the honest response to that is a design, not a
one-line edit to `bassStyle` while my own research is an hour old. Two things
in particular need deciding before anything is built:

- **Is plastikman's bass a 303 at all?** The primary source says it is — "one
  of the core fundamental sounds of Plastikman has always been Roland TB-303
  basslines" — so the fault may be the acid generator's *settings* under this
  genre's thinner and its `avoidKick`, not the style. That is a measurement
  nobody has taken.
- **Does the mode shift belong to the genre or to the form?** "So What" moves
  it on a section boundary, which in this program is stage 2's territory, not
  stage 1's — and stage 1 currently owns `mode`. Moving it is a stage-boundary
  change and wants its own commit.

**Nothing here has been heard, and the one verdict I do have says the current
state is a failure.** That verdict is the most valuable input in this sheet.
