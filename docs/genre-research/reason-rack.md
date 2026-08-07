# REASON'S VIRTUAL RACK — what it is, and what we took

*Researched 2026-08-07, before restructuring the UI, on the user's instruction:
"We need to study Reason software and copy its Virtual Rack system."*

---

## 1. WHAT THE RACK IS

Propellerhead/Reason Studios' design "emulates a recording studio with a mixing
desk and a rack of virtual instruments and effects, mimicking physical
equipment" — an SSL-style desk and a rack you insert devices into
[[Record/Reason, Wikipedia](https://en.wikipedia.org/wiki/Record_(software))].

> **"The Rack is where you build your sound, by placing instrument and/or effect
> devices."**
> [[Reason Studios docs](https://docs.reasonstudios.com/reason12/working-with-the-rack)]

That sentence is the whole of the model and it is the part this program was
getting wrong. **The placing happens IN the rack.** Not in a control panel above
the rack, not in a menu bar — you put a device into the rack and from then on
the device is the thing you interact with.

## 2. THE FOUR PROPERTIES WORTH COPYING

| property | Reason | source |
|---|---|---|
| **A device carries its own identity** | every device has a **"tape strip"** showing the name of the loaded patch, edited on the device | [docs](https://docs.reasonstudios.com/reason12/working-with-the-rack) |
| **Devices fold** | "If you don't need to edit the parameters for a device, you can fold the device to make the rack more manageable" | [docs](https://docs.reasonstudios.com/reason12/working-with-the-rack) |
| **One device, many patches** | Kong is *a* drum device that loads any kit, rather than a device per kit; Redrum likewise | [ReasonTalk](https://forum.reasontalk.com/viewtopic.php?t=7498754); [SOS, Drum Instruments](https://www.soundonsound.com/techniques/drum-instruments) |
| **Devices duplicate** | Ctrl+D duplicates a device/channel; Rack Extensions are "full rack citizens" supporting copy/paste | [Reason Studios press](https://www.reasonstudios.com/press/propellerhead-unveils-rack-extension-technology-for-reason) |

And one more, which is the sub-rack idea:

> The **Combinator** "is a device that contains other Rack devices, allowing you
> to make a section of your Rack self-contained and portable… like a sub-rack: a
> box containing its own Rack that behaves just like the main Rack."
> [[SOS](https://www.soundonsound.com/techniques/reason-exploring-new-combinator);
> [docs](https://docs.reasonstudios.com/reason12/the-combinator)]

## 3. WHAT WE HAD, AND WHY IT WAS WRONG

A row of `<select>` elements at the top of the page, one per rack slot, above a
column of machine panels. The user: *"At the top of the program is rack choices
I do not like this. Those choices should be in the Racks themselves."*

Measured against §1 that row is a **control panel about a rack** rather than a
rack. Three concrete faults, all of which fall out of the model:

1. **The choice was not on the thing it changed.** You picked a machine in one
   place and its face appeared in another.
2. **A rack you could not see, you could not fill.** Panels were drawn from
   `RACK_SLOTS` and the pickers from `RACK_ON`, two different sets — so a slot
   could have a picker and no panel, or a panel and no picker.
3. **The `×` and the `none` option did the same job differently.** `×` hid the
   picker and left the machine playing; `none` is a documented MUTE.

## 4. WHAT WAS BUILT, AND WHAT WAS NOT

**BUILT**

- **Every rack carries its own picker**, in its nameplate, where a Reason device
  carries its patch name. Same element, same `m_<slot>` id, same
  recompose-don't-stop behaviour — moved.
- **An empty rack still shows**, as a bay with its nameplate and its picker and
  a line saying why it is empty. This is what §1 requires and it fixed a
  regression the move itself caused: with panels only drawn for filled slots,
  `keys` and `lead` vanished on lofi seed 1 along with any way to load them.
- **The top row is gone.**
- **ALL THE DRUMS ARE ONE MACHINE.** `procession` (timpani + war drums) and
  `erangDrums` (sampled Erang percussion) are now **kits of the TR-1000**,
  joining analog/acoustic/sega/gretsch/brk. This is Kong's model exactly — one
  device, any kit — and the Gretsch entry had already made the argument in the
  code: a kit is a lane-to-voice map, and the TR-1000 already owns the tune, the
  decay, the filter, the sends and a fader per voice.
- **The KIT switch's travel is derived** from the collection it picks, so adding
  a kit is one entry and nothing else. It was a hand-written `max: 4` for four
  kits, which had already gone stale once at five.
- **A genre draws a kit BY NAME** — `[["procession", 6], ["erang", 3]]` —
  resolved against that collection, because an index is a position in a list
  nobody wrote down on purpose.
- **The song and the notes are racks**, so nothing on the page is loose
  furniture. The note rack IS the MIDI display: it draws through `midiKeyFor`,
  the same function the `.mid` export and the live port use.
- **The pad bay's pads carry their own two knobs**, because an XY pad IS two
  controls and they were on other panels.
- **EVERY DRUM CHANNEL IS A LOADABLE SLOT — and this is not an invention.**
  The user, stressing the point: *"the real TR-1000 is made with the ability to
  do what we are doing, i just want to stress that fact we are not doing
  something special here."* That is the correct framing and the entry below
  used to get it wrong by reaching for Kong. Assigning a sound to a channel is
  what a drum machine with ten channels **does**; the hardware this panel is
  drawn from has always allowed it, and a program that draws that panel and
  then refuses is the one behaving strangely. A kit stops being a fixed map and
  becomes "a starting point you edit". Each of the TR-1000's ten strips carries
  a tape strip naming the sound in it and a list of every sound the program has —
  **derived**, the union of every voice named by any drum machine or any of its
  kits, so a kit added tomorrow brings its sounds to every strip with nothing
  edited. The hand's choice rides in `picks.lane`, validated at one gate in
  `resolvePicks` and frozen into the chart beside `mute`, and it is answered by
  the single line in `voiceFor` that owns which voice plays a lane — so it
  inherits determinism, blending, the snapshot and the `.mid` export for free.
  **What it deliberately does NOT do is move the channel:** `DCHAIN_OF` still
  decides which strip a lane runs through, so a war drum dropped on the hat
  channel is tuned, decayed and sent by the HAT's knobs. That is stated on the
  control rather than left to be discovered.
- **THE BASS UNIT IS ONE BOX WITH FIVE ENGINES**, and it is *the same
  mechanism as the drum machine*, not a second one. The user, after I started
  building a second: *"We are doing the SAME thing we did with the TR1000!"* and
  then *"A bass unit that loads different bass engines just like how the tr1000
  loads different drum kits."* Both were right. `drone`, `subbass`, `reese` and
  `chipbass` were separate INSTRUMENTS — three of them with **no panel at all**,
  rendering as grey HTML sliders — and are entries in `tb303.engines` now,
  exactly as `procession` and `erangDrums` became kits of the TR-1000. One
  collection, one `pick: true` control whose travel, options and English names
  all derive from it, one per-entry override of what gets DRAWN (never of what
  is DECLARED — `controls` stays the union or three seam checks break), and
  `voiceFor` as the one place `voice` is written.

  **What made it one mechanism rather than two** was generalising the single
  `picks.drumKit` — a literal written when the drums were the only box with a
  load switch — into `picks.kit[slot]`, one answer per rack. That literal is
  precisely why the bass unit *looked* like it needed a mechanism of its own.
  Nothing in `voiceFor`, `resolvePicks`, `loadSelectEl` or `machineIn` now names
  a machine, a collection or a slot: they ask `pickCollOf(M)`, so a third box
  with a load switch is a declaration and no code at all.

  **The keys are prefixed** (`sCut`, `dRes`, `rDetune`, `cBright`) because three
  engines declare `cut` and two declare `detune` with different ranges — the
  collision the Erang fold already names in its own comment.

  **Not one note moved**, and that was the constraint: it is a rename plus a
  repoint, so the snapshot must say IDENTICAL, and it does.
- **The KIT selector names the kit that is in the machine.** It said "(genre
  draws)" — true about who chose, silent about what is loaded — while the
  machine's own screen said `TR1000 · dungeon` and the strips said WAR DRUM.
- **AND EVERYTHING ON THE GLASS IS IN ENGLISH.** Reported: *"You can not use
  the words erang in front of a drum name thats horrible practice."* It was not
  one name. Deriving the loadable list from the voice table put **thirty-four
  variable names on a front panel** — `erangDrum`, `psgOpenhat`, `dacGhost`,
  `smpKick`, `oh808`, `brk` — and the KIT selector listed `gretsch`, `sega`,
  `brk`. **This is the cost of deriving a DISPLAY from an internal table**, and
  it is worth writing down because "derive, never list" is otherwise this
  project's most reliable rule: **derive the SET, always; never derive the
  WORDS.** The words are now two tables (`DRUM_SOUND_NAME`, and
  `<control>Names` beside any `pick` collection) and two seam checks walk the
  DERIVED sets and fail on anything unnamed or still reading as code — so a
  sound added tomorrow cannot reach a panel without a name.

**NOT BUILT, and named rather than implied**

- **The duplicate button.** Reason's Ctrl+D duplicates a device, and the user
  asked for one on the lead rack. **This is not a UI job here and pretending
  otherwise would be the expensive kind of mistake.** This program has ONE SLOT
  PER ROLE by construction — the handoff has said since `7c7644b` that "the
  user asked for '3 arps and two dueling basses' and the architecture has one
  slot per role. This needs a register allocator, not a table entry." A second
  lead needs its own register band, its own reservation against the existing
  parts, its own bus and its own strip on the desk. A button that clones a panel
  without any of that would draw a second machine that plays the same notes into
  the same bus — a control that does nothing, which is the defect this file has
  chased hardest. **What would close it:** the register allocator, then role
  instances, then the button. That is a session's work on stage 3 and 4, not a
  panel change.
- **Folding.** Reason folds devices to keep a long rack manageable and this rack
  is long. Cheap and obviously right; simply not done in this pass.
- **The Combinator.** A sub-rack of devices saved as one patch. Interesting here
  because a "genre" is arguably already that, and worth thinking about before
  building anything.

## 5. WHAT WE HAVE THAT REASON DOES NOT, AND SHOULD KEEP

- **The automation dot** — every knob shows where the hand has it and where the
  song has it right now. Reason shows automation in the sequencer, not on the
  knob.
- **The panel is DATA.** `INSTRUMENTS[m].panel` is a declaration and there is no
  per-machine UI code, so a new machine gets a face for free. Reason's devices
  are hand-built graphics.
- **A rack that composes.** These devices are not just played, they are chosen
  and ridden by the conductor.
