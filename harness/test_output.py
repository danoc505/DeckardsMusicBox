#!/usr/bin/env python3
"""Assertions on the RENDERED AUDIO -- see test_output.js for why this exists.

    python3 harness/test_output.py [outdir]

Every check here would have caught a real shipped bug that the note-level suite
passed: silence (a lane the synth doesn't recognise), a stuck master lowpass
(no energy above 2 kHz), a bass-only mix (band balance), a song that never
changes (dynamics), clipping (stacked gains). Ambient and wise are exempt from
the judgment checks -- the user has said not to judge those two -- but even they
must be audible, unclipped and deterministic.
"""
import glob, json, os, sys, wave

import numpy as np

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "output_renders")
EXEMPT = {"ambient", "wise"}          # no taste judgments on these two
DARK_OK = {"dungeon", "lofi"}         # genuinely dark genres: presence bar is lower

passed = failed = 0
def check(name, ok, detail):
    global passed, failed
    print(("  ✓ " if ok else "  ✗ FAIL: ") + name + "  (" + detail + ")")
    if ok: passed += 1
    else: failed += 1

def load(p):
    w = wave.open(p)
    d = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768.0
    if w.getnchannels() == 2:
        d = d.reshape(-1, 2).mean(axis=1)
    return d, w.getframerate()

def bands(x, sr):
    N = 1 << 14
    seg = x[:len(x) // N * N].reshape(-1, N)
    S = (np.abs(np.fft.rfft(seg * np.hanning(N), axis=1)) ** 2).mean(axis=0)
    f = np.fft.rfftfreq(N, 1 / sr)
    tot = max(S.sum(), 1e-30)
    b = lambda a, z: 100 * S[(f >= a) & (f < z)].sum() / tot
    return {"bass": b(60, 250), "mid": b(250, 2000), "presence": b(2000, sr // 2)}

man = json.load(open(os.path.join(OUT, "manifest.json")))
for e in man.get("pageErrors", []):
    check("page loads without a JS error", False, e.split("\n")[0][:120])

for m in man["manifest"]:
    g = m["genre"]
    print(f"\n{g} (seed {m['seed']})")
    if "error" in m:
        check("renders at all", False, m["error"].split("\n")[0][:120]); continue
    check("same seed builds identical events twice", m["deterministic"], "event hash")
    x, sr = load(m["file"])
    rms = float(np.sqrt((x ** 2).mean()))
    peak = float(np.abs(x).max())
    check("audible", rms > 0.02, f"rms {rms:.4f}")
    if rms <= 0.02:
        continue
    clip = int((np.abs(x) > 0.985).sum())
    check("not clipping", clip / len(x) < 0.001, f"{clip} samples ({100*clip/len(x):.3f}%)")
    dc = float(x.mean())
    check("no DC offset", abs(dc) < 0.005, f"{dc:+.5f}")
    crest = 20 * np.log10(peak / max(rms, 1e-9))
    check("crest factor sane (not squashed, not spikes-only)", 6 < crest < 26, f"{crest:.1f} dB")
    # the song CHANGES: quietest vs loudest 2-second window (past the intro)
    W = sr * 2
    wins = x[:len(x) // W * W].reshape(-1, W)
    wr = np.sqrt((wins ** 2).mean(axis=1))
    live = wr[wr > 0.005]
    if len(live) >= 4:
        dyn = 20 * np.log10(live.max() / live.min())
        check("arrangement is audible (loud vs quiet windows)", dyn > 2.5, f"{dyn:.1f} dB")
    if g not in EXEMPT:
        B = bands(x, sr)
        check("not just bass (60-250 under 88%)", B["bass"] < 88, f"{B['bass']:.1f}%")
        floor = 0.10 if g in DARK_OK else 0.25
        check("something above 2 kHz exists", B["presence"] > floor, f"{B['presence']:.2f}%")

print(f"\n{passed} passed, {failed} failed")
sys.exit(1 if failed else 0)
