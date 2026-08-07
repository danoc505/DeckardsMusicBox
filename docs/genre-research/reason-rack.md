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
