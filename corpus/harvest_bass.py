#!/usr/bin/env python3
"""Harvest what a BASS GUITAR actually plays, from the Lakh MIDI Dataset.

    https://colinraffel.com/projects/lmd/   (Clean MIDI subset, 17,256 files)

Why this exists. Four corpora have been measured here already and not one of them
contains a bass:

    harvest_structure.py     (Harmonix)    -> where sections go
    harvest_melody.py        (Hooktheory)  -> the tune, per section function
    harvest_drums.py         (Groove MIDI) -> the kit, per lane and per sixteenth
    harvest_accompaniment.py (POP909)      -> the comping ... on a PIANO

POP909 is a piano arrangement, so its "bass" is a pianist's left hand -- it plays
arpeggios and passing figures a bass guitar never would, and the numbers it gave
(8 onsets a bar, 53% of its notes foreign to the chord above) are not a bass. Lakh's
Clean MIDI subset is full-band arrangements with General MIDI program numbers, so the
bass can be identified as what it is: GM programs 32-39 are the bass family.

Our bass plays 4 distinct bar-rhythms in a whole song with one pattern covering 55%
of its bars. Whether that is wrong has never been checked against a real bass.

    python3 corpus/harvest_bass.py [n_files]
"""
import collections
import io
import os
import statistics as st
import sys
import tarfile
import urllib.request

import mido            # pip install mido

CACHE = os.path.join(os.path.dirname(__file__), ".lakh")
TAR = os.path.join(CACHE, "clean_midi.tar.gz")
URL = "http://hog.ee.columbia.edu/craffel/lmd/clean_midi.tar.gz"

BASS_PROGRAMS = set(range(32, 40))      # GM: acoustic/electric/fretless/slap/synth bass


def fetch():
    """~234 MB. Not ours to redistribute; downloaded on first run."""
    if os.path.exists(TAR):
        return
    os.makedirs(CACHE, exist_ok=True)
    sys.stderr.write(f"downloading clean_midi.tar.gz (~234 MB) -> {TAR}\n")
    urllib.request.urlretrieve(URL, TAR)


def bass_track(mid):
    """The track whose channel is set to a GM bass program, with the most notes."""
    best, best_n = None, 0
    for tr in mid.tracks:
        prog, notes = None, 0
        for msg in tr:
            if msg.type == "program_change":
                prog = msg.program
            elif msg.type == "note_on" and msg.velocity > 0:
                notes += 1
        if prog in BASS_PROGRAMS and notes > best_n:
            best, best_n = tr, notes
    return best


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 600
    fetch()

    distinct, top_share, per_bar, same_end, pitch = [], [], [], [], []
    durs, same = [], [0, 0]
    onset = collections.Counter()
    used = scanned = 0

    # streamed: the tarball is read once, member by member, and nothing is written to
    # disk -- extracting 17,256 files to measure a few hundred is not worth the space
    with tarfile.open(TAR, "r|gz") as tf:
        for member in tf:
            if used >= limit:
                break
            if not member.isfile() or not member.name.lower().endswith((".mid", ".midi")):
                continue
            scanned += 1
            try:
                data = tf.extractfile(member).read()
                mid = mido.MidiFile(file=io.BytesIO(data))
            except Exception:
                continue
            if mid.type == 2:
                continue
            tr = bass_track(mid)
            if tr is None:
                continue
            tpb = mid.ticks_per_beat or 480
            t, notes = 0, []
            for msg in tr:
                t += msg.time
                if msg.type == "note_on" and msg.velocity > 0:
                    beat = t / tpb
                    b = int(beat // 4)
                    step = int(round((beat - b * 4) * 4))
                    if step >= 16:
                        b, step = b + 1, 0
                    notes.append((b, step, msg.note))
            if len(notes) < 60:
                continue
            # a bass sits low; if this track does not, the program number was lying
            med = st.median(n[2] for n in notes)
            if not (28 <= med <= 55):
                continue
            used += 1

            seq = sorted(notes, key=lambda x: (x[0], x[1]))
            for i2 in range(len(seq)-1):
                gap = (seq[i2+1][0]-seq[i2][0])*16 + (seq[i2+1][1]-seq[i2][1])
                if 0 < gap <= 16:
                    durs.append(gap)          # gap to the next onset, in sixteenths
            by = collections.defaultdict(set)
            for b, s, _ in notes:
                by[b].add(s)
            pats = {b: ",".join(str(x) for x in sorted(v)) for b, v in by.items()}
            c = collections.Counter(pats.values())
            nbars = len(pats)
            distinct.append(len(c))
            top_share.append(c.most_common(1)[0][1] / nbars)
            per_bar.append(len(notes) / nbars)
            ks = sorted(pats)
            third = max(1, len(ks) // 3)
            a = collections.Counter(pats[k] for k in ks[:third]).most_common(1)[0][0]
            z = collections.Counter(pats[k] for k in ks[-third:]).most_common(1)[0][0]
            same_end.append(1.0 if a == z else 0.0)
            pitch += [n[2] for n in notes]
            for i2 in range(1, len(notes)):
                same[1] += 1
                if notes[i2][2] == notes[i2-1][2]:
                    same[0] += 1
            for _, s, _ in notes:
                onset[s] += 1

    def q(a, f):
        a = sorted(a)
        return a[int(f * (len(a) - 1))]

    print(f"Lakh Clean MIDI: {used} bass tracks found in {scanned} files scanned\n")
    print(f"  distinct bar-rhythms in a whole song   median {st.median(distinct):.0f}")
    print(f"  the commonest one covers               median {st.median(top_share):.2f}")
    print(f"  onsets per bar                         median {st.median(per_bar):.2f}")
    print(f"  first third and last third match       {st.mean(same_end):.2f}")
    print(f"  pitch: 5th {q(pitch,.05):.0f}  median {st.median(pitch):.0f}  95th {q(pitch,.95):.0f}")
    tot = sum(onset.values())
    print(f"  onsets per bar SPREAD across songs: 5th {q(per_bar,.05):.2f}"
          f"   median {st.median(per_bar):.2f}   95th {q(per_bar,.95):.2f}"
          f"   spread {q(per_bar,.95)-q(per_bar,.05):.2f}")
    print(f"  note length (16ths): median {st.median(durs):.0f}   95th {q(durs,.95):.0f}")
    print(f"  the next note is the SAME pitch: {100*same[0]/max(1,same[1]):.0f}%")
    print("\n  WHERE THE BASS LANDS, by sixteenth:")
    print("   " + "".join(f"{100*onset[s]/tot:5.1f}" for s in range(16)))


if __name__ == "__main__":
    main()
