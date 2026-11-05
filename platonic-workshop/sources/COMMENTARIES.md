# Commentary survey (milestone 1)

Checked on 5 November 2026. Each row says what form of the text exists and
whether we can get it from this environment.

**Status key**

- **In hand**: downloaded or committed, and checked by `tools/verify_sources.py`.
- **Clean online**: a proofread transcription exists, but its site is blocked here.
- **OCR online**: unproofread OCR text exists (usable for English and Latin, poor for Greek).
- **Scan only**: page images; we would have to OCR them ourselves.
- **Not checked**: listed from the plan, not yet looked up. Marked so nothing unverified passes as checked.

The network for this project reaches GitHub and PyPI but not gutenberg.org,
archive.org, wikisource.org, sacred-texts.com, hathitrust.org, sourcelibrary.org,
distantreader.org or thelatinlibrary.com. Those sites were checked with web
search and a page reader instead, and anything found there has to be added to
the project's allowed domains, or uploaded, before it can be imported.

## Already keyed to Stephanus (a free first commentary layer)

| Commentary | Dialogues | Status | Notes |
|---|---|---|---|
| Loeb translators' footnotes (Fowler, Lamb, Bury, Shorey) in the Perseus English | All 36 | **In hand** | Each `<note>` sits inside a Stephanus section, so it is already anchored. 184 notes on the Timaeus (Bury), 2,771 on the Republic (Shorey), 553 on the Laws. |

## Thomas Taylor

| Work | Status | Notes |
|---|---|---|
| Works of Plato (1804), 5 vols, with Sydenham: translations, introductions, footnotes, and "Additional Notes" drawn from Proclus, Hermias, Olympiodorus and Damascius | **In hand** (OCR you uploaded) | `sources/taylor-1804/`. Internet Archive OCR of the AMS Press 1972 facsimile. Unproofread; about 9% of words are long-s errors ("fuch", "thefe"). For the Timaeus: introduction p. 415ff, translation, and 2,500 lines of Additional Notes from Proclus. No Stephanus numbers printed. |
| theosophylib.com, Works of Plato (1804) | Vol. I: **In hand** (imported). Vols. II-V: OCR online | Suggested by Daniel. Vol. I (General Introduction, Platonic terms, Olympiodorus' Life, First Alcibiades, Republic) is HTML with the long s corrected and Stephanus markers such as [331a] inserted; a few typos remain ("same others", "w1th"). Downloaded on 5 November 2026 to `sources/taylor-1804-vol1-theosophylib/` and imported to `texts/taylor-1804/vol1/` with every footnote and Additional Note (Proclus) as a separate record placed at its Stephanus section; see `reports/taylor_vol1.md`. Vols. II-V are per-dialogue PDFs whose text layer is raw long-s OCR (Timaeus and Euthyphro checked; the Timaeus PDF holds only the introduction). |
| Wikisource transcription project, Taylor's Timaeus (1804) | Clean online, partial? | Listed on Wikisource's Timaeus page as a "transcription project". How far it has got could not be checked (Wikisource is blocked here and the page reader could not follow the link). Worth checking from your own browser. |
| Commentaries of Proclus on the Timaeus (1820), 2 vols | Scan only | Archive.org scans (e.g. `proclusontimaeus01procuoft`). Not on Project Gutenberg. Modern reprints are facsimiles. |
| Proclus, Theology of Plato (1816), 2 vols | Clean online | Project Gutenberg #77393 and #78800. |
| Proclus on Euclid I (1792), 2 vols | Clean online | Gutenberg #74253 and #79455 (Distributed Proofreaders). |
| Introduction to the Philosophy and Writings of Plato | Clean online | Gutenberg #10214. |
| Iamblichus, On the Mysteries; Life of Pythagoras | Clean online | Gutenberg #72815, #63300. |
| Select Works of Porphyry; Plotinus On the Beautiful | Clean online | Gutenberg #77014, #29510. |
| Fragments of Proclus, Orphic Hymns, Eleusinian Mysteries | Clean online | sacred-texts.com. |

All the Gutenberg titles above are on Gutenberg's Taylor author page (#3385).
GITenberg, the GitHub mirror we used for Jowett, has not been updated for
several years, so the recent Taylor releases (2019 onwards) are probably not
mirrored there. Not checked for each title.

## Ancient commentaries and introductions

| Commentary | Dialogues | Status | Notes |
|---|---|---|---|
| Proclus, In Timaeum (Diehl, 1903-06), Greek | Timaeus | Scan only; OCR on Source Library | Archive.org scans. sourcelibrary.org has Diehl vol. I page by page with OCR and its own English translation. How that translation was made is not stated on the page; check it before use, given your no-AI rule. |
| Proclus, In Rem Publicam (Kroll, 1899-1901), Greek | Republic | **Clean on GitHub** | First1KGreek `tlg4036.tlg001`. In the manifest as `first1k-proclus-republic` (planned). |
| Proclus on the Parmenides, Alcibiades I, Cratylus, Greek | Those three | Not checked | Not in First1KGreek or Perseus. Taylor's 1804 notes carry extracts from the Parmenides and Alcibiades commentaries (in hand). |
| Hermias on the Phaedrus (Couvreur, 1901) | Phaedrus | Scan only | Modern edition (Lucarini and Moreschini, De Gruyter 2012) is copyrighted. |
| Olympiodorus on the Gorgias, Alcibiades I, Phaedo | Those three | Not checked | First1KGreek has Olympiodorus' Prolegomena (to Aristotle's logic) and two Aristotle commentaries, not the Plato ones. |
| Damascius on the Phaedo and Philebus | Those two | Not checked | Not in First1KGreek. |
| Diogenes Laertius, book 3 (Life of Plato) | Whole corpus | **Clean on GitHub** | Perseus `tlg0004.tlg001`, Greek and Hicks's English. |
| Olympiodorus, Life of Plato | Whole corpus | **In hand** (Taylor's English) | Vol. 1 of the 1804 Works. |
| Anonymous Prolegomena to Platonic Philosophy | Whole corpus | Not checked | Westerink's edition (1962) is copyrighted; Hermann's 1853 Teubner text would be a scan. |
| Alcinous, Didaskalikos; Albinus, Prologue | Whole corpus | Scan only | No digital Greek text found. The old public-domain text is in Hermann's Teubner Plato (from memory, not checked). |
| Calcidius, Latin commentary on the Timaeus | Timaeus | Scan only | Waszink (1962) is copyrighted; the older Wrobel edition (1876) would be public domain (from memory, not checked). Not on the Latin Library. |
| Ficino, argumenta and commentaries (Latin) | Whole corpus | Not checked | |
| Greek scholia on Plato (Greene, 1938) | Whole corpus | Not checked | |

## Nineteenth- and early twentieth-century commentaries

| Commentary | Dialogues | Status | Notes |
|---|---|---|---|
| Jowett, Introductions and Analyses (1892) | All | **In hand** for the Timaeus | GITenberg #1572: 40,280-word Introduction and Analysis. The other dialogues are separate Gutenberg ebooks; which of them GITenberg mirrors is not checked yet. |
| Archer-Hind, Timaeus (1888) | Timaeus | OCR online | Plain-text OCR from the HathiTrust copy on distantreader.org. English prose is readable; the Greek is badly garbled ("TTAATQN02 TIMAIOS"). |
| Archer-Hind, Phaedo (1883) | Phaedo | Not checked | |
| Adam, Republic (1902) | Republic | Not checked | |
| Burnet, Phaedo (1911); Euthyphro, Apology, Crito (1924) | Those four | Not checked | |
| Thompson, Phaedrus (1868), Gorgias (1871) | Those two | Not checked | |
| Campbell, Theaetetus, Sophist, Statesman | Those three | Not checked | |
| Bury, Philebus (1897), Symposium (1909) | Those two | Not checked | |
| England, Laws (1921) | Laws | Not checked | |
| Stallbaum (Latin) | Most | Not checked | |
| Grote, Plato and the Other Companions of Sokrates (1865) | All | Not checked | |
| Ast, Lexicon Platonicum (1835-38) | All | Not checked | |

The "Not checked" rows are for the milestone that imports commentaries for the
whole corpus (milestone 11). Each check is a quick search, but there is no point
doing it before the pipeline is proven on the Timaeus.
