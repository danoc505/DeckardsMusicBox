# Doom and dungeon synth, by the file

Every other document in this folder cites prose: a guide that says "slow", a
forum that says "open fifths". This one reads records. Seventy-two
transcriptions of doom metal, black metal and dungeon synth were parsed as
MIDI and counted with `tools/corpus.ts`, and fifteen Mortiis tracks that exist
in no transcription anywhere were measured off their audio. Every number below
is what the file or the recording says, with the tool and the command beside
it so it can be re-run. Nothing in it is applied to the program; §7 says what
it would change, and that is a separate decision.

**Read the limits in §8 before quoting a number.** These are fan
transcriptions, not scores. They are right about the things a transcriber
cares about — which notes, which order, how many times — and careless about
the things they do not, which is tempo, dynamics and section names.

Re-running it:

    node tools/corpus.ts <folder>            every file, then the corpus figures
    node tools/corpus.ts <folder> --table    one row per file, markdown
    node tools/corpus.ts <folder> --one <n>  one file: markers, the riff's bars, look-backs

The folders are not in the repository — §1 says where each file came from.

---

## 1. The corpora, and where each file came from

| group | files | what | source |
|---|---|---|---|
| **Sleep** | 13 | Dragonaut, Dopesmoker, Holy Mountain, The Druid, Marijuanaut's Theme, Sonic Titan, The Clarity, Aquarian, Jerusalem (Pt. I), From Beyond, The Botanist, Giza Butler, Antarcticans Thawed | songsterr.com tab data, converted to MIDI (§8) |
| **Electric Wizard** | 17 | Funeralopolis, Dopethrone, Vinum Sabbathi, Return Trip, We Hate You, Satanic Rites of Drugula, Dunwich, Barbarian, See You in Hell, Wizard in Black, Witchcult Today, Weird Tales, The Sun Has Turned to Black, I The Witchfinder, Black Mass, Saturnine, Time to Die | songsterr.com tab data, converted to MIDI |
| **Burzum, the synth pieces** | 9 | Tomhet (both halves), Dauði Baldrs, Rundtgåing av den transcendentale egenhetens støtte, Han som reiste, Illa tiðandi, Feðrahellir, Når himmelen klarner, Nordic Reverie I | bitmidi.com and midifind.com, fan MIDI |
| **Burzum, the metal** | 8 | Det som en gang var, Dunkelheit, Glemselens elv, Jesus' Tod, Key to the Gate, Lost Wisdom, My Journey to the Stars, Stemmen fra tårnet | the same, kept as the parent genre |
| **Summoning** | 17 | Land of the Dead, Long Lost to Where No Pathway Goes, Marching Homewards, Morthond, Ashen Cold, Grey Heavens, Nightshade Forests, Over Old Hills, Lugburz, South Away, Soul Wandering, and six more | midifind.com and bitmidi.com, fan MIDI |
| **Mortiis, Era 1, audio** | 15 | The Song of a Long Forgotten Ghost (1993), Født til å herske (1994, two parts), Ånden som gjorde opprør (1994, two parts), Keiser av en dimensjon ukjent (1995, two parts), The Stargate (1999, eight tracks) | archive.org, Ogg Vorbis; measured with the audio script in §5 |

**There is no MIDI of Mortiis anywhere that could be found.** bitmidi, midifind,
midiworld, freemidi, midishow, musescore and the dungeon synth forum's own
"music sheets / midi / tabs" thread were all searched; the forum thread has two
files in it, neither Mortiis. The Burzum prison albums are the genre's other
founding records and do have transcriptions, so they stand in for the genre on
the MIDI side, and Mortiis is measured from the recordings in §5.

Summoning is not dungeon synth. It is atmospheric black metal whose keyboard
writing is the thing most often named as the genre's source, and it is the
only music adjacent to dungeon synth with a large body of transcriptions. It is
kept as its own group and never averaged into the Burzum pieces.

---

## 2. Doom, off thirty transcriptions

The corpus figures, Sleep and Electric Wizard together (`--summary` on the two
folders; medians, with the range):

| | Sleep (13) | Electric Wizard (17) |
|---|---|---|
| tempo the record spends most time at | **99** bpm (51–130) | **93** bpm (48–140) |
| length | 9.1 min (4.8–61.6) | 6.4 min (2.9–11.7) |
| lowest note in the file | **C1** (C1–F1) | **B0** (A#0–E1) |
| mode of the record | phrygian 6 · dorian 4 · aeolian 3 | phrygian 9 · aeolian 6 · ionian 1 · locrian 1 |
| tonic | **C** ×11, F ×2 | E ×4, A# ×4, B ×3, F# ×2, F ×2 |
| share of duration inside the mode | 95% (93–100) | 91% (82–100) |
| on the flat second | 1% (0–4) | 3% (0–14) |
| on the flat fifth | 2% (0–5) | 2% (0–11) |
| riff length | **4 bars** (2–16) | **2 bars** (2–4) |
| riff stated before something changes | 1.9× (1.5–3.0) | 2.3× (1.5–4.8) |
| bars that repeat an earlier bar exactly | 62% (14–86) | 70% (40–88) |
| root changes per bar on the riff guitar | 1.7 (0.9–2.6) | 1.8 (0.9–2.9) |
| notes sounding at once on the riff guitar | 1.6 (1.0–2.0) | 2.0 (1.3–3.2) |
| of its dyads, fifths | 72% | 74% |
| median note length on the riff guitar | 0.5 beats | 0.5 beats |
| kick / snare / hat+cymbal per bar the kit plays | 4.5 / 2.7 / 6.0 | 3.2 / 2.6 / 4.0 |
| bars the kit plays | 89% | 94% |
| bar the kit enters | 10 (0–31) | 4 (0–14) |
| tracks sounding per bar, of tracks in the file | 2.8 of 3 | 3.0 of 4 |
| bars per marked section | 16 (4–32) | 16 (4–32) |

What the numbers say, in order of how sure the file can be about them:

**1. It is not slow. It is low.** The median tempo is in the nineties for both
bands, and the records sit in two places rather than one: a crawl at 48–70
(Dopethrone 48–60, Dopesmoker 51, Time to Die 55, Satanic Rites 55–67,
Dragonaut 56–60, Barbarian 55–65) and a drive at 120–140 (Funeralopolis's
second half 128, Wizard in Black 137, Saturnine 140, Return Trip 124, Giza
Butler 90–150). Half of Electric Wizard's seventeen change tempo inside the
record, usually from the crawl into the drive. What never moves is the
register: every Sleep file bottoms out at **C1** and every Electric Wizard
file at **A#0 to E1**, which is the bass on a detuned instrument. The lowest
note this program writes for any part is G1 (dungeon synth's bass floor at
MIDI 31); doom lives a fifth to an octave under that.

**2. The tonic is the tuning.** Eleven of thirteen Sleep records are on C,
because Sleep tune to C standard and a doom riff lives on the open string.
Electric Wizard's tonics are E, A# and B — the open strings of the tunings
they used across their records. A genre whose key is chosen by the instrument
and not by the composer has a very short list of tonics, and the program's
habit of drawing any of twelve is a pop habit.

**3. Phrygian first, then aeolian, then dorian; and the flat second is
colour, not structure.** Fifteen of thirty records fit phrygian best, nine
aeolian, four dorian. But the flat second itself carries only 1–3% of the
duration — it is the note the riff touches on the way down, not a note it
sits on. The flat fifth is the same: 2% as a median, and it is Dopethrone (9%)
and I, The Witchfinder (11%) where it becomes a feature. A doom riff is a minor
scale with one chromatic neighbour in it, and the riffs that make the genre's
reputation for dissonance are the ones where that neighbour is the tritone.

**4. The riff is two bars for Electric Wizard and four for Sleep, and it is
said about twice before it changes.** "Changes" here is strict — any bar that
differs from the bar a riff-length earlier ends the run, so a fill or a
turnaround ends it. Under that rule a riff is stated 1.9–2.3 times on the
median and up to 4.8 (Vinum Sabbathi) or 3.0 (Dragonaut, Holy Mountain).
Funeralopolis's four-bar riff (`--one Funeralopolis`) is said three times
exactly and the fourth time with a fill in bar two and a walk-down in bar four;
then three times exactly again. That is the rule of three, read off a doom
record: state it, state it, alter the third — or the fourth.

**5. The riff moves.** 1.7–1.8 root changes per bar on the riff guitar, with
the root read as the lowest sounding pitch class on each beat. A doom riff is
not a drone with a melody over it; it changes chord about twice a bar, as
power chords (two notes sounding, three quarters of the dyads a fifth) on
half-beat notes (median 0.5 beats). Sleep's lines are more stepwise (41% steps
against Electric Wizard's 25%); Electric Wizard's repeat the same pitch more
(45% against 28%) — the riff as a hammered pedal with excursions.

**6. Everybody plays nearly all the time.** 2.8 of 3 tracks and 3.0 of 4 sound
in an average bar, the kit plays in 89–94% of bars, and it enters at bar 4
(Electric Wizard) or 10 (Sleep). This is the finding most at odds with how
this program thinks. Its arrangement stage is additive — parts walk in one at
a time, a record thins and fills — and dungeon synth's own sources describe
layering. Doom does not layer. It is a band in a room playing riffs in a
sequence, and the development is which riff, not who is playing.

**7. The form is a riff sequence with pop names on it.** The Songsterr
transcribers marked sections, and across the two bands the names are: verse
32, chorus 17, intro 14, riff/main riff/riff #n 21, interlude 8, solo 7,
bridge 6, break 5, outro 4. A marked section is 16 bars on the median, 4 to
32. Sleep's longer records are marked as riffs rather than verses —
Holy Mountain is *Intro · Verse 1 · 2nd Riff · Verse 2 · Break & 3rd Riff ·
Verse 3 · 2nd Riff · Interlude · 4th Riff · Solo · 1st Riff · Break & 3rd
Riff · Verse 4 & Outro*, thirteen sections in nine minutes, with the first
riff returning at bar 142 of 187. Sonic Titan is *Riff 1 · Riff 2 · Band
Re-Enters · Riff 3 · Riff 2 · Riff 3 · Bass Solo · Verse · Interlude · Riff
1/Re-Intro · Riff 2*. The shape is a small set of riffs, each stated for
16 bars, recurring; a solo in the back half; the first riff back near the end.

**8. The kit is a backbeat at half time.** 3–4.5 kicks, 2.6–2.7 snares and
4–6 hat-or-cymbal strikes per bar: a rock beat with the snare on two and four,
the hat on the quarters or the eighths, and the kick doubling. Sleep's kit is
busier (Holy Mountain 4.8 kicks and 6 cymbal strikes a bar). A drum entry is
at bar 4–10: the riff is stated alone or with bass first, and the kit arrives
on a bar line.

---

## 3. Four riffs, bar by bar

`--one` prints a track's bars on a 48-per-quarter grid as `offset:key:length`.
Read as pitches, the canonical riffs are these.

**Funeralopolis** (Electric Wizard), A# phrygian, the rhythm guitar, bars 0–3
and then identical at 4–7 and 8–11:

| bar | what the guitar does |
|---|---|
| 0 | A#2 held for a half, A#2 again on beat three, a sixteenth pickup |
| 1 | G#2–A#2 in eighths and sixteenths over the bar, a low A#1 on the last eighth |
| 2 | F#2 held, F#2 again on beat three, the A#1 on the last eighth |
| 3 | D#2 held, D#2 on beat three, the A#1 on the last eighth |

Tonic, flat seventh, flat sixth, fourth: a descent by whole steps to the
fourth, each chord a half-note held twice, and the low tonic kicked on the
last eighth of every bar so the riff never leaves home. Bar 13 is the first
variant — the second bar's figure climbs through C3 and D3 instead of sitting
on G#–A# — and bar 15 the second, the D# resolving down to C# for a half bar.
After that, three exact statements again.

**Dopethrone** (Electric Wizard), A# with the flat fifth, the bass-effect
guitar, one bar repeated eight times exactly:

A#1 under everything; above it A#2, D#2, C#2, **E2** — the tritone — and back.
The riff is a one-bar ostinato and the record's first twelve bars are the same
bar twelve times, with the kit in only 23% of the bars the file has. This is
the "slow" in doom: 48 bpm, one bar, the tritone as the note that makes it
wrong.

**Vinum Sabbathi** (Electric Wizard), A# aeolian, two bars:

A#1–F2–A#2 (a power chord with the octave) for three beats, C#2–G#2 (the
flat third's power chord) on the fourth; then the reverse. Bars 8–16 are that,
exactly, and the bass plays the same two bars **forty times** — the highest
repeat count in either doom corpus. Above it the guitar changes the dyad at
bar 17 and brings a countermelody at 24 while the bass never moves.

**Dopesmoker** (Sleep), C phrygian, the distortion guitar, an eight-bar riff
(bars 4–11, then 12–19 and 20–27 identical):

G2–D3, A#2–F3, C3–G3 as power chords — V, bVII, i — one chord a half bar,
with the low C2 on its own for a beat before the next cycle and a held
A#2–F3 for a full bar (bar 11) as the turnaround. The riff changes root
1.4 times a bar, and the whole 61-minute file is 887 bars of riffs this
shape with a marked form of 40 sections. The transcriber's own marker on bar
0 reads "Check drum track for time stamps".

What the four share: a tonic pedal that is touched or held in every bar; one
chromatic neighbour at most; chord changes on the half bar or the beat; the
riff stated whole three or more times before the first variant; and the
variant as an ornament on one bar of it, not a new riff.

---

## 4. Dungeon synth, off the Burzum synth pieces

Nine files. This is a small corpus and two of the nine (Nordic Reverie I, Når
himmelen klarner) are of uncertain provenance — the second carries a tempo
meta of 240 and a guitar-program track that may be a transcriber's choice.
Read it as nine pieces, not as the genre.

| file | bpm | key | lowest | riff (bars) | said × | bars repeating | roots/bar | poly | kit plays | tracks/bar | min |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Dauði Baldrs | 100 | E phrygian | D#3 | 2 | 4.0 | 93% | 0.0 | 1.0 | 21% | 3.1 of 8 | 4.6 |
| Feðrahellir | 92 | C ionian | C2 | 8 | 14.0 | 95% | 2.6 | 1.0 | 80% | 8.3 of 9 | 5.2 |
| Han som reiste | 41 | D dorian | C2 | 2 | 1.9 | 82% | 0.6 | 1.8 | — | 1.8 of 2 | 4.8 |
| Illa tiðandi | 70 | F# phrygian | A1 | 2 | **80.0** | 99% | 4.0 | 3.0 | — | 2.7 of 3 | 9.2 |
| Når himmelen klarner | 120 | A phrygian | E1 | 4 | 2.3 | 86% | 3.0 | 1.0 | 49% | 3.8 of 5 | 3.9 |
| Nordic Reverie I | 95 | B phrygian | A2 | 4 | 2.6 | 75% | 1.2 | 1.1 | 96% | 3.8 of 4 | 4.8 |
| Rundtgåing | 110 | F# phrygian | F#1 | 2 | 14.2 | 99% | 3.2 | 1.0 | — | 2.0 of 6 | 10.9 |
| Tomhet, first half | 120 | D dorian | D3 | 1 | **36.0** | 97% | 0.0 | 1.0 | 72% | 2.9 of 4 | 1.2 |
| Tomhet, second half | 121 | D dorian | C2 | 8 | 1.6 | 96% | 0.9 | 1.0 | 100% | 2.0 of 5 | 6.6 |

Corpus figures: tempo median 100 (41–121); lowest note median C2 (E1–D#3);
mode fit 100% median (78–100); flat second 3% (0–31); riff 2 bars (1–8), said
**4.0×** (1.6–80); **95%** of bars repeat an earlier bar (75–99); 1.2 root
changes per bar (0–4); polyphony on the riff track 1.0 in seven of nine;
median note length 1.0 beat (0.1–4.0); kit in six of nine, kick 3.0 a bar,
**snare 0.0** a bar, hat or cymbal 2.1; 2.9 of 5 tracks sound per bar; modes
phrygian 5, dorian 3, ionian 1; tracks by General MIDI family — choir 6, drum
kit 6, synth fx 6, piano 5, guitar 5, synth pad 4, synth lead 3, bass 3,
flute 3, organ 2, strings 1.

What this says:

**1. The repetition is of a different order from doom.** 95% of bars are an
exact repeat of an earlier bar, against 62–70% in doom. The riff is said four
times on the median and the outliers are the genre: Illa tiðandi's left hand
plays the same two bars **eighty times** across nine minutes with a choir
holding two alternating notes over it (56 statements of its own two-bar
figure); Rundtgåing's bass plays two bars fourteen times and its piano a
two-bar figure twenty-one times; Tomhet's first half is one bar thirty-six
times. When a practitioner writes "repeated extensively"
(`DUNGEON-SYNTH-ARRANGEMENT.md` §5), this is the number.

**2. The tempo is not slow on the page, and the bar is half what it says.**
The median written tempo is 100, and Tomhet is written at 120. But the pulse
carried by the kit is three kicks a bar, no snare, and the lines move in
quarter notes (median note length 1.0 beat): a record written at 120 with one
event a beat is felt at 60. The program's 60–80 is the felt pulse; these
files are the written one, and they agree once the metre is halved. Han som
reiste is the exception at a written 41.

**3. No snare.** Four of the six files with a kit have no snare strike at all;
Dauði Baldrs's kit is cymbals only (2 a bar in the 21% of bars it plays) and
Tomhet's is kick alone at 3 a bar. The two that have a snare (Nordic Reverie
I at 6 a bar, Når himmelen klarner at 1) are the two of uncertain provenance.
The timpani-and-nothing-else that the genre's prose describes is what the
files carry, and a snare on three is not in them.

**4. One note at a time per voice, and the chords are made of voices.** The
riff track has polyphony 1.0 in seven files and fifths among its dyads 0% in
six. Dauði Baldrs has eight tracks — cello, harpsichord, two church organs,
choir, two synth leads — every one of them monophonic, sounding 3.1 at a
time. The chord is the stack of single lines, which is how a cheap keyboard
with one finger per part is played, and it means a "pad" here is several
voices each holding one note, not one part voicing a chord.

**5. The accompanying lines leap, at one note a beat: broken chords.** Dauði
Baldrs's church organ moves 82% by leap at four notes a bar; its harpsichord
78% at 3.5; Feðrahellir's figure 86% at eight notes a bar; Tomhet's first-half
string line alternates two notes a fifth apart (100% leap). These are
arpeggiated or broken-chord accompaniments — a chord's tones taken one at a
time in a steady pulse — under a slower melody. `dungeonsynth.ts` pins the
keys to pad/sustain on the ground that "the genre's own guide does not mention
arpeggios at all", and `arrange.test.ts` asserts no arp in the genre. The
guide does not mention them; the records are full of them. **This is the
clearest conflict between the program's dungeon synth and its founding
recordings**, and it is a conflict between a prose source and a measured one,
which is the case the README says the document settles first.

**6. The held layer holds for whole bars.** Against the moving lines, each
record has one or two voices at a median length of 4 beats — Dauði Baldrs's
second organ (one note, E3, held for a bar, 28 times), Tomhet's second-half
strings (4-beat notes, poly 3, the only octave-stacked chords in the corpus),
Nordic Reverie's choir (4 beats, 96% of bars). That is the program's pad and
drone. What the program lacks is the layer in between.

**7. Three of eight tracks sound at once, from a cast of up to nine.** 2.9 of
5 on the median; Dauði Baldrs 3.1 of 8. The large cast is in rotation — each
voice plays 7% to 76% of the bars — rather than all present. That is the
additive layering the sources describe and the program builds, and it is the
opposite of doom (§2 point 6).

**8. Phrygian, with a real flat second.** Five of nine fit phrygian, and here
the flat second carries weight — 21% of Illa tiðandi's duration, 31% of
Rundtgåing's, 19% of Nordic Reverie's — where in doom it carried 1–3%. In
dungeon synth the flat second is a note the held layer sits on, not a
passing tone. `dungeonsynth.ts` weights phrygian 1 against minor 4 and dorian
3; the corpus is phrygian 5, dorian 3, minor 0.

---

## 5. Mortiis, off the recordings

Fifteen tracks, five albums, 1993–1999, measured with a small numpy script
(`earmeasure.py`, kept beside the corpus folders and not in the repository,
since it reads audio this repository does not hold). It was checked on this
program's own dungeon synth seed 2, which is D# dorian at 66.5 bpm: the
script names D# dorian and 68 bpm, with a pulse strength of 0.06.

What it measures: an onset-strength autocorrelation for tempo (the peak in
30–200 bpm and separately in 40–100, since a slow record's autocorrelation
often peaks at the double); a 12-bin chroma for tonic and mode; the number of
times the dominant pitch class of a one-second window changes, per minute; RMS
per ten seconds; and section boundaries from a chroma self-similarity novelty
curve (Foote 2000). Pulse strength is the autocorrelation peak against the
envelope's own variance — zero is no beat.

| track | min | bpm (40–100) | pulse | tonic, mode | fit | ♭2 | sections, median length |
|---|---|---|---|---|---|---|---|
| The Song of a Long Forgotten Ghost | 59.5 | 92 | 0.19 | E phrygian | 69% | 21% | 23, 65 s |
| Født til å herske Pt. 1 | 27.6 | 76 | 0.34 | A mixolydian | 90% | 1% | 26, 54 s |
| Født til å herske Pt. 2 | 25.4 | 99 | 0.59 | D ionian | 83% | 1% | 9, 63 s |
| En mørk horisont | 21.2 | 108 | 0.57 | A aeolian | 79% | 2% | 12, 38 s |
| Visjoner av en eldgammel fremtid | 18.5 | 52 | 0.54 | E phrygian | 83% | 6% | 18, 41 s |
| Reisene til grotter og ødemarker | 24.8 | 54 | 0.57 | E phrygian | 83% | 10% | 10, 83 s |
| Keiser av en dimensjon ukjent | 27.8 | 68 | 0.33 | A aeolian | 79% | 3% | 10, 72 s |
| Child of Curiosity… | 5.6 | 76 | 0.47 | A aeolian | 85% | 2% | 4, 82 s |
| I Am the World | 6.3 | 76 | 0.61 | A aeolian | 84% | 2% | 7, 27 s |
| World Essence | 6.0 | 86 | 0.47 | E phrygian | 86% | 6% | 7, 58 s |
| Across the World of Wonders | 6.7 | 86 | 0.28 | E phrygian | 82% | 8% | 9, 35 s |
| (Passing By) an Old and Raped Village | 5.2 | 76 | 0.37 | A# aeolian | 71% | 2% | 10, 16 s |
| Towards the Gate of Stars | 7.8 | 86 | 0.53 | A aeolian | 77% | 4% | 4, 124 s |
| Spirit of Conquest / The Warfare | 9.3 | 47 | 0.32 | A aeolian | 80% | 3% | 9, 28 s |
| Army of Conquest / The Warfare | 13.1 | 89 | 0.27 | E phrygian | 80% | 10% | 12, 34 s |

What the recordings say:

**1. The tempo is 47–108 in the felt range, median 76.** That is the program's
60–80 with the edges further out. The 30–200 search doubles several of them
(161 for En mørk horisont and two Stargate tracks), which is the hi-hat or the
arpeggio clock; the 40–100 figure is the one that matches the bar.

**2. There is a pulse, and it is stronger than this program's.** Pulse
strength 0.19–0.61 across the fifteen, median 0.47, against 0.06 for this
program's seed 2. "Primarily beatless" (note.com/soundwitches, as quoted in
`dungeonsynth.ts`) is not what these recordings are: a drum or a repeating
figure is keeping time in every one of them, and the early albums (Født,
Ånden, Keiser) are the steadier ones, not the later. This program's dungeon
synth is more beatless than Mortiis.

**3. It is almost all on the white keys.** Eleven of fifteen tracks are A
aeolian or E phrygian, which are the same seven notes; the rest are A
mixolydian, D ionian and one A# aeolian. That is a keyboard player's home
position, the same way a doom tonic is an open string. The program draws a
tonic from twelve and then a `shift`; Mortiis's Era 1 has two tonics in
fourteen of fifteen tracks. Whether that is a rule of the genre or of one
keyboard is not a question a measurement settles, but it is a fact about the
founding records.

**4. The mode fits 69–90%, lower than the transcriptions' 95–100%.** Part of
that is the measurement (reverb tails, noise, a recording's harmonics), and
part is real chromaticism: the flat second carries 10% of Reisene and 21% of
the 1993 demo, which is phrygian as a colour and not a passing tone, the same
as the Burzum pieces and unlike doom.

**5. The sections are about a minute long.** The novelty curve's boundaries
are 27–124 s apart on the median per track, mostly 35–80 s; at 76 bpm a
minute is nineteen bars of four. That is the program's 16-bar section and the
guide's 16–24, read off the audio. The long tracks are not one long section
— Født Pt. 1 has 26 boundaries in 27 minutes — they are many sections of
ordinary length in a row.

**6. The loudness moves in steps of 3–10 dB and the shape is not an arc.**
The ten-second RMS (printed in full by the script) holds a plateau for one to
several minutes and then steps. Født Pt. 1 opens at −22, rises to −18 for two
minutes, drops to −30 for forty seconds, sits at −20 to −26 for fifteen
minutes, and comes back to −17 for two minutes near the end before fading.
Keiser holds −16 to −19 for most of 28 minutes with one dip to −30. The
dynamics are a terrace, not a hill, and the quietest moment is in the middle
rather than at the start. This program's arc — floor to ceiling to floor — is
Almén's romance (`HANDOFF.md` item 16) and these records do not tell it.

**7. The dominant pitch class changes 26–41 times a minute.** Once every 1.5
to 2.3 seconds, which at 76 bpm is every two to three beats. This counts the
melody's motion as well as the harmony's, so it is an upper bound on the
harmonic rhythm; it says the surface is never still for long, under a
harmony that the section figures say is.

---

## 6. Summoning, the bridge between the two

Seventeen files, atmospheric black metal with the keyboards that the genre's
own histories point at. It sits between the two corpora on every figure:

| | Burzum synth (9) | Summoning (17) | Electric Wizard (17) |
|---|---|---|---|
| bars that repeat an earlier bar | 95% | **80%** | 70% |
| riff said before change | 4.0× | **4.0×** | 2.3× |
| riff length | 2 bars | **4 bars** | 2 bars |
| tracks sounding per bar | 2.9 of 5 | **4.0 of 7** | 3.0 of 4 |
| kick / snare / hat per bar | 3.0 / 0.0 / 2.1 | **2.5 / 2.3 / 0.5** | 3.2 / 2.6 / 4.0 |
| tracks by family | choir, fx, piano, pad | **guitar 21, kit 20, choir 15, brass 10, reed 6, strings 5** | guitar 31, bass 21, kit 16 |

Two things in it are worth the program's attention. The kit has a snare and
almost **no hat** (0.5 a bar): kick and snare as timpani and field drum, a
march. That is the "war song" reading in `dungeonsynth.ts`'s intro note, with
a number on it. And the melodic instruments are brass and choir at a note a
beat over guitar tremolo — Ashen Cold's French horn and trumpet lines are 64%
and 37% leaps at 1.9 and 4.3 notes a bar, in 3/4, with a timpani on A2 struck
eight times a bar in the bars it plays. Four of seventeen are in 3/4; none of
the Burzum pieces or the doom is.

---

## 7. What this would change, and has not

None of this is applied. Each row is a measured fact against a line in the
program, and the decision is separate from the reading.

| | the program | the files | what would move |
|---|---|---|---|
| 1 | `dungeonsynth.ts` pins the keys to pad/sustain; `LEGAL_TEXTURES` forbids an arpeggiated pad; `arrange.test.ts` asserts no arp in the genre. The comment's ground is that the guide does not mention arpeggios | Dauði Baldrs, Feðrahellir, Tomhet and Rundtgåing all carry broken-chord lines at one note a beat, 75–86% leaps, under a held layer (§4.5) | A second keys texture for the genre, weighted against sustain; the test's assertion reversed; and the guide's silence is not evidence against the records. **The biggest finding here, and a contradiction of a law the program states** |
| 2 | `drums.snare: [[[2],2],[[3],1]]` — a snare on three or four, always | four of six kit files have **no snare**; the kit is a kick or a timpani at 3 a bar, and cymbals (§4.3) | an empty snare pattern in the pool, weighted above the others |
| 3 | `scales: minor 4, dorian 3, phrygian 1` | Burzum phrygian 5 dorian 3 minor 0; Mortiis aeolian 7 phrygian 6; doom phrygian 15 of 30 | phrygian weighted at least with dorian; and the flat second is a note the held layer may sit on, which `drone.tone` (tonic, fifth) cannot do |
| 4 | `tempo: [60, 80]`, and the intro note calls the music "primarily beatless" | Mortiis 47–108 felt, median 76, pulse strength median 0.47 against this program's 0.06 (§5.2) | the range is roughly right; the pulse is not. Whatever keeps time in these records is louder and steadier than this program's timpani |
| 5 | a tonic drawn from twelve, then `shift` | Mortiis: two tonics in fourteen of fifteen tracks; Sleep: one tonic in eleven of thirteen (§5.3, §2.2) | nothing yet — a measurement on two artists is not a rule — but a genre could state a tonic pool |
| 6 | the arc: floor → ceiling → floor, every record | Mortiis's loudness is a terrace with its lowest plateau mid-record (§5.6) | `HANDOFF.md` item 16's "the archetype is unstateable" has a first data point against the romance |
| 7 | `form.lengths` 8/16/32; `introSec` 64 | Mortiis sections 35–80 s ≈ 16 bars at 76; doom sections 16 bars median (§5.5, §2.7) | nothing — the program's 16 is the records' 16 |
| 8 | there is no doom genre | a doom record is a band playing 2–4-bar power-chord riffs at ~1.8 root changes a bar, 3 of 4 parts sounding in every bar, the kit in 90%+ of bars from bar 4–10, on a tonic that is the open string, a fifth to an octave below this program's lowest note, at a crawl of 48–70 or a drive of 120–140 (§2) | a genre file's worth of numbers, every one sourced to a file rather than a guide; and a design question first, since the arrangement stage is additive and a doom record is not |

On the last row: the arrangement's laws — the two-loop rule, the walk-in, the
shed order, the floor — are pop and dungeon synth laws, and a doom record as
the files describe it breaks the walk-in and the floor from bar four onward.
Before a doom genre is a set of numbers it is a question about whether the
arrangement stage can say "everyone, from here, and the change is which riff",
which is a different axis from who is playing. `PARTS-ELEMENTS-AND-STREAMS.md`
§5 is the nearest thing to that question already written down.

---

## 8. Limits, and how each file was made

**These are transcriptions by fans, not scores.** A transcriber gets the
notes, the order and the repeats right, because those are what they are
transcribing. Tempo is often a single number typed once (Tomhet at 120,
Dauði Baldrs at 100); dynamics are almost never entered (Songsterr's velocity
field appears on 3% of beats); instrument choices are the transcriber's
(Når himmelen klarner on a guitar program). Every tempo figure above is to be
read with that in mind, and the Mortiis audio tempos are the only ones
measured from a performance.

**The Songsterr files were converted, not downloaded as MIDI.** Songsterr
serves a tab as JSON — measures, voices, beats, notes as string and fret
against a tuning, durations as fractions of a whole note with dots and tuplets
folded in, drum notes as General MIDI keys, tempo as an automation list,
repeats as start and count, section markers as text. A small Python script
walked that into a type 1 MIDI file at 960 ticks a quarter, unrolling repeats
(a `repeat: 4` was read as four statements in total), extending tied notes,
skipping dead notes, mapping dynamics to velocity and writing the markers as
MIDI marker metas. The instrument programs are Songsterr's own. The script
is kept beside the corpus folders and not in the repository.

**The riff figures are strict.** A bar repeats an earlier bar only if every
note's onset, pitch and length matches on a 48-per-quarter grid; a grace note
or a slide transcribed as a separate note breaks the match. So "62% of bars
repeat" is a floor on how repetitive the music is, not a ceiling, and "said
1.9×" is the shortest possible reading of a riff's run.

**The corpus is what could be found, not a sample.** Thirteen Sleep and
seventeen Electric Wizard records are most of both catalogues; nine Burzum
synth pieces are most of what exists; fifteen Mortiis tracks are all of Era 1
on archive.org. Nothing was chosen to flatter a number, and the songs that
came out unlike the rest (Saturnine at 140, Giza Butler's 20% repeats, Han som
reiste at 41) are in every table.

**The key and mode are the loudest pitch class and the best-fitting church
mode**, duration-weighted over every pitched track. A record that modulates
reports its longest key; a record whose bass sits on the fifth may report the
fifth (the audio script's low-band tonic did exactly that on the reference and
was corrected to the full band). The mode fit is printed beside every key so a
weak one is visible.

**The audio measurements are the roughest.** Onset autocorrelation finds a
period, not a downbeat, and the 30–200 search doubled the tempo on a third of
the Mortiis tracks; the 40–100 figure is quoted for that reason. Section
boundaries from chroma novelty are where the harmony turns over, which misses
a change of texture on the same chord and hears a long melodic line as several
sections. The reference check passed on one record of this program's own, and
that is the whole of its validation.

## Sources

- Songsterr, tab data for Sleep (artist 7524) and Electric Wizard (artist 7426). https://www.songsterr.com/a/wsa/sleep-tabs-a7524 · https://www.songsterr.com/a/wsa/electric-wizard-tabs-a7426
- bitmidi.com, Burzum and Summoning uploads. https://bitmidi.com/burzum-tomhets-1sthalf-mid and the search results for both names
- midifind.com, Burzum (files/b/burzum), Summoning (files/s/summoning)
- archive.org, Mortiis: identifiers `Mortiis-1993TheSongOfALongForgottenGhost`, `Mortiis-1994FdtTilAHerske`, `Mortiis-1994ndenSomGjordeOpprrr`, `Mortiis-1995KeiserAvEnDimensjonUkjent`, `Mortiis-1999TheStargate`
- dungeonsynth.proboards.com, "music sheets/midi/tabs base & search" — the genre's own MIDI thread, two files in it, searched and found wanting. https://dungeonsynth.proboards.com/thread/46/music-sheets-midi-tabs-search
- Jonathan Foote, "Automatic audio segmentation using a measure of audio novelty", ICME 2000 — the self-similarity novelty curve the section boundaries come from
- `docs/genre-research/DUNGEON-SYNTH-ARRANGEMENT.md` — the prose sources this document was measured against
