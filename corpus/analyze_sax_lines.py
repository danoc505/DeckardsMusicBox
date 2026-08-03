#!/usr/bin/env python3
"""WHAT SAX PLAYERS ACTUALLY PLAY — measured from the Weimar Jazz Database.

    python3 corpus/analyze_sax_lines.py

Downloads wjazzd.db (like ingest_wjazz_solos.py; cached in /tmp; never
committed) and measures, over every SAXOPHONE solo (as/ts/ss/bs/cbs), the
facts the sax engine needs and the user asked for by pointing at sheet
music ("study the sheet music of sax songs to see how it works"):

  1. LONG NOTES vs THE CHORD. Of notes >= 1 beat / >= 2 beats: what share
     is a chord tone (1-3-5-7 of the sounding chord), a tension (9/11/13),
     or foreign? This decides what the engine may LEAN INTO: swelling a
     foreign note is what "notes out of key" complaints are made of.
  2. PHRASES AND BREATHS. Notes per phrase, phrase seconds, and the GAP
     between phrases, from the database's own phrase segmentation.
  3. Interval distribution of the lines themselves.

The database's own beats table carries the sounding chord per beat.
Nothing from the solos is stored or reproduced; these are statistics.
"""
import math, os, re, sqlite3, sys, tempfile, urllib.request

DB = os.path.join(tempfile.gettempdir(), "wjazzd.db")
URL = "https://jazzomat.hfm-weimar.de/download/downloads/wjazzd.db"

if not os.path.exists(DB):
    print("downloading wjazzd.db ...", file=sys.stderr)
    urllib.request.urlretrieve(URL, DB)

con = sqlite3.connect(DB)
cur = con.cursor()

SAX = ("as", "ts", "ss", "bs", "cbs", "as-c", "ts-c")
melids = [r[0] for r in cur.execute(
    "SELECT melid FROM solo_info WHERE instrument IN (%s)" %
    ",".join("?" * len(SAX)), SAX)]
print(f"sax solos: {len(melids)}")

PC = {"C":0,"D":2,"E":4,"F":5,"G":7,"A":9,"B":11}
def chord_pcs(sym):
    """chord symbol -> (set of chord-tone pcs, set of tension pcs) or None"""
    if not sym or sym in ("NC", ""): return None
    m = re.match(r"([A-G])([#b]*)", sym)
    if not m: return None
    root = PC[m.group(1)]
    for ch in m.group(2): root += 1 if ch == "#" else -1
    root %= 12
    rest = sym[m.end():]
    minor = rest.startswith("-") or rest.startswith("min")
    third = root + (3 if minor else 4)
    fifth = root + (6 if "b5" in rest or "o" in rest else 8 if "+" in rest or "#5" in rest else 7)
    tones = {root % 12, third % 12, fifth % 12}
    if "j7" in rest or "maj7" in rest: tones.add((root + 11) % 12)
    elif "7" in rest: tones.add((root + 10) % 12)
    elif "6" in rest: tones.add((root + 9) % 12)
    if "o" in rest and "7" in rest: tones = {root%12,(root+3)%12,(root+6)%12,(root+9)%12}
    tens = {(root + 2) % 12, (root + 5) % 12, (root + 9) % 12}   # 9, 11, 13
    return tones, tens - tones

long1 = {"ct": 0.0, "tens": 0.0, "out": 0.0}
long2 = {"ct": 0.0, "tens": 0.0, "out": 0.0}
allw  = {"ct": 0.0, "tens": 0.0, "out": 0.0}
phr_notes, phr_secs, gaps, intervals = [], [], [], []

for melid in melids:
    avgtempo = cur.execute("SELECT avgtempo FROM solo_info WHERE melid=?", (melid,)).fetchone()[0]
    beat_sec = 60.0 / (avgtempo or 120)
    # the sounding chord per beat-onset, forward-filled
    beats = cur.execute("SELECT onset, chord FROM beats WHERE melid=? ORDER BY onset", (melid,)).fetchall()
    changes = []
    cursym = None
    for on, chd in beats:
        if chd and chd != cursym:
            cursym = chd
            changes.append((on, chord_pcs(chd)))
    def chord_at(t):
        lo, hi, best = 0, len(changes) - 1, None
        while lo <= hi:
            mid = (lo + hi) // 2
            if changes[mid][0] <= t: best = changes[mid][1]; lo = mid + 1
            else: hi = mid - 1
        return best
    notes = cur.execute("SELECT onset, duration, pitch FROM melody WHERE melid=? ORDER BY onset", (melid,)).fetchall()
    prev = None
    for on, du, pit in notes:
        ch = chord_at(on)
        if ch:
            pc = int(round(pit)) % 12
            cls = "ct" if pc in ch[0] else "tens" if pc in ch[1] else "out"
            allw[cls] += du
            if du >= beat_sec: long1[cls] += du
            if du >= 2 * beat_sec: long2[cls] += du
        if prev is not None: intervals.append(int(round(pit)) - prev)
        prev = int(round(pit))
    # phrases from the db's own segmentation
    for (start, end) in cur.execute(
        "SELECT start, end FROM sections WHERE melid=? AND type='PHRASE'", (melid,)):
        seg = [n for n in notes[start:end + 1]]
        if not seg: continue
        phr_notes.append(len(seg))
        phr_secs.append(seg[-1][0] + seg[-1][1] - seg[0][0])
    # breath gaps between consecutive phrases
    ph = list(cur.execute("SELECT start, end FROM sections WHERE melid=? AND type='PHRASE' ORDER BY start", (melid,)))
    for i in range(1, len(ph)):
        a = notes[ph[i-1][1]] if ph[i-1][1] < len(notes) else None
        b = notes[ph[i][0]] if ph[i][0] < len(notes) else None
        if a and b:
            g = b[0] - (a[0] + a[1])
            if 0 < g < 30: gaps.append(g)

def share(d):
    s = sum(d.values()) or 1
    return " · ".join(f"{k} {100*v/s:.1f}%" for k, v in d.items())
def q(a, f):
    a = sorted(a); return a[int(f * (len(a) - 1))] if a else 0

print(f"duration-weighted, ALL notes:      {share(allw)}")
print(f"duration-weighted, notes >=1 beat: {share(long1)}")
print(f"duration-weighted, notes >=2 beats:{share(long2)}")
print(f"phrases: {len(phr_notes)} · notes/phrase q25 {q(phr_notes,.25)} median {q(phr_notes,.5)} q75 {q(phr_notes,.75)}")
print(f"phrase seconds: q25 {q(phr_secs,.25):.2f} median {q(phr_secs,.5):.2f} q75 {q(phr_secs,.75):.2f}")
print(f"breath gaps s: q25 {q(gaps,.25):.2f} median {q(gaps,.5):.2f} q75 {q(gaps,.75):.2f}")
iv = [abs(i) for i in intervals]
print(f"intervals: steps(<=2) {100*sum(1 for i in iv if i<=2)/len(iv):.1f}% · leaps(>=5) {100*sum(1 for i in iv if i>=5)/len(iv):.1f}%")
