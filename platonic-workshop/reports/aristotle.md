# Aristotle (Aristotle milestones A1 and A3)

Written by `tools/build_db.py` (through `tools/aristotle.py`) each time the library is built.

| Work | Bekker columns | Greek words | tagged by GLAUx | with Morpheus | Loeb notes | key-term words |
|---|---:|---:|---:|---:|---:|---:|
| Metaphysics | 228 | 78,946 | 78,660 (99.64%) | 78,678 | 942 | 6,610 |
| Nicomachean Ethics | 176 | 56,593 | 56,372 (99.61%) | 56,477 | 696 | 5,066 |
| Physics | 167 | 55,458 | 55,100 (99.35%) | 54,295 | 0 | 3,134 |
| On the Heavens | 91 | 29,677 | 29,069 (97.95%) | 29,044 | 0 | 1,765 |
| On the Soul | 64 | 20,936 | 20,699 (98.87%) | 20,665 | 0 | 1,656 |

## The translations beside the Greek

- **Metaphysics**: the Loeb English from Perseus, at Bekker's columns as Perseus marks them (228 of 228 columns; none missing: True).
  - `ar025.ross1908`: 1077 paragraphs, 117,899 words, 1243 pieces placed, 135 notes; 1440 anchors found by tools/align.py. 184 Bekker columns read from Ross's margin and used as fixed points; 183 pieces begin at a column he prints.
  - `ar025.taylor1801`: 419 paragraphs, 129,017 words, 447 pieces placed, 534 notes; 905 anchors found by tools/align.py. 98 fixed points (book and chapter starts); Taylor's chapters agree with the Perseus text's in books 2, 3, 5, 8, 9, 10, 11, 12, 14.
- **Nicomachean Ethics**: the Loeb English from Perseus, at Bekker's columns as Perseus marks them (176 of 176 columns; none missing: True).
  - `ar010.chase1847`: 1195 paragraphs, 92,325 words, 1195 pieces placed, 0 notes; 1266 anchors found by tools/align.py.
- **Physics**: the Greek from First1KGreek, its 167 Bekker columns from GLAUx's Bekker column of each word.
  - `ar031.hardie1930`: 884 paragraphs, 86,531 words, 1032 pieces placed, 472 notes; 0 anchors found by tools/align.py. 931 Bekker columns read from Ross's margin and used as fixed points; 931 pieces begin at a column he prints.
- **On the Heavens**: the Greek from First1KGreek, its 91 Bekker columns from GLAUx's Bekker column of each word.
  - `ar005.stocks1922`: 205 paragraphs, 42,265 words, 291 pieces placed, 257 notes; 0 anchors found by tools/align.py. 213 Bekker columns read from Ross's margin and used as fixed points; 213 pieces begin at a column he prints.
- **On the Soul**: the Greek from First1KGreek, its 64 Bekker columns from Bekker's pages and columns printed in the margin of the First1KGreek TEI (left out, out of Bekker's order: 440b, 402a, 420a, 420a, 420b, 430a).
  - `ar002.hicks1907`: 131 paragraphs, 30,627 words, 192 pieces placed, 0 notes; 0 anchors found by tools/align.py. 181 Bekker columns read from Ross's margin and used as fixed points; 181 pieces begin at a column he prints.

Every placement not printed in the book is marked ≈ in the reader. The OCR of Ross and Taylor is cleaned by rule (`tools/aristotle_ocr.py`) and not proofread; *Show the OCR* in the reader shows each paragraph as the scan reads it.
