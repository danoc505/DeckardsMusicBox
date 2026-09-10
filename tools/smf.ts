/**
 * READING A STANDARD MIDI FILE — ours or anybody's.
 *
 * Lifted out of `tools/measure.ts` so that `tools/corpus.ts` can read a
 * folder of somebody else's records with the same parser that reads this
 * program's own output. Nothing here can see a variable inside the builders:
 * it is bytes in, notes out, which is the point of measuring off the file.
 *
 * What is kept beyond the notes: every tempo change, every time signature,
 * every marker, and each track's program and channel — because a record that
 * is not ours says what it is in exactly those, and a study of a genre needs
 * them. `measure.ts` reads only the first tempo and metre, as it always did.
 */

export interface MidiNote {
  readonly track: string;
  readonly tick: number;
  readonly ticks: number;
  readonly key: number;
  readonly vel: number;
  /** The channel the note was on: 9 is General MIDI percussion. */
  readonly ch: number;
}

export interface MidiTrackInfo {
  readonly name: string;
  /** The first program change on the track, or -1 for none. */
  readonly program: number;
  /** The channel most of its notes are on, or -1 for a track with none. */
  readonly ch: number;
  readonly notes: number;
}

export interface MidiFile {
  readonly ppq: number;
  /** The first tempo, as `measure.ts` has always read it. */
  readonly bpm: number;
  /** The first metre's numerator. */
  readonly beats: number;
  readonly title: string;
  readonly notes: readonly MidiNote[];
  readonly tracks: readonly string[];
  readonly tempos: readonly { tick: number; bpm: number }[];
  readonly sigs: readonly { tick: number; num: number; den: number }[];
  readonly markers: readonly { tick: number; text: string }[];
  readonly trackInfo: readonly MidiTrackInfo[];
}

export function readMidi(data: Uint8Array): MidiFile {
  let p = 0;
  const str = (n: number): string => {
    let s = "";
    for (let i = 0; i < n; i++) s += String.fromCharCode(data[p + i]!);
    p += n;
    return s;
  };
  const u32 = (): number => {
    const v = (data[p]! << 24) | (data[p + 1]! << 16) | (data[p + 2]! << 8) | data[p + 3]!;
    p += 4;
    return v >>> 0;
  };
  const u16 = (): number => {
    const v = (data[p]! << 8) | data[p + 1]!;
    p += 2;
    return v;
  };
  if (str(4) !== "MThd") throw new Error("not a MIDI file");
  u32();
  u16(); // format
  const ntracks = u16();
  const ppq = u16();

  let bpm = 0;
  let beats = 0;
  let title = "";
  const notes: MidiNote[] = [];
  const tracks: string[] = [];
  const tempos: { tick: number; bpm: number }[] = [];
  const sigs: { tick: number; num: number; den: number }[] = [];
  const markers: { tick: number; text: string }[] = [];
  const trackInfo: MidiTrackInfo[] = [];

  for (let t = 0; t < ntracks; t++) {
    if (str(4) !== "MTrk") throw new Error("track expected");
    const len = u32();
    const end = p + len;
    let tick = 0;
    let name = `track ${t}`;
    let status = 0;
    let program = -1;
    const chCount = new Map<number, number>();
    let count = 0;
    // keyed by channel and key, because a type 0 file puts every channel on one track
    const open = new Map<number, { tick: number; vel: number }>();
    while (p < end) {
      let delta = 0;
      for (;;) {
        const b = data[p++]!;
        delta = (delta << 7) | (b & 0x7f);
        if ((b & 0x80) === 0) break;
      }
      tick += delta;
      let b = data[p]!;
      if (b >= 0x80) { status = b; p++; } else b = status; // running status
      const kind = status & 0xf0;
      const ch = status & 0x0f;
      if (status === 0xff) {
        const type = data[p++]!;
        let n = 0;
        for (;;) {
          const c = data[p++]!;
          n = (n << 7) | (c & 0x7f);
          if ((c & 0x80) === 0) break;
        }
        const body = data.subarray(p, p + n);
        p += n;
        if (type === 0x03) { const s = String.fromCharCode(...body); if (t === 0) title = s; else name = s; }
        if (type === 0x06) markers.push({ tick, text: String.fromCharCode(...body) });
        if (type === 0x51) {
          const us = (body[0]! << 16) | (body[1]! << 8) | body[2]!;
          // a zero here is a broken file, not an infinite tempo: one Burzum
          // transcription carries one, and it is skipped rather than believed
          if (us > 0) {
            const v = 60000000 / us;
            if (bpm === 0) bpm = v;
            tempos.push({ tick, bpm: v });
          }
        }
        if (type === 0x58) {
          if (beats === 0) beats = body[0]!;
          sigs.push({ tick, num: body[0]!, den: 2 ** body[1]! });
        }
      } else if (status === 0xf0 || status === 0xf7) {
        let n = 0;
        for (;;) {
          const c = data[p++]!;
          n = (n << 7) | (c & 0x7f);
          if ((c & 0x80) === 0) break;
        }
        p += n;
      } else if (kind === 0x90 || kind === 0x80) {
        const key = data[p++]!;
        const vel = data[p++]!;
        const id = ch * 128 + key;
        if (kind === 0x90 && vel > 0) open.set(id, { tick, vel });
        else {
          const on = open.get(id);
          if (on !== undefined) {
            open.delete(id);
            notes.push({ track: name, tick: on.tick, ticks: Math.max(1, tick - on.tick), key, vel: on.vel, ch });
            chCount.set(ch, (chCount.get(ch) ?? 0) + 1);
            count++;
          }
        }
      } else if (kind === 0xc0) { if (program < 0) program = data[p]!; p += 1; }
      else if (kind === 0xd0) p += 1;
      else p += 2;
    }
    p = end;
    if (t > 0) tracks.push(name);
    let best = -1;
    let bestN = 0;
    for (const [c, n] of chCount) if (n > bestN) { best = c; bestN = n; }
    trackInfo.push({ name, program, ch: best, notes: count });
  }
  notes.sort((a, b) => a.tick - b.tick || a.key - b.key);
  tempos.sort((a, b) => a.tick - b.tick);
  sigs.sort((a, b) => a.tick - b.tick);
  markers.sort((a, b) => a.tick - b.tick);
  return { ppq, bpm: bpm || 120, beats: beats || 4, title, notes, tracks, tempos, sigs, markers, trackInfo };
}
