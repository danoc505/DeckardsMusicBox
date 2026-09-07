# Lo-fi hip hop: what it descends from

Every source in `src/genre/lofi.ts` is a how-to-make-a-beat guide. They are
good sources for what a producer does and they are all the same KIND of
source: none of them says where this music came from, so none of them can say
why any of it is that way. `TALLY.md` §1 calls lofi "the genre with the least
thought behind its treatments", and this is the reason — the genre was read
off tutorials rather than off its own ancestry.

This is the ancestry. It is the reading, in the shape
`DUNGEON-SYNTH-ARRANGEMENT.md` uses: what the sources say, then what this
program does, then which of the two is running on an assumption.

**Nothing here is applied.** §7 lists what it would change and what would have
to be measured first.

---

## 1. The line of descent

Wikipedia's lofi hip-hop infobox gives the stylistic origins as **downtempo,
jazz rap, instrumental hip-hop, electronic, lo-fi, chill-out, alternative
hip-hop, jazz, soul, and easy listening**. Those are not ten sibling
influences; they are three distinct lines that meet, and each contributes a
different part of what this program has to build.

    lo-fi (a recording aesthetic, 1950s–)  ─────────────┐   the desk
                                                        │
    hip hop ─→ boom bap ─→ jazz rap ────────────────────┼─→ LO-FI HIP HOP
                    │          │                        │
                    │          └─→ jazz (soul jazz,     │   the harmony
                    │                hard bop, jazz-funk)│
                    │                                    │   the drums
    electronica ─→ trip hop ─→ downtempo / chill-out ───┘   the tempo
                    │
    instrumental hip hop ───────────────────────────────┘   no voice

The chain is confirmed at each link rather than assumed: boom bap's own entry
lists **jazz rap** as its subgenre; jazz rap's entry lists **lofi hip-hop**
among its derivative forms and gives its own origins as "East Coast hip hop,
boom bap, jazz, and alternative hip-hop"; downtempo's entry lists **lofi hip
hop** as a derivative form; trip hop's origins name hip-hop, downtempo,
jazz, soul and dub together.

So lofi hip hop is not a style with influences. It is the intersection of a
production aesthetic, a drum tradition, and a harmonic vocabulary — and the
program models all three, in three different places.

---

## 2. Lo-fi, the aesthetic — and it is older than the music

The oldest ancestor and the only one that is not a genre at all. Lo-fi is
"a music or production quality in which elements usually regarded as
imperfections in the context of a recording or performance are present,
sometimes as a deliberate stylistic choice"
(en.wikipedia.org/wiki/Lo-fi_music). The term is "sound production less good
in quality than 'hi-fi'", in the OED by 1976, and was popularised by WFMU's
William Berger in 1986.

The imperfections it names, one by one:

| what the aesthetic names | where this program puts it |
|---|---|
| tape hiss, tape saturation | `rack.tape.drive`, the `wear` treatment |
| harmonic distortion from a signal exceeding the device | `rack.tape`, the board |
| **"little or no frequency information above 10 kilohertz"** | `rack.tape.lowpassHz: 10000` |
| environmental noise — "passing vehicles, household noises, the sounds of neighbours and animals" | **nothing** |
| "misplayed notes", out of tune or out of time | `feel.jitterMs`, `feel.velocityJitter` |
| degraded audio signals, room acoustics | `rack.vinyl`, `rack.room` |

**The 10 kHz line is the finding of this document.** `lofi.ts` ships a tape
lowpass at exactly 10 000 Hz, and its source is a mixing tip — "a gentle
low-pass at around 8–12 kHz on your mix bus" (antarestech.com). That is a
recommendation. The lo-fi aesthetic's own definition names the same figure as
a PROPERTY OF THE THING: little or no information above 10 kHz is part of what
the word means. The program's number was right, and it was right for a better
reason than the one written beside it. See §7.1.

The row with nothing in it is also worth seeing. Environmental noise is named
in the definition of the aesthetic — and where the genre guides say the same
("vinyl crackles, tape hiss, and background noise", already quoted in
`arrangement.treat`), this program built the first two and not the third.

---

## 3. Boom bap — the drums, and one sentence about density

Boom bap is the drum tradition underneath. Its origins are East Coast hip-hop
and hardcore hip-hop; jazz rap is its subgenre, so it sits two links below
lofi hip hop and it is where this program's drum numbers already come from
(`drums.kick`, `drums.snare` and `drums.hat` all cite boom bap guides).

The name is onomatopoeia — the bass drum ("boom") and the snare ("bap"). The
entry describes "a main drum loop that uses a hard-hitting, acoustic bass drum
sample on the downbeats, a snappy acoustic snare drum sample on the upbeats,
and an 'in your face' audio mix emphasizing the drum loop", over "a loop of
quarter notes. The first and the third being the kick drum and the second and
fourth the snare". That is what `lofi.ts` already writes.

Two things it adds that the program's existing sources do not.

**The swing is constitutive, not a taste.** The style uses "highly swung
programming, which can be produced either by a deliberate delay in the
analogue percussion hits or by a quantization algorithm programmed on an
electronic sampler", and swing quantisation lets a producer "keep precision on
the 'on' beats and to offset the 'off' beats by a small margin". That is
exactly what `feel.swingGrid` does and it is currently cited to an MPC forum
thread. The forum says how the machine works; this says the music is not the
music without it.

**And KRS-One on how many things play at once:** *"The vibe of boom bap is to
use the least amount of instruments to create the most rhythmic sound."*

This program has a field for that and lofi does not state it. `arrangement.
fewest` is **3, inherited from the pop default** — one of the two inherited
defaults `TALLY.md` §2 lists as still standing, in the row that names the
inherited default as this program's recurring fault. The lineage now supplies
lofi with an argument for stating its own, from the tradition its drums
already come from. It does not supply a NUMBER — "the least amount" is a
direction, not a count — so anything chosen is still `[chosen]`, and §7.2 says
what would have to be measured.

---

## 4. Jazz rap, and the jazz under it

Jazz rap is "a fusion of jazz and hip hop music, as well as an alternative
hip-hop subgenre, that developed in the late 1980s and early 1990s" — A Tribe
Called Quest, Digable Planets, De La Soul, Gang Starr, Jungle Brothers. It is
the direct parent: its entry names lofi hip-hop first among its derivative
forms.

It matters here because it decides WHICH jazz. Not jazz in general: the
sampled catalogue is specific. "In the 70s, Blue Note turned from hard bop to
jazz-funk, it's no surprise that the label's 70s discography has been sampled
by myriad hip-hop acts", and A Tribe Called Quest pursued "funk-influenced
recordings of the late 60s and early 70s" — soul jazz, Grant Green, Ronnie
Foster, Lou Donaldson (udiscovermusic.com, best Blue Note samples).

So the harmony lofi inherits is **soul jazz and jazz-funk of roughly 1965–75**,
not bebop and not the standards. That is consistent with what `lofi.ts`
already asserts — "minor-leaning and modal rather than functional", sevenths
on every chord — and it is the first source this program has for WHY, rather
than a blog observing that lofi progressions have sevenths in them. Modal,
non-functional, groove-first harmony is what that particular corner of jazz
was doing.

**And Nujabes gives the mechanism.** He "preferred to let the original tracks
define the chord progressions. He respected the songs", drawing on "jazz
masters like Miles Davis and Pharoah Sanders and Brazilian artists such as
Luiz Bonfá and Toquinho" (musictech.com). The harmony is not composed and it
is not drawn — it is INHERITED FROM A RECORD, two bars at a time. That is a
fact about how the music is made that this program cannot model at all, and
should not pretend to: it has no crate to dig in. It is worth writing down
because it explains why lofi harmony loops at one, two or four bars, which
`harmony.progressions` already cites Adams for.

---

## 5. Trip hop and downtempo — the tempo and the furniture

**Downtempo** is "a broad label for electronic music that features an
atmospheric sound and slower beats than would typically be found in dance
music", at approximately **90 BPM**, emphasising "layered sounds and mood"
over catchy melodies or riffs. Its derivative forms include lofi hip hop.
`lofi.ts` runs 72–88, cited to two production blogs; the lineage puts the same
figure from the other direction and from a different tradition.

**Trip hop** is "a psychedelic fusion of hip-hop and electronica with slow
tempos and an atmospheric sound", from Bristol, the term coined by Andy
Pemberton in *Mixmag* in June 1994 for DJ Shadow's "In/Flux". Its
instrumentation list is worth quoting because this program already built most
of it: "Rhodes pianos, saxophones, trumpets, flutes", bass-heavy, melancholic,
built on "slowed down breakbeat samples".

`lofi.ts` gives its keys a Rhodes and cites a lo-fi production guide for it.
The Rhodes is in the lineage two generations up, in a list of the instruments
this whole family of music is made of.

---

## 6. Instrumental hip hop — the absence, which is the point

"Instrumental hip-hop is hip-hop without an emcee rapping." DJ Shadow's
*Endtroducing…​..* (1996) is the template; the modern line runs through RJD2,
J Dilla, MF Doom, Nujabes and Madlib — the same names as lofi's own, and
Madlib and MF Doom's *Madvillainy* (2004) is called lofi hip-hop's "shared
touchstone".

**This is the parent that says something the program may be getting wrong.**
Without a voice to carry, "Songs of this genre may wander off in different
musical directions", because the track no longer has to hold a steady bed
under someone talking.

This program's lofi record is built out of `intro`, `verse`, `chorus`,
`bridge` and `outro`. Those names describe a song organised around a vocal —
a verse is a verse because the words change and a chorus is a chorus because
they do not. The genre this program is generating is defined by the singer not
being there.

That is an observation and not yet a defect, and the honest reading cuts both
ways: `form.lengths` is cited to a beat-tape source as well as a rap-structure
one (beatproduction.net's "intro, a 16-bar verse, a chorus, a break and a
chorus"), so a beat tape demonstrably does use those blocks. But a beat tape
uses them because it is a rap instrumental with the rap taken off, and the
question this raises — whether a section grammar built for an absent voice is
the right grammar, or whether the wandering is what should be modelled — has
never been asked in this repository. §7.4.

**Two individual hands, named by the sources.** Nujabes is "often called the
'godfather of lofi hip-hop'" and his *Samurai Champloo* score (2004) is where
the sound reached an audience; J Dilla "is also often associated with the
development of lofi". Their equipment is named too: the Roland SP-303 and
SP-404, each of which "featured the 'lo-fi' effect as a separate button" — the
aesthetic of §2, shipped as one switch.

---

## 7. What this would change, and what it does not

Four findings. None is applied, and the two that touch behaviour need
measurement first.

**7.1 · `rack.tape.lowpassHz` should carry a better source. FREE — no
behaviour changes.** The value stays 10 000. Its citation moves from a mixing
guide's suggested range to the aesthetic's own definition: "little or no
frequency information above 10 kilohertz" (en.wikipedia.org/wiki/Lo-fi_music).
This is a `sources` edit, and it matters because the house rule is that a
number wearing a weak source is built on by the next reader. Anyone reading
"8–12 kHz on your mix bus" would feel free to move it; anyone reading the
definition would know that 10 kHz IS the genre.

**7.2 · lofi has an argument for stating its own `fewest`, and no number.**
It inherits 3 from the pop default. KRS-One's "least amount of instruments to
create the most rhythmic sound" is the tradition's own statement on density
and it names no count. So this is not a one-line change with a source behind
it — it is a sweep: state 2, measure who opens, thinnest, fullest and the peak
against the current 3 over 200 seeds, and take the number the measurement
gives. **If it changes nothing, it does not ship** — that is this program's
cardinal sin, and a genre field that reproduces the default is exactly that.
Note also that `fewest` is not the only thing holding a section up: `README`
and `arrange.ts` record that the ending is floored by its openers rather than
by this number.

**7.3 · Two existing numbers gain independent corroboration and change
nothing.** `feel.swingGrid` (boom bap's own "offset the 'off' beats by a small
margin") and `tempo` (downtempo's ~90 BPM from a different tradition). Both
already ship; both were cited to production sources; both are now confirmed
from the lineage. Worth recording so nobody re-derives them, worth no edit.

**7.4 · The form grammar is open, and it is a form-stage question.** §6. It
belongs beside `TALLY.md` §2's entry on the peak being built on material heard
once — both are the form's grammar rather than the arrangement's walk, and
neither is closed by anything in the arrangement stage.

---

## 8. What could not be verified

Recorded so the next reader does not spend the search again.

- **A measured figure for Dilla's microtiming.** "21st Century Funk: A
  Microtiming Analysis of the Beats of J Dilla" exists on academia.edu and
  **returned HTTP 403 — it was NOT read**, so nothing from it is cited here.
  Ethan Hein's "Dilla Time" essay WAS read and contains no numbers; it says so
  itself — "there are not widely used analytical tools for studying this
  music". So `feel.lean`'s 18 ms still rests on the drumming studies already
  cited in `lofi.ts` (Danielsen, Câmara, Senn, Keil), which is the right place
  for it, and this document adds nothing to that field.
- **Whether lofi's `shed` order matches anything in the lineage.** The sources
  read here describe elements coming and going and rank nothing, which is the
  same negative `arrangement.shed` already records.

## Sources

Read in full for this document:

- en.wikipedia.org/wiki/Lofi_hip-hop — stylistic origins, Madvillainy, the
  SP-303/404, Nujabes and J Dilla
- en.wikipedia.org/wiki/Lo-fi_music — the aesthetic's definition, the named
  imperfections, the 10 kHz figure, the history of the term
- en.wikipedia.org/wiki/Boom_bap — the drum loop, swing quantisation, KRS-One
- en.wikipedia.org/wiki/Jazz_rap — the direct parent, its artists and dates
- en.wikipedia.org/wiki/Trip_hop — Bristol, the coinage, the instrumentation
- en.wikipedia.org/wiki/Downtempo — ~90 BPM, atmosphere over riff
- en.wikipedia.org/wiki/Instrumental_hip-hop — hip hop without an emcee, and
  what that frees
- musictech.com/features/interviews/nujabes-lasting-impact-on-hip-hop-and-electronic-music
  — crate digging, letting the record set the progression, the Waldorf filter
- udiscovermusic.com/stories/best-blue-note-samples-hip-hop — which jazz, and
  which era of it
- ethanhein.com/wp/2022/dilla-time — read, and reported for what it does not
  contain

Not read, and therefore not cited for anything above:
academia.edu "21st Century Funk: A Microtiming Analysis of the Beats of
J Dilla" (403).
