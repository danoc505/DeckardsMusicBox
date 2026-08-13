# Playing a sampled instrument — what a WAV can and cannot be asked to do

Written 2026-08-13, after six wrong answers to one report. Every earlier answer
treated "the flute repeats itself" as a question about WHICH PITCH WAS CHOSEN
and looked in stage 3. It is not. It is a question about what happens to a fixed
length recording when a note lasts longer than the recording does, and it lives
in the sampler.

The owner's correction, verbatim, and it is the whole brief:

> *"Think about what your saying! This is a sampled WAV file that can only play
> the length of its file. You cant just make it go longer that is the whole
> problem you missusing sampled notes from instruments thats the whole thing. It
> works with drums as hits and you fail to be able to use these sample packs
> properly. You need research on how to do this because your just guessing
> horribly wrong on something very clear and obvious"*

Every number below is measured off this repo's own bank unless it carries a
citation. Nothing here is inferred from what a sampler "probably" does.

---

## 1. What the program currently does

`erangVoice`, at the sampler's note-on:

```js
src.playbackRate.value = (s.root > 0 && ev.pitch != null)
  ? (F(ev.pitch) / s.root) * tune : tune;
if(s.ls >= 0){
  src.loop      = true;
  src.loopStart = s.ls / ERANG.rate;
  src.loopEnd   = s.le / ERANG.rate;
}
```

Two facts about that, both measured:

**The loop points are fabricated.** 69 of the bank's 110 patches carry a loop.
**All 69** have `loopEnd` at the last sample of the file. `loopStart` is not a
found sustain point either — it is a flat ratio the encoder wrote:

| family | patches | `loopStart` as a fraction of the file |
|---|---|---|
| Lead | 10 | 0.4500 – 0.4537 |
| Pad | 8 | 0.4501 – 0.4525 |
| strings | 10 | 0.4500 – 0.4518 |
| Noise | 5 | 0.4500 |
| sfx | 3 | 0.4500 |
| bardFlute | 8 | 0.2200 – 0.2205 |
| bardWind | 9 | 0.2200 – 0.2205 |
| bardPluck | 16 | 0.2200 – 0.2235 |

0.45 and 0.22. Not one of the sixty-nine was measured from the audio. The
encoder multiplied the sample count by a constant and wrote the answer.

**The loop therefore runs into the end of the recording and jumps back.** The
end of the file is where the recorded note has *finished* — the decay, the tail,
the room. Every lap plays a death and then a fresh attack, at a splice that is
neither at a zero crossing nor phase-matched.

---

## 2. What the rules actually are

### 2.1 A loop needs a steady state, and most instruments do not have one

> *"It's usually a good idea to set loop points on zero-crossing points, because
> there won't then be any amplitude changes at the edit points."*
> — Sound On Sound, *The Lost Art Of Sampling: Part 4*

The same article is blunt that the hard part is not the click, it is finding
anything to loop:

> *"Most instrument sounds vary considerably in amplitude and harmonic/timbral
> content over the course of a note."*

> *"Even if you can get the amplitudes to match at your loop points, there will
> often be harmonic changes happening over the course of a section that disrupt
> your attempts to make inaudible loops."*

A zero crossing is necessary and nowhere near sufficient. A loop can still click
when the phase or pitch at the two endpoints does not match, which is normal in
any tone with several partials beating against each other.

### 2.2 A long loop, never a short one — and this sentence is the complaint

> *"It is best to make loop sections as long as you can, to minimise the
> impression that the sample consists of an intro portion and then the same few
> milliseconds of sound repeated ad infinitum."*
> — Sound On Sound, ibid.

The author's own working figures: about five seconds of material, loops of about
four seconds.

That sentence describes the reported fault exactly. It was written as advice
about how a loop *sounds wrong*; here it is a description of what this program
does.

### 2.3 A sample that cannot loop is played ONCE — that is a mode, not a failure

Samplers name this and it is the standard answer:

- **One-shot** — *"plays just once regardless of how long a key trigger is
  sustained"*, has no looping, and is *"best suited to drum hits or sampled
  phrases."*
- **Classic / sustained** — a complete ADSR with *"looping so the sample will
  sustain as long as a note is held down"*, for building a melodic instrument
  out of a pitched sample.
- **One-shot with loop** — plays the onset once, then repeats a different region,
  *"for sound samples that are indefinitely sustained but have unique onset
  characteristics."*

So the choice is not "loop or sound broken". A phrase recording is *supposed* to
be a one-shot. The drums in this program already work for exactly that reason:
a kit patch is a hit, a hit is a one-shot, and no one asked it to last longer
than it lasts.

### 2.4 Transposition changes the length, and that is a design constraint

> Notes higher than the sample's own pitch sound shortened; notes lower sound
> stretched — audible differences in note length, worst at the extremes.
> — MusicRadar, *9 ways to improve your multisampling skills*

Which means "is this sample long enough for this note" cannot be answered from
the file length alone. The answer is `fileLength ÷ (F(pitch) / root)`.

### 2.5 If you cannot loop it, re-trigger it from the sequencer, deliberately

> A more satisfactory approach than looping is to re-trigger the sample from the
> sequencer — if the sampled loop is four bars long, play a new note every four
> bars, quantised.
> — Sound On Sound, *Sampling Basics, Part 3*

The distinction matters for this program: a re-trigger placed by the composer is
a musical event on the grid. A loop wrap inside the voice is an accident whose
period is set by the length of a WAV file, and it lands wherever it lands.

### 2.6 If you need long notes, record long samples

> For sustained sounds where loop points cannot be made, use longer samples —
> ten to fifteen seconds or more.
> — KVR, *Note length when sampling a keyboard?*

---

## 3. What this bank actually is

### 3.1 Envelope of every pitched patch

RMS in eight equal slices, peak-normalised, 9 = loudest.

```
  bardFlute_01_C6     0.22s   3 7 9 8 7 6 3 4     swells then dies
  bardFlute_02_C6     1.86s   6 6 7 5 5 7 9 4     swells then dies
  bardFlute_03_C6     1.04s   2 5 9 7 6 2 0 1     swells then dies
  bardFlute_04_C5     2.03s   8 9 6 6 7 8 7 2     swells then dies
  bardFlute_05_C6     2.10s   6 8 9 7 9 6 4 2     swells then dies
  bardFlute_06_B4     3.18s   9 9 7 7 2 2 1 1     hit, decays
  bardFlute_07_C6     0.64s   6 9 7 1 1 1 0 3     swells then dies
  bardFlute_08_Cs6    2.32s   8 9 6 6 7 8 6 7     swells then dies
```

Ragged. `6 6 7 5 5 7 9 4` is not a held note, it is a played phrase with breath
and vibrato in it. Compare the Erang `Lead` and `strings` families, which are
`9 8 8 8 8 8 8 8` and `7 8 9 9 8 9 9 8` — those genuinely are held tones.

### 3.2 Can they be looped at all?

The test a sustain loop actually requires: a region steady in BOTH level (RMS
within 10%) and pitch (autocorrelation period within 2%), for long enough to be
a loop rather than a stutter.

```
  patch                len      longest region steady in level AND pitch
  bardFlute_01_C6     0.22s          0 ms
  bardFlute_02_C6     1.86s        200 ms
  bardFlute_03_C6     1.04s        100 ms
  bardFlute_04_C5     2.03s        100 ms
  bardFlute_05_C6     2.10s        100 ms
  bardFlute_06_B4     3.18s        200 ms
  bardFlute_07_C6     0.64s          0 ms
  bardFlute_08_Cs6    2.32s        100 ms

  bardWind_01_C4      2.87s       1600 ms   loopable
  bardWind_02_C5      3.09s        300 ms   loopable
  bardWind_03_C4      0.60s          0 ms
  bardWind_04_Ds5     9.42s        300 ms   loopable
  bardWind_05_Cs7     2.81s        200 ms
  bardWind_06_C5      3.46s        600 ms   loopable
  bardWind_07_C3      2.12s        200 ms
  bardWind_08_C5      2.75s        700 ms   loopable
  bardWind_09_C3      1.78s        200 ms
```

**Not one of the eight `bardFlute` patches has a loopable region.** The longest
steady stretch in the whole family is 200 ms, and two have none at all. Against
Sound On Sound's four seconds, and against its warning about "the same few
milliseconds of sound repeated ad infinitum", these files cannot be looped by
anybody. They are one-shots that have been declared loops.

`bardWind` is better: five of nine have something, though 300 ms is still an
order of magnitude short of the practice.

---

## 4. And the wrong patch is loaded, every song

The pitched sampler picks ONE patch per song:

```js
pick = Math.max(0, Math.min(list.length - 1, Math.round(P(g, ev, mach, "patch", 0))));
```

The `patch` control is `def: 0`. Hobbit synth's `params` block sets `patch: "any"`
for `erangStrings`, `erangHarp` and `erangLead` — and **does not mention
`bardFlute` or `bardWind` at all**. Measured over 40 seeds: the parameter is
unset in 40 of 40, so the knob sits at 0 in every record ever made.

Patch 0 of `bardFlute` is `bardFlute_01_C6`: **0.222 seconds, the shortest of
the eight.** The other seven — 0.64, 1.04, 1.86, 2.03, 2.10, 2.32, 3.18 s — have
never been loaded by any song.

Against seed 1's lead line, whose notes run 0.26 s to 1.58 s, and correcting for
transposition (the lead sits an octave or so below that patch's C6 root, so the
file stretches to roughly 0.45 s):

```
  patch loaded         avg plays per note      worst note
  bardFlute_01_C6  <-- 2.04                    5.4
  bardFlute_02_C6      1.00                    1.0
  bardFlute_03_C6      1.00                    1.0
  bardFlute_04_C5      1.00                    1.0
  bardFlute_05_C6      1.00                    1.0
  bardFlute_06_B4      1.00                    1.0
  bardFlute_07_C6      1.05                    1.7
  bardFlute_08_Cs6     1.00                    1.0
```

**The one patch the program always loads is the only one that wraps.** Seven of
the eight would play a note once and stop. The eighth plays it twice on average
and up to five and a half times, and because its steady region is 0 ms every one
of those laps is a fresh swell and die.

That is the reported sound, and the cause is three independent faults lining up:
a loop flag set on a file that has nothing to loop, loop points invented by
formula, and a patch default that lands on the shortest file in the family.

---

## 5. What follows for this program

Stated as findings, not as a plan; the owner decides which of these to build.

1. **A patch that has no steady region must not carry a loop.** The loop flag
   belongs to the SAMPLE, measured, not to a constant in the encoder. On this
   bank that would switch all eight flutes and four of nine winds to one-shot.

2. **Where a loop is real, its points must be found, not computed** — inside the
   steady region, phase-matched, crossfaded, and as long as the region allows.
   `loopEnd` must never be the end of the file.

3. **The `patch` default is a silent single-sample instrument.** Eight patches
   are on the shelf, one is ever heard, and the panel gives no sign. Every Erang
   and Bard sampler in the file has the same `def: 0`.

4. **A note may not be written longer than the voice can play it.** That is the
   owner's sentence — a WAV is as long as it is. The sampler cannot fix it after
   the fact; stage 3 has to know the ceiling, and the ceiling depends on pitch
   (§2.4). This is the same shape as `lines.repeat` and every other playing
   discipline in this file: a fact about an instrument, declared where the
   instrument can see it.

5. **The drums are the proof the model works.** They are hits, played once, never
   asked to last. Nothing about them is broken. The pitched families were given
   the drum treatment's opposite — infinite sustain — without anyone checking
   whether the recordings could support it.

---

## Sources

- Sound On Sound, *The Lost Art Of Sampling: Part 4* —
  https://www.soundonsound.com/techniques/lost-art-sampling-part-4
- Sound On Sound, *Sampling Basics, Part 3* —
  https://www.soundonsound.com/techniques/sampling-basics-part-3
- Sound On Sound, *Making Sampled Instruments In Ableton Live* —
  https://www.soundonsound.com/techniques/making-sampled-instruments-ableton-live
- MusicRadar, *9 ways to improve your multisampling skills* —
  https://www.musicradar.com/tuition/tech/9-ways-to-improve-your-multisampling-skills-633436
- Top Music Arts, *Ableton Simpler vs Sampler* (one-shot vs classic modes) —
  https://topmusicarts.com/blogs/news/ableton-simpler-vs-sampler
- KVR Audio, *Note length when sampling a keyboard?* —
  https://www.kvraudio.com/forum/viewtopic.php?t=545910
- KVR Audio, *How I crossfade loop samples for infinite sustain* —
  https://www.kvraudio.com/forum/viewtopic.php?t=482825
- Synthstrom Audible forums, *Zero crossing for samples and loop points* —
  https://forums.synthstrom.com/discussion/5353/zero-crossing-for-samples-and-loop-points
- SampleStack, *How to make seamless loops for sustained samples* —
  https://samplestack.app/news/seamless-loops-for-sustained-samples/
