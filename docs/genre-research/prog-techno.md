# PROG-TECHNO — Pink Floyd crossed with punk, on a techno backbone

> **WITHDRAWN 2026-08-14. THE GENRE THIS SHEET DESCRIBES NO LONGER EXISTS IN THE
> PROGRAM.** The owner: *"I want you to then delete the progtechno genre and
> replace it with an ambient genre."* `GENRE.progtechno` was deleted, not
> commented out, and `docs/genre-research/ambient.md` is what stands in its
> place.
>
> **The sheet is kept, in full and unedited below this note**, for two reasons.
> The research was real work against real sources and deleting it would destroy
> the record of what was decided and why. And several of the *mechanisms* built
> for this genre outlived it and are still in the program, used by others — the
> structural solo (`form.arc.thin` gating a part's notes by the energy curve),
> the drawn matrix-mixer vocabulary, and the polyphony generalisation to pitched
> parts. Anyone reading those in the source and following the citation trail
> arrives here.
>
> Nothing below has been re-checked since it was written. Read it as a record,
> not as a description of the current build.

*2026-08-09, rebuilt 2026-08-10 — see **§7**, which supersedes this sheet's
harmony and its note counts. The owner named the genre and its references over
several turns and corrected the research five times on the way. The corrections
are in §0 because they are the reason this sheet says what it says.*

> *"The genre is Prog-techno. It is funky, fusion, punk, progressive… I think the
> Pink Floyd crossed with punk wrapped into a techno back bone is what we are
> going for the other bands and ideas are all part of it."*

---

## §0 FIVE CORRECTIONS, AND WHAT EACH ONE CHANGED

Recorded first because every one of them was me turning a word of the brief into
a parameter, which is this project's most expensive habit.

| the correction | what I had done | what it changed |
|---|---|---|
| *"BPM is not a genre!"* | built the crossing around reconciling sludge's 60–110 with techno's 128–140 | tempo is a symptom; the crossing is about what the parts DO |
| *"Punk is not a sound! It is a feeling an energy! It is not power chords."* | made punk a chord voicing — root and fifth, no third | punk is a posture toward craft, §3 |
| *"you read a wiki page on death grips and gave up"* | one Wikipedia fetch | the real sources say something different, §3 |
| *"Mars volta is virtuosos it is long solos"* | wrote "no solos, no ornament" into a plan that names Mars Volta | the solo is the STRUCTURE, §2 |
| **2026-08-10.** *"Pink Floyd is NOT drone. It is novel use of FX. It is breaking the rules."* and *"It should not be simple and droning."* | read Cohen's *"exceptionally slow harmonic pace"* and wrote `progressions: [[[0,0,0,0], 10]]` — **one chord, for ever** — plus `theme.count: [1,1]`, the lowest note count in the file, from *"Gilmour's virtuosity is not density"* | **§7**. Four chords that clash and do not resolve; the solo becomes a solo; the FX become parts |

**The fifth is the same mistake as the other four**, and by now that is the
finding rather than the incident: *a sentence of the brief becomes one small
number in a table.* Five times, in one genre. The countermeasure is in §7 — the
seam check that asserted the drone has been **inverted rather than deleted**, so
the wrong premise is on the record next to the right one.

**And one more, which is the frame for all of them:** *"nothing ive said is
authoritative upon anything."* The owner's verdict says where to look. The sources
decide what is there. Anything below that was chosen rather than sourced is
marked `[CHOSEN]`.

## §0b Sources, all fetched this session

1. **Cohen, "Expansive Form in Pink Floyd's *Dogs*"**, *Music Theory Online* 21.2
   — the load-bearing source for §1 and §2
2. Gilmour solo technique — Louder ("The 30 greatest David Gilmour
   performances"), ClassicRockHistory, LickLibrary lesson notes
3. **Pearson, "Extreme Hardcore Punk and the Analytical Challenges of Rhythm,
   Riffs, and Timbre"**, *MTO* 25.1
4. **Cook, "Punk Rock Philosophy 3: Amateurism and the Myth of Sid Vicious"**,
   *Aesthetics for Birds*
5. Mars Volta — Guitar World interviews with Omar Rodríguez-López; Zac Mergard's
   "Eriatarka" case study; *Frances the Mute* / "Cassandra Gemini" documentation
6. Jagatara — Wikipedia, Grokipedia, AllMusic and review coverage of *Nanban
   Torai* (1982)
7. Indian classical — Kennedy Center "Rhythm and Raga", Chromatone on tala,
   Krishna Music School on tala and sam
8. Gamelan — Kotekan (Wikipedia), *Beyond the Classroom* Balinese gamelan chapter
9. Boys Noize — MusicRadar/Future Music studio interviews, DJ Mag
10. Death Grips — The Skinny interview with Zach Hill
11. Bloody Beetroots — Roland Cloud artist spotlight, Music Connection
12. The techno material already written up this session in
    `techno-and-minimal-2026-08-09.md` and `techno-what-kind-of-object.md`

**Added 2026-08-10 for §7** — Attack Magazine deconstructions of "Strings Of
Life", Drexciya's "Black Sea" and Jeff Mills' "The Bells"; Attack's Roger Linn
swing interview and its DAW/drum-machine swing series; **Friberg & Sundström,
"Swing Ratios and Ensemble Timing in Jazz Performance", *Music Perception* 19(3)
(2002)**; MusicRadar on Detroit fixed-interval chords and on Boys Noize's studio;
RBMA interviews with Derrick May and Robert Hood; Music Connection, Roland Cloud,
NBHAP and V13 on the Bloody Beetroots; The Skinny, Modern Drummer and NME on
Death Grips; Elektron, DJ Mag, Clash, Complex and Howl & Echoes on Boys Noize;
Wikipedia and Jerry Harrison interviews on *Remain in Light*; the *On the Corner*
and harmolodics material in §7d. Producer-forum sources (KVR, Gearspace,
ModWiggler) are **marked as consensus rather than testimony** wherever cited.

---

## §1 THE FINDING: Pink Floyd and techno are the same strategy

This is the whole sheet in one paragraph, and it is the reason the brief is
buildable rather than a mash-up.

Cohen, analysing "Dogs" (17 minutes):

> **"Pink Floyd used a small amount of material, appropriate to a
> standard-length song, and expanded each of its sections enormously by employing
> heavy repetition and an exceptionally slow harmonic pace."**

The main vamp *"subsumes ten out of the 17 minutes of the song"*, and each cycle
of it lasts *"between 37 and 55 seconds"*. His framing question is the one this
genre has to answer: *"how can a rock song that is based on so little material
retain vitality over the course of such a prolonged duration?"*

**That is a description of a techno track, written about a prog record.** Small
amount of material, heavy repetition, harmony that barely moves, length measured
in tens of minutes. So "Floyd crossed with techno" is not two things to
reconcile — it is one strategy at two tempos. Punk is what makes it dark and
raw rather than pastoral.

**Every other reference in the brief is the same architecture:**

- **Jagatara.** Punk out of no wave, blended *"with Funk, Reggae, and Afrobeat"*;
  closest comparison Talking Heads' *Remain in Light*; influences Can, The Pop
  Group, Funkadelic and **Fela Kuti**. The music: *"restless, sax-filled
  grooves"* where *"the bass and bongos give songs a get-up-and-dance bounce,
  allowing the saxophone and guitar their own chaotic agendas."* **A locked
  groove with voices improvising freely across it.**
- **Mars Volta.** "Cassandra Gemini" is 32 minutes in five movements that *"bleed
  into each other"*, grown from live improvisation. Rhythmically Rodríguez-López
  describes *"playing in four with a three feel, or three with a four feel"* —
  4:3 across a standard pulse rather than genuinely odd metre.
- **Indian classical.** *"There are no chords like in Western music — just the
  Drone and Raga."* The soloist *"may go off on a long improvised phrase that may
  last for many cycles of the tala, but will always return to the composition on
  the sam."* Tala cycles run "as short as 3 beats or as long as 128"; Rupak is 7,
  grouped 3+2+2.
- **Gamelan.** Colotomic cycles of *"2 to 256 beats"*, the gong marking the end
  of each, with high instruments elaborating at faster subdivisions over a slow
  skeleton. **Kotekan** splits one fast line between two interlocking players.
- **Techno.** Robert Hood: *"rhythms inside of rhythms inside of rhythms."*

### The genre in one sentence

**A locked machine groove that does not change, for a long time, with expressive
voices improvising across it — and the structure comes from the energy contour of
those voices and from texture accumulating, not from chords or verses.**

---

## §2 THE SOLO IS THE STRUCTURE

Cohen makes this an architectural claim, not an aesthetic one:

> **"the guitar solos provide an overall sense of direction by outlining the
> contour in energy level of the song, articulating its structure, and leading it
> to its peak."**

"Dogs" contains *"no less than three improvised solos"*. The climactic one has
three guitars in *"a whirlwind of augmented triads, forming a whole-tone scale."*

**And Gilmour's virtuosity is not density.** It is *"wide, vocal-like bends"*,
*"letting notes bloom and decay dramatically through sustain"*, *"melodic
phrasing like a singer"*, and *"long-held, sustaining notes, using dynamics and
note length to create dramatic, musical tension."* Louder's framing: *"when the
emotion becomes too strong for singing, Gilmour takes a solo."*

**Few notes, held enormously long, bent.** That is what settles the
prog-versus-punk contradiction the owner deliberately put in the brief — see §3.

Cohen also identifies a mechanism this program has nothing like: a single
dissonant pitch (E over D minor) that *"generates melodic tension throughout the
song"* and *"resolves only at the end of the exposition and of the entire song."*
**One unresolved idea held across a whole record.** Filed in §6 as the most
interesting thing here and the least understood.

---

## §3 WHERE PUNK ACTUALLY IS

Not in the notes. Cook settles what punk amateurism means, and it is not what it
looks like: the claim that *"punk rock uncritically values amateurish composition
and musicianship over more polished work"* is **FALSE**. What punk rejects is
*"ostentatious displays of 'talent' that had become mainstays of '70s rock (e.g.
complex guitar solos or operatic vocals)."* Steve Jones: *"I wasn't interested in
his Beatle-type chords"* — and he was, Cook notes, *"no doubt competent enough"*
to play them.

**So punk is a refusal made by someone who could do otherwise.** A held, bending
Gilmour note is expressive, not ostentatious, and passes that test; a shredding
run would not.

Pearson supplies the other half, and it is about timbre: *"heavily distorted power
chords play more of a timbral and melodic than a harmonic role"*, and *"the almost
always present distortion on guitars in punk is functionally timbral distortion
rather than harmonic dissonance."* Riffs work as *"metric units"* rather than
harmonic progressions, and *"punk vocals are about timbre and emotional intensity
over pitch and melody."*

The electronic references say the same from their side. Boys Noize: **"The sound
is more important to me than the melody or a lyric. It's always the sound that
inspires me"**, and his favourite tracks are *"drums and 1 or 2 things that are
doing the theme."* Death Grips, Zach Hill: *"There's a lot of recycling and
destruction that happens in the making of our music."* Jagatara's debut has
*"haphazard, sloppy production… raw, spirited grittiness."*

**Punk here = distortion as the instrument, refusal of polish, and energy — over
a structure that is anything but simple.**

---

## §4 FUNKY, and it is a real constraint rather than a mood

"Funky" is the word that stops this becoming ambient. Electro *"breathes — its
syncopated patterns create tension and release"* against four-on-the-floor's
relentlessness, with *"a syncopated kick drum, and usually a snare or clap
accenting the backbeat."* Fela and *Remain in Light* are the same instruction
from the afrobeat side: interlocking parts, one or two chords, the groove doing
the work.

Our `pocket` field is already a weighted table of kick placements in sixteenths,
so **the funk costs no new machinery** — minimal techno's is `[0,4,8,12]` and
this genre's must not be.

---

## §5 WHAT THE PROGRAM HAS, AND THE THREE THINGS IT DOES NOT

**Already here:** the loop; 16/32-bar phrasing; `form.plan` for movements (five
genres declare one); the energy arc with a drawn apex; the length dial; the modal
system; `kit.poly` for cycles that fight the bar; `legato` and `holdSec` for
sustained expressive notes; heavy drive; the motion system for textural
accumulation.

**Missing:**

1. **A structural solo.** `lead` is a part that plays notes. Nothing ties its
   density, register or note length to the record's energy contour, and Cohen's
   claim is that in this music the solo *is* the form.
2. **A pitched part on its own cycle, resolving on sam.** `kit.poly` does this for
   drum lanes only, and without the traditions' discipline: our rim on 7 and clap
   on 5 never have to land anywhere. Tala's sam and gamelan's gong both say the
   cycle must come home.
3. **A long-range unresolved tension** (§2, Cohen's E over D minor). Close kin to
   `breaking-the-rule.md`'s "a break stays broken and the record adopts it".

---

## §6 WHAT WOULD CLOSE THIS

Build order, and the reasoning is in the approved plan:

1. the structural solo — wiring the existing arc to the lead
2. the pitched cycle that lands on sam — generalising `kit.poly`
3. the groove and the table: syncopated pocket, drone plus one mode, no comping,
   heavy drive, a plan shaped alap → jod → jhala
4. seam checks, with any law this genre breaks **declared as its own exemption**
   rather than loosened for the other eight

**Deliberately not in the first slice:** the long-range tension; kotekan; the §G
rule-breaking mechanism; vocal and noise sampling; sludge (parked by the owner).

**Nothing here has a verdict.** Whether a locked groove with a soloist across it
is hypnotic or dull is a taste question and no measurement in this repo settles
it.

---

# §7 THE REBUILD — 2026-08-10

*The owner played the record and reported four faults. All four were real, all
four are measurable, and three of them turned out to be one fault.*

> *"Lets try and fix ProgTechno its terrible! First off the ostinato is tied to
> the bass on the mixer this is wrong. Next the ostinato is crap! What is it why
> is it doing the same thing for the whole track? Why do we only haver ostinato,
> bass drums for all tracks? This is such poor and lazy work here."*

Then the brief that this section is built to:

> *"ProgTechno is meant to be progressive in the Techno genre… Detroit Techno,
> Boys Noize, Mars Volta, Jagatara, Funk, and Punk. It should be Dark and Heavy,
> and Electro. It should sometimes have a swing, it should have many options to
> build from, it should be punk in attitude not in BPM. It should be experimental
> and out of the box. It should break rules and create new ones. It should be one
> part freeform Jazz and another New Wave. It should not be simple and droning.
> Bloody Beatroots is another influence… The rule of three HAS to be there in
> everything we do. There are different ways to introduce change and we should be
> allowing the program to roll for any and often more than one of those options.
> We should be automating the Matrix Mixer this is where we get the most back for
> our buck."*

## §7a WHAT WAS MEASURED BEFORE ANY OF IT WAS WRITTEN

| | before | after |
|---|---|---|
| chord degrees used | **`{0}`** — one chord | `{0,1,2,3,5,6}` |
| distinct ostinato pitches per record | **3** | **7.3** mean |
| `Avar`'s figure vs `A`'s | byte-identical, every seed | differs |
| parts audible | drums 61.8%, ostinato 23.9%, bass 13.9%, lead 0.5%, **keys/keys2/counter 0** | drums 45.6%, keys 25.0%, ostinato 18.2%, bass 9.8%, lead 1.3% |
| swing | `even`, 50.0%, **12 of 12 songs** | drawn **53.9%–63.1%** across seeds |
| matrix crossings moved | **16 of 49, the same 16 every record** | 23–25, **a different set every record** |
| rule of three | `varyAsBefore` — deferred to the 3rd hearing, weaker answer | removed |
| pitched parts sharing one instrument | **11 of 20 songs** put bass+lead+ostinato on one 303 | **0 of 20** |

## §7b THE FOUR FAULTS

**1. The mixer was miswired, and not only here.** `chanIn(g, role, fallbackBus)`
is the one door to a channel strip and its contract is *"the FADER is the part's,
so the channel is looked up by `ev.role`"*. Four voice functions ignored it and
hardcoded `"bass"`: `V.bass`, `V.acid303`, `V.drone`, `V.reese`. Any part whose
instrument was one of those four terminated on `g.chan.bass.inp` — so the bass
fader moved the figure, the figure's own fader moved nothing, its meter read
flat, soloing it gave silence, and its send knobs lifted the `keys` bus while its
audio went to the `bass` row's reverb. **The note snapshot is byte-identical
across all 2700 songs after this fix**, which is the proof it was wiring and not
music.

**2. It had no rack of its own.** It drew `plastik` 6 times in 10 — minimal
techno's rack, where bass, lead, counter and ostinato are *all* the 303. Correct
for plastikman, whose record that is. Three racks of its own now: **detroit**
(Rhodes + VP-330 strings, from Attack's teardown of "Strings Of Life"), **noize**
(303 + CS-80, the hard end), **volta** (live kit + Wurlitzer).

**3. The figure had three pitches because of arithmetic, not taste.** The cells
were built from degrees `{0, 3, 5, 7, 10}` — and in a seven-note scale degree 7
**is** degree 0 and degree 10 **is** degree 3. Every number reduced to 0, 3 or 5.
The most-weighted cell was root-root-4th-root-root-root-6th: a pedal with two
grace notes.

**4. Every switch that could have changed it was off.** This was the only genre
in the file to opt out of all of them at once — `vary:false`, no `follow`, no
`rest`, no `longLoop`, no `thinTo`, no `chorusProgressions`, `keyShift.chance: 0`
— so `ostAvar`, `ostB` and `ostC` all collapsed onto `ostA` by identity.
Plastikman's own comment had diagnosed this a month earlier: *"without it
`vary(A)` had nothing to redraw in a genre with no lead, so every section of the
record was the same music."*

## §7c THE HARMONY, FROM THE SOURCE I HAD ALREADY READ

Cohen on "Dogs" — the paper this genre was built from:

> **"Chord 1 is a tonic with added 7th and 9th; Chord 2 simultaneously includes a
> third (D) and a fourth (E♭), an uncommon clash; Chord 3 is a dominant with a
> suspended fourth and a suspended second; Chord 4 is based on A♭ with a
> suspended augmented fourth and suspended second."**
>
> **"its last chord calls for a resolution that never arrives, and the bass line
> goes from A♭ back to D, producing a dissonant leap of a tritone."**

Four chords, each a clash, and a progression that refuses to resolve. Detroit
agrees independently — Attack has "Strings Of Life" *"based around four chords"*.
The genre now declares eight-entry rows (one per bar of its 8-bar material, so a
chord repeated four times is a chord held four bars ≈ a 15-second cycle), several
of which **end away from the tonic**.

## §7d NEW RESEARCH — the five influences the owner named

**Detroit techno.** The core mechanic is **parallel voicings**, not a progression:
*"all chords share identical voicing structure"* (Attack, Drexciya "Black Sea");
MusicRadar on *"the chord memory feature of certain synths, which enabled you to
play a particular chord shape with a single key"*, yielding Cm-Gm-Fm-Gm-A♭m-B♭m —
*"this kind of progression probably isn't one you'd be likely to come up with
using a conventional sound!"* Producer consensus (KVR, **not an originator's own
words — flagged**) has the stab as a **minor 7th**, *"adding a 7th, 9th or 13th"*.
Palette, per Attack: Kurzweil piano, **Ensoniq Mirage** 8-bit sampler strings,
TR-727 bongos, 909 — and *"there is no bassline in this track, so the variation in
the instruments is crucial to the groove."* Arrangement: *"random variation in the
sequencing"*, *"the ending is unconventional… with variations right up to the
final fade out."*

**A correction to our own earlier claim:** Derrick May on jazz — *"I didn't like
jazz until five years ago. I didn't even listen to it"* (RBMA). The jazz thread in
Detroit belongs to Underground Resistance and Carl Craig, not to May. Mike Banks
is a former studio bassist who played with Parliament/Funkadelic.

**Swing, with numbers, from the man who invented the control.** Roger Linn:
*"I merely delay the second 16th note within each 8th note"*; *"50% is no swing…
66% means perfect triplet swing"*; *"a swing setting of **54%** will loosen up the
feel without it sounding like swing"*; *"between 50% and around 70% are lots of
wonderful little settings that… can change a rigid beat into something that makes
people move."* Ladder: 50/54/58/62/66/71. And peer-reviewed: **swing is
tempo-dependent** — *"for fast tempi, the swing ratio reaches 1 and… for
successively slower tempi… almost 3.5"* (Friberg & Sundström, *Music Perception*
19(3), 2002). At 124–134 BPM the ladder stops at 62%, which is why ours does.
Detroit is described as *"swung, jittery percussion"* with *"shuffling hi-hats"*;
electro proper is straight (Attack's Cybotron build: swing 50%).

**Boys Noize** — the arrangement doctrine, and it is the brief in his words:
*"I'm more bored by the regular techno track structure where it's six minutes
about one thing"*; *"It's so boring when you listen to a song and you know 'this
is a verse, this is a verse, this a bridge…'"*; *"none of my music has a
template"*; *"I don't use the same kick drum or snare drum sound twice. Each track
should have its own color"*; and, admiringly, of early Detroit — *"some of the
stuff doesn't even work harmonically."*

**The Bloody Beetroots** (Sir Bob Cornelius Rifo) — *"my punk, don't-give-a-f*ck
attitude gives me extra freedom to break a few rules, step off the path, and
**finish a song from different angles**"*; *"the goal is truth, not cleanliness"*;
*"dirt is at the root of what I do"*; *"destroy to create"*; *"I'm not loyal to any
single machine or plugin."* That last pair is the argument for making *how a
record changes* a draw rather than a constant.

**Death Grips** — *"there's a lot of recycling and destruction that happens in the
making of our music"*, and the concrete procedure usually cut from that quote:
take a sample from YouTube, *"build a whole song around it with these more hi-fi
instruments, and then erase the sample… so it's not even in the track."* Zach
Hill: *"I'll already have a drum track, with the song entirely composed on
drums"* — **the drums are the form.** Third-party analysis of "Guillotine" finds
coherence achieved *without harmonic progression*, carried instead by **spectral
width — bandwidth widens in the hook, narrows in the verse.** That is structure
made of mix moves, which is the argument for §7e.

**New wave / free jazz.** *Remain in Light*: *"the basic tracks focused wholly on
rhythms and were all performed in a minimalist method using only one chord…
relying instead on the use of different harmonies and **counter-melodies** over
pedal points"* — i.e. a pedal is earned by interlocking parts, which is exactly
what this genre did not have. Afrobeat: *"two guitars playing distinct,
interlocking rhythm parts."* And the rule for who may go outside, from Miles:
**"Davis reportedly instructed bassist Michael Henderson to not follow the other
members of the band 'out.'"** The rhythm section holds; the soloist leaves.
Coltrane's late playing is held together by small pitch cells — *"Tn-type (0,1,3)
as a structural progenitor… for the entire length of the piece"* — which is what
our ostinato cells are.

**Not found, and recorded as not found:** any Detroit originator stating extended-
chord usage in their own words; a documented chord count per track for the genre;
instrument assignment for the "1-7-11-14" electro pattern; any source linking
electro kicks to tresillo; **specific subdivisions for new-wave stabs** (the
biggest gap — every source is qualitative); TR-808 shuffle percentages.

## §7e WHAT IS STILL OPEN

1. **The counter-line is present but thin** — 0.1% of notes. It is in the
   arrangement and it is wired to its own instrument, but the material it derives
   from is small. Honest state: the part exists and is audible in the roll; it is
   not yet the interlocking second voice §7d argues for.
2. **Rule-breaking is still not a mechanism.** `probe_theory` reads this genre at
   0.0% out of key. The sourced version is here and unbuilt: side-slipping
   (*"play in a scale a half-step above or below the original chord before
   resolving"*), and the Miles rule about who is allowed to do it. BACKLOG §G.
3. **Detroit's parallel-voicing move** — one shape transposed, leaving the key by
   construction — is researched here and not yet implemented. It is the single
   most direct route to (2).
4. **Electro's syncopated kick** (steps 1 and 9, plus 7 or 11) is researched and
   not yet in the pocket table.

**Nothing here has a verdict.** Whether the record is now good is the owner's
call; this section records only what changed and what it measures.
