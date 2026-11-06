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

## Milestone 25: the rest of the Neoplatonists

- Add the texts not yet in, in public-domain Greek editions, read whole with contents: the whole of Plotinus; Proclus on the
  Alcibiades, Republic, Parmenides and Cratylus, and the Elements of Theology; Iamblichus; Damascius; Hermias on the Phaedrus;
  Olympiodorus on the Alcibiades, Gorgias and Phaedo. Each edition named and its licence quoted; OCR shown as received,
  corrections kept separately.

## Milestone 26: the commentators' Greek beside Taylor's English

- Match Taylor's English (Proclus, Plotinus, Iamblichus) to the Greek of milestone 25, paragraph by paragraph, so the Greek of
  any passage is one tap from the English, with the tap-a-word box on it.

## Milestone 27: modern English of the Neoplatonists

- As milestone 24, for Proclus, Plotinus, Iamblichus and the others: made from the Greek, checked against Taylor and any other
  public-domain translation, so it does not inherit Taylor's oddities; where only Taylor's English exists, modernise his English.
  Begin with the texts read first in the curriculum. Several sessions.

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

## Ideas noted, not yet planned

- **Audio of the Greek.** A restored-pronunciation reading would have to come from a recording whose licence allows
  it; to research. Free human recordings of the English (LibriVox) could be offered beside the browser's speech.
