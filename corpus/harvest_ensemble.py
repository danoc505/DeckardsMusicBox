#!/usr/bin/env python3
"""Harvest how the PARTS OF A BAND FIT TOGETHER, from the Lakh MIDI Dataset.

    https://colinraffel.com/projects/lmd/   (Clean MIDI subset, 17,256 files)

Why this exists. Five corpora have been measured on this project and every one of
them measured ONE PART ON ITS OWN:

    harvest_structure.py     (Harmonix)    -> where sections go
    harvest_melody.py        (Hooktheory)  -> the tune, by itself
    harvest_drums.py         (Groove MIDI) -> the kit, by itself
    harvest_accompaniment.py (POP909)      -> a piano, by itself
    harvest_bass.py          (Lakh)        -> the bass, by itself

So every number the engine is tuned to is a SOLO number. Each part can hit its own
target perfectly and the band can still be a wall of noise, because nothing has ever
measured the thing that actually makes an arrangement: what the parts do RELATIVE TO
EACH OTHER. How many notes are sounding at once. Whether a busy bar in one part is a
quiet bar in another. Whether two parts land on the same sixteenth or take turns.
Whether anybody ever shuts up.

Lakh's Clean MIDI subset is full-band arrangements with General MIDI program numbers,
so roles can be identified rather than guessed:

    channel 9         -> drums
    program 32-39     -> bass
    the rest          -> split by POLYPHONY. A part whose notes almost never overlap
                         is playing a LINE (melody/lead); a part that stacks notes is
                         playing CHORDS (comp/pad). That is the piano-hands division,
                         and it is measurable, not assumed.

    python3 corpus/harvest_ensemble.py [n_files]
    python3 corpus/harvest_ensemble.py --print [n_songs]   # print the actual grids
"""
import collections
import io
import os
import statistics as st
import sys
import tarfile

import mido            # pip install mido

CACHE = os.path.join(os.path.dirname(__file__), ".lakh")
TAR = os.path.join(CACHE, "clean_midi.tar.gz")

BASS_PROGRAMS = set(range(32, 40))


def track_notes(tr, tpb):
    """[(bar, step, pitch, dur_steps)] on a sixteenth grid, plus the channel/program."""
    t = 0
    prog, chan = None, None
    on = {}
    out = []
    for msg in tr:
        t += msg.time
        if msg.type == "program_change":
            prog = msg.program
            chan = msg.channel
        elif msg.type == "note_on" and msg.velocity > 0:
            on[msg.note] = t
            chan = msg.channel if chan is None else chan
        elif msg.type in ("note_off",) or (msg.type == "note_on" and msg.velocity == 0):
            t0 = on.pop(msg.note, None)
            if t0 is None:
                continue
            beat = t0 / tpb
            b = int(beat // 4)
            step = int(round((beat - b * 4) * 4))
            if step >= 16:
                b, step = b + 1, 0
            dur = max(1, int(round((t - t0) / tpb * 4)))
            out.append((b, step, msg.note, dur))
    out.sort(key=lambda x: (x[0], x[1]))
    return out, prog, chan


def polyphony(notes):
    """Mean number of notes struck on the same (bar, step). 1.0 = a pure line."""
    c = collections.Counter((b, s) for b, s, _, _ in notes)
    return sum(c.values()) / max(1, len(c))


def classify(mid):
    """{role: notes}. Roles: drums, bass, line (mono), chords (poly)."""
    tpb = mid.ticks_per_beat or 480
    parts = []
    for tr in mid.tracks:
        notes, prog, chan = track_notes(tr, tpb)
        if len(notes) < 24:
            continue
        parts.append((notes, prog, chan))
    if not parts:
        return {}
    out = collections.defaultdict(list)
    lines, chords = [], []
    for notes, prog, chan in parts:
        if chan == 9:
            out["drums"] += notes
        elif prog in BASS_PROGRAMS:
            out["bass"] += notes
        else:
            (lines if polyphony(notes) < 1.15 else chords).append(notes)
    # of the monophonic parts, the highest one is the tune; the rest are counter-lines
    lines.sort(key=lambda n: st.median(p for _, _, p, _ in n), reverse=True)
    if lines:
        out["lead"] = lines[0]
        for extra in lines[1:]:
            out["counter"] += extra
    for c in chords:
        out["chords"] += c
    return {k: sorted(v, key=lambda x: (x[0], x[1])) for k, v in out.items() if v}


def sounding(notes):
    """{bar: {step: n_onsets}} and {bar: set(steps covered by a sustaining note)}."""
    onset = collections.defaultdict(collections.Counter)
    held = collections.defaultdict(set)
    for b, s, _, d in notes:
        onset[b][s] += 1
        for k in range(d):
            bb, ss = b + (s + k) // 16, (s + k) % 16
            held[bb].add(ss)
    return onset, held


def is_44(mid):
    for tr in mid.tracks:
        for msg in tr:
            if msg.type == "time_signature" and (msg.numerator, msg.denominator) != (4, 4):
                return False
    return True


def songs(limit):
    """Yield (name, {role: notes}) for full-band 4/4 arrangements, streamed."""
    used = 0
    with tarfile.open(TAR, "r|gz") as tf:
        for member in tf:
            if used >= limit:
                return
            if not member.isfile() or not member.name.lower().endswith((".mid", ".midi")):
                continue
            try:
                mid = mido.MidiFile(file=io.BytesIO(tf.extractfile(member).read()))
            except Exception:
                continue
            if mid.type == 2 or not is_44(mid):
                continue
            roles = classify(mid)
            # a BAND: needs at least bass + one pitched part above it
            if "bass" not in roles or not ({"lead", "chords"} & set(roles)):
                continue
            used += 1
            yield member.name, roles


GRID = "0.2.4.6.8.a.c.e."


def print_grid(name, roles, nbars=16, start=None):
    """Print the actual notes, bar by bar, all parts stacked. This is the point."""
    order = [r for r in ("lead", "counter", "chords", "bass", "drums") if r in roles]
    bars = sorted({b for r in order for b, _, _, _ in roles[r]})
    if not bars:
        return
    # start a third of the way in -- the top of a MIDI file is often an empty intro
    lo = start if start is not None else bars[len(bars) // 3]
    print(f"\n=== {name}")
    print("      " + "".join(f"{c}" for c in GRID) + "   parts sounding / onsets")
    for b in range(lo, lo + nbars):
        rows = []
        tot = 0
        live = 0
        for r in order:
            cells = ["."] * 16
            hits = [(s, p) for bb, s, p, _ in roles[r] if bb == b for _ in (0,)]
            n = 0
            for bb, s, p, d in roles[r]:
                if bb != b:
                    continue
                n += 1
                cells[s % 16] = "#" if cells[s % 16] != "." else (
                    "x" if r == "drums" else NOTE[p % 12][0])
            if n:
                live += 1
                tot += n
            rows.append((r, "".join(cells), n))
        print(f"  bar {b}")
        for r, line, n in rows:
            print(f"  {r:<8}{line}  {n if n else '-'}")
        print(f"  {'':8}{'':16}  = {tot} onsets across {live} parts")


NOTE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]


def main():
    if "--print" in sys.argv:
        n = int(sys.argv[sys.argv.index("--print") + 1]) if len(sys.argv) > sys.argv.index("--print") + 1 else 3
        for name, roles in songs(n):
            print_grid(name, roles, nbars=8)
        return

    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 400
    agg = collections.defaultdict(list)
    role_share = collections.Counter()
    role_present = collections.Counter()
    pairs = collections.defaultdict(lambda: [0, 0])
    hist = collections.defaultdict(collections.Counter)
    corr = []
    nsongs = 0

    for name, roles in songs(limit):
        nsongs += 1
        onsets = {r: sounding(v)[0] for r, v in roles.items()}
        allbars = sorted({b for o in onsets.values() for b in o})
        if len(allbars) < 16:
            continue
        # trim the top and tail: intros/outros are not the arrangement
        lo, hi = allbars[len(allbars) // 6], allbars[-len(allbars) // 6]
        bars = [b for b in allbars if lo <= b <= hi]
        if len(bars) < 12:
            continue

        for r in roles:
            role_present[r] += 1
            role_share[r] += sum(sum(onsets[r][b].values()) for b in bars)
            for b in bars:
                for s, n in onsets[r][b].items():
                    hist[r][s] += n

        # 1. how many onsets does the WHOLE BAND put in one bar
        tot = [sum(sum(onsets[r][b].values()) for r in onsets) for b in bars]
        agg["band_per_bar"].append(st.median(tot))
        pitched = [r for r in onsets if r != "drums"]
        totp = [sum(sum(onsets[r][b].values()) for r in pitched) for b in bars]
        agg["pitched_per_bar"].append(st.median(totp))

        # 2. how many parts are actually PLAYING in a bar, of those in the song
        live = [sum(1 for r in onsets if onsets[r][b]) for b in bars]
        agg["parts_live"].append(st.median(live))
        agg["parts_total"].append(len(roles))
        agg["parts_live_frac"].append(st.median(live) / len(roles))

        # 3. does anybody ever shut up? per part, share of bars with NO onset
        for r in onsets:
            rest = sum(1 for b in bars if not onsets[r][b]) / len(bars)
            agg["rest:" + r].append(rest)
            # longest silence, in bars
            run = best = 0
            for b in bars:
                run = run + 1 if not onsets[r][b] else 0
                best = max(best, run)
            agg["restrun:" + r].append(best)

        # 4. do two parts land on the same sixteenth, or take turns?
        for a in pitched:
            for c in pitched:
                if a >= c:
                    continue
                hit = share = 0
                for b in bars:
                    sa, sc = set(onsets[a][b]), set(onsets[c][b])
                    if not sa or not sc:
                        continue
                    hit += len(sa)
                    share += len(sa & sc)
                if hit:
                    pairs[(a, c)][0] += share
                    pairs[(a, c)][1] += hit

        # 5. when the tune is busy, is the comp quiet? (per-bar correlation)
        if "lead" in onsets and "chords" in onsets:
            x = [sum(onsets["lead"][b].values()) for b in bars]
            y = [sum(onsets["chords"][b].values()) for b in bars]
            if st.pstdev(x) > 0 and st.pstdev(y) > 0:
                mx, my = st.mean(x), st.mean(y)
                num = sum((a - mx) * (c - my) for a, c in zip(x, y))
                den = (sum((a - mx) ** 2 for a in x) * sum((c - my) ** 2 for c in y)) ** .5
                corr.append(num / den)

        # 6. the chord part: how many notes in one stab, and how long do they last
        if "chords" in roles:
            agg["chord_stack"].append(polyphony(roles["chords"]))
            agg["chord_dur"].append(st.median(d for _, _, _, d in roles["chords"]))
        if "lead" in roles:
            agg["lead_dur"].append(st.median(d for _, _, _, d in roles["lead"]))
        if "bass" in roles:
            agg["bass_dur"].append(st.median(d for _, _, _, d in roles["bass"]))

    def q(k, f):
        a = sorted(agg[k])
        return a[int(f * (len(a) - 1))] if a else float("nan")

    def med(k):
        return st.median(agg[k]) if agg[k] else float("nan")

    print(f"Lakh Clean MIDI: {nsongs} full-band 4/4 arrangements\n")

    print("HOW MUCH IS GOING ON AT ONCE (per bar, median across songs)")
    print(f"  onsets from the whole band      5th {q('band_per_bar',.05):5.1f}"
          f"   median {med('band_per_bar'):5.1f}   95th {q('band_per_bar',.95):5.1f}")
    print(f"  onsets from the PITCHED parts   5th {q('pitched_per_bar',.05):5.1f}"
          f"   median {med('pitched_per_bar'):5.1f}   95th {q('pitched_per_bar',.95):5.1f}")
    print(f"  parts in the arrangement        median {med('parts_total'):.1f}")
    print(f"  parts PLAYING in a given bar    median {med('parts_live'):.1f}"
          f"   ({100*med('parts_live_frac'):.0f}% of the ones that exist)")

    print("\nDOES ANYBODY SHUT UP (share of bars with no onset at all)")
    for r in ("lead", "counter", "chords", "bass", "drums"):
        if agg.get("rest:" + r):
            print(f"  {r:<8} rests in {100*med('rest:'+r):4.0f}% of bars"
                  f"   longest silence {med('restrun:'+r):.0f} bars"
                  f"   (present in {role_present[r]} songs)")

    print("\nSHARE OF ALL ONSETS, by role")
    tot = sum(role_share.values())
    for r, v in role_share.most_common():
        print(f"  {r:<8} {100*v/tot:5.1f}%")

    print("\nDO TWO PARTS LAND TOGETHER OR TAKE TURNS")
    print("  (share of the first part's onsets that fall on a sixteenth the other also hits)")
    for (a, c), (s, h) in sorted(pairs.items(), key=lambda kv: -kv[1][1]):
        if h > 500:
            print(f"  {a:<8} vs {c:<8} {100*s/h:5.1f}%")

    if corr:
        print(f"\nWHEN THE TUNE IS BUSY, THE COMP IS: correlation {st.mean(corr):+.3f}"
              f"   (median {st.median(corr):+.3f}, n={len(corr)})")
        neg = sum(1 for c in corr if c < 0)
        print(f"  {100*neg/len(corr):.0f}% of songs have a NEGATIVE lead/chord density correlation")

    print("\nWHERE EACH PART LANDS (share of that part's onsets, by 16th)")
    print("        " + "".join(f"{i:>5}" for i in range(16)))
    for r in ("lead", "counter", "chords", "bass", "drums"):
        c = hist.get(r)
        if not c:
            continue
        t = sum(c.values())
        print(f"  {r:<7}" + "".join(f"{100*c[s]/t:5.1f}" for s in range(16)))

    print("\nWHAT EACH PART'S NOTES LOOK LIKE")
    print(f"  chord part stacks               median {med('chord_stack'):.2f} notes per strike")
    for r in ("chord", "lead", "bass"):
        k = r + "_dur"
        if agg.get(k):
            print(f"  {r:<8} note length (16ths)     median {med(k):.0f}")


if __name__ == "__main__":
    main()
