# THE RESTRICTIONS, AND HOW THEY SHAPED THE ARRANGEMENT

*Researched 2026-08-08, on the user's question: "did you look into the
restrictions video game music has and how that effect arrangement?"*

**The honest answer to the question as asked is NO, not properly.** The build
before this one (`08j`) researched the SNES hardware and recorded its numbers —
eight voices, 64 KB, a 240 ms echo ceiling — and then explicitly declined to
act on any of them, on the grounds that each would re-voice every song in the
genre. That was the right call for the echo and the wrong shape of answer to
the question, because **the restriction that matters most is not a number you
clamp, it is a habit of arrangement it forced.** This sheet is that half.

---

## 1. THE BUDGET IS NOT EIGHT

> "The SNES's soundchip, **SPC700**, supports 8 channels of sampled sound,
> meaning a maximum of 8 sounds can play at once. In games, this includes sound
> effects, and **game composers frequently reserve a channel or two exclusively
> for sound effects so that no musical parts will be interrupted.**"
> — [samplemance, *SNES Chiptune Guide*](https://samplemance.rs/snesguide/)

So the working budget for MUSIC is six or seven, not eight. And the reservation
is not the only strategy — the alternative is voice stealing, where the game
takes a channel back and **a musical part disappears mid-phrase**. On the
narrower NES the same pressure produced the classic arrangement habit: pieces
were written in separable parts — bass, melody, countermelody — so that the
**countermelody could drop out** when an effect needed the channel and the rest
still stood up. ⚠ *That last sentence is from a search summary across NESdev
forum material, not a page I fetched; the quoted budget line above IS verified.*

## 2. WHAT THAT DOES TO ARRANGEMENT — the part the last build missed

A console score is written so that **any given part can leave and the music
still works.** That is a compositional discipline, not a mixing one, and it has
three consequences this program should care about:

1. **Parts come and go by design.** Nothing is "the constant". A texture where
   one voice never stops is precisely what a channel-budgeted score cannot
   afford, because that voice can be taken away at any moment by a footstep.
2. **The layers must be separable.** A cell that only makes sense on top of
   another cell is a liability; each part has to hold its own.
3. **The loop is short and the RETURN is the event.** A track is a loop, so the
   interest comes from what is present on this pass and absent on the next.

## 3. WHAT THIS PROGRAM WAS DOING, MEASURED

Share of all bars in which each part sounds — 30 songs, read off the
performance:

```
                ostinato   keys   lead   counter   bass   drums
  vgm  BEFORE      99%      81%    58%     27%      67%    44%
  vgm  AFTER       64%      81%    58%     27%      67%    44%
```

**The figure was in 99% of bars** — more constant than the drums, the tune or
the chords, and it was there because the table said so in as many words: *"the
ostinato is the constant: it is in every section."* A decision, written down,
and refused by the owner:

> *"That bouncing … it's too much to always be there, it doesn't fit with the
> rest, it's not like in the video game."* — the user, 2026-08-08

Both halves of that are supported by §1–2. It is too much to always be there
because a console score cannot afford anything that is always there; and it is
not like the game because in the game the figure is the identity of ONE track's
loop, not a bed under a multi-section song that runs for minutes.

## 4. WHAT WAS CHANGED

`form.roles` — the ostinato stands down for the **chorus** (already the fullest
section, six parts) and the **bridge** (the departure), and holds the intro,
the verse, the instrumental and the outro. It opens the record and it returns,
instead of never leaving.

**MEASURED: 99% → 64% of bars.** Mean parts sounding at once is **3.43**,
comfortably inside the six-or-seven the hardware allows — so this is not a
budget fix, it is an idiom fix, and the budget is recorded here as the reason
the idiom exists rather than as a clamp.

**HOW FAR to take it is `[CHOSEN]`.** No source gives a percentage. 64% is the
first answer and not the settled one; the honest next step is the owner’s verdict, not
another table edit.

## 5. THE SECOND FAULT IN THE SAME COMPLAINT, MEASURED AND *NOT* FIXED

"It doesn't fit with the rest" may be two things, and only one of them is
constancy. The other is the clash:

```
  ostinato notes sounding a semitone from a chord note, vgm, 60 seeds
    28.5%   (and 27.7% BEFORE the chromatic harmony landed in 08j)
```

**So the chromatic harmony I added is responsible for 0.8 points of it and the
other 27.7 were already there.** I checked this first precisely because I had
just changed the harmony and the complaint arrived immediately afterwards; it
would have been easy and wrong to blame my own most recent change.

This is *by design* as the table currently stands — `dkc.md`'s measured
headline is that the cell deliberately does not follow the chords, and "the Ab
in the cell against a Bb bass is not an error being corrected — it is the
sound". But 28% is a rate nobody has ever chosen or heard a verdict on, and the
source describes a cell whose notes are all IN the mode, which is a much weaker
claim than a semitone against a sounding chord tone. **Left alone deliberately:
one complaint, one change, so the owner can tell which fix did what.** If the
bouncing still does not fit after this, this row is the next suspect and the
number to move is the cell's relationship to the chord, not its volume.

## 6. WHAT IS STILL NOT MODELLED, and now has a reason rather than a shrug

- **The eight-voice ceiling as a law.** Mean parts-per-bar is 3.43 and the peak
  matters more than the mean; nothing enforces a cap. The SEGA rig already has
  a chip budget with voice-stealing priority, so the mechanism exists and could
  be pointed at the SNES's number.
- **The 240 ms echo ceiling.** Sourced in `chrono-trigger.md` §3, still not
  applied, still for the same reason: it re-voices every song in the genre.
- **Voice stealing as a musical event.** On the real console a part vanishing
  mid-phrase is a *sound of the medium*. This program has no notion of it.
