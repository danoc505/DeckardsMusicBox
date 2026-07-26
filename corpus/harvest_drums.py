#!/usr/bin/env python3
"""Harvest what REAL DRUMMERS do, from the Groove MIDI Dataset.

    https://magenta.tensorflow.org/datasets/groove   (Google Magenta, CC BY 4.0)
    13.6 hours of human drumming on an electronic kit, captured WITH velocity and
    WITH microtiming -- 1,150 files, each tagged with a genre and a style.

Why this exists: the drum engine is the last one still built entirely on assertion.
`FEELS` is a table of hand-written probabilities (ghost 0.3 / 0.7, swing 0.08 / 0.55,
hat every 2 steps), the phrase scheme "ABACAAD" and the fill in slot D came from one
transcript, and every velocity in the kit is a literal. None of it has ever been
compared to a drummer. This measures the same quantities off real performances:

  * where a FILL actually falls in an 8-bar phrase, and how it differs from a groove bar
  * how loud a ghost note is relative to a backbeat, and how many there are
  * the accent pattern across the bar -- which sixteenths are loud and which are not
  * MICROTIMING: how far off the grid a real hit sits, per lane and per genre
  * the kick and snare onset histograms the FEELS table is guessing at

    python3 corpus/harvest_drums.py [genre]
"""
import collections
import csv
import io
import os
import statistics as st
import sys
import zipfile

import mido

ZIP = os.path.join(os.path.dirname(__file__), ".groove", "groove.zip")

# Roland TD-11 mapping, collapsed to the lanes the engine actually writes
LANE = {}
for p in (36,): LANE[p] = "kick"
for p in (38, 40, 37): LANE[p] = "snare"
for p in (42, 22, 44): LANE[p] = "hat"
for p in (46, 26): LANE[p] = "openhat"
for p in (48, 50, 45, 47, 43, 58): LANE[p] = "tom"
for p in (49, 55, 51, 52, 53, 59, 57): LANE[p] = "cymbal"


def main():
    want = sys.argv[1] if len(sys.argv) > 1 else None
    z = zipfile.ZipFile(ZIP)
    info = list(csv.DictReader(io.TextIOWrapper(z.open("groove/info.csv"))))
    by_id = {r["midi_filename"]: r for r in info}

    vel = collections.defaultdict(list)
    step_vel = collections.defaultdict(list)          # accent by 16th position
    lane_step_vel = collections.defaultdict(list)     # ...and per lane, which is where
                                                      # ghost notes actually live
    onsets = collections.defaultdict(collections.Counter)
    micro = collections.defaultdict(list)
    per_bar_hits, fill_bar_hits = [], []
    fill_tom_share, groove_tom_share = [0, 0], [0, 0]
    beat_bars = fill_bars = 0
    files = 0

    for name in z.namelist():
        if not name.endswith(".mid"):
            continue
        row = by_id.get(name[len("groove/"):]) or by_id.get(name)
        if row is None:
            continue
        if want and row.get("style", "").split("/")[0] != want:
            continue
        is_fill = row.get("beat_type") == "fill"
        try:
            mid = mido.MidiFile(file=io.BytesIO(z.read(name)))
        except Exception:
            continue
        tpb = mid.ticks_per_beat
        tempo = 5e5
        t = 0
        hits = []
        for msg in mido.merge_tracks(mid.tracks):
            t += msg.time
            if msg.type == "set_tempo":
                tempo = msg.tempo
            elif msg.type == "note_on" and msg.velocity > 0:
                lane = LANE.get(msg.note)
                if lane:
                    hits.append((t / tpb, lane, msg.velocity))   # position in BEATS
        if not hits:
            continue
        files += 1
        bars = collections.defaultdict(list)
        for beat, lane, v in hits:
            vel[lane].append(v)
            b = int(beat // 4)
            pos = beat - b * 4
            step = round(pos * 4)                    # nearest 16th
            dev = pos * 4 - step                     # microtiming, in 16ths
            step %= 16                               # a hit rounding up to 16 is the
                                                     # NEXT bar's downbeat, not this
                                                     # bar's last sixteenth -- clamping
                                                     # it there put 16% of all kicks on
                                                     # step 15, which is nothing a
                                                     # drummer does
            onsets[lane][step] += 1
            step_vel[step].append(v)
            lane_step_vel[(lane, step)].append(v)
            if abs(dev) < 0.5:
                micro[lane].append(dev)
            bars[b].append(lane)
        for b, lanes in bars.items():
            if is_fill:
                fill_bars += 1
                fill_bar_hits.append(len(lanes))
                fill_tom_share[1] += len(lanes)
                fill_tom_share[0] += sum(1 for x in lanes if x == "tom")
            else:
                beat_bars += 1
                per_bar_hits.append(len(lanes))
                groove_tom_share[1] += len(lanes)
                groove_tom_share[0] += sum(1 for x in lanes if x == "tom")

    tag = f" [{want}]" if want else ""
    print(f"Groove MIDI{tag}: {files} performances, "
          f"{beat_bars} groove bars, {fill_bars} fill bars\n")

    # NB: `beat_type` labels a whole PERFORMANCE, not a bar -- a "fill" file is a take
    # of fills, not one fill inside a groove -- so hits-per-bar is not a fill/groove
    # comparison and is reported for scale only. The tom share IS comparable.
    print("HITS PER BAR      groove %.1f    fill-take %.1f" % (
        st.mean(per_bar_hits), st.mean(fill_bar_hits)))
    print("TOMS              groove %.1f%% of hits    fill %.1f%% of hits" % (
        100 * groove_tom_share[0] / max(1, groove_tom_share[1]),
        100 * fill_tom_share[0] / max(1, fill_tom_share[1])))

    print("\nVELOCITY (0-127), by lane:")
    for lane in ("kick", "snare", "hat", "openhat", "tom", "cymbal"):
        v = vel.get(lane)
        if not v:
            continue
        v = sorted(v)
        q = lambda f: v[int(f * (len(v) - 1))]
        print(f"  {lane:<8} median {st.median(v):5.0f}   "
              f"10th {q(.10):3.0f}  90th {q(.90):3.0f}   n={len(v)}")
    snare = sorted(vel.get("snare", []))
    if snare:
        ghost = sum(1 for x in snare if x < st.median(snare) * 0.6)
        print(f"  GHOST NOTES: {100*ghost/len(snare):.0f}% of snare hits are under "
              f"60% of the median backbeat")

    print("\nACCENT ACROSS THE BAR (median velocity by 16th):")
    row = "".join(f"{st.median(step_vel[s]):5.0f}" if step_vel.get(s) else "    -"
                  for s in range(16))
    print("  " + row)

    print("\nACCENT PER LANE (median velocity by 16th) -- a global template cannot carry")
    print("the snare's ghost pattern, which is where a groove's feel actually is:")
    for lane in ("kick", "snare", "hat", "openhat", "tom", "cymbal"):
        cells = []
        for s2 in range(16):
            v = lane_step_vel.get((lane, s2))
            cells.append(f"{st.median(v):5.0f}" if v and len(v) >= 30 else "    -")
        print(f"  {lane:<8} " + "".join(cells))

    print("\nWHERE EACH LANE LANDS (share of that lane's hits, by 16th):")
    for lane in ("kick", "snare", "hat"):
        c = onsets.get(lane)
        if not c:
            continue
        tot = sum(c.values())
        print(f"  {lane:<7} " + "".join(f"{100*c[s]/tot:5.1f}" for s in range(16)))

    print("\nMICROTIMING (mean offset from the grid, in 16ths; + is late):")
    for lane in ("kick", "snare", "hat"):
        m = micro.get(lane)
        if m:
            print(f"  {lane:<7} {st.mean(m):+.3f}   spread(sd) {st.pstdev(m):.3f}   n={len(m)}")


if __name__ == "__main__":
    main()
