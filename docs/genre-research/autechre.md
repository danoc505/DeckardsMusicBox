# Autechre — 2026-07-31

*Asked: "research Autechre, this is to make our minimal techno correct because it is not
correct currently."*

---

## The correction that changed what got built

**Plastikman is not incorrect minimal techno. It is correct minimal techno.** Richie
Hawtin, an 808 and a 303, "it's about how much you can do with the least amount — it
means starting small and building up." The table already carries that, measured, with the
16-bar intro and the accretion order argued from sources.

**Autechre are a different band making different music.** They are Warp, they are IDM, and
the organising idea is the opposite one: not a grid stripped to its minimum but a grid
that *does not agree with itself*. Rewriting the Plastikman table to sound like them would
have destroyed a correct genre and produced a bad approximation of a second one.

So this is a **new genre**, `autechre`, and Plastikman is untouched. What was missing was
not a fix — it was an Autechre.

## What the band say they do

Everything in the table comes from these, and where a number is [EAR] it says so.

> **"Rhythm is everything to us. A note is just a sound played for a different length at a
> different pitch."** — Sean Booth, [MusicRadar](https://www.musicradar.com/news/autechre-classic-interview)

> "In terms of melody, for us it isn't so much about writing a tune, it's more about using
> the sound at different pitches to create a feel." — *ibid.*

> "We'll have maybe a handful of sounds and they'll dictate what kind of rhythm we use."
> — *ibid.*

> They use control voltages to skip steps and cascade sequencers with different timings,
> "to create complex polyrhythmic results that appear chaotic but follow quantifiable
> rules." — [Sound On Sound](https://www.soundonsound.com/people/autechre)

> "A sequencer is spitting out stuff and we're using our ears and the faders to make the
> music… one fader determines how often a snare does a little roll or skip, and another
> thing listens and says 'if that snare plays that roll three times, then I'll do this.'"
> — *ibid.*

And from outside: *Confield* is "cold, metallic, percussive and rhythmic"
([Igloo](https://igloomag.com/reviews/autechre-draft-7-30-confield-reissues-warp)); the
grooves are non-linear and "hinge around displacements of typical snares"
([Boomkat](https://boomkat.com/products/draft-7-30)).

## The one that needed new engine: polymetre

> "Using polymetres in electronic music can be as simple as **changing the pattern length
> for only some parts while leaving most at the default bar-long 16 sixteenths**, and
> independent step sequencers with arbitrary pattern lengths make this especially easy to
> do without having to think about the maths involved."
> — [Zoe Blade's notebook](https://notebook.zoeblade.com/Polymetre_and_polyrhythm.html),
> whose worked example is **Autechre using a shorter pattern length on the MC-202 in
> "Windwind"**.

Every drum lane in this program was written against the bar — a step list inside sixteen,
or a division of sixteen. One metre, everything agreeing with everything by construction.
That is right for a house record and it is exactly what this music is not.

`kit.poly` adds a lane with its own **length**, counted in absolute steps so it carries
across the bar line:

```js
poly: [
  { lane: "hat",  len: 7,  on: [0, 3], vel: 0.44 },
  { lane: "rim",  len: 5,  on: [0],    vel: 0.52 },
  { lane: "clap", len: 11, on: [0, 7], vel: 0.4  },
]
```

7, 5 and 11 are all coprime with 16, so nothing lines up until the four-bar loop comes
round. It is a table entry, not a rule — `poly` defaults to nothing, so no existing genre
moved by a sample — and it contains no random draws, so it cannot displace any later draw
on the stream.

The ostinato does the same thing in the pitched voice, using `run: true` — an existing
engine switch built for Berlin School sequencing that had never had a user. Prime-length
cells (7, 5, 11) whose index carries across bars.

**Measured, 12 seeds a genre, off the material rather than the performance:**

```
  autechre     60.1% of drum lanes differ bar to bar
  plastikman    0.0%     (the control: same family of music, ordinary grid)
```

Reconstructing each lane's true period from the notes of one song:

```
  clap   period 11      rim  period 5      snare period 8
  hat    period 28   <- the 4-step hat and the 7-step sequencer cascading
  kick   period 16   <- the bar, deliberately: something has to be the floor
```

The hat's 28 is the nicest result in the table, because nobody wrote it. It is
`lcm(4, 7)` — two hat sequencers of different lengths running at once, which is precisely
the construction Booth describes.

## The thing this table deliberately does *not* do

The obvious way to write "Autechre" into a groove table is a big `jitter`, and it would be
wrong. **They are not a loose band.** They are a precisely sequenced one that puts hits in
odd *places*. Random displacement is a drummer's feel; this music's displacement is
programmed and repeats exactly — "results that appear chaotic but **follow quantifiable
rules**."

So the clock stays machine-tight at 1.2 ms, the same figure Plastikman carries, and every
bit of the strangeness comes from where notes are written: polymetric lanes, a kick pocket
that is usually not four-on-the-floor, snares that never land on 4 and 12, a theme onset
pool weighted to odd steps, and an accent map that peaks on 3, 6, 11 and 14 where every
other genre in the file peaks on 0, 4, 8 and 12.

## Two bugs it exposed, both pre-existing

**The blend's group ownership was a position, not a genre.** Fields that only mean
something together (`bassStyle` with `bassPulse`) are grouped so they come from one genre.
But the group stored an *index into a filtered list* — filtered per field, since genres
skip fields they do not declare. Chosen against `bassStyle` (all genres have one) and read
against `bassPulse` (DKC has none), every genre after DKC shifted by one, the index ran off
the end, and the fallback returned lofi's `bassPulse: null` under someone else's
`bassStyle: "pulse"`. Reachable ever since synthwave; it fired only when a second "pulse"
genre landed past DKC in the list. Owners are recorded as genres now. All-genres-at-once
blend went 18/20 → 20/20.

**A `bassPulse.unit` that does not divide 16 lies about its own density.** At `unit: 3` the
builder writes six notes a bar (0, 3, 6, 9, 12, 15) while the density prediction reads
`16/3 = 5.33`. The battery caught it as this genre and Plastikman landing on the same note
count from different builders whose tables asked for different ones.

## What is not claimed

The generative/reactive half — "another thing listens and says *if that snare plays that
roll three times, then I'll do this*" — is **not built**. This genre is polymetric and
displaced, which is the structural half; it is not a system with feedback rules watching
its own output. That would be a new kind of builder, not a table, and it is the honest next
step if this genre is worth going further with.
