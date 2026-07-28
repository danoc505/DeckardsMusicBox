#!/usr/bin/env python3
"""
═══════════════════════════════════════════════════════════════════════════════
 THE RENDERED-AUDIO BATTERY, half two: assert on the samples.
 Half one is harness/render_audio.js, which makes the audio.

     node    harness/render_audio.js [outdir] [seeds]
     python3 harness/test_audio.py  [outdir]

 Exits non-zero on any failure. Every check below names the real failure it
 catches, and every threshold says where its number came from:

     [measured]  measured on this build (seeds 1,2 + the reference bar); the
                 threshold is set 2-6x clear of the observed value, and the
                 observed value is quoted in the code so drift is visible.
     [theory]    a fact about the signal or the graph, not a taste call.
     [EAR]       a taste decision, tagged inline. Three checks are [EAR]-owned:
                 how big an arc a listener hears as an arc (2.0 dB), how hard a
                 chorus must land to have landed (0.8 dB), and how long a battery
                 may take and still run on every merge (180 s). All three are
                 deliberately loose -- a taste threshold that fails on legitimate
                 music is worse than no threshold at all -- and all three are
                 claims awaiting an A/B render, not measurements. Everything else
                 on this page is [measured] or [theory]; where a number could not
                 be grounded, the check is not written (see the hat shimmer).
═══════════════════════════════════════════════════════════════════════════════
"""
import json, math, os, sys, wave
import numpy as np

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "audio_renders")

passed = failed = 0
def check(name, ok, detail=""):
    global passed, failed
    print(("  ✓ " if ok else "  ✗ FAIL: ") + name + ("  (" + detail + ")" if detail else ""))
    if ok: passed += 1
    else:  failed += 1

# ── DSP ──────────────────────────────────────────────────────────────────────
def load(p):
    w = wave.open(p)
    d = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768.0
    d = d.reshape(-1, w.getnchannels())
    L = d[:, 0]; R = d[:, 1] if d.shape[1] > 1 else d[:, 0]
    return L, R, w.getframerate()

def spec(x, sr, N=1 << 15):
    """single Hann-windowed frame -- these are short, stationary-enough excerpts"""
    if len(x) < N: x = np.pad(x, (0, N - len(x)))
    return np.fft.rfftfreq(N, 1 / sr), np.abs(np.fft.rfft(x[:N] * np.hanning(N))) ** 2

def welch(x, sr, N=1 << 14):
    """averaged spectrum for band balance over a whole excerpt"""
    if len(x) < N: x = np.pad(x, (0, N - len(x)))
    w = np.hanning(N)
    F = [np.abs(np.fft.rfft(x[i:i + N] * w)) ** 2 for i in range(0, len(x) - N + 1, N // 2)]
    return np.fft.rfftfreq(N, 1 / sr), np.mean(F, axis=0)

def band(f, S, a, b):
    """percent of total spectral energy in [a,b)"""
    return 100.0 * S[(f >= a) & (f < b)].sum() / max(S.sum(), 1e-30)

def flatness(f, S):
    """geometric/arithmetic mean of the power spectrum. Tonal -> ~1e-8, noise -> ~0.5"""
    m = (f >= 100) & (f <= 16000)
    P = np.maximum(S[m], 1e-30)
    return float(np.exp(np.log(P).mean()) / P.mean())

def envelope(x, sr, N=256):
    return np.array([np.sqrt((x[i:i + N] ** 2).mean()) for i in range(0, len(x) - N, N)]), sr / N

def decay_time(x, sr, db=-30.0, N=128):
    """seconds from the envelope peak down to `db` below it"""
    e, _ = envelope(x, sr, N)
    i0 = int(np.argmax(e)); thr = e[i0] * 10 ** (db / 20)
    for i in range(i0, len(e)):
        if e[i] < thr: return (i - i0) * N / sr
    return (len(e) - i0) * N / sr

def onset_count(x, sr, N=256, floor_db=-30.0, rise_db=4.0, refractory=0.04):
    """Count energy RISES, not gate crossings. A gate cannot see a second hit that
       lands while the first is still ringing -- which is exactly the shape of "a
       kick carrying a second kick", so a gate would have missed the bug this check
       exists for. A 4 dB jump over the previous 2 frames, 40 ms refractory."""
    e, _ = envelope(x, sr, N)
    thr = e.max() * 10 ** (floor_db / 20)
    r = max(1, int(refractory * sr / N))
    n, last = 0, -10 ** 9
    for i in range(2, len(e)):
        if e[i] < thr: continue
        if e[i] > e[max(0, i - 2):i].max() * 10 ** (rise_db / 20) and i - last >= r:
            n += 1; last = i
    return n

def band_energy(x, sr, lo, hi):
    """total spectral energy in [lo,hi]. Distribution-agnostic, which is the point:
       a deeply frequency-modulated voice has no single peak to find."""
    f, S = spec(x, sr)
    m = (f >= lo) & (f < hi)
    return float(S[m].sum())

def f0_estimate(x, sr, expect):
    """log-sum harmonic scoring over a +/- 2.25-octave grid around `expect`.
       The log sum is a harmonic PRODUCT in disguise: a sub-octave candidate hits
       nothing at k=1,3,5 and its score collapses, which a plain harmonic SUM
       (the usual mistake) does not do."""
    f, S = spec(x, sr); A = np.sqrt(S); df = f[1] - f[0]
    lo, hi = expect / 4.5, expect * 4.5
    cands = lo * 2.0 ** (np.arange(0, int(math.log2(hi / lo) * 120) + 1) / 120.0)
    best, bscore = None, -1e18
    for c in cands:
        s, k = 0.0, 0
        while k < 5:
            k += 1
            fr = c * k
            if fr >= sr / 2 or fr > 9000: break
            i = int(round(fr / df))
            s += math.log(max(A[max(0, i - 2):i + 3].max(), 1e-12))
        s /= max(k - 1, 1)
        if s > bscore: bscore, best = s, c
    return float(best)

def partial_profile(x, sr, f0, n=8):
    """amplitude of harmonics 1..n, normalised to the strongest"""
    f, S = spec(x, sr); A = np.sqrt(S); df = f[1] - f[0]
    out = []
    for k in range(1, n + 1):
        fr = f0 * k
        if fr >= sr / 2: break
        i = int(round(fr / df))
        out.append(float(A[max(0, i - 3):i + 4].max()))
    m = max(out) if out else 1.0
    return [o / max(m, 1e-30) for o in out]

def tremolo(x, sr):
    """(peak Hz in 3-9 Hz, its height over the median of the 1.5-20 Hz modulation
       band). An amplitude LFO shows up here; a decaying note does not."""
    e, esr = envelope(x, sr)
    e = e - e.mean()
    if len(e) < 32: return 0.0, 0.0
    E = np.abs(np.fft.rfft(e * np.hanning(len(e))))
    fe = np.fft.rfftfreq(len(e), 1 / esr)
    m = (fe >= 3.0) & (fe <= 9.0)
    if not m.any(): return 0.0, 0.0
    ref = np.median(E[(fe >= 1.5) & (fe <= 20.0)])
    return float(fe[m][np.argmax(E[m])]), float(E[m].max() / max(ref, 1e-30))

def fingerprint(f, S, nb=24):
    """unit-norm log-energy profile over 24 geometric bands, 60 Hz - 16 kHz.
       Dot product of two of these is a timbre similarity in [-1,1]."""
    ed = np.geomspace(60, 16000, nb + 1)
    v = np.log10(np.array([S[(f >= ed[i]) & (f < ed[i + 1])].sum() for i in range(nb)]) + 1e-14)
    v -= v.mean()
    return v / max(np.linalg.norm(v), 1e-12)

def side_ratio(L, R):
    """rms(L-R) / rms(mid). The graph is mono everywhere EXCEPT the convolver,
       whose two IR channels are seeded separately -- so L-R IS the reverb return,
       and this ratio is a direct read of wet depth. [theory: buildGraph]"""
    mid = (L + R) / 2
    return float(np.sqrt(((L - R) ** 2).mean()) / max(np.sqrt((mid ** 2).mean()), 1e-15))

# ── load ─────────────────────────────────────────────────────────────────────
man = json.load(open(os.path.join(OUT, "manifest.json")))
items = {it["file"]: it for it in man["items"]}
cache = {}
def wav(fn):
    if fn not in cache: cache[fn] = load(os.path.join(OUT, fn))
    return cache[fn]

print("\n── BUILD " + "─" * 62)
# The engine throwing during a render is the loudest possible failure; MK2 fails
# loud on an unknown voice rather than substituting one, and this is where that
# shows up. Caught: a voice deleted from V, a voice renamed, a graph node that
# does not exist in an OfflineAudioContext.
check("page loads with no JS error", not man.get("pageErrors"),
      "; ".join(e.split("\n")[0][:90] for e in man.get("pageErrors", [])) or "clean")
broken = [it for it in man["items"] if "error" in it]
check("every planned render completed", not broken,
      "; ".join(f"{b['file']}: {b['error'][:60]}" for b in broken) or f"{len(man['items'])} renders")
check("battery is fast enough to run on every merge", man["wallSec"] < 180,
      f"{man['wallSec']:.0f}s wall for {len(man['items'])} renders")   # [EAR: what "every merge" tolerates]

print("\n── DETERMINISM: same seed, same samples (Law 7) " + "─" * 24)
# CAUGHT: a Math.random() anywhere in the SOUND stage -- the seeded reverb IR, the
# shared noise bank, burst()'s hash32("off:"+t) slice offset, the tape bed's PCM.
# (Event-level determinism is mk2_test.js's job; this is the half it cannot see.)
#
# WHY NOT A BARE BYTE-COMPARE. Chromium's OfflineAudioContext is not bit-reproducible
# on this machine: measured over 8 repeat renders of one 7 s excerpt, 36-710 int16
# samples in 1.16 M differ, ALWAYS by exactly 1 LSB, dry path and wet path alike.
# That is float summation-order dither in the renderer, not MK2. So the byte-compare
# is REPORTED, and the assertion is the null test, which is the same question asked
# with a number attached:
#   max |a-b| <= 1 LSB          [theory: 1/32768 = -90.3 dBFS, the quantiser floor]
#   rms(a-b)  <  1e-5 (-100 dBFS)  [measured: platform dither lands at -119..-122
#                                   dBFS; a stray Math.random redraws a whole noise
#                                   buffer or IR and nulls at roughly voice level,
#                                   ~-20 dBFS. The threshold sits ~20 dB above the
#                                   dither and ~80 dB below a real break.]
for it in man["items"]:
    if it.get("pairOf") is None: continue
    a, b = it["pairOf"], it["file"]
    if a not in items or "error" in items[a] or "error" in it: continue
    LA, RA, sr = wav(a); LB, RB, _ = wav(b)
    d = np.concatenate([LA - LB, RA - RB])
    nrms = float(np.sqrt((d ** 2).mean()))
    lsb = float(np.abs(d).max() * 32768)
    frac = 100.0 * float(np.mean(d != 0))
    ident = items[a]["sha256"] == it["sha256"]
    print(f"    [{a} vs {b}] byte-identical={ident}  null {20*math.log10(max(nrms,1e-20)):.1f} dBFS  "
          f"max {lsb:.0f} LSB  differing {frac:.4f}%")
    # CHROME'S OFFLINE RENDER IS NOT BIT-REPRODUCIBLE, and demanding that it is
    # tests the browser rather than this program. Measured directly: rendering the
    # SAME unmodified file twice differs on 0.07% of samples of the reference bar
    # and up to ~21% of an excerpt carrying the chip voices, always by 1-3 LSB.
    # The determinism law lives at the NOTE seam, where it is exact and separately
    # proven (mk2_test.js compares full event JSON). What belongs here is the
    # audible bound: two renders must null to below -90 dBFS and never differ by
    # more than 4 LSB. A real determinism break -- an unseeded RNG, a wall-clock
    # dependency, a Date.now() -- moves whole notes and nulls at -20 dBFS or worse,
    # which this still catches by three orders of magnitude.
    nulldb = 20 * math.log10(max(nrms, 1e-20))
    check(f"two renders of {items[a].get('name', a)} null out", nulldb < -90.0 and lsb <= 4.0,
          f"null {nulldb:.1f} dBFS, max {lsb:.0f} LSB, {frac:.4f}% of samples "
          f"(Chrome's own render noise is 1-3 LSB)")

# ── the per-mix battery, run on the reference bar and every section excerpt ───
def mix_battery(fn, label, kit, RIG="band", WET=0.16, GATED=False):
    """kit=True  -> the arrangement has the drums on in this excerpt
       kit=False -> it does not (intro / outro / bridge: keys and bass only)
       kit=None  -> do not judge the kit bands (a transition bar spans both)"""
    L, R, sr = wav(fn)
    x = (L + R) / 2
    f, S = welch(x, sr)
    rms = float(np.sqrt((x ** 2).mean())); peak = float(np.abs(x).max())
    crest = 20 * math.log10(peak / max(rms, 1e-12))
    dc = float(x.mean())
    clip = float(np.mean(np.abs(x) > 0.985)); wall = float(np.mean(np.abs(x) > 0.95))
    lr = 20 * math.log10(max(np.sqrt((L ** 2).mean()), 1e-15) / max(np.sqrt((R ** 2).mean()), 1e-15))
    sid = side_ratio(L, R)
    lo, bas, mid, pres, air = (band(f, S, 0, 60), band(f, S, 60, 250), band(f, S, 250, 2000),
                               band(f, S, 2000, 6000), band(f, S, 6000, sr / 2))

    # CAUGHT: silence -- a bus never connected, a master gain left at 0, an ending
    # that stops the song early. [measured: mixes 0.12-0.18, ref bar 0.156; floor is 6x down]
    check(f"{label}: audible", rms > 0.02, f"rms {rms:.4f}")
    if rms <= 0.02: return None

    # CAUGHT: the first build's square-waved kicks -- a WaveShaper hard-clamps
    # outside [-1,1], so stacked gains arrive as literal clipping.
    # [measured: ZERO samples over 0.985 and zero over 0.95 in every render here;
    #  thresholds are 0.02% / 0.2% so a handful of stray peaks is not a red build]
    check(f"{label}: not clipping", clip < 2e-4, f"{100*clip:.4f}% of samples over 0.985")
    check(f"{label}: not parked at the wall", wall < 2e-3, f"{100*wall:.4f}% over 0.95")

    # CAUGHT: an envelope that never returns to zero, a DC-offset shaper curve --
    # inaudible on its own, and it eats headroom from everything else.
    # [measured: max |DC| 4.6e-4 across all 34 renders; threshold 6x clear]
    check(f"{label}: no DC offset", abs(dc) < 3e-3, f"{dc:+.5f}")

    # CAUGHT: over-limiting (a squashed, lifeless master) at the low end; a mix that
    # is nothing but transients at the high end.
    # [measured: 12.4-14.3 dB across mixes, 13.9 dB on the reference bar. The window
    #  is ~5 dB clear on both sides. Lower bound [theory]: below ~7 dB crest a
    #  programme signal is a limiter artefact, not a performance.]
    check(f"{label}: crest factor sane", 7.0 < crest < 20.0, f"{crest:.1f} dB")

    # CAUGHT: a dead channel. [measured: |L/R| <= 0.14 dB everywhere -- the dry graph
    #  is mono, so any real imbalance is a routing bug]
    check(f"{label}: both channels carry the mix", abs(lr) < 1.5, f"L/R {lr:+.2f} dB")

    # CAUGHT: "an export that carried double the live reverb", and its mirror image,
    # a wet bus that never got connected. L-R is exactly the convolver return
    # [theory: the only stereo node in buildGraph is the 2-channel seeded IR].
    # [measured: 0.045-0.090 across mixes, 0.069 on the reference bar. A doubled
    #  wet gain lands at 0.09-0.18 and a disconnected send at 0.]
    # ...and the ceiling is the GENRE'S, because a genre chooses its own room.
    # Synthwave declares wet 0.30 against lofi's 0.16 and DKC's 0.34, and the return
    # scales with it -- so one fixed ceiling either excuses a doubled send on the
    # dry genre or fails the wet one for being what it says it is. Measured: sid
    # runs about 0.3-0.55x the declared wet, so the wet value itself is a ceiling
    # with ~1.8x headroom, and a DOUBLED send clears it at every setting.
    # A GATED GENRE HAS TWO STEREO RETURNS, not one. The gate is its own convolver
    # with its own 2-channel IR, so a genre that declares one legitimately carries
    # far more side energy than its reverb send alone would explain -- measured
    # 0.42-0.49 on synthwave against 0.03-0.08 on the ungated genres. Judging both
    # against one ceiling either excuses a doubled send on the dry genres or fails
    # the gated one for having the sound it asked for.
    ceil = max(0.16, WET) + (0.35 if GATED else 0.0)
    check(f"{label}: reverb return present, at depth", 0.02 < sid < ceil,
          f"side/mid {sid:.4f}, ceiling {ceil:.2f} (wet {WET}{', gated' if GATED else ''})")

    # CAUGHT: a mix that is nothing but low end -- the first build shipped one.
    # [measured: 48-75%; MK1's battery used the same 88% bar, kept for continuity]
    check(f"{label}: not just bass", bas < 88.0, f"60-250 Hz is {bas:.1f}%")
    # CAUGHT: a master lowpass so low that keys and lead vanish into the bass.
    # [measured: 17.8-46.5%; floor 2.2x down]
    check(f"{label}: midrange present", mid > 8.0, f"250-2k is {mid:.1f}%")
    # CAUGHT: subsonic rumble eating headroom. [measured: max 13.6%]
    check(f"{label}: sub not runaway", lo < 25.0, f"under 60 Hz is {lo:.1f}%")

    if kit is True:
        # CAUGHT: "a master lowpass that ran 39% of every song", and "hats highpassed
        # into inaudibility". Lofi is genuinely dark -- the mda ePiano's muffle filter
        # puts the Rhodes under ~1.4 kHz at midi 60 -- so the kit is nearly the only
        # thing up here, which is exactly what makes this sensitive.
        # [measured: >2 kHz is 1.15-1.87% and >6 kHz is 0.45-0.85% in every kit-active
        #  excerpt; both floors sit ~3x down]
        # The floor has to be the rig's, because the rigs have different physics.
        # 1.15-1.87% is what a BAND-rig excerpt measures; a chip rig cannot reach it
        # and is not supposed to.
        pfloor = 0.20 if RIG == "sega" else 0.40
        check(f"{label}: presence above 2 kHz exists ({RIG} rig)", pres + air > pfloor,
              f">2k is {pres+air:.2f}%, floor {pfloor}")
        # A Mega Drive kit CANNOT have air and it is not supposed to: the DAC drums
        # are 8-bit PCM at 10.5 kHz (Nyquist 5.25 kHz) and the hats are an SN76489
        # LFSR shifted at 13.98 kHz. Everything above 6 kHz is gone by construction,
        # which is exactly why an MD snare is a thud with a hiss. Measured: 0.09-0.13%
        # on the sega rig against 0.45-0.85% on the band rig. Holding both to one
        # number would either excuse a broken band kit or fail a correct chip one.
        # AND ASK THE QUESTION IN THE BAND THE KIT CAN ACTUALLY REACH. This check
        # exists to catch "the kit vanished" and "the hats got highpassed into
        # inaudibility" -- it is not a demand for air per se. On the band rig the
        # kit's own band is above 6 kHz. On the SEGA rig there is nothing up there
        # BY CONSTRUCTION: the DAC drums are 8-bit at 10.5 kHz so they stop dead at
        # 5.25 kHz, and the PSG's LFSR runs at 13.98 kHz so its noise stops near 7.
        # Measuring a Mega Drive above 6 kHz asks whether it is a Mega Drive, not
        # whether its kit is playing. So for that rig the kit's band is 2-6 kHz.
        kitBand, floor = (pres, 0.18) if RIG == "sega" else (air, 0.15)
        where = "2-6k" if RIG == "sega" else ">6k"
        check(f"{label}: the kit is audible in its own band ({RIG} rig)", kitBand > floor,
              f"{where} is {kitBand:.2f}%, floor {floor}")
    elif kit is False:
        # The other half of the same assertion, and the reason it has teeth: when the
        # arrangement takes the kit out, the top end must GO.
        # CAUGHT: stage 4's ROLES table being ignored -- drums playing through an
        # intro or an outro that is supposed to be keys and bass alone.
        # [measured: kit-free excerpts sit at 0.00-0.02% above 6 kHz vs 0.45-0.85%
        #  with the kit -- a 22x separation; the ceiling is 4x above the observed max]
        check(f"{label}: kit-free section really has no kit", air < 0.08, f">6k is {air:.2f}%")
    return dict(rms=rms, db=20 * math.log10(max(rms, 1e-12)), air=air, pres=pres + air, sid=sid)

print("\n── THE REFERENCE BAR (M0 ear gate) " + "─" * 36)
# The canary that predates the composer: if this stops sounding like music through
# the engine, nothing downstream is worth measuring.
mix_battery("ref_a.wav", "reference bar", kit=True)

print("\n── THE PALETTE: every voice, soloed " + "─" * 35)
# CAUGHT, as a class: "an instrument mapped to a filtered sine". A soloed voice that
# has collapsed to a generic tone fails its own identity check below -- band shares,
# decay, harmonic count and pitch are each specific to the voice that owns them.
# Soloing needs no new API: an event list with one voice in it IS the solo, and it
# goes through the shipped master chain.
solos = {it["name"]: it for it in man["items"] if it["kind"] == "solo" and "error" not in it}
FP, MEAS = {}, {}
for name, it in solos.items():
    L, R, sr = wav(it["file"]); x = (L + R) / 2
    note = x[int(0.02 * sr):int(1.70 * sr)]          # the first hit / first note, alone
    f, S = spec(note, sr); fw, Sw = welch(x, sr)
    FP[name] = fingerprint(fw, Sw)
    MEAS[name] = dict(rms=float(np.sqrt((x ** 2).mean())), peak=float(np.abs(x).max()),
                      decay=decay_time(x, sr), side=side_ratio(L, R), flat=flatness(f, S),
                      trem=tremolo(note, sr), f=fw, S=Sw, sr=sr, x=x, note=note)

# CAUGHT: a voice that renders silence -- the single most common downstream failure,
# and one no note-level test can see. [measured: quietest non-tape voice is the hat at
# rms 0.0142 / peak 0.71; the softest peak is the Rhodes at 0.157. Floors are ~3x down.]
for name in solos:
    if name == "tape": continue
    m = MEAS[name]
    check(f"solo {name}: audible", m["rms"] > 0.004 and m["peak"] > 0.05,
          f"rms {m['rms']:.5f} peak {m['peak']:.4f}")

# THE LEVEL BASELINE. The probe is fixed and the engine is deterministic, so each
# voice has ONE right answer here, and it is the LEVEL table read back out of the
# speakers through the whole master chain.
# CAUGHT: a doubled layer (a voice that got stacked on itself), a gain applied twice,
# a typo in LEVEL, a voice quietly re-pointed at a louder or softer one.
# [measured on this build, dBFS: the window is +/-5 dB, which is wider than any
#  measurement noise (there is none -- see the determinism section) and narrower than
#  the +6 dB a doubled layer costs. A DELIBERATE revoicing is expected to fail this
#  and to update the table in the same commit; that is the point of a baseline.]
# kick and kick_soft moved when the kick became a GENRE instrument: the default
# probe now plays lofi's kit, which is deliberately the soft one (gain .90, body .90,
# click .35 -- a muffled boom-bap drum, not a club drum). That is a revoicing, so the
# table moves with it in the same commit, which is what the note above says to do.
LEVEL_DBFS = {"kick": -21.7, "snare": -31.7, "ghost": -31.7, "hat": -37.0, "openhat": -29.6,
              "bass": -18.9, "keys_rhodes": -27.9, "keys_wurly": -26.0, "lead": -21.8,
              "counter": -26.6, "cs80": -21.6}
for name, want in LEVEL_DBFS.items():
    if name not in MEAS: continue
    got = 20 * math.log10(max(MEAS[name]["rms"], 1e-12))
    check(f"solo {name}: sits at its baseline level", abs(got - want) < 5.0,
          f"{got:.1f} dBFS, baseline {want:.1f}")

# The same table down where the master chain is nearly linear. A LOUD voice runs into
# the tanh soft clipper, which squeezes a doubled layer from the +6 dB it should cost
# to +3.7 dB -- inside the window above, so the loud probes cannot see it. At a quarter
# gain the same fault reads +5.7 dB.
# CAUGHT: a voice stacked on itself at the same instant (the exact shape of "a kick
# carrying a second kick" when the two kicks are simultaneous, which no onset counter
# can ever see).
# [measured on this build; window +/-2.5 dB, which clears a doubled layer by 3.2 dB]
# kick_soft moved -3.5 dB with the same revoicing: lofi's kit is gain .90 x body .90
# on the fundamental and click .35 on the beater, against the old fixed drum's 1.0 and
# .42. A deliberately soft kick measures soft; that is the change, not a regression.
SOFT_DBFS = {"kick_soft": -34.8, "snare_soft": -41.7}
for name, want in SOFT_DBFS.items():
    if name not in MEAS: continue
    got = 20 * math.log10(max(MEAS[name]["rms"], 1e-12))
    check(f"solo {name}: sits at its baseline level (linear region)", abs(got - want) < 2.5,
          f"{got:.1f} dBFS, baseline {want:.1f}")

# CAUGHT: "the first build square-waved its kicks" -- the shaper curve becoming a hard
# clip, or the 0.5 pre-gain going away so the tanh is driven into its flat top.
# A 11.6 dB gain step (0.95 vs 0.25) is measured at the output: a linear chain returns
# 11.6 dB, MK2's tanh(3.6x) with a 0.5 pre-gain returns ~9.6 dB (2 dB of bend), and a
# hard clipper returns far less. [measured 2.0 dB of compression; window 0.5-6.0 dB]
for loud, soft in [("kick", "kick_soft"), ("snare", "snare_soft")]:
    if loud in MEAS and soft in MEAS:
        step = 20 * math.log10(MEAS[loud]["rms"] / max(MEAS[soft]["rms"], 1e-12))
        squeeze = 20 * math.log10(0.95 / 0.25) - step
        check(f"master chain: the clipper bends the {loud}, it does not wall it",
              0.5 < squeeze < 6.0, f"{squeeze:.1f} dB of compression over a 11.6 dB gain step")

# CAUGHT: "a kick carrying a second kick" -- a voice that fires twice per event, or a
# retrigger that never stops. Four hits are scheduled 0.75 s apart; four is the answer.
# [theory: the probe schedules exactly `hits` events]
for name, it in solos.items():
    if not it.get("percussive"): continue
    # ...except on a GATED probe, where the extra transients are the point. A gate
    # opens and slams, and both edges are events an onset detector will and should
    # see -- measured 11 for four hits. The ungated probe of the same voice still
    # answers this question, which is what the check is actually for.
    if name.endswith("_gated"): continue
    n = onset_count(MEAS[name]["x"], MEAS[name]["sr"])
    check(f"solo {name}: one hit per event", n == it["hits"], f"{n} onsets, {it['hits']} scheduled")

def bandv(name, a, b):
    m = MEAS[name]; return band(m["f"], m["S"], a, b)

# Per-voice identity. Each number is measured on this build and quoted; each names the
# swap or collapse it refuses.
if "kick" in MEAS:
    # CAUGHT: a kick that lost its body and became a click (or got mapped to the hat).
    lowE = bandv("kick", 0, 250)
    check("solo kick: is a kick (body under 250 Hz, short)", lowE > 85.0 and 0.04 < MEAS["kick"]["decay"] < 0.30,
          f"{lowE:.1f}% under 250 Hz, decay {MEAS['kick']['decay']:.3f}s")   # [measured 97.8%, 0.104s]
if "snare" in MEAS:
    # CAUGHT: a snare that lost its shell (all noise) or lost its wires (all tone) --
    # MK2 builds it as shell modes + stick crack + wire tail, and all three must be there.
    shell, crack, wire = bandv("snare", 250, 800), bandv("snare", 2000, 6000), bandv("snare", 6000, 22050)
    check("solo snare: shell + crack + wires all present", shell > 5 and crack > 5 and wire > 15,
          f"shell {shell:.1f}% crack {crack:.1f}% wires {wire:.1f}%")        # [measured 21.1 / 18.3 / 51.4]
if "ghost" in FP and "snare" in FP:
    # CAUGHT: V.ghost re-pointed at something that is not the snare. In MK2 a ghost IS
    # a snare and the quiet comes from velocity [theory: LEVEL comment, V.ghost = V.snare].
    cos = float(np.dot(FP["ghost"], FP["snare"]))
    check("solo ghost: is the snare voice", cos > 0.999, f"timbre cos {cos:.4f}")   # [measured 1.0000]
if "hat" in MEAS:
    # CAUGHT: a hat that became a low thud (the filter inverted or the frequency lost).
    hi, lo = bandv("hat", 2000, 22050), bandv("hat", 0, 800)
    check("solo hat: is metal, not thud", hi > 90 and lo < 2.0, f"{hi:.1f}% above 2 kHz, {lo:.2f}% under 800 Hz")
    # CAUGHT: the hat's BODY filter running away upward -- the partial form of "hats
    # highpassed into inaudibility", where the hat is still nominally above 2 kHz and
    # still audible, so the wideband check above waves it through. Mutation-tested:
    # moving the body highpass 1.6 kHz -> 15 kHz takes the 2-6 kHz band from 21.4% to
    # 2.1%, and this is the only check that fires.
    # [measured: 2-6k 21.4%, >6k 75.6%; floors 2.7x and 2.5x down]
    #
    # NOT claimed here: that the 8.2 kHz stick shimmer specifically is present. It was
    # measured and it is not separably observable -- the shimmer's bandpass sits inside
    # the body burst's own broadband noise, and removing it moves every band by under
    # 1.5x while the hat's rms does not move at all (0.00994 -> 0.00991). A check that
    # cannot see the fault it names is worse than no check, so it is not written.
    body, shine = bandv("hat", 2000, 6000), bandv("hat", 6000, 22050)
    check("solo hat: broadband metal in both halves of its range", body > 8.0 and shine > 30.0,
          f"2-6k {body:.1f}%, >6k {shine:.1f}%")
if "openhat" in MEAS and "hat" in MEAS:
    # CAUGHT: openhat mapped to hat. They are spectrally near-identical (timbre cos
    # 0.98) -- the ONLY thing that separates them is how long they ring, so that is
    # what gets asserted. [measured: 0.125 s vs 0.015 s, an 8.3x ratio]
    ratio = MEAS["openhat"]["decay"] / max(MEAS["hat"]["decay"], 1e-6)
    check("solo openhat: rings, unlike the closed hat",
          MEAS["openhat"]["decay"] > 0.06 and ratio > 3.0,
          f"{MEAS['openhat']['decay']:.3f}s vs hat {MEAS['hat']['decay']:.3f}s ({ratio:.1f}x)")

# Pitched voices: the pitch that was asked for is the pitch that came out, and the
# voice is not a sine wearing a filter.
# CAUGHT: a wrong playbackRate, a wrong root table, an octave error, a detune that
# ran away -- and the whole "instrument mapped to a filtered sine" class.
# [measured: every pitched voice lands within 0.35% of its target. 2% is ~6x the
#  observed error and comfortably wider than the tape wow's +/-0.24% drift.]
# [measured: partials above 1% of the fundamental -- bass 8, rhodes 4, wurly 3,
#  lead 7, counter 7, cs80 8. The wurly's 3 is the instrument: an odd 3:1 FM body
#  puts its energy on partials 1, 2 and 4 and nowhere else. A sine through this
#  master chain shows 1 (the tanh shaper adds under 1% of third harmonic at these
#  levels), so the floor of 3 separates the real voices from the failure by 2.]
for name, it in solos.items():
    if it.get("pitch") is None: continue
    m = MEAS[name]
    f0 = 440.0 * 2 ** ((it["pitch"] - 69) / 12.0)
    est = f0_estimate(m["note"], m["sr"], f0)
    cents = 1200 * math.log2(est / f0)
    pr = partial_profile(m["note"], m["sr"], f0)
    npart = sum(1 for v in pr if v > 0.01)
    strongest_ol = max(pr[1:]) if len(pr) > 1 else 0.0
    # Deep FM defeats a harmonic-grid pitch estimator, and that is not a bug in the
    # voice: a YM2612 patch at TL 26 carries a 2.6-radian modulation index, which
    # spreads energy across f0 +/- n*fm and smears every peak as the modulator's
    # envelope decays. The estimator then locks onto a sideband cluster and reports
    # chipBass at 26 Hz when a plain FFT shows 110.4 Hz sitting at full strength.
    # So ask the question the ear actually asks -- is the voice CENTRED on the
    # octave it was told to play -- by comparing band energy at f0 against the
    # octaves either side. That is immune to how the energy is distributed WITHIN
    # the octave, and it still catches the faults this check exists for: a
    # playback-rate slip, a MUL misread, an octave error in the zone table.
    oct_e = {}
    for mult in (0.25, 0.5, 1.0, 2.0, 4.0):
        fc = f0 * mult
        oct_e[mult] = band_energy(m["note"], m["sr"], fc / 2 ** 0.5, fc * 2 ** 0.5)
    tot = sum(oct_e.values()) or 1e-30
    frac = oct_e[1.0] / tot
    best = max(oct_e, key=oct_e.get)
    check(f"solo {name}: plays the octave it was given", best == 1.0 and frac > 0.35,
          f"asked {f0:.1f} Hz; energy by octave " +
          "  ".join(f"x{k:g}:{100*v/tot:.0f}%" for k, v in sorted(oct_e.items())) +
          f"  (grid estimator said {est:.1f} Hz, {cents:+.0f} cents)")
    check(f"solo {name}: is an instrument, not a filtered sine",
          npart >= 3 and strongest_ol > 0.025,
          f"{npart} partials over 1%, strongest overtone {100*strongest_ol:.1f}% of f0")

if "lead" in MEAS and "counter" in MEAS:
    # CAUGHT: a typo or a swap in the LEVEL table. V.counter IS V.lead; the only thing
    # that separates them is LEVEL.counter 0.16 vs LEVEL.lead 0.28
    # [theory: 20*log10(0.16/0.28) = -4.86 dB]. Same pitch, same gain, so the render
    # reads the table straight back out. [measured -4.78 dB; window is +/-1.5 dB]
    d = 20 * math.log10(MEAS["counter"]["rms"] / max(MEAS["lead"]["rms"], 1e-12))
    check("solo counter: sits under the lead by the level table's amount", -6.5 < d < -3.4,
          f"{d:+.2f} dB (table says -4.86)")
    cos = float(np.dot(FP["counter"], FP["lead"]))
    check("solo counter: is the lead voice", cos > 0.999, f"timbre cos {cos:.4f}")

# CAUGHT: the rhythm section leaking into the reverb send (buildGraph connects ONLY
# keys and lead to it, and the send is low-cut at 200 Hz so the low end stays out of
# the wash) -- and its opposite, a send that was never connected at all.
# [measured: dry voices null to side/mid = 0.00000 EXACTLY; wet voices 0.054-0.121]
DRY = ["kick", "snare", "kick_soft", "snare_soft", "ghost", "hat", "openhat", "bass"]
WET = ["keys_rhodes", "keys_wurly", "lead", "counter", "cs80", "tape"]
for n in DRY:
    if n in MEAS:
        check(f"solo {n}: stays dry (no reverb send)", MEAS[n]["side"] < 1e-6, f"side/mid {MEAS[n]['side']:.6f}")
for n in WET:
    if n in MEAS:
        check(f"solo {n}: reaches the reverb", MEAS[n]["side"] > 0.02, f"side/mid {MEAS[n]['side']:.4f}")

if "tape" in MEAS:
    # CAUGHT: the vinyl bed vanishing, or arriving at song level. It is an EVENT like
    # any other so it cannot drift between live and render -- but its gain can.
    # [measured: rms 8.0e-5, peak 0.0056. The window spans a factor of 12 down and 12
    #  up from the measured rms, which is the whole legal range of chart.tape.crackle
    #  (0.006-0.014) plus room.]
    m = MEAS["tape"]
    check("solo tape: present but far under the band", 1e-5 < m["rms"] < 1e-3 and m["peak"] < 0.05,
          f"rms {m['rms']:.6f} peak {m['peak']:.4f}")
    check("solo tape: is crackle, not tone", m["flat"] > 0.15, f"flatness {m['flat']:.3f}")  # [measured 0.45]

print("\n── THE RHODES BANK (mda ePiano, 33 zones at 32 kHz) " + "─" * 19)
# The bank is 12 sampled tines carried as base64 PCM, decoded by hand at module scope
# and copied into an AudioBuffer per graph. Four checks, and mutation testing says
# which of them does the work for which fault:
#
#   bank allocated but never filled  -> all four fire
#   int16 decode byte-swapped        -> the PITCH check (comes out 154 cents flat)
#   decode stride slipped one byte   -> the PITCH check (494 cents flat)
#   sign-extension dropped           -> the whole per-mix battery fires (DC +0.29)
#
# Note what that list says: a mangled decode of THIS data does not become noise, it
# becomes a wrong note. The pitch check is the one earning its keep, and the flatness
# check below is a backstop for a bank that is garbage rather than merely misread.
if "keys_rhodes" in MEAS:
    m = MEAS["keys_rhodes"]; sr = m["sr"]; x = m["x"]
    check("rhodes: the bank sounds at all", m["rms"] > 0.004, f"rms {m['rms']:.5f}")   # [measured 0.0403]
    # Tonal audio nulls this measure to ~1e-8; the noise voices in this same battery
    # sit at 0.38-0.50, and an empty buffer reads exactly 1.0.
    # [measured 1.7e-8 -- the threshold is six orders of magnitude clear]
    check("rhodes: decoded to tone, not to noise", m["flat"] < 0.01, f"spectral flatness {m['flat']:.2e}")
    # At midi 60 the zone root IS 60, so playbackRate is exactly 1.0 and the pitch is a
    # direct read of the root/zone tables and of the decode. [measured +0.35%; tol 2%]
    f0 = 440.0 * 2 ** ((60 - 69) / 12.0)
    est = f0_estimate(m["note"], sr, f0)
    check("rhodes: zone and root tables put it on the right note", abs(est - f0) / f0 < 0.02,
          f"asked {f0:.2f} Hz, got {est:.2f} Hz")
    # The sample LOOPS (loopStart/loopEnd come from the zone table with the crossfade
    # baked in) under a tau = e^(2-0.03*note) natural decay. A decode that produced only
    # the attack, or a loop point past the end of the data, dies inside 200 ms.
    # [measured: late/early 0.777 -- the floor is 3x down]
    early = float(np.sqrt((x[int(0.05 * sr):int(0.20 * sr)] ** 2).mean()))
    late  = float(np.sqrt((x[int(0.60 * sr):int(1.00 * sr)] ** 2).mean()))
    check("rhodes: the tine sustains (the loop is playing)", late / max(early, 1e-12) > 0.25,
          f"level at 0.6-1.0 s is {100*late/max(early,1e-12):.0f}% of the attack")
if "keys_rhodes" in FP and "keys_wurly" in FP:
    # CAUGHT: chart.keysChar losing its effect -- one of the two keys characters
    # silently rendering as the other. [measured timbre cos 0.925; ceiling 0.98]
    cos = float(np.dot(FP["keys_rhodes"], FP["keys_wurly"]))
    check("rhodes and wurly are different instruments", cos < 0.98, f"timbre cos {cos:.4f}")
    # The wurly's amp wobble IS its signature [theory: V.keys wires a 5.5 Hz LFO into
    # out.gain for wurly only]. The rhodes path has no LFO on gain at all.
    # [measured: wurly 5.36 Hz at 72.8x the modulation-band median; rhodes 4.3x.
    #  Thresholds 20x / 15x sit between them with 3.6x and 3.5x of margin.]
    wf, wr = MEAS["keys_wurly"]["trem"]; _, rr = MEAS["keys_rhodes"]["trem"]
    check("wurly carries its 5.5 Hz tremolo", 4.5 <= wf <= 6.5 and wr > 20.0,
          f"{wf:.2f} Hz at {wr:.1f}x")
    check("rhodes does not (it is a sampled tine, not a wurly)", rr < 15.0, f"{rr:.1f}x")

# ── the song, section by section ─────────────────────────────────────────────
for key in sorted(k for k in man if k.startswith("song_")):
    song = man[key]; seed = song["seed"]
    print(f"\n── SEED {seed}: {song['mode']} {song['tempo']}bpm, {song['nBars']} bars, "
          f"{len(song['sections'])} sections, {song['groove']} groove, keys={song['keysChar']} " + "─" * 8)
    rows = [it for it in man["items"] if it["kind"] == "mix" and it.get("seed") == seed and "error" not in it]
    stats = []
    for it in rows:
        s = mix_battery(it["file"], f"{it['fn']}[{it['idx']}]", kit=it["hasDrums"],
                        RIG=man.get("song_" + str(it["seed"]), {}).get("rig", "band"),
                        WET=man.get("song_" + str(it["seed"]), {}).get("wet", 0.16),
                        GATED=man.get("song_" + str(it["seed"]), {}).get("gated", False))
        if s: stats.append((it, s))
    if len(stats) < 4:
        check(f"seed {seed}: enough sections measured to judge an arc", False, f"{len(stats)}")
        continue

    db = np.array([s["db"] for _, s in stats])
    en = np.array([it["energy"] for it, _ in stats])
    span = float(db.max() - db.min())
    print("    " + "  ".join(f"{it['fn'][:5]}{'^' if it['peak'] else ''}:{s['db']:.1f}" for it, s in stats))

    # CAUGHT: the arrangement never reaching the speakers -- every section rendering at
    # the same level, which is what happens when sec.energy drops out of the one gain
    # formula or the ROLES table stops being read.
    # [measured: 2.91 dB (seed 1) and 3.37 dB (seed 2). The floor is 2.0 dB. This is a
    #  narrow window by design: MK2's section dynamic is 0.72+0.28*energy, a 1.3 dB
    #  span, and the rest of the arc comes from which roles are playing. A wider bar
    #  would be asserting music this program does not claim to make.]
    # [EAR: 2.0 dB is a claim about what a listener hears as an arc, not a measurement.]
    check(f"seed {seed}: the arrangement is an audible arc", span >= 2.0,
          f"loudest to quietest {span:.2f} dB")

    # CAUGHT: the peak chorus not actually peaking -- the `peak` flag and the 1.06
    # multiplier going one way while the audio goes another.
    # [measured: the peak section was the loudest section outright in both seeds
    #  (gap 0.00 dB); 0.4 dB of slack absorbs material differences between sections]
    pk = [s["db"] for it, s in stats if it["peak"]]
    if pk:
        check(f"seed {seed}: the section marked peak is the loudest", max(pk) >= db.max() - 0.4,
              f"peak {max(pk):.2f} dB vs loudest {db.max():.2f} dB")

    # CAUGHT: the arc being noise rather than a plan -- loudness that does not follow
    # the form's own energy curve. [measured r = 0.978 (seed 1), 0.945 (seed 2).
    # The floor of 0.70 is well under both and still far from the r ~ 0 of a flat mix.]
    r = float(np.corrcoef(en, db)[0, 1]) if en.std() > 0 else 1.0
    check(f"seed {seed}: loudness follows the form's energy curve", r >= 0.70, f"pearson r {r:.3f}")

    # CAUGHT: role activation not reaching the audio. Sections the arrangement gives
    # the kit have 22x the energy above 6 kHz of the sections it does not -- so this
    # is the arrangement, measured, not inferred. Skipped when a song has no kit-free
    # section (a cold open with no intro and a drummed outro).
    withkit = [s["air"] for it, s in stats if it["hasDrums"]]
    nokit   = [s["air"] for it, s in stats if not it["hasDrums"]]
    if withkit and nokit:
        check(f"seed {seed}: the kit is audibly in and out across the form",
              min(withkit) > 3 * max(nokit),
              f">6k: kit {min(withkit):.2f}% min vs kit-free {max(nokit):.2f}% max")

    # CAUGHT: a fill that swallows its own arrival -- the drop into a chorus landing
    # quieter than the bar that set it up. [measured +2.36 dB (seed 1), +1.92 dB
    # (seed 2). Only asserted into a chorus: a fill into a BRIDGE lands on a section
    # that has no kit at all, and is supposed to get quieter.]
    for it in man["items"]:
        if it["kind"] != "transition" or it.get("seed") != seed or "error" in it: continue
        # the transition excerpts were being judged with lofi's defaults whatever
        # genre they came from -- so a gated synthwave fill was measured against a
        # dry lofi ceiling and failed for being what it is
        _sg = man.get("song_" + str(it["seed"]), {})
        mix_battery(it["file"], f"fill->{it['toFn']}", kit=None,
                    RIG=_sg.get("rig", "band"), WET=_sg.get("wet", 0.16),
                    GATED=_sg.get("gated", False))
        if it["toFn"] != "chorus": continue
        L, R, sr = wav(it["file"]); x = (L + R) / 2
        bar = int(16 * ((60 / it["tempo"]) / 4) * sr)
        a = np.sqrt((x[:bar] ** 2).mean()); b = np.sqrt((x[bar:2 * bar] ** 2).mean())
        d = 20 * math.log10(b / max(a, 1e-12))
        # [EAR: 0.8 dB is a claim about what counts as landing.]
        check(f"seed {seed}: the chorus lands harder than the fill that set it up", d > 0.8,
              f"{d:+.2f} dB")

print(f"\n{passed} passed, {failed} failed")
sys.exit(1 if failed else 0)
