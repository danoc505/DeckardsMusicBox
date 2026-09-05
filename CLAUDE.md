# Working on this program

**Read `HANDOFF.md` first.** It is the one document that says what we are
doing, what has just been done, what needs doing next, and why. This file
exists only because Claude Code loads it automatically; everything of substance
is in the handoff, and it is not repeated here so the two cannot drift apart.

**Then read `README.md` § "How a change is made here".** It says where a rule
belongs and how to tell a change that was built into this program from one
that was bolted onto it. Ignoring it has cost this program its climax once.

The four things that will cost you most if you miss them:

- **Find what already owns this and change that.** A rule about which moves
  are legal goes in `push()`; about which is best, in the score; a number a
  genre may state, in `spec.ts` with a default, a `resolve.ts` check and a
  source; a bug, in the code that has the defect and never in a guard around
  it. The README table covers the rest. A second mechanism beside the first
  always works at first and the bill comes later.

- **Prove it on seeds you did not choose, against the commit before yours,
  and measure what you were NOT aiming at.** README § "Prove it, or it did
  not happen". A number with nothing beside it is not evidence.

- **The piano roll is the main test** for anything that changes notes or who
  plays when: `npm run roll <genre> <seed>`, before your change and after it.
  It cannot see the desk, so a treatment is judged by the WAV, played.
- **A knob that does nothing is this program's cardinal sin.** Measure a new
  rule on and off. If it changes nothing, delete it and keep the note.
- **Do not change behaviour to make a test pass.** The tests encode research;
  if one is wrong, the document it came from is what has to change first.
