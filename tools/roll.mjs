/**
 * See the record. Renders a song's notes as a piano roll PNG you can look at,
 * and prints the structure beside it.
 *
 *   node tools/roll.mjs <genre> <seed> [out.png] [--bars 0-32]
 *
 * Repetition is the thing this is for: a two-bar cell that comes back should
 * be an obvious visual rhyme, and a section that restates another should look
 * like it. If the picture is confetti, the music is confetti.
 */
import { writeFileSync } from "node:fs";
import zlib from "node:zlib";
import { compose } from "../src/song.ts";

// ── a PNG, by hand ────────────────────────────────────────────────────────
const CRC = (() => { const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; }
  return t; })();
function crc32(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(W, H, rgb) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) { raw[y * (1 + W * 3)] = 0; rgb.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

// ── a canvas ──────────────────────────────────────────────────────────────
function canvas(W, H, bg) {
  const b = Buffer.alloc(W * H * 3);
  for (let i = 0; i < W * H; i++) { b[i*3] = bg[0]; b[i*3+1] = bg[1]; b[i*3+2] = bg[2]; }
  const px = (x, y, c, a = 1) => {
    x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    b[i] = b[i]*(1-a) + c[0]*a; b[i+1] = b[i+1]*(1-a) + c[1]*a; b[i+2] = b[i+2]*(1-a) + c[2]*a;
  };
  return { buf: b, px,
    rect: (x, y, w, h, c, a = 1) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x+i, y+j, c, a); },
    vline: (x, y0, y1, c, a = 1) => { for (let y = y0; y < y1; y++) px(x, y, c, a); },
    hline: (y, x0, x1, c, a = 1) => { for (let x = x0; x < x1; x++) px(x, y, c, a); } };
}
// 3x5 digits, enough to number the bars
const DIG = ["111101101101111","010010010010010","111001111100111","111001111001111","101101111001001",
             "111100111001111","111100111101111","111001001001001","111101111101111","111101111001111"];
function digit(cv, d, x, y, c) { const g = DIG[d]; for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (g[r*3+k] === "1") cv.px(x+k, y+r, c); }
function num(cv, n, x, y, c) { const s = String(n); for (let i = 0; i < s.length; i++) digit(cv, +s[i], x + i*4, y, c); }

// ── draw ──────────────────────────────────────────────────────────────────
const [genre, seedArg, outArg] = process.argv.slice(2).filter(a => !a.startsWith("--"));
const barsAt = process.argv.indexOf("--bars");
const song = compose({ genre, seed: Number(seedArg) });
const out = outArg || `roll-${genre}-${seedArg}.png`;

let bar0 = 0, bar1 = song.form.bars;
if (barsAt >= 0) { const [a, b] = process.argv[barsAt+1].split("-").map(Number); bar0 = a; bar1 = b; }
const nBars = bar1 - bar0;

const COL = { drums: [255,138,92], bass: [255,209,102], keys: [100,220,255], lead: [255,107,214], drone: [163,255,107] };
const LANE = { kick: 0, snare: 1, hat: 2, openhat: 3 };
const PXB = Math.max(10, Math.min(46, Math.round(1700 / nBars)));   // bar width
const SH = 7, GUT = 34, HEAD = 16, DRUM = 4*9 + 6, SPAN = 13;
let lo = Infinity, hi = -Infinity;
for (const e of song.performance.events) if (e.pitch !== null) { if (e.pitch < lo) lo = e.pitch; if (e.pitch > hi) hi = e.pitch; }
lo = 12*Math.floor(lo/12) ; hi = 12*Math.ceil(hi/12);
const PITCH = (hi - lo) * SH;
const W = GUT + nBars*PXB + 8, H = HEAD + SPAN + PITCH + DRUM + 12;
const cv = canvas(W, H, [8, 12, 16]);

const spb = song.chart.metre.beats;                 // beats in a bar
const stepsPerBar = song.form.clock.stepsPerBar ?? 16;
const X = (bar, step) => GUT + (bar - bar0 + (step||0)/stepsPerBar) * PXB;
const TOP = HEAD + SPAN;
const Y = (p) => TOP + PITCH - (p - lo) * SH;

// octave rules
for (let p = lo; p <= hi; p += 12) { cv.hline(Y(p), GUT, W-8, [40, 70, 58], 0.9); num(cv, (p/12-1), 2, Y(p)-2, [60,110,90]); }
// THE ARRANGEMENT'S OWN CLOCK, along the top: a tick at every two-loop
// boundary and a block per part that is IN across that span. A change in who
// is playing then shows as a change in the picture, not only in the notes —
// which is the whole point of reading a record this way.
const ROLE_I = { drums: 0, bass: 1, keys: 2, lead: 3, drone: 4 };
for (const pl of song.arrangement.placed) {
  const mm = song.materials.all.get(pl.material);
  const turn = 2 * Math.max(1, mm ? mm.period : 1);
  for (let k = 0; k * turn < pl.section.bars; k++) {
    const b0 = pl.section.startBar + k * turn;
    if (b0 >= bar1 || b0 + turn <= bar0) continue;
    const sp = pl.spans ? pl.spans[Math.min(pl.spans.length - 1, k)] : null;
    const x0 = X(Math.max(bar0, b0)), x1 = X(Math.min(bar1, b0 + turn));
    cv.vline(x0, HEAD, TOP + PITCH + DRUM, [90, 105, 120], 0.45);
    if (!sp) continue;
    for (const r of ["drums", "bass", "keys", "lead", "drone"]) {
      if (!sp.heard.has(r)) continue;
      cv.rect(x0 + 2 + ROLE_I[r] * 5, HEAD + 1, 4, 7, COL[r], 0.95);
    }
    if (sp.thin) cv.rect(x0 + 2, HEAD + 9, Math.max(4, x1 - x0 - 4), 2, [255, 179, 71], 0.85);
  }
}
// bar rules + numbers
for (let b = bar0; b <= bar1; b++) {
  const x = X(b), strong = (b % 4 === 0);
  cv.vline(x, TOP, TOP+PITCH+DRUM, strong ? [60,80,96] : [30,42,52], strong ? 0.95 : 0.7);
  if (b % 4 === 0 && b < bar1) num(cv, b, x+2, 4, [120,150,170]);
}
// sections
for (const pl of song.arrangement.placed) {
  const s = pl.section; if (s.endBar <= bar0 || s.startBar >= bar1) continue;
  const x = X(Math.max(bar0, s.startBar));
  cv.vline(x, 0, H, [255,179,71], 0.9); cv.vline(x+1, 0, H, [255,179,71], 0.35);
  cv.rect(x, 0, Math.min(X(Math.min(bar1,s.endBar))-x, W), 2, [255,179,71], s.peak ? 1 : 0.45);
}
// notes
for (const e of song.performance.events) {
  if (e.bar < bar0 || e.bar >= bar1) continue;
  const c = COL[e.role], a = 0.35 + 0.65*Math.min(1, e.gain);
  if (e.role === "drums") {
    const y = TOP + PITCH + 4 + (LANE[e.lane] ?? 0)*9;
    cv.rect(X(e.bar, e.step), y, Math.max(2, PXB/16), 7, c, a);
  } else {
    const w = Math.max(2, (e.durSec / (60/song.chart.tempo)) * (PXB/spb));
    cv.rect(X(e.bar, e.step), Y(e.pitch)-3, w, 5, c, a);
  }
}
writeFileSync(out, png(W, H, cv.buf));

// ── and the structure in words ────────────────────────────────────────────
console.log(`${out}  ${W}x${H}  bars ${bar0}-${bar1}`);
console.log(`${song.chart.genre.label} · seed ${seedArg} · ${song.chart.tempo} bpm · ${song.form.bars} bars`);
console.log("colours: drums=orange bass=yellow keys=cyan lead=pink drone=green · amber verticals are section starts");
for (const pl of song.arrangement.placed) {
  const s = pl.section;
  console.log(`  bar ${String(s.startBar).padStart(3)}-${String(s.endBar).padEnd(3)} ${s.fn.padEnd(13)} material ${String(pl.material).padEnd(4)} energy ${s.energy.toFixed(2)}${s.peak?" PEAK":""}${s.vary?" VARY":""}${pl.thin?" THIN":""}`);
}
