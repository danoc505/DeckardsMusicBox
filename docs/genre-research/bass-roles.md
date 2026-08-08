# THE BASS THAT HAD ONE JOB — and the two numbers that were the real fault

*Researched, measured and built 2026-08-08. Item 4 of the five in
`static-harmony-and-evolution.md` §4. The user, earlier: "our min techno is a
failure, the bassline is trash."*

---

## 1. A CITATION I HAD NOT CHECKED, CORRECTED FIRST

Item 4's whole case rested on one quote, which I wrote into this repo and called
"the whole diagnosis in one quote":

> "Bassists gain the freedom to **pedal a single note, play ostinatos, or engage
> in melodic conversation with the soloists.**"

I attributed it to The Sound Atlas's modal jazz page. **Fetched, that page does
not contain it** — it names Ron Carter, lists the upright bass, and says nothing
about bass roles. The claim is real (the wording turns up verbatim elsewhere and
the substance corroborates), but the page I hung it on does not hold it.

**The source that is fetched and does hold the distinction**, and it is sharper:

> A **PEDAL** is "one or two notes throughout several continuous chords", "based
> on the repetition of long notes", and "always harmonic". An **OSTINATO** is "a
> motif or phrase that's repeated as long as you like", "doesn't rely on only
> one or two notes", is "made up of several short notes", and "can be melodic,
> harmonic and/or rhythmic". "You can usually use both pedal and ostinato at the
> same time" — commonly "an ostinato developing on top of a pedal".
> — [Audiofanzine, *Pedal and ostinato in the modal system*](https://en.audiofanzine.com/music-theory/editorial/articles/pedal-and-ostinato-in-the-modal-system.html)

Corrected at the head of `static-harmony-and-evolution.md` over my name.

## 2. THE GAP WAS REAL, AND IT WAS NOT THE FAULT

Measured, 40 seeds a genre, every material:

```
  genre         style    root%   fifth%   repeats%   distinct/bar   roles used
  lofi          follow    52.6    17.0      12.5        2.03            1
  synthwave     pulse     90.7     9.3      71.5        1.52            1
  vgm           pedal    100.0     0.0      49.6        1.00            1
  bladerunner   drone    100.0     0.0      26.0        1.00            1
  acid          acid      60.6     8.2      43.9        3.10            1
  plastikman    acid      79.2     0.8      62.5        1.70            1
  jungle        riff      17.4    10.6      18.4        2.38            1
  dungeonsynth  drone     69.0    11.2      18.2        1.22            1
```

The last column is the stated gap: **`bassStyle` is one string, so every genre
plays one role for the life of every record.** That is true and it is now fixed —
`bassRoles` is a weighted list drawn **per material**, so A, B and C can each ask
what job the bass is doing.

**And then the measurement said the gap was not the problem.**

Declaring minimal techno as `[["acid", 5], ["drone", 3]]` made it **worse on the
exact axis the user complained about**:

```
                        before    with a drone role
  root                   79.2%         80.8%
  distinct pitches/bar    1.70          1.51
```

Obvious in hindsight: the drone role is 100% root by construction, so giving a
third of the record to it makes the most static bass in the file more static.
The three roles in the source are a menu for a bass that is **free**; this one
was not pedalling by choice, it was pedalling because it could not do anything
else, and a second way to pedal is not a cure. **Removed.**

## 3. WHERE THE TRASH BASSLINE ACTUALLY WAS — three numbers in one table

Minimal techno runs the acid generator. Compared with the acid house genre it
borrows from:

```
                       acid house        minimal techno
  distinctPitches      [3,2] = 3 or 4    [2,2] = 2 or 3
  rootShare            0.45              0.62
  degreePool, root     12 of 28 = 43%    14 of 24 = 58%
```

Three settings all pushing the same way. **I set two of them myself and marked
them `[EAR]`** — which in this project means my ear, and I do not have one. The
owner does, and his verdict on the result was that it is a failure. That
outranks an `[EAR]` tag every time.

**What was kept** is everything the user actually asked for: `density` stays
[3,6] ("minimal is slow building, less notes" — their words), `tieChance` stays
high, `avoidKick` stays. Only how much the line **moves** changed — the count to
the sourced 303 figure ("THREE OR FOUR" [corpus:techno-music.com / musictech])
and the root's share of the pool down to acid house's.

```
  minimal techno bass      before     after      acid house, for scale
  root                      79.2%     62.2%           60.6%
  repeats its own note      62.5%     40.2%           43.9%
  distinct pitches a bar     1.70      2.27            3.10
```

**No longer the most static bass in the file, and still sparser than acid
house** — which is the genre, and which is kept.

## 4. THE MECHANISM IS BUILT AND NOBODY DECLARES IT

`bassRoles` works, is guarded, and is used by no genre. Stated plainly because
an unused mechanism that is reported as a feature is the "composed and never
played" defect wearing a different hat.

- **minimal techno** — tried, measured worse, removed (§2).
- **dungeon synth** — tried as `[["drone",7],["riff",2]]` and it **crashed on the
  first bar**: `riff` reads a `bassRiff` table this genre has never had. The
  file's own blend notes had warned about exactly this ("a riff table blended
  onto a genre whose bassStyle does not read them"). `buildBassLine` now filters
  any role whose table the genre lacks, derived from the genre rather than
  listed, so the crash cannot recur — but a filtered role is a declaration that
  does nothing, so the declaration came out.
- **lofi** was the next candidate and I did not take it: its bass is the second
  healthiest in the file (52.6% root, 2.03 a bar), and a pedal role would make it
  more static, which is the mistake §2 just recorded.

**Which genre should get a second role is an ear question**, and every candidate
I can reach by measurement alone either got worse or had nothing to switch to.

## 5. WHAT THIS DOES NOT SETTLE

- **Nothing has been heard**, including the fix in §3, which is the largest
  change to this genre's notes in the file's history.
- **`bassRoles` has no user.** If the answer is that minimal techno should
  sometimes drop to a held sub under the 303 rather than instead of it, that is
  two parts sounding at once — an ostinato ON a pedal, which is what the source
  actually describes — and this program has no way to say that yet.
- **Dungeon synth needs a riff table** before it can have a second role, and
  nobody has researched what a dungeon synth bass figure is.
- **The `[EAR]` tags across this file are worth an audit.** Two of them were the
  fault here, and they were both mine.

---

## 6. AND THE OWNER'S EAR REVERSED §3 THE DAY AFTER IT SHIPPED

> "The plastikman bass is wrong, it's not how minimal techno and plastikman do
> bass. **I feel like he uses echo to get more notes. We have too much bass and
> not enough fx.** We got it right with the drums but not the bass."

§3 diagnosed the bass as too root-bound and opened it up. The numbers moved
exactly as intended. **The result is wrong**, and the reason is that I answered
a question about TEXTURE with a change to PITCH.

**And the answer was already in this repo, in the user's own words**, about this
exact genre — I quoted it in `rhythm-phrasing`'s neighbourhood and built the
opposite of it:

> "We can start with **one bass note** and fill in the silence with **reverb,
> delay etc.** and build up around that. **It's maximising the minimal.**"

A 303 in this music states a small figure; the DELAY makes the note count. The
extra events a listener hears are repeats of the ones played, not new pitches.

**Reverted**: `distinctPitches` back to [2,2], `rootShare` back to 0.62, the
degree pool back to 58% root — every number as it was.

**Acted on**: `roleGain.bass` 0.62 → 0.50. That is the half of "too much bass
and not enough fx" I can move without hearing, and it also raises everything the
bass feeds — this genre already sends it to the echo, the flanger and the room —
relative to the bass itself.

**NOT acted on, deliberately**: the echo's own feedback and wet/dry. The bass is
already fully sent to the delay (`echoFeeds` membership is a send base of 1), so
"not enough fx" is about the unit's settings, and tuning a wet/dry balance by
arithmetic is precisely what this project says I cannot do. **That one needs an
ear, and it is the next thing to try on this genre.**
