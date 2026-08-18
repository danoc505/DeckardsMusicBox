# THE SECOND KEYBOARD HAS NO RHYTHM OF ITS OWN — and half the sheet that said so was wrong

*Researched and measured 2026-08-18, taking item 2 of
`the-nine-files-against-the-program.md`. That item reads "THE BASS AND THE
SECOND KEYBOARD HAVE NO RHYTHM" and proposes making both busier. **One half of
that is a real defect and the other half is contradicted by the sources.** This
sheet says which is which, with the numbers and the quotes, because acting on
the whole of it would have made two genres worse.*

---

## 1. WHAT IS ACTUALLY TRUE — measured here, not inherited

Onsets a bar off the **performance**, seeds 1–8, four genres. A chord struck
together counts once, because four fingers landing on one instant is one
rhythmic event and counting it as four would flatter every pad in the file.

Two columns, because they answer different questions and quoting only one is
how a part that barely plays looks busy:

```
PLAYED — counting only the bars the part sounds in
  genre               bass     keys2      keys      lead   counter  ostinato
  lofi                 2.5       1.0      10.3       2.9         -         -
  synthwave            6.8         -       8.0       3.2       3.8      16.0
  dungeonsynth         1.5       1.2       1.8       1.5       1.4       4.0
  boxcarsynth          4.5       1.0       3.0       1.7       1.2       6.3

RECORD — across the whole record, playing or not
  lofi                 2.1       0.4      10.3       2.4         -         -
  synthwave            5.8         -       8.0       2.6       1.3      15.9
  dungeonsynth         0.9       0.5       1.2       0.9       0.1       3.1
  boxcarsynth          3.6       0.8       3.0       1.1       0.3       4.2
```

This **reproduces the nine-files sheet** to a tenth on every figure it quotes
(its lofi `keys2` 1.0, boxcar 1.0, dungeon synth's 1.3–1.4 band, synthwave's
6.8 bass and 15.8 ostinato). Independently measured, same answer, so the sheet
is not the thing in doubt here — its **prescription** is.

---

## 2. THE DEFECT, AND IT IS ONE LINE

`buildKeys`, the function that writes both keyboards:

```js
if(opts.sustain) strikes = [opts.at || 0];      // the bridge pads
```

**One press a bar, hardcoded, for every genre, for the life of the program.**
Every branch below it — the figure the inner voice plays, the restatement the
pocket asks for — is gated `!opts.sustain`, so a sustained part gets the
arrival and nothing else, and its note is `Math.max(2, 16 - at)`: exactly to
the end of its own bar, then struck again.

This is principle 1 broken in the plainest possible way. The project's own
words: *"A literal value wired into stage logic is a defect even when it sounds
right."* The second keyboard's rhythm **has no owner.** It is not a decision any
genre made; it is what the builder happens to do. Two of the four genres want
opposite things from it and neither can say so.

That is the finding. It is not "the pad is too sparse" — see §4.

---

## 3. WHAT THE SOURCES SAY A PAD DOES, AND IT IS NOT "BE BUSIER"

This is where the nine-files prescription breaks. **No source found says a
sustained accompaniment part should play more notes as a general matter.** They
say the opposite, and then name the exception:

> "Pad parts typically comprise **sustained legato chords**, which both fill out
> areas of the frequency range and extend the apparent sustain of other chordal
> parts." [corpus:soundonsound]

> "**Not all pad sounds need to be sustained**, though, because sometimes more
> rhythmic parts are called for. **In upbeat productions**, for instance, a
> simple rhythmic repetition of synth chords can help reinforce the track's
> groove and increase clarity." [corpus:soundonsound]

> A pad is "a supporting musical part consisting of **sustained notes** that
> closely follows the chord progression in a song, usually not being a feature
> or highlight of the arrangement." And: "**The pad part doesn't have to be
> rhythmic**, so we don't need a sound with a sharp attack."
> [corpus:garnishmusicproduction]

> "If everything sustains over the same time, layers will blur; designing them
> so **one pad pulls back as the other peaks** results in phrasing instead of
> just layering." [corpus:soundonsound, via the same page's layering section]

**`[two sources, agreeing]`** So one press a bar is not wrong in itself. It is
wrong that it is compulsory. The exception the sources name — rhythmic
repetition of chords — is conditioned on **"upbeat productions"**, and of the
three genres being worked on, none is upbeat in that sense and one is the
furthest thing from it.

### Lofi is the one that asks for the exception

Lofi's own sources do ask for movement in the chord parts specifically:

> "Use **broken chords or rhythmic stabs** to make it feel more musical. Try to
> **vary the chord duration and timing** to give a more edgy and less obvious
> progression. **Play slightly behind the beat**, as sitting exactly on the beat
> sounds too precise for lo-fi." [corpus:hitproducerstash]

And lofi's **first** keyboard already does all of that — 10.3 onsets a bar, the
inner-voice figure, the restatement on the pocket. The second one cannot,
because of the line in §2.

---

## 4. THE HALF OF ITEM 2 THAT IS WRONG — the bass, and dungeon synth's whole band

The nine-files sheet reads dungeon synth's 1.3–1.4 as a fault: *"dungeon
synth's whole band sits at 1.3–1.4: bass, second keyboard and lead all playing
a note or so a bar."* **The sources say that is what this music is.**

> "**Sustain long pedal notes and drones**; allow slow voice-leading."
> [corpus:melodigging, *Dungeon Synth*, "How to make a track"]

> "Use **long, sustained notes** to enhance the ethereal quality of the
> composition." [corpus:dungeonsynth.neocities.org/howto]

> "Layer pads and choirs beneath a clear lead voice. Add counter-melodies in
> higher registers and **grounded drones in the bass**."
> [corpus:melodigging]

And this repo already built that bass deliberately, over several commits, with
`bassPedal`, `bassPedalDouble`, the mode-set pedal degree and the double pedal
a fifth above — all sourced to Pittaway's *Performing medieval music* and
Wikipedia's *Pedal point*, and all recorded in `dungeon-synth-arrangement.md`
§"the drone". **Making dungeon synth's bass busier would be undoing a
researched decision on the strength of a number with no source behind it.**

Lofi's bass is the same story from the other end:

> Keep the line simple — "often sticking to the root and fifth of each chord" —
> and "add a few extra notes to enhance the groove, but avoid overcomplicating
> the line… **typically 2–4 notes per bar** rather than dense patterns."
> [corpus:mysticalankar; corpus:transmissionsamples]

**Lofi's bass measures 2.5. That is inside the range its own sources give.**

So: **no bass change in this build**, in any genre, and the reason is written
down rather than left as an omission.

### The one bass thing that IS open, and it is not density

`buildBassLine` supports `bassRoles` — a weighted list of jobs drawn **per
material**, so the bass changes what it is doing when the section changes. Its
own comment argues for it: *"a part that pedals for nine minutes is pedalling
by default rather than by decision, and a pedal is supposed to be a decision
AGAINST the other two."*

**No genre in the file declares `bassRoles`.** The mechanism was built and
nothing uses it. That is a real gap, it is a table gap rather than an engine
gap, and it is about *variety of job* rather than *notes per bar* — which is
why it is named here and not built here. It wants its own measured build.

---

## 5. WHAT WAS BUILT

**The second keyboard's rhythm becomes a genre declaration, and it can go both
ways.** One field, one owner, following the `bassPulse` precedent of one object
with a few knobs:

```js
pad: { hold: <0..1>, press: [[[steps], weight], …] }
```

- **`hold`** — the chance, drawn once per material, that the pad **does not
  re-press while the chord has not changed**, and holds through instead. This
  is the `drone` bass's own rule one part over: *"a held root that does not
  restrike when the chord has not changed — which is what makes it a drone
  rather than a very slow bass part."* It is self-limiting by construction: it
  can never hold across a chord change, so it is correct under any harmonic
  rhythm and under any blend, and it needs no bar count to be told to it.
- **`press`** — a weighted list of extra sixteenths within the bar. The whole
  voicing speaks again, not an inner voice: a pad re-pressing is all the fingers
  again, which is what "a simple rhythmic repetition of synth chords" describes
  and is *not* what the first keyboard's inner-voice figure does.

**A genre that declares nothing composes exactly what it composed before** —
`hold: 0`, `press: []`, one press a bar. The draws run unconditionally on their
own named substream (`padpress:<material>`), so adding this cannot move a note
in a genre that does not declare it. [Law 3]

### What each genre declares, and why

| genre | declares | the source it comes from |
|---|---|---|
| **dungeonsynth** | `hold` | Its pad re-attacks every bar while its harmony moves every two — this repo's own open item, `dungeon-synth-technique.md` "still open". Plus "sustain long pedal notes and drones" and "long, sustained notes". |
| **lofi** | `press` | "Broken chords or rhythmic stabs… vary the chord duration and timing" [corpus:hitproducerstash], and its own first keyboard already does this while the second cannot. |
| **boxcarsynth** | nothing | No source found either way. It stays at one press a bar, and that is a decision now rather than an accident. |
| **synthwave** | nothing | Has no second keyboard. Untouched. |

### The one that closes an open item

Dungeon synth's row closes the last bullet of `dungeon-synth-technique.md`'s
"still open" list — *"The pad restrikes every bar while the harmony moves every
two, so the most sustained part in the record re-attacks twice as often as the
chords change. The bass already holds correctly; the pad does not."* It is
closed by the pad learning the rule the bass already had.

---

## 6. WHAT IT MEASURED

Presses across the whole record, and how long a press lasts. Seeds 1–8.

```
                          presses per record bar        longest press (s)
  genre        part        before      after          before      after
  lofi         keys2         0.41       1.00            2.96       1.69
  lofi         keys         10.26      10.34            3.38       3.38
  synthwave    keys          8.01       8.01            2.55       2.55
  dungeonsynth keys2         0.50       0.40            3.96       8.18
  dungeonsynth keys          1.16       0.78            4.53       9.06
  boxcarsynth  keys2         0.77       0.77            3.62       3.62
  boxcarsynth  keys          3.00       3.00            3.24       3.24
```

**Both directions work and they are opposite directions.** Lofi's second
keyboard presses two and a half times as often and its notes are half as long.
Dungeon synth's presses *less* often and holds more than twice as long. Boxcar
and synthwave are identical to the digit, which is what declaring nothing is
supposed to buy.

**And the ruler had to be changed before it could see any of this.** The first
measurement was onsets per bar *counting only the bars the part sounds in*, and
on that ruler dungeon synth read **1.2 before and 1.2 after** — no change at
all, on the genre that changed most. A held note removes the onset and the bar
together, so the ratio is untouched. The printout showed it immediately: dungeon
synth's seed 1 went from 75 `keys2` lines to 50. *Check the ruler fits the
thing* — third time this repo has written that down.

### The engine change alone moves nothing

Before either genre declared anything, the printout for four genres × seeds
1, 7 and 42 was **byte-identical** to the build before — the only differing line
was the name of the file being read. [Law 3]

### Blast radius, stated wider than the sheet's title

`sustain: true` is how this builder is told "this part is a pad", and the
material-C **first** keyboard is built with it too. So `pad` reaches the bridge's
chord part as well as the second keyboard — visible above as lofi's `keys`
moving 10.26 → 10.34 and dungeon synth's 1.16 → 0.78. That is deliberate: the
alternative is two rules for two callers of one flag. It is stated here because
the sheet's title says "the second keyboard" and the change is wider than that.

---

## 7. THE OPEN ITEM THIS LEAVES, MEASURED RATHER THAN TIDIED

**A held pad note can ring past the end of its own section, and this change
made the longest one longer.** Asked of 37,374 sustained notes, four genres,
twelve seeds:

```
                notes ringing past their section     worst overrun
  before                  944                            4.505 s
  after                   952                            9.032 s
```

**It is pre-existing** — 944 of them before this change — and this adds **eight
notes**. But the worst case doubles, and a nine-second pad written in one
section and still sounding in the next is a chord under a harmony that did not
ask for it.

**It is not fixed here, on purpose.** The precedent exists: `drone.cut` is a
genre's declaration that its continuous ground must not outlive its section, and
`pad.cut` would be the same three lines one role over. Building it at the end of
this build would also truncate the 944 notes that were already doing this — a
change I have not measured and which belongs to its own commit with its own
before-and-after. Named here and in `BACKLOG.md` rather than silently absorbed.

---

## 8. WHAT THIS DOES NOT DO

- **It does not touch any bass.** §4, with the sources.
- **It does not touch the first keyboard.** That part is the record's harmony
  and it already has every rhythmic device in the file.
- **It does not make anything busier as a policy.** Two genres declare, and one
  of them declares in the direction of *fewer* notes, because that is what its
  sources ask for.
- **Nobody has heard it.** No number in this sheet says it sounds better. The
  printed notes say the mechanism does what it claims and that is all they can
  say.

---

## Sources

- [Creating & Using Synth Pad Sounds — Sound On Sound](https://www.soundonsound.com/techniques/creating-using-synth-pad-sounds)
- [Pads and Strings — Garnish Music Production School](https://www.garnishmusicproduction.com/pads-and-strings/)
- [Dungeon Synth — Melodigging](https://www.melodigging.com/genre/dungeon-synth) *("How to make a track")*
- [How to write dungeon synth — dungeonsynth.neocities.org](https://dungeonsynth.neocities.org/howto)
- [How to Master Lofi Chord Progressions — Hit Producer Stash](https://medium.com/@hitproducerstash/how-to-master-lofi-chord-progressions-ba81ac8c74f5)
- [Crafting Lofi Basslines: A Beginner's Guide — Mystic Alankar](https://mysticalankar.com/blogs/blog/crafting-lofi-basslines-a-beginner-s-guide)
- [How to Make Lofi Bass — Transmission Samples](https://www.transmissionsamples.com/how-to-make-lofi-bass)
- `docs/genre-research/the-nine-files-against-the-program.md` §2 — the item this takes, and the half of it this sheet refuses
- `docs/genre-research/dungeon-synth-technique.md` — the open item this closes
- `docs/genre-research/dungeon-synth-arrangement.md` — the pedal research this declines to undo
- `docs/genre-research/the-second-keyboard.md` — the same part, the parallel-perfect defect, 2026-08-05
