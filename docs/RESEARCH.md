# Crokinole — what was looked up, and where it came from

*Everything in `Crokinole.html` that is a number came from here. Constants in
the file carry a tag — `[official]`, `[corroborated]`, `[single]`, `[measured]`,
`[derived]`, `[CALIBRATED]` — and this file is what those tags point at.*

**The one rule for reading this:** a tag that does not match its constant is
worse than no tag, because it stops the next person checking. If you change a
number, change its tag and change this file in the same commit.

---

## 0. Five things nearly every source gets wrong

These are not pedantry. Each one would have produced a different game.

| The mistake | What is actually true | Source |
|---|---|---|
| The scoring circles are 8″, 16″, 24″ **diameters** | They are 4″, 8″, 12″ **radii**. Same circles, but quote them as diameters and you build a board half the size | NCA Tournament Standards |
| A round is scored by the **margin** (winner takes the difference, first to 100) | Tournament crokinole scores **2 for a win, 1 each for a tie, 0 for a loss**. The disc tally only decides *who* won. The margin system is the traditional house game — it is the only one Wikipedia documents | NCA Rule 2a.iv |
| The open-board rule needs the disc **completely inside** the 15 line | **Touching is enough.** But a disc touching that line **scores 10**, because the line rule takes the lower value. Same circle, two different tests | NCA Rules 3a.ii and 6d |
| A foul **puts the disturbed discs back** | Nothing is ever put back. The shooter and everything it struck are removed, and a 20 sunk on that shot is voided. The rulebook's instinct is the opposite — see the Damage Stays Rule | NCA Rules 3b, 8h |
| The 20 hole is a **scoring zone** discs sit in | It is a **sink**. A disc completely in it is lifted out after the turn and banked, safe for the rest of the round. Discs piling up in the hole is a house rule | NCA Rule 2a.ii |

---

## 1. The board — NCA tournament standard

Verbatim from the NCA Season 17 Tournament Standards:

> "The NCA's standards dictate that a tournament crokinole board shall have a
> playing surface with a 26-inch diameter that is raised one-half (½) inch above
> the ditch, onto which the scoring circles are drawn at four-inch intervals from
> the center with the radius being 4 inches for the 15-point circle, 8 for the
> 10-point circle, and 12 for the shooting line. This specification shall leave
> the shooting line one inch from the edge of the board at all points. The ditch
> shall be two inches across, and the outer rail shall not be thicker than one
> half (½) inch."
>
> "The center hole shall measure one and three-eighths (1-3/8) inches in diameter
> and six (6) millimeters (+/- 1mm) in depth."

| Quantity | Imperial | Metric | Fraction of surface radius | Tag |
|---|---|---|---|---|
| Playing surface radius | 13″ | **330.2 mm** | 1.000 | `[official]` |
| Shooting line / out-of-play line | 12″ | **304.8 mm** | 0.923 | `[official]` |
| 10-point circle | 8″ | **203.2 mm** | 0.615 | `[official]` |
| 15-point circle (= peg circle) | 4″ | **101.6 mm** | 0.308 | `[official]` |
| 20 hole radius | 11/16″ | **17.4625 mm** | 0.0529 | `[official]` |
| 20 hole depth | — | **6 mm** ±1 | — | `[official]` |
| Surface raised above ditch | ½″ | **12.7 mm** | — | `[official]` |
| Ditch width | 2″ | **50.8 mm** | — | `[official]` |
| Outer rail | ≤ ½″, typ. ¼″ | **6.35 mm** | — | `[corroborated]` |
| Drawn line width | 1/16″ | **1.5875 mm** | — | `[single]` |

**The shooting line is also the death line.** NCA Rule 8e: *"If a disc touches
or crosses the outer boundary line it is out-of-play."* The same 12″ circle you
must place your disc against is the one that kills a disc at rest. So a freshly
placed disc sits exactly on the edge of being dead, and a shot too weak to move
it off the line loses it. The 1″ of wood outside that line is real surface a
disc can travel over — it just cannot stay there.

### The pegs — nobody's specification

The NCA rulebook mentions pegs **once**, as a scoring landmark ("the next region
(outside the pegs) 10"). There is no codified count, size, height or placement.
Everything below is manufacturer and community consensus.

| Quantity | Value | Tag |
|---|---|---|
| Count | 8, evenly spaced | `[corroborated]` |
| Circle | on the 15 line, 101.6 mm | `[corroborated]` |
| Diameter | 3/8″ = **9.525 mm** (rubber sleeve over a brass screw) | `[inferred]` |
| Height above surface | ½″ = 12.7 mm | `[corroborated]` |
| **Angular phase** | **offset 22.5° from the quadrant lines** | `[single]` + measured |

**The 22.5° offset is the most consequential angle on the board** and no rulebook
states it. It was established from published build plans (woodgears.ca) and
independently confirmed by measuring the peg positions in Crokinole Canada's own
rules-booklet diagram. The consequence: gaps fall at every multiple of 45°, so
**each player's straight-ahead centreline is a clean lane to the 20**, and each
quadrant line also falls in a gap. Had the pegs been on the lines, the straight
shot would be blocked and crokinole would be a different game.

Derived checks (the harness asserts these):

- adjacent peg centres are **77.76 mm** apart
- clear space between two pegs: **68.24 mm**
- so a 32 mm disc threads the gap with its centre anywhere in a **36.2 mm lane**, i.e. ±18.1 mm

### The discs

The NCA specifies only that discs be wood, of consistent quality, and
contrasting in colour. Dimensions are the international norm, not a rule.

| Quantity | Value | Tag |
|---|---|---|
| Diameter | **32 mm** ±0.5 (imperial equivalent 1¼″ = 31.75 mm) | `[corroborated]` |
| Thickness | 10 mm ±0.5 (3/8″ = 9.525 mm) | `[corroborated]` |
| Mass | **5.6 g** — hard maple at 705 kg/m³ × 8.04 cm³; the one published set weight is 135 g for 24 discs = 5.6 g each | `[derived]` |
| Moment of inertia | ½mr², exact for a flat homogeneous disc | `[derived]` |

**A 34.93 mm hole against a 32 mm disc leaves 1.46 mm of centre travel** in which
the disc is "completely in the centre hole" as Rule 6c requires. That tiny number
— a 2.9 mm-wide target — is the real reason a 20 is hard. Not that you have to
be gentle.

---

## 2. The rules, as implemented

Source: NCA *Official Rules of Crokinole*, ratified 6 May 2026, cross-checked
against the World Crokinole Championship rules and Crokinole Canada's rulebook.

**Structure.** Round = 8 discs each in singles, shot alternately (Rule 4a). Game
= exactly 4 rounds (Rule 2b). Match length is deliberately left to the tournament
(Rule 2c). The first shooter alternates every round *and* every game (Rule 4b),
which is what shares out the advantage of shooting last.

**A valid shot** — two mutually exclusive modes, chosen by whether the opponent
has anything on the surface at the moment you shoot:

- *They have discs out there* (Rule 3a.i): "at least one of the shooter's discs
  must strike an opposing disc either directly, or by bumping one of his/her
  discs already in play into an opposing disc." Chain length is unlimited,
  ordering is unconstrained, and **pegs are irrelevant** — no rulebook mentions
  peg contact in connection with validity. Implemented as a single sweep of the
  contact log: did any disc of my colour touch any disc of theirs?
- *The board is clear of theirs* (Rule 3a.ii, the No Hiding Rule): "the shooting
  disc or at least one disc struck during the shot must end up touching or within
  the 15 line. (A 20 is considered within the 15 line)". Note both generosities —
  it need not be the shooter, and touching is enough.

**Scoring.** 20 / 15 / 10 / 5 inward (Rule 6a). Rule 6b: a disc scores the lowest
value of any region it touches. Rule 6d: touching a line takes the lower of the
two. Rule 6e: judged by the disc's **bottom edge**, not its silhouette from above
— which a circular footprint model satisfies automatically. Rule 6c: a 20 requires
the disc "completely in the centre hole and lying flat".

**The ditch.** Rule 8e/8f as above. Rule 8g, the *Spinning Disc Rule*: a disc that
crosses the line, strikes nothing while out, and returns under its own momentum is
still in play — which falls out of the geometry here rather than needing a rule,
because a disc crossing the line tangentially can travel over the 1″ margin and
re-enter. Rule 8h, *Damage Stays*, cannot arise: the surface stands ½″ above the
ditch, so a disc that has dropped in cannot climb back.

**Knowingly not modelled.** Discs cannot ride up on top of one another in two
dimensions, so the NCA's stacking and leaning edge cases (a disc settled flat on
another scores what the lower one scores; a leaner scores the lowest region it
touches) cannot arise.

### Where leagues disagree

| Question | NCA | WCC / Crokinole Canada | Chosen |
|---|---|---|---|
| Which discs come off on a foul | "all of the other discs that were struck" (colour-agnostic) | "all the other discs **of the same colour** that were struck" | NCA. They can never actually diverge: any shot that struck an opponent disc was legal, so on an illegal shot the only discs that *can* have been struck are the shooter's own. The harness asserts the equivalence. |
| Tied game | a 4-4 game is a legitimate result | a 5th round is played | Practice Mode plays a sudden-death round, so a match always resolves |
| Discs per player | 8 (singles) | 8; 12 in traditional/home play | 8 |

---

## 3. The physics

### The friction law is the whole feel of the game

Dry Coulomb friction: constant force, speed falling **linearly**, and the disc
**stops** at a finite time.

```
v(t) = v0 - mu*g*t        distance = v0^2 / (2*mu*g)        t_stop = v0/(mu*g)
```

Not `v *= 0.98` per frame. Exponential decay never stops, needs an arbitrary
cutoff, and — the part that matters — makes doubling the shot power only double
the distance. Under Coulomb it **quadruples** it, which is the touch a crokinole
player has in their hand.

### The coefficient of friction is genuinely unknown, and says so

There is no published µ for a crokinole board, and there cannot be a canonical
one: the NCA regulates *who* may wax a board (officials only, "if in their
opinion conditions warrant it") but not how much, wax may be reapplied
mid-tournament, and players wax the *disc* from a supply in the ditch. Playing
speed is a property of the afternoon, not of the sport.

So µ is bracketed rather than guessed:

| Regime | µ | Source |
|---|---|---|
| Unwaxed finished wood on wood | 0.3 – 0.5 | USDA *Wood Handbook* ch.3 |
| Measured wood-on-wood particles | 0.33 – 0.43 (mean 0.38) | arXiv 1405.3049 |
| Flat disc on flat surface, measured | 0.202 | arXiv physics/0210024 |
| Boric acid films (dry powder lubricant) | 0.02 – 0.07 | Erdemir, Argonne |
| Curling stone on ice (the low end of the spectrum) | 0.006 – 0.016 | *Lubricants* 10(10) 265 |
| **Chosen: waxed tournament board** | **0.12** | `[CALIBRATED]` |

Cross-checks that make 0.12 defensible: it puts a shot that just reaches the 20
at **0.82 m/s**, inside the 0.7–1.1 m/s band derived independently for a real
open-20 shot; and the one existing crokinole simulator, tuned by feel against
real play, is Coulomb-equivalent to µ ≈ 0.14.

### Sliding and spinning are coupled, exactly

For a uniformly loaded disc, with slip ratio `eps = v/(R*omega)`:

```
dv/dt      = -mu*g*F(eps)
domega/dt  = -(2*mu*g/R)*T(eps)
```

where F and T are the closed forms in complete elliptic integrals given in
arXiv physics/0210024. Landmarks the harness checks to machine precision:

```
F(0)=0    F(1)=8/3pi=0.848826    F(inf)=1
T(0)=2/3  T(1)=8/9pi=0.282942    T(inf)=0
```

These are evaluated once into a 4096-entry table indexed on `eps/(1+eps)`, which
folds the infinite range of eps into [0,1]. An earlier version of this file used
a regularised approximation that matched both limits but was **31% wrong on the
spin-down torque halfway between them**.

Two consequences worth knowing, both of which the harness measures:

- **Rotation reduces linear friction and sliding reduces rotational friction.**
  That negative feedback drives every disc towards a universal slip ratio
  **eps0 ≈ 0.653**, at which sliding and spinning die at the same instant —
  whatever the disc started with.
- **A spinning disc does not curve.** For a flat symmetric disc under uniform
  pressure the friction force is exactly antiparallel to travel. Curvature
  requires non-uniform contact pressure, which a flat disc does not have (a
  *cylinder* does, and does curve). Spin matters on impact — it throws what it
  hits sideways — and it makes a disc run further. It does not bend its path.

### Collisions

| Quantity | Value | Tag |
|---|---|---|
| Restitution, disc on disc | **0.60** — measured wood-on-wood pendulum e = 0.45; wooden ball drop test e = 0.603 | `[measured]` |
| Tangential friction, disc on disc | **0.38** — measured wood-on-wood | `[measured]` |
| Restitution, disc on peg | 0.60 | `[CALIBRATED]` |
| Tangential friction, disc on peg | 0.50 | `[CALIBRATED]` |

Peg values cannot be sourced: pegs are unregulated and vendors sell both
deliberately bouncy and deliberately hard sleeves. Two real tournament boards can
play differently.

Because a disc's contact arm is parallel to the contact normal, `cross(r, n) = 0`
— so the **normal impulse has no angular term at all**. Discs cannot be given spin
by a head-on hit, only by a glancing one. That falls out of the geometry rather
than being asserted, and the tangential (Coulomb, clamped at µ·jn) impulse is the
only thing that can transfer spin.

### The 20 hole

Geometry is exact and official; the tipping dynamics are a 3-D problem this
stands in for, and are calibrated:

- **In passing.** The swept path comes within `R_HOLE - R_DISC` = 1.46 mm of dead
  centre, slowly enough not to ride back out over the 6 mm lip. Tested against the
  *swept segment*, not the endpoint, because one substep is longer than the window.
- **By tipping.** The disc comes to rest with its centre of mass over the hole. It
  is then sitting on nothing, and because the hole is *wider* than the disc it
  cannot wedge on the lip — it settles flat at the bottom.

`V_20_MAX` = 1.15 m/s (arrival) and `A_WELL`/`MU_RIM` are `[CALIBRATED]`. The
resulting window — a 20 needs either a near-perfect line at 0.83–1.2 m/s launch,
or a perfectly weighted soft shot that trickles in — brackets the published
typical open-20 shot of 0.7–1.1 m/s.

---

## 4. Calibrating the AI against real people

Published open-20 success rates, used directly as the difficulty targets:

| Player | Rate |
|---|---|
| Justin Slater | 75.6% |
| Connor Reinman | 66.0% |
| Average competitive | ~55% |
| Recreational | 20–50% |

`harness/crok_game.js` measures the same statistic for each difficulty and holds
it to those bands. Measured: **easy 30%, medium 47%, hard 68%**.

Difficulty is *execution*, not worse shot choice — the AI finds a good shot and
then misses it by a Gaussian amount in aim and a proportional amount in power.
Medium and Hard additionally re-score their leading candidates **through their own
shake** and keep the average, which is what stops the AI picking a shot that
scores 20 struck perfectly and flies off the board struck the way it really
strikes.

---

## 5. Still open

- **Peg-first contact.** No rulebook mentions pegs in connection with shot
  validity. That a peg ricochet is legal is inferred from Rule 3a.i stating only
  one condition with no ordering constraint. Correct in every practical reading,
  but unsourced.
- **Who gets credit for a knocked-in 20.** Never stated. It must be the disc's
  owner, since all scoring is per-colour, but no source says so outright.
- **Peg restitution.** Unregulated and genuinely variable between boards.
- **µ.** Calibrated, and structurally uncalibratable — see above.
- **Disc mass and dimensions.** Manufacturer figures; the NCA specifies neither.

## Sources

**Rules** — NCA *Official Rules of Crokinole* (ratified 6 May 2026):
`nationalcrokinoleassociation.com/wp-content/uploads/2026/05/NCA-Official-Rules-of-Crokinole.docx.pdf` ·
NCA *Season 17 Tournament Tips and Standards*:
`nationalcrokinoleassociation.com/wp-content/uploads/2026/07/Season-17-Tournament-Tips-and-Standards_v2.pdf` ·
NCA *Crokinole Edge Cases*:
`nationalcrokinoleassociation.com/wp-content/uploads/2026/05/Crokinole-Edge-Cases.pdf` ·
World Crokinole Championship: `worldcrokinole.com/thegame.html`, `worldcrokinole.com/faq.html` ·
Crokinole Canada rulebook and FAQ: `crokinole.ca/blogs/news/crokinole-faq` ·
Tracey Boards (WCC board builder): `traceyboards.com/nca-rules/`, `traceyboards.com/that-isnt-how-you-play-crokinole-different-crokinole-rules-and-how-we-play/`

**Board and equipment** — `crokinoleboards.com/description` ·
`maydaygames.com/products/beech-elite-edition-crokinole-board-2025` ·
`woodgears.ca/crokinole/` (build plans, peg geometry) ·
`stephenhouser.com/crokinole` · `wiki.comakingspace.de/Project:Crokinole` ·
`crokinole.ca/blogs/news/crokinole-discs-faq`

**Physics** — Farkas, Bartels, Unger & Wolf, *Frictional coupling between sliding
and spinning motion*, arXiv:physics/0210024 (the exact F and T, eps0 = 0.653, and
the flat-disc-does-not-curve result) ·
*Mechanical properties of polygonal wood particles*, arXiv:1405.3049 (measured
wood-on-wood µ = 0.38 and e = 0.45) ·
USDA *Wood Handbook* ch.3: `fpl.fs.usda.gov/documnts/fplgtr/fplgtr113/ch03.pdf` ·
Erdemir, boric acid films: `osti.gov/biblio/7257960` ·
curling friction: `doi.org/10.3390/lubricants10100265` ·
`wood-database.com/hard-maple/`

**Play statistics and prior art** — The Pudding, *The Physics of Crokinole*:
`pudding.cool/2024/10/crokinole/` (open-20 rates, shot distances, an existing
simulator's constants) · `fortuitouspress.com/crokinole` (250+ filmed shots,
carom angles)
