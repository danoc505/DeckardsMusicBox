# Aristotle: the Metaphysics and the Nicomachean Ethics (Aristotle milestone A1)

Written by `tools/build_db.py` (through `tools/aristotle.py`) each time the library is built.

| Work | Bekker columns | Greek words | tagged by GLAUx | with Morpheus | Loeb notes | key-term words |
|---|---:|---:|---:|---:|---:|---:|
| Metaphysics | 228 | 78,946 | 78,660 (99.64%) | 78,678 | 942 | 6,610 |
| Nicomachean Ethics | 176 | 56,593 | 56,372 (99.61%) | 56,477 | 696 | 5,066 |

## The translations beside the Greek

- **Metaphysics**: the Loeb English from Perseus, at Bekker's columns as Perseus marks them (228 of 228 columns; none missing: True).
  - `ar025.ross1908`: 1077 paragraphs, 117,899 words, 1243 pieces placed, 135 notes; 1440 anchors found by tools/align.py. 184 Bekker columns read from Ross's margin and used as fixed points; 183 pieces begin at a column he prints.
  - `ar025.taylor1801`: 419 paragraphs, 129,017 words, 447 pieces placed, 534 notes; 905 anchors found by tools/align.py. 98 fixed points (book and chapter starts); Taylor's chapters agree with the Perseus text's in books 2, 3, 5, 8, 9, 10, 11, 12, 14.
- **Nicomachean Ethics**: the Loeb English from Perseus, at Bekker's columns as Perseus marks them (176 of 176 columns; none missing: True).
  - `ar010.chase1847`: 1195 paragraphs, 92,325 words, 1195 pieces placed, 0 notes; 1266 anchors found by tools/align.py.

Every placement not printed in the book is marked ≈ in the reader. The OCR of Ross and Taylor is cleaned by rule (`tools/aristotle_ocr.py`) and not proofread; *Show the OCR* in the reader shows each paragraph as the scan reads it.
