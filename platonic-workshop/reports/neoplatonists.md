# The rest of the Neoplatonists: what the import found

Written by `tools/neoplatonists.py` when the library is built (milestone 25); every figure is counted from the build.

**14 texts, 5,005 units, 1,125,797 Greek words.** The TEI texts are First1KGreek's corrected text (CC BY-SA 4.0); the scans are the Internet Archive's OCR, shown as received. 1513 corrections are kept apart (`sources/neoplatonists/corrections.json`) and change 13,972 words in the corrected reading; the text shown is never changed.

| Text | Edition | Kind | Contents | Units | Greek words |
|---|---|---|---:|---:|---:|
| Plotinus, Enneads (`plotinus-enneads`) | Plotini Enneades, ed. Richard Volkmann, 2 vols (Leipzig: Teubner, 1883-1884) | TEI | 54 | 653 | 213,705 |
| Proclus, Commentary on the First Alcibiades (`proclus-alcibiades`) | Procli philosophi Platonici opera, ed. Victor Cousin, vols II-III (Paris, 1820-1821) | scan | 57 | 567 | 62,159 |
| Proclus, Elements of Theology (`proclus-elements`) | Initia philosophiae ac theologiae ex Platonicis fontibus ducta, ed. Friedrich Creuzer, part III (Frankfurt: Broenner, 1822) | scan | 32 | 317 | 31,993 |
| Proclus, Commentary on the Cratylus (excerpts) (`proclus-cratylus`) | Procli Diadochi in Platonis Cratylum commentaria, ed. Giorgio Pasquali (Leipzig: Teubner, 1908) | scan | 12 | 113 | 29,092 |
| Proclus, Commentary on the Parmenides (`proclus-parmenides`) | Procli philosophi Platonici opera, ed. Victor Cousin, vols IV-VI (Paris, 1821-1827) | scan | 107 | 1,058 | 175,311 |
| Proclus, Commentary on the Republic (`proclus-republic`) | Procli Diadochi in Platonis Rem publicam commentarii, ed. Wilhelm Kroll, 2 vols (Leipzig: Teubner, 1899-1901) | TEI | 13 | 678 | 165,844 |
| Iamblichus, On the Pythagorean Life (`iamblichus-pythagorean-life`) | Iamblichi de vita Pythagorica liber, ed. August Nauck (St Petersburg, 1884) | TEI | 37 | 308 | 29,921 |
| Iamblichus, Exhortation to Philosophy (Protrepticus) (`iamblichus-protrepticus`) | Iamblichi Protrepticus, ed. Ermenegildo Pistelli (Leipzig: Teubner, 1888) | TEI | 22 | 63 | 26,171 |
| Iamblichus, On General Mathematical Science (`iamblichus-mathematics`) | Iamblichi de communi mathematica scientia liber, ed. Nicola Festa (Leipzig: Teubner, 1891) | TEI | 4 | 36 | 20,004 |
| Iamblichus, On Nicomachus' Introduction to Arithmetic (`iamblichus-nicomachus`) | Iamblichi in Nicomachi arithmeticam introductionem liber, ed. Ermenegildo Pistelli (Leipzig: Teubner, 1894) | TEI | 18 | 176 | 26,592 |
| Iamblichus, On the Mysteries (`iamblichus-mysteries`) | Iamblichi de mysteriis liber, ed. Gustav Parthey (Berlin: Nicolai, 1857) | TEI | 11 | 135 | 41,261 |
| Damascius, Problems and Solutions concerning First Principles (`damascius-principles`) | Damascii philosophi Platonici quaestiones de primis principiis, ed. Joseph Kopp (Frankfurt: Broenner, 1826) | scan | 41 | 405 | 160,471 |
| Hermias, Scholia on the Phaedrus (`hermias-phaedrus`) | Hermiae Alexandrini in Platonis Phaedrum scholia, ed. Paul Couvreur (Paris: Bouillon, 1901) | scan | 27 | 266 | 93,206 |
| Olympiodorus, Commentary on the First Alcibiades (`olympiodorus-alcibiades`) | Initia philosophiae ac theologiae ex Platonicis fontibus ducta, ed. Friedrich Creuzer, part II (Frankfurt: Broenner, 1821) | scan | 23 | 230 | 50,067 |

**The scans, page by page.** A page number is *read* when it is found in the page's running head (or stands alone at its head or foot) and agrees with the numbers of the pages around it (within twelve, at least three agreeing); *counted* between two read pages; otherwise the page is named by its image. Pages under a third Greek are folded away as Latin.

| Text | Pages | Number read | Counted | By image | Latin pages | Lines hidden as specks |
|---|---:|---:|---:|---:|---:|---:|
| Proclus, Commentary on the First Alcibiades | 567 | 342 | 225 | 0 | 105 | 3,095 of 16,763 |
| Proclus, Elements of Theology | 317 | 60 | 240 | 17 | 160 | 2,255 of 13,041 |
| Proclus, Commentary on the Cratylus (excerpts) | 113 | 72 | 41 | 0 | 0 | 515 of 4,351 |
| Proclus, Commentary on the Parmenides | 1058 | 556 | 502 | 0 | 199 | 3,640 of 31,256 |
| Damascius, Problems and Solutions concerning First Principles | 405 | 240 | 165 | 0 | 0 | 1,023 of 16,422 |
| Hermias, Scholia on the Phaedrus | 266 | 97 | 167 | 2 | 1 | 6,789 of 19,059 |
| Olympiodorus, Commentary on the First Alcibiades | 230 | 94 | 125 | 11 | 9 | 2,281 of 11,152 |

**Not here, and why.**

- Olympiodorus, Commentary on the Gorgias: the only full editions are Norvin's (1936, still in copyright in the United States) and Westerink's (1970); Jahn's of 1848, in a journal supplement, was not found among the scans the Workshop can reach.
- Olympiodorus, Commentary on the Phaedo: Norvin's edition (1913) was not found among the scans; Finckh's (1847) is on the Internet Archive, but its OCR read the Greek as Latin letters throughout, so there is no Greek to show.
- Damascius, Commentary on the Parmenides, and his lectures on the Phaedo and Philebus: Ruelle's Parmenides (1889-1899) and Norvin's Phaedo (1913) were not found among the scans; Westerink's Phaedo and Philebus are in copyright.
- Proclus, Commentary on the Timaeus, and the Theology of Plato: already in the library in Taylor's English (milestones 7 and 10); their Greek (Diehl, 1903-1906; Portus, 1618) is left for a later milestone.
