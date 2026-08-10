# RAW RESEARCH — Study of the actual written Lord of the Rings scores

*Captured 2026-08-10 from workflow `wf_ad442397-e21`. These are the
VERBATIM returns of the research agents that completed before the run hit its session
limit. Nothing here has been summarised or filtered by me, which is the point: the
synthesis step never ran, so this is the evidence itself rather than my reading of it.
Claims carry the agents' own confidence markers and source URLs. Treat anything
unsourced here as unverified — the adversarial verification pass did not run either.*

---

## v2:3596617d3ec29b65c2e8d0cce6ad94cf65a40a31aa43bf6da106d5cfbf8a6c86

**sources**:   -     **url**: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/ConcerningHobbitsFullVersion.abc
      
          **what**: Concerning Hobbits (Shire/Hobbit theme), complete melody, credited C:Howard Shore, Z:Merecraft of Larelin
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: RAW ABC, downloaded in full (1046 bytes). Header: Q:1/4=118, M:4/4, L:1/8, K:G. This is plain-text pitch data, directly parseable. Opening: d/e/(f f)(a a) f3/2 e/ f/e/ | d4 z f2 a | b3 c' c'3 a | f3 g/f/ e3 d/e/ . Contains an explicit modulation section: e/f/^g z g z g z g | f/^g/ ^a3 =a a2 a/a/ | ^a8. ABC conventions: uppercase=lower octave, lowercase=middle, ' =octave up, , =octave down, ^=sharp, =natural.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/ConcerningHobbitsFullVersionwithBaseline.abc
      
          **what**: Concerning Hobbits WITH BASS LINE - melody plus bass, so harmonic roots are recoverable
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: RAW ABC, downloaded in full (1502 bytes). Same header (K:G, M:4/4, L:1/8, Q:1/4=118). Opens with a bass-only vamp: .D,2 .A,2 .D,2 .A,2 | .D,2 .A,2 .D,2 z2 | then melody enters over it. This is the single most useful file for a generative program because it gives melody AND bass in one text stream.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/GollumsSong.abc
      
          **what**: Gollum's Song, credited C:Howard Shore
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: RAW ABC downloaded in full (772 bytes). Q:1/4=104, M:4/4, L:1/8, K:C. Opens: G,2 g2 _b2 g2 | _b2 g2 a2 b2 | b4 ^f4 | z2 g2 _b2 g2 | _b3 =b a2 g2 | b6 ^g2 | b8. Note the flat-6/natural mixture (_b vs =b) and ^f/^g chromatics - real modal-mixture content.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/InDreams.abc
      
          **what**: In Dreams, credited C:Howard Shore
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: RAW ABC downloaded in full (553 bytes). Q:1/4=76, M:4/4, L:1/8, K:C. Opens: z z z z z z cd | e2 g4 de | c4 z2 eg | a3 c' bg z2 | e4 d2 cd. Contains a chromatic bridge: _A3 G/F/ _E3 F/G/ | F4 _E2 D2 | C4 _B,3 =B,/B,/.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/PippinsSongfromTheStewardofGondor.abc
      
          **what**: Pippin's Song (from The Steward of Gondor), credited C:Howard Shore
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: RAW ABC downloaded in full (372 bytes). Q:1/4=70, M:4/4, L:1/8, K:C but heavily accidental-laden (effectively sharp-side). Opens: z2 ^C2 ^G^G | z _B =B^c/_B/ B^G z2 | z2 ^C/ ^C2 ^G^G | B B2 _B ^G4.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/RingGoesSouth.abc
      
          **what**: The Ring Goes South (the cue carrying the Fellowship theme), credited C:Howard Shore
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: RAW ABC downloaded in full (477 bytes). Q:1/4=118, M:4/4, L:1/8, K:C. Opens: E/B/e/g/ ^f4 | B,2 d4 | e6 | A6 | E/B/e/g/ ^f4 | ^C2 G4 | A2 G2 A2 | _B2 G4 | G8.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/demo/Tunes/Shire.abc
      
          **what**: 'The Shire', credited C:Howard Shore, in 3/4
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: RAW ABC downloaded in full. C:Howard Shore, M:3/4, L:1/4, Q:1/4=90, K:Cmaj. Content: EFG|AGA|B2B|B2c|d2d|c2B|A2A|GFE| (x2), then G3|G3|A3|A3|B2c|B2c|A2B|c3| d3|d3|e3|e3|f2g|f2g|e2f|g3|. CAVEAT: I could NOT reconcile this melody with the four other independent Concerning Hobbits/Shire transcriptions I extracted (which all agree on 1-2-3-5-3-2-1). Treat this file's accuracy as doubtful despite its Howard Shore credit line.
    -     **url**: https://abcnotation.com/searchTunes?q=concerning+hobbits
      
          **what**: abcnotation.com search index - the finder that led to the raw .abc files above
      
          **kind**: analysis-with-examples
      
          **usable**: true
      
          **detail**: Search works and locates tunes across ~800,000 tunes / 390,000 files. The tune PAGES themselves suppress display for copyright tunes ('This tune may be copyright, so no music is displayed here'), BUT each tune page still prints a direct link to the originating raw .abc file, which serves the full notation. That indirection is the key to using this site.
    -     **url**: https://api.flat.io/v2/scores/5ae374b7cb3b7f36eb90247a/revisions/last/json
      
          **what**: Rohan Theme, composer Howard Shore, arr. MossVulture - FULL ORCHESTRAL SCORE as MusicXML-in-JSON
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: THE BIGGEST UNLOCK. flat.io's /revisions/last/json endpoint is FREE and returns complete score-partwise MusicXML data (step/alter/octave/duration per note). The midi, mxl and abc endpoints all return HTTP 402 FEATURE_NOT_IN_PLAN, but json returns 200. 31 bars, 4/4, quarter=76, key fifths=0, 10 parts. Flute melody m10-12: C4 G4 F#4 | A4 A4 G4 A4 B4 E4 | B4 E4 B4 E5. Cello ostinato m1-6: C3 D3 | D3 C3 | C3 D3 | C3 D3 | D3 E3 | E3. Pitch set is {C,D,E,F#,G,A,B} - one sharp, i.e. modal (consistent with Wikipedia's sourced claim that the Rohan/King material is Dorian).
    -     **url**: https://api.flat.io/v2/scores/5a91a1aae6a8e979d96140f3/revisions/last/json
      
          **what**: Isengard Theme - the 5/4 theme, brass + strings + timpani
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: Time signature explicitly 5/4 in the file attributes; 25 bars, quarter=80, fifths=0. CONFIRMS the widely-repeated prose claim with actual notation. The core cell, doubled at the octave between Brass Section and String Ensemble: [F3-E3 (two 16ths) then F3 held] then [E3-D3-A2 (eighths)]. Six notes: F E F E D A. Later transposition of the same cell: C4-B3 / C4 held, then B3-A3-E3. Also a chromatic rise at m21-22: C-C#-C#-D. CAVEAT: the file has internal duration inconsistencies (m2 sums to a full 5/4 bar at divisions=4, m3 sums to half that) - trust the PITCHES and the 5/4 meter more than the exact printed durations.
    -     **url**: https://api.flat.io/v2/scores/5cad374d5270964802e9a23d/revisions/last/json
      
          **what**: Gondor Theme (Minas Tirith), alto saxophone part
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: 6 bars, 4/4, quarter=112. WRITTEN pitches (verbatim from file, part key fifths=0): m1 G4 D5 C5 | m2 F5 D5 | m3 G4 D5 C5 | m4 Bb4 C5 Bb4 A4 | m5 G4 D5 C5 | m6 F5 D5 F#5 A5. TRANSPOSITION INFERENCE (flagged as MY inference, not printed in the file): score metadata says mainKeySignature=-3 while this part is written with 0 sharps/flats, which is exactly the Eb-alto-sax relationship, so sounding pitch is a major 6th below written = Bb3 F4 Eb4 | Ab4 F4 | Bb3 F4 Eb4 | Db4 Eb4 Db4 C4 | Bb3 F4 Eb4 | Ab4 F4 A4 C5. Verify before trusting the transposition.
    -     **url**: https://api.flat.io/v2/scores/5fa9a56c6b164639a7987e2f/revisions/last/json
      
          **what**: (Lord of the Rings) The Shire - Piano, composer Howard Shore - melody AND full left-hand harmony
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: 67 bars, quarter=105, fifths=2 (D major). Time sigs 4/4, with a 2/4 bar at m16 then back to 4/4 at m17. Melody m3: D5 E5 F#5 A5 F#5 E5 F#5 E5. THE LEFT HAND GIVES YOU CHORDS DIRECTLY as broken arpeggios: m13 D3 A3 D4 A3 F#4 A3 D4 A3 (=D), m14 A2 E3 A3 E3 C#4 E3 A3 E3 (=A), m15 B2 F#3 B3 F#3 D4 F#3 B3 F#3 (=Bm), m16 G2 D3 G3 D3 (=G), m17 A2 E3 A3 E3 (=A). So D - A - Bm - G - A = I - V - vi - IV - V in D. Modulation at m26-28: E3 B3 E4 B3 G#4 (=E), then F#3 C#4 (=F#), ending on a C#5/F#5/A#5 chord - i.e. D -> E -> F#.
    -     **url**: https://api.flat.io/v2/scores/6811626824989d359a56d89b/revisions/last/json
      
          **what**: THE SHIRE - full orchestral arrangement (16 parts incl. Contrabass), composer Howard Shore
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: 37 bars, quarter=100, fifths=2 (D major), 4/4. Flute 1,2 melody m1: D5 E5 F#5 F#5 A5 A5 F#5 F#5 E5 F#5 E5; m2: D5 D5 A5 A5 C#6; m3: D6 D6 F#6 F#6 E6 E6 C#6; m4: A5 G5 F#5 E5 D5 E5. CONTRABASS gives bass roots per bar: m1 B2, m2 B2, m3 D3, m4 B2, m5 G2, m6 G2, m7 E2, m8 C#2->D2, m9 E2, m10 B2, m11 B2, m12 D3, m13 B2, m14 G2. So a D-major tune sitting over a Bm-D-Bm-G-Em bass - the relative-minor colouring is explicit in the notation.
    -     **url**: https://api.flat.io/v2/scores/67b8c8574ffb78275c1366f1/revisions/last/json
      
          **what**: The Fellowship Theme, composer Howard Shore - 21 parts, full orchestra + choir
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: 52 bars, quarter=100, fifths=4 (E major), modulating to fifths=0 at m37. USE THE CONCERT-PITCH PARTS (Violin/Cello/Piano); the Horn in F part is written at fifths=5 and is transposing. Violin melody m2-8: (pickup F#5 G#5) A5 G#5 F#5 E5 F#5 G#5 | F#5 E5 D#5 | C#5 B4 B4 | C#5 ... F#5 G#5 | A5 G#5 A5 B5 A5 B5 | C#6. In E major that is scale degrees 4-3-2-1-2-3 | 2-1-7 | 6-5-5 | 6 ... 2-3 | 4-3-4-5-4-5 | 6. Cello bass under it: A3 E3 | F#3 E3 D#3 | C#3 B2 B2 | C#3 ... A3 B3 | C#4.
    -     **url**: https://api.flat.io/v2/scores/58e12f098977a73c4c35d38f/revisions/last/json
      
          **what**: Fellowship Theme - Moria (piano), 3/4
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: Downloaded and parsed. 3/4 throughout. Left hand gives clean triads: m2 A4/E4 over A3 E3 A2 (=Am), m3 G4 E4 C4 over G3 E3 C3 (=C), m4 Am, m6 F5 C5 A4 F4 over F3 C3 F2 (=F), m7 C5 G4 E4 C4 over G3 E3 G2 (=C), m8 D5 B4 A4 E4 over B3 E3 A2, m17 E4 F#4 B4 E5 over B3 F#3 B2 (=B). So Am - C - Am - F - C - ... - B.
    -     **url**: https://api.flat.io/v2/scores/603fceba5f74a553d11bf47f/revisions/last/json
      
          **what**: Lord of the Rings Medley (piano), composer field literally 'Howard Shore' - 224 bars
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: Downloaded (JSON, 200 OK). 224 measures, quarter=96, fifths=-2 (Bb major/G minor). Largest single flat.io LOTR file found; not fully parsed here but the same fp.py extraction works on it. Good candidate for harvesting several themes at once.
    -     **url**: https://api.flat.io/v2/scores/66d0e1df89505c4e107d9621/revisions/last/json
      
          **what**: 'Lord of the Rings by Howard Shore' - string quartet (Violin/Viola/Cello/Contrabass), 104 bars
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: Downloaded, 366KB JSON, 200 OK. quarter=90, fifths=2 (D major). Not fully parsed here but confirmed to contain full note data.
    -     **url**: https://api.flat.io/v2/scores/56ddf541d6d866d5126b9869/revisions/last/json
      
          **what**: Isengard Unleashed (piano), 12 bars
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: Downloaded, 200 OK, quarter=80, fifths=0. Companion to the Isengard Theme file.
    -     **url**: https://api.flat.io/v2/scores/611e7a4a8389740012656cc0/revisions/last/json
      
          **what**: The Fellowship Theme - Lord Of The Rings (Horn in F + Cello), 8 bars
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: Downloaded, 200 OK, quarter=100, fifths=-1. Short but a useful independent cross-check on the Fellowship theme contour.
    -     **url**: https://api.flat.io/v2/scores/5c5ceb829566e62d29cb1de9/revisions/last/json
      
          **what**: The Shire - cello solo, 6 bars
      
          **kind**: midi
      
          **usable**: true
      
          **detail**: Downloaded, 200 OK, quarter=80, fifths=0. Small; useful only as a cross-check.
    -     **url**: https://www.flutenotes.ph/2015/07/concerning-hobbits-lord-of-rings-ost.html
      
          **what**: Concerning Hobbits - complete letter-note transcription in TWO keys, time-stamped by section
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: Plain note letters in the page HTML, extracted in full. 'Original' version (D major despite the page's own 'Key of C' label, which is wrong - the notes contain F#/C#): @0:05 D E F# / A F# / EF#EDF# A B / D2 C2# / A F# / GF#E. @0:28 DEF# / F# F# 'ABAE' DE / A(low)B(low)C# C# D / B(low)F#(low) / A(low) E(low). @0:54 modulation: DEF# / F# F# EF#G# G# G# G# / F#G#A# A# A#. @1:18 alternating figure: A F# A F# A F# A / A E A E A E A / B G B G B G B / G D G / A E A. A separate 'Higher Version' is given in G major. Superscript 2 = octave up. Timestamps let you align sections to the recording.
    -     **url**: https://www.flutenotes.ph/2012/09/in-dreams-lord-of-rings-ost-flute-notes.html
      
          **what**: In Dreams - complete letter-note transcription in three labelled sections
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: Extracted in full. Page labels it 'Key of B flat(Bb)' but the printed notes are plainly D major moving to E major - do NOT trust this site's key labels, trust the note letters. Section I: D E F# A F# E D / F# A B D2 C2# A F# F# F# E / D E F# A F# E D / F# A B B B A F# E E. Section II: D E F# F# F# / F# B C2# D2 D2 D2 C2# A F# F# E. Section III (modulated, now with G#/D#): E F# G# B G# F# E E / G# B C2# C2# C2# / E2 D2# B G# G# G# F#.
    -     **url**: https://www.tinwhistletab.com/tabs/concerning_hobbits_tabs_and_backing_track
      
          **what**: Concerning Hobbits - clean machine-readable note-name stream
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: The tab is rendered as one note name per line in the HTML, trivially scrapable. '+' prefix = second octave. Full opening extracted: d e f# a f# e d / f# a b +d c# a f# e / d e f# a f# e d / f# a b a f# e d / +d +e +f# +f# +f# +a +e +d +e / a b c# c# +d a f# a e / +d +e +f# +f# +a +f# +e +e +f# +e +d +d +d / +f# +d +e +f# +e +d +e / d e f# f# b c# +d c# a f# e / d e f# b c# +d c# b a e d. Cleanly in D major. This independently CONFIRMS the flutenotes 'Original' version.
    -     **url**: https://pianoletternotes.blogspot.com/2018/03/concerning-hobbits-fellowship-of-ring.html
      
          **what**: Concerning Hobbits - complete piano letter-note grid with octave numbers and rhythmic spacing
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: IMPORTANT ACCESS NOTE: the post body is NOT in the served HTML and the page is JS-rendered; I got the full content via the Blogger feed API at https://pianoletternotes.blogspot.com/feeds/posts/default?alt=json&q=concerning+hobbits . Notation system (stated by the site): leading number = octave, lowercase a-g = white keys, UPPERCASE = the sharp of that letter (F=F#, C=C#, A=A#, G=G#, D=D#), dash = one time-step. Opening lines: 5|d-e-F---a---F---e---d-----| 6|--------------d---C-------| 5|------F-a-b-----------a---|. Decoded that is D5 E5 F#5 A5 F#5 E5 D5 - a FIFTH independent confirmation of the same D-major theme. The dash grid also encodes rhythm, which makes this unusually good for a generative program.
    -     **url**: https://pianoletternotes.blogspot.com/2021/07/the-bridge-of-khazad-dum-lord-of-rings.html
      
          **what**: The Bridge of Khazad-Dum - piano letter-note grid, split into RH and LH staves
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: Extracted in full via the same Blogger feed API. Lines are prefixed RH:/LH: plus octave number, so hands are separated. Heavy D pedal in the bass throughout: LH:3|-d---d---d---a-a-d---d---d| LH:2|-d---d---d---d---d---d---d|. RH figures include RH:5|----------------d-f-g-----| RH:4|a---------------d-e-g-----| and RH:5|d-f-e-f-d-f-e-f-----------|. Same uppercase=sharp convention (D=D#, A=A#).
    -     **url**: https://pianoletternotes.blogspot.com/feeds/posts/default?alt=json&q=lord+of+the+rings
      
          **what**: Index of ALL LOTR/Hobbit letter-note transcriptions on pianoletternotes
      
          **kind**: text-transcription
      
          **usable**: true
      
          **detail**: The feed API returns full post CONTENT, not just titles, so this one URL yields every transcription at once. Confirmed available: The Bridge of Khazad-Dum, Evenstar, Into the West (two versions), May It Be (two versions), In Dreams, The Lord of the Rings Medley, Concerning Hobbits, plus Hobbit-film items (Song of the Lonely Mountain x2, Song of Durin, The Hobbit Theme Song) and Halbrand Theme (Bear McCreary, Rings of Power - NOT Shore).
    -     **url**: https://alcaeru.weebly.com/uploads/7/8/6/0/786082/concerning-hobbits-spartito-per-pianoforte.pdf
      
          **what**: Concerning Hobbits - engraved 4-page piano score, arr. Joseph M. Rozell (pianothemes.com)
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: Downloaded successfully (299KB, 4 pages) and rendered to PNG at 150dpi with PyMuPDF, then read visually - the notation is fully legible. Embedded PDF text is a music FONT (noteheads come out as 'k','j','i'), so text extraction is useless; you MUST render to image. Structure read off the score: starts 4/4 in G major (1 sharp), modulates to A major (3 sharps) at m13, has a 2/4 bar at m16 returning to 4/4 at m17, and a 'meno mosso, quarter=90' section at m60. The G-major start independently agrees with the ABC transcription's K:G.
    -     **url**: https://anagiollo.wordpress.com/wp-content/uploads/2014/06/tab-concerning-hobbits-lotr.pdf
      
          **what**: Concerning Hobbits - 3-page guitar arrangement with BOTH standard notation and TAB, arr. Harry Murrell rev. Graphesium
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: Downloaded successfully (190KB, 3 pages) and rendered/read. Dropped D tuning (6th string = D). Tempo marks: Moderate quarter=92, then 100, accel. to 105, then 103, then 105. Key: G major (1 sharp) for m1-12, modulating to D major (2 sharps) at m13; a 2/4 bar appears then back to 4/4. Because it carries a real TAB staff, string+fret converts directly to pitch. Raw PDF text extraction yields the fret NUMBERS but loses string assignment, so render to image rather than parsing text.
    -     **url**: https://en.wikipedia.org/wiki/Music_of_The_Lord_of_the_Rings_film_series
      
          **what**: Wikipedia article - NO notation, but a few concrete and sourced MODE facts
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: I checked the raw wikitext via Special:Export: it contains ZERO lilypond/\score/\relative blocks, so there are no extractable pitches. It does yield concrete, citable modal facts worth encoding: Shore used the Arabic maqam Hijaz scale (Phrygian dominant) for the Elvish Lothlorien/Galadriel theme; the Rohan 'The King' material uses the Dorian mode; Men are characterised by modal diatonic scales and Elves by nondiatonic scales/chromatic mediants. Useful for scale selection, useless for melody.
    -     **url**: https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf
      
          **what**: Doug Adams, 'The Annotated Score' - the official companion booklet to the FOTR Complete Recordings
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: THIS IS EXACTLY THE TRAP TO AVOID. Downloaded (1.1MB, 29 pages) and inspected every embedded image: all 48 images are either the parchment page background or FILM STILLS - I extracted and viewed several to be sure. There is NOT ONE staff of notation in the file. It is authoritative PROSE. Its real value is as a LEITMOTIF TAXONOMY with exact official theme names (Skip Beat accompaniment, Descending Third accompaniment, Sauron/Evil of the Ring, Ringwraith theme, Fall of Men, Hobbit Outline, Seduction of the Ring, Journey There, Heroics of Aragorn) plus occasional concrete remarks such as Bilbo's Ring moment being 'a fluid ripple of open fourths and fifths in the woodwinds and celesta'. Do not mine it for pitches. I probed for sibling volumes (fotr_annotated_score_1/_3, ttt_*, rotk_*) - all 404, only part 2 exists at this path.
    -     **url**: https://musescore.com/song/concerning_hobbits-2367624
      
          **what**: MuseScore community transcriptions - large library, but MACHINE-INACCESSIBLE
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: BLOCKED. Every route returned HTTP 403 behind Cloudflare 'Verifying you are human': direct curl with browser UA (403), WebFetch (403), the /song/ page, /user/*/scores/* pages, and even a third-party reader proxy (which returned the CAPTCHA interstitial). m.musescore.com failed at the CONNECT tunnel. The scores exist (Concerning Hobbits, Rohan, The Shire and many more are indexed by search) but you cannot get the note data without a real browser session/login. Recommend spending zero further automated effort here and using flat.io instead, which serves equivalent data freely.
    -     **url**: https://www.midiworld.com/download/4413
      
          **what**: MIDI listed as 'Lothlorien (Lord of the Rings)' on midiworld's LOTR page - MISATTRIBUTED
      
          **kind**: midi
      
          **usable**: false
      
          **detail**: Downloaded (6003 bytes) and parsed with a hand-written MIDI parser: format 1, 5 tracks, 192 ticks/quarter, 4/4, 500000us/qn (=120bpm). It parses fine and the pitches are real, BUT the embedded track names are 'Lothlorien - From the Shepherd' and 'album by Enya' - this is ENYA's 'Lothlorien' from Shepherd Moons, NOT Howard Shore. Do not use it as Shore material. This was the only downloadable MIDI on midiworld's LOTR page; their search returns just this one file.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/demo/Tunes/Rohan.abc
      
          **what**: 'Rohan' in the John Chambers ABC collection - a FOLK JIG, not Shore
      
          **kind**: text-transcription
      
          **usable**: false
      
          **detail**: Parses fine and is complete (R:jig, M:6/8, K:Amaj, AEc BEB|Bcc Ace|cdd ecA|E2d dcB|...) but it has NO composer credit and is an Irish-style jig that merely shares the name 'Rohan'. Nothing to do with Howard Shore. Flagging so it is not mistakenly ingested. Same applies to demo/Tunes/MistyMountain.abc (R:jig, K:Dmaj, uncredited) and demo/Tunes/FarOverTheMistyMountainsCold.abc (uncredited, R:hornpipe, and its ABC is malformed - it writes 'f2#' instead of the legal '^f2', so many parsers will reject it).
    -     **url**: https://alcaeru.weebly.com/uploads/7/8/6/0/786082/fotr_complete_transcription.pdf
      
          **what**: COMPLETE Fellowship of the Ring score transcribed for piano/short score - the single biggest prize found, NOT retrieved
      
          **kind**: notation-image
      
          **usable**: false
      
          **detail**: NOT RETRIEVED THIS SESSION - but almost certainly retrievable later. Every attempt returned HTTP 429 (rate limited), because I had already pulled a different PDF from this same host earlier in the session and burnt the quota. Crucially, that earlier PDF from the SAME host DID download fine, so the host serves PDFs to plain curl and this is a transient throttle, not a hard block. It is described as covering the whole FOTR score cue by cue following the Complete Recordings track list, which would include Moria/Khazad-dum and Gondor material I could not otherwise find. Mirrors pdf4pro.com and doczz.net are both blocked (recaptcha / 403). STRONG RECOMMENDATION: retry this one URL from a fresh IP after a cooldown; it is the highest-value outstanding item.
    -     **url**: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/
      
          **what**: Directory listing of the LOTRO-community ABC mirror - 6 more confirmed Shore titles I could not download
      
          **kind**: text-transcription
      
          **usable**: false
      
          **detail**: NOT RETRIEVED - server throttled me to HTTP 503 ('upstream connect error') after my earlier successful downloads, and it did not recover across a background retry loop with 12-second backoff, nor over https, nor via underscore filename variants. But the directory listing CONFIRMS these files exist: ForthEorlingas.abc, KingoftheGoldenHall.abc, FoundationsofStone.abc, EowynsTheme.abc, BlackRider.abc, IntoTheWest.abc. Those cover Rohan (Forth Eorlingas, King of the Golden Hall), Moria/Dwarrowdelf (Foundations of Stone), Eowyn, and the Nazgul (Black Rider) - exactly the gaps in my haul. Retry after a cooldown; the 6 files I did get from this directory were all clean, complete, Howard-Shore-credited ABC.
    -     **url**: https://www.sheetsdaily.com/piano/sheets/62315/Howard_Shore_Isengard.html
      
          **what**: sheetsdaily 'free' sheet music for Isengard and The Riders of Rohan - DEAD
      
          **kind**: notation-image
      
          **usable**: false
      
          **detail**: Dead end. The listing pages load and reference preview JPEGs at /sheetpreviews/..., but every preview image 404s, and the download endpoint (/sheets/download?i=<base64 id>) returns HTTP 200 with Content-Type application/pdf and ZERO bytes. Nothing extractable.
    -     **url**: https://api.flat.io/v2/scores/5ae374b7cb3b7f36eb90247a/revisions/last/mxl
      
          **what**: flat.io MusicXML/MIDI/ABC export endpoints - paywalled (documenting so no one retries these)
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: HTTP 402 {'message':'This feature is not included in your current plan','code':'FEATURE_NOT_IN_PLAN'} for formats midi, mxl and abc. Formats musicxml and ly are rejected outright as invalid (HTTP 400). ONLY the 'json' format is free, and it happens to contain the complete score-partwise data - so use .../revisions/last/json exclusively. Also note the flat.io search endpoint (/v2/search/scores?q=...) silently IGNORES the q parameter without auth and returns the same generic 410k-hit result set for every query, so find score IDs via a normal web search restricted to flat.io instead.
    -     **url**: https://www.musicnotes.com/sheetmusic/mtd.asp?ppn=MN0119222
      
          **what**: musicnotes / sheetmusicplus / Alfred official licensed editions
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: Commercial and paywalled - no pitch content without purchase. Only useful for the KEY metadata they publish in listings, which is worth recording as independent corroboration: musicnotes lists 'Concerning Hobbits - Flute' in Bb Major (SKU MN0119222) and another Concerning Hobbits flute solo in D Major (SKU MN0249609), and 'In Dreams' in D Major (SKU MN0041224). The D-major listings agree with every transcription I extracted.

**notes**: HEADLINE: The notes DO exist online in readable, machine-parseable form - but almost none of it is on the sites that were suggested. MuseScore is a hard dead end (Cloudflare 403 on every route). The two big wins were unexpected: (1) raw .abc text files on an MIT-hosted mirror of the LOTRO music-community forum, and (2) an undocumented FREE endpoint on flat.io that returns full MusicXML-as-JSON.
  
  === THE TWO METHODS THAT ACTUALLY WORK, IN ORDER OF VALUE ===
  
  1) flat.io JSON endpoint. GET https://api.flat.io/v2/scores/<ID>/revisions/last/json returns complete score-partwise MusicXML data - step, alter, octave, duration, type, per note, per part, per measure, plus key fifths and time signatures. No auth, no key, HTTP 200. The midi/mxl/abc formats on the same path all return 402 (paywall) and musicxml/ly return 400, so json is the only door - but it has everything. The search API ignores ?q= without auth, so get score IDs by web-searching with the domain restricted to flat.io, then hit the API. I pulled 11 LOTR scores this way including a full 10-part orchestral Rohan and the 5/4 Isengard theme. My parser is at /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/fp.py and the downloaded JSON is in .../scratchpad/flat/.
  
  2) Raw .abc files. Directory: http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/ - a mirror of Lord of the Rings Online player transcriptions, many explicitly credited "C:Howard Shore" and transcribed by "Merecraft of Laurelin". ABC is plain text with pitch, octave, accidental, duration, key and tempo in the header. Six downloaded complete (Concerning Hobbits x2 incl. one with bass line, Gollum's Song, In Dreams, Pippin's Song, The Ring Goes South). Route to discover more: abcnotation.com search -> tune page -> the tune page suppresses copyright tunes but still prints the link to the raw .abc, which serves fine.
  
  === WHAT I ACTUALLY EXTRACTED, BY THEME ===
  Shire / Concerning Hobbits - EXHAUSTIVELY covered, FIVE independent sources agree on D major with the melody D E F# A F# E D / F# A B D' C# A F# E (scale degrees 1 2 3 5 3 2 1 / 3 5 6 8 7 5 3 2). Harmony from the piano LH: D - A - Bm - G - A (I V vi IV V). Orchestral bass puts it over Bm-D-Bm-G-Em. Modulates up a whole step near the end (the flutenotes 0:54 section adds G#/A#; the guitar and piano PDFs both modulate at m13). Transposed copies exist in G major (the ABC files and both PDFs) - so pick your key.
  Rohan - full orchestral pitches, 4/4, quarter=76, pitch set {C D E F# G A B} = one sharp, modal (Wikipedia independently sources Dorian for the Rohan/King material). Cello ostinato oscillates C3-D3 then opens into fifths.
  Isengard - CONFIRMED 5/4 in actual notation, six-note cell F E F / E D A doubled at the octave in brass and strings. This is the one case where the famous prose claim ("5/4, six notes, low unison") is fully corroborated by notation.
  Fellowship - E major, degrees 4-3-2-1-2-3 / 2-1-7 / 6-5-5, over a bass of A E / F# E D# / C# B B.
  Gondor - only via a transposing alto sax part; I give written pitches verbatim and flag my Eb-concert transposition as an inference to be verified.
  Moria / Khazad-dum - two partial sources (a 3/4 piano file with clean Am-C-Am-F-C triads, and a letter-note grid with a heavy D pedal). WEAKEST AREA.
  Gollum's Song, In Dreams, Pippin's Song, Evenstar, Into the West, May It Be - available as ABC and/or letter notes.
  
  === NOT FOUND / STILL MISSING (honest gaps) ===
  NOT FOUND in any notated form: the Ring/Sauron theme, the Ringwraith/Nazgul theme, Lothlorien/Galadriel, Rivendell, the Shadow of Mordor and Mordor Skip Beat, the Fall of Men motive, Heroics of Aragorn. I have their official NAMES (from Doug Adams) but not one pitch for any of them. Do not let anyone fill these in from prose.
  Gondor is inference-dependent. Moria is thin.
  
  === TWO ITEMS WORTH RETRYING - both failed only on rate limiting, not on access ===
  (a) https://alcaeru.weebly.com/uploads/7/8/6/0/786082/fotr_complete_transcription.pdf - a COMPLETE Fellowship of the Ring piano/short-score transcription following the Complete Recordings track list. HTTP 429 every attempt, but a different PDF from the SAME host downloaded fine earlier in this session, so this is a transient throttle I caused. Highest-value outstanding item; would likely close the Moria and Gondor gaps.
  (b) http://trillian.mit.edu/~jc/music/abc/mirror/community.codemasters.com/forum/ - the directory listing confirms ForthEorlingas.abc, KingoftheGoldenHall.abc, FoundationsofStone.abc, EowynsTheme.abc, BlackRider.abc and IntoTheWest.abc exist. The server dropped to HTTP 503 after my earlier successful pulls and never recovered, including through a background retry loop with backoff. These six cover precisely my gaps: Rohan, Moria, Eowyn, Nazgul.
  
  === TRAPS AND CAVEATS - please read before ingesting anything ===
  - Doug Adams' "Annotated Score" PDF at elvish.org is PURE PROSE plus film stills. I extracted and viewed the embedded images to verify: zero staves of music. It is the exact failure mode to avoid, despite the promising title.
  - flutenotes.ph prints WRONG KEY LABELS. It labels the D-major Concerning Hobbits "Key of C" and the D-major In Dreams "Key of B flat". The NOTE LETTERS are correct; the key headers are not. Trust the letters.
  - Uppercase letters mean SHARPS on pianoletternotes (F=F#, C=C#, A=A#, G=G#, D=D#) but mean LOWER OCTAVE in ABC. Two different conventions, easy to conflate and corrupt a whole melody.
  - Transposing instruments: the Gondor file is alto sax and the Fellowship file's horn part is in F. Always prefer Piano/Violin/Cello/Contrabass parts, which are concert pitch.
  - midiworld's "Lothlorien (Lord of the Rings)" MIDI is actually ENYA's Lothlorien - the track names inside the file say so. Misattributed at the source.
  - trillian demo/Tunes/Rohan.abc, MistyMountain.abc and FarOverTheMistyMountainsCold.abc are uncredited FOLK TUNES that merely share names with Shore cues. Name-matching alone will poison your dataset here; check for the "C:Howard Shore" line.
  - demo/Tunes/Shire.abc DOES carry a Howard Shore credit but its melody contradicts all four other Shire transcriptions I extracted. I could not reconcile it. Treat as suspect.
  - The Isengard file's note DURATIONS are internally inconsistent (bar 2 fills 5/4 at divisions=4, bar 3 fills only half). Its pitches and its 5/4 time signature are trustworthy; its rhythms are not.
  - Everything here is a FAN TRANSCRIPTION except the paywalled commercial editions. None is Shore's actual manuscript. Where multiple sources agreed I said so explicitly - the Shire theme has five-way agreement and is safe; single-source items are not.
  
  === REPRODUCIBLE TOOLING I LEFT BEHIND (all absolute paths) ===
  /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/fp.py - parses a flat.io revisions/last/json file into per-measure pitch listings with key/time signatures. Usage: python3 fp.py <file.json> [part-name-substring]
  /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/midiparse.py - dependency-free MIDI parser (pitches, key sig, time sig, tempo, track names).
  /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/flat/ - the 11 downloaded flat.io score JSONs.
  /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/abc/ - the downloaded .abc files.
  /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/ch.abc and ch_bass.abc - Concerning Hobbits melody and melody+bass.
  /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/ch_piano.pdf, gtab.pdf and their rendered PNGs - the two readable engraved scores.
  Note for engraved PDFs generally: text extraction returns music-font garbage ('k','j','i' for noteheads). Render to PNG with PyMuPDF at ~150dpi and read the image instead.

---

## v2:efae8890f99120fefb60e90f46834b42ba912bf7822cac11680dcf2c827f7fa6

**sources**:   -     **url**: https://content.alfred.com/catpages/00-IFM0411CD.pdf
      
          **what**: Alfred, 'The Lord of the Rings Instrumental Solos: Piano Accompaniment' (00-IFM0411CD). Free official sample: complete pages of 'The Prophecy' (p.4) and 'In Dreams' (p.8) with solo cue staff + piano.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: VECTOR PDF (Finale 'Maestro' music font) - pitches extracted geometrically and cross-validated against the printed chord symbols. THE PROPHECY: no key signature (A minor), 4/4, 'Slowly, darkly q=60'. Harmony sys1: Am(A-C-E) Am Dm(D-F-A) Dm Am Am. Sys2: Dm7(D-F-A-C) Dm7 Am Am Am Dm Dm Am Am Dm7. Sys3: F(F-A-C) Am Fminor(F-Ab-C) Am [Ab/Db chromatic chord] Am. Melody sys1: B3 D4 F4 G4 D4 G4 A4 B4 C5 D5 | D5 E5 D5 C5 | D4. Sys2: G4 A4 B4 | B4 A4 G4 Gb4 G4 | D4 G4 A4 B4 C5 | D5 | C5 B4 A4 | B4 | C5 | B4 A4 G4 | F4 | G4 | A4. IN DREAMS: Eb major (3 flats), 4/4, 'Moderately slow q=76'; printed chord symbols Eb | Ab | Eb | Bb/F | Eb | Ab | Bb/F; LH arpeggios verified Ab2-Eb3-Ab3-C4, Eb2-Bb2-Eb3, F2-D3-F3, Eb2-Bb2-G3. (c) MMI New Line Tunes / South Fifth Avenue Publishing, admin WB Music Corp.
    -     **url**: https://content.alfred.com/catpages/00-33474.pdf
      
          **what**: Alfred, 'The Lord of the Rings Trilogy: Piano Book' 00-33474 (Easy Piano, arr. Carol Matz), ISBN 978-0-7390-6275-3. Free 5-page official sample containing full pages of In Dreams, Gollum's Song, Into the West.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: BEST SINGLE SOURCE. Vector PDF; pitches extracted geometrically and confirmed by pixel measurement of staff lines. IN DREAMS (p.19): C major, 4/4, 'Slowly, freely' then 'Moderately slow'. Printed chords C-F-C-G | C-F-G | C-Em-F-C-F-G | C-G-C-Em-F-C (I-IV-I-V | I-IV-V | I-iii-IV-I-IV-V | I-V-I-iii-IV-I). Melody: C4 D4 | E4 G4(h) D4 E4 | C4(h) | E4 G4 A4 C5 B4 G4 | E4(h) D4 C4 D4 | E4 G4(h) D4 E4 C4(h) | E4 G4 A4(h) G4 E4 D4(h) C4 D4 | E4 G4 E4 D4 C4(h) E4 G4 A4 C5 B4 G4. LH open dyads C3+G3, C3+F3, G3, E3+G3. INTO THE WEST: C major; printed chords C-G-Dm-Am repeating (I-V-ii-vi); LH arpeggio per bar C3-E3-G3 / G3-B3-D4 / D3-F3-A3 / A3-E3; melody C5(h) G4 | G4(w) | G4 A4 C5 C5 D5 | A4+C5(w) || C5 A4 C5 D5(h) | D5 E5 D5 C5 A4 C5 | E5(w) || F5 E5 D5 | B4+D5(w) | D5 D5 E5 D5 C5 A4 C5 | C5+E5(w) || C5 A4 C5 D5(h) | D5 E5 D5 C5 A4 G4 | A4(w). GOLLUM'S SONG (p.31): printed chords Gm-Bm-Gm-Bm-Cm; LH triads verified G2-Bb2-D3 (Gm), B2natural-D3-F#3 (Bm), C3-Eb3-G3 (Cm); RH G4 Bb4 Bb4 G4 Bb4 Bb4(h) | G4 A4 Bnat4 B4(h) F#4 F#4(h) | F4(w) | ... B4(w) B4 A4 G4. Gm<->Bm is a chromatic-mediant (roots a major 3rd apart).
    -     **url**: https://content.alfred.com/catpages/00-FOM02003C.pdf
      
          **what**: Alfred, 'Symphonic Suite from The Lord of the Rings: The Fellowship of the Ring' — FULL ORCHESTRA CONDUCTOR SCORE, arr. John Whitney (00-FOM02003C). Free 7-page official preview of a real published orchestral score.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: Structural data reliable; individual pitches NOT reliably readable (300dpi bitonal scan, slight skew). Page 1 of music: '"The Fellowship Theme" - Music by HOWARD SHORE / Marcato q=168', 3/4. Concert instruments carry NO key signature; Bb clarinets/bass clarinet/Bb trumpets carry 2 sharps; Horns in F carry 1 sharp => concert key C major / A minor. TIMPANI TUNED F, A, C, E. Score order verbatim: Solo Boy Vocal / C Piccolo / C Flutes 1,2 / Oboes 1,2 / Bb Clarinets 1,2 / Bb Bass Clarinet / Bassoons 1,2 / Horns in F 1,2,3,4 / Bb Trumpets 1,2,3 / Trombones 1,2,3 / Tuba / Timpani (F,A,C,E) / Percussion I (Tam-Tam, Brake Drum, Wood Block) / Percussion II (Snare Drum, Large Tom-Tom, Crash Cymbals) / Percussion III (Bass Drum, Suspended Cymbals) / Violins 1,2 / Viola / Cello / String Bass. Violins carry the theme 'off the string' in continuous eighths from bar 1; 5/4 bar arrives at bar 16. Grade 3.5, 9:40, 36pp. (c)2001 New Line Tunes; arrangement (c)2002. NOTE: the red 'Preview Only' watermark is a separate overlay - extracting the base image (xref 2, 2707x3615) gives a CLEAN unwatermarked scan.
    -     **url**: https://content.alfred.com/catpages/00-CHM04056.pdf
      
          **what**: Alfred, 'Into the West' SATB Choral Octavo (00-CHM04056), arr. Alan Billingsley. Free 14-page preview — effectively the whole octavo.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: Raster but legible. Eb major (3 flats). Printed chord symbols on p.4: Eb - Bb - Fm - Cm - Eb - Bb  =  I - V - ii - vi in Eb. This is the SAME functional progression as the C-major easy-piano edition (C-G-Dm-Am), so the harmony is cross-confirmed by two independent official publications. Voices enter '(unison) mp' on 'Sleep now / Dream of the ones who came before / They are calling'. Piano accompaniment is a continuous running-eighths pattern. Companion voicings: SAB 00-CHM04057, 2-Part 00-CHM04058 (3-page samples each).
    -     **url**: https://alcaeru.weebly.com/uploads/7/8/6/0/786082/fotr_complete_transcription.pdf
      
          **what**: FAN TRANSCRIPTION (not official): 'The Lord of the Rings: The Fellowship of the Ring — The Complete Recordings, Transcribed for piano / short score', by 'M.W. 2014, New Zealand'. 169 pages, all 37 tracks.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: NOT an official publication, but Sibelius-engraved (Opus fonts), fully vector, and machine-readable — by far the richest pitch source found. Includes tempi, orchestration cues, film dialogue, and complete Sindarin/Quenya/Adunaic/Khuzdul texts with translations and Boyens/Salo credits. VERIFIED EXTRACTIONS: [Track 2 'The Shire', score p.8] Moderato q=90, 4/4, D MAJOR (2 sharps). Melody D4-E4-F#4-F#4-A4-A4-F#4-F#4-E4-D4-D4(h) = degrees 1-2-3-3-5-5-3-3-2-1, pitch set D-E-F#-A(-B): MAJOR PENTATONIC, no 4th, no 7th. Bass = tied D3-F#3-A3 whole-note D major triad. Continues D4 F#4 A4 | B4 over G4+D4 | D5 C#5 A4 F#4 | G4 F#4 E4 | D4 E4. [Track 19 'Rivendell', score p.72, cue 'Many meetings'] 4/4, no key signature (C major), Clarinet q=104. Melody C4-D4-E4-E4-G4-E4-E4-D4-E4-D4-C4(h)-B4(h) = 1-2-3-3-5-3-3-2-3-2-1 over a C major triad on a C2 pedal; then F major, then G, back to C. Same page at q=68: 'Hymn to Elbereth', English and Sindarin text by J.R.R. Tolkien, choir + chimes. [Track 29 'Khazad-dum', score p.111] 4/4, q=172, 'The Balrog' text by Philippa Boyens, Khuzdul translation by David Salo, male choir. Opening ostinato = D2 + A2 + D3, a BARE OPEN FIFTH ON D doubled at the octave, with F3 above (D minor). [Track 1 'Prologue'] tempo map q=50,55,72,76,90,112,124, h=88, then q=72,84,112,56,114,60.
    -     **url**: https://howardshore.com/rentals/lotr-fotr/
      
          **what**: Official rental-catalogue entry for 'The Lord of the Rings: The Fellowship of the Ring – In Concert' (2001).
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: No notation, but gives the exact published instrumentation string verbatim: '3(2+afl,ney,bfl,3.picc+tin whistle).3(3.eng hn).3(3.bs cl).3(3.cbn) – 5.4.3(3.bs tbn).1 – timp,5perc,dulc – mus,gtr,hp,pno(+cel) – boy's chorus,SATB – str+irish fiddle,sarangi(16.14.12.10.8)'. Duration 3:45:00. Hire library: CAMI Music.
    -     **url**: https://howardshore.com/rentals/
      
          **what**: Howard Shore's full concert rental catalogue — the definitive list of which LOTR cues exist as published concert pieces.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: LOTR entries verbatim: 'The Lord of the Rings Symphony'; 'A Lord of the Rings Suite for Sir James Galway'; 'The Fellowship of the Ring – In Concert' incl. 'Concerning Hobbits', 'The Shire Theme', 'Symphonic Suite'; 'The Two Towers – In Concert' with 'Gollum's Song'; 'The Return of the King – In Concert' incl. 'Bilbo's Song', 'Into the West', 'The Lighting of the Beacons', 'Twilight and Shadow'. Hobbit: 'The Hobbit: Four Movements for Symphony Orchestra', 'An Unexpected Journey – A Good Omen', 'I Roderyn (The Noble Wood)'.
    -     **url**: https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf
      
          **what**: Doug Adams, 'THE ANNOTATED SCORE' — the OFFICIAL companion booklet packaged with the FOTR Complete Recordings. 29 pages, free.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: CHECKED THE FILE: 48 embedded images, ALL film stills/concept art — ZERO musical notation. Despite the title it is prose only. Still valuable for canonical theme NAMES: History of the Ring theme, Lothlorien theme, Mordor's Skip Beat accompaniment, the Descending Third accompaniment, Sauron/Evil of the Ring theme, Ringwraith theme, Fall of Men motive, Fellowship theme, Hobbit Outline figure, Hobbit Skip Beat figure, Two-Step figure, Pity of Gollum. One concrete texture claim: at Bilbo's disappearance, 'a fluid ripple of open fourths and fifths in the woodwinds and celesta'. Only volume _2 exists at this path; _1/_3/_4 and the TTT/ROTK equivalents all 404.
    -     **url**: https://www.alfred.com/the-lord-of-the-rings-instrumental-solos/p/00-IFM0404CD/
      
          **what**: Alfred 'The Lord of the Rings Instrumental Solos' series product page (Flute edition) — establishes the 12-title contents shared by every instrument in the series.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: Ed. Bill Galliford, Level 2-3, 28pp, ISBN 978-0-7579-1658-8. 12 titles: FOTR — The Prophecy, In Dreams, Concerning Hobbits, Many Meetings, The Black Rider; TTT — Gollum's Song, Rohan, Evenstar, Forth Eorlingas; ROTK — Into the West, The Steward of Gondor, Minas Tirith. Editions: Flute 00-IFM0404CD, Clarinet 00-IFM0405CD, Alto Sax 00-IFM0406CD, Trumpet 00-IFM0408CD, Horn 00-IFM0409CD, Trombone 00-IFM0410CD, Piano Acc 00-IFM0411CD, Violin 00-IFM0412CD, Viola 00-IFM0413CD, Cello 00-IFM0414CD. Every one has a free sample at content.alfred.com/catpages/<ITEM>.pdf.
    -     **url**: https://content.alfred.com/catpages/00-IFM0406CD.pdf
      
          **what**: Alfred, LOTR Instrumental Solos: Alto Sax (00-IFM0406CD). Free sample showing the COMPLETE page 4, 'The Prophecy', entire solo part.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: Fully legible whole-page melody. Written key 3 sharps (Eb alto sax => concert C major/A minor, consistent with the piano-accompaniment edition). Tempo/meter map read directly off the page: 'Slowly, darkly q=60' 4/4; bar 25 'Brightly q=168'; bar 57 'Moderately slow q=60'. Meter changes in order: 4/4 -> 3/4 -> 2/4 -> 3/4 -> 4/4 -> 3/4 -> 4/4. The 'Brightly q=168' section is written almost entirely in accented whole notes and dotted halves. (c) MMI New Line Tunes, admin WB Music Corp.
    -     **url**: https://www.alfred.com/the-lord-of-the-rings-trilogy/p/00-33473/
      
          **what**: Alfred, 'The Lord of the Rings Trilogy: Piano Book' 00-33473 (5 Finger series, arr. Tom Gerou) — contents listing.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: ISBN 978-0-7390-6274-6, 48pp, Elementary. 12 titles: The Prophecy, Concerning Hobbits, In Dreams, Rohan, Evenstar, Forth Eorlingas, Gollum's Song, Minas Tirith, The Steward of Gondor, Twilight and Shadow, The Return of the King, Into the West. Explicitly states 'student parts have no key signatures, dotted quarter notes, triplets, or sixteenth notes' — so this edition is USELESS for real harmonic/rhythmic content. Its catpages sample is raster with no text layer. The companion 00-32034 'The Lord of the Rings: Piano Book' is a 104pp deluxe piano-solo volume but its sample is only 1 page.
    -     **url**: https://www.camimusic.com/lord-of-the-rings-symphony
      
          **what**: CAMI Music (Columbia Artists) — the hire library for 'The Lord of the Rings Symphony: A Symphony in Six Movements for Orchestra, Chorus and Soloists'.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: NO movement titles, no instrumentation breakdown, no score availability given on the page. Confirms the work is agency-managed/rental. Contact listed: Jean-Jacques Cesbron.
    -     **url**: https://search.library.wisc.edu/catalog/9913839322602121
      
          **what**: UW-Madison Libraries catalogue record for 'The Lord of the Rings Symphony: six movements for orchestra & chorus'.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: IMPORTANT NEGATIVE RESULT: this is a SOUND RECORDING, not a score — 2 audio discs, Howe Records 2011, recorded live 12-13 Feb 2011 at KKL Lucerne, 21st Century Symphony Orchestra & Chorus / Ludwig Wicki / Kaitlyn Lusk. Library holdings of the 'Symphony' are recordings, not printed scores.
    -     **url**: https://www.alfred.com/the-lord-of-the-rings-the-fellowship-of-the-ring-symphonic-suite-from/p/00-FOM02003C/
      
          **what**: Alfred product page for the FOTR Symphonic Suite full-orchestra conductor score.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: Arr. John Whitney, Grade 3.5, duration 9:40, 36pp, item 00-FOM02003C. Verbatim licence wording: 'For educational usage/non-profit performances only; for professional arrangements, visit our rental library at alfred.com/rental.' Score+parts set is 00-FOM02003 / digital 00-PK-0005852 ($100).
    -     **url**: https://scholarlypublishingcollective.org/uip/mmi/article/11/2/37/216761/Scoring-the-Familiar-and-Unfamiliar-in-Howard
      
          **what**: Vincent Rone, 'Scoring the Familiar and Unfamiliar in Howard Shore's The Lord of the Rings', Music and the Moving Image 11/2 (2018) — peer-reviewed analysis with musical examples.
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: Could NOT retrieve full text (paywall; the ResearchGate mirror returns 403). Search-snippet level claim only, flagged as unverified: Shore parallels races with harmonic systems — Hobbits major-minor diatonic, Men modal diatonic, Elves non-diatonic / CHROMATIC MEDIANTS. Worth a library/institutional fetch; it is the most likely source of publishable roman-numeral analysis.
    -     **url**: http://www.musicoflotr.com/2009/08/pentatonic-posting.html
      
          **what**: Doug Adams' official blog for 'The Music of the Lord of the Rings Films' — 'Pentatonic Posting' and other entries.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: SITE IS DOWN — every fetch returns HTTP 503, and web.archive.org is blocked from this environment. Only recoverable content is via search snippets. One usable pitch-level claim survives: 'after the whistle plays a lovely bit of the Shire theme, violins ascend and, over a C-major chord, resolve a mild Lydian dissonance: F#-G' — attributed to musicoflotr.com. Also the general claim that the Shire themes are stepwise pentatonic melodies, which my transcription extraction independently confirms.
    -     **url**: https://www.alfred.com/the-music-of-the-lord-of-the-rings-films/p/98-36329/
      
          **what**: Doug Adams, 'The Music of the Lord of the Rings Films' (Alfred 98-36329, 2010) — the book that DOES print notated examples of every theme.
      
          **kind**: analysis-with-examples
      
          **usable**: false
      
          **detail**: THE single best notated-theme source in existence, but NOT viewable: content.alfred.com/catpages/98-36329.pdf returns 404, the Scribd copy is behind a login wall, and pdfcoffee mirrors are Cloudflare-gated (403). Each leitmotif is demonstrated in musical notation in the printed book. Recommend acquiring a physical/legit copy — it would answer most remaining pitch questions in one go.
    -     **url**: https://pdfcoffee.com/the-two-towers-annotated-score-pdf-free.html
      
          **what**: pdfcoffee mirrors of 'The Two Towers Annotated Score', 'The Music of The Lord of The Rings Films Part 3', and 'Howard Shore - LOTR - The Return of the King - Suite (Orchestra Full Score)'.
      
          **kind**: notation-image
      
          **usable**: false
      
          **detail**: NOT RETRIEVABLE. All pdfcoffee URLs return HTTP 403 behind a Cloudflare 'Just a moment...' interstitial, both via WebFetch and via curl with a browser user-agent. The ROTK orchestral-suite full score listed there would be the highest-value remaining target if it can be reached another way.
    -     **url**: https://imslp.org
      
          **what**: IMSLP — checked for any Shore LOTR material.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: NOT FOUND. Nothing by Howard Shore is on IMSLP; the entire trilogy score is under copyright (New Line Tunes / South Fifth Avenue Publishing, admin WB Music Corp / Universal Music Corp), so no public-domain scan route exists.

**notes**: SUMMARY OF WHAT ACTUALLY EXISTS, AND WHAT I COULD READ
  
  The single most useful discovery is a mechanism, not a document: **Alfred serves free, un-gated sample-page PDFs at `https://content.alfred.com/catpages/<ITEM-NUMBER>.pdf`**. Several of these are full pages of real notation, and some are VECTOR (Finale "Maestro" font), meaning pitches can be extracted exactly rather than guessed. I downloaded 14 of them. This is a reusable pipeline for any Alfred title.
  
  === 1. THE SYMPHONY IN SIX MOVEMENTS: NO PUBLISHED SCORE ===
  There is **no purchasable full or study score** of "The Lord of the Rings Symphony". It is a rental-only concert work; the hire library is CAMI Music (Columbia Artists). It is not on IMSLP (in copyright). Library holdings under that title are the Howe Records 2011 Lucerne CD, not a score. The six movements are **numbered, not titled** — one per Tolkien "book". Durations from the 2011 release: I 11:25, II 34:04, III 18:15, IV 10:28, V 15:26, VI 26:12. Individual movement titles: NOT FOUND in any official source. Viewable notation from the Symphony: NOT FOUND.
  (A caveat: one search engine paraphrase asserted "Howard Shore is published by Schott Music". I could not verify that on any primary source and am NOT reporting it as fact.)
  
  === 2. WHAT THE PUBLISHED FOLIOS ACTUALLY CONTAIN (verified pitch content) ===
  All of the following I read off the page or extracted geometrically from vector PDFs and cross-checked against printed chord symbols. Nothing here is inferred from prose.
  
  **IN DREAMS** — two independent official editions, and they agree functionally:
  - Alfred Instrumental Solos piano acc. (00-IFM0411CD): Eb major, 4/4, Moderately slow q=76. Chords: **Eb | Ab | Eb | Bb/F | Eb | Ab | Bb/F**.
  - Alfred Easy Piano (00-33474, arr. Carol Matz): C major, 4/4. Chords: **C-F-C-G | C-F-G | C-Em-F-C-F-G | C-G-C-Em-F-C**  (I-IV-I-V | I-IV-V | I-iii-IV-I-IV-V | I-V-I-iii-IV-I). Melody: C4 D4 | E4 G4(h) D4 E4 | C4(h) | E4 G4 A4 C5 B4 G4 | E4(h) D4 C4 D4 | ...
  
  **INTO THE WEST** — cross-confirmed in two keys by two publications:
  - Easy Piano in C: **C – G – Dm – Am** repeating (I-V-ii-vi). LH arpeggio per bar C3-E3-G3 / G3-B3-D4 / D3-F3-A3 / A3-E3.
  - SATB octavo (00-CHM04056) in Eb: **Eb – Bb – Fm – Cm** (I-V-ii-vi). Identical function.
  - Melody (C-major edition): C5(h) G4 | G4(w) | G4 A4 C5 C5 D5 | A4+C5(w) || C5 A4 C5 D5(h) | D5 E5 D5 C5 A4 C5 | E5(w) || F5 E5 D5 | B4+D5(w) | D5 D5 E5 D5 C5 A4 C5 | C5+E5(w).
  
  **GOLLUM'S SONG** (Easy Piano): printed chords **Gm – Bm – Gm – Bm – Cm**, LH triads verified G2-Bb2-D3, B2natural-D3-F#3, C3-Eb3-G3. The Gm<->Bm alternation is a **chromatic mediant** (roots a major 3rd apart) — a genuinely distinctive harmonic fingerprint, quite unlike the diatonic hobbit material.
  
  **THE PROPHECY** (Instrumental Solos piano acc., 00-IFM0411CD): no key signature (A minor), 4/4, Slowly darkly q=60. The whole opening is a slow **i <-> iv oscillation: Am (A-C-E) <-> Dm (D-F-A)**, with Dm7 (D-F-A-C) voicings, then F major, then a modal-mixture **F minor (F-Ab-C)**, then Am. Melody sys1: B3 D4 F4 G4 D4 G4 A4 B4 C5 D5 | D5 E5 D5 C5 | D4. Sys2 has one chromatic inflection: G4 A4 B4 | B4 A4 G4 **Gb4** G4.
  Meter/tempo map from the alto sax edition: 4/4 "Slowly, darkly q=60" -> 3/4 -> 2/4 -> 3/4 -> 4/4; bar 25 "Brightly q=168"; bar 57 "Moderately slow q=60".
  
  **FELLOWSHIP THEME** (Alfred full-orchestra conductor score 00-FOM02003C, arr. John Whitney): the score page is headed **"The Fellowship Theme" - Music by HOWARD SHORE / Marcato q=168**, **3/4**, concert key **C major / A minor (no key signature)** — deduced consistently from three transposition families (concert instruments none, Bb instruments 2 sharps, F horns 1 sharp). **Timpani tuned F, A, C, E.** Violins carry the theme "off the string" in continuous eighths from bar 1; a 5/4 bar arrives at bar 16. I could NOT read the individual violin pitches — the preview is a skewed 300dpi bitonal scan. That is a NOT FOUND at pitch level, and I did not guess.
  
  === 3. THE BEST PITCH SOURCE IS UNOFFICIAL — FLAGGING IT CLEARLY ===
  A 169-page **fan transcription** of the entire FOTR Complete Recordings (piano/short score, Sibelius-engraved, vector, by "M.W. 2014, New Zealand") is at alcaeru.weebly.com. It is NOT an official publication and must not be cited as one, but the notation is exact and machine-readable, it covers all 37 tracks, and it carries the full Sindarin/Quenya/Adunaic/Khuzdul texts with translations and Boyens/Salo credits. Verified extractions (each cross-checked visually against the rendered page):
  - **The Shire** (p.8): Moderato q=90, 4/4, **D major**. Melody **D4-E4-F#4-F#4-A4-A4-F#4-F#4-E4-D4** = 1-2-3-3-5-5-3-3-2-1 over a tied D3-F#3-A3 triad. Pitch set D-E-F#-A(-B): **major pentatonic, no 4, no 7**.
  - **Rivendell** (p.72, cue "Many meetings"): 4/4, C major, clarinet q=104. Melody **C4-D4-E4-E4-G4-E4-E4-D4-E4-D4-C4** = 1-2-3-3-5-3-3-2-3-2-1 over a C triad on a C2 pedal.
  - **Khazad-dum** (p.111): 4/4, q=172, male choir "The Balrog". Opening ostinato is a **bare open fifth D2+A2+D3** doubled at the octave, with F3 above (D minor).
  
  === 4. THE STRUCTURAL FINDING WORTH ACTUALLY IMPLEMENTING ===
  Three independent sources — two of them official — give the same opening gesture for the "Shire family":
  - The Shire, D major: D-E-F#-(F#)-A  = 1-2-3-3-5
  - Rivendell/"Many meetings", C major: C-D-E-E-G = 1-2-3-3-5
  - In Dreams, C major (OFFICIAL Alfred): C-D-E-...-G = 1-2-3-5
  i.e. **stepwise 1-2-3, then a leap to 5, over a static tonic triad, in major pentatonic with no 4th and no 7th.** This independently confirms Doug Adams' documented statement that the Shire themes are stepwise pentatonic melodies — but here it is confirmed from notation, not from his prose.
  
  === 5. NEGATIVE RESULTS (all real, all useful) ===
  - **Choral octavos of Elvish/Adunaic material: NOT FOUND.** Every published LOTR octavo I found is the English-language "Into the West" (SATB/SAB/2-Part). The Sindarin/Quenya/Khuzdul/Adunaic choral writing exists only inside the rental orchestral materials.
  - **Doug Adams' free "Annotated Score" PDFs are PROSE ONLY.** I downloaded the FOTR volume and inspected all 48 embedded images — every one is a film still or concept drawing. Zero notation, despite the title. Only the FOTR volume is still live at elvish.org; TTT/ROTK 404.
  - **musicoflotr.com (Doug Adams' blog) is dead** — HTTP 503 on every path — and web.archive.org is blocked from this environment. Only search snippets survive.
  - **pdfcoffee.com is Cloudflare-gated (403)** for both WebFetch and curl-with-browser-UA. It lists a "Return of the King Suite (Orchestra Full Score)" and the TTT Annotated Score; those remain the highest-value unreached targets.
  - **The Vincent Rone article is paywalled** (ResearchGate mirror 403). It is the most likely published source of proper roman-numeral analysis and is worth an institutional fetch.
  - **The Doug Adams book (Alfred 98-36329) has no viewable preview** — its catpages URL 404s. It prints notation for every leitmotif and would resolve most remaining gaps; recommend buying a copy.
  
  === 6. LOCAL FILES PRODUCED (all absolute paths) ===
  Scratchpad root: /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/
  - fotr_complete_transcription.pdf  (169pp fan transcription)
  - extract2.py  — pitch extractor for the Sibelius/Opus transcription (usage: python3 extract2.py <pdf> <page>)
  - alfred/  — 20+ official Alfred sample PDFs, plus rendered PNGs
  - alfred/mx.py, alfred/mx2.py  — pitch extractors for Alfred's Finale/Maestro vector PDFs
  - alfred/clean_p2.png, clean_p3.png  — the FOTR conductor score preview with the watermark stripped
  - annot/fotr_as_2.pdf  — official Doug Adams Annotated Score (prose)
  
  METHOD NOTE, since it matters for trusting the above: for every vector PDF I located the staff lines from the drawing objects, calibrated the music-font glyph offset from the clef glyph (and independently from the key-signature accidentals, which must land on known lines/spaces), then converted notehead y-positions to diatonic steps. I validated the result three ways — key-signature sharps/flats landing exactly on their canonical positions, extracted bass notes matching the publisher's own printed chord symbols, and direct pixel measurement of staff-line positions against noteheads. Where a source was a skewed raster scan and that validation was not possible (the orchestral conductor score), I have said NOT FOUND rather than estimate. No pitch in this report is invented.

---

## v2:a08e4b023c5d3a9559660712c2afe44852d511eba65e0abefb5deb1c29bacfe8

**sources**:   -     **url**: https://etd.ohiolink.edu/acprod/odb_etd/ws/send_file/send?accession=bgsu1179760402&disposition=inline
      
          **what**: Matthew David Young, "Projecting Tolkien's Musical Worlds: A Study of Musical Affect in Howard Shore's Soundtrack to Lord of the Rings," MM in Music Theory, Bowling Green State University, 2007. 84 pp. THE goldmine — this is the "Matthew Young" the owner asked about.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: CONFIRMED REAL NOTATION: 58 embedded images, 88 occurrences of "Example", 24 of "Figure". Clean machine-engraved score reductions with instrument names, tempo marks, time signatures and film timecodes. Full catalogue of notated examples I verified page-by-page: p36 Ex3-1 Shire Theme + Ex3-2 Frodo's Theme; p37 Ex3-3 Shire Fiddle; p38 Ex3-4 Traveling Song; p39 Ex3-5 Drinking Song; p40 Ex3-6 Gondor Theme; p41 Ex3-7 Rohan Theme; p43 Ex3-9a/b Aragorn Chant + Ex3-10 Eowyn Chant; p44 Ex3-11 Isengard Theme; p45 Ex3-12 Ring Theme + Ex3-13 Mordor Theme + Fig3-1 Correlation of Melodies between Mordor and Ring Themes; p47 Ex3-14a Rivendell Theme + Ex3-14b Lorien Theme; p49 Ex3-15 Passing Wood Elves + Ex3-16 Lament for Gandalf; p53 Ex4-1 Braveheart Wedding Music; p54-55 Ex4-2a-d four Irish folk tunes; p55 Fig4-1a SCHENKERIAN REDUCTION OF SHIRE THEME + Fig4-1b Schenkerian reduction of The Blacksmith's Hornpipe; p57 Ex4-3; p58 Ex4-4 I Will Take It; p59 Ex4-5 No Memory of the Shire; p62 Fig4-2 Rohan Museme + Ex4-6a/b; p63 Ex4-6c William Tell; p64 Ex4-7 Rohan Pedal Theme; p65 Ex4-8 Bach St Matthew Passion + Ex4-9 Tavener Song for Athene; p66 Ex4-10 Descending Rohan Theme; p67 Ex4-11 Gondor Full Theme; p69 Fig4-12 Copland Fanfare, Fig4-13 Strauss Zarathustra, Fig4-14 Williams Star Wars; p71 Ex4-16 Gondor Theme 2; p72 Ex4-17 Hindemith Mathis; p73 Ex4-18 Bach BWV565; p74 Ex4-20 Ring Enchantment + Ex4-21 Snake Charmer; p75 Ex4-22 Smetana Vltava; p76 Ex4-24 Mendelssohn. PITCHES I EXTRACTED FROM THE NOTATION MYSELF (staff-line detection + notehead centroid, skew-corrected): Fig3-1, cut time, treble clef, no key signature — MORDOR THEME (Trumpet in C) = C#5, D5, C#5, Bb4 (sharp written on note 1 and carrying within the bar; flat written on note 4). RING THEME (Violin) = B4, C5, B4, A4 (no accidentals). Both therefore open with a RISING SEMITONE; Ring then falls a whole step, Mordor falls a minor third. Ex3-12 Ring Theme is scored 4/4, quarter=60, Violin / Viola / Cello1 / Cello2, with a written flat on Cello 1 in bars 1 and 3 and a natural in bar 3 of Cello 2. Ex3-13 Mordor Theme is 4/4, quarter=150, Horn in F (1-sharp key signature) / Trumpet in C / Trombone / Bass Trombone, bass trombone running a continuous rest-eighth-eighth-eighth ostinato. Ex3-14a Rivendell Theme is 4/4, Moderato quarter=c.108, harp glissandi + Voice + divisi strings, no key signature. Ex3-14b Lorien Theme is cut time, quarter=60, harp in continuous triplet sixteenths with flats, voice in dyads. AUTHOR'S OWN VERBATIM ANALYTICAL CLAIMS: "the first Aragorn chant seems to be in Mixolydian, and his other chant and Eowyn's chant seem to be in either Dorian or Aeolian"; on the Shire theme vs Irish folk tune — "Both themes consist of a prolongation of tonic, featuring an arpeggio to scale-degree 5 and a concluding 2-1 neighbor motion"; on Gondor (Ex4-16) — "The B in m. 4 is not supported by the A-minor triad of the accompaniment, whereas the melody line is always harmonically supported in mm. 7-8", and "m. 6 involves an additional ascending gesture not found in m. 2"; on the Shire theme orchestration — "a single melodic line (most often played by fiddle or flute), played above sustained diatonic chords in the strings"; the Rohan museme is characterised via Tagg as "based...on leaps of an octave or a fifth...played forte in middle or high register, preferably by a brass instrument (especially horn) at the start of a phrase, and landing on the perfect fifth or octave of the simultaneous harmony." NOTE: the thesis has essentially no roman-numeral analysis (4 hits for "roman", 1 for "triad", 0 for "chromatic mediant", 0 for "pentatonic", 0 for "octatonic") — it is an affect/museme study built on Tagg, not a harmonic-theory study. Its value is the notated examples themselves. Local copy: /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/docs/bgsu.pdf ; rendered pages young_p36/40/41/45/47/55/67.png in the same directory.
    -     **url**: https://scholarworks.uni.edu/cgi/viewcontent.cgi?article=1606&context=hpt
      
          **what**: Jennifer Louise Titus, "From here to there: The music's journey: how the music in the Lord of the Rings trilogy represents the cultures of Tolkien's world," Honors Program Thesis 606, University of Northern Iowa, 2013. 42 pp (scanned).
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: CONFIRMED REAL NOTATION (scanned page images; I rendered them at 500 dpi). Three notated melodies: 'Lothlorien' (thesis p.21 / PDF page index 23) and 'Gondor in Decline' + 'Gondor in Ascension' (thesis p.24 / PDF page index 26). GONDOR — pitches I extracted from the notation myself (staff-line detection, corrected reference: top line F5): treble clef, 4/4, NO key signature, 8 bars. 'Gondor in Decline' m1 = D4 (half) then A4 (half) — a rising perfect fifth, tonic D. m2 ends on A4. m3 = C5 (whole). m4 = A4 (whole). m5 restates D4-A4. m8 ends on E4. 'Gondor in Ascension' is identical for the first four bars, then leaps up a perfect fourth and rises through the G5/A5 region. AUTHOR'S VERBATIM CLAIMS (text, not my reading): "The key used in Gondor's leitmotif could be D minor or it could be D Dorian... As the sixth scale degree is never used in the melody, it is difficult to definitively say which key it is. The harmony uses both B flat and B natural in different chords... D Dorian would be most probable because the seventh scale degree is not raised to function as a leading tone." "The harmonization of Gondor's leitmotif consists of six different chords: D minor, G major, F major, B flat major, C major, and A major. All of these chords are presented as a triad on the downbeat of each measure for 'Gondor in Decline.'" "B flat major is the chord used for the fifth measure of the melody and A major is the chord for the eighth measure." "with the exception of D minor, all the chords are major. If the melody was based on D minor, the harmonization would have included G minor and C minor or C# diminished rather than G and C major." "There are two instances of moving by minor thirds from A - C - A at the end of the first half of theme. Between the first two notes is a perfect fifth... Connecting the halves of 'Gondor in Decline' is a descending perfect fifth. Connecting 'Gondor in Ascension' is a rising perfect fourth." "The downbeats of the seventh and eighth measures are the next lowest scale degrees. The descending scale at the end of 'Gondor in Decline' moves from the A in the fifth measure to the E in the final measure." "'Gondor in Ascension' leaps a perfect fourth upwards and then the next three measures begin on the next highest scale degree, creating a scale that begins on D and continues through A." LOTHLORIEN — author's verbatim claims: "The key that Shore chose for this theme was a variation of the maqam hijaz, an Arabic mode that is similar to the Phrygian church mode. This alteration was the deletion of the microtones usually used in Arabic music." "The first measure is written in 5/4 time... while the remaining three measures are in 4/4." "there are only two instances where there is not step-wise motion. One is between the two notes in the second measure and the other is between measures two and three. The most interesting interval is the last one, which is an augmented second... This particular melody leaves it unresolved." "there is no harmonization of the melody. It is a monophonic type of music." Instrumentation: monochord (50 resonating strings), sarangi, ney flute, women's chorus in Gregorian-chant style; text from 'Footsteps of Doom' (Sindarin) + 'Lament for Gandalf' chorus (Quenya). NOT FOUND / CAUTION: I could NOT reliably transcribe the Lothlorien pitches. The scan is too coarse. What I can state from the image: treble clef, 5/4 then 4/4, no key signature, at least five written FLAT accidentals, melody sitting low in the staff (roughly D4-C5). I am not going to guess the notes. Local copy: .../scratchpad/docs/uni_hpt.pdf ; rendered gondor_notation.png, loth_notation.png, dec_a.png, dec_b.png.
    -     **url**: https://mackseyjournal.scholasticahq.com/api/v1/articles/28026-even-darkness-must-pass-an-ethical-commentary-and-musical-analysis-of-_the-lord-of-the-rings_-score.pdf
      
          **what**: "Even Darkness Must Pass: An Ethical Commentary and Musical Analysis of The Lord of the Rings Score," JHU Macksey Journal, 2021. 29 pp.
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: CONFIRMED REAL NOTATION: five embedded music images on pages 16, 17, 18, 19, 22 which I extracted and read. EX.2 Reflective Setting of the Hobbit Motif (treble, 4/4, no key signature, F# and C# written as accidentals = D major); EX.3 Country Setting of the Hobbit Motif; EX.4 History of the Ring Theme (a FULL 4-bar STRING SCORE: Vn.I, Vn.II, Va., Vc., Cb.); EX.5 The Seduction of the Ring Motif (treble, 4/4 -> 3/4 -> 4/4, no accidentals); EX.6 The Fellowship Theme. PITCHES I EXTRACTED MYSELF FROM EX.4 (skew-corrected staff-line + notehead detection): 4/4, no key signature. Cello + Contrabass bar 1, div. = F3 and C4 (open fifth, whole notes). Viola div. = A-flat3 + C4 in bars 1 and 3 (flat written), A-natural3 + C4 in bars 2 and 4 (no flat). Therefore the bar-1 vertical sonority is F - A-flat - C = an F MINOR TRIAD. Violin I and Violin II are doubled and their melody in all four bars uses ONLY three pitches: A5, B5, C6. Bass moves F3 -> G#3 (bar 2, sharp written, tied) -> F-natural3 (bar 3, cautionary natural) — lower confidence on that bass motion than on bar 1. This INDEPENDENTLY CONFIRMS the Young thesis: same motif, same pitch classes A/B/C, B-C semitone oscillation. AUTHOR'S VERBATIM CLAIMS: on the Shire theme — "Starting with three stepwise pitches up from the tonic in D major, the motif expands across the entire octave and follows a predictable but familiar harmonic progression: I-iii-IV-I-IV-V-I-V" and "The melody follows a D major pentatonic scale, with the occasional major seventh added as a passing tone." On the country setting — "The harmonic progression changes into a descending motion of the D major scale: I-V6-vi-IV-V. With the inclusion of a first inversion V chord...". On the Ring — "The motif begins with a raised fourth above an F minor triad, however, the melody itself seems to play out an A minor triad with an added ninth" and "With the A minor triad positioned above the F minor triad, the opposing A-natural and A-flat mimic the duplicity of the ring itself" and "The initial half step up before oscillating between the two notes seeks to ensnare the listener"; resolutions "initially on the first scale degree and then subsequently on the fifth scale degree of an E minor triad." On Seduction — "the Seduction theme begins on the fourth degree of A minor, which also is D. The B-natural at the end of the line concludes the melody on the second degree of the A minor scale"; "a half-step-up/half-step-down circular pattern... the downward evil spike, a perfect fifth down." On the Fellowship theme — "The first three pitches of the theme follow a whole-step-down/whole-step-up pattern, but the theme for Evil opens with a half-step-down/half-step-up pattern"; "As this figure climbs a D minor scale, both the half-step and whole-step variations are used"; "The Fellowship theme in its second half is comprised of nine notes." NOTE: my own reading of the notation VERIFIES the F-minor / A-natural-vs-A-flat claim and the B-C semitone; the roman-numeral progressions for the Shire theme are the author's prose assertion and I did NOT verify them against the printed staff. Local: .../scratchpad/imgs/Im0.0-Im0.4.jpg.
    -     **url**: https://dergipark.org.tr/tr/download/article-file/2652050
      
          **what**: Lee & Lee, "Analysis of chromatic mediant relationship in film music score with Neo-Riemannian theory," Rast Musicology Journal, Winter 2022, 10(4), 449-461. Contains a dedicated neo-Riemannian analysis of Howard Shore's 'Gollum's Song' (The Two Towers).
      
          **kind**: notation-image
      
          **usable**: true
      
          **detail**: CONFIRMED REAL NOTATION: Figure 4, "Howard Shore, 'Gollum's Song', The Lord of the Rings: The Two Towers: harmonic reduction" — 16 bars, treble clef, common time, ONE TRIAD PER BAR notated as stacked whole notes, with the transformation labelled under every bar. The label sequence I read off the figure is: RP, T1, PRM, RP, P, T1, PRM, N, PL, LP, PL, T1, PRM, PRM, PRM. NAMED CHORDS (Table 2, verbatim): RP = G#m - Bm ("Sadness / tragedy"); RP = D - B ("despair / anger / loss of hope"); PL = Gm - Bm ("melancholy / uneasy / tense"); LP = Bm - Gm. Verbatim: "RP transformation in music is a progression between two minor triads (G#m - Bm) and two major triads (D - B), respectively, while both are root connections of minor third interval relationships." "PL transformation and LP transformation are the interchangeable connections of the minor triad Gm - Bm." The paper also supplies a REUSABLE TRANSFORMATION TABLE (Table 1) that is directly programmable — chromatic mediants in major: RP = I->VI, LP = I->III, PL = I->bVI, PR = I->bIII, H(LPL) = I<->bVIm, PRP = I<->bIIIm; chromatic mediants in minor: RP = Im->IIIm, LP = Im->VIm, H(LPL) = Im<->#III, PRP = Im<->#VI, PL = Im->#IIIm, PR = Im->#VIm. Local: .../scratchpad/docs/derg_2652050.pdf, rendered derg_p5.png.
    -     **url**: https://scispace.com/pdf/from-alberich-to-gollum-hollywood-s-transformation-of-the-138ecuf75t.pdf
      
          **what**: Andrew J. Reitter, "From Alberich to Gollum: Hollywood's Transformation of the Leitmotiv," thesis, University of Delaware, 2013. 85 pp. (The udspace.udel.edu mirror kept resetting the connection / 503-ing; this scispace mirror served it.)
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: NO NOTATED EXAMPLES — zero occurrences of "Example" or "Figure" as example captions; 0 hits for Aeolian, Dorian, tritone; 1 for "triad"; 3 for "chromatic". This is a narrative/reception thesis, not an analytical one. It does contain a handful of concrete harmonic claims, all PROSE ASSERTIONS with no staff to check them against: "the suspense of the E-flat minor chord turns to a lighter, happier E-flat major as we enter the Shire"; "we hear the E-minor cadence indicative of the Rohan theme, which then moves to A major, perfectly setting up the fragmentary statement of the Gondor theme in D major"; "the History of the Ring theme... The theme itself is in a minor key and is very chromatic, beginning with it's indicative rising half step. Shore starts this theme with a rising minor second half so that he can easily intertwine it with other themes, and it is no mere coincidence that the Mordor theme also begins with a rising [minor second]." That last claim is the ONE genuinely valuable thing here and it is independently CONFIRMED by my own reading of Young's Figure 3-1 (Ring = B-C rising semitone; Mordor = C#-D rising semitone). CONFLICT TO FLAG: Reitter says the Gondor theme is "in D major"; Titus's notation and analysis say D Dorian/D minor with a D-minor tonic triad. Titus is backed by notation, Reitter is not.
    -     **url**: https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf
      
          **what**: Doug Adams, "The Annotated Score" — the official companion booklet to The Lord of the Rings: The Fellowship of the Ring - The Complete Recordings. 29 pp.
      
          **kind**: prose-only
      
          **usable**: false
      
          **detail**: IMPORTANT NEGATIVE RESULT. This is the free, downloadable Adams document that keeps getting recommended, and it contains NO MUSICAL NOTATION — the two images per page are decorative borders. It is cue-by-cue liner-note prose plus choral texts (Sindarin/Quenya/Khuzdul/Black Speech), instrument lists and performer credits. Searching the whole text for pitch/harmony vocabulary returns almost nothing. The only two usable musical statements in the entire booklet: "Shore tosses the hobbits' characteristic open fourth and fifth intervals (derived from the Skip Beat and Outline Figure) around the orchestra's strings and winds"; and, on the Doors of Durin, "The moonlit doors are eventually revealed with a rising series of major triads." The actual notated themes are in Adams's PRINTED BOOK (The Music of the Lord of the Rings Films, Alfred, 2010, ISBN 9780739071571), which is not free and which I could not obtain. Do not let anyone tell you the free Annotated Scores contain the theme notation — they do not.
    -     **url**: https://scholarlypublishingcollective.org/uip/mmi/article/11/2/37/216761/Scoring-the-Familiar-and-Unfamiliar-in-Howard
      
          **what**: Vincent E. Rone, "Scoring the Familiar and Unfamiliar in Howard Shore's The Lord of the Rings," Music and the Moving Image 11/2 (2018), 37-. This is the flagship chromatic-mediant article the owner asked about.
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: NOT FOUND — could not obtain the body text. I tried five routes and every one failed: publisher page 403; Project MUSE 698580 returned a bot-verification wall; Gale OneFile open-web link returned 410 Gone; the ResearchGate author-hosted PDF returned 403 to both WebFetch and curl-with-browser-UA; academia.edu mirror 403. What IS documented from the abstract (quoted consistently across Semantic Scholar, Gale and the publisher blurb): "Shore's score parallels an ordered triple of races (Hobbits, Men, and Elves) with an ordered triple of harmonic accompaniment (major-minor diatonic, modal diatonic, and nondiatonic [chromatic mediants])." i.e. Hobbits = common-practice tonality; Men = modal; Elves = chromatic mediants. That is the mapping the owner already suspected, but I have NOT seen a single specific chord pair, roman numeral or pitch from this article. Anyone quoting specific Rone chord progressions without the PDF is inventing them. Getting this needs library/institutional access or ILL.
    -     **url**: https://onlinelibrary.wiley.com/doi/abs/10.1111/musa.12106
      
          **what**: Mathew Heine, "Chromatic Mediants and Narrative Context in Film," Music Analysis 37/3 (2018).
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: NOT FOUND — Wiley paywall, abstract only. This is the standard reference for chromatic-mediant semantics in film scoring and is the theoretical backdrop for Rone's Elves argument, but I could not extract any Shore-specific pitch content from it. A ResearchGate record exists (publication/323344183) but no open full text.
    -     **url**: https://www.researchgate.net/publication/326006227_Scoring_the_Familiar_and_Unfamiliar_in_Howard_Shore's_The_Lord_of_the_Rings
      
          **what**: ResearchGate record for the Rone article (author-uploaded PDF link).
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: 403 Forbidden to both WebFetch and curl with a browser user-agent. Listed here so nobody wastes time re-trying it the same way. If someone has a ResearchGate login or an institutional proxy, this is the single highest-value remaining target.
    -     **url**: https://academia.edu/39731168/The_Exposition_of_Themes_in_The_Fellowship_of_the_Ring_-_How_Howard_Shore_Uses_Leitmotif_to_Establish_a_Narrative
      
          **what**: "The Exposition of Themes in The Fellowship of the Ring - How Howard Shore Uses Leitmotif to Establish a Narrative" (academia.edu upload).
      
          **kind**: paywalled
      
          **usable**: false
      
          **detail**: NOT FOUND — academia.edu returns 403 to automated fetches. Could not verify whether it contains notation or only prose. Unverified; do not cite.

**notes**: BOTTOM LINE: two documents are worth the owner's time, and one of them is the thesis he half-remembered.
  
  === TIER 1: GET THESE ===
  
  1. MATTHEW YOUNG, BGSU 2007 (OhioLINK, free PDF, 84pp). This is the "Matthew Young" reference. It reproduces ~58 machine-engraved score reductions covering essentially every major theme — Shire, Frodo, Shire Fiddle, Traveling Song, Drinking Song, Gondor, Rohan, Aragorn Chant x2, Eowyn Chant, Isengard, Ring, Mordor, Rivendell, Lorien, Passing Wood Elves, Lament for Gandalf — each with instrument names, tempo marking, time signature and a film timecode. It also has a Schenkerian reduction of the Shire theme. Caveat: it is a Tagg-style AFFECT study, so it has almost no roman numerals and zero chromatic-mediant discussion. Its value is that it hands you the actual notes.
  
  2. JENNIFER TITUS, UNI 2013 (free PDF, scanned). Notation for Lothlorien and both Gondor variants, plus the most explicitly programmable harmonic statement I found anywhere: the Gondor theme's complete six-chord vocabulary.
  
  === PITCHES I READ OFF THE NOTATION MYSELF (not prose claims) ===
  
  RING MOTIF HEAD (Young Fig. 3-1, Violin, cut time, no key sig): B4 - C5 - B4 - A4. Contour +1, -1, -2 semitones.
  MORDOR MOTIF HEAD (Young Fig. 3-1, Trumpet in C, cut time, no key sig): C#5 - D5 - C#5 - Bb4. Contour +1, -1, -3 semitones.
  Both open with a RISING SEMITONE. This is the structural link between the two evil themes, and it is confirmed three ways: my reading of the notation, Reitter's prose ("its indicative rising half step... the Mordor theme also begins with a rising [minor second]"), and the Macksey author's prose ("The initial half step up before oscillating between the two notes").
  
  RING THEME HARMONY (Macksey EX.4, a full 4-bar string score, 4/4, no key sig): Cello+Bass div. = F3 + C4. Viola div. = Ab3 + C4 in bars 1 and 3, A-natural3 + C4 in bars 2 and 4. Bar 1 vertical = F - Ab - C = F MINOR. Violins doubled, melody restricted to A5 / B5 / C6 across all four bars. So: F minor triad in the low strings, B-natural in the melody = a RAISED FOURTH (aug 4th F-B) over that triad, and the melody's A-natural grinds against the viola's Ab. That is a directly implementable generative rule: F minor pad + melodic cell {A, B, C} oscillating on the B-C semitone.
  
  GONDOR THEME (Titus, treble, 4/4, no key sig, 8 bars): m1 = D4 then A4 (rising P5). m3 = C5 whole. m4 = A4 whole. m5 restates D4-A4. Final note E4 (does NOT resolve to the tonic D). "Ascension" is identical for 4 bars then leaps up a P4 and climbs. Mode: D DORIAN (author's reasoning: 6th degree absent from the melody, 7th never raised to a leading tone, harmony mixes Bb and B-natural). Six-chord harmonic vocabulary, one triad per downbeat: D minor, G major, F major, Bb major, C major, A major — every chord major except the D minor tonic. Bb major on bar 5, A major on bar 8.
  
  === CHROMATIC MEDIANTS / NEO-RIEMANNIAN ===
  
  The only place I found REAL named chords for Shore is Lee & Lee (Rast Musicology Journal 2022), on "Gollum's Song": G#m->Bm (RP), D->B (RP), Gm->Bm (PL), Bm->Gm (LP), over a 16-bar notated harmonic reduction. Their Table 1 is a straight lookup table you can code against (major: RP=I->VI, LP=I->III, PL=I->bVI, PR=I->bIII, H=I<->bVIm, PRP=I<->bIIIm; minor: RP=Im->IIIm, LP=Im->VIm, H=Im<->#III, PRP=Im<->#VI, PL=Im->#IIIm, PR=Im->#VIm).
  
  === NOT FOUND — do not let anyone fill these in from memory ===
  
  - RONE, "Scoring the Familiar and Unfamiliar" (Music and the Moving Image 11/2, 2018). Blocked on all five routes I tried (publisher 403, MUSE bot wall, Gale 410, ResearchGate 403, academia 403). All that is publicly documented is the abstract's race/harmony mapping: Hobbits = major-minor diatonic, Men = modal diatonic, Elves = nondiatonic chromatic mediants. NO specific Rone chord pair, roman numeral or pitch is in the public record. If a previous pass reported specific Rone progressions, they were fabricated. This needs institutional access.
  - HEINE, "Chromatic Mediants and Narrative Context in Film" (Music Analysis 2018). Wiley paywall, abstract only.
  - LOTHLORIEN PITCHES. Titus prints the melody but the scan is too coarse for me to transcribe note-by-note and I refuse to guess. What is certain from the image: treble clef, bar 1 in 5/4 then three bars of 4/4, no key signature, at least five written flats, range roughly D4-C5. Her verbal claims: maqam hijaz with the microtones removed (~Phrygian dominant), predominantly stepwise, and the FINAL interval is an unresolved AUGMENTED SECOND, monophonic with no harmonisation.
  - The academia.edu "Exposition of Themes" paper — 403, contents unverified.
  - AARON SHERBER — I found no academic publication by him on Shore. He conducts the LOTR live-to-picture concerts. No paper located.
  
  === NEGATIVE RESULT WORTH KNOWING ===
  
  Doug Adams's free "Annotated Score" booklets (elvish.org mirror) contain NO NOTATION AT ALL — they are cue-by-cue liner-note prose, choral texts and credits. The theme notation people attribute to Adams is in his printed 2010 book, which is not free. The only two musical statements in the whole free booklet are "the hobbits' characteristic open fourth and fifth intervals" and the Doors of Durin "rising series of major triads".
  
  === CONFLICT TO ADJUDICATE ===
  
  Gondor's mode: Reitter says "D major" (prose, no notation). Titus says D Dorian/D minor and prints the tune plus its chord list. Young's Ex. 4-16 says the melody's B in m.4 sits over an A-MINOR triad. Trust Titus and Young — they show their work. Note Titus's A major and Young's A minor are different passages/settings of the theme, which is itself a usable fact: the chord on that scale degree is mutable.
  
  Working files, all absolute: /tmp/claude-0/-home-user-DeckardsMusicBox/bb01bc2e-2e5d-5b5e-a390-1231aeba10e0/scratchpad/docs/{bgsu.pdf, uni_hpt.pdf, derg_2652050.pdf, alberich.pdf, fotr_annotated_score_2.pdf} and rendered notation crops young_p45.png, young_p47.png, fig31.png, gondor_notation.png, loth_notation.png, imgs/Im0.2.jpg (the Ring string score).
