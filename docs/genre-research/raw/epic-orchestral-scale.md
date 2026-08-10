# RAW RESEARCH — How a dark synth record reaches epic orchestral scale

*Captured 2026-08-10 from workflow `wf_f54db96e-b81`. These are the
VERBATIM returns of the research agents that completed before the run hit its session
limit. Nothing here has been summarised or filtered by me, which is the point: the
synthesis step never ran, so this is the evidence itself rather than my reading of it.
Claims carry the agents' own confidence markers and source URLs. Treat anything
unsourced here as unverified — the adversarial verification pass did not run either.*

---

## v2:65cd0c6c201fd812916f6434c037d66ad60b2fffe66193fd2a4d7c219b8c002e

**findings**:   -     **claim**: THE CENTRAL CLAIM, CONFIRMED FROM THE PRIMARY SOURCE: an orchestral texture that looks like 5-8 parts is really 4 parts plus octave duplicates. Rimsky-Korsakov states it as a general law and specifies exactly which parts may be duplicated and in which direction.
      
          **evidence**: "In the very large majority of cases harmony is written in four parts; this applies not only to single chords or a succession of them, but also to the formation of the harmonic basis. Harmony which at first sight appears to comprise 5, 6, 7 and 8 parts, is usually only four part harmony with extra parts added. These additions are nothing more than the duplication in the adjacent upper octave of one or more of the three upper parts forming the original harmony, the bass being doubled in the lower octave only."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Rimsky-Korsakov, Principles of Orchestration, Ch. III, 'Number of harmonic parts—Duplication')
      
          **usable**: The program only ever needs to COMPOSE 4 real voices (S/A/T/B) plus a melody line. Everything above 4 is generated: duplicate S and/or A at +12; duplicate B at -12 only. With 7 parts you get 4 composed + 3 generated doublings; with 20 synth voices you get 4 composed + 16 generated doublings. No extra composition logic is required to sound like 8 parts.
    -     **claim**: The duplication direction rules are asymmetric and explicitly stated: in open (widely-divided) writing only soprano and alto may be octave-doubled; tenor must not be; bass must not be doubled upward and must never be voiced into the other parts.
      
          **evidence**: "In widely-spaced harmony only the soprano and alto parts may be doubled in octaves. Duplicating the tenor part is to be avoided, as close writing is thereby produced, and doubling the bass part creates an effect of heaviness. The bass part should never mix with the others." Also: "On account of the distance between the bass and the three other parts, only partial duplication is possible."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt
      
          **usable**: Doubling permission table, encodable directly: SOPRANO +12 allowed; ALTO +12 allowed; TENOR +12 forbidden (it collapses the spacing to close position); BASS -12 allowed, +12 forbidden. In open voicing, apply doublings only to the top two voices. Gate the doubler on voicing-mode: openVoicing ? {S,A} : {S,A,T}.
    -     **claim**: Two hard voice-leading constraints on the doubling engine, one prohibition and one explicit permission.
      
          **evidence**: "Consecutive octaves between the upper parts are not permissible." / "Consecutive fifths resulting from the duplication of the three upper parts moving in chords of sixths are of no importance." / "The bass of an inversion of the dominant chord should never be doubled in any of the upper parts." / "Notes in unison resulting from correct duplication need not be avoided, for although the tone in such cases is not absolutely uniform, the ear will be satisfied with the correct progression of parts."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt
      
          **usable**: Three checks in the doubling pass: (1) reject a doubling that creates parallel octaves between two ORIGINAL upper parts; (2) do NOT reject parallel fifths that arise purely from the doubling — pass them; (3) never double the bass note of a first-inversion dominant into an upper voice. Unisons produced by doubling are legal — do not de-duplicate them.
    -     **claim**: Rimsky-Korsakov's loudness table, exact. It is a forte table; at piano everything flattens to equality.
      
          **evidence**: "In the most resonant group, the brass, the strongest instruments are the trumpets, trombones and tuba. In loud passages the horns are only one-half as strong, 1 Trumpet = 1 Trombone = 1 Tuba = 2 Horns. Wood-wind instruments, in forte passages, are twice as weak as the horns, 1 Horn = 2 Clarinets = 2 Oboes = 2 Flutes = 2 Bassoons; but, in piano passages, all wind-instruments, wood or brass are of fairly equal balance."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. I, 'Comparison of resonance in orchestral groups')
      
          **usable**: A gain table in units where 1 trumpet = 1.0 at forte: trumpet/trombone/tuba = 1.0, horn = 0.5, flute/oboe/clarinet/bassoon = 0.25. To voice a chord at forte with equal-weight parts, allot 1 trumpet-voice OR 2 horn-voices OR 4 woodwind-voices per part. At piano, set ALL wind gains equal (1.0) — the ratio collapses. This is a dynamic-dependent gain curve, not a fixed mix.
    -     **claim**: The string-to-wind balance is also given numerically, and it too changes with dynamic.
      
          **evidence**: "...in an orchestra of medium formation, it may be taken for granted that in piano passages, the whole of one department (all 1st Violins or all 2nd Violins etc.) is equivalent in strength to one wind instrument, (Violins I = 1 Flute etc.), and, in forte passages, to two wind instruments, (Violins I = 2 Flutes = 1 Oboe + 1 Clarinet, etc.)."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt
      
          **usable**: One synth 'string section' voice = 1 wind voice at p, 2 wind voices at f. So a full 5-part string layer weighs 5 wind-voices at p and 10 at f. Use this to decide how many wind doublings are needed before the winds are audible over the strings at all: at forte you need 2 wind voices per string department just to draw level.
    -     **claim**: Doubling a group in unison does not merely add loudness — Rimsky-Korsakov specifies which timbre WINS in each combination, and the winner is not the louder one.
      
          **evidence**: "Re-inforcing both, the wind thickens the strings and softens the brass. The strings do not blend so well with the brass, and when the two groups are placed side by side, each is heard too distinctly. The combination of the three different timbres in unison produces a rich, mellow and coherent tone." And: "All, or several wind instruments in combination will absorb one department of added strings: 2 Fl. + 2 Ob. + Vns I, or: 2 Ob. + 2 Cl. + Violas, or: 2 Cl. + 2 Fag. + 'Cellos." But the reverse: "the addition of one wind instrument to all or part of the strings in unison, only thickens the resonance of the latter, the wood-wind timbre being lost in the process: Vns I + Vns II + 1 Ob., or: Violas + 'Cellos + 1 Cl., or: 'Cellos + D. basses + 1 Fag."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt
      
          **usable**: Ratio rule for the synth mixer: 4 wind voices : 1 string voice → the result reads as WIND (string is absorbed). 2 string voices : 1 wind voice → the result reads as STRING (wind timbre is lost, only thickness is gained). To CHANGE the perceived colour, add wind at ≥4:1; to merely thicken, add 1 wind at 1:2. Wind between strings and brass is a blend agent: strings+brass alone stay audibly separate; strings+wind+brass fuse.
    -     **claim**: The spacing law is stated as a function of register, with named intervals per zone — this is the overtone-series layout, and it is the thing that makes a thin texture sound like a big one.
      
          **evidence**: "The normal order of sounds or the natural harmonic scale ... may serve as a guide to the orchestral arrangement of chords. It will be seen that the widely-spaced intervals lie in the lower part of the scale, gradually becoming closer as the upper register is approached." And the explicit version: "As a general rule a chord of greatly extended range and in several parts is distributed according to the order of the natural scale, with wide intervals (octaves and sixths), in the bass part, lesser intervals (fifths and fourths) in the middle, and close intervals (3rds or 2nds) in the upper register."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. III, 'Distribution of notes in chords' and 'Remarks' §2)
      
          **usable**: A voicing generator keyed on register, in semitones: bottom zone → adjacent-voice intervals of 12 or 9 (octaves and sixths); middle zone → 7 or 5 (fifths and fourths); top zone → 4, 3 or 2 (thirds and seconds). Build every chord bottom-up with this interval budget and it will sit correctly regardless of how many voices you have.
    -     **claim**: The bass-distance rule is a single number.
      
          **evidence**: "The bass should rarely lie at a greater distance than an octave from the part directly above it (tenor harmony)."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt
      
          **usable**: Hard constraint: interval(bass, tenor) ≤ 12 semitones. Cheap to enforce and it is the single most common failure mode of naive generative voicings.
    -     **claim**: Gaps in the middle are forbidden at forte and only tolerable at piano — the loudness gates the texture rule.
      
          **evidence**: "Nothing is worse than writing chords, the upper and lower parts of which are separated by wide, empty intervals, especially in forte passages; in piano passages such distribution may be possible." Corroborated independently by Belkin: "Loud passages with holes in the middle tend to sound unsatisfactory and rather feeble."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt ; https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf
      
          **usable**: Conditional fill: if dynamic ≥ forte, require no adjacent-voice gap larger than the register's budget (12/7/4); if dynamic ≤ piano, permit hollow spacing — it becomes an expressive device (this is the dungeon-synth 'empty' sound, and it is legal only quiet).
    -     **claim**: The timbre-count limits for close vs open voicing are stated as counts, and they invert.
      
          **evidence**: "The use of four different timbres in close four-part harmony is to be avoided, as the respective registers will not correspond." / "It is possible to lend four distinct timbres to a chord in widely-divided four-part harmony, though such a chord will possess no uniformity in colour; but the higher the registers of the different instruments are placed, the less perceptible becomes the space which separates them." / "In chords of four-part harmony, three instruments of the same timbre should be combined with a fourth instrument of another." / "If one tone quality is to be enclosed, it must be between two different timbres."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. III, 'Four-part and three-part harmony')
      
          **usable**: Timbre-assignment constraint: CLOSE voicing → max 2 distinct patches per chord, canonical form 3×patchA + 1×patchB. OPEN voicing → up to 4 distinct patches allowed, and the penalty shrinks as the chord's centre rises. If a patch is sandwiched (enclosed) between two voices of another patch, those two neighbours must not be the same patch as each other.
    -     **claim**: Melody doubling in three and four octaves has a fixed instrument ORDER, top to bottom, that must not be violated.
      
          **evidence**: In 3 octaves the permitted stacks are Fl./Ob./Cl., or Ob./Cl./Fag., or Fl./Cl./Fag., or Fl./Ob./Fag. In 4 octaves: Fl./Ob./Cl./Fag. Real example, Spanish Capriccio: "Picc. / 2 Fl. / 2 Ob. + Cl. / Fag." spanning 4 octaves. And: "Deviation from the natural order, such as placing the bassoon above the clarinet or oboe, the clarinet above the oboe or flute etc., creates an unnatural resonance occasioned by the confusion of registers, the instrument of lower compass playing in its high register and vice versa." "Examples of melody doubled in five octaves are extremely rare; in such cases the strings participate in the process."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. II, 'Combination in octaves' and 'Doubling in two, three and four octaves')
      
          **usable**: When octave-stacking a melody across N synth patches, sort patches by their natural centre frequency and assign HIGHEST-centred patch to the top octave, descending. Never let a dark/low-centred patch sit above a bright/high-centred one. Cap at 4 octaves for a normal climax; 5 octaves is a once-per-piece event and must include the string layer. Note the Spanish Capriccio stack doubles the middle octaves with 2 voices each — the octaves are not equally weighted.
    -     **claim**: String melody doubling schemes with exact section assignments, including a two-octave and a four-octave form, plus an explicit note that the resulting imbalance does not matter.
      
          **evidence**: Double octaves: "Vns I ]8 / Vns II + Violas ]8" or "Vns I ]8 / Vns II / 'Cellos ]8" — "may be used for full cantabile melodies extremely tense in character, and in forte passages for choice." Low form: "Violas ]8 / 'Cellos / D. basses ]8" or "Vns I + II + Violas ]8 / 'Cellos / D. basses ]8" — "employed when the low register of each instrument is brought into play, and also to suit phrases of a rough and severe character." Four octaves: "Vns I / Vns II / Violas / 'Cellos / D. basses" — "is very seldom found, and as a rule, only when supported by wind instruments." And the licence: "The lack of balance in the distribution Vns I + II + Violas ]8 / 'Cellos + D. basses ]8 is not of any great importance, for, in such cases, the partial harmonics of one octave support the tone of the other, and vice versa."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. II, 'Melody in double octaves', 'Doubling in three and four octaves')
      
          **usable**: Three named string presets the program can select by character: TENSE/FORTE = 3 voices over 2 octaves, weighted 1:2 (top octave one voice, lower octave two voices). ROUGH/SEVERE = same shape but the whole stack shifted into the bottom two octaves. CLIMAX = 5 voices over 4 octaves, and only when wind/brass doubling is also active. The explicit licence means the program may weight the lower octave 3× heavier than the upper without correction.
    -     **claim**: Rimsky-Korsakov names the cross-group unison pairings that actually blend, by register correspondence, and names the one pairing that does not.
      
          **evidence**: "...the instruments in each group which can be combined with the greatest amount of success are those whose respective registers correspond the most nearly; Violin + Trumpet; Viola + Horn; 'Cellos/D. basses + Trombones/Tuba (for heavy massive effects). The combination of horns and 'cellos, frequently employed, produces a beautifully blended, soft quality of tone." Three-group: "Vns + Ob. (Fr., Cl.) + Trumpet; Violas (or 'Cellos) + Cl. (Eng. horn) + Horn; 'Cellos/D. basses + 2 Fag. + 3 Trombones + Tuba." But: "Owing to the dissimilarity between the quality of string and brass tone, the combination of these two groups in unison can never yield such a perfect blend as that produced by the union of strings and wood-wind."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. II, sections D and E)
      
          **usable**: A blend-partner lookup table for unison doubling, three tiers by register: HIGH = bright-string + reed + brass-bright (violin/oboe/trumpet); MID = warm-string + hollow-reed + horn (viola-cello/clarinet/horn); LOW = low-string + double-reed + trombone/tuba. Only double within a tier. Two-element string+brass doublings will not fuse — insert the woodwind member to glue them.
    -     **claim**: The brass doubling rules are stated as instrument counts, including RK's own preferred five-voice layout and the rule that horns must be doubled whenever mixed with other brass.
      
          **evidence**: "It is evident that the quartet of horns presents every facility for four-part harmony, perfectly balanced in tone, without doubling the bass in octaves." / "...the third trombone and the tuba usually form the bass in octaves, and the three upper parts are generally allotted to the two remaining trombones reinforced by a trumpet or two horns in unison, so as to obtain a perfect balance of tone." / "I have often adopted the following combination of brass instruments, and consider it eminently satisfactory: 2 horns and tuba to form the bass in octaves, the three other parts given to the trombones." / "The best combination is trombones, horns, or trumpets in three's. If the instruments are mixed the number of horns should be doubled." / "When the whole group is used the number of horns should be doubled." / "...the horns being marked one degree louder than the other instruments, to secure balance of tone." / "When chords of widely-divided harmony are distributed throughout several harmonic registers, the register occupied by the horns need not be doubled."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. III, 'Harmony in the brass', 'Four-part writing', 'Writing in several parts')
      
          **usable**: Brass allocator: 4 horn-voices alone = self-sufficient closed 4-part chord, NO bass octave doubling needed. Mixed brass chord = every horn part gets 2 voices (or +1 dynamic step, e.g. f→ff, if you cannot spend a second voice). RK's own 5-voice epic layout, directly implementable: bass in octaves on 2 horns + tuba, three upper parts on trombones. If the chord is spread across separate register islands, skip the horn doubling — the isolation does the work.
    -     **claim**: Sustained brass 'pad' is specified as a pitch structure, not a texture.
      
          **evidence**: "In handling an orchestra the brass is frequently employed to sustain notes in two or three octaves; this sphere of activity must not be ignored. The tenuto is generally given to two trumpets, or to two or four horns in the octave, (in double octaves). The octave is sometimes formed by trumpets and horns acting together... The trombone with its ponderous tone rarely takes part in such combinations." And on the middle-note imbalance: "The imperfect balance arising from the duplication of the middle note is compensated for by the mixture of timbres, which lends some unity to the chord."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. III, 'Duplication in the brass')
      
          **usable**: The 'epic held note' is one pitch class in 2 or 3 octaves, played by 2-4 horn-type voices, with the MIDDLE octave deliberately doubled (two different patches) and the trombone-type patch excluded. That is 4-5 synth voices producing a wall on one note.
    -     **claim**: The harmonic background must be an octave away from the melody AND quieter — stated as a rule, with a reason.
      
          **evidence**: "The greater the dissimilarity in timbre between the harmonic basis on the one hand and the melodic design on the other, the less discordant the notes extraneous to the harmony will sound... in these two groups [wood-wind and brass], therefore, the harmonic basis generally remains an octave removed from the melodic design, and should be of inferior dynamic power." Related: "...the harmonic basis should differ from the melody not only in fullness and intensity of tone, but also in colour. If the fanfare figure is allotted to the brass (trumpets or horns) the harmony should be given to the wood-wind; if the phrase is given to the wood-wind (oboes and clarinets) the harmony should be entrusted to the horns."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. IV, 'Harmonic basis' and 'Different ways of orchestrating the same music')
      
          **usable**: Three separations between melody layer and pad layer, all cheap: (1) ≥12 semitones of register separation; (2) pad gain strictly below melody gain; (3) different patch family — and specifically, if the melody is brass, the pad is wind, and vice versa. This is what lets a melody with passing/ornamental notes sit over a static pad without sounding wrong — the timbre gap absorbs the dissonance.
    -     **claim**: The entry order for a long crescendo is fixed and named, and the reverse for diminuendo.
      
          **evidence**: "Prolonged orchestral crescendi are obtained by the gradual addition of other instruments in the following order: strings, wood-wind, brass. Diminuendo effects are accomplished by the elimination of the instruments in the reverse order (brass, wood-wind, strings)."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. IV, 'Crescendo and diminuendo')
      
          **usable**: Layer-entry schedule, literally: strings first, winds second, brass last; unwind brass → winds → strings. For a 7-part program this gives an ordering key on every part (string-family=0, wind=1, brass=2) and the build is a sort by that key.
    -     **claim**: The two-group crescendo mechanic: the second group enters QUIET and crescendos FASTER, so the timbre changes as the level rises.
      
          **evidence**: "The operation which consists in contrasting the resonance of two different groups ... transforms a simple into a complex timbre, suddenly, or by degrees. It is used in establishing a crescendo. While the first group effects the crescendo gradually, the second group enters piano or pianissimo, and attains its crescendo more rapidly. The whole process is thereby rendered more tense as the timbre changes."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. IV, 'Amplification and elimination of tone qualities')
      
          **usable**: Two automation ramps, not one: group A ramps p→ff over the whole span; group B enters at pp partway in and ramps pp→ff over a SHORTER span, finishing at the same instant. The crossing of the two curves is the perceived 'growth'. Cheap and it works with two synth voices.
    -     **claim**: Divergence/convergence fills the opening middle with newly-added doublings — the doublings are the mechanism of the crescendo, not a decoration on it.
      
          **evidence**: "In the majority of cases, diverging and converging progressions simply consist in the gradual ascent of the three upper parts, with the bass descending. The distance separating the bass from the other parts is trifling at first, and grows by degrees... The intermediate intervals are filled up by the introduction of fresh parts as the distance widens, so that the upper parts become doubled or trebled. In converging progressions the tripled and doubled parts are simplified, as the duplicating instruments cease to play. Moreover, if the harmony allows it, the group in the middle region which remains stationary is the group to be retained, or else the sustained note which guarantees unity in the operation."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. IV, 'Diverging and converging progressions')
      
          **usable**: Build algorithm: as the outer parts diverge, spawn one new doubling each time an adjacent-voice gap exceeds the register interval budget. On the way down, kill doublings in reverse spawn order but PIN one stationary middle voice (a pedal) that never drops out. This is a complete generative build-and-release with a single state variable (outer-voice span).
    -     **claim**: Re-entry after a rest must be at an extreme dynamic — mf/mp re-entries are explicitly named as the failure case, and the same applies to starting and ending a piece.
      
          **evidence**: "A group of instruments which has been silent for some time gains fresh interest upon its reappearance... After a long rest the re-entry of the horns, trombones and tuba should coincide with some characteristic intensity of tone, either pp or ff; piano and forte re-entries are less successful, while re-introducing these instruments mezzo-forte or mezzo-piano produces a colourless and common-place effect. This remark is capable of wider application. For the same reasons it is not good to commence or finish any piece of music either mf or mp."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. IV, 'Economy in orchestral colour')
      
          **usable**: Constraint on the scheduler: any part whose rest exceeds N bars must re-enter at velocity in the top or bottom quintile, never the middle. Same for the first and last event of the piece. Trivial to enforce and it removes the 'flat MIDI' quality that generative music usually has.
    -     **claim**: Rimsky-Korsakov gives an explicit frequency-of-use ordering for the whole orchestra, which doubles as a scarcity budget.
      
          **evidence**: "Neither musical feeling nor the ear itself can stand, for long, the full resources of the orchestra combined together. The favourite group of instruments is the strings, then follow in order the wood-wind, brass, kettle-drums, harps, pizzicato effects, and lastly the percussion, also, in point of order, triangle, cymbals, big drum, side drum, tambourine, gong. Further removed stand the celesta, glockenspiel and xylophone, which instruments, though melodic, are too characteristic in timbre to be employed over frequently... the percussion is seldom employed, and practically never all together, but in single instruments or in two's and three's."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. IV, 'Economy in orchestral colour')
      
          **usable**: A duty-cycle table: strings ~always available, winds next, brass sparing, tuned percussion rare, untuned percussion rarest and never more than 2-3 simultaneously. Implement as a per-family max-on-time budget over the piece. Directly relevant to dungeon synth, where the bell/glockenspiel colour is the signature and must be rationed.
    -     **claim**: Berlioz contradicts the reflex to double downward: unison doubling of violins beats octave-below doubling, and viola-below-violin doubling is actively harmful.
      
          **evidence**: "It frequently happens that, in order to give a passage greater energy, the first violins are doubled by the second violins an octave lower; but, if the passage do not lie excessively high, it is better to double them in unison. The effect is thus incomparably finer and more forcible. The overwhelming effect of the peroration of the first movement in Beethoven's minor Symphony is attributable to the unison of the violins. It happens, even in such a case, that if, the violins being thus together, additional force should be sought by subjoining the violas in octaves, this weak lower doubling, on account of the disproportionate upper part, produces a futile murmuring, by which the vibration of the high violin notes is rather obscured than assisted. It is preferable, if the viola part cannot be made prominent, to employ it in augmenting the sound of the violoncellos, taking care to put them together (as much as the low compass of the instrument will permit) in the unison and not in the octave."
      
          **kind**: practitioner-own-words
      
          **source**: https://archive.org/details/atreatiseonmode00berlgoog (Berlioz, A Treatise on Modern Instrumentation and Orchestration, English trans., pp. 22-23)
      
          **usable**: Register-conditional doubling rule that inverts the default: if the melody is NOT in the extreme high register, double at the UNISON (0 semitones) with a second detuned voice, not at -12. Only go to -12 when the melody is genuinely high. And a weak, dark voice placed an octave below a strong bright one is worse than useless — reassign that voice to reinforce the bass line at unison instead. This is the exact opposite of the naive 'stack more octaves' instinct and is the cheapest quality win available.
    -     **claim**: Berlioz's divisi rule: split WITHIN each section rather than assigning section A to line 1 and section B to line 2 — the spatial co-location hides the split.
      
          **evidence**: "...it will be always better ... to divide the first violins into two sets, and the second violins also, causing these latter to double the two parts of the first violins, than to allow all the first violins to play one portion, and all the second violins another; for the distance of the two points of departure of the sounds will break the unity of the passage, rendering the join too apparent. Whereas, the same division occurring on both sides among the two sets of violins ... the divided sets are so near each other that it is impossible to perceive the dispersion of the passage, and the hearer may imagine it to be executed entire by all the violins. ... this mode of procedure is applicable to all the parts of the orchestra which possess in themselves analogies of quality of tone or lightness."
      
          **kind**: practitioner-own-words
      
          **source**: https://archive.org/details/atreatiseonmode00berlgoog (Berlioz, Treatise, p. 21)
      
          **usable**: When splitting a difficult or fast line across two synth voices, give BOTH voices the same pan position and the same patch, and interleave the notes; do not pan them apart. Panning apart advertises the seam. Corollary for a program: any doubling meant to be heard as ONE thicker instrument must share pan and patch; any doubling meant to be heard as TWO instruments must differ in at least one of pan/patch/register.
    -     **claim**: Berlioz's ideal concert orchestra, as an exact instrument count — a ground-truth ratio table.
      
          **evidence**: "...the finest concert orchestra ... would be an orchestra thus composed:— 21 First Violins. 20 Second do. 18 Violas. 8 First Violoncellos. 7 Second do. 10 Double-Basses. 4 Harps. 2 Piccolo Flutes. 2 Large Flutes. 2 Hautboys. 1 Corno Inglese. 2 Clarinets. 1 Corno di Bassetto, or one Bass-clarinet. 4 Bassoons. 4 Horns with Cylinders. 2 Trumpets with Cylinders. 2 Cornets a Pistons. 3 Trombones. 1 Great Bass Trombone. 1 Ophicleide in B♭ (or a Bass-Tuba). 2 Pairs of Kettle-Drums, and 4 Drummers. 1 Long Drum. 1 Pair of Cymbals." Elsewhere he specifies the Grand-Opéra minimum: "it should have at least fifteen first violins, fourteen second violins, ten violas, and twelve violoncellos."
      
          **kind**: practitioner-own-words
      
          **source**: https://archive.org/details/atreatiseonmode00berlgoog (Berlioz, Treatise, 'The Orchestra', p. 241)
      
          **usable**: Total 84 melodic players; strings 84→ 84 of which strings are 21+20+18+15+10 = 84... more usefully: strings 84 players vs winds+brass 27 vs percussion. String:wind ratio ≈ 3:1 by headcount. Violin I : Violin II : Viola : Cello : Bass = 21:20:18:15:10, i.e. roughly 2:2:2:1.5:1. If the program allocates 20 synth voices to a 'string orchestra', that ratio gives 5:5:4:4:2. Note the near-EQUALITY of Vn I and Vn II (21 vs 20) — the seconds are not a thin garnish, they are a full second line.
    -     **claim**: Berlioz's imaginary festival orchestra gives a per-register recipe list mapping instrument combination → emotional accent → dynamic tint. This is a lookup table of sonorities, written by a practitioner, with the dynamic pre-assigned.
      
          **evidence**: From the 467-player list ("120 Violins, divided into two, or three, and four parts. 40 Violas... 45 Violoncellos. 18 Double-Basses with 3 strings... 16 Horns... 30 Harps. 30 Pianofortes..."): "From the division of the 120 violins into eight or ten parts, aided by the 50 violas, in their high notes, the angelic aerial accent, and the pianissimo tint. From the division of the violoncellos and double-basses below in slow movements, the melancholy religious accent, and the mezzo forte tint. From the union, in a small band, of the very low notes of the clarinet family, the gloomy accent, and the forte and mezzo forte tints. From the union ... of the low notes of the hautboys, corni inglesi, and bassons-quinte, mingled with the low notes of the large flutes, the religiously mournful accent, and the piano tint. From the union ... of the low notes of the ophicleides, bass-tuba, and horns, mingled with the pedale of the tenor-trombones, with the lowest notes of the bass-trombones, and of the 16 feet stop (open flute) of the organ, profoundly grave, religious, and calm accents, and the piano tint. From the union ... of the highest notes of the small clarinets, flutes, and piccolo flutes, the shrill accent, and the forte tint. From the union ... of the horns, trumpets, cornets, trombones, and ophicleides, a pompous and brilliant accent, and the forte tint."
      
          **kind**: practitioner-own-words
      
          **source**: https://archive.org/details/atreatiseonmode00berlgoog (Berlioz, Treatise, pp. 242-243)
      
          **usable**: A directly codeable sonority table for a dark-fantasy program. Seven presets, each = (register, patch set, dynamic): AERIAL = divided high strings, pp. MELANCHOLY = divided low cellos/basses, mf. GLOOMY = very low clarinet-family only, mf-f. MOURNFUL = low double-reeds + low flutes, p. GRAVE/CALM = low tuba/horns + trombone pedal + 16' organ, p. SHRILL = highest small clarinets/piccolos, f. POMPOUS = full brass, f. Note that the two most 'dungeon synth' colours (GLOOMY and GRAVE) are LOW registers at p-mf, not loud — the epic layer is the POMPOUS/SHRILL preset switched in on top.
    -     **claim**: Strauss, quoted by Forsyth, names a doubling that is actively worthless: reinforcing a trombone bass theme with bassoons, cellos and basses.
      
          **evidence**: "In his Commentaries and Additions to Berlioz's Orchestration Strauss points the moral of Berlioz's remark that the effect of reinforcing the Double-Basses with the Trombone is bad. He says, 'In big tuttis one often finds important bass themes allotted to the trio of Trombones, reinforced also by Bassoons, Cellos, and Double-Basses. Such "doubling" is perfectly useless. ... If one has no filling-up passages or figures to give to the Bassoons, Cellos, and Double-Basses, one should rather let them rest during the marcatos of the Trombones unless one has the specific intention of softening the brilliance of these latter instruments.'"
      
          **kind**: practitioner-own-words
      
          **source**: https://archive.org/stream/cu31924022381440/cu31924022381440_djvu.txt (Forsyth, Orchestration, 1914, p. 151)
      
          **usable**: Anti-rule for the low end: do NOT pile every low patch on the bass theme. When trombone-type brass has the bass line, give the low string/bassoon voices either a different figure or SILENCE. The only legitimate reason to double there is deliberate softening of the brass edge. This frees 2-3 synth voices in exactly the register where a synth mix muds up worst.
    -     **claim**: Forsyth on what a wind doubling actually contributes to a string melody: not audibility, but 'solidity' — one player against a dozen.
      
          **evidence**: "In this tune the muted Violas stand out more prominently than the English Horn. The two tone-colours are very similar, but the one stave represents one player and the other stave perhaps a dozen. This is the fate of almost all Wood-Wind instruments when doubling a String-melody in the unison. That is not to say, however, that the plan is of no value. The added richness which the Strings — or, for the matter of that, the French-Horns — acquire is a great factor in the success of the melody. A very experienced orchestral musician of the last generation always used this expression, 'A Wood-Wind solidifies a tune on the Strings.'"
      
          **kind**: musicology
      
          **source**: https://archive.org/stream/cu31924022381440/cu31924022381440_djvu.txt (Forsyth, Orchestration, 1914, p. 224)
      
          **usable**: Set the wind-doubling voice well BELOW the string voice in gain — its job is spectral, adding the reedy formant that the string patch lacks, not adding level. In a synth mix this is a low-level parallel layer, maybe -10 to -12 dB, chosen for its odd-harmonic content.
    -     **claim**: Belkin states the central claim in modern terms and gives the threshold for a 'tutti'.
      
          **evidence**: "One can speak of a tutti when at least three of the four orchestral families are present. Since the number of instruments in such a grouping will inevitably exceed the number of (audibly distinguishable) real parts, the challenge of the tutti is create a coherent, rich whole, where all the elements contribute something meaningful." And: "the more instruments are playing, the less ways there are to combine them!"
      
          **kind**: musicology
      
          **source**: https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf (Alan Belkin, Artistic Orchestration, 2001, p. 25)
      
          **usable**: Definitional test the program can apply: a passage reads as TUTTI when ≥3 of the 4 families are sounding, regardless of voice count. So a 7-part program hits 'full orchestra' with as few as 3 parts — one string-type, one wind-type, one brass-type — provided the registers are correctly spread. This is the single most important budget fact for a small synth ensemble.
    -     **claim**: Belkin gives the three, and only three, ways to organise a tutti, with an explicit ranking.
      
          **evidence**: "*All families have complete harmony, including all the main elements in the music, but the details and part-writing are independent in each family. This is the most common method; it gives a rich sound, without grayness. (Sometimes winds and, more rarely, strings, are left empty in the middle register when a large brass section is very fully scored; they would not be audible in this register over the brass, in any case.)" "*Each musical element is given to a different family. This method has the advantage of bringing out each musical element clearly, differentiating it from the others by timbre." "*The third method is simply to literally double all the parts in each family. While occasionally suitable for short, vigorous passages, this method usually sounds heavy, and leads to a gray sound."
      
          **kind**: musicology
      
          **source**: https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf (p. 26)
      
          **usable**: Three tutti modes to select between, with priors: MODE A (default, most of the time) — every family plays the full harmony but with independently generated rhythm/figuration; MODE B (for clarity, e.g. when the melody must cut) — one family per musical element (melody / counter-line / harmony / bass); MODE C (short bursts only, ≤2 bars) — literal doubling of everything. A generative program that only ever does MODE C is exactly the 'gray' failure Belkin names.
    -     **claim**: Belkin's rule of thumb on unison doubling, and the distinction between loudness and 'volume' (thickness).
      
          **evidence**: "Koechlin makes a useful distinction between loudness and volume: By 'volume' he means the distinction between thick and thin sounds. For example, at any dynamic level, a horn will always sound thicker, or 'fatter', than a violin. Acoustically, thick sounds tend to have stronger fundamentals than thin sounds. ... As a rule, doubling at the unison adds much more volume ('thickness') than force. ... Since overuse of unison doubling is the beginner's most common fault in orchestration, a good elementary rule of thumb is: Do not double at the unison, unless there is a definite need for more volume, or unless the particular color is exactly what is needed for character." And: "Doubling at the octave creates greater transparency of color, and also fills the musical space in more interesting and varied ways."
      
          **kind**: musicology
      
          **source**: https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf (pp. 17, 20)
      
          **usable**: Two-parameter model the doubling engine should expose: THICKNESS is bought with unison doublings and with fundamental-heavy patches; TRANSPARENCY is bought with octave doublings. Default the engine to octave doubling; require an explicit reason flag (need-thickness OR need-this-specific-colour) before it emits a unison doubling. Encode 'fat' patch selection as strong-fundamental (sine/triangle-weighted) vs 'thin' as harmonic-rich.
    -     **claim**: Belkin gives a concrete non-octave doubling recipe from Bolero with exact intervals — a synthetic-timbre trick that is native to synthesis.
      
          **evidence**: "Ravel, Bolero, 3 bars after rehearsal # 8: The horn, playing mf, has the main line here, doubled by higher octaves in the celesta, while two piccolos double respectively at a twelfth and two octaves plus a major third higher. This is very similar to a common organ combination (the 'cornet'), which gives a rich, piercing sound."
      
          **kind**: musicology
      
          **source**: https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf (p. 20)
      
          **usable**: An additive-synthesis doubling preset, in semitones above the melody: 0 (horn-type, mf), +12 and +24 (bright bell-type), +19 (twelfth), +28 (two octaves + major third). These are harmonics 1, 2, 3, 4, 5 of the fundamental — the organ 'cornet'. A program with 20 voices can spend 5 on this and produce a timbre no single patch has. Warning: it tracks the melody in PARALLEL, so it only works over a melody, not over changing harmony.
    -     **claim**: Belkin on register progression and the number of instruments needed at the extremes — the extremes are cheap.
      
          **evidence**: "It is normal, however, for tutti passages to fill a wide range, with the bottom adding fullness and depth, and the top adding brilliance and power. It is important to note that the number of instruments required at the extremes is considerably smaller than in the middle. For example, even in a big tutti, one piccolo will penetrate without difficulty in its highest register." And: "Especially when working towards or away from climaxes, often it is effective to create progressions of register, either widening out from the middle in both directions, or else adding more and more high or low material."
      
          **kind**: musicology
      
          **source**: https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf (pp. 15-16)
      
          **usable**: Voice-budget allocation by register: spend ONE voice on the top octave and ONE or TWO on the bottom, and put the remaining voices in the middle where mass is actually needed. The perceived size of the orchestra comes from the SPAN, which costs 2-3 voices, not from the middle, which costs many. This is the highest-leverage fact for a 7-part program: 2 cheap voices at the extremes make 5 middle voices sound like an orchestra.
    -     **claim**: Basic acoustics fixes the ceiling on 'add more voices': doubling the number of incoherent sources yields +3 dB, and about 10x the sources is needed for a perceived doubling of loudness.
      
          **evidence**: "The increase of 3 dB is equivalent to a doubling of the sound source. If one trumpet player is at 0 dB, then two identical trumpet players together will register an increase of 3 dB." "A level increase of 10 dB should result in an impression of doubling the loudness. If we have 6 violins as the initial source, then we need 10 times the violins, or 60 violins to double the psychoacoustic volume." Practitioner corroboration from a sample-library forum: "12 cellos is not much louder than 6 (at a typical distance)."
      
          **kind**: measurement
      
          **source**: https://sengpielaudio.com/calculator-levelchange.htm ; https://vi-control.net/community/threads/volume-and-doubling-octaves-with-the-same-instrument.34407/
      
          **usable**: This is the mathematical licence for the whole project. Going from 5 to 90 players is +12.6 dB, i.e. roughly 2.4x perceived loudness — nothing like 18x. Therefore the difference between a small and a large ensemble is NOT level; it is spectral spread, register span, and decorrelation. A 7-part synth program is not handicapped on loudness at all; it must only buy span and decorrelation. Encode section size as detune/timing spread and register span, and set the level difference between 'small' and 'huge' at about 10-13 dB, no more.
    -     **claim**: Practitioner numbers for level compensation when octave-doubling the same sampled patch.
      
          **evidence**: "−3db would be a good starting point" when doubling at the octave with the same instrument. Also: "Each instrument has its different dynamic characteristics at different ranges. For example, adding an upper octave divisi could actually increase the perceivable loudness, not just remain it or lose it."
      
          **kind**: practitioner-own-words
      
          **source**: https://vi-control.net/community/threads/volume-and-doubling-octaves-with-the-same-instrument.34407/
      
          **usable**: When the doubling engine splits one part into two octaves using the SAME patch, drop each by 3 dB so the composite matches the undivided part. When adding an octave ON TOP of an existing part (not splitting it), expect a perceived loudness increase and pull back the melody bus accordingly.
    -     **claim**: Measured pitch scatter in a real unison ensemble: listeners tolerate a standard deviation of about 14 cents; live rehearsal scatter measures 10-15 cents.
      
          **evidence**: Ternström's synthesised-ensemble listening tests: "most listeners would tolerate a standard deviation in F0 of 14 cents, meaning that two-thirds of the ensemble would be within ±14 cents of each other. When asked for their preference, however, most listeners opted for a zero level of pitch scatter." And measured live: "standard deviation in fundamental frequency between section colleagues in live rehearsal was found to be between 0.10 and 0.15 semitones, or 0.6% and 0.9%."
      
          **kind**: measurement
      
          **source**: https://www.sciencedirect.com/science/article/abs/pii/S089219970580342X (Ternström, 'Perceptual evaluations of voice scatter in unison choir sounds'); summary via https://www.researchgate.net/publication/241133836_Choir_acoustics_-an_overview_of_scientific_research_published_to_date
      
          **usable**: Detune spread for a 'section' of synth voices: draw per-voice pitch offsets from a normal distribution with sigma ≈ 10-14 cents (NOT the 5-10 cents of a typical synth unison, and well under the 25-30 cents sometimes quoted). Note the finding cuts both ways — listeners TOLERATE 14 cents but PREFER 0, so scatter should be a section-size cue applied only where a section is meant, and dialled to 0 for a solo line. Caveat: I read the abstract and secondary summaries, not the full paper; the ±14 figure should be treated as reported-from-abstract.
    -     **claim**: The classic string-machine 'many players from one oscillator' mechanism is a specific, numbered topology: three BBD delay lines driven by two three-phase LFOs at 120-degree offsets.
      
          **evidence**: "The Solina features a triple BBD (bucket-brigade device) chorus, powered by two low-frequency oscillators." "A string synth's chorus unit typically uses three delay lines modulated at different rates and depths by independent LFOs, which differs significantly from standard single-delay-line chorus units." "To get the Solina sound you need two three-phase LFOs to modulate your delay time — three phase means three sinewave outputs each 120 degrees out of phase with each other" with "one phase from both LFOs controls one delay unit."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.soundonsound.com/sound-advice/q-how-do-re-create-sound-those-old-string-synths ; https://www.musicradar.com/how-to/synth-string-synth-choir ; https://www.kvraudio.com/forum/viewtopic.php?t=184869
      
          **usable**: Ensemble-widener spec, implementable in a few lines of DSP: 3 modulated delay lines; each delay's modulation = sum of one phase from LFO-A and one phase from LFO-B; the three taps take phases 0°, 120°, 240° from each LFO. Two LFOs at different rates (one slow, one faster) is what separates this from a plain chorus. This is the cheapest 'few voices → many players' transform available and it is period-correct for dungeon synth.
    -     **claim**: A working trailer/epic composer's actual layer architecture, with a track count and explicit register assignment.
      
          **evidence**: Chris Davey on the Ruby Gillman trailer: the track used "about 90 tracks" (his current templates run 120-200). On the climax: "The brass will play low octaves, and low mid-tenth chords, or triads. Then on top will be the theme on the french horns and trumpets playing in unison." On strings he stacks long sordino strings, "layer in Cinematic Studio Strings in the backend, and I use Metropolis Ark 1's low strings"; shorts are "Fluid Shorts from Performance Samples, CSS Spiccatos and the Cello patch from Spitfire Chamber Strings but tuned up an octave. When you tune them up they become crazy tight and playable." And: "It's hard to create space with so many instruments, but careful placement of chords and melody goes a long way."
      
          **kind**: practitioner-own-words
      
          **source**: https://richardpryn.com/chris-davey-on-writing-the-music-for-the-ruby-gillman-trailer/
      
          **usable**: A three-tier brass architecture the program can copy exactly with 4-5 voices: TIER 1 low octaves (root doubled at -12/-24); TIER 2 low-mid chords voiced as TENTHS or plain triads (note: tenth = 16 semitones, i.e. a third displaced by an octave — an open voicing, consistent with RK's wide-low rule); TIER 3 the theme at the top, horn-patch and trumpet-patch in UNISON (0 semitones, two different patches). Also note the pitch-shifting trick: transposing a low patch UP an octave tightens its transients — a real technique for making a synth or sampled short articulation read as faster/tighter.
    -     **claim**: Practitioner string-doubling schemes with explicit divisi split and voicing-by-register rule, from a sample-library composers' forum.
      
          **evidence**: "Double in several octaves for a really dramatic effect (e.g. Violins I high voice, Violas low voice, Violins II split 50-50% between them in unisons), great for culmination/climax." "Double the melody at an interval. E.g. - copy/paste from Violins I into Violins II and lower by a 3rd or a 6th." "A typical voicing in 4 part harmony could be: Basses, celli a fifth above, violas a third above, violins above that on the tonic." "Play open voicings in the lower ranges and close voicings, if you go higher up above c3 and c4." "If the melody is played very high (maybe c5-c6), make sure to fill the space between the melody and the bass relatively evenly with inner voices without big empty ranges." "I generally prefer to use as few voices or as little divisi as possible... Later on, if that's not enough, you can still use divisi to further thicken up the voicings."
      
          **kind**: folklore
      
          **source**: https://vi-control.net/community/threads/orchestration-for-strings-sections.92054/
      
          **usable**: Note the 50-50 split: when a melody is doubled in octaves by two sections, the THIRD section is divided in half and reinforces BOTH octaves in unison — a 4-voice pattern producing a 2-octave melody with both ends reinforced. Also the register threshold is named as a pitch: open voicings below roughly C3, close voicings above C3-C4. That is a concrete MIDI-note switch point (C3 = 48 or 60 depending on convention; treat as ~C3/C4 boundary, verify against your own note numbering). Corroborates RK's spacing law from independent modern practice.
    -     **claim**: Summoning — the reference band for synthetic epic dungeon synth — describe their method as layer-upon-layer keyboard construction, and their stated mixing goal is SEPARABILITY of simultaneous melodies, not density.
      
          **evidence**: Composition: Silenius composes the basic melodies on keyboard and together they build layer upon layer; once all keyboard structures are in place, Protector adds drums and guitar, then vocals, then samples. On mixing: "We did not use so much reverb this time and took more care to create a sound where the listeners can distinguish better between the different melodies playing at the same time." On guitars vs keys: "the guitars now sound more varied, due to the clearer sound and the deeper mixing that interferes less with the high keyboard melodies." Protector has said he has a large orchestral sample library and thinks a real orchestra would not change much about the final sound.
      
          **kind**: practitioner-own-words
      
          **source**: https://thkdblog.wordpress.com/2013/05/23/interview-summoning/ ; https://www.metal.de/interviews/summoning-interview-mit-silenius-und-protector-zu-old-morning-s-dawn-54328/ ; https://distortedsoundmag.com/interview-silenius-protector-summoning/
      
          **usable**: Two design constraints straight from the genre's own practitioners: (1) the guitar/rhythm bed must be mixed LOW in the spectrum so it does not collide with the high keyboard melodies — enforce a register split, keys above, guitar/drone below; (2) when two or more melodies run simultaneously they must be separable by timbre and register — which is exactly Belkin's 'differentiation between planes' rule. The band's own admission that a real orchestra 'would not change much' is the licence for the whole synthetic-orchestra premise.
    -     **claim**: Rimsky-Korsakov's rule for how a repeated or imitated phrase must be re-orchestrated — imitation follows register, and 'echo' requires a weaker but related timbre.
      
          **evidence**: "As regards choice of timbre, phrases in imitation are subject to the law of register. When a phrase is imitated in the upper register it should be given to an instrument of higher range and vice versa. If this rule is ignored an unnatural effect will be produced, as when the clarinet in its upper range replies to the oboe in the lower compass." "In echo phrases ... the second instrument should be weaker than the first, but the two should possess some sort of affinity. An echo given to muted brass following the same phrase not muted produces this distant effect. Muted trumpets are eminently suited to echo a theme in the oboes; flutes also may imitate clarinets and oboes successfully. A wood-wind instrument cannot be used to echo the strings, or vice versa, on account of the dissimilarity in timbre. Imitation in octaves (with a decrease in resonance) creates an effect resembling an echo."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt (Ch. IV, 'Repetition of phrases, imitation, echo')
      
          **usable**: For call-and-response, which dungeon synth uses constantly: the answering voice must be (a) in the correct direction of register — higher answer → brighter/higher patch; (b) quieter; (c) a filtered/muted variant of the SAME patch family, not a different family. And a free echo: repeat the phrase an octave up or down with reduced gain and a darker filter. Cross-family echo (strings answering winds) is explicitly ruled out.
    -     **claim**: THE CONSOLIDATED RULE SET: turning N independent lines into an orchestral texture by doubling, stated as numbers.
      
          **evidence**: Synthesised from the sources cited above; every number below traces to a quoted rule in one of the other findings (Rimsky-Korsakov unless noted).
      
          **kind**: musicology
      
          **source**: https://www.gutenberg.org/cache/epub/33900/pg33900.txt ; https://archive.org/details/atreatiseonmode00berlgoog ; https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf ; https://archive.org/stream/cu31924022381440/cu31924022381440_djvu.txt
      
          **usable**: STEP 0 — COMPOSE ONLY 4+1 LINES. Bass, Tenor, Alto, Soprano (the 4-part harmonic basis) plus one Melody. Everything else is derived. A 7-part program therefore has 2 spare parts; a 20-voice synth has 15 spare voices. Nothing above 5 needs a composer.
            
            STEP 1 — LAY OUT THE CHORD BY REGISTER, NOT BY VOICE COUNT. Adjacent-interval budget bottom-up: bottom zone 12 or 9 semitones; middle zone 7 or 5; top zone 4, 3 or 2. Hard constraint: interval(Bass, Tenor) ≤ 12. At forte no adjacent gap may exceed its zone budget; at piano hollow spacing is permitted.
            
            STEP 2 — DOUBLING PERMISSIONS. Soprano +12 OK. Alto +12 OK. Tenor +12 FORBIDDEN in open voicing. Bass −12 OK, +12 never, and the bass never voices into the upper group. Never double the bass of a first-inversion dominant into any upper part. Reject doublings that create parallel octaves between two original upper parts; ACCEPT parallel fifths created by doubling. Unisons produced by correct doubling are legal.
            
            STEP 3 — MELODY OCTAVE STACK, capped by intensity. 1 octave = normal. 2 octaves (3 voices, weighted 1 : 2 with the lower octave heavier) = forte/tense. 3 octaves = climax. 4 octaves = only with wind+brass support. 5 octaves = once per piece, strings must participate. Order the patches by their natural centre frequency, brightest on top, always; never invert that order.
            
            STEP 4 — UNISON vs OCTAVE. Default to OCTAVE doubling (transparency). Emit a UNISON doubling only when you need thickness or one specific colour. Berlioz's inversion: if the melody is NOT extremely high, a unison double beats an octave-below double. A dark patch placed an octave BELOW a bright melody is worse than nothing — reassign that voice to reinforce the bass at unison instead.
            
            STEP 5 — BLEND PARTNERS, by register tier, doubling only within tier. HIGH: bright-string + oboe-type + trumpet-type. MID: warm-string + clarinet-type + horn-type. LOW: low-string + bassoon-type + trombone/tuba-type. String+brass alone will not fuse — insert the wind member. To CHANGE colour add wind at 4 wind : 1 string; to merely THICKEN add 1 wind per 2 strings (the wind timbre disappears, only thickness remains).
            
            STEP 6 — FORTE BALANCE WEIGHTS (equal-part voicing). trumpet/trombone/tuba = 1.0; horn = 0.5; flute/oboe/clarinet/bassoon = 0.25; one full string department = 0.5 at p, 1.0 at f. At piano, set all wind weights EQUAL. In mixed brass, every horn part takes 2 voices, or +1 dynamic step if you cannot spare the voice. 4 horn-type voices alone make a complete balanced 4-part chord with NO bass octave doubling.
            
            STEP 7 — TIMBRE COUNT PER CHORD. Close voicing: max 2 distinct patches, canonical 3×A + 1×B. Open voicing: up to 4 distinct patches, and the penalty falls as the chord rises. An enclosed patch must have two DIFFERENT neighbours.
            
            STEP 8 — BACKGROUND SEPARATION. Pad/harmonic basis sits ≥12 semitones from the melody, at lower gain, in a different patch family (brass melody → wind pad; wind melody → horn pad).
            
            STEP 9 — SPEND VOICES AT THE EXTREMES FIRST. One voice on the top octave and one or two on the bottom buy the perceived SIZE; the middle needs the remaining mass. Never put a big brass block and a wind block in the same middle register — leave the winds out of that octave, they will not be heard.
            
            STEP 10 — BUILD AND RELEASE. Entry order strings → winds → brass; exit brass → winds → strings. Two-ramp crescendo: group A p→ff over the whole span, group B enters pp partway and reaches ff over a shorter span. As the outer voices diverge, spawn one new doubling per gap that exceeds its zone budget; on the way down kill doublings in reverse order but pin one stationary middle pedal. Any part re-entering after a long rest enters at pp or ff, never mf/mp; do not begin or end the piece at mf/mp.
            
            STEP 11 — TUTTI IS CHEAP. ≥3 of the 4 families sounding = tutti. Three correctly-spread parts qualify. Organise it as MODE A (all families full harmony, independent figuration — the default), MODE B (one family per musical element — for clarity), or MODE C (literal doubling of everything — ≤2 bars only; sustained MODE C is the 'gray' failure).
            
            STEP 12 — SECTION-SIZE CUES ARE SPECTRAL, NOT LEVEL. Doubling sources gives +3 dB; 10x sources for a perceived doubling of loudness. So the whole small-to-huge range is ~10-13 dB. Buy size instead with: per-voice detune drawn from sigma ≈ 10-14 cents (0 for solo lines), per-voice attack/timing jitter, and a triple-delay-line ensemble (3 taps, two 3-phase LFOs at 0/120/240°). When splitting one part into two octaves with the same patch, drop each by 3 dB.
            
            STEP 13 — ANTI-RULES. Do not pile bassoon/cello/bass patches onto a trombone bass theme (Strauss: 'perfectly useless') — give them a different figure or rest. Do not double at the unison by default. Do not let a low-centred patch sit above a high-centred one. Do not pan a doubling meant to sound like ONE thicker instrument (Berlioz: co-locate it). Do not run literal all-family doubling for more than a couple of bars.

**notFound**:   - NOT FOUND: any source stating the specific figure that an orchestra of ~90 players is 'three to five independent musical lines'. The nearest sourced statements are (a) Rimsky-Korsakov's FOUR as the harmonic norm ('In the very large majority of cases harmony is written in four parts'), and (b) Belkin's qualitative 'the number of instruments in such a grouping will inevitably exceed the number of (audibly distinguishable) real parts'. The '3-5' number appears in no primary source I could reach. Use 4 (+1 melody) as the sourced figure; treat '3-5' as unsupported.
    - NOT FOUND: a consolidated doubling chapter or loudness table in Cecil Forsyth's Orchestration (1914) comparable to Rimsky-Korsakov's. Forsyth's own index lists 'Doublings, 201, 224, 245-6, 269' — scattered instrument-by-instrument remarks, not a rule system. His book is organised as an instrument catalogue with history; the doubling content I could extract is the Strauss quotation and the 'a Wood-Wind solidifies a tune on the Strings' remark, both reported above. No numeric loudness equivalence table exists in it that I could locate.
    - NOT FOUND: any measurement of how many detuned synth voices are required before a listener perceives 'a section' rather than 'a chorused solo'. The Ternström work measures tolerated/preferred SCATTER in cents but not the count threshold. Patents on 'ensemble tone' describe the mechanism ('two or more tones whose fundamental frequencies differ by some small frequency difference') without a count. This is a genuine gap — the program will have to determine its own threshold empirically.
    - NOT FOUND: any statement by Summoning giving numbers — how many keyboard layers or tracks per song, which sample libraries by name, what octave relationships they use, or how many voices are stacked. Multiple interviews (Ave Noctum 2018, THKD 2013, Distorted Sound, Metal.de) describe the process only as 'layer upon layer'. The one concrete production fact I found — that the choirs on 'Farewell', 'Might and Glory' and 'Land of the Dead' are only two people plus reverb — appeared in an AI-generated encyclopedia summary and I could NOT trace it to a primary interview, so I am not recording it as a finding.
    - NOT FOUND: dB figures or measured results for the film-scoring practice of double-tracking an orchestral string section to make it sound larger. The technique is documented in general terms (Wikipedia, 'Double tracking') but I found no numbers — no timing-offset values, no level ratios, no player-count equivalence.
    - NOT FOUND: primary-source verification for the widely repeated 'Berlioz's ideal orchestra of 465 instruments and 360 voices'. I DID verify the two tables that are in the treatise: the 84-player 'finest concert orchestra' (21/20/18/8+7/10 strings etc.) and the imaginary festival orchestra (120 violins / 40 violas / 45 cellos / 18+15 basses / 16 horns / 30 harps / 30 pianofortes / 8 pairs of kettle-drums ...). The scanned text I used shows '80 Harps' at the list and '30 harps' in the following prose — an OCR error; 30 is the correct figure. I did not find Berlioz totalling the list himself, so '465' is unverified.
    - NOT FOUND (blocked, not absent): Open Music Theory's 'Core Principles of Orchestration' chapter (viva.pressbooks.pub) and orchestrasounds.com both returned HTTP 403; olipikettmusic.com failed DNS. A forum summary attributes to Oli Pikett the claim that an orchestration can comprise 'little more than 3 separate musical ideas spread across the orchestra, doubled as necessary' — I could not open the page to verify the wording, so it is recorded here as unverified rather than as a finding.
    - NOT FOUND: the exact Ternström paper text. I have the abstract-level figures (tolerated SD ≈ 14 cents; live-rehearsal SD 0.10-0.15 semitones) from ScienceDirect metadata and a ResearchGate overview; the full paper is paywalled. Treat the 14-cent figure as reported-from-abstract, not as a number I read in the results section.

**sources**:   - https://www.gutenberg.org/cache/epub/33900/pg33900.txt — Rimsky-Korsakov, Principles of Orchestration (full text, public domain). Primary source for the four-part/duplication law, the loudness table, spacing, timbre counts, brass allocation, crescendo entry order, economy of colour.
    - https://archive.org/details/atreatiseonmode00berlgoog — Berlioz, A Treatise on Modern Instrumentation and Orchestration (English translation, full scanned text). Primary source for unison-vs-octave-below violin doubling, divisi-within-section, the 84-player ideal orchestra table, and the festival-orchestra sonority/dynamic recipes.
    - https://archive.org/stream/cu31924022381440/cu31924022381440_djvu.txt — Cecil Forsyth, Orchestration (1914), full scanned text. Source of the Strauss 'perfectly useless' doubling quote and the 'Wood-Wind solidifies a tune on the Strings' remark.
    - https://noty-bratstvo.org/sites/default/files/instr-artistic-orch-a-belkin_0.pdf — Alan Belkin, Artistic Orchestration (2001). Source for the tutti definition, the three tutti organisations, planes of tone, unison-doubling rule of thumb, the Bolero cornet doubling, and register/extremes economics.
    - https://richardpryn.com/chris-davey-on-writing-the-music-for-the-ruby-gillman-trailer/ — Chris Davey interview. Working trailer composer's track count (~90) and three-tier brass architecture.
    - https://www.soundonsound.com/techniques/sampled-orchestra-part9 — Sound On Sound, The Sampled Orchestra Part 9. Concrete octave-doubling examples and the warning about over-use of parallel octaves.
    - https://vi-control.net/community/threads/orchestration-for-strings-sections.92054/ — practitioner string doubling/divisi schemes and the open-low/close-high register threshold.
    - https://vi-control.net/community/threads/volume-and-doubling-octaves-with-the-same-instrument.34407/ — the −3 dB octave-split compensation and the '12 cellos is not much louder than 6' observation.
    - https://sengpielaudio.com/calculator-levelchange.htm — level/loudness arithmetic: +3 dB per doubling of sources, ~10x sources for perceived doubling of loudness.
    - https://www.sciencedirect.com/science/article/abs/pii/S089219970580342X — Ternström, 'Perceptual evaluations of voice scatter in unison choir sounds' (abstract).
    - https://www.researchgate.net/publication/241133836_Choir_acoustics_-an_overview_of_scientific_research_published_to_date — Ternström, choir acoustics overview; source of the tolerated-14-cents and live-rehearsal-scatter figures as reported.
    - https://www.soundonsound.com/sound-advice/q-how-do-re-create-sound-those-old-string-synths — string-synth chorus topology (three delay lines, independent LFOs).
    - https://www.musicradar.com/how-to/synth-string-synth-choir — Solina ensemble recreation: two three-phase LFOs, 120° offsets, one phase from each per delay unit.
    - https://www.kvraudio.com/forum/viewtopic.php?t=184869 — Solina triple-BBD architecture details.
    - https://thkdblog.wordpress.com/2013/05/23/interview-summoning/ — Summoning on mixing for melodic separability and keyboard/guitar register separation.
    - https://www.metal.de/interviews/summoning-interview-mit-silenius-und-protector-zu-old-morning-s-dawn-54328/ — Summoning on layer-upon-layer keyboard composition order.
    - https://distortedsoundmag.com/interview-silenius-protector-summoning/ — Summoning interview (Protector on the orchestral sample library vs a real orchestra).
    - https://en.wikipedia.org/wiki/Double_tracking — definition of double tracking as the general mechanism for 'one performer sounding like more'.

---

## v2:8e496f9afb35020f70c03c1448ea36f102bb6a9612b7c7bfcbf68e191b67ff7a

**findings**:   -     **claim**: Rimsky-Korsakov states the escalation order outright, and the de-escalation as its exact reverse. VERIFIED verbatim in the Gutenberg text.
      
          **evidence**: "Prolonged orchestral crescendi are obtained by the gradual addition of other instruments in the following order: strings, wood-wind, brass. Diminuendo effects are accomplished by the elimination of the instruments in the reverse order (brass, wood-wind, strings)." Immediately preceding: "Short crescendi and diminuendi are generally produced by natural dynamic means; when prolonged, they are obtained by this method combined with other orchestral devices. After the strings, the brass is the group most facile in producing dynamic shades of expression, glorifying crescendo chords into the most brilliant sforzando climaxes. Clarinets specialise in diminuendo effects and are capable of decreasing their tone to a breath (morendo)."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Principles of Orchestration, Ch. IV, p. 112, 'Crescendo and diminuendo')
      
          **usable**: Hard-code the ladder as an ordered list: STRINGS -> WOODWIND -> BRASS for any build, and pop the stack in reverse (BRASS -> WOODWIND -> STRINGS) for any decay. Two separate curve types: 'short' = pure gain automation on the voices already sounding; 'prolonged' = gain automation PLUS voice-count increase. A build shorter than ~8 bars should only move gain; anything longer must add voices. Give the brass patch the steepest gain slope near the top (it 'glorifies crescendo chords'); give the clarinet-like patch the longest, quietest decay tail (morendo to silence).
    -     **claim**: Rimsky-Korsakov's 'economy in orchestral colour' argument: the full orchestra cannot be sustained, and he gives an explicit priority ranking of groups.
      
          **evidence**: "Neither musical feeling nor the ear itself can stand, for long, the full resources of the orchestra combined together. The favourite group of instruments is the strings, then follow in order the wood-wind, brass, kettle-drums, harps, pizzicato effects, and lastly the percussion, also, in point of order, triangle, cymbals, big drum, side drum, tambourine, gong. Further removed stand the celesta, glockenspiel and xylophone, which instruments, though melodic, are too characteristic in timbre to be employed over frequently."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. IV, p. 118, 'Economy in orchestral colour')
      
          **usable**: A budget rule with a literal weight ordering. Assign each of the ~20 synth voices a tier: tier 0 strings, 1 woodwind, 2 brass, 3 timpani, 4 harp, 5 pizz, 6 percussion (sub-order triangle, cymbal, bass drum, side drum, tambourine, gong), 7 celesta/glock/xylo. Enforce a duty-cycle cap: tutti (all tiers on) may occupy no more than a small fraction of total runtime; higher-tier voices get progressively lower maximum on-time. For a dungeon-synth piece this also says the bell/glockenspiel colour that the genre loves must be rationed, not run continuously.
    -     **claim**: Rimsky-Korsakov's reappearance rule, with an explicit prohibition on mid-dynamics for re-entries and for beginnings/endings.
      
          **evidence**: "A group of instruments which has been silent for some time gains fresh interest upon its reappearance. The trombones, trumpets and tuba are occasionally tacet for long periods, the percussion is seldom employed, and practically never all together, but in single instruments or in two's and three's. [...] After a long rest the re-entry of the horns, trombones and tuba should coincide with some characteristic intensity of tone, either pp or ff; piano and forte re-entries are less successful, while re-introducing these instruments mezzo-forte or mezzo-piano produces a colourless and common-place effect. This remark is capable of wider application. For the same reasons it is not good to commence or finish any piece of music either mf or mp."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. IV, p. 118)
      
          **usable**: Three hard constraints a generator can assert: (1) track rest-length per voice; a voice returning after a long tacet must enter at pp or ff, never mf/mp — quantise the re-entry velocity to the extremes; (2) never let percussion all sound at once — cap simultaneous percussion voices at 2 or 3; (3) the first and last events of the whole piece must be pp/ppp or ff/fff, never mid-dynamic. Also: deliberately schedule long silences for the brass voices so their return has value — silence is a compositional resource with a measurable payoff.
    -     **claim**: Rimsky-Korsakov's 'amplification of tone qualities' gives a two-group crescendo mechanism with different slopes per group.
      
          **evidence**: "The operation which consists in contrasting the resonance of two different groups (or the different timbres of one and the same group), either in sustained notes or chords, transforms a simple into a complex timbre, suddenly, or by degrees. It is used in establishing a crescendo. While the first group effects the crescendo gradually, the second group enters piano or pianissimo, and attains its crescendo more rapidly. The whole process is thereby rendered more tense as the timbre changes. The converse operation—the transition from a complex to a simple timbre, by the suppression of one of the groups, belongs essentially to the diminuendo."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. IV, p. 109-110)
      
          **usable**: Directly implementable envelope maths: group A gets a long shallow gain ramp over the whole build; group B enters late at pp and gets a short steep ramp that catches up. Two different envelope curve exponents on two voice groups. This produces a timbral morph (simple -> complex) on top of the loudness rise, which is what actually makes a synth crescendo read as an orchestral one rather than a fader push.
    -     **claim**: Rimsky-Korsakov enumerates exactly five operations for re-scoring the same material — a ready-made variation API.
      
          **evidence**: "The best means of orchestrating the same musical idea in various ways is by the adaptation of the musical matter. This can be done by the following operations: a) complete or partial transference into other octaves; b) repetition in a different key; c) extension of the whole range by the addition of octaves to the upper and lower parts; d) alteration of details (the most frequent method); e) variation of the general dynamic scheme, e.g. repeating a phrase piano, which has already been played forte."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. IV, p. 100)
      
          **usable**: Five named transform functions to apply to a theme on each restatement: octave_transpose(part_subset), key_transpose(), add_octave_doublings(top, bottom), vary_details(), invert_dynamic(). Tag operation (d) as the default/most frequent. A ~7-part piece can cycle its theme through these to get 5+ distinct 'orchestrations' from one melody without new material.
    -     **claim**: Rimsky-Korsakov's doubling table for melody: which timbres pair naturally, and what each pairing buys.
      
          **evidence**: "The best and most natural combinations are between instruments whose registers correspond the nearest: Vns + Fl. (Bass fl., picc.), Vns + Ob., Vns + Cl. (small Cl.); Violas + Ob. (Eng. horn), Violas + Cl., Violas + Fag.; 'Cellos + Cl. (Bass cl.), 'Cellos + Fag.; D. basses + Bass cl., D. basses + Fag.; D. basses + C-fag. The object of these combinations is: a) to obtain a new timbre of definite colour; b) to strengthen the resonance of the strings; c) to soften the quality of the wood-wind." Also: "If several wind instruments play in unison with one group of strings, the latter will be overpowered."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. III, p. 58-59, 'Doubling in unison')
      
          **usable**: A lookup table of legal unison pairings keyed by register, so a generator adding a doubling voice picks a partner in the same octave band rather than at random. And a mix rule with a number in it: one wind on one string group = blend; several winds on one string group = the strings are lost. In synth terms, cap the wind-layer count per string layer at 1 unless you intend the string layer to disappear.
    -     **claim**: Rimsky-Korsakov defines 'full tutti' as all three melodic groups and warns it is essentially a loud-only device.
      
          **evidence**: "I call full tutti the combination of all melodic groups, strings, wind, and brass. By partial tutti I mean passages in which the brass group only takes part [...] the student is reminded that the tutti is used essentially in forte and fortissimo, rarely in pianissimo and piano passages." And on register limits: "It is seldom that the entire orchestral conception is centred in the upper register of the orchestra (the 5th and 6th octaves), still more rarely is it focussed wholly in the lowest range (octaves 1 and -1) where the proximity of harmonic intervals creates a bad effect. [...] The first method gives brilliant colour, the second combination is dark and gloomy."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. IV, p. 101-102 and p. 106-107)
      
          **usable**: Two states worth naming in the program: PARTIAL_TUTTI = brass-only stack (2 horns, or 2 horns + 3 trombones, etc.) and FULL_TUTTI = all three groups. Gate FULL_TUTTI to f/ff only. The register warning is the dungeon-synth key: a texture centred in octaves 1 and -1 is explicitly 'dark and gloomy' — that is the genre's home register, and R-K says it makes close intervals sound bad, so voice the low stack in open fifths/octaves, not thirds.
    -     **claim**: Doug Adams' official annotated score gives the Pelennor Fields escalation as an ordered stage list. Full sequence, in order.
      
          **evidence**: "French horns ceremoniously recite the Rohan theme over the perpetual churn of militaristic percussion. [...] Evil Times takes the music [...] Nature's Reclamation begins a slow build through its first melodic phrase. [...] The orchestra is invigorated, Nature's melody leaping up into heraldic trumpets and high strings. [...] The Hardanger steps to the fore to sing a doxology for Rohan over the orchestra's thunder. Trumpets take the theme, embracing the Hardanger's dedication. [...] Brass fanfares in gleaming triplets erupt over the charge. The armies collide, not with a wincing dissonance, but with rich major-moded sonorities."
      
          **kind**: musicology
      
          **source**: https://www.tolkiendil.com/_media/divertissements/adaptations/films/sda_3_livret_de_presentation_de_la_bo_en_anglais_.pdf (The Return of the King: The Annotated Score, Disc Three, track 4)
      
          **usable**: Eight discrete states to sequence: (1) horn-choir melody over a percussion ostinato that never stops; (2) harmonic re-colouring of the same material (Evil Times); (3) a NEW theme entering quietly and building; (4) that theme jumping register into trumpet + high strings — the melody LEAPS UP an octave-plus rather than just getting louder; (5) a solo folk voice placed ON TOP of full tutti (the inversion that makes the moment); (6) trumpets take the solo's line — the solo hands off to the section; (7) triplet fanfare figures as a rhythmic-density layer, not a new melody; (8) the collision resolved into MAJOR mode. Note stages 4, 6 and 8 are the three cheap ones for a synth: octave leap, timbre handoff, modal flip.
    -     **claim**: MEASURED: that entire eight-stage Pelennor escalation occupies a single cue of 4 minutes 10 seconds.
      
          **evidence**: 'The Battle of the Pelennor Fields', Disc 3 track 4 of The Return of the King: The Complete Recordings — length 4:10 (250 seconds). Derived: ~250 s / 8 named stages = ~31 seconds per stage.
      
          **kind**: measurement
      
          **source**: MusicBrainz release e7fe61ca-65b8-4abb-8723-1e7c1a5e0a49 (https://musicbrainz.org/ws/2/release/e7fe61ca-65b8-4abb-8723-1e7c1a5e0a49?inc=recordings&fmt=json); Adams' section numbering in the ROTK Annotated Score corresponds to the CD tracks
      
          **usable**: THE ANSWER TO THE CRITICAL QUESTION, at the top end: a full model escalation is ~4 minutes, not 8 bars and not 15 minutes. At 90 BPM in 4/4, 250 s = ~94 bars. So budget roughly 90-100 bars for a complete horn-to-tutti Shore-style escalation, and change the orchestration state about every 30 seconds (~12 bars at 90 BPM). The per-stage figure of ~31 s is arithmetic on Adams' stage count, not a published measurement — treat it as an order of magnitude, not gospel.
    -     **claim**: Adams names the Ents' flooding of Isengard as the score's most extended crescendo, and describes its mechanism.
      
          **evidence**: "Percussion resumes a martial stride and the Ents are unleashed. Orchestra and chorus swell, developing passages of the Nature theme, and rising across the score's most extended crescendo. As the melodic line endlessly climbs, effervescent arpeggiated figures flow through accompanying lines and the Ents burst the dam. [...] Brass chatters in rhythmic fanfares declaring that, despite its sedentary and graceful formality, Nature is capable of such force that even Saruman cannot stand against It."
      
          **kind**: musicology
      
          **source**: https://www.henneth-annun.ru/multimedia/ttt_annotated_score.pdf (The Two Towers: The Annotated Score, Disc Three, section 12)
      
          **usable**: Mechanism, not adjectives: the crescendo is carried by (a) a melodic line that keeps climbing without resolving — implement as a stepwise-rising sequence with no cadence, (b) arpeggiated figuration in the accompanying voices increasing in density, (c) percussion establishing a march stride FIRST, (d) brass entering last as rhythmic 'chatter' (repeated-note fanfares), not as sustained chords. That is four independently automatable parameters: melodic ceiling, arpeggio rate, percussion presence, brass articulation density.
    -     **claim**: The containing cue for that 'most extended crescendo' is 5 minutes 47 seconds — but Adams gives no duration for the crescendo itself.
      
          **evidence**: 'Théoden Rides Forth', Disc 3 track 12 of The Two Towers: The Complete Recordings — 5:47 (347 seconds). Adams places the Ents/flood crescendo inside this cue, after the Gandalf/Éomer charge and before section 13 ('The Tales That Really Matter'). He adds: "After the near appearance of the Seduction of the Ring theme, this composition is dissolved out of the film, leaving the final 35 seconds unheard."
      
          **kind**: measurement
      
          **source**: MusicBrainz release 61643390-71fe-46dd-b509-fb77128978f9; Adams, TTT Annotated Score section 12
      
          **usable**: Upper bound only: the score's single longest crescendo fits inside a cue under 6 minutes. Combined with the Pelennor figure, this brackets 'longest orchestral escalation in this idiom' at roughly 3-6 minutes, i.e. one long track, not a whole album side. A program should treat ~5 minutes as the ceiling for a single unbroken build.
    -     **claim**: MEASURED FROM THE SCORE: Shore's Prologue escalates from pp to fff over 62 bars, and the brass colour is completed LAST — trumpets are held out until bar 53 of 62.
      
          **evidence**: From the bar-numbered short-score transcription of the FOTR Complete Recordings. Entry order with bar numbers, tempi and dynamics: b.1 pp q=50 female chorus + strings; b.5 bassoon; b.10 q=55 violin, p / mp espress.; b.13 harp, accel.; b.18 q=72 marked 'poco a poco cresc. e accel.', p, violas + cellos + bassoon; b.20 q=76 mf, timpani; b.23 q=90 violin f; b.29 q=112 f; b.30 sudden drop to p; b.31-32 q=124 mf, strings + snare drum, horns; b.37 meter changes to cut time, half-note=88, f, horns + percussion ostinato; b.39 cresc.; b.41 ff full choir; b.45 violins; b.53 '+Trp.'; b.62 fff.
      
          **kind**: measurement
      
          **source**: https://alcaeru.weebly.com/uploads/7/8/6/0/786082/fotr_complete_transcription.pdf pages 1-4 (bars 1-62); cue 'Prologue: One Ring to Rule Them All', 7:16, MusicBrainz release 72913ca7-2dab-49b0-afa4-68c7b95718c5. Unofficial fan transcription — bar numbers, tempi and dynamics are as notated there, verified by reading the rendered pages.
      
          **usable**: This is Rimsky's ladder executed literally, with numbers: strings at bar 1, woodwind at bar 5, harp 13, timpani 20, percussion+horns ~32-37, trumpets 53. Trumpets arrive 85% of the way through the build. Rule for the program: reserve the brightest brass voice until the final ~15% of any escalation. Second, the crescendo is ALSO an accelerando — tempo runs 50 -> 55 -> 72 -> 76 -> 90 -> 112 -> 124 -> 176 (half=88) across those 62 bars, a 3.5x speed-up, with 'poco a poco cresc. e accel.' written in. Third, it is NOT monotonic: there is a hard drop back to p at bar 30 right after the f peak at bar 29, before the biggest rise. Encode a mandatory dynamic reset immediately before the final ascent.
    -     **claim**: MEASURED: the closing segment of that Prologue build — horns+percussion at f up to the fff arrival — is 25 bars = 34 seconds exactly.
      
          **evidence**: Bars 37-62 are in cut time with the tempo marked half-note = 88. 25 bars x 2 half-note beats / (88 per minute) = 34.1 seconds. Both the meter and the tempo are explicitly notated, so this figure is not an estimate.
      
          **kind**: measurement
      
          **source**: https://alcaeru.weebly.com/uploads/7/8/6/0/786082/fotr_complete_transcription.pdf page 3 (bars 37-53), page 4 (bar 62)
      
          **usable**: A concrete, trustworthy unit: the final push from 'brass in, forte' to 'fortissimo peak' is about half a minute / 25 bars. If your generative piece runs at 88 BPM in 4/4, that is roughly 12 bars. Use ~30 seconds as the length of the last rung of the ladder; use the earlier, slower rungs to spend the other 2 minutes.
    -     **claim**: MEASURED: the Fellowship theme's first fully-formed statement is assembled over 43 bars, from one solo horn at p to ff tutti with cymbals, adding one timbre roughly every 5-7 bars.
      
          **evidence**: From the transcription, cue 'The Great Eye': b.1976 solo Horn, p, quarter=72, meters 3/4-2/4; b.1982 cor anglais; b.1984 strings + timpani, meter becomes 4/4, hairpins begin; b.1989 '+Hn.' (horns added); b.1994 f, then choir enters humming at p with hairpins; b.2001 quarter=80, clarinet mf, then violin + whistle at f; b.2011-2013 sustained crescendo hairpin; b.2016 rit.; b.2018 ff with cymbals, on Elrond's line 'You shall be the Fellowship of the Ring!'. Total 1976 -> 2018 = 43 bars. Computed duration from the notated tempi and meters: ~90 beats at quarter=72 (75 s) + ~72 beats at quarter=80 (54 s) = ~129 seconds, plus the rit., so roughly 2:10-2:20. Cross-check: the whole cue is 5:30 and spans bars 1912-2018, so this 43-bar span is the final ~40% of the track — consistent.
      
          **kind**: measurement
      
          **source**: https://alcaeru.weebly.com/uploads/7/8/6/0/786082/fotr_complete_transcription.pdf pages 83-84 (bars 1974-2018); track length 5:30 from MusicBrainz release 72913ca7-2dab-49b0-afa4-68c7b95718c5
      
          **usable**: THE ANSWER AT THE SMALL END, and the best template for a ~7-part, ~20-voice program: 43 bars, ~2 minutes, 7 additive stages, one new timbre every 5-7 bars. Ladder: solo horn -> +double reed -> +strings +timpani -> +more horns -> +choir (entering at p, not loud) -> +clarinet, +violin, +solo whistle -> ff tutti + cymbal. Note two transferable tricks: the choir enters QUIETLY inside an already-forte texture, and the tempo nudges up only slightly (72 -> 80, i.e. +11%), unlike the Prologue's 3.5x. Also the arrival is marked by a single cymbal crash and a ritardando — the escalation ends by slowing down.
    -     **claim**: Shore, in his own words, gives a countable voice number for the Fellowship theme's re-orchestration as the group grows.
      
          **evidence**: Shore: "The Fellowship theme is a little fuller now. It's the first time you've heard it filled out, but it's still pretty slow. It's not completely assembled, but it's getting closer because now Strider has joined them. The orchestration is fuller—you hear a little more of the brass. In earlier sections with Frodo and Sam you heard one French horn playing. Now there are three."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf (The Fellowship of the Ring: The Annotated Score, Disc One, section 14 'The Nazgûl')
      
          **usable**: An actual integer for the escalation: 1 horn -> 3 horns. For a synth orchestra this is unison-voice count on the same patch, which is exactly what an oscillator bank does cheaply. Map narrative weight to unison count: 1, 3, 6 (see the six-horn finding below). Detune/spread the 3 slightly; do not just raise the gain of one.
    -     **claim**: The Fellowship theme's per-appearance re-orchestration chain is documented end to end across the three annotated scores, from solo horn over a string pedal to religioso full chorus and orchestra.
      
          **evidence**: (a) FOTR: "Cor anglais and French horn announce a brave, but humble take on the material." (b) FOTR: "When Gandalf rides we hear a dark take on the Fellowship theme". (c) FOTR: one horn -> three horns (above). (d) FOTR: "Concluding this piece, the Fellowship theme appears in its first fully formed statement. In a crescendo of brass and cymbals... 'That's the first time you hear it in its full orchestration,' smiles the composer." (e) FOTR Moria: "the Fellowship theme rips through the orchestra in one of the most thrillingly heroic statements in the entire score... in a fluid 3/4 time, directly opposing the Orcs' rocky 5/4. Eventually the meters battle each other for dominance, overlapping in dense polyrhythmic shapes clamoring through a furious crescendo." (f) TTT: "A dejected setting of the Fellowship theme plays out in a solo horn above a string pedal, and the score takes an unshakably dark, elegiac turn." (g) FOTR: "a deflated Fellowship theme meets the group's uncertainty with subdued tones"; later "one last muscular statement of the Fellowship theme, still weakened, still partial, but undefeated." (h) ROTK: "A driving trumpet reading of Fellowship greets them". (i) ROTK: "As it never has before, and never will again, the Fellowship theme sounds in religioso full chorus and orchestra."
      
          **kind**: musicology
      
          **source**: https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf ; https://www.henneth-annun.ru/multimedia/ttt_annotated_score.pdf ; https://www.tolkiendil.com/_media/divertissements/adaptations/films/sda_3_livret_de_presentation_de_la_bo_en_anglais_.pdf ('For Frodo', Disc Three track 16)
      
          **usable**: A concrete orchestration ladder for ONE theme, reusable across a whole generative piece: (1) cor anglais + 1 horn, quiet; (2) same theme, dark harmonisation, solo; (3) 3 horns, more brass; (4) full orchestration, brass + cymbal crescendo; (5) brass-heroic, set in 3/4 against a hostile 5/4 ostinato — a METRIC conflict, not a loudness one; (6) solo horn over a sustained string pedal (the 'deflated' setting — cheapest possible synth version: one lead voice + one drone); (7) trumpet-led, driving; (8) full chorus + orchestra, chorale/religioso texture. Eight states, each realisable with 2-20 voices. Note that the chain's low points (states 1, 6) are two-voice textures — a dungeon-synth program can live in those and visit the tutti rarely.
    -     **claim**: The tutti climax of the whole trilogy — the religioso full chorus and orchestra statement — occupies a cue of 3 minutes 16 seconds.
      
          **evidence**: 'For Frodo', Disc 3 track 16 of The Return of the King: The Complete Recordings — 3:16.
      
          **kind**: measurement
      
          **source**: MusicBrainz release e7fe61ca-65b8-4abb-8723-1e7c1a5e0a49
      
          **usable**: The maximal-forces state is not a sustained condition; it is a ~3 minute cue, and Adams flags it as unique in the trilogy ('As it never has before, and never will again'). For a program: allow the true tutti to happen ONCE, for about 3 minutes, and never repeat it. That is Rimsky's economy rule with a duration attached.
    -     **claim**: Countable unison doublings named in the annotated scores.
      
          **evidence**: "Six French horns bellow the History/Evil of the Ring hybrid, calling out the moment of decision." (ROTK, Mount Doom). "Alto flute creates a smoky air of mystery while a rubbed tam-tam and eight timpani (two players) spike the impending danger" (FOTR, Bag End). "Four alto flutes ascend in their clement, airy tones" (TTT, 'The Grace of the Valar'). "violins begin to divide into eight-part clusters, chorus and brass clotting beneath them" (ROTK, Minas Morgul). "The monochord used for this recording had 50 strings strung across the bridge."
      
          **kind**: musicology
      
          **source**: https://www.tolkiendil.com/_media/divertissements/adaptations/films/sda_3_livret_de_presentation_de_la_bo_en_anglais_.pdf ; https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf ; https://www.henneth-annun.ru/multimedia/ttt_annotated_score.pdf
      
          **usable**: Concrete voice budgets for peak moments that a 20-voice synth can actually hit: 6 unison horn voices for a doom statement; 4 unison alto-flute-like voices for an ethereal one; 8-part divisi cluster from a single string patch (start all 8 on one pitch, fan them out). 8 timpani = 8 tuned low percussion pitches, not one. These are the few places where the real score's numbers are small enough to reproduce exactly.
    -     **claim**: The LPO concertmaster describes the 'Howard Divisi' — a named, mechanical cluster-expansion technique.
      
          **evidence**: Pieter Schoeman: "Howard would write the most complex divisis. He creates a cluster of sound where all the violins start on the same note and then start dividing, spreading into a chord and finally forming a cluster so thick you would need a chainsaw to cut through it. The Concertmaster has to organize this kind of divisi in such a way that you have an equal numbers of violins on each note as the chord spreads. I finally worked out a certain method, which we ended up using systematically since we needed it quite often. We still affectionately refer to this technique as the 'Howard Divisi.'"
      
          **kind**: practitioner-own-words
      
          **source**: https://www.henneth-annun.ru/multimedia/ttt_annotated_score.pdf (TTT Annotated Score, Performers section) — same text appears in the ROTK booklet
      
          **usable**: An algorithm, stated by the man who had to execute it: N voices begin in unison on one pitch, then divide outward into a chord and then a cluster, with EQUAL numbers of voices per pitch as the chord spreads. For a synth: take 8 detuned copies of a string patch, all on one note, and over M bars split them 8/0 -> 4/4 -> 2/2/2/2 -> 1/1/1/1/1/1/1/1 across an expanding pitch set. This is the single most translatable orchestral escalation device in this whole body of research — it needs no players at all, only voice allocation, and it produces the dark-massing effect dungeon synth wants.
    -     **claim**: Cues are composed and recorded in 4-5 minute units, and the escalation is literally built by adding and subtracting whole sections in the session.
      
          **evidence**: Stewart McIlwham, LPO Principal Piccolo: "We would record at a four or five minute piece, then they would listen to it with the movie. Sometimes we would spend the rest of the session subtly refining just this one cue. Howard would change the orchestration, adding a different instrument here, sometimes removing a whole violin section there." Also: "in the three films, plus the extra DVD music you are getting close to 200 three-hour sessions."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.henneth-annun.ru/multimedia/ttt_annotated_score.pdf (TTT Annotated Score, Performers section)
      
          **usable**: Confirms the unit of composition is a 4-5 minute cue — the same scale as the measured Pelennor (4:10) and Ents (5:47) cues. Set the program's section length to 4-5 minutes for a full-arc piece. And 'adding a different instrument here, removing a whole violin section there' is exactly the add/remove-voice operation the generator should expose as its primary escalation control.
    -     **claim**: Shore's own statement of his forces, and the published core numbers.
      
          **evidence**: Shore: "Certain sections just felt right for chorus—it was part of the palette. I had a 100-piece orchestra and 100 singers." Wikipedia: "Shore's orchestration called for an immense ensemble: a core 96-piece orchestra and 100-piece choir, as well as additional instruments for select sections of the score, onstage instrumental 'bands' and additional choirs: overall, over 330 players." and "the score was primarily played by the London Philharmonic Orchestra, ranging from 93 to 120 players throughout the recording."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf (Shore quote, section 11 'Saruman the White'); https://en.wikipedia.org/wiki/Music_of_The_Lord_of_the_Rings_film_series
      
          **usable**: Sets the compression ratio you are working at: ~100 orchestral players + ~100 singers must become ~20 synth voices, i.e. roughly 10:1. That means each synth voice stands for a SECTION, not a player — so the escalation unit is 'section on/off', which is precisely what Rimsky's ladder and the LPO piccolo player's description both operate on. It also means unison-count effects (1 horn vs 3 vs 6) must be simulated with detune/spread on a single voice, not with 6 real voices.
    -     **claim**: The published section-by-section orchestration Shore wrote for, with numbers — useful as the target the synth voices map onto.
      
          **evidence**: "3 flutes (1st and 2nd doubling on alto flutes, 2nd doubling on piccolo, 3rd doubling on piccolo and optionally on Irish whistle, alto flute & pan flute), 3 oboes (3rd doubling on English horn), 3 clarinets (3rd doubling on bass clarinet), 3 bassoons (3rd doubling on double bassoon)"; "5 horns in F, 4 trumpets in B-flat (doubling on rotary valve), 3 trombones, tuba"; "(minimum 4 players): timpani, chimes, medium and large tamtams, 5 suspended gongs (6", 8", 10", 12", 14"), suspended cymbals: large and antique, piatti, 2 metal bell plates (14", 1" thick), distressed piano, snare drum, field (or side) drum, 2 bodhráns, Japanese taiko drums: small, medium and large, bass drum, 2 log drums, bass marimba, rattle"; "2 harps, violins I and II, violas, violoncellos, double basses".
      
          **kind**: musicology
      
          **source**: https://en-academic.com/dic.nsf/enwiki/1527515 (mirror of an earlier revision of the Wikipedia article 'Music of The Lord of the Rings film trilogy'). Note: other sources give the trumpets as 'in C, F, B-flat and with rotary valves' — the pitch spec is inconsistent across sources; the COUNTS (3/3/3/3, 5 horns, 4 trumpets, 3 trombones, 1 tuba, 2 harps, min 4 percussionists) are consistent.
      
          **usable**: A direct allocation map for ~20 synth voices: 4 woodwind voices (flute-ish, reed-ish, clarinet-ish, bassoon-ish), 4 brass (horn x2 as separate unison-count tiers, trumpet, trombone/tuba low brass), 5 string (vln I, vln II, vla, vlc, cb), 2 harp/plucked, 4-5 percussion (timpani, taiko/bass drum, gong/tam-tam, bell plate/chime, log drum/bass marimba). That is 19-20 voices and it covers every entry named in the Pelennor and Prologue ladders. The percussion list is also a shopping list of dark-metal-friendly timbres: gongs, tam-tams, bell plates, taiko, distressed piano, log drums, bass marimba.
    -     **claim**: Adams describes the beacon-lighting escalation with a stage order that puts machine-like churn first and brass last.
      
          **evidence**: "The orchestra tautens, and one of The Lord of the Rings' signature musical moments begins. Machine-like, woodwinds and strings churn, beginning the machinations of Gondor's salvation. Weakness and Redemption braces the low brass, underpinning constantly modulating chords in the French horns and trumpets. With a lattice of rising figures, the brass steels upwards, emerging in a powerful, magniloquent statement of the Gondor theme." Later in the same cue: "Middle-earth's cavalry sets out to battle Sauron's industry to the tones of Nature's Reclamation... The theme begins a steady build, rising unfettered through the orchestra's registers."
      
          **kind**: musicology
      
          **source**: https://www.tolkiendil.com/_media/divertissements/adaptations/films/sda_3_livret_de_presentation_de_la_bo_en_anglais_.pdf (ROTK Annotated Score, Disc One section 15, 'The Lighting of the Beacons', cue length 9:03)
      
          **usable**: Four stages, all cheap in a synth: (1) a mechanical repeating figure in woodwind + strings — an ostinato, not a melody; (2) a low-brass pedal/anchor motif under (3) constantly MODULATING chords in horns and trumpets — the escalation here is harmonic motion, not added voices; (4) 'a lattice of rising figures' — stacked sequences climbing in register — resolving into the theme in full. Key transferable idea: stage 3 escalates by changing key every phrase while the voice count stays constant. That is free tension for a program with a fixed voice budget.
    -     **claim**: MEASURED CANONICAL BENCHMARK: Ravel's Boléro is a single 340-bar crescendo made of 18 successive re-orchestrations of one theme, a new orchestration every 18 bars, with strings withheld from the melody until bar 219.
      
          **evidence**: Bar-by-bar roadmap: "4 measure intro, then each pass at the melody is a 2 measure bridge plus 16 measures of melody for a total of 18 measures between rehearsal numbers." Melody carriers by measure: m.5 1st Flute; m.21 1st Clarinet; m.39 1st Bassoon; m.57 E-flat clarinet; m.75 Oboe d'amore; m.93 1st Flute + 1st Trumpet con sord.; m.111 Tenor saxophone; m.129 Sopranino/Soprano saxophone; m.147 1st Horn + 2 Piccolos + Celesta; m.165 1st Oboe + Oboe d'amore + Cor anglais + 1st/2nd Clarinets; m.183 1st Trombone; m.201 all woodwind except bassoons + tenor sax; m.219 Flutes, Oboes, Clarinets, Piccolo + 1st Violins (arco); m.237 same plus Cor anglais, Tenor sax, 2nd Violins; m.255 + Violas, Bass clarinet; m.273 + Cellos, Sopranino sax, 1st Trombone; m.291 Flutes/Piccolo/Trumpets 1-3/Piccolo trumpet/saxes/1st Violins; m.309 same plus 1st Trombone on the theme; m.327 key change; m.340 End. Musicology corroborates: "a set of 18 variations on an original two-part theme—or perhaps, more properly speaking, 18 orchestrations of that theme, for the theme itself does not change, though the instruments do" and "an opening rhythm on the snare drum (a rhythm that continues unabated throughout the work)"; "the seventeen-minute composition" consisting of "one long, very gradual crescendo".
      
          **kind**: measurement
      
          **source**: https://www.dogandtuba.com/Tuba/Bolero_Roadmap.pdf (rehearsal/measure/instrumentation table); https://www.britannica.com/topic/Bolero-by-Ravel ; https://mtosmt.org/issues/mto.20.26.2/mto.20.26.2.bhogal.html
      
          **usable**: THE BEST DIRECT ANSWER TO 'HOW LONG DOES AN ESCALATION TAKE', because every number is published. 340 bars / ~17 minutes / 18 stages = a new orchestration roughly every 18 bars and every ~54 seconds. Strings do not touch the melody until m.219 — 64% of the way in. The trombone solo (m.183) is the 11th of 18 stages. The single key change is 13 bars from the end. For a generative piece: pick one ostinato that NEVER stops (Ravel's snare rhythm), one theme that never changes, and 18 orchestration presets; advance one preset every 18 bars; hold the string/lead voices out until stage 12; flip key once, near the very end. That is a complete, provably-effective escalation algorithm that costs almost nothing to implement and survives translation to synth voices perfectly, since the theme and rhythm are constant and only the voice assignment changes.
    -     **claim**: Rimsky-Korsakov's rules for handing a phrase between timbres, and for echo — both of which are the cheap synth version of an escalation.
      
          **evidence**: "A phrase or a figure is often transferred from one instrument to another. In order to connect the phrases on each instrument in the best possible way, the last note of each part is made to coincide with the first note of the following one." On echo: "the second instrument should be weaker than the first, but the two should possess some sort of affinity. An echo given to muted brass following the same phrase not muted produces this distant effect. Muted trumpets are eminently suited to echo a theme in the oboes; flutes also may imitate clarinets and oboes successfully. A wood-wind instrument cannot be used to echo the strings, or vice versa, on account of the dissimilarity in timbre. Imitation in octaves (with a decrease in resonance) creates an effect resembling an echo." And the register rule for imitation: "When a phrase is imitated in the upper register it should be given to an instrument of higher range and vice versa."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. IV, p. 107-111)
      
          **usable**: Handoff rule with a hard constraint: overlap by exactly one note — the last note of voice A IS the first note of voice B. This is what Adams describes at Pelennor when 'Trumpets take the theme' from the Hardanger. Echo rule: the answering voice must be a filtered/muted version of a RELATED timbre (same patch, lowpass + lower gain), never a different family. Octave-down repetition with reduced level = instant echo. All three are one-line operations in a synth program.
    -     **claim**: Rimsky-Korsakov gives a percussion warning with a hard consequence: a small percussion group at fortissimo will bury any tutti.
      
          **evidence**: "It must not be forgotten that the bass drum, cymbals, gong and a tremolo on the side drum, played fortissimo, is sufficient to overpower any orchestral tutti."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.gutenberg.org/files/33900/33900-h/33900-h.htm (Ch. IV, p. 117-118)
      
          **usable**: A mix constraint with a number in it: four percussion voices at full level dominate all other ~16 voices combined. In the program, sidechain or hard-cap the percussion bus so it cannot exceed the pitched bus by more than a set margin at the tutti — otherwise the 20-voice escalation you carefully built becomes inaudible at the exact moment it peaks. Conversely, this is the cheapest way to make a small synth ensemble sound enormous: hit the four-percussion stack.

**notFound**:   - Doug Adams' three Annotated Score booklets contain NO bar numbers and NO durations for any escalation. I grepped all three PDFs: the only occurrence of 'bar(s)' in a musical sense is 'trumpets manage to seek out a few bars of the Fellowship theme' (ROTK) and a player's anecdote about 'bar 4' in the TTT credits. No rehearsal marks, no measure counts, no timecodes for the escalations themselves. Every duration in this report is either a published track length or my own computation from a fan transcription's notated tempi.
    - No stage-by-stage timings for the Pelennor Fields escalation. Adams gives the eight stages in order but never says how long any of them lasts. The only hard number is the containing cue: 4:10. The ~31 s per stage figure is my arithmetic (250 s / 8 stages), not a source claim.
    - No duration for the Ents' flooding crescendo itself — only that it lives inside the 5:47 cue 'Théoden Rides Forth', beginning somewhere after the Gandalf/Éomer charge. Adams calls it 'the score's most extended crescendo' but supplies no length.
    - No published measure-level analysis of any Shore escalation. Searched for dissertations/theses with bar numbers for Pelennor or Helm's Deep; the academic literature found (Rone, Macksey Journal, MTO) treats harmony and leitmotif, not orchestration timelines. Doug Adams' full book 'The Music of the Lord of the Rings Films' (2010) may contain more, but it is a paid print book and was not reachable.
    - No official published instrumentation list on howardshore.com or Alfred for the LOTR Symphony or the Symphonic Suite — both pages omit instrument counts. The section-count list I did find (3/3/3/3, 5 horns, 4 trumpets, 3 trombones, tuba, min. 4 percussion, 2 harps) is from a Wikipedia mirror of an earlier revision, and its sources disagree on trumpet pitch (C/F/B-flat vs B-flat). Treat the COUNTS as sound and the pitch spec as uncertain.
    - No practitioner statement from Summoning about how many synth/keyboard layers or tracks they stack. Searched and fetched multiple interviews (Distorted Sound, Darkside.ru). They confirm the method is keyboard-first ('we did not compose the music on bass and guitar like we did on Lugburz, but just on keyboard'), sample-library-based, and that 'our music consists on so many elements and layers, changing one of it rather in a drastic way does not change the overall impression' — but no layer count, no library names with specifics, no arrangement-over-time description. This is a real gap for the synth-translation half of the brief and would need a dedicated pass.
    - Ravel's own metronome marking for Boléro was not verified from a primary source. The ~54 s per orchestration stage figure is derived from the sourced '340 measures' and the sourced 'seventeen-minute composition'. Performances vary from roughly 13:30 to 17:00, so the per-stage figure ranges ~45-57 s.

**sources**:   - https://www.gutenberg.org/files/33900/33900-h/33900-h.htm
    - https://www.elvish.org/gwaith/pdf/fotr_annotated_score_2.pdf
    - https://www.henneth-annun.ru/multimedia/ttt_annotated_score.pdf
    - https://www.tolkiendil.com/_media/divertissements/adaptations/films/sda_3_livret_de_presentation_de_la_bo_en_anglais_.pdf
    - https://alcaeru.weebly.com/uploads/7/8/6/0/786082/fotr_complete_transcription.pdf
    - https://musicbrainz.org/ws/2/release/e7fe61ca-65b8-4abb-8723-1e7c1a5e0a49?inc=recordings&fmt=json
    - https://musicbrainz.org/ws/2/release/61643390-71fe-46dd-b509-fb77128978f9?inc=recordings&fmt=json
    - https://musicbrainz.org/ws/2/release/72913ca7-2dab-49b0-afa4-68c7b95718c5?inc=recordings&fmt=json
    - https://en.wikipedia.org/wiki/Music_of_The_Lord_of_the_Rings_film_series
    - https://en-academic.com/dic.nsf/enwiki/1527515
    - https://www.dogandtuba.com/Tuba/Bolero_Roadmap.pdf
    - https://www.britannica.com/topic/Bolero-by-Ravel
    - https://mtosmt.org/issues/mto.20.26.2/mto.20.26.2.bhogal.html
    - https://distortedsoundmag.com/interview-silenius-protector-summoning/
    - https://www.darkside.ru/interviews/interview.phtml?id=292&dlang=en
    - https://howardshore.com/works/discs/2009-2000/the-lord-of-the-rings-the-two-towers-the-complete-recordings/

---

## v2:faf9e5d88ae0916f13835af5da82b7ed4d7ac460e882c22e2798d4dba3c594db

**findings**:   -     **claim**: A trailer cue is three acts of roughly equal length plus a tail half the length of one act; the worked example is 40s + 40s + 40s + 20s = 2:20.
      
          **evidence**: "three main sections (acts) of roughly equal length followed by a conclusion (tail), which is approximately half as long as one of the main sections" — example: "forty seconds" per main section with "a twenty second tail, totals two minutes twenty seconds"
      
          **kind**: practitioner-own-words
      
          **source**: https://www.trailaurality.com/blog/2018/1/5/guest-post-an-introduction-to-epic-trailer-music-production
      
          **usable**: Direct form generator: at 120 BPM in 4/4, 40s = 20 bars. Use 20/20/20/10 bars (or round to 16/16/16/8 = 32s/32s/32s/16s). This is the single most encodable structural number found.
    -     **claim**: Alternative act timing from a working trailer composer: Act 1 = 30s (range 15–30), Act 2 = 60s (range 20–60, split 2a 30s / 2b 30s), Act 3 = 60s (range 30–60, split 3a/3b), Act 4 (titles/logo) = 5s.
      
          **evidence**: "Act 1 – 30 seconds", "Act 2 – 60 seconds", "Act 3 – 60 seconds", "Act 4 – 5 seconds"; subdivided as "Act 2a – 30s / Act 2b – 30s / Act 3a – 30s / Act 3b – 30s"; Act 2 is where "the story is explained" then "the character taking action".
      
          **kind**: practitioner-own-words
      
          **source**: https://richardpryn.com/how-to-structure-trailer-music/
      
          **usable**: Gives an asymmetric alternative to equal thirds: 1:2:2 ratio plus a 5s button. The 2a/2b and 3a/3b split is a two-level form tree — each act is itself two halves, so a generative program can nest section logic rather than flatten it.
    -     **claim**: Section 2 of a trailer cue should be about 10% louder in RMS than section 1, and section 1's energy peaks around 500 Hz.
      
          **evidence**: Section 2 should produce "an RMS (root mean square) level increase of approximately ten percent"; Section 1 "often contains mid-frequency sounds which peak around the 500Hz range"
      
          **kind**: practitioner-own-words
      
          **source**: https://www.trailaurality.com/blog/2018/1/5/guest-post-an-introduction-to-epic-trailer-music-production
      
          **usable**: Encodable as a per-section gain/spectral target rather than an adjective. Act 1 material should sit in the 500 Hz region (mid-register pads, no sub, no top) — which is exactly what a dungeon-synth intro already is. The build is then literally 'add sub below and shimmer above 500 Hz'.
    -     **claim**: Theatrical trailers are capped at 2 minutes 30 seconds by MPA guideline, one exception per studio per year; teasers run 30–90 seconds.
      
          **evidence**: "limited to 2 minutes and 30 seconds (150 seconds) in length, as mandated by the Motion Picture Association (MPA). Each company is granted one exception a year"; teaser "can be from 30 seconds to 90 seconds"
      
          **kind**: folklore
      
          **source**: https://darkskiesfilm.com/how-long-is-a-movie-trailer/
      
          **usable**: Bounds total form length at 150s. Combined with the 3-act+tail rule this fixes the whole macro-form: nothing in this idiom is longer than 2:30, which is a very short window to run a full dynamic arc — the program should not write 6-minute epics if it wants this idiom's pacing.
    -     **claim**: Two Steps From Hell write 1–3 minute tracks, roughly two albums a year; a trailer typically licenses at least three separate tracks; TV spot cues are ~30s, theatrical ~2 min.
      
          **evidence**: "typically one- to three-minute tracks"; "making about two albums a year"; "A trailer usually features at least three tracks"; "full length (around 2 minutes long) 'theatrical'... and tv spots (usually around 30 seconds long)"
      
          **kind**: practitioner-own-words
      
          **source**: https://en.wikipedia.org/wiki/Two_Steps_from_Hell
      
          **usable**: Confirms the unit of composition is a 1–3 minute self-contained arc, not a movement. A generative program should target a complete rise-and-payoff inside ~90–150s.
    -     **claim**: Bergersen's own statement of the formula: soft start, gradual build, climax, fade.
      
          **evidence**: "A typical formula, especially for dramas and event movies, is a soft start that gradually builds, leading to a climax that fades and 'hopefully leaves people stunned'" — attributed to Thomas Bergersen
      
          **kind**: practitioner-own-words
      
          **source**: https://en.wikipedia.org/wiki/Two_Steps_from_Hell
      
          **usable**: Note the FADE after the climax — the cue does not end on the peak. Encode a decay tail after the loudest bar, not a hard stop.
    -     **claim**: Bergersen states what trailer editors actually require: simple arrangement and near-static dynamics, because the music competes with VO and SFX.
      
          **evidence**: Thomas Bergersen: "music that is impactful, not too complex in nature, or too busy in arrangement. It also needs to be fairly static dynamically, as it is up against a barrage of voice overs, sound effects and busy images."
      
          **kind**: practitioner-own-words
      
          **source**: https://diymusician.cdbaby.com/musician-tips/film-trailer-music-pt-2-an-interview-with-two-steps-from-hell/
      
          **usable**: The single most important constraint for a synth realisation. It licenses a small voice count: complexity is a defect in this idiom, not a virtue. 'Fairly static dynamically' means the loudness arc lives in ARRANGEMENT DENSITY (voices entering/leaving) rather than in per-note velocity — exactly what a program with ~7 parts can do well.
    -     **claim**: A working trailer composer keeps a rigid section order: sparse pad-like intro → breakdown (either aggressive or sparse) → backend 'wall of sound' with brass → plus a spare fourth or fifth act handed to the editor.
      
          **evidence**: "I keep quite rigid to the trailer structure... begin with, an open, pad-like intro that feels sparse and positive." / "After this, I'll focus on a breakdown. I might approach this in an aggressive tone, or one that's more sparse" / "The brass is especially important in the backend, so they are there bolstering everything else and helping to create the 'wall of sound'" / "I'll give the editor one fourth or fifth act to mess with so they have options at the end of the trailer."
      
          **kind**: practitioner-own-words
      
          **source**: https://richardpryn.com/chris-davey-on-writing-the-music-for-the-ruby-gillman-trailer/
      
          **usable**: Gives a 4-state machine: SPARSE_PAD → BUILD → BREAKDOWN → BACKEND (+ optional ALT_BACKEND). The 'breakdown' is the drop-out before the final statement, and it has two documented flavours (aggressive vs sparse) — a real binary choice the program can flip.
    -     **claim**: The same composer's trailer cue ran about 90 tracks; his current templates are 120–200 tracks.
      
          **evidence**: "This track only has about 90 tracks, these days my templates are a lot bigger at anywhere from 120 - 200 tracks."
      
          **kind**: practitioner-own-words
      
          **source**: https://richardpryn.com/chris-davey-on-writing-the-music-for-the-ruby-gillman-trailer/
      
          **usable**: THE CRITICAL FILTER NUMBER. A real trailer cue is 90–200 layers; the program has ~20 synth voices, i.e. one tenth. So the program cannot reproduce this by counting parts — it must reproduce the PERCEPT of 90 layers with 20 voices via unison detune, octave stacking, and reverb, not by writing more notes.
    -     **claim**: String orchestration in the idiom: short articulations are 'the motor'; long muted (sordino) strings supply the warm sustained bed.
      
          **evidence**: "Long sordino strings are great for that classic 'Disney film' type sound. The short strings will always be needed for the motor of a trailer track."
      
          **kind**: practitioner-own-words
      
          **source**: https://richardpryn.com/chris-davey-on-writing-the-music-for-the-ruby-gillman-trailer/
      
          **usable**: Two distinct synth patches, not one: (a) a short, plucky, fast-decay 'motor' voice running the ostinato, (b) a soft, low-passed, slow-attack sustained pad. Survives synthesis perfectly — sordino is essentially a low-pass filter and reduced attack transient.
    -     **claim**: Brass layout in the idiom: low octaves at the bottom, chords in the mid, theme in horns and trumpets in unison on top.
      
          **evidence**: "Brass: Low octaves, mid-range chords, French horns and trumpets in unison playing the theme"
      
          **kind**: practitioner-own-words
      
          **source**: https://richardpryn.com/chris-davey-on-writing-the-music-for-the-ruby-gillman-trailer/
      
          **usable**: A three-register brass allocation that maps onto exactly 3 synth parts: (1) root in octaves, low; (2) triad voicing, mid; (3) melody in unison (possibly doubled at the octave), high. Unison-on-melody rather than harmonised melody is the key detail and is cheap in voices.
    -     **claim**: Trailer sound design is a named, finite palette; a single trailer campaign can consume up to 90 cues.
      
          **evidence**: "stunning sound design: whooshes, rises, sub-bass booms, intense impacts, power-downs and atmospheric noises"; "up to 90 cues can end up in one trailer campaign"
      
          **kind**: practitioner-own-words
      
          **source**: https://www.soundonsound.com/music-business/all-about-library-music-part-7
      
          **usable**: Six named non-pitched event types. All six are synthesisable from noise + filter + pitch envelope with no samples: whoosh (band-passed noise sweep), rise (pitch/filter up), sub boom (sine with fast pitch drop), impact (transient + noise burst), power-down (pitch/filter down), atmosphere (filtered noise bed).
    -     **claim**: In trailer music, production and mixing dominate composition in time spent, and theory ranks near the bottom of required skills.
      
          **evidence**: Dylan Jones: "I find myself spending about 20-30 percent of my time on composing, and the rest of the time working on production and mixing." Cody Still: "I would place production skills at the very top of the list as being most important. Conversely, I would place theory and scoring skills closer to the bottom."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.soundonsound.com/music-business/all-about-library-music-part-7
      
          **usable**: Budget the program's effort the same way: the note-writing can be simple (4-chord loop, one ostinato, one melody) if the synthesis/mix chain is where the character lives. Justifies spending most of the engine on the voice/FX side.
    -     **claim**: Trailer cues deliberately leave gaps between sections and end unresolved, so editors can splice cues together and so the trailer 'resolves' only by watching the film.
      
          **evidence**: Gaps between sections are critical — "pauses allow editors to combine different tracks seamlessly"; endings "leave you hanging up in the air, to purposely create the feeling that the only true resolution is to go out and watch the film."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.soundonsound.com/music-business/all-about-library-music-part-7
      
          **usable**: Two hard rules: (1) insert a bar (or beat) of near-silence at every act boundary; (2) do not cadence to the tonic at the end — stop on VII, VI, or an unresolved sustained fifth. Both are trivially encodable and both are exactly what makes the idiom sound like itself.
    -     **claim**: A trailer editor's account of why the Inception braam cue works: the hits are NOT at regular intervals, but must be consistent within a section; the cue is sound design as much as music so it can be shortened or looped without cutting a melodic phrase.
      
          **evidence**: The hits "are not placed at regular intervals. Sometimes they're very close together, and other times they have more room to breathe," yet "as long as they're consistent in each section, it feels totally fine." The cue can be "shorten[ed] or lengthen[ed]" "without interrupting the phrases of a melody, or extending it by looping."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.derek-lieu.com/blog/2017/12/3/the-inception-braaaaaaam-sound
      
          **usable**: Encodes as: pick a hit-interval PER SECTION (e.g. every 2 bars in act 1, every bar in act 2, every 2 beats in act 3) and hold it constant inside the section, varying only across sections. Explicitly rules out a single global hit period. Also argues for melody-free act 1 so the section is loopable.
    -     **claim**: The Inception braam as scored was four wind instruments sounding together — bassoon, french horn, trombone, tuba — with timpani.
      
          **evidence**: "Inception's version employed four wind instruments playing simultaneously: Bassoon, French horn, Trombone, Tuba" plus "Timpani (percussion accompaniment)"
      
          **kind**: musicology
      
          **source**: https://en.wikipedia.org/wiki/BRAAAM
      
          **usable**: A braam is four different timbres on the same low pitch class plus a drum. Synthesises as 4 detuned oscillators with different waveforms/formants at unison+octave, plus a noise-transient drum. Four voices, not eighty — this technique survives translation completely.
    -     **claim**: Zimmer's own account of making the sound: brass played into the sympathetic resonance of an open-pedalled piano in a church, plus electronics.
      
          **evidence**: Hans Zimmer: "I put a piano in the middle of a church and I put a book on the pedal, and these brass players would basically play into the resonance of the piano. And then I added a bit of electronic nonsense."
      
          **kind**: practitioner-own-words
      
          **source**: https://en.wikipedia.org/wiki/BRAAAM
      
          **usable**: The mechanism is sympathetic resonance: a bank of tuned resonators (comb/resonant filters at the chord's pitches) excited by the brass signal. Directly implementable as a resonator bank on the braam bus — this is why the braam has a long ringing tail that a plain brass patch does not.
    -     **claim**: Braam construction recipe: layer tubas, bass trombones and a general low brass patch, shape dynamics mainly in the F to FFF range, then heavy compression and distortion.
      
          **evidence**: "layering tubas, bass trombones and a general low brass patch. Shape the dynamics curve of these layers, using mainly the F to FFF range"; "heavy compression and fat distortion being basically mandatory"; braams "usually consist of low brass instruments layered with synths and the odd piano here or there"
      
          **kind**: practitioner-own-words
      
          **source**: https://professionalcomposers.com/sound-design-how-to-make-trailer-braaam-fx/
      
          **usable**: The braam lives entirely in the top third of the dynamic range (F–FFF), i.e. it never has a soft version. Encode as: fixed high velocity, saturation stage, and a slow swell envelope rather than a variable-dynamic instrument.
    -     **claim**: A riser can be a single held note with a pitch-bend spanning four octaves over eight bars; layered risers use opposed bends, e.g. one layer +24 semitones while another goes −12.
      
          **evidence**: "a D note is drawn for eight bars with a pitchbend starting at the bottom and rising to the top - a 4-octave change"; "one layer bend up two octaves (+24 semitones) while another bends down an octave (-12 semitones)"
      
          **kind**: practitioner-own-words
      
          **source**: https://www.musicradar.com/tuition/tech/how-to-create-a-classic-pitched-riser-effect-618058
      
          **usable**: Fully specified and fully synthetic: 8-bar linear pitch ramp of 48 semitones on one oscillator, plus a counter-layer at −12 semitones. Diverging layers is the detail that stops it sounding like a cheap siren. Place one riser per act boundary.
    -     **claim**: A worked cinematic drum part: 62 BPM, five layers, with a specific role per layer.
      
          **evidence**: Tempo: "62bpm". Taiko: "semiquaver pattern with accents on the beat", one "marking the beginning of each bar with a flam", plus "a short crescendo at the phrase's end". Bass drum: "a hit at the start of every bar with two velocity-ramping hits leading into beats 2, 4 and 1". Egg shaker: "three-note egg shaker pattern" with velocity-split samples. Snare: "two-bar pattern incorporating flams, drags and a roll". Humanising: "no two or three taiko hit at exactly the same time by dragging stacked notes slightly off the grid".
      
          **kind**: practitioner-own-words
      
          **source**: https://www.musicradar.com/how-to/how-to-program-a-pounding-cinematic-drum-part
      
          **usable**: A complete percussion generator spec in five voices. Note 62 BPM — slow, i.e. the taiko semiquavers are only ~4.1 Hz, which is why they read as 'driving' rather than frantic. Also note the three distinct taiko jobs (pulse / bar-marker flam / phrase-end crescendo): the same drum sound used three ways, which costs almost nothing in synth voices.
    -     **claim**: Hit and boom placement is periodic at the bar level: hits every other bar or every 4 bars, sub booms every 4 or 8 bars; a finished mix carries 8–15 stacked percussion/hit layers; the impression of size comes from level CONTRAST of about half a dB, not from absolute level.
      
          **evidence**: jcrosby: "you might have these layered in every other bar, or every 4 bars, etc."; booms "in every 4 or 8 bars"; "I often have 8-15 stacked percussion/hit layers by the time I reach the end of a mix"; "nudge them up a half a dB to a dB and other elements of the mix down half a dB or so"; "the impression of 'hugeness' comes from contrasting levels"; on a reference track the hits "are mainly just toms with some kind of sub component underneath (maybe a taiko, maybe a taiko and a boom)"
      
          **kind**: practitioner-own-words
      
          **source**: https://vi-control.net/community/threads/trailer-music-balancing-percussion-vs-hits.115633/
      
          **usable**: Gives the exact periodicities to schedule (2/4/8 bars) and, crucially, says hugeness is a ~0.5–1 dB ducking of everything else at the hit. That is a sidechain duck, not a louder sample — cheap and exactly reproducible with synth voices. Also: a 'hit' = tom + sub, i.e. two voices.
    -     **claim**: Chromatic mediants, strictly defined, are chords whose roots lie a major or minor third apart, of the SAME quality, sharing exactly one common tone; C major has four (E, A, E♭, A♭ major). Doubly-chromatic mediants are opposite mode with NO common tones.
      
          **evidence**: "A relationship between two sections and/or chords whose roots are related by a major third or minor third, and contain one common tone (thereby sharing the same quality, i.e. major or minor)." Allen Forte on doubly-chromatic: "two chords of the opposite mode, with roots a third apart and no common tones."
      
          **kind**: musicology
      
          **source**: https://en.wikipedia.org/wiki/Chromatic_mediant
      
          **usable**: An exact generative rule: from any triad, the four chromatic mediants are root ±3 and ±4 semitones with quality preserved. A voice-leading engine can enumerate them and pick by common-tone count (1 = chromatic, 0 = doubly chromatic, more distant/more 'awe'). Costs nothing to implement and is the harmonic signature of the whole idiom.
    -     **claim**: Lehman's 'chromatically modulating cadential resolution' (CMCR): set up an ordinary diatonic cadence in one key, then let the dominant discharge onto the tonic of a chromatically related key. Down a major third is 'one of Williams's favorite strategies'. The device is specifically associated with wonderment.
      
          **evidence**: "the strategy of initiating a diatonic cadence in one key only for the dominant to discharge onto the tonic of a chromatically related key"; "the dominant progresses to B major, the tonic of a new lyrical theme (measure 5), making this a Type II CMCR (down a major third—one of Williams's favorite strategies)"; "the strong association of CMCRs with cinematic evocations of wonderment"; "the rhetorical factors are all at play: the pre-resolution swell, the post-resolution grand orch[estration]"
      
          **kind**: musicology
      
          **source**: https://www.mtosmt.org/issues/mto.13.19.4/mto.13.19.4.lehman.pdf
      
          **usable**: The best-specified 'awe' move found. Algorithm: build V of key X, then resolve to the tonic a major third BELOW X, and bring in the full ensemble on that chord. Lehman also names the surrounding gesture — swell before, full orchestration after — so the program should crescendo into the substitution and add voices on the downbeat after it.
    -     **claim**: Lehman's 'mixed plagal cadence' / 'mixed cadence' (the 'Hollywood Cadence'): the sixth scale degree in major drops from natural to flattened before the arrival on major tonic, producing a half-diminished supertonic and altered dominant en route.
      
          **evidence**: "In this harmonic formula, the sixth scale degree in major drops directly from its natural to flattened state prior to the capture of major tonic at a phrase's end." It is "a latter-day manifestation of the nineteenth-century harmonic proclivity for modal inflection of the subdominant in order to suggest sentiment or sublimity." Lehman warns it "risks shifting any transcendent affective aspirations towards cheapness and parodic overstatement."
      
          **kind**: musicology
      
          **source**: https://www.mtosmt.org/issues/mto.13.19.4/mto.13.19.4.lehman.pdf
      
          **usable**: Encodable as a voice-leading rule on ONE inner voice: 6̂ → ♭6̂ → 5̂ over a plagal approach to a major tonic. That is a single moving line, so it survives to a 7-part texture intact. Lehman's warning is also usable: reserve it for one moment per piece.
    -     **claim**: Corpus study of 482 film themes: 74% are 'grammatical' (period/sentence/clause/composite); strict cadences appear in only 63% of even those; sequential repetition transposes to IV, ♭VII, VI, III, or ♭III.
      
          **evidence**: "482 themes" from Oscar-nominated scores 1934–2015; "Grammatical themes: 74%"; strict cadences occur in "less than two thirds (63%) of grammatical themes"; "Sequential repetition typically uses transposition to IV, ♭VII, VI, III, or ♭III"; "The four theme types that are most common in film music are the only ones to include both multiple basic ideas and a relatively clearly articulated second half."
      
          **kind**: musicology
      
          **source**: https://www.mtosmt.org/issues/mto.16.22.1/mto.16.22.1.richards.html
      
          **usable**: A measured transposition table for sequencing a motif: pick from {IV, ♭VII, VI, III, ♭III} — note three of the five are flat-side/mediant, matching the chromatic-mediant idiom. Also: 37% of themes DON'T cadence strictly, so leaving a theme open is normal, not a failure. And themes should have two ideas with an articulated second half.
    -     **claim**: Two Steps From Hell 'Protectors of the Earth' is a four-chord loop in G minor: Gm–E♭–B♭–Dm = i–VI–III–iv.
      
          **evidence**: "Progression: Gm – Eb – Bb – Dm / Key: G minor / Roman Numerals: i – VI – III – iv"; "Great for action, fantasy, battle scenes, or trailers"; "Short loop, huge impact"
      
          **kind**: musicology
      
          **source**: https://www.filipeleitao.com/post/3-epic-chord-progressions-that-define-modern-film-scoring
      
          **usable**: This is the i–VI–III–x family the brief asked about, with the fourth chord being iv rather than VII. Four chords, one bar each, looped for the whole cue. Note VI and III are both flat-side major triads against a minor tonic — the 'epic' colour is that two of the four chords are major.
    -     **claim**: 'Heart of Courage' (Bergersen) is in B♭ minor with the loop B♭m–D♭–A♭–E♭m = i–III–VII–iv; automatic tempo estimators put it at 135–136 BPM.
      
          **evidence**: "Two Steps From Hell plays Bb min, Db maj, Ab maj, Eb min in Heart of Courage (no choir)"; "Heart of Courage (no choir) has a tempo of 136 BPM" / "a tempo of 135 BPM"
      
          **kind**: measurement
      
          **source**: https://songbpm.com/@two-steps-from-hell/heart-of-courage-no-choir
      
          **usable**: Second data point for the epic minor loop: i–III–VII–iv. Combined with Protectors (i–VI–III–iv) the invariant is: minor tonic, two flat-side MAJOR triads in the middle, and a return through a minor chord (iv). Tempo caveat: songbpm is an automatic estimator, not a score reading — treat 135 as approximate.
    -     **claim**: Gladiator 'Honor Him' is F# minor: i–iv–VII–i–VII–VI–iv–VII–v–i; Inception 'Time' is A Dorian: i–v–VII–IV.
      
          **evidence**: "F#m – Bm – E – F#m – E – D – Bm – E – C#m – F#m / Key: F# minor / i – iv – VII – i – VII – VI – iv – VII – v – i"; "Am – Em – G – D – Am – C – G – D / Key: A Dorian / i – v – VII – IV"
      
          **kind**: musicology
      
          **source**: https://www.filipeleitao.com/post/3-epic-chord-progressions-that-define-modern-film-scoring
      
          **usable**: Two more encodable loops. The Inception one is important for the dungeon-synth side: Dorian (major IV against a minor tonic) plus a MINOR v — no leading tone anywhere. A dark modal loop that still reads as cinematic.
    -     **claim**: 'Duel of the Fates' opens by juxtaposing E minor and C minor — two minor triads a major third apart — and holds each chord at length before moving.
      
          **evidence**: "E minor and C minor as the opening chords, with E minor as the tonic"; "juxtaposed minor chords"; harmony is "stagnant", it "remain[s] on a chord at length before finally progressing to another"; the choir sings "Korah Matah, Korah Rahtahmah".
      
          **kind**: musicology
      
          **source**: https://filmmusicnotes.com/celebrating-star-wars-themes-part-4-of-6-duel-of-the-fates/
      
          **usable**: Em↔Cm is a chromatic mediant with both chords minor — the darkest form. Two chords, held for many bars each, is a dungeon-synth-compatible harmonic rhythm (very slow) that still yields the epic colour. Also gives the actual choir syllables: 4 syllables + 5 syllables, all open vowels (o/a), which is exactly what a formant-filtered synth choir can render.
    -     **claim**: Ostinatos in this idiom are built modularly as four one-bar blocks with fixed roles, not as one long line; strings are layered by register with three distinct jobs.
      
          **evidence**: Build "four 1-bar patterns": "Block A: Pure rhythm / Block B: Accented harmony / Block C: Melodic motion or climb / Block D: Rest or transition". Register layers: low strings = "weight, gravity", mid = "richness, core tone", high = "urgency, shimmer". Also: "Sketch the rhythm first"; "Try odd meters like 5/8 or 7/8"; "Combine spiccato and staccato to create variation without changing the pattern".
      
          **kind**: practitioner-own-words
      
          **source**: https://www.filipeleitao.com/post/how-to-write-epic-string-ostinatos-like-hans-zimmer
      
          **usable**: A complete ostinato generator: define 4 one-bar cells with those four functions and sequence them (AABA, ABAC, AABD…). Variation comes from ARTICULATION swaps on an unchanged pitch pattern — cheap in a synth (change decay time and filter, keep the note list). Three register layers = 3 voices, not 3 sections.
    -     **claim**: Shore's Isengard music uses a five-beat pattern in 5/4 scored on metal: bell plates, anvils, bass drum, taiko, and chains beaten on piano strings.
      
          **evidence**: Howard Shore: "Isengard is industrial age, and its written in 5/4 time, which is a rhythm that I use only in Isengard and only to evoke this kind of things being a little off kilter"; "the 5/4 rhythm is a little unusual enough that it always felt a bit unresolved." Scored for "collections of metal bell plates, anvils, bass drum, Japanese taiko drum, and metal chains beating the strings inside a piano"; the orchestration is "actually quite simplistic."
      
          **kind**: practitioner-own-words
      
          **source**: https://en.wikipedia.org/wiki/Music_of_The_Lord_of_the_Rings_film_series
      
          **usable**: The best dark-epic-that-is-also-percussion finding, and the composer explicitly calls the orchestration simplistic. 5/4 as a marked meter reserved for one character/section is a strong structural device. All the sounds are inharmonic metal — synthesisable with FM or ringing bandpass-filtered noise, no orchestra required.
    -     **claim**: Orff's 'O Fortuna', the template for the whole epic-trailer choir sound, is D minor/Aeolian over ostinato and pedal points, with the choir singing in octaves ('magadizing') and dynamics swinging between sempre pianissimo and fortissimo.
      
          **evidence**: "D minor with ostinato and pedal points"; "a descending diatonic progression in D minor, from the tonic to a half cadence on A, with a modal (D Aeolian) orientation"; "each of its three syncopated phrases initiated with a booming unison downbeat"; "There is a lot of 'Magadizing' in this piece – that is, singing in octaves. When dynamics are already at extremes, octaves are used within the harmony to create an effect that sounds even louder and more 'full'"; "In bar 29... 'sempre pianissimo'"; "the tempo also increases to 144".
      
          **kind**: musicology
      
          **source**: https://ofortunapathetiquesonata.weebly.com/o-fortuna-from-carmina-burana-by-carl-orf.html
      
          **usable**: Decisive for the synth-choir question: the model piece uses OCTAVES, not four-part harmony, precisely because octaves sound louder and fuller. A synth choir of 2–3 voices in octaves is therefore not a compromise — it is the actual technique. Plus: modal D Aeolian, descending diatonic bass, pedal point, and a pp section at bar 29 before the return of ff.
    -     **claim**: The classical prohibition on parallel octaves and fifths exists because they fuse — listeners perceive the number of voices as having DECREASED.
      
          **evidence**: "composers are traditionally advised to avoid parallel octaves and fifths in classical choir writing because they melt together so that the audience might get the impression that the number of voices decreased"
      
          **kind**: musicology
      
          **source**: https://musicintervaltheory.academy/learn-how-to-write-music/harmonic-series-circle-of-fifths/
      
          **usable**: Read backwards, this is the exact rule for the opposite problem: with ~20 synth voices you WANT fusion into a few enormous lines. Deliberately write parallel octaves and fifths — the classical defect is the synthetic-orchestra virtue. This is probably the cleanest theoretical justification in the whole set for the idiom's open-fifth/octave writing.
    -     **claim**: Measured f0 dispersion between singers in unison is 25–30 cents (Jers & Ternström); other studies report 20–30 cents mean with an inter-singer range of 0–50 cents.
      
          **evidence**: "Jers and Ternström [14] measured the dispersion between singers and found it to range between 25 and 30 cents"; "dispersion values ranging from 20 to 30 cents on average, depending on the choir section and the song"; "inter-singer deviation in the range of 0 cents–50 cents, with a mean of around 20 cents"
      
          **kind**: measurement
      
          **source**: https://arxiv.org/pdf/1904.05086
      
          **usable**: A hard number for faking an ensemble from few voices: detune stacked unison voices with a spread of roughly 25 cents (not the 5–10 cents of a pop chorus effect, and not the 50+ cents that sounds broken). This single parameter is most of what turns one synth voice into 'a section'.
    -     **claim**: Tuning tolerance widens dramatically in the low register: mean absolute deviation in matching a unison rose from 16 cents at A2 (110 Hz) to 41 cents at A0 (27.5 Hz) for professional orchestral musicians.
      
          **evidence**: "the spread (mean absolute deviation) in the tuning of a melodic interval to unison, using complex tones with different spectra, increased continuously from 16 to 41 cents in the low-frequency range from 110 Hz (A2) to 27.6 Hz (A0)"
      
          **kind**: measurement
      
          **source**: https://acta-acustica.edpsciences.org/articles/aacus/full_html/2021/01/aacus200079/aacus200079.html
      
          **usable**: Register-dependent detune: use ~15 cents spread on high strings/choir and up to ~40 cents on the sub/low brass layer. It also means the sub-bass and braam layers can be grossly detuned for weight without sounding out of tune — the ear cannot tell down there.
    -     **claim**: In orchestral sample programming, CC1 (mod wheel) changes the dynamic layer and therefore the TIMBRE, while CC11 is only a secondary volume control; velocity is what makes a brass instrument go into its brassy timbre.
      
          **evidence**: "While CC1 changes the dynamic layer and timbre, CC11 is strictly a secondary volume control."; "Velocity is usually what causes the instrument to change in timbre as dynamic is increased, like a trumpet played soft pp vs. forte which it will go into its brassy timbre."
      
          **kind**: practitioner-own-words
      
          **source**: https://modwheel.net/guides/understanding-midi-ccs
      
          **usable**: The most important synthesis rule in the set: an orchestral crescendo is a BRIGHTNESS ramp, not a gain ramp. Map the program's dynamic parameter to filter cutoff / oscillator harmonic content / waveshaper drive first, and to output gain second. A pure volume ramp will read as a fader move, never as an orchestra swelling.
    -     **claim**: Real forces for the canonical epic fantasy score: a 96-piece London Philharmonic, with total ensembles of 230–400 musicians; a 2026 concert performance used 238.
      
          **evidence**: "an ensemble ranging from 230 to 400 musicians, including the 96-piece London Philharmonic Orchestra, several choirs and 10 international soloists"; "performed live by 238 musicians"
      
          **kind**: measurement
      
          **source**: https://en.wikipedia.org/wiki/Music_of_The_Lord_of_the_Rings_film_series
      
          **usable**: Sets the scale being simulated: ~100 orchestral players + choirs. Against ~20 synth voices, the ratio is roughly 5–12 real players per synth voice — which is precisely the unison-detune stack size the 25-cent dispersion figure suggests (a 'section' voice = one oscillator group with ~25 cent spread standing in for ~10 players).
    -     **claim**: Theatrical trailer loudness is capped by industry standard at 85 Leq(m) — a mid-emphasis time-averaged measure, so loud moments must be paid for with quiet ones.
      
          **evidence**: "The current upper volume limit is 85 Leqm"; Leq(m) "measures decibels averaged over time with a weighting curve that is more sensitive to annoyance frequencies"; "This allows for trailers to have loud explosions with enough quiet parts to balance it out"; "The loudest trailer today is constrained at 85 dB Leq(m), the equivalent of 50% of the level of the loudest trailers in 1996."
      
          **kind**: measurement
      
          **source**: https://www.thx.com/certification/thx-tasa-certification/
      
          **usable**: Explains WHY the idiom has sparse acts at all: the form is partly a loudness budget. Encodable as a constraint on the generator — compute a running mid-weighted average and require the quiet sections to be quiet enough that the climax can be maximally loud. A cue that is loud throughout is, by this standard, illegal AND less impactful.
    -     **claim**: Summoning — the openly synthetic epic-fantasy black metal precedent — compose everything on keyboards, including the guitar riffs, and use keyboard drums; songs grow by one member adding counter-melodies (e.g. horns) to the other's MIDI sketch, never in rehearsal.
      
          **evidence**: "they integrated a lot of keyboards and keyboard drums, making keyboards the main instrument"; "they were the only band who composed all their songs on keyboards"; "Silenius visiting Protector's studio with a melody idea in mind, which is recorded as a MIDI file"; Protector "composes guitar riffs on keyboard because playing keys gives him more ideas than playing on strings"; "they don't do any kind of rehearsals... their songs don't grow when they're together but rather when they're alone in their rooms listening to the other's melodies."
      
          **kind**: practitioner-own-words
      
          **source**: https://en.wikipedia.org/wiki/Summoning_(band)
      
          **usable**: Validates the whole approach: the genre's own founders write a monophonic melody first, then accrete counter-melodies onto it, all from a keyboard, with programmed drums. That is exactly a generative program's workflow — melody generator, then counter-melody generators layered on top, then a drum machine.
    -     **claim**: Summoning describe the epic effect as coming from making the guitar part LESS rhythmic, not more.
      
          **evidence**: "the guitars are much louder and played in a new style, which is less rhythmic, but more relaxed and gives the songs a slower and more epic feeling"; earlier they aimed at "more polyphonic structures to the orchestral tunes and putting more focus on the drums."
      
          **kind**: practitioner-own-words
      
          **source**: https://www.darkside.ru/interviews/interview.phtml?id=292&dlang=en
      
          **usable**: Counter to the trailer-music instinct: for the dungeon-synth half, the sustained/harmonic layer should be rhythmically inert (long notes, no articulation) while the drums carry the pulse. Gives the program two opposed registers of behaviour to switch between — 'trailer mode' (short-string motor) and 'Summoning mode' (inert sustains + drums).
    -     **claim**: Practitioners and critics agree the idiom is formulaic, and describe the formula in concrete terms: the same distorted brass braams, ostinato strings, and recognisable drum patterns, deployed until the braam became background noise.
      
          **evidence**: "a lot of trailer music is like clip art, with very little interest in originality or variety"; "the same distorted brass 'braams,' ostinato strings, and ultra-recognizable drum patterns show up repeatedly across trailers"; "trailer music was formulaic a long time ago, though this was considered necessary to give industry editors what they wanted"; braam fatigue turned it into "background noise that diminished its original impact."
      
          **kind**: folklore
      
          **source**: https://vi-control.net/community/threads/im-sick-of-epic-music-and-trailer-music-nonsense.153813/
      
          **usable**: The critique names the three obligatory ingredients — distorted low brass hit, string ostinato, big drum pattern — which is a checklist for the generator. It also warns the braam is worn out, arguing for using it ONCE per piece rather than as punctuation.
    -     **claim**: Bergersen's own stated constraint against relentless loudness, and his statement that melody is the focus.
      
          **evidence**: "It can't just be wall-to-wall loud music all the time. We'll break it down and make it an experience."; "Melody is very important for me and it's always going to be the focus of my music."; on synth elements: some things "you can't replicate in an orchestra" so "synth tracks and percussion tracks... are integral to each song."
      
          **kind**: practitioner-own-words
      
          **source**: https://soundtrackfest.com/en/articles/two-steps-from-hell-europe-tour-thomas-bergersen-interview/
      
          **usable**: Direct license for the hybrid: even the live Two Steps From Hell show runs synth and percussion tracks alongside the orchestra because those parts cannot be played acoustically. So the synthetic layer is not a substitute in this idiom, it is native. And melody-first ordering: write the tune before the ostinato and the hits.

**notFound**:   - NO BAR COUNTS for the drop-out / stop-down before the final statement. Every source names the device ('stopdown', 'breakdown', 'pause') and says it exists between acts, but not one gives a length in bars or seconds. Best available is Chris Davey's binary characterisation (aggressive vs sparse). The program will have to pick a length by fiat — 2 or 4 bars is a guess, not a finding.
    - NO PUBLISHED TRANSCRIPTION of a Two Steps From Hell ostinato with actual note values. Chord loops are documented (Protectors of the Earth, Heart of Courage) but the rhythmic cell of the ostinato is not transcribed anywhere retrievable. The four-block A/B/C/D model is the only concrete substitute found and it is a teaching abstraction, not a transcription.
    - NO PRIMARY-SOURCE BPM CONVENTION for trailer/epic music. The '80–140 BPM' figure comes from an aggregator page with no cited method; the 135–136 BPM for Heart of Courage comes from an automatic estimator, not a score. The only tempo from a real worked example is MusicRadar's 62 BPM cinematic drum part. No practitioner interview found states a tempo range in their own words.
    - NO REGISTER SPECIFICS (actual pitches or octave numbers) for choir writing in the trailer idiom. The Orff evidence gives octave doubling and D minor; Duel of the Fates gives syllables; but no source states what octave an 'epic choir' part is written in or its range.
    - HOOKTHEORY CORPUS DATA INACCESSIBLE — both the Hooktheory blog on cinematic progressions and the Heart of Courage theorytab returned HTTP 403. So no frequency statistics for how often i-VI-III-VII vs i-VII-VI-VII actually occur. The i-VI-III-VII form named in the brief was NOT confirmed as such in any retrievable source; what was confirmed is the closely related i-VI-III-iv (Protectors of the Earth) and i-III-VII-iv (Heart of Courage).
    - FRANK LEHMAN'S CHROMATIC MEDIANT CATALOGUE / corpus statistics from 'Hollywood Harmony' (2018) are not freely retrievable. Only the 2013 MTO 'Hollywood Cadences' article was obtainable, and it contains no frequency tables — Lehman explicitly says his categories are 'not necessarily meant to reflect frequency of occurrence in a statistical sense'.
    - NO MEASURED ANSWER to the core translation question: how many synth voices are needed to read as an orchestral section. The 25-cent dispersion figure and the 96-player/230-400-musician figures bracket the problem from both ends but nobody has measured the perceptual threshold.
    - NO BERGERSEN TECHNICAL INTERVIEW retrievable. trailermusicweekly.com returned 403 and no Sound On Sound interview with him exists in search results. All Bergersen material found is philosophical or biographical; he has not publicly documented voice counts, orchestration layouts, or bar structures.
    - NO ONSET-ASYNCHRONY MEASUREMENT survived verification. A search snippet quoted per-section timing deviations (Soprano 0.134 s etc.) but the units were internally inconsistent ('0.0024 msec') and the figure could not be confirmed in the source PDF. Do not use any ensemble timing-stagger number as measured — the humanisation advice found ('drag stacked notes slightly off the grid') is qualitative only.

**sources**:   - https://www.trailaurality.com/blog/2018/1/5/guest-post-an-introduction-to-epic-trailer-music-production
    - https://richardpryn.com/how-to-structure-trailer-music/
    - https://richardpryn.com/chris-davey-on-writing-the-music-for-the-ruby-gillman-trailer/
    - https://richardpryn.com/braaams/
    - https://www.soundonsound.com/music-business/all-about-library-music-part-7
    - https://diymusician.cdbaby.com/musician-tips/film-trailer-music-pt-2-an-interview-with-two-steps-from-hell/
    - https://en.wikipedia.org/wiki/Two_Steps_from_Hell
    - https://soundtrackfest.com/en/articles/two-steps-from-hell-europe-tour-thomas-bergersen-interview/
    - https://www.derek-lieu.com/blog/2017/12/3/the-inception-braaaaaaam-sound
    - https://en.wikipedia.org/wiki/BRAAAM
    - https://professionalcomposers.com/sound-design-how-to-make-trailer-braaam-fx/
    - https://www.musicradar.com/tuition/tech/how-to-create-a-classic-pitched-riser-effect-618058
    - https://www.musicradar.com/how-to/how-to-program-a-pounding-cinematic-drum-part
    - https://vi-control.net/community/threads/trailer-music-balancing-percussion-vs-hits.115633/
    - https://vi-control.net/community/threads/im-sick-of-epic-music-and-trailer-music-nonsense.153813/
    - https://en.wikipedia.org/wiki/Chromatic_mediant
    - https://www.mtosmt.org/issues/mto.13.19.4/mto.13.19.4.lehman.pdf
    - https://www.mtosmt.org/issues/mto.16.22.1/mto.16.22.1.richards.html
    - https://www.filipeleitao.com/post/3-epic-chord-progressions-that-define-modern-film-scoring
    - https://www.filipeleitao.com/post/how-to-write-epic-string-ostinatos-like-hans-zimmer
    - https://blog.landr.com/cinematic-chord-progressions/
    - https://songbpm.com/@two-steps-from-hell/heart-of-courage-no-choir
    - https://filmmusicnotes.com/celebrating-star-wars-themes-part-4-of-6-duel-of-the-fates/
    - https://en.wikipedia.org/wiki/Music_of_The_Lord_of_the_Rings_film_series
    - https://ofortunapathetiquesonata.weebly.com/o-fortuna-from-carmina-burana-by-carl-orf.html
    - https://musicintervaltheory.academy/learn-how-to-write-music/harmonic-series-circle-of-fifths/
    - https://arxiv.org/pdf/1904.05086
    - https://acta-acustica.edpsciences.org/articles/aacus/full_html/2021/01/aacus200079/aacus200079.html
    - https://modwheel.net/guides/understanding-midi-ccs
    - https://www.thx.com/certification/thx-tasa-certification/
    - https://www.tasatrailers.org/whatis.html
    - https://en.wikipedia.org/wiki/Summoning_(band)
    - https://www.darkside.ru/interviews/interview.phtml?id=292&dlang=en
    - https://darkskiesfilm.com/how-long-is-a-movie-trailer/
    - https://www.reelcrafter.com/blog/the-basics-of-a-film-trailer-cue-by-mike-rubino
    - https://epicomposer.com/mastering-low-end-in-trailer-music/
    - https://www.rareformaudio.com/blog/how-production-music-reveals-trailer-structure
