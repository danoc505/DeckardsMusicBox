// MEASURE bass<->harmony consonance, the way the user's ear hears it.
//
// The user reported "dissonant tones in the bass." Two mechanisms were found and
// fixed; this probe measures both so the fix is a number, not a claim:
//
//   OFF-BEAT harsh notes — bass fills that pass a semitone/tritone from every
//     sounding chord tone. Fixed by ghostPass §2b (snap harsh off-beats to the
//     nearest chord tone). Was 14.9%, now ~0.1%.
//
//   DOWNBEAT harsh notes — the bass ROOT disagreeing with harmony on beat 1,
//     because harmony voiced the conductor's real progression (_realProg) while
//     the bass re-derived the cycle from listen()'s lossy chord read. Fixed by
//     anchoring the bass's downbeats to the SAME _realProg roots (bassEngine) and
//     fixing _progLen to the real cycle length in the conductor. Was 6.7%, now ~1%.
//
// "harsh" = the bass pitch class is a minor 2nd or tritone from the NEAREST harmony
// tone ACTUALLY SOUNDING at that bass note's moment (time-overlap, preferring the
// sustained voicing). This is the honest "what you hear together" reference: a note
// consonant with the chord sounding under it is not counted harsh just because the
// OTHER chord of a two-chord bar (silent by then) sits a semitone away.
const B = require("./engine_bundle.js");
const { conduct, composeSong, makeRng } = B;
const pc = m => ((m % 12) + 12) % 12;

let down = 0, downHarsh = 0, off = 0, offHarsh = 0;
for (let s = 1; s <= 40; s++) {
  const chart = conduct(s);
  const song = composeSong(chart, makeRng(s));
  const harm = song.parts.find(p => p.role === "harmony");
  const bass = song.parts.find(p => p.role === "bass");
  if (!harm || !bass) continue;
  const harmByBar = {};
  for (const n of harm.notes) (harmByBar[n.bar] = harmByBar[n.bar] || []).push(n);
  for (const nt of bass.notes) {
    const hs = harmByBar[nt.bar]; if (!hs) continue;
    const bEnd = nt.step + (nt.dur || 1);
    const sust = new Set(), overlap = new Set();
    for (const h of hs) { const hEnd = h.step + (h.dur || 1);
      if (h.step < bEnd && hEnd > nt.step) { overlap.add(pc(h.midi)); if ((h.dur || 1) >= 6) sust.add(pc(h.midi)); } }
    const set = sust.size ? sust : overlap;
    if (!set.size) continue;
    let mn = 12; for (const t of set) { let d = Math.abs(pc(nt.midi) - t); d = Math.min(d, 12 - d); if (d < mn) mn = d; }
    const harsh = mn === 1 || mn === 6;
    if (nt.step === 0) { down++; if (harsh) downHarsh++; }
    else { off++; if (harsh) offHarsh++; }
  }
}
const pct = (a, b) => (100 * a / b).toFixed(2) + "%";
console.log("bass notes over 40 seeds — harsh = min-2nd/tritone from EVERY sounding chord tone");
console.log("  DOWNBEAT (beat 1, the chord root):", downHarsh + "/" + down, "(" + pct(downHarsh, down) + ")");
console.log("  OFF-BEAT (fills/passing):         ", offHarsh + "/" + off, "(" + pct(offHarsh, off) + ")");
console.log("  TOTAL:                            ", (downHarsh + offHarsh) + "/" + (down + off),
            "(" + pct(downHarsh + offHarsh, down + off) + ")");
