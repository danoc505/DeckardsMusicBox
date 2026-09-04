# Working on this program

**Read `HANDOFF.md` first.** It is the one document that says what we are
doing, what has just been done, what needs doing next, and why. This file
exists only because Claude Code loads it automatically; everything of substance
is in the handoff, and it is not repeated here so the two cannot drift apart.

The three things that will cost you most if you miss them:

- **The piano roll is the main test** for anything that changes notes or who
  plays when: `npm run roll <genre> <seed>`, before your change and after it.
  It cannot see the desk, so a treatment is judged by the WAV, played.
- **A knob that does nothing is this program's cardinal sin.** Measure a new
  rule on and off. If it changes nothing, delete it and keep the note.
- **Do not change behaviour to make a test pass.** The tests encode research;
  if one is wrong, the document it came from is what has to change first.
