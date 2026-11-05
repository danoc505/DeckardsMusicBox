# Taylor's Works of Plato (1804), vol. I: the theosophylib.com text

**What this is.** The corrected HTML text of volume I of *The Works of Plato*,
translated by Floyer Sydenham and Thomas Taylor (London, 1804), as published
by the Theosophy Library Online (theosophylib.com, editor Jon W. Fergus). The
site has restored the long s, inserted Stephanus numbers such as `[331a]` in
the dialogues, and kept the 1804 page numbers in the General Introduction and
the Life of Plato (`[p. iv]`). Suggested by Daniel on 5 November 2026.

**Where it came from.** Downloaded on 5 November 2026 by
`tools/fetch_theosophylib.py`, waiting 10 seconds between requests as the
site's robots.txt asks. Each page is kept in `html/` exactly as received,
site navigation included; `fetched.json` records the URL, time, HTTP status,
size and sha256 of every download.

| File | Page | Contents | sha256 |
|---|---|---|---|
| html/plato-intro.html | https://theosophylib.com/tt/plato-intro/ | Taylor's General Introduction to the Works | 4c6f2c8b… |
| html/explanation-of-certain-platonic-terms.html | https://theosophylib.com/tt/explanation-of-certain-platonic-terms/ | Taylor's glossary of Platonic terms (see below: compiled by the site from three books) | 0c1c05f5… |
| html/the-life-of-plato-by-olympiodorus.html | https://theosophylib.com/tt/the-life-of-plato-by-olympiodorus/ | Olympiodorus' Life of Plato, Taylor's translation and notes | 3ac60720… |
| html/the-first-alcibiades.html | https://theosophylib.com/tt/the-first-alcibiades/ | Introduction (from Proclus), translation, Additional Notes from Proclus' commentary, footnotes | bc251ab0… |
| html/the-republic.html | https://theosophylib.com/tt/the-republic/ | Taylor's introduction, books I–X, his introduction to books II and III ("An Apology for the Fables of Homer"), Additional Notes on books I–V, footnotes | a5433c4b… |

`pages.json` lists the pages in printed order, with the Perseus work id of each
dialogue. `stephanus_corrections.json` lists the four misnumbered Stephanus
markers on the site and what they should read (see below).

## Who wrote what

- **General Introduction, Explanation of Terms:** Taylor.
- **Life of Plato:** Olympiodorus, translated by Taylor.
- **First Alcibiades:** one of the nine dialogues translated by Floyer Sydenham
  and revised by Taylor. The footnotes bear this out: 70 are signed "S."
  (Sydenham) and 9 "T." (Taylor); the other 42 are unsigned. The introduction
  and the Additional Notes are Taylor's extracts from Proclus' commentary on
  the dialogue, which he read in manuscript.
- **Republic:** Taylor. None of its 163 footnotes is signed.

Each record in `texts/taylor-1804/vol1/` carries the translator, and each
Alcibiades footnote carries its signature (`signed`), so Sydenham's work is
never credited to Taylor.

## What the import keeps

`tools/import_taylor_vol1.py` writes one JSON file per work to
`texts/taylor-1804/vol1/` and a report to `reports/taylor_vol1.md`.

- **Segments.** Every paragraph, heading, quotation and table, in order. In
  the dialogues a paragraph is split wherever a Stephanus marker falls, so
  every translation segment has exactly one `stephanus` section and a stable
  id such as `taylor1804.republic.327a` (a second segment in the same section
  is `…327a.2`). `paragraph` numbers let the split pieces be joined again.
- **Notes as separate records.** Footnotes (`type: footnote`) and Additional
  Notes (`type: additional`) each have an id (`taylor1804.republic.n042`,
  `taylor1804.republic.add006`) and a list of `anchors`: the segment or note
  they hang from, the character offset of the reference mark, and the
  Stephanus section. Segments list the notes they carry, with offsets, so
  links run both ways.
- **Additional Notes placed at a section.** Taylor keys these by a quoted
  phrase (the lemma) and, in the Republic, by the 1804 page. The importer
  finds the lemma in the translation; when a lemma occurs more than once
  ("Thrasymachus.") it takes the occurrence nearest to where the 1804 page
  number puts it. How each was found is recorded in `anchors[].matched`. The
  long Proclus extract under Republic book IV has no lemma and is recorded as
  a note on the whole book (`scope: "book 4"`).
- **Markup as offsets.** Italics, bold, the words the site marks in red as
  doubtful (a few Greek words in the General Introduction), and the 1804 page
  breaks are kept as offsets beside plain text, so the text stays searchable.
- **Glossary entries.** Each term in the Explanation of Terms is a `term`
  segment with its headword and the books it is cited from.

## Quality and what to watch for

- **Stephanus coverage.** Checked against Burnet's Greek (Perseus): the First
  Alcibiades has all 162 sections; the Republic has 1,354 of 1,355. The site
  has no marker for **560d**, so that text sits under 560c. It is not
  guessed.
- **Misnumbered markers, corrected.** Alcibiades: the second `[131c]` is 131e.
  Republic: the second `[331a]` is 331c, the second `[429b]` is 429c, and
  `[429c]` is 429d. Each was checked against the Perseus text of those
  sections; the site's reading is kept on the segment as `stephanus_printed`.
- **The site's text is not proofread to the letter.** A few typos remain (for
  example "send him to same other city" for "some"), and Greek quotations are
  unaccented and sometimes wrong ("τα μροοιμια"). Nothing is corrected here.
  The OCR of the 1804 printing in `sources/taylor-1804/` is the check.
- **The Explanation of Terms is a compilation.** The site gathers terms from
  three of Taylor's books and tags each: the 1804 Works (`Plato Dialogues`,
  26 entries), the Theology of Plato (1816, 16) and the Timaeus commentary
  (1820, 27). Only the first group is from volume I itself.
- **The Republic's "Notes" headings.** The site groups the Republic footnotes
  under "Book 1", "Book 2" and so on; that label is kept as `section`.

**Licence.** Taylor's text is in the public domain. The site's corrections
and Stephanus markers are used here for personal study only.
