# Timaeus pilot set

The commentary pipeline (milestone 7) is proven on these before it is run on
anything else. They were picked to cover the three kinds of material the
pipeline must handle: notes already keyed to Stephanus, notes keyed only by
the edition's own pages, and notes in unproofread OCR.

| # | Source | Why it is in the pilot | Form | Anchoring |
|---|---|---|---|---|
| 1 | **Taylor, Works of Plato (1804), vol. 2**: introduction to the Timaeus, his footnotes to the translation, and the "Additional Notes on the Timaeus, extracted from the Commentaries of Proclus" | Taylor is the Workshop's gold standard, and these notes carry Proclus into the reader before the full Proclus is available | OCR in hand (long s read as "f") | No Stephanus numbers. Anchor by aligning Taylor's translation with the Greek, then each footnote follows its sentence |
| 2 | **Bury's Loeb footnotes** in the Perseus English (184 notes) | Already keyed; tests the display and the data model with zero cleanup | Clean TEI in hand | Stephanus section of the containing paragraph |
| 3 | **Jowett, Introduction and Analysis (1892)** | A running analysis of the argument, the first input to the dialogue's structure layer | Clean text in hand | Jowett cites few passages; anchor by section of the argument |
| 4 | **Archer-Hind, Timaeus (1888)** | The model 19th-century commentary: each note starts with a Stephanus reference and a Greek lemma, so anchoring is mostly automatic | OCR online (HathiTrust via distantreader.org), Greek garbled | Stephanus reference at the head of each note; the garbled Greek lemma is repaired by matching against the Perseus text at that reference |
| 5 | **Proclus, In Timaeum**: Taylor's 1820 English, with Diehl's Greek (1903-06) | The central ancient commentary on the dialogue | Scan only; Taylor 1820 is the version to get first | Diehl's pages need a concordance to Stephanus; Taylor 1820 follows the order of the lemmata |

**Order of work.** 2 and 3 need no cleanup and go first. 1 needs the long-s
cleanup (rules plus a word list, reviewed by you) and an alignment with the
Greek. 4 needs the domain distantreader.org (or babel.hathitrust.org) allowed.
5 waits for a clean text of Taylor's 1820 translation; if none turns up, it
gets OCR'd from the archive.org scans.

**What each imported note will record:** source edition, page, the passage it
is anchored to, how the anchor was made (printed reference, alignment, or
by hand), and its proofreading status (OCR as received, cleaned by rule,
checked by you).
