# Aristotle (Aristotle milestones A1 and A3)

Written by `tools/build_db.py` (through `tools/aristotle.py`) each time the library is built.

| Work | Bekker columns | Greek words | tagged by GLAUx | with Morpheus | Loeb notes | key-term words |
|---|---:|---:|---:|---:|---:|---:|
| Metaphysics | 228 | 78,946 | 78,660 (99.64%) | 78,678 | 942 | 6,610 |
| Nicomachean Ethics | 176 | 56,593 | 56,372 (99.61%) | 56,477 | 696 | 5,066 |
| Categories | 30 | 10,316 | 10,312 (99.96%) | 10,049 | 0 | 748 |
| On Interpretation | 18 | 6,244 | 6,244 (100.00%) | 6,111 | 0 | 614 |
| Prior Analytics | 86 | 37,200 | 37,015 (99.50%) | 34,118 | 0 | 1,681 |
| Posterior Analytics | 58 | 22,566 | 22,416 (99.34%) | 21,554 | 0 | 1,200 |
| Topics | 130 | 44,116 | 44,105 (99.98%) | 43,057 | 0 | 3,412 |
| Sophistical Refutations | 42 | 14,116 | 14,106 (99.93%) | 13,776 | 0 | 852 |
| Physics | 167 | 55,458 | 55,100 (99.35%) | 54,295 | 0 | 3,134 |
| On the Heavens | 91 | 29,677 | 29,069 (97.95%) | 29,044 | 0 | 1,765 |
| On the Soul | 64 | 20,936 | 20,699 (98.87%) | 20,665 | 0 | 1,656 |

## The translations beside the Greek

- **Metaphysics**: the Loeb English from Perseus, at Bekker's columns as Perseus marks them (228 of 228 columns; none missing: True).
  - `ar025.ross1908`: 1077 paragraphs, 117,899 words, 1243 pieces placed, 135 notes; 1440 anchors found by tools/align.py. 184 Bekker columns read from Ross's margin and used as fixed points; 183 pieces begin at a column he prints.
  - `ar025.taylor1801`: 419 paragraphs, 129,017 words, 447 pieces placed, 534 notes; 905 anchors found by tools/align.py. 98 fixed points (book and chapter starts); Taylor's chapters agree with the Perseus text's in books 2, 3, 5, 8, 9, 10, 11, 12, 14.
- **Nicomachean Ethics**: the Loeb English from Perseus, at Bekker's columns as Perseus marks them (176 of 176 columns; none missing: True).
  - `ar010.chase1847`: 1195 paragraphs, 92,325 words, 1195 pieces placed, 0 notes; 1266 anchors found by tools/align.py.
- **Categories**: the Greek from First1KGreek, its 30 Bekker columns from Bekker's columns carried over from the margin of the Oxford translation (1928), chapter by chapter, at the same proportion of the chapter (≈): this Greek, Bekker's text in his Oxford reprint (1837), does not print them.
  - `ar006.oxford1928`: 125 paragraphs, 13,716 words, 152 pieces placed, 19 notes; 0 anchors found by tools/align.py. 18 Bekker columns read from Ross's margin and used as fixed points; 18 pieces begin at a column he prints.
- **On Interpretation**: the Greek from First1KGreek, its 18 Bekker columns from Bekker's columns carried over from the margin of the Oxford translation (1928), chapter by chapter, at the same proportion of the chapter (≈): this Greek, Bekker's text in his Oxford reprint (1837), does not print them.
  - `ar017.oxford1928`: 119 paragraphs, 10,336 words, 131 pieces placed, 35 notes; 0 anchors found by tools/align.py. 13 Bekker columns read from Ross's margin and used as fixed points; 13 pieces begin at a column he prints.
- **Prior Analytics**: the Greek from First1KGreek, its 86 Bekker columns from Bekker's pages and columns printed in the margin of the First1KGreek TEI.
  - `ar001.oxford1928`: 244 paragraphs, 47,003 words, 320 pieces placed, 147 notes; 0 anchors found by tools/align.py. 56 Bekker columns read from Ross's margin and used as fixed points; 56 pieces begin at a column he prints.
- **Posterior Analytics**: the Greek from First1KGreek, its 58 Bekker columns from Bekker's pages and columns printed in the margin of the First1KGreek TEI.
  - `ar001p.oxford1928`: 193 paragraphs, 34,718 words, 244 pieces placed, 246 notes; 0 anchors found by tools/align.py. 25 Bekker columns read from Ross's margin and used as fixed points; 25 pieces begin at a column he prints.
- **Topics**: the Greek from First1KGreek, its 130 Bekker columns from Bekker's columns carried over from the margin of the Oxford translation (1928), chapter by chapter, at the same proportion of the chapter (≈): this Greek, Bekker's text in his Oxford reprint (1837), does not print them.
  - `ar044.oxford1928`: 390 paragraphs, 71,275 words, 509 pieces placed, 55 notes; 0 anchors found by tools/align.py. 28 Bekker columns read from Ross's margin and used as fixed points; 28 pieces begin at a column he prints.
- **Sophistical Refutations**: the Greek from First1KGreek, its 42 Bekker columns from Bekker's columns carried over from the margin of the Oxford translation (1928), chapter by chapter, at the same proportion of the chapter (≈): this Greek, Bekker's text in his Oxford reprint (1837), does not print them.
  - `ar040.oxford1928`: 99 paragraphs, 23,125 words, 138 pieces placed, 49 notes; 0 anchors found by tools/align.py. 32 Bekker columns read from Ross's margin and used as fixed points; 32 pieces begin at a column he prints.
- **Physics**: the Greek from First1KGreek, its 167 Bekker columns from GLAUx's Bekker column of each word.
  - `ar031.hardie1930`: 884 paragraphs, 86,531 words, 1032 pieces placed, 472 notes; 0 anchors found by tools/align.py. 148 Bekker columns read from Ross's margin and used as fixed points; 148 pieces begin at a column he prints.
- **On the Heavens**: the Greek from First1KGreek, its 91 Bekker columns from GLAUx's Bekker column of each word.
  - `ar005.stocks1922`: 205 paragraphs, 42,265 words, 291 pieces placed, 257 notes; 0 anchors found by tools/align.py. 67 Bekker columns read from Ross's margin and used as fixed points; 67 pieces begin at a column he prints.
- **On the Soul**: the Greek from First1KGreek, its 64 Bekker columns from Bekker's pages and columns printed in the margin of the First1KGreek TEI (left out, out of Bekker's order: 440b, 402a, 420a, 420a, 420b, 430a).
  - `ar002.hicks1907`: 131 paragraphs, 30,627 words, 192 pieces placed, 0 notes; 0 anchors found by tools/align.py. 60 Bekker columns read from Ross's margin and used as fixed points; 60 pieces begin at a column he prints.

Every placement not printed in the book is marked ≈ in the reader. The OCR of Ross and Taylor is cleaned by rule (`tools/aristotle_ocr.py`) and not proofread; *Show the OCR* in the reader shows each paragraph as the scan reads it.
