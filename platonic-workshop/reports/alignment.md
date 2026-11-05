# Placing translations at Stephanus sections: how often the computation is right

Written by `tools/build_db.py` (`translations.alignment_check`). For each translation below the Stephanus numbers are printed, so the computed placement (`tools/align.py`, against the Loeb English) can be checked: the printed numbers are hidden, every sentence and clause is placed by computation, and the result is compared with the printed number.

- **Taylor and Sydenham (1804) against the theosophylib.com section numbers:** 87.2% of 11,109 sentences and clauses in the right section, 96.7% in it or the next or previous one.
- **Jowett against his printed sections (Republic):** 84.5% right, 96.7% within one section (7,281 units). The section letters of this transcription come from a 1908 printing, not from Burnet, so part of the difference is where two editions draw the line between sections, not an error of placement.
- **Jowett against his printed pages (vol. II):** 95.3% on the right Stephanus page, 99.8% within one page (8,094 units).

Where numbers are printed, the library uses them, not the computation. Computed placements are labelled as such in the reader, with these figures.

| Translation | Checked against | Level | Units | Right | Within one | Anchors |
|---|---|---|---:|---:|---:|---:|
| Floyer Sydenham, revised by Thomas Taylor (1804), The First Alcibiades (`tlg013`) | theosophylib.com section numbers | section | 2,391 | 87.7% | 96.8% | 421 |
| Thomas Taylor (1804), The Republic (`tlg030`) | theosophylib.com section numbers | section | 8,718 | 87.1% | 96.7% | 1,618 |
| Jowett (1892), Euthyphro (`tlg001`) | printed pages (1892) | page | 470 | 98.3% | 100.0% | 241 |
| Jowett (1892), Apology (`tlg002`) | printed pages (1892) | page | 600 | 94.5% | 100.0% | 335 |
| Jowett (1892), Crito (`tlg003`) | printed pages (1892) | page | 323 | 98.5% | 100.0% | 162 |
| Jowett (1892), Phaedo (`tlg004`) | printed pages (1892) | page | 1,437 | 97.3% | 100.0% | 637 |
| Jowett (1892), Alcibiades I (`tlg013`) | printed pages (1892) | page | 1,182 | 94.7% | 100.0% | 511 |
| Knight (1892), Alcibiades II (`tlg014`) | printed pages (1892) | page | 326 | 90.2% | 100.0% | 195 |
| Jowett (1892), Gorgias (`tlg023`) | printed pages (1892) | page | 2,156 | 93.0% | 99.3% | 760 |
| Jowett (1892), Meno (`tlg024`) | printed pages (1892) | page | 950 | 97.1% | 100.0% | 454 |
| Jowett (1892), Lesser Hippias (`tlg026`) | printed pages (1892) | page | 386 | 97.9% | 100.0% | 210 |
| Jowett (1892), Menexenus (`tlg028`) | printed pages (1892) | page | 264 | 96.2% | 100.0% | 208 |
| Jowett (1888), The Republic (`tlg030`) | printed sections (1888; letters from the 1908 printing) | section | 7,281 | 84.5% | 96.7% | 1,751 |
