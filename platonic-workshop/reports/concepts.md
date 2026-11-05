# The concept index: what the build found

Written by `tools/build_db.py` (milestone 10, `tools/concepts.py`) from `sources/concepts/concepts.json`; every figure is counted from the library.

**628 of 628 quotations found** in the texts they are said to be in (Burnet's Greek at the section named; the Definitions, Alcinous; Taylor's Platonic terms; Taylor's Plotinus, Proclus' Theology and Iamblichus; the notes, by commentator and place).

Not found: none.


Every term is a lemma GLAUx tags in the corpus.

## 197 concepts, and where they come from

Each concept was gathered from one or more of: **index** (written for the index, `concepts.json`), **Definitions** (an entry of the Definitions, Hermann's Greek and Burges' English), **Taylor's terms** (an entry of Taylor's 'Explanation of Certain Platonic Terms'), **later Platonists** (a reading of Alcinous, Plotinus, Proclus or Iamblichus, quoted from the library). The mapping of each defined term to a concept is by hand (`sources/concepts/sources.json`); the words of each definition are cut by rule from the text.

| Gathered from | Concepts |
|---|---:|
| Definitions | 143 |
| Taylor's terms | 22 |
| Definitions, Taylor's terms | 6 |
| index | 5 |
| index, Definitions, Taylor's terms | 5 |
| index, Taylor's terms, later Platonists | 4 |
| index, later Platonists | 3 |
| index, Definitions, later Platonists | 3 |
| index, Taylor's terms | 2 |
| index, Definitions, Taylor's terms, later Platonists | 2 |
| index, Definitions | 1 |
| Taylor's terms, later Platonists | 1 |

| Layer | Concepts |
|---|---:|
| academy | 149 |
| later | 26 |
| plato | 18 |
| plato-later | 4 |

Greek words of a concept that GLAUx does not tag anywhere in Plato (later words, or filed otherwise): The One and the Many: ἑνιαῖος, ἑνοειδής; Hyparxis (summit of essence): ὕπαρξις; Idiom (characteristic peculiarity): ἰδίωμα; The imparticipable: ἀμέθεκτος; Intellectual projection: ἐπιβολή; Appetite (orexis): ὄρεξις; Theurgy: θεουργία; Wholeness: ὁλότης.

## Kinds of relation

| Category | About | Relations |
|---|---|---:|
| shared concept | The two are said of one and the same thing, or one is said of the other. | 3 |
| philosophical analogy | As one stands to something, so the other stands to something else. | 3 |
| different formulation | The same thought put in other words or terms, by Plato or a later reader. | 1 |
| historical interpretation | A later Platonist or translator relates them; Plato does not. | 6 |
| apparent contradiction | The two seem to conflict, and the sources say how, or how it is resolved. | 1 |
| metaphysical distinction | Two levels or kinds of being set apart, or one set between two others. | 7 |
| allegorical parallel | A myth or image read as standing for the other. | 1 |
| causal dependence | One is the cause, source or ruler of the other. | 4 |
| opposition | Contraries or opposites, or two powers set over different things. | 4 |
| part and whole | One is a part, kind or member of the other. | 6 |
| definition | One is defined by, or said to be, the other. | 5 |
| knower and known | A power of knowing and its object. | 6 |
| participation | One shares in the other. | 4 |
| image and pattern | One is the image or copy of the other as its pattern. | 4 |
| ascent and goal | One is the way up, the other where it leads. | 3 |
| question in the dialogue | A dialogue asks whether the one is the other, and may leave it open. | 3 |
| argument | One is used in an argument for the other. | 1 |

## Words compared across the translators

Passage by passage (`/api/renderings/<lemma>`, `#renderings/<lemma>` in the reader): the six the build prompt names, then the chief words of the index.

λόγος (named), νόος (named), ψυχή (named), ἀγαθός (named), εἶδος (named), ἀρετή (named), ἰδέα, οὐσία, ἀλήθεια, ἐπιστήμη, δόξα, διάνοια, νόησις, δικαιοσύνη, σοφία, φρόνησις, σωφροσύνη, ἀνδρεία, καλός, κάλλος, γένεσις, δημιουργός, θεός, δαίμων, ἔρως, φύσις, αἰτία, ἀνάγκη, κόσμος, χώρα, παράδειγμα, εἰκών, ἀνάμνησις, μετέχω, τέχνη, ἡδονή, εὐδαιμονία, ἀθάνατος, θεῖος.

## The concepts

Layer: **plato**, Plato names it and argues about it; **plato-later**, Plato names it and the later Platonists give it its systematic form; **later**, a later doctrine or term, with the passages the later readers read it in; **academy**, defined in the Definitions of Plato's school.

| Concept | Layer | Terms (words in the corpus) | Definitions | Passages | Later readings | Related | Notes naming it on its passages |
|---|---|---|---:|---:|---:|---:|---:|
| The Good | plato-later | ἀγαθός (2,621) | 4 | 5 | 4 | 5 | 19 |
| The Beautiful | plato | καλός (1,974), κάλλος (92) | 2 | 5 | 2 | 2 | 1 |
| Truth | plato | ἀλήθεια (243), ἀληθής (1,208) | 5 | 3 | 1 | 2 | 0 |
| Being | plato | οὐσία (264), εἰμί (15,941) | 1 | 4 | 1 | 2 | 7 |
| Becoming | plato | γένεσις (247), γίγνομαι (3,871) | 6 | 2 | 1 | 3 | 6 |
| The Forms | plato | εἶδος (412), ἰδέα (98) | 1 | 5 | 2 | 4 | 14 |
| Intellect (Nous) | plato-later | νόος (410), νόησις (24), νοέω (107) | 3 | 4 | 3 | 2 | 5 |
| Reason and Logos | plato | λόγος (2,481), λογισμός (74) | 7 | 4 | 2 | 2 | 2 |
| Soul (Psychē) | plato | ψυχή (1,142) | 3 | 4 | 4 | 2 | 10 |
| The Demiurge | plato-later | δημιουργός (167), ποιητής (226) | 3 | 6 | 2 | 3 | 18 |
| The One and the Many | plato-later | εἷς (1,747), πολύς (3,002) | 4 | 3 | 2 | 1 | 0 |
| Participation | plato | μετέχω (263), μεταλαμβάνω (81), μέθεξις (5) | 1 | 3 | 2 | 2 | 5 |
| Emanation (procession) | later | none | 1 | 2 | 2 | 2 | 8 |
| Return (conversion) | later | περιαγωγή (4), ἐπιστροφή (1) | 3 | 1 | 3 | 2 | 1 |
| Knowledge | plato | ἐπιστήμη (611), γνῶσις (32) | 3 | 4 | 1 | 4 | 1 |
| Opinion | plato | δόξα (439) | 5 | 3 | 1 | 2 | 3 |
| Ignorance | plato | ἄγνοια (54), ἀμαθία (82) | 1 | 3 | 1 | 2 | 2 |
| Virtue | plato | ἀρετή (610) | 2 | 3 | 2 | 5 | 7 |
| Justice | plato | δικαιοσύνη (261), δίκαιος (859) | 4 | 3 | 1 | 2 | 6 |
| Evil as privation | later | κακός (1,194), κακία (93) | 1 | 3 | 2 | 3 | 3 |
| Image and original | plato | εἰκών (103), παράδειγμα (90), μίμημα (54) | 4 | 4 | 2 | 2 | 9 |
| Ascent | plato | ἀνάβασις (4), ἄνοδος (1), ὁμοίωσις (4) | 3 | 4 | 2 | 2 | 0 |
| The intelligible world | plato | νοητός (28) | 3 | 3 | 1 | 2 | 6 |
| The sensible world | plato | αἰσθητός (22), ὁρατός (52) | 0 | 3 | 1 | 2 | 4 |
| Recollection | plato | ἀνάμνησις (20), ἀναμιμνῄσκω (103) | 1 | 3 | 1 | 2 | 16 |
| Eternal | academy | ἀίδιος (9), αἰώνιος (4) | 3 | 0 | 0 | 0 | 0 |
| God | academy | θεός (1,282) | 2 | 0 | 0 | 0 | 0 |
| The sun | academy | ἥλιος (86) | 2 | 0 | 0 | 0 | 0 |
| Time | academy | χρόνος (539) | 2 | 0 | 0 | 0 | 0 |
| Day | academy | ἡμέρα (170) | 2 | 0 | 0 | 0 | 0 |
| Morning (dawn) | academy | ἕως (125) | 2 | 0 | 0 | 0 | 0 |
| Midday | academy | μεσημβρία (6) | 2 | 0 | 0 | 0 | 0 |
| Evening | academy | δείλη (1) | 2 | 0 | 0 | 0 | 0 |
| Night | academy | νύξ (57) | 2 | 0 | 0 | 0 | 0 |
| Chance (fortune) | academy | τύχη (106) | 2 | 0 | 0 | 0 | 0 |
| Old age | academy | γῆρας (47) | 2 | 0 | 0 | 0 | 0 |
| Wind (breath) | academy | πνεῦμα (48) | 2 | 0 | 0 | 0 | 0 |
| Air | academy | ἀήρ (102) | 2 | 0 | 0 | 0 | 0 |
| Heaven | academy | οὐρανός (123) | 2 | 0 | 0 | 0 | 0 |
| Power (dynamis) | academy | δύναμις (513) | 5 | 0 | 0 | 0 | 0 |
| Sight | academy | ὄψις (145) | 2 | 0 | 0 | 0 | 0 |
| Bone | academy | ὀστέον (35) | 2 | 0 | 0 | 0 | 0 |
| Element | academy | στοιχεῖον (65) | 2 | 0 | 0 | 0 | 0 |
| Wisdom in action (phronēsis) | academy | φρόνησις (187) | 4 | 0 | 0 | 0 | 0 |
| Temperance (sōphrosynē) | academy | σωφροσύνη (196), σώφρων (134) | 4 | 0 | 0 | 0 | 0 |
| Courage (andreia) | academy | ἀνδρεία (170) | 2 | 0 | 0 | 0 | 0 |
| Self-sufficiency | academy | αὐτάρκεια (1) | 2 | 0 | 0 | 0 | 0 |
| Reasonableness (equity) | academy | ἐπιείκεια (3) | 2 | 0 | 0 | 0 | 0 |
| Endurance | academy | καρτερία (10) | 2 | 0 | 0 | 0 | 0 |
| Boldness | academy | θάρσος (12) | 2 | 0 | 0 | 0 | 0 |
| Freedom from pain | academy | none | 2 | 0 | 0 | 0 | 0 |
| Love of labour | academy | φιλοπονία (3) | 2 | 0 | 0 | 0 | 0 |
| Modesty (aidōs) | academy | αἰδώς (44) | 2 | 0 | 0 | 0 | 0 |
| Freedom | academy | ἐλευθερία (45), ἐλεύθερος (153) | 4 | 0 | 0 | 0 | 0 |
| Liberality | academy | ἐλευθεριότης (2) | 2 | 0 | 0 | 0 | 0 |
| Gentleness | academy | πραότης (6) | 2 | 0 | 0 | 0 | 0 |
| Orderliness (decorum) | academy | κοσμιότης (4) | 2 | 0 | 0 | 0 | 0 |
| Happiness (eudaimonia) | academy | εὐδαιμονία (40) | 2 | 0 | 0 | 0 | 0 |
| Magnificence | academy | μεγαλοπρέπεια (9) | 2 | 0 | 0 | 0 | 0 |
| Quickness of mind | academy | ἀγχίνοια (2) | 2 | 0 | 0 | 0 | 0 |
| Goodness of character (chrēstotēs) | academy | none | 2 | 0 | 0 | 0 | 0 |
| Nobility and goodness (kalokagathia) | academy | none | 2 | 0 | 0 | 0 | 0 |
| Greatness of soul | academy | μεγαλοψυχία (1) | 2 | 0 | 0 | 0 | 0 |
| Love of mankind | academy | φιλανθρωπία (1) | 2 | 0 | 0 | 0 | 0 |
| Piety | academy | εὐσέβεια (6) | 2 | 0 | 0 | 0 | 0 |
| Fearlessness | academy | ἀφοβία (3) | 2 | 0 | 0 | 0 | 0 |
| Freedom from passion (apatheia) | academy | none | 2 | 0 | 0 | 0 | 0 |
| Peace | academy | εἰρήνη (52) | 2 | 0 | 0 | 0 | 0 |
| Easiness of soul (rhathymia) | academy | ῥαθυμία (9) | 2 | 0 | 0 | 0 | 0 |
| Cleverness (deinotēs) | academy | δεινότης (5) | 2 | 0 | 0 | 0 | 0 |
| Friendship (philia) | academy | φιλία (99) | 2 | 0 | 0 | 0 | 0 |
| Nobility of birth | academy | εὐγένεια (5) | 2 | 0 | 0 | 0 | 0 |
| Choice | academy | αἵρεσις (47) | 2 | 0 | 0 | 0 | 0 |
| Goodwill | academy | εὔνοια (20) | 2 | 0 | 0 | 0 | 0 |
| Kinship | academy | οἰκειότης (11) | 2 | 0 | 0 | 0 | 0 |
| Concord (homonoia) | academy | ὁμόνοια (19) | 4 | 0 | 0 | 0 | 0 |
| Affection | academy | none | 2 | 0 | 0 | 0 | 0 |
| Statesmanship | academy | πολιτικός (212) | 5 | 0 | 0 | 0 | 0 |
| Good counsel | academy | εὐβουλία (6) | 2 | 0 | 0 | 0 | 0 |
| Belief (pistis) | academy | πίστις (19) | 2 | 0 | 0 | 0 | 0 |
| Wish (boulēsis) | academy | βούλησις (34) | 2 | 0 | 0 | 0 | 0 |
| Advising | academy | none | 2 | 0 | 0 | 0 | 0 |
| Timeliness | academy | εὐκαιρία (1) | 2 | 0 | 0 | 0 | 0 |
| Caution | academy | εὐλάβεια (13) | 2 | 0 | 0 | 0 | 0 |
| Order (taxis) | academy | τάξις (100) | 2 | 0 | 0 | 0 | 0 |
| Attention | academy | πρόσεξις (1) | 2 | 0 | 0 | 0 | 0 |
| Natural gifts | academy | none | 2 | 0 | 0 | 0 | 0 |
| Readiness to learn | academy | εὐμάθεια (9) | 2 | 0 | 0 | 0 | 0 |
| Judgment (dikē) | academy | δίκη (370) | 3 | 0 | 0 | 0 | 0 |
| Good order under law (eunomia) | academy | εὐνομία (5) | 2 | 0 | 0 | 0 | 0 |
| Gladness | academy | εὐφροσύνη (3) | 2 | 0 | 0 | 0 | 0 |
| Honour | academy | τιμή (145) | 2 | 0 | 0 | 0 | 0 |
| Eagerness | academy | προθυμία (29) | 2 | 0 | 0 | 0 | 0 |
| Grace (charis) | academy | χάρις (81) | 2 | 0 | 0 | 0 | 0 |
| Constitution (politeia) | academy | πολιτεία (259) | 2 | 0 | 0 | 0 | 0 |
| Providence (pronoia) | academy | πρόνοια (13) | 2 | 0 | 0 | 0 | 0 |
| Deliberation | academy | βουλή (32) | 2 | 0 | 0 | 0 | 0 |
| Victory | academy | νίκη (37), νικάω (123) | 4 | 0 | 0 | 0 | 0 |
| Gift | academy | δωρεά (13) | 2 | 0 | 0 | 0 | 0 |
| The right moment (kairos) | academy | καιρός (50) | 4 | 0 | 0 | 0 | 0 |
| Memory | academy | μνήμη (75) | 2 | 0 | 0 | 0 | 0 |
| Concept (ennoia) | academy | ἔννοια (8) | 2 | 0 | 0 | 0 | 0 |
| Purity (hagneia) | academy | ἁγνεία (2) | 2 | 0 | 0 | 0 | 0 |
| Divination | academy | μαντεία (20) | 2 | 0 | 0 | 0 | 0 |
| Wisdom (sophia) | academy | σοφία (261) | 2 | 0 | 0 | 0 | 0 |
| Philosophy | academy | φιλοσοφία (145) | 2 | 0 | 0 | 0 | 0 |
| Sense-perception (aisthēsis) | academy | αἴσθησις (193) | 2 | 0 | 0 | 0 | 0 |
| State (hexis) | academy | ἕξις (69) | 2 | 0 | 0 | 0 | 0 |
| Voice | academy | φωνή (136) | 2 | 0 | 0 | 0 | 0 |
| Name (onoma) | academy | ὄνομα (767) | 2 | 0 | 0 | 0 | 0 |
| Syllable | academy | συλλαβή (53) | 2 | 0 | 0 | 0 | 0 |
| Definition (horos) | academy | ὅρος (57) | 2 | 0 | 0 | 0 | 0 |
| Proof (tekmērion) | academy | τεκμήριον (72) | 2 | 0 | 0 | 0 | 0 |
| Demonstration | academy | ἀπόδειξις (31) | 2 | 0 | 0 | 0 | 0 |
| The beneficial | academy | ὠφέλιμος (114) | 2 | 0 | 0 | 0 | 0 |
| The advantageous | academy | συμφέρω (124) | 2 | 0 | 0 | 0 | 0 |
| The voluntary | academy | ἑκούσιος (59), ἀκούσιος (50) | 4 | 0 | 0 | 0 | 0 |
| The measured (metrion) | academy | μέτριος (178), μέτρον (102) | 4 | 0 | 0 | 0 | 0 |
| Prize | academy | ἆθλον (22) | 2 | 0 | 0 | 0 | 0 |
| Immortality | academy | ἀθανασία (15), ἀθάνατος (97) | 3 | 0 | 0 | 0 | 0 |
| The holy (hosion) | academy | ὅσιος (154) | 2 | 0 | 0 | 0 | 0 |
| Festival | academy | ἑορτή (26) | 2 | 0 | 0 | 0 | 0 |
| Human being | academy | ἄνθρωπος (1,299) | 2 | 0 | 0 | 0 | 0 |
| Sacrifice | academy | θυσία (67) | 2 | 0 | 0 | 0 | 0 |
| Prayer | academy | εὐχή (52) | 2 | 0 | 0 | 0 | 0 |
| King | academy | βασιλεύς (178) | 2 | 0 | 0 | 0 | 0 |
| Rule (archē) | academy | ἀρχή (588) | 2 | 0 | 0 | 0 | 0 |
| Authority | academy | ἐξουσία (31) | 2 | 0 | 0 | 0 | 0 |
| Lawgiver | academy | νομοθέτης (241), νομοθετικός (6) | 4 | 0 | 0 | 0 | 0 |
| Law (nomos) | academy | νόμος (920) | 2 | 0 | 0 | 0 | 0 |
| Hypothesis | academy | ὑπόθεσις (42) | 2 | 0 | 0 | 0 | 0 |
| Decree | academy | ψήφισμα (4) | 2 | 0 | 0 | 0 | 0 |
| City (polis) | academy | πόλις (1,466) | 4 | 0 | 0 | 0 | 0 |
| The art of war | academy | πολεμικός (73) | 2 | 0 | 0 | 0 | 0 |
| Alliance | academy | συμμαχία (7) | 2 | 0 | 0 | 0 | 0 |
| Safety (sōtēria) | academy | σωτηρία (78), σῴζω (146) | 4 | 0 | 0 | 0 | 0 |
| Tyrant | academy | τύραννος (101) | 2 | 0 | 0 | 0 | 0 |
| Sophist | academy | σοφιστής (124) | 2 | 0 | 0 | 0 | 0 |
| Wealth | academy | πλοῦτος (79) | 2 | 0 | 0 | 0 | 0 |
| Deposit | academy | παρακαταθήκη (3) | 2 | 0 | 0 | 0 | 0 |
| Purification (katharsis) | academy | κάθαρσις (15) | 2 | 0 | 0 | 0 | 0 |
| The good man | academy | ἀγαθός (2,621) | 2 | 0 | 0 | 0 | 0 |
| Brooding (synnoia) | academy | σύννοια (4) | 2 | 0 | 0 | 0 | 0 |
| Slowness to learn | academy | δυσμάθεια (2) | 2 | 0 | 0 | 0 | 0 |
| Mastery (despoteia) | academy | δεσποτεία (6) | 2 | 0 | 0 | 0 | 0 |
| Hatred of philosophy | academy | none | 2 | 0 | 0 | 0 | 0 |
| Fear | academy | φόβος (117) | 2 | 0 | 0 | 0 | 0 |
| Spirit (thymos) | academy | θυμός (78) | 3 | 0 | 0 | 0 | 0 |
| Consternation | academy | ἔκπληξις (2) | 2 | 0 | 0 | 0 | 0 |
| Flattery | academy | κολακεία (19) | 2 | 0 | 0 | 0 | 0 |
| Anger (orgē) | academy | ὀργή (34) | 2 | 0 | 0 | 0 | 0 |
| Insolence (hybris) | academy | ὕβρις (42) | 2 | 0 | 0 | 0 | 0 |
| Lack of self-control (akrasia) | academy | none | 2 | 0 | 0 | 0 | 0 |
| Hesitation | academy | ὄκνος (7) | 2 | 0 | 0 | 0 | 0 |
| Cowardice | academy | δειλία (38) | 2 | 0 | 0 | 0 | 0 |
| Slander | academy | διαβολή (28) | 2 | 0 | 0 | 0 | 0 |
| Injustice | academy | ἀδικία (139) | 2 | 0 | 0 | 0 | 0 |
| Want (endeia) | academy | ἔνδεια (19) | 2 | 0 | 0 | 0 | 0 |
| Shame | academy | αἰσχύνη (29) | 2 | 0 | 0 | 0 | 0 |
| Boastfulness | academy | ἀλαζονεία (4) | 2 | 0 | 0 | 0 | 0 |
| Error (hamartia) | academy | ἁμαρτία (13) | 2 | 0 | 0 | 0 | 0 |
| Envy | academy | φθόνος (44) | 2 | 0 | 0 | 0 | 0 |
| Shamelessness | academy | ἀναισχυντία (9) | 2 | 0 | 0 | 0 | 0 |
| Rashness | academy | θρασύτης (5) | 2 | 0 | 0 | 0 | 0 |
| Love of honour | academy | φιλοτιμία (17) | 2 | 0 | 0 | 0 | 0 |
| Natural badness | academy | none | 2 | 0 | 0 | 0 | 0 |
| Hope | academy | ἐλπίς (67) | 2 | 0 | 0 | 0 | 0 |
| Madness (mania) | academy | μανία (47) | 2 | 0 | 0 | 0 | 0 |
| Talkativeness | academy | none | 2 | 0 | 0 | 0 | 0 |
| Contrariety | academy | ἐναντιότης (4) | 2 | 0 | 0 | 0 | 0 |
| Education (paideia) | academy | παιδεία (152), παίδευσις (22) | 4 | 0 | 0 | 0 | 0 |
| Admonition | academy | νουθέτησις (10) | 2 | 0 | 0 | 0 | 0 |
| Help | academy | βοήθεια (25) | 2 | 0 | 0 | 0 | 0 |
| Punishment (kolasis) | academy | κόλασις (12) | 2 | 0 | 0 | 0 | 0 |
| Alliation | later | none | 1 | 0 | 0 | 0 | 0 |
| The altermotive | later | none | 1 | 0 | 0 | 0 | 0 |
| The composite | later | σύνθετος (12) | 1 | 0 | 0 | 0 | 0 |
| Desire (epithymia) | later | ἐπιθυμία (226) | 2 | 0 | 0 | 0 | 0 |
| Discursive thought (dianoia) | later | διάνοια (158) | 2 | 0 | 0 | 0 | 0 |
| The divine | later | θεῖος (289) | 1 | 0 | 0 | 0 | 0 |
| Divine inspiration | later | ἔνθεος (10) | 1 | 0 | 0 | 0 | 0 |
| Guest (xenos) | later | ξένος (322) | 1 | 0 | 0 | 0 | 0 |
| Hyparxis (summit of essence) | later | none | 1 | 0 | 0 | 0 | 0 |
| Idiom (characteristic peculiarity) | later | none | 1 | 0 | 0 | 0 | 0 |
| The imparticipable | later | none | 2 | 0 | 0 | 0 | 0 |
| Intellectual projection | later | none | 1 | 0 | 0 | 0 | 0 |
| The monad | later | μονάς (5) | 1 | 0 | 0 | 0 | 0 |
| Shape (morphē) | later | μορφή (13) | 1 | 0 | 0 | 0 | 0 |
| Cause (aitia) and its kinds | later | αἰτία (159) | 1 | 0 | 0 | 0 | 0 |
| Appetite (orexis) | later | none | 1 | 0 | 0 | 0 | 0 |
| Rest and permanency (stasis) | later | στάσις (81) | 1 | 0 | 0 | 0 | 0 |
| Imagination (phantasia) | later | φαντασία (7) | 1 | 0 | 0 | 0 | 0 |
| Philopolemic (Minerva) | later | none | 1 | 0 | 0 | 0 | 0 |
| Plenitude (plērōma) | later | πλήρωμα (2) | 1 | 0 | 0 | 0 | 0 |
| The telestic art | later | none | 1 | 0 | 0 | 0 | 0 |
| Theurgy | later | none | 1 | 0 | 1 | 0 | 0 |
| Wholeness | later | none | 1 | 0 | 0 | 0 | 0 |

## Passages by dialogue

| Dialogue | Concept passages |
|---|---:|
| Republic | 24 |
| Timaeus | 18 |
| Phaedo | 9 |
| Theaetetus | 6 |
| Parmenides | 5 |
| Symposium | 5 |
| Phaedrus | 5 |
| Sophist | 4 |
| Meno | 4 |
| Philebus | 3 |
| Laws | 2 |
| Apology | 1 |
| Statesman | 1 |

## Notes naming a concept, by commentator

A note placed on one of a concept's passages that names it by one of its keywords (found by rule; read the note).

| Commentator | Notes |
|---|---:|
| Archer-Hind (1888) | 19 |
| Adam (1902) | 18 |
| Proclus, tr. Taylor (1820) | 17 |
| Taylor (1804), note | 16 |
| Archer-Hind, Phaedo (1883) | 15 |
| Shorey (Loeb, 1935-37) | 13 |
| Jowett and Campbell (1894) | 12 |
| Burnet (1911) | 10 |
| England (1921) | 4 |
| Taylor, Additional Notes from Proclus (1804) | 3 |
| Taylor (1804), note signed T. | 2 |
| Scholia (Hermann) | 2 |
| Campbell, Sophist and Statesman (1867) | 2 |
