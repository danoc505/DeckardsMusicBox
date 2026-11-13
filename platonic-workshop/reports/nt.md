# The Greek New Testament: what the import found

Written by `tools/nt.py` when the library is built (milestone 23); every figure is counted from the build.

**27 books, 7,944 verses, 137,554 Greek words**, every one with MorphGNT's dictionary form and grammar (137,554); Morpheus has every possible grammar for 135,395 of them (98.4%). 5,461 dictionary forms, 2,610 of them also in Plato (as GLAUx marks Plato's words); 4,778 (87.5%) have an entry in Middle Liddell or LSJ, 172 of them filed under another headword the reader names (γινώσκω under the Attic γιγνώσκω, a deponent under its active form, nt.alternates).

Sources: the SBL Greek New Testament (2010, CC BY 4.0) with MorphGNT's tagging (CC BY-SA 3.0), `morphgnt-sblgnt` in `sources/manifest.json`; the American Standard Version (1901, public domain), `sources/asv-1901/`.

| Book | Chapters | Verses | Greek words |
|---|---:|---:|---:|
| Matthew (`nt01`) | 28 | 1068 | 18,329 |
| Mark (`nt02`) | 16 | 673 | 11,286 |
| Luke (`nt03`) | 24 | 1149 | 19,446 |
| John (`nt04`) | 21 | 878 | 15,438 |
| Acts (`nt05`) | 28 | 1003 | 18,412 |
| Romans (`nt06`) | 16 | 433 | 7,055 |
| 1 Corinthians (`nt07`) | 16 | 437 | 6,812 |
| 2 Corinthians (`nt08`) | 13 | 257 | 4,473 |
| Galatians (`nt09`) | 6 | 149 | 2,226 |
| Ephesians (`nt10`) | 6 | 155 | 2,416 |
| Philippians (`nt11`) | 4 | 104 | 1,626 |
| Colossians (`nt12`) | 4 | 95 | 1,580 |
| 1 Thessalonians (`nt13`) | 5 | 89 | 1,473 |
| 2 Thessalonians (`nt14`) | 3 | 47 | 820 |
| 1 Timothy (`nt15`) | 6 | 113 | 1,591 |
| 2 Timothy (`nt16`) | 4 | 83 | 1,235 |
| Titus (`nt17`) | 3 | 46 | 659 |
| Philemon (`nt18`) | 1 | 25 | 334 |
| Hebrews (`nt19`) | 13 | 303 | 4,935 |
| James (`nt20`) | 5 | 108 | 1,739 |
| 1 Peter (`nt21`) | 5 | 105 | 1,678 |
| 2 Peter (`nt22`) | 3 | 61 | 1,098 |
| 1 John (`nt23`) | 5 | 105 | 2,137 |
| 2 John (`nt24`) | 1 | 13 | 245 |
| 3 John (`nt25`) | 1 | 15 | 219 |
| Jude (`nt26`) | 1 | 25 | 459 |
| Revelation (`nt27`) | 22 | 405 | 9,833 |

**Verses in one text only.** In the Greek and not the ASV: Romans 16:24, 3 John 1:15, Revelation 12:18. In the ASV and not the Greek: John 7:53, John 8:1, John 8:2, John 8:3, John 8:4, John 8:5, John 8:6, John 8:7, John 8:8, John 8:9, John 8:10, John 8:11, Acts 19:41, Romans 16:25, Romans 16:26, Romans 16:27, 2 Corinthians 13:14.

**Verses the ASV prints empty** (16; it put them in its margin as not in the oldest manuscripts): Matthew 17:21, Matthew 18:11, Matthew 23:14, Mark 7:16, Mark 9:44, Mark 9:46, Mark 11:26, Mark 15:28, Luke 17:36, Luke 23:17, John 5:4, Acts 8:37, Acts 15:34, Acts 24:7, Acts 28:29, Romans 16:24.

**Key terms.** 3,755 words of the New Testament are underlined as 66 of the Workshop's key terms, by MorphGNT's lemma and the term's own rule, as in Plato (and, as there, the terms only the Definitions define are found but not underlined: 7,846 words in all, of 138 terms). They are kept apart from Plato's (`nt_term_hit`). Most underlined: God 1,307, Reason and Logos 332, Name (onoma) 229, Eternal 191, Justice 170, Opinion 165, Life 135, Truth 135, Power (dynamis) 119, Soul (Psychē) 102, The Beautiful 101, The Good 101.

**Words without a dictionary entry** (mostly names), the most frequent: Παῦλος, Ἰωάννης, Μωϋσῆς, Ἰερουσαλήμ, Ἀβραάμ, Ἰσραήλ, πρεσβύτερος, Ἱεροσόλυμα, Γαλιλαία, Δαυίδ, Πιλᾶτος, εὐαγγελίζω, οὐχί, Ἰούδας, Ἰουδαία, Ἡρῴδης, Ἰάκωβος, Σατανᾶς, παραγίνομαι, Ἰωσήφ.

**Not done.** Westcott and Hort's Greek (1881) as a second text: the roadmap offers it as optional, and no tagged copy with a licence to reuse it was found to pin; the SBLGNT apparatus (the variant readings its marks ⸀ ⸂ ⸃ point to) is not here, so the marks are left out of the text shown.
