# samples/amen — the twenty Amen WAVs

**Empty on purpose right now.** The files are not in this repo yet: `.gitignore`
carried a blanket `*.wav` (written for render artifacts), and git skips an
ignored file *silently* on `git add` — no error, nothing in `git status`. So
they looked committed from the machine they live on and had never left it.

The rule is narrowed now and `samples/**` is kept. To land them:

```sh
cp /path/to/your/*.wav samples/amen/
git add samples/amen && git commit -m "the twenty Amen WAVs" && git push
```

If any still refuse, `git check-ignore -v <file>` names the rule that is eating
them.

## Before they land, two things worth deciding

**Size.** This program is ONE self-contained HTML file with no external
requests, so a sample has to be base64'd into it — that is how the mda ePiano
bank is carried (1.1 MB of the file's 1.9 MB). Twenty WAVs of a four-bar break
at 44.1 kHz mono is roughly 2–6 MB raw, ~1.4× that as base64, which would double
or triple the file. Options, in the order they should be considered: mono,
22–32 kHz, trimmed to the loop, and possibly one WAV rather than twenty if they
are takes of the same break rather than twenty different breaks.

**Licensing.** `docs/LICENSING.md` governs what may be vendored. The current
`AMEN`/`makeBreak` path *synthesises* the break precisely so the file ships no
recording — that was a deliberate choice, not an accident of effort. Replacing
it with the real thing is the user's call to make knowingly, not one to slide
into because the samples were to hand.

Neither of these blocks the chopper: `buildBreak` already chops by onset, and
`V.brk` already plays a slice with offset, rate, reverse, tone, cut and tail. A
real buffer swaps in where `makeBreak` fills the Float32Array today.
