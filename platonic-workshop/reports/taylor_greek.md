# The commentators' Greek beside Taylor's English: what the matching found

Written by `tools/taylor_greek.py` when the library is built (milestone 26); every figure is counted from the build.

| Taylor's translation | Greek (milestone 25) | Parts | Chapters | With Greek | Paragraphs | English words | How matched |
|---|---|---:|---:|---:|---:|---:|---|
| Plotinus, Select Works of Plotinus (`taylor-plotinus`) | `plotinus-enneads` | 15 | 187 | 187 | 367 | 104,445 | chapter number 187 |
| Iamblichus, On the Mysteries (`taylor-mysteries`) | `iamblichus-mysteries` | 10 | 140 | 139 | 317 | 59,083 | chapter number 139; no Greek 1 |
| Proclus, Elements of Theology (`taylor-elements`) | `proclus-elements` | 22 | 211 | 211 | 494 | 40,014 | not placed 125; machine-matched 77; found 9 |

**The check.** Taylor's footnotes quote the Greek he translates. Each quotation of three or more Greek words is looked for, letters only, in the Greek matched to its chapter, and if not there, anywhere in the text:

| Text | Found in the Greek matched | Found in another place | Not found (the OCR of the note, or of the Greek, too poor) |
|---|---:|---:|---:|
| Plotinus, Select Works of Plotinus | 3 | 6 | 37 |
| Iamblichus, On the Mysteries | 8 | 6 | 88 |
| Proclus, Elements of Theology | 0 | 0 | 0 |

**The check of the chapter numbers.** If Taylor's chapter n is the Greek chapter n, his English should run to about the same multiple of the Greek in every chapter. It does:

| Text | Chapters | English words to one Greek word (median) | Chapters outside half to twice that |
|---|---:|---:|---|
| Plotinus, Select Works of Plotinus | 187 | 1.63 | IV.7.8 (421 English, 1,869 Greek); IV.7.13 (609 English, 173 Greek); IV.3.14 (815 English, 150 Greek) |
| Iamblichus, On the Mysteries | 129 | 1.36 | 3.10 (1,251 English, 376 Greek); 5.8 (617 English, 167 Greek); 7.3 (303 English, 558 Greek) |

Each outlier was read, and begins where its Greek chapter begins. Where the Greek is much the longer, the Greek file holds more than Taylor translates: Plotinus IV.7.8, where Volkmann prints within chapter 8 the long passage preserved by Eusebius (8¹ to 8⁵), which Taylor, following Ficino, does not have; On the Mysteries 7.3, where the Greek file prints no chapter 7.4 and its 7.3 runs on. Where the English is much the longer, a long note of Taylor's runs over a page and the OCR set its continuation among the text, where it is shown as a paragraph of the chapter.

**The Elements.** Creuzer prints the number and title of 8 of the 211 propositions where the OCR can read them (in the Greek, or in his Latin on the facing page, which is numbered one more than the Greek page it translates): those starts are *found*, with the first proposition, which begins the text. Every other proposition is placed by machine, all at once (dynamic programming), at a line that begins a sentence, so that the length of each proposition's Greek is as near as can be to its length in Taylor's English, a general statement (Πᾶν, Πᾶσα, Πάντα ...) preferred, and a line where the Greek of Taylor's terms is found preferred. A placing is kept (*machine-matched*) only where it can be checked: the line begins a general statement, three in five or more of the terms of Taylor's statement (two at least) have their Greek in its first three lines, and more of them than of the statement of the proposition before or after; the kept placings are fixed and the rest placed again, until no more can be checked. Found 9, machine-matched 77, *not placed* 125: for these the reader shows the pages of the Greek between the placed propositions before and after, and says so. Taylor's terms and their Greek are listed in `TERMS` in the tool.

**English without Greek** (the Greek file has no chapter of that number): On the Mysteries 7.4.
