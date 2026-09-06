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
// ── 3x5 glyphs ────────────────────────────────────────────────────────────
// Enough to NAME things, not only to count them. A roll that numbers its bars
// but cannot spell "CHORUS" makes the reader hold the section list in their
// head while they look at the picture, which is the one job the picture had.
const DIG = ["111101101101111","010010010010010","111001111100111","111001111001111","101101111001001",
             "111100111001111","111100111101111","111001001001001","111101111101111","111101111001111"];
const LET = {
  A:"010101111101101", B:"110101110101110", C:"011100100100011", D:"110101101101110",
  E:"111100110100111", F:"111100110100100", G:"011100101101011", H:"101101111101101",
  I:"111010010010111", J:"001001001101010", K:"101101110101101", L:"100100100100111",
  M:"101111111101101", N:"101111101101101", O:"010101101101010", P:"110101110100100",
  Q:"010101101111011", R:"110101110101101", S:"011100010001110", T:"111010010010010",
  U:"101101101101111", V:"101101101101010", W:"101101111111101", X:"101101010101101",
  Y:"101101010010010", Z:"111001010100111",
  "#":"101111101111101", "/":"001001010100100", "-":"000000111000000",
  ".":"000000000000010", ":":"000010000010000", " ":"000000000000000",
};
const glyphOf = (ch) => (ch >= "0" && ch <= "9" ? DIG[+ch] : LET[ch]) ?? null;
function glyph(cv, ch, x, y, c, a = 1) {
  const g = glyphOf(ch); if (!g) return;
  for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++) if (g[r*3+k] === "1") cv.px(x+k, y+r, c, a);
}
/** Draws left to right on a 4px pitch; returns the x it ended at. */
function text(cv, str, x, y, c, a = 1) {
  const t = String(str).toUpperCase();
  for (let i = 0; i < t.length; i++) glyph(cv, t[i], x + i*4, y, c, a);
  return x + t.length*4;
}
const num = (cv, n, x, y, c) => text(cv, n, x, y, c);
const NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const noteName = (p) => NOTE[((p % 12) + 12) % 12] + (Math.floor(p/12) - 1);

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
const SH = 7, GUT = 34, HEAD = 22, DRUM = 4*9 + 6, SPAN = 20;
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
for (let p = lo; p <= hi; p += 12) { cv.hline(Y(p), GUT, W-8, [40, 70, 58], 0.9); text(cv, noteName(p), 2, Y(p)-2, [60,110,90]); }
// THE ARRANGEMENT'S OWN CLOCK, along the top: a tick at every two-loop
// boundary and a block per part that is IN across that span. A change in who
// is playing then shows as a change in the picture, not only in the notes —
// which is the whole point of reading a record this way.
const ROLE_I = { drums: 0, bass: 1, keys: 2, lead: 3, drone: 4 };
// AND EVERYTHING ELSE A SPAN DECIDES, or the strip lies. The two-loop rule's
// four ways are who is in, who is out, and expression up or down — and the
// strip drew only the first two, so a part held back, the kit in half time,
// or the whole section moved to a different desk showed as nothing having
// changed at exactly the boundary the arrangement changed it. The roll cannot
// hear the desk, but it can say the desk moved and which way.
//   a block at half weight     that part is held back (hush)
//   an orange dash under it    the kit is in half time
//   a box round a block        a per-part treatment is aimed at that part
//   a name under the strip     the treatment the span's desk is on
// AND A SPAN IS DRAWN WHERE IT SAYS IT STARTS. The strip used to step by
// `turn` bars and index the spans by that step, because every span was two
// turns. The arrangement now also alters on a bar clock, so the spans are
// unevenly spaced and carry their own `startBar` — stepping would draw the
// wrong span over the wrong bars, which is a picture that lies.
// A two-turn boundary keeps the full tick; a bar point gets a fainter one, so
// the two clocks are told apart at a glance.
for (const pl of song.arrangement.placed) {
  const mm = song.materials.all.get(pl.material);
  const turn = 2 * Math.max(1, mm ? mm.period : 1);
  const list = pl.spans ?? [];
  for (let k = 0; k < list.length; k++) {
    const sp = list[k];
    const b0 = pl.section.startBar + sp.startBar;
    const bEnd = pl.section.startBar + (k + 1 < list.length ? list[k + 1].startBar : pl.section.bars);
    if (b0 >= bar1 || bEnd <= bar0) continue;
    const x0 = X(Math.max(bar0, b0)), x1 = X(Math.min(bar1, bEnd));
    const slow = sp.startBar % turn === 0;
    cv.vline(x0, HEAD, TOP + PITCH + DRUM, [90, 105, 120], slow ? 0.45 : 0.18);
    if (!sp) continue;
    for (const r of ["drums", "bass", "keys", "lead", "drone"]) {
      if (!sp.heard.has(r)) continue;
      const bx = x0 + 2 + ROLE_I[r] * 5;
      if (sp.at === r) cv.rect(bx - 1, HEAD, 6, 9, [235, 235, 235], 0.6);
      cv.rect(bx, HEAD + 1, 4, 7, COL[r], sp.hush === r ? 0.4 : 0.95);
    }
    if (sp.thin) cv.rect(x0 + 2, HEAD + 9, Math.max(4, x1 - x0 - 4), 2, [255, 179, 71], 0.85);
    if (sp.halved) cv.rect(x0 + 2, HEAD + 11, 4, 2, COL.drums, 0.95);
    // the treatment, named — only where it changes, so a desk held across
    // several spans is one word and not the same word four times
    const prev = k > 0 ? list[k - 1] : null;
    if (sp.treatment && (!prev || prev.treatment !== sp.treatment || prev.at !== sp.at)) {
      const room = Math.max(0, Math.floor((x1 - x0 - 2) / 4));
      text(cv, sp.treatment.slice(0, room), x0 + 2, HEAD + 14, [160, 175, 190], 0.9);
    }
  }
}
// bar rules + numbers
for (let b = bar0; b <= bar1; b++) {
  const x = X(b), strong = (b % 4 === 0);
  cv.vline(x, TOP, TOP+PITCH+DRUM, strong ? [60,80,96] : [30,42,52], strong ? 0.95 : 0.7);
  if (b % 4 === 0 && b < bar1) num(cv, b, x+2, 4, [120,150,170]);
}
// SECTIONS, NAMED. The boundary is a line, the span is a ribbon whose weight
// is whether this is the peak, and the label says what the section IS — its
// function and the material it states, so a return reads as a return.
for (const pl of song.arrangement.placed) {
  const s = pl.section; if (s.endBar <= bar0 || s.startBar >= bar1) continue;
  const x = X(Math.max(bar0, s.startBar)), xe = X(Math.min(bar1, s.endBar));
  cv.vline(x, 0, H, [255,179,71], 0.9); cv.vline(x+1, 0, H, [255,179,71], 0.35);
  // A SECTION THAT BUILDS IS DRAWN BUILDING: its ribbon rises from the
  // ordinary weight to the peak's across the section, which is what the
  // arrangement does to its gain. A flat ribbon is a section that sits.
  if (pl.swell) {
    const w = Math.min(xe - x, W);
    for (let i = 0; i < w; i++) cv.rect(x + i, 0, 1, 2, [255,179,71], 0.45 + 0.55 * (i / Math.max(1, w - 1)));
  } else {
    cv.rect(x, 0, Math.min(xe - x, W), 2, [255,179,71], s.peak ? 1 : 0.45);
  }
  // clipped to the section it belongs to: a label that runs into the next
  // section is a label on the wrong section. The manner a hearing is played
  // in and a recast are part of what the section IS, so they are in the name.
  const room = Math.max(0, Math.floor((xe - x - 4) / 4));
  const label = `${s.fn} ${pl.material}${s.recast ? " recast" : ""}${pl.manner ? " " + pl.manner : ""}`.slice(0, room);
  text(cv, label, x + 2, 12, [255,179,71], s.peak ? 1 : 0.75);
}
// which drum is which lane
const LANE_NAME = { kick: "KCK", snare: "SNR", hat: "HAT", openhat: "OHH" };
for (const [lane, i] of Object.entries(LANE)) {
  text(cv, LANE_NAME[lane] ?? lane.slice(0, 3), 2, TOP + PITCH + 4 + i*9, [110, 78, 62]);
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
console.log("the strip: a block per part in · half weight = held back · boxed = a treatment aimed at it · orange dash = half time · a name = the desk");
for (const pl of song.arrangement.placed) {
  const s = pl.section;
  console.log(`  bar ${String(s.startBar).padStart(3)}-${String(s.endBar).padEnd(3)} ${s.fn.padEnd(13)} material ${String(pl.material).padEnd(4)} energy ${s.energy.toFixed(2)}${s.peak?" PEAK":""}${s.vary?" VARY":""}${s.recast?" RECAST":""}${pl.swell?" SWELL":""}${pl.manner?" "+pl.manner.toUpperCase():""}${pl.thin?" THIN":""}`);
  // and what each span of it does, so the picture and the words agree
  // ADDRESSED BY THE SPAN'S OWN BAR. This read `startBar + k * turn`, which
  // was right while every span was two turns and now runs off the end of the
  // section: the arrangement alters on a bar clock too, so there are more
  // spans than turns and each carries where it starts.
  const spans = (pl.spans ?? []).map((sp) => {
    const f = [];
    if (sp.thin) f.push("thin");
    if (sp.halved) f.push("half");
    if (sp.hush) f.push(`hush:${sp.hush}`);
    if (sp.treatment) f.push(`desk:${sp.treatment}${sp.at ? "@" + sp.at : ""}`);
    return `${s.startBar + sp.startBar}:${[...sp.heard].map((r) => r[0]).join("")}${f.length ? "+" + f.join("+") : ""}`;
  });
  if (spans.length > 1 || spans.some((x) => x.includes("+"))) console.log(`      spans  ${spans.join("  ")}`);
}
