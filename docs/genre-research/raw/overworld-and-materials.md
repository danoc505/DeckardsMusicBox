# RAW RESEARCH — Fantasy overworld travel music, and the program's own materials

*Captured 2026-08-10 from workflow `wf_efa86302-418`. These are the
VERBATIM returns of the research agents that completed before the run hit its session
limit. Nothing here has been summarised or filtered by me, which is the point: the
synthesis step never ran, so this is the evidence itself rather than my reading of it.
Claims carry the agents' own confidence markers and source URLs. Treat anything
unsourced here as unverified — the adversarial verification pass did not run either.*

---

## v2:b122682ca1f4cb2d8fcb107aff22d22db5b385822878ed67a8c96748c6c29db0

**findings**:   -     **claim**: Measured human walking cadence clusters at 110-121 steps/min, and music at a set tempo pulls cadence to within about one beat of it.
      
          **evidence**: Habitual cadence, intervention group: baseline 110.8 ± 9.0 steps/min, rising to 121.6 ± 7.6 at four months, 121.0 ± 8.6 at six, 121.3 ± 8.6 at nine. Control group 118.8 ± 10.7 at baseline. Music prescribed for 3 METs was 97-113 BPM (mean 105.8 ± 4.7); for 5 METs, 135-151 BPM (mean 143.8 ± 4.7). Correlation of target to actual cadence r = 0.86 (p < .001); participants 'regulated their cadence within one beat of the stimulus.'
      
          **kind**: measurement
      
          **source**: https://pmc.ncbi.nlm.nih.gov/articles/PMC8345504/
      
          **usable**: WALK_TEMPO_BAND = 105-125 BPM as the default pulse rate for a 'travelling' generator, with 1 beat = 1 footstep. Sample tempo from N(115, 8) clipped to [100,130]. A 'brisk/urgent' variant shifts to N(143,5).
    -     **claim**: Cadence thresholds are standardised heuristics: 100 steps/min = moderate intensity (3 METs), 130 steps/min = vigorous (6 METs), in adults 21-60.
      
          **evidence**: 'A heuristic cadence of ≥100 steps/min has consistently corresponded with moderate (3 METs) physical activity intensity in adults 21-60 years of age'; in 41-60 year olds 'cadence thresholds of 100 and 130 steps/min emerged as heuristic values associated with 3 and 6 METs.' Correlation of cadence to intensity r = 0.93.
      
          **kind**: measurement
      
          **source**: https://pubmed.ncbi.nlm.nih.gov/34556146/
      
          **usable**: Three-point tempo ladder for exertion state: ambling = 100 BPM, travelling = 115 BPM, pressing on = 130 BPM. Directly maps a game 'stamina/urgency' parameter to BPM.
    -     **claim**: Beat-to-step synchronisation works best in a 106-130 BPM window; below ~114 BPM tempo drives walking speed linearly, above ~118 BPM speed saturates.
      
          **evidence**: 'The data revealed a good response to synchronization in a region between 106 and 130 bpm.' 'The tempo/speed curve shows a linear character from 50 to 114 BPM. From 118 to 190 BPM the walking speed appeared to stabilize.' Stimuli spanned 50-190 BPM; participants walked 45 min on an open-air athletics track.
      
          **kind**: measurement
      
          **source**: https://www.sciencedirect.com/science/article/abs/pii/S0167945707000589
      
          **usable**: Hard bounds for a walking-pulse generator: reject tempi outside 106-130 BPM for the 'footstep' layer. Above 130 the metaphor breaks (listeners stop mapping beat to step), so faster travel music should double the subdivision rather than raise the beat.
    -     **claim**: The 'preferred tempo' of human pulse perception is a resonance at 2 Hz = 120 BPM, not an arbitrary convention.
      
          **evidence**: Van Noorden & Moelants (1999) resonance theory of tempo perception models the listener as a damped harmonic oscillator with 'resonant period is 2 Hz (or 0.5s)'; 'preferred tempo located somewhere between 120 and 130 bpm, so 500 ms (120 bpm) is more realistic as characteristic period.' Moelants argues preferred tempo ~120 BPM 'is a part of our biology', against Fraisse's earlier ~100 BPM.
      
          **kind**: musicology
      
          **source**: https://sonicscoop.com/the-resonant-human-the-science-of-how-tempo-affects-us/
      
          **usable**: Default tempo prior centred on 120 BPM with the perceived beat placed at whatever metrical level lands nearest 2 Hz. If a piece is written at 60 BPM, generate the ostinato in eighths so the surface rate is still ~2 Hz.
    -     **claim**: Schubert marks the archetypal walking song literally 'in walking motion' — it is 2/4, D minor, with a constant quaver tread.
      
          **evidence**: 'Gute Nacht' (Winterreise No. 1) tempo marking 'Mässig, in gehender Bewegung' (Moderately, in walking motion), time signature 2/4; editions carry editorial metronome marks of crotchet = 56 and crotchet = 60. Piano texture is 'stepping quaver figures, sparingly pedalled'; the basic motif is a descending three-note figure.
      
          **kind**: composer-own-words
      
          **source**: https://www.8notes.com/scores/25628.asp
      
          **usable**: Encode WALKING_TREAD as: metre 2/4, accompaniment = unbroken eighth notes, one chord tone per eighth, melody entering on the downbeat. NOTE — a German analysis site (evgeniafoelsche.de) states 4/4 for this song; that is wrong against the score, so do not use that page.
    -     **claim**: DERIVED, NOT SOURCED: Schubert's walking quavers at his marked tempo land exactly on the measured human cadence band.
      
          **evidence**: My own arithmetic from two sourced facts: crotchet = 56-60 in 2/4 with the accompaniment in quavers gives 112-120 quavers per minute. The measured habitual walking cadence above is 110.8-121.6 steps/min. No source I found makes this connection.
      
          **kind**: measurement
      
          **source**: derived by me from https://www.8notes.com/scores/25628.asp and https://pmc.ncbi.nlm.nih.gov/articles/PMC8345504/
      
          **usable**: Rule: the note value carrying the walking pulse should tick at 105-125 per minute REGARDLESS of the notated beat. So 2/4 at crotchet=58 with quaver motion, or 4/4 at crotchet=116 with crotchet motion, are the same walk. Treat 'surface rate', not 'BPM', as the parameter.
    -     **claim**: Compound duple/triple metre is the attested signifier of the horse, not of 'journey' generally — Monelle names the exact metres and pieces.
      
          **evidence**: The noble horse topic uses 'a more or less rapid compound duple or triple rhythm, typified by the 6/8 of Schumann's Wilde Reiter, from Album for the Young; the 9/8 of Wagner's Valkyries; the 12/8, in effect, of Schubert's Erlkönig.'
      
          **kind**: musicology
      
          **source**: https://vdoc.pub/documents/the-musical-topic-hunt-military-and-pastoral-2fj8jgcgo71g
      
          **usable**: MOUNTED_TRAVEL table: metre ∈ {6/8, 9/8, 12/8}; surface rate rapid. Distinct from the on-foot table (2/4 or 4/4, even quavers). Two different travel modes, two different metre pools.
    -     **claim**: The 6/8 gallop is a cultural convention with an iconic root, and it survived after real hunting stopped resembling it — i.e. it is indexical, not a recording of a horse.
      
          **evidence**: 'The representation depends on mimicking the hooves of a horse at the gallop; there is a semiotic reason for the gallop of the musical horse, based on a cultural connection between the medieval warhorse and its fast pace.' And: 'By 1900, the signifier of the musical topic was probably independent of the music of the hunting field.' Monelle's framework distinguishes iconic topics (imitate extramusical sound) from indexical topics (rely on conventions within music — 'dance measures, horn calls'). 'Musical hunts and horses are always galloping, heroic, and masculine, unless they are dysphoric.'
      
          **kind**: musicology
      
          **source**: https://journals.library.columbia.edu/index.php/currentmusicology/article/download/5178/2425/9016
      
          **usable**: Do not try to model a real horse gait. Encode the convention: dotted-quaver/semiquaver or quaver-triplet groupings in 6/8, always with heroic register/orchestration, because the topic carries 'heroic and masculine' as part of its meaning by default. A 'dysphoric' switch (minor mode, low register) is the attested way to invert it.
    -     **claim**: The pastoral topic has exactly three named signifier components, and the single most pervasive one is a drone bass — not a mode and not a melody shape.
      
          **evidence**: Monelle's pastoral signifier 'is comprised of three components: instruments, the siciliana rhythm, and the principle of simplicity.' 'The most pervasive signifier of the pastoral topic is the drone bass' (p. 208), suggesting bagpipes; the musette and hurdy-gurdy/vielle are the other drone instruments discussed.
      
          **kind**: musicology
      
          **source**: https://journals.library.columbia.edu/index.php/currentmusicology/article/download/5178/2425/9016
      
          **usable**: PASTORAL flag sets three switches at once: (1) drone bass on tonic+fifth, held for the whole phrase; (2) siciliana rhythm in the melody; (3) 'simplicity' = restrict to 3 chords, restrict melodic range, slow harmonic rhythm. Weight the drone highest — it is the one that must always be on.
    -     **claim**: Pastorale metre and texture are specified concretely: 6/8, 9/8 or 12/8, moderate tempo, melody in parallel thirds over a drone; siciliana is slow compound dotted rhythm.
      
          **evidence**: 'Pastorales are generally in 6/8 or 9/8 or 12/8 metre, at a moderate tempo.' 'In Baroque music, a pastorale is a movement of a melody in thirds over a drone bass, recalling the Christmas music of pifferari' (zampogna bagpipe and piffero reed pipe). 'The siciliana is normally in compound dotted rhythm and is slow and sometimes melancholy in mood.' The siciliana is 'in a slow 6/8 or 12/8 compound meter.'
      
          **kind**: musicology
      
          **source**: https://en.wikipedia.org/wiki/Pastorale
      
          **usable**: PASTORAL_TABLE: metre = choice(6/8, 9/8, 12/8); harmonic rhythm = 1 chord per bar or slower; melody doubled a third below; bass = drone dyad (1,5). SICILIANA rhythm = dotted-quaver, semiquaver, quaver per 3-quaver group.
    -     **claim**: The hunt/horn-call topic in instrumental music is restricted to the natural horn's third-register triadic shapes, not to the later elaborate diatonic calls.
      
          **evidence**: Monelle tracks hunting calls 'from single-tone, purely functional calls, to the more elaborate triadic calls of the early eighteenth century, to the diatonic, "resolutely melodic" calls of the high Dampierre style', but concludes the earlier calls are the topic's source: 'manifestations of the hunt topic, as it appears in instrumental music, are usually much simpler, more wedded to the third-register triadic shapes of the older fanfares' (p. 57).
      
          **kind**: musicology
      
          **source**: https://journals.library.columbia.edu/index.php/currentmusicology/article/download/5178/2425/9016
      
          **usable**: HORN_CALL generator: pitch set = {1, 3, 5} of the major triad only, voiced in the natural horn's 3rd-6th partials (i.e. intervals of P5, P4, M3, m3 stacked upward). Forbid scale steps 2, 4, 6, 7. Rhythm from the compound-metre pool. This is a hard pitch constraint, not a style hint.
    -     **claim**: Copland's 'open' sound in Appalachian Spring mvt 1 is a fixed polychord voicing rule with fixed inversions, using only I, IV and V of A major.
      
          **evidence**: 'The harmony seems to be based on an E major triad in 2nd inversion stacked on top of an A major triad in 1st inversion.' 'The triads on the bottom are always in 1st inversion while the ones on top are always in 2nd. At various points we hear A/D, E/A and briefly E/D.' 'Each of these polychords contains a major second where the two triads join e.g. the notes D and E in the A/D chord.' 'All of the melodic and harmonic material in the first 10 bars is derived from the E/A chord.' Bars 11-12: A/D introduced bottom-up over a pedal A. Bar 13 to rehearsal 5 (bar 40): stacked chords 'gently rocking back and forth between I and IV on the bottom of the stack and I and V on the top.' Bars 41+: pared to 'a D triad with E as the added note' (Dadd2). Bars 40-46: 'a prolonged plagal cadence, I (bar 40) to IV with added notes (bars 41 to 45) resolving to I in bar 46.'
      
          **kind**: musicology
      
          **source**: https://torontoravel.com/wp-content/uploads/2013/10/TR020A-MaloneCopland-Harmony.pdf
      
          **usable**: OPEN_LANDSCAPE_CHORD(): pick bottom triad from {I, IV} in 1st inversion, top triad from {I, V} in 2nd inversion, stack them; the join must produce a major 2nd. Cadence = plagal, I-IV(add)-I, over 6+ bars. Chord vocabulary limited to I/IV/V. This is fully executable as written. CAVEAT: source is a teacher's handout (misspells 'Copeland'), not peer-reviewed — but its opening-chord reading agrees with the UNT dissertation below.
    -     **claim**: Independent confirmation of the Appalachian Spring opening pitches and of the mirror-symmetry of the spacing.
      
          **evidence**: 'The first movement of Appalachian Spring opens with the clarinet outlining an A-major triad over an a in the low strings. The harmony that follows, outlined in mm. 4-6 is an E-major chord over an A-major chord, with a bass-note a in the cellos.' 'The key of A is not confirmed, partly because leading tones tend not to resolve.' 'The interval of an ascending 3rd in the A triad (C# to E) is reflected in the E triad by the descending 3rd (G# to E). Likewise the ascending 4th in the A triad (E to A) is reflected in the E triad by the descending 4th (E to B).'
      
          **kind**: musicology
      
          **source**: https://digital.library.unt.edu/ark:/67531/metadc935698/m2/1/high_res_d/1002778190-Rober.pdf
      
          **usable**: Voicing constraint: build the upper triad as the intervallic inversion of the lower one about their shared tone. Also: suppress leading-tone resolution — treat scale degree 7 as a colour tone, not a pull to 1.
    -     **claim**: Copland's 'quartal' sound is largely horizontal (melodic), not vertical — the fourths are in the line, not in the chord.
      
          **evidence**: 'Through his linear melodic lines and chord voicings featuring open fourths and fifths, his harmonies end up sounding much more "quartal" than they truly are.' 'In Appalachian Spring, Copland's quartal "chords" are often horizontal, not vertical - they play out in a single melodic line.'
      
          **kind**: musicology
      
          **source**: http://www.russellsteinberg.com/blog/2016/11/19/classical-melting-pot-in-coplands-appalachian-spring
      
          **usable**: Get the open-country colour from the MELODY generator (favour leaps of P4 and P5 in the tune) rather than from stacking fourths in the chord. Cheap and it avoids the muddy 'quartal pad' cliché.
    -     **claim**: Pandiatonicism is definable as a mechanical rule: fixed diatonic pitch set, no functional progression, seconds allowed in voicings.
      
          **evidence**: 'The use of all diatonic notes without the need for scale degrees or harmonies to progress or function tonally'; produces 'a wash of notes from the major scale, or as chords made of non-traditional combinations of notes from a major scale, often with at least one interval of a 2nd in a chord voicing.' Named examples: Stravinsky Petrushka Fourth Tableau; Copland Appalachian Spring, which uses both 'non-traditional pandiatonic chord voicings in non-functional harmonic sequences' and 'a wash of major scale tones layered in counterpoint, disregarding dissonant intervals.'
      
          **kind**: musicology
      
          **source**: https://musictheory.pugetsound.edu/mt21c/Pandiatonicism.html
      
          **usable**: PANDIATONIC mode for the harmony engine: lock the pitch set to one diatonic collection, disable all voice-leading/resolution rules, sample 4-5 notes from the collection per chord with a constraint that ≥1 adjacent pair forms a M2. Never resolve.
    -     **claim**: Quantified mode distribution in an actual English folk-song manuscript collection: four modes account for 86 of 103 tunes, and the commonest deviation is Ionian-Mixolydian mixture.
      
          **evidence**: Lewis Jones's 2013 analysis of the Butterworth MSS, 103 tunes: 86 were 'purely modal' (Major/Ionian, Dorian, Mixolydian or Aeolian); of the remaining 16, 13 modulated between Major/Ionian and Mixolydian, 2 were Aeolian with Dorian influence, 1 Dorian with Mixolydian influence. Also: 'The Phrygian mode is rarely encountered in Celtic, Anglo-American and English folk song' and 'the full Lydian and Locrian modes scarcely appear at all.'
      
          **kind**: measurement
      
          **source**: https://folkopedia.info/wiki/Scales_and_Musical_Modes_in_Celtic,_Anglo-American_and_English_Folk_Songs
      
          **usable**: ENGLISH_PASTORAL mode table, weighted from the counts: {Ionian, Dorian, Mixolydian, Aeolian} at 86/103 ≈ 0.83 combined for pure modes; mode-mixture event probability ≈ 13/103 ≈ 0.126 and when it fires it is Ionian↔Mixolydian (flip the 7th). Set P(Lydian)=P(Locrian)=0 and P(Phrygian)≈0. This is the single most directly encodable number I found.
    -     **claim**: Vaughan Williams's modal practice includes deliberate alternation between two modes on the SAME tonic, and false relations between major and minor forms of a chord.
      
          **evidence**: 'In the English Folk Song Suite, Vaughan Williams vacillates between F Mixolydian and F Dorian modes.' In the Pastoral Symphony, 'the slow movement opens with an F major natural-horn solo above an F minor chord'; the finale's codetta has 'an opposition of B♭ minor and G major triads'; the work uses 'modal parallel triads' throughout, and is built on 'modes, parallel harmony, and the pentatonic scale.'
      
          **kind**: musicology
      
          **source**: https://en.wikipedia.org/wiki/Pastoral_Symphony_(Vaughan_Williams)
      
          **usable**: MODE_SHIFT operator: keep the tonic fixed, swap only the mode (F Mixolydian → F Dorian = flatten the 3rd). FALSE_RELATION operator: sound the major 3rd in the melody against the minor 3rd in the accompaniment. PLANING operator: move a triad in parallel motion along the mode without changing quality.
    -     **claim**: The Lark Ascending's modal identity, as read by a named musicologist, with a specific pentatonic subset.
      
          **evidence**: Christopher Mark finds the work 'begins in the Dorian mode and switches between that and the Aeolian mode interspersed with extensive use of the Pentatonic scale.' Cited pitch evidence: 'the D pentatonic scale (D-E-F♯-A-B) in cadenzas and the A section'; modal shifts between E Dorian (opening bars), E Aeolian, D Dorian, with Mixolydian inflections; 'pedal points, plagal cadences, and parallel triadic progressions that minimize tension'; key signature of one sharp implying G major but treated modally.
      
          **kind**: musicology
      
          **source**: https://en.wikipedia.org/wiki/The_Lark_Ascending_(Vaughan_Williams)
      
          **usable**: FLOATING_PASTORAL preset: pentatonic melody set {1,2,3,5,6} over a pedal; harmony from parallel triads in the mode; cadences plagal only (IV-I), never V-I. Dorian↔Aeolian toggle = raise/lower the 6th only.
    -     **claim**: HARD EVIDENCE AGAINST THE DORIAN CLAIM: Dorian is NOT significantly happier than Aeolian. The 'wistful but not tragic raised sixth' is not supported by the best empirical study.
      
          **evidence**: Temperley & Tan, 17 nonmusician participants, six folk-style melodies each rendered in six modes on a fixed tonic of C, forced-choice 'which is happier'. Proportion of trials in which each mode was judged happier: Ionian .83, Mixolydian .64, Lydian .58, Dorian .40, Aeolian .34, Phrygian .21. Effect of mode F(5,75) = 50.73, p < .001. 'Out of the fifteen pairs of modes, the pairwise differences are significant for all but three: Lydian/Mixolydian, Lydian/Dorian, and Dorian/Aeolian.' 'Our data show significant differences in the perceived happiness of all adjacent mode pairs except one, Aeolian/Dorian.'
      
          **kind**: measurement
      
          **source**: https://davidtemperley.com/wp-content/uploads/2015/11/temperley-tan.pdf
      
          **usable**: Use the raw proportions as a VALENCE weight per mode: {Ionian:0.83, Mixolydian:0.64, Lydian:0.58, Dorian:0.40, Aeolian:0.34, Phrygian:0.21}. But do NOT encode a rule 'Dorian = wistful, Aeolian = tragic' — measured difference is 0.06 and non-significant. If the repo wants a 'moody but not sad' colour, Dorian is not the evidenced lever.
    -     **claim**: Mixolydian is the evidenced 'bright but not triumphant' mode — clearly above neutral, clearly below major.
      
          **evidence**: Mixolydian scored .64 (above the .50 chance line), against Ionian .83 and Dorian .40; the Ionian/Mixolydian difference is statistically significant. Temperley & Tan's general finding: 'modes become happier as scale-degrees are raised — that is, as sharps are added and flats are removed', with Lydian the sole exception, and they attribute the overall pattern chiefly to familiarity/distance from Ionian.
      
          **kind**: measurement
      
          **source**: https://davidtemperley.com/wp-content/uploads/2015/11/temperley-tan.pdf
      
          **usable**: For 'adventure, open road, not yet arrived': Mixolydian (flatten only the 7th). It is the one-alteration-from-major mode with measured positive valence — exactly the 'bright but unresolved' colour, and it is also the second-most-common mode in the English folk corpus above. Two independent lines of evidence converge on the same choice.
    -     **claim**: Mode outweighs tempo roughly 2:1 as a driver of perceived emotion, and both outweigh timbre by an order of magnitude.
      
          **evidence**: Squared semi-partial correlations, median across emotions: Mode sr² = 0.29, Tempo 0.14, Register 0.08, Dynamics 0.04, Articulation 0.02, Timbre 0.01. Linear combinations of cues explained 89% of variance for happy, 89% sad, 85% scary, 77% peaceful. Stimulus levels: tempo as notes-per-second at 1.2, 2.0, 2.8, 4.4, 6.0 NPS; mode only major (Ionian) vs minor (Aeolian); register MIDI 53/59/65/71/77/83; dynamics ±10 to −5 dB; articulation note-duration ratio 1.0 (legato) to ~0.25; timbre flute/horn/trumpet.
      
          **kind**: measurement
      
          **source**: https://pmc.ncbi.nlm.nih.gov/articles/PMC3726864/
      
          **usable**: Budget of expressive control in a generator, as literal weights: mode 0.29, tempo 0.14, register 0.08, dynamics 0.04, articulation 0.02, timbre 0.01 — normalise and use as the mixing weights for an affect-targeting search. Note tempo was parameterised as NOTES PER SECOND (1.2-6.0), not BPM — which supports the 'surface rate' finding above.
    -     **claim**: Chromatic mediants are the attested harmonic device for cinematic 'wonder', concentrated in sci-fi and fantasy.
      
          **evidence**: 'Harmony, and especially chromaticism, is emblematic of the film music sound, and it is often used to evoke that most cinematic of feelings — wonder' (Lehman, Hollywood Harmony, OUP 2018, which 'offers a first-of-its-kind introduction to neo-Riemannian theory'). Heine (Music Analysis, 2018): 'Both major-mode and minor-mode chromatic mediant relationships appear across different genres of film, with science-fiction and fantasy films being most common.'
      
          **kind**: musicology
      
          **source**: https://onlinelibrary.wiley.com/doi/abs/10.1111/musa.12106
      
          **usable**: WONDER/VISTA transition: move the triad by a chromatic mediant (root by major or minor 3rd, keeping the chord's quality, sharing exactly one common tone). Reserve for arrival-at-a-new-place moments rather than the steady-state travel loop. CAVEAT: I could not obtain Lehman's corpus counts — the frequency weighting is unsourced.
    -     **claim**: Howard Shore's Shire theme is a concrete, small, encodable object: anhemitonic pentatonic plus a passing 6th, stepwise melody, three-chord diatonic harmony.
      
          **evidence**: 'The melody follows a D major pentatonic scale, with the occasional major sixth'; an 'Anhemitonic Pentatonic Scale' with an added sixth 'functioning as a passing note'; 'diatonic, stepwise moving melody'; harmony 'kept moderately simple, using chords I-iii-IV-I, IV-V-I-V'; orchestrated for 'celtic instruments such as fiddle and tin whistle', plus bodhrán. Shore's own words on substitution: 'If I don't use the Whistle, the clarinet is an elegant substitute for it.'
      
          **kind**: musicology
      
          **source**: https://allegromediamusic.wordpress.com/2018/05/20/lord-of-the-rings-music-analysis-part-2-the-shire-theme/
      
          **usable**: HOMELAND/DEPARTURE preset: pitch set = major pentatonic {1,2,3,5,6}, with scale degree 6 permitted only as a passing tone between 5 and 1; melodic motion stepwise within the pentatonic (so 'steps' include the m3 gaps); chord loop = choice(I-iii-IV-I, IV-V-I-V), 4 bars; lead instrument = tin whistle with clarinet as documented fallback.
    -     **claim**: A composer's own method statement for open-world travel music: deliberately hollow out the score so footsteps and environment stay audible.
      
          **evidence**: Manaka Kataoka 'was mostly in charge of the "open-air" field music composed in a characteristic minimalist style'; 'rather than capturing the weight of the world in a song, they hollowed out their compositions to give the gameplay enough space to breathe'; Kataoka 'agreed that sticking with a BGM that allows players to hear the environmental noise and footsteps can have a beneficial influence.'
      
          **kind**: composer-own-words
      
          **source**: https://nintendoeverything.com/breath-of-the-wild-composers-on-changing-up-zeldas-music-formula-and-more/
      
          **usable**: DENSITY parameter for travel music: target very low note density and long rests, with the explicit design goal that the footstep SFX supplies the pulse instead of the music. This inverts the walking-pulse rule — a valid alternative preset where the generator omits the pulse layer entirely and plays sparse punctuation.
    -     **claim**: Austin Wintory's stated method for Journey: one theme for the whole game, instrument-as-character, and deliberate removal of cultural markers.
      
          **evidence**: 'There is only one theme in Journey, and it evolves through the whole game. Musically it's like a big cello concerto where the player is the soloist and all the rest of the instruments represent the world around them.' Approached as 'one continuous, evolving piece — a symphonic poem'. 'Wintory gradually eliminated localising concepts from the score to make it as universal and culture-less as possible.'
      
          **kind**: composer-own-words
      
          **source**: https://www.thesixthaxis.com/2012/03/15/interview-journey-composer-austin-wintory/
      
          **usable**: Architectural rule rather than a note rule: ONE motif for the whole session, transformed by orchestration/register/harmonisation rather than replaced. Assign one instrument permanently to the player-avatar layer. Consciously exclude genre-marking scales (no harmonic-minor 'exotic' augmented 2nd, no obvious pentatonic-orientalism) if aiming for 'placeless'.
    -     **claim**: Auto-detected BPM figures for orchestral travel cues are unreliable and must not be used as evidence.
      
          **evidence**: For the same piece, 'Concerning Hobbits', BPM sites report 104 BPM, 117 BPM and 124 BPM across different released versions/arrangements; key reported as D major. Hooktheory's analysis pages for Skyrim's 'Secunda' (reported C minor) and 'Far Horizons' returned HTTP 403 and could not be verified.
      
          **kind**: fan-opinion
      
          **source**: https://songbpm.com/@howard-shore/concerning-hobbits
      
          **usable**: Do NOT seed a genre table from songbpm/tunebat/getsongbpm values for orchestral music — a ±20 BPM spread on one piece shows the detector is picking different metrical levels. Only use tempo numbers that come from a score marking or a controlled experiment.

**notFound**:   - Any scholarly source calling 6/8 the 'journey' or 'travelling' metre. What IS attested is narrower and different: 6/8-9/8-12/8 = pastoral/siciliana (Monelle, Pastorale sources), and compound duple = the noble horse/gallop (Monelle). The generalisation from 'horse' + 'pastoral' to 'journey' appears to be modern folklore/synthesis by film-scoring blogs, not a claim anyone with evidence makes. Treat the 6/8-equals-journey rule as FOLKLORE and encode the two narrower attested topics instead.
    - Any empirical listener study showing that bare fifths, quartal voicings or wide registral spacing are perceived as 'open space' or 'landscape'. Searched perception literature directly; found only a spaciousness study about recording/production (reverb, stereo width) across 150 excerpts, which is about mix engineering, not voicing. The Copland 'wide open spaces' link is an analytical/critical tradition, well documented as TECHNIQUE (see findings) but NOT validated as PERCEPTION.
    - Any measurement of film or game cue tempi against on-screen walking cadence. All the tempo-and-walking research is about real pedestrians walking to music (Styns, Leman, Frontiers urban study), not about composers matching a cue to an actor's or avatar's gait. This is a genuine open question and a real gap.
    - Evidence that composers modulate specifically to depict travel or changing place. The 'modulation as journey' idea turns up only as conceptual-metaphor scholarship about how music THEORISTS talk about keys (Saslaw 1996 on container/path metaphors for keys; Zbikowski on PITCH RELATIONSHIPS ARE RELATIONSHIPS IN VERTICAL SPACE). That is metatheory about analytical language, not a compositional device with evidence. Flag the 'modulation = travel' rule as unsupported.
    - Frank Lehman's corpus statistics for chromatic mediants in Hollywood Harmony — how many cues, what proportion, which transformations dominate. The book is behind paywalls; academia.edu and ResearchGate returned 403. So the chromatic-mediant device is attested qualitatively but I have NO frequency weighting for it.
    - Verified chord progressions, keys or tempi for Skyrim's 'Secunda' and 'Far Horizons' — Hooktheory returned 403 on both. The only figure that leaked through search was 'C Minor' for Secunda, unverified.
    - Copland's own words describing his open-spacing method. Found only the negative anecdote about his teacher Rubin Goldmark ('No parallel fifths! No fourths! No octaves!') and references to a 1979 Accent interview I could not retrieve. All the spacing analysis I have is third-party, not the composer's.
    - Numerical mode-distribution percentages for the English folk corpus at large. A search snippet quoted Ionian >60%, Mixolydian ~15%, Dorian 'somewhat over 10%' for the Irish tradition, but the source page (thesession.org) returned 403 and the Folkopedia article explicitly contains no percentages and cites neither Breathnach nor Bronson. The only counted dataset I could actually verify is the Butterworth MSS study (103 tunes) in the findings. Do not use the 60/15/10 figures.
    - Detailed harmonic/modal analysis of Butterworth's 'The Banks of Green Willow' or 'A Shropshire Lad', or of Delius. Only got the key of A major for Banks of Green Willow and the fact that it draws on two collected folk tunes. The English pastoral evidence in the findings rests on Vaughan Williams, not on Butterworth or Delius.
    - Any analysis of the specific travel ostinato patterns asked about — the arpeggiated broken-chord travel figure, the alberti-ish rolling pattern, the pizzicato walking line — with note values, bar lengths or named cues. Searches returned only generic film-scoring blog definitions of 'ostinato' ('short repeated phrase, creates drive and momentum'). The one concrete ostinato fact I could verify is Schubert's constant-quaver tread in 'Gute Nacht'. This is the biggest unfilled area of the brief.

**sources**:   - https://pmc.ncbi.nlm.nih.gov/articles/PMC8345504/
    - https://pubmed.ncbi.nlm.nih.gov/34556146/
    - https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7654058/
    - https://www.sciencedirect.com/science/article/abs/pii/S0167945707000589
    - https://sonicscoop.com/the-resonant-human-the-science-of-how-tempo-affects-us/
    - https://www.frontiersin.org/articles/10.3389/fpsyg.2014.01361
    - https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0067932
    - https://www.8notes.com/scores/25628.asp
    - https://evgeniafoelsche.de/en/musik/klavierlied/franz-schubert/winterreise/winterreise-gute-nacht/
    - https://vdoc.pub/documents/the-musical-topic-hunt-military-and-pastoral-2fj8jgcgo71g
    - https://journals.library.columbia.edu/index.php/currentmusicology/article/download/5178/2425/9016
    - https://en.wikipedia.org/wiki/Pastorale
    - https://en.wikipedia.org/wiki/Siciliana
    - https://torontoravel.com/wp-content/uploads/2013/10/TR020A-MaloneCopland-Harmony.pdf
    - https://digital.library.unt.edu/ark:/67531/metadc935698/m2/1/high_res_d/1002778190-Rober.pdf
    - http://www.russellsteinberg.com/blog/2016/11/19/classical-melting-pot-in-coplands-appalachian-spring
    - https://musictheory.pugetsound.edu/mt21c/Pandiatonicism.html
    - https://folkopedia.info/wiki/Scales_and_Musical_Modes_in_Celtic,_Anglo-American_and_English_Folk_Songs
    - https://en.wikipedia.org/wiki/Pastoral_Symphony_(Vaughan_Williams)
    - https://en.wikipedia.org/wiki/The_Lark_Ascending_(Vaughan_Williams)
    - https://lectarana.substack.com/p/listening-to-vaughan-williamss-english
    - https://davidtemperley.com/wp-content/uploads/2015/11/temperley-tan.pdf
    - https://pmc.ncbi.nlm.nih.gov/articles/PMC3726864/
    - https://onlinelibrary.wiley.com/doi/abs/10.1111/musa.12106
    - https://www.academia.edu/54055673/Hollywood_Harmony_Musical_Wonder_and_the_Sound_of_Cinema_By_Frank_Lehman_New_York_University_of_Oxford_Press_2018
    - https://allegromediamusic.wordpress.com/2018/05/20/lord-of-the-rings-music-analysis-part-2-the-shire-theme/
    - https://nintendoeverything.com/breath-of-the-wild-composers-on-changing-up-zeldas-music-formula-and-more/
    - https://www.thesixthaxis.com/2012/03/15/interview-journey-composer-austin-wintory/
    - https://songbpm.com/@howard-shore/concerning-hobbits
    - https://zbikowski.uchicago.edu/pdfs/Zbikowski_Metaphor_and_Music_2008.pdf
    - https://www.mtosmt.org/issues/mto.98.4.1/mto.98.4.1.zbikowski.html

---

## v2:a48b07fe01092ed11573eb57845eeccc10d8cb97e5bb25453283f6770c208675

**findings**:   -     **claim**: Sugiyama's stated design constraint: game music is heard hundreds-to-thousands of times, so it must be written to resist fatigue. NOTE: I could NOT verify this verbatim — shmuplations.com/1994gamedevs/ returned an empty body to WebFetch and a Cloudflare 202 (184 bytes) to curl. The text below is as returned in a search-engine snippet of that page, not as read from the page itself.
      
          **evidence**: Snippet text: "Game music will be heard over and over by players, hundreds or even thousands of times. So you must make music that listeners won't get tired of easily." Also from the same snippet: eccentric music "may sound interesting at first, but in the process of listening to it over and over it eventually becomes annoying."
      
          **kind**: composer-own-words (UNVERIFIED — snippet only, page unreachable)
      
          **source**: https://shmuplations.com/1994gamedevs/
      
          **usable**: Top-level generator constraint, not a number: reject any candidate loop whose novelty budget is spent in one pass. Concretely — forbid attention-grabbing one-off gestures (sudden dissonance, unrepeated fills) in overworld generation; restrict surprise to voice-leading and countermelody. Treat as a scoring penalty on 'events that occur exactly once per loop'.
    -     **claim**: Sugiyama wrote the entire Dragon Quest 1 (Famicom) score on 2 sound channels for most tracks, reserving 3 only for the opening and ending, and used a single arpeggiated line to carry harmony, rhythm AND bass simultaneously.
      
          **evidence**: "I used three sound channels for the opening and ending themes, but for all the others, I only used two." He chose "an arpeggiated line (behind the main melody) to convey a feeling of harmony, rhythm, and bass" within those two channels.
      
          **kind**: composer-own-words
      
          **source**: https://shmuplations.com/sugiyama/ (1988 BEEP magazine interview, translated)
      
          **usable**: A concrete TEXTURE rule and the minimal viable part-count: 2 voices = melody + arpeggio. Encode a 'lo-fi' texture preset with exactly 2 parts where part 2 is an arpeggiator whose note pool = current chord tones and whose lowest note doubles as the bass. 3 voices reserved for opening/ending sections.
    -     **claim**: Sugiyama on the sufficiency of very few voices.
      
          **evidence**: "A real pro should be able to make music even with three voices only. In my head, within those two or three sounds I can hear a whole orchestra."
      
          **kind**: composer-own-words
      
          **source**: https://shmuplations.com/sugiyama/
      
          **usable**: Sets an upper bound on part-count for the retro end of the genre table: voices ∈ {2,3}. Justifies a generator mode that must produce a complete-sounding field theme with ≤3 simultaneous parts.
    -     **claim**: Sugiyama composed the whole DQ1 soundtrack, including opening and overworld, in one week.
      
          **evidence**: He was given "one week to write the music" and "The actual production of the game's soundtrack progressed very smoothly and was completed within one week."
      
          **kind**: composer-own-words / wiki restatement
      
          **source**: https://shmuplations.com/sugiyama/ ; https://dragon-quest.org/wiki/K%C5%8Dichi_Sugiyama
      
          **usable**: Not a musical parameter. Useful only as evidence that the DQ1 field theme is a small, tight, formula-driven object rather than a through-composed one — supports short-loop generation over long-form.
    -     **claim**: Sugiyama's stated priority ordering: melody outranks timbre.
      
          **evidence**: "A boring melody with better sound quality is still, in the end, a boring melody." And: "even if your game only has PSG sound, if it's a good melody, it will still be interesting."
      
          **kind**: composer-own-words
      
          **source**: https://shmuplations.com/sugiyama/
      
          **usable**: Weighting rule for a generator's fitness function: melodic-contour quality should dominate instrument-selection quality. Argues for spending generation effort on the melody line, then assigning instruments from a simple table.
    -     **claim**: Sugiyama on the Dragon Quest Overture's composition time.
      
          **evidence**: "54年と5分で出来た曲" — "a song that took 54 years and five minutes to make."
      
          **kind**: composer-own-words (quoted on wiki, citing footnote 15)
      
          **source**: https://dragon-quest.org/wiki/K%C5%8Dichi_Sugiyama
      
          **usable**: Not directly encodable. Anecdote only.
    -     **claim**: Sugiyama singled out the overworld and battle themes as the two tracks needing the most craft, explicitly because of play-time exposure.
      
          **evidence**: Sugiyama "determined that the overworld and battle themes would need to be exceptionally well-crafted due to the frequency in which the player would hear them."
      
          **kind**: musicology/wiki restatement of an interview (footnote 16), not a direct quote
      
          **source**: https://dragon-quest.org/wiki/K%C5%8Dichi_Sugiyama
      
          **usable**: Justifies giving the overworld generator a higher complexity/variation budget than town or dungeon generators in the same genre table.
    -     **claim**: CORRECTION TO A PREMISE: Sugiyama's classical forms are verifiable in Dragon Quest track TITLES, but the form-named tracks are CASTLE/palace themes, not overworld themes.
      
          **evidence**: Form-named DQ tracks: 王宮のロンド (Royal Rondo, DQIII — castle), 王宮のメヌエット (Royal Minuet, DQIV — castle), 王宮のガヴォット (Royal Gavotte, DQVIII — castle), 封印されし城のサラバンド (Sealed Castle Sarabande, DQVII), パストラール～カタストロフ (Pastorale~Catastrophe, DQII), 間奏曲/インテルメッツォ (Intermezzo, DQIV onward), 序曲 (Overture, I/IV/VIII/IX/XI), 結婚ワルツ (Wedding Waltz, DQV), 洞窟のワルツ (Cave Waltz, DQIX), フォークダンス (Folk Dance, DQVI).
      
          **kind**: musicology (primary-source track listing)
      
          **source**: https://ja.wikipedia.org/wiki/ドラゴンクエストシリーズの楽曲一覧
      
          **usable**: Split the genre table by LOCATION, not by composer: castle/palace → Baroque dance forms (rondo, minuet, gavotte, sarabande, in 3/4 or 4/4 with binary/rondo repeat schemes); overworld → march/journey idiom. Do NOT assign rondo form to the overworld generator.
    -     **claim**: Dragon Quest overworld/field theme titles are overwhelmingly march-and-walking words, confirming the walking idiom at the level of the composer's own naming.
      
          **evidence**: DQI 広野を行く (Across the Wilderness); DQII 遥かなる旅路 (Distant Journey); DQIII 冒険の旅 (Journey of Adventure); DQIV 馬車のマーチ (Carriage March); DQV 地平の彼方へ (Beyond the Horizon); DQVI さすらいのテーマ (Theme of Wandering); DQVII 足どりも軽やかに (With Light Footsteps); DQVIII 広い世界へ (Into the Wide World); DQIX 野を越え山を越え (Over Fields and Over Mountains); DQX あの丘を越えたら (Once Over That Hill); DQXI 勇者は征く (The Hero Goes Forth).
      
          **kind**: musicology (primary-source track listing)
      
          **source**: https://ja.wikipedia.org/wiki/ドラゴンクエストシリーズの楽曲一覧
      
          **usable**: Directly seeds the overworld idiom flag: march. Two of eleven are literally named 'March' or 'Footsteps'. Supports a default of a steady quarter/eighth pulse with a downbeat-emphasised bass, and a tempo near walking cadence rather than a free-time ambient bed.
    -     **claim**: The DQ1 'Eight Melodies' track template that every subsequent JRPG copied, with a stated stylistic assignment per slot.
      
          **evidence**: Eight tracks: 1 Overture, 2 Castle, 3 Town, 4 Field, 5 Dungeon, 6 Battle, 7 Final Battle, 8 March (ending). Castle theme "always written in a Baroque contrapuntal style"; Field music "more romantic"; Battle music "always frantic and intentionally dissonant". Field music consistently has "a more lengthy, more consistent, and more memorable melody than" dungeon music.
      
          **kind**: musicology (author Patrick Gann's analysis; article contains no Sugiyama quotes)
      
          **source**: https://www.rpgfan.com/feature/the-eight-melodies-template-how-koichi-sugiyama-shaped-rpg-soundtracks/
      
          **usable**: The genre table's top-level slot list. Encodes as a per-slot parameter set: field = longest and most tuneful melody, longer phrase lengths and lower dissonance ceiling than dungeon; dungeon = shorter/motivic; battle = high dissonance, high tempo.
    -     **claim**: MEASURED TEMPO/KEY/METER TABLE for canonical overworld and field themes (Hooktheory TheoryTab 'Song Stats', which reports key, tempo in BPM, and meter per analysed section).
      
          **evidence**: The Legend of Zelda Overworld Theme (Kondo): B♭ Mixolydian, 154 BPM, meter 12/8 (sections 154/152/151). Hyrule Field, Twilight Princess: E Dorian + B Minor + D Major, 144 BPM, 4/4. Super Mario Bros 3 Overworld (Kondo): C Major, 150 BPM, 4/4. Final Fantasy Adventure Overworld (Kenji Ito): A Minor, 140 BPM, 4/4. Chrono Trigger Secret of the Forest (Mitsuda): F Minor + B♭ Minor, 150 BPM, 4/4. Chrono Trigger Yearnings of the Wind (Mitsuda): D Minor, 84 BPM, 4/4. Final Fantasy IV World Theme (Uematsu): A Minor, 72 BPM, 4/4. Final Fantasy VI 'Terra' (Uematsu): G♯ Minor, 80 BPM, 4/4. Final Fantasy VII Main Theme (Uematsu): G Major intro 90 BPM / E Major chorus 88 BPM, 4/4.
      
          **kind**: measurement (crowd-sourced transcription database; values are the transcriber's notated tempo, so factor-of-2 notation ambiguity exists)
      
          **source**: https://www.hooktheory.com/theorytab/view/nintendo/the-legend-of-zelda---overworld-theme ; /nintendo/hyrule-field---zelda-twilight-princess ; /koji-kondo/super-mario-bros-3---overworld ; /kenji-ito/final-fantasy-adventure---overworld ; /yasunori-mitsuda/chrono-trigger---secret-of-the-forest ; /yasunori-mitsuda/chrono-trigger---yearnings-of-the-wind ; /nobuo-uematsu/final-fantasy-iv-world-theme ; /nobuo-uematsu/terra ; /nobuo-uematsu/final-fantasy-vii---main-theme
      
          **usable**: Two-mode tempo table. Mode A 'lyrical field' = 72–90 BPM (FFIV World 72, FFVI Terra 80, CT Yearnings 84, FFVII Main 88–90). Mode B 'march/travelling' = 140–154 BPM (FF Adventure 140, Hyrule Field 144, SMB3 150, Secret of the Forest 150, LoZ 154). Weight the genre table roughly 50/50 and pick mode first, then sample BPM uniformly inside the mode's range.
    -     **claim**: MEASURED TEMPO/METER from game-rip MIDI transcriptions of overworld/field themes (vgmusic.com archive; these are fan sequences, not official scores).
      
          **evidence**: Dragon Quest III Overworld (SNES) 120 BPM 4/4 (two independent transcriptions, both 120, both 4/4). Dragon Quest V Overworld Map 108 BPM 4/4, total 16 bars = 35.6 s. Dragon Quest I 'Unknown World'/Outworld: 4/4, estimated key A minor in both transcriptions. FFV World Map 128 BPM 4/4 and a second transcription 125 BPM 4/4. Breath of Fire II World Map 114 BPM. Romancing SaGa 3 Field 150 BPM 4/4. FF1 Overworld 130 BPM 4/4.
      
          **kind**: measurement (derived by me with mido from downloaded MIDI files; fan transcriptions, so tempo is the transcriber's choice)
      
          **source**: https://www.vgmusic.com/music/console/nintendo/nes/ and https://www.vgmusic.com/music/console/nintendo/snes/
      
          **usable**: Fills the Dragon Quest gap the published sources leave. Adds a middle tempo band 108–130 BPM that sits near human walking cadence. Combined with the Hooktheory set, a defensible generator default is BPM ~ triangular(72, 120, 154) with a bimodal option.
    -     **claim**: METER: 4/4 dominates overwhelmingly. Compound meter is essentially absent as a NOTATED meter and appears instead as a triplet/shuffle feel inside 4/4.
      
          **evidence**: 12 of 12 MIDI transcriptions I parsed carried a 4/4 time-signature meta event (DQ1 x2, DQ2, DQ3 x3, DQ5, FF1, FFV x2, Romancing SaGa 3, plus one NES Zelda file). 8 of 9 Hooktheory entries are 4/4. The single exception is the Legend of Zelda Overworld Theme at 12/8 — which is the same tune other transcribers notate in 4/4 with triplets. The Dragon Quest Overture is one documented case of a genuine meter change: 6/8 intro at 76 BPM, then 4/4 main section at 120 BPM.
      
          **kind**: measurement + musicology (fan analysis for the Overture)
      
          **source**: vgmusic MIDI parse (above) + https://www.hooktheory.com/theorytab/... + https://www.tumblr.com/rompuquest/713614854367428608/dragon-quest-main-theme-a-brief-analysis
      
          **usable**: Meter table: 4/4 at ~0.85–0.9 weight, 12/8 or 6/8 at ~0.10–0.15. Better still, model compound feel as a separate 'swing/triplet subdivision' flag on a 4/4 bar rather than as a distinct meter — that matches how the corpus is actually notated.
    -     **claim**: THE recurring 'epic wandering' harmony is NOT vi-IV-I-V and is only partly I-♭VII-IV. The verified recurring family is (a) major-key borrowed ♭VI/♭VII, and (b) minor-key Aeolian descent i-♭VII-♭VI.
      
          **evidence**: FFVII Main Theme: I – vi – I – ♭VI7 – ♭VII7 – I, corroborated independently by two sources (a written analysis and Hooktheory's own chord path encoding '1.6.1.b67.b77'). LoZ Overworld in B♭ Mixolydian, Hooktheory path '1.b6.b3.…b7' = I – ♭VI – ♭III – … – ♭VII. Final Fantasy Adventure Overworld, A minor, path '1.7.6.7' = i – ♭VII – ♭VI – ♭VII. Hyrule Field (Twilight Princess), E Dorian, path '1.7.6.5.6' = i – ♭VII – ♭VI – V – ♭VI, plus a IV – V – I ('4.5.1') at the cadence. CT Yearnings of the Wind, D minor, path '1add9.6add9.5.7.3' = i(add9) – ♭VI(add9) – v – ♭VII – ♭III. SMB3 Overworld, C major, path '1.57' = I – V7.
      
          **kind**: measurement (Hooktheory chord-path encodings I extracted from page source) + musicology (independent written analysis for FFVII)
      
          **source**: https://www.gamedeveloper.com/audio/7-music-theory-lessons-from-final-fantasy-vii ; the Hooktheory URLs listed above
      
          **usable**: Directly encodable weighted progression table. MAJOR mode: I – vi – I – ♭VI7 – ♭VII7 – I ; I – ♭VI – ♭III – ♭VII. MINOR/modal mode: i – ♭VII – ♭VI – ♭VII (loopable 4-chord cell) ; i – ♭VI – v – ♭VII – ♭III ; i – ♭VII – ♭VI – V – ♭VI with an occasional IV–V–i cadence. The single highest-value rule: ♭VI and ♭VII borrowed chords are the genre marker, in both major and minor.
    -     **claim**: Bar-by-bar roman-numeral analysis of the first 8 bars of the Legend of Zelda Overworld Theme, with a stated harmonic rhythm of exactly one chord per bar.
      
          **evidence**: Key of B♭ major. Bar 1 I (B♭); bar 2 v6 (Fm/A♭, "borrowed chord from the parallel key of B♭ minor"); bar 3 ♭VI (G♭); bar 4 D♭ major, "a temporary tonicization rather than a full-on modulation"; bar 5 C♭; bar 6 B♭m; bar 7 V/V (C major, "a secondary dominant chord"); bar 8 V (F major). "Changes chords exactly once every measure." Analysis covers the "first eight bars of the main melody, omitting the intro and the second section."
      
          **kind**: musicology
      
          **source**: https://splice.com/blog/legend-of-zelda-overworld-harmony/
      
          **usable**: A hard number for harmonic rhythm: 1 chord per bar over an 8-bar phrase. Also gives a concrete 8-bar chord template for a 'bright adventure' overworld generator, and the device of a mid-phrase tonicization at bar 4.
    -     **claim**: FULL STRUCTURAL AND LOOP-LENGTH ANALYSIS of Chrono Trigger 'Secret of the Forest': a 2:13 cycle built from five sections of 8 bars each (last extended to 10), on a two-chord modal vamp that withholds the tonic for 80% of the loop.
      
          **evidence**: "Full cycle length: 2:13." Intro 0:00–0:25 (8 bars); Theme 1 0:26–0:50 (8 bars); Theme 2 0:51–1:15 (8 bars); Theme 1 Recap 1:16–1:41 (8 bars); Bridge 1:42–2:13 (8 bars + 2 bars). Intro through Theme 2 alternate iv9 (E♭m9) and v9 (Fm9) "every 2 measures". Recap: "harmony moves faster than before" with "new harmony almost every bar", first 4 bars E♭m9/Fm9 with passing chords, last 4 bars C m7 and F7. Bridge: B♭m7 – Gm7 – E♭m7 – Fm7, and it is the "first time in the entire track" the tonic B♭ minor is heard, at 1:42. A second analysis independently describes the vamp as "a vamp of the two five-note chords G♭maj7/13 to Fm7/9" and the ending as "B♭m7/9/11 – Gm7/9/11 – E♭m7/9/11 – Fm7/9/11" then "D♭9/♯11 – Cm7 – Fsus4 – F", and the mode as sitting "between the B♭ Phrygian and B♭ Aeolian/Minor profiles".
      
          **kind**: musicology (two independent analyses in agreement)
      
          **source**: https://jasonyu.me/secret-of-the-forest/ ; https://videogamemusicshrine.com/inside-the-score-chrono-trigger-secret-of-the-forest/
      
          **usable**: The single best structural template in this research. Encodes as: loop = 5 sections x 8 bars (40–42 bars total, ~133 s); harmonic rhythm 1 chord per 2 bars for sections 1–3, then 1 chord per bar in the recap as an intensification device; chord voicings are 9ths/11ths not triads; and a 'withhold the tonic until the final section' rule as the loop's payoff. Form label: intro–A–B–A'–bridge, i.e. NOT AABA and NOT rondo.
    -     **claim**: DERIVED TEMPO for Secret of the Forest resolves the factor-of-2 notation ambiguity in favour of ~75 BPM felt.
      
          **evidence**: Arithmetic on the published section timings: 8 bars of 4/4 spanning 0:00–0:25 (≈25–26 s) gives 32 beats / 25.6 s = 75 BPM. Hooktheory notates the same track at 150 BPM, exactly double. Both readings describe the same music.
      
          **kind**: measurement (arithmetic I performed on jasonyu.me's published bar counts and timings — NOT a published BPM figure)
      
          **source**: https://jasonyu.me/secret-of-the-forest/ (timings) ; https://www.hooktheory.com/theorytab/view/yasunori-mitsuda/chrono-trigger---secret-of-the-forest (notated 150 BPM)
      
          **usable**: Warns the generator that corpus BPM figures are unreliable by a factor of 2. Store tempo together with a subdivision/pulse-unit so 150-with-half-note-pulse and 75-with-quarter-note-pulse are the same table entry.
    -     **claim**: INSTRUMENT ASSIGNMENT PER SECTION for Secret of the Forest — the parts change with each 8-bar section rather than staying fixed.
      
          **evidence**: Intro: harp (arpeggios/harmony) + bass. Theme 1: Japanese flute (melody) + strings + taiko drum + tambourine. Theme 2: piano (melody). Theme 1 Recap: strings (main melody) + full orchestration. Bridge: bass (solo line) + piano (harmony). Second source adds "exotic sounding flutes coupled with an electric bass", "tabla jug sound, tambourine and conga sounds", strings, harp, piano, female choir.
      
          **kind**: musicology
      
          **source**: https://jasonyu.me/secret-of-the-forest/ ; https://videogamemusicshrine.com/inside-the-score-chrono-trigger-secret-of-the-forest/
      
          **usable**: Orchestration rule: rotate the melody instrument every 8 bars (flute → piano → strings) while holding bass and percussion constant. Gives a concrete instrument pool for a 'forest/field' preset: harp, wooden flute, strings, piano, fretless/electric bass, hand percussion (taiko, tambourine, conga).
    -     **claim**: Melodic-construction rule for Final Fantasy VI's overworld theme: a single phrase stated three times, with the A and B sections differing only in which root each of the three statements begins on.
      
          **evidence**: "The melodic line consists of a phrase repeated three times" and "The A section and the B section simply swap the roots of these three iterations. The A section's three iterations start at G♯, G♯, and B. The B section's three iterations start at B, B, and G♯." Tempo given as 80 BPM, key G♯ minor. The analysis credits 8-bit Music Theory for the structural observation.
      
          **kind**: musicology (blog restating 8-bit Music Theory) + measurement (80 BPM matches Hooktheory's independent 80 BPM for the same track)
      
          **source**: https://twodee.org/blog/17286 ; https://www.hooktheory.com/theorytab/view/nobuo-uematsu/terra
      
          **usable**: An extremely cheap and directly implementable generative rule: generate ONE phrase, then build a 2-section loop as [P@r1, P@r1, P@r2] then [P@r2, P@r2, P@r1] where r1 and r2 are the tonic and the relative-major/mediant. That alone produces a plausible overworld form from a single melodic idea.
    -     **claim**: Koji Kondo's stated reason for abandoning the series' overworld theme in Ocarina of Time, and his stated replacement strategy: adaptive variation keyed to player state.
      
          **evidence**: From a 1999 dev Q&A in 64 Dream: because Hyrule Field is so vast, he "thought it'd get boring and repetitive to hear the same melody all the time, so I decided to make a variety of music that would never get boring, with additional music and effects depending on Link's status." Also: "For Ocarina, we wanted something that didn't play so often that players got tired of listening to it."
      
          **kind**: composer-own-words (translated, via secondary reporting)
      
          **source**: https://www.gamesradar.com/games/the-legend-of-zelda/the-legend-of-zelda-ocarina-of-time-ditched-the-series-iconic-overworld-theme-because-composer-koji-kondo-thought-itd-get-boring-and-repetitive-to-hear-the-same-melody-all-the-time/
      
          **usable**: Argues the genre table needs a second overworld MODE: not 'fixed loop' but 'stem set + state switch'. Encode as: generate a base bed plus N optional overlay stems (combat-adjacent, discovery, idle), swapped on a game-state variable rather than on a fixed loop boundary. This is the documented origin of adaptive field music.
    -     **claim**: Kondo's own stated anti-fatigue device for the Zelda field music is audible counterpoint / obbligato, not melodic variety.
      
          **evidence**: "I composed the Zelda tracks while taking care to keep the feel of the world in mind... by composing so the counterpoint was audible in the phrasing, I think I managed to come up with tunes that didn't get old." And: "Perhaps it was something about the obligato that kept things from getting tiresome."
      
          **kind**: composer-own-words (translated interview)
      
          **source**: https://glitterberri.com/ocarina-of-time/special-interview-koji-kondo/
      
          **usable**: A texture rule with real generative teeth: the overworld generator should emit an independent countermelody line (not just melody + chords + bass), because two composers independently name counterpoint/arpeggiation as the mechanism that survives repetition. Combined with Sugiyama's arpeggio finding, the minimum part list is: melody, moving inner/arpeggiated voice, bass.
    -     **claim**: Jeremy Soule's stated FIRST decision on any score is the tempo.
      
          **evidence**: "When composing a soundtrack, the first thing that he decides is the tempo and the amount of energy the music will have; this decision is as much based on the genre of the game as it is the artistic style of the game." He then "starts composing smaller tracks in the soundtrack, to make sure that they match up with the vision of the game before he starts on the major themes." Separately: "I always compose from feelings or instincts. There's never a formula or rule for any project."
      
          **kind**: composer-own-words (reported, Wikipedia footnotes 5 and 9)
      
          **source**: https://en.wikipedia.org/wiki/Jeremy_Soule
      
          **usable**: Validates tempo as the ROOT node of a generative genre table — the parameter everything else hangs off. Also: generate the small/ambient cues first and derive the main theme from them, not the reverse. Note the explicit self-contradiction: he says tempo-first is his method AND that he has no formula.
    -     **claim**: MEASURED DURATIONS of Skyrim exploration cues: Western open-world exploration music runs 3.5–7.5 minutes per cue, roughly 3–6x the length of a JRPG overworld loop.
      
          **evidence**: Frostfall 3:24; Tundra 3:46; Distant Horizons 3:52; Ancient Stones 4:44; From Past to Present 5:04; Far Horizons 5:29; Unbroken Road 6:23; Standing Stones 6:35; Aurora 7:18; Under an Ancient Sun 3:39; Sovngarde 3:35; Awake 1:31; plus a separate 'Skyrim Atmospheres' track of 42:38. 52 tracks on the original soundtrack, total runtime 3:35:44.
      
          **kind**: measurement (published track durations)
      
          **source**: https://en.wikipedia.org/wiki/The_Elder_Scrolls_V:_Skyrim_(soundtrack)
      
          **usable**: Hard split in the genre table by lineage. JRPG-field preset: loop 35 s – 2:15, tuneful, fixed repeat. Western-exploration preset: cue 3:20 – 7:20, through-composed, no exact loop, played from a shuffled pool with silence between cues. Median Skyrim explore cue ≈ 4:44.
    -     **claim**: The standard method for measuring a game-music loop, and one canonical measured value.
      
          **evidence**: Loop length is measured as the duration "[from] the start of a loop to the repeat of that loop". Super Mario Bros overworld music has "a 90 second loop"; the SMB star music is "a much shorter ~2 second loop".
      
          **kind**: measurement + stated methodology
      
          **source**: http://videogamemusicnerd.blogspot.com/2014/06/analysis-amount-of-music-in-nes-games.html
      
          **usable**: Defines the unit for the loop-length column. NOTE the author's per-game figures for 33 NES games live only inside an image on that page and were not extractable as text.
    -     **claim**: Working VGM composer's rule of thumb for SNES-era JRPG loop length.
      
          **evidence**: "In general, the length of each loop is roughly 1 - 1.5 minutes long, which is standard for music for SNES video games."
      
          **kind**: fan/practitioner opinion (a commercial asset-pack author, not a measurement)
      
          **source**: https://youfulca.itch.io/snes-fantasy/devlog/140752/snes-fantasy-retro-jrpg-music-asset-pasck
      
          **usable**: A weak but usable prior for loop length: 60–90 s. It brackets the two hard measurements I have — DQV overworld transcription at 35.6 s (16 bars @ 108 BPM) and Secret of the Forest at 133 s (40+ bars) — suggesting the true genre range is wider, roughly 35 s to 135 s.
    -     **claim**: MEASURED LOOP LENGTH from a Dragon Quest V overworld transcription: 16 bars.
      
          **evidence**: dw5_overworld.mid parses as 64 beats total = 16 bars of 4/4 at a notated 108 BPM = 35.6 seconds, single pass with no repeats in the file.
      
          **kind**: measurement (my own mido parse of a fan transcription; the transcriber may have written only one loop, which is exactly what makes it useful)
      
          **source**: https://www.vgmusic.com/music/console/nintendo/snes/dw5_overworld.mid
      
          **usable**: Gives the SHORT end of the loop-length distribution: 16 bars. Combined with Secret of the Forest's 40 bars, the bar-count table is 16 / 32 / 40 bars, all multiples of 8. Strong rule: overworld loop length ∈ {16, 24, 32, 40} bars, i.e. always a whole number of 8-bar phrases.
    -     **claim**: FORM: no source supports rondo or AABA for overworld themes. The two documented forms are a sectional chain of 8-bar units and a two-part root-swap.
      
          **evidence**: Secret of the Forest = intro / A / B / A' / bridge, five 8-bar units, tonic withheld until the bridge. FFVI Terra = two sections (A, B) each built from three statements of one phrase, differing only in root order. LoZ Overworld = 8-bar main-melody phrase with one chord per bar, plus a separate intro and second section. Dragon Quest Overture = 6/8 intro at 76 BPM → 4/4 main at 120 BPM → finale marked allargando with a f-to-fff dynamic climb.
      
          **kind**: musicology (four independent analyses)
      
          **source**: https://jasonyu.me/secret-of-the-forest/ ; https://twodee.org/blog/17286 ; https://splice.com/blog/legend-of-zelda-overworld-harmony/ ; https://www.tumblr.com/rompuquest/713614854367428608/dragon-quest-main-theme-a-brief-analysis
      
          **usable**: Form table for the overworld generator, with 8 bars as the atomic unit: (a) 'chain' = intro+A+B+A'+bridge, 5x8 bars; (b) 'root-swap binary' = A[P@r1,P@r1,P@r2] B[P@r2,P@r2,P@r1]. Explicitly exclude rondo (ABACA) and AABA from the overworld slot — neither appears in any analysis found.
    -     **claim**: Mitsuda's working method on Chrono Trigger, in outline: he lived in the studio and composed at the point of physical collapse.
      
          **evidence**: He "camped out in the studio the entire time, keeping everything on all the time and drifting off to sleep. If a melody came to him while sleeping, he'd jump right up and be able to work on it." The Chrono Trigger ending theme "came to him in a dream." He developed stomach ulcers and did not go to hospital; per Uematsu he passed blood from stress, and Uematsu took over part of the score. Mitsuda is described as a composer who "can't write the music until he gets his headspace into the world of the game."
      
          **kind**: composer-own-words filtered through secondary reporting (I could not reach shmuplations.com/yasunorimitsuda/ or chronocompendium.com directly — both returned empty/503)
      
          **source**: https://www.resetera.com/threads/interview-yasunori-mitsuda-on-chrono-cross-xenosaga-ii-robos-theme-and-more.84258/ ; https://shmuplations.com/yasunorimitsuda/ (unreachable)
      
          **usable**: Not encodable as a musical parameter. Relevant only as context for why Chrono Trigger's field music is structurally unusual (two-chord modal vamps, withheld tonic) compared to the Sugiyama march template.
    -     **claim**: Modal identity of the genre: overworld themes cluster on Mixolydian, Dorian and Aeolian, not on plain Ionian major.
      
          **evidence**: Across the nine Hooktheory entries: B♭ Mixolydian (LoZ Overworld), E Dorian (Hyrule Field TP), A Minor (FF Adventure Overworld, FFIV World Theme), G♯ Minor (FFVI Terra), D Minor (CT Yearnings), F Minor + B♭ Minor (Secret of the Forest, described elsewhere as moving between B♭ Phrygian and B♭ Aeolian), against only two plain-major entries (SMB3 Overworld C major, FFVII Main Theme G/E major — and the FFVII major is immediately coloured by borrowed ♭VI and ♭VII).
      
          **kind**: measurement (aggregated from the transcription database)
      
          **source**: the nine Hooktheory theorytab URLs listed above ; https://videogamemusicshrine.com/inside-the-score-chrono-trigger-secret-of-the-forest/
      
          **usable**: Mode weighting table for the overworld slot: minor/Aeolian ≈ 0.45, Mixolydian ≈ 0.15, Dorian ≈ 0.15, major-with-borrowed-♭VI/♭VII ≈ 0.20, plain Ionian ≈ 0.05. The rule that falls out: even when major, flatten the 7th or borrow from the parallel minor.

**notFound**:   - VERBATIM, VERIFIABLE text of Sugiyama's 'hundreds or thousands of times' statement. shmuplations.com/1994gamedevs/ returns an empty body to WebFetch and a 184-byte Cloudflare 202 to curl; web.archive.org is blocked in this environment; the afteruntil.com mirror no longer resolves (ENOTFOUND). I have the sentence only as a search-engine snippet and have marked it UNVERIFIED. This is the single most important gap in the research — it is the genre's founding design statement and I could not read it at its source.
    - Any statement by Sugiyama that he used rondo, ternary or any other classical form FOR AN OVERWORLD THEME. Searched in English and Japanese. The classical-form evidence that does exist (Rondo, Minuet, Gavotte, Sarabande, Pastorale in the track titles) attaches to CASTLE and palace themes. The premise that DQ overworld themes are in rondo form is not supported by anything I found.
    - Official published tempo markings (♩= values) from any Square Enix / Doremi Dragon Quest score. Every tempo I have for Dragon Quest is either an algorithmic estimate of a cover version or my own parse of a fan MIDI transcription.
    - An authoritative measured LOOP LENGTH in bars or seconds for any Dragon Quest overworld theme. The one figure I have (16 bars / 35.6 s for DQV) is my own parse of a fan transcription and may reflect the transcriber's choices rather than the game's sequence data.
    - Per-game loop-length figures from the one genuine NES measurement study I found. The author measured 33 NES games but published the results only inside a chart image, which is not extractable as text.
    - The progression vi-IV-I-V in any overworld analysis. It appears in none of the nine Hooktheory entries or four written analyses. Named in the brief as a candidate; the corpus does not support it.
    - I-♭VII-IV specifically. ♭VII is everywhere and is confirmed as the genre marker, but the specific I-♭VII-IV cell did not appear in any analysis I could verify. What I found instead was I-vi-I-♭VI7-♭VII7 (FFVII) and i-♭VII-♭VI-♭VII (minor-mode).
    - Morrowind exploration track durations. en.uesp.net returned 403 and elderscrolls.fandom.com returned 402 Payment Required. I have Skyrim durations but not Morrowind's, so I cannot compare Soule's 2002 and 2011 approaches numerically.
    - Any analysis with numbers for Secret of Mana, Golden Sun, Terranigma, Illusion of Gaia, or Ultima overworld themes. These games were named in the brief; no Hooktheory entries exist for their overworld tracks and no written analyses with keys, tempos or roman numerals surfaced.
    - Japanese-language musicological writing on フィールド曲 (field theme) as a form. Japanese searches returned fan blogs, album store pages and track listings — the track listings were valuable, but no formal analysis of field-theme structure.
    - The Durham thesis 'Creating a Coherent Score: The Music of Fantasy CRPGs' (etheses.durham.ac.uk/id/eprint/14059), which is almost certainly the single best academic source for this brief. The PDF exceeds WebFetch's 10 MB content limit and could not be retrieved. Worth another attempt with a chunked or ranged download.
    - Confirmation of texture claims about a 'walking bass' or steady quarter/eighth pulse. Despite targeted searching, no analysis quantifies the bass rhythm of any overworld theme. What I have instead is Sugiyama's arpeggio statement and Kondo's counterpoint statement — both about the INNER voice, not the bass. The 'walking bass' premise is currently unsupported by evidence.

**sources**:   - https://shmuplations.com/sugiyama/
    - https://shmuplations.com/1994gamedevs/ (UNREACHABLE - empty body / Cloudflare 202)
    - https://shmuplations.com/yasunorimitsuda/ (UNREACHABLE - empty body)
    - https://dragon-quest.org/wiki/K%C5%8Dichi_Sugiyama
    - https://en.wikipedia.org/wiki/Koichi_Sugiyama
    - https://ja.wikipedia.org/wiki/ドラゴンクエストシリーズの楽曲一覧
    - https://www.rpgfan.com/feature/the-eight-melodies-template-how-koichi-sugiyama-shaped-rpg-soundtracks/
    - https://www.tumblr.com/rompuquest/713614854367428608/dragon-quest-main-theme-a-brief-analysis
    - https://www.hooktheory.com/theorytab/view/nintendo/the-legend-of-zelda---overworld-theme
    - https://www.hooktheory.com/theorytab/view/nintendo/hyrule-field---zelda-twilight-princess
    - https://www.hooktheory.com/theorytab/view/koji-kondo/super-mario-bros-3---overworld
    - https://www.hooktheory.com/theorytab/view/kenji-ito/final-fantasy-adventure---overworld
    - https://www.hooktheory.com/theorytab/view/yasunori-mitsuda/chrono-trigger---secret-of-the-forest
    - https://www.hooktheory.com/theorytab/view/yasunori-mitsuda/chrono-trigger---yearnings-of-the-wind
    - https://www.hooktheory.com/theorytab/view/nobuo-uematsu/final-fantasy-iv-world-theme
    - https://www.hooktheory.com/theorytab/view/nobuo-uematsu/terra
    - https://www.hooktheory.com/theorytab/view/nobuo-uematsu/final-fantasy-vii---main-theme
    - https://jasonyu.me/secret-of-the-forest/
    - https://videogamemusicshrine.com/inside-the-score-chrono-trigger-secret-of-the-forest/
    - https://splice.com/blog/legend-of-zelda-overworld-harmony/
    - https://www.gamedeveloper.com/audio/7-music-theory-lessons-from-final-fantasy-vii
    - http://nobuouematsu-musicex.blogspot.com/2011/05/final-fantasy-vii-main-theme.html
    - https://twodee.org/blog/17286
    - https://glitterberri.com/ocarina-of-time/special-interview-koji-kondo/
    - https://www.gamesradar.com/games/the-legend-of-zelda/the-legend-of-zelda-ocarina-of-time-ditched-the-series-iconic-overworld-theme-because-composer-koji-kondo-thought-itd-get-boring-and-repetitive-to-hear-the-same-melody-all-the-time/
    - https://en.wikipedia.org/wiki/Jeremy_Soule
    - https://en.wikipedia.org/wiki/The_Elder_Scrolls_V:_Skyrim_(soundtrack)
    - http://videogamemusicnerd.blogspot.com/2014/06/analysis-amount-of-music-in-nes-games.html
    - https://youfulca.itch.io/snes-fantasy/devlog/140752/snes-fantasy-retro-jrpg-music-asset-pasck
    - https://www.resetera.com/threads/interview-yasunori-mitsuda-on-chrono-cross-xenosaga-ii-robos-theme-and-more.84258/
    - https://www.vgmusic.com/music/console/nintendo/nes/ (MIDI transcriptions parsed with mido: Dw1out.mid, Dragon_Warrior.mid, dq2world2.mid, dq3_adv.mid, ff1overw.mid)
    - https://www.vgmusic.com/music/console/nintendo/snes/ (MIDI transcriptions parsed with mido: DQ3_Overworld_Map.mid, dw3_overworld.mid, dw5_overworld.mid, ff5world.mid, World5.mid, b2field2.mid, RS3_Field.mid)
    - https://etheses.durham.ac.uk/id/eprint/14059/1/James_S_Tate_-_Thesis.pdf (UNREACHABLE - exceeds 10MB fetch limit; high-value target for a follow-up)
    - https://en.uesp.net/wiki/Morrowind:Music (UNREACHABLE - 403)
    - https://elderscrolls.fandom.com/wiki/The_Elder_Scrolls_III:_Morrowind_Official_Soundtrack (UNREACHABLE - 402)
    - https://www.vgmpf.com/Wiki/index.php/Determine_Song_Length (UNREACHABLE - 503)

---

## v2:580649d1767fbf7096b271ef5759d3467b71f0a6400a99d590e2f762cc8984ee

**findings**:   -     **claim**: TEMPO DOES NOT SEPARATE the pastoral end from the dungeon end. Across five artists' SongBPM listings (10 tracks each), mean tempo is nearly identical: Hole Dweller 98.1 BPM, Fief 101.2, Erang 106.7, Thangorodrim 101.6, Mortiis 102.0. Medians 92-107.5. The 'fantasy synth is faster' hypothesis is NOT supported by this data.
      
          **evidence**: Hole Dweller BPMs: 134,51,71,98,106,85,86,108,84,158 (mean 98.1, med 92). Fief: 137,90,100,100,160,80,73,100,97,75 (mean 101.2, med 98.5). Erang: 82,115,125,100,123,140,126,81,98,77 (mean 106.7). Thangorodrim: 79,88,121,97,80,93,71,140,108,139 (mean 101.6). Mortiis: 129,120,79,81,77,117,77,92,124,124 (mean 102.0).
      
          **kind**: measurement (algorithmic — Spotify audio-feature estimates aggregated by SongBPM, not hand-tapped; sample is the ~10 tracks each artist page displays, apparently alphabetical, NOT random)
      
          **source**: https://songbpm.com/@hole-dweller , https://songbpm.com/@fief , https://songbpm.com/@erang , https://songbpm.com/@thangorodrim , https://songbpm.com/@mortiis
      
          **usable**: Do NOT differentiate the genres by tempo. Use the SAME tempo band for both: roughly 70-140 BPM, centre the distribution near 95-105 BPM. A shared weighted tempo table (e.g. 70-85: 25%, 85-105: 35%, 105-125: 25%, 125-160: 15%) fits every artist measured, pastoral or dark.
    -     **claim**: TRACK LENGTH IS THE STRONGEST MEASURED DIFFERENTIATOR. The pastoral/hobbit end writes SHORT pieces; the dark-epic end writes long ones. Hole Dweller mean 2.79 min, Fief 3.40, Erang 3.61 — versus Mortiis 5.05 and Thangorodrim 10.01. Hole Dweller's sample range (2:01-3:27) and Thangorodrim's (6:23-14:24) do not overlap at all.
      
          **evidence**: Hole Dweller durations: 3:14,2:30,3:25,2:01,3:27,2:52,2:57,2:08,3:06,2:13 (mean 2:47, max 3:27). Thangorodrim: 6:37,7:51,7:22,11:42,11:48,12:41,13:03,6:23,8:13,14:24 (mean 10:00, min 6:23). Mortiis: mean 5:03. Fief mean 3:24, Erang mean 3:37.
      
          **kind**: measurement (durations are exact catalogue metadata, not estimated — this is harder data than the BPM figures)
      
          **source**: https://songbpm.com/@hole-dweller , https://songbpm.com/@thangorodrim , https://songbpm.com/@mortiis , https://songbpm.com/@fief , https://songbpm.com/@erang
      
          **usable**: Set piece length as the primary genre discriminator. Fantasy/overworld synth: draw duration from ~2:00-4:30, centre ~3:00. Dungeon synth: draw from ~5:00-14:00. At a shared ~100 BPM in 4/4 this is roughly 75-110 bars for fantasy synth vs 190-560 bars for dungeon synth — i.e. the fantasy genre should cycle through more DISTINCT material per minute and stop, where dungeon synth sustains one idea.
    -     **claim**: Album-level track durations independently confirm the short-form pattern for the pastoral end.
      
          **evidence**: Hole Dweller 'flies the coop III' (2024), 9 tracks, 2:28-4:23, mean 3:21. Fief 'VII' (2026), 11 tracks, 1:34-6:34, mean 4:47. Erang 'Another World, Another Time' (2013), 13 tracks, 2:02-4:46 with a single 11:36 closer, mean 4:32.
      
          **kind**: measurement (Bandcamp catalogue metadata)
      
          **source**: https://holedweller.bandcamp.com/album/flies-the-coop-iii , https://fief.bandcamp.com/album/vii , https://erang.bandcamp.com/album/another-world-another-time
      
          **usable**: Album/set structure: 9-13 short pieces rather than 4-6 long ones. Note the Erang pattern of one long closing track (11:36) against twelve short ones — a 'final track is 2.5-3x normal length' rule is directly encodable.
    -     **claim**: 'Fantasy synth' is a genuinely established scene term with a published definition, and it is defined by DEPARTURE from the dark-dungeon template rather than by a specific technique.
      
          **evidence**: Bandcamp Daily: fantasy synth is "electronic music, created by solo artists, using simple digital tools. It largely eschews the 'dark dungeon' style established by Mortiis in favor of something lighter and more fanciful." And: "Whereas classic dungeon synth is dark, dank and morose, fantasy synth explores a wider palette of sounds and emotions."
      
          **kind**: musicology / music journalism (Louis Pattison, Bandcamp Daily, Aug 25 2025)
      
          **source**: https://daily.bandcamp.com/lists/fantasy-synth-album-guide
      
          **usable**: Name the genre 'fantasy synth' — it is the scene's own term for exactly this object, better attested than 'adventure synth' or 'tavern synth'. 'Wider palette' is encodable as: fantasy synth draws from a LARGER instrument pool and a LARGER set of moods per track than dungeon synth, which should be narrow and consistent.
    -     **claim**: The canonical musicological image of the pastoral end is explicitly a brightness/openness contrast against the dungeon, with named acoustic-folk instruments.
      
          **evidence**: Bandcamp Daily on Fief: "If the other artists presented here are the sounds of menace, emptiness, and despair, Fief is the sound of emerging from the dungeon into a sunlit clearing." Fief's compositions feature "light, idyllic melodies, featuring the sounds of pipes and lutes." Elsewhere Fief is described as "shimmering melodies seemingly picked out on a lyre or harpsichord."
      
          **kind**: musicology / music journalism
      
          **source**: https://daily.bandcamp.com/lists/dungeon-synth-list , https://daily.bandcamp.com/lists/fantasy-synth-album-guide
      
          **usable**: INSTRUMENT ASSIGNMENT is the clearest encodable difference. Fantasy synth lead pool: pipes/recorder/flute, lute, lyre, harpsichord, mandolin, hammered dulcimer, harp — plucked and blown, bright attack, short decay. Dungeon synth pool: choir pads, church/pipe organ, bowed strings, brass — sustained, no attack transient. Same synth engine, different patch table.
    -     **claim**: Hole Dweller (the closest existing artist to a hobbit/overworld genre) self-identifies as fantasy synth with FOLK instruments, and names non-dungeon-synth influences: 70s prog and PS1/PS2-era video game soundtracks.
      
          **evidence**: Rowland describes his work as "fantasy synth" or "fantasy/dungeon synth with folk elements." On instrumentation, he uses "electronic music production alongside stringed instruments," introducing "mandolins into the mix" on the Crossroads EP. On influences: "Over the next several releases some of my influences outside the genre have seeped in, like Rush and Genesis. I'm a massive fan of 70's prog. I also can't forget to mention that I listen to a lot of video game music. My preference is PS1 – PS2 era soundtracks." He rejects the comfy label as total: "there are songs in the discography that are definitely not comfy."
      
          **kind**: composer-own-words (interview)
      
          **source**: https://everythingisnoise.net/weekly-featured-artist/wfa-hole-dweller/
      
          **usable**: Add a real plucked-string layer (mandolin/lute) to the fantasy genre that dungeon synth does not get. The prog + PS1-JRPG influence justifies: sectional form (A-B-A with a contrasting middle) rather than dungeon synth's single-loop-forever, and occasional metre changes. Also: do NOT make every fantasy-synth track cheerful — the artist explicitly resists that.
    -     **claim**: Hole Dweller's writing method is location-driven and literally scored to a walked route through a game world, one piece per place.
      
          **evidence**: "When I initially wrote Flies the Coop, I had my character from LOTRO go to the location the song was about and I wrote with my DAW open in one window, while LOTRO was going in another." Also: "I'm more in my own nostalgic place, not thinking much of the world outside the DAW."
      
          **kind**: composer-own-words (interview)
      
          **source**: https://everythingisnoise.net/weekly-featured-artist/wfa-hole-dweller/
      
          **usable**: Strong argument for a PLACE-KEYED generator: each generated piece is named for and parameterised by a location (meadow, millstream, inn, footpath, hill), with the location choosing the instrument palette and register. Track titles in the corpus confirm this — 'Millstream Quietude', 'Along the Great East Road Cows Graze on Emerald Fields', 'An Empty Tankard of Ale at the Floating Log Inn'.
    -     **claim**: Erang — whose samples the program already ships — states he has NO music theory knowledge and composes melody-first or timbre-first, never from harmonic planning.
      
          **evidence**: "Definitely 100% self taught. I know absolutely nothing at all about music theory." His three methods: "First, I have a melody that comes to me and I try to re-create it"; recreating an inspiring atmosphere heard elsewhere; and "I just run my computer and browse my instrument and synth, I mess with sounds and preset… and, lots of times, a 'sound' inspire me to create a melody." Also "When I make music it is pure feelings and emotion… I would say that I don't use my brain, intellectually speaking."
      
          **kind**: composer-own-words (interview, This Is Darkness, 2017)
      
          **source**: https://www.thisisdarkness.com/2017/08/30/erang-interview1/
      
          **usable**: IMPORTANT NEGATIVE CONSTRAINT for the generator: do not build this genre on functional harmony or roman-numeral progressions. The scene's most prolific artist composes monophonic melody over a chosen timbre, with harmony implied rather than planned. Model as: pick patch -> generate modal melody -> add a sparse drone/pedal or parallel-third harmony, NOT chord-chart-then-melody.
    -     **claim**: Erang's stated production method: soundfonts as primary sound source, chosen for a deliberate lo-fi/quality balance; presets accepted as-is; melody prioritised over sound design; self-imposed rules dropped freely.
      
          **evidence**: "I massively use soundfonts! They are perfect for so many things, having a cool balance between lo-fi / good quality." On limited sample sets: "The fact that they have very few articulations and velocity...is in fact often a benefit when they are well made." "I like to create sounds but I won't spend a day tweaking knobs: what I prefer the most is composing melodies." "I use what I think fits the song at the moment I'm doing it or what comes under my hand. If it's a preset then I go for it." "The rule is that there are no rules. If I self impose some limitations to start the track and ignite the inspiration, I quickly drop them if I feel that the track needs something else." On his DAW: "It is a very old and outdated thing from 17 years ago...you can't click 'undo', there is none...you have to go straight to the point and I like it."
      
          **kind**: composer-own-words (interview, Dungeon Synth blog, Feb 2022)
      
          **source**: https://dungeonsynth.blogspot.com/2022/02/a-conversation-with-erang.html , https://dungeonsynth.blogspot.com/2012/10/interview-with-erang.html
      
          **usable**: Endorses the sample-playback approach the repo already uses. 'Very few articulations and velocity' as a BENEFIT means: do not add velocity humanisation or round-robin variation — flat, quantised, single-articulation playback is genre-correct, not a limitation. One patch per part, no layering unless the melody is already strong.
    -     **claim**: Erang's explicit compositional advice: melody foundation first, layers only after; do not chase tools.
      
          **evidence**: He emphasises "not adding a lot of layers if the foundation (the main melody) is not strong, and not spending too much time with technical questions or finding new plugins, but composing music instead."
      
          **kind**: composer-own-words (paraphrased in interview summary — I did NOT obtain this as a verbatim block quote, so treat the wording as reported rather than exact)
      
          **source**: https://dungeonsynth.blogspot.com/2022/02/a-conversation-with-erang.html
      
          **usable**: Generation order rule: generate the lead melody FIRST and evaluate it; only add counter-lines/pads if the melody passes a quality gate. Encodable as a conditional layer count — weak melody -> 1-2 voices, strong melody -> 3-4.
    -     **claim**: COMFY SYNTH is a real, documented subgenre and is the nearest existing label to a hobbit/overworld genre, but it is defined by MOOD and SUBJECT MATTER, not by any measurable musical parameter.
      
          **evidence**: The scene's own subgenre list gives comfy synth only a descriptor string: "instrumental, peaceful, melancholic, atmospheric, longing, calm, lo-bit, mellow, meditative, ethereal, soft, sentimental, melodic, pastoral, repetitive, soothing, winter, bittersweet, lo-fi, holiday" — emerged late 2010s, surge in 2020. Dazed: it has a "notably lighter sound, with plinking pianos and hazy synthesiser arrangements" and a "typically waddling pace"; songs are "less about icy tundras, fortresses, and ancient curses, but rather wholesome activities like picking beans, sipping on glasses of milk, and going fishing."
      
          **kind**: musicology/scene documentation (neocities scene list) + music journalism (Dazed)
      
          **source**: https://dungeon-synth.neocities.org/subgenres , https://www.dazeddigital.com/music/article/58365/1/the-inside-story-of-comfy-synth-the-internets-snuggliest-microgenre
      
          **usable**: Two encodable items only: 'plinking pianos' (add celesta/music-box/upright piano to the patch pool — a percussive-decay keyboard, unlike dungeon synth's sustained organ) and 'waddling pace' (a gently uneven/swung eighth feel rather than straight — a swing ratio parameter of ~54-58% would render 'waddling'). Note comfy synth's descriptor list includes 'winter' and 'melancholic', so it is NOT purely bright — it overlaps winter synth.
    -     **claim**: The dungeon synth family tree's other branches have documented descriptor sets that let the new genre be positioned against them.
      
          **evidence**: Old School/Classic: "fantasy, atmospheric, epic, dark, cold, medieval, minimal repetitive, instrumental, mysterious, nocturnal, melodic, suspenseful, ethereal" — "closely aligned with black metal." Winter Synth: "winter, atmospheric, nocturnal, melancholic, cold, sombre, mysterious, soothing, ethereal, calm, lonely, lush, dark, instrumental, medieval, ominous" — "modeled after Jääportit - Kauan koskematon (1999)." Chip Synth: "lo-fi, dark, epic, CRPG, suspenseful, instrumental, fantasy, nostalgic, minimal" — "combination of chiptune and dungeon synth."
      
          **kind**: musicology/scene documentation (the scene's own subgenre reference site)
      
          **source**: https://dungeon-synth.neocities.org/subgenres
      
          **usable**: Note 'minimal repetitive' appears in the OLD SCHOOL descriptor set and 'repetitive' in comfy's, but neither carries a bar count. The shared descriptor across the whole family is 'instrumental' and 'melodic' — both genres stay instrumental. Differentiate on: nocturnal/cold (dungeon) vs pastoral/sentimental (fantasy), both drawn from these attested word lists rather than invented.
    -     **claim**: FOREST SYNTH is defined partly by ABSENCE of percussion and of folk melody — which implies, by contrast, that the medieval/martial branches of the family DO use percussion. This is the only sourced statement I found bearing on the 'walking pulse' question.
      
          **evidence**: Forest synth "generally lacks Neo-Medieval Folk melodies and percussion is sparse compared to Medieval and Martial Synth, but instead primarily relies on ambient synth pads and natural recordings to create atmosphere and melody." It is "shrouded in a warmer, mellower atmosphere, even when dark and haunting, but tends to be less droning." Nature sounds cited: "Water flowing, Insect Sounds, Amphibian Noises, and Birdsong," plus "a lonely traveler playing a woodwind or sting instrument."
      
          **kind**: musicology/scene documentation (text appears to originate from RateYourMusic genre descriptions; retrieved via search summary — RYM itself returned HTTP 403 so I could NOT verify this verbatim against the primary page)
      
          **source**: https://rateyourmusic.com/genre/forest-synth/ (inaccessible, 403) — text surfaced via search index
      
          **usable**: This is the best available support for giving fantasy/overworld synth a PULSE: percussion is attested as a normal feature of 'Medieval' and 'Martial' synth, so a walking drum in the fantasy genre is scene-legitimate. Encode as: fantasy synth gets a light frame-drum/tabor ostinato present in perhaps 40-60% of tracks; dungeon synth gets percussion in near 0%. Flagged as lower-confidence — see notFound.
    -     **claim**: Fief's own catalogue tags name the target genre space explicitly, and the label/production chain is professional (mastered, not bedroom-lo-fi), unlike the scene's lo-fi stereotype.
      
          **evidence**: Fief 'VII' tags: "Ambient, electronic, medieval ambient, dungeon synth, fantasy, fantasy music, fantasy synth, Maine, medieval, medieval folk, medieval music, middle ages, neo-medieval, RPG, Salt Lake City." Credits: "Written, recorded, and mixed by Fief. Mastered by Dan Randall. Production by Out of Season."
      
          **kind**: measurement (primary catalogue metadata)
      
          **source**: https://fief.bandcamp.com/album/vii
      
          **usable**: 'neo-medieval' and 'medieval folk' are the tag neighbours of fantasy synth (dungeon synth's are dark ambient/black metal). Justifies pulling melodic material toward medieval dance forms (estampie, saltarello, branle) for the fantasy genre. Also: do not over-apply lo-fi degradation to this genre — the flagship act is professionally mastered.
    -     **claim**: A single confirmed per-track mode datum exists, and it is MAJOR — but one data point cannot support a genre rule.
      
          **evidence**: Erang, 'Dungeon Synth Til I Die': 83 BPM ("can also be used double-time at 166 BPM"), key G♯/A♭, mode MAJOR, duration 7:54, time signature "4 beats per bar", described as "a somber song" with "low energy and is not very danceable." Site states: "Song data provided by Spotify."
      
          **kind**: measurement (algorithmic — Spotify audio features)
      
          **source**: https://songbpm.com/@erang/dungeon-synth-til-i-die-jPhptBrBEz
      
          **usable**: Confirms 4/4 as the default time signature. The major-mode reading on a track described as 'somber' is a caution: algorithmic mode detection on modal/drone music is unreliable, and this is evidence that Aeolian/Dorian material gets misreported as major. Use 4/4 as the base metre; do NOT derive a mode rule from this.
    -     **claim**: Fief's fastest tracks carry dance-referencing titles, weakly suggesting that where the pastoral end does go fast, it goes fast as DANCE rather than as agitation.
      
          **evidence**: Fief's two fastest measured tracks are 'Cobblestone & Magic' at 160 BPM and 'Ad Honorem' at 137 BPM; 'Deep Forest Dance' sits at 100 BPM. Fief VII contains 'Pastourelle' (a named medieval poetic/dance form) at 5:07.
      
          **kind**: measurement (tempo, algorithmic) combined with title evidence — the interpretive link between the two is my inference, not a sourced claim
      
          **usable**: Optional rule: when the fantasy genre draws a tempo above ~130 BPM, switch to a dance topic — compound or duple medieval dance rhythm with drum — rather than simply playing the same pastoral material faster. Marked as inference, not evidence.

**notFound**:   - NO CHORD PROGRESSIONS. I found zero roman-numeral or chord-symbol analyses for Erang, Fief, Hole Dweller, Secret Stairways, Thangorodrim, or any dungeon/fantasy synth artist, in any source. Nothing like 'i-VI-VII' is documented anywhere I could reach.
    - NO SCALE-DEGREE OR MELODIC ANALYSIS. No source gives melodic contours, scale degrees, or characteristic intervals for any artist in this family.
    - NO MODE EVIDENCE WITH PITCH BACKING. The claim 'comfy synth is major, dungeon synth is minor' appears only as scene-writer opinion (stranger-aeons.com: comfy has 'light, major tone, and gentle flow'), with no pitch evidence, no analysed examples, and no measurement. That same article concedes 'none of them is radically different from classic dungeon synth'. The major/minor split is the single most tempting differentiator and it is the least evidenced. SongBPM artist pages do not expose mode at all — only per-track pages do, and only one such datum was obtained.
    - NO LOOP LENGTHS IN BARS. Despite 'minimal repetitive' and 'repetitive' being attested descriptors, no source anywhere states how long a dungeon or fantasy synth loop is in bars or seconds.
    - 'ADVENTURE SYNTH' IS NOT AN ESTABLISHED GENRE TERM. Searched directly; no definition, no Bandcamp tag, no RYM genre, no scene reference. Do not use this name. 'Fantasy synth' is the attested term for the same territory.
    - 'TAVERN SYNTH' NOT VERIFIED. Search summaries twice returned an identical fluent sentence ('gentle melodies, major-key passages, and tavern-and-meadow imagery') that I could not trace to ANY primary source. I believe this was generated by the search summariser rather than quoted. Treat 'tavern synth' as unattested and do not cite that phrasing.
    - UNVERIFIED PERCUSSION NUMBERS. A search summary asserted dungeon synth artists favour 'martial snare figures, hand drum ostinati, or timpani rolls at 40-80 BPM'. This specific BPM range appears in no retrievable source and has the signature of summariser invention. DO NOT ENCODE THE 40-80 BPM FIGURE.
    - THE WALKING-PULSE QUESTION IS ONLY WEAKLY ANSWERED. I could not reach direct evidence on whether the pastoral end uses steady percussion where dungeon synth does not. The forum thread 'Percussion in Dungeon Synth' (dungeonsynth.proboards.com/thread/250) returned HTTP 429 on every attempt. Only the indirect forest-synth contrast supports it.
    - BLOCKED SOURCES: RateYourMusic genre pages (comfy-synth, forest-synth, dungeon-synth) all HTTP 403; Album of the Year 'Every Dungeon Synth Subgenre Explained' 403; Aesthetics Wiki 402; EverybodyWiki comfy synth 403; Chosic genre audio-feature chart 403 (this one would have given genre-wide valence/energy/danceability averages); dungeonsynthwiki.com/Fief returned an empty shell; the Flagpole Hole Dweller interview 403; and the proboards 'Dungeon Synth Music Theory' thread (thread/351) returned HTTP 429 on three separate attempts — that thread is the single most likely place scene-level theory claims exist and it remains unread.
    - WIKIPEDIA IS USELESS HERE. The dungeon synth article has no musical-characteristics section at all — no tempo, rhythm, structure, instrumentation, or track length — and does not mention comfy, winter, forest, or fantasy synth as subgenres (it lists only dino synth, crypt hop, and Tanzelcore/keller synth). It names Thangorodrim once and does not mention Erang, Fief, Hole Dweller, or Secret Stairways.
    - NO METHOD STATEMENTS FROM: Grausamkeit, Secret Stairways, Thangorodrim, Vindkaldr, Elk Cloner. Diplodocus was identified only as Andrew Fritts' dino-synth project (Dungeons Deep Records), not the pastoral end. Secret Stairways yielded only ONE track of measurable data (Lammas Tide, F, 3:45, 83 BPM) — too thin to characterise.
    - ERANG DECLINES TO EXPLAIN HIS METHOD IN DETAIL, and this is itself a finding: he says he prefers 'not to get into technical comment about Dungeon Synth, because it is more about feelings', describes his work as "'Naive art' in painting: raw and sincere", and reportedly believes discussing process 'kills the magic'. The Roland Sound Canvas VA / MIDI-into-hardware / vintage-tape-recorder details attributed to him for 'Tome Zero' came from a search summary of an Invisible Oranges interview that returned 403 when fetched — I could NOT verify those gear specifics against the page and they should not be treated as confirmed.

**sources**:   - https://songbpm.com/@hole-dweller
    - https://songbpm.com/@fief
    - https://songbpm.com/@erang
    - https://songbpm.com/@thangorodrim
    - https://songbpm.com/@mortiis
    - https://songbpm.com/@secret-stairways
    - https://songbpm.com/@erang/dungeon-synth-til-i-die-jPhptBrBEz
    - https://holedweller.bandcamp.com/album/flies-the-coop-iii
    - https://fief.bandcamp.com/album/vii
    - https://erang.bandcamp.com/album/another-world-another-time
    - https://daily.bandcamp.com/lists/fantasy-synth-album-guide
    - https://daily.bandcamp.com/lists/dungeon-synth-list
    - https://everythingisnoise.net/weekly-featured-artist/wfa-hole-dweller/
    - https://www.thisisdarkness.com/2017/08/30/erang-interview1/
    - https://dungeonsynth.blogspot.com/2022/02/a-conversation-with-erang.html
    - https://dungeonsynth.blogspot.com/2012/10/interview-with-erang.html
    - https://www.blacforjemagazine.com/interviews/interview-erang
    - https://dungeon-synth.neocities.org/subgenres
    - https://www.dazeddigital.com/music/article/58365/1/the-inside-story-of-comfy-synth-the-internets-snuggliest-microgenre
    - https://www.stranger-aeons.com/comfy-synth-but-is-it-dungeon-synth/
    - https://www.synthdigest.com/2026/06/26/fief-vii/
    - https://en.wikipedia.org/wiki/Dungeon_synth

---

## v2:1e9e1e750c13428ed30c1dfaae4dc87965935c42058074430c0f4ee523f96777

**findings**:   -     **claim**: The NES 2A03 APU has exactly five monophonic channels: 2 pulse, 1 triangle, 1 noise, 1 DMC/DPCM sampler.
      
          **evidence**: "five channels: two pulse wave generators, a triangle wave, noise, and a delta modulation channel for playing DPCM samples"
      
          **kind**: measurement
      
          **source**: https://www.nesdev.org/wiki/APU
      
          **usable**: Voice budget = 5, all monophonic. A generative NES-fantasy table allocates exactly: P1=melody, P2=harmony/echo, TR=bass, NO=percussion, DMC=optional.
    -     **claim**: NES pulse channels cannot play below A1 (55 Hz); the triangle channel reaches an octave lower, to 27.3 Hz.
      
          **evidence**: "the lowest standard MIDI frequency that can be reproduced with acceptable tuning is A-1 (55 Hz) on NTSC, and G#1 (51.91 Hz) on PAL" (period $7F1); "The square channel(s) ... 54.6 Hz to 12.4 KHz"; "The triangle wave channel ... in the range of 27.3 Hz to 55.9 KHz"
      
          **kind**: measurement
      
          **source**: https://www.nesdev.org/wiki/Pulse_Channel_frequency_chart + https://fceux.com/web/help/NESSound.html
      
          **usable**: Hard rule, not a stylistic choice: any note below MIDI 33 (A1) MUST be routed to the triangle voice. This is WHY the triangle is the bass — it is the only voice that reaches bass register. Encode as a pitch-range gate per voice.
    -     **claim**: The triangle voice is one octave lower than a pulse voice at the same timer period, because its 32-step sequence takes twice as long as the pulse's 16-step sequence.
      
          **evidence**: "Due to its longer 32-step sequence, it will sound exactly one octave lower (half of the apparent frequency) compared to the equivalent period on Pulse." Formula: f = fCPU / (32 * (tval + 1))
      
          **kind**: measurement
      
          **source**: https://www.nesdev.org/wiki/APU_Triangle
      
          **usable**: Octave offset of -12 semitones for the triangle voice relative to pulse at identical period. Useful if the program models raw period values.
    -     **claim**: The NES triangle channel has NO volume control — it is on or off only, with a fixed 4-bit, 32-step waveform.
      
          **evidence**: "Triangle Channel: ... Volume: No volume control"; "the triangle generator has no velocity control beyond on or off"
      
          **kind**: measurement
      
          **source**: https://www.nesdev.org/wiki/APU + https://arxiv.org/abs/1806.04278
      
          **usable**: Bass part gets no dynamics, no envelope, no fade. Genre rule worth KEEPING: the bass line is flat-dynamic and articulated only by note on/off — so rhythm and note length carry all its expression.
    -     **claim**: NES pulse channels have 4 duty cycles and 16 volume levels; the 11-bit period gives ~1-cent tuning at the bottom but up to +84 cents error at the top of the range.
      
          **evidence**: Duty table: "0 = 12.5%, 1 = 25%, 2 = 50%, 3 = 25% negated"; "Volume: 4-bit (16 levels)"; "errors as large as +84 cents at the extreme high end (F#9 on NTSC)"
      
          **kind**: measurement
      
          **source**: https://www.nesdev.org/wiki/APU_Pulse + https://www.nesdev.org/wiki/Pulse_Channel_frequency_chart
      
          **usable**: Timbre is a 2-bit choice (4 values), volume a 4-bit choice (0-15). Note that sources conflict on duty 3: NESdev calls it '25% negated', tutorials call it '75%' — acoustically identical, so the palette is really 3 distinct timbres (12.5 / 25 / 50%).
    -     **claim**: Arpeggio speed in trackers defaults to ONE note per tick, and a tick is one video frame (60 Hz NTSC / 50 Hz PAL).
      
          **evidence**: Furnace: "E0xx: Set arpeggio speed. this sets the number of ticks between arpeggio values. default is 1." and "00xy: Arpeggio. this effect produces a rapid cycle between the current note, the note plus x semitones and the note plus y semitones." FamiTracker: "Leaving y blank causes the arp to last two ticks instead of three."
      
          **kind**: measurement
      
          **source**: https://tildearrow.org/furnace/doc/v0.6.7/3-pattern/effects.html + https://battleofthebits.com/lyceum/View/FamiTracker+Effects+Commands
      
          **usable**: THE number: 1 note per frame. A 3-note arpeggio completes a cycle in 3 frames = 50 ms at 60 Hz = 20 chord-cycles/sec. A 2-note arp = 2 frames = 33 ms = 30 cycles/sec. Encode arpeggio as: emit chord tone [i mod n] on every frame at 60 Hz.
    -     **claim**: The arpeggio is specified as semitone offsets from the root, entered as hex digits — 047 is a major triad, 037 a minor triad.
      
          **evidence**: "if you want to make a regular major chord, you will put '047' in the effect column after the note"; FamiTracker x/y are "Number of half steps from root note for first shift" and second shift
      
          **kind**: measurement
      
          **source**: https://ozzed.net/how-to-make-8-bit-music.shtml + https://battleofthebits.com/lyceum/View/FamiTracker+Effects+Commands
      
          **usable**: Directly encodable chord table: major = [0,4,7], minor = [0,3,7], dim = [0,3,6], sus4 = [0,5,7], maj7 = [0,4,7,11] (4 frames/cycle), and the tracker limit is 3 notes per arp — so a generative genre rule can cap chiptune 'chords' at triads unless it goes off-hardware.
    -     **claim**: On the C64 the arpeggio rate is 50 Hz because it is driven by the PAL raster interrupt — the rate is dictated by TV refresh, not by music.
      
          **evidence**: "Composers often deployed rapid arpeggios cycling around two or more notes at 50Hz to simulate the effect of multiple notes playing simultaneously" — "This rate derives from the television refresh cycle rather than musical considerations."
      
          **kind**: musicology
      
          **source**: https://www.gamejournal.it/driving-the-sid-chip-assembly-language-composition-and-sound-design-for-the-c64/
      
          **usable**: Region matters: PAL chip arps run at 50 Hz (20 ms/note), NTSC at 60 Hz (16.67 ms/note). A generative table for 'C64 fantasy' should use 50; for 'NES fantasy', 60. Multispeed drivers exist: 8x multispeed = 400 Hz register updates.
    -     **claim**: The echo/reverb trick spends an entire channel on a delayed, quieter copy of the melody.
      
          **evidence**: "The most common way to add a sense of space/reverb to the sound was to sacrifice one of the internal tracks to play a delayed version of the original sound, essentially using a slapback echo to add depth"; recipe: "copy the phrase/melody into another channel, moving it a few rows down, and lowering its volume"
      
          **kind**: musicology
      
          **source**: https://scrollboss.tumblr.com/post/18887948305/nes-audio-demonstrating-reverb-echo-with (via search snippet) + https://battleofthebits.com/lyceum/View/FamiTracker+Effects+Commands
      
          **usable**: Voice-allocation rule: when echo is on, effective polyphony drops by 1. Encode as: P2 = P1 delayed by N ticks at volume V-k. Delay granularity is the tracker tick (Gxx = 'Amount of ticks before note is played'), and one row = 'speed' ticks (speed 6 = 6 ticks/row).
    -     **claim**: Final Fantasy I's Prelude is the canonical fantasy-RPG use of arpeggio-as-harmony plus a channel-echo, and it is in Bb major with a I-vi-IV-V progression.
      
          **evidence**: "Prelude is written in the key of Bb major"; "a '50s progression: I-vi-IV-V (in Bb major: Bb-Gm-Eb-F)"; ending "bVI-bVII-I (Gb-Ab-Bb)", termed the "victory topos" or "Mario cadence". Also: "two pulse channels, one purposively 1/8s late to give the impression of a delay effect" / "delayed two sixteenth-notes".
      
          **kind**: musicology
      
          **source**: https://www.ajgreengrove.com/posts/2025/08-30-prelude-nes-ver-final-fantasy-i/
      
          **usable**: A fantasy-prelude generator: key Bb major; harmony I-vi-IV-V looping; cadence bVI-bVII-I; texture = continuous 16th-note broken chords spanning ~4 octaves on P1, with P2 the same line offset by 2 sixteenths. Encode the echo offset as 2 sixteenths, not a fixed ms value.
    -     **claim**: Uematsu's arpeggio in the NES Prelude omits the lowest chord tone, and he considers the resulting 'wrong' shape part of its identity.
      
          **evidence**: The intended arpeggio should start Bb-C-D-F; "the arpeggios begin from the higher notes" — the NES version begins C-D-F, skipping the lowest Bb. Uematsu called it "a very unnatural arpeggio" with "a strangely unique flavor."
      
          **kind**: composer-own-words
      
          **source**: https://www.ajgreengrove.com/posts/2025/08-30-prelude-nes-ver-final-fantasy-i/
      
          **usable**: A KEEPABLE constraint: rotate the arpeggio to start on the 2nd chord tone rather than the root. Encoded as an 'arp start index' parameter (0 = root, 1 = start on 2nd tone) — the artifact of a limit, promoted to a genre rule.
    -     **claim**: The Legend of Zelda overworld theme is in Bb major, changes chord exactly once per bar, and its 8-bar core is I - v6 - bVI - III - bVII - vi - V/V - V.
      
          **evidence**: "The harmonic rhythm of the overworld theme is very consistent; the composition changes chords exactly once every measure." Bar-by-bar: I (Bb), v6 (Fm/Ab, "a borrowed chord from the parallel key of Bb minor"), bVI (Gb), III (Db), bVII (Cb), vi (Bbm), V/V (C), V (F).
      
          **kind**: musicology
      
          **source**: https://splice.com/blog/legend-of-zelda-overworld-harmony/
      
          **usable**: Directly encodable overworld progression table: 8 bars, harmonic rhythm = 1 chord/bar, flat-side chromatic mediants (bVI, bVII, III) plus a borrowed minor v and a secondary dominant V/V landing on V. Note both this and FF1's Prelude sit in Bb major with bVI/bVII — a real, checkable pattern for 'fantasy overworld'.
    -     **claim**: MEASURED across 5,278 NES songs: average simultaneous polyphony is 2.789 voices, and the four voices are on 86.1% / 83.8% / 70.1% / 39.0% of the time.
      
          **evidence**: "# Games 397 / # Composers 296 / # Songs 5,278 / # Notes 2,325,636 / Dataset length 46.1 hours / P(Pulse 1 On) 0.861 / P(Pulse 2 On) 0.838 / P(Triangle On) 0.701 / P(Noise On) 0.390 / Average polyphony 2.789"
      
          **kind**: measurement
      
          **source**: https://arxiv.org/abs/1806.04278 (NES-MDB, Donahue/Mao/McAuley, ISMIR 2018)
      
          **usable**: THE single best number in this whole search. A generative NES table should target mean polyphony ≈ 2.8, and per-voice activity probabilities of P1 0.86, P2 0.84, TR 0.70, NO 0.39. Noise is silent 61% of the time — chiptune drums are sparse, not a constant backbeat.
    -     **claim**: MEASURED pitch ranges in the NES-MDB corpus: pulse voices span MIDI 32-108, triangle spans MIDI 21-108.
      
          **evidence**: "Pulse 1 (P1) {0, 32, ..., 108} / Pulse 2 (P2) {0, 32, ..., 108} / Triangle (TR) {0, 21, ..., 108} / Noise (NO) {0, 1, ..., 16}" ... "the pulse generators cannot produce pitches below MIDI note 32"; noise "notes" are 16 values where "higher values have more high-frequency noise"
      
          **kind**: measurement
      
          **source**: https://arxiv.org/abs/1806.04278
      
          **usable**: Per-voice MIDI clamp: P1/P2 = [32,108], TR = [21,108], NO = 16 timbral 'pitches' that are NOT MIDI notes. Feed straight into a range check.
    -     **claim**: MEASURED: at 24 Hz sampling, any NES voice has ~83% chance of still playing the same note as the previous timestep.
      
          **evidence**: "any given voice has around an 83% chance of playing the same note as that voice at the previous timestep" (at the dataset's fixed 24 Hz discretization); the trivial 'last note' bigram baseline scores 83% accuracy
      
          **kind**: measurement
      
          **source**: https://arxiv.org/abs/1806.04278
      
          **usable**: Note-density calibration: ~17% of 24 Hz frames are note onsets/offsets, i.e. roughly 4 note events per voice per second averaged across the whole corpus. Useful as a sanity bound on generated note density.
    -     **claim**: Koji Kondo: only THREE channels were usable for music, and sound effects stole them mid-song.
      
          **evidence**: "Of the NES' sound generators' scales, only three channels could be used, and it took a lot of work to make melody and rhythm apparent with just three." "The sound effects had to come out of those three channels as well, so when sound effects were happening, some channels had to be muted, silencing the music, and allowing the sound effect to play." On percussion: "the rhythm was done with just that hi-hat-esque sound" from "a channel for noise and white noise" producing "ti-tiki-ti-tiki". He compared it to "embedding the track into a small number of channels felt like a puzzle."
      
          **kind**: composer-own-words
      
          **source**: https://nintendoeverything.com/super-mario-bros-music-interview-koji-kondo/
      
          **usable**: The real working budget is 3 melodic voices, not 5 — and the music must survive one being yanked at random. A genre rule worth KEEPING: write parts that remain intelligible when any single non-melody voice is muted. Also: percussion = noise channel hi-hat pattern, not a full kit.
    -     **claim**: Nobuo Uematsu describes doubling a melody with a slightly detuned, slightly time-shifted copy — his own account of the chorus/echo trick.
      
          **evidence**: "For playing a melody, I'd play one sound at a proper frequency, and another sound with the same melody. But I'd shift the frequency a little for that one, and the timing of it." Also: "I actually enjoyed thinking about how I could make rock music with three sounds" and "I had to type in every little thing by myself, like for an 8th note in C, C8, for a 16th note in E, E16"
      
          **kind**: composer-own-words
      
          **source**: https://daily.redbullmusicacademy.com/2014/10/nobuo-uematsu-interview/
      
          **usable**: Two-parameter unison thickener: P2 = P1 with (a) a small pitch offset (detune, a few cents / a period tick) and (b) a small time offset. Distinct from the echo trick, which is a musical-value delay at reduced volume. Both are worth encoding as separate options.
    -     **claim**: Yuzo Koshiro's channel budgets, in his own words: 3 FM + 3 PSG on the base PC-88, later 6 FM + 3 PSG + a rhythm source.
      
          **evidence**: "three FM sounds and three PSG sounds" (his initial sound source); "Six FM sounds, three PSG sounds, and a rhythm sound source". On method: "the best way to get nice sounds out of an 88 was by making your own music driver" and "Since I made my own editor and driver, I could control everything about the chip down to the fine details."
      
          **kind**: composer-own-words
      
          **source**: https://daily.redbullmusicacademy.com/2014/09/yuzo-koshiro-interview/
      
          **usable**: Two more preset voice budgets for a genre table: 'PC-88 fantasy' = 3 FM + 3 PSG (6 voices); 'PC-88 enhanced' = 6 FM + 3 PSG + rhythm (10). Japanese PC RPG (Ys) chip fantasy sits at 6 voices, roughly double the NES.
    -     **claim**: Rob Hubbard synthesised drums on a melodic SID voice from a single frame of noise followed by a fast downward pitch sweep, and time-shared bass and snare on channel 3.
      
          **evidence**: "Bit#0 signals that this is a drum. Drums are made from a noise channel and also a fast frequency down, with fast decay" (McSweeney, 1993). "channel 3's bassline effectively covers this function alternating with the snare." "If the lead line has two beats rest, put a fill or some effect in there" (Hubbard). "The music was all triggered on the raster interrupt" — assembler only, "no MIDI sequencers, no Trackers."
      
          **kind**: composer-own-words
      
          **source**: https://www.gamejournal.it/driving-the-sid-chip-assembly-language-composition-and-sound-design-for-the-c64/ + https://remix64.com/interviews/interview-rob-hubbard.html
      
          **usable**: Drum recipe on a pitched voice: 1 frame noise waveform → switch to pitched waveform with a steep downward pitch envelope and fast decay. Time-sharing rule: bass voice drops out for the frames the snare occupies — encode as 'bass rests where the backbeat hits'.
    -     **claim**: Tim Follin reinforced the noise-channel drums with a synchronised triangle blip — which costs the bass line those frames.
      
          **evidence**: "Follin would beef up the noise channel's percussion on the NES by adding a triangle wave blip in sync with the noise to create convincing kick or snare sounds without sacrificing the bass." On method: he "wrote music in hexadecimal notation in assembly language", never composed on an instrument, composing while "thinking along the lines of the computer".
      
          **kind**: musicology
      
          **source**: https://thebloggertheblogger.wordpress.com/2020/03/23/chiptune-maestro-tim-follin/ + http://www.nintendoworldreport.com/feature/28827/super-follin-brothers
      
          **usable**: Kick-drum recipe: NO hit + a very short low TR note at the same frame. Consequence to model: the triangle bass is interrupted for the kick's duration (a few frames), which is audible and is part of the sound — keep it rather than smoothing it out.
    -     **claim**: The SNES SPC700/S-DSP replaced the fake-echo channel trick with a hardware echo: 8-tap FIR, delay in 16 ms steps from 0 to 240 ms, costing 2 KB of the shared 64 KB per step.
      
          **evidence**: "The Delay Time setting ... can be controlled in increments of 16ms (milliseconds), ranging from 0ms to 240ms"; "each increment of 16ms takes up 2KB of your allotted 64KB of space", maximum setting consumes "a whopping 30KB". "8-tap FIR filter for the echo"; sliders correspond to "0k, 4k, 8k, 12k, and 16k" Hz; coefficients "-128 to 127"; feedback range "-128 to 127". 8 sample channels, 32 kHz playback, BRR compression "32:9".
      
          **kind**: measurement
      
          **source**: https://samplemance.rs/snesguide/c700/volecho/ + https://tildearrow.org/furnace/doc/v0.6.7/7-systems/snes.html
      
          **usable**: SNES fantasy preset: 8 voices, echo delay quantised to 16 ms (pick a value that lands on a musical subdivision at the chosen BPM), and a memory trade-off — long echo eats sample RAM, so a big-reverb overworld theme has fewer/shorter instrument samples. Real dependency worth encoding.
    -     **claim**: Genesis voice budget: YM2612 = 6 FM channels of 4 operators, channel 3 can set operator frequencies independently, channel 6 doubles as an 8-bit PCM DAC; plus SN76489 PSG = 3 tone + 1 noise. Total 10.
      
          **evidence**: "Six concurrent FM synthesis channels (voices)", "Four operators per channel", "For channel three, operator frequencies can be set independently, making dissonant harmonics possible", "a single channel for samples in 8-bit pulse-code modulation (PCM) format". PSG: "three square waves and a noise channel". SN76489: 3 tone + 1 noise, "16 different volume levels", 10-bit period, "typically 108 Hz to 111.6 kHz, with an NTSC color burst (~3.58 MHz) clock input".
      
          **kind**: measurement
      
          **source**: https://en.wikipedia.org/wiki/Yamaha_YM2612 + https://en.wikipedia.org/wiki/Texas_Instruments_SN76489
      
          **usable**: For the repo's existing YM2612/PSG voices: 6 FM + 3 tone + 1 noise = 10 slots, but using drums costs FM channel 6. The PSG cannot go below ~108 Hz (≈A2) with the standard clock — so PSG bass is impossible; PSG is a treble/arpeggio/echo layer only. That's a real routing constraint.
    -     **claim**: Game Boy: 4 channels — pulse with sweep, pulse, a user-programmable wave channel, and noise. The wave channel is 32 4-bit samples in 16 bytes.
      
          **evidence**: "four audio channels": pulse with sweep, pulse without, "Programmable wave channel — can reproduce any waveform recorded in RAM", noise. "The wave channel on the Gameboy has a buffer containing 32 samples, or 16 bytes. These 4-bit samples are stored in a region called the Wave RAM" — "two samples contained within one byte. The upper four bits of a byte are played before the lower four."
      
          **kind**: measurement
      
          **source**: https://en.wikipedia.org/wiki/Game_Boy + https://nightshade256.github.io/2021/03/27/gb-sound-emulation.html
      
          **usable**: Game Boy fantasy preset: 4 voices, and the wave channel is the distinguishing one — an arbitrary 32-step, 4-bit (16-level) single-cycle waveform. Encode as a 32×4-bit wavetable, which is where GB bass and 'soft' lead timbres come from.
    -     **claim**: C64 SID: 3 voices, each with 4 selectable waveforms and its own ADSR, sharing one multimode filter.
      
          **evidence**: "three independent voices, each built around an oscillator that can produce four waveforms: triangle, sawtooth, a variable-width pulse, and pseudo-random noise"; "Each voice has its own ADSR envelope generator"; one "multi-mode filter" (low-pass, band-pass, high-pass) any combination of voices can route through
      
          **kind**: measurement
      
          **source**: https://en.wikipedia.org/wiki/MOS_Technology_6581
      
          **usable**: Tightest budget of all the machines at 3 voices — which is exactly why the SID is the arpeggio chip. If a genre table wants maximum arpeggio density, set voice count to 3 and force chords onto a single arpeggiating voice.
    -     **claim**: Ultima on the bare Apple II is strictly monophonic: a 1-bit speaker toggled by CPU timing loops at 1.023 MHz.
      
          **evidence**: "Whenever that memory location is read or written, the Apple's 1-bit speaker is toggled from in to out or vice versa, producing a little 'pop'." "The Apple's CPU runs at a steady 1.023MHz." Pitch is set by half-wavelength iteration counts in a hand-timed loop (author's versions: 51, then 37, then 25, then 23 cycles per iteration). No polyphony technique is described.
      
          **kind**: measurement
      
          **source**: https://bumbershootsoft.wordpress.com/2016/09/05/making-music-on-the-apple-ii/
      
          **usable**: The absolute floor of the genre: 1 voice, square wave, no volume. A 'proto-fantasy' preset = monophonic melody only, no bass, no harmony — harmony implied entirely by the melodic line's own arpeggiation.
    -     **claim**: With a Mockingboard, Ultima jumps to 6 voices per card; Ultima V supported two cards for 12 voices and used 8.
      
          **evidence**: "one chip offering three square-wave synthesis channels" — the Sound II model had two such chips, "six audio channels total". "Ultima V supported two boards, for a total of 12 voices, of which it used eight."
      
          **kind**: measurement
      
          **source**: https://en.wikipedia.org/wiki/Mockingboard
      
          **usable**: Three concrete Ultima-era voice budgets to offer as presets: 1 (bare Apple II), 6 (one Mockingboard, AY-3-8910 ×2), 8-of-12 (Ultima V, two boards). The AY-3-8910 is 3 tone + 1 noise per chip, i.e. the same family as the Genesis PSG.
    -     **claim**: Hirokazu Tanaka: the Famicom Disk System had an extra sound channel, forcing music to be re-written for the cartridge NES version.
      
          **evidence**: "Because the Disk System had an extra sound channel, we had to change it. Because the Disk System was the base format we used to create the music, we had to basically remove some of the sounds we had used and make different sounds for the non-Disk System versions, including the NES."
      
          **kind**: composer-own-words
      
          **source**: https://www.videogameschronicle.com/features/interviews/the-original-game-boy-sounds-the-best-a-very-nerdy-conversation-with-legendary-nintendo-composer-hip-tanaka/
      
          **usable**: Confirms voice count as a first-class compositional variable, not a rendering detail: the same piece is a different piece at 5 vs 6 voices. Argues for the generator choosing voice count BEFORE writing notes, then writing to that count.
    -     **claim**: Koichi Sugiyama wrote orchestral scores first and had them reduced to the Famicom's channels by a sound engineer — the constraint was applied downstream, not composed into.
      
          **evidence**: "it was largely cited that Sugiyama wrote orchestral arrangements first and then 'dumbed' them down to fit the sound limitations of the Famicom"; a commenter recalls Enix "assigned a specialised sound engineer who managed to transfer Sugiyama's compositions as accurately as possible" (uncited recollection)
      
          **kind**: fan-opinion
      
          **source**: https://classicalgaming.wordpress.com/2011/04/05/composers-koichi-sugiyama-part-1-dragon-quest-1/
      
          **usable**: Suggests a two-stage generator for the Dragon Quest flavour: (1) write an unconstrained 3-4 part contrapuntal score, (2) REDUCE it to available voices by a voice-leading reduction pass — rather than writing directly into the channel budget as Kondo/Hubbard did. Note: this is a blog's characterisation, NOT Sugiyama's own words.
    -     **claim**: Dragon Quest I shipped with exactly 8 tracks mapped 1:1 to gameplay states, with per-state style rules.
      
          **evidence**: "This soundtrack only had eight songs, and they matched the basic sections of gameplay in Dragon Quest" — Overture (Opening), Castle, Town, Field, Dungeon, Battle, Final Battle, March (Ending). Castle theme "always written in a Baroque contrapuntal style"; field music "more romantic"; battle music "always frantic and intentionally dissonant".
      
          **kind**: musicology
      
          **source**: https://www.rpgfan.com/feature/the-eight-melodies-template-how-koichi-sugiyama-shaped-rpg-soundtracks/
      
          **usable**: A genre table can key style on game-state: {castle: baroque counterpoint, imitative entries; field/overworld: romantic, lyrical, wide-interval melody; battle: fast, dissonant}. Castle = counterpoint is a directly encodable instruction (independent voices, imitation at the octave/fifth) that USES the channel budget instead of fighting it.
    -     **claim**: Most NES games used only 4 of the 5 channels, because DPCM samples cost cartridge ROM.
      
          **evidence**: "A majority of the NES library used only 4 channels due to cartridge space limitations." The NES-MDB authors likewise excluded the sampler: "Because the sampler may be used to play melodic or percussive sounds, its usage is compositionally ambiguous and we exclude it from our dataset."
      
          **kind**: musicology
      
          **source**: https://www.woovebox.com/support/guides--tutorials/genres/chiptune/nes + https://arxiv.org/abs/1806.04278
      
          **usable**: Default NES preset should be 4 voices (P1, P2, TR, NO), with DPCM off. Turning DPCM on is a later-era / bigger-cartridge marker (e.g. Final Fantasy III's drums).
    -     **claim**: Tracker tempo convention: a 'tick' is the atomic unit, rows are measured in ticks, and NTSC default tempo 150 makes speed = ticks per row exactly.
      
          **evidence**: "if you leave the tempo to 2.5 times the refresh rate (NTSC default 150 / F96), then the 'speed' setting corresponds to the amount of ticks per tracker row"; "Gxx: Delay note — Amount of ticks before note is played", with "Pattern data cannot be delayed by more than one row". A NES-export toolchain requires "a global tempo of 150bpm" with speed changes via Fxx (1..21).
      
          **kind**: measurement
      
          **source**: https://battleofthebits.com/lyceum/View/FamiTracker+Effects+Commands + https://megacatstudios.com/blogs/retro-development/creating-music-and-sound-for-nes-games
      
          **usable**: Timing model: everything quantises to 1/60 s frames. Row duration = speed × (1/60) s. At tempo 150 / speed 6, a row = 100 ms, so a 16th-note grid = 150 BPM. Tempo in this genre is NOT continuous — it is quantised to integer frames per row, which produces the characteristic slightly-odd BPM values.
    -     **claim**: NES noise channel is a 16-value pseudo-random generator with two modes (white and periodic/'metallic'), 16 volume levels, and its frequency is a 4-bit lookup index — it is not pitched in the normal sense.
      
          **evidence**: "The noise channel is predominately for percussion, that had two different modes; white noise and periodic noise." "Frequency register: 4-bit lookup table index", "Volume: 4-bit (16 levels)". NES-MDB: noise has "16 possible 'notes' (these do not correspond to MIDI note numbers) where higher values have more high-frequency noise" plus "a rarely-used mode where it instead produces metallic tones".
      
          **kind**: measurement
      
          **source**: https://www.nesdev.org/wiki/APU + https://arxiv.org/abs/1806.04278
      
          **usable**: Percussion is a 16-step timbre index, not a drum-machine sample map. Encode drums as (noise_index 0-15, volume 0-15, mode 0/1) with a short envelope — high index = hi-hat/snare, low index = rumble. Kondo's hi-hat pattern lives near the high end of the index.
    -     **claim**: The DPCM channel offers 16 fixed sample rates, default/highest 33144 Hz, 7-bit output.
      
          **evidence**: "you can specify a sampling frequency from 16 choices, with the default setting being 33144 Hz, which is the highest"; "7-bit PCM from delta-encoded samples"; "Frequency register: 4-bit index"
      
          **kind**: measurement
      
          **source**: https://www.nesdev.org/wiki/APU + search snippet from vgmrips/famicom_dpcm docs
      
          **usable**: If DPCM is enabled: sample rate is one of 16 fixed values, top = 33144 Hz, 7-bit. Not freely tunable — a drum sample's pitch is quantised to those 16 rates.

**notFound**:   - A per-channel technical breakdown of any Dragon Quest NES track — which channel plays what, whether the noise or DPCM channel was used, how many voices sound at once. Despite the prompt's framing of DQ as 'a famously tiny channel budget', I found NO source substantiating that DQ had a smaller budget than any other Famicom game; it had the same 5-channel 2A03. The 'famously tiny budget' claim appears to be folklore.
    - Key, mode, tempo (BPM), time signature, chord progression, or loop length in bars for ANY Dragon Quest theme, NES or orchestral — including the overworld/'Field' theme. Searched sheet-music sites, wikis, RPGFan, Classical Gaming, ResetEra. Nothing with actual musical content surfaced.
    - Koichi Sugiyama's OWN WORDS about the Famicom's channel count, his method of writing into it, loop lengths, or composing time. The shmuplations 1988 developer interview was unreachable (returned empty via WebFetch and 180-byte stub via curl). Everything found about Sugiyama's method is second-hand paraphrase from bloggers.
    - Tempo in BPM from a measured or primary source for ANY of the fantasy themes discussed (FF1 Prelude, Zelda Overworld, DQ Field). Hooktheory, which would have had key+BPM+chords, returned 403. All BPM figures I could have quoted would have been from unsourced tab/karaoke sites, so I recorded none.
    - A documented standard echo delay VALUE in frames for NES games. Tutorials say 'a few rows' and 'lower the volume' without numbers; the only concrete figure found is FF1 Prelude's two-sixteenth-note offset, and even that is a fan/journalist analysis, not a measurement of the ROM.
    - Koji Kondo or Hirokazu Tanaka commenting specifically on ARPEGGIO technique. Kondo talks about channels and the noise hi-hat; Tanaka's interviews are philosophical rather than technical. The arpeggio-rate evidence is all from tracker documentation and C64 scene sources, not from Nintendo composers.
    - Rob Hubbard describing his arpeggio/multiplexing technique in his own words with numbers. The remix64 interview I fetched contains no technical method detail at all; the concrete drum/bass-multiplexing specifics come from an academic paper quoting a 1993 McSweeney interview, i.e. second-hand.
    - Ultima I-III Apple II music: whether the built-in-speaker versions had continuous background music at all, and any transcription of it. Only the Mockingboard-rendered versions are documented, and Wikipedia names only Ultima V explicitly.
    - Whether NES pulse duty 3 should be modelled as 75% or as inverted 25% — NESdev says '25% negated', composer tutorials say '75%'. Acoustically identical, but no source states the equivalence outright, so I flagged rather than asserted it.
    - Loop lengths in bars or seconds for NES RPG overworld themes as a class. No source gave a measured distribution. The only structural number found is the Zelda overworld's 8-bar harmonic unit at one chord per bar.

**sources**:   - https://www.nesdev.org/wiki/APU
    - https://www.nesdev.org/wiki/APU_Pulse
    - https://www.nesdev.org/wiki/APU_Triangle
    - https://www.nesdev.org/wiki/Pulse_Channel_frequency_chart
    - https://fceux.com/web/help/NESSound.html
    - https://arxiv.org/abs/1806.04278
    - https://tildearrow.org/furnace/doc/v0.6.7/3-pattern/effects.html
    - https://tildearrow.org/furnace/doc/v0.6.7/7-systems/snes.html
    - https://battleofthebits.com/lyceum/View/FamiTracker+Effects+Commands
    - https://ozzed.net/how-to-make-8-bit-music.shtml
    - https://megacatstudios.com/blogs/retro-development/creating-music-and-sound-for-nes-games
    - https://www.woovebox.com/support/guides--tutorials/genres/chiptune/nes
    - https://samplemance.rs/snesguide/c700/volecho/
    - https://en.wikipedia.org/wiki/Yamaha_YM2612
    - https://en.wikipedia.org/wiki/Texas_Instruments_SN76489
    - https://en.wikipedia.org/wiki/Game_Boy
    - https://nightshade256.github.io/2021/03/27/gb-sound-emulation.html
    - https://en.wikipedia.org/wiki/MOS_Technology_6581
    - https://www.gamejournal.it/driving-the-sid-chip-assembly-language-composition-and-sound-design-for-the-c64/
    - https://remix64.com/interviews/interview-rob-hubbard.html
    - https://bumbershootsoft.wordpress.com/2016/09/05/making-music-on-the-apple-ii/
    - https://en.wikipedia.org/wiki/Mockingboard
    - https://nintendoeverything.com/super-mario-bros-music-interview-koji-kondo/
    - https://daily.redbullmusicacademy.com/2014/10/nobuo-uematsu-interview/
    - https://daily.redbullmusicacademy.com/2014/09/yuzo-koshiro-interview/
    - https://www.videogameschronicle.com/features/interviews/the-original-game-boy-sounds-the-best-a-very-nerdy-conversation-with-legendary-nintendo-composer-hip-tanaka/
    - https://www.ajgreengrove.com/posts/2025/08-30-prelude-nes-ver-final-fantasy-i/
    - https://splice.com/blog/legend-of-zelda-overworld-harmony/
    - https://www.rpgfan.com/feature/the-eight-melodies-template-how-koichi-sugiyama-shaped-rpg-soundtracks/
    - https://classicalgaming.wordpress.com/2011/04/05/composers-koichi-sugiyama-part-1-dragon-quest-1/
    - https://thebloggertheblogger.wordpress.com/2020/03/23/chiptune-maestro-tim-follin/
    - http://www.nintendoworldreport.com/feature/28827/super-follin-brothers
    - https://scrollboss.tumblr.com/post/18887948305/nes-audio-demonstrating-reverb-echo-with
