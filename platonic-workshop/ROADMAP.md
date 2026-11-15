# What comes next: making the Workshop easy for a reader who is not a scholar

Daniel's aims (November 2026): the Workshop is for a non-scholar; it should gather everything on Plato in one
place; the dialogues are ordered as the Platonists ordered them, and the Platonists' opinions are taken over the
modern scholars'; an idea should be followable across Plato and the Neoplatonists quickly, from the page being read.

The rules of every milestone, as before: every claim quotes its source and the build or a test looks for the
quotation; nothing is guessed; a translation made for the Workshop is labelled as the Workshop's own; a modern
scholar's view is labelled as modern, beside the ancient Platonists'. Everything stays in `platonic-workshop/`.
Merge to `main` when the tests pass; the website republishes itself.

Each milestone is meant to be one working session, in its own thread. Start the next one by reading this file and the README.
When a milestone is done and merged, its thread hands off to a new thread for the next milestone (as 14 to 18 have done),
so that each thread starts small.

## The current focus (November 13, 2026, asked for by Daniel): the Enneads of Plotinus in modern English

Daniel: "Ok lets put a pause to this and move over to the Enniads, translating it into modern english".

- The Aristotle work is **paused** after 35m6 (see the section below); everything else paused stays paused.
- Daniel (November 14, 2026): "There should be zero texts that are in greek only or archaic English". Every text in the
  Workshop gets a modern English version checked against the Greek, one milestone per thread, without stopping to ask between
  milestones. The order: the Enneads first (these E milestones), then Aristotle's Metaphysics from Book Λ (35m7) onward, then
  the rest of Aristotle in the Platonists' order of reading, then the remaining Plato and Neoplatonist texts.
- The work now is the **Enneads in modern English**, milestones E1 to E34 below, in Porphyry's order (the order of his edition,
  six sets of nine; the order Daniel wants unless he says otherwise). Fifteen treatises are already done, beside Taylor's English
  (milestone 27, sessions 1 and 2: I.2, I.3, II.4, II.9, III.6, III.7, IV.2, IV.3, IV.7, V.1, V.2, V.3, V.6, V.9, VI.9); the
  milestones below do the other thirty-nine.
- **The pattern** (as the Aristotle milestones 35m1 to 35m6, and milestone 27 for Plotinus): modern English made from the Greek
  (Volkmann, Leipzig 1883-1884, First1KGreek's TEI, already in the Workshop as `plotinus-enneads`), chapter by chapter and
  paragraph by paragraph, every idea kept; the older English beside it, side by side or one tap away; a flag wherever the older
  English misses or adds to the Greek, quoting its words word for word (the build checks the quotation); notes giving Plato's,
  Aristotle's and Homer's places; labelled as the Workshop's own AI-drafted (machine-assisted) translation, not yet checked by a
  scholar; Mark a sentence. The fixed renderings of `terms-greek.json` apply (νοῦς intellect, ψυχή soul, ἀρετή virtue ...).
- **The older English** is Stephen MacKenna's (1917-1930; published before 1931, so public domain in the United States), made from
  the same Greek: the Internet Archive's OCR of each volume is kept as received in `sources/mackenna-plotinus-<year>/` and read by
  rule by `tools/mackenna.py` into `texts/plotinus/mackenna-<year>.json` (running heads and page numbers out, broken words and
  paragraphs joined; not proofread). The milestone that first needs a volume adds it: vol. I (1917, Ennead I and Porphyry's Life),
  E1; vol. II (1921, Enneads II and III), E7; vol. III (1924, Ennead IV), E15; vol. IV (1926, Ennead V), E20; vol. V (1930,
  Ennead VI), E22. Where MacKenna's chapter numbers are not Volkmann's (in I.8 his 12 chapters hold Volkmann's 15), the master
  copy names his chapters for each Greek chapter with `@older`.
- **The files**: master copy `sources/translations/modern/enneads.txt` (format at its head), built and checked by
  `tools/modern_enneads.py` into `enneads.json` and `reports/modern_enneads.md`; read at `#neo-modern/enneads`, which also shows
  the contents of all fifty-four treatises in Porphyry's order (done here, beside Taylor, or to come with its milestone: the
  `PLAN` list in `tools/modern_enneads.py`, which each milestone keeps true). Tests: `tests/test_modern_enneads.py` and
  `tests/modern_enneads_browser.js` (each milestone adds a check or two for its treatises).
- **One milestone per thread.** A thread does its one milestone, merges it, checks the deployed site, reports, and stops; the next
  starts in a fresh thread, which reads only this section and the README's section on the Enneads. Each is sized for one fresh
  thread (about 2,500 to 7,500 Greek words). Run the tests that touch the files changed (the full suite can take over 25 minutes).
- The next one to do is always the first milestone below not marked done.
- **Where it stands (November 15, 2026):** E1 to E33 are done, so the Life and all thirty-nine treatises not Taylor's are in
  modern English (489 chapters) and none is "to come". What is left of the Enneads is E34 (MacKenna's English beside the
  fifteen done with Taylor, and their flags checked against him), which Daniel asked for; E34a, MacKenna beside every
  chapter, is done, the flags for I.2, I.3, II.4 (E34b), II.9 (E34c), III.6 (E34d), III.7 and IV.2 (E34e), IV.3 (E34f), IV.7 and V.2 (E34g), V.1 and V.6 (E34h), V.3 (E34i), V.9 and VI.9 (E34j) too, so all of E34 is done. After the Enneads, Daniel's order goes on to Aristotle's
  Metaphysics from Book Λ (35m7, in milestone 35 below).
- **Also under way (November 15, 2026, asked for by Daniel):** Proclus' Theology of Plato in modern English, from Taylor's
  English, beside the Enneads' E34: the T milestones, in their own section below ("Proclus' Theology of Plato in modern English").

### The milestones (Greek words in brackets)

- **E1: I.1, What is the living being, and what is the human being? (2,682) (done).** MacKenna's vol. I brought in
  (`tools/mackenna.py`); `tools/modern_enneads.py`, the reader page with the whole Enneads in Porphyry's order, links from the
  Neoplatonists' shelf and from each chapter of the Greek; I.1 in 13 chapters, 25 paragraphs, 11 flags against MacKenna (e.g.
  he puts the "soul that weaves" in Plato, where Plotinus is quoting Aristotle, On the Soul 408b; he has God "contained in" the
  intelligible, where the Greek has him "riding upon" it), and notes on Aristotle's On the Soul, the Timaeus, the Republic's beast
  and Glaucus, and Homer's Heracles.
- **E2: I.4 On happiness, I.5 Whether happiness grows with time (5,565) (done).** I.4 in 16 chapters, 40 paragraphs, 17 flags;
  I.5 in 10 chapters, 13 paragraphs, 5 flags (e.g. MacKenna has the good man "put to torture" where the Greek says only that the
  pain is drawn out, "misery and disgrace" for poverty and obscurity, "a mimic of eternity" for the Timaeus' "image of eternity",
  "last year's morality" for wisdom, and adds a sentence to close I.4.2). σπουδαῖος is "the good man" (MacKenna's "Sage"), with a
  note. Notes on Aristotle's Nicomachean Ethics (Priam, self-sufficiency, unhindered activity, the complete life), the Republic's
  greatest study, the Phaedo's child within, the Theaetetus' likeness to God, the Timaeus, Parmenides and the bull of Phalaris.
- **E3: I.6 On beauty, I.7 On the first good and the other goods (3,753) (done).** I.6 in 9 chapters, 30 paragraphs, 20 flags;
  I.7 in 3 chapters, 6 paragraphs, 6 flags (e.g. MacKenna turns Thrasymachus' "self-control is foolishness" into "morality means
  weakness of will", calls the "simple" beauty of colour "the outcome of a unification", reads "the perfect goodness" where the
  Greek has the Phaedrus' self-control "on a holy pedestal", "God and Beauty" for the Good and the beautiful, "Supernals" for
  daemons, and has the light "in" the sun where the Greek has it "towards" the sun). Notes on the Phaedo's purification and mire,
  the Symposium's beauty itself, the Phaedrus (the pedestal, the statue, the sting of love), the Republic's sunlike eye, the
  Good beyond being and Thrasymachus, Aristotle's evening and morning star and "what all things desire", Agamemnon's "dear
  fatherland", Circe and Calypso, Narcissus, Heraclitus' hidden harmony and the Stoics' symmetry (Cicero).
- **E4: I.8 What evils are, and where they come from, I.9 On going out of life (4,533) (done).** I.8 in 15 chapters, 42
  paragraphs, 31 flags; I.9 in 1 chapter, 3 paragraphs, 3 flags. MacKenna's I.8 really has 12 chapters (checked in the scan:
  no chapter numbers lost; the running head of p. 105 is "I. 8. 10"): his 10 holds Volkmann's 10 to 13, his 11 and 12 are 14
  and 15, named with `@older`; `tests/test_modern_enneads.py` now checks each flag against the MacKenna chapters shown with it.
  (E.g. MacKenna gives "the First Act" to the Good where the Greek gives it to intellect, makes non-being "utterly different"
  from being where the Greek says "only other", has the soul "hasty to compromises" for "rash in its assents", "in times of
  stress" where the Greek is "full" and "empty", "practical proof" for induction, and "unlawful" in I.9 where the Greek says
  only "one must do nothing".) Notes on the Theaetetus' flight (176a-b), the Second Letter's king of all (312e), the Sophist's
  non-being (258b), the Timaeus (47e-48a, 41a-b, 52b), the Statesman's ancient nature and place of unlikeness (273b-d), the
  Phaedo's mud and guard post (69c, 61c-62c), the Republic's sleep in Hades (534c-d), the Phaedrus' wings (246b-c),
  Sophocles' holy grove, Aristotle on contraries, privation, induction and substance, and the Chaldaean oracle that opens I.9.
- **E5: Porphyry's Life of Plotinus, chapters 1-12 (3,364) (done).** Volkmann's vol. I (1883) opens with the Life (checked
  in the scan: pp. 1-36, its 26 chapters numbered); brought in as the Internet Archive scan `volkmann-enneades-gr-v.-1-1883`
  (`ia-volkmann-t1` in `sources/manifest.json`, its OCR kept in `sources/neoplatonists/ocr/`), on the Neoplatonists' shelf as
  `porphyry-life-plotinus`. Chapters 1-12 (pp. 3-18, 16 pages) proofread from the page images
  (`sources/neoplatonists/proofread/porphyry-life-plotinus.txt`, 345 line corrections; `tools/proofread.py` now names the
  editor of each text); pp. 19-36 stay the OCR as received until E6. `tools/mackenna.py` reads MacKenna's Life (26 chapters,
  vol. I pp. 1-28); `tools/modern_enneads.py` splits the proofread Greek at Volkmann's chapter numbers and puts the Life first,
  before Ennead I. 12 chapters, 37 paragraphs, 19 flags, 20 notes. Porphyry's list of the books gives each its place in the
  Enneads in square brackets, the Workshop's addition (Workshop numbering: IV.1 the short "intelligible world" book, IV.2 "the
  being of the soul"). E.g. MacKenna has "At twenty" for the twenty-eighth year, "malign diphtheria" for the "dog-choke",
  "one meal a day" for eating every other day, "the Supreme" for intellect, "early manhood" for Plotinus' fifties, and wrong
  Ennead places (II.2 for III.4, II.4-5 for VI.4-5, III.5 for III.6, I.8 for I.7). Notes on the Republic's image of an image
  (597e-598b), the Phaedo's allotted daemon (107d) and guard post, the Timaeus' daemon (90a) and Atlantis, the Laws and the
  philosopher kings (473c-d), Plato's and Socrates' birthdays in Thargelion, Ammonius, the two Origens, Numenius, and the dates.
  The reader lists the Life "Before the Enneads"; each paragraph's Greek links to its proofread page, and each page to its chapter.
- **E6: Porphyry's Life of Plotinus, chapters 13-26 (4,053) (done).** The rest of p. 18 and pp. 19-36 of Volkmann's vol. I
  (leaves 48-66) proofread from the page images into `porphyry-life-plotinus.txt` (the whole Life now proofread: 34 pages,
  779 line corrections; Volkmann's quotation marks ‘ ’ kept; the oracle's turned-over half line "λάσσης" kept as a line).
  14 chapters, 46 paragraphs, 36 flags, 28 notes; the Life is complete (26 chapters, 83 paragraphs, 55 flags). MacKenna's
  chapter 23 begins inside the oracle ("from the Ever-Blessed"), so the Greek chapter 22 shows his 22 and 23 (`@older 22 23`).
  E.g. MacKenna has "I put faith in Plotinus' writings" where Porphyry was entrusted with them, "My own method has been
  different" where Longinus says he has done the same, "Content with setting side by side ..." where the Greek says they took
  no such care, "Alexander of Lydia" and "Lydus" for Alexander the Libyan and Demostratus the Lydian, "Thomasius" for
  Thaumasius, "Theodorus" for Theodotus, "Celestial" for the oracle's "daemon", "Bathychaites" left as a name, "crowned with
  unfading life" for "armed with mighty lives", "On Evil" and "On the Stars" for Porphyry's titles, "Developments" for
  arguments, and he drops arithmetic and the god "with neither shape nor form". Hard places flagged: who "the man" is in
  Amelius' letter, and its "distance" from the master's doctrines. Porphyry's lists of the Enneads give each book its
  Workshop place in square brackets. Notes on the Symposium (Alcibiades 217a-219d, the ascent 210a-212a), the Iliad (8.282),
  the Odyssey (5; 24.60-62), Hesiod (Theogony 35), Herodotus (1.47), Diogenes Laertius (2.37) and the Apology (21a), the
  Phaedo (81c), the Gorgias (493a, 523e-524a), the Cratylus (400c), the Sophist (254b-255e), Nag Hammadi, and V.5, IV.3, II.3,
  III.1 and II.9 as the treatises the Life names.
- **E7: II.1 On the heaven, II.2 On the movement of the heaven (3,747) (done).** MacKenna's vol. II (1921, "Psychic and
  Physical Treatises", the Third Ennead printed before the Second) brought in as the Internet Archive's OCR of the Toronto copy
  `plotinuspsychicp00plotuoft` (`sources/mackenna-plotinus-1921/`, `mackenna-plotinus-1921` in `sources/manifest.json`), read by
  `tools/mackenna.py` into `texts/plotinus/mackenna-1921.json`; the tool now also reads a chapter number "6-," and a running
  head whose page number the OCR lost ("lib PLOTINUS"), and takes each treatise's first page from the next running head (II.1
  begins on p. 143, which prints no number). II.1 in 8 chapters, 25 paragraphs, 18 flags, 22 notes; II.2 in 3 chapters, 9
  paragraphs, 12 flags, 7 notes; MacKenna's chapters are Volkmann's. E.g. MacKenna has the heaven "not extend so low as to the
  moon" where the Greek says it ends there, "the superiors from which the celestial fire depends" for some other element in
  the heaven, "Celestials" for daemons, "some effluence from the Divine Reason" for "a little from reasoning", "Plato accepts it
  as indicated by all the appearances" for the Timaeus' likely account, "still higher heavenly bodies" for the rest of the
  heaven, the soul for "what is spherical in us" (the head, Timaeus 44d), a "common centre" for each star's own, "the custom"
  for what the soul has ordered, and he reads ἐκεῖ ("there", a place in the heaven) as the intelligible "There". Hard places
  flagged: "not continuous" (II.2.1), "it does not have it alone" (II.2.2), and whether II.2.3 names one higher power or two.
  Notes on the Republic (530a-b), the Statesman (269d-e), Heraclitus (B6), Aristotle's fifth body (On the Heavens 268b-270b),
  his toiling soul and Ixion (284a), flame as boiling (Meteorology 340b), the Timaeus (31b-32b, 33a, 36d-e, 39b, 40a-b, 41a-d,
  42d-43a, 44d, 45b, 58c-d, 59b, 60b-61c), the Laws (897c-898b), Homer's ἀμφαγαπάζεσθαι (Iliad 16.192), the Metaphysics'
  "hang from him" (1072b13-14) and the Sophist (248e-249d). For later milestones: MacKenna's vol. II as the tool reads it
  has other chapter counts than Volkmann's in III.3 (4 for 7), III.5 (10 for 9), III.8 (10 for 11) and II.9 (10 for 18, for
  E34); each milestone checks its treatises in the scan and names his chapters with `@older` where they are not Volkmann's.
- **E8: II.3 Whether the stars are causes (4,489) (done).** 18 chapters, 46 paragraphs, 47 flags, 34 notes, beside MacKenna's
  vol. II (pp. 159-177), whose eighteen chapters are Volkmann's. E.g. MacKenna has the cold star in opposition "to the cold"
  where the Greek says to the hot, "zeniths" for the astrologers' four centres, "periods" for the years the risings count,
  "virtue the unconquerable" for Plato's virtue with no master (Republic 617e), a "mighty spirit" for the Symposium's great
  daemon (202d-e), the star's will "transmitted" through the body where the Greek has it look to the best, the "Thought of
  the First Principle" and "the Idea which belongs to a Principle" for the soul's standing as a principle, "a powerful inner
  impulse" for the soul's capacity to be affected, a gap in the text ("ambition ... in love . . .") where Volkmann has none,
  "the extreme of wickedness" for knavery, "hindering its own life" for discontented with it, a clash of principles for
  matter shaken (Timaeus 52e-53a), and "Thought-Forms" for the forming principles that chapter 17 says are not thoughts.
  Hard places flagged: the fiery star's sufficiency (II.3.5) and what "it" is that the other things follow (II.3.9). Notes on
  the astrologers' centres, aspects, houses, sects and risings (Ptolemy, Tetrabiblos I.4-7, III.10), the planets' Greek
  names, the myth of Er (Republic 611c-612a, 616c-620e), the Timaeus (28a-29a, 37d, 41c-d, 42a, 69c-d, 70a-71b), the
  Theaetetus (176a-b), the Symposium, the Phaedrus (246a-b, 246e-247a, 248a), the Critias (109b-c), the Phaedo (109c), the
  Menexenus (246e-247a), the Hippocratic On nourishment (23), Aristotle's Physics (194b13) and Metaphysics (1072b14), Homer
  (Iliad 5.302-304, 8.556; Odyssey 8.266-366) and Chrysippus' bedbugs (Plutarch, Stoic self-contradictions 1044d). The
  Workshop's Greek of II.3.18 has a damaged word ("δἑ??ʼ" for δεῖ), noted on its paragraph.
- **E9: II.5 On what is potential and what is actual, II.6 On substance, or on quality, II.7 On complete blending, II.8 On
  sight (4,430) (done).** 13 chapters (5, 3, 3, 2), 29 paragraphs, 39 flags, 22 notes, beside MacKenna's vol. II (pp. 196-214),
  whose chapters are Volkmann's. E.g. MacKenna has matter unable to annex "a visible outline" where the Greek says it cannot
  even be coloured, matter "remoter (from Real-Being)" where it settles last, "the unchanging substratum" for matter kept
  indestructible, "a temperament" for Aristotle's settled state (ἕξις), the power acting "by virtue of Actuality (the
  abstract)" where it acts from itself, "a capacity for education" for the grammarian, "Reality" for substance (οὐσία) and a
  certain "diminution" where the Greek says "perhaps", "lighting" for whitening, "receive matter" where body gives and takes,
  "how we came to say" for the opponents' claim, "that other Principle in man" for the principle in intellect, and "salience
  and recession" for sight going over the parts. Hard place flagged: taste's strength "by accident" (II.8.1). Notes on
  Aristotle's potency and act (Metaphysics IX, XII.7, XII.9; On the Soul II.5-6; Physics VIII.4; Nicomachean Ethics II.1;
  Categories 8), the fifth body, the Timaeus' metals as water (58d-59c) and visual ray (45b-d), the Sophist's greatest kinds
  (254b-255e) and non-being (257b, 258b), the Stoics' complete blending (Diogenes Laertius VII.151; Plutarch 1078e),
  Aristotle's drop of wine (On Generation and Corruption I.10, 328a23-28), Alexander's On mixture, and Euclid's Optics.
- **E10: III.1 On destiny (2,648) (done).** 10 chapters, 23 paragraphs, 27 flags, 11 notes, beside MacKenna's vol. II
  (pp. 1-10), which prints the Third Ennead first; his chapters are Volkmann's. E.g. MacKenna has "this compromise between
  evil and accidental circumstance" where the Greek blends choice (προαίρεσις) with chance, "the philosophic life" for being
  wise, stars that "wreak vengeance, as for a wrong" where they are "afflicted", "personal action becomes a mere word" for
  "what is up to us" becoming a name, "the augur" for those who know the stars' grammar, "unwarranted slantings" hiding
  Epicurus' swerve, "Real Being" for the things that are, the soul set "at the crest of the world of beings", "bodiless and
  therefore supreme" where the soul is master of itself while it is without a body, "a future husband" where husbands and
  wives are married, "intellectual" labour where the Greek has labour or craft, and a "special organic aptitude" said to be
  "more immediately" where the Greek has "a little further off". Notes on Epicurus' swerve (Lucretius II.216-293; Cicero, On
  fate), the Stoics' destiny, chain, ruling part, management and seed-principles (Stobaeus, Aetius, Diogenes Laertius), the
  astrologers' centres and the Airs, waters, places, impressions and impulse (Chrysippus' cylinder, On fate 42-43),
  Aristotle's voluntary and "up to us" (Nicomachean Ethics III.1-5), and "the alone" of VI.9.11.
- **E11: III.2 On providence, first part (6,582) (done).** 18 chapters, 54 paragraphs, 64 flags, 30 notes, beside
  MacKenna's vol. II (pp. 11-35); his chapters are Volkmann's, so no @older. E.g. MacKenna has "the meeting ground of
  Necessity and divine Reason" where the Greek has the Timaeus' intellect and necessity, "the divine Realm imposes the one
  harmonious act" where the warring things themselves set up one harmony, vice "a lesson in right doing" for a pattern
  (παράδειγμα) of justice, "Men are not born divine" for not having become divine, "it is not abstract Spirit" for souls
  that are already living things, "Not even a God would have the right" for what it was fitting for a god to do,
  "executive power and right doing" for craft and justice, "celestial spirits" for daemons, "the hostility to partition"
  where reason is unlike in its parts, "the desirable" for the beautiful, stars "in the ears" where the Greek has the
  face, "the furnaces of craftsmanship" for Hephaestus' art, "this bandit war" for the undeclared war, man "a futility"
  for a toy, a "pantomimic dancer" aiming at pattern where the dancer's art moves him, and actors "having the right to
  add something" where the Greek doubts the need for them. Notes on the spontaneous and the Gnostics' evil craftsman,
  Timaeus 47e-48a and 29e, Laws X 902e-905b, Republic X 617e (Lachesis), Theaetetus 176a, Chrysippus on goods and evils
  (Gellius VII.1) and on bugs (Plutarch 1044d), Laws IX 872d-873a (the mother-killer born a woman), Adrasteia (Phaedrus
  248c), the undeclared war (Laws I 626a), the plaything of god (Laws VII 803c-804b), Heraclitus fr. B8 and B51, and
  Hephaestus' living statues (Iliad XVIII.417-420).
- **E12: III.3 On providence, second part, III.4 On the daemon allotted to us (4,044) (done).** 13 chapters (7 and 6),
  43 paragraphs, 55 flags, 24 notes, beside MacKenna's vol. II (pp. 36-52). The scan's OCR lost his chapter numbers 5 and
  6 of III.3 and ran 7 into the text, so his chapter 4 (p. 39) holds the Greek's 4 to 7 (@older 4); his III.4 is
  Volkmann's. E.g. MacKenna has the higher world "cannot be dependent upon the World of Sense" where the Greek says it is
  not cut off from it, "Universal interdependence, there could not be" where all things must not be cut off from one
  another, "Correspondences" for proportion, "virtue with right action" for virtue and justice, "the scriptures of Nature"
  for natural letters, the debt "the heavier" where the giver is the more to be welcomed, "drive him down the troubled
  paths" for muddy water, "god-serving" for dear to god, "spirit" for the daemon throughout, "takes possession of the
  human being at birth" for the Phaedo's allotted while living, "the spirit of the previous life pays the penalty" where
  the man does, "the Divine Intellect" for the intelligible, "forms varying with the variety of place" for different
  times, "sample lives" for the Republic's patterns of lives, and "Man cannot cease to be characteristically Man" where
  the part cannot become other than it is. Notes on the episodic plot (Poetics 9), the general (Metaphysics XII.10),
  Helen and Idomeneus (Iliad III.230-233), proportion as bond (Timaeus 31c-32a), the stars as letters (II.3.7), Phaedrus
  246b, the lives of beasts (Phaedo 81e-82b, Republic X 620a-b, Timaeus 91d-e), the daemon (Phaedo 107d, Republic X
  617e, 620d-e, Timaeus 90a), the stars of souls (Timaeus 41d-42b) and the spindle (Republic X 616c-617d).
- **E13: III.5 On love (3,531) (done).** 9 chapters, 34 paragraphs, 39 flags, 26 notes, beside MacKenna's vol. II
  (pp. 53-66). His chapters 1 to 8 are Volkmann's; his chapter 10 (p. 66) begins at "myths must divide into times", inside
  the Greek's chapter 9, so that chapter is shown with his 9 and 10 (@older 9 10). E.g. MacKenna has "Celestial Spirit",
  "Celestials", "Spirits" and "Supernals" for the daemon, "from a point of view entirely his own" where Plato wrote much
  in many places, "the good" for the self-controlled, "the consistent total of the good" for the Pythagorean column,
  "an attenuation" for the beauty here as the plaything of the beauty there, "minister of beautiful children" and
  "Dispenser of beautiful children" for the Phaedrus' overseer of beautiful boys, "Possession" for Poros (Resource) and
  "Resource" for his mother Metis (Cunning), a "Person" for the reality love is, the soul looking "towards the very
  Highest" for the first being, "Our only escape" for one more absurdity, "the representative" for the trace of a soul,
  "a goad" for the gadfly, "blank possession" for the daemon left idle, a triangle "made up of two right angles", Zeus
  "the highest" where he is ranked by the better in him, "kneaded out" for unfolded, the reason-principle "breaking into"
  the garden for flowing in, and soul "breaking away" from intellect where it has its reality from it. Notes on the
  Symposium (180d-181c, 202d-203a, 203b-e, 206b-208b), the Phaedrus (242d, 246e, 249d-251b, 255c-d, 265c), Hesiod's
  Aphrodite (Theogony 188-200), Kronos as intellect (Cratylus 396b), the Pythagorean columns (Metaphysics I.5,
  986a22-26), Plutarch's Eros as the world (On Isis and Osiris 374c-d), the Epinomis' daemons (984b-985b), intelligible
  matter (II.4), the triangle (Posterior Analytics I.4), Zeus' royal soul and intellect (Philebus 30d), the third
  libation, Hera's star ([Aristotle], On the cosmos 392a27-28) and the Timaeus read as told in time (On the heavens I.10).
- **E14: III.8 On nature, contemplation and the One, III.9 Various considerations (5,035) (done).** 14 chapters, 41
  paragraphs, 70 flags, 33 notes, beside MacKenna's vol. II (pp. 119-141). His chapters 1 to 9 of III.8 are Volkmann's; his
  tenth (p. 133) runs on through the Greek's eleventh ("Another approach"), so the eleventh is shown with his 10 (@older 10).
  The Greek of III.9 has three chapters, as he has; his third is cut into lettered notes. E.g. MacKenna has "The case of
  Man" for "this later" (action), "conscious representation" for imagination, the living principle "brother ... to that
  which gives mere shape" where it is brother to the one that made the shape and has the same power, "Wholly and solely ?"
  for an answer, "planning" for looking into, "mathematicians" for geometers, "trace" for the shadow of contemplation,
  "complement" for consequence, the craft in a child made "a minor science in the student", "the Supreme" and "the Highest"
  for intellect that began as one and unrolled, "pregnant" for weighed down, "lovely abundance" for the beautiful boy who
  is fullness (Kronos), the rivers one "within" the spring where they have already come out of it, "a common accident" for
  readers' differing understanding of the Timaeus, the soul looking "downward" for its second glance, and the thinking of
  the Good denied majesty where the Greek grants it. Notes on play (Laws VII 803c-804b), the Stoics' nature, the
  wax-modellers (Cicero, On the nature of the gods II.57-58), seminal principles, the Phaedrus' charioteer (246a-254e) and
  the written word that cannot help itself (275e), Parmenides fragment B3, the heap (Metaphysics VII.17), the Good beyond
  being (Republic VI 509b), like known by like, the Parmenides' first hypothesis, Kronos as intellect (Cratylus 396b), the
  Living Being of Timaeus 39e, the Second Letter's third (312e), the body in the soul (Timaeus 34b, 36d-e), intelligible
  matter, the Sophist's motion and rest (254d) and the unmoved mover (Metaphysics XII.7).
- **E15: IV.1 On the being of the soul, first part, and IV.4 chapters 1-17 (4,656) (done).** MacKenna's vol. III (1924, "Plotinus
  on the Nature of the Soul, being the Fourth Ennead") brought in: the Internet Archive's OCR of the Toronto copy
  `plotinustranslat03burkuoft` (`sources/mackenna-plotinus-1924/`, `mackenna-plotinus-1924` in `sources/manifest.json`), read by
  `tools/mackenna.py` into `texts/plotinus/mackenna-1924.json`. The OCR lost five of IV.4's chapter numbers (15, 17, 31, 38, 41:
  a blank line where the scan prints them); the volume's "lost" list lets the next number begin its chapter, and the lost
  chapter's text runs on in the one before. 18 chapters, 55 paragraphs, 54 flags, 45 notes; IV.4 is the first treatise done in
  parts, shown as "chapters 1-17 of 45 so far". MacKenna's IV.1 is Volkmann's (one chapter; Henry-Schwyzer's IV.2). His IV.4
  chapters are Volkmann's, but the Greek's 7th begins with the last two sentences of his 6th (@older 6 7), and his 14 and 16
  hold the Greek's 15 and 17 (@older 14, @older 16). E.g. MacKenna has "the world of unembodied spirits" for souls without
  bodies, "an act of philosophic virtue" for practising philosophy, "a reading" for the soul's settling on what intellect has
  divided, "falls in love with its own powers and possessions" for embracing what is its own, depth turned round, "the same
  principle of penetration" for "in proportion to memory and imagination", "by way of analogy" for conjecture, a soul
  "descended from the Intellectual region" where the Greek has it rise "from here", eternity for the stars' "always", lyre
  strings "struck in tune" for moved in sympathy, "chief in producing" for the wisest craftsman, "conferring grace" for
  ordering, nature acting on soul where it acts on matter, intellect possessing what is beyond being, and he leaves out the last
  sentence of chapter 17. Notes on the Timaeus' undivided and divided soul (35a), division and collection (Phaedrus 265d-266b),
  Aristotle on memory (449b15-28) and on knowing as matter taking form, the Stoic impressions, the cave's climb (Republic VII
  515e-516b), souls in the stars (Timaeus 41d-42b, Apology 41a-c), Hesiod's good order, the dance of the stars (Timaeus 40c),
  the music of the spheres, Zeus' kingly soul (Philebus 30d, Phaedrus 246e), nature and the doctor (Physics II.8), knowing as
  coming to rest (Physics VII.3), the Epicureans' troubled gods, the wax (Theaetetus 191c-e), Aristotle's time that encompasses
  (Physics IV.12), the Good beyond being (Republic VI 509b), the assembly's din (Republic VI 492b-c) and the city in heaven
  (Republic IX 592b).
- **E16: IV.4 chapters 18-31 (5,058) (done).** 14 chapters, 46 paragraphs, 26 flags, 26 notes; IV.4 now shows as "chapters 1-31
  of 45 so far". MacKenna's chapters 18-30 are the Greek's; the OCR lost his number 31, whose text runs on in his 30, so the
  Greek's 31 is shown with it (@older 30). E.g. MacKenna has the body we sink into as "the true man" where Plotinus blames that
  mistake, "immune from evil" for escaping everything, "longing for unison" where the compound announces its pleasure, the
  imaging faculty where the Greek names none, "fair" for grey-eyed, "alone is competent" for the soul whose task is to provide,
  the child's experience made nature's where the desire is finished in her, flesh and blood given to the earth where the Greek
  denies them to the stars, Nature for the soul alone, "complete detail" for the object's own size, the earth as the moving
  region seen by the "stationary" where the fixed stars see the planets, the soul's character for the soul of the All's,
  "their function" for turning to us, "the spiritual order" for pneuma, the earth ensouled where the plants are like flesh,
  Hestia "(Earth-Mind)" and Demeter "(Earth-Soul)", "outside combinations" for the beasts' temperaments, the soul "not inbound
  with body" where the injustice is not about the body, "some law" for Democritus' convention, the sky for the air, dissolution
  for moving, a memory given to Demeter and Hestia, and "a doom from the All" for its judgement. Notes on the soul of the All
  and the earth as eldest god (Timaeus 34b, 40c), the delight of sight (Metaphysics I.1), the proportional mean (Timaeus
  31c-32a), sight in a void (On the soul II.7), the All without eyes (Timaeus 33c), light as the act of the transparent,
  Hestia (Phaedrus 247a) and Demeter (Cratylus 404b), the spirited part and its alliance with reason (Republic IV), heart and
  liver (Timaeus 70a-71b), Aristotle's two definitions of anger (On the soul I.1), ὁμοούσιος, co-ordinate division
  (Categories 13), the seminal principles, ψυχαγωγία (Phaedrus 261a) and the astrologers' hot and cold planets (Tetrabiblos
  I.4).
- **E17: IV.4 chapters 32-45 (4,555) (done).** 14 chapters, 48 paragraphs, 53 flags, 30 notes; IV.4 is complete, and the reader
  no longer marks it as partly done. MacKenna's chapters are the Greek's, but the OCR lost his numbers 38 and 41: his 37 holds
  the Greek's 38 (@older 37) and his 40 the Greek's 41 (@older 40). E.g. MacKenna has "blind elements" for bodily causes, a
  "lower" soul where the Greek says another, "animal spirit" for anger, the permanence of the All in varying forms where its
  staying is its moving, the relationship "the same" when the members change where the Greek makes the same figure another,
  the stars' power "from man to man", "the soul of Nature" for the sun's growing soul, "not necessarily accompanied by reason"
  for ἀνάλογον, "attention" for turning, "shame" for ugliness, virtue not "a matter of compulsion" for Lachesis' "virtue has
  no master", attractions and repulsions for Empedocles' love and strife, "no necessity" where justice follows the one who
  takes what he should not, "the Proficient" and "the Celestials", "the burgher" for the people of Erechtheus with Plato's
  next words added, "the misfortune" for the premises of the affection, "transpose the cords", "wisdom" for order, and the
  pure soul coming down where the Greek has it go up. Notes on sympathy (the Stoics), Heraclitus' rest in change, the parts
  made for the whole (Laws X 903b-d), the stars' dance (Timaeus 40c) and signs (II.3.7), the running gods (Cratylus 397c-d),
  the trine, the mark of being (Sophist 247d-e), the lapidaries, Republic X 617e, the lawgiver (Laws X), Empedocles (B17),
  Olympius (Life 10), charms (Republic III, Laws II), the lyre strings of IV.4.8, Heraclitus' bow and lyre (B51), the liver
  (Timaeus 70a-71d), Adrasteia (Phaedrus 248c), daemons (Symposium 202e-203a), Alcibiades I 132a and Iliad II.547, οἰκείωσις,
  going out of life (I.9, Phaedo 62b-c), no one errs willingly (Protagoras 358c-d), Euripides' soundless path (Trojan Women
  887-888), the puppet's cords (Laws I 644d-645a), the myth of Er, and punishment as medicine (Gorgias 478d-480b).
- **E18: IV.5 On sight, IV.6 On perception and memory (4,675) (done).** 11 chapters, 48 paragraphs, 46 flags, 34 notes.
  MacKenna's chapters are the Greek's in both treatises (8 and 3); his running head "PROBLEMS OF THE SOUL" was caught by the
  OCR inside his IV.5.5 and IV.5.7, which the flags avoid, and in IV.5.8 he gives a tentative rendering of "an obscure and
  corrupt place" in square brackets. E.g. MacKenna has the body between "a favouring circumstance" where the Greek says it
  contributes nothing, clay for earthy bodies, the man who also sees on "the side opposite" where the Greek has him in front of
  us, "a certain degree of identity" for like affection, "scarcely less sensation" where the Greek says less but in measure,
  trees and roots for the logs of a fire, "no reason for the existence of light" for no need of it, "We may hold one thing
  certain" for a doubt raised, "the greater laws, the spiritual" for necessities of soul, understanding for the light within
  the eye, "the sole attractive agent" for bare distance, "mind" for soul, "sent pulsing outwards" for before the air is
  poured away, "the same conclusion" for a question left open, light that "would vanish" where the Greek says an affection
  would stay, "Perhaps" agreeing with the objection that light is no one's, light "in circuit", "an incipient on which colour
  might be formed" for colouring over, "certainly" for perhaps, "light and colour" for colour, "mind and no mind" for soul and
  not soul, "attack" for directing the sight, "the living object" for the visible, "every concept ... the soul about its Act"
  where the soul is each intelligible, the soul's nature made "one of the Beings of the Intellectual Realm", "besetting" for
  settling in, "more radiant" for more dimly, "long memory" for better memory, "leading indications" for reports, and "the
  dominant idea" for forms of make. Notes on Aristotle's transparent (On the soul II.7) and the thing laid on the eye, the
  torpedo (Meno 80a-c, History of Animals IX.37), like affected by like, the three theories of sight (Timaeus 45b-46a, the
  Stoics' staff in Diogenes Laertius VII.157, Epicurus' images), the one living being (Timaeus 30b-d), ἀντιπερίστασις
  (Timaeus 79e-80c, Physics IV.8, VIII.10), beacons (Agamemnon 281-316), the back of the heaven (Phaedrus 247b-c), the wax
  (Theaetetus 191c-d, On the soul II.12), sound (On the soul II.8), light as the transparent's activity (On the soul II.7)
  against double activity (V.4.2, V.1.6), the body's trace of soul (IV.4.18-20), the mirror (I.4.10, IV.3.12), the All that
  needs no eyes (Timaeus 33c), nothing outside the heaven (On the heaven I.9), the Stoic imprint (Diogenes Laertius VII.45-50),
  the wax block (Theaetetus 191c-196c, 194e-195a) and Aristotle's memory (On memory 449b6-8, 450a27-b11, 451a18-453a14), the
  cave's shadows (Republic VII 515a-c), voice (Diogenes Laertius VII.55), V.3.1-6, recollection (Phaedo 72e-76e, Phaedrus
  249b-c), the bewitched soul (Phaedo 81b), virtues made by exercise (Republic VII 518d-e) and the writing tablet (On the soul
  III.4).
- **E19: IV.8 On the descent of the soul into bodies, IV.9 Whether all souls are one (4,047) (done).** 13 chapters, 45
  paragraphs, 35 flags, 22 notes. MacKenna's chapters are the Greek's in both treatises (8 and 5). E.g. MacKenna has Plotinus
  "Lifted out of the body" where the Greek has him wake, Heraclitus' weariness of "always beginning again" for being ruled,
  Empedocles "in slavery" to strife for trusting in it, the particular body "appropriately placed" where the Greek contrasts it
  with the All, "absorbs much" for being filled with the nature of what is done, "a veritable descent" for an inclination,
  the soul "remaining ... an Intellectual-Principle" where the Greek says it did not remain intellect, an appetite "for the
  divine Intellect" for an intellectual longing, "an actual presence" for difficulty, "innocency" for freedom from harm,
  "memories" for recollection, "both spheres" for the amphibians, a "voluntary" descent for completing the All, an
  "external" law for an everlasting one, the soul's "Tolma" (from V.1.1), "sin" for wickedness, a power "native to soul" for
  the prior's, "rest in the Supreme" for what it is to be there, "without contact" for knowledge before experience,
  "inspection" for contemplation, "individual choice" for discursive thought, "an artistic conception" for art that does not
  deliberate, pleasure as "lure" for deception, statements for Plotinus' question, souls that "belong to" the All's for
  coming from it, "the centralising unity" for the soul in the whole, "transmission" for sympathy, "active ... inactive" for
  moving and standing, "due only to some unity" for perhaps the cause of love, sensation in the All for the nourished part,
  the body-soul "supposed" for a hypothesis refuted, "points" for being spent, "the one-many", "value" for being empowered,
  and "separate" for each. Notes on Life 23, Heraclitus (B60, B84a-b, B90, B101), Empedocles (B115, B120), the bond, tomb
  and custody (Cratylus 400c, Phaedo 62b, 82e), the cave (Republic VII 514a-517b), the wings and periods (Phaedrus 246c,
  248c-249b), the lots (Republic X 617d-620e), the Timaeus' blessed god, mixing bowl and sowing (29e-30c, 34b, 41a-42d), the
  star-bodies (Timaeus 36d-e, 40a-b), the body that hinders (Phaedo 65a-66d), the intelligible place and Living Being,
  recollection, Xenocrates' reading of the Timaeus, the judgements (Phaedo 113d-114c), potency and act, the ungrudging good
  (Timaeus 29e), matter (II.4, III.6), the undescended soul against Proclus (Elements of Theology 211), art that does not
  deliberate (Physics II.8), the divided and undivided (Timaeus 35a), magic (IV.4.40-44), the ring (On the soul II.12), and
  geometrical analysis (Pappus, Nicomachean Ethics III.3).
- **E20: V.4 How what comes after the first comes from it, V.5 That the intelligibles are not outside intellect (5,314)
  (done).** 15 chapters, 58 paragraphs, 48 flags, 42 notes. MacKenna's vol. IV (1926, the Fifth Ennead) brought in: the
  Internet Archive's OCR of the Toronto copy (plotinustranslat04plotuoft), kept as received in
  sources/mackenna-plotinus-1926/, read by tools/mackenna.py, which now reads a treatise title over two or three lines and
  "THE NINTH TRACTATE" (the 1917, 1921 and 1924 files are unchanged). MacKenna's chapters are the Greek's in both treatises
  (2 and 13). E.g. MacKenna makes "beyond being" the one thing said of the first where the Greek says even "one" is false
  of it, drops the condition that the first is simple and one, reads "service" for goodness, "the Power towards all" for
  the power of all things, the dyad alone for intellect, the other intelligible "following upon" intellect for the first
  it comes after, "the sum of being" for the first when it is most what it is, "potentiality" for power, "the universe of
  things" for knowledge that is its objects, "predicates" for the Stoics' sayables, an "unknown sculptor or graver",
  "belief is our lief" for opinion that receives, a doubled truth, "the Godhead entire" for all the beings, an "ineffable"
  beauty before the king, "by all reason" for by nature, the Zeus sentence as an interpolation, "the centre", "providing
  duration", the dyad as extension, "the universe" for what was begotten, "(the weaker)" and "(the stronger)", a refusal
  to define for the way to see, "the untenable" for the unspeakable, "silence" for clearness, a "lower Nature" for the lit
  intelligibles, "here ... beyond" for within and not within, intellect's self-sight dropped, "(by its divinest power)",
  "otherwise" in the containment, "pointed off" for scattered, "God" for the One everywhere, "linked members" for hanging
  parts, thinking that reaches the One where the Greek says it loses it, ordinary vision for a command, "its Being" for the
  One beyond being, "the thing of extension" for a quoted saying, "sophisticated", struggling "venomously for" beauty for
  rivalling it, "violence" for amazement, "the child" for the beloved, "any other universe", "goodness" for beauty in what
  must not be added, "philosophy" for we, the better element that "participated", and "the Primarily existent" for the
  Good above beings. Notes on Life 4, 5 and 18 (Porphyry's argument that the intelligible is outside intellect), the
  Republic's beyond being and immense beauty (509a-b), the Parmenides' hypotheses (137d-145a), the ungrudging maker
  (Timaeus 29e), On the soul II.4 and III.4-7, the indefinite dyad (Metaphysics A.6), co-perception, double activity, the
  Sophist (248e-249a, 254d), Posterior Analytics, the sceptics, the Stoics' imprints and sayables, double ignorance, the
  Seventh Letter (341c-d, 343b-c), the Persian king (On the cosmos), Hesiod's gods, the Second and Sixth Letters, the
  Laws' measure (716c), substantial number (VI.6), the small change (Republic VII 525e), comparable units (Metaphysics
  M.6-8), the Cratylus' ousia and hestia (401c-d), the Pythagoreans' Apollo (Plutarch), birth-pangs, a "this" (Categories
  5), light (Republic VI 507d-508a, On the soul II.7), the pressed eye (On sense 2, Timaeus 45b-c), the sudden sight
  (Symposium 210e), Ocean (Iliad VII.421-422), Homer's might, intellect in love (VI.7.35), the cosmos in soul (Timaeus
  36d-e), the Parmenides' one that neither moves nor stands, dreamers (Republic V 476c-d), divining the good and seeming
  good (Republic VI 505d-e), the Phaedrus' pains of love, Agathon's praise (Symposium 198d-199a), genus and difference
  (Topics VI.6), and the Stoics' indifferents.
- **E21: V.7 Whether there are forms of individuals, V.8 On intelligible beauty (5,221) (done).** 16 chapters, 63
  paragraphs, 54 flags, 60 notes. MacKenna's chapters are the Greek's in V.7 (3) and in V.8 from 1 to 12; the OCR of his
  vol. IV lost his number 13 of V.8 (two blank lines where the scan prints it), so its text runs on in his 12 (@older 12,
  and "V.8.13" in vol. IV's "lost" list in tools/mackenna.py). The first page read 75 because the OCR set p. 73's running
  head before the treatise's title and misread the next head as "74 PLOT1NUS"; tools/mackenna.py now takes "PLOT1NUS" as a
  running head, which puts V.8 on p. 73 and takes six stray heads out of MacKenna's V.1, V.2, V.3 and V.8 (the 1917, 1921
  and 1924 files are unchanged). E.g. MacKenna makes the world's period a "soul-period", denies number to the infinity
  that the Greek puts in what has no parts, makes one parent "the source", turns an observation into "Difference
  everywhere is a good", reads "evil" for ugliness, gives the craftsman a model, makes the number left to chance give
  each its principle, adds "unfailing"; in V.8 the "Father" to be understood where the Greek says brought to mind, "the
  realm of magnitudes", the craftsman's hands, all art for music, "the Matter of beauty", an "elaboration upon the
  presented form", "the truly personal", "remember" for recollect, "proficient" for good, the gods as sun and stars,
  "see and know", "in breadth and depth", a correction about the stars, "unchangeable" for unwearying, "the discussion" for
  the name, a wisdom the craftsman embodies, "as we assume", "our apparatus of science" for propositions, "detailed
  willing", a condition put on existing, "looked outward", "no obstacle", a maker who makes nothing, "a total of good",
  being anything wholly, a "Beauty sprung from this world", "inborn sense of Matter", "distinction by state", the bodies'
  failure for our inexperience, "passable", "demigods", "Moral Wisdom", "light" for colour, "it is but", "multiple unity",
  "still he is pure", "the separated life", the other seer dropped, a question made an objection, knowledge and its object
  for knowledge and knower, "aware of none", "a universe" for all things, "the Supreme" for what always was, the link and
  the bond, and "image" for trace. Notes on Socrates himself (Metaphysics B.2), Pythagoras' lives, the
  Stoics' return (Nemesius 38), specific differences (Topics VI.6), Generation of animals, Airs, waters, places, the
  Academics' twins (Academica II), Leibniz, the Stoic unrolling, Letter VI, Zeuxis (On invention II), Metaphysics Z.7-9,
  Republic X and Physics II.2, Phidias (Orator 8-9), Iliad III, the pupil (II.8, IV.5), Narcissus (I.6.8), the ladder and
  Socrates' Silenus (Symposium), recollection (Phaedrus 249c-250d), soul as matter (V.9.3), beauty beyond words (Republic
  VI 509a), the gods' round (Phaedrus 247-248), Homer's easy-living gods, movement and rest (Sophist), Lynceus, Kronos and
  koros (Cratylus 396b), Justice beside Zeus (Hesiod, Laws IV), the statues, the knowledge not other in another (Phaedrus
  247d-e), the forms as beings, the Egyptians' signs (Plutarch, Clement), the Timaeus' planning maker, the sudden sight
  (Symposium 210e), matter as last form (II.4, III.8.4), the soul that travels on high (Phaedrus 246b-c), the ecliptic and
  unproved principles, the Good beyond beauty (I.6.9), the admiring craftsman (Timaeus 37c-d), the Gnostics (II.9), the
  sphere and the prayer (Timaeus), being and beauty (I.6.6), Zeus' procession (Phaedrus 246e-247a), the cave, the
  undescended soul (IV.8.8), Phaedo's true earth, nectar (Symposium 203b, VI.7.35), possession (Phaedrus, Ion), VI.9.10-11,
  co-perception (V.4.2), I.4.10, Hesiod's Kronos (Theogony), the Timaeus' "was" and "will be", Aphrodite as soul (III.5),
  Alcibiades I, and the intelligible place (Republic VI-VII); the summaries place both in Life 4 and 5.
- **E22: VI.1 On the kinds of being, first part, chapters 1-15 (4,866) (done).** 15 chapters, 76 paragraphs, 31 flags, 34
  notes; VI.1 is marked "chapters 1-15 of 30 so far". MacKenna's vol. V (1930, the Sixth Ennead) brought in: the Internet
  Archive's own scan (plotinusononegoo0005step; no Toronto copy is online), kept as received in
  sources/mackenna-plotinus-1930/ (manifest entry, fetched.json), read into texts/plotinus/mackenna-1930.json (the 1917 to
  1926 files unchanged). Its OCR is rougher than the others, so its VOLUMES entry turns on four rules of its own: odd running
  heads are any line of capitals ending in a page number ("VIS ON THE KINDS OF BEING 3"), with an unreadable or out-of-order
  number taken as the next page; the numbers at the foot of first pages are not read, and a line of five characters or fewer
  standing alone (signatures "B", "Cc", scan noise) is taken out; chapter numbers the OCR misread are listed as read ("on" for
  3, "a." for 7, "Q." for 9, "ids" for 11, "z2." for 12, "oy" for 15 ...); chapter numbers it lost altogether (2 and 5) are
  listed by their first words. With these, all 30 of VI.1's chapters are found, on the right pages, and his chapters are the
  Greek's (no @older). The other treatises of vol. V are not yet read right (VI.2 to VI.9 show one or a few chapters each,
  and VI.7's "SEVEN:EH, TRACTATE" heading is missed): each milestone that needs one adds its misread and lost numbers to the
  lists. The volume's Acknowledgements say B. S. Page translated VI.1 to VI.3 and revised the rest, so the volume's
  translator is "Stephen MacKenna and B. S. Page", the flags' whys in VI.1 name Page, and a note on VI.1.1 says so; the
  reader still labels the flags "MacKenna". E.g. Page has "the Supreme" for the things that most are, has the numbers in
  things measure as outside, not inside, makes the measured things quantities where the Greek says they are not, adds
  "verbal suggestion", "the total figure" for the soul's multitude, "posterior" and "prior" for the relatives named second
  and first, "victims of words" for speaking falsely, gives father and son the life that belongs to agent and patient,
  "depraved" for ugly, "Quantities" for qualities, "a natural possession of the mature human being" for what virtue
  acquires, "Being" for substance, "experience" for affection, "emotion" for the spirited part, "Date" for the when, "acts"
  for putting one thing in another, and drops the chapter heading "where, as in the Lyceum". Notes on Aristotle's ten
  (Categories 4) and the Stoics' four, his survey of predecessors (Physics I.2), no common kind over prior and posterior
  (Metaphysics B.3), homonyms and synonyms (Categories 1), first and second substance, "said of" and "in" a subject,
  "receives contraries" (Categories 5), the Heraclids and pros hen (Metaphysics Γ.2), quantity, speech, equal and unequal
  (Categories 6), voice as a blow (On the soul II.8), time and soul (Physics IV.11, IV.14), relatives (Categories 7), the
  Phaedo's causes, the four species of quality (Categories 8), II.6 on heat, the dropped "not" in 11 (rare and dense), the
  soul's three parts (Republic IV), Delphi the navel (Republic IV 427c), the senses of "in" (Physics IV.3), acting (Categories
  9) and motion among the greatest kinds (Sophist 254d). The terms check needed "like"/"likewise" for ὁμοίως.
- **E23: VI.1 chapters 16-30 (4,654) (done).** 15 chapters, 72 paragraphs, 23 flags, 28 notes; VI.1 is complete (no
  chapters_done; the treatise summary already covered 16-30). Page's chapters 16-30 (vol. V pp. 21-38) are the Greek's; no
  source work. λόγος keeps its one name, "forming principle", as in E22 (terms-greek.json has no entry for it yet): Page's
  "Reason-Principle" (VI.1.20), "rational law" (26) and "Seminal Principles" (29) are flagged as his. E.g. Page drops the
  perfect of "has already cut" (16), gives the analogy to "our critic", divides motion where the Greek divides "being
  moved" (17), makes thought a "faculty" (18), pain an "emotion" and the one who means to hurt a Passion (19), adds "(and
  becomes his Act)" to the learner (20), makes the thing bettered "an agent", turns a question into "Surely", and joins
  better and worse into one kind of being acted on (21), writes "aimless" for free-standing, "powers" for the walking and
  thought had, "selfgathered" thought (22), "Possession" for having (23), "Situation" for lying (24), "Qualities, States"
  for the qualified and disposed (25), "accidental mode" for coming together (26), "the living form" for the living being
  (27), "the Authentic Existent" for both together (30); and the scan reads "wails" for his "walks" (22). Notes on motion as
  incomplete act and "has already moved" (Physics III.2, VI.6; Metaphysics Θ.6), no first part of a motion, seeing complete
  at once (Nicomachean Ethics X.4), "as if change did not happen all at once" (Physics I.3), relatives (Categories 7), one
  motion of agent and patient (Physics III.3), happiness in a complete life, alteration (Physics V.2), bronze and tin, the
  desirable that moves (On the soul III.10), the ways of having (Categories 15), position (Categories 7), the Stoics' four
  and their "something" (Simplicius, Seneca 58, Sextus), the kind (Topics I.5), act before potency (Metaphysics Θ.8), the
  Stoic principles, body, god, soul and intellect (Diogenes Laertius VII, Cicero Academica I.39), the pantomime, II.4 and
  III.6 on matter, and the "fourth" kind of 29 that may be a slip for third.
- **E24: VI.2 On the kinds of being, second part (7,436) (done).** 22 chapters, 105 paragraphs, 59 flags, 56 notes; VI.2
  is complete in one milestone (no chapters_done), under a new @treatise block with its summary (the forty-third
  treatise; Plotinus' own five kinds, after Sophist 254d-255e). Source work first: tools/mackenna.py read only VI.2.1
  (vol. V p. 40); vol. V's lists now add VI.2's misread numbers ("of" 5, "Q." 9, "Io." 10, "oO" 11, "52:" 12, "17:" 17,
  "ai." 21, "22;" 22) and its lost 2 ("In asserting that Being is not a unity"), and a fifth rule, "stray", takes out lines
  that are not Page's: VI.2.1's "x." under the title, a library stamp ("WITH UNIVERSIT Y LIBRARY", "WITHDRAWN", p. 51) and
  the signatures G, H, I, K inside paragraphs. All 22 of Page's chapters are found on their pages (40-66) and are the
  Greek's; no @older. The kinds keep fixed names: being, motion, rest, sameness (ταυτότης, "the same"), otherness
  (ἑτερότης, "the other"), with "difference" kept for διαφορά, the difference that divides a kind; λόγος stays "forming
  principle" (and "account" where it is one, 4, 7, 16). Page's "Stability", "Identity", "Difference" and
  "Reason-Principle" are flagged as his. E.g. Page makes the substrate "pseudosubstance" (4) and soul "continuous" (4),
  has being "contain" one genus and the Parmenides' one being "the individual" (7), has intellect put apart what was
  together and its act "energy" (8), "the radiance of Being" for contact with it, makes the kinds fall short of being where
  they do not stand above it (8), calls the one a sixth kind "Admitted that not everything suffices" (9), the one "prior to
  number" (10), the good "a standard of perfection" and the one "identical with Goodness" (11), qualities "by analogy" for
  by a shared name (14), time compared with place where it is probably not there (16), "more suitably" for "if you like"
  (18), "Being has so created Intellect" for being as an intellect that has reasoned (21), Being "served by the
  domination of Intellect" for "without toil" (21), and "Intellect in our intellect" (22). terms-greek.json is unchanged.
  Notes on the Timaeus' always-being (27d-28a), the Sophist (244b-245e, 248e-249a, 250a-c, 254b-255e, 258d-e), the
  Parmenides' one being (142b-143a) and chopped-up substance (144b-e), Aristotle on being not a kind (Metaphysics B.3), on
  blending (On generation and corruption I.10), "being for a stone" (On the soul III.4), immaterial thinking (430a2-5), the
  hearth (Phaedrus 247a, Cratylus 401c-d), one not a number (Metaphysics Δ.6, N.1), the Stoics' bodies (Sextus, Seneca),
  the offshoot (Nicomachean Ethics I.6), good-formed (Republic VI 509a), like numbers (Euclid VII), the complete living
  being (Timaeus 30c-31b, 39e), the Philebus' unlimited (16e), and the Greek's count of "four" kinds (15, 19).
- **E25: VI.3 On the kinds of being, third part, chapters 1-14 (4,633) (done).** 55 paragraphs, 39 flags, 36 notes, under
  a new @treatise block with its summary of the whole treatise (the forty-fourth; the kinds of the perceptible); VI.3 is
  marked chapters 1-14 of 28. Source work first: tools/mackenna.py read only VI.3.1-2 (vol. V pp. 68-69); vol. V's lists
  now add VI.3's misread numbers ("4. ." 4, "ie" 7, "Q." 9, "Iz." 12; "II." already reads as 11) and its lost 3 ("How then
  do we go to work") and 5 ("These are incontrovertible facts"), and "stray" takes out "Te" under the title, a smudge at
  the foot of p. 68 ("—<———— eee"), the signatures L, M, N, P and the ";" on p. 74, each of which stands only there in the
  treatises. All 14 chapters are found on their pages (68-85) and are the Greek's; no @older; VI.1, VI.2 and the other
  volumes are unchanged. Fixed names as in VI.2: "otherness" for ἑτερότης, "the same and the other", rest, "difference"
  only for διαφορά, "forming principle" for λόγος (and "account" where it is the definition, 9); Page's "Stability",
  "Identity", "Difference" and "Reason-Principle" are flagged as his. E.g. Page makes vocal sound "speech" and its letters
  "element" (1), homonymous "analogous" (1, 2), the syllables "first-principles" that are "compounds" (2), substance's
  not being of another "not predicated" (4, 8), substance here "pseudo-substance" (5), place the limit of a "surrounding
  space" (5), the really white's being its "whiteness" (6), matter's falling-away from forming principle "a vain attempt"
  (7), "a certain white and white" into whiteness and the white object (9), the quantities "the only true qualities"
  (11), "the Absolute Great" (11), the up that has no down a condition (12), the arithmeticians "the objects numbered"
  (13), and the third increase a "dimension" (13). terms-greek.json is unchanged. Notes on the Philebus' letters (17b,
  18b-d), synonyms and homonyms (Categories 1), "in a subject" and second substance (Categories 2, 5), the difference not
  in a subject (Categories 5, 3a21-28), place and time (Physics IV.4, 11-12), being said in many ways (Metaphysics Γ.2,
  Z.1), the three lives (On the soul II.2-3), the four kinds of living beings (Timaeus 39e-40a), prior by nature and to us
  (Physics I.1), the elements' contraries (On generation and corruption II.3), great and small (Categories 6, 5b14-29),
  Heraclitus' apes (B82, Hippias Major 289a-b), no down in the All (Timaeus 62c-63e), the third increase (Republic VII
  528a-b) and figure as quality (Categories 8).
- **E26: VI.3 On the kinds of being, third part, chapters 15-28 (4,673) (done).** 65 paragraphs, 64 flags, 48 notes; VI.3
  is complete (no chapters_done; the summary already covered 15-28). Source work first: tools/mackenna.py found VI.3.15-16,
  with 16 running on to the end of the treatise; vol. V's "misread" now adds "<7:" 17, "IQ." 19, "2." 21, "223" 22 and
  "25. |" 25, and "stray" takes out "ce)" inside 21. All 28 of Page's chapters are found on their pages (68-106) and their
  starts are the Greek's; no @older. Fixed names as in VI.2 and VI.3.1-14: "otherness" for ἑτερότης, "sameness" for
  ταυτότης, "difference" only for διαφορά, "forming principle" for λόγος (and "account" for the spoken λόγος, 18-19); in
  27 "rest" stays στάσις and ἠρεμία, the rest of what can move, is "stillness". Page's "Stability", "Identity",
  "Difference" and "Reason-Principle" are flagged as his. E.g. Page adds "rather than equal" to like triangles and leaves
  out Aristotle (15), gives the name Socrates to the perceptible Socrates where the Greek denies it (15), makes the soul's
  bending down "apostasy" and the forming principles "activities of body" for makings of bodies (16), "integrate" and
  "disintegrate" for drawing together and parting the sight (17, 25), leek-green and pale yellow two greens and the
  otherness in intellect "diversity" (18), the virtues' objects vices (18), the disposed "states" (19), states alone as
  qualities asserted where it is weighed (19), the more "quite apart from their participants" for a latitude (20), the
  cubit a yard and learning "knowledge" (21), motion a "dynamic Form" for a waking form, and calling it the life of bodies
  "unwarrantable" where the Greek says it would not be absurd (22), time "the measure" of motion for motion measured (22),
  diminution "decay" (23), the common moving to one's own place the difference of change of place where the Greek puts the
  difference outside (24), alteration "added" to combination where it is brought back to it (25), the differences made by
  the motions where they make them (26), rest "motionless" there (27), and "the kinds of Being" for these kinds (28).
  terms-greek.json is unchanged. Notes on equal and like (Categories 6, 8), the something and the such (Letter VII,
  Metaphysics Z.1), the two arithmetics (Philebus 56d-57a, Republic VII 525b-531c), white parting the sight (Timaeus 67d-e,
  Metaphysics Ι.7), powers known by their acts (Republic V 477c-d, On the soul II.4), the colours from white and black (On
  sense 3), Democritus' tastes (Theophrastus), privation and having (Categories 10, 15), blushing and states (Categories
  8), contraries (Categories 10, Metaphysics Ι.4), coming to be not a motion (Physics V.1), motion as act of the potential
  (Physics III.1-3), the life of bodies (Physics VIII.1), time as number of motion against III.7, the simple motions (On
  the heavens I.2, IV.3-4, Laws X 893c-d), combination and the void (On generation and corruption I.1-2, I.10, Physics
  IV.9), nature, art and choice (Physics II.1, Metaphysics Z.7), stillness as privation (Physics V.2, V.6), and the
  relatives (Categories 7, Metaphysics Δ.15).
- **E27: VI.4 That being, one and the same, is everywhere whole, first part (5,731) (done).** 64 paragraphs, 68 flags, 43
  notes, under a new @treatise block with its summary (the twenty-second treatise in the order of writing, Life 5; VI.5,
  the twenty-third, is its second part). MacKenna translated VI.4 himself, so the flags say "MacKenna"; the volume's
  "translator" stays "Stephen MacKenna and B. S. Page". Source work first: tools/mackenna.py found only VI.4.1; vol. V's
  "misread" now adds "Be" 2, "ye" 7, "Q." 9, "10. ," 10, "rt." 11, "pier" 12 and "TS." 15, and "stray" takes out the
  signatures Q (inside 7, p. 113) and R (inside 13, p. 121), which follow a line of text; "“e" before 11 and the "2" under
  the title already went as short lines. Two running heads were missed, which put chapters 10-16 a page early: p. 117's
  "VI. 4. 10) OMNIPRESENCE OF AUTHENTIC EXISTENT oper" (HEAD_LOOSE now takes a page of up to four characters) and p.
  118's "118 PLOTINUS*" (HEAD_EVEN now takes the asterisk); no other chapter's page in the volume moved. All 16 chapters
  are found on their pages (106-124) and their starts are the Greek's; no @older. Fixed names: "forming principle" for
  λόγος (11; the word in the voice is "word", 12, 15), "otherness" for ἑτερότης (4, 11), "sameness" for ταυτότης (12),
  "substance" for οὐσία, "intelligible" for νοητός; MacKenna's "Reason-Principle", "differentiation", "Intellectual
  Order" and "Intelligence" are flagged as his. E.g. MacKenna makes the white on two parts "the Form, White" where it is the
  same in form (1), the world and its original "side by side" where it is the original's imitation, and place "an
  envelope" where it is the limit of the surrounding body (2), a power "emanant" (3), the souls' not being made strangers
  their not being "set in opposition" (4), the hand "hand-long" (7), the luminous body "body lit" and the obstacles to the
  sun's light "refraction" (7), the powers "identical" with the first where they are like it (9), perceiving together
  "consciousness" (9), the images in water and mirrors denied where they are the proper ones (10), the clouded "opaque"
  (11), the speaker "the silent" (12), the bulk "the universe" holding "one soul" (13), our first state a lost simplicity
  where the voice is an image of the second man's coming (14), the trace of soul in the body "soul entire" (15), entries
  into animals a "banishment", soul giving "freely" where it gives more often (16), and "the All-Soul" and a "choice" where
  the Greek has all and an inclination (16). terms-greek.json is unchanged. Notes on the Timaeus' soul divided about bodies
  (35a), the Parmenides' day and sail (131a-c), the same in form and in number (Topics I.7), place (Physics IV.4), the
  world as image (Timaeus 30c-31b, 92c), being, life and intellect (Sophist 248e-249a), "being draws near to being"
  (Parmenides B8.25), one power over sight and hearing (Theaetetus 184b-186a, On the soul III.2), the Good beyond substance
  (Republic VI 509b), the painter (Republic X), otherness of being (Sophist 256d-259b), the medium of sight (On the soul
  II.7), addition (Phaedo 96d-101c), points and the continuum (Physics VI.1), "who are we?" (Alcibiades I 129e-130c), the
  voice a blow (Timaeus 67b), the city and soul (Republic IV, VIII, IX), the periods and judgements (Phaedrus, Republic X,
  Timaeus, Phaedo), the release (Phaedo 64c, 67a-d), Hades and the unseen (Phaedo 80d, Gorgias 493b, Cratylus 403a) and
  Heracles' image (Odyssey XI 601-604).
- **E28: VI.5 That being, one and the same, is everywhere whole, second part (3,658) (done).** 46 paragraphs, 75 flags,
  40 notes, under a new @treatise block with its summary (the twenty-third treatise in the order of writing, Life 5; VI.4's
  argument "taken up again from the beginning"). MacKenna's own English, so the flags say "MacKenna". Source work:
  tools/mackenna.py found only VI.5.1; vol. V's "misread" now adds "Bi" 2, "Fi" 7, "Q." 9, "Tai" 11 and "52" 12, and
  "stray" takes out the signature T at the end of 12 (p. 137); "T;" under the title and "Ss ’" already went as short
  lines, and p. 131's head "VI. 5. 8}" is read. All 12 chapters are found on their pages (125-136) and their starts are
  the Greek's; no @older; no other chapter's page in the volume moved. "ons" after "omnipresent." in VI.5.3 is OCR junk in
  a line of text and stays (nothing is rewritten by hand); no flag quotes it. Fixed names: "forming principle" for λόγος
  (9), "substance" for οὐσία, "intelligible" for νοητός, "self-controlled" for σωφρονοῦν (10), "wisdom" for φρονεῖν (10),
  "patterns" for παραδείγμασιν (8, the examples); MacKenna's "Reason-Principle", "Essential Existence", "the Other Order"
  and "Intellectual" are flagged as his. E.g. MacKenna makes the condition of the principle that all desire the good a
  dependence (1), being's not standing away from us "not exclusively ours" (1), the others' being present to it its being
  present to the apt (3), "emanant" (3), "this god (in man)" and the god "pervading" man where every man who believes in a
  god holds the doctrine (4), the unextended "undifferentiated" (5), the lines "generating" the centres (5), the many
  "absorbed" (6), our many faces what we see (7), the illumination "meaningless" and sharing "obvious" where the Greek is
  unreal (8), the idea "remaining apart" (8), the soul's power its "virtue" (9), the self-holding forming principle an
  encircling "Reason-Principle" (9), the beautiful "The Good" (10), the extended sphere "less worthy of respect" where it
  is more absurd (10), time a "radial line" where it circles a point (11), and "the lesser gods" and "God" (12).
  terms-greek.json is unchanged. Notes on the common notion and the god in us (Timaeus 90a), all desire the good
  (Nicomachean Ethics I.1, Philebus 20d), being and becoming and the likely account (Timaeus 27d-29d), definition and
  accidents (On the soul I.1), the one in nothing (Parmenides 138a-b), firsts, seconds and thirds (Second Letter 312e),
  one over many (Republic X 596a), the seal (Theaetetus 191c-d, Timaeus 50c), Athena's pull (Iliad I 194-200), sharing hard
  to tell (Timaeus 50c, 51a-b), fire itself (Timaeus 51b-e), the one bed (Republic X 597c), Xenocrates' self-moving number
  (On the soul I.2, I.4), the Parmenides' second hypothesis, Love at the door (Symposium 203c-d), "thinking is common"
  (Heraclitus B113), the many judging together (Politics III.11), the consolation (Phaedo 70b, 115d), time and eternity
  (Timaeus 37d, III.7), the elements' triangles (Timaeus 53c-55c) and the gods going about the cities (Odyssey XVII
  485-487, Republic II 381d).
- **E29: VI.6 On numbers (6,963) (done).** 72 paragraphs, 155 flags, 64 notes, under a new @treatise block with its
  summary (the thirty-fourth treatise in the order of writing, Life 5). MacKenna's own English, so the flags say
  "MacKenna". Source work: tools/mackenna.py found only VI.6.1 and 2 and gave VI.6 four chapters of VI.7's; vol. V now
  has "headings", which reads VI.7's "SEVEN:EH, TRACTATE" (7548) as "SEVENTH TRACTATE", so VI.7 begins on p. 162; "misread"
  adds "3," 3, "Ve" 7, "Q." 9, "iets" 11, "ies" 12 and "17:" 17 (11 and 12 checked against the Greek: p. 149's head says
  12, but 12 begins on p. 150); "unnumbered" begins 5 at "What then is the veritable nature of Number" (p. 142); a new
  "heads" reads p. 151's head "VI. 6. 13] ON NUMBERS t5t", without which the pages of 14-18 came out one too low; "stray"
  takes out "x" inside VI.6.14 (p. 154), and "U" (p. 145) and the signature "Xi" (p. 161) go as short lines. All 18
  chapters are found on their pages (138-160), their starts are the Greek's, and no other chapter's page in the volume moved.
  VI.6.18 does not end with p. 161's "For Being alone has Being in its own right.": it runs on to the top of p. 162 and
  ends "but Being is sufficient to itself", as the Greek ends (τὸ δὲ εἶναι αὔταρκες ἑαυτῷ). "Tests" and "fro ?" stay
  (MacKenna's text, in VI.6.3). Fixed names: "forming principle" for λόγος (11), "substance" for οὐσία, "intelligible",
  "otherness" and "sameness" (4, 9), "self-control" (15), "virtue", "wisdom" for both φρόνησις and σοφία (18), "units" for
  ἑνάδες where MacKenna has "Henads"; MacKenna's "Reason", "Real-Being", "Essence", "Ideas" and "Intellectual-Principle"
  are flagged as his. E.g. MacKenna makes the opening question a suggestion (1), the grief of magnitude real where the
  Greek's is contrary to fact (1), drops the town multiplied in thought (2), says "Matter" where the Greek has the
  unlimited (3), multitude "evil" where it is worse (3), the statue in intellect left out (6), the one thought "subsequent
  to a precedent duality" (9), "it is certain" where the Greek asks (9), the infinite line in the intelligible given as
  Plotinus' view where the Greek asks it, and the line there "not quantitative" where the Greek says it would be (17), and
  the good sought "through" being where it is sought after it (18). terms-greek.json is unchanged. Notes on the
  Pythagorean opposites (Metaphysics A.5), the Philebus' limit and unlimited (24a-25b) and measure (64d-65a), Plato's
  days and nights (Epinomis 978b-979a, Timaeus 47a) and true number (Republic VII 529d), knowledge the same as the thing
  (On the soul III.4), justice's face (Nicomachean Ethics V.1), the complete living being (Timaeus 30c-31b, 39e), the
  substantial and monadic number (Metaphysics M.6-M.7), the tetractys (Golden Verses), the aviary (Theaetetus 198a-199b),
  the Stoics' concepts (SVF I.65), recollection (Phaedo 74a-75a), two by joining and splitting (Phaedo 96e-97b, 101b-c),
  continuous and discrete quantity (Categories 6), the soul's number and harmony (Timaeus 36e-37a, Xenocrates), the four
  virtues (Republic IV), the unlimited potential (Physics III), the elements' figures (Timaeus 55d-56b) and Parmenides'
  one being (B8).
- **E30: VI.7 How the many forms came to be, and on the Good, chapters 1-14 (5,432) (done).** 59 paragraphs, 136 flags,
  49 notes, under a new @treatise block with its summary of the whole treatise (the thirty-eighth in the order of writing,
  Life 5); VI.7 is shown as "chapters 1-14 of 42 so far" and keeps chapters_done until E32. MacKenna's own English, so the
  flags say "MacKenna". Source work: tools/mackenna.py found only VI.7.1, which ran on through the whole treatise. Vol. V's
  new "title_lines" reads the title's second line, "Upon THE GoopD" (7552), as "UPON THE GOOD", so it no longer runs into
  VI.7.1, which begins "God, or some one of the gods"; "misread" adds "a" 2, "We" 7, "IO." 10, "ris &" 11 and "12:" 12;
  "unnumbered" begins 9 at "Admitted, then—it will be said—for the nobler forms of life" (p. 172); "heads" reads p. 172's
  "172 BEOTINUS", which stood inside VI.7.8's text and put the pages of 9 to 14 one too low; "stray" takes out the
  signatures "Z" (inside 6, p. 169) and "2A" (inside 12, p. 177), which follow a line of text and so are not short lines.
  All 14 chapters are found on their pages (162-180) and their starts are the Greek's; no other chapter's page in the
  volume moved. Fixed names: "forming principle" for λόγος (MacKenna's "Reason-Principle" flagged as his throughout),
  "substance" for οὐσία (his "essence", "Being" and "real beings"), "intelligible" for νοητός (his "the Intellectual"),
  "the same", "sameness" and "otherness" (his "Identity", "Difference", "differentiation"), "daemon" (his "Celestials"),
  "pattern" for παράδειγμα (his "copy to original", 12, and "manifestations", 14), "the unlimited" (his "infinity", 14),
  "beautiful" for καλόν (his "good", 3 and 10), and "the what it was to be" for τὸ τί ἦν εἶναι. E.g. MacKenna has the eyes
  "catch" the light where they are light-bearing (1), providence "holding them to their disaster" where it keeps them safe in
  evil (1), "Providence" for προόρασις, foresight (1), an "image" for the statue (2), the addition of perception kept as a
  fact where the Greek denies it (3), "an artist" for the painter (5), Plato's definition a certainty where it is a likely
  reading (5), "Celestials" and "almost a god" where the Greek has "rather a god" (6), fire here to fire there reversed (6),
  "a pattern" for a sketch and illuminations "tentative" where they run ahead (7), "because it was of bodies" taken with the
  perception here (7), "the universal horse" and the complete living being "the living universe" (8), the rising up again of
  intellect left out (9), the cut stone that suffers "no hurt" (11), "(the stars)" for the living beings of air, which are
  daemons (11), "the All-soul" for all soul and "indigence" for Poverty (12), the "Meadow" for the plain of truth (13), and
  "Sympathy" for friendship, with the last sentence of 14, on Empedocles' separation, left out. terms-greek.json is
  unchanged. Notes on the light-bearing eyes (Timaeus 45b), the starting points of reasoning (Posterior Analytics I.3,
  II.19), the reasoning Demiurge (Timaeus 30b, 34a-b), the that and the why and the eclipse (Posterior Analytics I.13, II.1,
  II.2, II.8), the coming to be "for teaching's sake" (On the heavens I.10), the eyebrows (Memorabilia I.4.6, Parts of
  animals II.15), man himself (Metaphysics B.2, Nicomachean Ethics I.6), the soul using the body (Alcibiades 129e-130c), the
  seminal forming principles (SVF II.1027), the painter (Republic X 597e-598b), the soul's vehicle (Timaeus 41e, 69c),
  daemons (Symposium 202d-203a), the souls choosing beasts (Republic X 620a-d), the dancer (III.2.17, IV.4.33), hair, mud
  and dirt (Parmenides 130c-d), being with motion, life and intellect (Sophist 248e-249a), Epimetheus' gifts (Protagoras
  320d-321c), the growing stones (IV.4.27), the creature in the furnaces (History of animals V.19), the daemons of air
  (Epinomis 984d-985b), the four kinds of living beings (Timaeus 39e-40a), Poverty and Resource (Symposium 203b-c), the
  plain of truth (Phaedrus 248b-c), the indivisible form (Phaedrus 277b, Metaphysics Z.12) and Empedocles' Love and Strife
  (B17, B26).
- **E31: VI.7 chapters 15-28 (4,167) (done).** 52 paragraphs, 142 flags, 34 notes; VI.7 is shown as "chapters 1-28 of
  42 so far" and keeps chapters_done until E32. The @treatise VI.7 block (E30) is kept: its account of chapters 15 to 23
  (intellect's life a trace of the Good, which gives what it does not have, the forms desired because the Good colours
  them, beauty loved only when the light from the Good comes upon it) and of 24 on (the Good not pleasure nor the
  Philebus' mixture, but that to which each thing turns) fits what is done. MacKenna's own English, so the flags say
  "MacKenna". Source work: vol. V's "misread" adds "17s" 17, "9g." 19, "21s" 21, "228" 22 and "ay." 27 (which runs
  straight on into its first line); "heads" reads p. 188's "188 © PLOTINUS", which otherwise stood inside VI.7.20's text
  and put the pages of 21 on one too low; "stray" takes out the signatures "2B" (inside 18, p. 185) and "2C" (inside 27,
  p. 193). All 14 chapters are found on their pages (181-195), their starts are the Greek's, and 28 ends before "29."
  ("But we will return to this."); chapters 29 to 34 are now found too (pp. 196-201), and 35 on still run on in 34. No
  other chapter's page in the volume moved. Fixed names: "forming principle" for λόγος (MacKenna's "Reason-Principle" and
  "Reason" flagged, 17, 19, 23), with λόγος as the argument or the account where it is that (18, 19, 20, 28), "substance"
  for οὐσία (his "essential reality", "Being", "real-being", 16, 20), "the Good", "intellect", "virtue" (his "values" and
  "moral excellence", 19, 27), "justice" (his "right", 20), "matter", and "good-formed" for ἀγαθοειδής throughout. E.g.
  MacKenna makes intellect the forms' source where the Good is (15), the giver's life "of our sphere" where it is
  intellect's (17), three cases where the Greek has two, and "part of Intellect" for the homonymous (18), the objects of
  pursuit many where the desirers are (19), beauty "dead" where it is idle and "portraits" for statues (22), "mightier"
  for better and "evil" for vice (23), a sentence not in the Greek ("The solution, it would seem, lies in priority") and
  the light a thing intellect takes where the Good gives it (25), the regret left out (26), "at peace" for at home with
  oneself (27), "a dream of the Good" for a good dream, and the good "apt to the nature" where the Greek says it is not
  set in the akin (28). terms-greek.json is unchanged. Notes on the good-formed (Republic VI 509a), the sun (Republic VI
  508a-509b), κόρος and Kronos (Cratylus 396b), act before potency (Metaphysics Θ.8), the limit and the unlimited
  (Philebus 23c-25b), the homonymous and the first and second (Categories 1, Metaphysics Γ.2, α.1), every soul divining
  the good (Republic VI 505d-e), all things aiming at the good (Nicomachean Ethics I.1), light the third thing (Republic VI
  507d-508a), the flow of beauty and the wings (Phaedrus 249c-252b), beauty not symmetry (Cicero, Tusculan Disputations
  IV.31), the king of all (Letter II 312e), the indifferents (Diogenes Laertius VII.102-104), desired because good
  (Metaphysics Λ.7), the mixed life (Philebus 20e-22e, 60a-61b), pleasure that never fills (Philebus 53c-54d, Gorgias
  493e-494b), the like and the akin (Lysis), οἰκείωσις (Diogenes Laertius VII.85, Cicero, On ends III.16), matter
  desiring form (Physics I.9) and the dream of matter (III.6.7).
- **E32: VI.7 chapters 29-42 (4,769) (done).** 60 paragraphs, 134 flags, 41 notes; VI.7 is complete, with no
  chapters_done, and the reader no longer shows "chapters 1-28 of 42 so far". The @treatise VI.7 block (E30) is kept: its
  account of chapters 24 to 36 (the soul that sees the Good loves a beauty without shape, and leaves all to be alone with
  it) and of 37 to 42 (against those who make the first think, the Good does not think, nor need to know itself) fits
  what is done. MacKenna's own English, so the flags say "MacKenna". Source work: vol. V's "misread" adds "35:" 35 and
  "Al." 41; "heads" reads p. 204's "204 PEOTINGS", which otherwise stood inside VI.7.35 and put 36 on one page too low;
  "stray" takes out the signatures "2D" (inside 34, p. 201) and "2E" (inside 40, p. 210). All 42 chapters are found,
  29 to 42 on pp. 196-211, their starts are the Greek's, and 42 ends before "EIGHTH TRACTATE" (on "dependent upon soul",
  the Greek's εἰς ψυχὴν ἀνηρτημένων). No other chapter's page in the volume moved. Fixed names: "substance" for οὐσία
  (MacKenna's "the veritable", "the Authentic", "essence", "Being", "Real-Being", "essential Being" flagged, 32, 37, 39,
  40, 41), "the Good", "intellect", "intelligible" (his "Intellectual" for νοητός flagged, 33, 34, 35, 36), "virtue",
  "justice", "self-control" (his "wiser", "moral quality" and "Sophrosyny", 29, 31, 33), "matter" and "unlimited". λόγος
  is the argument or the account throughout these chapters (29, 33, 35, 40, 41), so "forming principle" does not come up;
  MacKenna's "reason" for it is flagged (33, 35, 41). E.g. MacKenna makes the isolated a candidate for the good where the
  Greek denies it (30), intellect flash "Nature into being" where its own nature shines out (31), the first "a thing of
  parts" where it would be a part, and a denial of the question "what beauty is it?" (32), the soul affirm "that she is,
  herself" where she says "it is that one" (34), the soul speak of intellect where she speaks of the Good, and "excess"
  for the fill (35), the quester made one with the radiance where the Good is that radiance (36), "repose" for standing
  in solemnity (39), the first "a manifold" where the Greek says it is neither two nor more (41), and the second "under"
  the first where it is about it (42). terms-greek.json is unchanged. Notes on the senses wishing to know (Metaphysics
  A.1), pleasure the bloom on activity (Nicomachean Ethics X.4), truth and measure in the mixture (Philebus 64a-66a), the
  lovers and the image of the beloved (Phaedrus 250d-253c), the mud (Phaedo 69c, Republic VII 533d), beauty itself by
  itself (Symposium 211a-b), the watering of the wings (Phaedrus 251b-e, 255c-d), alone to the alone (VI.9.11),
  "suddenly" (Symposium 210e, Letter VII 341c-d), tickling (Philebus 46a-47a, Gorgias 494c-e), the intelligible place
  (Republic VI 508c, VII 517b), the myths that divide in time (III.5.9), the greatest study (Republic VI 505a), the ways of
  negation, analogy and ascent (Alcinous, Didaskalikos 10), Odysseus on the wave (Odyssey V.392-393), thinking of thinking
  (Metaphysics Λ.9), "beyond intellect" (Aristotle, On prayer fr. 49 Rose), privation (Metaphysics Δ.22), the one that is
  not even one (Parmenides 141e-142a), the greatest kinds (Sophist 254d-255e), standing in solemnity (Sophist 248e-249a),
  beyond substance (Republic VI 509b), "know yourself" (Alcibiades I 128e-130e), no account of the one (Parmenides 142a)
  and the king of all (Letter II 312e).
- **E33: VI.8 On free will and the will of the One (7,771) (done).** 77 paragraphs, 189 flags, 77 notes, under its own
  @treatise block (the thirty-ninth in the order of writing, Life 5); done whole in one thread, so PLAN keeps "E33" and there
  is no E33b. With VI.8 the Life and all thirty-nine treatises not Taylor's are here (489 chapters) and none is "to come":
  the reader's whole-Enneads note now says "the other thirty-nine are all done here, beside MacKenna's". MacKenna's own
  English, so the flags say "MacKenna". Source work: the OCR's chapter lines are one later than the notes guessed: "RS"
  (9916) is 3 ("All this calls for examination", the Greek's διὸ σκεπτέον) and "as" (9950) is 4; 2 has no line and begins
  at its first words ("A cardinal question is where", vol. V's "unnumbered"); 7 is the "5" under p. 219's head; vol. V's
  "misread" adds "RS" 3, "as" 4, "5" 7, "Q." 9, "I0." 10, "PE" 11, "ie." 12, "Ls" 17 and "ati" 21. "heads" reads p. 229's
  "VE 8.35) -FREE-WILL ANDUPHEOWILL OF THE ONE 229", which otherwise stood inside VI.8.14's text and put the pages of 15 on
  one too low; "stray" takes out the signature "2G" (inside 12, p. 225), while "2F" and "2H" stand alone and go as short
  lines. All 21 chapters are found on pp. 212-236, their starts are the Greek's, and 21 ends before "NINTH TRACTATE" (on
  "thing and something added", the Greek's αὐτὸ καὶ ἄλλο); p. 237's head inside 21 is taken out. No other chapter's page in
  the volume moved. Fixed names: "up to us" for τὸ ἐφ’ ἡμῖν (MacKenna's "freedom", "self-disposal", "voluntary action"
  flagged, 1, 3, 5), "self-determination" for τὸ αὐτεξούσιον, "voluntary" for ἑκούσιον, "will" for βούλησις and θέλησις,
  "forming principle" for λόγος (his "reason" and "Reason-Principle" flagged, 10, 15, 17, 18), with λόγος as reason
  (right reason, 3; measured by reason, 6), the argument (13) or the account (11, 13) where it is that, "substance" for
  οὐσία (his "essence", "Essential Existence", "reality", "Being" flagged, 4, 8, 10, 12, 19, 20, 21), "existence" for
  ὑπόστασις, "the Good", "intellect", "intelligible" (his "Intellectual", 11), "good-formed" (15), "pattern" (14).
  E.g. MacKenna puts "the voluntary" where the Greek has "up to us" (1), "lust or rage" for spirit and appetite and
  "malpractice" for drugs (2), "proposals" for premises (3), "independence" for liberality (5), "we read" for Plato's "he
  says" and "sacrifices" for gives up (6), "rash thinking drawn from another order" for the bold argument (7), "attribute"
  for accident and "automatic action" for the spontaneous (8), "Thus He has happened not to be" where the Greek denies the
  happening (11), the first's having no substance left out and "liberator" for free-maker (12), "its own Author" for "has
  made itself" (13), "God" named where the Greek does not name him (11, 14, 16, 21), "before all time"
  for before eternity (20), a denial ("Let no one suspect us of asserting that the first Activity is without Essence")
  where the Greek says "do not be afraid" to set it without substance (20), and "does not lessen Him" where the Greek warns
  of not having taken away enough (21). terms-greek.json is unchanged. Notes on the voluntary and ignorance (Nicomachean
  Ethics III.1, V.8), children and beasts (III.1-2), knowledge dragged like a slave (Protagoras 352b-c), right opinion tied
  by the cause (Meno 97a-98a), the appetites in sleep (Republic IX 571c-572b), the free man for his own sake (Metaphysics
  A.2), virtue without a master (Republic X 617e), the virtues of habit (Republic VII 518d-e), the will of the good (Gorgias
  467c-468c), the fine for which the brave man dies (Nicomachean Ethics III.7, IX.8), chance and the spontaneous (Physics
  II.4-6), the four questions (Posterior Analytics II.1-2), chaos and place (Theogony 116, Physics IV.1, Timaeus 52a-b),
  nature and chance (Laws X 889a-d), the best does the finest (Timaeus 29e-30b), what it is to be (Metaphysics Z.6), love the
  lover (Symposium 203c-204c), the great plant (III.8.10), waking (Metaphysics Λ.7), choice (Nicomachean Ethics III.2-3),
  the circle and centre (V.1.11, VI.9.8), the transparent (On the soul II.7), the due and the timely (Statesman 284e),
  beyond substance (Republic VI 509b), activity complete in itself (Metaphysics Θ.6, Θ.8), the powers of opposites
  (Metaphysics Θ.2, Θ.5) and "take away all things" (V.3.17).
- **E34: MacKenna's English beside the fifteen done with Taylor too, and their flags checked against him, so that the whole
  Enneads read the same way.** Asked for by Daniel (November 15, 2026: "Yes we want that in the program"). Done in parts, one
  pull request each:
  - **E34a: MacKenna beside every chapter (done).** `tools/modern_neo.py` sets MacKenna's chapter of the same number beside
    each of the 190 chapters of `plotinus.txt` (`plotinus.json`'s `older`, in the shape `enneads.json` gives it), and checks
    that every chapter has one; the reader of Taylor's Plotinus (`#neo-en/taylor-plotinus/<part>`) gets a fourth way to read,
    "Beside MacKenna" (the modern English and his, chapter by chapter), and a "MacKenna's words" button under every chapter in
    the other ways; the Enneads page lists Taylor's fifteen as "beside Taylor and MacKenna". The format gains `!mackenna
    <MacKenna's words> | <why>`, a flag checked word for word against his chapter, shown as "MacKenna differs". Source work in
    `tools/mackenna.py`, for the chapters the OCR lost or misread in Taylor's treatises (the other nine were already right):
    vol. II "misread" II.9.11 "n.", "title_lines" for II.9's second and third title lines (in small letters, they ran into
    chapter 1), "stray" the "V" at the end of II.9.16; vol. III "misread" IV.3.31 "3*." and IV.7.10 to 15 ("10. (15.)",
    printed with Creuzer's numbers; MacKenna's 8 holds his "8, A." to "8, E.", all Volkmann's 8), "unnumbered" IV.3.14, 15
    and 17; vol. IV "misread" V.9.7 "....", "unnumbered" V.3.17 and V.9.13; vol. V "misread" VI.9.2 "2", 3 "3. ;", 7 "aE",
    9 "Q.", 10 "IO." and 11 "be". The "misread", "unnumbered" and "title_lines" lines are now compared with their spaces
    made single (vols. II to IV's OCR puts two between words). No other treatise's chapters moved. Each repaired chapter's
    start was checked against the Greek's. `plotinus.json` is now just under 2 MB and will pass it with the flags; the website
    carries the modern English whatever its size (PR 85), so its test now only keeps it under 4 MB.
  - **E34b to E34j: the flags against MacKenna**, a treatise or two at a time, in Porphyry's order, each about 5,000 to
    10,000 Greek words: read MacKenna's chapter beside the Greek and the modern English, and add a `!mackenna` flag wherever
    he adds to the Greek or misses it, as E1 to E33 did; the Taylor flags stay, and the modern English is not changed. E34b
    I.2, I.3, II.4 (7,450); E34c II.9 (7,228); E34d III.6 (7,534); E34e III.7, IV.2 (7,062); E34f IV.3 (9,800); E34g IV.7,
    V.2 (6,225); E34h V.1, V.6 (5,260); E34i V.3 (6,372); E34j V.9, VI.9 (7,730).
  - **E34b: I.2, I.3, II.4 (done, in the same pull request as E34a).** 51 flags against MacKenna (21, 13, 17). E.g. in I.2
    "God and Demi-God" for a god and a daemon, "matter of discipline" for right action, the Supreme denied to be justice
    itself where the Greek says justice itself is not a virtue, "Dutifulness" and, as in Taylor, "Immateriality" for the
    intellect's justice and sameness, "Contemplative-Wisdom" for practical wisdom, "the Good" for good men, and the goodness
    "before the impurity" where the Greek has before the purification (Taylor's slip too); in I.3 "metaphysician" for the
    philosopher, "initiation" for the leading up, the soul "severed" from beauty where it cannot grasp it apart from
    bodies, the analysis that goes "into the particulars" where it goes back to the principle, and "the Understanding" for
    practical wisdom; in II.4 "a meeting-ground" for first things by chance, "the present existence" of the forms for
    "taking for now", "our reasoning" for intellect, "Primal Matter (of the Intelligible)" for the first matter under
    bodies, Anaximander and Democritus named in brackets, "sizeless" elements, "Absence" for matter, the One's power left
    out, and the chapter end of II.4.5 left out.
  - **E34c: II.9 (done).** 17 flags against MacKenna. E.g. his "law" in quotation marks where the Greek quotes no one,
    "never known a beginning" for things always coming to be, the souls' "dwelling-place" where they were to be on their
    guard, the second as "the only thing that is good", "a medley" for total comings to be, "a dominion" for the city,
    "a thousand cubic feet" for cubits, God knowing the world's order where the world knows its own, the world made "one of
    the Primals" where the argument carries its cause back to them, and the intelligible sphere glossed as the All-Soul.
    `tools/mackenna.py` also takes out thirteen running heads that the OCR misread and that stood inside paragraphs (in
    II.9.9, III.6.11, III.7.9, IV.3.3, IV.5.5, V.1.6, V.1.7, V.3.10, V.3.15, V.5.1, V.5.7, V.8.2 and V.9.10), which put the
    pages of a few chapters after them one too low.
  - **E34d: III.6 (done).** 18 flags against MacKenna. E.g. "feelings" for the sense-perceptions the treatise opens with,
    "the initiative faculty" for the spirited part, the elation of pleasure put in the mind where the Greek puts its
    diffusion in the body, "matter and spirit" as contraries where the Greek names none, "Melody" for the attunement of the
    strings, matter "incorporeal" with its reason turned round, "Substance" for the substrate, "a drawing" for a line, a thing
    hurt only by "something related to it" where it is hurt by its contrary, wax brought into Plato's example, Democritus'
    "by convention colour" lost, and "Possession" for Poros.
  - **E34e: III.7, IV.2 (done).** 16 flags against MacKenna (14, 2). E.g. in III.7 eternity "a unity including interval"
    where the Greek says without interval, its whole content glossed as "time, space and phenomena", "The Good" for the
    beautiful, "the return path" of the heavens for the half circuit, "the subordinate Movement" for the regular one, "an
    active principle" for the restless nature that made time, and "the Soul" making day and night; in IV.2 "imparted" for
    without parts. `tools/mackenna.py` also takes out the printer's signatures that stood alone on a line and ran into
    the paragraphs around them (in I.6.3, II.3.18, II.4.10, II.5.5, II.7.1, II.9.2, 8, 13 and 18, III.7.11, IV.4.29, V.5.6
    and V.8.7).
  - **E34f: IV.3 (done).** 7 flags against MacKenna, fewer than elsewhere because he keeps close to the Greek here.
    E.g. Hesiod's lines on Hephaistos put into Plotinus' mouth, Epimetheus refusing the gift where the Greek has Prometheus
    refusing it, the visible gods made "Reason-Principles", "the Kosmic Law" for justice, and the excellence of the lower
    soul hurting the higher where the Greek has the lower held down by the higher. `tools/mackenna.py` also takes out 13
    more running heads that the OCR had misread, the kind without a bracket ("IV. 3. 7l PROBLEMS OF THE SOUL 15"), in
    III.8.6, IV.3.6, 13 and 28, IV.4.12, 24, 36, 43 and 44, IV.5.7 and V.3.6, 13 and 17; the pages after them move on by one.
  - **E34g: IV.7, V.2 (done).** 5 flags against MacKenna (4, 1); in both he keeps close to the Greek. E.g. in IV.7
    "coherence" for the mere juxtaposition of the atoms, beauty in "impressions received" for the shapeliness of the
    pneuma's own figures, "It is obvious" for what Plotinus draws out of the Stoics' theory to refute it, and "partly in
    body, partly outside" for sometimes in body, sometimes outside; in V.2 "more rebellious and less intellectual" for the
    Greek's superlatives.
  - **E34h: V.1, V.6 (done).** 3 flags against MacKenna (2, 1); he keeps close to the Greek in both. In V.1 intellection
    as "vision occupied upon The One" where the Greek says sight and its seeing are one, and the soul's separation as
    "use of our thinking" where the Greek has not inclining to the body and its images; in V.6 the Good that "moves
    towards itself" where the Greek has it moving the other towards itself.
  - **E34i: V.3 (done).** 1 flag against MacKenna: he keeps very close to the Greek through its 17 chapters. In V.3.13 he
    has us "considering it only in its opposites" where the Greek says that to call the One unaware of itself turns us
    round to the opposite of what we hold.
  - **E34j: V.9, VI.9 (done).** No flags against MacKenna: read through and set against the Greek, he keeps close to it in
    both. A smudge in his vol. IV that the OCR read as `"  O  '  O` stood inside V.9.1 and is now taken out, so that the
    chapter reads "in their mightier power" again.

## Proclus' Theology of Plato in modern English (T milestones; November 15, 2026, asked for by Daniel)

Daniel: "Lets move over to modernizing Proclus Theology of Plato". The Enneads' E34 goes on in its own thread.

- **The source.** No Greek of the Theology is on the site, and the only free edition, Portus' (Hamburg, 1618), is a scan whose
  Greek OCR is badly garbled (it would need proofreading page by page from the images first, as Proclus on the Alcibiades did).
  So the modern version is made from Thomas Taylor's English (1816), as the General Introduction was (milestone 24). His text is
  Project Gutenberg's proofread transcription, already in the Workshop (`sources/taylor-gutenberg/pg77393.txt`, vol. I,
  Books I-V; `pg78800.txt`, vol. II, Book VI and his own Book VII), read by `tools/modern_theology.py` into books, his chapters
  and his paragraphs, his footnotes kept with the paragraph that cites them and his chapter headings taken from his tables of
  contents. The archive.org OCR in `sources/taylor-proclus-theology-1816/` is too garbled to use. If Proclus' Greek is brought in
  later (Portus proofread, or a cleaner public-domain text), the modern version can then be checked against it.
- **The fixed renderings.** Taylor renders Proclus' key words by a fixed vocabulary, so `terms.json` (the list of milestone 24)
  is checked against his words: where Taylor's paragraph has one of his forms, the modern paragraph must have the fixed
  rendering, or a written exception. The Theology adds 32 rules of its own (`"texts": ["proclus-theology"]`, so the
  Introduction and the Life are untouched), closing the gaps the audit found: "essence" (οὐσία) is "being"; "unities" are
  "henads"; "progression" is "procession" and "regression"/"conversion" is "return"; "participate" is "share"; "ideas" are
  "Forms"; "the one" is "the One" and "the good" "the Good"; "productive principle" (λόγος) is "forming principle";
  "energy" is "activity"; "theologist" is "theologian"; the gods by their Greek names (Kronos for Saturn). The modern version
  never uses "essence", "subsist", "energy" or "felicity" (`"forbidden"`), as in Proclus on the Alcibiades.
- **The pattern.** Paragraph by paragraph, every idea kept, in short sentences and today's words; Taylor's chapter beside it
  (Side by side) or one tap away, with his notes; a summary of each book and chapter; flags quoting Taylor word for word where
  his English is hard or misleads (the build checks the quotation); notes giving Plato's places; labelled as the Workshop's
  own AI-drafted translation, not yet checked by a scholar; Mark a sentence. Read at `#neo-modern/proclus-theology`, linked
  from the Neoplatonists' shelf; the page lists all six books in Taylor's chapters, done or to come. Master copy
  `sources/translations/modern/proclus-theology.txt`; checks in `reports/modern_theology.md`; tests
  `tests/test_modern_theology.py` and `tests/modern_theology_browser.js`.
- **Size.** Proclus' six books are 183,113 of Taylor's words in 164 chapters (Book I 33,234; II 22,219; III 28,027; IV
  28,882; V 40,018; VI 30,733). About 7,500 to 10,000 of Taylor's words a milestone, one PR each:

- **T1: the pipeline, and Book I, chapters 1-8 (7,528 words) (done).** The preface to Pericles (Plotinus, Amelius, Porphyry,
  Iamblichus, Theodorus, Syrianus), the plan of the work and what its hearer needs, who a theologian is (the "one" of the soul
  joined to the henads), Plato's four ways of teaching about the gods, the dialogues that hold his theology, the objection
  that it is patchwork, and the answer: the Parmenides holds it all; the two kinds of opponents on the Parmenides. 35
  paragraphs, 13 flags (e.g. Taylor's "for a time" for "in time", "passive one" for the Sophist's being that has the one as
  an affection, "uniform" for one-like, "precedaneous", "orgies").
- **T2: Book I, chapters 9-12 (6,805) (done).** Against the logical reading of the Parmenides; the hypotheses as principles;
  Syrianus' reading of the hypotheses and the divine orders in the second. 31 paragraphs, 9 flags.
- **T3: Book I, chapters 13-17 (8,593) (done, with T2 in one PR).** The common rules about the gods in the Laws (they exist,
  the argument from motion up to the henads; they provide, without labour; they cannot be bribed), and the Republic's axioms,
  beginning with the gods' goodness and where evil comes from. 25 paragraphs, 9 flags (e.g. "adumbrant" good, "Ixion",
  "precedaneous productive principles of evil").
- **T4: Book I, chapters 18-29 (10,308) (done; Book I complete).** The gods' unchangeableness, simplicity and truth; the
  Phaedrus' beautiful, wise and good (the Philebus' desirable, sufficient and perfect); faith, truth and love; the Phaedo's
  divine, immortal and intelligible, one-like, indissoluble and always the same; the unbegotten; father and mother causes; the
  divine names (the Cratylus). 30 paragraphs, 17 flags (e.g. Taylor's "latter" and "former" the wrong way round, and
  "participated" for "unparticipated", in I.26).
- **T5: Book II, chapters 1-3 (9,420) (done).** The first principle, beyond being, argued three ways: from the one and the
  many (the Parmenides' hypotheses turned into proofs), from the kinds of principle (not body, not a power in bodies, not
  moved, not being), and from what all things share and the limits of the series of causes. 29 paragraphs, 11 flags (e.g.
  Taylor's "causally" for "by chance", and a sentence of II.3 where his English says "more perfect" for "less perfect").
- **T6: Book II, chapters 4-12 (12,799) (done; Book II complete).** Against Origen the Platonist, who stopped at
  intellect; the two ways up to the first (analogy and negation) and its two names (the Good and the One); the Republic's sun
  and the monad in every order; the Second Letter's king of all and its three sayings; the first hypothesis of the
  Parmenides, its denials taken order by order. 38 paragraphs, 19 flags (e.g. "unhyparctic", "adyta", "Titannically").
- T7 to T9: Book III (28,027): the henads, limit and the unlimited, the intelligible gods. Gutenberg's text runs chapters 3-9
  together (no headings for 4-8, which Taylor's table of contents names): T7 must find and mark them.
- T10 to T12: Book IV (28,882): the intelligible and intellectual gods (the Phaedrus' place above the heaven).
- T13 to T16: Book V (40,018): the intellectual gods, Kronos, Rhea, Zeus, the Craftsman. Chapter 26 has no heading in
  Gutenberg's text: find it first.
- T17 to T19: Book VI (30,733): the ruling (assimilative) gods, the liberated gods. Chapter 10 has no heading: find it first.
- Then, if Daniel wants it, Taylor's own Book VII (74,323 words, made from Proclus on the Timaeus), and Proclus' Greek.

## The current focus (November 13, 2026, asked for by Daniel): Aristotle, beginning with the Metaphysics

**Paused (November 13, 2026, asked for by Daniel):** Daniel: "Ok lets put a pause to this and move over to the Enniads,
translating it into modern english". The Aristotle work stops after 35m6 (Books Ι and Κ of the Metaphysics, done and merged);
35m7 (Book Λ) onward keeps its plan, to take up again when Daniel asks. The new work is the Enneads in modern English.

Daniel: "let's pause any work on Plato, move focus over to modernizing and correcting the texts of Aristotle, start with
Metaphysics; we need to turn this into a milestone list so that new threads can be made to save tokens."

- All work on Plato and the Neoplatonists is **paused**: the milestones not yet done (18 to 22, the rest of 27, the Proclus
  sessions, 28 to 34, and A6) are marked "paused" below and keep their plans, to take up again when Daniel asks.
- The work now is milestone 35, modern English of Aristotle, corrected against the Greek: first the **Metaphysics**, in eight
  small sub-milestones (35m1 to 35m8, below), then the rest of Aristotle in the Platonists' order of reading (35d onward).
- **One sub-milestone per thread.** A thread does its one sub-milestone, merges it, checks the deployed site, reports, and stops;
  the next sub-milestone starts in a fresh thread, which reads only this section, milestone 35 below, and the README's section on
  milestone 35. Each sub-milestone is sized to fit one fresh thread.
- The next one to do is always the first sub-milestone below not marked done.

## Milestone 13: the Platonist order, Start here, Taylor's glossary and Introduction (done)

- The dialogues are listed in the **Neoplatonic curriculum** of Iamblichus by default (Anon. Prol. 26, quoted with
  the Workshop's own translation): Alcibiades I, Gorgias, Phaedo, Cratylus, Theaetetus, Sophist, Statesman,
  Phaedrus, Symposium, Philebus, then the Timaeus and Parmenides; then the Republic and Laws, which "some" read too;
  then the rest in Thrasyllus' order. The Sophist and Statesman fill a gap in the Greek text; that placement is
  Westerink's, quoted from Dillon (2017), and labelled as a modern editor's. Albinus' order and Thrasyllus'
  tetralogies can be chosen instead (Library, Start here). `sources/structure/reading-order.json`, `reader/guide.js`.
- **Start here** (`#start`, opened on a first visit): what the Workshop is, where to begin, how to read a page,
  what each part is for, and the ancient guides.
- **Glossary** (`#glossary`): Taylor's Explanation of Certain Platonic Terms, A to Z, searchable.
- **Guides to Plato** shelf in the Library: Taylor's General Introduction and Olympiodorus' Life of Plato, read
  whole (`#taylor/general-introduction`), with Albinus, Diogenes Laertius and the Prolegomena.

## Milestone 14: listen to the dialogues (done; approved by Daniel: "these dialogues are meant to be heard")

- A **Play** button in the reader reads the English aloud from the current position, with the browser's own speech
  (`speechSynthesis`: Safari on the iPad, Edge or Chrome on Windows), paragraph by paragraph (one utterance each),
  highlighting the paragraph being read and scrolling with it; **Pause**, **Skip** (next and previous paragraph) and
  **Speed**. Speech must start from a tap (iPad rule). It carries on across Stephanus pages.
- **One voice per character, always the same.** Socrates always has one voice, Glaucon another, in every dialogue;
  a narrator voice reads unlabelled text. Key off the speaker labels the reader already has (`speakerLabel` in
  `reader/reader.js`, `c.speaker` / `c.label`), mapped to one canonical name per person. Pick from the device's
  English voices (stable order, so the same name gets the same voice each time); if there are fewer voices than
  characters, vary pitch and rate to keep them apart. Let the reader reassign a character's voice and remember it.
- Which translation is read follows the one shown (the Loeb English by default).
- Research notes from the audio thread: https://claude.ai/artifact/6NX2Qwzr3xFnnkyoj7DWWv
- Built as `reader/listen.js` and `sources/structure/people.json`. Not done, and not guessed: inside a narrated
  dialogue whose markup names only the narrator (Republic, Charmides and Lovers, told by Socrates; Phaedo; Parmenides) the speeches
  told by the narrator are read in one voice, since the text does not mark who says them. Giving them their own voices
  would need the speeches marked, with a source for each: milestone 22.

## Milestone 15: English for every piece of Greek (done)

- **The audit** (`tools/greek_audit.py`, `reports/greek_audit.md`): every run of Greek the reader is sent, view by view and
  field by field (about 1.9 million Greek words, counted each time a view shows them, in 136 fields), and how English is given for each, from
  `sources/translations/coverage.json`. A test fails if a field showing Greek is not covered there.
- **The Anonymous Prolegomena in English**, all 24 pages, beside Hermann's Greek: a Workshop translation, labelled, since
  no public-domain English exists (`sources/translations/prolegomena-hermann.json`). Unreadable or corrupt places are
  marked in brackets, not guessed.
- **Albinus and the Definitions**: Burges' English (1854) beside Hermann's Greek, page by page (`sources/translations/paired.json`).
- **Tap any Greek word anywhere** (a note, the scholia, Taylor's footnotes, a dictionary entry, a quotation): a small box with
  its dictionary form (GLAUx, Morpheus and Morpheus' short English) and the English Middle Liddell (or LSJ) prints for it, named.
  The build now copies the Morpheus analyses of about 23,000 forms outside Plato into the library (`tools/gloss.py`);
  Hermann's ϑ is read as θ, and Greek printed without accents is matched by its letters and marked so.
- **English under every quotation of Plato's Greek** away from the reader (concepts, dossiers, reconciliations, the whole,
  LSJ's citations, the commentaries read straight through): an *English* button opens that section in each translation, the Loeb first.
- **Speaker labels**: Burnet's ΣΩ., ΓΛ. have the speaker's English name beside them, not only on hover.
- Left for later, and said so in the audit: the Greek scholia (milestone 21); Greek quoted inside English commentary notes
  has the tap-a-word meaning but no translation of the whole quotation.

## Milestone 16: plain words and help everywhere, and an iPad audit (done)

- **Plain names** in the interface, the scholar's name kept on hover: *dictionary form* (lemma), *grammar* (parse),
  *Show* (layers), *Words without grammar* (untagged), *Whose idea* (a concept's layer); Stephanus numbers explained on hover.
- **? Help** at the top of every page and a small ? beside every panel: two sentences on what it is for and what to tap,
  with the Workshop's words it uses (`reader/help.js`; the texts in `sources/structure/workshop-words.json`, under `help`).
- **Words used in the Workshop** (`#words`): 23 words in plain English, each labelled as the Workshop's explanation and
  resting on quoted sources (a file here, the manifest, or a web page checked by `tools/webcheck.py --words`).
- **iPad audit**: every view at 1024×768, 768×1024, 1180×820 and 820×1180 (Playwright, touch). One overflow (the concept
  list, upright) fixed; below 1150px the contents column opens from *☰ Contents*.
- Still left, and planned in milestone 21: whole translations of the longer Greek quotations inside the English commentaries
  (each Greek word there can already be tapped for its meaning).

## Milestone 17: key terms linked in the text, opening beside it (done)

- **The term list**: every concept of the concept index is a term (228), with `sources/terms/terms.json` adding the
  Neoplatonic vocabulary (the One, the henads, bound and the infinite, life, nature), Taylor's English forms and the other
  translators', fixed phrases ("the Good"), plain meanings labelled as the Workshop's, each form with a quotation the build
  finds (198 of 198). `tools/terms.py`, `reports/terms.md`.
- **Underlined in the text**: in Burnet's Greek where GLAUx's lemma is a term's (a very common word only as a name, neuter with
  the article: τὸ ἕν, τὸ ὄν, not τῷ ὄντι "in reality", LSJ); in the English only where the Greek of the same section has the
  term, or a fixed phrase as printed. 105 terms underlined (not those only the Definitions define, nor six topics of Alcinous'
  physics), 28,077 words. *Key terms* under Show turns them off.
- **The Term tab**: Taylor's explanation, the plain meaning, the definitions, every place in Plato by dialogue in the Platonist
  order with ‹ › to walk through them from where you are, the key passages, what the Platonists say, related terms.
- **The side panel is one place with tabs**: Word, Term, Notes, Links, Your work; the concept index's page and Taylor's
  glossary also open in it. The full pages stay as they are.
- Left for milestone 18, as planned: the same terms in the Neoplatonists' own texts (Taylor's English: "the One",
  "intellect", "progression"), so that a term's panel shows Plato and every Neoplatonist together. The forms are already
  in terms.json; procession, hyparxis, theurgy and the other later words have no word of Plato's to mark.

## Milestone 18: the Neoplatonists, linked and readable (paused, November 2026)

- The Neoplatonist shelf, read whole with contents: Proclus on the Timaeus (Taylor, 1820), Proclus' Theology
  (Taylor, 1816), Plotinus (Taylor, 1817), Iamblichus (Taylor, 1821), all already in `sources/`; OCR shown as received,
  with corrections kept separately.
- Extend milestone 17's term links into these texts by Taylor's own English terms (he uses a fixed vocabulary:
  "the One", "intellect", "dianoetic", "hyparxis"); common words only in his set phrases. A term's panel then shows
  its uses across Plato and every Neoplatonist together.
- A short plain-English summary at the head of each chapter, labelled as the Workshop's, pointing to the lines it rests on.
- A map of the Neoplatonic hierarchy (the One, Intellect, Soul, Nature, Body) drawn from Taylor's and Proclus' words;
  each level opens its passages.

## Milestone 19: the middle of each dialogue (paused, November 2026)

- Compute the middle of every dialogue from Burnet's Greek in several ways: letters (no spaces or punctuation, so it
  does not depend on word division, which the ancient books did not have), words, Stephanus sections, and
  standard ancient lines (stichoi). Show the passage at each middle and how far apart they fall.
- Say plainly which ideas are ancient and which modern: scriptio continua and ancient stichometry (sourced); J.B.
  Kennedy's stichometric theory that Plato placed key passages at the middle and at the twelfths (modern, 2010/2011,
  quoted, with its critics); anything the ancient Platonists say about a dialogue's centre (search the commentators).
- A marker in the reader at each dialogue's middle, and a page comparing the dialogues.

## Milestone 20: a reading path (paused, November 2026)

- Follow the curriculum dialogue by dialogue: for each, its aim (skopos) in the Prolegomena's and Proclus' words,
  Taylor's Introduction to it, the famous passages in it, and where to go next. Remember where the reader is.

## Milestone 21: the Greek scholia in English (paused, November 2026)

- The scholia to every dialogue (Hermann's Greek, 1853; about 44,000 Greek words of OCR) have no English translation in print.
  Translate them for the Workshop, dialogue by dialogue in the Platonist order (Alcibiades I first), labelled "Workshop
  translation" and kept in `sources/translations/scholia/<dialogue>.json`, keyed by the scholion's id and its first Greek words,
  like the Prolegomena. Several sessions; a test checks every scholion of a finished dialogue has its English.
- Mark the scans' unreadable places in brackets rather than guess, and note where a scholion quotes an author (Proclus, Olympiodorus).
- Then the longer Greek quotations inside the English commentaries (Adam, England, Archer-Hind quote Proclus and others at length):
  translate those of more than about twenty words, the same way, beginning with the dialogues read first.

## Milestone 22: voices inside the narrated dialogues (asked for by Daniel; paused, November 2026)

- In the narrated dialogues (Republic, Charmides and Lovers, told by Socrates; Phaedo, told by Phaedo; Parmenides, told by
  Cephalus; also the Symposium, told by Apollodorus, and the Protagoras, Euthydemus and Lysis, told by Socrates) the markup names only the
  narrator, so Listen reads Glaucon, Thrasymachus and Adeimantus in the narrator's voice. Mark who speaks each reported speech.
- **From the text, not guessed.** Each attribution rests on the Greek's own words and is stored with them: the speaker named
  at the speech (ὁ Γλαύκων ἔφη, ἔφη ὁ Θρασύμαχος), the narrator's own formulae (ἦν δ᾽ ἐγώ, ἔφην, εἶπον = the narrator), and the
  ἦ δ᾽ ὅς / ἔφη of an exchange whose two speakers the text has named. Write the rules down, apply them by program over Burnet,
  and keep the quotation each attribution rests on (`sources/structure/speakers-narrated.json`). Where the rules do not decide,
  leave the speech with the narrator and list it in a report; a person can then mark it by hand, with the words that decide it.
- Check the result against the speaker each English translation names in its own words ("said Glaucon"), and report every
  disagreement. Then Listen gives each a voice from `people.json`, as in the acted dialogues; the narrator's own "said he" stays
  in the narrator's voice.

## Milestones 23 to 34 (planned November 2026, approved by Daniel)

Three groups: the Greek New Testament first, since it fits the program as it is; then English of our own for the guides and
the Neoplatonists, because no modern English versions of them exist; then what is missing from the tradition; then what no one
could do before. The school and curriculum ideas are left out as beyond the scope.

## Milestone 23: the Greek New Testament (done)

- The Greek New Testament on the ancient shelf, by book, chapter and verse: the SBLGNT text with MorphGNT's lemma and parse for
  every word (both under licences that allow reuse; check and quote them), and the American Standard Version (1901, public domain)
  beside it as the English. Westcott and Hort (1881) may be offered as a second Greek text.
- The tap-a-word box, search by dictionary form, and the Term tab work on it as on Plato; a term's panel can then show where a
  word of Plato's (λόγος, νοῦς, ψυχή) is used in the New Testament, labelled as a different corpus.
- The Septuagint is milestone 34.
- Done: the 27 books on their own shelf, SBLGNT with MorphGNT's tagging and the ASV beside it, the word box (with the same word
  counted in Plato), the Concordance for either corpus, key terms underlined and listed in the Term tab under Plato's places,
  your translations on a verse (`tools/nt.py`, `reports/nt.md`). Left out: Westcott and Hort (no tagged copy with a reuse licence
  found) and the SBLGNT's variant readings.

## Milestone 24: modern English of Taylor's Introduction and the Life of Plato (done)

- No modern English versions exist, so make them: a plain modern rendering beside each paragraph of Taylor's General Introduction
  and Olympiodorus' Life of Plato, keeping every idea, in short sentences; Taylor's own wording always one tap away. Olympiodorus
  is made from the Greek, checked against Taylor.
- A short summary at the head of each section for the gist. Key terms always rendered the same way and linked to the Term tab.
- Labelled as the Workshop's own and machine-assisted; hard or disputed places flagged, with Taylor's words shown.
- A button to mark a sentence that reads badly or seems wrong; the marks are kept for revision.
- Done: all 178 paragraphs of the Introduction and the 26 of the Life (with the opening Taylor leaves out, from Hermann's
  Greek), 17 sections with summaries, the fixed renderings checked paragraph by paragraph, flags with Taylor's words, the
  Greek of the Life beside each paragraph, Modern / Side by side, and Mark a sentence kept in your database
  (`tools/modern.py`, `reader/modern.js`, `reports/modern.md`). Left for milestone 27: the quotations inside the
  Introduction (Proclus, Damascius, Simplicius) are modernised from Taylor's English, not translated afresh from the Greek;
  Taylor's footnotes are left as he printed them.

## Milestone 25: the rest of the Neoplatonists (done)

- Add the texts not yet in, in public-domain Greek editions, read whole with contents: the whole of Plotinus; Proclus on the
  Alcibiades, Republic, Parmenides and Cratylus, and the Elements of Theology; Iamblichus; Damascius; Hermias on the Phaedrus;
  Olympiodorus on the Alcibiades, Gorgias and Phaedo. Each edition named and its licence quoted; OCR shown as received,
  corrections kept separately.
- Done: 14 texts, over a million Greek words, on a shelf of their own (`#neo/plotinus-enneads`): Plotinus, Proclus' Republic
  and five works of Iamblichus from First1KGreek's TEI; Proclus on the Alcibiades, Parmenides and Cratylus, the Elements,
  Damascius on the first principles, Hermias on the Phaedrus and Olympiodorus on the Alcibiades from public-domain scans,
  OCR shown as received, page by page with the edition's page numbers and a link to the scan, corrections kept apart
  (`tools/neoplatonists.py`, `reader/neo.js`, `reports/neoplatonists.md`). Left out, with the reasons on the shelf:
  Olympiodorus on the Gorgias (no public-domain edition reachable) and on the Phaedo (no usable scan), Damascius' other
  commentaries, and the Greek of Proclus on the Timaeus and the Theology.

## Milestone 26: the commentators' Greek beside Taylor's English (done)

- Match Taylor's English (Proclus, Plotinus, Iamblichus) to the Greek of milestone 25, paragraph by paragraph, so the Greek of
  any passage is one tap from the English, with the tap-a-word box on it.
- Done: Taylor's fifteen treatises of Plotinus (187 chapters) and On the Mysteries (140 chapters) matched by his chapter numbers,
  which are the Greek editions', checked chapter by chapter by length; every paragraph carries its chapter's Greek, one tap away,
  and the Greek links back. Proclus' Elements: 211 propositions, 86 placed in Creuzer's OCR (found by his printed numbers, or
  machine-matched and checked by Taylor's terms), the other 125 shown with the pages they lie between, labelled
  (`tools/taylor_greek.py`, `reports/taylor_greek.md`). Left out: Taylor's Proclus on the Timaeus and the Theology (no Greek on
  the shelf), the Synesius extracts. Placing the rest of the Elements needs a cleaner Greek text (Dodds is in copyright) or a
  proofread of Creuzer's OCR.

## Milestone 27: modern English of the Neoplatonists (paused, November 2026)

- As milestone 24, for Proclus, Plotinus, Iamblichus and the others: made from the Greek, checked against Taylor and any other
  public-domain translation, so it does not inherit Taylor's oddities; where only Taylor's English exists, modernise his English.
  Begin with the texts read first in the curriculum. Several sessions.
- Session 1 done: Plotinus I.2 On the Virtues and I.3 On Dialectic, all 13 chapters, from Volkmann's Greek, checked against
  Taylor (21 flags), with treatise and chapter summaries, the Greek of every paragraph and Taylor's chapter a tap away, Modern /
  Side by side / Taylor only, Mark a sentence (`tools/modern_neo.py`, `sources/translations/modern/plotinus.txt`,
  `reports/modern_neo.md`, `reader/neo.js`).
- Session 2 done: the rest of Taylor's fifteen treatises of Plotinus, in Porphyry's order (II.4, II.9, III.6, III.7, IV.2,
  IV.3, IV.7, V.1, V.2, V.3, V.6, V.9, VI.9), added to the same file: 190 chapters and 329 flags in all, among them the places
  where Taylor's scan prints his footnotes into his text or loses lines (IV.3.21, IV.3.30, IV.7.8, V.3.8, V.9.3, VI.9.6), where
  the full Greek is translated and the gap flagged.
- Session 3 done: Proclus' prologue to the First Alcibiades (Cousin's vol. II pp. 2-46, 23 pages of Greek), proofread line by
  line from the page images into a master copy (`sources/neoplatonists/proofread/proclus-alcibiades.txt`), and the proofreading
  written as 437 line corrections in `sources/neoplatonists/corrections.json` by `tools/proofread.py` (the OCR still shown as
  received; *With corrections* reads the proofread page; lines the OCR dropped are restored). Then the prologue in modern English
  from the proofread Greek, in ten sections, checked against Taylor's Introduction to the dialogue (15 flags; his paragraphs
  2-6 and 8 are drawn from it), Plato's places noted and found in Burnet; `#neo-modern/proclus-alcibiades`, linked from each
  scanned page.
- Session 4 done: Proclus' notes on the wording of the dialogue's first words (103a; Cousin's vol. II pp. 49-78, 16 pages of
  Greek, the last down to the end of the notes on the wording), proofread in the same way (309 more line corrections, 746 in
  all), and put into modern English in seven sections: what the preface shows, the three kinds of turning, why Socrates says
  "I think", the young man's pride, "son of Cleinias", the father's name and love, and Socrates' three sciences, love first.
  Checked against Taylor's first Additional Note (on the preface, 103a) and paragraph 7 of his Introduction (13 flags); the
  Taylor box now names each paragraph or note it quotes (`taylor_notes_alcibiades` in `tools/modern_neo.py`).
- Session 5 done: Proclus' account of love (Cousin's vol. II pp. 78-101, 12 pages of Greek, down to the end of the account,
  "as the Eleatic Stranger says"), proofread in the same way (157 more line corrections). Two of its pages, pp. 81 and 94, are
  blank leaves in the scan; they are proofread from the Internet Archive's other scan of the same volume
  (`procliphilosophi00proc`), written `@page <leaf> | <page> | supplied from <url>` in the master copy, and `tools/proofread.py`
  writes them as corrections that fill the empty page, saying where they come from. Put into modern English as a new part,
  "On love: its orders, and the two kinds of lover", in six sections: love turns all things to divine beauty (the Symposium's
  "great daemon"), its ranks from the gods down, the souls who choose the life of love, true love and its counterfeit, five
  marks of the two lovers from Socrates' first words, and why he still calls the others lovers. Taylor draws nothing from
  these pages (his Introduction and notes skip from the preface to Alcibiades' pride, 104c), so there are no flags; Plato's
  places (Symposium 202d-e and 183e, Phaedrus 265c, Statesman 273d-e, Sophist 254a-b, the dialogue's own 103a and 131c-e) are
  noted and found in Burnet.
- Session 6 done: why Socrates loved first and stays (Cousin's vol. II pp. 101-125, 12 pages, down to "now a daemon, now a
  god"), proofread in the same way (227 more line corrections, 1130 in all), and put into modern English as a new part in six
  sections: first, with and after the others, as the One is; an image from the mysteries (with the Chaldean Oracles' verse);
  Socrates in the place of Alcibiades' good daemon; wonder, the start of philosophy; Alcibiades between Socrates and the vulgar
  lovers, as the rational soul between intellect and the many-headed beast; and the two readings joined, daemon to a man and
  intellect to a soul. Taylor draws nothing from these pages either. Plato's places (Phaedo 107d, Apology 31d, Theaetetus
  155d, Republic 588c, Timaeus 42c and 30b) are noted and found in Burnet. A word Cousin prints that is not Greek
  (ἀγητηρίων) is kept as printed and noted. The same session fixed the website build, broken since PR #38 (a function in
  `tools/build_site.py` named `serve` hid the `serve` module).
- Session 7 done: Cousin's vol. II pp. 125-137, to "let us take up the more secret accounts of love", proofread (136 more line
  corrections, 1266 in all) and added to the same part in three sections: why Alcibiades wonders (the many measure care by
  time, not by perfection); why the vulgar lovers keep the name of lover (one end for all lovers; madness above and below
  self-control, Phaedrus 244d; the divine gives even its image a trace of itself); and Socrates the only lover (131e; the
  Iliad's phantom of Aeneas). Where Cousin prints κατὰ ταυτὰ against both his manuscripts' ταύτας and the sense, the modern
  version follows the manuscripts and the note says so.
- Session 8 done: Cousin's vol. II pp. 137-145, the more secret account of love, proofread (72 pages, 1330 line corrections
  in all) and translated as a new part in three sections: love between the beloved and the lovers; the triad of faith,
  truth and love among the hidden intelligible gods (Timaeus 30d; the Chaldean Oracles, named without a fragment number);
  and love as the middle that binds, with the divine and the vulgar lover. Taylor draws nothing from these pages. Cousin's
  τοῖς δὲ (read as τοῖσδε) and πεπληθισμένως are kept as printed and noted. 
- Session 9 done: Cousin's vol. II pp. 145-162, on the words "the others came to talk to you in crowds, while I have not
  even spoken to you", proofread (81 pages, 1480 line corrections in all; p. 158, lost in the scan, supplied from the
  other scan) and translated as a new part in five sections: the two marks of providence, reaching all and mixed with
  none; the gods' love for what they beget (Phaedrus 244a, Phaedo 65d); why Socrates began with silence; what a crowd is
  (Timaeus 42c-d, Symposium 197d); and Alcibiades trained among the vulgar lovers, as the Athenian Stranger trains the
  young at drink (Laws 640c-d). Taylor draws nothing from these pages.
- Session 10 done: Cousin's vol. II pp. 162-182, on the words "the cause of this was not human, but a daemonic
  opposition", proofread (91 pages, 1647 line corrections in all) and translated as a new part in five sections: why
  Socrates names his daemon; why only the silence is laid to it; love as a great daemon (Symposium 212b, 202d,
  202e-203a; the Chaldean Oracles and the Orphic verses, cited from Hermann's Orphica); the three ranks of love answering
  to the three kinds of intellect; and why Socrates begins with love and ends with the daemon. Taylor draws nothing from
  these pages.
- Sessions 11-21 done: Cousin's vol. II pp. 185-289 (100 pages of Greek; pp. 187-188, 191-192 and 195 are Latin, and from
  p. 196 Cousin prints his Latin at the foot of the Greek), proofread (191 pages, 3406 line corrections in all) and
  translated as ten new parts, 36 sections: daemons in general and the daemons allotted to us; Socrates' own daemon; "whose
  power you will learn"; "now that it no longer opposes me"; then the next lemmas of the dialogue, 103b to 104e: how
  Alcibiades treated his lovers; praise that is a hidden accusation; beauty, family, friends, Pericles and wealth; the
  divine lover and the vulgar; the right moment (the Pythagoreans' name for the first cause); and how Socrates opens his
  speech. Each new lemma is its own paragraph, with a note naming its place in the dialogue. Checked against Taylor's
  Introduction and Additional Notes (10 more flags, 38 in all: e.g. Proclus quotes 124c where Taylor puts 105e, and names
  the Theages where Taylor has the Theaetetus); Cousin's misprints kept and noted.
- Session 22 done: the lemma "Ἐγὼ γὰρ, ὦ Ἀλκιβιάδη" (104e-105a), Cousin's vol. II pp. 289-297 down to "...τῆς ἐρωτικῆς
  ἐπιπνοίας ἀγαθῶν." (the rest of p. 297 is still the OCR), proofread (199 pages, 3573 line corrections in all) and
  translated as a new part, "If I saw you content with what is present": the nature worth loving, in three sections: the
  elements of a nature worth loving (Republic VI, Timaeus 48a); the soul's three lives, its echoes of the ruling life seen
  among the gods, and the followers of Zeus (Phaedrus 249e, 246e-247a, 252e); and the souls that come down from heaven
  (Republic 619b-d), timocracy the first step down (545a-c), and ambition the last tunic (the Chaldean Oracles, named
  without a fragment number). 84 sections, 207 paragraphs in all. Taylor draws nothing from these pages (his Additional
  Note on 104c, add002, comes from an earlier, parallel passage), so no flags. Cousin's λόγος (for λόγοι) and ἐκφάσεις
  (for ἐμφάσεις) kept and noted; the Latin at the foot of these pages is Ficino's (signed M. F.). Session 23, after milestone 35
  (next): from "Τοῦτο μὲν οὖν ὥσπερ πόρισμα" on p. 297 (leaf 324), the rest of the lemma's commentary. Next sessions, in this order: the rest of Proclus on the First Alcibiades (Taylor's Additional Notes
  to check against), and Olympiodorus on it (Creuzer's OCR, proofread first); then On the Mysteries and the Elements, where
  Taylor's English exists; then Damascius and Hermias. Plotinus' other treatises have no Taylor to check against: they are
  now the Enneads milestones (E1 onward, the current focus at the top of this file), checked against MacKenna's English.

## Milestone 35: modern English of Aristotle (35a, 35b, 35c and 35m1 to 35m6 done; paused after 35m6, November 2026; asked for by Daniel)

- As milestone 27 did for the Neoplatonists, for Aristotle: a modern English version beside the Greek, with Modern /
  Side by side views, Taylor's words a tap away, each section with its gist, and Mark a sentence.
- Made fresh from the Greek where no public-domain English exists; where it exists (Taylor, Thompson, Kenyon, and the
  others already on the shelf), modernise that English, checked against the Greek, and flag where the old English and the
  Greek differ. Labelled as the Workshop's own, machine-assisted, not yet checked by a scholar.
- Begin with the works the Platonists read first (the order of milestone A2: logic, then ethics, politics, physics and
  theology). Several sessions, one per thread.
- Split into sub-milestones, one thread each, in the order of reading (planned November 2026). Each one modernises the
  public-domain English already on the shelf where there is one (the Loeb English is shown, not modernised: it is not all
  free), checked against the Greek chapter by chapter, and makes a
  fresh version from the Greek where there is none:
  - 35a: the shared tooling, and the Categories (the first work read, after Porphyry's Introduction). Done: `tools/modern_ar.py`
    reads a master copy in milestone 27's format (`sources/translations/modern/aristotle-<slug>.txt`; `@ch Cat.5`, or `NE.I.5` for a
    work in books; `@taylor` names Taylor's chapters where his numbering differs) against the work's Greek from First1KGreek, chapter
    by chapter, keeps each paragraph's Greek with the Bekker columns it lies on (the reader's own), checks each flag against Taylor's
    chapter or another English of the work in `texts/aristotle/<slug>/`, and writes the JSON and `reports/modern_ar.md`. The page is
    milestone 27's (`#neo-modern/aristotle-categories`, `reader/neo.js`, served by `tools/serve.py` with `MODERN_NEO`), linked from
    the Aristotle shelf and the work (`AR_MODERN` in `reader/aristotle.js`). The Categories: 15 chapters, 66 paragraphs, modernised
    from Edghill (1928) against Bekker's Greek, compared with Taylor (1812) and Owen (1853), 12 flags. To add a work: write its
    master copy, add it to `TEXTS` in `tools/modern_ar.py`, to `MODERN_NEO` and to `AR_MODERN`.
  - 35b: On Interpretation (Edghill 1928, Owen 1853, Taylor 1812). Done: `sources/translations/modern/aristotle-on-interpretation.txt`,
    14 chapters, 45 paragraphs, modernised from Edghill against Bekker's Greek (the Greek, with Owen and Taylor, where the OCR of
    Edghill has lost words, in chapters 6, 9 and 14), 11 flags (Taylor's "passions
    of the soul", "from compact", "illiterate sounds", "inherent", "energies"; Edghill's "substantival", "natural means", "no real
    alternatives", "actually true", "every man is not", "primary substances"), at `#neo-modern/aristotle-on-interpretation`. Taylor's
    chapter 5 begins inside his chapter 4 in the scan, so chapter 5 shows both (`@taylor 4 5`). Words the shared check of key terms
    reads as ὁμοίωσις ("likeness") also match the adverb ὁμοίως ("likewise"): the modern version says "likewise" or "in like
    manner" there, which is right in any case.
  - 35c: the Prior Analytics (Jenkinson 1928, Owen, Taylor), planned as two sessions, done in one. Done:
    `sources/translations/modern/aristotle-prior-analytics.txt`, both books, 73 chapters (I.1-46, II.1-27), 202 paragraphs,
    modernised from Jenkinson against Ross's Greek (First1KGreek), 18 flags (Jenkinson's "perfect" syllogism, "per impossibile and
    by exposition", "cover unequal areas", "division into classes", "False cause"; Taylor's "be present with", "an imbecile
    syllogism", "pedestrious", "ostensive demonstration", "begging the question", "elenchus", "abduction" and "consentaneous"), at
    `#neo-modern/aristotle-prior-analytics`. The first work in books: `"books": True` in `TEXTS` keys Taylor's and the other
    English chapters by (book, chapter), wants one `@treatise` per book (`APr.I`, `APr.II`), and the page heads each chapter
    "Book I, chapter 5" (`nmChapterLabel` in `reader/neo.js`). Taylor folds I.27 into his 26 and I.38 into his 37, and numbers
    Book II his own way (his 1 = II.1-2, 3 = II.3-4, 8 = II.8-9, 14 = II.14-16, then II.17-27 = his 15-25), set with `@taylor`.
    The fixed renderings are in the master copy's header ("belong to" for Taylor's "be present with", "complete" for Jenkinson's
    "perfect", "setting out" for ἔκθεσις, "reduction to the impossible"); II.24 says "pattern" for παράδειγμα beside "example".
  - 35m: the **Metaphysics**, the current focus (moved ahead of 35d on November 13, 2026, at Daniel's asking). Ross's Oxford
    English (1908) modernised against Ross's Greek (Oxford 1924, Perseus), compared with Taylor (1801); the Loeb English
    (Tredennick) is shown in the reader but not modernised. One master copy, `sources/translations/modern/aristotle-metaphysics.txt`,
    grows a few books at a time: each sub-milestone adds its books to `"done_books"` in `TEXTS` (`tools/modern_ar.py`), and the
    check wants every chapter of those books and no others. Chapter ids are `Metaph.I.1` (Book Α, chapter 1) to `Metaph.XIV.6`;
    one `@treatise` per book (`Metaph.I`, `Metaph.II` ...). Taylor's chapters do not always match Bekker's: name his with `@taylor`
    (his Book I has seven chapters: his 6 = Bekker 6-7, his 7 = Bekker 8-10). Where the OCR of Ross has lost lines (it has, in
    I.9 and II.1-2), follow the Greek, with Taylor beside it. Fixed renderings are in the master copy's header; keep them.
    Each sub-milestone also adds a test class to `tests/test_modern_ar.py` and a few checks to `tests/modern_ar_browser.js`.
    - 35m1: Books Α and α (I and II), 13 chapters, 980a-995a: the desire to know, wisdom as the science of first causes,
      the earlier thinkers on the four causes, Plato, and the criticism of the Forms (I.9); the truth hard and easy, no
      infinite series of causes, and the method (II). Also the tooling for a work in Perseus' Greek done a few books at a
      time. Done: `sources/translations/modern/aristotle-metaphysics.txt`, 13 chapters, 67 paragraphs, 14 flags (Ross's
      "reason" for νοῦς, "essence" for τὸ τί ἦν εἶναι, "musical scale" for ἁρμονία, "the Forms—i.e. the Numbers" where the 1924
      Greek brackets "the Forms", "prime" for "first"; Taylor's "species of matter", "phantasm", "reasons" for arguments, and his
      note on the literal meaning), at `#neo-modern/aristotle-metaphysics`; chapters headed "Book Α (I), chapter 1"
      (`nmChapterLabel` in `reader/neo.js`). `greek_chapters_perseus` in `tools/modern_ar.py` reads the Greek with the reader's
      own walker (`aristotle.BekkerWalker`), one Bekker column a piece.
    - 35m2: Books Β and Γ (III and IV), 14 chapters, 995a-1012b: the fourteen puzzles (aporiai); the science of being as
      being, and the principle of non-contradiction defended. Done: 14 chapters, 67 paragraphs (33 in Β, 34 in Γ), 26 flags
      (among them Ross's "probable premises" for ἔνδοξα, "unity" and "unity-itself" for the One, "mensuration", "the ABC", "mythologists"
      for θεολόγοι, "of a low order", "hypostatize" for ἐκθέσθαι, "essence" for οὐσία in IV.2, "critical" for πειραστική,
      "logic" for the Analytics, "negatively" for ἐλεγκτικῶς, "unqualified" for ἄκρατος; Taylor's "capacity or energy",
      "formal cause", "dianoetic", "insane" of Hector, and a note of his from Syrianus read into III.2), with notes giving
      where the later books answer each puzzle. `"done_books": [1, 2, 3, 4]`. Taylor's Book Γ has seven chapters: his 1 =
      Bekker 1-2, his 2-7 = Bekker 3-8 (set with `@taylor`); in Book Β his chapters are Bekker's. The OCR of Ross has lost
      lines in IV.3 (1005b13-17), IV.5 (1009a18-22) and IV.6 (1011a26-28): the modern version follows the Greek there.
      The key-term check reads ὁμοίως as "like": say "likewise" (not "alike") where the Greek has it.
    - 35m3: Book Δ (V), 30 chapters, 1012b-1025a: the philosophical lexicon (principle, cause, element, nature, necessary,
      one, being, substance ...). Done: 30 chapters, 74 paragraphs, 52 flags (among them Ross's "beginning" for ἀρχή,
      "formula", "concept" and "conception" for λόγος, "faculty" for δύναμις, "prime mover" for the begetter in V.11,
      "non-natural" in V.4 against his own 1924 text, "characteristic angle", "scandal-monger" for συκοφάντης, "sketch" for
      σκιαγραφία, "totals" for πᾶν; Taylor's "free-will" for προαίρεσις, "passion" for πάθος, "perfect" for τέλειον, and a note
      of his read into V.1), with notes giving the Platonists' readings (the One as measure, the Good itself, limit and the
      unlimited, prior and posterior in nature). `"done_books": [1, 2, 3, 4, 5]`. Taylor's chapters of Book Δ are Bekker's.
      The OCR of Ross has lost lines in V.4, 6, 7, 10, 22, 23, 24, 27 and 28: the modern version follows the Greek there, and
      a flag or note says where. In this book δύναμις is "power" where Aristotle speaks of what can act or be acted on (V.12,
      V.15) and "potency" against actuality; ἕξις is "having" (V.20, first sense) or "state"; τέλειον "complete".
    - 35m4: Books Ε and Ζ (VI and VII), 21 chapters, 1025b-1041b: the divisions of theoretical science, being as accident
      and as true; substance as essence, the universal and the Forms (Ζ 13-16), substance as cause. Done: 21 chapters,
      79 paragraphs (14 in Ε, 65 in Ζ), 50 flags (among them Ross's "what we may call theology", "will" for προαίρεσις,
      "confectioner", "simple concepts and essences", "the individual" for τόδε τι, "abstract linguistic" for λογικῶς,
      "intelligible" for γνώριμον, "the Idea of good" and "the ideal animal" for αὐτὸ τὸ ἀγαθόν and αὐτὸ ζῷον, "complete reality"
      for ἐντελέχεια, "intuitive reason" for νόησις, "actual consciousness", "imperfect form" for πήρωμα, "in knowledge" against
      his own 1924 γενέσει in VII.13, "genus and differentia of substance", "efficient" and "final" cause; Taylor's "dianoetic",
      "formal cause" and "very nature of a thing" for τὸ τί ἦν εἶναι, "essence" for οὐσία, "a wooden triangle", "paradigm",
      "from equivocals", "from induction" for ἔκθεσις, "energy", "capacity", "participated properties", and his note on matter
      after Plotinus and Simplicius read into VII.3), with notes giving the Platonists' answers to Ζ 8 and 13-16 (Syrianus,
      Proclus on participation and the unparticipated). `"done_books": [1, 2, 3, 4, 5, 6, 7]`. Taylor's Book Ε has three
      chapters (his 3 = Bekker 3-4) and his Book Ζ sixteen (his 5 = Bekker 5-6, his 6-16 = Bekker 7-17), set with `@taylor`.
      Ross's 1924 text moves 1029b3-12 to the end of VII.3; the Workshop's Greek follows it, and a note says so. Fixed
      renderings added in the master copy's header: λογικῶς "in the manner of argument about words", τόδε τι "a this",
      ἔκθεσις "setting out examples", ταὐτόματον "chance" and τύχη "luck".
    - 35m5: Books Η and Θ (VIII and IX), 16 chapters, 1042a-1052a: matter and form, potency and actuality. Done: 16
      chapters, 47 paragraphs (18 in Η, 29 in Θ), 44 flags (among them Ross's "complete reality" for ἐντελέχεια, "the
      privation of positive character", "what most resembles full actuality", "object of reason" for νοητή, "an ideal animal
      and an ideal biped", "proximate matter" for ἐσχάτη ὕλη, "organic unity", "rational formula", "calorific" and
      "frigorific", "will" for προαίρεσις, "genus and differentia" of actuality, "substantiality", "the eternal prime mover",
      "the Idea of science", "geometrical relations" for διαγράμματα, "the actuality of thought", "essences" for ὅπερ εἶναί
      τι, and "in the strictest sense" where his 1924 Greek brackets κυριώτατα ὄν; Taylor's "mathematical species",
      "internal change", "trope", "transcendency", "energy", "duad", "may now be opportunely solved", "progression", "habit",
      "efficient cause", "impotency", "ablation", "dianoetic", "free-will", and his "even are equal to odd numbers" added
      in IX.4), with notes giving the Platonists' readings (Plotinus II.5 on potency and actuality and II.4 on intelligible
      matter, Proclus on participation, on evil and on Euclid I.32). `"done_books": [1, 2, 3, 4, 5, 6, 7, 8, 9]`. Taylor's
      chapters are Bekker's. The OCR of Ross has lost lines in VIII.3, VIII.4 and VIII.6; the modern version follows the
      Greek, and a flag says where. Fixed renderings added in the master copy's header: ἐνέργεια and ἐντελέχεια both
      "actuality" ("complete actuality" side by side), ἀδυναμία "incapacity", μετὰ λόγου "with reason", ἐσχάτη ὕλη "the last
      matter", ἐκείνινον "that-en", θιγεῖν "to touch". `terms-greek.json` gains an exception for τὸ νοητικόν in IX.10 ("the
      power of thinking", not "intelligible").
    - 35m6: Books Ι and Κ (X and XI), 22 chapters, 1052a-1069a: the one and the many; the summary of Β, Γ, Ε and of the Physics.
      Done: 22 chapters, 80 paragraphs (35 in Ι, 45 in Κ), 54 flags (among them Ross's "quarter-tone" for δίεσις, "the
      indefinite" for τὸ ἄπειρον, "indicated graphically", "easily-bounded continuum", "piercing" and "compressing" colours,
      "from the highest string to the lowest", "equinity", "the genus or family of the Heraclidae", "different in kind",
      "infimae species", "permanent or transient state", "ad hominem", "the essence depends on quality", "will" for choice,
      "spontaneity", "material universe" for the heaven, "reason" for νοῦς, "the completely real", "rolling" (not in his 1924
      Greek), "insecable", "concrete argument" and "organic unity"; Taylor's "inseparable" for χωριστῷ, "dianoetic", "vocal
      element", "participated properties", "than to gold" added, "the third signification of the similar", "co-ordination
      of predication", "habit", "impotency", "virtue of vice" turned round, "duad", "continued indefinite quantity", "man is
      not man from the matter", his note "Aristotle, therefore, cannot be serious" on X.10, "mathematical species", "the
      first philosophy", "energy" and "capacity", "accommodated manner", "impermeable", "number or the even" for air, "subject"
      for the positive term, "health" for ignorance, "discipline" and "the Calends to the Nones"), with notes giving the
      Platonists' answers (Plotinus and Proclus on the One beyond being and the categories, Proclus on the Form as cause and
      on means, the Laws against Protagoras, the Timaeus on the heavens). `"done_books": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]`.
      Taylor's chapters are Bekker's. The scan of Ross has lost a line in XI.6 and reads "ordered" for "unordered" in XI.8;
      the modern version follows the Greek, and a flag says where. Fixed renderings added in the master copy's header:
      δίεσις "quarter-tone", ἕξις "having", συστοιχία "column", διακριτικόν and συγκριτικόν "dividing" and "compressing",
      γένος and εἶδος "kind" and "form" in X.10, τὸ ἄπειρον "the infinite" in Book Κ, ὑποκείμενον "positive" in XI.11,
      πρὸς τόνδε "against this person", σύμφυσις "growing together".
    - 35m7: Book Λ (XII), 10 chapters, 1069a-1076a: the kinds of substance, the unmoved mover, the intellect that thinks
      itself, the spheres, the good of the universe; the summit of the course for the Platonists. One thread for this book alone. Next when the Aristotle work resumes (paused, November 2026).
    - 35m8: Books Μ and Ν (XIII and XIV), 16 chapters, 1076a-1093b: against the Forms and the Ideal Numbers, with a note on each
      chapter that Syrianus answers (his commentary on these books is on the commentators' shelf, A5; its English is A6, paused).
  - 35d: the Posterior Analytics (Mure 1928, Owen), two sessions. Next after the Metaphysics.
  - 35e: the Topics and the Sophistical Refutations (Pickard-Cambridge 1928, Owen), several sessions.
  - 35f: the Nicomachean Ethics (Taylor 1811, Chase 1847), several sessions.
  - 35g: the Eudemian Ethics, the Magna Moralia and On Virtues and Vices (fresh from the Greek, checked against the Loeb where Perseus has it).
  - 35h: the Politics, the Economics and the Constitution of the Athenians (fresh from the Greek, checked against the Loeb; Kenyon 1891 for the Constitution), several sessions.
  - 35i: the Physics (Hardie and Gaye 1930), several sessions.
  - 35j: On the Heavens (Stocks 1922), Generation and Corruption and the Meteorology (fresh from the Greek).
  - 35k: On the Soul (Hicks 1907) and the Parva Naturalia (fresh from the Greek).
  - 35l: the works on animals (Thompson's History of Animals 1910; the others fresh from the Greek), several sessions.
  - (35m, the Metaphysics, moved ahead of 35d: see above.)
  - 35n: the Rhetoric and the Poetics (Taylor 1811), then the mathematical, minor and spurious works, the Letters
    and the Divisions, fresh from the Greek.

## Milestone 28: the later readers (paused, November 2026)

- Ficino's Latin commentaries and translations, and the Byzantine and Arabic readers of Plato, in public-domain editions and
  translations where they exist; each labelled with its tradition and date.

## Milestone 29: the reverse map of the tradition (paused, November 2026)

- Find every place any Neoplatonist (and the later readers) quotes or alludes to each line of Plato: quotations by matching the
  Greek, allusions by the commentators' own references, each kept with the words it rests on and marked as quotation or
  allusion. Show them on the line in the reader, and a page of which passages the tradition used most and which it ignored.

## Milestone 30: the structure of every dialogue (paused, November 2026)

- Building on milestone 19 (the middle): the twelfths and other proportions of each dialogue, counted in the Greek, and what
  sits at each point, for all 36 dialogues side by side. Kennedy's theory quoted and labelled as modern, with its critics.

## Milestone 31: each dialogue's aim, as Proclus read it (paused, November 2026)

- Building on milestone 20: every dialogue laid out by its aim (skopos) in the Prolegomena's and Proclus' words, its parts, and
  the level of being it treats (in Taylor's and Proclus' words), all on one page, so the dialogues can be compared.

## Milestone 32: the translators word by word (paused, November 2026)

- Align Taylor, Jowett and the Loeb with Burnet's Greek word by word, and show where each translator added, left out or bent a
  word, with a summary per translator of what it shows about how he read Plato. The alignment is machine-made and labelled so.

## Milestone 33: argument maps (paused, November 2026)

- Each argument laid out step by step, premises and conclusion, each step quoting Plato's words; linked to the places where
  Proclus, Plotinus or the others defend or attack a step (from milestone 29). The steps are the Workshop's reading, labelled.

## Milestone 34: the Septuagint (paused, November 2026)

- The Greek Old Testament (Swete, 1887 to 1894, public domain), read from the scans, with English (Brenton, 1844) beside it.
  Harder than milestone 23: the good tagged digital texts cannot be reused, so the words are tagged by Morpheus and GLAUx-style
  matching, and marked as machine-tagged.

## Aristotle, read as the Platonists read him (planned November 2026, asked for by Daniel)

Daniel's aim: Aristotle in the Workshop with everything Plato has (the Greek, several translations side by side, notes,
key terms, listening, your own work), and read through the Platonic lens, as the late Platonists read him: his works as the
way up to Plato's, the two in harmony where they can be, the unmoved mover as Intellect, and Syrianus' replies where he
argues against the Forms. Public-domain texts and translations only. Taylor translated all of Aristotle (1806-1812) and
wrote a Dissertation on his philosophy (1812) from the Greek commentators; his volumes are the backbone of the English.
The same rules as for Plato: every claim quotes its source; nothing guessed; OCR shown as received, labelled.
Built by `tools/aristotle.py` (works of corpus `aristotle`, a Bekker column, 980a, for a Stephanus section) and
`tools/aristotle_ocr.py` (the scanned translations); in the reader, `reader/aristotle.js`.

### A1: the Metaphysics and the Nicomachean Ethics (done)

- Ross's Greek (1924) and Bywater's (1894) from Perseus, every word tagged by GLAUx (as Plato), the tap-a-word box,
  Middle Liddell and LSJ; Bekker's pages and columns for navigation; books and chapters in the contents column.
- Side by side: the Loeb English (Tredennick, Rackham) with its notes; for the Metaphysics, Ross's Oxford translation
  (1908, Bekker's columns read from his margin as fixed points) and Taylor's (1801, placed by alignment, ≈) with his
  notes from Alexander and Syrianus under the text; for the Ethics, Chase (1847, Gutenberg, ≈).
- Taylor's Introduction to the Metaphysics and his Additional Notes on the Ideas, read whole (`#taylor/metaphysics-introduction`).
- Key terms underlined in the Greek (kept in `ar_term_hit`, apart from Plato's counts); a term's panel shows Aristotle
  after Plato. Your translations and notes, and Listen, work as on a dialogue.

### A2: Taylor's Dissertation on the Philosophy of Aristotle (1812), and the Platonists' order of reading (done)

- The Dissertation read whole (`#taylor/aristotle-dissertation`), its four books and fifty chapters in the contents column:
  from the Internet Archive's scan of the Harvard copy (public domain), OCR cleaned by rule by `tools/aristotle_dissertation.py`
  (the passages Taylor quotes from Aristotle and the commentators kept as quotations, told from his own text and from the
  footnotes by the leading of the type); unproofread, every paragraph keeps its OCR. Also his Preface, his Explanation of
  Certain Terms used by Aristotle and his Greek Commentators, and the Additional Note on Parmenides from Simplicius.
- *Start here* for Aristotle (`#aristotle`): why the Platonists read him first (Marinus on Proclus reading "all the works of
  Aristotle ... as in certain proteleia ... and lesser mysteries", in Taylor's translation), the order of reading (logic,
  ethics, politics, physics, theology, then Plato; each work linked once it is in the Workshop), how he writes, and where he
  agrees with Plato, all in Taylor's words, each passage checked by eye against the scan and tested against its OCR.
- The Greek prolegomena to Aristotle (Ammonius, Simplicius, Philoponus, Olympiodorus, Elias, David on the ten questions
  asked before reading him) move to A5, with the other Greek commentators: Taylor's Book I chapter 1 already gives their
  answers in English.

### A3: the soul and nature: De Anima, Physics, De Caelo (done)

- The Greek from First1KGreek (CC BY-SA 4.0): Ross's Physics (Oxford, 1960 printing) and De Anima (1956), Prantl's De Caelo
  (Teubner, 1881), read by `tools/aristotle_f1k.py`; every word's dictionary form and grammar from GLAUx, aligned chapter by
  chapter. Bekker's columns: GLAUx's, word by word, for the Physics (167 of 167) and De Caelo (91 of 92); for De Anima, those
  printed in the margin of the TEI (64 of 68; four misprinted in the TEI are left out, their text under the column before).
- English from the Internet Archive's scans, cleaned by rule by `tools/aristotle_trans.py`, not proofread, every paragraph
  keeping its OCR: Hardie and Gaye's Physics (Oxford, 1930; public domain in the US from 2026) and Stocks's De Caelo (Oxford,
  1922), with their footnotes, where they print Bekker's columns in the margin (148 and 68 read from the scan); Hicks's De Anima
  (Cambridge, 1907), at the Bekker lines heading each page of his English (70 pages), his Greek apparatus and side-notes left
  out. Between two columns read from the scan the rest are shared out over the text by its length, cut at a sentence's end (≈).
- Taylor's own Physics, De Caelo and De Anima (1806-1808) are not on the Internet Archive as complete scans (a 56-leaf fragment
  of the De Anima only); they wait for a scan. Wallace's De Anima (1882) is left for A8. The commentators on De Anima III 5
  (the intellect that makes all things) come with their shelf, in A5.

### A4: the Organon (done) and Porphyry's Isagoge (done)

- The six treatises (Categories, On Interpretation, Prior and Posterior Analytics, Topics, Sophistical Refutations), Greek from
  First1KGreek (CC BY-SA 4.0), every word tagged from GLAUx: Ross's Analytics (Oxford, 1964), with Bekker's columns in its
  margin, split into the two works; Bekker's own text of the other four, in his Oxford reprint (1837), which is paged anew and
  does not print the Berlin columns. For these the columns are carried over from the English, chapter by chapter, at the same
  proportion of the chapter (≈), and the reader says so on the work's first page.
- English: the Oxford translation, The Works of Aristotle vol. I (1928; Edghill, Jenkinson, Mure, Pickard-Cambridge; public
  domain in the US since 2024), from the Internet Archive's scan, cleaned by rule by `tools/aristotle_organon.py`, not
  proofread. Its margin prints Bekker's line numbers and columns, and the chapters on the other side: a column is placed where
  its mark is read; where the mark is lost, where the line numbers start again, or at the page the running head names (≈).
  Translators' footnotes are kept; textual notes are left out.
- Porphyry's Introduction, the door to the Organon (A4b, done): Busse's Greek (CAG IV.1, Berlin, 1887) from First1KGreek on the
  Neoplatonists' shelf, by Busse's pages; Owen's English (The Organon, vol. II, Bohn, 1853, pp. 609-633) read whole at
  `#taylor/porphyry-introduction`, cleaned by rule by `tools/aristotle_porphyry.py`, not proofread: its 17 chapters, Owen's
  footnotes matched to their marks where the scan reads them, and his side-notes (a summary of the argument in the margin) where
  the scan could read them; the rest are left out and counted. Linked from the Aristotle shelf, Start here (before the Logic
  step) and the six logical works.
- Owen's Organon as a second English (A4c, done): Octavius Freire Owen, Bohn's Classical Library (1853), vol. I (Categories, On
  Interpretation, both Analytics; the Toronto copy) and vol. II (Topics, Sophistical Elenchi), from the Internet Archive's scans,
  cleaned by rule by `tools/aristotle_owen.py` (the rules that read the Isagoge, at each scan's scale), not proofread. Owen prints no
  Bekker columns: they are carried over from the Oxford's, chapter by chapter, at the same proportion of the chapter (≈). His
  footnotes, and the side-notes the scans could read, are kept as notes.
- Not done in A4: Taylor's Organon, in his Works of Aristotle (1806-1812). A first search of the Internet Archive found no scan;
  a second, volume by volume, found Google's scan of the Harvard copy of vol. I (1812: the Introduction, the Categories with
  Simplicius' notes, On Interpretation, the Prior Analytics; item `works00taylgoog`) and of the Oxford copy of the Rhetoric, Poetic
  and Nicomachean Ethics (1811; `rhetoricpoetica03arisgoog`). Both are added in A8. HathiTrust holds more of the Works in full
  view (the New York Public Library's 1806 set, Harvard's 1812 set, Georgia's Great and Eudemian Ethics, Politics and Economics)
  but serves them only to a browser; a volume downloaded by hand can be added the same way.

### A5: the Greek commentators on Aristotle, on their own shelf (done)

- Thirty-four texts of the *Commentaria in Aristotelem Graeca* (Berlin, 1882-1909) and its Supplementum, in First1KGreek's corrected
  TEI (CC BY-SA 4.0) rather than the scans' OCR, since First1KGreek has them: the introductions to philosophy and to Aristotle
  (Ammonius, Olympiodorus, Elias and David, with the commentaries on Porphyry's Introduction); the Categories (Porphyry, Ammonius,
  Philoponus, Olympiodorus, Elias, Simplicius); On Interpretation (Ammonius); the Analytics (Alexander, Ammonius, Philoponus); the Topics
  (Alexander); the Sophistical Refutations (pseudo-Alexander); the Physics (Simplicius, Philoponus); On the Heavens (Simplicius);
  Generation and Corruption, the Meteorology, Sense, Generation of Animals (Alexander, Philoponus, Olympiodorus, Michael); On the Soul
  (pseudo-Simplicius, Philoponus, and Alexander's own treatise and Mantissa, with On the Intellect, for De Anima III 5); the
  Metaphysics (Alexander, Syrianus, Asclepius). Read by `tools/aristotle_commentators.py`, page by page of the Berlin edition, with the
  editor's apparatus and marginal notes; stored and shown with the Neoplatonists of milestone 25, on their own shelf under Aristotle.
- Each page linked to the Bekker columns it comments on: printed, where the editor gives the reference in the margin; quoted (≈),
  where the page repeats at least two runs of five words found in one column of the work only. The commentaries on Porphyry are
  linked to Busse's pages of the Introduction in the same way. Each column of Aristotle lists the pages on it.
- Not here: the CAG volumes First1KGreek does not have (Themistius, Dexippus, Michael of Ephesus on the Ethics, Eustratius,
  Stephanus, Philoponus Against Proclus); First1KGreek's Simplicius on the Physics lacks pp. 552-800 (the end of Book IV, with the
  Corollaries on place and time). Both are listed in `reports/commentators.md`, for a later milestone from the scans.

### A6: Syrianus' replies on the Forms, in English (paused, November 2026)

- Syrianus on Metaphysics Μ and Ν in the Workshop's own English from Kroll's Greek, checked against Taylor's extracts,
  labelled as the Workshop's translation; shown under Aristotle's text where it answers it.

### A7: Plato and Aristotle together (done)

- The concordance across Aristotle (`ar_lemma_count`, `ar_form_count`): the word search and a word study take Aristotle as a
  corpus of his own, beside Plato and the New Testament, and a word's panel shows the same dictionary form in the other philosopher.
- The citation web from Aristotle to Plato (`tools/aristotle_plato.py`, `ar_plato`), read by rule: where Aristotle's Greek names a
  dialogue ("ἐν τῷ Τιμαίῳ", "ἐν δὲ τῷ Φαίδωνι") or Plato, and where a translator's note on the column cites a passage of Plato by
  title and page, read by the rules of the citation web (milestone 8) and checked against Burnet's sections. A column of Aristotle
  shows the Plato it names or cites; a section of Plato shows where Aristotle discusses it; the page *Aristotle on Plato* lists them all.
- *Plato and Aristotle reconciled*: the commentators on the Forms (Asclepius), the soul (Philoponus), the eternity of the world and
  God as maker (Simplicius), with Simplicius' rule of reading, each quoted in their Greek from the page and checked by test against it
  and against the column it is linked to; the English is the Workshop's own and labelled so.

### A8: the rest of Aristotle (done, but for the optional English of the minor works)

- Every other work in First1KGreek or Perseus Greek, GLAUx-tagged, with the Loeb English where Perseus has it
  (Politics, Rhetoric, Poetics, Eudemian Ethics) and Taylor's for the rest, in the Platonists' order.
- Taylor's Organon, vol. I (1812: the Categories, On Interpretation, the Prior Analytics), and his Nicomachean Ethics
  (1811), from Google's scans (see A4), as translations beside the Greek (done): read by `tools/aristotle_taylor.py` with the
  rules of his Metaphysics, the page brought to that scan's scale, his notes from the commentators kept apart; the Organon at the
  Oxford's columns carried over chapter by chapter, as Owen's, and the Ethics placed against the Loeb English, as his Metaphysics.
  His Rhetoric and Poetic (1811) are read the same way, beside the Greek of the next point (done). Not yet read: his translation of
  Porphyry's Introduction and his Introductions to each treatise (vol. I).
- The works Perseus has with a Loeb English (done): the Eudemian Ethics (Susemihl; Rackham), the Politics (Ross; Rackham),
  the Economics (Armstrong), the Rhetoric (Ross; Freese) and the Poetics (Fyfe), at Bekker's columns as Perseus marks them,
  GLAUx-tagged; for the Rhetoric and the Poetics, which GLAUx divides by chapter only, each GLAUx word takes the column of the
  Perseus word it is matched to (`aristotle.glaux_resection`).
- The works First1KGreek has in Greek only whose source gives Bekker's columns (A8c, done): the Magna Moralia (Susemihl, 1883),
  Generation and Corruption (Prantl, 1881), Meteorology (Fobes, 1919), Progression and Movement of Animals (Jaeger, 1913), with
  the columns read from the margin of the TEI; Parts of Animals (Langkavel, 1868) and Generation of Animals (Bekker, 1829), with
  GLAUx's. A column the margin (or GLAUx) lacks is placed by the length of the text between the columns either side (≈), and the
  reader names it (`aristotle_f1k.fill_gaps`, `AR_BY_LENGTH`). GLAUx numbers De motu and De incessu the other way round from the
  TLG (`glaux` in `WORKS`). The commentators on Generation and Corruption, the Meteorology and Generation of Animals (Philoponus,
  Alexander, Olympiodorus, Michael) are now linked to the columns. No English for these yet.
- The Parva Naturalia and the History of Animals (A8d, done), in Bekker's Oxford reprint (1837) from First1KGreek, GLAUx-tagged.
  Their Berlin columns come from scans: for the Parva Naturalia (On Sense, Memory, Sleep, Dreams, Divination, Length of Life,
  Youth and Old Age, Respiration), from the margin of Biehl's Teubner Greek (1898; `ia-biehl-parva-naturalia-1898`), whose
  words are paired one by one with Bekker's (92% paired) and each column begun at the first word of the line where Biehl prints
  it (`tools/aristotle_biehl.py`; a misread page is resolved by the length of the Greek between marks, 60 of 90 columns read);
  for the History of Animals, from the margin of Thompson's Oxford translation (1910; `ia-thompson-historia-1910`), chapter by
  chapter as the Organon's (`aristotle_organon.CARRIED`; the book read from the running head too; a chapter anchor that would
  stretch the Greek out of proportion is left out; Book X, which Thompson does not translate, by length). The rest by length
  (≈), named in the reader (`AR_BY_LENGTH`). Thompson's English is beside the Greek. Alexander on Sense is linked. The Oxford
  Parva Naturalia (Beare and Ross) was not used: its 1908 issue is not on the Archive, and the 1931 reprint is not yet free.
- The minor and spurious works (A8e, done), in Greek only, from First1KGreek: Bekker's own text (Oxford, 1837) of the Mechanics,
  On Indivisible Lines, On Melissus, Xenophanes and Gorgias, On Colours, On Things Heard, the Physiognomics, On Plants, On Marvellous
  Things Heard and the Winds, at the Berlin columns First1KGreek marks in it as milestones (`<milestone unit="page" resp="Bekker">`,
  read by `aristotle_f1k.read_tei`), every column present; the Problems (Ruelle, Knoellinger and Klek, 1922), the same; On Breath
  (Jaeger, 1913), from its margin, two columns by length (≈); Ross's other versions of Physics VII and of passages of On the Soul II,
  from his margin. On Plants is read without the Byzantine translator's prologue, which is not on Bekker's Berlin pages (its
  milestones repeat the columns of the end of the Physiognomics). GLAUx-tagged, paired with our words by whole work or by chapter
  where the two divide a work differently (`aristotle_f1k.pair_key`); GLAUx lacks On Things Heard, On Indivisible Lines and the
  Winds, whose words carry Morpheus's parses only, as the reader says. The Mechanics and On Indivisible Lines are a new step in the
  order of reading, *Mathematics*, from Taylor's division ("mathematical, such as his Mechanical Problems, and his treatise On
  Indivisible Lines").
- The works not on Bekker's pages, and On Virtues and Vices (A8f, done). Bekker did not print the Constitution of the Athenians
  (found on a papyrus in 1890), the Letters or the Divisions, so each is cited by its own numbers (`tools/aristotle_cited.py`),
  in the reader's form for a chapter and verse (milestone 23's): a section is "chapter:number", a page of the reader is the
  chapter, and the reader shows each in its own form (`AR_CITED` in `reader/aristotle.js`). The Constitution in Kenyon's Greek
  (Oxford Classical Texts, 1920; Perseus), by chapter and section (42.1 is `42:1`, on page 42), with Kenyon's English (first
  published 1891; Project Gutenberg #26095, committed in `sources/aristotle/kenyon-athenian-constitution/`), each chapter at its
  first section and the sections within it shared out by length (≈); the four fragments of the lost beginning are left out. The
  Letters in Hercher's Greek (Epistolographi Graeci, 1873; First1KGreek), by letter (`3:1` is the third, whole). The Divisions in
  Mutschmann's (Leipzig, 1906; First1KGreek), both his texts, by his numbers: Diogenes Laertius' (III 80-109; page 1, "Diogenes 5"
  is `1:5`) and the codex Marcianus' (page 2, "Marcianus 58" is `2:58`), where the Marcianus has two divisions against one of
  Diogenes', each its own section. On Virtues and Vices in Bekker's Greek (1831) from Perseus, which has no English for it:
  `build_db.build_work` now reads a Perseus work with no English file. All four GLAUx-tagged: the Constitution chapter by
  chapter, the Letters as a whole, and GLAUx's twenty-one Divisions (its own selection and numbering) each paired with the
  division of Mutschmann's it matches best; the other Divisions carry Morpheus's parses. The Letters and the Divisions are a
  last group in the order of reading, *Beside the course* (Taylor's division does not name them).
- What is left of A8, for a later thread:
  1. English for the minor works: the Oxford translation, vol. VI (Opuscula, 1913), vol. VII (the Problems, Forster, 1927) and, for
     On Virtues and Vices, vol. IX (Solomon, 1915), are public domain in the US; read from scans as Thompson's History of Animals,
     if wanted. No public-domain English of the Letters or the Divisions has been looked for.
  2. Optional: Taylor's translation of Porphyry's Introduction and his Introductions to the Categories, On Interpretation and the
     Prior Analytics (vol. I, leaves 59-72, 149-155, 205-212 of `ia-taylor-organon-1812`; already in `PARTS` in
     `tools/aristotle_taylor.py`, not yet written out as texts).
- Then A6 (Daniel: "Do A7 and A8 first, A6 last").

## Ideas noted, not yet planned

- **Audio of the Greek.** A restored-pronunciation reading would have to come from a recording whose licence allows
  it; to research. Free human recordings of the English (LibriVox) could be offered beside the browser's speech.
