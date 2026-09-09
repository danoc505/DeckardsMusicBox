# Scores beside the program

The measurements in `docs/genre-research/DUNGEON-SYNTH-SCORES.md`, runnable.

    node tools/scores/midimap.mjs <file.mid>        a real score: per track, first/last bar, bars sounding, notes per bar, range
    node tools/scores/leadmap.ts [first] [last]     the same columns off the program, over a run of seeds (GENRE=lofi for lofi)
    node tools/scores/mapfull.ts <seed> [seed...]   one record at the genre's own length: summary, form, who plays which bar
    node tools/scores/trace.ts <seed> [seed...]     the arrangement's own view: star, entry order, each section's roster

The scores themselves are not in this repository — they are a published album
and its transcription. Fetch them to `docs/genre-research/scores/` (gitignored):

    https://archive.org/download/echoes-on-stone-walls/FLOPPY/MIDI/01PRCSSN.MID   … 12RISESN.MID
    https://bitmidi.com/uploads/20613.mid                                          Burzum, Dunkelheit
