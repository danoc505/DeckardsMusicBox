# The bass section — bassoon and contrabassoon, and the octave between them

*Researched 2026-08-15. The owner: "can we improve the bass section with the
bassoons and the contrabassoons?" This sheet is the actual orchestral doctrine
for the pair, quoted, and what this program builds from it.*

## 1. The contrabassoon is a 16-foot stop, and it is rarely alone

Rimsky-Korsakov, *Principles of Orchestration* (Gutenberg #33900):

> "Like the double bass and double bassoon, the tuba is eminently useful for
> **doubling, an octave lower, the bass of the group to which it belongs**."

> "The very deep notes of the double bassoon are remarkably **thick and dense
> in quality, very powerful in _piano_ passages**."

> "The characteristics of the bassoon's low compass are still further
> accentuated in the corresponding range of the double bassoon, but **the
> middle and upper registers of the latter are by no means so useful**."

His own scores show the pairing as a working method, not a rule of thumb:
*Legend of Kitesh* m.306 is a "double bass solo, doubled first by the double
bassoon, later by the bassoon"; *The Golden Cockerel* m.120 runs "D. basses +
D. bassoons" together.

The modern treatise language says the same thing from the other side: the
contrabassoon's traditional function is the organ's 16-foot stop — it "adds
definition to the string contrabasses, who in turn are doubling the cellos an
octave [above]", and it "**can anchor a bass line by itself in passages of mf
or less**" — i.e. above mf it wants a partner. Its attack is slow ("a slower
response as the sound wave passes through the twists and turns of its bore")
and its notes carry "a rattle and gravity that seem to shake the hall even if,
in reality, it isn't terribly loud".
[timbreandorchestration.org, The Bassoon Family]

## 2. The bassoon is the definition on top of that weight

Same source: the bassoon "**adds strength and clarity when doubling cellos
and/or basses**". The classic disposition of a woodwind bass section is
therefore vertical, one octave apart:

    bassoon        — the PITCH: attack, definition, the note you can name
    contrabassoon  — the WEIGHT: an octave below, felt more than heard

The pair is one instrument in two registers. A contrabassoon alone above
piano gets woolly (its "hoarse and disembodied" character); a bassoon alone
lacks the floor. Together the bass line has both a front edge and a
foundation. This is exactly the program's existing brass doctrine ("the tuba
doubles the bass of its group an octave down") applied to the reed family the
genre already draws.

## 3. Direction of the doubling, and this program's own table

`STACK_OK.bass` (from this same Rimsky-Korsakov chapter) says the bass may be
doubled DOWN and never up. The bassoon-above-contrabassoon pair does not
contradict it: in RK's terms the *bass of the group* is the bassoon line, and
the contrabassoon is the octave-lower doubling. When this program's bass lane
is *played by* the contrabassoon, adding the bassoon an octave above is not a
new harmony part crossing the spacing rules — it is the same line's upper
octave, a **registration** (the 8-foot stop drawn with the 16-foot), rendered
inside the instrument's own voice at an inferior dynamic level, exactly as
every drawn doubling in this file already is.

## 4. The recording this program uses

**VSCO-2 Community Edition, `Woodwinds/Bassoon/sus`** (CC0, the pinned commit
this file's brass already comes from): sustained notes at two dynamic layers
(`v1` soft, `v2` loud) across the instrument's working compass, plus
staccatos. Same treatment as every recorded member: root pitch and harmonic
recipe MEASURED from the audio, level-normalized so unity trims, spliced as a
measured table beside the brass and the Philharmonia contrabassoon.

The program's `bassoon` has until now been a *synthesized* reed. The recorded
instrument replaces its sound at stage 6 only — the notes every record wrote
for the bassoon are byte-identical, and what changes is that a real bassoon
now plays them. That is the same contract the mixer kept when channels were
rebuilt: the music does not move, the sound does.

## 5. What is built, and what is not

Built:
- The recorded VSCO bassoon as the `bassoon` voice (stage 6 swap).
- The **section pairing**: when the contrabassoon carries a bass line, a
  bassoon layer an octave above at an inferior level — a voicing control on
  the contrabassoon, ridden by dungeon synth. RK's *Kitesh* disposition as a
  knob.

Not built, recorded so the omission is a decision:
- The bassoon does NOT join dungeon synth's bass *pool*: its floor (its
  lowest note is B♭1) would narrow the genre's bass band [28,43] to [34,43]
  for every record ever drawn, which is a register decision the genre has not
  asked for. The pairing above gets the same sound without the narrowing.
- Staccato layers (`stac/`) — the sustained engine serves the pads and lines
  the genres actually write; short articulation is task #58 territory.

Sources:
[Rimsky-Korsakov, Principles of Orchestration (Gutenberg #33900)](https://www.gutenberg.org/files/33900/33900-h/33900-h.htm) ·
[Timbre & Orchestration Resource — The Bassoon Family](https://timbreandorchestration.org/isfee/extreme-orchestration/woodwinds/bassoon-family) ·
[VSCO-2-CE (CC0)](https://github.com/sgossner/VSCO-2-CE)
