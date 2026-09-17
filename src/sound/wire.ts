/**
 * THE RECORD ON A WIRE — for the synths it is actually going to.
 *
 * The owner's rig is a SONICWARE LIVEN Lofi-12 (a four-track sampler), a
 * LIVEN Mega Synthesis (three FM tracks, two PSG, one PCM) and an Arturia
 * BeatStep Pro (a sequencer that slaves to MIDI clock and fires its drum
 * gates from notes). None of them is a General MIDI module: each LIVEN track
 * listens on its own channel, a sample track plays one sample chromatically,
 * and the knobs a treatment would move — a track's level, its pan, its send
 * to the reverb, a filter's cutoff — are control changes with numbers each
 * device chose for itself. So this file is two things:
 *
 *   DEVICES  what each box understands, from its own MIDI implementation
 *            chart. The Lofi-12's chart lists forty-three control numbers,
 *            the Mega Synthesis's twenty-six; only the ones a desk move can
 *            mean are here. A device with no filter on the wire (the Mega
 *            Synthesis) simply never receives one.
 *   a RIG    where each part and each drum lane goes: a device and a channel,
 *            and for a lane on a sample track the key that plays the sample.
 *            The channels are whatever the owner set on the boxes (T1.ch
 *            through T6.ch on a LIVEN), so a rig is words in the recipe and
 *            not a constant.
 *
 * WHAT GOES OUT: every note, on its channel and key; the desk as control
 * changes — the record's own mix at the top, every treatment as it lands
 * (walked where the record walks it), every cycle of motion — so a synth on
 * the other end hears the record's moves and not a copy of its notes; and
 * MIDI clock at 24 pulses a quarter with start and stop, so the BeatStep Pro
 * and both LIVENs run on this record's tempo (a LIVEN takes clock only with
 * its clock source set to MIDI, and commands only with M.CMD at RX or RX.TX;
 * the BeatStep Pro with its SYNC on MIDI). What stays in the box is
 * everything that is not a knob a device has: the rack, the world, the
 * pedals, the tape. The dump says which knobs went out.
 *
 * Nothing here runs a clock. Each message carries the millisecond it is due,
 * and the page hands them to `MIDIOutput.send(msg, when)` one timestamp
 * each: the wire keeps time.
 *
 * Sources: LIVEN Lofi-12 MIDI implementation chart (sonicware.co.jp,
 * Lofi-12_manual_MIDI_en.pdf); LIVEN MEGA SYNTHESIS MIDI implementation chart
 * (MEGA-SYNTHESIS_manual_MIDI_en.pdf) and user's manual §"Track selection";
 * Arturia BeatStep Pro user's manual §8 "Synchronization" and §9.2.3 (drum
 * gates from MIDI note numbers).
 */

import type { Song } from "../song.ts";
import { DRUM_LANES, PITCHED_ROLES, type DrumLane, type PitchedRole, type Role, type SoundRules } from "../genre/spec.ts";
import { settle } from "./render.ts";
import { deskOf } from "../stage/treat.ts";
import { motionAt, type Move } from "./motion.ts";

/** The knobs a desk move can mean on a wire. */
export type Knob = "level" | "pan" | "send" | "cutoff" | "resonance";

export interface Device {
  readonly label: string;
  /** Which control number each knob is, where the device has it. */
  readonly cc: Readonly<Partial<Record<Knob, number>>>;
  /** Whether a lane on this device is a sample played at a key (a LIVEN track) rather than a drum map (GM channel 10). */
  readonly sampler: boolean;
}

export const DEVICES = Object.freeze({
  /** A General MIDI module or a DAW: the file's own channels and keys. */
  gm: { label: "General MIDI", cc: { level: 7, pan: 10, send: 91, cutoff: 74, resonance: 71 }, sampler: false },
  /** One track per channel; a sample plays chromatically from its key. Chart: 60 TRACK LEVEL, 61 TRACK PAN, 33 →REVERB, 38 FILTER CUTOFF, 39 FILTER RESO. */
  lofi12: { label: "LIVEN Lofi-12", cc: { level: 60, pan: 61, send: 33, cutoff: 38, resonance: 39 }, sampler: true },
  /** One track per channel; FM on 1–3, PSG on 4–5, PCM on 6. Chart: 36 TRACK LEVEL, 35 TRACK PAN, 37 →FX. No filter on the wire. */
  mega: { label: "LIVEN Mega Synthesis", cc: { level: 36, pan: 35, send: 37 }, sampler: true },
  /** Slaves to clock; its drum gates fire from notes on its drum channel. Nothing else to move. */
  bsp: { label: "BeatStep Pro", cc: {}, sampler: false },
} as const satisfies Readonly<Record<string, Device>>);
export type DeviceName = keyof typeof DEVICES;
export const DEVICE_NAMES = Object.keys(DEVICES) as readonly DeviceName[];

/** Where a part goes: a device and a channel, 0-based (channel 1 is 0). */
export interface Dest { readonly device: DeviceName; readonly ch: number }
/** Where a drum lane goes, and the key that plays it there. */
export interface LaneDest extends Dest { readonly note: number }

export interface Rig {
  readonly parts: Readonly<Record<PitchedRole, Dest>>;
  readonly lanes: Readonly<Record<DrumLane, LaneDest>>;
  /** Send clock, start and stop. */
  readonly clock: boolean;
}

/** General MIDI's percussion keys, which the file also uses and the BeatStep Pro's pads default to. */
const GM_KEY: Readonly<Record<DrumLane, number>> = Object.freeze({ kick: 36, snare: 38, hat: 42, openhat: 46 });

const gmParts = (ch: Record<PitchedRole, number>, device: DeviceName = "gm"): Record<PitchedRole, Dest> =>
  Object.fromEntries(PITCHED_ROLES.map((r) => [r, { device, ch: ch[r] }])) as Record<PitchedRole, Dest>;

/**
 * THE PRESETS. `gm` is the file's own layout. `sonicware` is the owner's rig
 * as a starting point — the four lanes on the Lofi-12's four tracks (one
 * sample each, played at C4, which is a sample at its own pitch), the keys,
 * tune and counter on the Mega Synthesis's three FM tracks, the bass and
 * drone on its two PSG tracks — with the LIVENs' track channels numbered in
 * order, which is a guess the owner corrects in the recipe. `bsp` fires the
 * BeatStep Pro's drum gates on its drum channel and keeps the parts on GM.
 */
export const RIGS: Readonly<Record<string, Rig>> = Object.freeze({
  gm: Object.freeze({
    parts: gmParts({ bass: 0, keys: 1, lead: 2, drone: 3, counter: 4 }),
    lanes: Object.freeze(Object.fromEntries(DRUM_LANES.map((l) => [l, { device: "gm", ch: 9, note: GM_KEY[l] }])) as Record<DrumLane, LaneDest>),
    clock: true,
  }),
  sonicware: Object.freeze({
    parts: gmParts({ keys: 4, lead: 5, counter: 6, bass: 7, drone: 8 }, "mega"),
    lanes: Object.freeze(Object.fromEntries(DRUM_LANES.map((l, i) => [l, { device: "lofi12", ch: i, note: 60 }])) as Record<DrumLane, LaneDest>),
    clock: true,
  }),
  bsp: Object.freeze({
    parts: gmParts({ bass: 0, keys: 1, lead: 2, drone: 3, counter: 4 }),
    lanes: Object.freeze(Object.fromEntries(DRUM_LANES.map((l) => [l, { device: "bsp", ch: 9, note: GM_KEY[l] }])) as Record<DrumLane, LaneDest>),
    clock: true,
  }),
});

/** One message for a wire, with the millisecond it is due from the top of what is sent. */
export interface LiveEvent {
  readonly atMs: number;
  /** The bytes as `MIDIOutput.send` takes them: a status byte and its data, or one real-time byte. */
  readonly msg: readonly number[];
}

/** 0..1.25 becomes 1..127, on the scale the renderer uses, so a ghost note reads as a ghost note. */
export const velOf = (gain: number): number => Math.max(1, Math.min(127, Math.round(gain * 100)));

/** A rig's words for a recipe: `wire.rig=<preset>` when it is one, else every destination. */
export function rigWords(rig: Rig): string[] {
  for (const [name, r] of Object.entries(RIGS)) if (sameRig(r, rig)) return [`wire.rig=${name}`];
  const out: string[] = [];
  for (const r of PITCHED_ROLES) out.push(`wire.${r}=${rig.parts[r].device}:${rig.parts[r].ch + 1}`);
  for (const l of DRUM_LANES) out.push(`wire.${l}=${rig.lanes[l].device}:${rig.lanes[l].ch + 1}:${rig.lanes[l].note}`);
  if (!rig.clock) out.push("wire.clock=off");
  return out;
}

const sameRig = (a: Rig, b: Rig): boolean =>
  a.clock === b.clock
  && PITCHED_ROLES.every((r) => a.parts[r].device === b.parts[r].device && a.parts[r].ch === b.parts[r].ch)
  && DRUM_LANES.every((l) => a.lanes[l].device === b.lanes[l].device && a.lanes[l].ch === b.lanes[l].ch && a.lanes[l].note === b.lanes[l].note);

/**
 * A rig from words, over a base: `wire.rig=sonicware`, `wire.keys=mega:5`,
 * `wire.kick=lofi12:1:60`, `wire.clock=off`. Channels are written 1–16 as
 * the boxes show them. Nonsense throws, naming what it wanted.
 */
export function rigOf(words: readonly string[], base: Rig = RIGS["gm"]!): Rig {
  let parts = { ...base.parts };
  let lanes = { ...base.lanes };
  let clock = base.clock;
  const dev = (s: string, word: string): DeviceName => {
    if (!(DEVICE_NAMES as readonly string[]).includes(s)) throw new Error(`no device "${s}" in "${word}" (devices: ${DEVICE_NAMES.join(", ")})`);
    return s as DeviceName;
  };
  const chan = (s: string, word: string): number => {
    const n = Number(s);
    if (!Number.isInteger(n) || n < 1 || n > 16) throw new Error(`channel "${s}" in "${word}" is not 1–16`);
    return n - 1;
  };
  for (const word of words) {
    const m = /^wire\.([a-z]+)=(.+)$/.exec(word);
    if (m === null) throw new Error(`not a wire word: "${word}" (want wire.<part|lane>=<device>:<channel>[:<key>], wire.rig=<preset>, wire.clock=on|off)`);
    const [, what, value] = m as unknown as [string, string, string];
    if (what === "rig") {
      const r = RIGS[value];
      if (r === undefined) throw new Error(`no rig "${value}" (rigs: ${Object.keys(RIGS).join(", ")})`);
      parts = { ...r.parts }; lanes = { ...r.lanes }; clock = r.clock;
      continue;
    }
    if (what === "clock") {
      if (value !== "on" && value !== "off") throw new Error(`wire.clock wants on or off, not "${value}"`);
      clock = value === "on";
      continue;
    }
    const bits = value.split(":");
    if ((PITCHED_ROLES as readonly string[]).includes(what)) {
      if (bits.length !== 2) throw new Error(`wire.${what} wants <device>:<channel>, not "${value}"`);
      parts = { ...parts, [what]: { device: dev(bits[0]!, word), ch: chan(bits[1]!, word) } };
    } else if ((DRUM_LANES as readonly string[]).includes(what)) {
      if (bits.length !== 3) throw new Error(`wire.${what} wants <device>:<channel>:<key>, not "${value}"`);
      const note = Number(bits[2]);
      if (!Number.isInteger(note) || note < 0 || note > 127) throw new Error(`key "${bits[2]}" in "${word}" is not 0–127`);
      lanes = { ...lanes, [what]: { device: dev(bits[0]!, word), ch: chan(bits[1]!, word), note } };
    } else {
      throw new Error(`nothing on the wire called "${what}" (parts: ${PITCHED_ROLES.join(", ")}; lanes: ${DRUM_LANES.join(", ")}; rig, clock)`);
    }
  }
  return Object.freeze({ parts: Object.freeze(parts), lanes: Object.freeze(lanes), clock });
}

/** The knobs a desk holds for one part, read as the numbers a wire can carry. */
function knobsOf(S: SoundRules, rest: SoundRules, role: Role): Partial<Record<Knob, number>> {
  const ch = S.mix[role];
  const out: Partial<Record<Knob, number>> = {
    // AGAINST THE RECORD'S OWN RESTING LEVEL, not as a fader position: the
    // box's track level is the owner's to set, and what the wire carries is
    // how far a treatment or a cycle moves a part from where the record has
    // it — 100 at rest, 127 at the most a move can lift it
    level: Math.max(0, Math.min(127, Math.round((100 * ch.level) / Math.max(1e-6, rest.mix[role].level)))),
    pan: Math.max(0, Math.min(127, Math.round((ch.pan + 1) * 63.5))),
    send: Math.max(0, Math.min(127, Math.round(ch.sends.room * 127))),
  };
  // a part's own pole is a knob only while it is in the line; 20 Hz to 20
  // kHz on a log scale, which is how every synth lays its cutoff out
  const pole = S.fx[role]?.pole;
  if (pole !== undefined && pole.mix > 0) {
    out.cutoff = Math.max(0, Math.min(127, Math.round((127 * Math.log(Math.max(20, pole.hz) / 20)) / Math.log(1000))));
    out.resonance = Math.max(0, Math.min(127, Math.round(pole.resonance * 127)));
  }
  return out;
}

export interface WireOptions {
  /** Send from this second of the record. A note that began before it is not sent: half a note is not a note. */
  readonly fromSec?: number;
  /** And up to this one. */
  readonly toSec?: number;
  /** One part alone. */
  readonly only?: Role;
  /** Leave the desk in the box: notes only. */
  readonly desk?: boolean;
}

/** How often the desk is read for the wire, in seconds: a knob step every twentieth of a second, which no ear resolves as steps. */
const TICK = 0.05;

/**
 * THE RECORD FOR THIS RIG. Every note on its channel and key; the desk as
 * control changes wherever the device has the knob; clock, start and stop.
 * Sorted by time, and at one instant offs first, then start, then the desk
 * and the clock, then ons, and stop last of all — so a repeated key
 * retriggers and a note lands on the desk it was meant for.
 */
export function wire(song: Song, rig: Rig, opts: WireOptions = {}): LiveEvent[] {
  const from = opts.fromSec ?? 0;
  const to = opts.toSec ?? Infinity;
  const out: { atMs: number; order: number; msg: number[] }[] = [];
  const at = (sec: number, order: number, msg: number[]): void => { out.push({ atMs: (sec - from) * 1000, order, msg }); };

  // ── the notes ──
  for (const e of song.performance.events) {
    // a downbeat pushed a few milliseconds before the top is the top's note:
    // sent on the first millisecond, as the renderer plays what fell before zero
    if (e.tSec < from - 0.06 || e.tSec >= to) continue;
    if (opts.only !== undefined && e.role !== opts.only) continue;
    let ch: number;
    let key: number;
    if (e.role === "drums") {
      const d = rig.lanes[e.lane as DrumLane];
      if (d === undefined) continue;
      ch = d.ch; key = d.note;
    } else {
      const d = rig.parts[e.role as PitchedRole];
      if (e.pitch === null || e.pitch < 0 || e.pitch > 127) continue;
      ch = d.ch; key = e.pitch;
    }
    at(Math.max(from, e.tSec), 3, [0x90 | ch, key, velOf(e.gain)]);
    // a drum's off is a formality, as in the file: a hit rings as long as the machine says
    at(Math.max(from, e.tSec) + Math.max(0.001, e.role === "drums" ? 0.05 : e.durSec), 0, [0x80 | ch, key, 0]);
  }

  // ── the desk, as the knobs each device has ──
  if (opts.desk !== false) {
    const base = song.chart.sound;
    const changes = song.performance.desk;
    const clock = song.form.clock;
    const sections = song.arrangement.placed.map((p) => p.section.startBar);
    const sectionStart = (bar: number): number => { let s = 0; for (const b of sections) { if (b <= bar) s = b; else break; } return s; };
    /** The desk a treatment leaves, at full arrival. */
    const settled = new Map<number, SoundRules>();
    const target = (i: number): SoundRules => {
      let S = settled.get(i);
      if (S === undefined) {
        const c = changes[i];
        S = c === undefined || c.treatment === null ? base : settle(base, deskOf(c.treatment, base, c.at ?? undefined, c.depth) ?? undefined);
        settled.set(i, S);
      }
      return S;
    };
    // where each knob of each destination stands on the wire, so a value is sent only when it moves
    const sent = new Map<string, number>();
    const dests: { role: Role; ch: number; device: DeviceName }[] = [];
    for (const r of PITCHED_ROLES) if (opts.only === undefined || opts.only === r) dests.push({ role: r, ch: rig.parts[r].ch, device: rig.parts[r].device });
    if (opts.only === undefined || opts.only === "drums") {
      const seen = new Set<string>();
      for (const l of DRUM_LANES) {
        const d = rig.lanes[l];
        const k = `${d.device}/${d.ch}`;
        if (!seen.has(k)) { seen.add(k); dests.push({ role: "drums", ch: d.ch, device: d.device }); }
      }
    }
    const emit = (sec: number, S: SoundRules, first: boolean): void => {
      for (const d of dests) {
        const knobs = knobsOf(S, base, d.role);
        const cc = DEVICES[d.device].cc;
        for (const [knob, n] of Object.entries(cc) as [Knob, number][]) {
          const v = knobs[knob];
          if (v === undefined) continue;
          const k = `${d.device}/${d.ch}/${n}`;
          if (!first && sent.get(k) === v) continue;
          sent.set(k, v);
          at(sec, 2, [0xb0 | d.ch, n, v]);
        }
      }
    };
    /** The knobs at a moment: the change in force, walked where it is walking, and motion on top. */
    const deskAt = (sec: number): SoundRules => {
      let i = -1;
      for (let k = 0; k < changes.length; k++) { if (changes[k]!.tSec <= sec) i = k; else break; }
      let S = target(i);
      const c = changes[i];
      if (c !== undefined && c.overSec > 0 && sec < c.tSec + c.overSec) {
        // a walk: the wire's knobs part way from where they were to where they are going
        const u = (sec - c.tSec) / c.overSec;
        const before = target(i - 1);
        const mix = Object.fromEntries(Object.keys(S.mix).map((r) => {
          const a = before.mix[r as Role], b = S.mix[r as Role];
          return [r, { level: a.level + (b.level - a.level) * u, pan: a.pan + (b.pan - a.pan) * u, sends: { room: a.sends.room + (b.sends.room - a.sends.room) * u } }];
        }));
        const fx = Object.fromEntries(Object.keys(S.fx).map((r) => {
          const a = before.fx[r as Role].pole, b = S.fx[r as Role].pole;
          return [r, { pole: { hz: a.hz + (b.hz - a.hz) * u, resonance: a.resonance + (b.resonance - a.resonance) * u, mix: b.mix } }];
        }));
        S = settle(S, { mix, fx } as never);
      }
      if (S.motion.length > 0) {
        const bar = clock.barAt(sec);
        const m = motionAt(S.motion as Move[], S, bar, sectionStart(bar));
        if (m !== null) S = settle(S, m);
      }
      return S;
    };
    emit(from, deskAt(from), true);
    const until = Math.min(to, song.performance.seconds);
    for (let sec = from + TICK; sec < until; sec += TICK) emit(sec, deskAt(sec), false);
  }

  // ── the clock: 24 pulses a quarter, start at the top, stop after everything else ──
  const end = out.reduce((m, e) => Math.max(m, e.atMs), 0) / 1000 + from;
  if (rig.clock) {
    const clock = song.form.clock;
    const { beats, perBeat } = clock.metre;
    at(from, 1, [0xfa]);
    for (let bar = 0; bar < clock.bars; bar++) {
      for (let p = 0; p < beats * 24; p++) {
        const sec = clock.at(bar, (p / 24) * perBeat);
        if (sec < from) continue;
        if (sec >= end) break;
        at(sec, 2, [0xf8]);
      }
    }
    at(end, 4, [0xfc]);
  }

  out.sort((a, b) => a.atMs - b.atMs || a.order - b.order);
  return out.map((e) => ({ atMs: e.atMs, msg: e.msg }));
}
