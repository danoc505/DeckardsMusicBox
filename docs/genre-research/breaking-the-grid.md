# Breaking the grid — section lengths for the dungeon synths

*Researched 2026-08-28 for Phase 2 of `docs/NEXT-BUILD-THE-PART-YOU-REMEMBER.md`.*

> **The owner:** *"The songs are always too safe and formulaic."*

> **NOTHING HERE HAS BEEN JUDGED BY EAR.** Standing caveat.

This sheet does **not** repeat `docs/genre-research/section-lengths.md`, which
already holds the device (cadential extension), its direction (adds, never cuts),
its sourced frequency (one in seven, from a repertoire survey) and the reason it
must add rather than cut in this program specifically. **Read that first.** What
is here is the new work: what the measurement says now, what fresh sources say
about *this* genre, and the one place where the sources argue against the change.

---

## 1. THE MEASUREMENT, RE-TAKEN

`section-lengths.md` measured this in 2026-08-17 and it has not moved. Off the
printout, 2026-08-28, four DS2/dungeon synth records at seeds 1, 3, 7 and 42:

```
  section lengths in bars:   intro 4, then 16 — every section, every record
                             41 of 41 sections across the four
```

lofi and synthwave are *not* in this state — lofi measures `{2, 3, 4, 8}` and
synthwave `{4, 8}` — because **lofi is the only genre in the file that declares
`form.transition`**, and its 2- and 3-bar sections are that mechanism. Fantasy
synth measures `{16, 20, 24}` because it is the only genre that declares
`form.extend`.

So the two devices already exist, each is declared by exactly one genre, and the
dungeon synths declare neither.

---

## 2. ⚠ THE GENRE'S FOUNDING RECORD ARGUES AGAINST THIS, AND THAT IS THE MOST
## IMPORTANT THING ON THIS SHEET

The honest finding, written down first because it is the inconvenient one.

**Mortiis, *Født til å herske* (1994)** — the record credited with
single-handedly starting the genre — **is one long song split across two tracks,
27:37 and 25:23, 53 minutes total.** Its described method is the opposite of
structural variety:

> "builds on the depressive beauty and **numbing repetition**"
> "**small yet intricate variations on its repeating parts**"
> "subtle variations and repetitive elements **rather than dramatic structural
> changes**"
> [corpus:albumoftheyear/Født til å herske, corpus:wikipedia, corpus:metal-archives]

And the practitioner guides agree in the same direction: *"Most dungeon synth
consists of a single loop repeated endlessly, with instruments coming in and out
and mild variation here and there"* [corpus:erichgrunewald]; *"Keep the melody
simple, as dungeon synth often relies on repetitive patterns to build
atmosphere"* and the genre *"relies on gradual transitions and subtle dynamics"*
rather than structural events [corpus:dungeonsynth.neocities.org/howto]. The
repo's own transcripts say it too — *"in dungeon synth we can really get away
with looping the same"*, and Dino synth keeping *"the same chords repeat
throughout the whole song"* deliberately, *"to keep the track extra primitive"*.

**So a source-only argument would leave the grid alone.** Three things outrank
that here, and they are named rather than assumed:

1. **The owner's judgement is a primary source about this program**, and it
   outranks a source about somebody else's record. He has heard these records;
   Mortiis has not.
2. **The device adds and never cuts.** A 16-bar section that runs to 18 is still
   a 16-bar block — it simply refuses to end where you expected. Nothing about
   "numbing repetition" is given up; the block is not broken, its *edge* is.
   This is precisely why `section-lengths.md` §3 chose extension over odd
   lengths, and the reason transfers intact.
3. **DS2 is not archival dungeon synth.** It is the genre with metal driven into
   it, at the owner's instruction. A source about the 1994 record is evidence
   about the parent, not a veto on the child.

**What this rules out:** wholesale re-sizing of `form.lengths`. The plan's
Phase 2 named that as an option and this sheet declines it. Different base
lengths per function would change the *shape of the block*, which is the one
thing every source above defends, and it would change record length, which the
owner ruled out on 2026-08-28 ("leave length alone"). The two additive devices
get the variety without spending either.

---

## 3. WHAT MODAL MUSIC DOES WITH PHRASE LENGTH

The one positive argument the genre's own lineage supplies.

Dungeon synth is modal and medieval-facing; this program's dungeon synth table
is built on open fifths, organum and modal cadences. **Plainchant — the music
that vocabulary comes from — is non-metrical.** Its common characteristics are
"nonmetrical and modal", which is explicitly contrasted with "later regular
four-bar phrase structures", and its phrases are shaped by **cadential motion**
— "the way in which individual phrases are brought to a close" — rather than by
counting bars [corpus:britannica/mode-plainchant, corpus:colby/Lackner,
corpus:medieval.org].

That is not a licence for random lengths. It is an argument that a phrase in
this idiom ends **when its cadence lands**, not when the bar count runs out —
which is the cadential extension exactly, arriving from the genre's own
ancestry rather than from a general repertoire survey.

The community guide points the same way at the level of form, recommending
**ABAB, ABAC, ABCBC** and for the more experienced **ABCABC, ABBACC, ABACDDC**
[corpus:dungeon-synth.neocities.org/music-making-guide] — letters that differ in
*character*, and in practice in length.

---

## 4. THE TWO DEVICES, AND WHY EACH ONE

| device | what it does | why here |
|---|---|---|
| **`form.extend`** | a section runs 2 or 4 bars past its own ending | The sourced device. Adds, never cuts. Frequency from a repertoire survey. |
| **`form.transition`** | splices a **1–3 bar** section before an arrival | The only way this file can produce a section shorter than four bars. It is *additive too* — a new short section, not a shortened long one. |

**Why the transition matters more here than anywhere else.** Measured across
four genres and 24 records each, `section-lengths.md` and the mechanism's own
comment agree: *"every section is 4, 8, 10, 12, 16, 18 or 20 bars, and NOTHING
IS EVER 1, 2, 3, 5 OR 7."* At dungeon synth tempi a bar is long — at 54 BPM a
2-bar transition is **nine seconds**, which is an event, not a hiccup. The
device is proportionally *bigger* in a slow genre than in lofi, where it already
lives.

The theory names the shape: transitional writing shows **"irregular hypermeter
and irregular phrase lengths"** [corpus:openmusictheory], and `002`'s own
strongest marker was *"the music broke out of the structure of the phrasing that
we'd seen so far, and I think this might be the most important factor at play
here."*

---

## 5. TWO THINGS FOUND IN THE CODE WHILE READING IT

Both are reported rather than fixed here, because neither is Phase 2's job.

**`on: 4` IN LOFI'S TRANSITION IS DEAD CONFIG.** The declaration reads
`transition: { before: [...], chance: 0.55, bars: [...], energy: 0.5, on: 4 }`.
The reader takes `TRN.bars`, `TRN.before`, `TRN.chance` and `TRN.energy` — and
nothing anywhere reads `TRN.on`. It has never done anything. Not copied into the
new declarations. **This file treats dead config as a defect**, so it is written
down here rather than left to be inherited by the next genre that copies lofi's
line.

**`EXT.bars` IS A POOL, NOT A RANGE — and I read it wrong first.** The draw is
`pool[floor(rng * pool.length)]`, so fantasy synth's `bars: [4, 8]` means *four
or eight*, never six. `section-lengths.md` describes boxcar's `[2, 4]` as "two or
four bars", which is right, but the bracket notation reads as a range everywhere
else in this file (`tempo: [88, 116]`, `thinTo: [1, 2]`) and it is the one place
it does not. Worth the line, because a future table writing `bars: [2, 8]`
expecting a range would get a coin-flip between a 2-bar tag and an 8-bar one.

---

## 6. WHAT IS BEING DECLARED

| genre | `extend` | `transition` |
|---|---|---|
| dungeonsynth | **new** | **new** |
| ds2 | inherited | inherited |
| lofi | **new** | already had one |
| synthwave | **new** | not declared — see below |
| fantasysynth | already had one | not declared — see below |

**The extension goes everywhere; the transition does not, and that is a
decision rather than an omission.** The extension answers a defect measured in
*every* genre — one length per section function, across roughly 2,000 sections,
no exceptions. The transition answers the narrower fault of a record built
entirely on one number, and only the dungeon synths are in that state:

```
  lofi          {2, 3, 4, 8}     already the most varied in the file
  synthwave     {4, 8}           prechorus and postchorus are half-length
  fantasysynth  {16, 20, 24}     its extension already runs
  dungeonsynth  {4, 16}          intro, then sixteen, forty-one times
  ds2           {4, 16}          the same
```

Declaring a transition on synthwave or fantasy synth would be adding a device to
genres whose form is not the thing that measured wrong — synthwave's fault was
*texture* (zero bars under three pitched parts), and Phase 1 answered it. An
earlier draft of this sheet listed transitions for both; that was scope with no
measurement behind it and it is withdrawn here rather than quietly shipped.

`chance` for the extension is **0.14** on the new declarations — the repertoire
proportion `section-lengths.md` derives from Kallstrom's survey (three
asymmetrical periods in about twenty-four). Fantasy synth's existing 0.22 is
left alone: it is a shipped number on a genre whose legs are long, and changing
it would move records this phase has no argument about.

`chance` for the transition is **[EAR]** on every genre, as it is on lofi, and
for the reason lofi's own comment gives: *"the sources say what a transition IS,
not how often a record should have one."* The dungeon synths get **0.35**
against lofi's 0.55, which is §2's counter-evidence paid respect: this genre
should be surprised less often than a beat tape.

---

## SOURCES

- `docs/genre-research/section-lengths.md` — the device, its direction, and the 1-in-7 proportion. Read it with this sheet.
- [Phrase and Period Structure — Kallstrom, WKU](https://people.wku.edu/michael.kallstrom/PHRASE.pdf) — cadential extension, asymmetrical period, the repertoire survey (via the sheet above)
- [Mortiis — *Født til å herske* reviews, Album of the Year](https://www.albumoftheyear.org/album/143029-mortiis-fdt-til-herske.php) · [Wikipedia](https://en.wikipedia.org/wiki/F%C3%B8dt_til_%C3%A5_herske) · [Encyclopaedia Metallum](https://www.metal-archives.com/reviews/Mortiis/F%C3%B8dt_til_%C3%A5_herske/285/) — the 53-minute single song, "numbing repetition", "subtle variations rather than dramatic structural changes"
- [How I Make Dungeon Synth — Icewind Dale](https://www.erichgrunewald.com/posts/how-i-make-dungeon-synth/) — "a single loop repeated endlessly"
- [How to write dungeon synth — dungeonsynth.neocities.org](https://dungeonsynth.neocities.org/howto) — repetitive patterns, gradual transitions, no bar counts given
- [Dungeon Synth Music Making Guide](https://dungeon-synth.neocities.org/music-making-guide) — ABAB / ABAC / ABCBC and the harder shapes
- [Mode — Plainchant, Medieval, Gregorian (Britannica)](https://www.britannica.com/art/mode-music/Plainchant) · [Modes in the Mayo-8 Chants — Colby](https://www.colby.edu/music/saunders/MU241/Lackner.html) · [Chord structure in medieval music](https://www.medieval.org/emfaq/harmony/chords.html) — nonmetrical plainchant, cadential motion as the phrase-shaping force
- `DS001`, `DS002`, `Dinosynth` — repo-root transcripts, on looping the same part
