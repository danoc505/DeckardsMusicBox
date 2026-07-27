#!/usr/bin/env python3
"""MEASURE — read rendered WAVs and print the numbers a claim has to survive.

    python3 harness/mk2_measure.py <dir-or-wav> [...]

Per file: length, peak, RMS, crest, and the octave-band balance. For solo probes
it also reports each note's peak and decay, because "the voice renders" and "the
voice is audible at the level it was designed for" are different claims.
"""
import sys, os, wave, struct, math, cmath

def load(p):
    w = wave.open(p); n = w.getnframes(); ch = w.getnchannels(); sr = w.getframerate()
    s = struct.unpack("<%dh" % (n * ch), w.readframes(n))
    x = [(s[i*ch] + s[i*ch+1]) / 2 / 32768 for i in range(n)] if ch == 2 else [v/32768 for v in s]
    return x, sr

def db(v):
    return 20 * math.log10(max(v, 1e-9))

def fft(a):
    n = len(a)
    if n == 1: return a
    ev, od = fft(a[0::2]), fft(a[1::2])
    t = [cmath.exp(-2j*math.pi*k/n) * od[k] for k in range(n//2)]
    return [ev[k]+t[k] for k in range(n//2)] + [ev[k]-t[k] for k in range(n//2)]

BANDS = [(20,80),(80,200),(200,600),(600,1500),(1500,3500),(3500,5250),(5250,8000),(8000,16000)]
LBL   = ["20-80","80-200","200-600","600-1k5","1k5-3k5","3k5-5k2","5k2-8k","8k-16k"]

def spectrum(x, sr, N=4096, hops=120):
    win = [0.5 - 0.5*math.cos(2*math.pi*i/N) for i in range(N)]
    acc = [0.0]*(N//2); cnt = 0
    if len(x) <= N: x = x + [0.0]*(N+1-len(x))
    step = max(1, (len(x)-N)//hops)
    for st in range(0, len(x)-N, step):
        F = fft([complex(x[st+i]*win[i]) for i in range(N)])
        for k in range(N//2): acc[k] += abs(F[k])
        cnt += 1
    return [v/max(cnt,1) for v in acc], sr/N

def notes(x, sr, thresh=0.004):
    """peak and 60-dB decay of each attack, so a silent note cannot hide in an average"""
    out, i, n = [], 0, len(x)
    while i < n:
        if abs(x[i]) > thresh:
            j, pk, pj = i, 0.0, i
            while j < n and j < i + int(1.2*sr):
                if abs(x[j]) > pk: pk, pj = abs(x[j]), j
                j += 1
            k = pj
            while k < n and k < pj + int(1.2*sr) and abs(x[k]) > pk/1000: k += 1
            out.append((i/sr, db(pk), (k-pj)/sr))
            i = i + int(1.0*sr)
        else:
            i += 1
    return out

def report(p):
    x, sr = load(p)
    pk = max((abs(v) for v in x), default=0)
    rms = math.sqrt(sum(v*v for v in x)/max(len(x),1))
    sp, dfr = spectrum(x, sr)
    tot = sum(v*v for v in sp) or 1
    bal = []
    for (lo, hi), lbl in zip(BANDS, LBL):
        e = sum(sp[k]**2 for k in range(int(lo/dfr), min(len(sp), int(hi/dfr))))
        bal.append(f"{lbl}:{10*math.log10(max(e,1e-12)/tot):6.1f}")
    clip = sum(1 for v in x if abs(v) > 0.995)
    print(f"{os.path.basename(p):26s} {len(x)/sr:6.1f}s peak{db(pk):7.2f} rms{db(rms):7.2f} "
          f"crest{db(pk)-db(rms):6.2f} clip{clip:5d}")
    print(f"{'':26s} {' '.join(bal)}")
    if os.path.basename(p).startswith("solo_"):
        ns = notes(x, sr)
        print(f"{'':26s} {len(ns)} attacks: " +
              "  ".join(f"@{t:.2f}s {a:.1f}dB decay {d*1000:.0f}ms" for t, a, d in ns[:6]))

args = sys.argv[1:] or ["."]
files = []
for a in args:
    if os.path.isdir(a): files += sorted(os.path.join(a, f) for f in os.listdir(a) if f.endswith(".wav"))
    else: files.append(a)
for f in files: report(f)
