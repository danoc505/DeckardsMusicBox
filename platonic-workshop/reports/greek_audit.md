# Greek in the reader, and its English (milestone 15)

Written by `python3 tools/greek_audit.py`. Every run of Greek the reader is sent, view by view and field by
field, and how English is given for it (`sources/translations/coverage.json`).

1,944,416 Greek words in 854,677 runs, in 136 fields.

| English | Greek words |
|---|---:|
| A printed English translation of the same words is shown beside it | 1,483,852 |
| Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning | 334,625 |
| Not translated yet: each word taps for its dictionary meaning meanwhile; a full translation is planned in ROADMAP.md | 50,332 |
| It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it | 49,566 |
| An English name, label or explanation is printed with it | 16,508 |
| The Workshop's own translation is shown beside it, labelled as such | 9,533 |

## Field by field

| View and field | Runs | Words | Longest run | English |
|---|---:|---:|---:|---|
| `ancient/albinus-burges sections[].text` | 16 | 17 | 2 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `ancient/albinus-hermann sections[].english.parts[].text` | 22 | 23 | 2 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `ancient/albinus-hermann sections[].text` | 5 | 1,413 | 344 | A printed English translation of the same words is shown beside it |
| `ancient/albinus-hermann title` | 1 | 2 | 2 | An English name, label or explanation is printed with it |
| `ancient/alcinous-burges sections[].text` | 123 | 223 | 11 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `ancient/definitions-burges sections[].text` | 47 | 146 | 16 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `ancient/definitions-hermann sections[].english.parts[].text` | 62 | 177 | 16 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `ancient/definitions-hermann sections[].text` | 11 | 1,804 | 233 | A printed English translation of the same words is shown beside it |
| `ancient/definitions-hermann title` | 1 | 1 | 1 | An English name, label or explanation is printed with it |
| `ancient/dl3-burges sections[].text` | 61 | 140 | 25 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `ancient/dl3-yonge sections[].text` | 18 | 20 | 2 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `ancient/prolegomena-hermann sections[].text` | 28 | 9,359 | 687 | The Workshop's own translation is shown beside it, labelled as such |
| `ancient/prolegomena-hermann title` | 1 | 4 | 4 | An English name, label or explanation is printed with it |
| `commentary notes[].anchor_detail` | 20,845 | 53,051 | 13 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `commentary notes[].body_html` | 60,066 | 145,593 | 89 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `commentary notes[].lemma_text` | 11,551 | 29,946 | 13 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `concept compared[]` | 37 | 37 | 1 | A printed English translation of the same words is shown beside it |
| `concept definitions[].evidence[].quote` | 211 | 1,103 | 15 | A printed English translation of the same words is shown beside it |
| `concept greek` | 206 | 229 | 5 | An English name, label or explanation is printed with it |
| `concept keywords.grc[]` | 47 | 53 | 3 | An English name, label or explanation is printed with it |
| `concept later[].evidence[].quote` | 25 | 200 | 14 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concept later[].says` | 2 | 2 | 1 | An English name, label or explanation is printed with it |
| `concept note` | 149 | 149 | 1 | An English name, label or explanation is printed with it |
| `concept passages[].evidence[].quote` | 87 | 414 | 13 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `concept passages[].named[].excerpt` | 194 | 503 | 36 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concept passages[].named[].word` | 46 | 47 | 2 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concept passages[].quote` | 87 | 414 | 13 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `concept related[].evidence[].quote` | 59 | 338 | 13 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `concept terms[].lemma` | 243 | 243 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concept terms[].lsj[].quote` | 602 | 2,306 | 23 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `concept terms[].note` | 5 | 8 | 2 | An English name, label or explanation is printed with it |
| `concept untagged[]` | 10 | 10 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concepts concepts[].greek` | 206 | 229 | 5 | An English name, label or explanation is printed with it |
| `concepts concepts[].note` | 149 | 149 | 1 | An English name, label or explanation is printed with it |
| `concepts concepts[].terms[].lemma` | 243 | 243 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concepts concepts[].untagged[]` | 10 | 10 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concepts stats.words not in LSJ[]` | 1 | 1 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `concepts words[].lemma` | 39 | 39 | 1 | A printed English translation of the same words is shown beside it |
| `corpus ancient[].title` | 3 | 7 | 4 | An English name, label or explanation is printed with it |
| `corpus orders[].frame[].quote` | 1 | 14 | 14 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `corpus orders[].items[].evidence[].quote` | 11 | 93 | 12 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `corpus sequences[].steps[].evidence[].quote` | 14 | 109 | 18 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `corpus themes[].passages[].quote` | 25 | 148 | 15 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier cited_by[].excerpt` | 6,209 | 16,394 | 48 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier diagram.about` | 1 | 1 | 1 | An English name, label or explanation is printed with it |
| `dossier diagram.columns[].quote` | 4 | 20 | 9 | An English name, label or explanation is printed with it |
| `dossier diagram.cut.quote` | 1 | 9 | 9 | An English name, label or explanation is printed with it |
| `dossier diagram.halves[].quote` | 2 | 11 | 7 | An English name, label or explanation is printed with it |
| `dossier diagram.items[].quote` | 13 | 79 | 10 | An English name, label or explanation is printed with it |
| `dossier diagram.left[].quote` | 4 | 21 | 7 | An English name, label or explanation is printed with it |
| `dossier diagram.notes[].quote` | 3 | 15 | 8 | An English name, label or explanation is printed with it |
| `dossier diagram.proportion.quote` | 1 | 4 | 4 | An English name, label or explanation is printed with it |
| `dossier diagram.result.quote` | 1 | 6 | 6 | An English name, label or explanation is printed with it |
| `dossier diagram.right[].quote` | 4 | 20 | 7 | An English name, label or explanation is printed with it |
| `dossier diagram.rings[].colour.quote` | 8 | 50 | 10 | An English name, label or explanation is printed with it |
| `dossier diagram.rings[].speed.quote` | 8 | 43 | 7 | An English name, label or explanation is printed with it |
| `dossier diagram.rings[].width.quote` | 8 | 49 | 14 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].children[].children[].children[].children[].children[].children[].children[].quote` | 2 | 12 | 8 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].children[].children[].children[].children[].children[].children[].quote` | 2 | 3 | 2 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].children[].children[].children[].children[].children[].quote` | 2 | 9 | 5 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].children[].children[].children[].children[].quote` | 2 | 8 | 7 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].children[].children[].children[].quote` | 2 | 5 | 4 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].children[].children[].quote` | 2 | 6 | 4 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].children[].quote` | 2 | 11 | 6 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].children[].quote` | 2 | 7 | 4 | An English name, label or explanation is printed with it |
| `dossier diagram.root.children[].quote` | 2 | 9 | 5 | An English name, label or explanation is printed with it |
| `dossier diagram.root.quote` | 1 | 7 | 7 | An English name, label or explanation is printed with it |
| `dossier diagram.rows[].cells[].quote` | 55 | 217 | 9 | An English name, label or explanation is printed with it |
| `dossier diagram.sections[].quote` | 4 | 26 | 9 | An English name, label or explanation is printed with it |
| `dossier diagram.sections[].state` | 4 | 4 | 1 | An English name, label or explanation is printed with it |
| `dossier diagram.sections[].state_quote` | 4 | 21 | 8 | An English name, label or explanation is printed with it |
| `dossier diagram.steps[].quote` | 23 | 148 | 12 | An English name, label or explanation is printed with it |
| `dossier divisions[].detail` | 1 | 1 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier echoes[].evidence.quote` | 88 | 284 | 12 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier echoes[].quote` | 88 | 284 | 12 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier echoes[].why` | 4 | 4 | 1 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier editions[].chunks[].label` | 1,221 | 1,283 | 2 | An English name, label or explanation is printed with it |
| `dossier editions[].chunks[].text` | 2,364 | 77,488 | 130 | A printed English translation of the same words is shown beside it |
| `dossier greek` | 71 | 219 | 7 | An English name, label or explanation is printed with it |
| `dossier keywords.grc[]` | 41 | 53 | 3 | An English name, label or explanation is printed with it |
| `dossier named[].excerpt` | 1,670 | 4,810 | 62 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier named[].word` | 154 | 181 | 3 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier notes[].anchor_detail` | 4,521 | 11,323 | 11 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier notes[].body_html` | 10,548 | 33,912 | 165 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier notes[].lemma_text` | 2,477 | 6,326 | 11 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier parts[].evidence.quote` | 312 | 2,031 | 21 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier parts[].quote` | 312 | 2,031 | 21 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier passage.end_quote` | 71 | 401 | 12 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier passage.start_quote` | 71 | 507 | 15 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier passage_evidence[].quote` | 142 | 908 | 15 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier related[].evidence[].quote` | 76 | 296 | 11 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossier renderings[].evidence.quote` | 18 | 46 | 5 | A printed English translation of the same words is shown beside it |
| `dossier renderings[].grc` | 18 | 46 | 5 | A printed English translation of the same words is shown beside it |
| `dossier renderings[].term` | 18 | 33 | 4 | A printed English translation of the same words is shown beside it |
| `dossier shared[].elsewhere[].words` | 445 | 1,335 | 3 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier shared[].lemmas[]` | 906 | 906 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier shared[].words` | 302 | 906 | 3 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier vocab[].lemma` | 1,326 | 1,327 | 2 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `dossier web[].quote` | 37 | 242 | 15 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `dossiers dossiers[].greek` | 71 | 219 | 7 | An English name, label or explanation is printed with it |
| `methods [].greek` | 4 | 9 | 4 | An English name, label or explanation is printed with it |
| `methods [].grounds[].quote` | 12 | 138 | 17 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `page chunks[].label` | 12,546 | 12,986 | 2 | An English name, label or explanation is printed with it |
| `page chunks[].text` | 23,587 | 562,122 | 177 | A printed English translation of the same words is shown beside it |
| `page commentary[].anchor_detail` | 22,924 | 57,264 | 13 | A printed English translation of the same words is shown beside it |
| `page commentary[].body_html` | 62,078 | 188,039 | 165 | A printed English translation of the same words is shown beside it |
| `page commentary[].lemma_text` | 12,670 | 32,258 | 13 | A printed English translation of the same words is shown beside it |
| `page links_in[].excerpt` | 20,777 | 52,765 | 30 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `page notes[].body_html` | 2,336 | 6,947 | 136 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `page tokens[].form` | 561,505 | 561,505 | 1 | A printed English translation of the same words is shown beside it |
| `reading-order orders[].frame[].quote` | 2 | 21 | 14 | The Workshop's own translation is shown beside it, labelled as such |
| `reading-order orders[].groups[].evidence[].quote` | 1 | 9 | 9 | The Workshop's own translation is shown beside it, labelled as such |
| `reading-order orders[].groups[].steps[].evidence[].quote` | 15 | 144 | 14 | The Workshop's own translation is shown beside it, labelled as such |
| `reconciliation cites[].opening` | 22 | 99 | 52 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `reconciliation concepts[].greek` | 52 | 85 | 4 | An English name, label or explanation is printed with it |
| `reconciliation passages[].evidence[].quote` | 32 | 332 | 16 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `reconciliation passages[].notes[].opening` | 806 | 2,673 | 104 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `reconciliation passages[].words[].lemma` | 62 | 62 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `reconciliation passages[].words[].why` | 1 | 1 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `reconciliation readings[].evidence[].quote` | 20 | 187 | 23 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `scholia notes[].anchor_detail` | 2,079 | 4,213 | 12 | Not translated yet: each word taps for its dictionary meaning meanwhile; a full translation is planned in ROADMAP.md |
| `scholia notes[].body_html` | 2,296 | 43,807 | 219 | Not translated yet: each word taps for its dictionary meaning meanwhile; a full translation is planned in ROADMAP.md |
| `scholia notes[].lemma_text` | 1,119 | 2,312 | 12 | Not translated yet: each word taps for its dictionary meaning meanwhile; a full translation is planned in ROADMAP.md |
| `taylor/general-introduction notes[].text` | 38 | 655 | 128 | A printed English translation of the same words is shown beside it |
| `taylor/general-introduction segments[].text` | 26 | 147 | 27 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `taylor/olympiodorus-life notes[].text` | 3 | 3 | 1 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `taylor/platonic-terms glossary[].text` | 49 | 74 | 12 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `taylor/platonic-terms segments[].text` | 49 | 74 | 12 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `whole chapters[].basis` | 9 | 10 | 2 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `whole chapters[].detail` | 7 | 14 | 4 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |
| `whole claims[].quote` | 24 | 197 | 14 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `whole orders[].frame[].quote` | 10 | 140 | 14 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `whole orders[].items[].evidence[].quote` | 110 | 930 | 12 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `whole sequences[].steps[].evidence[].quote` | 53 | 385 | 18 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `whole themes[].passages[].quote` | 27 | 161 | 15 | It quotes a passage: the English under it opens that passage in each translation, or the ancient text with its English beside it |
| `work chapters[].detail` | 7 | 14 | 4 | Greek words discussed inside English (a commentator's or a dictionary's): each word taps for its dictionary meaning |

## Not yet translated

- `scholia notes[].anchor_detail`: The Greek scholia (Hermann, 1853): no English translation exists; a Workshop translation is planned (milestone 21 in ROADMAP.md)
- `scholia notes[].body_html`: The Greek scholia (Hermann, 1853): no English translation exists; a Workshop translation is planned (milestone 21 in ROADMAP.md)
- `scholia notes[].lemma_text`: The Greek scholia (Hermann, 1853): no English translation exists; a Workshop translation is planned (milestone 21 in ROADMAP.md)

## Greek written into the reader's own files

Each is checked by `tests/test_greek_english.py` to have English beside it in the same line.

- `reader/search.js:98` λόγος
- `reader/search.js:98` λόγου, λόγοις
- `reader/search.js:99` λογ
- `reader/search.js:127` οὐδέ
- `reader/search.js:127` οὐ
- `reader/search.js:127` δέ
- `reader/shell.js:135` ἐπέκεινα
- `reader/shell.js:139` λόγος
- `reader/shell.js:140` λόγον
- `reader/shell.js:140` λογον
- `reader/shell.js:150` ψυχή

## Missing from coverage.json

Nothing.
