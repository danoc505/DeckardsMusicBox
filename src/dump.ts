/**
 * A record as text — the `deckard-events` format in tools/FORMAT.md.
 *
 * This is a first-class output, not a debug print. A record is judged by ear
 * and everything else about it is arithmetic on this file: leaps against
 * steps, distinct bars against total bars, parts that never sound. Anything
 * that cannot be read off a .wav can be read off this.
 *
 * Deterministic and sorted: the same seed dumped twice is byte-identical, so
 * a diff shows music rather than ordering.
 */

import { clockFace } from "./core/clock.ts";
import { NOTE_NAMES, noteName, pc } from "./core/theory.ts";
import { ROLES, type Role } from "./genre/spec.ts";
import type { Song } from "./song.ts";
import type { Event } from "./stage/perform.ts";

export const PROGRAM = "Deckard's Orchestrator MKIII";

const r2 = (n: number): string => n.toFixed(2);
const r3 = (n: number): string => n.toFixed(3);
const r4 = (n: number): string => n.toFixed(4);

export interface Motion {
  readonly n: number;
  readonly leap: number;
  readonly step: number;
  readonly same: number;
}

/**
 * How a part moves from one onset to the next: leap (> 2), step (1–2), same
 * (0). A part that strikes several pitches at once is read by its top voice,
 * which is the one an ear follows — the distances inside one chord are not
 * motion.
 */
export function motionOf(events: readonly Event[], role: Role): Motion {
  const top = new Map<string, Event>();
  for (const e of events) {
    if (e.role !== role || e.pitch === null) continue;
    const key = `${e.bar}:${e.step}`;
    const held = top.get(key);
    if (held === undefined || e.pitch > held.pitch!) top.set(key, e);
  }
  const ns = [...top.values()].sort((a, b) => a.bar - b.bar || a.step - b.step);
  let leap = 0;
  let step = 0;
  let same = 0;
  for (let i = 1; i < ns.length; i++) {
    const d = Math.abs(ns[i]!.pitch! - ns[i - 1]!.pitch!);
    if (d === 0) same++;
    else if (d <= 2) step++;
    else leap++;
  }
  return { n: ns.length, leap, step, same };
}

/**
 * Distinct bars against bars played, per role — on the WRITTEN step, so two
 * bars that play the same notes with different micro-timing are the same bar.
 */
export function distinctBars(events: readonly Event[], role: Role): { distinct: number; bars: number } {
  const byBar = new Map<number, string[]>();
  for (const e of events) {
    if (e.role !== role) continue;
    const list = byBar.get(e.bar) ?? [];
    list.push(`${e.step}:${e.pitch ?? e.lane}`);
    byBar.set(e.bar, list);
  }
  const seen = new Set<string>();
  for (const list of byBar.values()) seen.add(list.sort().join("|"));
  return { distinct: seen.size, bars: byBar.size };
}

export function dump(song: Song): string {
  const { chart, form, performance } = song;
  const ev = performance.events;
  const L: string[] = [];

  L.push("#format\tdeckard-events\t1");
  L.push(`#program\t${PROGRAM}`);
  L.push(`#genre\t${chart.genre.name}`);
  L.push(`#label\t${chart.genre.label}`);
  L.push(`#seed\t${chart.seed}`);
  L.push(`#key\t${NOTE_NAMES[pc(chart.tonicPc)]}`);
  L.push(`#mode\t${chart.scaleName}`);
  L.push(`#tempo\t${r2(chart.tempo)}`);
  L.push(`#bars\t${form.bars}`);
  L.push(`#steps_per_bar\t${form.clock.steps}`);
  L.push(`#seconds\t${r2(performance.seconds)}`);
  L.push(`#tempo_varies\t${form.clock.varies ? "yes" : "no"}`);
  L.push(`#events\t${ev.length}`);
  if (chart.askedSec !== null) L.push(`#asked_seconds\t${chart.askedSec}`);

  for (const [key, m] of song.materials.all) {
    L.push(`#chords_${key}\t${m.chords.map((c) => c.name).join(" ")}`);
  }

  L.push("#section_cols\ti\tfn\tstartBar\tendBar\tmaterial\tenergy\tocc\tflags");
  song.arrangement.placed.forEach((p, i) => {
    const s = p.section;
    const flags: string[] = [];
    if (s.peak) flags.push("peak");
    if (s.vary) flags.push("vary");
    if (p.thin) flags.push("thin");
    const missing = ROLES.filter((r) => !p.heard.has(r));
    if (missing.length > 0) flags.push("without:" + missing.join("+"));
    L.push(`#section\t${[i, s.fn, s.startBar, s.endBar, p.material, r2(s.energy), s.statement, flags.join(",") || "."].join("\t")}`);
  });

  const byRole = new Map<string, number>();
  for (const e of ev) byRole.set(e.role, (byRole.get(e.role) ?? 0) + 1);
  for (const r of ROLES) L.push(`#role\t${r}\t${byRole.get(r) ?? 0}`);
  for (const r of ROLES) {
    const d = distinctBars(ev, r);
    L.push(`#bars_distinct\t${r}\t${d.distinct}\t${d.bars}`);
  }
  for (const r of ROLES) {
    if (r === "drums") continue;
    const m = motionOf(ev, r);
    const tot = m.leap + m.step + m.same;
    if (tot === 0) continue;
    L.push(`#motion\t${r}\t${m.n}\t${r3(m.leap / tot)}\t${r3(m.step / tot)}\t${r3(m.same / tot)}`);
  }

  L.push("tSec\tbar\tstep\trole\tlane\tvoice\tpitch\tnote\tdurSec\tgain\tflags");
  for (const e of ev) {
    L.push(
      [
        r4(e.tSec),
        e.bar,
        r2(e.playedStep),
        e.role,
        e.lane,
        e.lane,
        e.pitch ?? ".",
        e.pitch === null ? "." : noteName(e.pitch),
        r4(e.durSec),
        r3(e.gain),
        ".",
      ].join("\t"),
    );
  }
  return L.join("\n") + "\n";
}

/** One line: what the record is. */
export function summary(song: Song): string {
  const { chart, form, performance } = song;
  return (
    `${chart.genre.label} · seed ${chart.seed} · ${NOTE_NAMES[pc(chart.tonicPc)]} ${chart.scaleName} · ` +
    `${chart.tempo} bpm · ${form.bars} bars · ${clockFace(performance.seconds)} · ` +
    `${form.sections.length} sections · ${performance.events.length} events`
  );
}
