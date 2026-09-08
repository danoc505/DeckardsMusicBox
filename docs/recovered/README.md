# Recovered: the console with the drive

`console-with-the-drive.html` is the page that was published as the
artifact `56c29326-27af-4b20-8383-3be3bb27b7b7` up to 2026-09-08, read back
off the artifact service before it was overwritten.

**It is here because it was never in this repository.** The drive — the
record as a city you look around while it plays, with its fog and its rain
and its towers on the peak — was written straight into the published page in
an earlier session and never went into `tools/page.html`. `git log --all -S
"drive-crt"` finds nothing. So `npm run build` has never produced it and
never could, and a republish of the build replaced it. That is exactly the
failure the README warns about: a second mechanism beside the first works
fine until the day the first one runs.

Nothing here is loadable by the build. It is a rescue copy, kept whole so the
drive can be read out of it and put into `tools/page.html` where it belongs.
Once it is there, this directory can go.

What it has that the build does not: the drive (CSS at `.crt.drive`, the
markup at `#drive-crt`, the renderer around `function frame()`, the
pointer/fullscreen handlers, and the analyser tap on the way out of the
worker).

What the build has that it does not: the per-part pedal switches, the FX
pedals with their FIRST/LAST routing, and the rack folded away behind them.
