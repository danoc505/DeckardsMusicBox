# Dungeon synth, fifth pass: THE SCORE, AND THE DRUMS THAT PLAY ONE

*Researched 2026-08-10 at the user's request: "An element of Dungeon Synth we
are missing is Orchestral. We should have the availability for a song to be
like the score from Lord of the rings... We also lack in the drum creativity
area." Fresh sources; measurements are this build's own.*

---

## 1. THE ORCHESTRAL CLAIM IS IN-GENRE, NOT AN IMPORT

The genre's own descriptions already contain the score:

- Dungeon synth "focuses on evoking **cinematic**, atmospheric soundscapes...
  using synthesizers, keyboards, lo-fi production, and drum machines to create
  ambient, **orchestral textures**" [rateyourmusic.com/genre/dungeon-synth].
- The neighbouring style RYM names **sword & sorcery** "incorporates cinematic
  and orchestral elements — **thunderous low brass, pounding war drums,
  choirs, and modal melodies**" [same page].
- A modern artist is praised for exactly the thing the user asked for:
  Murgrind "brings a **near-orchestral quality** to the genre... feel like the
  **score to a blockbuster fantasy film**" [daily.bandcamp.com, "Back to the
  Dungeon"].
- And the genre's named godparent is a Tolkien band: **Summoning**, "the epic
  synth work" cited as a key early influence on dungeon synth [RYM], whose
  sound is "synthesised **horns, harps and dulcimers**... driven by
  **bombastic and martial percussion**" with "tribal-sounding rhythms...
  **pounding toms**... a **deep, echoing bass drum**... at generally slow
  speeds" [equipboard.com/band/summoning; metal-archives reviews].

## 2. WHAT THE LOTR SCORE ACTUALLY IS — the parts a table can use

Howard Shore's trilogy score, from the analyses:

- **Leitmotif is the spine**: "a musical phrase associated with a character, a
  feeling, an event" — estimates run to **eighty** motifs, "all connected
  musically at the smallest level" [taketones.com; lotr.fandom].
  **The program already does this**: a record's themes (A/B/C) recur across
  sections by construction — the mechanism is the rule of three and the
  material system, not something to build.
- **The forces**: "a large symphony orchestra, **three large choirs** (men,
  SATB and boys)... and various soloists" [lotr.fandom]. The program's
  orchestra today: two choir/strings machines (Mellotron, VP-330), the Erang
  strings/pads, three tuned kettles, a war drum, ten Erang percussion
  samples. **What it does not have: brass.** See §6.
- **The enemy is percussion**: "a piece in six heavy and rhythmic notes...
  mainly composed of Japanese **Taiko drums**, blacksmith anvils and metal
  chains"; heroism is "strong **brass** and soaring strings" [taketones.com].
  The score's identity moves live in the drums and the brass — which is why
  the user's two asks (orchestral + drum creativity) are one ask.

## 3. THE TIMPANI ROLL — named by this genre's own sources, and technique

- melodigging (already the shipped table's source): percussion "tends toward
  martial snare patterns or **timpani rolls** rather than driving drum kits".
  The kit has kettle RUN figures and no roll.
- Technique, so the synthesis is right and not a guess:
  - "Timpani rolls are traditionally **single-stroke rolls** (alternating
    RLRL) NOT double-stroke or buzz rolls" — single strokes suffice because
    the drum sustains [freepercussionlessons.com; simplytimpani.weebly.com].
  - "**Roll faster when the head is tight** (high end of the drum's range)
    and slower when it is loose" [gottrypercussion.com] — so the three
    kettles roll at three rates, high fastest.
  - Crescendo/decrescendo rolls are standard practice; "loud to soft to
    loud" is the training exercise [theinstrumentalist.com].
- **Where it goes**: the roll is a section-seam event — the crescendo roll
  into a downbeat is the orchestral arrival gesture, and this genre's fills
  already fire into 7–10 seams a record. The fill IS the roll's home.

## 4. THE MARTIAL SNARE, AND WHAT "SNARE" MEANS IN THIS KIT

- melodigging: "**martial snare patterns**". Summoning: "**martial
  percussion**" [equipboard]. Silenius's side project is literally martial
  industrial [vice.com; grokipedia].
- The figures, from drumming sources: march snare style has "loads of
  **flams** on the accents" and follows "a **broken 16th note pattern** such
  as 1 and da, 1 e da, or 1 e and" [gearspace, military march thread]; the
  **drag** "adds martial character", is "a more open ruff", and historical
  manuals list it as "a beating for tunes with **dotted rhythms**"
  [benjaminwaterson.com; cruiseshipdrummer.com; robinengelman.com].
- **This kit's "snare" lane is the Erang percussion sampler** — dark
  hand-drum one-shots, not a wire snare. So the martial figure lands here as
  a HAND-DRUM figure, which simultaneously closes the open item from the
  second sheet: "**hand drum ostinati** [melodigging] ... a repeating
  hand-drum figure is a third percussion character beside the war drum and
  the kettles, and nothing here plays one." One build, two sourced gaps.
- The dungeon kit's snare pattern today is `[8]` — one strike, every bar,
  every song, forever. The figure becomes a WEIGHTED DRAW per material
  (sparse-or-absent stays in the pool at real weight), with drags on the
  accents the sources put them on.

## 5. WHAT NOBODY GIVES, STILL

- No source gives a martial pattern with bar positions for THIS genre — the
  figures below are built from the march-drumming vocabulary (dotted/broken
  16ths, drag on the accent) and are `[CHOSEN]` in their exact steps.
- No source gives a roll length or a roll rate in numbers for dungeon synth;
  the rates come from the technique sources' faster-when-tighter rule and
  the audible-strokes floor, `[CHOSEN]` inside that.

## 6. THE BRASS, AND THE HONEST PATH TO IT

The score's heroic register is brass and this program has no brass voice —
the Mellotron here carries flute/strings/choir stations only, and inventing
"low brass" from a description is the error the dkc sheet's header warns
about. **The path is the one the Erang pack proved**: the owner lands a
brass/horn sample pack on `main` (recorded patches, ideally one family per
register, notes at C like the Erang set), and the encoder pipeline
(`harness/erang_bank.py`, 37× reduction, measured roots) embeds it as a new
bank family with a machine in the rack. That is the user's own sentence —
"We have a whole bunch of instruments and I can add more" — as an action.

### And the answer to "can the program load the WAVs from main at runtime?"

**No for the program you actually play, and it is the platform saying so, not
a preference.** The published artifact page ships behind a strict content
security policy that **blocks requests to any external host** — a fetch to
github.com from that page is refused by the browser before it leaves. The
same file opened from disk with no internet is the program's own founding
constraint ("no build step, no dependencies, no server"), and a song that
needs GitHub up to make a sound has a server after all. The repo being
public makes the fetch *technically* possible from a locally-opened copy —
and it would still break the artifact, the offline case, and render
determinism the day a file on `main` moves. **WAVs on `main` are the right
place for the SOURCE audio** (the Amen and Erang packs already live there);
the program carries the encoded copy inside itself, and the encoder makes
that cheap: the whole 94 MB Erang pack rides in 3.4 MB of text.

---

## 7. WHAT WAS BUILT — `2026-08-10e`

**The timpani roll (§3).** `art: "roll"` on the kettle voices: literal
repeated strikes — single-stroke, per the technique sources — at three rates
(high kettle ~14/s, low ~8/s, "faster when the head is tight"), each stroke a
step louder, the summed overlapping rings making the crescendo. Its home is
the fill: half of dungeon synth's fills (drawn per song) become a kettle
rolling through the back half of the bar, ending exactly on the next
section's downbeat. MEASURED, rendered: a 1.8 s roll climbs **−24 → −8 dB in
~15 dB of crescendo**, peaks −2.5 dBFS (no clipping), then lets go. Rolls
landed in 12 of 20 songs, 6–9 per record where drawn.

**The martial hand-drum figures (§4).** `kit.snarePocket`, a weighted figure
pool drawn per material on its own named substream — the kick's `pocket`
pattern applied to the snare lane. Dungeon synth's pool: the old toll, march
backbeats, two broken-16th beatings with **drags** on the accents (rendered
in the voice as two grace singles 28/55 ms early — under the grid on
purpose), a pickup figure, and silence at real weight. The drag itself is
`art: "drag"` in the Erang sampler, so any kit that plays samples can be
given one. Measured over 20 songs: 37–43 drags a record, snare notes now
range 108–389 per song where every record used to carry the identical [8].

**Verified**: lofi, acid and jungle rolls byte-identical (the fill builder's
new draws are appended after every existing draw, and the chop branch returns
before them); battery 173 green + the expected stamp red; snapshot moved 600
of 5400 lines, all dungeonsynth, baseline rewritten; blend 20/20; MIDI 19/1
then 20/0 (a 10 ms live-clock tick-drift on the first run — browser timing,
both runs reported); UI 68/0.

**The score (§1–2), stated honestly:** with this build the orchestra the
program owns — two choir/strings machines, the Erang strings and pads, three
tuned kettles rolling crescendos, a war drum marching, martial hand-drum
figures, the atmosphere beds — can all land in one draw, which is the
"availability for a song to be like the score" asked for. The missing voice
is **brass**, and it stays missing until recorded patches land on `main`
(§6); no brass is invented from a description here.

## Sources — new this pass

- [RYM — Dungeon Synth genre page](https://rateyourmusic.com/genre/dungeon-synth/) *(orchestral textures; sword & sorcery: low brass, war drums, choirs)*
- [Bandcamp Daily — Dungeon Synth 2: Back to the Dungeon](https://daily.bandcamp.com/2018/04/02/dungeon-synth-2-back-to-the-dungeon) *(Murgrind: "score to a blockbuster fantasy film")*
- [Equipboard — Summoning](https://equipboard.com/band/summoning) *(pounding toms, deep echoing bass drum, slow speeds)*
- [Vice — Summoning](https://www.vice.com/en/article/summoning-is-the-best-tolkien-obsessed-anti-fascist-metal-band-in-the-world/) *(influence across dungeon synth)*
- [Metal Archives — Summoning reviews](https://www.metal-archives.com/reviews/Summoning/Stronghold/114/) *(martial percussion descriptions)*
- [taketones — Howard Shore leitmotif technique](https://taketones.com/blog/howard-shore-in-the-lord-of-the-rings-how-to-use-leitmotif-technique-to-create-a-masterpiece) *(~80 leitmotifs; taiko/anvils for the enemy; brass for heroism)*
- [lotr.fandom — Soundtracks of the LOTR trilogy](https://lotr.fandom.com/wiki/Soundtracks_of_The_Lord_of_the_Rings_film_trilogy) *(orchestra + three choirs + soloists)*
- [Free Percussion Lessons — timpani roll](https://freepercussionlessons.com/how-to-properly-perform-a-timpani-roll/) · [Simply Timpani — rolls](https://simplytimpani.weebly.com/rolls.html) · [Gottry Percussion — timpani technique](https://gottrypercussion.com/timpani-technique/) *(single-stroke, faster on tighter heads)*
- [The Instrumentalist — mastering rolls](https://theinstrumentalist.com/january-2015/mastering-snare-drum-rolls/) *(crescendo practice)*
- [Gearspace — military march MIDI patterns](https://gearspace.com/board/electronic-music-instruments-and-electronic-music-production/849983-basic-midi-drum-pattern-military-march.html) *(broken 16th figures, flams on accents)*
- [benjaminwaterson.com — what is a ruff](https://www.benjaminwaterson.com/blog/what-is-a-ruff-on-the-drums/) · [cruiseshipdrummer — ruffs and drags](https://cruiseshipdrummer.com/2024/02/24/ruffs-drags-and-general-correctness-in-snare-drumming/) · [Robin Engelman — snare notation 1589–1820](https://robinengelman.com/2010/06/26/examples-of-snare-drum-notation-part-1-1589-1788/) *(drag as martial embellishment; dotted-rhythm beatings)*
