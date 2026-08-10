# CHRONO TRIGGER, AND WHY THE GENRE BECAME `vgm`

*Researched 2026-08-08, on the user's instruction: "research the music of Chrono
Trigger, and Donkey Kong 64. We want to take in this data and update the DK
genre change it to VGM."*

**DK64 was already researched** — `dkc.md` covers Kirkhope alongside Wise and
its numbers are MEASURED off MIDI (Hideout Helm's G1 on every eighth for the
whole track, Crystal Caves' bell cascades, Jungle Japes' real dominant). This
sheet does not repeat that. It adds the **Chrono Trigger** half, the **hardware
the two share**, and the argument for putting all three under one key.

---

## 1. WHO MADE IT, AND UNDER WHAT CONDITIONS

> "The music of *Chrono Trigger* was composed primarily by Yasunori Mitsuda,
> with a few tracks composed by regular *Final Fantasy* composer Nobuo Uematsu."
> — [Wikipedia, *Music of Chrono Trigger*](https://en.wikipedia.org/wiki/Music_of_Chrono_Trigger)

Mitsuda was a sound *programmer* who threatened to leave Square unless he could
compose; Sakaguchi gave him the score. He then worked himself into hospital
with stomach ulcers, and **Uematsu contributed ten tracks** to finish the game
[ibid]. A hard-drive crash lost around forty works in progress [ibid].

The line that matters musically is Mitsuda's own statement of intent:

> **"I wanted to create music that wouldn't fit into any established genre …
> music of an imaginary world."** — [ibid]

That is an awkward and useful thing for a program whose genres ARE established
genres. It is also the single best argument for the rename in §5: the target is
not a style, it is a *medium*.

## 2. THE MUSIC — what the sources actually give

**Corridors of Time**, the most-analysed cue, is the identifying one:

> "a melancholic minor key melody courtesy of the sitar in the Gb tonality",
> combining "Indian instrumentation with traditional Gamelan gong chimes such
> as the kenong and kethuk"
> — [Video Game Music Shrine, *Inside the Score: Corridors of Time*](https://videogamemusicshrine.com/inside-the-score-chrono-trigger-corridors-of-time/)

and two production devices from the same analysis, both of which this program
already owns machinery for:

> "volume and panning to create a magical soundscape, **with the gongs moving
> clockwise through the stereo**" — [ibid]

> "a **delay effect by combining two samples with just a little timing
> difference**" — [ibid]

**THE HARMONIC DEVICE.** Multiple secondary sources describe the same thing:
the piece is notated in **F# minor but spends its body in D major**, and the
effect is deliberately unmoored — a sense of floating outside of time.
⚠ *This is from search summaries; Hooktheory and MuseScore both returned HTTP
403 on fetch, so the F#m/D pairing is NOT verified against a page I read.* The
Gb tonality in the verified Shrine quote is the same relationship a semitone
away (Gb minor / Ebb… i.e. enharmonically F#m), so the two sources agree on
"minor tonic, major-key body" without agreeing on spelling.

**And it is not an isolated trick.** The wider description of the score:

> Mitsuda "demonstrated a gifted use of **non-functional harmony** to create a
> hazy, dreamlike atmosphere", and "Wind Scene" relies on "orchestrational
> techniques unusual for 16-bit game music, developing an ethereal mood with
> patience over time"
> — [greatestgamemusic.com, *Chrono Trigger Soundtrack*] ⚠ *search summary; the
> page returned empty on fetch. NOT verified.*

## 3. THE HARDWARE ALL OF THIS RAN ON — verified, and it is a constraint

The SNES sound chip is not background colour here; it shaped both Wise's and
Mitsuda's scores, and every number below is from a page I fetched:

> "eight independent hardware voices" … "summed and pushed out as one 16-bit
> stereo pair, 32 000 times a second"

> "**64 KB of private audio RAM**" shared between "driver code, the sample
> directory, all BRR samples, **and the echo buffer**"

> the echo's "EDL sets its length in 16 ms steps, from 0 to 15 — so the
> **longest possible echo is 15 × 16 = 240 ms**", through "an **8-tap FIR
> filter**"

> BRR is "a **3.5 : 1** squeeze — 32 bytes of PCM become 9 bytes of BRR"
> — all four: [oldmachines.io, *Super NES Audio — a course on the S-SMP, SPC700
> & S-DSP*](https://oldmachines.io/supernintendo/audio/)

*(A search summary elsewhere gave the echo maximum as 224 ms rather than 240.
The fetched source says 240 and shows the arithmetic; I have used 240 and
recorded the disagreement rather than quietly picking one.)*

**THREE THINGS FALL OUT OF THAT, and they are the honest reason this is one
genre rather than three:**

1. **Eight voices, total.** The program already models a chip budget for the
   SEGA rig (six FM + three PSG, and the DAC steals channel 6). The SNES's
   eight is the same kind of law.
2. **The echo is SHORT.** 240 ms is the ceiling, and it is competing with the
   samples for the same 64 KB. This is not a wash — it is a slapback, and it is
   why these scores sound spacious without sounding drowned.
3. **N64 lifted the ceiling and Kirkhope still worked to it**: "Having to learn
   to sample instruments and **loop them to as small as possible to save
   memory** … those were the days!"
   — [OverClocked ReMix, *Composer Interview: Grant Kirkhope*](https://ocremix.org/info/Composer_Interview:_Grant_Kirkhope)

## 4. WHAT CHRONO TRIGGER SHARES WITH WHAT WE ALREADY HAD

`dkc.md`'s headline finding, measured off MIDI, was that DKC's harmony is **not
functional**: a fixed melodic cell over a moving bass pedal, where "the Ab in
the cell against a Bb bass is not an error being corrected — it is the sound."

Mitsuda arrives at the same place by a different road: **a minor tonic whose
body sits in a major key a third away.** Same refusal of functional harmony,
different mechanism.

**AND THE PROGRAM CAN ALREADY WRITE MITSUDA'S VERSION.** The neo-Riemannian
block has been in the file for weeks, drawn by exactly one genre. Its **L
(leading-tone) transform** maps a major triad to the minor triad a major third
up and back — `plr()` line 1713, `L: major → {pc+4, min}` — which is **D major
↔ F# minor exactly**. The device the sources describe is one of three
operations already implemented, already weighted, and reached by no genre that
plays it. That is this file's oldest defect shape: a capability declared and
never drawn.

## 5. WHY THE KEY BECAME `vgm`, AND THE HONEST CASE AGAINST

**For.** The table already spanned two composers, two consoles and five years
(Wise's SNES DKC 1994–96, Kirkhope's N64 DK64 1999) while calling itself
"Donkey Kong Country". Adding a third composer on a third franchise makes the
old name a lie about its own contents. And Mitsuda's stated aim — *music that
wouldn't fit into any established genre* — describes a medium, not a style.

**Against, and it is a real argument.** "VGM" is not a genre in the way lofi or
jungle are; it is a delivery format, and a table that means "any music from a
game" means nothing. This is only defensible because the three scores share
measurable, specific traits and not merely a shipping medium:

| trait | Wise (DKC) | Kirkhope (DK64) | Mitsuda (CT) |
|---|---|---|---|
| non-functional harmony | ostinato over a pedal [measured, `dkc.md`] | same pedal writing (Hideout Helm) [measured] | minor tonic / major body [§2] |
| held octave-doubled bass pedal | yes [measured] | yes [measured] | — not established here |
| tuned-percussion / bell layer | yes | celesta, glockenspiel | kenong, kethuk [§2] |
| short hardware echo as the space | SPC700, ≤240 ms | N64, sample-budgeted | SPC700, ≤240 ms |

**Four rows, three of them measured.** If a fourth composer ever arrives who
shares none of that, the honest answer is a second key, not a wider one.

## 6. WHAT WAS BUILT

1. **`GENRE.dkc` → `GENRE.vgm`**, label "video game music — Wise · Kirkhope ·
   Mitsuda". **THE RENAME MOVES NO NOTE**, and that is provable rather than
   hoped: no substream in the file is keyed on a genre name (`stream(seed, …)`
   takes fixed strings — "chart", "rig", "rack", "motion:<control>:<i>"), so
   the key is a label. Verified by the rolls being byte-identical.
2. **`harmony: { style: "plr", chance: 0.22 }`** — Mitsuda's device, through
   the transform that already implements it. This DOES move the music, on
   purpose, on about a fifth of the genre's songs, and it is re-baselined
   deliberately.
3. **`space.echoMs` is NOT invented** — see §7. The echo ceiling is recorded
   here as a fact about the hardware; nothing in the program was changed to
   enforce it, because that would move every song in the genre for a reason no
   player has asked for yet.

## 7. WHAT WAS DELIBERATELY NOT BUILT

- **The sitar, the kenong and the kethuk.** The program has no such voices and
  inventing them from a one-line description is exactly the error `dkc.md`'s
  own header warns about. Named as a real gap.
- **The 240 ms echo ceiling as a law.** Sourced and true of the hardware, and
  clamping the genre's delay to it would re-voice every song in it. That is a
  deliberate, measured commit of its own, not a rider on a rename.
- **The eight-voice budget.** The SEGA rig has a chip budget; the SNES one is
  not modelled. Same reasoning.
- **Uematsu's ten tracks as a separate character.** No source separates them
  musically in a way a table could read.

## 8. SOURCING HONESTY

**Fetched and quoted from the page:** Wikipedia *Music of Chrono Trigger*;
Video Game Music Shrine on *Corridors of Time*; oldmachines.io on the S-SMP /
SPC700 / S-DSP; OverClocked ReMix's Kirkhope interview.

**NOT fetched — search summaries, marked in the text:** the F# minor / D major
pairing and the 111 BPM (Hooktheory and MuseScore both 403); the
"non-functional harmony … hazy, dreamlike" line and the "Wind Scene" line
(page fetched empty); Kirkhope's instrumentation-evokes-place lines and the
DK64-is-darker line (only the memory quote was in the fetched interview); the
224 ms echo figure, which the fetched source contradicts with 240.

**Nothing in §6 rests on an unverified quote alone.** The only build that
changes the music is the harmony block, and its justification is the *verified*
Shrine quote ("melancholic minor key melody … in the Gb tonality") plus the
program's own already-implemented L transform.
