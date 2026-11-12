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

## Milestone 18: the Neoplatonists, linked and readable

- The Neoplatonist shelf, read whole with contents: Proclus on the Timaeus (Taylor, 1820), Proclus' Theology
  (Taylor, 1816), Plotinus (Taylor, 1817), Iamblichus (Taylor, 1821), all already in `sources/`; OCR shown as received,
  with corrections kept separately.
- Extend milestone 17's term links into these texts by Taylor's own English terms (he uses a fixed vocabulary:
  "the One", "intellect", "dianoetic", "hyparxis"); common words only in his set phrases. A term's panel then shows
  its uses across Plato and every Neoplatonist together.
- A short plain-English summary at the head of each chapter, labelled as the Workshop's, pointing to the lines it rests on.
- A map of the Neoplatonic hierarchy (the One, Intellect, Soul, Nature, Body) drawn from Taylor's and Proclus' words;
  each level opens its passages.

## Milestone 19: the middle of each dialogue

- Compute the middle of every dialogue from Burnet's Greek in several ways: letters (no spaces or punctuation, so it
  does not depend on word division, which the ancient books did not have), words, Stephanus sections, and
  standard ancient lines (stichoi). Show the passage at each middle and how far apart they fall.
- Say plainly which ideas are ancient and which modern: scriptio continua and ancient stichometry (sourced); J.B.
  Kennedy's stichometric theory that Plato placed key passages at the middle and at the twelfths (modern, 2010/2011,
  quoted, with its critics); anything the ancient Platonists say about a dialogue's centre (search the commentators).
- A marker in the reader at each dialogue's middle, and a page comparing the dialogues.

## Milestone 20: a reading path

- Follow the curriculum dialogue by dialogue: for each, its aim (skopos) in the Prolegomena's and Proclus' words,
  Taylor's Introduction to it, the famous passages in it, and where to go next. Remember where the reader is.

## Milestone 21: the Greek scholia in English

- The scholia to every dialogue (Hermann's Greek, 1853; about 44,000 Greek words of OCR) have no English translation in print.
  Translate them for the Workshop, dialogue by dialogue in the Platonist order (Alcibiades I first), labelled "Workshop
  translation" and kept in `sources/translations/scholia/<dialogue>.json`, keyed by the scholion's id and its first Greek words,
  like the Prolegomena. Several sessions; a test checks every scholion of a finished dialogue has its English.
- Mark the scans' unreadable places in brackets rather than guess, and note where a scholion quotes an author (Proclus, Olympiodorus).
- Then the longer Greek quotations inside the English commentaries (Adam, England, Archer-Hind quote Proclus and others at length):
  translate those of more than about twenty words, the same way, beginning with the dialogues read first.

## Milestone 22: voices inside the narrated dialogues (asked for by Daniel)

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

## Milestone 27: modern English of the Neoplatonists

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
  version follows the manuscripts and the note says so. Next sessions, in this order: the rest of Proclus on the First
  Alcibiades, from the more secret account of love and Socrates' daemon (II p. 137 on; Taylor's note on the daemon at 103a and his Additional Notes 2-19 to check against),
  and Olympiodorus on it (Creuzer's OCR, proofread first); then On the Mysteries and the Elements, where
  Taylor's English exists; then Damascius and Hermias. Plotinus' other treatises have no Taylor to check against: check
  them against another public-domain translation, or label them so.

## Milestone 28: the later readers

- Ficino's Latin commentaries and translations, and the Byzantine and Arabic readers of Plato, in public-domain editions and
  translations where they exist; each labelled with its tradition and date.

## Milestone 29: the reverse map of the tradition

- Find every place any Neoplatonist (and the later readers) quotes or alludes to each line of Plato: quotations by matching the
  Greek, allusions by the commentators' own references, each kept with the words it rests on and marked as quotation or
  allusion. Show them on the line in the reader, and a page of which passages the tradition used most and which it ignored.

## Milestone 30: the structure of every dialogue

- Building on milestone 19 (the middle): the twelfths and other proportions of each dialogue, counted in the Greek, and what
  sits at each point, for all 36 dialogues side by side. Kennedy's theory quoted and labelled as modern, with its critics.

## Milestone 31: each dialogue's aim, as Proclus read it

- Building on milestone 20: every dialogue laid out by its aim (skopos) in the Prolegomena's and Proclus' words, its parts, and
  the level of being it treats (in Taylor's and Proclus' words), all on one page, so the dialogues can be compared.

## Milestone 32: the translators word by word

- Align Taylor, Jowett and the Loeb with Burnet's Greek word by word, and show where each translator added, left out or bent a
  word, with a summary per translator of what it shows about how he read Plato. The alignment is machine-made and labelled so.

## Milestone 33: argument maps

- Each argument laid out step by step, premises and conclusion, each step quoting Plato's words; linked to the places where
  Proclus, Plotinus or the others defend or attack a step (from milestone 29). The steps are the Workshop's reading, labelled.

## Milestone 34: the Septuagint

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
- Still to come in A4: Owen's Organon (1853) as a second English; Taylor's (1812) if a scan is found.

### A5: the Greek commentators on Aristotle, on their own shelf

- From the *Commentaria in Aristotelem Graeca* (Berlin, 1882-1909, public domain): Syrianus on the Metaphysics (Kroll, 1902,
  on the Archive), Simplicius on the Categories and the De Caelo, Ammonius, Philoponus, Asclepius; OCR shown as received,
  page by page with a link to the scan, as the Neoplatonists of milestone 25. Each comment linked to the Bekker column it is on.

### A6: Syrianus' replies on the Forms, in English

- Syrianus on Metaphysics Μ and Ν in the Workshop's own English from Kroll's Greek, checked against Taylor's extracts,
  labelled as the Workshop's translation; shown under Aristotle's text where it answers it.

### A7: Plato and Aristotle together

- The citation web from Aristotle to Plato (his references to the dialogues, Ross's and Tredennick's notes), so a
  passage of Plato shows where Aristotle discusses it; the concordance (search) across Aristotle; Reconciliations
  between Plato and Aristotle as the commentators record them (the Forms, the soul, the eternity of the world, the
  Good and the unmoved mover), established readings quoted, proposed ones labelled.

### A8: the rest of Aristotle

- Every other work in First1KGreek or Perseus Greek, GLAUx-tagged, with the Loeb English where Perseus has it
  (Politics, Rhetoric, Poetics, Eudemian Ethics) and Taylor's for the rest, in the Platonists' order.

## Ideas noted, not yet planned

- **Audio of the Greek.** A restored-pronunciation reading would have to come from a recording whose licence allows
  it; to research. Free human recordings of the English (LibriVox) could be offered beside the browser's speech.
