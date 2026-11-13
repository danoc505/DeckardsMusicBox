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

### The milestones (Greek words in brackets)

- **E1: I.1, What is the living being, and what is the human being? (2,682) (done).** MacKenna's vol. I brought in
  (`tools/mackenna.py`); `tools/modern_enneads.py`, the reader page with the whole Enneads in Porphyry's order, links from the
  Neoplatonists' shelf and from each chapter of the Greek; I.1 in 13 chapters, 25 paragraphs, 11 flags against MacKenna (e.g.
  he puts the "soul that weaves" in Plato, where Plotinus is quoting Aristotle, On the Soul 408b; he has God "contained in" the
  intelligible, where the Greek has him "riding upon" it), and notes on Aristotle's On the Soul, the Timaeus, the Republic's beast
  and Glaucus, and Homer's Heracles.
- E2: I.4 On happiness, I.5 Whether happiness grows with time (5,565).
- E3: I.6 On beauty, I.7 On the first good and the other goods (3,753).
- E4: I.8 What evils are, and where they come from, I.9 On going out of life (4,533). MacKenna's I.8 has 12 chapters for
  Volkmann's 15: name his chapters with `@older`, and check that tools/mackenna.py reads his chapter numbers there.
- E5: Porphyry's Life of Plotinus, chapters 1-12. Porphyry set it before the Enneads, and its English is in MacKenna's vol. I;
  but its Greek is not yet in the Workshop (First1KGreek has no Vita Plotini): bring in Volkmann's vol. I (1883), which opens with the
  Life (check this in the scan), as an Internet Archive scan on the Neoplatonists' shelf, and proofread its pages as Proclus' commentary was
  (`tools/proofread.py`), then translate. Placed after Ennead I because of that extra work; Daniel may move it first, or drop it.
- E6: Porphyry's Life of Plotinus, chapters 13-26 (Porphyry's account of the order of the treatises, and his edition).
- E7: II.1 On the heaven, II.2 On the movement of the heaven (3,747); MacKenna's vol. II (1921).
- E8: II.3 Whether the stars are causes (4,489).
- E9: II.5 On what is potential and what is actual, II.6 On substance, or on quality, II.7 On complete blending, II.8 On
  sight (4,430).
- E10: III.1 On destiny (2,648).
- E11: III.2 On providence, first part (6,582).
- E12: III.3 On providence, second part, III.4 On the daemon allotted to us (4,044).
- E13: III.5 On love (3,531).
- E14: III.8 On nature, contemplation and the One, III.9 Various considerations (5,035).
- E15: IV.1 On the being of the soul, first part, and IV.4 chapters 1-17 (about 5,000); MacKenna's vol. III (1924).
- E16: IV.4 chapters 18-31 (about 4,700).
- E17: IV.4 chapters 32-45 (about 4,600).
- E18: IV.5 On sight, IV.6 On perception and memory (4,686).
- E19: IV.8 On the descent of the soul into bodies, IV.9 Whether all souls are one (4,062).
- E20: V.4 How what comes after the first comes from it, V.5 That the intelligibles are not outside intellect (5,314);
  MacKenna's vol. IV (1926).
- E21: V.7 Whether there are forms of individuals, V.8 On intelligible beauty (5,221).
- E22: VI.1 On the kinds of being, first part, chapters 1-15 (about 4,900); MacKenna's vol. V (1930).
- E23: VI.1 chapters 16-30 (about 4,900).
- E24: VI.2 On the kinds of being, second part (7,442).
- E25: VI.3 On the kinds of being, third part, chapters 1-14 (about 4,700).
- E26: VI.3 chapters 15-28 (about 4,700).
- E27: VI.4 That being, one and the same, is everywhere whole, first part (5,731).
- E28: VI.5 the same, second part (3,658).
- E29: VI.6 On numbers (6,963).
- E30: VI.7 How the many forms came to be, and on the Good, chapters 1-14 (about 4,800).
- E31: VI.7 chapters 15-28 (about 4,800).
- E32: VI.7 chapters 29-42 (about 4,800).
- E33: VI.8 On free will and the will of the One (7,778).
- E34 (optional): MacKenna's English beside the fifteen done with Taylor too, and their flags checked against him, so that the
  whole Enneads read the same way.

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
