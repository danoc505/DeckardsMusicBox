# RECOVERED — developing a theme

*This agent was stopped mid-run when the owner cut the research back. Nothing
here is a finished sheet. It is the material that had already been fetched and
the reasoning that had already been written, salvaged from the run transcript so
the fetching does not have to be paid for twice. TREAT EVERY LINE AS UNVERIFIED
until it is checked against its source: the agent had not reached the stage where
it separates what it sourced from what it was still assuming.*

## Searches it ran (21)

- `select:WebSearch,WebFetch`
- `melodic sequence rule "three" repetitions "no more than" tonal real modified sequence music theory`
- `Marvin Laprade contour class CSEG contour segment melodic contour theory Morris 1987`
- `Huron melodic principles corpus statistics "step declination" "post-skip reversal" "gap fill" large intervals followed by step Essen folksong`
- `Essen folksong collection melodic interval distribution percentage unison second third fourth fifth histogram corpus study`
- `"interval distribution" melody corpus percentage "major second" "minor third" folk songs chorales jazz comparison statistics table`
- `Weimar Jazz Database interval distribution jazz solos percentage steps leaps Frieler statistics melodic`
- `Vos Troost 1989 "ascending and descending melodic intervals" statistical findings perceptual relevance large intervals ascending small descending`
- `Dowling 1978 scale and contour two components theory of memory for melodies listeners recognize contour transposition`
- `select:mcp__github__search_repositories`
- `essen folksong kern humdrum`
- `"melodic intervals" corpus percentages table "unison" "major second" "minor third" "perfect fourth" percent Essen Temperley "Music and Probability" interval distribution`
- `Müllensiefen Frieler melodic similarity measures which features predict human similarity judgments MIREX symbolic melodic similarity rhythm contour intervals`
- `Caplin classical form sentence "basic idea" 2 bars "presentation phrase" 4 bars continuation cadential 8-bar period antecedent consequent definition`
- `White 1960 "Recognition of distorted melodies" American Journal of Psychology contour preserved interval distortion recognition percentage`
- `Dowling 1972 "Recognition of melodic transformations" inversion retrograde retrograde-inversion recognized above chance contour not intervals results`
- `Irish traditional music variation "second time through" ornamentation versus variation what changes each repeat strain time-through`
- `"break the sequence" OR "breaking the sequence" music theory rule sequence should not continue too long last statement altered cadence Piston Kostka`
- `von Hippel Huron 2000 "why do skips precede reversals" tessitura melodic structure post-skip reversal composers do not actually regression to the mean findings`
- `Müllensiefen Frieler "melodic similarity" SIMILE algorithm rhythmically weighted edit distance n-gram best predictor experts ratings pdf`
- `Schoenberg "Fundamentals of Musical Composition" motive variation "features" rhythm intervals what must be preserved "the motive" quotation`

## Pages it fetched (17)

- https://iastate.pressbooks.pub/comprehensivemusicianship/chapter/7-2-melodic-sequences-tutorial/
- https://en.wikipedia.org/wiki/Sequence_(music)
- https://journals.sagepub.com/doi/full/10.1177/20592043231225731
- https://www.mu-on.org/frieler/docs/frieler_feature_history_final_preprint.pdf
- https://bpb-us-e2.wpmucdn.com/labs.utdallas.edu/dist/f/100/files/2021/03/1978-2.pdf
- https://emusicology.org/article/id/4636/
- https://davidtemperley.com/wp-content/uploads/2015/11/temperley-mp14.pdf
- https://arxiv.org/pdf/2503.24243
- http://shanahdt.github.io/MUSI4331/lessons/phrases1.html
- https://link.springer.com/article/10.3758/bf03205852
- https://www.musictheoryacademy.com/composing-music/sequences/
- https://fiveable.me/ap-music-theory/unit-6/melodic-sequence/study-guide/0UWZhCHSSHysPILNPUFK
- https://sfcm.edu/study/majors/academics/music-theory-and-musicianship/sfcm-theory/online-materials/harmony-supplements/aldwell-schachter-chapter-18
- https://myweb.fsu.edu/nrogers/Handouts/Diatonic_Sequence_Handout.pdf
- https://themusiccompositionblog.com/2013/10/15/how-to-develop-a-melody-using-sequencing/
- https://www.mu-on.org/frieler/docs/SIMILE_algo_docs_rev_kf.pdf
- https://arxiv.org/abs/2604.13119

## What it had written when it was stopped

I'll start by reading the required context files.


## Raw fetched material (78 results, longest first, truncated to 20k each)

~~~
1	# How a dissonance is arrived at — writing the other half of the law
2	
3	*Researched 2026-08-05. HANDOFF §9.5 has named this "the law this repo measured
4	and did not write" since 2026-08-04, and `BACKLOG.md` §6.3 carries the same row:
5	"a dissonance is constrained on the way out and not on the way in". The user:
6	"Music theory is the physics engine, held together by constraints. Decisions
7	about laws are yours to make and write down, not to hand back to me." This sheet
8	decides it.*
9	
10	**Fresh research, not a re-reading of what was already here.** The repo's prior
11	work on this subject is one measured number — Bach's 96.8% — sitting in
12	`counterpoint-measured.md` §3 with no rule attached and no taxonomy behind it.
13	Everything in §2 and §3 below is new, from named sources, and §3 is a genuine
14	conflict between two of them that had to be decided rather than averaged.
15	
16	---
17	
18	## 1. THE LAW AS IT STANDS, AND THE HALF THAT IS MISSING
19	
20	The program has a **departure** law, built 2026-07-30 and live in `buildTheme`
21	and `deriveCounter`: when the note just written is outside the chord sounding
22	under it, the next note's choices are narrowed to one scale step. It is a
23	constraint at the choice, never a repair, and **it works** — that is worth
24	saying plainly before proposing anything, because the temptation with a
25	half-built law is to report the built half as broken.
26	
27	What has never existed is any rule about how a dissonance is **reached**. The
28	walk draws its move from `[[0,2],[dir,5],[dir*2,2],[-dir,2]]` — repeat, step,
29	third, step-back — and nothing has ever asked what the note it lands on is.
30	
31	---
32	
33	## 2. THE TAXONOMY SORTS EVERY FIGURE BY ITS APPROACH
34	
35	Read the approach column; it is the whole finding.
36	
37	| figure | approached by | left by |
38	|---|---|---|
39	| passing tone | **step** | step, same direction |
40	| neighbour tone | **step** | step, opposite direction |
41	| escape tone | **step** | leap, opposite direction |
42	| anticipation | **step** | same note |
43	| suspension | **same note** | step down |
44	| retardation | **same note** | step up |
45	| pedal point | **same note** | same note |
46	| **appoggiatura** | **leap** | step |
47	
48	[corpus:musictheory.pugetsound Table 10.1.1 — *Introduction to Non-Chord
49	Tones*; corpus:openmusictheory *Embellishing tones*] **`[two sources]`**
50	
51	**Eight figures. Seven are approached by step or by repetition. Exactly one is
52	approached by a leap, and it is the appoggiatura.**
53	
54	That is the same shape of finding as `the-note-that-does-not-belong.md` §2,
55	which established that every figure is defined by its *motion* rather than by
56	the chord under it. This sheet is the other side of the same coin: that motion
57	has two halves, and the program only ever looked at one of them.
58	
59	### And species counterpoint states it as a prohibition with named exceptions
60	
61	> **"No leap to dissonance"** — listed as a primary rule, with exactly four
62	> exceptions: an unaccented leap to an **anticipation**; a leap **between
63	> essential tones** (both notes belong to the sounding harmony, so neither is a
64	> dissonance); the **cambiata**; and the **appoggiatura**, "an upward leap to an
65	> accented dissonance, followed by a downward stepwise resolution".
66	> [corpus:ars-nova *Dissonance handling — Species Counterpoint*]
67	
68	Same answer from the other direction: the leap onto a clash is not forbidden,
69	it is *named*, and the name carries an obligation.
70	
71	### What the sources do NOT give, said plainly
72	
73	I searched for an equivalent rule in jazz and popular-music voice leading,
74	because this program writes lofi, synthwave, a game score and a film cue and
75	not one chorale. **The search did not produce one.** The pop and jazz sources
76	that came back discuss leaps as a melodic-shape question ("prepare a large leap
77	on at least one side", "avoid augmented intervals") and do not state a rule
78	about leaping onto a non-chord tone at all. So the prohibition in this sheet is
79	**common-practice in origin and is not corroborated outside it**, and §5 says
80	what that costs the law it justifies.
81	
82	---
83	
84	## 3. THE TWO SOURCES DISAGREE ABOUT THE APPOGGIATURA, AND IT MATTERS
85	
86	This is the one place the research forked, and both sides are reputable:
87	
88	> **"approached by leap (usually up), and followed by step (usually down, but
89	> ALWAYS IN THE OPPOSITE DIRECTION of the preceding leap)"**
90	> [corpus:openmusictheory *Embellishing tones*]
91	
92	> **"The leap to and step away from any appoggiatura CAN BE FROM ANY
93	> DIRECTION"** — with a Mozart example that leaps up and resolves up.
94	> [corpus:musictheory.pugetsound *Appoggiatura*]
95	
96	**DECIDED: take the loose reading — the step out is required, the direction is
97	not.** Two reasons, and the second is the stronger:
98	
99	1. The loose statement is from the *same publication* as the approach table in
100	   §2. Taking that table and then rejecting its own companion page on the one
101	   point where it is inconvenient would be choosing the evidence to fit the
102	   rule.
103	2. **A law nobody can break is worth having; a habit dressed as a law just
104	   removes seeds** (HANDOFF §2, principle 2). Direction-of-resolution is
105	   contested between two sources of equal standing, so it is a habit. The step
106	   out is not contested by anyone, so it is the law.
107	
108	Both numbers are measured and reported separately in `probe_arrival.js`, so
109	whoever wants to revisit this has the cost of the strict reading in front of
110	them rather than having to re-derive it.
111	
112	---
113	
114	## 4. WHAT THE PROGRAM ACTUALLY DOES — measured before deciding anything
115	
116	`harness/probe_arrival.js`, new, 20 seeds a genre, lead and counter, 5386
117	dissonances. It reads the chord from what the comp is *sounding* at that
118	instant, exactly as `probe_theory` does, so the two probes agree about which
119	notes are dissonances and differ only in which side of them they look at.
120	
121	```
122	  genre          dissonances   by step   by repeat   by leap   of the leaps:
123	                 (approached)                              step back  step on  LEAPT  (phr.end)
124	  lofi                  707      71.3%      12.9%     15.8%      29.5%   25.9%  16.1%   28.6%
125	  synthwave            3215      64.0%      17.2%     18.8%      23.7%   28.8%  18.0%   29.5%
126	  dkc                  1045      77.1%      12.4%     10.4%      15.6%   34.9%  14.7%   34.9%
127	  bladerunner           419      67.1%      18.4%     14.6%      16.4%   26.2%  19.7%   37.7%
128	  TOTAL                5386      67.7%      15.8%     16.5%      22.9%   29.0%  17.5%   30.6%
129	```
130	
131	**83.5% of dissonances arrive by step or by repeat** — inside the taxonomy's
132	uncontested set. **16.5% arrive by leap, against Bach's ~3.2%**, so the program
133	leaps onto a clash about five times as often as the corpus this repo measured.
134	
135	Of those leaps, under the reading decided in §3: **51.9% are appoggiaturas**
136	(they step out, either direction) and are real writing that should be left
137	alone. The remaining 48.1% — **7.9% of all dissonances** — are leaps onto a
138	clash that do not step out.
139	
140	### Three genres read zero, and the zero is real
141	
142	acid writes a lead but declares no comp, so there is no chord for a note to be
143	outside of. plastikman and jungle write neither a lead nor a counter — the law
144	has nothing to address in either. The probe derives and prints which of the two
145	it is, rather than showing a bare dash that reads like a broken measurement.
146	
147	### TWO CORRECTIONS I MADE TO MY OWN MEASUREMENT BEFORE BELIEVING IT
148	
149	Both are the documented failure mode — the probe measuring its own setup — and
150	both inflated the defect in my favour, which is why they are recorded.
151	
152	- **The first version had no phrase-end column** and counted a dissonance
153	  followed by a rest as one that failed to step out. That is exactly the trap
154	  `probe_theory` documents in the other direction, where 81% of one genre's
155	  "unresolved" dissonances turned out to be phrase endings. It read 48.1% of
156	  leaps as never resolving; with the endings separated, the figure is 17.5%.
157	- **My first write-up of this said "12.7% of every dissonance is a figure with
158	  no name".** That used the strict reading of §3 and counted the endings as
159	  failures. Under the reading actually decided, and with the endings counted
160	  apart, the number is **7.9%**. The smaller number is the true one.
161	
162	### And the residue is mostly a defect that is already on the books
163	
164	Of the 155 leap-in/leap-out cases in 80 songs, **41 are the counter jumping two
165	octaves** — `octaves: [-12, 12]` taking whichever end fits the band, already
166	recorded in `BACKLOG.md` §6.5 as its own `[CHOSEN]` row and not this law's
167	business. Another 64 are a dissonance followed by the *same pitch repeated*.
168	The genuinely arrival-shaped residue is about 50 cases in 80 songs, which is
169	under 1% of dissonances. **The leap-in-leap-out case is not the problem; the
170	leap-in-and-nothing case is.**
171	
172	---
173	
174	## 5. THE LAW, DECIDED
175	
176	> **A note outside the chord sounding under it may be LEAPT onto only when
177	> something follows it closely enough to resolve it. Otherwise the leap narrows
178	> to a step.**
179	
180	That is the taxonomy of §2 written as a rule. It admits the appoggiatura — the
181	one figure that leaps in — on the one condition every source attaches to it,
182	and it converts every other leap onto a clash into a step onto a clash, which
183	is a passing tone or a neighbour and which no source has ever objected to.
184	
185	**"Closely enough"** is the same test the departure law's own measurement uses:
186	the next onset begins no later than one sixteenth after this note stops
187	sounding. A dissonance that has died away is not hanging — that is established
188	in this repo already — but it is also not *resolved*, and a leap onto one is
189	the arrival with no figure behind it.
190	
191	### Why this is a narrowing and not a throw
192	
193	The out-of-key law throws, because it is about **spelling**: a note either is
194	or is not in the harmony, and there is always another note. This is about
195	**motion**, and a motion constraint can be unsatisfiable — which this project's
196	own front door states as a rule: *"a constraint that can be unsatisfiable must
197	be a cost"* (`START-HERE.md`), a mistake made and fixed at least three times.
198	
199	So the tune **narrows the move** — a leap becomes a step in the same direction,
200	which is always available in a seven-note scale and therefore can never fail —
201	and the counter, whose candidates are a short list drawn as intervals from the
202	lead, takes it as a **cost** in the list it already scores. Same law, two
203	shapes, for the reason the two sites differ: the tune chooses a *move*, the
204	counter chooses from a *list*, and a filter on a short list can empty.
205	
206	### What it deliberately does NOT do
207	
208	- **It does not impose Bach's 96.8% on genres that are not chorales.** §2's
209	  closing paragraph is honest that the prohibition is common-practice in origin
210	  and was not corroborated in jazz or popular sources. So the law removes the
211	  arrivals that *no* reading defends and leaves the appoggiatura rate to the
212	  music. If the owner later wants fewer leaps than that, it is a weight in the
213	  move draw, not this law.
214	- **It does not touch the direction of resolution** — see §3.
215	- **It does not chase the counter's octave flip.** That is a different defect
216	  with its own row in the backlog, and folding it in here would put two changes
217	  inside one measurement.
218	
219	---
220	
221	## 6. WHAT WAS BUILT AND WHAT IT MEASURED — build `2026-08-05e`
222	
223	**Two sites, one law.** `buildTheme`'s `phrase()` narrows its move; the walk
224	draws from `[[0,2],[dir,5],[dir*2,2],[-dir,2]]` and a drawn `dir*2` onto a
225	dissonance becomes `dir`. `deriveCounter` takes it as a cost in the candidate
226	list it already scores, weighted **equal to** the contrary-motion term because
227	the two are habits of the same standing. `deriveCounter`'s own hang test now
228	calls the same expression instead of keeping a second copy of it — the
229	departure half and the arrival half must never be able to disagree about which
230	notes are dissonances.
231	
232	### Asked at the bar's last onset, and that is not a compromise
233	
234	Every other onset already has its resolution guaranteed: `plannedDur` **is** the
235	gap to the next note, so the note runs into its successor and the departure law
236	forces that successor to a step. A leap onto one of those is a genuine
237	appoggiatura and is left alone on purpose. The bar's last onset has no such
238	guarantee. Reaching past the bar for the next one would mean drawing that bar's
239	steps early, which reorders the stream and moves songs nobody touched [Law 3].
240	
241	### AND NARROWING THE MOVE WAS NOT ENOUGH — I guessed, and the guess was wrong
242	
243	I wrote "0.7%" into a code comment before measuring it. Measured, the narrowing
244	alone left the constrained population at **7.4%** against 9.5% unconstrained,
245	and the residue was **not drawn leaps at all**: `intoBand` folds a pitch back
246	inside the register by whole octaves and the seat-finding walk steps it
247	further, so a move of one scale step can land eleven semitones from where it
248	left. The law is now asked of **the interval that actually sounds**, after
249	every hand that can move the note has moved it, and the answer is to DROP —
250	the precedent `the-note-that-does-not-belong.md` §4b set at this same fold.
251	
252	```
253	  bar-final lead onsets landing on a dissonance, 20 seeds x 7 genres,
254	  the share arrived at by LEAP:
255	
256	    unconstrained                   9.5%
257	    narrowing the move only         7.4%     <- what I predicted would be ~0
258	    asked of the interval sounded   4.8%
259	```
260	
261	### Overall, on the performance (`probe_arrival`, 20 seeds a genre)
262	
263	```
264	                       before   after
265	  arrive by step       67.7%    70.0%
266	  arrive by repeat     15.8%    15.7%
267	  arrive by LEAP       16.5%    14.3%
268	  leaps that never step out, as a share of all dissonances
269	                        7.9%     6.7%
270	```
271	
272	Cost: 6342 lead notes in the materials become 6315, **0.43% fewer**.
273	
274	### THE SEAM CHECK, AND TWO VERSIONS OF IT THAT WERE WRONG
275	
276	Recorded because both failed in ways this project already has rules about.
277	
278	1. **A threshold on the whole population cannot work here.** The law fires only
279	   at bar-final onsets, so across every dissonance its effect is two points —
280	   and any line drawn through a two-point gap measures the seed draw.
281	2. **Comparing bar-final arrivals to mid-bar ones looked beautiful and was
282	   noise.** At 20 seeds the law appeared to *flip* which slot was riskier
283	   (9.5% vs 7.0% becoming 4.8% vs 6.8%). At the 8 seeds the check actually
284	   runs, the unconstrained build reads 7.1% vs 10.3% — the other way round.
285	   **The check passed with the law removed.** It was watched failing to fail,
286	   which is the only reason it is not in the file.
287	
288	What shipped is structural rather than statistical: a bar-final onset landing
289	on a dissonance, whose in-bar predecessor was **consonant** (so the departure
290	law was not the one in charge), reached by more than a step. Driven to failure
291	both ways: **0.9% of 109 with the law, 9.7% of 113 without.**
292	
293	### Blast radius
294	
295	636 of 2100 seeds moved; **form and arrangement hashes identical on every
296	one**, which is the right shape for a melodic change. lofi 119, synthwave 93,
297	dkc 222, bladerunner 144, acid 58, **plastikman 0, jungle 0** — the last two
298	compose a lead their arrangement never plays, so their material moved and their
299	record did not. Re-baselined `c3abd9c25331528c`.
300	
301	Per role, 30 seeds × 7 genres: 30 of 41 role/genre pairs byte-identical, and
302	every mover is `lead` or `counter` **except dkc's bass, keys and ostinato**.
303	That was checked rather than waved through: dkc is the only genre on the `sega`
304	rig, whose YM2612 has six FM channels and **refuses** notes when the budget is
305	full, so a changed lead reallocates the budget. Note *counts* move and not just
306	durations, which is what refusal looks like.
307	
308	---
309	
310	## 7. STILL OPEN, HONESTLY
311	
312	- **NO VERDICT ON IT YET.** Every number above says the arrivals changed
313	  and none says the tunes sound better. `BACKLOG.md` §0 and the sax precedent.
314	- **The effect is small and the reason is structural.** Only the bar's last
315	  onset lacks a guaranteed resolution, so only it is constrained. Whether the
316	  genres should also leap onto clashes *less often in general* — Bach's 3.2%
317	  against this program's 14.3% — is a weight in the move draw and a taste
318	  question, not this law.
319	- **The first note of a phrase has no arrival at all.** `hang` and the previous
320	  pitch both reset per phrase, so the law cannot see across the join even
321	  though the owner can. Fixing it means carrying two values across phrases, which
322	  is a real change to `phrase()`'s contract and wants its own commit.
323	- **The counter's octave flip is untouched and is the larger arrival defect on
324	  that part** — 41 of the 155 leap-in/leap-out cases are `octaves: [-12, 12]`
325	  taking whichever end fits the band. `BACKLOG.md` §6.5 owns that row.
326	- **`acid` is measured as having no dissonances at all** because it declares no
327	  comp, so its lead is judged against the written chord only. That is honest
328	  but it means the law reaches acid through a weaker test than the other four.
329	- **The residue is 0.9%, not 0**, and it has not been chased. It is believed to
330	  be the derivation following its DNA and the phrase pickup, which is a belief
331	  and is marked as one.
332	
333	---
334	
335	## Sources
336	
337	- [Introduction to Non-Chord Tones (Table 10.1.1) — Music Theory for the 21st-Century Classroom, Puget Sound](https://musictheory.pugetsound.edu/mt21c/NonChordTonesIntroduction.html)
338	- [Appoggiatura — Music Theory for the 21st-Century Classroom, Puget Sound](https://musictheory.pugetsound.edu/mt21c/Appoggiatura.html)
339	- [Embellishing tones — Open Music Theory](https://elliotthauser.com/openmusictheory/embellishingTones.html)
340	- [Dissonance handling — Species Counterpoint, Ars Nova](https://www.ars-nova.com/cpmanual/dissonancerules.htm)
341	- [Basic counterpoint — Fundamentals of Music Theory](https://fiveable.me/fundamentals-of-music-theory/unit-13/basic-counterpoint/study-guide/Eb0J3Eas0mR6dccG)
342	- [Melody Guidelines — The Donaldson Workshop](http://www.donaldsonworkshop.com/coriakin/melody.html) *(the pop/melodic search that did NOT produce a leap-to-dissonance rule; recorded because the absence is part of the finding)*
343	- `docs/genre-research/counterpoint-measured.md` §3 — this repo's own measurement of 382 Bach chorales
344	- `docs/genre-research/the-note-that-does-not-belong.md` — the companion law, decided the same way
345	
~~~

~~~
1	# The rule of three, and what a change on the third time should actually BE
2	
3	*Researched 2026-08-04, prompted by the user: "the program should have as its
4	base the three bar rule… a song should be working towards something and these
5	alterations should be in benefit towards it. Taking notes out can ruin the
6	motif and adding new notes can be problematic also if the motif is already
7	there."*
8	
9	**That is not thinking out loud, it is the central distinction in the
10	literature, and it has a name.** §2 is that name. The rest of this sheet is the
11	catalogue of moves that satisfy it and the measurement of what this program
12	does instead.
13	
14	Companions: `lofi-production.md` (where the repetition was measured),
15	`BACKLOG.md` §6a (the numbers).
16	
17	---
18	
19	## 1. THE RULE ITSELF — why the third time and not the second
20	
21	> "When you present a musical idea once, it intrigues the person playing it. The second
22	> repetition reinforces this idea, making it memorable. However, **by the third
23	> repetition, the brain tends to tune out** the information."
24	> [corpus:makebestmusic, The Rule of Three in Music Composition]
25	
26	> "Whenever a musical pattern, idea or motif is going to be **repeated for a
27	> third time, it's best to change it in some way**, or present a new idea…
28	> you'll surprise the person playing it (who would be expecting a repetition of the same
29	> pattern)." [corpus:omnionsound]
30	
31	So the count is: **state it, confirm it, then change it.** Two identical
32	passes are not a fault — they are what makes the third one land. The fault is
33	the third pass arriving unchanged.
34	
35	**And one concrete shape for the change, which matters more than it looks:**
36	
37	> "begin with a familiar musical idea, then **diverge from it halfway through
38	> the third play**" — so the person playing it still recognises what they are hearing
39	> before it turns. [corpus:makebestmusic]
40	
41	---
42	
43	## 2. THE USER'S POINT, WHICH IS SCHOENBERG'S — ornamental vs developing
44	
45	The user said the alterations should be "in benefit towards" where the song is
46	going. That is exactly the distinction Schoenberg drew, and the words are
47	almost the same:
48	
49	> **Ornamental variation**: "the variations usually seem to have nothing more
50	> than an **ornamental purpose**; they appear in order to create variety and
51	> often **disappear without a trace**."
52	
53	> **Developing variation**: "the changes proceed more or less **directly toward
54	> the goal** of allowing new ideas to arise"; the motive is "**transformed
55	> incrementally, away from or toward the original**"; and the successions
56	> "**build cumulatively to structure the entire piece rather than occurring
57	> arbitrarily**."
58	> [corpus:en.wikipedia/Developing_variation; corpus:mtosmt Salley, *MTO* 21.4;
59	> corpus:mtosmt Boss, *MTO* 21.3; corpus:bostonchambermusic]
60	
61	And the requirement the user put second — don't wreck the motif:
62	
63	> the motive must be "**retained, yet transformed**" — developed "through
64	> rhythmic articulation, suspension, inversion and intervallic combinations".
65	> [corpus:mtosmt Boss]
66	
67	**Retained, yet transformed.** Removing notes does not retain it. Adding notes
68	over a motif that is already stated does not transform it. Both are the failure
69	the user named, from the other two directions.
70	
71	---
72	
73	## 3. THE CATALOGUE — every named way to change a motif without destroying it
74	
75	The classical set, consistent across sources
76	[corpus:fiveable Motivic Development Techniques; corpus:vaia Motive
77	Development; corpus:tobyrush theorypages; corpus:study.com Motivic
78	Transformation]:
79	
80	| move | what it does | note count |
81	|---|---|---|
82	| **sequence** | the same shape, started on a different pitch | unchanged |
83	| **augmentation** | the same notes, each one longer | unchanged |
84	| **diminution** | the same notes, each one shorter | unchanged |
85	| **inversion** | every rise becomes a fall and vice versa | unchanged |
86	| **retrograde** | the shape played backwards | unchanged |
87	| **fragmentation** | one piece of the motif used on its own | fewer, but the piece is whole |
88	| **interval expansion / contraction** | the same contour, the leaps made wider or narrower | unchanged |
89	
90	**Read the right-hand column.** Six of the seven change NO notes at all — they
91	change *when*, *where* or *which direction*. That is the answer to "taking
92	notes out can ruin the motif": the tradition almost never takes notes out. It
93	re-presents the same material.
94	
95	### And the loop-music set, which is what this program actually writes
96	
97	[corpus:izotope How to Keep Repetition in Music Interesting;
98	corpus:beatkitchen From Loop to Track; corpus:soundonsound Unlooping The Loop;
99	corpus:sweetwater 5 Tips for Better Loop-based Music]
100	
101	- **Re-orchestrate.** "Rearrange loops so they repeat on **different
102	  instruments** while keeping the original melody and rhythm **intact**." The
103	  notes do not move at all; who plays them does.
104	- **Change ONE note, at the END.** "In a repeating bass line, **change the last
105	  note of the pattern every second or fourth time through to signal that the
106	  track is moving forward**." Minimal, preserves the motif entirely, and it is
107	  explicitly framed as a signal of *direction* — developing, not ornamental.
108	- **The slow cumulative sweep.** "Open a low-pass filter by a few percent each
109	  time the loop repeats — over 32 bars the sound brightens gradually, **a
110	  change too slow for people playing it to notice on any single pass, but the section
111	  feels different at bar 32 than at bar 1**." This is developing variation
112	  stated in engineer's language: nobody can point at the change, and the
113	  destination is audible.
114	- **The one-bar hole.** "Remove one element for one bar every 8 bars — drop the
115	  hi-hat for bar 7 and bring it back on bar 8 to create a **micro-break that
116	  resets player attention**." Note the shape: one bar, one element, and it
117	  comes back. That is not stripping the motif, it is punctuation.
118	- **Fills at the seam.** A fill "at the end of every 8 or 16-bar phrase to mark
119	  transitions without disrupting the flow."
120	
121	---
122	
123	## 4. WHAT THIS PROGRAM DOES INSTEAD — measured
124	
125	From `BACKLOG.md` §6a, measured on build `2026-08-03s`, 20 seeds a genre. How
126	much of the first statement each later statement repeats, note for note:
127	
128	```
129	  lofi         2nd chorus 97%   3rd chorus 95%   3rd verse 92%
130	  synthwave    3rd chorus 98%   4th chorus 99%
131	  dkc          3rd chorus 96%
132	  bladerunner  3rd chorus 99%
133	  acid         every statement 100% — identical, always
134	  plastikman   3rd verse 79% — the only genre that meaningfully varies
135	```
136	
137	**Three faults, and each maps onto something in §1–§3:**
138	
139	1. **It counts the wrong thing.** The change is demanded on the third statement
140	   of a *section function* (`seen[f] >= 3`, verse and chorus only). A lofi song
141	   has six sections, so a verse usually appears twice and the rule **never
142	   fires at all**. But the person playing it is counting passes of the four-bar loop: an
143	   8-bar chorus is two passes, and two choruses back to back is four. By §1's
144	   count the change is overdue by the second chorus and never comes.
145	
146	2. **When it does fire on a chorus, it TAKES NOTES OUT** (`stripHalf`). That is
147	   the one move the catalogue in §3 never makes and the one the user named as
148	   destructive. Measured result: the third chorus still plays 95% of the first
149	   chorus's notes — so it neither preserves the motif cleanly nor changes it
150	   audibly. The worst of both.
151	
152	3. **Nothing is cumulative.** Every variation here is ornamental in
153	   Schoenberg's exact sense: it appears, and it disappears without a trace. No
154	   change is a step along a path, and nothing about the third statement is
155	   *further along* than the second.
156	
157	**What the program already has and barely uses:** `Avar` — "same first half,
158	redrawn second half". That is §1's "diverge halfway through the third play",
159	already built, already correct in shape. It is applied to the third *verse*
160	only, which for most lofi songs means never.
161	
162	---
163	
164	## 5. WHAT TO BUILD, in the order the evidence supports
165	
166	1. **Count loop passes, not section names.** The demand should be raised on the
167	   third pass of the same material, which is what the person playing it counts (§1).
168	2. **Answer it by re-presenting, never by deleting.** `Avar`'s
169	   diverge-at-the-halfway-point is the model and already exists; the chorus has
170	   no equivalent and should get one. Re-orchestration (§3) is the cheapest
171	   move of all, because it moves no notes.
172	3. **Make at least one thread cumulative** so the third pass is further along
173	   than the second rather than merely different (§2). The slow filter sweep in
174	   §3 is the sourced form of this and needs no new note-level mechanism.
175	4. **Keep the one-bar hole as punctuation, not as the main answer** — one
176	   element, one bar, and it returns (§3).
177	
178	---
179	
180	## 6. WHAT THE SOURCES DO NOT SETTLE
181	
182	- **How big the change should be.** [corpus:makebestmusic] declines to say
183	  ("only that they should create a sense of surprise"). No source gives a
184	  percentage. So any amount this program picks is `[CHOSEN]`.
185	- **Whether the rule of three applies to a genre built on hypnotic
186	  repetition.** Every source above is about songs. Acid and minimal techno
187	  deliberately repeat — this repo's own `plastikman-minimal.md` quotes the
188	  method as micro-variation, and acid measuring 100% identical may be correct
189	  for it. **Do not apply the rule uniformly to all seven genres without
190	  deciding that per genre, in writing.**
191	- **No source found addresses generative or algorithmic music at all.** Every
192	  technique here is written for a human arranging by hand.
193	
194	---
195	
196	## Sources
197	
198	- [The Rule of Three in Music Composition — Make Best Music](https://makebestmusic.com/blog/the-rule-of-three-in-music-composition-a-gamechanger-for-producers)
199	- [The Rule Of Three In Music Composition — OmnionSound](https://www.omnionsound.com/the-rule-of-three-in-music-composition/)
200	- [Developing variation — Wikipedia](https://en.wikipedia.org/wiki/Developing_variation)
201	- [On Duration and Developing Variation — Salley, *Music Theory Online* 21.4](https://mtosmt.org/issues/mto.15.21.4/mto.15.21.4.salley.html)
202	- [Motivic Processes in Schoenberg's op. 11 no. 3 — Boss, *MTO* 21.3](https://mtosmt.org/issues/mto.15.21.3/mto.15.21.3.boss.html)
203	- [Brahms and Developing Variation — Boston Chamber Music Society](https://bostonchambermusic.org/brahms-and-developing-variation/)
204	- [Motivic Development Techniques — Fiveable](https://fiveable.me/music-theory-and-composition/unit-7/motivic-development-techniques/study-guide/JWOcNBgrI0AhrBYJ)
205	- [Motive Development — Vaia](https://www.vaia.com/en-us/explanations/music/music-theory/motive-development/)
206	- [Motivic Development (PDF) — Toby Rush](https://tobyrush.com/theorypages/pdf/en-us/motivic-development.pdf)
207	- [Motivic Transformation — Study.com](https://study.com/academy/lesson/motivic-transformation-definition-methods-examples.html)
208	- [How to Keep Repetition in Music Interesting — iZotope](https://www.izotope.com/en/learn/how-to-keep-repetition-in-music-interesting.html)
209	- [From Loop to Track — Beat Kitchen](https://beatkitchen.io/guides/electronic-music/10-from-loop-to-track/)
210	- [Unlooping The Loop — Sound On Sound](https://www.soundonsound.com/techniques/unlooping-loop)
211	- [5 Tips for Better Loop-based Music — Sweetwater](https://www.sweetwater.com/insync/5-tips-better-loop-based-music/)
212	
~~~

~~~
1	# FORM RESEARCH — the section taxonomy and the rule of three
2	
3	*Research for MK2's R1 (stage 2 FORM and stage 3's material family). Sources at the
4	foot. Everything here is either sourced or measured; where I am extrapolating to code
5	I say so.*
6	
7	---
8	
9	## PART 1 — THE SECTION POOL
10	
11	MK2 currently knows four: intro, verse, chorus, outro. The Harmonix annotation set —
12	which is one dataset's constrained label vocabulary, not the real taxonomy — already
13	shows those four cover only **63.3%** of 428 real sections. The actual pool, gathered
14	from the sources below, is about thirty, and they group by *function*, which is what
15	matters for generating them: several names are the same structural job in different
16	genre dialects.
17	
18	### A. OPENING — establish key, tempo, feel; make space for the entrance
19	
20	| section | what it is | notes |
21	|---|---|---|
22	| **Intro** | opening music; sets key, tempo, rhythmic feel, attitude | typically appears **once** |
23	| **Vamp intro** | the verse's groove *before the tune has entered* | the most common pop intro |
24	| **Riff intro** | a distinct figure heard only here | *Sweet Child o' Mine* |
25	| **Cold open** | no intro; starts on the hook or the downbeat | a choice, not an absence |
26	
27	### B. STATEMENT — the narrative body
28	
29	| section | what it is | notes |
30	|---|---|---|
31	| **Verse** | music repeats, content changes; carries the story | repeats multiple times |
32	| **Refrain** | a repeated *line* ending each verse — not a full chorus | the AABA-form payoff |
33	| **Head** | in jazz/simple forms: the whole tune, stated | solos follow, then head out |
34	| **A section** | the statement in AABA terms | |
35	
36	### C. APPROACH — build tension toward a payoff
37	
38	| section | what it is | notes |
39	|---|---|---|
40	| **Pre-chorus** (rise, climb, lift) | transition that raises anticipation into the chorus | **88%** go straight to a chorus (measured, Harmonix) |
41	| **Build-up / riser** | EDM: tension without the kick, filters opening | the drop's runway |
42	| **Turnaround** | 1–2 bars that *reset* energy between sections | jazz/blues origin; also the post-chorus energy dump |
43	
44	### D. PAYOFF — the point of the song
45	
46	| section | what it is | notes |
47	|---|---|---|
48	| **Chorus** | the invariant; the message, reduced and repeated | the thing that RETURNS |
49	| **Hook** | the memorable phrase itself; in modern pop often its own section | |
50	| **Drop** | EDM's chorus-equivalent: peak energy, main hook, full low end | |
51	| **Shout chorus** | big-band: the arranged climax after the solos | |
52	
53	### E. TAIL — what follows the payoff
54	
55	| section | what it is | notes |
56	|---|---|---|
57	| **Post-chorus** | follows the chorus; same character, distinguishable material | often the catchiest part of a modern record; **53%** go to a verse (measured) |
58	| **Outro-chorus** | the chorus repeated to close | |
59	| **Tag** | a short phrase repeated to end a section or the song | |
60	
61	### F. DEPARTURE — the sanctioned break from repetition
62	
63	| section | what it is | notes |
64	|---|---|---|
65	| **Bridge / middle eight** | a genuine left turn: new progression, new melody, often new key | usually appears **once**, after the 2nd chorus; **57%** return to a chorus (measured) |
66	| **Breakdown** | strips the arrangement; a deliberate anti-climax or mood change | EDM's palate cleanser; also a rock device |
67	| **Interlude** | a short connective passage between parts | |
68	| **Solo** | an instrumental feature over existing changes | |
69	| **Instrumental** | a section with the lead simply absent | this is the "lead sits out" section MK2 already has |
70	| **Collision** | two sections overlapping | |
71	| **Elision** | one section's cadence *is* the next one's downbeat | energy never drops |
72	
73	### G. CLOSING
74	
75	| section | what it is | notes |
76	|---|---|---|
77	| **Outro / coda** | the ending proper | typically **once** |
78	| **Vamp** | a repeated progression to fade or close over | |
79	| **Ad-lib** | improvised line over the outro, varying established material | |
80	| **False ending** | stops, then returns | |
81	| **Fade-out** | the arrangement continues, the level doesn't | |
82	| **Reprise** | an earlier section returns, usually altered | |
83	
84	### Structural DEVICES — arrangement events, not sections
85	Fill (into a change) · Empty / drop-out (the bar before an arrival) · Riser · Impact ·
86	Half-time or double-time treatment of an existing section.
87	
88	*These are not sections and must not be modelled as sections — in MK2 they belong to
89	stage 4's closed treatment set, applied to a copy.*
90	
91	### Measured behavior (Harmonix, 428 sections, 40 songs)
92	```
93	chorus 29.7% · verse 20.3% · end/outro 13.5% · intro 9.1% · bridge 6.5%
94	prechorus 5.6% · postchorus 4.4% · instrumental/solo/break ~4%
95	
96	verse      -> chorus 64%  prechorus 18%
97	prechorus  -> chorus 88%
98	bridge     -> chorus 57%
99	postchorus -> verse  53%
100	intro      -> verse  46%  chorus 36%
101	
102	66% of all sections RETURN later in the same song
103	```
104	
105	**The design consequence:** a section is not a label, it is a *function with a
106	transition profile*. The grammar is a Markov chain over functions, and each function
107	carries what it needs from the material family (a prechorus needs the chorus's
108	material to ramp *into*; a bridge needs permission to leave the progression).
109	
110	---
111	
112	## PART 2 — THE RULE OF THREE
113	
114	### What the sources actually say
115	
116	> "The rule of 3 applies usually to repeating a motif, section or device three times
117	> before changing to something else (as opposed to the more usual 2 or 4 times)."
118	
119	> "When an idea is presented once, it piques our interest. When it is repeated, the
120	> concept is reinforced. However, if it is repeated a third time, our brains may begin
121	> to tune it out."
122	
123	> "Whenever a musical pattern, idea or motif is going to be repeated for a third time,
124	> it's best to change it in some way, or present a new idea."
125	
126	So the operative rule: **state, repeat, and on the third occurrence something must
127	change.** Two identical hearings establish an idea; the third identical hearing is
128	where attention is lost.
129	
130	### What counts as "the change" — the sources give a ladder, weakest to strongest
131	
132	1. **Subtle**: instrumentation, dynamics, or rhythm alters while the material stays.
133	2. **Partial variation** — *the most useful one for a generator*: "start the concept
134	   the same way for the third repetition, but then take it in a different direction
135	   halfway through." Same opening, different ending. The person playing it is rewarded for
136	   recognising it *and* surprised.
137	3. **Full variation**: "introduce a new melody while retaining the same chords, or
138	   explore a different progression alongside a fresh melody."
139	4. **New idea entirely**: the departure — this is what a bridge *is*.
140	
141	### The part the sources do not say, and the reason this matters for code
142	
143	The rule applies **at every structural level at once**, and each level has its own
144	counter:
145	
146	| level | "the idea" | third occurrence falls at |
147	|---|---|---|
148	| motif | a figure inside a bar | its 3rd statement within the phrase |
149	| bar | a bar inside the loop | the 3rd identical bar |
150	| loop | the 4-bar cell inside a section | the 3rd pass through the section |
151	| section | verse / chorus as a whole | the 3rd verse, the 3rd chorus |
152	
153	And critically: **the change may be delivered at a different level than the repetition
154	that demanded it.** A third chorus does not need new chorus *notes* — it can be
155	answered by an arrangement change (a stripped first half, a doubled lead, a new
156	counter-line). That is exactly what "arrangement is development" means, and it is why
157	the rule belongs in MK2 as a *constraint published between stages*, not as a pass that
158	edits notes after the fact:
159	
160	```
161	stage 2 (form)   counts section repeats  -> demands variation of stage 3/4
162	stage 3 (loop)   counts bar/motif repeats -> varies its own material at write time
163	stage 4 (arr.)   counts loop passes      -> owns the treatment that answers the demand
164	```
165	
166	Nothing corrects anything. Each stage is *told* "this is the third time" and satisfies
167	it with the property it owns. That fits Law 3 exactly.
168	
169	### The trap to avoid
170	"Change on the third" does **not** mean "never repeat three times." The chorus is the
171	song's invariant and is *supposed* to come back recognisable — the measured data says
172	66% of sections return. The rule governs *identical, unbroken* repetition. A chorus
173	returning after a verse has had its repetition broken by the verse; its counter starts
174	over. Only consecutive, unvaried statements count.
175	
176	---
177	
178	## PART 3 — WHAT THIS MAKES R1
179	
180	1. **Stage 2 draws from a pool, via a grammar.** Section functions from the taxonomy
181	   above, weighted per genre (lofi does not need a shout chorus), sequenced by the
182	   measured Markov transitions, with a repeat-counter enforcing the rule of three on
183	   consecutive identical sections.
184	2. **Stage 3 produces a material FAMILY, not one loop.** A (verse), B derived from A
185	   (chorus), and a departure derived by the one operation permitted to leave the
186	   progression (bridge). Derivations are named functions — `sameChordsNewTune`,
187	   `reharmonise`, `answerOf`, `depart` — each one testable, each one *being* the
188	   relationship rather than checking it afterward.
189	3. **Stage 4 owns the treatments** that answer a rule-of-three demand it receives:
190	   strip, double, half-time, fill-into, empty-before, re-orchestrate.
191	
192	---
193	
194	## Sources
195	
196	- [Song structure — Wikipedia](https://en.wikipedia.org/wiki/Song_structure)
197	- [Post-chorus — Wikipedia](https://en.wikipedia.org/wiki/Post-chorus)
198	- [Turnaround (music) — Wikipedia](https://en.wikipedia.org/wiki/Turnaround_(music))
199	- [Coda (music) — Wikipedia](https://en.wikipedia.org/wiki/Coda_(music))
200	- [The Rule of Three in Music Composition — OmnionSound](https://www.omnionsound.com/the-rule-of-three-in-music-composition/)
201	- [Rule of 3? — Gearspace discussion](https://gearspace.com/board/songwriting/919688-rule-3-a.html)
202	- [The Rule of Threes — Music Production Chips](https://music-chips.com/chips/the-rule-of-threes.html)
203	- [Melody and The Power of Three — SongTown](https://songtown.com/on-songwriting/melody-and-the-power-of-three/)
204	- [Parts of a Song — Fender Play](https://www.fender.com/articles/techniques/parts-of-a-song-keep-it-straight)
205	- [Parts of a Song: Every Section Explained — Antares/AutoTune](https://www.antarestech.com/blog/what-are-the-parts-of-a-song)
206	- [Song Structure Explained — Song Cage](https://songcage.com/blog/song-structure/)
207	- [Essential Guide to EDM Song Structure — Hyperbits](https://hyperbits.com/blog/edm-song-structure/)
208	- [EDM Song Structure 101 — Unison](https://unison.audio/edm-song-structure/)
209	- [Song Sections and Forms — Chordal](https://www.learnchordal.com/how-to-read-charts)
210	- [14 Parts of a Song Explained — Guitar Lobby](https://www.guitarlobby.com/parts-of-a-song/)
211	- Measured: `corpus/.harmonix` via `corpus/harvest_structure.py` (Harmonix Set, CC BY-NC-SA 4.0)
212	
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
653	## §14 THE SHIRE THEME — AND THE CORRECTION THAT MATTERS
654	
655	**`lotr-themes-measured.md` §1 is built on a bad transcription.** The research
656	that found `Shire.abc` flagged it in the same breath:
657	
658	> *"CAVEAT: I could NOT reconcile this melody with the four other independent
659	> Concerning Hobbits/Shire transcriptions I extracted (which all agree on
660	> 1-2-3-5-3-2-1). Treat this file's accuracy as doubtful despite its Howard Shore
661	> credit line."*
662	
663	**Five independent transcriptions agree against it.** **[NOTATION]**
664	
665	| source | key | metre | tempo | melody |
666	|---|---|---|---|---|
667	| FOTR Complete Recordings transcription, p.8 | D major | 4/4 | ♩=90 | `D4 E4 F#4 F#4 A4 A4 F#4 F#4 E4 D4 D4` = **1 2 3 3 5 5 3 3 2 1** |
668	| flat.io full orchestral (16 parts) | D major | 4/4 | ♩=100 | `D5 E5 F#5 F#5 A5 A5 F#5 F#5 E5 F#5 E5` |
669	| flat.io piano (67 bars) | D major | 4/4 (one 2/4 bar) | ♩=105 | `D5 E5 F#5 A5 F#5 E5 F#5 E5` |
670	| engraved piano PDF | G major → A major at m13 | 4/4 | ♩=92→105 | modulates, 2/4 bar at m16 |
671	| tinwhistle tab | D major | — | — | independent confirmation |
672	
673	Four facts, and every one contradicts what hobbit synth was built on:
674	
675	1. **MAJOR PENTATONIC.** Pitch set D–E–F#–A(–B). *"no 4th, no 7th."* Corroborated
676	   independently: *"The melody follows a D major pentatonic scale, with the
677	   occasional major sixth"* functioning *"as a passing note."*
678	2. **Degrees `1 2 3 3 5 5 3 3 2 1`** — an arch to the fifth and back. Young's
679	   Schenkerian reduction says the same: *"a prolongation of tonic, featuring an
680	   arpeggio to scale-degree 5 and a concluding 2-1 neighbor motion."*
681	3. **4/4, not 3/4.**
682	4. **The bass is in the RELATIVE MINOR.** The 16-part score's contrabass, bar by
683	   bar: `B2 B2 D3 B2 G2 G2 E2 C#2→D2 E2 B2 B2 D3 B2 G2`. **A D-major tune over a
684	   Bm–D–G–Em bass.** The piano LH gives the chords outright: `D – A – Bm – G – A`
685	   = **I–V–vi–IV–V**.
686	
687	That fourth item is the answer to *"Hobbit Synth shouldn't be as dark and moody
688	as the Dungeon Synth"*: **a bright tune with the shade underneath it, at the same
689	time.** No new mode required.
690	
691	**And the caveat that must ride with all of it:** *"Everything here is a FAN
692	TRANSCRIPTION except the paywalled commercial editions. None is Shore's actual
693	manuscript."*
694	
695	### The head motif, three sources, two of them official
696	
697	> *"stepwise 1-2-3, then a leap to 5, over a static tonic triad, in major
698	> pentatonic with no 4th and no 7th"*
699	
700	- The Shire, D major: `D–E–F#–(F#)–A` = 1-2-3-3-5
701	- Rivendell / "Many meetings", C major: `C–D–E–E–G` = 1-2-3-3-5
702	- **In Dreams, C major (OFFICIAL Alfred):** `C–D–E–…–G` = 1-2-3-5
703	
704	The researcher singles this out as the one worth implementing. Note the honest
705	caveat: only *In Dreams* is official and it is quoted with an ellipsis.
706	
707	**And the mask relaxes after the head:** the continuation *"breaks the mask: C#5
708	(degree 7) and G4 (degree 4) appear in the second phrase."* So it is a constraint
709	on the theme statement, not on the whole part.
710	
711	## §15 THE OTHER THEMES
712	
713	All **[NOTATION]** unless marked.
714	
715	**Rohan** — flat.io full score, 31 bars, 4/4, ♩=76, 10 parts. Pitch set
716	{C,D,E,F#,G,A,B}: one sharp, **modal**. Flute melody m10-12: `C4 G4 F#4 | A4 A4
717	G4 A4 B4 E4 | B4 E4 B4 E5`. And the cello runs a **two-note ostinato**: `C3 D3 |
718	D3 C3 | C3 D3 | C3 D3 | D3 E3 | E3`.
719	
720	> **VERIFIER:** an earlier summary said the ostinato *"then opens into fifths."*
721	> It does not — it opens by a STEP to E3, and no fifth appears in the quoted
722	> range. Plausibly a conflation with the MusicXML `fifths=0` field on the same
723	> line. Dropped.
724	
725	The Rohan.abc file is separately a **6/8 jig in A major**: `AEc BEB|Bcc Ace|cdd
726	ecA|E2d dcB`. Rohan LEAPS where the Shire STEPS — fourths, fifths, sixths,
727	outlined triads. **That is one number per theme: an interval budget.**
728	
729	**Isengard** — **5/4, explicitly, in the file attributes.** 25 bars, ♩=80. The
730	core cell doubled at the octave between brass and strings: `F E F / E D A`. It is
731	then **transposed**: `C4-B3 / C4 held, then B3-A3-E3`. Chromatic rise at m21-22:
732	`C–C#–C#–D`. Scored on metal: *"bell plates, anvils, bass drum, taiko, and chains
733	beaten on piano strings."*
734	> *Caveat from the file: internal duration inconsistencies — "trust the PITCHES
735	> and the 5/4 meter more than the exact printed durations."*
736	
737	**Fellowship** — 52 bars, ♩=100, E major (fifths=4) modulating to fifths=0 at
738	m37. Violin: `(pickup F#5 G#5) A5 G#5 F#5 E5 F#5 G#5 | F#5 E5 D#5 | C#5 B4 B4 |
739	C#5 … F#5 G#5 | A5 G#5 A5 B5 A5 B5 | C#6` = degrees 4-3-2-1-2-3 | 2-1-7 | 6-5-5 |
740	6 … 2-3 | 4-3-4-5-4-5 | 6. Cello under it: `A3 E3 | F#3 E3 D#3 | C#3 B2 B2`. In
741	Alfred's published conductor score it is **3/4 at "Marcato ♩=168"**, concert C
742	major/A minor, with a 5/4 bar arriving at bar 16, timpani tuned F, A, C, E.
743	
744	**Gondor** — Titus, treble, 4/4, no key signature, 8 bars. m1 `D4` then `A4` —
745	a rising perfect fifth. m3 `C5` whole. m4 `A4` whole. m5 restates D4–A4. **m8
746	ends on E4, not the tonic.** Mode: **D Dorian** — the sixth degree is absent from
747	the melody and the seventh is never raised. Six chords, one triad per downbeat:
748	**Dm, G, F, B♭, C, A** — *"with the exception of D minor, all the chords are
749	major."*
750	> The corpus flags a conflict — Reitter's prose says D major — and adjudicates for
751	> Titus, who has notation. It also offers a reconciliation the earlier draft
752	> dropped: *"Titus's A major and Young's A minor are different passages/settings
753	> of the theme, which is itself a usable fact: the chord on that scale degree is
754	> mutable."*
755	
756	**The Ring** — Macksey EX.4, a full four-bar string score. Cello + bass divisi
757	`F3 + C4`; viola divisi `A♭3 + C4` in bars 1 and 3, `A♮3 + C4` in bars 2 and 4.
758	**Bar 1 is an F minor triad whose third flickers between A♭ and A♮.** Violins
759	doubled, melody across all four bars uses **three pitches only: A5, B5, C6.** A
760	minor pad, a raised fourth over it, a three-note cell oscillating on a semitone.
761	> *The bass motion `F3 → G#3 → F♮3` is flagged by its own reader as lower
762	> confidence than bar 1. The roman numerals in that article are the author's
763	> prose and were NOT verified against the staff.*
764	
765	**Ring and Mordor both open with a rising semitone** — Ring `B4 C5 B4 A4`, Mordor
766	`C#5 D5 C#5 B♭4` (Trumpet in C, cut time). They diverge on the third interval:
767	Ring falls a whole step, Mordor a minor third. Confirmed three ways.
768	
769	**Khazad-dûm** — 4/4, ♩=172, male choir. Opening ostinato `D2 + A2 + D3`: **a
770	bare open fifth doubled at the octave**, with F3 above. The dungeon-synth sound,
771	notated.
772	
773	**Gollum's Song** — ♩=104, K:C, with explicit modal mixture: `_b` against `=b` in
774	adjacent notes, plus `^f` and `^g`. Printed chords **Gm – Bm – Gm – Bm – Cm**,
775	LH triads verified. **Gm↔Bm is a chromatic mediant.**
776	
777	**Into the West** — **I–V–ii–vi**, cross-confirmed in two keys by two independent
778	official publications: C–G–Dm–Am (easy piano) and E♭–B♭–Fm–Cm (SATB octavo).
779	
780	**The Prophecy** — official Alfred, A minor, 4/4, *"Slowly, darkly ♩=60"*. A slow
781	i↔iv oscillation extending to Dm7, then F, then an F-minor modal mixture. The
782	meter sequence alternates 4/4–3/4–2/4–3/4–4/4–3/4–4/4, and the tempo map is
783	anchored to bars: **bar 25 "Brightly ♩=168", bar 57 "Moderately slow ♩=60".** In
784	the fast section the solo line is *"written almost entirely in accented whole
785	notes and dotted halves"* — **the tempo rises but the melodic rhythm slows.**
786	
787	**Prologue tempo map, in full:** ♩=50, 55, 72, 76, 90, 112, 124, 𝅗𝅥=88, then 72,
788	84, 112, 56, 114, 60.
789	
790	**Tempo across the whole extracted corpus clusters ♩=70 to ♩=118** — pastoral at
791	the top, laments at the bottom.
792	
793	## §16 CHROMATIC MEDIANTS — A LOOKUP TABLE
794	
795	**[NOTATION]** Lee & Lee print a 16-bar harmonic reduction of *Gollum's Song*,
796	one triad per bar, every transformation labelled: RP, T1, PRM, RP, P, T1, PRM, N,
797	PL, LP, PL, T1, PRM, PRM, PRM. Named pairs with affect: **G#m→Bm** (RP,
~~~

~~~
quence’s goal is a different chord.  
The only important metrical consideration is that alternate chords should fall on comparably strong beats. 
!
"
######################
######################
44
44 $
$
$
$
$
$
$
$
$
$
$
$
$
$$
$$
$$
$$
$$
$$
$$$
$
$
$
$
$
$
%
$
$
$$
$$
$
$
$$
$$
$
$
$$
$$
$
$♯
%
%
%%
$$
$$
!
"
###########
###########
44
44 $
$ $
$
$
%
$
$ $ $ $
$ $♯
%
$$
$$ $$ $$ $$
$$ $$
%%
$
$
!
"
###########
###########
44
44 $
$ $ $ $
$ $
%
$
$ $ $ $
$ $♯
%
$$
$$
$$
$$
$$
$$
$$
%%
!
"
###########
###########
44
44 $
$ $
$
$
%
$
$
$
$ $ $ $
$ $♯
%
$$
$$ $$ $ $$
$$ $$
%%
$
!
"
###########
###########
44
44 $
$ $
$
$
%
$
$
$
$ $ $ $
$ $♯
%
$$
$$ $$ $$ $$
$$ $$
%%
 
 
 
 h) 
Good — pattern corresponds with meter 
i)  
Bad — pattern conflicts with meter 
 
 
 
The descending thirds sequence 
 
The descending thirds sequence gets its nickname from the way that the established pattern is moved 
down a third for each repetition.  In its most typical guise, you will notice that the descending thirds 
sequence involves a stepwise bass line, and this bass line is harmonized with alternating root-position and 
first-inversion chords.  (Because of this pattern of inversions, the sequence is also commonly known as the 
descending 5-6 sequence.)   
 
 
 
 j) C: I V6  vi iii6   IV 
I6  
k) C: I V6  vi iii6   IV 
I6  
 
 
You will often find the same harmonic progression using only root-position chords.  (This variant is 
commonly associated with Pachelbel.) 
 
 
 
 l) C: I 
V  vi iii   IV 
I  
m) C: I 
V  vi iii   IV 
I6  
 
 
Notice that while this is a very smooth sequence, one of the four voices must leap quite a bit or there will 
be parallel octaves.  The sequence, which almost always begins on the tonic and places the odd-
numbered chords (I à vi à IV à ii) on strong beats, works well in both major and minor keys.  Do not 
raise 7^ in minor because the sequence is leading away from the tonic. 
 
!
"
#############
#############
$
$$$
34
34
%
%
%
$
$
%%
$$
%
%
%
$
$
%%
$$
%
%
%
$
$
%%
$$
%%
%
!
"
###########
###########
$
$ $ $
$ $ $
%
$
$ $ $
$ $ $♯
%
$$
$$ $$ $$
$$ $$ $$
%%
34
34
!
"
###########
###########
44
44
$
$
$
$
$
$
$$$
$
$
$
$
$
$
$$
$
$$
$
% %%
$
$
$
!
"
###########
###########
$
$
$
$
$
$
$$$
$
$
$
$$
$
$$
$$
$$
$$
$
44
44
% %%
!
"
###########
###########
44
44
$
$
$
$
$
$$$
$
$
$
$
$
$
$$
$
$$
$
$
$
$
$
% %%
!
"
###########
###########
$
$
$
$
$
$
% %%
44
44
$
$
$
$
$
$
$$
$$
$$
$$
$$
$$
 
The ascending 5-6 sequence 
 
Most sequences descend in pitch, but it also possible to ascend.  The ascending 5-6 sequence gets its 
nickname from the typical use of 5-6 motion in an upper voice over a gradually ascending bass.  In its 
most common guise, you will notice that the ascending 5-6 sequence involves a slow stepwise bass line, 
and this bass line is harmonized with alternating root-position and first-inversion chords (notice that when 
the bass is stepwise, there are two chords per bass note).  The established pattern is moved up a step for 
each repetition (and is therefore sometimes described as an ascending step or ascending second 
sequence — but beware, because the ascending circle-of-fifths sequence also moves up by step, so this is 
not a unique characteristic).  This pattern is a bit difficult to write in four voices, but very easy to write in 
three (example o). 
 
 
 n) C: I vi6   ii vii°6 iii I6   IV ii6   
o) C: I vi6   ii vii°6  iii I6  IV ii6  
 
 
Like the descending thirds sequence, the ascending 5-6 sequence may be varied through the exclusive 
use of root-position chords rather than the usual alternating pattern.  This variant is much easier for four-
part writing. 
 
 
 p) C: I 
vi   ii vii° iii 
I   IV ii  
q) C: I 
vi   ii 
vii°  iii 
I  IV ii 
 
 
It is possible to use root-position diminished triads as part of the sequence, but they should not be placed 
on metrically strong beats.  Avoiding them altogether is more typical.  This means that the sequence when 
used in minor should not start on the tonic because we will very quickly encounter ii° on a strong beat.  
The sequence can begin on almost any stable chord, however, so it is very useful.  (As we shall see later, 
the ascending step sequence is particularly likely to be chromaticized.) 
 
 
 
The ascending circle-of-fifths sequence 
 
The final (and least common) sequence type essentially reverses the first (and most common) sequence 
type.  Each chord’s root is a fifth higher than the previous chord’s root, so it is known as an ascending 
circle-of-fifths sequence.  The voice leading isn’t difficult, but the harmonic effect can be somewhat 
disorienting.   
 
!
"
###########
###########
44
44 $
%
%
%
%
$
%
%
$
%
%
$
%
%
%
%
$
$
$
$
%
%
%
%
!
"
###########
###########
44
44 $
$
$
$
$
$
$
$
%
%
%
%
%
%
%
%
!
"
###########
###########
44
44 $
$
$
$
$
$
$
$
$
$
$
$
$
$
$
$
$$
$$
$$
$$
$$
$$
$$
$$
!
"
###########
###########
44
44 $
$
$
$
$
$
$
$
%
%
%
%
$
$
$
$
$
$
$
$
%
%
%
%
It is particularly important not to use a diminished chord in this sequence.  The ascending circle of fifths 
therefore tends not to last very long.  It generally leads either from I to iii (in a major key — see example r) 
or from III to V (in a minor key — see example s).  Inversions are possible, but not very common. 
 
 
 
 r) C: I 
V   ii 
vi 
iii ii6    V4
6 -
- 3
5 
s) c: 
III VII   iv 
i  
V8—7  i 
 
 
 
Are other sequences possible? 
 
The vast majority of the sequences you see and hear will fall into one of these four broad categories.  If 
you find something you think is unique, it is probably either an elaboration or an obscure variation of some 
standard pattern.  However, other sequence types are possible.   
 
 
 
What is the purpose of a sequence? 
 
From a harmonic standpoint, a sequence is an elaborate way to fill in the progression from one chord to 
another.  For instance, the tonic can go straight to ii6, but this progression can be expanded through 
sequence. 
 
 
Decending circle of fifths: 
I   ( IV6   vii°   iii6   vi )   ii6    
 
Ascending step: 
I   ( vi6   ii   vii°6   iii   I6   IV )   ii6  
 
It is useful to know where common sequence types are most likely to begin and end. 
 
Descending circle of fifths: 
Usually tonic 
Possibly mediant 
Anywhere that forms a good 
progression, especially I, V, or ii 
Descending thirds: 
Almost always tonic 
IV, I, or ii 
Ascending 5-6: 
Any stable chord 
Any other stable chord that forms a 
good progression 
Ascending circle of fifths: 
In major keys, almost 
always tonic 
In minor keys, almost 
always mediant  
I usually leads to iii 
 
III usually leads to V 
 
As you will see in subsequent theory classes, sequences can also be very useful for modulating. 
 
  
!
"
###########
###########
44
44 $
$
$
$
$
$
%
$
$
$
$
$
$
$
$
$$
$$
$$
$$
$$
$$
$
$
%
!
"
###########
###########
44
44♭♭♭
♭♭♭
%
%
%
%
%
%
%
%
%%
%%
%%
%%
%&&♮
% &&&
&
%
%
~~~

~~~
Thus, both the standard and the tonal answer
in Figure 3 (A and C) have the diatonic in-
tervals [ + 2, -1, + 2, +1], but the first is
in C-major and the second is in A-minor.
2. The tonal answer might be thought of
as remaining in the same mode as the stan-
dard, which is exactly the way a tonal answer
is treated in a fugue. In that case, the pitches
of the mode remain fixed while the starting
pitch of the melody is shifted to a different
degree of the scale. Both melodies in Figure
3 (A and C) would remain in C-major, and
the difference between them would be that the
standard begins on the first degree and the
tonal answer on the sixth degree of the modal
scale.
I prefer the second of these characteriza-
tions for describing the cognitive processing
involved in the experiment presented below.
This is because the time interval between the
presentation of the standard and the tonal an-
swer is short. The standard is coded as being
in a particular major mode. When the listener
348
W. JAY BOWLING
hears the tonal answer immediately following
the standard, nothing in that comparison pat-
tern demands that he change mode. There-
fore, he hears the tonal answer in the same
mode as the standard. Diatonic interval pat-
tern (contour in a restricted sense) and mode
can function as features of the standard.
Tonal answers would then be difficult to dis-
tinguish from standard stimuli because they
share these two features. Exact transpositions
force the listener to change mode in midtrial.
Exact transpositions share the feature of
having the same intervals as the standards
when measured in semitones (that is, at the
level of tonal material). The experiment thus
brings these sets of feature similarities into
conflict with each other.
Lest too persuasive an argument here make
the results of the experiment seem a foregone
conclusion, let me introduce a plausible the-
ory that makes a different prediction from
the two-component scale-contour theory. It
could be, according to this theory, that con-
tours are not stored in memory independently
of interval sizes. Dowling and Fujitani got
their result because they used unnatural
atonal melodies. Atonal intervals are difficult
to remember, both because listeners have not
had much practice with them and because
they do not occur as part of an overlearned
scale schema. However, if we replicate Dowl-
ing and Fujitani using tonal materials, we
will get a very different result. The interval
sequences of tonal standard melodies will be
easily learned because they fall on a well-
known scale. Thus, changes in those intervals
will be easily noticed whether the change is
to an atonal melody or to a tonal melody in
another mode. The listeners should at least
do better than chance in discriminating ex-
act transpositions from tonal answers. (To
give this theory its due, I should note that
pilot work with a few professional musicians
convinces me that they can perform in the
way just described).
The two-component theory, on the other
hand, claims that even with tonal melodies,
contour (in the sense of ups and downs mea-
sured in diatonic intervals) and interval sizes
(measured in semitones at the level of tonal
material) are stored independently, the latter
simply as a mode label. Tonality can func-
tion as a cue to distinguish a tonal melody
from an atonal one. But changes in interval
size that leave tonality intact will be difficult
to notice.
=====RESULTS=====
Fujitani's (1971} Experiment 1
Group
Target 
Target
vs. 
vs. 
Target
tonal 
atonal 
vs.
answer 
contour random
Experienced
Inexperienced
Dowling and
Fujitani
.48
.49
—
.79
.59
.53
.84
.81
.89
Results
Table 1 shows the mean areas under the
MOC for the two groups and the three stimulus
comparisons. The main effect of stimulus
comparison type was significant, F(2, 38) =
77.35, p < .001. Distinguishing between tar-
gets and tonal answer lures was very difficult,
with chance performance in both groups. Dis-
tinguishing targets from atonal same-contour
lures was somewhat easier, and distinguishing
targets from random lures was easiest of all.
The Experience X Stimulus Type interaction
was significant, F(2, 38) = 8.01, p < .001,
mainly reflecting a difference of ability in
distinguishing targets from atonal same-con-
tour lures. The main effect of experience ap-
proached significance at the .05 level. This
modest effect is consonant with the modest
correlations found by Dowling and Fujitani
between performance on their task and ex-
perience.
General Discussion of Short-term Recognition
of Melodies
The present results illustrate the importance
of scale as well as contour in short-term rec-
ognition memory for melodies. This point is
brought out by comparison with the results
of Dowling and Fujitani (see Table 1). Both
studies found that the two melodies are rela-
tively easy to distinguish in that they have
different contours, with performance in the
.80s. Dowling and Fujitani's subjects found it
difficult to distinguish between two atonal
melodies with the same contour but different
interval sizes, performing at around the
chance level of .50. In the present experiment,
subjects found it easier to reject an atonal
comparison melody when it was preceded by
a tonal standard melody. This was especially
true of experienced subjects who presumably
have a firmly internalized modal system.
What subjects in the present experiment
found 
extremely 
difficult, 
performing 
at
chance, was distinguishing between exact
transpositions of comparison melodies to new
tonal keys and shifts of the contour along the
same diatonic scale as the standard. Both ex-
perienced and inexperienced subjects had
trouble with this task. Phenomenologically,
the comparison stimuli in Pairs A-B and
A-C of Figure 3 sound "natural," while the
comparison in Pair A-D sounds "strange."
This result illustrates the separateness of
the functions of contour and mode. The func-
tion of mode is not to fix a set of intervals
in semitones as belonging to a melody. If it
were, tonal answers would not be confused
with exact transpositions. The mode is simply
a framework on which the contour may be
hung. For brief melodies heard only once, the
point on the modal scale where the melody
begins is not taken into account. What sub-
jects seem to account for is that both the
mode and the contour are the same in the
two melodies.
This result should not be taken to mean
that diatonic scale intervals are somehow psy-
chologically equal. The concept of subjective
equality applies best to the level of the psy-
chophysical scale. The aesthetic purpose of
using differently sized pitch intervals in mo-
dal scales would be lost if all the intervals
~~~

~~~
Options for future development
Correction: Shift minor keys by −ω
2 , because a-
minor is closer to (has more notes in common with) F-major than to G-major. Alternative
harmonic measures:
• Use a diﬀerent squashing function, particularly f(x) = 1+x
2
to get non-zero distance
values for remote keys as well.
• Count notes in common as distance between the two keys
• Use harmonic distance measure from Woolhouse et al. (2006): r =
√
D + 1 with D
being the distance in steps on the circle of ﬁfths.
23
4.6
Hybrid similarity measures
In comparison with human similarity judgements (see Frieler & M¨ullensiefen, 2004), hy-
brid models consisting of two or more algorithmic chains of transformations and similarity
algorithm have proven to have far more predictive power than only one algorithmic chain.
This way pitch and duration information can be processed simultaneously. From the em-
pirical data three hybrid meaures were found as weighted sums of the outputs of individual
algorithmic chains which are named here according to table 6. The hybrid models diﬀer in
the context of a melody comparison. As the hybrid models result from optimisation with
linear regression their range is not limited to the range of 0 to 1. To ensure that a proper
similarity is received, squashing must be applied. Simile provides a general way to com-
bine all hard-wired similarity measures to arbritary weighted sums of two-way products of
similarity measures. Please refer to the Simile user manual for more information.
4.6.1
opti1
For comparisons where there are only variants of the same melody to compare opti1 is
deﬁned as follows:
opti1 = 0.479 · rawedw + 0.407 · ngrcoord
opti1 is sensitive to small changes in the pitch structure, and should be employed when
the context of a speciﬁc melody is ﬁrmly established and the similarity of ﬁne variants
ought to be measured.
4.6.2
opti2
opti2 is designed for situations where only the similarity of variants of one melody are of
interest, but diﬀerent melodies are also part of the context. The deﬁnition of opti2 is:
opti2 = 0.322 + 0.37 · rawedw + 0.24 · ngrcoord
opti2 consists of the same algorithmic chains as opti1, but with a diﬀerent relative weight-
ing of the individual chains and it comprises a constant as well. Overall it produces gen-
erally higher similarity values than opti2 .
4.6.3
opti3
opti3 can generally be applied in situations, where similar melodies should be spotted
within a context of similar and unsimilar melodies, e.g. in large melody collections. opti3
is deﬁned as:
opti3 = 0.505 · ngrukkon + 0.417 · rhythfuzz + 0.24 · harmcore −0.146
opti3 incorporates pitch and rhythmic information as well as harmonic content.
24
Options for future development: A general hybrid model scripting option might be
useful. Algorithmic similarity chains could be combined in diﬀerent types of prediction
models, e.g. weighted linear models, trees, or rule based models.
5
Phrase-based similarity calculations
To calculate the similarity of two melodies µ and ν a phrase-based similarity calculation
can be used as it is currently implemented in Simile. The idea behind this algorithm is
that two melodies can be conceptualized as a sequence of phrases rather than a sequence
of notes. The rationale behind this is the view that phrases are the true basic building
blocks of melodies, roughly analogous to words in natural language as compared to sylla-
bles. To exploit this idea for a phrase-based similarity measure, a modiﬁed Edit Distance
for sequences of phrases is used which is based on an arbitrary similarity measure. The
algorithm comprises the following steps
1. Split the two melodies µ, ν into phrases using the SimpleSegmenter algorithm ex-
plained in section 4.2.5. This yields two ”strings” µP, νP of phrases.
2. Apply a modiﬁed Edit Distance dσ to the two strings of phrases with a cost of 1 for
insertion and deletion of a phrase and a cost of 1 −σ(pi, qj) for substituting phrases
pi and qj, where σ can be any similarity measure for phrases.
3. The global similarity of the two melodies is calculated as:
σP(µ, ν) = 1 −
dσ(µP, νP)
max(|µP|, |νP|)
Options for future development: A method for phrase comparison that is not based
on Edit Distance would be desirable. Similar phrases that are in distant places in the
two melodies should be penalised less. A similarity measure that takes a matrix of phrase
similarities between the two melodies into account might be possible.
6
Overview of algorithms and algorithmic chaims im-
plemented in Simile
Table 6 gives a short deﬁnition of all similarity measures - or more precisely all algo-
rithmic chains - implemented in Simile, listing their abbreviated name and the speciﬁc
combination of the basic transformations, main transformations, and similarity algorithms
25
=== transformations ===
15:Pitch information . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
27:Pitch intervals . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
30:Rhythmic quantisation and interonset intervals
34:Rhythmical weighting (RW) . . . . . . . . . . . . . . . . . . . . . .
63:Pitch ranking . . . . . . . . . . . . . . . . . . . . . . . . .
66:Contourisation . . . . . . . . . . . . . . . . . . . . . . . .
69:Interval classes . . . . . . . . . . . . . . . . . . . . . . . .
72:Interval direction . . . . . . . . . . . . . . . . . . . . . . .
75:Fourier transform . . . . . . . . . . . . . . . . . . . . . . .
85:Gaussiﬁcation . . . . . . . . . . . . . . . . . . . . . . . . .
244:Pitch information
275:intervals, rhythmic quantisation, Interonsets intervals, and rhythmical weighting.
277:Pitch intervals
284:Rhythmic quantisation and interonset intervals
318:Rhythmical weighting (RW)
319:Rhythmical weighting is way to assign weights to pitches in a pitch sequence that reﬂect
324:pitch sequence with a smallest rhythmical unit of a semi-quaver as: c c a a a a
349:pitches of the two melodies.
357:pitch values.
449:Pitch ranking
456:Contourisation
457:Contourisation is a method for deriving pitch values from a
459:pitches. There are three variants of the contourisation algorithm implemented in Simile
478:contour.
492:Interval classes
493:Pitch intervals are assigned to interval classes because it is
499:Interval (in semitones)
529:Interval direction
545:Fourier transform
560:Gaussiﬁcation
~~~

~~~
some way, and I will do so here. Scale-degree probabil-
ities are simply modeled in a statistical fashion based
on their corpus frequency, in both the Markov and
Gaussian models. The possibility of a Markov approach
to scale degree (conditioning scale degrees on previous
scale degrees) will also be considered.
Figure 1 shows the distribution of melodic intervals in
the Essen Folksong Collection, a corpus of over 6,000
European (mostly German) melodies (Schaffrath,
1995). Log (base 2) probabilities are used, to bring out
distinctions between small values. This figure gives
insight into the motivation for both the Markov and
Gaussian approaches to melodic interval. The principle
of pitch proximity is clearly reflected, in that larger
intervals are generally less frequent than smaller ones.
There are also many local ups and downs in the distri-
bution; for example, whole steps (þ2 and -2) are more
than twice as common as half steps (þ1 and -1), despite
being larger. These local fluctuations might seem difficult
to capture by any simple rule, thus favoring a Markovian
approach that represents the frequency of each interval. It
-4
-2
0
-15-14-13-12 -11-10 -9 -8 -7 -6 -5 -4 -3 -2 -1
0
1
2
3
4
5
6
7
8
9 10 11 12 13 14 15
Log P
Interval
FIGURE 1. The distribution of melodic intervals in the Essen Folksong Collection. Probabilities are shown in log base 2.
Probabilistic Models of Melodic Interval 87
together is a standard approach in multiple-viewpoint
modeling (e.g., Pearce, Conklin, & Wiggins, 2005; Pearce
& Wiggins, 2006), though other approaches have also
been used.
The Gaussian model, likewise, computes a probability
for each note based on its scale degree and intervallic
context, but does so in a rather different way. The prob-
ability of an interval is computed using two functions.
One is a proximity profile, a normal distribution cen-
tered around the previous pitch; another is a range pro-
file, also a normal distribution, centered around the
mean pitch of all the preceding notes in the melody
(this is taken as an approximation of the range of the
backs off to the octave. This method is not strictly legit-
imate, since the probability of an event is only set once it
is seen, and the probabilities of all possible pitches cal-
culated in this way may sum to slightly more than 1. In
effect, this approach is over-generous to the Markov
model, slightly overstating the true probability that it
assigns to the corpus. Because of the large size of the
training sets, however, backoff rarely occurred: with the
Essen corpus, for example, only 1.2% of the interval
trigram tokens encountered in testing were unseen in
training. Alternative backoff methods were also tried
(such as computing each trigram probability as
a weighted sum of observed trigram and bigram prob-
abilities), and it was found that this resulted in very little
difference in cross-entropy.
Another problem for both models is what to do at the
model yielded better performance when major and minor
melodies were separated; therefore this was done in the
tests reported below.
TESTING ON SEQUENTIAL CORPUS DATA
Four corpora of melodies were used to test the two
models: (1) The folksong corpus consists of 6,208 songs
from the Essen Folksong Collection (Schaffrath, 1995).
(2) The chorale corpus consists of 159 Bach chorale
melodies.1 (3) The classical corpus contains 9,788
instrumental melodies from Barlow and Morgenstern’s
(1948) Dictionary of Classical Themes, encoded in
Humdrum notation by David Huron. (4) The rock cor-
pus consists of 162 melodies from songs on Rolling
Stone magazine’s list of the ‘‘500 Greatest Songs of All
Time’’ (Rolling Stone, 2004; Temperley & de Clercq,
2013). (The entire rock corpus contains 200 melodies;
songs with modulations were excluded, as were songs
containing no melodic information, such as rap songs.)
In the folksong, chorale, and classical corpora, melodies
are labeled with major and minor keys; different scale-
degree profiles for major versus minor melodies were
learned in training and applied in testing. In the rock
corpus, the melodies are labeled with tonal centers but
not with major and minor (since this distinction is
problematic in rock), thus a single set of scale-degree
probabilities was applied to all songs.
used by the model can vary depending on the context
(Pearce & Wiggins, 2004).
It might also be possible to modify the Gaussian
model to improve its performance. One could maintain
the factors of pitch proximity and range, but build in
further principles to better fit the data, such as the fact
that steps are more likely to be descending and skips are
more likely to be ascending (Huron, 2006). Also of
interest here is the concept of inertia, also known as
process (Larson, 2004; Narmour, 1990): a melodic step
(ascending or descending major or minor second) is
highly likely to be followed by another step in the same
direction. In the Essen corpus, for example, 43.1% of
steps are followed by a same-direction step, but only
18.3% by a different-direction step. The Gaussian
model, as currently defined, does not capture this phe-
nomenon; the Markov model does capture it, assuming
a first-order (or higher) model of interval. One could
incorporate inertia into the Gaussian model with a spe-
cial rule that boosted the probability of an ascending
step following a previous ascending step (and similarly
for descending steps). This might well improve the per-
formance of the Gaussian model, while avoiding the
large number of parameters required by a fully Markov-
ian approach.
Other factors influencing the structure of melodies
might well be incorporated into the models presented
here. One important factor is the repetition of patterns,
such motives and themes. The multiple-viewpoint
approach (Conklin & Witten, 1995) offers a solution
to this problem by combining a ‘‘long-term’’ model,
embodying general knowledge about the style (such as
the kind of knowledge discussed in this paper), with
a ‘‘short-term’’ model (also Markovian) trained only
on previous notes within the current melody. Another
important factor is harmony. It is generally assumed
~~~

~~~
Web search results for query: ""break the sequence" OR "breaking the sequence" music theory rule sequence should not continue too long last statement altered cadence Piston Kostka"

Links: [{"title":"Student Edition Sample Chapter","url":"https://www.mheducation.com/content/dam/mhe/prek12/documents/pdp/kosta-tonal-harmony-sample-chapter.pdf"},{"title":"Tonal Harmony (Kostka) - McGraw Hill","url":"https://www.mheducation.com/prek-12/program/tonal-harmony-kostka/MKTSP-GFS02M0.html"},{"title":"Stefan Kostka","url":"https://en.wikipedia.org/wiki/Stefan_Kostka"},{"title":"TONAL Harmony With an Introduction to Post-Tonal Music Stefan Kostka","url":"https://www.mheducation.com/unitas/school/program/ap/kostka-tonal-harmony/kostka-tonal-harmony-program-flyer.pdf"},{"title":"Tonal Harmony Chapter Summary | Stefan Kostka Tonal Harmony","url":"https://www.bookey.app/book/tonal-harmony"},{"title":"Kostka, 8e Tonal Harmony Correlation to AP Music Theory ...","url":"https://www.mheducation.com/unitas/school/program/ap/kostka-tonal-harmony/kostka-8e-correlation.pdf"},{"title":"live-work.immigration.govt.nz","url":"https://live-work.immigration.govt.nz/_58236604/uabsorbo/mmeasurep/cimplementj/walter+piston+harmony+3rd+edition.pdf"}]

Let me search more specifically for the "break the sequence" rule:

Links: [{"title":"Personalized Popular Music Generation Using Imitation and Structure","url":"https://arxiv.org/pdf/2105.04709"},{"title":"Electronic musical instrument providing automatic ensemble performance","url":"https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/4429606"},{"title":"Plagal cadence","url":"https://en.wikipedia.org/wiki/Plagal_cadence"},{"title":"Break (music)","url":"https://en.wikipedia.org/wiki/Break_(music)"},{"title":"Music Theory Review 2 Flashcards","url":"https://brainscape.com/flashcards/music-theory-review-2-506825/packs/1056707"},{"title":"graphsearch.epfl.ch","url":"https://graphsearch.epfl.ch/en/concept/411309"},{"title":"Advanced - Harmonic Cadences Flashcards","url":"https://brainscape.com/flashcards/advanced-harmonic-cadences-667499/packs/47744"}]

Let me try a more specific search combining these terms:

Links: [{"title":"Diatonic Sequence Handout","url":"https://myweb.fsu.edu/nrogers/Handouts/Diatonic_Sequence_Handout.pdf"},{"title":"Music Theory Melodic Organization Chapter 6 Flashcards | Quizlet","url":"https://quizlet.com/59414898/music-theory-melodic-organization-chapter-6-flash-cards/"},{"title":"How to Develop a Melody Using Sequencing | The Music Composition Blog","url":"https://themusiccompositionblog.com/2013/10/15/how-to-develop-a-melody-using-sequencing/"},{"title":"Sequences - Music Theory Academy - melodic and harmonic sequences","url":"https://www.musictheoryacademy.com/composing-music/sequences/"},{"title":"7.2 Melodic Material: Create/Vary/Repeat and Sequences: Tutorial – Comprehensive Musicianship, A Practical Resource","url":"https://iastate.pressbooks.pub/comprehensivemusicianship/chapter/7-2-melodic-sequences-tutorial/"},{"title":"AP Music Theory 6.6: Melodic Sequences | Fiveable","url":"https://fiveable.me/ap-music-theory/unit-6/melodic-sequence/study-guide/0UWZhCHSSHysPILNPUFK"},{"title":"Sequence (music)","url":"https://en.wikipedia.org/wiki/Sequence_(music)"}]

Great! I found relevant information. Now let me search specifically for Piston's treatment of this rule:

Links: [{"title":"Harmony [PDF] [2tm64udv1ob0]","url":"https://vdoc.pub/documents/harmony-2tm64udv1ob0"},{"title":"Walter Piston - Harmony | PDF","url":"https://www.scribd.com/doc/315488263/Walter-Piston-Harmony"},{"title":"Harmony by Walter Piston | Goodreads","url":"https://www.goodreads.com/book/show/445368.Harmony"},{"title":"Harmony - Walter Piston; Mark DeVoto (rev.) - pdf","url":"https://harmony.liber3.eth.limo/"},{"title":"Secondary chord - Wikipedia","url":"https://en.wikipedia.org/wiki/Secondary_chord"},{"title":"Walter Piston - Harmony (exercises correction)","url":"https://www.pianostreet.com/smf/index.php?topic=62894.0"},{"title":"Symphony No. 1 (Piston)","url":"https://en.wikipedia.org/wiki/Symphony_No._1_(Piston)"},{"title":"Walter Piston- Harmony: What the heck has happened??? - Piano World Piano & Digital Piano Forums","url":"https://forum.pianoworld.com/ubbthreads.php/topics/1520045/re-walter-piston-harmony-what-the-heck-has-happened.html"},{"title":"Symphony No. 4 (Piston)","url":"https://en.wikipedia.org/wiki/Symphony_No._4_(Piston)"}]

Based on my search results, I found relevant information about the music theory rule regarding sequences. Here's what I discovered:

"Three and out" is the general rule for sequencing, meaning whatever you decide to sequence should only be sequenced three times; anything longer feels predictable and tedious. This is also known as the "rule of 3," which repeats sequences three times before moving on to different material, limiting predictability and keeping interest going.

Additionally, most sequences contain no more than three or four segments.

The practice of altering the final statement is addressed in the principle that it is advisable to vary the sequences by changing some of the notes or inverting one of the sequences to keep the listener off balance, particularly with the third sequence.

While I found extensive information about Piston and Kostka as music theory authors and their influential textbooks on tonal harmony and sequences, I was unable to locate the specific phrasing "break the sequence" or a direct quotation from either Piston or Kostka's works that explicitly uses this exact terminology in relation to the rule about sequences not continuing too long. However, the principles I've cited above represent the standard music theory teaching about limiting sequence length and altering the final statement, which aligns with the concept you're asking about.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
626	## §6 What makes a folk drum part a PART and not a loop
627	
628	`rhythm-phrasing.md` §1 has the producer answer — the eight-bar A B A C A A D
629	sentence. This is the folk and processional equivalent, and it turns out to work
630	at a **different scale**: the folk unit of variation is not the bar, it is **the
631	strain and the time-through**.
632	
633	### 6.1 The container: eight bars, two parts, and three times round
634	
635	> "Most Irish tunes are composed of '**phrases**' or '**parts**' each consisting
636	> of **eight measures**. Most Irish tunes have two parts. The first part (eight
637	> measures) is called the 'A' part. The next part is called the 'B' part. … Often
638	> tunes are played with **each part repeated once** before going on to the next
639	> part (**A – A – B – B**)."
640	> — [corpus:ballard]
641	
642	> "The most common exception to this pattern is **when you are playing for
643	> dancers**. Then it is common to play an **extra 'A' part** before going into
644	> the standard A-A-B-B. Sometimes the dancers will refer to this as '**eight for
645	> naught**'. This gives them a chance to get into position and prepare for the
646	> speed of the tune."
647	> — [corpus:ballard]
648	
649	> "Anticipate the end of a tune in the set after two times around, although
650	> '**three times through**' is the norm."
651	> — [corpus:spokanesessions]
652	
653	**AABB, three times through, with an extra unaccompanied A at the front when
654	people have to start moving.** That last one is remarkable — it is a sourced
655	*intro whose only job is to let the walking start*, which is precisely what a
656	travelling genre's first eight bars are for.
657	
658	### 6.2 The variation lives in the ornament, and it changes every time round
659	
660	> "If you do try to improvise, **listen to one repeat of the tune before joining
661	> in**, and try to figure out the large-scale structure of the tune." … "That's
662	> your template; **everything you do should fit that structure**."
663	> — [corpus:ceolas-beginner]
664	
665	That is the folk statement of the rule this program already holds at bar scale:
666	the variation is drawn against a fixed template, not freely.
667	
668	### 6.3 The processional answer: the strain, not the bar
669	
670	Military march form is the same question answered by a tradition that writes its
671	variation down.
672	
673	> **First Strain:** "is repeated once, **sometimes with added parts such as
674	> counter-melodies**."
675	> **Second Strain:** "is usually repeated once, sometimes twice; but some marches
676	> … omit this repeat."
677	> **Trio:** "the main melody of the march. It typically is played **legato style
678	> in a softer dynamic** and features **woodwinds more than brass**."
679	> **Breakstrain:** "**loud, intense, and marcato**" and "usually 16 bars long."
680	> **Grandioso:** "the grand finale, is played through **much more loudly than
681	> previous runs of the trio**. It sometimes **adds yet another counter-melody or
682	> obligato**."
683	> **Stinger:** "a I chord played in unison **on the downbeat after a quarter
684	> rest**."
685	> — [corpus:wikipedia-americanmarch]
686	
687	**Read as a sectional arc this is: repeat-with-addition → contrast-by-softening →
688	one loud rough section → final statement louder with one more layer → a single
689	struck chord after a gap.** Every one of those is a device
690	`drum-sectional-arc.md` §1 already names — addition, subtraction, substitution —
691	but placed by a form rather than by a coin flip, and it answers the question that
692	sheet's §2 left open ("fullest or thinnest?") **for the processional case: the
693	last statement is the fullest, and it is fullest by ADDING A LAYER, not by
694	playing harder.**
695	
696	And the strain forms themselves, from a Marine Band clinic handout:
697	
698	> Short Trio: "Introduction / 1st str. / 2nd str. / 3rd str. / 4th str. — var. ||:
699	> 16 :|| ||: 16 :|| ||: 16 :|| ||: 16 :||"
700	> Long Trio: "Introduction / 1st str. / 2nd str. / 3rd str. / **Break** / 3rd str.
701	> — var. ||: 16 :|| ||: 16 :|| ||: 16 :|| ||: var. 16 :||"
702	> — [corpus:marineband-fettig-warfield], *Making the March King*, PDF extracted
703	> 2026-08-13
704	
705	**Sixteen-bar strains, and the long-trio shape puts a Break between two
706	statements of the same strain** — the third statement of a strain is separated
707	from the second by a deliberately harsh interruption. That is the folk/orchestral
708	answer to "what changes on the third statement": *something is put in front of
709	it*.
710	
711	### 6.4 The stinger is the End Cap
712	
713	Adams names an "**End Cap**" figure in the Shire material [corpus:adams, cue 2].
714	The march tradition names a **stinger**, "a I chord played in unison on the
715	downbeat after a quarter rest" [corpus:wikipedia-americanmarch]. In a 4/4 bar
716	that is a rest at step 0 and a hit at **step 4** of the bar after the last —
717	a concrete, sourced, sectional-close figure the program does not have.
718	The identification of Adams' End Cap with the march stinger is mine. `[CHOSEN]`
719	
720	---
721	
722	## §7 What a table could take from this directly
723	
724	Every row here is sourced above; nothing new is introduced.
725	
~~~

~~~
/home/user/DeckardsMusicBox/docs/:
total 672
drwxr-xr-x 5 root root   4096 Aug 10 18:01 .
drwxr-xr-x 8 root root  12288 Aug 13 02:01 ..
-rw-r--r-- 1 root root  15592 Aug 10 12:24 ARRANGEMENT.md
-rw-r--r-- 1 root root   7243 Aug  7 13:07 AUDIT-2026-07-27.md
-rw-r--r-- 1 root root 151286 Aug 13 00:07 BACKLOG.md
-rw-r--r-- 1 root root  13178 Aug 10 12:25 CODE_REVIEW.md
-rw-r--r-- 1 root root   5579 Aug  7 13:07 CORPUS_SOURCES.md
-rw-r--r-- 1 root root  21387 Aug 10 12:25 DEEP_RESEARCH_ARRANGEMENT.md
-rw-r--r-- 1 root root  10893 Aug 10 12:25 FORM-RESEARCH.md
-rw-r--r-- 1 root root   2767 Aug  7 13:07 GENRES.md
-rw-r--r-- 1 root root 264323 Aug 10 18:01 HANDOFF-MK2.md
-rw-r--r-- 1 root root   8113 Aug  7 13:07 LICENSING.md
-rw-r--r-- 1 root root  18812 Aug 10 12:25 LOOP_TO_SONG.md
-rw-r--r-- 1 root root  25800 Aug 10 12:26 MASTERDOC-REBUILD.md
-rw-r--r-- 1 root root   6314 Aug 10 12:25 ROADMAP-MK2.md
-rw-r--r-- 1 root root  36817 Aug 10 18:01 START-HERE.md
-rw-r--r-- 1 root root   9489 Aug 10 12:25 START-PROMPT.md
-rw-r--r-- 1 root root  16005 Aug  7 13:07 STORY_AND_MATERIAL.md
-rw-r--r-- 1 root root   8284 Aug 10 12:26 SYNTH-RESEARCH.md
-rw-r--r-- 1 root root   6641 Aug 10 12:24 UI_10X.md
drwxr-xr-x 3 root root   4096 Aug 13 02:10 genre-research
drwxr-xr-x 2 root root   4096 Aug  7 13:07 reference
drwxr-xr-x 2 root root   4096 Aug  7 13:07 spec

/home/user/DeckardsMusicBox/docs/genre-research/:
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
~~~

~~~
        const count = cnt[0] + Math.floor(rng() * cnt[1]);
        const steps = [];
        /* ── AND THE PHRASE ENDS IN SILENCE, WHERE A GENRE ASKS FOR IT ───────
           A phrase here is TWO bars and the second is already the "breath" --
           it draws 1-2 notes where the first draws 3-4. But those notes could
           land anywhere in the bar, including the last sixteenth, so the tune
           never actually stopped. MEASURED, lofi, 30 seeds: it rests in 5.3% of
           the bars it is rostered for -- one bar in nineteen.

           Three sources, and their whole subject is the space rather than the
           notes: "insert rests between phrases to give the person playing it a moment of
           reflection" [corpus:mysticalankar]; "leave space between phrases...
           silence matters more in lo-fi than in almost any other genre"
           [corpus:songer]; "negative space" [corpus:melodigging]. What they
           describe is not a RATE, it is a SHAPE -- phrase, rest, phrase -- and
           a tune at a defensible note count that never stops is still
           relentless. docs/genre-research/lofi-comp-and-lead.md §6.

           `breathLast` is the last sixteenth a breath bar may put an onset on.
           The pool is FILTERED from the one the genre already declares rather
           than being a second list, so a genre that changes its onsets changes
           both together and there is nothing to go stale. Absent means the
           whole bar, which is what every genre had, so six of them are
           byte-identical.

           IT SPENDS THE SAME DRAWS EITHER WAY [Law 3]: the loop calls `wpick`
           exactly `count` times as long as the pool cannot run out, and 1-2
           notes into a four-seat pool cannot. The stream position after this
           bar is identical; only which seats are taken changes.

           NO SOURCE GIVES A LENGTH FOR THE REST. Every one of them says it
           exists and not one measures it, so the number is [CHOSEN] and is
           labelled so in the table. */
        const last = isBreath && TH.breathLast != null ? TH.breathLast : 15;
        const poolCopy = onsetPool.filter(x => x[0] <= last);
        while(steps.length < count && poolCopy.length){
          const st = wpick(rng, poolCopy);
          poolCopy.splice(poolCopy.findIndex(x => x[0] === st), 1);
          steps.push(st);
        }
        steps.sort((a, z) => a - z);
        for(let i = 0; i < steps.length; i++){
          let move = (moveBias && moveBias.length > dna.length)
                   ? moveBias[dna.length]                            // derivation: follow given DNA
                   : wpick(rng, [[0, 2], [dir, 5], [dir * 2, 2], [-dir, 2]]);
          /* the DNA is recorded as DRAWN, before the law narrows it: B is
             derived from A's shape, and A's shape is what A wanted, not what
             the chord under it allowed. */
          if(dna.length < 4) dna.push(move);
          if(hang){
            /* one scale step, keeping whatever direction was asked for -- so a
               derivation still follows its DNA's contour, just at a step. A
               repeat does not answer a dissonance, so it becomes a step in the
               direction the dissonance arrived by. */
            move = move !== 0 ? (move > 0 ? 1 : -1) : (hangDir || dir);
          }
          const plannedDur = i + 1 < steps.length ? Math.max(1, steps[i + 1] - steps[i]) : (isBreath ? 4 : 3);
          /* ── AND A DISSONANCE MUST BE ARRIVED AT ───────────────────────────
             The law above is the DEPARTURE half and it has been here since
             2026-07-30. This is the other half, and until now nothing in this
             program asked how a dissonance was REACHED.

             The taxonomy sorts every figure by its approach, and that is the
             whole argument [corpus:musictheory.pugetsound Table 10.1.1;
             corpus:openmusictheory]: of eight figures SEVEN are approached by
             step or by repetition -- passing, neighbour, escape, anticipation,
             suspension, retardation, pedal -- and exactly ONE is approached by
             a leap. That one is the appoggiatura, and every source that admits
             it attaches the same condition: it has to step out. Species
             counterpoint states the same rule from the other side, as "No leap
             to dissonance" with the appoggiatura named as the exception
~~~

~~~
Memory for Melodic Contour
For everyone except the small percentage
of the population having absolute pitch, well-
known melodies must be stored as sequences
of pitch intervals between successive notes
(Deutsch, 1969). In this section, I have as-
sembled evidence that memory for the con-
tour (the ups and downs of the melodic
intervals) can function separately from mem-
ory for exact interval sizes. That is, the con-
tour is an abstraction from the actual melody
that can be remembered independently of
pitches or interval sizes. This is true for mel-
odies in both short-term and long-term
memory.
Retrieval from Short-term Memory
The contours of brief, novel atonal mel-
odies can be retrieved from short-term mem-
ory even when the sequence of exact intervals
cannot. This point is illustrated by an ex-
periment by Dowling and Fujitani (1971, Ex-
periment 1). They used a short-term recogni-
tion memory paradigm in which the standard
MEMORY FOR MELODIES
347
stimulus on each trial was a randomly gen-
erated five-note melody having small pitch
intervals between successive notes. The com-
parison stimulus followed the standard after
a brief pause. Three types of comparison mel-
odies were the same as the standard in both
contour and pitch intervals, or had the same
contour but different intervals, or were dif-
ferent in both contour and intervals (i.e.,
were novel random sequences). These are il-
lustrated in Figure 3, Sections F-I. Different
groups of subjects had the task of distinguish-
ing among the following types of comparison
melody: exactly the same versus random, ex-
actly the same versus same contour, and same
contour versus random. Half the subjects were
given comparisons starting on the same pitch
as the standard; the other half had com-
parisons whose starting note was transposed
to another pitch level. The results showed that
when the comparison starts on the same pitch
level as the standard, exact-same comparisons
are easily distinguished from either random
comparisons or same-contour, different-inter-
val comparisons. In other words, it was easy
to reject any comparison stimulus that did
not contain exactly the same pitches as the
standard. When the comparison melodies were
transposed, however, exact-same targets and
same-contour comparisons were easily dis-
tinguished from random ones but almost im-
possible to tell apart. Listeners responded on
the basis of the presence or absence of the
contour and were unable to recognize the
sameness of intervals when these were added
to the contour.
Thus, when the listener is trying to retrieve
an exact set of intervals from memory, the
best he can do under the above conditions is
retrieve the contour. It is critical to this re-
sult that the target melodies be atonal, that
is, not using the pitches of a musical scale
familiar to the subjects. Frances (1958) found
alterations in tonal melodies easier to detect
than alterations in atonal melodies. A major
theme in the present article is that there are
two components at work in the normal process
of melody recognition: contour and scale.
Bowling and Fujitani (1971, Experiment 1)
explored the extreme case where the role of
the scale had been all but eliminated. They
found contour recognition to be completely
dominant over pitch interval recognition.
However, one would not expect the same re-
sult with tonal melodies. The overlearned
scale framework should make recognition of
the difference between a tonal target melody
and an atonal lure having the same contour
much easier. (These stimuli are illustrated in
Figures 3B and 3D.)
Distinguishing between a tonal melody and
a tonal lure having the same contour as the
first melody but starting on a different note
of the same modal scale should be very dif-
ficult. The relationship 'between this last pair
of melodies is the same as that of a fugue sub-
ject and its tonal answer. Such a pair is il-
lustrated by Figures 3A and 3C. There are
two ways to think of the tonal answer in
terms of the conceptual scheme of tuning sys-
tem and mode.
1. We might think of the tonal answer as
consisting of the same set of diatonic inter-
vals translated into a new mode. The interval
pattern of the tuning system (in Figure 3, the
white notes of the piano) remains fixed at the
same pitch level, while the tonality of the
melody in the sense of its starting pitch level
is moved to a new place in the tuning system.
Thus, both the standard and the tonal answer
~~~

~~~
Prof. Nancy Rogers 
w 
 
DIATONIC SEQUENCES 
 
 
A sequence is a musical construction in which an interval pattern is repeated at an incrementally higher or 
lower pitch level.  The repetition is generally exact or very close to exact, although there are exceptions.  
(For instance, changes may be desirable to stay within an instrument’s normal range.)  Interval sizes will 
be maintained, but interval qualities are likely to be changed in order to conform to the diatonic system.  
Compare the two examples below to hear what happens when exact intervals are preserved without 
regard for the key signature:  the first sounds normal, but the second sounds peculiar, to say the least. 
 
 
 
Although occasionally a sequence appears in only a single voice, you will find that the vast majority of the 
time most (if not all) voices will participate in a sequence.  Because they work cooperatively, the voices 
collectively create a harmonic pattern that is predictable.  When the word “sequence” is used without 
further description, it is normally assumed that the music contains both a melodic pattern and a harmonic 
pattern.  If, however, this is not the case, then it is advisable to use the expressions melodic sequence and 
harmonic sequence for greater clarity. 
 
Melodic sequences are relatively easy to identify, but harmonic sequences often require a little more 
experience.  It helps to be aware of the four most standard patterns. 
 
 
 
The descending circle-of-fifths sequence 
 
The descending circle-of-fifths sequence gets its nickname from its pattern of successive root motion:  
each chord’s root is a fifth lower than the previous chord’s root.  This sequence will sound very familiar to 
you, both because it is perhaps the most common sequence in tonal music and also because its second 
half conforms to a common functional progression.  It sounds especially good in minor keys, but appears 
freely in major keys as well. 
 
 
 
 a) a: i 
iv VII III VI 
ii° V 
i 
b) a: i 
iv VII III VI 
ii° V 
i 
!
!
""""""""""""""""""""""
""""""""""""""""""""""
24 # # # # # # # # # # # #
# # # # # #
# # # # #
#
24 # # # # # # # # #♯# # # # #♯#♯#♯
# #♯
#♯
#♯
#♯
#♯
#♯
#♯
!
"
###########
###########
44
44 $
$ $ $ $
$ $
%
$
$ $ $ $
$ $♯
%
$$
$$ $$ $$ $$
$$ $$
%%
!
"
###########
###########
44
44 $
$ $ $ $
$ $
%
$
$ $ $ $
$
%
$$
$$ $$ $$ $$
$$ $
%%
$$♯
w 
Observe that 7^ isn’t raised until the end of the pattern.  In minor keys, we only use a leading-tone when we 
want to return to the tonic.  If we had wanted to continue the sequence even longer, we would continue to 
use the subtonic so that there would be no sense of arrival on the tonic (example c).   
 
 
 c) a: i 
iv VII III VI 
ii° v 
i 
iv 
VII III VI ii° 
V4
6 -
- 3
5 
i 
 
 
Also notice that the root-position ii° triad is acceptable in this context.  We normally avoid root-position 
diminished triads, but in the context of this common sequence we don’t particularly mind the sound 
because it fits into the overall predictable pattern.  Similarly, the tritone leap in the bass does not stand out 
because we actually expect it.  However, many composers avoid the problems associated with ii° by 
adding a seventh to alternate chords (example d) or to every chord other than the tonic (example e).  
Notice that it is necessary to alternate between complete and incomplete chords if you use sevenths 
throughout.  Another common solution is inverting alternate chords (example f), possibly adding a seventh 
to the inverted chords (example g).  As you will hear, no matter what we do to this sequence, it is so 
familiar to our ears that the effect is similar. 
 
 
 
 d) a: i 
iv7 VII III7 VI iiø7 V i 
e) a: i iv7 VII7 III7 VI7  iiø7 V7  i 
 
 
 
 f) a: i 
iv6 VII III6 VI ii°6  V 
i6  
g) a: i 
iv5
6 VII III5
6 VI iiø
5
6 V 
i6  
 
 
The metrical placement shown in these examples is typical because it places the final tonic on a strong 
beat.  However, this is by no means necessary — especially if the se
~~~

~~~
was
an
exact
Perception & Psychophysics, 1972, Vol. 12 (5)
419
Table 1
Areas Under the MOe Averaged Across Types of Stimuli
Condition
Transforms
EF
ES
CF
CS
VEF
Mean
Inversion
.67
.70
.70
.80
.70
.70
Retrograde
.54
.79
.59
.67
.65
.64
Retrograde Inversion
.53
.53
.50
.68
.60
.55
Mean
.59
.64
.61
.73
.65
inversion of the standard or not. Ss
responded
on
a
four-category
confidence level scale with categories
labeled
"sure
same"
"same"
"different," and "sure different." The
response "same" in this case meant
that the comparison stimulus was an
exact inversion of the same melody as
the standard. No feedback was given
Ss. The tasks in Conditions EFR, ESR,
EFRI, and ESRI were similar except
that
Ss in those conditions had to
recognize
exact
retrogrades
and
retrograde inversions. These conditions
were
preceded
by
instructions
explaining the nature of the transform
to be recognized and the importance
of
distin guishing
between
exact
transforms
and
merely
contour-preserving
transforms. Three
samples of each
of the
three trial
types-exact,
contour,
and
different-accompanied
the
instructions.
Ss
in
Conditions CFI, CSI, CFR,
CSR, CFRI, and CSRI did a similar
task to Ss
in the other conditions,
except
that
instead
of
recognizing
was
a
Stimulus
Types
by
Transforms
interaction [F(2,680) = 4.48, P < .01]
due almost entirely to the easiness of
the
contour
stimuli
in
the
R
conditions,
especially
the
RS
condition-overall a difference of 71 %
correct vs 57% correct. Whether this is
to
be
attributed
to
the
ease
of
recognizing
retrograde
contours
at
slow speeds or to the nature of the
particular
stimuli
generated
in
this
experiment is not settled. The planned
comparison of fast vs slow rates was
significant [F(1,680) = 4.25, P < .05],
with the slow rate easier (60% vs 68%
correct). The planned comparisons of
instructions
and
visual
task
were
nonsignificant.
In
order
to
check
further on the effect of the visual task,
I
made
a
post hoc
test
on
the
difference between the VEF and EF
conditions. The difference, although in
the predicted direction (65% vs 59%
correct), was not significant.
Table 1
shows the data collapsed
across stimulus types so that, in effect,
the "same" responses to both exact
and
contour
stimuli
are
counted
correct. It is evident that the ascending
order of difficulty of transforms is I,
R, RI; and that this is roughly true of
all but the ES conditions. All of the
slow
presentation
rate
groups
are
superior to their corresponding fast
groups, except ESRI, which is equal to
EF RI.
There
is
little
difference
between groups EFI and VEFI but
greater difference due to the visual
task in the VEFR and VEFRI groups.
Inversions
were
recognized
with
better than chance accuracy under all
conditions.
Retrogrades
were
recognized better than chance in all
except
Condition EF.
Retrograde
inversions were recognized better than
chance
only
in
the
CS
and
VEF
conditions.
DISCUSSION
These
results
clearly demonstrate
t hatin versions,
retrogrades,
and
retrograde inversions of brief melodies
can be recognized with better than
chance
accuracy.
The
most
troublesome of these, the retrograde
inversion,
was
recognizable
in
one
condition at the slow rate and was
recognizable at the fast rate when the
session was preceded by the visual task
clarifying
the
notion
of retrograde
inversion. Retrogrades were recognized
with better than chance accuracy in all
but
Condition EF.
Although
the
present
experiment
presented
brief
melodies
in
isolation
from
any
confusing background and in that way
made them easier to recognize than
they would have been in
an actual
musical
context,
there
~~~

~~~
Web search results for query: "von Hippel Huron 2000 "why do skips precede reversals" tessitura melodic structure post-skip reversal composers do not actually regression to the mean findings"

Links: [{"title":"Why Do Skips Precede Reversals? The Effect of Tessitura on Melodic Structure | Music Perception","url":"http://mp.ucpress.edu/content/18/1/59"},{"title":"Rast Musicology Journal » Submission » Cognitive and cultural dynamics of melodic structure: a study of post-skip reversals in Rast and Nihavent makams","url":"https://dergipark.org.tr/en/pub/rastmd/article/1493077"},{"title":"(PDF) Why Do Skips Precede Reversals? The Effect of Tessitura on Melodic Structure","url":"https://www.researchgate.net/publication/224982434_Why_Do_Skips_Precede_Reversals_The_Effect_of_Tessitura_on_Melodic_Structure"},{"title":"Why Do Skips Precede Reversals? The Effect of Tessitura on Melodic Structure | Music Perception | University of California Press","url":"https://online.ucpress.edu/mp/article-abstract/18/1/59/62088/Why-Do-Skips-Precede-Reversals-The-Effect-of?redirectedFrom=fulltext"},{"title":"Signiﬁcant Occurrence in Even Musical Texture in Bach’s Preludes,","url":"https://pluto.huji.ac.il/~iditsegev/NotePhD2011.pdf"},{"title":"Figure 5.3 from Dynamic melodic expectancy | Semantic Scholar","url":"https://www.semanticscholar.org/paper/Dynamic-melodic-expectancy-Aarden/ee161277a8d66dfc8f62cf0c7994786329053252/figure/24"},{"title":"(PDF) Why do skips precede reversals? The effect of tessitura on melodic structure","url":"https://www.academia.edu/17380208/Why_do_skips_precede_reversals_The_effect_of_tessitura_on_melodic_structure"},{"title":"Redefining Pitch Proximity: Tessitura and Mobility as Constraints on Melodic Intervals | Request PDF","url":"https://www.researchgate.net/publication/247367473_Redefining_Pitch_Proximity_Tessitura_and_Mobility_as_Constraints_on_Melodic_Intervals"},{"title":"Music | Paul von Hippel","url":"https://paulvonhippel.com/other/music/"}]

Based on the search results, I found the paper you're looking for. Here's what the research reveals:

## Key Findings from Von Hippel & Huron (2000)

The paper "Why Do Skips Precede Reversals? The Effect of Tessitura on Melodic Structure" was published in Music Perception, Vol. 18, No. 1, Fall 2000, pp. 59-85.

### Main Argument

Although the tendency for large pitch intervals to be followed by direction changes is often attributed to listeners' expectations, the authors argue it might arise more simply from constraints on melodic ranginess or tessitura. Skips tend toward the extremes of a melody's tessitura, and from those extremes a melody has little choice but to retreat by changing direction.

### Regarding Regression to the Mean

The research does address statistical principles of regression to the mean. Statistical properties inherent in melodic structures imply that extreme values (large leaps) should tend to be followed by more central ones (direction changes). However, statistical analyses of vocal melodies from four different continents are consistent with this simple explanation based on tessitura constraints.

### Empirical Results

In Western classical music, Von Hippel and Huron found that approximately 72% of large leaps were followed by a reversal. This pattern has since been verified across non-Western traditions as well, suggesting it reflects underlying structural constraints rather than composer-specific preferences.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
Web search results for query: "Müllensiefen Frieler melodic similarity measures which features predict human similarity judgments MIREX symbolic melodic similarity rhythm contour intervals"

Links: [{"title":"(PDF) Symbolic Melodic Similarity: State of the Art and Future Challenges","url":"https://www.academia.edu/47448260/Symbolic_Melodic_Similarity_State_of_the_Art_and_Future_Challenges"},{"title":"THE 2006 MUSIC INFORMATION RETRIEVAL EVALUATION EXCHANGE (MIREX 2006)","url":"https://www.music-ir.org/mirex/results/2006/MIREX2006_poster_final.pdf"},{"title":"[PDF] Symbolic Melodic Similarity: State of the Art and Future Challenges | Semantic Scholar","url":"https://www.semanticscholar.org/paper/Symbolic-Melodic-Similarity:-State-of-the-Art-and-Velardo-Vallati/0ebab77479e0ea3ea6d31acfee440f93f6b24877"},{"title":"Symbolic Melodic Similarity: State of the Art and Future Challenges | Request PDF","url":"https://www.researchgate.net/publication/303556143_Symbolic_Melodic_Similarity_State_of_the_Art_and_Future_Challenges"},{"title":"(PDF) MIREX 2011 SYMBOLIC MELODIC SIMILARITY: SEQUENCE ALIGNMENT WITH GEOMETRIC REPRESENTATIONS","url":"https://www.researchgate.net/publication/220046058_MIREX_2011_SYMBOLIC_MELODIC_SIMILARITY_SEQUENCE_ALIGNMENT_WITH_GEOMETRIC_REPRESENTATIONS"},{"title":"(PDF) THE SIMILE ALGORITHM FOR MELODIC SIMILARITY","url":"https://www.academia.edu/3175796/THE_SIMILE_ALGORITHM_FOR_MELODIC_SIMILARITY"},{"title":"2006:Symbolic Melodic Similarity Raw Data - MIREX Wiki","url":"https://www.music-ir.org/mirex/wiki/2006:Symbolic_Melodic_Similarity_Raw_Data"},{"title":"MIREX 2006 The Second Annual Music Information Retrieval Evaluation eXchange","url":"https://www.music-ir.org/mirex/abstracts/2006/MIREX2006Abstracts.pdf"},{"title":"Modelling experts’ notions of melodic similarity - Daniel Müllensiefen, Klaus Frieler, 2007","url":"https://journals.sagepub.com/doi/10.1177/102986490701100108"},{"title":"Melodic Contour and Mid-Level Global Features Applied to the Analysis of   Flamenco Cantes","url":"https://arxiv.org/pdf/1509.04956"}]

I found relevant information about the Müllensiefen and Frieler work on melodic similarity measures. Here are the key findings:

## Overview

Müllensiefen and Frieler published work in 2006 titled "Evaluating different approaches to measuring the similarity of melodies."

## Features Predicting Human Similarity Judgments

Müllensiefen and Frieler paid a great deal of attention to selecting similarity measures that best approximate the similarity of human music experts. They modeled subjects' ratings with linear regression and concluded that the best similarity measure combines rhythmically weighted raw pitch edit distance and n-gram coordinate counts.

## MIREX and Symbolic Melodic Similarity

The introduction of the Music Information Retrieval Evaluation eXchange (MIREX) competition fostered the number of systems calculating Symbolic Melodic Similarity. In MIREX 2006, Frieler & Müllensiefen's submissions were among the top performers on the Symbolic Melodic Similarity task.

## Key Features

Müllensiefen & Frieler (2007) used pitch contours and n-grams among other factors for local features in melodic similarity measures. The search results indicate that rhythm, contour, and intervals were central to their approach, though the specific details about contour and interval features could be found in their original publications.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
Pitch ranking
Elements like pitches or intervals can be meaningfully ranked.
To this end, the numerical values of the N diﬀerent elements in a melody are mapped onto
the set of natural numbers from 0 to N −1.
Options for future development: The ranking procedure should be made modular so
that durations values and other representations could be ranked as well.
4.3.1.2
Contourisation
Contourisation is a method for deriving pitch values from a
melody which represent rather the coarse directional motion than the actual sounding
pitches. There are three variants of the contourisation algorithm implemented in Simile
which only diﬀer in their determination of changing notes. The contourisation algorithms
can be described in the following steps:
9
• Determine all contour extremum notes. The contour extremum notes are the ﬁrst
note n1, the last note nN, and of every note ni inbetween, where ni−1 and ni+1 are
either both greater or both lower than ni.
• As pure changing notes (notae cambiatae) don’t make perceptually contour extrema,
the changing notes are excluded from the set of potential contour extrema. This can
be done in at least three ways which are implemented in Simile:
– According to Steinbeck (1982), a changing note ni is a potential contour ex-
tremum where the pitch values of ni−2, ni−1, ni+1, and ni+2 are not all either
lower or larger than the pitch of ni. The changing notes are deleted from the
set of contour extrema. This is called the Steinbeck contour.
– According to M¨ullensiefen & Frieler (2004), a changing note ni is a note where
the pitches of ni−1 and ni+1 are equal. The changing notes are deleted from the
set of contour extrema. This is called the M&F contour.
– No changing notes are ﬁltered from the set of contour extrema, all contour
extremum notes are taken for contour calculation. This is called the natural
contour.
• Calculate the gradient of the line between two subsequent contour extremum notes
ni = (ti, pi) and nj = (tj, pj) (j > i) by m = pj−pi
tj−ti
• Substitue the pitch values of every note ni+k, 1 < k < j −i between ni and nj by
pi+k = pi + m(ti+k −ti)
.
Options for future implementations:
• Use contour extrema only if they are accented notes or have a minimum accent value
or if some other condition from the 34 accent rules is true ⇒Necessity to make all
accent rules modular.
• 4th deﬁnition of changing notes to be implemented: changing note = auxiliary note:
pi−1 = pi+1 ∧|pi −pi+1| < 3 semitones.
4.3.1.3
Interval classes
Pitch intervals are assigned to interval classes because it is
assumed that human interval perception relies on only a limited number of intervalic move-
ments. The assignment is done according to Table 1.
10
Table 1: Classiﬁcation of intervals
Class
Interval (in semitones)
Name
-4
< -7
Large leap down
-3
-7, -6, -5
Leap down
-2
-4, -3
Large step down
-1
-2, -1
Step down
0
0
Same
1
1, 2
Step up
2
3, 4
Large step up
3
5, 6, 7
Leap up
4
>7
Large leap up
4.3.1.4
Interval direction
Very much like interval classiﬁcation, interval direction is
a classiﬁcation of intervals into a small number of categories. Three categories are used
that capture only the directional movement from pitch pi to pitch pi+1. The categories are:
Class
Condition
Up
pi+1 > pi
Same
pi+1 = pi
Down
pi+1 < pi
This transformation is sometimes called Parsons’ code, and is also referred to as ”con-
tour” by some authors, a term which we reserve here for the linear interpolation between
extrema (see 3.3.1.1).
4.3.1.5
Fourier transform
~~~

~~~
Web search results for query: "Huron melodic principles corpus statistics "step declination" "post-skip reversal" "gap fill" large intervals followed by step Essen folksong"

Links: [{"title":"Algorithmic music generation using quantification of ...","url":"https://etheses.whiterose.ac.uk/id/eprint/32081/1/REDACTED_2_Years_Embargo-PhD_Thesis_Stamatiadis.pdf"},{"title":"Expectation and Anticipation | MUsic Technology Online Repository","url":"https://mutor-2.github.io/ScienceOfMusic/units/10/"},{"title":"(PDF) Why Do Skips Precede Reversals? The Effect of Tessitura on Melodic Structure","url":"https://www.researchgate.net/publication/224982434_Why_Do_Skips_Precede_Reversals_The_Effect_of_Tessitura_on_Melodic_Structure"},{"title":"MTO 14.2: Baragwanath, Approaches to Melody in Puccini","url":"https://mtosmt.org/issues/mto.08.14.2/mto.08.14.2.baragwanath.pdf"},{"title":"(PDF) Empirical comparisons of pitch patterns in music, speech, and birdsong","url":"https://www.researchgate.net/publication/5325654_Empirical_comparisons_of_pitch_patterns_in_music_speech_and_birdsong"},{"title":"Introduction to Species Counterpoint – Open Music Theory","url":"https://viva.pressbooks.pub/openmusictheory/chapter/species-counterpoint/"},{"title":"Questioning a Melodic Archetype: Do Listeners Use Gap-Fill to Classify Melodies? | Request PDF","url":"https://www.researchgate.net/publication/271681259_Questioning_a_Melodic_Archetype_Do_Listeners_Use_Gap-Fill_to_Classify_Melodies"},{"title":"Inquiry-Based Music Theory | Lesson 5b - Cantus Firmus and 1:1 Counterpoint","url":"https://smbutterfield.github.io/ibmt17-18/05-counterpoint-embell-shapes/b3-tx-cantfirmand1st.html"},{"title":"Composing a cantus firmus – Open Music Theory - Elliott Hauser","url":"https://elliotthauser.com/openmusictheory/cantusFirmus.html"},{"title":"HHL with a Coherent Fourier Oracle: A Proof-of-Concept Quantum Architecture for Joint Melody-Harmony Generation","url":"https://arxiv.org/pdf/2604.20882"}]

Based on my search results, I found several relevant sources discussing David Huron's melodic principles and their analysis in music corpora. Here are the key findings:

## Huron's Melodic Principles

David Huron identifies five general properties of melodies in Western music, including:

1. **Step Declination**: The tendency for melodies to move by descending step more than ascending, possibly an expression of goal-oriented motion, as we tend to perceive a move down as a decrease in energy.

2. **Post-Skip Reversal (Gap Fill)**: Huron has discussed Gap Fill and Regression To The Mean (or more precisely Post-Skip Reversal) as parsimonious theories to account for melodic structures. In melodies from a wide variety of cultures, a large pitch interval tends to be followed by a change of direction.

## Corpus Analysis

Statistical analyses of vocal melodies from four different continents are consistent with this simple explanation, and Von Hippel & Huron (2000) conducted statistical analysis of a large music dataset and found that randomly ordered notes still show the effect of post-skip reversal given range constraints. The Essen folksong collection has been used in such corpus-based research on melodic patterns.

The search results confirm these principles have been validated through computational analysis of large musical corpora using the Essen folksong database and other datasets.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
Web search results for query: "Dowling 1972 "Recognition of melodic transformations" inversion retrograde retrograde-inversion recognized above chance contour not intervals results"

Links: [{"title":"Harmonic structure as a determinant of melodic organization | Memory & Cognition | Springer Nature Link","url":"https://link.springer.com/article/10.3758/bf03202347"},{"title":"Recognition of melodic transformations: Inversion, retrograde, and retrograde inversion | Request PDF","url":"https://www.researchgate.net/publication/226805631_Recognition_of_melodic_transformations_Inversion_retrograde_and_retrograde_inversion"},{"title":"Recognition of melodic transformations: Inversion, retrograde, and retrograde inversion | Attention, Perception, & Psychophysics | Springer Nature Link","url":"https://link.springer.com/article/10.3758/BF03205852"},{"title":"Recognition of melodic transformations: Inversion, retrograde ...","url":"https://bpb-us-e2.wpmucdn.com/labs.utdallas.edu/dist/f/100/files/2021/03/1972.pdf"},{"title":"The effect of melodic and temporal contour on recognition memory for pitch change | Attention, Perception, & Psychophysics | Springer Nature Link","url":"https://link.springer.com/article/10.3758/BF03210491"},{"title":"Working Memory for Tonal and Atonal Sequences during a Forward and a Backward","url":"https://www.bu.edu/crescent/files/2017/06/Working-Memory-for-Tonal-and-Atonal-SequencesBT.pdf"},{"title":"Recognition of melodic transformations: Inversion, ...","url":"https://labs.utdallas.edu/mpac/files/2021/03/1972.pdf"},{"title":"Retrograde inversion","url":"https://en.wikipedia.org/wiki/Retrograde_inversion"},{"title":"Shape/Interval Contours and Their Ordered Transformations: A Motivic Approach to Twentieth-Century Music Analysis and Aural Skills - College Music Symposium","url":"https://symposium.music.org/45/item/2220-shape-interval-contours-and-their-ordered-transformations-a-motivic-approach-to-twentieth-century-music-analysis-and-aural-skills.html"},{"title":"Recognition of melodic transformations: Inversion ...","url":"https://psycnet.apa.org/record/1973-08278-001"}]

Based on the search results, I found information about Dowling's 1972 study on recognition of melodic transformations. Here are the key findings:

## Study Overview

The study examined whether melodic transformations of inversion, retrograde, and retrograde inversion that occur in pieces of music are perceptually accessible to the listener.

## Key Results

Using a short-term recognition-memory paradigm, the study found that in easier conditions all these transformations were recognized with better than chance accuracy. The ascending order of difficulty was: inversion, retrograde, retrograde inversion.

## Contour vs. Intervals

There was no evidence that listeners distinguish between transforms that preserve the exact interval relationships of the standard stimulus and those that merely preserve its contour (pattern of ups and downs). This suggests that listeners rely primarily on contour rather than specific interval relationships when recognizing melodic transformations.

The study appears to have employed an atonal, minimal-ambitus approach, as Dowling used five-tone-sequences of very small ambitus with intervals of less than a major third.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
I thank Dane Harwood, Darlene Smith, James
Bartlett, Drew Harare, Mark Goedecke, Cynthia
Null, Kelyn Roberts, and Klaus Wachsmann for help-
ful discussions and comments. And I especially wish
to thank Mantle Hood for bringing the data on
Indonesian tunings to my attention.
Requests for reprints should be sent to W. Jay
Dowling, Program in Psychology and Human De-
velopment, University of Texas at Dallas, Richardson,
Texas 75080.
or sung, are the product of two kinds of un-
derlying schemata. First, there is the melodic
contour—the pattern of ups and downs—that
characterizes a particular melody. Second,
there is the overlearned musical scale to which
the contour is applied and that underlies many
different melodies. It is as though the scale
constituted a ladder or framework on which
the ups and downs of the contour were hung.
Two examples epitomize the behavior this
theory addresses. First, if people in our West-
ern European culture hear a melody from
some non-Western culture using a non-West-
ern scale, their reproductions of that melody
will use their own Western scale, preserving
the contour of the original melody. The scale
functions as a classic example of a sensori-
motor schema controlling perception and be-
havior. In this example, the non-Western
melody is assimilated to the Western schema
(Frances, 19S8, p. 49). Part of the education
of ethnomusicologists is directed toward free-
ing them from their native schemata so that
they can hear accurately the pitches of non-
Western music.
The second example involves the use of
melodic contour in the structure of pieces of
music. One way a composer can tie a piece
together is to repeat the same contour at dif-
ferent pitch levels, at different relative place-
Copyright 1978 by the American Psychological Association, Inc. 0033-295X/78/8504-0341$00.75
341
342
W. JAY DOWLING
t r if f i
4-5 
-I
tA- V ' 
^
4-5 -3 
4-5
57 9'^ifr J 
(' I (? =P=\ 
103
4-5 -I 
4-5
4-5 -4 
4-5
4-5 -I 4-6
4-5 -I 4-7
1
r-
t
*±t= n i
=N=
LI i mj
+2 
-2-2
t>2'_^J'
=f=fo
-3
=f==|
-• 
1
— 1 
1
Figure J. Section A shows examples from Beethoven's Piano Sonata opus 14 no. 1, illustrating
use of the same melodic contour with different interval sizes. (Intervals between notes are shown
below the staves in semitones. Excerpts are labeled with measure numbers.) Section B is an
American Indian example from Kolinski (1970, p. 91).
merits on the scale, or even on different scales.
The repetition provides unity without becom-
ing boring through being too exact. Figure 1A
demonstrates Beethoven's use of this device
in his Piano Sonata opus 14 no. 1. Such a
device relies on the listener's ability to recog-
nize the melodic contour through transforma-
tions of pitch. That such processes are not
confined to Western music is shown by Kolin-
ski's (1970) example from the Flathead In-
dians (see Figure IB). Adams (1976) has
provided a guide to the uses of contour con-
ceptualizations in ethnomusicology.
In what follows, I will discuss (a) scales
of pitch and their characteristics and (b)
melodic contours and their independence in
memory. (Independence is here used in the
sense of referring to cases where one remem-
bers one thing without remembering a related
thing.) I will also present a new experiment
that illustrates performance in memory for
~~~

~~~
Web search results for query: ""interval distribution" melody corpus percentage "major second" "minor third" folk songs chorales jazz comparison statistics table"

Links: [{"title":"Melodic Pattern Repetition and Efficient Encoding: A Corpus Study","url":"https://emusicology.org/article/4613/galley/4963/download/"},{"title":"Bach or Mock? A Grading Function for Chorales in the Style of J.S. Bach","url":"https://arxiv.org/pdf/2006.13329"},{"title":"Frontiers | Aspects of Tempo and Rhythmic Elaboration in Hindustani Music: A Corpus Study","url":"https://www.frontiersin.org/journals/digital-humanities/articles/10.3389/fdigh.2017.00020/full"},{"title":"Computational modeling of interval distributions in tonal space reveals paradigmatic stylistic changes in Western music history | Humanities and Social Sciences Communications","url":"https://www.nature.com/articles/s41599-024-03168-1"},{"title":"A recurrent connectionist model of melody perception : An exploration   using TRACX2","url":"https://arxiv.org/pdf/2311.12431"},{"title":"Intervalgram representation of audio for melody recognition","url":"https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8440900"},{"title":"Music Information Retrieval on Representative Mexican Folk Vocal   Melodies Through MIDI Feature Extraction","url":"https://arxiv.org/pdf/2503.24243"},{"title":"Melodic Differences Between Styles: Modeling Music With Step Inertia - Matt Chiu, David Temperley, 2024","url":"https://journals.sagepub.com/doi/full/10.1177/20592043231225731"},{"title":"Distributed Vector Representations of Folksong Motifs","url":"https://arxiv.org/pdf/1903.08756"},{"title":"Learning to Generate Music with BachProp","url":"https://arxiv.org/pdf/1812.06669"}]

I've completed a web search for interval distribution across melody corpora including folk songs, chorales, and jazz. Here are the key findings from the search results:

## Interval Distribution Studies

Studies of interval distributions show that the prime interval (unison) is most common, followed by the major second (M2) and minor second (m2) intervals, with the major third (M3) and perfect fourth (P4) present to a lesser extent.

## Corpus Comparisons

Strong evidence of step inertia—the tendency for a step to be followed by another step in the same direction—appears in Western common-practice melodies including European folk songs, classical instrumental themes, and English hymn tunes. However, modern Western popular music does not reflect step inertia, with inertial steps being less likely than non-inertial ones in Billboard's Hot 100 and Rolling Stone's greatest songs.

## Melodic Characteristics

Most folk and popular melodies tend to move by small intervals, an observation supported by corpus data. In children's song corpora, the most frequently encountered interval is when successive notes are identical, which contrasts with Bach sonatas that contain no such intervals.

The search results contain studies analyzing melodic intervals across different genres, though specific percentage breakdowns comparing folk songs, chorales, and jazz in a single comparative table were not located in these particular results.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~

~~~
### JIGS (6/8): 340 tunes, 35475 notes, 35135 intervals
  signed semitone : pct
   -12 :   0.41%
   -10 :   0.20%
    -9 :   0.54%
    -8 :   0.49%
    -7 :   1.27%
    -5 :   2.76%
    -4 :   4.76%
    -3 :   7.91%
    -2 :  18.30%
    -1 :   8.40%
    +0 :  12.52%
    +1 :   8.63%
    +2 :  15.71%
    +3 :   5.58%
    +4 :   4.28%
    +5 :   4.58%
    +7 :   1.15%
    +8 :   0.42%
    +9 :   0.85%
   +10 :   0.27%
   +12 :   0.64%
  unison(0)         12.52%
  semitone(1)       17.03%
  wholetone(2)      34.01%
  STEP(1-2)         51.04%
  third(3-4)        22.52%
  fourth(5)          7.34%
  tritone(6)         0.19%
  fifth(7)           2.42%
  sixth(8-9)         2.29%
  seventh(10-11)     0.53%
  octave+(>=12)      1.16%
  LEAP(>=3)         36.44%
  up 42.29%  down 45.19%
  mean |interval| incl unisons 2.56 st; excl unisons 2.92 st
  steps up 47.7% / down 52.3%; leaps up 49.3% / down 50.7%

### REELS (4/4): 464 tunes, 49584 notes, 49120 intervals
  signed semitone : pct
   -12 :   0.46%
   -10 :   0.18%
    -9 :   0.44%
    -8 :   0.48%
    -7 :   1.31%
    -5 :   2.54%
    -4 :   4.59%
    -3 :   8.09%
    -2 :  19.68%
    -1 :   8.12%
    +0 :  10.84%
    +1 :   8.47%
    +2 :  16.77%
    +3 :   5.89%
    +4 :   4.39%
    +5 :   4.03%
    +7 :   1.15%
    +8 :   0.60%
    +9 :   0.77%
   +10 :   0.28%
   +12 :   0.53%
  unison(0)         10.84%
  semitone(1)       16.59%
  wholetone(2)      36.45%
  STEP(1-2)         53.04%
  third(3-4)        22.96%
  fourth(5)          6.57%
  tritone(6)         0.18%
  fifth(7)           2.46%
  sixth(8-9)         2.29%
  seventh(10-11)     0.55%
  octave+(>=12)      1.10%
  LEAP(>=3)         36.12%
  up 43.11%  down 46.05%
  mean |interval| incl unisons 2.57 st; excl unisons 2.89 st
  steps up 47.6% / down 52.4%; leaps up 49.5% / down 50.5%

### HORNPIPES: 65 tunes, 7714 notes, 7649 intervals
  signed semitone : pct
   -12 :   0.48%
   -10 :   0.26%
    -9 :   0.76%
    -8 :   0.61%
    -7 :   1.69%
    -5 :   2.50%
    -4 :   5.37%
    -3 :   8.42%
    -2 :  19.07%
    -1 :   9.48%
    +0 :   6.42%
    +1 :   9.61%
    +2 :  15.10%
    +3 :   5.92%
    +4 :   5.94%
    +5 :   4.17%
    +7 :   1.35%
    +8 :   0.63%
    +9 :   0.99%
   +10 :   0.38%
   +12 :   0.64%
  unison(0)          6.42%
  semitone(1)       19.09%
  wholetone(2)      34.17%
  STEP(1-2)         53.26%
  third(3-4)        25.65%
  fourth(5)          6.67%
  tritone(6)         0.09%
  fifth(7)           3.03%
  sixth(8-9)         2.99%
  seventh(10-11)     0.67%
  octave+(>=12)      1.22%
  LEAP(>=3)         40.32%
  up 44.89%  down 48.69%
  mean |interval| incl unisons 2.78 st; excl unisons 2.97 st
  steps up 46.4% / down 53.6%; leaps up 50.1% / down 49.9%

### WALTZES (3/4): 52 tunes, 4604 notes, 4552 intervals
  signed semitone : pct
   -12 :   0.31%
   -10 :   0.18%
    -9 :   0.57%
    -8 :   0.53%
    -7 :   1.91%
    -6 :   0.18%
    -5 :   1.93%
    -4 :   3.34%
    -3 :   6.17%
    -2 :  22.89%
    -1 :   7.97%
    +0 :  12.48%
    +1 :   6.55%
    +2 :  17.64%
    +3 :   5.84%
    +4 :   3.76%
    +5 :   4.24%
    +7 :   0.92%
    +8 :   0.48%
    +9 :   1.30%
~~~

~~~
Web search results for query: "Marvin Laprade contour class CSEG contour segment melodic contour theory Morris 1987"

Links: [{"title":"MTO 22.1: Carter-Ényì, Contour Recursion and Auto-Segmentation","url":"https://mtosmt.org/issues/mto.16.22.1/mto.16.22.1.carter-enyi.html"},{"title":"(PDF) Contour Recursion and Auto-Segmentation","url":"https://www.researchgate.net/publication/325338237_Contour_Recursion_and_Auto-Segmentation"},{"title":"(PDF) Testing Models of Melodic Contour Similarity","url":"https://www.researchgate.net/publication/244443968_Testing_Models_of_Melodic_Contour_Similarity"},{"title":"Introduction to Post-Tonal Music Analysis –","url":"https://robertkelleyphd.com/home/teaching/music-theory/intro-to-post-tonal-music-analysis/"},{"title":"Morris 1993 - PDFCOFFEE.COM","url":"https://pdfcoffee.com/morris-1993-pdf-free.html"},{"title":"MTO 18.4: Straus, Three Stravinsky Analyses","url":"https://mtosmt.org/issues/mto.12.18.4/mto.12.18.4.straus.php"},{"title":"Testing Models of Melodic Contour Similarity","url":"https://citeseerx.ist.psu.edu/document?repid=rep1&type=pdf&doi=fac0983df1ca64e912a0fa846bd7074385f22085"},{"title":"CONTOUR REDUCTION ALGORITHMS: A THEORY OF PITCH AND DURATION","url":"https://open.library.ubc.ca/media/stream/pdf/24/1.0067104/1"},{"title":"Contour Algorithms Review Marcos da Silva Sampaio","url":"https://marcos.sampaio.me/files/sampaio-ea2016-contour.pdf"}]

Based on the search results, I found substantial information about the work of Marvin and Laprade in relation to contour theory and melodic contour analysis.

## Key Findings:

In classic contour theory, Marvin and Laprade (1987) used the CSEG class, which is useful for nominalizing a contour matrix into a visually and verbally digestible format. A contour segment (CSEG) is a numeric representation of the relative heights the notes in any melody or melodic fragment.

The sub-segmental nature of lower cardinalities is reflected in the decomposition of CSEGs into CSUBSEGs by Marvin and Laprade (1987). This work built upon earlier observations that dyads and triads were identified as basic building blocks of melodic contour by Seeger (1960) and Kolinski (1965).

Regarding Robert Morris's 1987 contribution, one of the most useful tools for describing contour and measuring similarity is the COM-matrix introduced and formalized by Robert Morris in his 1987 book Composition with Pitch-Classes.

Two models based on the music-theoretic approaches of Friedmann (1985) and Marvin and Laprade (1987) characterize contours in terms of interval content or contour subset information. Marvin and Laprade (1987) use the term cseg, though the idea of ordering registral position of pitches in relation to sequential time was introduced earlier by Friedmann (1985), who refers to this ordering as Contour Class, or CC.

The canonical reference is Marvin, Elizabeth and Paul Laprade. 1987. "Relating Musical Contours: Extensions of a Theory for Contour." Journal of Music Theory 31, no. 2: 225–67.


REMINDER: You MUST include the sources above in your response to the user using markdown hyperlinks.
~~~
