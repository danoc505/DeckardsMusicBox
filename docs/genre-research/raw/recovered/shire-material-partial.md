# RECOVERED — the Shire material

*This agent was stopped mid-run when the owner cut the research back. Nothing
here is a finished sheet. It is the material that had already been fetched and
the reasoning that had already been written, salvaged from the run transcript so
the fetching does not have to be paid for twice. TREAT EVERY LINE AS UNVERIFIED
until it is checked against its source: the agent had not reached the stage where
it separates what it sourced from what it was still assuming.*

## Searches it ran (3)

- `select:WebSearch,WebFetch`
- `"Annotated Score" Doug Adams "The Two Towers" Complete Recordings pdf`
- `Doug Adams "Music of the Lord of the Rings Films" Shire theme "Rural Setting" "Pensive Setting" "Hymn Setting"`

## Pages it fetched (1)

- https://pdfcoffee.com/the-two-towers-annotated-score-pdf-free.html

## What it had written when it was stopped

I'll start by reading the required context files.


## Raw fetched material (32 results, longest first, truncated to 20k each)

~~~
# SCORE CRAFT — how an orchestra is written, and what of it this program can do

*2026-08-11. The synthesis step that three killed workflows never reached.*

The owner: *"I think you should do a quick research on how to program scores and
orchestra"* … *"were you able to read LOTR scores or not? Did you do more research
like i asked you to do?"* … *"am I to gather you told me that you were able to
save the research data from before and then you never bothered to read it?"*

**That last one was the finding.** The research WAS saved — 3037 lines of it, in
`raw/epic-orchestral-scale.md`, `raw/lotr-score-study.md` and
`raw/overworld-and-materials.md`. I wrote the salvage script, committed the
files, and then built a genre without opening them. This sheet is what was in
them, read end to end.

---

## §0 HOW THIS WAS MADE, AND HOW MUCH TO TRUST IT

Ten readers over the three files, one per block, extracting every finding with a
verbatim quote. **422 findings.** Then a verification pass over the 163
load-bearing ones — DOCTRINE or NOTATION with something encodable in them —
whose only job was to find extractions that read plausibly and are not in the
text. **131 came back CONFIRMED. 14 came back OVERSTATED.** Then a completeness
critic that read all three files again and listed what the readers had missed.

The 14 overstatements are the most useful output of the whole exercise and they
are kept below, in place, marked. **Two of them were already in the previous
draft of this sheet and are now corrected** — see §8 and §10.

Four kinds of statement appear here and they are not interchangeable:

- **[NOTATION]** — pitches somebody read off a staff or a MusicXML file.
- **[DOCTRINE]** — a rule from a public-domain treatise, quoted verbatim.
- **[MEASURED]** — a number somebody counted.
- **[PROSE]** — an analyst asserting something with no staff attached. Weakest.

---

# PART ONE — THE DOCTRINE

## §1 THE CENTRAL LAW: FOUR REAL PARTS AND A PILE OF DOUBLINGS

**[DOCTRINE]** Rimsky-Korsakov, *Principles of Orchestration*, Gutenberg #33900,
Ch. III:
## §14 THE SHIRE THEME — AND THE CORRECTION THAT MATTERS

**`lotr-themes-measured.md` §1 is built on a bad transcription.** The research
that found `Shire.abc` flagged it in the same breath:

> *"CAVEAT: I could NOT reconcile this melody with the four other independent
> Concerning Hobbits/Shire transcriptions I extracted (which all agree on
> 1-2-3-5-3-2-1). Treat this file's accuracy as doubtful despite its Howard Shore
> credit line."*

**Five independent transcriptions agree against it.** **[NOTATION]**

| source | key | metre | tempo | melody |
|---|---|---|---|---|
| FOTR Complete Recordings transcription, p.8 | D major | 4/4 | ♩=90 | `D4 E4 F#4 F#4 A4 A4 F#4 F#4 E4 D4 D4` = **1 2 3 3 5 5 3 3 2 1** |
| flat.io full orchestral (16 parts) | D major | 4/4 | ♩=100 | `D5 E5 F#5 F#5 A5 A5 F#5 F#5 E5 F#5 E5` |
| flat.io piano (67 bars) | D major | 4/4 (one 2/4 bar) | ♩=105 | `D5 E5 F#5 A5 F#5 E5 F#5 E5` |
| engraved piano PDF | G major → A major at m13 | 4/4 | ♩=92→105 | modulates, 2/4 bar at m16 |
| tinwhistle tab | D major | — | — | independent confirmation |

Four facts, and every one contradicts what hobbit synth was built on:

1. **MAJOR PENTATONIC.** Pitch set D–E–F#–A(–B). *"no 4th, no 7th."* Corroborated
   independently: *"The melody follows a D major pentatonic scale, with the
   occasional major sixth"* functioning *"as a passing note."*
2. **Degrees `1 2 3 3 5 5 3 3 2 1`** — an arch to the fifth and back. Young's
   Schenkerian reduction says the same: *"a prolongation of tonic, featuring an
   arpeggio to scale-degree 5 and a concluding 2-1 neighbor motion."*
3. **4/4, not 3/4.**
4. **The bass is in the RELATIVE MINOR.** The 16-part score's contrabass, bar by
   bar: `B2 B2 D3 B2 G2 G2 E2 C#2→D2 E2 B2 B2 D3 B2 G2`. **A D-major tune over a
   Bm–D–G–Em bass.** The piano LH gives the chords outright: `D – A – Bm – G – A`
   = **I–V–vi–IV–V**.

That fourth item is the answer to *"Hobbit Synth shouldn't be as dark and moody
as the Dungeon Synth"*: **a bright tune with the shade underneath it, at the same
time.** No new mode required.

**And the caveat that must ride with all of it:** *"Everything here is a FAN
TRANSCRIPTION except the paywalled commercial editions. None is Shore's actual
manuscript."*

### The head motif, three sources, two of them official

> *"stepwise 1-2-3, then a leap to 5, over a static tonic triad, in major
> pentatonic with no 4th and no 7th"*

- The Shire, D major: `D–E–F#–(F#)–A` = 1-2-3-3-5
- Rivendell / "Many meetings", C major: `C–D–E–E–G` = 1-2-3-3-5
- **In Dreams, C major (OFFICIAL Alfred):** `C–D–E–…–G` = 1-2-3-5

The researcher singles this out as the one worth implementing. Note the honest
caveat: only *In Dreams* is official and it is quoted with an ellipsis.

**And the mask relaxes after the head:** the continuation *"breaks the mask: C#5
(degree 7) and G4 (degree 4) appear in the second phrase."* So it is a constraint
on the theme statement, not on the whole part.

## §15 THE OTHER THEMES

All **[NOTATION]** unless marked.

**Rohan** — flat.io full score, 31 bars, 4/4, ♩=76, 10 parts. Pitch set
{C,D,E,F#,G,A,B}: one sharp, **modal**. Flute melody m10-12: `C4 G4 F#4 | A4 A4
G4 A4 B4 E4 | B4 E4 B4 E5`. And the cello runs a **two-note ostinato**: `C3 D3 |
D3 C3 | C3 D3 | C3 D3 | D3 E3 | E3`.

> **VERIFIER:** an earlier summary said the ostinato *"then opens into fifths."*
> It does not — it opens by a STEP to E3, and no fifth appears in the quoted
> range. Plausibly a conflation with the MusicXML `fifths=0` field on the same
> line. Dropped.

The Rohan.abc file is separately a **6/8 jig in A major**: `AEc BEB|Bcc Ace|cdd
ecA|E2d dcB`. Rohan LEAPS where the Shire STEPS — fourths, fifths, sixths,
outlined triads. **That is one number per theme: an interval budget.**

**Isengard** — **5/4, explicitly, in the file attributes.** 25 bars, ♩=80. The
core cell doubled at the octave between brass and strings: `F E F / E D A`. It is
then **transposed**: `C4-B3 / C4 held, then B3-A3-E3`. Chromatic rise at m21-22:
`C–C#–C#–D`. Scored on metal: *"bell plates, anvils, bass drum, taiko, and chains
beaten on piano strings."*
> *Caveat from the file: internal duration inconsistencies — "trust the PITCHES
> and the 5/4 meter more than the exact printed durations."*

**Fellowship** — 52 bars, ♩=100, E major (fifths=4) modulating to fifths=0 at
m37. Violin: `(pickup F#5 G#5) A5 G#5 F#5 E5 F#5 G#5 | F#5 E5 D#5 | C#5 B4 B4 |
C#5 … F#5 G#5 | A5 G#5 A5 B5 A5 B5 | C#6` = degrees 4-3-2-1-2-3 | 2-1-7 | 6-5-5 |
6 … 2-3 | 4-3-4-5-4-5 | 6. Cello under it: `A3 E3 | F#3 E3 D#3 | C#3 B2 B2`. In
Alfred's published conductor score it is **3/4 at "Marcato ♩=168"**, concert C
major/A minor, with a 5/4 bar arriving at bar 16, timpani tuned F, A, C, E.

**Gondor** — Titus, treble, 4/4, no key signature, 8 bars. m1 `D4` then `A4` —
a rising perfect fifth. m3 `C5` whole. m4 `A4` whole. m5 restates D4–A4. **m8
ends on E4, not the tonic.** Mode: **D Dorian** — the sixth degree is absent from
the melody and the seventh is never raised. Six chords, one triad per downbeat:
**Dm, G, F, B♭, C, A** — *"with the exception of D minor, all the chords are
major."*
> The corpus flags a conflict — Reitter's prose says D major — and adjudicates for
> Titus, who has notation. It also offers a reconciliation the earlier draft
> dropped: *"Titus's A major and Young's A minor are different passages/settings
> of the theme, which is itself a usable fact: the chord on that scale degree is
> mutable."*

**The Ring** — Macksey EX.4, a full four-bar string score. Cello + bass divisi
`F3 + C4`; viola divisi `A♭3 + C4` in bars 1 and 3, `A♮3 + C4` in bars 2 and 4.
**Bar 1 is an F minor triad whose third flickers between A♭ and A♮.** Violins
doubled, melody across all four bars uses **three pitches only: A5, B5, C6.** A
minor pad, a raised fourth over it, a three-note cell oscillating on a semitone.
> *The bass motion `F3 → G#3 → F♮3` is flagged by its own reader as lower
> confidence than bar 1. The roman numerals in that article are the author's
> prose and were NOT verified against the staff.*

**Ring and Mordor both open with a rising semitone** — Ring `B4 C5 B4 A4`, Mordor
`C#5 D5 C#5 B♭4` (Trumpet in C, cut time). They diverge on the third interval:
Ring falls a whole step, Mordor a minor third. Confirmed three ways.

**Khazad-dûm** — 4/4, ♩=172, male choir. Opening ostinato `D2 + A2 + D3`: **a
bare open fifth doubled at the octave**, with F3 above. The dungeon-synth sound,
notated.

**Gollum's Song** — ♩=104, K:C, with explicit modal mixture: `_b` against `=b` in
adjacent notes, plus `^f` and `^g`. Printed chords **Gm – Bm – Gm – Bm – Cm**,
LH triads verified. **Gm↔Bm is a chromatic mediant.**

**Into the West** — **I–V–ii–vi**, cross-confirmed in two keys by two independent
official publications: C–G–Dm–Am (easy piano) and E♭–B♭–Fm–Cm (SATB octavo).

**The Prophecy** — official Alfred, A minor, 4/4, *"Slowly, darkly ♩=60"*. A slow
i↔iv oscillation extending to Dm7, then F, then an F-minor modal mixture. The
meter sequence alternates 4/4–3/4–2/4–3/4–4/4–3/4–4/4, and the tempo map is
anchored to bars: **bar 25 "Brightly ♩=168", bar 57 "Moderately slow ♩=60".** In
the fast section the solo line is *"written almost entirely in accented whole
notes and dotted halves"* — **the tempo rises but the melodic rhythm slows.**

**Prologue tempo map, in full:** ♩=50, 55, 72, 76, 90, 112, 124, 𝅗𝅥=88, then 72,
84, 112, 56, 114, 60.

**Tempo across the whole extracted corpus clusters ♩=70 to ♩=118** — pastoral at
the top, laments at the bottom.

## §16 CHROMATIC MEDIANTS — A LOOKUP TABLE

**[NOTATION]** Lee & Lee print a 16-bar harmonic reduction of *Gollum's Song*,
one triad per bar, every transformation labelled: RP, T1, PRM, RP, P, T1, PRM, N,
PL, LP, PL, T1, PRM, PRM, PRM. Named pairs with affect: **G#m→Bm** (RP,
"sadness/tragedy"), **D→B** (RP, "despair/anger/loss of hope"), **Gm→Bm** (PL,
"melancholy/uneasy/tense"), **Bm→Gm** (LP).
~~~

~~~
1	# THE LORD OF THE RINGS THEMES, READ OFF THE NOTATION
2	
3	*2026-08-10. The owner, after three genres had been built without this:
4	"were you able to read LOTR scores or not?" — No. Then: "I feel like you need to
5	study those scores and score writing in general because if you had done this we
6	would not be here."*
7	
8	*Both correct. The earlier score study died on a session limit with
9	`themesWithContent: 0` — all nine theme-reader agents failed and only the source
10	hunters survived. Those hunters found ABC-notation transcriptions, which are
11	PLAIN TEXT WITH NOTE LETTERS IN THEM, and I never opened the files. This sheet is
12	what was in them.*
13	
14	---
15	
16	## §0 WHAT THIS SHEET IS AND IS NOT
17	
18	**Is:** four Howard Shore themes as actual pitches, meters, tempos and keys,
19	transcribed into ABC by hobbyists and mirrored at `trillian.mit.edu`.
20	
21	**Is not:** the published score. These are TRANSCRIPTIONS — a good one is
22	faithful to pitch and meter and is not authoritative about orchestration,
23	voicing or the inner parts. Every degree below is my arithmetic on the
24	transcription's own note letters, which is checkable; nothing here is my ear.
25	
26	Sources, all fetched:
27	- `trillian.mit.edu/~jc/music/abc/demo/Tunes/Shire.abc`
28	- `trillian.mit.edu/~jc/music/abc/demo/Tunes/Rohan.abc`
29	- `.../mirror/community.codemasters.com/forum/ConcerningHobbitsFullVersion.abc`
30	- `.../mirror/community.codemasters.com/forum/RingGoesSouth.abc`
31	
32	---
33	
34	## §1 THE SHIRE THEME — and it is MAJOR, and it is in THREE
35	
36	> **⚠ THIS SECTION IS WRONG. 2026-08-11.** `Shire.abc` is a bad transcription,
37	> and the research that found it said so in the same breath — *"I could NOT
38	> reconcile this melody with the four other independent Concerning Hobbits/Shire
39	> transcriptions I extracted (which all agree on 1-2-3-5-3-2-1). Treat this
40	> file's accuracy as doubtful despite its Howard Shore credit line."* I read the
41	> ABC and not the caveat next to it.
42	>
43	> Four sources agree against it, three of them official: the theme is **D major,
44	> 4/4, ♩=90–105, degrees 1 2 3 3 5 5 3 3 2 1, MAJOR PENTATONIC (no 4th, no 7th),
45	> over a relative-minor bass (Bm–D–G–Em)**. See `score-craft.md` §1 for the
46	> table and the sources. §2–§4 below are unaffected.
47	
48	
49	
50	```
51	M:3/4   L:1/4   Q:1/4=90   K:Cmaj
52	E F G | A G A | B2 B | B2 c | d2 d | c2 B | A2 A | G F E |
53	```
54	
55	**Scale degrees in C** (octave marked where it passes the tonic):
56	
57	| bar | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
58	|---|---|---|---|---|---|---|---|---|
59	| notes | E F G | A G A | B – B | B – c | d – d | c – B | A – A | G F E |
60	| degrees | **3 4 5** | **6 5 6** | **7 7** | **7 1̂** | **2̂ 2̂** | **1̂ 7** | **6 6** | **5 4 3** |
61	
62	Four facts a genre table can use, and three of them contradict what I built:
63	
64	1. **IT IS IONIAN.** C major, no accidentals in the whole strain. Hobbit synth
65	   was written dorian-led with minor behind it. The most on-brief theme in the
66	   trilogy for a genre called *hobbit* has no minor in it at all.
67	2. **IT IS IN 3/4.** Not 4/4. The whole program assumes a sixteen-step bar.
68	3. **90 BPM**, against the 102–124 I drew from walking-cadence research.
69	4. **IT MOVES BY STEP.** Every interval in the strain is a second or a third —
70	   the largest leap is E→G and A→c, both thirds. The contour is a single ARCH:
71	   starts on 3, climbs to 2̂ (the ninth) at bar 5, and walks back down to 3.
72	   It begins and ends on the SAME NOTE, and that note is not the tonic.
73	
74	The second strain is a rising sequence, and it is the same shape transposed:
75	
76	```
77	G3 | G3 | A3 | A3 | B2c | B2c | A2B | c3 |
78	d3 | d3 | e3 | e3 | f2g | f2g | e2f | g3 |
79	```
80	Bars 9–16 are 5 5 6 6 7-1̂ 7-1̂ 6-7 1̂; bars 17–24 are **the identical figure a
81	fifth higher** (2̂ 2̂ 3 3 4-5 4-5 3-4 5). A sequence, exactly repeated at a new
82	pitch level — the cheapest and most effective development there is, and the
83	program has no mechanism for it.
84	
85	## §2 CONCERNING HOBBITS — the same theme, dressed
86	
87	```
88	M:4/4   L:1/8   Q:1/4=118   K:G
89	d/e/(f f)(a a) f3/2 e/ f/e/ | d4 z f2 a | b3 c' c'3 a | f3 g/f/ e3 d/e/ |
90	```
91	
92	**4/4 at 118**, G major. Note what the notated version carries that the simple
93	one does not: `^c` (a raised fourth), `^f`, `^g`, `^a`, `=a` — chromatic
94	inflections against a diatonic tune. The melody is diatonic; the COLOUR is not.
95	
96	**And it contains its own accompaniment, written out.** Bars 26–33:
97	
98	```
99	DA, FA, FA DA | CA, EA, EA EA | DB, FB, FF DF | B,G, DG, CA, EC |
100	```
101	
102	That is a two-note alternating figure — a low note and a note above it, over and
103	over, changing on the harmony. This is Adams' "Hobbit Skip Beat" / "Two-Step
104	Figure" as actual pitches rather than as a name. **It is the walking
105	accompaniment**, and it is the thing an overworld genre most needs and this
106	program generates nothing like: a fixed two-element rhythmic cell whose PITCHES
107	track the chord while its SHAPE does not change.
108	
109	## §3 ROHAN — 6/8, and it is a JIG
110	
111	```
112	R:jig   M:6/8   L:1/8   K:Amaj
113	A E c | B E B | B c c | A c e | c d d | e c A | E2 d | d c B |
114	```
115	
116	**A major. Compound meter.** The travelling meter the overworld research
117	suspected and could not source is sourced here.
118	
119	And its intervals are the OPPOSITE of the Shire's: `A E c` is down a fourth then
120	up a sixth; `A c e` is a triad outlined. Rohan LEAPS where the Shire STEPS. Two
121	themes, one register, one key family, told apart by interval size alone — which
122	is a rule a generator can hold.
123	
124	## §4 THE RING GOES SOUTH — the travelling cue
125	
126	```
127	M:4/4   L:1/8   Q:1/4=118   K:C
128	E/B/e/g/ ^f4 | B,2 d4 | e6 | A6 | E/B/e/g/ ^f4 | ^C2 G4 | A2 G2 A2 | _B2 G4 |
129	```
130	
131	**118 BPM.** Very long notes — `e6`, `A6`, `f4` — against fast four-note pickups.
132	`^f`, `^C`, `_B` are chromatic against K:C. This is the cue where the Fellowship
133	walks, and its melodic rhythm is **slow notes with quick approaches**, not an
134	even stream.
135	
136	Then, from bar 17, the walking engine:
137	
138	```
139	A2A,2 E2A,A | G2G,2 C2G,G | A2A,2 E2A,2 | z2 A,2 E2 de |
140	```
141	
142	`A2 A,2` is the note and the same note an octave below, alternating. **An octave
143	oscillation on the beat, under the tune, changing with the harmony.** Same device
144	as §2, one interval wider.
145	
146	---
147	
148	## §5 WHAT THIS SAYS ABOUT THE PROGRAM
149	
150	Written as findings, not as a plan, because the plan is the owner's call.
151	
152	1. **~~Hobbit synth is in the wrong mode. The source material is Ionian.~~**
153	   **CORRECTED BY THE OWNER, IMMEDIATELY AND RIGHTLY:** *"dont be that stupid to
154	   think we want ONE scale. That is not only insane it goes against the programs
155	   rules. Constraints NOT baked in values."*
156	
157	   Four themes is a sample, not a setting. What §1–§4 actually establish is that
158	   **Shore uses a MODE PALETTE and assigns it by culture** — the Shire and Rohan
159	   are diatonic-major-family, and the same score carries Adams' "Rohan-esque
160	   Dorian modes", Mordor's chromatic writing, Moria's bare rising fifths and
161	   Lothlórien's "adapted Maqam Hijaz". A score that had one scale would be the
162	   thing nobody wants.
163	
164	   So the finding is about **WEIGHTS AND SPREAD, not a value**: the corpus says
165	   the bright end of the palette is REAL and reachable, where hobbit synth's
166	   table currently makes it nearly unreachable (dorian 6, minor 5, mixolydian 3,
167	   phrygian 1 — and no ionian at all). The correction is to open the draw, not to
168	   pin it somewhere else. Whether the mode should also be able to differ BY
169	   SECTION, the way Shore differs it by culture, is a mechanism question this
170	   program has not answered and is the more interesting half.
171	
172	   **AND IT IS THE SAME MISTAKE AS THE DRONE.** Cohen's "slow harmonic pace"
173	   became one chord; "virtuosity is not density" became one note; now one
174	   transcription in C major nearly became one scale. Three times, one habit:
175	   reading a measurement as an instruction.
176	2. **Two of the four are not in 4/4.** The Shire is 3/4 and Rohan is 6/8. The
177	   program's grid is sixteen steps to a bar — a four-beat assumption baked so
178	   deep that "the meter is 3" is not currently expressible.
179	3. **The accompaniment figure is a real, writable object** — two alternating
180	   pitches, fixed shape, harmony-tracking — and appears in both §2 and §4 at
181	   different intervals. The program's `ostinato` is close but draws a cell of
182	   scale degrees rather than a shape plus an interval.
183	4. **Development is by SEQUENCE.** The Shire's second strain is its first
184	   transposed a fifth, note for note. Nothing in this program transposes a
185	   phrase and restates it.
186	5. **Melody type is an interval budget.** Shire = steps and thirds. Rohan =
187	   fourths, fifths, sixths, outlined triads. That is one number per theme.
188	
189	## §6 WHAT IS STILL NOT READ
190	
191	The published orchestral score. These transcriptions carry pitch, meter, key and
192	tempo, and carry NOTHING about who plays what — which is the half of the brief
193	about an epic-sized orchestra. Doug Adams' Annotated Scores describe the
194	orchestration in prose (already in `raw/`); the notated inner parts are in the
195	rental library and the Alfred folios, neither of which has been opened.
196	
~~~

~~~
raw/epic-orchestral-scale.md:14
raw/lotr-score-study.md:14
raw/overworld-and-materials.md:0
travelling-percussion.md:8
---celtic---
raw/epic-orchestral-scale.md:507:          **evidence**: "French horns ceremoniously recite the Rohan theme over the perpetual churn of militaristic percussion. [...] Evil Times takes the music [...] Nature's Reclamation begins a slow build through its first melodic phrase. [...] The orchestra is invigorated, Nature's melody leaping up into heraldic trumpets and high strings. [...] The Hardanger steps to the fore to sing a doxology for Rohan over the orchestra's thunder. Trumpets take the theme, embracing the Hardanger's dedication. [...] Brass fanfares in gleaming triplets erupt over the charge. The armies collide, not with a wincing dissonance, but with rich major-moded sonorities."
raw/epic-orchestral-scale.md:633:          **evidence**: "3 flutes (1st and 2nd doubling on alto flutes, 2nd doubling on piccolo, 3rd doubling on piccolo and optionally on Irish whistle, alto flute & pan flute), 3 oboes (3rd doubling on English horn), 3 clarinets (3rd doubling on bass clarinet), 3 bassoons (3rd doubling on double bassoon)"; "5 horns in F, 4 trumpets in B-flat (doubling on rotary valve), 3 trombones, tuba"; "(minimum 4 players): timpani, chimes, medium and large tamtams, 5 suspended gongs (6", 8", 10", 12", 14"), suspended cymbals: large and antique, piatti, 2 metal bell plates (14", 1" thick), distressed piano, snare drum, field (or side) drum, 2 bodhráns, Japanese taiko drums: small, medium and large, bass drum, 2 log drums, bass marimba, rattle"; "2 harps, violins I and II, violas, violoncellos, double basses".
raw/epic-orchestral-scale.md:666:          **usable**: Handoff rule with a hard constraint: overlap by exactly one note — the last note of voice A IS the first note of voice B. This is what Adams describes at Pelennor when 'Trumpets take the theme' from the Hardanger. Echo rule: the answering voice must be a filtered/muted version of a RELATED timbre (same patch, lowpass + lower gain), never a different family. Octave-down repetition with reduced level = instant echo. All three are one-line operations in a synth program.
raw/lotr-score-study.md:459:          **detail**: No notation, but gives the exact published instrumentation string verbatim: '3(2+afl,ney,bfl,3.picc+tin whistle).3(3.eng hn).3(3.bs cl).3(3.cbn) – 5.4.3(3.bs tbn).1 – timp,5perc,dulc – mus,gtr,hp,pno(+cel) – boy's chorus,SATB – str+irish fiddle,sarangi(16.14.12.10.8)'. Duration 3:45:00. Hire library: CAMI Music.
raw/lotr-score-study.md:649:          **detail**: CONFIRMED REAL NOTATION: 58 embedded images, 88 occurrences of "Example", 24 of "Figure". Clean machine-engraved score reductions with instrument names, tempo marks, time signatures and film timecodes. Full catalogue of notated examples I verified page-by-page: p36 Ex3-1 Shire Theme + Ex3-2 Frodo's Theme; p37 Ex3-3 Shire Fiddle; p38 Ex3-4 Traveling Song; p39 Ex3-5 Drinking Song; p40 Ex3-6 Gondor Theme; p41 Ex3-7 Rohan Theme; p43 Ex3-9a/b Aragorn Chant + Ex3-10 Eowyn Chant; p44 Ex3-11 Isengard Theme; p45 Ex3-12 Ring Theme + Ex3-13 Mordor Theme + Fig3-1 Correlation of Melodies between Mordor and Ring Themes; p47 Ex3-14a Rivendell Theme + Ex3-14b Lorien Theme; p49 Ex3-15 Passing Wood Elves + Ex3-16 Lament for Gandalf; p53 Ex4-1 Braveheart Wedding Music; p54-55 Ex4-2a-d four Irish folk tunes; p55 Fig4-1a SCHENKERIAN REDUCTION OF SHIRE THEME + Fig4-1b Schenkerian reduction of The Blacksmith's Hornpipe; p57 Ex4-3; p58 Ex4-4 I Will Take It; p59 Ex4-5 No Memory of the Shire; p62 Fig4-2 Rohan Museme + Ex4-6a/b; p63 Ex4-6c William Tell; p64 Ex4-7 Rohan Pedal Theme; p65 Ex4-8 Bach St Matthew Passion + Ex4-9 Tavener Song for Athene; p66 Ex4-10 Descending Rohan Theme; p67 Ex4-11 Gondor Full Theme; p69 Fig4-12 Copland Fanfare, Fig4-13 Strauss Zarathustra, Fig4-14 Williams Star Wars; p71 Ex4-16 Gondor Theme 2; p72 Ex4-17 Hindemith Mathis; p73 Ex4-18 Bach BWV565; p74 Ex4-20 Ring Enchantment + Ex4-21 Snake Charmer; p75 Ex4-22 Smetana Vltava; p76 Ex4-24 Mendelssohn. PITCHES I EXTRACTED FROM THE NOTATION MYSELF (staff-line detection + notehead centroid, skew-corrected): Fig3-1, cut time, treble clef, no key signature — MORDOR THEME (Trumpet in C) = C#5, D5, C#5, Bb4 (sharp written on note 1 and carrying within the bar; flat written on note 4). RING THEME (Violin) = B4, C5, B4, A4 (no accidentals). Both therefore open with a RISING SEMITONE; Ring then falls a whole step, Mordor falls a minor third. Ex3-12 Ring Theme is scored 4/4, quarter=60, Violin / Viola / Cello1 / Cello2, with a written flat on Cello 1 in bars 1 and 3 and a natural in bar 3 of Cello 2. Ex3-13 Mordor Theme is 4/4, quarter=150, Horn in F (1-sharp key signature) / Trumpet in C / Trombone / Bass Trombone, bass trombone running a continuous rest-eighth-eighth-eighth ostinato. Ex3-14a Rivendell Theme is 4/4, Moderato quarter=c.108, harp glissandi + Voice + divisi strings, no key signature. Ex3-14b Lorien Theme is cut time, quarter=60, harp in continuous triplet sixteenths with flats, voice in dyads. AUTHOR'S OWN VERBATIM ANALYTICAL CLAIMS: "the first Aragorn chant seems to be in Mixolydian, and his other chant and Eowyn's chant seem to be in either Dorian or Aeolian"; on the Shire theme vs Irish folk tune — "Both themes consist of a prolongation of tonic, featuring an arpeggio to scale-degree 5 and a concluding 2-1 neighbor motion"; on Gondor (Ex4-16) — "The B in m. 4 is not supported by the A-minor triad of the accompaniment, whereas the melody line is always harmonically supported in mm. 7-8", and "m. 6 involves an additional ascending gesture not found in m. 2"; on the Shire theme orchestration — "a single melodic line (most often played by fiddle or flute), played above sustained diatonic chords in the strings"; the Rohan museme is characterised via Tagg as "based...on leaps of an octave or a fifth...played forte in middle or high register, preferably by a brass instrument (especially horn) at the start of a phrase, and landing on the perfect fifth or octave of the simultaneous harmony." NOTE: the thesis has essentially no roman-numeral analysis (4 hits for "roman", 1 for "triad", 0 for "chromatic mediant", 0 for "pentatonic", 0 for "octatonic") — it is an affect/museme study built on Tagg, not a harmonic-theory study. Its value is the notated examples themselves. Local copy: /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/docs/bgsu.pdf ; rendered pages young_p36/40/41/45/47/55/67.png in the same directory.
raw/lotr-score-study.md:736:  1. MATTHEW YOUNG, BGSU 2007 (OhioLINK, free PDF, 84pp). This is the "Matthew Young" reference. It reproduces ~58 machine-engraved score reductions covering essentially every major theme — Shire, Frodo, Shire Fiddle, Traveling Song, Drinking Song, Gondor, Rohan, Aragorn Chant x2, Eowyn Chant, Isengard, Ring, Mordor, Rivendell, Lorien, Passing Wood Elves, Lament for Gandalf — each with instrument names, tempo marking, time signature and a film timecode. It also has a Schenkerian reduction of the Shire theme. Caveat: it is a Tagg-style AFFECT study, so it has almost no roman numerals and zero chromatic-mediant discussion. Its value is that it hands you the actual notes.
raw/overworld-and-materials.md:151:          **evidence**: Lewis Jones's 2013 analysis of the Butterworth MSS, 103 tunes: 86 were 'purely modal' (Major/Ionian, Dorian, Mixolydian or Aeolian); of the remaining 16, 13 modulated between Major/Ionian and Mixolydian, 2 were Aeolian with Dorian influence, 1 Dorian with Mixolydian influence. Also: 'The Phrygian mode is rarely encountered in Celtic, Anglo-American and English folk song' and 'the full Lydian and Locrian modes scarcely appear at all.'
raw/overworld-and-materials.md:155:          **source**: https://folkopedia.info/wiki/Scales_and_Musical_Modes_in_Celtic,_Anglo-American_and_English_Folk_Songs
raw/overworld-and-materials.md:214:          **evidence**: 'The melody follows a D major pentatonic scale, with the occasional major sixth'; an 'Anhemitonic Pentatonic Scale' with an added sixth 'functioning as a passing note'; 'diatonic, stepwise moving melody'; harmony 'kept moderately simple, using chords I-iii-IV-I, IV-V-I-V'; orchestrated for 'celtic instruments such as fiddle and tin whistle', plus bodhrán. Shore's own words on substitution: 'If I don't use the Whistle, the clarinet is an elegant substitute for it.'
raw/overworld-and-materials.md:220:          **usable**: HOMELAND/DEPARTURE preset: pitch set = major pentatonic {1,2,3,5,6}, with scale degree 6 permitted only as a passing tone between 5 and 1; melodic motion stepwise within the pentatonic (so 'steps' include the m3 gaps); chord loop = choice(I-iii-IV-I, IV-V-I-V), 4 bars; lead instrument = tin whistle with clarinet as documented fallback.
raw/overworld-and-materials.md:277:    - https://folkopedia.info/wiki/Scales_and_Musical_Modes_in_Celtic,_Anglo-American_and_English_Folk_Songs
~~~

~~~
And back again.
23

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
INSTRUMENTS
H O BBI TO N
The Hobbit/Shire theme’s Rural Setting is most closely 
connected to these signature hobbit instruments. But 
as the hobbits depart the Shire and adventure their way 
through Middle-earth, these Celtic sounds continu-
ally make their way into the edges of the orchestra as a 
reminder of what the Shire folk have left behind.
BODHRÁN
Listening Example: Disc One | Track T wo | 1:34 [Percussion 
Accompaniment]
The bodhrán (Bough-rawn) is just one of an ancient family of frame drums that consist of a stretched hide over a wooden shell. 
Bodhrán drums are believed to have originated in Ireland (or possibly emigrated there via the Roman Empire or Arabic trade 
routes), and derived their name from a Gaelic description of the sound, roughly translated as “thundered.”
FIDDLE
Listening Example: Disc One | Track T wo | 1:18 [Melody Line]
The ﬁddle itself is not unlike the classical violin of the orchestra (though occasionally performers will adapt the instruments’ 
bridges), but the playing techniques diﬀer slightly allowing for greater latitude in bowing and ornamentations.
WHISTLE
Listening Example: Disc One | Track Three | 0:00 [Opening Solo]
The Irish whistle (also known as the penny whistle, vertical ﬂute, ﬂagolet, stáin or feadóg) may be the oldest instrument in Celtic 
music. Originally carved from bone, today’s whistles are generally made of wood or metal.
DULCIMER
Listening Example: Disc One | Track T wo | 1:18 [Steady Accompanying Figures Behind Melody]
Hammered dulcimers consist of a series of wires stretched tightly over a wooded resonating frame and struck with small ham-
mers. The name comes from the Latin and Greek hybrid of the words dulce (sweet) and melos (tone).
CELTIC HARP
Listening Example: Disc One | Track Four| 1:55 [On the Hobbit Skip Beat ﬁgure (following the third Mandolin Strummed Chord)]
Also known as Irish harp, lever harp or simply, folk harp, the Celtic harp is a smaller, more portable version of the orchestral harp, 
well suited to diatonic music.
MUSETTE
Listening Example: Disc One | Track Three | 1:11 [Short Sustained Chord Drones Behind Melody] 
The musette is a small, diatonic, accordion-like instrument consisting of a keyboard aﬃxed to bellows. Howard Shore wrote a 
handful of musette lines to provide harmonic accompaniment to the Shire theme’s Rural Setting.
MANDOLIN
Listening Example: Disc One | Track Four| 1:48 [Strummed Chords]
A smaller relative of the guitar, the mandolin is a short-necked, eight-stringed lute that is plucked with the ﬁngers. Mandolin does 
not appear regularly in the Shire music, but a few gently strummed chords back the Bag End scenes.
GUITAR
Listening Example: Disc One | Track Three | 2:58 [Steady Accompanying Figure]
Guitar plays the same role in the Shire music as the mandolin, but it enters in more sprightly passages, using a highstring tuning. 
The high strings of a 12-string set are strung on a 6-string guitar resulting in a bright sound.
CELESTA
Listening Example: Disc One | Track T wo| 2:21 [Doubling the Fiddle “Fanfare”]
The celesta is a small keyboard instrument like the piano. Y et, where the piano’s hammers strike taught wires inside the frame, the 
celesta strikes small metal bars to produce a shimmering silvery tone.
24

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
THE ELVES
For ages the Elves of Rivendell have maintained an open relationship with humans, so while they retain their signature musical 
styles and motives, there are no unique instruments that set them apart from the men of Middle-earth. Not so for the mysterious 
and ambiguous Elves of Lothlórien. Despite the fact that this culture eventually proves itself compassionate towards the plights 
of Mankind, it retains a thaumaturgic detachment. Shore paints these Elves in the Eastern bell-like tones of droning strings and 
winds.
MONOCHORD
Listening Example: Disc Three | Track T wo | 0:00 [Faint 
Metallic Slithering Behind Choir and Strings]
The monochord’s history is as mysterious as its 
many uses. The instrument itself consists of a large 
wooden box over which a single string is held in 
place by pegs. An adjustable bridge allows the mono-
chord to shift pitch while the performer either plucks 
or bows the string. Monochords have been used as 
scientiﬁc instruments (Pythagoras used its harmonic 
vibrations to study ratios), astronomy (Ptolemy), 
philosophy (Kepler’s “Harmony of the Spheres”), musical teachings (Guido ofArezzo’s “Guidonian Hand”), and for the curative 
properties of its vibrations. In Middle-earth, our mystical monochord is used for the Elves of Lothlórien, where it provides a low 
droning melancholy over which the melody ﬂows. The monochord used for this recording had 50 strings strung across the bridge.
NEY FLUTE
Listening Example: Disc Three | Track T wo | 3:12 [Doubling the Low String Melody]
An end-blown cane ﬂute, thought to have originated in Egypt approximately 3000 years B.C., the ney ﬂute spread throughout the 
Middle East over a series of centuries, with cultures adopting diﬀering styles and performance techniques. Neys are among the 
world’s oldest ﬂutes, and are still extremely prevalent in the music of Morocco and Persia.
SARANGI
Listening Example: Disc Three | Track T wo | 0:24 [Doubling the Female Choir Melody]
The sarangi, a bowed string instrument common to Indian classical music, is constructed from a single block of wood, covered in 
parchment and generally strung with three or four gut strings under which 35 to 40 resonating strings run.
T H E  DWARVE S
The Dwarf culture saves little concern for eﬀusiveness, so their music presents a rough, forceful sound that stresses open harmo-
nies more than any speciﬁc instrumentation. Here again Shore stresses voices, the most basic producers of music.
In Moria, the vocal style is designed to express the most basic emotions of ﬁght or ﬂight through a male chorus and a most unique 
source…Football Players/Grunters Maori men’s voices created the perfect bass tones for Shore’s dwarf choir, but for the gruﬀ 
grunting sounds the score called for, the composer turned to a less reﬁned source: male football (or rugby) players. These vocalists 
performed the Dwarves chant of, “Lu! Lu! Lu!” or, “No! No! No!”
Listening Example: Disc Three | TrackOne | 0:04 [Answering the First Phrase of the (Singing) Male Choir]
25

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
T H E  O RC S
The Orcs’ unique instruments are particularly impor-
tant to this base and uncivil race. Here Shore repre-
sents the ferocity and anger that melody would be far 
too eloquent to articulate. The Five Beat Pattern is 
designed to showcase these joltingly sharp industrial 
tones of pounded metal and stretched skins.
ANVIL
Listening Example: Disc Three | Track Five| 8:53 [T en 
Strokes Concluding the Composition]
The anvil, which in construction is little more than 
a thick block of metal struck with a metal hammer, is a colorful member of the percussion family that has slowly crept its way 
into the world of orchestral music. Originally derived from the blacksmith’s workplace, composers have used the anvil in operatic 
works such as V erdi’s Il Trovatore and W agner’s Ring des Nibelungen, which calls for 18 tuned anvils. Edgard V arèse used the anvil 
in Ionization to evoke a hardened, industrialized palette of sound.
BELL PLATE
Listening Example: Disc T wo| Track T wo| 1:27 [Accenting Beats One and Four of the Five Beat Pattern]
Bell plates are similar to anvils, but they constructed of comparably thinner sheets of metal, and are generally suspended when 
played.
TAIKO DRUM
Listening Example: Disc T wo| Track T en| 2:37 [Playing the Five Beat Pattern]
These ancient drums, which have been used in Japanese music for over a millennium, exist in four basic sizes. The rich, rum-
bling tone of the drum was associated with the power of the gods in traditional Japanese culture, and the drum was used on the 
battleﬁeld to strike fear into the hearts of enemies. It serves much the same purpose in the music of the Orcs where its pounding, 
unforgiving tone represents their brutal force.
CHAINS AND PIANO WIRES
Listening Example: Disc T wo| Track T wo| 2:36 [Playing the Five Beat Pattern]
The music of composer Henry Cowell (1897–1965) brought to the general public daring new ideas in piano performance 
techniques. In works such as Aeolian Harp and The Banshee, Cowell called for the pianist to reach inside the piano and strike the 
strings inside. Shore’s Orc music follows in this tradition, as he requires his pianist to violently strike the wires inside the instru-
ment with metal chains.
M O R D O R
~~~

~~~
## §17 WHAT ACTUALLY SEPARATES FANTASY SYNTH FROM DUNGEON SYNTH

**[MEASURED]** and this is the block's headline: **it is not tempo.**

| artist | mean BPM | median | mean duration |
|---|---|---|---|
| Hole Dweller | 98.1 | 92 | **2:47** |
| Fief | 101.2 | 98.5 | 3:24 |
| Erang | 106.7 | — | 3:37 |
| Mortiis | 102.0 | — | 5:03 |
| Thangorodrim | 101.6 | — | **10:00** |

Tempo is flat across all five. **Length is the discriminator, and the extremes do
not overlap at all** — Hole Dweller's longest track is 3:27, Thangorodrim's
shortest is 6:23.

At ~100 BPM in 4/4 that is roughly **75–110 bars for fantasy synth against
190–560 bars for dungeon synth.** The consequence for the materials stage is
direct: fantasy cycles through MORE distinct material per minute and then stops;
dungeon sustains one idea.

> **The sample is not random and its own researcher says so:** *"algorithmic —
> Spotify audio-feature estimates aggregated by SongBPM, not hand-tapped; sample
> is the ~10 tracks each artist page displays, apparently alphabetical, NOT
> random."* And exactly **one** confirmed per-track mode datum was obtained in the
> whole block — it reads MAJOR, on a track the same source calls *"somber."* One
> data point cannot support a generalisation and is recorded here only so nobody
> counts it twice.

Also flagged as the agent's own invention rather than sourced, and therefore not
to be encoded: a *"40-60% of tracks have frame-drum percussion"* figure, and a
*"54-58% swing ratio"* for comfy synth. The Erang gear details (Sound Canvas VA,
tape) came from a **403'd** interview via a search summary and must not be used.

## §18 THE OVERWORLD, MEASURED

**[MEASURED]** Tempo and metre across canonical overworld themes fall into three
bands — a lyrical band at 72–90 (FFIV 72, FFVI 80, CT "Yearnings" 84, FFVII 88/90),
a middle band at 108–130 (Dragon Quest V 108, Breath of Fire II 114, DQIII 120,
FFV 125–128, FF1 130), and a fast band at 140–154 (FF Adventure 140, Hyrule Field
144, SMB3 150, CT "Secret of the Forest" 150, Romancing SaGa 3 150, Zelda
Overworld 154).

**Metre: 4/4 dominates.** *"12 of 12 MIDI transcriptions I parsed carried a 4/4
time-signature meta event… 8 of 9 Hooktheory entries are 4/4."* Compound metre is
essentially absent as a NOTATED metre and appears instead as a triplet/shuffle
feel. The one documented genuine metre change is the Dragon Quest Overture: 6/8
intro at 76, then 4/4 at 120.

**Loop length:** SMB overworld = 90 s. Dragon Quest V overworld = 16 bars / 35.6
seconds. Skyrim exploration cues run 3:24 to 7:18, median ≈ 4:44 — *"roughly 3-6×
the length of a JRPG overworld loop."*
> *The corpus's own "3.5–7.5 minutes" summary is contradicted by its own data:
> "Awake 1:31" is in the same list.*

### The harmony, and it is not the one everybody says

**[MEASURED]** from Hooktheory chord-path encodings:

> The recurring "epic wandering" family is **NOT** vi–IV–I–V and only partly
> I–♭VII–IV. It is **(a) major-key borrowed ♭VI/♭VII, and (b) minor-key Aeolian
> descent i–♭VII–♭VI.**

| track | path | reading |
|---|---|---|
| FFVII Main Theme | `1.6.1.b67.b77` | I – vi – I – ♭VI7 – ♭VII7 – I |
| Zelda Overworld | `1.b6.b3.…b7` | I – ♭VI – ♭III – … – ♭VII |
| FF Adventure | `1.7.6.7` | i – ♭VII – ♭VI – ♭VII |
| Hyrule Field | `1.7.6.5.6` | i – ♭VII – ♭VI – V – ♭VI, cadencing IV–V–i |
| CT "Yearnings" | `1add9.6add9.5.7.3` | i(add9) – ♭VI(add9) – v – ♭VII – ♭III |
| SMB3 | `1.57` | I – V7 |

**♭VI and ♭VII borrowed chords are the genre marker, in both major and minor.**

> **AND THE SAME ANALYSIS IS RENDERED TWO INCOMPATIBLE WAYS INSIDE ONE FILE.**
> The overworld block reads Zelda's chord letters off Splice (*"bar 4 D♭ major…
> bar 5 C♭; bar 6 B♭m"*) and numbers only bars 1–3. The chiptune block, citing the
> same page, numbers all eight as `I – v6 – ♭VI – III – ♭VII – vi – V/V – V`. **The
> numerals do not correspond to the letters.** The key is also given twice and
> differently: Hooktheory says B♭ Mixolydian, Splice says B♭ major. Use the letters.

## §19 MODE AND AFFECT — AND THE RULE NOT TO ENCODE

**[MEASURED]** Temperley & Tan, 17 participants, six folk melodies × six modes on
a fixed tonic, forced-choice "which is happier". Proportion judged happier:

| Ionian | Mixolydian | Lydian | Dorian | Aeolian | Phrygian |
|---|---|---|---|---|---|
| .83 | .64 | .58 | **.40** | **.34** | .21 |

F(5,75) = 50.73, p < .001. **But:** *"the pairwise differences are significant for
all but three: Lydian/Mixolydian, Lydian/Dorian, and Dorian/Aeolian."*

> **THE DORIAN–AEOLIAN GAP IS 0.06 AND NOT SIGNIFICANT.** So *"Dorian = wistful,
> Aeolian = tragic"* is **not evidenced**, and if this repo wants a "moody but not
> sad" colour, **Dorian is not the lever.** Mixolydian is the evidenced
> bright-but-not-triumphant mode.

**[MEASURED]** And the budget of expressive control, as squared semi-partial
correlations, median across emotions:

| mode | tempo | register | dynamics | articulation | timbre |
|---|---|---|---|---|---|
| **0.29** | 0.14 | 0.08 | 0.04 | 0.02 | **0.01** |

**Mode outweighs tempo 2:1, and both outweigh timbre by an order of magnitude.**
Linear combinations of these six explained 77–89% of variance. Note tempo was
parameterised as **notes per second (1.2–6.0)**, not BPM — surface rate, not the
metronome. This is the honest ranking of where effort is worth spending, and it
says the instrument matters least.

## §20 THE WALKING TEMPO, SOURCED

**[MEASURED]** Human walking cadence clusters at **110–121 steps/min**, and
walkers pull their cadence to within about one beat of a musical stimulus
(r = 0.86, p < .001). Beat-to-step synchronisation works in a **106–130 BPM**
window; below ~114 tempo drives walking speed linearly, above ~118 it saturates.
Standard thresholds: 100 steps/min = moderate intensity, 130 = vigorous.

Schubert marks the archetypal walking song literally *"in walking motion"* —
*Gute Nacht*, 2/4, **D minor**, constant quaver tread in the piano, at 112–120
quavers/min, **which lands exactly inside the measured human band.**
> *That last coincidence is the researcher's own derivation, not a sourced claim.*

## §21 THE PASTORAL AND THE HUNT — TOPIC THEORY WITH HARD CONSTRAINTS

**[DOCTRINE/PROSE]** Monelle. Compound duple/triple metre signifies **the HORSE**,
not "journey" generally — 6/8 (Schumann's *Wilde Reiter*), 9/8 (Wagner's
Valkyries), 12/8 (Schubert's *Erlkönig*). It is an indexical convention with an
iconic root that outlived the hunting practice it came from.

The pastoral topic has exactly three named components: instruments (musette,
hurdy-gurdy/vielle, the *pifferari*'s zampogna and piffero), the siciliana
rhythm, and simplicity — and **the single most pervasive signifier is the drone
bass.** Concretely: 6/8, 9/8 or 12/8 at moderate tempo, melody in parallel thirds
over a drone.

**And a hard pitch constraint, stated as one:**

> *"pitch set = {1, 3, 5} of the major triad only, voiced in the natural horn's
> 3rd–6th partials. **Forbid scale steps 2, 4, 6, 7.** This is a hard pitch
> constraint, not a style hint."*

The horn-call topic is restricted to the natural horn's triadic shapes, not the
later elaborate diatonic horn writing.

**Pandiatonicism** is definable mechanically: lock the pitch set to one diatonic
collection, disable voice-leading and resolution rules, allow seconds in
voicings, **never resolve**, and *"treat scale degree 7 as a colour tone, not a
pull to 1."*

## §22 WRITTEN TO BE HEARD A THOUSAND TIMES

**[PROSE, and it bears on every looping genre here]** Sugiyama's stated design
constraint is that game music is heard hundreds to thousands of times and must
resist fatigue; **eccentric, attention-grabbing writing is therefore wrong.** He
wrote most of Dragon Quest 1 on **two** channels, reserving three for the opening
and ending, and states that three voices is enough for a professional. His stated
priority: **melody outranks timbre.**
> *Could not be verified verbatim — shmuplations returned an empty body and a
> Cloudflare 202. Treat as a search-snippet quotation.*

Koji Kondo's anti-fatigue device for Zelda field music is **audible counterpoint /
obbligato, not melodic variety** — and in Ocarina he abandoned the series
overworld theme entirely in favour of adaptive variation. His channel reality:
only three usable, **and sound effects stole them mid-song**, which yields a
composition rule — *"write parts that remain intelligible when any single
non-melody voice is muted."*

Uematsu's thickener, in his own words, is a melody doubled by a copy shifted
slightly in **both frequency and timing.**

---

# PART FIVE — THIS PROGRAM

## §23 THE SEAM MAP
~~~

~~~
writing that won’t be heard again until Rings’ second and third ﬁlms.
5  –  R I VE N D E L L
Safely deposited in Rivendell, the score relaxes a moment to commingle music from the hobbit and Elf societies. The iridescent 
Rivendell theme enters, with all the beauty and ﬁnality that it imparts. “It’s music for the end of a civilization,” Shore reminds us. 
The female choir now sings “Hymn to Elbereth,” in refer-
ence to the Elves’ Queen of the Stars.
The Hymn setting of the Shire theme returns, reuniting 
Frodo and Bilbo. “Y ou haven’t heard that since you saw 
Sam talking to Frodo in the cornﬁeld,” says Shore. As Bilbo 
shows Frodo his book’s progress, the theme’s Pensive setting 
returns as well, now scored for clarinet, then ﬂute. “It seems 
a little more elegant with Bilbo. Again I couldn’t use the 
whistle here, it’s too tender a scene. There are none of the 
hobbit folk sounds in Rivendell,” the composer explains. “It’s 
more classical.”
6  –  T H E  S WO R D  T H AT  WAS  BRO K E N
The Rivendell arpeggios cloud over as more visitors arrive. “It’s a darker version of that opening,” notes the composer. Soon the 
score dabbles in signiﬁcantly grimmer tones, previewing the musical palette of Mount Doom. Elrond details Isildur’s long-ago 
refusal to destroy the One Ring and the music bursts into a passionate rumbling of brass chords and rolled timpani before the 
arpeggios return again, gloomier yet, dulled by disappointment.
Later, the second appearance of the Evil Times motive in the Cor Anglais greets Aragorn and Boromir as they meet over the 
Frodo. But the elder hobbit spies a former possession chained around Frodo’s neck, and a jolting high string chord reminds us of 
the Ring’s lurid power. “ Again, it’s all the gestures,” the composer remarks. “These little pauses, they’re operatic, as if the score were 
sung ﬁrst and the gestures were being created by the director afterwards.”
Bilbo expresses his remorse, both for his outburst and for the dire task he has foist upon Frodo. But Frodo accepts his responsi-
bility, and the nine members of the Fellowship of the Ring assemble, ready to embark upon their mission. The Fellowship theme 
begins to swell within the orchestra, the down-and-back-up shape passing emotionally until, with a trill of strings and a striking 
French horn statement of the Shire, Shore sets the Fellowship theme alight: “It’s all Fellowship in a slow setting, now a very heroic 
version!” The thematic progression illustrates that the hobbits are now members of the Fellowship ﬁrst and citizens of the Shire 
second–a new set of priorities that will not be without its sacriﬁces.
1 0  –  T H E  PAS S  O F  C AR AD H R AS
The Fellowship’s quest starts out playfully and carefree with clips of hobbit music encouraging Merry and Pippin’s wrestling 
match with Boromir and Aragorn. Soon the group learns that their progress does not go unwatched and decides to take the 
path through Caradhras. Another of Shore’s Ring Quest themes debuts with their decision: the attenuated stretch of Dangerous 
Passes.
On the path, Boromir momentarily comes into possession of the Ring when it falls oﬀ Frodo’s neck. Again, Shore uses the Seduc-
tion of the Ring theme, but now for the ﬁrst time the boys chorus is able to articulate the text. The Ring’s seductive message is not 
lost on Boromir.
Saruman’s powers block the Fellowship’s progress by way of an avalanche, and so Frodo, the Ringbearer decides that the troupe 
shall pass through Moria. The corrupted White Wizard is pleased, both he and Gandalf know what dangers lay in the Dwarves’ 
lair. Distant bass and taiko drums presage the harsh Dwarf music that will soon meet the band.
1 1  –  T H E  D O O R S  O F  D UR I N
Dangerous Passes sets the Fellowship back on the road, depositing them this time at the hidden entrance to Moria. The moonlit 
doors are eventually revealed with a rising series of major triads and the choral text, “Gandalf at the Door to Moria.” Once the 
doors creak open a brief overlapping statement of the Moria theme manifests, but soon dissipates as the Fellowship sees the car-
nage that awaits their arrival. Retreat, however, places them in even graver danger.
This composition marks the ﬁrst of three sequential monster moments in the score, each of which is approached diﬀerently. The 
music for the W atcher in the W ater’s attack is almost entirely aleatoric—built primarily of controlled streams of orchestral wrig-
gles, for which Shore strictly dictated pitch, entrances, material and performance style. The composer grins: “This is science ﬁction”
9

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
1 2  –  M O R I A
This section of the ﬁlm, charting the Fellowship’s experiences in 
Moria, was the ﬁrst Shore scored for The Lord of the Rings. These 
scenes made up a preview presentation for the 2001 Cannes Film 
Festival and were all performed by the New Zealand Symphony 
Orchestra. “This is where I started. I had written Dwarrowdelf, 
and I had the Shire and Fellowship themes, but these were the very 
ﬁrst scenes I wrote,” Shore remembers. “It was good to write Moria 
ﬁrst because it was a set-piece in the middle of the ﬁlm. Once 
I did that I worked my way out of it back to Hobbiton and to 
Lothlórien. I had the middle of the score done, and that approach 
seemed to work well.”
The Moria pieces are among the most cheerless in the score. Shore’s music creates an oppressively sinister path for the Fellowship 
to journey. The Moria music utilizes the deepest, most ghostly sounds in the orchestral array, including a bass drum struck with a 
large rattle. The male voices sing “Durin’s Song” in the harsh, guttural sounds of the Dwarvish language.
1 3  –  G O L LUM
It is in this sequence that Gollum’s Pity theme gains its greatest dramatic signiﬁcance. The creature is wretched and vile to be sure, 
but in the end, he’s a victim of the Ring. Here, as Gollum’s crooked tune sings in the cor, the music articulates a sense of sadness 
and regret—the same pity that stayed Bilbo’s hand years ago.
As Frodo and Gandalf continue discussing the peril of their journey, an alto ﬂute softly intones bits of the Hobbit’s Understand-
ing variation on the Shire theme. This sequence, also part of the Cannes preview, marks the ﬁrst time Shore wove the Shire theme 
into his score. A nearly identical ﬁgure will return near the end of the ﬁrst ﬁlm when Frodo remembers Gandalf ’s words.
1 4  –  BAL I N ’ S  TO M B
Gandalf leads the Fellowship into Dwarrowdelf, and Shore’s music expresses the sad beauty of the fallen city. “W e called it faded 
glory, or ruined grandeur. I wrote it based on the Alan Lee drawings. Later, when Gimli is in front of the crypt you hear a bit of 
the Dwarrowdelf theme again, because he’s mourning the loss of Balin. And you’ll hear it once more in Moria.”
In Balin’s tomb, the Fellowship is attacked by a league of Orcs. However, instead of ham-
mering the action home, Shore’s score suddenly drops out after a preparatory build-up. 
“It was Peter’s idea,” the composer recalls. “He thought it would be more brutal and 
realistic to end the score when the ﬁghting began. It seemed more life-threatening.”
In the midst of the fracas the Cave Troll enters the tomb; as it hunts Frodo, so does 
Shore’s score. This, the second of Shore’s monster compositions, is the most emotional 
of the collection. After the orchestra reels with a series of musical hammer strokes
~~~

~~~
in his dank cave and accompanied by his Pity theme). The Nameless Fear 
passage plays under the Lady of the Galadhrim, for though it looks as if the 
Ring has receded from Middle-earth’s everyday life, we well know that it 
shall again make its presence known. Sure enough, with another cor anglais 
statement of the History theme the Ring passes to Bilbo Baggins of the 
Shire.
2  –  T H E  SH I R E
The story moves forward to the waning years of the Third Age of Middle-earth as we are introduced to the Shire. The short piece 
of music that ushers us into the hobbits’ homeland was originally written for the theatrical cut of the ﬁlm, but the early Shire 
scenes were shortened when the Prologue was lengthened, so Shore’s introductory music went unheard until the DVD edit. “W e 
had the piece and I’d almost ﬁnished orchestrating it” , the composer recalls. “It didn’t have much of the full Shire theme in it yet, 
because it was just showing the history 
of the Shire in a montage. Now, you 
actually hear the Rural ﬁddle theme 
ﬁrst, then the Pensive setting theme 
developing from it.” Here too, Shore 
begins to utilize his Celtic assortment 
of instruments, including bodhrán, 
dulcimer, Celtic harp, musette, man-
dolin and guitar. 
Also introduced are the T wo-Step 
Figure, the End Cap, the Hobbit Skip 
Beat and a more developed statement 
of the Fellowship theme used under 
the ﬁlm’s title graphic.
UNUSED CONCEPT: 
The ﬁlmmakers originally shot Fellowship’s 
prologue as a shorter sequence for which 
Shore wrote a self-contained four minute 
composition. During the ﬁlm’s editing, it 
was decided that a lengthier sequence would 
set up the ﬁlm’s story with a more detailed 
and visceral punch. The ﬁlm’s Prologue was 
expanded, and so Shore went back and com-
posed a new work to match the edit. The ﬁrst 
composition (featuring the text, “The Battle 
of Dagorlad”) was presented on The Fellow-
ship of the Ring’s original soundtrack album 
in 2001, but never appeared in the ﬁnal ﬁlm.
While the two Prologue scores are similar, 
the ﬁnal version (now presented on disc 
for the ﬁrst time) considerably expands the 
original concept and captures the opening 
action with a raw collection of orchestral 
outbursts, hinting at the level of conﬂict that 
The T wo T owers and The Return of the King  
will present.
2

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
3  –  BAG  E N D
While Frodo reads beneath a shady tree, the whistle makes its ﬁrst appearance, revealing the hobbits’ serene internal life—a 
quality upon which Middle-earth will soon rely. “The whistle seemed right. It had a nice peaceful sound to it, simple and not too 
orchestral.”
Gandalf ’s cart pulls up the road as the grey Wizard gently sings to himself. Though Shore provides orchestral support with a few 
glowing string chords, the melody comes from Fran W alsh, and the lyric, from J.R.R. T olkien. As Gandalf and Frodo struggle to 
suppress their smiles, Shore’s jocund Hobbit Outline ﬁgure begins. “Here Frodo is giving a little history,” says the composer, “so I 
just paced it with the pizzicato Outline Figure.”
Back in Bag End, Bilbo, in a moment of paranoid tension, believes he’s lost his beloved magic ring. Shore drums obsessively 
through building phrases of the Hobbit Skip Beat ﬁgure, but the trinket is found, and all is well in the Shire. The Outline and 
T wo-Step ﬁgures bumptiously usher Frodo and 
Gandalf about town until the two reﬂect upon the 
Wizard’s return. “He’s looking at Frodo leaving and 
getting dreamy about it all, so you hear this bucolic 
setting—a slower version of the Shire,” says Shore.
4  –  VE RY O L D  F R I E N D S
Gandalf arrives at Bilbo’s doorstep. “Here’s the Shire 
theme without whistle,” points out the composer. 
“It makes it seem a little more nostalgic with just 
the strings, like an older version of what you heard 
earlier for Frodo. It’s a bit statelier—a little more 
elegant than with the whistle.” Once the action moves 
inside Bag End, Shore plays up both the humorous 
and enigmatic airs of this little hobbit and the quest 
he will soon set into motion. “It’s the expectation of 
the chord progressions, because you know you’re in 
a new place and you’re excited,” he explains. Of course, yet another kind of expectation is articulated in a passing glance at a rather 
familiar looking map adorned with a dragon. Shore smiles, “It’s just a little hint of mystery and intrigue.”
5  –  F L A M I N G  R E D  H A I R
Bilbo’s long expected party begins with diagetic music from Plan 9. “They’ve worked with Peter and Fran for years,” explains Shore. 
“They’re talented writers and had the right feel for it. It was nice that there was a diﬀerence between this music and what I was 
composing.”
6  –  FAR EWE L L  D E AR  BI L B O
In the midst of the excitement, Bilbo and Frodo share a thoughtful moment and an unspoken farewell while Shore introduces the 
ﬁrst tender chords of the Shire theme’s Hymn Setting and hints of A Hobbit’s Understanding.
Enter Meriadoc Brandybuck and Peregrin “Pippin” T ook, the Shire’s resident pair of youthful rapscallions. Shore tosses the 
hobbits’ characteristic open fourth and ﬁfth intervals (derived from the Skip Beat and Outline Figure) around the orchestra’s 
strings and winds. “I wanted to make it hobbity—but orchestrally hobbity!—so it didn’t overpower, but added excitement,” Shore 
describes. The phrases playfully pick up speed as an unexpected display of pyrotechnics disrupts Bilbo’s soirée.
3

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
7  –  K E E P  I T  SE C R ET, K E E P  I T  S AF E
After stammering his way through a birthday speech Bilbo dons the Ring, and Shore responds with a ﬂuid ripple of open fourths 
and ﬁfths in the woodwinds and celesta—a dark take on the hobbit’s playfulness. Bilbo returns to Bag End, ready to make his way 
out of town when Gandalf intercepts him, questioning his intentions toward the Ring. As the Ring attempts to sway Bilbo, the 
chorus hums its parts, exerting an inﬂuence over the simple hobbit, but unable to articulate the seductive message. The aged hob-
~~~

~~~
of the Fellowship theme in the cor anglais and violins, incorporating a few concluding strands of the Lothlórien melody. A female 
chorus sings “Namárië,” Quenya for “Farewell,” as Galadriel looks upon the eight one last time. Steeled to their task, whatever it 
may entail, the Fellowship earns one last collection of heroic variations on their melody.
Abruptly, the thrashing Five Beat Pattern returns: the Orcs have picked up the Fellowship’s trail. Horns, trombones and tuba 
etch the Isengard theme deeper and deeper into the score, which once again pushes the tempo forward to reﬂect the Orcs’ rabid 
determination.
While the Fellowship stops along the coast for the night’s rest, Ara-
gorn reveals that Gollum has been discretely following their trail for 
some time. T ellingly, Shore hides grizzled tufts of Gollum’s Pity theme 
in a bassoon line that swims through string chords. The Shire’s Pen-
sive setting is read by solo clarinet as Sam and Frodo share a moment, 
but it’s interrupted by a series of surprisingly insecure developments 
on the Fellowship theme. Has the troupe lost its resolve? Where is the 
brassy heroism displayed in Moria? “They’ve lost one member and are 
feeling very apprehensive about the road ahead,” explains Shore. 
UNUSED CONCEPT: 
Music was written and recorded for the Theatri-
cal edit of the gift giving scene. Although this 
shorter Theatrical version was released on the 
2001 original soundtrack CD, the longer DVD 
version was actually composed earlier. When the 
===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
Aragorn leaps in a vain attempt to save Boromir, but though he defeats Lurtz, the Orcs’ serving captain, Boromir is beyond his 
reach. An older version of Aragorn’s Heroic theme appears here, similar to the melody used at W eathertop. It’s a harsh musical 
judgment, but an apt one: despite his eﬀorts, Aragorn fails to save Boromir and thus moves a step back from the hero he must 
eventually become.
7  –  T H E  ROAD  G O E S  EVE R  O N… P T. 1
Gimli, Legolas and Aragorn are silenced by the carnage around them while Frodo, overwhelmed, stands frozen at the bank of the 
river, pondering his fate. A deﬂated Fellowship theme meets the group’s uncertainty with subdued tones. T ears stream down Fro-
do’s face, but in his mind he hears Gandalf ’s sage words and resolves to continue the quest. This turning point earns the emotional 
peak of the Shire themes, as the Hymn chords begin and a profound setting of the Hobbit’s Understanding soars above. The in-
nate goodness of hobbits prevails, and Samwise appears, trudging his way through the water to reach his friend. Shore allows the 
score a momentary dalliance with counterpoint to underline the moment. “The counterpoint seemed right for the complexity.  
I didn’t use it too much in the ﬁlm. It’s a little modern and quite diﬀerent than anything else you’ve heard up until this point.” 
Frodo pulls Sam into the boat—the two friends will take this journey together. Again the Hymn chords and the Understanding 
melody sing out, but with yet another old friend: the whistle.  “The whistle works well because it doesn’t overdo it. It’s so simple 
but has all the emotion.”
After committing Boromir’s body to the Falls of Rauros, Aragorn, Gimli and Legolas determine to track Merry and Pippin’s cap-
tors, and the score summons one last muscular statement of the Fellowship theme, still weakened, still partial, but undefeated. 
It is, after all, a dark time for the Fellowship. T wo members have perished, two have been captured and two have set out on their 
own. But the three hunters will not be deterred. Despite the Fellowship’s painful losses, they will see their quest through.
On the opposite shore, another Hobbit’s Understanding variation meets Frodo and Sam with a renewed determination and a 
willingness to accept what fate insists. Shire variations trail away into the darkness, and the stage is set for the adventures of  
The T wo T owers.
8  –  M AY I T  BE 
Composed & performed by Enya
The Fellowship of the Ring’s end credits begin with Enya’s composition, “May It Be,” wherein the broken Fellowship is oﬀered a 
blessing and a faint glimpse of hope: “ A promise lives within you now.” 
9  –  T H E  ROAD  G O E S  EVE R  O N… P T. 2 
Featuring “In Dreams” performed by Edward Ross
“In Dreams” presents Fellowship’s last development of the Shire theme’s Hymn setting. Here, in the ﬁnal segment of the ﬁlm’s end 
credits, the song sits nestled between the endearing remains of the Fellowship theme which, with a splash of cymbals, ends  
The Lord of the Rings’ ﬁrst ﬁlm.
14

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
TEXTS
Choral lyrics in The Lord of the Rings ﬁlms reference the past histories and broader concepts of T olkien’s universe. Several passages 
directly quote the author’s writing, though the majority of the verses are original, scribed by Philippa Boyens, Fran W alsh, David 
Salo and, for Enya’s work, Roma Ryan. Shore often uses the texts in a nonlinear fashion, much as one would ﬁnd in modern 
opera. V erses are often begun mid-stanza and certain syllables are repeated to create a beautiful vocal mosaic of the languages of 
Middle-earth. At other times, the writing is presented unaltered with full verses acting as counterpoint to the immediate action. 
Seen here is the text in its original complete format, just as it was presented to Howard Shore before he set it to music.
Believe and you will ﬁnd your way 
Mornie alantië (Darkness has fallen) 
A promise lives within you now
A promise lives within you now
IN DREAMS
W ords and Music by FranW alsh, Howard Shore
FIRST HEARD: DISC THREE | TRACK NINE
When the cold of winter comes 
Starless night will cover day 
In the veiling of the sun 
W e will walk in bitter rain
But in dreams 
I still hear your name 
And in dreams 
W e will meet again
When the seas and mountains fall 
And we come, to end of days 
In the dark I hear a call 
Calling me there 
I will go there 
And back again.
23

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
~~~

~~~
## §46 THE TIN WHISTLE — and a warning that is this project's own

This matters because `bardFlute` and `bardWind` are whistle-family samples.

> *"These alterations and embellishments are created mainly through the use of
> special fingered articulations (cuts and strikes) and inflections (slides),
> not through the addition of extra, ornamental notes."*

> *"when playing two notes of the same pitch in succession, these pipers had to
> use a fingered articulation to establish the beginning of such a repeated
> note."*

> *"Cuts and strikes cannot exist without their parent notes. You cannot play
> just a cut or just a strike, because they are not notes."*
> *"We hear well-played cuts and strikes as having no duration."*
> *"In most other books, the cut and strike have been presented and notated as
> grace notes, and this is where so much confusion arises."*
> — Grey Larsen

**On a whistle, a repeated note is re-articulated with a FINGER, not the
tongue** — a cut (brief higher pitch) or a strike (brief lower). It has **zero
duration and falls exactly on the beat**: in this program that is a sub-step
transient on the parent note's own step, never its own grid step.

Larsen's broader warning is the same sentence the owner wrote, from inside the
tradition: treating these as classical grace notes *"is where so much confusion
arises."*

**And the recorder cannot do dynamics at all**, because breath pressure controls
pitch and loudness together: *"changes in breath pressure produce not only
changes in volume but also gross distortions in pitch"*, so *"dynamic variation
is a means of musical expression that is largely inappropriate and unsatisfactory
on the recorder."* Expression goes into timing and articulation instead — the
exact opposite of a velocity curve.

## §47 THE TWO RULES THAT WOULD CHANGE THE MOST FOR THE LEAST CODE

The researcher's own ranking, and it matches what this program needs:

1. **A `reattack` boolean per note** — retires the reverb workaround entirely.
2. **Chords dealt out across voices instead of struck as blocks** — plus §4's
   voicing rules to decide who gets what.
3. **The cheapest credible breath model**: one sixteenth rest every 2–4 bars on
   any wind figure, budgeted rather than capped.
=== TRAVELLING PERC HEAD ===
# Travelling percussion — the frame drum, the walking pace, and the folk part that is not a loop

*Researched 2026-08-13. Opened because hobbit synth — "the moody music that plays
when the party is adventuring above ground from dungeon to town", 102–124 bpm —
plays a drum kit inherited whole from dungeon synth, a genre that runs 52–78 bpm
and whose own research asks for "one timpani hit on beat 1 of each bar" and
"dinosaurs steadily marching on"
[`docs/genre-research/raw/ds-research-2026-08-06.json`]. The kit is literally
named `kitNames.dungeon = "war drums and kettles"`. The genre's default rig is
labelled `shire: "the shire — flute, plucked strings, frame drum"` and **there is
no frame drum anywhere in the program.***

*This sheet is the answer to the gap `drum-sectional-arc.md` §5 named and refused
to fill:*

> *"No source gives a martial pattern with bar positions for THIS genre… The
> sources above are pop, rock and dance. Nothing here was found for
> medieval-style drone percussion or for chip music, and the drum arc for those
> two genres should not be inferred from a house tutorial."*

---

## §0 How this sheet was made, and how much to trust it

**Sixteen searches, twenty-two pages fetched, four PDFs downloaded and text- or
image-extracted.** Every quotation below comes from a page or a file **fetched in
this session**, per the rule `drum-sectional-arc.md` §7 imposed after that sheet's
audit found a 22% bad-quote rate: *"A quotation goes in only from a page that was
fetched in the same session it is written down."* Nothing here is quoted from a
search-result summary. Where a search summary was the only witness, the claim is
in §10 instead.

**Two of the strongest sources are PDFs whose content the fetcher could not
read**, and both were recovered locally rather than paraphrased:

- **Michael Ballard, *Bodhrán 101*** — the rhythm patterns are printed in
  **Wingdings 3 arrow glyphs**, which come out of text extraction as nothing at
  all. The page was rendered at 6× and read as an image, then the glyph codes
  were pulled out of the content stream and matched against the rendered
  legend, so every symbol below is confirmed twice. This is the only source
  found in the whole search that gives **stroke-by-stroke bodhrán patterns for
  every Irish tune type**. It is the spine of §3.
- **Doug Adams, *The Annotated Score* (Fellowship)** — 29 pages, extracted with
  `pypdf`. `raw/lotr-score-study.md` already logged this file as prose-only with
  no notation, and that finding stands. What that earlier pass did **not**
  extract is the instrument entry for the bodhrán and the sentence about what
  happens to the Celtic instruments once the hobbits leave the Shire, which is
  the single most on-brief sentence found anywhere in this research. §8.

**What this sheet is weak on, said up front.** There is no orchestral percussion
source here of the standing that Rimsky-Korsakov has elsewhere in this repo; the
processional material is military-band and pipe-band pedagogy plus one
peer-reviewed gait study, and the frame-drum material is instrument tutors. That
is the right register for the question — *what does the drum actually play* — but
it is tuition and reference, not scholarship, and §10 is long on purpose.

**Bar-position convention, used everywhere below.**

| meter | grid | slots |
|---|---|---|
~~~

~~~
/tmp/claude-0/-home-user-DeckardsMusicBox/a327f200-138e-4f26-b707-e70f84d748fe/scratchpad/:
total 20
drwx------ 2 root root 4096 Aug 10 13:08 .
drwx------ 3 root root 4096 Aug 10 12:55 ..
-rw-r--r-- 1 root root 1172 Aug 10 13:08 ost.js
-rw-r--r-- 1 root root 1077 Aug 10 13:08 ost2.js
-rw-r--r-- 1 root root  664 Aug 10 13:08 roles.js

/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/:
total 219192
drwx------ 40 root root    28672 Aug 13 02:16 .
drwx------  4 root root     4096 Aug  9 19:47 ..
-rw-r--r--  1 root root     1524 Aug 11 02:30 BlackRider.abc
-rw-r--r--  1 root root      279 Aug 11 02:30 EowynsTheme.abc
-rw-r--r--  1 root root      410 Aug 11 02:30 ForthEorlingas.abc
-rw-r--r--  1 root root      397 Aug 11 02:30 FoundationsofStone.abc
-rw-r--r--  1 root root      772 Aug 11 02:30 GollumsSong.abc
-rw-r--r--  1 root root      381 Aug 11 02:30 KingoftheGoldenHall.abc
-rw-r--r--  1 root root      372 Aug 11 02:30 PippinsSongfromTheStewardofGondor.abc
-rw-r--r--  1 root root      477 Aug 11 02:30 RingGoesSouth.abc
drwxr-xr-x  2 root root     4096 Aug 11 02:39 abc
-rw-r--r--  1 root root    16951 Aug 10 19:23 abc1.html
-rw-r--r--  1 root root     1046 Aug 11 02:06 abc_ConcerningHobbitsFullVersion.abc
-rw-r--r--  1 root root      477 Aug 11 02:06 abc_RingGoesSouth.abc
-rw-r--r--  1 root root      203 Aug 11 02:06 abc_Rohan.abc
-rw-r--r--  1 root root      237 Aug 11 02:06 abc_Shire.abc
-rw-r--r--  1 root root    40165 Aug 13 02:01 abl.html
-rw-r--r--  1 root root    82342 Aug 13 01:55 adams2.txt
-rw-r--r--  1 root root    81409 Aug 10 20:10 adams_fotr.txt
-rw-r--r--  1 root root   989994 Aug 12 21:05 adler.txt
-rw-r--r--  1 root root   109768 Aug 11 12:17 aea.html
-rw-r--r--  1 root root     3332 Aug 11 12:17 aea.txt
-rw-r--r--  1 root root  7056044 Aug 12 13:36 after.wav
-rw-r--r--  1 root root  1764044 Aug 12 13:37 after10.wav
-rw-r--r--  1 root root  1764044 Aug 12 13:16 after2.wav
-rw-r--r--  1 root root    87175 Aug 11 12:22 aja.html
-rw-r--r--  1 root root     3599 Aug 11 12:22 aja.txt
-rw-r--r--  1 root root   133723 Aug 10 20:08 alberich.txt
-rw-r--r--  1 root root     5611 Aug 10 19:35 alc.html
-rw-r--r--  1 root root      110 Aug 10 19:36 alc.pdf
---
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/iseng.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/young_thesis.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/pk.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/ttt_annotated_score.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/fr.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/src/mahler.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/rgs.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/fotr_full.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/rotk_annotated_score.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/fotr_annotated_score_2.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/lh.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/rotk_complete_transcription.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/digitar.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/ttt_complete_transcription.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/dafx20.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/unsw/Wolfe_AT2018.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/dafx2012.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/bertsch.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/anc/ziol.pdf
/tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/anc/deskford.pdf
--- adams sections in travelling ---
43:- **Doug Adams, *The Annotated Score* (Fellowship)** — 29 pages, extracted with
48:  the single most on-brief sentence found anywhere in this research. §8.
588:### 5.4 The figures Adams names — and they are rhythmic, not melodic
609:this. What Adams adds here is that the figure is what **travels**, and what gets
620:zero hits. Wikipedia attributes the motif taxonomy to Adams' printed book, which
713:Adams names an "**End Cap**" figure in the Shire material [corpus:adams, cue 2].
718:The identification of Adams' End Cap with the march stinger is mine. `[CHOSEN]`
749:## §8 WHAT NOBODY GIVES
800:- **No LOTR percussion figure with bar positions, for any cue.** Adams names the
864:- **[Doug Adams — *The Annotated Score*, The Fellowship of the Ring (PDF)](https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf)** *(bodhrán in the Shire assortment; the Hobbiton instrument entries; Celtic sounds at the edges of the orchestra as the hobbits depart; Two-Step, End Cap, Skip Beat, Outline; performer credits)* — **prose only, no notation, as `raw/lotr-score-study.md` already recorded**
~~~

~~~
=========== PDF PAGE 35 ===========
25 
 
 
CHAPTER III 
 
Scoring Tolkien’s Novels 
 
By the time Howard Shore was finished composing the score for The Lord of the Rings, he had 
written almost ten hours of nearly continuous music to accompany the film.56 Shore composed 
themes for nearly every character presented in the movie, in addition to multiple themes for some 
of the lands, themes for nature, and themes for the ring of power. Several of the motives for The 
Lord of the Rings are thematically related, connecting various characters to each other as well as 
providing for a more fluid film score. While the thematic relationships between the motives of 
this score provide an interesting topic, this discussion will focus mostly on how the motives were 
derived from Tolkien’s novel. In particular, I will investigate how Shore’s music is connected to 
the text through threads such as instrumentation, musical style, poetry, and thematic relationships 
which are supported by cultural ties established in Tolkien’s writings. I will also discuss the 
music that is sung by the characters in the film, and relate the styles of those songs to the styles 
suggested by Tolkien’s text. Through this study, I will demonstrate that Shore’s score not only 
accompanies the on-screen action of the film, but that it also serves as a medium through which 
information pertinent to character development within the film is passed on to the audience. 
 
The Shire Themes and Hobbit Songs 
Shore composed one main theme for the Shire (Example 3-1), which he varied throughout the 
movie either by altering its voicing or instrumentation, or by altering the melody and style of the 
theme while maintaining the same basic feel. One alteration Shore used involved having a flute 
carry the violin melody line of the theme (Example 3-2). This alteration debuts the first time we 
                                                
56 <www.lordoftherings.net> lists the lengths of the extended edition DVDs as: 
The Fellowship of the Ring: 208 min; The Two Towers: 223 min; The Return of the King: 250 min. 

=========== PDF PAGE 37 ===========
27 
 
 
 
      Example 3-3: Shire Fiddle, The Fellowship of the Ring, Part 1, 0:09:28 
 
 
Even with the slight variations between each theme, ties to Tolkien’s text can be made for 
each. For starters, the main melodic instruments of the Shire themes (violin, fiddle, and flute) are 
all instruments correlated with Hobbits in Tolkien’s novels. The style of the music is generally 
similar to Irish Celtic music, which developed in the rural areas of Ireland. Similarities between 
the Shire music and Celtic music are found through instrumentation57 of the themes, and the 
ornamentation of the melody line. The rural nature of Celtic music is consistent with the rural, 
peasant nature of Hobbits described by Tolkien. There appears to be another connection to the 
descriptions of Hobbit music in the novel, in that the Shire Fiddle theme bears a striking 
similarity to Frodo’s poem about the “Ostler’s cat that plays a five-string fiddle” first “squeaking 
high, then purring low.”58 Not only does Shore’s theme feature a solo fiddle filled with 
“squeaky” grace notes, but the contour of the melody line moves from high to low. The fiddle 
theme accompanying the description of Hobbit life in the Shire parallels the events of the text, as 
Frodo was singing a song about his home while he was in the village Bree. 
 
Further connections between the text and the film score can be found when we hear the 
Hobbit characters sing. The Hobbits sing twice within The Fellowship of the Ring: Bilbo and 
                                                
57 Fiddles and Flutes are common in Celtic music. Shore also uses the Bodhrán, the principal Irish percussion 
instrument, in the Shire themes. 
58 Tolkien, 158. 

=========== PDF PAGE 38 ===========
28 
 
 
Gandalf sing a traveling song (Example 3-4), and Merry and Pippin sing a drinking song 
(Example 3-5). Both of these examples echo what we would predict Hobbit music to sound like 
based on the novel’s description. The songs are rhythmically simple, have easy, diatonic 
melodies and harmonies, and represent the folk-song nature suggested by Tolkien’s “rustic” 
description of Hobbit tunes.59 Both of the melodies are settings of actual poems found within 
Tolkien’s novel, furthering the connection between the score and the text.  
 
Example 3-4: Traveling Song, The Fellowship of the Ring, Part 1, 0:10:52 
 
                                                
59 Tolkien, 807. 

=========== PDF PAGE 39 ===========
29 
 
 
 
(Example 3-4 Continued) 
 
 
Example 3-5: Drinking Song, The Fellowship of the Ring, Part 1, 0:34:48 
 
 
The Music of Men 
 
Shore composed two main themes for the world of men, one for the realm of Gondor, and one 
for the realm of Rohan. The Gondor theme is first introduced during the Council of Elrond in 
The Fellowship of the Ring, while Aragorn and Boromir (the two main characters from Gondor) 
are arguing over the fate of the ring (Example 3-6). The theme is a simple, expansive melody 
played by a single French horn. The use of the French horn is likely a reflection of the Horn of
~~~

~~~
that moves between all the characters.” As The T wo 
T owers will illustrate, however, Gandalf the White is 
a very diﬀerent character.
Bilbo decides to leave the Ring behind as Shore 
mixes a few last dissolving ﬂute wisps of the Pity of 
Gollum into the Shire material. The hobbit departs, 
and leaves the Ring under Gandalf ’s watchful eye. 
Here Shore features the ﬁrst bit of Mordor music 
heard in the Shire: Bilbo relinquishes his precious Ring, dropping it to the ﬂoor while Mordor’s Descending Third Ostinato 
appears, announcing the terrifying quest Bilbo has just set in motion. “Y ou heard a little of this earlier in the Prologue,” Shore re-
minds us, “so this is just a bit to hint at the power of this object. What is this thing? This little bit of darkness helps you remember 
the beginning of the ﬁlm.” Bilbo sets out on the road, and the gentle Shire theme wins out. “It’s just in the strings with very little 
harmony. Just a little touch of this melody just as he leaves—the two old friends parting.”
Still in Bag End, Gandalf ’s thoughts are ensnared by the Ring, but, perhaps prophetically, Frodo Baggins enters and breaks its 
grasp on the Wizard’s mind. Gandalf gives the hobbit the Ring, still shaken, contemplating what secrets this tiny bauble may hide. 
“Now that Frodo’s taken the Ring you hear the History of the Ring theme. He’s physically touched it and is holding it in his hand, 
so it’s passed from Bilbo to Frodo,” Shore explains. The ethereal tune soon makes way for even more threatening writing.
The score darkens with bassoon picking up a ﬁve note portion of Gollum’s Pity theme as Gandalf sets out to ﬁnd the creature. 
These fragments are interrupted by the rhaita’s ﬁrst appearance: The Sauron/Evil of the Ring theme is introduced as Minas 
Morgul disgorges nine riders in black. The mixed chorus heard in the Prologue returns as well, their sacrilegious tone intact. “The 
singing is in Adûnaic for the Wraiths. It’s the ancient speech of men because they were corrupted kings.”
Back in the Shire a more common language and a more cheerful tone prevails. Merry and Pippin, thoroughly enjoying an evening 
at the Green Dragon (as well as the ﬁnest liquid refreshment the establishment can oﬀer) sing Fran W alsh’s boisterous tune, the 
“Drinking Song.”
8  –  A CO N SPI R AC Y UN M ASK E D
After a clear rendition of the Shire music bids the hobbits goodnight, Shore turns to a shadowy bit of writing that includes some 
of the score’s most unusual orchestrations. Alto ﬂute creates a smoky air of mystery while a rubbed tam-tam and eight timpani 
(two players) spike the impending danger as Gandalf reveals the true nature of Bilbo’s favorite trinket.
Gollum’s Pity theme makes a particularly chilling entrance here under a lingering shot of Frodo awaiting Gandalf ’s reassurance 
that no one knows of the One Ring’s Shire residence. The gnarled line reminds us, distressingly, that no such reassurance is forth-
coming. The Threat of Mordor motive projects the dread that Wizard and hobbit feel.
4

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
9  –  T H R E E  I S  CO M PA N Y
The bass drum strokes underpinning the ﬁrst appearance of the Seduction of the Ring each coincide with a shot of Frodo’s vest 
pocket, boring a palpable sense of danger into an otherwise innocuous image. These echoing impacts—marked in Shore’s score as 
“low, distant disturbance”—underpin the ﬁrst hummed setting of the Seduction of the Ring. (Here again, the One Ring struggles 
to articulate its seductive message to the less corruptible hobbits.)
After the ﬁrst use of the Journey There, Shore presents material from two of the story’s most signiﬁcant themes. Reluctantly, Sam 
steps through a Shire cornﬁeld and remarks that he’s never before been this far away from his home. “Y ou’re hearing a little bit of 
the piece from the end,” remarks the composer. “It’s the Hymn Setting, or ‘In Dreams,’ and it’s the ﬁrst time you hear it.” Immedi-
ately following, Shore’s music suggests that the Fellowship of the Ring has begun to form. Cor anglais and French horn announce 
a brave, but humble take on the material. “This is the ﬁrst time you hear it because it’s the two of them setting out together,” the 
essence of Fellowship.
1 0  –  T H E  PAS S I N G  O F  T H E  E LVE S
Plan 9 assembled “The Elvish Lament” for the W ood-elves whom Frodo and Sam spy departing Middle-earth. This text is 
adapted from J.R.R. T olkien.
1 1  –  S ARUM A N  T H E  WH I T E
Here again, Shore presents bits of the still-forming Fellowship theme. “When Gandalf rides we hear a dark take on the Fellowship 
theme—he’s oﬀ on his own now. The hobbits have the cozy Fellowship, but he has this darkness because he’s going into Isengard, 
and he knows there’s serious business ahead.” 
Gandalf is met at the feet of Orthanc by a most undesir-
able host—the Threat of Mordor motive. Saruman has 
fallen under the shadow of Mordor. The orchestra sinks 
into its depths, painting the revelation in the duskiest 
instrumental tones available.
Saruman attacks Gandalf and the mixed chorus erupts 
with a portentous choral line. “It’s Black Speech,” Shore
~~~

~~~
total 1544
drwxr-xr-x 3 root root   4096 Aug 13 02:10 .
drwxr-xr-x 5 root root   4096 Aug 10 18:01 ..
-rw-r--r-- 1 root root 101451 Aug 10 12:29 NOTES-FROM-THE-USER.md
-rw-r--r-- 1 root root  47469 Aug 10 12:26 acid.md
-rw-r--r-- 1 root root   6352 Aug 10 12:25 aquatic-ambience-measured.md
-rw-r--r-- 1 root root   7099 Aug 10 12:25 autechre.md
-rw-r--r-- 1 root root  17378 Aug 10 12:22 barberpole.md
-rw-r--r-- 1 root root   8620 Aug 10 12:29 bass-roles.md
-rw-r--r-- 1 root root   3704 Aug  9 19:48 bass-unit-face.md
-rw-r--r-- 1 root root  14599 Aug 10 12:25 bass.md
-rw-r--r-- 1 root root   4291 Aug 10 12:22 bladerunner-form.md
-rw-r--r-- 1 root root  42988 Aug 10 12:26 bladerunner.md
-rw-r--r-- 1 root root  34984 Aug 10 12:26 breaking-the-rule.md
-rw-r--r-- 1 root root  15620 Aug 10 12:27 bus-compressor.md
-rw-r--r-- 1 root root   7200 Aug 10 12:29 call-and-response.md
-rw-r--r-- 1 root root  13907 Aug 10 12:25 channel-sends.md
-rw-r--r-- 1 root root  16625 Aug 10 12:24 chord-quality.md
-rw-r--r-- 1 root root  10382 Aug 10 12:25 chrono-trigger.md
-rw-r--r-- 1 root root  13658 Aug 10 12:29 comp-register.md
-rw-r--r-- 1 root root  10841 Aug 10 12:25 counterpoint-measured.md
-rw-r--r-- 1 root root  12575 Aug 10 12:25 counterpoint.md
-rw-r--r-- 1 root root   6994 Aug 10 12:27 cs80-ribbon.md
-rw-r--r-- 1 root root  16245 Aug 10 12:26 cs80-verified.md
-rw-r--r-- 1 root root  51774 Aug 10 12:27 dkc.md
-rw-r--r-- 1 root root  18861 Aug 10 12:29 drum-engine.md
-rw-r--r-- 1 root root  24766 Aug 10 12:29 drum-sectional-arc.md
-rw-r--r-- 1 root root  18065 Aug 10 12:26 dungeon-synth-arrangement.md
-rw-r--r-- 1 root root  16463 Aug 10 17:34 dungeon-synth-fx-and-balance.md
-rw-r--r-- 1 root root  12205 Aug 10 18:00 dungeon-synth-score-and-drums.md
-rw-r--r-- 1 root root  26468 Aug 10 17:39 dungeon-synth-technique.md
-rw-r--r-- 1 root root  17717 Aug 10 12:22 dungeon-synth.md
-rw-r--r-- 1 root root   6645 Aug 10 12:25 fx-units.md
-rw-r--r-- 1 root root   6504 Aug 10 12:29 jungle-bass.md
-rw-r--r-- 1 root root   3382 Aug 10 12:22 jungle-form.md
-rw-r--r-- 1 root root   9073 Aug 10 12:25 jungle-harmony.md
-rw-r--r-- 1 root root  47209 Aug 10 12:27 jungle.md
-rw-r--r-- 1 root root   8790 Aug 10 12:29 key-shift.md
-rw-r--r-- 1 root root  10845 Aug 10 12:24 legato.md
-rw-r--r-- 1 root root  20048 Aug 10 12:25 lofi-comp-and-lead.md
-rw-r--r-- 1 root root   6685 Aug 10 12:25 lofi-form.md
-rw-r--r-- 1 root root  18715 Aug 10 12:22 lofi-harmony.md
-rw-r--r-- 1 root root  23476 Aug 10 12:26 lofi-noise.md
-rw-r--r-- 1 root root  30881 Aug 10 12:25 lofi-production.md
-rw-r--r-- 1 root root  52954 Aug 10 12:27 lofi.md
-rw-r--r-- 1 root root   9038 Aug 11 03:46 lotr-themes-measured.md
-rw-r--r-- 1 root root  31585 Aug  7 13:07 matrix-mixer.md
-rw-r--r-- 1 root root  37923 Aug 13 02:10 metre.md
-rw-r--r-- 1 root root  36755 Aug 10 12:25 minimal.md
-rw-r--r-- 1 root root  10821 Aug 10 12:25 mixing-desk.md
-rw-r--r-- 1 root root  12962 Aug 10 12:27 parameter-locks.md
-rw-r--r-- 1 root root   7184 Aug 10 12:29 phasing.md
-rw-r--r-- 1 root root   5804 Aug  7 13:07 plastikman-minimal.md
-rw-r--r-- 1 root root  24471 Aug 10 14:48 prog-techno.md
drwxr-xr-x 2 root root   4096 Aug 10 22:13 raw
-rw-r--r-- 1 root root  11458 Aug  9 19:48 reason-rack.md
-rw-r--r-- 1 root root  12318 Aug 10 12:25 rhythm-phrasing.md
-rw-r--r-- 1 root root   8042 Aug 10 12:27 sax-engine.md
-rw-r--r-- 1 root root   5932 Aug  7 13:07 sax-material.md
-rw-r--r-- 1 root root   9360 Aug 10 12:27 sax-playing.md
-rw-r--r-- 1 root root   4923 Aug 10 12:22 sax-sources.md
-rw-r--r-- 1 root root 103299 Aug 11 18:30 score-craft.md
-rw-r--r-- 1 root root   5013 Aug 10 12:25 spring-reverb.md
-rw-r--r-- 1 root root   9105 Aug 10 12:29 static-harmony-and-evolution.md
-rw-r--r-- 1 root root   3955 Aug  7 13:07 stereo.md
-rw-r--r-- 1 root root   4418 Aug 10 12:25 synthwave-form.md
-rw-r--r-- 1 root root  48279 Aug 10 12:27 synthwave.md
-rw-r--r-- 1 root root  13551 Aug 10 12:24 techno-and-minimal-2026-08-09.md
-rw-r--r-- 1 root root  14240 Aug 10 12:25 techno-what-kind-of-object.md
-rw-r--r-- 1 root root  18342 Aug 10 12:25 the-arrival-of-a-dissonance.md
-rw-r--r-- 1 root root   7002 Aug 10 12:29 the-hand-on-the-roll.md
-rw-r--r-- 1 root root  10085 Aug 10 12:22 the-note-that-does-not-belong.md
-rw-r--r-- 1 root root   8544 Aug 10 12:25 the-part-that-answers.md
-rw-r--r-- 1 root root  12890 Aug 10 12:25 the-rhodes.md
-rw-r--r-- 1 root root  13585 Aug 10 12:29 the-second-keyboard.md
-rw-r--r-- 1 root root  46212 Aug 13 02:10 travelling-percussion.md
-rw-r--r-- 1 root root  11375 Aug 10 12:25 variation.md
-rw-r--r-- 1 root root   6386 Aug 10 12:25 vgm-restrictions.md
-rw-r--r-- 1 root root   7849 Aug 10 12:25 wurlitzer-tremolo.md
---
Deckards Orchestrator MK2.html
Improv Machine playable_BETA 0.1.html
README.md
corpus
docs
harness
node_modules
package-lock.json
package.json
samples
~~~

~~~
-rw-r--r-- 1 root root    82342 Aug 13 01:55 adams2.txt
-rw-r--r-- 1 root root    81409 Aug 10 20:10 adams_fotr.txt
-rw-r--r-- 1 root root   989994 Aug 12 21:05 adler.txt
-rw-r--r-- 1 root root     3332 Aug 11 12:17 aea.txt
-rw-r--r-- 1 root root     3599 Aug 11 12:22 aja.txt
-rw-r--r-- 1 root root   133723 Aug 10 20:08 alberich.txt
-rw-r--r-- 1 root root      110 Aug 10 19:36 alc.pdf
-rw-r--r-- 1 root root    54667 Aug 11 02:39 all_tunes.txt
-rw-r--r-- 1 root root  1134830 Aug 10 19:32 annot2.pdf
-rw-r--r-- 1 root root    32339 Aug 11 12:17 ar3.txt
-rw-r--r-- 1 root root    73106 Aug 11 12:18 ar4.txt
-rw-r--r-- 1 root root     6610 Aug 11 12:18 arnews.txt
-rw-r--r-- 1 root root   719550 Aug 12 20:50 atreatiseuponmo00berlgoog.txt
-rw-r--r-- 1 root root   628528 Aug 11 17:56 atreatiseuponmo01berlgoog.txt
-rw-r--r-- 1 root root   662957 Aug 11 17:56 atreatiseuponmo02berlgoog.txt
-rw-r--r-- 1 root root   707150 Aug 12 21:00 avanzini.pdf
-rw-r--r-- 1 root root    56039 Aug 12 21:00 avanzini.txt
-rw-r--r-- 1 root root    20880 Aug 13 02:14 b4.txt
-rw-r--r-- 1 root root     8161 Aug 11 00:38 bank.report.txt
-rw-r--r-- 1 root root    19453 Aug 10 03:36 bat.txt
-rw-r--r-- 1 root root    19602 Aug 10 03:57 bat2.txt
-rw-r--r-- 1 root root    19455 Aug 10 12:31 bat3.txt
-rw-r--r-- 1 root root    21064 Aug 12 21:51 battery.txt
-rw-r--r-- 1 root root    20902 Aug 12 22:00 battery2.txt
-rw-r--r-- 1 root root    20365 Aug 12 22:07 battery3.txt
-rw-r--r-- 1 root root    37280 Aug 11 12:24 bcd.txt
-rw-r--r-- 1 root root   299966 Aug 12 20:50 belkin.pdf
-rw-r--r-- 1 root root    18652 Aug 12 20:50 belkin.txt
-rw-r--r-- 1 root root    65822 Aug 12 20:51 belkin2.pdf
-rw-r--r-- 1 root root    57534 Aug 12 20:51 belkin2.txt
-rw-r--r-- 1 root root   113519 Aug 10 19:52 belkin_raw.txt
-rw-r--r-- 1 root root    62036 Aug 10 19:52 belkin_txt.txt
-rw-r--r-- 1 root root    11844 Aug 11 18:03 berklee_pads.txt
-rw-r--r-- 1 root root   693491 Aug 11 17:51 berlioz.txt
-rw-r--r-- 1 root root   596747 Aug 11 17:48 berlioz_atreatiseonmode00berlgoog.txt
-rw-r--r-- 1 root root   628528 Aug 10 19:53 berlioz_atreatiseuponmo01berlgoog.txt
-rw-r--r-- 1 root root   637225 Aug 11 17:48 berlioz_treatiseonmodern00berl.txt
-rw-r--r-- 1 root root   336232 Aug 11 17:49 bertsch.pdf
-rw-r--r-- 1 root root    12176 Aug 11 17:49 bertsch.txt
-rw-r--r-- 1 root root   120063 Aug 10 20:13 bgsu.txt
-rw-r--r-- 1 root root     5607 Aug 11 17:51 blackart.txt
-rw-r--r-- 1 root root      215 Aug 11 17:52 blackart2.txt
-rw-r--r-- 1 root root    11947 Aug  9 20:39 blendshare-after.txt
-rw-r--r-- 1 root root    11799 Aug  9 19:55 blendshare-before.txt
-rw-r--r-- 1 root root    16578 Aug 13 01:57 bodhran101.txt
-rw-r--r-- 1 root root    34359 Aug 10 20:01 bolero.pdf
-rw-r--r-- 1 root root    32870 Aug 12 20:54 byu.pdf
-rw-r--r-- 1 root root   190627 Aug 10 20:20 ch_guitar.pdf
-rw-r--r-- 1 root root     5744 Aug 10 20:20 ch_piano.pdf
-rw-r--r-- 1 root root      220 Aug 12 21:03 cj.txt
-rw-r--r-- 1 root root   136804 Aug 13 01:56 clarke.txt
-rw-r--r-- 1 root root    15616 Aug 11 12:15 cobbin_mpg.txt
-rw-r--r-- 1 root root     2631 Aug 11 12:15 cobbin_rp.txt
-rw-r--r-- 1 root root        1 Aug 11 12:15 cobbin_waves.txt
-rw-r--r-- 1 root root  3419391 Aug 12 20:52 dafx20.pdf
-rw-r--r-- 1 root root    28093 Aug 12 20:52 dafx20.txt
-rw-r--r-- 1 root root   448575 Aug 12 20:49 dafx2012.pdf
-rw-r--r-- 1 root root    41913 Aug 12 20:49 dafx2012.txt
-rw-r--r-- 1 root root       60 Aug 11 12:21 dc.txt
-rw-r--r-- 1 root root   404773 Aug 11 19:16 digitar.pdf
=== sizes ===
fotr_annotated_score_2.pdf: 1134830
ttt_annotated_score.pdf: 315
rotk_annotated_score.pdf: 315
young_thesis.pdf: 4392571
fotr_full.pdf: 5933
ttt_complete_transcription.pdf: 5674
rotk_complete_transcription.pdf: 3739
~~~

~~~
=== staff 1 ===
x=   822.0 y=  279.8 w= 38 h= 38 a= 1217 -> ? (step -10.58)
x=   962.1 y=  245.7 w= 39 h= 36 a= 1210 -> ? (step -12.55)
x=  1102.8 y=  279.7 w= 38 h= 38 a= 1217 -> ? (step -10.59)
x=  1162.5 y=  297.9 w= 36 h= 29 a=  945 -> ? (step -9.54)
x=  1277.8 y=  312.8 w= 37 h= 31 a= 1032 -> ? (step -8.68)
x=  1391.4 y=  297.9 w= 34 h= 29 a=  899 -> ? (step -9.54)
x=  1722.9 y=  312.2 w= 39 h= 33 a= 1110 -> ? (step -8.71)
x=  1811.1 y=  279.9 w= 38 h= 38 a= 1218 -> ? (step -10.58)
x=  1923.9 y=  279.9 w= 38 h= 38 a= 1216 -> ? (step -10.58)
x=  1987.7 y=  245.7 w= 40 h= 36 a= 1221 -> ? (step -12.55)
x=  2370.7 y=  194.2 w= 34 h= 29 a=  899 -> ? (step -15.53)
x=  2455.9 y=  212.3 w= 41 h= 36 a= 1235 -> ? (step -14.48)
x=  2596.9 y=  245.6 w= 39 h= 36 a= 1193 -> ? (step -12.56)
x=  2729.5 y=  279.9 w= 37 h= 38 a= 1198 -> ? (step -10.58)
x=  2921.9 y=  261.9 w= 37 h= 29 a=  970 -> ? (step -11.62)
x=  2984.0 y=  279.9 w= 36 h= 38 a= 1173 -> ? (step -10.58)
x=  3045.5 y=  298.0 w= 34 h= 29 a=  902 -> ? (step -9.53)
x=  3240.3 y=  311.8 w= 38 h= 33 a= 1109 -> ? (step -8.74)
x=  3300.4 y=  297.9 w= 34 h= 29 a=  902 -> ? (step -9.54)
SEQ: ? C4 ? ? D5 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
=== staff 2 ===
x=   822.0 y=  279.8 w= 38 h= 38 a= 1217 -> ? (step -30.2)
x=   962.1 y=  245.7 w= 39 h= 36 a= 1210 -> ? (step -32.19)
x=  1102.8 y=  279.7 w= 38 h= 38 a= 1217 -> ? (step -30.2)
x=  1162.5 y=  297.9 w= 36 h= 29 a=  945 -> ? (step -29.15)
x=  1277.8 y=  312.8 w= 37 h= 31 a= 1032 -> ? (step -28.28)
x=  1391.4 y=  297.9 w= 34 h= 29 a=  899 -> ? (step -29.15)
x=  1722.9 y=  312.2 w= 39 h= 33 a= 1110 -> ? (step -28.31)
x=  1811.1 y=  279.9 w= 38 h= 38 a= 1218 -> ? (step -30.2)
x=  1923.9 y=  279.9 w= 38 h= 38 a= 1216 -> ? (step -30.2)
x=  1987.7 y=  245.7 w= 40 h= 36 a= 1221 -> ? (step -32.19)
x=  2370.7 y=  194.2 w= 34 h= 29 a=  899 -> ? (step -35.2)
x=  2455.9 y=  212.3 w= 41 h= 36 a= 1235 -> ? (step -34.14)
x=  2596.9 y=  245.6 w= 39 h= 36 a= 1193 -> ? (step -32.2)
x=  2729.5 y=  279.9 w= 37 h= 38 a= 1198 -> ? (step -30.2)
x=  2921.9 y=  261.9 w= 37 h= 29 a=  970 -> ? (step -31.25)
x=  2984.0 y=  279.9 w= 36 h= 38 a= 1173 -> ? (step -30.2)
x=  3045.5 y=  298.0 w= 34 h= 29 a=  902 -> ? (step -29.14)
x=  3240.3 y=  311.8 w= 38 h= 33 a= 1109 -> ? (step -28.33)
x=  3300.4 y=  297.9 w= 34 h= 29 a=  902 -> ? (step -29.15)
SEQ: ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
=== staff 3 ===
x=   822.0 y=  279.8 w= 38 h= 38 a= 1217 -> ? (step -48.13)
x=   962.1 y=  245.7 w= 39 h= 36 a= 1210 -> ? (step -50.12)
x=  1102.8 y=  279.7 w= 38 h= 38 a= 1217 -> ? (step -48.13)
x=  1162.5 y=  297.9 w= 36 h= 29 a=  945 -> ? (step -47.07)
x=  1277.8 y=  312.8 w= 37 h= 31 a= 1032 -> ? (step -46.2)
x=  1391.4 y=  297.9 w= 34 h= 29 a=  899 -> ? (step -47.07)
x=  1722.9 y=  312.2 w= 39 h= 33 a= 1110 -> ? (step -46.23)
x=  1811.1 y=  279.9 w= 38 h= 38 a= 1218 -> ? (step -48.13)
x=  1923.9 y=  279.9 w= 38 h= 38 a= 1216 -> ? (step -48.12)
x=  1987.7 y=  245.7 w= 40 h= 36 a= 1221 -> ? (step -50.12)
x=  2370.7 y=  194.2 w= 34 h= 29 a=  899 -> ? (step -53.13)
x=  2455.9 y=  212.3 w= 41 h= 36 a= 1235 -> ? (step -52.07)
x=  2596.9 y=  245.6 w= 39 h= 36 a= 1193 -> ? (step -50.13)
x=  2729.5 y=  279.9 w= 37 h= 38 a= 1198 -> ? (step -48.12)
x=  2921.9 y=  261.9 w= 37 h= 29 a=  970 -> ? (step -49.18)
x=  2984.0 y=  279.9 w= 36 h= 38 a= 1173 -> ? (step -48.12)
x=  3045.5 y=  298.0 w= 34 h= 29 a=  902 -> ? (step -47.07)
x=  3240.3 y=  311.8 w= 38 h= 33 a= 1109 -> ? (step -46.26)
x=  3300.4 y=  297.9 w= 34 h= 29 a=  902 -> ? (step -47.07)
SEQ: F3 ? ? F3 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
~~~

~~~
35:Shire.
37:The story moves forward to the waning years of the Third Age of Middle-earth as we are introduced to the Shire. The short piece 
38:of music that ushers us into the hobbits’ homeland was originally written for the theatrical cut of the ﬁlm, but the early Shire 
40:had the piece and I’d almost ﬁnished orchestrating it” , the composer recalls. “It didn’t have much of the full Shire theme in it yet, 
42:of the Shire in a montage. Now, you 
91:through building phrases of the Hobbit Skip Beat ﬁgure, but the trinket is found, and all is well in the Shire. The Outline and 
96:setting—a slower version of the Shire,” says Shore.
98:Gandalf arrives at Bilbo’s doorstep. “Here’s the Shire 
116:ﬁrst tender chords of the Shire theme’s Hymn Setting and hints of A Hobbit’s Understanding.
117:Enter Meriadoc Brandybuck and Peregrin “Pippin” T ook, the Shire’s resident pair of youthful rapscallions. Shore tosses the 
145:Gollum into the Shire material. The hobbit departs, 
148:heard in the Shire: Bilbo relinquishes his precious Ring, dropping it to the ﬂoor while Mordor’s Descending Third Ostinato 
151:the beginning of the ﬁlm.” Bilbo sets out on the road, and the gentle Shire theme wins out. “It’s just in the strings with very little 
161:Back in the Shire a more common language and a more cheerful tone prevails. Merry and Pippin, thoroughly enjoying an evening 
165:After a clear rendition of the Shire music bids the hobbits goodnight, Shore turns to a shadowy bit of writing that includes some 
169:that no one knows of the One Ring’s Shire residence. The gnarled line reminds us, distressingly, that no such reassurance is forth-
182:steps through a Shire cornﬁeld and remarks that he’s never before been this far away from his home. “Y ou’re hearing a little bit of 
346:The Hymn setting of the Shire theme returns, reuniting 
401:French horn statement of the Shire, Shore sets the Fellowship theme alight: “It’s all Fellowship in a slow setting, now a very heroic 
402:version!” The thematic progression illustrates that the hobbits are now members of the Fellowship ﬁrst and citizens of the Shire 
434:and I had the Shire and Fellowship themes, but these were the very 
448:ing variation on the Shire theme. This sequence, also part of the Cannes preview, marks the ﬁrst time Shore wove the Shire theme 
569:in a bassoon line that swims through string chords. The Shire’s Pen-
656:peak of the Shire themes, as the Hymn chords begin and a profound setting of the Hobbit’s Understanding soars above. The in-
668:willingness to accept what fate insists. Shire variations trail away into the darkness, and the stage is set for the adventures of  
676:“In Dreams” presents Fellowship’s last development of the Shire theme’s Hymn setting. Here, in the ﬁnal segment of the ﬁlm’s end 
1058:The Hobbit/Shire theme’s Rural Setting is most closely 
1060:as the hobbits depart the Shire and adventure their way 
1063:reminder of what the Shire folk have left behind.
1089:handful of musette lines to provide harmonic accompaniment to the Shire theme’s Rural Setting.
1093:not appear regularly in the Shire music, but a few gently strummed chords back the Bag End scenes.
1096:Guitar plays the same role in the Shire music as the mandolin, but it enters in more sprightly passages, using a highstring tuning.
~~~

~~~
18:## §0 HOW THIS WAS MADE, AND HOW MUCH TO TRUST IT
42:## §1 THE CENTRAL LAW: FOUR REAL PARTS AND A PILE OF DOUBLINGS
104:## §2 UNISON OR OCTAVE — AND THE CORPUS CONTRADICTS ITSELF
166:## §3 THE LOUDNESS TABLE, AND WHY THE MIX IS WRONG
228:## §4 SPACING — AND WHY IT DOES NOT BELONG IN THE GENRE TABLE
289:## §5 STACKING A MELODY — THE ORDER IS FIXED AND THE SETS ARE ENUMERATED
343:## §6 WHICH TIMBRES FUSE — **CORRECTED**
369:## §7 THE MELODY AND THE HARMONY MUST DIFFER IN COLOUR — **CORRECTED**
413:## §8 THE CRESCENDO — ENTRY ORDER, TWO SLOPES, AND THE MECHANISM
476:## §9 RE-ORCHESTRATION — RIMSKY-KORSAKOV'S FIVE OPERATIONS
520:## §10 TUTTI
547:## §11 ECONOMY — THE SCARCITY BUDGET
567:## §12 FOUR ESCALATIONS, WITH NUMBERS
628:## §13 THE CEILING ON "ADD MORE VOICES"
653:## §14 THE SHIRE THEME — AND THE CORRECTION THAT MATTERS
711:## §15 THE OTHER THEMES
793:## §16 CHROMATIC MEDIANTS — A LOOKUP TABLE
823:## §17 WHAT ACTUALLY SEPARATES FANTASY SYNTH FROM DUNGEON SYNTH
857:## §18 THE OVERWORLD, MEASURED
904:## §19 MODE AND AFFECT — AND THE RULE NOT TO ENCODE
934:## §20 THE WALKING TEMPO, SOURCED
947:## §21 THE PASTORAL AND THE HUNT — TOPIC THEORY WITH HARD CONSTRAINTS
974:## §22 WRITTEN TO BE HEARD A THOUSAND TIMES
999:## §23 THE SEAM MAP
1023:## §24 CONTRADICTIONS THE CORPUS NEVER RESOLVES
1046:## §25 NOT FOUND — DO NOT FILL THESE IN FROM MEMORY
1080:## §26 HOW TO GET THE NOTES — the two techniques that worked
1119:## §27 THE FINDING THAT CONTRADICTS EVERY GENRE IN THIS PROGRAM
1164:## §28 WHAT DOES MOVE A SEND — three sourced drivers
1194:## §29 DISTANCE IS A COUPLED BUNDLE, AND PRE-DELAY IS NOT SIZE
1216:## §30 THE FLOOR — dry is not neutral, it is dead
1233:## §31 HOW THE LORD OF THE RINGS WAS ACTUALLY RECORDED — and the space does NOT change
1300:## §32 WHAT THE DUNGEON-SYNTH ARTISTS SAY, IN THEIR OWN WORDS
1376:## §33 WHAT THIS PROGRAM DOES, MEASURED
1413:## §34 LEGATO IS ENVELOPE RETRIGGER SUPPRESSION
1448:## §35 THE PIANO MODEL IS RIGHT FOR PIANO AND WRONG FOR EVERYTHING ELSE
1472:## §36 WHAT EACH FAMILY ACTUALLY NEEDS
1511:## §37 WHAT A LEGATO SAMPLE PATCH ACTUALLY CONTAINS
1542:## §38 AND THE ECHO, SOURCED
1555:## §39 THE ALGORITHM, AND WHAT IS REACHABLE HERE
1594:## §40 LEGATO IS AN ONSET PROPERTY — the sentence that retires the echo
1613:## §41 BREATH IS A BUDGET THAT REFILLS, NOT A CEILING
1671:## §42 A WIND PLAYS ONE NOTE — so a chord is an ASSIGNMENT PROBLEM
1696:## §43 ARTICULATION SPEED, WITH ACTUAL NUMBERS
1717:## §44 REGISTER IS CHARACTER, AND EXPRESSION HAS A BAND
1745:## §45 THE FLUTE'S IDIOM IS INTERRUPTION — the direct answer to "like a piano"
1767:## §46 THE TIN WHISTLE — and a warning that is this project's own
1802:## §47 THE TWO RULES THAT WOULD CHANGE THE MOST FOR THE LEAST CODE
1830:## §48 THE SPLIT THE ENGINE IS MISSING, AND IT IS RIMSKY-KORSAKOV'S OWN
1843:## §49 A BOWED PLAYER HOLDS TWO NOTES — the hard number
1868:## §50 THE BOW HAS A CLOCK, AND IT IS DYNAMIC-DEPENDENT
1893:## §51 A SECTION HAS INFINITE SUSTAIN; A SOLOIST DOES NOT
1912:## §52 WHAT KEEPS A HELD STRING CHORD ALIVE
1929:## §53 THE HARP CANNOT HOLD A CHORD, AND ROLLED IS THE DEFAULT
1978:## §54 THE MEDIEVAL INSTRUMENTS, WHICH ARE EASIER TO MODEL THAN THE PEDAL HARP
1995:## §55 THE PEDAL HARP IS A STATE MACHINE
2017:## §56 WHAT NOBODY PUBLISHES
~~~

~~~
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=windows-1252">
<meta http-equiv="Content-Language" content="en-gb">
<meta name="GENERATOR" content="Microsoft FrontPage 5.0">
<meta name="ProgId" content="FrontPage.Editor.Document">
<title>Soundtrack Analysis</title>
</head>

<body link="#FF0000" vlink="#FF0000" alink="#008000">

<table border="0" width="100%">
  <tr>
    <td width="100%" colspan="2">
      <p style="margin-top: 0; margin-bottom: 0"><font face="Verdana"><img border="0" src="graphics/soundtrack.jpg" width="452" height="88"></font></p>
      <p style="margin-top: 0; margin-bottom: 0">&nbsp;</p>
      <p style="margin-top: 0; margin-bottom: 0"><b><font face="Verdana" size="2" color="#9999FF">edited
  by Ryszard Derdzinski</font></b></p>
      <p style="margin-top: 0; margin-bottom: 0">&nbsp;</td>
  </tr>
  <tr>
    <td width="100%" colspan="2">
      <p style="margin-top: 0; margin-bottom: 0"><font face="Verdana" size="2"> <span lang="pl">
      The soundracks of </span>the<i>
      <span lang="pl">Fellowship of the Ring</span></i><span lang="pl"> (</span></font><span lang="pl"><font face="Verdana" size="2">s</font></span><font face="Verdana" size="2">ince
  19 November, 2001<span lang="pl">)<i> 
      The Two Towers </i>(10 December, 2002) and<i> The Return of the King</i></span><i> </i>
      <span lang="pl">(24 November 2003) are</span> available in the music shops
  all over the world. On th<span lang="pl">e</span>s<span lang="pl">e</span> wonderful CD<span lang="pl">s</span> we can find many interesting
  linguistic <span lang="pl">items</span>: song lyrics in main languages of Middle-earth: <b><font color="#FF0000">Sindarin</font></b>,
  <b><font color="#FF0000">Quenya</font></b>, <font color="#FF0000"> <b>Khuzdul</b><span lang="pl">,
      <b>Ad</span><span lang="en">�</span><span lang="pl">naic</span></b><span lang="pl"><span lang="pl">
      </span></span></font><span lang="pl">a</span>nd <b><font color="#FF0000">Black</font> <font color="#FF0000"> Speech</font></b>. Authors
  of these lyrics and poems are <b>Philippa Boyens</b> (<span lang="pl">eg.
      </span><i>The Prophecy</i>,<i>
  Lament For Gandalf<span lang="pl"> </span></i><span lang="pl">in FotR and <i>
      The Ents</i>,<i> The Missing</i> in TTT</span>) and <b>Roma Ryan </b>(<i>An�ron</i>, <i>May It Be</i>)
  - they were translated into
  the languages of Middle-earth by <b>David Salo</b><span lang="pl"> (and <b>
      Roma</b> <b>Ryan</b> -<i> An�ron</i>)</span><i> </i>an American linguist,
      <span lang="pl">a </span>specialist <span lang="pl">of</span> the Tolkien's art-languages. Unfortunately
      <span lang="pl">not all the l</span>yrics are presented in small booklet<span lang="pl">s</span>
  accompanying the CD<span lang="pl">s</span>.<span lang="pl"> This website's 
      goal is to reconstruct or to find out the rest of them.</span></font><p style="margin-top: 0; margin-bottom: 0">&nbsp;</p>
      <p style="margin-top: 0;
~~~

~~~
Web search results for query: "Doug Adams "Music of the Lord of the Rings Films" Shire theme "Rural Setting" "Pensive Setting" "Hymn Setting""

Links: [{"title":"Music of the Middle-earth film series | The One Wiki to Rule Them All | Fandom","url":"https://lotr.fandom.com/wiki/Music_of_the_Middle-earth_film_series"},{"title":"Doug Adams wrote the book on the Lord of the Rings scores - Chicago Reader","url":"https://chicagoreader.com/film-tv/doug-adams-wrote-the-book-on-the-lord-of-the-rings-scores/"},{"title":"The Music of The Lord of the Rings Films: A Comprehensive Account of Howard Shore's Scores by Doug Adams | Goodreads","url":"https://www.goodreads.com/book/show/8882617-the-music-of-the-lord-of-the-rings-films"},{"title":"13.4: Howard Shore's Score to Lord of the Rings - Humanities LibreTexts","url":"https://human.libretexts.org/Courses/Prince_Georges_Community_College/Music_Appreciation:_A_Topical_Approach_to_Music_Genre_and_Style/13:_Music_in_Film/13.04:_Howard_Shore's_Score_to_Lord_of_the_Rings"},{"title":"The Music of the Lord of the Rings Films | Doug Adams' Blog: September 2011","url":"http://www.musicoflotr.com/2011/09/?m=1"},{"title":"Howe Records » The Music of the Lord of the Rings Films","url":"https://howerecords.com/the-lord-of-the-rings-rarities/"},{"title":"June 2011 | The Music of the Lord of the Rings Films | Doug Adams' Blog","url":"http://www.musicoflotr.com/2011/06/"},{"title":"Notes | The Music of the Lord of the Rings Films | Doug Adams' Blog","url":"http://www.musicoflotr.com/2012/12/notes.html"}]

I found some good information about Doug Adams' work on the Lord of the Rings music. Here are the key results:

Doug Adams is a Chicago-based author and musicologist who wrote "The Music of the Lord of the Rings Films," a 400-page book published in 2010 after nearly a decade of research that includes detailed descriptions of the 90-plus musical themes Shore composed for the films, narrative analysis, translations of choral texts, and behind-the-scenes perspectives on Shore's creative process.

Regarding the Shire theme specifically, the Shire Theme is also called the "Pensive" Shire Theme and is one of the main themes of the series, having featured prominently in all the films. The themes for the Shire are all stepwise melodies orchestrated for celtic instruments such as fiddle and tin whistle.

The search results confirm Doug Adams' detailed analysis of these themes in his comprehensive book on Howard Shore's Lord of the Rings scores, though the specific terminology around "Rural Setting" and "Hymn Setting" you mentioned in your query didn't appear in these particular results.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
Web search results for query: ""Annotated Score" Doug Adams "The Two Towers" Complete Recordings pdf"

Links: [{"title":"Annotated ROTK Score Online Now!","url":"https://www.theonering.net/torwp/2007/11/13/28046-annotated-rotk-score-online-now/"},{"title":"The Two Towers Annotated Score - PDFCOFFEE.COM","url":"https://pdfcoffee.com/the-two-towers-annotated-score-pdf-free.html"},{"title":"Annotated Scores of the LOTR films in interactive form","url":"https://www.theonering.net/torwp/2008/07/13/29200-annotated-scores-of-the-lotr-films-in-interactive-form/"},{"title":"The Two Towers Annotated Score | PDF","url":"https://www.scribd.com/doc/95495739/The-Two-Towers-Annotated-Score"},{"title":"THE ANNOTATED SCORE","url":"https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf"},{"title":"The Music of the Lord of the Rings FAQ | The Music of the Lord of the Rings Films | Doug Adams' Blog","url":"http://www.musicoflotr.com/p/music-of-lord-of-rings-faq.html"},{"title":"The Lord of the Rings: The Two Towers (soundtrack)","url":"https://en.wikipedia.org/wiki/The_Lord_of_the_Rings:_The_Two_Towers_(soundtrack)"},{"title":"The Music of The Lord of The Rings Films - Part I - The Fellowship of The Ring - PDFCOFFEE.COM","url":"https://pdfcoffee.com/the-music-of-the-lord-of-the-rings-films-part-i-the-fellowship-of-the-ring-9-pdf-free.html"}]

Based on the search results, I found information about Doug Adams' Annotated Score for The Two Towers Complete Recordings:

The Annotated Scores, written by Doug Adams, are companion pieces to the three sets of Complete Recordings and were offered as a free download at the Reprise LOTR soundtrack site.

However, the Annotated Score documents are no longer available for free download because The Music of the Lord of the Rings Films is now available, and this material has now been released in its full, expanded form.

The search results show that the Annotated Score PDF did exist and was packaged with The Lord of the Rings: The Two Towers The Complete Recordings, but it's no longer freely distributed online as it has been incorporated into Doug Adams' comprehensive book on the Lord of the Rings film music.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
116:ﬁrst tender chords of the Shire theme’s Hymn Setting and hints of A Hobbit’s Understanding.
183:the piece from the end,” remarks the composer. “It’s the Hymn Setting, or ‘In Dreams,’ and it’s the ﬁrst time you hear it.” Immedi-
1058:The Hobbit/Shire theme’s Rural Setting is most closely 
1089:handful of musette lines to provide harmonic accompaniment to the Shire theme’s Rural Setting.
=== SECTION HEADERS ===
2:THE MUSIC OF THE LORD OF THE RINGS FILMS 
4:P A C K A G E D  W I T H
7:THE ANNOTATED SCORE 
11:THE MUSIC OF THE LORD OF THE RINGS FILMS
12:DISC ONE
81:THE MUSIC OF THE LORD OF THE RINGS FILMS
125:THE MUSIC OF THE LORD OF THE RINGS FILMS
175:THE MUSIC OF THE LORD OF THE RINGS FILMS
219:THE MUSIC OF THE LORD OF THE RINGS FILMS
265:THE MUSIC OF THE LORD OF THE RINGS FILMS
266:DISC TWO
336:THE MUSIC OF THE LORD OF THE RINGS FILMS
381:THE MUSIC OF THE LORD OF THE RINGS FILMS
427:THE MUSIC OF THE LORD OF THE RINGS FILMS
485:THE MUSIC OF THE LORD OF THE RINGS FILMS
486:DISC THREE
531:THE MUSIC OF THE LORD OF THE RINGS FILMS
588:THE MUSIC OF THE LORD OF THE RINGS FILMS
647:THE MUSIC OF THE LORD OF THE RINGS FILMS
683:THE MUSIC OF THE LORD OF THE RINGS FILMS
698:FOOTSTEPS OF DOOM
707:THE REVELATION OF THE RINGWRAITHS
720:THE MUSIC OF THE LORD OF THE RINGS FILMS
728:DRINKING SONG
766:THE MUSIC OF THE LORD OF THE RINGS FILMS
767:BLACK SPEECH RING-VERSE
789:ARWEN’S PRAYER
797:THE MUSIC OF THE LORD OF THE RINGS FILMS
798:HYMN TO ELBERETH
818:GILRAEN’S SONG
840:THE MUSIC OF THE LORD OF THE RINGS FILMS
841:THE SEDUCTION OF THE RING
849:GANDALF AT THE DOOR TO MORIA
857:DURIN’S SONG
882:THE MUSIC OF THE LORD OF THE RINGS FILMS
883:THE BALROG
908:LAMENT FOR GANDALF
930:THE MUSIC OF THE LORD OF THE RINGS FILMS
941:GALADRIEL’S SONG
980:THE MUSIC OF THE LORD OF THE RINGS FILMS
981:ELESSAR’S OATH
987:THE DEATH OF BOROMIR
988:PART ONE
996:PART TWO
1009:THE MUSIC OF THE LORD OF THE RINGS FILMS
1010:MAY IT BE
1034:IN DREAMS
1055:THE MUSIC OF THE LORD OF THE RINGS FILMS
1056:INSTRUMENTS
1057:H O BBI TO N
1074:WHISTLE
1078:DULCIMER
1082:CELTIC HARP
1086:MUSETTE
1090:MANDOLIN
1098:CELESTA
1106:THE MUSIC OF THE LORD OF THE RINGS FILMS
1107:THE ELVES
1113:MONOCHORD
1127:NEY FLUTE
~~~

~~~
/home/user/DeckardsMusicBox/corpus/:
total 196
drwxr-xr-x 4 root root  4096 Aug  9 19:48 .
drwxr-xr-x 8 root root 12288 Aug 13 02:01 ..
-rw-r--r-- 1 root root   598 Aug  7 13:07 .gitignore
drwxr-xr-x 2 root root  4096 Aug  7 13:07 .harmonix
-rw-r--r-- 1 root root  6164 Aug  9 19:48 README.md
-rw-r--r-- 1 root root 10518 Aug  7 13:07 analyze_sax.py
-rw-r--r-- 1 root root  5737 Aug  7 13:07 analyze_sax_lines.py
-rw-r--r-- 1 root root  3812 Aug  7 13:07 analyze_synthwave.py
-rw-r--r-- 1 root root  7161 Aug  7 13:07 build_grammar.py
-rw-r--r-- 1 root root  5341 Aug  7 13:07 build_structure.py
-rw-r--r-- 1 root root  8904 Aug  7 13:07 harvest_accompaniment.py
-rw-r--r-- 1 root root  6586 Aug  7 13:07 harvest_bass.py
-rw-r--r-- 1 root root  8098 Aug  7 13:07 harvest_drums.py
-rw-r--r-- 1 root root 14038 Aug  7 13:07 harvest_ensemble.py
-rw-r--r-- 1 root root 10800 Aug  7 13:07 harvest_melody.py
-rw-r--r-- 1 root root  3284 Aug  7 13:07 harvest_structure.py
-rw-r--r-- 1 root root  7855 Aug  7 13:07 ingest_bach.py
-rw-r--r-- 1 root root  9080 Aug  9 19:48 ingest_chord_quality.py
-rw-r--r-- 1 root root  7051 Aug  7 13:07 ingest_jazz.py
-rw-r--r-- 1 root root  7509 Aug  7 13:07 ingest_ragtime.py
-rw-r--r-- 1 root root  7462 Aug  7 13:07 ingest_session.py
-rw-r--r-- 1 root root  5039 Aug  7 13:07 ingest_wjazz.py
-rw-r--r-- 1 root root  5535 Aug  7 13:07 ingest_wjazz_solos.py
drwxr-xr-x 2 root root  4096 Aug  7 13:07 sax

/home/user/DeckardsMusicBox/docs/genre-research/raw/:
total 920
drwxr-xr-x 2 root root   4096 Aug 10 22:13 .
drwxr-xr-x 3 root root   4096 Aug 13 02:10 ..
-rw-r--r-- 1 root root 536838 Aug  9 19:48 ds-research-2026-08-06.json
-rw-r--r-- 1 root root 163701 Aug 10 22:13 epic-orchestral-scale.md
-rw-r--r-- 1 root root  89373 Aug 10 22:13 lotr-score-study.md
-rw-r--r-- 1 root root 135531 Aug 10 22:13 overworld-and-materials.md
~~~

~~~
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>404 Not Found</title>
</head><body>
<h1>Not Found</h1>
<p>The requested URL was not found on this server.</p>
<p>Additionally, a 404 Not Found
error was encountered while trying to use an ErrorDocument to handle the request.</p>
</body></html>

=== adams2 head ===
A  C O M P A N I O N  P I E C E  T O :
THE MUSIC OF THE LORD OF THE RINGS FILMS 
PART I: THE FELLOWSHIP OF THE RING
P A C K A G E D  W I T H
THE LORD OF THE RINGS: THE FELLOWSHIP OF THE RING
THE COMPLETE RECORDINGS.
THE ANNOTATED SCORE 

===PAGE===

THE MUSIC OF THE LORD OF THE RINGS FILMS
DISC ONE
1  –  PRO LO G UE : O N E  R I N G  TO  RUL E  T H E M  AL L
The ﬁlm’s Prologue plunges the audience into the world of Middle-earth 
and the plight of the One Ring in a standalone sequence establishing the 
enormous tale about to unfold. Shore’s music acts as a prelude, introducing 
brief clips of the thematic material that will populate the score as the story 
progresses. Heard here for the ﬁrst time are a choral rendering of the Elvish 
Lothlórien theme; Mordor’s Skip Beat accompaniment, the Descending 
Third accompaniment, the Sauron/Evil of the Ring theme; the Ringwraith 
theme; the bitter Fall of Men motive; and even the ﬂeeting shape of the Fel-
lowship theme—all bristling and shuddering amongst the violent conﬂict on 
screen.
Most prominent in this sequence, however, is the History of the Ring 
theme, which makes its debut appearance following the opening Lothlórien 
clip. Throughout the Prologue, Shore highlights a single purpose of his His-
tory theme: “It’s showing you how the Ring has traveled from hand to hand.” 
Galadriel continues her narration, as again this History theme introduces 
the Ring to its new owners: Isildur, and then Gollum/Sméa
=== diff adams2 vs adams_fotr ===
DIFFERENT
~~~

~~~
staff lines: [119.5, 154.0, 188.0, 222.5, 257.5, 423.0, 457.0] img (476, 3551)
x=   640.9 y=  271.8 w= 37 h= 33 a= 1082 -> D4 (step 8.83)
x=   712.0 y=  257.5 w= 31 h= 28 a=  816 -> E4 (step 8.0)
x=   821.7 y=  239.9 w= 37 h= 38 a= 1196 -> F4 (step 6.98)
x=   961.7 y=  205.8 w= 38 h= 36 a= 1189 -> A4 (step 5.0)
x=  1102.4 y=  239.9 w= 37 h= 38 a= 1196 -> F4 (step 6.98)
x=  1163.3 y=  257.4 w= 30 h= 28 a=  799 -> E4 (step 7.99)
x=  1277.5 y=  272.9 w= 34 h= 31 a=  970 -> D4 (step 8.89)
x=  1391.5 y=  257.6 w= 30 h= 28 a=  795 -> E4 (step 8.0)
x=  1722.9 y=  272.5 w= 37 h= 32 a= 1048 -> D4 (step 8.87)
x=  1810.8 y=  240.0 w= 37 h= 38 a= 1197 -> F4 (step 6.99)
x=  1923.5 y=  240.0 w= 37 h= 38 a= 1196 -> F4 (step 6.99)
x=  1988.0 y=  205.6 w= 37 h= 36 a= 1159 -> A4 (step 4.99)
x=  2371.5 y=  154.0 w= 32 h= 29 a=  858 -> D5 (step 2.0)
x=  2455.9 y=  172.3 w= 39 h= 36 a= 1193 -> C5 (step 3.06)
x=  2596.6 y=  205.7 w= 38 h= 36 a= 1171 -> A4 (step 5.0)
x=  2729.5 y=  239.9 w= 37 h= 38 a= 1198 -> F4 (step 6.98)
x=  2922.1 y=  221.6 w= 33 h= 28 a=  867 -> G4 (step 5.92)
x=  2984.0 y=  239.9 w= 36 h= 38 a= 1173 -> F4 (step 6.98)
x=  3045.6 y=  257.6 w= 30 h= 28 a=  798 -> E4 (step 8.01)
x=  3240.0 y=  271.9 w= 35 h= 33 a= 1046 -> D4 (step 8.83)
x=  3300.0 y=  258.0 w= 31 h= 29 a=  840 -> E4 (step 8.03)
SEQ: D4 E4 F4 A4 F4 E4 D4 E4 D4 F4 F4 A4 D5 C5 A4 F4 G4 F4 E4 D4 E4
=== BARLINES ===
[188, 207, 762, 1432, 2084, 2669, 3343]
~~~

~~~
patched
staff lines: [119.5, 154.0, 188.0, 222.5, 257.5, 423.0, 457.0] img (476, 3551)
barlines: [188, 207, 762, 1432, 2084, 2669, 2746, 3001, 3343]
  --- barline 1 ---
  --- barline 2 ---
x=   399.9 y=  430.6 w= 25 h= 24 a=  593 -> ? (step 18.03)
x=   417.7 y=  138.8 w= 60 h= 48 a= 2497 -> E5 (step 1.12)
x=   640.5 y=  271.9 w= 38 h= 33 a= 1103 -> D4 (step 8.84)
x=   671.0 y=  465.0 w= 43 h= 21 a=  903 -> ? (step 20.03)
  --- barline 3 ---
x=   962.1 y=  205.8 w= 39 h= 36 a= 1218 -> A4 (step 5.0)
x=  1149.2 y=  165.4 w= 65 h= 53 a= 3262 -> C5 (step 2.66)
x=  1277.5 y=  272.9 w= 36 h= 31 a= 1012 -> D4 (step 8.89)
x=  1391.0 y=  258.0 w= 33 h= 29 a=  879 -> E4 (step 8.03)
  --- barline 4 ---
x=  1494.3 y=  271.8 w= 38 h= 33 a= 1153 -> D4 (step 8.83)
x=  1722.6 y=  272.3 w= 38 h= 33 a= 1090 -> D4 (step 8.86)
x=  1810.9 y=  239.9 w= 38 h= 38 a= 1248 -> F4 (step 6.98)
  --- barline 5 ---
x=  2368.2 y=  165.5 w= 38 h= 51 a= 1729 -> C5 (step 2.66)
x=  2455.9 y=  172.4 w= 41 h= 36 a= 1245 -> C5 (step 3.07)
  --- barline 6 ---
x=  2706.1 y=  240.0 w= 82 h= 38 a= 2996 -> F4 (step 6.98)
  --- barline 7 ---
x=  2921.9 y=  221.9 w= 35 h= 29 a=  930 -> G4 (step 5.94)
x=  2969.6 y=  131.5 w= 65 h= 52 a= 3199 -> E5 (step 0.69)
x=  2983.9 y=  239.8 w= 36 h= 38 a= 1195 -> F4 (step 6.98)
  --- barline 8 ---
x=  3045.9 y=  257.9 w= 33 h= 29 a=  882 -> E4 (step 8.02)
SEQ: ? E5 D4 ? A4 C5 D4 E4 D4 D4 F4 C5 C5 F4 G4 E5 F4 E4
~~~
